# LifeSim Full Build

Single-page, static browser game. Everything is loaded via `index.html`.

## Project layout

- `index.html` — entry point; loads CSS + scripts in order
- `css/` — styles
  - `css/style.css`
- `js/` — game logic (loaded in `index.html`)
  - `js/vendor/` — third-party libs
  - `js/data/` — prepacked datasets exposed on `window` (no `fetch` needed)
  - `js/tabs/` — UI tab renderers (e.g. `ui_tabs_travel.js`)
- `assets/` — static assets
  - `assets/audio/` — background music tracks (`music1.mp3` … `music12.mp3`)
- `data/` — optional/source data not required at runtime
  - `data/miners.json` — source for `js/data/miners_data.js` (the game uses the JS file)
  - `data/Mines` — placeholder file from earlier builds
- `docs/` — design notes (`docs/FORMULA.MD`, `docs/PLAN.md`)
- `tmp/` — temporary artifacts

## Run

Open `index.html` in a browser.

If your browser blocks local module/script loading from `file://`, run a tiny local server instead:

- `python -m http.server 8000`
- Then open `http://localhost:8000/`

## Notes

- Script order in `index.html` matters (it defines globals like `Game`/`UI`).
- Music file paths are configured in `js/ui.js` (`UI.getMusicTracks()`).
