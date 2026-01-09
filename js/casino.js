(function () {
  if (!window.Game) return;

  function clampMoney(value) {
    var number = typeof value === "number" ? value : 0;
    if (!isFinite(number)) number = 0;
    return Math.round(number * 100) / 100;
  }

  function clampBet(value, min, max) {
    var bet = typeof value === "number" ? value : parseFloat(value);
    if (!isFinite(bet)) bet = min;
    bet = Math.round(bet * 100) / 100;
    if (bet < min) bet = min;
    if (bet > max) bet = max;
    return bet;
  }

  function pickWeighted(items) {
    var total = 0;
    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) total += items[itemIndex].weight;
    var roll = Math.random() * total;
    for (var selectionIndex = 0; selectionIndex < items.length; selectionIndex++) {
      roll -= items[selectionIndex].weight;
      if (roll <= 0) return items[selectionIndex];
    }
    return items[items.length - 1];
  }

  function calcBlackjackTotal(cards) {
    var sum = 0;
    var aceCount = 0;
    for (var cardIndex = 0; cardIndex < cards.length; cardIndex++) {
      var rank = cards[cardIndex].rank;
      if (rank === "A") {
        aceCount += 1;
        sum += 11;
      } else if (rank === "K" || rank === "Q" || rank === "J") {
        sum += 10;
      } else {
        sum += parseInt(rank, 10);
      }
    }
    while (sum > 21 && aceCount > 0) {
      sum -= 10;
      aceCount -= 1;
    }
    return sum;
  }

  function drawCard() {
    var suits = ["♠", "♥", "♦", "♣"];
    var ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    var suit = suits[Math.floor(Math.random() * suits.length)];
    var rank = ranks[Math.floor(Math.random() * ranks.length)];
    return { suit: suit, rank: rank };
  }

  function normalizeFundsSource(casino) {
    var source = casino && casino.fundsSource;
    if (source !== "wallet" && source !== "casino") source = "wallet";
    casino.fundsSource = source;
    return source;
  }

  function getWalletUsd() {
    var money = (Game && Game.state && typeof Game.state.money === "number") ? Game.state.money : 0;
    if (!isFinite(money)) money = 0;
    return money;
  }

  function getCasinoBalanceUsd(casino) {
    var bal = casino && typeof casino.balanceUsd === "number" ? casino.balanceUsd : 0;
    if (!isFinite(bal) || bal < 0) bal = 0;
    return bal;
  }

  function getTaxPoolUsd() {
    var pool = (Game && Game.state && typeof Game.state.taxPoolUsd === "number") ? Game.state.taxPoolUsd : 0;
    if (!isFinite(pool) || pool < 0) pool = 0;
    return clampMoney(pool);
  }

  function takeTaxPoolUsd() {
    var pool = getTaxPoolUsd();
    if (!Game.state) return 0;
    Game.state.taxPoolUsd = 0;
    return pool;
  }

  function spendSelectedFunds(casino, amountUsd, reason) {
    var usd = clampMoney(amountUsd);
    if (!isFinite(usd) || usd <= 0) return false;
    var bal = getCasinoBalanceUsd(casino);
    if (bal < usd) return false;
    casino.balanceUsd = clampMoney(bal - usd);
    if (reason) {
      Game.addNotification("-$" + usd.toFixed(2) + " (Tokens: " + reason + ")");
    }
    return true;
  }

  function creditFundsToSource(casino, amountUsd, source, reason) {
    var usd = clampMoney(amountUsd);
    if (!isFinite(usd) || usd === 0) return;
    casino.balanceUsd = clampMoney(getCasinoBalanceUsd(casino) + usd);
    if (reason) {
      Game.addNotification((usd >= 0 ? "+$" : "-$") + Math.abs(usd).toFixed(2) + " (Tokens: " + reason + ")");
    }
  }

  function creditSelectedFunds(casino, amountUsd, reason) {
    var usd = clampMoney(amountUsd);
    if (!isFinite(usd) || usd === 0) return;
    casino.balanceUsd = clampMoney(getCasinoBalanceUsd(casino) + usd);
    if (reason) {
      Game.addNotification((usd >= 0 ? "+$" : "-$") + Math.abs(usd).toFixed(2) + " (Tokens: " + reason + ")");
    }
  }

  function getSlotsPaytable() {
    return [
      { id: "lemon", name: "Lemon", weight: 34, pay2: 0.6, pay3: 2.0, wild: false },
      { id: "cherry", name: "Cherry", weight: 28, pay2: 0.8, pay3: 3.0, wild: false },
      { id: "bell", name: "Bell", weight: 18, pay2: 1.2, pay3: 6.0, wild: false },
      { id: "star", name: "Star", weight: 12, pay2: 1.8, pay3: 10.0, wild: false },
      { id: "seven", name: "Seven", weight: 6, pay2: 3.0, pay3: 18.0, wild: false },
      { id: "diamond", name: "Diamond", weight: 3, pay2: 6.0, pay3: 45.0, wild: false },
      { id: "wild", name: "Wild", weight: 2, pay2: 8.0, pay3: 60.0, wild: true }
    ];
  }

  var CASINO_REWARD_MULT = 2;
  var FREE_SPIN_GOAL_ONE = 50;
  var FREE_SPIN_GOAL_TWO = 150;
  var FREE_SPIN_REWARD_ONE = 2;
  var FREE_SPIN_REWARD_TWO = 5;

  function normalizeDailySpinProgress(slots) {
    if (!slots) return;
    var day = (Game && Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Game.state.day : 0;
    if (typeof slots.dailySpinDay !== "number" || !isFinite(slots.dailySpinDay) || slots.dailySpinDay < 0) {
      slots.dailySpinDay = day;
    }
    if (slots.dailySpinDay !== day) {
      slots.dailySpinDay = day;
      slots.dailySpinCount = 0;
      slots.dailySpinGoal1Claimed = false;
      slots.dailySpinGoal2Claimed = false;
    }
    if (typeof slots.dailySpinCount !== "number" || !isFinite(slots.dailySpinCount) || slots.dailySpinCount < 0) {
      slots.dailySpinCount = 0;
    }
    if (typeof slots.dailySpinGoal1Claimed !== "boolean") slots.dailySpinGoal1Claimed = !!slots.dailySpinGoal1Claimed;
    if (typeof slots.dailySpinGoal2Claimed !== "boolean") slots.dailySpinGoal2Claimed = !!slots.dailySpinGoal2Claimed;
  }

  function getDailySpinStatus(slots) {
    normalizeDailySpinProgress(slots);
    var count = slots.dailySpinCount || 0;
    var canClaim = false;
    var pendingReward = 0;
    var target = 0;
    if (!slots.dailySpinGoal1Claimed && count >= FREE_SPIN_GOAL_ONE) {
      canClaim = true;
      pendingReward = FREE_SPIN_REWARD_ONE;
      target = FREE_SPIN_GOAL_ONE;
    } else if (slots.dailySpinGoal1Claimed && !slots.dailySpinGoal2Claimed && count >= FREE_SPIN_GOAL_TWO) {
      canClaim = true;
      pendingReward = FREE_SPIN_REWARD_TWO;
      target = FREE_SPIN_GOAL_TWO;
    } else if (!slots.dailySpinGoal1Claimed) {
      target = FREE_SPIN_GOAL_ONE;
    } else if (!slots.dailySpinGoal2Claimed) {
      target = FREE_SPIN_GOAL_TWO;
    }
    return {
      day: slots.dailySpinDay || 0,
      count: count,
      target: target,
      canClaim: canClaim,
      pendingReward: pendingReward,
      displayReward: pendingReward > 0 ? Math.max(0, Math.floor(pendingReward * CASINO_REWARD_MULT)) : 0,
      goal1Claimed: !!slots.dailySpinGoal1Claimed,
      goal2Claimed: !!slots.dailySpinGoal2Claimed
    };
  }

  function awardDailySpinRewards(slots) {
    var status = getDailySpinStatus(slots);
    if (!status.canClaim) return 0;
    var reward = status.pendingReward || 0;
    if (reward <= 0) return 0;
    reward = Math.max(0, Math.floor(reward * CASINO_REWARD_MULT));
    if (!slots.dailySpinGoal1Claimed && status.target === FREE_SPIN_GOAL_ONE) {
      slots.dailySpinGoal1Claimed = true;
    } else if (slots.dailySpinGoal1Claimed && !slots.dailySpinGoal2Claimed && status.target === FREE_SPIN_GOAL_TWO) {
      slots.dailySpinGoal2Claimed = true;
    }
    slots.freeSpins = (slots.freeSpins || 0) + reward;
    Game.addNotification("Daily spin goal reached: +" + reward + " free spin" + (reward === 1 ? "" : "s") + ".");
    return reward;
  }

  function applySlotsPredictabilityAdjustments(reels, slots) {
    if (!slots) return reels;
    var predictability = slots.predictability;
    if (predictability !== "smooth" && predictability !== "balanced" && predictability !== "spiky") predictability = "balanced";
    var lossStreak = (typeof slots.lossStreak === "number" && isFinite(slots.lossStreak)) ? slots.lossStreak : 0;
    if (lossStreak < 0) lossStreak = 0;
    if (predictability === "spiky") return reels;

    var wildId = "wild";
    var anyWild = (reels[0] === wildId || reels[1] === wildId || reels[2] === wildId);
    var hasPair = (reels[0] === reels[1]) || (reels[1] === reels[2]) || (reels[0] === reels[2]);
    if (anyWild || hasPair) return reels;

    var baseChance = (predictability === "smooth") ? 0.06 : 0.03;
    var chance = Math.min(0.22, baseChance * lossStreak);
    if (Math.random() >= chance) return reels;

    var preferred = ["lemon", "cherry", "bell", "star"];
    var pick = preferred[Math.floor(Math.random() * preferred.length)];
    reels[1] = pick;
    reels[2] = pick;
    return reels;
  }

  function evaluateSlotsReels(reels, paytableById) {
    var wildId = "wild";
    var isWild0 = reels[0] === wildId;
    var isWild1 = reels[1] === wildId;
    var isWild2 = reels[2] === wildId;
    var wildCount = (isWild0 ? 1 : 0) + (isWild1 ? 1 : 0) + (isWild2 ? 1 : 0);

    function pay3(sym) { return (paytableById[sym] && paytableById[sym].pay3) ? paytableById[sym].pay3 : 0; }
    function pay2(sym) { return (paytableById[sym] && paytableById[sym].pay2) ? paytableById[sym].pay2 : 0; }

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      return { multiplier: pay3(reels[0]), kind: "3", symbol: reels[0] };
    }

    if (wildCount === 2) {
      var nonWild = isWild0 ? (isWild1 ? reels[2] : reels[1]) : reels[0];
      return { multiplier: pay3(nonWild), kind: "3", symbol: nonWild };
    }

    if (wildCount === 1) {
      var symbolA = reels[0], symbolB = reels[1], symbolC = reels[2];
      if (symbolA !== wildId && symbolB !== wildId && symbolA === symbolB) return { multiplier: pay3(symbolA), kind: "3", symbol: symbolA };
      if (symbolB !== wildId && symbolC !== wildId && symbolB === symbolC) return { multiplier: pay3(symbolB), kind: "3", symbol: symbolB };
      if (symbolA !== wildId && symbolC !== wildId && symbolA === symbolC) return { multiplier: pay3(symbolA), kind: "3", symbol: symbolA };
      var nonWildSymbols = [];
      if (symbolA !== wildId) nonWildSymbols.push(symbolA);
      if (symbolB !== wildId) nonWildSymbols.push(symbolB);
      if (symbolC !== wildId) nonWildSymbols.push(symbolC);
      var firstSymbol = nonWildSymbols[0];
      var secondSymbol = nonWildSymbols[1] || nonWildSymbols[0];
      var p1 = pay2(firstSymbol);
      var p2 = pay2(secondSymbol);
      return (p1 >= p2) ? { multiplier: p1, kind: "2", symbol: firstSymbol } : { multiplier: p2, kind: "2", symbol: secondSymbol };
    }

    if (reels[0] === reels[1]) return { multiplier: pay2(reels[0]), kind: "2", symbol: reels[0] };
    if (reels[1] === reels[2]) return { multiplier: pay2(reels[1]), kind: "2", symbol: reels[1] };
    if (reels[0] === reels[2]) return { multiplier: pay2(reels[0]), kind: "2", symbol: reels[0] };
    return { multiplier: 0, kind: "0", symbol: null };
  }

  function countSymbolInReels(reels, symbolId) {
    var count = 0;
    if (!Array.isArray(reels)) return 0;
    for (var i = 0; i < reels.length; i++) {
      if (reels[i] === symbolId) count += 1;
    }
    return count;
  }

  function getSlotsSymbolsForMode(mode, predictability) {
    var base = getSlotsPaytable();
    var list = base.map(function (s) { return { id: s.id, weight: s.weight, pay2: s.pay2, pay3: s.pay3, wild: s.wild }; });

    var pred = predictability;
    if (pred !== "smooth" && pred !== "balanced" && pred !== "spiky") pred = "balanced";
    if (pred === "smooth") {
      for (var symbolWeightIndex = 0; symbolWeightIndex < list.length; symbolWeightIndex++) {
        if (list[symbolWeightIndex].id === "lemon") list[symbolWeightIndex].weight += 8;
        if (list[symbolWeightIndex].id === "cherry") list[symbolWeightIndex].weight += 4;
        if (list[symbolWeightIndex].id === "diamond") list[symbolWeightIndex].weight = Math.max(1, list[symbolWeightIndex].weight - 1);
        if (list[symbolWeightIndex].id === "wild") list[symbolWeightIndex].weight = Math.max(1, list[symbolWeightIndex].weight - 1);
        if (list[symbolWeightIndex].id === "seven") list[symbolWeightIndex].weight = Math.max(2, list[symbolWeightIndex].weight - 1);
      }
    } else if (pred === "spiky") {
      for (var symbolWeightIndex2 = 0; symbolWeightIndex2 < list.length; symbolWeightIndex2++) {
        if (list[symbolWeightIndex2].id === "lemon") list[symbolWeightIndex2].weight = Math.max(10, list[symbolWeightIndex2].weight - 10);
        if (list[symbolWeightIndex2].id === "cherry") list[symbolWeightIndex2].weight = Math.max(10, list[symbolWeightIndex2].weight - 6);
        if (list[symbolWeightIndex2].id === "diamond") list[symbolWeightIndex2].weight += 2;
        if (list[symbolWeightIndex2].id === "wild") list[symbolWeightIndex2].weight += 1;
        if (list[symbolWeightIndex2].id === "seven") list[symbolWeightIndex2].weight += 2;
      }
    }

    if (mode === "owned") {
      for (var symbolWeightIndex3 = 0; symbolWeightIndex3 < list.length; symbolWeightIndex3++) {
        if (list[symbolWeightIndex3].id === "wild") list[symbolWeightIndex3].weight = Math.min(4, list[symbolWeightIndex3].weight + 1);
      }
    }
    return list;
  }

  Game.Casino = {
    ensureState: function () {
      if (!Game.state.casino || typeof Game.state.casino !== "object") Game.state.casino = {};
      var casino = Game.state.casino;
      if (typeof casino.uiPage !== "string") casino.uiPage = "lobby";

      if (typeof casino.balanceUsd !== "number" || !isFinite(casino.balanceUsd) || casino.balanceUsd < 0) casino.balanceUsd = 0;
      casino.balanceUsd = clampMoney(casino.balanceUsd);
      // All casino games use token balance only (no direct wallet betting).
      casino.fundsSource = "casino";
      if (typeof casino.totalDepositedUsd !== "number" || !isFinite(casino.totalDepositedUsd) || casino.totalDepositedUsd < 0) casino.totalDepositedUsd = 0;
      if (typeof casino.totalWithdrawnUsd !== "number" || !isFinite(casino.totalWithdrawnUsd) || casino.totalWithdrawnUsd < 0) casino.totalWithdrawnUsd = 0;

      if (!casino.slots || typeof casino.slots !== "object") casino.slots = {};
      if (typeof casino.slots.ownedMachines !== "number" || !isFinite(casino.slots.ownedMachines) || casino.slots.ownedMachines < 0) {
        casino.slots.ownedMachines = 0;
      }
      // Player-facing slots is always house-mode; owned slots operate as a business under `slots.machines`.
      casino.slots.mode = "house";
      if (typeof casino.slots.lastBet !== "number" || !isFinite(casino.slots.lastBet) || casino.slots.lastBet <= 0) casino.slots.lastBet = 10;
      if (!Array.isArray(casino.slots.lastReels) || casino.slots.lastReels.length !== 3) casino.slots.lastReels = ["cherry", "lemon", "star"];
      // Migration: old emoji reels → new ids.
      if (Array.isArray(casino.slots.lastReels) && casino.slots.lastReels.length === 3) {
        var map = {
          "🍋": "lemon",
          "🍒": "cherry",
          "🔔": "bell",
          "⭐": "star",
          "7️⃣": "seven",
          "💎": "diamond",
          "🃏": "wild"
        };
        for (var ri = 0; ri < casino.slots.lastReels.length; ri++) {
          var v = casino.slots.lastReels[ri];
          if (map[v]) casino.slots.lastReels[ri] = map[v];
        }
      }
      if (typeof casino.slots.lastPayout !== "number" || !isFinite(casino.slots.lastPayout)) casino.slots.lastPayout = 0;
      if (typeof casino.slots.lastJackpot !== "number" || !isFinite(casino.slots.lastJackpot)) casino.slots.lastJackpot = 0;
      if (typeof casino.slots.lastNet !== "number" || !isFinite(casino.slots.lastNet)) casino.slots.lastNet = 0;
      if (casino.slots.pendingSpin && typeof casino.slots.pendingSpin !== "object") casino.slots.pendingSpin = null;
      if (casino.slots.predictability !== "smooth" && casino.slots.predictability !== "balanced" && casino.slots.predictability !== "spiky") casino.slots.predictability = "balanced";
      if (typeof casino.slots.lossStreak !== "number" || !isFinite(casino.slots.lossStreak) || casino.slots.lossStreak < 0) casino.slots.lossStreak = 0;
      if (typeof casino.slots.freeSpins !== "number" || !isFinite(casino.slots.freeSpins) || casino.slots.freeSpins < 0) casino.slots.freeSpins = 0;
      if (typeof casino.slots.freeSpinsClaimDay !== "number" || !isFinite(casino.slots.freeSpinsClaimDay) || casino.slots.freeSpinsClaimDay < 0) casino.slots.freeSpinsClaimDay = 0;
      if (typeof casino.slots.dailySpinDay !== "number" || !isFinite(casino.slots.dailySpinDay) || casino.slots.dailySpinDay < 0) casino.slots.dailySpinDay = 0;
      if (typeof casino.slots.dailySpinCount !== "number" || !isFinite(casino.slots.dailySpinCount) || casino.slots.dailySpinCount < 0) casino.slots.dailySpinCount = 0;
      if (typeof casino.slots.dailySpinGoal1Claimed !== "boolean") casino.slots.dailySpinGoal1Claimed = !!casino.slots.dailySpinGoal1Claimed;
      if (typeof casino.slots.dailySpinGoal2Claimed !== "boolean") casino.slots.dailySpinGoal2Claimed = !!casino.slots.dailySpinGoal2Claimed;
      normalizeDailySpinProgress(casino.slots);
      if (typeof casino.slots.lastWasFreeSpin !== "boolean") casino.slots.lastWasFreeSpin = false;
      if (typeof casino.slots.lastWinChancePct !== "number" || !isFinite(casino.slots.lastWinChancePct) || casino.slots.lastWinChancePct < 0) casino.slots.lastWinChancePct = 0;
      if (typeof casino.slots.lastRtpPct !== "number" || !isFinite(casino.slots.lastRtpPct) || casino.slots.lastRtpPct < 0) casino.slots.lastRtpPct = 0;
      if (typeof casino.slots.autoSpinCount !== "number" || !isFinite(casino.slots.autoSpinCount) || casino.slots.autoSpinCount <= 0) casino.slots.autoSpinCount = 10;
      casino.slots.autoSpinCount = Math.max(1, Math.min(500, Math.floor(casino.slots.autoSpinCount)));

      if (!Array.isArray(casino.slots.machines)) casino.slots.machines = [];
      if (!casino.slots.owner || typeof casino.slots.owner !== "object") casino.slots.owner = {};
      var owner = casino.slots.owner;
      if (typeof owner.baseRtp !== "number" || !isFinite(owner.baseRtp) || owner.baseRtp <= 0) owner.baseRtp = 0.92;
      if (typeof owner.confidence !== "number" || !isFinite(owner.confidence) || owner.confidence < 0) owner.confidence = 0.15;
      if (owner.confidence > 1) owner.confidence = 1;
      if (!owner.schedule || typeof owner.schedule !== "object") owner.schedule = null;
      if (!owner.processed || typeof owner.processed !== "object") owner.processed = {};
      if (typeof owner.lastTickDay !== "number" || !isFinite(owner.lastTickDay) || owner.lastTickDay < 0) owner.lastTickDay = 0;
      if (typeof owner.lastTickMinute !== "number" || !isFinite(owner.lastTickMinute) || owner.lastTickMinute < 0) owner.lastTickMinute = 0;

      function normalizeMachine(m, idx) {
        if (!m || typeof m !== "object") m = {};
        if (typeof m.id !== "string" || !m.id) m.id = "slot-" + (Date.now().toString(36)) + "-" + idx;
        if (typeof m.name !== "string" || !m.name) m.name = "Slot Machine " + (idx + 1);
        if (typeof m.tokenFloatUsd !== "number" || !isFinite(m.tokenFloatUsd) || m.tokenFloatUsd < 0) m.tokenFloatUsd = 0;
        if (typeof m.cashFloatUsd !== "number" || !isFinite(m.cashFloatUsd) || m.cashFloatUsd < 0) m.cashFloatUsd = 0;
        if (typeof m.tokenTargetUsd !== "number" || !isFinite(m.tokenTargetUsd) || m.tokenTargetUsd < 0) m.tokenTargetUsd = 200;
        if (typeof m.staff !== "number" || !isFinite(m.staff) || m.staff < 0) m.staff = 0;
        if (typeof m.customerConfidence !== "number" || !isFinite(m.customerConfidence) || m.customerConfidence < 0) m.customerConfidence = 0.15;
        if (m.customerConfidence > 1) m.customerConfidence = 1;
        if (!m.stats || typeof m.stats !== "object") {
          m.stats = {
            todayVisits: 0,
            todayBets: 0,
            todayCashIn: 0,
            todayCashOut: 0,
            todayTokenIn: 0,
            todayTokenOut: 0
          };
        }
        return m;
      }
      for (var mi = 0; mi < casino.slots.machines.length; mi++) {
        casino.slots.machines[mi] = normalizeMachine(casino.slots.machines[mi], mi);
      }

      // Migration: convert ownedMachines count into actual machines list.
      if (casino.slots.ownedMachines > 0 && casino.slots.machines.length === 0) {
        for (var mci = 0; mci < casino.slots.ownedMachines; mci++) {
          casino.slots.machines.push(normalizeMachine({ tokenTargetUsd: 200 }, mci));
        }
      }
      casino.slots.ownedMachines = casino.slots.machines.length;

      if (!casino.blackjack || typeof casino.blackjack !== "object") casino.blackjack = {};
      if (typeof casino.blackjack.lastBet !== "number" || !isFinite(casino.blackjack.lastBet) || casino.blackjack.lastBet <= 0) casino.blackjack.lastBet = 25;
      if (casino.blackjack.round && typeof casino.blackjack.round !== "object") casino.blackjack.round = null;

      if (!casino.plinko || typeof casino.plinko !== "object") casino.plinko = {};
      if (casino.plinko.risk !== "low" && casino.plinko.risk !== "medium" && casino.plinko.risk !== "high") casino.plinko.risk = "medium";
      if (typeof casino.plinko.lastBet !== "number" || !isFinite(casino.plinko.lastBet) || casino.plinko.lastBet <= 0) casino.plinko.lastBet = 10;
      if (typeof casino.plinko.lastBin !== "number" || !isFinite(casino.plinko.lastBin) || casino.plinko.lastBin < 0) casino.plinko.lastBin = 5;
      if (typeof casino.plinko.lastMultiplier !== "number" || !isFinite(casino.plinko.lastMultiplier)) casino.plinko.lastMultiplier = 0;
      if (typeof casino.plinko.lastNet !== "number" || !isFinite(casino.plinko.lastNet)) casino.plinko.lastNet = 0;
      if (!Array.isArray(casino.plinko.lastPath)) casino.plinko.lastPath = [];
      if (typeof casino.plinko.lastPayout !== "number" || !isFinite(casino.plinko.lastPayout)) casino.plinko.lastPayout = 0;
    },

    getWalletUsd: function () {
      return getWalletUsd();
    },

    getCasinoBalanceUsd: function () {
      this.ensureState();
      return getCasinoBalanceUsd(Game.state.casino);
    },

    getTaxJackpotUsd: function () {
      return getTaxPoolUsd();
    },

    getOwnedSlotMachines: function () {
      this.ensureState();
      return Game.state.casino.slots.machines || [];
    },

    getSlotMachinePriceUsd: function () {
      this.ensureState();
      var owned = Array.isArray(Game.state.casino.slots.machines) ? Game.state.casino.slots.machines.length : 0;
      var base = 250;
      var growth = 1.45;
      return Math.round(base * Math.pow(growth, owned));
    },

    buySlotMachine: function () {
      this.ensureState();
      var price = this.getSlotMachinePriceUsd();
      if (!Game.spendMoney(price, "Bought slot machine")) return { ok: false, message: "Not enough money." };
      var slots = Game.state.casino.slots;
      var idx = Array.isArray(slots.machines) ? slots.machines.length : 0;
      if (!Array.isArray(slots.machines)) slots.machines = [];
      slots.machines.push({
        id: "slot-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e9).toString(36),
        name: "Slot Machine " + (idx + 1),
        tokenFloatUsd: 0,
        cashFloatUsd: 0,
        tokenTargetUsd: 200,
        staff: 0,
        customerConfidence: (slots.owner && typeof slots.owner.confidence === "number") ? slots.owner.confidence : 0.15,
        stats: { todayVisits: 0, todayBets: 0, todayCashIn: 0, todayCashOut: 0, todayTokenIn: 0, todayTokenOut: 0 }
      });
      // Legacy counter kept for save compatibility / UI badges.
      slots.ownedMachines = slots.machines.length;
      Game.addNotification("Slot machine delivered.");
      return { ok: true, priceUsd: price, owned: slots.machines.length };
    },

    setSlotMachineTokenTarget: function (machineId, targetUsd) {
      this.ensureState();
      var slots = Game.state.casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      for (var i = 0; i < machines.length; i++) {
        var m = machines[i];
        if (!m || m.id !== machineId) continue;
        var t = typeof targetUsd === "number" ? targetUsd : parseFloat(targetUsd);
        if (!isFinite(t) || t < 0) t = 0;
        if (t > 50000) t = 50000;
        m.tokenTargetUsd = Math.round(t);
        return { ok: true, targetUsd: m.tokenTargetUsd };
      }
      return { ok: false, message: "Machine not found." };
    },

    hireSlotMachineStaff: function (machineId, count) {
      this.ensureState();
      var slots = Game.state.casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      var n = typeof count === "number" ? count : parseInt(count, 10);
      if (!isFinite(n) || n <= 0) n = 1;
      if (n > 50) n = 50;
      var costPer = 120;
      var cost = costPer * n;
      if (!Game.spendMoney(cost, "Hired casino attendant")) return { ok: false, message: "Not enough money." };
      for (var i = 0; i < machines.length; i++) {
        var m = machines[i];
        if (!m || m.id !== machineId) continue;
        m.staff = (m.staff || 0) + n;
        Game.addNotification("Hired " + n + " attendant(s) for " + (m.name || "slot machine") + ".");
        return { ok: true, staff: m.staff };
      }
      return { ok: false, message: "Machine not found." };
    },

    ownerDepositTokens: function (machineId, amountUsd) {
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      var amt = typeof amountUsd === "number" ? amountUsd : parseFloat(amountUsd);
      if (!isFinite(amt) || amt <= 0) return { ok: false, message: "Invalid amount." };
      amt = clampMoney(amt);
      var available = getCasinoBalanceUsd(casino);
      if (amt > available) amt = available;
      if (amt <= 0) return { ok: false, message: "Not enough tokens." };
      for (var i = 0; i < machines.length; i++) {
        var m = machines[i];
        if (!m || m.id !== machineId) continue;
        casino.balanceUsd = clampMoney(available - amt);
        m.tokenFloatUsd = clampMoney((m.tokenFloatUsd || 0) + amt);
        return { ok: true, movedUsd: amt, machineTokenUsd: m.tokenFloatUsd, casinoTokensUsd: casino.balanceUsd };
      }
      return { ok: false, message: "Machine not found." };
    },

    ownerDepositCash: function (machineId, amountUsd) {
      this.ensureState();
      var slots = Game.state.casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      var amt = typeof amountUsd === "number" ? amountUsd : parseFloat(amountUsd);
      if (!isFinite(amt) || amt <= 0) return { ok: false, message: "Invalid amount." };
      amt = clampMoney(amt);
      var wallet = getWalletUsd();
      if (amt > wallet) amt = wallet;
      if (amt <= 0) return { ok: false, message: "Not enough money." };
      for (var i = 0; i < machines.length; i++) {
        var m = machines[i];
        if (!m || m.id !== machineId) continue;
        if (!Game.spendMoney(amt, "Loaded slot machine cash")) return { ok: false, message: "Not enough money." };
        m.cashFloatUsd = clampMoney((m.cashFloatUsd || 0) + amt);
        return { ok: true, movedUsd: amt, machineCashUsd: m.cashFloatUsd };
      }
      return { ok: false, message: "Machine not found." };
    },

    ownerDepositTokensAll: function (amountUsdEach) {
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      if (!machines.length) return { ok: false, message: "No machines." };
      var each = typeof amountUsdEach === "number" ? amountUsdEach : parseFloat(amountUsdEach);
      if (!isFinite(each) || each <= 0) return { ok: false, message: "Invalid amount." };
      each = clampMoney(each);
      var available = getCasinoBalanceUsd(casino);
      var movedTotal = 0;
      for (var i = 0; i < machines.length; i++) {
        if (available <= 0) break;
        var move = each;
        if (move > available) move = available;
        if (move <= 0) break;
        machines[i].tokenFloatUsd = clampMoney((machines[i].tokenFloatUsd || 0) + move);
        available = clampMoney(available - move);
        movedTotal = clampMoney(movedTotal + move);
      }
      casino.balanceUsd = available;
      return { ok: true, movedUsd: movedTotal, casinoTokensUsd: casino.balanceUsd };
    },

    ownerDepositCashAll: function (amountUsdEach) {
      this.ensureState();
      var slots = Game.state.casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      if (!machines.length) return { ok: false, message: "No machines." };
      var each = typeof amountUsdEach === "number" ? amountUsdEach : parseFloat(amountUsdEach);
      if (!isFinite(each) || each <= 0) return { ok: false, message: "Invalid amount." };
      each = clampMoney(each);
      var wallet = getWalletUsd();
      var movedTotal = 0;
      for (var i = 0; i < machines.length; i++) {
        if (wallet <= 0) break;
        var move = each;
        if (move > wallet) move = wallet;
        if (move <= 0) break;
        if (!Game.spendMoney(move, "Loaded slot machines cash")) break;
        machines[i].cashFloatUsd = clampMoney((machines[i].cashFloatUsd || 0) + move);
        wallet = getWalletUsd();
        movedTotal = clampMoney(movedTotal + move);
      }
      return { ok: true, movedUsd: movedTotal };
    },

    tick: function (minutes) {
      this.ensureState();
      this.tickOwnedSlots(minutes);
    },

    tickOwnedSlots: function (minutes) {
      if (typeof minutes !== "number" || !isFinite(minutes) || minutes <= 0) return;
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      var machines = Array.isArray(slots.machines) ? slots.machines : [];
      if (!machines.length) return;

      var owner = slots.owner || {};
      var minuteOfDay = Math.floor(Game.state.timeMinutes || 0);
      if (!isFinite(minuteOfDay) || minuteOfDay < 0) minuteOfDay = 0;
      minuteOfDay = minuteOfDay % (24 * 60);

      // Build a retail-like daily schedule (5 minute slots, 07:00-21:59).
      if (!owner.schedule || !owner.schedule.slots || owner.schedule.day !== Game.state.day) {
        var candidateSlots = [];
        for (var slot = 0; slot < 288; slot++) {
          var totalMinutes = slot * 5;
          var hour = Math.floor(totalMinutes / 60);
          if (hour >= 7 && hour <= 21) candidateSlots.push(slot);
        }

        var baseVisitsPerMachine = 8;
        var conf = (typeof owner.confidence === "number" && isFinite(owner.confidence)) ? owner.confidence : 0.15;
        var confMult = 0.7 + (conf * 1.2);
        var expectedVisits = machines.length * baseVisitsPerMachine * confMult;
        var eventsCount = Math.max(12, Math.min(candidateSlots.length, Math.round(expectedVisits / 1.4) || 12));

        for (var i2 = candidateSlots.length - 1; i2 > 0; i2--) {
          var j2 = Math.floor(Math.random() * (i2 + 1));
          var tmp = candidateSlots[i2];
          candidateSlots[i2] = candidateSlots[j2];
          candidateSlots[j2] = tmp;
        }
        var slotsPicked = candidateSlots.slice(0, eventsCount);
        var slotSet = {};
        for (var k = 0; k < slotsPicked.length; k++) slotSet["s" + slotsPicked[k]] = true;
        owner.schedule = { day: Game.state.day, slots: slotsPicked, slotSet: slotSet };
        owner.processed = {};
        owner.lastTickDay = Game.state.day;
        owner.lastTickMinute = Math.max(0, minuteOfDay - Math.max(1, Math.ceil(minutes)));
        slots.owner = owner;
      }

      if (typeof owner.lastTickDay !== "number" || !isFinite(owner.lastTickDay)) owner.lastTickDay = Game.state.day;
      if (typeof owner.lastTickMinute !== "number" || !isFinite(owner.lastTickMinute)) owner.lastTickMinute = Math.max(0, minuteOfDay - Math.max(1, Math.ceil(minutes)));
      if (owner.lastTickDay !== Game.state.day) {
        owner.lastTickDay = Game.state.day;
        owner.lastTickMinute = 0;
        owner.processed = {};
        if (owner.schedule) owner.schedule.day = Game.state.day;
      }

      var startMinute = owner.lastTickMinute;
      if (!isFinite(startMinute) || startMinute < 0) startMinute = 0;
      if (startMinute > minuteOfDay) startMinute = 0;
      var startSlot = Math.floor(startMinute / 5);
      var endSlot = Math.floor(minuteOfDay / 5);

      function clamp(v, lo, hi) {
        if (!isFinite(v)) return lo;
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
      }

      function effectiveOwnerRtp() {
        var base = (typeof owner.baseRtp === "number" && isFinite(owner.baseRtp) && owner.baseRtp > 0) ? owner.baseRtp : 0.92;
        var revMult = (Game.Prestige && typeof Game.Prestige.getCompanyRevenueMultiplier === "function") ? Game.Prestige.getCompanyRevenueMultiplier() : 1;
        if (typeof revMult !== "number" || !isFinite(revMult) || revMult <= 0) revMult = 1;
        // Higher revenue multiplier = slightly lower customer RTP (more profit).
        var rtp = base / Math.pow(revMult, 0.35);
        return clamp(rtp, 0.75, 0.97);
      }

      function pickMachineForVisit() {
        // Prefer machines that can actually serve customers.
        var choices = [];
        var totalW = 0;
        for (var i = 0; i < machines.length; i++) {
          var m = machines[i];
          if (!m) continue;
          var token = (m.tokenFloatUsd || 0);
          var cash = (m.cashFloatUsd || 0);
          var w = 1;
          if (token > 25) w += 2;
          if (cash > 50) w += 2;
          w += (m.staff || 0) * 0.15;
          if (w < 0.1) w = 0.1;
          choices.push({ m: m, w: w });
          totalW += w;
        }
        if (!choices.length) return null;
        var roll = Math.random() * totalW;
        for (var j = 0; j < choices.length; j++) {
          roll -= choices[j].w;
          if (roll <= 0) return choices[j].m;
        }
        return choices[choices.length - 1].m;
      }

      function ensureStats(m) {
        if (!m.stats || typeof m.stats !== "object") {
          m.stats = { todayVisits: 0, todayBets: 0, todayCashIn: 0, todayCashOut: 0, todayTokenIn: 0, todayTokenOut: 0 };
        }
        return m.stats;
      }

      function refillTokens(m) {
        var staff = (m.staff || 0);
        if (!(staff > 0)) return;
        var target = (typeof m.tokenTargetUsd === "number" && isFinite(m.tokenTargetUsd) && m.tokenTargetUsd > 0) ? m.tokenTargetUsd : 0;
        var cur = (typeof m.tokenFloatUsd === "number" && isFinite(m.tokenFloatUsd)) ? m.tokenFloatUsd : 0;
        var need = target - cur;
        if (!(need > 0.01)) return;
        var available = getCasinoBalanceUsd(casino);
        if (!(available > 0.01)) return;
        var rate = staff * 35; // tokens per 5-min slot
        var move = Math.min(need, rate, available);
        move = clampMoney(move);
        if (move <= 0) return;
        casino.balanceUsd = clampMoney(available - move);
        m.tokenFloatUsd = clampMoney(cur + move);
      }

      function simulateCustomerVisit(m) {
        if (!m) return;
        ensureStats(m);
        refillTokens(m);
        var tokenFloat = (m.tokenFloatUsd || 0);
        var cashFloat = (m.cashFloatUsd || 0);
        if (tokenFloat <= 0.5 || cashFloat <= 0.5) return;

        var globalConf = (typeof owner.confidence === "number" && isFinite(owner.confidence)) ? owner.confidence : 0.15;
        var mc = (typeof m.customerConfidence === "number" && isFinite(m.customerConfidence)) ? m.customerConfidence : globalConf;
        mc = clamp(mc, 0, 1);

        var walletUsd = 20 + Math.random() * (80 + mc * 220);
        walletUsd = clampMoney(walletUsd);

        var buyFrac = 0.35 + mc * 0.45;
        var desiredTokens = walletUsd * buyFrac;
        desiredTokens = clampMoney(desiredTokens);
        // Customers can't buy more tokens than the machine has.
        var tokensToBuy = Math.min(desiredTokens, tokenFloat);
        if (tokensToBuy < 1) return;

        // Buy tokens: customer pays cash into the machine, receives tokens.
        m.cashFloatUsd = clampMoney(cashFloat + tokensToBuy);
        m.tokenFloatUsd = clampMoney(tokenFloat - tokensToBuy);
        m.stats.todayCashIn = clampMoney(m.stats.todayCashIn + tokensToBuy);
        walletUsd = clampMoney(walletUsd - tokensToBuy);
        var customerTokens = tokensToBuy;

        // Random bets per visit; confidence increases bet size.
        var bets = 2 + Math.floor(Math.random() * (6 + mc * 18));
        var rtp = effectiveOwnerRtp();
        var symbols = getSlotsSymbolsForMode("house", slots.predictability);
        var byId = {};
        for (var si = 0; si < symbols.length; si++) byId[symbols[si].id] = symbols[si];

        var betBase = 1 + mc * 14;
        for (var bi = 0; bi < bets; bi++) {
          if (customerTokens < 1) break;
          var bet = betBase * (0.6 + Math.random() * 1.2);
          bet = clampMoney(bet);
          if (bet < 1) bet = 1;
          if (bet > customerTokens) bet = customerTokens;
          if (bet <= 0) break;

          // Customer stakes tokens: they move into the machine.
          customerTokens = clampMoney(customerTokens - bet);
          m.tokenFloatUsd = clampMoney((m.tokenFloatUsd || 0) + bet);
          m.stats.todayTokenIn = clampMoney(m.stats.todayTokenIn + bet);
          m.stats.todayBets += 1;

          var reels = [pickWeighted(symbols).id, pickWeighted(symbols).id, pickWeighted(symbols).id];
          reels = applySlotsPredictabilityAdjustments(reels, { predictability: slots.predictability, lossStreak: 0 });
          var evalRes = evaluateSlotsReels(reels, byId);
          var mult = evalRes.multiplier || 0;
          var payoutTokens = clampMoney(bet * mult * rtp);
          if (payoutTokens > 0) {
            var availableTokens = (m.tokenFloatUsd || 0);
            if (payoutTokens > availableTokens) payoutTokens = availableTokens;
            if (payoutTokens > 0) {
              m.tokenFloatUsd = clampMoney(availableTokens - payoutTokens);
              customerTokens = clampMoney(customerTokens + payoutTokens);
              m.stats.todayTokenOut = clampMoney(m.stats.todayTokenOut + payoutTokens);
            }
          }
        }

        // Cash out tokens: machine pays cash, receives tokens back.
        var cashPay = Math.min(customerTokens, (m.cashFloatUsd || 0));
        cashPay = clampMoney(cashPay);
        if (cashPay > 0) {
          m.cashFloatUsd = clampMoney((m.cashFloatUsd || 0) - cashPay);
          m.tokenFloatUsd = clampMoney((m.tokenFloatUsd || 0) + cashPay);
          customerTokens = clampMoney(customerTokens - cashPay);
          walletUsd = clampMoney(walletUsd + cashPay);
          m.stats.todayCashOut = clampMoney(m.stats.todayCashOut + cashPay);
        }

        m.stats.todayVisits += 1;
        // Confidence slowly increases with visits, slightly faster if the machine had enough cash to pay out.
        var confGain = 0.0015 + (cashPay > 0 ? 0.0006 : 0);
        owner.confidence = clamp(owner.confidence + confGain, 0, 1);
        m.customerConfidence = clamp(mc + confGain * 0.8, 0, 1);
      }

      function processSlot(slot) {
        if (!owner.schedule || !owner.schedule.slotSet) return;
        var key = "s" + slot;
        if (!owner.schedule.slotSet[key] || owner.processed[key]) return;
        // Refill tokens each scheduled window even if a visit can't happen.
        for (var i = 0; i < machines.length; i++) refillTokens(machines[i]);
        var m = pickMachineForVisit();
        simulateCustomerVisit(m);
        owner.processed[key] = true;
      }

      for (var slotIdx = startSlot; slotIdx <= endSlot; slotIdx++) {
        processSlot(slotIdx % 288);
      }

      owner.lastTickDay = Game.state.day;
      owner.lastTickMinute = minuteOfDay;
      slots.owner = owner;
    },

    setFundsSource: function (source) {
      this.ensureState();
      // Deprecated: casino always uses tokens.
      Game.state.casino.fundsSource = "casino";
    },

    depositUsd: function (amountUsd) {
      this.ensureState();
      var casino = Game.state.casino;
      var usd = clampBet(amountUsd, 1, 1000000000);
      var wallet = getWalletUsd();
      if (usd > wallet) usd = wallet;
      usd = clampMoney(usd);
      if (usd <= 0) return { ok: false, message: "Nothing to deposit." };
      if (!Game.spendMoney(usd, null)) return { ok: false, message: "Not enough money." };
      casino.balanceUsd = clampMoney(getCasinoBalanceUsd(casino) + usd);
      casino.totalDepositedUsd = clampMoney((casino.totalDepositedUsd || 0) + usd);
      Game.addNotification("Bought $" + usd.toFixed(2) + " in tokens.");
      return { ok: true, amountUsd: usd, balanceUsd: casino.balanceUsd };
    },

    withdrawUsd: function (amountUsd) {
      this.ensureState();
      var casino = Game.state.casino;
      var usd = clampBet(amountUsd, 1, 1000000000);
      var bal = getCasinoBalanceUsd(casino);
      if (usd > bal) usd = bal;
      usd = clampMoney(usd);
      if (usd <= 0) return { ok: false, message: "Nothing to withdraw." };
      casino.balanceUsd = clampMoney(bal - usd);
      casino.totalWithdrawnUsd = clampMoney((casino.totalWithdrawnUsd || 0) + usd);
      Game.addMoney(usd, "Cashed out tokens");
      return { ok: true, amountUsd: usd, balanceUsd: casino.balanceUsd };
    },

    claimDailyFreeSpins: function () {
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      var status = getDailySpinStatus(slots);
      if (!status.canClaim) {
        if (status.target > 0) {
          var remaining = Math.max(0, status.target - (status.count || 0));
          return { ok: false, message: "Spin " + remaining + " more time" + (remaining === 1 ? "" : "s") + " today to unlock free spins." };
        }
        return { ok: false, message: "Daily free spin goals already completed." };
      }
      var added = awardDailySpinRewards(slots);
      return { ok: true, added: added, freeSpins: slots.freeSpins };
    },

    getDailyFreeSpinStatus: function () {
      this.ensureState();
      return getDailySpinStatus(Game.state.casino.slots);
    },

    getSlotsPaytable: function () {
      return getSlotsPaytable();
    },

    getSlotsMath: function (mode, predictability) {
      this.ensureState();
      var slots = Game.state.casino.slots;
      var resolvedMode = "house";
      var pred = predictability || slots.predictability;
      var symbols = getSlotsSymbolsForMode(resolvedMode, pred);
      var byId = {};
      var totalWeight = 0;
      for (var si = 0; si < symbols.length; si++) {
        byId[symbols[si].id] = symbols[si];
        totalWeight += symbols[si].weight;
      }
      if (totalWeight <= 0) totalWeight = 1;

      var expectedMultiplier = 0;
      var winChance = 0;
      var bigWinChance = 0;
      for (var firstIndex = 0; firstIndex < symbols.length; firstIndex++) {
        for (var secondIndex = 0; secondIndex < symbols.length; secondIndex++) {
          for (var thirdIndex = 0; thirdIndex < symbols.length; thirdIndex++) {
            var p = (symbols[firstIndex].weight / totalWeight) * (symbols[secondIndex].weight / totalWeight) * (symbols[thirdIndex].weight / totalWeight);
            var evalRes = evaluateSlotsReels([symbols[firstIndex].id, symbols[secondIndex].id, symbols[thirdIndex].id], byId);
            var mult = evalRes.multiplier || 0;
            expectedMultiplier += p * mult;
            if (mult > 0) winChance += p;
            if (mult >= 10) bigWinChance += p;
          }
        }
      }

      var rtp = 0.92;
      return {
        mode: resolvedMode,
        predictability: pred,
        winChancePct: winChance * 100,
        bigWinChancePct: bigWinChance * 100,
        rtpPct: expectedMultiplier * rtp * 100
      };
    },

    beginSlotsSpin: function (betUsd, mode, opts) {
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      if (slots.pendingSpin) return { ok: false, message: "Spin already in progress." };

      var resolvedMode = "house";
      var maxBet = 250;

      var useFreeSpin = !!(opts && opts.useFreeSpin && (slots.freeSpins || 0) > 0);
      var bet = clampBet(betUsd, 1, maxBet);
      if (useFreeSpin && (!isFinite(betUsd) || betUsd <= 0)) {
        bet = clampBet(slots.lastBet || 10, 1, maxBet);
      }

      slots.lastBet = bet;
      slots.mode = "house";

      if (useFreeSpin) {
        var bypassCount = !!(opts && opts.bypassFreeSpinCheck);
        if (!bypassCount) {
          var balCheck = getCasinoBalanceUsd(casino);
          if (bet > balCheck) return { ok: false, message: "Not enough tokens for that bet." };
          slots.freeSpins = Math.max(0, (slots.freeSpins || 0) - 1);
        }
      } else {
        var okSpend = spendSelectedFunds(casino, bet, "Slots bet");
        if (!okSpend) {
          return { ok: false, message: "Not enough tokens." };
        }
      }

      normalizeDailySpinProgress(slots);
      if (!useFreeSpin) {
        slots.dailySpinCount = (slots.dailySpinCount || 0) + 1;
      }
      awardDailySpinRewards(slots);

      var symbols = getSlotsSymbolsForMode(resolvedMode, slots.predictability);
      var byId = {};
      for (var si = 0; si < symbols.length; si++) byId[symbols[si].id] = symbols[si];

      var reels = [pickWeighted(symbols).id, pickWeighted(symbols).id, pickWeighted(symbols).id];
      reels = applySlotsPredictabilityAdjustments(reels, slots);

      var starSpins = countSymbolInReels(reels, "star");
      var starAutoSpins = (starSpins > 0) ? starSpins : 0;

      var evalRes = evaluateSlotsReels(reels, byId);
      var multiplier = evalRes.multiplier || 0;
      var rtp = 0.92;
      var payout = clampMoney(bet * multiplier * rtp * CASINO_REWARD_MULT);

      var isTaxJackpot = (evalRes.kind === "3" && (evalRes.symbol === "wild" || evalRes.symbol === "seven"));
      var jackpotPreviewUsd = isTaxJackpot ? clampMoney(getTaxPoolUsd() * CASINO_REWARD_MULT) : 0;

      var spinId = "slots-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1000000000).toString(36);
      slots.pendingSpin = {
        id: spinId,
        startedAt: Date.now(),
        mode: resolvedMode,
        betUsd: bet,
        reels: reels,
        symbol: evalRes.symbol,
        match: evalRes.kind,
        multiplier: multiplier,
        payoutUsd: payout,
        isTaxJackpot: isTaxJackpot,
        jackpotPreviewUsd: jackpotPreviewUsd,
        isFreeSpin: useFreeSpin,
        starAutoSpins: starAutoSpins
      };

      var math = this.getSlotsMath(resolvedMode, slots.predictability);
      if (math) {
        slots.lastWinChancePct = math.winChancePct || 0;
        slots.lastRtpPct = math.rtpPct || 0;
      }

      return {
        ok: true,
        spinId: spinId,
        mode: resolvedMode,
        betUsd: bet,
        reels: reels,
        symbol: evalRes.symbol,
        match: evalRes.kind,
        multiplier: multiplier,
        payoutUsd: payout,
        jackpotUsd: jackpotPreviewUsd,
        isTaxJackpot: isTaxJackpot,
        isFreeSpin: useFreeSpin,
        freeSpinsLeft: slots.freeSpins || 0,
        starAutoSpins: starAutoSpins
      };
    },

    completeSlotsSpin: function (spinId) {
      this.ensureState();
      var casino = Game.state.casino;
      var slots = casino.slots;
      var pending = slots.pendingSpin;
      if (!pending || pending.id !== spinId) return { ok: false, message: "No pending spin." };

      var payout = clampMoney(pending.payoutUsd || 0);
      var jackpot = pending.isTaxJackpot ? takeTaxPoolUsd() : 0;
      jackpot = clampMoney(jackpot);
      jackpot = clampMoney(jackpot * CASINO_REWARD_MULT);
      var total = clampMoney(payout + jackpot);

      slots.lastReels = pending.reels;
      slots.lastPayout = payout;
      slots.lastJackpot = jackpot;
      slots.lastWasFreeSpin = !!pending.isFreeSpin;

      if (payout > 0) creditSelectedFunds(casino, payout, "Slots payout");
      if (jackpot > 0) creditSelectedFunds(casino, jackpot, "TAX JACKPOT");

      var cost = pending.isFreeSpin ? 0 : clampMoney(pending.betUsd || 0);
      var net = clampMoney(total - cost);
      slots.lastNet = net;

      if (total > 0) slots.lossStreak = 0;
      else slots.lossStreak = (slots.lossStreak || 0) + 1;

      slots.pendingSpin = null;
      return {
        ok: true,
        payoutUsd: payout,
        jackpotUsd: jackpot,
        totalWinUsd: total,
        netUsd: net
      };
    },

    // Backwards-compatible helper: resolves immediately (no animation delay).
    spinSlots: function (betUsd, mode, opts) {
      var begun = this.beginSlotsSpin(betUsd, mode, opts);
      if (!begun || !begun.ok) return begun;
      return this.completeSlotsSpin(begun.spinId);
    },

    startBlackjack: function (betUsd) {
      this.ensureState();
      var casino = Game.state.casino;
      var maxBet = 500;
      var bet = clampBet(betUsd, 1, maxBet);
      casino.blackjack.lastBet = bet;

      if (!spendSelectedFunds(casino, bet, "Blackjack bet")) {
        return { ok: false, message: "Not enough tokens." };
      }

      var round = {
        status: "playing", // playing | settled
        betUsd: bet,
        player: [drawCard(), drawCard()],
        dealer: [drawCard(), drawCard()],
        dealerRevealed: false,
        canDouble: true,
        settled: null,
        deltaUsd: 0
      };

      casino.blackjack.round = round;

      var playerTotal = calcBlackjackTotal(round.player);
      var dealerTotal = calcBlackjackTotal(round.dealer);
      var playerBlackjack = (round.player.length === 2 && playerTotal === 21);
      var dealerBlackjack = (round.dealer.length === 2 && dealerTotal === 21);
      if (playerBlackjack || dealerBlackjack) {
        return this._settleBlackjack();
      }

      return { ok: true, round: round };
    },

    blackjackHit: function () {
      this.ensureState();
      var round = Game.state.casino.blackjack.round;
      if (!round || round.status !== "playing") return { ok: false, message: "No active hand." };
      round.player.push(drawCard());
      round.canDouble = false;
      var playerTotal = calcBlackjackTotal(round.player);
      if (playerTotal > 21) return this._settleBlackjack();
      return { ok: true, round: round };
    },

    blackjackStand: function () {
      this.ensureState();
      var round = Game.state.casino.blackjack.round;
      if (!round || round.status !== "playing") return { ok: false, message: "No active hand." };
      return this._settleBlackjack();
    },

    blackjackDouble: function () {
      this.ensureState();
      var round = Game.state.casino.blackjack.round;
      if (!round || round.status !== "playing") return { ok: false, message: "No active hand." };
      if (!round.canDouble) return { ok: false, message: "Double not available." };
      var casino = Game.state.casino;
      if (!spendSelectedFunds(casino, round.betUsd, "Blackjack double")) return { ok: false, message: "Not enough tokens to double." };
      round.betUsd = clampMoney(round.betUsd * 2);
      round.canDouble = false;
      round.player.push(drawCard());
      return this._settleBlackjack();
    },

    _settleBlackjack: function () {
      var round = Game.state.casino.blackjack.round;
      if (!round || round.status !== "playing") return { ok: false, message: "No active hand." };

      round.dealerRevealed = true;

      var playerTotal = calcBlackjackTotal(round.player);
      var dealerTotal = calcBlackjackTotal(round.dealer);
      var playerBlackjack = (round.player.length === 2 && playerTotal === 21);
      var dealerBlackjack = (round.dealer.length === 2 && dealerTotal === 21);

      if (playerTotal <= 21 && !playerBlackjack) {
        // Dealer draws to 17, stands on soft 17.
        while (dealerTotal < 17) {
          round.dealer.push(drawCard());
          dealerTotal = calcBlackjackTotal(round.dealer);
        }
      }

      var delta = 0;
      var settled = "push";

      if (playerBlackjack && !dealerBlackjack) {
        settled = "win";
        // Pay 3:2 (profit), plus return stake.
        delta = round.betUsd * 2.5;
      } else if (dealerBlackjack && !playerBlackjack) {
        settled = "lose";
        delta = 0;
      } else if (playerTotal > 21) {
        settled = "lose";
        delta = 0;
      } else if (dealerTotal > 21) {
        settled = "win";
        delta = round.betUsd * 2;
      } else if (playerTotal > dealerTotal) {
        settled = "win";
        delta = round.betUsd * 2;
      } else if (playerTotal < dealerTotal) {
        settled = "lose";
        delta = 0;
      } else {
        settled = "push";
        delta = round.betUsd;
      }

      if (settled === "win") {
        delta = delta * CASINO_REWARD_MULT;
      }
      delta = clampMoney(delta);
      if (delta > 0) {
        creditSelectedFunds(Game.state.casino, delta, "Blackjack " + settled);
      } else if (settled === "lose") {
        Game.addNotification("Blackjack lost.");
      }

      // deltaUsd is net relative to initial stake spend(s); since we spend upfront, net is delta - bet.
      var net = clampMoney(delta - round.betUsd);
      round.status = "settled";
      round.settled = settled;
      round.deltaUsd = net;

      return { ok: true, round: round };
    },

    clearBlackjack: function () {
      this.ensureState();
      Game.state.casino.blackjack.round = null;
    },

    dropPlinko: function (betUsd, risk) {
      this.ensureState();
      var casino = Game.state.casino;
      var chosenRisk = (risk === "low" || risk === "medium" || risk === "high") ? risk : casino.plinko.risk;
      casino.plinko.risk = chosenRisk;

      var maxBet = chosenRisk === "high" ? 200 : (chosenRisk === "medium" ? 500 : 1000);
      var bet = clampBet(betUsd, 1, maxBet);
      casino.plinko.lastBet = bet;

      if (!spendSelectedFunds(casino, bet, "Plinko bet")) {
        return { ok: false, message: "Not enough tokens." };
      }

      var rows = 10;
      var rightCount = 0;
      var path = [];
      for (var row = 0; row < rows; row++) {
        var goRight = Math.random() < 0.5;
        path.push(goRight ? 1 : 0);
        if (goRight) rightCount += 1;
      }

      var multipliersByRisk = {
        low: [0.6, 0.75, 0.9, 1.05, 1.25, 1.55, 1.25, 1.05, 0.9, 0.75, 0.6],
        medium: [0.2, 0.35, 0.6, 0.9, 1.35, 2.2, 1.35, 0.9, 0.6, 0.35, 0.2],
        high: [0, 0.1, 0.25, 0.6, 1.4, 5.0, 1.4, 0.6, 0.25, 0.1, 0]
      };

      var multipliers = multipliersByRisk[chosenRisk] || multipliersByRisk.medium;
      var baseMultiplier = multipliers[rightCount] || 0;
      var rtp = chosenRisk === "high" ? 0.94 : (chosenRisk === "medium" ? 0.955 : 0.97);
      var payout = clampMoney(bet * baseMultiplier * rtp * CASINO_REWARD_MULT);
      if (payout > 0) creditSelectedFunds(casino, payout, "Plinko payout");

      var net = clampMoney(payout - bet);
      casino.plinko.lastBin = rightCount;
      casino.plinko.lastMultiplier = baseMultiplier;
      casino.plinko.lastNet = net;
      casino.plinko.lastPath = path;
      casino.plinko.lastPayout = payout;

      return {
        ok: true,
        risk: chosenRisk,
        betUsd: bet,
        bin: rightCount,
        multiplier: baseMultiplier,
        payoutUsd: payout,
        netUsd: net,
        path: path,
        rows: rows
      };
    }
  };
})();
