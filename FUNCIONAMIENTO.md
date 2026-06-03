# Portfolio Web — Documentación del Proyecto

## Infraestructura construida

| Componente | Detalle |
|---|---|
| **Framework** | Astro v5.13.9 con plantilla Astro Micro |
| **Repositorio** | `github.com/e-saldanaf/e-saldanaf.github.io` |
| **Hosting** | GitHub Pages |
| **CI/CD** | GitHub Actions — deploy automático en cada push a `main` |
| **URL producción** | `https://e-saldanaf.github.io` |
| **URL local** | `http://localhost:4321` |

---

## Estructura del proyecto

```
e-saldanaf.github.io/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD — NO tocar
│
├── public/                     # Assets estáticos (favicon, imágenes)
│
├── src/
│   ├── components/             # Componentes Astro reutilizables
│   ├── content/
│   │   ├── blog/               # Posts en Markdown/MDX
│   │   └── projects/           # Tarjetas de proyectos en Markdown
│   ├── layouts/
│   │   └── Layout.astro        # Layout base de todas las páginas
│   ├── pages/
│   │   ├── index.astro         # Página principal (Home)
│   │   ├── blog/               # Ruta /blog
│   │   └── projects/           # Ruta /projects
│   ├── styles/
│   │   └── global.css          # Estilos globales
│   └── consts.ts               # ⭐ Configuración central (nombre, bio, redes)
│
├── astro.config.mjs            # Configuración de Astro — tocar con cuidado
├── package.json                # Dependencias del proyecto
└── tsconfig.json               # Configuración TypeScript
```

---

## Flujo de trabajo estándar

Cada vez que quieras tocar algo, el flujo es siempre el mismo:

### 1. Arrancar el entorno local

```powershell
# Navegar al proyecto
cd C:\Users\esald\PycharmProjects\esaldana.github.io

# Arrancar servidor de desarrollo
npm run dev
```

Abre `http://localhost:4321` — los cambios se reflejan en tiempo real sin reiniciar.

### 2. Editar lo que necesites

Edita los archivos en VS Code. El navegador se actualiza automáticamente (hot reload).

### 3. Verificar en local

Antes de publicar, confirma que todo se ve bien en `http://localhost:4321`.

### 4. Publicar a producción

```powershell
# Parar el servidor si está corriendo (Ctrl+C), luego:
git add .
git commit -m "tipo: descripción breve del cambio"
git push origin main
```

GitHub Actions construye y despliega automáticamente. En ~1 minuto está en producción.

### 5. Verificar el despliegue

```
github.com/e-saldanaf/e-saldanaf.github.io/actions
```

Tick verde = desplegado. Luego comprueba en `https://e-saldanaf.github.io`.

---

## Convención de commits

| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | Añades algo nuevo (sección, proyecto, post) |
| `fix:` | Corriges algo que no funcionaba |
| `content:` | Cambias solo texto o imágenes |
| `style:` | Cambios de CSS o diseño visual |
| `ci:` | Tocas el workflow de GitHub Actions |
| `chore:` | Tareas de mantenimiento (dependencias, config) |

---

## Archivos que vas a tocar el 90% del tiempo

| Archivo | Para qué |
|---|---|
| `src/consts.ts` | Tu nombre, bio, links a redes |
| `src/content/projects/*.md` | Añadir/editar proyectos |
| `src/content/blog/*.md` | Añadir/editar posts |
| `public/` | Avatar, favicon, imágenes |
| `src/styles/global.css` | Tweaks visuales globales |

---

## Archivos que NO debes tocar sin saber qué haces

| Archivo | Por qué |
|---|---|
| `.github/workflows/deploy.yml` | Romperlo significa perder el deploy automático |
| `astro.config.mjs` | Cambiar `site` rompe todas las URLs en producción |
| `tsconfig.json` | Afecta a la compilación TypeScript de todo el proyecto |
| `package.json` / `package-lock.json` | Nunca editar manualmente — usar `npm install <paquete>` |
