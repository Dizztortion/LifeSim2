(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "toolboxx.utilities",
    title: "ToolboxX",
    search: {
      title: "ToolboxX — utilities directory",
      url: "https://toolboxx.utilities/",
      snippet: "Curated utility links: monitoring, networking, and diagnostics.",
      keywords: ["tools", "utilities", "monitor", "diagnostics", "network", "system"],
      popular: true
    },
    render: function () {
      return H.siteShell({
        host: "toolboxx.utilities",
        title: "ToolboxX",
        sub: "Utilities directory",
        badge: "CURATED",
        nav: [
          { href: "https://toolboxx.utilities/", label: "Directory" }
        ],
        art: "https://picsum.photos/seed/toolboxx/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Utilities, in one place</div>' +
          '<div class="pc-web-hero-sub">Quick access to realistic in-game tools.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Quick links</div>' +
            '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://monitor">Task Manager</a></div>' +
            '<div class="mt-6"><a href="#" class="pc-web-link" data-web-href="app://tools">Tools</a></div>' +
            '<div class="mt-6"><a href="#" class="pc-web-link" data-web-href="app://antivirus">AntiVirus</a></div>' +
            '<div class="mt-6"><a href="#" class="pc-web-link" data-web-href="app://cleaner">System Cleaner</a></div>' +
          "</div>"
      });
    }
  });
})();

