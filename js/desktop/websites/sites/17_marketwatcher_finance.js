(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "marketwatcher.finance",
    title: "MarketWatcher",
    search: {
      title: "MarketWatcher — markets",
      url: "https://marketwatcher.finance/",
      snippet: "Simple market dashboard with movers and watchlists (simulated).",
      keywords: ["finance", "markets", "watchlist", "prices", "exchange"],
      popular: false
    },
    render: function () {
      var tickers = ["BTC", "ETH", "LTC", "DOGE"];
      var rows = tickers.map(function (t) {
        var px = t === "BTC" ? (22000 + Math.random() * 18000) : (10 + Math.random() * 800);
        var ch = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 7);
        return '<tr><td class="mono">' + t + '</td><td class="mono">$' + px.toFixed(t === "BTC" ? 0 : 2) + '</td><td class="mono" style="color:' + (ch >= 0 ? "#00ffa3" : "#ff3b3b") + ';">' + (ch >= 0 ? "+" : "") + ch.toFixed(2) + "%</td></tr>";
      }).join("");
      return H.siteShell({
        host: "marketwatcher.finance",
        title: "MarketWatcher",
        sub: "Markets",
        badge: "LIVE",
        nav: [{ href: "https://marketwatcher.finance/", label: "Dashboard" }],
        art: "https://picsum.photos/seed/marketwatcher/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Markets dashboard</div>' +
          '<div class="pc-web-hero-sub">Simulated prices with realistic table styling.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:860px;">' +
            '<div class="pc-web-card-title">Watchlist</div>' +
            '<table class="table mt-10"><thead><tr><th>Symbol</th><th>Price</th><th>24h</th></tr></thead><tbody>' + rows + "</tbody></table>" +
            '<div class="small dim mt-8">Open Ninja Finance for more.</div>' +
            '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="https://ninja.web/finance">Open Ninja Finance</a></div>' +
          "</div>"
      });
    }
  });
})();

