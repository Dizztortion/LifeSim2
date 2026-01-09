(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    renderShopTab: function () {
      var html = [];
      html.push('<div>');
      html.push('<div class="section-title">Shops & Equipment</div>');
      html.push('<div class="section-subtitle">Buy physical items locally (travel required) and upgrade your PC via the PC Hardware Market.</div>');
      html.push('<div class="grid mt-8">');
      function getMinerName(type, lvl) {
        if (Game.Shop && Game.Shop.getMinerDeviceNameForLevel) {
          return Game.Shop.getMinerDeviceNameForLevel(type, lvl) + " (L" + lvl + ")";
        }
        return type + " L" + lvl;
      }
      // PC hardware market (curated daily offers; max 4)
      var online = (Game.Shop && Array.isArray(Game.Shop.onlineItems)) ? Game.Shop.onlineItems : [];
      if (online.length > 0) {
        if (Game.Shop && Game.Shop._refreshNetMarketItems) {
          Game.Shop._refreshNetMarketItems();
        }
        if (Game.Shop && Game.Shop.generateHardwareMarketOffers) {
          Game.Shop.generateHardwareMarketOffers();
        }
        html.push('<div class="card">');
        html.push('<div class="card-title">PC Hardware Market</div>');
        html.push('<div class="card-section small dim">Up to 4 upgrades are available each day. Offers won\'t show more than 1 level below your current PC hardware level.</div>');
        html.push('<div class="card-section">');
        html.push('<table class="table"><thead><tr><th>Item</th><th>Price</th><th></th></tr></thead><tbody>');
        var offerIds = (Game.Shop && Game.Shop.getHardwareMarketOffers) ? Game.Shop.getHardwareMarketOffers() : [];
        var byId = {};
        for (var oi2 = 0; oi2 < online.length; oi2++) {
          if (online[oi2] && online[oi2].id) byId[online[oi2].id] = online[oi2];
        }
        function getOnlineDisplayName(item) {
          if (!item) return "";
          if (item.target && item.target.indexOf("pcminer-") === 0) {
            var parts = item.target.split("-");
            var kind = parts[1] || "";
            var lvl = parseInt(parts[2], 10);
            if (isNaN(lvl)) lvl = 0;
            if (kind === "cpu") return getMinerName("CPU", lvl);
            if (kind === "gpu") return getMinerName("GPU", lvl);
            return item.name;
          }
          return item.name;
        }
        if (!offerIds || offerIds.length === 0) {
          html.push('<tr><td colspan="3" class="small dim">No upgrades available today.</td></tr>');
        } else {
          for (var oix = 0; oix < offerIds.length; oix++) {
            var id = offerIds[oix];
            var o2 = byId[id];
            if (!o2) continue;
            html.push('<tr>');
            html.push('<td>' + getOnlineDisplayName(o2) + '</td>');
            html.push('<td>$' + (o2.price || 0).toFixed(0) + '</td>');
            html.push('<td><button class="btn btn-small btn-outline btn-buy-online" data-online="' + o2.id + '">Buy</button></td>');
            html.push('</tr>');
          }
        }
        html.push('</tbody></table>');
        html.push('<div class="notice">Internet speed upgrades are listed as <span class="mono">Network Cabling</span>.</div>');
        html.push('</div>');
        html.push('</div>');
      }
      html.push('<div class="card">');
      html.push('<div class="card-title">Physical Items</div>');
      html.push('<div class="card-section">');
      html.push('<table class="table"><thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Location</th><th></th></tr></thead><tbody>');
      if (Game.Shop && Game.Shop.ensureStock) {
        Game.Shop.ensureStock();
      }
      var currentLoc = Game.state.travelLocation || "Home";
      var stockMap = Game.state.shopStock || {};
      if (Game.Shop && Game.Shop.generateOffersForLocation) {
        if (!Game.state.shopOffers || !Game.state.shopOffers[currentLoc]) {
          Game.Shop.generateOffersForLocation(currentLoc);
        }
      }
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      var pcMiner = (Game.state.btc && Game.state.btc.pcMiner) ? Game.state.btc.pcMiner : {};
      function shouldShowPcMinerItem(itemId) {
        if (!itemId) return true;
        if (itemId.indexOf("pc-ram-") === 0) {
          var normRam = itemId.replace(/-local$/i, "");
          var partsRam = normRam.split("-");
          var lvlRam = parseInt(partsRam[2], 10);
          if (isNaN(lvlRam)) return true;
          var curRam = (Game.state.pc && typeof Game.state.pc.ramLevel === "number") ? Game.state.pc.ramLevel : 0;
          return lvlRam >= (curRam - 1);
        }
        if (itemId.indexOf("pcminer-") !== 0) return true;
        var norm = itemId.replace(/-local$/i, "");
        var parts = norm.split("-");
        var kind = parts[1] || "";
        var lvl = parseInt(parts[2], 10);
        if (isNaN(lvl)) return true;
        var map = { case: "caseLevel", fans: "fansLevel", psu: "psuLevel", cpu: "cpuLevel", gpu: "gpuLevel", software: "softwareLevel" };
        var key = map[kind];
        if (!key) return true;
        var cur = pcMiner[key] || 0;
        return lvl >= (cur - 1);
      }
      function displayPhysicalName(item) {
        if (!item || !item.id) return "";
        if (item.id.indexOf("pc-ram-") === 0) {
          var normRam = item.id.replace(/-local$/i, "");
          var partsRam = normRam.split("-");
          var lvlRam = parseInt(partsRam[2], 10);
          if (isNaN(lvlRam)) lvlRam = 0;
          var gbMap = { 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64 };
          var gb = gbMap[lvlRam] || (lvlRam > 0 ? (lvlRam * 2) : 0);
          if (gb > 0) return "RAM Upgrade (L" + lvlRam + ") â€” " + gb + " GB";
        }
        if (item.id.indexOf("pcminer-") === 0) {
          var norm = item.id.replace(/-local$/i, "");
          var parts = norm.split("-");
          var kind = parts[1] || "";
          var lvl = parseInt(parts[2], 10);
          if (isNaN(lvl)) lvl = 0;
          if (kind === "cpu") return getMinerName("CPU", lvl);
          if (kind === "gpu") return getMinerName("GPU", lvl);
        }
        return item.name;
      }
      var offersByLoc = Game.state.shopOffers || {};
      if (currentLoc === "Home") {
        var homeOffers = offersByLoc["Home"] || [];
        for (var h = 0; h < homeOffers.length; h++) {
          var offer = homeOffers[h];
          var itemHome = null;
          for (var hi = 0; hi < Game.Shop.physicalItems.length; hi++) {
            if (Game.Shop.physicalItems[hi].id === offer.id) {
              itemHome = Game.Shop.physicalItems[hi];
              break;
            }
          }
          if (!itemHome) continue;
          var stockHome = typeof stockMap[itemHome.id] === "number" ? stockMap[itemHome.id] : 0;
          if (stockHome <= 0) continue;
          if (!shouldShowPcMinerItem(itemHome.id)) continue;
          var badgeHome = "";
          if (itemHome.type === "tool") badgeHome = "Tool";
          else if (itemHome.type === "hardware") badgeHome = "Hardware";
          else if (itemHome.type === "consumable") badgeHome = "Snack";
          else if (itemHome.type === "energy drink") badgeHome = "Energy drink";
          var tooltipHome = Game.Shop && Game.Shop.getItemDescription ? Game.Shop.getItemDescription(itemHome.id) : "";
          html.push('<tr title="' + tooltipHome + '">');
          html.push('<td><div class="flex-row"><span>' + displayPhysicalName(itemHome) + '</span>' + (badgeHome ? '<span class="badge badge-blue badge-pill">' + badgeHome + "</span>" : "") + "</div></td>");
          html.push('<td>$' + offer.price.toFixed(0) + '</td>');
          html.push('<td>' + stockHome + '</td>');
          html.push('<td>Home</td>');
          html.push('<td><button class="btn btn-small btn-outline btn-buy-physical" data-item="' + itemHome.id + '">Buy</button></td>');
          html.push('</tr>');
        }
      } else {
        for (var i = 0; i < Game.Shop.physicalItems.length; i++) {
          var item = Game.Shop.physicalItems[i];
          if (!item || item.location !== currentLoc) continue;
          if (!shouldShowPcMinerItem(item.id)) continue;
          var price = item.price;
          if (offersByLoc[currentLoc]) {
            var locOffers = offersByLoc[currentLoc];
            for (var j = 0; j < locOffers.length; j++) {
              if (locOffers[j].id === item.id) {
                price = locOffers[j].price;
                break;
              }
            }
          }
          var itemStock = typeof stockMap[item.id] === "number" ? stockMap[item.id] : 0;
          if (itemStock <= 0) continue;
          var badgeLabel = "";
          if (item.type === "tool") badgeLabel = "Tool";
          else if (item.type === "hardware") badgeLabel = "Hardware";
          else if (item.type === "consumable") badgeLabel = "Snack";
          else if (item.type === "energy drink") badgeLabel = "Energy drink";
          var tooltip = Game.Shop && Game.Shop.getItemDescription ? Game.Shop.getItemDescription(item.id) : "";
          html.push('<tr title="' + tooltip + '">');
          html.push('<td><div class="flex-row"><span>' + displayPhysicalName(item) + '</span>' + (badgeLabel ? '<span class="badge badge-blue badge-pill">' + badgeLabel + "</span>" : "") + "</div></td>");
          html.push('<td>$' + price.toFixed(0) + '</td>');
          html.push('<td>' + itemStock + '</td>');
          html.push('<td>' + item.location + '</td>');
          html.push('<td><button class="btn btn-small btn-outline btn-buy-physical" data-item="' + item.id + '">Buy</button></td>');
          html.push('</tr>');
        }
      }
      // Meals available at every location (merged into Physical Items)
      var meals = Game.Shop.meals || [];
      for (var m = 0; m < meals.length; m++) {
        var meal = meals[m];
        if (!meal) continue;
        var priceMeal = Game.Shop.getMealPrice(meal.id);
        var storedCount = 0;
        if (Game.Meals && Game.Meals.getCount) {
          storedCount = Game.Meals.getCount(meal.id);
        }
        var label = meal.name + (storedCount > 0 ? (" (x" + storedCount + ")") : "");
        html.push('<tr>');
        html.push('<td><div class="flex-row"><span>' + label + '</span><span class="badge badge-blue badge-pill">Meal</span></div></td>');
        html.push('<td>$' + priceMeal.toFixed(0) + '</td>');
        html.push('<td>âˆž</td>');
        html.push('<td>Any</td>');
        html.push('<td><button class="btn btn-small btn-outline btn-buy-meal" data-meal="' + meal.id + '">Buy</button></td>');
        html.push('</tr>');
      }
      html.push('</tbody></table>');
      html.push('<div class="notice">Most items require travel to buy. Meals are available anywhere.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Inventory</div>');
      html.push('<div class="card-section small dim">All items and meals you currently own. Use the Online Market app on your PC to purchase new online items.</div>');
      html.push('<div class="card-section mt-4">');
      var groups = (Game.Inventory && Game.Inventory.getGroupedInventory) ? Game.Inventory.getGroupedInventory(true) : [];
      if (!groups || groups.length === 0) {
        html.push('<div class="small dim">You have no items or meals yet.</div>');
      } else {
        html.push('<table class="table"><thead><tr><th>Item</th><th>Type</th><th>Source</th><th>Qty</th><th></th></tr></thead><tbody>');
        for (var ii = 0; ii < groups.length; ii++) {
          var g = groups[ii];
          var actionHtml = "";
          var useId = g.useId || g.id;
          if (!g.isMeal && useId && Game.Inventory && Game.Inventory.canUseItem && Game.Inventory.canUseItem(useId)) {
            actionHtml = '<button class="btn btn-small btn-outline btn-inv-use" data-item-id="' + useId + '">Use</button>';
          }
          html.push('<tr>');
          html.push('<td>' + g.name + '</td>');
          html.push('<td>' + (g.type || "-") + '</td>');
          html.push('<td>' + (g.source || "-") + '</td>');
          html.push('<td>' + (g.count || 0) + '</td>');
          html.push('<td>' + actionHtml + '</td>');
          html.push('</tr>');
        }
        html.push('</tbody></table>');
      }
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      return html.join("");
    },
  });
})();
