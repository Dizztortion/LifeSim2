(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "fixit.help",
    title: "FixIt Help",
    search: {
      title: "FixIt Help — troubleshooting",
      url: "https://fixit.help/",
      snippet: "Troubleshooting guides for miner issues, network speed, and storage problems.",
      keywords: ["help", "support", "tools", "miner", "network", "clean", "antivirus"],
      popular: true
    },
    render: function () {
      return H.siteShell({
        host: "fixit.help",
        title: "FixIt Help",
        sub: "Troubleshooting",
        badge: "HELP",
        nav: [{ href: "https://fixit.help/", label: "Articles" }],
        art: "https://picsum.photos/seed/fixit/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Troubleshooting library</div>' +
          '<div class="pc-web-hero-sub">Short, realistic guides for common PC issues.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Miner won’t start</div><div class="small dim">Check permissions, storage, and antivirus exclusions.</div><div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://pcminer">Open PC Miner</a></div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Slow downloads</div><div class="small dim">Monitor throughput and active downloads.</div><div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://monitor">Open Task Manager</a></div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Low disk space</div><div class="small dim">Clear temp files and caches.</div><div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://cleaner">Open System Cleaner</a></div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Security alert</div><div class="small dim">Run a full scan and review quarantine.</div><div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://antivirus">Open AntiVirus</a></div></div>' +
          "</div>"
      });
    }
  });
})();

