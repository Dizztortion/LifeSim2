(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "poolwave.mining",
    title: "PoolWave",
    search: {
      title: "PoolWave — mining pool",
      url: "https://poolwave.mining/",
      snippet: "Pool stats, payout schedule, and worker monitoring (simulated).",
      keywords: ["miner", "mining", "pool", "workers", "stats"],
      popular: false
    },
    render: function () {
      var workers = 1 + Math.floor(Math.random() * 6);
      return H.siteShell({
        host: "poolwave.mining",
        title: "PoolWave",
        sub: "Mining pool",
        badge: "POOL",
        nav: [{ href: "https://poolwave.mining/", label: "Dashboard" }],
        art: "https://picsum.photos/seed/poolwave/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Pool dashboard</div>' +
          '<div class="pc-web-hero-sub">Workers, uptime and payout schedule (simulated).</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Workers</div><div class="small dim"><span class="mono">' + workers + "</span> active</div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Uptime</div><div class="small dim"><span class="mono">' + (92 + Math.floor(Math.random() * 8)) + "%</span></div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Next payout</div><div class="small dim">in <span class="mono">' + (2 + Math.floor(Math.random() * 10)) + "h</span></div></div>" +
          "</div>"
      });
    }
  });
})();

