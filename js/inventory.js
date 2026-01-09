// Inventory grouping and item use (snacks, energy drinks).
// Depends on Game.state, Game.addNotification, Game.Meals.

Game.Inventory = {
  getGroupedInventory: function (includeMeals) {
    var groupsByKey = {};
    var list = [];
    var inv = Game.state.inventory || [];
    for (var i = 0; i < inv.length; i++) {
      var it = inv[i];
      if (!it) continue;
      var name = it.name || ("Item " + (i + 1));
      var key = "item:" + String(name);
      var group = groupsByKey[key];
      if (!group) {
        group = {
          id: it.id || null,
          useId: null,
          name: name,
          type: it.type || "-",
          source: it.source || "-",
          count: 0,
          ids: [],
          idCounts: {},
          isMeal: false
        };
        groupsByKey[key] = group;
        list.push(group);
      }
      group.count += 1;
      if (group.type !== (it.type || "-")) group.type = "Mixed";
      if (group.source !== (it.source || "-")) group.source = "Mixed";

      if (it.id) {
        var itemId = String(it.id);
        if (!group.idCounts[itemId]) {
          group.idCounts[itemId] = 0;
          group.ids.push(itemId);
          if (!group.useId && Game.Inventory && Game.Inventory.canUseItem && Game.Inventory.canUseItem(itemId)) {
            group.useId = itemId;
          }
        }
        group.idCounts[itemId] += 1;
      }
    }
    if (includeMeals && typeof Game !== "undefined" && Game.Shop && Game.Shop.meals && Game.Meals && Game.Meals.getCount) {
      Game.Meals.ensureState();
      var meals = Game.Shop.meals;
      for (var j = 0; j < meals.length; j++) {
        var meal = meals[j];
        var mealCount = Game.Meals.getCount(meal.id);
        if (!mealCount || mealCount <= 0) continue;
        var mealKey = "meal:" + meal.id;
        var existing = groupsByKey[mealKey];
        if (!existing) {
          existing = {
            id: meal.id,
            useId: meal.id,
            name: meal.name,
            type: "meal",
            source: "Daily meals",
            count: 0,
            ids: [meal.id],
            idCounts: {},
            isMeal: true
          };
          groupsByKey[mealKey] = existing;
          list.push(existing);
        }
        existing.count = mealCount;
      }
    }
    list.sort(function (a, b) {
      if (!!a.isMeal !== !!b.isMeal) {
        return a.isMeal ? 1 : -1;
      }
      var na = a.name || "";
      var nb = b.name || "";
      if (na < nb) return -1;
      if (na > nb) return 1;
      return 0;
    });
    return list;
  },
  canUseItem: function (id) {
    if (!id) return false;
    // Only specific items are usable directly from inventory.
    if (id === "health-snacks") return true;
    // Energy drinks
    if (id === "drink-red-fang" ||
        id === "drink-monster-byte" ||
        id === "drink-rock-blitz" ||
        id === "drink-amp-core" ||
        id === "drink-thunderbolt" ||
        id === "drink-vyper-volt" ||
        id === "drink-nitro-roar") {
      return true;
    }
    return false;
  },
  useItem: function (id) {
    if (!Game.Inventory.canUseItem(id)) {
      return false;
    }
    var inv = Game.state.inventory || [];
    var index = -1;
    for (var i = 0; i < inv.length; i++) {
      if (inv[i] && inv[i].id === id) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      Game.addNotification("You do not have any of that item to use.");
      return false;
    }
    inv.splice(index, 1);
    if (id === "health-snacks") {
      if (typeof Game.state.hunger !== "number") {
        Game.state.hunger = 0;
      }
      if (typeof Game.state.health !== "number") {
        Game.state.health = 0;
      }
      var reduce = 12;
      Game.state.hunger -= reduce;
      if (Game.state.hunger < 0) {
        Game.state.hunger = 0;
      }
      Game.state.health += 4;
      var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
      if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
      if (Game.state.health > maxHealth) Game.state.health = maxHealth;
      Game.addNotification("You ate a Healthy Snack Pack. Health +4, hunger -12.");
      return true;
    }
    // Energy drink effects: different energy boost and small health penalty
    var energyDelta = 0;
    var healthDelta = 0;
    if (id === "drink-red-fang") {
      energyDelta = 16;
      healthDelta = -3;
    } else if (id === "drink-monster-byte") {
      energyDelta = 22;
      healthDelta = -4;
    } else if (id === "drink-rock-blitz") {
      energyDelta = 12;
      healthDelta = -2;
    } else if (id === "drink-amp-core") {
      energyDelta = 18;
      healthDelta = -3;
    } else if (id === "drink-thunderbolt") {
      energyDelta = 24;
      healthDelta = -5;
    } else if (id === "drink-vyper-volt") {
      energyDelta = 14;
      healthDelta = -3;
    } else if (id === "drink-nitro-roar") {
      energyDelta = 28;
      healthDelta = -6;
    }
    if (typeof Game.state.energy !== "number") Game.state.energy = 0;
    if (typeof Game.state.health !== "number") Game.state.health = 0;
    Game.state.energy += energyDelta;
    Game.state.health += healthDelta;
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
    if (Game.state.energy > maxEnergy) Game.state.energy = maxEnergy;
    if (Game.state.energy < 0) Game.state.energy = 0;
    var maxHealth2 = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
    if (typeof maxHealth2 !== "number" || !isFinite(maxHealth2) || maxHealth2 <= 0) maxHealth2 = 100;
    if (Game.state.health > maxHealth2) Game.state.health = maxHealth2;
    if (Game.state.health < 0) Game.state.health = 0;
    Game.addNotification("You drank an energy drink. Energy " + (energyDelta >= 0 ? "+" : "") + energyDelta + ", health " + (healthDelta >= 0 ? "+" : "") + healthDelta + ".");
    return true;
  }
};
