Game.PC = {
  ensureState: function () {
    if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };

    // Window manager (desktop-style UI).
    if (!Array.isArray(Game.state.pc.windows)) Game.state.pc.windows = [];
    if (typeof Game.state.pc.nextWindowId !== "number" || !isFinite(Game.state.pc.nextWindowId) || Game.state.pc.nextWindowId < 1) {
      Game.state.pc.nextWindowId = 1;
    }
    if (typeof Game.state.pc.zCounter !== "number" || !isFinite(Game.state.pc.zCounter) || Game.state.pc.zCounter < 1) {
      Game.state.pc.zCounter = 50;
    }
    if (typeof Game.state.pc.activeWindowId !== "number" || !isFinite(Game.state.pc.activeWindowId)) {
      Game.state.pc.activeWindowId = 0;
    }
    // Normalize window flags.
    for (var wi = 0; wi < Game.state.pc.windows.length; wi++) {
      var ww = Game.state.pc.windows[wi];
      if (!ww) continue;
      if (typeof ww.minimized !== "boolean") ww.minimized = false;
      if (typeof ww.maximized !== "boolean") ww.maximized = false;
      if (typeof ww.restoreX !== "number" || !isFinite(ww.restoreX)) ww.restoreX = null;
      if (typeof ww.restoreY !== "number" || !isFinite(ww.restoreY)) ww.restoreY = null;
      if (typeof ww.restoreW !== "number" || !isFinite(ww.restoreW)) ww.restoreW = null;
      if (typeof ww.restoreH !== "number" || !isFinite(ww.restoreH)) ww.restoreH = null;
      // Downloads have a fixed size and cannot be maximized.
      if (String(ww.appId || "").indexOf("download:") === 0) {
        var rect = Game.PC._getDefaultWindowRect(ww.appId);
        ww.maximized = false;
        ww.restoreX = null;
        ww.restoreY = null;
        ww.restoreW = null;
        ww.restoreH = null;
        ww.w = rect.w;
        ww.h = rect.h;
      }
    }

    // App installs (some apps must be downloaded before use).
    if (!Game.state.pc.apps || typeof Game.state.pc.apps !== "object") Game.state.pc.apps = {};
    if (!Game.state.pc.apps.installed || typeof Game.state.pc.apps.installed !== "object") Game.state.pc.apps.installed = {};
    if (!Game.state.pc.apps.installing || typeof Game.state.pc.apps.installing !== "object") Game.state.pc.apps.installing = {};
    if (typeof Game.state.pc.apps._initialized !== "boolean") Game.state.pc.apps._initialized = false;
    if (!Game.state.pc.apps._initialized) {
      // Defaults: core apps are present; other apps are downloaded from their websites.
      // Keep the browser installed so the player can actually download apps.
      var core = ["desktop", "wallet", "inventory", "mining", "cloud", "internet", "antivirus", "tools", "monitor", "textedit"];
      for (var ci = 0; ci < core.length; ci++) {
        if (typeof Game.state.pc.apps.installed[core[ci]] !== "boolean") Game.state.pc.apps.installed[core[ci]] = true;
      }
      var needsDownload = ["pcminer", "market", "casino", "propertynews", "email", "av_sentinel", "av_byteguard", "av_northshield"];
      for (var ni = 0; ni < needsDownload.length; ni++) {
        if (typeof Game.state.pc.apps.installed[needsDownload[ni]] !== "boolean") Game.state.pc.apps.installed[needsDownload[ni]] = false;
      }
      Game.state.pc.apps._initialized = true;
    }

    // Desktop icon layout (movable icons).
    if (!Game.state.pc.desktop || typeof Game.state.pc.desktop !== "object") Game.state.pc.desktop = {};
    if (!Game.state.pc.desktop.icons || typeof Game.state.pc.desktop.icons !== "object") Game.state.pc.desktop.icons = {};
    if (!Array.isArray(Game.state.pc.desktop.pinnedApps)) Game.state.pc.desktop.pinnedApps = [];
    if (!Array.isArray(Game.state.pc.desktop.desktopApps)) {
      // Default desktop shortcuts: keep it minimal; everything else lives in Start.
      Game.state.pc.desktop.desktopApps = ["internet", "monitor", "textedit"];
    }
    if (typeof Game.state.pc.desktop.lockToGrid !== "boolean") Game.state.pc.desktop.lockToGrid = false;
    if (typeof Game.state.pc.uiStartMenuOpen !== "boolean") Game.state.pc.uiStartMenuOpen = false;
    if (typeof Game.state.pc._migratedWindows !== "boolean") Game.state.pc._migratedWindows = false;
    if (!Game.state.pc._migratedWindows && Game.state.pc.windows.length === 0) {
      Game.state.pc._migratedWindows = true;
      var initialApp = String(Game.state.pc.activeApp || "desktop");
      var rect = Game.PC._getDefaultWindowRect(initialApp);
      Game.state.pc.zCounter = (Game.state.pc.zCounter || 1) + 1;
      var migratedWin = {
        id: Game.state.pc.nextWindowId,
        appId: initialApp,
        title: Game.PC.getAppTitle(initialApp),
        x: 90,
        y: 70,
        w: rect.w,
        h: rect.h,
        z: Game.state.pc.zCounter,
        minimized: false
      };
      Game.state.pc.nextWindowId += 1;
      Game.state.pc.windows.push(migratedWin);
      Game.state.pc.activeWindowId = migratedWin.id;
    }

    // Motherboard + RAM (rolled once per save when missing)
    if (typeof Game.state.pc.motherboardTier !== "number") {
      // 1 in 20 chance for a better motherboard.
      Game.state.pc.motherboardTier = (Math.random() < (1 / 20)) ? 1 : 0;
    }
    if (typeof Game.state.pc.ramLevel !== "number" || Game.state.pc.ramLevel < 0) {
      Game.state.pc.ramLevel = 0;
    }

    // Storage level is derived from capacity if missing.
    if (typeof Game.state.pc.storageCapacityMb !== "number") Game.state.pc.storageCapacityMb = 20000;
    if (typeof Game.state.pc.storageLevel !== "number" || Game.state.pc.storageLevel < 0) {
      var derived = Math.round((Game.state.pc.storageCapacityMb - 20000) / 50000);
      if (!isFinite(derived) || derived < 0) derived = 0;
      Game.state.pc.storageLevel = derived;
    }

    // Enforce motherboard capacity limits on disk if present.
    var maxStorageMb = Game.PC.getMaxStorageMb();
    if (Game.state.pc.storageCapacityMb > maxStorageMb) Game.state.pc.storageCapacityMb = maxStorageMb;
    if (typeof Game.state.pc.storageUsedMb !== "number") Game.state.pc.storageUsedMb = 0;
    if (Game.state.pc.storageUsedMb > Game.state.pc.storageCapacityMb) {
      Game.state.pc.storageUsedMb = Game.state.pc.storageCapacityMb;
    }

    // Keep capacity consistent with storage level (but never shrink below actual used).
    var maxStorageLevel = Game.PC.getMaxStorageLevel();
    if (Game.state.pc.storageLevel > maxStorageLevel) Game.state.pc.storageLevel = maxStorageLevel;
    var wantedCap = Game.PC.getStorageCapacityForLevel(Game.state.pc.storageLevel);
    if (wantedCap > maxStorageMb) wantedCap = maxStorageMb;
    if (wantedCap < Game.state.pc.storageUsedMb) wantedCap = Game.state.pc.storageUsedMb;
    Game.state.pc.storageCapacityMb = wantedCap;

    // Enforce RAM cap by motherboard.
    var maxRamLevel = Game.PC.getMaxRamLevel();
    if (Game.state.pc.ramLevel > maxRamLevel) Game.state.pc.ramLevel = maxRamLevel;

    // Basic file system stats (used by AntiVirus and System Cleaner).
    if (typeof Game.state.pc.filesCount !== "number" || Game.state.pc.filesCount < 0) Game.state.pc.filesCount = 0;
    if (typeof Game.state.pc.systemLogFiles !== "number" || Game.state.pc.systemLogFiles < 0) Game.state.pc.systemLogFiles = 0;
    if (typeof Game.state.pc.systemLogsMb !== "number" || Game.state.pc.systemLogsMb < 0) Game.state.pc.systemLogsMb = 0;
    if (typeof Game.state.pc.eventLogFiles !== "number" || Game.state.pc.eventLogFiles < 0) Game.state.pc.eventLogFiles = 0;
    if (typeof Game.state.pc.eventLogMb !== "number" || Game.state.pc.eventLogMb < 0) Game.state.pc.eventLogMb = 0;
    if (typeof Game.state.pc.browserCacheMb !== "number" || Game.state.pc.browserCacheMb < 0) Game.state.pc.browserCacheMb = 0;
    if (typeof Game.state.pc.tempFilesMb !== "number" || Game.state.pc.tempFilesMb < 0) Game.state.pc.tempFilesMb = 0;
    if (typeof Game.state.pc.cleanerInstalled !== "boolean") Game.state.pc.cleanerInstalled = false;

    if (!Game.state.pc.antivirus || typeof Game.state.pc.antivirus !== "object") {
      Game.state.pc.antivirus = { isOn: true, isScanning: false, scanProgress: 0, cpuPct: 1, ramMb: 220 };
    }
    var a = Game.state.pc.antivirus;
    if (typeof a.vendor !== "string" || !a.vendor) a.vendor = "builtin";
    if (typeof a.isOn !== "boolean") a.isOn = true;
    if (typeof a.realTimeProtection !== "boolean") a.realTimeProtection = true;
    if (typeof a.cloudProtection !== "boolean") a.cloudProtection = true;
    if (typeof a.firewall !== "boolean") a.firewall = true;
    if (typeof a.isScanning !== "boolean") a.isScanning = false;
    if (typeof a.scanProgress !== "number") a.scanProgress = 0;
    if (typeof a.scanType !== "string" || !a.scanType) a.scanType = "quick";
    if (typeof a.scanTargetFiles !== "number") a.scanTargetFiles = 0;
    if (typeof a.scanStartedMinute !== "number") a.scanStartedMinute = -1;
    if (typeof a.cpuPct !== "number") a.cpuPct = 1;
    if (typeof a.ramMb !== "number") a.ramMb = 220;
    if (typeof a.lastUpdateDay !== "number") a.lastUpdateDay = 0;
    if (typeof a.lastUpdateMinute !== "number") a.lastUpdateMinute = 0;
    if (typeof a.defsVersion !== "string" || !a.defsVersion) a.defsVersion = "0.0.0";
    if (typeof a.engineVersion !== "string" || !a.engineVersion) a.engineVersion = "4.2.1";
    if (typeof a.pendingUpdate !== "boolean") a.pendingUpdate = false;
    if (typeof a.updateProgress !== "number") a.updateProgress = 0;
    if (typeof a.updateDownloadId !== "string") a.updateDownloadId = null;
    if (a.updateDownloadId === "") a.updateDownloadId = null;
    if (typeof a.filesScanned !== "number") a.filesScanned = 0;
    if (typeof a.threatsDetected !== "number") a.threatsDetected = 0;
    if (typeof a.lastScanDay !== "number") a.lastScanDay = 0;
    if (typeof a.lastScanMinute !== "number") a.lastScanMinute = 0;
    if (typeof a.lastScanThreats !== "number") a.lastScanThreats = 0;
    if (typeof a.lastRealtimeDetectDay !== "number") a.lastRealtimeDetectDay = 0;
    if (typeof a.lastRealtimeDetectMinute !== "number") a.lastRealtimeDetectMinute = 0;
    if (typeof a.quarantinedCount !== "number") a.quarantinedCount = 0;
    if (!Array.isArray(a.quarantine)) a.quarantine = [];
    if (!Array.isArray(a.history)) a.history = [];
    if (typeof a.level !== "number" || !isFinite(a.level) || a.level < 1) a.level = 1;

    // Resume an in-progress definitions download after reload.
    if (Game.Downloads && Game.Downloads.getById) {
      var defsDl = Game.Downloads.getById("av-definitions");
      if (defsDl && defsDl.status === "downloading") {
        a.pendingUpdate = true;
        a.updateDownloadId = defsDl.id;
      }
    }

    // Lightweight file system for desktop files (e.g., .text files).
    if (Game.PCFiles && Game.PCFiles.ensureState) Game.PCFiles.ensureState();
  },
  _writeFileMb: function (mb, bucket) {
    if (!Game.PCStorage || !Game.PCStorage.canWriteMb || !Game.PCStorage.writeMb) return false;
    if (typeof mb !== "number" || !isFinite(mb) || mb <= 0) return false;
    if (!Game.PCStorage.canWriteMb(mb)) return false;
    Game.PCStorage.writeMb(mb);
    var pc = Game.state.pc;
    if (bucket === "system") pc.systemLogsMb += mb;
    else if (bucket === "event") pc.eventLogMb += mb;
    else if (bucket === "cache") pc.browserCacheMb += mb;
    else pc.tempFilesMb += mb;
    return true;
  },
  createNonPcClickFile: function (secondsOnPage) {
    Game.PC.ensureState();
    // Almost every non-PC interaction creates a tiny system/event log file.
    if (Math.random() > 0.97) return;
    var pc = Game.state.pc;
    var isEvent = Math.random() < 0.35;
    var dt = (typeof secondsOnPage === "number" && isFinite(secondsOnPage)) ? secondsOnPage : 0;
    if (dt < 0) dt = 0;
    if (dt > 120) dt = 120;
    var kb = 1 + Math.random() * 18 + dt * (0.15 + Math.random() * 0.35);
    if (kb > 180) kb = 180;
    var mb = kb / 1000;
    var ok = Game.PC._writeFileMb(mb, isEvent ? "event" : "system");
    if (!ok) return;
    pc.filesCount += 1;
    if (isEvent) pc.eventLogFiles += 1;
    else pc.systemLogFiles += 1;
  },
  cleanSystem: function (opts) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var o = opts || {};
    var freed = 0;

    function freeBucket(mb) {
      if (mb > 0 && Game.PCStorage && Game.PCStorage.freeMb) {
        Game.PCStorage.freeMb(mb);
        freed += mb;
      }
    }

    if (o.clearCache) {
      freeBucket(pc.browserCacheMb || 0);
      pc.browserCacheMb = 0;
    }
    if (o.clearTemp) {
      freeBucket(pc.tempFilesMb || 0);
      pc.tempFilesMb = 0;
    }
    if (o.clearSystemLogs) {
      freeBucket(pc.systemLogsMb || 0);
      pc.systemLogsMb = 0;
      pc.systemLogFiles = 0;
    }
    if (o.clearEventLog) {
      freeBucket(pc.eventLogMb || 0);
      pc.eventLogMb = 0;
      pc.eventLogFiles = 0;
      if (Array.isArray(Game.state.notificationLog)) Game.state.notificationLog = [];
      if (Array.isArray(Game.state.notifications)) Game.state.notifications = [];
    }
    if (o.resetWalletSync && Game.state && Game.state.btc && Game.state.btc.wallet) {
      var w = Game.state.btc.wallet;
      if (typeof w.chainStorageMb === "number" && w.chainStorageMb > 0) {
        freeBucket(w.chainStorageMb);
        w.chainStorageMb = 0;
      }
      if (w.syncDownloadId && Game.Downloads && Game.Downloads.remove) {
        Game.Downloads.remove(w.syncDownloadId);
      }
      w.syncDownloadId = null;
      w.isSyncing = false;
      w.syncProgress = 0;
      w.chainHeight = 0;
    }

    // Adjust total file count loosely based on what was removed.
    var removedFiles = 0;
    if (o.clearCache) removedFiles += Math.floor((freed * 1000) / 8);
    if (o.clearTemp) removedFiles += Math.floor((freed * 1000) / 12);
    if (o.clearSystemLogs) removedFiles += 50;
    if (o.clearEventLog) removedFiles += 25;
    pc.filesCount = Math.max(0, (pc.filesCount || 0) - removedFiles);

    return freed;
  },
  getMotherboardDef: function () {
    // Tier 0: common board. Tier 1: rare "better motherboard".
    // Slots are informational for now; caps are used for upgrades and limits.
    var pc = (Game.state && Game.state.pc) ? Game.state.pc : {};
    var tier = pc.motherboardTier || 0;
    if (tier >= 1) {
      return {
        tier: 1,
        name: "Enthusiast motherboard",
        cpuSlots: 2,
        gpuSlots: 2,
        ramSlots: 4,
        storageSlots: 2
      };
    }
    return {
      tier: 0,
      name: "Standard motherboard",
      cpuSlots: 1,
      gpuSlots: 1,
      ramSlots: 2,
      storageSlots: 1
    };
  },
  getMaxCpuLevel: function () {
    var mb = Game.PC.getMotherboardDef();
    return 4 + Math.max(0, (mb.cpuSlots || 1) - 1) * 2;
  },
  getMaxGpuLevel: function () {
    var mb = Game.PC.getMotherboardDef();
    return 4 + Math.max(0, (mb.gpuSlots || 1) - 1) * 2;
  },
  getMaxRamLevel: function () {
    var mb = Game.PC.getMotherboardDef();
    return 4 + Math.max(0, (mb.ramSlots || 2) - 2);
  },
  getMaxStorageMb: function () {
    var mb = Game.PC.getMotherboardDef();
    return 120000 * Math.max(1, (mb.storageSlots || 1));
  },
  getMaxStorageLevel: function () {
    // Each level adds +50 000 MB over the 20 000 MB base.
    var maxMb = Game.PC.getMaxStorageMb();
    var lvl = Math.floor((maxMb - 20000) / 50000);
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    return lvl;
  },
  getStorageCapacityForLevel: function (level) {
    var lvl = typeof level === "number" ? level : 0;
    if (!isFinite(lvl) || lvl < 0) lvl = 0;
    return 20000 + lvl * 50000;
  },
  getRamCapacityMb: function () {
    Game.PC.ensureState();
    var level = Game.state.pc.ramLevel || 0;
    var max = Game.PC.getMaxRamLevel();
    if (level > max) level = max;
    var caps = [1024, 2048, 4096, 8192, 16384, 32768, 65536];
    if (level < 0) level = 0;
    if (level >= caps.length) level = caps.length - 1;
    return caps[level];
  },
  toggle: function () {
    Game.PC.ensureState();
    Game.state.pc.isOpen = !Game.state.pc.isOpen;
    if (Game.state.pc.isOpen && (!Game.state.pc.windows || Game.state.pc.windows.length === 0)) {
      Game.PC.openApp("desktop");
    }
  },
  getAppTitle: function (id) {
    var appId = String(id || "desktop");
    // Support dynamic app IDs like `textedit:<fileId>`.
    if (appId.indexOf("textedit:") === 0) {
      try {
        var fid = parseInt(appId.replace(/^textedit:/, ""), 10);
        var f = (Game.PCFiles && Game.PCFiles.getById) ? Game.PCFiles.getById(fid) : null;
        return f && f.name ? ("Text Editor \u00b7 " + f.name) : "Text Editor";
      } catch (e) {
        return "Text Editor";
      }
    }
    // Prefer registry titles when available.
    var base = (Game.PCApps && Game.PCApps.normalizeAppId) ? Game.PCApps.normalizeAppId(appId) : appId;
    var regTitle = (Game.PCApps && Game.PCApps.getTitle) ? Game.PCApps.getTitle(base) : "";
    if (regTitle) return regTitle;
    if (appId === "desktop") return "Dashboard";
    if (appId === "wallet") return "Wallet";
    if (appId === "inventory") return "Inventory";
    if (appId === "mining") return "Mining Rig";
    if (appId === "cloud") return "Cloud Mining";
    if (appId === "market") return "Online Market";
    if (appId === "internet") return "Internet";
    if (appId === "pcminer") return "PC Mining";
    if (appId === "antivirus") return "AntiVirus";
    if (appId === "tools") return "Tools";
    if (appId === "cleaner") return "System Cleaner";
    if (appId === "casino") return "Casino";
    if (appId === "propertynews") return "Property News";
    if (appId === "email") return "Email";
    if (appId === "monitor") return "Task Manager";
    if (appId === "textedit") return "Text Editor";
    if (appId === "av_sentinel") return "Sentinel AV";
    if (appId === "av_byteguard") return "ByteGuard";
    if (appId === "av_northshield") return "NorthShield";
    return appId;
  },
  getAppInstallDef: function (id) {
    var appId = String(id || "");
    var base = (Game.PCApps && Game.PCApps.normalizeAppId) ? Game.PCApps.normalizeAppId(appId) : appId;
    var reg = (Game.PCApps && Game.PCApps.getInstallDef) ? Game.PCApps.getInstallDef(base) : null;
    if (reg) return reg;
    if (appId === "cleaner") return { id: appId, sizeMb: 24, name: "System Cleaner", kind: "pc_tool_cleaner", downloadId: "pc-system-cleaner" };
    if (appId === "internet") return { id: appId, sizeMb: 6.45, name: "Web Browser", kind: "pc_app_internet", downloadId: "pc-app-internet" };
    if (appId === "pcminer") return { id: appId, sizeMb: 41.2, name: "PC Miner", kind: "pc_app_pcminer", downloadId: "pc-app-pcminer" };
    if (appId === "market") return { id: appId, sizeMb: 38, name: "Online Market", kind: "pc_app_market", downloadId: "pc-app-market" };
    if (appId === "casino") return { id: appId, sizeMb: 62, name: "Casino Client", kind: "pc_app_casino", downloadId: "pc-app-casino" };
    if (appId === "propertynews") return { id: appId, sizeMb: 24, name: "Property News", kind: "pc_app_propertynews", downloadId: "pc-app-propertynews" };
    if (appId === "email") return { id: appId, sizeMb: 18, name: "Email Client", kind: "pc_app_email", downloadId: "pc-app-email" };
    if (appId === "av_sentinel") return { id: appId, sizeMb: 54, name: "Sentinel AV", kind: "pc_app_av_sentinel", downloadId: "pc-app-av-sentinel" };
    if (appId === "av_byteguard") return { id: appId, sizeMb: 62, name: "ByteGuard Security", kind: "pc_app_av_byteguard", downloadId: "pc-app-av-byteguard" };
    if (appId === "av_northshield") return { id: appId, sizeMb: 71, name: "NorthShield Security", kind: "pc_app_av_northshield", downloadId: "pc-app-av-northshield" };
    return null;
  },
  isAppInstalled: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var def = Game.PC.getAppInstallDef(appId);
    if (!def) return true;
    if (appId === "cleaner") return !!(Game.state.pc && Game.state.pc.cleanerInstalled);
    return !!(Game.state.pc.apps && Game.state.pc.apps.installed && Game.state.pc.apps.installed[appId]);
  },
  startAppInstall: function (id, opts) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var def = Game.PC.getAppInstallDef(appId);
    if (!def) return null;
    if (Game.PC.isAppInstalled(appId)) return null;
    if (!Game.Downloads || !Game.Downloads.startFileDownload || !Game.Downloads.getById) return null;

    var existing = Game.Downloads.getById(def.downloadId);
    if (existing && existing.status === "downloading") {
      Game.state.pc.apps.installing[appId] = def.downloadId;
      return existing;
    }
    var d = Game.Downloads.startFileDownload({
      id: def.downloadId,
      kind: def.kind,
      name: def.name,
      sizeMb: def.sizeMb,
      minimized: !(opts && opts.minimized === false)
    });
    if (!d) return null;
    Game.state.pc.apps.installing[appId] = d.id;
    Game.addNotification("Downloading " + def.name + " (" + Math.round(def.sizeMb) + " MB)...");
    return d;
  },
  _getDefaultWindowRect: function (appId) {
    var id = String(appId || "desktop");
    // Allow registry overrides.
    var base = (Game.PCApps && Game.PCApps.normalizeAppId) ? Game.PCApps.normalizeAppId(id) : id;
    var regRect = (Game.PCApps && Game.PCApps.getWindowRect) ? Game.PCApps.getWindowRect(base) : null;
    if (regRect && typeof regRect.w === "number" && typeof regRect.h === "number") return regRect;
    if (id.indexOf("download:") === 0) return { w: 560, h: 440 };
    if (id === "desktop") return { w: 560, h: 520 };
    if (id === "wallet") return { w: 620, h: 520 };
    if (id === "inventory") return { w: 660, h: 520 };
    if (id === "mining") return { w: 720, h: 560 };
    if (id === "cloud") return { w: 700, h: 540 };
    if (id === "market") return { w: 760, h: 560 };
    if (id === "internet") return { w: 760, h: 560 };
    if (id === "pcminer") return { w: 640, h: 520 };
    if (id === "antivirus") return { w: 640, h: 520 };
    if (id === "tools") return { w: 660, h: 540 };
    if (id === "cleaner") return { w: 660, h: 560 };
    if (id === "email") return { w: 740, h: 560 };
    if (id === "casino") return { w: 760, h: 560 };
    if (id === "propertynews") return { w: 740, h: 560 };
    if (id === "monitor") return { w: 420, h: 420 };
    if (id === "textedit" || id.indexOf("textedit:") === 0) return { w: 720, h: 560 };
    return { w: 620, h: 520 };
  },
  _createWindowState: function (appId, opts) {
    var pc = Game.state.pc;
    var id = String(appId || "desktop");
    var rect = Game.PC._getDefaultWindowRect(id);
    var cascade = pc.windows ? pc.windows.length : 0;
    var x = 90 + (cascade % 8) * 22;
    var y = 70 + (cascade % 8) * 18;
    var bringToFront = !!(opts && opts.bringToFront);
    var z = bringToFront ? (pc.zCounter = (pc.zCounter || 1) + 1) : (pc.zCounter || 1);
    var winId = pc.nextWindowId || 1;
    pc.nextWindowId = winId + 1;
    return {
      id: winId,
      appId: id,
      title: Game.PC.getAppTitle(id),
      x: x,
      y: y,
      w: rect.w,
      h: rect.h,
      z: z,
      minimized: false
    };
  },
  getWindowById: function (winId) {
    Game.PC.ensureState();
    var id = typeof winId === "number" ? winId : parseInt(winId, 10);
    if (!isFinite(id)) return null;
    var list = Game.state.pc.windows || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  },
  findWindowByApp: function (appId) {
    Game.PC.ensureState();
    var id = String(appId || "");
    var list = Game.state.pc.windows || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].appId === id) return list[i];
    }
    return null;
  },
  isAppOpen: function (appId) {
    return !!Game.PC.findWindowByApp(appId);
  },
  focusWindow: function (winId) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var w = Game.PC.getWindowById(winId);
    if (!w) return;
    w.minimized = false;
    pc.zCounter = (pc.zCounter || 1) + 1;
    w.z = pc.zCounter;
    pc.activeWindowId = w.id;
    pc.activeApp = w.appId;
  },
  minimizeWindow: function (winId) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var w = Game.PC.getWindowById(winId);
    if (!w) return;
    w.minimized = true;
    if (pc.activeWindowId === w.id) {
      pc.activeWindowId = 0;
      pc.activeApp = "desktop";
    }
  },
  toggleMaximizeWindow: function (winId, bounds) {
    Game.PC.ensureState();
    var w = Game.PC.getWindowById(winId);
    if (!w) return;
    if (String(w.appId || "").indexOf("download:") === 0) return;
    if (w.minimized) w.minimized = false;

    if (w.maximized) {
      w.maximized = false;
      if (typeof w.restoreX === "number" && isFinite(w.restoreX) &&
        typeof w.restoreY === "number" && isFinite(w.restoreY) &&
        typeof w.restoreW === "number" && isFinite(w.restoreW) &&
        typeof w.restoreH === "number" && isFinite(w.restoreH)) {
        w.x = w.restoreX;
        w.y = w.restoreY;
        w.w = w.restoreW;
        w.h = w.restoreH;
      } else {
        // Fallback: restore to the app's default size/position.
        var rect0 = Game.PC._getDefaultWindowRect(w.appId);
        w.x = 90;
        w.y = 70;
        w.w = rect0.w;
        w.h = rect0.h;
      }
      w.restoreX = null;
      w.restoreY = null;
      w.restoreW = null;
      w.restoreH = null;
      Game.PC.focusWindow(w.id);
      return;
    }

    // Store restore rect.
    w.restoreX = (typeof w.x === "number" && isFinite(w.x)) ? w.x : 0;
    w.restoreY = (typeof w.y === "number" && isFinite(w.y)) ? w.y : 0;
    w.restoreW = (typeof w.w === "number" && isFinite(w.w)) ? w.w : 620;
    w.restoreH = (typeof w.h === "number" && isFinite(w.h)) ? w.h : 520;

    var bw = bounds && typeof bounds.w === "number" && isFinite(bounds.w) ? bounds.w : null;
    var bh = bounds && typeof bounds.h === "number" && isFinite(bounds.h) ? bounds.h : null;
    if (bw === null || bh === null) {
      // Fallback: maximize to a sane size if no bounds were provided.
      bw = Math.max(420, w.restoreW);
      bh = Math.max(320, w.restoreH);
    }
    w.x = 0;
    w.y = 0;
    w.w = bw;
    w.h = bh;
    w.maximized = true;
    Game.PC.focusWindow(w.id);
  },
  closeWindow: function (winId) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var id = typeof winId === "number" ? winId : parseInt(winId, 10);
    if (!isFinite(id)) return;
    var list = pc.windows || [];
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] && list[i].id === id) {
        list.splice(i, 1);
        break;
      }
    }
    if (pc.activeWindowId === id) {
      pc.activeWindowId = 0;
      pc.activeApp = "desktop";
    }
  },
  openApp: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "desktop");
    var pc = Game.state.pc;
    pc.isOpen = true;

    // Gate apps that need installing.
    if (!Game.PC.isAppInstalled(appId)) {
      Game.PC.startAppInstall(appId, { minimized: true });
      // Show downloads so the player understands what's happening.
      appId = "monitor";
    }

    // Antivirus vendor apps: after install, they open the shared AntiVirus UI but set branding/vendor.
    if (appId === "av_sentinel" || appId === "av_byteguard" || appId === "av_northshield") {
      if (pc.antivirus && typeof pc.antivirus === "object") pc.antivirus.vendor = appId;
      appId = "antivirus";
    }

    // Apps are single-instance for now: focus if already open.
    var existing = Game.PC.findWindowByApp(appId);
    if (existing) {
      Game.PC.focusWindow(existing.id);
    } else {
      var w = Game.PC._createWindowState(appId, { bringToFront: true });
      if (w) {
        pc.windows.push(w);
        Game.PC.focusWindow(w.id);
      }
    }

    // Side-effects that used to happen when switching pages.
    if (appId === "internet") {
      pc.promptDailyFreeSpins = true;
    }
    if (appId === "wallet" && Game.Btc && Game.Btc.openWallet) {
      Game.Btc.openWallet();
    }
  },
  openAppNew: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "desktop");
    // Gate installs but still allow opening Task Manager to watch downloads.
    if (!Game.PC.isAppInstalled(appId)) {
      Game.PC.startAppInstall(appId, { minimized: true });
      appId = "monitor";
    }
    if (appId === "av_sentinel" || appId === "av_byteguard" || appId === "av_northshield") {
      if (Game.state.pc.antivirus && typeof Game.state.pc.antivirus === "object") Game.state.pc.antivirus.vendor = appId;
      appId = "antivirus";
    }
    var pc = Game.state.pc;
    pc.isOpen = true;
    var w = Game.PC._createWindowState(appId, { bringToFront: true });
    if (w) {
      pc.windows.push(w);
      Game.PC.focusWindow(w.id);
    }
  },
  pinApp: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    if (!appId) return;
    var pins = Game.state.pc.desktop.pinnedApps;
    for (var i = 0; i < pins.length; i++) if (pins[i] === appId) return;
    pins.push(appId);
  },
  unpinApp: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var pins = Game.state.pc.desktop.pinnedApps;
    for (var i = pins.length - 1; i >= 0; i--) {
      if (pins[i] === appId) pins.splice(i, 1);
    }
  },
  isPinned: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var pins = Game.state.pc.desktop.pinnedApps;
    for (var i = 0; i < pins.length; i++) if (pins[i] === appId) return true;
    return false;
  },
  isOnDesktop: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var list = Game.state.pc.desktop.desktopApps || [];
    for (var i = 0; i < list.length; i++) if (list[i] === appId) return true;
    return false;
  },
  addToDesktop: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    if (!appId) return;
    var list = Game.state.pc.desktop.desktopApps;
    for (var i = 0; i < list.length; i++) if (list[i] === appId) return;
    list.push(appId);
  },
  removeFromDesktop: function (id) {
    Game.PC.ensureState();
    var appId = String(id || "");
    var list = Game.state.pc.desktop.desktopApps;
    for (var i = list.length - 1; i >= 0; i--) if (list[i] === appId) list.splice(i, 1);
  },
  _downloadAppId: function (downloadId) {
    return "download:" + String(downloadId || "");
  },
  openDownload: function (downloadId) {
    Game.PC.ensureState();
    var id = String(downloadId || "");
    if (!id) return;
    var pc = Game.state.pc;
    pc.isOpen = true;

    var appId = Game.PC._downloadAppId(id);
    var existing = Game.PC.findWindowByApp(appId);
    if (existing) {
      Game.PC.focusWindow(existing.id);
      return;
    }

    var d = (Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(id) : null;
    var title = "Download";
    if (d && (d.name || d.id)) title = "Download — " + String(d.name || d.id);

    var w = Game.PC._createWindowState(appId, { bringToFront: true });
    if (w) {
      w.title = title;
      pc.windows.push(w);
      Game.PC.focusWindow(w.id);
    }
  },
  openFile: function (fileId) {
    Game.PC.ensureState();
    if (!Game.PCFiles || !Game.PCFiles.getById) return;
    var f = Game.PCFiles.getById(fileId);
    if (!f) return;
    var ext = String(f.ext || (Game.PCFiles.extFromName ? Game.PCFiles.extFromName(f.name) : "")).toLowerCase();
    if (ext === "text") {
      Game.PC.openApp("textedit:" + f.id);
      return;
    }
    if (Game.addNotification) Game.addNotification("No app registered for ." + (ext || "?") + " files.");
  },
  toggleAntivirus: function () {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    a.isOn = !a.isOn;
    if (!a.isOn) {
      a.isScanning = false;
      a.scanProgress = 0;
    }
    Game.PC._avAddHistory({ type: "setting", title: "Protection " + (a.isOn ? "enabled" : "disabled"), detail: "" });
    Game.addNotification("AntiVirus " + (a.isOn ? "enabled" : "disabled") + ".");
  },
  setAntivirusOption: function (key, value) {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    var k = String(key || "");
    if (!k) return;
    var v = !!value;
    if (k === "realTimeProtection") a.realTimeProtection = v;
    else if (k === "cloudProtection") a.cloudProtection = v;
    else if (k === "firewall") a.firewall = v;
    else return;
    Game.PC._avAddHistory({ type: "setting", title: "Setting changed", detail: k + ": " + (v ? "On" : "Off") });
  },
  getAntivirusDefsVersion: function () {
    if (!Game || !Game.state) return "0.0.0";
    var yearIndex = (Game.getInGameYearIndex && typeof Game.getInGameYearIndex === "function") ? Game.getInGameYearIndex() : 1;
    var day = (typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 0;
    var hour = (typeof Game.state.timeMinutes === "number" && isFinite(Game.state.timeMinutes)) ? Math.floor((Game.state.timeMinutes || 0) / 60) : 0;
    if (day < 0) day = 0;
    if (hour < 0) hour = 0;
    return yearIndex + "." + day + "." + hour;
  },
  startAntivirusScan: function (opts) {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    if (!a.isOn) {
      Game.addNotification("Enable AntiVirus first.");
      return;
    }
    var o = opts || {};
    var scanType = String(o.scanType || a.scanType || "quick").toLowerCase();
    if (scanType !== "quick" && scanType !== "full" && scanType !== "custom") scanType = "quick";
    a.scanType = scanType;
    a.isScanning = true;
    a.scanProgress = 0;
    a.filesScanned = 0;
    a.threatsDetected = 0;
    a.scanStartedMinute = (typeof Game.state.timeMinutes === "number" && isFinite(Game.state.timeMinutes)) ? Math.floor(Game.state.timeMinutes) : -1;
    a.scanTargetFiles = 0;
    // Keep last result visible until the new scan completes.
    Game.addNotification("AntiVirus scan started.");
  },
  cancelAntivirusScan: function () {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    if (!a || !a.isScanning) return;
    a.isScanning = false;
    a.scanProgress = Math.max(0, Math.min(100, a.scanProgress || 0));
    Game.PC._avAddHistory({ type: "scan", title: "Scan stopped", detail: "Files scanned: " + Math.floor(a.filesScanned || 0) + "." });
    Game.addNotification("AntiVirus scan stopped.");
  },
  _avAddHistory: function (entry) {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    if (!a || !Array.isArray(a.history)) return;
    var e = entry || {};
    var day = (Game && Game.state && typeof Game.state.day === "number") ? Game.state.day : 0;
    var min = (Game && Game.state && typeof Game.state.timeMinutes === "number") ? Math.floor(Game.state.timeMinutes) : 0;
    a.history.unshift({
      day: day,
      minute: min,
      type: String(e.type || "event"),
      title: String(e.title || "Event"),
      detail: String(e.detail || "")
    });
    if (a.history.length > 40) a.history.length = 40;
  },
  _avQuarantineThreats: function (count, source) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var a = pc.antivirus;
    var n = typeof count === "number" && isFinite(count) ? Math.floor(count) : 0;
    if (n <= 0) return 0;

    function sev(i) {
      var r = Math.random();
      if (r < 0.18) return "High";
      if (r < 0.55) return "Medium";
      return "Low";
    }
    function threatName(i) {
      var names = ["PUA.CryptoMiner", "Adware.Injector", "Trojan.Dropper", "Riskware.RemoteAdmin", "Spyware.CookieStealer", "Exploit.Script", "Backdoor.Agent"];
      return names[i % names.length];
    }
    function threatPath(i) {
      var paths = [
        "C:\\Users\\Player\\AppData\\Local\\Temp\\",
        "C:\\Users\\Player\\AppData\\Roaming\\",
        "C:\\ProgramData\\",
        "C:\\Users\\Player\\Downloads\\",
        "C:\\Windows\\Temp\\"
      ];
      var base = paths[i % paths.length];
      var ext = (i % 4 === 0) ? ".exe" : ((i % 4 === 1) ? ".dll" : ((i % 4 === 2) ? ".js" : ".dat"));
      return base + "cache_" + (10000 + Math.floor(Math.random() * 89999)) + ext;
    }

    var quarantined = 0;
    for (var i = 0; i < n; i++) {
      var q = {
        id: "q-" + (Date.now ? Date.now() : (new Date().getTime())) + "-" + Math.floor(Math.random() * 100000),
        name: threatName(i),
        severity: sev(i),
        path: threatPath(i),
        action: "Quarantined",
        source: String(source || "Scan"),
        day: (Game && Game.state && typeof Game.state.day === "number") ? Game.state.day : 0,
        minute: (Game && Game.state && typeof Game.state.timeMinutes === "number") ? Math.floor(Game.state.timeMinutes) : 0
      };
      a.quarantine.unshift(q);
      quarantined += 1;
    }
    if (a.quarantine.length > 60) a.quarantine.length = 60;
    a.quarantinedCount += quarantined;

    // Reclaim some storage by removing temp + cache first.
    var quarantineMb = Math.min((pc.systemLogsMb || 0) + (pc.tempFilesMb || 0) + (pc.browserCacheMb || 0), 0.55 * quarantined + Math.random() * 1.4);
    if (quarantineMb > 0 && Game.PCStorage && Game.PCStorage.freeMb) {
      Game.PCStorage.freeMb(quarantineMb);
      var fromTemp = Math.min(pc.tempFilesMb || 0, quarantineMb);
      pc.tempFilesMb = Math.max(0, (pc.tempFilesMb || 0) - fromTemp);
      var left = quarantineMb - fromTemp;
      if (left > 0) {
        var fromCache = Math.min(pc.browserCacheMb || 0, left);
        pc.browserCacheMb = Math.max(0, (pc.browserCacheMb || 0) - fromCache);
        left -= fromCache;
      }
      if (left > 0) pc.systemLogsMb = Math.max(0, (pc.systemLogsMb || 0) - left);
    }

    return quarantined;
  },
  removeQuarantineItem: function (id) {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    var qid = String(id || "");
    if (!qid || !Array.isArray(a.quarantine)) return;
    for (var i = a.quarantine.length - 1; i >= 0; i--) {
      if (a.quarantine[i] && a.quarantine[i].id === qid) {
        a.quarantine.splice(i, 1);
        Game.PC._avAddHistory({ type: "quarantine", title: "Item removed", detail: qid });
        Game.addNotification("Quarantine item removed.");
        break;
      }
    }
  },
  restoreQuarantineItem: function (id) {
    Game.PC.ensureState();
    var pc = Game.state.pc;
    var a = pc.antivirus;
    var qid = String(id || "");
    if (!qid || !Array.isArray(a.quarantine)) return;
    for (var i = a.quarantine.length - 1; i >= 0; i--) {
      if (a.quarantine[i] && a.quarantine[i].id === qid) {
        a.quarantine.splice(i, 1);
        // Restoring reintroduces some file activity.
        Game.PC._writeFileMb(0.05 + Math.random() * 0.25, "temp");
        pc.filesCount += 1;
        Game.PC._avAddHistory({ type: "quarantine", title: "Item restored", detail: qid });
        Game.addNotification("Quarantine item restored.");
        break;
      }
    }
  },
  startAntivirusUpdate: function (opts) {
    Game.PC.ensureState();
    var a = Game.state.pc.antivirus;
    if (!Game || !Game.state) return null;
    var silent = !!(opts && opts.silent);
    var minimized = !(opts && opts.minimized === false);
    var day = Game.state.day || 0;
    if ((a.lastUpdateDay || 0) >= day) {
      if (!silent) Game.addNotification("AntiVirus definitions already up to date.");
      return null;
    }
    if (a.pendingUpdate) return null;
    if (!Game.Downloads || !Game.Downloads.startFileDownload) return null;

    var yearIndex = (Game.getInGameYearIndex && typeof Game.getInGameYearIndex === "function") ? Game.getInGameYearIndex() : 1;
    var sizeMb = Math.max(1, Math.round(yearIndex * 19));
    var d = Game.Downloads.startFileDownload({
      id: "av-definitions",
      kind: "av_defs",
      name: "AntiVirus definitions",
      sizeMb: sizeMb,
      minimized: minimized
    });
    if (!d) return null;
    a.pendingUpdate = true;
    a.updateProgress = 0;
    a.updateDownloadId = d.id;
    if (!silent) Game.addNotification("Downloading AntiVirus definitions (" + Math.round(sizeMb) + " MB)...");
    return d;
  },
  tick: function (seconds) {
    Game.PC.ensureState();
    if (typeof seconds !== "number" || seconds <= 0) return;
    var a = Game.state.pc.antivirus;
    if (!a.isOn) {
      a.cpuPct = 0;
      a.ramMb = 0;
      return;
    }

    // Auto update definitions for high AV levels.
    if ((a.level || 1) > 8 && !a.pendingUpdate) {
      var dday = Game.state.day || 0;
      if ((a.lastUpdateDay || 0) < dday) {
        Game.PC.startAntivirusUpdate({ silent: true, minimized: true });
      }
    }
    // Background file growth while PC is open (time-based), mainly cache/temp.
    if (Game.state.pc.isOpen) {
      var app = String(Game.state.pc.activeApp || "desktop");
      var mult = (app === "market" || app === "internet" || app === "wallet") ? 1.35 : 1.0;
      var cacheMb = (seconds * (0.002 + Math.random() * 0.006)) * mult;
      var tempMb = (seconds * (0.0008 + Math.random() * 0.003)) * (0.8 + mult * 0.3);
      Game.PC._writeFileMb(cacheMb, "cache");
      if (Math.random() < 0.35) Game.PC._writeFileMb(tempMb, "temp");
    }

    // Process tool downloads (System Cleaner install).
    if (Game.state.pc && Array.isArray(Game.state.pc.downloads)) {
      for (var di = Game.state.pc.downloads.length - 1; di >= 0; di--) {
        var d = Game.state.pc.downloads[di];
        if (!d || d.status !== "complete") continue;
        if (d.kind === "pc_tool_cleaner") {
          Game.state.pc.cleanerInstalled = true;
          Game.state.pc.downloads.splice(di, 1);
          Game.addNotification("System Cleaner installed.");
        }
        if (String(d.kind || "").indexOf("pc_app_") === 0) {
          var installedId = String(d.kind || "").replace(/^pc_app_/, "");
          if (installedId) {
            Game.state.pc.apps.installed[installedId] = true;
            if (Game.state.pc.apps.installing && Game.state.pc.apps.installing[installedId]) {
              delete Game.state.pc.apps.installing[installedId];
            }
            Game.state.pc.downloads.splice(di, 1);
            Game.addNotification((Game.PC.getAppTitle(installedId) || installedId) + " installed.");
          }
        }
      }
    }

    // Definitions update is a real download (manual unless AV level > 8).
    if (a.pendingUpdate) {
      var dlId = a.updateDownloadId;
      var d = (dlId && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(dlId) : null;
      if (!d) {
        a.pendingUpdate = false;
        a.updateProgress = 0;
        a.updateDownloadId = null;
      } else {
        var denom = Math.max(0.000001, d.totalMb || 1);
        var pct = ((d.downloadedMb || 0) / denom) * 100;
        if (!isFinite(pct) || pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        a.updateProgress = pct;
        if (d.status === "complete") {
          a.updateProgress = 100;
          a.pendingUpdate = false;
          a.updateDownloadId = null;
          a.lastUpdateDay = Game.state.day || a.lastUpdateDay;
          a.lastUpdateMinute = Math.floor(Game.state.timeMinutes || 0);
          a.defsVersion = Game.PC.getAntivirusDefsVersion();

          // Cleanup: definitions are applied, but the downloaded package doesn't persist.
          var written = typeof d.writtenMb === "number" ? d.writtenMb : 0;
          if (written > 0 && Game.PCStorage && Game.PCStorage.freeMb) {
            Game.PCStorage.freeMb(written);
          }
          if (Game.Downloads && Game.Downloads.remove) Game.Downloads.remove(d.id);

          Game.addNotification("AntiVirus definitions updated.");
          Game.PC._avAddHistory({ type: "update", title: "Definitions updated", detail: "Version " + a.defsVersion });
          // Definitions updates leave system logs.
          Game.PC._writeFileMb(0.4 + Math.random() * 0.8, "system");
        }
      }
    }

    // Real-time protection: occasional detections while the PC is in use.
    if (Game.state.pc.isOpen && a.realTimeProtection && !a.pendingUpdate && !a.isScanning) {
      var nowDay = Game.state.day || 0;
      var nowMin = Math.floor(Game.state.timeMinutes || 0);
      var throttle = (a.lastRealtimeDetectDay || 0) * (24 * 60) + (a.lastRealtimeDetectMinute || 0);
      var nowKey = nowDay * (24 * 60) + nowMin;
      if (nowKey - throttle > 6) {
        var pc = Game.state.pc;
        var outdated = (a.lastUpdateDay || 0) < nowDay;
        var risk = 0;
        if (outdated) risk += 1.0;
        risk += Math.min(1.8, (pc.browserCacheMb || 0) / 140);
        risk += Math.min(1.2, (pc.tempFilesMb || 0) / 120);
        if (Game && Game.state && Game.state.btc && Game.state.btc.pcMiner && Game.state.btc.pcMiner.isOn) risk += 0.6;
        if (risk > 0.8 && Math.random() < (0.0012 * risk * seconds)) {
          var q = Game.PC._avQuarantineThreats(1, "Real-time protection");
          if (q > 0) {
            a.lastRealtimeDetectDay = nowDay;
            a.lastRealtimeDetectMinute = nowMin;
            Game.PC._avAddHistory({ type: "rtp", title: "Threat quarantined", detail: "Real-time protection" });
            Game.addNotification("AntiVirus quarantined a threat.");
          }
        }
      }
    }

    // Scanning reads through files and can reclaim some space by quarantining threats.
    if (a.isOn && a.isScanning) {
      var pc = Game.state.pc;
      var available = Math.max(0, Math.floor(pc.filesCount || 0));
      if (available === 0) {
        a.scanProgress = 100;
        a.isScanning = false;
        a.threatsDetected = 0;
        a.lastScanDay = Game.state.day || a.lastScanDay;
        a.lastScanMinute = Math.floor(Game.state.timeMinutes || 0);
        a.lastScanThreats = 0;
        Game.PC._avAddHistory({ type: "scan", title: "Scan completed", detail: "No files were scanned." });
        Game.addNotification("AntiVirus scan completed.");
      } else {
        var type = String(a.scanType || "quick");
        var maxTarget = available;
        if (type === "quick") maxTarget = Math.min(available, 1200 + (a.level || 1) * 60);
        else if (type === "custom") maxTarget = Math.min(available, 4200 + (a.level || 1) * 120);
        if (!a.scanTargetFiles || a.scanTargetFiles < 1) a.scanTargetFiles = maxTarget;
        var target = Math.max(1, Math.min(maxTarget, Math.floor(a.scanTargetFiles)));
        a.scanTargetFiles = target;

        var baseRate = (type === "quick") ? 120 : (type === "full" ? 60 : 85);
        var rate = baseRate + Math.random() * 35 + (a.level || 1) * 3; // files per second
        a.filesScanned += seconds * rate;
        if (a.filesScanned > target) a.filesScanned = target;
        a.scanProgress = Math.floor((a.filesScanned / target) * 100);
        if (a.scanProgress >= 100) {
          a.scanProgress = 100;
          a.isScanning = false;
          a.lastScanDay = Game.state.day || a.lastScanDay;
          a.lastScanMinute = Math.floor(Game.state.timeMinutes || 0);

          var outdated = (a.lastUpdateDay || 0) < (Game.state.day || 0);
          var risk = 0;
          if (outdated) risk += 2.2;
          risk += Math.min(2.5, (pc.browserCacheMb || 0) / 120);
          risk += Math.min(2.0, (pc.tempFilesMb || 0) / 90);
          risk += Math.min(1.6, (pc.systemLogFiles || 0) / 1400);
          if (a.realTimeProtection) risk = Math.max(0, risk - 0.6);
          if (Game && Game.state && Game.state.btc && Game.state.btc.pcMiner && Game.state.btc.pcMiner.isOn) risk += 0.4;

          var thorough = (type === "full") ? 1.0 : (type === "custom" ? 0.85 : 0.65);
          var threats = Math.floor((risk * thorough) + (Math.random() * (1.8 + risk * 0.8)));
          if (threats < 0) threats = 0;
          if (threats > 18) threats = 18;
          a.threatsDetected = threats;
          a.lastScanThreats = threats;

          if (threats > 0) {
            var qn = Game.PC._avQuarantineThreats(threats, "Scan");
            Game.PC._avAddHistory({ type: "scan", title: "Scan completed", detail: qn + " threats quarantined." });
            Game.addNotification("AntiVirus scan completed. Threats detected: " + threats + ".");
          } else {
            Game.PC._avAddHistory({ type: "scan", title: "Scan completed", detail: "No threats found." });
            Game.addNotification("AntiVirus scan completed. No threats detected.");
          }
        }
      }
    }

    // Keep legacy fields stable for other UI (not shown on AV page anymore).
    a.cpuPct = a.isOn ? (0.8 + Math.random() * 2.2) : 0;
    a.ramMb = a.isOn ? (180 + Math.random() * 90) : 0;
    if (a.cpuPct < 0) a.cpuPct = 0;
    if (a.cpuPct > 95) a.cpuPct = 95;
    if (a.ramMb < 0) a.ramMb = 0;
  }
};

// Auto-updates only for higher-tier AV.
Game.registerDailyHandler(function () {
  if (!Game.PC || !Game.PC.ensureState) return;
  Game.PC.ensureState();
  var a = Game.state.pc.antivirus;
  if (!a) return;
  var day = Game.state.day || 0;
  var outdated = (a.lastUpdateDay || 0) < day;
  if (a.isOn && (a.level || 0) > 8 && outdated && !a.pendingUpdate) {
    Game.PC.startAntivirusUpdate({ silent: true, minimized: true });
  }
});
