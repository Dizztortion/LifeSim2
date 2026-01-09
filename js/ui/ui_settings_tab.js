(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    renderSettingsTab: function () {
      if (Game && Game.Redeem && Game.Redeem.ensure) Game.Redeem.ensure();
      UI.ensureIntroState();
      var s = Game.state || {};
      var redeemed = Array.isArray(s.redeemedCodes) ? s.redeemedCodes : [];
      var msgText = (typeof UI._settingsMsg === "string" && UI._settingsMsg.length) ? UI._settingsMsg : " ";
      var toastDurationValue = UI.getNotificationToastSeconds();
      var debugUnlocked = !!(s.debug && s.debug.unlocked);
      var dbgTick = (s.debug && typeof s.debug.tickRateMult === "number" && isFinite(s.debug.tickRateMult)) ? s.debug.tickRateMult : 1;
      var dbgMine = (s.debug && typeof s.debug.btcMiningMultiplier === "number" && isFinite(s.debug.btcMiningMultiplier)) ? s.debug.btcMiningMultiplier : 1;
      var html = [];
      html.push('<div>');
      html.push('<div class="flex-between">');
      html.push('<div>');
      html.push('<div class="section-title">Settings</div>');
      html.push('<div class="section-subtitle">Redeem codes and manage your save.</div>');
      html.push('</div>');
      html.push('<div><button class="btn btn-small btn-outline" id="btn-settings-back">Back</button></div>');
      html.push('</div>');
      html.push('<div class="grid mt-8">');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Redemption Codes</div>');
      html.push('<div class="card-section small dim">Enter a code exactly (case-insensitive). Codes can only be redeemed once per save.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Code</span><span class="mono"></span></div>');
      html.push('<div class="flex-row mt-4">');
      html.push('<input id="redeem-code-input" type="text" placeholder="ENTER CODE" style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;">');
      html.push('<button class="btn btn-small btn-primary" id="btn-redeem-code">Redeem</button>');
      html.push('</div>');
      html.push('<div id="redeem-msg" class="notice small ' + (UI._settingsMsgOk ? '' : 'dim ') + 'mt-8">' + msgText + '</div>');
      if (!redeemed.length) {
        html.push('<div class="small dim mt-8">No redeemed codes yet.</div>');
      } else {
        html.push('<div class="small dim mt-8">Redeemed:</div>');
        html.push('<div class="mono small">' + redeemed.map(function (c) { return String(c); }).join(", ") + '</div>');
      }
      html.push('</div>');
      html.push('</div>');
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Notifications</div>');
      html.push('<div class="card-section small dim">Floating toasts disappear after the configured duration.</div>');
      html.push('<div class="card-section">');
      html.push('<div class="field-row"><span>Toast duration</span><span class="mono"><input id="notification-toast-duration" type="number" min="1" max="60" step="1" value="' + toastDurationValue + '" style="width:70px;min-width:0;padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#f5f5f5;margin-right:6px;"> sec</span></div>');
      html.push('<div class="small dim mt-4">Set how long floating notifications stay on screen (1â€“60 seconds).</div>');
      var showTabIntros = !(s.ui && s.ui.showTabIntros === false);
      var showInfoModals = !(s.ui && s.ui.showInfoModals === false);
      html.push('<div class="field-row mt-8"><span>Help</span><span class="mono"></span></div>');
      html.push('<div class="small dim mt-4">These controls affect optional guidance popups.</div>');
      html.push('<div class="field-row mt-8"><span>Page intro modals</span><span><label class="small"><input type="checkbox" id="toggle-show-tab-intros"' + (showTabIntros ? " checked" : "") + '> Show tab intros on first visit</label></span></div>');
      html.push('<div class="field-row mt-8"><span>Informational modals</span><span><label class="small"><input type="checkbox" id="toggle-show-info-modals"' + (showInfoModals ? " checked" : "") + '> Show informational modals (no input)</label></span></div>');
  
      var dnSupported = (typeof Notification !== "undefined" && typeof Notification.requestPermission === "function");
      var dnPermission = dnSupported ? String(Notification.permission || "default") : "unsupported";
      var dnEnabled = !!(s.desktopNotifications && s.desktopNotifications.enabled);
      var dnBadgeClass = "badge-blue";
      var dnBadgeText = "Not enabled";
      var dnAction = "";
      var dnBtnLabel = "";
      var dnBtnDisabled = false;
      if (!dnSupported) {
        dnBadgeClass = "badge-red";
        dnBadgeText = "Unsupported";
        dnBtnDisabled = true;
        dnBtnLabel = "Unavailable";
      } else if (dnPermission === "denied") {
        dnBadgeClass = "badge-red";
        dnBadgeText = "Blocked";
        dnBtnDisabled = true;
        dnBtnLabel = "Blocked";
      } else if (dnPermission === "granted") {
        dnBadgeClass = "badge-green";
        dnBadgeText = "Allowed";
        dnAction = "toggle";
        dnBtnLabel = dnEnabled ? "Disable" : "Enable";
      } else {
        dnBadgeClass = "badge-blue";
        dnBadgeText = "Not enabled";
        dnAction = "request";
        dnBtnLabel = "Enable";
      }
      html.push('<div class="field-row mt-8"><span>Desktop notifications</span><span class="flex-row"><span class="badge ' + dnBadgeClass + '">' + dnBadgeText + '</span><button class="btn btn-small btn-outline" id="btn-desktop-notifications" data-action="' + dnAction + '"' + (dnBtnDisabled ? " disabled" : "") + ">" + dnBtnLabel + "</button></span></div>");
      if (dnSupported && dnPermission === "denied") {
        html.push('<div class="small dim mt-4">Browser permission is blocked. Change the site notification permission in your browser to enable.</div>');
      } else if (dnSupported && dnPermission === "granted" && !dnEnabled) {
        html.push('<div class="small dim mt-4">Permission is granted, but desktop notifications are currently disabled in-game.</div>');
      } else {
        html.push('<div class="small dim mt-4">When enabled, in-game notifications also appear as desktop notifications.</div>');
      }
      html.push('</div>');
      html.push('</div>');
  
      if (debugUnlocked) {
        html.push('<div class="card">');
        html.push('<div class="card-title">Debug</div>');
        html.push('<div class="card-section small dim">Unlocked via <span class="mono">DSOLVE</span>. Tick: <span class="mono">x' + dbgTick + '</span> â€¢ Mining: <span class="mono">x' + dbgMine + '</span></div>');
        html.push('<div class="card-section">');
        html.push('<button class="btn btn-small btn-outline" id="btn-open-debug-menu">Open Debug Menu</button>');
        html.push('</div>');
        html.push('</div>');
      }
  
      html.push('<div class="card">');
      html.push('<div class="card-title">Save & Reset</div>');
      html.push('<div class="card-section small dim">Manual save writes to localStorage. Reset deletes your local save and starts a new life.</div>');
      html.push('<div class="card-section">');
      html.push('<button class="btn btn-small btn-outline" id="btn-settings-save">Manual Save</button> ');
      html.push('<button class="btn btn-small btn-outline" id="btn-settings-reset">Reset Game</button>');
      html.push('</div>');
      html.push('</div>');
  
      html.push('</div>');
      html.push('</div>');
      return html.join('');
    },
  });
})();
