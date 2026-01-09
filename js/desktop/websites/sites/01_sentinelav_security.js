(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  function fmtDay(day) {
    var d = (typeof day === "number" && isFinite(day) && day > 0) ? Math.floor(day) : 0;
    return d ? ("Day " + d) : "Never";
  }

  UI.pcWebRegisterSite({
    host: "sentinelav.security",
    title: "Sentinel AV",
    search: {
      title: "Sentinel AV — antivirus download",
      url: "https://sentinelav.security/",
      snippet: "Lightweight security suite with real-time protection, firewall, and on-demand scans.",
      keywords: ["antivirus", "security", "malware", "scan", "firewall", "download", "clean"],
      popular: true
    },
    render: function (url) {
      var p = H.pathOf(url);
      var pc = (window.Game && Game.state) ? Game.state.pc : null;
      var av = pc && pc.antivirus ? pc.antivirus : null;
      var vendor = av && av.vendor ? String(av.vendor) : "builtin";
      var activeLabel = (vendor === "av_sentinel") ? "Active" : "Not active";
      var nav = [
        { href: "https://sentinelav.security/", label: "Overview" },
        { href: "https://sentinelav.security/download", label: "Download" },
        { href: "https://sentinelav.security/support", label: "Support" }
      ];

      if (p.indexOf("/download") === 0) {
        return H.siteShell({
          host: "sentinelav.security",
          title: "Sentinel AV",
          sub: "Security suite",
          badge: "SIGNED",
          nav: nav,
          art: "https://picsum.photos/seed/sentinelav/1200/520",
          heroHtml:
            '<div class="pc-web-hero-row">' +
              '<div>' +
                '<div style="font-size:18px;font-weight:800;">Sentinel AV Installer</div>' +
                '<div class="pc-web-hero-sub">Verified publisher · silent install · auto updates</div>' +
              "</div>" +
              '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
                H.ctaInstall("av_sentinel", "Download", "Open") +
                '<a href="#" class="btn btn-small btn-outline" data-web-href="https://sentinelav.security/">Back</a>' +
              "</div>" +
            "</div>",
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">What you get</div>' +
              '<div class="small dim mt-6">Real-time protection, quick/full scans, quarantine management, and definitions updates.</div>' +
              '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Real-time</div><div class="small dim">Monitors suspicious activity and blocks threats.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Firewall</div><div class="small dim">Basic inbound/outbound filtering (simulated).</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Updates</div><div class="small dim">Daily definitions and engine patches.</div></div>' +
              "</div>" +
            "</div>"
        });
      }

      if (p.indexOf("/support") === 0) {
        return H.siteShell({
          host: "sentinelav.security",
          title: "Sentinel AV",
          sub: "Support",
          badge: "24/7",
          nav: nav,
          art: "https://picsum.photos/seed/sentinelhelp/1200/520",
          heroHtml:
            '<div style="font-size:18px;font-weight:800;">Support Center</div>' +
            '<div class="pc-web-hero-sub">Guides, best practices, and safe defaults.</div>',
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Common fixes</div>' +
              '<div class="pc-web-grid mt-10" style="grid-template-columns:repeat(2,minmax(0,1fr));">' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Slow PC</div><div class="small dim">Run a quick scan and clear temp files.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Download blocked</div><div class="small dim">Check storage capacity and network speed.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Miner flagged</div><div class="small dim">Verify publisher and add exclusions only if trusted.</div></div>' +
                '<div class="pc-web-card"><div class="pc-web-card-title">Update stuck</div><div class="small dim">Restart updates and ensure enough disk space.</div></div>' +
              "</div>" +
              '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://antivirus">Open AntiVirus</a></div>' +
            "</div>"
        });
      }

      var defs = av && av.defsVersion ? String(av.defsVersion) : "0.0.0";
      return H.siteShell({
        host: "sentinelav.security",
        title: "Sentinel AV",
        sub: "Security suite",
        badge: activeLabel.toUpperCase(),
        nav: nav,
        art: "https://picsum.photos/seed/sentinelhero/1200/520",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div>' +
              '<div style="font-size:18px;font-weight:800;">Trust your machine</div>' +
              '<div class="pc-web-hero-sub">Protection that looks and feels like real security software.</div>' +
            "</div>" +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              H.ctaInstall("av_sentinel", "Download", "Open") +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="app://antivirus">Security dashboard</a>' +
            "</div>" +
          "</div>",
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Status</div><div class="small dim">Vendor: <span class="mono">' + vendor + "</span></div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Definitions</div><div class="small dim">Version <span class="mono">' + defs + "</span></div></div>" +
            '<div class="pc-web-card"><div class="pc-web-card-title">Last scan</div><div class="small dim">' + fmtDay(av ? av.lastScanDay : 0) + "</div></div>" +
          "</div>"
      });
    }
  });
})();

