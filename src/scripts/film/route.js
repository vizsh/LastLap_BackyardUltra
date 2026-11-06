/* The illustrative route over the aerial photograph, in its 1600 x 914 space.
   Must match tools/build_route.py, which bakes the same path into route.png. */
export const ROUTE = [[432, 852], [468, 762], [506, 660], [546, 565], [577, 480], [604, 408], [640, 335], [700, 330], [800, 316], [885, 302], [908, 322], [936, 346], [966, 374], [1012, 430], [1066, 520], [1126, 566], [1102, 584], [1062, 590], [1048, 640], [1058, 720], [1088, 782], [960, 790], [830, 796], [640, 798], [545, 806], [478, 838], [432, 852]];
export const PLATE = [1600, 914];
export const HIDDEN = [[[708, 250], [783, 250], [783, 412], [1042, 408], [1032, 765], [722, 765], [714, 412], [708, 410]], [[972, 372], [1132, 372], [1132, 556], [1046, 572], [1042, 400]]];

export function inside(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export function sampleRoute(p = ROUTE, n = 700) {
  const dense = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(i - 1, 0)], b = p[i], c = p[i + 1], e = p[Math.min(i + 2, p.length - 1)];
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    for (let k = 0; k < 40; k++) {
      const t = k / 40, q = 1 - t;
      dense.push([0, 1].map((d) => q * q * q * b[d] + 3 * q * q * t * c1[d] + 3 * q * t * t * c2[d] + t * t * t * c[d]));
    }
  }
  dense.push(p[p.length - 1]);
  const dist = [0];
  for (let i = 1; i < dense.length; i++) dist.push(dist[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const out = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const s = (dist[dist.length - 1] * k) / (n - 1);
    while (j < dense.length - 2 && dist[j + 1] < s) j++;
    out.push(dense[j]);
  }
  return out;
}

export function routePath(samples) {
  return `M${samples.filter((_, i) => i % 6 === 0).map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join('L')}Z`;
}
