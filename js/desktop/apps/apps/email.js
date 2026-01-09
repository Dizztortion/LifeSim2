(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({
    id: "email",
    title: "Email",
    sub: "Inbox",
    emoji: "✉️",
    window: { w: 740, h: 560 },
    install: { id: "email", sizeMb: 18, name: "Email Client", kind: "pc_app_email", downloadId: "pc-app-email" }
  });
})();

