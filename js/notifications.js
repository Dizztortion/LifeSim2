// Notification categorisation and logging.
// Depends on Game.state being initialised in core.js.

Game.getNotificationArea = function (text) {
  var t = (text || "").toLowerCase();
  // Bank & loans
  if (t.indexOf("bank") !== -1 || t.indexOf("loan") !== -1 || t.indexOf("interest") !== -1) return "bank";
  // BTC & crypto
  if (t.indexOf("btc") !== -1 || t.indexOf("mining rig") !== -1 || t.indexOf("wallet") !== -1 || t.indexOf("satoshi") !== -1 || t.indexOf("cloud contract") !== -1) {
    return "btc";
  }
  // Companies
  if (t.indexOf("retail shop") !== -1 || t.indexOf("mining corp") !== -1 || t.indexOf("rail logistics") !== -1 || t.indexOf("business funds") !== -1 || t.indexOf("delivery") !== -1) {
    return "companies";
  }
  // Jobs & wages
  if (t.indexOf("job") !== -1 || t.indexOf("shift") !== -1 || t.indexOf("wage") !== -1 || t.indexOf("promotion") !== -1 || t.indexOf("train driver") !== -1) {
    return "jobs";
  }
  // School / education
  if (t.indexOf("school") !== -1 || t.indexOf("course") !== -1 || t.indexOf("education") !== -1 || t.indexOf("class") !== -1 || t.indexOf("study") !== -1) {
    return "school";
  }
  // Property & tenants
  if (t.indexOf("property") !== -1 || t.indexOf("tenant") !== -1 || t.indexOf("rent") !== -1 || t.indexOf("maintenance") !== -1 || t.indexOf("tax") !== -1) {
    return "property";
  }
  // Health & food
  if (t.indexOf("health") !== -1 || t.indexOf("doctor") !== -1 || t.indexOf("hospital") !== -1 || t.indexOf("snack") !== -1 || t.indexOf("meal") !== -1 || t.indexOf("hunger") !== -1 || t.indexOf("energy") !== -1) {
    return "health";
  }
  // Travel & locations
  if (t.indexOf("travel") !== -1 || t.indexOf("location") !== -1 || t.indexOf("city centre") !== -1 || t.indexOf("industrial park") !== -1 || t.indexOf("countryside") !== -1) {
    return "travel";
  }
  // Shops & purchases
  if (t.indexOf("shop") !== -1 || t.indexOf("bought") !== -1 || t.indexOf("sold") !== -1 || t.indexOf("inventory") !== -1 || t.indexOf("energy drink") !== -1) {
    return "shop";
  }
  // System / meta
  if (t.indexOf("save") !== -1 || t.indexOf("loaded") !== -1 || t.indexOf("autosave") !== -1 || t.indexOf("settings") !== -1 || t.indexOf("error") !== -1) {
    return "system";
  }
  return "general";
};

Game.addNotification = function (text, area) {
  var entry = {
    text: text,
    day: Game.state.day,
    timeMinutes: Game.state.timeMinutes,
    area: area || Game.getNotificationArea(text)
  };
  entry.createdAtMs = Date.now ? Date.now() : (new Date().getTime());
  if (!Game.state.notifications || !Array.isArray(Game.state.notifications)) {
    Game.state.notifications = [];
  }
  if (!Game.state.notificationLog || !Array.isArray(Game.state.notificationLog)) {
    Game.state.notificationLog = [];
  }
  Game.state.notifications.unshift(entry);
  if (Game.state.notifications.length > 6) {
    Game.state.notifications.pop();
  }
  Game.state.notificationLog.unshift(entry);
  var maxLog = 300;
  if (Game.state.notificationLog.length > maxLog) {
    Game.state.notificationLog.length = maxLog;
  }

  if (Game && typeof Game.trySendDesktopNotification === "function") {
    Game.trySendDesktopNotification(entry);
  }
};

Game.trySendDesktopNotification = function (entry) {
  try {
    if (!entry) return;
    if (!Game || !Game.state) return;
    if (!Game.state.desktopNotifications || typeof Game.state.desktopNotifications !== "object") return;
    if (!Game.state.desktopNotifications.enabled) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    var title = "LifeSim";
    var body = String(entry.text || "");
    if (!body) return;

    var n = new Notification(title, {
      body: body,
      tag: "lifesim_" + String(entry.createdAtMs || Date.now()),
      renotify: false
    });
    if (n) {
      n.onclick = function () {
        try { window.focus(); } catch (e) {}
        try { n.close(); } catch (e3) {}
      };
    }
    setTimeout(function () {
      try { if (n && typeof n.close === "function") n.close(); } catch (e) {}
    }, 8000);
  } catch (e) {
    // Ignore: desktop notifications are optional and browser-dependent.
  }
};
