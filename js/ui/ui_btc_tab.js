(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    renderBtcTab: function () {
        var s = Game.state;
        var w = s.btc.wallet;
        var m = s.btc.mining;
        var suiteLvl = (s.btc && typeof s.btc.minerSoftwareLevel === "number") ? s.btc.minerSoftwareLevel : 0;
        if (!isFinite(suiteLvl) || suiteLvl < 0) suiteLvl = 0;
        var suiteMult = 1 + suiteLvl * 0.12;
        var rigHash = (m.rigHashrate || 0) * suiteMult;
        var ex = Game.Btc.getExchange();
        var history = (ex.priceHistory || []).slice(-12);
      if (!history || history.length === 0) {
        var day = Game.state.day || 1;
        var minutes = Game.state.timeMinutes || 0;
        var currentHour = Math.floor(minutes / 60);
        var synthetic = [];
        for (var i = 5; i >= 0; i--) {
          var hour = currentHour - (5 - i);
          var d = day;
            while (hour < 0) {
              hour += 24;
              d -= 1;
              if (d < 1) {
                d = 1;
                break;
              }
            }
            var minuteOfDay = hour * 60;
            var key = d * (24 * 60) + minuteOfDay;
            var delta = (Math.random() - 0.5) * 200;
            synthetic.push({
              key: key,
              day: d,
              hour: hour,
              minutes: minuteOfDay,
              price: Math.max(5000, ex.priceUsd + delta)
            });
          }
          history = synthetic;
        }
      var html = [];
      html.push('<div>');
      html.push('<div class="flex-between">');
      html.push('<div>');
      html.push('<div class="section-title">BTC Mining & Wallet</div>');
      html.push('<div class="section-subtitle">Mine BTC locally and via cloud contracts. Your wallet must sync the virtual blockchain each time you open it on the PC.</div>');
      html.push('</div>');
      html.push('<div><button class="btn btn-small btn-outline" id="btn-btc-reports">Reports</button></div>');
      html.push('</div>');
      html.push('<div class="grid mt-8">');
      html.push('<div class="card">');
      html.push('<div class="card-title">Wallet Summary</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Confirmed balance</span><span id="btc-summary-confirmed">' + UI.formatBtcHtml(s.btcBalance) + '</span></div>');
      html.push('<div class="field-row"><span>Unconfirmed (mining)</span><span id="btc-summary-unconfirmed">' + UI.formatBtcHtml(s.unconfirmedBtc) + '</span></div>');
      html.push('<div class="field-row"><span>Chain height</span><span id="btc-summary-chain" class="mono">' + w.chainHeight + '</span></div>');
      html.push('<div class="field-row"><span>Last sync day</span><span id="btc-summary-last-sync">' + (w.lastSyncDay || "-") + '</span></div>');
      html.push('<div class="field-row"><span>Auto-sync</span><span><label class="small"><input type="checkbox" id="btc-wallet-auto-sync"' + (w.autoSyncDaily ? ' checked' : '') + '> Sync wallet at end of day</label></span></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Open the Wallet app on your PC to sync. While syncing, the client downloads the entire virtual blockchain snapshot.</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Mining Rigs</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Rigs owned</span><span id="btc-rigs-owned">' + m.rigsOwned + '</span></div>');
      html.push('<div class="field-row"><span>Rig hashrate</span><span id="btc-rig-hashrate">' + rigHash.toFixed(2) + ' h/s per rig</span></div>');
      html.push('<div class="field-row"><span>Software suite</span><span class="mono">L' + suiteLvl + ' (+' + Math.round((suiteMult - 1) * 100) + '% rigs Æ’?Â½ PC)</span></div>');
      html.push('<div class="field-row"><span>Power cost per day</span><span id="btc-rig-power-cost">$' + m.powerCostPerDay.toFixed(0) + ' per rig</span></div>');
      html.push('<div class="field-row"><span>Power status</span><span id="btc-rig-power-status">' + (m.isPowerOn ? "ON" : "OFF") + '</span></div>');
      html.push('</div>');
      html.push('<div class="card-section">');
      var nextRigCost = 2200 + m.rigsOwned * 400;
      html.push('<button class="btn btn-small btn-primary" id="btn-buy-rig" title="Costs $' + nextRigCost.toFixed(0) + ' (base $2200 + $400 per rig already owned).">Buy mining rig</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-toggle-rig">Toggle rig power</button>');
      html.push('<div class="notice">Rigs consume daily power (fiat) but generate BTC continuously when powered.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>'); // close grid
      // BTC price history chart full-width below the summary cards
      html.push('<div class="card mt-8">');
      html.push('<div class="card-title">BTC Price History</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Spot price</span><span id="btc-spot-price" class="mono">$' + ex.priceUsd.toFixed(0) + ' / BTC</span></div>');
      html.push('</div>');
      html.push('<div class="card-section">');
      html.push('<div id="btc-price-chart" style="width:100%;height:220px;"></div>');
      html.push('</div>');
      html.push('</div>');
      UI._btcHistoryCache = history;
      return html.join("");
    },
    renderBtcReportsPage: function () {
      var s = Game.state;
      var history = (s.btc.history && s.btc.history.byDay) ? s.btc.history.byDay : [];
      var currentDay = s.day;
      var currentDayAmount = s.btc.history ? s.btc.history.currentDayEarned : 0;
      var sums = { day: currentDayAmount, week: 0, month: 0, year: 0 };
      for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        var d = entry.day;
        var v = entry.amount;
        if (d >= currentDay - 6 && d <= currentDay) sums.week += v;
        if (d >= currentDay - 29 && d <= currentDay) sums.month += v;
        if (d >= currentDay - 364 && d <= currentDay) sums.year += v;
      }
      sums.week += currentDayAmount;
      sums.month += currentDayAmount;
      sums.year += currentDayAmount;
      var maxVal = Math.max(sums.day, sums.week, sums.month, sums.year, 0.000001);
      function barHeight(val) {
        return Math.round((val / maxVal) * 100);
      }
      var html = [];
      html.push('<div>');
      html.push('<div class="flex-between">');
      html.push('<div>');
      html.push('<div class="section-title">BTC Earnings Reports</div>');
      html.push('<div class="section-subtitle">Compare BTC earned over different timeframes. Values include mining and cloud payouts.</div>');
      html.push('</div>');
      html.push('<div><button class="btn btn-small btn-outline" id="btn-btc-reports-back">Back to BTC</button></div>');
      html.push('</div>');
      html.push('<div class="grid mt-8">');
      html.push('<div class="card">');
      html.push('<div class="card-title">Totals</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Today</span><span>' + UI.formatBtcHtml(sums.day) + '</span></div>');
      html.push('<div class="field-row"><span>Last 7 days</span><span>' + UI.formatBtcHtml(sums.week) + '</span></div>');
      html.push('<div class="field-row"><span>Last 30 days</span><span>' + UI.formatBtcHtml(sums.month) + '</span></div>');
      html.push('<div class="field-row"><span>Last 365 days</span><span>' + UI.formatBtcHtml(sums.year) + '</span></div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">History is stored for up to the last 365 in-game days.</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Comparison Chart</div>');
      html.push('<div class="card-section">');
      html.push('<div class="chart-row">');
      html.push('<div class="chart-bar">');
      html.push('<div class="chart-bar-fill" style="height:' + barHeight(sums.day) + '%;"></div>');
      html.push('<div class="chart-bar-label">Day</div>');
      html.push('<div class="chart-bar-value">' + sums.day.toFixed(8) + '</div>');
      html.push('</div>');
      html.push('<div class="chart-bar">');
      html.push('<div class="chart-bar-fill" style="height:' + barHeight(sums.week) + '%;"></div>');
      html.push('<div class="chart-bar-label">Week</div>');
      html.push('<div class="chart-bar-value">' + sums.week.toFixed(8) + '</div>');
      html.push('</div>');
      html.push('<div class="chart-bar">');
      html.push('<div class="chart-bar-fill" style="height:' + barHeight(sums.month) + '%;"></div>');
      html.push('<div class="chart-bar-label">Month</div>');
      html.push('<div class="chart-bar-value">' + sums.month.toFixed(8) + '</div>');
      html.push('</div>');
      html.push('<div class="chart-bar">');
      html.push('<div class="chart-bar-fill" style="height:' + barHeight(sums.year) + '%;"></div>');
      html.push('<div class="chart-bar-label">Year</div>');
      html.push('<div class="chart-bar-value">' + sums.year.toFixed(8) + '</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card-section small dim">Bar heights are relative to the highest total in the selected ranges.</div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      return html.join("");
    },
    showBtcReportsPage: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      el.innerHTML = UI.renderBtcReportsPage();
      UI.bindBtcReportsPageEvents();
    },
    bindBtcReportsPageEvents: function () {
      var backBtn = document.getElementById("btn-btc-reports-back");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          UI.renderCurrentTab();
        });
      }
    },
    updateBtcDynamic: function () {
      var s = Game.state;
      if (!s || !s.btc) return;
      var w = s.btc.wallet || {};
      var m = s.btc.mining || {};
      var confirmedEl = document.getElementById("btc-summary-confirmed");
      if (confirmedEl) confirmedEl.innerHTML = UI.formatBtcHtml(s.btcBalance);
      var unconfirmedEl = document.getElementById("btc-summary-unconfirmed");
      if (unconfirmedEl) unconfirmedEl.innerHTML = UI.formatBtcHtml(s.unconfirmedBtc);
      var chainEl = document.getElementById("btc-summary-chain");
      if (chainEl) chainEl.textContent = w.chainHeight;
      var lastSyncEl = document.getElementById("btc-summary-last-sync");
      if (lastSyncEl) lastSyncEl.textContent = w.lastSyncDay || "-";
      var rigsEl = document.getElementById("btc-rigs-owned");
      if (rigsEl) rigsEl.textContent = m.rigsOwned;
      var hashEl = document.getElementById("btc-rig-hashrate");
      if (hashEl) {
        var suiteLvl = (s.btc && typeof s.btc.minerSoftwareLevel === "number") ? s.btc.minerSoftwareLevel : 0;
        if (!isFinite(suiteLvl) || suiteLvl < 0) suiteLvl = 0;
        var suiteMult = 1 + suiteLvl * 0.12;
        hashEl.textContent = ((m.rigHashrate || 0) * suiteMult).toFixed(2) + " h/s per rig";
      }
      var costEl = document.getElementById("btc-rig-power-cost");
      if (costEl) costEl.textContent = "$" + m.powerCostPerDay.toFixed(0) + " per rig";
      var statusEl = document.getElementById("btc-rig-power-status");
      if (statusEl) statusEl.textContent = m.isPowerOn ? "ON" : "OFF";
    },
    updateWalletDynamic: function () {
      var w = Game.state.btc.wallet;
      var total = Game.state.btcBalance + Game.state.unconfirmedBtc;
      var bar = document.getElementById("wallet-sync-bar");
      var label = document.getElementById("wallet-sync-label");
      var blocksEl = document.getElementById("wallet-sync-blocks");
      var overallEl = document.getElementById("wallet-overall-pct");
      var height = document.getElementById("wallet-height");
      var totalEl = document.getElementById("wallet-total-btc");
      if (w && w.isInstalled) {
        var syncingNow = !!(w.isSyncing || w.syncDownloadId);
        var finishedNow = !!(UI._walletWasSyncing && !syncingNow);
        UI._walletWasSyncing = syncingNow;
        if (finishedNow && Game.state && Game.state.pc && Game.state.pc.isOpen) {
          var win = (Game.PC && Game.PC.findWindowByApp) ? Game.PC.findWindowByApp("wallet") : null;
          if (win && !win.minimized) {
            var pcWindow = document.getElementById("pc-win-content-" + win.id);
            if (pcWindow && UI.renderPCWallet) {
              UI.renderPCWallet(pcWindow);
              return;
            }
          }
        }
        var networkHeight = (Game.Btc && Game.Btc.getNetworkHeight) ? Game.Btc.getNetworkHeight() : (w.targetHeight || 0);
        var denom = Math.max(1, (w.targetHeight || networkHeight || 1));
        var overallPct = Math.floor((Math.min(denom, Math.max(0, w.chainHeight || 0)) / denom) * 10000) / 100;
        if (overallEl) overallEl.textContent = overallPct + "%";
        var blockPct = 0;
        var dl = (w.syncDownloadId && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(w.syncDownloadId) : null;
        if (dl && dl.kind === "btc_chain_sync") {
          var curSize = (typeof dl.currentBlockSizeMb === "number" && dl.currentBlockSizeMb > 0) ? dl.currentBlockSizeMb : null;
          if (curSize) {
            blockPct = Math.floor((Math.min(curSize, Math.max(0, dl.bufferMb || 0)) / curSize) * 10000) / 100;
          }
        } else {
          // No active block download; show overall progress (prevents the UI looking "stuck" after completion).
          blockPct = overallPct;
        }
        if (bar) bar.style.width = blockPct + "%";
        if (label) label.textContent = blockPct + "%";
        if (blocksEl) {
          if (dl && dl.kind === "btc_chain_sync") {
            blocksEl.textContent = (dl.syncedBlocks || 0) + " / " + Math.max(1, dl.totalBlocks || 1) + " blocks";
          } else {
            blocksEl.textContent = (w.chainHeight || 0) + " / " + denom + " blocks";
          }
        }
        if (height) height.textContent = (w.chainHeight || 0) + " \u2192 " + (w.targetHeight || networkHeight || 0);
      }
      if (totalEl) totalEl.textContent = total.toFixed(8) + " BTC";
    }
  });
})();
