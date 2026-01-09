(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;

  UI.pcWebRegisterSite({
    host: "homesnap.properties",
    title: "HomeSnap",
    search: {
      title: "HomeSnap — property listings",
      url: "https://homesnap.properties/",
      snippet: "Browse listings, price history, and neighborhood stats (simulated).",
      keywords: ["property", "homes", "rent", "mortgage", "listings", "finance"],
      popular: true
    },
    render: function () {
      return H.siteShell({
        host: "homesnap.properties",
        title: "HomeSnap",
        sub: "Property listings",
        badge: "LISTINGS",
        nav: [
          { href: "https://homesnap.properties/", label: "Explore" },
          { href: "app://propertynews", label: "Open app" }
        ],
        art: "https://picsum.photos/seed/homesnap/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Find your next place</div>' +
          '<div class="pc-web-hero-sub">Realistic listing cards and filters (simulated).</div>',
        bodyHtml:
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Studio</div><div class="small dim">City Centre · <span class="mono">$720</span>/mo</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">2BR</div><div class="small dim">Riverside · <span class="mono">$1,240</span>/mo</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Townhouse</div><div class="small dim">North District · <span class="mono">$2,350</span>/mo</div></div>' +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Deep link</div>' +
            '<div class="small dim mt-6">Open the in-game Property News app for full interaction.</div>' +
            '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://propertynews">Open Property News</a></div>' +
          "</div>"
      });
    }
  });
})();

