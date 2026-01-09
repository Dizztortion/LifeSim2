(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({ id: "desktop", title: "Dashboard", sub: "Status", emoji: "🖥️", window: { w: 560, h: 520 } });
})();

