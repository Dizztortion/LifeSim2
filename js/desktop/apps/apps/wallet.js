(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({ id: "wallet", title: "Wallet", sub: "BTC", emoji: "👛", window: { w: 620, h: 520 } });
})();

