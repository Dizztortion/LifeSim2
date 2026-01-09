(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderHealthcareTab = function () {
    var s = Game.state;
    var html = [];
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
    var isAtHome = (s.travelLocation === "Home") && (!s.travel || !s.travel.inProgress);
    var isBusy = !!(s.job && s.job.isWorking) || !!(s.school && s.school.enrolled) || !!(s.travel && s.travel.inProgress);
    html.push('<div>');
    html.push('<div class="section-title">Healthcare</div>');
    html.push('<div class="section-subtitle">Manage your health, energy and hunger. Poor health will slowly drain your progress.</div>');
    html.push('<div class="grid mt-8">');
    html.push('<div class="card">');
    html.push('<div class="card-title">Status</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Health</span><span id="hc-health">' + Math.round(s.health) + '%</span></div>');
    html.push('<div class="field-row"><span>Energy</span><span id="hc-energy">' + Math.round(s.energy) + '%</span></div>');
    html.push('<div class="field-row"><span>Hunger</span><span id="hc-hunger">' + Math.round(s.hunger) + '%</span></div>');
    html.push('<div class="field-row"><span>Location</span><span id="hc-location">' + s.travelLocation + '</span></div>');
    html.push('</div>');
    html.push('<div class="card-section small dim">Long shifts and study drain energy and increase hunger. Keep these in check to avoid health damage.</div>');
    html.push('</div>');

    html.push('<div class="card">');
    html.push('<div class="card-title">Rest</div>');
    html.push('<div class="card-section">');
    if (s.sleeping) {
      html.push('<button class="btn btn-small btn-primary" id="btn-hc-wake">Wake up</button>');
      var etaMin = (Game && typeof Game.getSleepEtaMinutes === "function") ? Game.getSleepEtaMinutes() : 0;
      if (typeof etaMin !== "number" || !isFinite(etaMin) || etaMin < 0) etaMin = 0;
      var etaH = Math.floor(etaMin / 60);
      var etaM = Math.floor(etaMin % 60);
      var etaStr = etaH + ":" + (etaM < 10 ? "0" + etaM : etaM);
      var pctSleep = Math.floor(((s.energy || 0) / maxEnergy) * 100);
      if (pctSleep < 0) pctSleep = 0;
      if (pctSleep > 100) pctSleep = 100;
      html.push('<div class="bar-label mt-8">Sleep progress</div>');
      html.push('<div class="progress"><div id="sleep-energy-bar" class="progress-fill cyan" style="width:' + pctSleep + '%"></div></div>');
      html.push('<div class="field-row small mt-4"><span>ETA to full energy</span><span id="sleep-eta">' + etaStr + '</span></div>');
      html.push('<div class="notice mt-8">Sleeping fast-forwards in-game time and will stop automatically when your energy is full.</div>');
    } else {
      var sleepReason = "";
      if (!isAtHome) sleepReason = "Travel home to sleep.";
      else if (isBusy) sleepReason = "Finish work, education, or travel before sleeping.";
      else if (s.energy >= maxEnergy - 0.00001) sleepReason = "Energy is already full.";
      var titleAttr = sleepReason ? (' title="' + String(sleepReason).replace(/\"/g, "&quot;") + '"') : "";
      html.push('<button class="btn btn-small btn-primary" id="btn-hc-sleep"' + titleAttr + '>Sleep (10x time)</button>');
      html.push('<div class="notice mt-8">Sleep at Home to recover energy faster.</div>');
      if (!isAtHome) {
        html.push('<div class="small dim mt-4">Travel home to sleep.</div>');
      } else if (isBusy) {
        html.push('<div class="small dim mt-4">Finish work, education, or travel before sleeping.</div>');
      } else if (s.energy >= maxEnergy - 0.00001) {
        html.push('<div class="small dim mt-4">Energy is already full.</div>');
      }
    }
    html.push('</div>');
    html.push('</div>');

    html.push('<div class="card">');
    html.push('<div class="card-title">Visit Healthcare</div>');
    html.push('<div class="card-section">');
    html.push('<button class="btn btn-small btn-primary" id="btn-doctor">Doctor visit ($' + Game.Economy.doctorVisit + ')</button> ');
    html.push('<button class="btn btn-small btn-outline" id="btn-hospital">Hospital stay ($' + Game.Economy.hospitalStay + ')</button>');
    html.push('<div class="notice">Doctor visits give a moderate health boost. Hospital stays are expensive but fully restore you.</div>');
    html.push('</div>');
    html.push('</div>');
    html.push('</div>');
    html.push('</div>');
    return html.join("");
  };

  UI.Tabs.updateHealthcareDynamic = function () {
    var s = Game.state;
    var hEl = document.getElementById("hc-health");
    if (hEl) hEl.textContent = Math.round(s.health) + "%";
    var eEl = document.getElementById("hc-energy");
    if (eEl) eEl.textContent = Math.round(s.energy) + "%";
    var huEl = document.getElementById("hc-hunger");
    if (huEl) huEl.textContent = Math.round(s.hunger) + "%";
    var locEl = document.getElementById("hc-location");
    if (locEl) locEl.textContent = s.travelLocation || "Home";

    var barEl = document.getElementById("sleep-energy-bar");
    var etaEl = document.getElementById("sleep-eta");
    if (barEl || etaEl) {
      var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
      if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
      var pctSleep = Math.floor(((s.energy || 0) / maxEnergy) * 100);
      if (pctSleep < 0) pctSleep = 0;
      if (pctSleep > 100) pctSleep = 100;
      if (barEl) barEl.style.width = pctSleep + "%";
      if (etaEl) {
        var etaMin = (Game && typeof Game.getSleepEtaMinutes === "function") ? Game.getSleepEtaMinutes() : 0;
        if (typeof etaMin !== "number" || !isFinite(etaMin) || etaMin < 0) etaMin = 0;
        var hh = Math.floor(etaMin / 60);
        var mm = Math.floor(etaMin % 60);
        etaEl.textContent = hh + ":" + (mm < 10 ? "0" + mm : mm);
      }
    }
  };
})();
