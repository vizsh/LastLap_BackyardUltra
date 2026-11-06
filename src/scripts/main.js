/* Everything that works with or without the film: the live clock, the reservation form and the bib. */
const $ = (s) => document.querySelector(s);
const root = document.documentElement;

/* the clock always counts to the next real hour in Mumbai */
const clockM = $('#clockM'), clockS = $('#clockS');
let lastLeft = null;
function tick() {
  const ist = new Date(Date.now() + 19800000);
  const left = 3600 - (ist.getUTCMinutes() * 60 + ist.getUTCSeconds());
  clockM.textContent = String(Math.floor(left / 60) % 60).padStart(2, '0');
  clockS.textContent = String(left % 60).padStart(2, '0');
  if (lastLeft !== null && left > lastLeft) dispatchEvent(new Event('lastlap:hour'));
  lastLeft = left;
}
tick(); setInterval(tick, 1000);

/* reservation: real when an endpoint is configured, honest when it is not */
const ENDPOINT = import.meta.env.PUBLIC_LIST_ENDPOINT;
const form = $('#list'), email = $('#email'), nameEl = $('#name'), msg = $('#listMsg'), bibName = $('#bibName');
const btn = form.querySelector('button');
const say = (t, bad = false) => { msg.textContent = t; msg.classList.toggle('err', bad); };
email.addEventListener('input', () => { say(''); email.removeAttribute('aria-invalid'); });
nameEl.addEventListener('input', () => {
  const v = nameEl.value.trim().toUpperCase();
  bibName.textContent = v || 'YOUR NAME';
  bibName.style.fontSize = v.length > 13 ? 'clamp(1.5rem, 3.4vw, 2.9rem)' : '';
});
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    say('Enter a valid email address.', true); email.setAttribute('aria-invalid', 'true'); email.focus(); return;
  }
  dispatchEvent(new Event('lastlap:reserve'));
  if (!ENDPOINT) { say("Reservations aren't open yet, so this wasn't saved."); return; }
  btn.disabled = true; say('Reserving...');
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

/* words and bib arrive as they come into view */
const seen = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); seen.unobserve(x.target); } }), { threshold: 0.3 });
document.querySelectorAll('.reveal, .bib-stage').forEach((n) => seen.observe(n));

/* the bib tilts toward the visitor, under a headlamp that follows them or drifts by itself */
const stage = $('#bibStage'), bib = $('#bib');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!still) {
  let tx = 0, ty = 0, cx = 0, cy = 0, live = false, lastMove = 0;
  $('#reserve').addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width * 0.8)));
    ty = Math.max(-1, Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height * 0.8)));
    lastMove = performance.now();
  }, { passive: true });
  const spin = (now) => {
    if (!live) return;
    if (now - lastMove > 2200) { tx = Math.sin(now / 2600) * 0.55; ty = Math.cos(now / 3300) * 0.4; }
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    bib.style.setProperty('--ry', `${(-3 + cx * 9).toFixed(2)}deg`);
    bib.style.setProperty('--rx', `${(4 - cy * 7).toFixed(2)}deg`);
    bib.style.setProperty('--lx', `${(50 + cx * 34).toFixed(1)}%`);
    bib.style.setProperty('--ly', `${(46 + cy * 34).toFixed(1)}%`);
    requestAnimationFrame(spin);
  };
  new IntersectionObserver(([x]) => { live = x.isIntersecting; if (live) requestAnimationFrame(spin); }).observe(stage);
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
