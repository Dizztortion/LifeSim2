(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "byteguard.security",
    title: "ByteGuard",
    search: {
      title: "ByteGuard Security — antivirus",
      url: "https://byteguard.security/",
      snippet: "Security suite with cloud scan, safe browsing, and quarantine controls.",
      keywords: ["antivirus", "security", "cloud", "scan", "safe", "download"],
      popular: true
    },
    render: function (url) {
      var p = H.pathOf(url);
      var nav = [
        { href: "https://byteguard.security/", label: "Home" },
        { href: "https://byteguard.security/download", label: "Download" },
        { href: "https://byteguard.security/labs", label: "Labs" }
      ];
      if (p.indexOf("/download") === 0) {
        return H.siteShell({
          host: "byteguard.security",
          title: "ByteGuard",
          sub: "Security suite",
          badge: "SECURE",
          nav: nav,
          art: "https://picsum.photos/seed/byteguard/1200/520",
          heroHtml:
            '<div class="pc-web-hero-row">' +
              '<div><div style="font-size:18px;font-weight:800;">Download ByteGuard</div><div class="pc-web-hero-sub">One click installer · clean removal · automatic updates</div></div>' +
              '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
                H.ctaInstall("av_byteguard", "Download", "Open") +
                '<a href="#" class="btn btn-small btn-outline" data-web-href="https://byteguard.security/">Back</a>' +
              "</div>" +
            "</div>",
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Release notes</div>' +
              '<div class="small dim mt-6">Improved heuristic detection, faster full scan, refined quarantine UI.</div>' +
              '<div class="mt-10 small dim">Publisher: <span class="mono">ByteGuard Labs</span> · Package: <span class="mono">BG-Setup</span></div>' +
            "</div>"
        });
      }
      if (p.indexOf("/labs") === 0) {
        return H.siteShell({
          host: "byteguard.security",
          title: "ByteGuard",
          sub: "Labs",
          badge: "RESEARCH",
          nav: nav,
          art: "https://picsum.photos/seed/byteguardlabs/1200/520",
          heroHtml:
            '<div style="font-size:18px;font-weight:800;">Threat Labs</div>' +
            '<div class="pc-web-hero-sub">Detection signatures, behavior rules, and clean install policies.</div>',
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Featured topics</div>' +
              '<div class="pc-web-grid mt-10" style="grid-template-columns:repeat(2,minmax(0,1fr));">' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Crypto stealers</div><div class="small dim">How wallets are targeted and how to defend.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Drive-by downloads</div><div class="small dim">Safe browsing + prompt protections.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">PUA guidelines</div><div class="small dim">Potentially unwanted apps and their behaviors.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Quarantine</div><div class="small dim">Restore only trusted files from verified sources.</div></div>' +
              "</div>" +
              '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://antivirus">Open AntiVirus</a></div>' +
            "</div>"
        });
      }
      return H.siteShell({
        host: "byteguard.security",
        title: "ByteGuard",
        sub: "Security suite",
        badge: "VERIFIED",
        nav: nav,
        art: "https://picsum.photos/seed/byteguardhome/1200/520",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">Security that stays quiet</div><div class="pc-web-hero-sub">Cloud-assisted detection and realistic controls.</div></div>' +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              H.ctaInstall("av_byteguard", "Download", "Open") +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://byteguard.security/labs">Labs</a>' +
            "</div>" +
          "</div>",
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Safe browsing</div><div class="small dim">Warns about risky pages and bundles.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Cloud scan</div><div class="small dim">Extra checks for suspicious behavior.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Quarantine</div><div class="small dim">Review and restore items you trust.</div></div>' +
          "</div>"
      });
    }
  });
})();

