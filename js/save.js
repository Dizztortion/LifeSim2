Game.parseVersion = function (v) {
  var base = String(v || "0.0.0").split("-")[0];
  var parts = base.split(".");
  return [
    parseInt(parts[0], 10) || 0,
    parseInt(parts[1], 10) || 0,
    parseInt(parts[2], 10) || 0
  ];
};

Game.compareVersion = function (a, b) {
  var pa = Game.parseVersion(a);
  var pb = Game.parseVersion(b);
  for (var i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
};

Game.applyStateDefaults = function (state, template) {
  if (!state || !template) return;
  for (var key in template) {
    if (!Object.prototype.hasOwnProperty.call(template, key)) continue;
    var tVal = template[key];
    if (typeof state[key] === "undefined") {
      state[key] = JSON.parse(JSON.stringify(tVal));
      continue;
    }
    if (tVal && typeof tVal === "object" && !Array.isArray(tVal)) {
      if (!state[key] || typeof state[key] !== "object" || Array.isArray(state[key])) {
        state[key] = JSON.parse(JSON.stringify(tVal));
        continue;
      }
      Game.applyStateDefaults(state[key], tVal);
    }
  }
};

Game.stateMigrations = [
  // Add versioned migrations here as stateTemplate evolves.
];

Game.migrateState = function (state) {
  if (!state) return;
  var from = typeof state.version === "string" ? state.version : "0.0.0";
  var target = Game.stateTemplate && Game.stateTemplate.version ? Game.stateTemplate.version : from;
  if (Game.stateMigrations && Game.stateMigrations.length) {
    for (var i = 0; i < Game.stateMigrations.length; i++) {
      var m = Game.stateMigrations[i];
      if (!m || typeof m.to !== "string" || typeof m.fn !== "function") continue;
      if (Game.compareVersion(from, m.to) < 0 && Game.compareVersion(m.to, target) <= 0) {
        m.fn(state);
        from = m.to;
      }
    }
  }
  state.version = target;
};

Game.save = function (silent) {
  try {
    var data = JSON.stringify(Game.state);
    localStorage.setItem("lifesim_full_state", data);
    if (!silent) {
      Game.addNotification("Game saved.");
    }
  } catch (e) {
    console.error(e);
  }
};

Game.load = function () {
  try {
    var raw = localStorage.getItem("lifesim_full_state");
    if (!raw) return;
    var data = JSON.parse(raw);
    Game.migrateState(data);
    Game.applyStateDefaults(data, Game.stateTemplate);
    Game.state = data;
    if (Game.Downloads && typeof Game.Downloads.ensureState === "function") {
      Game.Downloads.ensureState();
    }
    if (Game.Btc && typeof Game.Btc.ensureWalletState === "function") {
      Game.Btc.ensureWalletState();
    }
    if (Game.Btc && typeof Game.Btc.ensureMiningRewardScale === "function") {
      Game.Btc.ensureMiningRewardScale();
    }
    if (Game.PC && typeof Game.PC.ensureState === "function") {
      Game.PC.ensureState();
    }
    if (Game.Casino && typeof Game.Casino.ensureState === "function") {
      Game.Casino.ensureState();
    }
    if (Game.Crypto && typeof Game.Crypto.ensureState === "function") {
      Game.Crypto.ensureState();
    }
    if (Game.Companies && typeof Game.Companies.ensureState === "function") {
      Game.Companies.ensureState();
    } else if (Game.Companies && typeof Game.Companies.ensureUnlocks === "function") {
      Game.Companies.ensureUnlocks();
    }
    if (Game.Prestige && typeof Game.Prestige.ensureState === "function") {
      Game.Prestige.ensureState();
    }
    if (Game.Bank && typeof Game.Bank.getState === "function") {
      Game.Bank.getState();
    }
    if (!Game.state.quests || typeof Game.state.quests !== "object") {
      Game.state.quests = { claimed: {}, progressBase: {} };
    }
    if (!Game.state.quests.claimed || typeof Game.state.quests.claimed !== "object") {
      Game.state.quests.claimed = {};
    }
    if (!Game.state.quests.progressBase || typeof Game.state.quests.progressBase !== "object") {
      Game.state.quests.progressBase = {};
    }
    for (var qid in Game.state.quests.claimed) {
      if (!Object.prototype.hasOwnProperty.call(Game.state.quests.claimed, qid)) continue;
      var val = Game.state.quests.claimed[qid];
      if (typeof val !== "number") {
        Game.state.quests.claimed[qid] = val ? 1 : 0;
      }
    }
    if (typeof Game.state.notificationToastSeconds !== "number" || !isFinite(Game.state.notificationToastSeconds)) {
      Game.state.notificationToastSeconds = 10;
    } else {
      Game.state.notificationToastSeconds = Math.max(1, Math.min(60, Math.round(Game.state.notificationToastSeconds)));
    }
    if (!Game.state.desktopNotifications || typeof Game.state.desktopNotifications !== "object") {
      Game.state.desktopNotifications = { prompted: false, enabled: false };
    }
    if (typeof Game.state.desktopNotifications.prompted !== "boolean") {
      Game.state.desktopNotifications.prompted = !!Game.state.desktopNotifications.prompted;
    }
    if (typeof Game.state.desktopNotifications.enabled !== "boolean") {
      Game.state.desktopNotifications.enabled = !!Game.state.desktopNotifications.enabled;
    }
    Game.addNotification("Save loaded.");
  } catch (e) {
    console.error(e);
  }
};
