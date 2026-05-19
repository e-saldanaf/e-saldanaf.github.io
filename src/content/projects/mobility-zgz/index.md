---
title: "Mobility Zaragoza — Bizi ETL Pipeline"
description: "Real-time ETL pipeline extracting public bike station data from Zaragoza's Open Data API, transforming and loading it into PostgreSQL via upsert."
date: 2025-01-01
repoURL: "https://github.com/e-saldanaf/mobility-zgz"
---

A Python ETL pipeline that ingests real-time data from the **Open Data API of Zaragoza City Council**, processes bike-sharing station statuses (Bizi), and loads them into a PostgreSQL database using an upsert strategy.

## Architecture

The pipeline follows a clean three-phase separation:

- **Extract** (`src/extract.py`) — Connects to the Zaragoza Open Data REST API and retrieves the current JSON snapshot of all Bizi stations.
- **Transform** (`src/transform.py`) — Normalizes and cleans the raw payload: available docks, free bikes, coordinates and station metadata.
- **Load** (`src/load.py`) — Performs an idempotent upsert into the `bizi_stations` table in Supabase (PostgreSQL), ensuring no duplicate records on repeated runs.

## Stack

- **Python 3.x** — core language
- **Pandas** — data transformation and normalization
- **SQLAlchemy / Psycopg** — database connectivity
- **Supabase (PostgreSQL)** — destination data store
- **Requests** — HTTP client for API ingestion

## Key Engineering Decisions

- **Upsert over insert** — guarantees idempotency; safe to run on a schedule without duplicating data.
- **Modular structure** — each ETL phase is isolated in its own module, making the pipeline testable and maintainable independently.
- **Environment-based config** — database credentials managed via `.env` and never hardcoded.

## Data Source

[Open Data Portal — Ayuntamiento de Zaragoza](https://www.zaragoza.es/sede/portal/datos-abiertos/)