(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "av_northshield",
    title: "NorthShield",
    sub: "Endpoint Protection",
    emoji: "🛡️",
    window: { w: 640, h: 520 },
    install: { id: "av_northshield", sizeMb: 71, name: "NorthShield Security", kind: "pc_app_av_northshield", downloadId: "pc-app-av-northshield" }
  });
})();

