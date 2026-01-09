(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "devdocs.tools",
    title: "DevDocs",
    search: {
      title: "DevDocs — tool docs",
      url: "https://devdocs.tools/",
      snippet: "Reference pages for utilities and common workflows (simulated).",
      keywords: ["tools", "docs", "reference", "utilities"],
      popular: false
    },
    render: function () {
      return H.siteShell({
        host: "devdocs.tools",
        title: "DevDocs",
        sub: "Reference",
        badge: "DOCS",
        nav: [{ href: "https://devdocs.tools/", label: "Reference" }],
        art: "https://picsum.photos/seed/devdocs/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Reference</div>' +
          '<div class="pc-web-hero-sub">Short docs that feel like real tooling pages.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Topics</div>' +
            '<div class="mt-8"><span class="tag">Downloads</span> <span class="tag">Processes</span> <span class="tag">Storage</span> <span class="tag">Security</span></div>' +
          "</div>"
      });
    }
  });
})();

