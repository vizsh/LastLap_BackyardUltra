/* Seven-segment digits, shared by the race clock page and the film's big clock. */
const MAP = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const SEGS = {
  a: '10,0 62,0 72,8 62,16 10,16 2,8', d: '10,134 62,134 72,142 62,150 10,150 2,142', g: '10,67 62,67 72,75 62,83 10,83 2,75',
  f: '0,10 8,2 16,12 16,62 8,70 0,62', b: '56,12 64,2 72,10 72,62 64,70 56,62',
  e: '0,88 8,80 16,88 16,138 8,148 0,140', c: '56,88 64,80 72,88 72,140 64,148 56,138',
};
const NS = 'http://www.w3.org/2000/svg';

export function createSegments(svg) {
  const digits = [];
  [0, 90, 280, 370, 560, 650].forEach((x) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', `translate(${x + 40} 10)`);
    const parts = {};
    for (const [k, pts] of Object.entries(SEGS)) {
      const p = document.createElementNS(NS, 'polygon');
      p.setAttribute('points', pts); p.setAttribute('class', 'seg');
      g.append(p); parts[k] = p;
    }
    svg.append(g); digits.push({ parts, value: -1 });
  });
  [210, 490].forEach((x) => [52, 112].forEach((y) => {
    const c = document.createElementNS(NS, 'rect');
    c.setAttribute('x', x); c.setAttribute('y', y); c.setAttribute('width', 16); c.setAttribute('height', 16); c.setAttribute('class', 'dot');
    svg.append(c);
  }));
  return function show(total) {
    const t = Math.max(0, Math.floor(total));
    const h = Math.floor(t / 3600) % 100, m = Math.floor(t / 60) % 60, s = t % 60;
    [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10].forEach((v, i) => {
      const d = digits[i];
      if (d.value === v) return;
      d.value = v;
      for (const k of 'abcdefg') d.parts[k].classList.toggle('on', MAP[v].includes(k));
    });
    return [h, m, s];
  };
}
