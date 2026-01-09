// Banking system: loans, credit score, interest and repayments.
// Depends on Game.state, Game.addNotification, Game.addMoney, Game.spendMoney and Game.registerDailyHandler.

Game.Bank = {
  loanTermDays: 28,
  depositInterestRateDaily: 0.0005, // 0.05% per in-game day
  getState: function () {
    if (!Game.state.bank) {
      Game.state.bank = {
        loanPrincipal: 0,
        loanOriginal: 0,
        dailyInterestRate: 0,
        maxLoan: 1000,
        creditScore: 600,
        creditInquiries: 0,
        goodPaymentDays: 0,
        missedPaymentDays: 0,
        pendingOffer: null,
        depositBalance: 0,
        depositHistory: [],
        payLoanFromDeposits: false,
        depositInterestToBank: true,
        depositInterestScheduleDay: 0,
        depositInterestScheduledMinute: 0,
        depositInterestBaseBalance: 0,
        depositInterestPaidDay: 0,
        depositInterestLastAmount: 0,
        depositInterestLastDay: 0,
        depositInterestLastMinute: 0
      };
    }
    var b = Game.state.bank;
    if (!Object.prototype.hasOwnProperty.call(b, "pendingOffer")) {
      b.pendingOffer = null;
    }
    if (typeof b.creditInquiries !== "number") b.creditInquiries = 0;
    if (typeof b.depositBalance !== "number" || !isFinite(b.depositBalance) || b.depositBalance < 0) b.depositBalance = 0;
    if (!Array.isArray(b.depositHistory)) b.depositHistory = [];
    if (typeof b.payLoanFromDeposits !== "boolean") b.payLoanFromDeposits = false;
    if (typeof b.depositInterestToBank !== "boolean") b.depositInterestToBank = true;
    if (typeof b.depositInterestScheduleDay !== "number" || !isFinite(b.depositInterestScheduleDay)) b.depositInterestScheduleDay = 0;
    if (typeof b.depositInterestScheduledMinute !== "number" || !isFinite(b.depositInterestScheduledMinute)) b.depositInterestScheduledMinute = 0;
    if (typeof b.depositInterestBaseBalance !== "number" || !isFinite(b.depositInterestBaseBalance)) b.depositInterestBaseBalance = b.depositBalance || 0;
    if (typeof b.depositInterestPaidDay !== "number" || !isFinite(b.depositInterestPaidDay)) b.depositInterestPaidDay = 0;
    if (typeof b.depositInterestLastAmount !== "number" || !isFinite(b.depositInterestLastAmount)) b.depositInterestLastAmount = 0;
    if (typeof b.depositInterestLastDay !== "number" || !isFinite(b.depositInterestLastDay)) b.depositInterestLastDay = 0;
    if (typeof b.depositInterestLastMinute !== "number" || !isFinite(b.depositInterestLastMinute)) b.depositInterestLastMinute = 0;
    if (b.depositHistory.length > 120) b.depositHistory = b.depositHistory.slice(-120);
    if (!b.depositInterestScheduleDay || b.depositInterestScheduleDay <= 0 || !b.depositInterestScheduledMinute) {
      var s = Game.state || { day: 1, timeMinutes: 0 };
      var day = s.day || 1;
      var nowMin = Math.floor(s.timeMinutes || 0);
      var scheduleDay = nowMin > 185 ? (day + 1) : day;
      b.depositInterestScheduleDay = scheduleDay;
      b.depositInterestScheduledMinute = 150 + Math.floor(Math.random() * 36); // 02:30 to 03:05
      b.depositInterestBaseBalance = b.depositBalance || 0;
    }
    return b;
  },
  _recordDepositHistory: function (kind, amount, note) {
    var b = Game.Bank.getState();
    var s = Game.state || { day: 1, timeMinutes: 0 };
    var entry = {
      day: s.day || 1,
      minute: Math.floor(s.timeMinutes || 0),
      kind: String(kind || ""),
      amount: typeof amount === "number" && isFinite(amount) ? amount : 0,
      balanceAfter: b.depositBalance || 0
    };
    if (note) entry.note = String(note);
    b.depositHistory.push(entry);
    if (b.depositHistory.length > 120) b.depositHistory = b.depositHistory.slice(-120);
  },
  deposit: function (amount) {
    var b = Game.Bank.getState();
    var a = typeof amount === "number" ? amount : parseFloat(amount);
    if (!isFinite(a) || a <= 0) {
      Game.addNotification("Enter a positive deposit amount.");
      return false;
    }
    a = Math.round(a * 100) / 100;
    if (a <= 0) return false;
    if (!Game.spendMoney(a, "Bank deposit")) {
      Game.addNotification("You do not have enough money to deposit that amount.");
      return false;
    }
    b.depositBalance += a;
    Game.Bank._recordDepositHistory("deposit", a);
    return true;
  },
  withdraw: function (amount) {
    var b = Game.Bank.getState();
    var a = typeof amount === "number" ? amount : parseFloat(amount);
    if (!isFinite(a) || a <= 0) {
      Game.addNotification("Enter a positive withdrawal amount.");
      return false;
    }
    a = Math.round(a * 100) / 100;
    if (a <= 0) return false;
    if ((b.depositBalance || 0) < a) {
      Game.addNotification("You do not have enough bank balance to withdraw that amount.");
      return false;
    }
    b.depositBalance -= a;
    if (b.depositBalance < 0) b.depositBalance = 0;
    Game.addMoney(a, "Bank withdrawal");
    Game.Bank._recordDepositHistory("withdraw", a);
    return true;
  },
  scheduleDepositInterestForDay: function (day) {
    var b = Game.Bank.getState();
    var d = typeof day === "number" ? day : parseInt(day, 10);
    if (!isFinite(d) || d <= 0) d = 1;
    if (b.depositInterestScheduleDay === d && typeof b.depositInterestScheduledMinute === "number" && isFinite(b.depositInterestScheduledMinute) && b.depositInterestScheduledMinute > 0) {
      // Always refresh the snapshot at scheduling time (midnight), even if the time was already chosen.
      b.depositInterestBaseBalance = b.depositBalance || 0;
      return;
    }
    b.depositInterestScheduleDay = d;
    b.depositInterestScheduledMinute = 150 + Math.floor(Math.random() * 36); // 02:30 to 03:05
    b.depositInterestBaseBalance = b.depositBalance || 0; // end-of-day balance snapshot (captured at midnight)
  },
  payDepositInterest: function () {
    var b = Game.Bank.getState();
    var day = b.depositInterestScheduleDay || (Game.state && Game.state.day) || 1;
    if (b.depositInterestPaidDay === day) return false;
    var base = typeof b.depositInterestBaseBalance === "number" && isFinite(b.depositInterestBaseBalance) ? b.depositInterestBaseBalance : (b.depositBalance || 0);
    if (base <= 0) {
      b.depositInterestPaidDay = day;
      b.depositInterestLastAmount = 0;
      b.depositInterestLastDay = day;
      b.depositInterestLastMinute = b.depositInterestScheduledMinute || 0;
      return false;
    }
    var rate = Game.Bank.depositInterestRateDaily || 0.0005;
    if (Game.Prestige && typeof Game.Prestige.getDepositInterestMultiplier === "function") {
      rate *= Game.Prestige.getDepositInterestMultiplier();
    }
    var interest = base * rate;
    interest = Math.round(interest * 100) / 100;
    if (!isFinite(interest) || interest <= 0) {
      b.depositInterestPaidDay = day;
      b.depositInterestLastAmount = 0;
      b.depositInterestLastDay = day;
      b.depositInterestLastMinute = b.depositInterestScheduledMinute || 0;
      return false;
    }
    if (b.depositInterestToBank) {
      b.depositBalance += interest;
      Game.Bank._recordDepositHistory("interest", interest);
      Game.addNotification("+$" + interest.toFixed(2) + " (Bank deposit interest)");
    } else {
      Game.addMoney(interest, null);
      Game.addNotification("+$" + interest.toFixed(2) + " (Bank deposit interest to wallet)");
      Game.Bank._recordDepositHistory("interest", interest, "Paid to wallet");
    }
    b.depositInterestPaidDay = day;
    b.depositInterestLastAmount = interest;
    b.depositInterestLastDay = day;
    b.depositInterestLastMinute = b.depositInterestScheduledMinute || 0;
    return true;
  },
  tick: function (minutes) {
    var delta = typeof minutes === "number" ? minutes : parseFloat(minutes);
    if (!isFinite(delta) || delta <= 0) return;
    var b = Game.Bank.getState();
    var s = Game.state || { day: 1, timeMinutes: 0 };
    var day = s.day || 1;
    if (b.depositInterestScheduleDay !== day) {
      // If we skipped the interest window for a previous day, pay it before rolling schedules forward.
      if (b.depositInterestScheduleDay > 0 && b.depositInterestScheduleDay < day && b.depositInterestPaidDay !== b.depositInterestScheduleDay) {
        Game.Bank.payDepositInterest();
      }
      Game.Bank.scheduleDepositInterestForDay(day);
    }
    if (b.depositInterestScheduleDay === day && b.depositInterestPaidDay !== day) {
      var minuteNow = Math.floor(s.timeMinutes || 0);
      if (minuteNow >= (b.depositInterestScheduledMinute || 0)) {
        Game.Bank.payDepositInterest();
      }
    }
  },
  getAvailableCredit: function () {
    var b = Game.Bank.getState();
    var maxLoan = Game.Bank.computeMaxLoan();
    b.maxLoan = maxLoan;
    var used = b.loanPrincipal || 0;
    var available = maxLoan - used;
    if (available < 0) available = 0;
    return available;
  },
  computeMaxLoan: function () {
    var b = Game.Bank.getState();
    var base = 1000;
    var score = typeof b.creditScore === "number" ? b.creditScore : 600;
    if (score >= 800) {
      base += 4000;
    } else if (score >= 740) {
      base += 3000;
    } else if (score >= 670) {
      base += 2000;
    } else if (score >= 600) {
      base += 1000;
    }
    var worth = Game.Bank.getNetWorthEstimate();
    if (worth > 100000) {
      base += 6000;
    } else if (worth > 50000) {
      base += 4000;
    } else if (worth > 20000) {
      base += 2000;
    } else if (worth > 10000) {
      base += 1000;
    }
    var good = b.goodPaymentDays || 0;
    if (good > 0) {
      var bonus = Math.min(good, 180) * 10;
      base += bonus;
    }
    if (base < 1000) base = 1000;
    if (base > 25000) base = 25000;
    return base;
  },
  getNetWorthEstimate: function () {
    var s = Game.state || {};
    var worth = 0;
    if (typeof s.money === "number") {
      worth += s.money;
    }
    if (s.bank && typeof s.bank.depositBalance === "number" && isFinite(s.bank.depositBalance)) {
      worth += s.bank.depositBalance;
    }
    if (s.companies) {
      if (s.companies.miningCorp && typeof s.companies.miningCorp.funds === "number") {
        worth += s.companies.miningCorp.funds;
      }
      if (s.companies.retailShop && typeof s.companies.retailShop.funds === "number") {
        worth += s.companies.retailShop.funds;
      }
    }
    if (Array.isArray(s.properties) && window.Game && Game.Property && Game.Property.getPropertyDef) {
      for (var i = 0; i < s.properties.length; i++) {
        var prop = s.properties[i];
        if (!prop || !prop.id) continue;
        var def = Game.Property.getPropertyDef(prop.id);
        if (def && typeof def.price === "number") {
          worth += def.price;
        }
      }
    }
    if (typeof s.btcBalance === "number" && s.btc && s.btc.exchange) {
      var price = typeof s.btc.exchange.priceUsd === "number" ? s.btc.exchange.priceUsd : 30000;
      worth += s.btcBalance * price;
    }
    if (s.bank && typeof s.bank.loanPrincipal === "number") {
      worth -= s.bank.loanPrincipal;
    }
    return worth;
  },
  getRateBreakdown: function (amount) {
    var b = Game.Bank.getState();
    var maxLoan = Game.Bank.computeMaxLoan();
    b.maxLoan = maxLoan;
    var a = parseFloat(amount);
    if (!a || a < 0) a = 0;
    if (a > maxLoan) a = maxLoan;
    var usageFrac = a / maxLoan;
    if (usageFrac < 0) usageFrac = 0;
    if (usageFrac > 1) usageFrac = 1;
    // Base rate depends only on how much of the limit this specific loan uses
    var base = 0.02 + usageFrac * 0.10; // 2% to 12%
    // Existing utilisation of the credit line
    var utilisationFrac = (b.loanPrincipal || 0) / maxLoan;
    if (utilisationFrac < 0) utilisationFrac = 0;
    if (utilisationFrac > 1) utilisationFrac = 1;
    var utilisationAdj = utilisationFrac * 0.05; // up to +5%
    // Credit inquiries: each inquiry nudges rate up a little
    var inquiries = b.creditInquiries || 0;
    var inquiryAdj = Math.min(inquiries, 20) * 0.001; // up to +2%
    // Net worth: stronger balance sheet lowers rate
    var worth = Game.Bank.getNetWorthEstimate();
    var netWorthAdj = 0;
    if (worth <= 0) {
      netWorthAdj = 0.03;
    } else if (worth < 10000) {
      netWorthAdj = 0.015;
    } else if (worth < 50000) {
      netWorthAdj = 0.0;
    } else if (worth < 150000) {
      netWorthAdj = -0.01;
    } else {
      netWorthAdj = -0.02;
    }
    // Payment history: rewarded for on-time payments, penalised for missed ones
    var good = b.goodPaymentDays || 0;
    var bad = b.missedPaymentDays || 0;
    var historyAdj = 0;
    var totalDays = good + bad;
    if (totalDays > 0) {
      var ratio = good / totalDays;
      if (ratio >= 0.8) {
        historyAdj = -0.015;
      } else if (ratio >= 0.6) {
        historyAdj = -0.005;
      } else if (ratio <= 0.3) {
        historyAdj = 0.02;
      } else if (ratio <= 0.5) {
        historyAdj = 0.01;
      }
    }
    // Other small adjustments: bank conditions that drift over time
    var otherAdj = 0;
    var s = Game.state || { day: 1 };
    var day = s.day || 1;
    var phase = day % 7;
    if (phase === 0 || phase === 1) {
      otherAdj = 0.005;
    } else if (phase === 3) {
      otherAdj = -0.005;
    }
    var total = base + utilisationAdj + inquiryAdj + netWorthAdj + historyAdj + otherAdj;
    if (total < 0.02) total = 0.02;
    if (total > 0.25) total = 0.25;
    return {
      amount: a,
      base: base,
      utilisationAdj: utilisationAdj,
      inquiryAdj: inquiryAdj,
      netWorthAdj: netWorthAdj,
      historyAdj: historyAdj,
      otherAdj: otherAdj,
      total: total
    };
  },
  getRateRangeForAmount: function (amount) {
    var breakdown = Game.Bank.getRateBreakdown(amount);
    var center = breakdown.total;
    var spread = 0.03; // +/- 3 percentage points
    var min = center - spread;
    var max = center + spread;
    if (min < 0.02) min = 0.02;
    if (max > 0.25) max = 0.25;
    return { min: min, max: max };
  },
  getRateForAmount: function (amount) {
    var breakdown = Game.Bank.getRateBreakdown(amount);
    return breakdown.total;
  },
  getCreditScore: function () {
    var b = Game.Bank.getState();
    var s = Game.state || {};
    var score = typeof b.creditScore === "number" ? b.creditScore : 600;
    // Start from a neutral baseline
    score = 600;
    // Net worth contribution
    var worth = Game.Bank.getNetWorthEstimate();
    if (worth <= 0) {
      score -= 80;
    } else if (worth < 10000) {
      score -= 40;
    } else if (worth < 50000) {
      // no change
    } else if (worth < 150000) {
      score += 60;
    } else {
      score += 110;
    }
    // Utilisation of current credit line based on stored limit
    var maxLoan = b.maxLoan || 1000;
    if (maxLoan <= 0) maxLoan = 1000;
    var utilisation = (b.loanPrincipal || 0) / maxLoan;
    if (utilisation > 1) utilisation = 1;
    if (utilisation > 0.9) {
      score -= 80;
    } else if (utilisation > 0.7) {
      score -= 40;
    } else if (utilisation > 0.4) {
      score -= 10;
    } else if (utilisation < 0.2 && b.loanPrincipal > 0) {
      score += 10;
    }
    // Credit inquiries
    var inquiries = b.creditInquiries || 0;
    score -= Math.min(inquiries, 25) * 4; // up to -100
    // Payment history
    var good = b.goodPaymentDays || 0;
    var bad = b.missedPaymentDays || 0;
    var totalDays = good + bad;
    if (totalDays > 0) {
      var ratio = good / totalDays;
      if (ratio >= 0.9) {
        score += 90;
      } else if (ratio >= 0.75) {
        score += 45;
      } else if (ratio >= 0.5) {
        // neutral
      } else if (ratio >= 0.3) {
        score -= 60;
      } else {
        score -= 110;
      }
    }
    // Job stability: having a job and higher level helps
    if (s.job) {
      if (s.job.current && s.job.current !== "none") {
        score += 30;
        var level = s.job.level || 0;
        if (level > 0) {
          score += Math.min(level, 5) * 6;
        }
      }
    }
    // Education: higher education level improves score slightly
    if (s.education && typeof s.education.level === "number") {
      score += Math.min(s.education.level, 6) * 5;
    }
    // Clamp score to 0-850
    if (score < 0) score = 0;
    if (score > 850) score = 850;
    b.creditScore = score;
    // Refresh dynamic maximum limit after score changes.
    b.maxLoan = Game.Bank.computeMaxLoan();
    return score;
  },
  getCreditScoreInfo: function () {
    var score = Game.Bank.getCreditScore();
    var band = "Poor";
    if (score >= 800) {
      band = "Excellent";
    } else if (score >= 740) {
      band = "Very good";
    } else if (score >= 670) {
      band = "Good";
    } else if (score >= 580) {
      band = "Fair";
    }
    return {
      score: score,
      band: band
    };
  },
  applyForLoan: function (amount) {
    var b = Game.Bank.getState();
    amount = parseFloat(amount);
    if (!amount || amount <= 0) {
      Game.addNotification("Choose a positive loan amount before applying.");
      return;
    }
    var available = Game.Bank.getAvailableCredit();
    if (amount > available) {
      Game.addNotification("You cannot apply for more than your remaining credit.");
      return;
    }
    var rate = Game.Bank.getRateForAmount(amount);
    if (!rate || rate <= 0) {
      rate = Game.Bank.getRateForAmount(amount);
    }
    if (typeof b.creditInquiries !== "number") b.creditInquiries = 0;
    b.creditInquiries += 1;
    var principalNow = b.loanPrincipal || 0;
    var originalNow = b.loanOriginal || 0;
    var futurePrincipal = principalNow + amount;
    var futureOriginal = originalNow + amount;
    var termDays = Game.Bank.loanTermDays || 28;
    if (termDays <= 0) termDays = 28;
    var dailyPrincipal = futureOriginal / termDays;
    var dailyInterest = futurePrincipal * rate;
    var totalDaily = dailyPrincipal + dailyInterest;
    b.pendingOffer = {
      amount: amount,
      rate: rate,
      termDays: termDays,
      futurePrincipal: futurePrincipal,
      futureOriginal: futureOriginal,
      dailyPrincipal: dailyPrincipal,
      dailyInterest: dailyInterest,
      totalDaily: totalDaily
    };
    Game.addNotification("Bank prepared a loan offer for $" + amount.toFixed(2) + ".");
  },
  takeLoan: function (amount, rate) {
    var b = Game.Bank.getState();
    amount = parseFloat(amount);
    if (!amount || amount <= 0) {
      Game.addNotification("Choose a positive loan amount.");
      return;
    }
    var available = Game.Bank.getAvailableCredit();
    if (amount > available) {
      Game.addNotification("You cannot borrow more than your remaining credit.");
      return;
    }
    if (!rate || rate <= 0) {
      rate = Game.Bank.getRateForAmount(amount);
    }
    b.loanPrincipal += amount;
    b.loanOriginal += amount;
    b.dailyInterestRate = rate;
    b.pendingOffer = null;
    Game.addMoney(amount, "Bank loan");
    Game.addNotification("Bank loan taken: $" + amount.toFixed(2) + " @ " + (rate * 100).toFixed(2) + "% daily interest.");
  },
  acceptOffer: function () {
    var b = Game.Bank.getState();
    var offer = b.pendingOffer;
    if (!offer || !offer.amount || offer.amount <= 0) {
      Game.addNotification("There is no loan offer to accept right now.");
      return;
    }
    Game.Bank.takeLoan(offer.amount, offer.rate);
  },
  rejectOffer: function () {
    var b = Game.Bank.getState();
    if (!b.pendingOffer) {
      Game.addNotification("There is no loan offer to reject right now.");
      return;
    }
    b.pendingOffer = null;
    Game.addNotification("You declined the bank's loan offer.");
  },
  payExtra: function (amount) {
    var b = Game.Bank.getState();
    var principal = b.loanPrincipal || 0;
    amount = parseFloat(amount);
    if (!amount || amount <= 0) {
      Game.addNotification("Enter a positive extra payment amount.");
      return;
    }
    if (principal <= 0) {
      Game.addNotification("You do not have an active loan to pay down.");
      return;
    }
    if (amount > principal) {
      amount = principal;
    }
    if (!Game.spendMoney(amount, "Extra loan payment")) {
      Game.addNotification("You do not have enough money for that extra payment.");
      return;
    }
    b.loanPrincipal -= amount;
    if (b.loanPrincipal < 0) b.loanPrincipal = 0;
    Game.addNotification("You made an extra loan payment of $" + amount.toFixed(2) + ".");
    if (b.loanPrincipal <= 0.01) {
      b.loanPrincipal = 0;
      b.loanOriginal = 0;
      b.dailyInterestRate = 0;
      b.goodPaymentDays = 0;
      b.missedPaymentDays = 0;
      b.pendingOffer = null;
      Game.addNotification("Your bank loan is fully repaid.");
    }
  },
  dailyIncome: function () {
    var b = Game.Bank.getState();
    var s = Game.state || { day: 1 };
    // Catch up a missed deposit interest payout for the previous schedule day (e.g. large time jumps).
    if (b.depositInterestScheduleDay > 0 && b.depositInterestScheduleDay < (s.day || 1) && b.depositInterestPaidDay !== b.depositInterestScheduleDay) {
      Game.Bank.payDepositInterest();
    }
    // Schedule the deposit interest payout time for the new day.
    Game.Bank.scheduleDepositInterestForDay(s.day || 1);
  },
  dailyExpense: function () {
    var b = Game.Bank.getState();
    var principal = b.loanPrincipal || 0;
    if (principal <= 0) return;
    var rate = b.dailyInterestRate || 0;
    if (rate < 0) rate = 0;
    var anyDue = false;
    var paidInterest = false;
    var paidPrincipal = false;
    // Interest for the day
    var interest = principal * rate;
    // Scheduled principal repayment over a fixed term
    var original = b.loanOriginal || 0;
    var dailyPrincipalDue = 0;
    if (original > 0 && b.loanPrincipal > 0) {
      var termDays = Game.Bank.loanTermDays || 28;
      if (termDays <= 0) termDays = 28;
      dailyPrincipalDue = original / termDays;
      if (dailyPrincipalDue > b.loanPrincipal) {
        dailyPrincipalDue = b.loanPrincipal;
      }
      if (dailyPrincipalDue < 0) dailyPrincipalDue = 0;
    }
    var totalDue = (interest > 0 ? interest : 0) + (dailyPrincipalDue > 0 ? dailyPrincipalDue : 0);
    var payFromDeposits = !!b.payLoanFromDeposits && totalDue > 0 && (b.depositBalance || 0) >= totalDue;
    if (payFromDeposits) {
      if (interest > 0) {
        anyDue = true;
        b.depositBalance -= interest;
        if (b.depositBalance < 0) b.depositBalance = 0;
        Game.Bank._recordDepositHistory("loan", interest, "Bank interest");
        Game.addNotification("-$" + interest.toFixed(2) + " (Bank interest from deposits)");
        paidInterest = true;
      }
      if (dailyPrincipalDue > 0) {
        anyDue = true;
        b.depositBalance -= dailyPrincipalDue;
        if (b.depositBalance < 0) b.depositBalance = 0;
        b.loanPrincipal -= dailyPrincipalDue;
        if (b.loanPrincipal < 0) b.loanPrincipal = 0;
        Game.Bank._recordDepositHistory("loan", dailyPrincipalDue, "Loan repayment");
        Game.addNotification("-$" + dailyPrincipalDue.toFixed(2) + " (Loan repayment from deposits)");
        paidPrincipal = true;
      }
    } else {
    if (interest > 0) {
      anyDue = true;
      if (!Game.spendMoney(interest, "Bank interest")) {
        // If the player cannot pay interest, capitalise it
        b.loanPrincipal += interest;
        Game.addNotification("You could not pay today's bank interest; it was added to your loan.");
      } else {
        paidInterest = true;
      }
    }
    if (original > 0 && b.loanPrincipal > 0) {
      var dailyPrincipal = dailyPrincipalDue;
      if (dailyPrincipal > 0) {
        anyDue = true;
        if (Game.spendMoney(dailyPrincipal, "Bank loan repayment")) {
          b.loanPrincipal -= dailyPrincipal;
          paidPrincipal = true;
        } else {
          Game.addNotification("You could not pay today's scheduled loan repayment.");
        }
      }
    }
    }
    if (b.loanPrincipal <= 0.01) {
      b.loanPrincipal = 0;
      b.loanOriginal = 0;
      b.dailyInterestRate = 0;
      b.goodPaymentDays = 0;
      b.missedPaymentDays = 0;
      Game.addNotification("Your bank loan is fully repaid.");
    } else if (anyDue) {
      if (typeof b.goodPaymentDays !== "number") b.goodPaymentDays = 0;
      if (typeof b.missedPaymentDays !== "number") b.missedPaymentDays = 0;
      if (paidInterest && paidPrincipal) {
        b.goodPaymentDays += 1;
      } else {
        b.missedPaymentDays += 1;
      }
    }
  },
  daily: function () {
    Game.Bank.dailyIncome();
    Game.Bank.dailyExpense();
  }
};

Game.registerDailyIncomeHandler(Game.Bank.dailyIncome);
Game.registerDailyExpenseHandler(Game.Bank.dailyExpense);
