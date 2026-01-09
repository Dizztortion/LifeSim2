(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "chatterbox.social",
    title: "ChatterBox",
    search: {
      title: "ChatterBox — social network",
      url: "https://chatterbox.social/",
      snippet: "Short posts, DMs, and trending topics (simulated).",
      keywords: ["social", "network", "messages", "chat", "community"],
      popular: false
    },
    render: function () {
      return H.siteShell({
        host: "chatterbox.social",
        title: "ChatterBox",
        sub: "Social network",
        badge: "LIVE",
        nav: [{ href: "https://chatterbox.social/", label: "Timeline" }],
        art: "https://picsum.photos/seed/chatterbox/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Timeline</div>' +
          '<div class="pc-web-hero-sub">A realistic-looking social timeline UI.</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">@streetcoder</div><div class="small dim">"Installed a new antivirus. Quiet mode is actually quiet."</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">@rigbuilder</div><div class="small dim">"Hashrate calculator is underrated. Saves power."</div></div>' +
          "</div>"
      });
    }
  });
})();

