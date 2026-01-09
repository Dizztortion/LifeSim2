Game.Property = {
  homes: [
    { id: "starter-room", name: "Starter Room", type: "home", location: "Home", price: 0, baseRent: 0 },
    { id: "studio", name: "Small Studio Flat", type: "home", location: "City Centre", price: 25000, baseRent: 360 },
    { id: "suburb-house", name: "Suburban House", type: "home", location: "Countryside", price: 60000, baseRent: 720 },
    { id: "city-duplex", name: "City Duplex", type: "home", location: "City Centre", price: 110000, baseRent: 1450 },
    { id: "downtown-loft", name: "Downtown Loft", type: "home", location: "City Centre", price: 175000, baseRent: 2200 },
    { id: "luxury-penthouse", name: "Luxury Penthouse", type: "home", location: "City Centre", price: 320000, baseRent: 4200 }
  ],
  market: [
    { id: "studio", name: "Small Studio Flat", type: "apartment", price: 25000, baseRent: 360, maintenancePerDay: 40 },
    { id: "suburb-house", name: "Suburban House", type: "house", price: 60000, baseRent: 720, maintenancePerDay: 90 },
    { id: "city-duplex", name: "City Duplex", type: "apartment", price: 110000, baseRent: 1450, maintenancePerDay: 150 }
  ],
  ensureHousingState: function () {
    if (!Game.state.housing || typeof Game.state.housing !== "object") {
      Game.state.housing = { homeId: "starter-room", status: "rent", rentPerDay: 0, maintenance: 100, upgrades: { bed: 0, vanity: 0 } };
    }
    var h = Game.state.housing;
    if (!h.homeId) h.homeId = "starter-room";
    if (h.status !== "rent" && h.status !== "own") h.status = "rent";
    if (typeof h.rentPerDay !== "number" || h.rentPerDay < 0) h.rentPerDay = 0;
    if (typeof h.maintenance !== "number") h.maintenance = 100;
    if (h.maintenance < 0) h.maintenance = 0;
    if (h.maintenance > 100) h.maintenance = 100;
    if (!h.upgrades || typeof h.upgrades !== "object") h.upgrades = { bed: 0, vanity: 0 };
    if (typeof h.upgrades.bed !== "number" || !isFinite(h.upgrades.bed) || h.upgrades.bed < 0) h.upgrades.bed = 0;
    if (typeof h.upgrades.vanity !== "number" || !isFinite(h.upgrades.vanity) || h.upgrades.vanity < 0) h.upgrades.vanity = 0;
    if (h.upgrades.bed > 5) h.upgrades.bed = 5;
    if (h.upgrades.vanity > 5) h.upgrades.vanity = 5;
  },
  getHomeUpgradeDefs: function () {
    return [
      { key: "bed", name: "Bed Upgrade", max: 5, effect: "+10 max energy per level" },
      { key: "vanity", name: "Vanity Upgrade", max: 5, effect: "+5 max health per level" }
    ];
  },
  getHomeUpgradeCost: function (homeDef, upgradeKey, currentLevel) {
    var lvl = typeof currentLevel === "number" ? currentLevel : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    var price = homeDef ? (homeDef.price || 0) : 0;
    var base = 120 + price * 0.001;
    var keyMult = (upgradeKey === "bed") ? 1.15 : 1.0;
    var lvlMult = 1 + lvl * 0.65;
    var cost = Math.round(base * keyMult * lvlMult);
    if (cost < 80) cost = 80;
    return cost;
  },
  upgradeHome: function (upgradeKey) {
    Game.Property.ensureHousingState();
    var h = Game.state.housing;
    var def = Game.Property.getHomeDef(h.homeId);
    if (Game.blockIfSleeping && Game.blockIfSleeping("upgrade your home")) return;
    if (!def) {
      Game.addNotification("No home found to upgrade.");
      return;
    }
    if (h.status !== "own") {
      Game.addNotification("You can only upgrade a home you own.");
      return;
    }
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before upgrading your home.");
      return;
    }
    if (Game.state.travelLocation !== "Home") {
      Game.addNotification("You must be at Home to upgrade your home.");
      return;
    }
    var defs = Game.Property.getHomeUpgradeDefs();
    var ud = null;
    for (var i = 0; i < defs.length; i++) {
      if (defs[i].key === upgradeKey) { ud = defs[i]; break; }
    }
    if (!ud) return;
    var lvl = (h.upgrades && typeof h.upgrades[upgradeKey] === "number") ? h.upgrades[upgradeKey] : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    if (lvl >= (ud.max || 5)) {
      Game.addNotification("That upgrade is already maxed out.");
      return;
    }
    var cost = Game.Property.getHomeUpgradeCost(def, upgradeKey, lvl);
    if (!Game.spendMoney(cost, "Home upgrade: " + ud.name)) {
      Game.addNotification("Not enough money for that home upgrade.");
      return;
    }
    h.upgrades[upgradeKey] = lvl + 1;
    Game.addNotification("Home upgraded: " + ud.name + " (L" + h.upgrades[upgradeKey] + ").");
  },
  ensureHomeOffers: function () {
    if (!Array.isArray(Game.state.homeOffers)) {
      Game.state.homeOffers = [];
    }
    if (Game.state.homeOffers.length === 0) {
      Game.Property.generateHomeOffers();
    }
  },
  getHomeDef: function (id) {
    for (var i = 0; i < Game.Property.homes.length; i++) {
      if (Game.Property.homes[i].id === id) return Game.Property.homes[i];
    }
    return null;
  },
  generateHomeOffers: function () {
    Game.Property.ensureHousingState();
    if (!Array.isArray(Game.state.homeOffers)) Game.state.homeOffers = [];
    var offers = [];
    var day = Game.state.day || 1;
    var pool = Game.Property.homes.slice();
    // Do not offer the starter room in the market
    for (var i = pool.length - 1; i >= 0; i--) {
      if (pool[i].id === "starter-room") pool.splice(i, 1);
    }
    // Pick a small set of listings (mix of new + used)
    var maxListings = 5;
    while (offers.length < maxListings && pool.length > 0) {
      var idx = Math.floor(Math.random() * pool.length);
      var def = pool[idx];
      pool.splice(idx, 1);
      var used = Math.random() < 0.6;
      var maintenance = used ? (45 + Math.random() * 15) : (85 + Math.random() * 15);
      var usedDiscount = used ? (0.72 + Math.random() * 0.08) : (0.98 + Math.random() * 0.06);
      var rentDiscount = used ? (0.78 + Math.random() * 0.08) : (0.98 + Math.random() * 0.06);
      var buyPrice = Math.round(def.price * usedDiscount);
      var rentPerDay = Math.round(def.baseRent * rentDiscount);
      offers.push({
        key: "home-" + day + "-" + def.id + "-" + (used ? "used" : "new"),
        defId: def.id,
        location: def.location || "City Centre",
        used: used,
        maintenance: Math.round(maintenance),
        buyPrice: buyPrice,
        rentPerDay: rentPerDay,
        listedDay: day
      });
    }
    Game.state.homeOffers = offers;
  },
  ensureRepairPricing: function () {
    if (!Game.state.propertyRepairPricing || typeof Game.state.propertyRepairPricing !== "object") {
      Game.state.propertyRepairPricing = { weekStartDay: Game.state.day || 1, multiplier: 1.0 };
    }
    var p = Game.state.propertyRepairPricing;
    if (typeof p.weekStartDay !== "number" || p.weekStartDay < 1) p.weekStartDay = Game.state.day || 1;
    if (typeof p.multiplier !== "number" || p.multiplier <= 0) p.multiplier = 1.0;
    var day = Game.state.day || 1;
    if (day - p.weekStartDay >= 7) {
      p.weekStartDay = day;
      p.multiplier = 0.85 + Math.random() * 0.5;
    }
  },
  getRepairCost: function (basePrice, maintenance) {
    Game.Property.ensureRepairPricing();
    var mult = Game.state.propertyRepairPricing.multiplier || 1.0;
    var missing = 100 - (typeof maintenance === "number" ? maintenance : 100);
    if (missing <= 0) return 0;
    // Cheap repairs: scale mostly with missing %, lightly with asset price, plus a weekly multiplier.
    var price = typeof basePrice === "number" ? basePrice : 0;
    var perPercent = 2 + price * 0.00003; // e.g. $0 -> $2, $100k -> $5
    var cost = Math.round(missing * perPercent * mult);
    if (cost < 5) cost = 5;
    return cost;
  },
  repairHome: function () {
    Game.Property.ensureHousingState();
    var h = Game.state.housing;
    var def = Game.Property.getHomeDef(h.homeId);
    var price = def ? def.price : 0;
    var cost = Game.Property.getRepairCost(price, h.maintenance);
    if (cost <= 0) {
      Game.addNotification("Your home is already in perfect condition.");
      return;
    }
    if (!Game.spendMoney(cost, "Home repair")) {
      Game.addNotification("Not enough money to repair your home.");
      return;
    }
    h.maintenance = 100;
    Game.addNotification("Home repaired to 100% condition.");
  },
  rentHomeOffer: function (offerKey) {
    Game.Property.ensureHousingState();
    Game.Property.ensureHomeOffers();
    var offers = Game.state.homeOffers || [];
    var offer = null;
    for (var i = 0; i < offers.length; i++) {
      if (offers[i].key === offerKey) {
        offer = offers[i];
        break;
      }
    }
    if (!offer) return;
    var def = Game.Property.getHomeDef(offer.defId);
    if (!def) return;
    var loc = offer.location || def.location || null;
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before signing a lease.");
      return;
    }
    if (loc && Game.state.travelLocation !== loc) {
      Game.addNotification("You must be at " + loc + " to rent this home.");
      return;
    }
    Game.state.housing.homeId = def.id;
    Game.state.housing.status = "rent";
    Game.state.housing.rentPerDay = offer.rentPerDay;
    Game.state.housing.maintenance = offer.maintenance;
    Game.state.housing.upgrades = { bed: 0, vanity: 0 };
    Game.addNotification("You rented: " + def.name + " ($" + offer.rentPerDay + "/day).");
    // Remove listing after taking it
    var next = [];
    for (var j = 0; j < offers.length; j++) {
      if (offers[j].key !== offerKey) next.push(offers[j]);
    }
    Game.state.homeOffers = next;
  },
  buyHomeOffer: function (offerKey) {
    Game.Property.ensureHousingState();
    Game.Property.ensureHomeOffers();
    var offers = Game.state.homeOffers || [];
    var offer = null;
    for (var i = 0; i < offers.length; i++) {
      if (offers[i].key === offerKey) {
        offer = offers[i];
        break;
      }
    }
    if (!offer) return;
    var def = Game.Property.getHomeDef(offer.defId);
    if (!def) return;
    var loc = offer.location || def.location || null;
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before buying a home.");
      return;
    }
    if (loc && Game.state.travelLocation !== loc) {
      Game.addNotification("You must be at " + loc + " to buy this home.");
      return;
    }
    if (!Game.spendMoney(offer.buyPrice, "Bought home: " + def.name)) {
      Game.addNotification("Not enough money to buy that home.");
      return;
    }
    Game.state.housing.homeId = def.id;
    Game.state.housing.status = "own";
    Game.state.housing.rentPerDay = 0;
    Game.state.housing.maintenance = offer.maintenance;
    Game.state.housing.upgrades = { bed: 0, vanity: 0 };
    Game.addNotification("You bought: " + def.name + ".");
    var next = [];
    for (var j = 0; j < offers.length; j++) {
      if (offers[j].key !== offerKey) next.push(offers[j]);
    }
    Game.state.homeOffers = next;
  },
  buyHomeOfferOnline: function (offerKey) {
    Game.Property.ensureHousingState();
    Game.Property.ensureHomeOffers();
    var offers = Game.state.homeOffers || [];
    var offer = null;
    for (var i = 0; i < offers.length; i++) {
      if (offers[i].key === offerKey) {
        offer = offers[i];
        break;
      }
    }
    if (!offer) return;
    var def = Game.Property.getHomeDef(offer.defId);
    if (!def) return;
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before buying a home.");
      return;
    }
    if (!Game.spendMoney(offer.buyPrice, "Bought home: " + def.name)) {
      Game.addNotification("Not enough money to buy that home.");
      return;
    }
    Game.state.housing.homeId = def.id;
    Game.state.housing.status = "own";
    Game.state.housing.rentPerDay = 0;
    Game.state.housing.maintenance = offer.maintenance;
    Game.state.housing.upgrades = { bed: 0, vanity: 0 };
    Game.addNotification("You bought: " + def.name + " (online).");
    var next = [];
    for (var j = 0; j < offers.length; j++) {
      if (offers[j].key !== offerKey) next.push(offers[j]);
    }
    Game.state.homeOffers = next;
  },
  sellCurrentHome: function () {
    Game.Property.ensureHousingState();
    var h = Game.state.housing;
    if (h.status !== "own") {
      Game.addNotification("You don't own your current home.");
      return;
    }
    if (h.homeId === "starter-room") {
      Game.addNotification("You can't sell the starter room.");
      return;
    }
    var def = Game.Property.getHomeDef(h.homeId);
    var base = def ? def.price : 0;
    var condition = typeof h.maintenance === "number" ? h.maintenance : 100;
    var factor = 0.55 + (condition / 100) * 0.35; // 55%..90%
    var jitter = 0.95 + Math.random() * 0.1;
    var value = Math.round(base * factor * jitter);
    if (value < 0) value = 0;
    Game.addMoney(value, "Sold home: " + (def ? def.name : "Home"));
    h.homeId = "starter-room";
    h.status = "rent";
    h.rentPerDay = 0;
    h.maintenance = 100;
    h.upgrades = { bed: 0, vanity: 0 };
    Game.addNotification("You moved back into the starter room.");
  },
  repairInvestmentProperty: function (propertyId) {
    Game.Property.ensureRepairPricing();
    var owned = Game.state.properties || [];
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return;
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return;
    if (typeof prop.maintenance !== "number") prop.maintenance = 95;
    var cost = Game.Property.getRepairCost(def.price, prop.maintenance);
    if (cost <= 0) {
      Game.addNotification(def.name + " is already in perfect condition.");
      return;
    }
    if (!Game.spendMoney(cost, "Repair: " + def.name)) {
      Game.addNotification("Not enough money to repair that property.");
      return;
    }
    prop.maintenance = 100;
    Game.addNotification("Repaired " + def.name + " to 100% condition.");
  },
  buyProperty: function (id) {
    var def = null;
    for (var i = 0; i < Game.Property.market.length; i++) {
      if (Game.Property.market[i].id === id) {
        def = Game.Property.market[i];
        break;
      }
    }
    if (!def) return;
    for (var j = 0; j < Game.state.properties.length; j++) {
      if (Game.state.properties[j].id === id) {
        Game.addNotification("You already own " + def.name + ".");
        return;
      }
    }
    if (!Game.spendMoney(def.price, "Bought " + def.name)) {
      Game.addNotification("Not enough money for that property.");
      return;
    }
    Game.state.properties.push({
      id: def.id,
      tenantId: null,
      maintenance: 95,
      upgrades: {
        bedroom: 0,
        kitchen: 0,
        bathroom: 0,
        flooring: 0,
        appliances: 0,
        heating: 0,
        security: 0,
        decor: 0
      }
    });
    Game.addNotification("New property acquired: " + def.name);
  },
  getPropertyDef: function (id) {
    for (var i = 0; i < Game.Property.market.length; i++) {
      if (Game.Property.market[i].id === id) return Game.Property.market[i];
    }
    return null;
  },
  ensureTenantCandidateState: function () {
    if (!Game.state.propertyTenantCandidates || typeof Game.state.propertyTenantCandidates !== "object") {
      Game.state.propertyTenantCandidates = {};
    }
  },
  getTenantRatingStars: function (rating) {
    var r = typeof rating === "number" ? rating : 0;
    if (r < 0) r = 0;
    if (r > 100) r = 100;
    return (r / 100) * 5;
  },
  computeTenantReliability: function (rating) {
    var r = typeof rating === "number" ? rating : 0;
    if (r < 0) r = 0;
    if (r > 100) r = 100;
    // 0 -> 0.70, 100 -> 0.98
    return 0.70 + (r / 100) * 0.28;
  },
  getPropertyUpgradeBonus: function (upgrades) {
    if (!upgrades || typeof upgrades !== "object") return 0;
    var total = 0;
    for (var k in upgrades) {
      if (!Object.prototype.hasOwnProperty.call(upgrades, k)) continue;
      var lvl = upgrades[k];
      if (typeof lvl === "number" && lvl > 0) total += lvl;
    }
    // 2% rent bonus per upgrade level
    return total * 0.02;
  },
  getUpgradeDefs: function () {
    return [
      { key: "bedroom", name: "Bedroom Set" },
      { key: "kitchen", name: "Kitchen Upgrade" },
      { key: "bathroom", name: "Bathroom Upgrade" },
      { key: "flooring", name: "Flooring" },
      { key: "appliances", name: "Appliances" },
      { key: "heating", name: "Heating/Cooling" },
      { key: "security", name: "Security" },
      { key: "decor", name: "Decor" }
    ];
  },
  ensureUpgrades: function (prop) {
    if (!prop) return;
    if (!prop.upgrades || typeof prop.upgrades !== "object") prop.upgrades = {};
    var defs = Game.Property.getUpgradeDefs();
    for (var i = 0; i < defs.length; i++) {
      var k = defs[i].key;
      if (typeof prop.upgrades[k] !== "number" || prop.upgrades[k] < 0) prop.upgrades[k] = 0;
    }
  },
  getUpgradeCost: function (propertyDef, upgradeKey, currentLevel) {
    var lvl = typeof currentLevel === "number" ? currentLevel : 0;
    if (lvl < 0) lvl = 0;
    var price = propertyDef ? (propertyDef.price || 0) : 0;
    var base = 120 + price * 0.0012;
    var mult = 1 + lvl * 0.55;
    var cost = Math.round(base * mult);
    if (cost < 60) cost = 60;
    return cost;
  },
  upgradeProperty: function (propertyId, upgradeKey) {
    var owned = Game.state.properties || [];
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return;
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return;
    Game.Property.ensureUpgrades(prop);
    var lvl = prop.upgrades[upgradeKey] || 0;
    if (lvl >= 5) {
      Game.addNotification("That upgrade is already maxed out.");
      return;
    }
    var cost = Game.Property.getUpgradeCost(def, upgradeKey, lvl);
    if (!Game.spendMoney(cost, "Upgrade: " + def.name)) {
      Game.addNotification("Not enough money for that upgrade.");
      return;
    }
    prop.upgrades[upgradeKey] = lvl + 1;
    Game.addNotification(def.name + " upgraded (" + upgradeKey + " L" + prop.upgrades[upgradeKey] + ").");
  },
  computeRentOffer: function (def, maintenance, upgrades, tenantRating) {
    if (!def) return 0;
    var base = def.baseRent || 0;
    var m = typeof maintenance === "number" ? maintenance : 100;
    if (m < 0) m = 0;
    if (m > 100) m = 100;
    var rating = typeof tenantRating === "number" ? tenantRating : 50;
    if (rating < 0) rating = 0;
    if (rating > 100) rating = 100;
    var conditionMult = 0.75 + (m / 100) * 0.35; // 0.75..1.10
    var ratingMult = 0.85 + (rating / 100) * 0.30; // 0.85..1.15
    var upgradeBonus = Game.Property.getPropertyUpgradeBonus(upgrades); // additive bonus to multiplier
    var value = base * conditionMult * ratingMult * (1 + upgradeBonus);
    return Math.round(value);
  },
  generateTenantCandidates: function (propertyId, count) {
    Game.Property.ensureTenantCandidateState();
    var owned = Game.state.properties || [];
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return [];
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return [];
    if (typeof prop.maintenance !== "number") prop.maintenance = 95;
    Game.Property.ensureUpgrades(prop);

    var n = typeof count === "number" && count > 0 ? Math.floor(count) : 5;
    if (n < 1) n = 1;
    if (n > 10) n = 10;

    var names = ["Alex", "Jordan", "Sam", "Taylor", "Casey", "Morgan", "Riley", "Jamie", "Avery", "Dakota", "Quinn", "Rowan"];
    var candidates = [];
    for (var c = 0; c < n; c++) {
      var name = names[Math.floor(Math.random() * names.length)];
      var rating = Math.round(Math.random() * 100);
      var months = 3 + Math.floor(Math.random() * 22); // 3..24
      var rentOffer = Game.Property.computeRentOffer(def, prop.maintenance, prop.upgrades, rating);
      candidates.push({
        id: "cand-" + propertyId + "-" + (Game.state.day || 1) + "-" + (Date.now ? Date.now() : new Date().getTime()) + "-" + c,
        name: name,
        rating: rating,
        months: months,
        rentOffer: rentOffer,
        reliability: Game.Property.computeTenantReliability(rating)
      });
    }
    Game.state.propertyTenantCandidates[propertyId] = candidates;
    return candidates;
  },
  acceptTenantCandidate: function (propertyId, candidateId) {
    Game.Property.ensureTenantCandidateState();
    var owned = Game.state.properties || [];
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return;
    if (prop.tenantId) {
      Game.addNotification("This property already has a tenant.");
      return;
    }
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return;
    var list = Game.state.propertyTenantCandidates[propertyId] || [];
    var cand = null;
    for (var j = 0; j < list.length; j++) {
      if (list[j].id === candidateId) {
        cand = list[j];
        break;
      }
    }
    if (!cand) return;
    var tenantId = "t" + (Game.state.tenants.length + 1);
    Game.state.tenants.push({
      id: tenantId,
      name: cand.name,
      propertyId: propertyId,
      happiness: 70,
      rent: cand.rentOffer,
      reliability: cand.reliability,
      rating: cand.rating,
      leaseDaysRemaining: (cand.months || 6) * 30
    });
    prop.tenantId = tenantId;
    Game.addNotification(cand.name + " signed a " + cand.months + "-month lease for " + def.name + ".");
    delete Game.state.propertyTenantCandidates[propertyId];
  },
  addTenant: function (propertyId) {
    var owned = Game.state.properties;
    var prop = null;
    for (var i = 0; i < owned.length; i++) {
      if (owned[i].id === propertyId) {
        prop = owned[i];
        break;
      }
    }
    if (!prop) return;
    if (prop.tenantId) {
      Game.addNotification("This property already has a tenant.");
      return;
    }
    var def = Game.Property.getPropertyDef(propertyId);
    if (!def) return;
    var candidates = Game.Property.generateTenantCandidates(propertyId, 5);
    if (!candidates.length) return;
    // Back-compat: pick a random candidate if UI didn't present a selection.
    var picked = candidates[Math.floor(Math.random() * candidates.length)];
    Game.Property.acceptTenantCandidate(propertyId, picked.id);
  },
  dailyIncome: function () {
    Game.Property.ensureHousingState();
    Game.Property.ensureRepairPricing();
    var owned = Game.state.properties;
    for (var i = 0; i < owned.length; i++) {
      var prop = owned[i];
      var def = Game.Property.getPropertyDef(prop.id);
      if (!def) continue;
      if (typeof prop.maintenance !== "number") prop.maintenance = 95;
      Game.Property.ensureUpgrades(prop);
      // Condition drops slowly over time. Tenants can slow decay if their rating is high.
      var baseDecay = (0.25 + Math.random() * 0.45);
      var decayMult = 1.0;
      var tenant = null;
      if (prop.tenantId) {
        for (var j = 0; j < Game.state.tenants.length; j++) {
          if (Game.state.tenants[j].id === prop.tenantId) {
            tenant = Game.state.tenants[j];
            break;
          }
        }
        if (tenant) {
          if (typeof tenant.rating !== "number") tenant.rating = 0;
          if (typeof tenant.leaseDaysRemaining !== "number") tenant.leaseDaysRemaining = 180;
          // Rating >= 50 reduces decay. Rating < 50 provides no benefit (still deteriorates).
          if (tenant.rating >= 50) {
            var t = (tenant.rating - 50) / 50;
            decayMult = 0.9 - t * 0.5; // 50 -> 0.9, 100 -> 0.4
            if (decayMult < 0.25) decayMult = 0.25;
          }
        }
      }
      prop.maintenance -= baseDecay * decayMult;
      if (prop.maintenance < 0) prop.maintenance = 0;

      if (prop.tenantId) {
        if (!tenant) continue;
        tenant.leaseDaysRemaining -= 1;
        if (tenant.leaseDaysRemaining <= 0) {
          Game.addNotification(tenant.name + "'s lease ended at " + def.name + ".");
          prop.tenantId = null;
          continue;
        }
        var payChance = tenant.reliability * (tenant.happiness / 100);
        if (Math.random() < payChance) {
          var rent = tenant.rent;
          if (Game.Prestige && typeof Game.Prestige.getTenantRentMultiplier === "function") {
            rent *= Game.Prestige.getTenantRentMultiplier();
          }
          Game.addMoney(rent, "Rent from " + tenant.name);
        } else {
          Game.addNotification(tenant.name + " missed rent for " + def.name + ".");
          tenant.happiness -= 5;
        }
        tenant.happiness += (Math.random() * 4 - 2);
        // Poor condition reduces tenant happiness
        if (prop.maintenance < 40) tenant.happiness -= 2;
        if (tenant.happiness > 100) tenant.happiness = 100;
        if (tenant.happiness < 0) tenant.happiness = 0;
        if (tenant.happiness < 20 && Math.random() < 0.25) {
          Game.addNotification(tenant.name + " moved out of " + def.name + ".");
          prop.tenantId = null;
        }
      }
    }
    // Home condition drops slowly, too
    var h = Game.state.housing;
    if (h && typeof h.maintenance === "number") {
      h.maintenance -= (0.25 + Math.random() * 0.45);
      if (h.maintenance < 0) h.maintenance = 0;
    }
  },
  dailyExpense: function () {
    Game.Property.ensureHousingState();
    Game.Property.ensureRepairPricing();
    // Home rent is due daily (after income posts).
    var h = Game.state.housing;
    if (h && h.status === "rent" && h.rentPerDay > 0) {
      if (!Game.spendMoney(h.rentPerDay, "Home rent")) {
        Game.addNotification("You couldn't pay rent and moved back to the starter room.");
        h.homeId = "starter-room";
        h.status = "rent";
        h.rentPerDay = 0;
        h.maintenance = 100;
      }
    }
    var owned = Game.state.properties;
    for (var i = 0; i < owned.length; i++) {
      var prop = owned[i];
      var def = Game.Property.getPropertyDef(prop.id);
      if (!def) continue;
      var maintenance = def.maintenancePerDay;
      if (maintenance > 0) {
        Game.spendMoney(maintenance, "Property maintenance: " + def.name);
      }
    }
    if (owned.length > 0) {
      var totalValue = 0;
      for (var k = 0; k < owned.length; k++) {
        var d = Game.Property.getPropertyDef(owned[k].id);
        if (d) totalValue += d.price;
      }
      var tax = totalValue * Game.Economy.propertyTaxRatePerDay;
      if (tax > 0) {
        Game.spendMoney(tax, "Property taxes");
      }
    }
  },
  daily: function () {
    Game.Property.dailyIncome();
    Game.Property.dailyExpense();
  },
  tick: function (minutes) {
  }
};

Game.registerDailyIncomeHandler(Game.Property.dailyIncome);
Game.registerDailyExpenseHandler(Game.Property.dailyExpense);
