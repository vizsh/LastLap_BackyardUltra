/* Putting a name down.

   GET  /api/register        the state of the field: open, invite (nearly full) or full
   POST /api/register        { name, email, feat, dare, invite } puts a name on the list

   Every runner gets a bib number in the order they register, and two invite codes for friends.
   If FIELD_CAP is set, the field closes to the public at INVITE_ONLY_AT places (85% of the cap
   unless set), after which only an unused invite code gets a place. Everyone else, and everyone
   after the cap, joins the waitlist in order. Without FIELD_CAP there is no limit and no
   waitlist. Without a database this answers 503 and the site says nothing was saved. */
import { ready, redis, send, readBody } from './_store.js';

const CAP = parseInt(process.env.FIELD_CAP || '0', 10) || 0;
const OPEN_UNTIL = CAP ? Math.min(CAP, parseInt(process.env.INVITE_ONLY_AT || '0', 10) || Math.floor(CAP * 0.85)) : 0;
const K = (s) => `lastlap:${s}`;

/* claims the email, then a bib or a waitlist place, in one step so two runners never share a number */
const CLAIM = `
local existing = redis.call('GET', KEYS[1])
if existing then return {'exists', existing} end
redis.call('SET', KEYS[1], 'pending')
local taken = tonumber(redis.call('GET', KEYS[2]) or '0')
local cap, openUntil = tonumber(ARGV[1]), tonumber(ARGV[2])
local status = 'listed'
if cap > 0 then
  if taken >= cap then status = 'waitlist'
  elseif taken >= openUntil then
    local owner = redis.call('GET', KEYS[3])
    if owner and owner ~= 'used' then redis.call('SET', KEYS[3], 'used') else status = 'waitlist' end
  end
end
if status == 'listed' then return {'listed', tostring(redis.call('INCR', KEYS[2]))} end
return {'waitlist', tostring(redis.call('INCR', KEYS[4]))}
`;

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHABET[b % ALPHABET.length]).join('');

async function state() {
  const taken = parseInt((await redis('GET', K('bibs'))) || '0', 10);
  const s = !CAP ? 'open' : taken >= CAP ? 'full' : taken >= OPEN_UNTIL ? 'invite' : 'open';
  return CAP ? { state: s, taken, cap: CAP } : { state: s };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (!ready()) return send(res, 503, { error: 'not-open' });
  try {
    if (req.method === 'GET') return send(res, 200, await state());
    if (req.method !== 'POST') return send(res, 405, { error: 'method' });

    const b = await readBody(req);
    if (b.company) return send(res, 200, { status: 'listed' }); // a bot filled the hidden field
    const email = String(b.email || '').trim().toLowerCase().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: 'email' });
    const name = String(b.name || '').trim().slice(0, 22);
    const feat = String(b.feat || '').trim().slice(0, 140);
    const dare = Math.max(0, Math.min(24, parseInt(b.dare, 10) || 0));
    const invite = String(b.invite || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

    const [kind, value] = await redis('EVAL', CLAIM, '4', K(`runner:${email}`), K('bibs'), K(`invite:${invite || '-'}`), K('waitlist'), String(CAP), String(OPEN_UNTIL));
    if (kind === 'exists') {
      if (value === 'pending') return send(res, 409, { error: 'busy' });
      /* anyone can type anyone's email, so a repeat confirms the place but never hands out the invites */
      const r = JSON.parse(value);
      return send(res, 200, { name: r.name, status: r.status, bib: r.bib, position: r.position, again: true });
    }

    const record = { name, status: kind, at: new Date().toISOString(), feat, dare, invitedBy: invite || null };
    if (kind === 'listed') {
      record.bib = parseInt(value, 10);
      record.invites = [];
      while (record.invites.length < 2) {
        const c = code();
        if (await redis('SET', K(`invite:${c}`), email, 'NX')) record.invites.push(c);
      }
    } else record.position = parseInt(value, 10);

    await redis('SET', K(`runner:${email}`), JSON.stringify(record));
    await redis('RPUSH', K('order'), email);
    const { at, feat: _f, invitedBy: _i, ...open } = record;
    return send(res, 200, open);
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: 'server' });
  }
}
