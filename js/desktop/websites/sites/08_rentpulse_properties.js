(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "rentpulse.properties",
    title: "RentPulse",
    search: {
      title: "RentPulse — rental analytics",
      url: "https://rentpulse.properties/",
      snippet: "Rental trends, vacancy rates, and neighborhood breakdowns (simulated).",
      keywords: ["property", "rent", "finance", "trends", "analytics"],
      popular: false
    },
    render: function () {
      var vac = 2 + Math.floor(Math.random() * 8);
      return H.siteShell({
        host: "rentpulse.properties",
        title: "RentPulse",
        sub: "Rental analytics",
        badge: "DATA",
        nav: [{ href: "https://rentpulse.properties/", label: "Dashboard" }],
        art: "https://picsum.photos/seed/rentpulse/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Rental market pulse</div>' +
          '<div class="pc-web-hero-sub">Simulated charts and metrics for a realistic feel.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Vacancy</div><div class="small dim"><span class="mono">' + vac + "%</span> city-wide</div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Median rent</div><div class="small dim"><span class="mono">$' + (900 + Math.floor(Math.random() * 600)) + "</span>/mo</div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Trend</div><div class="small dim"><span class="mono">' + (Math.random() < 0.5 ? "-" : "+") + (0.2 + Math.random() * 1.8).toFixed(1) + "%</span> this week</div></div>" +
          "</div>"
      });
    }
  });
})();

