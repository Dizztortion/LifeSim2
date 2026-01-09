(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.renderPropertyTab = function () {
    var s = Game.state;
    if (Game.Property && Game.Property.ensureHousingState) {
      Game.Property.ensureHousingState();
    }
    if (Game.Property && Game.Property.ensureHomeOffers) {
      Game.Property.ensureHomeOffers();
    }
    var html = [];
    html.push('<div class="company-page">');

    // Player home / housing
    var h = s.housing || { homeId: "starter-room", status: "rent", rentPerDay: 0, maintenance: 100 };
    var homeDef = Game.Property && Game.Property.getHomeDef ? Game.Property.getHomeDef(h.homeId) : null;
    var homeName = homeDef ? homeDef.name : (h.homeId || "Home");
    var homeMaint = typeof h.maintenance === "number" ? h.maintenance : 100;
    var homeMaintPct = Math.max(0, Math.min(100, Math.round(homeMaint)));
    var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
    if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
    var isAtHome = (s.travelLocation === "Home") && (!s.travel || !s.travel.inProgress);
    var isBusy = !!(s.job && s.job.isWorking) || !!(s.school && s.school.enrolled) || !!(s.travel && s.travel.inProgress);

    // Portfolio snapshot
    var ownedCount = Array.isArray(s.properties) ? s.properties.length : 0;
    var tenants = Array.isArray(s.tenants) ? s.tenants : [];
    var activeTenants = 0;
    var rentPerDay = 0;
    for (var ti = 0; ti < tenants.length; ti++) {
      var tn = tenants[ti];
      if (!tn || !tn.id) continue;
      if (tn.leaseDaysRemaining === 0 && !tn.rent) continue;
      if (typeof tn.rent === "number" && isFinite(tn.rent) && tn.rent > 0) rentPerDay += tn.rent;
      activeTenants += 1;
    }
    var homeRent = (h.status === "rent" && typeof h.rentPerDay === "number" && isFinite(h.rentPerDay)) ? h.rentPerDay : 0;
    var netPerDay = rentPerDay - homeRent;

    html.push('<div class="card company-hero page-property">');
    html.push('<div class="section-title">Property & Tenants</div>');
    html.push('<div class="section-subtitle company-subtitle">Build recurring income by owning properties and renting them to tenants. Upgrade your home for quality-of-life bonuses.</div>');
    html.push('<div class="company-kpis company-kpis-wide mt-10">');
    html.push('<div class="kpi"><div class="kpi-label">Owned Properties</div><div class="kpi-value">' + ownedCount + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Active Tenants</div><div class="kpi-value">' + activeTenants + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Rent Income</div><div class="kpi-value">$' + rentPerDay.toFixed(0) + '/day</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Net Cashflow</div><div class="kpi-value">' + (netPerDay >= 0 ? "+" : "-") + '$' + Math.abs(netPerDay).toFixed(0) + '/day</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Home</div><div class="kpi-value">' + (h.status === "own" ? "Owned" : "Rented") + " · " + homeMaintPct + '%</div></div>');
    html.push('</div>');
    html.push('</div>');

    html.push('<div class="company-split mt-8">');

    // Home card
    html.push('<div class="card">');
    html.push('<div class="card-title">Your Home</div>');
    html.push('<div class="card-meta">' + (isAtHome ? "You are home" : "Not at home") + (s.sleeping ? " · Sleeping" : "") + '</div>');
    html.push('<div class="card-section">');
    html.push('<div class="company-kpis company-kpis-wide">');
    html.push('<div class="kpi"><div class="kpi-label">Home</div><div class="kpi-value">' + homeName + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Status</div><div class="kpi-value">' + (h.status === "own" ? "Owned" : "Rented") + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Home Rent</div><div class="kpi-value">' + (h.status === "rent" ? ("$" + (h.rentPerDay || 0).toFixed(0) + "/day") : "$0/day") + '</div></div>');
    html.push('<div class="kpi"><div class="kpi-label">Max Health / Energy</div><div class="kpi-value">' + Math.round(maxHealth) + " / " + Math.round(maxEnergy) + '</div></div>');
    html.push('</div>');
    html.push('<div class="bar-label mt-8">Maintenance</div>');
    html.push('<div class="progress"><div class="progress-fill orange" style="width:' + homeMaintPct + '%"></div></div>');
    html.push('<div class="field-row small mt-4"><span>Condition</span><span>' + homeMaintPct + '%</span></div>');
    html.push('</div>');

    html.push('<div class="card-section">');
    html.push('<div class="company-control-row">');
    html.push('<button class="btn btn-small btn-outline" id="btn-home-repair"' + (homeMaintPct >= 100 ? ' disabled' : '') + '>Repair</button>');
    html.push('<button class="btn btn-small btn-outline" id="btn-home-refresh">Refresh listings</button>');
    html.push('<button class="btn btn-small btn-outline" id="btn-home-sell"' + (h.status !== "own" || h.homeId === "starter-room" ? ' disabled' : '') + '>Sell home</button>');
    html.push('</div>');

    if (s.sleeping) {
      html.push('<div class="company-control-row mt-8">');
      html.push('<button class="btn btn-small btn-primary" id="btn-home-wake">Wake up</button>');
      html.push('</div>');
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
    } else {
      var sleepReason = "";
      if (!isAtHome) sleepReason = "Travel home to sleep.";
      else if (isBusy) sleepReason = "Finish work, education, or travel before sleeping.";
      else if (s.energy >= maxEnergy - 0.00001) sleepReason = "Energy is already full.";
      var titleAttr = sleepReason ? (' title="' + String(sleepReason).replace(/\"/g, "&quot;") + '"') : "";
      html.push('<div class="company-control-row mt-8">');
      html.push('<button class="btn btn-small btn-primary" id="btn-home-sleep"' + titleAttr + '>Sleep (10x time)</button>');
      html.push('</div>');
    }

    html.push('<div class="notice mt-8">Maintenance drops slowly over time. Used homes start around 45\u201360% but cost less to rent and buy. Repair prices change every 7 days.</div>');
    if (!isAtHome) {
      html.push('<div class="small dim mt-6">Travel home to sleep and apply upgrades.</div>');
    } else if (isBusy) {
      html.push('<div class="small dim mt-6">Finish work, education, or travel before sleeping.</div>');
    } else if (!s.sleeping && s.energy >= maxEnergy - 0.00001) {
      html.push('<div class="small dim mt-6">Energy is already full.</div>');
    }
    html.push('</div>');
    html.push('</div>');

    // Home upgrades (owned homes only)
    html.push('<div class="card">');
    html.push('<div class="card-title">Home Upgrades</div>');
    html.push('<div class="card-meta">Permanent improvements for your current home</div>');
    if (h.status !== "own") {
      html.push('<div class="card-section small dim">Own your home to unlock upgrades like a better bed and vanity.</div>');
    } else {
      var udefs = (Game.Property && Game.Property.getHomeUpgradeDefs) ? Game.Property.getHomeUpgradeDefs() : [];
      html.push('<div class="card-section">');
      html.push('<div class="upgrade-grid">');
      for (var hu = 0; hu < udefs.length; hu++) {
        var ud = udefs[hu];
        var lvl = (h.upgrades && typeof h.upgrades[ud.key] === "number") ? h.upgrades[ud.key] : 0;
        if (!isFinite(lvl) || lvl < 0) lvl = 0;
        var cost = (Game.Property && Game.Property.getHomeUpgradeCost) ? Game.Property.getHomeUpgradeCost(homeDef, ud.key, lvl) : 0;
        var disabledUp = (!isAtHome) || (s.sleeping) || (s.travel && s.travel.inProgress) || lvl >= (ud.max || 5);
        html.push('<div class="upgrade-item">');
        html.push('<div class="field-row"><span>' + ud.name + '</span><span class="mono">L' + lvl + ' / ' + (ud.max || 5) + '</span></div>');
        html.push('<div class="field-row small"><span>Effect</span><span>' + (ud.effect || "-") + '</span></div>');
        html.push('<div class="field-row small"><span>Next cost</span><span class="mono">$' + (cost || 0).toFixed(0) + '</span></div>');
        html.push('<button class="btn btn-small btn-outline mt-8 btn-home-upgrade" data-upgrade="' + ud.key + '"' + (disabledUp ? " disabled" : "") + '>Upgrade</button>');
        html.push('</div>');
      }
      html.push('</div>');
      if (!isAtHome) html.push('<div class="small dim mt-6">Travel home to apply upgrades.</div>');
      if (s.sleeping) html.push('<div class="small dim mt-6">Wake up to manage upgrades.</div>');
      html.push('</div>');
    }
    html.push('</div>');

    html.push('</div>'); // company-split

    html.push('<div class="grid mt-8">');

    // Home listings split by location and by action (rent / buy)
    var offers = Array.isArray(s.homeOffers) ? s.homeOffers : [];
    function groupOffersByLocation(list) {
      var map = {};
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        var loc = o.location || "City Centre";
        if (!map[loc]) map[loc] = [];
        map[loc].push(o);
      }
      return map;
    }
    var byLoc = groupOffersByLocation(offers);
    function renderHomeSection(action) {
      var actionTitle = action === "rent" ? "Rent Homes" : "Buy Homes";
      var actionMeta = action === "rent" ? "Sign a lease at the listed location" : "Purchase at the listed location";
      html.push('<div class="card card-wide">');
      html.push('<div class="card-title">' + actionTitle + '</div>');
      html.push('<div class="card-meta">' + actionMeta + '</div>');
      if (!offers.length) {
        html.push('<div class="card-section small dim">No listings right now. Refresh or check back later.</div>');
        html.push('</div>');
        return;
      }
      for (var loc in byLoc) {
        if (!Object.prototype.hasOwnProperty.call(byLoc, loc)) continue;
        html.push('<div class="card-section">');
        html.push('<div class="small dim" style="margin-bottom:6px;">' + loc + (s.travelLocation === loc ? ' <span class="badge badge-blue badge-pill">You are here</span>' : '') + '</div>');
        html.push('<div class="table-scroll">');
        html.push('<table class="table"><thead><tr><th>Home</th><th>Condition</th><th>' + (action === "rent" ? "Rent" : "Buy") + '</th><th></th></tr></thead><tbody>');
        var rows = byLoc[loc] || [];
        for (var ho = 0; ho < rows.length; ho++) {
          var offer = rows[ho];
          var hd = Game.Property.getHomeDef(offer.defId);
          if (!hd) continue;
          var cond = Math.max(0, Math.min(100, Math.round(offer.maintenance)));
          var usedBadge = offer.used ? ' <span class="badge badge-blue badge-pill">Used</span>' : '';
          var disabled = s.travelLocation !== loc || (s.travel && s.travel.inProgress);
          html.push('<tr>');
          html.push('<td>' + hd.name + usedBadge + '</td>');
          html.push('<td>' + cond + '%</td>');
          if (action === "rent") {
            html.push('<td>$' + (offer.rentPerDay || 0).toFixed(0) + '/day</td>');
            html.push('<td><button class="btn btn-small btn-outline btn-home-rent" data-offer="' + offer.key + '"' + (disabled ? " disabled" : "") + '>Rent here</button></td>');
          } else {
            html.push('<td>$' + (offer.buyPrice || 0).toFixed(0) + '</td>');
            html.push('<td><button class="btn btn-small btn-primary btn-home-buy" data-offer="' + offer.key + '"' + (disabled ? " disabled" : "") + '>Buy here</button></td>');
          }
          html.push('</tr>');
        }
        html.push('</tbody></table>');
        html.push('</div>');
        if (s.travelLocation !== loc) {
          html.push('<div class="small dim mt-4">Travel to ' + loc + ' to ' + (action === "rent" ? "rent" : "buy") + ' from these listings.</div>');
        }
        html.push('</div>');
      }
      html.push('</div>');
    }
    renderHomeSection("rent");
    // Buying homes is handled via the PC Internet -> Property News.

    html.push('<div class="card card-wide">');
    html.push('<div class="card-title">Market</div>');
    html.push('<div class="card-section table-scroll">');
    html.push('<table class="table"><thead><tr><th>Property</th><th>Price</th><th>Base rent</th><th></th></tr></thead><tbody>');
    for (var i = 0; i < Game.Property.market.length; i++) {
      var p = Game.Property.market[i];
      var owned = false;
      for (var j = 0; j < s.properties.length; j++) {
        if (s.properties[j].id === p.id) { owned = true; break; }
      }
      html.push('<tr>');
      html.push('<td>' + p.name + '</td>');
      html.push('<td>$' + p.price.toFixed(0) + '</td>');
      html.push('<td>$' + p.baseRent.toFixed(0) + '/day</td>');
      html.push('<td><button class="btn btn-small btn-outline btn-buy-property" data-prop="' + p.id + '"' + (owned ? ' disabled' : '') + '>' + (owned ? 'Owned' : 'Buy') + '</button></td>');
      html.push('</tr>');
    }
    html.push('</tbody></table>');
    html.push('</div>');
    html.push('</div>');

    html.push('<div class="card card-wide">');
    html.push('<div class="card-title">Owned Properties</div>');
    html.push('<div class="card-meta">Tenants, lease health, and maintenance</div>');
    if (!Array.isArray(s.properties) || s.properties.length === 0) {
      html.push('<div class="card-section small dim">You don\'t own any properties yet.</div>');
    } else {
      html.push('<div class="card-section">');
      html.push('<div class="company-list">');
      for (var k = 0; k < s.properties.length; k++) {
        var op = s.properties[k];
        var def = Game.Property.getPropertyDef(op.id);
        var tenantName = "Vacant";
        var ratingLabel = "-";
        var leaseLabel = "-";
        var rentLabel = "-";
        var cond2 = typeof op.maintenance === "number" ? Math.round(op.maintenance) : 95;
        if (cond2 < 0) cond2 = 0;
        if (cond2 > 100) cond2 = 100;
        if (op.tenantId) {
          for (var t = 0; t < tenants.length; t++) {
            if (tenants[t].id === op.tenantId) {
              tenantName = tenants[t].name || "Tenant";
              var rating = typeof tenants[t].rating === "number" ? tenants[t].rating : 0;
              var stars = Game.Property && Game.Property.getTenantRatingStars ? Game.Property.getTenantRatingStars(rating) : (rating / 20);
              ratingLabel = stars.toFixed(1) + " / 5";
              var daysLeft = typeof tenants[t].leaseDaysRemaining === "number" ? tenants[t].leaseDaysRemaining : 0;
              var monthsLeft = Math.max(0, Math.ceil(daysLeft / 30));
              leaseLabel = monthsLeft + " mo";
              rentLabel = "$" + (tenants[t].rent || 0).toFixed(0) + "/day";
              break;
            }
          }
        }
        html.push('<div class="company-list-item">');
        html.push('<div class="company-list-main">');
        html.push('<div class="company-list-title">' + (def ? def.name : op.id) + '</div>');
        html.push('<div class="company-list-sub">Tenant: ' + tenantName + " \u2022 Condition: " + cond2 + "% \u2022 Rent: " + rentLabel + "</div>");
        html.push('<div class="company-list-sub mt-4">Rating: ' + ratingLabel + " \u2022 Lease: " + leaseLabel + "</div>");
        html.push('</div>');
        html.push('<div class="company-list-side">');
        html.push('<button class="btn btn-small btn-primary btn-manage-prop" data-prop="' + op.id + '">Manage</button>');
        html.push('</div>');
        html.push('</div>');
      }
      html.push('</div>');
      html.push('</div>');
    }
    html.push('<div class="card-section small dim">Tenant rating affects maintenance decay: above 2.5/5 slows deterioration; below does not.</div>');
    html.push('</div>');

    html.push('</div>'); // owned properties card
    html.push('</div>'); // grid
    html.push('</div>'); // company-page
    return html.join("");
  };

  UI.Tabs.updatePropertyDynamic = function () {
    var s = Game.state;
    var barEl = document.getElementById("sleep-energy-bar");
    var etaEl = document.getElementById("sleep-eta");
    if (!barEl && !etaEl) return;
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
  };
})();
