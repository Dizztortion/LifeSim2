(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "av_sentinel",
    title: "Sentinel AV",
    sub: "Antivirus",
    emoji: "🛡️",
    window: { w: 640, h: 520 },
    install: { id: "av_sentinel", sizeMb: 54, name: "Sentinel AV", kind: "pc_app_av_sentinel", downloadId: "pc-app-av-sentinel" }
  });
})();

