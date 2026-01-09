(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "cryptocave.social",
    title: "CryptoCave",
    search: {
      title: "CryptoCave — social network",
      url: "https://cryptocave.social/",
      snippet: "Crypto-focused social posts, profiles, and trending tags (simulated).",
      keywords: ["social", "network", "crypto", "posts", "community", "miner"],
      popular: false
    },
    render: function () {
      var tags = ["#mining", "#wallet", "#security", "#altcoins", "#rigbuilds"];
      return H.siteShell({
        host: "cryptocave.social",
        title: "CryptoCave",
        sub: "Social network",
        badge: "BETA",
        nav: [{ href: "https://cryptocave.social/", label: "Feed" }],
        art: "https://picsum.photos/seed/cryptocave/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Your feed</div>' +
          '<div class="pc-web-hero-sub">Simulated posts and trending tags.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Trending</div>' +
            '<div class="mt-8 small dim">' + tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join(" ") + "</div>" +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Post</div>' +
            '<div class="small dim mt-6">"New rig build: temps are stable and hashrate is up."</div>' +
          "</div>"
      });
    }
  });
})();

