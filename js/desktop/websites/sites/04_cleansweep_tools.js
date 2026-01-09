(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "cleansweep.tools",
    title: "CleanSweep",
    search: {
      title: "CleanSweep — system cleaner",
      url: "https://cleansweep.tools/",
      snippet: "Cleanup guides, temp file removal, and cache management.",
      keywords: ["clean", "cleaner", "cleanup", "tools", "cache", "temp"],
      popular: true
    },
    render: function (url) {
      var p = H.pathOf(url);
      var nav = [
        { href: "https://cleansweep.tools/", label: "Home" },
        { href: "https://cleansweep.tools/guide", label: "Guide" },
        { href: "https://cleansweep.tools/download", label: "Download" }
      ];
      if (p.indexOf("/download") === 0) {
        return H.siteShell({
          host: "cleansweep.tools",
          title: "CleanSweep",
          sub: "System cleanup toolkit",
          badge: "CLEAN",
          nav: nav,
          art: "https://picsum.photos/seed/cleansweep/1200/520",
          heroHtml:
            '<div class="pc-web-hero-row">' +
              '<div><div style="font-size:18px;font-weight:800;">Cleaner download</div><div class="pc-web-hero-sub">Works with the in-game System Cleaner app.</div></div>' +
              '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
                H.ctaInstall("cleaner", "Download", "Open") +
                '<a href="#" class="btn btn-small btn-outline" data-web-href="https://cleansweep.tools/guide">Read guide</a>' +
              "</div>" +
            "</div>",
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Recommendations</div>' +
              '<div class="small dim mt-6">Clear caches and temp files first, keep logs if you are diagnosing issues.</div>' +
              '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://cleaner">Open System Cleaner</a></div>' +
            "</div>"
        });
      }
      if (p.indexOf("/guide") === 0) {
        return H.siteShell({
          host: "cleansweep.tools",
          title: "CleanSweep",
          sub: "Maintenance guide",
          badge: "GUIDE",
          nav: nav,
          art: "https://picsum.photos/seed/cleanguide/1200/520",
          heroHtml:
            '<div style="font-size:18px;font-weight:800;">Maintenance checklist</div>' +
            '<div class="pc-web-hero-sub">A quick guide for keeping your PC responsive.</div>',
          bodyHtml:
            '<div class="pc-web-card mt-12" style="max-width:960px;">' +
              '<div class="pc-web-card-title">Weekly routine</div>' +
              '<div class="small dim mt-6">1) Run a quick scan · 2) Clear temp files · 3) Check storage · 4) Review downloads.</div>' +
              '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="https://cleansweep.tools/download">Download tools</a></div>' +
            "</div>"
        });
      }
      return H.siteShell({
        host: "cleansweep.tools",
        title: "CleanSweep",
        sub: "System cleanup toolkit",
        badge: "VERIFIED",
        nav: nav,
        art: "https://picsum.photos/seed/cleansweephome/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Make space, keep speed</div>' +
          '<div class="pc-web-hero-sub">Cleanup tools, guides and best practices.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Temp files</div><div class="small dim">Remove leftovers from installs and sessions.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Cache</div><div class="small dim">Clear browser and app caches to recover space.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Logs</div><div class="small dim">Keep logs unless you need space urgently.</div></div>' +
          "</div>"
      });
    }
  });
})();

