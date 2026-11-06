// Original Codex demonstration for the PixelFX adaptation, November 2026.
// Uses Patch's MIT PixelFX drawing primitives; see the bundled LICENSE and NOTICE.md.
import { fit, burst, rng, fly, clamp, ease, TAU, WHITE } from '../../core/index.js';

export const meta = {
  name: 'Prism burst',
  desc: 'A violet charge snaps into a cyan electric star; broken arcs race outward, crystal splinters tumble, and a thin ground echo fades beneath drifting sparks.',
  tags: ['arcane', 'electric', 'lightning', 'burst', 'impact', 'crystal', 'one-shot'],
  size: [224, 176], origin: [112, 128], duration: 1.6, loop: false, fps: 30, bg: 'dark',
  options: { palette: ['#131729', '#29245a', '#58408f', '#247696', '#24bfce', '#73f4ed', '#d8fffa', '#ffffff'], seed: 42 },
};

const RELEASE = 0.2, CY = -24;

function diamond(p, x, y, length, width, angle, C, alpha) {
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const point = (dx, dy) => [x + dx * ca - dy * sa, y + dx * sa + dy * ca];
  const tip = point(length, 0), tail = point(-length * 0.65, 0);
  const left = point(0, -width), right = point(0, width);
  p.tri(...tip, ...tail, ...left, C[5], alpha);
  p.tri(...tip, ...right, ...tail, C[2], alpha);
  p.line(...tail, ...tip, C[6], alpha);
}

export function drawBack(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), u = t - RELEASE;
  if (u < 0) {
    const q = t / RELEASE;
    p.glow(0, CY, 16 + q * 12, C[3], q * 0.22);
    return;
  }
  const q = clamp(u / 0.8), fade = Math.pow(1 - q, 1.7);
  if (fade > 0) {
    const r = 9 + 68 * ease.outCubic(q);
    for (let a = 0; a < TAU; a += 0.025) {
      if (Math.sin(a * 5 + 0.3) < -0.2) continue;
      p.blend(Math.cos(a) * r, 2 + Math.sin(a) * r * 0.18, C[4], fade * 0.6);
    }
    p.glow(0, CY, 62, C[4], fade * 0.28);
  }
}

export function draw(p, t, o) {
  if (t < 0 || t >= meta.duration) return;
  const C = fit(o.palette, 8), seed = o.seed;
  if (t < RELEASE) {
    const q = t / RELEASE;
    burst(10, seed, (r, i) => {
      const a = i / 10 * TAU + q * 0.9, rad = 27 * (1 - q) + 3;
      const x = Math.cos(a) * rad, y = CY + Math.sin(a) * rad * 0.72;
      p.line(x, y, x * 0.77, CY + (y - CY) * 0.77, C[i % 3 ? 4 : 6], q);
    });
    diamond(p, 0, CY, 1 + q * 5, 1 + q * 2.5, -Math.PI / 2, C, q);
    p.glow(0, CY, 9 + q * 14, C[4], q * 0.32);
    return;
  }
  const u = t - RELEASE;
  // Hero star: a short white core with four much longer cyan rays.
  if (u < 0.13) {
    const q = u / 0.13, k = 1 - q;
    for (let i = 0; i < 4; i++) {
      const a = i * TAU / 4 + 0.12;
      diamond(p, 0, CY, 8 + 25 * k, 1.5 + 2 * k, a, C, k);
    }
    p.circle(0, CY, 1 + 5 * k, WHITE, k);
    p.glow(0, CY, 20 + 24 * k, C[5], 0.65 * k * k);
  }
  // Broken shock rim; the silhouette opens into six electric branches.
  if (u < 0.43) {
    const q = u / 0.43, rad = 6 + 62 * ease.outQuart(q), alpha = 1 - q;
    for (let i = 0; i < 6; i++) {
      const a0 = i * TAU / 6 - 0.2, R = rng(seed, i, Math.floor(u * 18));
      let x = Math.cos(a0) * rad * 0.45, y = CY + Math.sin(a0) * rad * 0.45;
      for (let j = 1; j <= 5; j++) {
        const a = a0 + R.range(-0.14, 0.14), d = rad * (0.45 + j * 0.12);
        const nx = Math.cos(a) * d, ny = CY + Math.sin(a) * d * 0.82;
        p.line(x, y, nx, ny, q < 0.18 ? WHITE : C[6], alpha);
        if (j % 2) p.line(nx, ny, nx + Math.cos(a - 0.8) * 6, ny + Math.sin(a - 0.8) * 5, C[4], alpha * 0.8);
        x = nx; y = ny;
      }
      p.arc(0, CY, rad * 0.72, 1, a0 + 0.15, a0 + 0.56, C[4], alpha * 0.8);
    }
  }
  burst(16, seed * 3, (r, i) => {
    const a = i / 16 * TAU + r.range(-0.14, 0.14), speed = r.range(80, 165), life = r.range(0.45, 0.8);
    if (u >= life) return;
    const [x, y] = fly(0, CY, Math.cos(a) * speed, Math.sin(a) * speed * 0.7 - 22, u, 110, 2.8);
    const alpha = clamp((life - u) / 0.25), length = r.range(2.3, 5.5) * (1 - u / life * 0.5);
    diamond(p, x, y, length, r.range(1, 2), a + u * r.range(-6, 6), C, alpha);
    if (i % 3 === 0) p.glow(x, y, 6, C[4], alpha * 0.2);
  });
  burst(32, seed * 7, (r) => {
    const delay = r.range(0, 0.08), age = u - delay, life = r.range(0.35, 1.12);
    const a = r.range(-Math.PI, Math.PI), speed = r.range(45, 175);
    if (age < 0 || age >= life) return;
    const [x, y] = fly(0, CY, Math.cos(a) * speed, Math.sin(a) * speed * 0.7 - 35, age, 125, 3.2);
    const alpha = clamp((life - age) / 0.3);
    p.dot(x, y, age < 0.12 ? WHITE : C[5], alpha);
    p.dot(x - Math.cos(a), y - Math.sin(a), C[3], alpha * 0.7);
    p.light(x, y, C[4], alpha * 0.28);
  });
}
