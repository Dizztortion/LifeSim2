## Overview

This project is a browser-based life simulation game that runs entirely from `index.html` and a set of vanilla JS modules (no build system). The core loop advances in‑game time every second, updates systems (school, jobs, health, property, companies, BTC, PC, travel, shop), and refreshes the UI on a 500ms interval.

Because this environment doesn’t have Node or a browser test harness available, I focused on:
- Scanning all source files for structure and coupling.
- Verifying that everything referenced in `index.html` exists and is wired consistently.
- Inferring how to test and balance the game manually in a browser.
- Identifying obviously non‑runtime files that can be dropped from production builds.

---

## How to Run & Test the Game

- Open `index.html` in a modern desktop browser (Chrome, Edge, Firefox); no server is required.
- Allow network access if you want live BTC pricing: `btc.js` uses `fetch` against CoinGecko, but falls back to simulated drift when real prices are unavailable.
- Use dev tools (Console + Network tabs) while playing to catch errors or performance issues.
- Manual test checklist for a fresh save:
  - Confirm save/load works: refresh the page and see “Save loaded.” from `Game.load` in `save.js`.
  - Let the game idle for a few in‑game days and confirm:
    - Daily handlers run (health warnings, wages, companies, BTC, property, deliveries).
    - Auto‑save ticks every 15s and doesn’t spam errors.
  - Exercise each tab in the sidebar (`overview`, `school`, `jobs`, `companies`, `property`, `healthcare`, `travel`, `btc`, `shop`) and look for:
    - UI updates when state changes (e.g., starting/stopping shifts, buying property, health changes).
    - No stuck states where buttons stop responding or tabs render blank.
  - Run through a “first‑hour” flow:
    - Take an entry‑level job (`Game.Jobs.setJob` / `startShift`).
    - Enroll in a course and verify XP, level ups, and education bar movements.
    - Buy at least one property and tenant, let a few days pass to see rent and maintenance.
    - Unlock at least one company and ensure its contracts/mining/retail loops progress.
    - Acquire a BTC rig or cloud contract, open the PC > Wallet, and ensure sync and BTC earnings work.

---

## Gameplay Improvement Ideas

### 1. Goals and Guidance

- Add a short, guided “first day” tutorial:
  - Highlight the order: pick a job → run a shift → buy a meal → enroll in night classes.
  - Use `Game.addNotification` for step‑by‑step hints and to celebrate milestones (first promotion, first BTC purchase, first property).
- Add optional goals/quest log:
  - Small tasks like “Reach education level 1”, “Buy your first rig”, “Unlock Rail Logistics”.
  - Represent goals as simple JSON data and show them in the Overview tab with checkboxes/progress.
- Surface more context in the UI:
  - Explain the time scale (e.g., “1 real second = 0.5 in‑game minutes”) in the Overview tab so hunger/health changes make intuitive sense.

### 2. Progression & Balance

- Review and document key tuning constants in one place:
  - Wages, school costs, travel costs, property and tax rates (`economy.js`, `property.js`, `jobs.js`, `health.js`, `btc.js`, `companies.js`).
  - Create a high‑level comment block (or a data module) describing desired difficulty curves (e.g., how long to first promotion, typical time to afford first property/rig).
- Smooth out early‑game pacing:
  - Ensure players can realistically pay for at least one course and some meals while holding a basic job.
  - Consider slightly lowering early education costs or raising beginner wages if testing shows stalls.
- Align health, energy, and hunger feedback with gameplay:
  - `Game.Health.tick` already ties hunger and energy to health; add clearer UI warnings (e.g., color shifts, icons) and maybe softer penalties at mid‑range values so players feel the gradient rather than hard failures.
  - Add explicit death/failure conditions and recovery paths (e.g., “If health hits 0, you lose a week of work and hospital fees are auto‑charged”) so players understand the stakes.

### 3. Jobs & Train Driver Mini‑Game

- Expand job variety:
  - More intermediate jobs between barista and office/driver, or career tracks that emphasize different stats (`trainSkill`, `businessSkill`, `techSkill`).
  - Small perks per job (discounted meals while barista, travel discount for train workers, tech skill gain from office IT work).
- Make the `trainDriver` shift feel like a real mini‑game:
  - Connect `Game.state.trainJob` fields (coal, pressure, speed, throttle, coalFeed, safetyStrikes) to UI controls within the Jobs tab.
  - Use gauges or progress bars that map to acceptable ranges, with warnings as players approach unsafe states.
  - Offer performance bonuses based on how long the player stayed within safe bands, beyond current pay efficiency logic in `trainDriverTick`.

### 4. Education & Skills

- Expand course catalog:
  - Additional advanced courses that target specific companies or BTC profitability.
  - Courses that reduce power costs for rigs, improve retail marketing decay, or increase ore unit prices.
- Make education feel more visible:
  - In the School tab and Overview, show XP towards next level as both percentage and raw numbers, and list passive bonuses gained from higher education.

### 5. Property & Companies

- Add property variety and events:
  - More property types with different risk profiles (cheap but unstable tenants, expensive properties with rare but big rent).
  - Random events affecting tenants (rent holidays, maintenance surges, local festivals boosting happiness).
- Deepen company interactions:
  - `railLogistics`: tie contract availability and payouts to train driving performance and reputation.
  - `miningCorp`: add occasional hazard events that trade off safety vs. production.
  - `retailShop`: let players adjust pricing strategy or focus (margin vs. volume) and have that influence the sales schedule generation in `companies.js`.

### 6. BTC & PC Systems

- Improve BTC UX:
  - In the BTC tab, show a clear breakdown: confirmed vs. unconfirmed BTC, current daily rate from rigs, and daily rate from cloud contracts (`dailyBtc` sum).
  - Add a short explanation about simulated vs. real BTC price and what happens offline.
- Make the PC overlay more “app‑like”:
  - Add small task lists in the email app (e.g., offers, news, tutorials).
  - Let the desktop show quick stats or shortcuts to key tabs.
  - Consider unlockable apps tied to progression (e.g., portfolio analytics, auto‑trading helpers that operate on top of `Game.Btc`).

### 7. Events, Variety, and Long‑Term Play

- Introduce random events driven by `Game.dailyHandlers`:
  - Positive: tax refunds, market booms, education scholarships, BTC price spikes.
  - Negative: sudden repairs, health scares, bad tenants, BTC price crashes.
  - Use simple probability tables keyed off current day, money, and assets to keep events feeling fair.
- Add “New Game+” or soft prestige:
  - After reaching a certain wealth or asset threshold, allow an optional reset with permanent bonuses (faster education, better wage multipliers, better BTC rig efficiency, etc.).

---

## Technical & UX Improvements

### 1. Time Loop and Performance

- Review the three core intervals in `main.js`:
  - 1s: game simulation tick (`Game.advanceTime`, `School.tick`, `Jobs.tick`, `Health.tick`, `Property.tick`, `Companies.tick`, `Btc.tick`, `Game.Meals.tick`).
  - 500ms: UI refresh (`UI.refresh()`).
  - 15s: auto‑save (`Game.save(true)`).
- Consider consolidating timers:
  - Use a single `setInterval` (or `requestAnimationFrame`) to compute `delta` and branch sub‑systems based on accumulated time, which can simplify tuning and avoid drift.
- Add a simple “paused” flag:
  - Let the player pause time updates while still interacting with UI and menus.

### 2. State, Saves, and Migrations

- Use `Game.state.version` more explicitly:
  - When changing `stateTemplate` shape (adding/removing fields), implement a small migration function in `save.js` that:
    - Checks the version in the loaded save.
    - Adds or normalizes missing sub‑objects (e.g., meals, btc history, new company fields).
  - This helps keep old saves from breaking or silently missing new content.
- Add an optional “Reset Save” button in a settings panel:
  - The button already exists in `UI` via the confirm dialog; consider exposing the current state version and last save timestamp to players for clarity.

### 3. Error Handling and Resilience

- Harden external API calls in `btc.js`:
  - `fetchRealPrice` and any BTC history bootstrap should:
    - Set `_fetchingPrice` flags correctly on both success and failure.
    - Log errors in a concise way or surface a discreet notification if price data is unavailable.
  - Ensure the game remains fully playable offline (which it effectively does today) and only uses network data as a bonus.
- Guard against `localStorage` issues:
  - `save.js` already wraps calls in try/catch; consider pruning obviously invalid saves (e.g., JSON parse failures, missing critical keys).

### 4. UI/UX Polish

- Improve feedback around key actions:
  - Show small toasts or subtle highlight animations when promotions, course completions, company unlocks, and major BTC events occur.
  - Surface “next recommended action” somewhere in the overview (e.g., “You have enough money to start Engineering”).
- Add basic settings:
  - Toggles for reduced animation (for low‑power devices).
  - Option to disable live BTC price fetching for privacy/offline mode.

---

## Files Likely Unnecessary for Production Builds

These files aren’t referenced by the runtime game code and can be omitted from the shipped build to keep the bundle lean. You may still want to keep some of them in the repository for development.

- `tmp_render_pc_market.txt`
  - Appears to be a development artifact (render dump or scratch notes).
  - Not referenced anywhere in the codebase (`Select-String` search shows no matches).
  - Safe to delete or move to a `/notes` or `/docs` folder.

- `flotr2.min.js.tmp`
  - Temporary artifact likely created while downloading `flotr2.min.js`.
  - Only `flotr2.min.js` is actually included in `index.html`.
  - Safe to delete or ignore in production; ensure `flotr2.min.js` remains.

- `miners.json`
  - Original JSON data source for cloud mining devices.
  - The running game uses `miners_data.js` (a pre‑extracted, inline JS array) and never fetches `miners.json`.
  - Safe to exclude from production builds; keep it in source control if you want to regenerate `miners_data.js` in the future.

At runtime, the essential files are:
- `index.html`, `style.css`, `flotr2.min.js`
- `core.js`, `economy.js`, `education.js`, `jobs.js`, `health.js`, `property.js`, `companies.js`, `btc.js`, `pc.js`, `world.js`, `miners_data.js`, `save.js`, `ui.js`, `main.js`

Those should be preserved and tested whenever you change balance or add systems.

---

## Company Improvement Plans (5 Steps Each)

### Rail Logistics Corp (UK Rail)

1. **Operations dashboard + controls (Rail screen)**
   - Add a "Dispatch Overview" panel (filters: idle/in-transit, by route, by warehouse, by cargo).
   - Add a "Route Inspector" modal: pick `from`/`to`, show planned rail path stops, distance/ETA, and current track penalties.
   - Micromanagement: run priority, max speed caps per run, dispatch rules (auto vs manual).

2. **Warehouses 2.0 (modal-driven)**
   - Upgrade the existing Warehouses modal into a per-warehouse detail modal (capacity, staffing, inbound/outbound queues, per-item inventory).
   - Micromanagement: staffing shifts, overflow fees, optional loss/damage chance if understaffed, loading/unloading rates that affect dwell time.

3. **Contracts & pricing (modal + board)**
   - Add a Contracts Board modal (time-limited offers, lanes, volumes, penalties, reputation impacts).
   - Micromanagement: accept/reject, bid/markup slider, contract priority queue, penalties for late delivery, bonuses for consistent lanes.

4. **Train management (per-train modal)**
   - Expand the Train Manage modal: consist builder, cargo constraints, maintenance status, crew assignment, and a "preferred lanes" list.
   - Micromanagement: wear/maintenance cycles, track-speed restrictions, breakdown chance if skipping maintenance, fuel/energy abstraction if desired.

5. **Network expansion + refactor**
   - Move rail-specific logic into a clearer module boundary (e.g., `companies_rail.js` or a `Game.Rail` namespace) and keep `companies.js` as orchestrator.
   - Make rail lines/routes fully data-driven from a dedicated routes dataset (with caching for pathfinding).

### Mining Corp

1. **Mine sites UI (modal per site)**
   - Add a "Mine Sites" modal listing all owned/known sites (output, ore mix, hazard level, efficiency).
   - Micromanagement: toggle extraction focus (iron/copper/silver/gold weighting), production caps, safety budget.

2. **Staffing, payroll, and morale (modal)**
   - Add a "Workforce" modal: hire/fire roles (miners, supervisors, engineers), wage sliders, schedules.
   - Micromanagement: morale/attrition, accident risk, overtime boosts vs. burnout penalties, payroll deadlines with consequences.

3. **Machines, power, and maintenance (modal)**
   - Add an "Equipment" modal per mine: machine slots, wear %, repair parts, maintenance queue.
   - Micromanagement: preventive maintenance vs. run-to-failure, power spend for output boosts, downtime scheduling.

4. **Processing + logistics integration**
   - Add "Processing" decisions (sell raw vs. refine) and tie outputs into Rail Logistics/warehouses.
   - Micromanagement: stockpile targets, refine capacity, transport scheduling, losses if storage/transport is neglected.

5. **Production refactor + progression**
   - Refactor mining production into a single deterministic tick function (inputs -> outputs -> costs) to simplify balance.
   - Add a small upgrade/research tree (efficiency, safety, machine capacity) and periodic events (strikes, equipment failures, rich vein discovery).

### Retail Shop

1. **Catalog, pricing, and promotions (modal)**
   - Add a "Catalog & Pricing" modal: per-item price, margin targets, promo toggles, and demand hints.
   - Micromanagement: price elasticity, promo budget, competitor pressure (simple regional multiplier).

2. **Inventory + supplier contracts (modal)**
   - Upgrade inventory management into a modal with reorder points, lead times, supplier selection, and delivery scheduling.
   - Micromanagement: shelf space/capacity, spoilage for certain goods, rush shipping cost vs. stockout penalties.

3. **Staffing + store operations (modal)**
   - Add a "Store Ops" modal: staffing levels, training, opening hours, queue time estimates.
   - Micromanagement: labor cost vs. service quality, theft/shrinkage, customer satisfaction affecting reputation/popularity.

4. **Expansion to multiple locations**
   - Add a "Locations" modal: open new stores in different places, show rent/footfall, and regional demand modifiers.
   - Micromanagement: per-store inventory and staffing, optional transfers between stores (with costs/time).

5. **Retail refactor + analytics**
   - Refactor retail calculations into a shared "daily summary" pipeline (sales -> costs -> profit -> reputation) with clear state fields.
   - Add an Analytics modal (KPIs, trends, best/worst products, stockouts) and lightweight charts (reusing existing chart approach where possible).

### Internet Cafe

1. **Capacity + service tiering**
   - Add seat tiers (basic/gaming/streaming) with different daily upkeep and throughput.
   - Tie seat tiers to PC upgrades (RAM/storage/motherboard) so hardware decisions matter.

2. **Pricing + demand elasticity**
   - Implement an "ideal price" baseline and price factor that scales demand.
   - Add a quick demand forecast in the UI (price factor, service factor, popularity).

3. **Security + incident system**
   - Add daily incident rolls that depend on antivirus status and business skill.
   - Incidents reduce popularity and revenue for a day and create a one-time cost.

4. **Membership + loyalty loops**
   - Add "day passes" or "monthly memberships" that shift demand from daily spikes to stable revenue.
   - Offer loyalty perks tied to player reputation and education level.

5. **Cross-company ties**
   - Offer discounted courier fees for equipment restock or repair parts.
   - Recycling can accept broken hardware for a small refund to the Internet Cafe.

### Courier Service

1. **Route difficulty + package classes**
   - Add package classes (fragile, refrigerated, bulk) with different time and payout multipliers.
   - Tie special classes to Rail Logistics certifications for bigger contracts.

2. **Fleet maintenance + driver quality**
   - Add driver skill tiers and van condition that affect speed, fuel costs, and failure risk.
   - Scheduled maintenance reduces breakdowns but increases daily overhead.

3. **Dispatch policies**
   - Add auto-dispatch rules (profit-first, on-time-first, shortest-route) with a small UI panel.
   - Let players reserve capacity for VIP contracts to build reputation faster.

4. **City economy integration**
   - Tie delivery demand to retail stock levels and property ownership in busy districts.
   - Add surge pricing on days with special events or shortages.

5. **Progression + reputation**
   - Reputation unlocks higher-value clients and multi-drop routes.
   - On-time streaks grant a daily revenue multiplier.

### E-waste Recycling

1. **Scrap sourcing**
   - Add supplier contracts (schools, offices, hospitals) that deliver scrap on a schedule.
   - Tie contract quality to education and tech skill levels.

2. **Processing lines**
   - Add machine tiers (manual, semi-auto, auto) with different throughput and power cost.
   - Allow batching by category (PCs, phones, industrial) with different yields.

3. **Refined output**
   - Convert scrap into categorized materials (plastics, copper, rare metals).
   - Send refined metals into Mining Corp inventory for a logistics bonus.

4. **Quality control + compliance**
   - Add contamination penalties if staff is too low or machines are outdated.
   - Compliance ratings unlock higher-paying government contracts.

5. **Cross-company ties**
   - Courier handles inbound scrap deliveries; Rail Logistics ships outbound materials.
   - Internet Cafe can sell retired hardware into the recycling pipeline.
