(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderJobsTab = function () {
    var s = Game.state;
    var j = s.job;
    var def = Game.Jobs.defs[j.current] || Game.Jobs.defs.none;
    var totalShiftMinutes = 8 * 60;
    var remainingMinutes = j.isWorking ? Math.max(0, totalShiftMinutes - j.shiftMinutes) : totalShiftMinutes;
    var remHours = Math.floor(remainingMinutes / 60);
    var remMins = Math.floor(remainingMinutes % 60);
    var shiftTimeLabel = remHours + ":" + (remMins < 10 ? "0" + remMins : remMins);
    var progressShift = j.isWorking ? Math.min(100, Math.floor((j.shiftMinutes / (8 * 60)) * 100)) : 0;
    var currentLocation = s.travelLocation || "Home";
    function fmtTime(mins) {
      var m = Math.max(0, Math.floor(mins || 0));
      var h = Math.floor(m / 60);
      var mm = m % 60;
      return h + ":" + (mm < 10 ? "0" + mm : mm);
    }
    if (Game.Jobs && Game.Jobs.ensureOffersForCurrentLocation) {
      if (Game.Jobs.ensureJobProgress) {
        Game.Jobs.ensureJobProgress();
      }
      Game.Jobs.ensureOffersForCurrentLocation();
    }
    var offers = (s.jobOffers && s.jobOffers[currentLocation]) ? s.jobOffers[currentLocation].slice() : [];
    if (Game.Jobs && Game.Jobs.filterVisibleOffers) {
      offers = Game.Jobs.filterVisibleOffers(currentLocation, offers);
    }
    if (Game.Jobs && Game.Jobs.ensureJobProgress) {
      Game.Jobs.ensureJobProgress();
    }
    var hiddenMap = (j && j.hidden && typeof j.hidden === "object") ? j.hidden : {};
    var pinnedJobId = (j && typeof j.current === "string" && j.current !== "none") ? j.current : null;
    function isHiddenJob(jobId) {
      if (!jobId) return false;
      if (jobId === j.current) return false;
      return !!hiddenMap[jobId];
    }
    var visibleOffers = [];
    for (var oi = 0; oi < offers.length; oi++) {
      var oId = offers[oi];
      if (isHiddenJob(oId)) continue;
      visibleOffers.push(oId);
    }

    // Hidden jobs list (for this location/day), so the player can unhide them.
    var hiddenHere = [];
    for (var hi = 0; hi < offers.length; hi++) {
      var hid = offers[hi];
      if (isHiddenJob(hid)) hiddenHere.push(hid);
    }

    // Always show the current job first (except "none").
    var listToRender = [];
    if (pinnedJobId) listToRender.push(pinnedJobId);
    for (var li = 0; li < visibleOffers.length; li++) {
      if (visibleOffers[li] === pinnedJobId) continue;
      listToRender.push(visibleOffers[li]);
    }

    var isTravelling = !!(Game.state.travel && Game.state.travel.inProgress);
    var isInSchool = !!(Game.state.school && Game.state.school.enrolled);
    var hasHiringLock = !!(j.pendingApplication || j.pendingOffer);
    var html = [];
    html.push('<div>');
    html.push('<div class="section-title">Jobs & Promotions</div>');
    html.push('<div class="section-subtitle">Work regular shifts to earn money and job XP. Steam train driving includes live control of coal, pressure and speed.</div>');
    html.push('<div class="grid mt-8">');
    html.push('<div class="card">');
    html.push('<div class="card-title">Current Job</div>');
    html.push('<div class="card-meta">Work status</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Role</span><span id="job-role">' + def.name + ' (L' + j.level + ')</span></div>');
    var baseWage = Game.Economy.wages[j.current] || 0;
    if (j.current !== "none" && baseWage > 0) {
      var levelMult = 1 + j.level * 0.15;
      var hourWage = baseWage * levelMult;
      html.push('<div class="field-row"><span>Pay rate</span><span id="job-wage">$' + hourWage.toFixed(2) + '/hr</span></div>');
    }
    html.push('<div class="field-row"><span>Shift status</span><span id="job-shift-status">' + (j.isWorking ? "On shift (" + shiftTimeLabel + ")" : "Off shift") + '</span></div>');
    var jobMaxXp = (Game.Jobs && typeof Game.Jobs.getXpRequiredForNextLevel === "function") ? Game.Jobs.getXpRequiredForNextLevel(j.current, j.level) : (100 + j.level * 70);
    html.push('<div class="field-row"><span>Work Experience</span><span id="job-xp-val">' + j.xp.toFixed(1) + ' / ' + jobMaxXp.toFixed(1) + '</span></div>');
    html.push('<div class="field-row"><span>Work power</span><span class="work-power-value"><span class="work-power-total" id="job-work-power-total">0.00 XP/min</span><span class="work-power-edu" id="job-work-power-edu">(+0% education boost)</span></span></div>');
    html.push('</div>');
    html.push('<div class="card-section">');
    var xpPercent = jobMaxXp > 0 ? Math.floor((j.xp / jobMaxXp) * 100) : 0;
    if (xpPercent < 0) xpPercent = 0;
    if (xpPercent > 100) xpPercent = 100;
    html.push('<div class="bar-label">Work experience progress</div>');
    html.push('<div class="progress"><div id="job-xp-progress" class="progress-fill cyan" style="width:' + xpPercent + '%"></div></div>');
    html.push('<div class="bar-label">Shift progress</div>');
    html.push('<div class="progress"><div id="job-shift-progress" class="progress-fill violet" style="width:' + progressShift + '%"></div></div>');
    html.push('</div>');
    html.push('<div class="card-section">');
    if (!j.isWorking) {
      html.push('<button class="btn btn-small btn-primary" id="btn-start-shift">Start shift</button> ');
    }
    if (j.isWorking) {
      html.push('<button class="btn btn-small btn-outline" id="btn-end-shift">End shift</button>');
    }
    html.push('<div class="notice">Each full shift is 8 in-game hours. Low energy or health reduces your safety margin.</div>');
    html.push('</div>');
    html.push('</div>');
    html.push('<div class="card">');
    html.push('<div class="card-title">Jobs</div>');
    html.push('<div class="card-meta">Job offers available at ' + currentLocation + ' (2–4 per day' + (pinnedJobId ? ", plus your current job" : "") + ')</div>');

    var rej = Array.isArray(j.rejections) ? j.rejections : [];
    if ((j.pendingApplication && j.pendingApplication.jobId) || (j.pendingOffer && j.pendingOffer.jobId) || rej.length) {
      html.push('<div class="card-section">');
      html.push('<div class="card-title">Hiring</div>');
      if (j.pendingApplication && j.pendingApplication.jobId) {
        var appJobId = j.pendingApplication.jobId;
        var appDef = Game.Jobs.defs[appJobId] || { name: appJobId };
        var appTotal = j.pendingApplication.totalMinutes || 0;
        var appRem = j.pendingApplication.remainingMinutes || 0;
        var appPct = appTotal > 0 ? Math.floor(((appTotal - appRem) / appTotal) * 100) : 0;
        if (appPct < 0) appPct = 0;
        if (appPct > 100) appPct = 100;
        html.push('<div class="small dim mt-4">Application in progress</div>');
        html.push('<div class="field-row small mt-4"><span>Role</span><span>' + appDef.name + '</span></div>');
        html.push('<div class="field-row small"><span>Time remaining</span><span id="job-app-time">' + fmtTime(appRem) + '</span></div>');
        html.push('<div class="progress mt-4"><div id="job-app-bar" class="progress-fill cyan" style="width:' + appPct + '%"></div></div>');
        html.push('<div class="flex-row mt-4"><button class="btn btn-small btn-outline" id="btn-job-app-cancel">Cancel</button></div>');
      } else if (j.pendingOffer && j.pendingOffer.jobId) {
        var offerJobId = j.pendingOffer.jobId;
        var offerDef = Game.Jobs.defs[offerJobId] || { name: offerJobId };
        var offerTotal = j.pendingOffer.totalMinutes || 0;
        var offerRem = j.pendingOffer.remainingMinutes || 0;
        var offerPct = offerTotal > 0 ? Math.floor(((offerTotal - offerRem) / offerTotal) * 100) : 0;
        if (offerPct < 0) offerPct = 0;
        if (offerPct > 100) offerPct = 100;
        html.push('<div class="small dim mt-4">Job offer received</div>');
        html.push('<div class="field-row small mt-4"><span>Role</span><span>' + offerDef.name + '</span></div>');
        html.push('<div class="field-row small"><span>Expires in</span><span id="job-offer-time">' + fmtTime(offerRem) + '</span></div>');
        html.push('<div class="progress mt-4"><div id="job-offer-bar" class="progress-fill violet" style="width:' + offerPct + '%"></div></div>');
        html.push('<div class="flex-row mt-4"><button class="btn btn-small btn-primary" id="btn-job-offer-accept">Accept</button> <button class="btn btn-small btn-outline" id="btn-job-offer-reject">Reject</button></div>');
      } else {
        html.push('<div class="small dim mt-4">No pending applications or offers.</div>');
      }
      if (rej.length) {
        var recent = rej.slice(-5).reverse();
        html.push('<div class="small dim mt-8">Recent rejections</div>');
        for (var rr = 0; rr < recent.length; rr++) {
          var r = recent[rr] || {};
          var when = (typeof r.day === "number" ? ("Day " + r.day) : "");
          if (r.clock) when += (when ? " " : "") + r.clock;
          var label = (when ? when + " - " : "") + (r.jobName || r.jobId || "Job") + ": " + (r.message || "Rejected.");
          html.push('<div class="small mt-4">' + label + '</div>');
        }
      }
      html.push('</div>');
    }
    if (!listToRender.length) {
      html.push('<div class="card-section"><div class="small dim">No job offers at this location today. Check back tomorrow or travel elsewhere.</div></div>');
    } else {
      for (var i = 0; i < listToRender.length; i++) {
        var jobId = listToRender[i];
        var jd = Game.Jobs.defs[jobId];
        if (!jd) continue;
        var selected = j.current === jobId;
        var eduLevel2 = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
        var reqMet = eduLevel2 >= (jd.minEducation || 0);
        var eligibility = { ok: reqMet, message: reqMet ? "" : ("Requires education level " + (jd.minEducation || 0) + ".") };
        if (Game.Jobs && Game.Jobs._checkJobEligibility) {
          eligibility = Game.Jobs._checkJobEligibility(jobId);
        }
        var levelInfo = (Game.Jobs && Game.Jobs.getJobLevelInfo) ? Game.Jobs.getJobLevelInfo(jobId) : { level: 0, xp: 0 };
        var offerLevel = levelInfo.level || 0;
        var baseOfferWage = Game.Economy.wages[jd.id] || 0;
        var offerLevelMult = 1 + offerLevel * 0.15;
        var offerHourWage = baseOfferWage * offerLevelMult;
        html.push('<div class="card-section' + (selected ? " is-selected" : "") + '" style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:6px;margin-bottom:6px;">');
        html.push('<div class="field-row"><span class="flex-row">' + jd.name + ' (L' + offerLevel + ')' + (selected ? '<span class="badge badge-accent">Current</span>' : '') + '</span><span>$' + offerHourWage.toFixed(2) + '/hr</span></div>');
        html.push('<div class="small dim">' + jd.description + '</div>');
        html.push('<div class="field-row small mt-4"><span>Base pay</span><span>$' + baseOfferWage.toFixed(2) + '/hr</span></div>');
        html.push('<div class="field-row small"><span>Your level pay</span><span>$' + offerHourWage.toFixed(2) + '/hr</span></div>');
        html.push('<div class="field-row small mt-4"><span>Education required</span><span>L' + jd.minEducation + '</span></div>');
        html.push('<div class="flex-row mt-4">');
        var applyingThis = !!(j.pendingApplication && j.pendingApplication.jobId === jd.id);
        var offerThis = !!(j.pendingOffer && j.pendingOffer.jobId === jd.id);
        var locked = hasHiringLock && !applyingThis && !offerThis;
        var actionLabel = selected ? "Current" : (applyingThis ? "Applying..." : (offerThis ? "Offer" : (locked ? "Locked" : "Apply")));
        var canApply = !selected && !!(eligibility && eligibility.ok) && !j.isWorking && !isTravelling && !isInSchool && !hasHiringLock;
        var title = "";
        if (!eligibility || !eligibility.ok) title = (eligibility && eligibility.message) ? eligibility.message : "You do not qualify for this job.";
        else if (applyingThis) title = "Application in progress.";
        else if (offerThis) title = "Offer waiting in Hiring.";
        else if (j.isWorking) title = "Finish your shift before applying.";
        else if (isTravelling) title = "Finish travelling before applying.";
        else if (isInSchool) title = "Finish your current course before applying.";
        else if (hasHiringLock) title = "Resolve your current application/offer first.";
        var titleAttr = title ? ' title="' + String(title).replace(/\"/g, "&quot;") + '"' : "";
        html.push('<button class="btn btn-small btn-outline btn-job-apply" data-job="' + jd.id + '"' + (!canApply ? ' disabled' : '') + titleAttr + '>' + actionLabel + '</button>');
        html.push('<button class="btn btn-small btn-outline btn-square btn-job-visibility" data-job="' + jd.id + '"' + (selected ? ' disabled' : '') + ' title="' + (selected ? "Current job cannot be hidden" : "Hide this job") + '">👁</button>');
        html.push('</div>');
        html.push('</div>');
      }
    }
    if (hiddenHere.length) {
      html.push('<div class="card-section mt-8">');
      html.push('<div class="card-title">Hidden jobs</div>');
      html.push('<div class="small dim mt-4">These jobs are hidden from your offers list. Click 👁 to show them again.</div>');
      for (var hh = 0; hh < hiddenHere.length; hh++) {
        var hidId = hiddenHere[hh];
        var hj = Game.Jobs.defs[hidId];
        if (!hj) continue;
        html.push('<div class="field-row small mt-4"><span>' + hj.name + '</span><span><button class="btn btn-small btn-outline btn-square btn-job-visibility" data-job="' + hidId + '" title="Show this job">👁</button></span></div>');
      }
      html.push('</div>');
    }
    html.push('</div>');
    html.push('</div>');
    return html.join("");
  };

  UI.Tabs.animateJobXp = function (currentXp, maxXp) {
    var el = document.getElementById("job-xp-val");
    if (!el) return;
    if (typeof gsap === "undefined") {
      el.textContent = currentXp.toFixed(1) + " / " + maxXp.toFixed(1);
      return;
    }
    if (typeof UI._jobXpAnimVal !== "number") {
      UI._jobXpAnimVal = currentXp;
    }
    if (UI._jobXpLastTarget === currentXp && UI._jobXpLastMax === maxXp) {
      return;
    }
    UI._jobXpLastTarget = currentXp;
    UI._jobXpLastMax = maxXp;
    var obj = { val: UI._jobXpAnimVal };
    gsap.to(obj, {
      duration: 6.0,
      ease: "power2.out",
      val: currentXp,
      onUpdate: function () {
        UI._jobXpAnimVal = obj.val;
        el.textContent = obj.val.toFixed(1) + " / " + maxXp.toFixed(1);
      }
    });
  };

  UI.Tabs.updateJobsDynamic = function () {
    var t = Game.state.trainJob;
    var coalVal = document.getElementById("train-coal-val");
    var pressureVal = document.getElementById("train-pressure-val");
    var speedVal = document.getElementById("train-speed-val");
    var pressureBar = document.getElementById("train-pressure-bar");
    var speedBar = document.getElementById("train-speed-bar");
    var shiftBar = document.getElementById("job-shift-progress");
    var xpBar = document.getElementById("job-xp-progress");
    if (coalVal) coalVal.textContent = Math.round(t.coal) + " units";
    if (pressureVal) pressureVal.textContent = Math.round(t.pressure) + " psi";
    if (speedVal) speedVal.textContent = Math.round(t.speed) + " km/h";
    if (pressureBar) pressureBar.style.width = Math.max(0, Math.min(100, Math.round(t.pressure))) + "%";
    if (speedBar) speedBar.style.width = Math.max(0, Math.min(100, Math.round(t.speed))) + "%";
    var j = Game.state.job;
    var eduLevel = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
    var jobRoleEl = document.getElementById("job-role");
    if (jobRoleEl && Game.Jobs && Game.Jobs.defs) {
      var def = Game.Jobs.defs[j.current] || Game.Jobs.defs.none;
      jobRoleEl.textContent = def.name + " (L" + j.level + ")";
    }
    var jobWageEl = document.getElementById("job-wage");
    if (jobWageEl) {
      var baseWage = Game.Economy.wages[j.current] || 0;
      if (j.current !== "none" && baseWage > 0) {
        var levelMult = 1 + (j.level || 0) * 0.15;
        var hourWage = baseWage * levelMult;
        jobWageEl.textContent = "$" + hourWage.toFixed(2) + "/hr";
      } else {
        jobWageEl.textContent = "-";
      }
    }
    if (shiftBar) {
      var progressShift = j.isWorking ? Math.min(100, Math.floor((j.shiftMinutes / (8 * 60)) * 100)) : 0;
      shiftBar.style.width = progressShift + "%";
    }
    var statusEl = document.getElementById("job-shift-status");
    if (statusEl) {
      var totalShiftMinutes = 8 * 60;
      var remainingMinutes = j.isWorking ? Math.max(0, totalShiftMinutes - j.shiftMinutes) : totalShiftMinutes;
      var remHours = Math.floor(remainingMinutes / 60);
      var remMins = Math.floor(remainingMinutes % 60);
      var label = remHours + ":" + (remMins < 10 ? "0" + remMins : remMins);
      statusEl.textContent = j.isWorking ? ("On shift (" + label + ")") : "Off shift";
    }

    function fmtTime2(mins) {
      var m = Math.max(0, Math.floor(mins || 0));
      var h = Math.floor(m / 60);
      var mm = m % 60;
      return h + ":" + (mm < 10 ? "0" + mm : mm);
    }
    var appTimeEl = document.getElementById("job-app-time");
    var appBarEl = document.getElementById("job-app-bar");
    if (appTimeEl || appBarEl) {
      var app = j.pendingApplication;
      var appRem = app ? (app.remainingMinutes || 0) : 0;
      var appTotal = app ? (app.totalMinutes || 0) : 0;
      if (appTimeEl) appTimeEl.textContent = fmtTime2(appRem);
      if (appBarEl) {
        var pct2 = appTotal > 0 ? Math.floor(((appTotal - appRem) / appTotal) * 100) : 0;
        if (pct2 < 0) pct2 = 0;
        if (pct2 > 100) pct2 = 100;
        appBarEl.style.width = pct2 + "%";
      }
    }
    var offerTimeEl = document.getElementById("job-offer-time");
    var offerBarEl = document.getElementById("job-offer-bar");
    if (offerTimeEl || offerBarEl) {
      var offer = j.pendingOffer;
      var offerRem = offer ? (offer.remainingMinutes || 0) : 0;
      var offerTotal = offer ? (offer.totalMinutes || 0) : 0;
      if (offerTimeEl) offerTimeEl.textContent = fmtTime2(offerRem);
      if (offerBarEl) {
        var pct3 = offerTotal > 0 ? Math.floor(((offerTotal - offerRem) / offerTotal) * 100) : 0;
        if (pct3 < 0) pct3 = 0;
        if (pct3 > 100) pct3 = 100;
        offerBarEl.style.width = pct3 + "%";
      }
    }
    var jobMaxXp = (Game.Jobs && typeof Game.Jobs.getXpRequiredForNextLevel === "function") ? Game.Jobs.getXpRequiredForNextLevel(j.current, j.level) : (100 + j.level * 70);
    if (xpBar) {
      var xpPercent = jobMaxXp > 0 ? Math.floor((j.xp / jobMaxXp) * 100) : 0;
      if (xpPercent < 0) xpPercent = 0;
      if (xpPercent > 100) xpPercent = 100;
      xpBar.style.width = xpPercent + "%";
    }
    var workPowerTotalEl = document.getElementById("job-work-power-total");
    var workPowerEduEl = document.getElementById("job-work-power-edu");
    var baseXpPerMinute = 0.3;
    var prestigeXpMult = 1;
    if (Game.Prestige && typeof Game.Prestige.getJobXpMultiplier === "function") {
      prestigeXpMult = Game.Prestige.getJobXpMultiplier();
    }
    var xpAfterPrestige = baseXpPerMinute * prestigeXpMult;
    var eduMult = eduLevel > 0 ? Math.pow(1.10, eduLevel) : 1;
    var xpPerMinute = xpAfterPrestige * eduMult;
    if (workPowerTotalEl) {
      workPowerTotalEl.textContent = xpPerMinute.toFixed(2) + " XP/min";
    }
    if (workPowerEduEl) {
      var eduBonusPct = Math.max(0, (eduMult - 1) * 100);
      workPowerEduEl.textContent = "(+" + eduBonusPct.toFixed(0) + "% education boost)";
    }
    UI.animateJobXp(j.xp, jobMaxXp);
  };
})();
