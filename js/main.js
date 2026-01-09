window.addEventListener("load", function () {
  if (Game.load) {
    Game.load();
  }
  if (window.UI && window.UI.init) {
    window.UI.init();
  }
  var lastTime = Date.now();
  function safeTick(label, fn) {
    try {
      fn();
    } catch (e) {
      try { console.error("Tick error:", label, e); } catch (e2) {}
      try {
        var nowMs = Date.now ? Date.now() : (new Date().getTime());
        if (!window.__lifesimTickErrorGate) window.__lifesimTickErrorGate = {};
        var gate = window.__lifesimTickErrorGate;
        var lastMs = gate[label] || 0;
        // Avoid notification spam if the same tick keeps throwing.
        if (!lastMs || nowMs - lastMs > 30000) {
          gate[label] = nowMs;
          if (Game && typeof Game.addNotification === "function") {
            var msg = (e && e.message) ? String(e.message) : String(e);
            if (msg.length > 140) msg = msg.slice(0, 140) + "...";
            Game.addNotification("Error in " + label + ": " + msg, "system");
          }
        }
      } catch (e3) {}
    }
  }
  setInterval(function () {
    safeTick("mainLoop", function () {
      var now = Date.now();
      var deltaMs = now - lastTime;
      if (deltaMs < 0) deltaMs = 0;
      // Avoid huge catch-up ticks after the tab/PC stalls or resumes from sleep.
      // Large deltas can cause expensive loops (daily handlers, UI updates) and freeze the browser.
      if (deltaMs > 5000) deltaMs = 5000;
      lastTime = now;
      var deltaSeconds = deltaMs / 1000;
      var tickMult = 1;
      if (Game && Game.state && Game.state.debug && typeof Game.state.debug.tickRateMult !== "undefined") {
        tickMult = parseFloat(Game.state.debug.tickRateMult);
        if (!isFinite(tickMult)) tickMult = 1;
        if (tickMult < 0) tickMult = 0;
        if (tickMult > 50) tickMult = 50;
      }
      var effectiveSeconds = deltaSeconds * tickMult;
      // Each in-game minute should take 2 seconds of real time,
      // so we advance 0.5 in-game minutes per real second.
      var deltaMinutes = effectiveSeconds * 0.5;
      if (Game && Game.isSleeping && Game.isSleeping()) {
        var sleepMult = 10;
        if (typeof Game.getSleepTimeMultiplier === "function") {
          sleepMult = Game.getSleepTimeMultiplier();
        }
        if (typeof sleepMult !== "number" || !isFinite(sleepMult) || sleepMult < 1) sleepMult = 10;
        if (sleepMult > 30) sleepMult = 30;
        deltaMinutes *= sleepMult;
      }

      safeTick("Game.advanceTime", function () { Game.advanceTime(deltaMinutes); });
      safeTick("Game.Bank.tick", function () { if (Game.Bank && Game.Bank.tick) Game.Bank.tick(deltaMinutes); });
      safeTick("Game.School.tick", function () { if (Game.School && Game.School.tick) Game.School.tick(deltaMinutes); });
      safeTick("Game.Jobs.tick", function () { if (Game.Jobs && Game.Jobs.tick) Game.Jobs.tick(deltaMinutes); });
      safeTick("Game.World.tickTravel", function () { if (Game.World && Game.World.tickTravel) Game.World.tickTravel(deltaMinutes); });
      safeTick("Game.World.tickUkTravel", function () { if (Game.World && Game.World.tickUkTravel) Game.World.tickUkTravel(deltaMinutes); });
      safeTick("Game.Shop.tick", function () { if (Game.Shop && Game.Shop.tick) Game.Shop.tick(deltaMinutes); });
      safeTick("Game.Health.tick", function () { if (Game.Health && Game.Health.tick) Game.Health.tick(deltaMinutes); });
      safeTick("Game.Property.tick", function () { if (Game.Property && Game.Property.tick) Game.Property.tick(deltaMinutes); });
      safeTick("Game.Companies.tick", function () { if (Game.Companies && Game.Companies.tick) Game.Companies.tick(deltaMinutes); });
      safeTick("Game.Downloads.tick", function () { if (Game.Downloads && Game.Downloads.tick) Game.Downloads.tick(effectiveSeconds); });
      safeTick("Game.PC.tick", function () { if (Game.PC && Game.PC.tick) Game.PC.tick(effectiveSeconds); });
      safeTick("Game.Btc.tick", function () { if (Game.Btc && Game.Btc.tick) Game.Btc.tick(effectiveSeconds); });
      safeTick("Game.Crypto.tick", function () { if (Game.Crypto && Game.Crypto.tick) Game.Crypto.tick(effectiveSeconds); });
      safeTick("Game.Meals.tick", function () { if (Game.Meals && Game.Meals.tick) Game.Meals.tick(); });
      safeTick("Game.Casino.tick", function () { if (Game.Casino && Game.Casino.tick) Game.Casino.tick(deltaMinutes); });
    });
  }, 1000);
  setInterval(function () {
    UI.refresh();
  }, 500);
  setInterval(function () {
    Game.save(true);
  }, 15000);
});
