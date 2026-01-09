(function () {
  window.UI = window.UI || {};
  var UI = window.UI;
  Object.assign(UI, {
    openModalCard: function (opts) {
      if (!opts) return null;
      var title = opts.title || "";
      var sub = opts.sub || "";
      var bodyHtml = opts.bodyHtml || "";
      var actions = Array.isArray(opts.actions) ? opts.actions : [];
      var large = !!opts.large;
      var noClose = !!opts.noClose;
      var headerButtons = Array.isArray(opts.headerButtons) ? opts.headerButtons : [];
      var overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      var html = [];
      html.push('<div class="modal-card' + (large ? " modal-large" : "") + '">');
      html.push('<div class="modal-header-row">');
      html.push('<div>');
      html.push('<div class="modal-card-title">' + title + "</div>");
      if (sub) html.push('<div class="modal-card-sub small dim">' + sub + "</div>");
      html.push("</div>");
      if (headerButtons.length) {
        html.push('<div class="modal-header-actions">');
        for (var hb = 0; hb < headerButtons.length; hb++) {
          var b = headerButtons[hb];
          if (!b) continue;
          html.push('<button class="btn btn-small btn-outline" data-modal-header-action="' + b.id + '">' + b.label + "</button>");
        }
        html.push("</div>");
      }
      if (!noClose) {
        html.push('<button class="modal-close" id="modal-close-btn">Close</button>');
      }
      html.push("</div>");
      html.push(bodyHtml);
      if (actions.length) {
        html.push('<div class="modal-actions">');
        for (var i = 0; i < actions.length; i++) {
          var a = actions[i];
          var cls = "btn btn-small " + (a.primary ? "btn-primary" : "btn-outline");
          html.push('<button class="' + cls + '" data-modal-action="' + a.id + '">' + a.label + "</button>");
        }
        html.push("</div>");
      }
      html.push("</div>");
      overlay.innerHTML = html.join("");
      document.body.appendChild(overlay);
      var didClose = false;
      function close() {
        if (didClose) return;
        didClose = true;
        if (opts.onClose) {
          try { opts.onClose(); } catch (e) {}
        }
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }
      overlay._closeModal = close;
      overlay.addEventListener("click", function (e) {
        if (!noClose && e.target === overlay) close();
      });
      var closeBtn = overlay.querySelector("#modal-close-btn");
      if (closeBtn) closeBtn.addEventListener("click", close);
      if (opts.onHeaderAction) {
        overlay.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-modal-header-action]");
          if (!btn) return;
          var actionId = btn.getAttribute("data-modal-header-action");
          opts.onHeaderAction(actionId, close, overlay);
        });
      }
      if (opts.onAction) {
        overlay.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-modal-action]");
          if (!btn) return;
          var actionId = btn.getAttribute("data-modal-action");
          opts.onAction(actionId, close, overlay);
        });
      }
      return overlay;
    },
    confirmModal: function (opts) {
      if (!opts) return;
      var title = opts.title || "Confirm";
      var sub = opts.sub || "";
      var body = opts.bodyHtml || "";
      UI.openModalCard({
        title: title,
        sub: sub,
        bodyHtml: body,
        actions: [
          { id: "cancel", label: "Cancel", primary: false },
          { id: "confirm", label: opts.confirmLabel || "Confirm", primary: true }
        ],
        large: !!opts.large,
        onAction: function (actionId, close) {
          if (actionId === "cancel") {
            close();
            return;
          }
          if (actionId === "confirm") {
            if (opts.onConfirm) opts.onConfirm();
            close();
          }
        }
      });
    },
  });
})();
