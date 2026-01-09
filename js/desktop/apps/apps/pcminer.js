(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "pcminer",
    title: "PC Mining",
    sub: "Miner",
    emoji: "⚙️",
    window: { w: 640, h: 520 },
    install: { id: "pcminer", sizeMb: 41.2, name: "PC Miner", kind: "pc_app_pcminer", downloadId: "pc-app-pcminer" }
  });
})();

