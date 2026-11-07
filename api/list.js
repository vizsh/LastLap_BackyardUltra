/* The organisers' copy of the list, as a spreadsheet.

   GET /api/list?token=ADMIN_TOKEN downloads every registration as CSV, in sign-up order.
   It only works once ADMIN_TOKEN is set in Vercel, and only with that token. */
import { ready, redis, send } from './_store.js';

const TOKEN = process.env.ADMIN_TOKEN;
const cell = (v) => {
  const t = v === null || v === undefined ? '' : String(v);
  /* a leading = + - @ would run as a formula in a spreadsheet */
  const safe = /^[=+\-@]/.test(t) ? `'${t}` : t;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export default async function handler(req, res) {
  const given = new URL(req.url, 'http://x').searchParams.get('token') || '';
  if (!TOKEN || given.length !== TOKEN.length || given !== TOKEN) return send(res, 401, { error: 'token' });
  if (!ready()) return send(res, 503, { error: 'not-open' });
  try {
    const emails = (await redis('LRANGE', 'lastlap:order', '0', '-1')) || [];
    const rows = emails.length ? await redis('MGET', ...emails.map((e) => `lastlap:runner:${e}`)) : [];
    const head = ['bib', 'name', 'email', 'status', 'waitlist', 'registered', 'achievement', 'dare', 'invited_by', 'invites'];
    const lines = [head.join(',')];
    emails.forEach((email, i) => {
      if (!rows[i] || rows[i] === 'pending') return;
      const r = JSON.parse(rows[i]);
      lines.push([r.bib, r.name, email, r.status, r.position, r.at, r.feat, r.dare, r.invitedBy, (r.invites || []).join(' ')].map(cell).join(','));
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="lastlap-list.csv"');
    res.setHeader('Cache-Control', 'no-store');
    res.end('﻿' + lines.join('\n'));
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: 'server' });
  }
}
