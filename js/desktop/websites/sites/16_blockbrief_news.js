(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "blockbrief.news",
    title: "BlockBrief",
    search: {
      title: "BlockBrief — crypto news",
      url: "https://blockbrief.news/",
      snippet: "Headlines, market summaries, and miner stories (simulated).",
      keywords: ["news", "crypto", "finance", "miner", "markets"],
      popular: false
    },
    render: function () {
      var heads = ["Market cools after rally", "Mining difficulty rises", "Security incident report", "New hardware review"];
      return H.siteShell({
        host: "blockbrief.news",
        title: "BlockBrief",
        sub: "Crypto news",
        badge: "NEWS",
        nav: [{ href: "https://blockbrief.news/", label: "Headlines" }],
        art: "https://picsum.photos/seed/blockbrief/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Headlines</div>' +
          '<div class="pc-web-hero-sub">Simulated news cards with realistic layout.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            heads.map(function (h) { return '<div class="pc-web-card"><div class="pc-web-card-title">' + h + '</div><div class="small dim">Updated today · Read time 3 min</div></div>'; }).join("") +
          "</div>"
      });
    }
  });
})();

