(function () {
  window.UI = window.UI || {};
  var UI = window.UI;

  function isInstalled(appId) {
    return !!(window.Game && Game.PC && Game.PC.isAppInstalled && Game.PC.isAppInstalled(appId));
  }

  function ctaInstall(appId, installLabel, openLabel) {
    var installed = isInstalled(appId);
    var label = installed ? (openLabel || "Open") : (installLabel || "Download");
    var attr = installed ? 'data-web-open-app="' + appId + '"' : 'data-web-install-app="' + appId + '"';
    var cls = installed ? "btn btn-small btn-outline" : "btn btn-small btn-primary";
    return '<button class="' + cls + '" type="button" ' + attr + ">" + label + "</button>";
  }

  function siteShell(opts) {
    var o = opts || {};
    var host = String(o.host || "");
    var title = String(o.title || host || "Site");
    var sub = String(o.sub || "");
    var art = String(o.art || "");
    var badge = o.badge ? String(o.badge) : "";
    var nav = Array.isArray(o.nav) ? o.nav : [];
    var navHtml = nav.length
      ? ('<div class="pc-web-site-nav">' + nav.map(function (n) {
        return '<a href="#" class="pc-web-site-navlink" data-web-href="' + n.href + '">' + n.label + "</a>";
      }).join("") + "</div>")
      : "";

    return (
      '<div class="pc-web-page pc-web-site ' + (o.className || "") + '">' +
        '<div class="pc-web-sitebar">' +
          '<div class="pc-web-sitebar-left">' +
            '<div class="pc-web-sitebrand">' + title + "</div>" +
            '<div class="pc-web-sitesub small dim">' + (sub ? sub : host) + "</div>" +
          "</div>" +
          '<div class="pc-web-sitebar-right">' + (badge ? ('<span class="pc-web-badge mono">' + badge + "</span>") : "") + "</div>" +
        "</div>" +
        navHtml +
        (art
          ? ('<div class="pc-web-hero pc-web-hero-site">' +
              '<img class="pc-web-hero-bg" loading="lazy" src="' + art + '" alt="">' +
              '<div class="pc-web-hero-overlay"></div>' +
              '<div class="pc-web-hero-content">' + (o.heroHtml || "") + "</div>" +
            "</div>")
          : ('<div class="pc-web-card" style="max-width:920px;">' + (o.heroHtml || "") + "</div>")) +
        (o.bodyHtml || "") +
      "</div>"
    );
  }

  function hostOf(url) {
    try {
      var u = String(url || "");
      return u.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
    } catch (e) {}
    return "";
  }

  function pathOf(url) {
    try {
      var u = String(url || "");
      var noProto = u.replace(/^https?:\/\//, "");
      var slash = noProto.indexOf("/");
      if (slash < 0) return "/";
      var rest = noProto.substring(slash);
      return rest || "/";
    } catch (e) {}
    return "/";
  }

  UI.PCWeb = UI.PCWeb || { sites: [], searchEntries: [] };

  UI._pcWebHelpers = UI._pcWebHelpers || {
    siteShell: siteShell,
    ctaInstall: ctaInstall,
    hostOf: hostOf,
    pathOf: pathOf
  };

  UI.pcWebRegisterSite = UI.pcWebRegisterSite || function (siteDef) {
    if (!siteDef || typeof siteDef !== "object") return;
    if (!UI.PCWeb) UI.PCWeb = { sites: [], searchEntries: [] };
    UI.PCWeb.sites.push(siteDef);
    if (siteDef.search && typeof UI.pcWebRegisterSearchEntry === "function") {
      UI.pcWebRegisterSearchEntry(siteDef.search);
    }
  };

  UI.pcWebRegisterSearchEntry = UI.pcWebRegisterSearchEntry || function (entry) {
    if (!entry || typeof entry !== "object") return;
    if (!UI.PCWeb) UI.PCWeb = { sites: [], searchEntries: [] };
    UI.PCWeb.searchEntries.push(entry);
  };

  UI.pcWebSearch = UI.pcWebSearch || function (query, maxResults) {
    var q = String(query || "").trim().toLowerCase();
    var max = (typeof maxResults === "number" && isFinite(maxResults) && maxResults > 0) ? Math.floor(maxResults) : 12;
    var toks = q ? q.split(/[^a-z0-9]+/g).filter(Boolean) : [];
    var entries = (UI.PCWeb && Array.isArray(UI.PCWeb.searchEntries)) ? UI.PCWeb.searchEntries.slice() : [];

    function scoreEntry(e) {
      if (!e) return 0;
      if (!toks.length) return (e.popular ? 1 : 0);
      var title = String(e.title || "").toLowerCase();
      var url = String(e.url || "").toLowerCase();
      var host = hostOf(url);
      var snip = String(e.snippet || "").toLowerCase();
      var kws = Array.isArray(e.keywords) ? e.keywords : [];
      var score = 0;
      for (var i = 0; i < toks.length; i++) {
        var t = toks[i];
        if (!t) continue;
        if (title.indexOf(t) >= 0) score += 6;
        if (host.indexOf(t) >= 0) score += 5;
        if (snip.indexOf(t) >= 0) score += 3;
        for (var k = 0; k < kws.length; k++) {
          if (String(kws[k] || "").toLowerCase() === t) { score += 8; break; }
        }
      }
      return score;
    }

    var scored = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var s = scoreEntry(e);
      if (toks.length && s <= 0) continue;
      scored.push({ e: e, s: s });
    }
    scored.sort(function (a, b) {
      if (b.s !== a.s) return b.s - a.s;
      return String((a.e && a.e.title) || "").localeCompare(String((b.e && b.e.title) || ""));
    });
    return scored.slice(0, max).map(function (x) { return Object.assign({ score: x.s }, x.e); });
  };

  UI.pcWebGetTitle = function (url) {
    var u = String(url || "");
    if (u.indexOf("https://ninja.web/mining") === 0) return "Mining Hub";
    var host = hostOf(u);
    if (UI.PCWeb && Array.isArray(UI.PCWeb.sites)) {
      for (var i = 0; i < UI.PCWeb.sites.length; i++) {
        var s = UI.PCWeb.sites[i];
        if (!s) continue;
        try {
          if (typeof s.getTitle === "function") {
            var t = s.getTitle(u, host);
            if (t) return t;
          }
          if (s.host && String(s.host).toLowerCase() === host && s.title) return String(s.title);
          if (Array.isArray(s.hosts)) {
            for (var hi = 0; hi < s.hosts.length; hi++) {
              if (String(s.hosts[hi] || "").toLowerCase() === host && s.title) return String(s.title);
            }
          }
        } catch (e) {}
      }
    }
    if (host === "bitforge.mining") return "BitForge Mining";
    if (host === "ninjastore.market") return "NinjaStore";
    if (host === "dyzo.casino") return "DYZO Casino";
    if (host === "inboxzero.mail") return "InboxZero";
    if (host === "lotline.properties") return "LotLine Properties";
    if (host === "cleanup.pro") return "Cleanup Pro";
    if (host === "blockscope.exchange") return "BlockScope Exchange";
    if (host === "rigmart.hardware") return "RigMart Hardware";
    if (host === "hashhelp.support") return "HashHelp Support";
    return "";
  };

  UI.pcWebRenderCustom = function (url) {
    var u = String(url || "");

    if (UI.PCWeb && Array.isArray(UI.PCWeb.sites)) {
      var host0 = hostOf(u);
      for (var i = 0; i < UI.PCWeb.sites.length; i++) {
        var s = UI.PCWeb.sites[i];
        if (!s) continue;
        try {
          var match = false;
          if (typeof s.match === "function") match = !!s.match(u, host0);
          else if (s.host && String(s.host).toLowerCase() === host0) match = true;
          else if (Array.isArray(s.hosts)) {
            for (var hi = 0; hi < s.hosts.length; hi++) {
              if (String(s.hosts[hi] || "").toLowerCase() === host0) { match = true; break; }
            }
          }
          if (!match) continue;
          if (typeof s.render === "function") {
            var html = s.render(u, UI._pcWebHelpers);
            if (html) return html;
          }
        } catch (e) {}
      }
    }

    var assetsBase = "assets/websites/";

    // Ninja Web: mining hub directory (curated).
    if (u.indexOf("https://ninja.web/mining") === 0) {
      var tiles = [
        { href: "https://bitforge.mining/", title: "BitForge Mining", sub: "PC Miner", img: assetsBase + "mining_farm.svg" },
        { href: "https://blockscope.exchange/", title: "BlockScope Exchange", sub: "Crypto prices", img: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Computer_network_diagram.svg" },
        { href: "https://rigmart.hardware/", title: "RigMart", sub: "Hardware store", img: "https://upload.wikimedia.org/wikipedia/commons/2/21/GPU_-_graphics_card.jpg" },
        { href: "https://hashhelp.support/", title: "HashHelp", sub: "Guides & support", img: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Helpdesk_icon.svg" },
        { href: "https://ninjastore.market/", title: "NinjaStore", sub: "Online Market", img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Shopping_cart_icon.svg" },
        { href: "https://cleanup.pro/", title: "Cleanup Pro", sub: "System Cleaner", img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Recycle_symbol.svg" }
      ];
      var cards = tiles.map(function (t) {
        return (
          '<a href="#" class="pc-web-photo pc-web-hub-tile" data-web-href="' + t.href + '">' +
            '<img loading="lazy" src="' + t.img + '" alt="">' +
            '<div class="pc-web-photo-meta"><span>' + t.title + '</span><span class="mono">' + t.sub + "</span></div>" +
          "</a>"
        );
      }).join("");

      return (
        '<div class="pc-web-page">' +
          '<div class="pc-web-hero pc-web-hero-small">' +
            '<img class="pc-web-hero-bg" loading="lazy" src="' + assetsBase + 'bitcoin_coin.svg" alt="">' +
            '<div class="pc-web-hero-overlay"></div>' +
            '<div class="pc-web-hero-content">' +
              '<div style="font-size:18px;font-weight:800;">Mining Hub</div>' +
              '<div class="pc-web-hero-sub">Full mock websites with installers, guides, and dashboards.</div>' +
              '<div class="pc-web-quicklinks">' +
                '<a href="#" class="pc-web-quick" data-web-href="https://ninja.web/apps">Apps</a>' +
                '<a href="#" class="pc-web-quick" data-web-href="https://ninja.web/search?q=btc%20mining">Search</a>' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            cards +
          "</div>" +
        "</div>"
      );
    }

    // BitForge Mining (PC Miner)
    if (hostOf(u) === "bitforge.mining") {
      var p = pathOf(u);
      var nav = [
        { href: "https://bitforge.mining/", label: "Overview" },
        { href: "https://bitforge.mining/guides", label: "Guides" },
        { href: "https://bitforge.mining/hardware", label: "Hardware" },
        { href: "https://bitforge.mining/download", label: "Download" }
      ];

      var body = "";
      if (p.indexOf("/guides") === 0) {
        body =
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Beginner: power limits first</div><div class="small dim">Lower power target, then slowly increase clocks while watching temps.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Pool selection</div><div class="small dim">Choose stable pools, monitor latency, and keep backups configured.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Thermals</div><div class="small dim">Clean airflow beats peak clocks. Keep filters and fans maintained.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Profit math</div><div class="small dim">Hashrate is not profit. Track electricity + downtime + wear.</div></div>' +
          "</div>";
      } else if (p.indexOf("/hardware") === 0) {
        body =
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Recommended baseline</div>' +
            '<div class="pc-web-kv"><span>GPU</span><span class="mono">Efficient mid-tier+</span></div>' +
            '<div class="pc-web-kv"><span>RAM</span><span class="mono">8–16 GB</span></div>' +
            '<div class="pc-web-kv"><span>Storage</span><span class="mono">SSD for cache/logs</span></div>' +
            '<div class="pc-web-kv"><span>Cooling</span><span class="mono">Case airflow + clean filters</span></div>' +
          "</div>" +
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-photo"><img loading="lazy" src="' + assetsBase + 'miner_rig.svg" alt=""><div class="pc-web-photo-meta"><span>Rig layout</span><span class="mono">BF-02</span></div></div>' +
            '<div class="pc-web-photo"><img loading="lazy" src="' + assetsBase + 'bitcoin_coin.svg" alt=""><div class="pc-web-photo-meta"><span>Telemetry</span><span class="mono">BF-01</span></div></div>' +
            '<div class="pc-web-photo"><img loading="lazy" src="' + assetsBase + 'mining_farm.svg" alt=""><div class="pc-web-photo-meta"><span>Farm racks</span><span class="mono">BF-03</span></div></div>' +
          "</div>";
      } else if (p.indexOf("/download") === 0) {
        body =
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">PC Miner</div>' +
            '<div class="small dim">Verified build • signed releases • simulated package</div>' +
            '<div class="mt-10">' + ctaInstall("pcminer", "Download PC Miner", "Open PC Miner") + "</div>" +
          "</div>";
      } else {
        body =
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Telemetry</div><div class="small dim">Hashrate, temperature and power views.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Profiles</div><div class="small dim">Quiet / Balanced / Performance presets.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Security</div><div class="small dim">Checksums and release notes.</div></div>' +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Get started</div>' +
            '<div class="small dim">Download PC Miner, choose a coin, and monitor resource usage.</div>' +
            '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="https://bitforge.mining/download">Go to download ›</a></div>' +
          "</div>";
      }

      return siteShell({
        host: "bitforge.mining",
        title: "BitForge Mining",
        sub: "BTC mining tools • telemetry • tuning",
        badge: "VERIFIED",
        className: "pc-web-site--bitforge",
        nav: nav,
        art: assetsBase + "mining_farm.svg",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div>' +
              '<div style="font-size:18px;font-weight:800;">PC Miner</div>' +
              '<div class="pc-web-hero-sub">A realistic miner suite for monitoring and tuning.</div>' +
            "</div>" +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              ctaInstall("pcminer", "Download", "Open") +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://ninja.web/mining">Back to hub</a>' +
            "</div>" +
          "</div>",
        bodyHtml: body
      });
    }

    function appSite(host, title, sub, art, appId) {
      var p = pathOf(u);
      var nav = [
        { href: "https://" + host + "/", label: "Home" },
        { href: "https://" + host + "/download", label: "Download" },
        { href: "https://ninja.web/mining", label: "Mining Hub" }
      ];
      var isDl = (p.indexOf("/download") === 0);
      var body = isDl
        ? ('<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">' + title + " installer</div>" +
            '<div class="small dim">Direct download • verified publisher • simulated package</div>' +
            '<div class="mt-10">' + ctaInstall(appId, "Download", "Open") + "</div>" +
          "</div>")
        : ('<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Fast</div><div class="small dim">Optimized UI and smooth interactions.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Integrated</div><div class="small dim">Works with downloads and your PC tools.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Trusted</div><div class="small dim">Verified publisher and clean installs.</div></div>' +
          "</div>" +
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Download</div>' +
            '<div class="small dim">Grab the installer and the app will appear after install.</div>' +
            '<div class="mt-10"><a href="#" class="pc-web-link" data-web-href="https://' + host + '/download">Go to download ›</a></div>' +
          "</div>");
      return siteShell({
        host: host,
        title: title,
        sub: sub,
        badge: "SECURE",
        className: "pc-web-site--app",
        nav: nav,
        art: art,
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">' + title + "</div><div class=\"pc-web-hero-sub\">" + sub + "</div></div>" +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              ctaInstall(appId, "Download", "Open") +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://ninja.web/mining">Hub</a>' +
            "</div>" +
          "</div>",
        bodyHtml: body
      });
    }

    // Existing app sites.
    var host = hostOf(u);
    if (host === "ninjastore.market") return appSite(host, "NinjaStore", "Market listings and PC shopping", "https://upload.wikimedia.org/wikipedia/commons/8/8e/Online-shopping.jpg", "market");
    if (host === "dyzo.casino") return appSite(host, "DYZO Casino", "Neon casino client and daily rewards", "https://upload.wikimedia.org/wikipedia/commons/4/47/Casino_interior.jpg", "casino");
    if (host === "inboxzero.mail") return appSite(host, "InboxZero", "Clean email, fast search, offline cache", "https://upload.wikimedia.org/wikipedia/commons/7/7c/Email_icon.png", "email");
    if (host === "lotline.properties") return appSite(host, "LotLine", "Property news, listings, and alerts", "https://upload.wikimedia.org/wikipedia/commons/0/0c/House_interior.jpg", "propertynews");
    if (host === "cleanup.pro") return appSite(host, "Cleanup Pro", "System Cleaner for cache and logs", "https://upload.wikimedia.org/wikipedia/commons/2/21/Computer-cleaning.jpg", "cleaner");

    // New full sites.
    if (host === "blockscope.exchange") {
      var p2 = pathOf(u);
      var nav2 = [
        { href: "https://blockscope.exchange/", label: "Markets" },
        { href: "https://blockscope.exchange/prices", label: "Prices" },
        { href: "https://blockscope.exchange/learn", label: "Learn" },
        { href: "https://ninja.web/mining", label: "Mining Hub" }
      ];
      var body2 = "";
      if (p2.indexOf("/learn") === 0) {
        body2 =
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Volatility</div><div class="small dim">Prices can move quickly. Use limits and avoid over-leverage.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Fees</div><div class="small dim">Track maker/taker and withdrawal costs when comparing venues.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Security</div><div class="small dim">Prefer hardware keys and unique passwords.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Risk</div><div class="small dim">Never trade money you can’t lose.</div></div>' +
          "</div>";
      } else {
        body2 =
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Live overview (simulated)</div>' +
            '<div class="pc-web-kv"><span>BTC/USD</span><span class="mono">$' + (Game && Game.state && Game.state.btc && Game.state.btc.exchange && Game.state.btc.exchange.priceUsd ? (Game.state.btc.exchange.priceUsd.toFixed(2)) : "0.00") + "</span></div>" +
            '<div class="pc-web-kv"><span>24h Volume</span><span class="mono">$' + (5000000 + Math.floor(Math.random() * 9000000)) + "</span></div>" +
            '<div class="pc-web-kv"><span>Status</span><span class="mono">OK</span></div>' +
          "</div>";
      }
      return siteShell({
        host: "blockscope.exchange",
        title: "BlockScope Exchange",
        sub: "Markets • charts • simulated prices",
        badge: "LIVE",
        className: "pc-web-site--exchange",
        nav: nav2,
        art: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Stock_market_data.jpg",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">Markets</div><div class="pc-web-hero-sub">Charts, prices, and market news (simulated).</div></div>' +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://blockscope.exchange/prices">View prices</a>' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://blockscope.exchange/learn">Learn</a>' +
            "</div>" +
          "</div>",
        bodyHtml: body2
      });
    }

    if (host === "rigmart.hardware") {
      var p3 = pathOf(u);
      var nav3 = [
        { href: "https://rigmart.hardware/", label: "Store" },
        { href: "https://rigmart.hardware/gpus", label: "GPUs" },
        { href: "https://rigmart.hardware/cooling", label: "Cooling" },
        { href: "https://ninja.web/mining", label: "Mining Hub" }
      ];
      var body3 = '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(3,minmax(0,1fr));max-width:960px;">';
      var cats = [
        { href: "https://rigmart.hardware/gpus", t: "GPUs", img: "https://upload.wikimedia.org/wikipedia/commons/2/21/GPU_-_graphics_card.jpg" },
        { href: "https://rigmart.hardware/cooling", t: "Cooling", img: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Computer_fan.jpg" },
        { href: "https://rigmart.hardware/psu", t: "Power", img: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Power_supply_unit.jpg" }
      ];
      for (var ci = 0; ci < cats.length; ci++) {
        body3 += '<a href="#" class="pc-web-photo" data-web-href="' + cats[ci].href + '"><img loading="lazy" src="' + cats[ci].img + '" alt=""><div class="pc-web-photo-meta"><span>' + cats[ci].t + "</span><span class=\"mono\">SHOP</span></div></a>";
      }
      body3 += "</div>";
      if (p3.indexOf("/gpus") === 0) {
        body3 += '<div class="pc-web-card mt-12" style="max-width:960px;"><div class="pc-web-card-title">GPU section</div><div class="small dim">Browse performance tiers, power draw, and efficiency (simulated).</div></div>';
      } else if (p3.indexOf("/cooling") === 0) {
        body3 += '<div class="pc-web-card mt-12" style="max-width:960px;"><div class="pc-web-card-title">Cooling</div><div class="small dim">Airflow tips, fan curves, and dust maintenance.</div></div>';
      }
      return siteShell({
        host: "rigmart.hardware",
        title: "RigMart Hardware",
        sub: "GPUs • cooling • power • cases",
        badge: "STORE",
        className: "pc-web-site--hardware",
        nav: nav3,
        art: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Computer_hardware_components.jpg",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">Hardware for miners</div><div class="pc-web-hero-sub">Components, airflow, and reliability essentials.</div></div>' +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://rigmart.hardware/gpus">Browse GPUs</a>' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://rigmart.hardware/cooling">Cooling</a>' +
            "</div>" +
          "</div>",
        bodyHtml: body3
      });
    }

    if (host === "hashhelp.support") {
      var p4 = pathOf(u);
      var nav4 = [
        { href: "https://hashhelp.support/", label: "Help Center" },
        { href: "https://hashhelp.support/troubleshooting", label: "Troubleshooting" },
        { href: "https://hashhelp.support/security", label: "Security" },
        { href: "https://ninja.web/mining", label: "Mining Hub" }
      ];
      var body4 = "";
      if (p4.indexOf("/security") === 0) {
        body4 =
          '<div class="pc-web-card mt-12" style="max-width:960px;">' +
            '<div class="pc-web-card-title">Security checklist</div>' +
            '<div class="pc-web-kv"><span>Updates</span><span class="mono">Keep software current</span></div>' +
            '<div class="pc-web-kv"><span>Passwords</span><span class="mono">Unique + long</span></div>' +
            '<div class="pc-web-kv"><span>2FA</span><span class="mono">Use security keys</span></div>' +
            '<div class="pc-web-kv"><span>Backups</span><span class="mono">Keep recovery codes</span></div>' +
          "</div>";
      } else {
        body4 =
          '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(2,minmax(0,1fr));max-width:960px;">' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Miner won’t start</div><div class="small dim">Check permissions, storage, and antivirus exclusions.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Low hashrate</div><div class="small dim">Verify temps, power limit, and throttling indicators.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Crashes</div><div class="small dim">Reduce clocks, check driver versions, and monitor RAM.</div></div>' +
            '<div class="pc-web-card"><div class="pc-web-card-title">Network issues</div><div class="small dim">Try backup pools and test DNS/resolution.</div></div>' +
          "</div>";
      }
      return siteShell({
        host: "hashhelp.support",
        title: "HashHelp Support",
        sub: "Guides • troubleshooting • security",
        badge: "HELP",
        className: "pc-web-site--help",
        nav: nav4,
        art: "https://upload.wikimedia.org/wikipedia/commons/5/55/Help_desk.jpg",
        heroHtml:
          '<div class="pc-web-hero-row">' +
            '<div><div style="font-size:18px;font-weight:800;">Help Center</div><div class="pc-web-hero-sub">Step-by-step troubleshooting and best practices.</div></div>' +
            '<div class="mt-8" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://hashhelp.support/troubleshooting">Troubleshooting</a>' +
              '<a href="#" class="btn btn-small btn-outline" data-web-href="https://hashhelp.support/security">Security</a>' +
            "</div>" +
          "</div>",
        bodyHtml: body4
      });
    }

    return null;
  };
})();
