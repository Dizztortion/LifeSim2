// Daily meal storage, auto-consumption and hunger effects.
// Depends on Game.state, Game.addNotification, Game.registerDailyHandler.

Game.Meals = {
  ensureState: function () {
    var m = Game.state.meals;
    if (!m || typeof m !== "object") {
      Game.state.meals = {
        counts: { breakfast: 0, lunch: 0, dinner: 0 },
        consumed: { breakfast: false, lunch: false, dinner: false }
      };
      return;
    }
    // Migrate older saves that stored booleans directly
    if (!m.counts) {
      var consumed = { breakfast: !!m.breakfast, lunch: !!m.lunch, dinner: !!m.dinner };
      Game.state.meals = {
        counts: { breakfast: 0, lunch: 0, dinner: 0 },
        consumed: consumed
      };
      m = Game.state.meals;
    }
    if (!m.consumed) {
      m.consumed = { breakfast: false, lunch: false, dinner: false };
    }
  },
  getCount: function (type) {
    Game.Meals.ensureState();
    return Game.state.meals.counts[type] || 0;
  },
  addMeal: function (type, amount) {
    Game.Meals.ensureState();
    if (!amount || amount < 0) amount = 1;
    var counts = Game.state.meals.counts;
    var current = counts[type] || 0;
    var maxStore = 13;
    if (Game.Prestige && typeof Game.Prestige.getMealStorageBonus === "function") {
      maxStore += Game.Prestige.getMealStorageBonus();
    }
    if (current >= maxStore) {
      Game.addNotification("You cannot store more than " + maxStore + " " + type + " meals.");
      return false;
    }
    var toAdd = Math.min(amount, maxStore - current);
    counts[type] = current + toAdd;
    return true;
  },
  canConsumeNow: function (type) {
    Game.Meals.ensureState();
    var m = Game.state.meals;
    if (m.consumed[type]) return false;
    if ((m.counts[type] || 0) <= 0) return false;
    return true;
  },
  consumeOne: function (type) {
    if (!Game.Meals.canConsumeNow(type)) return false;
    var m = Game.state.meals;
    m.counts[type] = Math.max(0, (m.counts[type] || 0) - 1);
    m.consumed[type] = true;
    var label = type.charAt(0).toUpperCase() + type.slice(1);
    Game.addNotification(label + " eaten.");
    // Each meal reduces hunger by 16 points.
    var s = Game.state;
    s.hunger -= 16;
    if (s.hunger < 0) s.hunger = 0;
    return true;
  },
  resetDaily: function () {
    Game.Meals.ensureState();
    Game.state.meals.consumed = { breakfast: false, lunch: false, dinner: false };
  },
  tick: function () {
    Game.Meals.ensureState();
    var total = Game.state.timeMinutes || 0;
    var h = Math.floor(total % (24 * 60) / 60);
    // Auto-consume once per day in windows if player has meals stored
    if (h >= 6 && h < 8) {
      Game.Meals.consumeOne("breakfast");
    } else if (h >= 12 && h < 14) {
      Game.Meals.consumeOne("lunch");
    } else if (h >= 18 && h < 20) {
      Game.Meals.consumeOne("dinner");
    }
  },
  getCurrentMealPeriod: function () {
    var total = Game.state.timeMinutes || 0;
    var h = Math.floor(total % (24 * 60) / 60);
    if (h >= 6 && h < 8) return "Breakfast";
    if (h >= 12 && h < 14) return "Lunch";
    if (h >= 18 && h < 20) return "Dinner";
    return "";
  }
};

Game.registerDailyHandler(function () {
  Game.Meals.resetDaily();
});
