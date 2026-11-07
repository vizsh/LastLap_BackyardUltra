/* The director turns a scroll position into a frame: which shots, where the camera is,
   where the light is and how bright it burns. All of the film's motion is decided here. */
import { TRANS } from './reel.js';
import { PLATE, HIDDEN, inside } from './route.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const PUSH = 1.65;

export function createDirector({ shots, total, phone, samples }) {
  const frame = {
    a: shots[0], b: null, t: 0, amp: 0, fade: 1, shade: 0.7, time: 0,
    camA: new Float32Array(4), camB: new Float32Array(4), par: new Float32Array(4),
    lightA: new Float32Array(2), lightB: new Float32Array(2), blur: new Float32Array(2), fog: new Float32Array(2),
    light: new Float32Array(2), head: new Float32Array(2), tint: new Float32Array(3), route: new Float32Array(3), ptr: new Float32Array(3),
    routeU: 0, headOn: 1,
  };

  const loop = shots.find((s) => s.route);
  const visible = samples.map(([x, y]) => (HIDDEN.some((h) => inside(x, y, h)) ? 0 : 1));
  const routeU = (pos) => ss(loop.start + loop.hold * 0.05, loop.start + loop.hold * 0.95, pos);

  /* how far a shot's depth can push a pixel, which is half the parallax at its strongest */
  const reach = (shot) => (shot.par ? [(shot.par[0] + 0.012) / 2, (shot.par[1] * 0.6 + 0.008) / 2] : [0, 0]);

  /* each new loop lands as a step forward, then the camera settles */
  const stepped = (shot, pos) => {
    const h = (pos - shot.start) / shot.hold;
    return shot.beats.reduce((sum, b) => sum + ss(b - 0.05, b + 0.1, h), 0) / shot.beats.length;
  };

  function view(shot, pos, W, H, time) {
    const q = clamp((pos - (shot.start - TRANS)) / (shot.hold + 2 * TRANS));
    const sa = W / H, ia = shot.aspect, cam = shot.cam;
    const move = shot.beats ? stepped(shot, pos) * 0.86 + q * 0.14 : q;
    const z = lerp(cam.z[0], cam.z[1], move);
    /* a camera on a person's shoulder is never perfectly still */
    const hx = (Math.sin(time * 0.31 + shot.i) + 0.6 * Math.sin(time * 0.73 + shot.i * 2)) * 0.0017;
    const hy = (Math.sin(time * 0.27 + shot.i * 3) + 0.6 * Math.sin(time * 0.61)) * 0.0013;
    let c = [lerp(cam.c[0][0], cam.c[1][0], move) + hx, lerp(cam.c[0][1], cam.c[1][1], move) + hy];
    const m = reach(shot);
    /* the frame always stays inside the picture, with room for the parallax: beyond the
       edge there is only the last row of pixels, smeared */
    const w = Math.min(1, sa / ia) / z, h = Math.min(1, ia / sa) / z;
    const over = Math.max(1, w / (1 - 2 * m[0]), h / (1 - 2 * m[1]));
    const vis = [w / over, h / over];
    if (shot.route) {
      /* the camera leans toward the runners, and follows them closely on a phone */
      const p = samples[Math.round(routeU(pos) * (samples.length - 1))];
      const k = (phone ? 0.92 : 0.34) * ss(loop.start - 0.3, loop.start + 0.5, pos);
      c = [lerp(c[0], p[0] / PLATE[0], k), lerp(c[1], p[1] / PLATE[1], k * (phone ? 0.5 : 0.7))];
    }
    return { c: fit(c, vis, m), vis, q, m };
  }

  const fit = (c, vis, m) => [clamp(c[0], vis[0] / 2 + m[0], 1 - vis[0] / 2 - m[0]), clamp(c[1], vis[1] / 2 + m[1], 1 - vis[1] / 2 - m[1])];
  const screen = (L, v) => [(L[0] - v.c[0]) / v.vis[0] + 0.5, (L[1] - v.c[1]) / v.vis[1] + 0.5];

  /* fly toward a light, holding it at a chosen point on screen */
  function fly(v, L, e, target) {
    const p0 = screen(L, v), z = 1 + PUSH * e * e;
    const p = [lerp(p0[0], target[0], e), lerp(p0[1], target[1], e)];
    const vis = [v.vis[0] / z, v.vis[1] / z];
    const c = fit([L[0] - (p[0] - 0.5) * vis[0], L[1] - (p[1] - 0.5) * vis[1]], vis, v.m);
    return { c, vis, p };
  }

  const parallax = (shot, q, ptr) => {
    if (!shot.par) return [0, 0];
    const k = (q - 0.5) * 2;
    return [shot.par[0] * k + ptr[0] * 0.012, shot.par[1] * k * 0.6 + ptr[1] * 0.008];
  };

  return function direct(pos, time, W, H, vel, ptr, intro) {
    const p = clamp(pos, 0, total);
    let i = shots.length - 1;
    for (let k = 0; k < shots.length; k++) if (p < shots[k].end + TRANS) { i = k; break; }
    const a = shots[i], next = shots[i + 1];
    const raw = next ? clamp((p - a.end) / TRANS) : 0;
    const t = raw;
    const b = t > 0 ? next : null;
    const f = frame;
    f.a = a; f.b = b; f.t = t; f.time = time;

    const speed = Math.min(0.016, Math.abs(vel) * 0.012);
    const va = view(a, p, W, H, time);
    let amp, light, tint;

    if (b) {
      const vb = view(b, p, W, H, time);
      const pa = screen(a.out, va), pb = screen(b.in, vb);
      const mid = [lerp(lerp(pa[0], pb[0], 0.5), 0.5, 0.35), lerp(lerp(pa[1], pb[1], 0.5), 0.46, 0.35)];
      const eA = ss(0, 0.56, t), eB = ss(0, 0.56, 1 - t);
      const A = fly(va, a.out, eA, mid), B = fly(vb, b.in, eB, mid);
      f.camA.set([A.c[0], A.c[1], A.vis[0], A.vis[1]]);
      f.camB.set([B.c[0], B.c[1], B.vis[0], B.vis[1]]);
      f.lightA.set(a.out); f.lightB.set(b.in);
      f.blur[0] = eA * eA * 0.42 + speed; f.blur[1] = eB * eB * 0.42 + speed;
      const pa2 = parallax(a, va.q, ptr), pb2 = parallax(b, vb.q, ptr);
      f.par.set([pa2[0], pa2[1], pb2[0], pb2[1]]);
      light = t < 0.5 ? A.p : B.p;
      const swell = Math.sin(Math.PI * t) ** 1.6 * 0.86;
      amp = Math.max(swell, (a.glow || 0) * (1 - t * 2), (b.glow || 0) * (t * 2 - 1));
      const w = ss(0.34, 0.66, t);
      tint = [lerp(a.tint[0], b.tint[0], w), lerp(a.tint[1], b.tint[1], w), lerp(a.tint[2], b.tint[2], w)];
      f.fog[0] = a.fog || 0; f.fog[1] = b.fog || 0;
    } else {
      f.camA.set([va.c[0], va.c[1], va.vis[0], va.vis[1]]);
      f.camB.set(f.camA);
      f.lightA.set(a.out); f.lightB.set(a.out);
      f.blur[0] = speed; f.blur[1] = 0;
      const pa2 = parallax(a, va.q, ptr);
      f.par.set([pa2[0], pa2[1], 0, 0]);
      const hold = clamp((p - a.start) / a.hold);
      const same = a.in[0] === a.out[0] && a.in[1] === a.out[1];
      light = screen(same ? a.out : a.in, va);
      /* a stepping shot leaves its first light behind, so the flare moves on with the camera */
      if (a.beats) { const o = screen(a.out, va), w = ss(0.02, 0.2, hold); light = [lerp(light[0], o[0], w), lerp(light[1], o[1], w)]; }
      amp = (a.glow || 0) * (1 + 0.1 * Math.sin(time * 1.3)) * (same ? 1 : 1 - ss(0.6, 1, hold));
      /* the bell lands in the lens: a hit of light and a small lurch at each new loop */
      if (a.beats) {
        const hit = a.beats.reduce((s, b) => s + Math.exp(-(((hold - b) / 0.032) ** 2)), 0);
        amp = Math.max(amp, hit * 0.5);
        f.blur[0] += hit * 0.05;
      }
      tint = a.tint;
      f.fog[0] = a.fog || 0; f.fog[1] = 0;
    }

    /* the very first shot comes out of its own light */
    if (intro < 1) {
      const e = 1 - ss(0, 1, intro);
      const L = fly(va, a.out, e * 0.8, [0.5, 0.46]);
      f.camA.set([L.c[0], L.c[1], L.vis[0], L.vis[1]]);
      f.blur[0] = e * e * 0.36;
      light = L.p;
      amp = Math.max(amp, e ** 1.3);
      f.fade = ss(0, 0.28, intro);
    } else f.fade = 1;

    f.amp = amp; f.light.set(light); f.tint.set(tint);

    const on = a.route ? 1 : b?.route ? 2 : 0;
    const u = routeU(p);
    f.routeU = u;
    f.route[0] = on; f.route[1] = u; f.route[2] = on ? ss(loop.start - 0.5, loop.start + 0.1, p) : 0;
    const hi = Math.round(u * (samples.length - 1));
    const hs = samples[hi];
    f.headOn += (visible[hi] - f.headOn) * 0.16;
    f.head[0] = hs[0] / PLATE[0]; f.head[1] = hs[1] / PLATE[1];
    f.ptr[0] = ptr[2]; f.ptr[1] = ptr[3]; f.ptr[2] = ptr[4];
    return f;
  };
}
