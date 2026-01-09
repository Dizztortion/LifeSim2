(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "cleaner",
    title: "System Cleaner",
    sub: "Cleanup",
    emoji: "🧹",
    window: { w: 660, h: 560 },
    install: { id: "cleaner", sizeMb: 24, name: "System Cleaner", kind: "pc_tool_cleaner", downloadId: "pc-system-cleaner" }
  });
})();

