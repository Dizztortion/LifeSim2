(function () {
  window.UI = window.UI || {};
  var UI = window.UI;

  function withinPcOverlay(target) {
    var overlay = document.getElementById("pc-overlay");
    return !!(overlay && target && overlay.contains(target));
  }

  function ensurePcOpenFromDesktop() {
    if (UI._pcOpenFromDesktop) return;
    UI._pcOpenFromDesktop = function (appId) {
      var id = String(appId || "");
      if (!id) return;
      if (!window.Game || !Game.state || !Game.PC) return;

      if (Game.PC.isAppInstalled && !Game.PC.isAppInstalled(id)) {
        if (id === "internet") {
          if (Game.PC.startAppInstall) {
            var d = Game.PC.startAppInstall("internet", { minimized: false });
            if (d && d.id && Game.PC.openDownload) Game.PC.openDownload(d.id);
            if (UI.renderPC) UI.renderPC();
          }
          return;
        }
        if (Game.PC.isAppInstalled("internet") && UI.pcWebNavigate) {
          UI.pcWebNavigate("https://ninja.web/apps/" + id);
          Game.PC.openApp("internet");
          if (UI.renderPC) UI.renderPC();
          return;
        }
        if (Game.addNotification) Game.addNotification("Install Ninja Web Browser first.");
        return;
      }

      Game.PC.openApp(id);
      if (UI.renderPC) UI.renderPC();
    };

    UI._pcOpenFileFromDesktop = function (fileId) {
      var id = typeof fileId === "number" ? fileId : parseInt(fileId, 10);
      if (!isFinite(id)) return;
      if (!window.Game || !Game.state || !Game.PC) return;
      if (Game.PC.openFile) Game.PC.openFile(id);
      if (UI.renderPC) UI.renderPC();
    };
  }

  function ensurePcContextMenuFns() {
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
  }

  function item(label, action, kbd, disabled) {
    return '<button type="button" class="pc-context-item" data-pc-menu-action="' + action + '"' + (disabled ? " disabled" : "") + ">" +
      "<span>" + label + "</span>" +
      (kbd ? ('<span class="pc-context-kbd">' + kbd + "</span>") : "") +
    "</button>";
  }
  function sep() { return '<div class="pc-context-sep"></div>'; }

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
    var desktopFiles = (Game.state.pc.desktop && Array.isArray(Game.state.pc.desktop.desktopFiles)) ? Game.state.pc.desktop.desktopFiles.slice() : [];
    for (var j = 0; j < desktopFiles.length; j++) {
      var fid = desktopFiles[j];
      var key = "file:" + fid;
      Game.state.pc.desktop.icons[key] = { x: 10 + 2 * 134, y: 10 + j * 92 };
    }
  }

  UI.bindPcEvents = function () {
    // Bind once globally; resolve elements dynamically each event.
    if (UI._pcEventsBound) return;
    UI._pcEventsBound = true;

    ensurePcOpenFromDesktop();
    ensurePcContextMenuFns();

    UI._pcDragState = null;
    UI._pcIconDragState = null;
    UI._pcSuppressNextIconClick = false;

    document.addEventListener("click", function (e) {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      if (!withinPcOverlay(e.target)) return;

      // Context menu clicks.
      var menu = document.getElementById("pc-context-menu");
      if (menu && !menu.classList.contains("hidden")) {
        var btn = e.target && e.target.closest ? e.target.closest("[data-pc-menu-action]") : null;
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          var action = btn.getAttribute("data-pc-menu-action");
          var ctx = menu._ctx || {};

          if (ctx.kind === "desktop") {
            if (action === "desk_refresh") UI.renderPC();
            else if (action === "desk_auto_arrange") { doAutoArrange(); UI.renderPC(); }
            else if (action === "desk_toggle_grid") {
              if (Game && Game.state && Game.state.pc && Game.state.pc.desktop) {
                Game.state.pc.desktop.lockToGrid = !Game.state.pc.desktop.lockToGrid;
              }
              UI.renderPC();
            } else if (action === "desk_open_monitor") { Game.PC.openApp("monitor"); UI.renderPC(); }
            else if (action === "desk_open_internet") { Game.PC.openApp("internet"); UI.renderPC(); }
          } else if (ctx.kind === "icon") {
            if (action === "icon_open") UI._pcOpenFromDesktop(ctx.appId);
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
          return;
        }
      }

      // Close context menu when clicking outside it.
      if (UI._hidePcContextMenu) {
        var cm = document.getElementById("pc-context-menu");
        if (cm && !cm.classList.contains("hidden") && !cm.contains(e.target)) UI._hidePcContextMenu();
      }

      // Close Start menu when clicking outside it.
      try {
        if (Game.state && Game.state.pc && Game.state.pc.uiStartMenuOpen) {
          var startMenu = document.getElementById("pc-start-menu");
          var startBtn = document.getElementById("pc-start-btn");
          var clickedInStart = startMenu && startMenu.contains(e.target);
          var clickedStartBtn = startBtn && startBtn.contains(e.target);
          if (!clickedInStart && !clickedStartBtn) {
            Game.state.pc.uiStartMenuOpen = false;
            UI.renderPC();
            // Continue to allow other clicks (e.g., taskbar buttons) to work.
          }
        }
      } catch (e2) {}

      // Start button toggles Start menu.
      var startToggle = e.target && e.target.closest ? e.target.closest("#pc-start-btn") : null;
      if (startToggle) {
        Game.state.pc.uiStartMenuOpen = !Game.state.pc.uiStartMenuOpen;
        UI.renderPC();
        return;
      }

      // Window controls.
      var winCtl = e.target && e.target.closest ? e.target.closest(".pc-win-btn") : null;
      if (winCtl) {
        var action0 = winCtl.getAttribute("data-action");
        var winId0 = parseInt(winCtl.getAttribute("data-win-id"), 10);
        if (isFinite(winId0)) {
          if (action0 === "close") Game.PC.closeWindow(winId0);
          else if (action0 === "minimize") Game.PC.minimizeWindow(winId0);
          else if (action0 === "maximize") {
            var wchk = Game.PC.getWindowById ? Game.PC.getWindowById(winId0) : null;
            if (wchk && String(wchk.appId || "").indexOf("download:") === 0) {
              UI.renderPC();
              return;
            }
            var d0 = document.getElementById("pc-desktop");
            var r0 = d0 ? d0.getBoundingClientRect() : null;
            var maxW0 = r0 ? Math.max(280, r0.width - 20) : 1400;
            var maxH0 = r0 ? Math.max(240, r0.height - 70) : 900;
            if (Game.PC.toggleMaximizeWindow) Game.PC.toggleMaximizeWindow(winId0, { w: maxW0, h: maxH0 });
          }
          UI.renderPC();
        }
        return;
      }

      // Taskbar window buttons.
      var taskBtn = e.target && e.target.closest ? e.target.closest(".pc-taskbar-window-btn") : null;
      if (taskBtn) {
        var wid = parseInt(taskBtn.getAttribute("data-win-id"), 10);
        if (isFinite(wid)) {
          var w0 = Game.PC.getWindowById ? Game.PC.getWindowById(wid) : null;
          if (w0 && w0.minimized) Game.PC.focusWindow(wid);
          else if (Game.state.pc && Game.state.pc.activeWindowId === wid) Game.PC.minimizeWindow(wid);
          else Game.PC.focusWindow(wid);
          UI.renderPC();
        }
        return;
      }

      // Taskbar pinned app buttons.
      var pinBtn = e.target && e.target.closest ? e.target.closest(".pc-taskbar-pin-btn") : null;
      if (pinBtn) {
        var pid0 = pinBtn.getAttribute("data-pin-app");
        if (pid0) UI._pcOpenFromDesktop(pid0);
        return;
      }

      // Start menu actions.
      var startOpen = e.target && e.target.closest ? e.target.closest("[data-start-open]") : null;
      if (startOpen) {
        var sid = startOpen.getAttribute("data-start-open");
        if (sid) {
          Game.state.pc.uiStartMenuOpen = false;
          UI._pcOpenFromDesktop(sid);
        }
        return;
      }
      var deskToggle = e.target && e.target.closest ? e.target.closest("[data-start-desktop-toggle]") : null;
      if (deskToggle) {
        var did = deskToggle.getAttribute("data-start-desktop-toggle");
        if (did && Game.PC) {
          if (Game.PC.isOnDesktop && Game.PC.isOnDesktop(did)) Game.PC.removeFromDesktop(did);
          else if (Game.PC.addToDesktop) Game.PC.addToDesktop(did);
          UI.renderPC();
        }
        return;
      }
      var pinToggle = e.target && e.target.closest ? e.target.closest("[data-start-pin-toggle]") : null;
      if (pinToggle) {
        var pid = pinToggle.getAttribute("data-start-pin-toggle");
        if (pid && Game.PC) {
          if (Game.PC.isPinned && Game.PC.isPinned(pid)) Game.PC.unpinApp(pid);
          else if (Game.PC.pinApp) Game.PC.pinApp(pid);
          UI.renderPC();
        }
        return;
      }

      // Downloads list buttons.
      var dlBtn = e.target && e.target.closest ? e.target.closest(".pc-download-btn") : null;
      if (dlBtn) {
        var dlId = dlBtn.getAttribute("data-download-id");
        if (dlId && Game.PC.openDownload) Game.PC.openDownload(dlId);
        UI.renderPC();
        return;
      }

      // Processes sidebar buttons.
      var procBtn = e.target && e.target.closest ? e.target.closest(".pc-proc-btn") : null;
      if (procBtn) {
        var app = procBtn.getAttribute("data-app");
        if (app) UI._pcOpenFromDesktop(app);
        return;
      }

      // Desktop icons: single-click does not open.
      var desktopIcon = e.target && e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
      if (desktopIcon) {
        if (UI._pcSuppressNextIconClick) {
          UI._pcSuppressNextIconClick = false;
          return;
        }
        var appId0 = desktopIcon.getAttribute("data-open-app");
        var fileId0 = desktopIcon.getAttribute("data-open-file");
        var kind0 = appId0 ? "app" : (fileId0 ? "file" : "");
        var key0 = kind0 === "app" ? appId0 : (kind0 === "file" ? ("file:" + fileId0) : "");
        if (!kind0) return;
        // Fallback double-click detection (some browsers are flaky with dblclick on buttons).
        var now0 = Date.now ? Date.now() : (new Date().getTime());
        var prev0 = UI._pcLastDesktopIconClick || null;
        var thresholdMs0 = 420;
        if (prev0 && prev0.key === key0 && (now0 - (prev0.ts || 0)) <= thresholdMs0) {
          if (prev0.timer) { try { clearTimeout(prev0.timer); } catch (e2) {} }
          UI._pcLastDesktopIconClick = null;
          e.preventDefault();
          e.stopPropagation();
          if (kind0 === "app") UI._pcOpenFromDesktop(appId0);
          else UI._pcOpenFileFromDesktop(fileId0);
        } else {
          var t = null;
          try { t = setTimeout(function () { if (UI._pcLastDesktopIconClick && UI._pcLastDesktopIconClick.key === key0) UI._pcLastDesktopIconClick = null; }, thresholdMs0 + 30); } catch (e2) {}
          UI._pcLastDesktopIconClick = { key: key0, ts: now0, timer: t };
        }
        return;
      }

      // Any other [data-open-app] (dashboard shortcuts, etc) opens on single click.
      var openBtn = e.target && e.target.closest ? e.target.closest("[data-open-app]") : null;
      if (openBtn) {
        var id = openBtn.getAttribute("data-open-app");
        if (id) {
          e.preventDefault();
          e.stopPropagation();
          UI._pcOpenFromDesktop(id);
        }
      }
    }, true);

    document.addEventListener("dblclick", function (e) {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      if (!withinPcOverlay(e.target)) return;
      var icon = e.target && e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
      if (!icon) return;
      var appId = icon.getAttribute("data-open-app");
      var fileId = icon.getAttribute("data-open-file");
      if (appId || fileId) {
        e.preventDefault();
        e.stopPropagation();
        if (appId) UI._pcOpenFromDesktop(appId);
        else UI._pcOpenFileFromDesktop(fileId);
      }
    }, true);

    document.addEventListener("contextmenu", function (e) {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      if (!withinPcOverlay(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      var target = e.target;
      var taskBtn = target && target.closest ? target.closest(".pc-taskbar-window-btn") : null;
      var pinBtn = target && target.closest ? target.closest(".pc-taskbar-pin-btn") : null;
      var frame = target && target.closest ? target.closest(".pc-window-frame") : null;
      var desktop = document.getElementById("pc-desktop");
      var onDesktop = desktop && desktop.contains(target);
      var taskbar = target && target.closest ? target.closest("#pc-taskbar") : null;

      if (frame) { UI._hidePcContextMenu(); return; }
      if (!taskbar && !onDesktop) { UI._hidePcContextMenu(); return; }

      // Hover check: if we're over windows layer, probe what's under the cursor for desktop icons.
      var icon = target && target.closest ? target.closest(".pc-desktop-icon") : null;
      if (!icon && e && typeof e.clientX === "number" && typeof e.clientY === "number" && isFinite(e.clientX) && isFinite(e.clientY)) {
        var under = hitTestUnderPcWindows(e.clientX, e.clientY);
        icon = under && under.closest ? under.closest(".pc-desktop-icon") : null;
      }

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
    }, true);

    document.addEventListener("mousedown", function (e) {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      if (!withinPcOverlay(e.target)) return;

      // Icon drag start (left button).
      var icon = e.target && e.target.closest ? e.target.closest(".pc-desktop-icon") : null;
      if (icon && e.button === 0) {
        var appId = icon.getAttribute("data-open-app");
        var fileId = icon.getAttribute("data-open-file");
        var iconKey = appId ? String(appId) : (fileId ? ("file:" + String(fileId)) : "");
        if (!iconKey) return;
        var desktop = document.getElementById("pc-desktop");
        var rect = desktop ? desktop.getBoundingClientRect() : null;
        var startLeft = parseFloat(icon.style.left || "0");
        var startTop = parseFloat(icon.style.top || "0");
        UI._pcIconDragState = {
          iconKey: iconKey,
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

      var titlebar = e.target && e.target.closest ? e.target.closest(".pc-window-titlebar") : null;
      var resizer = e.target && e.target.closest ? e.target.closest(".pc-window-resize") : null;
      if (!titlebar && !resizer) return;

      var frame = e.target && e.target.closest ? e.target.closest(".pc-window-frame") : null;
      if (!frame) return;
      var winId = parseInt(frame.getAttribute("data-win-id"), 10);
      if (!isFinite(winId) || !Game.PC || !Game.PC.getWindowById) return;

      UI._pcIconDragState = null;
      Game.PC.focusWindow(winId);
      var w = Game.PC.getWindowById(winId);
      if (!w) return;

      e.preventDefault();
      e.stopPropagation();

      if (resizer) {
        if (w.maximized) return;
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
      if (w.maximized && Game.PC.toggleMaximizeWindow) {
        Game.PC.toggleMaximizeWindow(winId);
        w = Game.PC.getWindowById(winId) || w;
      }
      UI._pcDragState = {
        mode: "drag",
        winId: winId,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: w.x || 0,
        startTop: w.y || 0
      };
    }, true);

    window.addEventListener("mousemove", function (e) {
      // Desktop icon drag.
      var ids = UI._pcIconDragState;
      if (ids && ids.el && Game && Game.state && Game.state.pc && Game.state.pc.desktop && Game.state.pc.desktop.icons) {
        if (typeof e.buttons === "number" && e.buttons === 0) {
          try { if (ids.ghostEl && ids.ghostEl.parentNode) ids.ghostEl.parentNode.removeChild(ids.ghostEl); } catch (e2) {}
          UI._pcIconDragState = null;
        } else {
          var moved = Math.abs(e.clientX - ids.startX) + Math.abs(e.clientY - ids.startY);
          if (!ids.dragging) {
            if (moved > 6) {
              ids.dragging = true;
              UI._pcSuppressNextIconClick = true;
            }
          }

          if (ids.dragging) {
            var desktop = document.getElementById("pc-desktop");
            var rect = desktop ? desktop.getBoundingClientRect() : ids.desktopRect;
            var nx = ids.startLeft + (e.clientX - ids.startX);
            var ny = ids.startTop + (e.clientY - ids.startY);

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

      // Window drag/resize.
      var ds = UI._pcDragState;
      if (!ds || !Game || !Game.PC || !Game.PC.getWindowById) return;
      var w = Game.PC.getWindowById(ds.winId);
      if (!w) return;
      var frame = document.querySelector('.pc-window-frame[data-win-id="' + ds.winId + '"]');
      if (!frame) return;
      var d = document.getElementById("pc-desktop");
      var rect2 = d ? d.getBoundingClientRect() : null;
      var maxW = rect2 ? Math.max(280, rect2.width - 20) : 1400;
      var maxH = rect2 ? Math.max(240, rect2.height - 70) : 900;

      if (ds.mode === "drag") {
        var wx = ds.startLeft + (e.clientX - ds.startX);
        var wy = ds.startTop + (e.clientY - ds.startY);
        if (rect2) {
          wx = Math.max(0, Math.min(wx, rect2.width - Math.max(260, w.w || 260)));
          wy = Math.max(0, Math.min(wy, rect2.height - 60 - Math.max(180, w.h || 180)));
        }
        w.x = wx;
        w.y = wy;
        frame.style.left = Math.round(wx) + "px";
        frame.style.top = Math.round(wy) + "px";
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
          Game.state.pc.desktop.icons[ids.iconKey] = { x: finalX, y: finalY };
        }
        try { if (ids.ghostEl && ids.ghostEl.parentNode) ids.ghostEl.parentNode.removeChild(ids.ghostEl); } catch (e2) {}
        UI._pcIconDragState = null;
      }
      UI._pcDragState = null;
    });

    // Overlay-specific controls (close button, clicking outside).
    document.addEventListener("click", function (e) {
      if (!Game || !Game.state || !Game.state.pc || !Game.state.pc.isOpen) return;
      var overlay = document.getElementById("pc-overlay");
      if (!overlay || !overlay.contains(e.target)) return;

      var closeBtn = document.getElementById("btn-pc-close");
      if (closeBtn && closeBtn.contains(e.target)) {
        Game.state.pc.isOpen = false;
        UI.renderPC();
        return;
      }
      if (e.target && e.target.id === "pc-overlay") {
        Game.state.pc.isOpen = false;
        UI.renderPC();
      }
    }, true);
  };
})();
