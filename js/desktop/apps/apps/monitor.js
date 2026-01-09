(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({ id: "monitor", title: "Task Manager", sub: "Processes", emoji: "📊", window: { w: 420, h: 420 } });
})();

