/* Registration: the poster, the form and what comes after it.

   The words stand on the horizon of the photograph, behind the runner, and the visitor's name
   replaces them as they type. Putting a name down gets a bib number in sign-up order and two
   invite codes. When the field is nearly full the form turns into a waitlist that only an
   invite code gets past. All of that needs the list to be connected; until it is, the form
   says so and the poster still works. */
import { me, remember } from './me.js';
import { sharePoster } from './poster.js';

const $ = (s) => document.querySelector(s);
const pad3 = (n) => String(n).padStart(3, '0');

/* the poster on the page */
const art = $('#entryArt'), entry = $('#entry'), giant = $('#giant'), [lineA, lineB] = giant.querySelectorAll('.ln > span');
const portrait = matchMedia('(max-aspect-ratio: 9/10)');
const SAID = ['Not for', 'everyone.'];

/* break a name where its two lines come out closest in length */
export function split(name) {
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

function showName(value) {
  const v = value.trim().toUpperCase();
  const [a, b] = v ? split(v) : SAID;
  lineA.textContent = a; lineB.textContent = b;
  giant.classList.toggle('named', !!v);
  fitGiant();
}

/* registration: real when the list is connected, honest when it is not */
const ENDPOINT = import.meta.env.PUBLIC_LIST_ENDPOINT || '/api/register';
const form = $('#list'), email = $('#email'), nameEl = $('#name'), msg = $('#listMsg');
const inviteField = $('#inviteField'), inviteEl = $('#invite'), fieldState = $('#fieldState');
const go = form.querySelector('.go'), savePoster = $('#savePoster');
const done = $('#done'), doneLabel = $('#doneLabel'), doneBib = $('#doneBib'), doneLine = $('#doneLine');
const invites = $('#invites'), inviteList = $('#inviteList');
const say = (t, bad = false) => { msg.textContent = t; msg.classList.toggle('err', bad); };
let field = { state: 'off' };

const invited = new URLSearchParams(location.search).get('invite');
if (invited) { inviteEl.value = invited.toUpperCase().slice(0, 8); remember({ invite: inviteEl.value }); }
else if (me.invite) inviteEl.value = me.invite;

function label() {
  const code = inviteEl.value.trim();
  go.textContent = field.state === 'full' ? 'Join the waitlist'
    : field.state === 'invite' ? (code ? 'Use my invite' : 'Join the waitlist')
    : 'Put my name down';
}

function showField() {
  const closing = field.state === 'invite' || field.state === 'full';
  inviteField.hidden = !(closing || inviteEl.value);
  form.classList.toggle('with-invite', !inviteField.hidden);
  if (field.cap) {
    fieldState.hidden = false;
    fieldState.innerHTML = `<b>${field.taken}</b> of <b>${field.cap}</b> places taken. `
      + (field.state === 'full' ? 'The field is full. The waitlist is open.' : field.state === 'invite' ? 'From here, only an invite code gets a place.' : 'It closes when it is full.');
  } else fieldState.hidden = true;
  label();
}

fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
  .then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.state) { field = j; showField(); } })
  .catch(() => {});

function shareInvite(code, button) {
  const url = `${location.origin}/?invite=${code}#register`;
  const text = 'I put my name down for LastLap. 6.706 km every hour, up to 24 loops. Here is one of my two invites. I dare you.';
  if (navigator.share) navigator.share({ title: 'LastLap invite', text, url }).catch(() => {});
  else navigator.clipboard?.writeText(`${text} ${url}`).then(() => { button.textContent = 'Copied'; setTimeout(() => { button.textContent = 'Send'; }, 1800); });
}

/* after the name goes down: the bib, the invites, the poster */
function showDone() {
  if (!me.status) return;
  form.hidden = true; done.hidden = false;
  if (me.status === 'listed') {
    doneLabel.textContent = me.again ? 'ALREADY IN' : "YOU'RE IN";
    doneBib.textContent = me.bib ? `BIB ${pad3(me.bib)}` : 'ON THE LIST';
    doneLine.textContent = me.bib ? `Bib ${me.bib} is yours, in the order names went down. Nobody can take it.` : 'Your name is on the list.';
  } else {
    doneLabel.textContent = 'WAITLIST';
    doneBib.textContent = `${pad3(me.position || 0)} IN LINE`;
    doneLine.textContent = 'The places are gone. If one comes back, it goes to the next name in line.';
  }
  inviteList.replaceChildren(...(me.invites || []).map((c) => {
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = c;
    const s = document.createElement('button'); s.type = 'button'; s.textContent = 'Send';
    s.addEventListener('click', () => shareInvite(c, s));
    li.append(b, s); return li;
  }));
  invites.hidden = !(me.invites && me.invites.length);
}

nameEl.addEventListener('input', () => { showName(nameEl.value); savePoster.hidden = !nameEl.value.trim(); });
email.addEventListener('input', () => { say(''); email.removeAttribute('aria-invalid'); });
inviteEl.addEventListener('input', () => { inviteEl.value = inviteEl.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); label(); });
giant.addEventListener('click', () => nameEl.focus());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    say('Enter a valid email address.', true); email.setAttribute('aria-invalid', 'true'); email.focus(); return;
  }
  dispatchEvent(new Event('lastlap:register'));
  remember({ name: nameEl.value.trim() });
  go.disabled = true; say('Putting your name down...');
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value, name: nameEl.value.trim(), feat: me.feat || '', dare: me.dare || 0, invite: inviteEl.value.trim(), company: form.company.value }),
    });
    if (r.status === 503 || r.status === 404 || r.status === 405) { say("Registration isn't open yet, so this wasn't saved. Your poster still works. Call us below for more."); return; }
    if (r.status === 400) { say('Enter a valid email address.', true); return; }
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    remember({ status: j.status, bib: j.bib || null, position: j.position || null, invites: j.invites || me.invites || [], again: !!j.again, name: j.name || nameEl.value.trim() });
    say(''); showDone();
  } catch {
    say("That didn't go through. Try again.", true);
  } finally {
    go.disabled = false;
  }
});

async function poster(button) {
  const was = button.textContent;
  button.disabled = true; button.textContent = 'Making your poster...';
  try {
    const how = await sharePoster({ name: nameEl.value.trim() || me.name || '', bib: me.status === 'listed' ? me.bib : null, dare: me.dare || 0 });
    button.textContent = how === 'saved' ? 'Saved' : was;
  } catch { button.textContent = "Couldn't make it. Try again"; }
  setTimeout(() => { button.textContent = was; button.disabled = false; }, 1800);
}
savePoster.addEventListener('click', () => poster(savePoster));
$('#donePoster').addEventListener('click', (e) => poster(e.currentTarget));

/* a returning runner gets their own name and bib back */
if (me.name && !nameEl.value) { nameEl.value = me.name; savePoster.hidden = false; }
showName(nameEl.value);
showDone();
addEventListener('resize', fitGiant);
document.fonts?.ready.then(fitGiant);

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
