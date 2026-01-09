Game.Companies = {
  retailStockOptions: [
    { id: "small", name: "Small shipment", batchSize: 40, unitPrice: 4.5, leadDays: 0 },
    { id: "standard", name: "Standard shipment", batchSize: 80, unitPrice: 4.0, leadDays: 1 },
    { id: "bulk", name: "Bulk shipment", batchSize: 140, unitPrice: 3.6, leadDays: 2 }
  ],
  flushRetailSalesAgg: function (opts) {
    if (!Game || !Game.state || !Game.state.companies || !Game.state.companies.retailShop) return;
    var s = Game.state.companies.retailShop;
    var agg = s._salesAgg;
    if (!agg || typeof agg !== "object") return;

    // Back-compat: older saves used { revenue, units } for business-funds sales.
    var revBusiness = 0;
    var unitsBusiness = 0;
    var revWallet = 0;
    var unitsWallet = 0;

    if (typeof agg.revenueBusiness === "number" && isFinite(agg.revenueBusiness)) revBusiness = agg.revenueBusiness;
    if (typeof agg.unitsBusiness === "number" && isFinite(agg.unitsBusiness)) unitsBusiness = agg.unitsBusiness;
    if (typeof agg.revenueWallet === "number" && isFinite(agg.revenueWallet)) revWallet = agg.revenueWallet;
    if (typeof agg.unitsWallet === "number" && isFinite(agg.unitsWallet)) unitsWallet = agg.unitsWallet;

    if (typeof agg.revenue === "number" && isFinite(agg.revenue)) revBusiness += agg.revenue;
    if (typeof agg.units === "number" && isFinite(agg.units)) unitsBusiness += agg.units;

    var day = (typeof agg.day === "number" && isFinite(agg.day)) ? agg.day : (Game.state.day || 1);
    var hour = (typeof agg.hour === "number" && isFinite(agg.hour)) ? agg.hour : null;
    var hh = (hour !== null) ? ((hour < 10 ? "0" : "") + hour + ":00") : "";
    var prefix = hour !== null ? ("Day " + day + " " + hh) : ("Day " + day);

    if (revBusiness > 0) {
      Game.addNotification("Retail shop sales (" + prefix + "): +$" + revBusiness.toFixed(0) + " (" + unitsBusiness.toFixed(1) + " units) credited to business funds.");
    }
    if (revWallet > 0) {
      Game.addNotification("Retail shop sales (" + prefix + "): +$" + revWallet.toFixed(0) + " (" + unitsWallet.toFixed(1) + " units) paid out to your wallet.");
    }
    s._salesAgg = null;
  },
  ensureState: function () {
    if (!Game.state || typeof Game.state !== "object") return;
    if (!Game.state.companies || typeof Game.state.companies !== "object") {
      Game.state.companies = {};
    }
    var c = Game.state.companies;
    if (!c.railLogistics || typeof c.railLogistics !== "object") {
      c.railLogistics = { unlocked: false, level: 0, reputation: 0, funds: 0, hqLocation: "London", activeContract: null, contractProgress: 0, staff: {}, trains: {}, warehouses: {}, orders: [], activeRuns: [], tracks: {}, lastOrderDay: 0, lastProductionDay: 0 };
    }
    var r = c.railLogistics;
    if (typeof r.unlocked !== "boolean") r.unlocked = false;
    if (typeof r.level !== "number" || !isFinite(r.level) || r.level < 0) r.level = 0;
    if (typeof r.reputation !== "number" || !isFinite(r.reputation) || r.reputation < 0) r.reputation = 0;
    if (typeof r.funds !== "number" || !isFinite(r.funds) || r.funds < 0) r.funds = 0;
    if (typeof r.hqLocation !== "string" || !r.hqLocation) r.hqLocation = "London";
    if (typeof r.contractProgress !== "number" || !isFinite(r.contractProgress) || r.contractProgress < 0) r.contractProgress = 0;
    if (!r.staff || typeof r.staff !== "object") r.staff = {};
    if (typeof r.staff.dispatchers !== "number" || !isFinite(r.staff.dispatchers) || r.staff.dispatchers < 0) r.staff.dispatchers = 1;
    if (typeof r.staff.maintenance !== "number" || !isFinite(r.staff.maintenance) || r.staff.maintenance < 0) r.staff.maintenance = 0;
    if (!r.trains || typeof r.trains !== "object") r.trains = {};
    if (typeof r.trains.owned !== "number" || !isFinite(r.trains.owned) || r.trains.owned < 0) r.trains.owned = 0;
    if (typeof r.trains.capacity !== "number" || !isFinite(r.trains.capacity) || r.trains.capacity < 0) r.trains.capacity = 0;
    if (!r.warehouses || typeof r.warehouses !== "object") r.warehouses = {};
    if (!Array.isArray(r.orders)) r.orders = [];
    if (!Array.isArray(r.activeRuns)) r.activeRuns = [];
    if (!r.tracks || typeof r.tracks !== "object") r.tracks = {};
    if (typeof r.lastOrderDay !== "number" || !isFinite(r.lastOrderDay) || r.lastOrderDay < 0) r.lastOrderDay = 0;
    if (typeof r.lastProductionDay !== "number" || !isFinite(r.lastProductionDay) || r.lastProductionDay < 0) r.lastProductionDay = 0;
    if (r.activeContract && typeof r.activeContract === "object") {
      if (typeof r.activeContract.minutesRequired !== "number" || !isFinite(r.activeContract.minutesRequired) || r.activeContract.minutesRequired < 1) {
        r.activeContract.minutesRequired = 8 * 60;
      }
      if (typeof r.activeContract.minutesProgress !== "number" || !isFinite(r.activeContract.minutesProgress) || r.activeContract.minutesProgress < 0) {
        r.activeContract.minutesProgress = 0;
      }
      if (typeof r.activeContract.payout !== "number" || !isFinite(r.activeContract.payout) || r.activeContract.payout < 0) {
        r.activeContract.payout = 0;
      }
    } else {
      r.activeContract = null;
    }
    Game.Companies.ensureRailLogisticsState();

    if (!c.miningCorp || typeof c.miningCorp !== "object") {
      c.miningCorp = { unlocked: false, level: 0, reputation: 0, oreStock: 0, activeRunMinutes: 0, activeRunTotal: 0, funds: 0, mines: [], oreDetail: { iron: 0, copper: 0, silver: 0, gold: 0 }, staffPerMine: {}, machinesPerMine: {}, daysUntilPayroll: 7, morale: 70 };
    }
    var m = c.miningCorp;
    if (typeof m.unlocked !== "boolean") m.unlocked = false;
    if (typeof m.level !== "number" || !isFinite(m.level) || m.level < 0) m.level = 0;
    if (typeof m.reputation !== "number" || !isFinite(m.reputation) || m.reputation < 0) m.reputation = 0;
    if (typeof m.oreStock !== "number" || !isFinite(m.oreStock) || m.oreStock < 0) m.oreStock = 0;
    if (typeof m.activeRunMinutes !== "number" || !isFinite(m.activeRunMinutes) || m.activeRunMinutes < 0) m.activeRunMinutes = 0;
    if (typeof m.activeRunTotal !== "number" || !isFinite(m.activeRunTotal) || m.activeRunTotal < 0) m.activeRunTotal = 0;
    if (typeof m.funds !== "number" || !isFinite(m.funds) || m.funds < 0) m.funds = 0;
    if (!Array.isArray(m.mines)) m.mines = [];
    if (!m.oreDetail || typeof m.oreDetail !== "object") m.oreDetail = { iron: 0, copper: 0, silver: 0, gold: 0 };
    if (typeof m.oreDetail.iron !== "number" || !isFinite(m.oreDetail.iron) || m.oreDetail.iron < 0) m.oreDetail.iron = 0;
    if (typeof m.oreDetail.copper !== "number" || !isFinite(m.oreDetail.copper) || m.oreDetail.copper < 0) m.oreDetail.copper = 0;
    if (typeof m.oreDetail.silver !== "number" || !isFinite(m.oreDetail.silver) || m.oreDetail.silver < 0) m.oreDetail.silver = 0;
    if (typeof m.oreDetail.gold !== "number" || !isFinite(m.oreDetail.gold) || m.oreDetail.gold < 0) m.oreDetail.gold = 0;
    if (!m.staffPerMine || typeof m.staffPerMine !== "object") m.staffPerMine = {};
    if (!m.machinesPerMine || typeof m.machinesPerMine !== "object") m.machinesPerMine = {};
    if (typeof m.daysUntilPayroll !== "number" || !isFinite(m.daysUntilPayroll) || m.daysUntilPayroll <= 0) m.daysUntilPayroll = 7;
    if (typeof m.morale !== "number" || !isFinite(m.morale) || m.morale < 0) m.morale = 70;
    if (m.morale > 100) m.morale = 100;
    if (!m.autoSell || typeof m.autoSell !== "object") m.autoSell = { iron: false, copper: false, silver: false, gold: false };
    if (typeof m.autoSell.iron !== "boolean") m.autoSell.iron = false;
    if (typeof m.autoSell.copper !== "boolean") m.autoSell.copper = false;
    if (typeof m.autoSell.silver !== "boolean") m.autoSell.silver = false;
    if (typeof m.autoSell.gold !== "boolean") m.autoSell.gold = false;
    if (typeof m.autoPayoutToWallet !== "boolean") m.autoPayoutToWallet = false;
    if (typeof m.autoPayoutReserve !== "number" || !isFinite(m.autoPayoutReserve) || m.autoPayoutReserve < 0) m.autoPayoutReserve = 0;

    if (!c.retailShop || typeof c.retailShop !== "object") {
      c.retailShop = {
        unlocked: false,
        level: 0,
        reputation: 0,
        stock: 0,
        popularity: 0,
        funds: 0,
        autoPayoutToWallet: false,
        inventory: { units: {}, costBasis: {} },
        staff: { clerks: 0, manager: 0 },
        staffRoster: [],
        vehicles: { vans: 0 },
        _staffIdCounter: 1,
        xp: 0,
        campaign: null,
        pendingDeliveries: [],
        salesSchedule: null,
        inventoryValue: 0,
        stats: { todayUnits: 0, todayRevenue: 0, todayCost: 0, todayPayroll: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0, yesterdayPayroll: 0 }
      };
    }
    var s = c.retailShop;
    if (typeof s.unlocked !== "boolean") s.unlocked = false;
    if (typeof s.level !== "number" || !isFinite(s.level) || s.level < 0) s.level = 0;
    if (typeof s.reputation !== "number" || !isFinite(s.reputation) || s.reputation < 0) s.reputation = 0;
    if (typeof s.stock !== "number" || !isFinite(s.stock) || s.stock < 0) s.stock = 0;
    if (typeof s.popularity !== "number" || !isFinite(s.popularity) || s.popularity < 0) s.popularity = 0;
    if (s.popularity > 100) s.popularity = 100;
    if (typeof s.funds !== "number" || !isFinite(s.funds) || s.funds < 0) s.funds = 0;
    if (typeof s.autoPayoutToWallet !== "boolean") s.autoPayoutToWallet = false;
    if (!s.inventory || typeof s.inventory !== "object") s.inventory = { units: {}, costBasis: {} };
    if (!s.inventory.units || typeof s.inventory.units !== "object") s.inventory.units = {};
    if (!s.inventory.costBasis || typeof s.inventory.costBasis !== "object") s.inventory.costBasis = {};
    if (!s.staff || typeof s.staff !== "object") s.staff = { clerks: 0, manager: 0 };
    if (typeof s.staff.clerks !== "number" || !isFinite(s.staff.clerks) || s.staff.clerks < 0) s.staff.clerks = 0;
    if (typeof s.staff.manager !== "number" || !isFinite(s.staff.manager) || s.staff.manager < 0) s.staff.manager = 0;
    if (!Array.isArray(s.staffRoster)) s.staffRoster = [];
    if (!s.vehicles || typeof s.vehicles !== "object") s.vehicles = { vans: 0 };
    if (typeof s.vehicles.vans !== "number" || !isFinite(s.vehicles.vans) || s.vehicles.vans < 0) s.vehicles.vans = 0;
    if (typeof s._staffIdCounter !== "number" || !isFinite(s._staffIdCounter) || s._staffIdCounter < 1) s._staffIdCounter = 1;
    if (typeof s.xp !== "number" || !isFinite(s.xp) || s.xp < 0) s.xp = 0;
    if (s.campaign && typeof s.campaign !== "object") s.campaign = null;
    if (s.campaign) {
      if (typeof s.campaign.channel !== "string" || !s.campaign.channel) s.campaign.channel = "leaflets";
      if (typeof s.campaign.daysRemaining !== "number" || !isFinite(s.campaign.daysRemaining) || s.campaign.daysRemaining < 0) s.campaign.daysRemaining = 0;
      if (typeof s.campaign.totalDays !== "number" || !isFinite(s.campaign.totalDays) || s.campaign.totalDays < 0) s.campaign.totalDays = s.campaign.daysRemaining;
      if (typeof s.campaign.costPaid !== "number" || !isFinite(s.campaign.costPaid) || s.campaign.costPaid < 0) s.campaign.costPaid = 0;
      if (s.campaign.daysRemaining <= 0) s.campaign = null;
    }
    if (!Array.isArray(s.pendingDeliveries)) s.pendingDeliveries = [];
    if (typeof s.inventoryValue !== "number" || !isFinite(s.inventoryValue) || s.inventoryValue < 0) s.inventoryValue = 0;
    if (!s.stats || typeof s.stats !== "object") {
      s.stats = { todayUnits: 0, todayRevenue: 0, todayCost: 0, todayPayroll: 0, yesterdayUnits: 0, yesterdayRevenue: 0, yesterdayCost: 0, yesterdayPayroll: 0 };
    }
    var rs = s.stats;
    if (typeof rs.todayUnits !== "number" || !isFinite(rs.todayUnits) || rs.todayUnits < 0) rs.todayUnits = 0;
    if (typeof rs.todayRevenue !== "number" || !isFinite(rs.todayRevenue) || rs.todayRevenue < 0) rs.todayRevenue = 0;
    if (typeof rs.todayCost !== "number" || !isFinite(rs.todayCost) || rs.todayCost < 0) rs.todayCost = 0;
    if (typeof rs.todayPayroll !== "number" || !isFinite(rs.todayPayroll) || rs.todayPayroll < 0) rs.todayPayroll = 0;
    if (typeof rs.yesterdayUnits !== "number" || !isFinite(rs.yesterdayUnits) || rs.yesterdayUnits < 0) rs.yesterdayUnits = 0;
    if (typeof rs.yesterdayRevenue !== "number" || !isFinite(rs.yesterdayRevenue) || rs.yesterdayRevenue < 0) rs.yesterdayRevenue = 0;
    if (typeof rs.yesterdayCost !== "number" || !isFinite(rs.yesterdayCost) || rs.yesterdayCost < 0) rs.yesterdayCost = 0;
    if (typeof rs.yesterdayPayroll !== "number" || !isFinite(rs.yesterdayPayroll) || rs.yesterdayPayroll < 0) rs.yesterdayPayroll = 0;
    Game.Companies.recomputeRetailDerived(s);
    Game.Companies.ensureRetailStaffRoster(s);

    // Additional companies
    if (Game.Companies && typeof Game.Companies.ensureNetCafeState === "function") Game.Companies.ensureNetCafeState();
    if (Game.Companies && typeof Game.Companies.ensureCourierState === "function") Game.Companies.ensureCourierState();
    if (Game.Companies && typeof Game.Companies.ensureRecyclingState === "function") Game.Companies.ensureRecyclingState();
  },
  ensureUnlocks: function () {
    Game.Companies.ensureState();
    var c = Game.state.companies;
    if (!c.railLogistics.unlocked && Game.state.education.level >= 2 && Game.state.stats.trainSkill >= 20) {
      c.railLogistics.unlocked = true;
      // Set HQ to the player's UK home (or nearest hub) if available.
      if (Game.state.player && Game.state.player.homePlaceId && Game.Companies && typeof Game.Companies.setRailHeadquarters === "function") {
        Game.Companies.setRailHeadquarters(Game.state.player.homePlaceId);
      }
      Game.addNotification("Rail Logistics company unlocked.");
    }
    if (!c.miningCorp.unlocked && Game.state.education.level >= 1) {
      c.miningCorp.unlocked = true;
      Game.addNotification("Mining Corp company unlocked.");
    }
    if (!c.retailShop.unlocked && Game.state.stats.businessSkill >= 10) {
      c.retailShop.unlocked = true;
      Game.addNotification("Retail Shop company unlocked.");
    }
    if (!c.netCafe.unlocked && Game.state.stats.businessSkill >= 5) {
      c.netCafe.unlocked = true;
      Game.addNotification("Internet Cafe company unlocked.");
    }
    if (!c.courierCo.unlocked && Game.state.education.level >= 1 && Game.state.stats.businessSkill >= 15) {
      c.courierCo.unlocked = true;
      Game.addNotification("Courier company unlocked.");
    }
    if (!c.recyclingCo.unlocked && Game.state.education.level >= 1 && Game.state.stats.techSkill >= 15) {
      c.recyclingCo.unlocked = true;
      Game.addNotification("Recycling company unlocked.");
    }
  },

  ensureNetCafeState: function () {
    if (!Game.state || !Game.state.companies) return;
    var c = Game.state.companies;
    if (!c.netCafe || typeof c.netCafe !== "object") {
      c.netCafe = {
        unlocked: false,
        level: 0,
        funds: 0,
        seats: 0,
        xp: 0,
        popularity: 0,
        pricePerCustomer: 2.5,
        stats: { todayCustomers: 0, todayRevenue: 0, todayCost: 0, yesterdayCustomers: 0, yesterdayRevenue: 0, yesterdayCost: 0 }
      };
    }
    var n = c.netCafe;
    if (typeof n.unlocked !== "boolean") n.unlocked = false;
    if (typeof n.level !== "number" || !isFinite(n.level) || n.level < 0) n.level = 0;
    if (typeof n.funds !== "number" || !isFinite(n.funds) || n.funds < 0) n.funds = 0;
    if (typeof n.seats !== "number" || !isFinite(n.seats) || n.seats < 0) n.seats = 0;
    if (typeof n.xp !== "number" || !isFinite(n.xp) || n.xp < 0) n.xp = 0;
    if (typeof n.popularity !== "number" || !isFinite(n.popularity) || n.popularity < 0) n.popularity = 0;
    if (n.popularity > 100) n.popularity = 100;
    if (typeof n.pricePerCustomer !== "number" || !isFinite(n.pricePerCustomer) || n.pricePerCustomer <= 0) n.pricePerCustomer = 2.5;
    if (typeof n.lastIncidentDay !== "number" || !isFinite(n.lastIncidentDay) || n.lastIncidentDay < 0) n.lastIncidentDay = 0;
    if (typeof n.members !== "number" || !isFinite(n.members) || n.members < 0) n.members = 0;
    if (typeof n.membershipPrice !== "number" || !isFinite(n.membershipPrice) || n.membershipPrice <= 0) n.membershipPrice = 8;
    if (!n.stats || typeof n.stats !== "object") n.stats = { todayCustomers: 0, todayRevenue: 0, todayCost: 0, yesterdayCustomers: 0, yesterdayRevenue: 0, yesterdayCost: 0 };
    var st = n.stats;
    if (typeof st.todayCustomers !== "number" || !isFinite(st.todayCustomers) || st.todayCustomers < 0) st.todayCustomers = 0;
    if (typeof st.todayRevenue !== "number" || !isFinite(st.todayRevenue) || st.todayRevenue < 0) st.todayRevenue = 0;
    if (typeof st.todayCost !== "number" || !isFinite(st.todayCost) || st.todayCost < 0) st.todayCost = 0;
    if (typeof st.yesterdayCustomers !== "number" || !isFinite(st.yesterdayCustomers) || st.yesterdayCustomers < 0) st.yesterdayCustomers = 0;
    if (typeof st.yesterdayRevenue !== "number" || !isFinite(st.yesterdayRevenue) || st.yesterdayRevenue < 0) st.yesterdayRevenue = 0;
    if (typeof st.yesterdayCost !== "number" || !isFinite(st.yesterdayCost) || st.yesterdayCost < 0) st.yesterdayCost = 0;
  },
  getNetCafeNextSeatCost: function () {
    Game.Companies.ensureNetCafeState();
    var n = Game.state.companies.netCafe;
    var seats = n.seats || 0;
    var cost = 160 * Math.pow(1.22, seats);
    if (!isFinite(cost) || cost < 50) cost = 50;
    if (cost > 250000) cost = 250000;
    return Math.round(cost);
  },
  getNetCafeIdealPrice: function (n, businessSkill) {
    var lvl = (n && typeof n.level === "number" && isFinite(n.level)) ? n.level : 0;
    var bs = (typeof businessSkill === "number" && isFinite(businessSkill)) ? businessSkill : 0;
    var base = 2.4 + lvl * 0.05 + bs * 0.015;
    if (!isFinite(base)) base = 2.4;
    if (base < 1.5) base = 1.5;
    if (base > 6.5) base = 6.5;
    return base;
  },
  getNetCafeDemandFactors: function (n) {
    if (!n) return { demandBase: 0.2, priceFactor: 1, serviceFactor: 1, incidentPenalty: 1, idealPrice: 2.5, businessSkill: 0 };
    var gStats = (Game.state.stats && typeof Game.state.stats === "object") ? Game.state.stats : {};
    var businessSkill = (typeof gStats.businessSkill === "number" && isFinite(gStats.businessSkill)) ? Math.floor(gStats.businessSkill) : 0;
    var idealPrice = Game.Companies.getNetCafeIdealPrice(n, businessSkill);
    var price = (typeof n.pricePerCustomer === "number" && isFinite(n.pricePerCustomer)) ? n.pricePerCustomer : 2.5;
    if (price <= 0) price = 2.5;

    var effMbps = (Game.Net && typeof Game.Net.getEffectiveMbps === "function") ? Game.Net.getEffectiveMbps() : 0.1;
    if (typeof effMbps !== "number" || !isFinite(effMbps) || effMbps <= 0) effMbps = 0.1;
    var demandBase = 0.6 + Math.min(1.6, Math.sqrt(effMbps) / 2);
    if (demandBase < 0.2) demandBase = 0.2;
    if (demandBase > 2.4) demandBase = 2.4;

    var priceFactor = idealPrice / price;
    if (!isFinite(priceFactor)) priceFactor = 1;
    if (priceFactor < 0.6) priceFactor = 0.6;
    if (priceFactor > 1.4) priceFactor = 1.4;

    var pcQuality = 1.0;
    try {
      if (Game.PC && typeof Game.PC.ensureState === "function") Game.PC.ensureState();
      var pc = Game.state && Game.state.pc ? Game.state.pc : null;
      if (pc) {
        var ram = (typeof pc.ramLevel === "number" && isFinite(pc.ramLevel)) ? pc.ramLevel : 0;
        var stor = (typeof pc.storageLevel === "number" && isFinite(pc.storageLevel)) ? pc.storageLevel : 0;
        var mobo = (typeof pc.motherboardTier === "number" && isFinite(pc.motherboardTier)) ? pc.motherboardTier : 0;
        pcQuality = 1 + ram * 0.06 + stor * 0.03 + mobo * 0.12;
      }
    } catch (e) {}
    if (!isFinite(pcQuality) || pcQuality < 0.8) pcQuality = 0.8;
    if (pcQuality > 1.6) pcQuality = 1.6;

    var serviceFactor = pcQuality * (1 + Math.min(0.12, businessSkill * 0.006)) * (1 + Math.min(0.12, (n.level || 0) * 0.01));
    if (!isFinite(serviceFactor) || serviceFactor < 0.7) serviceFactor = 0.7;
    if (serviceFactor > 1.5) serviceFactor = 1.5;

    var incidentPenalty = 1;
    var avOn = true;
    try {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var av = Game.state && Game.state.pc && Game.state.pc.antivirus ? Game.state.pc.antivirus : null;
      if (av && typeof av.isOn === "boolean") avOn = av.isOn;
    } catch (e2) {}
    if (!avOn) {
      incidentPenalty = 0.9;
    }
    return {
      demandBase: demandBase,
      priceFactor: priceFactor,
      serviceFactor: serviceFactor,
      incidentPenalty: incidentPenalty,
      idealPrice: idealPrice,
      businessSkill: businessSkill
    };
  },
  depositNetCafeFunds: function (amount) {
    Game.Companies.ensureNetCafeState();
    var n = Game.state.companies.netCafe;
    if (!n.unlocked) {
      Game.addNotification("Internet Cafe not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Internet Cafe")) {
      Game.addNotification("Not enough money to deposit into the Internet Cafe.");
      return;
    }
    n.funds += amount;
  },
  withdrawNetCafeFunds: function (amount) {
    Game.Companies.ensureNetCafeState();
    var n = Game.state.companies.netCafe;
    if (!n.unlocked) {
      Game.addNotification("Internet Cafe not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (typeof n.funds !== "number" || !isFinite(n.funds) || n.funds < 0) n.funds = 0;
    if (amount > n.funds) {
      Game.addNotification("Not enough Internet Cafe business funds to withdraw that amount.");
      return;
    }
    n.funds -= amount;
    Game.addMoney(amount, "Withdraw from Internet Cafe");
  },
  buyNetCafeSeat: function () {
    Game.Companies.ensureNetCafeState();
    var n = Game.state.companies.netCafe;
    if (!n.unlocked) {
      Game.addNotification("Internet Cafe not unlocked yet.");
      return;
    }
    var cost = Game.Companies.getNetCafeNextSeatCost();
    if (n.funds < cost) {
      Game.addNotification("Not enough Internet Cafe business funds to buy a PC seat.");
      return;
    }
    n.funds -= cost;
    n.seats += 1;
    Game.addNotification("Purchased a new Internet Cafe PC seat.");
  },
  netCafeDaily: function () {
    Game.Companies.ensureNetCafeState();
    var n = Game.state.companies.netCafe;
    if (!n.unlocked) return;
    var seats = n.seats || 0;
    var st = n.stats;
    if (st) {
      st.yesterdayCustomers = st.todayCustomers || 0;
      st.yesterdayRevenue = st.todayRevenue || 0;
      st.yesterdayCost = st.todayCost || 0;
      st.todayCustomers = 0;
      st.todayRevenue = 0;
      st.todayCost = 0;
    }
    if (seats <= 0) return;

    var factors = (Game.Companies && typeof Game.Companies.getNetCafeDemandFactors === "function") ? Game.Companies.getNetCafeDemandFactors(n) : { demandBase: 0.6, priceFactor: 1, serviceFactor: 1, incidentPenalty: 1, idealPrice: 2.5, businessSkill: 0 };
    var demand = factors.demandBase;
    var priceFactor = factors.priceFactor;
    var serviceFactor = factors.serviceFactor;
    var idealPrice = factors.idealPrice;
    var businessSkill = factors.businessSkill;

    var basePerSeat = 18 + (n.level || 0) * 3;
    var popMult = 1 + (n.popularity || 0) / 200;
    var jitter = 0.85 + Math.random() * 0.30;
    var customers = seats * basePerSeat * demand * priceFactor * serviceFactor * popMult * jitter;
    if (!isFinite(customers) || customers < 0) customers = 0;
    customers = Math.floor(customers);

    var price = n.pricePerCustomer || 2.5;
    var incidentPenalty = 1;
    var incidentCost = 0;
    var day = Game.state.day || 1;
    var avOn = true;
    try {
      if (Game.PC && typeof Game.PC.ensureState === "function") Game.PC.ensureState();
      var av = Game.state && Game.state.pc && Game.state.pc.antivirus ? Game.state.pc.antivirus : null;
      if (av && typeof av.isOn === "boolean") avOn = av.isOn;
    } catch (e2) {}
    var incidentChance = avOn ? 0.01 : 0.06;
    incidentChance += Math.min(0.08, seats * 0.002);
    incidentChance -= Math.min(0.05, businessSkill * 0.001);
    if (incidentChance < 0) incidentChance = 0;
    if (incidentChance > 0.25) incidentChance = 0.25;
    if (day !== n.lastIncidentDay && Math.random() < incidentChance) {
      incidentPenalty = 0.75;
      incidentCost = Math.max(10, Math.floor(seats * 1.5));
      n.lastIncidentDay = day;
      n.popularity -= 4 + Math.floor(Math.random() * 4);
      Game.addNotification("Internet Cafe incident: customer devices compromised. Popularity dropped.");
    }
    var revenue = customers * price;
    var rent = 25 + seats * 1.0;
    var util = 10 + seats * 0.6;
    var seatMaint = seats * 0.6;
    var membershipPrice = (typeof n.membershipPrice === "number" && isFinite(n.membershipPrice)) ? n.membershipPrice : 8;
    if (membershipPrice < 4) membershipPrice = 4;
    if (membershipPrice > 20) membershipPrice = 20;
    var members = (typeof n.members === "number" && isFinite(n.members)) ? n.members : 0;
    if (members < 0) members = 0;
    var maxMembers = Math.floor(seats * (1.2 + (n.level || 0) * 0.05));
    if (maxMembers < 0) maxMembers = 0;
    if (members > maxMembers) members = maxMembers;
    if (seats <= 0) {
      members = Math.floor(members * 0.6);
    } else {
      var signupScore = (n.popularity || 0) / 100 * 0.6 + (priceFactor - 1) * 0.3 + (serviceFactor - 1) * 0.4;
      if (signupScore < 0) signupScore = 0;
      if (signupScore > 0.9) signupScore = 0.9;
      var potentialNew = Math.floor(seats * signupScore * 0.2 + Math.random() * 2);
      if (potentialNew < 0) potentialNew = 0;
      var churnRate = 0.01;
      if (price > idealPrice * 1.2) churnRate += 0.03;
      if (serviceFactor < 0.9) churnRate += 0.02;
      if (incidentPenalty < 1) churnRate += 0.05;
      if (churnRate > 0.2) churnRate = 0.2;
      var churn = Math.floor(members * churnRate);
      members = members - churn + potentialNew;
      if (members < 0) members = 0;
      if (members > maxMembers) members = maxMembers;
    }
    n.members = members;
    n.membershipPrice = membershipPrice;
    var membershipRevenue = members * membershipPrice;
    var membershipCost = members * 0.15;
    var cost = rent + util + seatMaint + incidentCost + membershipCost;
    if (!isFinite(revenue) || revenue < 0) revenue = 0;
    if (!isFinite(cost) || cost < 0) cost = 0;
    revenue *= incidentPenalty;
    revenue += membershipRevenue;

    if (st) {
      st.todayCustomers = customers;
      st.todayRevenue = revenue;
      st.todayCost = cost;
    }
    var profit = revenue - cost;
    n.funds += profit;
    if (n.funds < 0) n.funds = 0;

    n.xp += customers * 0.5;
    var threshold = 300 + (n.level || 0) * 250;
    if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 300;
    if (n.xp >= threshold && n.level < 50) {
      n.xp -= threshold;
      n.level += 1;
      Game.addNotification("Internet Cafe leveled up (level " + n.level + ").");
    }

    if (customers > 0) {
      var popGain = 0.10 + Math.min(0.40, customers / 500);
      n.popularity += popGain;
    }
    if (price > idealPrice * 1.2) {
      n.popularity -= 0.6 + Math.min(1.2, (price / idealPrice - 1) * 2.5);
    } else if (price < idealPrice * 0.85 && serviceFactor >= 1.0) {
      n.popularity += 0.4;
    }
    if (serviceFactor < 0.9) n.popularity -= 0.4;
    if (n.popularity < 0) n.popularity = 0;
    if (n.popularity > 100) n.popularity = 100;
  },

  ensureCourierState: function () {
    if (!Game.state || !Game.state.companies) return;
    var c = Game.state.companies;
    if (!c.courierCo || typeof c.courierCo !== "object") {
      c.courierCo = {
        unlocked: false,
        level: 0,
        reputation: 0,
        funds: 0,
        vans: 0,
        drivers: 0,
        xp: 0,
        offers: [],
        orders: [],
        activeRuns: [],
        stats: { deliveredToday: 0, deliveredYesterday: 0 },
        lastOfferDay: 0
      };
    }
    var co = c.courierCo;
    if (typeof co.unlocked !== "boolean") co.unlocked = false;
    if (typeof co.level !== "number" || !isFinite(co.level) || co.level < 0) co.level = 0;
    if (typeof co.reputation !== "number" || !isFinite(co.reputation) || co.reputation < 0) co.reputation = 0;
    if (typeof co.funds !== "number" || !isFinite(co.funds) || co.funds < 0) co.funds = 0;
    if (typeof co.vans !== "number" || !isFinite(co.vans) || co.vans < 0) co.vans = 0;
    if (typeof co.drivers !== "number" || !isFinite(co.drivers) || co.drivers < 0) co.drivers = 0;
    if (typeof co.xp !== "number" || !isFinite(co.xp) || co.xp < 0) co.xp = 0;
    if (typeof co.manager !== "number" || !isFinite(co.manager) || co.manager < 0) co.manager = 0;
    if (co.manager > 1) co.manager = 1;
    if (typeof co.autoDispatchEnabled !== "boolean") co.autoDispatchEnabled = true;
    if (typeof co.offerGenAccMinutes !== "number" || !isFinite(co.offerGenAccMinutes) || co.offerGenAccMinutes < 0) co.offerGenAccMinutes = 0;
    if (typeof co.vanUpgradeLevel !== "number" || !isFinite(co.vanUpgradeLevel) || co.vanUpgradeLevel < 0) co.vanUpgradeLevel = 0;
    if (co.vanUpgradeLevel > 10) co.vanUpgradeLevel = 10;
    if (typeof co.dispatchPolicy !== "string" || !co.dispatchPolicy) co.dispatchPolicy = "balanced";
    if (typeof co.onTimeStreak !== "number" || !isFinite(co.onTimeStreak) || co.onTimeStreak < 0) co.onTimeStreak = 0;
    if (typeof co.autoAcceptAccSeconds !== "number" || !isFinite(co.autoAcceptAccSeconds) || co.autoAcceptAccSeconds < 0) co.autoAcceptAccSeconds = 0;
    if (!Array.isArray(co.offers)) co.offers = [];
    if (!Array.isArray(co.orders)) co.orders = [];
    if (!Array.isArray(co.activeRuns)) co.activeRuns = [];
    if (!co.stats || typeof co.stats !== "object") co.stats = { deliveredToday: 0, deliveredYesterday: 0 };
    if (typeof co.stats.deliveredToday !== "number" || !isFinite(co.stats.deliveredToday) || co.stats.deliveredToday < 0) co.stats.deliveredToday = 0;
    if (typeof co.stats.deliveredYesterday !== "number" || !isFinite(co.stats.deliveredYesterday) || co.stats.deliveredYesterday < 0) co.stats.deliveredYesterday = 0;
    if (typeof co.lastOfferDay !== "number" || !isFinite(co.lastOfferDay) || co.lastOfferDay < 0) co.lastOfferDay = 0;
  },
  depositCourierFunds: function (amount) {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Courier")) {
      Game.addNotification("Not enough money to deposit into the Courier company.");
      return;
    }
    co.funds += amount;
  },
  withdrawCourierFunds: function (amount) {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (amount > (co.funds || 0)) {
      Game.addNotification("Not enough Courier business funds to withdraw that amount.");
      return;
    }
    co.funds -= amount;
    Game.addMoney(amount, "Withdraw from Courier");
  },
  getCourierVanCost: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    var vans = co.vans || 0;
    var cost = 420 * Math.pow(1.28, vans);
    if (!isFinite(cost) || cost < 200) cost = 200;
    if (cost > 450000) cost = 450000;
    return Math.round(cost);
  },
  getCourierDriverHireCost: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    var d = co.drivers || 0;
    var cost = 220 * Math.pow(1.22, d);
    if (!isFinite(cost) || cost < 120) cost = 120;
    if (cost > 250000) cost = 250000;
    return Math.round(cost);
  },
  buyCourierVan: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    var cost = Game.Companies.getCourierVanCost();
    if (co.funds < cost) {
      Game.addNotification("Not enough Courier business funds to buy a van.");
      return;
    }
    co.funds -= cost;
    co.vans += 1;
    Game.addNotification("Purchased a courier van.");
  },
  getCourierVanUpgradeCost: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    var lvl = co.vanUpgradeLevel || 0;
    var cost = 650 * Math.pow(1.35, lvl);
    if (!isFinite(cost) || cost < 450) cost = 450;
    if (cost > 750000) cost = 750000;
    return Math.round(cost);
  },
  upgradeCourierVans: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    if ((co.vans || 0) <= 0) {
      Game.addNotification("Buy at least 1 van before upgrading.");
      return;
    }
    if ((co.vanUpgradeLevel || 0) >= 10) {
      Game.addNotification("Van upgrades are maxed out.");
      return;
    }
    var cost = Game.Companies.getCourierVanUpgradeCost();
    if (co.funds < cost) {
      Game.addNotification("Not enough Courier business funds to upgrade vans.");
      return;
    }
    co.funds -= cost;
    co.vanUpgradeLevel = (co.vanUpgradeLevel || 0) + 1;
    Game.addNotification("Courier vans upgraded (level " + co.vanUpgradeLevel + ").");
  },
  getCourierVanSpeedMultiplier: function (co) {
    var lvl = (co && typeof co.vanUpgradeLevel === "number" && isFinite(co.vanUpgradeLevel)) ? co.vanUpgradeLevel : 0;
    if (lvl < 0) lvl = 0;
    if (lvl > 10) lvl = 10;
    // Each level reduces delivery time by 4% (capped).
    var mult = 1 - lvl * 0.04;
    if (mult < 0.6) mult = 0.6;
    return mult;
  },
  hireCourierDriver: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    var cost = Game.Companies.getCourierDriverHireCost();
    if (co.funds < cost) {
      Game.addNotification("Not enough Courier business funds to hire a driver.");
      return;
    }
    co.funds -= cost;
    co.drivers += 1;
    Game.addNotification("Hired a courier driver.");
  },
  getCourierManagerHireCost: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    var mgr = co.manager || 0;
    var cost = 900 * Math.pow(1.4, mgr);
    if (!isFinite(cost) || cost < 700) cost = 700;
    if (cost > 250000) cost = 250000;
    return Math.round(cost);
  },
  hireCourierManager: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    if ((co.manager || 0) >= 1) {
      Game.addNotification("Courier manager already hired.");
      return;
    }
    var cost = Game.Companies.getCourierManagerHireCost();
    if (co.funds < cost) {
      Game.addNotification("Not enough Courier business funds to hire a manager.");
      return;
    }
    co.funds -= cost;
    co.manager = 1;
    Game.addNotification("Hired a courier manager.");
  },
  getCourierTimeOfDayMultiplier: function () {
    var tm = (Game.state && typeof Game.state.timeMinutes === "number" && isFinite(Game.state.timeMinutes)) ? Game.state.timeMinutes : 0;
    if (tm < 0) tm = 0;
    tm = tm % (24 * 60);
    var hour = Math.floor(tm / 60);
    // Longer jobs at busier/late hours.
    if (hour >= 0 && hour <= 5) return 1.0;
    if (hour >= 6 && hour <= 10) return 1.2;
    if (hour >= 11 && hour <= 15) return 1.6;
    if (hour >= 16 && hour <= 19) return 2.2;
    return 3.0; // 20-23
  },
  courierGenerateOfferNow: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co || !co.unlocked) return null;
    var day = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Game.state.day : 1;

    var locs = (Game.World && Array.isArray(Game.World.locations)) ? Game.World.locations : [];
    var ids = [];
    for (var i = 0; i < locs.length; i++) {
      if (locs[i] && locs[i].id) ids.push(String(locs[i].id));
    }
    if (ids.length < 2) ids = ["Home", "City Centre", "Industrial Park", "Hospital", "Countryside"];

    var from = ids[Math.floor(Math.random() * ids.length)];
    var to = ids[Math.floor(Math.random() * ids.length)];
    if (to === from) to = ids[(ids.indexOf(from) + 1) % ids.length];

    var classDefs = Game.Companies.getCourierAvailablePackageClasses(co);
    var classDef = classDefs[Math.floor(Math.random() * classDefs.length)] || classDefs[0];

    var base = 10 + Math.floor(Math.random() * 23); // 10..32 minutes base
    var timeOfDayMult = Game.Companies.getCourierTimeOfDayMultiplier();
    var minutesRequired = Math.round(base * timeOfDayMult * (classDef.timeMult || 1));
    if (minutesRequired < 10) minutesRequired = 10;

    // Offer durations can exceed 32 minutes depending on time of day (up to ~3x).
    var max = Math.round(32 * 3.0 * (classDef.timeMult || 1));
    if (minutesRequired > max) minutesRequired = max;

    var deadline = day + (Math.random() < 0.7 ? 1 : 2);
    var payoutBase = 60 + minutesRequired * 0.6;
    var payout = payoutBase * (1 + (co.level || 0) * 0.15) * (0.85 + Math.random() * 0.30);
    payout *= (classDef.payoutMult || 1);
    if (!isFinite(payout) || payout < 10) payout = 10;

    return {
      id: "co_" + day + "_" + Math.floor(Math.random() * 1000000),
      from: from,
      to: to,
      minutesRequired: Math.floor(minutesRequired),
      payout: Math.round(payout),
      packageClass: classDef.id,
      createdDay: day,
      deadlineDay: deadline
    };
  },
  courierOfferGenTick: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co || !co.unlocked) return;
    if (!Array.isArray(co.offers)) co.offers = [];
    if (typeof co.offerGenAccMinutes !== "number" || !isFinite(co.offerGenAccMinutes) || co.offerGenAccMinutes < 0) co.offerGenAccMinutes = 0;

    var target = 4 + Math.min(6, Math.floor((co.level || 0) / 2));
    if ((co.manager || 0) > 0) target += 2;
    if (target > 12) target = 12;

    if (co.offers.length >= target) return;
    co.offerGenAccMinutes += minutes;

    var interval = 20;
    var guard = 0;
    while (co.offerGenAccMinutes >= interval && guard < 10 && co.offers.length < target) {
      guard += 1;
      co.offerGenAccMinutes -= interval;
      var offer = Game.Companies.courierGenerateOfferNow();
      if (offer) co.offers.push(offer);
    }
  },
  courierPackageClassCatalog: [
    { id: "standard", name: "Standard", payoutMult: 1.0, timeMult: 1.0, latePenaltyMult: 0.6, minLevel: 0 },
    { id: "fragile", name: "Fragile", payoutMult: 1.35, timeMult: 1.1, latePenaltyMult: 0.5, minLevel: 3 },
    { id: "bulk", name: "Bulk", payoutMult: 1.2, timeMult: 1.35, latePenaltyMult: 0.7, minLevel: 2 },
    { id: "refrigerated", name: "Refrigerated", payoutMult: 1.5, timeMult: 1.2, latePenaltyMult: 0.45, minLevel: 5 }
  ],
  getCourierPackageClassDef: function (id) {
    var defs = Game.Companies.courierPackageClassCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i] && defs[i].id === id) return defs[i];
    }
    return defs[0] || { id: "standard", name: "Standard", payoutMult: 1, timeMult: 1, latePenaltyMult: 0.6, minLevel: 0 };
  },
  getCourierAvailablePackageClasses: function (co) {
    var defs = Game.Companies.courierPackageClassCatalog || [];
    var lvl = (co && typeof co.level === "number" && isFinite(co.level)) ? co.level : 0;
    var out = [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i] && lvl >= (defs[i].minLevel || 0)) out.push(defs[i]);
    }
    return out.length ? out : [Game.Companies.getCourierPackageClassDef("standard")];
  },
  courierGenerateOffersDaily: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) return;
    var day = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Game.state.day : 1;
    if (co.lastOfferDay === day) return;
    co.lastOfferDay = day;
    var count = 4 + Math.floor(Math.random() * 3); // 4..6
    if (!Array.isArray(co.offers)) co.offers = [];
    if (co.offers.length > 18) co.offers = co.offers.slice(0, 18);
    var added = 0;
    for (var k = 0; k < count; k++) {
      var offer = Game.Companies.courierGenerateOfferNow();
      if (offer) {
        co.offers.push(offer);
        added += 1;
      }
    }
    if (added > 0) Game.addNotification("New courier contracts available (" + added + ").");
  },
  acceptCourierOffer: function (offerId) {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    var id = String(offerId || "");
    if (!id) return;
    if (co.orders.length >= 8) {
      Game.addNotification("Courier queue is full. Dispatch deliveries first.");
      return;
    }
    var found = null;
    var nextOffers = [];
    for (var i = 0; i < co.offers.length; i++) {
      var o = co.offers[i];
      if (o && o.id === id) found = o; else if (o) nextOffers.push(o);
    }
    if (!found) {
      Game.addNotification("Courier offer not found.");
      return;
    }
    co.offers = nextOffers;
    co.orders.push({
      id: found.id,
      from: found.from,
      to: found.to,
      minutesRequired: found.minutesRequired,
      payout: found.payout,
      packageClass: found.packageClass || "standard",
      acceptedDay: (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1,
      deadlineDay: found.deadlineDay
    });
    Game.addNotification("Courier contract accepted.");
  },
  dispatchCourierDeliveriesNow: function (opts) {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) {
      Game.addNotification("Courier company not unlocked yet.");
      return;
    }
    var silent = !!(opts && opts.silent);
    var cap = Math.max(0, Math.min(co.vans || 0, co.drivers || 0));
    if (cap <= 0) {
      if (!silent) Game.addNotification("You need at least 1 van and 1 driver to dispatch deliveries.");
      return;
    }
    if (Array.isArray(co.orders) && co.orders.length > 1) {
      var policy = co.dispatchPolicy || "balanced";
      co.orders = co.orders.slice().sort(function (a, b) {
        if (!a || !b) return 0;
        if (policy === "profit") {
          return (b.payout || 0) - (a.payout || 0);
        }
        if (policy === "on_time") {
          return (a.deadlineDay || 0) - (b.deadlineDay || 0);
        }
        var ad = (a.deadlineDay || 0);
        var bd = (b.deadlineDay || 0);
        var ap = (a.payout || 0);
        var bp = (b.payout || 0);
        if (ad !== bd) return ad - bd;
        return bp - ap;
      });
    }
    var started = 0;
    while (co.activeRuns.length < cap && co.orders.length > 0) {
      var order = co.orders.shift();
      if (!order) continue;
      var speedMult = 1;
      var classDef = Game.Companies.getCourierPackageClassDef(order.packageClass || "standard");
      if (Game.state.companies && Game.state.companies.railLogistics && Game.state.companies.railLogistics.unlocked) {
        speedMult *= 0.85;
      }
      speedMult *= Game.Companies.getCourierVanSpeedMultiplier(co);
      var total = Math.floor((order.minutesRequired || 240) * speedMult);
      if (total < 30) total = 30;
      co.activeRuns.push({
        id: order.id,
        from: order.from,
        to: order.to,
        payout: order.payout,
        packageClass: order.packageClass || "standard",
        latePenaltyMult: classDef.latePenaltyMult || 0.6,
        totalMinutes: total,
        remainingMinutes: total,
        startedDay: (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1,
        deadlineDay: order.deadlineDay || ((Game.state && Game.state.day) ? Game.state.day + 1 : 2)
      });
      started += 1;
    }
    if (started > 0) {
      if (!silent) Game.addNotification("Dispatched " + started + " courier delivery" + (started === 1 ? "" : "ies") + ".");
    } else {
      if (!silent) Game.addNotification("No courier deliveries to dispatch.");
    }
  },
  courierDaily: function () {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) return;
    // rollover stats
    co.stats.deliveredYesterday = co.stats.deliveredToday || 0;
    co.stats.deliveredToday = 0;

    // payroll/maintenance only once the company is actually operating
    if ((co.vans || 0) > 0 || (co.drivers || 0) > 0) {
      var wages = (co.drivers || 0) * 35;
      var maint = (co.vans || 0) * 8;
      var mgrCost = (co.manager || 0) * 120;
      var cost = wages + maint + mgrCost;
      if (cost > 0) {
        if (co.funds >= cost) {
          co.funds -= cost;
        } else {
          co.funds = 0;
          co.reputation = Math.max(0, (co.reputation || 0) - 2);
          Game.addNotification("Courier company missed payroll/maintenance due to low funds.");
        }
      }
    }
    Game.Companies.courierGenerateOffersDaily();
  },
  tickCourier: function (minutes) {
    Game.Companies.ensureCourierState();
    var co = Game.state.companies.courierCo;
    if (!co.unlocked) return;
    Game.Companies.courierOfferGenTick(minutes);
    if ((co.manager || 0) > 0) {
      if (typeof co.autoAcceptAccSeconds !== "number" || !isFinite(co.autoAcceptAccSeconds)) co.autoAcceptAccSeconds = 0;
      co.autoAcceptAccSeconds += minutes * 2;
      var guard = 0;
      while (co.autoAcceptAccSeconds >= 60 && guard < 10) {
        guard += 1;
        if (!Array.isArray(co.offers) || !co.offers.length) break;
        if (Array.isArray(co.orders) && co.orders.length >= 8) break;
        co.autoAcceptAccSeconds -= 60;
        var offer = co.offers.shift();
        if (!offer) continue;
        co.orders.push({
          id: offer.id,
          from: offer.from,
          to: offer.to,
          minutesRequired: offer.minutesRequired,
          payout: offer.payout,
          packageClass: offer.packageClass || "standard",
          acceptedDay: (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1,
          deadlineDay: offer.deadlineDay
        });
        if (co.autoDispatchEnabled) {
          Game.Companies.dispatchCourierDeliveriesNow({ silent: true });
        } else {
          Game.addNotification("Courier manager auto-accepted a contract.");
        }
      }
    } else {
      co.autoAcceptAccSeconds = 0;
    }
    if (!Array.isArray(co.activeRuns) || co.activeRuns.length === 0) return;
    for (var i = co.activeRuns.length - 1; i >= 0; i--) {
      var run = co.activeRuns[i];
      if (!run) { co.activeRuns.splice(i, 1); continue; }
      if (typeof run.remainingMinutes !== "number" || !isFinite(run.remainingMinutes)) run.remainingMinutes = run.totalMinutes || 0;
      run.remainingMinutes -= minutes;
      if (run.remainingMinutes <= 0) {
        run.remainingMinutes = 0;
        var day = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
        var late = (run.deadlineDay && day > run.deadlineDay);
        var payout = typeof run.payout === "number" && isFinite(run.payout) ? run.payout : 0;
        var latePenalty = (typeof run.latePenaltyMult === "number" && isFinite(run.latePenaltyMult)) ? run.latePenaltyMult : 0.6;
        if (late) payout *= latePenalty;
        if (!late) {
          if (typeof co.onTimeStreak !== "number" || !isFinite(co.onTimeStreak) || co.onTimeStreak < 0) co.onTimeStreak = 0;
          co.onTimeStreak += 1;
          var streakBonus = Math.min(0.2, co.onTimeStreak * 0.02);
          payout *= (1 + streakBonus);
        } else {
          co.onTimeStreak = 0;
        }
        if (run.packageClass === "bulk" && Game.state.companies && Game.state.companies.railLogistics && Game.state.companies.railLogistics.unlocked) {
          payout *= 1.05;
        }
        co.funds += payout;
        co.reputation += late ? 0.5 : 2;
        co.xp += payout * 0.06;
        co.stats.deliveredToday += 1;
        Game.addNotification("Courier delivery completed: +" + Math.round(payout) + (late ? " (late)" : "") + ".");
        co.activeRuns.splice(i, 1);
      }
    }
    var threshold = 250 + (co.level || 0) * 200;
    if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 250;
    if (co.xp >= threshold && co.level < 50) {
      co.xp -= threshold;
      co.level += 1;
      Game.addNotification("Courier company leveled up (level " + co.level + ").");
    }
  },

  ensureRecyclingState: function () {
    if (!Game.state || !Game.state.companies) return;
    var c = Game.state.companies;
    if (!c.recyclingCo || typeof c.recyclingCo !== "object") {
      c.recyclingCo = {
        unlocked: false,
        level: 0,
        reputation: 0,
        funds: 0,
        scrapKg: 0,
        machines: 0,
        staff: 0,
        xp: 0,
        suppliers: [],
        materials: { plasticKg: 0, copperKg: 0, rareKg: 0 },
        contaminationPct: 0,
        activeBatch: null,
        stats: { processedTodayKg: 0, processedYesterdayKg: 0 }
      };
    }
    var rc = c.recyclingCo;
    if (typeof rc.unlocked !== "boolean") rc.unlocked = false;
    if (typeof rc.level !== "number" || !isFinite(rc.level) || rc.level < 0) rc.level = 0;
    if (typeof rc.reputation !== "number" || !isFinite(rc.reputation) || rc.reputation < 0) rc.reputation = 0;
    if (typeof rc.funds !== "number" || !isFinite(rc.funds) || rc.funds < 0) rc.funds = 0;
    if (typeof rc.scrapKg !== "number" || !isFinite(rc.scrapKg) || rc.scrapKg < 0) rc.scrapKg = 0;
    if (typeof rc.machines !== "number" || !isFinite(rc.machines) || rc.machines < 0) rc.machines = 0;
    if (typeof rc.staff !== "number" || !isFinite(rc.staff) || rc.staff < 0) rc.staff = 0;
    if (typeof rc.xp !== "number" || !isFinite(rc.xp) || rc.xp < 0) rc.xp = 0;
    if (!Array.isArray(rc.suppliers)) rc.suppliers = [];
    if (!rc.materials || typeof rc.materials !== "object") rc.materials = { plasticKg: 0, copperKg: 0, rareKg: 0 };
    if (typeof rc.materials.plasticKg !== "number" || !isFinite(rc.materials.plasticKg) || rc.materials.plasticKg < 0) rc.materials.plasticKg = 0;
    if (typeof rc.materials.copperKg !== "number" || !isFinite(rc.materials.copperKg) || rc.materials.copperKg < 0) rc.materials.copperKg = 0;
    if (typeof rc.materials.rareKg !== "number" || !isFinite(rc.materials.rareKg) || rc.materials.rareKg < 0) rc.materials.rareKg = 0;
    if (typeof rc.contaminationPct !== "number" || !isFinite(rc.contaminationPct) || rc.contaminationPct < 0) rc.contaminationPct = 0;
    if (rc.activeBatch && typeof rc.activeBatch !== "object") rc.activeBatch = null;
    if (rc.activeBatch) {
      if (typeof rc.activeBatch.totalMinutes !== "number" || !isFinite(rc.activeBatch.totalMinutes) || rc.activeBatch.totalMinutes <= 0) rc.activeBatch.totalMinutes = 120;
      if (typeof rc.activeBatch.remainingMinutes !== "number" || !isFinite(rc.activeBatch.remainingMinutes) || rc.activeBatch.remainingMinutes < 0) rc.activeBatch.remainingMinutes = rc.activeBatch.totalMinutes;
      if (typeof rc.activeBatch.kg !== "number" || !isFinite(rc.activeBatch.kg) || rc.activeBatch.kg <= 0) rc.activeBatch.kg = 0;
      if (typeof rc.activeBatch.type !== "string" || !rc.activeBatch.type) rc.activeBatch.type = "mixed";
    }
    if (!rc.stats || typeof rc.stats !== "object") rc.stats = { processedTodayKg: 0, processedYesterdayKg: 0 };
    if (typeof rc.stats.processedTodayKg !== "number" || !isFinite(rc.stats.processedTodayKg) || rc.stats.processedTodayKg < 0) rc.stats.processedTodayKg = 0;
    if (typeof rc.stats.processedYesterdayKg !== "number" || !isFinite(rc.stats.processedYesterdayKg) || rc.stats.processedYesterdayKg < 0) rc.stats.processedYesterdayKg = 0;
  },
  depositRecyclingFunds: function (amount) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Recycling")) {
      Game.addNotification("Not enough money to deposit into the Recycling company.");
      return;
    }
    rc.funds += amount;
  },
  withdrawRecyclingFunds: function (amount) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (amount > (rc.funds || 0)) {
      Game.addNotification("Not enough Recycling business funds to withdraw that amount.");
      return;
    }
    rc.funds -= amount;
    Game.addMoney(amount, "Withdraw from Recycling");
  },
  getRecyclingMachineCost: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    var m = rc.machines || 0;
    var cost = 520 * Math.pow(1.30, m);
    if (!isFinite(cost) || cost < 250) cost = 250;
    if (cost > 750000) cost = 750000;
    return Math.round(cost);
  },
  getRecyclingHireCost: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    var s = rc.staff || 0;
    var cost = 180 * Math.pow(1.20, s);
    if (!isFinite(cost) || cost < 100) cost = 100;
    if (cost > 250000) cost = 250000;
    return Math.round(cost);
  },
  recyclingSupplierCatalog: [
    { id: "school", name: "School District", kgPerDay: 120, costPerDay: 80, quality: 0.9, minLevel: 0 },
    { id: "office", name: "Office Parks", kgPerDay: 180, costPerDay: 130, quality: 1.0, minLevel: 2 },
    { id: "hospital", name: "Hospital System", kgPerDay: 220, costPerDay: 190, quality: 1.1, minLevel: 4 },
    { id: "industrial", name: "Industrial Plant", kgPerDay: 320, costPerDay: 260, quality: 0.8, minLevel: 6 }
  ],
  getRecyclingSupplierDef: function (id) {
    var defs = Game.Companies.recyclingSupplierCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i] && defs[i].id === id) return defs[i];
    }
    return null;
  },
  addRecyclingSupplier: function (id) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    var def = Game.Companies.getRecyclingSupplierDef(id);
    if (!def) return;
    var lvl = (rc.level || 0);
    if (lvl < (def.minLevel || 0)) {
      Game.addNotification("Recycling level too low for that supplier.");
      return;
    }
    for (var i = 0; i < rc.suppliers.length; i++) {
      if (rc.suppliers[i] && rc.suppliers[i].id === def.id) {
        Game.addNotification("Supplier already active.");
        return;
      }
    }
    rc.suppliers.push({ id: def.id, name: def.name, kgPerDay: def.kgPerDay, costPerDay: def.costPerDay, quality: def.quality });
    Game.addNotification("Supplier contract signed: " + def.name + ".");
  },
  removeRecyclingSupplier: function (id) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!Array.isArray(rc.suppliers) || !rc.suppliers.length) return;
    var next = [];
    var removed = false;
    for (var i = 0; i < rc.suppliers.length; i++) {
      var s = rc.suppliers[i];
      if (s && s.id === id) {
        removed = true;
        continue;
      }
      if (s) next.push(s);
    }
    rc.suppliers = next;
    if (removed) Game.addNotification("Supplier contract cancelled.");
  },
  recyclingBatchTypeCatalog: [
    { id: "mixed", name: "Mixed Electronics", valueMult: 1.0, timeMult: 1.0, metalsMult: 1.0, minLevel: 0 },
    { id: "pcs", name: "PCs & Laptops", valueMult: 1.12, timeMult: 1.15, metalsMult: 1.35, minLevel: 2 },
    { id: "phones", name: "Phones & Tablets", valueMult: 1.25, timeMult: 1.1, metalsMult: 1.55, minLevel: 4 },
    { id: "industrial", name: "Industrial Boards", valueMult: 1.35, timeMult: 1.35, metalsMult: 1.9, minLevel: 6 }
  ],
  getRecyclingBatchTypeDef: function (id) {
    var defs = Game.Companies.recyclingBatchTypeCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i] && defs[i].id === id) return defs[i];
    }
    return defs[0] || { id: "mixed", name: "Mixed Electronics", valueMult: 1.0, timeMult: 1.0, metalsMult: 1.0, minLevel: 0 };
  },
  buyRecyclingMachine: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    var cost = Game.Companies.getRecyclingMachineCost();
    if (rc.funds < cost) {
      Game.addNotification("Not enough Recycling business funds to buy a machine.");
      return;
    }
    rc.funds -= cost;
    rc.machines += 1;
    Game.addNotification("Purchased a recycling machine.");
  },
  hireRecyclingStaff: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    var cost = Game.Companies.getRecyclingHireCost();
    if (rc.funds < cost) {
      Game.addNotification("Not enough Recycling business funds to hire staff.");
      return;
    }
    rc.funds -= cost;
    rc.staff += 1;
    Game.addNotification("Hired recycling staff.");
  },
  buyRecyclingScrapPack: function (packId) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    var id = String(packId || "");
    var packs = {
      small: { kg: 200, cost: 260 },
      medium: { kg: 600, cost: 680 },
      large: { kg: 1200, cost: 1180 }
    };
    var pack = packs[id] || null;
    if (!pack) return;
    var cost = pack.cost;
    if (rc.funds < cost) {
      Game.addNotification("Not enough Recycling business funds to buy scrap.");
      return;
    }
    rc.funds -= cost;
    rc.scrapKg += pack.kg;
    Game.addNotification("Purchased " + pack.kg + " kg of e-waste scrap.");
  },
  startRecyclingBatch: function (kg, batchType) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) {
      Game.addNotification("Recycling company not unlocked yet.");
      return;
    }
    if (rc.activeBatch) {
      Game.addNotification("Recycling is already running.");
      return;
    }
    var amount = parseFloat(kg);
    if (!isFinite(amount) || amount <= 0) return;
    amount = Math.floor(amount);
    if (amount < 50) {
      Game.addNotification("Batch is too small (min 50 kg).");
      return;
    }
    if (amount > rc.scrapKg) {
      Game.addNotification("Not enough scrap to start that batch.");
      return;
    }
    if ((rc.machines || 0) <= 0 || (rc.staff || 0) <= 0) {
      Game.addNotification("You need at least 1 machine and 1 staff to process scrap.");
      return;
    }
    var typeId = String(batchType || "mixed");
    var typeDef = Game.Companies.getRecyclingBatchTypeDef(typeId);
    var lvl = rc.level || 0;
    if (lvl < (typeDef.minLevel || 0)) {
      Game.addNotification("Recycling level too low for that batch type.");
      return;
    }
    rc.scrapKg -= amount;
    var total = 120 + Math.floor(amount / 5);
    if (total < 60) total = 60;
    if (total > 24 * 60) total = 24 * 60;
    total = Math.floor(total * (typeDef.timeMult || 1));
    rc.activeBatch = {
      kg: amount,
      type: typeDef.id,
      totalMinutes: total,
      remainingMinutes: total
    };
    Game.addNotification("Recycling batch started (" + amount + " kg " + typeDef.name + ").");
  },
  recyclingDaily: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) return;
    rc.stats.processedYesterdayKg = rc.stats.processedTodayKg || 0;
    rc.stats.processedTodayKg = 0;
    var tech = (Game.state.stats && typeof Game.state.stats.techSkill === "number" && isFinite(Game.state.stats.techSkill)) ? Game.state.stats.techSkill : 0;

    if (Array.isArray(rc.suppliers) && rc.suppliers.length) {
      var qualitySum = 0;
      var activeCount = 0;
      for (var i = 0; i < rc.suppliers.length; i++) {
        var s = rc.suppliers[i];
        if (!s) continue;
        var kgPerDay = (typeof s.kgPerDay === "number" && isFinite(s.kgPerDay)) ? s.kgPerDay : 0;
        var costPerDay = (typeof s.costPerDay === "number" && isFinite(s.costPerDay)) ? s.costPerDay : 0;
        var quality = (typeof s.quality === "number" && isFinite(s.quality)) ? s.quality : 1;
        if (kgPerDay <= 0) continue;
        if (rc.funds < costPerDay) {
          rc.reputation = Math.max(0, (rc.reputation || 0) - 1);
          Game.addNotification("Recycling supplier missed payment: " + (s.name || s.id) + ".");
          continue;
        }
        rc.funds -= costPerDay;
        var jitter = 0.85 + Math.random() * 0.30;
        var add = kgPerDay * jitter * (1 + Math.min(0.4, (rc.level || 0) * 0.02));
        rc.scrapKg += add;
        qualitySum += quality;
        activeCount += 1;
      }
      var avgQuality = activeCount ? (qualitySum / activeCount) : 1;
      var contamination = 0.12 - (avgQuality - 1) * 0.06 - Math.min(0.06, tech * 0.001);
      if (contamination < 0) contamination = 0;
      if (contamination > 0.25) contamination = 0.25;
      rc.contaminationPct = contamination;
    } else {
      rc.contaminationPct = 0.08;
    }
    if ((rc.machines || 0) > 0 || (rc.staff || 0) > 0) {
      var cost = (rc.staff || 0) * 25 + (rc.machines || 0) * 6 + 8;
      if (cost > 0) {
        if (rc.funds >= cost) {
          rc.funds -= cost;
        } else {
          rc.funds = 0;
          rc.reputation = Math.max(0, (rc.reputation || 0) - 1);
          Game.addNotification("Recycling company missed overhead due to low funds.");
        }
      }
    }
  },
  tickRecycling: function (minutes) {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) return;
    if (!rc.activeBatch) return;
    var typeDef = Game.Companies.getRecyclingBatchTypeDef(rc.activeBatch.type || "mixed");
    var speed = 1 + Math.max(0, (rc.machines || 0) - 1) * 0.30 + Math.max(0, (rc.staff || 0) - 1) * 0.20;
    if (!isFinite(speed) || speed < 0.2) speed = 1;
    rc.activeBatch.remainingMinutes -= minutes * speed;
    if (rc.activeBatch.remainingMinutes <= 0) {
      var kg = rc.activeBatch.kg || 0;
      rc.activeBatch = null;
      var basePerKg = 1.4 + (rc.level || 0) * 0.12;
      var contamination = (typeof rc.contaminationPct === "number" && isFinite(rc.contaminationPct)) ? rc.contaminationPct : 0;
      if (contamination < 0) contamination = 0;
      if (contamination > 0.3) contamination = 0.3;
      var qualityMult = 1 - contamination * 0.5;
      var value = kg * basePerKg * (typeDef.valueMult || 1) * qualityMult * (0.85 + Math.random() * 0.30);
      if (!isFinite(value) || value < 0) value = 0;
      rc.funds += value;
      rc.xp += kg * 0.35;
      rc.stats.processedTodayKg += kg;
      if (!rc.materials || typeof rc.materials !== "object") rc.materials = { plasticKg: 0, copperKg: 0, rareKg: 0 };
      var metalsMult = (typeDef.metalsMult || 1);
      var plastics = kg * 0.35;
      var copper = kg * 0.03 * metalsMult;
      var rare = kg * 0.004 * metalsMult;
      if (plastics > 0) rc.materials.plasticKg += plastics;
      if (copper > 0) rc.materials.copperKg += copper;
      if (rare > 0) rc.materials.rareKg += rare;

      // Optional tie-in: small recovered metals flow into Mining Corp ore stock if it exists.
      if (Game.state.companies && Game.state.companies.miningCorp) {
        var m = Game.state.companies.miningCorp;
        if (m && typeof m.oreDetail === "object") {
          var oreTons = kg * 0.0006 * metalsMult * qualityMult;
          if (isFinite(oreTons) && oreTons > 0) {
            var iron = oreTons * 0.8;
            var copper = oreTons * 0.2;
            if (typeof m.oreDetail.iron !== "number" || !isFinite(m.oreDetail.iron)) m.oreDetail.iron = 0;
            if (typeof m.oreDetail.copper !== "number" || !isFinite(m.oreDetail.copper)) m.oreDetail.copper = 0;
            m.oreDetail.iron += iron;
            m.oreDetail.copper += copper;
            if (typeof m.oreStock !== "number" || !isFinite(m.oreStock)) m.oreStock = 0;
            m.oreStock += oreTons;
          }
        }
      }

      Game.addNotification("Recycling batch completed: +$" + Math.round(value) + ".");

      var threshold = 400 + (rc.level || 0) * 300;
      if (typeof threshold !== "number" || !isFinite(threshold) || threshold <= 0) threshold = 400;
      if (rc.xp >= threshold && rc.level < 50) {
        rc.xp -= threshold;
        rc.level += 1;
        Game.addNotification("Recycling company leveled up (level " + rc.level + ").");
      }
    }
  },
  sellRecyclingMaterials: function () {
    Game.Companies.ensureRecyclingState();
    var rc = Game.state.companies.recyclingCo;
    if (!rc.unlocked) return;
    if (!rc.materials || typeof rc.materials !== "object") return;
    var plastics = rc.materials.plasticKg || 0;
    var copper = rc.materials.copperKg || 0;
    var rare = rc.materials.rareKg || 0;
    var plasticPrice = 0.35;
    var copperPrice = 6.5;
    var rarePrice = 28;
    var payout = plastics * plasticPrice + copper * copperPrice + rare * rarePrice;
    if (!isFinite(payout) || payout <= 0) {
      Game.addNotification("No recycled materials to sell yet.");
      return;
    }
    rc.materials.plasticKg = 0;
    rc.materials.copperKg = 0;
    rc.materials.rareKg = 0;
    rc.funds += payout;
    rc.xp += payout * 0.04;
    Game.addNotification("Sold recycled materials for $" + payout.toFixed(0) + ".");
  },
  ensureRetailState: function () {
    var c = Game.state.companies;
    if (!c || !c.retailShop) return;
    Game.Companies.ensureUnlocks();
    var s = c.retailShop;
    if (!s.inventory || typeof s.inventory !== "object") s.inventory = { units: {}, costBasis: {} };
    if (!s.inventory.units || typeof s.inventory.units !== "object") s.inventory.units = {};
    if (!s.inventory.costBasis || typeof s.inventory.costBasis !== "object") s.inventory.costBasis = {};

    // Migrate legacy generic stock + deliveries into per-item inventory once.
    if (!s._retailInventoryMigrated) {
      s._retailInventoryMigrated = true;
      var legacyUnits = 0;
      var legacyCost = 0;
      if (typeof s.stock === "number" && isFinite(s.stock) && s.stock > 0) {
        legacyUnits += Math.floor(s.stock);
        if (typeof s.inventoryValue === "number" && isFinite(s.inventoryValue) && s.inventoryValue > 0) {
          legacyCost += s.inventoryValue;
        }
        s.stock = 0;
        s.inventoryValue = 0;
      }
      if (Array.isArray(s.pendingDeliveries) && s.pendingDeliveries.length) {
        for (var i = 0; i < s.pendingDeliveries.length; i++) {
          var d = s.pendingDeliveries[i];
          if (!d) continue;
          var u = (typeof d.units === "number" && isFinite(d.units) && d.units > 0) ? Math.floor(d.units) : 0;
          if (u <= 0) continue;
          legacyUnits += u;
          var p = (typeof d.unitPrice === "number" && isFinite(d.unitPrice) && d.unitPrice > 0) ? d.unitPrice : 0;
          legacyCost += u * p;
        }
        s.pendingDeliveries = [];
      }
      if (legacyUnits > 0) {
        var defaultItemId = "household_basics";
        var invU = s.inventory.units;
        var invC = s.inventory.costBasis;
        if (typeof invU[defaultItemId] !== "number" || !isFinite(invU[defaultItemId]) || invU[defaultItemId] < 0) invU[defaultItemId] = 0;
        if (typeof invC[defaultItemId] !== "number" || !isFinite(invC[defaultItemId]) || invC[defaultItemId] < 0) invC[defaultItemId] = 0;
        if (legacyCost <= 0) {
          var def = Game.Companies.getRetailItemDef(defaultItemId);
          var buy = def && typeof def.buyPrice === "number" && isFinite(def.buyPrice) && def.buyPrice > 0 ? def.buyPrice : 2;
          legacyCost = legacyUnits * buy;
        }
        invU[defaultItemId] += legacyUnits;
        invC[defaultItemId] += legacyCost;
      }
    }
    Game.Companies.recomputeRetailDerived(s);
  },
  getRetailItemDef: function (itemId) {
    var cat = (window.Game && Game.RetailCatalog) ? Game.RetailCatalog : null;
    if (!cat || typeof cat.getItemById !== "function") return null;
    return cat.getItemById(itemId);
  },
  getRetailAllItems: function () {
    var cat = (window.Game && Game.RetailCatalog) ? Game.RetailCatalog : null;
    if (!cat || !Array.isArray(cat.items)) return [];
    return cat.items;
  },
  getRetailUnlockedItems: function (level) {
    var cat = (window.Game && Game.RetailCatalog) ? Game.RetailCatalog : null;
    if (!cat || typeof cat.getUnlockedItems !== "function") return [];
    return cat.getUnlockedItems(level);
  },
  getRetailAverageUnitCost: function (shop) {
    var s = shop || (Game.state.companies && Game.state.companies.retailShop);
    if (!s || typeof s.stock !== "number" || s.stock <= 0) return 0;
    var inv = typeof s.inventoryValue === "number" ? s.inventoryValue : 0;
    if (inv <= 0) return 0;
    return inv / s.stock;
  },
  recomputeRetailDerived: function (shop) {
    if (!shop) return;
    if (!shop.inventory || typeof shop.inventory !== "object") shop.inventory = { units: {}, costBasis: {} };
    if (!shop.inventory.units || typeof shop.inventory.units !== "object") shop.inventory.units = {};
    if (!shop.inventory.costBasis || typeof shop.inventory.costBasis !== "object") shop.inventory.costBasis = {};
    var units = 0;
    var cost = 0;
    var u = shop.inventory.units;
    var c = shop.inventory.costBasis;
    for (var k in u) {
      if (!Object.prototype.hasOwnProperty.call(u, k)) continue;
      var n = u[k];
      if (typeof n !== "number" || !isFinite(n) || n <= 0) continue;
      var onHand = Math.floor(n);
      if (onHand <= 0) continue;
      units += onHand;
      var v = c[k];
      if (typeof v === "number" && isFinite(v) && v > 0) cost += v;
    }
    shop.stock = units;
    shop.inventoryValue = cost;
  },
  getRetailStaffRoleDefs: function () {
    return {
      clerk: { id: "clerk", name: "Shop Clerk", hireFeeBase: 80, wageBase: 38, wagePerLevel: 4 },
      manager: { id: "manager", name: "Manager", hireFeeBase: 260, wageBase: 110, wagePerLevel: 8, maxCount: 1 },
      driver: { id: "driver", name: "Driver (Van)", hireFeeBase: 160, wageBase: 62, wagePerLevel: 5 }
    };
  },
  generateBritishName: function () {
    var first = [
      "Oliver", "Harry", "George", "Noah", "Jack", "Leo", "Charlie", "Alfie", "Freddie", "Arthur",
      "Amelia", "Olivia", "Isla", "Ava", "Emily", "Sophia", "Grace", "Mia", "Lily", "Ella"
    ];
    var last = [
      "Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Patel", "Wright",
      "Walker", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Clarke", "Cooper", "King"
    ];
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    return pick(first) + " " + pick(last);
  },
  ensureRetailStaffRoster: function (shop) {
    if (!shop) return;
    if (!Array.isArray(shop.staffRoster)) shop.staffRoster = [];
    // Migrate legacy simple counts into a roster once.
    if (!shop._retailRosterMigrated) {
      shop._retailRosterMigrated = true;
      var clerks = (shop.staff && typeof shop.staff.clerks === "number" && isFinite(shop.staff.clerks)) ? Math.floor(shop.staff.clerks) : 0;
      var manager = (shop.staff && typeof shop.staff.manager === "number" && isFinite(shop.staff.manager)) ? Math.floor(shop.staff.manager) : 0;
      if (clerks < 0) clerks = 0;
      if (manager < 0) manager = 0;
      if (shop.staffRoster.length === 0 && (clerks > 0 || manager > 0)) {
        for (var i = 0; i < clerks; i++) {
          shop.staffRoster.push({ id: "rs" + (shop._staffIdCounter++), name: Game.Companies.generateBritishName(), role: "clerk", level: 1, xp: 0, hiredDay: Game.state.day });
        }
        for (var j = 0; j < manager; j++) {
          shop.staffRoster.push({ id: "rs" + (shop._staffIdCounter++), name: Game.Companies.generateBritishName(), role: "manager", level: 1, xp: 0, hiredDay: Game.state.day });
        }
      }
    }
    // Validate entries.
    var roster = shop.staffRoster;
    for (var r = roster.length - 1; r >= 0; r--) {
      var m = roster[r];
      if (!m || typeof m !== "object") { roster.splice(r, 1); continue; }
      if (typeof m.id !== "string" || !m.id) m.id = "rs" + (shop._staffIdCounter++);
      if (typeof m.name !== "string" || !m.name) m.name = Game.Companies.generateBritishName();
      if (typeof m.role !== "string" || !m.role) m.role = "clerk";
      if (typeof m.level !== "number" || !isFinite(m.level) || m.level < 1) m.level = 1;
      if (m.level > 10) m.level = 10;
      if (typeof m.xp !== "number" || !isFinite(m.xp) || m.xp < 0) m.xp = 0;
      if (typeof m.hiredDay !== "number" || !isFinite(m.hiredDay) || m.hiredDay < 1) m.hiredDay = Game.state.day || 1;
    }
  },
  getRetailStaffSummary: function (shop) {
    var s = shop || (Game.state.companies && Game.state.companies.retailShop);
    if (!s) return { clerks: 0, managers: 0, drivers: 0, clerkLevels: 0, managerLevels: 0, driverLevels: 0, vans: 0 };
    Game.Companies.ensureRetailStaffRoster(s);
    var roster = s.staffRoster || [];
    var clerks = 0, managers = 0, drivers = 0;
    var clerkLevels = 0, managerLevels = 0, driverLevels = 0;
    for (var i = 0; i < roster.length; i++) {
      var p = roster[i];
      if (!p) continue;
      var lvl = (typeof p.level === "number" && isFinite(p.level)) ? p.level : 1;
      if (lvl < 1) lvl = 1;
      if (p.role === "manager") { managers += 1; managerLevels += lvl; continue; }
      if (p.role === "driver") { drivers += 1; driverLevels += lvl; continue; }
      clerks += 1; clerkLevels += lvl;
    }
    var vans = (s.vehicles && typeof s.vehicles.vans === "number" && isFinite(s.vehicles.vans)) ? Math.floor(s.vehicles.vans) : 0;
    if (vans < 0) vans = 0;
    return { clerks: clerks, managers: managers, drivers: drivers, clerkLevels: clerkLevels, managerLevels: managerLevels, driverLevels: driverLevels, vans: vans };
  },
  getRetailStaffWageDaily: function (role, level) {
    var defs = Game.Companies.getRetailStaffRoleDefs();
    var def = defs && defs[role] ? defs[role] : defs.clerk;
    level = (typeof level === "number" && isFinite(level)) ? Math.floor(level) : 1;
    if (level < 1) level = 1;
    if (level > 10) level = 10;
    var wage = (def.wageBase || 0) + (def.wagePerLevel || 0) * (level - 1);
    if (!isFinite(wage) || wage < 0) wage = 0;
    return wage;
  },
  hireRetailStaff: function (opts) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    Game.Companies.ensureRetailStaffRoster(s);
    opts = opts || {};
    var role = String(opts.role || "clerk");
    var name = String(opts.name || Game.Companies.generateBritishName());
    var level = parseInt(opts.level, 10);
    if (isNaN(level) || level < 1) level = 1;
    if (level > 5) level = 5;
    var hireFee = parseFloat(opts.hireFee);
    if (!isFinite(hireFee) || hireFee < 0) hireFee = 0;

    var defs = Game.Companies.getRetailStaffRoleDefs();
    var def = defs[role] || defs.clerk;
    var maxCount = typeof def.maxCount === "number" && isFinite(def.maxCount) ? def.maxCount : null;
    if (maxCount !== null) {
      var current = 0;
      for (var i = 0; i < s.staffRoster.length; i++) if (s.staffRoster[i] && s.staffRoster[i].role === role) current++;
      if (current >= maxCount) {
        Game.addNotification(def.name + " limit reached.");
        return;
      }
    }

    if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
    if (s.funds < hireFee) {
      Game.addNotification("Not enough retail business funds to hire staff.");
      return;
    }
    if (hireFee > 0) s.funds -= hireFee;
    s.staffRoster.push({ id: "rs" + (s._staffIdCounter++), name: name, role: def.id, level: level, xp: 0, hiredDay: Game.state.day });
    Game.addNotification("Hired " + def.name + ": " + name + " (L" + level + ").");
    if (window.UI && UI.animateNumber) UI.animateNumber("retailFunds", s.funds);
  },
  fireRetailStaff: function (staffId) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    Game.Companies.ensureRetailStaffRoster(s);
    var id = String(staffId || "");
    if (!id) return;
    for (var i = 0; i < s.staffRoster.length; i++) {
      var p = s.staffRoster[i];
      if (p && p.id === id) {
        var role = p.role || "staff";
        var name = p.name || id;
        s.staffRoster.splice(i, 1);
        Game.addNotification("Staff removed: " + name + " (" + role + ").");
        return;
      }
    }
  },
  tickRetailStaffDaily: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    Game.Companies.ensureRetailStaffRoster(s);
    var roster = s.staffRoster || [];
    var delivered = (typeof s._deliveredRetailOrdersToday === "number" && isFinite(s._deliveredRetailOrdersToday)) ? s._deliveredRetailOrdersToday : 0;
    var driverBonus = Math.min(10, Math.max(0, Math.floor(delivered)));
    s._deliveredRetailOrdersToday = 0;
    for (var i = 0; i < roster.length; i++) {
      var p = roster[i];
      if (!p) continue;
      var baseXp = 1;
      if (p.role === "driver" && driverBonus > 0) baseXp += driverBonus;
      p.xp += baseXp;
      var leveled = 0;
      while (leveled < 5) {
        var threshold = p.level * 10;
        if (p.level >= 10) break;
        if (p.xp < threshold) break;
        p.xp -= threshold;
        p.level += 1;
        leveled += 1;
        Game.addNotification("Staff leveled up: " + (p.name || "Staff") + " is now L" + p.level + ".");
      }
    }
  },
  purchaseRetailItem: function (itemId, units) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    var def = Game.Companies.getRetailItemDef(itemId);
    if (!def) {
      Game.addNotification("Unknown retail item.");
      return;
    }
    var minLevel = typeof def.minLevel === "number" && isFinite(def.minLevel) ? def.minLevel : 0;
    if (s.level < minLevel) {
      Game.addNotification("That item unlocks at retail level " + minLevel + ".");
      return;
    }
    var qty = parseInt(units, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 5000) qty = 5000;
    var buy = typeof def.buyPrice === "number" && isFinite(def.buyPrice) ? def.buyPrice : 0;
    if (buy <= 0) return;
    var cost = buy * qty;
    if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
    if (s.funds < cost) {
      Game.addNotification("Not enough retail business funds to order that stock.");
      return;
    }
    // Place an order into the delivery queue.
    if (!Array.isArray(s.pendingDeliveries)) s.pendingDeliveries = [];
    var leadDays = 1;
    if (buy >= 10) leadDays = 3;
    else if (buy >= 3) leadDays = 2;
    var arrivalDay = (Game.state.day || 1) + leadDays;
    s.funds -= cost;
    s.pendingDeliveries.push({
      id: "rdel" + (s.pendingDeliveries.length + 1) + "-" + (Game.state.day || 1),
      itemId: def.id,
      units: qty,
      unitPrice: buy,
      orderDay: Game.state.day || 1,
      arrivalDay: arrivalDay
    });
    Game.addNotification("Retail stock ordered: +" + qty + " " + def.name + " (ETA " + leadDays + "d).");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
  },
  buyRetailVan: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    if (!s.vehicles || typeof s.vehicles !== "object") s.vehicles = { vans: 0 };
    if (typeof s.vehicles.vans !== "number" || !isFinite(s.vehicles.vans) || s.vehicles.vans < 0) s.vehicles.vans = 0;
    var cost = 850;
    if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
    if (s.funds < cost) {
      Game.addNotification("Not enough retail business funds to buy a van.");
      return;
    }
    s.funds -= cost;
    s.vehicles.vans += 1;
    Game.addNotification("Purchased 1 delivery van for the Retail Shop.");
    if (window.UI && UI.animateNumber) UI.animateNumber("retailFunds", s.funds);
  },
  canRetailDeliver: function (shop) {
    var s = shop || (Game.state.companies && Game.state.companies.retailShop);
    if (!s) return false;
    var sum = Game.Companies.getRetailStaffSummary(s);
    return sum.vans > 0 && sum.drivers > 0;
  },
  resolveRetailDeliveriesDaily: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    if (!Array.isArray(s.pendingDeliveries) || s.pendingDeliveries.length === 0) return;
    var today = Game.state.day || 1;
    var canDeliver = Game.Companies.canRetailDeliver(s);
    var remaining = [];
    var deliveredCount = 0;
    for (var i = 0; i < s.pendingDeliveries.length; i++) {
      var d = s.pendingDeliveries[i];
      if (!d) continue;
      var arrivalDay = (typeof d.arrivalDay === "number" && isFinite(d.arrivalDay)) ? d.arrivalDay : today;
      if (arrivalDay > today) {
        remaining.push(d);
        continue;
      }
      if (!canDeliver) {
        remaining.push(d);
        continue;
      }
      // Deliver into inventory.
      var units = (typeof d.units === "number" && isFinite(d.units) && d.units > 0) ? Math.floor(d.units) : 0;
      if (units <= 0) continue;
      var itemId2 = String(d.itemId || "");
      if (!itemId2) itemId2 = "household_basics";
      var unitPrice = (typeof d.unitPrice === "number" && isFinite(d.unitPrice) && d.unitPrice > 0) ? d.unitPrice : 0;
      if (!s.inventory || typeof s.inventory !== "object") s.inventory = { units: {}, costBasis: {} };
      if (!s.inventory.units || typeof s.inventory.units !== "object") s.inventory.units = {};
      if (!s.inventory.costBasis || typeof s.inventory.costBasis !== "object") s.inventory.costBasis = {};
      if (typeof s.inventory.units[itemId2] !== "number" || !isFinite(s.inventory.units[itemId2]) || s.inventory.units[itemId2] < 0) s.inventory.units[itemId2] = 0;
      if (typeof s.inventory.costBasis[itemId2] !== "number" || !isFinite(s.inventory.costBasis[itemId2]) || s.inventory.costBasis[itemId2] < 0) s.inventory.costBasis[itemId2] = 0;
      s.inventory.units[itemId2] += units;
      s.inventory.costBasis[itemId2] += units * unitPrice;
      deliveredCount += 1;
      var def2 = Game.Companies.getRetailItemDef(itemId2);
      Game.addNotification("Retail delivery received: +" + units + " " + (def2 ? def2.name : itemId2) + ".");
    }
    s.pendingDeliveries = remaining;
    if (deliveredCount > 0) {
      Game.Companies.recomputeRetailDerived(s);
      if (typeof s._deliveredRetailOrdersToday !== "number" || !isFinite(s._deliveredRetailOrdersToday) || s._deliveredRetailOrdersToday < 0) s._deliveredRetailOrdersToday = 0;
      s._deliveredRetailOrdersToday += deliveredCount;
    }
  },
  dispatchRetailDeliveriesNow: function () {
    // Manual dispatch from UI (same rules as daily resolution).
    Game.Companies.resolveRetailDeliveriesDaily();
  },
  getRetailCampaignDefs: function () {
    return [
      { id: "leaflets", name: "Leaflets", costPerDay: 12, popPerDay: 1.0, salesMult: 1.03, priceMult: 1.00 },
      { id: "newspaper", name: "Newspaper", costPerDay: 28, popPerDay: 1.5, salesMult: 1.07, priceMult: 1.01 },
      { id: "radio", name: "Radio", costPerDay: 55, popPerDay: 2.2, salesMult: 1.12, priceMult: 1.03 },
      { id: "tv", name: "TV commercials", costPerDay: 115, popPerDay: 3.5, salesMult: 1.20, priceMult: 1.05 }
    ];
  },
  getRetailCampaignDef: function (id) {
    var defs = Game.Companies.getRetailCampaignDefs();
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === id) return defs[i];
    }
    return defs[0] || null;
  },
  startRetailCampaign: function (channelId, durationDays) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    var def = Game.Companies.getRetailCampaignDef(channelId);
    if (!def) return;
    durationDays = parseInt(durationDays, 10);
    if (isNaN(durationDays) || durationDays <= 0) durationDays = 7;
    if (durationDays > 365) durationDays = 365;

    var totalCost = (def.costPerDay || 0) * durationDays;
    if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
    if (s.funds < totalCost) {
      Game.addNotification("Not enough retail business funds for that campaign.");
      return;
    }
    s.funds -= totalCost;
    s.campaign = {
      channel: def.id,
      daysRemaining: durationDays,
      totalDays: durationDays,
      costPaid: totalCost,
      startDay: Game.state.day
    };
    Game.addNotification("Retail campaign started: " + def.name + " (" + durationDays + " days).");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
  },
  cancelRetailCampaign: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    if (!s.campaign) return;
    var remaining = (s.campaign && typeof s.campaign.daysRemaining === "number" && isFinite(s.campaign.daysRemaining)) ? Math.floor(s.campaign.daysRemaining) : 0;
    var totalDays = (s.campaign && typeof s.campaign.totalDays === "number" && isFinite(s.campaign.totalDays) && s.campaign.totalDays > 0) ? Math.floor(s.campaign.totalDays) : 0;
    if (remaining < 0) remaining = 0;
    if (totalDays < 1) totalDays = remaining;

    // Refund half of the unused portion.
    var costPaid = (s.campaign && typeof s.campaign.costPaid === "number" && isFinite(s.campaign.costPaid) && s.campaign.costPaid > 0) ? s.campaign.costPaid : 0;
    var refund = 0;
    if (costPaid > 0 && totalDays > 0 && remaining > 0) {
      refund = (costPaid * (remaining / totalDays)) * 0.5;
      if (!isFinite(refund) || refund < 0) refund = 0;
    }
    s.campaign = null;
    if (refund > 0) {
      if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
      s.funds += refund;
      if (window.UI && UI.animateNumber) UI.animateNumber("retailFunds", s.funds);
    }
    Game.addNotification("Retail campaign canceled." + (refund > 0 ? (" Refund: $" + refund.toFixed(0) + ".") : ""));
  },
  tickRetailCampaignDaily: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked || !s.campaign) return;
    var remaining = (typeof s.campaign.daysRemaining === "number" && isFinite(s.campaign.daysRemaining)) ? Math.floor(s.campaign.daysRemaining) : 0;
    if (remaining <= 0) {
      s.campaign = null;
      return;
    }
    var def = Game.Companies.getRetailCampaignDef(s.campaign.channel);
    var popPerDay = def && typeof def.popPerDay === "number" && isFinite(def.popPerDay) ? def.popPerDay : 0;
    if (popPerDay > 0) {
      s.popularity += popPerDay;
      if (s.popularity > 100) s.popularity = 100;
    }
    s.campaign.daysRemaining = remaining - 1;
    if (s.campaign.daysRemaining <= 0) {
      Game.addNotification("Retail campaign ended: " + (def ? def.name : "Campaign") + ".");
      s.campaign = null;
    }
  },
  getRetailDailyPayroll: function (shop) {
    var s = shop || (Game.state.companies && Game.state.companies.retailShop);
    if (!s) return 0;
    Game.Companies.ensureRetailStaffRoster(s);
    var roster = s.staffRoster || [];
    var total = 0;
    for (var i = 0; i < roster.length; i++) {
      var p = roster[i];
      if (!p) continue;
      total += Game.Companies.getRetailStaffWageDaily(p.role, p.level);
    }
    // Small van upkeep.
    var vans = (s.vehicles && typeof s.vehicles.vans === "number" && isFinite(s.vehicles.vans)) ? Math.floor(s.vehicles.vans) : 0;
    if (vans > 0) total += vans * 6;
    if (!isFinite(total) || total < 0) total = 0;
    return total;
  },
  adjustRetailStaff: function (role, delta) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    if (!s.staff || typeof s.staff !== "object") s.staff = { clerks: 0, manager: 0 };
    delta = parseInt(delta, 10);
    if (isNaN(delta) || delta === 0) return;
    if (role === "clerks") {
      var before = (typeof s.staff.clerks === "number" && isFinite(s.staff.clerks)) ? Math.floor(s.staff.clerks) : 0;
      var after = before + delta;
      if (after < 0) after = 0;
      if (after > 25) after = 25;
      s.staff.clerks = after;
      if (after !== before) Game.addNotification("Retail staff updated: clerks = " + after + ".");
      return;
    }
    if (role === "manager") {
      var beforeM = (typeof s.staff.manager === "number" && isFinite(s.staff.manager)) ? Math.floor(s.staff.manager) : 0;
      var afterM = beforeM + delta;
      if (afterM < 0) afterM = 0;
      if (afterM > 1) afterM = 1;
      s.staff.manager = afterM;
      if (afterM !== beforeM) Game.addNotification("Retail staff updated: manager = " + afterM + ".");
      return;
    }
  },
  payRetailPayrollDaily: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    var payroll = Game.Companies.getRetailDailyPayroll(s);
    if (!payroll || payroll <= 0) return;
    if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
    if (!s.stats || typeof s.stats !== "object") s.stats = {};
    if (typeof s.stats.todayPayroll !== "number" || !isFinite(s.stats.todayPayroll) || s.stats.todayPayroll < 0) s.stats.todayPayroll = 0;

    if (s.funds >= payroll) {
      s.funds -= payroll;
      s.stats.todayPayroll += payroll;
      if (window.UI && UI.animateNumber) UI.animateNumber("retailFunds", s.funds);
      return;
    }

    // Insufficient funds: default on payroll, apply a penalty to sales for the day.
    s._retailPayrollDefaultDay = Game.state.day;
    s.stats.todayPayroll += s.funds;
    s.funds = 0;
    s.popularity -= 6;
    if (s.popularity < 0) s.popularity = 0;
    Game.addNotification("Retail payroll missed: insufficient business funds. Sales will suffer today.");
    if (window.UI && UI.animateNumber) UI.animateNumber("retailFunds", s.funds);
  },
  applyRetailLevelProgressDaily: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s || !s.unlocked) return;
    if (!s.stats || typeof s.stats !== "object") return;
    var stats = s.stats;
    var profit = (stats.yesterdayRevenue || 0) - (stats.yesterdayCost || 0) - (stats.yesterdayPayroll || 0);
    if (!isFinite(profit) || profit <= 0) return;
    if (typeof s.xp !== "number" || !isFinite(s.xp) || s.xp < 0) s.xp = 0;
    s.xp += profit;
    var leveled = 0;
    while (leveled < 20) {
      var threshold = 900 + s.level * 350;
      if (!isFinite(threshold) || threshold <= 0) threshold = 900;
      if (s.xp < threshold) break;
      s.xp -= threshold;
      s.level += 1;
      leveled += 1;
      s.popularity += 3;
      if (s.popularity > 100) s.popularity = 100;
      Game.addNotification("Retail Shop leveled up: now level " + s.level + ".");
    }
  },
  sellRetailUnits: function (shop, unitsWanted) {
    if (!shop) return { unitsSold: 0, revenue: 0, cost: 0 };
    if (!shop.inventory || typeof shop.inventory !== "object") return { unitsSold: 0, revenue: 0, cost: 0 };
    var invU = shop.inventory.units || {};
    var invC = shop.inventory.costBasis || {};
    unitsWanted = Math.floor(unitsWanted);
    if (!isFinite(unitsWanted) || unitsWanted <= 0) return { unitsSold: 0, revenue: 0, cost: 0 };

    var items = [];
    var totalUnits = 0;
    var totalWeight = 0;
    for (var id in invU) {
      if (!Object.prototype.hasOwnProperty.call(invU, id)) continue;
      var n = invU[id];
      if (typeof n !== "number" || !isFinite(n) || n <= 0) continue;
      var onHand = Math.floor(n);
      if (onHand <= 0) continue;
      totalUnits += onHand;
      var def = Game.Companies.getRetailItemDef(id);
      var demand = def && typeof def.demand === "number" && isFinite(def.demand) && def.demand > 0 ? def.demand : 1;
      var w = onHand * demand;
      if (w <= 0) w = onHand;
      totalWeight += w;
      items.push({ id: id, onHand: onHand, weight: w, def: def });
    }
    if (totalUnits <= 0 || items.length === 0) return { unitsSold: 0, revenue: 0, cost: 0 };
    if (unitsWanted > totalUnits) unitsWanted = totalUnits;
    if (totalWeight <= 0) totalWeight = totalUnits;

    var allocations = {};
    var remaining = unitsWanted;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var share = Math.floor((unitsWanted * it.weight) / totalWeight);
      if (!isFinite(share) || share < 0) share = 0;
      if (share > it.onHand) share = it.onHand;
      allocations[it.id] = share;
      remaining -= share;
    }
    // Distribute remainder to items with remaining stock.
    if (remaining > 0) {
      var progressed = true;
      while (remaining > 0 && progressed) {
        progressed = false;
        for (var j = 0; j < items.length && remaining > 0; j++) {
          var it2 = items[j];
          var already = allocations[it2.id] || 0;
          if (already < it2.onHand) {
            allocations[it2.id] = already + 1;
            remaining -= 1;
            progressed = true;
          }
        }
      }
    }

    var pop = typeof shop.popularity === "number" && isFinite(shop.popularity) ? shop.popularity : 0;
    var level = typeof shop.level === "number" && isFinite(shop.level) ? shop.level : 0;
    var staffSum = Game.Companies.getRetailStaffSummary(shop);
    var managerLevels = staffSum.managerLevels || 0;
    var priceMult = (0.9 + (pop / 100) * 0.25) * (1 + level * 0.03) * (1 + managerLevels * 0.01);
    if (shop.campaign) {
      var cdef = Game.Companies.getRetailCampaignDef(shop.campaign.channel);
      var pm = cdef && typeof cdef.priceMult === "number" && isFinite(cdef.priceMult) ? cdef.priceMult : 1;
      if (pm > 0) priceMult *= pm;
    }
    if (!isFinite(priceMult) || priceMult <= 0) priceMult = 1;

    var soldTotal = 0;
    var revenueTotal = 0;
    var costTotal = 0;
    for (var k in allocations) {
      if (!Object.prototype.hasOwnProperty.call(allocations, k)) continue;
      var qty = allocations[k];
      if (!qty || qty <= 0) continue;
      var onHandNow = (typeof invU[k] === "number" && isFinite(invU[k])) ? Math.floor(invU[k]) : 0;
      if (onHandNow <= 0) continue;
      if (qty > onHandNow) qty = onHandNow;

      var def2 = Game.Companies.getRetailItemDef(k);
      var sell = def2 && typeof def2.sellPrice === "number" && isFinite(def2.sellPrice) ? def2.sellPrice : 0;
      if (sell <= 0) {
        var cb = (typeof invC[k] === "number" && isFinite(invC[k]) && invC[k] > 0) ? invC[k] : 0;
        var avg = cb > 0 && onHandNow > 0 ? (cb / onHandNow) : 1;
        sell = avg * 1.25;
      }
      var unitRevenue = sell * priceMult;
      if (!isFinite(unitRevenue) || unitRevenue < 0) unitRevenue = 0;
      var revenue = unitRevenue * qty;

      var costBasis = (typeof invC[k] === "number" && isFinite(invC[k]) && invC[k] > 0) ? invC[k] : 0;
      var unitCost = (costBasis > 0 && onHandNow > 0) ? (costBasis / onHandNow) : 0;
      var cogs = unitCost * qty;
      if (!isFinite(cogs) || cogs < 0) cogs = 0;

      invU[k] = onHandNow - qty;
      if (invU[k] <= 0) delete invU[k];
      invC[k] = costBasis - cogs;
      if (invC[k] <= 0) delete invC[k];

      soldTotal += qty;
      revenueTotal += revenue;
      costTotal += cogs;
    }

    if (soldTotal > 0) Game.Companies.recomputeRetailDerived(shop);
    return { unitsSold: soldTotal, revenue: revenueTotal, cost: costTotal };
  },
  startRailContract: function () {
    var r = Game.state.companies.railLogistics;
    if (!r.unlocked) {
      Game.addNotification("You must unlock Rail Logistics first.");
      return;
    }
    Game.Companies.ensureRailLogisticsState();
    if (!Array.isArray(r.fleet) || r.fleet.length < 1) {
      Game.addNotification("You need to buy a train before you can start rail contracts.");
      return;
    }
    if (r.activeContract) {
      Game.addNotification("A rail contract is already in progress.");
      return;
    }
    var duration = 8 * 60;
    var payout = 900 + r.level * 260;
    r.activeContract = {
      name: "Regional Freight Run",
      minutesRequired: duration,
      minutesProgress: 0,
      payout: payout
    };
    Game.addNotification("Started a Rail Logistics freight contract.");
  },
  railLocationCatalog: [
    { id: "London", name: "London" },
    { id: "Birmingham", name: "Birmingham" },
    { id: "Manchester", name: "Manchester" },
    { id: "Liverpool", name: "Liverpool" },
    { id: "Leeds", name: "Leeds" },
    { id: "Bristol", name: "Bristol" },
    { id: "Newcastle", name: "Newcastle" },
    { id: "Glasgow", name: "Glasgow" }
  ],
  getRailLocations: function () {
    return Game.Companies.railLocationCatalog || [];
  },
  railSupplyCatalog: [
    { id: "coal", name: "Coal", unitPrice: 6, unitWeight: 1, cargoClass: "general" },
    { id: "steel", name: "Steel", unitPrice: 18, unitWeight: 1, cargoClass: "general" },
    { id: "lumber", name: "Lumber", unitPrice: 9, unitWeight: 1, cargoClass: "general" },
    { id: "grain", name: "Grain", unitPrice: 5, unitWeight: 1, cargoClass: "general" },
    { id: "medical", name: "Medical Supplies", unitPrice: 22, unitWeight: 1, cargoClass: "general" },
    { id: "fuel", name: "Fuel", unitPrice: 12, unitWeight: 1, cargoClass: "flammables" },
    { id: "chemicals", name: "Chemicals", unitPrice: 20, unitWeight: 1, cargoClass: "chemicals" },
    { id: "explosives", name: "Explosives", unitPrice: 35, unitWeight: 1, cargoClass: "explosives" }
  ],
  railCarriageCatalog: [
    { id: "box_general", name: "Class A Box Carriage", cost: 450, capacity: 120, emptyWeightTons: 20, maxLoadTons: 120, cargoClasses: ["general"] },
    { id: "tanker_fuel", name: "Class B Tanker (Flammables)", cost: 900, capacity: 90, emptyWeightTons: 28, maxLoadTons: 90, cargoClasses: ["flammables"], requiresCert: "flammables" },
    { id: "tank_chemical", name: "Class C Tank (Chemicals)", cost: 1100, capacity: 80, emptyWeightTons: 30, maxLoadTons: 80, cargoClasses: ["chemicals"], requiresCert: "chemicals" },
    { id: "secure_explosive", name: "Class D Secure Carriage (Explosives)", cost: 1600, capacity: 60, emptyWeightTons: 35, maxLoadTons: 60, cargoClasses: ["explosives"], requiresCert: "explosives" }
  ],
  railLocomotiveCatalog: [
    { id: "freight", name: "Freight Locomotive", baseCost: 2200, costPerOwned: 800, weightTons: 95, maxSpeedKmh: 120 }
  ],
  railExamCatalog: [
    { id: "flammables", name: "Flammables Haulage Exam", minEducation: 3, fee: 500 },
    { id: "chemicals", name: "Chemicals Handling Exam", minEducation: 5, fee: 900 },
    { id: "explosives", name: "Explosives Safety Exam", minEducation: 7, fee: 1400 }
  ],
  railRouteCatalog: [
    { from: "London", to: "Birmingham", minutes: 170, trail: "LON-BHM" },
    { from: "London", to: "Bristol", minutes: 140, trail: "LON-BRS" },
    { from: "Birmingham", to: "Manchester", minutes: 140, trail: "BHM-MAN" },
    { from: "Birmingham", to: "Leeds", minutes: 150, trail: "BHM-LEE" },
    { from: "Manchester", to: "Liverpool", minutes: 60, trail: "MAN-LIV" },
    { from: "Manchester", to: "Leeds", minutes: 95, trail: "MAN-LEE" },
    { from: "Leeds", to: "Newcastle", minutes: 110, trail: "LEE-NEW" },
    { from: "Manchester", to: "Glasgow", minutes: 240, trail: "MAN-GLA" },
    { from: "Newcastle", to: "Glasgow", minutes: 210, trail: "NEW-GLA" }
  ],
  getRailRoutes: function () {
    return Game.Companies.railRouteCatalog || [];
  },
  getRailSupplyDef: function (id) {
    var defs = Game.Companies.railSupplyCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === id) return defs[i];
    }
    return null;
  },
  getRailCarriageDef: function (id) {
    var defs = Game.Companies.railCarriageCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === id) return defs[i];
    }
    return null;
  },
  getRailExamDef: function (id) {
    var defs = Game.Companies.railExamCatalog || [];
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === id) return defs[i];
    }
    return null;
  },
  getRailLocomotiveDef: function (id) {
    var defs = Game.Companies.railLocomotiveCatalog || [];
    var key = String(id || "freight");
    for (var i = 0; i < defs.length; i++) {
      if (defs[i] && defs[i].id === key) return defs[i];
    }
    for (var j = 0; j < defs.length; j++) {
      if (defs[j]) return defs[j];
    }
    return { id: "freight", name: "Freight Locomotive", baseCost: 2200, costPerOwned: 800, weightTons: 95, maxSpeedKmh: 120 };
  },
  getRailRouteDef: function (from, to) {
    var defs = (Game.Companies && typeof Game.Companies.getRailRoutes === "function") ? Game.Companies.getRailRoutes() : (Game.Companies.railRouteCatalog || []);
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      if (!d) continue;
      if ((d.from === from && d.to === to) || (d.from === to && d.to === from)) return d;
    }
    return null;
  },
  getRailTrailKey: function (from, to) {
    var def = Game.Companies.getRailRouteDef(from, to);
    if (def && def.trail) return def.trail;
    return String(from || "") + "->" + String(to || "");
  },
  ensureRailLogisticsState: function () {
    if (!Game.state || !Game.state.companies || !Game.state.companies.railLogistics) return;
    var r = Game.state.companies.railLogistics;
    if (typeof r.funds !== "number" || !isFinite(r.funds) || r.funds < 0) r.funds = 0;
    if (typeof r.hqLocation !== "string" || !r.hqLocation) r.hqLocation = "London";
    if (!r.staff || typeof r.staff !== "object") r.staff = {};
    if (typeof r.staff.dispatchers !== "number" || !isFinite(r.staff.dispatchers) || r.staff.dispatchers < 0) r.staff.dispatchers = 1;
    if (typeof r.staff.maintenance !== "number" || !isFinite(r.staff.maintenance) || r.staff.maintenance < 0) r.staff.maintenance = 0;
    if (!r.certifications || typeof r.certifications !== "object") r.certifications = {};
    if (typeof r.certifications.flammables !== "boolean") r.certifications.flammables = false;
    if (typeof r.certifications.chemicals !== "boolean") r.certifications.chemicals = false;
    if (typeof r.certifications.explosives !== "boolean") r.certifications.explosives = false;
    if (typeof r._autoDispatchAcc !== "number" || !isFinite(r._autoDispatchAcc) || r._autoDispatchAcc < 0) r._autoDispatchAcc = 0;

    // Fleet (trains + carriages). Back-compat: older saves used r.trains.owned/capacity.
    if (!Array.isArray(r.fleet)) r.fleet = [];
    if (r.fleet.length === 0) {
      var owned = (r.trains && typeof r.trains.owned === "number" && isFinite(r.trains.owned)) ? Math.max(0, Math.floor(r.trains.owned)) : 0;
      if (owned > 0) {
        for (var ti = 0; ti < owned; ti++) {
          r.fleet.push({
            id: "TR-" + (ti + 1),
            name: "Freight Train " + (ti + 1),
            loco: "freight",
            carriages: [{ id: "CAR-" + (ti + 1) + "-1", type: "box_general" }]
          });
        }
      }
    } else {
      for (var ft = 0; ft < r.fleet.length; ft++) {
        var tr = r.fleet[ft];
        if (!tr || typeof tr !== "object") continue;
        if (!tr.id) tr.id = "TR-" + (ft + 1);
        if (!tr.name) tr.name = "Freight Train " + (ft + 1);
        if (!tr.loco) tr.loco = "freight";
        if (!Array.isArray(tr.carriages)) tr.carriages = [];
        if (tr.carriages.length < 1) {
          tr.carriages.push({ id: "CAR-" + (ft + 1) + "-1", type: "box_general" });
        }
        for (var ci = 0; ci < tr.carriages.length; ci++) {
          var car = tr.carriages[ci];
          if (!car || typeof car !== "object") continue;
          if (!car.id) car.id = "CAR-" + (ft + 1) + "-" + (ci + 1);
          if (!car.type) car.type = "box_general";
        }
      }
    }

    // Track a last-known location so the map can show idle trains.
    for (var lf = 0; lf < r.fleet.length; lf++) {
      var tr2 = r.fleet[lf];
      if (!tr2 || typeof tr2 !== "object") continue;
      if (typeof tr2.location !== "string" || !tr2.location) tr2.location = r.hqLocation || "London";
      if (typeof tr2.lastLocation !== "string" || !tr2.lastLocation) tr2.lastLocation = tr2.location;
    }
    if (!r.trains || typeof r.trains !== "object") r.trains = {};
    r.trains.owned = r.fleet.length;
    // Back-compat metric: keep "capacity" as the best general capacity across the fleet.
    var bestGeneral = 0;
    for (var bc = 0; bc < r.fleet.length; bc++) {
      var bt = r.fleet[bc];
      var cap = Game.Companies.getTrainCapacityForClass(bt, "general");
      if (cap > bestGeneral) bestGeneral = cap;
    }
    if (!isFinite(bestGeneral) || bestGeneral < 0) bestGeneral = 0;
    r.trains.capacity = bestGeneral;
    if (!Array.isArray(r.orders)) r.orders = [];
    if (!Array.isArray(r.activeRuns)) r.activeRuns = [];
    if (!r.warehouses || typeof r.warehouses !== "object") r.warehouses = {};
    if (!r.tracks || typeof r.tracks !== "object") r.tracks = {};

    // Warehouses + track conditions are only needed once Rail Logistics is unlocked.
    // Keep this section very cheap because `ensureState()` calls into here frequently.
    if (r.unlocked) {
      var locs = (Game.Companies && typeof Game.Companies.getRailLocations === "function") ? Game.Companies.getRailLocations() : (Game.Companies.railLocationCatalog || []);
      var locCount = Array.isArray(locs) ? locs.length : 0;
      if (typeof r._ensuredLocCount !== "number" || !isFinite(r._ensuredLocCount) || r._ensuredLocCount < 0) r._ensuredLocCount = 0;
      if (r._ensuredLocCount !== locCount) {
        var locIds = [];
        for (var li = 0; li < locs.length; li++) {
          if (locs[li] && locs[li].id) locIds.push(locs[li].id);
        }
        if (locIds.length && locIds.indexOf(r.hqLocation) === -1) {
          r.hqLocation = locIds[0];
        }
        for (var i = 0; i < locs.length; i++) {
          var id = locs[i] && locs[i].id ? locs[i].id : null;
          if (!id) continue;
          if (!r.warehouses[id] || typeof r.warehouses[id] !== "object") {
            r.warehouses[id] = { staff: 0, capacity: 900, inventory: { coal: 0, steel: 0, lumber: 0, grain: 0, medical: 0, fuel: 0, chemicals: 0, explosives: 0 } };
          }
          var w = r.warehouses[id];
          if (typeof w.staff !== "number" || !isFinite(w.staff) || w.staff < 0) w.staff = 0;
          if (typeof w.capacity !== "number" || !isFinite(w.capacity) || w.capacity <= 0) w.capacity = 900;
          if (!w.inventory || typeof w.inventory !== "object") w.inventory = { coal: 0, steel: 0, lumber: 0, grain: 0, medical: 0, fuel: 0, chemicals: 0, explosives: 0 };
          var inv = w.inventory;
          var keys = ["coal", "steel", "lumber", "grain", "medical", "fuel", "chemicals", "explosives"];
          for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            if (typeof inv[key] !== "number" || !isFinite(inv[key]) || inv[key] < 0) inv[key] = 0;
          }
        }
        r._ensuredLocCount = locCount;
      }

      // Initialize track conditions for known trails (only when routes change).
      var routes = (Game.Companies && typeof Game.Companies.getRailRoutes === "function") ? Game.Companies.getRailRoutes() : (Game.Companies.railRouteCatalog || []);
      var routeCount = Array.isArray(routes) ? routes.length : 0;
      if (typeof r._ensuredRouteCount !== "number" || !isFinite(r._ensuredRouteCount) || r._ensuredRouteCount < 0) r._ensuredRouteCount = 0;
      if (r._ensuredRouteCount !== routeCount) {
        for (var ri = 0; ri < routes.length; ri++) {
          var route = routes[ri];
          if (!route) continue;
          var tKey = Game.Companies.getRailTrailKey(route.from, route.to);
          if (!r.tracks[tKey] || typeof r.tracks[tKey] !== "object") {
            r.tracks[tKey] = { condition: 100, level: 0, lastMaintDay: 0 };
          }
          var tr = r.tracks[tKey];
          if (typeof tr.condition !== "number" || !isFinite(tr.condition) || tr.condition < 0) tr.condition = 0;
          if (tr.condition > 100) tr.condition = 100;
          if (typeof tr.level !== "number" || !isFinite(tr.level) || tr.level < 0) tr.level = 0;
          if (typeof tr.lastMaintDay !== "number" || !isFinite(tr.lastMaintDay) || tr.lastMaintDay < 0) tr.lastMaintDay = 0;
        }
        r._ensuredRouteCount = routeCount;
      }
    }

    // Back-compat: older saves had runs without an assigned trainId/cargoClass.
    if (Array.isArray(r.activeRuns) && r.activeRuns.length) {
      var nextAssign = 0;
      for (var ar = 0; ar < r.activeRuns.length; ar++) {
        var run = r.activeRuns[ar];
        if (!run || typeof run !== "object") continue;
        if (!run.cargoClass) {
          var sd = Game.Companies.getRailSupplyDef(run.item);
          if (sd && sd.cargoClass) run.cargoClass = sd.cargoClass;
          else run.cargoClass = "general";
        }
        if (!run.trainId && r.fleet.length) {
          run.trainId = r.fleet[nextAssign % r.fleet.length].id;
          nextAssign++;
        }
      }
    }
  },
  getRailTrackAverageCondition: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var tracks = r.tracks || {};
    var keys = Object.keys(tracks);
    if (!keys.length) return 100;
    var total = 0;
    var count = 0;
    for (var i = 0; i < keys.length; i++) {
      var tr = tracks[keys[i]];
      if (!tr || typeof tr.condition !== "number" || !isFinite(tr.condition)) continue;
      total += Math.max(0, Math.min(100, tr.condition));
      count += 1;
    }
    if (!count) return 100;
    return total / count;
  },
  getRailTrackRepairCost: function (trailKey, targetCondition) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var tracks = r.tracks || {};
    var tr = tracks[trailKey];
    if (!tr) return 0;
    var current = typeof tr.condition === "number" && isFinite(tr.condition) ? tr.condition : 0;
    var target = typeof targetCondition === "number" && isFinite(targetCondition) ? targetCondition : 100;
    target = Math.max(current, Math.min(100, target));
    var points = Math.max(0, target - current);
    if (!points) return 0;
    var costPerPoint = 8;
    var cost = points * costPerPoint;
    return Math.ceil(cost);
  },
  repairRailTrack: function (trailKey, targetCondition) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    var key = String(trailKey || "");
    if (!key) return false;
    var tracks = r.tracks || {};
    var tr = tracks[key];
    if (!tr) return false;
    var current = typeof tr.condition === "number" && isFinite(tr.condition) ? tr.condition : 0;
    var target = typeof targetCondition === "number" && isFinite(targetCondition) ? targetCondition : 100;
    target = Math.max(current, Math.min(100, target));
    var cost = Game.Companies.getRailTrackRepairCost(key, target);
    if (cost <= 0) return false;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to repair that trail.");
      return false;
    }
    r.funds -= cost;
    tr.condition = target;
    tr.lastMaintDay = Game.state.day || 1;
    Game.addNotification("Track repaired: " + key + " now at " + Math.round(target) + "%.");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
    return true;
  },
  hireRailMaintenanceStaff: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    var cost = 220;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to hire maintenance staff.");
      return false;
    }
    r.funds -= cost;
    if (!r.staff) r.staff = {};
    if (typeof r.staff.maintenance !== "number" || !isFinite(r.staff.maintenance) || r.staff.maintenance < 0) r.staff.maintenance = 0;
    r.staff.maintenance += 1;
    Game.addNotification("Hired 1 maintenance crew member.");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
    return true;
  },
  railMaintainTracksDaily: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var staff = (r.staff && typeof r.staff.maintenance === "number" && isFinite(r.staff.maintenance)) ? r.staff.maintenance : 0;
    var tracks = r.tracks || {};
    var keys = Object.keys(tracks);
    if (!staff || !keys.length) return;
    var day = Game.state.day || 1;
    var payrollCost = staff * 45;
    var payrollPaid = true;
    if (r.funds < payrollCost) {
      payrollPaid = false;
      if (typeof r._maintWarnDay !== "number" || r._maintWarnDay !== day) {
        r._maintWarnDay = day;
        Game.addNotification("Rail maintenance payroll missed. Track repairs will be slower.");
      }
    } else {
      r.funds -= payrollCost;
    }
    var basePoints = staff * 2 + Math.floor((r.level || 0) * 0.4);
    if (!payrollPaid) basePoints = Math.floor(basePoints * 0.4);
    if (basePoints <= 0) return;
    var costPerPoint = 6;
    var maxPointsByFunds = Math.floor((r.funds || 0) / costPerPoint);
    var points = Math.min(basePoints, maxPointsByFunds);
    if (points <= 0) return;
    r.funds -= points * costPerPoint;
    var list = keys.map(function (k) {
      var tr = tracks[k];
      var cond = (tr && typeof tr.condition === "number" && isFinite(tr.condition)) ? tr.condition : 0;
      return { key: k, condition: cond };
    }).sort(function (a, b) { return a.condition - b.condition; });
    var remaining = points;
    for (var i = 0; i < list.length && remaining > 0; i++) {
      var entry = list[i];
      var tr = tracks[entry.key];
      if (!tr) continue;
      var current = (typeof tr.condition === "number" && isFinite(tr.condition)) ? tr.condition : 0;
      if (current >= 100) continue;
      var need = Math.ceil(100 - current);
      var add = Math.min(remaining, need);
      tr.condition = Math.min(100, current + add);
      tr.lastMaintDay = day;
      remaining -= add;
    }
  },
  getRailWarehouseUsed: function (warehouse) {
    if (!warehouse || !warehouse.inventory) return 0;
    var inv = warehouse.inventory;
    var total = 0;
    for (var k in inv) {
      if (!Object.prototype.hasOwnProperty.call(inv, k)) continue;
      var v = inv[k];
      if (typeof v === "number" && isFinite(v) && v > 0) total += v;
    }
    return total;
  },
  canRailHaulClass: function (cargoClass) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var c = String(cargoClass || "general");
    if (c === "general") return true;
    return !!(r.certifications && r.certifications[c]);
  },
  setRailHeadquarters: function (hqLocationId) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var hq = String(hqLocationId || "");
    if (!hq) hq = "London";
    // Ensure HQ is one of the operational locations.
    var locs = Game.Companies.getRailLocations().map(function (x) { return x.id; });
    if (locs.indexOf(hq) === -1) hq = locs[0] || "London";
    r.hqLocation = hq;
    // Seed train locations to HQ if unset.
    if (Array.isArray(r.fleet)) {
      for (var i = 0; i < r.fleet.length; i++) {
        var tr = r.fleet[i];
        if (!tr || typeof tr !== "object") continue;
        if (!tr.location) tr.location = hq;
        if (!tr.lastLocation) tr.lastLocation = tr.location;
      }
    }
  },
  findRailPathStops: function (from, to) {
    var start = String(from || "");
    var goal = String(to || "");
    if (!start || !goal || start === goal) return null;
    var routes = Game.Companies.getRailRoutes();
    var nodes = {};
    var adj = {};
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      if (!r || !r.from || !r.to) continue;
      var a = String(r.from);
      var b = String(r.to);
      nodes[a] = true;
      nodes[b] = true;
      if (!adj[a]) adj[a] = [];
      if (!adj[b]) adj[b] = [];
      var w = (typeof r.minutes === "number" && isFinite(r.minutes) && r.minutes > 0) ? r.minutes : 180;
      adj[a].push({ to: b, w: w });
      adj[b].push({ to: a, w: w });
    }
    if (!nodes[start] || !nodes[goal]) return null;

    var dist = {};
    var prev = {};
    var visited = {};
    var keys = Object.keys(nodes);
    for (var k = 0; k < keys.length; k++) dist[keys[k]] = Infinity;
    dist[start] = 0;

    while (true) {
      var u = null;
      var best = Infinity;
      for (var i2 = 0; i2 < keys.length; i2++) {
        var n = keys[i2];
        if (visited[n]) continue;
        if (dist[n] < best) { best = dist[n]; u = n; }
      }
      if (u === null) break;
      if (u === goal) break;
      visited[u] = true;
      var edges = adj[u] || [];
      for (var e = 0; e < edges.length; e++) {
        var v = edges[e].to;
        var alt = dist[u] + edges[e].w;
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }

    if (!isFinite(dist[goal])) return null;
    var path = [goal];
    var cur = goal;
    var guard = 0;
    while (cur !== start && guard < 200) {
      guard++;
      cur = prev[cur];
      if (!cur) return null;
      path.push(cur);
    }
    path.reverse();
    return path.length >= 2 ? path : null;
  },
  getRailRunLocationLabel: function (run) {
    if (!run) return "in transit";
    var origin = run.origin || run.from || "";
    var dest = run.destination || run.to || "";
    var labelFallback = (origin && dest) ? ("en route " + origin + " → " + dest) : "in transit";
    return labelFallback;
  },
  getTrainCapacityForClass: function (train, cargoClass) {
    if (!train || !Array.isArray(train.carriages)) return 0;
    var cls = String(cargoClass || "general");
    var cap = 0;
    for (var i = 0; i < train.carriages.length; i++) {
      var car = train.carriages[i];
      if (!car) continue;
      var def = Game.Companies.getRailCarriageDef(car.type);
      if (!def) continue;
      var allowed = def.cargoClasses || [];
      if (allowed.indexOf(cls) !== -1) {
        cap += def.capacity || 0;
      }
    }
    if (!isFinite(cap) || cap < 0) cap = 0;
    return Math.floor(cap);
  },
  getTrainById: function (trainId) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var id = String(trainId || "");
    for (var i = 0; i < r.fleet.length; i++) {
      if (r.fleet[i] && r.fleet[i].id === id) return r.fleet[i];
    }
    return null;
  },
  isTrainBusy: function (trainId) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!Array.isArray(r.activeRuns)) return false;
    for (var i = 0; i < r.activeRuns.length; i++) {
      var run = r.activeRuns[i];
      if (run && run.trainId === trainId) return true;
    }
    return false;
  },
  pickAvailableTrainFor: function (cargoClass, units) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    var cls = String(cargoClass || "general");
    var need = typeof units === "number" && isFinite(units) ? Math.max(1, Math.floor(units)) : 1;
    for (var i = 0; i < r.fleet.length; i++) {
      var tr = r.fleet[i];
      if (!tr) continue;
      if (Game.Companies.isTrainBusy(tr.id)) continue;
      if (!Array.isArray(tr.carriages) || tr.carriages.length < 1) continue;
      var cap = Game.Companies.getTrainCapacityForClass(tr, cls);
      if (cap >= need) return tr;
    }
    return null;
  },
  getTrainEmptyWeightTons: function (train) {
    if (!train || typeof train !== "object") return 0;
    var loco = Game.Companies.getRailLocomotiveDef(train.loco);
    var wt = (loco && typeof loco.weightTons === "number" && isFinite(loco.weightTons)) ? loco.weightTons : 95;
    if (Array.isArray(train.carriages)) {
      for (var i = 0; i < train.carriages.length; i++) {
        var car = train.carriages[i];
        if (!car) continue;
        var def = Game.Companies.getRailCarriageDef(car.type);
        if (def && typeof def.emptyWeightTons === "number" && isFinite(def.emptyWeightTons) && def.emptyWeightTons > 0) {
          wt += def.emptyWeightTons;
        }
      }
    }
    if (!isFinite(wt) || wt < 0) wt = 0;
    return Math.floor(wt * 10) / 10;
  },
  getTrainMaxLoadTonsForClass: function (train, cargoClass) {
    if (!train || !Array.isArray(train.carriages)) return 0;
    var cls = String(cargoClass || "general");
    var total = 0;
    for (var i = 0; i < train.carriages.length; i++) {
      var car = train.carriages[i];
      if (!car) continue;
      var def = Game.Companies.getRailCarriageDef(car.type);
      if (!def) continue;
      var allowed = def.cargoClasses || [];
      if (allowed.indexOf(cls) === -1) continue;
      var maxLoad = (typeof def.maxLoadTons === "number" && isFinite(def.maxLoadTons)) ? def.maxLoadTons : 0;
      if (maxLoad > 0) total += maxLoad;
    }
    if (!isFinite(total) || total < 0) total = 0;
    return Math.floor(total * 10) / 10;
  },
  getTrainProjectedSpeedKmh: function (train, cargoWeightTons) {
    if (!train || typeof train !== "object") return 0;
    var loco = Game.Companies.getRailLocomotiveDef(train.loco);
    var base = (loco && typeof loco.maxSpeedKmh === "number" && isFinite(loco.maxSpeedKmh)) ? loco.maxSpeedKmh : 120;
    var emptyWt = Game.Companies.getTrainEmptyWeightTons(train);
    var load = (typeof cargoWeightTons === "number" && isFinite(cargoWeightTons) && cargoWeightTons > 0) ? cargoWeightTons : 0;
    var total = emptyWt + load;
    // Simple speed model: heavier trains are slower.
    var speed = base * (1000 / (1000 + total));
    if (!isFinite(speed) || speed < 0) speed = 0;
    if (speed > base) speed = base;
    if (speed < 35) speed = 35;
    return Math.floor(speed);
  },
  getRailRouteDistanceKm: function (from, to, minutesHint) {
    var route = Game.Companies.getRailRouteDef(from, to);
    if (!route) return 0;
    var dk = route.distanceKm;
    if (typeof dk === "number" && isFinite(dk) && dk > 0) return dk;
    var m = (typeof minutesHint === "number" && isFinite(minutesHint) && minutesHint > 0) ? minutesHint : (route.minutes || 0);
    if (!(m > 0)) m = 180;
    // Placeholder conversion until the real map lands.
    var avg = 75; // km/h
    var dist = (m / 60) * avg;
    dist = Math.floor(dist * 10) / 10;
    if (!isFinite(dist) || dist <= 0) dist = 1;
    return dist;
  },
  railProduceSuppliesDaily: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var day = Game.state.day || 1;
    if (r.lastProductionDay === day) return;
    r.lastProductionDay = day;

    // Simple production model: each warehouse staff produces location-themed supplies per day.
    function produce(locId, goods) {
      var w = r.warehouses[locId];
      if (!w) return;
      var staff = w.staff || 0;
      if (staff <= 0) return;
      var used = Game.Companies.getRailWarehouseUsed(w);
      var free = Math.max(0, (w.capacity || 0) - used);
      if (free <= 0) return;
      for (var g = 0; g < goods.length; g++) {
        var item = goods[g].id;
        var perStaff = goods[g].perStaff;
        var add = staff * perStaff;
        if (add <= 0) continue;
        if (add > free) add = free;
        w.inventory[item] += add;
        free -= add;
        if (free <= 0) break;
      }
    }

    produce("Birmingham", [{ id: "steel", perStaff: 6 }, { id: "coal", perStaff: 7 }]);
    produce("Newcastle", [{ id: "coal", perStaff: 8 }]);
    produce("Leeds", [{ id: "grain", perStaff: 10 }, { id: "steel", perStaff: 2 }]);
    produce("Bristol", [{ id: "lumber", perStaff: 6 }, { id: "chemicals", perStaff: 2 }]);
    produce("Manchester", [{ id: "chemicals", perStaff: 6 }]);
    produce("Liverpool", [{ id: "fuel", perStaff: 7 }, { id: "lumber", perStaff: 3 }]);
    produce("Glasgow", [{ id: "explosives", perStaff: 3 }, { id: "steel", perStaff: 3 }]);
    produce("London", [{ id: "medical", perStaff: 4 }, { id: "lumber", perStaff: 2 }, { id: "grain", perStaff: 2 }]);
  },
  generateRailOrdersDaily: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var day = Game.state.day || 1;
    if (r.lastOrderDay === day) return;
    r.lastOrderDay = day;

    // Keep a small rolling list.
    if (!Array.isArray(r.orders)) r.orders = [];
    if (r.orders.length > 12) r.orders = r.orders.slice(-12);

    var locations = (Game.Companies.getRailLocations() || []).map(function (x) { return x.id; });
    var count = 2 + Math.min(4, Math.floor((r.level || 0) / 2));

    function getInventoryItemKeys(locId) {
      var w = r.warehouses && r.warehouses[locId];
      var inv = w && w.inventory ? w.inventory : null;
      if (!inv) return [];
      var keys = [];
      for (var k in inv) {
        if (!Object.prototype.hasOwnProperty.call(inv, k)) continue;
        var v = inv[k];
        if (typeof v === "number" && isFinite(v) && v > 0) keys.push(k);
      }
      return keys;
    }

    function pickRandom(arr) {
      if (!arr || !arr.length) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Prefer origins that actually have goods (prevents "idle forever" from impossible orders).
    var originCandidates = [];
    for (var o = 0; o < locations.length; o++) {
      var loc = locations[o];
      var w0 = r.warehouses && r.warehouses[loc];
      if (!w0) continue;
      if ((w0.staff || 0) <= 0) continue;
      var keys = getInventoryItemKeys(loc);
      if (keys.length) originCandidates.push(loc);
    }
    if (!originCandidates.length) originCandidates = locations.slice();

    function getFreeCapacityAt(locId) {
      var w = r.warehouses && r.warehouses[locId];
      if (!w) return 0;
      if ((w.staff || 0) <= 0) return 0;
      var used = Game.Companies.getRailWarehouseUsed(w);
      return Math.max(0, (w.capacity || 0) - used);
    }

    function canHaulCargoClass(cargoClass) {
      var c = String(cargoClass || "general");
      if (c === "general") return true;
      return Game.Companies.canRailHaulClass(c);
    }

    for (var i = 0; i < count; i++) {
      var from = pickRandom(originCandidates) || pickRandom(locations);
      if (!from) break;
      var to = null;
      // Pick a valid, staffed destination with free capacity and an existing route (direct or multi-leg).
      for (var tries = 0; tries < 14; tries++) {
        var candidate = pickRandom(locations);
        if (!candidate || candidate === from) continue;
        if (!Game.Companies.getRailRouteDef(from, candidate) && !Game.Companies.findRailPathStops(from, candidate)) continue;
        if (getFreeCapacityAt(candidate) <= 0) continue;
        to = candidate;
        break;
      }
      if (!to) { i--; continue; }

      var availableItems = getInventoryItemKeys(from);
      if (!availableItems.length) { i--; continue; }
      var item = pickRandom(availableItems);
      if (!item) { i--; continue; }

      var route = Game.Companies.getRailRouteDef(from, to);
      var pathStops = null;
      var minutesBase = 0;
      if (route) {
        minutesBase = route.minutes || 180;
      } else {
        pathStops = Game.Companies.findRailPathStops(from, to);
        if (!pathStops || pathStops.length < 2) { i--; continue; }
        for (var pi = 0; pi < pathStops.length - 1; pi++) {
          var legDef = Game.Companies.getRailRouteDef(pathStops[pi], pathStops[pi + 1]);
          if (!legDef) { minutesBase = 0; break; }
          minutesBase += (legDef.minutes || 180);
        }
        if (!(minutesBase > 0)) { i--; continue; }
      }

      var units = 20 + Math.floor(Math.random() * 60) + Math.floor((r.level || 0) * 4);
      var supplyDef = Game.Companies.getRailSupplyDef(item);
      var cargoClass = supplyDef && supplyDef.cargoClass ? supplyDef.cargoClass : "general";
      if (!canHaulCargoClass(cargoClass)) { i--; continue; }
      // Cap offers by the best available train capacity for this class (keeps offers actionable).
      var bestCap = 0;
      for (var t = 0; t < r.fleet.length; t++) {
        var tr = r.fleet[t];
        var c2 = Game.Companies.getTrainCapacityForClass(tr, cargoClass);
        if (c2 > bestCap) bestCap = c2;
      }
      if (bestCap <= 0) bestCap = 60;
      if (units > bestCap) units = bestCap;

      // Also cap to what is currently available at the origin and what can fit at the destination.
      var wFrom = r.warehouses[from];
      var have = (wFrom && wFrom.inventory) ? (wFrom.inventory[item] || 0) : 0;
      if (have <= 0) { i--; continue; }
      if (units > have) units = have;
      var freeTo = getFreeCapacityAt(to);
      if (freeTo <= 0) { i--; continue; }
      if (units > freeTo) units = freeTo;
      if (units < 1) { i--; continue; }

      var baseValue = supplyDef ? (supplyDef.unitPrice * units) : (units * 10);
      var hazardMult = (cargoClass === "flammables" ? 1.35 : (cargoClass === "chemicals" ? 1.55 : (cargoClass === "explosives" ? 1.9 : 1.0)));
      var payout = Math.floor(baseValue * (1.35 + (minutesBase / 320)) * hazardMult);
      payout += Math.floor((r.level || 0) * 35);
      r.orders.push({
        id: "RL-" + day + "-" + Math.floor(Math.random() * 99999),
        day: day,
        from: from,
        to: to,
        item: item,
        cargoClass: cargoClass,
        units: units,
        payout: payout,
        minutesBase: minutesBase,
        deadlineDay: day + 2 + Math.floor(Math.random() * 3)
      });
    }
  },
  autoDispatchRailShuffleOnce: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    if (!Array.isArray(r.fleet) || r.fleet.length < 1) return false;
    var dispatchers = r.staff.dispatchers || 0;
    if (dispatchers <= 0) return false;
    var active = Array.isArray(r.activeRuns) ? r.activeRuns.length : 0;
    if (active >= dispatchers) return false;

    var locations = (Game.Companies.getRailLocations() || []).map(function (x) { return x.id; });
    if (!locations.length) return false;

    function inventoryKeys(locId) {
      var w = r.warehouses && r.warehouses[locId];
      if (!w || (w.staff || 0) <= 0 || !w.inventory) return [];
      var keys = [];
      for (var k in w.inventory) {
        if (!Object.prototype.hasOwnProperty.call(w.inventory, k)) continue;
        var v = w.inventory[k];
        if (typeof v === "number" && isFinite(v) && v > 0) keys.push(k);
      }
      return keys;
    }

    function pick(arr) {
      if (!arr || !arr.length) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    // Only pick origins that actually have inventory and staff.
    var origins = [];
    for (var i = 0; i < locations.length; i++) {
      var loc = locations[i];
      if (inventoryKeys(loc).length) origins.push(loc);
    }
    if (!origins.length) return false;

    for (var tries = 0; tries < 18; tries++) {
      var from = pick(origins);
      if (!from) continue;
      var items = inventoryKeys(from);
      if (!items.length) continue;
      var item = pick(items);
      if (!item) continue;

      var supplyDef = Game.Companies.getRailSupplyDef(item);
      var cargoClass = supplyDef && supplyDef.cargoClass ? supplyDef.cargoClass : "general";
      if (!Game.Companies.canRailHaulClass(cargoClass)) continue;

      var to = null;
      for (var j = 0; j < 12; j++) {
        var candidate = pick(locations);
        if (!candidate || candidate === from) continue;
        if (!Game.Companies.getRailRouteDef(from, candidate) && !Game.Companies.findRailPathStops(from, candidate)) continue;
        var wTo = r.warehouses && r.warehouses[candidate];
        if (!wTo || (wTo.staff || 0) <= 0) continue;
        var free = Math.max(0, (wTo.capacity || 0) - Game.Companies.getRailWarehouseUsed(wTo));
        if (free <= 0) continue;
        to = candidate;
        break;
      }
      if (!to) continue;

      var wFrom = r.warehouses[from];
      var have = (wFrom && wFrom.inventory) ? (wFrom.inventory[item] || 0) : 0;
      if (have <= 0) continue;
      var units = Math.max(1, Math.floor(Math.min(have, 20 + Math.random() * 50)));

      var ok = Game.Companies.dispatchRailShipment(from, to, item, units, null, { silent: true, auto: true, cargoClass: cargoClass });
      if (ok) return true;
    }
    return false;
  },
  hireRailDispatcher: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var cost = 260;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to hire a dispatcher.");
      return;
    }
    r.funds -= cost;
    r.staff.dispatchers += 1;
    Game.addNotification("Hired 1 dispatcher.");
  },
  hireRailWarehouseStaff: function (location) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var w = r.warehouses[location];
    if (!w) return;
    var cost = 160;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to hire warehouse staff.");
      return;
    }
    r.funds -= cost;
    w.staff += 1;
    Game.addNotification("Hired 1 warehouse staff at " + location + ".");
  },
  takeRailExam: function (id) {
    // Back-compat: older UI called takeRailExam directly. Exams now live in the Education screen.
    Game.Companies.beginRailExam(id);
  },
  beginRailExam: function (id) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    var def = Game.Companies.getRailExamDef(id);
    if (!def) return false;
    if (r.certifications && r.certifications[id]) {
      Game.addNotification("Certification already unlocked: " + def.name + ".");
      return false;
    }
    var edu = (Game.state.education && typeof Game.state.education.level === "number" && isFinite(Game.state.education.level)) ? Game.state.education.level : 0;
    if (edu < (def.minEducation || 0)) {
      Game.addNotification("You need education level " + (def.minEducation || 0) + " to take this exam.");
      return false;
    }
    var fee = def.fee || 0;
    if (fee > 0 && r.funds < fee) {
      Game.addNotification("Not enough Rail Logistics business funds to pay the exam fee.");
      return false;
    }
    if (!Game.state.education || typeof Game.state.education !== "object") Game.state.education = { level: 0, xp: 0 };
    if (!Game.state.education.railExam || typeof Game.state.education.railExam !== "object") Game.state.education.railExam = { activeId: null, startedDay: 0, startedMinutes: 0 };
    Game.state.education.railExam.activeId = id;
    Game.state.education.railExam.startedDay = Game.state.day || 1;
    Game.state.education.railExam.startedMinutes = Math.floor(Game.state.timeMinutes || 0);
    if (fee > 0) r.funds -= fee;
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
    Game.addNotification("Exam started: " + def.name + ".");
    return true;
  },
  completeRailExam: function (id, passed) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    var def = Game.Companies.getRailExamDef(id);
    if (!def) return false;
    if (!Game.state.education || typeof Game.state.education !== "object") return false;
    if (!Game.state.education.railExam || typeof Game.state.education.railExam !== "object") return false;
    if (String(Game.state.education.railExam.activeId || "") !== String(id || "")) return false;

    Game.state.education.railExam.activeId = null;
    if (passed) {
      if (!r.certifications) r.certifications = {};
      r.certifications[id] = true;
      Game.addNotification("Certification unlocked: " + def.name + ".");
    } else {
      Game.addNotification("Exam failed: " + def.name + ". You can try again later.");
    }
    return true;
  },
  cancelRailExam: function (id) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;
    if (!Game.state.education || typeof Game.state.education !== "object") return false;
    if (!Game.state.education.railExam || typeof Game.state.education.railExam !== "object") return false;
    if (String(Game.state.education.railExam.activeId || "") !== String(id || "")) return false;
    Game.state.education.railExam.activeId = null;
    return true;
  },
  buyRailTrain: function () {
    return Game.Companies.buyRailTrainCustom("box_general", 1);
  },
  buyRailTrainCustom: function (carriageType, carriageCount) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var def = Game.Companies.getRailCarriageDef(carriageType);
    if (!def) return false;
    var n = parseFloat(carriageCount);
    if (!isFinite(n) || n <= 0) n = 1;
    var count = Math.max(1, Math.min(12, Math.floor(n)));

    var owned = Array.isArray(r.fleet) ? r.fleet.length : 0;
    var loco = Game.Companies.getRailLocomotiveDef("freight");
    var locoCost = (loco.baseCost || 2200) + owned * (loco.costPerOwned || 800);
    var cost = locoCost + (def.cost || 0) * count;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to buy a new train.");
      return false;
    }
    r.funds -= cost;
    if (!Array.isArray(r.fleet)) r.fleet = [];
    var idx = r.fleet.length + 1;
    var cars = [];
    for (var ci = 0; ci < count; ci++) {
      cars.push({ id: "CAR-" + idx + "-" + (ci + 1), type: def.id });
    }
    r.fleet.push({
      id: "TR-" + idx,
      name: "Freight Train " + idx,
      loco: loco.id || "freight",
      carriages: cars,
      location: r.hqLocation || "London",
      lastLocation: r.hqLocation || "London"
    });
    r.trains.owned = r.fleet.length;
    Game.addNotification("Purchased a new freight train (" + count + " carriage" + (count === 1 ? "" : "s") + ").");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
    return true;
  },
  buyRailCarriage: function (trainId, carriageType) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var train = Game.Companies.getTrainById(trainId);
    if (!train) return;
    var def = Game.Companies.getRailCarriageDef(carriageType);
    if (!def) return;
    var cost = def.cost || 0;
    if (r.funds < cost) {
      Game.addNotification("Not enough Rail Logistics business funds to buy that carriage.");
      return;
    }
    r.funds -= cost;
    if (!Array.isArray(train.carriages)) train.carriages = [];
    var next = train.carriages.length + 1;
    train.carriages.push({ id: train.id + "-CAR-" + next, type: def.id });
    Game.addNotification("Purchased carriage: " + def.name + ".");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
  },
  depositRailFunds: function (amount) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r.unlocked) {
      Game.addNotification("Rail Logistics is not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Rail Logistics")) {
      Game.addNotification("Not enough money to deposit into Rail Logistics.");
      return;
    }
    r.funds += amount;
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
  },
  withdrawRailFunds: function (amount) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r.unlocked) {
      Game.addNotification("Rail Logistics is not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (amount > r.funds) {
      Game.addNotification("Not enough Rail Logistics business funds to withdraw that amount.");
      return;
    }
    r.funds -= amount;
    Game.addMoney(amount, "Withdraw from Rail Logistics");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
  },
  dispatchRailShipment: function (from, to, item, units, trainId, meta) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return false;

    var silent = !!(meta && meta.silent);
    function notify(msg) {
      if (!silent) Game.addNotification(msg);
    }

    var origin = String(from || "");
    var dest = String(to || "");
    if (!origin || !dest || origin === dest) return false;

    var route = Game.Companies.getRailRouteDef(origin, dest);
    var stops = null;
    if (route) {
      stops = [origin, dest];
    } else if (Game.Companies && typeof Game.Companies.findRailPathStops === "function") {
      stops = Game.Companies.findRailPathStops(origin, dest);
    }
    if (!stops || stops.length < 2) {
      notify("No rail route exists between " + origin + " and " + dest + ".");
      return false;
    }

    var goodsId = String(item || "");
    var supplyDef = Game.Companies.getRailSupplyDef(goodsId);
    if (!supplyDef) return false;

    var n = parseFloat(units);
    if (!isFinite(n) || n <= 0) return false;
    var qty = Math.max(1, Math.floor(n));

    var cargoClass = (meta && meta.cargoClass) ? String(meta.cargoClass) : (supplyDef.cargoClass || "general");
    if (!Game.Companies.canRailHaulClass(cargoClass)) {
      notify("You must pass the " + cargoClass + " exam before you can haul this cargo class.");
      return false;
    }

    var wFrom = r.warehouses[origin];
    var wTo = r.warehouses[dest];
    if (!wFrom || !wTo) return false;
    if ((wFrom.staff || 0) <= 0 || (wTo.staff || 0) <= 0) {
      notify("You need at least 1 warehouse staff at both origin and destination to dispatch a shipment.");
      return false;
    }

    if (!Array.isArray(r.fleet) || r.fleet.length < 1) {
      notify("You need to buy a train before you can dispatch shipments.");
      return false;
    }

    var dispatchers = r.staff.dispatchers || 0;
    var active = Array.isArray(r.activeRuns) ? r.activeRuns.length : 0;
    if (active >= dispatchers) {
      notify("Not enough dispatchers to manage another run.");
      return false;
    }

    var selectedTrain = null;
    if (trainId) {
      selectedTrain = Game.Companies.getTrainById(trainId);
      if (!selectedTrain) return false;
      if (Game.Companies.isTrainBusy(selectedTrain.id)) {
        notify("That train is currently in use.");
        return false;
      }
    } else {
      selectedTrain = Game.Companies.pickAvailableTrainFor(cargoClass, qty);
      if (!selectedTrain) {
        notify("No available train can carry that shipment. Buy a suitable carriage or wait for a train to return.");
        return false;
      }
    }

    if (!Array.isArray(selectedTrain.carriages) || selectedTrain.carriages.length < 1) {
      notify("That train has no carriages.");
      return false;
    }
    var cap = Game.Companies.getTrainCapacityForClass(selectedTrain, cargoClass);
    if (cap <= 0) {
      notify("That train has no carriage capacity for this cargo class.");
      return false;
    }
    if (qty > cap) {
      notify("Shipment is too large for that train. Max for this cargo class is " + cap + " units.");
      return false;
    }
    var cargoWeight = qty * (supplyDef.unitWeight || 1);
    if (!isFinite(cargoWeight) || cargoWeight < 0) cargoWeight = 0;
    var maxLoad = Game.Companies.getTrainMaxLoadTonsForClass(selectedTrain, cargoClass);
    if (maxLoad > 0 && cargoWeight > maxLoad) {
      notify("Shipment is too heavy for that train. Max load for this cargo class is " + maxLoad.toFixed(0) + " tons.");
      return false;
    }

    var invFrom = wFrom.inventory || {};
    var have = invFrom[goodsId] || 0;
    if (have < qty) {
      notify("Not enough " + supplyDef.name + " in " + origin + " warehouse.");
      return false;
    }

    var usedTo = Game.Companies.getRailWarehouseUsed(wTo);
    var freeTo = Math.max(0, (wTo.capacity || 0) - usedTo);
    if (freeTo < qty) {
      notify(dest + " warehouse doesn't have enough free capacity for this delivery.");
      return false;
    }

    // Resolve first leg (supports multi-leg paths across the UK).
    var legFrom = stops[0];
    var legTo = stops[1];
    var legRoute = Game.Companies.getRailRouteDef(legFrom, legTo);
    if (!legRoute) return false;
    var trailKey = Game.Companies.getRailTrailKey(legFrom, legTo);
    var track = r.tracks[trailKey] || { condition: 100, level: 0 };
    var condition = typeof track.condition === "number" && isFinite(track.condition) ? track.condition : 100;
    var baseMinutes = legRoute.minutes || 180;
    var slow = 1 + ((100 - Math.max(0, Math.min(100, condition))) / 100) * 0.5;
    var legDistanceKm = Game.Companies.getRailRouteDistanceKm(legFrom, legTo, (legRoute.minutes || baseMinutes));
    var speedKmh = Game.Companies.getTrainProjectedSpeedKmh(selectedTrain, cargoWeight);
    var minutesFromSpeed = (legDistanceKm > 0 && speedKmh > 0) ? Math.ceil((legDistanceKm / speedKmh) * 60) : baseMinutes;
    var minutesTotal = Math.max(30, Math.floor(minutesFromSpeed * slow));

    // Total route distance (for overall progress + map routing).
    var totalDistanceKm = 0;
    for (var si = 0; si < stops.length - 1; si++) {
      var a = stops[si];
      var b = stops[si + 1];
      var def = Game.Companies.getRailRouteDef(a, b);
      if (!def) { totalDistanceKm = 0; break; }
      totalDistanceKm += Game.Companies.getRailRouteDistanceKm(a, b, def.minutes || 180);
    }
    if (!(totalDistanceKm > 0)) totalDistanceKm = legDistanceKm;

    var payout = 0;
    if (meta && typeof meta.payout === "number" && isFinite(meta.payout)) {
      payout = meta.payout;
    } else {
      var baseValue = (supplyDef.unitPrice || 0) * qty;
      var hazardMult = (cargoClass === "flammables" ? 1.35 : (cargoClass === "chemicals" ? 1.55 : (cargoClass === "explosives" ? 1.9 : 1.0)));
      payout = Math.floor(baseValue * (1.25 + (minutesTotal / 340)) * hazardMult);
      payout += Math.floor((r.level || 0) * 25);
    }

    invFrom[goodsId] = have - qty;
    if (invFrom[goodsId] < 0) invFrom[goodsId] = 0;

    // Track location for UI/map purposes.
    if (selectedTrain && typeof selectedTrain === "object") {
      selectedTrain.location = origin;
      selectedTrain.lastLocation = origin;
    }

    if (!Array.isArray(r.activeRuns)) r.activeRuns = [];
    r.activeRuns.push({
      id: "RUN-" + (Game.state.day || 1) + "-" + Math.floor(Math.random() * 99999),
      orderId: (meta && meta.orderId) ? meta.orderId : null,
      trainId: selectedTrain.id,
      origin: origin,
      destination: dest,
      stops: stops,
      legIndex: 0,
      from: legFrom,
      to: legTo,
      item: goodsId,
      cargoClass: cargoClass,
      units: qty,
      distanceKm: totalDistanceKm,
      speedKmh: speedKmh,
      speedKmhTarget: speedKmh,
      speedKmhCurrent: Math.max(8, Math.min(speedKmh, 18)),
      distanceLeftKm: totalDistanceKm,
      legDistanceKm: legDistanceKm,
      legDistanceLeftKm: legDistanceKm,
      weightTons: Game.Companies.getTrainEmptyWeightTons(selectedTrain) + cargoWeight,
      payout: payout,
      deadlineDay: (meta && typeof meta.deadlineDay === "number" && isFinite(meta.deadlineDay)) ? meta.deadlineDay : ((Game.state.day || 1) + 3),
      trail: trailKey,
      minutesTotal: minutesTotal,
      minutesLeft: minutesTotal,
      notifyStage: 0,
      silent: silent,
      startedDay: Game.state.day || 1,
      startedMinute: Math.floor(Game.state.timeMinutes || 0)
    });

    // If this was a listed order, remove it so it can't be dispatched multiple times.
    if (meta && meta.orderId && Array.isArray(r.orders)) {
      var remaining = [];
      for (var oi = 0; oi < r.orders.length; oi++) {
        if (r.orders[oi] && r.orders[oi].id === meta.orderId) continue;
        remaining.push(r.orders[oi]);
      }
      r.orders = remaining;
    }

    var via = "";
    if (stops.length > 2) {
      var mid = stops.slice(1, -1);
      via = " via " + mid.slice(0, 3).join(", ") + (mid.length > 3 ? "…" : "");
    }
    if (stops.length > 2) {
      var mid2 = stops.slice(1, -1);
      via = " via " + mid2.slice(0, 3).join(", ") + (mid2.length > 3 ? "..." : "");
    }
    notify("Dispatched " + selectedTrain.name + " from " + origin + " to " + dest + via + " (" + qty + " " + supplyDef.name + ").");
    return true;
  },
  dispatchRailOrder: function (orderId) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    var order = null;
    for (var i = 0; i < r.orders.length; i++) {
      if (r.orders[i] && r.orders[i].id === orderId) {
        order = r.orders[i];
        break;
      }
    }
    if (!order) return;
    return Game.Companies.dispatchRailShipment(order.from, order.to, order.item, order.units, null, {
      orderId: order.id,
      payout: order.payout,
      minutesBase: order.minutesBase,
      deadlineDay: order.deadlineDay,
      cargoClass: order.cargoClass
    });
  },
  autoDispatchRailOrdersTick: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    r._autoDispatchAcc += minutes;
    var interval = 15;
    var safety = 0;
    while (r._autoDispatchAcc >= interval && safety < 6) {
      r._autoDispatchAcc -= interval;
      safety += 1;
      Game.Companies.autoDispatchRailOrdersOnce();
    }
  },
  autoDispatchRailOrdersOnce: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    if (!Array.isArray(r.fleet) || r.fleet.length < 1) return;

    var dispatchers = r.staff.dispatchers || 0;
    if (dispatchers <= 0) return;

    if (!Array.isArray(r.orders) || !r.orders.length) {
      if (Game.Companies && typeof Game.Companies.autoDispatchRailShuffleOnce === "function") {
        Game.Companies.autoDispatchRailShuffleOnce();
      }
      return;
    }

    // Pick best-paying orders first.
    var sorted = r.orders.slice().sort(function (a, b) {
      var pa = a && typeof a.payout === "number" ? a.payout : 0;
      var pb = b && typeof b.payout === "number" ? b.payout : 0;
      return pb - pa;
    });

    var attempts = 0;
    var anySuccess = false;
    for (var i = 0; i < sorted.length; i++) {
      if (attempts >= 10) break;
      var active = Array.isArray(r.activeRuns) ? r.activeRuns.length : 0;
      if (active >= dispatchers) break;
      var order = sorted[i];
      if (!order || !order.id) continue;
      attempts += 1;
      var ok = Game.Companies.dispatchRailShipment(order.from, order.to, order.item, order.units, null, {
        orderId: order.id,
        payout: order.payout,
        minutesBase: order.minutesBase,
        deadlineDay: order.deadlineDay,
        cargoClass: order.cargoClass,
        silent: true
      });
      if (ok) anySuccess = true;
    }

    // If no listed contracts can be fulfilled right now, still keep trains moving by hauling
    // any available warehouse inventory between staffed locations.
    if (!anySuccess && Game.Companies && typeof Game.Companies.autoDispatchRailShuffleOnce === "function") {
      Game.Companies.autoDispatchRailShuffleOnce();
    }
  },
  railCompleteRun: function (run) {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!run) return;
    var finalTo = run.destination || run.to;
    if (run.trainId) {
      var trn = Game.Companies.getTrainById(run.trainId);
      if (trn && typeof trn === "object") {
        trn.location = finalTo;
        trn.lastLocation = finalTo;
      }
    }
    var wTo = r.warehouses[finalTo];
    if (wTo && wTo.inventory) {
      var current = wTo.inventory[run.item] || 0;
      wTo.inventory[run.item] = current + (run.units || 0);
    }
    var payout = run.payout || 0;
    var day = Game.state.day || 1;
    if (typeof run.deadlineDay === "number" && isFinite(run.deadlineDay) && day > run.deadlineDay) {
      payout = Math.floor(payout * 0.7);
    }
    if (Game.Prestige && typeof Game.Prestige.getCompanyRevenueMultiplier === "function") {
      payout *= Game.Prestige.getCompanyRevenueMultiplier();
    }
    r.funds += payout;
    r.reputation += 2;
    r.level += 1;

    // Track wear and tear on this trail.
    if (run.trail) {
      var tr = r.tracks[run.trail];
      if (tr && typeof tr.condition === "number" && isFinite(tr.condition)) {
        tr.condition -= Math.max(0.5, (run.units || 0) * 0.03);
        if (tr.condition < 0) tr.condition = 0;
      }
    }
    Game.addNotification("Rail delivery complete (" + (finalTo || "destination") + "): +$" + payout.toFixed(0) + " business funds.");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("railFunds", r.funds);
    }
  },
  railDaily: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    Game.Companies.railProduceSuppliesDaily();
    Game.Companies.generateRailOrdersDaily();
    if (Game.Companies && typeof Game.Companies.railMaintainTracksDaily === "function") {
      Game.Companies.railMaintainTracksDaily();
    }
    // Remove expired orders.
    var day = Game.state.day || 1;
    var keep = [];
    for (var i = 0; i < r.orders.length; i++) {
      var o = r.orders[i];
      if (!o) continue;
      var dl = (typeof o.deadlineDay === "number" && isFinite(o.deadlineDay)) ? o.deadlineDay : (day + 1);
      if (day > dl + 2) continue;
      keep.push(o);
    }
    r.orders = keep;
  },
  tickRail: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return;
    // Legacy contract (kept for older UI flows).
    if (r.activeContract) {
      if (typeof r.contractProgress !== "number" || !isFinite(r.contractProgress)) r.contractProgress = 0;
      if (typeof r.activeContract.minutesProgress !== "number" || !isFinite(r.activeContract.minutesProgress)) r.activeContract.minutesProgress = 0;
      r.contractProgress += minutes;
      r.activeContract.minutesProgress += minutes;
      if (r.activeContract.minutesProgress >= r.activeContract.minutesRequired) {
        var payout = r.activeContract.payout;
        if (Game.Prestige && typeof Game.Prestige.getCompanyRevenueMultiplier === "function") {
          payout *= Game.Prestige.getCompanyRevenueMultiplier();
        }
        if (typeof r.funds !== "number") r.funds = 0;
        r.funds += payout;
        r.reputation += 5;
        r.level += 1;
        Game.addNotification("Rail Logistics contract completed. Business funds increased.");
        r.activeContract = null;
        r.contractProgress = 0;
        if (window.UI && UI.animateNumber) {
          UI.animateNumber("railFunds", r.funds);
        }
      }
    }

    // Active simulation runs.
    if (Array.isArray(r.activeRuns) && r.activeRuns.length) {
      var completed = [];
      for (var i = 0; i < r.activeRuns.length; i++) {
        var run = r.activeRuns[i];
        if (!run) continue;

        var dist = (typeof run.distanceKm === "number" && isFinite(run.distanceKm) && run.distanceKm > 0) ? run.distanceKm : 0;
        if (dist > 0) {
          if (typeof run.distanceLeftKm !== "number" || !isFinite(run.distanceLeftKm)) {
            var total2 = (typeof run.minutesTotal === "number" && isFinite(run.minutesTotal) && run.minutesTotal > 0) ? run.minutesTotal : 1;
            var left2 = (typeof run.minutesLeft === "number" && isFinite(run.minutesLeft)) ? run.minutesLeft : total2;
            var frac = Math.max(0, Math.min(1, left2 / total2));
            run.distanceLeftKm = dist * frac;
          }
          if (typeof run.legDistanceKm !== "number" || !isFinite(run.legDistanceKm) || run.legDistanceKm <= 0) {
            // Back-compat for older runs: treat the run as a single leg.
            run.legDistanceKm = dist;
          }
          if (typeof run.legDistanceLeftKm !== "number" || !isFinite(run.legDistanceLeftKm)) {
            // Default the current leg left to the total left.
            run.legDistanceLeftKm = run.distanceLeftKm;
          }
          if (typeof run.speedKmhTarget !== "number" || !isFinite(run.speedKmhTarget) || run.speedKmhTarget <= 0) {
            run.speedKmhTarget = (typeof run.speedKmh === "number" && isFinite(run.speedKmh) && run.speedKmh > 0) ? run.speedKmh : 60;
          }
          if (typeof run.speedKmhCurrent !== "number" || !isFinite(run.speedKmhCurrent) || run.speedKmhCurrent <= 0) {
            run.speedKmhCurrent = Math.max(8, Math.min(run.speedKmhTarget, 18));
          }

          // Track condition slows effective speed.
          var slow = 1;
          if (run.trail && r.tracks && r.tracks[run.trail]) {
            var tr = r.tracks[run.trail];
            var condition = (tr && typeof tr.condition === "number" && isFinite(tr.condition)) ? tr.condition : 100;
            slow = 1 + ((100 - Math.max(0, Math.min(100, condition))) / 100) * 0.5;
          }
          var targetEff = run.speedKmhTarget / slow;
          if (!isFinite(targetEff) || targetEff <= 0) targetEff = 35;
          if (targetEff < 20) targetEff = 20;

          // Smooth acceleration towards cruising speed.
          var lerp = minutes / 90;
          if (lerp < 0) lerp = 0;
          if (lerp > 1) lerp = 1;
          run.speedKmhCurrent += (targetEff - run.speedKmhCurrent) * lerp;
          if (run.speedKmhCurrent < 8) run.speedKmhCurrent = 8;

          var travelKm = (run.speedKmhCurrent * minutes) / 60;
          if (!isFinite(travelKm) || travelKm < 0) travelKm = 0;
          if (typeof run.legDistanceLeftKm === "number" && isFinite(run.legDistanceLeftKm) && run.legDistanceLeftKm > 0) {
            if (travelKm > run.legDistanceLeftKm) travelKm = run.legDistanceLeftKm;
          }
          run.legDistanceLeftKm -= travelKm;
          if (run.legDistanceLeftKm < 0) run.legDistanceLeftKm = 0;
          run.distanceLeftKm -= travelKm;
          if (run.distanceLeftKm < 0) run.distanceLeftKm = 0;

          // Derive ETA from remaining distance.
          var etaMin = run.distanceLeftKm > 0 ? ((run.distanceLeftKm / Math.max(1, run.speedKmhCurrent)) * 60) : 0;
          if (!isFinite(etaMin) || etaMin < 0) etaMin = 0;
          run.minutesLeft = etaMin;

          // Notify progress milestones with real place names (throttled by stage).
          var pctDone = dist > 0 ? (1 - (run.distanceLeftKm / dist)) : 0;
          if (pctDone < 0) pctDone = 0;
          if (pctDone > 1) pctDone = 1;
          var stage = Math.floor(pctDone * 4); // 0..4
          if (typeof run.notifyStage !== "number" || !isFinite(run.notifyStage) || run.notifyStage < 0) run.notifyStage = 0;
          var shouldNotify = stage > run.notifyStage && stage >= 1 && stage <= 3;
          if (shouldNotify && run.silent && stage !== 2) shouldNotify = false;
          if (shouldNotify) {
            run.notifyStage = stage;
            var trn = run.trainId ? Game.Companies.getTrainById(run.trainId) : null;
            var trainName = trn && trn.name ? trn.name : (run.trainId || "Train");
            var locLabel = (Game.Companies && typeof Game.Companies.getRailRunLocationLabel === "function") ? Game.Companies.getRailRunLocationLabel(run) : "in transit";
            Game.addNotification(trainName + " " + locLabel + " (" + Math.floor(pctDone * 100) + "%).");
          }

          // Multi-leg routing: advance to next leg when the current leg completes.
          if (run.legDistanceLeftKm <= 0 && Array.isArray(run.stops) && run.stops.length >= 2) {
            if (typeof run.legIndex !== "number" || !isFinite(run.legIndex) || run.legIndex < 0) run.legIndex = 0;
            var nextIndex = run.legIndex + 1;
            if (nextIndex < run.stops.length - 1) {
              // Apply wear to the completed trail.
              if (run.trail && r.tracks && r.tracks[run.trail] && typeof r.tracks[run.trail].condition === "number") {
                r.tracks[run.trail].condition -= Math.max(0.5, (run.units || 0) * 0.02);
                if (r.tracks[run.trail].condition < 0) r.tracks[run.trail].condition = 0;
              }
              run.legIndex = nextIndex;
              run.from = run.stops[nextIndex];
              run.to = run.stops[nextIndex + 1];
              run.trail = Game.Companies.getRailTrailKey(run.from, run.to);
              var def2 = Game.Companies.getRailRouteDef(run.from, run.to);
              var legDist2 = def2 ? Game.Companies.getRailRouteDistanceKm(run.from, run.to, def2.minutes || 180) : 0;
              if (!(legDist2 > 0)) legDist2 = 1;
              run.legDistanceKm = legDist2;
              run.legDistanceLeftKm = legDist2;
              run.speedKmhCurrent = Math.max(8, Math.min(run.speedKmhTarget || run.speedKmh || 60, 18));
              if (run.trainId) {
                var t2 = Game.Companies.getTrainById(run.trainId);
                if (t2 && typeof t2 === "object") {
                  t2.location = run.from;
                  t2.lastLocation = run.from;
                }
              }
            }
          }

          if (run.distanceLeftKm <= 0) completed.push(run);
        } else {
          if (typeof run.minutesLeft !== "number" || !isFinite(run.minutesLeft)) run.minutesLeft = run.minutesTotal || 0;
          run.minutesLeft -= minutes;
          if (run.minutesLeft <= 0) {
            completed.push(run);
          }
        }
      }
      if (completed.length) {
        var remaining = [];
        for (var j = 0; j < r.activeRuns.length; j++) {
          var rr = r.activeRuns[j];
          if (!rr) continue;
          if ((typeof rr.distanceLeftKm === "number" && isFinite(rr.distanceLeftKm) && rr.distanceLeftKm <= 0) || rr.minutesLeft <= 0) continue;
          remaining.push(rr);
        }
        r.activeRuns = remaining;
        for (var k = 0; k < completed.length; k++) {
          Game.Companies.railCompleteRun(completed[k]);
        }
      }
    }

    // Auto-accept and dispatch delivery contracts.
    Game.Companies.autoDispatchRailOrdersTick(minutes);
  },
  startOreRun: function () {
    var m = Game.state.companies.miningCorp;
    if (!m.unlocked) {
      Game.addNotification("Mining Corp is not unlocked yet.");
      return;
    }
    if (m.activeRunMinutes > 0) {
      Game.addNotification("Drilling operation already running.");
      return;
    }
    m.activeRunTotal = 6 * 60;
    m.activeRunMinutes = m.activeRunTotal;
    Game.addNotification("Started a Mining Corp drilling operation.");
  },
  tickMiningCorp: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureState();
    var m = Game.state.companies.miningCorp;
    var edu = (Game.state.education && typeof Game.state.education.level === "number" && isFinite(Game.state.education.level)) ? Math.floor(Game.state.education.level) : 0;
    var morale = (typeof m.morale === "number" && isFinite(m.morale)) ? m.morale : 70;
    if (morale < 0) morale = 0;
    if (morale > 100) morale = 100;
    var moraleMult = 0.7 + (morale / 100) * 0.6;
    if (moraleMult < 0.5) moraleMult = 0.5;
    if (moraleMult > 1.3) moraleMult = 1.3;
    var eduMult = 1 + Math.min(0.12, edu * 0.02);
    Game.Companies.ensureMiningMines();
    Game.Companies.ensureMiningContracts();
    // Legacy single drilling run
    if (m.activeRunMinutes > 0) {
      var before = m.activeRunMinutes;
      var used = Math.min(before, minutes);
      m.activeRunMinutes = before - minutes;
      if (m.activeRunMinutes < 0) m.activeRunMinutes = 0;
      var total = (m.activeRunTotal || (6 * 60));
      if (total > 0 && used > 0) {
        var fraction = used / total;
        m.oreStock += 10 * fraction * (1 + m.level * 0.4) * moraleMult * eduMult;
      }
      if (before > 0 && m.activeRunMinutes === 0) {
        Game.addNotification("Mining Corp drilling operation finished. Ore stock increased.");
      }
    }
    // Advanced mining simulation for owned mines
    if (m.mines.length > 0) {
      for (var mi = 0; mi < m.mines.length; mi++) {
        var mine = m.mines[mi];
        if (!mine.active) continue;
        if (typeof mine.contractDaysLeft === "number" && isFinite(mine.contractDaysLeft) && mine.contractDaysLeft <= 0) continue;
        var staff = m.staffPerMine[mine.id] || 0;
        var machines = m.machinesPerMine[mine.id] || 0;
        if (staff <= 0 || machines <= 0) continue;
        var capacityPerDay = mine.baseCapacity * (1 + mine.level * 0.25);
        var perMinute = capacityPerDay / (24 * 60);
        var output = perMinute * minutes * Math.min(staff / mine.requiredStaff, machines / mine.requiredMachines) * moraleMult * eduMult;
        if (output <= 0) continue;
        var mix = mine.oreMix || { iron: 1, copper: 0, silver: 0, gold: 0 };

        // Gold is a rare outcome and capped per contract.
        var gold = 0;
        var goldRemaining = (typeof mine.goldRemaining === "number" && isFinite(mine.goldRemaining)) ? mine.goldRemaining : 0;
        if (goldRemaining > 0 && typeof m.level === "number" && isFinite(m.level) && m.level > 0) {
          var def = Game.Companies.getMineDef(mine.id);
          var mult = (def && typeof def.goldChanceMult === "number" && isFinite(def.goldChanceMult) && def.goldChanceMult > 0) ? def.goldChanceMult : 1;
          // 0.05% chance per business level (per in-game mining minute).
          var chancePerMinute = m.level * 0.0005 * mult;
          if (chancePerMinute > 0.75) chancePerMinute = 0.75;
          if (chancePerMinute < 0) chancePerMinute = 0;

          var lambda = minutes * chancePerMinute;
          if (lambda > 0) {
            var events = 0;
            if (lambda < 30) {
              var L = Math.exp(-lambda);
              var k2 = 0;
              var p2 = 1;
              do {
                k2++;
                p2 *= Math.random();
              } while (p2 > L);
              events = k2 - 1;
            } else {
              var u = Math.random();
              if (u < 1e-12) u = 1e-12;
              var v = Math.random();
              var z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
              events = Math.round(lambda + z * Math.sqrt(lambda));
              if (events < 0) events = 0;
            }

            if (events > 0) {
              var goldPerEvent = 0.01; // tons
              var potential = events * goldPerEvent;
              gold = Math.min(potential, goldRemaining, output);
              if (gold > 0) {
                mine.goldRemaining = goldRemaining - gold;
                if (mine.goldRemaining < 0) mine.goldRemaining = 0;
              }
            }
          }
        }

        var nonGoldOutput = output - gold;
        if (nonGoldOutput < 0) nonGoldOutput = 0;
        var totalMix = (mix.iron || 0) + (mix.copper || 0) + (mix.silver || 0);
        if (!totalMix || totalMix <= 0) totalMix = 1;
        var iron = nonGoldOutput * ((mix.iron || 0) / totalMix);
        var copper = nonGoldOutput * ((mix.copper || 0) / totalMix);
        var silver = nonGoldOutput * ((mix.silver || 0) / totalMix);
        m.oreDetail.iron += iron;
        m.oreDetail.copper += copper;
        m.oreDetail.silver += silver;
        m.oreDetail.gold += gold;
        m.oreStock += output;
      }
    }
    Game.Companies.autoSellOreTick(minutes);
  },
  getMiningLogisticsMultiplier: function () {
    Game.Companies.ensureRailLogisticsState();
    var r = Game.state.companies.railLogistics;
    if (!r || !r.unlocked) return 1;
    var level = (typeof r.level === "number" && isFinite(r.level)) ? r.level : 0;
    var levelBonus = Math.min(0.18, level * 0.006);
    var avgCond = (Game.Companies && typeof Game.Companies.getRailTrackAverageCondition === "function") ? Game.Companies.getRailTrackAverageCondition() : 100;
    var condBonus = 0;
    if (avgCond >= 80) condBonus = 0.05;
    else if (avgCond >= 60) condBonus = 0.02;
    return 1 + levelBonus + condBonus;
  },
  getOreUnitPrice: function (oreType) {
    var prices = {
      iron: 100,
      copper: 500,
      silver: 1000,
      gold: 5000
    };
    if (oreType && Object.prototype.hasOwnProperty.call(prices, oreType)) {
      return prices[oreType];
    }
    // Fallback: weighted average based on current stock, used for summary UI.
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningMines();
    var d = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
    var total = (d.iron || 0) + (d.copper || 0) + (d.silver || 0) + (d.gold || 0);
    if (total > 0) {
      var totalValue =
        (d.iron || 0) * prices.iron +
        (d.copper || 0) * prices.copper +
        (d.silver || 0) * prices.silver +
        (d.gold || 0) * prices.gold;
      return totalValue / total;
    }
    return prices.iron;
  },
  getOreTotalPrice: function () {
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningMines();
    var d = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
    return (
      (d.iron || 0) * Game.Companies.getOreUnitPrice("iron") +
      (d.copper || 0) * Game.Companies.getOreUnitPrice("copper") +
      (d.silver || 0) * Game.Companies.getOreUnitPrice("silver") +
      (d.gold || 0) * Game.Companies.getOreUnitPrice("gold")
    );
  },
  sellOre: function (selection) {
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningMines();
    var d = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
    var useSelection = selection && typeof selection === "object";

    // Determine how much of each ore type is eligible to sell,
    // enforcing a minimum of 1.0t and selling only whole-ton increments.
    function sellable(amount, isSelected) {
      if (!isSelected) return 0;
      if (!amount || amount <= 0) return 0;
      return Math.floor(amount); // whole tons only
    }

    var ironAvail = d.iron || 0;
    var copperAvail = d.copper || 0;
    var silverAvail = d.silver || 0;
    var goldAvail = d.gold || 0;

    var sellIron = sellable(ironAvail, useSelection ? !!selection.iron : true);
    var sellCopper = sellable(copperAvail, useSelection ? !!selection.copper : true);
    var sellSilver = sellable(silverAvail, useSelection ? !!selection.silver : true);
    var sellGold = sellable(goldAvail, useSelection ? !!selection.gold : true);

    var totalUnits = sellIron + sellCopper + sellSilver + sellGold;

    if (!totalUnits || totalUnits <= 0) {
      Game.addNotification("You need at least 1.0 ton of an ore type to sell it.");
      return;
    }

    // Per-ore prices.
    var ironPrice = Game.Companies.getOreUnitPrice("iron");
    var copperPrice = Game.Companies.getOreUnitPrice("copper");
    var silverPrice = Game.Companies.getOreUnitPrice("silver");
    var goldPrice = Game.Companies.getOreUnitPrice("gold");

    var payout =
      sellIron * ironPrice +
      sellCopper * copperPrice +
      sellSilver * silverPrice +
      sellGold * goldPrice;

    // Reduce overall ore stock by the total sold (whole tons only).
    if (typeof m.oreStock !== "number") m.oreStock = 0;
    m.oreStock -= totalUnits;
    if (m.oreStock < 0) m.oreStock = 0;

    // Reduce detailed ore counts, preserving any fractional remainder.
    if (!m.oreDetail) {
      m.oreDetail = { iron: 0, copper: 0, silver: 0, gold: 0 };
    }
    m.oreDetail.iron = Math.max(0, ironAvail - sellIron);
    m.oreDetail.copper = Math.max(0, copperAvail - sellCopper);
    m.oreDetail.silver = Math.max(0, silverAvail - sellSilver);
    m.oreDetail.gold = Math.max(0, goldAvail - sellGold);

    m.level += 1;
    if (payout > 0) {
      var logisticsMult = (Game.Companies && typeof Game.Companies.getMiningLogisticsMultiplier === "function") ? Game.Companies.getMiningLogisticsMultiplier() : 1;
      if (typeof logisticsMult === "number" && isFinite(logisticsMult) && logisticsMult > 1) {
        payout *= logisticsMult;
      }
      if (typeof m.funds !== "number") m.funds = 0;
      if (Game.Prestige && typeof Game.Prestige.getCompanyRevenueMultiplier === "function") {
        payout *= Game.Prestige.getCompanyRevenueMultiplier();
      }
      m.funds += payout;
      Game.addNotification("Mining Corp sold ore worth $" + payout.toFixed(0) + " into business funds.");
      if (window.UI && UI.animateNumber) {
        UI.animateNumber("miningFunds", m.funds);
      }
    }
  },
  ensureMiningMines: function () {
    var m = Game.state.companies.miningCorp;
    if (!m.mines) m.mines = [];
    if (!m.staffPerMine) m.staffPerMine = {};
    if (!m.machinesPerMine) m.machinesPerMine = {};
    if (!m.oreDetail) m.oreDetail = { iron: 0, copper: 0, silver: 0, gold: 0 };
    if (typeof m.daysUntilPayroll !== "number" || m.daysUntilPayroll <= 0) m.daysUntilPayroll = 7;
    if (typeof m.funds !== "number") m.funds = 0;
    if (typeof m.morale !== "number" || !isFinite(m.morale) || m.morale < 0) m.morale = 70;
    if (m.morale > 100) m.morale = 100;
    if (!m.autoSell) {
      m.autoSell = { iron: false, copper: false, silver: false, gold: false };
    }
    if (typeof m.autoSellIntervalMinutes !== "number" || !isFinite(m.autoSellIntervalMinutes) || m.autoSellIntervalMinutes <= 0) {
      m.autoSellIntervalMinutes = 3 * 60;
    }
    if (typeof m.autoSellElapsedMinutes !== "number" || !isFinite(m.autoSellElapsedMinutes) || m.autoSellElapsedMinutes < 0) {
      m.autoSellElapsedMinutes = 0;
    }
    if (typeof m.autoPayoutToWallet !== "boolean") m.autoPayoutToWallet = false;
    if (typeof m.autoPayoutReserve !== "number" || !isFinite(m.autoPayoutReserve) || m.autoPayoutReserve < 0) m.autoPayoutReserve = 0;
  },
  autoSellOreTick: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    if (!m || !m.unlocked) return;
    var interval = (typeof m.autoSellIntervalMinutes === "number" && isFinite(m.autoSellIntervalMinutes) && m.autoSellIntervalMinutes > 0) ? m.autoSellIntervalMinutes : (3 * 60);
    m.autoSellElapsedMinutes += minutes;
    if (m.autoSellElapsedMinutes < interval) return;
    var triggers = Math.floor(m.autoSellElapsedMinutes / interval);
    if (triggers < 1) return;
    if (triggers > 24) triggers = 24;
    m.autoSellElapsedMinutes -= triggers * interval;
    for (var i = 0; i < triggers; i++) {
      Game.Companies.autoSellOreDaily();
    }
  },
  autoSellOreDaily: function () {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningContracts();
    var d = m.oreDetail || { iron: 0, copper: 0, silver: 0, gold: 0 };
    var auto = m.autoSell || {};
    // Only trigger auto-sell if there is at least 1.0 ton
    // of any ore type that is marked for auto-selling.
    var hasSelected =
      (auto.iron && d.iron >= 1) ||
      (auto.copper && d.copper >= 1) ||
      (auto.silver && d.silver >= 1) ||
      (auto.gold && d.gold >= 1);
    if (!hasSelected) return;
    Game.Companies.sellOre(auto);
  },
  ensureMiningContracts: function () {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    if (!m || !Array.isArray(m.mines)) return;
    for (var i = 0; i < m.mines.length; i++) {
      var mine = m.mines[i];
      if (!mine || typeof mine !== "object") continue;
      var def = Game.Companies.getMineDef(mine.id);
      var contractDays = def && typeof def.contractDays === "number" && isFinite(def.contractDays) && def.contractDays > 0 ? Math.floor(def.contractDays) : 28;
      var goldPerContract = def && typeof def.goldPerContract === "number" && isFinite(def.goldPerContract) && def.goldPerContract >= 0 ? def.goldPerContract : 0;
      if (typeof mine.contractDaysTotal !== "number" || !isFinite(mine.contractDaysTotal) || mine.contractDaysTotal <= 0) {
        mine.contractDaysTotal = contractDays;
      } else {
        mine.contractDaysTotal = Math.floor(mine.contractDaysTotal);
        if (mine.contractDaysTotal <= 0) mine.contractDaysTotal = contractDays;
      }
      if (typeof mine.contractDaysLeft !== "number" || !isFinite(mine.contractDaysLeft)) {
        mine.contractDaysLeft = mine.contractDaysTotal;
      } else {
        mine.contractDaysLeft = Math.floor(mine.contractDaysLeft);
      }
      if (mine.contractDaysLeft > mine.contractDaysTotal) mine.contractDaysLeft = mine.contractDaysTotal;
      if (mine.contractDaysLeft < 0) mine.contractDaysLeft = 0;

      if (typeof mine.goldPerContract !== "number" || !isFinite(mine.goldPerContract) || mine.goldPerContract < 0) {
        mine.goldPerContract = goldPerContract;
      }
      if (typeof mine.goldRemaining !== "number" || !isFinite(mine.goldRemaining) || mine.goldRemaining < 0) {
        mine.goldRemaining = mine.goldPerContract;
      }
      if (mine.goldRemaining > mine.goldPerContract) mine.goldRemaining = mine.goldPerContract;
    }
  },
  tickMiningContractsDaily: function () {
    Game.Companies.ensureMiningContracts();
    var m = Game.state.companies.miningCorp;
    if (!m || !Array.isArray(m.mines) || !m.mines.length) return;
    for (var i = 0; i < m.mines.length; i++) {
      var mine = m.mines[i];
      if (!mine || typeof mine !== "object") continue;
      if (typeof mine.contractDaysLeft !== "number" || !isFinite(mine.contractDaysLeft)) continue;
      if (mine.contractDaysLeft <= 0) continue;
      mine.contractDaysLeft -= 1;
      if (mine.contractDaysLeft <= 0) {
        mine.contractDaysLeft = 0;
        mine.active = false;
        Game.addNotification("Mining contract expired for " + (mine.name || mine.id) + ".");
      }
    }
  },
  autoPayoutMiningFundsDaily: function () {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    if (!m || !m.unlocked) return;
    if (!m.autoPayoutToWallet) return;
    if (typeof m.funds !== "number" || !isFinite(m.funds) || m.funds < 0) m.funds = 0;
    var reserve = parseFloat(m.autoPayoutReserve);
    if (!isFinite(reserve) || reserve < 0) reserve = 0;
    var available = m.funds - reserve;
    if (!isFinite(available) || available <= 0) return;
    var transfer = Math.floor(available * 100) / 100;
    if (!transfer || transfer <= 0) return;
    m.funds -= transfer;
    if (m.funds < 0) m.funds = 0;
    Game.addMoney(transfer, null);
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  miningMineCatalog: [
    {
      id: "ridge-iron",
      name: "Ridge Iron Pit",
      region: "Near City",
      baseCapacity: 40,
      oreMix: { iron: 0.82, copper: 0.14, silver: 0.04, gold: 0 },
      requiredStaff: 8,
      requiredMachines: 2,
      contractCost: 1200,
      contractDays: 21,
      goldPerContract: 1,
      goldChanceMult: 0.6
    },
    {
      id: "copper-valley",
      name: "Copper Valley Mine",
      region: "Foothills",
      baseCapacity: 30,
      oreMix: { iron: 0.33, copper: 0.5, silver: 0.17, gold: 0 },
      requiredStaff: 10,
      requiredMachines: 3,
      contractCost: 2200,
      contractDays: 35,
      goldPerContract: 2,
      goldChanceMult: 1.2
    },
    {
      id: "deep-gold",
      name: "Deep Gold Shaft",
      region: "Remote",
      baseCapacity: 18,
      oreMix: { iron: 0.12, copper: 0.18, silver: 0.7, gold: 0 },
      requiredStaff: 14,
      requiredMachines: 4,
      contractCost: 4200,
      contractDays: 56,
      goldPerContract: 6,
      goldChanceMult: 2.5
    }
  ],
  getMineDef: function (id) {
    var defs = Game.Companies.miningMineCatalog;
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].id === id) return defs[i];
    }
    return null;
  },
  buyMiningContract: function (id) {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    if (!m.unlocked) {
      Game.addNotification("Mining Corp is not unlocked yet.");
      return;
    }
    var def = Game.Companies.getMineDef(id);
    if (!def) return;
    for (var i = 0; i < m.mines.length; i++) {
      if (m.mines[i].id === id) {
        Game.addNotification("You already operate this mine.");
        return;
      }
    }
    if (typeof m.funds !== "number") m.funds = 0;
    if (m.funds < def.contractCost) {
      Game.addNotification("Not enough Mining Corp business funds to sign that mining contract.");
      return;
    }
    m.funds -= def.contractCost;
    var contractDays = (typeof def.contractDays === "number" && isFinite(def.contractDays) && def.contractDays > 0) ? Math.floor(def.contractDays) : 28;
    var goldPerContract = (typeof def.goldPerContract === "number" && isFinite(def.goldPerContract) && def.goldPerContract >= 0) ? def.goldPerContract : 0;
    m.mines.push({
      id: def.id,
      name: def.name,
      region: def.region,
      level: 1,
      baseCapacity: def.baseCapacity,
      oreMix: def.oreMix,
      requiredStaff: def.requiredStaff,
      requiredMachines: def.requiredMachines,
      active: true,
      contractDaysTotal: contractDays,
      contractDaysLeft: contractDays,
      goldPerContract: goldPerContract,
      goldRemaining: goldPerContract
    });
    m.staffPerMine[def.id] = def.requiredStaff;
    m.machinesPerMine[def.id] = def.requiredMachines;
    Game.addNotification("New mine acquired: " + def.name + " in " + def.region + ".");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  renewMiningContract: function (id) {
    Game.Companies.ensureMiningContracts();
    var m = Game.state.companies.miningCorp;
    if (!m || !m.unlocked) return;
    var mine = null;
    for (var i = 0; i < m.mines.length; i++) {
      if (m.mines[i] && m.mines[i].id === id) {
        mine = m.mines[i];
        break;
      }
    }
    if (!mine) return;
    var def = Game.Companies.getMineDef(id);
    if (!def) return;
    if (typeof m.funds !== "number") m.funds = 0;
    if (m.funds < def.contractCost) {
      Game.addNotification("Not enough Mining Corp business funds to renew that mining contract.");
      return;
    }
    m.funds -= def.contractCost;
    var contractDays = (typeof def.contractDays === "number" && isFinite(def.contractDays) && def.contractDays > 0) ? Math.floor(def.contractDays) : (mine.contractDaysTotal || 28);
    var goldPerContract = (typeof def.goldPerContract === "number" && isFinite(def.goldPerContract) && def.goldPerContract >= 0) ? def.goldPerContract : (mine.goldPerContract || 0);
    mine.contractDaysTotal = contractDays;
    mine.contractDaysLeft = contractDays;
    mine.goldPerContract = goldPerContract;
    mine.goldRemaining = goldPerContract;
    mine.active = true;
    Game.addNotification("Renewed mining contract for " + (mine.name || mine.id) + ".");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  hireMiningStaff: function (id) {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    var mineExists = false;
    for (var i = 0; i < m.mines.length; i++) {
      if (m.mines[i].id === id) {
        if (typeof m.mines[i].contractDaysLeft === "number" && isFinite(m.mines[i].contractDaysLeft) && m.mines[i].contractDaysLeft <= 0) {
          Game.addNotification("That mine's contract has expired. Renew it first.");
          return;
        }
        mineExists = true;
        break;
      }
    }
    if (!mineExists) return;
    var costPerHire = 120;
    if (typeof m.funds !== "number") m.funds = 0;
    if (m.funds < costPerHire) {
      Game.addNotification("Not enough Mining Corp business funds to hire more staff.");
      return;
    }
    m.funds -= costPerHire;
    if (!m.staffPerMine[id]) m.staffPerMine[id] = 0;
    m.staffPerMine[id] += 1;
    Game.addNotification("Hired 1 staff for " + id + ".");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  buyMiningMachine: function (id) {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    var mineExists = false;
    for (var i = 0; i < m.mines.length; i++) {
      if (m.mines[i].id === id) {
        if (typeof m.mines[i].contractDaysLeft === "number" && isFinite(m.mines[i].contractDaysLeft) && m.mines[i].contractDaysLeft <= 0) {
          Game.addNotification("That mine's contract has expired. Renew it first.");
          return;
        }
        mineExists = true;
        break;
      }
    }
    if (!mineExists) return;
    var costPerMachine = 420;
    if (typeof m.funds !== "number") m.funds = 0;
    if (m.funds < costPerMachine) {
      Game.addNotification("Not enough Mining Corp business funds to buy another machine.");
      return;
    }
    m.funds -= costPerMachine;
    if (!m.machinesPerMine[id]) m.machinesPerMine[id] = 0;
    m.machinesPerMine[id] += 1;
    Game.addNotification("Added a machine to " + id + ".");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  toggleMineActive: function (id) {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    for (var i = 0; i < m.mines.length; i++) {
      if (m.mines[i].id === id) {
        if (typeof m.mines[i].contractDaysLeft === "number" && isFinite(m.mines[i].contractDaysLeft) && m.mines[i].contractDaysLeft <= 0) {
          Game.addNotification("That mine's contract has expired. Renew it first.");
          return;
        }
        m.mines[i].active = !m.mines[i].active;
        Game.addNotification((m.mines[i].active ? "Activated " : "Paused ") + m.mines[i].name + ".");
        return;
      }
    }
  },
  payMiningPayroll: function () {
    Game.Companies.ensureMiningMines();
    var m = Game.state.companies.miningCorp;
    var totalStaff = 0;
    for (var id in m.staffPerMine) {
      if (Object.prototype.hasOwnProperty.call(m.staffPerMine, id)) {
        totalStaff += m.staffPerMine[id];
      }
    }
    if (totalStaff <= 0) return;
    var weeklyPerStaff = 210;
    var totalWages = weeklyPerStaff * totalStaff;
    if (typeof m.funds !== "number") m.funds = 0;
    if (m.funds < totalWages) {
      Game.addNotification("Mining Corp business funds were insufficient for full payroll. Morale will drop.");
      m.morale -= 12;
    } else {
      m.funds -= totalWages;
      Game.addNotification("Paid Mining Corp staff payroll for " + totalStaff + " staff.");
      m.morale += 4;
    }
    if (m.morale < 0) m.morale = 0;
    if (m.morale > 100) m.morale = 100;
    m.daysUntilPayroll = 7;
  },
  depositMiningFunds: function (amount) {
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningMines();
    if (!m.unlocked) {
      Game.addNotification("Mining Corp is not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Mining Corp")) {
      Game.addNotification("Not enough money to deposit into Mining Corp.");
      return;
    }
    if (typeof m.funds !== "number") m.funds = 0;
    m.funds += amount;
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  withdrawMiningFunds: function (amount) {
    var m = Game.state.companies.miningCorp;
    Game.Companies.ensureMiningMines();
    if (!m.unlocked) {
      Game.addNotification("Mining Corp is not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (typeof m.funds !== "number") m.funds = 0;
    if (amount > m.funds) {
      Game.addNotification("Not enough Mining Corp business funds to withdraw that amount.");
      return;
    }
    m.funds -= amount;
    Game.addMoney(amount, "Withdraw from Mining Corp");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("miningFunds", m.funds);
    }
  },
  orderRetailStock: function (optionId, batches) {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    // Back-compat: legacy bulk ordering now purchases generic inventory immediately.
    var opts = Game.Companies.retailStockOptions || [];
    var opt = null;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i] && opts[i].id === optionId) {
        opt = opts[i];
        break;
      }
    }
    if (!opt) opt = opts[1] || opts[0] || { id: "standard", name: "Standard shipment", batchSize: 80, unitPrice: 4.0 };
    var count = parseInt(batches, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 50) count = 50;
    var totalUnits = opt.batchSize * count;
    var cost = totalUnits * opt.unitPrice;
    if (typeof s.funds !== "number") s.funds = 0;
    if (s.funds < cost) {
      Game.addNotification("Not enough retail business funds to order that stock.");
      return;
    }
    s.funds -= cost;
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
    if (!s.inventory || typeof s.inventory !== "object") s.inventory = { units: {}, costBasis: {} };
    if (!s.inventory.units || typeof s.inventory.units !== "object") s.inventory.units = {};
    if (!s.inventory.costBasis || typeof s.inventory.costBasis !== "object") s.inventory.costBasis = {};
    var defaultItemId = "household_basics";
    if (typeof s.inventory.units[defaultItemId] !== "number" || !isFinite(s.inventory.units[defaultItemId]) || s.inventory.units[defaultItemId] < 0) s.inventory.units[defaultItemId] = 0;
    if (typeof s.inventory.costBasis[defaultItemId] !== "number" || !isFinite(s.inventory.costBasis[defaultItemId]) || s.inventory.costBasis[defaultItemId] < 0) s.inventory.costBasis[defaultItemId] = 0;
    s.inventory.units[defaultItemId] += Math.floor(totalUnits);
    s.inventory.costBasis[defaultItemId] += cost;
    Game.Companies.recomputeRetailDerived(s);
    Game.addNotification("Retail stock purchased: +" + totalUnits + " units (" + opt.name + ").");
  },
  boostRetailMarketing: function () {
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    var cost = 90;
    if (typeof s.funds !== "number") s.funds = 0;
    if (s.funds < cost) {
      Game.addNotification("Not enough retail business funds for marketing.");
      return;
    }
    s.funds -= cost;
    s.popularity += 12;
    if (s.popularity > 100) s.popularity = 100;
    Game.addNotification("Retail shop popularity increased.");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
  },
  tickRetail: function (minutes) {
    if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
    Game.Companies.ensureRetailState();
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) return;

    // If we crossed an hour boundary since the last tick and we have a pending sales summary,
    // flush it now (even if there are no sales events in the new hour).
    var currentHour = Math.floor((Game.state.timeMinutes || 0) / 60);
    if (s._salesAgg && typeof s._salesAgg === "object") {
      var aggDay = s._salesAgg.day;
      var aggHour = s._salesAgg.hour;
      if (aggDay !== Game.state.day || aggHour !== currentHour) {
        Game.Companies.flushRetailSalesAgg({ reason: "hour_change" });
      }
    }

    if (s._popDecayDay !== Game.state.day) {
      s._popDecayDay = Game.state.day;
      s._popDecayToday = 0;
    }
    if (!s.salesSchedule || s.salesSchedule.day !== Game.state.day) {
      var popularityMultInit = 0.4 + (s.popularity / 100) * 0.9;
      var staffSumInit = Game.Companies.getRetailStaffSummary(s);
      var clerksInit = staffSumInit.clerkLevels || 0;
      var managerInit = staffSumInit.managerLevels || 0;
      var baseSalesPerDayInit = 26 + s.level * 10 + clerksInit * 12 + managerInit * 18;
      if (s.campaign) {
        var cdefInit = Game.Companies.getRetailCampaignDef(s.campaign.channel);
        var salesMultInit = cdefInit && typeof cdefInit.salesMult === "number" && isFinite(cdefInit.salesMult) ? cdefInit.salesMult : 1;
        if (salesMultInit > 0) baseSalesPerDayInit *= salesMultInit;
      }
      var expectedDaySales = baseSalesPerDayInit * popularityMultInit;
      var candidateSlots = [];
      for (var slot = 0; slot < 288; slot++) {
        var totalMinutes = slot * 5;
        var hour = Math.floor(totalMinutes / 60);
        if (hour >= 7 && hour <= 21) {
          candidateSlots.push(slot);
        }
      }
      var eventsCount = Math.max(12, Math.min(candidateSlots.length, Math.round(expectedDaySales / 3) || 12));
      for (var i2 = candidateSlots.length - 1; i2 > 0; i2--) {
        var j2 = Math.floor(Math.random() * (i2 + 1));
        var tmp = candidateSlots[i2];
        candidateSlots[i2] = candidateSlots[j2];
        candidateSlots[j2] = tmp;
      }
      var slots = candidateSlots.slice(0, eventsCount);
      var slotSet = {};
      for (var k = 0; k < slots.length; k++) {
        slotSet["s" + slots[k]] = true;
      }
      s.salesSchedule = {
        day: Game.state.day,
        slots: slots,
        slotSet: slotSet,
        processed: {}
      };
    }
    var sched = s.salesSchedule;

    var beforeFunds = typeof s.funds === "number" && isFinite(s.funds) ? s.funds : 0;
    var minuteOfDay = Math.floor(Game.state.timeMinutes || 0);
    if (!isFinite(minuteOfDay) || minuteOfDay < 0) minuteOfDay = 0;
    minuteOfDay = minuteOfDay % (24 * 60);

    if (typeof s._lastRetailSalesTickDay !== "number" || !isFinite(s._lastRetailSalesTickDay)) {
      s._lastRetailSalesTickDay = Game.state.day;
    }
    if (typeof s._lastRetailSalesTickMinute !== "number" || !isFinite(s._lastRetailSalesTickMinute)) {
      s._lastRetailSalesTickMinute = Math.max(0, minuteOfDay - Math.max(1, Math.ceil(minutes)));
    }
    if (s._lastRetailSalesTickDay !== Game.state.day) {
      // New day: start from midnight for the current day's schedule (cap to this day only).
      s._lastRetailSalesTickDay = Game.state.day;
      s._lastRetailSalesTickMinute = 0;
    }

    var startMinute = s._lastRetailSalesTickMinute;
    if (!isFinite(startMinute) || startMinute < 0) startMinute = 0;
    if (startMinute > minuteOfDay) startMinute = 0;
    var startSlot = Math.floor(startMinute / 5);
    var endSlot = Math.floor(minuteOfDay / 5);

    function ensureAgg(day, hour) {
      if (!s._salesAgg || typeof s._salesAgg !== "object" || s._salesAgg.day !== day || s._salesAgg.hour !== hour) {
        if (s._salesAgg && typeof s._salesAgg === "object") {
          Game.Companies.flushRetailSalesAgg({ reason: "bucket_change" });
        }
        s._salesAgg = { day: day, hour: hour, revenueBusiness: 0, unitsBusiness: 0, revenueWallet: 0, unitsWallet: 0 };
      }
    }

    function processSlot(slot) {
      var key = "s" + slot;
      if (!sched.slotSet[key] || sched.processed[key]) return;
      Game.Companies.recomputeRetailDerived(s);
      if (s.stock <= 0) {
        sched.processed[key] = true;
        return;
      }
      var staffSum = Game.Companies.getRetailStaffSummary(s);
      var clerks = staffSum.clerkLevels || 0;
      var manager = staffSum.managerLevels || 0;
      var baseSalesPerDay = 26 + s.level * 10 + clerks * 12 + manager * 18;
      if (s.campaign) {
        var cdef = Game.Companies.getRetailCampaignDef(s.campaign.channel);
        var salesMult = cdef && typeof cdef.salesMult === "number" && isFinite(cdef.salesMult) ? cdef.salesMult : 1;
        if (salesMult > 0) baseSalesPerDay *= salesMult;
      }
      var popularityMult = 0.4 + (s.popularity / 100) * 0.9;
      var expectedDaySales2 = baseSalesPerDay * popularityMult;
      if (s._retailPayrollDefaultDay === Game.state.day) {
        expectedDaySales2 *= 0.4;
      }
      var events = sched.slots.length || 1;
      var basePerEvent = expectedDaySales2 / events;
      var soldTarget = Math.floor(basePerEvent * (0.7 + Math.random() * 0.8));
      if (!isFinite(soldTarget) || soldTarget < 1) soldTarget = 1;
      if (soldTarget > s.stock) soldTarget = Math.floor(s.stock);
      if (soldTarget <= 0) {
        sched.processed[key] = true;
        return;
      }
      var sale = Game.Companies.sellRetailUnits(s, soldTarget);
      if (!sale || !sale.unitsSold) {
        sched.processed[key] = true;
        return;
      }
      var sold = sale.unitsSold;
      var revenue = sale.revenue;
      if (typeof s.funds !== "number" || !isFinite(s.funds)) s.funds = 0;
      var costOfGoods = sale.cost;
      if (s.stats) {
        s.stats.todayUnits += sold;
        s.stats.todayRevenue += revenue;
        s.stats.todayCost += costOfGoods;
      }
      var toWallet = !!s.autoPayoutToWallet;
      if (toWallet) {
        // Avoid per-sale notification spam; the hourly aggregator handles player feedback.
        if (Game.Prestige && typeof Game.Prestige.getCompanyRevenueMultiplier === "function") {
          revenue *= Game.Prestige.getCompanyRevenueMultiplier();
        }
        Game.addMoney(revenue, null);
      } else {
        s.funds += revenue;
      }
      var slotHour = Math.floor((slot * 5) / 60);
      ensureAgg(Game.state.day, slotHour);
      if (toWallet) {
        s._salesAgg.revenueWallet += revenue;
        s._salesAgg.unitsWallet += sold;
      } else {
        s._salesAgg.revenueBusiness += revenue;
        s._salesAgg.unitsBusiness += sold;
      }
      sched.processed[key] = true;
    }

    for (var slotIdx = startSlot; slotIdx <= endSlot; slotIdx++) {
      var slot = slotIdx % 288;
      processSlot(slot);
    }

    s._lastRetailSalesTickDay = Game.state.day;
    s._lastRetailSalesTickMinute = minuteOfDay;

    var afterFunds = typeof s.funds === "number" && isFinite(s.funds) ? s.funds : beforeFunds;
    if (afterFunds !== beforeFunds && window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", afterFunds);
    }

    // If we had to catch up a large real-time gap, flush the pending hour bucket so the player
    // sees a summary immediately instead of waiting for the next hour/day boundary.
    if (minutes >= 30 && s._salesAgg) {
      Game.Companies.flushRetailSalesAgg({ reason: "catch_up" });
    }

    // Cap passive popularity decay to at most 1% per in-game day.
    var maxDecayPerDay = 1;
    var decayToday = typeof s._popDecayToday === "number" ? s._popDecayToday : 0;
    var remaining = maxDecayPerDay - decayToday;
    if (remaining < 0) remaining = 0;
    var delta = minutes * 0.01;
    if (delta > remaining) delta = remaining;
    if (delta > 0) {
      s.popularity -= delta;
      s._popDecayToday = decayToday + delta;
    }
    if (s.popularity < 10 && s.stock <= 0) {
      s.popularity = 10;
    }
    if (s.popularity < 0) s.popularity = 0;
  },
  depositRetailFunds: function (amount) {
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (!Game.spendMoney(amount, "Deposit to Retail Shop")) {
      Game.addNotification("Not enough money to deposit into the retail shop.");
      return;
    }
    if (typeof s.funds !== "number") s.funds = 0;
    s.funds += amount;
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
  },
  withdrawRetailFunds: function (amount) {
    var s = Game.state.companies.retailShop;
    if (!s.unlocked) {
      Game.addNotification("Retail shop not unlocked yet.");
      return;
    }
    amount = parseFloat(amount);
    if (!amount || amount <= 0) return;
    if (typeof s.funds !== "number") s.funds = 0;
    if (amount > s.funds) {
      Game.addNotification("Not enough retail business funds to withdraw that amount.");
      return;
    }
    s.funds -= amount;
    Game.addMoney(amount, "Withdraw from Retail Shop");
    if (window.UI && UI.animateNumber) {
      UI.animateNumber("retailFunds", s.funds);
    }
  },
  tick: function (minutes) {
    Game.Companies.ensureUnlocks();
    Game.Companies.tickRail(minutes);
    Game.Companies.tickMiningCorp(minutes);
    Game.Companies.tickRetail(minutes);
    Game.Companies.tickCourier(minutes);
    Game.Companies.tickRecycling(minutes);
  }
};

Game.registerDailyHandler(function () {
  if (Game.Companies && typeof Game.Companies.flushRetailSalesAgg === "function") {
    Game.Companies.flushRetailSalesAgg({ reason: "day_rollover" });
  }
  // Roll retail daily stats forward.
  if (Game.state && Game.state.companies && Game.state.companies.retailShop) {
    Game.Companies.ensureRetailState();
    var shop = Game.state.companies.retailShop;
    var stats = shop.stats;
    if (stats) {
      stats.yesterdayUnits = stats.todayUnits;
      stats.yesterdayRevenue = stats.todayRevenue;
      stats.yesterdayCost = stats.todayCost;
      stats.yesterdayPayroll = stats.todayPayroll;
      stats.todayUnits = 0;
      stats.todayRevenue = 0;
      stats.todayCost = 0;
      stats.todayPayroll = 0;
    }
    if (Game.Companies && typeof Game.Companies.applyRetailLevelProgressDaily === "function") {
      Game.Companies.applyRetailLevelProgressDaily();
    }
    if (Game.Companies && typeof Game.Companies.payRetailPayrollDaily === "function") {
      Game.Companies.payRetailPayrollDaily();
    }
    if (Game.Companies && typeof Game.Companies.tickRetailCampaignDaily === "function") {
      Game.Companies.tickRetailCampaignDaily();
    }
    if (Game.Companies && typeof Game.Companies.resolveRetailDeliveriesDaily === "function") {
      Game.Companies.resolveRetailDeliveriesDaily();
    }
    if (Game.Companies && typeof Game.Companies.tickRetailStaffDaily === "function") {
      Game.Companies.tickRetailStaffDaily();
    }
  }
  if (Game.state && Game.state.companies && Game.state.companies.miningCorp) {
    var m = Game.state.companies.miningCorp;
    if (Game.Companies && typeof Game.Companies.tickMiningContractsDaily === "function") {
      Game.Companies.tickMiningContractsDaily();
    }
    if (typeof m.daysUntilPayroll !== "number") m.daysUntilPayroll = 7;
    m.daysUntilPayroll -= 1;
    if (m.daysUntilPayroll <= 0) {
      Game.Companies.payMiningPayroll();
    }
    Game.Companies.autoPayoutMiningFundsDaily();
  }
  if (Game.Companies && typeof Game.Companies.railDaily === "function") {
    Game.Companies.railDaily();
  }
  if (Game.Companies && typeof Game.Companies.netCafeDaily === "function") {
    Game.Companies.netCafeDaily();
  }
  if (Game.Companies && typeof Game.Companies.courierDaily === "function") {
    Game.Companies.courierDaily();
  }
  if (Game.Companies && typeof Game.Companies.recyclingDaily === "function") {
    Game.Companies.recyclingDaily();
  }
});
