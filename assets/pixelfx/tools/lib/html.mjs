// Standalone animation preview: no server, CDN, ffmpeg, or browser dependencies.
import { canvas } from './fxlib.mjs';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function animationHTML(fx, r, { act = false } = {}) {
  const { w, h, fps, frames } = r;
  // Pack already-composited preview frames; the transparent game atlas is separate.
  const cols = Math.max(1, Math.ceil(Math.sqrt(frames.length * h / w)));
  const image = canvas(cols * w, Math.ceil(frames.length / cols) * h, [0, 0, 0, 0]);
  frames.forEach((f, i) => image.paste(f.color, w, h, i % cols * w, Math.floor(i / cols) * h));
  const dataURI = `data:image/png;base64,${image.png().toString('base64')}`;
  const config = JSON.stringify({ w, h, fps, n: frames.length, cols });
  const title = escapeHTML(`${fx.meta.name}${act ? ' · character act' : ''}`);
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · PixelFX</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b101c;color:#e6f7ff;font:16px system-ui,sans-serif;padding:24px}
main{width:min(900px,100%)}h1{font-size:28px;margin:0 0 8px}.info{color:#94aec4;margin:0 0 24px}
.stage{background:#101624;border:1px solid #253647;border-radius:12px;min-height:360px;display:grid;place-items:center;overflow:auto;padding:24px}
canvas{image-rendering:pixelated;max-width:100%;height:auto}.controls{display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:18px}
button,select{border:1px solid #355267;border-radius:6px;background:#142838;color:#ddf7ff;padding:9px 16px;font:inherit}
input{flex:1;min-width:140px;accent-color:#5fe9ff}output{font-variant-numeric:tabular-nums;color:#a1cbd8;min-width:100px}
</style>
<main><h1>${title}</h1><p class="info">${w} × ${h} px · ${fps} fps · ${frames.length} frames · ${(frames.length / fps).toFixed(2)} s playback · ${fx.meta.loop ? 'loop' : 'one-shot (preview repeats)'}</p>
<div class="stage"><canvas id="view" width="${w}" height="${h}" aria-label="Animated effect preview"></canvas></div>
<div class="controls"><button id="play" type="button">Pause</button><label>Speed <select id="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>
<input id="scrub" type="range" min="0" max="${frames.length - 1}" value="0" aria-label="Frame"><output id="status"></output></div></main>
<script>
const cfg=${config}, image=new Image(), view=document.getElementById('view'), ctx=view.getContext('2d');
const play=document.getElementById('play'), speed=document.getElementById('speed'), scrub=document.getElementById('scrub'), status=document.getElementById('status');
view.style.width=(cfg.w*Math.max(1,Math.min(5,Math.floor(740/cfg.w))))+'px';ctx.imageSmoothingEnabled=false;
let frame=0,playing=true,last=null,elapsed=0;
function draw(){ctx.clearRect(0,0,cfg.w,cfg.h);ctx.drawImage(image,frame%cfg.cols*cfg.w,Math.floor(frame/cfg.cols)*cfg.h,cfg.w,cfg.h,0,0,cfg.w,cfg.h);scrub.value=frame;status.textContent=(frame+1)+' / '+cfg.n;}
play.onclick=()=>{playing=!playing;play.textContent=playing?'Pause':'Play';elapsed=0;};
scrub.oninput=()=>{playing=false;play.textContent='Play';frame=Number(scrub.value);elapsed=0;draw();};
function tick(now){const dt=last===null?0:Math.min(250,now-last);last=now;if(playing){elapsed+=dt*Number(speed.value);const steps=Math.floor(elapsed*cfg.fps/1000);if(steps){frame=(frame+steps)%cfg.n;elapsed-=steps*1000/cfg.fps;draw();}}requestAnimationFrame(tick);}
image.onload=()=>{draw();requestAnimationFrame(tick);};image.src='${dataURI}';
</script></html>`;
}
