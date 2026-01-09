# LifeSim Full — Improvement Plan (What I can help with)

This repo is a static, single-page game (loaded by `index.html`) with a vanilla-JS global architecture (`window.Game`, `window.UI`). After scanning the codebase (notably `js/core.js`, `js/main.js`, `js/save.js`, `js/ui.js`, the tab renderers in `js/tabs/`, and the design docs in `docs/`), here are concrete improvements I can implement.

## Quick wins (low risk)

- **Balance tweaks**: adjust costs/rewards/targets (jobs, school, BTC, property, quests) without breaking saves.
- **Quest/content edits**: add/rename quests, tune quest scaling, improve quest copy and rewards, add new quest types (data-driven).
- **UI polish**: wording, formatting, small layout fixes, clearer tooltips, better progress labels, safer number formatting.
- **Bug fixes**: resolve obvious edge cases (NaN/Infinity guards, negative balances, missing-state defaults).
- **Offline robustness**: make network features (e.g. BTC pricing) degrade gracefully with explicit UI messaging.

## Medium scope (high value)

- **Split `js/ui.js` into modules** (still loaded in order, no bundler required):
  - Extract UI helpers (formatting, templating, DOM utils), per-tab renderers, and large modal builders into smaller files.
  - Keep a thin `ui.js` that wires tabs + shared utilities.
- **Make systems more data-driven**:
  - Move “tuning constants” (wages, course costs, property rates, BTC rig stats, quest defs) into `js/data/*.js` modules.
  - Add a single “balance” table with comments and references to the systems that consume each value.
- **Save/state hardening**:
  - Expand `js/save.js` migrations for any state shape changes (including renames/removed fields).
  - Add a `Game.validateState()` debug helper to catch corrupt saves early and auto-repair safe fields.
- **Performance improvements**:
  - Reduce full-tab re-renders where possible (incremental DOM updates for frequently-updating numbers).
  - Consolidate timers (one scheduler loop) and make UI updates time-sliced to avoid long frames.

## Larger features (gameplay)

- **Guided onboarding**: a short “first day” tutorial using notifications + highlights.
- **More quest variety**: chained quests, milestones, and repeatables across systems (school/jobs/property/BTC/companies).
- **Better feedback loops**: more clear warnings and cause/effect messaging for hunger/energy/health and income/expenses.
- **Prestige loop polish**: clearer prestige breakdown, suggested targets, and post-prestige “starter bonuses” explanation.

## Dev ergonomics (optional)

- **Local-first dependencies**: vendor GSAP/anime locally to remove runtime CDN dependency (optional toggle).
- **Repo cleanup**: remove or relocate obvious artifacts in `tmp/` and `.tmp` files once confirmed unused.
- **Consistency pass**: unify naming conventions, formatting, and numeric display across tabs (money/BTC/time).

## If you tell me priorities

If you pick 1–2 focus areas (e.g. “quests + balance”, or “split UI + performance”), I can implement a staged set of changes with small, testable steps and minimal risk to saves.

