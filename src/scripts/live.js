/* Race day. From half an hour before the start, the site asks /api/live for the field every
   20 seconds. Once the race is on, the opening shows the real loop and how many are left,
   registration closes, and the field appears with names greying out as runners drop.

   ?live=demo shows it with made-up runners, clearly marked, so it can be checked before race day. */

const $ = (s) => document.querySelector(s);
const pad = (n, l = 2) => String(n).padStart(l, '0');

function demo(start) {
  /* numbered stand-ins, never real names: 48 starters, a few drop each loop */
  const loop = 7;
  const runners = Array.from({ length: 48 }, (_, i) => {
    const h = (i * 2654435761) >>> 0;
    const out = h % 5 === 0 ? 2 + (h % 5) : h % 7 === 0 ? 5 + (h % 2) : null;
    return { name: `RUNNER ${pad(i + 1)}`, bib: i + 1, out: out && out < loop ? out : null };
  });
  return { live: true, demo: true, loop, total: runners.length, left: runners.filter((r) => !r.out).length, runners, start };
}

function render(d) {
  const root = document.documentElement;
  root.classList.add('live');
  const winner = d.loop > 1 && d.left === 1 ? d.runners.find((r) => !r.out) : null;
  const line = winner ? `Last one standing: ${winner.name}.` : `Loop ${pad(d.loop)}. ${d.left} of ${d.total} still running.`;

  $('#liveLoop').textContent = pad(d.loop);
  $('#liveLeft').textContent = String(d.left);
  $('#liveTotal').textContent = String(d.total);
  const gateLine = $('.gate-line'); if (gateLine) gateLine.textContent = `Live now. ${line}`;
  const cta = $('.bar-cta'); cta.textContent = 'Live'; cta.setAttribute('href', '#field');

  $('#fieldLine').textContent = line + (d.demo ? ' Demo data: these are not real runners.' : '');
  const list = $('#fieldList');
  list.replaceChildren(...d.runners.map((r) => {
    const li = document.createElement('li');
    if (r.out) li.className = 'out';
    if (winner && r === winner) li.className = 'won';
    li.innerHTML = `<b></b><span></span><em></em>`;
    li.children[0].textContent = r.bib ? pad(r.bib, 3) : '';
    li.children[1].textContent = r.name;
    li.children[2].textContent = r.out ? `OUT ${pad(r.out)}` : 'RUNNING';
    return li;
  }));
}

export function startLive(start) {
  const isDemo = new URLSearchParams(location.search).get('live') === 'demo';
  if (isDemo) { render(demo(start)); return; }
  const soon = start - 30 * 60 * 1000, end = start + 25 * 3600 * 1000;
  const poll = async () => {
    if (Date.now() > end + 12 * 3600 * 1000) return;
    try {
      const r = await fetch('/api/live', { headers: { Accept: 'application/json' } });
      if (r.ok) { const d = await r.json(); if (d.live) render(d); }
    } catch {}
    setTimeout(poll, document.hidden ? 60000 : 20000);
  };
  const wait = soon - Date.now();
  if (wait <= 0) poll();
  else if (wait < 6 * 3600 * 1000) setTimeout(poll, wait);
}
