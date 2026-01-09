(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "ledgerlane.finance",
    title: "LedgerLane",
    search: {
      title: "LedgerLane — finance dashboard",
      url: "https://ledgerlane.finance/",
      snippet: "Budgeting, cashflow, and net-worth widgets (simulated).",
      keywords: ["finance", "budget", "money", "wallet", "net worth"],
      popular: true
    },
    render: function () {
      return H.siteShell({
        host: "ledgerlane.finance",
        title: "LedgerLane",
        sub: "Finance dashboard",
        badge: "FINANCE",
        nav: [
          { href: "https://ledgerlane.finance/", label: "Overview" },
          { href: "https://ninja.web/finance", label: "Ninja Finance" }
        ],
        art: "https://picsum.photos/seed/ledgerlane/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Your money, organized</div>' +
          '<div class="pc-web-hero-sub">Simulated widgets that feel like real finance tools.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Quick actions</div>' +
            '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://wallet">Open Wallet</a></div>' +
            '<div class="mt-6"><a href="#" class="pc-web-link" data-web-href="https://ninja.web/finance">Open Ninja Finance</a></div>' +
          "</div>"
      });
    }
  });
})();

