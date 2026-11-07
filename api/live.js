/* Race day. GET /api/live reports the field while the race is on.

   The organisers keep a Google Sheet with one row per runner: a "name" column, optionally
   "bib", and an "out" column holding the loop a runner failed to finish (blank while they are
   still running). Publish it with File > Share > Publish to web as CSV, and set that link as
   LIVE_SHEET_CSV in Vercel. The loop number comes from the clock, not the sheet. */
import { START, send } from './_store.js';

const SHEET = process.env.LIVE_SHEET_CSV;

function parse(csv) {
  const rows = [];
  for (const line of csv.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = []; let cell = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) { if (ch === '"' && line[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { cells.push(cell); cell = ''; } else cell += ch;
    }
    cells.push(cell); rows.push(cells.map((c) => c.trim()));
  }
  return rows;
}

export default async function handler(req, res) {
  if (!SHEET) return send(res, 404, { live: false });
  try {
    const r = await fetch(SHEET, { headers: { 'Cache-Control': 'no-cache' } });
    const [head = [], ...rows] = parse(await r.text());
    const col = (n) => head.findIndex((h) => h.toLowerCase().startsWith(n));
    const ni = col('name'), bi = col('bib'), oi = col('out');
    const runners = rows.filter((c) => c[ni]).map((c) => ({ name: c[ni].slice(0, 22), bib: bi >= 0 ? parseInt(c[bi], 10) || null : null, out: oi >= 0 ? parseInt(c[oi], 10) || null : null }));
    const loop = Math.max(0, Math.min(24, Math.floor((Date.now() - START) / 3600000) + 1));
    return send(res, 200, { live: true, loop, total: runners.length, left: runners.filter((x) => !x.out).length, runners }, 's-maxage=15, stale-while-revalidate=30');
  } catch (e) {
    console.error(e);
    return send(res, 502, { live: false });
  }
}
