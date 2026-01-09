(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "adshield.extensions",
    title: "AdShield",
    search: {
      title: "AdShield — security tools",
      url: "https://adshield.extensions/",
      snippet: "Safe browsing tips and basic security hygiene (simulated).",
      keywords: ["tools", "security", "safe", "antivirus", "browser"],
      popular: false
    },
    render: function () {
      return H.siteShell({
        host: "adshield.extensions",
        title: "AdShield",
        sub: "Security tools",
        badge: "SAFE",
        nav: [{ href: "https://adshield.extensions/", label: "Overview" }],
        art: "https://picsum.photos/seed/adshield/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Safe browsing</div>' +
          '<div class="pc-web-hero-sub">Practical tips and realistic UI cards.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Verify downloads</div><div class="small dim">Use trusted sources and avoid unknown installers.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Keep definitions fresh</div><div class="small dim">Run updates before full scans.</div></div>' +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Open security</div>' +
            '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://antivirus">Open AntiVirus</a></div>' +
          "</div>"
      });
    }
  });
})();

