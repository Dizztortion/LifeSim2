# LifeSim Formulas & Systems

High‑level description of the main numerical systems used in the full build. File paths in brackets show where the logic is implemented.

---

## Time & Day Progression

- **Real time → in‑game time**
  - `main.js:9-21`
  - Every real second ≈ 0.5 in‑game minutes.
  - `Game.advanceTime(deltaMinutes)` is called once per second with `deltaMinutes = realSeconds * 0.5`.

- **Day rollover & daily handlers**
  - `core.js:219-243`
  - In‑game minutes accumulate in `Game.state.timeMinutes`.
  - When `timeMinutes >= 1440`, subtract 1440 and increment `Game.state.day`.
  - Each rollover calls all registered daily handlers in `Game.dailyHandlers`:
    - Jobs daily wages (`jobs.js`).
    - Meal daily reset (`core.js`).
    - Property, Companies, BTC history, Healthcare warnings, etc.

---

## Hunger, Energy & Health

### Baseline health loop

- **Hunger increase (global health tick)**
  - `health.js:3-9`
  - Each minute: `hunger += minutes * 0.00116` (roughly 0 → 100 over ~2 real‑time days).
  - Clamped to `[0, 100]`.

- **Passive energy recovery (when not busy)**
  - `Game.Health.tick(...)` (`health.js`)
  - If NOT working a job AND not enrolled in school AND not travelling:
    - Base recovery rate: `baseRate = 0.05` energy per in‑game minute.
    - Multiplier: `mult = 2` when at `Home`, otherwise `1`.
    - Low-energy safety net: if `energy < 20`, energy recovery is `10x` faster (all locations).
    - Sleeping (at Home): energy recovery is `10x` faster and auto-stops when energy is full.
    - `energy += minutes * baseRate * mult`, clamped to max `Game.Health.getMaxEnergy()`.

- **Health penalties**
  - `health.js:16-25`
  - If `hunger > 80`: health decays `health -= minutes * 0.04`.
  - If `energy < 20`: health decays `health -= minutes * 0.03`.
  - Health is clamped to minimum `0`.

### Healthcare actions

- **Doctor visit**
  - `health.js:26-37`, `economy.js:10-13`
  - Cost: `Game.Economy.doctorVisit = 80` (via `Game.spendMoney`).
  - Effect: `health += 30`, clamped to `Game.Health.getMaxHealth()`.

- **Hospital stay**
  - `health.js:38-51`
  - Cost: `Game.Economy.hospitalStay = 320`.
  - Effects (hard reset style):
    - `health = Game.Health.getMaxHealth()`
    - `energy = min(Game.Health.getMaxEnergy(), 80)`
    - `hunger = 20`

- **Low health warning**
  - `health.js:53-60`
  - Daily handler: if `health < 35` add notification suggesting healthcare.

---

## Meals & Snacks

### Meal storage & auto‑consumption

- **State structure**
  - `core.js:60-71`, `core.js:263-332`
  - `Game.state.meals.counts = { breakfast, lunch, dinner }` stores how many of each meal you own.
  - `Game.state.meals.consumed = { breakfast, lunch, dinner }` tracks whether that meal has been eaten in the current day.

- **Buying a meal**
  - `world.js:56-96`
  - Price: `Game.Shop.getMealPrice(mealId)`:
    - `basePrice` per meal type: `breakfast:10`, `lunch:14`, `dinner:18` (`world.js:27-33`).
    - Location multiplier: `Home → 1.25x`, other locations → `1.0x` (`world.js:34-45`).
    - Final price: `round(basePrice * multiplier)`.
  - Purchase flow:
    - Call `Game.Meals.addMeal(mealId, 1)` to increase stored count (respecting cap).
    - If cost cannot be paid (`Game.spendMoney` fails), roll back that one stored meal.

- **Meal storage cap & adding meals**
  - `core.js:287-303`
  - Per‑type cap: `maxStore = 13` meals of each type.
  - If current count ≥ 13: purchase is rejected and a notification warns you.
  - Otherwise: `counts[type] += min(amount, maxStore - current)`.

- **Daily reset of “consumed” flags**
  - `core.js:330-332` and `core.js:344-349`
  - Each new in‑game day: `consumed` flags are reset to `false` for all three meals.

- **Auto‑eating windows & hunger reduction**
  - `core.js:334-349`
  - Each tick, meals may auto‑consume once per day per type if both:
    - You have at least one stored meal of that type.
    - `consumed[type]` is still `false` for the current day.
  - Time windows by hour of the in‑game day:
    - Breakfast: `06:00–07:59` → `Game.Meals.consumeOne("breakfast")`
    - Lunch: `12:00–13:59` → `consumeOne("lunch")`
    - Dinner: `18:00–19:59` → `consumeOne("dinner")`
  - Effects of `consumeOne(type)` (`core.js:304-329`):
    - Decrement stored count: `counts[type] -= 1` (min 0).
    - Mark as consumed for the day: `consumed[type] = true`.
    - Hunger reduction: `hunger -= 16`, clamped to `≥ 0`.

### Healthy Snack Packs (manual use)

- **Buying snacks**
  - `world.js:15-24`, `world.js:68-90`
  - Defined as a physical item:
    - `id: "health-snacks"`, `name: "Healthy Snack Pack"`, `price: 45`, `type: "consumable"`, `location: "City Centre"`.
  - Purchase:
    - Must be at `"City Centre"` and pay the (possibly discounted) price.
    - On success, pushes an inventory item: `{ id: "health-snacks", name: "Healthy Snack Pack", type: "consumable", source: "City Centre" }`.

- **Using snacks (effect)**
  - `core.js:360-421`
  - Usable item check: `Game.Inventory.canUseItem(id)` returns `true` only for `"health-snacks"`.
  - When `Game.Inventory.useItem("health-snacks")` is called:
    - Removes one `"health-snacks"` entry from `Game.state.inventory`.
    - Reduces hunger: `hunger -= 12` (min `0`).
    - Adds notification `"You ate a Healthy Snack Pack."`.
  - Snacks are never auto‑consumed; they are only used via “Use” buttons in the inventory UIs.

### Energy drinks (manual use)

- **Items & locations**
  - `world.js:20-32`
  - Added as physical shop items with `type: "energy drink"` and different locations:
    - Red Fang, MonsterByte, ThunderBolt Energy → City Centre.
    - RockBlitz, AmpCore → Industrial Park.
    - VyperVolt, NitroRoar → Countryside.

- **Using energy drinks**
  - `core.js:360-421`
  - All energy drinks are usable inventory items via `Game.Inventory.useItem(id)`.
  - On use:
    - One drink is removed from `Game.state.inventory`.
    - Player gains energy but loses a small amount of health (trade‑off).

- **Per‑drink effects**
  - Red Fang (`drink-red-fang`):
    - `energy += 16`, `health -= 3`
  - MonsterByte (`drink-monster-byte`):
    - `energy += 22`, `health -= 4`
  - RockBlitz (`drink-rock-blitz`):
    - `energy += 12`, `health -= 2`
  - AmpCore (`drink-amp-core`):
    - `energy += 18`, `health -= 3`
  - ThunderBolt Energy (`drink-thunderbolt`):
    - `energy += 24`, `health -= 5`
  - VyperVolt (`drink-vyper-volt`):
    - `energy += 14`, `health -= 3`
  - NitroRoar (`drink-nitro-roar`):
    - `energy += 28`, `health -= 6`
  - All values are clamped after application:
    - `energy` and `health` stay within `[0, 100]`.

---

## Jobs & Promotions

### Job definitions & requirements

- `jobs.js:1-28`
  - Jobs:
    - `none`: no income, no skill.
    - `barista`: uses `businessSkill`, no education requirement.
    - `office`: uses `businessSkill`, requires `education.level ≥ 1`.
    - `trainDriver`: uses `trainSkill`, requires `education.level ≥ 2`.
  - Education gating is enforced in `Game.Jobs.setJob`.

### Starting and ending shifts

- **Start shift conditions**
  - `jobs.js:29-58`
  - You cannot start a shift if:
    - You have no job (`current === "none"`).
    - You’re already working.
    - `energy < 25`.
  - On start:
    - `job.isWorking = true`
    - `job.shiftMinutes = 0`
    - For train driver: train controls are activated and safety strikes reset.

- **End shift & daily payout**
  - `jobs.js:59-79`, `jobs.js:153-176`
  - `Game.Jobs.endShift(reason)` stops work, disables train controls if needed and posts a notification.
  - Shifts auto‑end after 8 in‑game hours worked: `if shiftMinutes >= 8*60 → endShift("completed full shift")`.
  - Wages are accumulated in `job.pendingWages` during the day and paid once per in‑game day via the daily handler:
    - `Game.addMoney(job.pendingWages, "Daily wages: <job name>")`
    - `job.pendingWages = 0`

### Wages, XP & skill gains

- **Base wages**
  - `economy.js:2-7`
  - Per‑hour wage by job:
    - none: `$0`
    - barista: `$14/hr`
    - office: `$22/hr`
    - trainDriver: `$40/hr` (before train quality modifiers).

- **Per‑minute income & level multiplier**
  - `jobs.js:80-111`
  - For a non‑train job:
    - Base: `wage = Game.Economy.wages[currentJobId]`.
    - Level multiplier: `levelMult = 1 + job.level * 0.15`.
    - Pay per minute: `payPerMinute = (wage * levelMult) / 60`.
    - For each tick: `effectivePay = payPerMinute * minutes` added to `pendingWages`.

- **XP and skill growth while working**
  - `jobs.js:112-137`
  - Job XP gain: `job.xp += minutes * 0.3` while working.
  - Skill gain: if job has a linked skill (e.g. `businessSkill`, `trainSkill`), then:
    - `Game.state.stats[skillKey] += minutes * 0.1`.

- **Promotion thresholds**
  - `jobs.js:137-151`
  - Required XP per job level: `neededForLevel = 100 + job.level * 70`.
  - While `job.xp >= neededForLevel`:
    - `job.xp -= neededForLevel`
    - `job.level += 1`
    - Notification: `"Promotion! <Job Name> level <job.level>"`.
    - `neededForLevel` is recomputed for the new level.
  - Promotions increase the wage multiplier via `levelMult` described above.

### Train Driver special case

- `jobs.js:152-211`

- **Core variables**
  - `trainJob.coal`, `pressure`, `speed`, `throttle`, `coalFeed`, `safetyStrikes` control the simulation.

- **Coal & pressure**
  - Coal is consumed: `coal -= coalFeed * (minutes / 8)`.
  - Boiler pressure change: `pressure += (coalFeed * 0.9 * minutes/10) - (0.6 * minutes/10)`.
  - Pressure is clamped roughly between 0–110, with minimum 5 under normal running.

- **Speed & throttle**
  - Target speed: `targetSpeed = throttle * 1.4`.
  - Speed interpolation: `speed += (targetSpeed - speed) * 0.15 * (minutes / 5)`.
  - Speed clamped to `[0, 140]`.

- **Safety incidents**
  - Unsafe if any of:
    - `pressure > 95` or `< 20`
    - `speed > 110` or `< 25`
  - While unsafe, `safetyStrikes += minutes / 10`. While safe, they decay: `safetyStrikes -= minutes / 20` (min 0).
  - If `safetyStrikes ≥ 3`:
    - Safety incident fired:
      - Notification and monetary penalty: `Game.spendMoney(120, "Safety penalty")`.
      - Shift ends: `Game.Jobs.endShift("removed from train for unsafe driving")`.
      - Pay for that tick is zero.

- **Train driver pay quality band**
  - You are paid only when within a “good driving” band:
    - `pressure` between `35` and `85` AND `speed` between `45` and `90` AND no unsafe flag.
  - Per‑tick pay:  
    - Base: `basePayPerMinute` (from wage/level calculation).
    - Quality factor: `quality = 1 - (abs(speed - 65) / 40)`, min `0`.
    - Final pay: `pay = basePayPerMinute * minutes * (0.7 + quality * 0.6)`.

---

## Education & Courses

### Courses & tuition

- `education.js:1-27`, `economy.js:8-13`
  - Courses:
    - Night class: `durationProgress = 100`, `xpReward = 60`, cost `60`.
    - Engineering: `durationProgress = 140`, `xpReward = 120`, cost `220`.
    - Business: `durationProgress = 130`, `xpReward = 110`, cost `180`.
  - Each course also has a `minEducationLevel` requirement and costs tuition via `Game.spendMoney`.

### Study progress & completion

- `education.js:28-53`
  - If enrolled:
    - Progress per minute: `progress += minutes * 0.35`.
    - Course completes when `progress ≥ maxProgress`.
  - On completion:
    - `school.enrolled = false` and `school.course = null`.
    - Education XP gain: `education.xp += xpReward` for that course.
    - Notification summarizing XP gain.
    - `Game.School.checkLevelUp()` is called.

### Education level & progression

- **XP requirement for next level**
  - `education.js:54-59`
  - Formula: `xpForNextLevel = 80 + education.level * 60`.

- **Level‑up loop**
  - `education.js:60-72`
  - While `education.xp ≥ xpForNextLevel`:
    - Subtract `needed` from `xp`.
    - Increment `education.level`.
    - Emit notification `"Education level up! Now level <level> (<label>)"`.
    - Recalculate `needed` for the next level.

- **Progress bar percentage**
  - `education.js:73-81`
  - `progressPercent = floor((education.xp / xpForNextLevel) * 100)` clamped to `[0,100]`.

- **Interactions with other systems**
  - Jobs and companies use `education.level` as requirements:
    - Office: requires level ≥ 1.
    - Train Driver: requires level ≥ 2.
    - Rail Logistics company unlocks when `education.level ≥ 2` and `trainSkill ≥ 20` (`companies.js:5-16`).

---

## Companies & Business Funds (High‑Level)

This section summarises the main formulas; see `companies.js` for full details.

### Rail Logistics

- **Unlock condition**
  - `companies.js:5-10`
  - Unlocks when `education.level ≥ 2` and `stats.trainSkill ≥ 20`.

- **Contracts**
  - `companies.js:17-37`
  - A contract requires `8` in‑game hours (`minutesRequired = 8*60`).
  - Payout formula: `payout = 900 + level * 260`.
  - On completion:
    - Player receives `payout` via `Game.addMoney`.
    - `reputation += 5` and `level += 1`.

### Mining Corp

- **Unlock condition**
  - `companies.js:11-15`
  - Unlocks at `education.level ≥ 1`.

- **Legacy drilling run**
  - `companies.js:45-67`
  - When a drilling operation is active:
    - Total duration: `6 * 60` minutes.
    - Ore gain per tick:  
      `oreStock += 10 * fraction * (1 + level * 0.4)`  
      where `fraction = minutes / activeRunTotal`.

- **Mines, capacity & ore mix**
  - `companies.js:68-124`
  - Each mine has `baseCapacity` and `oreMix` for iron/copper/silver/gold.
  - Effective per‑day capacity: `baseCapacity * (1 + mine.level * 0.25)`.
  - Per‑minute production when active:  
    `perMinute = capacityPerDay / (24 * 60)`  
    `output = perMinute * minutes * min(staff / requiredStaff, machines / requiredMachines)`.
  - Output is split across metals according to `oreMix` and aggregated into `oreDetail` and `oreStock`.

- **Ore pricing & selling**
  - `companies.js:125-145`
  - Unit ore price: `unitPrice = 4 + level * 1.2`.
  - Total value: `oreStock * unitPrice`.
  - Selling ore:
    - Level increases by `1`.
    - All ore counts reset to `0`.
    - Payout credited into Mining Corp business funds: `m.funds += payout`.

- **Payroll & business funds**
  - `companies.js:210-243`
  - Weekly wage per staff: `weeklyPerStaff = 210`.
  - Total wages: `totalWages = weeklyPerStaff * totalStaff`.
  - If `m.funds ≥ totalWages`, wages are paid from business funds; otherwise you get a warning.
  - Payroll is triggered by the daily handler when `daysUntilPayroll <= 0`.

### Retail Shop

- **Unlock condition**
  - `companies.js:15-19`
  - Unlocks when `businessSkill ≥ 10`.

- **Stock ordering & deliveries**
  - `companies.js:244-289`
  - Order options (per batch):
    - Small: `batchSize=40`, `unitPrice=4.5`, `leadDays=0`.
    - Standard: `batchSize=80`, `unitPrice=4.0`, `leadDays=1`.
    - Bulk: `batchSize=140`, `unitPrice=3.6`, `leadDays=2`.
  - For an order (`option`, `batches`):
    - `totalUnits = batchSize * batches`.
    - `cost = totalUnits * unitPrice` debited from `retailShop.funds`.
    - Delivery arrives on `arrivalDay = currentDay + leadDays` and then adds `units` to `stock`.

- **Sales schedule & revenue per event**
  - `companies.js:317-383`
  - Expected daily sales baseline:
    - `baseSalesPerDay = 40 + level * 12`.
    - Popularity multiplier: `popularityMult = 0.4 + (popularity / 100) * 0.9`.
    - `expectedDaySales = baseSalesPerDay * popularityMult`.
  - A random set of sale “events” (time slots) are chosen between 07:00 and 21:00.
  - For each sale event where `stock > 0`:
    - Expected per‑event sales:
      - `basePerEvent = expectedDaySales / numberOfEvents`.
      - Actual sold: `sold = basePerEvent * (0.7 + random(0..0.8))`, capped by current `stock`.
    - Revenue:
      - Unit price: `unitRevenue = 8 + level * 2.5`.
      - Sales revenue: `revenue = sold * unitRevenue` credited to `retailShop.funds`.
  - Popularity drifts down over time: `popularity -= minutes * 0.01`, but is floored at 10 when the shop is idle and empty.

- **Marketing boost**
  - `companies.js:290-316`
  - Cost: `$90` from `retailShop.funds`.
  - Effect: `popularity += 12`, clamped to max `100`.

---

## Money, Travel & Misc

### Money helpers

- **Gain/spend money**
  - `core.js:102-138`
  - `Game.addMoney(amount, reason)`:
    - Adds `amount` to `state.money` and logs a notification with `±$X (reason)`.
  - `Game.spendMoney(amount, reason)`:
    - If `money < amount`, returns `false` and does nothing.
    - Otherwise subtracts and logs a `-$X (reason)` notification.
  - UI topbar animates `money` total when these helpers are used.

### Travel

- **Travel costs**
  - `economy.js:13-16`, `world.js:4-23`
  - Base travel cost: `Game.Economy.travelBaseCost = 15`.
  - Each trip between locations costs `$15` via `Game.spendMoney` and updates `travelLocation`.
  - Travelling also regenerates shop offers for that location.

---

## BTC Systems (Snapshot)

### Physical mining rigs

- **Buying rigs**
  - `btc.js:7-22`
  - Rig cost: `2200 + rigsOwned * 400`.
  - On purchase:
    - `rigsOwned += 1`.
    - A rig item is added to inventory.

- **Rig earnings & power costs**
  - `btc.js:93-112`, `btc.js:74-92`
  - When power is ON:
    - BTC per second: `rigsOwned * rigHashrate * 0.00000000035`.
    - Added via `Game.addBtc(amount, "Mining rig")`.
  - Daily power bill:
    - `powerCostPerDay = 20` per rig (from `core.js` state).
    - At end of day: `Game.spendMoney(powerBill, "Mining rig power bill")` with `powerBill = rigsOwned * powerCostPerDay`.

### Cloud mining contracts (high‑level)

- **Contract sizing & price**
  - `btc.js:23-73`
  - Uses a base hashrate, base daily BTC and base price, modified by:
    - Tier (`bronze`, `silver`, `gold`).
    - Slider hashrate.
    - Duration (`short`, `standard`, `long`).
  - Core relationships:
    - Daily BTC is proportional to effective hashrate: `dailyBtc ∝ targetHash`.
    - Contract price is proportional to hashrate and duration: `price ∝ hashUnits * tierPriceMult * durationMult`.

- **Cloud earnings over time**
  - `btc.js:93-112`
  - Each real second:
    - Convert to in‑game minutes: `inGameMinutes = seconds * 0.5`.
    - Fraction of virtual day: `fractionOfDay = inGameMinutes / (24 * 60)`.
    - For each active contract: BTC earned ≈ `dailyBtc * fractionOfDay`.

---

## Where To Extend

- This document focuses on the formulas that are most gameplay‑relevant:
  - Eating meals & snacks and their effects on hunger/health.
  - Job wages, XP, promotions and special train driver rules.
  - Education XP/level formulas and course durations.
  - Company unlock conditions, payouts, and main business fund loops.
  - BTC mining and cloud earnings at a high level.
- If you add new mechanics (e.g. mental health, fitness, advanced quests), mirror this structure:
  - Describe state variables.
  - Specify per‑minute/per‑day rates.
  - Include thresholds, caps, and multipliers.
  - Reference the implementing file and approximate line for quick code lookup.

---

## Retail Shop (Snapshot)

### Inventory & Cost Basis

- **State & fields**
  - `core.js` company template, `companies.js` retail functions.
  - Retail state: `Game.state.companies.retailShop`:
    - `stock`: total units of generic retail stock currently on hand.
    - `funds`: retail business funds (separate from player money).
    - `inventoryValue`: total wholesale cost of all units currently in stock.
    - `stats`: `{ todayUnits, todayRevenue, todayCost, yesterdayUnits, yesterdayRevenue, yesterdayCost }`.

- **Ordering stock**
  - `companies.js` (`orderRetailStock`).
  - Options (small / standard / bulk) are defined in `Game.Companies.retailStockOptions`:
    - Each option has `batchSize`, `unitPrice` and `leadDays`.
  - When placing an order:
    - `totalUnits = batchSize * batches`.
    - `cost = totalUnits * unitPrice`.
    - Retail business funds are reduced: `retailShop.funds -= cost`.
    - A pending delivery is stored with `units`, `optionId`, `unitPrice`, `orderDay`, `arrivalDay`.

- **Deliveries & inventory value**
  - `companies.js` (`resolveRetailDeliveries`).
  - On or after `arrivalDay`:
    - `stock += delivery.units`.
    - `inventoryValue += delivery.units * delivery.unitPrice`.
    - A notification is added to the log.
  - `inventoryValue / stock` gives an average wholesale unit cost for all items currently on the shelf.

### Sales, Revenue & Profit

- **Sales cadence**
  - `companies.js` (`tickRetail`).
  - Day is divided into 5‑minute slots (288 per day).
  - Candidates are slots whose hour is between 07:00 and 21:00.
  - Number of sale events per day:
    - `baseSalesPerDay = 40 + level * 12`.
    - `popularityMult = 0.4 + (popularity / 100) * 0.9`.
    - `expectedDaySales = baseSalesPerDay * popularityMult`.
    - `eventsCount ≈ max(12, expectedDaySales / 3)` (clamped to available slots).

- **Units sold per event**
  - For a scheduled sale slot when `stock > 0`:
    - Recompute `expectedDaySales` using current `level` and `popularity`.
    - `events = number of scheduled sale slots`.
    - `basePerEvent = expectedDaySales / events`.
    - `soldRaw = basePerEvent * (0.7 + rand(0..0.8))`.
    - `sold = min(soldRaw, stock)`.
    - `stock -= sold`.

- **Retail price & revenue**
  - Retail price per unit:
    - `unitSalePrice = 8 + level * 2.5`.
  - Revenue for a sale event:
    - `revenue = sold * unitSalePrice`.
    - `funds += revenue` (credited to Retail business funds).
    - Notification: “Retail shop sales credited $X to business funds.”

- **Cost of goods & profit**
  - Average wholesale unit cost before sale:
    - `unitCost = inventoryValue / stock` (guarded so 0 when inventory is empty or invalid).
  - Cost of goods for the event:
    - `costOfGoods = unitCost * sold`.
    - `inventoryValue -= costOfGoods` (floored at 0).
  - Daily stats update (`retailShop.stats`):
    - `todayUnits += sold`.
    - `todayRevenue += revenue`.
    - `todayCost += costOfGoods`.
  - Implied profit and margin for the event:
    - `profit = revenue - costOfGoods`.
    - `margin = profit / revenue`.

### Daily Roll‑over

- **Stats roll‑forward**
  - `companies.js` daily handler.
  - At the end of each game day:
    - `yesterdayUnits = todayUnits`.
    - `yesterdayRevenue = todayRevenue`.
    - `yesterdayCost = todayCost`.
    - `todayUnits = todayRevenue = todayCost = 0`.

### UI & Player Feedback

- **Companies tab overview**
  - `ui.js` (`renderCompaniesTab` Retail card).
  - Shows:
    - Status, Level, Current stock, Popularity, Next delivery.
    - Yesterday’s results on separate rows:
      - Units sold.
      - Revenue.
      - Profit and margin percentage.

- **Retail stock management page**
  - `ui.js` (`renderRetailStockPage`).
  - “Shop Summary” card:
    - Status, Level, Current stock, Popularity, Business funds.
    - Today’s and yesterday’s stats in multi‑row layout:
      - Today: units, revenue, profit, margin.
      - Yesterday: units, revenue, profit.
  - Separate cards for:
    - Business funds transfers (deposit/withdraw between wallet and business).
    - Order type selection (small/standard/bulk with batch size, unit price, and lead time).
    - Planned units and cost for the current slider position.
    - Active deliveries list (showing order id, units, option type, arrival day).
