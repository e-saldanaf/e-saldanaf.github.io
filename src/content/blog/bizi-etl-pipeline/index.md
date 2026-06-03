---
title: "Building a Real-Time ETL Pipeline in Python: Zaragoza Bike Stations"
description: "A step-by-step guide to building a Python ETL pipeline that ingests real-time public bike station data from an Open Data API and loads it into PostgreSQL using an upsert strategy."
date: 2025-05-20
---

Every city generates data. Most of it is publicly available, underused, and perfect for practising real data engineering patterns.

In this post I'll walk you through how I built a Python ETL pipeline that ingests real-time data from the **Open Data API of Zaragoza City Council**, processes the state of all Bizi (public bike sharing) stations, and loads them into a PostgreSQL database — using a production-grade upsert strategy.

The full source code is available on [GitHub](https://github.com/e-saldanaf/mobility-zgz).

---

## What we're building

```
Zaragoza Open Data API
        │
        ▼
   [ Extract ]  ── fetch JSON snapshot of all Bizi stations
        │
        ▼
  [ Transform ] ── clean, normalize, add audit columns
        │
        ▼
    [ Load ]    ── upsert into PostgreSQL (insert or update)
```

Each phase lives in its own Python class, making the pipeline modular and independently testable.

---

## The data source

Zaragoza's Open Data Portal exposes a REST endpoint that returns the current state of all Bizi stations as JSON:

```
https://www.zaragoza.es/sede/portal/datos-abiertos/servicio/...?rf=json&start=0&rows=1000
```

Each station record contains:
- `id` — unique station identifier
- `title` — station name
- `bicisDisponibles` — available bikes
- `anclajesDisponibles` — available docks
- `geometry.coordinates` — `[lon, lat]`
- `lastUpdated` — timestamp of last API update

---

## Phase 1 — Extract

The extractor is responsible for one thing only: **get the raw data from the API and return it as a list**.

```python
import requests
import logging

class BiziExtractor:
    def __init__(self, api_url: str):
        self.api_url = api_url if "?" in api_url else f"{api_url}?rf=json&start=0&rows=1000"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
        }

    def fetch_data(self) -> list:
        try:
            response = requests.get(self.api_url, headers=self.headers, timeout=20)
            response.raise_for_status()

            # Fallback: some Zaragoza API nodes return empty body over HTTPS
            if not response.text.strip():
                alt_url = self.api_url.replace("https://", "http://")
                response = requests.get(alt_url, headers=self.headers, timeout=20)

            data = response.json()

            # The API wraps results in a 'result' key
            if isinstance(data, dict):
                return data.get("result", [])
            elif isinstance(data, list):
                return data

            return []

        except Exception as e:
            logging.error(f"Extraction failed: {e}")
            raise
```

A few things worth noting:

**Custom User-Agent header** — the Zaragoza API occasionally blocks requests that look like automated scripts. Using a browser-style User-Agent avoids this.

**HTTP fallback** — some of the API's infrastructure nodes return an empty body over HTTPS. Rather than failing silently, the extractor retries with HTTP. Not ideal, but pragmatic.

**Flexible response parsing** — the API can return either a plain list or a dict with a `result` key depending on the endpoint. Handling both makes the extractor resilient.

---

## Phase 2 — Transform

The transformer takes the raw list and returns a clean, typed Pandas DataFrame ready to be loaded.

```python
import pandas as pd
import logging
from datetime import datetime, timezone

class BiziTransformer:
    @staticmethod
    def clean_data(raw_data: list) -> pd.DataFrame:
        if not raw_data:
            return pd.DataFrame()

        rows = []
        for item in raw_data:
            rows.append({
                'id':             item.get('id'),
                'title':          item.get('title'),
                'bikes':          item.get('bicisDisponibles'),
                'slots':          item.get('anclajesDisponibles'),
                'api_updated_at': item.get('lastUpdated', ''),
                'lon':            item.get('geometry', {}).get('coordinates', [0, 0])[0],
                'lat':            item.get('geometry', {}).get('coordinates', [0, 0])[1],
            })

        df = pd.DataFrame(rows)

        # Type casting
        df['id']             = pd.to_numeric(df['id']).astype(int)
        df['bikes']          = pd.to_numeric(df['bikes']).fillna(0).astype(int)
        df['slots']          = pd.to_numeric(df['slots']).fillna(0).astype(int)
        df['api_updated_at'] = pd.to_datetime(df['api_updated_at'], errors='coerce')
        df['lon']            = pd.to_numeric(df['lon'])
        df['lat']            = pd.to_numeric(df['lat'])

        # Audit columns
        now = datetime.now(timezone.utc)
        df['created_at']  = now
        df['modified_at'] = now
        df['action']      = 'UPSERT'

        return df
```

Key decisions here:

**Field access by name, not position** — the API response is a dict, so we extract fields by key. Accessing by index would break silently if the API ever adds or reorders fields.

**`fillna(0)` on numeric columns** — stations under maintenance return `null` for bikes and slots. Replacing with `0` keeps the schema clean without losing the row.

**Audit columns** — `created_at`, `modified_at` and `action` are added during transformation, not in the database. This makes the pipeline's behaviour explicit and traceable from the data itself.

---

## Phase 3 — Load

The loader performs an **upsert**: if a station already exists in the database, update it. If it's new, insert it. This makes the pipeline safe to run repeatedly on a schedule.

```python
from sqlalchemy import create_engine, text
import pandas as pd
import logging

class BiziLoader:
    def __init__(self, connection_uri: str):
        self.engine = create_engine(connection_uri)

    def upsert_data(self, df: pd.DataFrame, table_name: str):
        if df.empty:
            return

        with self.engine.begin() as connection:
            # Step 1: load into a temporary table
            connection.execute(text(
                f"CREATE TEMP TABLE temp_{table_name} (LIKE {table_name})"
            ))
            df.to_sql(f"temp_{table_name}", con=connection, if_exists="append", index=False)

            # Step 2: upsert from temp into target
            connection.execute(text(f"""
                INSERT INTO {table_name}
                    (id, title, bikes, slots, lat, lon, api_updated_at, created_at, modified_at, action)
                SELECT
                    id, title, bikes, slots, lat, lon, api_updated_at, created_at, modified_at, 'INSERT'
                FROM temp_{table_name}
                ON CONFLICT (id) DO UPDATE SET
                    bikes          = EXCLUDED.bikes,
                    slots          = EXCLUDED.slots,
                    api_updated_at = EXCLUDED.api_updated_at,
                    modified_at    = EXCLUDED.modified_at,
                    action         = 'UPDATE';
            """))

            logging.info(f"Loaded {len(df)} rows into {table_name}.")
```

The upsert pattern uses a **temp table as a staging area**:

1. Load the full DataFrame into a temporary table (fast, no conflict checks)
2. Run a single `INSERT ... ON CONFLICT` from the temp table into the target

This is more reliable than trying to upsert row by row, and it keeps the operation atomic — either everything commits or nothing does.

The `action` column gets set to `'INSERT'` or `'UPDATE'` automatically by the SQL, giving you a free audit trail of what happened each run.

---

## Putting it all together

```python
# main.py
import logging
from src.extract import BiziExtractor
from src.transform import BiziTransformer
from src.load import BiziLoader
from dotenv import load_dotenv
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)

API_URL = "https://www.zaragoza.es/sede/portal/datos-abiertos/servicio/..."
TABLE   = "bizi_stations"

extractor   = BiziExtractor(API_URL)
transformer = BiziTransformer()
loader      = BiziLoader(os.getenv("DATABASE_URL"))

raw_data = extractor.fetch_data()
df       = transformer.clean_data(raw_data)
loader.upsert_data(df, TABLE)
```

Run it manually or schedule it with cron or Apache Airflow.

---

## What I'd improve next

- **Schema validation** — add Pydantic models to validate the API response before transformation
- **Airflow DAG** — wrap the pipeline in a DAG for scheduling, retries and alerting
- **Streamlit dashboard** — visualise station availability on a live map

---

## Takeaways

- **Separate your ETL phases into classes** — it makes each one testable in isolation and easy to swap out
- **Upsert over insert** — always design for idempotency if your pipeline will run on a schedule
- **Add audit columns at transform time** — `created_at`, `modified_at` and `action` are free observability
- **Handle API quirks explicitly** — the HTTP fallback and User-Agent header came from real failures, not theory