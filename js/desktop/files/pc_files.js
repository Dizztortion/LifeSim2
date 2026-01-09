(function () {
  window.Game = window.Game || {};
  var Game = window.Game;

  function nowDay() {
    var d = (Game && Game.state && typeof Game.state.day === "number" && isFinite(Game.state.day)) ? Math.floor(Game.state.day) : 0;
    return d > 0 ? d : 1;
  }

  function ensureFs() {
    if (!Game.state) Game.state = {};
    if (!Game.state.pc) Game.state.pc = { isOpen: false, activeApp: "desktop" };
    var pc = Game.state.pc;
    if (!pc.fs || typeof pc.fs !== "object") pc.fs = {};
    if (!Array.isArray(pc.fs.files)) pc.fs.files = [];
    if (typeof pc.fs.nextFileId !== "number" || !isFinite(pc.fs.nextFileId) || pc.fs.nextFileId < 1) pc.fs.nextFileId = 1;
    if (!pc.desktop || typeof pc.desktop !== "object") pc.desktop = {};
    if (!Array.isArray(pc.desktop.desktopFiles)) pc.desktop.desktopFiles = [];
    if (!pc.desktop.icons || typeof pc.desktop.icons !== "object") pc.desktop.icons = {};

    if (!pc.fs._initialized) {
      pc.fs._initialized = true;
      // Seed a couple of editable .text files so the editor is immediately usable.
      createTextFile("Welcome.text",
        "Welcome to your PC.\n\n" +
        "- Double-click a .text file to open it.\n" +
        "- Use Ctrl+S to save.\n\n" +
        "Tip: Search Ninja Web for \"antivirus\" to find security suites.\n",
        { addToDesktop: true, readOnly: false, silent: true });
      createTextFile("ToDo.text",
        "• Upgrade storage\n• Check mining temps\n• Run a full scan\n",
        { addToDesktop: true, readOnly: false, silent: true });
    }
  }

  function extFromName(name) {
    var n = String(name || "");
    var dot = n.lastIndexOf(".");
    if (dot < 0) return "";
    return n.substring(dot + 1).toLowerCase();
  }

  function getById(fileId) {
    ensureFs();
    var id = typeof fileId === "number" ? fileId : parseInt(fileId, 10);
    if (!isFinite(id)) return null;
    var files = Game.state.pc.fs.files;
    for (var i = 0; i < files.length; i++) if (files[i] && files[i].id === id) return files[i];
    return null;
  }

  function createTextFile(name, content, opts) {
    ensureFs();
    var pc = Game.state.pc;
    var o = opts || {};
    var fname = String(name || "New Note.text").trim();
    if (!fname) fname = "New Note.text";
    if (extFromName(fname) !== "text") fname += ".text";

    var file = {
      id: pc.fs.nextFileId++,
      name: fname,
      ext: "text",
      content: String(content || ""),
      createdDay: nowDay(),
      modifiedDay: nowDay(),
      readOnly: !!o.readOnly
    };
    pc.fs.files.push(file);

    if (o.addToDesktop) {
      var key = "file:" + file.id;
      if (pc.desktop.icons && !pc.desktop.icons[key]) {
        // Place new files in a third column so they don't overlap common app shortcuts.
        var idx = pc.desktop.desktopFiles.length;
        var col = 2;
        var row = idx;
        pc.desktop.icons[key] = { x: 10 + col * 134, y: 10 + row * 92 };
      }
      pc.desktop.desktopFiles.push(file.id);
    }
    if (!o.silent && Game.addNotification) Game.addNotification("Created " + file.name + ".");
    if (o.open && Game.PC && Game.PC.openFile) Game.PC.openFile(file.id);
    return file;
  }

  function updateTextFile(fileId, newContent) {
    ensureFs();
    var f = getById(fileId);
    if (!f) return false;
    if (f.readOnly) return false;
    f.content = String(newContent || "");
    f.modifiedDay = nowDay();
    return true;
  }

  Game.PCFiles = Game.PCFiles || {};
  Object.assign(Game.PCFiles, {
    ensureState: ensureFs,
    getById: getById,
    extFromName: extFromName,
    createTextFile: createTextFile,
    updateTextFile: updateTextFile
  });
})();

