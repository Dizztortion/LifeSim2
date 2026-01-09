(function () {
  if (!window.UI) return;

  UI.Debug = UI.Debug || {};

  UI.Debug.ensureState = function () {
    if (!window.Game || !Game.state) return;
    if (!Game.state.debug || typeof Game.state.debug !== "object") {
      Game.state.debug = { unlocked: false, tickRateMult: 1, btcMiningMultiplier: 1 };
    }
    if (typeof Game.state.debug.unlocked !== "boolean") Game.state.debug.unlocked = false;
    if (typeof Game.state.debug.tickRateMult !== "number" || !isFinite(Game.state.debug.tickRateMult)) Game.state.debug.tickRateMult = 1;
    if (typeof Game.state.debug.btcMiningMultiplier !== "number" || !isFinite(Game.state.debug.btcMiningMultiplier)) Game.state.debug.btcMiningMultiplier = 1;
  };

  UI.Debug.getTickRateMult = function () {
    UI.Debug.ensureState();
    var m = (Game.state && Game.state.debug) ? Game.state.debug.tickRateMult : 1;
    if (typeof m !== "number" || !isFinite(m)) m = 1;
    if (m < 0) m = 0;
    if (m > 50) m = 50;
    return m;
  };

  UI.Debug.setTickRateMult = function (val) {
    UI.Debug.ensureState();
    var m = typeof val === "number" ? val : parseFloat(val);
    if (!isFinite(m)) m = 1;
    if (m < 0) m = 0;
    if (m > 50) m = 50;
    Game.state.debug.tickRateMult = m;
  };

  UI.Debug.getMiningMult = function () {
    UI.Debug.ensureState();
    var m = (Game.state && Game.state.debug) ? Game.state.debug.btcMiningMultiplier : 1;
    if (typeof m !== "number" || !isFinite(m)) m = 1;
    if (m < 0) m = 0;
    if (m > 1000) m = 1000;
    return m;
  };

  UI.Debug.setMiningMult = function (val) {
    UI.Debug.ensureState();
    var m = typeof val === "number" ? val : parseFloat(val);
    if (!isFinite(m)) m = 1;
    if (m < 0) m = 0;
    if (m > 1000) m = 1000;
    Game.state.debug.btcMiningMultiplier = m;
  };

  UI.Debug._fmt = function (n, dp) {
    var x = typeof n === "number" ? n : 0;
    if (!isFinite(x)) x = 0;
    var d = typeof dp === "number" ? dp : 2;
    return x.toFixed(d);
  };

  UI.Debug._safeMoney = function (val) {
    var x = typeof val === "number" ? val : parseFloat(val);
    if (!isFinite(x)) x = 0;
    if (x < 0) x = 0;
    if (x > 1000000000000) x = 1000000000000;
    return x;
  };

  UI.Debug._safeInt = function (val, min, max) {
    var x = typeof val === "number" ? val : parseInt(val, 10);
    if (!isFinite(x)) x = 0;
    x = Math.floor(x);
    if (typeof min === "number" && x < min) x = min;
    if (typeof max === "number" && x > max) x = max;
    return x;
  };

  UI.Debug._getInGameSecondsPerDay = function () {
    // main.js uses 0.5 in-game minutes per (effective) second.
    // 24h * 60m = 1440 in-game minutes -> 2880 seconds per in-game day.
    return 2880;
  };

  UI.Debug.getMiningBreakdown = function () {
    UI.Debug.ensureState();
    var tickMult = UI.Debug.getTickRateMult();
    var miningMult = UI.Debug.getMiningMult();
    var secondsPerInGameDay = UI.Debug._getInGameSecondsPerDay();
    var inGameDaysPerRealHour = tickMult * (3600 / secondsPerInGameDay);
    if (!isFinite(inGameDaysPerRealHour) || inGameDaysPerRealHour < 0) inGameDaysPerRealHour = 0;

    var base = 0.00000000035;
    var pc = { on: false, hashrate: 0, btcPerSecond: 0, perDay: 0 };
    var rig = { on: false, rigs: 0, rigHashrate: 0, suiteMult: 1, hashrate: 0, btcPerSecond: 0, perDay: 0 };
    var cloud = { active: 0, perDay: 0 };

    // PC mining (BTC only; altcoins ignored for this breakdown)
    if (Game.Btc && Game.Btc.ensurePcMinerState && Game.Btc.getPcMinerStats && Game.state && Game.state.btc && Game.state.btc.pcMiner) {
      Game.Btc.ensurePcMinerState();
      var pm = Game.state.btc.pcMiner;
      pc.on = !!pm.isOn && String(pm.coinId || "BTC").toUpperCase() === "BTC";
      var stats = Game.Btc.getPcMinerStats();
      pc.hashrate = stats && typeof stats.hashrate === "number" ? stats.hashrate : 0;
      pc.btcPerSecond = pc.hashrate * base * miningMult;
      pc.perDay = pc.btcPerSecond * secondsPerInGameDay;
    }

    // Rigs
    if (Game.state && Game.state.btc && Game.state.btc.mining) {
      var m = Game.state.btc.mining;
      rig.rigs = typeof m.rigsOwned === "number" ? m.rigsOwned : 0;
      rig.rigHashrate = typeof m.rigHashrate === "number" ? m.rigHashrate : 0;
      rig.on = rig.rigs > 0 && !!m.isPowerOn;
      rig.suiteMult = (Game.Btc && Game.Btc.getMinerSoftwareMult) ? Game.Btc.getMinerSoftwareMult() : 1;
      rig.hashrate = rig.rigs * rig.rigHashrate * rig.suiteMult;
      rig.btcPerSecond = rig.hashrate * base * miningMult;
      rig.perDay = rig.btcPerSecond * secondsPerInGameDay;
    }

    // Cloud contracts (dailyBtc is already per in-game day)
    if (Game.state && Game.state.btc && Game.state.btc.cloud && Array.isArray(Game.state.btc.cloud.contracts)) {
      var cs = Game.state.btc.cloud.contracts;
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        if (!c || !(c.daysLeft > 0)) continue;
        cloud.active += 1;
        var db = typeof c.dailyBtc === "number" ? c.dailyBtc : 0;
        if (db > 0) cloud.perDay += db * miningMult;
      }
    }

    var totalPerDay = (pc.perDay || 0) + (rig.perDay || 0) + (cloud.perDay || 0);
    var totalPerRealHour = totalPerDay * inGameDaysPerRealHour;

    var ex = (Game.Btc && Game.Btc.getExchange) ? Game.Btc.getExchange() : null;
    var priceUsd = ex && typeof ex.priceUsd === "number" ? ex.priceUsd : 0;
    var totalUsdPerDay = priceUsd > 0 ? (totalPerDay * priceUsd) : 0;
    var totalUsdPerRealHour = priceUsd > 0 ? (totalPerRealHour * priceUsd) : 0;

    return {
      tickMult: tickMult,
      miningMult: miningMult,
      secondsPerInGameDay: secondsPerInGameDay,
      inGameDaysPerRealHour: inGameDaysPerRealHour,
      baseBtcPerHashSecond: base,
      pc: pc,
      rig: rig,
      cloud: cloud,
      totalPerDay: totalPerDay,
      totalPerRealHour: totalPerRealHour,
      priceUsd: priceUsd,
      totalUsdPerDay: totalUsdPerDay,
      totalUsdPerRealHour: totalUsdPerRealHour
    };
  };

  UI.Debug.getPrestigeSnapshot = function () {
    var out = {
      availablePoints: 0,
      totalPrestiges: 0,
      score: 0,
      target: 1,
      ready: false,
      tierLabel: "—",
      pointsIfPrestigeNow: 0,
      pointsAtTarget: 0
    };
    if (!window.Game || !Game.state) return out;
    if (!Game.Prestige || typeof Game.Prestige.ensureState !== "function") return out;
    Game.Prestige.ensureState();
    var p = Game.state.prestige || {};
    out.availablePoints = Math.max(0, Math.floor(typeof p.points === "number" && isFinite(p.points) ? p.points : 0));
    out.totalPrestiges = Math.max(0, Math.floor(typeof p.totalPrestiges === "number" && isFinite(p.totalPrestiges) ? p.totalPrestiges : 0));
    var calc = (typeof Game.Prestige.calculateScore === "function") ? Game.Prestige.calculateScore() : { score: 0, target: 1 };
    out.score = Math.max(0, Math.floor(typeof calc.score === "number" && isFinite(calc.score) ? calc.score : 0));
    out.target = Math.max(1, Math.floor(typeof calc.target === "number" && isFinite(calc.target) ? calc.target : (p.targetScore || 1)));
    out.ready = out.score >= out.target;
    if (typeof Game.Prestige.getPointsForScore === "function") {
      var nowInfo = Game.Prestige.getPointsForScore(out.score, out.target) || {};
      var atInfo = Game.Prestige.getPointsForScore(out.target, out.target) || {};
      out.pointsIfPrestigeNow = Math.max(0, Math.floor(typeof nowInfo.points === "number" && isFinite(nowInfo.points) ? nowInfo.points : 0));
      out.pointsAtTarget = Math.max(0, Math.floor(typeof atInfo.points === "number" && isFinite(atInfo.points) ? atInfo.points : 0));
      out.tierLabel = nowInfo.tierLabel ? String(nowInfo.tierLabel) : "—";
    }
    return out;
  };

  UI.Debug.getNowTimeSnapshot = function () {
    var out = { day: 1, clock: "00:00", monthYear: "" };
    if (!window.Game || !Game.state) return out;
    var day = (typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 1;
    if (day < 1) day = 1;
    out.day = day;
    out.clock = (Game.getClockString && typeof Game.getClockString === "function") ? Game.getClockString() : "00:00";
    out.monthYear = (Game.getMonthYearString && typeof Game.getMonthYearString === "function") ? Game.getMonthYearString() : "";
    return out;
  };

  UI.Debug.getCasinoSnapshot = function () {
    var out = { tokensUsd: 0, ownedMachines: 0, freeSpins: 0, freeSpinsClaimDay: 0 };
    if (!window.Game || !Game.state) return out;
    if (!Game.Casino || typeof Game.Casino.ensureState !== "function") return out;
    Game.Casino.ensureState();
    var c = Game.state.casino || {};
    out.tokensUsd = (typeof c.balanceUsd === "number" && isFinite(c.balanceUsd)) ? c.balanceUsd : 0;
    if (out.tokensUsd < 0) out.tokensUsd = 0;
    var slots = c.slots || {};
    out.ownedMachines = (typeof slots.ownedMachines === "number" && isFinite(slots.ownedMachines)) ? Math.floor(slots.ownedMachines) : 0;
    if (out.ownedMachines < 0) out.ownedMachines = 0;
    out.freeSpins = (typeof slots.freeSpins === "number" && isFinite(slots.freeSpins)) ? Math.floor(slots.freeSpins) : 0;
    if (out.freeSpins < 0) out.freeSpins = 0;
    out.freeSpinsClaimDay = (typeof slots.freeSpinsClaimDay === "number" && isFinite(slots.freeSpinsClaimDay)) ? Math.floor(slots.freeSpinsClaimDay) : 0;
    if (out.freeSpinsClaimDay < 0) out.freeSpinsClaimDay = 0;
    return out;
  };

  UI.Debug.renderMenuBody = function () {
    UI.Debug.ensureState();
    var tickMult = UI.Debug.getTickRateMult();
    var miningMult = UI.Debug.getMiningMult();
    var s = Game.state || {};
    var money = typeof s.money === "number" ? s.money : 0;
    var bank = (s.bank && typeof s.bank.depositBalance === "number") ? s.bank.depositBalance : 0;
    var btc = typeof s.btcBalance === "number" ? s.btcBalance : 0;
    var ubtc = typeof s.unconfirmedBtc === "number" ? s.unconfirmedBtc : 0;
    var eduLvl = (s.education && typeof s.education.level === "number") ? s.education.level : 0;
    var eduXp = (s.education && typeof s.education.xp === "number") ? s.education.xp : 0;

    var jobs = (Game.Jobs && Game.Jobs.defs) ? Game.Jobs.defs : {};
    var currentJob = (s.job && typeof s.job.current === "string") ? s.job.current : "none";

    var breakdown = UI.Debug.getMiningBreakdown();
    var prestigeSnap = UI.Debug.getPrestigeSnapshot();
    var timeSnap = UI.Debug.getNowTimeSnapshot();
    var casinoSnap = UI.Debug.getCasinoSnapshot();
    var tickLabel = (tickMult === 0) ? "Paused" : ("x" + UI.Debug._fmt(tickMult, 2));
    var realSecPerDay = tickMult > 0 ? (breakdown.secondsPerInGameDay / tickMult) : 0;
    var realMinPerDay = realSecPerDay / 60;

    var html = [];
    html.push('<div class="card-section small dim" style="margin-top:10px;">Unlocked via code <span class="mono">DSOLVE</span>. Changes apply immediately and can break balance/progression.</div>');
    html.push('<div class="grid mt-8">');

    // Time
    html.push('<div class="card">');
    html.push('<div class="card-title">Time Control</div>');
    html.push('<div class="card-section">');
    html.push('<div class="notice" style="background:linear-gradient(135deg, rgba(120,180,255,0.10), rgba(255,255,255,0.03));border:1px solid rgba(120,180,255,0.18);">');
    html.push('<div class="field-row"><span>Tick rate</span><span class="mono" id="dbg-tick-label">' + tickLabel + "</span></div>");
    html.push('<div class="field-row"><span>Real time per in-game day</span><span class="mono" id="dbg-real-per-day">' + (tickMult > 0 ? UI.Debug._fmt(realMinPerDay, 2) + " min" : "∞") + "</span></div>");
    html.push('<div class="field-row"><span>In-game days per real hour</span><span class="mono" id="dbg-days-per-hour">' + UI.Debug._fmt(breakdown.inGameDaysPerRealHour, 2) + "</span></div>");
    html.push("</div>");
    html.push('<div class="mt-8">');
    html.push('<input id="dbg-tick-range" type="range" min="0" max="20" step="0.1" value="' + tickMult + '" style="width:100%;">');
    html.push('<div class="field-row mt-4"><span>Multiplier</span><span class="mono"><input id="dbg-tick-input" type="number" min="0" max="50" step="0.1" value="' + tickMult + '" style="width:90px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> x</span></div>');
    html.push('<div class="mt-8">');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="0">Pause</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="0.5">0.5x</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="1">1x</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="2">2x</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="5">5x</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-tick="10">10x</button>');
    html.push("</div>");
    html.push("</div>");
    html.push("</div>");
    html.push("</div>");

    // Time jump
    html.push('<div class="card">');
    html.push('<div class="card-title">Time Jump</div>');
    html.push('<div class="card-section small dim">Advance time using the normal day cycle (daily handlers still run).</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Now</span><span class="mono">Day <span id="dbg-now-day">' + timeSnap.day + '</span>, <span id="dbg-now-clock">' + timeSnap.clock + "</span></span></div>");
    if (timeSnap.monthYear) {
      html.push('<div class="field-row"><span>Date</span><span class="mono" id="dbg-now-monthyear">' + timeSnap.monthYear + "</span></div>");
    }
    html.push('<div class="field-row mt-8"><span>Advance</span><span class="mono"><input id="dbg-advance-minutes" type="number" min="1" step="1" value="60" style="width:90px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> min</span></div>');
    html.push('<div class="mt-8">');
    html.push('<button class="btn btn-small btn-primary" id="dbg-advance-apply">Advance</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-advance="60">+1h</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-advance="360">+6h</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-advance="1440">+1d</button>');
    html.push(' <span class="small dim" id="dbg-advance-msg"></span>');
    html.push("</div>");
    html.push("</div>");
    html.push("</div>");

    // Balances
    html.push('<div class="card">');
    html.push('<div class="card-title">Balances</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Money</span><span class="mono">$<input id="dbg-money" type="number" step="0.01" value="' + UI.Debug._fmt(money, 2) + '" style="width:120px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Bank deposit</span><span class="mono">$<input id="dbg-bank" type="number" step="0.01" value="' + UI.Debug._fmt(bank, 2) + '" style="width:120px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>BTC confirmed</span><span class="mono"><input id="dbg-btc" type="number" step="0.00000001" value="' + UI.Debug._fmt(btc, 8) + '" style="width:140px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> BTC</span></div>');
    html.push('<div class="field-row"><span>BTC unconfirmed</span><span class="mono"><input id="dbg-ubtc" type="number" step="0.00000001" value="' + UI.Debug._fmt(ubtc, 8) + '" style="width:140px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> BTC</span></div>');
    html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-apply-balances">Apply balances</button> <span class="small dim" id="dbg-bal-msg"></span></div>');
    html.push("</div>");
    html.push("</div>");

    // Prestige
    html.push('<div class="card">');
    html.push('<div class="card-title">Prestige (LXP)</div>');
    html.push('<div class="card-section small dim">Adjust Life Experience Points and upgrade tiers. This can permanently break progression.</div>');
    html.push('<div class="card-section">');
    html.push('<div class="notice" style="background:linear-gradient(135deg, rgba(200,120,255,0.10), rgba(255,255,255,0.03));border:1px solid rgba(200,120,255,0.18);">');
    html.push('<div class="field-row"><span>Available LXP</span><span class="mono" id="dbg-prestige-points">' + prestigeSnap.availablePoints + "</span></div>");
    html.push('<div class="field-row"><span>Total prestiges</span><span class="mono" id="dbg-prestige-total">' + prestigeSnap.totalPrestiges + "</span></div>");
    html.push('<div class="field-row"><span>Score / Target</span><span class="mono"><span id="dbg-prestige-score">' + prestigeSnap.score + '</span> / <span id="dbg-prestige-target-label">' + prestigeSnap.target + "</span></span></div>");
    html.push('<div class="field-row"><span>Status</span><span class="mono" id="dbg-prestige-ready">' + (prestigeSnap.ready ? ("READY • " + prestigeSnap.tierLabel) : "Not ready") + "</span></div>");
    html.push('<div class="field-row"><span>Reward now</span><span class="mono" id="dbg-prestige-reward-now">+' + prestigeSnap.pointsIfPrestigeNow + " LXP</span></div>");
    html.push('<div class="field-row"><span>Reward at target</span><span class="mono" id="dbg-prestige-reward-target">+' + prestigeSnap.pointsAtTarget + " LXP</span></div>");
    html.push("</div>");

    html.push('<div class="field-row mt-8"><span>Set available LXP</span><span class="mono"><input id="dbg-prestige-set-points" type="number" min="0" step="1" value="' + prestigeSnap.availablePoints + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Set total prestiges</span><span class="mono"><input id="dbg-prestige-set-total" type="number" min="0" step="1" value="' + prestigeSnap.totalPrestiges + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Set target score</span><span class="mono"><input id="dbg-prestige-set-target" type="number" min="1" step="1" value="' + prestigeSnap.target + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-apply-prestige">Apply prestige</button> <span class="small dim" id="dbg-prestige-msg"></span></div>');
    html.push('<div class="mt-8">');
    html.push('<button class="btn btn-small btn-outline" data-dbg-lxp-add="1">+1</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-lxp-add="10">+10</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-lxp-add="100">+100</button> ');
    html.push('<button class="btn btn-small btn-outline" data-dbg-lxp-add="1000">+1000</button>');
    html.push("</div>");

    if (Game.Prestige && Game.Prestige.config && Array.isArray(Game.Prestige.config.upgrades)) {
      var defsAll = Game.Prestige.config.upgrades;
      html.push('<div class="mt-8" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;">');
      html.push('<div class="small dim">Upgrade tier override</div>');
      html.push('<div class="field-row mt-4"><span>Upgrade</span><span class="mono"><select id="dbg-prestige-upgrade-id" style="padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">');
      for (var ui = 0; ui < defsAll.length; ui++) {
        var ud = defsAll[ui];
        if (!ud || !ud.id) continue;
        html.push('<option value="' + ud.id + '">' + (ud.name || ud.id) + "</option>");
      }
      html.push("</select></span></div>");
      html.push('<div class="field-row"><span>Tier</span><span class="mono"><input id="dbg-prestige-upgrade-tier" type="number" min="0" step="1" value="0" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-prestige-set-upgrade">Set upgrade tier</button> <button class="btn btn-small btn-outline" id="dbg-prestige-reset-upgrades">Reset all upgrades</button> <span class="small dim" id="dbg-prestige-upgrade-msg"></span></div>');
      html.push("</div>");
    }

    html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="dbg-open-prestige-shop">Open Prestige Shop</button> <button class="btn btn-small btn-outline" id="dbg-open-prestige-preview">Preview Prestige</button></div>');
    html.push("</div>");
    html.push("</div>");

    // Education
    html.push('<div class="card">');
    html.push('<div class="card-title">Education</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Level</span><span class="mono"><input id="dbg-edu-level" type="number" min="0" max="99" step="1" value="' + eduLvl + '" style="width:90px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> </span></div>');
    html.push('<div class="field-row"><span>XP</span><span class="mono"><input id="dbg-edu-xp" type="number" min="0" step="0.1" value="' + UI.Debug._fmt(eduXp, 1) + '" style="width:90px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-apply-edu">Apply education</button> <span class="small dim" id="dbg-edu-msg"></span></div>');
    html.push("</div>");
    html.push("</div>");

    // Jobs
    html.push('<div class="card">');
    html.push('<div class="card-title">Jobs</div>');
    html.push('<div class="card-section small dim">Sets per-job stored level (used for wage multiplier). Current job can be forced regardless of location.</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Current job</span><span class="mono"><select id="dbg-job-current" style="padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">');
    for (var jid in jobs) {
      if (!Object.prototype.hasOwnProperty.call(jobs, jid)) continue;
      var def = jobs[jid];
      if (!def || !def.id) continue;
      var sel = (def.id === currentJob) ? " selected" : "";
      html.push('<option value="' + def.id + '"' + sel + ">" + def.name + "</option>");
    }
    html.push("</select></span></div>");
    html.push('<div class="mt-8" style="max-height:240px;overflow:auto;border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:10px;background:rgba(255,255,255,0.02);">');
    for (var jid2 in jobs) {
      if (!Object.prototype.hasOwnProperty.call(jobs, jid2)) continue;
      var def2 = jobs[jid2];
      if (!def2 || !def2.id || def2.id === "none") continue;
      var lvl = 0;
      if (Game.Jobs && Game.Jobs.getJobLevelInfo) {
        lvl = Game.Jobs.getJobLevelInfo(def2.id).level || 0;
      } else if (s.job && s.job.levels && s.job.levels[def2.id]) {
        lvl = s.job.levels[def2.id].level || 0;
      }
      html.push('<div class="field-row"><span>' + def2.name + '</span><span class="mono">L<input data-dbg-job-level="' + def2.id + '" type="number" min="0" max="99" step="1" value="' + lvl + '" style="width:70px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    }
    html.push("</div>");
    html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-apply-jobs">Apply jobs</button> <span class="small dim" id="dbg-jobs-msg"></span></div>');
    html.push("</div>");
    html.push("</div>");

    // Casino
    html.push('<div class="card">');
    html.push('<div class="card-title">Casino (Tokens)</div>');
    html.push('<div class="card-section small dim">For testing slots without touching wallet money.</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Token balance</span><span class="mono">$<input id="dbg-casino-tokens" type="number" min="0" step="1" value="' + UI.Debug._fmt(casinoSnap.tokensUsd, 2) + '" style="width:120px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Owned machines</span><span class="mono"><input id="dbg-casino-owned" type="number" min="0" step="1" value="' + casinoSnap.ownedMachines + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Free spins</span><span class="mono"><input id="dbg-casino-freespins" type="number" min="0" step="1" value="' + casinoSnap.freeSpins + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="field-row"><span>Claim day</span><span class="mono"><input id="dbg-casino-claimday" type="number" min="0" step="1" value="' + casinoSnap.freeSpinsClaimDay + '" style="width:110px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"></span></div>');
    html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="dbg-apply-casino">Apply casino</button> <span class="small dim" id="dbg-casino-msg"></span></div>');
    html.push("</div>");
    html.push("</div>");

    // Mining
    html.push('<div class="card">');
    html.push('<div class="card-title">BTC Mining Multiplier & Breakdown</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Mining multiplier</span><span class="mono"><input id="dbg-btc-mult" type="number" min="0" max="1000" step="0.1" value="' + miningMult + '" style="width:90px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"> x</span></div>');
    html.push('<div class="small dim mt-4">Applies to PC mining (BTC), mining rigs, and cloud mining payouts.</div>');
    html.push('<div class="notice mt-8" style="background:linear-gradient(135deg, rgba(248,210,77,0.14), rgba(255,255,255,0.03));border:1px solid rgba(248,210,77,0.18);">');
    html.push('<div class="mono small">BTC/s = Hashrate * ' + breakdown.baseBtcPerHashSecond.toFixed(11) + ' * MiningMultiplier</div>');
    html.push('<div class="mono small">BTC / in-game day = BTC/s * ' + breakdown.secondsPerInGameDay + "s</div>");
    html.push("</div>");
    html.push('<div class="mt-8" id="dbg-btc-breakdown"></div>');
    html.push("</div>");
    html.push("</div>");

    html.push("</div>");
    return html.join("");
  };

  UI.Debug.updateMiningDom = function (root) {
    if (!root) return;
    var wrap = root.querySelector("#dbg-btc-breakdown");
    if (!wrap) return;
    var b = UI.Debug.getMiningBreakdown();
    var html = [];

    var pcLine = b.pc.on ? ("ON - " + UI.Debug._fmt(b.pc.hashrate, 2) + " H/s") : ("OFF - " + UI.Debug._fmt(b.pc.hashrate, 2) + " H/s");
    var rigLine = b.rig.on ? ("ON - " + (b.rig.rigs || 0) + " rigs") : ("OFF - " + (b.rig.rigs || 0) + " rigs");
    var cloudLine = (b.cloud.active || 0) + " active";

    function btcLine(label, info, perDay, perHour, accent) {
      var bg = accent || "rgba(255,255,255,0.03)";
      html.push('<div style="border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:10px;background:' + bg + ';margin-bottom:10px;">');
      html.push('<div class="flex-between"><div><div style="font-size:13px;">' + label + '</div><div class="small dim">' + info + "</div></div>");
      html.push('<div class="mono" style="text-align:right;">' + UI.Debug._fmt(perDay, 8) + " BTC<div class=\"small dim\">/ in-game day</div></div></div>");
      html.push('<div class="field-row mt-8"><span class="small dim">At current tick rate</span><span class="mono">' + UI.Debug._fmt(perHour, 8) + " BTC / real hour</span></div>");
      html.push("</div>");
    }

    btcLine("PC Mining (BTC)", pcLine, b.pc.perDay || 0, (b.pc.perDay || 0) * (b.inGameDaysPerRealHour || 0), "rgba(120,180,255,0.06)");
    btcLine("Mining Rigs", rigLine + " - suite x" + UI.Debug._fmt(b.rig.suiteMult || 1, 2), b.rig.perDay || 0, (b.rig.perDay || 0) * (b.inGameDaysPerRealHour || 0), "rgba(255,255,255,0.03)");
    btcLine("Cloud Mining", cloudLine, b.cloud.perDay || 0, (b.cloud.perDay || 0) * (b.inGameDaysPerRealHour || 0), "rgba(248,210,77,0.06)");

    html.push('<div class="notice" style="margin-top:10px;">');
    html.push('<div class="field-row"><span>Total</span><span class="mono">' + UI.Debug._fmt(b.totalPerDay || 0, 8) + " BTC / in-game day</span></div>");
    html.push('<div class="field-row"><span>Total (real time)</span><span class="mono">' + UI.Debug._fmt(b.totalPerRealHour || 0, 8) + " BTC / real hour</span></div>");
    if (b.priceUsd > 0) {
      html.push('<div class="field-row"><span>USD @ $' + UI.Debug._fmt(b.priceUsd, 0) + '/BTC</span><span class="mono">$' + UI.Debug._fmt(b.totalUsdPerDay || 0, 2) + ' / in-game day</span></div>');
      html.push('<div class="field-row"><span>USD (real time)</span><span class="mono">$' + UI.Debug._fmt(b.totalUsdPerRealHour || 0, 2) + ' / real hour</span></div>');
    } else {
      html.push('<div class="small dim mt-4">BTC price unavailable (USD estimates hidden).</div>');
    }
    html.push("</div>");

    wrap.innerHTML = html.join("");
  };

  UI.Debug.updateTimeDom = function (root) {
    if (!root) return;
    var tickMult = UI.Debug.getTickRateMult();
    var b = UI.Debug.getMiningBreakdown();
    var labelEl = root.querySelector("#dbg-tick-label");
    if (labelEl) labelEl.textContent = (tickMult === 0) ? "Paused" : ("x" + UI.Debug._fmt(tickMult, 2));
    var realPerDayEl = root.querySelector("#dbg-real-per-day");
    if (realPerDayEl) {
      var realSecPerDay = tickMult > 0 ? (b.secondsPerInGameDay / tickMult) : 0;
      var realMinPerDay = realSecPerDay / 60;
      realPerDayEl.textContent = tickMult > 0 ? (UI.Debug._fmt(realMinPerDay, 2) + " min") : "∞";
    }
    var dph = root.querySelector("#dbg-days-per-hour");
    if (dph) dph.textContent = UI.Debug._fmt(b.inGameDaysPerRealHour, 2);
  };

  UI.Debug.updateNowTimeDom = function (root) {
    if (!root) return;
    var snap = UI.Debug.getNowTimeSnapshot();
    var dayEl = root.querySelector("#dbg-now-day");
    var clockEl = root.querySelector("#dbg-now-clock");
    var myEl = root.querySelector("#dbg-now-monthyear");
    if (dayEl) dayEl.textContent = String(snap.day);
    if (clockEl) clockEl.textContent = String(snap.clock);
    if (myEl) myEl.textContent = String(snap.monthYear || "");
  };

  UI.Debug.updatePrestigeDom = function (root) {
    if (!root) return;
    var snap = UI.Debug.getPrestigeSnapshot();
    var pointsEl = root.querySelector("#dbg-prestige-points");
    var totalEl = root.querySelector("#dbg-prestige-total");
    var scoreEl = root.querySelector("#dbg-prestige-score");
    var targetEl = root.querySelector("#dbg-prestige-target-label");
    var readyEl = root.querySelector("#dbg-prestige-ready");
    var rewardNowEl = root.querySelector("#dbg-prestige-reward-now");
    var rewardTargetEl = root.querySelector("#dbg-prestige-reward-target");
    if (pointsEl) pointsEl.textContent = String(snap.availablePoints);
    if (totalEl) totalEl.textContent = String(snap.totalPrestiges);
    if (scoreEl) scoreEl.textContent = String(snap.score);
    if (targetEl) targetEl.textContent = String(snap.target);
    if (readyEl) readyEl.textContent = snap.ready ? ("READY • " + snap.tierLabel) : "Not ready";
    if (rewardNowEl) rewardNowEl.textContent = "+" + snap.pointsIfPrestigeNow + " LXP";
    if (rewardTargetEl) rewardTargetEl.textContent = "+" + snap.pointsAtTarget + " LXP";
  };

  UI.Debug.updateCasinoDom = function (root) {
    if (!root) return;
    var snap = UI.Debug.getCasinoSnapshot();
    var tEl = root.querySelector("#dbg-casino-tokens");
    var oEl = root.querySelector("#dbg-casino-owned");
    var fEl = root.querySelector("#dbg-casino-freespins");
    var cEl = root.querySelector("#dbg-casino-claimday");
    if (tEl) tEl.value = UI.Debug._fmt(snap.tokensUsd, 2);
    if (oEl) oEl.value = String(snap.ownedMachines);
    if (fEl) fEl.value = String(snap.freeSpins);
    if (cEl) cEl.value = String(snap.freeSpinsClaimDay);
  };

  UI.openDebugMenu = function () {
    UI.Debug.ensureState();
    if (!Game.state.debug.unlocked) {
      Game.addNotification("Debug menu is locked. Redeem code DSOLVE first.");
      return;
    }
    if (!UI.openModalCard) return;

    var overlay = UI.openModalCard({
      title: "DSOLVE Debug Menu",
      sub: "Developer tools (per-save)",
      bodyHtml: UI.Debug.renderMenuBody(),
      large: true
    });
    if (!overlay) return;

    // Initial render of breakdown
    UI.Debug.updateMiningDom(overlay);
    UI.Debug.updateTimeDom(overlay);
    UI.Debug.updateNowTimeDom(overlay);
    UI.Debug.updatePrestigeDom(overlay);
    UI.Debug.updateCasinoDom(overlay);

    var tickRange = overlay.querySelector("#dbg-tick-range");
    var tickInput = overlay.querySelector("#dbg-tick-input");
    function setTick(val) {
      UI.Debug.setTickRateMult(val);
      var t = UI.Debug.getTickRateMult();
      if (tickRange) tickRange.value = String(t);
      if (tickInput) tickInput.value = String(t);
      UI.Debug.updateTimeDom(overlay);
      UI.Debug.updateMiningDom(overlay);
    }
    if (tickRange) tickRange.addEventListener("input", function () { setTick(this.value); });
    if (tickInput) tickInput.addEventListener("change", function () { setTick(this.value); });
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dbg-tick]");
      if (!btn) return;
      var v = btn.getAttribute("data-dbg-tick");
      setTick(parseFloat(v));
    });

    var miningInput = overlay.querySelector("#dbg-btc-mult");
    if (miningInput) {
      miningInput.addEventListener("change", function () {
        UI.Debug.setMiningMult(this.value);
        this.value = String(UI.Debug.getMiningMult());
        UI.Debug.updateMiningDom(overlay);
      });
    }

    var balBtn = overlay.querySelector("#dbg-apply-balances");
    if (balBtn) {
      balBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-bal-msg");
        var moneyEl = overlay.querySelector("#dbg-money");
        var bankEl = overlay.querySelector("#dbg-bank");
        var btcEl = overlay.querySelector("#dbg-btc");
        var ubtcEl = overlay.querySelector("#dbg-ubtc");
        if (!Game.state) return;
        Game.state.money = UI.Debug._safeMoney(moneyEl ? moneyEl.value : 0);
        if (Game.state.bank && typeof Game.state.bank === "object") {
          Game.state.bank.depositBalance = UI.Debug._safeMoney(bankEl ? bankEl.value : 0);
        }
        Game.state.btcBalance = Math.max(0, parseFloat(btcEl ? btcEl.value : 0) || 0);
        Game.state.unconfirmedBtc = Math.max(0, parseFloat(ubtcEl ? ubtcEl.value : 0) || 0);
        if (window.UI && UI.animateNumber) {
          UI.animateNumber("money", Game.state.money);
          UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
        }
        if (msg) msg.textContent = "Applied.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }

    var eduBtn = overlay.querySelector("#dbg-apply-edu");
    if (eduBtn) {
      eduBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-edu-msg");
        var lvlEl = overlay.querySelector("#dbg-edu-level");
        var xpEl = overlay.querySelector("#dbg-edu-xp");
        if (!Game.state || !Game.state.education) return;
        Game.state.education.level = UI.Debug._safeInt(lvlEl ? lvlEl.value : 0, 0, 99);
        var xp = parseFloat(xpEl ? xpEl.value : 0);
        if (!isFinite(xp) || xp < 0) xp = 0;
        Game.state.education.xp = xp;
        if (msg) msg.textContent = "Applied.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }

    var jobsBtn = overlay.querySelector("#dbg-apply-jobs");
    if (jobsBtn) {
      jobsBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-jobs-msg");
        if (!Game.state || !Game.state.job) return;
        if (Game.Jobs && Game.Jobs.ensureJobProgress) Game.Jobs.ensureJobProgress();
        var inputs = overlay.querySelectorAll("[data-dbg-job-level]");
        for (var i = 0; i < inputs.length; i++) {
          var inp = inputs[i];
          var id = inp.getAttribute("data-dbg-job-level");
          if (!id) continue;
          var lvl = UI.Debug._safeInt(inp.value, 0, 99);
          if (!Game.state.job.levels) Game.state.job.levels = {};
          if (!Game.state.job.levels[id]) Game.state.job.levels[id] = { level: 0, xp: 0 };
          Game.state.job.levels[id].level = lvl;
          if (typeof Game.state.job.levels[id].xp !== "number") Game.state.job.levels[id].xp = 0;
        }
        var curSel = overlay.querySelector("#dbg-job-current");
        var newCur = curSel ? String(curSel.value || "none") : "none";
        Game.state.job.current = newCur;
        if (newCur === "none") {
          Game.state.job.level = 0;
          Game.state.job.xp = 0;
        } else if (Game.state.job.levels && Game.state.job.levels[newCur]) {
          Game.state.job.level = Game.state.job.levels[newCur].level || 0;
          Game.state.job.xp = Game.state.job.levels[newCur].xp || 0;
        }
        if (msg) msg.textContent = "Applied.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }

    var advBtn = overlay.querySelector("#dbg-advance-apply");
    if (advBtn) {
      advBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-advance-msg");
        var minEl = overlay.querySelector("#dbg-advance-minutes");
        var mins = UI.Debug._safeInt(minEl ? minEl.value : 0, 1, 1000000);
        if (Game && typeof Game.advanceTime === "function") {
          Game.advanceTime(mins);
          if (window.UI && UI.refresh) UI.refresh();
          UI.Debug.updateNowTimeDom(overlay);
          UI.Debug.updatePrestigeDom(overlay);
          if (msg) msg.textContent = "Advanced.";
          setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
        }
      });
    }
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dbg-advance]");
      if (!btn) return;
      var msg = overlay.querySelector("#dbg-advance-msg");
      var mins = UI.Debug._safeInt(btn.getAttribute("data-dbg-advance"), 1, 1000000);
      if (Game && typeof Game.advanceTime === "function") {
        Game.advanceTime(mins);
        if (window.UI && UI.refresh) UI.refresh();
        UI.Debug.updateNowTimeDom(overlay);
        UI.Debug.updatePrestigeDom(overlay);
        if (msg) msg.textContent = "Advanced.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      }
    });

    var prestigeBtn = overlay.querySelector("#dbg-apply-prestige");
    if (prestigeBtn) {
      prestigeBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-prestige-msg");
        if (!Game || !Game.Prestige || typeof Game.Prestige.ensureState !== "function") return;
        Game.Prestige.ensureState();
        var ptsEl = overlay.querySelector("#dbg-prestige-set-points");
        var totEl = overlay.querySelector("#dbg-prestige-set-total");
        var tgtEl = overlay.querySelector("#dbg-prestige-set-target");
        var pts = UI.Debug._safeInt(ptsEl ? ptsEl.value : 0, 0, 1000000000);
        var tot = UI.Debug._safeInt(totEl ? totEl.value : 0, 0, 1000000000);
        var tgt = UI.Debug._safeInt(tgtEl ? tgtEl.value : 1, 1, 1000000000);
        Game.state.prestige.points = pts;
        Game.state.prestige.totalPrestiges = tot;
        Game.state.prestige.targetScore = tgt;
        UI.Debug.updatePrestigeDom(overlay);
        if (msg) msg.textContent = "Applied.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dbg-lxp-add]");
      if (!btn) return;
      if (!Game || !Game.Prestige || typeof Game.Prestige.ensureState !== "function") return;
      Game.Prestige.ensureState();
      var msg = overlay.querySelector("#dbg-prestige-msg");
      var add = UI.Debug._safeInt(btn.getAttribute("data-dbg-lxp-add"), 0, 1000000000);
      Game.state.prestige.points = Math.max(0, Math.floor((Game.state.prestige.points || 0) + add));
      var ptsEl = overlay.querySelector("#dbg-prestige-set-points");
      if (ptsEl) ptsEl.value = String(Game.state.prestige.points);
      UI.Debug.updatePrestigeDom(overlay);
      if (msg) msg.textContent = "Added +" + add + ".";
      setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
    });

    var setUpgradeBtn = overlay.querySelector("#dbg-prestige-set-upgrade");
    if (setUpgradeBtn) {
      setUpgradeBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-prestige-upgrade-msg");
        if (!Game || !Game.Prestige || typeof Game.Prestige.ensureState !== "function") return;
        Game.Prestige.ensureState();
        var sel = overlay.querySelector("#dbg-prestige-upgrade-id");
        var tierEl = overlay.querySelector("#dbg-prestige-upgrade-tier");
        var id = sel ? String(sel.value || "") : "";
        if (!id) return;
        var tier = UI.Debug._safeInt(tierEl ? tierEl.value : 0, 0, 1000000000);
        var def = (typeof Game.Prestige.getUpgradeDef === "function") ? Game.Prestige.getUpgradeDef(id) : null;
        if (def && typeof def.maxTier === "number" && isFinite(def.maxTier) && def.maxTier > 0) {
          tier = Math.min(tier, Math.floor(def.maxTier));
        }
        Game.state.prestige.upgrades[id] = tier;
        UI.Debug.updatePrestigeDom(overlay);
        if (msg) msg.textContent = "Set.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }
    var resetUpgradesBtn = overlay.querySelector("#dbg-prestige-reset-upgrades");
    if (resetUpgradesBtn) {
      resetUpgradesBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-prestige-upgrade-msg");
        if (!Game || !Game.Prestige || typeof Game.Prestige.ensureState !== "function") return;
        Game.Prestige.ensureState();
        Game.state.prestige.upgrades = {};
        UI.Debug.updatePrestigeDom(overlay);
        if (msg) msg.textContent = "Reset.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }

    var openShopBtn = overlay.querySelector("#dbg-open-prestige-shop");
    if (openShopBtn) {
      openShopBtn.addEventListener("click", function () {
        if (UI && UI.Tabs && UI.Tabs.openPrestigeShopModal) UI.Tabs.openPrestigeShopModal(false);
      });
    }
    var openPreviewBtn = overlay.querySelector("#dbg-open-prestige-preview");
    if (openPreviewBtn) {
      openPreviewBtn.addEventListener("click", function () {
        if (UI && UI.Tabs && UI.Tabs.openPrestigeConfirmModal) UI.Tabs.openPrestigeConfirmModal(true);
      });
    }

    var casinoBtn = overlay.querySelector("#dbg-apply-casino");
    if (casinoBtn) {
      casinoBtn.addEventListener("click", function () {
        var msg = overlay.querySelector("#dbg-casino-msg");
        if (!Game || !Game.Casino || typeof Game.Casino.ensureState !== "function") return;
        Game.Casino.ensureState();
        var tEl = overlay.querySelector("#dbg-casino-tokens");
        var oEl = overlay.querySelector("#dbg-casino-owned");
        var fEl = overlay.querySelector("#dbg-casino-freespins");
        var cEl = overlay.querySelector("#dbg-casino-claimday");
        var tokens = UI.Debug._safeMoney(tEl ? tEl.value : 0);
        var owned = UI.Debug._safeInt(oEl ? oEl.value : 0, 0, 1000000);
        var fs = UI.Debug._safeInt(fEl ? fEl.value : 0, 0, 1000000);
        var cd = UI.Debug._safeInt(cEl ? cEl.value : 0, 0, 1000000000);
        Game.state.casino.balanceUsd = tokens;
        if (!Game.state.casino.slots || typeof Game.state.casino.slots !== "object") Game.state.casino.slots = {};
        Game.state.casino.slots.ownedMachines = owned;
        Game.state.casino.slots.freeSpins = fs;
        Game.state.casino.slots.freeSpinsClaimDay = cd;
        UI.Debug.updateCasinoDom(overlay);
        if (msg) msg.textContent = "Applied.";
        setTimeout(function () { if (msg) msg.textContent = ""; }, 1200);
      });
    }

    // Keep the breakdown fresh while the modal is open.
    var timer = setInterval(function () {
      if (!document.body.contains(overlay)) {
        clearInterval(timer);
        return;
      }
      UI.Debug.updateTimeDom(overlay);
      UI.Debug.updateMiningDom(overlay);
    }, 500);
  };
})();
