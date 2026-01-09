(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "safecloud.backup",
    title: "SafeCloud",
    search: {
      title: "SafeCloud — backup service",
      url: "https://safecloud.backup/",
      snippet: "Backup plans, retention policies and restore tests (simulated).",
      keywords: ["backup", "cloud", "security", "tools", "storage"],
      popular: false
    },
    render: function () {
      return H.siteShell({
        host: "safecloud.backup",
        title: "SafeCloud",
        sub: "Backup service",
        badge: "BACKUP",
        nav: [{ href: "https://safecloud.backup/", label: "Plans" }],
        art: "https://picsum.photos/seed/safecloud/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Backup plans</div>' +
          '<div class="pc-web-hero-sub">Retention policies and realistic plan cards (simulated).</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Basic</div><div class="small dim">7-day retention · nightly snapshots</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Plus</div><div class="small dim">30-day retention · hourly deltas</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Pro</div><div class="small dim">90-day retention · immutable backups</div></div>' +
          "</div>"
      });
    }
  });
})();

