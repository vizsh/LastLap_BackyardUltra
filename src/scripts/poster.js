/* The shareable poster: a phone story, 1080 x 1920, drawn from the same three layers as the
   registration section. Photograph, then the name, then the runner and land cut from that
   photograph, so the name stands in the sky behind them. Everything is drawn here, on the
   visitor's phone. Nothing is uploaded. */

const W = 1080, H = 1920, HORIZON = 0.6 * H, ZOOM = 1.32;

const load = (src) => new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src; });

function split(name) {
  const words = name.split(/\s+/);
  if (words.length < 2) return [name];
  let best = 1, gap = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < gap) { gap = d; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/* the photograph zooms about the horizon, exactly as it does on the site */
function plate(ctx, img) {
  ctx.save();
  ctx.translate(0, HORIZON); ctx.scale(ZOOM, ZOOM); ctx.translate(0, -HORIZON);
  ctx.drawImage(img, 0, 0, W, H);
  ctx.restore();
}

function display(ctx, size, weight = 800) {
  ctx.font = `${weight} ${size}px Anek, sans-serif`;
  if ('fontStretch' in ctx) ctx.fontStretch = 'condensed';
}

export async function makePoster({ name, bib, dare }) {
  await Promise.all([document.fonts.load('800 100px Anek'), document.fonts.load('900 40px Doto')]);
  const [bg, fg, logo, grain] = await Promise.all(['/media/last-m.webp', '/media/last-m-fg.webp', '/brand/lastlap-logo-alpha.webp', '/media/grain.png'].map(load));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  plate(ctx, bg);

  /* the name, fitted to the sky and standing on the horizon */
  const lines = split((name || 'NOT FOR EVERYONE').toUpperCase());
  display(ctx, 100);
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const size = Math.min(380, (W - 140) / widest * 100, 760 / (lines.length * 0.92));
  display(ctx, size);
  ctx.fillStyle = '#f1f3f5'; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => ctx.fillText(l, 70, HORIZON + size * 0.1 - (lines.length - 1 - i) * size * 0.92));

  plate(ctx, fg);

  /* a dark foot for the details, then grain over everything, like the site */
  const g = ctx.createLinearGradient(0, H * 0.64, 0, H);
  g.addColorStop(0, 'rgba(7,3,4,0)'); g.addColorStop(0.35, 'rgba(7,3,4,.9)'); g.addColorStop(1, '#070304');
  ctx.fillStyle = g; ctx.fillRect(0, H * 0.64, W, H * 0.36);
  const top = ctx.createLinearGradient(0, 0, 0, 340);
  top.addColorStop(0, 'rgba(7,3,4,.85)'); top.addColorStop(1, 'rgba(7,3,4,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 0, W, 340);

  ctx.drawImage(logo, 54, 54, 230, 230);

  let y = 1500;
  if (bib) {
    ctx.font = '900 46px Doto, monospace'; ctx.fillStyle = '#ff8a7e';
    ctx.fillText('BIB', 70, y - 80);
    ctx.font = '900 150px Doto, monospace'; ctx.fillStyle = '#ff3b2b';
    ctx.shadowColor = 'rgba(255,59,43,.5)'; ctx.shadowBlur = 30;
    ctx.fillText(String(bib).padStart(3, '0'), 70, y + 50);
    ctx.shadowBlur = 0;
    y += 150;
  }
  display(ctx, 104); ctx.fillStyle = '#f1f3f5';
  ctx.fillText(bib ? 'I put my name down.' : 'Not for everyone.', 70, y);
  y += 80;
  if (dare) {
    ctx.font = '900 40px Doto, monospace'; ctx.fillStyle = '#ff3b2b';
    ctx.fillText(`DARED TO ${dare} LOOP${dare > 1 ? 'S' : ''}`, 70, y);
    y += 64;
  }
  ctx.font = '900 34px Doto, monospace'; ctx.fillStyle = '#ff8a7e';
  ctx.fillText('2 JAN 2027', 70, y);
  ctx.fillStyle = '#a9b6c9';
  ctx.fillText('TENTATIVE', 70 + ctx.measureText('2 JAN 2027  ').width, y);
  ctx.font = '500 36px Anek, sans-serif'; if ('fontStretch' in ctx) ctx.fontStretch = 'normal';
  ctx.fillText('Thakur Village, Mumbai.', 70, y + 64);

  ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.09;
  ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  return new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.9));
}

/* share it where the phone can, save it where it can't */
export async function sharePoster(opts) {
  const blob = await makePoster(opts);
  const file = new File([blob], 'lastlap-poster.jpg', { type: 'image/jpeg' });
  /* a phone opens its share sheet, straight to a story; a computer just gets the file */
  const phone = matchMedia('(pointer: coarse)').matches;
  if (phone && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'LastLap', text: 'Not for everyone. LastLap, Thakur Village, Mumbai.' }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = file.name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'saved';
}
