Game.Jobs = {
  xpRequirementMultiplier: 3,
  applicationMinMinutes: 30,
  applicationMaxMinutes: 120,
  offerExpireMinutes: 360,
  maxRejectionLog: 10,
  _hashString32: function (str) {
    var s = String(str || "");
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },
  _getJobXpCurve: function (jobId) {
    var id = String(jobId || "");
    var def = Game.Jobs.defs && Game.Jobs.defs[id] ? Game.Jobs.defs[id] : null;
    if (def && def.xpCurve && typeof def.xpCurve === "object") {
      return def.xpCurve;
    }
    var h = Game.Jobs._hashString32(id || "none");
    var base = 90 + (h % 80); // 90..169
    var perLevel = 55 + ((h >>> 7) % 70); // 55..124
    var bump = ((h % 500000) / 10000); // 0..49.9999
    return { base: base, perLevel: perLevel, bump: bump };
  },
  getXpRequiredForNextLevel: function (jobId, currentLevel) {
    // Back-compat: old signature was (currentLevel).
    if (typeof jobId === "number" && typeof currentLevel === "undefined") {
      currentLevel = jobId;
      jobId = (Game.state && Game.state.job) ? Game.state.job.current : "none";
    }
    var lvl = typeof currentLevel === "number" ? currentLevel : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    var curve = Game.Jobs._getJobXpCurve(jobId);
    var base = (curve && typeof curve.base === "number" && isFinite(curve.base)) ? curve.base : 100;
    var perLevel = (curve && typeof curve.perLevel === "number" && isFinite(curve.perLevel)) ? curve.perLevel : 70;
    var bump = (curve && typeof curve.bump === "number" && isFinite(curve.bump)) ? curve.bump : 0;
    var req = (base + (lvl * perLevel) + bump) * (Game.Jobs.xpRequirementMultiplier || 1);
    if (!isFinite(req) || req < 1) req = 1;
    return req;
  },
  defs: {
    none: {
      id: "none",
      name: "Unemployed",
      description: "No steady income yet.",
      skill: null,
      location: null
    },
    barista: {
      id: "barista",
      name: "Barista",
      description: "Serve coffee for a basic wage.",
      skill: "businessSkill",
      minEducation: 0,
      location: "City Centre"
    },
    office: {
      id: "office",
      name: "Office Assistant",
      description: "Better pay, light admin work.",
      skill: "businessSkill",
      minEducation: 2,
      location: "City Centre"
    },
    trainDriver: {
      id: "trainDriver",
      name: "Steam Train Driver",
      description: "Operate a steam locomotive with live controls.",
      skill: "trainSkill",
      minEducation: 3,
      location: "Industrial Park"
    },
    retailAssistant: {
      id: "retailAssistant",
      name: "Retail Assistant",
      description: "Help customers and manage shelves in a busy high-street store.",
      skill: "businessSkill",
      minEducation: 1,
      location: "City Centre"
    },
    foodCourier: {
      id: "foodCourier",
      name: "Food Courier",
      description: "Deliver meals across town for tips and steady pay.",
      skill: "businessSkill",
      minEducation: 0,
      location: "City Centre"
    },
    callCenterRep: {
      id: "callCenterRep",
      name: "Call Center Rep",
      description: "Handle customer issues, escalate tickets and keep your metrics clean.",
      skill: "businessSkill",
      minEducation: 1,
      location: "City Centre"
    },
    salesAssociate: {
      id: "salesAssociate",
      name: "Sales Associate",
      description: "Turn walk-ins into revenue and learn negotiation under pressure.",
      skill: "businessSkill",
      minEducation: 2,
      location: "City Centre"
    },
    itSupport: {
      id: "itSupport",
      name: "IT Support Technician",
      description: "Troubleshoot devices, reset accounts and keep offices running.",
      skill: "techSkill",
      minEducation: 3,
      location: "City Centre"
    },
    factoryWorker: {
      id: "factoryWorker",
      name: "Factory Worker",
      description: "Operate equipment on the industrial line for steady pay.",
      skill: "businessSkill",
      minEducation: 2,
      location: "Industrial Park"
    },
    warehousePicker: {
      id: "warehousePicker",
      name: "Warehouse Picker",
      description: "Pick, pack and load goods on tight deadlines.",
      skill: "businessSkill",
      minEducation: 0,
      location: "Industrial Park"
    },
    forkliftOperator: {
      id: "forkliftOperator",
      name: "Forklift Operator",
      description: "Move pallets safely and keep the yard flowing.",
      skill: "businessSkill",
      minEducation: 2,
      location: "Industrial Park"
    },
    welderApprentice: {
      id: "welderApprentice",
      name: "Welder Apprentice",
      description: "Assist welders and learn the fundamentals of fabrication.",
      skill: "techSkill",
      minEducation: 2,
      location: "Industrial Park"
    },
    qualityInspector: {
      id: "qualityInspector",
      name: "Quality Inspector",
      description: "Inspect batches, write reports and stop defects from shipping.",
      skill: "techSkill",
      minEducation: 4,
      location: "Industrial Park"
    },
    hospitalPorter: {
      id: "hospitalPorter",
      name: "Hospital Porter",
      description: "Move patients and equipment around the hospital, supporting the medical staff.",
      skill: "businessSkill",
      minEducation: 2,
      location: "Hospital"
    },
    clinicReceptionist: {
      id: "clinicReceptionist",
      name: "Clinic Receptionist",
      description: "Schedule appointments, check patients in and keep the front desk calm.",
      skill: "businessSkill",
      minEducation: 1,
      location: "Hospital"
    },
    phlebotomist: {
      id: "phlebotomist",
      name: "Phlebotomist",
      description: "Collect blood samples with speed, accuracy and bedside care.",
      skill: "techSkill",
      minEducation: 3,
      location: "Hospital"
    },
    emt: {
      id: "emt",
      name: "EMT",
      description: "Respond to emergencies and stabilize patients under time pressure.",
      skill: "techSkill",
      minEducation: 4,
      location: "Hospital"
    },
    labTechnician: {
      id: "labTechnician",
      name: "Lab Technician",
      description: "Run tests, maintain equipment and ensure reliable results.",
      skill: "techSkill",
      minEducation: 5,
      location: "Hospital"
    },
    farmHand: {
      id: "farmHand",
      name: "Farm Hand",
      description: "Work long days outdoors tending fields and livestock.",
      skill: "businessSkill",
      minEducation: 1,
      location: "Countryside"
    },
    dairyWorker: {
      id: "dairyWorker",
      name: "Dairy Worker",
      description: "Early mornings, steady routine, and hands-on farm operations.",
      skill: "businessSkill",
      minEducation: 0,
      location: "Countryside"
    },
    tourGuide: {
      id: "tourGuide",
      name: "Tour Guide",
      description: "Lead visitors around scenic routes and turn stories into tips.",
      skill: "businessSkill",
      minEducation: 1,
      location: "Countryside"
    },
    groundskeeper: {
      id: "groundskeeper",
      name: "Groundskeeper",
      description: "Maintain trails, fences and equipment across rural properties.",
      skill: "techSkill",
      minEducation: 2,
      location: "Countryside"
    },
    greenhouseTech: {
      id: "greenhouseTech",
      name: "Greenhouse Technician",
      description: "Monitor yields, climate control and irrigation systems.",
      skill: "techSkill",
      minEducation: 3,
      location: "Countryside"
    },

    // Advanced jobs (hidden until unlocked via prior job level + higher education)
    accountingClerk: {
      id: "accountingClerk",
      name: "Accounting Clerk",
      description: "Handle ledgers, invoices and reconciliations for a mid-size firm.",
      skill: "businessSkill",
      minEducation: 5,
      location: "City Centre",
      requiresJob: "office",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    financialAnalyst: {
      id: "financialAnalyst",
      name: "Financial Analyst",
      description: "Build forecasts and reports that move real money and real decisions.",
      skill: "businessSkill",
      minEducation: 7,
      location: "City Centre",
      requiresJob: "accountingClerk",
      requiresJobLevel: 8,
      hiddenUntilUnlocked: true
    },
    corporateDirector: {
      id: "corporateDirector",
      name: "Corporate Director",
      description: "Lead teams, manage budgets and negotiate contracts at the highest level.",
      skill: "businessSkill",
      minEducation: 8,
      location: "City Centre",
      requiresJob: "financialAnalyst",
      requiresJobLevel: 10,
      hiddenUntilUnlocked: true
    },
    dataAnalyst: {
      id: "dataAnalyst",
      name: "Data Analyst",
      description: "Turn messy data into clear insights and measurable improvements.",
      skill: "businessSkill",
      minEducation: 6,
      location: "City Centre",
      requiresJob: "salesAssociate",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    softwareDeveloper: {
      id: "softwareDeveloper",
      name: "Software Developer",
      description: "Build internal tools, automate workflows and ship fixes under pressure.",
      skill: "techSkill",
      minEducation: 7,
      location: "City Centre",
      requiresJob: "itSupport",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },

    maintenanceTechnician: {
      id: "maintenanceTechnician",
      name: "Maintenance Technician",
      description: "Diagnose faults, service machinery and keep the plant running.",
      skill: "techSkill",
      minEducation: 5,
      location: "Industrial Park",
      requiresJob: "factoryWorker",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    processEngineer: {
      id: "processEngineer",
      name: "Process Engineer",
      description: "Optimize throughput, reduce downtime and design safer workflows.",
      skill: "techSkill",
      minEducation: 8,
      location: "Industrial Park",
      requiresJob: "maintenanceTechnician",
      requiresJobLevel: 8,
      hiddenUntilUnlocked: true
    },
    railOperationsChief: {
      id: "railOperationsChief",
      name: "Rail Operations Chief",
      description: "Coordinate dispatch, scheduling and safety across the rail yard.",
      skill: "trainSkill",
      minEducation: 8,
      location: "Industrial Park",
      requiresJob: "trainDriver",
      requiresJobLevel: 8,
      hiddenUntilUnlocked: true
    },
    qualityEngineer: {
      id: "qualityEngineer",
      name: "Quality Engineer",
      description: "Design inspection plans, reduce defects and keep production stable.",
      skill: "techSkill",
      minEducation: 6,
      location: "Industrial Park",
      requiresJob: "qualityInspector",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    automationEngineer: {
      id: "automationEngineer",
      name: "Automation Engineer",
      description: "Automate repetitive work and improve reliability with control systems.",
      skill: "techSkill",
      minEducation: 7,
      location: "Industrial Park",
      requiresJob: "maintenanceTechnician",
      requiresJobLevel: 7,
      hiddenUntilUnlocked: true
    },

    medicalAssistant: {
      id: "medicalAssistant",
      name: "Medical Assistant",
      description: "Support clinicians with patient intake, vitals and basic procedures.",
      skill: "techSkill",
      minEducation: 6,
      location: "Hospital",
      requiresJob: "hospitalPorter",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    registeredNurse: {
      id: "registeredNurse",
      name: "Registered Nurse",
      description: "Deliver patient care under pressure with trained clinical judgment.",
      skill: "techSkill",
      minEducation: 8,
      location: "Hospital",
      requiresJob: "medicalAssistant",
      requiresJobLevel: 8,
      hiddenUntilUnlocked: true
    },
    radiologyTech: {
      id: "radiologyTech",
      name: "Radiology Technician",
      description: "Operate imaging equipment and support diagnostics with precision and care.",
      skill: "techSkill",
      minEducation: 7,
      location: "Hospital",
      requiresJob: "labTechnician",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },

    equipmentOperator: {
      id: "equipmentOperator",
      name: "Farm Equipment Operator",
      description: "Operate and maintain modern machinery for planting, harvest and transport.",
      skill: "techSkill",
      minEducation: 5,
      location: "Countryside",
      requiresJob: "farmHand",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    },
    agriManager: {
      id: "agriManager",
      name: "Agriculture Manager",
      description: "Manage schedules, suppliers and yields while keeping costs under control.",
      skill: "businessSkill",
      minEducation: 7,
      location: "Countryside",
      requiresJob: "equipmentOperator",
      requiresJobLevel: 8,
      hiddenUntilUnlocked: true
    },
    sustainabilityConsultant: {
      id: "sustainabilityConsultant",
      name: "Sustainability Consultant",
      description: "Advise farms and councils on efficiency, grants and long-term planning.",
      skill: "businessSkill",
      minEducation: 8,
      location: "Countryside",
      requiresJob: "agriManager",
      requiresJobLevel: 10,
      hiddenUntilUnlocked: true
    },
    agronomist: {
      id: "agronomist",
      name: "Agronomist",
      description: "Improve yields through soil, crop and irrigation planning backed by data.",
      skill: "techSkill",
      minEducation: 6,
      location: "Countryside",
      requiresJob: "greenhouseTech",
      requiresJobLevel: 6,
      hiddenUntilUnlocked: true
    }
  },
  minOffersPerLocation: 2,
  maxOffersPerLocation: 4,
  isJobUnlocked: function (id) {
    var def = Game.Jobs.defs[id];
    if (!def || id === "none") return false;
    var minEdu = def.minEducation || 0;
    var eduLevel = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
    if (eduLevel < minEdu) return false;
    if (def.requiresJob) {
      var reqLevel = def.requiresJobLevel || 0;
      var info = Game.Jobs.getJobLevelInfo(def.requiresJob);
      if ((info.level || 0) < reqLevel) return false;
    }
    return true;
  },
  filterVisibleOffers: function (location, offers) {
    if (!Array.isArray(offers) || offers.length === 0) return [];
    var out = [];
    for (var i = 0; i < offers.length; i++) {
      var id = offers[i];
      var def = Game.Jobs.defs[id];
      if (!def || id === "none") continue;
      // Special rule: barista can be offered/selected while at Home.
      if (!(location === "Home" && id === "barista")) {
        if (def.location && def.location !== location) continue;
      }
      if (def.hiddenUntilUnlocked && !Game.Jobs.isJobUnlocked(id)) continue;
      out.push(id);
    }
    return out;
  },
  getJobsForLocation: function (location) {
    var list = [];
    // Barista is always available to select while at Home.
    if (location === "Home") {
      list.push("barista");
    }
    for (var id in Game.Jobs.defs) {
      if (!Game.Jobs.defs.hasOwnProperty(id)) continue;
      if (id === "none") continue;
      if (location === "Home" && id === "barista") continue;
      var def = Game.Jobs.defs[id];
      if (def.location === location) {
        if (def.hiddenUntilUnlocked && !Game.Jobs.isJobUnlocked(id)) continue;
        list.push(id);
      }
    }
    return list;
  },
  ensureJobOffersContainer: function () {
    if (!Game.state.jobOffers || typeof Game.state.jobOffers !== "object") {
      Game.state.jobOffers = {};
    }
  },
  generateOffersForLocation: function (location) {
    Game.Jobs.ensureJobOffersContainer();
    if (!location) {
      location = Game.state.travelLocation || "Home";
    }
    var allJobs = Game.Jobs.getJobsForLocation(location);
    if (!allJobs.length) {
      Game.state.jobOffers[location] = [];
      return;
    }
    // Randomly pick 2–4 unique jobs for this location (changes daily).
    // The current job is shown separately in the UI and should not consume an offer slot.
    var pool = allJobs.slice();
    var currentJobId = (Game.state.job && typeof Game.state.job.current === "string") ? Game.state.job.current : "";
    if (currentJobId && currentJobId !== "none") {
      pool = pool.filter(function (id) { return id !== currentJobId; });
    }
    var offers = [];
    var min = typeof Game.Jobs.minOffersPerLocation === "number" ? Game.Jobs.minOffersPerLocation : 2;
    var max = typeof Game.Jobs.maxOffersPerLocation === "number" ? Game.Jobs.maxOffersPerLocation : 4;
    if (!isFinite(min) || min < 0) min = 0;
    if (!isFinite(max) || max < min) max = min;
    var desired = min + Math.floor(Math.random() * (max - min + 1));
    var count = Math.min(desired, pool.length);
    while (offers.length < count && pool.length > 0) {
      var idx = Math.floor(Math.random() * pool.length);
      offers.push(pool[idx]);
      pool.splice(idx, 1);
    }
    Game.state.jobOffers[location] = offers;
  },
  ensureOffersForCurrentLocation: function () {
    var loc = Game.state.travelLocation || "Home";
    Game.Jobs.ensureJobOffersContainer();
    if (Array.isArray(Game.state.jobOffers[loc]) && Game.state.jobOffers[loc].length > 0) {
      Game.state.jobOffers[loc] = Game.Jobs.filterVisibleOffers(loc, Game.state.jobOffers[loc]);
    }
    if (!Array.isArray(Game.state.jobOffers[loc]) || Game.state.jobOffers[loc].length === 0) {
      Game.Jobs.generateOffersForLocation(loc);
    }
  },
  refreshLocationJobOffersDaily: function () {
    Game.Jobs.ensureJobOffersContainer();
    if (Game.World && Array.isArray(Game.World.locations)) {
      for (var i = 0; i < Game.World.locations.length; i++) {
        var loc = Game.World.locations[i];
        if (!loc || !loc.id) continue;
        Game.Jobs.generateOffersForLocation(loc.id);
      }
    } else {
      // Fallback: at least refresh for current travel location
      Game.Jobs.generateOffersForLocation(Game.state.travelLocation || "Home");
    }
  },
  ensureJobProgress: function () {
    var j = Game.state.job;
    if (!Object.prototype.hasOwnProperty.call(j, "pendingApplication")) j.pendingApplication = null;
    if (!Object.prototype.hasOwnProperty.call(j, "pendingOffer")) j.pendingOffer = null;
    if (!Array.isArray(j.rejections)) j.rejections = [];
    if (!j.hidden || typeof j.hidden !== "object") {
      j.hidden = {};
    }
    if (!j.levels) {
      j.levels = {
        barista: { level: 0, xp: 0 },
        office: { level: 0, xp: 0 },
        trainDriver: { level: 0, xp: 0 }
      };
      // If there was an existing level/xp on the current job from an older save,
      // seed the corresponding entry.
      if (j.current && j.current !== "none" && j.levels[j.current]) {
        j.levels[j.current].level = j.level || 0;
        j.levels[j.current].xp = j.xp || 0;
      }
    }
    // Ensure all known jobs have entries
    for (var id in Game.Jobs.defs) {
      if (!Game.Jobs.defs.hasOwnProperty(id)) continue;
      if (id === "none") continue;
      if (!j.levels[id]) {
        j.levels[id] = { level: 0, xp: 0 };
      }
    }
  },
  _getMinuteOfDay: function () {
    var tm = (Game.state && typeof Game.state.timeMinutes === "number" && isFinite(Game.state.timeMinutes)) ? Game.state.timeMinutes : 0;
    if (tm < 0) tm = 0;
    return Math.floor(tm % (24 * 60));
  },
  _fmtClockFromMinutes: function (minuteOfDay) {
    var m = typeof minuteOfDay === "number" && isFinite(minuteOfDay) ? Math.floor(minuteOfDay) : 0;
    if (m < 0) m = 0;
    m = m % (24 * 60);
    var hh = Math.floor(m / 60);
    var mm = m % 60;
    return (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
  },
  _pushRejection: function (jobId, message) {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    var day = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 1;
    if (day < 1) day = 1;
    var minuteOfDay = Game.Jobs._getMinuteOfDay();
    var def = Game.Jobs.defs[jobId] || null;
    var entry = {
      jobId: String(jobId || ""),
      jobName: def ? def.name : String(jobId || "Job"),
      day: day,
      minuteOfDay: minuteOfDay,
      clock: Game.Jobs._fmtClockFromMinutes(minuteOfDay),
      message: message ? String(message) : "Rejected."
    };
    j.rejections.unshift(entry);
    var maxKeep = typeof Game.Jobs.maxRejectionLog === "number" ? Math.floor(Game.Jobs.maxRejectionLog) : 10;
    if (!isFinite(maxKeep) || maxKeep < 1) maxKeep = 10;
    if (j.rejections.length > maxKeep) j.rejections.length = maxKeep;
  },
  _checkJobEligibility: function (id) {
    var def = Game.Jobs.defs[id];
    if (!def) return { ok: false, message: "Unknown job." };
    if (id === "none") return { ok: true };
    var eduLevel = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
    if (eduLevel < (def.minEducation || 0)) {
      return { ok: false, message: "Requires education level " + (def.minEducation || 0) + "." };
    }
    if (def.requiresJob) {
      var req = Game.Jobs.defs[def.requiresJob];
      var reqName = req ? req.name : def.requiresJob;
      var reqLevel = def.requiresJobLevel || 0;
      var info = Game.Jobs.getJobLevelInfo(def.requiresJob);
      if ((info.level || 0) < reqLevel) {
        return { ok: false, message: "Requires " + reqName + " level " + reqLevel + "." };
      }
    }
    return { ok: true };
  },
  _isJobOfferedHere: function (location, jobId) {
    var loc = location || (Game.state.travelLocation || "Home");
    Game.Jobs.ensureJobOffersContainer();
    var offers = (Game.state.jobOffers && Array.isArray(Game.state.jobOffers[loc])) ? Game.state.jobOffers[loc] : [];
    offers = Game.Jobs.filterVisibleOffers(loc, offers);
    for (var i = 0; i < offers.length; i++) {
      if (offers[i] === jobId) return true;
    }
    return false;
  },
  applyForJob: function (id) {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    var jobId = String(id || "");
    if (!jobId || jobId === "none") return;
    if (j.isWorking) {
      Game.addNotification("Finish your current shift before applying.");
      return;
    }
    if (Game.blockIfSleeping && Game.blockIfSleeping("apply for jobs")) return;
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before applying.");
      return;
    }
    if (Game.state.school && Game.state.school.enrolled) {
      Game.addNotification("Finish your current course before applying.");
      return;
    }
    if (j.pendingApplication) {
      Game.addNotification("You already have a job application in progress.");
      return;
    }
    if (j.pendingOffer) {
      Game.addNotification("You have a job offer waiting. Respond to it first.");
      return;
    }
    if (j.current === jobId) {
      Game.addNotification("You already have that job.");
      return;
    }
    var here = Game.state.travelLocation || "Home";
    if (!Game.Jobs._isJobOfferedHere(here, jobId)) {
      Game.addNotification("That job is not being offered here today.");
      return;
    }
    var check = Game.Jobs._checkJobEligibility(jobId);
    if (!check.ok) {
      Game.addNotification(check.message || "You do not qualify for that job.");
      return;
    }
    var min = typeof Game.Jobs.applicationMinMinutes === "number" ? Game.Jobs.applicationMinMinutes : 30;
    var max = typeof Game.Jobs.applicationMaxMinutes === "number" ? Game.Jobs.applicationMaxMinutes : 120;
    if (!isFinite(min) || min < 5) min = 5;
    if (!isFinite(max) || max < min) max = min;
    var total = min + Math.floor(Math.random() * (max - min + 1));
    var day = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 1;
    if (day < 1) day = 1;
    j.pendingApplication = {
      jobId: jobId,
      location: here,
      totalMinutes: total,
      remainingMinutes: total,
      startedDay: day,
      startedMinuteOfDay: Game.Jobs._getMinuteOfDay()
    };
    var def = Game.Jobs.defs[jobId];
    Game.addNotification("Application submitted for " + (def ? def.name : jobId) + ".");
    if (typeof UI !== "undefined" && UI && UI.currentTab === "jobs" && UI.renderCurrentTab) {
      UI.renderCurrentTab();
    }
  },
  cancelJobApplication: function () {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    if (!j.pendingApplication) {
      Game.addNotification("No job application to cancel.");
      return;
    }
    var jobId = j.pendingApplication.jobId;
    j.pendingApplication = null;
    var def = Game.Jobs.defs[jobId] || null;
    Game.addNotification("Cancelled application for " + (def ? def.name : jobId) + ".");
  },
  acceptPendingOffer: function () {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    if (!j.pendingOffer || !j.pendingOffer.jobId) {
      Game.addNotification("No job offer to accept.");
      return;
    }
    var jobId = j.pendingOffer.jobId;
    j.pendingOffer = null;
    Game.Jobs.setJob(jobId);
  },
  rejectPendingOffer: function () {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    if (!j.pendingOffer || !j.pendingOffer.jobId) {
      Game.addNotification("No job offer to reject.");
      return;
    }
    var jobId = j.pendingOffer.jobId;
    j.pendingOffer = null;
    Game.Jobs._pushRejection(jobId, "You rejected the offer.");
    Game.addNotification("You rejected the job offer.");
  },
  _resolveJobApplication: function (app) {
    var jobId = app && app.jobId ? String(app.jobId) : "";
    if (!jobId) return;
    var def = Game.Jobs.defs[jobId] || null;

    var eduLevel = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
    var minEdu = def && typeof def.minEducation === "number" ? def.minEducation : 0;
    var overEdu = Math.max(0, (eduLevel || 0) - (minEdu || 0));
    var chance = 0.65 + Math.min(0.25, overEdu * 0.05);
    if (def && def.requiresJob) chance -= 0.10;
    if (chance < 0.15) chance = 0.15;
    if (chance > 0.95) chance = 0.95;

    var check = Game.Jobs._checkJobEligibility(jobId);
    if (!check.ok) chance = 0;

    var ok = Math.random() < chance;
    if (ok) {
      var exp = typeof Game.Jobs.offerExpireMinutes === "number" ? Game.Jobs.offerExpireMinutes : 360;
      if (!isFinite(exp) || exp < 15) exp = 15;
      Game.state.job.pendingOffer = {
        jobId: jobId,
        totalMinutes: exp,
        remainingMinutes: exp,
        createdDay: (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1,
        createdMinuteOfDay: Game.Jobs._getMinuteOfDay()
      };
      Game.addNotification("Job offer received: " + (def ? def.name : jobId) + ".");
    } else {
      Game.Jobs._pushRejection(jobId, check && check.message ? check.message : ("Application rejected by " + (def ? def.name : "employer") + "."));
      Game.addNotification("Application rejected: " + (def ? def.name : jobId) + ".");
    }
  },
  getJobLevelInfo: function (id) {
    Game.Jobs.ensureJobProgress();
    var j = Game.state.job;
    if (!id || id === "none") {
      return { level: 0, xp: 0 };
    }
    var entry = j.levels && j.levels[id] ? j.levels[id] : { level: 0, xp: 0 };
    return {
      level: entry.level || 0,
      xp: entry.xp || 0
    };
  },
  setJob: function (id) {
    var def = Game.Jobs.defs[id];
    if (!def) return;
    if (def.location && Game.state.travelLocation !== def.location) {
      // Special rule: barista can always be selected while at Home.
      if (!(id === "barista" && Game.state.travelLocation === "Home")) {
        Game.addNotification("You must be at " + def.location + " to take the " + def.name + " job.");
        return;
      }
    }
    if (id !== "none" && Game.state.education.level < def.minEducation) {
      Game.addNotification("You don't meet the education requirements for " + def.name + ".");
      return;
    }
    if (id !== "none" && def.requiresJob) {
      var req = Game.Jobs.defs[def.requiresJob];
      var reqName = req ? req.name : def.requiresJob;
      var info = Game.Jobs.getJobLevelInfo(def.requiresJob);
      var reqLevel = def.requiresJobLevel || 0;
      if ((info.level || 0) < reqLevel) {
        Game.addNotification("You need to reach level " + reqLevel + " as " + reqName + " to take " + def.name + ".");
        return;
      }
    }
    if (Game.state.job.isWorking) {
      Game.addNotification("Finish your current shift before changing jobs.");
      return;
    }
    Game.Jobs.ensureJobProgress();
    Game.state.job.current = id;
    // Never allow the current job to be hidden.
    if (Game.state.job.hidden && Object.prototype.hasOwnProperty.call(Game.state.job.hidden, id)) {
      delete Game.state.job.hidden[id];
    }
    // When changing jobs, load the stored level/xp for that role into the main job fields
    var info = Game.Jobs.getJobLevelInfo(id);
    Game.state.job.level = info.level;
    Game.state.job.xp = info.xp;
    Game.addNotification("You are now working as: " + def.name);
  },
  startShift: function () {
    var j = Game.state.job;
    if (j.current === "none") {
      Game.addNotification("You don't have a job yet.");
      return;
    }
    if (Game.blockIfSleeping && Game.blockIfSleeping("start a work shift")) return;
    if (j.isWorking) {
      Game.addNotification("You're already on a shift.");
      return;
    }
    if (Game.state.school && Game.state.school.enrolled) {
      Game.addNotification("Finish your current course before starting a work shift.");
      return;
    }
    if (Game.state.travel && Game.state.travel.inProgress) {
      Game.addNotification("Finish travelling before starting a work shift.");
      return;
    }
    if (Game.state.energy < 25) {
      Game.addNotification("Too exhausted to start a shift. Rest or visit healthcare.");
      return;
    }
    j.isWorking = true;
    j.shiftMinutes = 0;
    // Track education-related job runs for Prestige (jobs requiring education level > 0).
    var def = Game.Jobs.defs[j.current];
    if (def && typeof def.minEducation === "number" && def.minEducation > 0) {
      if (Game.Prestige && typeof Game.Prestige.recordEduJobRun === "function") {
        Game.Prestige.recordEduJobRun(j.current);
      }
    }
    if (j.current === "trainDriver") {
      Game.state.trainJob.isOnShift = true;
      Game.state.trainJob.safetyStrikes = 0;
      Game.addNotification("You climb into the steam locomotive. Manage coal, pressure and speed!");
    } else {
      Game.addNotification("Shift started as " + Game.Jobs.defs[j.current].name);
    }
  },
  endShift: function (reason) {
    var j = Game.state.job;
    if (!j.isWorking) return;
    j.isWorking = false;
    if (j.current === "trainDriver") {
      Game.state.trainJob.isOnShift = false;
    }
    if (reason) {
      Game.addNotification("Shift ended: " + reason);
    } else {
      Game.addNotification("You finish your shift.");
    }
    if (typeof UI !== "undefined" && UI.currentTab === "jobs" && UI.renderCurrentTab) {
      UI.renderCurrentTab();
    }
  },
  tick: function (minutes) {
    var j = Game.state.job;
    Game.Jobs.ensureJobProgress();
    // Hiring pipeline (applications/offers) runs even when not working.
    if (j.pendingApplication && typeof j.pendingApplication.remainingMinutes === "number") {
      j.pendingApplication.remainingMinutes -= minutes;
      if (j.pendingApplication.remainingMinutes <= 0) {
        var app = j.pendingApplication;
        j.pendingApplication = null;
        Game.Jobs._resolveJobApplication(app);
        if (typeof UI !== "undefined" && UI && UI.currentTab === "jobs" && UI.renderCurrentTab) {
          UI.renderCurrentTab();
        }
      }
    }
    if (j.pendingOffer && typeof j.pendingOffer.remainingMinutes === "number") {
      j.pendingOffer.remainingMinutes -= minutes;
      if (j.pendingOffer.remainingMinutes <= 0) {
        var jobId2 = j.pendingOffer.jobId;
        j.pendingOffer = null;
        Game.Jobs._pushRejection(jobId2, "Offer expired.");
        Game.addNotification("Job offer expired.");
        if (typeof UI !== "undefined" && UI && UI.currentTab === "jobs" && UI.renderCurrentTab) {
          UI.renderCurrentTab();
        }
      }
    }

    if (!j.isWorking || j.current === "none") return;
    if (typeof j.pendingWages !== "number") j.pendingWages = 0;
    j.shiftMinutes += minutes;
    var id = j.current;
    var levelInfo = Game.Jobs.getJobLevelInfo(id);
    var level = levelInfo.level;
    var wage = Game.Economy.wages[id] || 0;
    var levelMult = 1 + level * 0.15;
    var payPerMinute = (wage * levelMult) / 60;
    var effectivePay = payPerMinute * minutes;
    if (id === "trainDriver") {
      effectivePay = Game.Jobs.trainDriverTick(minutes, payPerMinute);
      // trainDriverTick can end the shift (e.g. unsafe driving). If so, stop ticking immediately.
      if (!j.isWorking) return;
    }
    if (Game.Prestige && typeof Game.Prestige.getWageMultiplier === "function") {
      effectivePay *= Game.Prestige.getWageMultiplier();
    }
    j.pendingWages += effectivePay;
    var xpGain = minutes * 0.3;
    if (Game.Prestige && typeof Game.Prestige.getJobXpMultiplier === "function") {
      xpGain *= Game.Prestige.getJobXpMultiplier();
    }
    // Evening Foundation (and higher education) improves on-the-job learning:
    // +10% job XP gain per education level, compounded.
    var eduLevel = (Game.state.education && typeof Game.state.education.level === "number") ? Game.state.education.level : 0;
    if (eduLevel > 0) {
      xpGain *= Math.pow(1.10, eduLevel);
    }
    var levels = j.levels[id];
    if (!levels) {
      levels = { level: level, xp: 0 };
      j.levels[id] = levels;
    }
    levels.xp += xpGain;
    var skillKey = Game.Jobs.defs[id].skill;
    if (skillKey) {
      Game.state.stats[skillKey] += minutes * 0.1;
    }
    var neededForLevel = Game.Jobs.getXpRequiredForNextLevel(id, levels.level);
    while (levels.xp >= neededForLevel) {
      levels.xp -= neededForLevel;
      levels.level += 1;
      Game.addNotification("Promotion! " + Game.Jobs.defs[id].name + " level " + levels.level);
      neededForLevel = Game.Jobs.getXpRequiredForNextLevel(id, levels.level);
    }
    // Keep the primary job fields in sync for UI convenience
    j.level = levels.level;
    j.xp = levels.xp;
    var energyDrain = minutes * 0.15;
    if (Game.Prestige && typeof Game.Prestige.getWorkEnergyCostMultiplier === "function") {
      energyDrain *= Game.Prestige.getWorkEnergyCostMultiplier();
    }
    Game.state.energy -= energyDrain;
    if (Game.state.energy < 0) Game.state.energy = 0;
    Game.state.hunger += minutes * 0.05;
    if (Game.state.hunger > 100) Game.state.hunger = 100;
    if (Game.state.energy <= 10) {
      Game.Jobs.endShift("too exhausted (energy critically low)");
      return;
    }
    if (j.shiftMinutes >= 8 * 60) {
      Game.Jobs.endShift("completed full shift");
    }
  },
  trainDriverTick: function (minutes, basePayPerMinute) {
    var t = Game.state.trainJob;
    t.coal -= t.coalFeed * (minutes / 8);
    if (t.coal < 0) t.coal = 0;
    var pressureChange = t.coalFeed * 0.9 * (minutes / 10) - 0.6 * (minutes / 10);
    t.pressure += pressureChange;
    if (t.pressure < 5) t.pressure = 5;
    if (t.pressure > 110) t.pressure = 110;
    var targetSpeed = t.throttle * 1.4;
    var speedDelta = (targetSpeed - t.speed) * 0.15 * (minutes / 5);
    t.speed += speedDelta;
    if (t.speed < 0) t.speed = 0;
    if (t.speed > 140) t.speed = 140;
    if (t.coal <= 0) {
      t.pressure -= 3 * (minutes / 5);
      if (t.pressure < 0) t.pressure = 0;
    }
    var unsafe = false;
    if (t.pressure > 95 || t.pressure < 20 || t.speed > 110 || t.speed < 25) {
      unsafe = true;
    }
    if (unsafe) {
      t.safetyStrikes += minutes / 10;
      if (t.safetyStrikes >= 3) {
        Game.addNotification("Safety incident! Train inspector fines you.");
        Game.spendMoney(120, "Safety penalty");
        Game.Jobs.endShift("removed from train for unsafe driving");
        return 0;
      }
    } else if (t.safetyStrikes > 0) {
      t.safetyStrikes -= minutes / 20;
      if (t.safetyStrikes < 0) t.safetyStrikes = 0;
    }
    var pay = 0;
    if (!unsafe && t.pressure >= 35 && t.pressure <= 85 && t.speed >= 45 && t.speed <= 90) {
      var quality = 1 - (Math.abs(t.speed - 65) / 40);
      if (quality < 0) quality = 0;
      pay = basePayPerMinute * minutes * (0.7 + quality * 0.6);
    }
    return pay;
  },
  daily: function () {
    var j = Game.state.job;
    if (!j) return;
    if (typeof j.pendingWages !== "number" || j.pendingWages <= 0) {
      j.pendingWages = 0;
    } else {
      var id = j.current;
      var def = Game.Jobs.defs[id] || null;
      var label = def ? def.name : "Job";
      Game.addMoney(j.pendingWages, "Daily wages: " + label);
      j.pendingWages = 0;
    }
    // Refresh job offers for all locations at the end of each day
    Game.Jobs.refreshLocationJobOffersDaily();
  }
};

Game.registerDailyIncomeHandler(Game.Jobs.daily);
