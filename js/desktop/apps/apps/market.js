(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "market",
    title: "Online Market",
    sub: "Shop",
    emoji: "🛒",
    window: { w: 760, h: 560 },
    install: { id: "market", sizeMb: 38, name: "Online Market", kind: "pc_app_market", downloadId: "pc-app-market" }
  });
})();

