(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "casino",
    title: "Casino",
    sub: "Slots",
    emoji: "🎰",
    window: { w: 760, h: 560 },
    install: { id: "casino", sizeMb: 62, name: "Casino Client", kind: "pc_app_casino", downloadId: "pc-app-casino" }
  });
})();

