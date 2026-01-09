(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    renderBankTab: function () {
      var s = Game.state;
      var b = Game.Bank ? Game.Bank.getState() : (s.bank || { loanPrincipal: 0, loanOriginal: 0, dailyInterestRate: 0, maxLoan: 1000 });
      var atCity = s.travelLocation === "City Centre";
      var html = [];
      html.push('<div>');
      html.push('<div class="section-title">Bank</div>');
      html.push('<div class="section-subtitle">Borrow money with daily interest and automatic repayments over a 28 day term, and manage bank deposits.</div>');
      if (!atCity) {
        html.push('<div class="card mt-8">');
        html.push('<div class="card-title">Location required</div>');
        html.push('<div class="card-section small dim">You must travel to the City Centre to access the bank.</div>');
        html.push('</div>');
        html.push('</div>');
        return html.join("");
      }
      var principal = b.loanPrincipal || 0;
      var original = b.loanOriginal || 0;
      var rate = b.dailyInterestRate || 0;
      var offer = b.pendingOffer || null;
      var available = Game.Bank.getAvailableCredit();
      var scoreInfo = Game.Bank.getCreditScoreInfo ? Game.Bank.getCreditScoreInfo() : { score: 0, band: "" };
      function fmtTimeFromMinute(minuteOfDay) {
        var total = Math.floor((typeof minuteOfDay === "number" && isFinite(minuteOfDay) ? minuteOfDay : 0) % (24 * 60));
        if (!isFinite(total) || total < 0) total = 0;
        var h = Math.floor(total / 60);
        var m = total % 60;
        var hh = (h < 10 ? "0" : "") + h;
        var mm = (m < 10 ? "0" : "") + m;
        return hh + ":" + mm;
      }
      function pushExistingLoanCard(target, inGrid) {
        target.push('<div class="card' + (inGrid ? '' : ' mt-8') + '">');
        target.push('<div class="card-title">Existing Loan</div>');
        target.push('<div class="card-section">');
        target.push('<div class="field-row"><span>Outstanding loan</span><span>$' + principal.toFixed(2) + '</span></div>');
        target.push('<div class="field-row"><span>Original loan total</span><span>$' + original.toFixed(2) + '</span></div>');
        target.push('<div class="field-row"><span>Daily interest rate</span><span>' + (rate > 0 ? (rate * 100).toFixed(2) + '%' : 'N/A') + '</span></div>');
        if (principal > 0 && original > 0) {
          var termDays = Game.Bank.loanTermDays || 28;
          var dailyPrincipal = original / termDays;
          if (dailyPrincipal > principal) dailyPrincipal = principal;
          target.push('<div class="field-row"><span>Estimated daily payment</span><span>$' + dailyPrincipal.toFixed(2) + '</span></div>');
        }
        var currentMax = Game.Bank.computeMaxLoan();
        target.push('<div class="field-row"><span>Maximum loan limit</span><span>$' + currentMax.toFixed(2) + '</span></div>');
        target.push('<div class="field-row"><span>Available credit</span><span>$' + available.toFixed(2) + '</span></div>');
        if (principal > 0) {
          target.push('<div class="field-row small mt-4"><span>Extra payment</span><span class="bank-transfer-controls"><span class="bank-control-group"><input id="bank-extra-amount" class="bank-input" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="bank-btn-extra">Pay early</button></span></span></div>');
        }
        target.push('</div>');
        target.push('<div class="card-section small dim">Interest and principal are charged automatically at the end of each in-game day.</div>');
        target.push('</div>');
      }
      html.push('<div class="grid mt-8">');
  
      var histAll = Array.isArray(b.depositHistory) ? b.depositHistory.slice().reverse() : [];
  
      var depositBalance = b.depositBalance || 0;
      var interestRate = (Game.Bank && typeof Game.Bank.depositInterestRateDaily === "number") ? Game.Bank.depositInterestRateDaily : 0.0005;
      if (Game.Prestige && typeof Game.Prestige.getDepositInterestMultiplier === "function") {
        interestRate *= Game.Prestige.getDepositInterestMultiplier();
      }
      var schedDay = b.depositInterestScheduleDay || (s.day || 1);
      var schedMin = b.depositInterestScheduledMinute || 150;
      var schedLabel = "Day " + schedDay + ", " + fmtTimeFromMinute(schedMin);
      if (b.depositInterestPaidDay === schedDay) schedLabel += " (paid)";
      var baseBalance = (typeof b.depositInterestBaseBalance === "number" && isFinite(b.depositInterestBaseBalance)) ? b.depositInterestBaseBalance : depositBalance;
      var estInterest = Math.round(baseBalance * interestRate * 10000) / 10000;
      estInterest = Math.round(estInterest * 100) / 100;
      var lastInterestLabel = "-";
      if ((b.depositInterestLastDay || 0) > 0) {
        lastInterestLabel = "$" + (b.depositInterestLastAmount || 0).toFixed(2) + " (Day " + b.depositInterestLastDay + ", " + fmtTimeFromMinute(b.depositInterestLastMinute || 0) + ")";
      }
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Bank Deposits</div>');
      html.push('<div class="card-section small dim">Earn ' + (interestRate * 100).toFixed(2) + '% interest per day on your deposit balance (snapshot at midnight). Interest posts randomly between 02:30 and 03:05.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Bank balance</span><span id="bank-deposit-balance">$' + depositBalance.toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Next interest</span><span id="bank-deposit-next-interest">' + schedLabel + '</span></div>');
      html.push('<div class="field-row small"><span>Snapshot balance</span><span id="bank-deposit-base-balance">$' + baseBalance.toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Estimated interest</span><span id="bank-deposit-est-interest">$' + estInterest.toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Last interest</span><span id="bank-deposit-last-interest">' + lastInterestLabel + '</span></div>');
      html.push('<div class="field-row bank-transfer-row mt-8"><span>Deposit</span><span class="bank-transfer-controls"><span class="bank-control-group"><input id="bank-deposit-amount" class="bank-input" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="bank-btn-deposit">Deposit</button></span></span></div>');
      html.push('<div class="field-row bank-transfer-row mt-4"><span>Withdraw</span><span class="bank-transfer-controls"><span class="bank-control-group"><input id="bank-withdraw-amount" class="bank-input" type="number" min="0" step="10" placeholder="Amount"><button class="btn btn-small btn-outline" id="bank-btn-withdraw">Withdraw</button></span></span></div>');
      html.push('<div class="field-row small mt-4"><span><label><input type="checkbox" id="bank-toggle-loan-from-deposits"' + (b.payLoanFromDeposits ? ' checked' : '') + '> Pay daily loan from bank balance (if sufficient)</label></span><span></span></div>');
      html.push('<div class="field-row small"><span><label><input type="checkbox" id="bank-toggle-interest-to-bank"' + (b.depositInterestToBank ? ' checked' : '') + '> Deposit interest goes to bank (otherwise wallet)</label></span><span></span></div>');
      var hist = histAll.slice(0, 8);
      if (hist && hist.length) {
        html.push('<div class="card-section mt-8">');
        html.push('<div class="small dim">Recent transactions</div>');
        html.push('<table class="table bank-history-table mt-4"><thead><tr><th>When</th><th>Type</th><th>Amount</th><th>Balance</th></tr></thead><tbody>');
        for (var hi = 0; hi < hist.length; hi++) {
          var e = hist[hi];
          if (!e) continue;
          var kind = String(e.kind || "");
          var sign = (kind === "deposit" || kind === "interest") ? "+" : "-";
          var label = kind ? (kind.charAt(0).toUpperCase() + kind.slice(1)) : "Txn";
          if (kind === "loan") {
            label = "Loan" + (e.note ? (": " + e.note) : "");
          } else if (kind === "interest" && e.note) {
            label = "Interest (" + e.note + ")";
          }
          var amt = typeof e.amount === "number" && isFinite(e.amount) ? Math.abs(e.amount) : 0;
          var balAfter = typeof e.balanceAfter === "number" && isFinite(e.balanceAfter) ? e.balanceAfter : 0;
          var when = "D" + (e.day || 1) + " " + fmtTimeFromMinute(e.minute || 0);
          html.push("<tr><td class=\"mono\">" + when + "</td><td>" + label + '</td><td class="mono">' + sign + "$" + amt.toFixed(2) + '</td><td class="mono">$' + balAfter.toFixed(2) + "</td></tr>");
        }
        html.push("</tbody></table>");
        html.push("</div>");
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Apply for a Loan</div>');
      html.push('<div class="card-section small dim">Use the slider to choose how much to borrow today. Higher amounts increase the daily interest rate. Loan term is 28 in-game days.</div>');
      html.push('<div class="card-section">');
      var maxLoan = b.maxLoan || 1000;
      var maxToday = available > 0 ? available : 0;
      var startVal = Math.min(200, maxToday);
      html.push('<div class="field-row"><span>Amount</span><span><input id="bank-loan-amount" type="range" min="0" max="' + maxToday.toFixed(0) + '" step="50" value="' + startVal.toFixed(0) + '"></span></div>');
      html.push('<div class="field-row small mt-4"><span>Requested amount</span><span id="bank-loan-amount-label">$' + startVal.toFixed(0) + '</span></div>');
      var projectedRange = Game.Bank.getRateRangeForAmount(startVal);
      html.push('<div class="field-row small"><span>Potential interest rate</span><span id="bank-rate-label">' + (projectedRange.min * 100).toFixed(2) + '% â€“ ' + (projectedRange.max * 100).toFixed(2) + '%</span></div>');
      var termDays2 = Game.Bank.loanTermDays || 28;
      var projectedDailyPrincipal = termDays2 > 0 ? (original + startVal) / termDays2 : (original + startVal) * 0.0357;
      html.push('<div class="field-row small"><span>Projected daily payment</span><span id="bank-daily-label">$' + projectedDailyPrincipal.toFixed(2) + '</span></div>');
      html.push('<div class="field-row small"><span>Credit score</span><span>' + scoreInfo.score.toFixed(0) + ' / 850 (' + scoreInfo.band + ')</span></div>');
      html.push('<div class="mt-4 btn-row-center"><button class="btn btn-small btn-primary" id="bank-btn-borrow"' + (maxToday <= 0 ? ' disabled' : '') + '>Apply for loan</button></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Loan Offer</div>');
      html.push('<div class="card-section small" id="bank-offer-section">');
      if (offer && offer.amount && offer.rate) {
        var futurePrincipal = offer.futurePrincipal || (principal + offer.amount);
        var dailyInterestOffer = offer.dailyInterest || (futurePrincipal * offer.rate);
        var dailyPrincipalOffer = offer.dailyPrincipal || ((offer.futureOriginal || (original + offer.amount)) / (offer.termDays || (Game.Bank.loanTermDays || 28)));
        var totalDailyOffer = offer.totalDaily || (dailyPrincipalOffer + dailyInterestOffer);
        html.push('<div class="field-row small"><span>Requested amount</span><span>$' + offer.amount.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Exact interest rate</span><span>' + (offer.rate * 100).toFixed(2) + '% per day</span></div>');
        html.push('<div class="field-row small"><span>Future principal</span><span>$' + futurePrincipal.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Interest per day</span><span>$' + dailyInterestOffer.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Scheduled principal / day</span><span>$' + dailyPrincipalOffer.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Estimated total / day</span><span>$' + totalDailyOffer.toFixed(2) + '</span></div>');
        html.push('<div class="mt-4"><button class="btn btn-small btn-primary" id="bank-btn-accept">Accept offer</button> <button class="btn btn-small btn-outline" id="bank-btn-reject">Reject offer</button></div>');
      } else if (principal > 0 && rate > 0) {
        var dailyInterest = principal * rate;
        html.push('<div class="field-row small"><span>Current loan</span><span>$' + principal.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Interest rate</span><span>' + (rate * 100).toFixed(2) + '% per day</span></div>');
        html.push('<div class="field-row small"><span>Interest per day</span><span>$' + dailyInterest.toFixed(2) + '</span></div>');
        html.push('<div class="field-row small"><span>Repayment plan</span><span>~30 days at 3.33% of original per day</span></div>');
      } else {
        html.push('<div class="small dim">After you click "Apply for loan", the bank will generate a specific offer here, including the exact rate and daily costs. You can then accept or reject it.</div>');
      }
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Interest Rate Factors</div>');
      html.push('<div class="card-section small">');
      var maxLimit = b.maxLoan || 1000;
      html.push('<div class="small">Your daily interest rate for new loans is built from a base rate plus live adjustments. Positive adjustments (better terms) are shown in green, negative in red.</div>');
      html.push('<div class="mt-4 small" id="bank-factors-container">');
      html.push('<div class="field-row small"><span>Base rate</span><span id="bank-factor-base">2.00%</span></div>');
      html.push('<div class="field-row small"><span>Loan size vs limit</span><span id="bank-factor-utilisation">0.00%</span></div>');
      html.push('<div class="field-row small"><span>Credit inquiries</span><span id="bank-factor-inquiries">0.00%</span></div>');
      html.push('<div class="field-row small"><span>Net worth</span><span id="bank-factor-networth">0.00%</span></div>');
      html.push('<div class="field-row small"><span>Payment history</span><span id="bank-factor-history">0.00%</span></div>');
      html.push('<div class="field-row small"><span>Other conditions</span><span id="bank-factor-other">0.00%</span></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Each time you click "Apply for loan" it counts as a credit inquiry and will gradually nudge your future rates.</div>');
      html.push('</div>');
      pushExistingLoanCard(html, true);
      html.push('</div>'); // grid
      html.push('</div>'); // outer
      return html.join("");
    },
    updateBankDynamic: function () {
      if (!Game || !Game.state || !Game.Bank || !Game.Bank.getState) return;
      var s = Game.state;
      var b = Game.Bank.getState();
      var balEl = document.getElementById("bank-deposit-balance");
      if (balEl) balEl.textContent = "$" + (b.depositBalance || 0).toFixed(2);
      var baseEl = document.getElementById("bank-deposit-base-balance");
      if (baseEl) {
        var base = (typeof b.depositInterestBaseBalance === "number" && isFinite(b.depositInterestBaseBalance)) ? b.depositInterestBaseBalance : (b.depositBalance || 0);
        baseEl.textContent = "$" + base.toFixed(2);
      }
      var estEl = document.getElementById("bank-deposit-est-interest");
      if (estEl) {
        var rate = (Game.Bank && typeof Game.Bank.depositInterestRateDaily === "number") ? Game.Bank.depositInterestRateDaily : 0.0005;
        if (Game.Prestige && typeof Game.Prestige.getDepositInterestMultiplier === "function") {
          rate *= Game.Prestige.getDepositInterestMultiplier();
        }
        var base2 = (typeof b.depositInterestBaseBalance === "number" && isFinite(b.depositInterestBaseBalance)) ? b.depositInterestBaseBalance : (b.depositBalance || 0);
        var est = Math.round(base2 * rate * 10000) / 10000;
        est = Math.round(est * 100) / 100;
        estEl.textContent = "$" + est.toFixed(2);
      }
      function fmtTime(minuteOfDay) {
        var total = Math.floor((typeof minuteOfDay === "number" && isFinite(minuteOfDay) ? minuteOfDay : 0) % (24 * 60));
        if (!isFinite(total) || total < 0) total = 0;
        var h = Math.floor(total / 60);
        var m = total % 60;
        var hh = (h < 10 ? "0" : "") + h;
        var mm = (m < 10 ? "0" : "") + m;
        return hh + ":" + mm;
      }
      var schedDay = b.depositInterestScheduleDay || (s.day || 1);
      var schedMin = b.depositInterestScheduledMinute || 150;
      var nextLabel = "Day " + schedDay + ", " + fmtTime(schedMin);
      if (b.depositInterestPaidDay === schedDay) nextLabel += " (paid)";
      var nextEl = document.getElementById("bank-deposit-next-interest");
      if (nextEl) nextEl.textContent = nextLabel;
      var lastEl = document.getElementById("bank-deposit-last-interest");
      if (lastEl) {
        var lastLabel = "-";
        if ((b.depositInterestLastDay || 0) > 0) {
          lastLabel = "$" + (b.depositInterestLastAmount || 0).toFixed(2) + " (Day " + b.depositInterestLastDay + ", " + fmtTime(b.depositInterestLastMinute || 0) + ")";
        }
        lastEl.textContent = lastLabel;
      }
    },
  });
})();
