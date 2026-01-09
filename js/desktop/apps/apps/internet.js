(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "internet",
    title: "Internet",
    sub: "Web",
    emoji: "🌐",
    window: { w: 760, h: 560 },
    install: { id: "internet", sizeMb: 6.45, name: "Web Browser", kind: "pc_app_internet", downloadId: "pc-app-internet" }
  });
})();

