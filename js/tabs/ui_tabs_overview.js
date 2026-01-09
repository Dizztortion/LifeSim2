(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderOverviewTab = function () {
    var s = Game.state;
    var jobDef = Game.Jobs.defs[s.job.current] || Game.Jobs.defs.none;
    var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
    if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
    var propertiesCount = s.properties.length;
    var tenantsCount = s.tenants.length;
    var c = s.companies;
    var unlockedCompanies =
      (c.railLogistics.unlocked ? 1 : 0) +
      (c.miningCorp.unlocked ? 1 : 0) +
      (c.retailShop.unlocked ? 1 : 0) +
      (c.netCafe && c.netCafe.unlocked ? 1 : 0) +
      (c.courierCo && c.courierCo.unlocked ? 1 : 0) +
      (c.recyclingCo && c.recyclingCo.unlocked ? 1 : 0);
    var stats = (s.stats && typeof s.stats === "object") ? s.stats : {};
    var trainSkill = (typeof stats.trainSkill === "number" && isFinite(stats.trainSkill)) ? Math.floor(stats.trainSkill) : 0;
    var businessSkill = (typeof stats.businessSkill === "number" && isFinite(stats.businessSkill)) ? Math.floor(stats.businessSkill) : 0;
    var techSkill = (typeof stats.techSkill === "number" && isFinite(stats.techSkill)) ? Math.floor(stats.techSkill) : 0;
    return [
      '<div>',
      '  <div class="section-title">Life Overview</div>',
      '  <div class="section-subtitle">A slow-paced simulation. Build education, work, businesses, property and BTC infrastructure over time.</div>',
      '  <div class="grid mt-8">',
      '    <div class="card">',
      '      <div class="card-title">Status</div>',
      '      <div class="card-meta">At <span id="overview-location">' + s.travelLocation + '</span></div>',
      '      <div class="card-section">',
      '        <div class="field-row"><span>Player</span><span id="overview-player">' + ((s.player && s.player.name) ? s.player.name : "Player") + '</span></div>',
      '        <div class="field-row"><span>UK location</span><span id="overview-ukloc">' + (s.player && s.player.currentPlaceId ? s.player.currentPlaceId : "-") + '</span></div>',
      '        <div class="field-row"><span>Current job</span><span id="overview-job">' + jobDef.name + ' (L' + s.job.level + ')</span></div>',
      '        <div class="field-row"><span>Education</span><span id="overview-edu">' + Game.getEducationLabel() + ' (L' + s.education.level + ')</span></div>',
      '        <div class="field-row"><span>Health / Energy</span><span id="overview-health-energy">' + Math.round(s.health) + "/" + Math.round(maxHealth) + ' / ' + Math.round(s.energy) + "/" + Math.round(maxEnergy) + '</span></div>',
      '        <div class="field-row"><span>Hunger</span><span id="overview-hunger">' + Math.round(s.hunger) + '%</span></div>',
      '      </div>',
      '      <div class="card-section small dim">Work and study to progress. Low health or high hunger will slowly reduce your performance.</div>',
      '    </div>',
      '    <div class="card">',
      '      <div class="card-title">Assets</div>',
      '      <div class="card-meta">Physical & digital</div>',
      '      <div class="field-row"><span>Properties owned</span><span id="overview-prop-owned">' + propertiesCount + '</span></div>',
      '      <div class="field-row"><span>Tenants</span><span id="overview-tenant-count">' + tenantsCount + '</span></div>',
      '      <div class="field-row"><span>Companies unlocked</span><span id="overview-companies">' + unlockedCompanies + ' / 6</span></div>',
      '      <div class="field-row"><span>BTC rigs</span><span id="overview-rigs">' + s.btc.mining.rigsOwned + '</span></div>',
      '      <div class="field-row"><span>Cloud contracts</span><span id="overview-contracts">' + s.btc.cloud.contracts.length + '</span></div>',
      '      <div class="card-section small dim">Property, companies and BTC infrastructure generate most of your long-term passive income.</div>',
      '    </div>',
      '    <div class="card">',
      '      <div class="card-title">Skills</div>',
      '      <div class="card-meta">Job + education</div>',
      '      <div class="card-section">',
      '        <div class="field-row"><span>Train</span><span id="overview-skill-train">' + trainSkill + '</span></div>',
      '        <div class="field-row"><span>Business</span><span id="overview-skill-business">' + businessSkill + '</span></div>',
      '        <div class="field-row"><span>Tech</span><span id="overview-skill-tech">' + techSkill + '</span></div>',
      '      </div>',
      '      <div class="card-section small dim">Skills unlock new job paths and companies as they grow.</div>',
      '    </div>',
      '  </div>',
      '  <div class="grid mt-8">',
      '    <div class="card">',
      '      <div class="card-title">Vitals</div>',
       '      <div class="card-meta">Health, energy, hunger</div>',
       '      <div class="card-section">',
       '        <div id="overview-chart-vitals" class="mini-chart" style="height:140px;"></div>',
       '        <div class="mini-legend mt-8">',
       '          <span class="mini-legend-item legend-health"><span class="legend-dot legend-health"></span><span id="overview-legend-health">Health</span></span>',
       '          <span class="mini-legend-item legend-energy"><span class="legend-dot legend-energy"></span><span id="overview-legend-energy">Energy</span></span>',
       '          <span class="mini-legend-item legend-hunger"><span class="legend-dot legend-hunger"></span><span id="overview-legend-hunger">Hunger</span></span>',
       '        </div>',
       '      </div>',
       '    </div>',
       '    <div class="card">',
      '      <div class="card-title">Progress</div>',
       '      <div class="card-meta">Education, job, prestige</div>',
       '      <div class="card-section">',
       '        <div id="overview-chart-progress" class="mini-chart" style="height:140px;"></div>',
       '        <div class="mini-legend mt-8">',
       '          <span class="mini-legend-item legend-edu"><span class="legend-dot legend-edu"></span><span id="overview-legend-edu">Education</span></span>',
       '          <span class="mini-legend-item legend-job"><span class="legend-dot legend-job"></span><span id="overview-legend-job">Job</span></span>',
       '          <span class="mini-legend-item legend-prestige"><span class="legend-dot legend-prestige"></span><span id="overview-legend-prestige">Prestige</span></span>',
       '        </div>',
       '      </div>',
       '    </div>',
       '    <div class="card">',
      '      <div class="card-title">Wealth</div>',
       '      <div class="card-meta">Cash, bank deposits, crypto</div>',
       '      <div class="card-section">',
       '        <div id="overview-chart-wealth" class="mini-chart" style="height:140px;"></div>',
       '        <div class="mini-legend mt-8">',
       '          <span class="mini-legend-item legend-cash"><span class="legend-dot legend-cash"></span><span id="overview-legend-cash">Cash</span></span>',
       '          <span class="mini-legend-item legend-bank"><span class="legend-dot legend-bank"></span><span id="overview-legend-bank">Bank</span></span>',
       '          <span class="mini-legend-item legend-crypto"><span class="legend-dot legend-crypto"></span><span id="overview-legend-crypto">Crypto</span></span>',
       '        </div>',
       '      </div>',
       '    </div>',
       '  </div>',
      '</div>'
    ].join("");
  };

  UI.Tabs.updateOverviewDynamic = function () {
    var s = Game.state;
    var locEl = document.getElementById("overview-location");
    if (locEl) locEl.textContent = s.travelLocation || "Home";
    var pEl = document.getElementById("overview-player");
    if (pEl) pEl.textContent = (s.player && s.player.name) ? s.player.name : "Player";
    var ukEl = document.getElementById("overview-ukloc");
    if (ukEl) {
      var id = (s.player && s.player.currentPlaceId) ? s.player.currentPlaceId : "";
      var label = id || "-";
      ukEl.textContent = label;
    }
    var jobEl = document.getElementById("overview-job");
    if (jobEl && Game.Jobs && Game.Jobs.defs) {
      var jobDef = Game.Jobs.defs[s.job.current] || Game.Jobs.defs.none;
      jobEl.textContent = jobDef.name + " (L" + (s.job.level || 0) + ")";
    }
    var eduEl = document.getElementById("overview-edu");
    if (eduEl) eduEl.textContent = Game.getEducationLabel() + " (L" + (s.education.level || 0) + ")";
    var heEl = document.getElementById("overview-health-energy");
    if (heEl) {
      var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
      if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
      var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
      if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
      heEl.textContent = Math.round(s.health) + "/" + Math.round(maxHealth) + " / " + Math.round(s.energy) + "/" + Math.round(maxEnergy);
    }
    var hungerEl = document.getElementById("overview-hunger");
    if (hungerEl) hungerEl.textContent = Math.round(s.hunger) + "%";

    var stats = (s.stats && typeof s.stats === "object") ? s.stats : {};
    var trainSkillEl = document.getElementById("overview-skill-train");
    if (trainSkillEl) trainSkillEl.textContent = String((typeof stats.trainSkill === "number" && isFinite(stats.trainSkill)) ? Math.floor(stats.trainSkill) : 0);
    var businessSkillEl = document.getElementById("overview-skill-business");
    if (businessSkillEl) businessSkillEl.textContent = String((typeof stats.businessSkill === "number" && isFinite(stats.businessSkill)) ? Math.floor(stats.businessSkill) : 0);
    var techSkillEl = document.getElementById("overview-skill-tech");
    if (techSkillEl) techSkillEl.textContent = String((typeof stats.techSkill === "number" && isFinite(stats.techSkill)) ? Math.floor(stats.techSkill) : 0);

    var propsEl = document.getElementById("overview-prop-owned");
    if (propsEl) propsEl.textContent = (s.properties && s.properties.length) ? String(s.properties.length) : "0";
    var tenantsEl = document.getElementById("overview-tenant-count");
    if (tenantsEl) tenantsEl.textContent = (s.tenants && s.tenants.length) ? String(s.tenants.length) : "0";
    var companiesEl = document.getElementById("overview-companies");
    if (companiesEl) {
      var c = s.companies || {};
      var unlocked =
        (c.railLogistics && c.railLogistics.unlocked ? 1 : 0) +
        (c.miningCorp && c.miningCorp.unlocked ? 1 : 0) +
        (c.retailShop && c.retailShop.unlocked ? 1 : 0) +
        (c.netCafe && c.netCafe.unlocked ? 1 : 0) +
        (c.courierCo && c.courierCo.unlocked ? 1 : 0) +
        (c.recyclingCo && c.recyclingCo.unlocked ? 1 : 0);
      companiesEl.textContent = unlocked + " / 6";
    }
    var rigsEl = document.getElementById("overview-rigs");
    if (rigsEl) rigsEl.textContent = String((s.btc && s.btc.mining && s.btc.mining.rigsOwned) ? s.btc.mining.rigsOwned : 0);
    var contractsEl = document.getElementById("overview-contracts");
    if (contractsEl) contractsEl.textContent = String((s.btc && s.btc.cloud && s.btc.cloud.contracts) ? s.btc.cloud.contracts.length : 0);

    if (UI.Tabs.updateOverviewCharts) {
      UI.Tabs.updateOverviewCharts();
    }
  };

  UI.Tabs._overviewChartsState = UI.Tabs._overviewChartsState || {
    vitals: { samples: [], lastKey: null, lastRenderKey: null },
    progress: { samples: [], lastKey: null, lastRenderKey: null },
    wealth: { samples: [], lastKey: null, lastRenderKey: null }
  };

  UI.Tabs._overviewColors = {
    health: "#00ffa3",
    energy: "#00b4ff",
    hunger: "#ff3b3b",
    edu: "#a855f7",
    job: "#00ffff",
    prestige: "#ff4fd8",
    cash: "#2eff7b",
    bank: "#ffd200",
    crypto: "#f7931a"
  };

  UI.Tabs._overviewGetNow = function () {
    var s = Game.state || {};
    var day = (typeof s.day === "number" && isFinite(s.day)) ? Math.floor(s.day) : 1;
    if (day < 1) day = 1;
    var minsRaw = (typeof s.timeMinutes === "number" && isFinite(s.timeMinutes)) ? s.timeMinutes : 0;
    var minuteOfDay = Math.floor(minsRaw % (24 * 60));
    if (minuteOfDay < 0) minuteOfDay = 0;
    if (minuteOfDay > 1439) minuteOfDay = 1439;
    var hour = Math.floor(minuteOfDay / 60);
    if (hour < 0) hour = 0;
    if (hour > 23) hour = 23;
    return { day: day, minuteOfDay: minuteOfDay, hour: hour };
  };

  UI.Tabs._overviewComputeSnapshot = function () {
    var s = Game.state || {};
    var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
    if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;

    var healthPct = (typeof s.health === "number" && isFinite(s.health)) ? (s.health / maxHealth) * 100 : 0;
    var energyPct = (typeof s.energy === "number" && isFinite(s.energy)) ? (s.energy / maxEnergy) * 100 : 0;
    var hungerPct = (typeof s.hunger === "number" && isFinite(s.hunger)) ? s.hunger : 0;

    function clamp01to100(v) {
      if (typeof v !== "number" || !isFinite(v)) v = 0;
      if (v < 0) v = 0;
      if (v > 100) v = 100;
      return v;
    }
    healthPct = clamp01to100(healthPct);
    energyPct = clamp01to100(energyPct);
    hungerPct = clamp01to100(hungerPct);

    var eduPct = (Game.School && typeof Game.School.getLevelProgressPercent === "function") ? Game.School.getLevelProgressPercent() : 0;
    eduPct = clamp01to100(eduPct);

    var jobPct = 0;
    try {
      if (Game.Jobs && typeof Game.Jobs.getXpRequiredForNextLevel === "function") {
        var req = Game.Jobs.getXpRequiredForNextLevel((s.job && typeof s.job.level === "number") ? s.job.level : 0);
        var xp = (s.job && typeof s.job.xp === "number" && isFinite(s.job.xp)) ? s.job.xp : 0;
        if (typeof req === "number" && isFinite(req) && req > 0) {
          jobPct = (xp / req) * 100;
        }
      }
    } catch (e) {}
    jobPct = clamp01to100(jobPct);

    var prestigePct = 0;
    try {
      if (Game.Prestige && typeof Game.Prestige.calculateScore === "function") {
        var calc = Game.Prestige.calculateScore();
        var score = calc && typeof calc.score === "number" ? calc.score : 0;
        var target = calc && typeof calc.target === "number" ? calc.target : 1;
        if (!isFinite(target) || target <= 0) target = 1;
        prestigePct = (score / target) * 100;
      }
    } catch (e2) {}
    prestigePct = clamp01to100(prestigePct);

    var cash = (typeof s.money === "number" && isFinite(s.money)) ? s.money : 0;
    var bank = (s.bank && typeof s.bank.depositBalance === "number" && isFinite(s.bank.depositBalance)) ? s.bank.depositBalance : 0;
    var cryptoUsd = 0;
    try {
      if (Game.Prestige && typeof Game.Prestige.getCryptoTotalsUsd === "function") {
        var c = Game.Prestige.getCryptoTotalsUsd();
        cryptoUsd = c && typeof c.totalUsd === "number" && isFinite(c.totalUsd) ? c.totalUsd : 0;
      }
    } catch (e3) {}
    if (!isFinite(cryptoUsd) || cryptoUsd < 0) cryptoUsd = 0;

    return {
      healthPct: healthPct,
      energyPct: energyPct,
      hungerPct: hungerPct,
      eduPct: eduPct,
      jobPct: jobPct,
      prestigePct: prestigePct,
      cash: cash,
      bank: bank,
      cryptoUsd: cryptoUsd
    };
  };

  UI.Tabs._overviewPushSample = function (bucket, key, payload, windowSize, hardCap) {
    var b = bucket || null;
    if (!b) return false;
    if (b.lastKey === key) return false;
    b.lastKey = key;
    if (!Array.isArray(b.samples)) b.samples = [];
    // Seed an initial previous point so charts can render immediately (needs >= 2 points).
    if (b.samples.length === 0 && key > 0 && payload && typeof payload === "object") {
      var prev = {};
      for (var k in payload) {
        if (!Object.prototype.hasOwnProperty.call(payload, k)) continue;
        prev[k] = payload[k];
      }
      prev.key = key - 1;
      b.samples.push(prev);
    }
    b.samples.push(payload);
    var minKey = key - Math.max(1, windowSize || 1) + 1;
    while (b.samples.length && b.samples[0].key < minKey) b.samples.shift();
    var cap = typeof hardCap === "number" && hardCap > 0 ? hardCap : 256;
    if (b.samples.length > cap) b.samples.splice(0, b.samples.length - cap);
    return true;
  };

  UI.Tabs._drawMiniChart = function (container, series, opts) {
    if (!container || typeof Flotr === "undefined") return;
    var o = opts || {};
    var yMin = (typeof o.yMin === "number" && isFinite(o.yMin)) ? o.yMin : null;
    var yMax = (typeof o.yMax === "number" && isFinite(o.yMax)) ? o.yMax : null;
    var yFmt = (typeof o.yFmt === "function") ? o.yFmt : null;
    var yTicks = Array.isArray(o.yTicks) ? o.yTicks : null;
    var xTicks = Array.isArray(o.xTicks) ? o.xTicks : null;
    var xFmt = (typeof o.xFmt === "function") ? o.xFmt : null;

    var plotSeries = [];
    for (var i = 0; i < series.length; i++) {
      var s = series[i];
      if (!s || !s.data || s.data.length === 0) continue;
      plotSeries.push({
        data: s.data,
        lines: { show: true, lineWidth: 2, fill: false },
        points: { show: false },
        shadowSize: 0,
        color: s.color
      });
    }
    if (!plotSeries.length) return;

    var yaxisOpts = {
      showLabels: o.showYLabels !== false,
      min: yMin === null ? undefined : yMin,
      max: yMax === null ? undefined : yMax
    };
    if (yFmt) yaxisOpts.tickFormatter = yFmt;
    if (yTicks) yaxisOpts.ticks = yTicks;

    var xaxisOpts = {
      showLabels: o.showXLabels !== false,
      ticks: xTicks || undefined,
      margin: true
    };
    if (xFmt) xaxisOpts.tickFormatter = xFmt;

    Flotr.draw(container, plotSeries, {
      HtmlText: false,
      fontColor: "#e8e8e8",
      fontSize: 9,
      grid: {
        color: "#eeeeee",
        tickColor: "rgba(255,255,255,0.06)",
        outlineWidth: 0,
        verticalLines: false,
        horizontalLines: true,
        labelMargin: 6
      },
      xaxis: xaxisOpts,
      yaxis: yaxisOpts,
      mouse: { track: false },
      legend: { show: false }
    });
  };

  UI.Tabs.updateOverviewCharts = function () {
    var vitalsEl = document.getElementById("overview-chart-vitals");
    var progEl = document.getElementById("overview-chart-progress");
    var wealthEl = document.getElementById("overview-chart-wealth");
    if (!vitalsEl && !progEl && !wealthEl) return;

    var now = UI.Tabs._overviewGetNow();
    var snap = UI.Tabs._overviewComputeSnapshot();
    var st = UI.Tabs._overviewChartsState;

    var vitalsBucket = st.vitals;
    var progressBucket = st.progress;
    var wealthBucket = st.wealth;

    // Sampling schedules:
    // - Vitals: every 10 in-game minutes (6h window)
    // - Progress: every in-game hour (48h window)
    // - Wealth: every in-game day (30d window)
    var vitalsKey = now.day * 144 + Math.floor(now.minuteOfDay / 10);
    var progressKey = now.day * 24 + now.hour;
    var wealthKey = now.day;

    var vitalsPushed = UI.Tabs._overviewPushSample(vitalsBucket, vitalsKey, {
      key: vitalsKey,
      healthPct: snap.healthPct,
      energyPct: snap.energyPct,
      hungerPct: snap.hungerPct
    }, 36, 72);

    var progressPushed = UI.Tabs._overviewPushSample(progressBucket, progressKey, {
      key: progressKey,
      eduPct: snap.eduPct,
      jobPct: snap.jobPct,
      prestigePct: snap.prestigePct
    }, 48, 72);

    var wealthPushed = UI.Tabs._overviewPushSample(wealthBucket, wealthKey, {
      key: wealthKey,
      cash: snap.cash,
      bank: snap.bank,
      cryptoUsd: snap.cryptoUsd
    }, 30, 60);

    function buildLine(samples, field) {
      var out = [];
      for (var i = 0; i < samples.length; i++) {
        var v = samples[i] && typeof samples[i][field] === "number" ? samples[i][field] : 0;
        if (!isFinite(v)) v = 0;
        out.push([i, v]);
      }
      return out;
    }

    function buildRelativeXTicks(samples, unitsPerStep, unitLabel, maxTicks) {
      var out = [];
      if (!samples || samples.length < 2) return out;
      var n = samples.length;
      var last = n - 1;
      var maxT = typeof maxTicks === "number" && maxTicks > 0 ? maxTicks : 6;
      var step = Math.max(1, Math.floor(n / (maxT - 1)));
      function fmtDelta(deltaUnits) {
        if (deltaUnits === 0) return "Now";
        if (unitLabel === "m" && deltaUnits >= 60 && (deltaUnits % 60) === 0) {
          return "-" + (deltaUnits / 60) + "h";
        }
        if (unitLabel === "h" && deltaUnits >= 24 && (deltaUnits % 24) === 0) {
          return "-" + (deltaUnits / 24) + "d";
        }
        return "-" + deltaUnits + unitLabel;
      }
      for (var i = 0; i < n; i += step) {
        var deltaSteps = (last - i);
        var deltaUnits = deltaSteps * (unitsPerStep || 1);
        out.push([i, fmtDelta(deltaUnits)]);
      }
      if (out.length && out[out.length - 1][0] !== last) out.push([last, "Now"]);
      return out;
    }

    function fmtPct(v) { return Math.round(v) + "%"; }
    function fmtUsdShort(v) {
      var n = typeof v === "number" ? v : 0;
      if (!isFinite(n)) n = 0;
      var sign = n < 0 ? "-" : "";
      n = Math.abs(n);
      if (n >= 1e9) return sign + "$" + (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return sign + "$" + (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return sign + "$" + (n / 1e3).toFixed(1) + "k";
      return sign + "$" + n.toFixed(0);
    }

    function rangeFor(samples, field, lookback) {
      var n = samples.length;
      var lb = typeof lookback === "number" && lookback > 0 ? lookback : n;
      var start = Math.max(0, n - lb);
      var min = Infinity;
      var max = -Infinity;
      var cur = 0;
      for (var i = start; i < n; i++) {
        var v = samples[i] && typeof samples[i][field] === "number" ? samples[i][field] : 0;
        if (!isFinite(v)) v = 0;
        if (v < min) min = v;
        if (v > max) max = v;
        if (i === n - 1) cur = v;
      }
      if (min === Infinity) min = 0;
      if (max === -Infinity) max = 0;
      return { cur: cur, min: min, max: max };
    }

    function setLegendText(id, label, r, fmt) {
      var el = document.getElementById(id);
      if (!el) return;
      var cur = fmt(r.cur);
      var min = fmt(r.min);
      var max = fmt(r.max);
      if (min === max) el.textContent = label + " " + cur;
      else el.textContent = label + " " + cur + " (" + min + "–" + max + ")";
    }

    var colors = UI.Tabs._overviewColors;

    if (vitalsEl && (vitalsPushed || vitalsBucket.lastRenderKey !== vitalsBucket.lastKey)) {
      vitalsBucket.lastRenderKey = vitalsBucket.lastKey;
      var vs = vitalsBucket.samples || [];
      if (vs.length >= 2) {
        UI.Tabs._drawMiniChart(vitalsEl, [
          { data: buildLine(vs, "healthPct"), color: colors.health },
          { data: buildLine(vs, "energyPct"), color: colors.energy },
          { data: buildLine(vs, "hungerPct"), color: colors.hunger }
        ], {
          yMin: 0,
          yMax: 100,
          yTicks: [0, 25, 50, 75, 100],
          yFmt: function (y) { return fmtPct(y); },
          xTicks: buildRelativeXTicks(vs, 10, "m", 7)
        });
        setLegendText("overview-legend-health", "Health", rangeFor(vs, "healthPct", 6), fmtPct);
        setLegendText("overview-legend-energy", "Energy", rangeFor(vs, "energyPct", 6), fmtPct);
        setLegendText("overview-legend-hunger", "Hunger", rangeFor(vs, "hungerPct", 6), fmtPct);
      }
    }

    if (progEl && (progressPushed || progressBucket.lastRenderKey !== progressBucket.lastKey)) {
      progressBucket.lastRenderKey = progressBucket.lastKey;
      var ps = progressBucket.samples || [];
      if (ps.length >= 2) {
        UI.Tabs._drawMiniChart(progEl, [
          { data: buildLine(ps, "eduPct"), color: colors.edu },
          { data: buildLine(ps, "jobPct"), color: colors.job },
          { data: buildLine(ps, "prestigePct"), color: colors.prestige }
        ], {
          yMin: 0,
          yMax: 100,
          yTicks: [0, 25, 50, 75, 100],
          yFmt: function (y) { return fmtPct(y); },
          xTicks: buildRelativeXTicks(ps, 1, "h", 6)
        });
        setLegendText("overview-legend-edu", "Education", rangeFor(ps, "eduPct", 6), fmtPct);
        setLegendText("overview-legend-job", "Job", rangeFor(ps, "jobPct", 6), fmtPct);
        setLegendText("overview-legend-prestige", "Prestige", rangeFor(ps, "prestigePct", 6), fmtPct);
      }
    }

    if (wealthEl && (wealthPushed || wealthBucket.lastRenderKey !== wealthBucket.lastKey)) {
      wealthBucket.lastRenderKey = wealthBucket.lastKey;
      var ws = wealthBucket.samples || [];
      if (ws.length >= 2) {
        // Autoscale y based on recent values across all three lines.
        var wMin = Infinity;
        var wMax = -Infinity;
        for (var wi = 0; wi < ws.length; wi++) {
          var c0 = ws[wi] && typeof ws[wi].cash === "number" ? ws[wi].cash : 0;
          var b0 = ws[wi] && typeof ws[wi].bank === "number" ? ws[wi].bank : 0;
          var x0 = ws[wi] && typeof ws[wi].cryptoUsd === "number" ? ws[wi].cryptoUsd : 0;
          if (!isFinite(c0)) c0 = 0;
          if (!isFinite(b0)) b0 = 0;
          if (!isFinite(x0)) x0 = 0;
          if (c0 < wMin) wMin = c0;
          if (b0 < wMin) wMin = b0;
          if (x0 < wMin) wMin = x0;
          if (c0 > wMax) wMax = c0;
          if (b0 > wMax) wMax = b0;
          if (x0 > wMax) wMax = x0;
        }
        if (wMin === Infinity) wMin = 0;
        if (wMax === -Infinity) wMax = 1;
        var pad = (wMax - wMin) * 0.08;
        if (!isFinite(pad) || pad <= 0) pad = Math.max(1, wMax * 0.05);
        var y0 = wMin - pad;
        var y1 = wMax + pad;
        if (!isFinite(y0)) y0 = 0;
        if (!isFinite(y1) || y1 <= y0) y1 = y0 + 1;
        if (y0 < 0) y0 = 0;
        var mid = (y0 + y1) / 2;
        UI.Tabs._drawMiniChart(wealthEl, [
          { data: buildLine(ws, "cash"), color: colors.cash },
          { data: buildLine(ws, "bank"), color: colors.bank },
          { data: buildLine(ws, "cryptoUsd"), color: colors.crypto }
        ], {
          yMin: y0,
          yMax: y1,
          yTicks: [y0, mid, y1],
          yFmt: function (y) { return fmtUsdShort(y); },
          xTicks: buildRelativeXTicks(ws, 1, "d", 6)
        });
        setLegendText("overview-legend-cash", "Cash", rangeFor(ws, "cash", 7), fmtUsdShort);
        setLegendText("overview-legend-bank", "Bank", rangeFor(ws, "bank", 7), fmtUsdShort);
        setLegendText("overview-legend-crypto", "Crypto", rangeFor(ws, "cryptoUsd", 7), fmtUsdShort);
      }
    }
  };
})();
