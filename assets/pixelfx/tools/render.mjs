#!/usr/bin/env node
// Render effects so you can look at them.
//
//   node tools/render.mjs fire/torch            contact sheet: records/fire/torch/contact.png
//   node tools/render.mjs fire --gif            every fire effect, plus an animated GIF each
//   node tools/render.mjs "magic/portal*" --mp4 --scale 6
//   node tools/render.mjs ui/level-up --all     every frame in the contact sheet
//   node tools/render.mjs fire/torch --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}'
//
// Options: --gif --mp4 --sheet (transparent PNG + JSON) --all --max N (frames in the contact sheet)
// --zoom N (contact sheet scale) --scale N (GIF/MP4) --bg dark|ground|sky|light|black|none --seed N --fps N --opts JSON --out DIR
// --no-actor --loops N (repeat a loop in the GIF/MP4)
//
// This shows the effect by itself, with the character standing by. tools/act.mjs shows it acted out.

import { join } from "node:path";
import { readFileSync } from "node:fs";
import { ROOT, resolveIds, loadEffect, renderFrames, renderAct, contactSheet, spriteSheet, writeVideo, save } from "./lib/fxlib.mjs";
import { animationHTML } from "./lib/html.mjs";

const args = process.argv.slice(2), flags = {}, ids = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith("--")) ids.push(a);
  else if (["gif", "mp4", "sheet", "all", "no-actor", "html", "act"].includes(a.slice(2))) flags[a.slice(2)] = true;
  else if (["max", "zoom", "scale", "bg", "seed", "fps", "opts", "opts-file", "out", "loops"].includes(a.slice(2)) && args[i + 1] !== undefined && !args[i + 1].startsWith("--")) flags[a.slice(2)] = args[++i];
  else { console.error(`unknown option or missing value: ${a}`); process.exit(1); }
}
if (!ids.length) {
  console.error("usage: node tools/render.mjs <id|category|pattern>... [--sheet] [--html] [--act] [--gif] [--mp4] [--opts-file JSON]");
  process.exit(1);
}
if (flags.opts !== undefined && flags["opts-file"] !== undefined) {
  console.error("use either --opts or --opts-file, not both"); process.exit(1);
}
if (flags.act && !flags.html) { console.error("--act requires --html; for a baked act sheet use tools/act.mjs"); process.exit(1); }
let options, matched;
try {
  const json = flags["opts-file"] !== undefined ? readFileSync(flags["opts-file"], "utf8").replace(/^\uFEFF/, "") : flags.opts;
  options = json === undefined ? undefined : JSON.parse(json);
  if (options !== undefined && (!options || typeof options !== "object" || Array.isArray(options))) throw new Error("effect options must be a JSON object");
  for (const key of ["fps", "max", "zoom", "scale", "loops"]) {
    if (flags[key] !== undefined && (!Number.isInteger(+flags[key]) || +flags[key] < 1)) throw new Error(`--${key} must be a positive integer`);
  }
  if (flags.seed !== undefined && !Number.isFinite(+flags.seed)) throw new Error("--seed must be a number");
  matched = resolveIds(ids);
} catch (e) { console.error(e.message); process.exit(1); }

const out = flags.out ?? join(ROOT, "records");
let failed = 0;
for (const id of matched) {
  try {
    const fx = await loadEffect(id);
    const r = renderFrames(fx, {
      fps: flags.fps ? +flags.fps : undefined,
      seed: flags.seed !== undefined ? +flags.seed : undefined,
      bg: flags.bg,
      actor: flags["no-actor"] ? false : undefined,
      options,
    });
    const dir = join(out, id), made = [];
    made.push(save(join(dir, "contact.png"), contactSheet(fx, r, { max: flags.all ? 400 : +(flags.max ?? 16), zoom: flags.zoom ? +flags.zoom : undefined })));
    const k = +(flags.scale ?? Math.max(2, Math.min(8, Math.floor(480 / Math.max(r.w, r.h)))));
    const loops = +(flags.loops ?? (fx.meta.loop ? 2 : 1));
    for (const format of ["gif", "mp4"]) if (flags[format]) {
      const file = join(dir, `anim.${format}`);
      if (writeVideo(file, r, k, { loops: format === "mp4" ? Math.max(loops, fx.meta.loop ? 3 : 1) : loops })) made.push(file);
      else console.warn(`${id}: ffmpeg not found; no ${format.toUpperCase()} written. Use --html for an offline animation preview.`);
    }
    if (flags.html) {
      made.push(save(join(dir, "preview.html"), animationHTML(fx, r)));
      if (flags.act) {
        const acted = renderAct(fx, { fps: r.fps, seed: flags.seed !== undefined ? +flags.seed : undefined, bg: flags.bg, options });
        made.push(save(join(dir, "act.html"), animationHTML(fx, acted, { act: true })));
      }
    }
    if (flags.sheet) {
      const name = id.split("/")[1], s = spriteSheet(fx, r, name);
      made.push(save(join(dir, `${name}.png`), s.png), save(join(dir, `${name}.json`), JSON.stringify(s.json, null, 1)));
    }
    console.log(`${id}  ${r.n} frames  ->  ${made.join("  ")}`);
  } catch (e) {
    failed++;
    console.error(`${id}  FAILED: ${e.stack ?? e}`);
  }
}
process.exit(failed ? 1 : 0);
