(function () {
  window.UI = window.UI || {};
  window.Game = window.Game || {};

  var UI = window.UI;
  var Game = window.Game;

  function normalizeAppId(appId) {
    var id = String(appId || "");
    if (!id) return "";
    if (id.indexOf("download:") === 0) return "download";
    if (id.indexOf("textedit:") === 0) return "textedit";
    var colon = id.indexOf(":");
    if (colon > 0) return id.substring(0, colon);
    return id;
  }

  function safeCopy(obj) {
    if (!obj || typeof obj !== "object") return null;
    return JSON.parse(JSON.stringify(obj));
  }

  var store = {
    defs: [],
    byId: {}
  };

  function register(def) {
    if (!def || typeof def !== "object") return;
    var id = String(def.id || "").trim();
    if (!id) return;
    var copy = Object.assign({}, def);
    copy.id = id;
    if (!copy.title) copy.title = id;
    if (!copy.emoji) copy.emoji = "💠";
    store.byId[id] = copy;
    // Preserve order in `defs` without duplicates.
    for (var i = 0; i < store.defs.length; i++) {
      if (store.defs[i] && store.defs[i].id === id) {
        store.defs[i] = copy;
        return;
      }
    }
    store.defs.push(copy);
  }

  function getDef(appId) {
    var id = normalizeAppId(appId);
    return store.byId[id] || null;
  }

  function getAll() {
    // Return a copy so callers don't mutate the registry.
    return store.defs.map(function (d) { return Object.assign({}, d); });
  }

  function getTitle(appId) {
    var d = getDef(appId);
    return d ? String(d.title || d.id || "") : "";
  }

  function getInstallDef(appId) {
    var d = getDef(appId);
    return d && d.install ? safeCopy(d.install) : null;
  }

  function getWindowRect(appId) {
    var d = getDef(appId);
    return d && d.window ? safeCopy(d.window) : null;
  }

  UI.PCApps = UI.PCApps || {};
  Object.assign(UI.PCApps, {
    normalizeAppId: normalizeAppId,
    register: register,
    getDef: getDef,
    getAll: getAll
  });

  Game.PCApps = Game.PCApps || {};
  Object.assign(Game.PCApps, {
    normalizeAppId: normalizeAppId,
    register: register,
    getDef: getDef,
    getAll: getAll,
    getTitle: getTitle,
    getInstallDef: getInstallDef,
    getWindowRect: getWindowRect
  });
})();

