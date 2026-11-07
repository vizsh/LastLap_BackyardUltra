/* Everything that works with or without the film: the countdown, the registration form and the poster. */
const $ = (s) => document.querySelector(s);
const root = document.documentElement;

/* The date is tentative and no start time is set, so this counts to the first minute of the 2nd in Mumbai. */
const START = Date.parse('2027-01-02T00:00:00+05:30');
const two = (n) => String(Math.floor(n)).padStart(2, '0');
const clocks = [...document.querySelectorAll('[data-count]')].map((el) => ['d', 'h', 'm', 's'].map((k) => el.querySelector(`[data-u="${k}"]`)));
function tick() {
  const left = Math.max(0, Math.floor((START - Date.now()) / 1000));
  const parts = [left / 86400, (left / 3600) % 24, (left / 60) % 60, left % 60].map(two);
  clocks.forEach((clock) => clock.forEach((n, i) => { if (n.textContent !== parts[i]) n.textContent = parts[i]; }));
}
tick(); setInterval(tick, 1000);

/* The poster: the words stand on the horizon of the photograph, behind the runner, and the
   visitor's name replaces them as they type. It's a poster of them, so it should fill the sky. */
const entry = $('#entry'), art = $('#entryArt'), giant = $('#giant'), [lineA, lineB] = giant.querySelectorAll('.ln > span');
const portrait = matchMedia('(max-aspect-ratio: 9/10)');
const SAID = ['Not for', 'everyone.'];

/* break a name where its two lines come out closest in length */
function split(name) {
  const words = name.split(/\s+/);
  if (words.length < 2) return [name, ''];
  let best = 1, gap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < gap) { gap = d; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

function fitGiant() {
  const W = art.clientWidth, H = art.clientHeight;
  /* where the horizon lands once the photograph has been fitted to cover this box */
  const tall = portrait.matches, ratio = tall ? 0.5625 : 1.751, horizon = tall ? 0.6 : 0.625;
  const bw = W * 1.04, bh = H * 1.04, ih = Math.max(bh, bw / ratio);
  const line = (bh - ih) / 2 - H * 0.02 + ih * horizon;
  /* the photograph zooms about the horizon, so the land stays where the words stand on it */
  art.style.setProperty('--oy', `${(line + H * 0.02).toFixed(1)}px`);

  giant.style.fontSize = '100px';
  const rows = lineB.textContent ? 2 : 1;
  lineB.parentElement.style.display = rows === 2 ? '' : 'none';
  const widest = Math.max(lineA.offsetWidth, lineB.offsetWidth, 1);
  /* the invitation has to be read whole, so it stops short of the runner; a name runs behind them */
  const reach = giant.classList.contains('named') ? giant.clientWidth : W * (tall ? 0.6 : 0.57) - giant.offsetLeft;
  /* on a phone the sun sits right above the words, and the words have to stay readable */
  const room = tall ? (horizon - 0.456) * ih * 1.32 : line - Math.min(96, H * 0.11);
  const size = Math.min((reach / widest) * 100, room / (rows * 0.92), H * 0.3);
  giant.style.fontSize = `${size.toFixed(1)}px`;
  giant.style.bottom = `${(H - line - size * 0.07).toFixed(1)}px`;
}
fitGiant();
addEventListener('resize', fitGiant);
document.fonts?.ready.then(fitGiant);

/* registration: real when an endpoint is configured, honest when it is not */
const ENDPOINT = import.meta.env.PUBLIC_LIST_ENDPOINT;
const form = $('#list'), email = $('#email'), nameEl = $('#name'), msg = $('#listMsg');
const btn = form.querySelector('button');
const say = (t, bad = false) => { msg.textContent = t; msg.classList.toggle('err', bad); };
email.addEventListener('input', () => { say(''); email.removeAttribute('aria-invalid'); });
nameEl.addEventListener('input', () => {
  const v = nameEl.value.trim().toUpperCase();
  const [a, b] = v ? split(v) : SAID;
  lineA.textContent = a; lineB.textContent = b;
  giant.classList.toggle('named', !!v);
  fitGiant();
});
giant.addEventListener('click', () => nameEl.focus());
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    say('Enter a valid email address.', true); email.setAttribute('aria-invalid', 'true'); email.focus(); return;
  }
  dispatchEvent(new Event('lastlap:register'));
  if (!ENDPOINT) { say("Registration isn't open yet, so this wasn't saved. Call us below for more."); return; }
  btn.disabled = true; say('Putting your name down...');
  try {
    const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value, name: nameEl.value.trim() }) });
    if (!r.ok) throw new Error(String(r.status));
    say("You're on the list."); form.reset();
  } catch {
    say("That didn't go through. Try again.", true);
  } finally {
    btn.disabled = false;
  }
});

/* words arrive as they come into view */
const seen = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); seen.unobserve(x.target); } }), { threshold: 0.3 });
document.querySelectorAll('.reveal').forEach((n) => seen.observe(n));

/* The words sit in the sky, so they drift against the land. The two photographic layers have
   to stay locked together, or the runner would show a double edge. */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let tx = 0, ty = 0, cx = 0, cy = 0, live = false, lastMove = -1e9;
  entry.addEventListener('pointermove', (e) => {
    const r = entry.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    lastMove = performance.now();
  }, { passive: true });
  const drift = (now) => {
    if (!live) return;
    if (now - lastMove > 2600) { tx = Math.sin(now / 4300) * 0.5; ty = Math.cos(now / 5900) * 0.3; }
    cx += (tx - cx) * 0.045; cy += (ty - cy) * 0.045;
    entry.style.setProperty('--px', cx.toFixed(3));
    entry.style.setProperty('--py', cy.toFixed(3));
    requestAnimationFrame(drift);
  };
  new IntersectionObserver(([x]) => { live = x.isIntersecting; if (live) requestAnimationFrame(drift); }).observe(entry);
}

/* the film only loads for those who can and want to see it, and steps aside if it can't run */
if (root.classList.contains('film')) {
  const giveUp = (err) => {
    console.error(err);
    root.classList.remove('film', 'locked', 'running');
    document.querySelector('#reel').style.height = '';
  };
  import('./film/app.js').then((m) => m.startFilm(giveUp)).catch(giveUp);
}
