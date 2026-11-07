/* Everything that works with or without the film: the countdown, registration, the dare and race day. */
import './register.js';
import './prove.js';
import { startLive } from './live.js';

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
startLive(START);

/* words arrive as they come into view */
const seen = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); seen.unobserve(x.target); } }), { threshold: 0.3 });
document.querySelectorAll('.reveal').forEach((n) => seen.observe(n));

/* The opening choice has to answer at once. On a slow phone the film's code can take a few
   seconds to arrive, so Register now and the sound switch work without it, and the film picks
   up from wherever the visitor is when it does arrive. */
const gateSound = $('#gateSound');
gateSound.addEventListener('click', () => gateSound.setAttribute('aria-pressed', String(gateSound.getAttribute('aria-pressed') !== 'true')));
$('#enterRegister').addEventListener('click', () => {
  if (root.dataset.film === 'on') return;
  root.dataset.entered = 'register';
  root.classList.remove('locked');
  $('#gate').classList.add('gone');
  $('#register').scrollIntoView();
});

/* the film only loads for those who can and want to see it, and steps aside if it can't run */
if (root.classList.contains('film')) {
  const giveUp = (err) => {
    console.error(err);
    root.classList.remove('film', 'locked', 'running');
    document.querySelector('#reel').style.height = '';
  };
  import('./film/app.js').then((m) => m.startFilm(giveUp)).catch(giveUp);
}
