(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "propertynews",
    title: "Property News",
    sub: "Listings",
    emoji: "🏠",
    window: { w: 740, h: 560 },
    install: { id: "propertynews", sizeMb: 24, name: "Property News", kind: "pc_app_propertynews", downloadId: "pc-app-propertynews" }
  });
})();

