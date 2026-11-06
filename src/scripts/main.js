import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* the bell: off by default, only ever starts from a visitor's tap */
const soundBtn = $('#sound');
let audio = null, soundOn = false;
function bell() {
  if (!soundOn) return;
  audio ||= new AudioContext();
  audio.resume();
  const t = audio.currentTime, master = audio.createGain();
  master.gain.value = 0.16; master.connect(audio.destination);
  [[523, 1, 2.6], [1046, 0.5, 2], [1421, 0.34, 1.5], [1912, 0.2, 1.1], [2640, 0.1, 0.7]].forEach(([f, v, d]) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.05);
  });
}
soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
  bell();
});

/* images that are kept out of the public repo simply leave the dark background */
const hideMissing = (i) => { i.style.visibility = 'hidden'; };
addEventListener('error', (e) => { if (e.target instanceof HTMLImageElement) hideMissing(e.target); }, true);
$$('img').forEach((i) => { if (i.complete && !i.naturalWidth && i.loading !== 'lazy') hideMissing(i); });

/* the clock always counts to the next real hour in Mumbai */
const clockM = $('#clockM'), clockS = $('#clockS'), sweep = $('.sweep');
let lastLeft = null;
function tick() {
  const ist = new Date(Date.now() + 19800000);
  const left = 3600 - (ist.getUTCMinutes() * 60 + ist.getUTCSeconds());
  clockM.textContent = String(Math.floor(left / 60) % 60).padStart(2, '0');
  clockS.textContent = String(left % 60).padStart(2, '0');
  if (lastLeft !== null && left > lastLeft) { bell(); if (!reduced) { sweep.classList.remove('on'); void sweep.offsetWidth; sweep.classList.add('on'); } }
  lastLeft = left;
}
tick(); setInterval(tick, 1000);

/* email field: concept only, nothing is stored yet */
const form = $('#list'), email = $('#email'), msg = $('#listMsg');
email.addEventListener('input', () => { msg.textContent = ''; msg.classList.remove('err'); email.removeAttribute('aria-invalid'); });
const ENDPOINT = import.meta.env.PUBLIC_LIST_ENDPOINT;
const addBtn = form.querySelector('button');
const say = (text, bad = false) => { msg.textContent = text; msg.classList.toggle('err', bad); };
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    say('Enter a valid email address.', true); email.setAttribute('aria-invalid', 'true'); email.focus(); return;
  }
  if (!ENDPOINT) { say('This is a concept preview, so your email was not saved.'); return; }
  addBtn.disabled = true; say('Adding you...');
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value }) });
    if (!r.ok) throw new Error(String(r.status));
    form.reset(); say("You're on the list.");
  } catch {
    say("That didn't go through. Try again.", true);
  } finally {
    addBtn.disabled = false;
  }
});

/* the route: a long string of tiny headlamps along the road, traced by hand over the aerial */
const ROUTE = [[432, 852], [468, 762], [506, 660], [546, 565], [577, 480], [604, 408], [640, 335], [700, 330], [800, 316], [885, 302], [908, 322], [936, 346], [966, 374], [1012, 430], [1066, 520], [1126, 566], [1102, 584], [1062, 590], [1048, 640], [1058, 720], [1088, 782], [960, 790], [830, 796], [640, 798], [545, 806], [478, 838], [432, 852]];
const HIDDEN = [[[708, 250], [783, 250], [783, 412], [1042, 408], [1032, 765], [722, 765], [714, 412], [708, 410]], [[972, 372], [1132, 372], [1132, 556], [1046, 572], [1042, 400]]];
const inside = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
function sampleRoute(p, n) {
  const dense = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(i - 1, 0)], b = p[i], c = p[i + 1], e = p[Math.min(i + 2, p.length - 1)];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    for (let k = 0; k < 40; k++) {
      const t = k / 40, q = 1 - t;
      dense.push([q * q * q * b[0] + 3 * q * q * t * c1[0] + 3 * q * t * t * c2[0] + t * t * t * c[0], q * q * q * b[1] + 3 * q * q * t * c1[1] + 3 * q * t * t * c2[1] + t * t * t * c[1]]);
    }
  }
  dense.push(p[p.length - 1]);
  const dist = [0];
  for (let i = 1; i < dense.length; i++) dist.push(dist[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const out = []; let j = 0;
  for (let k = 0; k < n; k++) { const s = (dist[dist.length - 1] * k) / (n - 1); while (j < dense.length - 2 && dist[j + 1] < s) j++; out.push(dense[j]); }
  return out;
}
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const N = 1300;
const samples = sampleRoute(ROUTE, N).map(([x, y], i, arr) => {
  const nx = arr[Math.min(i + 1, N - 1)], px = arr[Math.max(i - 1, 0)], dx = nx[0] - px[0], dy = nx[1] - px[1], l = Math.hypot(dx, dy) || 1;
  const depth = y / 914, off = (rnd() - 0.5) * (2 + depth * 7);
  const X = x - (dy / l) * off, Y = y + (dx / l) * off;
  return { x: X, y: Y, px: x, py: y, depth, on: rnd() < 0.62, s: 0.7 + rnd() * 0.6, a: 0.35 + rnd() * 0.65, warm: rnd() < 0.16, hide: HIDDEN.some((h) => inside(x, y, h)) };
});
function sprite(r, g, b) {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.22, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return c;
}
const redLamp = sprite(255, 62, 44), hotLamp = sprite(255, 236, 226);
const plate = $('#plate'), km = $('#km'), exposure = $('#exposure'), rc = $('#route');
const RES = touch ? 1 : 1.5;
rc.width = 1600 * RES; rc.height = 914 * RES;
const cx = rc.getContext('2d'); cx.scale(RES, RES);
const full = document.createElement('canvas'); full.width = rc.width; full.height = rc.height;
{
  const f = full.getContext('2d'); f.scale(RES, RES);
  f.globalCompositeOperation = 'lighter'; f.lineCap = 'round'; f.strokeStyle = '#ff3a26';
  for (let i = 1; i < N; i++) {
    const a2 = samples[i - 1], b2 = samples[i];
    if (a2.hide || b2.hide) continue;
    f.globalAlpha = 0.42; f.lineWidth = 0.7 + b2.depth * 2.1;
    f.beginPath(); f.moveTo(a2.px, a2.py); f.lineTo(b2.px, b2.py); f.stroke();
  }
  for (const p of samples) {
    if (p.hide || !p.on) continue;
    const size = (2.4 + p.depth * 6.4) * p.s;
    f.globalAlpha = Math.min(1, p.a * 1.15);
    f.drawImage(p.warm ? hotLamp : redLamp, p.x - size, p.y - size, size * 2, size * 2);
  }
}
let drawn = -1;
function drawRoute(n) {
  if (n === drawn) return; drawn = n;
  cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
  cx.clearRect(0, 0, 1600, 914);
  if (n < 2) return;
  /* one thick stroke along the route so far, then the finished lamps show through it */
  cx.lineWidth = 34; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#fff';
  cx.beginPath(); cx.moveTo(samples[0].px, samples[0].py);
  for (let i = 4; i <= n; i += 4) cx.lineTo(samples[i].px, samples[i].py);
  cx.lineTo(samples[n].px, samples[n].py); cx.stroke();
  cx.globalCompositeOperation = 'source-in';
  cx.drawImage(full, 0, 0, 1600, 914);
  /* the lead runners stay brightest */
  cx.globalCompositeOperation = 'lighter';
  for (let i = Math.max(0, n - 26); i <= n; i++) {
    const p = samples[i];
    if (p.hide || !p.on) continue;
    const size = (2.4 + p.depth * 6.4) * p.s * 1.3;
    cx.drawImage(hotLamp, p.x - size, p.y - size, size * 2, size * 2);
  }
}

let closed = true;
function paintLoop(p) {
  const u = ss(0.1, 0.74, p), n = Math.floor(u * (N - 1)), pt = samples[n];
  drawRoute(n);
  km.textContent = (u * 6.706).toFixed(2);
  if (u > 0.998 && !closed) { closed = true; bell(); } else if (u < 0.9) closed = false;

  /* camera: settles on the route, and follows the runners on narrow screens */
  const vw = innerWidth, vh = innerHeight, narrow = vw < vh;
  const cover = Math.max(vw / 1600, vh / 914);
  const zoom = 1 + (narrow ? 0.05 : 0.2) * ss(0.02, 0.7, p) - 0.06 * ss(0.66, 0.78, p);
  const s = cover * zoom;
  const follow = narrow ? 0.9 : 0.42;
  const fx = 800 + (pt.x - 800) * follow, fy = 500 + (pt.y - 500) * follow;
  const tx = clamp(vw / 2 - fx * s, vw - 1600 * s, 0), ty = clamp(vh / 2 - fy * s, vh - 914 * s, 0);
  plate.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`;

  exposure.style.opacity = ss(0.745, 0.835, p).toFixed(3);
  exposure.style.transform = `scale(${(1.02 + 0.08 * ss(0.76, 1, p)).toFixed(4)})`;
}

function band(el, p, soft = 0.026) {
  const from = +el.dataset.from, to = +el.dataset.to;
  const o = ss(from, from + soft, p) * (1 - ss(to - soft, to, p));
  el.style.opacity = o.toFixed(3);
  el.style.visibility = o < 0.004 ? 'hidden' : 'visible';
  if (el.classList.contains('line')) el.style.transform = `translate3d(0,${((1 - ss(from, from + soft, p)) * 16).toFixed(1)}px,0)`;
  return o;
}

const loopBands = $$('#loop [data-from]');
const shots = $$('.shot');
const saveData = !!navigator.connection?.saveData;

/* the hour counter ticks between shots, then holds on each */
const HOURS = [[0, 1], [0.13, 1], [0.21, 6], [0.3, 6], [0.38, 11], [0.46, 11], [0.54, 15], [0.62, 15], [0.7, 24], [0.79, 24], [0.87, 46], [1, 46]];
const hourAt = (p) => {
  for (let i = 1; i < HOURS.length; i++) if (p <= HOURS[i][0]) { const [a, x] = HOURS[i - 1], [b, y] = HOURS[i]; return Math.round(x + (y - x) * clamp((p - a) / (b - a || 1))); }
  return 46;
};
const hourN = $('#hourN');

/* the Night: hold each shot, and only play the clip on screen */
let nearNight = false;
function paintNight(p) {
  hourN.textContent = String(hourAt(p)).padStart(2, '0');
  shots.forEach((s, i) => {
    const from = +s.dataset.from, to = +s.dataset.to;
    const o = band(s, p, 0.04);
    const m = s.firstElementChild;
    const live = o > 0.004;
    s.style.willChange = p > from - 0.08 && p < to + 0.04 ? 'opacity' : 'auto';
    if (live) m.style.transform = `scale(${(1.03 + 0.05 * clamp((p - from) / (to - from))).toFixed(4)})`;
    if (saveData) return;
    const next = shots[i + 1]?.firstElementChild;
    if (nearNight && live && next?.tagName === 'VIDEO' && !next.getAttribute('src')) { next.src = next.dataset.src; next.preload = 'auto'; next.load(); }
    if (m.tagName === 'VIDEO') {
      if (live && m.paused) { if (!m.getAttribute('src')) m.src = m.dataset.src; m.play().catch(() => {}); }
      else if (!live && !m.paused) m.pause();
    }
  });
}

const dot = $('#railDot');
const railLine = $('.rail');
const paintRail = () => { dot.style.transform = `translate3d(0,${(clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * railLine.offsetHeight).toFixed(1)}px,0)`; };
addEventListener('scroll', paintRail, { passive: true }); paintRail();

if (reduced) {
  paintLoop(0.74);
  $('#loop .line').classList.add('first');
} else {
  if (!touch) {
    const lenis = new Lenis({ lerp: 0.085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { duration: 1.6 }); }));
  }
  /* the opening arrives: the photograph lifts out of the dark, then the words */
  $('#night').classList.add('live'); $('#hour').hidden = false;
  gsap.fromTo('.veil', { opacity: 0.84 }, { opacity: 0, duration: 2.4, ease: 'power2.out' });
  gsap.from('.hero-copy > *', { y: 26, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.5 });
  gsap.to('.open .push', { scale: 1.08, ease: 'none', scrollTrigger: { trigger: '#open', start: 'top top', end: 'bottom top', scrub: touch ? 0.5 : true } });
  gsap.to('#lastImg', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: '#last', start: 'top bottom', end: 'bottom top', scrub: touch ? 0.5 : true } });

  const want = { loop: 0, night: 0 }, now = { loop: 0, night: 0 };
  const paintL = (p) => { paintLoop(p); loopBands.forEach((x) => band(x, p)); };
  ScrollTrigger.create({ trigger: '#loop', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { want.loop = s.progress; } });
  ScrollTrigger.create({ trigger: '#night', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { want.night = s.progress; } });
  ScrollTrigger.create({ trigger: '#night', start: 'top 150%', end: 'bottom top', onLeave: () => $$('.shot video').forEach((v) => v.pause()), onLeaveBack: () => $$('.shot video').forEach((v) => v.pause()) });
  const ease = touch ? 0.16 : 0.3;
  gsap.ticker.add(() => {
    for (const k of ['loop', 'night']) {
      const d = want[k] - now[k];
      if (Math.abs(d) < 0.00004) { if (d === 0) continue; now[k] = want[k]; } else now[k] += d * ease;
      if (k === 'loop') paintL(now.loop); else paintNight(now.night);
    }
  });
  /* decode big images before they are needed, so fades never hitch */
  const predecode = (sel) => $$(`${sel} img`).forEach((i) => { i.loading = 'eager'; i.decode?.().catch(() => {}); });
  ScrollTrigger.create({ trigger: '#loop', start: 'top 125%', once: true, onEnter: () => predecode('#loop') });
  ScrollTrigger.create({ trigger: '#night', start: 'top 200%', once: true, onEnter: () => { nearNight = true; predecode('#night'); paintNight(now.night); } });
  ScrollTrigger.create({ trigger: '#last', start: 'top 200%', once: true, onEnter: () => predecode('#last, #one-more') });
  paintL(0); paintNight(0);
  addEventListener('resize', () => paintLoop(now.loop));
  addEventListener('load', () => ScrollTrigger.refresh());
}
