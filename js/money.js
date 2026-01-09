// Money helpers for the main player wallet.
// Depends on Game.state and Game.addNotification (notifications.js).

Game.addMoney = function (amount, reason) {
  Game.state.money += amount;
  if (reason) {
    Game.addNotification((amount >= 0 ? "+$" : "-$") + Math.abs(amount).toFixed(2) + " (" + reason + ")");
  }
  if (window.UI && UI.animateNumber) {
    UI.animateNumber("money", Game.state.money);
  }
};

Game.spendMoney = function (amount, reason) {
  if (Game.state.money < amount) {
    return false;
  }
  Game.state.money -= amount;
  if (reason && typeof reason === "string" && reason.toLowerCase().indexOf("tax") !== -1) {
    if (typeof Game.state.taxPoolUsd !== "number" || !isFinite(Game.state.taxPoolUsd) || Game.state.taxPoolUsd < 0) {
      Game.state.taxPoolUsd = 0;
    }
    Game.state.taxPoolUsd += amount;
    Game.state.taxPoolUsd = Math.round(Game.state.taxPoolUsd * 100) / 100;
  }
  if (reason) {
    Game.addNotification("-$" + amount.toFixed(2) + " (" + reason + ")");
  }
  if (window.UI && UI.animateNumber) {
    UI.animateNumber("money", Game.state.money);
  }
  return true;
};
