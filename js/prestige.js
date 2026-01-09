// Prestige: meta progression via resets, score, and a prestige shop.
// Depends on Game.stateTemplate (core.js) and game modules (optional).

(function () {
  if (!window.Game) window.Game = {};

  function clamp(x, a, b) {
    if (!(x >= a)) x = a;
    if (x > b) x = b;
    return x;
  }
  function log10(x) {
    return Math.log(x) / Math.LN10;
  }
  function softLogScore(x, pivot, exponent) {
    var v = typeof x === "number" ? x : 0;
    if (!isFinite(v) || v < 0) v = 0;
    var p = typeof pivot === "number" && pivot > 0 ? pivot : 1;
    var e = typeof exponent === "number" && exponent > 0 ? exponent : 1;
    // Stable for large values; grows forever but with diminishing returns.
    return Math.pow(log10(1 + v / p), e);
  }

  Game.Prestige = {
    config: {
      baseTargetScore: 1000,
      scoreParts: {
        // baseMax: main contribution that soft-caps (keeps any single stat from dominating)
        // overflowMax: slow extra growth beyond the cap (keeps score meaningful late-game)
        btcValueUsd: { baseMax: 1200, overflowMax: 500, pivot: 4500, exponent: 1.10, overflowPivotMult: 12, overflowExponent: 1.0, hint: "BTC value (soft-cap + slow overflow)" },
        altValueUsd: { baseMax: 800, overflowMax: 350, pivot: 3200, exponent: 1.10, overflowPivotMult: 12, overflowExponent: 1.0, hint: "Altcoins total (soft-cap + slow overflow)" },
        cashUsd: { baseMax: 600, overflowMax: 220, pivot: 1600, exponent: 1.12, overflowPivotMult: 10, overflowExponent: 1.0, hint: "Wallet cash (soft-cap + slow overflow)" },
        bankBalanceUsd: { baseMax: 420, overflowMax: 160, pivot: 2400, exponent: 1.10, overflowPivotMult: 12, overflowExponent: 1.0, hint: "Bank deposits (soft-cap + slow overflow)" },
        companyBalancesUsd: { baseMax: 520, overflowMax: 220, pivot: 4200, exponent: 1.08, overflowPivotMult: 14, overflowExponent: 1.0, hint: "Company balances (soft-cap + slow overflow)" },
        netWorthUsd: { baseMax: 620, overflowMax: 260, pivot: 9000, exponent: 1.06, overflowPivotMult: 16, overflowExponent: 1.0, hint: "Total net worth (broad, slow overflow)" },
        educationLevel: { baseMax: 520, overflowMax: 260, pivot: 6, exponent: 1.20, overflowPivotMult: 3, overflowExponent: 1.0, hint: "Education (soft-cap + slow overflow)" },
        eduRuns: { baseMax: 620, overflowMax: 260, pivot: 28, exponent: 1.15, overflowPivotMult: 10, overflowExponent: 1.0, hint: "Education runs (soft-cap + slow overflow)" },
        monthsLived: { baseMax: 380, overflowMax: 140, pivot: 8, exponent: 1.20, overflowPivotMult: 6, overflowExponent: 1.0, hint: "Months lived (time scaling)" },
        questsCompleted: { baseMax: 520, overflowMax: 220, pivot: 10, exponent: 1.18, overflowPivotMult: 10, overflowExponent: 1.0, hint: "Quest completions (soft-cap + slow overflow)" }
      },
      pointsTiers: [
        { mult: 1.0, points: 1, label: "Qualified" },
        { mult: 1.25, points: 1, label: "Strong run" },
        { mult: 1.50, points: 1, label: "Excellent run" },
        { mult: 2.00, points: 2, label: "Elite run" },
        { mult: 3.00, points: 2, label: "Legendary run" },
        { mult: 5.00, points: 3, label: "Mythic run" }
      ],
      upgrades: [
        {
          id: "wage_mult",
          name: "Pay Raise",
          desc: "+Wages from job shifts.",
          maxTier: 100,
          costBase: 1,
          costMult: 1.55,
          type: "Work"
        },
        {
          id: "job_xp",
          name: "Career Momentum",
          desc: "+Job XP gain.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.6,
          type: "Work"
        },
        {
          id: "course_speed",
          name: "Scholarship Program",
          desc: "+Course progress speed.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.6,
          type: "School"
        },
        {
          id: "tuition_discount",
          name: "Tuition Rebate",
          desc: "Cheaper course enrollments.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.55,
          type: "School"
        },
        {
          id: "travel_discount",
          name: "Efficient Commuting",
          desc: "Cheaper travel costs.",
          maxTier: 50,
          costBase: 1,
          costMult: 1.7,
          type: "Travel"
        },
        {
          id: "energy_cap",
          name: "Stamina Training",
          desc: "+Max energy cap.",
          maxTier: 50,
          costBase: 2,
          costMult: 1.55,
          type: "Survival"
        },
        {
          id: "home_heal",
          name: "Healthy Routine",
          desc: "Faster home recovery.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.55,
          type: "Survival"
        },
        {
          id: "meal_storage",
          name: "Meal Prep Kits",
          desc: "Store more daily meals.",
          maxTier: 50,
          costBase: 1,
          costMult: 1.55,
          type: "Survival"
        },
        {
          id: "tenant_rent",
          name: "Property Management",
          desc: "+Tenant rent income.",
          maxTier: 100,
          costBase: 3,
          costMult: 1.6,
          type: "Property"
        },
        {
          id: "company_rev",
          name: "Business Operator",
          desc: "+Company revenue.",
          maxTier: 100,
          costBase: 3,
          costMult: 1.6,
          type: "Business"
        },
        {
          id: "bank_interest",
          name: "Banker’s Favor",
          desc: "+Deposit interest.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.6,
          type: "Economy"
        },
        {
          id: "btc_yield",
          name: "Miner Optimization",
          desc: "+BTC/crypto mining yield.",
          maxTier: 100,
          costBase: 3,
          costMult: 1.65,
          type: "Mining"
        },
        {
          id: "power_saver",
          name: "Power Saver",
          desc: "Lower mining power costs.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.6,
          type: "Mining"
        },
        {
          id: "start_cash",
          name: "Inheritance",
          desc: "Start each new life with extra cash.",
          maxTier: null,
          costBase: 2,
          costMult: 1.7,
          type: "Start"
        },
        {
          id: "start_btc",
          name: "Seed BTC Wallet",
          desc: "Start each new life with a tiny BTC stash.",
          maxTier: null,
          costBase: 3,
          costMult: 1.75,
          type: "Start"
        },
        {
          id: "shift_eff",
          name: "Work Efficiency",
          desc: "Lower energy drain while working.",
          maxTier: 100,
          costBase: 2,
          costMult: 1.6,
          type: "Work"
        },
        {
          id: "lxp_gain",
          name: "Legacy Insight",
          desc: "+Life Experience Points earned on Prestige (capped).",
          maxTier: 10,
          costBase: 6,
          costMult: 1.7,
          type: "LXP"
        },
        {
          id: "lxp_overflow",
          name: "Overcap Dividends",
          desc: "More LXP from going above the target score (capped).",
          maxTier: 8,
          costBase: 4,
          costMult: 1.75,
          type: "LXP"
        },
        {
          id: "lxp_flat",
          name: "Milestone Bonus",
          desc: "+Flat LXP added to every Prestige reward.",
          maxTier: 5,
          costBase: 10,
          costMult: 1.9,
          type: "LXP"
        },
        {
          id: "lxp_relic",
          name: "Eternal Relic",
          desc: "One-time: +15% LXP from all future Prestiges.",
          maxTier: 1,
          costBase: 300,
          costMult: 1,
          type: "One-Time"
        },
        {
          id: "lxp_crown",
          name: "Founder's Crown",
          desc: "One-time: +35% LXP from all future Prestiges.",
          maxTier: 1,
          costBase: 900,
          costMult: 1,
          type: "One-Time"
        },
        {
          id: "lxp_vault",
          name: "Hall of Legends",
          desc: "One-time: +3 flat LXP added to every Prestige reward.",
          maxTier: 1,
          costBase: 1400,
          costMult: 1,
          type: "One-Time"
        }
      ]
    },

    ensureState: function () {
      if (!Game.state) Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));
      if (!Game.state.prestige || typeof Game.state.prestige !== "object") {
        Game.state.prestige = { points: 0, totalPrestiges: 0, targetScore: Game.Prestige.config.baseTargetScore, lastPrestigeScore: 0, lastPrestigePointsEarned: 0, upgrades: {} };
      }
      var p = Game.state.prestige;
      if (typeof p.points !== "number" || !isFinite(p.points) || p.points < 0) p.points = 0;
      if (typeof p.totalPrestiges !== "number" || !isFinite(p.totalPrestiges) || p.totalPrestiges < 0) p.totalPrestiges = 0;
      if (typeof p.targetScore !== "number" || !isFinite(p.targetScore) || p.targetScore <= 0) p.targetScore = Game.Prestige.config.baseTargetScore;
      // Migration: older saves used a much higher initial target; normalize it for first-time prestigers.
      if ((p.totalPrestiges || 0) === 0 && p.targetScore === 2500) p.targetScore = Game.Prestige.config.baseTargetScore;
      // Migration: raise the initial prestige requirement for first-time prestigers.
      if ((p.totalPrestiges || 0) === 0 && p.targetScore < Game.Prestige.config.baseTargetScore) p.targetScore = Game.Prestige.config.baseTargetScore;
      if (typeof p.lastPrestigeScore !== "number" || !isFinite(p.lastPrestigeScore) || p.lastPrestigeScore < 0) p.lastPrestigeScore = 0;
      if (typeof p.lastPrestigePointsEarned !== "number" || !isFinite(p.lastPrestigePointsEarned) || p.lastPrestigePointsEarned < 0) p.lastPrestigePointsEarned = 0;
      if (!p.upgrades || typeof p.upgrades !== "object") p.upgrades = {};

      if (!Game.state.prestigeRun || typeof Game.state.prestigeRun !== "object") {
        Game.state.prestigeRun = { eduJobRunsById: {}, eduCourseRunsById: {}, eduRunsTotal: 0 };
      }
      var r = Game.state.prestigeRun;
      if (!r.eduJobRunsById || typeof r.eduJobRunsById !== "object") r.eduJobRunsById = {};
      if (!r.eduCourseRunsById || typeof r.eduCourseRunsById !== "object") r.eduCourseRunsById = {};
      if (typeof r.eduRunsTotal !== "number" || !isFinite(r.eduRunsTotal) || r.eduRunsTotal < 0) r.eduRunsTotal = 0;
    },

    getUpgradeTier: function (id) {
      Game.Prestige.ensureState();
      var t = Game.state.prestige.upgrades[id];
      if (typeof t !== "number" || !isFinite(t) || t < 0) return 0;
      return Math.floor(t);
    },

    getUpgradeDef: function (id) {
      var defs = Game.Prestige.config.upgrades;
      for (var i = 0; i < defs.length; i++) {
        if (defs[i] && defs[i].id === id) return defs[i];
      }
      return null;
    },

    getUpgradeCost: function (id, nextTier) {
      var def = Game.Prestige.getUpgradeDef(id);
      if (!def) return null;
      var t = typeof nextTier === "number" ? nextTier : (Game.Prestige.getUpgradeTier(id) + 1);
      if (!isFinite(t) || t <= 0) t = 1;
      var maxTier = (typeof def.maxTier === "number" && isFinite(def.maxTier) && def.maxTier > 0) ? Math.floor(def.maxTier) : null;
      if (maxTier !== null && t > maxTier) return null;
      var base = def.costBase || 1;
      var mult = def.costMult || 1.6;
      var raw = base * Math.pow(mult, Math.max(0, t - 1));
      var cost = Math.max(1, Math.round(raw));
      return cost;
    },

    canBuyUpgrade: function (id) {
      Game.Prestige.ensureState();
      var def = Game.Prestige.getUpgradeDef(id);
      if (!def) return { ok: false, message: "Unknown upgrade." };
      var tier = Game.Prestige.getUpgradeTier(id);
      var maxTier = (typeof def.maxTier === "number" && isFinite(def.maxTier) && def.maxTier > 0) ? Math.floor(def.maxTier) : null;
      if (maxTier !== null && tier >= maxTier) return { ok: false, message: "Max tier reached." };
      var cost = Game.Prestige.getUpgradeCost(id, tier + 1);
      if (cost === null) return { ok: false, message: "Unavailable." };
      if (Game.state.prestige.points < cost) return { ok: false, message: "Not enough Life Experience Points." };
      return { ok: true, cost: cost, tier: tier };
    },

    buyUpgrade: function (id) {
      Game.Prestige.ensureState();
      var check = Game.Prestige.canBuyUpgrade(id);
      if (!check.ok) return check;
      var def = Game.Prestige.getUpgradeDef(id);
      var tier = Game.Prestige.getUpgradeTier(id);
      var cost = check.cost;
      Game.state.prestige.points -= cost;
      Game.state.prestige.upgrades[id] = tier + 1;
      if (Game.addNotification) {
        Game.addNotification("Purchased Prestige upgrade: " + def.name + " (Tier " + (tier + 1) + ").");
      }
      return { ok: true, newTier: tier + 1, cost: cost };
    },

    getUpgradeEffectText: function (id, tier) {
      var t = typeof tier === "number" ? Math.floor(tier) : Game.Prestige.getUpgradeTier(id);
      if (!isFinite(t) || t < 0) t = 0;
      if (id === "wage_mult") return "Wages x" + Game.Prestige.getWageMultiplier().toFixed(2);
      if (id === "job_xp") return "Job XP x" + Game.Prestige.getJobXpMultiplier().toFixed(2);
      if (id === "course_speed") return "Course speed x" + Game.Prestige.getCourseSpeedMultiplier().toFixed(2);
      if (id === "tuition_discount") return "Tuition x" + Game.Prestige.getTuitionDiscountMultiplier().toFixed(2);
      if (id === "travel_discount") return "Travel cost x" + Game.Prestige.getTravelCostMultiplier().toFixed(2);
      if (id === "energy_cap") return "Max energy +" + Game.Prestige.getEnergyCapBonus();
      if (id === "home_heal") return "Home recovery x" + Game.Prestige.getHomeHealMultiplier().toFixed(2);
      if (id === "meal_storage") return "Meal storage +" + Game.Prestige.getMealStorageBonus();
      if (id === "tenant_rent") return "Tenant rent x" + Game.Prestige.getTenantRentMultiplier().toFixed(2);
      if (id === "company_rev") return "Company revenue x" + Game.Prestige.getCompanyRevenueMultiplier().toFixed(2);
      if (id === "bank_interest") return "Deposit interest x" + Game.Prestige.getDepositInterestMultiplier().toFixed(2);
      if (id === "btc_yield") return "Mining yield x" + Game.Prestige.getMiningYieldMultiplier().toFixed(2);
      if (id === "power_saver") return "Mining power cost x" + Game.Prestige.getMiningPowerCostMultiplier().toFixed(2);
      if (id === "start_cash") return "Start cash +$" + Game.Prestige.getStartingCashBonus();
      if (id === "start_btc") return "Start BTC +" + Game.Prestige.getStartingBtcBonus().toFixed(8) + " BTC";
      if (id === "shift_eff") return "Work energy x" + Game.Prestige.getWorkEnergyCostMultiplier().toFixed(2);
      if (id === "lxp_gain") return "Prestige LXP x" + Game.Prestige.getLxpEarnMultiplier().toFixed(2);
      if (id === "lxp_overflow") return "Overflow cap " + Game.Prestige.getLxpOverflowCap();
      if (id === "lxp_flat") return "Prestige LXP +" + Game.Prestige.getLxpFlatBonus();
      if (id === "lxp_relic") return "Prestige LXP x" + Game.Prestige.getLxpEarnMultiplier().toFixed(2);
      if (id === "lxp_crown") return "Prestige LXP x" + Game.Prestige.getLxpEarnMultiplier().toFixed(2);
      if (id === "lxp_vault") return "Prestige LXP +" + Game.Prestige.getLxpFlatBonus();
      return "—";
    },

    getUpgradeEffectTextForTier: function (id, tier) {
      Game.Prestige.ensureState();
      var cur = Game.Prestige.getUpgradeTier(id);
      Game.state.prestige.upgrades[id] = Math.max(0, Math.floor(tier));
      var out = Game.Prestige.getUpgradeEffectText(id, tier);
      Game.state.prestige.upgrades[id] = cur;
      return out;
    },

    recordEduJobRun: function (jobId) {
      Game.Prestige.ensureState();
      var id = String(jobId || "");
      if (!id || id === "none") return;
      var r = Game.state.prestigeRun;
      var before = r.eduJobRunsById[id];
      if (typeof before !== "number" || !isFinite(before) || before < 0) before = 0;
      r.eduJobRunsById[id] = before + 1;
      r.eduRunsTotal += 1;
    },

    recordEduCourseRun: function (courseId) {
      Game.Prestige.ensureState();
      var id = String(courseId || "");
      if (!id) return;
      var r = Game.state.prestigeRun;
      var before = r.eduCourseRunsById[id];
      if (typeof before !== "number" || !isFinite(before) || before < 0) before = 0;
      r.eduCourseRunsById[id] = before + 1;
      r.eduRunsTotal += 1;
    },

    getCryptoTotalsUsd: function () {
      var s = Game.state || {};
      var btcPrice = (s.btc && s.btc.exchange && typeof s.btc.exchange.priceUsd === "number") ? s.btc.exchange.priceUsd : 30000;
      var btcConfirmed = typeof s.btcBalance === "number" && isFinite(s.btcBalance) ? s.btcBalance : 0;
      var btcUnconfirmed = typeof s.unconfirmedBtc === "number" && isFinite(s.unconfirmedBtc) ? s.unconfirmedBtc : 0;
      var btcTotal = btcConfirmed + btcUnconfirmed;
      var btcUsd = btcTotal * btcPrice;

      var altUsd = 0;
      if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
      var coins = (s.crypto && s.crypto.coins) ? s.crypto.coins : {};
      for (var cid in coins) {
        if (!Object.prototype.hasOwnProperty.call(coins, cid)) continue;
        var c = coins[cid];
        if (!c) continue;
        var bal = (typeof c.balance === "number" && isFinite(c.balance)) ? c.balance : 0;
        var unc = (typeof c.unconfirmed === "number" && isFinite(c.unconfirmed)) ? c.unconfirmed : 0;
        var price = (c.exchange && typeof c.exchange.priceUsd === "number" && isFinite(c.exchange.priceUsd)) ? c.exchange.priceUsd : 0;
        altUsd += (bal + unc) * price;
      }
      return { btcUsd: btcUsd, altUsd: altUsd, totalUsd: btcUsd + altUsd, btcPrice: btcPrice };
    },

    getNetWorthUsd: function () {
      var s = Game.state || {};
      var worth = 0;
      if (typeof s.money === "number" && isFinite(s.money)) worth += s.money;
      if (s.bank && typeof s.bank.depositBalance === "number" && isFinite(s.bank.depositBalance)) worth += s.bank.depositBalance;
      if (s.companies) {
        if (s.companies.miningCorp && typeof s.companies.miningCorp.funds === "number" && isFinite(s.companies.miningCorp.funds)) worth += s.companies.miningCorp.funds;
        if (s.companies.retailShop && typeof s.companies.retailShop.funds === "number" && isFinite(s.companies.retailShop.funds)) worth += s.companies.retailShop.funds;
        if (s.companies.retailShop && typeof s.companies.retailShop.inventoryValue === "number" && isFinite(s.companies.retailShop.inventoryValue)) worth += s.companies.retailShop.inventoryValue;
      }
      if (Array.isArray(s.properties) && window.Game && Game.Property && Game.Property.getPropertyDef) {
        for (var i = 0; i < s.properties.length; i++) {
          var prop = s.properties[i];
          if (!prop || !prop.id) continue;
          var def = Game.Property.getPropertyDef(prop.id);
          if (def && typeof def.price === "number" && isFinite(def.price)) worth += def.price;
        }
      }
      var crypto = Game.Prestige.getCryptoTotalsUsd();
      worth += crypto.totalUsd;
      if (s.bank && typeof s.bank.loanPrincipal === "number" && isFinite(s.bank.loanPrincipal)) worth -= s.bank.loanPrincipal;
      return worth;
    },

    getBankBalanceUsd: function () {
      var s = Game.state || {};
      return (s.bank && typeof s.bank.depositBalance === "number" && isFinite(s.bank.depositBalance)) ? s.bank.depositBalance : 0;
    },

    getCompanyBalancesUsd: function () {
      var s = Game.state || {};
      var total = 0;
      var c = s.companies || {};
      if (c.miningCorp && typeof c.miningCorp.funds === "number" && isFinite(c.miningCorp.funds)) total += c.miningCorp.funds;
      if (c.retailShop && typeof c.retailShop.funds === "number" && isFinite(c.retailShop.funds)) total += c.retailShop.funds;
      // Include retail stock value as a company-held balance/value bucket.
      if (c.retailShop && typeof c.retailShop.inventoryValue === "number" && isFinite(c.retailShop.inventoryValue)) total += c.retailShop.inventoryValue;
      return total;
    },

    getMonthsLived: function () {
      var s = Game.state || {};
      var day = (typeof s.day === "number" && isFinite(s.day)) ? s.day : 1;
      if (day < 1) day = 1;
      return 1 + Math.floor((day - 1) / 30);
    },

    getQuestCompletionCounts: function () {
      var s = Game.state || {};
      var claimed = (s.quests && s.quests.claimed && typeof s.quests.claimed === "object") ? s.quests.claimed : {};
      var total = 0;
      var unique = 0;
      for (var k in claimed) {
        if (!Object.prototype.hasOwnProperty.call(claimed, k)) continue;
        var n = claimed[k];
        if (typeof n !== "number" || !isFinite(n) || n <= 0) continue;
        unique += 1;
        total += Math.floor(n);
      }
      return { total: total, unique: unique };
    },

    calculateScore: function () {
      Game.Prestige.ensureState();
      var s = Game.state;
      var cfg = Game.Prestige.config.scoreParts;

      var crypto = Game.Prestige.getCryptoTotalsUsd();
      var btcUsd = crypto.btcUsd;
      var altUsd = crypto.altUsd;
      var cash = (typeof s.money === "number" && isFinite(s.money)) ? s.money : 0;
      var netWorth = Game.Prestige.getNetWorthUsd();
      var bankBal = Game.Prestige.getBankBalanceUsd();
      var companyBal = Game.Prestige.getCompanyBalancesUsd();
      var months = Game.Prestige.getMonthsLived();
      var questCounts = Game.Prestige.getQuestCompletionCounts();
      var eduLevel = (s.education && typeof s.education.level === "number" && isFinite(s.education.level)) ? s.education.level : 0;
      if (eduLevel < 0) eduLevel = 0;
      var eduRuns = (s.prestigeRun && typeof s.prestigeRun.eduRunsTotal === "number" && isFinite(s.prestigeRun.eduRunsTotal)) ? s.prestigeRun.eduRunsTotal : 0;
      if (eduRuns < 0) eduRuns = 0;

      function part(def, raw) {
        if (!def) return 0;
        var pivot = typeof def.pivot === "number" && def.pivot > 0 ? def.pivot : 1;
        var exp = typeof def.exponent === "number" && def.exponent > 0 ? def.exponent : 1;
        var baseMax = typeof def.baseMax === "number" && def.baseMax > 0 ? def.baseMax : 0;
        var overflowMax = typeof def.overflowMax === "number" && def.overflowMax > 0 ? def.overflowMax : 0;
        var overflowPivotMult = typeof def.overflowPivotMult === "number" && def.overflowPivotMult > 0 ? def.overflowPivotMult : 10;
        var overflowExp = typeof def.overflowExponent === "number" && def.overflowExponent > 0 ? def.overflowExponent : 1;

        var v = typeof raw === "number" ? raw : 0;
        if (!isFinite(v)) v = 0;
        var sign = v < 0 ? -1 : 1;
        var mag = Math.abs(v);
        if (!isFinite(mag) || mag <= 0) return 0;

        // Main component: soft-cap to baseMax using a log-shaped curve.
        var baseShape = softLogScore(mag, pivot, exp);
        var baseNorm = softLogScore(pivot, pivot, exp);
        var baseRatio = baseNorm > 0 ? (baseShape / (2 * baseNorm)) : 0;
        baseRatio = clamp(baseRatio, 0, 1);
        var base = baseMax * baseRatio;

        // Overflow component: continues scaling slowly without blowing up.
        var overflow = overflowMax * softLogScore(mag, pivot * overflowPivotMult, overflowExp);
        return sign * (base + overflow);
      }

      var breakdown = {};
      breakdown.btcValueUsd = { raw: btcUsd, score: part(cfg.btcValueUsd, btcUsd), hint: cfg.btcValueUsd.hint };
      breakdown.altValueUsd = { raw: altUsd, score: part(cfg.altValueUsd, altUsd), hint: cfg.altValueUsd.hint };
      breakdown.cashUsd = { raw: cash, score: part(cfg.cashUsd, cash), hint: cfg.cashUsd.hint };
      breakdown.bankBalanceUsd = { raw: bankBal, score: part(cfg.bankBalanceUsd, bankBal), hint: cfg.bankBalanceUsd.hint };
      breakdown.companyBalancesUsd = { raw: companyBal, score: part(cfg.companyBalancesUsd, companyBal), hint: cfg.companyBalancesUsd.hint };
      breakdown.netWorthUsd = { raw: netWorth, score: part(cfg.netWorthUsd, netWorth), hint: cfg.netWorthUsd.hint };
      breakdown.educationLevel = { raw: eduLevel, score: part(cfg.educationLevel, eduLevel), hint: cfg.educationLevel.hint };
      breakdown.eduRuns = { raw: eduRuns, score: part(cfg.eduRuns, eduRuns), hint: cfg.eduRuns.hint };
      breakdown.monthsLived = { raw: months, score: part(cfg.monthsLived, months), hint: cfg.monthsLived.hint };
      breakdown.questsCompleted = { raw: questCounts.total, score: part(cfg.questsCompleted, questCounts.total), hint: cfg.questsCompleted.hint, unique: questCounts.unique };

      var total = 0;
      for (var k in breakdown) {
        if (!Object.prototype.hasOwnProperty.call(breakdown, k)) continue;
        total += (breakdown[k].score || 0);
      }
      var score = Math.max(0, Math.floor(total));
      var target = Math.max(1, Math.floor(Game.state.prestige.targetScore || Game.Prestige.config.baseTargetScore));
      return { score: score, target: target, breakdown: breakdown, btcPrice: crypto.btcPrice, netWorthUsd: netWorth, cryptoUsd: crypto.totalUsd };
    },

    getPointsForScore: function (score, target) {
      Game.Prestige.ensureState();
      var s = typeof score === "number" ? score : 0;
      var t = typeof target === "number" ? target : Game.Prestige.config.baseTargetScore;
      if (!isFinite(s) || s < 0) s = 0;
      if (!isFinite(t) || t <= 0) t = Game.Prestige.config.baseTargetScore;
      if (s < t) return { ok: false, points: 0, tierLabel: "Locked", multReached: 0 };
      var tiers = Game.Prestige.config.pointsTiers;
      var mult = s / t;
      var pts = 0;
      var bestLabel = tiers[0].label;
      var reached = 1.0;
      for (var i = 0; i < tiers.length; i++) {
        if (mult >= tiers[i].mult) {
          pts += tiers[i].points;
          bestLabel = tiers[i].label;
          reached = tiers[i].mult;
        }
      }
      // Small overflow bonus that grows very slowly (prevents "dead" overcap).
      var overflow = Math.max(0, s - t);
      var overflowPts = Math.floor(log10(1 + overflow / Math.max(1, t)) * 2);
      var overflowCap = Game.Prestige.getLxpOverflowCap();
      pts += clamp(overflowPts, 0, overflowCap);

      var basePoints = Math.max(0, Math.floor(pts * 3));
      var flatBonus = Game.Prestige.getLxpFlatBonus();
      var pointsMult = Game.Prestige.getLxpEarnMultiplier();
      var globalMultiplier = 9;
      var finalPoints = Math.max(0, Math.floor((basePoints + flatBonus) * pointsMult * globalMultiplier));

      return {
        ok: true,
        points: finalPoints,
        basePoints: basePoints,
        flatBonus: flatBonus,
        pointsMult: pointsMult,
        overflowCap: overflowCap,
        tierLabel: bestLabel,
        multReached: reached
      };
    },

    canPrestigeNow: function () {
      var calc = Game.Prestige.calculateScore();
      return calc.score >= calc.target;
    },

    // --- Upgrade effects (kept small, capped, and centralized) ---
    getWageMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("wage_mult");
      return clamp(1 + t * 0.01, 1, 3.0);
    },
    getJobXpMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("job_xp");
      return clamp(1 + t * 0.012, 1, 3.5);
    },
    getCourseSpeedMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("course_speed");
      return clamp(1 + t * 0.01, 1, 3.0);
    },
    getTuitionDiscountMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("tuition_discount");
      var disc = clamp(t * 0.006, 0, 0.60);
      return 1 - disc;
    },
    getTravelCostMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("travel_discount");
      var disc = clamp(t * 0.01, 0, 0.50);
      return 1 - disc;
    },
    getEnergyCapBonus: function () {
      var t = Game.Prestige.getUpgradeTier("energy_cap");
      return Math.floor(t);
    },
    getHomeHealMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("home_heal");
      return clamp(1 + t * 0.01, 1, 2.0);
    },
    getMealStorageBonus: function () {
      var t = Game.Prestige.getUpgradeTier("meal_storage");
      return Math.floor(t);
    },
    getTenantRentMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("tenant_rent");
      return clamp(1 + t * 0.0065, 1, 3.0);
    },
    getCompanyRevenueMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("company_rev");
      return clamp(1 + t * 0.0065, 1, 3.0);
    },
    getDepositInterestMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("bank_interest");
      return clamp(1 + t * 0.01, 1, 3.0);
    },
    getMiningYieldMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("btc_yield");
      return clamp(1 + t * 0.0125, 1, 3.0);
    },
    getMiningPowerCostMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("power_saver");
      var disc = clamp(t * 0.0045, 0, 0.60);
      return 1 - disc;
    },
    getStartingCashBonus: function () {
      var t = Game.Prestige.getUpgradeTier("start_cash");
      return Math.floor(t * 60);
    },
    getStartingBtcBonus: function () {
      var t = Game.Prestige.getUpgradeTier("start_btc");
      return t * 0.000005;
    },
    getWorkEnergyCostMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("shift_eff");
      var disc = clamp(t * 0.0035, 0, 0.35);
      return 1 - disc;
    },
    getLxpEarnMultiplier: function () {
      var t = Game.Prestige.getUpgradeTier("lxp_gain");
      var baseBonus = clamp(t * 0.06, 0, 0.60);
      var relic = Game.Prestige.getUpgradeTier("lxp_relic") > 0 ? 0.15 : 0;
      var crown = Game.Prestige.getUpgradeTier("lxp_crown") > 0 ? 0.35 : 0;
      return clamp(1 + baseBonus + relic + crown, 1, 3.0);
    },
    getLxpOverflowCap: function () {
      var t = Game.Prestige.getUpgradeTier("lxp_overflow");
      return 6 + clamp(Math.floor(t), 0, 8);
    },
    getLxpFlatBonus: function () {
      var t = Game.Prestige.getUpgradeTier("lxp_flat");
      var vault = Game.Prestige.getUpgradeTier("lxp_vault") > 0 ? 3 : 0;
      return Math.max(0, Math.floor(t) + vault);
    },

    performPrestige: function () {
      Game.Prestige.ensureState();
      var calc = Game.Prestige.calculateScore();
      if (calc.score < calc.target) {
        return { ok: false, message: "Prestige locked. Reach the target score first." };
      }

      var ptsInfo = Game.Prestige.getPointsForScore(calc.score, calc.target);
      var pointsEarned = ptsInfo.ok ? ptsInfo.points : 0;

      var old = Game.state;
      var oldPrestige = JSON.parse(JSON.stringify(old.prestige || {}));
      var oldUpgrades = (oldPrestige.upgrades && typeof oldPrestige.upgrades === "object") ? JSON.parse(JSON.stringify(oldPrestige.upgrades)) : {};
      var oldPoints = typeof oldPrestige.points === "number" ? oldPrestige.points : 0;
      var prevTarget = typeof oldPrestige.targetScore === "number" ? oldPrestige.targetScore : Game.Prestige.config.baseTargetScore;

      // Build a clean new run state.
      var next = JSON.parse(JSON.stringify(Game.stateTemplate));

      // Preserve meta-progression and set new target equal to the score just achieved.
      var achieved = Math.max(1, Math.floor(calc.score));
      next.prestige.points = Math.max(0, Math.floor(oldPoints + pointsEarned));
      next.prestige.totalPrestiges = Math.max(0, Math.floor((oldPrestige.totalPrestiges || 0) + 1));
      next.prestige.lastPrestigeScore = achieved;
      next.prestige.lastPrestigePointsEarned = pointsEarned;
      next.prestige.targetScore = achieved; // requested: next target = previous run's score
      next.prestige.upgrades = oldUpgrades;

      // Apply safe starting bonuses from upgrades.
      next.money = (typeof next.money === "number" ? next.money : 0) + Game.Prestige.getStartingCashBonus();
      next.btcBalance = (typeof next.btcBalance === "number" ? next.btcBalance : 0) + Game.Prestige.getStartingBtcBonus();

      // Preserve a few UX settings if present.
      if (typeof old.notificationToastSeconds === "number" && isFinite(old.notificationToastSeconds)) {
        next.notificationToastSeconds = old.notificationToastSeconds;
      }

      Game.state = next;

      // Ensure downstream modules have any derived state they expect.
      if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
      if (Game.Btc && Game.Btc.ensureWalletState) Game.Btc.ensureWalletState();
      if (Game.Btc && Game.Btc.ensureChainState) Game.Btc.ensureChainState();
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      if (Game.Companies && Game.Companies.ensureState) Game.Companies.ensureState();
      if (Game.Bank && Game.Bank.getState) Game.Bank.getState();
      Game.Prestige.ensureState();

      if (Game.addNotification) {
        Game.addNotification("Prestiged! +" + pointsEarned + " Life Experience Point" + (pointsEarned === 1 ? "" : "s") + ". New target: " + achieved + ".");
      }
      if (Game.save) Game.save(true);

      return { ok: true, pointsEarned: pointsEarned, achievedScore: achieved, prevTarget: prevTarget };
    }
  };
})();
