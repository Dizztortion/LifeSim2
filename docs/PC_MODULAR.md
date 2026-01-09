# Modular PC content

This project’s PC feature supports modular data files for:

- PC apps (definitions + installers)
- PC websites (custom-rendered pages + Ninja Web search entries)
- Simple PC files (`.text`) for the Text Editor

## Add a PC app

1. Create a new file in `js/desktop/apps/apps/` (one file per app).
2. Register the app:

```js
UI.PCApps.register({
  id: "myapp",
  title: "My App",
  sub: "Category",
  emoji: "🧩",
  window: { w: 640, h: 520 },
  install: { id: "myapp", sizeMb: 25, name: "My App", kind: "pc_app_myapp", downloadId: "pc-app-myapp" }
});
```

3. Add a `<script>` tag for the new file in `index.html` (near the other PC app scripts).

Notes:
- If `install` is omitted, the app is treated as always-installed.
- `kind` must start with `pc_app_` for installs to mark the app as installed.

## Add a PC website

1. Create a new file in `js/desktop/websites/sites/` (one file per site).
2. Register the site:

```js
UI.pcWebRegisterSite({
  host: "example.site",
  title: "Example Site",
  search: {
    title: "Example Site — tools",
    url: "https://example.site/",
    snippet: "A short description for Ninja Web search results.",
    keywords: ["tools", "example"]
  },
  render: function (url) {
    return UI._pcWebHelpers.siteShell({ host: "example.site", title: "Example Site", bodyHtml: "<div>...</div>" });
  }
});
```

3. Add a `<script>` tag for the new file in `index.html` (near the other PC website scripts).

## `.text` files + Text Editor

- `.text` files live in save state at `Game.state.pc.fs.files`.
- Desktop file shortcuts live at `Game.state.pc.desktop.desktopFiles`.
- The Text Editor opens files via `Game.PC.openFile(fileId)`.

