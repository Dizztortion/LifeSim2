(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderEventLogTab = function () {
    var html = [];
    html.push('<div>');
    html.push('<div class="section-title">Event Log</div>');
    html.push('<div class="section-subtitle">Browse and filter all notifications generated during your life.</div>');
    html.push('<div class="mt-8">');
    html.push('<div class="card eventlog-filters">');
    html.push('<div class="card-title">Filters</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Area</span><span>');
    html.push('<select id="eventlog-filter-area" class="input-small">');
    html.push('<option value="all">All areas</option>');
    html.push('<option value="jobs">Jobs</option>');
    html.push('<option value="school">School</option>');
    html.push('<option value="companies">Companies</option>');
    html.push('<option value="property">Property</option>');
    html.push('<option value="health">Health</option>');
    html.push('<option value="travel">Travel</option>');
    html.push('<option value="btc">BTC</option>');
    html.push('<option value="shop">Shop</option>');
    html.push('<option value="bank">Bank</option>');
    html.push('<option value="system">System</option>');
    html.push('</select>');
    html.push('</span></div>');
    html.push('<div class="field-row mt-4"><span>Text filter</span><span><input id="eventlog-filter-text" class="input-small" type="text" placeholder="Search text..."></span></div>');
    html.push('<div class="small dim mt-4">Filters are applied immediately as you type or change options.</div>');
    html.push('</div>');
    html.push('</div>');
    html.push('<div class="card eventlog-list">');
    html.push('<div class="card-title">Notifications</div>');
    html.push('<div class="eventlog-list-body">');
    html.push(UI.renderEventLogListBody());
    html.push('</div>');
    html.push('</div>');
    html.push('</div>');
    return html.join("");
  };

  UI.Tabs.renderEventLogListBody = function () {
    var s = Game.state;
    var all = (s && s.notificationLog && Array.isArray(s.notificationLog)) ? s.notificationLog : [];
    if ((!all || all.length === 0) && s && s.notifications && Array.isArray(s.notifications)) {
      all = s.notifications.slice(0);
    }
    var filterText = UI.eventLogFilterText || "";
    var filterArea = UI.eventLogFilterArea || "all";
    var filterTextLower = filterText.toLowerCase();
    var html = [];
    var any = false;
    for (var i = 0; i < all.length; i++) {
      var n = all[i];
      if (!n) continue;
      var area = n.area || "general";
      if (filterArea !== "all" && area !== filterArea) continue;
      if (filterTextLower && filterTextLower.length > 0) {
        var text = (n.text || "").toLowerCase();
        if (text.indexOf(filterTextLower) === -1) continue;
      }
      any = true;
      var t = Math.floor(n.timeMinutes || 0);
      var h = Math.floor(t / 60);
      var m = t % 60;
      var hh = (h < 10 ? "0" : "") + h;
      var mm = (m < 10 ? "0" : "") + m;
      html.push('<div class="card-section" style="border-bottom:1px solid rgba(255,255,255,0.06);padding:6px 0;">');
      html.push('<div class="small dim">Day ' + (n.day || 1) + " " + hh + ":" + mm + "</div>");
      html.push('<div>' + (n.text || "") + '</div>');
      html.push('</div>');
    }
    if (!any) {
      html.push('<div class="card-section small dim">No notifications match the current filters yet.</div>');
    }
    return html.join("");
  };
})();

