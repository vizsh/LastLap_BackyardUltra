/* What this visitor has told us, kept on their own device so a returning runner sees their
   bib, their invites and their dare again. Nothing here leaves the browser except through the form. */
const KEY = 'lastlap:me';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch {}

export const me = saved;
export function remember(patch) {
  Object.assign(me, patch);
  try { localStorage.setItem(KEY, JSON.stringify(me)); } catch {}
  dispatchEvent(new Event('lastlap:me'));
}
