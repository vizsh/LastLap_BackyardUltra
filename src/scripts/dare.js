/* Prove it: a runner types their biggest running achievement and the race answers back.

   It reads the words for a distance, a race or an excuse, then answers in two voices: a
   jab, and the honest line underneath it. Every answer ends in a dare, a number of loops
   set a little beyond what they say they have done. The same words always get the same
   answer, so nobody can reroll their way to a kinder one. */

export const LOOP_KM = 6.706;
export const LOOPS = 24;

const RACES = [
  [/\b(100\s*(mi|miles?)|hundred\s*miles?|160\s*k(m)?)\b/, 161],
  [/\bcomrades\b/, 88],
  [/\b(100\s*k(m)?)\b/, 100],
  [/\b(50\s*mi(les?)?)\b/, 80],
  [/\b(50\s*k(m)?)\b/, 50],
  [/\bultra\b/, 50],
  [/\b(half(\s*marathon)?|21(\.1)?\s*k(m)?)\b/, 21.1],
  [/\b(full\s*)?marathon\b/, 42.2],
  [/\b(10\s*k(m)?|10000\s*m)\b/, 10],
  [/\b(5\s*k(m)?|park\s*run|parkrun)\b/, 5],
];

/* the longest distance mentioned, in km */
function distance(t) {
  let best = 0;
  for (const m of t.matchAll(/(\d+(?:\.\d+)?)\s*(km|k|kilomet(?:er|re)s?|mi|miles?)\b/g)) {
    const km = +m[1] * (m[2].startsWith('mi') ? 1.609 : 1);
    if (km > best) best = km;
  }
  for (const [re, km] of RACES) if (re.test(t)) { best = Math.max(best, km); break; }
  return best;
}

/* a finishing time, in hours, if they gave one: "3:45", "sub 4", "under 2 hours", "4h10" */
function hours(t) {
  let m = t.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/);
  if (m) return m[3] !== undefined ? +m[1] + +m[2] / 60 : (+m[1] < 10 ? +m[1] + +m[2] / 60 : +m[1] / 60 + +m[2] / 3600);
  m = t.match(/\b(\d{1,2})\s*h(?:rs?|ours?)?\s*(\d{1,2})?\b/);
  if (m) return +m[1] + (m[2] ? +m[2] / 60 : 0);
  m = t.match(/\b(?:sub|under)\s*-?\s*(\d{1,2}(?:\.\d)?)\b/);
  if (m) return +m[1];
  return 0;
}

const has = (t, re) => re.test(t);

/* The voices. {d} is the dare in loops, {km} its distance. Each kind has several answers. */
const SAY = {
  nothing: {
    dare: 1,
    lines: [
      ['Nothing. Bold of you to read this far.', 'Everyone on the start line began at zero. One loop is 6.706 km and you get a whole hour for it.'],
      ['Zero kilometres. Honest, at least.', 'You can walk one loop inside the hour. Walk it. Then decide if you are done.'],
      ['So the achievement is scrolling this site.', 'It took you a while. One loop takes less. Come and find out what your legs think.'],
    ],
  },
  walk: {
    dare: 2,
    lines: [
      ['Walking counts. Barely.', 'A brisk walk makes the bell. Two loops is 13.4 km before you have to think about running.'],
      ['Steps. The bell does not count steps.', 'You already know how to keep moving for hours. That is most of this race.'],
    ],
  },
  cycle: {
    dare: 3,
    lines: [
      ['A bicycle. This site had one of those in it once. It was replaced.', 'No wheels here. Three loops on foot and we will talk.'],
      ['Wheels are cheating, and you know it.', 'Your engine is fine. Now take the gears away and run three loops.'],
    ],
  },
  gym: {
    dare: 3,
    lines: [
      ['The treadmill does not ring a bell.', 'Indoors you stop when you want. Out here the hour decides. Three loops.'],
      ['Strong in the gym. Cute.', 'Strength helps at hour ten. Getting to hour ten is the hard part. Start with three.'],
    ],
  },
  five: {
    lines: [
      ['A 5K. That is a warm-up with a medal.', 'Fast over 5 km means the pace is easy here. What breaks people is the next hour, and the next.'],
      ['5 km. We run that before the first bell has stopped ringing.', 'You have speed. Speed is not the problem in this race. Repeating is.'],
    ],
  },
  ten: {
    lines: [
      ['10K. Respectable. Also, the first hour and a half.', 'You already run farther than one loop. The question is how many times you will do it again.'],
      ['A 10K finisher. The lap sheet is still blank.', 'Ten kilometres is a loop and a half. Nobody remembers a loop and a half.'],
    ],
  },
  half: {
    lines: [
      ['A half marathon. Half.', 'At 8:57 a km a half is three loops of walking breaks. You have more than that in you.'],
      ['21.1 km. The word "half" is doing a lot of work there.', 'You know what hour three feels like. Find out what hour seven feels like.'],
    ],
  },
  long: {
    lines: [
      ['{dist}. Long enough to hurt, short enough to brag about.', 'That is four loops, with an hour of rest hidden inside them. Now find out what seven feels like.'],
      ['{dist} once. Once is a story. Twice is training.', 'Four loops gets you there. The dare is everything after it.'],
    ],
  },
  marathon: {
    lines: [
      ['A marathon. Lovely medal. There are no medals here.', 'Six loops is a marathon. You will be fresh at loop six, and that is exactly when it starts.'],
      ['42.2 km. Most people stop there. That is the point of this race.', 'You have done the distance that ends other races. Here it is a quarter of the way.'],
    ],
  },
  fast: {
    lines: [
      ['Fast. Speed has never won this format.', 'You will have time to sit down between every loop. Learn to stand up again. That is the race.'],
      ['Quick legs. The bell is not impressed by quick.', 'Pace is spare here. Patience is not. Show us you have both.'],
    ],
  },
  ultra: {
    lines: [
      ['An ultra. Now you are only slightly interesting.', 'You know the dark patch around hour eight. Bring it to Thakur Village.'],
      ['Ultra runner. You will be fine until you are not.', 'The difference here is the bell. It is coming whether you are ready or not.'],
    ],
  },
  big: {
    lines: [
      ['100 km. Fine. You have our attention.', 'This race will take everything you have and ask for one more loop. एक और.'],
      ['Big numbers. They mean nothing at the start line.', 'You know how to suffer. The bell will check, every hour.'],
    ],
  },
  hundred: {
    dare: LOOPS,
    lines: [
      ['100 miles. Then you already know.', 'All 24 loops is 100 miles in a day, in Mumbai, between towers. Do it again.'],
      ['A hundred-miler. We were hoping you would show up.', 'Twenty-four bells. Answer every one.'],
    ],
  },
  tri: {
    lines: [
      ['A triathlon. Swim and cycle all you like. Here you only get your legs.', 'You have the engine. Now spend all of it on one sport.'],
    ],
  },
  liar: {
    dare: LOOPS,
    lines: [
      ['Sure you did.', 'Prove it. Every one of them, all the way to 24.'],
      ['That is not a running achievement. That is a story.', 'Stories do not make the bell. Twenty-four loops does.'],
    ],
  },
  vague: {
    dare: 4,
    lines: [
      ['We looked for a number in that. Running is mostly numbers.', 'Whatever it was, it was not 26.8 km. Four loops is.'],
      ['Very inspiring. How far was it?', 'Tell us in kilometres next time. Until then, four loops.'],
    ],
  },
};

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* a little past what they have done: the dare is always harder than their best day */
const beyond = (km, push) => Math.min(LOOPS, Math.max(1, Math.ceil((km * push) / LOOP_KM)));

export function judge(text) {
  const t = ` ${text.toLowerCase().replace(/[’']/g, '')} `;
  const km = distance(t), h = hours(t);
  let kind, dare;

  const running = has(t, /\b(run|ran|running|jog|jogged|marathon|race|raced)\b/);
  if (!t.trim() || has(t, /\b(nothing|none|never|zero|nil|no achievement|couch|sofa|cant run|dont run|i dont|haven.?t)\b/)) kind = 'nothing';
  else if (!running && has(t, /\b(cycl|bike|bicycle|ride|riding|rode|spin)/)) kind = 'cycle';
  else if (km > 330 || has(t, /\b(everest|moon|sahara|across india|1000\s*k)\b/)) kind = 'liar';
  else if (km >= 155) kind = 'hundred';
  else if (has(t, /\b(ironman|triathlon|duathlon)\b/)) { kind = 'tri'; dare = 12; }
  else if (km >= 75) { kind = 'big'; dare = beyond(km, 1.35); }
  else if (km > 42.5) { kind = 'ultra'; dare = beyond(km, 1.5); }
  else if (km >= 30 && h && h < 3.5) { kind = 'fast'; dare = 12; }
  else if (km >= 30) { kind = 'marathon'; dare = 10; }
  else if (km > 24) { kind = 'long'; dare = 7; }
  else if (km >= 16) { kind = 'half'; dare = 7; }
  else if (km >= 8) { kind = 'ten'; dare = 5; }
  else if (km > 0) { kind = 'five'; dare = 3; }
  else if (has(t, /\b(cycl|bike|bicycle|ride|riding|spin)/)) kind = 'cycle';
  else if (has(t, /\b(gym|treadmill|crossfit|lift|weights|hyrox)\b/)) kind = 'gym';
  else if (has(t, /\b(walk|trek|hike|hiking|steps|stairs)\b/)) kind = 'walk';
  else kind = 'vague';

  const v = SAY[kind];
  dare = Math.min(LOOPS, dare || v.dare);
  const say = (x) => x.replace('{dist}', `${Math.round(km)} km`);
  const [jab, truth] = v.lines[hash(t.trim()) % v.lines.length].map(say);
  return { kind, dare, km: +(dare * LOOP_KM).toFixed(1), jab, truth };
}
