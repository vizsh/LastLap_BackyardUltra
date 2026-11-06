/* Full-screen race clock prop for shoots and race night. Keeps time from the system clock, so it never drifts. */
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY = 'lastlap-clock';
const MAP = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];

/* seven-segment digits, like a real race clock */
const SEGS = {
  a: '10,0 62,0 72,8 62,16 10,16 2,8', d: '10,134 62,134 72,142 62,150 10,150 2,142', g: '10,67 62,67 72,75 62,83 10,83 2,75',
  f: '0,10 8,2 16,12 16,62 8,70 0,62', b: '56,12 64,2 72,10 72,62 64,70 56,62',
  e: '0,88 8,80 16,88 16,138 8,148 0,140', c: '56,88 64,80 72,88 72,140 64,148 56,138',
};
const svg = $('#digits'), NS = 'http://www.w3.org/2000/svg';
const digits = [];
const X = [0, 90, 280, 370, 560, 650];
X.forEach((x) => {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${x + 40} 10)`);
  const parts = {};
  for (const [k, pts] of Object.entries(SEGS)) {
    const p = document.createElementNS(NS, 'polygon');
    p.setAttribute('points', pts); p.setAttribute('class', 'seg');
    g.append(p); parts[k] = p;
  }
  svg.append(g); digits.push({ parts, value: -1 });
});
[210, 490].forEach((x) => [52, 112].forEach((y) => {
  const c = document.createElementNS(NS, 'rect');
  c.setAttribute('x', x); c.setAttribute('y', y); c.setAttribute('width', 16); c.setAttribute('height', 16); c.setAttribute('class', 'dot');
  svg.append(c);
}));

function show(total) {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600) % 100, m = Math.floor(t / 60) % 60, s = t % 60;
  [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10].forEach((v, i) => {
    const d = digits[i];
    if (d.value === v) return;
    d.value = v;
    for (const k of 'abcdefg') d.parts[k].classList.toggle('on', MAP[v].includes(k));
  });
  svg.setAttribute('aria-label', `Race clock ${String(h).padStart(2, '0')} hours ${String(m).padStart(2, '0')} minutes`);
}

/* state survives a refresh, so a running clock carries on */
let state = { base: 0, started: null };
try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { /* first run */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };
const elapsed = () => state.base + (state.started ? (Date.now() - state.started) / 1000 : 0);

let lastHour = Math.floor(elapsed() / 3600), rolling = false, timer;
function tick() {
  clearTimeout(timer);
  if (rolling) return;
  const e = elapsed();
  show(e);
  const hour = Math.floor(e / 3600);
  if (hour !== lastHour) {
    if (hour > lastHour && state.started && !reduced) { const b = $('#board'); b.classList.remove('hour'); void b.offsetWidth; b.classList.add('hour'); }
    lastHour = hour;
  }
  if (state.started) timer = setTimeout(tick, 1000 - (e * 1000) % 1000 + 4);
}

/* moving to a new time rolls there smoothly, instead of jumping */
function goTo(total) {
  const from = elapsed(), running = !!state.started;
  state = { base: total, started: running ? Date.now() : null }; save();
  lastHour = Math.floor(total / 3600);
  if (reduced) { tick(); return; }
  rolling = true;
  const t0 = performance.now(), D = 900;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / D), e = 1 - (1 - k) ** 4;
    show(from + (total - from) * e);
    if (k < 1) requestAnimationFrame(step); else { rolling = false; tick(); }
  };
  requestAnimationFrame(step);
}

/* keep the screen awake while running */
let lock = null;
async function wake(on) {
  try {
    if (on && !lock && 'wakeLock' in navigator) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); }
    if (!on && lock) { await lock.release(); lock = null; }
  } catch { /* not supported or refused */ }
}

const run = $('#run'), board = $('#board');
function paint() {
  run.textContent = state.started ? 'Pause' : 'Start';
  board.classList.toggle('paused', !state.started);
}
function toggle() {
  if (state.started) state = { base: elapsed(), started: null };
  else state = { base: state.base, started: Date.now() };
  save(); paint(); wake(!!state.started); tick();
}
const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());

run.addEventListener('click', toggle);
$('#reset').addEventListener('click', () => goTo(0));
$('#full').addEventListener('click', fullscreen);
document.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.preset)));
const num = (id, max) => Math.min(max, Math.max(0, parseInt($(id).value, 10) || 0));
$('#set').addEventListener('submit', (e) => { e.preventDefault(); goTo(num('#h', 99) * 3600 + num('#m', 59) * 60 + num('#s', 59)); });

addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); }
  if (e.key === 'r') goTo(0);
  if (e.key === 'f') fullscreen();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (state.started) wake(true); tick(); } });

/* the controls fade away so only the clock is on camera */
let idle;
function awake() {
  document.body.classList.remove('idle');
  clearTimeout(idle);
  idle = setTimeout(() => { if (!$('#panel').contains(document.activeElement) || document.activeElement === document.body || document.activeElement.tagName === 'BUTTON') document.body.classList.add('idle'); }, 3000);
}
['pointermove', 'pointerdown', 'keydown'].forEach((t) => addEventListener(t, awake, { passive: true }));

paint(); tick(); awake();
if (state.started) wake(true);
