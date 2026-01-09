(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "hashrate.tools",
    title: "Hashrate Tools",
    search: {
      title: "Hashrate Tools — calculators",
      url: "https://hashrate.tools/",
      snippet: "Mining calculators for hashrate, power cost, and profitability (simulated).",
      keywords: ["tools", "miner", "mining", "hashrate", "calculator", "power", "finance"],
      popular: true
    },
    render: function () {
      var hashrate = 40 + Math.floor(Math.random() * 220);
      var watts = 180 + Math.floor(Math.random() * 420);
      var kwh = (0.08 + Math.random() * 0.22).toFixed(2);
      return H.siteShell({
        host: "hashrate.tools",
        title: "Hashrate Tools",
        sub: "Calculators",
        badge: "TOOLS",
        nav: [{ href: "https://hashrate.tools/", label: "Calculator" }],
        art: "https://picsum.photos/seed/hashratetools/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Profitability calculator</div>' +
          '<div class="pc-web-hero-sub">Simulated numbers with realistic inputs.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Inputs</div>' +
            '<div class="field-row mt-8"><span>Hashrate</span><span class="mono">' + hashrate + " MH/s</span></div>" +
            '<div class="field-row"><span>Power</span><span class="mono">' + watts + " W</span></div>" +
            '<div class="field-row"><span>Electricity</span><span class="mono">$' + kwh + " / kWh</span></div>" +
            '<div class="mt-10 small dim">Use the in-game Mining Rig app for real stats.</div>' +
            '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="app://mining">Open Mining Rig</a></div>' +
          "</div>"
      });
    }
  });
})();

