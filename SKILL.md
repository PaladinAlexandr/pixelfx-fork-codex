---
name: pixelfx
description: Create, remix, preview, and export animated pixel art VFX with the bundled PixelFX library. Use for game effects such as fire, ice, lightning, portals, impacts, auras, attack animations, and transparent sprite sheets; also for Russian requests about пиксельные эффекты, анимации and спрайт-листы. Use code and the renderer for these animations. General illustrations and photographs belong to image generation instead.
license: MIT
---

# PixelFX for Codex

Create pixel effects as executable JavaScript, inspect rendered frames, and deliver animation previews plus usable assets. The bundled library is Patch's MIT PixelFX, adapted for Codex; retain `LICENSE`, `NOTICE.md`, and credits in reused files.

## Find a writable workspace

This skill is self-contained: `assets/pixelfx/` contains the renderer, core, effect library, gallery, and authoring reference. Node.js 18+ is required. PNG, JSON, and HTML output need no npm install, account, API key, or network. GIF/MP4 need optional ffmpeg.

If the user's active project already has `tools/render.mjs` and `src/core/index.js`, work there. Otherwise create a workspace inside the current writable project, using the script's absolute path resolved relative to this `SKILL.md`:

```powershell
node "<skill-dir>/scripts/workspace.mjs" "<current-project>/work/pixelfx"
```

The initializer refuses a nonempty destination. Reuse a workspace it already created rather than initializing again. Do not edit effects inside the installed skill. Run the following commands with the effect workspace as the working directory.

## Choose and direct the effect

Search local examples first: `node tools/list.mjs frost` or `node tools/list.mjs slash loop`. Read `docs/CATALOG.md` only when broader discovery is useful. Render promising candidates with `node tools/render.mjs ice/frost-nova --html` and open `records/ice/frost-nova/contact.png` using the available image viewing tool.

Translate the user's request into a short direction: silhouette, motion phases, palette, duration, loop/one-shot, canvas size, and required output. Infer reasonable defaults when details are missing. Offer genuinely different variants when a style choice would help.

Reuse or recolor when that meets the request; create a new file when the motion or silhouette differs. For options, prefer a JSON file over shell-embedded JSON on Windows:

```powershell
node tools/render.mjs fire/torch --opts-file options.json --sheet --html
```

Common options are `palette` (dark-to-bright hex strings), `seed`, `flip`, `angle` in radians, and `light`; effect-specific defaults are in `meta.options`. `--opts-file` and `--opts` are mutually exclusive.

## Create and refine

Before authoring, read `assets/pixelfx/docs/AUTHORING.md` through this skill, or `docs/AUTHORING.md` in the workspace. Read the nearest two or three effect implementations for useful techniques. External references are optional, useful when the user provides them or asks for a style not represented locally.

- Draft with `node tools/new.mjs arcane/my-spell` (add `--loop` for a loop), or write the file directly under `src/fx/<category>/<name>.js`.
- Pure effects export `draw(p, t, o)` and optional `drawBack`; simulations export `create(o)` returning update/draw methods. Use seeded randomness and `fit(o.palette, n)`.
- Use local coordinates; directional effects face right, ground is y = 0, and the actor's feet are the origin. Put crisp pixels into color and additive light into light. Use translucent discs or smoke particles for volumes.
- Design an anticipation, a decisive release, secondary motion, and decay. Reserve white for the hottest core. Judge silhouette at native resolution and check on a light as well as a dark background when intended for varied scenes.
- Render `--sheet --html`, open the contact sheet, inspect individual frames around release and decay, and fix the largest visible problem. Repeat while there are material visual defects. A successful command or check does not replace looking at the image.
- For character attacks, add an `act` with wind-up, release, hit-stop, target reaction, and recovery as appropriate. `node tools/act.mjs <id>` shows consecutive 12 fps steps; `node tools/render.mjs <id> --act --html` makes a motion preview. Use `src/fx/moves/` for composed attacks.
- Run `node tools/check.mjs <id>` on each changed effect. Resolve errors and inspect warnings, especially clipped pixels, loop seams, palette holes, and one-shots remaining visible at duration. The upstream checker reports some defects as warnings with exit code zero.

If a pattern matches nothing, the adapted render command exits with an error rather than reporting a successful export. The checker and renderer use default options differently: also render any requested option variant and inspect its bounds visually.

## Deliver

Save final user-facing assets in the current project's designated output folder. Keep the effect's source and any custom options beside them, so the result can be changed and reproduced. A usual delivery includes:

- transparent PNG sprite sheet plus Aseprite-style JSON (`--sheet`);
- contact sheet and self-contained animation player (`--html`), which opens offline without ffmpeg;
- source `.js` and options JSON when customized; GIF/MP4 if ffmpeg is available and useful.

An example with explicit output directory:

```powershell
node tools/render.mjs arcane/my-spell --sheet --html --out "<current-project>/outputs/effects"
```

`--html` shows the effect alone; add `--act` for a separate `act.html` including the character. `--sheet` still exports the effect alone. Use `node tools/act.mjs <id> --sheet` only when the requested sheet should bake the character into the animation.

For game imports use nearest-neighbour filtering and the JSON's `meta.pixelfx.fps`, `frameSize`, and `pivot`. Glow is baked into the transparent sheet, so inspect against the actual game background. JS games can use `createFx`/`createAct` and the two-buffer compositor directly; the entrypoint is `src/core/index.js`. Native engines can consume the exported sheets without running JavaScript.

Respond in the user's language. Show a rendered preview when possible, link the finished files, and state size, frame rate, duration, and whether it loops. Describe this as a saved skill and a tested workflow, not model training or guaranteed mastery of all visual styles.
