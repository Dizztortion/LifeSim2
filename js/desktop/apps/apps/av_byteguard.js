(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "av_byteguard",
    title: "ByteGuard",
    sub: "Security Suite",
    emoji: "🧿",
    window: { w: 640, h: 520 },
    install: { id: "av_byteguard", sizeMb: 62, name: "ByteGuard Security", kind: "pc_app_av_byteguard", downloadId: "pc-app-av-byteguard" }
  });
})();

