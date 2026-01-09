(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({ id: "inventory", title: "Inventory", sub: "Items", emoji: "🎒", window: { w: 660, h: 520 } });
})();

