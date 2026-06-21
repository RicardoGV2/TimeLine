# AGENTS.md

## Cursor Cloud specific instructions

TimeLine is a **pure static client-side web app** (HTML + ES module JS + CSS in `src/`, JSON data in `data/`). There is **no package manager, no build step, and no dependencies** to install. Deployment is via GitHub Pages (`.github/workflows/pages.yml`).

### Running the app (dev)

The JS uses `fetch()` to load JSON from `data/`, so the app **must be served over HTTP** — opening `index.html` via `file://` will fail (CORS/module errors). Serve the repo root with any static server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. The entrypoint is `index.html`, which loads `src/app-v2.js` (the active app; `src/app.js` and `src/app-v3.js` are older variants kept in the repo).

### Lint / test / build

There are no configured lint, test, or build tooling for this repo. To sanity-check data edits, validate JSON, e.g.:

```bash
python3 -c "import json; json.load(open('data/config.json'))"
```
