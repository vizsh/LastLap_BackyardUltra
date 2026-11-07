/* Prove it: the visitor types their biggest running achievement and the race answers, then
   dares them to a number of loops. Accepting the dare puts it on their poster and goes with
   their registration. */
import { judge, LOOP_KM } from './dare.js';
import { me, remember } from './me.js';

const $ = (s) => document.querySelector(s);
const formEl = $('#proveForm'), feat = $('#feat'), verdict = $('#verdict');
const jab = $('#jab'), truth = $('#truth'), count = $('#dareN'), unit = $('#dareUnit'), math = $('#dareMath');
const take = $('#takeDare'), again = $('#againDare');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
let current = null, run = 0;

function show(text) {
  current = judge(text);
  const { dare, jab: j, truth: t } = current;
  jab.textContent = j; truth.textContent = t;
  unit.textContent = dare === 1 ? 'loop.' : 'loops.';
  math.textContent = `${(dare * LOOP_KM).toFixed(1)} km. ${dare} hour${dare > 1 ? 's' : ''}. ${dare} bell${dare > 1 ? 's' : ''}.`;
  take.textContent = me.dare === dare ? 'Dare accepted' : 'Accept the dare';
  verdict.hidden = false;
  verdict.classList.remove('in');
  void verdict.offsetWidth;
  verdict.classList.add('in');
  /* the loops count up like the race clock, one bell at a time */
  const id = ++run;
  if (still) { count.textContent = String(dare); return; }
  let n = 0;
  const step = () => {
    if (id !== run) return;
    count.textContent = String(++n);
    if (n < dare) setTimeout(step, Math.max(28, 340 / dare));
  };
  setTimeout(step, 520);
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  remember({ feat: feat.value.trim().slice(0, 140) });
  show(feat.value);
});

take.addEventListener('click', () => {
  if (!current) return;
  remember({ dare: current.dare });
  take.textContent = 'Dare accepted';
  dispatchEvent(new Event('lastlap:dare'));
  /* someone who hasn't put their name down yet is sent to do it */
  if (!me.status) {
    document.querySelector('#register').scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
    setTimeout(() => $('#name').focus({ preventScroll: true }), 700);
  }
});
again.addEventListener('click', () => { verdict.hidden = true; feat.value = ''; feat.focus(); });

if (me.feat) { feat.value = me.feat; show(me.feat); }
