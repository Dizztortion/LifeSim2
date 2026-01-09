Game.World = {
  locations: [
    { id: "Home", name: "Home", description: "Where you rest and manage your life." },
    { id: "City Centre", name: "City Centre", description: "Shops, offices and doctor." },
    { id: "Industrial Park", name: "Industrial Park", description: "Heavy industry and BTC hardware suppliers." },
    { id: "Hospital", name: "Hospital", description: "Urgent healthcare." },
    { id: "Countryside", name: "Countryside", description: "Relaxing but not very profitable." }
  ],
  _ensureTravelState: function () {
    if (!Game.state.travel) {
      Game.state.travel = {
        inProgress: false,
        from: null,
        to: null,
        remainingMinutes: 0,
        totalMinutes: 0,
        mode: "travel",
        sleepAfterArrival: false
      };
    }
    if (typeof Game.state.travel.mode !== "string") Game.state.travel.mode = "travel";
    if (typeof Game.state.travel.sleepAfterArrival !== "boolean") Game.state.travel.sleepAfterArrival = false;
    return Game.state.travel;
  },
  travelTo: function (id) {
    if (Game.state.travelLocation === id) {
      Game.addNotification("You are already at " + id + ".");
      return;
    }
    if (Game.blockIfSleeping && Game.blockIfSleeping("travel")) return;
    if (Game.state.job && Game.state.job.isWorking) {
      Game.addNotification("Finish your work shift before travelling.");
      return;
    }
    if (Game.state.school && Game.state.school.enrolled) {
      Game.addNotification("Finish your current course before travelling.");
      return;
    }
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("You are already travelling.");
      return;
    }
    var cost = Game.Economy.travelBaseCost;
    if (Game.Prestige && typeof Game.Prestige.getTravelCostMultiplier === "function") {
      cost *= Game.Prestige.getTravelCostMultiplier();
    }
    cost = Math.round(cost * 100) / 100;
    if (!Game.spendMoney(cost, "Travel to " + id)) {
      Game.addNotification("Not enough money to travel.");
      return;
    }
    var duration = Game.World.getTravelDuration(Game.state.travelLocation, id);
    var t = Game.World._ensureTravelState();
    t.inProgress = true;
    t.from = Game.state.travelLocation;
    t.to = id;
    t.remainingMinutes = duration;
    t.totalMinutes = duration;
    t.mode = "travel";
    t.sleepAfterArrival = false;
    Game.addNotification("Travel started to " + id + ". It will take about " + Math.round(duration / 60) + " in-game hours.");
  },
  walkHomeForSleep: function () {
    if (Game.state.travelLocation === "Home") return false;
    if (Game.blockIfSleeping && Game.blockIfSleeping("walk home")) return false;
    if (Game.state.job && Game.state.job.isWorking) return false;
    if (Game.state.school && Game.state.school.enrolled) return false;
    var t = Game.World._ensureTravelState();
    if (t.inProgress) return false;
    var duration = Game.World.getTravelDuration(Game.state.travelLocation, "Home");
    if (!(duration > 0)) duration = 60;
    duration *= 4; // 4x slower than paid travel.
    t.inProgress = true;
    t.from = Game.state.travelLocation;
    t.to = "Home";
    t.remainingMinutes = duration;
    t.totalMinutes = duration;
    t.mode = "walk";
    t.sleepAfterArrival = true;
    Game.addNotification("Not enough money to travel. You start walking home...");
    return true;
  },
  getTravelDuration: function (fromId, toId) {
    if (!fromId || !toId || fromId === toId) return 0;
    // Simple fixed travel time for now: 60 in-game minutes
    return 60;
  },
  tickTravel: function (minutes) {
    var t = Game.state.travel;
    if (!t || !t.inProgress) return;
    t.remainingMinutes -= minutes;
    if (t.remainingMinutes <= 0) {
      t.remainingMinutes = 0;
      t.inProgress = false;
      Game.state.travelLocation = t.to;
      if (t.mode === "walk") Game.addNotification("You made it home.");
      else Game.addNotification("Arrived at " + (t.to || "destination") + ".");
      if (Game.Shop && Game.Shop.generateOffersForLocation) {
        Game.Shop.generateOffersForLocation(Game.state.travelLocation);
      }
      if (t.sleepAfterArrival && Game.state.travelLocation === "Home") {
        t.sleepAfterArrival = false;
        try { if (Game.startSleeping) Game.startSleeping(); } catch (e) {}
      }
    }
  }
};

// UK travel using the rail network/hubs.
Game.World.getUkRailHubs = function () {
  if (Game.Companies && typeof Game.Companies.getRailLocations === "function") return Game.Companies.getRailLocations();
  return [];
};

Game.World.ukTravelTo = function (placeId) {
  if (Game.blockIfSleeping && Game.blockIfSleeping("uk travel")) return;
  if (Game.state.job && Game.state.job.isWorking) {
    Game.addNotification("Finish your work shift before travelling.");
    return;
  }
  if (Game.state.school && Game.state.school.enrolled) {
    Game.addNotification("Finish your current course before travelling.");
    return;
  }
  if (Game.state.travel && Game.state.travel.inProgress) {
    Game.addNotification("Finish your current travel before starting a UK trip.");
    return;
  }
  if (!Game.state.ukTravel || typeof Game.state.ukTravel !== "object") {
    Game.state.ukTravel = { inProgress: false, fromPlaceId: "", toPlaceId: "", stops: [], legIndex: 0, trail: "", remainingMinutes: 0, totalMinutes: 0, notifyStage: 0 };
  }
  if (Game.state.ukTravel.inProgress) {
    Game.addNotification("You are already travelling across the UK.");
    return;
  }

  var to = String(placeId || "");
  if (!to) return;
  var from = (Game.state.player && Game.state.player.currentPlaceId) ? String(Game.state.player.currentPlaceId) : "";
  if (!from) {
    from = (Game.state.player && Game.state.player.homePlaceId) ? String(Game.state.player.homePlaceId) : "London";
    if (!Game.state.player) Game.state.player = { name: "", homePlaceId: from, currentPlaceId: from };
    if (!Game.state.player.currentPlaceId) Game.state.player.currentPlaceId = from;
  }
  if (to === from) {
    Game.addNotification("You are already in " + to + ".");
    return;
  }

  // UK rail travel uses hubs; clamp to known hub ids.
  var hubs = Game.World.getUkRailHubs();
  var hubIds = [];
  for (var hi = 0; hi < hubs.length; hi++) {
    if (hubs[hi] && hubs[hi].id) hubIds.push(String(hubs[hi].id));
  }
  function toHub(id) {
    var v = String(id || "");
    if (v && hubIds.indexOf(v) !== -1) return v;
    return hubIds.length ? hubIds[0] : "London";
  }
  function hubLabel(id) {
    var v = String(id || "");
    for (var i = 0; i < hubs.length; i++) {
      var h = hubs[i];
      if (h && String(h.id) === v) return h.name || h.id || v;
    }
    return v;
  }
  from = toHub(from);
  to = toHub(to);
  if (to === from) {
    Game.addNotification("You are already in " + hubLabel(to) + ".");
    return;
  }

  if (!Game.Companies || typeof Game.Companies.findRailPathStops !== "function") {
    Game.addNotification("UK travel is unavailable (rail routing not ready).");
    return;
  }
  var stops = Game.Companies.findRailPathStops(from, to);
  if (!stops || stops.length < 2) {
    Game.addNotification("No UK rail route exists between " + from + " and " + to + ".");
    return;
  }
  var totalMinutes = 0;
  for (var i = 0; i < stops.length - 1; i++) {
    var def = Game.Companies.getRailRouteDef(stops[i], stops[i + 1]);
    if (!def) { totalMinutes = 0; break; }
    totalMinutes += (def.minutes || 180);
  }
  if (!(totalMinutes > 0)) totalMinutes = 180;

  // Cost scales gently with duration.
  var cost = Math.max(20, Math.round((Game.Economy.travelBaseCost || 20) * (1.5 + (totalMinutes / 240))));
  if (Game.Prestige && typeof Game.Prestige.getTravelCostMultiplier === "function") {
    cost *= Game.Prestige.getTravelCostMultiplier();
  }
  cost = Math.round(cost * 100) / 100;
  if (!Game.spendMoney(cost, "UK travel to " + to)) {
    Game.addNotification("Not enough money to travel.");
    return;
  }

  Game.state.ukTravel.inProgress = true;
  Game.state.ukTravel.fromPlaceId = from;
  Game.state.ukTravel.toPlaceId = to;
  Game.state.ukTravel.stops = stops;
  Game.state.ukTravel.legIndex = 0;
  Game.state.ukTravel.trail = Game.Companies.getRailTrailKey(stops[0], stops[1]);
  Game.state.ukTravel.totalMinutes = totalMinutes;
  Game.state.ukTravel.remainingMinutes = totalMinutes;
  Game.state.ukTravel.notifyStage = 0;

  var fromName = from;
  var toName = to;
  fromName = hubLabel(from);
  toName = hubLabel(to);
  Game.addNotification("UK travel started: " + fromName + " → " + toName + ".");
};

Game.World.tickUkTravel = function (minutes) {
  var t = Game.state.ukTravel;
  if (!t || !t.inProgress) return;
  if (typeof t.remainingMinutes !== "number" || !isFinite(t.remainingMinutes)) t.remainingMinutes = t.totalMinutes || 0;
  t.remainingMinutes -= minutes;
  if (t.remainingMinutes < 0) t.remainingMinutes = 0;

  var total = (typeof t.totalMinutes === "number" && isFinite(t.totalMinutes) && t.totalMinutes > 0) ? t.totalMinutes : 1;
  var done = total - t.remainingMinutes;
  var pct = Math.max(0, Math.min(1, done / total));
  var stage = Math.floor(pct * 4); // 0..4
  if (typeof t.notifyStage !== "number" || !isFinite(t.notifyStage)) t.notifyStage = 0;

  if (stage > t.notifyStage && stage >= 1 && stage <= 3) {
    t.notifyStage = stage;
    var label = "";
    Game.addNotification("You are " + (label || "in transit") + " (" + Math.floor(pct * 100) + "%).");
  }

  if (t.remainingMinutes <= 0) {
    t.inProgress = false;
    var dest = t.toPlaceId || "";
    if (!Game.state.player || typeof Game.state.player !== "object") Game.state.player = { name: "", homePlaceId: "", currentPlaceId: "" };
    if (dest) Game.state.player.currentPlaceId = dest;
    var destName = dest || "your destination";
    Game.addNotification("Arrived in " + destName + ".");
  }
};

Game.Shop = {
  onlineItems: [
    { id: "cloud-bronze", name: "Bronze Cloud Contract", price: 180, type: "service", target: "cloud-bronze" },
    { id: "cloud-silver", name: "Silver Cloud Contract", price: 270, type: "service", target: "cloud-silver" },
    { id: "cloud-gold", name: "Gold Cloud Contract", price: 420, type: "service", target: "cloud-gold" },
    { id: "pc-upgrade", name: "Minor PC Upgrade", price: 140, type: "hardware", target: "pc-upgrade" },
    // PC Hardware Market (online)
    { id: "net-plan-upgrade", name: "Network Cabling", price: 60, type: "service", target: "net-plan-upgrade" },
    { id: "net-router-upgrade", name: "Router Upgrade Kit", price: 120, type: "hardware", target: "net-router-upgrade" },
    { id: "net-nic-upgrade", name: "Network Card Upgrade", price: 90, type: "hardware", target: "net-nic-upgrade" },
    { id: "pc-storage-50gb", name: "Storage Upgrade: +50 000 MB", price: 160, type: "hardware", target: "pc-storage-50gb" },
    { id: "pc-ram-1", name: "RAM Upgrade (L1) — 2 GB", price: 70, type: "hardware", target: "pc-ram-1" },
    { id: "pc-ram-2", name: "RAM Upgrade (L2) — 4 GB", price: 150, type: "hardware", target: "pc-ram-2" },
    { id: "pc-ram-3", name: "RAM Upgrade (L3) — 8 GB", price: 320, type: "hardware", target: "pc-ram-3" },
    { id: "pc-ram-4", name: "RAM Upgrade (L4) — 16 GB", price: 700, type: "hardware", target: "pc-ram-4" },
    { id: "pc-ram-5", name: "RAM Upgrade (L5) — 32 GB", price: 1400, type: "hardware", target: "pc-ram-5" },
    { id: "pc-ram-6", name: "RAM Upgrade (L6) — 64 GB", price: 2600, type: "hardware", target: "pc-ram-6" },
    // PC Miner upgrades (online)
    { id: "pcminer-case-1", name: "PC Miner Case (L1)", price: 70, type: "hardware", target: "pcminer-case-1" },
    { id: "pcminer-case-2", name: "PC Miner Case (L2)", price: 160, type: "hardware", target: "pcminer-case-2" },
    { id: "pcminer-case-3", name: "PC Miner Case (L3)", price: 360, type: "hardware", target: "pcminer-case-3" },
    { id: "pcminer-fans-1", name: "PC Miner Fans Pack (L1)", price: 55, type: "hardware", target: "pcminer-fans-1" },
    { id: "pcminer-fans-2", name: "PC Miner Fans Pack (L2)", price: 120, type: "hardware", target: "pcminer-fans-2" },
    { id: "pcminer-fans-3", name: "PC Miner Fans Pack (L3)", price: 260, type: "hardware", target: "pcminer-fans-3" },
    { id: "pcminer-psu-1", name: "PC Miner PSU (L1)", price: 90, type: "hardware", target: "pcminer-psu-1" },
    { id: "pcminer-psu-2", name: "PC Miner PSU (L2)", price: 190, type: "hardware", target: "pcminer-psu-2" },
    { id: "pcminer-psu-3", name: "PC Miner PSU (L3)", price: 420, type: "hardware", target: "pcminer-psu-3" },
    { id: "pcminer-cpu-1", name: "Mining CPU Upgrade (L1)", price: 110, type: "hardware", target: "pcminer-cpu-1" },
    { id: "pcminer-cpu-2", name: "Mining CPU Upgrade (L2)", price: 240, type: "hardware", target: "pcminer-cpu-2" },
    { id: "pcminer-cpu-3", name: "Mining CPU Upgrade (L3)", price: 520, type: "hardware", target: "pcminer-cpu-3" },
    { id: "pcminer-cpu-4", name: "Mining CPU Upgrade (L4)", price: 980, type: "hardware", target: "pcminer-cpu-4" },
    { id: "pcminer-cpu-5", name: "Mining CPU Upgrade (L5)", price: 1700, type: "hardware", target: "pcminer-cpu-5" },
    { id: "pcminer-cpu-6", name: "Mining CPU Upgrade (L6)", price: 2600, type: "hardware", target: "pcminer-cpu-6" },
    { id: "pcminer-gpu-1", name: "Mining GPU Upgrade (L1)", price: 180, type: "hardware", target: "pcminer-gpu-1" },
    { id: "pcminer-gpu-2", name: "Mining GPU Upgrade (L2)", price: 420, type: "hardware", target: "pcminer-gpu-2" },
    { id: "pcminer-gpu-3", name: "Mining GPU Upgrade (L3)", price: 860, type: "hardware", target: "pcminer-gpu-3" },
    { id: "pcminer-gpu-4", name: "Mining GPU Upgrade (L4)", price: 1500, type: "hardware", target: "pcminer-gpu-4" },
    { id: "pcminer-gpu-5", name: "Mining GPU Upgrade (L5)", price: 2400, type: "hardware", target: "pcminer-gpu-5" },
    { id: "pcminer-gpu-6", name: "Mining GPU Upgrade (L6)", price: 3600, type: "hardware", target: "pcminer-gpu-6" },
    { id: "pcminer-software-1", name: "Miner Software (L1)", price: 45, type: "software", target: "pcminer-software-1" },
    { id: "pcminer-software-2", name: "Miner Software (L2)", price: 120, type: "software", target: "pcminer-software-2" },
    { id: "pcminer-software-3", name: "Miner Software (L3)", price: 280, type: "software", target: "pcminer-software-3" },
    { id: "pcminer-software-4", name: "Miner Software (L4)", price: 620, type: "software", target: "pcminer-software-4" },
    { id: "pcminer-software-5", name: "Miner Software (L5)", price: 1150, type: "software", target: "pcminer-software-5" },
    { id: "pcminer-software-6", name: "Miner Software (L6)", price: 2000, type: "software", target: "pcminer-software-6" },

    // Balance pass (v2): higher prices + clearer names; generator prefers later entries.
    { id: "net-plan-512-v2", name: "Internet Plan Upgrade: 512 Kbps", price: 120, type: "service", target: "net-plan-512" },
    { id: "net-plan-2048-v2", name: "Internet Plan Upgrade: 2048 Kbps", price: 380, type: "service", target: "net-plan-2048" },
    { id: "net-plan-10000-v2", name: "Internet Plan Upgrade: 10 000 Kbps", price: 1400, type: "service", target: "net-plan-10000" },
    { id: "net-router-upgrade-v2", name: "Router Upgrade Kit (L1)", price: 240, type: "hardware", target: "net-router-upgrade" },
    { id: "net-nic-upgrade-v2", name: "Network Card Upgrade (L1)", price: 190, type: "hardware", target: "net-nic-upgrade" },

    { id: "pc-mobo-1-v2", name: "Motherboard Upgrade (L1) — Enthusiast board", price: 3600, type: "hardware", target: "pc-mobo-1" },

    { id: "pc-storage-1-v2", name: "Storage Upgrade (L1) — +50 000 MB", price: 420, type: "hardware", target: "pc-storage-1" },
    { id: "pc-storage-2-v2", name: "Storage Upgrade (L2) — +100 000 MB", price: 980, type: "hardware", target: "pc-storage-2" },
    { id: "pc-storage-3-v2", name: "Storage Upgrade (L3) — +150 000 MB", price: 1800, type: "hardware", target: "pc-storage-3" },
    { id: "pc-storage-4-v2", name: "Storage Upgrade (L4) — +200 000 MB", price: 2900, type: "hardware", target: "pc-storage-4" },

    { id: "pc-ram-1-v2", name: "RAM Upgrade (L1) — 2 GB", price: 160, type: "hardware", target: "pc-ram-1" },
    { id: "pc-ram-2-v2", name: "RAM Upgrade (L2) — 4 GB", price: 340, type: "hardware", target: "pc-ram-2" },
    { id: "pc-ram-3-v2", name: "RAM Upgrade (L3) — 8 GB", price: 780, type: "hardware", target: "pc-ram-3" },
    { id: "pc-ram-4-v2", name: "RAM Upgrade (L4) — 16 GB", price: 1600, type: "hardware", target: "pc-ram-4" },
    { id: "pc-ram-5-v2", name: "RAM Upgrade (L5) — 32 GB", price: 3200, type: "hardware", target: "pc-ram-5" },
    { id: "pc-ram-6-v2", name: "RAM Upgrade (L6) — 64 GB", price: 5600, type: "hardware", target: "pc-ram-6" },

    { id: "pcminer-case-1-v2", name: "Budget Airflow Case (L1)", price: 180, type: "hardware", target: "pcminer-case-1" },
    { id: "pcminer-case-2-v2", name: "High-Airflow Case (L2)", price: 420, type: "hardware", target: "pcminer-case-2" },
    { id: "pcminer-case-3-v2", name: "Enthusiast Airflow Case (L3)", price: 900, type: "hardware", target: "pcminer-case-3" },
    { id: "pcminer-fans-1-v2", name: "Dual Fan Pack (L1)", price: 150, type: "hardware", target: "pcminer-fans-1" },
    { id: "pcminer-fans-2-v2", name: "High Pressure Fans (L2)", price: 340, type: "hardware", target: "pcminer-fans-2" },
    { id: "pcminer-fans-3-v2", name: "Premium Cooling Fans (L3)", price: 760, type: "hardware", target: "pcminer-fans-3" },
    { id: "pcminer-psu-1-v2", name: "PSU Upgrade (L1)", price: 260, type: "hardware", target: "pcminer-psu-1" },
    { id: "pcminer-psu-2-v2", name: "High-Capacity PSU (L2)", price: 620, type: "hardware", target: "pcminer-psu-2" },
    { id: "pcminer-psu-3-v2", name: "Enthusiast PSU (L3)", price: 1300, type: "hardware", target: "pcminer-psu-3" },
    { id: "pcminer-cpu-1-v2", name: "Mining CPU Upgrade (L1)", price: 340, type: "hardware", target: "pcminer-cpu-1" },
    { id: "pcminer-cpu-2-v2", name: "Mining CPU Upgrade (L2)", price: 780, type: "hardware", target: "pcminer-cpu-2" },
    { id: "pcminer-cpu-3-v2", name: "Mining CPU Upgrade (L3)", price: 1400, type: "hardware", target: "pcminer-cpu-3" },
    { id: "pcminer-cpu-4-v2", name: "Mining CPU Upgrade (L4)", price: 2400, type: "hardware", target: "pcminer-cpu-4" },
    { id: "pcminer-cpu-5-v2", name: "Mining CPU Upgrade (L5)", price: 3800, type: "hardware", target: "pcminer-cpu-5" },
    { id: "pcminer-cpu-6-v2", name: "Mining CPU Upgrade (L6)", price: 5600, type: "hardware", target: "pcminer-cpu-6" },
    { id: "pcminer-gpu-1-v2", name: "Mining GPU Upgrade (L1)", price: 520, type: "hardware", target: "pcminer-gpu-1" },
    { id: "pcminer-gpu-2-v2", name: "Mining GPU Upgrade (L2)", price: 1200, type: "hardware", target: "pcminer-gpu-2" },
    { id: "pcminer-gpu-3-v2", name: "Mining GPU Upgrade (L3)", price: 2100, type: "hardware", target: "pcminer-gpu-3" },
    { id: "pcminer-gpu-4-v2", name: "Mining GPU Upgrade (L4)", price: 3500, type: "hardware", target: "pcminer-gpu-4" },
    { id: "pcminer-gpu-5-v2", name: "Mining GPU Upgrade (L5)", price: 5400, type: "hardware", target: "pcminer-gpu-5" },
    { id: "pcminer-gpu-6-v2", name: "Mining GPU Upgrade (L6)", price: 8000, type: "hardware", target: "pcminer-gpu-6" },
    { id: "pcminer-software-1-v2", name: "Miner Software Suite (L1)", price: 140, type: "software", target: "pcminer-software-1" },
    { id: "pcminer-software-2-v2", name: "Miner Software Suite (L2)", price: 340, type: "software", target: "pcminer-software-2" },
    { id: "pcminer-software-3-v2", name: "Miner Software Suite (L3)", price: 760, type: "software", target: "pcminer-software-3" },
    { id: "pcminer-software-4-v2", name: "Miner Software Suite (L4)", price: 1400, type: "software", target: "pcminer-software-4" },
    { id: "pcminer-software-5-v2", name: "Miner Software Suite (L5)", price: 2400, type: "software", target: "pcminer-software-5" },
    { id: "pcminer-software-6-v2", name: "Miner Software Suite (L6)", price: 3800, type: "software", target: "pcminer-software-6" }
  ],
  _setOnlineItem: function (id, name, price) {
    for (var i = 0; i < Game.Shop.onlineItems.length; i++) {
      var it = Game.Shop.onlineItems[i];
      if (!it || it.id !== id) continue;
      if (typeof name === "string" && name.length) it.name = name;
      if (typeof price === "number" && isFinite(price) && price >= 0) it.price = price;
      return it;
    }
    return null;
  },
  _refreshNetMarketItems: function () {
    if (!Game.Net || !Game.Net.ensure) return;
    Game.Net.ensure();
    var net = Game.state.net || {};
    var planKbps = (Game.Net.getPlanKbps ? Game.Net.getPlanKbps() : (net.planKbps || 128));
    var planLvl = (Game.Net.getPlanLevel ? Game.Net.getPlanLevel() : (net.planLevel || 0));
    var maxPlan = (Game.Net.getMaxPlanLevel ? Game.Net.getMaxPlanLevel() : (5 + (net.routerLevel || 0) * 5));
    var nextPlan = (Game.Net.getNextPlanKbps ? Game.Net.getNextPlanKbps() : null);
    var planPrice = (Game.Net.getPlanUpgradePrice ? Game.Net.getPlanUpgradePrice() : 0);
    if (nextPlan) {
      Game.Shop._setOnlineItem(
        "net-plan-upgrade",
        "Network Cabling: " + planKbps + " → " + nextPlan + " Kbps (L" + planLvl + "/" + maxPlan + ")",
        planPrice
      );
    } else {
      Game.Shop._setOnlineItem(
        "net-plan-upgrade",
        "Network Cabling (router limit reached)",
        planPrice
      );
    }
    var rLvl = net.routerLevel || 0;
    var rPrice = (Game.Net.getRouterUpgradePrice ? Game.Net.getRouterUpgradePrice() : 0);
    Game.Shop._setOnlineItem(
      "net-router-upgrade",
      "Router Upgrade Kit (L" + rLvl + " → L" + Math.min(10, rLvl + 1) + ")",
      rPrice
    );
    var nLvl = net.nicLevel || 0;
    var maxNic = (Game.Net.getMaxNicLevel ? Game.Net.getMaxNicLevel() : (2 + (rLvl || 0) * 2));
    var nPrice = (Game.Net.getNicUpgradePrice ? Game.Net.getNicUpgradePrice() : 0);
    Game.Shop._setOnlineItem(
      "net-nic-upgrade",
      "Network Card Upgrade (L" + nLvl + " → L" + Math.min(maxNic, nLvl + 1) + ", max L" + maxNic + ")",
      nPrice
    );
  },
  invalidateHardwareMarketOffers: function () {
    if (!Game.state || !Game.state.pc) return;
    if (!Game.state.pc.hardwareMarketOffers || typeof Game.state.pc.hardwareMarketOffers !== "object") {
      Game.state.pc.hardwareMarketOffers = { day: 0, ids: [] };
    }
    Game.state.pc.hardwareMarketOffers.day = 0;
    Game.state.pc.hardwareMarketOffers.ids = [];
  },
  physicalItems: [
    { id: "coal-shovel", name: "Quality Coal Shovel", price: 90, type: "tool", location: "Industrial Park" },
    { id: "health-snacks", name: "Healthy Snack Pack", price: 45, type: "consumable", location: "City Centre" },
    { id: "small-rig-kit", name: "Basic Rig Frame Kit", price: 260, type: "hardware", location: "Industrial Park" },
    // PC Miner parts (in-person)
    { id: "pcminer-fans-1-local", name: "PC Miner Fans Pack (L1)", price: 60, type: "hardware", location: "Industrial Park" },
    { id: "pcminer-psu-1-local", name: "PC Miner PSU (L1)", price: 95, type: "hardware", location: "Industrial Park" },
    { id: "pcminer-gpu-1-local", name: "Mining GPU Upgrade (L1)", price: 200, type: "hardware", location: "Industrial Park" },
    { id: "pcminer-software-1-local", name: "Miner Software USB (L1)", price: 55, type: "hardware", location: "City Centre" },
    { id: "pc-ram-1-local", name: "RAM Upgrade (L1) — 2 GB", price: 85, type: "hardware", location: "City Centre" },
    { id: "pc-ram-2-local", name: "RAM Upgrade (L2) — 4 GB", price: 180, type: "hardware", location: "Industrial Park" },
    // Home-only items
    { id: "home-tool-set", name: "Home Tool Set", price: 55, type: "hardware", location: "Home" },
    { id: "home-book-bundle", name: "Book Bundle", price: 25, type: "tool", location: "Home" },
    // Energy drinks – available at different locations
    { id: "drink-red-fang", name: "Red Fang", price: 7, type: "energy drink", location: "City Centre" },
    { id: "drink-monster-byte", name: "MonsterByte", price: 9, type: "energy drink", location: "City Centre" },
    { id: "drink-rock-blitz", name: "RockBlitz", price: 6, type: "energy drink", location: "Industrial Park" },
    { id: "drink-amp-core", name: "AmpCore", price: 8, type: "energy drink", location: "Industrial Park" },
    { id: "drink-thunderbolt", name: "ThunderBolt Energy", price: 9, type: "energy drink", location: "City Centre" },
    { id: "drink-vyper-volt", name: "VyperVolt", price: 7, type: "energy drink", location: "Countryside" },
    { id: "drink-nitro-roar", name: "NitroRoar", price: 10, type: "energy drink", location: "Countryside" }
  ],
  meals: [
    { id: "breakfast", name: "Breakfast", basePrice: 10 },
    { id: "lunch", name: "Lunch", basePrice: 14 },
    { id: "dinner", name: "Dinner", basePrice: 18 }
  ],
  getMealPrice: function (mealId) {
    var base = 0;
    for (var i = 0; i < Game.Shop.meals.length; i++) {
      if (Game.Shop.meals[i].id === mealId) {
        base = Game.Shop.meals[i].basePrice;
        break;
      }
    }
    if (base <= 0) base = 10;
    var loc = Game.state.travelLocation || "Home";
    var mult = loc === "Home" ? 1.25 : 1.0;
    return Math.round(base * mult);
  },
  ensureStock: function () {
    if (!Game.state.shopStock || typeof Game.state.shopStock !== "object") {
      Game.state.shopStock = {};
    }
    var stock = Game.state.shopStock;
    for (var i = 0; i < Game.Shop.physicalItems.length; i++) {
      var item = Game.Shop.physicalItems[i];
      if (!item || !item.id) continue;
      if (typeof stock[item.id] !== "number" || stock[item.id] < 0) {
        stock[item.id] = 10;
      }
    }
  },
  ensureRestockState: function () {
    if (!Game.state.shopRestock || typeof Game.state.shopRestock !== "object") {
      Game.state.shopRestock = { lastDay: Game.state.day || 1, lastMinute: Math.floor(Game.state.timeMinutes || 0) };
    }
    if (typeof Game.state.shopRestock.lastDay !== "number") Game.state.shopRestock.lastDay = Game.state.day || 1;
    if (typeof Game.state.shopRestock.lastMinute !== "number") Game.state.shopRestock.lastMinute = Math.floor(Game.state.timeMinutes || 0);
  },
  restockAll: function () {
    Game.Shop.ensureStock();
    var stock = Game.state.shopStock;
    for (var i = 0; i < Game.Shop.physicalItems.length; i++) {
      var item = Game.Shop.physicalItems[i];
      if (!item || !item.id) continue;
      var cur = typeof stock[item.id] === "number" ? stock[item.id] : 0;
      if (cur < 0) cur = 0;
      var add = 4 + Math.floor(Math.random() * 6); // 4..9 units per restock
      var cap = 25;
      stock[item.id] = Math.min(cap, cur + add);
    }
    // Re-roll offers for all locations so prices/availability update with restocks.
    if (Game.World && Array.isArray(Game.World.locations)) {
      for (var li = 0; li < Game.World.locations.length; li++) {
        var loc = Game.World.locations[li];
        if (loc && loc.id) {
          Game.Shop.generateOffersForLocation(loc.id);
        }
      }
    } else {
      Game.Shop.generateOffersForLocation(Game.state.travelLocation || "Home");
    }
  },
  tick: function () {
    Game.Shop.ensureRestockState();
    // Restock twice per in-game day: 00:00 and 12:00.
    var sr = Game.state.shopRestock;
    var day = Game.state.day || 1;
    var minute = Math.floor(Game.state.timeMinutes || 0);
    var lastDay = sr.lastDay || day;
    var lastMinute = sr.lastMinute || 0;
    var noon = 12 * 60;

    // Midnight boundary (day changed).
    if (day !== lastDay) {
      Game.Shop.restockAll();
      sr.lastDay = day;
      sr.lastMinute = minute;
      return;
    }

    // Noon boundary within same day.
    if (lastMinute < noon && minute >= noon) {
      Game.Shop.restockAll();
    }

    sr.lastDay = day;
    sr.lastMinute = minute;
  },
  generateOffersForLocation: function (location) {
    Game.Shop.ensureStock();
    if (!Game.state.shopOffers) {
      Game.state.shopOffers = {};
    }
    var offers = [];
    for (var i = 0; i < Game.Shop.physicalItems.length; i++) {
      var item = Game.Shop.physicalItems[i];
      if (item.location !== location) continue;
      if (Math.random() < 0.25) continue;
      var basePrice = item.price;
      var multiplier = 0.8 + Math.random() * 0.6;
      var price = Math.round(basePrice * multiplier);
      offers.push({
        id: item.id,
        price: price
      });
    }
    Game.state.shopOffers[location] = offers;
  },
  ensureHardwareMarketOffers: function () {
    if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };
    if (!Game.state.pc.hardwareMarketOffers || typeof Game.state.pc.hardwareMarketOffers !== "object") {
      Game.state.pc.hardwareMarketOffers = { day: 0, ids: [] };
    }
    if (typeof Game.state.pc.hardwareMarketOffers.day !== "number") Game.state.pc.hardwareMarketOffers.day = 0;
    if (!Array.isArray(Game.state.pc.hardwareMarketOffers.ids)) Game.state.pc.hardwareMarketOffers.ids = [];
  },
  generateHardwareMarketOffers: function () {
    Game.Shop.ensureHardwareMarketOffers();
    var curDay = Game.state.day || 1;
    // Keep dynamic net prices/names up to date even if we don't reroll offers.
    if (Game.Shop._refreshNetMarketItems) Game.Shop._refreshNetMarketItems();
    if (Game.state.pc.hardwareMarketOffers.day === curDay && Game.state.pc.hardwareMarketOffers.ids.length) {
      return;
    }
    Game.state.pc.hardwareMarketOffers.day = curDay;

    if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
    if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
    if (Game.Net && Game.Net.ensure) Game.Net.ensure();

    var p = (Game.state.btc && Game.state.btc.pcMiner) ? Game.state.btc.pcMiner : {};
    var net = Game.state.net || {};

    var byId = {};
    for (var i = 0; i < Game.Shop.onlineItems.length; i++) {
      var it = Game.Shop.onlineItems[i];
      if (it && it.id) byId[it.id] = it;
    }

    function findOnlineId(target) {
      // Prefer latest entries (so balance patches can append new tuned items safely).
      for (var j = Game.Shop.onlineItems.length - 1; j >= 0; j--) {
        var o = Game.Shop.onlineItems[j];
        if (o && o.target === target) return o.id;
      }
      return null;
    }

    // Candidate upgrades: next level only per component.
    var candidates = [];
    var kinds = [
      { kind: "case", key: "caseLevel" },
      { kind: "fans", key: "fansLevel" },
      { kind: "psu", key: "psuLevel" },
      { kind: "cpu", key: "cpuLevel" },
      { kind: "gpu", key: "gpuLevel" },
      { kind: "software", key: "softwareLevel" }
    ];
    for (var k = 0; k < kinds.length; k++) {
      var kk = kinds[k];
      var curLvl = (kk.kind === "software")
        ? ((Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : (p.softwareLevel || 0))
        : (p[kk.key] || 0);
      var nextLvl = curLvl + 1;
      if (kk.kind === "cpu" && Game.PC && Game.PC.getMaxCpuLevel) {
        if (nextLvl > Game.PC.getMaxCpuLevel()) continue;
      }
      if (kk.kind === "gpu" && Game.PC && Game.PC.getMaxGpuLevel) {
        if (nextLvl > Game.PC.getMaxGpuLevel()) continue;
      }
      if (kk.kind === "software" && Game.PC && Game.PC.getMaxCpuLevel) {
        // Tie miner software cap to motherboard CPU cap (simpler rule).
        if (nextLvl > Game.PC.getMaxCpuLevel()) continue;
      }
      var id = findOnlineId("pcminer-" + kk.kind + "-" + nextLvl);
      if (id) candidates.push(id);
    }

    // RAM upgrades (next level only, capped by motherboard)
    var ramLvl = (Game.state.pc && typeof Game.state.pc.ramLevel === "number") ? Game.state.pc.ramLevel : 0;
    var nextRam = ramLvl + 1;
    if (Game.PC && Game.PC.getMaxRamLevel && nextRam <= Game.PC.getMaxRamLevel()) {
      var ramId = findOnlineId("pc-ram-" + nextRam);
      if (ramId) candidates.push(ramId);
    }

    // Motherboard upgrade (enables higher caps)
    var mbTier = (Game.state.pc && typeof Game.state.pc.motherboardTier === "number") ? Game.state.pc.motherboardTier : 0;
    if (mbTier < 1) {
      var mid = findOnlineId("pc-mobo-1");
      if (mid) candidates.push(mid);
    }

    // Net upgrades: show at most one plan upgrade (next tier).
    if (Game.Net && Game.Net.getNextPlanKbps && Game.Net.getNextPlanKbps()) {
      var pid = findOnlineId("net-plan-upgrade");
      if (pid) candidates.push(pid);
    }
    // Router upgrades are not available every day.
    var showRouter = false;
    if ((net.routerLevel || 0) < 10) {
      var d0 = curDay || 1;
      // deterministic "random" roll per day (stable across reloads)
      var roll = (Math.sin(d0 * 12.9898) * 43758.5453);
      roll = roll - Math.floor(roll);
      var chance = (net.routerLevel || 0) <= 0 ? 0.60 : 0.35;
      if (d0 === 1) chance = 1;
      showRouter = roll < chance;
      // Only one router upgrade can be bought per day (per appearance).
      if (typeof net.routerBoughtDay === "number" && net.routerBoughtDay === d0) showRouter = false;
    }
    if (showRouter) {
      var rid = findOnlineId("net-router-upgrade");
      if (rid) candidates.push(rid);
    }
    if (Game.Net && Game.Net.getMaxNicLevel) {
      var maxNic = Game.Net.getMaxNicLevel();
      if ((net.nicLevel || 0) < maxNic) {
        var nid = findOnlineId("net-nic-upgrade");
        if (nid) candidates.push(nid);
      }
    } else if ((net.nicLevel || 0) < 3) {
      var nid2 = findOnlineId("net-nic-upgrade");
      if (nid2) candidates.push(nid2);
    }
    // Storage upgrades (next level only, capped by motherboard)
    var curStorageLevel = (Game.state.pc && typeof Game.state.pc.storageLevel === "number") ? Game.state.pc.storageLevel : 0;
    var nextStorage = curStorageLevel + 1;
    var maxStorageLevel = (Game.PC && Game.PC.getMaxStorageLevel) ? Game.PC.getMaxStorageLevel() : 2;
    if (nextStorage <= maxStorageLevel) {
      var sid = findOnlineId("pc-storage-" + nextStorage);
      if (sid) candidates.push(sid);
    }

    // De-dup then pick up to 4.
    var uniq = {};
    var pool = [];
    for (var c = 0; c < candidates.length; c++) {
      var cid = candidates[c];
      if (!cid || uniq[cid]) continue;
      uniq[cid] = true;
      pool.push(cid);
    }
    // Shuffle for variety
    for (var s = pool.length - 1; s > 0; s--) {
      var r = Math.floor(Math.random() * (s + 1));
      var tmp = pool[s];
      pool[s] = pool[r];
      pool[r] = tmp;
    }
    Game.state.pc.hardwareMarketOffers.ids = pool.slice(0, 4);
  },
  getHardwareMarketOffers: function () {
    Game.Shop.ensureHardwareMarketOffers();
    return Game.state.pc.hardwareMarketOffers.ids || [];
  },
  getMinerDeviceNameForLevel: function (type, level) {
    // Uses miners_data.js when available; falls back to generic.
    var lvl = typeof level === "number" ? level : 0;
    if (!window.MINERS || !Array.isArray(window.MINERS) || window.MINERS.length === 0) {
      return (type || "Device") + " L" + lvl;
    }
    var wanted = String(type || "").toUpperCase();
    var list = [];
    for (var i2 = 0; i2 < window.MINERS.length; i2++) {
      var m = window.MINERS[i2];
      if (m && String(m.type || "").toUpperCase() === wanted) list.push(m);
    }
    list.sort(function (a, b) { return (a.rank || 0) - (b.rank || 0); });
    if (list.length === 0) return (type || "Device") + " L" + lvl;
    var maxLevel = 6;
    var pct = Math.max(0, Math.min(1, (lvl) / (maxLevel + 1)));
    var idx = Math.floor(pct * list.length);
    if (idx < 0) idx = 0;
    if (idx >= list.length) idx = list.length - 1;
    return list[idx].name || ((type || "Device") + " L" + lvl);
  },
  buyOnline: function (id) {
    var items = Game.Shop.onlineItems;
    var found = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        found = items[i];
        break;
      }
    }
    if (!found) return;
    // Keep dynamic net item prices/names up to date (plan/router/NIC).
    if (Game.Shop && Game.Shop._refreshNetMarketItems) {
      Game.Shop._refreshNetMarketItems();
    }
    if (found.target.indexOf("cloud-") === 0) {
      var tier = found.target.split("-")[1];
      // Online purchases use the default hashrate and standard duration for the tier
      Game.Btc.buyCloudContract(tier, null, "standard");
      return;
    }
    // Validate upgrade applicability before charging.
    if (found.target && found.target.indexOf("pcminer-") === 0) {
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var p0 = Game.state.btc && Game.state.btc.pcMiner ? Game.state.btc.pcMiner : null;
      if (!p0) return;
      var parts0 = found.target.split("-");
      var kind0 = parts0[1] || "";
      var lvl0 = parseInt(parts0[2], 10);
      if (isNaN(lvl0)) lvl0 = 0;
      var map0 = { "case": "caseLevel", "fans": "fansLevel", "psu": "psuLevel", "cpu": "cpuLevel", "gpu": "gpuLevel", "software": "softwareLevel" };
      var key0 = map0[kind0];
      if (!key0) {
        Game.addNotification("Unsupported PC miner upgrade.");
        return;
      }
      var before0 = p0[key0] || 0;
      if (lvl0 <= before0) {
        Game.addNotification("Already installed: " + kind0.toUpperCase() + " L" + before0 + ".");
        return;
      }
      if (kind0 === "cpu" && Game.PC && Game.PC.getMaxCpuLevel && lvl0 > Game.PC.getMaxCpuLevel()) {
        Game.addNotification("Your motherboard can't support that CPU level.");
        return;
      }
      if (kind0 === "gpu" && Game.PC && Game.PC.getMaxGpuLevel && lvl0 > Game.PC.getMaxGpuLevel()) {
        Game.addNotification("Your motherboard can't support that GPU level.");
        return;
      }
      if (kind0 === "software" && Game.PC && Game.PC.getMaxCpuLevel && lvl0 > Game.PC.getMaxCpuLevel()) {
        Game.addNotification("Your motherboard can't support that miner software level.");
        return;
      }
    }
    if (found.target && found.target.indexOf("pc-ram-") === 0) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var rl = parseInt(found.target.split("-")[2], 10);
      if (isNaN(rl)) rl = 0;
      var maxRam = (Game.PC && Game.PC.getMaxRamLevel) ? Game.PC.getMaxRamLevel() : 4;
      var beforeRam = (Game.state.pc && typeof Game.state.pc.ramLevel === "number") ? Game.state.pc.ramLevel : 0;
      if (rl <= beforeRam) {
        Game.addNotification("Already installed: RAM L" + beforeRam + ".");
        return;
      }
      if (rl > maxRam) {
        Game.addNotification("Your motherboard can't support that much RAM.");
        return;
      }
    }
    if (found.target && found.target.indexOf("pc-storage-") === 0) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var sl = parseInt(found.target.split("-")[2], 10);
      if (isNaN(sl)) sl = 0;
      var beforeS = (Game.state.pc && typeof Game.state.pc.storageLevel === "number") ? Game.state.pc.storageLevel : 0;
      var maxS = (Game.PC && Game.PC.getMaxStorageLevel) ? Game.PC.getMaxStorageLevel() : 2;
      if (sl <= beforeS) {
        Game.addNotification("Already installed: Storage L" + beforeS + ".");
        return;
      }
      if (sl > maxS) {
        Game.addNotification("Your motherboard can't support that much storage.");
        return;
      }
    }
    if (found.target === "pc-mobo-1") {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var tier = (Game.state.pc && typeof Game.state.pc.motherboardTier === "number") ? Game.state.pc.motherboardTier : 0;
      if (tier >= 1) {
        Game.addNotification("Motherboard already upgraded.");
        return;
      }
    }
    if (found.target === "net-plan-upgrade") {
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      if (!(Game.Net && Game.Net.getNextPlanKbps && Game.Net.getNextPlanKbps())) {
        Game.addNotification("Your router can't support a faster plan yet.");
        return;
      }
    }
    // Legacy plan items (old saves/offers may still reference these targets).
    if (found.target && found.target.indexOf("net-plan-") === 0) {
      var kbpsLegacy0 = parseInt(found.target.split("-")[2], 10);
      if (isNaN(kbpsLegacy0) || kbpsLegacy0 <= 0) kbpsLegacy0 = 128;
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var lvlLegacy0 = Math.round(Math.log((kbpsLegacy0 / 128)) / Math.log(2));
      if (!isFinite(lvlLegacy0) || lvlLegacy0 < 0) lvlLegacy0 = 0;
      var maxLegacy0 = (Game.Net && Game.Net.getMaxPlanLevel) ? Game.Net.getMaxPlanLevel() : (2 + (Game.state.net.routerLevel || 0) * 2);
      if (lvlLegacy0 > maxLegacy0) {
        Game.addNotification("Your router can't support that plan yet.");
        return;
      }
    }
    if (found.target === "net-router-upgrade") {
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var curDay0 = Game.state.day || 1;
      if (typeof Game.state.net.routerBoughtDay === "number" && Game.state.net.routerBoughtDay === curDay0) {
        Game.addNotification("Router upgrade already purchased today.");
        return;
      }
      if ((Game.state.net.routerLevel || 0) >= 10) {
        Game.addNotification("Router already maxed out.");
        return;
      }
    }
    if (found.target === "net-nic-upgrade") {
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var maxNic = (Game.Net && Game.Net.getMaxNicLevel) ? Game.Net.getMaxNicLevel() : 3;
      if ((Game.state.net.nicLevel || 0) >= maxNic) {
        Game.addNotification("Your router can't support more NIC upgrades yet.");
        return;
      }
    }

    if (!Game.spendMoney(found.price, "Online purchase: " + found.name)) {
      Game.addNotification("Not enough money for online purchase.");
      return;
    }
    if (found.target && found.target.indexOf("pcminer-") === 0) {
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      var p = Game.state.btc && Game.state.btc.pcMiner ? Game.state.btc.pcMiner : null;
      if (!p) return;
      var parts = found.target.split("-");
      var kind = parts[1] || "";
      var lvl = parseInt(parts[2], 10);
      if (isNaN(lvl)) lvl = 0;
      var map = {
        "case": "caseLevel",
        "fans": "fansLevel",
        "psu": "psuLevel",
        "cpu": "cpuLevel",
        "gpu": "gpuLevel",
        "software": "softwareLevel"
      };
      var key = map[kind];
      if (!key) {
        Game.addNotification("Unsupported PC miner upgrade.");
        return;
      }
      var before = p[key] || 0;
      if (lvl <= before) {
        Game.addNotification("Already installed: " + kind.toUpperCase() + " L" + before + ".");
        return;
      }
      if (kind === "software") {
        if (typeof Game.state.btc.minerSoftwareLevel !== "number") Game.state.btc.minerSoftwareLevel = 0;
        if (lvl <= (Game.state.btc.minerSoftwareLevel || 0)) {
          Game.addNotification("Already installed: SOFTWARE L" + (Game.state.btc.minerSoftwareLevel || 0) + ".");
          return;
        }
        Game.state.btc.minerSoftwareLevel = lvl;
        p.softwareLevel = lvl;
      } else {
        p[key] = lvl;
      }
      if (kind === "cpu") {
        Game.addNotification("Installed CPU: " + Game.Shop.getMinerDeviceNameForLevel("CPU", lvl) + " (L" + lvl + ").");
      } else if (kind === "gpu") {
        Game.addNotification("Installed GPU: " + Game.Shop.getMinerDeviceNameForLevel("GPU", lvl) + " (L" + lvl + ").");
      } else if (kind === "software") {
        Game.addNotification("Installed Miner Software Suite L" + lvl + " (applies to PC Miner and Mining Rigs).");
      } else {
        Game.addNotification("Installed PC miner upgrade: " + kind.toUpperCase() + " L" + lvl + ".");
      }
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target === "pc-upgrade") {
      Game.state.stats.techSkill += 4;
      Game.addNotification("Your upgraded PC makes wallet sync slightly faster.");
      return;
    }
    if (found.target === "net-plan-upgrade") {
      var r = (Game.Net && Game.Net.upgradePlan) ? Game.Net.upgradePlan() : { ok: false, message: "Unable to upgrade plan." };
      Game.addNotification(r.message || (r.ok ? "Internet plan upgraded." : "Plan upgrade failed."));
      if (r.ok && Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    // Legacy plan items (old saves/offers may still reference these targets).
    if (found.target && found.target.indexOf("net-plan-") === 0) {
      var kbpsLegacy = parseInt(found.target.split("-")[2], 10);
      if (isNaN(kbpsLegacy) || kbpsLegacy <= 0) kbpsLegacy = 128;
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var lvlLegacy = Math.round(Math.log((kbpsLegacy / 128)) / Math.log(2));
      if (!isFinite(lvlLegacy) || lvlLegacy < 0) lvlLegacy = 0;
      Game.state.net.planLevel = lvlLegacy;
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      Game.addNotification("Internet plan updated.");
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target === "net-router-upgrade") {
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var rr = (Game.Net && Game.Net.upgradeRouter) ? Game.Net.upgradeRouter() : { ok: false, message: "Unable to upgrade router." };
      if (rr.ok) {
        Game.state.net.routerBoughtDay = Game.state.day || 1;
      }
      Game.addNotification(rr.message || (rr.ok ? "Router upgraded." : "Router upgrade failed."));
      if (rr.ok && Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target === "net-nic-upgrade") {
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      var nn = (Game.Net && Game.Net.upgradeNic) ? Game.Net.upgradeNic() : { ok: false, message: "Unable to upgrade network card." };
      Game.addNotification(nn.message || (nn.ok ? "Network card upgraded." : "Network card upgrade failed."));
      if (nn.ok && Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target === "pc-storage-50gb") {
      if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };
      if (typeof Game.state.pc.storageCapacityMb !== "number") Game.state.pc.storageCapacityMb = 20000;
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var maxCap = (Game.PC && Game.PC.getMaxStorageMb) ? Game.PC.getMaxStorageMb() : 120000;
      Game.state.pc.storageCapacityMb = Math.min(maxCap, Game.state.pc.storageCapacityMb + 50000);
      Game.addNotification("Storage upgraded. New capacity: " + Math.round(Game.state.pc.storageCapacityMb) + " MB.");
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target === "pc-mobo-1") {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      Game.state.pc.motherboardTier = 1;
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var defMb = (Game.PC && Game.PC.getMotherboardDef) ? Game.PC.getMotherboardDef() : null;
      Game.addNotification("Motherboard upgraded: " + (defMb ? defMb.name : "Tier 1") + ".");
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target && found.target.indexOf("pc-storage-") === 0) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var lvlS = parseInt(found.target.split("-")[2], 10);
      if (isNaN(lvlS)) lvlS = 0;
      var maxS2 = (Game.PC && Game.PC.getMaxStorageLevel) ? Game.PC.getMaxStorageLevel() : 2;
      if (lvlS > maxS2) {
        Game.addNotification("Your motherboard can't support that much storage.");
        return;
      }
      var beforeS2 = Game.state.pc.storageLevel || 0;
      if (lvlS <= beforeS2) {
        Game.addNotification("Already installed: Storage L" + beforeS2 + ".");
        return;
      }
      Game.state.pc.storageLevel = lvlS;
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      Game.addNotification("Storage upgraded (level " + Game.state.pc.storageLevel + ").");
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
    if (found.target && found.target.indexOf("pc-ram-") === 0) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var lvl = parseInt(found.target.split("-")[2], 10);
      if (isNaN(lvl)) lvl = 0;
      var maxRam = (Game.PC && Game.PC.getMaxRamLevel) ? Game.PC.getMaxRamLevel() : 4;
      if (lvl > maxRam) {
        Game.addNotification("Your motherboard can't support that much RAM.");
        return;
      }
      var before = Game.state.pc.ramLevel || 0;
      if (lvl <= before) {
        Game.addNotification("Already installed: RAM L" + before + ".");
        return;
      }
      Game.state.pc.ramLevel = lvl;
      var capMb = (Game.PC && Game.PC.getRamCapacityMb) ? Game.PC.getRamCapacityMb() : 0;
      Game.addNotification("RAM upgraded. New capacity: " + Math.round(capMb) + " MB.");
      if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      return;
    }
  },
  buyPhysical: function (id) {
    Game.Shop.ensureStock();
    var items = Game.Shop.physicalItems;
    var found = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        found = items[i];
        break;
      }
    }
    if (!found) return;
    if (Game.state.travelLocation !== found.location) {
      Game.addNotification("You must travel to " + found.location + " to buy this.");
      return;
    }
    var stock = Game.state.shopStock || {};
    var currentStock = typeof stock[found.id] === "number" ? stock[found.id] : 0;
    if (currentStock <= 0) {
      Game.addNotification("This item is out of stock at this shop.");
      return;
    }
    var price = found.price;
    if (Game.state.shopOffers && Game.state.shopOffers[found.location]) {
      var offers = Game.state.shopOffers[found.location];
      for (var j = 0; j < offers.length; j++) {
        if (offers[j].id === found.id) {
          price = offers[j].price;
          break;
        }
      }
    }
    if (!Game.spendMoney(price, "Purchased " + found.name)) {
      Game.addNotification("Not enough money for that purchase.");
      return;
    }
    stock[found.id] = currentStock - 1;
    if (found.id && found.id.indexOf("pc-ram-") === 0) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var normRam = found.id.replace(/-local$/i, "");
      var partsRam = normRam.split("-");
      var lvlRam = parseInt(partsRam[2], 10);
      if (isNaN(lvlRam)) lvlRam = 0;
      var maxRam = (Game.PC && Game.PC.getMaxRamLevel) ? Game.PC.getMaxRamLevel() : 4;
      if (lvlRam > maxRam) {
        Game.addNotification("Your motherboard can't support that much RAM.");
        return;
      }
      var beforeRam = Game.state.pc.ramLevel || 0;
      if (lvlRam > beforeRam) {
        Game.state.pc.ramLevel = lvlRam;
        var capMb = (Game.PC && Game.PC.getRamCapacityMb) ? Game.PC.getRamCapacityMb() : 0;
        Game.addNotification("RAM upgraded. New capacity: " + Math.round(capMb) + " MB.");
        if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
      } else {
        Game.addNotification("Already installed: RAM L" + beforeRam + ".");
      }
      return;
    }
    if (found.id && found.id.indexOf("pcminer-") === 0) {
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      var p = Game.state.btc && Game.state.btc.pcMiner ? Game.state.btc.pcMiner : null;
      if (p) {
        // local ids may have -local suffix; normalise to pcminer-<kind>-<level>
        var norm = found.id.replace(/-local$/i, "");
        var parts = norm.split("-");
        var kind = parts[1] || "";
        var lvl = parseInt(parts[2], 10);
        if (isNaN(lvl)) lvl = 0;
        var map = {
          "case": "caseLevel",
          "fans": "fansLevel",
          "psu": "psuLevel",
          "cpu": "cpuLevel",
          "gpu": "gpuLevel",
          "software": "softwareLevel"
        };
        var key = map[kind];
        if (key) {
          var before = p[key] || 0;
          if (lvl > before) {
            if (kind === "software") {
              if (typeof Game.state.btc.minerSoftwareLevel !== "number") Game.state.btc.minerSoftwareLevel = 0;
              if (lvl <= (Game.state.btc.minerSoftwareLevel || 0)) {
                Game.addNotification("Already installed: SOFTWARE L" + (Game.state.btc.minerSoftwareLevel || 0) + ".");
                return;
              }
              Game.state.btc.minerSoftwareLevel = lvl;
              p.softwareLevel = lvl;
            } else {
              p[key] = lvl;
            }
            if (kind === "cpu") {
              Game.addNotification("Installed CPU: " + Game.Shop.getMinerDeviceNameForLevel("CPU", lvl) + " (L" + lvl + ").");
            } else if (kind === "gpu") {
              Game.addNotification("Installed GPU: " + Game.Shop.getMinerDeviceNameForLevel("GPU", lvl) + " (L" + lvl + ").");
            } else if (kind === "software") {
              Game.addNotification("Installed Miner Software Suite L" + lvl + " (applies to PC Miner and Mining Rigs).");
            } else {
              Game.addNotification("Installed PC miner upgrade: " + kind.toUpperCase() + " L" + lvl + ".");
            }
            if (Game.Shop && Game.Shop.invalidateHardwareMarketOffers) Game.Shop.invalidateHardwareMarketOffers();
          } else {
            Game.addNotification("Already installed: " + kind.toUpperCase() + " L" + before + ".");
          }
          return;
        }
      }
    }
    Game.state.inventory.push({
      id: found.id,
      name: found.name,
      type: found.type,
      source: found.location
    });
    Game.addNotification("Bought " + found.name + " at " + found.location + ".");
  },
  buyMeal: function (mealId) {
    var meals = Game.Shop.meals;
    var mealDef = null;
    for (var i = 0; i < meals.length; i++) {
      if (meals[i].id === mealId) {
        mealDef = meals[i];
        break;
      }
    }
    if (!mealDef) return;
    var price = Game.Shop.getMealPrice(mealId);
    // Enforce storage cap via Game.Meals.addMeal
    Game.Meals.ensureState();
    if (!Game.Meals.addMeal(mealId, 1)) {
      return;
    }
    if (!Game.spendMoney(price, "Purchased " + mealDef.name)) {
      Game.addNotification("Not enough money for that meal.");
      // Roll back count if payment failed
      Game.Meals.ensureState();
      var counts = Game.state.meals.counts;
      if (counts && typeof counts[mealId] === "number") {
        counts[mealId] = Math.max(0, counts[mealId] - 1);
      }
      return;
    }
  },
  getItemDescription: function (id) {
    var descriptions = {
      "coal-shovel": "Quality shovel for manual ore work.",
      "health-snacks": "Healthy snack pack that reduces hunger when used.",
      "small-rig-kit": "Frame and parts to assemble a small BTC mining rig.",
      "drink-red-fang": "Energy drink: medium energy boost with a small health hit.",
      "drink-monster-byte": "Energy drink: big energy boost with a moderate health hit.",
      "drink-rock-blitz": "Energy drink: light energy boost with tiny health impact.",
      "drink-amp-core": "Energy drink: steady energy boost with small health impact.",
      "drink-thunderbolt": "Energy drink: strong energy boost with noticeable health cost.",
      "drink-vyper-volt": "Energy drink: modest energy boost with small health cost.",
      "drink-nitro-roar": "Energy drink: maximum energy boost with the largest health cost.",
      "pcminer-case-1": "Improved airflow case for PC mining. Increases cooling headroom.",
      "pcminer-case-2": "High-airflow case for PC mining. Better cooling headroom.",
      "pcminer-fans-1": "Extra case fans for PC mining. Improves cooling under load.",
      "pcminer-fans-2": "High static-pressure fans for PC mining. Much better cooling.",
      "pcminer-psu-1": "Upgraded PSU so your PC can sustain higher mining power draw.",
      "pcminer-psu-2": "Higher-capacity PSU for more stable mining.",
      "pcminer-psu-3": "High-capacity PSU for demanding mining hardware.",
      "pcminer-cpu-1": "CPU upgrade for mining workloads (small hashrate boost).",
      "pcminer-cpu-2": "Better CPU for mining workloads (medium hashrate boost).",
      "pcminer-case-3": "High-airflow enthusiast case. Better cooling headroom.",
      "pcminer-fans-3": "Premium fan pack. Much better cooling under load.",
      "pcminer-gpu-1": "GPU upgrade for mining workloads (large hashrate boost).",
      "pcminer-gpu-2": "Better GPU for mining workloads (bigger hashrate boost).",
      "pcminer-software-1": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "pcminer-software-2": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "pcminer-cpu-3": "Higher-tier mining CPU upgrade (requires compatible motherboard).",
      "pcminer-cpu-4": "Top-tier mining CPU upgrade (requires compatible motherboard).",
      "pcminer-cpu-5": "Enthusiast mining CPU upgrade (rare motherboard required).",
      "pcminer-cpu-6": "Extreme mining CPU upgrade (rare motherboard required).",
      "pcminer-gpu-3": "Higher-tier mining GPU upgrade (requires compatible motherboard).",
      "pcminer-gpu-4": "Top-tier mining GPU upgrade (requires compatible motherboard).",
      "pcminer-gpu-5": "Enthusiast mining GPU upgrade (rare motherboard required).",
      "pcminer-gpu-6": "Extreme mining GPU upgrade (rare motherboard required).",
      "pcminer-software-3": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "pcminer-software-4": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "pcminer-software-5": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "pcminer-software-6": "Miner software suite (applies to both PC Miner and physical Mining Rigs).",
      "net-plan-upgrade": "Network Cabling upgrade. Improves your internet plan speed (affects downloads and wallet sync).",
      "net-router-upgrade": "Router upgrade kit. Unlocks more Network Cabling upgrades (available only on some days).",
      "net-nic-upgrade": "Network card upgrade. Slightly improves effective throughput (router-dependent).",
      "pc-ram-1": "Add more RAM to your PC. Helps it handle heavier software and background processes.",
      "pc-ram-2": "More RAM for demanding workloads. Requires motherboard support.",
      "pc-ram-3": "Large RAM kit. Requires motherboard support.",
      "pc-ram-4": "High-capacity RAM kit. Requires motherboard support.",
      "pc-ram-5": "Enthusiast RAM kit. Rare motherboards only.",
      "pc-ram-6": "Extreme RAM kit. Rare motherboards only.",
      "pc-ram-1-local": "Local RAM kit. Same as online L1, but bought in-person.",
      "pc-ram-2-local": "Local RAM kit. Same as online L2, but bought in-person.",
      "pcminer-fans-1-local": "Local fans pack. Same as online L1, but bought in-person.",
      "pcminer-psu-1-local": "Local PSU upgrade. Same as online L1, but bought in-person.",
      "pcminer-gpu-1-local": "Local GPU upgrade. Same as online L1, but bought in-person.",
      "pcminer-software-1-local": "Miner software on USB. Install to improve mining efficiency."
    };
    return descriptions[id] || "Physical item that can be bought in shops.";
  }
};
