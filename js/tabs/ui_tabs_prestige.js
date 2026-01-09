(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  function fmtUsd(x) {
    var v = typeof x === "number" ? x : 0;
    if (!isFinite(v)) v = 0;
    var a = Math.abs(v);
    return (v < 0 ? "-" : "") + "$" + a.toFixed(0);
  }

  function getRunEntries(map, labelFn) {
    var out = [];
    if (!map || typeof map !== "object") return out;
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      var n = map[k];
      if (typeof n !== "number" || !isFinite(n) || n <= 0) continue;
      out.push({ id: k, label: labelFn ? labelFn(k) : k, count: Math.floor(n) });
    }
    out.sort(function (a, b) { return (b.count - a.count) || (a.label < b.label ? -1 : 1); });
    return out;
  }

  UI.Tabs.renderPrestigeTab = function () {
    if (Game.Prestige && Game.Prestige.ensureState) Game.Prestige.ensureState();
    var calc = Game.Prestige ? Game.Prestige.calculateScore() : { score: 0, target: 1, breakdown: {} };
    var s = Game.state;
    var statusReady = Game.Prestige ? (calc.score >= calc.target) : false;
    var ptsInfo = Game.Prestige ? Game.Prestige.getPointsForScore(calc.score, calc.target) : { ok: false, points: 0, tierLabel: "Locked" };

    var runs = (s && s.prestigeRun) ? s.prestigeRun : { eduJobRunsById: {}, eduCourseRunsById: {}, eduRunsTotal: 0 };
    var jobEntries = getRunEntries(runs.eduJobRunsById, function (jobId) {
      var def = (Game.Jobs && Game.Jobs.defs) ? Game.Jobs.defs[jobId] : null;
      return def && def.name ? def.name : jobId;
    });
    var courseEntries = getRunEntries(runs.eduCourseRunsById, function (courseId) {
      var c = (Game.School && Game.School.courses) ? Game.School.courses[courseId] : null;
      return c && c.name ? c.name : courseId;
    });

    var html = [];
    html.push('<div class="company-page">');
    html.push('<div class="section-title">Prestige</div>');
    html.push('<div class="section-subtitle">Your Prestige Score updates live. When you reach the target, you can reset your life for permanent Life Experience Points and upgrades.</div>');

    var pct = Math.floor((Math.min(calc.target, Math.max(0, calc.score)) / Math.max(1, calc.target)) * 100);
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    var remaining = Math.max(0, calc.target - calc.score);

    var hint = document.getElementById("prestige-lxp-hint");
    if (hint) {
      var ptsAtTarget = Game.Prestige.getPointsForScore(calc.target, calc.target);
      hint.innerHTML = (statusReady ? ("If you prestige now: +" + ptsInfo.points + " LXP") : ("At target: +" + (ptsAtTarget.points || 0) + " LXP")) + ' \u2022 Use <span class="mono">Preview Reset</span> to see the exact LXP reward at your current score.';
    }
    var nextEarned = document.getElementById("prestige-next-earned");
    var nextEarnedLabel = document.getElementById("prestige-next-earned-label");
    if (nextEarned || nextEarnedLabel) {
      var ptsAtTarget2 = Game.Prestige.getPointsForScore(calc.target, calc.target);
      if (nextEarned) nextEarned.textContent = "+" + (statusReady ? ptsInfo.points : (ptsAtTarget2.points || 0));
      if (nextEarnedLabel) nextEarnedLabel.textContent = statusReady ? "If you prestige now" : "At target";
    }
    var ptsAtTarget = Game.Prestige ? Game.Prestige.getPointsForScore(calc.target, calc.target) : { ok: true, points: 0, tierLabel: "Qualified" };

    html.push('<div class="prestige-top-row mt-8">');

    html.push('<div class="card prestige-progress-card company-hero page-prestige">');
    html.push('<div class="card-title">Prestige Progress</div>');
    html.push('<div class="card-meta">Unlock requirement</div>');
    html.push('<div class="card-section">');
    html.push('<div class="flex-between">');
    html.push('<div class="mono" id="prestige-progress-label" style="font-size:16px;font-weight:700;">' + calc.score + " / " + calc.target + "</div>");
    html.push('<div class="small dim" id="prestige-progress-sub">' + (statusReady ? ("Ready \u2022 Tier: " + ptsInfo.tierLabel + " (+" + ptsInfo.points + " LXP)") : (remaining + " more to reach Prestige")) + "</div>");
    html.push("</div>");
    html.push('<div class="small dim mt-4" id="prestige-lxp-hint">' + (statusReady ? ("If you prestige now: +" + ptsInfo.points + " LXP") : ("At target: +" + (ptsAtTarget.points || 0) + " LXP")) + ' \u2022 Use <span class="mono">Preview Reset</span> to see the exact LXP reward at your current score.</div>');
    html.push('<div class="progress mt-8" style="height:12px;"><div id="prestige-progress-bar" class="progress-fill magenta" style="width:' + pct + '%"></div></div>');
    html.push("</div>");
    html.push('<div class="card-section">');
    html.push('<button class="btn btn-small btn-primary" id="btn-prestige-now"' + (statusReady ? "" : " disabled") + ">" + (statusReady ? "Prestige" : "Prestige (Locked)") + "</button> ");
    html.push('<button class="btn btn-small btn-outline" id="btn-prestige-preview">Preview Reset</button>');
    html.push("</div>");
    html.push("</div>");

    html.push('<div class="card prestige-points-card company-hero page-prestige">');
    html.push('<div class="flex-between">');
    html.push('<div class="card-title">Life Experience Points</div>');
    html.push('<button class="btn btn-small btn-outline" id="btn-prestige-effects">Bonuses</button>');
    html.push("</div>");
    html.push('<div class="card-meta">Permanent currency</div>');
    html.push('<div class="card-section">');
    var pp = (s && s.prestige && typeof s.prestige.points === "number") ? Math.floor(s.prestige.points) : 0;
    var totalP = (s && s.prestige && typeof s.prestige.totalPrestiges === "number") ? Math.floor(s.prestige.totalPrestiges) : 0;
    var lastEarn = (s && s.prestige && typeof s.prestige.lastPrestigePointsEarned === "number") ? Math.floor(s.prestige.lastPrestigePointsEarned) : 0;
    html.push('<div class="field-row"><span>Available</span><span class="mono" id="prestige-pp">' + pp + "</span></div>");
    html.push('<div class="field-row"><span>Total Prestiges</span><span class="mono" id="prestige-total-prestiges">' + totalP + "</span></div>");
    html.push('<div class="field-row small"><span>Last earned</span><span class="mono" id="prestige-last-earned">' + lastEarn + "</span></div>");
    html.push('<div class="field-row small"><span id="prestige-next-earned-label">' + (statusReady ? "If you prestige now" : "At target") + '</span><span class="mono" id="prestige-next-earned">+' + (statusReady ? ptsInfo.points : (ptsAtTarget.points || 0)) + "</span></div>");
    html.push("</div>");
    html.push('<div class="card-section">');
    html.push('<button class="btn btn-small btn-outline" id="btn-prestige-shop">Open Prestige Shop</button>');
    html.push("</div>");
    html.push('<div class="card-section small dim">Upgrades have caps and rising costs to keep late-game scaling stable.</div>');
    html.push("</div>");

    html.push("</div>");

    html.push('<div class="grid mt-8">');

    html.push('<div class="card">');
    html.push('<div class="card-title">Prestige Score</div>');
    html.push('<div class="card-meta">Live breakdown (diminishing returns)</div>');
    html.push('<div class="card-section">');
    html.push('<div class="flex-between">');
    html.push('<div><span class="mono" style="font-size:22px;font-weight:700;" id="prestige-score-big">' + calc.score + "</span></div>");
    html.push('<div><span id="prestige-status" class="badge ' + (statusReady ? "badge-green" : "badge-red") + ' badge-pill">' + (statusReady ? "READY" : "LOCKED") + "</span></div>");
    html.push("</div>");
    html.push('<div class="small dim mt-4">Target: <span class="mono" id="prestige-target">' + calc.target + "</span> \u2022 On Prestige, your next target becomes your achieved score.</div>");
    html.push("</div>");

    html.push('<div class="card-section mt-4">');
    html.push('<div class="table-scroll"><table class="table"><thead><tr><th>Category</th><th>Raw</th><th>Score</th><th>Hint</th></tr></thead><tbody>');
    function row(label, raw, score, hint, idScore, idRaw) {
      html.push("<tr>");
      html.push("<td>" + label + "</td>");
      html.push('<td class="mono" id="' + idRaw + '">' + raw + "</td>");
      html.push('<td class="mono" id="' + idScore + '">' + Math.floor(score || 0) + "</td>");
      html.push('<td class="small dim">' + (hint || "") + "</td>");
      html.push("</tr>");
    }
    var b = calc.breakdown || {};
    row("BTC value", fmtUsd(b.btcValueUsd ? b.btcValueUsd.raw : 0), b.btcValueUsd ? b.btcValueUsd.score : 0, b.btcValueUsd ? b.btcValueUsd.hint : "", "prestige-score-btc", "prestige-raw-btc");
    row("Altcoins value", fmtUsd(b.altValueUsd ? b.altValueUsd.raw : 0), b.altValueUsd ? b.altValueUsd.score : 0, b.altValueUsd ? b.altValueUsd.hint : "", "prestige-score-alts", "prestige-raw-alts");
    row("Cash", fmtUsd(b.cashUsd ? b.cashUsd.raw : 0), b.cashUsd ? b.cashUsd.score : 0, b.cashUsd ? b.cashUsd.hint : "", "prestige-score-cash", "prestige-raw-cash");
    row("Bank deposits", fmtUsd(b.bankBalanceUsd ? b.bankBalanceUsd.raw : 0), b.bankBalanceUsd ? b.bankBalanceUsd.score : 0, b.bankBalanceUsd ? b.bankBalanceUsd.hint : "", "prestige-score-bank", "prestige-raw-bank");
    row("Company balances", fmtUsd(b.companyBalancesUsd ? b.companyBalancesUsd.raw : 0), b.companyBalancesUsd ? b.companyBalancesUsd.score : 0, b.companyBalancesUsd ? b.companyBalancesUsd.hint : "", "prestige-score-comp", "prestige-raw-comp");
    row("Net worth", fmtUsd(b.netWorthUsd ? b.netWorthUsd.raw : 0), b.netWorthUsd ? b.netWorthUsd.score : 0, b.netWorthUsd ? b.netWorthUsd.hint : "", "prestige-score-worth", "prestige-raw-worth");
    row("Education", "L" + (b.educationLevel ? b.educationLevel.raw : 0), b.educationLevel ? b.educationLevel.score : 0, b.educationLevel ? b.educationLevel.hint : "", "prestige-score-edu", "prestige-raw-edu");
    row("Education runs", String(b.eduRuns ? b.eduRuns.raw : 0), b.eduRuns ? b.eduRuns.score : 0, b.eduRuns ? b.eduRuns.hint : "", "prestige-score-runs", "prestige-raw-runs");
    row("Months lived", String(b.monthsLived ? b.monthsLived.raw : 0), b.monthsLived ? b.monthsLived.score : 0, b.monthsLived ? b.monthsLived.hint : "", "prestige-score-months", "prestige-raw-months");
    var qRaw = b.questsCompleted ? (String(b.questsCompleted.raw) + (typeof b.questsCompleted.unique === "number" ? (" (" + b.questsCompleted.unique + " unique)") : "")) : "0";
    row("Quest completions", qRaw, b.questsCompleted ? b.questsCompleted.score : 0, b.questsCompleted ? b.questsCompleted.hint : "", "prestige-score-quests", "prestige-raw-quests");
    html.push("</tbody></table></div>");
    html.push("</div>");

    html.push("</div>");

    html.push('<div class="card">');
    html.push('<div class="card-title">Education Runs</div>');
    html.push('<div class="card-meta">Tracked per job & course</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Total runs</span><span class="mono" id="prestige-runs-total">' + Math.floor(runs.eduRunsTotal || 0) + "</span></div>");
    html.push("</div>");
    html.push('<div class="card-section small dim">Education-related jobs (min education > 0) count each started shift. Courses count each completion.</div>');
    html.push('<div class="card-section mt-4">');
    html.push('<div class="edu-benefit small">Jobs</div>');
    if (!jobEntries.length) {
      html.push('<div class="small dim">No tracked education-job runs yet.</div>');
    } else {
      html.push('<div class="table-scroll"><table class="table"><thead><tr><th>Job</th><th>Runs</th></tr></thead><tbody>');
      for (var i = 0; i < Math.min(8, jobEntries.length); i++) {
        html.push("<tr><td>" + jobEntries[i].label + "</td><td class=\"mono\">" + jobEntries[i].count + "</td></tr>");
      }
      html.push("</tbody></table></div>");
      if (jobEntries.length > 8) html.push('<div class="small dim mt-4">+' + (jobEntries.length - 8) + " more jobs tracked.</div>");
    }
    html.push("</div>");
    html.push('<div class="card-section mt-4">');
    html.push('<div class="edu-benefit small">Courses</div>');
    if (!courseEntries.length) {
      html.push('<div class="small dim">No completed courses tracked yet.</div>');
    } else {
      html.push('<div class="table-scroll"><table class="table"><thead><tr><th>Course</th><th>Completions</th></tr></thead><tbody>');
      for (var j = 0; j < Math.min(8, courseEntries.length); j++) {
        html.push("<tr><td>" + courseEntries[j].label + "</td><td class=\"mono\">" + courseEntries[j].count + "</td></tr>");
      }
      html.push("</tbody></table></div>");
      if (courseEntries.length > 8) html.push('<div class="small dim mt-4">+' + (courseEntries.length - 8) + " more courses tracked.</div>");
    }
    html.push("</div>");
    html.push("</div>");

    html.push("</div>");
    html.push("</div>");
    return html.join("");
  };

  UI.Tabs.openPrestigeEffectsModal = function () {
    if (!UI || !UI.openModalCard) return;
    if (!Game.Prestige) return;
    var normalColor = "#96d8ff";
    var prestigeColor = "#ff4fd8";
    function fmtMult(value) {
      var v = typeof value === "number" && isFinite(value) ? value : 1;
      return "x" + v.toFixed(2);
    }
    function fmtAdd(value, suffix) {
      var v = typeof value === "number" && isFinite(value) ? value : 0;
      return (v >= 0 ? "+" : "") + v + (suffix || "");
    }
    function fmtBtc(value) {
      var v = typeof value === "number" && isFinite(value) ? value : 0;
      return (v >= 0 ? "+" : "") + v.toFixed(8) + " BTC";
    }
    var rows = [
      { label: "Wages", normal: "x1.00", prestige: fmtMult(Game.Prestige.getWageMultiplier()) },
      { label: "Job XP", normal: "x1.00", prestige: fmtMult(Game.Prestige.getJobXpMultiplier()) },
      { label: "Course speed", normal: "x1.00", prestige: fmtMult(Game.Prestige.getCourseSpeedMultiplier()) },
      { label: "Tuition cost", normal: "x1.00", prestige: fmtMult(Game.Prestige.getTuitionDiscountMultiplier()) },
      { label: "Travel cost", normal: "x1.00", prestige: fmtMult(Game.Prestige.getTravelCostMultiplier()) },
      { label: "Max energy", normal: "+0", prestige: fmtAdd(Game.Prestige.getEnergyCapBonus()) },
      { label: "Home recovery", normal: "x1.00", prestige: fmtMult(Game.Prestige.getHomeHealMultiplier()) },
      { label: "Meal storage", normal: "+0", prestige: fmtAdd(Game.Prestige.getMealStorageBonus()) },
      { label: "Tenant rent", normal: "x1.00", prestige: fmtMult(Game.Prestige.getTenantRentMultiplier()) },
      { label: "Company revenue", normal: "x1.00", prestige: fmtMult(Game.Prestige.getCompanyRevenueMultiplier()) },
      { label: "Deposit interest", normal: "x1.00", prestige: fmtMult(Game.Prestige.getDepositInterestMultiplier()) },
      { label: "Mining yield", normal: "x1.00", prestige: fmtMult(Game.Prestige.getMiningYieldMultiplier()) },
      { label: "Mining power cost", normal: "x1.00", prestige: fmtMult(Game.Prestige.getMiningPowerCostMultiplier()) },
      { label: "Starting cash", normal: "+$0", prestige: fmtAdd(Game.Prestige.getStartingCashBonus(), "") },
      { label: "Starting BTC", normal: "+0.00000000 BTC", prestige: fmtBtc(Game.Prestige.getStartingBtcBonus()) },
      { label: "Work energy cost", normal: "x1.00", prestige: fmtMult(Game.Prestige.getWorkEnergyCostMultiplier()) },
      { label: "Prestige LXP gain", normal: "x1.00", prestige: fmtMult(Game.Prestige.getLxpEarnMultiplier()) },
      { label: "Prestige LXP flat", normal: "+0", prestige: fmtAdd(Game.Prestige.getLxpFlatBonus()) },
      { label: "Prestige overflow cap", normal: "6", prestige: String(Game.Prestige.getLxpOverflowCap()) }
    ];

    var body = [];
    body.push('<div class="card-section small dim">Normal effects show the base game values. Prestige effects show your current bonuses.</div>');
    body.push('<div class="card-section">');
    body.push('<table class="table small"><thead><tr><th>Effect</th><th>Normal</th><th>Prestige</th></tr></thead><tbody>');
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      body.push('<tr>');
      body.push('<td>' + r.label + '</td>');
      body.push('<td class="mono" style="color:' + normalColor + ';">' + r.normal + '</td>');
      body.push('<td class="mono" style="color:' + prestigeColor + ';">' + r.prestige + '</td>');
      body.push('</tr>');
    }
    body.push('</tbody></table>');
    body.push('</div>');

    UI.openModalCard({
      title: "Prestige Effects",
      sub: "Normal vs prestige bonuses",
      bodyHtml: body.join(""),
      actions: [{ id: "ok", label: "Close", primary: true }],
      onAction: function (actionId, close) { close(); }
    });
  };

  UI.Tabs.updatePrestigeDynamic = function () {
    if (!Game.Prestige) return;
    Game.Prestige.ensureState();
    var calc = Game.Prestige.calculateScore();
    var statusReady = calc.score >= calc.target;
    var ptsInfo = Game.Prestige.getPointsForScore(calc.score, calc.target);

    var big = document.getElementById("prestige-score-big");
    if (big) big.textContent = String(calc.score);
    var targetEl = document.getElementById("prestige-target");
    if (targetEl) targetEl.textContent = String(calc.target);

    var status = document.getElementById("prestige-status");
    if (status) {
      status.textContent = statusReady ? "READY" : "LOCKED";
      status.classList.toggle("badge-green", statusReady);
      status.classList.toggle("badge-red", !statusReady);
    }

    function setCell(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
    var b = calc.breakdown || {};
    setCell("prestige-raw-btc", fmtUsd(b.btcValueUsd ? b.btcValueUsd.raw : 0));
    setCell("prestige-score-btc", String(Math.floor(b.btcValueUsd ? b.btcValueUsd.score : 0)));
    setCell("prestige-raw-alts", fmtUsd(b.altValueUsd ? b.altValueUsd.raw : 0));
    setCell("prestige-score-alts", String(Math.floor(b.altValueUsd ? b.altValueUsd.score : 0)));
    setCell("prestige-raw-cash", fmtUsd(b.cashUsd ? b.cashUsd.raw : 0));
    setCell("prestige-score-cash", String(Math.floor(b.cashUsd ? b.cashUsd.score : 0)));
    setCell("prestige-raw-bank", fmtUsd(b.bankBalanceUsd ? b.bankBalanceUsd.raw : 0));
    setCell("prestige-score-bank", String(Math.floor(b.bankBalanceUsd ? b.bankBalanceUsd.score : 0)));
    setCell("prestige-raw-comp", fmtUsd(b.companyBalancesUsd ? b.companyBalancesUsd.raw : 0));
    setCell("prestige-score-comp", String(Math.floor(b.companyBalancesUsd ? b.companyBalancesUsd.score : 0)));
    setCell("prestige-raw-worth", fmtUsd(b.netWorthUsd ? b.netWorthUsd.raw : 0));
    setCell("prestige-score-worth", String(Math.floor(b.netWorthUsd ? b.netWorthUsd.score : 0)));
    setCell("prestige-raw-edu", "L" + (b.educationLevel ? b.educationLevel.raw : 0));
    setCell("prestige-score-edu", String(Math.floor(b.educationLevel ? b.educationLevel.score : 0)));
    setCell("prestige-raw-runs", String(b.eduRuns ? b.eduRuns.raw : 0));
    setCell("prestige-score-runs", String(Math.floor(b.eduRuns ? b.eduRuns.score : 0)));
    setCell("prestige-raw-months", String(b.monthsLived ? b.monthsLived.raw : 0));
    setCell("prestige-score-months", String(Math.floor(b.monthsLived ? b.monthsLived.score : 0)));
    var qTxt = b.questsCompleted ? (String(b.questsCompleted.raw) + (typeof b.questsCompleted.unique === "number" ? (" (" + b.questsCompleted.unique + " unique)") : "")) : "0";
    setCell("prestige-raw-quests", qTxt);
    setCell("prestige-score-quests", String(Math.floor(b.questsCompleted ? b.questsCompleted.score : 0)));

    var s = Game.state;
    var pp = (s && s.prestige && typeof s.prestige.points === "number") ? Math.floor(s.prestige.points) : 0;
    var totalP = (s && s.prestige && typeof s.prestige.totalPrestiges === "number") ? Math.floor(s.prestige.totalPrestiges) : 0;
    var lastEarn = (s && s.prestige && typeof s.prestige.lastPrestigePointsEarned === "number") ? Math.floor(s.prestige.lastPrestigePointsEarned) : 0;
    setCell("prestige-pp", String(pp));
    setCell("prestige-total-prestiges", String(totalP));
    setCell("prestige-last-earned", String(lastEarn));

    var runs = (s && s.prestigeRun) ? s.prestigeRun : { eduRunsTotal: 0 };
    setCell("prestige-runs-total", String(Math.floor(runs.eduRunsTotal || 0)));

    var pct = Math.floor((Math.min(calc.target, Math.max(0, calc.score)) / Math.max(1, calc.target)) * 100);
    pct = Math.max(0, Math.min(100, pct));
    var bar = document.getElementById("prestige-progress-bar");
    if (bar) bar.style.width = pct + "%";
    var label = document.getElementById("prestige-progress-label");
    if (label) label.textContent = calc.score + " / " + calc.target;
    var remaining = Math.max(0, calc.target - calc.score);
    var sub = document.getElementById("prestige-progress-sub");
    if (sub) sub.textContent = statusReady ? ("Ready \u2022 Tier: " + ptsInfo.tierLabel + " (+" + ptsInfo.points + " LXP)") : (remaining + " more to reach Prestige");

    var ptsAtTarget = Game.Prestige.getPointsForScore(calc.target, calc.target);
    var hint = document.getElementById("prestige-lxp-hint");
    if (hint) {
      hint.innerHTML = (statusReady ? ("If you prestige now: +" + ptsInfo.points + " LXP") : ("At target: +" + (ptsAtTarget.points || 0) + " LXP")) + ' \u2022 Use <span class="mono">Preview Reset</span> to see the exact LXP reward at your current score.';
    }
    var nextEarned = document.getElementById("prestige-next-earned");
    var nextEarnedLabel = document.getElementById("prestige-next-earned-label");
    if (nextEarned) nextEarned.textContent = "+" + (statusReady ? ptsInfo.points : (ptsAtTarget.points || 0));
    if (nextEarnedLabel) nextEarnedLabel.textContent = statusReady ? "If you prestige now" : "At target";

    var btn = document.getElementById("btn-prestige-now");
    if (btn) {
      btn.disabled = !statusReady;
      btn.textContent = statusReady ? "Prestige" : "Prestige (Locked)";
    }
  };

  UI.Tabs.openPrestigeConfirmModal = function (forcePreviewOnly) {
    if (!Game.Prestige || !UI.openModalCard) return;
    Game.Prestige.ensureState();
    var calc = Game.Prestige.calculateScore();
    var ptsInfo = Game.Prestige.getPointsForScore(calc.score, calc.target);
    var can = calc.score >= calc.target;
    var previewOnly = !!forcePreviewOnly || !can;

    var nextTarget = Math.max(1, Math.floor(calc.score));
    var remaining = Math.max(0, calc.target - calc.score);
    var overflow = Math.max(0, calc.score - calc.target);

    var body = [];
    body.push('<div class="card-section">');
    body.push('<div class="field-row"><span>Current score</span><span class="mono">' + calc.score + "</span></div>");
    body.push('<div class="field-row"><span>Target score</span><span class="mono">' + calc.target + "</span></div>");
    body.push('<div class="field-row small"><span>Overflow</span><span class="mono">' + overflow + "</span></div>");
    body.push('<div class="field-row small"><span>Next target (after Prestige)</span><span class="mono">' + nextTarget + "</span></div>");
    body.push("</div>");

    body.push('<div class="grid mt-8">');
    body.push('<div class="card">');
    body.push('<div class="card-title">What Resets</div>');
    body.push('<div class="card-section small dim">Your current life is wiped and you start over.</div>');
    body.push('<div class="card-section small"><ul style="padding-left:18px;">');
    body.push("<li>Money, BTC, altcoins, bank balances</li>");
    body.push("<li>Education level and job levels</li>");
    body.push("<li>Properties, tenants, companies, inventory</li>");
    body.push("<li>Travel / active shifts / course progress</li>");
    body.push("</ul></div>");
    body.push("</div>");
    body.push('<div class="card">');
    body.push('<div class="card-title">What Stays</div>');
    body.push('<div class="card-section small dim">Meta progression remains across prestiges.</div>');
    body.push('<div class="card-section small"><ul style="padding-left:18px;">');
    body.push("<li>Life Experience Points and upgrades</li>");
    body.push("<li>Total prestige count</li>");
    body.push("<li>Next target becomes your achieved score</li>");
    body.push("</ul></div>");
    body.push("</div>");
    body.push("</div>");

    var actions = [];
    if (!previewOnly) {
      actions.push({ id: "prestige_confirm", label: "Prestige (+" + ptsInfo.points + " LXP)", primary: true });
    }
    actions.push({ id: "prestige_shop", label: "Open Shop", primary: false });

    var overlay = UI.openModalCard({
      title: previewOnly ? "Prestige Preview" : "Prestige Confirmation",
      sub: previewOnly ? (can ? ("You will earn +" + ptsInfo.points + " Life Experience Points (" + ptsInfo.tierLabel + ").") : ("Locked: " + remaining + " more score needed. At target: +" + (Game.Prestige.getPointsForScore(calc.target, calc.target).points || 0) + " LXP.")) : ("You will earn +" + ptsInfo.points + " Life Experience Points (" + ptsInfo.tierLabel + ")."),
      large: true,
      bodyHtml: body.join(""),
      actions: actions,
      onAction: function (actionId, close) {
        if (actionId === "prestige_shop") {
          close();
          UI.Tabs.openPrestigeShopModal();
          return;
        }
        if (actionId === "prestige_confirm") {
          var res = Game.Prestige.performPrestige();
          if (!res || !res.ok) {
            if (Game.addNotification) Game.addNotification(res && res.message ? res.message : "Prestige failed.");
            close();
            return;
          }
          // Reset UI counters for topbar init.
          if (window.UI) {
            UI.moneyInit = false;
            UI.btcInit = false;
          }
          if (UI && UI.renderPC) {
            UI.renderPC();
          }
          close();
          UI.setTab("prestige");
          UI.renderCurrentTab();
          UI.Tabs.openPrestigeShopModal(true);
        }
      }
    });
    return overlay;
  };

  UI.Tabs.openPrestigeShopModal = function (fromPrestige) {
    if (!Game.Prestige || !UI.openModalCard) return;
    Game.Prestige.ensureState();
    var selectedType = "All";
    var page = 0;
    var pageSize = 6;

    function renderShopHtml() {
      Game.Prestige.ensureState();
      var p = Game.state.prestige;
      var defsAll = Game.Prestige.config.upgrades || [];

      function getTypeLabel(def) {
        if (!def) return "Other";
        var t = def.type ? String(def.type) : "";
        if (!t) t = "Other";
        return t;
      }

      var typeOrder = ["All", "LXP", "Work", "School", "Travel", "Survival", "Economy", "Property", "Business", "Mining", "Start", "One-Time", "Other"];
      var typeCounts = {};
      for (var i0 = 0; i0 < defsAll.length; i0++) {
        var d0 = defsAll[i0];
        if (!d0) continue;
        var tl = getTypeLabel(d0);
        typeCounts[tl] = (typeCounts[tl] || 0) + 1;
      }

      if (selectedType !== "All" && !typeCounts[selectedType]) {
        selectedType = "All";
        page = 0;
      }

      var defs = selectedType === "All"
        ? defsAll.slice()
        : defsAll.filter(function (d) { return getTypeLabel(d) === selectedType; });

      var total = defs.length;
      var pages = Math.max(1, Math.ceil(total / pageSize));
      if (page < 0) page = 0;
      if (page >= pages) page = pages - 1;
      var start = page * pageSize;
      var end = Math.min(total, start + pageSize);
      var slice = defs.slice(start, end);
      var html = [];
      html.push('<div class="card-section">');
      html.push('<div class="flex-between">');
      html.push('<div><span class="badge badge-blue badge-pill">Life Experience Points</span> <span class="mono" style="font-size:16px;font-weight:700;">' + Math.floor(p.points || 0) + "</span></div>");
      html.push('<div class="small dim">Most upgrades are capped; costs rise per tier.</div>');
      html.push("</div>");
      html.push("</div>");
      html.push('<div class="prestige-shop-tabs mt-8">');
      for (var ti = 0; ti < typeOrder.length; ti++) {
        var type = typeOrder[ti];
        if (type !== "All" && !typeCounts[type]) continue;
        var active = selectedType === type;
        html.push('<button class="btn btn-small ' + (active ? "btn-primary" : "btn-outline") + '" data-prestige-type="' + type + '">' + type + "</button>");
      }
      html.push("</div>");

      html.push('<div class="prestige-shop-pager mt-8 flex-between">');
      html.push('<div class="small dim">Showing ' + (total ? ((start + 1) + "–" + end) : "0") + " of " + total + "</div>");
      html.push('<div class="prestige-shop-pager-controls">');
      html.push('<button class="btn btn-small btn-outline" data-prestige-page="prev"' + (page <= 0 ? " disabled" : "") + ">Prev</button>");
      html.push('<span class="mono prestige-shop-page-label">Page ' + (page + 1) + " / " + pages + "</span>");
      html.push('<button class="btn btn-small btn-outline" data-prestige-page="next"' + (page >= pages - 1 ? " disabled" : "") + ">Next</button>");
      html.push("</div>");
      html.push("</div>");
      html.push('<div class="upgrade-grid mt-8">');
      for (var i = 0; i < slice.length; i++) {
        var d = slice[i];
        if (!d) continue;
        var tier = Game.Prestige.getUpgradeTier(d.id);
        var nextCost = Game.Prestige.getUpgradeCost(d.id, tier + 1);
        var canBuy = Game.Prestige.canBuyUpgrade(d.id);
        var isUnlimited = !(typeof d.maxTier === "number" && isFinite(d.maxTier) && d.maxTier > 0);
        var isMax = !isUnlimited && tier >= d.maxTier;
        var curEffect = (Game.Prestige.getUpgradeEffectTextForTier ? Game.Prestige.getUpgradeEffectTextForTier(d.id, tier) : "");
        var nextEffect = (!isMax && Game.Prestige.getUpgradeEffectTextForTier) ? Game.Prestige.getUpgradeEffectTextForTier(d.id, tier + 1) : "";
        html.push('<div class="upgrade-item">');
        html.push('<div class="flex-between">');
        html.push('<div class="modal-card-title" style="margin:0;">' + d.name + "</div>");
        html.push('<div class="badge badge-pill ' + (isMax ? "badge-green" : "badge-blue") + '">LVL ' + tier + "</div>");
        html.push("</div>");
        html.push('<div class="small dim mt-4"><span class="badge badge-pill">' + getTypeLabel(d) + "</span></div>");
        html.push('<div class="small dim mt-4">' + d.desc + "</div>");
        html.push('<div class="field-row small mt-8"><span>Current</span><span class="mono">' + (curEffect || "-") + "</span></div>");
        html.push('<div class="field-row small"><span>Next</span><span class="mono">' + (isMax ? "—" : (nextEffect || "-")) + "</span></div>");
        html.push('<div class="field-row small mt-8"><span>Next cost</span><span class="mono">' + (nextCost === null ? "-" : (nextCost + " LXP")) + "</span></div>");
        html.push('<div class="mt-8">');
        html.push('<button class="btn btn-small ' + (isMax ? "btn-outline" : "btn-primary") + '" data-prestige-buy="' + d.id + '"' + (!canBuy.ok ? " disabled" : "") + '>' + (isMax ? "Maxed" : "Buy") + "</button>");
        html.push('<div class="notice">' + (isMax ? "Fully upgraded." : (canBuy.ok ? "Affordable." : canBuy.message)) + "</div>");
        html.push("</div>");
        html.push("</div>");
      }
      html.push("</div>");
      var out = html.join("");
      // Normalize common mojibake sequences for dash/quotes that can appear from copy/paste.
      out = out.split("\u00E2\u20AC\u201C").join(" - ");
      out = out.split("\u00E2\u20AC\u201D").join("-");
      return out;
    }

    var overlay = UI.openModalCard({
      title: "Prestige Shop",
      sub: fromPrestige ? "Prestige complete. Spend your points on permanent upgrades." : "Spend Life Experience Points on permanent upgrades.",
      large: true,
      bodyHtml: '<div id="prestige-shop-body">' + renderShopHtml() + "</div>",
      actions: [],
      onAction: function () { }
    });

    if (!overlay) return null;
    overlay.addEventListener("click", function (e) {
      var typeBtn = e.target && e.target.closest ? e.target.closest("[data-prestige-type]") : null;
      if (typeBtn) {
        selectedType = String(typeBtn.getAttribute("data-prestige-type") || "All");
        page = 0;
        var bodyEl0 = overlay.querySelector("#prestige-shop-body");
        if (bodyEl0) bodyEl0.innerHTML = renderShopHtml();
        return;
      }

      var pageBtn = e.target && e.target.closest ? e.target.closest("[data-prestige-page]") : null;
      if (pageBtn) {
        var dir = String(pageBtn.getAttribute("data-prestige-page") || "");
        if (dir === "prev") page -= 1;
        else if (dir === "next") page += 1;
        var bodyEl1 = overlay.querySelector("#prestige-shop-body");
        if (bodyEl1) bodyEl1.innerHTML = renderShopHtml();
        return;
      }

      var btn = e.target && e.target.closest ? e.target.closest("[data-prestige-buy]") : null;
      if (!btn) return;
      var id = btn.getAttribute("data-prestige-buy");
      if (!id) return;
      var res = Game.Prestige.buyUpgrade(id);
      if (!res.ok) {
        if (Game.addNotification) Game.addNotification(res.message || "Cannot buy upgrade.");
      }
      var bodyEl = overlay.querySelector("#prestige-shop-body");
      if (bodyEl) bodyEl.innerHTML = renderShopHtml();
      if (UI && UI.currentTab === "prestige" && UI.updatePrestigeDynamic) UI.updatePrestigeDynamic();
    });
    return overlay;
  };
})();
