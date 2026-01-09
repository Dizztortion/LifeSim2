(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    ensureDesktopNotificationsPref: function () {
      try {
        if (!window.Game || !Game.state) return;
        if (!Game.state.desktopNotifications || typeof Game.state.desktopNotifications !== "object") {
          Game.state.desktopNotifications = { prompted: false, enabled: false };
        }
        if (typeof Game.state.desktopNotifications.prompted !== "boolean") Game.state.desktopNotifications.prompted = false;
        if (typeof Game.state.desktopNotifications.enabled !== "boolean") Game.state.desktopNotifications.enabled = false;
      } catch (e) {}
    },
    ensureMusicState: function () {
      try {
        if (!window.Game || !Game.state) return;
        if (!Game.state.music || typeof Game.state.music !== "object") {
          Game.state.music = { enabled: true, trackIndex: 0, volume: 0.25 };
        }
        var m = Game.state.music;
        if (typeof m.enabled !== "boolean") m.enabled = false;
        if (typeof m.trackIndex !== "number" || !isFinite(m.trackIndex) || m.trackIndex < 0) m.trackIndex = 0;
        if (typeof m.volume !== "number" || !isFinite(m.volume)) m.volume = 0.25;
        if (m.volume < 0) m.volume = 0;
        if (m.volume > 1) m.volume = 1;
      } catch (e) {}
    },
    getMusicTracks: function () {
      var tracks = [];
      for (var i = 1; i <= 12; i++) {
        tracks.push({
          id: "music" + i,
          name: "Music " + i,
          file: "assets/audio/music" + i + ".mp3"
        });
      }
      return tracks;
    },
    initMusicPlayer: function () {
      try {
        UI.ensureMusicState();
        if (UI._musicAudio) return;
        UI._musicAudio = new Audio();
        UI._musicAudio.preload = "metadata";
        UI._musicAudio.loop = false;
        UI._musicAudio.volume = (Game.state.music && typeof Game.state.music.volume === "number") ? Game.state.music.volume : 0.25;
        UI._musicAudio.addEventListener("ended", function () {
          try {
            UI.ensureMusicState();
            if (!Game.state.music.enabled) return;
            UI.nextMusicTrack(true);
          } catch (e) {}
        });
        UI._musicAudio.addEventListener("play", function () { UI.updateMusicWidget(); });
        UI._musicAudio.addEventListener("pause", function () { UI.updateMusicWidget(); });
        UI._musicAudio.addEventListener("loadedmetadata", function () { UI.updateMusicWidget(); });
  
        UI.setMusicTrack(Game.state.music.trackIndex, { autoplay: false });
        UI.updateMusicWidget();
      } catch (e) {}
    },
    setMusicTrack: function (trackIndex, opts) {
      try {
        UI.ensureMusicState();
        var o = opts || {};
        var tracks = UI.getMusicTracks();
        if (!tracks.length) return;
        var idx = typeof trackIndex === "number" ? Math.floor(trackIndex) : 0;
        if (!isFinite(idx)) idx = 0;
        idx = ((idx % tracks.length) + tracks.length) % tracks.length;
        Game.state.music.trackIndex = idx;
        var def = tracks[idx];
        if (!UI._musicAudio) UI.initMusicPlayer();
        if (!UI._musicAudio) return;
        var newSrc = def.file;
        if (UI._musicAudio.src && UI._musicAudio.src.indexOf(newSrc) !== -1) {
          UI.updateMusicWidget();
          return;
        }
        UI._musicAudio.src = newSrc;
        UI._musicAudio.load();
        UI.updateMusicWidget();
        if (o.autoplay) {
          UI.playMusic();
        }
      } catch (e) {}
    },
    playMusic: function () {
      try {
        UI.ensureMusicState();
        if (!UI._musicAudio) UI.initMusicPlayer();
        if (!UI._musicAudio) return;
        UI._musicAudio.volume = Game.state.music.volume;
        var p = UI._musicAudio.play();
        if (p && typeof p.catch === "function") {
          p.catch(function () {
            // Ignore: autoplay/permission errors are browser-dependent.
          });
        }
      } catch (e) {}
    },
    pauseMusic: function () {
      try {
        if (UI._musicAudio) UI._musicAudio.pause();
      } catch (e) {}
    },
    toggleMusic: function () {
      try {
        UI.ensureMusicState();
        if (!UI._musicAudio) UI.initMusicPlayer();
        if (!UI._musicAudio) return;
        var willEnable = !Game.state.music.enabled;
        Game.state.music.enabled = willEnable;
        if (willEnable) {
          UI.playMusic();
        } else {
          UI.pauseMusic();
        }
        UI.updateMusicWidget();
      } catch (e) {}
    },
    nextMusicTrack: function (autoplay) {
      try {
        UI.ensureMusicState();
        var tracks = UI.getMusicTracks();
        if (!tracks.length) return;
        var idx = (Game.state.music.trackIndex || 0) + 1;
        UI.setMusicTrack(idx, { autoplay: !!autoplay });
      } catch (e) {}
    },
    updateMusicWidget: function () {
      try {
        var textEl = document.getElementById("music-track-text");
        var marqueeEl = document.getElementById("music-track-marquee");
        var btn = document.getElementById("btn-music-toggle");
        if (!textEl && !btn && !marqueeEl) return;
        UI.ensureMusicState();
        var tracks = UI.getMusicTracks();
        var idx = Game.state.music.trackIndex || 0;
        if (idx < 0) idx = 0;
        if (idx >= tracks.length) idx = 0;
        var def = tracks[idx] || { name: "Music" };
        var playing = !!(UI._musicAudio && !UI._musicAudio.paused && !UI._musicAudio.ended);
        var enabled = !!Game.state.music.enabled;
  
        if (textEl) {
          textEl.textContent = def.name + (enabled ? "" : " (Off)");
        }
        if (btn) {
          btn.textContent = (enabled && playing) ? "âšâš" : "â–¶";
          btn.setAttribute("aria-pressed", (enabled && playing) ? "true" : "false");
          btn.title = "Music: " + (enabled ? (playing ? "Pause" : "Play") : "Off") + " â€¢ Click to toggle â€¢ Shift+Click to next track";
        }
        if (marqueeEl) {
          marqueeEl.classList.toggle("is-paused", !(enabled && playing));
        }
      } catch (e) {}
    },
    openDesktopNotificationsModal: function (opts) {
      try {
        UI.ensureDesktopNotificationsPref();
        var o = opts || {};
        var onDone = (typeof o.onDone === "function") ? o.onDone : null;
  
        if (typeof Notification === "undefined" || typeof Notification.requestPermission !== "function") {
          UI.openInfoModal({
            title: "Desktop notifications unavailable",
            sub: "This browser does not support Notification permissions",
            bodyHtml: '<div class="modal-card-body"><div class="card-section small dim">You can still use in-app toast notifications.</div></div>',
            onClose: function () { if (onDone) onDone(); }
          });
          return;
        }
  
        if (Notification.permission === "denied") {
          Game.state.desktopNotifications.enabled = false;
          Game.state.desktopNotifications.prompted = true;
          UI.openInfoModal({
            title: "Desktop notifications blocked",
            sub: "Browser permission is denied",
            bodyHtml: '<div class="modal-card-body"><div class="card-section small dim">To enable desktop notifications, change the site permission in your browser settings.</div></div>',
            onClose: function () { if (onDone) onDone(); }
          });
          return;
        }
  
        if (Notification.permission === "granted") {
          // Permission is already granted; just enable the in-game preference.
          Game.state.desktopNotifications.prompted = true;
          Game.state.desktopNotifications.enabled = true;
          Game.addNotification("Desktop notifications enabled.");
          if (onDone) onDone();
          return;
        }
  
        UI.openModalCard({
          title: "Enable desktop notifications?",
          sub: "Send in-game events to Windows notifications",
          bodyHtml:
            '<div class="modal-card-body">' +
            '<div class="card-section small dim">When enabled, every in-game notification will also appear as a desktop notification. You can deny this and keep in-app toasts only.</div>' +
            "</div>",
          actions: [
            { id: "cancel", label: "Cancel", primary: false },
            { id: "enable", label: "Enable", primary: true }
          ],
          onAction: function (actionId, close) {
            if (actionId === "cancel") {
              close();
              return;
            }
            if (actionId !== "enable") return;
  
            function onResult(result) {
              var r = String(result || "");
              Game.state.desktopNotifications.prompted = true;
              Game.state.desktopNotifications.enabled = (r === "granted");
              if (r === "granted") {
                Game.addNotification("Desktop notifications enabled.");
              } else if (r === "denied") {
                Game.addNotification("Desktop notifications blocked by browser permission.");
              } else {
                Game.addNotification("Desktop notification permission not granted.");
              }
              close();
            }
  
            try {
              var maybePromise = Notification.requestPermission();
              if (maybePromise && typeof maybePromise.then === "function") {
                maybePromise.then(onResult).catch(function () { onResult(Notification.permission); });
              } else {
                // Older callback-style API
                Notification.requestPermission(function (res) { onResult(res); });
              }
            } catch (e) {
              onResult(Notification.permission);
            }
          },
          onClose: function () { if (onDone) onDone(); }
        });
      } catch (e) {
        // Ignore: desktop notifications are optional and browser-dependent.
      }
    },
    promptDesktopNotificationsIfNeeded: function () {
      try {
        if (typeof Notification === "undefined" || typeof Notification.requestPermission !== "function") return;
        if (!window.Game || !Game.state) return;
        if (!Game.state.desktopNotifications || typeof Game.state.desktopNotifications !== "object") {
          Game.state.desktopNotifications = { prompted: false, enabled: false };
        }
  
        if (Notification.permission === "denied") {
          Game.state.desktopNotifications.enabled = false;
          Game.state.desktopNotifications.prompted = true;
          return;
        }
        if (Notification.permission === "granted") {
          // Permission is already decided. Respect the user's saved preference.
          Game.state.desktopNotifications.prompted = true;
          return;
        }
  
        // Permission is still "default" - ask once unless we still need permission for an enabled preference.
        var shouldPrompt = !Game.state.desktopNotifications.prompted || !!Game.state.desktopNotifications.enabled;
        if (!shouldPrompt) return;
        if (Notification.permission !== "default") return;
  
        UI.openModalCard({
          title: "Enable desktop notifications?",
          sub: "Send in-game events to Windows notifications",
          noClose: true,
          bodyHtml:
            '<div class="modal-card-body">' +
            '<div class="card-section small dim">When enabled, every in-game notification will also appear as a desktop notification. You can deny this and keep in-app toasts only.</div>' +
            "</div>",
          actions: [
            { id: "skip", label: "Not now", primary: false },
            { id: "enable", label: "Enable", primary: true }
          ],
          onAction: function (actionId, close) {
            if (actionId === "skip") {
              Game.state.desktopNotifications.prompted = true;
              Game.state.desktopNotifications.enabled = false;
              close();
              return;
            }
            if (actionId !== "enable") return;
  
            function onResult(result) {
              var r = String(result || "");
              Game.state.desktopNotifications.prompted = true;
              Game.state.desktopNotifications.enabled = (r === "granted");
              if (r === "granted") {
                Game.addNotification("Desktop notifications enabled.");
              } else if (r === "denied") {
                Game.addNotification("Desktop notifications blocked by browser permission.");
              } else {
                Game.addNotification("Desktop notification permission not granted.");
              }
              close();
            }
  
            try {
              var maybePromise = Notification.requestPermission();
              if (maybePromise && typeof maybePromise.then === "function") {
                maybePromise.then(onResult).catch(function () { onResult(Notification.permission); });
              } else {
                // Older callback-style API
                Notification.requestPermission(function (res) { onResult(res); });
              }
            } catch (e) {
              onResult(Notification.permission);
            }
          }
        });
      } catch (e) {
        // Ignore: desktop notifications are optional and browser-dependent.
      }
    },
  });
})();
