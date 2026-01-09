(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "minercafe.community",
    title: "MinerCafe",
    search: {
      title: "MinerCafe — mining community",
      url: "https://minercafe.community/",
      snippet: "Forums and guides for miners, pools, tuning, and troubleshooting.",
      keywords: ["miner", "mining", "community", "forums", "rig", "tools"],
      popular: true
    },
    render: function () {
      return H.siteShell({
        host: "minercafe.community",
        title: "MinerCafe",
        sub: "Mining community",
        badge: "FORUMS",
        nav: [{ href: "https://minercafe.community/", label: "Topics" }],
        art: "https://picsum.photos/seed/minercafe/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Top threads</div>' +
          '<div class="pc-web-hero-sub">Tuning, pools and troubleshooting.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Undervolting guide</div><div class="small dim">Lower watts with minimal hashrate loss.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Best pools</div><div class="small dim">Latency, fees, payout frequency.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Miner flagged by AV</div><div class="small dim">Verify publisher + checksum before exclusions.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Storage filling up</div><div class="small dim">Cache growth and temp cleanup tips.</div></div>' +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Deep links</div>' +
            '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://pcminer">Open PC Miner</a></div>' +
            '<div class="mt-6"><a href="#" class="pc-web-link" data-web-href="https://ninja.web/mining">Ninja Mining Hub</a></div>' +
          "</div>"
      });
    }
  });
})();

