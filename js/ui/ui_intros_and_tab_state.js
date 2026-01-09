(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    ensureIntroState: function () {
      if (!Game || !Game.state) return {};
      if (!Game.state.ui || typeof Game.state.ui !== "object") Game.state.ui = {};
      if (!Game.state.ui.introSeen || typeof Game.state.ui.introSeen !== "object") Game.state.ui.introSeen = {};
  
      // Back-compat: `introDisabled` historically disabled both tab intros and info-only modals.
      if (typeof Game.state.ui.introDisabled === "boolean") {
        if (typeof Game.state.ui.showTabIntros !== "boolean") Game.state.ui.showTabIntros = !Game.state.ui.introDisabled;
        if (typeof Game.state.ui.showInfoModals !== "boolean") Game.state.ui.showInfoModals = !Game.state.ui.introDisabled;
      }
  
      if (typeof Game.state.ui.showTabIntros !== "boolean") Game.state.ui.showTabIntros = true;
      if (typeof Game.state.ui.showInfoModals !== "boolean") Game.state.ui.showInfoModals = true;
      if (typeof Game.state.ui.introDisabled !== "boolean") Game.state.ui.introDisabled = false;
      if (typeof Game.state.ui.onboardingSeen !== "boolean") Game.state.ui.onboardingSeen = false;
      return Game.state.ui.introSeen;
    },
    isLikelyNewSave: function () {
      try {
        if (!Game || !Game.state) return false;
        var s = Game.state;
        if ((typeof s.day === "number" && s.day > 1) || (typeof s.money === "number" && s.money > 75)) return false;
        if (s.job && typeof s.job.current === "string" && s.job.current !== "none") return false;
        if (s.education && typeof s.education.level === "number" && s.education.level > 0) return false;
        if (Array.isArray(s.properties) && s.properties.length) return false;
        if (s.btc && s.btc.mining && typeof s.btc.mining.rigsOwned === "number" && s.btc.mining.rigsOwned > 0) return false;
        if (s.companies) {
          var c = s.companies;
          if ((c.railLogistics && c.railLogistics.unlocked) || (c.miningCorp && c.miningCorp.unlocked) || (c.retailShop && c.retailShop.unlocked)) {
            return false;
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    shouldSuppressTabIntros: function () {
      return !!(Game && Game.state && Game.state.ui && Game.state.ui.showTabIntros === false);
    },
    shouldSuppressInfoModals: function () {
      return !!(Game && Game.state && Game.state.ui && Game.state.ui.showInfoModals === false);
    },
    openHelpModal: function (opts) {
      if (!UI.openModalCard) return null;
      if (!Game || !Game.state) return null;
      UI.ensureIntroState();
      var o = opts || {};
      var onboarding = !!o.onboarding;
      var ui = Game.state.ui || {};
  
      var showTabIntros = ui.showTabIntros !== false;
      var showInfoModals = ui.showInfoModals !== false;
  
      var body = [];
      body.push('<div class="modal-card-body">');
      body.push('<div class="card-section small dim">LifeSim is a slow-paced simulation. Build stability through education, jobs, property, companies, and BTC infrastructure.</div>');
      body.push('<div class="card-section small">Youâ€™ll occasionally see short â€œpage introâ€ modals the first time you open a tab. You can turn these on/off anytime.</div>');
      body.push('<div class="card-section">');
      body.push('<div class="field-row"><span>Page intro modals</span><span><label class="small"><input type="checkbox" id="help-toggle-tab-intros"' + (showTabIntros ? " checked" : "") + '> Show tab intros on first visit</label></span></div>');
      body.push('<div class="field-row mt-8"><span>Informational modals</span><span><label class="small"><input type="checkbox" id="help-toggle-info-modals"' + (showInfoModals ? " checked" : "") + '> Show informational modals (no input)</label></span></div>');
      body.push('<div class="small dim mt-8">Tip: Use the <span class="mono">Help</span> button in the top bar to change these from any page.</div>');
      body.push("</div>");
      body.push("</div>");
  
      return UI.openModalCard({
        title: onboarding ? "Welcome to LifeSim" : "Help & Guide",
        sub: onboarding ? "Quick overview + help toggles" : "Overview + help toggles",
        large: true,
        noClose: onboarding,
        bodyHtml: body.join(""),
        actions: onboarding
          ? [{ id: "start", label: "Start Playing", primary: true }]
          : [{ id: "close", label: "Close", primary: true }],
        onAction: function (actionId, close, overlay) {
          try {
            if (overlay && Game && Game.state) {
              UI.ensureIntroState();
              var chkTabs = overlay.querySelector("#help-toggle-tab-intros");
              var chkInfo = overlay.querySelector("#help-toggle-info-modals");
              if (chkTabs) Game.state.ui.showTabIntros = !!chkTabs.checked;
              if (chkInfo) Game.state.ui.showInfoModals = !!chkInfo.checked;
              // Back-compat field: treat as "disable all help-style modals".
              Game.state.ui.introDisabled = !(Game.state.ui.showTabIntros && Game.state.ui.showInfoModals);
            }
          } catch (e) {}
          if (onboarding && Game && Game.state && Game.state.ui) {
            Game.state.ui.onboardingSeen = true;
          }
          if (Game && Game.save) Game.save(true);
          close();
        },
        onClose: function () {
          if (onboarding) UI._suppressTabIntroOnce = false;
        }
      });
    },
    maybeShowWelcomeModal: function () {
      try {
        if (!Game || !Game.state) return;
        UI.ensureIntroState();
        if (!UI.isLikelyNewSave()) {
          // Avoid interrupting established saves that predate this onboarding.
          Game.state.ui.onboardingSeen = true;
          UI._suppressTabIntroOnce = false;
          if (Game && Game.save) Game.save(true);
          return;
        }
        if (Game.state.ui.onboardingSeen) {
          UI._suppressTabIntroOnce = false;
          if (Game && Game.save) Game.save(true);
          return;
        }
        if (UI.shouldSuppressInfoModals()) {
          UI._suppressTabIntroOnce = false;
          return;
        }
        UI.openHelpModal({ onboarding: true });
      } catch (e) {}
    },
    openInfoModal: function (opts) {
      if (UI.shouldSuppressInfoModals()) return null;
      if (!opts) return null;
      if (!opts.actions) {
        opts.actions = [{ id: "ok", label: "OK", primary: true }];
      }
      if (!opts.onAction) {
        opts.onAction = function (actionId, close) { close(); };
      }
      return UI.openModalCard(opts);
    },
    maybeShowTabIntro: function (id) {
      if (!id || !UI.openModalCard) return;
      var seen = UI.ensureIntroState();
      if (UI._suppressTabIntroOnce) return;
      if (UI.shouldSuppressTabIntros()) return;
      if (seen[id]) return;
      var def = UI._tabIntroDefs ? UI._tabIntroDefs[id] : null;
      if (!def) return;
      seen[id] = true;
      UI.openModalCard({
        title: def.title || "Welcome",
        sub: def.sub || "",
        bodyHtml: (def.bodyHtml || "") +
          '<div class="card-section small"><label><input type="checkbox" id="intro-disable-tabs"> Don\'t show tab intro modals again</label></div>',
        actions: [{ id: "ok", label: "Continue", primary: true }],
        onAction: function (actionId, close, overlay) {
          var chk = overlay ? overlay.querySelector("#intro-disable-tabs") : null;
          if (chk && chk.checked && Game && Game.state && Game.state.ui) {
            Game.state.ui.showTabIntros = false;
            Game.state.ui.introDisabled = !(Game.state.ui.showTabIntros && Game.state.ui.showInfoModals);
          }
          if (Game && Game.save) Game.save(true);
          close();
        }
      });
    },
    getTabDisabledReason: function (id) {
      if (id === "bank") {
        var loc = (Game && Game.state && typeof Game.state.travelLocation === "string") ? Game.state.travelLocation : "";
        if (loc !== "City Centre") return "Travel to the City Centre to access the bank.";
      }
      return "";
    },
    updateTabDisabledStates: function () {
      try {
        var buttons = document.querySelectorAll(".sidebar .tab-btn[data-tab]");
        for (var i = 0; i < buttons.length; i++) {
          var btn = buttons[i];
          if (!btn) continue;
          var id = btn.getAttribute("data-tab");
          if (!id) continue;
          var disabledReason = UI.getTabDisabledReason(id);
          var disabled = !!(disabledReason && disabledReason.length);
          if (disabled) {
            btn.classList.add("disabled");
            btn.disabled = true;
            btn.setAttribute("title", String(disabledReason));
          } else {
            btn.classList.remove("disabled");
            btn.disabled = false;
            btn.removeAttribute("title");
          }
        }
      } catch (e) {}
    },
    getLockedTabInfo: function (id) {
      if (id !== "companies") return null;
      if (Game.Companies && typeof Game.Companies.ensureState === "function") {
        Game.Companies.ensureState();
      }
      var c = Game.state && Game.state.companies ? Game.state.companies : null;
      if (!c) return null;
      var unlocked = false;
      for (var key in c) {
        if (!Object.prototype.hasOwnProperty.call(c, key)) continue;
        if (c[key] && c[key].unlocked) { unlocked = true; break; }
      }
      if (unlocked) return null;
      return {
        title: "Companies locked",
        sub: "Unlock your first business",
        bodyHtml: '<div class="card-section small dim">Companies unlock as your education and skills rise. Reach one of these to get started:</div>' +
          '<div class="card-section small">' +
          '<div>Mining Corp: Education L1</div>' +
          '<div>Rail Logistics: Education L2 + Train skill 20</div>' +
          '<div>Retail Shop: Business skill 10</div>' +
          '<div>Internet Cafe: Business skill 5</div>' +
          '<div>Courier Co: Education L1 + Business skill 15</div>' +
          '<div>Recycling Co: Education L1 + Tech skill 15</div>' +
          '</div>'
      };
    },
  });
})();
