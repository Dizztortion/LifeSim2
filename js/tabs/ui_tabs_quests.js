(function () {
  window.UI = window.UI || {};
  UI.Tabs = UI.Tabs || {};

  UI.Tabs.getQuestCompletionLevel = function (def, s) {
    if (!def || !def.id || !s || !s.quests || typeof s.quests.claimed !== "object") return 0;
    var val = s.quests.claimed[def.id];
    if (typeof val !== "number" || !isFinite(val) || val < 0) return 0;
    return Math.floor(val);
  };

  UI.Tabs.getQuestTargetForLevel = function (def, level) {
    if (!def) return 1;
    var base = (typeof def.target === "number" && def.target > 0) ? def.target : 1;
    var target = base;
    var step = (typeof def.step === "number" && def.step >= 0) ? def.step : base;
    if (def.scaleType === "exponential" && typeof def.scaleMultiplier === "number" && def.scaleMultiplier > 1) {
      target = base * Math.pow(def.scaleMultiplier, level);
    } else {
      target = base + (step * level);
    }
    if (def.type === "jobHas") {
      target = Math.max(1, target);
    }
    if (target <= 0) target = base;
    return target;
  };

  UI.Tabs.getQuestRawValue = function (def, s) {
    if (!def || !s) return 0;
    if (def.type === "jobHas") {
      var hasJob = s.job && s.job.current && s.job.current !== "none";
      var jobLevel = (s.job && typeof s.job.level === "number") ? s.job.level : 0;
      return hasJob ? (jobLevel + 1) : 0;
    }
    if (def.type === "educationLevel") {
      return s.education && typeof s.education.level === "number" ? s.education.level : 0;
    }
    if (def.type === "propertyCount") {
      return Array.isArray(s.properties) ? s.properties.length : 0;
    }
    if (def.type === "btcBalance") {
      return typeof s.btcBalance === "number" ? s.btcBalance : 0;
    }
    if (def.type === "ownsItem") {
      var inv = Array.isArray(s.inventory) ? s.inventory : [];
      for (var i = 0; i < inv.length; i++) {
        if (inv[i] && inv[i].id === def.itemId) return 1;
      }
      return 0;
    }
    if (def.type === "companiesUnlocked") {
      var c = s.companies || {};
      var count = 0;
      if (c.railLogistics && c.railLogistics.unlocked) count += 1;
      if (c.miningCorp && c.miningCorp.unlocked) count += 1;
      if (c.retailShop && c.retailShop.unlocked) count += 1;
      return count;
    }
    return 0;
  };

  UI.Tabs.getQuestProgress = function (def, s) {
    var progress = {
      current: 0,
      target: def && def.target ? def.target : 1,
      percent: 0,
      completed: false,
      label: ""
    };
    if (!def || !s) return progress;

    var level = UI.Tabs.getQuestCompletionLevel(def, s);
    progress.target = UI.Tabs.getQuestTargetForLevel(def, level);
    var target = progress.target > 0 ? progress.target : 1;
    var base = 0;
    if (s.quests && s.quests.progressBase && typeof s.quests.progressBase[def.id] === "number" && isFinite(s.quests.progressBase[def.id])) {
      base = s.quests.progressBase[def.id];
    }

    if (def.type === "jobHas") {
      var hasJob = s.job && s.job.current && s.job.current !== "none";
      var jobLevel = (s.job && typeof s.job.level === "number") ? s.job.level : 0;
      progress.current = hasJob ? (jobLevel + 1) : 0;
      var neededLevel = Math.max(0, Math.round(target - 1));
      progress.label = hasJob ? ("Job level " + jobLevel + " / " + neededLevel) : "No job yet.";
    } else if (def.type === "educationLevel") {
      progress.current = s.education && typeof s.education.level === "number" ? s.education.level : 0;
      progress.label = progress.current + " / " + Math.round(target);
    } else if (def.type === "propertyCount") {
      progress.current = Array.isArray(s.properties) ? s.properties.length : 0;
      progress.label = progress.current + " / " + Math.max(1, Math.round(target));
    } else if (def.type === "btcBalance") {
      progress.current = typeof s.btcBalance === "number" ? s.btcBalance : 0;
      progress.label = progress.current.toFixed(8) + " / " + target.toFixed(8) + " BTC";
    } else if (def.type === "ownsItem") {
      var inv = Array.isArray(s.inventory) ? s.inventory : [];
      var has = false;
      for (var ii = 0; ii < inv.length; ii++) {
        if (inv[ii] && inv[ii].id === def.itemId) { has = true; break; }
      }
      progress.current = has ? 1 : 0;
      progress.label = has ? "Owned" : "Not owned";
    } else if (def.type === "companiesUnlocked") {
      var c = s.companies || {};
      var count = 0;
      if (c.railLogistics && c.railLogistics.unlocked) count += 1;
      if (c.miningCorp && c.miningCorp.unlocked) count += 1;
      if (c.retailShop && c.retailShop.unlocked) count += 1;
      progress.current = count;
      progress.label = count + " / " + Math.max(1, Math.round(target));
    }

    progress.completed = progress.current >= target;
    if (def.type === "ownsItem") {
      progress.percent = progress.completed ? 100 : 0;
    } else {
      var denom = target - base;
      if (!(denom > 0)) {
        progress.percent = progress.completed ? 100 : 0;
      } else {
        var ratio = (progress.current - base) / denom;
        progress.percent = Math.max(0, Math.min(100, Math.floor(ratio * 100)));
      }
    }
    return progress;
  };

  UI.Tabs.claimQuestReward = function (def) {
    if (!def || !def.id) return { ok: false, message: "Invalid quest." };
    var s = Game.state;
    if (!s.quests || typeof s.quests !== "object") s.quests = { claimed: {} };
    if (!s.quests.claimed || typeof s.quests.claimed !== "object") s.quests.claimed = {};
    if (!s.quests.progressBase || typeof s.quests.progressBase !== "object") s.quests.progressBase = {};

    var progress = UI.Tabs.getQuestProgress(def, s);
    if (!progress.completed) return { ok: false, message: "Quest not complete yet." };

    var currentLevel = UI.Tabs.getQuestCompletionLevel(def, s);
    var mult = Math.pow(2, Math.max(0, currentLevel));
    var reward = def.reward || {};
    var itemsOut = [];

    if (reward.money && reward.money > 0) {
      var money = reward.money * mult;
      Game.addMoney(money, "Quest reward: " + def.title);
      itemsOut.push({ label: "Money", value: "+$" + money.toFixed(0), mono: true });
    }
    if (reward.btc && reward.btc > 0) {
      var btc = reward.btc * mult;
      Game.addBtc(btc, "Quest reward: " + def.title);
      itemsOut.push({ label: "BTC", value: "+" + btc.toFixed(8) + " BTC", mono: true });
    }
    if (reward.items && Array.isArray(reward.items)) {
      var inv = Array.isArray(s.inventory) ? s.inventory : [];
      var countMult = Math.min(64, Math.max(1, Math.floor(mult)));
      for (var i = 0; i < reward.items.length; i++) {
        var it = reward.items[i];
        if (!it || !it.id) continue;
        if (it.requiresItemId) {
          var hasReq = false;
          for (var j = 0; j < inv.length; j++) {
            if (inv[j] && inv[j].id === it.requiresItemId) { hasReq = true; break; }
          }
          if (!hasReq) continue;
        }
        for (var c = 0; c < countMult; c++) {
          inv.push({ id: it.id, name: it.name || it.id, type: it.type || "reward", source: "quest" });
        }
        itemsOut.push({ label: "Item", value: (it.name || it.id) + (countMult > 1 ? (" x" + countMult) : ""), mono: false });
      }
      s.inventory = inv;
    }

    // Reset the progress bar by setting the new baseline to the current achieved value.
    s.quests.progressBase[def.id] = UI.Tabs.getQuestRawValue(def, s);
    s.quests.claimed[def.id] = currentLevel + 1;
    return { ok: true, title: def.title, items: itemsOut };
  };

  UI.Tabs.renderQuestsTab = function () {
    var s = Game.state;
    var defs = UI.questDefs || [];
    var total = defs.length;
    var readyCount = 0;
    var activeEntries = [];
    var completedEntries = [];

    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      var progress = UI.Tabs.getQuestProgress(def, s);
      if (progress.completed) readyCount += 1;
      var completions = UI.Tabs.getQuestCompletionLevel(def, s);
      var showActive = !(def.repeatable === false && completions > 0);
      if (showActive) {
        activeEntries.push({ def: def, progress: progress, completions: completions });
      }
      if (completions > 0) {
        completedEntries.push({
          def: def,
          count: completions,
          progress: progress
        });
      }
    }

    var html = [];
    html.push("<div>");
    html.push('<div class="section-title">Quests & Goals</div>');
    html.push('<div class="section-subtitle">Guided goals that evolve as you master jobs, education, property, companies and BTC.</div>');
    html.push('<div class="grid mt-8">');
    html.push('<div class="card">');
    html.push('<div class="card-title">Quest Summary</div>');
    html.push('<div class="card-section">');
    html.push('<div class="field-row"><span>Total quests</span><span id="quests-total">' + total + "</span></div>");
    html.push('<div class="field-row"><span>Ready to claim</span><span id="quests-completed">' + readyCount + "</span></div>");
    html.push('<div class="field-row"><span>In progress</span><span id="quests-progress">' + Math.max(0, total - readyCount) + "</span></div>");
    html.push("</div>");
    html.push('<div class="card-section small dim">Quest targets grow each time you finish them, so the current list always reflects fresh goals.</div>');
    html.push("</div>");
    html.push('<div class="card">');
    html.push('<div class="card-title">Current Quests</div>');
    if (activeEntries.length === 0) {
      html.push('<div class="card-section small dim">Nothing on the list right now. Complete an active goal to refresh this view.</div>');
    } else {
      for (var ai = 0; ai < activeEntries.length; ai++) {
        var entry = activeEntries[ai];
        var statusLabel = entry.progress.completed ? "Ready to claim" : "In progress";
        html.push('<div class="card-section" style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:6px;margin-bottom:6px;">');
        html.push('<div class="field-row"><span>' + entry.def.title + '</span><span id="quest-status-' + entry.def.id + '">' + statusLabel + "</span></div>");
        html.push('<div class="small dim">' + entry.def.description + "</div>");
        html.push('<div class="field-row small mt-4"><span>Progress</span><span id="quest-label-' + entry.def.id + '">' + entry.progress.label + "</span></div>");
        html.push('<div class="progress"><div id="quest-bar-' + entry.def.id + '" class="progress-fill yellow" style="width:' + entry.progress.percent + '%"></div></div>');
        if (entry.progress.completed) {
          html.push('<div class="mt-4"><button class="btn btn-small btn-primary btn-quest-claim" data-quest="' + entry.def.id + '">Claim reward</button></div>');
        }
        html.push("</div>");
      }
    }
    html.push("</div>");
    html.push("</div>");

    html.push('<div class="card mt-8">');
    html.push('<div class="card-title">Completed Quests</div>');
    if (completedEntries.length === 0) {
      html.push('<div class="card-section small dim">You have not finished any quests yet.</div>');
    } else {
      for (var ci = 0; ci < completedEntries.length; ci++) {
        var comp = completedEntries[ci];
        var label = comp.def.repeatable === false ? "Finalized" : "Next target: " + comp.progress.label;
        html.push('<div class="card-section" style="border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:6px;margin-bottom:6px;">');
        html.push('<div class="field-row"><span>' + comp.def.title + '</span><span>' + (comp.def.repeatable === false ? "Completed" : ("Completed " + comp.count + " time" + (comp.count === 1 ? "" : "s"))) + "</span></div>");
        html.push('<div class="small dim">' + label + "</div>");
        html.push("</div>");
      }
    }
    html.push("</div>");
    html.push("</div>");
    html.push("</div>");
    return html.join("");
  };

  UI.Tabs.updateQuestsDynamic = function () {
    var s = Game.state;
    var defs = UI.questDefs || [];
    var total = defs.length;
    var readyCount = 0;
    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      var progress = UI.Tabs.getQuestProgress(def, s);
      if (progress.completed) readyCount += 1;
      var statusEl = document.getElementById("quest-status-" + def.id);
      if (statusEl) {
        statusEl.textContent = progress.completed ? "Ready" : "In progress";
      }
      var labelEl = document.getElementById("quest-label-" + def.id);
      if (labelEl) labelEl.textContent = progress.label;
      var barEl = document.getElementById("quest-bar-" + def.id);
      if (barEl) barEl.style.width = progress.percent + "%";
    }
    var totalEl = document.getElementById("quests-total");
    if (totalEl) totalEl.textContent = String(total);
    var readyEl = document.getElementById("quests-completed");
    if (readyEl) readyEl.textContent = String(readyCount);
    var progEl = document.getElementById("quests-progress");
    if (progEl) progEl.textContent = String(Math.max(0, total - readyCount));
  };
})();
