# PixelFX — Codex edition

Based on Patch's MIT PixelFX 0.3.0. This is the runtime bundled with the Codex `pixelfx` skill. Upstream credits are in `LICENSE`, `NOTICE.md`, and individual source files.

Node.js 18+ is the only requirement for rendering PNG sprite sheets, JSON metadata, contact sheets, and offline HTML animations. No npm install is necessary for these tools. The optional gallery build uses esbuild; GIF and MP4 export uses ffmpeg.

```powershell
node tools/list.mjs portal
node tools/render.mjs fire/torch --sheet --html
node tools/render.mjs melee/sword-slash --html --act
node tools/new.mjs arcane/my-spell
node tools/check.mjs arcane/my-spell
```

For custom palettes on Windows, save an object such as `{"palette":["#101326","#295977","#3bbbc9","#baffee","#ffffff"]}` to `options.json`, then use `--opts-file options.json`. A UTF-8 BOM is supported. Outputs default to `records/<category>/<name>/`; change the root with `--out <directory>`.

`preview.html` embeds its own atlas, plays offline, and has play/pause, speed, and a frame slider. `--act` additionally creates `act.html` with the character choreography. `--sheet` always exports the effect alone; `tools/act.mjs <id> --sheet` exports the complete character act.

Read `docs/AUTHORING.md` before making effects. The original artistic notes mention Claude historically; the runtime is model-independent. The Codex workflow is in the enclosing skill's `SKILL.md`.

Sprite sheets include Aseprite-style JSON with frame rectangles, durations, and `meta.pixelfx` (frame rate, loop, pivot, size). Use nearest-neighbour filtering. JS games can import the core and effect modules directly. See `docs/CATALOG.md` for the original library; locally added effects are also found by `tools/list.mjs`.
