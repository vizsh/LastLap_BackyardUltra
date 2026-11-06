/* The film, shot by shot. This is the single source of truth for pacing and camera.

   Positions are measured in screens of scrolling. `in` and `out` are the light each
   shot is entered through and left through, in image coordinates: every cut in the
   film happens on a light. `phone` overrides values for the portrait crop. */

export const TRANS = 0.74;

const RED = [1, 0.17, 0.11], AMBER = [1, 0.56, 0.24], COOL = [0.72, 0.84, 1], WHITE = [1, 0.93, 0.86], BLUE = [0.3, 0.6, 1];

export const SHOTS = [
  {
    id: 'open', src: 'open', depth: true, hold: 0.8, aspect: 1.699, hour: 0,
    cam: { z: [1, 1.1], c: [[0.5, 0.45], [0.5, 0.42]] }, par: [0.03, 0.014], fog: 1, glow: 0.2, tint: RED,
    in: [0.506, 0.362], out: [0.506, 0.362], phone: { aspect: 0.563, in: [0.518, 0.362], out: [0.518, 0.362] },
  },
  {
    id: 'loop', src: 'plate', phoneSrc: 'plate-s', phoneDepth: 'plate-d', depth: true, hold: 4.3, aspect: 1.75, hour: 0, route: true,
    cam: { z: [1, 1.2], c: [[0.5, 0.56], [0.5, 0.6]] }, par: [0.045, 0.02], tint: AMBER, glow: 0,
    in: [0.4, 0.56], out: [0.27, 0.932], phone: { aspect: 1.75, cam: { z: [1, 1.04], c: [[0.42, 0.56], [0.42, 0.6]] }, par: [0.03, 0.014] },
  },
  {
    id: 'again', src: 'again', depth: true, hold: 0.72, aspect: 1.442, hour: 1,
    cam: { z: [1, 1.1], c: [[0.5, 0.56], [0.56, 0.6]] }, par: [0.03, 0.012], tint: AMBER, glow: 0.1,
    in: [0.81, 0.56], out: [0.35, 0.86], phone: { aspect: 0.563, in: [0.887, 0.426], out: [0.273, 0.582] },
  },
  {
    id: 'field', src: 'field', depth: true, hold: 0.72, aspect: 1.572, hour: 1,
    cam: { z: [1.02, 1.14], c: [[0.52, 0.56], [0.54, 0.52]] }, par: [0.03, 0.014], tint: COOL, glow: 0,
    in: [0.54, 0.46], out: [0.31, 0.645], phone: { aspect: 0.563, in: [0.464, 0.471], out: [0.3, 0.62] },
  },
  {
    id: 'run', video: 'run', hold: 0.8, aspect: 1.778, hour: 3,
    cam: { z: [1, 1.06], c: [[0.5, 0.5], [0.5, 0.5]] }, tint: BLUE, glow: 0.05,
    in: [0.515, 0.36], out: [0.515, 0.36], phone: { aspect: 0.5625, in: [0.504, 0.36], out: [0.504, 0.36] },
  },
  {
    id: 'shore', video: 'shore', hold: 0.8, aspect: 1.778, hour: 6,
    cam: { z: [1, 1.05], c: [[0.5, 0.52], [0.5, 0.5]] }, tint: COOL, glow: 0.04,
    in: [0.52, 0.4], out: [0.52, 0.4], phone: { aspect: 0.5625, in: [0.65, 0.4], out: [0.65, 0.4] },
  },
  {
    id: 'train', src: 'train', depth: true, hold: 0.85, aspect: 1.626, hour: 11,
    cam: { z: [1, 1.1], c: [[0.5, 0.5], [0.54, 0.5]] }, par: [0.03, 0.012], tint: RED, glow: 0.14,
    in: [0.469, 0.29], out: [0.469, 0.29], phone: { aspect: 0.562, in: [0.355, 0.346], out: [0.355, 0.346] },
  },
  {
    id: 'lone', src: 'lone', depth: true, hold: 0.85, aspect: 1.587, hour: 15,
    cam: { z: [1, 1.12], c: [[0.5, 0.5], [0.44, 0.52]] }, par: [0.03, 0.012], tint: AMBER, glow: 0.08,
    in: [0.3, 0.62], out: [0.3, 0.62], phone: { aspect: 0.563, in: [0.349, 0.532], out: [0.349, 0.532] },
  },
  {
    id: 'dawn', video: 'dawn', hold: 0.85, aspect: 1.778, hour: 24,
    cam: { z: [1, 1.05], c: [[0.5, 0.5], [0.5, 0.5]] }, tint: COOL, glow: 0,
    in: [0.56, 0.62], out: [0.56, 0.62], phone: { aspect: 0.5625, in: [0.3, 0.62], out: [0.3, 0.62] },
  },
  {
    id: 'rain', video: 'rain', hold: 0.9, aspect: 1.778, hour: 46,
    cam: { z: [1, 1.05], c: [[0.5, 0.5], [0.5, 0.5]] }, tint: WHITE, glow: 0.06,
    in: [0.59, 0.335], out: [0.59, 0.335], phone: { aspect: 0.5625, in: [0.784, 0.335], out: [0.784, 0.335] },
  },
  {
    id: 'last', src: 'last', depth: true, hold: 1, aspect: 1.569, hour: 46.6,
    cam: { z: [1, 1.14], c: [[0.5, 0.5], [0.53, 0.52]] }, par: [0.034, 0.016], fog: 0.5, tint: WHITE, glow: 0.12,
    in: [0.555, 0.55], out: [0.555, 0.55], phone: { aspect: 0.563, in: [0.46, 0.524], out: [0.46, 0.524] },
  },
  {
    id: 'flares', src: 'flares', depth: true, hold: 1.1, aspect: 1.785, hour: 47,
    cam: { z: [1, 1.1], c: [[0.5, 0.5], [0.5, 0.46]] }, par: [0.03, 0.02], fog: 0.7, tint: RED, glow: 0.05,
    in: [0.47, 0.4], out: [0.47, 0.4], phone: { aspect: 0.5625, in: [0.407, 0.391], out: [0.407, 0.391] },
  },
];

/* What you hear in each shot. Values are the level of each stem, 0 to 1. */
export const MIX = {
  open: { low: 0.8, bed: 0.25, breath: 0.2 },
  loop: { low: 0.45, bed: 0.9 },
  again: { low: 0.4, bed: 1 },
  field: { low: 0.55, bed: 0.6, crowd: 0.14 },
  run: { low: 0.4, bed: 0.7, breath: 0.25 },
  shore: { low: 0.55, bed: 0.4 },
  train: { low: 0.35, bed: 0.3, train: 0.9 },
  lone: { low: 0.85, bed: 0.1, heart: 0.5, breath: 0.3 },
  dawn: { low: 0.45, bed: 0.2, birds: 0.9 },
  rain: { low: 0.75, rain: 1, heart: 0.35 },
  last: { low: 0.7, heart: 0.85, breath: 0.65 },
  flares: { low: 0.55, crowd: 0.9 },
  reserve: { low: 0.4, bed: 0.12 },
};

export function layout(phone) {
  let s = 0;
  const shots = SHOTS.map((shot, i) => {
    const x = { ...shot, ...(phone ? shot.phone : null), i, start: s, end: s + shot.hold };
    s = x.end + TRANS;
    return x;
  });
  return { shots, total: shots[shots.length - 1].end };
}
