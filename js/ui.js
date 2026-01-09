(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    currentTab: "overview",
    moneyInit: false,
    btcInit: false,
    _btcChartLastDrawTs: 0,
    _pcMarketChartLastDrawTs: 0,
    eventLogFilterText: "",
    eventLogFilterArea: "all",
    Tabs: {},
    init: function () {
      UI.moneyInit = false;
      UI.btcInit = false;
      var app = document.getElementById("app");
      app.innerHTML = UI.shellTemplate();
      UI.bindShellEvents();
      UI.ensureMusicState();
      UI.initMusicPlayer();
      var notifArea = document.getElementById("notification-area");
      if (notifArea) {
        notifArea.addEventListener("click", function (e) {
          var toast = e.target.closest(".toast");
          if (!toast) return;
          var idxAttr = toast.getAttribute("data-idx");
          var idx = typeof idxAttr === "string" ? parseInt(idxAttr, 10) : -1;
          if (!isNaN(idx) && idx >= 0 && Game && Game.state && Array.isArray(Game.state.notifications)) {
            if (idx < Game.state.notifications.length) {
              Game.state.notifications.splice(idx, 1);
            }
          }
          toast.remove();
        });
      }
      // On first run, show the welcome/help modal before any per-tab intro modal.
      UI._suppressTabIntroOnce = true;
      UI.setTab("overview");
      UI.refresh();
      UI.ensureDesktopNotificationsPref();
      UI.maybeShowWelcomeModal();
    },
    bindShellEvents: function () {
      var sidebar = document.querySelector(".sidebar");
      sidebar.addEventListener("click", function (e) {
        var btn = e.target.closest(".tab-btn");
        if (!btn) return;
        if (btn.disabled || btn.classList.contains("disabled")) return;
        var tab = btn.getAttribute("data-tab");
        UI.setTab(tab);
      });
      var saveBtn = document.getElementById("btn-save");
      saveBtn.addEventListener("click", function () {
        Game.save(false);
      });
      var pcBtn = document.getElementById("btn-pc");
      pcBtn.addEventListener("click", function () {
        Game.PC.toggle();
        UI.renderPC();
      });
      var settingsBtn = document.getElementById("btn-settings");
      if (settingsBtn) {
        settingsBtn.addEventListener("click", function () {
          UI._lastTabBeforeSettings = UI.currentTab || "overview";
          UI.setTab("settings");
        });
      }
      var helpBtn = document.getElementById("btn-help");
      if (helpBtn) {
        helpBtn.addEventListener("click", function () {
          UI.openHelpModal({ onboarding: false });
        });
      }
      var musicBtn = document.getElementById("btn-music-toggle");
      if (musicBtn) {
        musicBtn.addEventListener("click", function (e) {
          if (e && e.shiftKey) {
            UI.nextMusicTrack(Game && Game.state && Game.state.music && Game.state.music.enabled);
            UI.updateMusicWidget();
            return;
          }
          UI.toggleMusic();
        });
      }
      var marquee = document.getElementById("music-track-marquee");
      if (marquee) {
        marquee.addEventListener("click", function () {
          UI.nextMusicTrack(Game && Game.state && Game.state.music && Game.state.music.enabled);
          UI.updateMusicWidget();
        });
      }
  
      // Click BTC holdings to toggle confirmed vs total.
      var btcHoldEl = document.getElementById("stat-btc");
      if (btcHoldEl) {
        btcHoldEl.addEventListener("click", function () {
          if (!Game || !Game.state || !Game.state.btc) return;
          if (!Game.state.btc.ui || typeof Game.state.btc.ui !== "object") Game.state.btc.ui = {};
          var ui = Game.state.btc.ui;
          if (typeof ui.showConfirmedHoldings !== "boolean") ui.showConfirmedHoldings = false;
          ui.showConfirmedHoldings = !ui.showConfirmedHoldings;
          UI.updateTopbarBtcHoldings(true);
        });
      }
      var pcOverlay = document.getElementById("pc-overlay");
      var pcClose = document.getElementById("btn-pc-close");

      // PC/desktop interactions are modularized under js/desktop/.
      // If the modular binder exists, prefer it and skip the legacy handlers below.
      if (UI && typeof UI.bindPcEvents === "function") {
        UI._pcGlobalInputHandlersBound = true;
        UI._pcContextMenuCaptureHooked = true;
        UI._pcContextMenuHooked = true;
        UI._pcWindowMouseHooked = true;
        UI.bindPcEvents();
        return;
      }

      // Global PC input handlers (capture-phase) so rebuilt overlays still work.
      if (!UI._pcGlobalInputHandlersBound) {
        UI._pcGlobalInputHandlersBound = true;

        UI._ensurePcContextMenuFns = UI._ensurePcContextMenuFns || function () {
          if (UI._hidePcContextMenu && UI._showPcContextMenu) return;
          UI._hidePcContextMenu = function () {
            var menu = document.getElementById("pc-context-menu");
            if (!menu) return;
            menu.classList.add("hidden");
            menu.innerHTML = "";
            menu._ctx = null;
          };
          UI._showPcContextMenu = function (opts) {
            var menu = document.getElementById("pc-context-menu");
            if (!menu) return;
            menu.innerHTML = (opts && opts.html) ? opts.html : "";
            menu._ctx = (opts && opts.ctx) ? opts.ctx : null;
            menu.classList.remove("hidden");
            var desktop = document.getElementById("pc-desktop");
            var rect = desktop ? desktop.getBoundingClientRect() : null;
            var x = (opts && typeof opts.x === "number") ? opts.x : 0;
            var y = (opts && typeof opts.y === "number") ? opts.y : 0;
            if (rect) {
              var mx = x - rect.left;
              var my = y - rect.top;
              menu.style.left = Math.round(mx) + "px";
              menu.style.top = Math.round(my) + "px";
              var mrect = menu.getBoundingClientRect();
              var overflowX = (rect.left + mx + mrect.width) - rect.right;
              var overflowY = (rect.top + my + mrect.height) - rect.bottom;
              if (overflowX > 0) menu.style.left = Math.round(Math.max(0, mx - overflowX - 6)) + "px";
              if (overflowY > 0) menu.style.top = Math.round(Math.max(0, my - overflowY - 6)) + "px";
            } else {
              menu.style.left = Math.round(x) + "px";
              menu.style.top = Math.round(y) + "px";
            }
          };
        };

        document.addEventListener("dblclick", function (e) {
          try {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
            var overlay = document.getElementById("pc-overlay");
            if (!overlay || !overlay.contains(e.target)) return;
            var icon = e.target && e.target.closest ? e.target.closest("[data-open-app]") : null;
            if (!icon) return;
            var appId = icon.getAttribute("data-open-app");
            if (appId && UI && UI._pcOpenFromDesktop) {
              e.preventDefault();
              e.stopPropagation();
              UI._pcOpenFromDesktop(appId);
            }
          } catch (e2) {}
        }, true);

        document.addEventListener("contextmenu", function (e) {
          try {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
            var overlay = document.getElementById("pc-overlay");
            if (!overlay || !overlay.contains(e.target)) return;

            // Always suppress native menu in the PC overlay.
            e.preventDefault();
            e.stopPropagation();

            if (UI && UI._ensurePcContextMenuFns) UI._ensurePcContextMenuFns();
            if (!UI || !UI._showPcContextMenu) return;

            function item(label, action, kbd, disabled) {
              return '<button type="button" class="pc-context-item" data-pc-menu-action="' + action + '"' + (disabled ? " disabled" : "") + ">" +
                "<span>" + label + "</span>" +
                (kbd ? ('<span class="pc-context-kbd">' + kbd + "</span>") : "") +
              "</button>";
            }
            function sep() { return '<div class="pc-context-sep"></div>'; }

            var taskBtn = e.target.closest ? e.target.closest(".pc-taskbar-window-btn") : null;
            var pinBtn = e.target.closest ? e.target.closest(".pc-taskbar-pin-btn") : null;
            var taskbar = e.target.closest ? e.target.closest("#pc-taskbar") : null;
            var icon = e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
            var frame = e.target.closest ? e.target.closest(".pc-window-frame") : null;
            var desktop = document.getElementById("pc-desktop");
            var onDesktop = desktop && desktop.contains(e.target);

            // Ignore right-clicks on window frames/content (but keep native menu suppressed).
            if (frame) { if (UI._hidePcContextMenu) UI._hidePcContextMenu(); return; }
            if (!taskbar && !onDesktop) { if (UI._hidePcContextMenu) UI._hidePcContextMenu(); return; }

            if (icon) {
              var iid = String(icon.getAttribute("data-open-app") || "");
              if (!iid) return;
              var pinned0 = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(iid) : false;
              UI._showPcContextMenu({
                x: e.clientX, y: e.clientY,
                html: [
                  item("Open", "icon_open"),
                  sep(),
                  item("Pin to taskbar", "icon_pin", null, pinned0),
                  item("Unpin from taskbar", "icon_unpin", null, !pinned0)
                ].join(""),
                ctx: { kind: "icon", appId: iid }
              });
              return;
            }

            if (taskBtn) {
              var wid = parseInt(taskBtn.getAttribute("data-win-id"), 10);
              var w = (isFinite(wid) && Game.PC && Game.PC.getWindowById) ? Game.PC.getWindowById(wid) : null;
              var appId = w ? String(w.appId || "") : "";
              var pinned = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(appId) : false;
              UI._showPcContextMenu({
                x: e.clientX, y: e.clientY,
                html: [
                  item("Open another window", "task_open_another", "Ctrl+N"),
                  item("Pin to taskbar", "task_pin", null, pinned || !appId),
                  item("Unpin from taskbar", "task_unpin", null, (!pinned) || !appId),
                  sep(),
                  item("Minimize", "task_minimize", "Ctrl+M", !w || w.minimized),
                  item("Close", "task_close", "Alt+F4", !w)
                ].join(""),
                ctx: { kind: "task", winId: wid, appId: appId }
              });
              return;
            }

            if (pinBtn) {
              var pid = String(pinBtn.getAttribute("data-pin-app") || "");
              var isPinned = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(pid) : false;
              UI._showPcContextMenu({
                x: e.clientX, y: e.clientY,
                html: [
                  item("Open", "pin_open"),
                  item("Open another window", "pin_open_another", "Ctrl+N"),
                  sep(),
                  item("Unpin from taskbar", "pin_unpin", null, !isPinned)
                ].join(""),
                ctx: { kind: "pin", appId: pid }
              });
              return;
            }

            // Desktop wallpaper menu.
            var lockToGrid = !!(Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.lockToGrid);
            UI._showPcContextMenu({
              x: e.clientX, y: e.clientY,
              html: [
                item("Refresh", "desk_refresh", "F5"),
                item("Auto arrange icons", "desk_auto_arrange"),
                item(lockToGrid ? "Lock to grid V" : "Lock to grid", "desk_toggle_grid"),
                sep(),
                item("Open Task Manager", "desk_open_monitor"),
                item("Open Ninja Web", "desk_open_internet"),
                sep(),
                item("Personalize (simulated)", "desk_personalize", null, true)
              ].join(""),
              ctx: { kind: "desktop" }
            });
          } catch (e2) {}
        }, true);

        document.addEventListener("click", function (e) {
          try {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
            var overlay = document.getElementById("pc-overlay");
            if (!overlay || !overlay.contains(e.target)) return;
            var menu = document.getElementById("pc-context-menu");
            if (!menu || menu.classList.contains("hidden")) return;
            var btn = e.target && e.target.closest ? e.target.closest("[data-pc-menu-action]") : null;
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            var action = btn.getAttribute("data-pc-menu-action");
            var ctx = menu._ctx || {};

            function doAutoArrange() {
              if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.desktop) return;
              if (!Game.state.pc.desktop.icons) Game.state.pc.desktop.icons = {};
              var desktopApps = (Game.state.pc.desktop && Array.isArray(Game.state.pc.desktop.desktopApps)) ? Game.state.pc.desktop.desktopApps.slice() : [];
              for (var i = 0; i < desktopApps.length; i++) {
                var id = desktopApps[i];
                var col = i % 2;
                var row = Math.floor(i / 2);
                Game.state.pc.desktop.icons[id] = { x: 10 + col * 134, y: 10 + row * 92 };
              }
            }

            if (ctx.kind === "desktop") {
              if (action === "desk_refresh") UI.renderPC();
              else if (action === "desk_auto_arrange") { doAutoArrange(); UI.renderPC(); }
              else if (action === "desk_toggle_grid") {
                if (Game && Game.state && Game.state.pc && Game.state.pc.desktop) {
                  Game.state.pc.desktop.lockToGrid = !Game.state.pc.desktop.lockToGrid;
                }
                UI.renderPC();
              }
              else if (action === "desk_open_monitor") { Game.PC.openApp("monitor"); UI.renderPC(); }
              else if (action === "desk_open_internet") { Game.PC.openApp("internet"); UI.renderPC(); }
            } else if (ctx.kind === "icon") {
              if (action === "icon_open") { if (UI && UI._pcOpenFromDesktop) UI._pcOpenFromDesktop(ctx.appId); }
              else if (action === "icon_pin") { if (ctx.appId) Game.PC.pinApp(ctx.appId); UI.renderPC(); }
              else if (action === "icon_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
            } else if (ctx.kind === "task") {
              if (action === "task_close") { Game.PC.closeWindow(ctx.winId); UI.renderPC(); }
              else if (action === "task_minimize") { Game.PC.minimizeWindow(ctx.winId); UI.renderPC(); }
              else if (action === "task_pin") { if (ctx.appId) Game.PC.pinApp(ctx.appId); UI.renderPC(); }
              else if (action === "task_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
              else if (action === "task_open_another") {
                if (ctx.appId && Game.PC.openAppNew) Game.PC.openAppNew(ctx.appId);
                else if (ctx.appId) Game.PC.openApp(ctx.appId);
                UI.renderPC();
              }
            } else if (ctx.kind === "pin") {
              if (action === "pin_open") { if (ctx.appId) Game.PC.openApp(ctx.appId); UI.renderPC(); }
              else if (action === "pin_open_another") { if (ctx.appId && Game.PC.openAppNew) Game.PC.openAppNew(ctx.appId); UI.renderPC(); }
              else if (action === "pin_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
            }

            if (UI && UI._hidePcContextMenu) UI._hidePcContextMenu();
          } catch (e2) {}
        }, true);

        document.addEventListener("mousedown", function (e) {
          try {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
            var overlay = document.getElementById("pc-overlay");
            if (!overlay || !overlay.contains(e.target)) return;

            // Desktop icon drag start (left button only).
            var icon = e.target && e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
            if (icon && e.button === 0) {
              var appId = icon.getAttribute("data-open-app");
              if (appId) {
                var desktop = document.getElementById("pc-desktop");
                var rect = desktop ? desktop.getBoundingClientRect() : null;
                var startLeft = parseFloat(icon.style.left || "0");
                var startTop = parseFloat(icon.style.top || "0");
                UI._pcIconDragState = {
                  appId: appId,
                  el: icon,
                  startX: e.clientX,
                  startY: e.clientY,
                  startLeft: isFinite(startLeft) ? startLeft : 0,
                  startTop: isFinite(startTop) ? startTop : 0,
                  dragging: false,
                  desktopRect: rect
                };
              }
              return;
            }

            // Window drag/resize start.
            var titlebar = e.target && e.target.closest ? e.target.closest(".pc-window-titlebar") : null;
            var resizer = e.target && e.target.closest ? e.target.closest(".pc-window-resize") : null;
            if (!titlebar && !resizer) return;
            var frame = e.target && e.target.closest ? e.target.closest(".pc-window-frame") : null;
            if (!frame) return;
            var winId = parseInt(frame.getAttribute("data-win-id"), 10);
            if (!isFinite(winId) || !Game.PC || !Game.PC.getWindowById) return;

            // Drop any lingering icon drag state.
            if (UI._pcIconDragState) {
              try {
                if (UI._pcIconDragState.ghostEl && UI._pcIconDragState.ghostEl.parentNode) UI._pcIconDragState.ghostEl.parentNode.removeChild(UI._pcIconDragState.ghostEl);
              } catch (e3) {}
              UI._pcIconDragState = null;
            }

            Game.PC.focusWindow(winId);
            var w = Game.PC.getWindowById(winId);
            if (!w) return;

            e.preventDefault();
            e.stopPropagation();

            if (resizer) {
              UI._pcDragState = {
                mode: "resize",
                winId: winId,
                startX: e.clientX,
                startY: e.clientY,
                startW: w.w || 520,
                startH: w.h || 420
              };
              return;
            }
            UI._pcDragState = {
              mode: "drag",
              winId: winId,
              startX: e.clientX,
              startY: e.clientY,
              startLeft: w.x || 0,
              startTop: w.y || 0
            };
          } catch (e2) {}
        }, true);
      }

      if (!UI._pcContextMenuCaptureHooked) {
        UI._pcContextMenuCaptureHooked = true;
        pcOverlay.addEventListener("contextmenu", function (e) {
          try {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
            // Always suppress the native OS/browser menu when right-clicking inside the PC overlay.
            e.preventDefault();
          } catch (e2) {}
        }, true);
      }
      if (!UI._pcOpenFromDesktop) {
        UI._pcOpenFromDesktop = function (appId) {
          var id = String(appId || "");
          if (!id) return;
          if (Game && Game.PC && Game.PC.isAppInstalled && !Game.PC.isAppInstalled(id)) {
            // Internet browser is the exception: can download without already having the browser.
            if (id === "internet") {
              if (Game.PC.startAppInstall) {
                var d = Game.PC.startAppInstall("internet", { minimized: false });
                if (d && d.id && Game.PC.openDownload) Game.PC.openDownload(d.id);
                if (UI && UI.renderPC) UI.renderPC();
              }
              return;
            }

            // Other apps are installed via their Ninja Web app page.
            if (Game.PC.isAppInstalled("internet") && UI && UI.pcWebNavigate) {
              UI.pcWebNavigate("https://ninja.web/apps/" + id);
              Game.PC.openApp("internet");
              if (UI && UI.renderPC) UI.renderPC();
              return;
            }
            if (Game && Game.addNotification) Game.addNotification("Install Ninja Web Browser first.");
            return;
          }
          Game.PC.openApp(id);
          if (UI && UI.renderPC) UI.renderPC();
        };
      }
      pcClose.addEventListener("click", function () {
        Game.state.pc.isOpen = false;
        UI.renderPC();
      });
      pcOverlay.addEventListener("click", function (e) {
        if (e.target.id === "pc-overlay") {
          Game.state.pc.isOpen = false;
          UI.renderPC();
        }
      });
      pcOverlay.addEventListener("click", function (e) {
        // Close any open PC context menu on normal click.
        try {
          if (UI && UI._hidePcContextMenu) {
            var cm = document.getElementById("pc-context-menu");
            var open = cm && !cm.classList.contains("hidden");
            var clickedInMenu = cm && cm.contains(e.target);
            if (open && !clickedInMenu) UI._hidePcContextMenu();
          }
        } catch (e2) {}
        // Close Start menu when clicking outside it.
        try {
          if (Game && Game.state && Game.state.pc && Game.state.pc.uiStartMenuOpen) {
            var startMenu = document.getElementById("pc-start-menu");
            var startBtn = document.getElementById("pc-start-btn");
            var clickedInStart = startMenu && startMenu.contains(e.target);
            var clickedStartBtn = startBtn && startBtn.contains(e.target);
            if (!clickedInStart && !clickedStartBtn) {
              Game.state.pc.uiStartMenuOpen = false;
              UI.renderPC();
              return;
            }
          }
        } catch (e2) {}

        function hitTestUnderPcWindows(clientX, clientY) {
          var windowsLayer = document.getElementById("pc-windows");
          if (!windowsLayer) return null;
          var prev = windowsLayer.style.pointerEvents;
          windowsLayer.style.pointerEvents = "none";
          var el = null;
          try { el = document.elementFromPoint(clientX, clientY); } catch (e2) {}
          windowsLayer.style.pointerEvents = prev || "";
          return el;
        }

        // If the click landed on the empty windows layer, reroute to icons underneath.
        if (e && e.target && e.target.id === "pc-windows") {
          var under = hitTestUnderPcWindows(e.clientX, e.clientY);
          if (under) {
            var iconUnder = under.closest ? under.closest("[data-open-app]") : null;
            if (iconUnder) e.target = iconUnder;
          }
        }

        var dlBtn = e.target.closest(".pc-download-btn");
        if (dlBtn) {
          var dlId = dlBtn.getAttribute("data-download-id");
          if (dlId && Game && Game.PC && Game.PC.openDownload) {
            if (Game && Game.Downloads && Game.Downloads.getById) {
              var d = Game.Downloads.getById(dlId);
              if (d) d.minimized = false;
            }
            Game.PC.openDownload(dlId);
            UI.renderPC();
          } else if (dlId && UI.openDownloadModal) {
            UI.openDownloadModal(dlId);
          }
          return;
        }

        var procBtn = e.target.closest(".pc-proc-btn");
        if (procBtn) {
          var app = procBtn.getAttribute("data-app");
          if (app) {
            Game.PC.openApp(app);
            UI.renderPC();
          }
          return;
        }

        var desktopIcon = e.target.closest("[data-open-app]");
        if (desktopIcon) {
          if (UI._pcSuppressNextIconClick) {
            UI._pcSuppressNextIconClick = false;
            return;
          }
          // Single-click is selection-only; open via double-click handler.
          return;
        }

        var taskBtn = e.target.closest(".pc-taskbar-window-btn");
        if (taskBtn) {
          var wid = parseInt(taskBtn.getAttribute("data-win-id"), 10);
          if (isFinite(wid) && Game && Game.PC) {
            var w = Game.PC.getWindowById ? Game.PC.getWindowById(wid) : null;
            if (w && w.minimized) Game.PC.focusWindow(wid);
            else if (Game.state.pc && Game.state.pc.activeWindowId === wid) Game.PC.minimizeWindow(wid);
            else Game.PC.focusWindow(wid);
            UI.renderPC();
          }
          return;
        }

        var pinBtn = e.target.closest(".pc-taskbar-pin-btn");
        if (pinBtn) {
          var appId = pinBtn.getAttribute("data-pin-app");
          if (appId && Game && Game.PC && Game.PC.openApp) {
            Game.PC.openApp(appId);
            UI.renderPC();
          }
          return;
        }

        var startBtn = e.target.closest("#pc-start-btn");
        if (startBtn) {
          if (Game && Game.state && Game.state.pc) {
            Game.state.pc.uiStartMenuOpen = !Game.state.pc.uiStartMenuOpen;
          }
          UI.renderPC();
          return;
        }

        var winCtl = e.target.closest(".pc-win-btn");
        if (winCtl) {
          var action = winCtl.getAttribute("data-action");
          var winId = parseInt(winCtl.getAttribute("data-win-id"), 10);
          if (isFinite(winId)) {
            if (action === "close") Game.PC.closeWindow(winId);
            else if (action === "minimize") Game.PC.minimizeWindow(winId);
            UI.renderPC();
          }
          return;
        }
      });
      pcOverlay.addEventListener("dblclick", function (e) {
        if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
        var desktopIcon = e.target && e.target.closest ? e.target.closest("[data-open-app]") : null;
        if (!desktopIcon) return;
        var appId = desktopIcon.getAttribute("data-open-app");
        if (appId && UI && UI._pcOpenFromDesktop) UI._pcOpenFromDesktop(appId);
      });

      // Start menu actions (open, pin, desktop shortcut).
      pcOverlay.addEventListener("click", function (e) {
        var openBtn = e.target.closest("[data-start-open]");
        if (openBtn) {
          var appId = openBtn.getAttribute("data-start-open");
          if (!appId) return;

          if (Game && Game.PC && Game.PC.isAppInstalled && !Game.PC.isAppInstalled(appId) && appId !== "internet") {
            if (Game.PC.isAppInstalled("internet") && UI && UI.pcWebNavigate) {
              UI.pcWebNavigate("https://ninja.web/apps/" + appId);
              Game.PC.openApp("internet");
              if (Game.state && Game.state.pc) Game.state.pc.uiStartMenuOpen = false;
              UI.renderPC();
              return;
            }
            if (Game && Game.addNotification) Game.addNotification("Install Ninja Web Browser first.");
            return;
          }

          // Internet browser is the exception: can be downloaded without already having the browser.
          if (Game && Game.PC && Game.PC.isAppInstalled && !Game.PC.isAppInstalled(appId) && appId === "internet") {
            if (Game.PC.startAppInstall) {
              var d = Game.PC.startAppInstall("internet", { minimized: false });
              if (d && d.id && Game.PC.openDownload) Game.PC.openDownload(d.id);
              if (Game.state && Game.state.pc) Game.state.pc.uiStartMenuOpen = false;
              UI.renderPC();
            }
            return;
          }

          Game.PC.openApp(appId);
          if (Game.state && Game.state.pc) Game.state.pc.uiStartMenuOpen = false;
          UI.renderPC();
          return;
        }

        var deskToggle = e.target.closest("[data-start-desktop-toggle]");
        if (deskToggle) {
          var did = deskToggle.getAttribute("data-start-desktop-toggle");
          if (!did || !Game || !Game.PC) return;
          if (Game.PC.isOnDesktop && Game.PC.isOnDesktop(did)) Game.PC.removeFromDesktop(did);
          else if (Game.PC.addToDesktop) Game.PC.addToDesktop(did);
          UI.renderPC();
          return;
        }

        var pinToggle = e.target.closest("[data-start-pin-toggle]");
        if (pinToggle) {
          var pid = pinToggle.getAttribute("data-start-pin-toggle");
          if (!pid || !Game || !Game.PC) return;
          if (Game.PC.isPinned && Game.PC.isPinned(pid)) Game.PC.unpinApp(pid);
          else if (Game.PC.pinApp) Game.PC.pinApp(pid);
          UI.renderPC();
          return;
        }
      });

      // Right-click context menu (desktop wallpaper + taskbar items).
      if (!UI._pcContextMenuHooked) {
        UI._pcContextMenuHooked = true;

        UI._hidePcContextMenu = function () {
          var menu = document.getElementById("pc-context-menu");
          if (!menu) return;
          menu.classList.add("hidden");
          menu.innerHTML = "";
          menu._ctx = null;
        };

        UI._showPcContextMenu = function (opts) {
          var menu = document.getElementById("pc-context-menu");
          if (!menu) return;
          menu.innerHTML = (opts && opts.html) ? opts.html : "";
          menu._ctx = (opts && opts.ctx) ? opts.ctx : null;
          menu.classList.remove("hidden");

          var desktop = document.getElementById("pc-desktop");
          var rect = desktop ? desktop.getBoundingClientRect() : null;
          var x = (opts && typeof opts.x === "number") ? opts.x : 0;
          var y = (opts && typeof opts.y === "number") ? opts.y : 0;
          if (rect) {
            var mx = x - rect.left;
            var my = y - rect.top;
            menu.style.left = Math.round(mx) + "px";
            menu.style.top = Math.round(my) + "px";

            // Clamp after render.
            var mrect = menu.getBoundingClientRect();
            var overflowX = (rect.left + mx + mrect.width) - rect.right;
            var overflowY = (rect.top + my + mrect.height) - rect.bottom;
            if (overflowX > 0) menu.style.left = Math.round(Math.max(0, mx - overflowX - 6)) + "px";
            if (overflowY > 0) menu.style.top = Math.round(Math.max(0, my - overflowY - 6)) + "px";
          } else {
            menu.style.left = Math.round(x) + "px";
            menu.style.top = Math.round(y) + "px";
          }
        };

        pcOverlay.addEventListener("contextmenu", function (e) {
          if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
          var menu = document.getElementById("pc-context-menu");
          if (!menu) return;

          var taskBtn = e.target.closest(".pc-taskbar-window-btn");
          var pinBtn = e.target.closest(".pc-taskbar-pin-btn");
          var taskbar = e.target.closest("#pc-taskbar");
          var icon = e.target.closest(".pc-desktop-icon");
          var frame = e.target.closest(".pc-window-frame");

          // Always suppress the native context menu inside the PC overlay.
          // (We can choose to show nothing for some targets, but never the OS menu.)
          try { e.preventDefault(); e.stopPropagation(); } catch (e2) {}

          // Only show our menu for desktop wallpaper/taskbar items.
          if (!taskbar && !(e.target && e.target.id === "pc-desktop")) {
            // If you right-click on the wallpaper area inside pc-desktop, allow it.
            var desktop = document.getElementById("pc-desktop");
            if (!desktop || !desktop.contains(e.target)) {
              if (UI && UI._hidePcContextMenu) UI._hidePcContextMenu();
              return;
            }
          }
          // Ignore right-clicks on window frames/content (but still suppress OS menu).
          if (frame) {
            if (UI && UI._hidePcContextMenu) UI._hidePcContextMenu();
            return;
          }

          function item(label, action, kbd, disabled) {
            return '<button type="button" class="pc-context-item" data-pc-menu-action="' + action + '"' + (disabled ? " disabled" : "") + ">" +
              "<span>" + label + "</span>" +
              (kbd ? ('<span class="pc-context-kbd">' + kbd + "</span>") : "") +
            "</button>";
          }

          function sep() { return '<div class="pc-context-sep"></div>'; }

          // Desktop icon menu.
          if (icon) {
            var iid = String(icon.getAttribute("data-open-app") || "");
            if (!iid) return;
            var pinned0 = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(iid) : false;
            var html0 = [
              item("Open", "icon_open"),
              sep(),
              item("Pin to taskbar", "icon_pin", null, pinned0),
              item("Unpin from taskbar", "icon_unpin", null, !pinned0)
            ].join("");
            UI._showPcContextMenu({ x: e.clientX, y: e.clientY, html: html0, ctx: { kind: "icon", appId: iid } });
            return;
          }

          // Taskbar item menu.
          if (taskBtn) {
            var wid = parseInt(taskBtn.getAttribute("data-win-id"), 10);
            var w = (isFinite(wid) && Game.PC && Game.PC.getWindowById) ? Game.PC.getWindowById(wid) : null;
            var appId = w ? String(w.appId || "") : "";
            var pinned = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(appId) : false;
            var html = [
              item("Open another window", "task_open_another", "Ctrl+N"),
              item("Pin to taskbar", "task_pin", null, pinned || !appId),
              item("Unpin from taskbar", "task_unpin", null, (!pinned) || !appId),
              sep(),
              item("Minimize", "task_minimize", "Ctrl+M", !w || w.minimized),
              item("Close", "task_close", "Alt+F4", !w)
            ].join("");
            UI._showPcContextMenu({ x: e.clientX, y: e.clientY, html: html, ctx: { kind: "task", winId: wid, appId: appId } });
            return;
          }

          // Pinned app menu.
          if (pinBtn) {
            var pid = String(pinBtn.getAttribute("data-pin-app") || "");
            var isPinned = (Game.PC && Game.PC.isPinned) ? Game.PC.isPinned(pid) : false;
            var html2 = [
              item("Open", "pin_open"),
              item("Open another window", "pin_open_another", "Ctrl+N"),
              sep(),
              item("Unpin from taskbar", "pin_unpin", null, !isPinned)
            ].join("");
            UI._showPcContextMenu({ x: e.clientX, y: e.clientY, html: html2, ctx: { kind: "pin", appId: pid } });
            return;
          }

          // Desktop wallpaper menu.
          var lockToGrid = !!(Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.lockToGrid);
          var html3 = [
            item("Refresh", "desk_refresh", "F5"),
            item("Auto arrange icons", "desk_auto_arrange"),
            item(lockToGrid ? "Lock to grid ✓" : "Lock to grid", "desk_toggle_grid"),
            sep(),
            item("Open Task Manager", "desk_open_monitor"),
            item("Open Ninja Web", "desk_open_internet"),
            sep(),
            item("Personalize (simulated)", "desk_personalize", null, true)
          ].join("");
          UI._showPcContextMenu({ x: e.clientX, y: e.clientY, html: html3, ctx: { kind: "desktop" } });
        });

        pcOverlay.addEventListener("click", function (e) {
          var menu = document.getElementById("pc-context-menu");
          if (!menu || menu.classList.contains("hidden")) return;
          var btn = e.target.closest("[data-pc-menu-action]");
          if (!btn) return;
          var action = btn.getAttribute("data-pc-menu-action");
          var ctx = menu._ctx || {};

          function doAutoArrange() {
            if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.desktop) return;
            if (!Game.state.pc.desktop.icons) Game.state.pc.desktop.icons = {};
            var desktopApps = (Game.state.pc.desktop && Array.isArray(Game.state.pc.desktop.desktopApps)) ? Game.state.pc.desktop.desktopApps.slice() : [];
            for (var i = 0; i < desktopApps.length; i++) {
              var id = desktopApps[i];
              var col = i % 2;
              var row = Math.floor(i / 2);
              Game.state.pc.desktop.icons[id] = { x: 10 + col * 134, y: 10 + row * 92 };
            }
          }

          if (ctx.kind === "desktop") {
            if (action === "desk_refresh") UI.renderPC();
            else if (action === "desk_auto_arrange") { doAutoArrange(); UI.renderPC(); }
            else if (action === "desk_toggle_grid") {
              if (Game && Game.state && Game.state.pc && Game.state.pc.desktop) {
                Game.state.pc.desktop.lockToGrid = !Game.state.pc.desktop.lockToGrid;
              }
              UI.renderPC();
            }
            else if (action === "desk_open_monitor") { Game.PC.openApp("monitor"); UI.renderPC(); }
            else if (action === "desk_open_internet") { Game.PC.openApp("internet"); UI.renderPC(); }
          } else if (ctx.kind === "icon") {
            if (action === "icon_open") { if (UI && UI._pcOpenFromDesktop) UI._pcOpenFromDesktop(ctx.appId); }
            else if (action === "icon_pin") { if (ctx.appId) Game.PC.pinApp(ctx.appId); UI.renderPC(); }
            else if (action === "icon_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
          } else if (ctx.kind === "task") {
            if (action === "task_close") { Game.PC.closeWindow(ctx.winId); UI.renderPC(); }
            else if (action === "task_minimize") { Game.PC.minimizeWindow(ctx.winId); UI.renderPC(); }
            else if (action === "task_pin") { if (ctx.appId) Game.PC.pinApp(ctx.appId); UI.renderPC(); }
            else if (action === "task_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
            else if (action === "task_open_another") {
              if (ctx.appId && Game.PC.openAppNew) Game.PC.openAppNew(ctx.appId);
              else if (ctx.appId) Game.PC.openApp(ctx.appId);
              UI.renderPC();
            }
          } else if (ctx.kind === "pin") {
            if (action === "pin_open") { if (ctx.appId) Game.PC.openApp(ctx.appId); UI.renderPC(); }
            else if (action === "pin_open_another") { if (ctx.appId && Game.PC.openAppNew) Game.PC.openAppNew(ctx.appId); UI.renderPC(); }
            else if (action === "pin_unpin") { if (ctx.appId) Game.PC.unpinApp(ctx.appId); UI.renderPC(); }
          }

          UI._hidePcContextMenu();
        });

        window.addEventListener("keydown", function (e) {
          if (e && e.key === "Escape") UI._hidePcContextMenu();
        });
      }

      // Drag + resize window interactions.
      if (!UI._pcWindowMouseHooked) {
        UI._pcWindowMouseHooked = true;
        UI._pcDragState = null;
        UI._pcIconDragState = null;
        UI._pcSuppressNextIconClick = false;

        function hitTestUnderPcWindows(clientX, clientY) {
          var windowsLayer = document.getElementById("pc-windows");
          if (!windowsLayer) return null;
          var prev = windowsLayer.style.pointerEvents;
          windowsLayer.style.pointerEvents = "none";
          var el = null;
          try { el = document.elementFromPoint(clientX, clientY); } catch (e2) {}
          windowsLayer.style.pointerEvents = prev || "";
          return el;
        }

        pcOverlay.addEventListener("mousedown", function (e) {
          if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;

          var icon = e.target && e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
          if (!icon && e && e.target && e.target.id === "pc-windows") {
            var under = hitTestUnderPcWindows(e.clientX, e.clientY);
            icon = under && under.closest ? under.closest(".pc-desktop-icon") : null;
          }
          if (icon && e.button === 0) {
            var appId = icon.getAttribute("data-open-app");
            if (!appId) return;
            var desktop = document.getElementById("pc-desktop");
            var rect = desktop ? desktop.getBoundingClientRect() : null;
            var startLeft = parseFloat(icon.style.left || "0");
            var startTop = parseFloat(icon.style.top || "0");
           UI._pcIconDragState = {
              appId: appId,
              el: icon,
              startX: e.clientX,
              startY: e.clientY,
              startLeft: isFinite(startLeft) ? startLeft : 0,
              startTop: isFinite(startTop) ? startTop : 0,
              dragging: false,
              desktopRect: rect
            };
            return;
          }

          var titlebar = e.target.closest(".pc-window-titlebar");
          var resizer = e.target.closest(".pc-window-resize");
          var frame = e.target.closest(".pc-window-frame");
          if (!frame) return;
          var winId = parseInt(frame.getAttribute("data-win-id"), 10);
          if (!isFinite(winId) || !Game.PC || !Game.PC.getWindowById) return;

          // If a desktop icon drag state is lingering, drop it so it can't block window drags.
          if (UI._pcIconDragState) {
            try {
              if (UI._pcIconDragState.ghostEl && UI._pcIconDragState.ghostEl.parentNode) UI._pcIconDragState.ghostEl.parentNode.removeChild(UI._pcIconDragState.ghostEl);
            } catch (e2) {}
            UI._pcIconDragState = null;
          }

          // Focus the window on any interaction.
          Game.PC.focusWindow(winId);
          try {
            var overlayEl = document.getElementById("pc-overlay");
            if (overlayEl && Game.state && Game.state.pc) overlayEl.setAttribute("data-active-app", String(Game.state.pc.activeApp || "desktop"));
            var activeFrames = document.querySelectorAll(".pc-window-frame.is-active");
            for (var ai = 0; ai < activeFrames.length; ai++) activeFrames[ai].classList.remove("is-active");
            frame.classList.add("is-active");
            var focused = Game.PC.getWindowById(winId);
            if (focused) frame.style.zIndex = Math.round(focused.z || 1);
            if (UI.renderPCTaskbar) UI.renderPCTaskbar();
          } catch (e2) {}

          var w = Game.PC.getWindowById(winId);
          if (!w) return;

          if (resizer) {
            e.preventDefault();
            UI._pcDragState = {
              mode: "resize",
              winId: winId,
              startX: e.clientX,
              startY: e.clientY,
              startW: w.w || 520,
              startH: w.h || 420
            };
            return;
          }
          if (titlebar) {
            e.preventDefault();
            UI._pcDragState = {
              mode: "drag",
              winId: winId,
              startX: e.clientX,
              startY: e.clientY,
              startLeft: w.x || 0,
              startTop: w.y || 0
            };
          }
        });

        window.addEventListener("mousemove", function (e) {
          var ids = UI._pcIconDragState;
          if (ids && ids.el && Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) {
            // If mouse buttons are no longer pressed, treat as a canceled drag (prevents "stuck" state).
            if (typeof e.buttons === "number" && e.buttons === 0) {
              try {
                if (ids.ghostEl && ids.ghostEl.parentNode) ids.ghostEl.parentNode.removeChild(ids.ghostEl);
              } catch (e2) {}
              UI._pcIconDragState = null;
            } else {
              var moved = Math.abs(e.clientX - ids.startX) + Math.abs(e.clientY - ids.startY);
              if (!ids.dragging) {
                // Don't start moving until the pointer has moved enough to count as a drag.
                if (moved <= 6) {
                  // Important: don't return here, or a stuck icon state could block window dragging.
                } else {
                  ids.dragging = true;
                  UI._pcSuppressNextIconClick = true;
                }
              }
              if (ids.dragging) {
                var desktop = document.getElementById("pc-desktop");
                var rect = desktop ? desktop.getBoundingClientRect() : ids.desktopRect;
                var nx = ids.startLeft + (e.clientX - ids.startX);
                var ny = ids.startTop + (e.clientY - ids.startY);

                // Clamp to desktop bounds (leave room for taskbar and avoid negative).
                if (rect) {
                  var maxX = Math.max(0, rect.width - 10 - 120);
                  var maxY = Math.max(0, rect.height - 54 - 10 - 72);
                  nx = Math.max(0, Math.min(nx, maxX));
                  ny = Math.max(0, Math.min(ny, maxY));
                }

                ids.el.style.left = Math.round(nx) + "px";
                ids.el.style.top = Math.round(ny) + "px";
                ids.currentLeft = nx;
                ids.currentTop = ny;

                // Show a grid "ghost" if lock-to-grid is enabled; snap happens on release.
                var lock = !!(Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.lockToGrid);
                if (lock) {
                  var snapX = 134;
                  var snapY = 92;
                  var gx = Math.round(nx / snapX) * snapX;
                  var gy = Math.round(ny / snapY) * snapY;
                  ids.snapLeft = gx;
                  ids.snapTop = gy;
                  if (!ids.ghostEl) {
                    var parent = document.getElementById("pc-desktop-icons");
                    if (parent) {
                      var ghost = document.createElement("div");
                      ghost.className = "pc-desktop-icon pc-desktop-icon-ghost";
                      ghost.innerHTML = ids.el.innerHTML;
                      parent.appendChild(ghost);
                      ids.ghostEl = ghost;
                    }
                  }
                  if (ids.ghostEl) {
                    ids.ghostEl.style.left = Math.round(gx) + "px";
                    ids.ghostEl.style.top = Math.round(gy) + "px";
                  }
                } else {
                  if (ids.ghostEl && ids.ghostEl.parentNode) ids.ghostEl.parentNode.removeChild(ids.ghostEl);
                  ids.ghostEl = null;
                  ids.snapLeft = null;
                  ids.snapTop = null;
                }

                return;
              }
            }
          }

          var ds = UI._pcDragState;
          if (!ds || !Game || !Game.PC || !Game.PC.getWindowById) return;
          var w = Game.PC.getWindowById(ds.winId);
          if (!w) return;
          var frame = document.querySelector('.pc-window-frame[data-win-id="' + ds.winId + '"]');
          if (!frame) return;
          var desktop = document.getElementById("pc-desktop");
          var rect = desktop ? desktop.getBoundingClientRect() : null;
          var maxW = rect ? Math.max(280, rect.width - 20) : 1400;
          var maxH = rect ? Math.max(240, rect.height - 70) : 900;

          if (ds.mode === "drag") {
            var nx = ds.startLeft + (e.clientX - ds.startX);
            var ny = ds.startTop + (e.clientY - ds.startY);
            if (rect) {
              nx = Math.max(0, Math.min(nx, rect.width - Math.max(260, w.w || 260)));
              ny = Math.max(0, Math.min(ny, rect.height - 60 - Math.max(180, w.h || 180)));
            }
            w.x = nx;
            w.y = ny;
            frame.style.left = Math.round(nx) + "px";
            frame.style.top = Math.round(ny) + "px";
          } else if (ds.mode === "resize") {
            var nw = ds.startW + (e.clientX - ds.startX);
            var nh = ds.startH + (e.clientY - ds.startY);
            nw = Math.max(260, Math.min(nw, maxW));
            nh = Math.max(180, Math.min(nh, maxH));
            w.w = nw;
            w.h = nh;
            frame.style.width = Math.round(nw) + "px";
            frame.style.height = Math.round(nh) + "px";
          }
        });

        window.addEventListener("mouseup", function () {
          if (UI._pcIconDragState) {
            var ids = UI._pcIconDragState;
            if (ids.dragging && Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) {
              var lock = !!(Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.lockToGrid);
              var finalX = (typeof ids.currentLeft === "number" && isFinite(ids.currentLeft)) ? ids.currentLeft : ids.startLeft;
              var finalY = (typeof ids.currentTop === "number" && isFinite(ids.currentTop)) ? ids.currentTop : ids.startTop;
              if (lock && typeof ids.snapLeft === "number" && typeof ids.snapTop === "number") {
                finalX = ids.snapLeft;
                finalY = ids.snapTop;
              }
              if (ids.el) {
                ids.el.style.left = Math.round(finalX) + "px";
                ids.el.style.top = Math.round(finalY) + "px";
              }
              Game.state.pc.desktop.icons[ids.appId] = { x: finalX, y: finalY };
            }
            try {
              if (ids.ghostEl && ids.ghostEl.parentNode) ids.ghostEl.parentNode.removeChild(ids.ghostEl);
            } catch (e2) {}
            UI._pcIconDragState = null;
          }
          if (!UI._pcDragState) return;
          UI._pcDragState = null;
        });
      }
  
      // Each button click advances the BTC network by 1 block (deterministic, interaction-based).
      if (!UI._btcClickHooked) {
        UI._btcClickHooked = true;
        document.addEventListener("click", function (e) {
          var btn = e.target && e.target.closest ? e.target.closest("button") : null;
          if (!btn) return;
          if (Game && Game.Btc && typeof Game.Btc.onUserButtonClick === "function") {
            Game.Btc.onUserButtonClick();
          }
        }, true);
      }
  
      // Almost every non-PC interaction generates a small file/log entry.
      if (!UI._pcFileClickHooked) {
        UI._pcFileClickHooked = true;
        document.addEventListener("click", function (e) {
          if (!Game || !Game.PC || typeof Game.PC.createNonPcClickFile !== "function") return;
          if (Game.state && Game.state.pc && Game.state.pc.isOpen) {
            var pcOverlayEl = document.getElementById("pc-overlay");
            if (pcOverlayEl && pcOverlayEl.contains(e.target)) return;
          }
          var now = Date.now();
          var dt = UI._lastNonPcFileTs ? ((now - UI._lastNonPcFileTs) / 1000) : 0;
          UI._lastNonPcFileTs = now;
          Game.PC.createNonPcClickFile(dt);
        }, true);
      }
    },
    setTab: function (id) {
      var disabledReason = UI.getTabDisabledReason(id);
      if (disabledReason) {
        if (Game && Game.addNotification) Game.addNotification(disabledReason);
        return;
      }
      var lockInfo = UI.getLockedTabInfo(id);
      if (lockInfo) {
        if (UI.shouldSuppressInfoModals()) {
          if (Game && Game.addNotification) Game.addNotification(lockInfo.title || "Locked.");
          return;
        }
        if (!UI.openModalCard) return;
        UI.openModalCard({
          title: lockInfo.title || "Locked",
          sub: lockInfo.sub || "",
          bodyHtml: lockInfo.bodyHtml || "",
          actions: [{ id: "ok", label: "OK", primary: true }],
          onAction: function (actionId, close) { close(); }
        });
        return;
      }
      UI.currentTab = id;
      if (document && document.body) {
        document.body.setAttribute("data-active-tab", id);
      }
      var contentEl = document.getElementById("tab-content");
      if (contentEl) contentEl.setAttribute("data-active-tab", id);
      var buttons = document.querySelectorAll(".tab-btn");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("active", buttons[i].getAttribute("data-tab") === id);
      }
      UI.renderCurrentTab();
      UI.maybeShowTabIntro(id);
    },
    renderCurrentTab: function () {
      var el = document.getElementById("tab-content");
      if (!el) return;
      if (UI.currentTab === "overview") el.innerHTML = UI.renderOverviewTab();
      if (UI.currentTab === "quests") el.innerHTML = UI.renderQuestsTab();
      if (UI.currentTab === "school") el.innerHTML = UI.renderSchoolTab();
      if (UI.currentTab === "jobs") el.innerHTML = UI.renderJobsTab();
      if (UI.currentTab === "companies") el.innerHTML = UI.renderCompaniesTab();
      if (UI.currentTab === "property") el.innerHTML = UI.renderPropertyTab();
      if (UI.currentTab === "healthcare") el.innerHTML = UI.renderHealthcareTab();
      if (UI.currentTab === "travel") el.innerHTML = UI.renderTravelTab();
      if (UI.currentTab === "btc") el.innerHTML = UI.renderBtcTab();
      if (UI.currentTab === "shop") el.innerHTML = UI.renderShopTab();
      if (UI.currentTab === "bank") el.innerHTML = UI.renderBankTab();
      if (UI.currentTab === "prestige") el.innerHTML = UI.renderPrestigeTab();
      if (UI.currentTab === "eventlog") el.innerHTML = UI.renderEventLogTab();
      if (UI.currentTab === "settings") el.innerHTML = UI.renderSettingsTab();
      UI.bindTabEvents();
    },
    getNotificationToastSeconds: function () {
      var s = Game.state || {};
      var val = (typeof s.notificationToastSeconds === "number" && isFinite(s.notificationToastSeconds)) ? Math.round(s.notificationToastSeconds) : 10;
      if (val < 1) val = 1;
      if (val > 60) val = 60;
      return val;
    },
    getQuestProgress: function (def, s) { return UI.Tabs.getQuestProgress(def, s); },
    renderOverviewTab: function () { return UI.Tabs.renderOverviewTab(); },
    renderQuestsTab: function () { return UI.Tabs.renderQuestsTab(); },
    renderEventLogTab: function () { return UI.Tabs.renderEventLogTab(); },
    renderEventLogListBody: function () { return UI.Tabs.renderEventLogListBody(); },
    renderSchoolTab: function () { return UI.Tabs.renderSchoolTab(); },
    renderJobsTab: function () { return UI.Tabs.renderJobsTab(); },
    renderPrestigeTab: function () { return UI.Tabs.renderPrestigeTab(); },
    renderPropertyTab: function () { return UI.Tabs.renderPropertyTab(); },
    renderHealthcareTab: function () { return UI.Tabs.renderHealthcareTab(); },
    renderTravelTab: function () { return UI.Tabs.renderTravelTab(); },
    bindTabEvents: function () {
      if (UI.currentTab === "school") {
        var buttons = document.querySelectorAll(".btn-enroll");
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-course");
            var course = (Game.School && Game.School.courses) ? Game.School.courses[id] : null;
            if (!course) return;
            var shownCost = course.cost || 0;
            if (Game.Prestige && typeof Game.Prestige.getTuitionDiscountMultiplier === "function") {
              shownCost = shownCost * Game.Prestige.getTuitionDiscountMultiplier();
            }
            var isQueue = !!(Game.state && Game.state.school && Game.state.school.enrolled && Game.state.school.course);
            var actionLabel = isQueue ? "Queue" : "Enroll";
            var title = isQueue ? "Confirm Queue" : "Confirm Enrollment";
            var extra = isQueue ? '<div class="card-section small dim mt-4">This will be added below your current course and will start automatically when you finish.</div>' : "";
            UI.confirmModal({
              title: title,
              sub: course.name,
              bodyHtml:
                '<div class="card-section small dim">Spend <span class="mono">$' +
                shownCost.toFixed(0) +
                "</span> on tuition for <b>" +
                course.name +
                "</b>?</div>" + extra,
              confirmLabel: actionLabel,
              onConfirm: function () {
                Game.School.enroll(id);
                UI.renderCurrentTab();
              }
            });
          });
        }
        var examBtns = document.querySelectorAll(".btn-rail-exam-start");
        for (var r = 0; r < examBtns.length; r++) {
          examBtns[r].addEventListener("click", function (e) {
            var id2 = e.target.getAttribute("data-exam");
            UI.openRailExamModal(id2);
          });
        }
      }
      if (UI.currentTab === "jobs") {
        var applyBtns = document.querySelectorAll(".btn-job-apply");
        for (var j = 0; j < applyBtns.length; j++) {
          applyBtns[j].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-job");
            Game.Jobs.applyForJob(id);
            UI.renderCurrentTab();
          });
        }
        var cancelAppBtn = document.getElementById("btn-job-app-cancel");
        if (cancelAppBtn) cancelAppBtn.addEventListener("click", function () { Game.Jobs.cancelJobApplication(); UI.renderCurrentTab(); });
        var acceptOfferBtn = document.getElementById("btn-job-offer-accept");
        if (acceptOfferBtn) acceptOfferBtn.addEventListener("click", function () { Game.Jobs.acceptPendingOffer(); UI.renderCurrentTab(); });
        var rejectOfferBtn = document.getElementById("btn-job-offer-reject");
        if (rejectOfferBtn) rejectOfferBtn.addEventListener("click", function () { Game.Jobs.rejectPendingOffer(); UI.renderCurrentTab(); });
        var visBtns = document.querySelectorAll(".btn-job-visibility");
        for (var v = 0; v < visBtns.length; v++) {
          visBtns[v].addEventListener("click", function (e) {
            var id2 = e.target.getAttribute("data-job");
            if (!id2) return;
            if (!Game || !Game.state || !Game.state.job) return;
            if (Game.Jobs && Game.Jobs.ensureJobProgress) {
              Game.Jobs.ensureJobProgress();
            }
            if (Game.state.job.current === id2) {
              Game.addNotification("You can't hide your current job.");
              return;
            }
            if (!Game.state.job.hidden || typeof Game.state.job.hidden !== "object") {
              Game.state.job.hidden = {};
            }
            var isHidden = !!Game.state.job.hidden[id2];
            if (isHidden) {
              delete Game.state.job.hidden[id2];
            } else {
              Game.state.job.hidden[id2] = true;
            }
            UI.renderCurrentTab();
          });
        }
        var startShift = document.getElementById("btn-start-shift");
        var endShift = document.getElementById("btn-end-shift");
        if (startShift) startShift.addEventListener("click", function () { Game.Jobs.startShift(); UI.renderCurrentTab(); });
        if (endShift) endShift.addEventListener("click", function () { Game.Jobs.endShift("manual stop"); UI.renderCurrentTab(); });
        var coal = document.getElementById("range-coal");
        var throttle = document.getElementById("range-throttle");
        if (coal) coal.addEventListener("input", function () { Game.state.trainJob.coalFeed = parseFloat(this.value); });
        if (throttle) throttle.addEventListener("input", function () { Game.state.trainJob.throttle = parseFloat(this.value); });
      }
      if (UI.currentTab === "companies") {
          var stockBtn = document.getElementById("btn-retail-stock");
          var retailFundsBtn = document.getElementById("btn-retail-funds-overview");
          var retailCampaignsBtn = document.getElementById("btn-retail-campaigns-overview");
          var manageCorpBtn = document.getElementById("btn-manage-corp");
          var oreRunBtn = document.getElementById("btn-ore-run");
          var sellOreBtn = document.getElementById("btn-sell-ore");
          var railManageBtn = document.getElementById("btn-rail-manage");
          if (stockBtn) {
            stockBtn.addEventListener("click", function () {
              UI.showRetailStockPage();
            });
          }
          if (retailFundsBtn) {
            retailFundsBtn.addEventListener("click", function () {
              UI.openRetailFundsModal();
            });
          }
          if (retailCampaignsBtn) {
            retailCampaignsBtn.addEventListener("click", function () {
              UI.openRetailCampaignsModal();
            });
          }
          if (manageCorpBtn) {
            manageCorpBtn.addEventListener("click", function () {
              UI.showMiningCorpPage();
            });
          }
          if (oreRunBtn) {
            oreRunBtn.addEventListener("click", function () {
              Game.Companies.startOreRun();
              UI.renderCurrentTab();
            });
          }
          if (sellOreBtn) {
            sellOreBtn.addEventListener("click", function () {
              if (UI.showSellOreModal) {
                UI.showSellOreModal();
              } else {
                Game.Companies.sellOre();
                UI.renderCurrentTab();
              }
            });
          }
          if (railManageBtn) {
            railManageBtn.addEventListener("click", function () {
              UI.showRailLogisticsPage();
            });
          }
          var miningDepositInput = document.getElementById("mining-deposit");
          var miningDepositBtn = document.getElementById("btn-mining-deposit");
          if (miningDepositBtn && miningDepositInput) {
            miningDepositBtn.addEventListener("click", function () {
              var val = parseFloat(miningDepositInput.value);
              Game.Companies.depositMiningFunds(val);
              UI.renderCurrentTab();
            });
          }
          var miningWithdrawInput = document.getElementById("mining-withdraw");
          var miningWithdrawBtn = document.getElementById("btn-mining-withdraw");
          if (miningWithdrawBtn && miningWithdrawInput) {
            miningWithdrawBtn.addEventListener("click", function () {
              var val = parseFloat(miningWithdrawInput.value);
              Game.Companies.withdrawMiningFunds(val);
              UI.renderCurrentTab();
            });
          }
          var miningAutoSellToggles = document.querySelectorAll(".mining-auto-sell-toggle");
          for (var ms = 0; ms < miningAutoSellToggles.length; ms++) {
            miningAutoSellToggles[ms].addEventListener("change", function (e) {
              var key = e.target.getAttribute("data-ore");
              if (!key) return;
              if (Game.Companies && typeof Game.Companies.ensureMiningMines === "function") {
                Game.Companies.ensureMiningMines();
              }
              if (!Game.state.companies.miningCorp.autoSell) {
                Game.state.companies.miningCorp.autoSell = { iron: false, copper: false, silver: false, gold: false };
              }
              Game.state.companies.miningCorp.autoSell[key] = !!e.target.checked;
              UI.renderCurrentTab();
            });
          }
          var miningAutoPayoutToggle = document.getElementById("mining-auto-payout");
          if (miningAutoPayoutToggle) {
            miningAutoPayoutToggle.addEventListener("change", function () {
              if (Game.Companies && typeof Game.Companies.ensureMiningMines === "function") {
                Game.Companies.ensureMiningMines();
              }
              Game.state.companies.miningCorp.autoPayoutToWallet = !!miningAutoPayoutToggle.checked;
              UI.renderCurrentTab();
            });
          }
          var miningAutoReserveInput = document.getElementById("mining-auto-reserve");
          if (miningAutoReserveInput) {
            miningAutoReserveInput.addEventListener("change", function () {
              var v = parseFloat(miningAutoReserveInput.value);
              if (!isFinite(v) || v < 0) v = 0;
              if (Game.Companies && typeof Game.Companies.ensureMiningMines === "function") {
                Game.Companies.ensureMiningMines();
              }
              Game.state.companies.miningCorp.autoPayoutReserve = v;
              UI.renderCurrentTab();
            });
          }
  
          var ncManageBtn = document.getElementById("btn-netcafe-manage");
          if (ncManageBtn) ncManageBtn.addEventListener("click", function () { UI.showNetCafePage(); });
          var ncBuySeatBtn = document.getElementById("btn-netcafe-buy-seat-overview");
          if (ncBuySeatBtn) ncBuySeatBtn.addEventListener("click", function () {
            if (Game.Companies && typeof Game.Companies.buyNetCafeSeat === "function") {
              Game.Companies.buyNetCafeSeat();
            }
            UI.renderCurrentTab();
          });
          var coManageBtn = document.getElementById("btn-courier-manage");
          if (coManageBtn) coManageBtn.addEventListener("click", function () { UI.showCourierPage(); });
          var coDispatchBtn = document.getElementById("btn-courier-dispatch-overview");
      if (coDispatchBtn) coDispatchBtn.addEventListener("click", function () {
        if (Game.Companies && typeof Game.Companies.dispatchCourierDeliveriesNow === "function") {
              Game.Companies.dispatchCourierDeliveriesNow();
            }
            UI.renderCurrentTab();
          });
          var rcManageBtn = document.getElementById("btn-recycle-manage");
          if (rcManageBtn) rcManageBtn.addEventListener("click", function () { UI.showRecyclingPage(); });
          var rcQuickBtn = document.getElementById("btn-recycle-quick-start");
          if (rcQuickBtn) rcQuickBtn.addEventListener("click", function () {
            var input = document.getElementById("recycle-quick-kg");
            var kg = input ? parseFloat(input.value) : 0;
            if (Game.Companies && typeof Game.Companies.startRecyclingBatch === "function") {
              Game.Companies.startRecyclingBatch(kg, "mixed");
            }
            UI.renderCurrentTab();
          });
        }
      if (UI.currentTab === "property") {
        var buyBtns = document.querySelectorAll(".btn-buy-property");
        for (var k = 0; k < buyBtns.length; k++) {
          buyBtns[k].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-prop");
            var def = Game.Property.getPropertyDef(id);
            if (!def) return;
            UI.confirmModal({
              title: "Confirm purchase",
              sub: def.name,
              confirmLabel: "Buy",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="field-row"><span>Price</span><span>$' + def.price.toFixed(0) + "</span></div>" +
                '<div class="field-row"><span>Base rent</span><span>$' + def.baseRent.toFixed(0) + "/day</span></div>" +
                "</div>",
              onConfirm: function () {
                Game.Property.buyProperty(id);
                UI.renderCurrentTab();
              }
            });
          });
        }
        var manageBtns = document.querySelectorAll(".btn-manage-prop");
        for (var m = 0; m < manageBtns.length; m++) {
          manageBtns[m].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-prop");
            UI.showPropertyManageModal(id);
          });
        }
        var rentBtns = document.querySelectorAll(".btn-home-rent");
        for (var r = 0; r < rentBtns.length; r++) {
          rentBtns[r].addEventListener("click", function (e) {
            var key = (e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute("data-offer") : null;
            if (Game.Property && Game.Property.ensureHomeOffers) Game.Property.ensureHomeOffers();
            var offers = Array.isArray(Game.state.homeOffers) ? Game.state.homeOffers : [];
            var offer = null;
            for (var i = 0; i < offers.length; i++) {
              if (offers[i].key === key) {
                offer = offers[i];
                break;
              }
            }
            if (!offer) return;
            var def = Game.Property.getHomeDef(offer.defId);
            if (!def) return;
            UI.confirmModal({
              title: "Confirm rental",
              sub: def.name + (offer.used ? " (Used)" : ""),
              confirmLabel: "Rent",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="field-row"><span>Location</span><span>' + (offer.location || def.location || "-") + "</span></div>" +
                '<div class="field-row"><span>Rent</span><span>$' + (offer.rentPerDay || 0).toFixed(0) + "/day</span></div>" +
                '<div class="field-row"><span>Condition</span><span>' + Math.round(offer.maintenance) + "%</span></div>" +
                "</div>",
              onConfirm: function () {
                Game.Property.rentHomeOffer(key);
                UI.renderCurrentTab();
              }
            });
          });
        }
        var buyHomeBtns = document.querySelectorAll(".btn-home-buy");
        for (var b = 0; b < buyHomeBtns.length; b++) {
          buyHomeBtns[b].addEventListener("click", function (e) {
            var key = (e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute("data-offer") : null;
            if (Game.Property && Game.Property.ensureHomeOffers) Game.Property.ensureHomeOffers();
            var offers = Array.isArray(Game.state.homeOffers) ? Game.state.homeOffers : [];
            var offer = null;
            for (var i = 0; i < offers.length; i++) {
              if (offers[i].key === key) {
                offer = offers[i];
                break;
              }
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
                Game.Property.buyHomeOffer(key);
                UI.renderCurrentTab();
              }
            });
          });
        }
        var repairHomeBtn = document.getElementById("btn-home-repair");
        if (repairHomeBtn) {
          repairHomeBtn.addEventListener("click", function () {
            var h = Game.state.housing || {};
            var def = Game.Property.getHomeDef(h.homeId);
            var price = def ? def.price : 0;
            var cost = Game.Property.getRepairCost ? Game.Property.getRepairCost(price, h.maintenance) : 0;
            UI.confirmModal({
              title: "Repair home",
              sub: def ? def.name : "Home",
              confirmLabel: "Repair",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="field-row"><span>Repair cost</span><span>$' + (cost || 0).toFixed(0) + "</span></div>" +
                '<div class="field-row"><span>Condition</span><span>' + Math.round(h.maintenance || 0) + "% \u2192 100%</span></div>" +
                "</div>",
              onConfirm: function () {
                Game.Property.repairHome();
                UI.renderCurrentTab();
              }
            });
          });
        }
        var sellHomeBtn = document.getElementById("btn-home-sell");
        if (sellHomeBtn) {
          sellHomeBtn.addEventListener("click", function () {
            var h = Game.state.housing || {};
            var def = Game.Property.getHomeDef(h.homeId);
            UI.confirmModal({
              title: "Sell home",
              sub: def ? def.name : "Home",
              confirmLabel: "Sell",
              bodyHtml: '<div class="card-section small dim">This will sell your owned home and move you back to the starter room.</div>',
              onConfirm: function () {
                Game.Property.sellCurrentHome();
                UI.renderCurrentTab();
              }
            });
          });
        }
        var refreshListingsBtn = document.getElementById("btn-home-refresh");
        if (refreshListingsBtn) {
          refreshListingsBtn.addEventListener("click", function () {
            Game.Property.generateHomeOffers();
            UI.renderCurrentTab();
          });
        }
        var sleepBtn = document.getElementById("btn-home-sleep");
        if (sleepBtn) {
          sleepBtn.addEventListener("click", function () {
            // If sleep can't start, run the core validator anyway so it can show a notification.
            try {
              var s = Game.state;
              var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
              if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
              var isAtHome = (s.travelLocation === "Home") && (!s.travel || !s.travel.inProgress);
              var isBusy = !!(s.job && s.job.isWorking) || !!(s.school && s.school.enrolled) || !!(s.travel && s.travel.inProgress);
              var canSleep = isAtHome && !isBusy && ((s.energy || 0) < maxEnergy - 0.00001);
              if (!canSleep) {
                // If we're away from Home and can't afford travel, let the player walk home (slower) then sleep.
                try {
                  if (s && s.travelLocation && s.travelLocation !== "Home" && !isBusy && Game && Game.World && typeof Game.World.walkHomeForSleep === "function") {
                    var cost = Game.Economy ? (Game.Economy.travelBaseCost || 0) : 0;
                    if (Game.Prestige && typeof Game.Prestige.getTravelCostMultiplier === "function") {
                      cost *= Game.Prestige.getTravelCostMultiplier();
                    }
                    cost = Math.round(cost * 100) / 100;
                    if ((typeof s.money === "number" ? s.money : 0) < cost) {
                      if (Game.World.walkHomeForSleep()) {
                        UI.renderCurrentTab();
                        return;
                      }
                    }
                  }
                } catch (e) {}
                if (Game.startSleeping) Game.startSleeping();
                UI.renderCurrentTab();
                return;
              }
            } catch (e) {}
            var sleepMult = 10;
            try {
              if (window.Game && typeof Game.getSleepTimeMultiplier === "function") {
                sleepMult = Game.getSleepTimeMultiplier(true) || 10;
              }
            } catch (e) {}
            UI.confirmModal({
              title: "Go to sleep?",
              sub: "Your Home",
              confirmLabel: "Sleep",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="notice">Sleeping fast-forwards in-game time by <b>' + sleepMult + 'x</b> and will stop automatically when your energy is full.</div>' +
                '<div class="mt-8">While sleeping, you cannot:</div>' +
                '<ul class="mt-8">' +
                '<li>Travel</li>' +
                '<li>Start work shifts</li>' +
                '<li>Enroll in education</li>' +
                '<li>Use healthcare (doctor/hospital)</li>' +
                "</ul>" +
                "</div>",
              onConfirm: function () {
                if (Game.startSleeping) Game.startSleeping();
                UI.renderCurrentTab();
              }
            });
          });
        }
        var wakeBtn = document.getElementById("btn-home-wake");
        if (wakeBtn) {
          wakeBtn.addEventListener("click", function () {
            if (Game.stopSleeping) Game.stopSleeping();
            UI.renderCurrentTab();
          });
        }
        var homeUpgradeBtns = document.querySelectorAll(".btn-home-upgrade");
        for (var hu = 0; hu < homeUpgradeBtns.length; hu++) {
          homeUpgradeBtns[hu].addEventListener("click", function (e) {
            var key = (e.currentTarget && e.currentTarget.getAttribute) ? e.currentTarget.getAttribute("data-upgrade") : null;
            if (!key || !Game.Property || !Game.Property.ensureHousingState) return;
            Game.Property.ensureHousingState();
            var h = Game.state.housing || {};
            var def = Game.Property.getHomeDef ? Game.Property.getHomeDef(h.homeId) : null;
            var defs = Game.Property.getHomeUpgradeDefs ? Game.Property.getHomeUpgradeDefs() : [];
            var ud = null;
            for (var i = 0; i < defs.length; i++) {
              if (defs[i].key === key) { ud = defs[i]; break; }
            }
            if (!ud) return;
            var lvl = (h.upgrades && typeof h.upgrades[key] === "number") ? h.upgrades[key] : 0;
            if (!isFinite(lvl) || lvl < 0) lvl = 0;
            var cost = Game.Property.getHomeUpgradeCost ? Game.Property.getHomeUpgradeCost(def, key, lvl) : 0;
            UI.confirmModal({
              title: "Confirm home upgrade",
              sub: def ? def.name : "Home",
              confirmLabel: "Upgrade",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="field-row"><span>Upgrade</span><span>' + ud.name + "</span></div>" +
                '<div class="field-row"><span>Level</span><span>L' + lvl + " \u2192 L" + (lvl + 1) + "</span></div>" +
                '<div class="field-row"><span>Cost</span><span>$' + (cost || 0).toFixed(0) + "</span></div>" +
                '<div class="field-row"><span>Effect</span><span>' + (ud.effect || "-") + "</span></div>" +
                "</div>",
              onConfirm: function () {
                if (Game.Property && Game.Property.upgradeHome) Game.Property.upgradeHome(key);
                UI.renderCurrentTab();
              }
            });
          });
        }
      }
      if (UI.currentTab === "healthcare") {
        var d = document.getElementById("btn-doctor");
        var h = document.getElementById("btn-hospital");
        if (d) d.addEventListener("click", function () { Game.Health.visitDoctor(); UI.renderCurrentTab(); });
        if (h) h.addEventListener("click", function () { Game.Health.hospitalStay(); UI.renderCurrentTab(); });
        var sleepBtn = document.getElementById("btn-hc-sleep");
        if (sleepBtn) {
          sleepBtn.addEventListener("click", function () {
            // If sleep can't start, run the core validator anyway so it can show a notification.
            try {
              var s = Game.state;
              var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
              if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
              var isAtHome = (s.travelLocation === "Home") && (!s.travel || !s.travel.inProgress);
              var isBusy = !!(s.job && s.job.isWorking) || !!(s.school && s.school.enrolled) || !!(s.travel && s.travel.inProgress);
              var canSleep = isAtHome && !isBusy && ((s.energy || 0) < maxEnergy - 0.00001);
              if (!canSleep) {
                if (Game.startSleeping) Game.startSleeping();
                UI.renderCurrentTab();
                return;
              }
            } catch (e) {}
            var sleepMult = 10;
            try {
              if (window.Game && typeof Game.getSleepTimeMultiplier === "function") {
                sleepMult = Game.getSleepTimeMultiplier(true) || 10;
              }
            } catch (e) {}
            UI.confirmModal({
              title: "Go to sleep?",
              sub: "Rest",
              confirmLabel: "Sleep",
              bodyHtml:
                '<div class="card-section small">' +
                '<div class="notice">Sleeping fast-forwards in-game time by <b>' + sleepMult + 'x</b> and will stop automatically when your energy is full.</div>' +
                '<div class="mt-8">While sleeping, you cannot:</div>' +
                '<ul class="mt-8">' +
                '<li>Travel</li>' +
                '<li>Start work shifts</li>' +
                '<li>Enroll in education</li>' +
                '<li>Use healthcare (doctor/hospital)</li>' +
                "</ul>" +
                "</div>",
              onConfirm: function () {
                if (Game.startSleeping) Game.startSleeping();
                UI.renderCurrentTab();
              }
            });
          });
        }
        var wakeBtn = document.getElementById("btn-hc-wake");
        if (wakeBtn) {
          wakeBtn.addEventListener("click", function () {
            if (Game.stopSleeping) Game.stopSleeping();
            UI.renderCurrentTab();
          });
        }
      }
      if (UI.currentTab === "travel") {
        var tBtns = document.querySelectorAll(".btn-travel");
        for (var i2 = 0; i2 < tBtns.length; i2++) {
          tBtns[i2].addEventListener("click", function (e) {
            var loc = e.target.getAttribute("data-loc");
            Game.World.travelTo(loc);
            UI.renderCurrentTab();
          });
        }
      }
      if (UI.currentTab === "btc") {
        var br = document.getElementById("btn-buy-rig");
        var tr = document.getElementById("btn-toggle-rig");
        if (br) br.addEventListener("click", function () { Game.Btc.buyRig(); UI.renderCurrentTab(); });
        if (tr) tr.addEventListener("click", function () { Game.Btc.toggleRigPower(); UI.renderCurrentTab(); });
        var reportsBtn = document.getElementById("btn-btc-reports");
        if (reportsBtn) {
          reportsBtn.addEventListener("click", function () {
            UI.showBtcReportsPage();
          });
        }
        var autoSync = document.getElementById("btc-wallet-auto-sync");
        if (autoSync) {
          autoSync.addEventListener("change", function () {
            if (Game.state && Game.state.btc && Game.state.btc.wallet) {
              Game.state.btc.wallet.autoSyncDaily = !!this.checked;
            }
          });
        }
        if (typeof Flotr !== "undefined") {
          UI.initBtcChart();
        }
      }
      if (UI.currentTab === "bank") {
        var amountSlider = document.getElementById("bank-loan-amount");
        var amountLabel = document.getElementById("bank-loan-amount-label");
        var rateLabel = document.getElementById("bank-rate-label");
        var dailyLabel = document.getElementById("bank-daily-label");
        var factorBase = document.getElementById("bank-factor-base");
        var factorUtil = document.getElementById("bank-factor-utilisation");
        var factorInq = document.getElementById("bank-factor-inquiries");
        var factorNet = document.getElementById("bank-factor-networth");
        var factorHist = document.getElementById("bank-factor-history");
        var factorOther = document.getElementById("bank-factor-other");
        function formatFactorDelta(adj) {
          var pct = (adj * 100).toFixed(2) + "%";
          if (adj > 0.0001) {
            return '<span class="badge badge-red">+' + pct + '</span>';
          } else if (adj < -0.0001) {
            return '<span class="badge badge-green">' + pct + '</span>';
          }
          return '<span class="badge">' + pct + '</span>';
        }
        function updateBankSummary() {
          if (!amountSlider || !amountLabel || !rateLabel || !dailyLabel || !Game.Bank) return;
          var val = parseFloat(amountSlider.value) || 0;
          amountLabel.textContent = "$" + val.toFixed(0);
          var range = Game.Bank.getRateRangeForAmount(val);
          rateLabel.textContent = (range.min * 100).toFixed(2) + "% - " + (range.max * 100).toFixed(2) + "%";
          var b = Game.Bank.getState();
          var originalPlusNew = (b.loanOriginal || 0) + val;
          var termDays = Game.Bank.loanTermDays || 28;
          if (termDays <= 0) termDays = 28;
          var dailyPrincipal = originalPlusNew / termDays;
          dailyLabel.textContent = "$" + dailyPrincipal.toFixed(2);
          var breakdown = Game.Bank.getRateBreakdown(val);
          if (factorBase) {
            factorBase.textContent = (breakdown.base * 100).toFixed(2) + "%";
          }
          if (factorUtil) {
            factorUtil.innerHTML = formatFactorDelta(breakdown.utilisationAdj);
          }
          if (factorInq) {
            factorInq.innerHTML = formatFactorDelta(breakdown.inquiryAdj);
          }
          if (factorNet) {
            factorNet.innerHTML = formatFactorDelta(breakdown.netWorthAdj);
          }
          if (factorHist) {
            factorHist.innerHTML = formatFactorDelta(breakdown.historyAdj);
          }
          if (factorOther) {
            factorOther.innerHTML = formatFactorDelta(breakdown.otherAdj);
          }
        }
        if (amountSlider) {
          amountSlider.addEventListener("input", updateBankSummary);
          updateBankSummary();
        }
        var borrowBtn = document.getElementById("bank-btn-borrow");
        var acceptBtn = document.getElementById("bank-btn-accept");
        var rejectBtn = document.getElementById("bank-btn-reject");
        var extraInput = document.getElementById("bank-extra-amount");
        var extraBtn = document.getElementById("bank-btn-extra");
        if (borrowBtn && amountSlider) {
          borrowBtn.addEventListener("click", function () {
            var val = parseFloat(amountSlider.value) || 0;
            if (val <= 0) return;
            Game.Bank.applyForLoan(val);
            UI.renderCurrentTab();
          });
        }
        if (acceptBtn) {
          acceptBtn.addEventListener("click", function () {
            Game.Bank.acceptOffer();
            UI.renderCurrentTab();
          });
        }
        if (rejectBtn) {
          rejectBtn.addEventListener("click", function () {
            Game.Bank.rejectOffer();
            UI.renderCurrentTab();
          });
        }
        if (extraBtn && extraInput) {
          extraBtn.addEventListener("click", function () {
            var val = parseFloat(extraInput.value) || 0;
            if (val <= 0) return;
            Game.Bank.payExtra(val);
            UI.renderCurrentTab();
          });
        }
        var depositInput = document.getElementById("bank-deposit-amount");
        var depositBtn = document.getElementById("bank-btn-deposit");
        if (depositBtn && depositInput) {
          depositBtn.addEventListener("click", function () {
            var requested = parseFloat(depositInput.value) || 0;
            if (requested <= 0) return;
            var wallet = (Game && Game.state && typeof Game.state.money === "number" && isFinite(Game.state.money)) ? Game.state.money : 0;
  
            function doDeposit(amount) {
              if (Game.Bank && Game.Bank.deposit) {
                Game.Bank.deposit(amount);
              }
              UI.renderCurrentTab();
            }
  
            function confirmExpenseRisk(amount) {
              var forecast = (UI && typeof UI.computeMoneyForecast === "function") ? UI.computeMoneyForecast() : null;
              if (!forecast) return false;
              var income = typeof forecast.income === "number" && isFinite(forecast.income) ? forecast.income : 0;
              var expense = typeof forecast.expense === "number" && isFinite(forecast.expense) ? forecast.expense : 0;
              var net = income - expense;
              if (net >= 0) return false;
              var deficit = -net;
              var after = wallet - amount;
              if (!isFinite(after)) after = 0;
              if (after >= deficit) return false;
              if (!UI || !UI.confirmModal) return false;
              UI.confirmModal({
                title: "Warning: expenses exceed income",
                sub: "This deposit may force borrowing",
                confirmLabel: "Deposit anyway",
                bodyHtml:
                  '<div class="card-section small">' +
                  '<div class="field-row"><span>Net daily deficit</span><span class="mono">-$' + deficit.toFixed(0) + "</span></div>" +
                  '<div class="field-row"><span>Wallet after deposit</span><span class="mono">$' + Math.max(0, after).toFixed(2) + "</span></div>" +
                  '<div class="small dim mt-4">Based on your current estimated income and expenses, you may not be able to cover upcoming costs without a loan.</div>' +
                  "</div>",
                onConfirm: function () { doDeposit(amount); }
              });
              return true;
            }
  
            if (requested > wallet) {
              var max = wallet;
              if (!isFinite(max) || max <= 0) {
                if (Game && Game.addNotification) Game.addNotification("You don't have any wallet funds to deposit.");
                return;
              }
              if (UI && UI.confirmModal) {
                UI.confirmModal({
                  title: "Deposit maximum?",
                  sub: "You entered more than your wallet balance",
                  confirmLabel: "Deposit $" + max.toFixed(2),
                  bodyHtml:
                    '<div class="card-section small">' +
                    '<div class="field-row"><span>Requested</span><span class="mono">$' + requested.toFixed(2) + "</span></div>" +
                    '<div class="field-row"><span>Available</span><span class="mono">$' + max.toFixed(2) + "</span></div>" +
                    "</div>",
                  onConfirm: function () {
                    if (!confirmExpenseRisk(max)) doDeposit(max);
                  }
                });
              } else {
                if (!confirmExpenseRisk(max)) doDeposit(max);
              }
              return;
            }
  
            if (!confirmExpenseRisk(requested)) doDeposit(requested);
          });
        }
        var withdrawInput = document.getElementById("bank-withdraw-amount");
        var withdrawBtn = document.getElementById("bank-btn-withdraw");
        if (withdrawBtn && withdrawInput) {
          withdrawBtn.addEventListener("click", function () {
            var requested = parseFloat(withdrawInput.value) || 0;
            if (requested <= 0) return;
  
            function doWithdraw(amount) {
              if (Game.Bank && Game.Bank.withdraw) {
                Game.Bank.withdraw(amount);
              }
              UI.renderCurrentTab();
            }
  
            var state = (Game.Bank && Game.Bank.getState) ? Game.Bank.getState() : (Game.state && Game.state.bank ? Game.state.bank : null);
            var bal = state && typeof state.depositBalance === "number" && isFinite(state.depositBalance) ? state.depositBalance : 0;
  
            if (requested > bal) {
              var max = bal;
              if (!isFinite(max) || max <= 0) {
                if (Game && Game.addNotification) Game.addNotification("You don't have any bank balance to withdraw.");
                return;
              }
              if (UI && UI.confirmModal) {
                UI.confirmModal({
                  title: "Withdraw maximum?",
                  sub: "You entered more than your bank balance",
                  confirmLabel: "Withdraw $" + max.toFixed(2),
                  bodyHtml:
                    '<div class="card-section small">' +
                    '<div class="field-row"><span>Requested</span><span class="mono">$' + requested.toFixed(2) + "</span></div>" +
                    '<div class="field-row"><span>Available</span><span class="mono">$' + max.toFixed(2) + "</span></div>" +
                    "</div>",
                  onConfirm: function () { doWithdraw(max); }
                });
              } else {
                doWithdraw(max);
              }
              return;
            }
  
            doWithdraw(requested);
          });
        }
        var loanFromDepositsToggle = document.getElementById("bank-toggle-loan-from-deposits");
        if (loanFromDepositsToggle) {
          loanFromDepositsToggle.addEventListener("change", function () {
            if (Game.Bank && Game.Bank.getState) {
              var b = Game.Bank.getState();
              b.payLoanFromDeposits = !!loanFromDepositsToggle.checked;
            }
            UI.renderCurrentTab();
          });
        }
        var interestToBankToggle = document.getElementById("bank-toggle-interest-to-bank");
        if (interestToBankToggle) {
          interestToBankToggle.addEventListener("change", function () {
            if (Game.Bank && Game.Bank.getState) {
              var b2 = Game.Bank.getState();
              b2.depositInterestToBank = !!interestToBankToggle.checked;
            }
            UI.renderCurrentTab();
          });
        }
      }
      if (UI.currentTab === "prestige") {
        var shopBtn = document.getElementById("btn-prestige-shop");
        if (shopBtn) {
          shopBtn.addEventListener("click", function () {
            if (UI.Tabs && UI.Tabs.openPrestigeShopModal) UI.Tabs.openPrestigeShopModal(false);
          });
        }
        var effectsBtn = document.getElementById("btn-prestige-effects");
        if (effectsBtn) {
          effectsBtn.addEventListener("click", function () {
            if (UI.Tabs && UI.Tabs.openPrestigeEffectsModal) UI.Tabs.openPrestigeEffectsModal();
          });
        }
        var previewBtn = document.getElementById("btn-prestige-preview");
        if (previewBtn) {
          previewBtn.addEventListener("click", function () {
            if (UI.Tabs && UI.Tabs.openPrestigeConfirmModal) UI.Tabs.openPrestigeConfirmModal(true);
          });
        }
        var prestigeBtn = document.getElementById("btn-prestige-now");
        if (prestigeBtn) {
          prestigeBtn.addEventListener("click", function () {
            if (UI.Tabs && UI.Tabs.openPrestigeConfirmModal) UI.Tabs.openPrestigeConfirmModal(false);
          });
        }
      }
      if (UI.currentTab === "shop") {
        var ob = document.querySelectorAll(".btn-buy-online");
        for (var w = 0; w < ob.length; w++) {
          ob[w].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-online");
            if (Game.Shop && Game.Shop.buyOnline) {
              Game.Shop.buyOnline(id);
            }
            UI.renderCurrentTab();
          });
        }
        var pb = document.querySelectorAll(".btn-buy-physical");
        for (var x = 0; x < pb.length; x++) {
          pb[x].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-item");
            Game.Shop.buyPhysical(id);
            UI.renderCurrentTab();
          });
        }
        var mb = document.querySelectorAll(".btn-buy-meal");
        for (var y = 0; y < mb.length; y++) {
          mb[y].addEventListener("click", function (e) {
            var mealId = e.target.getAttribute("data-meal");
            Game.Shop.buyMeal(mealId);
            UI.renderCurrentTab();
          });
        }
        var ub = document.querySelectorAll(".btn-inv-use");
        for (var z = 0; z < ub.length; z++) {
          ub[z].addEventListener("click", function (e) {
            var itemId = this.getAttribute("data-item-id");
            if (!itemId || !Game.Inventory || !Game.Inventory.useItem) return;
            var used = Game.Inventory.useItem(itemId);
            if (used) {
              UI.renderCurrentTab();
            }
          });
        }
      }
      if (UI.currentTab === "eventlog") {
        var areaSelect = document.getElementById("eventlog-filter-area");
        if (areaSelect) {
          areaSelect.value = UI.eventLogFilterArea || "all";
          areaSelect.addEventListener("change", function () {
            UI.eventLogFilterArea = this.value || "all";
            UI.refreshEventLogList();
          });
        }
        var textInput = document.getElementById("eventlog-filter-text");
        if (textInput) {
          textInput.value = UI.eventLogFilterText || "";
          textInput.addEventListener("input", function () {
            UI.eventLogFilterText = this.value || "";
            UI.refreshEventLogList();
          });
        }
      }
      if (UI.currentTab === "settings") {
        var tabIntroToggle = document.getElementById("toggle-show-tab-intros");
        var infoModalsToggle = document.getElementById("toggle-show-info-modals");
        if (tabIntroToggle || infoModalsToggle) {
          var onHelpToggle = function () {
            if (!Game || !Game.state) return;
            UI.ensureIntroState();
            if (tabIntroToggle) Game.state.ui.showTabIntros = !!tabIntroToggle.checked;
            if (infoModalsToggle) Game.state.ui.showInfoModals = !!infoModalsToggle.checked;
            Game.state.ui.introDisabled = !(Game.state.ui.showTabIntros && Game.state.ui.showInfoModals);
            if (Game && Game.save) Game.save(true);
          };
          if (tabIntroToggle) tabIntroToggle.addEventListener("change", onHelpToggle);
          if (infoModalsToggle) infoModalsToggle.addEventListener("change", onHelpToggle);
        }
        var backBtn = document.getElementById("btn-settings-back");
        if (backBtn) {
          backBtn.addEventListener("click", function () {
            UI.setTab(UI._lastTabBeforeSettings || "overview");
          });
        }
        var saveBtn = document.getElementById("btn-settings-save");
        if (saveBtn) {
          saveBtn.addEventListener("click", function () {
            if (Game && Game.save) Game.save(false);
            UI._settingsMsg = "Saved.";
            UI._settingsMsgOk = true;
            UI.renderCurrentTab();
          });
        }
        var resetBtn = document.getElementById("btn-settings-reset");
        if (resetBtn) {
          resetBtn.addEventListener("click", function () {
            UI.confirmModal({
              title: "Reset Game",
              sub: "Delete local save",
              confirmLabel: "Reset",
              bodyHtml: '<div class="card-section small dim">This will delete your local save and start a new life. This cannot be undone.</div>',
              onConfirm: function () {
                if (Game.resetState) Game.resetState();
                if (window.UI && UI.init) UI.init();
              }
            });
          });
        }
        var redeemBtn = document.getElementById("btn-redeem-code");
        var redeemInput = document.getElementById("redeem-code-input");
        var redeemMsg = document.getElementById("redeem-msg");
        var submitRedeem = function () {
          if (!Game || !Game.Redeem || !Game.Redeem.redeem) return;
          var code = redeemInput ? redeemInput.value : "";
          var res = Game.Redeem.redeem(code);
          UI._settingsMsg = (res && res.message) ? res.message : (res && res.ok ? "Redeemed." : "Failed.");
          UI._settingsMsgOk = !!(res && res.ok);
          if (res && res.ok && redeemInput) redeemInput.value = "";
          UI.renderCurrentTab();
          UI.refresh();
          if (res && res.ok) {
            var items = (res.reward && Array.isArray(res.reward.items)) ? res.reward.items : [];
            var body = [];
            body.push('<div class="card-section small dim">You received:</div>');
            body.push('<div class="card-section">');
            if (!items.length) {
              body.push('<div class="small dim">No rewards.</div>');
            } else {
              for (var ri = 0; ri < items.length; ri++) {
                var it = items[ri];
                if (!it) continue;
                var label = it.label || "Reward";
                var value = it.value || "";
                var valueHtml = it.mono ? ('<span class="mono">' + value + "</span>") : ("<span>" + value + "</span>");
                body.push('<div class="field-row"><span>' + label + "</span>" + valueHtml + "</div>");
              }
            }
            body.push("</div>");
            var actions = [];
            if (res && res.openDebugMenu) {
              actions.push({ id: "open-debug", label: "Open Debug Menu", primary: true });
            }
            UI.openModalCard({
              title: "Code Redeemed",
              sub: res.code || "",
              bodyHtml: body.join(""),
              actions: actions,
              onAction: function (actionId, close) {
                if (actionId === "open-debug") {
                  close();
                  if (UI.openDebugMenu) UI.openDebugMenu();
                }
              }
            });
          }
        };
        if (redeemBtn) redeemBtn.addEventListener("click", submitRedeem);
        if (redeemInput) {
          redeemInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") submitRedeem();
          });
        }
        var notifDurationInput = document.getElementById("notification-toast-duration");
        if (notifDurationInput) {
          var updateToastDuration = function () {
            var val = parseInt(notifDurationInput.value, 10);
            if (!isFinite(val)) val = UI.getNotificationToastSeconds();
            val = Math.max(1, Math.min(60, Math.round(val)));
            notifDurationInput.value = val;
            if (Game && Game.state) {
              Game.state.notificationToastSeconds = val;
            }
            UI.refresh();
          };
          notifDurationInput.addEventListener("change", updateToastDuration);
          notifDurationInput.addEventListener("blur", updateToastDuration);
        }
        var desktopNotifBtn = document.getElementById("btn-desktop-notifications");
        if (desktopNotifBtn) {
          desktopNotifBtn.addEventListener("click", function () {
            UI.ensureDesktopNotificationsPref();
            var action = this.getAttribute("data-action") || "";
            if (action === "request") {
              UI.openDesktopNotificationsModal({
                onDone: function () {
                  UI.renderCurrentTab();
                  UI.refresh();
                }
              });
              return;
            }
            if (action === "toggle") {
              try {
                if (typeof Notification === "undefined" || Notification.permission !== "granted") {
                  UI.openDesktopNotificationsModal({
                    onDone: function () {
                      UI.renderCurrentTab();
                      UI.refresh();
                    }
                  });
                  return;
                }
                var nowEnabled = !Game.state.desktopNotifications.enabled;
                Game.state.desktopNotifications.enabled = nowEnabled;
                Game.state.desktopNotifications.prompted = true;
                Game.addNotification(nowEnabled ? "Desktop notifications enabled." : "Desktop notifications disabled.");
                UI.renderCurrentTab();
                UI.refresh();
              } catch (e) {}
            }
          });
        }
        var dbgBtn = document.getElementById("btn-open-debug-menu");
        if (dbgBtn) {
          dbgBtn.addEventListener("click", function () {
            if (UI.openDebugMenu) UI.openDebugMenu();
          });
        }
      }
      if (UI.currentTab === "quests") {
        var claimBtns = document.querySelectorAll(".btn-quest-claim");
        for (var q = 0; q < claimBtns.length; q++) {
          claimBtns[q].addEventListener("click", function () {
            var questId = this.getAttribute("data-quest");
            var defs = UI.questDefs || [];
            var def = null;
            for (var i = 0; i < defs.length; i++) {
              if (defs[i] && defs[i].id === questId) { def = defs[i]; break; }
            }
            if (!def || !UI.Tabs || !UI.Tabs.claimQuestReward) return;
            var res = UI.Tabs.claimQuestReward(def);
            if (res && res.ok) {
              var body = [];
              body.push('<div class="card-section small dim">You received:</div>');
              body.push('<div class="card-section">');
              if (!res.items || !res.items.length) {
                body.push('<div class="small dim">No rewards.</div>');
              } else {
                for (var ri = 0; ri < res.items.length; ri++) {
                  var it = res.items[ri];
                  if (!it) continue;
                  var label = it.label || "Reward";
                  var value = it.value || "";
                  var valueHtml = it.mono ? ('<span class="mono">' + value + "</span>") : ("<span>" + value + "</span>");
                  body.push('<div class="field-row"><span>' + label + "</span>" + valueHtml + "</div>");
                }
              }
              body.push("</div>");
              UI.openModalCard({
                title: "Quest Reward Claimed",
                sub: res.title || "",
                bodyHtml: body.join("")
              });
            } else {
              UI.openModalCard({
                title: "Cannot Claim Reward",
                sub: def.title || "",
                bodyHtml: '<div class="card-section small dim">' + ((res && res.message) ? res.message : "Unable to claim reward.") + "</div>"
              });
            }
            UI.renderCurrentTab();
            UI.refresh();
          });
        }
      }
    },
    drawPriceChart: function (container, history) {
      if (!container || typeof Flotr === "undefined" || !history || history.length === 0) return;
      var data = [];
      var ticks = [];
      for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        var x = i;
        var price = entry && typeof entry.price === "number" ? entry.price : 0;
        data.push([x, price]);
        var day = entry && typeof entry.day === "number" ? entry.day : Game.state.day || 1;
        var minutes = 0;
        if (entry && typeof entry.minutes === "number") {
          minutes = entry.minutes;
        } else if (entry && typeof entry.hour === "number") {
          minutes = entry.hour * 60;
        }
        if (minutes < 0) minutes = 0;
        var hour = Math.floor(minutes / 60);
        var minute = Math.floor(minutes % 60);
        if (hour < 0) hour = 0;
        if (hour > 23) hour = 23;
        if (minute < 0) minute = 0;
        if (minute > 59) minute = 59;
        var hh = hour < 10 ? "0" + hour : "" + hour;
        var mm = minute < 10 ? "0" + minute : "" + minute;
        var label = "D" + day + " " + hh + ":" + mm;
        ticks.push([x, label]);
      }
      // Determine min/max based on the last 24 in-game hours of real BTC prices
      var maxPrice = 0;
      var minPrice = Number.POSITIVE_INFINITY;
      var scaleHistory = history;
      if (typeof Game !== "undefined" && Game.Btc && Game.Btc.getExchange) {
        var ex = Game.Btc.getExchange();
        if (ex && ex.priceHistory && ex.priceHistory.length > 0) {
          scaleHistory = ex.priceHistory;
        }
      }
      // Compute time threshold for last 24 in-game hours
      var nowDay = Game.state.day || 1;
      var nowMinutes = Game.state.timeMinutes || 0;
      if (nowMinutes < 0) nowMinutes = 0;
      var nowMinuteOfDay = Math.floor(nowMinutes % (24 * 60));
      if (nowMinuteOfDay < 0) nowMinuteOfDay += 24 * 60;
      var nowKey = nowDay * (24 * 60) + nowMinuteOfDay;
      var windowStartKey = nowKey - (24 * 60);
      for (var j = 0; j < scaleHistory.length; j++) {
        var h = scaleHistory[j];
        if (!h || typeof h.price !== "number") continue;
        var key = typeof h.key === "number" ? h.key : null;
        if (key !== null && key < windowStartKey) continue;
        var p = h.price;
        if (!isFinite(p)) continue;
        if (p > maxPrice) maxPrice = p;
        if (p < minPrice) minPrice = p;
      }
      if (maxPrice <= 0) maxPrice = 1;
      if (!isFinite(minPrice) || minPrice <= 0) minPrice = maxPrice * 0.8;
      // Use a realistic exchange-style band: $10 below 24h low, $10 above 24h high
      var floor = minPrice - 10;
      var ceil = maxPrice + 10;
      if (floor < 0) floor = 0;
      // Ensure at least a $0.01 band, then align to cents
      var band = ceil - floor;
      if (band < 0.01) {
        var mid = (ceil + floor) / 2;
        floor = mid - 0.005;
        ceil = mid + 0.005;
        if (floor < 0) floor = 0;
      }
      floor = Math.floor(floor * 100) / 100;
      ceil = Math.ceil(ceil * 100) / 100;
      Flotr.draw(container, [{
        data: data,
        label: "BTC",
        lines: { show: true, lineWidth: 2.5, fill: true, fillOpacity: 0.15 },
        points: { show: true, radius: 2 },
        shadowSize: 0,
        color: "#00ffa3"
      }], {
        HtmlText: false,
        grid: {
          // brighter axis labels, softer, minimal grid lines
          color: "#eeeeee",
          tickColor: "rgba(255,255,255,0.06)",
          outlineWidth: 0,
          verticalLines: false,
          horizontalLines: true
        },
        xaxis: {
          ticks: ticks,
          labelsAngle: 45
        },
        yaxis: {
          // 24h low - $10 as bottom, 24h high + $10 as top.
          min: Math.max(0, floor),
          max: ceil,
          tickFormatter: function (y) {
            var n = typeof y === "number" ? y : parseFloat(y);
            if (!isFinite(n)) n = 0;
            return "$" + n.toFixed(0);
          }
        },
        mouse: {
          track: true,
          trackAll: false,
          sensibility: 2,
          lineColor: "#ffffff",
          trackFormatter: function (obj) {
            var y = (obj && typeof obj.y === "number") ? obj.y : parseFloat(obj && obj.y);
            if (!isFinite(y)) y = 0;
            return obj.series.label + " $" + y.toFixed(0);
          }
        },
        legend: {
          show: false
        }
      });
    },
      initBtcChart: function () {
        var container = document.getElementById("btc-price-chart");
        if (!container) return;
        var ex = Game.Btc.getExchange();
        var history = (ex.priceHistory || []).slice(-12);
        if (!history || history.length === 0) {
          history = UI._btcHistoryCache || [];
        }
        if (history && history.length > 0) {
          UI._btcHistoryCache = history;
          UI._btcChartLastDrawTs = 0;
          UI.drawPriceChart(container, history);
          UI._btcChartLastDrawTs = Date.now ? Date.now() : new Date().getTime();
        }
      },
    computeMoneyForecast: function () {
        var s = Game.state;
        if (!s || !Game || !Game.Economy) {
          return { income: 0, expense: 0 };
        }
        var income = 0;
        var expense = 0;
        // Job income: use wages accrued so far today (pendingWages)
        var j = s.job || null;
        if (j && j.current && j.current !== "none") {
          var pw = typeof j.pendingWages === "number" ? j.pendingWages : 0;
          if (pw > 0) income += pw;
        }
      // Property maintenance, rent and taxes (per day)
      if (Game.Property && Game.Property.getPropertyDef && s.properties && s.properties.length > 0) {
        var totalValue = 0;
        for (var i = 0; i < s.properties.length; i++) {
          var prop = s.properties[i];
          var def = Game.Property.getPropertyDef(prop.id);
          if (!def) continue;
          totalValue += def.price || 0;
          if (def.maintenancePerDay) {
            expense += def.maintenancePerDay;
          }
          if (prop.tenantId && s.tenants && s.tenants.length > 0) {
            var tenant = null;
            for (var t = 0; t < s.tenants.length; t++) {
              if (s.tenants[t].id === prop.tenantId) {
                tenant = s.tenants[t];
                break;
              }
            }
            if (tenant && tenant.rent) {
              var payChance = (tenant.reliability || 0) * ((tenant.happiness || 0) / 100);
              if (payChance < 0) payChance = 0;
              if (payChance > 1) payChance = 1;
              var rent = tenant.rent;
              if (Game.Prestige && typeof Game.Prestige.getTenantRentMultiplier === "function") {
                rent *= Game.Prestige.getTenantRentMultiplier();
              }
              income += rent * payChance;
            }
          }
        }
        if (totalValue > 0 && Game.Economy.propertyTaxRatePerDay) {
          expense += totalValue * Game.Economy.propertyTaxRatePerDay;
        }
      }
      // BTC mining rigs and cloud contracts (per in-game day, estimated in USD)
      if (s.btc && Game.Btc && Game.Btc.getExchange) {
        var ex = Game.Btc.getExchange();
        var price = ex && ex.priceUsd ? ex.priceUsd : 0;
        var secondsPerGameDay = (24 * 60) / 5; // 1 real second = 5 in-game minutes
        var yieldMult = 1;
        if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
          yieldMult = Game.Prestige.getMiningYieldMultiplier();
        }
        var powerMult = 1;
        if (Game.Prestige && typeof Game.Prestige.getMiningPowerCostMultiplier === "function") {
          powerMult = Game.Prestige.getMiningPowerCostMultiplier();
        }
        var m = s.btc.mining || null;
        if (m && m.rigsOwned > 0 && m.isPowerOn) {
          var btcPerSecond = m.rigsOwned * m.rigHashrate * 0.00000000035 * yieldMult;
          var btcPerDay = btcPerSecond * secondsPerGameDay;
          income += btcPerDay * price;
          expense += (m.rigsOwned * m.powerCostPerDay) * powerMult;
        }
        // PC mining (daily power bill should count as expense)
        var pm = s.btc.pcMiner || null;
        if (pm && pm.isOn) {
          var pcPower = typeof pm.lastPowerCostPerDay === "number" ? pm.lastPowerCostPerDay : 0;
          if ((!pcPower || pcPower <= 0) && Game.Btc && Game.Btc.getPcMinerStats) {
            var stats = Game.Btc.getPcMinerStats();
            pcPower = stats && typeof stats.powerCostPerDay === "number" ? stats.powerCostPerDay : 0;
          }
          if (pcPower > 0) {
            expense += pcPower * powerMult;
          }
          if (price > 0) {
            var hashrate = typeof pm.lastHashrate === "number" ? pm.lastHashrate : 0;
            if ((!hashrate || hashrate <= 0) && Game.Btc && Game.Btc.getPcMinerStats) {
              var stats2 = Game.Btc.getPcMinerStats();
              hashrate = stats2 && typeof stats2.hashrate === "number" ? stats2.hashrate : 0;
            }
            if (hashrate > 0) {
              var pcBtcPerSecond = hashrate * 0.00000000035 * yieldMult;
              var pcBtcPerDay = pcBtcPerSecond * secondsPerGameDay;
              income += pcBtcPerDay * price;
            }
          }
        }
        var cloud = s.btc.cloud || {};
        var cs = cloud.contracts || [];
        if (cs.length > 0 && price > 0) {
          var dailyBtc = 0;
          for (var ci = 0; ci < cs.length; ci++) {
            var c = cs[ci];
            if (c.daysLeft > 0 && c.dailyBtc > 0) {
              dailyBtc += c.dailyBtc * yieldMult;
            }
          }
          if (dailyBtc > 0) {
            income += dailyBtc * price;
          }
        }
      }
      // Bank loans: daily interest + scheduled principal repayment
      if (Game.Bank && Game.Bank.getState) {
        var b = Game.Bank.getState();
        var principal = b.loanPrincipal || 0;
        if (principal > 0) {
          var rate = b.dailyInterestRate || 0;
          if (rate < 0) rate = 0;
          var interest = principal * rate;
          var originalLoan = b.loanOriginal || 0;
          var termDaysBank = Game.Bank.loanTermDays || 28;
          var dailyPrincipal = 0;
          if (originalLoan > 0 && termDaysBank > 0) {
            dailyPrincipal = originalLoan / termDaysBank;
            if (dailyPrincipal > principal) dailyPrincipal = principal;
          }
          var dueTotal = 0;
          if (interest > 0) dueTotal += interest;
          if (dailyPrincipal > 0) dueTotal += dailyPrincipal;
          var coveredByBank = !!b.payLoanFromDeposits && dueTotal > 0 && (b.depositBalance || 0) >= dueTotal;
          if (!coveredByBank) {
            if (interest > 0) expense += interest;
            if (dailyPrincipal > 0) expense += dailyPrincipal;
          }
        }
      }
      // Mining Corp payroll (weekly -> daily)
      if (s.companies && s.companies.miningCorp) {
        var mc = s.companies.miningCorp;
        var staffPerMine = mc.staffPerMine || {};
        var totalStaff = 0;
        for (var key in staffPerMine) {
          if (Object.prototype.hasOwnProperty.call(staffPerMine, key)) {
            totalStaff += staffPerMine[key] || 0;
          }
        }
        if (totalStaff > 0) {
          var weeklyPerStaff = 210;
          var totalWeekly = weeklyPerStaff * totalStaff;
          expense += totalWeekly / 7;
        }
      }
      if (income < 0) income = 0;
      if (expense < 0) expense = 0;
      return { income: income, expense: expense };
    },
    animateNumber: function (key, value) {
      var elId = null;
        if (key === "money") {
          elId = "stat-money";
        } else if (key === "btc") {
          elId = "stat-btc";
        } else if (key === "retailFunds") {
          elId = "retail-summary-money";
        } else if (key === "miningFunds") {
          elId = "mining-funds";
        } else if (key === "railFunds") {
          elId = "rail-funds";
        }
        if (!elId) return;
      var el = document.getElementById(elId);
      if (!el) return;
      var text = el.textContent.replace(/[^0-9\.-]/g, "");
      var current = parseFloat(text);
      if (isNaN(current)) current = 0;
  
      function clamp(v, lo, hi) {
        if (!isFinite(v)) return lo;
        if (v < lo) return lo;
        if (v > hi) return hi;
        return v;
      }
  
      function durationFromDelta(delta, divisor) {
        if (!isFinite(delta) || delta <= 0) return 0.25;
        var d = 0.25 + Math.log(1 + delta) / divisor;
        return clamp(d, 0.25, 5.0);
      }
  
      if (typeof gsap === "undefined" || !gsap.to) {
        if (key === "money" || key === "retailFunds" || key === "miningFunds" || key === "railFunds") {
          el.textContent = "$" + (typeof value === "number" ? value : current).toFixed(2);
        } else if (key === "btc") {
          el.textContent = UI.formatBtcCompact(typeof value === "number" ? value : current);
        }
        return;
      }
  
      // Keep one active tween per key so frequent updates don't stack/lag behind.
      if (!UI._animNumbers) UI._animNumbers = {};
      if (!UI._animTweens) UI._animTweens = {};
  
      if (key === "btc") {
        var SATS = 100000000;
        var target = UI.getBtcHoldingsDisplayAmount();
        if (!isFinite(target)) target = current;
        var curSat = Math.round(current * SATS);
        var targetSat = Math.round(target * SATS);
        if (!isFinite(curSat)) curSat = 0;
        if (!isFinite(targetSat)) targetSat = curSat;
  
        var objBtc = UI._animNumbers.btc || { sat: curSat };
        objBtc.sat = curSat;
        UI._animNumbers.btc = objBtc;
  
        if (UI._animTweens.btc && UI._animTweens.btc.kill) UI._animTweens.btc.kill();
  
        var deltaSat = Math.abs(targetSat - curSat);
        var dur = durationFromDelta(deltaSat, 8.0);
  
        UI._animTweens.btc = gsap.to(objBtc, {
          duration: dur,
          sat: targetSat,
          ease: "none",
          overwrite: "auto",
          onUpdate: function () {
            var s = Math.round(objBtc.sat);
            if (!isFinite(s)) s = 0;
            el.textContent = UI.formatBtcCompact(s / SATS);
          }
        });
        return;
      }
  
      var obj = UI._animNumbers[key] || { val: current };
      obj.val = current;
      UI._animNumbers[key] = obj;
      if (UI._animTweens[key] && UI._animTweens[key].kill) UI._animTweens[key].kill();
      var targetVal = typeof value === "number" ? value : current;
      if (!isFinite(targetVal)) targetVal = current;
      var delta = Math.abs(targetVal - current);
      var dur2 = durationFromDelta(delta, 3.0);
      UI._animTweens[key] = gsap.to(obj, {
        duration: dur2,
        val: targetVal,
        overwrite: "auto",
        onUpdate: function () {
          if (key === "money" || key === "retailFunds" || key === "miningFunds" || key === "railFunds") {
            el.textContent = "$" + obj.val.toFixed(2);
          }
        }
      });
    },
    animateJobXp: function (currentXp, maxXp) { return UI.Tabs.animateJobXp(currentXp, maxXp); },
    getPositionLocationEmoji: function (locationId) {
      var id = String(locationId || "");
      // Use explicit unicode escapes to avoid encoding issues breaking emoji rendering.
      if (id === "Home") return "\uD83C\uDFE0"; // 🏠
      if (id === "City Centre") return "\uD83C\uDFD9\uFE0F"; // 🏙️
      if (id === "Industrial Park") return "\uD83C\uDFED"; // 🏭
      if (id === "Countryside") return "\uD83C\uDF3E"; // 🌾
      if (id === "Hospital") return "\uD83C\uDFE5"; // 🏥
      return "\uD83D\uDCCD"; // 📍
    },
    getCityMilesFromHome: function (locationId) {
      var id = String(locationId || "");
      if (id === "Home") return 0;
      if (id === "City Centre") return 1.6;
      if (id === "Hospital") return 2.4;
      if (id === "Industrial Park") return 6.8;
      if (id === "Countryside") return 12.5;
      return 0;
    },
    getCityTimelineMiles: function (locationId) {
      // Signed miles along a single "timeline" axis. Negative is left of Home, positive is right.
      // This is purely a UI representation (not a map).
      var id = String(locationId || "");
      if (id === "Home") return 0;
      if (id === "Countryside") return -12.5;
      if (id === "City Centre") return 1.6;
      if (id === "Hospital") return 2.4;
      if (id === "Industrial Park") return 6.8;
      return 0;
    },
    getUkRouteDistanceKmForStops: function (stops) {
      try {
        if (!Game.Companies || typeof Game.Companies.getRailRouteDistanceKm !== "function") return 0;
        if (!Array.isArray(stops) || stops.length < 2) return 0;
        var total = 0;
        for (var i = 0; i < stops.length - 1; i++) {
          total += Game.Companies.getRailRouteDistanceKm(stops[i], stops[i + 1]);
        }
        if (!isFinite(total) || total < 0) total = 0;
        return total;
      } catch (e) {
        return 0;
      }
    },
    getUkDistanceKmBetweenHubs: function (fromHubId, toHubId) {
      try {
        if (!Game.Companies || typeof Game.Companies.findRailPathStops !== "function") return 0;
        var from = String(fromHubId || "");
        var to = String(toHubId || "");
        if (!from || !to || from === to) return 0;
        var stops = Game.Companies.findRailPathStops(from, to);
        return UI.getUkRouteDistanceKmForStops(stops);
      } catch (e) {
        return 0;
      }
    },
    getPositionUkHubLabel: function (hubId) {
      var id = String(hubId || "");
      if (!id) return "";
      try {
        if (Game.World && typeof Game.World.getUkRailHubs === "function") {
          var hubs = Game.World.getUkRailHubs();
          for (var i = 0; i < hubs.length; i++) {
            var h = hubs[i];
            if (h && String(h.id) === id) return h.name || h.id || id;
          }
        }
      } catch (e) {}
      return id;
    },
    _getEmojiMeasureCtx: function () {
      try {
        if (!UI._emojiMeasure) UI._emojiMeasure = {};
        if (!UI._emojiMeasure.canvas) {
          UI._emojiMeasure.canvas = document.createElement("canvas");
          UI._emojiMeasure.canvas.width = 256;
          UI._emojiMeasure.canvas.height = 256;
          UI._emojiMeasure.ctx = UI._emojiMeasure.canvas.getContext("2d", { willReadFrequently: true });
        }
        if (!UI._emojiMeasure.cache) UI._emojiMeasure.cache = {};
        return UI._emojiMeasure.ctx;
      } catch (e) {
        return null;
      }
    },
    _measureEmojiInkBox: function (text, fontFamily) {
      try {
        var t = String(text || "");
        if (!t) return { w: 0, h: 0 };
        var ff = String(fontFamily || "");
        var cacheKey = ff + "||" + t;
        if (UI._emojiMeasure && UI._emojiMeasure.cache && UI._emojiMeasure.cache[cacheKey]) return UI._emojiMeasure.cache[cacheKey];
  
        var ctx = UI._getEmojiMeasureCtx();
        if (!ctx) return { w: 0, h: 0 };
  
        var canvas = UI._emojiMeasure.canvas;
        var fontPx = 96;
        var pad = 48;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.textBaseline = "top";
        ctx.font = fontPx + "px " + (ff || "sans-serif");
        ctx.fillStyle = "#000";
        ctx.fillText(t, pad, pad);
  
        var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = img.data;
        var minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
        for (var y = 0; y < canvas.height; y++) {
          var row = y * canvas.width * 4;
          for (var x = 0; x < canvas.width; x++) {
            var a = data[row + x * 4 + 3];
            if (!a) continue;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
        var box = (maxX >= 0) ? { w: (maxX - minX + 1), h: (maxY - minY + 1) } : { w: fontPx, h: fontPx };
        if (UI._emojiMeasure && UI._emojiMeasure.cache) UI._emojiMeasure.cache[cacheKey] = box;
        return box;
      } catch (e) {
        return { w: 0, h: 0 };
      }
    },
    normalizeTopbarEmojiSizes: function () {
      try {
        var els = document.querySelectorAll(".topbar .topbar-emoji");
        if (!els || !els.length) return;
  
        var texts = [];
        for (var i = 0; i < els.length; i++) texts.push((els[i] && els[i].textContent) ? els[i].textContent : "");
        var key = texts.join("|");
        if (UI._topbarEmojiSizeKey === key) return;
        UI._topbarEmojiSizeKey = key;
  
        var maxInkH = 0;
        var inkHeights = [];
        for (var j = 0; j < els.length; j++) {
          var el = els[j];
          var txt = el && el.textContent ? el.textContent : "";
          if (!txt) {
            inkHeights[j] = 0;
            continue;
          }
          var cs = window.getComputedStyle(el);
          var box = UI._measureEmojiInkBox(txt, cs ? cs.fontFamily : "");
          var h = box && box.h ? box.h : 0;
          inkHeights[j] = h;
          if (h > maxInkH) maxInkH = h;
        }
        if (!(maxInkH > 0)) return;
  
        for (var k = 0; k < els.length; k++) {
          var el2 = els[k];
          if (!el2) continue;
          var ih = inkHeights[k] || 0;
          var scale = (ih > 0) ? (maxInkH / ih) : 1;
          if (!isFinite(scale) || scale <= 0) scale = 1;
          if (scale > 3.0) scale = 3.0;
          if (scale < 0.5) scale = 0.5;
          el2.style.setProperty("--emoji-scale", String(scale));
        }
      } catch (e) {}
    },
    updateTopbarPosition: function () {
      try {
        if (!window.Game || !Game.state) return;
        var s = Game.state;
  
        var container = document.getElementById("topbar-position");
        if (!container) return;
  
        var leftPlaceEl = document.getElementById("pos-place-left");
        var rightPlaceEl = document.getElementById("pos-place-right");
        var markerEl = document.getElementById("pos-marker");
        var distEl = document.getElementById("pos-distance");
        if (!leftPlaceEl || !rightPlaceEl || !markerEl || !distEl) return;
  
        var cityTravel = !!(s.travel && s.travel.inProgress);
        var ukTravel = !!(s.ukTravel && s.ukTravel.inProgress);
        var traveling = cityTravel || ukTravel;
  
        var leftLabel = "";
        var rightLabel = "";
        var leftIcon = "ðŸ ";
        var rightIcon = "ðŸ“";
        var pct = 0;
        var milesFromHome = 0;
  
        if (cityTravel) {
          leftLabel = String((s.travel && s.travel.from) || s.travelLocation || "Home");
          rightLabel = String((s.travel && s.travel.to) || "");
          leftIcon = UI.getPositionLocationEmoji(leftLabel);
          rightIcon = UI.getPositionLocationEmoji(rightLabel);
  
          var totalT = (s.travel && s.travel.totalMinutes) || 0;
          var remainingT = (s.travel && s.travel.remainingMinutes) || 0;
          if (!(totalT > 0)) totalT = 1;
          var doneT = totalT - remainingT;
          if (doneT < 0) doneT = 0;
          if (doneT > totalT) doneT = totalT;
          pct = doneT / totalT;
  
          var fromMiles = UI.getCityMilesFromHome(leftLabel);
          var toMiles = UI.getCityMilesFromHome(rightLabel);
          milesFromHome = fromMiles + ((toMiles - fromMiles) * pct);
        } else if (ukTravel) {
          leftLabel = UI.getPositionUkHubLabel(s.ukTravel ? s.ukTravel.fromPlaceId : "");
          rightLabel = UI.getPositionUkHubLabel(s.ukTravel ? s.ukTravel.toPlaceId : "");
          leftIcon = "ðŸ“";
          rightIcon = "ðŸ“";
  
          var totalU = (s.ukTravel && s.ukTravel.totalMinutes) || 0;
          var remainingU = (s.ukTravel && s.ukTravel.remainingMinutes) || 0;
          if (!(totalU > 0)) totalU = 1;
          var doneU = totalU - remainingU;
          if (doneU < 0) doneU = 0;
          if (doneU > totalU) doneU = totalU;
          pct = doneU / totalU;
  
          var tripKm = UI.getUkRouteDistanceKmForStops(s.ukTravel ? s.ukTravel.stops : null);
          var homeHub = (s.player && s.player.homePlaceId) ? String(s.player.homePlaceId) : String(s.ukTravel ? s.ukTravel.fromPlaceId : "");
          var fromHub = String(s.ukTravel ? s.ukTravel.fromPlaceId : "");
          var baseKm = (homeHub && fromHub && homeHub !== fromHub) ? UI.getUkDistanceKmBetweenHubs(homeHub, fromHub) : 0;
          milesFromHome = (baseKm + (tripKm * pct)) * 0.621371;
        } else {
          leftLabel = "Home";
          rightLabel = String(s.travelLocation || "Home");
          leftIcon = UI.getPositionLocationEmoji(leftLabel);
          rightIcon = UI.getPositionLocationEmoji(rightLabel);
          pct = (rightLabel && rightLabel !== leftLabel) ? 1 : 0;
          milesFromHome = UI.getCityMilesFromHome(rightLabel);
        }
  
        leftPlaceEl.textContent = leftIcon;
        rightPlaceEl.textContent = rightIcon;
  
        if (!isFinite(milesFromHome) || milesFromHome < 0) milesFromHome = 0;
        var milesStr = (Math.round(milesFromHome * 10) / 10).toFixed(1);
        var distSuffix = "";
        if (traveling) {
          distSuffix = Math.floor(pct * 100) + "%";
        } else if (mode === "city") {
          distSuffix = shortCityLabel(rightLabel || "Home");
        }
        distEl.textContent = milesStr + " mi" + (distSuffix ? (" \u00b7 " + distSuffix) : "");
  
        // Keep the topbar position display to 2 place emojis + 1 player emoji.
        // Avoid ZWJ/arrow sequences that can render as multiple glyphs on some platforms.
        var travelSteps = ["\uD83E\uDDCD", "\uD83D\uDEB6", "\uD83D\uDEB6", "\uD83D\uDEB4", "\uD83D\uDEB5", "\uD83C\uDFC3", "\uD83C\uDFC3"];
        var stance = "\uD83E\uDDCD";
        if (traveling) {
          var stepIdx = 1 + Math.floor(pct * (travelSteps.length - 1));
          if (stepIdx < 1) stepIdx = 1;
          if (stepIdx >= travelSteps.length) stepIdx = travelSteps.length - 1;
          stance = travelSteps[stepIdx];
        }
        markerEl.textContent = stance;
        markerEl.style.left = Math.max(0, Math.min(100, pct * 100)) + "%";
        UI.normalizeTopbarEmojiSizes();
  
        var title = "Home â†’ " + (traveling ? ("In transit (" + Math.floor(pct * 100) + "%)") : (rightLabel || "")) + " (" + milesStr + " mi)";
        if (traveling) {
          title = "Travel: " + (leftLabel || "Start") + " â†’ " + (rightLabel || "Destination") + " (" + Math.floor(pct * 100) + "%) Â· " + milesStr + " mi from Home";
        }
        container.title = title;
      } catch (e) {}
    },
      refresh: function () {
        var s = Game.state;
        UI.updateMusicWidget();
        UI.updateTopbarPosition();
        UI.updateTabDisabledStates();
        function isTweenActive(tween) {
          try {
            if (!tween) return false;
            if (typeof tween.isActive === "function") return !!tween.isActive();
            if (typeof tween.progress === "function") {
              var p = tween.progress();
              return (typeof p === "number" && isFinite(p) && p < 1);
            }
          } catch (e) {}
          return false;
        }
        var moneyEl = document.getElementById("stat-money");
        if (moneyEl) {
          var moneyVal = (s && typeof s.money === "number" && isFinite(s.money)) ? s.money : 0;
          if (!UI._animTweens || !isTweenActive(UI._animTweens.money)) {
            moneyEl.textContent = "$" + moneyVal.toFixed(2);
          }
          UI.moneyInit = true;
        }
        var btcEl = document.getElementById("stat-btc");
        if (btcEl) {
          if (!UI._animTweens || !isTweenActive(UI._animTweens.btc)) {
            btcEl.textContent = UI.formatBtcCompact(UI.getBtcHoldingsDisplayAmount());
          }
          UI.btcInit = true;
        }
          var btcUnconfirmedEl = document.getElementById("stat-btc-unconfirmed");
          if (btcUnconfirmedEl) {
            var u = typeof s.unconfirmedBtc === "number" ? s.unconfirmedBtc : 0;
            btcUnconfirmedEl.textContent = "Unconfirmed +" + u.toFixed(8) + " BTC";
          }
        var dtLabelEl = document.getElementById("stat-daytime-label");
          if (dtLabelEl) {
            var labelText = "Monday";
            if (Game && typeof Game.getDayOfWeekString === "function") {
              labelText = Game.getDayOfWeekString();
            }
            dtLabelEl.textContent = labelText;
          }
        var dtEl = document.getElementById("stat-daytime");
          if (dtEl) {
            var mealLabel = "";
            if (Game.Meals && Game.Meals.getCurrentMealPeriod) {
              mealLabel = Game.Meals.getCurrentMealPeriod();
            }
          var timeStr = "Day " + s.day + ", " + Game.getClockString();
          dtEl.textContent = mealLabel ? (timeStr + " \u2013 " + mealLabel) : timeStr;
        }
        var monthYearEl = document.getElementById("stat-monthyear");
        if (monthYearEl && Game && typeof Game.getMonthYearString === "function") {
          monthYearEl.textContent = Game.getMonthYearString();
        }
        if (Game && Game.state && Game.state.pc && Game.state.pc.isOpen && UI && UI.updatePCDesktopWidgetsDynamic) {
          UI.updatePCDesktopWidgetsDynamic();
        }
        var activityEl = document.getElementById("stat-activity");
        var activityBar = document.getElementById("stat-activity-progress");
        if (activityEl || activityBar) {
          var statusLabel = "Idle";
          var statusPercent = 0;
          var maxEnergy = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
          if (typeof maxEnergy !== "number" || !isFinite(maxEnergy) || maxEnergy <= 0) maxEnergy = 100;
          if (s.sleeping) {
            var etaMin = 0;
            if (Game && typeof Game.getSleepEtaMinutes === "function") {
              etaMin = Game.getSleepEtaMinutes() || 0;
            }
            if (typeof etaMin !== "number" || !isFinite(etaMin) || etaMin < 0) etaMin = 0;
            var hh = Math.floor(etaMin / 60);
            var mm = Math.floor(etaMin % 60);
            var etaStr = hh + ":" + (mm < 10 ? "0" + mm : mm);
            statusLabel = "Sleeping (ETA " + etaStr + ")";
            statusPercent = Math.floor(((s.energy || 0) / maxEnergy) * 100);
          } else if (s.travel && s.travel.inProgress) {
            statusLabel = "Traveling: " + (s.travel.to || "destination");
            var totalT = s.travel.totalMinutes || 1;
            var remainingT = s.travel.remainingMinutes || 0;
            var doneT = totalT - remainingT;
            if (doneT < 0) doneT = 0;
            if (doneT > totalT) doneT = totalT;
            statusPercent = Math.floor((doneT / totalT) * 100);
          } else if (s.job && s.job.isWorking) {
            var jobDef = (Game.Jobs && Game.Jobs.defs) ? (Game.Jobs.defs[s.job.current] || Game.Jobs.defs.none) : null;
            statusLabel = "Working: " + (jobDef ? jobDef.name : "Shift");
            statusPercent = Math.floor((s.job.shiftMinutes / (8 * 60)) * 100);
          } else if (s.school && s.school.enrolled) {
            statusLabel = "Studying";
            if (s.school.course && Game.School && Game.School.courses && Game.School.courses[s.school.course]) {
              statusLabel = "Studying: " + Game.School.courses[s.school.course].name;
            }
            var totalS = s.school.maxProgress || 1;
            statusPercent = Math.floor((s.school.progress / totalS) * 100);
          }
          if (statusPercent < 0) statusPercent = 0;
          if (statusPercent > 100) statusPercent = 100;
          if (activityEl) activityEl.textContent = statusLabel;
          if (activityBar) activityBar.style.width = statusPercent + "%";
        }
        var forecastEl = document.getElementById("stat-money-forecast");
        if (forecastEl && Game && Game.state) {
          var forecast = UI.computeMoneyForecast();
          var inc = forecast.income || 0;
          var exp = forecast.expense || 0;
          forecastEl.textContent = "Income +$" + inc.toFixed(0) + " / Expense -$" + exp.toFixed(0) + " per day";
        }
        var healthEl = document.getElementById("bar-health");
        var energyEl = document.getElementById("bar-energy");
        var hungerEl = document.getElementById("bar-hunger");
        var eduEl = document.getElementById("bar-edu");
        if (healthEl) {
          var maxHealth = (Game.Health && Game.Health.getMaxHealth) ? Game.Health.getMaxHealth() : 100;
          if (typeof maxHealth !== "number" || !isFinite(maxHealth) || maxHealth <= 0) maxHealth = 100;
          var pct = (s.health / maxHealth) * 100;
          if (pct < 0) pct = 0;
          if (pct > 100) pct = 100;
          healthEl.style.width = Math.round(pct) + "%";
        }
        if (energyEl) {
          var maxEnergy2 = (Game.Health && Game.Health.getMaxEnergy) ? Game.Health.getMaxEnergy() : 100;
          if (typeof maxEnergy2 !== "number" || !isFinite(maxEnergy2) || maxEnergy2 <= 0) maxEnergy2 = 100;
          var pctE = ((s.energy || 0) / maxEnergy2) * 100;
          if (pctE < 0) pctE = 0;
          if (pctE > 100) pctE = 100;
          energyEl.style.width = Math.round(pctE) + "%";
        }
      if (hungerEl) hungerEl.style.width = Math.max(0, Math.min(100, Math.round(s.hunger))) + "%";
        if (eduEl) eduEl.style.width = Game.School.getLevelProgressPercent() + "%";
      if (!Array.isArray(s.notifications)) {
        s.notifications = [];
      }
      var notifications = s.notifications;
      var toastDurationSec = UI.getNotificationToastSeconds();
      var toastDurationMs = toastDurationSec * 1000;
      var nowMs = Date.now ? Date.now() : (new Date().getTime());
      if (toastDurationMs > 0) {
        for (var ni = notifications.length - 1; ni >= 0; ni--) {
          var entry = notifications[ni];
          if (!entry) continue;
          if (typeof entry.createdAtMs !== "number") {
            entry.createdAtMs = nowMs;
          }
          if (nowMs - entry.createdAtMs >= toastDurationMs) {
            notifications.splice(ni, 1);
          }
        }
      }
      var area = document.getElementById("notification-area");
      if (area) {
        if (UI.currentTab === "eventlog") {
          // Hide the floating notifications when viewing the Event Log page,
          // so the player focuses on the log and filters instead.
          area.innerHTML = "";
        } else {
          var html = [];
          var maxToasts = Math.min(4, notifications.length);
          for (var i = 0; i < maxToasts; i++) {
            var n = notifications[i];
            var t = Math.floor(n.timeMinutes);
            var h = Math.floor(t / 60);
            var m = t % 60;
            var hh = (h < 10 ? "0" : "") + h;
            var mm = (m < 10 ? "0" : "") + m;
            html.push('<div class="toast" data-idx="' + i + '"><span>' + n.text + '</span><span class="toast-time">Day ' + n.day + " " + hh + ":" + mm + "</span></div>");
          }
          area.innerHTML = html.join("");
        }
      }
        if (UI.currentTab === "overview") {
          UI.updateOverviewDynamic();
        } else if (UI.currentTab === "quests") {
          UI.updateQuestsDynamic();
        } else if (UI.currentTab === "school") {
          var eduProgress2 = Game.School.getLevelProgressPercent();
          var eduBar = document.getElementById("school-level-bar");
          if (eduBar) {
            eduBar.style.width = eduProgress2 + "%";
          }
          var courseBar = document.getElementById("school-course-bar");
          if (courseBar && s.school && s.school.enrolled && s.school.maxProgress > 0) {
            var p2 = Math.floor((s.school.progress / s.school.maxProgress) * 100);
            if (p2 < 0) p2 = 0;
            if (p2 > 100) p2 = 100;
            courseBar.style.width = p2 + "%";
          }
          UI.updateSchoolDynamic();
        } else if (UI.currentTab === "jobs") {
          UI.updateJobsDynamic();
        } else if (UI.currentTab === "companies") {
          UI.updateCompaniesDynamic();
        } else if (UI.currentTab === "property") {
          UI.updatePropertyDynamic();
        } else if (UI.currentTab === "healthcare") {
          UI.updateHealthcareDynamic();
        } else if (UI.currentTab === "travel") {
          UI.updateTravelDynamic();
        } else if (UI.currentTab === "bank") {
          UI.updateBankDynamic();
        } else if (UI.currentTab === "btc") {
          UI.updateBtcDynamic();
        } else if (UI.currentTab === "prestige") {
          UI.updatePrestigeDynamic();
        }
        // Update BTC price chart at most once per real minute while BTC tab is visible
        if (UI.currentTab === "btc" && typeof Flotr !== "undefined") {
          var btcContainer = document.getElementById("btc-price-chart");
          // Live-update BTC spot price label in BTC tab
          if (Game.Btc && Game.Btc.getExchange) {
            var exSpot = Game.Btc.getExchange();
            var spotEl = document.getElementById("btc-spot-price");
            if (spotEl) {
              spotEl.textContent = "$" + exSpot.priceUsd.toFixed(0) + " / BTC";
            }
          }
          if (btcContainer) {
            var nowTs = Date.now ? Date.now() : new Date().getTime();
            if (!UI._btcChartLastDrawTs || nowTs - UI._btcChartLastDrawTs > 60000) {
              var ex = Game.Btc.getExchange();
              var history = (ex.priceHistory || []).slice(-12);
              if (history && history.length > 0) {
                UI._btcHistoryCache = history;
                UI.drawPriceChart(btcContainer, history);
                UI._btcChartLastDrawTs = nowTs;
              }
            }
          }
        }
        // Update PC market chart at most once per real minute while PC market app is visible.
      if (Game.state.pc.isOpen && (((UI.pcHasVisibleApp && UI.pcHasVisibleApp("market")) || Game.state.pc.activeApp === "market")) && typeof Flotr !== "undefined") {
          var marketWin = (Game && Game.PC && Game.PC.findWindowByApp) ? Game.PC.findWindowByApp("market") : null;
          var pcWindow = marketWin ? document.getElementById("pc-win-content-" + marketWin.id) : null;
          if (!pcWindow) pcWindow = document.getElementById("pc-window");
          var pcChart = pcWindow ? pcWindow.querySelector("#pc-market-chart") : null;
          // Live-update spot price label in PC market (BTC or altcoins)
          if (pcWindow) {
            var selectedCoin = (Game.state && Game.state.pc && typeof Game.state.pc.marketCoin === "string") ? Game.state.pc.marketCoin : "BTC";
            selectedCoin = String(selectedCoin || "BTC").toUpperCase();
            var exSpot2 = null;
            if (selectedCoin === "BTC" && Game.Btc && Game.Btc.getExchange) {
              exSpot2 = Game.Btc.getExchange();
            } else if (Game.Crypto && Game.Crypto.getExchange) {
              exSpot2 = Game.Crypto.getExchange(selectedCoin);
            }
            var pcSpotEl = pcWindow.querySelector("#pc-spot-price");
            if (pcSpotEl && exSpot2 && typeof exSpot2.priceUsd === "number") {
              if (selectedCoin === "BTC") pcSpotEl.textContent = "$" + exSpot2.priceUsd.toFixed(0) + " / BTC";
              else {
                var dec = (selectedCoin === "DOGE" || selectedCoin === "MATIC" || selectedCoin === "USDT") ? 4 : 2;
                pcSpotEl.textContent = "$" + exSpot2.priceUsd.toFixed(dec) + " / " + selectedCoin;
              }
            }
            var balEl = pcWindow.querySelector("#pc-alt-balance");
            if (balEl && selectedCoin !== "BTC" && Game.Crypto && Game.Crypto.getBalance) {
              balEl.textContent = Game.Crypto.getBalance(selectedCoin).toFixed(8);
            }
          }
          if (pcChart) {
            var nowTs2 = Date.now ? Date.now() : new Date().getTime();
            if (!UI._pcMarketChartLastDrawTs || nowTs2 - UI._pcMarketChartLastDrawTs > 60000) {
              var selectedCoin2 = (Game.state && Game.state.pc && typeof Game.state.pc.marketCoin === "string") ? Game.state.pc.marketCoin : "BTC";
              selectedCoin2 = String(selectedCoin2 || "BTC").toUpperCase();
              var ex2 = null;
              if (selectedCoin2 === "BTC" && Game.Btc && Game.Btc.getExchange) {
                ex2 = Game.Btc.getExchange();
              } else if (Game.Crypto && Game.Crypto.getExchange) {
                ex2 = Game.Crypto.getExchange(selectedCoin2);
              }
              var history2 = ex2 ? (ex2.priceHistory || []).slice(-12) : [];
              if (history2 && history2.length > 0) {
                UI.drawPriceChart(pcChart, history2);
                UI._pcMarketChartLastDrawTs = nowTs2;
              }
            }
          }
  
          // Live trades tape update (every refresh tick).
          var selCoin = (Game.state && Game.state.pc && typeof Game.state.pc.marketCoin === "string") ? Game.state.pc.marketCoin : "BTC";
          selCoin = String(selCoin || "BTC").toUpperCase();
          if (selCoin !== "BTC") {
            var exAlt3 = (Game.Crypto && Game.Crypto.getExchange) ? Game.Crypto.getExchange(selCoin) : null;
            var listAlt3 = exAlt3 && exAlt3.recentTrades ? exAlt3.recentTrades : [];
            var bodyAlt3 = document.getElementById("alt-trades-body");
            if (bodyAlt3 && listAlt3) {
              var dec3 = (selCoin === "DOGE" || selCoin === "MATIC" || selCoin === "USDT") ? 4 : 2;
              var rowsAlt3 = [];
              var nAlt3 = Math.min(listAlt3.length, 12);
              for (var iAlt3 = 0; iAlt3 < nAlt3; iAlt3++) {
                var trA = listAlt3[iAlt3];
                var sideLabelA = trA.side === "sell" ? "Sell" : "Buy";
                var badgeClassA = trA.side === "sell" ? "badge-red" : "badge-green";
                rowsAlt3.push(
                  "<tr>" +
                    '<td><span class="badge ' + badgeClassA + ' badge-pill">' + sideLabelA + "</span></td>" +
                    "<td>$" + (trA.price || 0).toFixed(dec3) + "</td>" +
                    "<td>" + (trA.amount || 0).toFixed(6) + " " + selCoin + "</td>" +
                  "</tr>"
                );
              }
              bodyAlt3.innerHTML = rowsAlt3.join("");
            }
          } else {
            var exB3 = (Game.Btc && Game.Btc.getExchange) ? Game.Btc.getExchange() : null;
             var listB3 = exB3 && exB3.recentTrades ? exB3.recentTrades : [];
             var bodyB3 = document.getElementById("pc-trades-body");
             if (bodyB3 && listB3) {
               var rowsB3 = [];
               var nB3 = Math.min(listB3.length, 10);
               if (!nB3) {
                 rowsB3.push('<tr><td colspan="4" class="small dim">No trades have been executed yet.</td></tr>');
               }
               for (var iB3 = 0; iB3 < nB3; iB3++) {
                 var trB3 = listB3[iB3];
                 var minutesB3 = trB3.minutes || 0;
                 var hB3 = Math.floor(minutesB3 / 60);
                var mB3 = minutesB3 % 60;
                var hhB3 = (hB3 < 10 ? "0" : "") + hB3;
                var mmB3 = (mB3 < 10 ? "0" : "") + mB3;
                var sideLabelB3 = trB3.side === "sell" ? "Sell" : "Buy";
                var badgeClassB3 = trB3.side === "sell" ? "badge-red" : "badge-green";
                rowsB3.push(
                  "<tr>" +
                    "<td>Day " + (trB3.day || 1) + " " + hhB3 + ":" + mmB3 + "</td>" +
                    '<td><span class="badge ' + badgeClassB3 + ' badge-pill">' + sideLabelB3 + "</span></td>" +
                    "<td>$" + (trB3.price || 0).toFixed(0) + "</td>" +
                    "<td>" + (trB3.amount || 0).toFixed(8) + " BTC</td>" +
                  "</tr>"
                );
               }
                bodyB3.innerHTML = rowsB3.join("");
              }
  
             // Keep the BTC order book live-updated without re-rendering the whole app (preserves inputs/scroll).
             var asksBody3 = document.getElementById("pc-asks-body");
             var bidsBody3 = document.getElementById("pc-bids-body");
             if ((asksBody3 || bidsBody3) && exB3) {
               var nowTsBook3 = Date.now ? Date.now() : new Date().getTime();
               if (!UI._pcMarketBookLastTs || nowTsBook3 - UI._pcMarketBookLastTs > 900) {
                 UI._pcMarketBookLastTs = nowTsBook3;
  
                 if (asksBody3) {
                   var asks3 = (exB3.sellOrders || []).slice().sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
                   var rowsAsk3 = [];
                   if (!asks3.length) {
                     rowsAsk3.push('<tr><td colspan="3" class="small dim">No asks yet.</td></tr>');
                   } else {
                     var maxAskRows = Math.min(asks3.length, 40);
                     for (var ia3 = 0; ia3 < maxAskRows; ia3++) {
                       var ask3 = asks3[ia3];
                       if (!ask3) continue;
                       var isOwnAsk3 = ask3.owner === "player";
                       rowsAsk3.push(
                         "<tr>" +
                           "<td>$" + (ask3.price || 0).toFixed(0) + "</td>" +
                           "<td>" + (ask3.remaining || 0).toFixed(8) + " BTC</td>" +
                           '<td><button class="btn btn-small btn-outline btn-fill-order" data-order="' + ask3.id + '"' + (isOwnAsk3 ? " disabled" : "") + ">" + (isOwnAsk3 ? "Your order" : "Buy") + "</button></td>" +
                         "</tr>"
                       );
                     }
                   }
                   asksBody3.innerHTML = rowsAsk3.join("");
                 }
  
                 if (bidsBody3) {
                   var bids3 = (exB3.buyOrders || []).slice().sort(function (a2, b2) { return (b2.price || 0) - (a2.price || 0); });
                   var rowsBid3 = [];
                   if (!bids3.length) {
                     rowsBid3.push('<tr><td colspan="3" class="small dim">No bids yet.</td></tr>');
                   } else {
                     var maxBidRows = Math.min(bids3.length, 40);
                     for (var ib3 = 0; ib3 < maxBidRows; ib3++) {
                       var bid3 = bids3[ib3];
                       if (!bid3) continue;
                       var isOwnBid3 = bid3.owner === "player";
                       rowsBid3.push(
                         "<tr>" +
                           "<td>$" + (bid3.price || 0).toFixed(0) + "</td>" +
                           "<td>" + (bid3.remaining || 0).toFixed(8) + " BTC</td>" +
                           '<td><button class="btn btn-small btn-outline btn-fill-order" data-order="' + bid3.id + '"' + (isOwnBid3 ? " disabled" : "") + ">" + (isOwnBid3 ? "Your order" : "Sell") + "</button></td>" +
                         "</tr>"
                       );
                     }
                   }
                   bidsBody3.innerHTML = rowsBid3.join("");
                 }
               }
             }
             var spreadEl3 = document.getElementById("pc-mkt-spread");
             if (spreadEl3 && exB3) {
               var bestAsk3 = null;
               var bestBid3 = null;
              if (exB3.sellOrders && exB3.sellOrders.length) {
                for (var sa3 = 0; sa3 < exB3.sellOrders.length; sa3++) {
                  var oAsk3 = exB3.sellOrders[sa3];
                  if (!oAsk3) continue;
                  if (bestAsk3 === null || oAsk3.price < bestAsk3) bestAsk3 = oAsk3.price;
                }
              }
              if (exB3.buyOrders && exB3.buyOrders.length) {
                for (var sb3 = 0; sb3 < exB3.buyOrders.length; sb3++) {
                  var oBid3 = exB3.buyOrders[sb3];
                  if (!oBid3) continue;
                  if (bestBid3 === null || oBid3.price > bestBid3) bestBid3 = oBid3.price;
                }
              }
              var spread3 = (bestAsk3 !== null && bestBid3 !== null) ? (bestAsk3 - bestBid3) : null;
              spreadEl3.textContent =
                (bestAsk3 !== null ? ("$" + bestAsk3.toFixed(0)) : "-") +
                " Æ’?Â½ " +
                (bestBid3 !== null ? ("$" + bestBid3.toFixed(0)) : "-") +
                (spread3 !== null ? (" Æ’?Â½ spread $" + spread3.toFixed(0)) : "");
            }
          }
        }
        if (Game.state.pc.isOpen && ((UI.pcHasVisibleApp && UI.pcHasVisibleApp("desktop")) || Game.state.pc.activeApp === "desktop")) {
          UI.updatePCDesktopDynamic();
        }
        if (Game.state.pc.isOpen && ((UI.pcHasVisibleApp && UI.pcHasVisibleApp("wallet")) || Game.state.pc.activeApp === "wallet")) {
          UI.updateWalletDynamic();
        }
        if (Game.state.pc.isOpen && ((UI.pcHasVisibleApp && UI.pcHasVisibleApp("internet")) || Game.state.pc.activeApp === "internet")) {
          var net = Game.state.net || {};
          var currentMbps = typeof net.currentMbps === "number" ? net.currentMbps : 0;
          var el = document.getElementById("pc-net-current");
          if (el) el.textContent = Math.round(currentMbps * 1000) + " Kbps";
        }
        if (Game.state.pc.isOpen && ((UI.pcHasVisibleApp && UI.pcHasVisibleApp("pcminer")) || Game.state.pc.activeApp === "pcminer")) {
          var p = Game.state.btc && Game.state.btc.pcMiner ? Game.state.btc.pcMiner : null;
          if (p && Game.Btc && Game.Btc.getPcMinerStats) {
            var s = Game.Btc.getPcMinerStats();
            var heatEl = document.getElementById("pcminer-heat");
            var heatBar = document.getElementById("pcminer-heat-bar");
            var hashEl = document.getElementById("pcminer-hash");
            var wattsEl = document.getElementById("pcminer-watts");
            var billEl = document.getElementById("pcminer-bill");
            if (heatEl) heatEl.textContent = (p.heat || 0).toFixed(0) + " / " + (s.maxHeat || 100).toFixed(0);
            if (heatBar) {
              var pct = Math.floor((Math.min(s.maxHeat || 1, Math.max(0, p.heat || 0)) / Math.max(1, s.maxHeat || 1)) * 100);
              if (pct < 0) pct = 0;
              if (pct > 100) pct = 100;
              heatBar.style.width = pct + "%";
            }
              if (hashEl) {
              var yieldMult = 1;
              if (Game.Prestige && typeof Game.Prestige.getMiningYieldMultiplier === "function") {
                yieldMult = Game.Prestige.getMiningYieldMultiplier();
              }
              var perHourBtc = (s.hashrate || 0) * 0.00000000035 * 3600 * yieldMult;
              var coinId = String(p.coinId || "BTC").toUpperCase();
              if (coinId === "BTC") {
                hashEl.innerHTML = UI.formatBtcHtml(perHourBtc);
              } else {
                var mult = (coinId === "LTC") ? 120 : (coinId === "DOGE" ? 550 : 50);
                hashEl.textContent = (perHourBtc * mult).toFixed(8) + " " + coinId;
              }
            }
            if (wattsEl) wattsEl.textContent = (s.watts || 0).toFixed(0) + " W";
            if (billEl) billEl.textContent = "$" + (p.lastPowerCostPerDay || s.powerCostPerDay || 0).toFixed(1);
          }
        }
        if (Game.state.pc.isOpen && ((UI.pcHasVisibleApp && UI.pcHasVisibleApp("antivirus")) || Game.state.pc.activeApp === "antivirus")) {
          if (UI && UI.updatePCAntivirusDynamic) UI.updatePCAntivirusDynamic();
        }
        UI.updateDownloadsDynamic();
    },
    updateJobsDynamic: function () { return UI.Tabs.updateJobsDynamic(); },
    updateOverviewDynamic: function () { return UI.Tabs.updateOverviewDynamic(); },
    updateQuestsDynamic: function () { return UI.Tabs.updateQuestsDynamic(); },
    updateHealthcareDynamic: function () { return UI.Tabs.updateHealthcareDynamic(); },
    updatePropertyDynamic: function () { return UI.Tabs.updatePropertyDynamic ? UI.Tabs.updatePropertyDynamic() : null; },
    updateSchoolDynamic: function () { return UI.Tabs.updateSchoolDynamic(); },
    updatePrestigeDynamic: function () { return UI.Tabs.updatePrestigeDynamic(); },
    updateTravelDynamic: function () { return UI.Tabs.updateTravelDynamic(); },
  
  });
})();

