(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderTravelTab = function () {
    var s = Game.state;
    var html = [];

    var travelCost = Game.Economy ? (Game.Economy.travelBaseCost || 0) : 0;
    if (Game.Prestige && typeof Game.Prestige.getTravelCostMultiplier === "function") {
      travelCost *= Game.Prestige.getTravelCostMultiplier();
    }
    travelCost = Math.round(travelCost * 100) / 100;

    var blockedReason = "";
    if (Game.blockIfSleeping && s.sleeping) blockedReason = "Wake up before traveling.";
    else if (s.job && s.job.isWorking) blockedReason = "Finish your work shift before travelling.";
    else if (s.school && s.school.enrolled) blockedReason = "Finish your current course before travelling.";

    function iconSvg(type) {
      if (type === "home") return '<svg viewBox="0 0 24 24" fill="none"><path d="M3 11.5L12 4l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 10.5V20h11V10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      if (type === "city") return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V8l6-3v15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20V4l10 4v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 9h4M13 13h4M13 17h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      if (type === "factory") return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10l6 3V10l6 3V8l4 2v10H4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 20v-4M12 20v-6M16 20v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      if (type === "hospital") return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H4Z" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M7 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      if (type === "nature") return '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s6-4 6-11a6 6 0 0 0-12 0c0 7 6 11 6 11Z" stroke="currentColor" stroke-width="2"/><path d="M12 12c0-4 3-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      return '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 4v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    }

    function locIconType(id) {
      if (id === "Home") return "home";
      if (id === "City Centre") return "city";
      if (id === "Industrial Park") return "factory";
      if (id === "Hospital") return "hospital";
      if (id === "Countryside") return "nature";
      return "other";
    }

    html.push('<div class="company-page">');
    html.push('<div class="card company-hero page-travel">');
    html.push('<div class="section-title">Travel</div>');
    html.push('<div class="section-subtitle company-subtitle">Move around the city and across the UK. Locations unlock different opportunities (property, equipment, healthcare and work).</div>');
    html.push('<div class="company-kpis company-kpis-wide mt-10">');
    html.push('<div class="kpi"><div class="kpi-label">City Location</div><div class="kpi-value">' + (s.travelLocation || "-") + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">City Travel Cost</div><div class="kpi-value">$' + travelCost.toFixed(0) + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Status</div><div class="kpi-value">' + ((s.travel && s.travel.inProgress) ? "Travelling" : ((s.ukTravel && s.ukTravel.inProgress) ? "UK Travelling" : "Idle")) + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Availability</div><div class="kpi-value">' + (blockedReason ? "Blocked" : "Available") + '</div></div>');
    html.push('</div>');
    if (blockedReason) html.push('<div class="notice mt-10">' + blockedReason + "</div>");
    html.push('</div>');

    html.push('<div class="grid mt-8">');

    // City travel status
    var t = s.travel || {};
    html.push('<div class="card">');
    html.push('<div class="card-title">City Travel</div>');
    html.push('<div class="card-meta">Within the city</div>');
    html.push('<div class="card-section">');
    if (t.inProgress) {
      var total = t.totalMinutes || 1;
      var remaining = t.remainingMinutes || 0;
      var done = total - remaining;
      if (done < 0) done = 0;
      if (done > total) done = total;
      var percent = Math.floor((done / total) * 100);
      html.push('<div class="field-row"><span>From</span><span>' + (t.from || "-") + '</span></div>');
      html.push('<div class="field-row"><span>To</span><span>' + (t.to || "-") + '</span></div>');
      html.push('<div class="bar-label mt-4">Travel progress</div>');
      html.push('<div class="progress"><div id="travel-progress-bar" class="progress-fill blue" style="width:' + percent + '%"></div></div>');
    } else {
      html.push('<div class="small dim">Not currently travelling. Pick a destination below to move around the city.</div>');
    }
    html.push('</div>');
    html.push('</div>');

    // UK travel (real locations).
    html.push('</div>');

    html.push('<div class="card mt-8">');
    html.push('<div class="card-title">City Destinations</div>');
    html.push('<div class="card-meta">Choose where you want to be next</div>');
    html.push('<div class="card-section">');
    html.push('<div class="travel-dest-grid">');
    for (var i = 0; i < Game.World.locations.length; i++) {
      var loc = Game.World.locations[i];
      var isHere = s.travelLocation === loc.id;
      var disabled = !!blockedReason || isHere || (s.travel && s.travel.inProgress);
      var iconType = locIconType(loc.id);
      var iconClass = "travel-icon-" + iconType;
      var title = blockedReason ? (' title="' + String(blockedReason).replace(/\"/g, "&quot;") + '"') : "";

      html.push('<div class="travel-dest travel-dest-' + iconType + '">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon ' + iconClass + '">' + iconSvg(iconType) + "</div>");
      html.push('<div style="min-width:0;">');
      html.push('<div class="company-list-title" style="font-size:13px;">' + (loc.name || loc.id) + '</div>');
      html.push('<div class="company-list-sub">' + (loc.description || "") + '</div>');
      html.push("</div>");
      html.push("</div>");
      html.push('<div class="company-badges">');
      if (isHere) html.push('<span class="badge badge-pill badge-blue">Current</span>');
      else html.push('<span class="badge badge-pill">Travel</span>');
      if (loc.id === "Home") html.push('<span class="badge badge-pill badge-green">Rest</span>');
      if (loc.id === "Hospital") html.push('<span class="badge badge-pill badge-red">Care</span>');
      html.push("</div>");
      html.push("</div>");

      html.push('<div class="travel-dest-actions mt-10">');
      html.push('<button class="btn btn-small ' + (isHere ? "btn-outline" : "btn-primary") + ' btn-travel" data-loc="' + loc.id + '"' + (disabled ? " disabled" : "") + title + '>' + (isHere ? "You are here" : ("Travel ($" + travelCost.toFixed(0) + ")")) + "</button>");
      html.push("</div>");
      html.push("</div>");
    }
    html.push("</div>");
    html.push("</div>");
    html.push("</div>");

    html.push("</div>");
    return html.join("");
  };

  UI.Tabs.updateTravelDynamic = function () {
    var s = Game.state;
    if (!s) return;
    var t = s.travel || {};
    var bar = document.getElementById("travel-progress-bar");
    if (!bar) return;
    if (!t.inProgress) {
      bar.style.width = "0%";
      return;
    }
    var total = t.totalMinutes || 1;
    var remaining = t.remainingMinutes || 0;
    var done = total - remaining;
    if (done < 0) done = 0;
    if (done > total) done = total;
    var percent = Math.floor((done / total) * 100);
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    bar.style.width = percent + "%";
  };
})();
