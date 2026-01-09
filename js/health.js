Game.Health = {
  HomeHealthBonus: 1,
  getMaxEnergy: function () {
    var base = 100;
    if (!Game.state || !Game.state.housing) return base;
    if (Game.Prestige && typeof Game.Prestige.getEnergyCapBonus === "function") {
      base += Game.Prestige.getEnergyCapBonus();
    }
    var h = Game.state.housing;
    // Bed upgrades only apply to owned homes.
    if (h.status !== "own") return base;
    var bedLevel = 0;
    if (h.upgrades && typeof h.upgrades.bed === "number") bedLevel = h.upgrades.bed;
    if (!isFinite(bedLevel) || bedLevel < 0) bedLevel = 0;
    if (bedLevel > 5) bedLevel = 5;
    var max = base + bedLevel * 10; // +10 energy cap per bed level
    if (max < 60) max = 60;
    if (max > 160) max = 160;
    return max;
  },
  getMaxHealth: function () {
    var base = 100;
    if (!Game.state || !Game.state.housing) return base;
    if (!Game.Property || !Game.Property.homes || !Game.Property.getHomeDef) return base;

    var h = Game.state.housing;
    var def = Game.Property.getHomeDef(h.homeId);
    if (!def) return base;

    // Grade is derived from the home tier in the ordered homes list.
    var grade = 0;
    for (var i = 0; i < Game.Property.homes.length; i++) {
      if (Game.Property.homes[i].id === def.id) { grade = i; break; }
    }

    var maint = typeof h.maintenance === "number" ? h.maintenance : 100;
    if (maint < 0) maint = 0;
    if (maint > 100) maint = 100;

    // Better homes raise max health; poor condition reduces it.
    var gradeBase = 90 + grade * 8; // starter room ~90, top tier ~130
    var conditionMult = 0.7 + (maint / 100) * 0.3; // 70%..100%
    var max = Math.round(gradeBase * conditionMult);

    // Owned home vanity upgrades raise max health further.
    if (h.status === "own" && h.upgrades && typeof h.upgrades.vanity === "number") {
      var vanityLevel = h.upgrades.vanity;
      if (!isFinite(vanityLevel) || vanityLevel < 0) vanityLevel = 0;
      if (vanityLevel > 5) vanityLevel = 5;
      max += vanityLevel * 5; // +5 health cap per level
    }
    if (max < 60) max = 60;
    if (max > 200) max = 200;
    return max;
  },
  tick: function (minutes) {
    var s = Game.state;
    // Hunger should rise from 0 to 100 over roughly 2 real-time days
    // (given the current global time scale), so use a smaller per-minute rate.
    s.hunger += minutes * 0.00116;
    if (s.hunger > 100) s.hunger = 100;
    var isTraveling = (Game.isTraveling && Game.isTraveling()) ? true : !!(Game.state.travel && Game.state.travel.inProgress);
    var isBusy = !!(Game.state.job && Game.state.job.isWorking) || !!(Game.state.school && Game.state.school.enrolled) || isTraveling;
    var isSleeping = (Game.isSleeping && Game.isSleeping()) ? true : false;
    var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
    if (!isBusy) {
      var baseRate = 0.05;
      var mult = Game.state.travelLocation === "Home" ? 2 : 1;
      var energyBefore = typeof s.energy === "number" ? s.energy : 0;
      // Safety net: if health would decay due to low energy and the player is idle,
      // accelerate energy recovery to prevent a rapid health spiral (all locations).
      if (energyBefore < 20) mult *= 10;
      s.energy += minutes * baseRate * mult;
      if (s.energy > maxEnergy) s.energy = maxEnergy;
    }
    if (s.hunger > 80) {
      s.health -= minutes * 0.04;
    }
    if (s.energy < 20) {
      s.health -= minutes * 0.03;
    }
    if (s.travelLocation === "Home" && (!s.travel || !s.travel.inProgress)) {
      var sleepMult = 1;
      var homeMult = 1;
      if (Game.Prestige && typeof Game.Prestige.getHomeHealMultiplier === "function") {
        homeMult = Game.Prestige.getHomeHealMultiplier();
      }
      s.health += (minutes / 30) * Game.Health.HomeHealthBonus * sleepMult * homeMult;
    }
    if (typeof s.energy !== "number" || !isFinite(s.energy)) s.energy = 0;
    if (s.energy < 0) s.energy = 0;
    if (s.energy > maxEnergy) s.energy = maxEnergy;
    if (s.health < 0) s.health = 0;
    var maxHealth = Game.Health.getMaxHealth();
    if (s.health > maxHealth) s.health = maxHealth;

    // Auto-wake when fully rested.
    if (isSleeping && s.energy >= maxEnergy - 0.00001) {
      s.energy = maxEnergy;
      if (Game.stopSleeping) {
        Game.stopSleeping("You wake up fully rested.");
      } else {
        Game.state.sleeping = false;
        Game.addNotification("You wake up fully rested.");
      }
      if (typeof UI !== "undefined" && UI && UI.renderCurrentTab) {
        UI.renderCurrentTab();
      }
    }
  },
  visitDoctor: function () {
    if (Game.blockIfSleeping && Game.blockIfSleeping("visit the doctor")) return;
    if (!Game.spendMoney(Game.Economy.doctorVisit, "Doctor visit")) {
      Game.addNotification("Not enough money to see the doctor.");
      return;
    }
    Game.state.health += 30;
    var maxHealth = Game.Health.getMaxHealth();
    if (Game.state.health > maxHealth) Game.state.health = maxHealth;
    Game.addNotification("Doctor visit improved your health.");
  },
  hospitalStay: function () {
    if (Game.blockIfSleeping && Game.blockIfSleeping("stay in hospital")) return;
    if (!Game.spendMoney(Game.Economy.hospitalStay, "Hospital stay")) {
      Game.addNotification("Not enough money for a hospital stay.");
      return;
    }
    Game.state.health = Game.Health.getMaxHealth();
    var maxEnergy2 = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
    if (typeof maxEnergy2 !== "number" || !isFinite(maxEnergy2) || maxEnergy2 <= 0) maxEnergy2 = 100;
    Game.state.energy = Math.min(maxEnergy2, 80);
    Game.state.hunger = 20;
    Game.addNotification("You spent time in hospital and fully recovered.");
  }
};

Game.registerDailyHandler(function () {
  var s = Game.state;
  if (s.health < 35) {
    Game.addNotification("Your health is low. Consider visiting healthcare.");
  }
});
