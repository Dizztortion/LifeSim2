(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
      // Detailed BTC formatting with faded extra decimals (for in-depth views)
      formatBtcHtml: function (value) {
        if (isNaN(value)) value = 0;
        var full = value.toFixed(11);
        var parts = full.split(".");
        var whole = parts[0];
        var dec = parts[1] || "00000000000";
        var mainDec = dec.substring(0, 8);
        var fadedDec = dec.substring(8);
        return whole + "." + mainDec + '<span class="btc-faded">' + fadedDec + "</span> BTC";
      },
      // Compact BTC formatting without faded trailing zeros (for topbar)
      formatBtcCompact: function (value) {
        if (isNaN(value)) value = 0;
        return value.toFixed(8) + " BTC";
      },
      getBtcHoldingsDisplayAmount: function () {
        try {
          if (!Game || !Game.state) return 0;
          var s = Game.state;
          if (!s.btc) return 0;
          if (!s.btc.ui || typeof s.btc.ui !== "object") s.btc.ui = {};
          var ui = s.btc.ui;
          if (typeof ui.showConfirmedHoldings !== "boolean") ui.showConfirmedHoldings = false;
          var confirmed = typeof s.btcBalance === "number" ? s.btcBalance : 0;
          var unconfirmed = typeof s.unconfirmedBtc === "number" ? s.unconfirmedBtc : 0;
          return ui.showConfirmedHoldings ? confirmed : (confirmed + unconfirmed);
        } catch (e) {
          return 0;
        }
      },
      updateTopbarBtcHoldings: function (animate) {
        try {
          var el = document.getElementById("stat-btc");
          if (!el) return;
          var v = UI.getBtcHoldingsDisplayAmount();
          if (animate && UI.animateNumber) {
            UI.animateNumber("btc", v);
          } else {
            el.textContent = UI.formatBtcCompact(v);
          }
        } catch (e) {}
      },
      refreshEventLogList: function () {
        var body = document.querySelector(".eventlog-list-body");
        if (!body) return;
        body.innerHTML = UI.renderEventLogListBody();
      },
  });
})();
