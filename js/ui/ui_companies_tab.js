(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    renderCompaniesTab: function () {
      if (Game.Companies && typeof Game.Companies.ensureState === "function") {
        Game.Companies.ensureState();
      }
      var c = Game.state.companies;
      var eduLevel = (Game.state.education && typeof Game.state.education.level === "number" && isFinite(Game.state.education.level)) ? Math.floor(Game.state.education.level) : 0;
      var stats = (Game.state.stats && typeof Game.state.stats === "object") ? Game.state.stats : {};
      var trainSkill = (typeof stats.trainSkill === "number" && isFinite(stats.trainSkill)) ? Math.floor(stats.trainSkill) : 0;
      var businessSkill = (typeof stats.businessSkill === "number" && isFinite(stats.businessSkill)) ? Math.floor(stats.businessSkill) : 0;
      var techSkill = (typeof stats.techSkill === "number" && isFinite(stats.techSkill)) ? Math.floor(stats.techSkill) : 0;
      var html = [];
      html.push('<div>');
      html.push('<div class="section-title">Companies</div>');
      html.push('<div class="section-subtitle">Own and operate six different companies, each with distinct mechanics and input requirements.</div>');
      html.push('<div class="grid mt-8">');
      // Rail Logistics
      if (Game.Companies && typeof Game.Companies.ensureRailLogisticsState === "function") {
        Game.Companies.ensureRailLogisticsState();
      }
      var rail = c.railLogistics;
      var railFleetCount = (rail.fleet && rail.fleet.length) ? rail.fleet.length : 0;
      var railDispatchers = (rail.staff && typeof rail.staff.dispatchers === "number" && isFinite(rail.staff.dispatchers)) ? rail.staff.dispatchers : 0;
      var railMaintenance = (rail.staff && typeof rail.staff.maintenance === "number" && isFinite(rail.staff.maintenance)) ? rail.staff.maintenance : 0;
      var railActiveRuns = Array.isArray(rail.activeRuns) ? rail.activeRuns.length : 0;
      var railFunds = (typeof rail.funds === "number" && isFinite(rail.funds)) ? rail.funds : 0;
      var railDisabled = !rail.unlocked || !!rail.activeContract;
      var railContractPct = 0;
      var railContractLabel = "Idle";
      if (rail.activeContract) {
        var rc = rail.activeContract;
        var req = (rc && typeof rc.minutesRequired === "number" && isFinite(rc.minutesRequired) && rc.minutesRequired > 0) ? rc.minutesRequired : 1;
        var prog = (rc && typeof rc.minutesProgress === "number" && isFinite(rc.minutesProgress)) ? rc.minutesProgress : 0;
        railContractPct = Math.min(100, Math.floor((prog / req) * 100));
        if (railContractPct < 0) railContractPct = 0;
        railContractLabel = railContractPct + "%";
      }
      html.push('<div class="card company-card company-rail">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-rail" title="Rail Logistics">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c-4.4 0-8 1.8-8 6v9c0 1.7 1.3 3 3 3l-1 1v1h12v-1l-1-1c1.7 0 3-1.3 3-3V8c0-4.2-3.6-6-8-6m0 2c3.7 0 6 .9 6 4H6c0-3.1 2.3-4 6-4m-6 6h12v7H6v-7m3.5 1.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m5 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M8 18h8l1 1H7l1-1z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">Rail Logistics</div>');
      html.push('<div class="card-meta">Contracts, dispatchers, fleet</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (rail.unlocked ? "badge-green" : "badge-red") + '"><span id="rail-status">' + (rail.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="rail-level">' + (rail.level || 0) + '</span></span>');
      html.push('<span class="badge badge-accent">Rep <span id="rail-reputation">' + (rail.reputation || 0).toFixed(0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-kpis">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="rail-funds">$' + railFunds.toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Dispatchers</div><div class="kpi-value">' + railDispatchers + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Trains</div><div class="kpi-value">' + railFleetCount + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Active runs</div><div class="kpi-value">' + railActiveRuns + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Maintenance</div><div class="kpi-value">' + railMaintenance + '</div></div>');
      html.push('</div>');
      html.push('<div class="card-section small company-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-rail-contract"' + (railDisabled ? ' disabled' : '') + '>Start freight contract</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-rail-manage"' + (!rail.unlocked ? ' disabled' : '') + '>Manage</button>');
      if (rail.activeContract) {
        html.push('<div class="bar-label mt-8">Contract progress</div>');
        html.push('<div class="progress"><div id="rail-contract-bar" class="progress-fill teal" style="width:' + railContractPct + '%"></div></div>');
        html.push('<div class="small dim mt-4">Active contract: <span class="mono">' + railContractLabel + '</span></div>');
      } else {
        if (!rail.unlocked) {
          html.push('<div class="notice">Unlock requirement: Education level 2 (you: ' + eduLevel + ') and Train skill 20 (you: ' + trainSkill + ').</div>');
        } else {
          html.push('<div class="notice">Start contracts, then keep your operation staffed so dispatchers can run them automatically.</div>');
        }
      }
      html.push('<div class="company-level-bonus">Level bonus: +$260 contract base, +$35 order payout, +$25 shipment payout (per level)</div>');
      html.push('</div>');
      html.push('</div>');
  
      // Mining Corp
      if (Game.Companies && typeof Game.Companies.ensureMiningMines === "function") {
        Game.Companies.ensureMiningMines();
      }
      var m = c.miningCorp;
      var totalPrice = Game.Companies.getOreTotalPrice ? Game.Companies.getOreTotalPrice() : 0;
      if (typeof totalPrice !== "number" || !isFinite(totalPrice) || totalPrice < 0) totalPrice = 0;
      var mcAutoSell = m.autoSell || { iron: false, copper: false, silver: false, gold: false };
      var mcLockedAttr = (!m.unlocked ? ' disabled' : '');
      var miningMorale = (typeof m.morale === "number" && isFinite(m.morale)) ? m.morale : 70;
      if (miningMorale < 0) miningMorale = 0;
      if (miningMorale > 100) miningMorale = 100;
      var miningLogisticsMult = (Game.Companies && typeof Game.Companies.getMiningLogisticsMultiplier === "function") ? Game.Companies.getMiningLogisticsMultiplier() : 1;
      if (typeof miningLogisticsMult !== "number" || !isFinite(miningLogisticsMult) || miningLogisticsMult < 1) miningLogisticsMult = 1;
      var miningLogisticsPct = (miningLogisticsMult - 1) * 100;
      html.push('<div class="card company-card company-mining">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-mining" title="Mining Corp">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 20h20v2H2v-2m2-2h16l-5.5-10.5L12 12l-2.5-4.5L4 18m8.5-7.5L14 8l3.5 6.5h-4l-1-2m-2.5 0l-1 2h-4L10 8l1.5 2.5z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">Mining Corp</div>');
      html.push('<div class="card-meta">Ore, valuation, automation</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (m.unlocked ? "badge-green" : "badge-red") + '"><span id="mining-status">' + (m.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="mining-level">' + (m.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-kpis">');
      html.push('<div class="kpi"><div class="kpi-label">Ore stock</div><div class="kpi-value"><span id="mining-ore">' + (m.oreStock || 0).toFixed(1) + ' t</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Total price</div><div class="kpi-value" id="mining-total-price">$' + totalPrice.toFixed(0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="mining-funds">$' + (m.funds || 0).toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Mines</div><div class="kpi-value">' + (m.mines ? m.mines.length : 0) + '</div></div>');
      html.push('</div>');
      html.push('<div class="company-mini mt-8">');
      html.push('<div class="field-row small"><span>Auto-sell</span><span><div class="chip-row" style="margin-bottom:0;">' +
        '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="iron"' + (mcAutoSell.iron ? ' checked' : '') + mcLockedAttr + '> Iron</label> ' +
        '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="copper"' + (mcAutoSell.copper ? ' checked' : '') + mcLockedAttr + '> Copper</label> ' +
        '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="silver"' + (mcAutoSell.silver ? ' checked' : '') + mcLockedAttr + '> Silver</label> ' +
        '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="gold"' + (mcAutoSell.gold ? ' checked' : '') + mcLockedAttr + '> Gold</label>' +
        '</div></span></div>');
      html.push('<div class="field-row small"><span>Auto transfer</span><span><label class="small"><input type="checkbox" id="mining-auto-payout"' + (m.autoPayoutToWallet ? ' checked' : '') + mcLockedAttr + '> Send excess to wallet</label></span></div>');
      html.push('<div class="field-row small"><span>Reserve</span><span><input id="mining-auto-reserve" class="input-small" type="number" min="0" step="10" value="' +
        ((typeof m.autoPayoutReserve === "number" && isFinite(m.autoPayoutReserve) && m.autoPayoutReserve >= 0) ? m.autoPayoutReserve.toFixed(0) : "0") +
        '" placeholder="0"' + mcLockedAttr + '></span></div>');
      html.push('<div class="field-row small"><span>Morale</span><span id="mining-morale">' + miningMorale.toFixed(0) + '%</span></div>');
      html.push('<div class="field-row small"><span>Logistics bonus</span><span id="mining-logistics">' + miningLogisticsPct.toFixed(1) + '%</span></div>');
      html.push('</div>');
      html.push('<div class="card-section small company-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-ore-run"' + (!m.unlocked || m.activeRunMinutes > 0 ? ' disabled' : '') + '>Start drilling</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-manage-corp"' + (!m.unlocked ? ' disabled' : '') + '>Manage</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-sell-ore"' + (!m.unlocked || m.oreStock <= 0 ? ' disabled' : '') + '>Sell ore</button>');
      if (m.activeRunMinutes > 0) {
        var total = m.activeRunTotal || (6 * 60);
        var p2 = Math.min(100, Math.floor(((total - m.activeRunMinutes) / total) * 100));
        html.push('<div class="bar-label mt-8">Drilling progress</div>');
        html.push('<div class="progress"><div id="ore-run-bar" class="progress-fill orange" style="width:' + p2 + '%"></div></div>');
      } else {
        if (!m.unlocked) {
          html.push('<div class="notice">Unlock requirement: Education level 1 (you: ' + eduLevel + ').</div>');
        } else {
          html.push('<div class="notice">Start drilling runs to convert time into ore, then sell (or auto-sell) into business funds.</div>');
        }
      }
      html.push('<div class="company-level-bonus">Level bonus: +40% ore yield, +0.05% gold chance per minute (per level)</div>');
      html.push('</div>');
      html.push('</div>');
  
      // Retail Shop
      var shop = c.retailShop;
      var retailPayroll = (Game.Companies && typeof Game.Companies.getRetailDailyPayroll === "function") ? Game.Companies.getRetailDailyPayroll(shop) : 0;
      if (typeof retailPayroll !== "number" || !isFinite(retailPayroll) || retailPayroll < 0) retailPayroll = 0;
      var rStats = shop.stats || { yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
      var yUnits = rStats.yesterdayUnits || 0;
      var yRevenue = rStats.yesterdayRevenue || 0;
      var yCost = rStats.yesterdayCost || 0;
      var yProfit = yRevenue - yCost;
      var yMargin = yRevenue > 0 ? (yProfit / yRevenue) * 100 : 0;
      html.push('<div class="card company-card company-retail">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-retail" title="Retail Shop">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6l2-2h12l2 2v2H4V6m0 4h16v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10m4 2v2h8v-2H8z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">Retail Shop</div>');
      html.push('<div class="card-meta">Inventory, staff, campaigns</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (shop.unlocked ? "badge-green" : "badge-red") + '"><span id="retail-status">' + (shop.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="retail-level">' + (shop.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-kpis">');
      html.push('<div class="kpi"><div class="kpi-label">Current stock</div><div class="kpi-value" id="retail-stock">' + (shop.stock || 0).toFixed(0) + ' units</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Popularity</div><div class="kpi-value" id="retail-popularity">' + (shop.popularity || 0).toFixed(0) + '%</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Daily payroll</div><div class="kpi-value" id="retail-payroll">$' + retailPayroll.toFixed(0) + ' / day</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Yesterday profit</div><div class="kpi-value">$' + yProfit.toFixed(0) + ' (' + yMargin.toFixed(0) + '%)</div></div>');
      html.push('</div>');
      html.push('<div class="card-section small company-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-retail-stock"' + (!shop.unlocked ? ' disabled' : '') + ' title="Manage retail inventory, staff, and item purchasing.">Manage Retail</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-retail-funds-overview"' + (!shop.unlocked ? ' disabled' : '') + ' title="Deposit/withdraw and configure auto payout.">Business Funds</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-retail-campaigns-overview"' + (!shop.unlocked ? ' disabled' : '') + ' title="Run marketing campaigns to grow popularity and improve sales.">Campaigns</button>');
      if (!shop.unlocked) {
        html.push('<div class="notice">Unlock requirement: Business skill 10 (you: ' + businessSkill + ').</div>');
      } else {
        html.push('<div class="notice">Restock, hire staff, and run campaigns. Profit compounds when stock stays healthy.</div>');
      }
      html.push('</div>');
      html.push('</div>');
  
      // Keep additional companies visually separated below the core three companies.
      html.push('</div>');
      html.push('<div class="section-title mt-8">More Companies</div>');
      html.push('<div class="grid mt-8">');
  
      // Internet Cafe
      if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
      if (Game.Net && typeof Game.Net.ensure === "function") Game.Net.ensure();
      var nc = c.netCafe || { unlocked: false, level: 0, funds: 0, seats: 0, stats: {} };
      var ncStats = nc.stats || { yesterdayCustomers: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
      var ncYProfit = (ncStats.yesterdayRevenue || 0) - (ncStats.yesterdayCost || 0);
      var ncEff = (Game.Net && typeof Game.Net.getEffectiveMbps === "function") ? Game.Net.getEffectiveMbps() : 0;
      if (typeof ncEff !== "number" || !isFinite(ncEff) || ncEff < 0) ncEff = 0;
      var ncPop = (typeof nc.popularity === "number" && isFinite(nc.popularity)) ? nc.popularity : 0;
      if (ncPop < 0) ncPop = 0;
      if (ncPop > 100) ncPop = 100;
      var ncPrice = (typeof nc.pricePerCustomer === "number" && isFinite(nc.pricePerCustomer)) ? nc.pricePerCustomer : 2.5;
      if (ncPrice <= 0) ncPrice = 2.5;
      var ncThreshold = 300 + (nc.level || 0) * 250;
      if (typeof ncThreshold !== "number" || !isFinite(ncThreshold) || ncThreshold <= 0) ncThreshold = 300;
      var ncXp = (typeof nc.xp === "number" && isFinite(nc.xp) && nc.xp > 0) ? nc.xp : 0;
      var ncXpPct = ncThreshold > 0 ? Math.floor((ncXp / ncThreshold) * 100) : 0;
      if (ncXpPct < 0) ncXpPct = 0;
      if (ncXpPct > 100) ncXpPct = 100;
      var ncSeatCost = (Game.Companies && typeof Game.Companies.getNetCafeNextSeatCost === "function") ? Game.Companies.getNetCafeNextSeatCost() : 0;
      if (typeof ncSeatCost !== "number" || !isFinite(ncSeatCost) || ncSeatCost < 0) ncSeatCost = 0;
      html.push('<div class="card company-card company-netcafe">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-netcafe" title="Internet Cafe">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 18.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0-4.5c-2.1 0-4 .8-5.4 2.1l1.4 1.4C8.9 16.4 10.4 16 12 16s3.1.4 4 1.5l1.4-1.4C16 14.8 14.1 14 12 14m0-4c-3.2 0-6.1 1.2-8.3 3.4l1.4 1.4C7.9 13.3 9.9 12.5 12 12.5s4.1.8 5.9 2.3l1.4-1.4C18.1 11.2 15.2 10 12 10m0-4C7.7 6 3.9 7.7 1.1 10.5l1.4 1.4C4.9 9.5 8.3 8 12 8s7.1 1.5 9.5 3.9l1.4-1.4C20.1 7.7 16.3 6 12 6z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">Internet Cafe</div>');
      html.push('<div class="card-meta">Seats, pricing, and demand</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (nc.unlocked ? "badge-green" : "badge-red") + '"><span id="netcafe-status">' + (nc.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="netcafe-level">' + (nc.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-kpis">');
      html.push('<div class="kpi kpi-net"><div class="kpi-label">Max Mbps</div><div class="kpi-value"><span id="netcafe-net">' + ncEff.toFixed(2) + '</span></div></div>');
      html.push('<div class="kpi kpi-seats"><div class="kpi-label">Seats</div><div class="kpi-value"><span id="netcafe-seats">' + (nc.seats || 0) + '</span></div></div>');
      html.push('<div class="kpi kpi-price"><div class="kpi-label">Price/customer</div><div class="kpi-value">$<span id="netcafe-price">' + ncPrice.toFixed(1) + '</span></div></div>');
      html.push('<div class="kpi kpi-pop"><div class="kpi-label">Popularity</div><div class="kpi-value"><span id="netcafe-pop">' + ncPop.toFixed(0) + '</span>%</div></div>');
      html.push('</div>');
      html.push('<div class="company-split mt-8">');
      html.push('<div class="company-mini">');
      html.push('<div class="field-row small"><span>Yesterday customers</span><span id="netcafe-ycust">' + (ncStats.yesterdayCustomers || 0).toFixed(0) + '</span></div>');
      html.push('<div class="field-row small"><span>Yesterday profit</span><span id="netcafe-yprofit">$' + ncYProfit.toFixed(0) + '</span></div>');
      html.push('<div class="field-row small"><span>Business funds</span><span id="netcafe-funds">$' + (nc.funds || 0).toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Members</span><span id="netcafe-members">' + ((nc.members || 0).toFixed ? (nc.members || 0).toFixed(0) : (nc.members || 0)) + '</span></div>');
      html.push('</div>');
      html.push('<div class="company-mini">');
      html.push('<div class="field-row small"><span>XP</span><span id="netcafe-xp">' + ncXp.toFixed(0) + " / " + ncThreshold.toFixed(0) + '</span></div>');
      html.push('<div class="progress"><div id="netcafe-xpbar" class="progress-fill cyan" style="width:' + ncXpPct + '%"></div></div>');
      html.push('<div class="field-row small"><span>Next seat</span><span>$<span id="netcafe-seat-cost">' + ncSeatCost.toFixed(0) + '</span></span></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card-section small company-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-netcafe-manage">' + (nc.unlocked ? "Manage" : "View") + '</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-netcafe-buy-seat-overview"' + (!nc.unlocked ? ' disabled' : '') + '>Buy seat</button>');
      if (!nc.unlocked) {
        html.push('<div class="notice">Unlock requirement: Business skill 5 (you: ' + businessSkill + ').</div>');
      } else {
        html.push('<div class="notice">Demand responds instantly to your internet plan. Tune pricing in Manage.</div>');
      }
      html.push('<div class="company-level-bonus">Level bonus: +$3 per seat per day (per level)</div>');
      html.push('</div>');
      html.push('</div>');
  
      // Courier
      if (Game.Companies && typeof Game.Companies.ensureCourierState === "function") Game.Companies.ensureCourierState();
      var co = c.courierCo || { unlocked: false, level: 0, funds: 0, vans: 0, drivers: 0, offers: [], orders: [], activeRuns: [], stats: {} };
      var coOffers = Array.isArray(co.offers) ? co.offers : [];
      var coOrders = Array.isArray(co.orders) ? co.orders : [];
      var coActive = Array.isArray(co.activeRuns) ? co.activeRuns : [];
      var coStats = (co.stats && typeof co.stats === "object") ? co.stats : { deliveredToday: 0, deliveredYesterday: 0 };
      var deliveredToday = (typeof coStats.deliveredToday === "number" && isFinite(coStats.deliveredToday)) ? coStats.deliveredToday : 0;
      var deliveredYesterday = (typeof coStats.deliveredYesterday === "number" && isFinite(coStats.deliveredYesterday)) ? coStats.deliveredYesterday : 0;
      var coCap = Math.max(0, Math.min(co.vans || 0, co.drivers || 0));
      var coThreshold = 250 + (co.level || 0) * 200;
      if (typeof coThreshold !== "number" || !isFinite(coThreshold) || coThreshold <= 0) coThreshold = 250;
      var coXp = (typeof co.xp === "number" && isFinite(co.xp) && co.xp > 0) ? co.xp : 0;
      var coXpPct = coThreshold > 0 ? Math.floor((coXp / coThreshold) * 100) : 0;
      if (coXpPct < 0) coXpPct = 0;
      if (coXpPct > 100) coXpPct = 100;
      var coRunPct = 0;
      var coRunEta = "-";
      if (coActive.length) {
        var run0 = coActive[0];
        var totRun = (run0 && typeof run0.totalMinutes === "number") ? run0.totalMinutes : 1;
        var remRun = (run0 && typeof run0.remainingMinutes === "number") ? run0.remainingMinutes : 0;
        if (!(totRun > 0)) totRun = 1;
        var doneRun = totRun - remRun;
        if (doneRun < 0) doneRun = 0;
        if (doneRun > totRun) doneRun = totRun;
        coRunPct = Math.floor((doneRun / totRun) * 100);
        if (coRunPct < 0) coRunPct = 0;
        if (coRunPct > 100) coRunPct = 100;
        var etaMin = Math.max(0, Math.ceil(remRun));
        var hh2 = Math.floor(etaMin / 60);
        var mm2 = etaMin % 60;
        coRunEta = hh2 + ":" + (mm2 < 10 ? "0" + mm2 : mm2);
      }
      html.push('<div class="card company-card company-courier">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-courier" title="Courier">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 7h11v9H3V7m12 2h3l3 4v3h-6V9m-1-4H3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h1a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h1v-5.5L19 7h-4V5c0-1.1-.9-2-2-2m-6 14a1 1 0 0 1-1-1a1 1 0 0 1 2 0a1 1 0 0 1-1 1m12 0a1 1 0 0 1-1-1a1 1 0 0 1 2 0a1 1 0 0 1-1 1z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">Courier</div>');
      html.push('<div class="card-meta">Dispatch board + live run</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (co.unlocked ? "badge-green" : "badge-red") + '"><span id="courier-status">' + (co.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="courier-level">' + (co.level || 0) + '</span></span>');
      html.push('<span class="badge badge-accent" title="Capacity = min(vans, drivers)">Cap <span id="courier-capacity">' + coCap + '</span></span>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="dispatch-board">');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-offers-count">' + coOffers.length + '</div><div class="dispatch-label">Offers</div></div>');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-orders-count">' + coOrders.length + '</div><div class="dispatch-label">Queued</div></div>');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-active-count">' + coActive.length + '</div><div class="dispatch-label">Active</div></div>');
      html.push('</div>');
  
      html.push('<div class="company-split mt-8">');
      html.push('<div class="company-mini">');
      html.push('<div class="field-row small"><span>Vans / Drivers</span><span id="courier-fleet">' + (co.vans || 0) + " / " + (co.drivers || 0) + '</span></div>');
      html.push('<div class="field-row small"><span>Business funds</span><span id="courier-funds">$' + (co.funds || 0).toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Delivered today</span><span id="courier-delivered-today">' + deliveredToday.toFixed(0) + '</span></div>');
      html.push('<div class="field-row small"><span>Delivered yesterday</span><span id="courier-delivered-yesterday">' + deliveredYesterday.toFixed(0) + '</span></div>');
      html.push('</div>');
      html.push('<div class="company-mini">');
      html.push('<div class="field-row small"><span>XP</span><span id="courier-xp">' + coXp.toFixed(0) + " / " + coThreshold.toFixed(0) + '</span></div>');
      html.push('<div class="progress"><div id="courier-xpbar" class="progress-fill teal" style="width:' + coXpPct + '%"></div></div>');
      html.push('<div class="field-row small"><span>Next ETA</span><span id="courier-run-eta">' + coRunEta + '</span></div>');
      html.push('<div class="progress progress-status"><div id="courier-run-bar" class="progress-fill progress-fill-status teal" style="width:' + coRunPct + '%"></div></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card-section small company-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-courier-manage">' + (co.unlocked ? "Manage" : "View") + '</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-courier-dispatch-overview"' + (!co.unlocked ? ' disabled' : '') + '>Dispatch</button>');
      if (!co.unlocked) {
        html.push('<div class="notice">Unlock requirement: Education level 1 (you: ' + eduLevel + ') and Business skill 15 (you: ' + businessSkill + ').</div>');
      } else {
        html.push('<div class="notice">Tip: Rail Logistics reduces delivery time once unlocked.</div>');
      }
      html.push('<div class="company-level-bonus">Level bonus: +15% delivery payout (per level)</div>');
      html.push('</div>');
      html.push('</div>');
  
      // E-waste Recycling
      if (Game.Companies && typeof Game.Companies.ensureRecyclingState === "function") Game.Companies.ensureRecyclingState();
      var rc = c.recyclingCo || { unlocked: false, level: 0, funds: 0, scrapKg: 0, machines: 0, staff: 0, activeBatch: null, stats: {} };
      var rcStats = rc.stats || { processedYesterdayKg: 0 };
      var rcProcessedYesterday = (typeof rcStats.processedYesterdayKg === "number" && isFinite(rcStats.processedYesterdayKg)) ? rcStats.processedYesterdayKg : 0;
      var rcProcessedToday = (rcStats && typeof rcStats.processedTodayKg === "number" && isFinite(rcStats.processedTodayKg)) ? rcStats.processedTodayKg : 0;
      var rcOverhead = (rc.staff || 0) * 25 + (rc.machines || 0) * 6 + 8;
      if (typeof rcOverhead !== "number" || !isFinite(rcOverhead) || rcOverhead < 0) rcOverhead = 0;
      var rcBatchPct = 0;
      var rcBatchLabel = "Idle";
      if (rc.activeBatch) {
        var totB = (typeof rc.activeBatch.totalMinutes === "number") ? rc.activeBatch.totalMinutes : 1;
        var remB = (typeof rc.activeBatch.remainingMinutes === "number") ? rc.activeBatch.remainingMinutes : 0;
        if (!(totB > 0)) totB = 1;
        var doneB = totB - remB;
        if (doneB < 0) doneB = 0;
        if (doneB > totB) doneB = totB;
        rcBatchPct = Math.floor((doneB / totB) * 100);
        if (rcBatchPct < 0) rcBatchPct = 0;
        if (rcBatchPct > 100) rcBatchPct = 100;
        var etaB = Math.max(0, Math.ceil(remB));
        var hhB = Math.floor(etaB / 60);
        var mmB = etaB % 60;
        var kgB = (typeof rc.activeBatch.kg === "number" && isFinite(rc.activeBatch.kg)) ? rc.activeBatch.kg : 0;
        rcBatchLabel = (kgB ? (kgB.toFixed(0) + " kg") : "Batch") + " â€¢ ETA " + hhB + ":" + (mmB < 10 ? "0" + mmB : mmB);
      }
      html.push('<div class="card company-card company-recycle">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-recycle" title="E-waste Recycling">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.9 10.6c-.2-.6-.8-1-1.4-1h-3.4l1-1.8c.3-.5.1-1.2-.4-1.5l-2.2-1.3c-.5-.3-1.2-.1-1.5.4L11 6.8l-1.7-3c-.3-.5-1-.7-1.5-.4L5.6 4.7c-.5.3-.7 1-.4 1.5l1 1.8H2.8c-.6 0-1.2.4-1.4 1L.3 12.2c-.2.6.1 1.2.6 1.5l3.1 1.8c.5.3 1.2.1 1.5-.4l1.7-3l1.7 3c.3.5 1 .7 1.5.4l2.2-1.3c.5-.3.7-1 .4-1.5l-1-1.8h3.4c.6 0 1.2-.4 1.4-1l1.1-3.2c.2-.6-.1-1.2-.6-1.5l-3.1-1.8c-.5-.3-1.2-.1-1.5.4l-1.7 3l-1.7-3c-.3-.5-1-.7-1.5-.4L8 7.3c-.5.3-.7 1-.4 1.5l1 1.8H5.2l.5.9c.4.7.1 1.6-.6 2l-.6.3l-1.1 1.9l1.9 1.1l1.7-3l1.7 3c.3.5 1 .7 1.5.4l2.2-1.3c.5-.3.7-1 .4-1.5l-1-1.8h3.4c.6 0 1.2-.4 1.4-1l.3-.9l-1.9-1.1l-1.7 3l-1.7-3c-.3-.5-1-.7-1.5-.4l-2.2 1.3c-.5.3-.7 1-.4 1.5l1 1.8H6.6l.9 1.6c.3.5.1 1.2-.4 1.5l-2.2 1.3c-.5.3-1.2.1-1.5-.4L1.7 14c-.5-.3-.7-1-.4-1.5l1.1-3.2c.2-.6.8-1 1.4-1h3.4l-1-1.8c-.3-.5-.1-1.2.4-1.5l2.2-1.3c.5-.3 1.2-.1 1.5.4L12 6.8l1.7-3c.3-.5 1-.7 1.5-.4l2.2 1.3c.5.3.7 1 .4 1.5l-1 1.8h3.4c.6 0 1.2.4 1.4 1l1.1 3.2c.2.6-.1 1.2-.6 1.5l-3.1 1.8c-.5.3-1.2.1-1.5-.4l-1.7-3l-1.7 3c-.3.5-1 .7-1.5.4l-2.2-1.3c-.5-.3-.7-1-.4-1.5l1-1.8H9.5c-.6 0-1.2-.4-1.4-1l-.3-.9l1.9-1.1l1.7 3l1.7-3c.3-.5 1-.7 1.5-.4l2.2 1.3c.5.3.7 1 .4 1.5l-1 1.8h3.4c.6 0 1.2-.4 1.4-1l.3-.9l-1.9-1.1z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="card-title">E-waste Recycling</div>');
      html.push('<div class="card-meta">Plant operations + batch throughput</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (rc.unlocked ? "badge-green" : "badge-red") + '"><span id="recycle-status">' + (rc.unlocked ? "Unlocked" : "Locked") + '</span></span>');
      html.push('<span class="badge badge-blue">L<span id="recycle-level">' + (rc.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="recycle-layout">');
      html.push('<div class="recycle-kpis">');
      html.push('<div class="kpi"><div class="kpi-label">Scrap</div><div class="kpi-value"><span id="recycle-scrap">' + (rc.scrapKg || 0).toFixed(0) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value"><span id="recycle-funds">$' + (rc.funds || 0).toFixed(2) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Machines / Staff</div><div class="kpi-value"><span id="recycle-team">' + (rc.machines || 0) + " / " + (rc.staff || 0) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Overhead/day</div><div class="kpi-value">$<span id="recycle-overhead">' + rcOverhead.toFixed(0) + '</span></div></div>');
      html.push('</div>');
  
      html.push('<div class="mt-8">');
      html.push('<div class="bar-label">Batch</div>');
      html.push('<div class="field-row small"><span id="recycle-batch-label">' + rcBatchLabel + '</span><span><span class="badge badge-green" style="padding:2px 8px;">' + (rc.activeBatch ? "RUNNING" : "IDLE") + '</span></span></div>');
      html.push('<div class="progress"><div id="recycle-batch-bar" class="progress-fill green" style="width:' + rcBatchPct + '%"></div></div>');
      html.push('<div class="field-row small mt-4"><span>Processed today</span><span id="recycle-tkg">' + rcProcessedToday.toFixed(0) + ' kg</span></div>');
      html.push('<div class="field-row small"><span>Processed yesterday</span><span id="recycle-ykg">' + rcProcessedYesterday.toFixed(0) + ' kg</span></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card-section small company-actions recycle-actions">');
      html.push('<button class="btn btn-small btn-primary" id="btn-recycle-manage">' + (rc.unlocked ? "Manage" : "View") + '</button> ');
      html.push('<span class="recycle-quick">');
      html.push('<input id="recycle-quick-kg" class="input-small" type="number" min="50" step="10" value="200"' + (!rc.unlocked ? " disabled" : "") + '>');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-quick-start"' + (!rc.unlocked ? ' disabled' : '') + (rc.activeBatch ? ' disabled' : '') + '>Start</button>');
      html.push('</span>');
      if (!rc.unlocked) {
        html.push('<div class="notice">Unlock requirement: Education level 1 (you: ' + eduLevel + ') and Tech skill 15 (you: ' + techSkill + ').</div>');
      } else {
        html.push('<div class="notice">Run batches to convert scrap into funds. Speed scales with machines and staff.</div>');
      }
      html.push('<div class="company-level-bonus">Level bonus: +$0.12 per kg processed (per level)</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('</div>');
      html.push('</div>');
      return html.join("");
    },
    renderRetailStockPage: function () {
      // Manage Retail (replaces legacy bulk stock ordering page).
      if (Game.Companies && typeof Game.Companies.ensureRetailState === "function") {
        Game.Companies.ensureRetailState();
      }
      var state = Game.state;
      var shop2 = state.companies.retailShop;
      var stats2 = shop2.stats || { todayUnits: 0, todayRevenue: 0, todayCost: 0, todayPayroll: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0, yesterdayPayroll: 0 };
  
      var tUnits2 = stats2.todayUnits || 0;
      var tRevenue2 = stats2.todayRevenue || 0;
      var tCost2 = stats2.todayCost || 0;
      var tPayroll2 = stats2.todayPayroll || 0;
      var tProfit2 = tRevenue2 - tCost2 - tPayroll2;
  
      var yUnits2 = stats2.yesterdayUnits || 0;
      var yRevenue2 = stats2.yesterdayRevenue || 0;
      var yCost2 = stats2.yesterdayCost || 0;
      var yPayroll2 = stats2.yesterdayPayroll || 0;
      var yProfit2 = yRevenue2 - yCost2 - yPayroll2;
  
      var payroll2 = (Game.Companies && typeof Game.Companies.getRetailDailyPayroll === "function") ? Game.Companies.getRetailDailyPayroll(shop2) : 0;
      if (typeof payroll2 !== "number" || !isFinite(payroll2) || payroll2 < 0) payroll2 = 0;
  
      var threshold2 = 900 + (shop2.level || 0) * 350;
      if (typeof threshold2 !== "number" || !isFinite(threshold2) || threshold2 <= 0) threshold2 = 900;
      var xp2 = (typeof shop2.xp === "number" && isFinite(shop2.xp) && shop2.xp > 0) ? shop2.xp : 0;
      var xpPct2 = Math.min(100, Math.floor((xp2 / threshold2) * 100));
  
      var invUnits2 = shop2.inventory && shop2.inventory.units ? shop2.inventory.units : {};
      var invCost2 = shop2.inventory && shop2.inventory.costBasis ? shop2.inventory.costBasis : {};
      var skuCount2 = 0;
      var invValue2 = 0;
      for (var k = 0; k < Object.keys(invUnits2).length; k++) {
        var id = Object.keys(invUnits2)[k];
        var qty = invUnits2[id];
        if (typeof qty !== "number" || !isFinite(qty) || qty <= 0) continue;
        skuCount2 += 1;
        var cb = invCost2[id];
        if (typeof cb === "number" && isFinite(cb) && cb > 0) invValue2 += cb;
      }
      var campaignLabel2 = "None";
      if (shop2.campaign && typeof shop2.campaign === "object") {
        var chan = String(shop2.campaign.channel || "");
        var rem = (typeof shop2.campaign.daysRemaining === "number" && isFinite(shop2.campaign.daysRemaining)) ? Math.floor(shop2.campaign.daysRemaining) : 0;
        var cdef = (Game.Companies && typeof Game.Companies.getRetailCampaignDef === "function") ? Game.Companies.getRetailCampaignDef(chan) : null;
        var nm = cdef && cdef.name ? cdef.name : (chan || "Campaign");
        campaignLabel2 = nm + " (" + rem + "d)";
      }
  
      var deliveries2 = Array.isArray(shop2.pendingDeliveries) ? shop2.pendingDeliveries : [];
      var activeDel2 = deliveries2.length;
  
      var html2 = [];
      html2.push('<div id="retail-manage-page" class="company-page company-page-retail">');
      html2.push('<div class="card company-hero company-retail">');
      html2.push('<div class="company-head">');
      html2.push('<div class="company-title-row">');
      html2.push('<div class="company-icon company-icon-retail" title="Retail Shop">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6l2-2h12l2 2v2H4V6m0 4h16v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10m4 2v2h8v-2H8z"/></svg>' +
        '</div>');
      html2.push('<div>');
      html2.push('<div class="section-title">Retail Shop</div>');
      html2.push('<div class="section-subtitle company-subtitle">Manage inventory, staff, funds, and campaigns. Keep stock healthy to stabilize margins.</div>');
      html2.push('</div>');
      html2.push('</div>');
      html2.push('<div class="company-badges">');
      html2.push('<span class="badge ' + (shop2.unlocked ? "badge-green" : "badge-red") + '">' + (shop2.unlocked ? "Unlocked" : "Locked") + '</span>');
      html2.push('<span class="badge badge-blue">L' + (shop2.level || 0) + '</span>');
      html2.push('</div>');
      html2.push('</div>');
      if (!shop2.unlocked) {
        html2.push('<div class="notice">Unlock requirement: Business skill 10.</div>');
      }
      html2.push('</div>');
  
      html2.push('<div class="grid mt-8">');
      html2.push('<div class="card">');
      html2.push('<div class="card-title">Shop Summary</div>');
      html2.push('<div class="card-section">');
      html2.push('<div class="field-row"><span>Status</span><span id="retail-summary-status">' + (shop2.unlocked ? "Unlocked" : "Locked") + '</span></div>');
      html2.push('<div class="field-row"><span>Level</span><span id="retail-summary-level">' + shop2.level + '</span></div>');
      html2.push('<div class="field-row"><span>XP</span><span id="retail-summary-xp">' + xp2.toFixed(0) + ' / ' + threshold2.toFixed(0) + '</span></div>');
      html2.push('<div class="bar-label mt-4 small dim">Level progress</div>');
      html2.push('<div class="progress"><div class="progress-fill" style="width:' + xpPct2 + '%"></div></div>');
      html2.push('<div class="field-row mt-4"><span>Stock (total)</span><span id="retail-summary-stock">' + shop2.stock.toFixed(0) + ' units</span></div>');
      html2.push('<div class="field-row"><span>Inventory</span><span id="retail-summary-inv">' + skuCount2 + ' SKUs | $' + invValue2.toFixed(0) + ' cost</span></div>');
      html2.push('<div class="field-row"><span>Popularity</span><span id="retail-summary-popularity">' + shop2.popularity.toFixed(0) + '%</span></div>');
      html2.push('<div class="mt-4"><button class="btn btn-small btn-outline" id="btn-retail-funds" style="width:100%;display:flex;justify-content:space-between;align-items:center;">' +
        '<span>Business Funds</span><span class="mono" id="retail-summary-money">$' + (shop2.funds || 0).toFixed(2) + '</span></button></div>');
      html2.push('<div class="field-row mt-4"><span>Daily payroll</span><span id="retail-summary-payroll">$' + payroll2.toFixed(0) + '</span></div>');
      html2.push('<div class="field-row"><span>Campaign</span><span id="retail-summary-campaign">' + campaignLabel2 + '</span></div>');
      html2.push('</div>');
      html2.push('<div class="card-section small">');
      html2.push('<div class="field-row"><span>Today</span><span id="retail-summary-today-sales">' + tUnits2.toFixed(0) + ' units | $' + tRevenue2.toFixed(0) + ' revenue | $' + tProfit2.toFixed(0) + ' profit</span></div>');
      html2.push('<div class="field-row"><span>Yesterday</span><span id="retail-summary-yesterday">' + yUnits2.toFixed(0) + ' units | $' + yRevenue2.toFixed(0) + ' revenue | $' + yProfit2.toFixed(0) + ' profit</span></div>');
      html2.push('</div>');
      html2.push('</div>');
  
      html2.push('<div class="card">');
      html2.push('<div class="card-title">Quick Actions</div>');
      html2.push('<div class="card-section">');
      html2.push('<div class="chip-row" style="gap:8px;flex-wrap:wrap;">');
      html2.push('<button class="btn btn-small btn-primary" id="btn-retail-inventory-modal">Manage Inventory</button>');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-active-deliveries"' + (activeDel2 ? "" : " disabled") + '>Active deliveries (' + activeDel2 + ')</button>');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-staff-modal">Staff</button>');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-campaigns">Campaigns</button>');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-funds-alt">Business Funds</button>');
      html2.push('</div>');
      html2.push('<div id="retail-active-deliveries-container">');
      html2.push(UI.renderRetailActiveDeliveriesHtml(shop2));
      html2.push('</div>');
      html2.push('<div class="small dim mt-4">Use modals to handle micromanagement while keeping this page clean.</div>');
      html2.push('</div>');
      html2.push('</div>');
      html2.push('</div>');
  
      html2.push('<div class="card mt-8">');
      html2.push('<div class="card-title">Actions</div>');
      html2.push('<div class="card-section">');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-back">Back to companies</button> ');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-campaigns2">Campaigns</button>');
      html2.push('<button class="btn btn-small btn-outline" id="btn-retail-funds2">Business Funds</button>');
      html2.push('</div>');
      html2.push('</div>');
  
      html2.push('</div>');
      return html2.join("");
      var s = Game.state;
      var shop = s.companies.retailShop;
      var options = Game.Companies.retailStockOptions || [];
      var defaultOption = options[1] || options[0] || { id: "standard", name: "Standard shipment", batchSize: 80, unitPrice: 4.0, leadDays: 1 };
      var defaultBatches = 1;
      var stats = shop.stats || { todayUnits: 0, todayRevenue: 0, todayCost: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
      var yUnits = stats.yesterdayUnits || 0;
      var yRevenue = stats.yesterdayRevenue || 0;
      var yCost = stats.yesterdayCost || 0;
      var yProfit = yRevenue - yCost;
      var yMargin = yRevenue > 0 ? (yProfit / yRevenue) * 100 : 0;
      var tUnits = stats.todayUnits || 0;
      var tRevenue = stats.todayRevenue || 0;
      var tCost = stats.todayCost || 0;
      var tProfit = tRevenue - tCost;
      var tMargin = tRevenue > 0 ? (tProfit / tRevenue) * 100 : 0;
      var html = [];
      html.push('<div>');
      html.push('<div class="section-title">Retail Stock Ordering</div>');
      html.push('<div class="section-subtitle">Plan bulk orders for your retail shop. Larger orders tie up more cash but keep shelves stocked for longer.</div>');
      html.push('<div class="grid mt-8">');
      html.push('<div class="card">');
      html.push('<div class="card-title">Shop Summary</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Status</span><span id="retail-summary-status">' + (shop.unlocked ? "Unlocked" : "Locked") + '</span></div>');
      html.push('<div class="field-row"><span>Level</span><span id="retail-summary-level">' + shop.level + '</span></div>');
      html.push('<div class="field-row"><span>Current stock</span><span id="retail-summary-stock">' + shop.stock.toFixed(0) + ' units</span></div>');
      html.push('<div class="field-row"><span>Popularity</span><span id="retail-summary-popularity">' + shop.popularity.toFixed(0) + '%</span></div>');
      html.push('<div class="field-row"><span>Business funds</span><span id="retail-summary-money">$' + (shop.funds || 0).toFixed(2) + '</span></div>');
      html.push('</div>');
      html.push('<div class="card-section small">');
      html.push('<div class="field-row"><span>Today sales</span><span id="retail-summary-today-sales">' + tUnits.toFixed(0) + ' units Â· $' + tRevenue.toFixed(0) + ' revenue</span></div>');
      html.push('<div class="field-row"><span>Today profit</span><span id="retail-summary-today-profit">$' + tProfit.toFixed(0) + ' (' + tMargin.toFixed(0) + '% margin)</span></div>');
      html.push('<div class="field-row"><span>Yesterday</span><span id="retail-summary-yesterday">' + yUnits.toFixed(0) + ' units Â· $' + yRevenue.toFixed(0) + ' rev Â· $' + yProfit.toFixed(0) + ' profit</span></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Retail stock sells automatically over time based on popularity, level and existing stock. Use business funds to place orders.</div>');
        html.push('</div>');
        html.push('<div class="card">');
        html.push('<div class="card-title">Business Funds</div>');
        html.push('<div class="card-section">');
        html.push('<div class="field-row small"><span>Transfer to business</span><span><input id="retail-deposit" class="input-small" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="btn-retail-deposit">Deposit</button></span></div>');
        html.push('<div class="field-row small mt-4"><span>Transfer to wallet</span><span><input id="retail-withdraw" class="input-small" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="btn-retail-withdraw">Withdraw</button></span></div>');
        html.push('<div class="field-row small mt-4"><span>Auto payout</span><span><label class="small"><input type="checkbox" id="retail-auto-payout"' + (shop.autoPayoutToWallet ? ' checked' : '') + '> Send sales to wallet</label></span></div>');
        html.push('<div class="small dim mt-4">When enabled, retail sales revenue goes straight to your wallet instead of business funds.</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="card">');
        html.push('<div class="card-title">Choose Order Type</div>');
      html.push('<div class="card-section">');
      if (options.length === 0) {
        html.push('<div class="small dim">No stock options defined.</div>');
      } else {
        html.push('<table class="table"><thead><tr><th></th><th>Option</th><th>Batch size</th><th>Unit price</th><th>Lead time</th></tr></thead><tbody>');
        for (var i = 0; i < options.length; i++) {
          var opt = options[i];
          html.push('<tr class="mining-mine-row" data-mine="' + mine.id + '">');
          html.push('<td><input type="radio" name="retail-option" value="' + opt.id + '"' + (opt.id === defaultOption.id ? ' checked' : '') + '></td>');
          html.push('<td>' + opt.name + '</td>');
          html.push('<td>' + opt.batchSize + ' units</td>');
          html.push('<td>$' + opt.unitPrice.toFixed(2) + '</td>');
          html.push('<td>' + (opt.leadDays === 0 ? "Same day" : (opt.leadDays + " day" + (opt.leadDays > 1 ? "s" : ""))) + '</td>');
          html.push('</tr>');
        }
        html.push('</tbody></table>');
      }
      html.push('</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row">');
      html.push('<span>Batches to order</span>');
      html.push('<span><input id="retail-batches" type="range" min="1" max="10" value="' + defaultBatches + '"></span>');
      html.push('</div>');
      html.push('<div class="field-row"><span>Planned units</span><span id="retail-total-units">' + (defaultOption.batchSize * defaultBatches) + ' units</span></div>');
      html.push('<div class="field-row"><span>Planned cost</span><span id="retail-total-cost">$' + (defaultOption.batchSize * defaultOption.unitPrice * defaultBatches).toFixed(2) + '</span></div>');
      html.push('<div class="notice">The order will fail if you don\'t have enough money.</div>');
      html.push('</div>');
      html.push('<div class="card-section">');
      html.push('<button class="btn btn-small btn-outline" id="btn-retail-back">Back to companies</button> ');
      html.push('<button class="btn btn-small btn-primary" id="btn-retail-confirm">Confirm order</button>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card mt-8">');
      html.push('<div class="card-title">Active Deliveries</div>');
      html.push('<div class="card-section" id="retail-active-deliveries">');
      html.push(UI.renderRetailActiveDeliveriesHtml(shop, options));
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      return html.join("");
    },
    renderRetailActiveDeliveriesHtml: function (shop) {
      var s = shop || (Game.state && Game.state.companies ? Game.state.companies.retailShop : null);
      var deliveries = s && Array.isArray(s.pendingDeliveries) ? s.pendingDeliveries : [];
      var active = deliveries.length;
      if (!active) return '<div class="small dim mt-4">No active deliveries.</div>';
  
      var today = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Game.state.day : 1;
      var canDeliver = false;
      if (Game.Companies && typeof Game.Companies.canRetailDeliver === "function") {
        canDeliver = !!Game.Companies.canRetailDeliver(s);
      } else if (Game.Companies && typeof Game.Companies.getRetailStaffSummary === "function") {
        var sum = Game.Companies.getRetailStaffSummary(s);
        canDeliver = !!(sum && sum.vans > 0 && sum.drivers > 0);
      }
  
      var delRows = [];
      for (var i = 0; i < deliveries.length; i++) {
        var d = deliveries[i];
        if (!d) continue;
        var itemId = String(d.itemId || "");
        var def = (Game.Companies && typeof Game.Companies.getRetailItemDef === "function") ? Game.Companies.getRetailItemDef(itemId) : null;
        var name = def && def.name ? def.name : (itemId || "Item");
        var qty = (typeof d.units === "number" && isFinite(d.units)) ? Math.floor(d.units) : 0;
        if (qty <= 0) continue;
        var ad = (typeof d.arrivalDay === "number" && isFinite(d.arrivalDay)) ? d.arrivalDay : today;
        var status = ad > today ? ("ETA " + UI.getDeliveryEtaLabel(ad)) : (canDeliver ? "Ready to dispatch" : "Arrived (needs driver + van)");
        delRows.push({ name: name, qty: qty, arrivalDay: ad, status: status });
      }
      delRows.sort(function (a, b) { return (a.arrivalDay || 0) - (b.arrivalDay || 0); });
  
      var maxShow = 6;
      var out = [];
      out.push('<div class="mt-4">');
      out.push('<table class="table small"><thead><tr><th>Item</th><th>Units</th><th>Arrival</th><th>Status</th></tr></thead><tbody>');
      for (var r = 0; r < delRows.length && r < maxShow; r++) {
        var dr = delRows[r];
        out.push('<tr>');
        out.push('<td>' + dr.name + '</td>');
        out.push('<td class="mono">' + dr.qty + '</td>');
        out.push('<td class="mono">Day ' + dr.arrivalDay + '</td>');
        out.push('<td>' + dr.status + '</td>');
        out.push('</tr>');
      }
      out.push('</tbody></table>');
      if (delRows.length > maxShow) out.push('<div class="small dim mt-4">+' + (delRows.length - maxShow) + ' more deliveries</div>');
      out.push('</div>');
      return out.join("");
    },
    renderRetailActiveDeliveriesHtml: function (shop, options) {
      var deliveries = (shop && Array.isArray(shop.pendingDeliveries)) ? shop.pendingDeliveries : [];
      options = Array.isArray(options) ? options : [];
      var html = [];
      if (!deliveries.length) {
        html.push('<div class="small dim">No stock deliveries are currently scheduled.</div>');
        return html.join("");
      }
      html.push('<table class="table small"><thead><tr><th>Order</th><th>Units</th><th>Type</th><th>Arrival day</th><th>ETA</th></tr></thead><tbody>');
      for (var d = 0; d < deliveries.length; d++) {
        var del = deliveries[d];
        var optName = (del && del.optionId) ? del.optionId : "-";
        var optDef = null;
        for (var oi = 0; oi < options.length; oi++) {
          if (options[oi].id === (del ? del.optionId : null)) {
            optDef = options[oi];
            break;
          }
        }
        if (optDef) optName = optDef.name;
        var arrivalDayVal = (del && typeof del.arrivalDay === "number" && isFinite(del.arrivalDay)) ? del.arrivalDay : null;
        html.push('<tr>');
        html.push('<td>' + ((del && del.id) ? del.id : ("#" + (d + 1))) + '</td>');
        html.push('<td>' + ((del && typeof del.units === "number" && isFinite(del.units)) ? del.units : ((del && del.units) ? del.units : 0)) + '</td>');
        html.push('<td>' + optName + '</td>');
        html.push('<td>Day ' + (arrivalDayVal !== null ? arrivalDayVal : "?") + '</td>');
        html.push('<td class="retail-delivery-eta" data-arrival-day="' + (arrivalDayVal !== null ? String(arrivalDayVal) : "") + '">' + UI.getDeliveryEtaLabel(arrivalDayVal) + '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table>');
      return html.join("");
    },
    showSellOreModal: function () {
      var c = Game.state.companies;
      Game.Companies.ensureMiningMines();
      var m = c.miningCorp;
      var d = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
      var iron = d.iron || 0;
      var copper = d.copper || 0;
      var silver = d.silver || 0;
      var gold = d.gold || 0;
      var totalTonnage = iron + copper + silver + gold;
      if (totalTonnage <= 0) {
        Game.addNotification("No ore in storage to review or sell.");
        return;
      }
      var ironPrice = Game.Companies.getOreUnitPrice ? Game.Companies.getOreUnitPrice("iron") : 100;
      var copperPrice = Game.Companies.getOreUnitPrice ? Game.Companies.getOreUnitPrice("copper") : 500;
      var silverPrice = Game.Companies.getOreUnitPrice ? Game.Companies.getOreUnitPrice("silver") : 1000;
      var goldPrice = Game.Companies.getOreUnitPrice ? Game.Companies.getOreUnitPrice("gold") : 5000;
      var ironVal = iron * ironPrice;
      var copperVal = copper * copperPrice;
      var silverVal = silver * silverPrice;
      var goldVal = gold * goldPrice;
      var totalValue = ironVal + copperVal + silverVal + goldVal;
      var auto = m.autoSell || { iron: false, copper: false, silver: false, gold: false };
      var overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      var html = [];
      html.push('<div class="modal-card">');
      html.push('<div class="modal-card-title">Sell Ore</div>');
      html.push('<div class="modal-card-sub small dim">Review ore stock by type, toggle automatic selling, and choose whether to sell selected ores now.</div>');
      html.push('<div class="card-section small">');
      html.push('<table class="table"><thead><tr><th>Ore</th><th>Amount (t)</th><th>Unit price</th><th>Value</th><th>Auto-sell (3h)</th></tr></thead><tbody>');
      function row(label, key, amount, unitPrice, value, checked) {
        html.push('<tr>');
        html.push('<td>' + label + '</td>');
        html.push('<td>' + amount.toFixed(1) + '</td>');
        html.push('<td>$' + unitPrice.toFixed(2) + '</td>');
        html.push('<td>$' + value.toFixed(0) + '</td>');
        html.push('<td><input type="checkbox" class="ore-auto-toggle" data-ore="' + key + '"' + (checked ? ' checked' : '') + '></td>');
        html.push('</tr>');
      }
      row("Iron", "iron", iron, ironPrice, ironVal, !!auto.iron);
      row("Copper", "copper", copper, copperPrice, copperVal, !!auto.copper);
      row("Silver", "silver", silver, silverPrice, silverVal, !!auto.silver);
      row("Gold", "gold", gold, goldPrice, goldVal, !!auto.gold);
      html.push('</tbody></table>');
      html.push('</div>');
      html.push('<div class="card-section small">');
      html.push('<div class="field-row"><span>Total tonnage</span><span>' + totalTonnage.toFixed(1) + ' t</span></div>');
      html.push('<div class="field-row"><span>Estimated total value</span><span>$' + totalValue.toFixed(0) + '</span></div>');
      html.push('<div class="small dim mt-4">When an ore type is set to auto-sell, its stock will be sold automatically every 3 in-game hours at the current unit price.</div>');
      html.push('</div>');
      html.push('<div class="modal-actions">');
      html.push('<button class="btn btn-small btn-outline" id="sell-ore-close">Close</button>');
      html.push('<button class="btn btn-small btn-primary" id="sell-ore-confirm">Sell selected now</button>');
      html.push('</div>');
      html.push('</div>');
      overlay.innerHTML = html.join("");
      document.body.appendChild(overlay);
      function closeModal() {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) {
          closeModal();
        }
      });
      var closeBtn = overlay.querySelector("#sell-ore-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeModal();
        });
      }
      var toggles = overlay.querySelectorAll(".ore-auto-toggle");
      for (var i = 0; i < toggles.length; i++) {
        toggles[i].addEventListener("change", function () {
          var oreKey = this.getAttribute("data-ore");
          if (!oreKey) return;
          Game.Companies.ensureMiningMines();
          var mc = Game.state.companies.miningCorp;
          if (!mc.autoSell) {
            mc.autoSell = { iron: false, copper: false, silver: false, gold: false };
          }
          mc.autoSell[oreKey] = this.checked;
        });
      }
      var confirmBtn = overlay.querySelector("#sell-ore-confirm");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
          Game.Companies.ensureMiningMines();
          var mc = Game.state.companies.miningCorp;
          var selection = { iron: false, copper: false, silver: false, gold: false };
          var togglesNow = overlay.querySelectorAll(".ore-auto-toggle");
          for (var j = 0; j < togglesNow.length; j++) {
            var key = togglesNow[j].getAttribute("data-ore");
            if (!key) continue;
            selection[key] = togglesNow[j].checked;
          }
          Game.Companies.sellOre(selection);
          closeModal();
          UI.renderCurrentTab();
        });
      }
    },
    openRailExamModal: function (examId) {
      var id = String(examId || "");
      if (!id) return;
      if (!Game.Companies || typeof Game.Companies.getRailExamDef !== "function") return;
      var def = Game.Companies.getRailExamDef(id);
      if (!def) return;
  
      var r = Game.state && Game.state.companies ? Game.state.companies.railLogistics : null;
      if (!r || !r.unlocked) {
        Game.addNotification("Rail Logistics must be unlocked before you can take this exam.");
        return;
      }
      if (r.certifications && r.certifications[id]) {
        Game.addNotification("Certification already unlocked: " + def.name + ".");
        return;
      }
  
      var questions = {
        flammables: [
          { q: "Which cargo class requires a tanker carriage?", a: ["General", "Flammables", "Explosives"], c: 1 },
          { q: "What is the safest action if you spot a fuel leak?", a: ["Ignore it", "Report and stop operations", "Speed up"], c: 1 },
          { q: "Flammables certification unlocks hauling:", a: ["Fuel", "Coal", "Grain"], c: 0 }
        ],
        chemicals: [
          { q: "Chemicals cargo should be carried in:", a: ["Box carriage", "Chemical tank", "Secure explosive carriage"], c: 1 },
          { q: "Why are chemicals handled differently?", a: ["They can react or corrode", "They are lighter", "They are always cheap"], c: 0 },
          { q: "Chemicals certification unlocks hauling:", a: ["Chemicals", "Medical supplies", "Steel"], c: 0 }
        ],
        explosives: [
          { q: "Explosives cargo should be carried in:", a: ["Fuel tanker", "Box carriage", "Secure explosive carriage"], c: 2 },
          { q: "Explosives handling prioritizes:", a: ["Speed", "Safety and isolation", "Lower prices"], c: 1 },
          { q: "Explosives certification unlocks hauling:", a: ["Explosives", "Grain", "Lumber"], c: 0 }
        ]
      };
      var qs = questions[id] || [];
      if (!qs.length) return;
  
      var fee = def.fee || 0;
      UI.confirmModal({
        title: "Start exam",
        sub: def.name,
        bodyHtml: '<div class="card-section small dim">Pay <span class="mono">$' + fee.toFixed(0) + '</span> from Rail Logistics business funds and begin the exam?</div>',
        confirmLabel: "Begin",
        onConfirm: function () {
          var ok = Game.Companies.beginRailExam(id);
          if (!ok) return;
  
          var body = [];
          body.push('<div class="modal-card-body">');
          body.push('<div class="small dim">Answer at least 2 of 3 correctly to pass.</div>');
          for (var i = 0; i < qs.length; i++) {
            var q = qs[i];
            body.push('<div class="mt-6"><div><b>Q' + (i + 1) + ".</b> " + q.q + "</div>");
            for (var j = 0; j < q.a.length; j++) {
              body.push('<label class="small" style="display:block;margin-top:6px;"><input type="radio" name="rail-exam-q' + i + '" value="' + j + '"> ' + q.a[j] + "</label>");
            }
            body.push("</div>");
          }
          body.push("</div>");
  
          UI.openModalCard({
            title: "Rail Exam",
            sub: def.name,
            bodyHtml: body.join(""),
            noClose: true,
            actions: [
              { id: "exit", label: "Exit", primary: false },
              { id: "submit", label: "Submit", primary: true }
            ],
            large: true,
            onAction: function (actionId, close, overlay) {
              if (actionId === "exit") {
                if (Game.Companies && typeof Game.Companies.cancelRailExam === "function") {
                  Game.Companies.cancelRailExam(id);
                }
                close();
                UI.renderCurrentTab();
                return;
              }
              if (actionId === "submit") {
                var correct = 0;
                for (var qi = 0; qi < qs.length; qi++) {
                  var sel = overlay.querySelector('input[name="rail-exam-q' + qi + '"]:checked');
                  var v = sel ? parseInt(sel.value, 10) : -1;
                  if (v === qs[qi].c) correct += 1;
                }
                var passed = correct >= 2;
                Game.Companies.completeRailExam(id, passed);
                close();
                UI.renderCurrentTab();
              }
            }
          });
        }
      });
    },
    showTenantPickerModal: function (propertyId) { return UI.Tabs.showTenantPickerModal(propertyId); },
    showPropertyManageModal: function (propertyId) { return UI.Tabs.showPropertyManageModal(propertyId); },
    renderMiningCorpPage: function () {
      var m = Game.state.companies.miningCorp;
      Game.Companies.ensureMiningMines();
      if (Game.Companies && typeof Game.Companies.ensureMiningContracts === "function") {
        Game.Companies.ensureMiningContracts();
      }
      var unitPrice = Game.Companies.getOreUnitPrice();
      var totalPrice = Game.Companies.getOreTotalPrice();
      var html = [];
      if (typeof unitPrice !== "number" || !isFinite(unitPrice) || unitPrice < 0) unitPrice = 0;
      if (typeof totalPrice !== "number" || !isFinite(totalPrice) || totalPrice < 0) totalPrice = 0;
      var detail = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
      var minesCount = Array.isArray(m.mines) ? m.mines.length : 0;
      var funds = (typeof m.funds === "number" && isFinite(m.funds)) ? m.funds : 0;
      var payrollIn = (typeof m.daysUntilPayroll === "number" && isFinite(m.daysUntilPayroll)) ? m.daysUntilPayroll : (m.daysUntilPayroll || 0);
      var morale = (typeof m.morale === "number" && isFinite(m.morale)) ? m.morale : 70;
      if (morale < 0) morale = 0;
      if (morale > 100) morale = 100;
      var logisticsMult = (Game.Companies && typeof Game.Companies.getMiningLogisticsMultiplier === "function") ? Game.Companies.getMiningLogisticsMultiplier() : 1;
      if (typeof logisticsMult !== "number" || !isFinite(logisticsMult) || logisticsMult < 1) logisticsMult = 1;
      var logisticsPct = (logisticsMult - 1) * 100;
      var autoSell = m.autoSell || { iron: false, copper: false, silver: false, gold: false };
      html.push('<div id="miningcorp-page" class="company-page company-page-mining">');
      html.push('<div class="card company-hero company-mining">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-mining" title="Mining Corp">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2 20h20v2H2v-2m2-2h16l-5.5-10.5L12 12l-2.5-4.5L4 18m8.5-7.5L14 8l3.5 6.5h-4l-1-2m-2.5 0l-1 2h-4L10 8l1.5 2.5z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="section-title">Mining Corp</div>');
      html.push('<div class="section-subtitle company-subtitle">Operate mines, manage contracts and automation, and convert ore into business funds.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (m.unlocked ? "badge-green" : "badge-red") + '">' + (m.unlocked ? "Unlocked" : "Locked") + '</span>');
      html.push('<span class="badge badge-blue">L' + (m.level || 0) + '</span>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="company-kpis company-kpis-wide mt-8">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="mining-funds">$' + funds.toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Owned mines</div><div class="kpi-value"><span id="mining-owned-mines">' + minesCount + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Ore stock</div><div class="kpi-value"><span id="mining-ore">' + (m.oreStock || 0).toFixed(1) + ' t</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Est. unit price</div><div class="kpi-value">$<span id="mining-unit-price">' + unitPrice.toFixed(2) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Total price</div><div class="kpi-value">$<span id="mining-total-price">' + totalPrice.toFixed(0) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Payroll in</div><div class="kpi-value"><span id="mining-payroll-in">' + payrollIn + '</span> days</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Morale</div><div class="kpi-value"><span id="mining-morale">' + morale.toFixed(0) + '%</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Logistics bonus</div><div class="kpi-value"><span id="mining-logistics">' + logisticsPct.toFixed(1) + '%</span></div></div>');
      html.push('</div>');
  
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Automation</div>');
      html.push('<div class="card-meta">Auto-sell + payout rules</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row small"><span>Auto-sell ore</span><span><div class="chip-row" style="margin-bottom:0;">'
        + '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="iron"' + (autoSell.iron ? ' checked' : '') + '> Iron</label> '
        + '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="copper"' + (autoSell.copper ? ' checked' : '') + '> Copper</label> '
        + '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="silver"' + (autoSell.silver ? ' checked' : '') + '> Silver</label> '
        + '<label class="small"><input type="checkbox" class="mining-auto-sell-toggle" data-ore="gold"' + (autoSell.gold ? ' checked' : '') + '> Gold</label>'
        + '</div></span></div>');
      html.push('<div class="field-row small mt-4"><span>Auto transfer</span><span><label class="small"><input type="checkbox" id="mining-auto-payout"' + (m.autoPayoutToWallet ? ' checked' : '') + '> Send excess to wallet</label></span></div>');
      html.push('<div class="field-row small"><span>Keep reserve</span><span><input id="mining-auto-reserve" class="input-small" type="number" min="0" step="10" value="' + ((typeof m.autoPayoutReserve === "number" && isFinite(m.autoPayoutReserve) && m.autoPayoutReserve >= 0) ? m.autoPayoutReserve.toFixed(0) : "0") + '" placeholder="0"></span></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Treasury</div>');
      html.push('<div class="card-meta">Wallet â†” business funds</div>');
      html.push('<div class="card-section small company-control-grid">');
      html.push('<div class="company-control-row"><input id="mining-deposit" class="company-input" type="number" min="0" step="10" placeholder="Deposit amount"><button class="btn btn-small btn-outline" id="btn-mining-deposit">Deposit</button></div>');
      html.push('<div class="company-control-row mt-4"><input id="mining-withdraw" class="company-input" type="number" min="0" step="10" placeholder="Withdraw amount"><button class="btn btn-small btn-outline" id="btn-mining-withdraw">Withdraw</button></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Use business funds to pay for contracts, payroll and upgrades. Auto-transfer applies to excess above your reserve.</div>');
      html.push('</div>');
  
      html.push('<div class="card card-wide">');
      html.push('<div class="card-title">Ore Breakdown</div>');
      html.push('<div class="card-meta">Current stock composition</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Fe</span><span class="mono"><span id="mining-ore-iron">' + (detail.iron || 0).toFixed(1) + '</span> t</span></div>');
      html.push('<div class="field-row"><span>Cu</span><span class="mono"><span id="mining-ore-copper">' + (detail.copper || 0).toFixed(1) + '</span> t</span></div>');
      html.push('<div class="field-row"><span>Ag</span><span class="mono"><span id="mining-ore-silver">' + (detail.silver || 0).toFixed(1) + '</span> t</span></div>');
      html.push('<div class="field-row"><span>Au</span><span class="mono"><span id="mining-ore-gold">' + (detail.gold || 0).toFixed(1) + '</span> t</span></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card card-wide">');
      html.push('<div class="card-title">Mines</div>');
      html.push('<div class="card-section">');
      if (m.mines.length === 0) {
        html.push('<div class="small dim">No mines yet. Sign a contract below to open your first mine.</div>');
      } else {
        html.push('<div class="table-scroll">');
        html.push('<table class="table"><thead><tr><th>Mine</th><th>Region</th><th>Level</th><th>Staff</th><th>Machines</th><th>Status</th><th>Actions</th></tr></thead><tbody>');
        for (var i = 0; i < m.mines.length; i++) {
          var mine = m.mines[i];
          var staff = m.staffPerMine[mine.id] || 0;
          var machines = m.machinesPerMine[mine.id] || 0;
          html.push('<tr>');
          html.push('<td>' + mine.name + '</td>');
          html.push('<td>' + mine.region + '</td>');
          html.push('<td>L' + mine.level + '</td>');
          html.push('<td><span class="mining-mine-staff" data-mine="' + mine.id + '">' + staff + '</span></td>');
          html.push('<td><span class="mining-mine-machines" data-mine="' + mine.id + '">' + machines + '</span></td>');
          var contractLeft = (typeof mine.contractDaysLeft === "number" && isFinite(mine.contractDaysLeft)) ? mine.contractDaysLeft : null;
          var contractTotal = (typeof mine.contractDaysTotal === "number" && isFinite(mine.contractDaysTotal)) ? mine.contractDaysTotal : null;
          var expired = (contractLeft !== null && contractLeft <= 0);
          var goldRemain = (typeof mine.goldRemaining === "number" && isFinite(mine.goldRemaining)) ? mine.goldRemaining : null;
          var goldCap = (typeof mine.goldPerContract === "number" && isFinite(mine.goldPerContract)) ? mine.goldPerContract : null;
          html.push('<td>' + (expired ? "Expired" : (mine.active ? "Active" : "Paused"))
            + ((contractLeft !== null || goldRemain !== null) ? ('<div class="small dim">'
              + (contractLeft !== null ? ('Contract: ' + contractLeft + (contractTotal ? ('/' + contractTotal) : '') + 'd') : '')
              + (contractLeft !== null && goldRemain !== null ? ' â€¢ ' : '')
              + (goldRemain !== null ? ('Gold left: ' + goldRemain.toFixed(2) + (goldCap !== null ? ('/' + goldCap.toFixed(2)) : '') + 't') : '')
              + '</div>') : '') + '</td>');
          html.push('<td><div class="mine-actions"><button class="btn btn-small btn-outline btn-mine-toggle" data-mine="' + mine.id + '"' + (expired ? ' disabled' : '') + '>'
            + (mine.active ? "Pause" : "Activate") + '</button>');
          var hireCost = 120;
          var machineCost = 420;
          html.push('<button class="btn btn-small btn-outline btn-mine-staff" data-mine="' + mine.id + '"' + (expired ? ' disabled' : '') + ' title="Hire 1 staff for $' + hireCost.toFixed(0) + ' from Mining Corp business funds.">Hire staff</button>');
          html.push('<button class="btn btn-small btn-outline btn-mine-machine" data-mine="' + mine.id + '"' + (expired ? ' disabled' : '') + ' title="Buy 1 machine for $' + machineCost.toFixed(0) + ' from Mining Corp business funds.">Buy machine</button>');
          if (expired) {
            html.push('<button class="btn btn-small btn-primary btn-mine-renew" data-mine="' + mine.id + '">Renew contract</button>');
          }
          html.push('</div></td>');
          html.push('</tr>');
        }
        html.push('</tbody></table>');
        html.push('</div>');
      }
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Available Mining Contracts</div>');
      html.push('<div class="card-meta">Open mines and expand your portfolio</div>');
      html.push('<div class="card-section small company-list">');
      var defs = Game.Companies.miningMineCatalog || [];
      for (var j = 0; j < defs.length; j++) {
        var def = defs[j];
        var already = false;
        for (var k = 0; k < m.mines.length; k++) {
          if (m.mines[k].id === def.id) {
            already = true;
            break;
          }
        }
        html.push('<div class="company-list-item">');
        html.push('<div class="field-row"><span>' + def.name + '</span><span>$' + def.contractCost.toFixed(0) + '</span></div>');
        html.push('<div class="small dim">' + def.region + ' â€¢ Capacity ' + def.baseCapacity + ' t/day</div>');
        html.push('<div class="field-row small mt-4"><span>Staff / machines needed</span><span>' + def.requiredStaff + ' staff / ' + def.requiredMachines + ' machines</span></div>');
        html.push('<div class="field-row small"><span>Contract length</span><span>' + ((typeof def.contractDays === "number" && isFinite(def.contractDays)) ? Math.floor(def.contractDays) : 0) + ' days</span></div>');
        html.push('<div class="field-row small"><span>Gold cap</span><span>' + ((typeof def.goldPerContract === "number" && isFinite(def.goldPerContract)) ? def.goldPerContract.toFixed(2) : "0.00") + ' t</span></div>');
        html.push('<button class="btn btn-small ' + (already ? 'btn-outline' : 'btn-primary') + ' mt-4 btn-mine-contract" data-mine="' + def.id + '"' + (already ? ' disabled' : '') + '>' + (already ? "Active" : "Sign contract") + '</button>');
        html.push('</div>');
      }
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="btn-mining-back">Back to companies</button></div>');
      html.push('</div>');
      return html.join("");
    },
    showMiningCorpPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderMiningCorpPage();
      UI.bindMiningCorpPageEvents();
    },
    bindMiningCorpPageEvents: function () {
      var backBtn = document.getElementById("btn-mining-back");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          UI.renderCurrentTab();
        });
      }
      var toggleBtns = document.querySelectorAll(".btn-mine-toggle");
      for (var i = 0; i < toggleBtns.length; i++) {
        toggleBtns[i].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-mine");
          Game.Companies.toggleMineActive(id);
          UI.showMiningCorpPage();
        });
      }
      var staffBtns = document.querySelectorAll(".btn-mine-staff");
      for (var j = 0; j < staffBtns.length; j++) {
        staffBtns[j].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-mine");
          Game.Companies.hireMiningStaff(id);
          UI.showMiningCorpPage();
        });
      }
      var machineBtns = document.querySelectorAll(".btn-mine-machine");
      for (var k = 0; k < machineBtns.length; k++) {
        machineBtns[k].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-mine");
          Game.Companies.buyMiningMachine(id);
          UI.showMiningCorpPage();
        });
      }
      var contractBtns = document.querySelectorAll(".btn-mine-contract");
      for (var x = 0; x < contractBtns.length; x++) {
        contractBtns[x].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-mine");
          var beforeFunds = Game.state.companies.miningCorp.funds || 0;
          Game.Companies.buyMiningContract(id);
          UI.showMiningCorpPage();
          var afterFunds = Game.state.companies.miningCorp.funds || 0;
          if (window.UI && UI.animateNumber && afterFunds !== beforeFunds) {
            var el = document.getElementById("mining-funds");
            if (el) {
              el.textContent = "$" + beforeFunds.toFixed(2);
              UI.animateNumber("miningFunds", afterFunds);
            }
          }
        });
      }
      var depositInput = document.getElementById("mining-deposit");
      var depositBtn = document.getElementById("btn-mining-deposit");
      if (depositBtn && depositInput) {
        depositBtn.addEventListener("click", function () {
          var before = Game.state.companies.miningCorp.funds || 0;
          var val = parseFloat(depositInput.value);
          Game.Companies.depositMiningFunds(val);
          UI.showMiningCorpPage();
          var after = Game.state.companies.miningCorp.funds || 0;
          if (window.UI && UI.animateNumber && after !== before) {
            var el = document.getElementById("mining-funds");
            if (el) {
              el.textContent = "$" + before.toFixed(2);
              UI.animateNumber("miningFunds", after);
            }
          }
        });
      }
      var withdrawInput = document.getElementById("mining-withdraw");
      var withdrawBtn = document.getElementById("btn-mining-withdraw");
      if (withdrawBtn && withdrawInput) {
        withdrawBtn.addEventListener("click", function () {
          var before = Game.state.companies.miningCorp.funds || 0;
          var val = parseFloat(withdrawInput.value);
          Game.Companies.withdrawMiningFunds(val);
          UI.showMiningCorpPage();
          var after = Game.state.companies.miningCorp.funds || 0;
          if (window.UI && UI.animateNumber && after !== before) {
            var el = document.getElementById("mining-funds");
            if (el) {
              el.textContent = "$" + before.toFixed(2);
              UI.animateNumber("miningFunds", after);
            }
          }
        });
      }
      var autoSellToggles = document.querySelectorAll(".mining-auto-sell-toggle");
      for (var t = 0; t < autoSellToggles.length; t++) {
        autoSellToggles[t].addEventListener("change", function (e) {
          var key = e.target.getAttribute("data-ore");
          if (!key) return;
          if (!Game.state.companies.miningCorp.autoSell) {
            Game.state.companies.miningCorp.autoSell = { iron: false, copper: false, silver: false, gold: false };
          }
          Game.state.companies.miningCorp.autoSell[key] = !!e.target.checked;
          UI.showMiningCorpPage();
        });
      }
      var autoPayoutToggle = document.getElementById("mining-auto-payout");
      if (autoPayoutToggle) {
        autoPayoutToggle.addEventListener("change", function () {
          Game.state.companies.miningCorp.autoPayoutToWallet = !!autoPayoutToggle.checked;
          UI.showMiningCorpPage();
        });
      }
      var autoReserveInput = document.getElementById("mining-auto-reserve");
      if (autoReserveInput) {
        autoReserveInput.addEventListener("change", function () {
          var v = parseFloat(autoReserveInput.value);
          if (!isFinite(v) || v < 0) v = 0;
          Game.state.companies.miningCorp.autoPayoutReserve = v;
          UI.showMiningCorpPage();
        });
      }
    },
    renderRailLogisticsPage: function () {
      var r = Game.state.companies.railLogistics;
      if (Game.Companies && typeof Game.Companies.ensureRailLogisticsState === "function") {
        Game.Companies.ensureRailLogisticsState();
      }
      var html = [];
      var fleet = Array.isArray(r.fleet) ? r.fleet : [];
      var hqLabel = r.hqLocation || "London";
      var trainsOwned = (r.fleet && r.fleet.length) ? r.fleet.length : 0;
      var dispatchers = (r.staff && typeof r.staff.dispatchers === "number" && isFinite(r.staff.dispatchers)) ? r.staff.dispatchers : 0;
      var maintenance = (r.staff && typeof r.staff.maintenance === "number" && isFinite(r.staff.maintenance)) ? r.staff.maintenance : 0;
      var activeRuns = Array.isArray(r.activeRuns) ? r.activeRuns.length : 0;
      var railFunds = (typeof r.funds === "number" && isFinite(r.funds)) ? r.funds : 0;
      html.push('<div id="rail-page" class="company-page company-page-rail">');
      html.push('<div class="card company-hero company-rail">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-rail" title="Rail Logistics">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c-4.4 0-8 1.8-8 6v9c0 1.7 1.3 3 3 3l-1 1v1h12v-1l-1-1c1.7 0 3-1.3 3-3V8c0-4.2-3.6-6-8-6m0 2c3.7 0 6 .9 6 4H6c0-3.1 2.3-4 6-4m-6 6h12v7H6v-7m3.5 1.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m5 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M8 18h8l1 1H7l1-1z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="section-title">Rail Logistics</div>');
      html.push('<div class="section-subtitle company-subtitle">Contracts are accepted automatically. Keep warehouses staffed and trains configured; dispatchers will assign jobs as trains return.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge badge-blue">L' + (r.level || 0) + '</span>');
      html.push('<span class="badge badge-accent">Rep ' + (r.reputation || 0).toFixed(0) + '</span>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="company-kpis company-kpis-wide mt-8">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="rail-funds">$' + railFunds.toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">HQ</div><div class="kpi-value" id="rail-hq">' + hqLabel + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Trains</div><div class="kpi-value"><span id="rail-trains">' + trainsOwned + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Dispatchers</div><div class="kpi-value"><span id="rail-dispatchers">' + dispatchers + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Maintenance</div><div class="kpi-value"><span id="rail-maintenance">' + maintenance + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Active runs</div><div class="kpi-value"><span id="rail-active-runs">' + activeRuns + '</span></div></div>');
      html.push('</div>');
  
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Business Funds</div>');
      html.push('<div class="card-section small dim">Deposit/withdraw to fund operations. Deliveries pay into business funds when trains arrive.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row small mt-4"><span>Deposit</span><span class="bank-transfer-controls"><span class="bank-control-group"><input id="rail-deposit" class="bank-input" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="btn-rail-deposit">Deposit</button></span></span></div>');
      html.push('<div class="field-row small mt-4"><span>Withdraw</span><span class="bank-transfer-controls"><span class="bank-control-group"><input id="rail-withdraw" class="bank-input" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="btn-rail-withdraw">Withdraw</button></span></span></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card card-wide">');
      html.push('<div class="card-title">Rail Operations</div>');
      html.push('<div class="card-section small dim">Manage warehouses, contracts, tracks, and your fleet.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="rail-ops-panel">');
      html.push('<div class="field-row small"><span>Hire dispatcher</span><span class="mono">$260</span></div>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-hire-dispatcher">Hire dispatcher</button>');
      html.push('<div class="field-row small mt-6"><span>Hire maintenance crew</span><span class="mono">$220</span></div>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-hire-maintenance">Hire maintenance</button>');
      html.push('<div class="mt-6"></div>');
      html.push('<button class="btn btn-small btn-primary mt-4" id="btn-rail-open-buy-train">Buy train (custom)</button>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-open-warehouses">Warehouses</button>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-open-orders">Contracts</button>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-open-tracks">Track condition</button>');
      html.push('<button class="btn btn-small btn-outline mt-4" id="btn-rail-go-exams">Rail exams (Education)</button>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
  
  
      html.push('<div class="card card-wide">');
      html.push('<div class="card-title">Fleet Status</div>');
      html.push('<div class="card-section">');
      fleet = Array.isArray(r.fleet) ? r.fleet : [];
      if (!fleet.length) {
        html.push('<div class="small dim">No trains owned yet. Buy a train to start accepting contracts.</div>');
      } else {
        var runs = Array.isArray(r.activeRuns) ? r.activeRuns : [];
        var runByTrain = {};
        for (var rr = 0; rr < runs.length; rr++) {
          var run = runs[rr];
          if (run && run.trainId) runByTrain[run.trainId] = run;
        }
        html.push('<div class="table-scroll"><table class="table rail-fleet-table"><thead><tr><th>Train</th><th>Status</th><th>Max speed</th><th>Weight</th><th>ETA</th><th>Covered</th><th>Remaining</th><th></th></tr></thead><tbody>');
        for (var f = 0; f < fleet.length; f++) {
          var trn = fleet[f];
          if (!trn) continue;
          var activeRun = runByTrain[trn.id] || null;
          var status = activeRun ? "IN TRANSIT" : "IDLE";
          var emptyWt = (Game.Companies && typeof Game.Companies.getTrainEmptyWeightTons === "function") ? Game.Companies.getTrainEmptyWeightTons(trn) : 0;
          var maxSpeed = (Game.Companies && typeof Game.Companies.getTrainProjectedSpeedKmh === "function") ? Game.Companies.getTrainProjectedSpeedKmh(trn, 0) : 0;
          var eta = "-";
          var covered = "-";
          var remaining = "-";
          if (activeRun) {
            var left = activeRun.minutesLeft || 0;
            eta = Math.max(0, Math.ceil(left)) + "m";
            var dist = (typeof activeRun.distanceKm === "number" && isFinite(activeRun.distanceKm)) ? activeRun.distanceKm : 0;
            var distLeft = (typeof activeRun.distanceLeftKm === "number" && isFinite(activeRun.distanceLeftKm)) ? activeRun.distanceLeftKm : null;
            if (dist > 0) {
              var cov = 0;
              if (distLeft !== null) cov = Math.max(0, Math.min(dist, dist - distLeft));
              else {
                var total = activeRun.minutesTotal || 1;
                if (total > 0) {
                  var pct = Math.max(0, Math.min(1, (total - left) / total));
                  cov = dist * pct;
                }
              }
              var rem = Math.max(0, dist - cov);
              covered = cov.toFixed(1) + " km";
              remaining = rem.toFixed(1) + " km";
            }
          }
          html.push('<tr class="rail-fleet-row" data-train="' + trn.id + '">');
          html.push("<td>" + (trn.name || trn.id) + "</td>");
          html.push('<td class="mono rail-train-status" data-train="' + trn.id + '">' + status + "</td>");
          html.push('<td class="mono rail-train-speed" data-train="' + trn.id + '">' + (maxSpeed ? (maxSpeed + " km/h") : "-") + "</td>");
          html.push('<td class="mono rail-train-weight" data-train="' + trn.id + '">' + (emptyWt ? (emptyWt.toFixed(1) + " t") : "-") + "</td>");
          html.push('<td class="mono rail-train-eta" data-train="' + trn.id + '">' + eta + "</td>");
          html.push('<td class="mono rail-train-covered" data-train="' + trn.id + '">' + covered + "</td>");
          html.push('<td class="mono rail-train-remaining" data-train="' + trn.id + '">' + remaining + "</td>");
          html.push('<td><button class="btn btn-small btn-outline btn-rail-train-manage" data-train="' + trn.id + '">Manage</button></td>');
          html.push("</tr>");
        }
        html.push("</tbody></table></div>");
        html.push('<div class="small dim mt-4">In-transit stats update as time passes.</div>');
      }
      html.push('</div>');
      html.push('</div>');
  
  
      html.push('</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="btn-rail-back">Back to companies</button></div>');
      html.push('</div>');
      return html.join("");
    },
    renderNetCafePage: function () {
      if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
      if (Game.Net && typeof Game.Net.ensure === "function") Game.Net.ensure();
      if (Game.PC && typeof Game.PC.ensureState === "function") Game.PC.ensureState();
  
      var n = Game.state.companies.netCafe;
      var gStats = (Game.state.stats && typeof Game.state.stats === "object") ? Game.state.stats : {};
      var businessSkill = (typeof gStats.businessSkill === "number" && isFinite(gStats.businessSkill)) ? Math.floor(gStats.businessSkill) : 0;
      var stats = n.stats || { todayCustomers: 0, todayRevenue: 0, todayCost: 0, yesterdayCustomers: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
      var maxMbps = (Game.Net && typeof Game.Net.getEffectiveMbps === "function") ? Game.Net.getEffectiveMbps() : 0;
      if (typeof maxMbps !== "number" || !isFinite(maxMbps) || maxMbps < 0) maxMbps = 0;
  
      var threshold = 300 + (n.level || 0) * 250;
      if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 300;
      var xp = (typeof n.xp === "number" && isFinite(n.xp) && n.xp > 0) ? n.xp : 0;
      var xpPct = threshold > 0 ? Math.floor((xp / threshold) * 100) : 0;
      if (xpPct < 0) xpPct = 0;
      if (xpPct > 100) xpPct = 100;
  
      var seatCost = (Game.Companies && typeof Game.Companies.getNetCafeNextSeatCost === "function") ? Game.Companies.getNetCafeNextSeatCost() : 0;
      if (typeof seatCost !== "number" || !isFinite(seatCost) || seatCost < 0) seatCost = 0;
  
      var pop = (typeof n.popularity === "number" && isFinite(n.popularity)) ? n.popularity : 0;
      if (pop < 0) pop = 0;
      if (pop > 100) pop = 100;
      var price = (typeof n.pricePerCustomer === "number" && isFinite(n.pricePerCustomer)) ? n.pricePerCustomer : 2.5;
      if (price <= 0) price = 2.5;
      var members = (typeof n.members === "number" && isFinite(n.members)) ? n.members : 0;
      if (members < 0) members = 0;
      var membershipPrice = (typeof n.membershipPrice === "number" && isFinite(n.membershipPrice)) ? n.membershipPrice : 8;
      if (membershipPrice < 4) membershipPrice = 4;
      if (membershipPrice > 20) membershipPrice = 20;
  
      var factors = (Game.Companies && typeof Game.Companies.getNetCafeDemandFactors === "function") ? Game.Companies.getNetCafeDemandFactors(n) : { demandBase: 0.6, priceFactor: 1, serviceFactor: 1, idealPrice: 2.5 };
      var demand = factors.demandBase * factors.priceFactor * factors.serviceFactor;
      if (!isFinite(demand) || demand < 0.2) demand = 0.2;
      if (demand > 2.8) demand = 2.8;
      var demandPct = Math.floor(((demand - 0.2) / (2.8 - 0.2)) * 100);
      if (demandPct < 0) demandPct = 0;
      if (demandPct > 100) demandPct = 100;
      var idealPrice = (typeof factors.idealPrice === "number" && isFinite(factors.idealPrice)) ? factors.idealPrice : 2.5;
      var priceFactor = (typeof factors.priceFactor === "number" && isFinite(factors.priceFactor)) ? factors.priceFactor : 1;
      var serviceFactor = (typeof factors.serviceFactor === "number" && isFinite(factors.serviceFactor)) ? factors.serviceFactor : 1;
  
      var canBuySeat = !!n.unlocked && (n.funds || 0) >= seatCost && seatCost > 0;
      var html = [];
      var tProfit = (stats.todayRevenue || 0) - (stats.todayCost || 0);
      var yProfit = (stats.yesterdayRevenue || 0) - (stats.yesterdayCost || 0);
  
      html.push('<div id="netcafe-page" class="company-page company-page-netcafe">');
      html.push('<div class="card company-hero company-netcafe">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-netcafe" title="Internet Cafe">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 18.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m0-4.5c-2.1 0-4 .8-5.4 2.1l1.4 1.4C8.9 16.4 10.4 16 12 16s3.1.4 4 1.5l1.4-1.4C16 14.8 14.1 14 12 14m0-4c-3.2 0-6.1 1.2-8.3 3.4l1.4 1.4C7.9 13.3 9.9 12.5 12 12.5s4.1.8 5.9 2.3l1.4-1.4C18.1 11.2 15.2 10 12 10m0-4C7.7 6 3.9 7.7 1.1 10.5l1.4 1.4C4.9 9.5 8.3 8 12 8s7.1 1.5 9.5 3.9l1.4-1.4C20.1 7.7 16.3 6 12 6z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="section-title">Internet Cafe</div>');
      html.push('<div class="section-subtitle company-subtitle">A compact cybercafe business. Demand scales with internet speed and your setup.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (n.unlocked ? "badge-green" : "badge-red") + '">' + (n.unlocked ? "Unlocked" : "Locked") + '</span>');
      html.push('<span class="badge badge-blue">L<span id="netcafe-page-level">' + (n.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      if (!n.unlocked) {
        html.push('<div class="notice">Unlock requirement: Business skill 5 (you: ' + businessSkill + ').</div>');
      }
      html.push('</div>');
  
      html.push('<div class="company-kpis company-kpis-wide mt-8">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="netcafe-page-funds">$' + (n.funds || 0).toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Seats</div><div class="kpi-value" id="netcafe-page-seats">' + (n.seats || 0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Max Mbps</div><div class="kpi-value" id="netcafe-page-net">' + maxMbps.toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Popularity</div><div class="kpi-value"><span id="netcafe-page-pop">' + pop.toFixed(0) + '</span>%</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Price / customer</div><div class="kpi-value">$<span id="netcafe-page-price">' + price.toFixed(1) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Members</div><div class="kpi-value" id="netcafe-page-members">' + members.toFixed(0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">XP</div><div class="kpi-value" id="netcafe-page-xp">' + xp.toFixed(0) + " / " + threshold.toFixed(0) + '</div><div class="progress mt-4"><div id="netcafe-page-xpbar" class="progress-fill cyan" style="width:' + xpPct + '%"></div></div></div>');
      html.push('</div>');
  
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Operations Console</div>');
      html.push('<div class="card-meta">Pricing + capacity upgrades</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Price per customer</span><span><input id="netcafe-price" class="input-small" type="number" min="1" max="10" step="0.1" value="' + price.toFixed(1) + '"' + (!n.unlocked ? " disabled" : "") + '></span></div>');
      html.push('<div class="field-row mt-4"><span>Membership price</span><span><input id="netcafe-membership-price" class="input-small" type="number" min="4" max="20" step="0.5" value="' + membershipPrice.toFixed(1) + '"' + (!n.unlocked ? " disabled" : "") + '></span></div>');
      html.push('<div class="field-row mt-4"><span>Next seat cost</span><span class="mono">$<span id="netcafe-seat-cost">' + seatCost.toFixed(0) + '</span></span></div>');
      html.push('<div class="field-row mt-4"><span>Upgrade capacity</span><span><button class="btn btn-small btn-primary" id="btn-netcafe-buy-seat"' + (!canBuySeat ? ' disabled' : '') + '>Buy PC seat</button></span></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Tip: upgrade your internet plan to increase demand immediately.</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Signal</div>');
      html.push('<div class="card-meta">A rough demand indicator</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Demand index</span><span class="mono" id="netcafe-demand-label">' + demand.toFixed(2) + '</span></div>');
      html.push('<div class="progress mt-4"><div id="netcafe-demand-bar" class="progress-fill cyan" style="width:' + demandPct + '%"></div></div>');
      html.push('<div class="field-row mt-4"><span>Ideal price</span><span class="mono">$' + idealPrice.toFixed(2) + '</span></div>');
      html.push('<div class="field-row mt-4"><span>Price factor</span><span class="mono">' + priceFactor.toFixed(2) + 'x</span></div>');
      html.push('<div class="field-row mt-4"><span>Service factor</span><span class="mono">' + serviceFactor.toFixed(2) + 'x</span></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Higher Mbps + popularity increase daily customers.</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Business Funds</div>');
      html.push('<div class="card-meta">Deposit / withdraw</div>');
      html.push('<div class="card-section small company-control-grid">');
      html.push('<div class="company-control-row"><input id="netcafe-deposit" class="company-input" type="number" min="0" step="10" placeholder="Deposit amount"' + (!n.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-netcafe-deposit"' + (!n.unlocked ? " disabled" : "") + '>Deposit</button></div>');
      html.push('<div class="company-control-row mt-4"><input id="netcafe-withdraw" class="company-input" type="number" min="0" step="10" placeholder="Withdraw amount"' + (!n.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-netcafe-withdraw"' + (!n.unlocked ? " disabled" : "") + '>Withdraw</button></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Daily Report</div>');
      html.push('<div class="card-meta">Customers, revenue, profit</div>');
      html.push('<div class="card-section small">');
      html.push('<div class="field-row"><span>Today</span><span id="netcafe-page-today">' + (stats.todayCustomers || 0).toFixed(0) + ' cust | $' + (stats.todayRevenue || 0).toFixed(0) + ' rev | $' + tProfit.toFixed(0) + ' profit</span></div>');
      html.push('<div class="field-row mt-4"><span>Yesterday</span><span id="netcafe-page-yesterday">' + (stats.yesterdayCustomers || 0).toFixed(0) + ' cust | $' + (stats.yesterdayRevenue || 0).toFixed(0) + ' rev | $' + yProfit.toFixed(0) + ' profit</span></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="btn-netcafe-back">Back to companies</button></div>');
      html.push('</div>');
      return html.join("");
    },
    showNetCafePage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderNetCafePage();
      UI.bindNetCafePageEvents();
    },
    bindNetCafePageEvents: function () {
      var backBtn = document.getElementById("btn-netcafe-back");
      if (backBtn) backBtn.addEventListener("click", function () { UI.renderCurrentTab(); });
  
      var depBtn = document.getElementById("btn-netcafe-deposit");
      if (depBtn) depBtn.addEventListener("click", function () {
        var input = document.getElementById("netcafe-deposit");
        var val = input ? parseFloat(input.value) : 0;
        if (Game.Companies && Game.Companies.depositNetCafeFunds) Game.Companies.depositNetCafeFunds(val);
        UI.showNetCafePage();
      });
      var witBtn = document.getElementById("btn-netcafe-withdraw");
      if (witBtn) witBtn.addEventListener("click", function () {
        var input2 = document.getElementById("netcafe-withdraw");
        var val2 = input2 ? parseFloat(input2.value) : 0;
        if (Game.Companies && Game.Companies.withdrawNetCafeFunds) Game.Companies.withdrawNetCafeFunds(val2);
        UI.showNetCafePage();
      });
      var buySeatBtn = document.getElementById("btn-netcafe-buy-seat");
      if (buySeatBtn) buySeatBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyNetCafeSeat) Game.Companies.buyNetCafeSeat();
        UI.showNetCafePage();
      });
      var priceInput = document.getElementById("netcafe-price");
      if (priceInput) priceInput.addEventListener("change", function () {
        if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
        var v = parseFloat(priceInput.value);
        if (!isFinite(v) || v <= 0) v = 2.5;
        if (v < 1) v = 1;
        if (v > 10) v = 10;
        Game.state.companies.netCafe.pricePerCustomer = Math.round(v * 10) / 10;
        UI.showNetCafePage();
      });
      var memberPriceInput = document.getElementById("netcafe-membership-price");
      if (memberPriceInput) memberPriceInput.addEventListener("change", function () {
        if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
        var v2 = parseFloat(memberPriceInput.value);
        if (!isFinite(v2) || v2 <= 0) v2 = 8;
        if (v2 < 4) v2 = 4;
        if (v2 > 20) v2 = 20;
        Game.state.companies.netCafe.membershipPrice = Math.round(v2 * 10) / 10;
        UI.showNetCafePage();
      });
    },
    renderCourierPage: function () {
      if (Game.Companies && typeof Game.Companies.ensureCourierState === "function") Game.Companies.ensureCourierState();
      var co = Game.state.companies.courierCo;
      var offers = Array.isArray(co.offers) ? co.offers : [];
      var orders = Array.isArray(co.orders) ? co.orders : [];
      var runs = Array.isArray(co.activeRuns) ? co.activeRuns : [];
      var eduLevel = (Game.state.education && typeof Game.state.education.level === "number" && isFinite(Game.state.education.level)) ? Math.floor(Game.state.education.level) : 0;
      var gStats = (Game.state.stats && typeof Game.state.stats === "object") ? Game.state.stats : {};
      var businessSkill = (typeof gStats.businessSkill === "number" && isFinite(gStats.businessSkill)) ? Math.floor(gStats.businessSkill) : 0;
  
      var threshold = 250 + (co.level || 0) * 200;
      if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 250;
      var xp = (typeof co.xp === "number" && isFinite(co.xp) && co.xp > 0) ? co.xp : 0;
      var xpPct = threshold > 0 ? Math.floor((xp / threshold) * 100) : 0;
      if (xpPct < 0) xpPct = 0;
      if (xpPct > 100) xpPct = 100;
  
      var vanCost = (Game.Companies && typeof Game.Companies.getCourierVanCost === "function") ? Game.Companies.getCourierVanCost() : 0;
      var hireCost = (Game.Companies && typeof Game.Companies.getCourierDriverHireCost === "function") ? Game.Companies.getCourierDriverHireCost() : 0;
      var managerCost = (Game.Companies && typeof Game.Companies.getCourierManagerHireCost === "function") ? Game.Companies.getCourierManagerHireCost() : 0;
      if (typeof vanCost !== "number" || !isFinite(vanCost) || vanCost < 0) vanCost = 0;
      if (typeof hireCost !== "number" || !isFinite(hireCost) || hireCost < 0) hireCost = 0;
      if (typeof managerCost !== "number" || !isFinite(managerCost) || managerCost < 0) managerCost = 0;
      var cap = Math.max(0, Math.min(co.vans || 0, co.drivers || 0));
      var deliveredToday = (co.stats && typeof co.stats.deliveredToday === "number" && isFinite(co.stats.deliveredToday)) ? co.stats.deliveredToday : 0;
      var deliveredYesterday = (co.stats && typeof co.stats.deliveredYesterday === "number" && isFinite(co.stats.deliveredYesterday)) ? co.stats.deliveredYesterday : 0;
      var policy = co.dispatchPolicy || "balanced";
      var streak = (typeof co.onTimeStreak === "number" && isFinite(co.onTimeStreak)) ? co.onTimeStreak : 0;
      var manager = (typeof co.manager === "number" && isFinite(co.manager)) ? co.manager : 0;
      var vanUpgradeLevel = (typeof co.vanUpgradeLevel === "number" && isFinite(co.vanUpgradeLevel)) ? co.vanUpgradeLevel : 0;
      if (vanUpgradeLevel < 0) vanUpgradeLevel = 0;
      if (vanUpgradeLevel > 10) vanUpgradeLevel = 10;
      var vanUpgradeCost = (Game.Companies && typeof Game.Companies.getCourierVanUpgradeCost === "function") ? Game.Companies.getCourierVanUpgradeCost() : 0;
      if (typeof vanUpgradeCost !== "number" || !isFinite(vanUpgradeCost) || vanUpgradeCost < 0) vanUpgradeCost = 0;
      var vanSpeedMult = (Game.Companies && typeof Game.Companies.getCourierVanSpeedMultiplier === "function") ? Game.Companies.getCourierVanSpeedMultiplier(co) : 1;
      if (typeof vanSpeedMult !== "number" || !isFinite(vanSpeedMult) || vanSpeedMult <= 0) vanSpeedMult = 1;
  
      var html = [];
      html.push('<div id="courier-page" class="company-page company-page-courier">');
  
      html.push('<div class="card company-hero company-courier">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-courier" title="Courier">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 7h11v9H3V7m12 2h3l3 4v3h-6V9m-1-4H3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h1a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h1v-5.5L19 7h-4V5c0-1.1-.9-2-2-2m-6 14a1 1 0 0 1-1-1a1 1 0 0 1 2 0a1 1 0 0 1-1 1m12 0a1 1 0 0 1-1-1a1 1 0 0 1 2 0a1 1 0 0 1-1 1z"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="section-title">Courier</div>');
      html.push('<div class="section-subtitle company-subtitle">Dispatch contracts, manage fleet capacity, and keep runs on-time.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (co.unlocked ? "badge-green" : "badge-red") + '">' + (co.unlocked ? "Unlocked" : "Locked") + '</span>');
      html.push('<span class="badge badge-blue">L<span id="courier-page-level">' + (co.level || 0) + '</span></span>');
      html.push('<span class="badge badge-accent" title="Capacity = min(vans, drivers)">Cap <span id="courier-page-capacity">' + cap + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      if (!co.unlocked) {
        html.push('<div class="notice">Unlock requirement: Education level 1 (you: ' + eduLevel + ') and Business skill 15 (you: ' + businessSkill + ').</div>');
      }
      html.push('</div>');
  
      html.push('<div class="company-kpis company-kpis-wide mt-8">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="courier-page-funds">$' + (co.funds || 0).toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Vans / Drivers</div><div class="kpi-value" id="courier-page-fleet">' + (co.vans || 0) + " / " + (co.drivers || 0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Manager</div><div class="kpi-value" id="courier-page-manager">' + (manager || 0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Offers</div><div class="kpi-value" id="courier-page-offers">' + offers.length + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Queued</div><div class="kpi-value" id="courier-page-queued">' + orders.length + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Active</div><div class="kpi-value" id="courier-page-active">' + runs.length + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">On-time streak</div><div class="kpi-value" id="courier-page-streak">' + Math.floor(streak) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Van upgrade</div><div class="kpi-value" id="courier-page-vanup">L' + vanUpgradeLevel + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">XP</div><div class="kpi-value" id="courier-page-xp">' + xp.toFixed(0) + " / " + threshold.toFixed(0) + '</div><div class="progress mt-4"><div id="courier-page-xpbar" class="progress-fill teal" style="width:' + xpPct + '%"></div></div></div>');
      html.push('</div>');
  
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card card-wide courier-console">');
      html.push('<div class="card-title">Dispatch Console</div>');
      html.push('<div class="card-meta">Fleet ops + quick actions</div>');
      html.push('<div class="card-section">');
      html.push('<div class="dispatch-board dispatch-board-lg">');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-offers-count">' + offers.length + '</div><div class="dispatch-label">Offers</div></div>');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-orders-count">' + orders.length + '</div><div class="dispatch-label">Queued</div></div>');
      html.push('<div class="dispatch-col"><div class="dispatch-num" id="courier-active-count">' + runs.length + '</div><div class="dispatch-label">Active</div></div>');
      html.push('</div>');
      html.push('<div class="field-row small mt-8"><span>Delivered today</span><span id="courier-page-delivered-today">' + Math.floor(deliveredToday) + '</span></div>');
      html.push('<div class="field-row small"><span>Delivered yesterday</span><span id="courier-page-delivered-yesterday">' + Math.floor(deliveredYesterday) + '</span></div>');
      html.push('<div class="field-row small mt-4"><span>Dispatch policy</span><span><select id="courier-dispatch-policy" class="input-small"' + (!co.unlocked ? " disabled" : "") + '>' +
        '<option value="balanced"' + (policy === "balanced" ? " selected" : "") + '>Balanced</option>' +
        '<option value="profit"' + (policy === "profit" ? " selected" : "") + '>Profit first</option>' +
        '<option value="on_time"' + (policy === "on_time" ? " selected" : "") + '>On-time first</option>' +
        '</select></span></div>');
      html.push('</div>');
      html.push('<div class="card-section courier-actions">');
      html.push('<button class="btn btn-small btn-outline" id="btn-courier-buy-van"' + (!co.unlocked ? ' disabled' : '') + '>Buy van ($' + vanCost.toFixed(0) + ')</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-courier-hire-driver"' + (!co.unlocked ? ' disabled' : '') + '>Hire driver ($' + hireCost.toFixed(0) + ')</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-courier-hire-manager"' + (!co.unlocked || manager >= 1 ? ' disabled' : '') + '>Hire manager ($' + managerCost.toFixed(0) + ')</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-courier-upgrade-van"' + (!co.unlocked || (co.vans || 0) <= 0 || vanUpgradeLevel >= 10 ? ' disabled' : '') + '>Upgrade vans ($' + vanUpgradeCost.toFixed(0) + ')</button> ');
      html.push('<button class="btn btn-small btn-primary" id="btn-courier-dispatch"' + (!co.unlocked ? ' disabled' : '') + '>Dispatch now</button>');
      html.push('<div class="small dim mt-6">Van upgrade reduces delivery time. Current time multiplier: <span class="mono">' + vanSpeedMult.toFixed(2) + 'x</span></div>');
      html.push('<div class="small dim mt-6">Capacity is the smaller of vans and drivers. Rail Logistics reduces delivery time once unlocked.</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Business Funds</div>');
      html.push('<div class="card-meta">Deposit / withdraw</div>');
      html.push('<div class="card-section small company-control-grid">');
      html.push('<div class="company-control-row"><input id="courier-deposit" class="company-input" type="number" min="0" step="10" placeholder="Deposit amount"' + (!co.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-courier-deposit"' + (!co.unlocked ? " disabled" : "") + '>Deposit</button></div>');
      html.push('<div class="company-control-row mt-4"><input id="courier-withdraw" class="company-input" type="number" min="0" step="10" placeholder="Withdraw amount"' + (!co.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-courier-withdraw"' + (!co.unlocked ? " disabled" : "") + '>Withdraw</button></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Offers</div>');
      html.push('<div class="card-meta">Accept contracts, then dispatch</div>');
      html.push('<div class="card-section small company-list">');
      if (!offers.length) {
        html.push('<div class="small dim">No offers right now. New offers generate each day.</div>');
      } else {
        for (var i = 0; i < offers.length; i++) {
          var of = offers[i];
          if (!of) continue;
          html.push('<div class="company-list-item">');
          html.push('<div class="company-list-main">');
          var classDef = (Game.Companies && typeof Game.Companies.getCourierPackageClassDef === "function") ? Game.Companies.getCourierPackageClassDef(of.packageClass || "standard") : { name: "Standard" };
          html.push('<div class="company-list-title">' + of.from + ' \u2192 ' + of.to + '</div>');
          html.push('<div class="company-list-sub">' + (classDef.name || "Standard") + ' \u2022 Deadline D' + of.deadlineDay + ' \u2022 ' + (of.minutesRequired || 0) + ' min</div>');
          html.push('</div>');
          html.push('<div class="company-list-side">');
          html.push('<div class="mono">$' + (of.payout || 0).toFixed(0) + '</div>');
          html.push('<button class="btn btn-small btn-outline btn-courier-accept mt-4" data-offer="' + of.id + '"' + (!co.unlocked ? ' disabled' : '') + '>Accept</button>');
          html.push('</div>');
          html.push('</div>');
        }
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Queue</div>');
      html.push('<div class="card-meta">Contracts waiting for dispatch</div>');
      html.push('<div class="card-section small company-list">');
      if (!orders.length) {
        html.push('<div class="small dim">No queued deliveries.</div>');
      } else {
        for (var q = 0; q < orders.length; q++) {
          var o = orders[q];
          if (!o) continue;
          html.push('<div class="company-list-item">');
          html.push('<div class="company-list-main">');
          var classDef2 = (Game.Companies && typeof Game.Companies.getCourierPackageClassDef === "function") ? Game.Companies.getCourierPackageClassDef(o.packageClass || "standard") : { name: "Standard" };
          html.push('<div class="company-list-title">' + o.from + ' \u2192 ' + o.to + '</div>');
          html.push('<div class="company-list-sub">' + (classDef2.name || "Standard") + ' \u2022 Accepted D' + (o.acceptedDay || 1) + ' \u2022 Deadline D' + (o.deadlineDay || "-") + '</div>');
          html.push('</div>');
          html.push('<div class="company-list-side mono">$' + (o.payout || 0).toFixed(0) + '</div>');
          html.push('</div>');
        }
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Active Runs</div>');
      html.push('<div class="card-meta">Live ETAs</div>');
      html.push('<div class="card-section small company-list">');
      if (!runs.length) {
        html.push('<div class="small dim">No active deliveries. Dispatch from the console to start runs.</div>');
      } else {
        for (var r = 0; r < runs.length; r++) {
          var run = runs[r];
          if (!run) continue;
          var tot = run.totalMinutes || 1;
          var rem = run.remainingMinutes || 0;
          if (!(tot > 0)) tot = 1;
          var done = tot - rem;
          if (done < 0) done = 0;
          if (done > tot) done = tot;
          var pct = Math.floor((done / tot) * 100);
          if (pct < 0) pct = 0;
          if (pct > 100) pct = 100;
          var eta = Math.max(0, Math.ceil(rem));
          var hh = Math.floor(eta / 60);
          var mm = eta % 60;
          html.push('<div class="company-list-item">');
          html.push('<div class="company-list-main">');
          var classDef3 = (Game.Companies && typeof Game.Companies.getCourierPackageClassDef === "function") ? Game.Companies.getCourierPackageClassDef(run.packageClass || "standard") : { name: "Standard" };
          html.push('<div class="company-list-title">' + run.from + ' \u2192 ' + run.to + '</div>');
          html.push('<div class="company-list-sub">' + (classDef3.name || "Standard") + '</div>');
          html.push('<div class="progress mt-4"><div class="progress-fill teal courier-run-bar" data-run="' + run.id + '" style="width:' + pct + '%"></div></div>');
          html.push('</div>');
          html.push('<div class="company-list-side mono courier-run-eta" data-run="' + run.id + '">ETA ' + hh + ":" + (mm < 10 ? "0" + mm : mm) + '</div>');
          html.push('</div>');
        }
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="btn-courier-back">Back to companies</button></div>');
      html.push('</div>');
      return html.join("");
    },
    showCourierPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderCourierPage();
      UI.bindCourierPageEvents();
    },
    bindCourierPageEvents: function () {
      var backBtn = document.getElementById("btn-courier-back");
      if (backBtn) backBtn.addEventListener("click", function () { UI.renderCurrentTab(); });
  
      var depBtn = document.getElementById("btn-courier-deposit");
      if (depBtn) depBtn.addEventListener("click", function () {
        var input = document.getElementById("courier-deposit");
        var val = input ? parseFloat(input.value) : 0;
        if (Game.Companies && Game.Companies.depositCourierFunds) Game.Companies.depositCourierFunds(val);
        UI.showCourierPage();
      });
      var witBtn = document.getElementById("btn-courier-withdraw");
      if (witBtn) witBtn.addEventListener("click", function () {
        var input2 = document.getElementById("courier-withdraw");
        var val2 = input2 ? parseFloat(input2.value) : 0;
        if (Game.Companies && Game.Companies.withdrawCourierFunds) Game.Companies.withdrawCourierFunds(val2);
        UI.showCourierPage();
      });
      var vanBtn = document.getElementById("btn-courier-buy-van");
      if (vanBtn) vanBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyCourierVan) Game.Companies.buyCourierVan();
        UI.showCourierPage();
      });
      var hireBtn = document.getElementById("btn-courier-hire-driver");
      if (hireBtn) hireBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.hireCourierDriver) Game.Companies.hireCourierDriver();
        UI.showCourierPage();
      });
      var mgrBtn = document.getElementById("btn-courier-hire-manager");
      if (mgrBtn) mgrBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.hireCourierManager) Game.Companies.hireCourierManager();
        UI.showCourierPage();
      });
      var vanUpBtn = document.getElementById("btn-courier-upgrade-van");
      if (vanUpBtn) vanUpBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.upgradeCourierVans) Game.Companies.upgradeCourierVans();
        UI.showCourierPage();
      });
      var dispatchBtn = document.getElementById("btn-courier-dispatch");
      if (dispatchBtn) dispatchBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.dispatchCourierDeliveriesNow) Game.Companies.dispatchCourierDeliveriesNow();
        UI.showCourierPage();
      });
      var acceptBtns = document.querySelectorAll(".btn-courier-accept");
      for (var i = 0; i < acceptBtns.length; i++) {
        acceptBtns[i].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-offer");
          if (Game.Companies && Game.Companies.acceptCourierOffer) Game.Companies.acceptCourierOffer(id);
          UI.showCourierPage();
        });
      }
      var policySelect = document.getElementById("courier-dispatch-policy");
      if (policySelect) {
        policySelect.addEventListener("change", function () {
          var v = policySelect.value || "balanced";
          Game.state.companies.courierCo.dispatchPolicy = v;
          UI.showCourierPage();
        });
      }
    },
    renderRecyclingPage: function () {
      if (Game.Companies && typeof Game.Companies.ensureRecyclingState === "function") Game.Companies.ensureRecyclingState();
      var rc = Game.state.companies.recyclingCo;
      var eduLevel = (Game.state.education && typeof Game.state.education.level === "number" && isFinite(Game.state.education.level)) ? Math.floor(Game.state.education.level) : 0;
      var gStats = (Game.state.stats && typeof Game.state.stats === "object") ? Game.state.stats : {};
      var techSkill = (typeof gStats.techSkill === "number" && isFinite(gStats.techSkill)) ? Math.floor(gStats.techSkill) : 0;
      var stats = rc.stats || { processedTodayKg: 0, processedYesterdayKg: 0 };
      var materials = rc.materials || { plasticKg: 0, copperKg: 0, rareKg: 0 };
      var contamination = (typeof rc.contaminationPct === "number" && isFinite(rc.contaminationPct)) ? rc.contaminationPct : 0;
      if (contamination < 0) contamination = 0;
      if (contamination > 0.3) contamination = 0.3;
  
      var threshold = 400 + (rc.level || 0) * 300;
      if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 400;
      var xp = (typeof rc.xp === "number" && isFinite(rc.xp) && rc.xp > 0) ? rc.xp : 0;
      var xpPct = threshold > 0 ? Math.floor((xp / threshold) * 100) : 0;
      if (xpPct < 0) xpPct = 0;
      if (xpPct > 100) xpPct = 100;
  
      var machCost = (Game.Companies && typeof Game.Companies.getRecyclingMachineCost === "function") ? Game.Companies.getRecyclingMachineCost() : 0;
      var hireCost = (Game.Companies && typeof Game.Companies.getRecyclingHireCost === "function") ? Game.Companies.getRecyclingHireCost() : 0;
      if (typeof machCost !== "number" || !isFinite(machCost) || machCost < 0) machCost = 0;
      if (typeof hireCost !== "number" || !isFinite(hireCost) || hireCost < 0) hireCost = 0;
  
      var overhead = (rc.staff || 0) * 25 + (rc.machines || 0) * 6 + 8;
      if (typeof overhead !== "number" || !isFinite(overhead) || overhead < 0) overhead = 0;
  
      var hasBatch = !!rc.activeBatch;
      var batchPct = 0;
      var batchLabel = "Idle";
      if (hasBatch) {
        var tot = rc.activeBatch.totalMinutes || 1;
        var rem = rc.activeBatch.remainingMinutes || 0;
        if (!(tot > 0)) tot = 1;
        var done = tot - rem;
        if (done < 0) done = 0;
        if (done > tot) done = tot;
        batchPct = Math.floor((done / tot) * 100);
        if (batchPct < 0) batchPct = 0;
        if (batchPct > 100) batchPct = 100;
        var eta = Math.max(0, Math.ceil(rem));
        var hh = Math.floor(eta / 60);
        var mm = eta % 60;
        var kg = (typeof rc.activeBatch.kg === "number" && isFinite(rc.activeBatch.kg)) ? rc.activeBatch.kg : 0;
        batchLabel = (kg ? (kg.toFixed(0) + " kg") : "Batch") + " â€¢ ETA " + hh + ":" + (mm < 10 ? "0" + mm : mm);
      }
  
      var html = [];
      html.push('<div id="recycling-page" class="company-page company-page-recycle">');
  
      html.push('<div class="card company-hero company-recycle">');
      html.push('<div class="company-head">');
      html.push('<div class="company-title-row">');
      html.push('<div class="company-icon company-icon-recycle" title="E-waste Recycling">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.5 4.5 6 2h6l-2 3.5H8.7c-.4 0-.8.2-1 .6l-1.7 3-.9-1.6c-.2-.3-.2-.7 0-1L7.5 4.5M18 22h-6l2-3.5h1.3c.4 0 .8-.2 1-.6l1.7-3 .9 1.6c.2.3.2.7 0 1L18 22M6.9 20.4 5.5 22l-3-5.2 4-.2.6 1.1c.2.3.5.5.9.5h3.5l-.9 1.6c-.2.3-.5.5-.9.5H6.9m11.6-9.9h3.8l-3 5.2-2-3.5.6-1.1c.2-.3.2-.7 0-1l-1.7-3h1.8c.4 0 .8.2 1 .6l.5.8M12 6.8l1-1.6 2.7 4.8-1 .6-2.7-4.8m-1 10.4-1 1.6-2.7-4.8 1-.6 2.7 4.8"/></svg>' +
        '</div>');
      html.push('<div>');
      html.push('<div class="section-title">E-waste Recycling</div>');
      html.push('<div class="section-subtitle company-subtitle">Purchase scrap and run batches. Machines + staff increase processing speed.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="company-badges">');
      html.push('<span class="badge ' + (rc.unlocked ? "badge-green" : "badge-red") + '">' + (rc.unlocked ? "Unlocked" : "Locked") + '</span>');
      html.push('<span class="badge badge-blue">L<span id="recycle-page-level">' + (rc.level || 0) + '</span></span>');
      html.push('</div>');
      html.push('</div>');
      if (!rc.unlocked) {
        html.push('<div class="notice">Unlock requirement: Education level 1 (you: ' + eduLevel + ') and Tech skill 15 (you: ' + techSkill + ').</div>');
      }
      html.push('</div>');
  
      html.push('<div class="company-kpis company-kpis-wide mt-8">');
      html.push('<div class="kpi"><div class="kpi-label">Business funds</div><div class="kpi-value" id="recycle-page-funds">$' + (rc.funds || 0).toFixed(2) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Scrap inventory</div><div class="kpi-value" id="recycle-page-scrap">' + (rc.scrapKg || 0).toFixed(0) + ' kg</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Machines / Staff</div><div class="kpi-value" id="recycle-page-team">' + (rc.machines || 0) + " / " + (rc.staff || 0) + '</div></div>');
      html.push('<div class="kpi"><div class="kpi-label">Overhead / day</div><div class="kpi-value">$<span id="recycle-page-overhead">' + overhead.toFixed(0) + '</span></div></div>');
      html.push('<div class="kpi"><div class="kpi-label">XP</div><div class="kpi-value" id="recycle-page-xp">' + xp.toFixed(0) + " / " + threshold.toFixed(0) + '</div><div class="progress mt-4"><div id="recycle-page-xpbar" class="progress-fill green" style="width:' + xpPct + '%"></div></div></div>');
      html.push('</div>');
  
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card card-wide recycle-console">');
      html.push('<div class="card-title">Processing Line</div>');
      html.push('<div class="card-meta">Batch status + controls</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row small"><span id="recycle-page-batch-label">' + batchLabel + '</span><span>' + (hasBatch ? '<span class="badge badge-green">RUNNING</span>' : '<span class="badge">IDLE</span>') + '</span></div>');
      html.push('<div class="progress mt-4"><div id="recycle-batch-bar" class="progress-fill green" style="width:' + batchPct + '%"></div></div>');
      html.push('<div class="field-row mt-8"><span>Batch type</span><span><select id="recycle-batch-type" class="input-small"' + (!rc.unlocked ? " disabled" : "") + (hasBatch ? " disabled" : "") + '>');
      for (var bt = 0; bt < batchDefs.length; bt++) {
        var def = batchDefs[bt];
        if (!def) continue;
        var locked = (rc.level || 0) < (def.minLevel || 0);
        html.push('<option value="' + def.id + '"' + (def.id === batchType ? " selected" : "") + (locked ? " disabled" : "") + '>' + def.name + (locked ? " (L" + def.minLevel + "+)" : "") + '</option>');
      }
      html.push('</select></span></div>');
      html.push('<div class="field-row mt-4"><span>Start batch (kg)</span><span><input id="recycle-batch-kg" class="input-small" type="number" min="50" step="50" value="200"' + (!rc.unlocked ? " disabled" : "") + (hasBatch ? " disabled" : "") + '><button class="btn btn-small btn-primary" id="btn-recycle-start"' + (!rc.unlocked ? ' disabled' : '') + (hasBatch ? ' disabled' : '') + '>Start</button></span></div>');
      html.push('<div class="field-row small mt-4"><span>Contamination</span><span class="mono">' + (contamination * 100).toFixed(1) + '%</span></div>');
      html.push('<div class="small dim mt-6">Requires at least 1 machine and 1 staff. Optional tie-in: recovered metals slightly increase Mining Corp ore stock.</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Business Funds</div>');
      html.push('<div class="card-meta">Deposit / withdraw</div>');
      html.push('<div class="card-section small company-control-grid">');
      html.push('<div class="company-control-row"><input id="recycle-deposit" class="company-input" type="number" min="0" step="10" placeholder="Deposit amount"' + (!rc.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-recycle-deposit"' + (!rc.unlocked ? " disabled" : "") + '>Deposit</button></div>');
      html.push('<div class="company-control-row mt-4"><input id="recycle-withdraw" class="company-input" type="number" min="0" step="10" placeholder="Withdraw amount"' + (!rc.unlocked ? " disabled" : "") + '><button class="btn btn-small btn-outline" id="btn-recycle-withdraw"' + (!rc.unlocked ? " disabled" : "") + '>Withdraw</button></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Equipment & Staff</div>');
      html.push('<div class="card-meta">Scale throughput</div>');
      html.push('<div class="card-section">');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-buy-machine"' + (!rc.unlocked ? ' disabled' : '') + '>Buy machine ($' + machCost.toFixed(0) + ')</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-hire"' + (!rc.unlocked ? ' disabled' : '') + '>Hire staff ($' + hireCost.toFixed(0) + ')</button>');
      html.push('<div class="small dim mt-6">Daily overhead scales with machines and staff.</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Buy Scrap</div>');
      html.push('<div class="card-meta">Inventory for batches</div>');
      html.push('<div class="card-section">');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-buy-scrap-small"' + (!rc.unlocked ? ' disabled' : '') + '>200kg</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-buy-scrap-med"' + (!rc.unlocked ? ' disabled' : '') + '>600kg</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-recycle-buy-scrap-large"' + (!rc.unlocked ? ' disabled' : '') + '>1200kg</button>');
      html.push('<div class="small dim mt-6">Purchased scrap becomes inventory, then converts to funds after processing.</div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Recovered Materials</div>');
      html.push('<div class="card-meta">Sell refined outputs</div>');
      html.push('<div class="card-section small">');
      html.push('<div class="field-row"><span>Plastic</span><span>' + (materials.plasticKg || 0).toFixed(0) + ' kg</span></div>');
      html.push('<div class="field-row"><span>Copper</span><span>' + (materials.copperKg || 0).toFixed(1) + ' kg</span></div>');
      html.push('<div class="field-row"><span>Rare metals</span><span>' + (materials.rareKg || 0).toFixed(2) + ' kg</span></div>');
      html.push('<button class="btn btn-small btn-outline mt-6" id="btn-recycle-sell-materials"' + (!rc.unlocked ? " disabled" : "") + '>Sell materials</button>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Suppliers</div>');
      html.push('<div class="card-meta">Daily scrap deliveries</div>');
      html.push('<div class="card-section small company-list">');
      var supplierDefs = (Game.Companies && Array.isArray(Game.Companies.recyclingSupplierCatalog)) ? Game.Companies.recyclingSupplierCatalog : [];
      var activeSuppliers = Array.isArray(rc.suppliers) ? rc.suppliers : [];
      var activeMap = {};
      for (var s = 0; s < activeSuppliers.length; s++) {
        if (activeSuppliers[s] && activeSuppliers[s].id) activeMap[activeSuppliers[s].id] = true;
      }
      if (!supplierDefs.length) {
        html.push('<div class="small dim">No suppliers available.</div>');
      } else {
        for (var s2 = 0; s2 < supplierDefs.length; s2++) {
          var sup = supplierDefs[s2];
          if (!sup) continue;
          var locked2 = (rc.level || 0) < (sup.minLevel || 0);
          var active = !!activeMap[sup.id];
          html.push('<div class="company-list-item">');
          html.push('<div class="company-list-main">');
          html.push('<div class="company-list-title">' + sup.name + '</div>');
          html.push('<div class="company-list-sub">' + sup.kgPerDay + ' kg/day â€¢ $' + sup.costPerDay + '/day â€¢ Quality ' + (sup.quality || 1).toFixed(2) + '</div>');
          html.push('</div>');
          html.push('<div class="company-list-side">');
          if (active) {
            html.push('<button class="btn btn-small btn-outline btn-recycle-supplier-remove" data-supplier="' + sup.id + '">Cancel</button>');
          } else {
            html.push('<button class="btn btn-small btn-primary btn-recycle-supplier-add" data-supplier="' + sup.id + '"' + (locked2 || !rc.unlocked ? ' disabled' : '') + '>' + (locked2 ? "Locked" : "Sign") + '</button>');
          }
          html.push('</div>');
          html.push('</div>');
        }
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Performance</div>');
      html.push('<div class="card-meta">Daily throughput</div>');
      html.push('<div class="card-section small">');
      html.push('<div class="field-row"><span>Today processed</span><span id="recycle-page-today">' + (stats.processedTodayKg || 0).toFixed(0) + ' kg</span></div>');
      html.push('<div class="field-row mt-4"><span>Yesterday processed</span><span id="recycle-page-yesterday">' + (stats.processedYesterdayKg || 0).toFixed(0) + ' kg</span></div>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('</div>');
      html.push('<div class="mt-8"><button class="btn btn-small btn-outline" id="btn-recycle-back">Back to companies</button></div>');
      html.push('</div>');
      return html.join("");
    },
    showRecyclingPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderRecyclingPage();
      UI.bindRecyclingPageEvents();
    },
    bindRecyclingPageEvents: function () {
      var backBtn = document.getElementById("btn-recycle-back");
      if (backBtn) backBtn.addEventListener("click", function () { UI.renderCurrentTab(); });
  
      var depBtn = document.getElementById("btn-recycle-deposit");
      if (depBtn) depBtn.addEventListener("click", function () {
        var input = document.getElementById("recycle-deposit");
        var val = input ? parseFloat(input.value) : 0;
        if (Game.Companies && Game.Companies.depositRecyclingFunds) Game.Companies.depositRecyclingFunds(val);
        UI.showRecyclingPage();
      });
      var witBtn = document.getElementById("btn-recycle-withdraw");
      if (witBtn) witBtn.addEventListener("click", function () {
        var input2 = document.getElementById("recycle-withdraw");
        var val2 = input2 ? parseFloat(input2.value) : 0;
        if (Game.Companies && Game.Companies.withdrawRecyclingFunds) Game.Companies.withdrawRecyclingFunds(val2);
        UI.showRecyclingPage();
      });
      var machBtn = document.getElementById("btn-recycle-buy-machine");
      if (machBtn) machBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyRecyclingMachine) Game.Companies.buyRecyclingMachine();
        UI.showRecyclingPage();
      });
      var hireBtn = document.getElementById("btn-recycle-hire");
      if (hireBtn) hireBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.hireRecyclingStaff) Game.Companies.hireRecyclingStaff();
        UI.showRecyclingPage();
      });
      var buySmallBtn = document.getElementById("btn-recycle-buy-scrap-small");
      if (buySmallBtn) buySmallBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyRecyclingScrapPack) Game.Companies.buyRecyclingScrapPack("small");
        UI.showRecyclingPage();
      });
      var buyMedBtn = document.getElementById("btn-recycle-buy-scrap-med");
      if (buyMedBtn) buyMedBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyRecyclingScrapPack) Game.Companies.buyRecyclingScrapPack("medium");
        UI.showRecyclingPage();
      });
      var buyLargeBtn = document.getElementById("btn-recycle-buy-scrap-large");
      if (buyLargeBtn) buyLargeBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.buyRecyclingScrapPack) Game.Companies.buyRecyclingScrapPack("large");
        UI.showRecyclingPage();
      });
      var startBtn = document.getElementById("btn-recycle-start");
      if (startBtn) startBtn.addEventListener("click", function () {
        var input3 = document.getElementById("recycle-batch-kg");
        var val3 = input3 ? parseFloat(input3.value) : 0;
        var typeSel = document.getElementById("recycle-batch-type");
        var typeVal = typeSel ? typeSel.value : "mixed";
        if (Game.Companies && Game.Companies.startRecyclingBatch) Game.Companies.startRecyclingBatch(val3, typeVal);
        UI.showRecyclingPage();
      });
      var sellBtn = document.getElementById("btn-recycle-sell-materials");
      if (sellBtn) sellBtn.addEventListener("click", function () {
        if (Game.Companies && Game.Companies.sellRecyclingMaterials) Game.Companies.sellRecyclingMaterials();
        UI.showRecyclingPage();
      });
      var addSupBtns = document.querySelectorAll(".btn-recycle-supplier-add");
      for (var i = 0; i < addSupBtns.length; i++) {
        addSupBtns[i].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-supplier");
          if (Game.Companies && Game.Companies.addRecyclingSupplier) Game.Companies.addRecyclingSupplier(id);
          UI.showRecyclingPage();
        });
      }
      var remSupBtns = document.querySelectorAll(".btn-recycle-supplier-remove");
      for (var j = 0; j < remSupBtns.length; j++) {
        remSupBtns[j].addEventListener("click", function (e) {
          var id2 = e.target.getAttribute("data-supplier");
          if (Game.Companies && Game.Companies.removeRecyclingSupplier) Game.Companies.removeRecyclingSupplier(id2);
          UI.showRecyclingPage();
        });
      }
    },
    showRailLogisticsPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderRailLogisticsPage();
      UI.bindRailLogisticsPageEvents();
    },
    bindRailLogisticsPageEvents: function () {
      var backBtn = document.getElementById("btn-rail-back");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          UI.renderCurrentTab();
        });
      }
      var hireDispBtn = document.getElementById("btn-rail-hire-dispatcher");
      if (hireDispBtn) {
        hireDispBtn.addEventListener("click", function () {
          Game.Companies.hireRailDispatcher();
          UI.showRailLogisticsPage();
        });
      }
      var hireMaintBtn = document.getElementById("btn-rail-hire-maintenance");
      if (hireMaintBtn) {
        hireMaintBtn.addEventListener("click", function () {
          if (Game.Companies && Game.Companies.hireRailMaintenanceStaff) {
            Game.Companies.hireRailMaintenanceStaff();
          }
          UI.showRailLogisticsPage();
        });
      }
  
      function goodsForCarriageType(type) {
        var def = (Game.Companies && typeof Game.Companies.getRailCarriageDef === "function") ? Game.Companies.getRailCarriageDef(type) : null;
        var classes = def && Array.isArray(def.cargoClasses) ? def.cargoClasses : ["general"];
        var out = [];
        var supplies = (Game.Companies && Array.isArray(Game.Companies.railSupplyCatalog)) ? Game.Companies.railSupplyCatalog : [];
        for (var i = 0; i < supplies.length; i++) {
          var s = supplies[i];
          if (!s) continue;
          if (classes.indexOf(s.cargoClass || "general") !== -1) out.push(s.name || s.id);
        }
        return out;
      }
  
      function openWarehousesModal() {
        var r2 = Game.state.companies.railLogistics;
        var wh = r2.warehouses || {};
        var locKeys = Object.keys(wh).sort();
        var body = [];
        body.push('<div class="modal-card-body">');
        body.push('<div class="small dim">Warehouse staff produce supplies daily. You need staff at both ends for contracts.</div>');
        if (!locKeys.length) {
          body.push('<div class="small dim mt-6">No warehouses initialized yet.</div>');
        } else {
          body.push('<div class="table-scroll mt-6"><table class="table"><thead><tr><th>Location</th><th>Staff</th><th>Used/Cap</th><th>Coal</th><th>Steel</th><th>Lumber</th><th>Grain</th><th>Medical</th><th>Fuel</th><th>Chem</th><th>Expl</th><th></th></tr></thead><tbody>');
          for (var i = 0; i < locKeys.length; i++) {
            var loc = locKeys[i];
            var w = wh[loc];
            if (!w || !w.inventory) continue;
            var inv = w.inventory;
            var used = 0;
            used += inv.coal || 0;
            used += inv.steel || 0;
            used += inv.lumber || 0;
            used += inv.grain || 0;
            used += inv.medical || 0;
            used += inv.fuel || 0;
            used += inv.chemicals || 0;
            used += inv.explosives || 0;
            body.push("<tr>");
            body.push("<td>" + loc + "</td>");
            body.push('<td class="mono">' + (w.staff || 0) + "</td>");
            body.push('<td class="mono">' + used.toFixed(0) + "/" + (w.capacity || 0) + "</td>");
            body.push('<td class="mono">' + (inv.coal || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.steel || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.lumber || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.grain || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.medical || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.fuel || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.chemicals || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">' + (inv.explosives || 0).toFixed(0) + "</td>");
            body.push('<td><button class="btn btn-small btn-outline btn-rail-hire-warehouse" data-loc="' + loc + '">Hire staff</button></td>');
            body.push("</tr>");
          }
          body.push("</tbody></table></div>");
        }
        body.push("</div>");
        var overlay = UI.openModalCard({ title: "Warehouses", sub: "Inventory & staffing", bodyHtml: body.join(""), large: true });
        if (!overlay) return;
        overlay.addEventListener("click", function (e) {
          var btn = e.target.closest(".btn-rail-hire-warehouse");
          if (!btn) return;
          var loc = btn.getAttribute("data-loc");
          Game.Companies.hireRailWarehouseStaff(loc);
          overlay._closeModal();
          UI.showRailLogisticsPage();
          openWarehousesModal();
        });
      }
  
      function openTracksModal() {
        var r2 = Game.state.companies.railLogistics;
        var tracks = r2.tracks || {};
        var keys = Object.keys(tracks).sort();
        var body = [];
        body.push('<div class="modal-card-body">');
        var avgCond = (Game.Companies && typeof Game.Companies.getRailTrackAverageCondition === "function") ? Game.Companies.getRailTrackAverageCondition() : 100;
        var maint = (r2.staff && typeof r2.staff.maintenance === "number" && isFinite(r2.staff.maintenance)) ? r2.staff.maintenance : 0;
        body.push('<div class="small dim">Track condition affects travel speed. Maintenance crews restore wear each day.</div>');
        body.push('<div class="field-row small mt-4"><span>Maintenance crew</span><span class="mono">' + maint + '</span></div>');
        body.push('<div class="field-row small"><span>Average condition</span><span class="mono">' + avgCond.toFixed(0) + '%</span></div>');
        if (!keys.length) {
          body.push('<div class="small dim mt-6">No trails tracked yet.</div>');
        } else {
          body.push('<div class="table-scroll mt-6"><table class="table"><thead><tr><th>Trail</th><th>Condition</th><th>Repair</th></tr></thead><tbody>');
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var tr = tracks[k];
            var cond = tr && typeof tr.condition === "number" ? tr.condition : 0;
            var cost = (Game.Companies && typeof Game.Companies.getRailTrackRepairCost === "function") ? Game.Companies.getRailTrackRepairCost(k, 100) : 0;
            var canRepair = cond < 100 && cost > 0;
            body.push("<tr>");
            body.push("<td>" + k + "</td>");
            body.push('<td class="mono">' + cond.toFixed(0) + "%</td>");
            if (canRepair) {
              body.push('<td><button class="btn btn-small btn-outline btn-rail-repair-track" data-track="' + k + '">Repair ($' + cost.toFixed(0) + ")</button></td>");
            } else {
              body.push('<td class="small dim">OK</td>');
            }
            body.push("</tr>");
          }
          body.push("</tbody></table></div>");
        }
        body.push("</div>");
        var overlay = UI.openModalCard({ title: "Track Condition", sub: "Trails & wear", bodyHtml: body.join(""), large: true });
        if (!overlay) return;
        overlay.addEventListener("click", function (e) {
          var btn = e.target.closest(".btn-rail-repair-track");
          if (!btn) return;
          var key = btn.getAttribute("data-track");
          if (!key) return;
          if (Game.Companies && Game.Companies.repairRailTrack) {
            Game.Companies.repairRailTrack(key, 100);
          }
          overlay._closeModal();
          UI.showRailLogisticsPage();
          openTracksModal();
        });
      }
  
      function openOrdersModal() {
        var r2 = Game.state.companies.railLogistics;
        var orders = Array.isArray(r2.orders) ? r2.orders : [];
        var body = [];
        body.push('<div class="modal-card-body">');
        body.push('<div class="small dim">Contracts are obtained automatically and will dispatch when a suitable train and staff are available.</div>');
        if (!orders.length) {
          body.push('<div class="small dim mt-6">No contracts available. Check back tomorrow.</div>');
        } else {
          body.push('<div class="table-scroll mt-6"><table class="table"><thead><tr><th>ID</th><th>From</th><th>To</th><th>Item</th><th>Class</th><th>Units</th><th>Payout</th><th>Deadline</th></tr></thead><tbody>');
          for (var i = 0; i < orders.length; i++) {
            var ord = orders[i];
            if (!ord) continue;
            var sd0 = (Game.Companies && typeof Game.Companies.getRailSupplyDef === "function") ? Game.Companies.getRailSupplyDef(ord.item) : null;
            var itemLabel = sd0 && sd0.name ? sd0.name : ord.item;
            var classLabel = ord.cargoClass || (sd0 && sd0.cargoClass) || "general";
            body.push("<tr>");
            body.push('<td class="mono">' + ord.id + "</td>");
            body.push("<td>" + ord.from + "</td>");
            body.push("<td>" + ord.to + "</td>");
            body.push("<td>" + itemLabel + "</td>");
            body.push('<td class="mono">' + classLabel + "</td>");
            body.push('<td class="mono">' + (ord.units || 0) + "</td>");
            body.push('<td class="mono">$' + (ord.payout || 0).toFixed(0) + "</td>");
            body.push('<td class="mono">Day ' + (ord.deadlineDay || 0) + "</td>");
            body.push("</tr>");
          }
          body.push("</tbody></table></div>");
        }
        body.push("</div>");
        UI.openModalCard({ title: "Contracts", sub: "Available delivery opportunities", bodyHtml: body.join(""), large: true });
      }
  
      function openTrainManageModal(trainId) {
        var train = (Game.Companies && typeof Game.Companies.getTrainById === "function") ? Game.Companies.getTrainById(trainId) : null;
        if (!train) return;
        var locoDef = (Game.Companies && typeof Game.Companies.getRailLocomotiveDef === "function") ? Game.Companies.getRailLocomotiveDef(train.loco) : null;
        var emptyWt = (Game.Companies && typeof Game.Companies.getTrainEmptyWeightTons === "function") ? Game.Companies.getTrainEmptyWeightTons(train) : 0;
        var maxSpeed = (Game.Companies && typeof Game.Companies.getTrainProjectedSpeedKmh === "function") ? Game.Companies.getTrainProjectedSpeedKmh(train, 0) : 0;
  
        var body = [];
        body.push('<div class="modal-card-body">');
        body.push('<div class="field-row"><span>Locomotive</span><span>' + (locoDef ? locoDef.name : "Freight Locomotive") + "</span></div>");
        body.push('<div class="field-row"><span>Max speed (proj.)</span><span class="mono">' + (maxSpeed ? (maxSpeed + " km/h") : "-") + "</span></div>");
        body.push('<div class="field-row"><span>Empty weight</span><span class="mono">' + (emptyWt ? (emptyWt.toFixed(1) + " t") : "-") + "</span></div>");
        body.push('<div class="mt-6 small dim">Carriages</div>');
        if (Array.isArray(train.carriages) && train.carriages.length) {
          body.push('<div class="table-scroll mt-4"><table class="table"><thead><tr><th>Type</th><th>Carries</th><th>Empty</th><th>Max load</th><th>Capacity</th></tr></thead><tbody>');
          for (var i = 0; i < train.carriages.length; i++) {
            var car = train.carriages[i];
            if (!car) continue;
            var def = (Game.Companies && typeof Game.Companies.getRailCarriageDef === "function") ? Game.Companies.getRailCarriageDef(car.type) : null;
            var goods = goodsForCarriageType(car.type);
            body.push("<tr>");
            body.push("<td>" + (def ? def.name : car.type) + "</td>");
            body.push("<td>" + (goods.length ? goods.join(", ") : "-") + "</td>");
            body.push('<td class="mono">' + ((def && def.emptyWeightTons) ? (def.emptyWeightTons.toFixed(0) + " t") : "-") + "</td>");
            body.push('<td class="mono">' + ((def && def.maxLoadTons) ? (def.maxLoadTons.toFixed(0) + " t") : "-") + "</td>");
            body.push('<td class="mono">' + ((def && def.capacity) ? (def.capacity.toFixed(0) + " units") : "-") + "</td>");
            body.push("</tr>");
          }
          body.push("</tbody></table></div>");
        } else {
          body.push('<div class="small dim mt-4">No carriages installed.</div>');
        }
  
        var carDefs = (Game.Companies && Array.isArray(Game.Companies.railCarriageCatalog)) ? Game.Companies.railCarriageCatalog : [];
        if (carDefs.length) {
          body.push('<div class="mt-6 small dim">Buy carriage</div>');
          body.push('<div class="bank-control-group mt-4"><select id="rail-buy-carriage-type" class="bank-input">');
          for (var c = 0; c < carDefs.length; c++) {
            var cdef = carDefs[c];
            if (!cdef) continue;
            body.push('<option value="' + cdef.id + '">' + cdef.name + " ($" + (cdef.cost || 0).toFixed(0) + ")</option>");
          }
          body.push('</select><button class="btn btn-small btn-outline" id="btn-rail-buy-carriage">Buy</button></div>');
        }
        body.push("</div>");
  
        var overlay = UI.openModalCard({ title: "Manage Train", sub: train.name || train.id, bodyHtml: body.join(""), large: true });
        if (!overlay) return;
        var buyBtn = overlay.querySelector("#btn-rail-buy-carriage");
        if (buyBtn) {
          buyBtn.addEventListener("click", function () {
            var sel = overlay.querySelector("#rail-buy-carriage-type");
            var type = sel ? sel.value : null;
            Game.Companies.buyRailCarriage(train.id, type);
            overlay._closeModal();
            UI.showRailLogisticsPage();
            openTrainManageModal(train.id);
          });
        }
      }
  
      function openBuyTrainModal() {
        var r2 = Game.state.companies.railLogistics;
        var locoDef = (Game.Companies && typeof Game.Companies.getRailLocomotiveDef === "function") ? Game.Companies.getRailLocomotiveDef("freight") : { baseCost: 2200, costPerOwned: 800, weightTons: 95, maxSpeedKmh: 120 };
        var carDefs = (Game.Companies && Array.isArray(Game.Companies.railCarriageCatalog)) ? Game.Companies.railCarriageCatalog : [];
        if (!carDefs.length) return;
  
        var body = [];
        body.push('<div class="modal-card-body">');
        body.push('<div class="small dim">Choose the carriage type and how many come with the train.</div>');
        body.push('<div class="field-row small mt-6"><span>Carriage type</span><span><select id="rail-buy-train-carriage" class="bank-input">');
        for (var i = 0; i < carDefs.length; i++) {
          var cdef = carDefs[i];
          if (!cdef) continue;
          body.push('<option value="' + cdef.id + '">' + cdef.name + "</option>");
        }
        body.push("</select></span></div>");
        body.push('<div class="field-row small mt-4"><span>Carriages</span><span><input id="rail-buy-train-count" class="bank-input" type="number" min="1" max="12" step="1" value="1"></span></div>');
        body.push('<div class="mt-6" id="rail-train-purchase-summary"></div>');
        body.push("</div>");
  
        var overlay = UI.openModalCard({
          title: "Buy Train",
          sub: "Confirm configuration",
          bodyHtml: body.join(""),
          actions: [
            { id: "cancel", label: "Cancel", primary: false },
            { id: "buy", label: "Buy train", primary: true }
          ],
          large: true,
          onAction: function (actionId, close, ov) {
            if (actionId === "cancel") {
              close();
              return;
            }
            if (actionId === "buy") {
              var type = ov.querySelector("#rail-buy-train-carriage").value;
              var count = parseFloat(ov.querySelector("#rail-buy-train-count").value);
              var ok = Game.Companies.buyRailTrainCustom(type, count);
              if (ok) {
                close();
                UI.showRailLogisticsPage();
              }
            }
          }
        });
        if (!overlay) return;
  
        function renderSummary() {
          var type = overlay.querySelector("#rail-buy-train-carriage").value;
          var count = parseFloat(overlay.querySelector("#rail-buy-train-count").value);
          if (!isFinite(count) || count <= 0) count = 1;
          count = Math.max(1, Math.min(12, Math.floor(count)));
          var def = (Game.Companies && typeof Game.Companies.getRailCarriageDef === "function") ? Game.Companies.getRailCarriageDef(type) : null;
          var goods = goodsForCarriageType(type);
          var owned = (r2.fleet && r2.fleet.length) ? r2.fleet.length : 0;
          var locoCost = (locoDef.baseCost || 2200) + owned * (locoDef.costPerOwned || 800);
          var carCost = (def && def.cost) ? def.cost : 0;
          var totalCost = locoCost + carCost * count;
          var perEmpty = (def && def.emptyWeightTons) ? def.emptyWeightTons : 0;
          var perLoad = (def && def.maxLoadTons) ? def.maxLoadTons : 0;
          var emptyWeight = (locoDef.weightTons || 95) + perEmpty * count;
          var maxLoad = perLoad * count;
          var dummyTrain = { loco: "freight", carriages: [] };
          for (var i = 0; i < count; i++) dummyTrain.carriages.push({ type: type });
          var speedEmpty = (Game.Companies && typeof Game.Companies.getTrainProjectedSpeedKmh === "function") ? Game.Companies.getTrainProjectedSpeedKmh(dummyTrain, 0) : 0;
          var speedLoaded = (Game.Companies && typeof Game.Companies.getTrainProjectedSpeedKmh === "function") ? Game.Companies.getTrainProjectedSpeedKmh(dummyTrain, maxLoad) : 0;
          var carries = goods.length ? goods.join(", ") : "-";
  
          var html = [];
          html.push('<div class="card" style="margin:0;">');
          html.push('<div class="card-section">');
          html.push('<div class="field-row"><span>Total cost</span><span class="mono">$' + totalCost.toFixed(0) + "</span></div>");
          html.push('<div class="field-row"><span>Carriages</span><span class="mono">' + count + "</span></div>");
          html.push('<div class="field-row"><span>Carries</span><span>' + carries + "</span></div>");
          html.push('<div class="field-row"><span>Weight (empty)</span><span class="mono">' + emptyWeight.toFixed(0) + " t</span></div>");
          html.push('<div class="field-row"><span>Max load</span><span class="mono">' + maxLoad.toFixed(0) + " t</span></div>");
          html.push('<div class="field-row"><span>Projected speed</span><span class="mono">' + (speedEmpty ? (speedEmpty + " km/h empty") : "-") + (speedLoaded ? (" â€¢ " + speedLoaded + " km/h loaded") : "") + "</span></div>");
          html.push("</div></div>");
          var el = overlay.querySelector("#rail-train-purchase-summary");
          if (el) el.innerHTML = html.join("");
        }
  
        overlay.querySelector("#rail-buy-train-carriage").addEventListener("change", renderSummary);
        overlay.querySelector("#rail-buy-train-count").addEventListener("input", renderSummary);
        renderSummary();
      }
  
      var btnWh = document.getElementById("btn-rail-open-warehouses");
      if (btnWh) btnWh.addEventListener("click", openWarehousesModal);
      var btnOrders = document.getElementById("btn-rail-open-orders");
      if (btnOrders) btnOrders.addEventListener("click", openOrdersModal);
      var btnTracks = document.getElementById("btn-rail-open-tracks");
      if (btnTracks) btnTracks.addEventListener("click", openTracksModal);
      var btnBuyTrain = document.getElementById("btn-rail-open-buy-train");
      if (btnBuyTrain) btnBuyTrain.addEventListener("click", openBuyTrainModal);
      var btnExams = document.getElementById("btn-rail-go-exams");
      if (btnExams) {
        btnExams.addEventListener("click", function () {
          UI.currentTab = "school";
          UI.renderCurrentTab();
        });
      }
      var manageBtns = document.querySelectorAll(".btn-rail-train-manage");
      for (var mi = 0; mi < manageBtns.length; mi++) {
        manageBtns[mi].addEventListener("click", function (e) {
          var id = e.target.getAttribute("data-train");
          openTrainManageModal(id);
        });
      }
      var depIn = document.getElementById("rail-deposit");
      var depBtn = document.getElementById("btn-rail-deposit");
      if (depBtn && depIn) {
        depBtn.addEventListener("click", function () {
          var v = parseFloat(depIn.value);
          Game.Companies.depositRailFunds(v);
          UI.showRailLogisticsPage();
        });
      }
      var wIn = document.getElementById("rail-withdraw");
      var wBtn = document.getElementById("btn-rail-withdraw");
      if (wBtn && wIn) {
        wBtn.addEventListener("click", function () {
          var v = parseFloat(wIn.value);
          Game.Companies.withdrawRailFunds(v);
          UI.showRailLogisticsPage();
        });
      }
  
      var fleetTable = document.querySelector(".rail-fleet-table");
      if (fleetTable) {
        fleetTable.addEventListener("click", function (e) {
          // Ignore clicks on action buttons.
          if (e.target && e.target.closest && e.target.closest("button")) return;
          var row = e.target && e.target.closest ? e.target.closest("tr[data-train]") : null;
          if (!row) return;
          var id = row.getAttribute("data-train");
          if (!id) return;
          openTrainManageModal(id);
        });
      }
  
    },
    getRetailNextDeliveryLabel: function (shop) {
      var s = Game.state || { day: 1, timeMinutes: 0 };
      if (!shop || !shop.unlocked) return "None pending";
      var list = shop.pendingDeliveries || [];
      if (!list.length) return "None pending";
      var next = null;
      for (var i = 0; i < list.length; i++) {
        var d = list[i];
        if (!d) continue;
        if (!next || d.arrivalDay < next.arrivalDay) {
          next = d;
        }
      }
      if (!next || typeof next.arrivalDay !== "number") return "None pending";
      return UI.getDeliveryEtaLabel(next.arrivalDay);
    },
    getDeliveryEtaLabel: function (arrivalDay) {
      var nowDay = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
      var nowMin = (Game.state && typeof Game.state.timeMinutes === "number") ? Game.state.timeMinutes : 0;
      if (!isFinite(nowMin) || nowMin < 0) nowMin = 0;
      if (nowMin >= 24 * 60) nowMin = nowMin % (24 * 60);
  
      var ad = null;
      if (typeof arrivalDay === "number" && isFinite(arrivalDay)) {
        ad = arrivalDay;
      } else if (typeof arrivalDay === "string") {
        var parsed = parseFloat(arrivalDay);
        if (isFinite(parsed)) ad = parsed;
      }
      if (ad === null) return "-";
  
      // Guard against float drift (e.g. 5.0000000001) so "same-day" deliveries don't miss the dayDiff===0 path.
      var roundedDay = Math.round(ad);
      if (Math.abs(ad - roundedDay) < 1e-6) ad = roundedDay;
  
      var dayDiff = ad - nowDay;
      if (dayDiff < 0) return "Overdue";
  
      var minutesUntil = dayDiff * 24 * 60 - nowMin;
      if (!isFinite(minutesUntil)) return "-";
  
      // Retail deliveries are processed on the day rollover. For "same-day" small shipments (arrivalDay ~= today),
      // show the time remaining until midnight so ETA is still meaningful.
      if (minutesUntil <= 0 && Math.abs(dayDiff) < 1e-6) {
        minutesUntil = 24 * 60 - nowMin;
      }
  
      // If we're at/after the target moment (can happen with fractional arrival days or legacy saves), avoid the
      // generic "Arriving soon" fallback and show a concrete ETA.
      if (minutesUntil <= 0) minutesUntil = 0;
  
      var totalMinutes = Math.ceil(minutesUntil);
      var days = Math.floor(totalMinutes / (24 * 60));
      var rem = totalMinutes - days * 24 * 60;
      var hours = Math.floor(rem / 60);
      var mins = rem % 60;
      if (days > 0) return days + "d " + hours + "h";
      if (hours > 0) return hours + "h " + mins + "m";
      return mins + "m";
    },
    openRetailFundsModal: function () {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
  
      function fmtMoney(n) {
        n = (typeof n === "number" && isFinite(n)) ? n : 0;
        return "$" + n.toFixed(2);
      }
      function render() {
        var funds = (typeof shop.funds === "number" && isFinite(shop.funds)) ? shop.funds : 0;
        var wallet = (Game.state && typeof Game.state.money === "number" && isFinite(Game.state.money)) ? Game.state.money : 0;
        var body = [];
        body.push('<div class="card-section small">');
        body.push('<div class="field-row"><span>Business funds</span><span class="mono" id="retail-modal-funds">' + fmtMoney(funds) + '</span></div>');
        body.push('<div class="field-row"><span>Wallet</span><span class="mono" id="retail-modal-wallet">' + fmtMoney(wallet) + '</span></div>');
        body.push('</div>');
  
        body.push('<div class="card-section">');
        body.push('<div class="field-row small"><span>Deposit</span><span><input id="retail-modal-deposit" class="input-small" type="number" min="0" step="10" placeholder="Amount">' +
          '<button class="btn btn-small btn-outline" id="btn-retail-modal-deposit">Deposit</button></span></div>');
        body.push('<div class="field-row small mt-4"><span>Withdraw</span><span><input id="retail-modal-withdraw" class="input-small" type="number" min="0" step="10" placeholder="Amount">' +
          '<button class="btn btn-small btn-outline" id="btn-retail-modal-withdraw">Withdraw</button></span></div>');
        body.push('<div class="field-row small mt-4"><span>Auto payout</span><span><label class="small"><input type="checkbox" id="retail-modal-auto-payout"' +
          (shop.autoPayoutToWallet ? ' checked' : '') + '> Send sales to wallet</label></span></div>');
        body.push('<div class="small dim mt-4">Deposits/withdrawals move money between your wallet and Retail business funds.</div>');
        body.push('</div>');
        return body.join("");
      }
  
      var overlay = UI.openModalCard({
        title: "Business Funds",
        sub: "Retail Shop",
        bodyHtml: render(),
        actions: [{ id: "close", label: "Close", primary: false }],
        onAction: function (actionId, close) {
          if (actionId === "close") close();
        }
      });
      if (!overlay) return;
  
      function refresh() {
        if (!overlay || !overlay.parentNode) return;
        var funds = (typeof shop.funds === "number" && isFinite(shop.funds)) ? shop.funds : 0;
        var wallet = (Game.state && typeof Game.state.money === "number" && isFinite(Game.state.money)) ? Game.state.money : 0;
        var fundsEl = overlay.querySelector("#retail-modal-funds");
        var walletEl = overlay.querySelector("#retail-modal-wallet");
        if (fundsEl) fundsEl.textContent = "$" + funds.toFixed(2);
        if (walletEl) walletEl.textContent = "$" + wallet.toFixed(2);
        var autoEl = overlay.querySelector("#retail-modal-auto-payout");
        if (autoEl) autoEl.checked = !!shop.autoPayoutToWallet;
      }
  
      var depBtn = overlay.querySelector("#btn-retail-modal-deposit");
      if (depBtn) {
        depBtn.addEventListener("click", function () {
          var input = overlay.querySelector("#retail-modal-deposit");
          var v = input ? parseFloat(input.value) : 0;
          if (Game.Companies && typeof Game.Companies.depositRetailFunds === "function") {
            Game.Companies.depositRetailFunds(v);
          }
          refresh();
          if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
          else UI.renderCurrentTab();
        });
      }
      var wBtn = overlay.querySelector("#btn-retail-modal-withdraw");
      if (wBtn) {
        wBtn.addEventListener("click", function () {
          var input = overlay.querySelector("#retail-modal-withdraw");
          var v = input ? parseFloat(input.value) : 0;
          if (Game.Companies && typeof Game.Companies.withdrawRetailFunds === "function") {
            Game.Companies.withdrawRetailFunds(v);
          }
          refresh();
          if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
          else UI.renderCurrentTab();
        });
      }
      var autoEl = overlay.querySelector("#retail-modal-auto-payout");
      if (autoEl) {
        autoEl.addEventListener("change", function () {
          shop.autoPayoutToWallet = !!this.checked;
        });
      }
    },
    openRetailCampaignsModal: function () {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
  
      var defs = (Game.Companies && typeof Game.Companies.getRetailCampaignDefs === "function") ? Game.Companies.getRetailCampaignDefs() : [];
      var durations = [
        { days: 7, label: "7 days" },
        { days: 28, label: "1 month" },
        { days: 84, label: "3 months" },
        { days: 168, label: "6 months" }
      ];
  
      function fmtMoney(n) {
        n = (typeof n === "number" && isFinite(n)) ? n : 0;
        return "$" + n.toFixed(0);
      }
      function getDef(id) {
        for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i];
        return defs[0] || null;
      }
  
      var body = [];
      body.push('<div class="card-section small">');
      if (shop.campaign) {
        var currentDef = getDef(shop.campaign.channel);
        var nm = currentDef ? currentDef.name : String(shop.campaign.channel || "Campaign");
        var rem = (typeof shop.campaign.daysRemaining === "number" && isFinite(shop.campaign.daysRemaining)) ? Math.floor(shop.campaign.daysRemaining) : 0;
        body.push('<div class="notice">Active campaign: <span class="mono">' + nm + '</span> (' + rem + ' days remaining)</div>');
      } else {
        body.push('<div class="small dim">No active campaign.</div>');
      }
      body.push('</div>');
  
      body.push('<div class="card-section">');
      body.push('<div class="field-row"><span>Channel</span><span><select id="retail-campaign-channel" class="input-small">');
      for (var d = 0; d < defs.length; d++) {
        body.push('<option value="' + defs[d].id + '">' + defs[d].name + '</option>');
      }
      body.push('</select></span></div>');
      body.push('<div class="field-row mt-4"><span>Duration</span><span><select id="retail-campaign-duration" class="input-small">');
      for (var t = 0; t < durations.length; t++) {
        body.push('<option value="' + durations[t].days + '">' + durations[t].label + '</option>');
      }
      body.push('</select></span></div>');
      body.push('<div class="field-row mt-4"><span>Total cost</span><span class="mono" id="retail-campaign-cost">-</span></div>');
      body.push('<div class="field-row"><span>Effect</span><span class="mono" id="retail-campaign-effect">-</span></div>');
      body.push('<div class="small dim mt-4">Campaign cost is paid upfront from Retail business funds. Effects apply while the campaign is active.</div>');
      body.push('</div>');
  
      var overlay = UI.openModalCard({
        title: "Campaigns",
        sub: "Retail Shop",
        bodyHtml: body.join(""),
        actions: [
          { id: "cancelCampaign", label: "Cancel active", primary: false },
          { id: "start", label: "Start campaign", primary: true },
          { id: "close", label: "Close", primary: false }
        ],
        onAction: function (actionId, close, ov) {
          if (actionId === "close") {
            close();
            return;
          }
          if (actionId === "cancelCampaign") {
            if (Game.Companies && typeof Game.Companies.cancelRetailCampaign === "function") {
              Game.Companies.cancelRetailCampaign();
            }
            if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
            else UI.renderCurrentTab();
            close();
            return;
          }
          if (actionId === "start") {
            var ch = ov.querySelector("#retail-campaign-channel");
            var du = ov.querySelector("#retail-campaign-duration");
            var channelId = ch ? String(ch.value || "") : "";
            var days = du ? parseInt(du.value, 10) : 7;
            if (Game.Companies && typeof Game.Companies.startRetailCampaign === "function") {
              Game.Companies.startRetailCampaign(channelId, days);
            }
            if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
            else UI.renderCurrentTab();
            close();
          }
        }
      });
      if (!overlay) return;
  
      var channelSel = overlay.querySelector("#retail-campaign-channel");
      var durSel = overlay.querySelector("#retail-campaign-duration");
      var costEl = overlay.querySelector("#retail-campaign-cost");
      var effEl = overlay.querySelector("#retail-campaign-effect");
      function updateSummary() {
        if (!channelSel || !durSel) return;
        var def = getDef(String(channelSel.value || ""));
        var days = parseInt(durSel.value, 10);
        if (isNaN(days) || days <= 0) days = 7;
        var cost = def ? (def.costPerDay || 0) * days : 0;
        if (costEl) costEl.textContent = fmtMoney(cost) + " (funds: " + fmtMoney(shop.funds || 0) + ")";
        if (effEl && def) {
          effEl.textContent = "+" + (def.popPerDay || 0).toFixed(1) + "% popularity/day, x" + (def.salesMult || 1).toFixed(2) + " sales, x" + (def.priceMult || 1).toFixed(2) + " price";
        }
      }
      if (channelSel) channelSel.addEventListener("change", updateSummary);
      if (durSel) durSel.addEventListener("change", updateSummary);
      updateSummary();
    },
    openRetailBuyItemsModal: function () {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
      var unlocked = (Game.Companies && typeof Game.Companies.getRetailUnlockedItems === "function") ? Game.Companies.getRetailUnlockedItems(shop.level) : [];
      // Hide locked items entirely: only render unlocked.
      unlocked = Array.isArray(unlocked) ? unlocked.slice() : [];
      unlocked.sort(function (a, b) {
        var ca = String(a.category || "");
        var cb = String(b.category || "");
        if (ca < cb) return -1;
        if (ca > cb) return 1;
        var na = String(a.name || a.id || "");
        var nb = String(b.name || b.id || "");
        if (na < nb) return -1;
        if (na > nb) return 1;
        return 0;
      });
  
      function fmtMoney(n, dec) {
        n = (typeof n === "number" && isFinite(n)) ? n : 0;
        return "$" + n.toFixed(typeof dec === "number" ? dec : 2);
      }
      function renderTable(list) {
        var html = [];
        if (!list.length) {
          html.push('<div class="small dim">No items available yet. Increase Retail level to unlock products.</div>');
          return html.join("");
        }
        html.push('<table class="table small"><thead><tr><th>Item</th><th>Buy</th><th>Sell</th><th>Qty</th><th></th></tr></thead><tbody>');
        for (var i = 0; i < list.length; i++) {
          var it = list[i];
          html.push('<tr>');
          html.push('<td>' + it.name + '<div class="small dim">' + String(it.category || "") + '</div></td>');
          html.push('<td class="mono">' + fmtMoney(it.buyPrice, 2) + '</td>');
          html.push('<td class="mono">' + fmtMoney(it.sellPrice, 2) + '</td>');
          html.push('<td><input class="input-small" id="retail-buy-modal-qty-' + it.id + '" type="number" min="1" step="1" value="20" style="width:86px;"></td>');
          html.push('<td><button class="btn btn-small btn-primary retail-buy-modal" data-item="' + it.id + '">Buy</button></td>');
          html.push('</tr>');
        }
        html.push('</tbody></table>');
        return html.join("");
      }
  
      var body = [];
      body.push('<div class="card-section small">');
      body.push('<div class="field-row"><span>Business funds</span><span class="mono" id="retail-buy-modal-funds">' + fmtMoney(shop.funds || 0, 2) + '</span></div>');
      body.push('<div class="small dim mt-4">Purchases are instant and use Retail business funds.</div>');
      body.push('</div>');
      body.push('<div class="card-section">' + renderTable(unlocked) + '</div>');
  
      var overlay = UI.openModalCard({
        title: "Buy Items",
        sub: "Retail Shop",
        bodyHtml: body.join(""),
        large: true,
        actions: [{ id: "close", label: "Close", primary: false }],
        onAction: function (actionId, close) {
          if (actionId === "close") close();
        }
      });
      if (!overlay) return;
  
      function refreshFunds() {
        var el = overlay.querySelector("#retail-buy-modal-funds");
        if (el) el.textContent = fmtMoney(shop.funds || 0, 2);
      }
  
      overlay.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest(".retail-buy-modal") : null;
        if (!btn) return;
        var itemId = btn.getAttribute("data-item");
        if (!itemId) return;
        var qtyEl = overlay.querySelector("#retail-buy-modal-qty-" + itemId);
        var qty = qtyEl ? parseInt(qtyEl.value, 10) : 1;
        if (Game.Companies && typeof Game.Companies.purchaseRetailItem === "function") {
          Game.Companies.purchaseRetailItem(itemId, qty);
        }
        refreshFunds();
        if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
      });
    },
    openRetailInventoryModal: function (opts) {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
      opts = opts && typeof opts === "object" ? opts : {};
      var showDeliveries = !!opts.showDeliveries;
  
      function fmtMoney(n, dec) {
        n = (typeof n === "number" && isFinite(n)) ? n : 0;
        return "$" + n.toFixed(typeof dec === "number" ? dec : 2);
      }
  
      function compute() {
        var invU = shop.inventory && shop.inventory.units ? shop.inventory.units : {};
        var invC = shop.inventory && shop.inventory.costBasis ? shop.inventory.costBasis : {};
        var deliveries = Array.isArray(shop.pendingDeliveries) ? shop.pendingDeliveries : [];
        var sum = (Game.Companies && typeof Game.Companies.getRetailStaffSummary === "function") ? Game.Companies.getRetailStaffSummary(shop) : { vans: 0, drivers: 0, managers: 0, managerLevels: 0 };
        var canDeliver = (Game.Companies && typeof Game.Companies.canRetailDeliver === "function") ? Game.Companies.canRetailDeliver(shop) : (sum.vans > 0 && sum.drivers > 0);
        var today = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Game.state.day : 1;
  
        var onOrderByItem = {};
        var earliestArrivalByItem = {};
        for (var i = 0; i < deliveries.length; i++) {
          var d = deliveries[i];
          if (!d) continue;
          var itemId = String(d.itemId || "");
          if (!itemId) continue;
          var u = (typeof d.units === "number" && isFinite(d.units)) ? Math.floor(d.units) : 0;
          if (u <= 0) continue;
          onOrderByItem[itemId] = (onOrderByItem[itemId] || 0) + u;
          var ad = (typeof d.arrivalDay === "number" && isFinite(d.arrivalDay)) ? d.arrivalDay : today;
          if (earliestArrivalByItem[itemId] === undefined || ad < earliestArrivalByItem[itemId]) earliestArrivalByItem[itemId] = ad;
        }
  
        var unlocked = (Game.Companies && typeof Game.Companies.getRetailUnlockedItems === "function") ? Game.Companies.getRetailUnlockedItems(shop.level) : [];
        unlocked = Array.isArray(unlocked) ? unlocked.slice() : [];
        var unlockedById = {};
        for (var uIdx = 0; uIdx < unlocked.length; uIdx++) {
          if (unlocked[uIdx] && unlocked[uIdx].id) unlockedById[unlocked[uIdx].id] = unlocked[uIdx];
        }
  
        // Combine "in stock" and "order" into a single per-item table.
        var ids = {};
        for (var id in unlockedById) ids[id] = true;
        for (var invId in invU) if (Object.prototype.hasOwnProperty.call(invU, invId)) ids[invId] = true;
        for (var ordId in onOrderByItem) if (Object.prototype.hasOwnProperty.call(onOrderByItem, ordId)) ids[ordId] = true;
  
        var rows = [];
        var skuCount = 0;
        var totalUnits = 0;
        var totalOnOrder = 0;
        for (var itemId2 in ids) {
          if (!Object.prototype.hasOwnProperty.call(ids, itemId2)) continue;
          var def = unlockedById[itemId2] || ((Game.Companies && typeof Game.Companies.getRetailItemDef === "function") ? Game.Companies.getRetailItemDef(itemId2) : null);
          var name = def ? def.name : itemId2;
          var category = def ? def.category : "";
          var onHand = (typeof invU[itemId2] === "number" && isFinite(invU[itemId2])) ? Math.floor(invU[itemId2]) : 0;
          if (onHand < 0) onHand = 0;
          var costBasis = (typeof invC[itemId2] === "number" && isFinite(invC[itemId2]) && invC[itemId2] > 0) ? invC[itemId2] : 0;
          var onOrder = (typeof onOrderByItem[itemId2] === "number" && isFinite(onOrderByItem[itemId2])) ? Math.floor(onOrderByItem[itemId2]) : 0;
          if (onOrder < 0) onOrder = 0;
          var earliest = (earliestArrivalByItem[itemId2] !== undefined) ? earliestArrivalByItem[itemId2] : null;
          var buyPrice = def && typeof def.buyPrice === "number" && isFinite(def.buyPrice) ? def.buyPrice : null;
  
          // Hide locked items for purchasing: only show order controls when unlocked for current level.
          var isUnlocked = !!unlockedById[itemId2];
          if (!isUnlocked && onHand <= 0 && onOrder <= 0) continue;
  
          var avg = (onHand > 0 && costBasis > 0) ? (costBasis / onHand) : 0;
          var sell = def && typeof def.sellPrice === "number" && isFinite(def.sellPrice) ? def.sellPrice : 0;
  
          skuCount += (onHand > 0 || onOrder > 0) ? 1 : 0;
          totalUnits += onHand;
          totalOnOrder += onOrder;
  
          rows.push({
            id: itemId2,
            name: name,
            category: category,
            onHand: onHand,
            onOrder: onOrder,
            earliestArrival: earliest,
            avgCost: avg,
            sellPrice: sell,
            buyPrice: buyPrice,
            canOrder: isUnlocked && buyPrice !== null
          });
        }
        rows.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
  
        // Full delivery list (optional).
        var delRows = [];
        for (var di = 0; di < deliveries.length; di++) {
          var d2 = deliveries[di];
          if (!d2) continue;
          var itemId3 = String(d2.itemId || "");
          var def3 = (Game.Companies && typeof Game.Companies.getRetailItemDef === "function") ? Game.Companies.getRetailItemDef(itemId3) : null;
          var nm = def3 ? def3.name : (itemId3 || "Item");
          var qty3 = (typeof d2.units === "number" && isFinite(d2.units)) ? Math.floor(d2.units) : 0;
          var ad3 = (typeof d2.arrivalDay === "number" && isFinite(d2.arrivalDay)) ? d2.arrivalDay : today;
          var status = ad3 > today ? ("Supplier lead time (" + UI.getDeliveryEtaLabel(ad3) + ")") : (canDeliver ? "Ready to dispatch" : "Arrived (needs driver + van)");
          delRows.push({ id: d2.id || ("#" + (di + 1)), name: nm, qty: qty3, arrivalDay: ad3, status: status });
        }
        delRows.sort(function (a, b) { return (a.arrivalDay || 0) - (b.arrivalDay || 0); });
  
        return {
          today: today,
          invU: invU,
          invC: invC,
          deliveries: deliveries,
          sum: sum,
          canDeliver: canDeliver,
          rows: rows,
          skuCount: skuCount,
          totalUnits: totalUnits,
          totalOnOrder: totalOnOrder,
          delRows: delRows
        };
      }
  
      function renderInner(model) {
        var body = [];
        body.push('<div id="retail-inv-root">');
        body.push('<div class="card-section small">');
        body.push('<div class="field-row"><span>Business funds</span><span class="mono" id="retail-inv-funds">' + fmtMoney(shop.funds || 0, 2) + '</span></div>');
        body.push('<div class="field-row"><span>Stock</span><span class="mono" id="retail-inv-stock">' + model.totalUnits + ' on hand | ' + model.totalOnOrder + ' waiting</span></div>');
        body.push('<div class="field-row"><span>SKUs</span><span class="mono" id="retail-inv-skus">' + model.skuCount + '</span></div>');
        body.push('<div class="field-row"><span>Logistics</span><span class="mono" id="retail-inv-log">' + (model.sum.vans || 0) + ' van(s), ' + (model.sum.drivers || 0) + ' driver(s)</span></div>');
        body.push('<div class="notice mt-8" id="retail-inv-log-notice" style="display:' + (!model.canDeliver && model.delRows.length ? "block" : "none") + ';">Deliveries require at least 1 driver and 1 van. Orders will wait until logistics are staffed.</div>');
        body.push('</div>');
  
        body.push('<div class="card-section">');
        body.push('<div class="chip-row" style="gap:8px;flex-wrap:wrap;">');
        body.push('<button class="btn btn-small btn-outline" id="btn-retail-inv-dispatch"' + (model.canDeliver ? '' : ' disabled') + '>Dispatch ready deliveries</button>');
        body.push('<button class="btn btn-small btn-outline" id="btn-retail-inv-buyvan">Buy van</button>');
        body.push('<button class="btn btn-small btn-outline" id="btn-retail-inv-hiredriver">Hire driver</button>');
        body.push('<button class="btn btn-small btn-outline" id="btn-retail-inv-toggle-deliveries" style="display:' + (model.delRows.length ? "inline-flex" : "none") + ';">' + (showDeliveries ? "Hide deliveries" : "Show deliveries") + '</button>');
        body.push('</div>');
        body.push('</div>');
  
        body.push('<div class="card-section">');
        body.push('<div class="bar-label">Stock & Ordering</div>');
        body.push('<div class="small dim">Each row shows what you have on hand and what is waiting for delivery. Orders go to the delivery queue.</div>');
        if (!model.rows.length) {
          body.push('<div class="small dim mt-8">No items available yet. Increase Retail level to unlock products.</div>');
        } else {
          body.push('<table class="table small"><thead><tr><th>Item</th><th>Stock</th><th>Status</th><th>Avg cost</th><th>Buy</th><th>Qty</th><th></th></tr></thead><tbody>');
          for (var i = 0; i < model.rows.length; i++) {
            var r = model.rows[i];
            var statusTags = [];
            if (r.onHand > 0) statusTags.push('<span class="tag">In stock</span>');
            if (r.onOrder > 0) statusTags.push('<span class="tag">Waiting</span>');
            if (r.onHand <= 0 && r.onOrder <= 0) statusTags.push('<span class="tag">Out</span>');
  
            var statusDetail = "";
            if (r.onOrder > 0 && r.earliestArrival !== null) {
              if (r.earliestArrival > model.today) statusDetail = "ETA " + UI.getDeliveryEtaLabel(r.earliestArrival);
              else statusDetail = model.canDeliver ? "Ready to dispatch" : "Arrived (needs driver + van)";
            } else if (r.onHand > 0) {
              statusDetail = "Available";
            } else {
              statusDetail = "No stock";
            }
  
            body.push('<tr data-item="' + r.id + '">');
            body.push('<td>' + r.name + '<div class="small dim">' + String(r.category || "") + '</div></td>');
            body.push('<td class="mono"><span id="retail-row-onhand-' + r.id + '">' + r.onHand + '</span> on hand<div class="small dim mono"><span id="retail-row-onorder-' + r.id + '">' + r.onOrder + '</span> waiting</div></td>');
            body.push('<td><span id="retail-row-status-tags-' + r.id + '">' + statusTags.join(" ") + '</span><div class="small dim" id="retail-row-status-detail-' + r.id + '">' + statusDetail + '</div></td>');
            body.push('<td class="mono" id="retail-row-avg-' + r.id + '">' + fmtMoney(r.avgCost || 0, 2) + '</td>');
            body.push('<td class="mono" id="retail-row-buy-' + r.id + '">' + (r.buyPrice !== null ? fmtMoney(r.buyPrice, 2) : "-") + '</td>');
            if (r.canOrder) {
              body.push('<td><input class="input-small" id="retail-order-qty-' + r.id + '" type="number" min="1" step="1" value="20" style="width:86px;"></td>');
              body.push('<td><button class="btn btn-small btn-primary retail-order-btn" data-item="' + r.id + '">Order</button></td>');
            } else {
              body.push('<td class="small dim">-</td>');
              body.push('<td class="small dim">-</td>');
            }
            body.push('</tr>');
          }
          body.push('</tbody></table>');
        }
        body.push('</div>');
  
        body.push('<div class="card-section" id="retail-inv-deliveries" style="display:' + (model.delRows.length ? (showDeliveries ? "block" : "none") : "none") + ';">');
        body.push('<div class="bar-label">Delivery List</div>');
        body.push('<table class="table small"><thead><tr><th>Order</th><th>Item</th><th>Units</th><th>Arrival</th><th>Status</th></tr></thead><tbody id="retail-inv-deliveries-body">');
        for (var d = 0; d < model.delRows.length; d++) {
          var dr = model.delRows[d];
          body.push('<tr>');
          body.push('<td class="mono">' + dr.id + '</td>');
          body.push('<td>' + dr.name + '</td>');
          body.push('<td class="mono">' + dr.qty + '</td>');
          body.push('<td class="mono">Day ' + dr.arrivalDay + '</td>');
          body.push('<td>' + dr.status + '</td>');
          body.push('</tr>');
        }
        body.push('</tbody></table>');
        body.push('</div>');
  
        body.push('</div>');
        return body.join("");
      }
  
      var overlay = UI.openModalCard({
        title: "Inventory Management",
        sub: "Retail Shop",
        bodyHtml: '<div id="retail-inv-container"></div>',
        large: true,
        actions: [{ id: "close", label: "Close", primary: false }],
        onAction: function (actionId, close) {
          if (actionId === "close") close();
        }
      });
      if (!overlay) return;
  
      var container = overlay.querySelector("#retail-inv-container");
      function snapshotQtyInputs() {
        var map = {};
        if (!overlay || !overlay.querySelectorAll) return map;
        var inputs = overlay.querySelectorAll('input[id^="retail-order-qty-"]');
        for (var i = 0; i < inputs.length; i++) {
          var el = inputs[i];
          if (!el || !el.id) continue;
          var key = el.id.replace("retail-order-qty-", "");
          map[key] = el.value;
        }
        return map;
      }
      function restoreQtyInputs(map) {
        if (!map || !overlay) return;
        for (var key in map) {
          if (!Object.prototype.hasOwnProperty.call(map, key)) continue;
          var el = overlay.querySelector("#retail-order-qty-" + key);
          if (el) el.value = map[key];
        }
      }
      function rerender() {
        if (!container) return;
        var snap = snapshotQtyInputs();
        container.innerHTML = renderInner(compute());
        restoreQtyInputs(snap);
      }
      rerender();
  
      var lastSig = null;
      function signature(model) {
        var ids = [];
        for (var i = 0; i < model.rows.length; i++) ids.push(model.rows[i].id + (model.rows[i].canOrder ? "1" : "0"));
        ids.sort();
        return ids.join(",");
      }
  
      function syncInPlace(model) {
        if (!overlay || !overlay.parentNode) return false;
        var fundsEl = overlay.querySelector("#retail-inv-funds");
        if (fundsEl) fundsEl.textContent = fmtMoney(shop.funds || 0, 2);
        var stockEl = overlay.querySelector("#retail-inv-stock");
        if (stockEl) stockEl.textContent = model.totalUnits + " on hand | " + model.totalOnOrder + " waiting";
        var skusEl = overlay.querySelector("#retail-inv-skus");
        if (skusEl) skusEl.textContent = String(model.skuCount || 0);
        var logEl = overlay.querySelector("#retail-inv-log");
        if (logEl) logEl.textContent = (model.sum.vans || 0) + " van(s), " + (model.sum.drivers || 0) + " driver(s)";
  
        var noticeEl = overlay.querySelector("#retail-inv-log-notice");
        if (noticeEl) noticeEl.style.display = (!model.canDeliver && model.delRows.length ? "block" : "none");
  
        var dispatchBtn = overlay.querySelector("#btn-retail-inv-dispatch");
        if (dispatchBtn) dispatchBtn.disabled = !model.canDeliver;
  
        var toggleBtn = overlay.querySelector("#btn-retail-inv-toggle-deliveries");
        if (toggleBtn) {
          toggleBtn.style.display = model.delRows.length ? "inline-flex" : "none";
          toggleBtn.textContent = showDeliveries ? "Hide deliveries" : "Show deliveries";
        }
  
        var deliveriesSection = overlay.querySelector("#retail-inv-deliveries");
        if (deliveriesSection) {
          deliveriesSection.style.display = model.delRows.length ? (showDeliveries ? "block" : "none") : "none";
        }
  
        for (var i = 0; i < model.rows.length; i++) {
          var r = model.rows[i];
          var onHandEl = overlay.querySelector("#retail-row-onhand-" + r.id);
          if (onHandEl) onHandEl.textContent = String(r.onHand || 0);
          var onOrderEl = overlay.querySelector("#retail-row-onorder-" + r.id);
          if (onOrderEl) onOrderEl.textContent = String(r.onOrder || 0);
  
          var statusTags = [];
          if (r.onHand > 0) statusTags.push('<span class="tag">In stock</span>');
          if (r.onOrder > 0) statusTags.push('<span class="tag">Waiting</span>');
          if (r.onHand <= 0 && r.onOrder <= 0) statusTags.push('<span class="tag">Out</span>');
          var statusDetail = "";
          if (r.onOrder > 0 && r.earliestArrival !== null) {
            if (r.earliestArrival > model.today) statusDetail = "ETA " + UI.getDeliveryEtaLabel(r.earliestArrival);
            else statusDetail = model.canDeliver ? "Ready to dispatch" : "Arrived (needs driver + van)";
          } else if (r.onHand > 0) {
            statusDetail = "Available";
          } else {
            statusDetail = "No stock";
          }
          var tagsEl = overlay.querySelector("#retail-row-status-tags-" + r.id);
          if (tagsEl) tagsEl.innerHTML = statusTags.join(" ");
          var detailEl = overlay.querySelector("#retail-row-status-detail-" + r.id);
          if (detailEl) detailEl.textContent = statusDetail;
  
          var avgEl = overlay.querySelector("#retail-row-avg-" + r.id);
          if (avgEl) avgEl.textContent = fmtMoney(r.avgCost || 0, 2);
          var buyEl = overlay.querySelector("#retail-row-buy-" + r.id);
          if (buyEl) buyEl.textContent = (r.buyPrice !== null ? fmtMoney(r.buyPrice, 2) : "-");
        }
  
        var delBody = overlay.querySelector("#retail-inv-deliveries-body");
        if (delBody) {
          var html = [];
          for (var d = 0; d < model.delRows.length; d++) {
            var dr = model.delRows[d];
            html.push("<tr>");
            html.push('<td class="mono">' + dr.id + "</td>");
            html.push("<td>" + dr.name + "</td>");
            html.push('<td class="mono">' + dr.qty + "</td>");
            html.push('<td class="mono">Day ' + dr.arrivalDay + "</td>");
            html.push("<td>" + dr.status + "</td>");
            html.push("</tr>");
          }
          delBody.innerHTML = html.join("");
        }
  
        return true;
      }
  
      function sync() {
        if (!overlay || !overlay.parentNode) return;
        var model = compute();
        var sig = signature(model);
        if (lastSig === null) lastSig = sig;
        if (sig !== lastSig) {
          lastSig = sig;
          rerender();
          return;
        }
        syncInPlace(model);
      }
  
      // Live updates while the modal is open (without rebuilding the whole UI and wiping inputs).
      var syncTimer = setInterval(function () {
        if (!overlay || !overlay.parentNode) {
          clearInterval(syncTimer);
          return;
        }
        sync();
      }, 750);
  
      overlay.addEventListener("click", function (e) {
        var t = e.target;
        if (!t) return;
        var btn = t.closest ? t.closest("button") : null;
        if (btn) {
          var id = btn.id;
          if (id === "btn-retail-inv-dispatch") {
            if (Game.Companies && typeof Game.Companies.dispatchRetailDeliveriesNow === "function") {
              Game.Companies.dispatchRetailDeliveriesNow();
            }
            if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
            sync();
            return;
          }
          if (id === "btn-retail-inv-buyvan") {
            if (Game.Companies && typeof Game.Companies.buyRetailVan === "function") {
              Game.Companies.buyRetailVan();
            }
            if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
            sync();
            return;
          }
          if (id === "btn-retail-inv-hiredriver") {
            if (UI.openRetailHireStaffModal) UI.openRetailHireStaffModal("driver");
            sync();
            return;
          }
          if (id === "btn-retail-inv-toggle-deliveries") {
            showDeliveries = !showDeliveries;
            sync();
            return;
          }
        }
  
        var orderBtn = t.closest ? t.closest(".retail-order-btn") : null;
        if (orderBtn) {
          var itemId = orderBtn.getAttribute("data-item");
          if (!itemId) return;
          var qtyEl = overlay.querySelector("#retail-order-qty-" + itemId);
          var qty = qtyEl ? parseInt(qtyEl.value, 10) : 1;
          if (Game.Companies && typeof Game.Companies.purchaseRetailItem === "function") {
            Game.Companies.purchaseRetailItem(itemId, qty);
          }
          if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
          sync();
        }
      });
    },
    openRetailHireStaffModal: function (rolePreset) {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
      var role = String(rolePreset || "clerk");
      var roleDefs = (Game.Companies && typeof Game.Companies.getRetailStaffRoleDefs === "function") ? Game.Companies.getRetailStaffRoleDefs() : null;
      var def = roleDefs && roleDefs[role] ? roleDefs[role] : (roleDefs ? roleDefs.clerk : { id: role, name: role });
  
      function makeCandidate(i) {
        var name = (Game.Companies && typeof Game.Companies.generateBritishName === "function") ? Game.Companies.generateBritishName() : ("Candidate " + i);
        var level = 1 + Math.floor(Math.random() * 3);
        if (role === "manager") level = 2 + Math.floor(Math.random() * 3);
        var hireFee = (def.hireFeeBase || 80) + (level - 1) * 40 + Math.floor(Math.random() * 35);
        return { name: name, role: def.id, level: level, hireFee: hireFee };
      }
      var candidates = [];
      for (var i = 0; i < 6; i++) candidates.push(makeCandidate(i + 1));
  
      function wageFor(level) {
        return (Game.Companies && typeof Game.Companies.getRetailStaffWageDaily === "function") ? Game.Companies.getRetailStaffWageDaily(def.id, level) : 0;
      }
  
      var body = [];
      body.push('<div class="card-section small">');
      body.push('<div class="field-row"><span>Role</span><span class="mono">' + def.name + '</span></div>');
      body.push('<div class="field-row"><span>Business funds</span><span class="mono">$' + ((shop.funds || 0).toFixed(2)) + '</span></div>');
      body.push('<div class="small dim mt-4">Choose a candidate. Hiring fee is paid from Retail business funds.</div>');
      body.push('</div>');
      body.push('<div class="card-section">');
      body.push('<table class="table small"><thead><tr><th></th><th>Name</th><th>Level</th><th>Wage/day</th><th>Hire fee</th></tr></thead><tbody>');
      for (var c = 0; c < candidates.length; c++) {
        var cand = candidates[c];
        body.push('<tr>');
        body.push('<td><input type="radio" name="retail-hire-pick" value="' + c + '"' + (c === 0 ? ' checked' : '') + '></td>');
        body.push('<td>' + cand.name + '</td>');
        body.push('<td class="mono">L' + cand.level + '</td>');
        body.push('<td class="mono">$' + wageFor(cand.level).toFixed(0) + '</td>');
        body.push('<td class="mono">$' + cand.hireFee.toFixed(0) + '</td>');
        body.push('</tr>');
      }
      body.push('</tbody></table>');
      body.push('</div>');
  
      UI.openModalCard({
        title: "Hire Staff",
        sub: "Retail Shop",
        bodyHtml: body.join(""),
        large: true,
        actions: [
          { id: "cancel", label: "Cancel", primary: false },
          { id: "hire", label: "Hire", primary: true }
        ],
        onAction: function (actionId, close, overlay) {
          if (actionId === "cancel") {
            close();
            return;
          }
          if (actionId === "hire") {
            var sel = overlay.querySelector('input[name="retail-hire-pick"]:checked');
            var idx = sel ? parseInt(sel.value, 10) : 0;
            if (isNaN(idx) || idx < 0 || idx >= candidates.length) idx = 0;
            var pick = candidates[idx];
            if (Game.Companies && typeof Game.Companies.hireRetailStaff === "function") {
              Game.Companies.hireRetailStaff(pick);
            }
            if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
            close();
          }
        }
      });
    },
    openRetailStaffModal: function () {
      if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
      if (!Game.Companies || typeof Game.Companies.ensureRetailState !== "function") return;
      Game.Companies.ensureRetailState();
      var shop = Game.state.companies.retailShop;
      if (!shop.unlocked) {
        Game.addNotification("Retail shop not unlocked yet.");
        return;
      }
      var roster = Array.isArray(shop.staffRoster) ? shop.staffRoster : [];
      var sum = (Game.Companies && typeof Game.Companies.getRetailStaffSummary === "function") ? Game.Companies.getRetailStaffSummary(shop) : { clerks: 0, managers: 0, drivers: 0, vans: 0 };
      var payroll = (Game.Companies && typeof Game.Companies.getRetailDailyPayroll === "function") ? Game.Companies.getRetailDailyPayroll(shop) : 0;
      if (typeof payroll !== "number" || !isFinite(payroll) || payroll < 0) payroll = 0;
  
      function roleLabel(role) {
        if (role === "manager") return "Manager";
        if (role === "driver") return "Driver";
        return "Clerk";
      }
  
      var body = [];
      body.push('<div class="card-section small">');
      body.push('<div class="field-row"><span>Clerks</span><span class="mono">' + (sum.clerks || 0) + ' (total L' + (sum.clerkLevels || 0) + ')</span></div>');
      body.push('<div class="field-row"><span>Managers</span><span class="mono">' + (sum.managers || 0) + ' (total L' + (sum.managerLevels || 0) + ')</span></div>');
      body.push('<div class="field-row"><span>Drivers</span><span class="mono">' + (sum.drivers || 0) + ' (total L' + (sum.driverLevels || 0) + ')</span></div>');
      body.push('<div class="field-row"><span>Vans</span><span class="mono">' + (sum.vans || 0) + '</span></div>');
      body.push('<div class="field-row mt-4"><span>Daily payroll</span><span class="mono">$' + payroll.toFixed(0) + '</span></div>');
      body.push('<div class="small dim mt-4">Staff gain XP daily and level up over time. Drivers + vans are required to deliver ordered stock.</div>');
      body.push('</div>');
  
      body.push('<div class="card-section">');
      body.push('<div class="chip-row" style="gap:8px;flex-wrap:wrap;">');
      body.push('<button class="btn btn-small btn-primary" data-modal-action="hire_clerk">Hire clerk</button>');
      body.push('<button class="btn btn-small btn-outline" data-modal-action="hire_manager">Hire manager</button>');
      body.push('<button class="btn btn-small btn-outline" data-modal-action="hire_driver">Hire driver</button>');
      body.push('</div>');
      body.push('</div>');
  
      body.push('<div class="card-section">');
      body.push('<div class="bar-label">Staff Roster</div>');
      if (!roster.length) {
        body.push('<div class="small dim">No staff hired.</div>');
      } else {
        body.push('<table class="table small"><thead><tr><th>Name</th><th>Role</th><th>Level</th><th>Wage/day</th><th></th></tr></thead><tbody>');
        for (var i = 0; i < roster.length; i++) {
          var p = roster[i];
          if (!p) continue;
          var wage = (Game.Companies && typeof Game.Companies.getRetailStaffWageDaily === "function") ? Game.Companies.getRetailStaffWageDaily(p.role, p.level) : 0;
          body.push('<tr>');
          body.push('<td>' + (p.name || p.id) + '</td>');
          body.push('<td>' + roleLabel(p.role) + '</td>');
          body.push('<td class="mono">L' + (p.level || 1) + '</td>');
          body.push('<td class="mono">$' + wage.toFixed(0) + '</td>');
          body.push('<td><button class="btn btn-small btn-outline" data-modal-action="fire" data-staff-id="' + p.id + '">Fire</button></td>');
          body.push('</tr>');
        }
        body.push('</tbody></table>');
      }
      body.push('</div>');
  
      var overlay = UI.openModalCard({
        title: "Staff",
        sub: "Retail Shop",
        bodyHtml: body.join(""),
        large: true,
        actions: [{ id: "close", label: "Close", primary: false }],
        onAction: function (actionId, close) {
          if (actionId === "close") close();
        }
      });
      if (!overlay) return;
  
      overlay.addEventListener("click", function (e) {
        var btn = e.target && e.target.closest ? e.target.closest("[data-modal-action]") : null;
        if (!btn) return;
        var actionId = btn.getAttribute("data-modal-action");
        if (!actionId) return;
        if (actionId === "hire_clerk") {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UI.openRetailHireStaffModal("clerk");
          return;
        }
        if (actionId === "hire_manager") {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UI.openRetailHireStaffModal("manager");
          return;
        }
        if (actionId === "hire_driver") {
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          UI.openRetailHireStaffModal("driver");
          return;
        }
        if (actionId === "fire") {
          var id = btn.getAttribute("data-staff-id");
          if (!id) return;
          if (Game.Companies && typeof Game.Companies.fireRetailStaff === "function") {
            Game.Companies.fireRetailStaff(id);
          }
          if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
          if (document.getElementById("retail-manage-page")) UI.showRetailStockPage();
          UI.openRetailStaffModal();
        }
      });
    },
    showRetailStockPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderRetailStockPage();
      UI.bindRetailStockPageEvents();
    },
    bindRetailStockPageEvents: function () {
      // Manage Retail page bindings (legacy ordering UI below is retained but unreachable).
      if (document.getElementById("retail-manage-page")) {
        if (UI._retailManageLiveTimer) {
          clearInterval(UI._retailManageLiveTimer);
          UI._retailManageLiveTimer = null;
        }
        var backBtn2 = document.getElementById("btn-retail-back");
        if (backBtn2) {
          backBtn2.addEventListener("click", function () {
            UI.renderCurrentTab();
          });
        }
  
        var fundsBtn = document.getElementById("btn-retail-funds");
        if (fundsBtn) {
          fundsBtn.addEventListener("click", function () {
            UI.openRetailFundsModal();
          });
        }
        var fundsBtnAlt = document.getElementById("btn-retail-funds-alt");
        if (fundsBtnAlt) {
          fundsBtnAlt.addEventListener("click", function () {
            UI.openRetailFundsModal();
          });
        }
        var fundsBtn2 = document.getElementById("btn-retail-funds2");
        if (fundsBtn2) {
          fundsBtn2.addEventListener("click", function () {
            UI.openRetailFundsModal();
          });
        }
        var campaignsBtn = document.getElementById("btn-retail-campaigns");
        if (campaignsBtn) {
          campaignsBtn.addEventListener("click", function () {
            UI.openRetailCampaignsModal();
          });
        }
        var campaignsBtn2 = document.getElementById("btn-retail-campaigns2");
        if (campaignsBtn2) {
          campaignsBtn2.addEventListener("click", function () {
            UI.openRetailCampaignsModal();
          });
        }
        var invBtn = document.getElementById("btn-retail-inventory-modal");
        if (invBtn) {
          invBtn.addEventListener("click", function () {
            UI.openRetailInventoryModal();
          });
        }
        var delBtn = document.getElementById("btn-retail-active-deliveries");
        if (delBtn) {
          delBtn.addEventListener("click", function () {
            UI.openRetailInventoryModal({ showDeliveries: true });
          });
        }
        var staffBtn = document.getElementById("btn-retail-staff-modal");
        if (staffBtn) {
          staffBtn.addEventListener("click", function () {
            UI.openRetailStaffModal();
          });
        }
  
        // Live update the Active Deliveries snippet so ETAs tick down without reloading the page.
        UI._retailManageLiveTimer = setInterval(function () {
          var page = document.getElementById("retail-manage-page");
          if (!page) {
            if (UI._retailManageLiveTimer) clearInterval(UI._retailManageLiveTimer);
            UI._retailManageLiveTimer = null;
            return;
          }
          var container = document.getElementById("retail-active-deliveries-container");
          var shop = Game && Game.state && Game.state.companies ? Game.state.companies.retailShop : null;
          if (container && UI.renderRetailActiveDeliveriesHtml) {
            container.innerHTML = UI.renderRetailActiveDeliveriesHtml(shop);
          }
          var btn = document.getElementById("btn-retail-active-deliveries");
          if (btn) {
            var active = shop && Array.isArray(shop.pendingDeliveries) ? shop.pendingDeliveries.length : 0;
            btn.disabled = !active;
            btn.textContent = "Active deliveries (" + active + ")";
          }
        }, 1000);
  
        return;
      }
      var slider = document.getElementById("retail-batches");
      var unitsEl = document.getElementById("retail-total-units");
      var costEl = document.getElementById("retail-total-cost");
      var options = Game.Companies.retailStockOptions || [];
      var currentOptionId = null;
      if (options.length > 0) {
        currentOptionId = (options[1] || options[0]).id;
      }
      var optionInputs = document.querySelectorAll('input[name="retail-option"]');
      for (var oi = 0; oi < optionInputs.length; oi++) {
        if (optionInputs[oi].checked) {
          currentOptionId = optionInputs[oi].value;
        }
        optionInputs[oi].addEventListener("change", function () {
          currentOptionId = this.value;
          updateSummary();
        });
      }
      function updateSummary() {
        if (!slider || !unitsEl || !costEl) return;
        var batches = parseInt(slider.value, 10);
        if (isNaN(batches) || batches < 1) batches = 1;
        var opt = null;
        for (var i = 0; i < options.length; i++) {
          if (options[i].id === currentOptionId) {
            opt = options[i];
            break;
          }
        }
        if (!opt && options.length > 0) {
          opt = options[1] || options[0];
        }
        var baseSize = opt ? opt.batchSize : 80;
        var unitPrice = opt ? opt.unitPrice : 4;
        var totalUnits = baseSize * batches;
        var totalCost = totalUnits * unitPrice;
        unitsEl.textContent = totalUnits + " units";
        costEl.textContent = "$" + totalCost.toFixed(2);
      }
      if (slider) {
        slider.addEventListener("input", updateSummary);
        updateSummary();
      }
        var backBtn = document.getElementById("btn-retail-back");
        if (backBtn) {
          backBtn.addEventListener("click", function () {
            UI.renderCurrentTab();
          });
        }
        var confirmBtn = document.getElementById("btn-retail-confirm");
        if (confirmBtn) {
          confirmBtn.addEventListener("click", function () {
            if (!Game || !Game.Companies || !Game.Companies.orderRetailStock) return;
            var shop = Game.state && Game.state.companies ? Game.state.companies.retailShop : null;
            if (!shop) return;
  
            var batches = slider ? parseInt(slider.value, 10) : 1;
            if (isNaN(batches) || batches < 1) batches = 1;
            var optId = currentOptionId || (options[1] || options[0] || { id: "standard" }).id;
            var opt = null;
            for (var i = 0; i < options.length; i++) {
              if (options[i].id === optId) {
                opt = options[i];
                break;
              }
            }
            if (!opt) opt = options[1] || options[0] || { id: optId, name: optId, batchSize: 0, unitPrice: 0, leadDays: 0 };
  
            var totalUnits = (opt.batchSize || 0) * batches;
            var totalCost = totalUnits * (opt.unitPrice || 0);
            var arrivalDay = (Game.state && typeof Game.state.day === "number") ? (Game.state.day + (opt.leadDays || 0)) : (1 + (opt.leadDays || 0));
            var beforeFunds = (typeof shop.funds === "number" && isFinite(shop.funds)) ? shop.funds : 0;
            var afterFunds = beforeFunds - totalCost;
  
            var body = [];
            body.push('<div class="card-section small">');
            body.push('<div class="field-row"><span>Option</span><span>' + String(opt.name || opt.id || optId) + '</span></div>');
            body.push('<div class="field-row"><span>Batches</span><span class="mono">' + batches + '</span></div>');
            body.push('<div class="field-row"><span>Total units</span><span class="mono">' + totalUnits + '</span></div>');
            body.push('<div class="field-row"><span>Total cost</span><span class="mono">$' + totalCost.toFixed(2) + '</span></div>');
            body.push('<div class="field-row"><span>Arrival</span><span>Day ' + arrivalDay + ' <span class="small dim">(' + UI.getDeliveryEtaLabel(arrivalDay) + ')</span></span></div>');
            body.push('<div class="field-row"><span>Business funds</span><span class="mono">$' + beforeFunds.toFixed(2) + ' \u2192 $' + afterFunds.toFixed(2) + '</span></div>');
            if (beforeFunds < totalCost) {
              body.push('<div class="notice mt-8">Not enough retail business funds for this order. Deposit funds first.</div>');
            } else {
              body.push('<div class="notice mt-8">This will deduct from Retail Shop business funds and schedule a delivery.</div>');
            }
            body.push('</div>');
  
            UI.confirmModal({
              title: "Confirm retail order",
              sub: "Retail Shop \u2013 " + String(opt.name || opt.id || optId),
              confirmLabel: "Place order",
              bodyHtml: body.join(""),
              onConfirm: function () {
                var before = (typeof shop.funds === "number" && isFinite(shop.funds)) ? shop.funds : 0;
                Game.Companies.orderRetailStock(optId, batches);
                UI.showRetailStockPage();
                var after = (typeof shop.funds === "number" && isFinite(shop.funds)) ? shop.funds : before;
                if (window.UI && UI.animateNumber && after !== before) {
                  var el = document.getElementById("retail-summary-money");
                  if (el) {
                    el.textContent = "$" + before.toFixed(2);
                    UI.animateNumber("retailFunds", after);
                  }
                }
              }
            });
          });
        }
        var retailDepositInput = document.getElementById("retail-deposit");
        var retailDepositBtn = document.getElementById("btn-retail-deposit");
        if (retailDepositBtn && retailDepositInput) {
          retailDepositBtn.addEventListener("click", function () {
            var before = Game.state.companies.retailShop.funds || 0;
            var val = parseFloat(retailDepositInput.value);
            Game.Companies.depositRetailFunds(val);
            UI.showRetailStockPage();
            var after = Game.state.companies.retailShop.funds || 0;
            if (window.UI && UI.animateNumber && after !== before) {
              var el = document.getElementById("retail-summary-money");
              if (el) {
                el.textContent = "$" + before.toFixed(2);
                UI.animateNumber("retailFunds", after);
              }
            }
          });
        }
        var retailWithdrawInput = document.getElementById("retail-withdraw");
        var retailWithdrawBtn = document.getElementById("btn-retail-withdraw");
        if (retailWithdrawBtn && retailWithdrawInput) {
          retailWithdrawBtn.addEventListener("click", function () {
            var before = Game.state.companies.retailShop.funds || 0;
            var val = parseFloat(retailWithdrawInput.value);
            Game.Companies.withdrawRetailFunds(val);
            UI.showRetailStockPage();
            var after = Game.state.companies.retailShop.funds || 0;
            if (window.UI && UI.animateNumber && after !== before) {
              var el = document.getElementById("retail-summary-money");
              if (el) {
                el.textContent = "$" + before.toFixed(2);
                UI.animateNumber("retailFunds", after);
              }
            }
          });
        }
        var retailAutoPayout = document.getElementById("retail-auto-payout");
        if (retailAutoPayout && Game.state && Game.state.companies && Game.state.companies.retailShop) {
          retailAutoPayout.checked = !!Game.state.companies.retailShop.autoPayoutToWallet;
          retailAutoPayout.addEventListener("change", function () {
            Game.state.companies.retailShop.autoPayoutToWallet = !!this.checked;
          });
        }
    },
    updateCompaniesDynamic: function () {
      var c = Game.state.companies;
      var isRetailStockPage = !!document.getElementById("retail-manage-page");
      var isCompaniesOverview = !!document.getElementById("btn-retail-stock");
      var isMiningCorpPage = !!document.getElementById("miningcorp-page");
      var isRailPage = !!document.getElementById("rail-page");
      var isNetCafePage = !!document.getElementById("netcafe-page");
      var isCourierPage = !!document.getElementById("courier-page");
      var isRecyclingPage = !!document.getElementById("recycling-page");
  
      function isTweenActive(tween) {
        try {
          if (!tween) return false;
          if (typeof tween.isActive === "function") return !!tween.isActive();
          if (typeof tween.progress === "function") {
            var p = tween.progress();
            return (typeof p === "number" && isFinite(p) && p < 1);
          }
        } catch (e) {}
        return false;
      }
  
      function isUserEditingInside(el) {
        try {
          var ae = document.activeElement;
          if (!ae || !el || !el.contains(ae)) return false;
          var tag = String(ae.tagName || "").toUpperCase();
          if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
          return !!ae.isContentEditable;
        } catch (e) {
          return false;
        }
      }
  
      if (isMiningCorpPage) {
        if (Game.Companies && typeof Game.Companies.ensureMiningMines === "function") Game.Companies.ensureMiningMines();
        if (Game.Companies && typeof Game.Companies.ensureMiningContracts === "function") Game.Companies.ensureMiningContracts();
        var m = c.miningCorp || {};
  
        var fundsEl = document.getElementById("mining-funds");
        if (fundsEl) {
          var miningTween = (typeof gsap !== "undefined" && UI._animTweens && isTweenActive(UI._animTweens.miningFunds));
          if (!miningTween) fundsEl.textContent = "$" + ((m.funds || 0).toFixed(2));
        }
        var minesCountEl = document.getElementById("mining-owned-mines");
        if (minesCountEl) minesCountEl.textContent = String(Array.isArray(m.mines) ? m.mines.length : 0);
        var oreEl = document.getElementById("mining-ore");
        if (oreEl) oreEl.textContent = ((m.oreStock || 0).toFixed(1)) + " t";
  
        var unit = (Game.Companies && typeof Game.Companies.getOreUnitPrice === "function") ? Game.Companies.getOreUnitPrice() : 0;
        if (typeof unit !== "number" || !isFinite(unit) || unit < 0) unit = 0;
        var unitEl = document.getElementById("mining-unit-price");
        if (unitEl) unitEl.textContent = unit.toFixed(2);
  
        var total = (Game.Companies && typeof Game.Companies.getOreTotalPrice === "function") ? Game.Companies.getOreTotalPrice() : 0;
        if (typeof total !== "number" || !isFinite(total) || total < 0) total = 0;
        var totalEl = document.getElementById("mining-total-price");
        if (totalEl) totalEl.textContent = total.toFixed(0);
  
        var payrollEl = document.getElementById("mining-payroll-in");
        if (payrollEl) {
          var pIn = (typeof m.daysUntilPayroll === "number" && isFinite(m.daysUntilPayroll)) ? m.daysUntilPayroll : (m.daysUntilPayroll || 0);
          payrollEl.textContent = String(pIn);
        }
        var moraleEl = document.getElementById("mining-morale");
        if (moraleEl) {
          var morale = (typeof m.morale === "number" && isFinite(m.morale)) ? m.morale : 70;
          if (morale < 0) morale = 0;
          if (morale > 100) morale = 100;
          moraleEl.textContent = morale.toFixed(0) + "%";
        }
        var logisticsEl = document.getElementById("mining-logistics");
        if (logisticsEl) {
          var logisticsMult = (Game.Companies && typeof Game.Companies.getMiningLogisticsMultiplier === "function") ? Game.Companies.getMiningLogisticsMultiplier() : 1;
          if (typeof logisticsMult !== "number" || !isFinite(logisticsMult) || logisticsMult < 1) logisticsMult = 1;
          var logisticsPct = (logisticsMult - 1) * 100;
          logisticsEl.textContent = logisticsPct.toFixed(1) + "%";
        }
  
        var detail = (m.oreDetail && typeof m.oreDetail === "object") ? m.oreDetail : { iron: 0, copper: 0, silver: 0, gold: 0 };
        var feEl = document.getElementById("mining-ore-iron");
        if (feEl) feEl.textContent = (detail.iron || 0).toFixed(1);
        var cuEl = document.getElementById("mining-ore-copper");
        if (cuEl) cuEl.textContent = (detail.copper || 0).toFixed(1);
        var agEl = document.getElementById("mining-ore-silver");
        if (agEl) agEl.textContent = (detail.silver || 0).toFixed(1);
        var auEl = document.getElementById("mining-ore-gold");
        if (auEl) auEl.textContent = (detail.gold || 0).toFixed(1);
  
        var autoSell = (m.autoSell && typeof m.autoSell === "object") ? m.autoSell : { iron: false, copper: false, silver: false, gold: false };
        var autoSellToggles = document.querySelectorAll(".mining-auto-sell-toggle");
        for (var i = 0; i < autoSellToggles.length; i++) {
          var t = autoSellToggles[i];
          if (!t) continue;
          var ore = String(t.getAttribute("data-ore") || "");
          if (!ore) continue;
          t.checked = !!autoSell[ore];
        }
        var autoPayoutToggle = document.getElementById("mining-auto-payout");
        if (autoPayoutToggle) autoPayoutToggle.checked = !!m.autoPayoutToWallet;
        var autoReserveInput = document.getElementById("mining-auto-reserve");
        if (autoReserveInput) {
          var reserve = (typeof m.autoPayoutReserve === "number" && isFinite(m.autoPayoutReserve) && m.autoPayoutReserve >= 0) ? m.autoPayoutReserve : 0;
          if (String(autoReserveInput.value || "") !== String(reserve.toFixed(0))) autoReserveInput.value = reserve.toFixed(0);
        }
  
        var staffSpans = document.querySelectorAll(".mining-mine-staff");
        var staffPerMine = (m.staffPerMine && typeof m.staffPerMine === "object") ? m.staffPerMine : {};
        for (var ssi = 0; ssi < staffSpans.length; ssi++) {
          var sEl = staffSpans[ssi];
          if (!sEl) continue;
          var mid = String(sEl.getAttribute("data-mine") || "");
          if (!mid) continue;
          sEl.textContent = String(staffPerMine[mid] || 0);
        }
        var machineSpans = document.querySelectorAll(".mining-mine-machines");
        var machinesPerMine = (m.machinesPerMine && typeof m.machinesPerMine === "object") ? m.machinesPerMine : {};
        for (var msi = 0; msi < machineSpans.length; msi++) {
          var mEl = machineSpans[msi];
          if (!mEl) continue;
          var mid2 = String(mEl.getAttribute("data-mine") || "");
          if (!mid2) continue;
          mEl.textContent = String(machinesPerMine[mid2] || 0);
        }
  
        return;
      }
  
      if (isRailPage) {
        if (Game.Companies && typeof Game.Companies.ensureRailLogisticsState === "function") Game.Companies.ensureRailLogisticsState();
        var r = c.railLogistics || {};
  
        var railFundsEl = document.getElementById("rail-funds");
        if (railFundsEl) {
          var railTween = (typeof gsap !== "undefined" && UI._animTweens && isTweenActive(UI._animTweens.railFunds));
          if (!railTween) railFundsEl.textContent = "$" + ((r.funds || 0).toFixed(2));
        }
        var hqEl = document.getElementById("rail-hq");
        if (hqEl) hqEl.textContent = String(r.hqLocation || "London");
        var trainsEl = document.getElementById("rail-trains");
        if (trainsEl) trainsEl.textContent = String((r.fleet && r.fleet.length) ? r.fleet.length : 0);
        var dispEl = document.getElementById("rail-dispatchers");
        if (dispEl) dispEl.textContent = String((r.staff && typeof r.staff.dispatchers === "number" && isFinite(r.staff.dispatchers)) ? r.staff.dispatchers : 0);
        var maintEl = document.getElementById("rail-maintenance");
        if (maintEl) maintEl.textContent = String((r.staff && typeof r.staff.maintenance === "number" && isFinite(r.staff.maintenance)) ? r.staff.maintenance : 0);
        var activeEl = document.getElementById("rail-active-runs");
        if (activeEl) activeEl.textContent = String(Array.isArray(r.activeRuns) ? r.activeRuns.length : 0);
  
        var pageEl = document.getElementById("rail-page");
        var fleet = Array.isArray(r.fleet) ? r.fleet : [];
        var fleetById = {};
        for (var fi = 0; fi < fleet.length; fi++) {
          var trn = fleet[fi];
          if (trn && trn.id) fleetById[String(trn.id)] = trn;
        }
        var runs = Array.isArray(r.activeRuns) ? r.activeRuns : [];
        var runByTrain = {};
        for (var ri = 0; ri < runs.length; ri++) {
          var run = runs[ri];
          if (run && run.trainId) runByTrain[String(run.trainId)] = run;
        }
        var rows = document.querySelectorAll(".rail-fleet-row");
        var missingTrain = false;
        for (var rri = 0; rri < rows.length; rri++) {
          var row = rows[rri];
          if (!row) continue;
          var tid = String(row.getAttribute("data-train") || "");
          if (!tid) continue;
          var train = fleetById[tid] || null;
          if (!train) { missingTrain = true; continue; }
          var activeRun = runByTrain[tid] || null;
  
          var statusEl = row.querySelector(".rail-train-status");
          if (statusEl) statusEl.textContent = activeRun ? "IN TRANSIT" : "IDLE";
  
          var emptyWt = (Game.Companies && typeof Game.Companies.getTrainEmptyWeightTons === "function") ? Game.Companies.getTrainEmptyWeightTons(train) : 0;
          var maxSpeed = (Game.Companies && typeof Game.Companies.getTrainProjectedSpeedKmh === "function") ? Game.Companies.getTrainProjectedSpeedKmh(train, 0) : 0;
          var speedEl = row.querySelector(".rail-train-speed");
          if (speedEl) speedEl.textContent = maxSpeed ? (maxSpeed + " km/h") : "-";
          var weightEl = row.querySelector(".rail-train-weight");
          if (weightEl) weightEl.textContent = emptyWt ? (emptyWt.toFixed(1) + " t") : "-";
  
          var etaEl = row.querySelector(".rail-train-eta");
          var covEl = row.querySelector(".rail-train-covered");
          var remEl = row.querySelector(".rail-train-remaining");
          if (!activeRun) {
            if (etaEl) etaEl.textContent = "-";
            if (covEl) covEl.textContent = "-";
            if (remEl) remEl.textContent = "-";
          } else {
            var left = activeRun.minutesLeft || 0;
            if (etaEl) etaEl.textContent = Math.max(0, Math.ceil(left)) + "m";
            var dist = (typeof activeRun.distanceKm === "number" && isFinite(activeRun.distanceKm)) ? activeRun.distanceKm : 0;
            var distLeft = (typeof activeRun.distanceLeftKm === "number" && isFinite(activeRun.distanceLeftKm)) ? activeRun.distanceLeftKm : null;
            var covered = "-";
            var remaining = "-";
            if (dist > 0) {
              var cov = 0;
              if (distLeft !== null) cov = Math.max(0, Math.min(dist, dist - distLeft));
              else {
                var totalMin = activeRun.minutesTotal || 1;
                if (totalMin > 0) {
                  var pct = Math.max(0, Math.min(1, (totalMin - left) / totalMin));
                  cov = dist * pct;
                }
              }
              var rem = Math.max(0, dist - cov);
              covered = cov.toFixed(1) + " km";
              remaining = rem.toFixed(1) + " km";
            }
            if (covEl) covEl.textContent = covered;
            if (remEl) remEl.textContent = remaining;
          }
        }
  
        if ((missingTrain || (rows.length !== fleet.length)) && !UI._companiesAutoRerender) {
          if (!isUserEditingInside(pageEl)) {
            UI._companiesAutoRerender = true;
            UI.showRailLogisticsPage();
            UI._companiesAutoRerender = false;
          }
        }
        return;
      }
  
      if (isNetCafePage) {
        if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
        if (Game.Net && typeof Game.Net.ensure === "function") Game.Net.ensure();
        if (Game.PC && typeof Game.PC.ensureState === "function") Game.PC.ensureState();
        var n = c.netCafe;
        var fundsEl = document.getElementById("netcafe-page-funds");
        if (fundsEl) fundsEl.textContent = "$" + (n.funds || 0).toFixed(2);
        var seatsEl = document.getElementById("netcafe-page-seats");
        if (seatsEl) seatsEl.textContent = String(n.seats || 0);
        var netEl = document.getElementById("netcafe-page-net");
        if (netEl && Game.Net && typeof Game.Net.getEffectiveMbps === "function") {
          var eff = Game.Net.getEffectiveMbps();
          if (typeof eff !== "number" || !isFinite(eff) || eff < 0) eff = 0;
          netEl.textContent = eff.toFixed(2);
        }
        var popEl = document.getElementById("netcafe-page-pop");
        if (popEl) {
          var pop = (typeof n.popularity === "number" && isFinite(n.popularity)) ? n.popularity : 0;
          if (pop < 0) pop = 0;
          if (pop > 100) pop = 100;
          popEl.textContent = pop.toFixed(0);
        }
        var priceEl = document.getElementById("netcafe-page-price");
        if (priceEl) {
          var price = (typeof n.pricePerCustomer === "number" && isFinite(n.pricePerCustomer)) ? n.pricePerCustomer : 2.5;
          if (price <= 0) price = 2.5;
          priceEl.textContent = price.toFixed(1);
        }
        var demandBar = document.getElementById("netcafe-demand-bar");
        var demandLabel = document.getElementById("netcafe-demand-label");
        if (demandBar || demandLabel) {
          var mbps = (Game.Net && typeof Game.Net.getEffectiveMbps === "function") ? Game.Net.getEffectiveMbps() : 0;
          if (typeof mbps !== "number" || !isFinite(mbps) || mbps < 0) mbps = 0;
          var d = 0.6 + Math.min(1.6, Math.sqrt(mbps) / 2);
          if (!isFinite(d) || d < 0.2) d = 0.2;
          if (d > 2.4) d = 2.4;
          if (demandLabel) demandLabel.textContent = d.toFixed(2);
          if (demandBar) {
            var pctD = Math.floor(((d - 0.2) / (2.4 - 0.2)) * 100);
            if (pctD < 0) pctD = 0;
            if (pctD > 100) pctD = 100;
            demandBar.style.width = pctD + "%";
          }
        }
        var seatCostEl = document.getElementById("netcafe-seat-cost");
        var buySeatBtn = document.getElementById("btn-netcafe-buy-seat");
        var seatCost = 0;
        if (Game.Companies && typeof Game.Companies.getNetCafeNextSeatCost === "function") {
          seatCost = Game.Companies.getNetCafeNextSeatCost();
          if (typeof seatCost !== "number" || !isFinite(seatCost) || seatCost < 0) seatCost = 0;
        }
        if (seatCostEl) seatCostEl.textContent = seatCost.toFixed(0);
        if (buySeatBtn) buySeatBtn.disabled = !n.unlocked || !(seatCost > 0) || (n.funds || 0) < seatCost;
        var xpEl = document.getElementById("netcafe-page-xp");
        var xpBar = document.getElementById("netcafe-page-xpbar");
        if (xpEl || xpBar) {
          var thresholdN = 300 + (n.level || 0) * 250;
          if (typeof thresholdN !== "number" || !isFinite(thresholdN) || thresholdN <= 0) thresholdN = 300;
          var xpN = (typeof n.xp === "number" && isFinite(n.xp) && n.xp > 0) ? n.xp : 0;
          if (xpEl) xpEl.textContent = xpN.toFixed(0) + " / " + thresholdN.toFixed(0);
          if (xpBar) {
            var pctN = thresholdN > 0 ? Math.floor((xpN / thresholdN) * 100) : 0;
            if (pctN < 0) pctN = 0;
            if (pctN > 100) pctN = 100;
            xpBar.style.width = pctN + "%";
          }
        }
        var todayEl = document.getElementById("netcafe-page-today");
        var yestEl = document.getElementById("netcafe-page-yesterday");
        if ((todayEl || yestEl) && n.stats) {
          var st = n.stats;
          var tProfit = (st.todayRevenue || 0) - (st.todayCost || 0);
          var yProfit = (st.yesterdayRevenue || 0) - (st.yesterdayCost || 0);
          if (todayEl) todayEl.textContent = (st.todayCustomers || 0).toFixed(0) + " cust | $" + (st.todayRevenue || 0).toFixed(0) + " rev | $" + tProfit.toFixed(0) + " profit";
          if (yestEl) yestEl.textContent = (st.yesterdayCustomers || 0).toFixed(0) + " cust | $" + (st.yesterdayRevenue || 0).toFixed(0) + " rev | $" + yProfit.toFixed(0) + " profit";
        }
        return;
      }
  
      if (isCourierPage) {
        if (Game.Companies && typeof Game.Companies.ensureCourierState === "function") Game.Companies.ensureCourierState();
        var co = c.courierCo;
        var fundsEl2 = document.getElementById("courier-page-funds");
        if (fundsEl2) fundsEl2.textContent = "$" + (co.funds || 0).toFixed(2);
        var fleetEl = document.getElementById("courier-page-fleet");
        if (fleetEl) fleetEl.textContent = (co.vans || 0) + " / " + (co.drivers || 0);
        var offersEl = document.getElementById("courier-page-offers");
        var queuedEl = document.getElementById("courier-page-queued");
        var activeEl = document.getElementById("courier-page-active");
        if (offersEl) offersEl.textContent = String(Array.isArray(co.offers) ? co.offers.length : 0);
        if (queuedEl) queuedEl.textContent = String(Array.isArray(co.orders) ? co.orders.length : 0);
        if (activeEl) activeEl.textContent = String(Array.isArray(co.activeRuns) ? co.activeRuns.length : 0);
        var capEl = document.getElementById("courier-page-capacity");
        if (capEl) capEl.textContent = String(Math.max(0, Math.min(co.vans || 0, co.drivers || 0)));
        var dtEl = document.getElementById("courier-page-delivered-today");
        if (dtEl) dtEl.textContent = String((co.stats && typeof co.stats.deliveredToday === "number" && isFinite(co.stats.deliveredToday)) ? Math.floor(co.stats.deliveredToday) : 0);
        var dyEl = document.getElementById("courier-page-delivered-yesterday");
        if (dyEl) dyEl.textContent = String((co.stats && typeof co.stats.deliveredYesterday === "number" && isFinite(co.stats.deliveredYesterday)) ? Math.floor(co.stats.deliveredYesterday) : 0);
        var dispatchBtn = document.getElementById("btn-courier-dispatch");
        if (dispatchBtn) {
          var cap = Math.max(0, Math.min(co.vans || 0, co.drivers || 0));
          var q = Array.isArray(co.orders) ? co.orders.length : 0;
          var a = Array.isArray(co.activeRuns) ? co.activeRuns.length : 0;
          dispatchBtn.disabled = !co.unlocked || cap <= 0 || q <= 0 || a >= cap;
        }
        var xpEl2 = document.getElementById("courier-page-xp");
        var xpBar2 = document.getElementById("courier-page-xpbar");
        if (xpEl2 || xpBar2) {
          var thresholdC = 250 + (co.level || 0) * 200;
          if (typeof thresholdC !== "number" || !isFinite(thresholdC) || thresholdC <= 0) thresholdC = 250;
          var xpC = (typeof co.xp === "number" && isFinite(co.xp) && co.xp > 0) ? co.xp : 0;
          if (xpEl2) xpEl2.textContent = xpC.toFixed(0) + " / " + thresholdC.toFixed(0);
          if (xpBar2) {
            var pctC = thresholdC > 0 ? Math.floor((xpC / thresholdC) * 100) : 0;
            if (pctC < 0) pctC = 0;
            if (pctC > 100) pctC = 100;
            xpBar2.style.width = pctC + "%";
          }
        }
        var runBars = document.querySelectorAll(".courier-run-bar");
        var runEtas = document.querySelectorAll(".courier-run-eta");
        if ((runBars && runBars.length) || (runEtas && runEtas.length)) {
          var runs = Array.isArray(co.activeRuns) ? co.activeRuns : [];
          function getRun(id) {
            for (var i = 0; i < runs.length; i++) {
              if (runs[i] && runs[i].id === id) return runs[i];
            }
            return null;
          }
          var missingRun = false;
          for (var rb = 0; rb < runBars.length; rb++) {
            var elB = runBars[rb];
            var idB = elB.getAttribute("data-run");
            var run = getRun(idB);
            if (!run) { missingRun = true; continue; }
            var tot = run.totalMinutes || 1;
            var rem = run.remainingMinutes || 0;
            if (!(tot > 0)) tot = 1;
            var done = tot - rem;
            if (done < 0) done = 0;
            if (done > tot) done = tot;
            var pct3 = Math.floor((done / tot) * 100);
            if (pct3 < 0) pct3 = 0;
            if (pct3 > 100) pct3 = 100;
            elB.style.width = pct3 + "%";
          }
          for (var re = 0; re < runEtas.length; re++) {
            var elE = runEtas[re];
            var idE = elE.getAttribute("data-run");
            var run2 = getRun(idE);
            if (!run2) { missingRun = true; continue; }
            var eta = Math.max(0, Math.ceil(run2.remainingMinutes || 0));
            var hh = Math.floor(eta / 60);
            var mm = eta % 60;
            elE.textContent = "ETA " + hh + ":" + (mm < 10 ? "0" + mm : mm);
          }
          if (missingRun && !UI._companiesAutoRerender) {
            UI._companiesAutoRerender = true;
            UI.showCourierPage();
            UI._companiesAutoRerender = false;
            return;
          }
        }
        return;
      }
  
      if (isRecyclingPage) {
        if (Game.Companies && typeof Game.Companies.ensureRecyclingState === "function") Game.Companies.ensureRecyclingState();
        var rc = c.recyclingCo;
        var fundsEl3 = document.getElementById("recycle-page-funds");
        if (fundsEl3) fundsEl3.textContent = "$" + (rc.funds || 0).toFixed(2);
        var teamEl = document.getElementById("recycle-page-team");
        if (teamEl) teamEl.textContent = (rc.machines || 0) + " / " + (rc.staff || 0);
        var scrapEl = document.getElementById("recycle-page-scrap");
        if (scrapEl) scrapEl.textContent = (rc.scrapKg || 0).toFixed(0) + " kg";
        var overheadEl = document.getElementById("recycle-page-overhead");
        if (overheadEl) {
          var oh = (rc.staff || 0) * 25 + (rc.machines || 0) * 6 + 8;
          if (typeof oh !== "number" || !isFinite(oh) || oh < 0) oh = 0;
          overheadEl.textContent = oh.toFixed(0);
        }
        var todayEl2 = document.getElementById("recycle-page-today");
        var yestEl2 = document.getElementById("recycle-page-yesterday");
        if (todayEl2 && rc.stats) todayEl2.textContent = (rc.stats.processedTodayKg || 0).toFixed(0) + " kg";
        if (yestEl2 && rc.stats) yestEl2.textContent = (rc.stats.processedYesterdayKg || 0).toFixed(0) + " kg";
        var xpEl3 = document.getElementById("recycle-page-xp");
        var xpBar3 = document.getElementById("recycle-page-xpbar");
        if (xpEl3 || xpBar3) {
          var thresholdR = 400 + (rc.level || 0) * 300;
          if (typeof thresholdR !== "number" || !isFinite(thresholdR) || thresholdR <= 0) thresholdR = 400;
          var xpR = (typeof rc.xp === "number" && isFinite(rc.xp) && rc.xp > 0) ? rc.xp : 0;
          if (xpEl3) xpEl3.textContent = xpR.toFixed(0) + " / " + thresholdR.toFixed(0);
          if (xpBar3) {
            var pctR = thresholdR > 0 ? Math.floor((xpR / thresholdR) * 100) : 0;
            if (pctR < 0) pctR = 0;
            if (pctR > 100) pctR = 100;
            xpBar3.style.width = pctR + "%";
          }
        }
        var batchBar = document.getElementById("recycle-batch-bar");
        var batchLabel = document.getElementById("recycle-page-batch-label");
        var startBtn = document.getElementById("btn-recycle-start");
        var batchKg = document.getElementById("recycle-batch-kg");
        var pct5 = 0;
        var label = "Idle";
        if (rc.activeBatch) {
          var tot2 = rc.activeBatch.totalMinutes || 1;
          var rem2 = rc.activeBatch.remainingMinutes || 0;
          if (!(tot2 > 0)) tot2 = 1;
          var done2 = tot2 - rem2;
          if (done2 < 0) done2 = 0;
          if (done2 > tot2) done2 = tot2;
          pct5 = Math.floor((done2 / tot2) * 100);
          if (pct5 < 0) pct5 = 0;
          if (pct5 > 100) pct5 = 100;
          var eta2 = Math.max(0, Math.ceil(rem2));
          var hh2 = Math.floor(eta2 / 60);
          var mm2 = eta2 % 60;
          var kg2 = (typeof rc.activeBatch.kg === "number" && isFinite(rc.activeBatch.kg)) ? rc.activeBatch.kg : 0;
          label = (kg2 ? (kg2.toFixed(0) + " kg") : "Batch") + " â€¢ ETA " + hh2 + ":" + (mm2 < 10 ? "0" + mm2 : mm2);
        }
        if (batchBar) batchBar.style.width = pct5 + "%";
        if (batchLabel) batchLabel.textContent = label;
        var canStart = !!rc.unlocked && !rc.activeBatch && (rc.scrapKg || 0) >= 50 && (rc.machines || 0) > 0 && (rc.staff || 0) > 0;
        if (startBtn) startBtn.disabled = !canStart;
        if (batchKg) batchKg.disabled = !canStart;
        return;
      }
  
      // When we're on the companies overview, some sections (progress bars / button disabled states) require a rerender
      // when they appear/disappear (contract start/end, drilling start/end). Avoid disrupting the retail stock page.
      if (isCompaniesOverview && !isRetailStockPage && !UI._companiesAutoRerender) {
        var shouldShowRailBar = !!(c.railLogistics && c.railLogistics.activeContract);
        var hasRailBar = !!document.getElementById("rail-contract-bar");
        var shouldShowOreBar = !!(c.miningCorp && c.miningCorp.activeRunMinutes > 0);
        var hasOreBar = !!document.getElementById("ore-run-bar");
        if (hasRailBar !== shouldShowRailBar || hasOreBar !== shouldShowOreBar) {
          UI._companiesAutoRerender = true;
          UI.renderCurrentTab();
          UI._companiesAutoRerender = false;
          return;
        }
      }
  
      // When managing retail, only update the retail UI elements to avoid overwriting the page content.
      if (isRetailStockPage) {
        var shop = c.retailShop;
        var sumStatus = document.getElementById("retail-summary-status");
        var sumLevel = document.getElementById("retail-summary-level");
        var sumXp = document.getElementById("retail-summary-xp");
        var sumStock = document.getElementById("retail-summary-stock");
        var sumInv = document.getElementById("retail-summary-inv");
        var sumPop = document.getElementById("retail-summary-popularity");
        var sumMoney = document.getElementById("retail-summary-money");
        var sumPayroll = document.getElementById("retail-summary-payroll");
        var sumCampaign = document.getElementById("retail-summary-campaign");
        if (sumStatus) sumStatus.textContent = shop.unlocked ? "Unlocked" : "Locked";
        if (sumLevel) sumLevel.textContent = String(shop.level || 0);
        if (sumStock) sumStock.textContent = (shop.stock || 0).toFixed(0) + " units";
        if (sumPop) sumPop.textContent = (shop.popularity || 0).toFixed(0) + "%";
        if (sumMoney) {
          var retailTween = (typeof gsap !== "undefined" && UI._animTweens && UI._animTweens.retailFunds);
          if (!retailTween) sumMoney.textContent = "$" + (shop.funds || 0).toFixed(2);
        }
        if (sumPayroll && Game.Companies && typeof Game.Companies.getRetailDailyPayroll === "function") {
          var rp = Game.Companies.getRetailDailyPayroll(shop);
          if (typeof rp !== "number" || !isFinite(rp) || rp < 0) rp = 0;
          sumPayroll.textContent = "$" + rp.toFixed(0);
        }
        if (sumInv) {
          var invU = shop.inventory && shop.inventory.units ? shop.inventory.units : {};
          var invC = shop.inventory && shop.inventory.costBasis ? shop.inventory.costBasis : {};
          var sku = 0;
          var cost = 0;
          for (var id in invU) {
            if (!Object.prototype.hasOwnProperty.call(invU, id)) continue;
            var q = invU[id];
            if (typeof q !== "number" || !isFinite(q) || q <= 0) continue;
            sku += 1;
            var cb = invC[id];
            if (typeof cb === "number" && isFinite(cb) && cb > 0) cost += cb;
          }
          sumInv.textContent = sku + " SKUs | $" + cost.toFixed(0) + " cost";
        }
        if (sumXp) {
          var threshold = 900 + (shop.level || 0) * 350;
          if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 900;
          var xp = (typeof shop.xp === "number" && isFinite(shop.xp) && shop.xp > 0) ? shop.xp : 0;
          sumXp.textContent = xp.toFixed(0) + " / " + threshold.toFixed(0);
        }
        if (sumCampaign) {
          var label = "None";
          if (shop.campaign && typeof shop.campaign === "object") {
            var chan = String(shop.campaign.channel || "");
            var rem = (typeof shop.campaign.daysRemaining === "number" && isFinite(shop.campaign.daysRemaining)) ? Math.floor(shop.campaign.daysRemaining) : 0;
            var cdef = (Game.Companies && typeof Game.Companies.getRetailCampaignDef === "function") ? Game.Companies.getRetailCampaignDef(chan) : null;
            var nm = cdef && cdef.name ? cdef.name : (chan || "Campaign");
            label = nm + " (" + rem + "d)";
          }
          sumCampaign.textContent = label;
        }
  
        var rStats = shop.stats || { todayUnits: 0, todayRevenue: 0, todayCost: 0, todayPayroll: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0, yesterdayPayroll: 0 };
        var tUnits = rStats.todayUnits || 0;
        var tRevenue = rStats.todayRevenue || 0;
        var tCost = rStats.todayCost || 0;
        var tPayroll = rStats.todayPayroll || 0;
        var tProfit = tRevenue - tCost - tPayroll;
        var yUnits = rStats.yesterdayUnits || 0;
        var yRevenue = rStats.yesterdayRevenue || 0;
        var yCost = rStats.yesterdayCost || 0;
        var yPayroll = rStats.yesterdayPayroll || 0;
        var yProfit = yRevenue - yCost - yPayroll;
  
        var todaySalesEl = document.getElementById("retail-summary-today-sales");
        if (todaySalesEl) todaySalesEl.textContent = tUnits.toFixed(0) + " units | $" + tRevenue.toFixed(0) + " revenue | $" + tProfit.toFixed(0) + " profit";
        var yesterdayEl = document.getElementById("retail-summary-yesterday");
        if (yesterdayEl) yesterdayEl.textContent = yUnits.toFixed(0) + " units | $" + yRevenue.toFixed(0) + " revenue | $" + yProfit.toFixed(0) + " profit";
  
        return;
      }
  
      // Rail Logistics (only has IDs on the overview card).
      var railStatus = document.getElementById("rail-status");
      var railLevel = document.getElementById("rail-level");
      var railRep = document.getElementById("rail-reputation");
      var railFunds = document.getElementById("rail-funds");
      if (railStatus) railStatus.textContent = c.railLogistics.unlocked ? "Unlocked" : "Locked";
      if (railLevel) railLevel.textContent = c.railLogistics.level;
      if (railRep) railRep.textContent = c.railLogistics.reputation.toFixed(0);
      if (railFunds) {
        var rf = (c.railLogistics && typeof c.railLogistics.funds === "number" && isFinite(c.railLogistics.funds)) ? c.railLogistics.funds : 0;
        railFunds.textContent = "$" + rf.toFixed(2);
      }
      var railBtn = document.getElementById("btn-rail-contract");
      if (railBtn) railBtn.disabled = !c.railLogistics.unlocked || !!c.railLogistics.activeContract;
      var railBar = document.getElementById("rail-contract-bar");
      if (railBar && c.railLogistics.activeContract) {
        var rc = c.railLogistics.activeContract;
        var pRail = Math.min(100, Math.floor(((rc.minutesProgress || 0) / (rc.minutesRequired || 1)) * 100));
        if (pRail < 0) pRail = 0;
        railBar.style.width = pRail + "%";
      }
  
      // Mining Corp
      var miningStatus = document.getElementById("mining-status");
      var miningLevel = document.getElementById("mining-level");
      var miningOre = document.getElementById("mining-ore");
      if (miningStatus) miningStatus.textContent = c.miningCorp.unlocked ? "Unlocked" : "Locked";
      if (miningLevel) miningLevel.textContent = c.miningCorp.level;
      if (miningOre) miningOre.textContent = c.miningCorp.oreStock.toFixed(1) + " t";
      var miningTotal = document.getElementById("mining-total-price");
      if (miningTotal && Game.Companies.getOreTotalPrice) {
        miningTotal.textContent = "$" + Game.Companies.getOreTotalPrice().toFixed(0);
      }
      var miningFunds = document.getElementById("mining-funds");
      if (miningFunds) {
        var miningTween = (typeof gsap !== "undefined" && UI._animTweens && UI._animTweens.miningFunds);
        if (!miningTween) miningFunds.textContent = "$" + (c.miningCorp.funds || 0).toFixed(2);
      }
      var oreRunBtn = document.getElementById("btn-ore-run");
      if (oreRunBtn) oreRunBtn.disabled = !c.miningCorp.unlocked || c.miningCorp.activeRunMinutes > 0;
      var oreRunBar = document.getElementById("ore-run-bar");
      if (oreRunBar && c.miningCorp.activeRunMinutes > 0) {
        var totalOre = c.miningCorp.activeRunTotal || (6 * 60);
        var pOre = Math.min(100, Math.floor(((totalOre - c.miningCorp.activeRunMinutes) / totalOre) * 100));
        if (pOre < 0) pOre = 0;
        oreRunBar.style.width = pOre + "%";
      }
  
      // Retail Shop overview card
      var retailStatus = document.getElementById("retail-status");
      var retailLevel = document.getElementById("retail-level");
      var retailStock = document.getElementById("retail-stock");
      var retailPop = document.getElementById("retail-popularity");
      var retailPayroll = document.getElementById("retail-payroll");
      if (retailStatus) retailStatus.textContent = c.retailShop.unlocked ? "Unlocked" : "Locked";
      if (retailLevel) retailLevel.textContent = c.retailShop.level;
      if (retailStock) retailStock.textContent = c.retailShop.stock.toFixed(0) + " units";
      if (retailPop) retailPop.textContent = c.retailShop.popularity.toFixed(0) + "%";
      if (retailPayroll) {
        var rp = (Game.Companies && typeof Game.Companies.getRetailDailyPayroll === "function") ? Game.Companies.getRetailDailyPayroll(c.retailShop) : 0;
        if (typeof rp !== "number" || !isFinite(rp) || rp < 0) rp = 0;
        retailPayroll.textContent = "$" + rp.toFixed(0) + " / day";
      }
  
      // Internet Cafe overview card
      if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
      if (Game.Net && typeof Game.Net.ensure === "function") Game.Net.ensure();
      var nc = c.netCafe || {};
      var ncStatus = document.getElementById("netcafe-status");
      var ncLevel = document.getElementById("netcafe-level");
      var ncSeats = document.getElementById("netcafe-seats");
      var ncNet = document.getElementById("netcafe-net");
      var ncFunds = document.getElementById("netcafe-funds");
      var ncYcust = document.getElementById("netcafe-ycust");
      var ncYprofit = document.getElementById("netcafe-yprofit");
      var ncPop = document.getElementById("netcafe-pop");
      var ncPrice = document.getElementById("netcafe-price");
      var ncXp = document.getElementById("netcafe-xp");
      var ncXpBar = document.getElementById("netcafe-xpbar");
      var ncSeatCost = document.getElementById("netcafe-seat-cost");
      var ncBuySeatBtn = document.getElementById("btn-netcafe-buy-seat-overview");
      if (ncStatus) ncStatus.textContent = nc.unlocked ? "Unlocked" : "Locked";
      if (ncLevel) ncLevel.textContent = String(nc.level || 0);
      if (ncSeats) ncSeats.textContent = String(nc.seats || 0);
      if (ncFunds) ncFunds.textContent = "$" + (nc.funds || 0).toFixed(2);
      if (ncNet && Game.Net && typeof Game.Net.getEffectiveMbps === "function") {
        var eff = Game.Net.getEffectiveMbps();
        if (typeof eff !== "number" || !isFinite(eff) || eff < 0) eff = 0;
        ncNet.textContent = eff.toFixed(2);
      }
      if (ncYcust && nc.stats) ncYcust.textContent = (nc.stats.yesterdayCustomers || 0).toFixed(0);
      if (ncYprofit && nc.stats) {
        var p = (nc.stats.yesterdayRevenue || 0) - (nc.stats.yesterdayCost || 0);
        ncYprofit.textContent = "$" + p.toFixed(0);
      }
      if (ncPop) {
        var pop = (typeof nc.popularity === "number" && isFinite(nc.popularity)) ? nc.popularity : 0;
        if (pop < 0) pop = 0;
        if (pop > 100) pop = 100;
        ncPop.textContent = pop.toFixed(0);
      }
      if (ncPrice) {
        var price = (typeof nc.pricePerCustomer === "number" && isFinite(nc.pricePerCustomer)) ? nc.pricePerCustomer : 2.5;
        if (price <= 0) price = 2.5;
        ncPrice.textContent = price.toFixed(1);
      }
      if (ncXp || ncXpBar) {
        var tN = 300 + (nc.level || 0) * 250;
        if (typeof tN !== "number" || !isFinite(tN) || tN <= 0) tN = 300;
        var xpN = (typeof nc.xp === "number" && isFinite(nc.xp) && nc.xp > 0) ? nc.xp : 0;
        if (ncXp) ncXp.textContent = xpN.toFixed(0) + " / " + tN.toFixed(0);
        if (ncXpBar) {
          var pctN = tN > 0 ? Math.floor((xpN / tN) * 100) : 0;
          if (pctN < 0) pctN = 0;
          if (pctN > 100) pctN = 100;
          ncXpBar.style.width = pctN + "%";
        }
      }
      var seatCost = 0;
      if (Game.Companies && typeof Game.Companies.getNetCafeNextSeatCost === "function") {
        seatCost = Game.Companies.getNetCafeNextSeatCost();
        if (typeof seatCost !== "number" || !isFinite(seatCost) || seatCost < 0) seatCost = 0;
        if (ncSeatCost) ncSeatCost.textContent = seatCost.toFixed(0);
      }
      if (ncBuySeatBtn) {
        var funds = (typeof nc.funds === "number" && isFinite(nc.funds)) ? nc.funds : 0;
        ncBuySeatBtn.disabled = !nc.unlocked || (seatCost > 0 && funds < seatCost);
      }
  
      // Courier overview card
      if (Game.Companies && typeof Game.Companies.ensureCourierState === "function") Game.Companies.ensureCourierState();
      var co = c.courierCo || {};
      var coStatus = document.getElementById("courier-status");
      var coLevel = document.getElementById("courier-level");
      var coFleet = document.getElementById("courier-fleet");
      var coFunds = document.getElementById("courier-funds");
      var coBar = document.getElementById("courier-run-bar");
      var coEta = document.getElementById("courier-run-eta");
      var coOffersCount = document.getElementById("courier-offers-count");
      var coOrdersCount = document.getElementById("courier-orders-count");
      var coActiveCount = document.getElementById("courier-active-count");
      var coCapEl = document.getElementById("courier-capacity");
      var coDeliveredToday = document.getElementById("courier-delivered-today");
      var coDeliveredYesterday = document.getElementById("courier-delivered-yesterday");
      var coXp = document.getElementById("courier-xp");
      var coXpBar = document.getElementById("courier-xpbar");
      var coDispatchBtn = document.getElementById("btn-courier-dispatch-overview");
      if (coStatus) coStatus.textContent = co.unlocked ? "Unlocked" : "Locked";
      if (coLevel) coLevel.textContent = String(co.level || 0);
      if (coFleet) coFleet.textContent = (co.vans || 0) + " / " + (co.drivers || 0);
      if (coFunds) coFunds.textContent = "$" + (co.funds || 0).toFixed(2);
      var o = Array.isArray(co.offers) ? co.offers.length : 0;
      var q = Array.isArray(co.orders) ? co.orders.length : 0;
      var a = Array.isArray(co.activeRuns) ? co.activeRuns.length : 0;
      if (coOffersCount) coOffersCount.textContent = String(o);
      if (coOrdersCount) coOrdersCount.textContent = String(q);
      if (coActiveCount) coActiveCount.textContent = String(a);
      var cap = Math.max(0, Math.min(co.vans || 0, co.drivers || 0));
      if (coCapEl) coCapEl.textContent = String(cap);
      if (coDeliveredToday) {
        var dt = (co.stats && typeof co.stats.deliveredToday === "number" && isFinite(co.stats.deliveredToday)) ? co.stats.deliveredToday : 0;
        coDeliveredToday.textContent = String(Math.floor(dt));
      }
      if (coDeliveredYesterday) {
        var dy = (co.stats && typeof co.stats.deliveredYesterday === "number" && isFinite(co.stats.deliveredYesterday)) ? co.stats.deliveredYesterday : 0;
        coDeliveredYesterday.textContent = String(Math.floor(dy));
      }
      if (coXp || coXpBar) {
        var tC = 250 + (co.level || 0) * 200;
        if (typeof tC !== "number" || !isFinite(tC) || tC <= 0) tC = 250;
        var xpC = (typeof co.xp === "number" && isFinite(co.xp) && co.xp > 0) ? co.xp : 0;
        if (coXp) coXp.textContent = xpC.toFixed(0) + " / " + tC.toFixed(0);
        if (coXpBar) {
          var pctC = tC > 0 ? Math.floor((xpC / tC) * 100) : 0;
          if (pctC < 0) pctC = 0;
          if (pctC > 100) pctC = 100;
          coXpBar.style.width = pctC + "%";
        }
      }
      if (coBar || coEta) {
        var pct = 0;
        var etaTxt = "-";
        if (Array.isArray(co.activeRuns) && co.activeRuns.length) {
          var run0 = co.activeRuns[0];
          var tot = (run0 && typeof run0.totalMinutes === "number") ? run0.totalMinutes : 1;
          var rem = (run0 && typeof run0.remainingMinutes === "number") ? run0.remainingMinutes : 0;
          if (!(tot > 0)) tot = 1;
          var done = tot - rem;
          if (done < 0) done = 0;
          if (done > tot) done = tot;
          pct = Math.floor((done / tot) * 100);
          if (pct < 0) pct = 0;
          if (pct > 100) pct = 100;
          var etaMin = Math.max(0, Math.ceil(rem || 0));
          var hh = Math.floor(etaMin / 60);
          var mm = etaMin % 60;
          etaTxt = hh + ":" + (mm < 10 ? "0" + mm : mm);
        }
        if (coBar) coBar.style.width = pct + "%";
        if (coEta) coEta.textContent = etaTxt;
      }
      if (coDispatchBtn) {
        var canDispatch = !!co.unlocked && cap > 0 && q > 0 && a < cap;
        coDispatchBtn.disabled = !canDispatch;
      }
  
      // Recycling overview card
      if (Game.Companies && typeof Game.Companies.ensureRecyclingState === "function") Game.Companies.ensureRecyclingState();
      var rc = c.recyclingCo || {};
      var rcStatus = document.getElementById("recycle-status");
      var rcLevel = document.getElementById("recycle-level");
      var rcTeam = document.getElementById("recycle-team");
      var rcScrap = document.getElementById("recycle-scrap");
      var rcFunds = document.getElementById("recycle-funds");
      var rcYkg = document.getElementById("recycle-ykg");
      var rcTkg = document.getElementById("recycle-tkg");
      var rcOverhead = document.getElementById("recycle-overhead");
      var rcBatchLabel = document.getElementById("recycle-batch-label");
      var rcBar = document.getElementById("recycle-batch-bar");
      var rcQuickBtn = document.getElementById("btn-recycle-quick-start");
      var rcQuickKg = document.getElementById("recycle-quick-kg");
      if (rcStatus) rcStatus.textContent = rc.unlocked ? "Unlocked" : "Locked";
      if (rcLevel) rcLevel.textContent = String(rc.level || 0);
      if (rcTeam) rcTeam.textContent = (rc.machines || 0) + " / " + (rc.staff || 0);
      if (rcScrap) rcScrap.textContent = (rc.scrapKg || 0).toFixed(0) + " kg";
      if (rcFunds) rcFunds.textContent = "$" + (rc.funds || 0).toFixed(2);
      if (rcYkg && rc.stats) rcYkg.textContent = (rc.stats.processedYesterdayKg || 0).toFixed(0) + " kg";
      if (rcTkg && rc.stats) rcTkg.textContent = (rc.stats.processedTodayKg || 0).toFixed(0) + " kg";
      if (rcOverhead) {
        var oh = (rc.staff || 0) * 25 + (rc.machines || 0) * 6 + 8;
        if (typeof oh !== "number" || !isFinite(oh) || oh < 0) oh = 0;
        rcOverhead.textContent = oh.toFixed(0);
      }
      if (rcBar || rcBatchLabel) {
        var pct2 = 0;
        var label = "Idle";
        if (rc.activeBatch) {
          var tot2 = rc.activeBatch.totalMinutes || 1;
          var rem2 = rc.activeBatch.remainingMinutes || 0;
          if (!(tot2 > 0)) tot2 = 1;
          var done2 = tot2 - rem2;
          if (done2 < 0) done2 = 0;
          if (done2 > tot2) done2 = tot2;
          pct2 = Math.floor((done2 / tot2) * 100);
          if (pct2 < 0) pct2 = 0;
          if (pct2 > 100) pct2 = 100;
          var eta2 = Math.max(0, Math.ceil(rem2 || 0));
          var hh2 = Math.floor(eta2 / 60);
          var mm2 = eta2 % 60;
          var kg2 = (typeof rc.activeBatch.kg === "number" && isFinite(rc.activeBatch.kg)) ? rc.activeBatch.kg : 0;
          label = (kg2 ? (kg2.toFixed(0) + " kg") : "Batch") + " â€¢ ETA " + hh2 + ":" + (mm2 < 10 ? "0" + mm2 : mm2);
        }
        if (rcBar) rcBar.style.width = pct2 + "%";
        if (rcBatchLabel) rcBatchLabel.textContent = label;
      }
      if (rcQuickBtn || rcQuickKg) {
        var canStart = !!rc.unlocked && !rc.activeBatch && (rc.scrapKg || 0) >= 50 && (rc.machines || 0) > 0 && (rc.staff || 0) > 0;
        if (rcQuickBtn) rcQuickBtn.disabled = !canStart;
        if (rcQuickKg) rcQuickKg.disabled = !canStart;
      }
  
      // Retail manage page updates are handled above; purchases are instant (no deliveries).
      return;
  
      // Retail stock ordering page summary (IDs only exist on that page)
      var sumStatus = document.getElementById("retail-summary-status");
      var sumLevel = document.getElementById("retail-summary-level");
      var sumStock = document.getElementById("retail-summary-stock");
      var sumPop = document.getElementById("retail-summary-popularity");
      var sumMoney = document.getElementById("retail-summary-money");
      if (sumStatus) sumStatus.textContent = c.retailShop.unlocked ? "Unlocked" : "Locked";
      if (sumLevel) sumLevel.textContent = c.retailShop.level;
      if (sumStock) sumStock.textContent = c.retailShop.stock.toFixed(0) + " units";
      if (sumPop) sumPop.textContent = c.retailShop.popularity.toFixed(0) + "%";
      if (sumMoney) {
        var retailTween = (typeof gsap !== "undefined" && UI._animTweens && UI._animTweens.retailFunds);
        if (!retailTween) sumMoney.textContent = "$" + (c.retailShop.funds || 0).toFixed(2);
      }
  
      var rStats = c.retailShop.stats || { todayUnits: 0, todayRevenue: 0, todayCost: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
      var tUnits = rStats.todayUnits || 0;
      var tRevenue = rStats.todayRevenue || 0;
      var tCost = rStats.todayCost || 0;
      var tProfit = tRevenue - tCost;
      var tMargin = tRevenue > 0 ? (tProfit / tRevenue) * 100 : 0;
      var yUnits = rStats.yesterdayUnits || 0;
      var yRevenue = rStats.yesterdayRevenue || 0;
      var yCost = rStats.yesterdayCost || 0;
      var yProfit = yRevenue - yCost;
  
      var todaySalesEl = document.getElementById("retail-summary-today-sales");
      if (todaySalesEl) todaySalesEl.textContent = tUnits.toFixed(0) + " units Â· $" + tRevenue.toFixed(0) + " revenue";
      var todayProfitEl = document.getElementById("retail-summary-today-profit");
      if (todayProfitEl) todayProfitEl.textContent = "$" + tProfit.toFixed(0) + " (" + tMargin.toFixed(0) + "% margin)";
      var yesterdayEl = document.getElementById("retail-summary-yesterday");
      if (yesterdayEl) yesterdayEl.textContent = yUnits.toFixed(0) + " units Â· $" + yRevenue.toFixed(0) + " rev Â· $" + yProfit.toFixed(0) + " profit";
  
      var retailAutoPayout = document.getElementById("retail-auto-payout");
      if (retailAutoPayout) retailAutoPayout.checked = !!c.retailShop.autoPayoutToWallet;
  
      // Active deliveries list (rerender only when the list changes; ETA updates below).
      var deliveriesWrap = document.getElementById("retail-active-deliveries");
      if (deliveriesWrap) {
        var opts = Game.Companies.retailStockOptions || [];
        var list = c.retailShop.pendingDeliveries || [];
        var sig = "";
        for (var di = 0; di < list.length; di++) {
          var del = list[di];
          if (!del) continue;
          sig += (del.id || "") + "|" + (del.optionId || "") + "|" + (del.units || 0) + "|" + (del.arrivalDay || "") + ";";
        }
        if (UI._retailDeliveriesSig !== sig) {
          deliveriesWrap.innerHTML = UI.renderRetailActiveDeliveriesHtml(c.retailShop, opts);
          UI._retailDeliveriesSig = sig;
        }
      }
  
      var etaCells = document.querySelectorAll(".retail-delivery-eta");
      for (var i = 0; i < etaCells.length; i++) {
        var cell = etaCells[i];
        if (!cell) continue;
        var arrivalAttr = cell.getAttribute("data-arrival-day");
        var ad = (typeof arrivalAttr === "string" && arrivalAttr.length) ? parseFloat(arrivalAttr) : NaN;
        cell.textContent = UI.getDeliveryEtaLabel(ad);
      }
  
  	  },
  });
})();
