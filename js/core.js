window.Game = {};

Game.stateTemplate = {
  version: "1.0.0-full",
  player: {
    name: "",
    homePlaceId: "",
    currentPlaceId: ""
  },
  prestige: {
    points: 0,
    totalPrestiges: 0,
    targetScore: 1000,
    lastPrestigeScore: 0,
    lastPrestigePointsEarned: 0,
    upgrades: {}
  },
  prestigeRun: {
    eduJobRunsById: {},
    eduCourseRunsById: {},
    eduRunsTotal: 0
  },
  money: 50,
  taxPoolUsd: 0,
  btcBalance: 0,
  unconfirmedBtc: 0,
  day: 1,
  timeMinutes: 8 * 60,
  health: 100,
  energy: 100,
  hunger: 0,
  sleeping: false,
  ukTravel: {
    inProgress: false,
    fromPlaceId: "",
    toPlaceId: "",
    stops: [],
    legIndex: 0,
    trail: "",
    remainingMinutes: 0,
    totalMinutes: 0,
    notifyStage: 0
  },
  education: {
    level: 0,
    xp: 0
  },
  stats: {
    trainSkill: 0,
    businessSkill: 0,
    techSkill: 0
  },
  debug: {
    unlocked: false,
    tickRateMult: 1,
    btcMiningMultiplier: 1
  },
  music: {
    enabled: true,
    trackIndex: 0,
    volume: 0.25
  },
  job: {
    current: "none",
    xp: 0,
    level: 0,
    isWorking: false,
    shiftMinutes: 0,
    pendingWages: 0,
    pendingApplication: null,
    pendingOffer: null,
    rejections: [],
    hidden: {},
    levels: {
      barista: { level: 0, xp: 0 },
      office: { level: 0, xp: 0 },
      trainDriver: { level: 0, xp: 0 }
    }
  },
  trainJob: {
    coal: 60,
    pressure: 40,
    speed: 40,
    throttle: 40,
    coalFeed: 1,
    isOnShift: false,
    safetyStrikes: 0
  },
  school: {
    enrolled: false,
    course: null,
    progress: 0,
    maxProgress: 100,
    xpEarnedThisCourse: 0,
    queue: []
  },
  properties: [],
  tenants: [],
  housing: {
    homeId: "starter-room",
    status: "rent", // rent | own
    rentPerDay: 0,
    maintenance: 100
  },
  homeOffers: [],
  propertyTenantCandidates: {},
  propertyRepairPricing: {
    weekStartDay: 1,
    multiplier: 1.0
  },
  companies: {
    railLogistics: {
      unlocked: false,
      level: 0,
      reputation: 0,
      activeContract: null,
      contractProgress: 0
    },
    miningCorp: {
      unlocked: false,
      level: 0,
      oreStock: 0,
      activeRunMinutes: 0,
      activeRunTotal: 0,
      funds: 0,
      mines: [],
      oreDetail: {
        iron: 0,
        copper: 0,
        silver: 0,
        gold: 0
      },
      staffPerMine: {},
      machinesPerMine: {},
      daysUntilPayroll: 7
    },
    retailShop: {
      unlocked: false,
      level: 0,
      stock: 0,
      popularity: 0,
      funds: 0,
      autoPayoutToWallet: false,
      pendingDeliveries: [],
      salesSchedule: null,
      inventoryValue: 0,
      stats: {
        todayUnits: 0,
        todayRevenue: 0,
        todayCost: 0,
        yesterdayUnits: 0,
        yesterdayRevenue: 0,
        yesterdayCost: 0
      }
    },
    netCafe: {
      unlocked: false,
      level: 0,
      funds: 0,
      seats: 0
    },
    courierCo: {
      unlocked: false,
      level: 0,
      funds: 0,
      vans: 0,
      drivers: 0
    },
    recyclingCo: {
      unlocked: false,
      level: 0,
      funds: 0,
      scrapKg: 0
    }
  },
  btc: {
    minerSoftwareLevel: 0,
    wallet: {
      isOpen: false,
      isInstalled: false,
      isSyncing: false,
      syncProgress: 0,
      chainHeight: 0,
      targetHeight: 0,
      lastSyncDay: 0,
      clientSizeMb: 65,
      blockSizeMb: 0.5,
      blockSizeMaxMb: 1.6,
      chainStorageMb: 0,
      syncDownloadId: null
    },
    chain: {
      baseHeight: 100,
      height: 100,
      clickCount: 0
    },
    pendingCredits: [],
    pcMiner: {
      isOn: false,
      caseLevel: 0,
      fansLevel: 0,
      psuLevel: 0,
      cpuLevel: 0,
      gpuLevel: 0,
      softwareLevel: 0,
      heat: 20,
      lastPowerCostPerDay: 0,
      lastHashrate: 0
    },
    mining: {
      rigsOwned: 0,
      rigHashrate: 5,
      powerCostPerDay: 20,
      isPowerOn: false
    },
    cloud: {
      contracts: []
    },
    history: {
      byDay: [],
      currentDayEarned: 0
    },
    exchange: {
      priceUsd: 30000,
      buyOrders: [],   // bids: want to buy BTC below price
      sellOrders: [],  // asks: want to sell BTC above price
      priceHistory: [], // snapshots of price by in-game hour
      nextNpcTradeKey: 0
    }
  },
  crypto: {
    coins: {
      // Additional currencies live here. BTC remains in top-level fields for legacy UI/logic.
      LTC: {
        balance: 0,
        unconfirmed: 0,
        wallet: { isInstalled: false, clientSizeMb: 420 },
        miner: { isInstalled: false, clientSizeMb: 180 },
        exchange: { priceUsd: 120, priceHistory: [] }
      },
      DOGE: {
        balance: 0,
        unconfirmed: 0,
        wallet: { isInstalled: false, clientSizeMb: 260 },
        miner: { isInstalled: false, clientSizeMb: 140 },
        exchange: { priceUsd: 0.15, priceHistory: [] }
      },
      SOL: {
        balance: 0,
        unconfirmed: 0,
        wallet: { isInstalled: false, clientSizeMb: 520 },
        miner: { isInstalled: false, clientSizeMb: 0 },
        exchange: { priceUsd: 95, priceHistory: [] }
      },
      MATIC: {
        balance: 0,
        unconfirmed: 0,
        wallet: { isInstalled: false, clientSizeMb: 380 },
        miner: { isInstalled: false, clientSizeMb: 0 },
        exchange: { priceUsd: 0.85, priceHistory: [] }
      },
      USDT: {
        balance: 0,
        unconfirmed: 0,
        wallet: { isInstalled: false, clientSizeMb: 120 },
        miner: { isInstalled: false, clientSizeMb: 0 },
        exchange: { priceUsd: 1.0, priceHistory: [] }
      }
    }
  },
  pc: {
    isOpen: false,
    activeApp: "desktop",
    motherboardTier: 0,
    ramLevel: 0,
    storageLevel: 0,
    storageCapacityMb: 20000,
    storageUsedMb: 2500,
    filesCount: 0,
    systemLogFiles: 0,
    systemLogsMb: 0,
    eventLogFiles: 0,
    eventLogMb: 0,
    browserCacheMb: 0,
    tempFilesMb: 0,
    cleanerInstalled: false,
    downloads: [],
    hardwareMarketOffers: { day: 0, ids: [] },
    antivirus: { level: 1, isOn: true, isScanning: false, scanProgress: 0, cpuPct: 1, ramMb: 220, lastUpdateDay: 0, pendingUpdate: false, updateProgress: 0, updateDownloadId: null, filesScanned: 0, threatsDetected: 0 }
  },
  net: {
    currentMbps: 0,
    planKbps: 128,
    planLevel: 0,
    routerLevel: 0,
    nicLevel: 0,
    routerBoughtDay: 0
  },
  casino: {
    uiPage: "lobby", // lobby | slots | blackjack | plinko | shop
    balanceUsd: 0,
    fundsSource: "wallet", // casino | wallet
    totalDepositedUsd: 0,
    totalWithdrawnUsd: 0,
    slots: {
      ownedMachines: 0,
      // Player-facing slots game mode. Owned machine operations live under `slots.machines`.
      mode: "house", // house
      lastBet: 10,
      lastReels: ["cherry", "lemon", "star"],
      lastPayout: 0,
      lastJackpot: 0,
      lastNet: 0,
      predictability: "balanced", // smooth | balanced | spiky
      lossStreak: 0,
      freeSpins: 0,
      freeSpinsClaimDay: 0,
      dailySpinDay: 0,
      dailySpinCount: 0,
      dailySpinGoal1Claimed: false,
      dailySpinGoal2Claimed: false,
      lastWasFreeSpin: false,
      lastWinChancePct: 0,
      lastRtpPct: 0,
      pendingSpin: null,
      // Owned slot machines (business)
      machines: [],
      owner: {
        baseRtp: 0.92,
        confidence: 0.15,
        schedule: null,
        processed: {},
        lastTickDay: 0,
        lastTickMinute: 0
      }
    },
    blackjack: {
      lastBet: 25,
      round: null
    },
    plinko: {
      risk: "medium", // low | medium | high
      lastBet: 10,
      lastBin: 5,
      lastMultiplier: 0,
      lastNet: 0,
      lastPath: [],
      lastPayout: 0
    }
  },
  inventory: [
    { id: "phone", name: "Smartphone", source: "start", type: "device" }
  ],
  meals: {
    counts: { breakfast: 0, lunch: 0, dinner: 0 },
    consumed: { breakfast: false, lunch: false, dinner: false }
  },
  travelLocation: "Home",
  travel: {
    inProgress: false,
    from: null,
    to: null,
    remainingMinutes: 0,
    totalMinutes: 0
  },
  bank: {
    loanPrincipal: 0,
    loanOriginal: 0,
    dailyInterestRate: 0,
    maxLoan: 1000,
    creditScore: 600,
    creditInquiries: 0,
    goodPaymentDays: 0,
    missedPaymentDays: 0,
    pendingOffer: null,
    depositBalance: 0,
    depositHistory: [],
    payLoanFromDeposits: false,
    depositInterestToBank: true,
    depositInterestScheduleDay: 0,
    depositInterestScheduledMinute: 0,
    depositInterestBaseBalance: 0,
    depositInterestPaidDay: 0,
    depositInterestLastAmount: 0,
    depositInterestLastDay: 0,
    depositInterestLastMinute: 0
  },
  notifications: [],
  notificationLog: [],
  notificationToastSeconds: 10,
  desktopNotifications: {
    prompted: false,
    enabled: false
  },
  ui: {
    introSeen: {},
    introDisabled: false
  },
  redeemedCodes: [],
  quests: { claimed: {} },
  shopOffers: {},
  shopStock: {},
  shopRestock: { lastDay: 1, lastMinute: 0 },
  jobOffers: {}
};

Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));

Game.dailyHandlers = [];

Game.isSleeping = function () {
  return !!(Game.state && Game.state.sleeping);
};

Game.isTraveling = function () {
  var s = Game.state || {};
  return !!((s.travel && s.travel.inProgress) || (s.ukTravel && s.ukTravel.inProgress));
};

Game.blockIfSleeping = function (actionLabel) {
  if (!Game.isSleeping()) return false;
  Game.addNotification("Action blocked: you are sleeping. Wake up to " + (actionLabel || "do that") + ".");
  return true;
};

Game.startSleeping = function () {
  if (Game.isSleeping()) {
    Game.addNotification("You are already sleeping.");
    return false;
  }
  if (Game.state.travelLocation !== "Home") {
    Game.addNotification("You need to be at Home to sleep.");
    return false;
  }
  if (Game.isTraveling()) {
    Game.addNotification("Finish travelling before sleeping.");
    return false;
  }
  if (Game.state.job && Game.state.job.isWorking) {
    Game.addNotification("Finish your work shift before sleeping.");
    return false;
  }
  if (Game.state.school && Game.state.school.enrolled) {
    Game.addNotification("Finish your current course before sleeping.");
    return false;
  }
  var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
  if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
  if ((Game.state.energy || 0) >= maxEnergy - 0.00001) {
    Game.addNotification("You are already fully rested.");
    return false;
  }

  // If time is paused/slowed via the debug tick multiplier, sleeping can appear "stuck".
  // Only adjust tick rate if we actually start sleeping, and restore it on wake.
  if (Game.state && Game.state.debug && typeof Game.state.debug.tickRateMult !== "undefined") {
    var tickMult = parseFloat(Game.state.debug.tickRateMult);
    if (!isFinite(tickMult)) tickMult = 1;
    if (tickMult < 1) {
      Game.state.debug._tickRateBeforeSleep = tickMult;
      Game.state.debug.tickRateMult = 1;
      Game.addNotification(tickMult <= 0 ? "Time was paused. Unpaused to allow sleeping." : "Time was slowed. Reset to x1 while sleeping.");
    }
  }
  Game.state.sleeping = true;
  var etaMin = (typeof Game.getSleepEtaMinutes === "function") ? Game.getSleepEtaMinutes() : 0;
  if (typeof etaMin !== "number" || !isFinite(etaMin) || etaMin < 0) etaMin = 0;
  var hh = Math.floor(etaMin / 60);
  var mm = Math.floor(etaMin % 60);
  var etaStr = hh + ":" + (mm < 10 ? "0" + mm : mm);
  var mult = (typeof Game.getSleepTimeMultiplier === "function") ? Game.getSleepTimeMultiplier(true) : 10;
  if (typeof mult !== "number" || !isFinite(mult) || mult < 1) mult = 10;
  Game.addNotification("You fall asleep. (" + Math.round(mult) + "x time, ETA " + etaStr + ")");
  return true;
};

Game.stopSleeping = function (reason) {
  if (!Game.isSleeping()) return false;
  Game.state.sleeping = false;
  if (Game.state && Game.state.debug && typeof Game.state.debug._tickRateBeforeSleep !== "undefined") {
    var prev = parseFloat(Game.state.debug._tickRateBeforeSleep);
    delete Game.state.debug._tickRateBeforeSleep;
    if (isFinite(prev)) {
      if (prev < 0) prev = 0;
      if (prev > 50) prev = 50;
      Game.state.debug.tickRateMult = prev;
    }
  }
  Game.addNotification(reason || "You wake up.");
  return true;
};

// Returns the in-game time multiplier while sleeping.
// Uses the same "Home" recovery bonus concept as energy regen (2x at Home).
Game.getSleepTimeMultiplier = function (assumeSleeping) {
  var sleeping = !!assumeSleeping || Game.isSleeping();
  if (!sleeping) return 1;
  var loc = (Game.state && typeof Game.state.travelLocation === "string") ? Game.state.travelLocation : "";
  var locationMult = (loc === "Home") ? 2 : 1;
  // Base sleep fast-forward is 5x; Home bonus makes it 10x.
  var mult = 5 * locationMult;
  if (typeof mult !== "number" || !isFinite(mult) || mult < 1) mult = 1;
  if (mult > 30) mult = 30;
  return mult;
};

// Estimated in-game minutes until energy is full while sleeping.
Game.getSleepEtaMinutes = function () {
  var s = Game.state || {};
  var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
  if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
  var energy = typeof s.energy === "number" && isFinite(s.energy) ? s.energy : 0;
  if (energy < 0) energy = 0;
  if (energy >= maxEnergy - 0.00001) return 0;

  // Mirror the energy regen rules in Game.Health.tick().
  var baseRate = 0.05;
  var locMult = (s.travelLocation === "Home") ? 2 : 1;
  var normalRate = baseRate * locMult;
  var lowRate = normalRate * 10; // safety net when energy < 20
  if (!isFinite(normalRate) || normalRate <= 0) normalRate = 0.05;
  if (!isFinite(lowRate) || lowRate <= 0) lowRate = normalRate;

  var minutes = 0;
  if (energy < 20) {
    var target = Math.min(20, maxEnergy);
    var delta = Math.max(0, target - energy);
    minutes += delta / lowRate;
    energy += delta;
  }
  var remaining = Math.max(0, maxEnergy - energy);
  minutes += remaining / normalRate;
  if (!isFinite(minutes) || minutes < 0) minutes = 0;
  return Math.ceil(minutes);
};

Game.PCStorage = {
  ensure: function () {
    if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };
    if (typeof Game.state.pc.storageCapacityMb !== "number") Game.state.pc.storageCapacityMb = 20000;
    if (typeof Game.state.pc.storageUsedMb !== "number") Game.state.pc.storageUsedMb = 0;
    if (Game.state.pc.storageCapacityMb < 0) Game.state.pc.storageCapacityMb = 0;
    if (Game.state.pc.storageUsedMb < 0) Game.state.pc.storageUsedMb = 0;
  },
  getCapacityMb: function () {
    Game.PCStorage.ensure();
    return Game.state.pc.storageCapacityMb;
  },
  getUsedMb: function () {
    Game.PCStorage.ensure();
    return Game.state.pc.storageUsedMb;
  },
  getFreeMb: function () {
    Game.PCStorage.ensure();
    return Math.max(0, Game.state.pc.storageCapacityMb - Game.state.pc.storageUsedMb);
  },
  canWriteMb: function (mb) {
    if (typeof mb !== "number" || mb <= 0) return true;
    return Game.PCStorage.getFreeMb() >= mb;
  },
  writeMb: function (mb) {
    Game.PCStorage.ensure();
    if (typeof mb !== "number" || mb <= 0) return;
    Game.state.pc.storageUsedMb += mb;
    var cap = Game.PCStorage.getCapacityMb();
    if (Game.state.pc.storageUsedMb > cap) Game.state.pc.storageUsedMb = cap;
  },
  freeMb: function (mb) {
    Game.PCStorage.ensure();
    if (typeof mb !== "number" || mb <= 0) return;
    Game.state.pc.storageUsedMb -= mb;
    if (Game.state.pc.storageUsedMb < 0) Game.state.pc.storageUsedMb = 0;
  }
};

Game.Net = {
  ensure: function () {
    if (!Game.state.net || typeof Game.state.net !== "object") {
      Game.state.net = { currentMbps: 0, planKbps: 128, planLevel: 0, routerLevel: 0, nicLevel: 0, routerBoughtDay: 0 };
    }
    if (typeof Game.state.net.currentMbps !== "number") Game.state.net.currentMbps = 0;
    if (typeof Game.state.net.planKbps !== "number" || Game.state.net.planKbps <= 0) Game.state.net.planKbps = 128;
    if (typeof Game.state.net.planLevel !== "number" || Game.state.net.planLevel < 0) {
      // Migrate legacy planKbps values into a doubling-based tier system.
      var kbps = Game.state.net.planKbps || 128;
      if (kbps < 128) kbps = 128;
      var lvl = Math.floor(Math.log(kbps / 128) / Math.log(2));
      if (!isFinite(lvl) || lvl < 0) lvl = 0;
      Game.state.net.planLevel = lvl;
    }
    if (typeof Game.state.net.routerLevel !== "number" || Game.state.net.routerLevel < 0) Game.state.net.routerLevel = 0;
    if (typeof Game.state.net.nicLevel !== "number" || Game.state.net.nicLevel < 0) Game.state.net.nicLevel = 0;
    if (typeof Game.state.net.routerBoughtDay !== "number" || Game.state.net.routerBoughtDay < 0) Game.state.net.routerBoughtDay = 0;

    // Clamp router level (hard cap 10).
    if (Game.state.net.routerLevel > 10) Game.state.net.routerLevel = 10;

    // Router unlocks higher plan tiers: base 2 upgrades, then +2 per router upgrade.
    // Each router upgrade allows 5 more "Network Cabling" upgrades.
    var maxPlan = 5 + (Game.state.net.routerLevel || 0) * 5;
    if (!isFinite(maxPlan) || maxPlan < 0) maxPlan = 0;
    if (Game.state.net.planLevel > maxPlan) Game.state.net.planLevel = maxPlan;

    // Plan speed is derived from planLevel and doubles each upgrade, starting at 128 Kbps.
    var wantedPlan = 128 * Math.pow(2, Game.state.net.planLevel || 0);
    if (!isFinite(wantedPlan) || wantedPlan < 128) wantedPlan = 128;
    Game.state.net.planKbps = Math.round(wantedPlan);

    // NIC upgrades are capped by router: base 2 upgrades, then +2 per router upgrade.
    var maxNic = 2 + (Game.state.net.routerLevel || 0) * 2;
    if (!isFinite(maxNic) || maxNic < 0) maxNic = 0;
    if (Game.state.net.nicLevel > maxNic) Game.state.net.nicLevel = maxNic;
  },
  getMaxPlanLevel: function () {
    Game.Net.ensure();
    return 5 + (Game.state.net.routerLevel || 0) * 5;
  },
  getMaxNicLevel: function () {
    Game.Net.ensure();
    return 2 + (Game.state.net.routerLevel || 0) * 2;
  },
  getPlanLevel: function () {
    Game.Net.ensure();
    return Game.state.net.planLevel || 0;
  },
  getPlanKbps: function () {
    Game.Net.ensure();
    return Game.state.net.planKbps;
  },
  getNextPlanKbps: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.planLevel || 0;
    var max = Game.Net.getMaxPlanLevel();
    if (lvl >= max) return null;
    return Math.round(128 * Math.pow(2, lvl + 1));
  },
  getPlanUpgradePrice: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.planLevel || 0;
    // Each plan upgrade more than doubles in price.
    return Math.round(35 * Math.pow(2.2, lvl));
  },
  getRouterUpgradePrice: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.routerLevel || 0;
    return Math.round(140 * Math.pow(2.15, lvl));
  },
  getNicUpgradePrice: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.nicLevel || 0;
    return Math.round(90 * Math.pow(2.12, lvl));
  },
  upgradePlan: function () {
    Game.Net.ensure();
    var next = Game.Net.getNextPlanKbps();
    if (!next) return { ok: false, message: "Your router can't support a faster plan yet." };
    Game.state.net.planLevel += 1;
    Game.state.net.planKbps = next;
    return { ok: true, message: "Internet plan updated: " + next + " Kbps." };
  },
  upgradeRouter: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.routerLevel || 0;
    if (lvl >= 10) return { ok: false, message: "Router already maxed out." };
    Game.state.net.routerLevel = lvl + 1;
    return { ok: true, message: "Router upgraded (level " + Game.state.net.routerLevel + ")." };
  },
  upgradeNic: function () {
    Game.Net.ensure();
    var lvl = Game.state.net.nicLevel || 0;
    var max = Game.Net.getMaxNicLevel();
    if (lvl >= max) return { ok: false, message: "Your router can't support more NIC upgrades yet." };
    Game.state.net.nicLevel = lvl + 1;
    return { ok: true, message: "Network card upgraded (level " + Game.state.net.nicLevel + ")." };
  },
  getEffectiveMbps: function () {
    Game.Net.ensure();
    var baseMbps = (Game.state.net.planKbps || 128) / 1000;
    var routerMult = 1 + (Game.state.net.routerLevel || 0) * 0.20;
    var nicMult = 1 + (Game.state.net.nicLevel || 0) * 0.08;
    return Math.max(0.01, baseMbps * routerMult * nicMult);
  },
  sampleCurrentMbps: function () {
    var eff = Game.Net.getEffectiveMbps();
    // Keep internet speed relatively stable (small jitter + rare dips), and smooth changes over time.
    var prev = (Game.state && Game.state.net && typeof Game.state.net.currentMbps === "number") ? Game.state.net.currentMbps : eff;
    if (!isFinite(prev) || prev <= 0) prev = eff;

    // Aim to stay close to the effective (max) speed.
    var target = eff * (0.97 + Math.random() * 0.03); // ~0.97x .. 1.00x
    if (Math.random() < 0.008) target = eff * (0.85 + Math.random() * 0.08); // rare dip
    if (Math.random() < 0.0015) target = eff * (0.65 + Math.random() * 0.10); // very rare hard dip

    var alpha = 0.22; // smoothing factor (higher = faster response)
    var v = prev + (target - prev) * alpha;
    if (v > eff) v = eff;
    if (v < eff * 0.50) v = eff * 0.50;
    return Math.max(0.01, v);
  }
};

Game.Downloads = {
  _ensureFileSim: function (d) {
    if (!d || d.kind === "btc_chain_sync") return;
    if (typeof d._ageSec !== "number" || !isFinite(d._ageSec) || d._ageSec < 0) d._ageSec = 0;
    if (typeof d._rampSec !== "number" || !isFinite(d._rampSec) || d._rampSec <= 0) d._rampSec = 2 + Math.random() * 6; // 2..8s
    if (typeof d._jitterAmp !== "number" || !isFinite(d._jitterAmp) || d._jitterAmp < 0) d._jitterAmp = 0.08 + Math.random() * 0.10; // ~8..18%
    if (typeof d._capMbps !== "number" || !isFinite(d._capMbps) || d._capMbps <= 0) {
      var sizeMb = typeof d.totalMb === "number" && isFinite(d.totalMb) ? d.totalMb : 1;
      var kind = String(d.kind || "");
      var base = 12 + Math.random() * 28; // 12..40 Mbps baseline server cap
      if (sizeMb >= 1000) base = 25 + Math.random() * 70; // large downloads tend to be hosted better
      if (kind.indexOf("crypto_wallet") !== -1) base = 8 + Math.random() * 22;
      if (kind.indexOf("crypto_miner") !== -1) base = 6 + Math.random() * 18;
      if (kind.indexOf("pc_tool") !== -1) base = 10 + Math.random() * 35;
      d._capMbps = base;
    }
    if (typeof d._smoothMbps !== "number" || !isFinite(d._smoothMbps) || d._smoothMbps < 0) d._smoothMbps = 0;
    if (typeof d._dipUntilSec !== "number" || !isFinite(d._dipUntilSec) || d._dipUntilSec < 0) d._dipUntilSec = 0;
    if (typeof d._dipFactor !== "number" || !isFinite(d._dipFactor) || d._dipFactor <= 0 || d._dipFactor > 1) d._dipFactor = 1;
  },
  ensureState: function () {
    Game.Net.ensure();
    if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };
    if (!Array.isArray(Game.state.pc.downloads)) Game.state.pc.downloads = [];
    Game.PCStorage.ensure();
  },
  getActive: function () {
    Game.Downloads.ensureState();
    var list = Game.state.pc.downloads;
    var active = [];
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (d && d.status === "downloading") active.push(d);
    }
    return active;
  },
  getById: function (id) {
    Game.Downloads.ensureState();
    var list = Game.state.pc.downloads;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  },
  randomNetMbps: function () {
    return Game.Net.sampleCurrentMbps();
  },
  startFileDownload: function (opts) {
    Game.Downloads.ensureState();
    if (!opts || !opts.id) return null;
    var existing = Game.Downloads.getById(opts.id);
    if (existing) return existing;
    var sizeMb = typeof opts.sizeMb === "number" && opts.sizeMb > 0 ? opts.sizeMb : 1;
    if (Game.PCStorage.getFreeMb() < sizeMb) {
      Game.addNotification("Not enough disk space to start that download (" + Math.round(sizeMb) + " MB required).");
      return null;
    }
    var d = {
      id: opts.id,
      kind: opts.kind || "file",
      name: opts.name || opts.id,
      status: "downloading",
      minimized: !!opts.minimized,
      createdAtDay: Game.state.day,
      totalMb: sizeMb,
      downloadedMb: 0,
      writtenMb: 0,
      speedMbps: 0
    };
    Game.Downloads._ensureFileSim(d);
    if (opts.coinId) d.coinId = opts.coinId;
    Game.state.pc.downloads.push(d);
    return d;
  },
  startChainSync: function (opts) {
    Game.Downloads.ensureState();
    if (!opts || !opts.id) return null;
    var existing = Game.Downloads.getById(opts.id);
    if (existing) return existing;
    var totalBlocks = typeof opts.totalBlocks === "number" && opts.totalBlocks > 0 ? Math.floor(opts.totalBlocks) : 1;
    var blockSizeMb = typeof opts.blockSizeMb === "number" && opts.blockSizeMb > 0 ? opts.blockSizeMb : 0.5;
    var blockSizeMaxMb = typeof opts.blockSizeMaxMb === "number" && opts.blockSizeMaxMb > 0 ? opts.blockSizeMaxMb : Math.max(blockSizeMb, 1.5);
    var d = {
      id: opts.id,
      kind: "btc_chain_sync",
      name: opts.name || "BTC blockchain sync",
      status: "downloading",
      minimized: !!opts.minimized,
      createdAtDay: Game.state.day,
      startHeight: typeof opts.startHeight === "number" ? Math.floor(opts.startHeight) : 0,
      targetHeight: typeof opts.targetHeight === "number" ? Math.floor(opts.targetHeight) : totalBlocks,
      totalBlocks: totalBlocks,
      syncedBlocks: 0,
      blockSizeMb: blockSizeMb,
      blockSizeMaxMb: blockSizeMaxMb,
      currentBlockSizeMb: null,
      bufferMb: 0,
      writtenMb: 0,
      speedMbps: 0
    };
    Game.state.pc.downloads.push(d);
    return d;
  },
  minimize: function (id) {
    var d = Game.Downloads.getById(id);
    if (!d) return;
    d.minimized = true;
  },
  remove: function (id) {
    Game.Downloads.ensureState();
    var list = Game.state.pc.downloads;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) {
        // Only remove temp files when explicitly told; default keeps storage used.
        list.splice(i, 1);
        return;
      }
    }
  },
  cancel: function (id) {
    Game.Downloads.ensureState();
    if (!id) return;
    var list = Game.state.pc.downloads;
    for (var i = 0; i < list.length; i++) {
      var d = list[i];
      if (!d || d.id !== id) continue;

      // For most downloads, cancel frees partial disk usage.
      // For chain sync, downloaded blocks should remain on disk and in wallet progress.
      var isChain = d.kind === "btc_chain_sync";
      if (!isChain) {
        var written = typeof d.writtenMb === "number" ? d.writtenMb : 0;
        if (written > 0 && Game.PCStorage && Game.PCStorage.freeMb) {
          Game.PCStorage.freeMb(written);
        }
      }

      list.splice(i, 1);

      // If this was the active wallet sync, stop syncing but keep progress/target.
      if (isChain && Game.state && Game.state.btc && Game.state.btc.wallet) {
        var w = Game.state.btc.wallet;
        if (w.syncDownloadId === id) {
          w.syncDownloadId = null;
          w.isSyncing = false;
        }
      }

      Game.addNotification("Cancelled download: " + (d.name || d.id));
      return;
    }
  },
  tick: function (seconds) {
    Game.Downloads.ensureState();
    if (typeof seconds !== "number" || seconds <= 0) return;
    // Update network speed once per tick, shared across downloads and wallet sync.
    Game.state.net.currentMbps = Game.Downloads.randomNetMbps();

    var active = Game.Downloads.getActive();
    if (active.length === 0) return;

    var netMbps = Game.state.net.currentMbps;
    var perMbps = netMbps / active.length;

    // Disk factor: downloads slow down as disk fills, but keep them closer to full speed.
    var cap = Game.PCStorage.getCapacityMb() || 1;
    var free = Game.PCStorage.getFreeMb();
    var freeRatio = free / cap;
    var diskFactor = 0.55 + 0.45 * Math.max(0, Math.min(1, freeRatio));

    var chain = [];
    var files = [];
    for (var i0 = 0; i0 < active.length; i0++) {
      var d0 = active[i0];
      if (!d0) continue;
      if (d0.kind === "btc_chain_sync") chain.push(d0);
      else files.push(d0);
    }

    // Allocate bandwidth: keep chain sync at equal share, and distribute the rest across file downloads
    // with small, realistic variations while conserving total throughput.
    var fileAlloc = {};
    if (files.length > 0) {
      var filePoolMbps = perMbps * files.length;
      var weights = [];
      var sumW = 0;
      for (var wi = 0; wi < files.length; wi++) {
        var df = files[wi];
        Game.Downloads._ensureFileSim(df);
        df._ageSec += seconds;
        var ramp = Math.max(0, Math.min(1, df._ageSec / (df._rampSec || 4)));
        var rampScale = 0.18 + 0.82 * ramp;

        // Occasional short dips (e.g., retransmits / congestion), once in a while per download.
        if (df._ageSec > 1 && df._dipUntilSec <= df._ageSec) {
          var dipChance = 0.006 * Math.max(0.25, Math.min(1.5, seconds)); // scaled by tick size
          if (Math.random() < dipChance) {
            df._dipFactor = 0.35 + Math.random() * 0.45; // 0.35..0.80
            df._dipUntilSec = df._ageSec + (0.8 + Math.random() * 2.5);
          } else {
            df._dipFactor = 1;
          }
        }
        var dipScale = (df._dipUntilSec > df._ageSec) ? df._dipFactor : 1;

        var jitter = 1 + ((Math.random() * 2 - 1) * (df._jitterAmp || 0.12));
        var w = rampScale * dipScale * jitter;
        if (!isFinite(w) || w <= 0) w = 0.05;
        weights[wi] = w;
        sumW += w;
      }
      if (sumW <= 0) sumW = 1;

      // First pass: proportional allocation with caps.
      var remainingMbps = filePoolMbps;
      var openIdx = [];
      for (var ai = 0; ai < files.length; ai++) {
        var dA = files[ai];
        var alloc = filePoolMbps * (weights[ai] / sumW);
        var capMbps = typeof dA._capMbps === "number" ? dA._capMbps : Infinity;
        if (alloc > capMbps) alloc = capMbps;
        if (alloc < 0) alloc = 0;
        fileAlloc[dA.id] = alloc;
        remainingMbps -= alloc;
        if (alloc < capMbps - 0.000001) openIdx.push(ai);
      }

      // Second pass: redistribute leftover among uncapped downloads once.
      if (remainingMbps > 0.000001 && openIdx.length > 0) {
        var sumOpen = 0;
        for (var oi = 0; oi < openIdx.length; oi++) sumOpen += weights[openIdx[oi]];
        if (sumOpen <= 0) sumOpen = openIdx.length;
        for (var oj = 0; oj < openIdx.length; oj++) {
          var idx = openIdx[oj];
          var dB = files[idx];
          var add = remainingMbps * (weights[idx] / sumOpen);
          var capB = typeof dB._capMbps === "number" ? dB._capMbps : Infinity;
          var curAlloc = fileAlloc[dB.id] || 0;
          if (curAlloc + add > capB) add = Math.max(0, capB - curAlloc);
          fileAlloc[dB.id] = curAlloc + add;
        }
      }
    }

    for (var i = 0; i < active.length; i++) {
      var d = active[i];
      if (!d) continue;

      if (d.kind === "btc_chain_sync") {
        d.speedMbps = perMbps;
        var mbPerSecond = (perMbps / 8);
        var remainingBlocks = Math.max(0, (d.totalBlocks || 0) - (d.syncedBlocks || 0));
        if (remainingBlocks <= 0) {
          d.status = "complete";
          continue;
        }
        var effectiveMb = mbPerSecond * seconds * diskFactor;
        if (effectiveMb <= 0) continue;
        d.bufferMb += effectiveMb;
        var maxBlocksThisTick = 25;
        var blocksCommitted = 0;
        while (remainingBlocks > 0 && blocksCommitted < maxBlocksThisTick) {
          if (typeof d.currentBlockSizeMb !== "number" || d.currentBlockSizeMb <= 0) {
            var nextHeight = (d.startHeight || 0) + (d.syncedBlocks || 0) + 1;
            if (Game.Btc && typeof Game.Btc.getBlockSizeMb === "function") {
              d.currentBlockSizeMb = Game.Btc.getBlockSizeMb(nextHeight);
            } else {
              // Deterministic fallback when BTC module isn't available.
              var baseSize = d.blockSizeMb || 0.5;
              var maxSize = d.blockSizeMaxMb || Math.max(baseSize, 1.5);
              var prog = (d.totalBlocks && d.totalBlocks > 0) ? ((d.syncedBlocks || 0) / d.totalBlocks) : 0;
              var sizeNow = baseSize + (maxSize - baseSize) * Math.max(0, Math.min(1, prog));
              if (sizeNow < 0.05) sizeNow = 0.05;
              d.currentBlockSizeMb = sizeNow;
            }
          }
          var curSize = d.currentBlockSizeMb;
          if (d.bufferMb < curSize) break;
          if (!Game.PCStorage.canWriteMb(curSize)) break;

          d.bufferMb -= curSize;
          d.syncedBlocks += 1;
          remainingBlocks -= 1;
          Game.PCStorage.writeMb(curSize);
          d.writtenMb = (d.writtenMb || 0) + curSize;
          if (Game.state && Game.state.btc && Game.state.btc.wallet) {
            if (typeof Game.state.btc.wallet.chainStorageMb !== "number") Game.state.btc.wallet.chainStorageMb = 0;
            Game.state.btc.wallet.chainStorageMb += curSize;
          }
          blocksCommitted += 1;
          d.currentBlockSizeMb = null; // next block size recalculated on demand
        }
        if (remainingBlocks <= 0) {
          d.status = "complete";
        }
        continue;
      }

      // regular file download
      Game.Downloads._ensureFileSim(d);
      var totalMb = d.totalMb || 0;
      var downloadedMb = d.downloadedMb || 0;
      var remainingMb = Math.max(0, totalMb - downloadedMb);
      if (remainingMb <= 0) {
        d.status = "complete";
        continue;
      }

      var targetMbps = (fileAlloc && Object.prototype.hasOwnProperty.call(fileAlloc, d.id)) ? fileAlloc[d.id] : perMbps;
      if (!isFinite(targetMbps) || targetMbps < 0) targetMbps = 0;

      // Protocol overhead + small end-of-download taper.
      var overhead = 0.93;
      var tail = 1;
      if (totalMb > 0) {
        var remRatio = remainingMb / totalMb;
        if (remRatio < 0.02) tail = 0.72 + 0.28 * (remRatio / 0.02);
      }
      targetMbps = targetMbps * overhead * tail;

      // Smooth instantaneous changes so speed feels "real".
      var tau = 1.2; // seconds
      var alpha = 1 - Math.exp(-Math.max(0.01, seconds) / tau);
      d._smoothMbps = d._smoothMbps + (targetMbps - d._smoothMbps) * alpha;
      if (d._smoothMbps < 0) d._smoothMbps = 0;
      d.speedMbps = d._smoothMbps;

      var delta = (d.speedMbps / 8) * seconds * diskFactor;
      if (delta <= 0) continue;
      // Don't exceed disk free space.
      var maxDelta = Math.min(remainingMb, Game.PCStorage.getFreeMb());
      if (maxDelta <= 0) continue;
      if (delta > maxDelta) delta = maxDelta;
      d.downloadedMb += delta;
      Game.PCStorage.writeMb(delta);
      d.writtenMb = (d.writtenMb || 0) + delta;
      if (d.downloadedMb >= totalMb - 0.00001) {
        d.downloadedMb = totalMb;
        d.status = "complete";
      }
    }
  }
};

Game.registerDailyHandler = function (fn) {
  if (typeof fn !== "function") return;
  var opts = arguments.length > 1 ? arguments[1] : null;
  var phase = (opts && typeof opts === "object" && typeof opts.phase === "string") ? opts.phase : "neutral";
  if (phase !== "income" && phase !== "neutral" && phase !== "expense") phase = "neutral";
  Game.dailyHandlers.push({ fn: fn, phase: phase });
};

Game.registerDailyIncomeHandler = function (fn) {
  Game.registerDailyHandler(fn, { phase: "income" });
};

Game.registerDailyExpenseHandler = function (fn) {
  Game.registerDailyHandler(fn, { phase: "expense" });
};

Game.resetState = function () {
  try {
    localStorage.removeItem("lifesim_full_state");
  } catch (e) {
    console.error(e);
  }
  Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));
};

Game.Redeem = {
  ensure: function () {
    if (!Game.state) Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));
    if (!Array.isArray(Game.state.redeemedCodes)) Game.state.redeemedCodes = [];
  },
  defs: {
    WELCOME2003: {
      description: "Starter cash",
      apply: function () {
        Game.addMoney(200, "Redeemed code WELCOME2003");
        return {
          items: [{ label: "Money", value: "+$200", mono: true }]
        };
      }
    },
    FIRSTRIG: {
      description: "Mining boost",
      apply: function () {
        if (Game.state && Game.state.btc && Game.state.btc.mining) {
          Game.state.btc.mining.rigHashrate += 1;
          return {
            items: [{ label: "Mining rigs", value: "+1 H/s per rig", mono: true }]
          };
        }
        return { items: [] };
      }
    },
    BYTECOIN: {
      description: "Tiny BTC gift",
      apply: function () {
        Game.addBtc(0.00001000, "Redeemed code BYTECOIN");
        return {
          items: [
            { label: "BTC", value: "+0.00001000 BTC", mono: true },
            { label: "Satoshi", value: "+1000 sat", mono: true }
          ]
        };
      }
    },
    RAMBOOST: {
      description: "RAM upgrade",
      apply: function () {
        if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
        var before = (Game.state.pc && typeof Game.state.pc.ramLevel === "number") ? Game.state.pc.ramLevel : 0;
        var maxRam = (Game.PC && Game.PC.getMaxRamLevel) ? Game.PC.getMaxRamLevel() : 4;
        if (before >= maxRam) {
          Game.addMoney(50, "Redeemed code RAMBOOST (fallback)");
          return {
            items: [
              { label: "RAM", value: "Already maxed for motherboard", mono: false },
              { label: "Money", value: "+$50", mono: true }
            ]
          };
        }
        Game.state.pc.ramLevel = before + 1;
        var capMb = (Game.PC && Game.PC.getRamCapacityMb) ? Game.PC.getRamCapacityMb() : 0;
        return {
          items: [
            { label: "RAM level", value: "L" + Game.state.pc.ramLevel, mono: true },
            { label: "RAM capacity", value: Math.round(capMb) + " MB", mono: true }
          ]
        };
      }
    },
    DSOLVE: {
      description: "Debug menu",
      apply: function () {
        if (!Game.state.debug || typeof Game.state.debug !== "object") {
          Game.state.debug = { unlocked: false, tickRateMult: 1, btcMiningMultiplier: 1 };
        }
        Game.state.debug.unlocked = true;
        if (typeof Game.state.debug.tickRateMult !== "number" || !isFinite(Game.state.debug.tickRateMult)) Game.state.debug.tickRateMult = 1;
        if (typeof Game.state.debug.btcMiningMultiplier !== "number" || !isFinite(Game.state.debug.btcMiningMultiplier)) Game.state.debug.btcMiningMultiplier = 1;
        return {
          openDebugMenu: true,
          items: [
            { label: "Debug menu", value: "Unlocked", mono: false },
            { label: "Tick rate", value: "x" + Game.state.debug.tickRateMult, mono: true },
            { label: "Mining multiplier", value: "x" + Game.state.debug.btcMiningMultiplier, mono: true }
          ]
        };
      }
    }
  },
  redeem: function (rawCode) {
    Game.Redeem.ensure();
    var code = String(rawCode || "").trim().toUpperCase();
    if (!code) return { ok: false, message: "Enter a code." };
    if (code.length > 64) return { ok: false, message: "Code is too long." };
    if (!/^[A-Z0-9_-]+$/.test(code)) return { ok: false, message: "Invalid code format." };

    var already = Game.state.redeemedCodes;
    for (var i = 0; i < already.length; i++) {
      if (String(already[i]).toUpperCase() === code) {
        return { ok: false, message: "Code already redeemed." };
      }
    }

    // Dynamic codes
    // SATOSHIX<amount>: amount is in satoshi (1 sat = 0.00000001 BTC)
    var mSat = code.match(/^SATOSHIX(\d+)$/);
    if (mSat) {
      var satStr = mSat[1];
      if (!satStr || satStr.length > 12) return { ok: false, message: "Invalid SATOSHIX amount." };
      var sat = parseInt(satStr, 10);
      if (!isFinite(sat) || sat <= 0) return { ok: false, message: "Invalid SATOSHIX amount." };
      if (sat > 1000000000) return { ok: false, message: "SATOSHIX amount too large." };
      var btc = sat * 0.00000001;
      Game.addBtc(btc, "Redeemed code SATOSHIX" + sat);
      Game.state.redeemedCodes.push(code);
      return {
        ok: true,
        code: code,
        message: "Redeemed: " + code + ".",
        reward: {
          items: [
            { label: "Satoshi", value: "+" + sat + " sat", mono: true },
            { label: "BTC", value: "+" + btc.toFixed(8) + " BTC", mono: true }
          ]
        }
      };
    }

    // ROSEBUDX<amount>: amount is dollars
    var mRose = code.match(/^ROSEBUDX(\d+)$/);
    if (mRose) {
      var usdStr = mRose[1];
      if (!usdStr || usdStr.length > 12) return { ok: false, message: "Invalid ROSEBUDX amount." };
      var usd = parseInt(usdStr, 10);
      if (!isFinite(usd) || usd <= 0) return { ok: false, message: "Invalid ROSEBUDX amount." };
      if (usd > 1000000000) return { ok: false, message: "ROSEBUDX amount too large." };
      Game.addMoney(usd, "Redeemed code ROSEBUDX" + usd);
      Game.state.redeemedCodes.push(code);
      return {
        ok: true,
        code: code,
        message: "Redeemed: " + code + ".",
        reward: {
          items: [{ label: "Money", value: "+$" + usd, mono: true }]
        }
      };
    }

    // 8UBBLEGUM: restore character stats
    if (code === "8UBBLEGUM") {
      if (Game.state) {
        Game.state.hunger = 0;
        var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
        if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
        var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
        if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
        Game.state.health = maxHealth;
        Game.state.energy = maxEnergy;
      }
      Game.state.redeemedCodes.push(code);
      return {
        ok: true,
        code: code,
        message: "Redeemed: " + code + ".",
        reward: {
          items: [
            { label: "Hunger", value: "0%", mono: true },
            { label: "Health", value: "100%", mono: true },
            { label: "Energy", value: "100%", mono: true }
          ]
        }
      };
    }

    var def = Game.Redeem.defs[code];
    if (!def || typeof def.apply !== "function") {
      return { ok: false, message: "Unknown code." };
    }

    var applied = def.apply();
    Game.state.redeemedCodes.push(code);
    return {
      ok: true,
      code: code,
      message: "Redeemed: " + code + (def.description ? (" (" + def.description + ")") : "") + ".",
      reward: applied && applied.items ? applied : { items: [] },
      openDebugMenu: !!(applied && applied.openDebugMenu)
    };
  }
};

Game.Wallet = {
  normalizeId: function (coinId) {
    return String(coinId || "").toUpperCase();
  },
  ensure: function () {
    if (!Game.state) Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));
    if (!Game.state.btc || typeof Game.state.btc !== "object") Game.state.btc = {};
    if (!Array.isArray(Game.state.btc.pendingCredits)) Game.state.btc.pendingCredits = [];
    if (Game.Crypto && typeof Game.Crypto.ensureState === "function") {
      Game.Crypto.ensureState();
    } else {
      if (!Game.state.crypto || typeof Game.state.crypto !== "object") Game.state.crypto = { coins: {} };
      if (!Game.state.crypto.coins || typeof Game.state.crypto.coins !== "object") Game.state.crypto.coins = {};
    }
  },
  getBalance: function (coinId) {
    var id = Game.Wallet.normalizeId(coinId);
    if (id === "BTC") return typeof Game.state.btcBalance === "number" ? Game.state.btcBalance : 0;
    Game.Wallet.ensure();
    var c = Game.state.crypto.coins[id];
    return c && typeof c.balance === "number" ? c.balance : 0;
  },
  getUnconfirmed: function (coinId) {
    var id = Game.Wallet.normalizeId(coinId);
    if (id === "BTC") return typeof Game.state.unconfirmedBtc === "number" ? Game.state.unconfirmedBtc : 0;
    Game.Wallet.ensure();
    var c = Game.state.crypto.coins[id];
    return c && typeof c.unconfirmed === "number" ? c.unconfirmed : 0;
  },
  addConfirmed: function (coinId, amount, reason) {
    var id = Game.Wallet.normalizeId(coinId);
    var a = typeof amount === "number" ? amount : 0;
    if (a === 0) return;
    if (id === "BTC") {
      Game.state.btcBalance += a;
      return;
    }
    Game.Wallet.ensure();
    var c = Game.state.crypto.coins[id];
    if (!c) return;
    c.balance += a;
    if (c.balance < 0) c.balance = 0;
    if (reason) Game.addNotification((a >= 0 ? "+" : "") + a.toFixed(8) + " " + id + " (" + reason + ")");
  },
  addUnconfirmed: function (coinId, amount, reason) {
    var id = Game.Wallet.normalizeId(coinId);
    var a = typeof amount === "number" ? amount : 0;
    if (a === 0) return;
    if (id === "BTC") {
      Game.addBtc(a, reason || "Unconfirmed");
      return;
    }
    Game.Wallet.ensure();
    var c = Game.state.crypto.coins[id];
    if (!c) return;
    c.unconfirmed += a;
    if (c.unconfirmed < 0) c.unconfirmed = 0;
    if (reason) Game.addNotification((a >= 0 ? "+" : "") + a.toFixed(8) + " " + id + " (" + reason + ")");
  },
  confirmAll: function (coinId) {
    var id = Game.Wallet.normalizeId(coinId);
    if (id === "BTC") {
      Game.confirmAllBtc();
      return;
    }
    Game.Wallet.ensure();
    var c = Game.state.crypto.coins[id];
    if (!c) return;
    if (c.unconfirmed > 0) {
      c.balance += c.unconfirmed;
      c.unconfirmed = 0;
    }
  }
};

Game.Crypto = {
  ensureState: function () {
    if (!Game.state) Game.state = JSON.parse(JSON.stringify(Game.stateTemplate));
    if (!Game.state.crypto || typeof Game.state.crypto !== "object") {
      Game.state.crypto = { coins: {} };
    }
    if (!Game.state.crypto.coins || typeof Game.state.crypto.coins !== "object") {
      Game.state.crypto.coins = {};
    }
    function ensureCoin(id, def) {
      if (!Game.state.crypto.coins[id]) Game.state.crypto.coins[id] = JSON.parse(JSON.stringify(def));
      var c = Game.state.crypto.coins[id];
      if (typeof c.balance !== "number") c.balance = 0;
      if (typeof c.unconfirmed !== "number") c.unconfirmed = 0;
      if (!c.wallet || typeof c.wallet !== "object") c.wallet = { isInstalled: false, clientSizeMb: def.wallet.clientSizeMb };
      if (typeof c.wallet.isInstalled !== "boolean") c.wallet.isInstalled = false;
      if (typeof c.wallet.clientSizeMb !== "number") c.wallet.clientSizeMb = def.wallet.clientSizeMb;
      if (!c.miner || typeof c.miner !== "object") c.miner = { isInstalled: false, clientSizeMb: def.miner.clientSizeMb };
      if (typeof c.miner.isInstalled !== "boolean") c.miner.isInstalled = false;
      if (typeof c.miner.clientSizeMb !== "number") c.miner.clientSizeMb = def.miner.clientSizeMb;
      if (!c.exchange || typeof c.exchange !== "object") c.exchange = { priceUsd: def.exchange.priceUsd, priceHistory: [], recentTrades: [] };
      if (typeof c.exchange.priceUsd !== "number") c.exchange.priceUsd = def.exchange.priceUsd;
      if (!Array.isArray(c.exchange.priceHistory)) c.exchange.priceHistory = [];
      if (!Array.isArray(c.exchange.recentTrades)) c.exchange.recentTrades = [];
      if (typeof c.exchange._tradeSeq !== "number") c.exchange._tradeSeq = 0;
      if (typeof c.exchange._pulseAcc !== "number") c.exchange._pulseAcc = 0;
      return c;
    }
    ensureCoin("LTC", { balance: 0, unconfirmed: 0, wallet: { isInstalled: false, clientSizeMb: 420 }, miner: { isInstalled: false, clientSizeMb: 180 }, exchange: { priceUsd: 120, priceHistory: [] } });
    ensureCoin("DOGE", { balance: 0, unconfirmed: 0, wallet: { isInstalled: false, clientSizeMb: 260 }, miner: { isInstalled: false, clientSizeMb: 140 }, exchange: { priceUsd: 0.15, priceHistory: [] } });
    ensureCoin("SOL", { balance: 0, unconfirmed: 0, wallet: { isInstalled: false, clientSizeMb: 520 }, miner: { isInstalled: false, clientSizeMb: 0 }, exchange: { priceUsd: 95, priceHistory: [] } });
    ensureCoin("MATIC", { balance: 0, unconfirmed: 0, wallet: { isInstalled: false, clientSizeMb: 380 }, miner: { isInstalled: false, clientSizeMb: 0 }, exchange: { priceUsd: 0.85, priceHistory: [] } });
    ensureCoin("USDT", { balance: 0, unconfirmed: 0, wallet: { isInstalled: false, clientSizeMb: 120 }, miner: { isInstalled: false, clientSizeMb: 0 }, exchange: { priceUsd: 1.0, priceHistory: [] } });

    if (!Game.state.pc || typeof Game.state.pc !== "object") Game.state.pc = { isOpen: false, activeApp: "desktop" };
    if (typeof Game.state.pc.marketCoin !== "string") Game.state.pc.marketCoin = "BTC";
  },
  getCoinIds: function () {
    Game.Crypto.ensureState();
    var ids = [];
    for (var id in Game.state.crypto.coins) {
      if (Object.prototype.hasOwnProperty.call(Game.state.crypto.coins, id)) {
        ids.push(id);
      }
    }
    ids.sort();
    ids.unshift("BTC");
    return ids;
  },
  getBalance: function (coinId) {
    return Game.Wallet.getBalance(coinId);
  },
  addConfirmed: function (coinId, amount, reason) {
    Game.Wallet.addConfirmed(coinId, amount, reason);
  },
  addUnconfirmed: function (coinId, amount, reason) {
    Game.Wallet.addUnconfirmed(coinId, amount, reason);
  },
  confirmAll: function (coinId) {
    Game.Wallet.confirmAll(coinId);
  },
  getExchange: function (coinId) {
    var id = String(coinId || "").toUpperCase();
    if (id === "BTC" && Game.Btc && Game.Btc.getExchange) return Game.Btc.getExchange();
    Game.Crypto.ensureState();
    var c = Game.state.crypto.coins[id];
    if (c && c.exchange) {
      if (!Array.isArray(c.exchange.recentTrades)) c.exchange.recentTrades = [];
      if (typeof c.exchange._tradeSeq !== "number") c.exchange._tradeSeq = 0;
      if (typeof c.exchange._pulseAcc !== "number") c.exchange._pulseAcc = 0;
    }
    return c ? c.exchange : null;
  },
  recordTrade: function (coinId, side, price, amount) {
    var id = String(coinId || "").toUpperCase();
    if (id === "BTC") return;
    var ex = Game.Crypto.getExchange(id);
    if (!ex || !(price > 0) || !(amount > 0)) return;
    if (!Array.isArray(ex.recentTrades)) ex.recentTrades = [];
    if (typeof ex._tradeSeq !== "number") ex._tradeSeq = 0;
    var ts = Date.now ? Date.now() : new Date().getTime();
    var gameDay = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
    var gameMinutes = (Game.state && typeof Game.state.timeMinutes === "number") ? Game.state.timeMinutes : 0;
    ex.recentTrades.unshift({
      id: (++ex._tradeSeq),
      ts: ts,
      gameDay: gameDay,
      gameMinutes: gameMinutes,
      side: side === "buy" ? "buy" : "sell",
      price: price,
      amount: amount,
      total: amount,
      remaining: amount
    });
    if (ex.recentTrades.length > 30) ex.recentTrades.length = 30;
  },
  fillTradeOpportunity: function (coinId, tradeId, fraction) {
    var id = String(coinId || "").toUpperCase();
    if (!id) return { ok: false, message: "Unknown coin." };
    if (id === "BTC") return Game.Btc.fillTradeOpportunity(tradeId, fraction);
    Game.Crypto.ensureState();
    var ex = Game.Crypto.getExchange(id);
    if (!ex || !Array.isArray(ex.recentTrades)) return { ok: false, message: id + " exchange unavailable." };
    var trades = ex.recentTrades;
    if (!tradeId) return { ok: false, message: "Missing trade reference." };
    var idx = -1;
    for (var i = 0; i < trades.length; i++) {
      if (trades[i] && String(trades[i].id) === String(tradeId)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return { ok: false, message: "Trade not found." };
    var trade = trades[idx];
    if (!trade) return { ok: false, message: "Trade no longer available." };
    var available = Math.max(0, typeof trade.remaining === "number" ? trade.remaining : (typeof trade.amount === "number" ? trade.amount : 0));
    if (available <= 0) {
      trades.splice(idx, 1);
      return { ok: false, message: "Trade already filled." };
    }
    var share = (typeof fraction === "number" && fraction > 0) ? Math.min(1, fraction) : 1;
    var want = available * share;
    var epsilon = 0.00000001;
    if (want <= epsilon) want = available;
    var price = trade.price || 0;
    var filled = 0;
    if (trade.side === "sell") {
      var cash = Game.state.money || 0;
      var maxAffordable = price > 0 ? (cash / price) : available;
      if (maxAffordable <= epsilon) return { ok: false, message: "Not enough money." };
      var amount = Math.min(want, available, maxAffordable);
      if (amount <= epsilon) return { ok: false, message: "Trade amount too small." };
      var cost = amount * price;
      if (!Game.spendMoney(cost, "Trade opportunity " + id)) return { ok: false, message: "Not enough money." };
      Game.Crypto.addConfirmed(id, amount, "Trade opportunity");
      filled = amount;
    } else {
      var bal = Game.Crypto.getBalance(id);
      if (bal <= epsilon) return { ok: false, message: "Not enough " + id + "." };
      var amount = Math.min(want, available, bal);
      if (amount <= epsilon) return { ok: false, message: "Trade amount too small." };
      Game.Crypto.addConfirmed(id, -amount, "Trade opportunity");
      Game.addMoney(amount * price, "Trade opportunity");
      filled = amount;
    }
    if (filled <= 0) return { ok: false, message: "Unable to fill trade." };
    trade.remaining = Math.max(0, (typeof trade.remaining === "number" ? trade.remaining : available) - filled);
    if (trade.remaining <= epsilon) {
      trades.splice(idx, 1);
    }
    return { ok: true, filled: filled, remaining: trade.remaining };
  },
  startWalletDownload: function (coinId) {
    var id = String(coinId || "").toUpperCase();
    if (id === "BTC") {
      if (Game.Btc && Game.Btc.startWalletDownload) Game.Btc.startWalletDownload();
      return;
    }
    Game.Crypto.ensureState();
    if (!Game.Downloads || !Game.Downloads.startFileDownload) return;
    var c = Game.state.crypto.coins[id];
    if (!c) return;
    if (c.wallet && c.wallet.isInstalled) {
      Game.addNotification(id + " wallet already installed.");
      return;
    }
    var sizeMb = (c.wallet && c.wallet.clientSizeMb) ? c.wallet.clientSizeMb : 300;
    var d = Game.Downloads.startFileDownload({
      id: id.toLowerCase() + "-wallet-client",
      kind: "crypto_wallet_client",
      name: id + " Wallet Client",
      sizeMb: sizeMb,
      coinId: id
    });
    if (d) Game.addNotification("Started " + id + " wallet download (" + Math.round(sizeMb) + " MB).");
  },
  startMinerDownload: function (coinId) {
    var id = String(coinId || "").toUpperCase();
    Game.Crypto.ensureState();
    if (!Game.Downloads || !Game.Downloads.startFileDownload) return;
    var c = id === "BTC" ? null : Game.state.crypto.coins[id];
    if (!c || !c.miner) {
      Game.addNotification("No miner available for " + id + ".");
      return;
    }
    if (c.miner.isInstalled) {
      Game.addNotification(id + " miner already installed.");
      return;
    }
    var sizeMb = c.miner.clientSizeMb || 160;
    var d = Game.Downloads.startFileDownload({
      id: id.toLowerCase() + "-miner",
      kind: "crypto_miner_client",
      name: id + " Miner",
      sizeMb: sizeMb,
      coinId: id
    });
    if (d) Game.addNotification("Started " + id + " miner download (" + Math.round(sizeMb) + " MB).");
  },
  processDownloads: function () {
    if (!Game.state || !Game.state.pc || !Array.isArray(Game.state.pc.downloads)) return;
    Game.Crypto.ensureState();
    var list = Game.state.pc.downloads;
    for (var i = list.length - 1; i >= 0; i--) {
      var d = list[i];
      if (!d || d.status !== "complete") continue;
      var coinId = d.coinId ? String(d.coinId).toUpperCase() : null;
      if (!coinId) continue;
      if (d.kind === "crypto_wallet_client") {
        if (Game.state.crypto.coins[coinId] && Game.state.crypto.coins[coinId].wallet) {
          Game.state.crypto.coins[coinId].wallet.isInstalled = true;
          Game.addNotification(coinId + " wallet client downloaded.");
        }
        list.splice(i, 1);
        continue;
      }
      if (d.kind === "crypto_miner_client") {
        if (Game.state.crypto.coins[coinId] && Game.state.crypto.coins[coinId].miner) {
          Game.state.crypto.coins[coinId].miner.isInstalled = true;
          Game.addNotification(coinId + " miner downloaded.");
        }
        list.splice(i, 1);
        continue;
      }
    }
  },
  tickExchange: function (seconds) {
    Game.Crypto.ensureState();
    if (typeof seconds !== "number" || seconds <= 0) return;
    function tickCoinPrice(coinId, minPrice, driftAbs, driftPct) {
      var ex = Game.Crypto.getExchange(coinId);
      if (!ex) return;
      if (!Array.isArray(ex.recentTrades)) ex.recentTrades = [];
      if (typeof ex._tradeSeq !== "number") ex._tradeSeq = 0;
      if (typeof ex._pulseAcc !== "number") ex._pulseAcc = 0;
      var base = ex.priceUsd || minPrice;
      var drift = (Math.random() - 0.5) * driftAbs + (Math.random() - 0.5) * (base * driftPct);
      base = base + drift;
      if (base < minPrice) base = minPrice;
      ex.priceUsd = base;

      // Steady live trade tape (cosmetic).
      ex._pulseAcc += seconds;
      var pcOpen = !!(Game.state && Game.state.pc && Game.state.pc.isOpen && (((Game.PC && Game.PC.isAppOpen && Game.PC.isAppOpen("market"))) || Game.state.pc.activeApp === "market"));
      var interval = pcOpen ? 0.75 : 2.1;
      while (ex._pulseAcc >= interval) {
        ex._pulseAcc -= interval;
        var bursts = pcOpen ? (1 + Math.floor(Math.random() * 2)) : 1;
        for (var t = 0; t < bursts; t++) {
          var side = Math.random() < 0.5 ? "buy" : "sell";
          var slip = (Math.random() - 0.5) * 0.004; // ±0.4%
          var tradePrice = base * (1 + slip);
          if (tradePrice < minPrice) tradePrice = minPrice;
          var amt = 0.5 + Math.random() * 120;
          if (coinId === "SOL") amt = 0.05 + Math.random() * 6;
          else if (coinId === "LTC") amt = 0.02 + Math.random() * 2.5;
          else if (coinId === "DOGE") amt = 50 + Math.random() * 8000;
          else if (coinId === "MATIC") amt = 2 + Math.random() * 400;
          else if (coinId === "USDT") amt = 5 + Math.random() * 800;
          Game.Crypto.recordTrade(coinId, side, tradePrice, amt);
        }
      }

      var day = Game.state.day || 1;
      var minutes = Game.state.timeMinutes || 0;
      var hour = Math.floor(minutes / 60);
      var key = coinId + "-" + day + "-" + hour;
      if (ex._lastSnapKey !== key) {
        ex._lastSnapKey = key;
        ex.priceHistory.push({ key: day * (24 * 60) + hour * 60, day: day, hour: hour, minutes: hour * 60, price: base });
        if (ex.priceHistory.length > 96) ex.priceHistory = ex.priceHistory.slice(-96);
      }
    }
    tickCoinPrice("LTC", 1, 1.2, 0.0);
    tickCoinPrice("DOGE", 0.01, 0.01, 0.06);
    tickCoinPrice("SOL", 1, 2.5, 0.02);
    tickCoinPrice("MATIC", 0.05, 0.02, 0.04);
    tickCoinPrice("USDT", 0.98, 0.0, 0.002);
  },
  buyAtMarket: function (coinId, usdAmount) {
    var id = String(coinId || "").toUpperCase();
    if (id === "BTC") return { ok: false, message: "Use the BTC exchange for BTC orders." };
    Game.Crypto.ensureState();
    var ex = Game.Crypto.getExchange(id);
    if (!ex || !(ex.priceUsd > 0)) return { ok: false, message: "No price available." };
    var usd = typeof usdAmount === "number" ? usdAmount : parseFloat(usdAmount);
    if (!isFinite(usd) || usd <= 0) return { ok: false, message: "Enter a USD amount." };
    if (!Game.spendMoney(usd, "Bought " + id)) return { ok: false, message: "Not enough money." };
    var amt = usd / ex.priceUsd;
    Game.Crypto.addConfirmed(id, amt, "Market buy");
    Game.Crypto.recordTrade(id, "buy", ex.priceUsd, amt);
    return { ok: true, amount: amt, price: ex.priceUsd };
  },
  sellAtMarket: function (coinId, coinAmount) {
    var id = String(coinId || "").toUpperCase();
    if (id === "BTC") return { ok: false, message: "Use the BTC exchange for BTC orders." };
    Game.Crypto.ensureState();
    var ex = Game.Crypto.getExchange(id);
    if (!ex || !(ex.priceUsd > 0)) return { ok: false, message: "No price available." };
    var amt = typeof coinAmount === "number" ? coinAmount : parseFloat(coinAmount);
    if (!isFinite(amt) || amt <= 0) return { ok: false, message: "Enter an amount." };
    var bal = Game.Crypto.getBalance(id);
    if (amt > bal) return { ok: false, message: "Not enough " + id + "." };
    Game.Crypto.addConfirmed(id, -amt, "Market sell");
    Game.addMoney(amt * ex.priceUsd, "Sold " + id);
    Game.Crypto.recordTrade(id, "sell", ex.priceUsd, amt);
    return { ok: true, usd: amt * ex.priceUsd, price: ex.priceUsd };
  },
  tick: function (seconds) {
    Game.Crypto.processDownloads();
    Game.Crypto.tickExchange(seconds);
    // Auto-confirm altcoin mining once the wallet is installed (simplified).
    Game.Crypto.ensureState();
    var coins = Game.state.crypto && Game.state.crypto.coins ? Game.state.crypto.coins : {};
    for (var cid in coins) {
      if (!Object.prototype.hasOwnProperty.call(coins, cid)) continue;
      var c = coins[cid];
      if (c && c.wallet && c.wallet.isInstalled) {
        Game.Crypto.confirmAll(cid);
      }
    }
  }
};

Game.addBtc = function (amount, reason) {
  var a = typeof amount === "number" ? amount : 0;
  if (!isFinite(a) || a === 0) return;
  if (!Game.state.btc || typeof Game.state.btc !== "object") Game.state.btc = {};
  if (!Array.isArray(Game.state.btc.pendingCredits)) Game.state.btc.pendingCredits = [];

  if (Game.Btc && typeof Game.Btc.recordPendingCredit === "function") {
    Game.Btc.recordPendingCredit(a, reason || "Unconfirmed");
  } else {
    Game.state.unconfirmedBtc += a;
  }
  if (!Game.state.btc.history) {
    Game.state.btc.history = { byDay: [], currentDayEarned: 0 };
  }
  Game.state.btc.history.currentDayEarned += a;
  if (reason && a !== 0) {
    // Suppress noisy passive BTC mining notifications in the feed
    var isMiningReward = (reason === "Mining rig") || (reason.indexOf("Cloud mining") === 0) || (reason === "PC mining");
    if (!isMiningReward) {
      Game.addNotification("+" + a.toFixed(8) + " BTC (" + reason + ")");
    }
  }
  if (window.UI && UI.animateNumber) {
    UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
  }
};

Game.confirmAllBtc = function () {
  if (!Game.state.btc || typeof Game.state.btc !== "object") Game.state.btc = {};
  if (!Array.isArray(Game.state.btc.pendingCredits)) Game.state.btc.pendingCredits = [];
  var moved = Game.state.unconfirmedBtc || 0;
  Game.state.btcBalance += moved;
  if (moved > 0) Game.addNotification("Wallet sync confirmed " + moved.toFixed(8) + " BTC");
  Game.state.unconfirmedBtc = 0;
  Game.state.btc.pendingCredits.length = 0;
  if (window.UI && UI.animateNumber) {
    UI.animateNumber("btc", Game.state.btcBalance + Game.state.unconfirmedBtc);
  }
};

Game.advanceTime = function (minutes) {
  if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
  Game.state.timeMinutes += minutes;
  while (Game.state.timeMinutes >= 24 * 60) {
    Game.state.timeMinutes -= 24 * 60;
    Game.state.day += 1;

    function runPhase(phase) {
      for (var i = 0; i < Game.dailyHandlers.length; i++) {
        var h = Game.dailyHandlers[i];
        var fn = null;
        var hp = "neutral";
        if (typeof h === "function") {
          fn = h;
          hp = "neutral";
        } else if (h && typeof h.fn === "function") {
          fn = h.fn;
          hp = h.phase || "neutral";
        }
        if (!fn) continue;
        if (hp !== phase) continue;
        try {
          fn();
        } catch (e) {
          console.error(e);
        }
      }
    }

    runPhase("income");
    runPhase("neutral");
    runPhase("expense");
  }
};

Game.getClockString = function () {
  var total = Math.floor(Game.state.timeMinutes % (24 * 60));
  var h = Math.floor(total / 60);
  var m = total % 60;
  var hh = (h < 10 ? "0" : "") + h;
  var mm = (m < 10 ? "0" : "") + m;
  return hh + ":" + mm;
};

Game.getDayOfWeekString = function () {
  var day = (Game.state && typeof Game.state.day === "number") ? Math.floor(Game.state.day) : 1;
  if (!isFinite(day) || day < 1) day = 1;
  var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return weekdays[(day - 1) % weekdays.length];
};

Game.getMonthYearString = function () {
  var startYear = 2003;
  var startMonthIndex = 0; // 0=Jan
  var daysPerMonth = 30;
  var monthsPerYear = 12;

  var day = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
  if (!isFinite(day) || day < 1) day = 1;
  var daysSinceStart = Math.max(0, Math.floor(day - 1));
  var totalMonths = Math.floor(daysSinceStart / daysPerMonth);
  var yearOffset = Math.floor((startMonthIndex + totalMonths) / monthsPerYear);
  var monthIndex = (startMonthIndex + totalMonths) % monthsPerYear;
  var yearNumber = startYear + yearOffset;
  var dayOfMonth = (daysSinceStart % daysPerMonth) + 1;
  return "MONTH " + (monthIndex + 1) + ", DAY " + dayOfMonth + ", YEAR " + yearNumber;
};

Game.getInGameYearIndex = function () {
  var day = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
  if (!isFinite(day) || day < 1) day = 1;
  var daysPerYear = 30 * 12;
  return 1 + Math.floor((day - 1) / daysPerYear);
};

Game.getInGameYearNumber = function () {
  var startYear = 2003;
  return startYear + (Game.getInGameYearIndex() - 1);
};

Game.getEducationLabel = function () {
  var lvl = Game.state.education.level;
  if (lvl <= 0) return "No formal training";
  if (lvl === 1) return "Basic night classes";
  if (lvl === 2) return "Vocational diploma";
  if (lvl === 3) return "Rail engineering";
  if (lvl >= 4) return "Business & engineering graduate";
  return "Student";
};
