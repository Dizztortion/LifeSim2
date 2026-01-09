(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.showTenantPickerModal = function (propertyId) {
    var propDef = Game.Property.getPropertyDef(propertyId);
    if (!propDef) return;
    var candidates = Game.Property.generateTenantCandidates(propertyId, 5);
    if (!candidates || !candidates.length) {
      Game.addNotification("No tenants available right now.");
      return;
    }
    var html = [];
    html.push('<div class="card-section small dim">Select a tenant. Rating affects reliability and how well they maintain the property.</div>');
    html.push('<div class="card-section">');
    html.push('<div class="tenant-strip">');
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var stars = Game.Property.getTenantRatingStars(c.rating);
      html.push('<div class="tenant-card">');
      html.push('<div class="field-row"><span>Name</span><span>' + c.name + "</span></div>");
      html.push('<div class="field-row"><span>Rating</span><span class="tenant-rating">' + stars.toFixed(1) + " / 5</span></div>");
      html.push('<div class="field-row"><span>Lease</span><span>' + c.months + " months</span></div>");
      html.push('<div class="field-row"><span>Rent offer</span><span>$' + (c.rentOffer || 0).toFixed(0) + "/day</span></div>");
      html.push('<div class="field-row"><span>Reliability</span><span>' + Math.round((c.reliability || 0) * 100) + "%</span></div>");
      html.push('<div class="mt-8"><button class="btn btn-small btn-primary btn-tenant-select" data-cand="' + c.id + '">Select</button></div>');
      html.push("</div>");
    }
    html.push("</div>");
    html.push("</div>");
    var overlay = UI.openModalCard({
      title: "Find Tenants",
      sub: propDef.name,
      bodyHtml: html.join(""),
      large: true
    });
    if (!overlay) return;
    overlay.addEventListener("click", function (e) {
      var btn = e.target.closest(".btn-tenant-select");
      if (!btn) return;
      var candId = btn.getAttribute("data-cand");
      if (!candId) return;
      var list = (Game.state.propertyTenantCandidates && Game.state.propertyTenantCandidates[propertyId]) ? Game.state.propertyTenantCandidates[propertyId] : [];
      var cand = null;
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === candId) {
          cand = list[j];
          break;
        }
      }
      if (!cand) return;
      UI.confirmModal({
        title: "Confirm tenant",
        sub: propDef.name,
        confirmLabel: "Sign lease",
        bodyHtml:
          '<div class="card-section small">' +
          '<div class="field-row"><span>Tenant</span><span>' + cand.name + "</span></div>" +
          '<div class="field-row"><span>Rating</span><span>' + Game.Property.getTenantRatingStars(cand.rating).toFixed(1) + " / 5</span></div>" +
          '<div class="field-row"><span>Lease</span><span>' + cand.months + " months</span></div>" +
          '<div class="field-row"><span>Rent</span><span>$' + (cand.rentOffer || 0).toFixed(0) + "/day</span></div>" +
          "</div>",
        onConfirm: function () {
          Game.Property.acceptTenantCandidate(propertyId, candId);
          if (overlay && overlay._closeModal) overlay._closeModal();
          UI.renderCurrentTab();
          UI.showPropertyManageModal(propertyId);
        }
      });
    });
  };

  UI.Tabs.showPropertyManageModal = function (propertyId) {
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return;
    var owned = Game.state.properties || [];
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return;
    if (typeof prop.maintenance !== "number") prop.maintenance = 95;
    Game.Property.ensureUpgrades(prop);
    var maint = Math.max(0, Math.min(100, Math.round(prop.maintenance)));
    var repairCost = Game.Property.getRepairCost ? Game.Property.getRepairCost(def.price, prop.maintenance) : 0;

    var tenant = null;
    if (prop.tenantId) {
      for (var t = 0; t < Game.state.tenants.length; t++) {
        if (Game.state.tenants[t].id === prop.tenantId) {
          tenant = Game.state.tenants[t];
          break;
        }
      }
    }

    var html = [];
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Condition</span><span>' + maint + "%</span></div>");
    html.push('<div class="progress"><div class="progress-fill orange" style="width:' + maint + '%"></div></div>');
    html.push('<div class="mt-8">');
    html.push('<button class="btn btn-small btn-outline" id="btn-manage-repair"' + (maint >= 100 ? " disabled" : "") + '>Repair ($' + (repairCost || 0).toFixed(0) + ")</button>");
    html.push("</div>");
    html.push("</div>");

    html.push('<div class="card-section">');
    html.push('<div class="card-title">Tenant</div>');
    if (!tenant) {
      html.push('<div class="small dim mt-4">This property is vacant.</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-primary" id="btn-manage-find-tenant">Find tenants</button></div>');
    } else {
      var rating = typeof tenant.rating === "number" ? tenant.rating : 0;
      var stars = Game.Property.getTenantRatingStars(rating);
      var monthsLeft = Math.max(0, Math.ceil((tenant.leaseDaysRemaining || 0) / 30));
      html.push('<div class="field-row"><span>Name</span><span>' + tenant.name + "</span></div>");
      html.push('<div class="field-row"><span>Rating</span><span>' + stars.toFixed(1) + " / 5</span></div>");
      html.push('<div class="field-row"><span>Lease remaining</span><span>' + monthsLeft + " months</span></div>");
      html.push('<div class="field-row"><span>Rent</span><span>$' + (tenant.rent || 0).toFixed(0) + "/day</span></div>");
      html.push('<div class="field-row"><span>Happiness</span><span>' + (tenant.happiness || 0).toFixed(0) + "%</span></div>");
    }
    html.push("</div>");

    html.push('<div class="card-section">');
    html.push('<div class="card-title">Upgrades</div>');
    html.push('<div class="small dim mt-4">Each upgrade level increases rent offers by 2%.</div>');
    html.push('<div class="upgrade-grid mt-8">');
    var udefs = Game.Property.getUpgradeDefs ? Game.Property.getUpgradeDefs() : [];
    for (var u = 0; u < udefs.length; u++) {
      var ud = udefs[u];
      var lvl = prop.upgrades[ud.key] || 0;
      var cost = Game.Property.getUpgradeCost ? Game.Property.getUpgradeCost(def, ud.key, lvl) : 0;
      html.push('<div class="upgrade-item">');
      html.push('<div class="field-row"><span>' + ud.name + '</span><span>L' + lvl + ' / 5</span></div>');
      html.push('<div class="field-row small"><span>Next cost</span><span>$' + cost.toFixed(0) + "</span></div>");
      html.push('<button class="btn btn-small btn-outline mt-8 btn-upgrade-item" data-upgrade="' + ud.key + '"' + (lvl >= 5 ? " disabled" : "") + '>Upgrade</button>');
      html.push("</div>");
    }
    html.push("</div>");
    html.push("</div>");

    var overlay = UI.openModalCard({
      title: "Manage Property",
      sub: def.name,
      bodyHtml: html.join(""),
      large: true
    });
    if (!overlay) return;
    var repairBtn = overlay.querySelector("#btn-manage-repair");
    if (repairBtn) {
      repairBtn.addEventListener("click", function () {
        UI.confirmModal({
          title: "Repair property",
          sub: def.name,
          confirmLabel: "Repair",
          bodyHtml:
            '<div class="card-section small">' +
            '<div class="field-row"><span>Repair cost</span><span>$' + (repairCost || 0).toFixed(0) + "</span></div>" +
            '<div class="field-row"><span>Condition</span><span>' + maint + "% \u2192 100%</span></div>" +
            "</div>",
          onConfirm: function () {
            Game.Property.repairInvestmentProperty(propertyId);
            if (overlay && overlay._closeModal) overlay._closeModal();
            UI.renderCurrentTab();
            UI.showPropertyManageModal(propertyId);
          }
        });
      });
    }
    var findBtn = overlay.querySelector("#btn-manage-find-tenant");
    if (findBtn) {
      findBtn.addEventListener("click", function () {
        UI.showTenantPickerModal(propertyId);
      });
    }
    var upgradeBtns = overlay.querySelectorAll(".btn-upgrade-item");
    for (var ub = 0; ub < upgradeBtns.length; ub++) {
      upgradeBtns[ub].addEventListener("click", function (e) {
        var key = e.target.getAttribute("data-upgrade");
        var lvl = prop.upgrades[key] || 0;
        var cost = Game.Property.getUpgradeCost(def, key, lvl);
        UI.confirmModal({
          title: "Confirm upgrade",
          sub: def.name,
          confirmLabel: "Upgrade",
          bodyHtml:
            '<div class="card-section small">' +
            '<div class="field-row"><span>Upgrade</span><span>' + key + "</span></div>" +
            '<div class="field-row"><span>Cost</span><span>$' + cost.toFixed(0) + "</span></div>" +
            '<div class="field-row"><span>Effect</span><span>+2% rent offers</span></div>' +
            "</div>",
          onConfirm: function () {
            Game.Property.upgradeProperty(propertyId, key);
            if (overlay && overlay._closeModal) overlay._closeModal();
            UI.renderCurrentTab();
            UI.showPropertyManageModal(propertyId);
          }
        });
      });
    }
  };
})();
