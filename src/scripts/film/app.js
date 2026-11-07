/* Puts the film together: scroll in, frame out. Runs once per animation frame. */
import Lenis from 'lenis';
import { layout, TRANS, LOOPS, LOOP_KM } from './reel.js';
import { Film } from './engine.js';
import { createDirector } from './director.js';
import { Sound } from './sound.js';
import { sampleRoute, routePath } from './route.js';
import { createSegments } from '../segments.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const outCubic = (t) => 1 - (1 - t) ** 3;
const inCubic = (t) => t ** 3;

export async function startFilm(fail = () => {}) {
  const root = document.documentElement;
  history.scrollRestoration = 'manual';
  const phone = innerWidth < innerHeight && innerWidth < 900;
  const touch = matchMedia('(pointer: coarse)').matches;
  const saveData = !!navigator.connection?.saveData;
  const { shots, total } = layout(phone);
  const byId = Object.fromEntries(shots.map((s) => [s.id, s]));
  const samples = sampleRoute();

  const canvas = $('#film'), reel = $('#reel'), stage = $('#stage'), register = $('#register');
  reel.style.height = `${(total + 1) * 100}lvh`;

  const film = new Film(canvas, { phone, onLost: () => location.reload() });
  const direct = createDirector({ shots, total, phone, samples });
  const sound = new Sound();
  const sizeFilm = () => film.resize(canvas.clientWidth, canvas.clientHeight);
  sizeFilm();

  /* scroll */
  const lenis = touch ? null : new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
  lenis?.stop();
  const stack = $('#stack'), rows = $$('#stack .row').map((el) => ({ el, line: el.querySelector('.ln > span') }));
  const closing = stack.querySelector('.sub'), closingLine = closing.querySelector('.ln > span');
  let travel = 1, vh = 1, registerTop = 1, rowH = 1, closeH = 1;
  const measure = () => {
    vh = stage.offsetHeight; travel = Math.max(1, reel.offsetHeight - vh); registerTop = register.offsetTop || 1;
    rowH = rows[0].el.offsetHeight; closeH = closing.offsetHeight + parseFloat(getComputedStyle(closing).marginTop);
  };
  measure();
  const yOf = (pos) => (pos / total) * travel;

  /* the words */
  const items = $$('.copy:not(.stack)').map((el) => {
    const shot = byId[el.closest('.beat').dataset.shot];
    let i0, i1, o0, o1;
    if (el.dataset.a) {
      const s = shot.start + shot.hold * +el.dataset.a, e = shot.start + shot.hold * +el.dataset.b;
      i0 = s - 0.14; i1 = s + 0.16; o0 = e - 0.14; o1 = e + 0.06;
    } else { i0 = shot.start - TRANS * 0.4; i1 = shot.start + 0.05; o0 = shot.end + TRANS * 0.02; o1 = shot.end + TRANS * 0.4; }
    const first = 'first' in el.dataset, final = 'final' in el.dataset;
    if (final) { o0 = total + 1; o1 = total + 2; }
    return { el, i0, i1, o0, o1, first, lines: $$('.ln > span').filter((n) => el.contains(n)), last: -1, shown: false };
  });

  function paintCopy(item, pin, pout) {
    const key = pin * 1000 + pout;
    if (key === item.last) return;
    item.last = key;
    const on = pin > 0 && pout < 1;
    /* opacity, not visibility, so screen readers can still reach every line */
    if (on !== item.shown) { item.el.style.opacity = on ? 1 : 0; item.shown = on; }
    if (!on) return;
    const n = item.lines.length;
    item.lines.forEach((l, j) => {
      const a = outCubic(clamp(pin * (1 + 0.24 * (n - 1)) - j * 0.24));
      const b = inCubic(clamp(pout * (1 + 0.14 * (n - 1)) - (n - 1 - j) * 0.14));
      l.style.transform = `translate3d(0,${((1 - a) * 118 - b * 118).toFixed(2)}%,0)`;
    });
  }

  /* Again, and again: each loop lands on a lap sheet and pushes the one before it up the
     page. The words get heavier as the loops go by, and scrolling is what brings the next. */
  const again = byId.again;
  const beats = again.beats.map((b) => again.start + again.hold * b);
  const arrive = [again.start - TRANS * 0.3, ...beats];
  const closeAt = again.start + again.hold * 0.84, leaveAt = again.end + TRANS * 0.02;
  let stackOn = false;

  function paintStack() {
    const out = clamp((pos - leaveAt) / (TRANS * 0.38));
    const on = pos > arrive[0] - 0.2 && out < 1;
    if (on !== stackOn) { stack.style.opacity = on ? 1 : 0; stackOn = on; }
    if (!on) return;
    const pin = arrive.map((a) => outCubic(clamp((pos - a + 0.1) / 0.3)));
    const close = outCubic(clamp((pos - closeAt + 0.1) / 0.3));
    const landed = pin.reduce((s, v) => s + v, 0), leave = inCubic(out);
    stack.style.transform = `translate3d(0,${((rows.length - landed) * rowH + (1 - close) * closeH).toFixed(1)}px,0)`;
    rows.forEach((r, i) => {
      const newer = pin.slice(i + 1).reduce((s, v) => s + v, 0);
      r.el.style.setProperty('--p', (pin[i] * (1 - leave)).toFixed(3));
      r.el.style.opacity = (1 - 0.25 * newer).toFixed(3);
      r.line.style.transform = `translate3d(0,${((1 - pin[i]) * 118 - leave * 118).toFixed(2)}%,0)`;
    });
    closingLine.style.transform = `translate3d(0,${((1 - close) * 118 - leave * 118).toFixed(2)}%,0)`;
  }

  /* the race clock, loop counter and distance run with the film */
  const anchors = [];
  shots.forEach((s) => {
    if (s.route) { anchors.push([s.start, 0], [s.end, 0.995]); return; }
    if (s.id === 'open') return;
    if (s.beats) {
      anchors.push([s.start, s.hour]);
      beats.forEach((p, i) => anchors.push([p - 0.02, s.hour + i], [p + 0.1, s.hour + i + 1]));
      anchors.push([s.end, s.hour + beats.length]);
      return;
    }
    anchors.push([s.start, s.hour], [s.end, Math.min(LOOPS, s.hour + 0.13)]);
  });
  const hoursAt = (p, u) => {
    const loop = byId.loop;
    if (p <= loop.end) return u * 0.995;
    for (let i = 1; i < anchors.length; i++) {
      const [a, x] = anchors[i - 1], [b, y] = anchors[i];
      if (p <= b) return x + (y - x) * (b - a > 0 ? ss(a, b, p) : 1);
    }
    return anchors[anchors.length - 1][1];
  };

  const hud = $('#hud'), hudLoop = $('#hudLoop'), hudKm = $('#hudKm'), hudKmD = $('#hudKmD'), hudH = $('#hudH'), hudM = $('#hudM'), hudS = $('#hudS'), hudDot = $('#hudDot');
  $('#hudPath').setAttribute('d', routePath(samples));
  hud.classList.remove('film-only');
  const showBig = createSegments($('#bigDigits'));
  const bigClock = $('#bigClock'), next = $('#next'), cue = $('#cue'), note = $('#routeNote'), railFill = $('#railFill');
  const pad = (n, l = 2) => String(n).padStart(l, '0');

  /* the visitor's own headlamp: pointer parallax and a faint pool of light */
  const ptr = [0, 0, 0.5, 0.5, 0];
  let px = 0, py = 0, pa = 0;
  if (!touch) addEventListener('pointermove', (e) => { px = (e.clientX / innerWidth) * 2 - 1; py = (e.clientY / innerHeight) * 2 - 1; pa = 1; }, { passive: true });

  /* the gate: real loading, then a choice, then the first bell */
  const gate = $('#gate'), gateBar = $('#gateBar'), enterIntro = $('#enterIntro'), gateSound = $('#gateSound');
  let loaded = 0, entered = false, introAt = 0, filmLoading = false;
  const first = [byId.open, byId.loop];
  const need = 5;
  const bump = () => { loaded++; };
  const ready = Promise.allSettled([film.compiled.then(bump), film.load(first[0]).then(bump), film.load(first[1]).then(bump), film.loadRoute().then(bump), document.fonts.ready.then(bump)]);

  /* the rest of the film loads quietly, in the order it will be seen */
  function loadFilm(backwards) {
    if (filmLoading) return;
    filmLoading = true;
    (async () => { for (const s of backwards ? [...shots].reverse() : shots) await film.load(s).catch(() => {}); })();
  }

  /* Registering doesn't wait for the film or pay for it: it only loads if they scroll back up */
  function enter(withSound, toRegister) {
    if (entered) return;
    entered = true;
    gate.classList.add('gone');
    root.classList.remove('locked');
    root.classList.add('running');
    lenis?.start();
    measure();
    introAt = performance.now() - (toRegister ? 3000 : 0);
    if (withSound) toggleSound(true).then(() => sound.bell(0.9));
    if (!toRegister) { loadFilm(false); return; }
    /* the page was locked to one screen, so the smooth scroller has to measure it again first */
    scrollTo(0, registerTop);
    lenis?.resize();
    lenis?.scrollTo(registerTop, { immediate: true, force: true });
  }
  const soundBtn = $('#sound');
  async function toggleSound(on) {
    soundBtn.setAttribute('aria-pressed', String(on));
    if (on) { const p = sound.start(); sound.mix(sceneNow, true); await p; } else sound.stop();
  }
  soundBtn.addEventListener('click', () => {
    const on = soundBtn.getAttribute('aria-pressed') !== 'true';
    toggleSound(on);
    if (on && !sound.once.bell) sound.ready?.then(() => sound.bell(0.5)); else if (on) sound.bell(0.5);
  });
  const wantsSound = () => gateSound.getAttribute('aria-pressed') === 'true';
  gateSound.addEventListener('click', () => gateSound.setAttribute('aria-pressed', String(!wantsSound())));
  enterIntro.addEventListener('click', () => enter(wantsSound(), false));
  $('#enterRegister').addEventListener('click', () => enter(wantsSound(), true));

  /* jumping around: chapters are places on the film, not on the page */
  const target = (hash) => {
    if (hash === '#register') return registerTop;
    if (hash === '#start') return 0;
    if (hash === '#loop') return yOf(byId.loop.start + 0.3);
    if (hash === '#night') return yOf(byId.field.start + 0.02);
    if (hash === '#last') return yOf(byId.last.start + 0.05);
    return null;
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const h = a.getAttribute('href'), y = target(h);
    if (y === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(y, { duration: Math.min(3.2, 1.2 + Math.abs(y - scrollY) / 9000), easing: (t) => 1 - (1 - t) ** 4 });
    else scrollTo({ top: y, behavior: 'smooth' });
  }));

  /* sound and light events */
  addEventListener('lastlap:register', () => sound.bell(0.6));
  document.addEventListener('visibilitychange', () => sound.suspend(document.hidden));
  addEventListener('resize', () => {
    if (touch && Math.abs(canvas.clientWidth - film.w) < 2) return;
    sizeFilm(); measure();
  });

  if (location.hash === '#register') requestAnimationFrame(() => enter(false, true));

  /* the frame */
  let pos = 0, prev = 0, vel = 0, then = performance.now(), gateReady = false, shownPct = 0, sceneNow = 'open', closed = true, lastT = 0, hudOn = -1;
  ready.then((all) => {
    if (all[0].status === 'rejected') throw all[0].reason;
    gateReady = true;
  }).catch(fail);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - then) / 1000);
    then = now;
    lenis?.raf(now);
    film.pump(1);

    if (!entered) {
      shownPct += (loaded / need - shownPct) * 0.12;
      gateBar.style.transform = `scaleX(${shownPct.toFixed(3)})`;
      if (gateReady && shownPct > 0.99 && enterIntro.disabled) enterIntro.disabled = false;
      return;
    }

    const y = scrollY, end = travel;
    if (!filmLoading && y < registerTop - vh * 0.5) loadFilm(true);
    const goal = clamp(y / end) * total, from = pos;
    pos += (goal - pos) * (touch ? 1 - Math.exp(-dt * 11) : 1);
    vel += (((pos - prev) / Math.max(dt, 0.001)) - vel) * 0.18;
    prev = pos;

    const leaving = ss(0, 1, (y - end + vh * 0.55) / (vh * 0.85));
    const gone = y > end + vh * 1.05;

    const intro = clamp((now - introAt) / 3000);
    ptr[0] += (px - ptr[0]) * 0.05; ptr[1] += (py - ptr[1]) * 0.05;
    ptr[2] += ((px + 1) / 2 - ptr[2]) * 0.09; ptr[3] += ((py + 1) / 2 - ptr[3]) * 0.09;
    ptr[4] += (pa - ptr[4]) * 0.04;

    const f = direct(pos, now / 1000, film.w, film.h, vel, ptr, intro);
    const a = f.a, b = f.b;

    for (const s of shots) {
      if (!s.video) continue;
      const active = !gone && !saveData && (s === a || s === b);
      film.video(s, active, !saveData && pos > s.start - 1.7 && pos < s.end + 0.6);
    }

    if (!gone && gateReady) {
      f.fade *= 1 - 0.9 * leaving;
      f.shade = 0.8 * (1 - leaving);
      film.render(f);
      if (intro >= 1) film.govern(dt, now);
    }

    /* words */
    for (const it of items) {
      const pin = it.first ? ss(0.34, 0.92, intro) : clamp((pos - it.i0) / (it.i1 - it.i0));
      paintCopy(it, pin, clamp((pos - it.o0) / (it.o1 - it.o0)));
    }
    paintStack();

    /* the frame around the film */
    const open = byId.open, loop = byId.loop, rain = byId.rain;
    next.style.opacity = (ss(0.5, 0.9, intro) * (1 - ss(open.end, open.end + TRANS * 0.4, pos))).toFixed(3);
    cue.style.opacity = (ss(0.8, 1, intro) * (1 - ss(0.02, 0.16, pos))).toFixed(3);
    note.style.opacity = (ss(loop.start - 0.1, loop.start + 0.3, pos) * (1 - ss(loop.end - 0.2, loop.end + 0.05, pos))).toFixed(3);

    const hours = Math.min(LOOPS, hoursAt(pos, f.routeU));
    const hudO = ss(loop.start - 0.34, loop.start + 0.1, pos) * (1 - ss(rain.start - 0.3, rain.start, pos) * (1 - ss(rain.end, rain.end + 0.3, pos))) * (1 - ss(total - 0.5, total, pos));
    if (Math.abs(hudO - hudOn) > 0.002) { hud.style.opacity = hudO.toFixed(3); hudOn = hudO; }
    if (hudO > 0) {
      const secs = Math.floor(hours * 3600);
      hudLoop.textContent = pad(Math.min(LOOPS, Math.floor(hours) + 1));
      const km = (hours * LOOP_KM).toFixed(1).split('.');
      hudKm.textContent = km[0].padStart(3, '0'); hudKmD.textContent = km[1];
      hudH.textContent = pad(Math.floor(secs / 3600)); hudM.textContent = pad(Math.floor(secs / 60) % 60); hudS.textContent = pad(secs % 60);
      const dot = samples[Math.floor((hours % 1) * (samples.length - 1))];
      hudDot.setAttribute('cx', dot[0].toFixed(0)); hudDot.setAttribute('cy', dot[1].toFixed(0));
    }

    const clockO = ss(rain.start - 0.32, rain.start + 0.02, pos) * (1 - ss(rain.end, rain.end + 0.3, pos));
    bigClock.style.opacity = clockO.toFixed(3);
    if (clockO > 0) { showBig(hours * 3600); bigClock.style.transform = `scale(${(1.04 - 0.04 * ss(rain.start - 0.32, rain.end, pos)).toFixed(4)})`; }
    railFill.style.transform = `scaleY(${clamp(y / registerTop).toFixed(4)})`;

    /* sound */
    const scene = y > end - vh * 0.1 ? 'register' : (f.t > 0.5 && b ? b : a).id;
    sceneNow = scene;
    sound.mix(scene);
    const speed = Math.abs(vel);
    sound.update(now / 1000, { speed, amp: f.amp, slow: scene === 'last' });
    if (f.t > 0.3 && lastT <= 0.3 && speed > 0.22) sound.hit('whoosh', { gain: Math.min(0.6, 0.2 + speed * 0.25), rate: 0.86, room: 0.25 });
    lastT = f.t;
    if (f.routeU > 0.995 && !closed) { closed = true; sound.bell(0.75); } else if (f.routeU < 0.9) closed = false;
    for (const p of beats) if (from < p && pos >= p) sound.bell(0.6);
  }
  requestAnimationFrame(frame);
}
