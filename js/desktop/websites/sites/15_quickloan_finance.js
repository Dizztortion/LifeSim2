(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.pcWebRegisterSite || !UI._pcWebHelpers) return;
  var H = UI._pcWebHelpers;
  UI.pcWebRegisterSite({
    host: "quickloan.finance",
    title: "QuickLoan",
    search: {
      title: "QuickLoan — finance offers",
      url: "https://quickloan.finance/",
      snippet: "Loan offers, repayment schedules, and APR tables (simulated).",
      keywords: ["finance", "loan", "apr", "money", "property"],
      popular: false
    },
    render: function () {
      var apr = (7 + Math.random() * 18).toFixed(1);
      return H.siteShell({
        host: "quickloan.finance",
        title: "QuickLoan",
        sub: "Finance offers",
        badge: "APR " + apr + "%",
        nav: [{ href: "https://quickloan.finance/", label: "Offers" }],
        art: "https://picsum.photos/seed/quickloan/1200/520",
        heroHtml:
          '<div style="font-size:18px;font-weight:800;">Offers (simulated)</div>' +
          '<div class="pc-web-hero-sub">Realistic tables and repayment examples.</div>',
        bodyHtml:
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Example offer</div>' +
            '<div class="field-row mt-8"><span>Amount</span><span class="mono">$' + (500 + Math.floor(Math.random() * 5000)) + "</span></div>" +
            '<div class="field-row"><span>APR</span><span class="mono">' + apr + "%</span></div>" +
            '<div class="field-row"><span>Term</span><span class="mono">' + (6 + Math.floor(Math.random() * 24)) + " months</span></div>" +
            '<div class="small dim mt-10">Not a real transaction. This is a mock site for immersion.</div>' +
          "</div>"
      });
    }
  });
})();

