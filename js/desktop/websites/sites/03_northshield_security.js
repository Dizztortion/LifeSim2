(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "northshield.security",
    title: "NorthShield",
    search: {
      title: "NorthShield — endpoint protection",
      url: "https://northshield.security/",
      snippet: "Endpoint-style protection with policy toggles, scan modes, and update channels.",
      keywords: ["antivirus", "endpoint", "security", "scan", "update", "download"],
      popular: true
    },
    render: function (url) {
      var p = H.pathOf(url);
      var nav = [
        { href: "https://northshield.security/", label: "Product" },
        { href: "https://northshield.security/download", label: "Download" },
        { href: "https://northshield.security/policies", label: "Policies" }
      ];
      if (p.indexOf("/download") === 0) {
        return H.siteShell({
          host: "northshield.security",
          title: "NorthShield",
          sub: "Endpoint protection",
          badge: "ENTERPRISE",
          nav: nav,
          art: "https://picsum.photos/seed/northshield/1200/520",
          heroHtml:
            '<div class="pc-web-hero-row">' +
              '<div><div style="font-size:18px;font-weight:800;">NorthShield Installer</div><div class="pc-web-hero-sub">Stable channel · signed build · fast scan engine</div></div>' +
              '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
                H.ctaInstall("av_northshield", "Download", "Open") +
                '<a href="#" class="btn btn-small btn-outline" data-web-href="https://northshield.security/">Back</a>' +
              "</div>" +
            "</div>",
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Install notes</div>' +
              '<div class="small dim mt-6">After install, open the AntiVirus app to configure scan modes and protections.</div>' +
            "</div>"
        });
      }
      if (p.indexOf("/policies") === 0) {
        return H.siteShell({
          host: "northshield.security",
          title: "NorthShield",
          sub: "Policies",
          badge: "POLICY",
          nav: nav,
          art: "https://picsum.photos/seed/nspolicies/1200/520",
          heroHtml:
            '<div style="font-size:18px;font-weight:800;">Protection policies</div>' +
            '<div class="pc-web-hero-sub">A realistic policy view for endpoint-style controls.</div>',
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Default policy set</div>' +
              '<table class="table mt-10" style="max-width:960px;">' +
                '<thead><tr><th>Policy</th><th>Status</th><th>Notes</th></tr></thead>' +
                '<tbody>' +
                  '<tr><td class="mono">Real-time protection</td><td><span class="tag tag-ok">ON</span></td><td class="small dim">Blocks suspicious actions.</td></tr>' +
                  '<tr><td class="mono">Cloud protection</td><td><span class="tag tag-ok">ON</span></td><td class="small dim">Extra checks for unknown files.</td></tr>' +
                  '<tr><td class="mono">Firewall</td><td><span class="tag tag-ok">ON</span></td><td class="small dim">Baseline filtering.</td></tr>' +
                "</tbody>" +
              "</table>" +
              '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://antivirus">Open AntiVirus</a></div>' +
            "</div>"
        });
      }
      return H.siteShell({
        host: "northshield.security",
        title: "NorthShield",
        sub: "Endpoint protection",
        badge: "VERIFIED",
        nav: nav,
        art: "https://picsum.photos/seed/northshieldhome/1200/520",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">Endpoint-style controls</div><div class="pc-web-hero-sub">Policies, channels, and realistic scanning.</div></div>' +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              H.ctaInstall("av_northshield", "Download", "Open") +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://northshield.security/policies">Policies</a>' +
            "</div>" +
          "</div>",
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Scan modes</div><div class="small dim">Quick, full, and custom scans.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Channels</div><div class="small dim">Stable updates and signature packs.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Policy view</div><div class="small dim">Controls mapped to real settings.</div></div>' +
          "</div>"
      });
    }
  });
})();

