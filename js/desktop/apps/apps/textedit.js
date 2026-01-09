(function () {
  var UI = (window.UI = window.UI || {});
  if (!UI.PCApps || !UI.PCApps.register) return;
  UI.PCApps.register({ id: "textedit", title: "Text Editor", sub: "Notes", emoji: "📝", window: { w: 720, h: 560 } });

  UI.renderPCTextEditor = function (container, fileId) {
    if (!container) return;
    if (Game && Game.PCFiles && Game.PCFiles.ensureState) Game.PCFiles.ensureState();
    var f = (Game && Game.PCFiles && Game.PCFiles.getById) ? Game.PCFiles.getById(fileId) : null;
    var name = f ? (f.name || ("File " + f.id)) : "Untitled.text";
    var content = f ? String(f.content || "") : "";
    var ro = !!(f && f.readOnly);

    container.innerHTML =
      "<h2>Text Editor</h2>" +
      '<div class="card-section small dim">Plain text editor for <span class="mono">.text</span> files.</div>' +
      '<div class="card">' +
        '<div class="field-row"><span>File</span><span class="mono">' + String(name).replace(/\\"/g, "&quot;") + "</span></div>" +
        '<textarea id="pc-textedit-body" class="input" style="width:100%;min-height:260px;resize:vertical;" spellcheck="false"' + (ro ? " disabled" : "") + ">" + content.replace(/</g, "&lt;") + "</textarea>" +
        '<div class="mt-10 flex-between">' +
          '<div class="small dim">' + (ro ? "Read-only file." : "Edits save instantly.") + "</div>" +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
            '<button type="button" class="btn btn-small btn-outline" id="pc-textedit-new">New file</button>' +
            '<button type="button" class="btn btn-small btn-primary" id="pc-textedit-save"' + (ro ? " disabled" : "") + ">Save</button>" +
          "</div>" +
        "</div>" +
      "</div>";

    var textarea = container.querySelector("#pc-textedit-body");
    var saveBtn = container.querySelector("#pc-textedit-save");
    var newBtn = container.querySelector("#pc-textedit-new");

    function save() {
      if (!Game || !Game.PCFiles || !Game.PCFiles.updateTextFile) return;
      if (!f) return;
      if (ro) return;
      Game.PCFiles.updateTextFile(f.id, textarea ? String(textarea.value || "") : "");
      if (Game.addNotification) Game.addNotification("Saved " + (f.name || "file") + ".");
      if (UI.renderPC) UI.renderPC();
    }

    if (saveBtn) saveBtn.addEventListener("click", save);
    if (textarea && !ro) textarea.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && String(e.key || "").toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    });
    if (newBtn) newBtn.addEventListener("click", function () {
      if (!Game || !Game.PCFiles || !Game.PCFiles.createTextFile) return;
      var created = Game.PCFiles.createTextFile("New Note.text", "", { addToDesktop: true, open: true });
      if (!created) return;
      if (UI.renderPC) UI.renderPC();
    });
  };
})();

