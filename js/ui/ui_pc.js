(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    getPCAppDefs: function () {
      if (UI.PCApps && typeof UI.PCApps.getAll === "function") {
        return UI.PCApps.getAll();
      }
      return [
        { id: "desktop", title: "Dashboard", sub: "Status", emoji: "🖥️" },
        { id: "wallet", title: "Wallet", sub: "BTC", emoji: "👛" },
        { id: "inventory", title: "Inventory", sub: "Items", emoji: "🎒" },
        { id: "mining", title: "Mining Rig", sub: "Hardware", emoji: "⛏️" },
        { id: "cloud", title: "Cloud Mining", sub: "Contracts", emoji: "☁️" },
        { id: "market", title: "Online Market", sub: "Shop", emoji: "🛒" },
        { id: "internet", title: "Internet", sub: "Web", emoji: "🌐" },
        { id: "pcminer", title: "PC Mining", sub: "Miner", emoji: "🧮" },
        { id: "antivirus", title: "AntiVirus", sub: "Security", emoji: "🛡️" },
        { id: "tools", title: "Tools", sub: "Utilities", emoji: "🧰" },
        { id: "cleaner", title: "System Cleaner", sub: "Cleanup", emoji: "🧹" },
        { id: "casino", title: "Casino", sub: "Slots", emoji: "🎰" },
        { id: "propertynews", title: "Property News", sub: "Listings", emoji: "📰" },
        { id: "email", title: "Email", sub: "Inbox", emoji: "✉️" },
        { id: "monitor", title: "Task Manager", sub: "Processes", emoji: "📊" }
      ];
    },
    getPCAppDef: function (appId) {
      var raw = String(appId || "");
      var id = (UI.PCApps && UI.PCApps.normalizeAppId) ? UI.PCApps.normalizeAppId(raw) : raw;
      var defs = UI.getPCAppDefs();
      for (var i = 0; i < defs.length; i++) {
        if (defs[i] && defs[i].id === id) return defs[i];
      }
      return null;
    },
    pcWebNavigate: function (url) {
      if (!Game || !Game.state || !Game.state.pc) return;
      if (!Game.state.pc.web || typeof Game.state.pc.web !== "object") Game.state.pc.web = {};
      var web = Game.state.pc.web;
      if (!Array.isArray(web.tabs)) web.tabs = [];
      if (typeof web.nextTabId !== "number" || !isFinite(web.nextTabId) || web.nextTabId < 1) web.nextTabId = 1;
      if (typeof web.activeTabId !== "number" || !isFinite(web.activeTabId)) web.activeTabId = 0;
      if (web.tabs.length === 0) {
        var tab = { id: web.nextTabId++, title: "Ninja Web", url: "https://ninja.web/", addr: "https://ninja.web/", back: [], forward: [] };
        web.tabs.push(tab);
        web.activeTabId = tab.id;
      }
      var active = null;
      for (var i = 0; i < web.tabs.length; i++) {
        if (web.tabs[i] && web.tabs[i].id === web.activeTabId) { active = web.tabs[i]; break; }
      }
      if (!active) active = web.tabs[0];
      if (!active) return;
      var target = String(url || "https://ninja.web/");
      if (active.url && active.url !== target) {
        if (!Array.isArray(active.back)) active.back = [];
        active.back.push(active.url);
        active.forward = [];
      }
      active.url = target;
      active.addr = target;
    },
    pcHasVisibleApp: function (appId) {
      if (!Game || !Game.state || !Game.state.pc || !Array.isArray(Game.state.pc.windows)) return false;
      var id = String(appId || "");
      for (var i = 0; i < Game.state.pc.windows.length; i++) {
        var w = Game.state.pc.windows[i];
        if (!w) continue;
        if (String(w.appId || "") !== id) continue;
        if (w.minimized) continue;
        return true;
      }
      return false;
    },
    renderPC: function () {
      var overlay = document.getElementById("pc-overlay");
      if (!overlay) return;
      overlay.classList.toggle("hidden", !Game.state.pc.isOpen);
      if (!Game.state.pc.isOpen) {
        if (UI.minimizeAllDownloadModals) UI.minimizeAllDownloadModals();
        return;
      }

      overlay.setAttribute("data-active-app", String(Game.state.pc.activeApp || "desktop"));
      UI.renderPCDesktopIcons();
      if (UI.renderPCDesktopWidgets) UI.renderPCDesktopWidgets();
      UI.renderPCStartMenu();
      UI.renderPCWindows();
      UI.renderPCTaskbar();
      UI.maybePromptDailyFreeSpins();
    },
    maybePromptDailyFreeSpins: function () {
      if (!UI || !UI.openModalCard) return;
      if (!Game || !Game.state || !Game.state.pc) return;
      var pc = Game.state.pc;
      if (!pc.isOpen) return;
      if (!UI.pcHasVisibleApp || !UI.pcHasVisibleApp("internet")) return;
      if (!pc.promptDailyFreeSpins) return;
      pc.promptDailyFreeSpins = false;
  
      if (UI._dailyFreeSpinsModalOpen) return;
      if (!Game.Casino || typeof Game.Casino.ensureState !== "function" || typeof Game.Casino.claimDailyFreeSpins !== "function") return;
      Game.Casino.ensureState();
  
      var casino = Game.state.casino || {};
      var slots = casino.slots || {};
      if (!Game.Casino.getDailyFreeSpinStatus) return;
      var status = Game.Casino.getDailyFreeSpinStatus();
      if (!status || !status.canClaim) return;
  
        var total = (typeof status.displayReward === "number" ? status.displayReward : status.pendingReward) || 0;
      var count = status.count || 0;
      var target = status.target || 0;
  
      UI._dailyFreeSpinsModalOpen = true;
      UI.openModalCard({
        title: "Daily spin goal",
        sub: "You hit today's spin goal.",
        bodyHtml: '<div class="card-section small dim">Spins: <span class="mono">' + count + "</span> / <span class=\"mono\">" + target + "</span></div>" +
          '<div class="card-section small dim">Claim <span class="mono">' + total + "</span> free spin" + (total === 1 ? "" : "s") + ".</div>",
        actions: [
          { id: "later", label: "Later", primary: false },
          { id: "claim", label: "Claim free spins", primary: true }
        ],
        onClose: function () {
          UI._dailyFreeSpinsModalOpen = false;
        },
        onAction: function (actionId, close) {
          if (actionId === "claim") {
            var res = Game.Casino.claimDailyFreeSpins();
            if (res && !res.ok && res.message) Game.addNotification(res.message);
          }
          close();
        }
      });
    },
    renderPCAppInto: function (appId, container) {
      if (!container) return;
      var id = String(appId || "desktop");
      if (id.indexOf("download:") === 0) {
        var downloadId = id.replace(/^download:/, "");
        UI.renderPCDownloadWindow(container, downloadId);
        return;
      }
      if (id === "textedit" || id.indexOf("textedit:") === 0) {
        var fid = null;
        if (id.indexOf("textedit:") === 0) fid = parseInt(id.replace(/^textedit:/, ""), 10);
        if (!isFinite(fid)) {
          try {
            if (Game && Game.PCFiles && Game.PCFiles.ensureState) Game.PCFiles.ensureState();
            var pc0 = (Game && Game.state) ? Game.state.pc : null;
            var first = (pc0 && pc0.desktop && Array.isArray(pc0.desktop.desktopFiles) && pc0.desktop.desktopFiles.length) ? pc0.desktop.desktopFiles[0] : null;
            fid = typeof first === "number" ? first : null;
          } catch (e) {}
        }
        if (UI.renderPCTextEditor) UI.renderPCTextEditor(container, fid);
        else container.innerHTML = '<h2>Text Editor</h2><div class="card-section small dim">Text editor unavailable.</div>';
        return;
      }
      if (id === "desktop") {
        UI.renderPCDesktop(container);
        return;
      }
      if (id === "wallet") {
        UI.renderPCWallet(container);
        return;
      }
      if (id === "inventory") {
        UI.renderPCInventory(container);
        return;
      }
      if (id === "mining") {
        UI.renderPCMining(container);
        return;
      }
      if (id === "cloud") {
        UI.renderPCCloudAdvanced(container);
        return;
      }
      if (id === "market") {
        UI.renderPCMarket(container);
        return;
      }
      if (id === "internet") {
        UI.renderPCInternet(container);
        return;
      }
      if (id === "casino") {
        UI.renderPCCasino(container);
        return;
      }
      if (id === "propertynews") {
        UI.renderPCPropertyNews(container);
        return;
      }
      if (id === "pcminer") {
        UI.renderPCMiner(container);
        return;
      }
      if (id === "antivirus") {
        UI.renderPCAntivirus(container);
        return;
      }
      if (id === "tools") {
        UI.renderPCTools(container);
        return;
      }
      if (id === "cleaner") {
        UI.renderPCCleaner(container);
        return;
      }
      if (id === "monitor") {
        container.innerHTML =
          "<h2>Task Manager</h2>" +
          '<div class="card-section small dim">Open processes and active downloads.</div>' +
          '<div class="card"><div class="card-title">Processes</div><div id="pc-sidebar-processes" class="pc-sidebar-downloads"></div></div>' +
          '<div class="card"><div class="card-title">Downloads</div><div id="pc-sidebar-downloads" class="pc-sidebar-downloads"></div></div>';
        UI.renderPCProcessesSidebar();
        UI.renderPCDownloadsSidebar();
        return;
      }
      if (id === "email") {
        container.innerHTML = '<h2>Email</h2><p class="small dim">Future feature: NPCs and systems can send you emails here.</p>';
        return;
      }
    },
    renderPCDownloadWindow: function (container, downloadId) {
      if (!container) return;
      var id = String(downloadId || "");
      if (!id) {
        container.innerHTML = '<h2>Download</h2><div class="card-section small dim">No download selected.</div>';
        return;
      }
      if (!Game || !Game.Downloads || !Game.Downloads.getById) {
        container.innerHTML = '<h2>Download</h2><div class="card-section small dim">Downloads system unavailable.</div>';
        return;
      }
      var d = Game.Downloads.getById(id);
      if (!d) {
        container.innerHTML = '<h2>Download</h2><div class="card-section small dim">This download is no longer available.</div>';
        return;
      }

      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      var sid = UI._sanitizeDomId(id) + "-" + UI._sanitizeDomId(container.id || "");
      var isChain = d.kind === "btc_chain_sync";
      var title = String(d.name || d.id || "Download");

      container.innerHTML =
        "<h2>" + title + "</h2>" +
        '<div class="card-section small dim">Download manager window (draggable/resizable).</div>' +
        '<div class="mt-8 card">' +
          '<div class="field-row"><span>Status</span><span class="mono" id="dlw-status-' + sid + '">-</span></div>' +
          '<div class="field-row"><span>Speed</span><span class="mono" id="dlw-speed-' + sid + '">-</span></div>' +
          '<div class="field-row"><span>Progress</span><span class="mono" id="dlw-progress-' + sid + '">-</span></div>' +
          '<div class="field-row"><span>Size</span><span class="mono" id="dlw-size-' + sid + '">-</span></div>' +
          '<div class="progress mt-4"><div id="dlw-bar-' + sid + '" class="progress-fill" style="width:0%"></div></div>' +
          (isChain
            ? ('<div class="field-row mt-4"><span>Current block</span><span class="mono" id="dlw-block-progress-' + sid + '">-</span></div>' +
               '<div class="progress mt-4"><div id="dlw-block-bar-' + sid + '" class="progress-fill" style="width:0%"></div></div>')
            : '') +
          '<div class="field-row mt-4"><span>Disk free</span><span class="mono" id="dlw-disk-' + sid + '">' + UI.formatSizeProgressMb(free, cap) + "</span></div>" +
          '<div class="mt-8">' +
            '<button class="btn btn-small btn-outline" type="button" data-dlw-cancel="' + id + '">Cancel download</button> ' +
            '<button class="btn btn-small btn-outline" type="button" data-dlw-open-task="1">Open Task Manager</button>' +
          "</div>" +
        "</div>";

      if (!container._dlwBound) {
        container._dlwBound = true;
        container.addEventListener("click", function (e) {
          var cancelBtn = e.target.closest("[data-dlw-cancel]");
          if (cancelBtn) {
            var did = cancelBtn.getAttribute("data-dlw-cancel");
            if (did && Game && Game.Downloads && Game.Downloads.cancel) {
              Game.Downloads.cancel(did);
            }
            if (Game && Game.PC && Game.state && Game.state.pc) {
              var winId = null;
              var m = String(container.id || "").match(/pc-win-content-(\\d+)/);
              if (m && m[1]) winId = parseInt(m[1], 10);
              if (isFinite(winId)) Game.PC.closeWindow(winId);
            }
            if (UI && UI.renderPC) UI.renderPC();
            return;
          }
          var openTask = e.target.closest("[data-dlw-open-task]");
          if (openTask && Game && Game.PC) {
            Game.PC.openApp("monitor");
            if (UI && UI.renderPC) UI.renderPC();
          }
        });
      }

      // Initial fill and then rely on UI.updateDownloadsDynamic.
      if (UI && UI.updateDownloadsDynamic) UI.updateDownloadsDynamic();
    },
    renderPCDesktopIcons: function () {
      var el = document.getElementById("pc-desktop-icons");
      if (!el) return;
      if (Game && Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var allDefs = UI.getPCAppDefs();
      var pc = Game && Game.state ? Game.state.pc : null;
      var desktopApps = (pc && pc.desktop && Array.isArray(pc.desktop.desktopApps)) ? pc.desktop.desktopApps.slice() : [];
      var desktopFiles = (pc && pc.desktop && Array.isArray(pc.desktop.desktopFiles)) ? pc.desktop.desktopFiles.slice() : [];
      var defs = [];
      for (var di = 0; di < desktopApps.length; di++) {
        var d0 = UI.getPCAppDef(desktopApps[di]);
        if (d0) defs.push(d0);
      }
      var html = [];
      for (var i = 0; i < defs.length; i++) {
        var d = defs[i];
        if (!d) continue;
        var installed = (Game && Game.PC && Game.PC.isAppInstalled) ? Game.PC.isAppInstalled(d.id) : true;
        var installDef = (Game && Game.PC && Game.PC.getAppInstallDef) ? Game.PC.getAppInstallDef(d.id) : null;
        var dl = (installDef && Game && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(installDef.downloadId) : null;
        var downloading = !!(dl && dl.status === "downloading");
        var sub = installed ? "" : (d.sub || "");
        if (!installed) {
          if (downloading) {
            var denom = Math.max(0.000001, dl.totalMb || 1);
            var pct = Math.floor(((dl.downloadedMb || 0) / denom) * 100);
            if (pct < 0) pct = 0;
            if (pct > 100) pct = 100;
            sub = "Downloading (" + pct + "%)";
          } else if (installDef) {
            sub = "Download (" + Math.round(installDef.sizeMb || 0) + " MB)";
          } else {
            sub = "Not installed";
          }
        }

        var pos = (Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) ? (Game.state.pc.desktop.icons[d.id] || null) : null;
        if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") {
          var col = i % 2;
          var row = Math.floor(i / 2);
          pos = { x: 10 + col * 134, y: 10 + row * 92 };
          if (Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) {
            Game.state.pc.desktop.icons[d.id] = pos;
          }
        }
        html.push(
          '<button type="button" class="pc-desktop-icon' + (!installed ? " is-disabled" : "") + '" data-open-app="' + d.id + '" style="left:' + Math.round(pos.x || 0) + "px;top:" + Math.round(pos.y || 0) + 'px;">' +
            '<div class="pc-icon-emoji">' + (d.emoji || "🗔") + "</div>" +
            '<div class="pc-icon-label">' + (d.title || d.id) + "</div>" +
            '<div class="pc-icon-sub">' + sub + "</div>" +
          "</button>"
        );
      }

      // Desktop files (.text, etc).
      if (Game && Game.PCFiles && Game.PCFiles.ensureState) Game.PCFiles.ensureState();
      for (var fi = 0; fi < desktopFiles.length; fi++) {
        var fileId = desktopFiles[fi];
        var f = (Game && Game.PCFiles && Game.PCFiles.getById) ? Game.PCFiles.getById(fileId) : null;
        if (!f) continue;
        var key = "file:" + f.id;
        var pos2 = (Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) ? (Game.state.pc.desktop.icons[key] || null) : null;
        if (!pos2 || typeof pos2.x !== "number" || typeof pos2.y !== "number") {
          var col2 = 2;
          var row2 = fi;
          pos2 = { x: 10 + col2 * 134, y: 10 + row2 * 92 };
          if (Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) {
            Game.state.pc.desktop.icons[key] = pos2;
          }
        }
        html.push(
          '<button type="button" class="pc-desktop-icon pc-desktop-file" data-open-file="' + f.id + '" style="left:' + Math.round(pos2.x || 0) + "px;top:" + Math.round(pos2.y || 0) + 'px;">' +
            '<div class="pc-icon-emoji">??</div>' +
            '<div class="pc-icon-label">' + String(f.name || ("File " + f.id)).replace(/\\"/g, "&quot;") + "</div>" +
          "</button>"
        );
      }
      el.innerHTML = html.join("");
    },
    renderPCDesktopWidgets: function () {
      var el = document.getElementById("pc-desktop-widgets");
      if (!el) return;
      if (Game && Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      el.innerHTML =
        '<div class="pc-widget-stack">' +
          '<div class="pc-widget">' +
            '<div class="pc-widget-title mono" id="pc-widget-clock">00:00</div>' +
            '<div class="pc-widget-sub small dim" id="pc-widget-date">01 / 01 / 2003</div>' +
          '</div>' +
          '<div class="pc-widget">' +
            '<div class="pc-widget-title">Storage</div>' +
            '<div class="pc-widget-sub small dim" id="pc-widget-storage"><span class="mono">0 / 0 MB</span> • <span class="mono">0%</span></div>' +
            '<div class="progress mt-6"><div class="progress-fill" id="pc-widget-storage-fill" style="width:0%"></div></div>' +
          '</div>' +
        "</div>";
      if (UI.updatePCDesktopWidgetsDynamic) UI.updatePCDesktopWidgetsDynamic();
    },
    updatePCDesktopWidgetsDynamic: function () {
      if (!Game || !Game.state) return;
      if (!Game.state.pc || !Game.state.pc.isOpen) return;

      function pad2(n) {
        var x = Math.floor(n || 0);
        if (!isFinite(x) || x < 0) x = 0;
        return (x < 10 ? "0" : "") + x;
      }
      function formatDDMMYYYY() {
        // Keep consistent with Game.getMonthYearString() but use DD / MM / YYYY.
        var startYear = 2003;
        var startMonthIndex = 0; // 0=Jan
        var daysPerMonth = 30;
        var monthsPerYear = 12;
        var day = (Game.state && typeof Game.state.day === "number") ? Game.state.day : 1;
        if (!isFinite(day) || day < 1) day = 1;
        var daysSinceStart = Math.max(0, Math.floor(day - 1));
        var totalMonths = Math.floor(daysSinceStart / daysPerMonth);
        var yearOffset = Math.floor((startMonthIndex + totalMonths) / monthsPerYear);
        var monthIndex = (startMonthIndex + totalMonths) % monthsPerYear;
        var yearNumber = startYear + yearOffset;
        var dayOfMonth = (daysSinceStart % daysPerMonth) + 1;
        return pad2(dayOfMonth) + " / " + pad2(monthIndex + 1) + " / " + yearNumber;
      }

      var clockEl = document.getElementById("pc-widget-clock");
      if (clockEl && Game.getClockString) clockEl.textContent = Game.getClockString();

      var dateEl = document.getElementById("pc-widget-date");
      if (dateEl) dateEl.textContent = formatDDMMYYYY();

      var pc = Game.state.pc;
      var used = pc && typeof pc.storageUsedMb === "number" ? pc.storageUsedMb : 0;
      var cap = pc && typeof pc.storageCapacityMb === "number" ? pc.storageCapacityMb : 0;
      if (!isFinite(used) || used < 0) used = 0;
      if (!isFinite(cap) || cap < 0) cap = 0;
      var pct = cap > 0 ? Math.round((used / cap) * 100) : 0;
      if (!isFinite(pct) || pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      var storEl = document.getElementById("pc-widget-storage");
      if (storEl) {
        storEl.innerHTML = '<span class="mono">' + Math.round(used) + " / " + Math.round(cap) + ' MB</span> • <span class="mono">' + pct + "%</span>";
      }
      var fillEl = document.getElementById("pc-widget-storage-fill");
      if (fillEl) fillEl.style.width = pct + "%";
    },
    renderPCStartMenu: function () {
      var el = document.getElementById("pc-start-menu");
      if (!el) return;
      if (Game && Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var pc = Game && Game.state ? Game.state.pc : null;
      var isOpen = !!(pc && pc.uiStartMenuOpen);
      el.classList.toggle("hidden", !isOpen);
      if (!isOpen) return;

      var defs = UI.getPCAppDefs();
      function isSystemApp(id) {
        return id === "monitor" || id === "tools" || id === "desktop";
      }
      function row(d) {
        var installed = (Game && Game.PC && Game.PC.isAppInstalled) ? Game.PC.isAppInstalled(d.id) : true;
        var onDesktop = (Game && Game.PC && Game.PC.isOnDesktop) ? Game.PC.isOnDesktop(d.id) : false;
        var pinned = (Game && Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(d.id) : false;
        var status = "";
        return (
          '<div class="pc-start-item" data-start-app="' + d.id + '">' +
            '<div class="pc-start-item-left">' +
              '<div class="pc-start-item-name">' + (d.emoji ? (d.emoji + " ") : "") + (d.title || d.id) + "</div>" +
              '<div class="pc-start-item-sub">' + status + "</div>" +
            "</div>" +
            '<div class="pc-start-actions">' +
              '<button class="pc-start-mini" type="button" data-start-open="' + d.id + '">Open</button>' +
              '<button class="pc-start-mini' + (onDesktop ? " is-on" : "") + '" type="button" data-start-desktop-toggle="' + d.id + '" title="Desktop">' + (onDesktop ? "Desktop ✓" : "Desktop") + "</button>" +
              '<button class="pc-start-mini' + (pinned ? " is-on" : "") + '" type="button" data-start-pin-toggle="' + d.id + '" title="Pin">' + (pinned ? "Pin ✓" : "Pin") + "</button>" +
            "</div>" +
          "</div>"
        );
      }

      var sys = [];
      var apps = [];
      for (var i = 0; i < defs.length; i++) {
        var d = defs[i];
        if (!d) continue;
        if (isSystemApp(d.id)) sys.push(d);
        else {
          var installed = (Game && Game.PC && Game.PC.isAppInstalled) ? Game.PC.isAppInstalled(d.id) : true;
          if (installed) apps.push(d);
        }
      }

      el.innerHTML =
        '<div class="pc-start-header">' +
          '<div class="pc-start-title">Start</div>' +
          '<div class="pc-start-search"><input id="pc-start-search" placeholder="Search apps (coming soon)" disabled></div>' +
        "</div>" +
        '<div class="pc-start-body">' +
          '<div class="pc-start-section-label">System</div>' +
          sys.map(row).join("") +
          '<div class="pc-start-section-label">Apps</div>' +
          apps.map(row).join("") +
        "</div>";
    },
    renderPCTaskbar: function () {
      var el = document.getElementById("pc-taskbar-windows");
      if (!el) return;
      if (Game && Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var pc = Game && Game.state && Game.state.pc ? Game.state.pc : null;
      var list = pc && Array.isArray(pc.windows) ? pc.windows.slice() : [];
      list.sort(function (a, b) { return (a && a.z ? a.z : 0) - (b && b.z ? b.z : 0); });
      var html = [];

      function appEmoji(appId) {
        var d = UI.getPCAppDef ? UI.getPCAppDef(appId) : null;
        return d && d.emoji ? d.emoji : "•";
      }
      function appTitle(appId) {
        var d = UI.getPCAppDef ? UI.getPCAppDef(appId) : null;
        return (d && (d.title || d.id)) ? (d.title || d.id) : ((Game && Game.PC && Game.PC.getAppTitle) ? Game.PC.getAppTitle(appId) : appId);
      }
      function isAppOpen(appId) {
        if (!Game || !Game.PC || !Game.PC.findWindowByApp) return false;
        return !!Game.PC.findWindowByApp(appId);
      }

      // Pinned apps: always visible in taskbar (icon-only when not open; icon+name when open).
      var pinnedSet = {};
      var pins = (pc && pc.desktop && Array.isArray(pc.desktop.pinnedApps)) ? pc.desktop.pinnedApps.slice() : [];
      for (var pi = 0; pi < pins.length; pi++) {
        var pid = String(pins[pi] || "");
        if (!pid) continue;
        if (Game && Game.PC && Game.PC.isAppInstalled && !Game.PC.isAppInstalled(pid)) continue;
        pinnedSet[pid] = true;
        var open = isAppOpen(pid);
        var title = appTitle(pid);
        var emoji = appEmoji(pid);
        html.push(
          '<button type="button" class="btn btn-small btn-outline pc-taskbar-pin-btn' + (open ? " is-open" : " is-closed") + '" data-pin-app="' + pid + '" title="' + String(title || pid).replace(/\\\"/g, "&quot;") + '">' +
            '<span class="pc-taskbar-app-icon" aria-hidden="true">' + emoji + "</span>" +
            (open ? ('<span class="pc-taskbar-app-label">' + (title || pid) + "</span>") : "") +
          "</button>"
        );
      }
      if (html.length) html.push('<span class="pc-taskbar-pin-sep"></span>');

      for (var i = 0; i < list.length; i++) {
        var w = list[i];
        if (!w) continue;
        if (pinnedSet[String(w.appId || "")]) continue;
        var isActive = (pc && pc.activeWindowId === w.id);
        var wTitle = String(w.title || w.appId || ("Window " + w.id));
        var wEmoji = appEmoji(w.appId);
        html.push(
          '<button type="button" class="btn btn-small btn-outline pc-taskbar-window-btn' + (isActive ? " active" : "") + '" data-win-id="' + w.id + '">' +
            '<span class="pc-taskbar-app-icon" aria-hidden="true">' + wEmoji + "</span>" +
            '<span class="pc-taskbar-app-label">' + wTitle + "</span>" +
          "</button>"
        );
      }
      el.innerHTML = html.join("");

      var tray = document.getElementById("pc-taskbar-tray");
      if (tray && Game && Game.state && Game.state.pc) {
        var activeDownloads = 0;
        if (Array.isArray(Game.state.pc.downloads)) {
          for (var di = 0; di < Game.state.pc.downloads.length; di++) {
            var d = Game.state.pc.downloads[di];
            if (d && d.status === "downloading") activeDownloads += 1;
          }
        }
        tray.innerHTML =
          '<span class="mono">' + (activeDownloads > 0 ? (activeDownloads + " downloads") : "No downloads") + "</span>";
      }
    },
    renderPCWindows: function () {
      var el = document.getElementById("pc-windows");
      if (!el) return;
      if (!Game || !Game.state || !Game.state.pc || !Array.isArray(Game.state.pc.windows)) return;
      var pc = Game.state.pc;
      var windows = pc.windows.slice();
      windows.sort(function (a, b) { return (a && a.z ? a.z : 0) - (b && b.z ? b.z : 0); });

      var html = [];
      for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        if (!w) continue;
        var isActive = pc.activeWindowId === w.id;
        var isDownload = String(w.appId || "").indexOf("download:") === 0;
        var isMax = !isDownload && !!w.maximized;
        var maxLabel = isMax ? "Restore" : "Maximize";
        var maxGlyph = isMax ? "❐" : "□";
        var contentId = "pc-win-content-" + w.id;
        html.push(
          '<div class="pc-window-frame' + (isActive ? " is-active" : "") + (w.minimized ? " is-minimized" : "") + (isMax ? " is-maximized" : "") + '" data-win-id="' + w.id + '"' +
            ' style="left:' + Math.round(w.x || 0) + "px;top:" + Math.round(w.y || 0) + "px;width:" + Math.round(w.w || 520) + "px;height:" + Math.round(w.h || 420) + "px;z-index:" + Math.round(w.z || 1) + ';">' +
            '<div class="pc-window-titlebar" data-win-id="' + w.id + '">' +
              '<div class="pc-window-titlebar-left">' +
                '<div class="pc-window-appdot"></div>' +
                '<div class="pc-window-title">' + (w.title || w.appId || ("Window " + w.id)) + "</div>" +
              "</div>" +
              '<div class="pc-window-controls">' +
                '<button type="button" class="pc-win-btn" data-action="minimize" data-win-id="' + w.id + '" title="Minimize">—</button>' +
                (isDownload ? "" : ('<button type="button" class="pc-win-btn" data-action="maximize" data-win-id="' + w.id + '" title="' + maxLabel + '">' + maxGlyph + "</button>")) +
                '<button type="button" class="pc-win-btn pc-win-close" data-action="close" data-win-id="' + w.id + '" title="Close">×</button>' +
              "</div>" +
            "</div>" +
            '<div class="pc-window-content pc-window" id="' + contentId + '"></div>' +
            ((isMax || isDownload) ? "" : ('<div class="pc-window-resize" data-win-id="' + w.id + '"></div>')) +
          "</div>"
        );
      }
      el.innerHTML = html.join("");

      for (var j = 0; j < windows.length; j++) {
        var ww = windows[j];
        if (!ww || ww.minimized) continue;
        var c = document.getElementById("pc-win-content-" + ww.id);
        if (!c) continue;
        UI.renderPCAppInto(ww.appId, c);
      }
    },
    renderPCDesktop: function (container) {
      if (!container) return;
      if (Game.PCStorage && Game.PCStorage.ensure) Game.PCStorage.ensure();
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      if (Game.Btc && Game.Btc.ensureWalletState) Game.Btc.ensureWalletState();
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
  
      var html = [];
      html.push('<h2>Desktop</h2>');
      html.push('<div class="section-subtitle small dim">PC overview, earnings per day, cloud earnings, and sales.</div>');
  
      html.push('<div class="grid">');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">PC specs</div>');
      html.push('<div class="card-section small dim">Hardware, thermals and background apps.</div>');
      html.push('<div class="field-row"><span>Motherboard</span><span id="pcdash-mb">-</span></div>');
      html.push('<div class="field-row"><span>Slots</span><span class="mono" id="pcdash-mb-slots">-</span></div>');
      html.push('<div class="field-row"><span>CPU</span><span id="pcdash-cpu">-</span></div>');
      html.push('<div class="field-row"><span>GPU</span><span id="pcdash-gpu">-</span></div>');
      html.push('<div class="field-row"><span>RAM</span><span class="mono" id="pcdash-ram">-</span></div>');
      html.push('<div class="field-row"><span>Storage</span><span class="mono" id="pcdash-storage">-</span></div>');
      html.push('<div class="field-row mt-4"><span>Case</span><span class="mono" id="pcdash-case">-</span></div>');
      html.push('<div class="field-row"><span>Fans</span><span class="mono" id="pcdash-fans">-</span></div>');
      html.push('<div class="field-row"><span>PSU</span><span class="mono" id="pcdash-psu">-</span></div>');
      html.push('<div class="field-row"><span>Miner software</span><span class="mono" id="pcdash-sw">-</span></div>');
      html.push('<div class="field-row"><span>PC Miner</span><span id="pcdash-miner-status">-</span></div>');
      html.push('<div class="field-row"><span>Hashrate</span><span class="mono" id="pcdash-miner-hash">-</span></div>');
      html.push('<div class="field-row"><span>Power</span><span class="mono" id="pcdash-miner-watts">-</span></div>');
      html.push('<div class="field-row"><span>Heat</span><span class="mono" id="pcdash-miner-heat">-</span></div>');
      html.push('<div class="field-row mt-4"><span>Router / NIC</span><span class="mono" id="pcdash-net-hw">-</span></div>');
      html.push('<div class="field-row mt-4"><span>AntiVirus</span><span id="pcdash-av-status">-</span></div>');
      html.push('<div class="field-row"><span>Processes</span><span class="mono" id="pcdash-proc-count">-</span></div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Storage & internet</div>');
      html.push('<div class="card-section small dim">Disk space affects downloads and blockchain sync.</div>');
      html.push('<div class="field-row"><span>Disk used</span><span class="mono" id="pcdash-disk-used">-</span></div>');
      html.push('<div class="field-row"><span>Disk free</span><span class="mono" id="pcdash-disk-free">-</span></div>');
      html.push('<div class="field-row"><span>Max storage</span><span class="mono" id="pcdash-disk-max">-</span></div>');
      html.push('<div class="progress mt-4"><div id="pcdash-disk-bar" class="progress-fill" style="width:0%"></div></div>');
      html.push('<div class="field-row mt-8"><span>Plan</span><span class="mono" id="pcdash-net-plan">-</span></div>');
      html.push('<div class="field-row"><span>Effective</span><span class="mono" id="pcdash-net-effective">-</span></div>');
      html.push('<div class="field-row"><span>Current</span><span class="mono" id="pcdash-net-current">-</span></div>');
      html.push('<div class="field-row mt-4"><span>Active downloads</span><span class="mono" id="pcdash-downloads-active">-</span></div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Wallet</div>');
      html.push('<div class="card-section small dim">Client install and block sync status.</div>');
      html.push('<div class="field-row"><span>Client</span><span id="pcdash-wallet-client">-</span></div>');
      html.push('<div class="field-row"><span>Sync</span><span id="pcdash-wallet-sync">-</span></div>');
      html.push('<div class="field-row"><span>Blocks</span><span class="mono" id="pcdash-wallet-blocks">-</span></div>');
      html.push('<div class="field-row"><span>Current block</span><span class="mono" id="pcdash-wallet-blockpct">-</span></div>');
      html.push('<div class="progress mt-4"><div id="pcdash-wallet-blockbar" class="progress-fill" style="width:0%"></div></div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Earnings per day</div>');
      html.push('<div class="card-section small dim">Estimated totals across jobs, property, businesses and mining.</div>');
      html.push('<div class="field-row"><span>Income</span><span class="mono" id="pcdash-earn-income">-</span></div>');
      html.push('<div class="field-row"><span>Expenses</span><span class="mono" id="pcdash-earn-expense">-</span></div>');
      html.push('<div class="field-row"><span>Net</span><span class="mono" id="pcdash-earn-net">-</span></div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">BTC earnings</div>');
      html.push('<div class="card-section small dim">Estimated BTC/day at current spot price.</div>');
      html.push('<div class="field-row"><span>Spot</span><span class="mono" id="pcdash-btc-spot">-</span></div>');
      html.push('<div class="field-row mt-4"><span>PC mining</span><span class="mono" id="pcdash-btc-pc">-</span></div>');
      html.push('<div class="field-row"><span>Rigs</span><span class="mono" id="pcdash-btc-rigs">-</span></div>');
      html.push('<div class="field-row"><span>Cloud</span><span class="mono" id="pcdash-btc-cloud">-</span></div>');
      html.push('<div class="field-row mt-4"><span>Total</span><span class="mono" id="pcdash-btc-total">-</span></div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Sales</div>');
      html.push('<div class="card-section small dim">Retail shop performance.</div>');
      html.push('<div class="field-row"><span>Today</span><span class="mono" id="pcdash-retail-today">-</span></div>');
      html.push('<div class="field-row"><span>Yesterday</span><span class="mono" id="pcdash-retail-yday">-</span></div>');
      html.push('<div class="field-row mt-4"><span>Popularity</span><span class="mono" id="pcdash-retail-pop">-</span></div>');
      html.push('<div class="field-row"><span>Stock</span><span class="mono" id="pcdash-retail-stock">-</span></div>');
      html.push('<div class="field-row"><span>Funds</span><span class="mono" id="pcdash-retail-funds">-</span></div>');
      html.push('</div>');
  
      html.push('</div>');
  
      container.innerHTML = html.join("");
      UI.updatePCDesktopDynamic();
    },
    updatePCDesktopDynamic: function () {
      if (!Game || !Game.state) return;
      if (!Game.state.pc || !Game.state.pc.isOpen) return;
      if (!(UI.pcHasVisibleApp && UI.pcHasVisibleApp("desktop"))) return;
  
      var s = Game.state;
  
      // PC miner + AV status
      var miner = (s.btc && s.btc.pcMiner) ? s.btc.pcMiner : null;
      var minerStats = (miner && Game.Btc && Game.Btc.getPcMinerStats) ? Game.Btc.getPcMinerStats() : null;
      var minerOn = miner && miner.isOn;
  
      var el = document.getElementById("pcdash-miner-status");
      if (el) el.textContent = minerOn ? "ON" : "OFF";
      el = document.getElementById("pcdash-miner-hash");
      if (el) el.textContent = minerStats ? (minerStats.hashrate.toFixed(2) + " H/s") : "-";
      el = document.getElementById("pcdash-miner-watts");
      if (el) el.textContent = minerStats ? (Math.round(minerStats.watts) + " W") : "-";
      el = document.getElementById("pcdash-miner-heat");
      if (el) el.textContent = minerStats ? ((minerStats.heat || 0).toFixed(0) + " / " + (minerStats.maxHeat || 0).toFixed(0)) : "-";
      var cpuL = miner ? (miner.cpuLevel || 0) : 0;
      var gpuL = miner ? (miner.gpuLevel || 0) : 0;
      var swL = (s.btc && typeof s.btc.minerSoftwareLevel === "number") ? s.btc.minerSoftwareLevel : (miner ? (miner.softwareLevel || 0) : 0);
      var caseL = miner ? (miner.caseLevel || 0) : 0;
      var fanL = miner ? (miner.fansLevel || 0) : 0;
      var psuL = miner ? (miner.psuLevel || 0) : 0;
  
      el = document.getElementById("pcdash-cpu");
      if (el) {
        var cpuName = (Game.Shop && Game.Shop.getMinerDeviceNameForLevel) ? Game.Shop.getMinerDeviceNameForLevel("CPU", cpuL) : ("CPU L" + cpuL);
        el.textContent = cpuName + " (L" + cpuL + ")";
      }
      el = document.getElementById("pcdash-gpu");
      if (el) {
        var gpuName = (Game.Shop && Game.Shop.getMinerDeviceNameForLevel) ? Game.Shop.getMinerDeviceNameForLevel("GPU", gpuL) : ("GPU L" + gpuL);
        el.textContent = gpuName + " (L" + gpuL + ")";
      }
      el = document.getElementById("pcdash-case");
      if (el) el.textContent = "L" + caseL;
      el = document.getElementById("pcdash-fans");
      if (el) el.textContent = "L" + fanL;
      el = document.getElementById("pcdash-psu");
      if (el) el.textContent = "L" + psuL;
      el = document.getElementById("pcdash-sw");
      if (el) el.textContent = "L" + swL;
  
      el = document.getElementById("pcdash-net-hw");
      if (el && s.net) {
        el.textContent = "Router L" + (s.net.routerLevel || 0) + " / NIC L" + (s.net.nicLevel || 0);
      } else if (el) {
        el.textContent = "-";
      }
  
      var av = (s.pc && s.pc.antivirus) ? s.pc.antivirus : null;
      el = document.getElementById("pcdash-av-status");
      if (el) {
        if (!av) {
          el.textContent = "-";
        } else {
          var avLevel = (typeof av.level === "number" && isFinite(av.level)) ? av.level : 1;
          if (!av.isOn) el.textContent = "Disabled (L" + avLevel + ")";
          else if (av.pendingUpdate) el.textContent = "Updating (L" + avLevel + ")";
          else if (av.isScanning) el.textContent = "Scanning (L" + avLevel + ")";
          else el.textContent = "Idle (L" + avLevel + ")";
        }
      }
      el = document.getElementById("pcdash-proc-count");
      if (el) {
        var procCount = 0;
        if (minerOn) procCount += 1;
        if (av && av.isOn) procCount += 1;
        el.textContent = String(procCount);
      }
  
      // Storage
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var used = Game.PCStorage ? Game.PCStorage.getUsedMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      el = document.getElementById("pcdash-disk-used");
      if (el) el.textContent = UI.formatSizeProgressMb(used, cap);
      el = document.getElementById("pcdash-disk-free");
      if (el) el.textContent = UI.formatSizeFromMb(free);
      el = document.getElementById("pcdash-disk-max");
      if (el) {
        var maxCap = (Game.PC && Game.PC.getMaxStorageMb) ? Game.PC.getMaxStorageMb() : 0;
        el.textContent = maxCap > 0 ? UI.formatSizeFromMb(maxCap) : "-";
      }
      el = document.getElementById("pcdash-disk-bar");
      if (el) {
        var pctUsed = cap > 0 ? Math.floor((Math.min(cap, Math.max(0, used)) / cap) * 100) : 0;
        if (pctUsed < 0) pctUsed = 0;
        if (pctUsed > 100) pctUsed = 100;
        el.style.width = pctUsed + "%";
      }
  
      // Network + downloads
      var net = s.net || {};
      var planKbps = (Game.Net && Game.Net.getPlanKbps) ? Game.Net.getPlanKbps() : (net.planKbps || 0);
      var effMbps = (Game.Net && Game.Net.getEffectiveMbps) ? Game.Net.getEffectiveMbps() : 0;
      var curMbps = typeof net.currentMbps === "number" ? net.currentMbps : 0;
      el = document.getElementById("pcdash-net-plan");
      if (el) el.textContent = Math.round(planKbps) + " Kbps";
      el = document.getElementById("pcdash-net-effective");
      if (el) el.textContent = Math.round(effMbps * 1000) + " Kbps";
      el = document.getElementById("pcdash-net-current");
      if (el) el.textContent = Math.round(curMbps * 1000) + " Kbps";
      el = document.getElementById("pcdash-downloads-active");
      if (el) {
        var active = (Game.Downloads && Game.Downloads.getActive) ? Game.Downloads.getActive().length : 0;
        el.textContent = String(active);
      }
  
      // Wallet status
      var w = s.btc && s.btc.wallet ? s.btc.wallet : null;
      el = document.getElementById("pcdash-wallet-client");
      if (el) {
        var clientDl = (Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById("btc-wallet-client") : null;
        if (w && w.isInstalled) el.textContent = "Installed";
        else if (clientDl && clientDl.status === "downloading") {
          var denom = Math.max(0.000001, clientDl.totalMb || 1);
          var pct = Math.floor(((clientDl.downloadedMb || 0) / denom) * 1000) / 10;
          el.textContent = "Downloading (" + pct.toFixed(1) + "%)";
        } else {
          el.textContent = "Not installed";
        }
      }
      el = document.getElementById("pcdash-wallet-sync");
      if (el) {
        if (!w || !w.isInstalled) el.textContent = "Unavailable";
        else el.textContent = w.isSyncing ? "Syncing" : "Synced";
      }
      el = document.getElementById("pcdash-wallet-blocks");
      if (el) {
        if (!w || !w.isInstalled) {
          el.textContent = "-";
        } else {
          var networkHeight = (Game.Btc && Game.Btc.getNetworkHeight) ? Game.Btc.getNetworkHeight() : (w.targetHeight || 0);
          var dl = (w.syncDownloadId && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(w.syncDownloadId) : null;
          if (dl && dl.kind === "btc_chain_sync") {
            el.textContent = (dl.syncedBlocks || 0) + " / " + Math.max(1, dl.totalBlocks || 1) + " blocks";
          } else {
            el.textContent = (w.chainHeight || 0) + " / " + Math.max(1, (w.targetHeight || networkHeight || 1)) + " blocks";
          }
        }
      }
      var blockPct = 0;
      if (w && w.isInstalled) {
        var dl2 = (w.syncDownloadId && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(w.syncDownloadId) : null;
        if (dl2 && dl2.kind === "btc_chain_sync") {
          var curSize = (typeof dl2.currentBlockSizeMb === "number" && dl2.currentBlockSizeMb > 0) ? dl2.currentBlockSizeMb : null;
          if (curSize) {
            blockPct = Math.floor((Math.min(curSize, Math.max(0, dl2.bufferMb || 0)) / curSize) * 10000) / 100;
          }
        } else {
          blockPct = w.isSyncing ? 0 : 100;
        }
      }
      el = document.getElementById("pcdash-wallet-blockpct");
      if (el) el.textContent = w && w.isInstalled ? (blockPct + "%") : "-";
      el = document.getElementById("pcdash-wallet-blockbar");
      if (el) el.style.width = Math.max(0, Math.min(100, blockPct)) + "%";
  
      // Earnings per day
      var forecast = UI.computeMoneyForecast ? UI.computeMoneyForecast() : { income: 0, expense: 0 };
      el = document.getElementById("pcdash-earn-income");
      if (el) el.textContent = "$" + (forecast.income || 0).toFixed(2);
      el = document.getElementById("pcdash-earn-expense");
      if (el) el.textContent = "$" + (forecast.expense || 0).toFixed(2);
      el = document.getElementById("pcdash-earn-net");
      if (el) el.textContent = "$" + ((forecast.income || 0) - (forecast.expense || 0)).toFixed(2);
  
      // BTC earnings breakdown
      var priceUsd = 0;
      if (Game.Btc && Game.Btc.getExchange) {
        var ex = Game.Btc.getExchange();
        priceUsd = ex && ex.priceUsd ? ex.priceUsd : 0;
      }
      el = document.getElementById("pcdash-btc-spot");
      if (el) el.textContent = priceUsd > 0 ? ("$" + priceUsd.toFixed(0) + " / BTC") : "-";
  
      var secondsPerGameDay = (24 * 60) / 5;
      var rigsBtcDay = 0;
      var pcBtcDay = 0;
      var cloudBtcDay = 0;
      var yieldMult = 1;
      if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
        yieldMult = Game.Prestige.getMiningYieldMultiplier();
      }
      var m = s.btc && s.btc.mining ? s.btc.mining : null;
      if (m && m.rigsOwned > 0 && m.isPowerOn) {
        rigsBtcDay = (m.rigsOwned * (m.rigHashrate || 0) * 0.00000000035) * secondsPerGameDay * yieldMult;
      }
      if (minerOn && minerStats) {
        pcBtcDay = (minerStats.hashrate * 0.00000000035) * secondsPerGameDay * yieldMult;
      }
      var cloud = s.btc && s.btc.cloud ? s.btc.cloud : null;
      if (cloud && Array.isArray(cloud.contracts)) {
        for (var ci = 0; ci < cloud.contracts.length; ci++) {
          var c = cloud.contracts[ci];
          if (c && c.isActive) cloudBtcDay += (c.dailyBtc || 0) * yieldMult;
        }
      }
      var totalBtcDay = rigsBtcDay + pcBtcDay + cloudBtcDay;
      function btcLine(btcPerDay) {
        var usd = priceUsd > 0 ? (" (~$" + (btcPerDay * priceUsd).toFixed(2) + ")") : "";
        return btcPerDay.toFixed(8) + " BTC/day" + usd;
      }
      el = document.getElementById("pcdash-btc-pc");
      if (el) el.textContent = btcLine(pcBtcDay);
      el = document.getElementById("pcdash-btc-rigs");
      if (el) el.textContent = btcLine(rigsBtcDay);
      el = document.getElementById("pcdash-btc-cloud");
      if (el) el.textContent = btcLine(cloudBtcDay);
      el = document.getElementById("pcdash-btc-total");
      if (el) el.textContent = btcLine(totalBtcDay);
  
      // Sales (retail)
      var retail = s.companies && s.companies.retailShop ? s.companies.retailShop : null;
      var rStats = retail && retail.stats ? retail.stats : { todayUnits: 0, todayRevenue: 0, yesterdayUnits: 0, yesterdayRevenue: 0 };
      el = document.getElementById("pcdash-retail-today");
      if (el) el.textContent = (rStats.todayUnits || 0) + " units / $" + (rStats.todayRevenue || 0).toFixed(0);
      el = document.getElementById("pcdash-retail-yday");
      if (el) el.textContent = (rStats.yesterdayUnits || 0) + " units / $" + (rStats.yesterdayRevenue || 0).toFixed(0);
      el = document.getElementById("pcdash-retail-pop");
      if (el) el.textContent = retail ? (retail.popularity || 0).toFixed(0) + "%" : "-";
      el = document.getElementById("pcdash-retail-stock");
      if (el) el.textContent = retail ? String(retail.stock || 0) : "-";
      el = document.getElementById("pcdash-retail-funds");
      if (el) el.textContent = retail ? ("$" + (retail.funds || 0).toFixed(0)) : "-";
  
      // Motherboard + RAM
      var mb = (Game.PC && Game.PC.getMotherboardDef) ? Game.PC.getMotherboardDef() : null;
      el = document.getElementById("pcdash-mb");
      if (el) el.textContent = mb ? mb.name : "-";
      el = document.getElementById("pcdash-mb-slots");
      if (el && mb) {
        el.textContent =
          "CPU x" + (mb.cpuSlots || 1) +
          " / GPU x" + (mb.gpuSlots || 1) +
          " / RAM x" + (mb.ramSlots || 2) +
          " / Storage x" + (mb.storageSlots || 1);
      } else if (el) {
        el.textContent = "-";
      }
      el = document.getElementById("pcdash-ram");
      if (el) {
        var ramMb = (Game.PC && Game.PC.getRamCapacityMb) ? Game.PC.getRamCapacityMb() : 0;
        var rLvl = (s.pc && typeof s.pc.ramLevel === "number") ? s.pc.ramLevel : 0;
        el.textContent = ramMb > 0 ? ("L" + rLvl + " (" + Math.round(ramMb) + " MB)") : "-";
      }
      el = document.getElementById("pcdash-storage");
      if (el) {
        var sLvl = (s.pc && typeof s.pc.storageLevel === "number") ? s.pc.storageLevel : 0;
        var capMb = (s.pc && typeof s.pc.storageCapacityMb === "number") ? s.pc.storageCapacityMb : 0;
        el.textContent = "L" + sLvl + " (" + Math.round(capMb) + " MB)";
      }
    },
    renderPCAntivirus: function (container) {
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var a = Game.state.pc && Game.state.pc.antivirus ? Game.state.pc.antivirus : { isOn: false, isScanning: false, scanProgress: 0, cpuPct: 0, ramMb: 0 };
      var dayNow = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 0;
      var vendor = String(a.vendor || "builtin");
      var brandTitle = "AntiVirus";
      if (vendor === "av_sentinel") brandTitle = "Sentinel AV";
      else if (vendor === "av_byteguard") brandTitle = "ByteGuard";
      else if (vendor === "av_northshield") brandTitle = "NorthShield";

      function hhmm(min) {
        var total = Math.floor(Math.max(0, min || 0) % (24 * 60));
        var h = Math.floor(total / 60);
        var m = total % 60;
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
      }
      function fmtDayTime(day, minute) {
        var d = (typeof day === "number" && isFinite(day) && day > 0) ? Math.floor(day) : 0;
        if (!d) return "Never";
        return "Day " + d + " " + hhmm(minute || 0);
      }
      function toggleHtml(id, checked, disabled) {
        return '<label class="pc-av-toggle">' +
          '<input type="checkbox" id="' + id + '"' + (checked ? " checked" : "") + (disabled ? " disabled" : "") + ">" +
          '<span class="pc-av-slider"></span>' +
        "</label>";
      }
      function tagHtml(text, kind) {
        var cls = "tag";
        if (kind) cls += " " + kind;
        return '<span class="' + cls + '">' + String(text || "") + "</span>";
      }
      function renderQuarantineRows(list) {
        var q = Array.isArray(list) ? list : [];
        if (q.length === 0) return '<tr><td class="dim" colspan="6">No items in quarantine.</td></tr>';
        var rows = [];
        for (var i = 0; i < Math.min(12, q.length); i++) {
          var it = q[i] || {};
          var sev = String(it.severity || "Low");
          var sevCls = sev === "High" ? "tag-danger" : (sev === "Medium" ? "tag-warn" : "tag-ok");
          rows.push(
            "<tr>" +
            "<td>" + tagHtml(sev, sevCls) + "</td>" +
            '<td class="mono">' + String(it.threat || "-") + "</td>" +
            '<td class="mono">' + String(it.type || "-") + "</td>" +
            '<td class="mono">' + fmtDayTime(it.day || 0, it.minute || 0) + "</td>" +
            '<td class="mono">' + String(it.source || "-") + "</td>" +
            "<td>" +
              '<button class="btn btn-small btn-outline" data-qaction="restore" data-qid="' + String(it.id || "") + '">Restore</button> ' +
              '<button class="btn btn-small btn-outline" data-qaction="remove" data-qid="' + String(it.id || "") + '">Remove</button>' +
            "</td>" +
            "</tr>"
          );
        }
        return rows.join("");
      }
      function renderHistoryRows(list) {
        var h = Array.isArray(list) ? list : [];
        if (h.length === 0) return '<div class="dim">No recent activity.</div>';
        var out = [];
        for (var i = 0; i < Math.min(10, h.length); i++) {
          var e = h[i] || {};
          out.push(
            '<div class="pc-av-history-item">' +
              '<div class="pc-av-history-title">' + String(e.title || "Event") + "</div>" +
              '<div class="pc-av-history-meta mono">' + fmtDayTime(e.day || 0, e.minute || 0) + (e.detail ? (" - " + String(e.detail)) : "") + "</div>" +
            "</div>"
          );
        }
        return out.join("");
      }

      var outdated = (a.lastUpdateDay || 0) < dayNow;
      var pill = "Protected";
      var pillClass = "pc-av-pill-ok";
      if (!a.isOn) { pill = "Protection off"; pillClass = "pc-av-pill-danger"; }
      else if (a.pendingUpdate) { pill = "Updating"; pillClass = "pc-av-pill-warn"; }
      else if (a.isScanning) { pill = "Scanning"; pillClass = "pc-av-pill-warn"; }
      else if (outdated) { pill = "Action required"; pillClass = "pc-av-pill-warn"; }
      else if (Array.isArray(a.quarantine) && a.quarantine.length > 0) { pill = "Threats quarantined"; pillClass = "pc-av-pill-warn"; }

      var activityTitle = a.pendingUpdate ? "Updating definitions" : (a.isScanning ? "Scan in progress" : "No active tasks");
      var activitySub = a.pendingUpdate ? ("Downloading package... " + Math.floor(a.updateProgress || 0) + "%") :
        (a.isScanning ? ("Scanning files... " + Math.floor(a.scanProgress || 0) + "%") : "");
      var activityPct = a.pendingUpdate ? Math.floor(a.updateProgress || 0) : Math.floor(a.scanProgress || 0);
      if (activityPct < 0) activityPct = 0;
      if (activityPct > 100) activityPct = 100;

      container.innerHTML = [
        '<div class="pc-av">',
        '  <div class="pc-av-top">',
        '    <div class="pc-av-top-left">',
        '      <h2 class="pc-av-title">' + brandTitle + "</h2>",
        '      <div class="small dim">Threat protection, updates, and quarantine.</div>',
        "    </div>",
        '    <div class="pc-av-top-right">',
        '      <div class="pc-av-pill ' + pillClass + '" id="av-pill">' + pill + "</div>",
        '      <button class="btn btn-small btn-outline" id="btn-av-refresh">Refresh</button>',
        "    </div>",
        "  </div>",

        '  <div class="pc-av-grid">',
        '    <div class="pc-av-col">',
        '      <div class="pc-av-card">',
        '        <div class="pc-av-card-title">Protection</div>',
        '        <div class="field-row"><span>Status</span><span id="av-status-text">' + (a.isOn ? "On" : "Off") + "</span></div>",
        '        <div class="field-row"><span>Real-time protection</span><span>' + toggleHtml("av-rtp", !!a.realTimeProtection, !a.isOn) + "</span></div>",
        '        <div class="field-row"><span>Cloud protection</span><span>' + toggleHtml("av-cloud", !!a.cloudProtection, !a.isOn) + "</span></div>",
        '        <div class="field-row"><span>Firewall</span><span>' + toggleHtml("av-firewall", !!a.firewall, !a.isOn) + "</span></div>",
        '        <div class="mt-8">',
        '          <button class="btn btn-small ' + (a.isOn ? "btn-outline" : "btn-primary") + '" id="btn-av-power">' + (a.isOn ? "Turn off" : "Turn on") + "</button>",
        "        </div>",
        "      </div>",

        '      <div class="pc-av-card mt-12">',
        '        <div class="pc-av-card-title">Scan</div>',
        '        <div class="small dim">Choose a scan type and review results.</div>',
        '        <div class="mt-8 pc-av-actions">',
        '          <button class="btn btn-small btn-primary" id="btn-av-scan-quick"' + (a.isOn && !a.pendingUpdate && !a.isScanning ? "" : " disabled") + ">Quick scan</button>",
        '          <button class="btn btn-small btn-outline" id="btn-av-scan-full"' + (a.isOn && !a.pendingUpdate && !a.isScanning ? "" : " disabled") + ">Full scan</button>",
        '          <button class="btn btn-small btn-outline" id="btn-av-scan-custom"' + (a.isOn && !a.pendingUpdate && !a.isScanning ? "" : " disabled") + ">Custom scan</button>",
        '          <button class="btn btn-small btn-outline" id="btn-av-scan-stop"' + (a.isOn && a.isScanning ? "" : " disabled") + ">Stop</button>",
        "        </div>",
        '        <div class="mt-10">',
        '          <div class="field-row"><span>Last scan</span><span class="mono" id="av-last-scan">' + fmtDayTime(a.lastScanDay || 0, a.lastScanMinute || 0) + "</span></div>",
        '          <div class="field-row"><span>Last result</span><span class="mono" id="av-last-result">' + ((a.lastScanDay || 0) > 0 ? (Math.floor(a.lastScanThreats || 0) + " threats") : "-") + "</span></div>",
        '          <div class="field-row"><span>Scan type</span><span class="mono" id="av-scan-type">' + String(a.scanType || "quick") + "</span></div>",
        "        </div>",
        '        <div class="mt-8">',
        '          <div class="field-row"><span>Files scanned</span><span class="mono"><span id="av-files-scanned">' + Math.floor(a.filesScanned || 0) + '</span> / <span id="av-files-target">' + Math.floor(a.scanTargetFiles || 0) + "</span></span></div>",
        '          <div class="field-row"><span>Threats found</span><span class="mono" id="av-threats-found">' + Math.floor(a.threatsDetected || 0) + "</span></div>",
        "        </div>",
        "      </div>",
        "    </div>",

        '    <div class="pc-av-col">',
        '      <div class="pc-av-card">',
        '        <div class="pc-av-card-title">Updates</div>',
        '        <div class="field-row"><span>Definitions</span><span class="mono" id="av-defs-version">' + String(a.defsVersion || "0.0.0") + "</span></div>",
        '        <div class="field-row"><span>Last update</span><span class="mono" id="av-defs-updated">' + fmtDayTime(a.lastUpdateDay || 0, a.lastUpdateMinute || 0) + "</span></div>",
        '        <div class="field-row"><span>Engine</span><span class="mono" id="av-engine-version">' + String(a.engineVersion || "-") + "</span></div>",
        '        <div class="field-row"><span>Update status</span><span id="av-update-status">' + (outdated ? "Out of date" : "Up to date") + "</span></div>",
        '        <div class="mt-8">',
        '          <button class="btn btn-small btn-outline" id="btn-av-update"' + (a.isOn && !a.pendingUpdate && outdated ? "" : " disabled") + ">Check for updates</button>",
        "        </div>",
        "      </div>",

        '      <div class="pc-av-card mt-12">',
        '        <div class="pc-av-card-title">Activity</div>',
        '        <div id="av-activity-title">' + activityTitle + "</div>",
        '        <div class="small dim" id="av-activity-sub">' + activitySub + "</div>",
        '        <div class="progress mt-8"><div id="av-activity-bar" class="progress-fill progress-fill-status" style="width:' + (a.pendingUpdate || a.isScanning ? activityPct : 0) + '%"></div></div>',
        "      </div>",

        '      <div class="pc-av-card mt-12">',
        '        <div class="pc-av-card-title">Quarantine</div>',
        '        <div class="small dim">Quarantined items are isolated and can be restored or removed.</div>',
        '        <div class="mt-8 table-scroll">',
        '          <table class="table">',
        '            <thead><tr><th>Severity</th><th>Threat</th><th>Type</th><th>Detected</th><th>Source</th><th>Actions</th></tr></thead>',
        '            <tbody id="av-quarantine-body">' + renderQuarantineRows(a.quarantine) + "</tbody>",
        "          </table>",
        "        </div>",
        "      </div>",

        '      <div class="pc-av-card mt-12">',
        '        <div class="pc-av-card-title">History</div>',
        '        <div id="av-history">' + renderHistoryRows(a.history) + "</div>",
        "      </div>",
        "    </div>",
        "  </div>",
        "</div>"
      ].join("");

      var refreshBtn = container.querySelector("#btn-av-refresh");
      if (refreshBtn) refreshBtn.addEventListener("click", function () { UI.renderPCAntivirus(container); });

      var powerBtn = container.querySelector("#btn-av-power");
      if (powerBtn) powerBtn.addEventListener("click", function () {
        if (Game.PC && Game.PC.toggleAntivirus) Game.PC.toggleAntivirus();
        UI.renderPCAntivirus(container);
      });
      var updateBtn = container.querySelector("#btn-av-update");
      if (updateBtn) updateBtn.addEventListener("click", function () {
        if (Game.PC && Game.PC.startAntivirusUpdate) Game.PC.startAntivirusUpdate();
        UI.renderPCAntivirus(container);
      });

      function bindScan(id, scanType) {
        var b = container.querySelector(id);
        if (!b) return;
        b.addEventListener("click", function () {
          if (Game.PC && Game.PC.startAntivirusScan) Game.PC.startAntivirusScan({ scanType: scanType });
          UI.renderPCAntivirus(container);
        });
      }
      bindScan("#btn-av-scan-quick", "quick");
      bindScan("#btn-av-scan-full", "full");
      bindScan("#btn-av-scan-custom", "custom");

      var stopBtn = container.querySelector("#btn-av-scan-stop");
      if (stopBtn) stopBtn.addEventListener("click", function () {
        if (Game.PC && Game.PC.cancelAntivirusScan) Game.PC.cancelAntivirusScan();
        UI.renderPCAntivirus(container);
      });

      function bindOption(id, key) {
        var el = container.querySelector(id);
        if (!el) return;
        el.addEventListener("change", function () {
          if (Game.PC && Game.PC.setAntivirusOption) Game.PC.setAntivirusOption(key, !!el.checked);
          if (UI.updatePCAntivirusDynamic) UI.updatePCAntivirusDynamic();
        });
      }
      bindOption("#av-rtp", "realTimeProtection");
      bindOption("#av-cloud", "cloudProtection");
      bindOption("#av-firewall", "firewall");

      container.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-qaction]");
        if (!btn) return;
        var qid = btn.getAttribute("data-qid");
        var act = btn.getAttribute("data-qaction");
        if (!qid || !act) return;
        if (act === "remove" && Game.PC && Game.PC.removeQuarantineItem) Game.PC.removeQuarantineItem(qid);
        if (act === "restore" && Game.PC && Game.PC.restoreQuarantineItem) Game.PC.restoreQuarantineItem(qid);
        UI.renderPCAntivirus(container);
      });
    },
    updatePCAntivirusDynamic: function () {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      if (!(UI.pcHasVisibleApp && UI.pcHasVisibleApp("antivirus"))) return;
      var a = Game.state.pc && Game.state.pc.antivirus ? Game.state.pc.antivirus : null;
      if (!a) return;
      var dayNow = (Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 0;

      function hhmm(min) {
        var total = Math.floor(Math.max(0, min || 0) % (24 * 60));
        var h = Math.floor(total / 60);
        var m = total % 60;
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
      }
      function fmtDayTime(day, minute) {
        var d = (typeof day === "number" && isFinite(day) && day > 0) ? Math.floor(day) : 0;
        if (!d) return "Never";
        return "Day " + d + " " + hhmm(minute || 0);
      }
      function renderQuarantineRows(list) {
        var q = Array.isArray(list) ? list : [];
        if (q.length === 0) return '<tr><td class="dim" colspan="6">No items in quarantine.</td></tr>';
        var rows = [];
        function tag(text, cls) { return '<span class="tag ' + cls + '">' + String(text || "") + "</span>"; }
        for (var i = 0; i < Math.min(12, q.length); i++) {
          var it = q[i] || {};
          var sev = String(it.severity || "Low");
          var sevCls = sev === "High" ? "tag-danger" : (sev === "Medium" ? "tag-warn" : "tag-ok");
          rows.push(
            "<tr>" +
            "<td>" + tag(sev, sevCls) + "</td>" +
            '<td class="mono">' + String(it.threat || "-") + "</td>" +
            '<td class="mono">' + String(it.type || "-") + "</td>" +
            '<td class="mono">' + fmtDayTime(it.day || 0, it.minute || 0) + "</td>" +
            '<td class="mono">' + String(it.source || "-") + "</td>" +
            "<td>" +
              '<button class="btn btn-small btn-outline" data-qaction="restore" data-qid="' + String(it.id || "") + '">Restore</button> ' +
              '<button class="btn btn-small btn-outline" data-qaction="remove" data-qid="' + String(it.id || "") + '">Remove</button>' +
            "</td>" +
            "</tr>"
          );
        }
        return rows.join("");
      }
      function renderHistoryRows(list) {
        var h = Array.isArray(list) ? list : [];
        if (h.length === 0) return '<div class="dim">No recent activity.</div>';
        var out = [];
        for (var i = 0; i < Math.min(10, h.length); i++) {
          var e = h[i] || {};
          out.push(
            '<div class="pc-av-history-item">' +
              '<div class="pc-av-history-title">' + String(e.title || "Event") + "</div>" +
              '<div class="pc-av-history-meta mono">' + fmtDayTime(e.day || 0, e.minute || 0) + (e.detail ? (" - " + String(e.detail)) : "") + "</div>" +
            "</div>"
          );
        }
        return out.join("");
      }

      var outdated = (a.lastUpdateDay || 0) < dayNow;
      var pill = "Protected";
      var pillClass = "pc-av-pill-ok";
      if (!a.isOn) { pill = "Protection off"; pillClass = "pc-av-pill-danger"; }
      else if (a.pendingUpdate) { pill = "Updating"; pillClass = "pc-av-pill-warn"; }
      else if (a.isScanning) { pill = "Scanning"; pillClass = "pc-av-pill-warn"; }
      else if (outdated) { pill = "Action required"; pillClass = "pc-av-pill-warn"; }
      else if (Array.isArray(a.quarantine) && a.quarantine.length > 0) { pill = "Threats quarantined"; pillClass = "pc-av-pill-warn"; }

      var pillEl = document.getElementById("av-pill");
      if (pillEl) {
        pillEl.textContent = pill;
        pillEl.className = "pc-av-pill " + pillClass;
      }
      var statusEl = document.getElementById("av-status-text");
      if (statusEl) statusEl.textContent = a.isOn ? "On" : "Off";
      var scanTypeEl = document.getElementById("av-scan-type");
      if (scanTypeEl) scanTypeEl.textContent = String(a.scanType || "quick");

      var lastScanEl = document.getElementById("av-last-scan");
      if (lastScanEl) lastScanEl.textContent = fmtDayTime(a.lastScanDay || 0, a.lastScanMinute || 0);
      var lastResEl = document.getElementById("av-last-result");
      if (lastResEl) lastResEl.textContent = ((a.lastScanDay || 0) > 0 ? (Math.floor(a.lastScanThreats || 0) + " threats") : "-");

      var filesScannedEl = document.getElementById("av-files-scanned");
      if (filesScannedEl) filesScannedEl.textContent = String(Math.floor(a.filesScanned || 0));
      var filesTargetEl = document.getElementById("av-files-target");
      if (filesTargetEl) filesTargetEl.textContent = String(Math.floor(a.scanTargetFiles || 0));
      var threatsFoundEl = document.getElementById("av-threats-found");
      if (threatsFoundEl) threatsFoundEl.textContent = String(Math.floor(a.threatsDetected || 0));

      var defsVerEl = document.getElementById("av-defs-version");
      if (defsVerEl) defsVerEl.textContent = String(a.defsVersion || "0.0.0");
      var defsUpdatedEl = document.getElementById("av-defs-updated");
      if (defsUpdatedEl) defsUpdatedEl.textContent = fmtDayTime(a.lastUpdateDay || 0, a.lastUpdateMinute || 0);
      var updStatusEl = document.getElementById("av-update-status");
      if (updStatusEl) updStatusEl.textContent = outdated ? "Out of date" : "Up to date";

      var actTitleEl = document.getElementById("av-activity-title");
      var actSubEl = document.getElementById("av-activity-sub");
      var actBarEl = document.getElementById("av-activity-bar");
      var title = a.pendingUpdate ? "Updating definitions" : (a.isScanning ? "Scan in progress" : "No active tasks");
      var sub = a.pendingUpdate ? ("Downloading package... " + Math.floor(a.updateProgress || 0) + "%") :
        (a.isScanning ? ("Scanning files... " + Math.floor(a.scanProgress || 0) + "%") : "");
      var pct = a.pendingUpdate ? Math.floor(a.updateProgress || 0) : Math.floor(a.scanProgress || 0);
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;
      if (actTitleEl) actTitleEl.textContent = title;
      if (actSubEl) actSubEl.textContent = sub;
      if (actBarEl) actBarEl.style.width = (a.pendingUpdate || a.isScanning ? pct : 0) + "%";

      var updateBtn = document.getElementById("btn-av-update");
      if (updateBtn) updateBtn.disabled = !!(!a.isOn || a.pendingUpdate || !outdated);
      var stopBtn = document.getElementById("btn-av-scan-stop");
      if (stopBtn) stopBtn.disabled = !!(!a.isOn || !a.isScanning);

      var qBody = document.getElementById("av-quarantine-body");
      if (qBody) qBody.innerHTML = renderQuarantineRows(a.quarantine);
      var hist = document.getElementById("av-history");
      if (hist) hist.innerHTML = renderHistoryRows(a.history);
    },
    renderPCTools: function (container) {
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var used = Game.PCStorage ? Game.PCStorage.getUsedMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      var net = Game.state.net || {};
      var kbps = (Game.Net && Game.Net.getPlanKbps) ? Game.Net.getPlanKbps() : (net.planKbps || 128);
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      var pc = Game.state.pc || {};
      var cleanerInstalled = !!pc.cleanerInstalled;
      var cleanerDl = (Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById("pc-system-cleaner") : null;
      var cleanerDownloading = !!(cleanerDl && cleanerDl.status === "downloading");
      var cleanerSizeMb = 24;
      var downloadsManager = Game.Downloads || {};
      var getDownload = function (id) {
        return (downloadsManager && downloadsManager.getById) ? downloadsManager.getById(id) : null;
      };
      if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
      var coins = (Game.state.crypto && Game.state.crypto.coins) ? Game.state.crypto.coins : {};
      var ltc = coins.LTC || null;
      var doge = coins.DOGE || null;
      var ltcWalletInstalled = !!(ltc && ltc.wallet && ltc.wallet.isInstalled);
      var ltcMinerInstalled = !!(ltc && ltc.miner && ltc.miner.isInstalled);
      var dogeWalletInstalled = !!(doge && doge.wallet && doge.wallet.isInstalled);
      var dogeMinerInstalled = !!(doge && doge.miner && doge.miner.isInstalled);
      var ltcWalletDl = getDownload("ltc-wallet-client");
      var ltcWalletDownloading = !!(ltcWalletDl && ltcWalletDl.status === "downloading");
      var ltcMinerDl = getDownload("ltc-miner");
      var ltcMinerDownloading = !!(ltcMinerDl && ltcMinerDl.status === "downloading");
      var dogeWalletDl = getDownload("doge-wallet-client");
      var dogeWalletDownloading = !!(dogeWalletDl && dogeWalletDl.status === "downloading");
      var dogeMinerDl = getDownload("doge-miner");
      var dogeMinerDownloading = !!(dogeMinerDl && dogeMinerDl.status === "downloading");
      var cleanerActions = [];
      if (!cleanerInstalled && !cleanerDownloading) {
        cleanerActions.push('<button class="btn btn-small btn-outline" id="btn-dl-cleaner">Download System Cleaner</button>');
      }
      if (cleanerInstalled) {
        cleanerActions.push('<button class="btn btn-small btn-outline" id="btn-open-cleaner">Open Cleaner</button>');
      }
      if (cleanerDownloading) {
        cleanerActions.push('<button class="btn btn-small btn-outline" id="btn-view-cleaner-dl">View download</button>');
      }
      var cleanerActionsHtml = cleanerActions.join(" ");
      var ltcWalletStatus = ltcWalletInstalled ? "Installed" : (ltcWalletDownloading ? "Downloading" : "Not installed");
      var ltcMinerStatus = ltcMinerInstalled ? "Installed" : (ltcMinerDownloading ? "Downloading" : "Not installed");
      var dogeWalletStatus = dogeWalletInstalled ? "Installed" : (dogeWalletDownloading ? "Downloading" : "Not installed");
      var dogeMinerStatus = dogeMinerInstalled ? "Installed" : (dogeMinerDownloading ? "Downloading" : "Not installed");
      var ltcWalletButton = (!ltcWalletInstalled && !ltcWalletDownloading) ? '<button class="btn btn-small btn-outline" id="btn-dl-ltc-wallet">Download LTC wallet</button>' : "";
      var ltcMinerButton = (!ltcMinerInstalled && !ltcMinerDownloading) ? '<button class="btn btn-small btn-outline" id="btn-dl-ltc-miner">Download LTC miner</button>' : "";
      var dogeWalletButton = (!dogeWalletInstalled && !dogeWalletDownloading) ? '<button class="btn btn-small btn-outline" id="btn-dl-doge-wallet">Download DOGE wallet</button>' : "";
      var dogeMinerButton = (!dogeMinerInstalled && !dogeMinerDownloading) ? '<button class="btn btn-small btn-outline" id="btn-dl-doge-miner">Download DOGE miner</button>' : "";
      container.innerHTML = [
        "<h2>Tools</h2>",
        '<p class="small dim">Basic system information and utilities.</p>',
        '<div class="mt-8">',
        '  <div class="field-row"><span>Disk used</span><span class="mono">' + UI.formatSizeProgressMb(used, cap) + "</span></div>",
        '  <div class="field-row"><span>Disk free</span><span class="mono">' + UI.formatSizeFromMb(free) + "</span></div>",
        '  <div class="field-row"><span>Internet plan</span><span class="mono">' + kbps + " Kbps</span></div>",
        "</div>",
        '<div class="mt-12">',
        '  <h3>System Cleaner</h3>',
        '  <div class="small dim">Free up disk space by cleaning caches, temp files, and logs.</div>',
        '  <div class="mt-8">',
        '    <div class="field-row"><span>Status</span><span>' + (cleanerInstalled ? "Installed" : (cleanerDownloading ? "Downloading" : "Not installed")) + '</span></div>',
        '    <div class="field-row"><span>Download size</span><span class="mono">' + cleanerSizeMb + ' MB</span></div>',
        '  </div>',
        '  <div class="mt-6">' + cleanerActionsHtml + "</div>",
        "</div>",
        '<div class="mt-12">',
        '  <h3>Altcoin downloads</h3>',
        '  <div class="small dim">Download additional wallet and miner software types.</div>',
        '  <div class="mt-8">',
        '    <div class="field-row"><span>LTC Wallet</span><span>' + ltcWalletStatus + '</span></div>',
        '    ' + ltcWalletButton,
        '  </div>',
        '  <div class="mt-8">',
        '    <div class="field-row"><span>LTC Miner</span><span>' + ltcMinerStatus + '</span></div>',
        '    ' + ltcMinerButton,
        '  </div>',
        '  <div class="mt-12">',
        '    <div class="field-row"><span>DOGE Wallet</span><span>' + dogeWalletStatus + '</span></div>',
        '    ' + dogeWalletButton,
        '  </div>',
        '  <div class="mt-8">',
        '    <div class="field-row"><span>DOGE Miner</span><span>' + dogeMinerStatus + '</span></div>',
        '    ' + dogeMinerButton,
        '  </div>',
        '</div>'
      ].join("");
  
      var w = container.querySelector("#btn-dl-ltc-wallet");
      if (w) {
        w.addEventListener("click", function () {
          if (Game.Crypto && Game.Crypto.startWalletDownload) Game.Crypto.startWalletDownload("LTC");
          UI.renderPCTools(container);
        });
      }
      var m = container.querySelector("#btn-dl-ltc-miner");
      if (m) {
        m.addEventListener("click", function () {
          if (Game.Crypto && Game.Crypto.startMinerDownload) Game.Crypto.startMinerDownload("LTC");
          UI.renderPCTools(container);
        });
      }
      var w2 = container.querySelector("#btn-dl-doge-wallet");
      if (w2) {
        w2.addEventListener("click", function () {
          if (Game.Crypto && Game.Crypto.startWalletDownload) Game.Crypto.startWalletDownload("DOGE");
          UI.renderPCTools(container);
        });
      }
      var m2 = container.querySelector("#btn-dl-doge-miner");
      if (m2) {
        m2.addEventListener("click", function () {
          if (Game.Crypto && Game.Crypto.startMinerDownload) Game.Crypto.startMinerDownload("DOGE");
          UI.renderPCTools(container);
        });
      }
  
      var cdl = container.querySelector("#btn-dl-cleaner");
      if (cdl) {
        cdl.addEventListener("click", function () {
          if (!Game || !Game.Downloads || !Game.Downloads.startFileDownload) return;
          Game.Downloads.startFileDownload({
            id: "pc-system-cleaner",
            kind: "pc_tool_cleaner",
            name: "System Cleaner",
            sizeMb: cleanerSizeMb,
            minimized: true
          });
          UI.renderPCTools(container);
          if (UI.renderPCDownloadsSidebar) UI.renderPCDownloadsSidebar();
        });
      }
      var openBtn = container.querySelector("#btn-open-cleaner");
      if (openBtn) {
        openBtn.addEventListener("click", function () {
          if (Game.PC && Game.PC.openApp) Game.PC.openApp("cleaner");
          UI.renderPC();
        });
      }
      var viewBtn = container.querySelector("#btn-view-cleaner-dl");
      if (viewBtn) {
        viewBtn.addEventListener("click", function () {
          if (Game && Game.PC && Game.PC.openDownload) {
            Game.PC.openDownload("pc-system-cleaner");
            UI.renderPC();
          } else if (UI.openDownloadModal) UI.openDownloadModal("pc-system-cleaner");
          if (UI.renderPCDownloadsSidebar) UI.renderPCDownloadsSidebar();
        });
      }
    },
    renderPCCleaner: function (container) {
      if (!container) return;
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();
      if (Game.PCStorage && Game.PCStorage.ensure) Game.PCStorage.ensure();
      if (Game.Btc && Game.Btc.ensureWalletState) Game.Btc.ensureWalletState();
  
      var pc = Game.state.pc || {};
      var w = (Game.state.btc && Game.state.btc.wallet) ? Game.state.btc.wallet : null;
      var installed = !!pc.cleanerInstalled;
      var dl = (Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById("pc-system-cleaner") : null;
      var downloading = !!(dl && dl.status === "downloading");
      var sizeMb = (dl && typeof dl.totalMb === "number") ? Math.round(dl.totalMb) : 24;
  
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var used = Game.PCStorage ? Game.PCStorage.getUsedMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      var chainMb = (w && typeof w.chainStorageMb === "number") ? w.chainStorageMb : 0;
  
      if (!installed) {
        container.innerHTML = [
          "<h2>System Cleaner</h2>",
          '<p class="small dim">Download the System Cleaner tool to manage caches, logs and wallet data.</p>',
          '<div class="mt-8">',
          '  <div class="field-row"><span>Status</span><span>' + (downloading ? "Downloading" : "Not installed") + "</span></div>",
          '  <div class="field-row"><span>Download size</span><span class="mono">' + sizeMb + " MB</span></div>",
          '  <div class="field-row"><span>Disk free</span><span class="mono">' + UI.formatSizeProgressMb(free, cap) + "</span></div>",
          '  <div class="mt-8">',
          '    <button class="btn btn-small btn-outline" id="btn-cleaner-download"' + (downloading ? " disabled" : "") + ">Download</button> ",
          '    <button class="btn btn-small btn-outline" id="btn-cleaner-view"' + (downloading ? "" : " disabled") + ">View download</button> ",
          '    <button class="btn btn-small btn-outline" id="btn-cleaner-tools">Back to Tools</button>',
          "  </div>",
          "</div>"
        ].join("");
  
        var bd = container.querySelector("#btn-cleaner-download");
        if (bd) {
          bd.addEventListener("click", function () {
            if (!Game || !Game.Downloads || !Game.Downloads.startFileDownload) return;
            Game.Downloads.startFileDownload({
              id: "pc-system-cleaner",
              kind: "pc_tool_cleaner",
              name: "System Cleaner",
              sizeMb: sizeMb,
              minimized: true
            });
            UI.renderPCCleaner(container);
            UI.renderPCDownloadsSidebar();
          });
        }
        var bv = container.querySelector("#btn-cleaner-view");
        if (bv) {
          bv.addEventListener("click", function () {
            if (Game && Game.PC && Game.PC.openDownload) {
              Game.PC.openDownload("pc-system-cleaner");
              UI.renderPC();
            } else if (UI.openDownloadModal) UI.openDownloadModal("pc-system-cleaner");
            UI.renderPCDownloadsSidebar();
          });
        }
        var bt = container.querySelector("#btn-cleaner-tools");
        if (bt) {
          bt.addEventListener("click", function () {
            if (Game.PC && Game.PC.openApp) Game.PC.openApp("tools");
            UI.renderPC();
          });
        }
        return;
      }
  
      container.innerHTML = [
        "<h2>System Cleaner</h2>",
        '<p class="small dim">Remove caches, temporary files and logs to recover disk space. Some actions are destructive (logs and wallet sync).</p>',
        '<div class="mt-8">',
        '  <div class="field-row"><span>Disk used</span><span class="mono" id="cleaner-disk-used">' + UI.formatSizeProgressMb(used, cap) + "</span></div>",
        '  <div class="field-row"><span>Disk free</span><span class="mono" id="cleaner-disk-free">' + UI.formatSizeFromMb(free) + "</span></div>",
        "</div>",
        '<div class="mt-12">',
        '  <h3>Cleanup options</h3>',
        '  <div class="small dim">Select what to remove.</div>',
        '  <div class="mt-8">',
        '    <div class="field-row"><span><label><input type="checkbox" id="cl-cache" checked> Clear browser cache</label></span><span class="mono">' + (pc.browserCacheMb || 0).toFixed(1) + " MB</span></div>",
        '    <div class="field-row"><span><label><input type="checkbox" id="cl-temp" checked> Clear temp files</label></span><span class="mono">' + (pc.tempFilesMb || 0).toFixed(1) + " MB</span></div>",
        '    <div class="field-row"><span><label><input type="checkbox" id="cl-sys" checked> Clear system logs</label></span><span class="mono">' + (pc.systemLogsMb || 0).toFixed(1) + " MB</span></div>",
        '    <div class="field-row"><span><label><input type="checkbox" id="cl-event"> Clear event log (notifications)</label></span><span class="mono">' + (pc.eventLogMb || 0).toFixed(1) + " MB</span></div>",
        '    <div class="field-row"><span><label><input type="checkbox" id="cl-wallet"> Reset wallet sync data</label></span><span class="mono">' + (chainMb || 0).toFixed(0) + " MB</span></div>",
        "  </div>",
        '  <div class="notice mt-8">Files on disk: ' + (pc.filesCount || 0) + " Æ’?Â½ System logs: " + (pc.systemLogFiles || 0) + " Æ’?Â½ Event log: " + (pc.eventLogFiles || 0) + "</div>",
        '  <div class="mt-8"><div class="field-row"><span>Estimated space recovered</span><span class="mono" id="cleaner-est">0 MB</span></div></div>',
        '  <div class="mt-8">',
        '    <button class="btn btn-small btn-primary" id="btn-cleaner-run">Clean now</button> ',
        '    <button class="btn btn-small btn-outline" id="btn-cleaner-back">Back to Tools</button>',
        "  </div>",
        "</div>"
      ].join("");
  
      function getCleanerOpts() {
        return {
          clearCache: !!(container.querySelector("#cl-cache") && container.querySelector("#cl-cache").checked),
          clearTemp: !!(container.querySelector("#cl-temp") && container.querySelector("#cl-temp").checked),
          clearSystemLogs: !!(container.querySelector("#cl-sys") && container.querySelector("#cl-sys").checked),
          clearEventLog: !!(container.querySelector("#cl-event") && container.querySelector("#cl-event").checked),
          resetWalletSync: !!(container.querySelector("#cl-wallet") && container.querySelector("#cl-wallet").checked)
        };
      }
  
      function estimateMb(o) {
        var est = 0;
        if (o.clearCache) est += (pc.browserCacheMb || 0);
        if (o.clearTemp) est += (pc.tempFilesMb || 0);
        if (o.clearSystemLogs) est += (pc.systemLogsMb || 0);
        if (o.clearEventLog) est += (pc.eventLogMb || 0);
        if (o.resetWalletSync) est += (chainMb || 0);
        return est;
      }
  
      function updateEstimate() {
        var o = getCleanerOpts();
        var est = estimateMb(o);
        var estEl = container.querySelector("#cleaner-est");
        if (estEl) estEl.textContent = est.toFixed(1) + " MB";
      }
  
      var ids = ["#cl-cache", "#cl-temp", "#cl-sys", "#cl-event", "#cl-wallet"];
      for (var i = 0; i < ids.length; i++) {
        var cb = container.querySelector(ids[i]);
        if (cb) cb.addEventListener("change", updateEstimate);
      }
      updateEstimate();
  
      var run = container.querySelector("#btn-cleaner-run");
      if (run) {
        run.addEventListener("click", function () {
          if (!Game || !Game.PC || typeof Game.PC.cleanSystem !== "function") return;
          var o = getCleanerOpts();
          var est = estimateMb(o);
          UI.confirmModal({
            title: "Run System Cleaner?",
            sub: "Estimated recovery: " + est.toFixed(1) + " MB",
            confirmLabel: "Clean",
            bodyHtml:
              '<div class="card-section small dim">This will permanently remove the selected data.</div>' +
              '<div class="card-section small">' +
                '<div class="field-row"><span>Clear cache</span><span>' + (o.clearCache ? "Yes" : "No") + "</span></div>" +
                '<div class="field-row"><span>Clear temp</span><span>' + (o.clearTemp ? "Yes" : "No") + "</span></div>" +
                '<div class="field-row"><span>Clear system logs</span><span>' + (o.clearSystemLogs ? "Yes" : "No") + "</span></div>" +
                '<div class="field-row"><span>Clear event log</span><span>' + (o.clearEventLog ? "Yes" : "No") + "</span></div>" +
                '<div class="field-row"><span>Reset wallet sync</span><span>' + (o.resetWalletSync ? "Yes" : "No") + "</span></div>" +
              "</div>",
            onConfirm: function () {
              var freed = Game.PC.cleanSystem(o) || 0;
              Game.addNotification("System Cleaner completed. Freed " + freed.toFixed(1) + " MB.");
              UI.renderPCCleaner(container);
            }
          });
        });
      }
  
      var back = container.querySelector("#btn-cleaner-back");
      if (back) {
        back.addEventListener("click", function () {
          if (Game.PC && Game.PC.openApp) Game.PC.openApp("tools");
          UI.renderPC();
        });
      }
    },
    renderPCMiner: function (container) {
      if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
      var p = (Game.state.btc && Game.state.btc.pcMiner) ? Game.state.btc.pcMiner : {};
      var stats = (Game.Btc && Game.Btc.getPcMinerStats) ? Game.Btc.getPcMinerStats() : null;
      var on = !!p.isOn;
      var coinId = String(p.coinId || "BTC").toUpperCase();
      var suiteLvl = (Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : (p.softwareLevel || 0);
      if (!isFinite(suiteLvl) || suiteLvl < 0) suiteLvl = 0;
      var suiteBonusPct = Math.round(((1 + suiteLvl * 0.12) - 1) * 100);
      if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
      var coins = (Game.state.crypto && Game.state.crypto.coins) ? Game.state.crypto.coins : {};
      var installedAltMiners = [];
      for (var cid in coins) {
        if (!Object.prototype.hasOwnProperty.call(coins, cid)) continue;
        var c = coins[cid];
        if (c && c.miner && c.miner.isInstalled) installedAltMiners.push(cid);
      }
      var heat = stats ? (stats.heat || 0) : (p.heat || 0);
      var maxHeat = stats ? (stats.maxHeat || 100) : 100;
      var heatPct = Math.floor((Math.min(maxHeat, Math.max(0, heat)) / Math.max(1, maxHeat)) * 100);
      var hash = stats ? (stats.hashrate || 0) : 0;
      var watts = stats ? (stats.watts || 0) : 0;
      var bill = p.lastPowerCostPerDay || (stats ? stats.powerCostPerDay : 0) || 0;
  
      var yieldMult = 1;
      if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
        yieldMult = Game.Prestige.getMiningYieldMultiplier();
      }
      var perHourBtc = hash * 0.00000000035 * 3600 * yieldMult;
      var estLabel = "Estimated BTC/hour";
      var estHtml = UI.formatBtcHtml(perHourBtc);
      if (coinId !== "BTC") {
        var mult = (coinId === "LTC") ? 120 : (coinId === "DOGE" ? 550 : 50);
        var perHourAlt = perHourBtc * mult;
        estLabel = "Estimated " + coinId + "/hour";
        estHtml = perHourAlt.toFixed(8) + " " + coinId;
      }
  
      container.innerHTML = [
        "<h2>PC Mining</h2>",
        '<p class="small dim">Mine cryptocurrency using your PC hardware. Earnings go to unconfirmed until the corresponding wallet confirms them.</p>',
        '<div class="mt-8">',
        (installedAltMiners.length ? ('  <div class="field-row"><span>Currency</span><span><select id="pcminer-coin" style="padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">' +
          '<option value="BTC"' + (coinId === "BTC" ? " selected" : "") + '>BTC</option>' +
          installedAltMiners.map(function (id) { return '<option value="' + id + '"' + (coinId === id ? " selected" : "") + '>' + id + '</option>'; }).join("") +
          '</select></span></div>') : ''),
        '  <div class="field-row"><span>Status</span><span>' + (on ? "MINING" : "Idle") + "</span></div>",
        '  <div class="field-row"><span>' + estLabel + '</span><span class="mono" id="pcminer-hash">' + estHtml + "</span></div>",
        '  <div class="field-row"><span>Power draw</span><span class="mono" id="pcminer-watts">' + watts.toFixed(0) + " W</span></div>",
        '  <div class="field-row"><span>Power cost/day</span><span class="mono" id="pcminer-bill">$' + bill.toFixed(1) + "</span></div>",
        '  <div class="field-row"><span>Heat</span><span class="mono" id="pcminer-heat">' + heat.toFixed(0) + " / " + maxHeat.toFixed(0) + "</span></div>",
        '  <div class="progress mt-4"><div id="pcminer-heat-bar" class="progress-fill danger" style="width:' + heatPct + '%"></div></div>',
        '  <div class="mt-8">',
        '    <button class="btn btn-small ' + (on ? "btn-outline" : "btn-primary") + '" id="btn-pcminer-toggle">' + (on ? "Stop mining" : "Start mining") + "</button>",
        '  </div>',
        "</div>",
        '<div class="mt-12">',
        '  <h3>Installed components</h3>',
        '  <div class="field-row"><span>Motherboard</span><span class="mono">' + ((Game.PC && Game.PC.getMotherboardDef) ? Game.PC.getMotherboardDef().name : "Unknown") + '</span></div>',
        '  <div class="field-row"><span>RAM</span><span class="mono">L' + ((Game.state.pc && typeof Game.state.pc.ramLevel === "number") ? Game.state.pc.ramLevel : 0) + ' (' + ((Game.PC && Game.PC.getRamCapacityMb) ? Math.round(Game.PC.getRamCapacityMb()) : 0) + ' MB)</span></div>',
        '  <div class="field-row"><span>Storage</span><span class="mono">L' + ((Game.state.pc && typeof Game.state.pc.storageLevel === "number") ? Game.state.pc.storageLevel : 0) + ' (' + ((Game.state.pc && typeof Game.state.pc.storageCapacityMb === "number") ? Math.round(Game.state.pc.storageCapacityMb) : 0) + ' MB)</span></div>',
        '  <div class="field-row mt-4"><span>Case</span><span class="mono">L' + (p.caseLevel || 0) + "</span></div>",
        '  <div class="field-row"><span>Fans</span><span class="mono">L' + (p.fansLevel || 0) + "</span></div>",
        '  <div class="field-row"><span>PSU</span><span class="mono">L' + (p.psuLevel || 0) + "</span></div>",
        '  <div class="field-row mt-4"><span>CPU</span><span class="mono">' + ((Game.Shop && Game.Shop.getMinerDeviceNameForLevel) ? Game.Shop.getMinerDeviceNameForLevel("CPU", (p.cpuLevel || 0)) : ("CPU L" + (p.cpuLevel || 0))) + " (L" + (p.cpuLevel || 0) + ")</span></div>",
        '  <div class="field-row"><span>GPU</span><span class="mono">' + ((Game.Shop && Game.Shop.getMinerDeviceNameForLevel) ? Game.Shop.getMinerDeviceNameForLevel("GPU", (p.gpuLevel || 0)) : ("GPU L" + (p.gpuLevel || 0))) + " (L" + (p.gpuLevel || 0) + ")</span></div>",
        '  <div class="field-row"><span>Miner software suite</span><span class="mono">L' + suiteLvl + " (+" + suiteBonusPct + "% PC Miner Æ’?Â½ Rigs)</span></div>",
        (stats && stats.ramNeedMb && stats.ramMb && stats.ramMb < stats.ramNeedMb ? ('  <div class="notice">Low RAM: ' + Math.round(stats.ramMb) + " MB available, " + Math.round(stats.ramNeedMb) + " MB needed. Hashrate throttled.</div>") : ''),
        '  <div class="notice">Upgrade parts online via Shops â†’ PC Hardware Market, or travel to Industrial Park for local hardware.</div>',
        "</div>"
      ].join("");
  
      var toggleBtn = container.querySelector("#btn-pcminer-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", function () {
          if (Game.Btc && Game.Btc.togglePcMining) {
            Game.Btc.togglePcMining();
            UI.renderPCMiner(container);
          }
        });
      }
      var coinSel = container.querySelector("#pcminer-coin");
      if (coinSel) {
        coinSel.addEventListener("change", function () {
          if (Game.Btc && Game.Btc.ensurePcMinerState) Game.Btc.ensurePcMinerState();
          Game.state.btc.pcMiner.coinId = String(this.value || "BTC").toUpperCase();
          UI.renderPCMiner(container);
        });
      }
    },
    renderPCInternetBrowser: function (container) {
      if (!container) return;
      if (!Game || !Game.state) return;
      if (Game.Net && Game.Net.ensure) Game.Net.ensure();
      if (Game.PC && Game.PC.ensureState) Game.PC.ensureState();

      function ensureWebState() {
        var pc = Game.state.pc;
        if (!pc.web || typeof pc.web !== "object") pc.web = {};
        var web = pc.web;
        if (!Array.isArray(web.tabs)) web.tabs = [];
        if (typeof web.nextTabId !== "number" || !isFinite(web.nextTabId) || web.nextTabId < 1) web.nextTabId = 1;
        if (typeof web.activeTabId !== "number" || !isFinite(web.activeTabId)) web.activeTabId = 0;
        if (!web.homeUrl) web.homeUrl = "https://ninja.web/";
        if (web.tabs.length === 0) {
          var tab = { id: web.nextTabId++, title: "Ninja Web", url: web.homeUrl, addr: web.homeUrl, back: [], forward: [] };
          web.tabs.push(tab);
          web.activeTabId = tab.id;
        }
        var hasActive = false;
        for (var i = 0; i < web.tabs.length; i++) {
          if (web.tabs[i] && web.tabs[i].id === web.activeTabId) { hasActive = true; break; }
        }
        if (!hasActive && web.tabs[0]) web.activeTabId = web.tabs[0].id;
        return web;
      }

      function getActiveTab(web) {
        for (var i = 0; i < web.tabs.length; i++) {
          if (web.tabs[i] && web.tabs[i].id === web.activeTabId) return web.tabs[i];
        }
        return web.tabs[0] || null;
      }

      function normalizeUrl(input) {
        var raw = String(input || "").trim();
        if (!raw) return "https://ninja.web/";
        if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) return raw;
        if (raw.indexOf("ninja://") === 0) return raw.replace("ninja://", "https://ninja.web/");
        if (raw.indexOf("ninja.web") === 0) return "https://" + raw;
        if (raw.indexOf("www.") === 0) return "https://" + raw;
        return "https://ninja.web/search?q=" + encodeURIComponent(raw);
      }

      function getNetStats() {
        var net = (Game && Game.state && Game.state.net) ? Game.state.net : {};
        var planKbps = (Game.Net && Game.Net.getPlanKbps) ? Game.Net.getPlanKbps() : (net.planKbps || 128);
        var effMbps = (Game.Net && Game.Net.getEffectiveMbps) ? Game.Net.getEffectiveMbps() : ((planKbps || 128) / 1000);
        var currentMbps = typeof net.currentMbps === "number" ? net.currentMbps : 0;
        return { planKbps: planKbps, effKbps: Math.round(effMbps * 1000), currentKbps: Math.round(currentMbps * 1000) };
      }

      UI._pcWebGetTitleForUrl = UI._pcWebGetTitleForUrl || function (url) {
        var u = String(url || "");
        if (UI && UI.pcWebGetTitle) {
          var customTitle = UI.pcWebGetTitle(u);
          if (customTitle) return customTitle;
        }
        if (u.indexOf("https://ninja.web/search") === 0) return "Ninja Web Search";
        if (u.indexOf("https://ninja.web/photos") === 0) return "Ninja Photos";
        if (u.indexOf("https://ninja.web/news") === 0) return "CityPulse News";
        if (u.indexOf("https://ninja.web/status") === 0) return "Connection Status";
        if (u.indexOf("https://ninja.web/maps") === 0) return "Ninja Maps";
        if (u.indexOf("https://ninja.web/finance") === 0) return "Ninja Finance";
        if (u.indexOf("https://ninja.web/jobs") === 0) return "Ninja Jobs";
        if (u.indexOf("https://ninja.web/weather") === 0) return "Ninja Weather";
        if (u.indexOf("https://ninja.web/") === 0) return "Ninja Web";
        try {
          var host = u.replace(/^https?:\/\//, "").split("/")[0];
          return host ? (host + " - Ninja Web") : "Ninja Web";
        } catch (e) {}
        return "Ninja Web";
      };

      UI._pcWebRenderPage = UI._pcWebRenderPage || function (url) {
        var u = String(url || "");
        if (UI && UI.pcWebRenderCustom) {
          var custom = UI.pcWebRenderCustom(u);
          if (custom) return custom;
        }
        var n = getNetStats();
        var heroImg = "https://picsum.photos/seed/ninjawebhero/1200/520";
        var appHubMatch = u.match(/^https:\/\/ninja\.web\/apps\/?([a-z0-9_-]+)?/i);

        function navLinks() {
          return (
            '<div class="pc-web-navlinks">' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/">Home</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/apps">Apps</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/mining">Mining</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/photos">Photos</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/news">News</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/maps">Maps</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/finance">Finance</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/jobs">Jobs</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/weather">Weather</a>' +
              '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/status">Status</a>' +
            "</div>"
          );
        }

        function ninjaLogo() {
          return (
            '<div class="pc-ninja-logo" aria-label="Ninja Web">' +
              '<span class="pc-ninja-word">Ninja</span>' +
              '<span class="pc-ninja-webword">Web</span>' +
            "</div>"
          );
        }

        if (appHubMatch) {
          var appId = String(appHubMatch[1] || "").toLowerCase();
          if (!appId) {
            return (
              '<div class="pc-web-page">' +
                navLinks() +
                '<div class="pc-web-hero pc-web-hero-small">' +
                  ninjaLogo() +
                  '<div class="pc-web-hero-sub">Apps directory (simulated). Choose an app to install.</div>' +
                "</div>" +
                '<div class="pc-web-card mt-8" style="max-width:860px;">' +
                  '<div class="pc-web-card-title">Featured</div>' +
                  '<div class="pc-web-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">' +
                    '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/apps/market"><img loading="lazy" src="https://picsum.photos/seed/nwappmarket/640/360" alt="Market"></a>' +
                    '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/apps/casino"><img loading="lazy" src="https://picsum.photos/seed/nwappcasino/640/360" alt="Casino"></a>' +
                    '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/apps/email"><img loading="lazy" src="https://picsum.photos/seed/nwappmail/640/360" alt="Email"></a>' +
                  "</div>" +
                  '<div class="small dim mt-8">Installs start a download window on your PC.</div>' +
                "</div>" +
              "</div>"
            );
          }
          var def = (Game && Game.PC && Game.PC.getAppInstallDef) ? Game.PC.getAppInstallDef(appId) : null;
          var appDef = UI.getPCAppDef ? UI.getPCAppDef(appId) : null;
          var title = appDef ? (appDef.title || appId) : (def ? def.name : appId);
          var installed = (Game && Game.PC && Game.PC.isAppInstalled) ? Game.PC.isAppInstalled(appId) : false;
          var size = def && typeof def.sizeMb === "number" ? def.sizeMb : 0;
          var art = "https://picsum.photos/seed/nwapp-" + encodeURIComponent(appId) + "/1200/520";

          if (!def) {
            return (
              '<div class="pc-web-page">' +
                navLinks() +
                '<div class="pc-web-card" style="max-width:860px;">' +
                  '<div class="pc-web-card-title">App not found</div>' +
                  '<div class="small dim">No install package exists for <span class="mono">' + appId + "</span>.</div>" +
                "</div>" +
              "</div>"
            );
          }

          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero">' +
                '<img class="pc-web-hero-bg" loading="lazy" src="' + art + '" alt="">' +
                '<div class="pc-web-hero-overlay"></div>' +
                '<div class="pc-web-hero-content">' +
                  ninjaLogo() +
                  '<div class="pc-web-hero-sub"><span class="mono">/apps/' + appId + "</span> • Verified publisher</div>" +
                  '<div class="mt-8" style="font-size:18px;font-weight:700;">' + title + "</div>" +
                  '<div class="small dim mt-4">Package size <span class="mono">' + size.toFixed(2) + " MB</span> • Requires disk space</div>" +
                  '<div class="mt-8">' +
                    (installed
                      ? '<button class="btn btn-small btn-outline" type="button" data-web-open-app="' + appId + '">Open app</button>'
                      : '<button class="btn btn-small btn-primary" type="button" data-web-install-app="' + appId + '">Install</button>') +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/status") === 0) {
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-card">' +
                '<div class="pc-web-card-title">Connection status</div>' +
                '<div class="pc-web-kv"><span>Plan</span><span class="mono">' + n.planKbps + " Kbps</span></div>" +
                '<div class="pc-web-kv"><span>Effective</span><span class="mono">~' + n.effKbps + " Kbps</span></div>" +
                '<div class="pc-web-kv"><span>Current</span><span class="mono" id="pc-net-current">' + n.currentKbps + " Kbps</span></div>" +
                '<div class="pc-web-kv"><span>Security</span><span class="mono">TLS 1.3 • HSTS</span></div>' +
                '<div class="pc-web-kv"><span>DNS</span><span class="mono">1.1.1.1 (simulated)</span></div>' +
              "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/photos") === 0) {
          var tiles = [];
          for (var i = 0; i < 18; i++) {
            var seed = "nw-" + i;
            var img = "https://picsum.photos/seed/" + seed + "/420/280";
            tiles.push(
              '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/photos#' + seed + '">' +
                '<img loading="lazy" src="' + img + '" alt="Photo">' +
                '<div class="pc-web-photo-meta"><span>Library</span><span class="mono">ID ' + (1000 + i) + "</span></div>" +
              "</a>"
            );
          }
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                ninjaLogo() +
                '<div class="pc-web-hero-sub">Curated image library (web-hosted) for realistic mock pages.</div>' +
              "</div>" +
              '<div class="pc-web-grid">' + tiles.join("") + "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/news") === 0) {
          var stories = [];
          var storyImgs = ["https://picsum.photos/seed/citypulse1/980/420", "https://picsum.photos/seed/citypulse2/980/420", "https://picsum.photos/seed/citypulse3/980/420"];
          var headlines = ["Markets open mixed as energy costs fall", "Local hardware shortage drives GPU prices up", "City centre internet upgraded — speeds improve"];
          var blurbs = [
            "Analysts expect the week to remain volatile; traders watch commodity pricing and retail demand.",
            "Enthusiasts report longer lead times for popular components; second-hand prices spike.",
            "New routing equipment rolls out gradually; customers should see more stable throughput."
          ];
          for (var si = 0; si < 3; si++) {
            stories.push(
              '<div class="pc-web-article">' +
                '<div class="pc-web-article-media"><img loading="lazy" src="' + storyImgs[si] + '" alt="Story image"></div>' +
                '<div class="pc-web-article-body">' +
                  '<div class="pc-web-article-kicker">CityPulse</div>' +
                  '<div class="pc-web-article-title">' + headlines[si] + "</div>" +
                  '<div class="pc-web-article-blurb small dim">' + blurbs[si] + "</div>" +
                  '<div class="pc-web-article-actions mt-8">' +
                    '<a href="#" class="pc-web-link" data-web-href="https://ninja.web/search?q=' + encodeURIComponent(headlines[si]) + '">Read more</a>' +
                  "</div>" +
                "</div>" +
              "</div>"
            );
          }
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                '<div class="pc-web-hero-row">' +
                  '<div>' + ninjaLogo() + '<div class="pc-web-hero-sub">Today’s headlines (simulated).</div></div>' +
                  '<div class="pc-web-hero-badge mono">LIVE</div>' +
                "</div>" +
              "</div>" +
              stories.join("") +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/maps") === 0) {
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                '<div class="pc-web-hero-row">' +
                  '<div>' + ninjaLogo() + '<div class="pc-web-hero-sub">Maps (simulated) — route planning and nearby places.</div></div>' +
                  '<div class="pc-web-hero-badge mono">BETA</div>' +
                "</div>" +
              "</div>" +
              '<div class="pc-web-card mt-8" style="max-width:860px;">' +
                '<div class="field-row"><span>Search</span><span><input class="pc-web-input" style="height:30px;" value="coffee near city centre" disabled></span></div>' +
                '<div class="pc-web-grid mt-8" style="grid-template-columns:repeat(3,minmax(0,1fr));">' +
                  '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/maps#1"><img loading="lazy" src="https://picsum.photos/seed/nwmap1/640/360" alt="Map"></a>' +
                  '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/maps#2"><img loading="lazy" src="https://picsum.photos/seed/nwmap2/640/360" alt="Map"></a>' +
                  '<a href="#" class="pc-web-photo" data-web-href="https://ninja.web/maps#3"><img loading="lazy" src="https://picsum.photos/seed/nwmap3/640/360" alt="Map"></a>' +
                "</div>" +
                '<div class="small dim mt-8">Tip: later we can wire this to in-game travel locations.</div>' +
              "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/finance") === 0) {
          var movers = [
            { sym: "BTC", px: (Game && Game.state && typeof Game.state.btcPriceUsd === "number") ? Game.state.btcPriceUsd : 0, ch: (Math.random() * 6 - 3) },
            { sym: "SOL", px: 36 + Math.random() * 14, ch: (Math.random() * 5 - 2.5) },
            { sym: "DOGE", px: 0.06 + Math.random() * 0.04, ch: (Math.random() * 8 - 4) },
            { sym: "LTC", px: 64 + Math.random() * 22, ch: (Math.random() * 5 - 2.5) }
          ];
          var rows = [];
          rows.push('<table class="table"><thead><tr><th>Symbol</th><th>Price</th><th>Day</th></tr></thead><tbody>');
          for (var mi = 0; mi < movers.length; mi++) {
            var m0 = movers[mi];
            var up = m0.ch >= 0;
            rows.push('<tr><td class="mono">' + m0.sym + '</td><td class="mono">$' + (m0.sym === "DOGE" ? m0.px.toFixed(4) : m0.px.toFixed(2)) + '</td><td class="mono" style="color:' + (up ? '#00ffa3' : '#ff3b3b') + ';">' + (up ? "+" : "") + m0.ch.toFixed(2) + '%</td></tr>');
          }
          rows.push("</tbody></table>");
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                ninjaLogo() +
                '<div class="pc-web-hero-sub">Markets overview (simulated) with realistic tables and cards.</div>' +
              "</div>" +
              '<div class="pc-web-card mt-8" style="max-width:860px;">' +
                '<div class="pc-web-card-title">Top movers</div>' +
                rows.join("") +
                '<div class="small dim mt-8">Open the in-game exchange via <a href="#" class="pc-web-link" data-web-href="app://market">Online Market</a>.</div>' +
              "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/jobs") === 0) {
          var cards = [];
          var roles = ["Warehouse Associate", "Junior Helpdesk", "Retail Cashier", "Delivery Rider", "Apprentice Electrician", "Night Security"];
          for (var ji = 0; ji < roles.length; ji++) {
            cards.push(
              '<div class="pc-web-card mt-8" style="max-width:860px;">' +
                '<div class="pc-web-card-title">' + roles[ji] + "</div>" +
                '<div class="small dim">Location: City • Type: Full-time • Posted: ' + (1 + Math.floor(Math.random() * 8)) + " days ago</div>" +
                '<div class="mt-8">Pay range: <span class="mono">$' + (10 + Math.floor(Math.random() * 12)) + "</span> – <span class=\"mono\">$" + (18 + Math.floor(Math.random() * 18)) + "</span> / hr</div>" +
                '<div class="mt-8"><a href="#" class="pc-web-link" data-web-href="app://jobs">Open Jobs app</a></div>' +
              "</div>"
            );
          }
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                ninjaLogo() +
                '<div class="pc-web-hero-sub">Job listings (simulated). Later we can deep-link to in-game jobs.</div>' +
              "</div>" +
              cards.join("") +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/weather") === 0) {
          var temps = 14 + Math.floor(Math.random() * 10);
          var feels = temps + (Math.random() < 0.5 ? -1 : 2);
          var icon = ["Clear", "Cloudy", "Rain", "Wind"][Math.floor(Math.random() * 4)];
          return (
            '<div class="pc-web-page">' +
              navLinks() +
              '<div class="pc-web-hero pc-web-hero-small">' +
                ninjaLogo() +
                '<div class="pc-web-hero-sub">Weather (simulated) — looks real, no gameplay effect yet.</div>' +
              "</div>" +
              '<div class="pc-web-card mt-8" style="max-width:860px;">' +
                '<div class="flex-between"><div><div class="pc-web-card-title">City Centre</div><div class="small dim">Updated just now</div></div><div class="mono">' + icon + "</div></div>" +
                '<div class="mt-8" style="font-size:34px;font-weight:700;">' + temps + "°C</div>" +
                '<div class="small dim">Feels like <span class=\"mono\">' + feels + "°C</span> • Humidity <span class=\"mono\">" + (40 + Math.floor(Math.random() * 45)) + "%</span> • Wind <span class=\"mono\">" + (4 + Math.floor(Math.random() * 18)) + " km/h</span></div>" +
                '<div class="pc-web-grid mt-12" style="grid-template-columns:repeat(4,minmax(0,1fr));">' +
                  '<div class="pc-web-card" style="padding:10px;"><div class="small dim">Tomorrow</div><div class="mono mt-4">' + (temps + 1) + "°</div></div>" +
                  '<div class="pc-web-card" style="padding:10px;"><div class="small dim">Wed</div><div class="mono mt-4">' + (temps - 1) + "°</div></div>" +
                  '<div class="pc-web-card" style="padding:10px;"><div class="small dim">Thu</div><div class="mono mt-4">' + (temps + 2) + "°</div></div>" +
                  '<div class="pc-web-card" style="padding:10px;"><div class="small dim">Fri</div><div class="mono mt-4">' + (temps) + "°</div></div>" +
                "</div>" +
              "</div>" +
            "</div>"
          );
        }

        if (u.indexOf("https://ninja.web/search") === 0) {
          var q = "";
          var m = u.match(/[?&]q=([^&]+)/);
          if (m && m[1]) {
            try { q = decodeURIComponent(m[1].replace(/\\+/g, "%20")); } catch (e) { q = m[1]; }
          }
          q = String(q || "").trim();
          var results = [];
          var rTitles = ["Ninja Photos — web image library", "Connection status — throughput and stability", "CityPulse News — daily headlines", "Ninja Maps — route planning", "Ninja Weather — forecasts", "Ninja Finance — markets", "Ninja Jobs — listings", "Property News — listings and updates", "ÐYZø Casino — games"];
          var rUrls = ["https://ninja.web/photos", "https://ninja.web/status", "https://ninja.web/news", "https://ninja.web/maps", "https://ninja.web/weather", "https://ninja.web/finance", "https://ninja.web/jobs", "app://propertynews", "app://casino"];
          var rSnips = [
            "Browse a realistic photo gallery powered by a web image source.",
            "View plan speed, effective speed, and current throughput in real time.",
            "A realistic mock news site with hero images and story cards.",
            "Explore the city with a realistic map UI (simulated).",
            "Forecasts and conditions for your area (simulated).",
            "Market tables, movers, and summaries (simulated).",
            "Browse job postings (simulated) and deep-link to in-game jobs.",
            "Open the in-game property portal.",
            "Open the in-game casino client."
          ];
          var seen = {};
          for (var ri = 0; ri < rTitles.length; ri++) {
            seen[rUrls[ri]] = true;
            results.push(
              '<div class="pc-web-result">' +
                '<div class="pc-web-result-url mono">' + rUrls[ri].replace(/^https?:\/\//, "") + "</div>" +
                '<a href=\"#\" class=\"pc-web-result-title\" data-web-href=\"' + rUrls[ri] + '\">' + rTitles[ri] + "</a>" +
                '<div class="pc-web-result-snippet small dim">' + rSnips[ri] + "</div>" +
              "</div>"
            );
          }

          // Modular sites: add relevant results for the query (e.g., miner, finance, tools, clean, property, antivirus).
          if (q && UI && typeof UI.pcWebSearch === "function") {
            var extra = UI.pcWebSearch(q, 20) || [];
            for (var xi = 0; xi < extra.length; xi++) {
              var ex = extra[xi] || {};
              var href = String(ex.url || "");
              if (!href || seen[href]) continue;
              seen[href] = true;
              results.push(
                '<div class="pc-web-result">' +
                  '<div class="pc-web-result-url mono">' + href.replace(/^https?:\/\//, "") + "</div>" +
                  '<a href=\"#\" class=\"pc-web-result-title\" data-web-href=\"' + href + '\">' + String(ex.title || href) + "</a>" +
                  '<div class="pc-web-result-snippet small dim">' + String(ex.snippet || "") + "</div>" +
                "</div>"
              );
            }
          }
          return (
            '<div class="pc-web-page">' +
              '<div class="pc-web-search-top">' +
                ninjaLogo() +
                '<form class="pc-web-searchbar" data-web-search="1">' +
                  '<input class="pc-web-input" name="q" value="' + (q ? q.replace(/\\\"/g, "&quot;") : "") + '" placeholder="Search the web…">' +
                  '<button class="btn btn-small btn-primary" type="submit">Search</button>' +
                "</form>" +
              "</div>" +
              navLinks() +
              '<div class="pc-web-results">' +
                '<div class="small dim">About <span class="mono">' + (120000 + Math.floor(Math.random() * 900000)) + "</span> results (" + (0.10 + Math.random() * 0.15).toFixed(2) + " seconds)</div>" +
                results.join("") +
              "</div>" +
            "</div>"
          );
        }

        return (
          '<div class="pc-web-page">' +
            '<div class="pc-web-hero">' +
              '<img class="pc-web-hero-bg" loading="lazy" src="' + heroImg + '" alt="">' +
              '<div class="pc-web-hero-overlay"></div>' +
              '<div class="pc-web-hero-content">' +
                ninjaLogo() +
                '<div class="pc-web-hero-sub">A fast, private browser UI (simulated) with realistic pages.</div>' +
                '<form class="pc-web-searchbar" data-web-search="1">' +
                  '<input class="pc-web-input" name="q" placeholder="Search with Ninja Web…">' +
                  '<button class="btn btn-small btn-primary" type="submit">Search</button>' +
                "</form>" +
                '<div class="pc-web-quicklinks">' +
                  '<a href="#" class="pc-web-quick" data-web-href="https://ninja.web/photos">Photos</a>' +
                  '<a href="#" class="pc-web-quick" data-web-href="https://ninja.web/news">News</a>' +
                  '<a href="#" class="pc-web-quick" data-web-href="https://ninja.web/status">Status</a>' +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>"
        );
      };

      function navigateTo(web, tab, url, opts) {
        var target = normalizeUrl(url);
        var pushHist = !(opts && opts.noHistory);
        if (pushHist && tab.url && tab.url !== target) {
          tab.back.push(tab.url);
          tab.forward = [];
        }
        tab.url = target;
        tab.addr = target;
        tab.title = UI._pcWebGetTitleForUrl(target);
      }

      function goBack(tab) {
        if (!tab.back || tab.back.length === 0) return;
        var prev = tab.back.pop();
        if (tab.url) tab.forward.push(tab.url);
        tab.url = prev;
        tab.addr = prev;
        tab.title = UI._pcWebGetTitleForUrl(prev);
      }

      function goForward(tab) {
        if (!tab.forward || tab.forward.length === 0) return;
        var next = tab.forward.pop();
        if (tab.url) tab.back.push(tab.url);
        tab.url = next;
        tab.addr = next;
        tab.title = UI._pcWebGetTitleForUrl(next);
      }

      var web = ensureWebState();
      var tab = getActiveTab(web);
      if (!tab) return;
      tab.title = UI._pcWebGetTitleForUrl(tab.url);
      if (!tab.addr) tab.addr = tab.url;

      var canBack = tab.back && tab.back.length > 0;
      var canFwd = tab.forward && tab.forward.length > 0;
      var addrEsc = String(tab.addr || "").replace(/\\\"/g, "&quot;");

      container.innerHTML =
        '<div class="pc-browser" data-web-root="1">' +
          '<div class="pc-browser-tabs">' +
            '<div class="pc-browser-tab is-active">' + (tab.title || "Ninja Web") + "</div>" +
            '<div class="pc-browser-tabs-spacer"></div>' +
            '<div class="pc-browser-tab-actions small dim">1 tab</div>' +
          "</div>" +
          '<div class="pc-browser-toolbar">' +
            '<button class="pc-browser-btn" type="button" data-web-action="back"' + (canBack ? "" : " disabled") + ' title="Back">←</button>' +
            '<button class="pc-browser-btn" type="button" data-web-action="forward"' + (canFwd ? "" : " disabled") + ' title="Forward">→</button>' +
            '<button class="pc-browser-btn" type="button" data-web-action="refresh" title="Refresh">↻</button>' +
            '<button class="pc-browser-btn" type="button" data-web-action="home" title="Home">⌂</button>' +
            '<form class="pc-browser-address" data-web-address="1">' +
              '<span class="pc-browser-lock" title="Secure">🔒</span>' +
              '<input class="pc-browser-input" name="addr" value="' + addrEsc + '" spellcheck="false" autocomplete="off">' +
              '<button class="pc-browser-go" type="submit">Go</button>' +
            "</form>" +
          "</div>" +
          '<div class="pc-browser-bookmarks">' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/">Ninja</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/apps">Apps</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/mining">Mining</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/photos">Photos</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/news">News</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/maps">Maps</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/finance">Finance</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/jobs">Jobs</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/weather">Weather</a>' +
            '<a href="#" class="pc-browser-bm" data-web-href="https://ninja.web/status">Status</a>' +
          "</div>" +
          '<div class="pc-browser-view" id="pc-browser-view">' +
            UI._pcWebRenderPage(tab.url) +
          "</div>" +
        "</div>";

      if (!container._pcWebBound) {
        container._pcWebBound = true;
        container.addEventListener("click", function (e) {
          var installBtn = e.target.closest("[data-web-install-app]");
          if (installBtn) {
            e.preventDefault();
            var appId = installBtn.getAttribute("data-web-install-app");
            if (appId && Game && Game.PC && Game.PC.startAppInstall) {
              var d = Game.PC.startAppInstall(appId, { minimized: false });
              if (d && d.id && Game.PC.openDownload) Game.PC.openDownload(d.id);
              if (UI && UI.renderPC) UI.renderPC();
              UI.renderPCInternetBrowser(container);
            }
            return;
          }
          var openAppBtn = e.target.closest("[data-web-open-app]");
          if (openAppBtn) {
            e.preventDefault();
            var oid = openAppBtn.getAttribute("data-web-open-app");
            if (oid && Game && Game.PC && Game.PC.openApp) {
              Game.PC.openApp(oid);
              if (UI && UI.renderPC) UI.renderPC();
            }
            return;
          }
          var link = e.target.closest("[data-web-href]");
          if (link) {
            e.preventDefault();
            var href = link.getAttribute("data-web-href");
            if (String(href || "").indexOf("app://") === 0) {
              var appId = String(href || "").replace("app://", "");
              if (Game && Game.PC && Game.PC.isAppInstalled && !Game.PC.isAppInstalled(appId)) {
                UI.pcWebNavigate("https://ninja.web/apps/" + appId);
                UI.renderPCInternetBrowser(container);
                return;
              }
              if (Game && Game.PC && Game.PC.openApp) { Game.PC.openApp(appId); UI.renderPC(); }
              return;
            }
            var w = ensureWebState();
            var t = getActiveTab(w);
            if (!t) return;
            navigateTo(w, t, href);
            UI.renderPCInternetBrowser(container);
            return;
          }
          var btn = e.target.closest("[data-web-action]");
          if (btn) {
            e.preventDefault();
            var action = btn.getAttribute("data-web-action");
            var w2 = ensureWebState();
            var t2 = getActiveTab(w2);
            if (!t2) return;
            if (action === "back") goBack(t2);
            else if (action === "forward") goForward(t2);
            else if (action === "home") navigateTo(w2, t2, w2.homeUrl);
            UI.renderPCInternetBrowser(container);
          }
        });
        container.addEventListener("submit", function (e) {
          var addrForm = e.target.closest("[data-web-address]");
          if (addrForm) {
            e.preventDefault();
            var input = addrForm.querySelector("input[name='addr']");
            var val = input ? input.value : "";
            var w = ensureWebState();
            var t = getActiveTab(w);
            if (!t) return;
            navigateTo(w, t, val);
            UI.renderPCInternetBrowser(container);
            return;
          }
          var searchForm = e.target.closest("[data-web-search]");
          if (searchForm) {
            e.preventDefault();
            var qEl = searchForm.querySelector("input[name='q']");
            var q = qEl ? qEl.value : "";
            var w2 = ensureWebState();
            var t2 = getActiveTab(w2);
            if (!t2) return;
            navigateTo(w2, t2, "https://ninja.web/search?q=" + encodeURIComponent(String(q || "")));
            UI.renderPCInternetBrowser(container);
          }
        });
      }
    },
    renderPCInternet: function (container) {
      if (UI && UI.renderPCInternetBrowser) {
        UI.renderPCInternetBrowser(container);
        return;
      }
      var net = (Game && Game.state && Game.state.net) ? Game.state.net : {};
      var planKbps = (Game.Net && Game.Net.getPlanKbps) ? Game.Net.getPlanKbps() : (net.planKbps || 128);
      var effMbps = (Game.Net && Game.Net.getEffectiveMbps) ? Game.Net.getEffectiveMbps() : ((planKbps || 128) / 1000);
      var currentMbps = typeof net.currentMbps === "number" ? net.currentMbps : 0;
      var currentKbps = Math.round(currentMbps * 1000);
      var effKbps = Math.round(effMbps * 1000);
  
      var active = 0;
      if (Game && Game.Downloads && Game.Downloads.getActive) {
        active = Game.Downloads.getActive().length;
      }
  
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
  
      container.innerHTML = [
        "<h2>Internet</h2>",
        '<p class="small dim">Connection speed varies each second and is shared across active downloads and wallet synchronisation.</p>',
        '<div class="mt-8">',
        '  <div class="field-row"><span>Plan</span><span class="mono">' + planKbps + ' Kbps</span></div>',
        '  <div class="field-row"><span>Effective</span><span class="mono">~' + effKbps + ' Kbps</span></div>',
        '  <div class="field-row"><span>Current</span><span class="mono" id="pc-net-current">' + currentKbps + ' Kbps</span></div>',
        '  <div class="field-row"><span>Active downloads</span><span>' + active + "</span></div>",
        '  <div class="field-row"><span>Disk free</span><span class="mono">' + UI.formatSizeProgressMb(free, cap) + "</span></div>",
        '  <div class="notice">Upgrade your plan or PC networking hardware via Shops â†’ PC Hardware Market.</div>',
        '  <div class="mt-8 card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:10px;border-radius:14px;">' +
        '    <div class="card-title" style="margin-bottom:6px;">PROPERTY NEWS</div>' +
        '    <div class="card-section small dim" style="margin-bottom:8px;">Online home listings and market updates.</div>' +
        '    <button class="btn btn-small btn-outline" id="pc-open-property-news"><span class="badge badge-blue">Open</span> View listings</button>' +
        '  </div>',
        '  <div class="mt-8 card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:10px;border-radius:14px;">' +
        '    <div class="card-title" style="margin-bottom:6px;">ðŸŽ° CASINO</div>' +
        '    <div class="card-section small dim" style="margin-bottom:8px;">Online casino games with neon vibes.</div>' +
        '    <button class="btn btn-small btn-outline" id="pc-open-casino"><span class="badge badge-blue">Open</span> Enter casino</button>' +
        '  </div>',
        "</div>"
      ].join("");
  
      var btn = container.querySelector("#pc-open-property-news");
      if (btn) {
        btn.addEventListener("click", function () {
          if (Game && Game.PC && Game.PC.openApp) {
            Game.PC.openApp("propertynews");
            UI.renderPC();
          }
        });
      }
  
      var casinoBtn = container.querySelector("#pc-open-casino");
      if (casinoBtn) {
        casinoBtn.addEventListener("click", function () {
          if (Game && Game.PC && Game.PC.openApp) {
            Game.PC.openApp("casino");
            UI.renderPC();
          }
        });
      }
    },
    renderPCCasino: function (container) {
      if (!container) return;
      if (Game.Casino && typeof Game.Casino.ensureState === "function") Game.Casino.ensureState();
      var casino = (Game && Game.state && Game.state.casino) ? Game.state.casino : null;
      if (!casino) casino = { uiPage: "lobby", slots: {}, blackjack: {}, plinko: {} };
  
      function safeMoney() {
        var money = (Game && Game.state && typeof Game.state.money === "number") ? Game.state.money : 0;
        if (!isFinite(money)) money = 0;
        return money;
      }
  
      function safeCasinoBalance() {
        var bal = (Game && Game.state && Game.state.casino && typeof Game.state.casino.balanceUsd === "number") ? Game.state.casino.balanceUsd : 0;
        if (!isFinite(bal) || bal < 0) bal = 0;
        return Math.round(bal * 100) / 100;
      }
  
      function slotSymbolHtml(symbolId, sizePx) {
        var id = String(symbolId || "");
        var size = (typeof sizePx === "number" && isFinite(sizePx) && sizePx > 0) ? sizePx : 60;
        var cls = "casino-symbol casino-symbol-" + id;
        var svg = "";
        if (id === "lemon") {
          svg = '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="18" ry="24"></ellipse><path d="M32 10 C28 8 24 8 20 10"></path><path d="M32 54 C36 56 40 56 44 54"></path></svg>';
        } else if (id === "cherry") {
          svg = '<svg viewBox="0 0 64 64"><circle cx="24" cy="40" r="10"></circle><circle cx="42" cy="42" r="9"></circle><path d="M24 30 C20 18 30 12 38 16"></path><path d="M42 33 C40 22 42 14 50 12"></path><path d="M50 12 C44 18 40 24 38 32"></path></svg>';
        } else if (id === "bell") {
          svg = '<svg viewBox="0 0 64 64"><path d="M20 44 C20 28 26 18 32 18 C38 18 44 28 44 44"></path><path d="M18 44 H46"></path><path d="M26 44 C26 50 29 54 32 54 C35 54 38 50 38 44"></path><path d="M30 16 C30 12 34 12 34 16"></path></svg>';
        } else if (id === "star") {
          svg = '<svg viewBox="0 0 64 64"><path d="M32 10 L38 26 L54 26 L41 36 L46 52 L32 42 L18 52 L23 36 L10 26 L26 26 Z"></path></svg>';
        } else if (id === "seven") {
          svg = '<svg viewBox="0 0 64 64"><path d="M18 18 H46"></path><path d="M46 18 L26 52"></path><path d="M24 52 H46"></path></svg>';
        } else if (id === "diamond") {
          svg = '<svg viewBox="0 0 64 64"><path d="M32 10 L52 32 L32 54 L12 32 Z"></path><path d="M32 10 L38 32 L32 54 L26 32 Z"></path></svg>';
        } else if (id === "wild") {
          svg = '<svg viewBox="0 0 64 64"><path d="M32 8 L38 20 L52 20 L41 29 L46 42 L32 34 L18 42 L23 29 L12 20 L26 20 Z"></path><path d="M16 50 L48 50"></path><path d="M20 56 L44 56"></path></svg>';
        } else {
          svg = '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22"></circle></svg>';
        }
        return '<span class="' + cls + '" data-symbol="' + id + '" style="--sym-size:' + size + 'px;">' + svg + "</span>";
      }
  
      function setPage(next) {
        casino.uiPage = next;
        UI.renderPCCasino(container);
      }
  
      function tabBtn(page, label) {
        var active = (casino.uiPage === page) ? " active" : "";
        return '<button class="casino-tab' + active + '" data-page="' + page + '">' + label + "</button>";
      }
  
      function renderLobby() {
        return [
          '<div class="casino-lobby">',
          '  <div class="casino-hero">',
          '    <div class="casino-hero-title">Welcome to DYZO</div>',
          '    <div class="casino-hero-sub small dim">Neon games, fast rounds, wallet-friendly limits.</div>',
          '    <div class="casino-hero-badges mt-8">',
          '      <span class="casino-pill mono">WALLET $' + safeMoney().toFixed(2) + '</span>',
          '      <span class="casino-pill mono">TOKEN BALANCE $' + safeCasinoBalance().toFixed(2) + '</span>',
          '      <span class="casino-pill mono">SLOTS x' + ((casino.slots && casino.slots.ownedMachines) ? casino.slots.ownedMachines : 0) + '</span>',
          "    </div>",
          "  </div>",
          '  <div class="grid mt-12">',
          '    <div class="card casino-card-panel">',
          '      <div class="card-title">Slots</div>',
          '      <div class="card-section small dim">Spin the neon reels. Owned machines earn from customers.</div>',
          '      <button class="btn btn-small btn-primary casino-nav" data-page="slots">Play slots</button>',
          "    </div>",
          '    <div class="card casino-card-panel">',
          '      <div class="card-title">Blackjack</div>',
          '      <div class="card-section small dim">Beat the dealer. No splits, double down supported.</div>',
          '      <button class="btn btn-small btn-primary casino-nav" data-page="blackjack">Play blackjack</button>',
          "    </div>",
          '    <div class="card casino-card-panel">',
          '      <div class="card-title">Plinko</div>',
          '      <div class="card-section small dim">Drop the ball through neon pegs for a multiplier.</div>',
          '      <button class="btn btn-small btn-primary casino-nav" data-page="plinko">Play plinko</button>',
          "    </div>",
          '    <div class="card casino-card-panel">',
          '      <div class="card-title">Shop</div>',
          '      <div class="card-section small dim">Buy and manage owned slot machines.</div>',
          '      <button class="btn btn-small btn-outline casino-nav" data-page="shop">Open shop</button>',
          "    </div>",
          "  </div>",
          "</div>"
        ].join("");
      }
  
      function renderSlots() {
        var slots = casino.slots || {};
        var owned = (typeof slots.ownedMachines === "number" && isFinite(slots.ownedMachines)) ? slots.ownedMachines : 0;
        var bet = (typeof slots.lastBet === "number" && isFinite(slots.lastBet)) ? slots.lastBet : 10;
        var reels = Array.isArray(slots.lastReels) ? slots.lastReels : ["cherry", "lemon", "star"];
        var maxBet = 250;
        var autoSpinCount = (typeof slots.autoSpinCount === "number" && isFinite(slots.autoSpinCount)) ? Math.floor(slots.autoSpinCount) : 10;
        if (autoSpinCount < 1) autoSpinCount = 1;
        if (autoSpinCount > 500) autoSpinCount = 500;
        var lastNet = (typeof slots.lastNet === "number" && isFinite(slots.lastNet)) ? slots.lastNet : 0;
        var lastPayout = (typeof slots.lastPayout === "number" && isFinite(slots.lastPayout)) ? slots.lastPayout : 0;
        var lastJackpot = (typeof slots.lastJackpot === "number" && isFinite(slots.lastJackpot)) ? slots.lastJackpot : 0;
        var freeSpins = (typeof slots.freeSpins === "number" && isFinite(slots.freeSpins)) ? slots.freeSpins : 0;
        if (freeSpins < 0) freeSpins = 0;
        var lastWasFreeSpin = !!slots.lastWasFreeSpin;
        var dailyStatus = (Game.Casino && Game.Casino.getDailyFreeSpinStatus) ? Game.Casino.getDailyFreeSpinStatus() : null;
        var dailyTarget = dailyStatus ? (dailyStatus.target || 0) : 0;
        var dailyCount = dailyStatus ? (dailyStatus.count || 0) : 0;
        var dailyPct = dailyTarget > 0 ? Math.min(100, Math.floor((dailyCount / dailyTarget) * 100)) : 100;
        var dailyLabel = dailyTarget > 0 ? (dailyCount + " / " + dailyTarget) : "Complete";
  
        var taxJackpot = (Game.Casino && Game.Casino.getTaxJackpotUsd) ? Game.Casino.getTaxJackpotUsd() : ((Game && Game.state && typeof Game.state.taxPoolUsd === "number") ? Game.state.taxPoolUsd : 0);
        if (!isFinite(taxJackpot) || taxJackpot < 0) taxJackpot = 0;
  
        var paytable = (Game.Casino && Game.Casino.getSlotsPaytable) ? Game.Casino.getSlotsPaytable() : [];
        var payRows = paytable.map(function (s) {
          var badge = s.wild ? ' <span class="badge badge-blue badge-pill">WILD</span>' : "";
          return "<tr><td style=\"width:58px;\">" + slotSymbolHtml(s.id, 34) + "</td><td>" + (s.name || "") + badge + "</td><td class=\"mono\">x" + (s.pay2 || 0).toFixed(2) + "</td><td class=\"mono\">x" + (s.pay3 || 0).toFixed(2) + "</td></tr>";
        }).join("");
  
        return [
          '<div class="casino-game">',
          '  <div class="card casino-card-panel">',
          '    <div class="flex-between">',
          '      <div class="card-title">Slots</div>',
          '      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">',
          '        <span class="casino-pill mono">TOKEN BALANCE $' + safeCasinoBalance().toFixed(2) + '</span>',
          '        <span class="small dim">Max bet <span class="mono">$' + maxBet + '</span></span>',
          '        <span class="small dim">Owned <span class="mono">x' + owned + '</span></span>',
          "      </div>",
          "    </div>",
          '    <div class="card-section">',
          '      <div class="casino-slot-machine mt-12" data-mode="house">',
          '        <div class="casino-slot-reels" id="casino-slots-reels">',
          '          <div class="casino-slot-reel"><div class="casino-slot-face" data-reel="0">' + slotSymbolHtml(reels[0]) + "</div></div>",
          '          <div class="casino-slot-reel"><div class="casino-slot-face" data-reel="1">' + slotSymbolHtml(reels[1]) + "</div></div>",
          '          <div class="casino-slot-reel"><div class="casino-slot-face" data-reel="2">' + slotSymbolHtml(reels[2]) + "</div></div>",
          "        </div>",
          '        <div class="casino-slot-controls mt-12">',
          '          <div class="field-row"><span>Bet</span><span><input class="casino-input mono" id="casino-slots-bet" type="number" min="1" step="1" max="' + maxBet + '" value="' + bet + '" style="width:110px;"> <span class="small dim mono">TOKENS</span></span></div>',
          '          <div class="field-row"><span>Auto spins</span><span style="display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap;">' +
            '<input class="casino-input mono" id="casino-slots-auto-count" type="number" min="1" max="500" step="1" value="' + autoSpinCount + '" style="width:110px;">' +
            '<button class="btn btn-small btn-outline" id="casino-slots-auto-start">AUTO</button>' +
            '<button class="btn btn-small btn-outline" id="casino-slots-auto-stop" disabled>STOP</button>' +
            '<span class="small dim" id="casino-slots-auto-status"></span>' +
          "</span></div>",
          '          <div class="field-row"><span>Free spins</span><span class="mono">' + freeSpins + "</span></div>",
          '          <div class="field-row"><span>Daily spins</span><span class="mono">' + dailyLabel + "</span></div>",
          '          <div class="progress" style="flex:1 1 100%;min-width:220px;"><div class="progress-fill violet" style="width:' + dailyPct + '%"></div></div>',
          '          <div class="field-row"><span>Jackpot pool</span><span class="mono">$' + taxJackpot.toFixed(2) + "</span></div>",
          '          <button class="btn btn-small btn-primary" id="casino-slots-spin">SPIN</button>',
          '          <button class="btn btn-small btn-primary" id="casino-slots-free"' + (freeSpins > 0 ? "" : " disabled") + ">FREE SPIN</button>",
          '          <button class="btn btn-small btn-outline" id="casino-slots-manage">Manage machines</button>',
          "        </div>",
          '        <div class="casino-result mt-12" id="casino-slots-result">',
          (lastPayout > 0 || lastJackpot > 0 ? ('<div class="small">' + (lastWasFreeSpin ? '<span class="badge badge-blue badge-pill">FREE</span> ' : '') + (lastJackpot > 0 ? '<span class="badge badge-blue badge-pill">JACKPOT</span> ' : '') + 'Payout <span class="mono">$' + lastPayout.toFixed(2) + '</span>' + (lastJackpot > 0 ? (' â€¢ Jackpot <span class="mono">$' + lastJackpot.toFixed(2) + '</span>') : '') + ' â€¢ Net <span class="mono ' + (lastNet >= 0 ? "casino-good" : "casino-bad") + '">$' + lastNet.toFixed(2) + "</span></div>") : '<div class="small dim">Buy tokens, then spin.</div>'),
          "        </div>",
          "      </div>",
          "    </div>",
          "  </div>",
          '  <div class="mt-12 card casino-card-panel">',
          '    <div class="card-title">Paytable</div>',
          '    <div class="card-section small dim">Wilds (' + slotSymbolHtml("wild", 18) + ') substitute for any symbol. Jackpot triggers on 777 or 3x Wild and pays out the current pool.</div>',
          '    <div class="card-section">',
          '      <table class="table small"><thead><tr><th></th><th>Symbol</th><th>2x</th><th>3x</th></tr></thead><tbody>' + payRows + "</tbody></table>",
          "    </div>",
          "  </div>",
          "</div>"
        ].join("");
      }
  
      function renderBlackjack() {
        var bj = casino.blackjack || {};
        var round = bj.round || null;
        var bet = (typeof bj.lastBet === "number" && isFinite(bj.lastBet)) ? bj.lastBet : 25;
  
        function calcTotal(cards) {
          var sum = 0;
          var aceCount = 0;
          for (var i = 0; i < cards.length; i++) {
            var rank = cards[i].rank;
            if (rank === "A") { aceCount += 1; sum += 11; }
            else if (rank === "K" || rank === "Q" || rank === "J") sum += 10;
            else sum += parseInt(rank, 10);
          }
          while (sum > 21 && aceCount > 0) { sum -= 10; aceCount -= 1; }
          return sum;
        }
  
        function cardHtml(card, hidden) {
          if (hidden) return '<div class="casino-playing-card casino-playing-card-back">ðŸ‚ </div>';
          var text = (card && card.rank ? card.rank : "?") + (card && card.suit ? card.suit : "");
          var red = (card && (card.suit === "â™¥" || card.suit === "â™¦"));
          return '<div class="casino-playing-card' + (red ? " red" : "") + '">' + text + "</div>";
        }
  
        var dealerCardsHtml = "";
        var playerCardsHtml = "";
        var dealerTotalShown = 0;
        var playerTotal = 0;
        var canAct = false;
        var canDouble = false;
  
        if (round && round.player && round.dealer) {
          canAct = (round.status === "playing");
          canDouble = canAct && !!round.canDouble;
          for (var dealerCardIndex = 0; dealerCardIndex < round.dealer.length; dealerCardIndex++) {
            var hide = (!round.dealerRevealed && dealerCardIndex === 1);
            dealerCardsHtml += cardHtml(round.dealer[dealerCardIndex], hide);
          }
          for (var playerCardIndex = 0; playerCardIndex < round.player.length; playerCardIndex++) {
            playerCardsHtml += cardHtml(round.player[playerCardIndex], false);
          }
          playerTotal = calcTotal(round.player);
          if (round.dealerRevealed) dealerTotalShown = calcTotal(round.dealer);
        } else {
          dealerCardsHtml = cardHtml(null, true) + cardHtml(null, true);
          playerCardsHtml = "";
        }
  
        var statusLine = "Place your bet and deal.";
        if (round && round.status === "playing") statusLine = "Hit, stand, or double.";
        if (round && round.status === "settled") {
          statusLine = "Result: " + String(round.settled || "push").toUpperCase() + " â€¢ Net $" + (typeof round.deltaUsd === "number" ? round.deltaUsd.toFixed(2) : "0.00");
        }
  
        return [
          '<div class="casino-game">',
          '  <div class="casino-bj-table">',
          '    <div class="casino-bj-row">',
          '      <div class="casino-bj-label">Dealer <span class="mono dim">' + (round && round.dealerRevealed ? ("(" + dealerTotalShown + ")") : "") + "</span></div>",
          '      <div class="casino-hand">' + dealerCardsHtml + "</div>",
          "    </div>",
          '    <div class="casino-bj-row mt-12">',
          '      <div class="casino-bj-label">You <span class="mono dim">' + (round ? ("(" + playerTotal + ")") : "") + "</span></div>",
          '      <div class="casino-hand">' + playerCardsHtml + "</div>",
          "    </div>",
          '    <div class="casino-result mt-12 small" id="casino-bj-status">' + statusLine + "</div>",
          "  </div>",
          '  <div class="mt-12 card casino-card-panel">',
          '    <div class="field-row"><span>Bet</span><span><input class="casino-input mono" id="casino-bj-bet" type="number" min="1" max="500" step="1" value="' + bet + '" style="width:110px;"> <span class="small dim mono">TOKENS</span></span></div>',
          '    <div class="mt-8">',
          '      <button class="btn btn-small btn-primary" id="casino-bj-deal"' + (canAct ? " disabled" : "") + '>Deal</button>',
          '      <button class="btn btn-small btn-outline" id="casino-bj-hit"' + (canAct ? "" : " disabled") + ">Hit</button>",
          '      <button class="btn btn-small btn-outline" id="casino-bj-stand"' + (canAct ? "" : " disabled") + ">Stand</button>",
          '      <button class="btn btn-small btn-outline" id="casino-bj-double"' + (canDouble ? "" : " disabled") + ">Double</button>",
          '      <button class="btn btn-small btn-outline" id="casino-bj-clear"' + (round ? "" : " disabled") + ">Clear</button>",
          "    </div>",
          "  </div>",
          "</div>"
        ].join("");
      }
  
      function renderPlinko() {
        var plinko = casino.plinko || {};
        var risk = (plinko.risk === "low" || plinko.risk === "medium" || plinko.risk === "high") ? plinko.risk : "medium";
        var bet = (typeof plinko.lastBet === "number" && isFinite(plinko.lastBet)) ? plinko.lastBet : 10;
        var lastNet = (typeof plinko.lastNet === "number" && isFinite(plinko.lastNet)) ? plinko.lastNet : 0;
        var lastMult = (typeof plinko.lastMultiplier === "number" && isFinite(plinko.lastMultiplier)) ? plinko.lastMultiplier : 0;
        var lastBin = (typeof plinko.lastBin === "number" && isFinite(plinko.lastBin)) ? plinko.lastBin : 5;
        var lastPayout = (typeof plinko.lastPayout === "number" && isFinite(plinko.lastPayout)) ? plinko.lastPayout : 0;
  
        var rows = 10;
        var pegHtml = [];
        for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
          var cols = rowIndex + 1;
          for (var colIndex = 0; colIndex < cols; colIndex++) {
            pegHtml.push('<div class="casino-peg" data-row="' + rowIndex + '" data-col="' + colIndex + '"></div>');
          }
        }
  
        return [
          '<div class="casino-game">',
          '  <div class="flex-between">',
          '    <div class="casino-mode">',
          '      <button class="btn btn-small ' + (risk === "low" ? "btn-primary" : "btn-outline") + '" data-plinko-risk="low">Low</button>',
          '      <button class="btn btn-small ' + (risk === "medium" ? "btn-primary" : "btn-outline") + '" data-plinko-risk="medium">Medium</button>',
          '      <button class="btn btn-small ' + (risk === "high" ? "btn-primary" : "btn-outline") + '" data-plinko-risk="high">High</button>',
          "    </div>",
          '    <div class="small dim">Last: bin <span class="mono">' + lastBin + '</span> â€¢ x<span class="mono">' + lastMult.toFixed(2) + '</span> â€¢ Payout <span class="mono">$' + lastPayout.toFixed(2) + '</span> â€¢ Net <span class="mono ' + (lastNet >= 0 ? "casino-good" : "casino-bad") + '">$' + lastNet.toFixed(2) + "</span></div>",
          "  </div>",
          '  <div class="casino-plinko mt-12">',
          '    <div class="casino-plinko-board" id="casino-plinko-board" data-rows="' + rows + '">',
          '      <div class="casino-plinko-glow"></div>',
          '      <div class="casino-plinko-pegs">' + pegHtml.join("") + "</div>",
          '      <div class="casino-plinko-ball" id="casino-plinko-ball"></div>',
          "    </div>",
          "  </div>",
          '  <div class="mt-12 card casino-card-panel">',
          '    <div class="field-row"><span>Bet</span><span><input class="casino-input mono" id="casino-plinko-bet" type="number" min="1" step="1" value="' + bet + '" style="width:110px;"> <span class="small dim mono">TOKENS</span></span></div>',
          '    <div class="mt-8">',
          '      <button class="btn btn-small btn-primary" id="casino-plinko-drop">DROP</button>',
          "    </div>",
          "  </div>",
          "</div>"
        ].join("");
      }
  
      function renderShop() {
        var slots = casino.slots || {};
        var owned = (typeof slots.ownedMachines === "number" && isFinite(slots.ownedMachines)) ? slots.ownedMachines : 0;
        var price = (Game.Casino && Game.Casino.getSlotMachinePriceUsd) ? Game.Casino.getSlotMachinePriceUsd() : 250;
        var machines = (Game.Casino && Game.Casino.getOwnedSlotMachines) ? Game.Casino.getOwnedSlotMachines() : [];
        var owner = (slots.owner && typeof slots.owner === "object") ? slots.owner : {};
        var conf = (typeof owner.confidence === "number" && isFinite(owner.confidence)) ? owner.confidence : 0;
        if (conf < 0) conf = 0;
        if (conf > 1) conf = 1;
        var list = [];
        for (var i = 0; i < machines.length; i++) {
          var m = machines[i];
          if (!m) continue;
          var token = (typeof m.tokenFloatUsd === "number" && isFinite(m.tokenFloatUsd)) ? m.tokenFloatUsd : 0;
          var cash = (typeof m.cashFloatUsd === "number" && isFinite(m.cashFloatUsd)) ? m.cashFloatUsd : 0;
          var target = (typeof m.tokenTargetUsd === "number" && isFinite(m.tokenTargetUsd)) ? m.tokenTargetUsd : 0;
          var staff = (typeof m.staff === "number" && isFinite(m.staff)) ? m.staff : 0;
          list.push(
            '<div class="card mt-8" data-slot-machine="' + String(m.id || "") + '">' +
              '<div class="card-title">' + String(m.name || ("Slot Machine " + (i + 1))) + '</div>' +
              '<div class="card-section small">' +
                '<div class="field-row"><span>Token float</span><span class="mono">$' + token.toFixed(2) + '</span></div>' +
                '<div class="field-row"><span>Cash float</span><span class="mono">$' + cash.toFixed(2) + '</span></div>' +
                '<div class="field-row"><span>Token target</span><span><input class="casino-input mono slot-target" type="number" min="0" step="10" value="' + target.toFixed(0) + '" style="width:120px;"></span></div>' +
                '<div class="field-row"><span>Staff</span><span class="mono">' + staff + '</span></div>' +
                '<div class="mt-8" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
                  '<input class="casino-input mono slot-deposit-tokens" type="number" min="0" step="10" placeholder=\"Tokens $\" style=\"width:120px;\">' +
                  '<button class="btn btn-small btn-outline slot-btn-deposit-tokens">Load tokens</button>' +
                  '<input class="casino-input mono slot-deposit-cash" type="number" min="0" step="10" placeholder=\"Cash $\" style=\"width:120px;\">' +
                  '<button class="btn btn-small btn-outline slot-btn-deposit-cash">Load cash</button>' +
                  '<button class="btn btn-small btn-outline slot-btn-hire">Hire staff</button>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }
        return [
          '<div class="casino-game">',
          '  <div class="card casino-card-panel">',
          '    <div class="card-title">Owned Slot Machines</div>',
          '    <div class="card-section small dim">Customers buy tokens, make bets, and cash out. Load each machine with token float and cash float; staff keeps tokens topped up to the target.</div>',
          '    <div class="field-row"><span>Owned</span><span class="mono">x' + owned + "</span></div>",
          '    <div class="field-row"><span>Customer confidence</span><span class="mono">' + Math.floor(conf * 100) + "%</span></div>",
          '    <div class="field-row"><span>New machine price</span><span class="mono">$' + price + "</span></div>",
          '    <div class="mt-8" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
          '      <button class="btn btn-small btn-primary" id="casino-buy-slot">Buy machine</button>' +
          '      <input class="casino-input mono" id="casino-owner-load-tokens-each" type="number" min="0" step="10" placeholder=\"Tokens $ each\" style=\"width:140px;\">' +
          '      <button class="btn btn-small btn-outline" id="casino-owner-load-tokens-all">Load tokens (all)</button>' +
          '      <input class="casino-input mono" id="casino-owner-load-cash-each" type="number" min="0" step="10" placeholder=\"Cash $ each\" style=\"width:140px;\">' +
          '      <button class="btn btn-small btn-outline" id="casino-owner-load-cash-all">Load cash (all)</button>' +
          '    </div>',
          "  </div>",
          (list.length ? list.join("") : '<div class="small dim mt-12">No machines yet. Buy one to start earning from customers.</div>'),
          "</div>"
        ].join("");
      }
  
      var page = casino.uiPage;
      if (page !== "lobby" && page !== "slots" && page !== "blackjack" && page !== "plinko" && page !== "shop") page = "lobby";
      casino.uiPage = page;
  
      container.innerHTML = [
        '<div class="casino-root">',
        '  <div class="flex-between">',
        '    <div>',
        '      <h2 class="casino-title">ðŸŽ° Casino</h2>',
        '      <div class="small dim">anime.js neon games</div>',
        "    </div>",
        '    <button class="btn btn-small btn-outline" id="pc-casino-back">Back</button>',
        "  </div>",
        '  <div class="casino-bank mt-8">',
        '    <div class="casino-bank-balances">',
        '      <span class="casino-pill mono">WALLET $' + safeMoney().toFixed(2) + '</span>',
        '      <span class="casino-pill mono">TOKEN BALANCE $' + safeCasinoBalance().toFixed(2) + '</span>',
        "    </div>",
        '    <div class="casino-bank-actions mt-8">',
        '      <button class="btn btn-small btn-outline" id="casino-btn-deposit">Buy tokens</button>',
        '      <button class="btn btn-small btn-outline" id="casino-btn-withdraw">Cash out</button>',
        "    </div>",
        "  </div>",
        '  <div class="casino-tabs mt-8">',
        tabBtn("lobby", "Lobby"),
        tabBtn("slots", "Slots"),
        tabBtn("blackjack", "Blackjack"),
        tabBtn("plinko", "Plinko"),
        tabBtn("shop", "Shop"),
        "  </div>",
        '  <div class="casino-panel mt-12">',
        (page === "lobby" ? renderLobby() : (page === "slots" ? renderSlots() : (page === "blackjack" ? renderBlackjack() : (page === "plinko" ? renderPlinko() : renderShop())))),
        "  </div>",
        "</div>"
      ].join("");
  
      if (typeof anime !== "undefined") {
        var panel = container.querySelector(".casino-panel");
        if (panel) {
          anime.remove(panel);
          anime({
            targets: panel,
            opacity: [0, 1],
            translateY: [6, 0],
            duration: 220,
            easing: "easeOutQuad"
          });
        }
      }
  
      function openCasinoTransferModal(kind) {
        if (!UI || !UI.openModalCard) return;
        var isDeposit = (kind === "deposit");
        var max = isDeposit ? safeMoney() : safeCasinoBalance();
        if (!isFinite(max) || max < 0) max = 0;
        var title = isDeposit ? "Buy tokens" : "Cash out tokens";
        var sub = isDeposit ? "Convert wallet money into casino tokens." : "Convert casino tokens back into wallet money.";
  
        var body = [];
        body.push('<div class="card-section small dim">Available: <span class="mono">$' + max.toFixed(2) + "</span></div>");
        body.push('<div class="mt-8"><input class="casino-input mono" id="casino-transfer-amount" type="number" min="0" step="1" value="' + Math.min(100, max).toFixed(0) + '" style="width:180px;"></div>');
        body.push('<div class="mt-8" style="display:flex;flex-wrap:wrap;gap:6px;">');
        [25, 100, 250, 500].forEach(function (amt) {
          body.push('<button class="btn btn-small btn-outline casino-transfer-preset" data-amt="' + amt + '">$' + amt + "</button>");
        });
        body.push('<button class="btn btn-small btn-outline casino-transfer-preset" data-amt="max">MAX</button>');
        body.push("</div>");
  
        var overlay = UI.openModalCard({
          title: title,
          sub: sub,
          bodyHtml: body.join(""),
          actions: [
            { id: "cancel", label: "Cancel", primary: false },
            { id: "confirm", label: title, primary: true }
          ],
          onAction: function (actionId, close, ov) {
            if (actionId === "cancel") {
              close();
              return;
            }
            if (actionId === "confirm") {
              if (!Game.Casino) { close(); return; }
              var input = ov.querySelector("#casino-transfer-amount");
              var val = input ? parseFloat(input.value || "0") : 0;
              var res = isDeposit ? (Game.Casino.depositUsd ? Game.Casino.depositUsd(val) : null) : (Game.Casino.withdrawUsd ? Game.Casino.withdrawUsd(val) : null);
              if (res && !res.ok && res.message) Game.addNotification(res.message);
              close();
              UI.renderPCCasino(container);
            }
          }
        });
  
        if (overlay) {
          overlay.addEventListener("click", function (e) {
            var btn = e.target.closest(".casino-transfer-preset");
            if (!btn) return;
            var amt = btn.getAttribute("data-amt");
            var input2 = overlay.querySelector("#casino-transfer-amount");
            if (!input2) return;
            if (amt === "max") input2.value = String(max.toFixed(0));
            else input2.value = String(parseFloat(amt || "0") || 0);
          });
        }
      }
  
      var backBtn = container.querySelector("#pc-casino-back");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          if (Game && Game.PC && Game.PC.openApp) {
            Game.PC.openApp("internet");
            UI.renderPC();
          }
        });
      }
  
      var tabButtons = container.querySelectorAll(".casino-tab");
      for (var tabIndex = 0; tabIndex < tabButtons.length; tabIndex++) {
        tabButtons[tabIndex].addEventListener("click", function (e) {
          var target = e.currentTarget;
          var next = target && target.getAttribute ? target.getAttribute("data-page") : "lobby";
          setPage(next);
        });
      }
  
      var navButtons = container.querySelectorAll(".casino-nav");
      for (var navIndex = 0; navIndex < navButtons.length; navIndex++) {
        navButtons[navIndex].addEventListener("click", function (e) {
          var next = e.currentTarget && e.currentTarget.getAttribute ? e.currentTarget.getAttribute("data-page") : "lobby";
          setPage(next);
        });
      }
  
      var depositBtn = container.querySelector("#casino-btn-deposit");
      if (depositBtn) {
        depositBtn.addEventListener("click", function () {
          openCasinoTransferModal("deposit");
        });
      }
      var withdrawBtn = container.querySelector("#casino-btn-withdraw");
      if (withdrawBtn) {
        withdrawBtn.addEventListener("click", function () {
          openCasinoTransferModal("withdraw");
        });
      }
  
      if (page === "slots") {
        var manageBtn = container.querySelector("#casino-slots-manage");
        if (manageBtn) {
          manageBtn.addEventListener("click", function () {
            setPage("shop");
          });
        }
  
        var autoCountEl = container.querySelector("#casino-slots-auto-count");
        var autoStartBtn = container.querySelector("#casino-slots-auto-start");
        var autoStopBtn = container.querySelector("#casino-slots-auto-stop");
        var autoStatusEl = container.querySelector("#casino-slots-auto-status");
        var autoStopRequested = false;
        var autoRemainingShown = 0;
        var autoActive = false;
  
        function clampAutoSpinCount(val) {
          var n = typeof val === "number" ? val : parseInt(val, 10);
          if (!isFinite(n)) n = 10;
          n = Math.floor(n);
          if (n < 1) n = 1;
          if (n > 500) n = 500;
          return n;
        }
  
        function setAutoUiState(active, remaining, stopping) {
          autoActive = !!active;
          autoRemainingShown = typeof remaining === "number" && isFinite(remaining) ? Math.max(0, Math.floor(remaining)) : 0;
          if (autoStatusEl) {
            if (stopping) autoStatusEl.textContent = "Stopping...";
            else if (autoActive && autoRemainingShown > 0) autoStatusEl.textContent = "Remaining: " + autoRemainingShown;
            else autoStatusEl.textContent = "";
          }
          if (autoStartBtn) autoStartBtn.disabled = autoActive;
          if (autoCountEl) autoCountEl.disabled = autoActive;
          if (autoStopBtn) autoStopBtn.disabled = !autoActive;
        }
  
        if (autoCountEl) {
          autoCountEl.addEventListener("change", function () {
            var v = clampAutoSpinCount(autoCountEl.value);
            autoCountEl.value = String(v);
            if (Game && Game.state && Game.state.casino && Game.state.casino.slots) {
              Game.state.casino.slots.autoSpinCount = v;
            }
          });
        }
  
        function setSlotsUiDisabled(disabled) {
          var spinBtn2 = container.querySelector("#casino-slots-spin");
          var freeBtn2 = container.querySelector("#casino-slots-free");
          var navEls = container.querySelectorAll(".casino-tab, .casino-nav, #pc-casino-back, #casino-btn-deposit, #casino-btn-withdraw");
          if (spinBtn2) spinBtn2.disabled = !!disabled;
          if (freeBtn2) freeBtn2.disabled = !!disabled;
          if (manageBtn) manageBtn.disabled = !!disabled;
          if (autoStartBtn) autoStartBtn.disabled = !!disabled || autoActive;
          if (autoCountEl) autoCountEl.disabled = !!disabled || autoActive;
          // Allow stopping even while a spin is in progress.
          if (autoStopBtn) autoStopBtn.disabled = !autoActive;
          for (var navIndex2 = 0; navIndex2 < navEls.length; navIndex2++) {
            navEls[navIndex2].disabled = !!disabled;
            navEls[navIndex2].classList.toggle("disabled", !!disabled);
          }
        }
  
        function doSlotsSpin(useFreeSpin, opts) {
          opts = opts || {};
          if (useFreeSpin && !!opts.forceFreeSpin && (!casino.slots || (casino.slots.freeSpins || 0) <= 0)) {
            Game.addNotification("No free spins available.");
            UI.renderPCCasino(container);
            return;
          }
          var betEl = container.querySelector("#casino-slots-bet");
          var betVal = betEl ? parseFloat(betEl.value || "0") : 0;
          if (!Game.Casino || !Game.Casino.beginSlotsSpin || !Game.Casino.completeSlotsSpin) return;
  
          setSlotsUiDisabled(true);
          var begun = Game.Casino.beginSlotsSpin(betVal, "house", useFreeSpin ? { useFreeSpin: true, bypassFreeSpinCheck: !!opts.bypassFreeSpinCheck } : null);
          if (!begun.ok) {
            setSlotsUiDisabled(false);
            setAutoUiState(false, 0, false);
            autoStopRequested = false;
            if (begun.message) Game.addNotification(begun.message);
            UI.renderPCCasino(container);
            return;
          }
          var spinId = begun.spinId;
  
          var reelFaces = container.querySelectorAll(".casino-slot-face");
          var hasAnime = (typeof anime !== "undefined");
          if (!hasAnime || reelFaces.length !== 3) {
            // Fallback: settle immediately.
            Game.Casino.completeSlotsSpin(spinId);
            var fallbackAuto = (begun.starAutoSpins || 0);
            if (fallbackAuto > 0) {
              scheduleAutoSpins(fallbackAuto);
            } else {
              setSlotsUiDisabled(false);
              UI.renderPCCasino(container);
            }
            return;
          }
  
          function setFace(faceEl, symbolId) {
            faceEl.innerHTML = slotSymbolHtml(symbolId);
          }
  
          var spinSymbols = ["lemon", "cherry", "bell", "star", "seven", "diamond", "wild"];
          var machine = container.querySelector(".casino-slot-machine");
          if (machine) machine.classList.add("is-spinning");
  
          var stopDelays = [850, 1050, 1250];
          var finished = [false, false, false];
  
          function scheduleAutoSpins(count, next) {
            var o2 = next || {};
            var remaining = typeof count === "number" && isFinite(count) ? Math.floor(count) : 0;
            if (remaining < 0) remaining = 0;
  
            if (autoStopRequested) {
              setAutoUiState(false, 0, false);
              setSlotsUiDisabled(false);
              UI.renderPCCasino(container);
              return;
            }
            if (o2.autoFromPlayer) {
              if (remaining > 0) setAutoUiState(true, remaining, false);
              else setAutoUiState(false, 0, false);
            }
            if (remaining <= 0) {
              setAutoUiState(false, 0, false);
              setSlotsUiDisabled(false);
              UI.renderPCCasino(container);
              return;
            }
            doSlotsSpin(!!o2.useFreeSpin, {
              bypassFreeSpinCheck: !!o2.bypassFreeSpinCheck,
              autoRemaining: remaining,
              autoFromPlayer: !!o2.autoFromPlayer,
              autoUseFreeSpin: !!o2.useFreeSpin,
              autoBypassFreeSpinCheck: !!o2.bypassFreeSpinCheck
            });
          }
  
          function maybeFinish() {
            if (!finished[0] || !finished[1] || !finished[2]) return;
            var settled = Game.Casino.completeSlotsSpin(spinId);
            if (!settled.ok && settled.message) Game.addNotification(settled.message);
  
            if (machine) machine.classList.remove("is-spinning");
            var totalWin = settled.ok ? (settled.totalWinUsd || 0) : 0;
            var jackpotWin = settled.ok ? (settled.jackpotUsd || 0) : 0;
  
            if (totalWin > 0) {
              if (machine) machine.classList.add("is-win");
              anime({
                targets: machine,
                scale: [1, 1.02, 1],
                duration: 520,
                easing: "easeOutQuad",
                complete: function () {
                  if (machine) machine.classList.remove("is-win");
                  var baseRemaining = opts.autoRemaining || 0;
                  if (baseRemaining > 0) baseRemaining -= 1;
                  var autoAfterWin = baseRemaining + (begun.starAutoSpins || 0);
                  if (autoAfterWin > 0) {
                    scheduleAutoSpins(autoAfterWin, {
                      useFreeSpin: !!opts.autoUseFreeSpin,
                      bypassFreeSpinCheck: !!opts.autoBypassFreeSpinCheck,
                      autoFromPlayer: !!opts.autoFromPlayer
                    });
                  } else {
                    setAutoUiState(false, 0, false);
                    setSlotsUiDisabled(false);
                    UI.renderPCCasino(container);
                  }
                }
              });
              if (jackpotWin > 0) {
                anime({
                  targets: machine,
                  boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 0 40px rgba(255,210,0,0.18)", "0 0 0 rgba(0,0,0,0)"],
                  duration: 700,
                  easing: "easeOutQuad"
                });
              }
              return;
            }
  
            var baseRemaining2 = opts.autoRemaining || 0;
            if (baseRemaining2 > 0) baseRemaining2 -= 1;
            var autoRemaining = baseRemaining2 + (begun.starAutoSpins || 0);
            if (autoRemaining > 0) {
              scheduleAutoSpins(autoRemaining, {
                useFreeSpin: !!opts.autoUseFreeSpin,
                bypassFreeSpinCheck: !!opts.autoBypassFreeSpinCheck,
                autoFromPlayer: !!opts.autoFromPlayer
              });
            } else {
              setAutoUiState(false, 0, false);
              setSlotsUiDisabled(false);
              UI.renderPCCasino(container);
            }
          }
  
          for (var reelIndex = 0; reelIndex < 3; reelIndex++) {
            (function (i) {
              var face = reelFaces[i];
              anime.remove(face);
              var wobble = anime({
                targets: face,
                translateY: [0, -8],
                direction: "alternate",
                loop: true,
                easing: "easeInOutSine",
                duration: 80
              });
  
              var tick = setInterval(function () {
                setFace(face, spinSymbols[Math.floor(Math.random() * spinSymbols.length)]);
              }, 60 + i * 12);
  
              setTimeout(function () {
                clearInterval(tick);
                wobble.pause();
                anime.remove(face);
                setFace(face, begun.reels[i]);
                anime({
                  targets: face,
                  scale: [0.92, 1.06, 1],
                  opacity: [0.75, 1],
                  duration: 420,
                  easing: "easeOutBack",
                  complete: function () {
                    finished[i] = true;
                    maybeFinish();
                  }
                });
              }, stopDelays[i]);
            })(reelIndex);
          }
        }
  
        var spinBtn = container.querySelector("#casino-slots-spin");
        if (spinBtn) {
          spinBtn.addEventListener("click", function () {
            doSlotsSpin(false);
          });
        }
  
        var freeBtn = container.querySelector("#casino-slots-free");
        if (freeBtn) {
          freeBtn.addEventListener("click", function () {
            doSlotsSpin(true, { forceFreeSpin: true });
          });
        }
  
        if (autoStartBtn) {
          autoStartBtn.addEventListener("click", function () {
            var v = clampAutoSpinCount(autoCountEl ? autoCountEl.value : 10);
            if (autoCountEl) autoCountEl.value = String(v);
            if (Game && Game.state && Game.state.casino && Game.state.casino.slots) {
              Game.state.casino.slots.autoSpinCount = v;
            }
            autoStopRequested = false;
            setAutoUiState(true, v, false);
            doSlotsSpin(false, { autoRemaining: v, autoFromPlayer: true, autoUseFreeSpin: false, autoBypassFreeSpinCheck: false });
          });
        }
        if (autoStopBtn) {
          autoStopBtn.addEventListener("click", function () {
            if (!autoActive) return;
            autoStopRequested = true;
            setAutoUiState(true, autoRemainingShown, true);
          });
        }
      }
  
      if (page === "blackjack") {
        var dealBtn = container.querySelector("#casino-bj-deal");
        if (dealBtn) {
          dealBtn.addEventListener("click", function () {
            var betEl = container.querySelector("#casino-bj-bet");
            var betVal = betEl ? parseFloat(betEl.value || "0") : 0;
            if (!Game.Casino || !Game.Casino.startBlackjack) return;
            var res = Game.Casino.startBlackjack(betVal);
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          });
        }
  
        var hitBtn = container.querySelector("#casino-bj-hit");
        if (hitBtn) {
          hitBtn.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.blackjackHit) return;
            Game.Casino.blackjackHit();
            UI.renderPCCasino(container);
          });
        }
  
        var standBtn = container.querySelector("#casino-bj-stand");
        if (standBtn) {
          standBtn.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.blackjackStand) return;
            Game.Casino.blackjackStand();
            UI.renderPCCasino(container);
          });
        }
  
        var doubleBtn = container.querySelector("#casino-bj-double");
        if (doubleBtn) {
          doubleBtn.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.blackjackDouble) return;
            var res = Game.Casino.blackjackDouble();
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          });
        }
  
        var clearBtn = container.querySelector("#casino-bj-clear");
        if (clearBtn) {
          clearBtn.addEventListener("click", function () {
            if (Game.Casino && Game.Casino.clearBlackjack) Game.Casino.clearBlackjack();
            UI.renderPCCasino(container);
          });
        }
  
        if (typeof anime !== "undefined") {
          anime({
            targets: container.querySelectorAll(".casino-playing-card"),
            translateY: [6, 0],
            opacity: [0, 1],
            delay: anime.stagger(35),
            duration: 260,
            easing: "easeOutQuad"
          });
        }
      }
  
      if (page === "plinko") {
        var riskButtons = container.querySelectorAll("[data-plinko-risk]");
        for (var riskIndex = 0; riskIndex < riskButtons.length; riskIndex++) {
          riskButtons[riskIndex].addEventListener("click", function (e) {
            casino.plinko.risk = e.currentTarget.getAttribute("data-plinko-risk");
            UI.renderPCCasino(container);
          });
        }
  
        function setPlinkoBallPosition(ball, x, y) {
          if (!ball) return;
          if (typeof x !== "number" || !isFinite(x)) x = 0;
          if (typeof y !== "number" || !isFinite(y)) y = 0;
          // Important: use translateX/translateY so anime's translateX/translateY animation doesn't stack
          // with a pre-set `translate(...)` transform on DROP.
          ball.style.transform = "";
          ball.style.transform = "translateX(" + x.toFixed(0) + "px) translateY(" + y.toFixed(0) + "px)";
        }
  
        function layoutPegs() {
          var board = container.querySelector("#casino-plinko-board");
          if (!board) return;
          var pegs = board.querySelectorAll(".casino-peg");
          var rows = parseInt(board.getAttribute("data-rows") || "10", 10);
          if (!isFinite(rows) || rows < 1) rows = 10;
          var boardWidth = board.clientWidth || 320;
          var boardHeight = board.clientHeight || 360;
          var topPad = 26;
          var rowGap = (boardHeight - 70) / rows;
          var colGap = boardWidth / (rows + 1);
          for (var ipeg = 0; ipeg < pegs.length; ipeg++) {
            var peg = pegs[ipeg];
            var row = parseInt(peg.getAttribute("data-row") || "0", 10);
            var col = parseInt(peg.getAttribute("data-col") || "0", 10);
            var cols = row + 1;
            var rowY = topPad + row * rowGap;
            var rowWidth = cols * colGap;
            var leftStart = (boardWidth - rowWidth) / 2 + colGap / 2;
            var x = leftStart + col * colGap;
            peg.style.left = x.toFixed(2) + "px";
            peg.style.top = rowY.toFixed(2) + "px";
          }
  
          var ball = board.querySelector("#casino-plinko-ball");
          if (ball) {
            var ballSize = ball.offsetWidth || 14;
            var ballRadius = ballSize / 2;
            var startX = (boardWidth / 2) - ballRadius;
            var startY = 18 - ballRadius;
            setPlinkoBallPosition(ball, startX, startY);
          }
        }
  
        layoutPegs();
        window.setTimeout(layoutPegs, 0);
  
        var dropBtn = container.querySelector("#casino-plinko-drop");
        if (dropBtn) {
          dropBtn.addEventListener("click", function () {
            try {
              var betEl = container.querySelector("#casino-plinko-bet");
              var betVal = betEl ? parseFloat(betEl.value || "0") : 0;
              var risk = (casino.plinko && casino.plinko.risk) ? casino.plinko.risk : "medium";
              if (!Game.Casino || !Game.Casino.dropPlinko) return;
              dropBtn.disabled = true;
  
              var res = Game.Casino.dropPlinko(betVal, risk);
              if (!res.ok) {
                dropBtn.disabled = false;
                if (res.message) Game.addNotification(res.message);
                UI.renderPCCasino(container);
                return;
              }
  
              var board = container.querySelector("#casino-plinko-board");
              var ball = container.querySelector("#casino-plinko-ball");
              if (!board || !ball || typeof anime === "undefined") {
                dropBtn.disabled = false;
                UI.renderPCCasino(container);
                return;
              }
  
              layoutPegs();
              var boardWidth = board.clientWidth || 320;
              var boardHeight = board.clientHeight || 360;
              var rows = res.rows || 10;
              var topPad = 18;
              var rowGap = (boardHeight - 70) / rows;
              var colGap = boardWidth / (rows + 1);
              var stepX = colGap / 2;
  
              var ballSize = ball.offsetWidth || 14;
              var ballRadius = ballSize / 2;
              var x0 = (boardWidth / 2) - ballRadius;
              var y0 = topPad - ballRadius;
              var maxX = Math.max(0, boardWidth - ballSize);
              var maxY = Math.max(0, boardHeight - ballSize);
  
              var x = x0;
              var y = y0;
              var points = [{ x: x0, y: y0 }];
              for (var row = 0; row < res.path.length; row++) {
                var goRight = res.path[row] === 1;
                x += goRight ? stepX : -stepX;
                y += rowGap;
                if (x < 0) x = 0;
                if (x > maxX) x = maxX;
                if (y < 0) y = 0;
                if (y > maxY) y = maxY;
                points.push({ x: x, y: y });
              }
              var endY = (boardHeight - 44) - ballRadius;
              if (endY < 0) endY = 0;
              if (endY > maxY) endY = maxY;
              points.push({ x: x, y: endY });
  
              anime.remove(ball);
              setPlinkoBallPosition(ball, x0, y0);
  
              var tl = anime.timeline({ targets: ball, autoplay: true });
              tl.add({ translateX: x0, translateY: y0, duration: 1, easing: "linear" });
  
              var duration = 240; // starts slow, then accelerates
              for (var pointIndex = 1; pointIndex < points.length; pointIndex++) {
                duration = Math.max(95, duration - 14);
                tl.add({
                  translateX: points[pointIndex].x,
                  translateY: points[pointIndex].y,
                  duration: duration,
                  easing: "linear"
                });
              }
  
              tl.finished.then(function () {
                dropBtn.disabled = false;
                UI.renderPCCasino(container);
              }).catch(function (e) {
                console.error(e);
                dropBtn.disabled = false;
              });
            } catch (e) {
              console.error(e);
              dropBtn.disabled = false;
            }
          });
        }
  
        if (typeof anime !== "undefined") {
          anime({
            targets: container.querySelectorAll(".casino-peg"),
            opacity: [0, 1],
            delay: anime.stagger(6),
            duration: 220,
            easing: "linear"
          });
        }
      }
  
      if (page === "shop") {
        var buy = container.querySelector("#casino-buy-slot");
        if (buy) {
          buy.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.buySlotMachine) return;
            var res = Game.Casino.buySlotMachine();
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          });
        }
  
        var loadTokensAllBtn = container.querySelector("#casino-owner-load-tokens-all");
        if (loadTokensAllBtn) {
          loadTokensAllBtn.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.ownerDepositTokensAll) return;
            var input = container.querySelector("#casino-owner-load-tokens-each");
            var amt = input ? parseFloat(input.value || "0") : 0;
            var res = Game.Casino.ownerDepositTokensAll(amt);
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          });
        }
        var loadCashAllBtn = container.querySelector("#casino-owner-load-cash-all");
        if (loadCashAllBtn) {
          loadCashAllBtn.addEventListener("click", function () {
            if (!Game.Casino || !Game.Casino.ownerDepositCashAll) return;
            var input = container.querySelector("#casino-owner-load-cash-each");
            var amt = input ? parseFloat(input.value || "0") : 0;
            var res = Game.Casino.ownerDepositCashAll(amt);
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          });
        }
  
        function getMachineIdFromEl(el) {
          var card = el && el.closest ? el.closest("[data-slot-machine]") : null;
          return card ? card.getAttribute("data-slot-machine") : null;
        }
  
        container.addEventListener("click", function (e) {
          var t = e.target;
          if (!t || !t.closest) return;
          var id = getMachineIdFromEl(t);
          if (!id) return;
          if (t.closest(".slot-btn-deposit-tokens")) {
            var card = t.closest("[data-slot-machine]");
            var input = card ? card.querySelector(".slot-deposit-tokens") : null;
            var amt = input ? parseFloat(input.value || "0") : 0;
            if (Game.Casino && Game.Casino.ownerDepositTokens) {
              var res = Game.Casino.ownerDepositTokens(id, amt);
              if (!res.ok && res.message) Game.addNotification(res.message);
              UI.renderPCCasino(container);
            }
          } else if (t.closest(".slot-btn-deposit-cash")) {
            var card2 = t.closest("[data-slot-machine]");
            var input2 = card2 ? card2.querySelector(".slot-deposit-cash") : null;
            var amt2 = input2 ? parseFloat(input2.value || "0") : 0;
            if (Game.Casino && Game.Casino.ownerDepositCash) {
              var res2 = Game.Casino.ownerDepositCash(id, amt2);
              if (!res2.ok && res2.message) Game.addNotification(res2.message);
              UI.renderPCCasino(container);
            }
          } else if (t.closest(".slot-btn-hire")) {
            if (Game.Casino && Game.Casino.hireSlotMachineStaff) {
              var res3 = Game.Casino.hireSlotMachineStaff(id, 1);
              if (!res3.ok && res3.message) Game.addNotification(res3.message);
              UI.renderPCCasino(container);
            }
          }
        }, true);
  
        container.addEventListener("change", function (e) {
          var t = e.target;
          if (!t || !t.closest || !t.classList || !t.classList.contains("slot-target")) return;
          var id = getMachineIdFromEl(t);
          if (!id) return;
          if (Game.Casino && Game.Casino.setSlotMachineTokenTarget) {
            var res = Game.Casino.setSlotMachineTokenTarget(id, parseFloat(t.value || "0"));
            if (!res.ok && res.message) Game.addNotification(res.message);
            UI.renderPCCasino(container);
          }
        }, true);
      }
    },
    renderPCPropertyNews: function (container) {
      if (!container) return;
      if (Game.Property && Game.Property.ensureHousingState) Game.Property.ensureHousingState();
      if (Game.Property && Game.Property.ensureHomeOffers) Game.Property.ensureHomeOffers();
      var s = Game.state;
      var offers = Array.isArray(s.homeOffers) ? s.homeOffers : [];
  
      function groupOffersByLocation(list) {
        var map = {};
        for (var i = 0; i < list.length; i++) {
          var o = list[i];
          var loc = o.location || "City Centre";
          if (!map[loc]) map[loc] = [];
          map[loc].push(o);
        }
        return map;
      }
  
      var byLoc = groupOffersByLocation(offers);
      var html = [];
      html.push("<h2>Property News</h2>");
      html.push('<p class="small dim">Browse homes for sale online. Condition affects your max health at home.</p>');
      html.push('<div class="mt-8">');
      html.push('<button class="btn btn-small btn-outline" id="pc-prop-back">Back</button> ');
      html.push('<button class="btn btn-small btn-outline" id="pc-prop-refresh">Refresh listings</button>');
      html.push("</div>");
  
      if (!offers.length) {
        html.push('<div class="mt-8 small dim">No listings right now. Refresh or check back later.</div>');
        container.innerHTML = html.join("");
      } else {
        for (var loc in byLoc) {
          if (!Object.prototype.hasOwnProperty.call(byLoc, loc)) continue;
          html.push('<div class="card mt-8">');
          html.push('<div class="card-title">Homes for sale â€” ' + loc + "</div>");
          html.push('<div class="card-section">');
          html.push('<table class="table"><thead><tr><th>Home</th><th>Condition</th><th>Price</th><th></th></tr></thead><tbody>');
          var rows = byLoc[loc] || [];
          for (var ho = 0; ho < rows.length; ho++) {
            var offer = rows[ho];
            var def = Game.Property.getHomeDef(offer.defId);
            if (!def) continue;
            var cond = Math.max(0, Math.min(100, Math.round(offer.maintenance)));
            var usedBadge = offer.used ? ' <span class="badge badge-blue badge-pill">Used</span>' : "";
            html.push("<tr>");
            html.push("<td>" + def.name + usedBadge + "</td>");
            html.push("<td>" + cond + "%</td>");
            html.push("<td>$" + (offer.buyPrice || 0).toFixed(0) + "</td>");
            html.push('<td><button class="btn btn-small btn-primary pc-home-buy" data-offer="' + offer.key + '">Buy</button></td>');
            html.push("</tr>");
          }
          html.push("</tbody></table>");
          html.push("</div>");
          html.push("</div>");
        }
        container.innerHTML = html.join("");
      }
  
      var backBtn = container.querySelector("#pc-prop-back");
      if (backBtn) {
        backBtn.addEventListener("click", function () {
          if (Game && Game.PC && Game.PC.openApp) {
            Game.PC.openApp("internet");
            UI.renderPC();
          }
        });
      }
      var refreshBtn = container.querySelector("#pc-prop-refresh");
      if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
          if (Game.Property && Game.Property.generateHomeOffers) Game.Property.generateHomeOffers();
          UI.renderPCPropertyNews(container);
        });
      }
  
      var buyBtns = container.querySelectorAll(".pc-home-buy");
      for (var k = 0; k < buyBtns.length; k++) {
        buyBtns[k].addEventListener("click", function (e) {
          var key = (e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute("data-offer") : null;
          if (!key) return;
          var offers2 = Array.isArray(Game.state.homeOffers) ? Game.state.homeOffers : [];
          var offer = null;
          for (var j = 0; j < offers2.length; j++) {
            if (offers2[j].key === key) { offer = offers2[j]; break; }
          }
          if (!offer) return;
          var def = Game.Property.getHomeDef(offer.defId);
          if (!def) return;
          UI.confirmModal({
            title: "Confirm purchase",
            sub: def.name + (offer.used ? " (Used)" : ""),
            confirmLabel: "Buy",
            bodyHtml:
              '<div class="card-section small">' +
              '<div class="field-row"><span>Location</span><span>' + (offer.location || def.location || "-") + "</span></div>" +
              '<div class="field-row"><span>Price</span><span>$' + (offer.buyPrice || 0).toFixed(0) + "</span></div>" +
              '<div class="field-row"><span>Condition</span><span>' + Math.round(offer.maintenance) + "%</span></div>" +
              "</div>",
            onConfirm: function () {
              if (Game.Property && Game.Property.buyHomeOfferOnline) {
                Game.Property.buyHomeOfferOnline(key);
              } else {
                Game.Property.buyHomeOffer(key);
              }
              UI.renderPCPropertyNews(container);
            }
          });
        });
      }
    },
    _downloadModals: {},
    _sanitizeDomId: function (id) {
      return String(id || "").replace(/[^a-zA-Z0-9\-_:.]/g, "_");
    },
    formatDownloadSpeed: function (speedMbps, short) {
      var mbPerSec = (typeof speedMbps === "number" ? speedMbps : 0) / 8;
      if (mbPerSec < 0) mbPerSec = 0;
      var kbPerSec = mbPerSec * 1000;
      var gbPerSec = mbPerSec / 1000;
      if (short) {
        if (mbPerSec >= 1000) return gbPerSec.toFixed(1) + " GB/s";
        if (mbPerSec >= 1) return mbPerSec.toFixed(1) + " MB/s";
        return Math.round(kbPerSec) + " KB/s";
      }
      if (mbPerSec >= 1000) return gbPerSec.toFixed(2) + " GB/s";
      if (mbPerSec >= 1) return mbPerSec.toFixed(2) + " MB/s";
      return Math.round(kbPerSec) + " KB/s";
    },
    formatSizeFromMb: function (mb, unit, decimals) {
      var v = typeof mb === "number" ? mb : parseFloat(mb);
      if (!isFinite(v) || v < 0) v = 0;
      var u = unit || UI.pickSizeUnitFromMb(v);
      var d = typeof decimals === "number" ? decimals : null;
  
      // Keep unit conversions consistent with the rest of the game: 1 MB == 1000 KB, 1 GB == 1000 MB.
      var value = v;
      if (u === "KB") value = v * 1000;
      else if (u === "GB") value = v / 1000;
  
      if (d === null) {
        if (u === "KB") d = 0;
        else if (u === "GB") d = value >= 10 ? 1 : 2;
        else d = value >= 100 ? 0 : (value >= 10 ? 1 : 2);
      }
      return value.toFixed(d) + " " + u;
    },
    pickSizeUnitFromMb: function (mb) {
      var v = typeof mb === "number" ? mb : parseFloat(mb);
      if (!isFinite(v) || v < 0) v = 0;
      if (v >= 1000) return "GB";
      if (v >= 1) return "MB";
      return "KB";
    },
    formatSizeProgressMb: function (currentMb, totalMb) {
      var total = typeof totalMb === "number" ? totalMb : parseFloat(totalMb);
      if (!isFinite(total) || total < 0) total = 0;
      var unit = UI.pickSizeUnitFromMb(total);
      var cur = typeof currentMb === "number" ? currentMb : parseFloat(currentMb);
      if (!isFinite(cur) || cur < 0) cur = 0;
  
      var divisor = (unit === "GB") ? 1000 : (unit === "KB" ? 0.001 : 1);
      if (divisor <= 0) divisor = 1;
      var curV = cur / divisor;
      var totalV = total / divisor;
  
      var decimals = (unit === "KB") ? 0 : (unit === "GB" ? (totalV >= 10 ? 1 : 2) : (totalV >= 100 ? 0 : 1));
      return curV.toFixed(decimals) + " / " + totalV.toFixed(decimals) + " " + unit;
    },
    renderPCDownloadsSidebar: function () {
      var el = document.getElementById("pc-sidebar-downloads");
      if (!el) return;
      var list = (Game && Game.state && Game.state.pc && Array.isArray(Game.state.pc.downloads)) ? Game.state.pc.downloads : [];
      var html = [];
      var shown = 0;
      for (var i = 0; i < list.length; i++) {
        var d = list[i];
        if (!d || d.status !== "downloading") continue;
        shown += 1;
        var pct = 0;
        var right = "";
        if (d.kind === "btc_chain_sync") {
          var denom = Math.max(1, d.totalBlocks || 1);
          pct = Math.floor(((d.syncedBlocks || 0) / denom) * 100);
          var written = typeof d.writtenMb === "number" ? d.writtenMb : 0;
          right = (d.syncedBlocks || 0) + "/" + denom + " blocks â€¢ " + UI.formatSizeFromMb(written) + " â€¢ " + UI.formatDownloadSpeed(d.speedMbps || 0, true);
        } else {
          var denomMb = Math.max(0.000001, d.totalMb || 1);
          pct = Math.floor(((d.downloadedMb || 0) / denomMb) * 100);
          right = UI.formatSizeProgressMb((d.downloadedMb || 0), denomMb) + " â€¢ " + pct + "% â€¢ " + UI.formatDownloadSpeed(d.speedMbps || 0, true);
        }
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        html.push(
          '<button class="btn btn-small btn-outline pc-download-btn" data-download-id="' + d.id + '">' +
            '<div class="pc-dl-row"><span class="pc-dl-name">' + (d.name || d.id) + '</span><span class="pc-dl-right">' + right + '</span></div>' +
            '<div class="pc-dl-mini"><div class="pc-dl-mini-fill" style="width:' + pct + '%"></div></div>' +
          "</button>"
        );
      }
      if (shown === 0) {
        html.push('<div class="small dim pc-sidebar-empty">No active downloads.</div>');
      }
      el.innerHTML = html.join("");
    },
    renderPCProcessesSidebar: function () {
      var el = document.getElementById("pc-sidebar-processes");
      if (!el) return;
      var html = [];
      var shown = 0;
  
      // PC mining process
      if (Game.state && Game.state.btc && Game.state.btc.pcMiner && Game.state.btc.pcMiner.isOn) {
        var p = Game.state.btc.pcMiner;
        var cpuPct = 18 + (p.cpuLevel || 0) * 7 + (p.gpuLevel || 0) * 10 + (p.softwareLevel || 0) * 4;
        cpuPct = cpuPct * (0.85 + Math.random() * 0.3);
        if (cpuPct > 98) cpuPct = 98;
        var ramMb = 380 + (p.gpuLevel || 0) * 260 + (p.softwareLevel || 0) * 90;
        ramMb = ramMb * (0.9 + Math.random() * 0.2);
        html.push(
          '<button class="btn btn-small btn-outline pc-proc-btn" data-app="pcminer">' +
            '<div class="pc-dl-row"><span class="pc-dl-name">PC Miner</span><span class="pc-dl-right">' + cpuPct.toFixed(0) + '% CPU â€¢ ' + Math.round(ramMb) + ' MB</span></div>' +
          "</button>"
        );
        shown += 1;
      }
  
      // AntiVirus process
      if (Game.state && Game.state.pc && Game.state.pc.antivirus && Game.state.pc.antivirus.isOn) {
        var a = Game.state.pc.antivirus;
        html.push(
          '<button class="btn btn-small btn-outline pc-proc-btn" data-app="antivirus">' +
            '<div class="pc-dl-row"><span class="pc-dl-name">AntiVirus</span><span class="pc-dl-right">' + (a.cpuPct || 0).toFixed(0) + '% CPU â€¢ ' + Math.round(a.ramMb || 0) + ' MB</span></div>' +
          "</button>"
        );
        shown += 1;
      }
  
      if (shown === 0) {
        html.push('<div class="small dim pc-sidebar-empty">No active processes.</div>');
      }
      el.innerHTML = html.join("");
    },
    openDownloadModal: function (downloadId) {
      if (!downloadId) return;
      // In the PC desktop, downloads are windows (draggable/resizable) rather than modals.
      if (Game && Game.state && Game.state.pc && Game.state.pc.isOpen && Game.PC && Game.PC.openDownload) {
        Game.PC.openDownload(downloadId);
        if (UI && UI.renderPC) UI.renderPC();
        return;
      }
      if (!Game || !Game.Downloads || !Game.Downloads.getById) return;
      var d = Game.Downloads.getById(downloadId);
      if (!d) return;
      if (UI._downloadModals[downloadId]) return;
  
      var sid = UI._sanitizeDomId(downloadId);
      var isChain = d.kind === "btc_chain_sync";
      var overlay = UI.openModalCard({
        title: "Download",
        sub: d.name || d.id,
        noClose: true,
        headerButtons: [{ id: "minimize", label: "Minimise" }, { id: "cancel", label: "Cancel" }],
        bodyHtml:
          '<div class="card-section small">' +
            '<div class="field-row"><span>Status</span><span id="dl-status-' + sid + '">Downloading</span></div>' +
            '<div class="field-row"><span>Speed</span><span class="mono" id="dl-speed-' + sid + '">-</span></div>' +
            '<div class="field-row"><span>Progress</span><span class="mono" id="dl-progress-' + sid + '">-</span></div>' +
            (isChain ? ('<div class="field-row"><span>Downloaded</span><span class="mono" id="dl-size-' + sid + '">-</span></div>') : '') +
            '<div class="progress mt-4"><div id="dl-bar-' + sid + '" class="progress-fill" style="width:0%"></div></div>' +
            (isChain
              ? ('<div class="field-row mt-4"><span>Current block</span><span class="mono" id="dl-block-progress-' + sid + '">-</span></div>' +
                 '<div class="progress mt-4"><div id="dl-block-bar-' + sid + '" class="progress-fill" style="width:0%"></div></div>')
              : '') +
            '<div class="field-row mt-4"><span>Disk free</span><span class="mono" id="dl-disk-' + sid + '">-</span></div>' +
          "</div>",
        onHeaderAction: function (actionId, close) {
          if (actionId === "cancel") {
            if (Game && Game.Downloads && Game.Downloads.cancel) {
              Game.Downloads.cancel(downloadId);
            }
            close();
            delete UI._downloadModals[downloadId];
            UI.renderPCDownloadsSidebar();
            return;
          }
          if (actionId !== "minimize") return;
          if (Game && Game.Downloads && Game.Downloads.minimize) Game.Downloads.minimize(downloadId);
          close();
          delete UI._downloadModals[downloadId];
          UI.renderPCDownloadsSidebar();
        }
      });
  
      if (overlay) {
        overlay._downloadId = downloadId;
        UI._downloadModals[downloadId] = overlay;
        UI.updateDownloadsDynamic();
      }
    },
    minimizeAllDownloadModals: function () {
      if (!UI._downloadModals) return;
      for (var id in UI._downloadModals) {
        if (!Object.prototype.hasOwnProperty.call(UI._downloadModals, id)) continue;
        var overlay = UI._downloadModals[id];
        if (Game && Game.Downloads && Game.Downloads.minimize) {
          Game.Downloads.minimize(id);
        }
        if (overlay && overlay._closeModal) overlay._closeModal();
        delete UI._downloadModals[id];
      }
    },
    updateDownloadsDynamic: function () {
      if (!Game || !Game.Downloads || !Game.Downloads.getById) return;
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      for (var id in UI._downloadModals) {
        if (!Object.prototype.hasOwnProperty.call(UI._downloadModals, id)) continue;
        var overlay = UI._downloadModals[id];
        var d = Game.Downloads.getById(id);
        if (!overlay) continue;
        if (!d) {
          if (overlay._closeModal) overlay._closeModal();
          delete UI._downloadModals[id];
          continue;
        }
        var sid = UI._sanitizeDomId(id);
        var statusEl = document.getElementById("dl-status-" + sid);
        var speedEl = document.getElementById("dl-speed-" + sid);
        var progressEl = document.getElementById("dl-progress-" + sid);
        var sizeEl = document.getElementById("dl-size-" + sid);
        var barEl = document.getElementById("dl-bar-" + sid);
        var blockProgEl = document.getElementById("dl-block-progress-" + sid);
        var blockBarEl = document.getElementById("dl-block-bar-" + sid);
        var diskEl = document.getElementById("dl-disk-" + sid);
        if (statusEl) statusEl.textContent = d.status === "downloading" ? "Downloading" : "Complete";
        if (speedEl) speedEl.textContent = UI.formatDownloadSpeed(d.speedMbps || 0, false);
        if (diskEl) diskEl.textContent = UI.formatSizeProgressMb(free, cap);
  
        var pct = 0;
        if (d.kind === "btc_chain_sync") {
          var denom = Math.max(1, d.totalBlocks || 1);
          pct = Math.floor(((d.syncedBlocks || 0) / denom) * 10000) / 100;
          if (progressEl) progressEl.textContent = (d.syncedBlocks || 0) + " / " + denom + " blocks â€¢ " + pct + "%";
          if (sizeEl) {
            var written = typeof d.writtenMb === "number" ? d.writtenMb : 0;
            var cur = (typeof d.currentBlockSizeMb === "number" && d.currentBlockSizeMb > 0) ? d.currentBlockSizeMb : null;
            sizeEl.textContent = UI.formatSizeFromMb(written) + (cur ? (" â€¢ block " + UI.formatSizeFromMb(cur)) : "");
          }
          if (blockProgEl || blockBarEl) {
            var curSize = (typeof d.currentBlockSizeMb === "number" && d.currentBlockSizeMb > 0) ? d.currentBlockSizeMb : null;
            var blockPct = 0;
            if (curSize) {
              blockPct = Math.floor((Math.min(curSize, Math.max(0, d.bufferMb || 0)) / curSize) * 10000) / 100;
            } else if (d.status !== "downloading") {
              blockPct = 100;
            }
            if (blockProgEl) blockProgEl.textContent = blockPct + "%";
            if (blockBarEl) blockBarEl.style.width = Math.max(0, Math.min(100, blockPct)) + "%";
          }
        } else {
          var denomMb = Math.max(0.000001, d.totalMb || 1);
          pct = Math.floor(((d.downloadedMb || 0) / denomMb) * 10000) / 100;
          if (progressEl) progressEl.textContent = UI.formatSizeProgressMb((d.downloadedMb || 0), denomMb) + " â€¢ " + pct + "%";
        }
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        if (barEl) barEl.style.width = pct + "%";
      }

      // Download windows (draggable PC windows): appId "download:<id>".
      if (Game && Game.state && Game.state.pc && Array.isArray(Game.state.pc.windows)) {
        for (var wi = Game.state.pc.windows.length - 1; wi >= 0; wi--) {
          var w = Game.state.pc.windows[wi];
          if (!w || !w.appId || String(w.appId).indexOf("download:") !== 0) continue;
          var did = String(w.appId).replace(/^download:/, "");
          var dd = Game.Downloads.getById(did);
          if (!dd) {
            if (Game.PC && Game.PC.closeWindow) Game.PC.closeWindow(w.id);
            continue;
          }
          w.title = "Download \u2014 " + String(dd.name || dd.id || did);

          var sid = UI._sanitizeDomId(did) + "-" + UI._sanitizeDomId("pc-win-content-" + w.id);
          var statusEl = document.getElementById("dlw-status-" + sid);
          var speedEl = document.getElementById("dlw-speed-" + sid);
          var progressEl = document.getElementById("dlw-progress-" + sid);
          var sizeEl = document.getElementById("dlw-size-" + sid);
          var barEl = document.getElementById("dlw-bar-" + sid);
          var blockProgEl = document.getElementById("dlw-block-progress-" + sid);
          var blockBarEl = document.getElementById("dlw-block-bar-" + sid);
          var diskEl = document.getElementById("dlw-disk-" + sid);

          if (statusEl) statusEl.textContent = dd.status === "downloading" ? "Downloading" : "Complete";
          if (speedEl) speedEl.textContent = UI.formatDownloadSpeed(dd.speedMbps || 0, false);
          if (diskEl) diskEl.textContent = UI.formatSizeProgressMb(free, cap);

          var pct = 0;
          if (dd.kind === "btc_chain_sync") {
            var denom = Math.max(1, dd.totalBlocks || 1);
            pct = Math.floor(((dd.syncedBlocks || 0) / denom) * 10000) / 100;
            if (progressEl) progressEl.textContent = (dd.syncedBlocks || 0) + " / " + denom + " blocks \u2022 " + pct + "%";
            if (sizeEl) {
              var written = typeof dd.writtenMb === "number" ? dd.writtenMb : 0;
              var cur = (typeof dd.currentBlockSizeMb === "number" && dd.currentBlockSizeMb > 0) ? dd.currentBlockSizeMb : null;
              sizeEl.textContent = UI.formatSizeFromMb(written) + (cur ? (" \u2022 block " + UI.formatSizeFromMb(cur)) : "");
            }
            if (blockProgEl || blockBarEl) {
              var curSize = (typeof dd.currentBlockSizeMb === "number" && dd.currentBlockSizeMb > 0) ? dd.currentBlockSizeMb : null;
              var blockPct = 0;
              if (curSize) {
                blockPct = Math.floor((Math.min(curSize, Math.max(0, dd.bufferMb || 0)) / curSize) * 10000) / 100;
              } else if (dd.status !== "downloading") {
                blockPct = 100;
              }
              if (blockProgEl) blockProgEl.textContent = blockPct + "%";
              if (blockBarEl) blockBarEl.style.width = Math.max(0, Math.min(100, blockPct)) + "%";
            }
          } else {
            var denomMb = Math.max(0.000001, dd.totalMb || 1);
            pct = Math.floor(((dd.downloadedMb || 0) / denomMb) * 10000) / 100;
            if (progressEl) progressEl.textContent = UI.formatSizeProgressMb((dd.downloadedMb || 0), denomMb) + " \u2022 " + pct + "%";
            if (sizeEl) sizeEl.textContent = UI.formatSizeFromMb(dd.totalMb || denomMb);
          }
          if (pct < 0) pct = 0;
          if (pct > 100) pct = 100;
          if (barEl) barEl.style.width = pct + "%";
        }
      }
  
      if (Game.state && Game.state.pc && Game.state.pc.isOpen) {
        UI.renderPCProcessesSidebar();
        UI.renderPCDownloadsSidebar();
      }
    },
    renderPCWallet: function (container) {
      var w = Game.state.btc.wallet;
      var totalBtc = Game.state.btcBalance + Game.state.unconfirmedBtc;
      var networkHeight = (Game.Btc && Game.Btc.getNetworkHeight) ? Game.Btc.getNetworkHeight() : (w.targetHeight || 0);
      var needsSync = !!(w.isInstalled && (w.chainHeight || 0) < (networkHeight || 0));
      var syncLabel = w.isInstalled ? (w.isSyncing ? "Syncing blockchain..." : (needsSync ? "Not synced" : "Synced")) : "Client not installed";
      var overallPct = 0;
      if (w.isInstalled) {
        var denom = Math.max(1, (w.targetHeight || networkHeight || 1));
        overallPct = Math.floor((Math.min(denom, Math.max(0, w.chainHeight || 0)) / denom) * 10000) / 100;
      }
      var cap = Game.PCStorage ? Game.PCStorage.getCapacityMb() : 0;
      var free = Game.PCStorage ? Game.PCStorage.getFreeMb() : 0;
      var dl = (w && w.syncDownloadId && Game.Downloads && Game.Downloads.getById) ? Game.Downloads.getById(w.syncDownloadId) : null;
      var sessionBlocks = "";
      var blockPct = 0;
      if (dl && dl.kind === "btc_chain_sync") {
        sessionBlocks = (dl.syncedBlocks || 0) + " / " + Math.max(1, dl.totalBlocks || 1) + " blocks";
        var curSize = (typeof dl.currentBlockSizeMb === "number" && dl.currentBlockSizeMb > 0) ? dl.currentBlockSizeMb : null;
        if (curSize) {
          blockPct = Math.floor((Math.min(curSize, Math.max(0, dl.bufferMb || 0)) / curSize) * 10000) / 100;
        }
      } else if (w.isInstalled) {
        sessionBlocks = (w.chainHeight || 0) + " / " + Math.max(1, (w.targetHeight || networkHeight || 1)) + " blocks";
        blockPct = overallPct;
      }
      container.innerHTML = [
        '<h2>BTC Wallet</h2>',
        '<p class="small dim">Download a wallet client, then synchronise when you choose. Sync progresses block-by-block and is affected by network and disk.</p>',
        '<div class="mt-8">',
        '  <div class="field-row"><span>Status</span><span>' + syncLabel + '</span></div>',
        '  <div class="field-row"><span>Disk free</span><span class="mono">' + UI.formatSizeProgressMb(free, cap) + '</span></div>',
        '  <div class="field-row"><span>Auto-sync</span><span><label class="small"><input type="checkbox" id="wallet-auto-sync-daily"' + (w.autoSyncDaily ? ' checked' : '') + '> Sync wallet at end of day</label></span></div>',
        (w.isInstalled ? ('  <div class="field-row"><span>Blocks</span><span class="mono" id="wallet-sync-blocks">' + sessionBlocks + '</span></div>') : ''),
        (w.isInstalled ? ('  <div class="field-row"><span>Overall</span><span class="mono" id="wallet-overall-pct">' + overallPct + '%</span></div>') : ''),
        (w.isInstalled ? ('  <div class="field-row"><span>Current block</span><span id="wallet-sync-label">' + blockPct + '%</span></div>') : ''),
        (w.isInstalled ? ('  <div class="progress mt-4"><div id="wallet-sync-bar" class="progress-fill" style="width:' + blockPct + '%"></div></div>') : ''),
        (w.isInstalled ? ('  <div class="field-row mt-4"><span>Chain height</span><span class="mono" id="wallet-height">' + (w.chainHeight || 0) + " \u2192 " + (w.targetHeight || networkHeight || 0) + '</span></div>') : ''),
        '  <div class="field-row"><span>Confirmed balance</span><span class="mono">' + UI.formatBtcHtml(Game.state.btcBalance) + '</span></div>',
        '  <div class="field-row"><span>Total incl. unconfirmed</span><span class="mono" id="wallet-total-btc">' + UI.formatBtcHtml(totalBtc) + '</span></div>',
        '  <div class="mt-8">',
        (w.isInstalled
          ? ('    <button class="btn btn-small btn-primary" id="btn-start-wallet-sync"' + (needsSync && !w.isSyncing ? '' : ' disabled') + '>Start sync</button> ' +
             '')
          : '    <button class="btn btn-small btn-primary" id="btn-download-wallet">Download wallet client</button>'),
        '  </div>',
        '</div>'
      ].join("");
      var dlBtn = container.querySelector("#btn-download-wallet");
      if (dlBtn) {
        dlBtn.addEventListener("click", function () {
          if (Game.Btc && Game.Btc.startWalletDownload) {
            Game.Btc.startWalletDownload();
            if (Game && Game.PC && Game.PC.openDownload) Game.PC.openDownload("btc-wallet-client");
            else UI.openDownloadModal("btc-wallet-client");
            UI.renderPCWallet(container);
          }
        });
      }
      var syncBtn = container.querySelector("#btn-start-wallet-sync");
      if (syncBtn) {
        syncBtn.addEventListener("click", function () {
          if (Game.Btc && Game.Btc.startWalletSync) {
            Game.Btc.startWalletSync();
            UI.renderPCWallet(container);
            var w3 = Game.state.btc.wallet;
            if (w3 && w3.syncDownloadId) {
              if (Game && Game.PC && Game.PC.openDownload) Game.PC.openDownload(w3.syncDownloadId);
              else UI.openDownloadModal(w3.syncDownloadId);
            }
          }
        });
      }
      var autoSyncEl = container.querySelector("#wallet-auto-sync-daily");
      if (autoSyncEl) {
        autoSyncEl.addEventListener("change", function () {
          if (w) w.autoSyncDaily = !!this.checked;
        });
      }
      if (w && w.syncDownloadId) {
        var d0 = Game.Downloads && Game.Downloads.getById ? Game.Downloads.getById(w.syncDownloadId) : null;
        if (d0 && d0.status === "downloading" && !d0.minimized) {
          if (Game && Game.PC && Game.PC.openDownload) Game.PC.openDownload(w.syncDownloadId);
          else UI.openDownloadModal(w.syncDownloadId);
        }
      }
    },
    renderPCInventory: function (container) {
      var groups = (Game.Inventory && Game.Inventory.getGroupedInventory) ? Game.Inventory.getGroupedInventory(true) : [];
      var html = [];
      html.push('<h2>Inventory</h2>');
      if (!groups || groups.length === 0) {
        html.push('<p class="small dim">You have no items or meals yet. Buy equipment from shops or online, or purchase daily meals.</p>');
      } else {
        html.push('<p class="small dim">All items and meals currently owned by your character. Some special items can be used directly from this screen.</p>');
        html.push('<div class="mt-4">');
        html.push('<table class="table"><thead><tr><th>Item</th><th>Type</th><th>Source</th><th>Qty</th><th>Action</th></tr></thead><tbody>');
        for (var i = 0; i < groups.length; i++) {
          var g = groups[i];
          var actionHtml = "";
          var useId = g.useId || g.id;
          if (!g.isMeal && useId && Game.Inventory && Game.Inventory.canUseItem && Game.Inventory.canUseItem(useId)) {
            actionHtml = '<button class="btn btn-small btn-outline btn-inv-use" data-item-id="' + useId + '">Use</button>';
          }
          html.push('<tr>');
          html.push('<td>' + g.name + '</td>');
          html.push('<td>' + (g.type || "-") + '</td>');
          html.push('<td>' + (g.source || "-") + '</td>');
          html.push('<td>' + (g.count || 0) + '</td>');
          html.push('<td>' + actionHtml + '</td>');
          html.push('</tr>');
        }
        html.push('</tbody></table>');
        html.push('</div>');
      }
      container.innerHTML = html.join("");
      var useButtons = container.querySelectorAll(".btn-inv-use");
      for (var j = 0; j < useButtons.length; j++) {
        useButtons[j].addEventListener("click", function (e) {
          var id = this.getAttribute("data-item-id");
          if (!id || !Game.Inventory || !Game.Inventory.useItem) return;
          var used = Game.Inventory.useItem(id);
          if (used) {
            UI.renderPCInventory(container);
          }
        });
      }
    },
    renderPCMining: function (container) {
      var m = Game.state.btc.mining;
      var nextRigCost = 2200 + m.rigsOwned * 400;
      var suiteLvl = (Game.state.btc && typeof Game.state.btc.minerSoftwareLevel === "number") ? Game.state.btc.minerSoftwareLevel : 0;
      if (!isFinite(suiteLvl) || suiteLvl < 0) suiteLvl = 0;
      var suiteMult = 1 + suiteLvl * 0.12;
      var rigHash = (m.rigHashrate || 0) * suiteMult;
      container.innerHTML = [
        '<h2>Mining Rig Control</h2>',
        '<p class="small dim">Manage physical BTC mining rigs from this console.</p>',
        '<div class="mt-8">',
        '<div class="field-row"><span>Rigs owned</span><span>' + m.rigsOwned + '</span></div>',
        '<div class="field-row"><span>Rig hashrate</span><span>' + rigHash.toFixed(2) + ' h/s per rig <span class="small dim">(base ' + (m.rigHashrate || 0) + ' Æ’?Â½ suite +' + Math.round((suiteMult - 1) * 100) + '%)</span></span></div>',
        '<div class="field-row"><span>Software suite</span><span class="mono">L' + suiteLvl + ' (applies to PC Miner Æ’?Â½ Rigs)</span></div>',
        '<div class="field-row"><span>Power status</span><span>' + (m.isPowerOn ? "ON" : "OFF") + '</span></div>',
        '<div class="field-row"><span>Estimated BTC/hour</span><span>' + UI.formatBtcHtml(m.rigsOwned * rigHash * 0.0000021) + '</span></div>',
        '<div class="mt-8">',
        '<button class="btn btn-small btn-primary" id="pc-btn-buy-rig" title="Costs $' + nextRigCost.toFixed(0) + ' (base $2200 + $400 per rig already owned).">Buy new rig</button> ',
        '<button class="btn btn-small btn-outline" id="pc-btn-toggle-rig">Toggle rig power</button>',
        '</div>',
        '</div>'
      ].join("");
      container.querySelector("#pc-btn-buy-rig").addEventListener("click", function () {
        Game.Btc.buyRig();
        UI.renderPCMining(container);
      });
      container.querySelector("#pc-btn-toggle-rig").addEventListener("click", function () {
        Game.Btc.toggleRigPower();
        UI.renderPCMining(container);
      });
    },
    renderPCCloud: function (container) {
      var cs = Game.state.btc.cloud.contracts;
      var html = [];
      html.push('<h2>Cloud Mining Contracts</h2>');
      html.push('<p class="small dim">Contracts purchased here will pay a fixed BTC amount each in-game day until expiry.</p>');
      if (cs.length === 0) {
        html.push('<p class="small dim mt-4">No active contracts yet.</p>');
      } else {
        html.push('<div class="mt-4">');
        html.push('<table class="table"><thead><tr><th>ID</th><th>Tier</th><th>Days left</th><th>Daily BTC</th></tr></thead><tbody>');
        for (var i = 0; i < cs.length; i++) {
          var c = cs[i];
          html.push('<tr><td>' + c.id + '</td><td>' + c.tier + '</td><td>' + c.daysLeft + '</td><td>' + c.dailyBtc.toFixed(8) + '</td></tr>');
        }
        html.push('</tbody></table>');
        html.push('</div>');
      }
      html.push('<div class="mt-8 chip-row">');
      html.push('<span class="badge badge-blue badge-pill">Buy contracts via Online Market â†’ Cloud Contracts.</span>');
      html.push('</div>');
      container.innerHTML = html.join("");
    },
    renderPCMarket: function (container) {
        if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
        var selectedCoin = (Game.state && Game.state.pc && typeof Game.state.pc.marketCoin === "string") ? Game.state.pc.marketCoin : "BTC";
        selectedCoin = String(selectedCoin || "BTC").toUpperCase();
        if (Game.Crypto && Game.Crypto.getCoinIds) {
          var allowed = Game.Crypto.getCoinIds();
          var ok = false;
          for (var ai = 0; ai < allowed.length; ai++) {
            if (allowed[ai] === selectedCoin) { ok = true; break; }
          }
          if (!ok) selectedCoin = "BTC";
        } else {
          if (selectedCoin !== "BTC" && selectedCoin !== "LTC" && selectedCoin !== "DOGE" && selectedCoin !== "SOL" && selectedCoin !== "MATIC" && selectedCoin !== "USDT") selectedCoin = "BTC";
        }
  
        if (selectedCoin !== "BTC") {
          var exAlt = (Game.Crypto && Game.Crypto.getExchange) ? Game.Crypto.getExchange(selectedCoin) : null;
          var priceAlt = exAlt && exAlt.priceUsd ? exAlt.priceUsd : 0;
          var histAlt = (exAlt && exAlt.priceHistory) ? exAlt.priceHistory.slice(-12) : [];
          var tradesAlt = (exAlt && exAlt.recentTrades) ? exAlt.recentTrades : [];
          if (!histAlt || histAlt.length === 0) {
            var dayAlt = Game.state.day || 1;
            var minutesAlt = Game.state.timeMinutes || 0;
            var currentHourAlt = Math.floor(minutesAlt / 60);
            var syntheticAlt = [];
            for (var ii = 5; ii >= 0; ii--) {
              var hourAlt = currentHourAlt - (5 - ii);
              var dAlt = dayAlt;
              while (hourAlt < 0) {
                hourAlt += 24;
                dAlt -= 1;
                if (dAlt < 1) { dAlt = 1; break; }
              }
              var minuteOfDayAlt = hourAlt * 60;
              syntheticAlt.push({
                key: dAlt * (24 * 60) + minuteOfDayAlt,
                day: dAlt,
                hour: hourAlt,
                minutes: minuteOfDayAlt,
                price: Math.max(1, priceAlt + (Math.random() - 0.5) * (priceAlt * 0.06))
              });
            }
            histAlt = syntheticAlt;
          }
          var balAlt = (Game.Crypto && Game.Crypto.getBalance) ? Game.Crypto.getBalance(selectedCoin) : 0;
          var htmlAlt = [];
          htmlAlt.push('<h2>Crypto Exchange</h2>');
          htmlAlt.push('<div class="small dim">Trade multiple cryptocurrencies. BTC supports the full order book; other coins use market orders.</div>');
          htmlAlt.push('<div class="mt-4">');
          var coinIds = (Game.Crypto && Game.Crypto.getCoinIds) ? Game.Crypto.getCoinIds() : ["BTC", "LTC", "DOGE", "SOL", "MATIC", "USDT"];
          htmlAlt.push('<div class="field-row"><span>Currency</span><span><select id="pc-market-coin" style="padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">' +
            coinIds.map(function (id) { return '<option value="' + id + '"' + (selectedCoin === id ? " selected" : "") + '>' + id + '</option>'; }).join("") +
            '</select></span></div>');
          htmlAlt.push('</div>');
          htmlAlt.push('<div class="mt-4">');
          htmlAlt.push('<div class="card">');
          htmlAlt.push('<div class="card-title">Spot Price & History</div>');
          htmlAlt.push('<div class="card-section">');
          var dec = (selectedCoin === "DOGE" || selectedCoin === "MATIC" || selectedCoin === "USDT") ? 4 : 2;
          htmlAlt.push('<div class="field-row"><span>Spot price</span><span id="pc-spot-price" class="mono">$' + priceAlt.toFixed(dec) + ' / ' + selectedCoin + '</span></div>');
          htmlAlt.push('<div class="field-row"><span>Your ' + selectedCoin + '</span><span class="mono" id="pc-alt-balance">' + balAlt.toFixed(8) + '</span></div>');
          htmlAlt.push('<div class="field-row"><span>Your cash</span><span class="mono">$' + Game.state.money.toFixed(2) + '</span></div>');
          htmlAlt.push('</div>');
          htmlAlt.push('<div class="card-section">');
          htmlAlt.push('<div id="pc-market-chart" style="width:100%;height:180px;"></div>');
          htmlAlt.push('</div>');
          htmlAlt.push('</div>');
          htmlAlt.push('</div>');
          htmlAlt.push('<div class="card mt-8">');
          htmlAlt.push('<div class="card-title">Market order</div>');
          htmlAlt.push('<div class="card-section small dim">Buy with USD or sell your coin at the current spot price.</div>');
          htmlAlt.push('<div class="card-section">');
          htmlAlt.push('<div class="field-row small"><span>Buy (USD)</span><span><input id="alt-buy-usd" class="input-small" type="number" min="1" step="1" placeholder="Amount"> <button class="btn btn-small btn-primary" id="alt-buy-btn">Buy</button> <button class="btn btn-small btn-outline" data-alt-buy="25">25%</button> <button class="btn btn-small btn-outline" data-alt-buy="50">50%</button> <button class="btn btn-small btn-outline" data-alt-buy="100">Max</button></span></div>');
          htmlAlt.push('<div class="field-row small mt-4"><span>Sell (' + selectedCoin + ')</span><span><input id="alt-sell-amt" class="input-small" type="number" min="0" step="0.00000001" placeholder="Amount"> <button class="btn btn-small btn-outline" id="alt-sell-btn">Sell</button> <button class="btn btn-small btn-outline" data-alt-sell="25">25%</button> <button class="btn btn-small btn-outline" data-alt-sell="50">50%</button> <button class="btn btn-small btn-outline" data-alt-sell="100">Max</button></span></div>');
          htmlAlt.push('</div>');
          htmlAlt.push('</div>');
          htmlAlt.push('<div class="card mt-8">');
          htmlAlt.push('<div class="card-title">Order opportunities <span class="badge badge-blue badge-pill">LIVE</span></div>');
          htmlAlt.push('<div class="card-section">');
          if (!tradesAlt || tradesAlt.length === 0) {
            htmlAlt.push('<div class="small dim">Loading live tape...</div>');
          } else {
            htmlAlt.push('<table class="table small"><thead><tr><th>Time</th><th>Side</th><th>Price</th><th>Amount</th><th>Remaining</th><th>Progress</th><th></th></tr></thead><tbody>');
            var maxAltRows = Math.min(tradesAlt.length, 12);
            var amountDec = (selectedCoin === "DOGE" || selectedCoin === "MATIC" || selectedCoin === "USDT") ? 4 : 6;
            for (var tt = 0; tt < maxAltRows; tt++) {
              var tr0 = tradesAlt[tt];
              var totalAmount = (typeof tr0.total === "number" && tr0.total > 0) ? tr0.total : ((typeof tr0.amount === "number") ? tr0.amount : 0);
              var remaining = (typeof tr0.remaining === "number") ? tr0.remaining : totalAmount;
              if (remaining <= 0) continue;
              var filled = totalAmount - remaining;
              var progressDecimal = totalAmount > 0 ? Math.min(1, Math.max(0, filled / totalAmount)) : 1;
              var progressPercent = Math.round(progressDecimal * 100);
              var progressLabel = progressDecimal.toFixed(2);
              var minutes = tr0.minutes || 0;
              var h = Math.floor(minutes / 60);
              var m = minutes % 60;
              var hh = (h < 10 ? "0" : "") + h;
              var mm = (m < 10 ? "0" : "") + m;
              var sideLabel0 = tr0.side === "sell" ? "Sell" : "Buy";
              var badgeClass0 = tr0.side === "sell" ? "badge-red" : "badge-green";
              htmlAlt.push('<tr>');
              htmlAlt.push('<td>Day ' + (tr0.day || 1) + " " + hh + ":" + mm + '</td>');
              htmlAlt.push('<td><span class="badge ' + badgeClass0 + ' badge-pill">' + sideLabel0 + '</span></td>');
              htmlAlt.push('<td>$' + (tr0.price || 0).toFixed(dec) + '</td>');
              htmlAlt.push('<td>' + totalAmount.toFixed(amountDec) + ' ' + selectedCoin + '</td>');
              htmlAlt.push('<td>' + remaining.toFixed(amountDec) + ' ' + selectedCoin + '</td>');
              htmlAlt.push('<td>');
              htmlAlt.push('<div class="progress small mt-1"><div class="progress-fill" style="width:' + progressPercent + '%"></div></div>');
              htmlAlt.push('<div class="small dim mt-1">' + progressLabel + '</div>');
              htmlAlt.push('</td>');
              htmlAlt.push('<td><div class="flex-row" style="gap:4px;">');
              var fractions = ["0.25", "0.5", "1"];
              for (var fi = 0; fi < fractions.length; fi++) {
                var frac = fractions[fi];
                var fracVal = parseFloat(frac) || 1;
                var fracLabel = fracVal >= 1 ? "All" : Math.round(fracVal * 100) + "%";
                var verb = tr0.side === "sell" ? "Buy " : "Sell ";
                htmlAlt.push('<button class="btn btn-small btn-outline btn-trade-fill" data-coin="' + selectedCoin + '" data-trade-id="' + tr0.id + '" data-fraction="' + frac + '">' + verb + fracLabel + '</button>');
              }
              htmlAlt.push('</div></td>');
              htmlAlt.push('</tr>');
            }
            htmlAlt.push('</tbody></table>');
          }
          htmlAlt.push('</div>');
          htmlAlt.push('</div>');
          container.innerHTML = htmlAlt.join("");
          var coinSelAlt = container.querySelector("#pc-market-coin");
          if (coinSelAlt) {
            coinSelAlt.addEventListener("change", function () {
              Game.state.pc.marketCoin = String(this.value || "BTC").toUpperCase();
              UI.renderPCMarket(container);
            });
          }
          var buyBtnAlt = container.querySelector("#alt-buy-btn");
          if (buyBtnAlt) {
            buyBtnAlt.addEventListener("click", function () {
              var usd = parseFloat(container.querySelector("#alt-buy-usd").value) || 0;
              var res = Game.Crypto.buyAtMarket(selectedCoin, usd);
              if (!res.ok) Game.addNotification(res.message || "Trade failed.");
              UI.renderPCMarket(container);
            });
          }
          var buyPctBtns = container.querySelectorAll("[data-alt-buy]");
          for (var pb = 0; pb < buyPctBtns.length; pb++) {
            buyPctBtns[pb].addEventListener("click", function () {
              var pct = parseInt(this.getAttribute("data-alt-buy"), 10) || 0;
              var usd0 = (Game.state.money || 0) * (pct / 100);
              var input = container.querySelector("#alt-buy-usd");
              if (input) input.value = usd0.toFixed(0);
            });
          }
          var sellBtnAlt = container.querySelector("#alt-sell-btn");
          if (sellBtnAlt) {
            sellBtnAlt.addEventListener("click", function () {
              var amt = parseFloat(container.querySelector("#alt-sell-amt").value) || 0;
              var res = Game.Crypto.sellAtMarket(selectedCoin, amt);
              if (!res.ok) Game.addNotification(res.message || "Trade failed.");
              UI.renderPCMarket(container);
            });
          }
          var sellPctBtns = container.querySelectorAll("[data-alt-sell]");
          for (var ps = 0; ps < sellPctBtns.length; ps++) {
            sellPctBtns[ps].addEventListener("click", function () {
              var pct = parseInt(this.getAttribute("data-alt-sell"), 10) || 0;
              var bal0 = (Game.Crypto && Game.Crypto.getBalance) ? Game.Crypto.getBalance(selectedCoin) : 0;
              var amt0 = bal0 * (pct / 100);
              var input = container.querySelector("#alt-sell-amt");
              if (input) input.value = amt0.toFixed(6);
            });
          }
          // draw chart
          var chartElAlt = container.querySelector("#pc-market-chart");
          if (chartElAlt && typeof Flotr !== "undefined") {
            UI.drawPriceChart(chartElAlt, histAlt);
            UI._pcMarketChartLastDrawTs = Date.now ? Date.now() : new Date().getTime();
          }
          return;
        }
  
        var ex = Game.Btc.getExchange();
        var history = (ex.priceHistory || []).slice(-12);
        // If there is no real history yet, fabricate a short series
        // around the current price so the graph is immediately visible.
        if (!history || history.length === 0) {
          var day = Game.state.day || 1;
          var minutes = Game.state.timeMinutes || 0;
          var currentHour = Math.floor(minutes / 60);
          var synthetic = [];
          for (var i = 5; i >= 0; i--) {
            var hour = currentHour - (5 - i);
            var d = day;
            while (hour < 0) {
              hour += 24;
              d -= 1;
              if (d < 1) {
                d = 1;
                break;
              }
            }
            var minuteOfDay = hour * 60;
            var key = d * (24 * 60) + minuteOfDay;
            var delta = (Math.random() - 0.5) * 200;
            synthetic.push({
              key: key,
              day: d,
              hour: hour,
              minutes: minuteOfDay,
              price: Math.max(5000, ex.priceUsd + delta)
            });
          }
          history = synthetic;
        }
      var html = [];
      html.push('<h2>Crypto Exchange</h2>');
      html.push('<div class="small dim">Trade multiple cryptocurrencies. BTC supports the full order book; other coins use market orders.</div>');
      html.push('<div class="mt-4">');
      var coinIds2 = (Game.Crypto && Game.Crypto.getCoinIds) ? Game.Crypto.getCoinIds() : ["BTC", "LTC", "DOGE", "SOL", "MATIC", "USDT"];
      html.push('<div class="field-row"><span>Currency</span><span><select id="pc-market-coin" style="padding:6px 8px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">' +
        coinIds2.map(function (id2) { return '<option value="' + id2 + '"' + (id2 === "BTC" ? " selected" : "") + '>' + id2 + '</option>'; }).join("") +
        '</select></span></div>');
      html.push('</div>');
      html.push('<div class="mt-4">');
      // Spot price + history graph
      html.push('<div class="card">');
      html.push('<div class="card-title">Spot Price & History</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Spot price</span><span id="pc-spot-price" class="mono">$' + ex.priceUsd.toFixed(0) + ' / BTC</span></div>');
      html.push('<div class="field-row"><span>Your BTC (confirmed)</span><span class="mono">' + Game.state.btcBalance.toFixed(8) + '</span></div>');
      html.push('<div class="field-row"><span>Your cash</span><span class="mono">$' + Game.state.money.toFixed(2) + '</span></div>');
      html.push('</div>');
      html.push('<div class="card-section">');
      html.push('<div id="pc-market-chart" style="width:100%;height:180px;"></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>');
      // Quick trade + order book + order form stacked full-width
      var bestAsk0 = null;
      var bestBid0 = null;
      if (ex.sellOrders && ex.sellOrders.length) {
        for (var sa0 = 0; sa0 < ex.sellOrders.length; sa0++) {
          var oAsk = ex.sellOrders[sa0];
          if (!oAsk) continue;
          if (bestAsk0 === null || oAsk.price < bestAsk0) bestAsk0 = oAsk.price;
        }
      }
      if (ex.buyOrders && ex.buyOrders.length) {
        for (var sb0 = 0; sb0 < ex.buyOrders.length; sb0++) {
          var oBid = ex.buyOrders[sb0];
          if (!oBid) continue;
          if (bestBid0 === null || oBid.price > bestBid0) bestBid0 = oBid.price;
        }
      }
      var spread0 = (bestAsk0 !== null && bestBid0 !== null) ? (bestAsk0 - bestBid0) : null;
      html.push('<div class="grid mt-8" style="grid-template-columns:1fr 1fr;gap:12px;">');
      html.push('<div class="card">');
      html.push('<div class="card-title">Quick Trade <span class="badge badge-blue badge-pill">LIVE</span></div>');
      html.push('<div class="card-section small dim">Quick trades post limit orders to the order book at the current spot price. NPCs will fill them over time, and you can instantly trade by clicking orders in the book.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Best ask / bid</span><span class="mono" id="pc-mkt-spread">' + (bestAsk0 !== null ? ("$" + bestAsk0.toFixed(0)) : "-") + " Æ’?Â½ " + (bestBid0 !== null ? ("$" + bestBid0.toFixed(0)) : "-") + (spread0 !== null ? (" Æ’?Â½ spread $" + spread0.toFixed(0)) : "") + '</span></div>');
      html.push('<div class="field-row small mt-4"><span>Buy BTC (USD)</span><span><input id="mkt-buy-usd" class="input-small" type="number" min="1" step="1" placeholder="Amount"> <button class="btn btn-small btn-primary" id="mkt-buy-btn">Buy</button> <button class="btn btn-small btn-outline" data-mkt-buy="25">25%</button> <button class="btn btn-small btn-outline" data-mkt-buy="50">50%</button> <button class="btn btn-small btn-outline" data-mkt-buy="100">Max</button></span></div>');
      html.push('<div class="field-row small mt-4"><span>Sell BTC</span><span><input id="mkt-sell-btc" class="input-small" type="number" min="0.00000001" step="0.00000001" placeholder="Amount"> <button class="btn btn-small btn-outline" id="mkt-sell-btn">Sell</button> <button class="btn btn-small btn-outline" data-mkt-sell="25">25%</button> <button class="btn btn-small btn-outline" data-mkt-sell="50">50%</button> <button class="btn btn-small btn-outline" data-mkt-sell="100">Max</button></span></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('<div class="card">');
      html.push('<div class="card-title">Place Order</div>');
      html.push('<div class="card-section small dim">Create a limit buy or sell order. NPC trades will only fill the best-priced orders.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Side</span><span><select id="ex-side"><option value="sell">Sell BTC</option><option value="buy">Buy BTC</option></select></span></div>');
      html.push('<div class="field-row"><span>Price (USD)</span><span><input id="ex-price" type="number" min="1000" step="10" value="' + ex.priceUsd.toFixed(0) + '"></span></div>');
      html.push('<div class="field-row"><span>Amount (BTC)</span><span><input id="ex-amount" type="number" min="0.00000001" step="0.00000001" value="0.01000000"></span></div>');
      html.push('<div class="mt-4"><button class="btn btn-small btn-primary" id="ex-place-order">Place order</button></div>');
      html.push('</div>');
      html.push('</div>');
      html.push('</div>'); // grid
  
      html.push('<div class="card" style="max-height:60vh;overflow:auto;">');
      html.push('<div class="card-title">Order Book</div>');
      html.push('<div class="card-section">');
      html.push('<div class="grid" style="grid-template-columns:1fr 1fr;gap:12px;">');
      // Asks (sell orders)
      html.push('<div>');
      html.push('<div class="small dim mb-2">Sell orders (ask, above price)</div>');
      html.push('<table class="table small"><thead><tr><th>Price</th><th>Amount</th><th></th></tr></thead><tbody id="pc-asks-body">');
      var asks = ex.sellOrders.slice().sort(function (a, b) { return a.price - b.price; });
      if (asks.length === 0) {
        html.push('<tr><td colspan="3" class="small dim">No asks yet.</td></tr>');
      } else {
        for (var a = 0; a < asks.length; a++) {
          var ask = asks[a];
          html.push('<tr>');
          html.push('<td>$' + ask.price.toFixed(0) + '</td>');
          html.push('<td>' + ask.remaining.toFixed(8) + ' BTC</td>');
          var isOwnAsk = ask.owner === "player";
          html.push('<td><button class="btn btn-small btn-outline btn-fill-order" data-order="' + ask.id + '"' + (isOwnAsk ? ' disabled' : '') + '>' + (isOwnAsk ? 'Your order' : 'Buy') + '</button></td>');
          html.push('</tr>');
        }
      }
      html.push('</tbody></table>');
      html.push('</div>');
      // Bids (buy orders)
      html.push('<div>');
      html.push('<div class="small dim mb-2">Buy orders (bid, below price)</div>');
      html.push('<table class="table small"><thead><tr><th>Price</th><th>Amount</th><th></th></tr></thead><tbody id="pc-bids-body">');
      var bids = ex.buyOrders.slice().sort(function (a2, b2) { return b2.price - a2.price; });
      if (bids.length === 0) {
        html.push('<tr><td colspan="3" class="small dim">No bids yet.</td></tr>');
      } else {
        for (var b = 0; b < bids.length; b++) {
          var bid = bids[b];
          html.push('<tr>');
          html.push('<td>$' + bid.price.toFixed(0) + '</td>');
          html.push('<td>' + bid.remaining.toFixed(8) + ' BTC</td>');
          var isOwnBid = bid.owner === "player";
          html.push('<td><button class="btn btn-small btn-outline btn-fill-order" data-order="' + bid.id + '"' + (isOwnBid ? ' disabled' : '') + '>' + (isOwnBid ? 'Your order' : 'Sell') + '</button></td>');
          html.push('</tr>');
        }
      }
      html.push('</tbody></table>');
      html.push('</div>');
      html.push('</div>');
      // Recent trades
      html.push('<div class="card mt-8">');
      html.push('<div class="card-title">Recent Trades <span class="badge badge-blue badge-pill">LIVE</span></div>');
      html.push('<div class="card-section">');
      var trades = ex.recentTrades || [];
      html.push('<table class="table small"><thead><tr><th>Time</th><th>Side</th><th>Price</th><th>Amount</th></tr></thead><tbody id="pc-trades-body">');
      if (!trades || trades.length === 0) {
        html.push('<tr><td colspan="4" class="small dim">No trades have been executed yet.</td></tr>');
      } else {
        var maxRows = Math.min(trades.length, 10);
        var rendered = 0;
        for (var t = 0; t < maxRows; t++) {
          var tr = trades[t];
          var amount = (typeof tr.amount === "number" && tr.amount > 0) ? tr.amount : 0;
          if (!(amount > 0)) continue;
          rendered += 1;
          var minutes = tr.minutes || 0;
          var h = Math.floor(minutes / 60);
          var m = minutes % 60;
          var hh = (h < 10 ? "0" : "") + h;
          var mm = (m < 10 ? "0" : "") + m;
          var sideLabel = tr.side === "sell" ? "Sell" : "Buy";
          var badgeClass = tr.side === "sell" ? "badge-red" : "badge-green";
          html.push('<tr>');
          html.push('<td>Day ' + (tr.day || 1) + " " + hh + ":" + mm + '</td>');
          html.push('<td><span class="badge ' + badgeClass + ' badge-pill">' + sideLabel + '</span></td>');
          html.push('<td>$' + (tr.price || 0).toFixed(0) + '</td>');
          html.push('<td>' + amount.toFixed(8) + ' BTC</td>');
          html.push('</tr>');
        }
        if (rendered === 0) {
          html.push('<tr><td colspan="4" class="small dim">No trades have been executed yet.</td></tr>');
        }
      }
      html.push('</tbody></table>');
      html.push('</div>');
      html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        container.innerHTML = html.join("");
        // draw price graph with Flotr2
        var chartEl = container.querySelector("#pc-market-chart");
        if (chartEl) {
        UI.drawPriceChart(chartEl, history);
        UI._pcMarketChartLastDrawTs = Date.now ? Date.now() : new Date().getTime();
        }
      // behaviour
      if (!container._pcMarketDelegatedFill) {
        container._pcMarketDelegatedFill = true;
        container.addEventListener("click", function (e) {
          try {
            var el = e && e.target ? e.target : null;
            while (el && el !== container) {
              if (el.classList && el.classList.contains("btn-fill-order")) break;
              el = el.parentNode;
            }
            if (!el || el === container) return;
            var oid = el.getAttribute("data-order");
            if (!oid) return;
            if (Game.Btc && Game.Btc.fulfillOrderInstant) Game.Btc.fulfillOrderInstant(oid);
            UI.renderPCMarket(container);
          } catch (err) {}
        });
      }
      var sideSel = container.querySelector("#ex-side");
      var priceInput = container.querySelector("#ex-price");
        var amountInput = container.querySelector("#ex-amount");
        var placeBtn = container.querySelector("#ex-place-order");
        if (placeBtn) {
          placeBtn.addEventListener("click", function () {
          var side = sideSel.value === "buy" ? "buy" : "sell";
          var priceVal = parseFloat(priceInput.value) || ex.priceUsd;
          var amtVal = parseFloat(amountInput.value) || 0;
            Game.Btc.placeLimitOrder(side, priceVal, amtVal);
            UI.renderPCMarket(container);
          });
        }
        var buyBtn = container.querySelector("#mkt-buy-btn");
        if (buyBtn) {
          buyBtn.addEventListener("click", function () {
            var usd = parseFloat(container.querySelector("#mkt-buy-usd").value) || 0;
            if (Game.Btc && Game.Btc.marketBuyUsd) Game.Btc.marketBuyUsd(usd);
            UI.renderPCMarket(container);
          });
        }
        var sellBtn = container.querySelector("#mkt-sell-btn");
        if (sellBtn) {
          sellBtn.addEventListener("click", function () {
            var amt = parseFloat(container.querySelector("#mkt-sell-btc").value) || 0;
            if (Game.Btc && Game.Btc.marketSellBtc) Game.Btc.marketSellBtc(amt);
            UI.renderPCMarket(container);
          });
        }
        var buyPctBtns2 = container.querySelectorAll("[data-mkt-buy]");
        for (var pb2 = 0; pb2 < buyPctBtns2.length; pb2++) {
          buyPctBtns2[pb2].addEventListener("click", function () {
            var pct = parseInt(this.getAttribute("data-mkt-buy"), 10) || 0;
            var usd0 = (Game.state.money || 0) * (pct / 100);
            var input = container.querySelector("#mkt-buy-usd");
            if (input) input.value = usd0.toFixed(0);
          });
        }
        var sellPctBtns2 = container.querySelectorAll("[data-mkt-sell]");
        for (var ps2 = 0; ps2 < sellPctBtns2.length; ps2++) {
          sellPctBtns2[ps2].addEventListener("click", function () {
            var pct = parseInt(this.getAttribute("data-mkt-sell"), 10) || 0;
            var bal0 = (Game.state.btcBalance || 0);
            var amt0 = bal0 * (pct / 100);
            var input = container.querySelector("#mkt-sell-btc");
            if (input) input.value = amt0.toFixed(8);
          });
        }
        var coinSel = container.querySelector("#pc-market-coin");
        if (coinSel) {
          coinSel.addEventListener("change", function () {
            Game.state.pc.marketCoin = String(this.value || "BTC").toUpperCase();
            UI.renderPCMarket(container);
          });
        }
      },
      renderPCCloudAdvanced: function (container) {
        var cs = (Game.state.btc && Game.state.btc.cloud && Game.state.btc.cloud.contracts) ? Game.state.btc.cloud.contracts : [];
        var active = 0;
        var totalDaily = 0;
        for (var i = 0; i < cs.length; i++) {
          if (cs[i].daysLeft > 0) {
            active += 1;
            totalDaily += cs[i].dailyBtc || 0;
          }
        }
        var moneyBal = (Game.state && typeof Game.state.money === "number" && isFinite(Game.state.money)) ? Game.state.money : 0;
        var ex0 = (Game.state && Game.state.btc && Game.state.btc.exchange) ? Game.state.btc.exchange : null;
        var btcPriceUsd = ex0 && typeof ex0.priceUsd === "number" && isFinite(ex0.priceUsd) ? ex0.priceUsd : 0;
        var yieldMultHdr = 1;
        if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
          yieldMultHdr = Game.Prestige.getMiningYieldMultiplier();
        }
        if (!isFinite(yieldMultHdr) || yieldMultHdr <= 0) yieldMultHdr = 1;
        var debugMultHdr = (Game.Btc && typeof Game.Btc.getDebugMiningMultiplier === "function") ? Game.Btc.getDebugMiningMultiplier() : 1;
        if (!isFinite(debugMultHdr) || debugMultHdr <= 0) debugMultHdr = 1;
        var effectiveDailyBtcHdr = totalDaily * yieldMultHdr * debugMultHdr;
        if (!isFinite(effectiveDailyBtcHdr) || effectiveDailyBtcHdr < 0) effectiveDailyBtcHdr = 0;
        var estUsdDay = btcPriceUsd > 0 ? (effectiveDailyBtcHdr * btcPriceUsd) : 0;
        if (!isFinite(estUsdDay) || estUsdDay < 0) estUsdDay = 0;
        // Cloud mining contracts:
        // - Slider selects one of 20 discrete hashrate packages (starts at 30,000 H/s).
        // - Package determines bonus devices (gifts).
        // - Tier determines duration.
        // - Paying with crypto (BTC/USDT) unlocks extra tiers and gives 65% off 60-day contracts.
        var cloudState = (Game.state && Game.state.btc && Game.state.btc.cloud) ? Game.state.btc.cloud : null;
        var uiPayWith = cloudState && cloudState.uiPayWith ? String(cloudState.uiPayWith || "USD").toUpperCase() : "USD";
        if (uiPayWith !== "USD" && uiPayWith !== "BTC" && uiPayWith !== "USDT") uiPayWith = "USD";
        var packages = (Game.Btc && typeof Game.Btc.getCloudContractPackages === "function") ? Game.Btc.getCloudContractPackages() : null;
        if (!packages || !packages.length) packages = [{ idx: 0, hashrate: 30000, giftCount: 0 }];
        var tiers = (Game.Btc && typeof Game.Btc.getCloudContractTierDefs === "function")
          ? Game.Btc.getCloudContractTierDefs(uiPayWith)
          : { bronze: { id: "bronze", name: "Bronze", days: 20 }, silver: { id: "silver", name: "Silver", days: 40 }, gold: { id: "gold", name: "Gold", days: 60 } };
        var defaultPkgIdx = (cloudState && typeof cloudState.uiHashIdx === "number" && isFinite(cloudState.uiHashIdx)) ? Math.floor(cloudState.uiHashIdx) : 0;
        if (defaultPkgIdx < 0) defaultPkgIdx = 0;
        if (defaultPkgIdx >= packages.length) defaultPkgIdx = packages.length - 1;
        var defaultPkg = packages[defaultPkgIdx] || packages[0];
        var html = [];
        html.push('<div class="pc-cloud">');
        html.push('<div class="pc-cloud-header flex-between">');
        html.push('<div>');
        html.push('<div class="pc-cloud-title">Cloud Mining</div>');
        html.push('<div class="pc-cloud-sub small dim">Configure remote hashrate contracts and receive BTC payouts each in-game day.</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-pills">');
        html.push('<div class="pc-cloud-pill"><span class="label">Balance</span><span class="value">$' + moneyBal.toFixed(2) + '</span></div>');
        html.push('<div class="pc-cloud-pill green"><span class="label">Active contracts</span><span class="value">' + active + '</span></div>');
        html.push('<div class="pc-cloud-pill orange" title="' + effectiveDailyBtcHdr.toFixed(8) + ' BTC/day"><span class="label">Est earnings</span><span class="value">' + (btcPriceUsd > 0 ? ('~$' + estUsdDay.toFixed(2) + '/day') : ('~' + effectiveDailyBtcHdr.toFixed(8) + ' BTC/day')) + '</span></div>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-main">');
        // left
        html.push('<div class="pc-cloud-left">');
        // hashrate slider
        html.push('<div class="pc-cloud-block">');
        html.push('<div class="pc-cloud-block-header flex-between">');
        html.push('<span class="small dim">Hashrate</span>');
        html.push('<span id="pc-cloud-hash-label" class="mono">' + ((defaultPkg && defaultPkg.hashrate) ? defaultPkg.hashrate.toLocaleString() : "30,000") + ' H/s</span>');
        html.push('</div>');
        html.push('<input id="pc-cloud-hash" type="range" min="0" max="' + Math.max(0, (packages.length - 1)) + '" step="1" value="' + defaultPkgIdx + '">');
        html.push('</div>');
        // selected hardware & gifts preview
        html.push('<div class="pc-cloud-block mt-8">');
        html.push('<div class="small dim">Cloud hardware & gifts</div>');
        html.push('<div id="pc-cloud-device" class="small">Move the hashrate slider to preview the hardware for that package.</div>');
        html.push('<div id="pc-cloud-gift" class="small mt-2 dim"></div>');
        html.push('</div>');
        // tiers
        html.push('<div class="pc-cloud-block mt-8">');
        html.push('<div class="small dim">Contract tier</div>');
        html.push('<div class="pc-cloud-plans">');
        for (var key in tiers) {
          if (!tiers.hasOwnProperty(key)) continue;
          var t = tiers[key];
          html.push('<button class="pc-cloud-plan" data-tier="' + t.id + '">');
          html.push('<div class="pc-cloud-plan-header flex-between">');
          html.push('<span>' + t.name + '</span>');
          html.push('<span class="badge badge-blue pc-cloud-plan-badge">' + (t.days || 0) + ' days</span>');
          html.push('</div>');
          html.push('<div class="pc-cloud-plan-body">');
          html.push('<div class="pc-cloud-plan-hash mono">' + (t.days || 0) + ' day contract</div>');
          html.push('<div class="pc-cloud-plan-meta small">' + ((uiPayWith !== "USD" && (t.days || 0) === 60) ? "Crypto payment: 65% off" : "Duration tier") + '</div>');
          html.push('</div>');
          html.push('</button>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        // right
        html.push('<div class="pc-cloud-right">');
        html.push('<div class="pc-cloud-block">');
        html.push('<div class="pc-cloud-block-header" id="pc-cloud-summary-title">Order summary</div>');
        html.push('<div class="pc-cloud-summary-rows small">');
        html.push('<div class="field-row"><span>Selected tier</span><span id="pc-cloud-summary-tier">None</span></div>');
        html.push('<div class="field-row"><span>Estimated hashrate</span><span id="pc-cloud-summary-hash">-</span></div>');
        html.push('<div class="field-row"><span>Daily BTC</span><span id="pc-cloud-summary-daily">-</span></div>');
        html.push('<div class="field-row"><span>Duration</span><span id="pc-cloud-summary-duration">-</span></div>');
        html.push('<div class="field-row"><span>Hardware device</span><span id="pc-cloud-summary-hardware">-</span></div>');
        html.push('<div class="field-row"><span>Gift devices</span><span id="pc-cloud-summary-gift">-</span></div>');
        html.push('<div class="field-row"><span>Price</span><span id="pc-cloud-summary-price">$0</span></div>');
        html.push('<div class="field-row"><span>Pay with</span><span><select id="pc-cloud-pay" style="padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;"><option value="USD"' + (uiPayWith === "USD" ? " selected" : "") + '>Money (USD)</option><option value="BTC"' + (uiPayWith === "BTC" ? " selected" : "") + '>Bitcoin (BTC)</option><option value="USDT"' + (uiPayWith === "USDT" ? " selected" : "") + '>USDT</option></select></span></div>');
        html.push('</div>');
        html.push('<div class="mt-8">');
        html.push('<button class="btn btn-small btn-primary pc-cloud-buy-btn" disabled>Activate contract</button>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-block mt-8">');
        html.push('<div class="pc-cloud-block-header flex-between">');
        html.push('<span>Active contracts</span>');
        html.push('<span class="small dim">' + (cs.length === 0 ? "None yet" : cs.length + " total") + '</span>');
        html.push('</div>');
        if (cs.length === 0) {
          html.push('<p class="small dim mt-4">Your first cloud mining contract will appear here once purchased.</p>');
        } else {
          html.push('<div class="mt-4 pc-cloud-contracts">');
          html.push('<table class="table"><thead><tr><th>ID</th><th>Tier</th><th>Hashrate</th><th>Days left</th><th>Daily BTC</th></tr></thead><tbody>');
          for (var i2 = 0; i2 < cs.length; i2++) {
            var c2 = cs[i2];
            var hr = c2.hashrate ? Math.round(c2.hashrate).toLocaleString() + " H/s" : "-";
            var tierLabel = c2.tierName || c2.tier || "-";
            html.push('<tr class="pc-cloud-contract-row" data-contract-id="' + c2.id + '"><td>' + c2.id + '</td><td>' + tierLabel + '</td><td>' + hr + '</td><td>' + c2.daysLeft + '</td><td>' + c2.dailyBtc.toFixed(8) + '</td></tr>');
          }
          html.push('</tbody></table>');
          html.push('</div>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        container.innerHTML = html.join("");
        // behaviour
        var hashSlider = container.querySelector("#pc-cloud-hash");
        var hashLabel = container.querySelector("#pc-cloud-hash-label");
        var selectedTier = null;
        var buyBtn = container.querySelector(".pc-cloud-buy-btn");
        var planButtons = container.querySelectorAll(".pc-cloud-plan");
        var summaryTier = container.querySelector("#pc-cloud-summary-tier");
        var summaryHash = container.querySelector("#pc-cloud-summary-hash");
        var summaryDaily = container.querySelector("#pc-cloud-summary-daily");
        var summaryDuration = container.querySelector("#pc-cloud-summary-duration");
        var summaryPrice = container.querySelector("#pc-cloud-summary-price");
        var paySel = container.querySelector("#pc-cloud-pay");
        var summaryTitle = container.querySelector("#pc-cloud-summary-title");
        var summaryHardware = container.querySelector("#pc-cloud-summary-hardware");
        var summaryGift = container.querySelector("#pc-cloud-summary-gift");
        var deviceLabel = container.querySelector("#pc-cloud-device");
        var giftLabel = container.querySelector("#pc-cloud-gift");
        var cloudState = (Game.state && Game.state.btc && Game.state.btc.cloud) ? Game.state.btc.cloud : null;
        var selectedContractId = cloudState && cloudState.selectedContractId ? String(cloudState.selectedContractId) : null;
        var contractRows = container.querySelectorAll(".pc-cloud-contract-row");
        var syncContractRowSelection = function () {
          if (!contractRows || !contractRows.length) return;
          for (var i = 0; i < contractRows.length; i++) {
            var r0 = contractRows[i];
            if (!r0) continue;
            var id0 = r0.getAttribute("data-contract-id");
            r0.classList.toggle("selected", !!(selectedContractId && id0 && String(id0) === String(selectedContractId)));
          }
        };
        var setSelectedContractId = function (id) {
          selectedContractId = id ? String(id) : null;
          if (cloudState) cloudState.selectedContractId = selectedContractId;
          syncContractRowSelection();
        };
        if (contractRows && contractRows.length) {
          for (var cr = 0; cr < contractRows.length; cr++) {
            (function (row) {
              row.addEventListener("click", function () {
                var id = row.getAttribute("data-contract-id");
                if (!id) return;
                if (selectedContractId && String(selectedContractId) === String(id)) {
                  setSelectedContractId(null);
                } else {
                  setSelectedContractId(id);
                }
                updateSummary();
              });
            })(contractRows[cr]);
          }
        }
        syncContractRowSelection();
        if (Game.Crypto && Game.Crypto.ensureState) Game.Crypto.ensureState();
        var minersCache = window.MINERS || [];
        var minersLoading = false;
        var currentMainDevice = null;
        var currentGiftDevice = null;
        var ensureMinersLoaded = function (cb) {
          // Data is preloaded from miners_data.js into window.MINERS.
          if (!minersCache || !minersCache.length) {
            minersCache = window.MINERS || [];
          }
          if (cb) cb();
        };
        var getSelectedPackage = function () {
          var idx = hashSlider ? (parseInt(hashSlider.value, 10) || 0) : defaultPkgIdx;
          if (!isFinite(idx)) idx = defaultPkgIdx;
          if (idx < 0) idx = 0;
          if (idx >= packages.length) idx = packages.length - 1;
          return packages[idx] || packages[0];
        };
        var updateHashLabel = function () {
          if (!hashSlider || !hashLabel) return;
          var pkg = getSelectedPackage();
          var hr = (pkg && typeof pkg.hashrate === "number") ? pkg.hashrate : 0;
          hashLabel.textContent = hr.toLocaleString() + " H/s";
        };
        var updateTierBadges = function () {
          if (!planButtons || !planButtons.length) return;
          for (var p = 0; p < planButtons.length; p++) {
            var btn = planButtons[p];
            var tierId = btn.getAttribute("data-tier");
            var badgeEl = btn.querySelector(".pc-cloud-plan-badge");
            if (!badgeEl) continue;
            var def = tiers && tiers[tierId] ? tiers[tierId] : null;
            var d = def && typeof def.days === "number" ? Math.floor(def.days) : 0;
            badgeEl.textContent = d + " days";
          }
        };
        var updateSummary = function () {
          if (summaryTitle) summaryTitle.textContent = selectedContractId ? "Contract summary" : "Order summary";
  
          // Active contract selection overrides the purchase summary.
          if (selectedContractId) {
            var selected = null;
            for (var ci = 0; ci < cs.length; ci++) {
              if (cs[ci] && String(cs[ci].id) === String(selectedContractId)) {
                selected = cs[ci];
                break;
              }
            }
            if (!selected) {
              setSelectedContractId(null);
            } else {
              var mult = (Game.Btc && Game.Btc.getDebugMiningMultiplier) ? Game.Btc.getDebugMiningMultiplier() : 1;
              if (!isFinite(mult) || mult <= 0) mult = 1;
              var dailyBase = typeof selected.dailyBtc === "number" ? selected.dailyBtc : 0;
              var dailyEff = dailyBase * mult;
              var tierLabel = selected.tierName || selected.tier || "-";
              if (summaryTier) summaryTier.textContent = String(tierLabel) + " (" + selected.id + ")";
              if (summaryHash) summaryHash.textContent = selected.hashrate ? (Math.round(selected.hashrate).toLocaleString() + " H/s") : "-";
              if (summaryDaily) summaryDaily.textContent = dailyBase.toFixed(8) + " BTC" + (mult !== 1 ? (" (x" + mult + " â†’ " + dailyEff.toFixed(8) + ")") : "");
              if (summaryDuration) summaryDuration.textContent = (selected.daysLeft || 0) + " days left";
              if (summaryHardware) summaryHardware.textContent = (selected.mainDevice && selected.mainDevice.name) ? selected.mainDevice.name : "-";
              if (summaryGift) {
                var gc = (typeof selected.giftCount === "number" ? selected.giftCount : 0) || 0;
                var gn = (selected.giftDevice && selected.giftDevice.name) ? selected.giftDevice.name : "-";
                summaryGift.textContent = gc > 0 ? (gc + "x " + gn) : "None";
              }
              var paidWith = String(selected.paidWith || "USD").toUpperCase();
              var paidUsd = (typeof selected.priceUsd === "number" && isFinite(selected.priceUsd)) ? selected.priceUsd : 0;
              if (paySel) {
                paySel.value = (paidWith === "BTC" || paidWith === "USDT") ? paidWith : "USD";
                paySel.disabled = true;
              }
              if (summaryPrice) {
                if (paidWith === "USDT") summaryPrice.textContent = paidUsd.toFixed(2) + " USDT";
                else summaryPrice.textContent = "$" + paidUsd.toFixed(2) + (paidWith === "BTC" ? " (paid w/ BTC)" : "");
              }
              if (buyBtn) {
                buyBtn.disabled = true;
                buyBtn.textContent = "Viewing contract";
              }
              return;
            }
          }
  
          if (paySel) paySel.disabled = false;
          if (buyBtn) buyBtn.textContent = "Activate contract";
          if (!selectedTier || !tiers[selectedTier]) {
            if (summaryTier) summaryTier.textContent = "None";
            if (summaryHash) summaryHash.textContent = "-";
            if (summaryDaily) summaryDaily.textContent = "-";
            if (summaryDuration) summaryDuration.textContent = "-";
            if (summaryGift) summaryGift.textContent = "-";
            if (summaryPrice) summaryPrice.textContent = "$0";
            if (buyBtn) buyBtn.disabled = true;
            return;
          }
          var payWith = paySel ? String(paySel.value || uiPayWith || "USD").toUpperCase() : (uiPayWith || "USD");
          var pkg = getSelectedPackage();
          var q = (Game.Btc && typeof Game.Btc.quoteCloudContract === "function") ? Game.Btc.quoteCloudContract(selectedTier, pkg ? pkg.idx : 0, payWith) : null;
          if (!q) {
            if (summaryTier) summaryTier.textContent = "None";
            if (summaryHash) summaryHash.textContent = "-";
            if (summaryDaily) summaryDaily.textContent = "-";
            if (summaryDuration) summaryDuration.textContent = "-";
            if (summaryPrice) summaryPrice.textContent = "$0";
            if (buyBtn) buyBtn.disabled = true;
            return;
          }
          if (summaryTier) summaryTier.textContent = q.tierName + " (" + q.tierId + ")";
          if (summaryHash) summaryHash.textContent = Math.round(q.hashrate).toLocaleString() + " H/s";
          if (summaryDaily) summaryDaily.textContent = q.dailyBtc.toFixed(8) + " BTC";
          if (summaryDuration) summaryDuration.textContent = q.days + " in-game days" + (q.discountApplied ? (" (crypto -" + q.discountPct + "%)") : "");
  
          var canBuy = true;
          if (payWith === "BTC") {
            var ex = (Game.Btc && Game.Btc.getExchange) ? Game.Btc.getExchange() : null;
            var btcPrice = ex && ex.priceUsd ? ex.priceUsd : 0;
            if (!(btcPrice > 0)) {
              if (summaryPrice) summaryPrice.textContent = "BTC price unavailable";
              canBuy = false;
            } else {
              var btcCost = q.priceUsd / btcPrice;
              if (summaryPrice) summaryPrice.textContent = btcCost.toFixed(8) + " BTC";
              var bal = Game.state && typeof Game.state.btcBalance === "number" ? Game.state.btcBalance : 0;
              canBuy = (bal >= btcCost);
            }
          } else if (payWith === "USDT") {
            var usdt = (Game.state && Game.state.crypto && Game.state.crypto.coins) ? Game.state.crypto.coins.USDT : null;
            var usdtBal = usdt && typeof usdt.balance === "number" ? usdt.balance : 0;
            if (summaryPrice) summaryPrice.textContent = q.priceUsd.toFixed(2) + " USDT";
            canBuy = (usdtBal >= q.priceUsd);
          } else {
            if (summaryPrice) summaryPrice.textContent = "$" + q.priceUsd.toFixed(2);
            var money = Game.state && typeof Game.state.money === "number" ? Game.state.money : 0;
            canBuy = (money >= q.priceUsd);
          }
          if (buyBtn) buyBtn.disabled = !canBuy;
        };
        var updateGiftPreview = function () {
          if (!giftLabel) return;
          if (!currentMainDevice) {
            giftLabel.textContent = "";
            if (summaryGift) summaryGift.textContent = "-";
            return;
          }
          var tierText = selectedTier || "bronze";
          var extra = 0;
          if (tierText === "silver") extra = 1;
          if (tierText === "gold") extra = 2;
          if (!currentGiftDevice || extra <= 0) {
            giftLabel.textContent = "Bronze contracts have no bonus devices. Silver adds 1 bonus device, Gold adds 2 of the same lower-tier device.";
            if (summaryGift) summaryGift.textContent = "None";
            return;
          }
          var giftSummary = currentGiftDevice.name + " Ã—" + extra;
          giftLabel.textContent = "Gift: " + currentGiftDevice.name + " (" + currentGiftDevice.vendor + " " + currentGiftDevice.type + ") Ã—" + extra + " (lower tier than selected hardware).";
          if (summaryGift) summaryGift.textContent = giftSummary;
        };
        // Override: gifts are determined by the slider package, not by the duration tier.
        var updateGiftPreview2 = function () {
          if (!giftLabel) return;
          if (!currentMainDevice) {
            giftLabel.textContent = "";
            if (summaryGift) summaryGift.textContent = "-";
            return;
          }
          var pkg = getSelectedPackage();
          var giftCount = (pkg && typeof pkg.giftCount === "number" && isFinite(pkg.giftCount)) ? Math.floor(pkg.giftCount) : 0;
          if (giftCount <= 0) {
            giftLabel.textContent = "This hashrate package includes no bonus devices.";
            if (summaryGift) summaryGift.textContent = "None";
            return;
          }
          if (!currentGiftDevice) {
            giftLabel.textContent = "Bonus devices: " + giftCount + "x (no eligible gift device found).";
            if (summaryGift) summaryGift.textContent = giftCount + "x";
            return;
          }
          giftLabel.textContent = "Bonus devices: " + giftCount + "x " + currentGiftDevice.name + " (lower tier than selected hardware).";
          if (summaryGift) summaryGift.textContent = giftCount + "x " + currentGiftDevice.name;
        };
        // Keep the old variable name used elsewhere.
        updateGiftPreview = updateGiftPreview2;
        var updateDeviceDisplay = function () {
          if (!deviceLabel) return;
          if (!currentMainDevice) {
            deviceLabel.textContent = "Move the hashrate slider to preview the hardware for that package.";
            if (summaryHardware) summaryHardware.textContent = "-";
          } else {
            var label = "Hardware: " + currentMainDevice.name + " (" + currentMainDevice.vendor + " " + currentMainDevice.type + "), rank " + currentMainDevice.rank;
            deviceLabel.textContent = label;
            if (summaryHardware) summaryHardware.textContent = currentMainDevice.name;
          }
          updateGiftPreview();
          updateTierBadges();
        };
        var pickDevicesForSlider = function () {
          if (!hashSlider) return;
          var pkg = getSelectedPackage();
          ensureMinersLoaded(function () {
            if (!minersCache || !minersCache.length) return;
            var sorted = minersCache.slice(0);
            sorted.sort(function (a, b) {
              var ar = (a && typeof a.rank === "number") ? a.rank : 0;
              var br = (b && typeof b.rank === "number") ? b.rank : 0;
              return ar - br;
            });
            var pct = (packages && packages.length > 1 && pkg && typeof pkg.idx === "number") ? (pkg.idx / (packages.length - 1)) : 0;
            if (!isFinite(pct) || pct < 0) pct = 0;
            if (pct > 1) pct = 1;
            var mainIndex = Math.floor(pct * (sorted.length - 1));
            if (mainIndex < 0) mainIndex = 0;
            if (mainIndex >= sorted.length) mainIndex = sorted.length - 1;
            var main = sorted[mainIndex] || sorted[0];
            var gift = null;
            if (mainIndex > 0) {
              var giftIndex = Math.floor(mainIndex * 0.65);
              if (giftIndex >= mainIndex) giftIndex = mainIndex - 1;
              if (giftIndex < 0) giftIndex = 0;
              gift = sorted[giftIndex] || null;
              if (gift && main && typeof gift.rank === "number" && typeof main.rank === "number" && gift.rank >= main.rank) {
                gift = null;
              }
            }
            currentMainDevice = main;
            currentGiftDevice = gift;
            if (Game.state && Game.state.btc && Game.state.btc.cloud) {
              Game.state.btc.cloud.currentMainDevice = main;
              Game.state.btc.cloud.currentGiftDevice = gift;
            }
            updateDeviceDisplay();
          });
        };
        if (hashSlider) {
          hashSlider.addEventListener("input", function () {
            if (selectedContractId) setSelectedContractId(null);
            if (cloudState) cloudState.uiHashIdx = parseInt(hashSlider.value, 10) || 0;
            updateHashLabel();
            pickDevicesForSlider();
            updateSummary();
          });
          updateHashLabel();
          pickDevicesForSlider();
        }
        var onSelectPlan = function (btn, fromUser) {
          var tier = btn.getAttribute("data-tier");
          if (fromUser && selectedContractId) setSelectedContractId(null);
          selectedTier = tier;
          if (cloudState) cloudState.uiTierId = selectedTier;
          for (var i3 = 0; i3 < planButtons.length; i3++) {
            planButtons[i3].classList.toggle("selected", planButtons[i3] === btn);
          }
          updateHashLabel();
          updateSummary();
          updateGiftPreview();
        };
        var initialTierId = (cloudState && cloudState.uiTierId) ? String(cloudState.uiTierId) : null;
        var didSelect = false;
        for (var i4 = 0; i4 < planButtons.length; i4++) {
          (function (btn) {
            btn.addEventListener("click", function () {
              onSelectPlan(btn, true);
            });
            if (!didSelect && initialTierId && btn.getAttribute("data-tier") === initialTierId) {
              didSelect = true;
              onSelectPlan(btn, false);
            }
          })(planButtons[i4]);
        }
        if (!didSelect && planButtons && planButtons.length) {
          onSelectPlan(planButtons[0], false);
        }
        if (buyBtn) {
          buyBtn.addEventListener("click", function () {
            if (!selectedTier) return;
            var payWith = paySel ? String(paySel.value || uiPayWith || "USD").toUpperCase() : (uiPayWith || "USD");
            if (cloudState) cloudState.uiPayWith = payWith;
            var pkg = getSelectedPackage();
            var q = (Game.Btc && typeof Game.Btc.quoteCloudContract === "function") ? Game.Btc.quoteCloudContract(selectedTier, pkg ? pkg.idx : 0, payWith) : null;
            if (!q) return;
  
            var priceLine = "$" + q.priceUsd.toFixed(2);
            var balBeforeLine = "";
            var balAfterLine = "";
            if (payWith === "BTC") {
              var ex = (Game.Btc && Game.Btc.getExchange) ? Game.Btc.getExchange() : null;
              var btcPrice = ex && ex.priceUsd ? ex.priceUsd : 0;
              var btcCost = (btcPrice > 0) ? (q.priceUsd / btcPrice) : 0;
              priceLine = btcPrice > 0 ? (btcCost.toFixed(8) + " BTC") : "BTC price unavailable";
              var btcBal = Game.state && typeof Game.state.btcBalance === "number" ? Game.state.btcBalance : 0;
              balBeforeLine = btcBal.toFixed(8) + " BTC";
              balAfterLine = btcPrice > 0 ? Math.max(0, btcBal - btcCost).toFixed(8) + " BTC" : "-";
            } else if (payWith === "USDT") {
              var usdt = (Game.state && Game.state.crypto && Game.state.crypto.coins) ? Game.state.crypto.coins.USDT : null;
              var usdtBal = usdt && typeof usdt.balance === "number" ? usdt.balance : 0;
              priceLine = q.priceUsd.toFixed(2) + " USDT";
              balBeforeLine = usdtBal.toFixed(2) + " USDT";
              balAfterLine = Math.max(0, usdtBal - q.priceUsd).toFixed(2) + " USDT";
            } else {
              var money = Game.state && typeof Game.state.money === "number" ? Game.state.money : 0;
              balBeforeLine = "$" + money.toFixed(2);
              balAfterLine = "$" + Math.max(0, money - q.priceUsd).toFixed(2);
            }
  
            var hardwareName = currentMainDevice ? currentMainDevice.name : "-";
            var giftCount = q.giftCount || 0;
            var giftName = (giftCount > 0 && currentGiftDevice) ? currentGiftDevice.name : "-";
            var giftsLine = giftCount > 0 ? (giftCount + "x " + giftName) : "None";
            var discountRow = q.discountApplied ? ('<div class="field-row"><span>Discount</span><span class="mono">-' + q.discountPct + '% (crypto)</span></div>') : "";
  
            UI.confirmModal({
              title: "Confirm Cloud Contract",
              sub: q.tierName + " (" + q.days + " days)",
              confirmLabel: "Activate",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="field-row"><span>Hashrate</span><span class="mono">' + Math.round(q.hashrate).toLocaleString() + " H/s</span></div>" +
                '<div class="field-row"><span>Duration</span><span>' + q.days + " days</span></div>" +
                '<div class="field-row"><span>Daily BTC</span><span class="mono">' + q.dailyBtc.toFixed(8) + " BTC</span></div>" +
                discountRow +
                '<div class="field-row"><span>Price</span><span class="mono">' + priceLine + "</span></div>" +
                '<div class="field-row"><span>Pay with</span><span class="mono">' + payWith + "</span></div>" +
                '<div class="field-row"><span>Balance before</span><span class="mono">' + balBeforeLine + "</span></div>" +
                '<div class="field-row"><span>Balance after</span><span class="mono">' + balAfterLine + "</span></div>" +
                '<div class="field-row"><span>Hardware</span><span>' + hardwareName + "</span></div>" +
                '<div class="field-row"><span>Gifts</span><span>' + giftsLine + "</span></div>" +
                "</div>",
              onConfirm: function () {
                Game.Btc.buyCloudContract(q.tierId, pkg ? pkg.idx : 0, null, payWith);
                UI.renderPCCloudAdvanced(container);
              }
            });
          });
        }
        if (paySel) {
          paySel.addEventListener("change", function () {
            if (selectedContractId) setSelectedContractId(null);
            var nextPay = String(this.value || "USD").toUpperCase();
            if (cloudState) cloudState.uiPayWith = nextPay;
            UI.renderPCCloudAdvanced(container);
          });
        }
      },
      renderPCCloudPage: function (container) {
        return UI.renderPCCloudAdvanced(container);
        var cs = (Game.state.btc && Game.state.btc.cloud && Game.state.btc.cloud.contracts) ? Game.state.btc.cloud.contracts : [];
        var active = 0;
        var totalDaily = 0;
        for (var i = 0; i < cs.length; i++) {
          if (cs[i].daysLeft > 0) {
            active += 1;
            totalDaily += cs[i].dailyBtc || 0;
          }
        }
        var tiers = {
          bronze: { id: "bronze", name: "Bronze", badge: "", hashrate: "30 000 Hz", dailyBtc: 0.0000008, price: 18 },
          silver: { id: "silver", name: "Silver", badge: "1 gift", hashrate: "65 000 Hz", dailyBtc: 0.0000018, price: 27 },
          gold: { id: "gold", name: "Gold", badge: "2 gifts", hashrate: "120 000 Hz", dailyBtc: 0.0000035, price: 42 }
        };
        var html = [];
        html.push('<div class="pc-cloud">');
        html.push('<div class="pc-cloud-header flex-between">');
        html.push('<div>');
        html.push('<div class="pc-cloud-title">Cloud Mining</div>');
        html.push('<div class="pc-cloud-sub small dim">Rent remote hashrate and receive BTC payouts each in-game day.</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-pills">');
        html.push('<div class="pc-cloud-pill green"><span class="label">Active contracts</span><span class="value">' + active + '</span></div>');
        html.push('<div class="pc-cloud-pill"><span class="label">Total contracts</span><span class="value">' + cs.length + '</span></div>');
        html.push('<div class="pc-cloud-pill orange"><span class="label">Daily BTC (active)</span><span class="value">' + totalDaily.toFixed(6) + '</span></div>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-main">');
        // left column
        html.push('<div class="pc-cloud-left">');
        html.push('<div class="pc-cloud-block">');
        html.push('<div class="pc-cloud-block-header flex-between">');
        html.push('<span class="small dim">Hashrate</span>');
        html.push('<span id="pc-cloud-hash-label" class="mono">47 000 Hz</span>');
        html.push('</div>');
        html.push('<input id="pc-cloud-hash" type="range" min="3000" max="500000" step="1000" value="47000">');
        html.push('</div>');
        html.push('<div class="pc-cloud-block mt-8">');
        html.push('<div class="small dim">Select contract tier</div>');
        html.push('<div class="pc-cloud-plans">');
        for (var key in tiers) {
          if (!tiers.hasOwnProperty(key)) continue;
          var t = tiers[key];
          html.push('<button class="pc-cloud-plan" data-tier="' + t.id + '">');
          html.push('<div class="pc-cloud-plan-header flex-between">');
          html.push('<span>' + t.name + '</span>');
          if (t.id !== "bronze") {
            html.push('<span class="badge badge-blue pc-cloud-plan-badge">' + t.badge + '</span>');
          }
          html.push('</div>');
          html.push('<div class="pc-cloud-plan-body">');
          html.push('<div class="pc-cloud-plan-hash mono">' + t.hashrate + '</div>');
          html.push('<div class="pc-cloud-plan-meta small">~' + t.dailyBtc.toFixed(8) + ' BTC / day</div>');
          html.push('<div class="pc-cloud-plan-price">$' + t.price.toFixed(0) + '</div>');
          html.push('</div>');
          html.push('</button>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        // right column
        html.push('<div class="pc-cloud-right">');
        html.push('<div class="pc-cloud-block">');
        html.push('<div class="pc-cloud-block-header">Order summary</div>');
        html.push('<div class="pc-cloud-summary-rows small">');
        html.push('<div class="field-row"><span>Selected tier</span><span id="pc-cloud-summary-tier">None</span></div>');
        html.push('<div class="field-row"><span>Estimated hashrate</span><span id="pc-cloud-summary-hash">-</span></div>');
        html.push('<div class="field-row"><span>Daily BTC</span><span id="pc-cloud-summary-daily">-</span></div>');
        html.push('<div class="field-row"><span>Duration</span><span>20 in-game days</span></div>');
        html.push('<div class="field-row"><span>Price</span><span id="pc-cloud-summary-price">$0</span></div>');
        html.push('</div>');
        html.push('<div class="mt-8">');
        html.push('<button class="btn btn-small btn-primary pc-cloud-buy-btn" disabled>Activate contract</button>');
        html.push('</div>');
        html.push('</div>');
        html.push('<div class="pc-cloud-block mt-8">');
        html.push('<div class="pc-cloud-block-header flex-between">');
        html.push('<span>Active contracts</span>');
        html.push('<span class="small dim">' + (cs.length === 0 ? "None yet" : cs.length + " total") + '</span>');
        html.push('</div>');
        if (cs.length === 0) {
          html.push('<p class="small dim mt-4">Your first cloud mining contract will appear here once purchased.</p>');
        } else {
          html.push('<div class="mt-4 pc-cloud-contracts">');
          html.push('<table class="table"><thead><tr><th>ID</th><th>Tier</th><th>Days left</th><th>Daily BTC</th></tr></thead><tbody>');
          for (var i2 = 0; i2 < cs.length; i2++) {
            var c2 = cs[i2];
            html.push('<tr><td>' + c2.id + '</td><td>' + c2.tier + '</td><td>' + c2.daysLeft + '</td><td>' + c2.dailyBtc.toFixed(8) + '</td></tr>');
          }
          html.push('</tbody></table>');
          html.push('</div>');
        }
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        html.push('</div>');
        container.innerHTML = html.join("");
        // behaviour
        var hashSlider = container.querySelector("#pc-cloud-hash");
        var hashLabel = container.querySelector("#pc-cloud-hash-label");
        var updateHashLabel = function () {
          if (!hashSlider || !hashLabel) return;
          var val = parseInt(hashSlider.value, 10) || 0;
          hashLabel.textContent = val.toLocaleString() + " Hz";
        };
        if (hashSlider) {
          hashSlider.addEventListener("input", updateHashLabel);
          updateHashLabel();
        }
        var selectedTier = null;
        var buyBtn = container.querySelector(".pc-cloud-buy-btn");
        var planButtons = container.querySelectorAll(".pc-cloud-plan");
        var summaryTier = container.querySelector("#pc-cloud-summary-tier");
        var summaryHash = container.querySelector("#pc-cloud-summary-hash");
        var summaryDaily = container.querySelector("#pc-cloud-summary-daily");
        var summaryPrice = container.querySelector("#pc-cloud-summary-price");
        var updateSummary = function () {
          if (!selectedTier || !tiers[selectedTier]) {
            if (summaryTier) summaryTier.textContent = "None";
            if (summaryHash) summaryHash.textContent = "-";
            if (summaryDaily) summaryDaily.textContent = "-";
            if (summaryPrice) summaryPrice.textContent = "$0";
            if (buyBtn) buyBtn.disabled = true;
            return;
          }
          var t2 = tiers[selectedTier];
          if (summaryTier) summaryTier.textContent = t2.name + " (" + t2.id + ')';
          if (summaryHash) summaryHash.textContent = t2.hashrate;
          if (summaryDaily) summaryDaily.textContent = t2.dailyBtc.toFixed(8) + " BTC";
          if (summaryPrice) summaryPrice.textContent = "$" + t2.price.toFixed(0);
          if (buyBtn) {
            var money2 = Game.state && typeof Game.state.money === "number" ? Game.state.money : 0;
            buyBtn.disabled = (t2.price > money2);
          }
        };
        var onSelectPlan = function (btn) {
          var tier = btn.getAttribute("data-tier");
          selectedTier = tier;
          for (var j = 0; j < planButtons.length; j++) {
            planButtons[j].classList.toggle("selected", planButtons[j] === btn);
          }
          updateSummary();
        };
        for (var k = 0; k < planButtons.length; k++) {
          (function (btn) {
            btn.addEventListener("click", function () {
              onSelectPlan(btn);
            });
            if (btn.getAttribute("data-tier") === "bronze") {
              onSelectPlan(btn);
            }
          })(planButtons[k]);
        }
        if (buyBtn) {
          buyBtn.addEventListener("click", function () {
            if (!selectedTier) return;
            Game.Btc.buyCloudContract(selectedTier);
            UI.renderPCCloudPage(container);
          });
        }
      },
  });
})();
