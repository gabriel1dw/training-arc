/* ---------- Data ---------- */
const LIFTS = {squat:'Back Squat', bench:'Bench Press', deadlift:'Deadlift', ohp:'Overhead Press', clean:'Power Clean'};
// Levels: 250 of them, with a new rank every 25 (SSS covers 201 to 250). Paced so a typical lifter (3–4 workouts
// a week, most sets cleared, about half the quests) reaches Lv 250 in about a year and a half: E-Rank in a month.
const MAX_LEVEL = 250, LEVELS_PER_RANK = 25;
// Each level costs a little more than the last up to Lv 100; after that the cost barely climbs, so the late ranks
// (S to SSS) keep coming at a steady pace instead of stalling. Streaks, quests and bosses speed it up.
const levelCost = L => L <= 100 ? Math.round(.845 * (195 + 3.25 * L + .026 * L * L) / 5) * 5 : Math.round((650 + .6 * (L - 100)) / 5) * 5;   // XP to go from level L to L + 1
const LEVEL_XP = [0, 0];                              // LEVEL_XP[L]: total XP needed to reach level L
for (let L = 1; L < MAX_LEVEL; L++) LEVEL_XP[L + 1] = LEVEL_XP[L] + levelCost(L);
const levelFor = xp => { let L = 1; while (L < MAX_LEVEL && xp >= LEVEL_XP[L + 1]) L++; return L; };
// Where you are inside your current level: {L, into, span, toNext, pct}
const levelInfo = xp => {
  const L = levelFor(xp); if (L >= MAX_LEVEL) return {L, into:0, span:0, toNext:0, pct:100};
  const into = xp - LEVEL_XP[L], span = LEVEL_XP[L + 1] - LEVEL_XP[L];
  return {L, into, span, toNext:span - into, pct:into / span * 100};
};
// Each rank starts at a level (lv) and the XP that level takes (xp)
const RANKS = [['F', 'Newcomer'], ['E', 'Rookie'], ['D', 'Trainee'], ['C', 'Fighter'], ['B', 'Elite'], ['A', 'Champion'], ['S', 'Legend'], ['SS', 'Mythic'], ['SSS', 'Ascended']]
  .map(([k, t], i) => { const lv = 1 + i * LEVELS_PER_RANK; return {k, t, lv, xp:LEVEL_XP[lv]}; });
const rankEndLv = i => i < RANKS.length - 1 ? RANKS[i + 1].lv - 1 : MAX_LEVEL;
const LEVEL = {E:'Beginner', D:'Novice', C:'Intermediate', B:'Advanced', A:'Elite', S:'Master'};
const XP_MULT = {E:1, D:1.2, C:1.4, B:1.6, A:1.8, S:2};
const PATHS = [
  {id:'cali',    g:'male', name:'Calisthenics', tag:'Bodyweight mastery',   desc:'From your first push-up to muscle-ups, handstands, and levers. Train anywhere with a bar and the floor.'},
  {id:'power',   g:'male', name:'Powerlifter',  tag:'Squat · Bench · Dead', desc:'Get as strong as possible on the big lifts. Every weight is calculated from your maxes.'},
  {id:'build',   g:'male', name:'Bodybuilder',  tag:'Size & shape',         desc:'Higher-volume splits built to add muscle and balance your physique.'},
  {id:'sprint',  g:'male', name:'Sprinter',     tag:'Raw speed',            desc:'Starts, top speed, and speed endurance, backed by plyometrics and lifting.'},
  {id:'athlete', g:'male', name:'Athlete',      tag:'Field & court sports', desc:'Speed, power, agility, and conditioning for game day. Built for football, basketball, and soccer players.'},
  {id:'fighter', g:'male', name:'Fighter',      tag:'Combat conditioning',  desc:'Rounds, roadwork, and fight power for boxing and MMA-style training.'},
  // Her lineup: shown when you play as the female hero (the Arcs tab can show every path)
  {id:'glute',   g:'female', name:'Glutes & Legs',  tag:'Lower-body shaping',   desc:'Hip thrusts, split squats, deadlifts, and kickbacks. Build strong, shapely glutes and legs, from bands at home to a heavy barbell.'},
  {id:'sculpt',  g:'female', name:'Sculpt & Tone',  tag:'Lean & defined',       desc:'Full-body dumbbell and machine training with higher reps. Lean muscle, definition, and an hourglass shape.'},
  {id:'pilates', g:'female', name:'Pilates & Core', tag:'Core · posture · flow', desc:'Mat Pilates from the Hundred to the advanced series. A strong center, better posture, and flexibility, all low impact.'},
  {id:'strong',  g:'female', name:'Strong Girl',     tag:'Squat · Bench · Dead',  desc:'Barbell strength from your own maxes, with heavy hip thrusts and upper-back work built in. Get seriously strong.'},
  {id:'run',     g:'female', name:'Cardio & Run',   tag:'Walk to half marathon', desc:'Incline walks, couch to 5K, then tempo runs, 10K, and half-marathon training. Cardio you\'ll actually look forward to.'},
  {id:'sport',   g:'female', name:'Athlete',         tag:'Speed · jumps · knees', desc:'Speed, jumping, and agility for volleyball, soccer, and basketball, with landing and hamstring work on every day to protect your knees.'},
  // For both heroes: no equipment, any room
  {id:'home',    g:'both', name:'Home Training', tag:'No equipment', desc:'Train in your bedroom or living room with zero equipment. Just the floor, a wall, a doorframe, and a couch. From your first push-up to pistols and handstand push-ups.'},
  // Arcs you build yourself (or remix from one above): they earn XP like a C-Rank arc
  {id:'custom',  g:'both', name:'My arcs',      tag:'Build your own',       desc:'Your own training arcs. Pick the days, exercises, sets and reps, or remix any arc above as a starting point. Custom arcs earn XP like a C-Rank arc and end with a boss: your Shadow Self.'}
];

// Exercise builders. A set is {reps, pct?, amrap?, unit?, pick?}
const rep = (n, pct, reps) => Array.from({length:n}, () => [pct, reps]);
const main = (lift, scheme, name, note) => ({name:name || LIFTS[lift], lift, note, sets:scheme.map(([pct, reps, amrap]) => ({pct, reps, amrap:!!amrap}))});
const L = (lift, n, pct, reps, o = {}) => { const s = rep(n, pct, reps); if (o.amrap) s[n-1] = [pct, reps, 1]; return main(lift, s, o.name, o.note); };
const X = (name, n, reps, unit, note) => ({name, note, sets:Array.from({length:n}, () => ({reps, unit:unit || undefined}))});
const P = (name, n, reps, note) => ({name, note:note || 'Pick a weight that leaves 2 reps in the tank', sets:Array.from({length:n}, () => ({reps, pick:true}))});
const D = (name, n, m, note) => X(name, n, m, 'm', note);
const Y = (name, n, yd, note) => X(name, n, yd, 'yd', note);
const M = (name, n, min, note) => X(name, n, min, 'min', note);

// Every day opens with a warm-up for its path, then the main work, then that day's accessories (ACC)
const WARMUP = {
  cali:    () => M('Warm-up', 1, 5, 'Wrist and shoulder circles, scap pulls, 10 easy squats'),
  power:   () => M('Warm-up', 1, 8, 'Easy bike or row, then empty-bar sets of the first lift'),
  build:   () => M('Warm-up', 1, 5, 'Easy cardio, then a light set of the first exercise'),
  sprint:  () => M('Dynamic Warm-up', 1, 10, 'Easy jog, leg swings, A-skips, and two build-up runs'),
  athlete: () => M('Dynamic Warm-up', 1, 10, 'Easy jog, leg swings, lunges, and two build-up runs'),
  fighter: () => M('Warm-up', 1, 5, 'Easy rope, arm circles, and hip openers'),
  glute:   () => M('Warm-up', 1, 6, 'Easy cardio, then glute bridges, band walks, and bodyweight squats'),
  sculpt:  () => M('Warm-up', 1, 5, 'Easy cardio, then a light set of the first exercise'),
  pilates: () => M('Breath and Warm-up', 1, 3, 'Lie on your back, breathe into your ribs, gentle pelvic tilts'),
  strong:  () => M('Warm-up', 1, 8, 'Easy bike or row, glute bridges, then empty-bar sets of the first lift'),
  run:     () => M('Warm-up', 1, 5, 'Brisk walk, leg swings, and a few skips'),
  sport:   () => M('Dynamic Warm-up', 1, 10, 'Easy jog, leg swings, lunges, mini-band walks, and two build-up runs'),
  home:    () => M('Warm-up', 1, 5, 'March in place, arm and hip circles, then 10 easy squats'),
  custom:  () => M('Warm-up', 1, 5, 'Easy cardio, then loosen up the joints you train today')
};
function arc(path, rank, name, blurb, weekNames, dayFn, o = {}){
  const id = `${path}-${rank.toLowerCase()}`, acc = ACC[id] || (() => ({}));
  const weeks = [0,1,2,3].map(w => { const extra = acc(w); return {days:dayFn(w).map(d => ({...d, ex:[WARMUP[path](), ...d.ex, ...(extra[d.name] || []).map(x => ({...x, acc:true}))]}))}; });
  return {id, path, rank, name, blurb, weekNames, weeks, tm:o.tm || 1,
    needsMax:weeks.some(wk => wk.days.some(d => d.ex.some(e => e.lift)))};
}
const WN_BUILD = ['Base Week','Build Week','Push Week','Peak Week'];
const WN_DELOAD = ['Base Week','Build Week','Push Week','Recovery Week'];

// Bodybuilding: sets and effort scale with rank; compound lifts use % of max.
const BB_NOTE = ['Leave 3 reps in the tank','Leave 2 reps in the tank','Leave 1–2 reps in the tank','Take the last set close to failure','Take the last set to failure','Last set: drop set. Strip 25% and keep going.'];
const bbPct = (reps, w) => { const b = reps <= 5 ? .775 : reps <= 6 ? .75 : reps <= 8 ? .70 : reps <= 10 ? .65 : .60; return w < 3 ? b + .025 * w : b - .10; };
function bb(tier, w, days){
  const sets = [3,3,3,4,4,4][tier] + (w === 2 ? 1 : 0) - (w === 3 ? 1 : 0);
  const note = w === 3 ? "Recovery week: about 80% of last week's weight" : BB_NOTE[tier];
  return days.map(([name, list]) => ({name, ex:list.map(([n, lift, reps]) => lift ? L(lift, sets, bbPct(reps, w), reps, {name:n}) : P(n, sets, reps, note))}));
}

const WAVE = [
  [[.65,5],[.75,5],[.85,5,1]],
  [[.70,3],[.80,3],[.90,3,1]],
  [[.75,5],[.85,3],[.95,1,1]],
  [[.40,5],[.50,5],[.60,5]]
];
const LB = [[.78,5],[.82,4],[.87,3]];
function lbMain(lift, w){
  if (w === 3) return main(lift, [[.93,1],[.85,2],[.85,2]]);
  const [p, r] = LB[w]; const s = rep(4, p, r); s[3] = [p, r, 1]; return main(lift, s);
}
const lbSec = (lift, w) => main(lift, rep(3, [.68,.70,.72,.60][w], w === 3 ? 5 : 6), LIFTS[lift] + ' · Secondary');
const PEAK = [
  [[.88,2],[.88,2],[.88,2],[.88,2]],
  [[.93,1],[.93,1],[.85,2],[.85,2]],
  [[.90,1],[.75,3],[.75,3]]
];
const testDay = lift => ({name:LIFTS[lift] + ' Test', ex:[
  L(lift, 1, .90, 1, {name:'Opener'}), L(lift, 1, .97, 1, {name:'Second Attempt'}),
  L(lift, 1, 1.02, 1, {name:'Third Attempt', amrap:true, note:'Only if your second moved fast. Make it, enter 1 rep, and lock in the new max.'})]});

// Accessories and finishers, by arc id and day name. They go after the main work and round each day out:
// weak points, upper back and shoulder health, core, calves, and hamstrings. Test days get none.
const SP = (n, sec) => X('Side Plank (each side)', n, sec, 'sec');
const CP = (n, sec) => X('Copenhagen Plank (each side)', n, sec, 'sec');
const ACC = {
  /* Calisthenics */
  'cali-e': w => ({
    'Lower Body Base':   [X('Wall Sit',3,20+10*w,'sec'), X('Calf Raise',3,15+w)],
    'Upper Body Base':   [X('Bench Dip',3,8+w,null,'Use a sturdy chair or bench'), X('Scapular Push-up',2,10)],
    'Full Body Circuit': [X('Bird Dog (each side)',3,8), X('High Knees',3,20+5*w,'sec','Finisher. Fast feet.')]
  }),
  'cali-d': w => ({
    'Push Day':      [X('Decline Push-up',3,8+w), X('Shoulder Tap (each side)',3,10)],
    'Pull & Legs':   [X('Scapular Pull-up',3,8), X('Glute Bridge',3,15), X('Calf Raise',3,20)],
    'Full Body Burn':[X('Plank Up-Down',3,8+w), X('Bicycle Crunch (each side)',3,15)]
  }),
  'cali-c': w => ({
    'Push Day':  [X('Diamond Push-up',3,10+w), X('Planche Lean',3,15+5*w,'sec')],
    'Pull Day':  [X('Scapular Pull-up',3,10), X('Dead Hang',2,30+10*w,'sec')],
    'Leg Day':   [X('Walking Lunge (each leg)',3,12), X('Glute Bridge March (each leg)',3,10), X('Wall Sit',2,45,'sec')],
    'Skill Day': [X('Hanging Scap Shrug',3,10), X('Plank to Pike',3,8)]
  }),
  'cali-b': w => ({
    'Push Day':  [X('Pseudo Planche Push-up',3,6+w), X('Diamond Push-up',3,12), X('Bar Support Hold',3,30,'sec')],
    'Pull Day':  [X('Chin-up',3,8+w), X('Feet-Elevated Inverted Row',3,12), X('Hanging Scap Shrug',3,10)],
    'Leg Day':   [X('Single-Leg Glute Bridge (each leg)',3,12), X('Single-Leg Calf Raise',3,15+w), CP(3,20)],
    'Skill Day': [X('Skin the Cat',3,3,null,'Slow and controlled'), X('Hollow Body Rock',3,20)]
  }),
  'cali-a': w => ({
    'Push Day':  [X('Ring or Bar Dip',3,12+w), X('Hollow Hold',3,40,'sec')],
    'Pull Day':  [X('Archer Pull-up (each side)',3,3+w), X('Tuck Front Lever Row',3,8), X('Dead Hang',2,45,'sec')],
    'Leg Day':   [X('Single-Leg Calf Raise',4,15+w), CP(3,30), X('Jump Squat',3,10)],
    'Skill Day': [X('Skin the Cat',3,5), X('L-Sit',4,20,'sec')]
  }),
  'cali-s': w => ({
    'Push Day':  [X('Wall Handstand Push-up',3,5+w), X('Pseudo Planche Push-up',4,10), X('L-Sit',4,20,'sec')],
    'Pull Day':  [P('Weighted Pull-up',4,5), X('Archer Pull-up (each side)',3,4+w), X('Toes-to-Bar',4,12)],
    'Leg Day':   [X('Shrimp Squat (each leg)',3,8+w), X('Single-Leg Calf Raise',4,20), CP(3,40)],
    'Skill Day': [X('Muscle-up',4,3,null,'Clean reps, no kip'), X('V-Sit',4,10+3*w,'sec')]
  }),

  /* Powerlifter */
  'power-e': () => ({
    'Squat & Bench':          [P('Triceps Pushdown',2,12), P('Dumbbell Curl',2,12)],
    'Deadlift & Press':       [P('Lat Pulldown',3,10), P('Face Pull',2,15)],
    'Squat & Bench Practice': [P('Dumbbell Row',3,10), P('Lateral Raise',2,15)]
  }),
  'power-d': w => ({
    'Day A': [P('Triceps Pushdown',3,12), X('Plank',3,40,'sec')],
    'Day B': [X('Chin-up',3,6+w), X('Back Extension',3,12), X('Hanging Knee Raise',3,12)],
    'Day C': [P('Dumbbell Row',3,10), P('Face Pull',3,15), X('Ab Wheel Rollout',3,8)]
  }),
  'power-c': () => ({
    'Squat Day':    [P('Leg Curl',3,12), P('Calf Raise',3,15)],
    'Bench Day':    [P('Triceps Pushdown',3,12), P('Face Pull',3,15)],
    'Deadlift Day': [P('Barbell Row',3,8), P('Dumbbell Shrug',3,12)],
    'Overhead Day': [P('Dumbbell Curl',3,12), X('Close-Grip Push-up',3,12)]
  }),
  'power-b': () => ({
    'Heavy Squat':    [P('Leg Curl',3,12), X('Ab Wheel Rollout',3,10)],
    'Heavy Pull':     [P('Barbell Row',3,8), X('Hanging Leg Raise',3,12)],
    'Heavy Bench':    [P('Triceps Pushdown',3,12), P('Face Pull',3,15), X('Plank',3,45,'sec')],
    'Speed & Paused': [P('Lateral Raise',3,15), P('Dumbbell Curl',3,12)]
  }),
  'power-a': () => ({
    'Squat Focus': [P('Leg Curl',3,10), P('Calf Raise',3,12)],
    'Pull Focus':  [P('Dumbbell Shrug',3,12), X('Hanging Leg Raise',3,12)],
    'Press Focus': [P('Triceps Pushdown',3,12), X('Plank',3,60,'sec')]
  }),
  'power-s': () => ({   // peaking: light, just enough to stay balanced
    'Squat Day':    [P('Leg Curl',2,10,'Light. Save your legs.'), X('Plank',3,45,'sec')],
    'Bench Day':    [P('Dumbbell Row',3,10), P('Face Pull',2,15)],
    'Deadlift Day': [X('Back Extension',2,10), X('Hanging Leg Raise',3,10)]
  }),

  /* Bodybuilder */
  'build-e': () => ({
    'Full Body A': [P('Leg Curl',2,12), P('Cable Crunch',2,15)],
    'Full Body B': [P('Face Pull',2,15), P('Hammer Curl',2,12)],
    'Full Body C': [P('Calf Raise',2,15), P('Triceps Pushdown',2,12)]
  }),
  'build-d': () => ({
    'Upper A': [P('Triceps Pushdown',3,12)],
    'Lower A': [P('Walking Lunge (each leg)',3,10), X('Hanging Leg Raise',3,12)],
    'Upper B': [P('Lateral Raise',3,15), P('Hammer Curl',3,12)],
    'Lower B': [P('Leg Curl',3,12), P('Cable Crunch',3,15)]
  }),
  'build-c': () => ({
    'Push':  [P('Cable Fly',3,15)],
    'Pull':  [P('Hammer Curl',3,12)],
    'Legs':  [X('Hanging Leg Raise',3,12)],
    'Upper': [P('Lateral Raise',3,15), P('Face Pull',3,15)],
    'Lower': [P('Cable Crunch',3,15)]
  }),
  'build-b': () => ({
    'Chest Day':    [P('Pec Deck',3,15), P('Cable Crunch',3,15)],
    'Back Day':     [P('Dumbbell Pullover',3,12), P('Face Pull',3,15)],
    'Leg Day':      [P('Leg Extension',3,15)],
    'Shoulder Day': [P('Cable Lateral Raise',3,15), X('Hanging Leg Raise',3,12)],
    'Arm Day':      [P('Preacher Curl',3,12), P('Wrist Curl',2,15)]
  }),
  'build-a': () => ({
    'Push · Heavy':  [P('Triceps Pushdown',3,12), P('Cable Fly',3,15)],
    'Pull · Heavy':  [P('Face Pull',3,15), X('Hanging Leg Raise',3,12)],
    'Legs · Heavy':  [P('Leg Curl',3,12)],
    'Push · Volume': [P('Cable Crunch',3,15)],
    'Pull · Volume': [P('Rear Delt Fly',3,20), P('Preacher Curl',3,12)],
    'Legs · Volume': [X('Hanging Leg Raise',3,15)]
  }),
  'build-s': () => ({
    'Chest & Back':        [P('Face Pull',3,15)],
    'Quads & Calves':      [P('Cable Crunch',3,15)],
    'Shoulders & Arms':    [P('Triceps Pushdown',3,15)],
    'Back & Chest':        [P('Straight-Arm Pulldown',3,15)],
    'Hamstrings & Glutes': [X('Hanging Leg Raise',3,15)],
    'Arms & Delts':        [P('Rear Delt Fly',3,20)]
  }),

  /* Sprinter */
  'sprint-e': w => ({
    'Acceleration Basics': [D('High Knees',2,20), X('Single-Leg Glute Bridge (each leg)',3,10)],
    'Tempo Day':           [X('Reverse Lunge (each leg)',3,10), SP(3,20)],
    'Bounce Day':          [X('Squat Jump',3,6), X('Hollow Hold',3,20,'sec')]
  }),
  'sprint-d': () => ({
    'Starts': [X('Single-Leg Calf Raise',3,15), X('Glute Bridge',3,15)],
    'Tempo':  [X('Nordic Curl Negative',3,3), SP(3,30), X('Calf Raise',3,20)],
    'Power':  [P('Dumbbell RDL',3,10), X('Hanging Knee Raise',3,12)]
  }),
  'sprint-c': () => ({
    'Acceleration & Squat': [P('Walking Lunge (each leg)',3,8), X('Single-Leg Calf Raise',3,15), X('Hanging Knee Raise',3,12)],
    'Max Velocity':         [P('Hip Thrust',3,8), SP(3,30)],
    'Tempo & Durability':   [X('Single-Leg Glute Bridge (each leg)',3,12), X('Dead Bug (each side)',3,10)]
  }),
  'sprint-b': () => ({
    'Acceleration & Lift': [P('Bulgarian Split Squat (each leg)',3,6), X('Single-Leg Calf Raise',3,15)],
    'Max Velocity':        [P('Hip Thrust',3,8), X('Hanging Leg Raise',3,12)],
    'Speed Endurance':     [CP(3,20), X('Glute Bridge',3,15)],
    'Power & Lift':        [X('Hanging Leg Raise',3,12), X('Single-Leg Calf Raise',3,15)]
  }),
  'sprint-a': () => ({
    'Acceleration & Squat': [P('Bulgarian Split Squat (each leg)',3,6), X('Single-Leg Calf Raise',3,15)],
    'Max Velocity':         [P('Hip Thrust',3,6), X('Hanging Leg Raise',3,12)],
    'Special Endurance':    [CP(3,30), X('Glute Bridge',3,15)],
    'Power & Lift':         [P('Single-Leg RDL (each leg)',3,8), X('Ab Wheel Rollout',3,10)]
  }),
  'sprint-s': () => ({
    'Contrast Power':  [P('Bulgarian Split Squat (each leg)',3,5), X('Single-Leg Calf Raise',4,15)],
    'Top Speed':       [P('Hip Thrust',3,6), X('Hanging Leg Raise',3,12)],
    'Speed Endurance': [CP(3,30), X('Glute Bridge',3,15)],
    'Strength':        [P('Single-Leg RDL (each leg)',3,6), X('Ab Wheel Rollout',3,12)]
  }),

  /* Athlete */
  'athlete-e': w => ({
    'Movement':      [X('Inverted Row',3,8+w), X('Glute Bridge',3,12)],
    'Jumps & Speed': [X('Reverse Lunge (each leg)',3,8), SP(3,20)],
    'Conditioning':  [Y('Bear Crawl',3,10), X('Bicycle Crunch (each side)',3,15)]
  }),
  'athlete-d': () => ({
    'Lower Body':             [P('Walking Lunge (each leg)',3,8), CP(3,20)],
    'Upper Body':             [P('Dumbbell Shoulder Press',3,10), P('Face Pull',3,15), X('Plank',3,40,'sec')],
    'Agility & Conditioning': [X('Lateral Bound (each side)',3,5), X('Dead Bug (each side)',3,10)]
  }),
  'athlete-c': () => ({
    'Lower Power':     [X('Nordic Curl Negative',3,4), X('Single-Leg Calf Raise',3,15)],
    'Upper Power':     [P('Dumbbell Shoulder Press',3,8), P('Face Pull',3,15)],
    'Speed & Agility': [X('Lateral Bound (each side)',3,5), SP(3,30)],
    'Conditioning':    [X('Med Ball Slam',3,10), Y('Bear Crawl',3,15)]
  }),
  'athlete-b': () => ({
    'Lower Power':             [P('Bulgarian Split Squat (each leg)',3,6), X('Nordic Curl Negative',3,5), X('Hanging Leg Raise',3,12)],
    'Upper Power':             [P('Dumbbell Row',3,8), P('Face Pull',3,15)],
    'Speed':                   [X('Lateral Bound (each side)',4,4), CP(3,25)],
    'Strength & Conditioning': [X('Pallof Press (each side)',3,10), X('Plank',3,45,'sec')]
  }),
  'athlete-a': () => ({
    'Contrast Lower': [P('Single-Leg RDL (each leg)',3,6), X('Nordic Curl',3,4), CP(3,30)],
    'Contrast Upper': [P('Push Press',3,4), P('Dumbbell Row',3,8), P('Face Pull',3,15)],
    'Game Speed':     [X('Lateral Bound (each side)',4,4), X('Pallof Press (each side)',3,10)],
    'Conditioning':   [P('Walking Lunge (each leg)',3,8), SP(3,30)]
  }),
  'athlete-s': () => ({
    'Lower Power':         [P('Bulgarian Split Squat (each leg)',3,5), X('Nordic Curl',4,4), X('Hanging Leg Raise',3,12)],
    'Upper Power':         [P('Dumbbell Row',3,8), P('Face Pull',3,15)],
    'Speed':               [X('Lateral Bound (each side)',4,5), CP(3,30)],
    'Conditioning':        [P('Single-Leg RDL (each leg)',3,6), X('Pallof Press (each side)',3,12)],
    'Recovery & Movement': [X('Glute Bridge',2,15), X('Dead Bug (each side)',2,10)]
  }),

  /* Fighter */
  'fighter-e': w => ({
    'Rope & Basics': [X('Shoulder Tap (each side)',3,10), X('Bicycle Crunch (each side)',3,15)],
    'Legs & Core':   [X('Glute Bridge',3,15), X('Calf Raise',3,20), X('Plank',3,30,'sec')],
    'Conditioning':  [X('Push-up',3,10+w), X('Mountain Climber (each leg)',3,15), X('Sit-up',3,15)]
  }),
  'fighter-d': () => ({
    'Roadwork': [X('Bodyweight Squat',3,20), X('Inverted Row',3,10), SP(3,30)],
    'Rounds':   [X('Push-up',3,15), X('Russian Twist (each side)',3,20)],
    'Power':    [X('Plyo Push-up',3,6), X('Walking Lunge (each leg)',3,12)]
  }),
  'fighter-c': () => ({
    'Bag Day':            [X('Push-up',3,20), X('Shoulder Tap (each side)',3,15)],
    'Strength':           [P('Dumbbell Bench Press',3,8), P('Dumbbell Row',3,10), X('Hanging Knee Raise',3,12)],
    'Roadwork':           [X('Single-Leg Glute Bridge (each leg)',3,12), SP(3,30)],
    'Fight Conditioning': [X('Pull-up',3,6), X('Plank',3,45,'sec')]
  }),
  'fighter-b': () => ({
    'Bag Rounds':         [X('Sprawl',4,10), X('Band Pull-Apart',3,20), X('Hollow Hold',3,30,'sec')],
    'Strength & Power':   [P('Dumbbell Row',3,10), P('Landmine Rotation (each side)',3,8), X('Hanging Leg Raise',3,12)],
    'Roadwork & Hills':   [X('Walking Lunge (each leg)',3,12), SP(3,30)],
    'Fight Conditioning': [D('Farmer Carry',3,40,'Heavy dumbbells. Walk tall.'), X('Pull-up',3,8)]
  }),
  'fighter-a': () => ({
    'Bag Rounds':         [X('Sprawl',5,10), X('Band Pull-Apart',3,20), X('Hollow Hold',3,40,'sec')],
    'Lower Strength':     [P('Bulgarian Split Squat (each leg)',3,8), X('Nordic Curl Negative',3,4), X('Hanging Leg Raise',3,12)],
    'Roadwork & Hills':   [CP(3,25), X('Single-Leg Calf Raise',3,15)],
    'Fight Conditioning': [D('Farmer Carry',3,40,'Heavy dumbbells. Walk tall.'), X('Pull-up',3,8), X('Ab Wheel Rollout',3,10)],
    'Upper Power':        [P('Dumbbell Row',3,10), P('Face Pull',3,15)]
  }),
  'fighter-s': () => ({
    'Bag Rounds':         [X('Sprawl',5,12), X('Band Pull-Apart',3,25), X('Hollow Hold',3,45,'sec')],
    'Lower Strength':     [P('Bulgarian Split Squat (each leg)',3,6), X('Nordic Curl',3,4), X('Ab Wheel Rollout',3,12)],
    'Roadwork & Hills':   [CP(3,30), X('Single-Leg Calf Raise',3,20), X('Russian Twist (each side)',3,20)],
    'Fight Conditioning': [D('Farmer Carry',4,40,'Heavy dumbbells. Walk tall.'), X('Pull-up',4,8), X('Hanging Leg Raise',3,15)],
    'Upper Power':        [P('Dumbbell Row',4,8), P('Face Pull',3,15)]
  })
};

const PROGRAMS = [
  /* ===== Calisthenics ===== */
  arc('cali','E','Rooftop Arc','Bodyweight basics: squat, push, pull, and core. Reps climb every week. No equipment needed.', WN_BUILD, w => [
    {name:'Lower Body Base', ex:[X('Bodyweight Squat',3,10+2*w), X('Glute Bridge',3,12+2*w), X('Reverse Lunge (each leg)',2,6+w), X('Plank',3,20+10*w,'sec')]},
    {name:'Upper Body Base', ex:[X('Push-up',3,6+2*w,null,'Knees on the ground is fine to start'), X('Inverted Row',3,6+2*w,null,'Use a sturdy table or a low bar'), X('Pike Push-up',2,5+w), X('Hollow Hold',3,15+5*w,'sec')]},
    {name:'Full Body Circuit', ex:[X('Jump Squat',3,6+w), X('Push-up',3,5+2*w), X('Superman Hold',3,15+5*w,'sec'), X('Mountain Climber (each leg)',3,10+2*w)]}
  ]),
  arc('cali','D','Street Arc','Full push-ups, rows, and your first pull-up negatives. Three days that build real bodyweight strength.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Push-up',4,8+2*w), X('Pike Push-up',3,6+w), X('Bench Dip',3,10+2*w), X('Plank',3,30+10*w,'sec')]},
    {name:'Pull & Legs', ex:[X('Inverted Row',4,8+2*w), X('Pull-up Negative',3,3+w,null,'Jump to the top, lower for 5 seconds'), X('Split Squat (each leg)',3,10+w), X('Hollow Hold',3,20+5*w,'sec')]},
    {name:'Full Body Burn', ex:[X('Burpee',3,8+w), X('Diamond Push-up',3,6+w), X('Jump Squat',3,10+w), X('Dead Hang',3,20+10*w,'sec')]}
  ]),
  arc('cali','C','Bar Brawler Arc','Pull-ups, dips, and your first skill work. Four days: push, pull, legs, and skills.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Dip',4,6+w), X('Push-up',4,15+2*w), X('Feet-Elevated Pike Push-up',3,8+w), X('Tuck L-Sit',4,10+5*w,'sec')]},
    {name:'Pull Day', ex:[X('Pull-up',5,4+w), X('Chin-up',3,5+w), X('Inverted Row',3,12+w), X('Hanging Knee Raise',3,10+2*w)]},
    {name:'Leg Day', ex:[X('Bulgarian Split Squat (each leg)',4,10+w), X('Box Pistol Squat (each leg)',3,5+w), X('Nordic Curl Negative',3,3+w), X('Single-Leg Calf Raise',3,15+w)]},
    {name:'Skill Day', ex:[X('Wall Handstand Hold',5,20+10*w,'sec'), X('Explosive Pull-up',5,3,null,'Pull your chest to the bar as fast as you can'), X('Archer Push-up (each side)',3,3+w), X('Hollow Body Rock',3,15+w)]}
  ]),
  arc('cali','B','Gravity Arc','Archer variations, pistols, and front lever work. You start bending gravity instead of fighting it.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Dip',5,8+w), X('Archer Push-up (each side)',4,6+w), X('Wall Handstand Push-up Negative',4,3+w,null,'Lower for 4 seconds'), X('L-Sit',5,10+5*w,'sec')]},
    {name:'Pull Day', ex:[X('Pull-up',5,8+w), X('Explosive Pull-up',5,3+w,null,'Bar to lower chest'), X('Archer Pull-up (each side)',3,2+w), X('Toes-to-Bar',3,8+w)]},
    {name:'Leg Day', ex:[X('Pistol Squat (each leg)',4,5+w), X('Shrimp Squat (each leg)',3,4+w), X('Nordic Curl Negative',4,4+w), X('Jumping Lunge',3,10+2*w)]},
    {name:'Skill Day', ex:[X('Freestanding Handstand',6,10+5*w,'sec','Kick up, hold, repeat'), X('Muscle-up Negative',5,2+w,null,'Start on top of the bar and lower slowly'), X('Tuck Front Lever',5,8+3*w,'sec'), X('Dragon Flag Negative',4,3+w)]}
  ]),
  arc('cali','A','Skyline Arc','Muscle-ups, wall handstand push-ups, and advanced lever holds. Elite bodyweight control.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Wall Handstand Push-up',5,3+w), P('Weighted Dip',4,6), X('Pseudo Planche Push-up',4,6+w), X('Planche Lean',5,15+5*w,'sec')]},
    {name:'Pull Day', ex:[X('Muscle-up',5,2+w), P('Weighted Pull-up',4,5), X('Advanced Tuck Front Lever',5,8+3*w,'sec'), X('Toes-to-Bar',4,10+w)]},
    {name:'Leg Day', ex:[X('Pistol Squat (each leg)',5,8+w), X('Shrimp Squat (each leg)',4,6+w), X('Nordic Curl',4,3+w), X('Box Jump',5,5)]},
    {name:'Skill Day', ex:[X('Freestanding Handstand',6,20+10*w,'sec'), X('One-Arm Push-up Negative (each side)',4,3+w), X('Tuck Planche',5,6+3*w,'sec'), X('Dragon Flag',4,4+w)]}
  ]),
  arc('cali','S','Weightless Arc','High-volume muscle-ups, freestanding handstand push-up work, and one-arm progressions. Master tier.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Freestanding Handstand Push-up Negative',5,3+w), X('Ring or Bar Dip',5,15+w), X('One-Arm Push-up (each side)',4,3+w), X('Straddle Planche Lean',5,10+5*w,'sec')]},
    {name:'Pull Day', ex:[X('Muscle-up',6,4+w), X('One-Arm Pull-up Negative (each side)',4,2+w), X('Front Lever',6,5+2*w,'sec','Straddle or full'), X('Front Lever Raise',4,4+w)]},
    {name:'Leg Day', ex:[X('Pistol Squat (each leg)',5,10+w), P('Weighted Pistol Squat (each leg)',4,5,'Hold a light weight out front'), X('Nordic Curl',5,5+w), X('Depth Jump',5,4)]},
    {name:'Skill Day', ex:[X('Freestanding Handstand',6,30+10*w,'sec'), X('Human Flag Progression',5,5+3*w,'sec'), X('Straddle Planche',5,4+2*w,'sec'), X('Dragon Flag',5,6+w)]}
  ]),

  /* ===== Powerlifter ===== */
  arc('power','E','First Plate Arc','Learn the squat, bench, deadlift, and overhead press with light weight. Every rep should look the same.', WN_BUILD, w => { const p = [.50,.55,.60,.65][w]; return [
    {name:'Squat & Bench', ex:[L('squat',3,p,5,{note:'Technique first. Film one set.'}), L('bench',3,p,5), P('Dumbbell Row',3,10), X('Plank',3,30,'sec')]},
    {name:'Deadlift & Press', ex:[L('deadlift',3,p,5,{note:'Reset at the floor every rep'}), L('ohp',3,p,5), P('Goblet Squat',3,10), X('Dead Bug (each side)',3,8)]},
    {name:'Squat & Bench Practice', ex:[L('squat',3,p,5), L('bench',3,p,5), X('Push-up',3,10), X('Back Extension',3,12)]}
  ]; }),
  arc('power','D','Linear Arc','Add weight every week on the big lifts. Three full-body days built on sets of five.', WN_BUILD, w => { const p = [.70,.725,.75,.775][w]; return [
    {name:'Day A', ex:[L('squat',3,p,5), L('bench',3,p,5), P('Barbell Row',3,8)]},
    {name:'Day B', ex:[L('squat',3,p-.10,5,{name:'Back Squat · Light'}), L('ohp',3,p,5), L('deadlift',1,p+.05,5,{note:'One hard set of 5'})]},
    {name:'Day C', ex:[L('squat',3,p,5), L('bench',3,p,5), X('Chin-up',3,8,null,'Add weight once 3 × 8 is easy')]}
  ]; }),
  arc('power','C','Strength Arc','Four lifts, four days. Each lift waves through a 5s week, a 3s week, and a 5/3/1 week, then a recovery week. The last set of each wave is a rep-out (+) that can earn a new max.', ['5s Week','3s Week','5/3/1 Week','Recovery Week'], w => {
    const v = l => w < 3 ? [L(l, 3, .60, l === 'deadlift' ? 5 : 8, {name:LIFTS[l] + ' · Volume'})] : [];
    return [
      {name:'Squat Day', ex:[main('squat', WAVE[w]), ...v('squat'), P('Walking Lunge (each leg)',3,10), X('Hanging Leg Raise',3,12)]},
      {name:'Bench Day', ex:[main('bench', WAVE[w]), ...v('bench'), P('Dumbbell Row',3,10), X('Dip',3,10)]},
      {name:'Deadlift Day', ex:[main('deadlift', WAVE[w]), ...v('deadlift'), X('Back Extension',3,12), X('Ab Wheel Rollout',3,10)]},
      {name:'Overhead Day', ex:[main('ohp', WAVE[w]), ...v('ohp'), X('Pull-up',3,8), P('Lateral Raise',3,15)]}
    ];
  }, {tm:.9}),
  arc('power','B','Iron Wave Arc','Four days that pair heavy triples on one lift with volume on another. Heavy days end with a rep-out.', ['Wave 1','Wave 2','Wave 3','Recovery Week'], w => {
    const h = [.80,.825,.85,.70][w], v = [.65,.675,.70,.55][w], am = w < 3;
    return [
      {name:'Heavy Squat', ex:[L('squat',5,h,3,{amrap:am}), L('bench',4,v,8,{name:'Bench Press · Volume'}), P('Walking Lunge (each leg)',3,10)]},
      {name:'Heavy Pull', ex:[L('deadlift',4,h,3,{amrap:am}), L('ohp',4,v+.05,6,{name:'Overhead Press · Volume'}), X('Pull-up',4,8,null,'Add weight once 4 × 8 is easy')]},
      {name:'Heavy Bench', ex:[L('bench',5,h,3,{amrap:am}), L('squat',4,v+.05,6,{name:'Back Squat · Volume'}), P('Dumbbell Row',4,10)]},
      {name:'Speed & Paused', ex:[L('deadlift',6,v,2,{name:'Speed Deadlift',note:'Move it fast. 60 sec rest.'}), L('bench',4,v,5,{name:'Paused Bench',note:'2-second pause on the chest'}), X('Back Extension',3,12), X('Hanging Leg Raise',3,12)]}
    ];
  }),
  arc('power','A','Limit Break Arc','Three heavy days, each with a main lift and a secondary lift. Weight climbs from sets of 5 to near-max singles over four weeks.', ['Volume Week','Build Week','Intensity Week','Peak Week'], w => [
    {name:'Squat Focus', ex:[lbMain('squat', w), lbSec('bench', w), P('Barbell Row',4,8), X('Ab Wheel Rollout',3,10)]},
    {name:'Pull Focus',  ex:[lbMain('deadlift', w), lbSec('ohp', w), P('Weighted Pull-up',4,6), X('Back Extension',3,12)]},
    {name:'Press Focus', ex:[lbMain('bench', w), lbSec('squat', w), P('Weighted Dip',3,8), P('Face Pull',3,15)]}
  ]),
  arc('power','S','Meet Day Arc','A four-week peak that ends in test week. Work up to heavy singles, taper, then go for new maxes on all three lifts.', ['Peak 1','Peak 2','Taper','Test Week'], w => w === 3
    ? [testDay('squat'), testDay('bench'), testDay('deadlift')]
    : [
      {name:'Squat Day', ex:[main('squat', PEAK[w]), main('bench', rep(3,.70,3), 'Bench Press · Practice')]},
      {name:'Bench Day', ex:[main('bench', PEAK[w]), main('ohp', rep(3,.70,5), 'Overhead Press · Practice')]},
      {name:'Deadlift Day', ex:[main('deadlift', PEAK[w]), main('squat', rep(3,.65,3), 'Back Squat · Practice')]}
    ]),

  /* ===== Bodybuilder ===== */
  arc('build','E','Pump Arc','Three full-body days with machines and dumbbells. Learn how each muscle should feel when it works.', WN_DELOAD, w => bb(0, w, [
    ['Full Body A', [['Goblet Squat',null,12],['Dumbbell Bench Press',null,12],['Lat Pulldown',null,12],['Dumbbell Curl',null,12]]],
    ['Full Body B', [['Leg Press',null,12],['Seated Cable Row',null,12],['Dumbbell Shoulder Press',null,12],['Triceps Pushdown',null,12]]],
    ['Full Body C', [['Dumbbell Romanian Deadlift',null,12],['Incline Dumbbell Press',null,12],['Chest-Supported Row',null,12],['Lateral Raise',null,15]]]
  ])),
  arc('build','D','Split Arc','Four days, upper and lower. Barbell lifts come from your maxes; accessories you pick by feel.', WN_DELOAD, w => bb(1, w, [
    ['Upper A', [['Bench Press','bench',8],['Barbell Row',null,10],['Incline Dumbbell Press',null,10],['Lat Pulldown',null,12],['Dumbbell Curl',null,12]]],
    ['Lower A', [['Back Squat','squat',8],['Romanian Deadlift',null,10],['Leg Curl',null,12],['Calf Raise',null,15]]],
    ['Upper B', [['Overhead Press','ohp',8],['Pull-up',null,8],['Dumbbell Bench Press',null,10],['Cable Row',null,12],['Triceps Pushdown',null,12]]],
    ['Lower B', [['Deadlift','deadlift',6],['Bulgarian Split Squat (each leg)',null,10],['Leg Extension',null,15],['Calf Raise',null,15]]]
  ])),
  arc('build','C','Volume Arc','Five days: push, pull, legs, then upper and lower. More sets, more growth.', WN_DELOAD, w => bb(2, w, [
    ['Push', [['Bench Press','bench',8],['Incline Dumbbell Press',null,10],['Dumbbell Shoulder Press',null,10],['Lateral Raise',null,15],['Triceps Pushdown',null,12]]],
    ['Pull', [['Barbell Row',null,10],['Pull-up',null,8],['Cable Row',null,12],['Face Pull',null,15],['Barbell Curl',null,12]]],
    ['Legs', [['Back Squat','squat',8],['Romanian Deadlift',null,10],['Leg Press',null,12],['Leg Curl',null,12],['Calf Raise',null,15]]],
    ['Upper', [['Overhead Press','ohp',8],['Weighted Pull-up',null,8],['Dumbbell Bench Press',null,10],['Hammer Curl',null,12],['Overhead Triceps Extension',null,12]]],
    ['Lower', [['Deadlift','deadlift',6],['Bulgarian Split Squat (each leg)',null,10],['Leg Extension',null,15],['Hip Thrust',null,10],['Calf Raise',null,15]]]
  ])),
  arc('build','B','Sculpt Arc','A five-day body-part split. Each muscle group gets its own day and full attention.', WN_DELOAD, w => bb(3, w, [
    ['Chest Day', [['Bench Press','bench',8],['Incline Dumbbell Press',null,10],['Cable Fly',null,15],['Dip',null,10]]],
    ['Back Day', [['Deadlift','deadlift',6],['Pull-up',null,8],['Barbell Row',null,10],['Straight-Arm Pulldown',null,12]]],
    ['Leg Day', [['Back Squat','squat',8],['Leg Press',null,12],['Romanian Deadlift',null,10],['Leg Curl',null,12],['Calf Raise',null,15]]],
    ['Shoulder Day', [['Overhead Press','ohp',8],['Lateral Raise',null,15],['Rear Delt Fly',null,15],['Dumbbell Shrug',null,12]]],
    ['Arm Day', [['Close-Grip Bench Press','bench',10],['Barbell Curl',null,10],['Skull Crusher',null,12],['Hammer Curl',null,12],['Triceps Pushdown',null,15]]]
  ])),
  arc('build','A','Mass Arc','Six days of push, pull, legs, run twice: one heavy round, one high-volume round.', WN_DELOAD, w => bb(4, w, [
    ['Push · Heavy', [['Bench Press','bench',6],['Overhead Press','ohp',8],['Incline Dumbbell Press',null,10],['Lateral Raise',null,15]]],
    ['Pull · Heavy', [['Deadlift','deadlift',5],['Barbell Row',null,8],['Weighted Pull-up',null,8],['Barbell Curl',null,10]]],
    ['Legs · Heavy', [['Back Squat','squat',6],['Romanian Deadlift',null,8],['Leg Press',null,12],['Calf Raise',null,15]]],
    ['Push · Volume', [['Bench Press · Volume','bench',12],['Dumbbell Shoulder Press',null,12],['Cable Fly',null,15],['Triceps Pushdown',null,15],['Lateral Raise',null,20]]],
    ['Pull · Volume', [['Lat Pulldown',null,12],['Cable Row',null,12],['Face Pull',null,20],['Hammer Curl',null,15]]],
    ['Legs · Volume', [['Back Squat · Volume','squat',12],['Bulgarian Split Squat (each leg)',null,12],['Leg Extension',null,15],['Leg Curl',null,15],['Calf Raise',null,20]]]
  ])),
  arc('build','S','Physique Arc','Six days with pairing splits and drop sets. Stage-ready volume for experienced lifters.', WN_DELOAD, w => bb(5, w, [
    ['Chest & Back', [['Bench Press','bench',6],['Weighted Pull-up',null,8],['Incline Dumbbell Press',null,10],['Chest-Supported Row',null,10],['Cable Fly',null,15]]],
    ['Quads & Calves', [['Back Squat','squat',6],['Hack Squat',null,10],['Leg Extension',null,15],['Walking Lunge (each leg)',null,12],['Calf Raise',null,15]]],
    ['Shoulders & Arms', [['Overhead Press','ohp',8],['Lateral Raise',null,15],['Barbell Curl',null,10],['Skull Crusher',null,12],['Rear Delt Fly',null,20]]],
    ['Back & Chest', [['Deadlift','deadlift',5],['Barbell Row',null,8],['Dumbbell Bench Press',null,10],['Lat Pulldown',null,12],['Dip',null,12]]],
    ['Hamstrings & Glutes', [['Romanian Deadlift',null,8],['Hip Thrust',null,10],['Leg Curl',null,12],['Back Extension',null,15],['Calf Raise',null,20]]],
    ['Arms & Delts', [['Close-Grip Bench Press','bench',10],['Hammer Curl',null,12],['Cable Lateral Raise',null,15],['Triceps Pushdown',null,15],['Preacher Curl',null,12]]]
  ])),

  /* ===== Sprinter ===== */
  arc('sprint','E','First Step Arc','Learn to sprint: skips, accelerations, and easy tempo runs. Builds the legs and lungs you need for speed work.', WN_BUILD, w => [
    {name:'Acceleration Basics', ex:[D('A-Skip',3,20), D('B-Skip',3,20), D('Acceleration',4+w,20,'About 80% effort. Walk back to recover.'), X('Plank',3,30,'sec')]},
    {name:'Tempo Day', ex:[D('Tempo Run',6+w,100,'70% effort. Walk 100 m between reps.'), X('Bodyweight Squat',3,15), X('Glute Bridge',3,15)]},
    {name:'Bounce Day', ex:[X('Pogo Hop',3,20), X('Broad Jump',4,3), D('Acceleration',4+w,20,'About 80% effort'), X('Calf Raise',3,20)]}
  ]),
  arc('sprint','D','Acceleration Arc','Own the first 30 meters. Full-effort starts, hill sprints, and jumps.', WN_BUILD, w => [
    {name:'Starts', ex:[X('Wall Drill',4,10,'sec','Lean into a wall and drive your knees'), D('Acceleration',6+w,20,'Full effort. 90 sec rest.'), D('Hill Sprint',4+w,30,'Walk down to recover'), X('Hollow Hold',3,30,'sec')]},
    {name:'Tempo', ex:[D('Tempo Run',8+w,100,'70% effort'), X('Split Squat (each leg)',3,10), X('Single-Leg Glute Bridge (each leg)',3,10)]},
    {name:'Power', ex:[X('Broad Jump',5,3), D('3-Point Start',5+w,30,'Full effort. 2 min rest.'), P('Goblet Squat',3,8), X('Single-Leg Calf Raise',3,15)]}
  ]),
  arc('sprint','C','Top Speed Arc','Starts, flying sprints, and lifting from your maxes. Learn to hit and hold top speed.', WN_DELOAD, w => { const p = [.70,.72,.75,.60][w]; return [
    {name:'Acceleration & Squat', ex:[D('3-Point Start',6,30,'2 min rest'), L('squat',4,p,5), X('Box Jump',4,5)]},
    {name:'Max Velocity', ex:[D('Flying Sprint',4+w,20,'Build up over 20 m, then 20 m all-out. 3 min rest.'), D('Bounding',4,30), L('deadlift',3,p,5), X('Nordic Curl Negative',3,4)]},
    {name:'Tempo & Durability', ex:[D('Tempo Run',10,100,'70% effort'), X('Pogo Hop',3,20), X('Copenhagen Plank (each side)',3,20,'sec')]}
  ]; }),
  arc('sprint','B','Flying Arc','Four days. Longer flying sprints, 60 m reps, and heavier lifts.', WN_DELOAD, w => { const p = [.75,.78,.82,.65][w]; return [
    {name:'Acceleration & Lift', ex:[D('Block Start',6,30,'2 min rest'), L('squat',5,p,3), X('Depth Jump',4,4)]},
    {name:'Max Velocity', ex:[D('Flying Sprint',5+w,30,'Build up 20 m, then 30 m all-out. Full rest.'), D('Bounding',5,40)]},
    {name:'Speed Endurance', ex:[D('Sprint',4+w,60,'95% effort. 4 min rest.'), X('Hurdle Hop',4,5), X('Hanging Leg Raise',3,12)]},
    {name:'Power & Lift', ex:[X('Broad Jump',5,3), L('deadlift',4,p,3), P('Single-Leg RDL (each leg)',3,8), X('Nordic Curl Negative',3,5)]}
  ]; }),
  arc('sprint','A','Speed Endurance Arc','Hold top speed longer. 80 m and 150 m reps plus heavy lifting with rep-outs.', WN_DELOAD, w => { const p = [.80,.83,.86,.68][w]; return [
    {name:'Acceleration & Squat', ex:[D('Block Start',8,30), L('squat',5,p,3,{amrap:w<3}), X('Depth Jump',5,4)]},
    {name:'Max Velocity', ex:[D('Flying Sprint',6,30,'Full rest'), D('Sprint',3+w,80,'95%. 5 min rest.'), D('Bounding',5,50)]},
    {name:'Special Endurance', ex:[D('Sprint',w > 1 ? 4 : 3,150,'90%. Walk 8–10 min between reps.'), X('Core Circuit',3,60,'sec')]},
    {name:'Power & Lift', ex:[X('Box Jump',5,3), L('deadlift',4,p,3), L('bench',3,.75,5), X('Nordic Curl',4,4)]}
  ]; }),
  arc('sprint','S','Lightning Arc','Contrast training, 40 m flys, and 120 m speed endurance. Master-level speed.', WN_DELOAD, w => { const p = [.82,.86,.90,.70][w]; return [
    {name:'Contrast Power', ex:[L('squat',4,p,2,{note:'Superset each set with 3 broad jumps'}), X('Broad Jump',4,3), D('Block Start',6,40)]},
    {name:'Top Speed', ex:[D('Flying Sprint',5+w,40,'Full rest, 5+ min'), D('Wicket Run',4,50,'Use mini hurdles or cones')]},
    {name:'Speed Endurance', ex:[D('Sprint',4,120,'95%. 6–8 min rest.'), D('Sprint',2,150,'90%')]},
    {name:'Strength', ex:[L('deadlift',4,p,2), P('Hip Thrust',4,6), X('Depth Jump',5,5), X('Nordic Curl',4,5)]}
  ]; }),

  /* ===== Athlete ===== */
  arc('athlete','E','Rookie Camp Arc','Movement, jumps, short sprints, and agility. A clean foundation for any sport.', WN_BUILD, w => [
    {name:'Movement', ex:[X('Bodyweight Squat',3,15), X('Push-up',3,10+w), Y('Lateral Shuffle',4,10), X('Plank',3,30+5*w,'sec')]},
    {name:'Jumps & Speed', ex:[X('Squat Jump',3,6+w), X('Skater Hop (each side)',3,6), Y('Sprint',6,20,'80% effort. Walk back.'), X('Dead Bug (each side)',3,8)]},
    {name:'Conditioning', ex:[Y('Pro Agility (5-10-5)',4+w,20,'Rest 60 sec'), X('Burpee',3,8+w), X('Mountain Climber (each leg)',3,15)]}
  ]),
  arc('athlete','D','Two-a-Day Arc','Your first real off-season: dumbbell strength, box jumps, sprints, and agility.', WN_BUILD, w => [
    {name:'Lower Body', ex:[P('Goblet Squat',4,8), X('Box Jump',4,5), P('Dumbbell RDL',3,10), Y('Sprint',6+w,20,'Full effort')]},
    {name:'Upper Body', ex:[X('Push-up',4,12+w), X('Pull-up',4,5+w,null,'Use a band if needed'), P('Dumbbell Bench Press',3,10), X('Med Ball Slam',3,10)]},
    {name:'Agility & Conditioning', ex:[X('Agility Ladder',4,20,'sec'), Y('Pro Agility (5-10-5)',5+w,20), Y('110-Yard Run',3+w,110,'Run it in about 18 sec. 45 sec rest.')]}
  ]),
  arc('athlete','C','Combine Arc','Four days aimed at combine-style tests: 40, pro agility, 3-cone, plus squat and bench from your maxes.', WN_DELOAD, w => { const p = [.70,.725,.75,.60][w]; return [
    {name:'Lower Power', ex:[L('squat',4,p,5), X('Box Jump',4,4), P('Romanian Deadlift',3,8), X('Hanging Knee Raise',3,12)]},
    {name:'Upper Power', ex:[L('bench',4,p,5), X('Pull-up',4,6+w), P('Dumbbell Row',3,10), X('Med Ball Chest Pass',3,8)]},
    {name:'Speed & Agility', ex:[Y('40-Yard Dash',4,40,'Full effort. 3 min rest.'), Y('Pro Agility (5-10-5)',4,20), X('3-Cone Drill',4,1,null,'Full effort. 2 min rest.')]},
    {name:'Conditioning', ex:[Y('110-Yard Run',4+w,110,'45 sec rest'), X('Burpee',3,10), X('Plank',3,45,'sec')]}
  ]; }),
  arc('athlete','B','Explosive Arc','Cleans, heavy triples, and short sprints. Turn strength into power.', WN_DELOAD, w => { const p = [.75,.78,.82,.65][w]; return [
    {name:'Lower Power', ex:[L('clean',5,p - .05,3,{name:'Hang Clean',note:'From your power clean max. Fast and crisp; stop the set if form breaks.'}), L('squat',5,p,3), X('Depth Jump',4,4)]},
    {name:'Upper Power', ex:[L('bench',5,p,3), P('Push Press',4,5), P('Weighted Pull-up',4,5), X('Plyo Push-up',3,6)]},
    {name:'Speed', ex:[Y('Sprint',6,10,'From a stance. Full rest.'), Y('Flying Sprint',4+w,20), Y('Pro Agility (5-10-5)',5,20)]},
    {name:'Strength & Conditioning', ex:[L('deadlift',4,p,3), P('Walking Lunge (each leg)',3,8), Y('110-Yard Run',5+w,110,'45 sec rest')]}
  ]; }),
  arc('athlete','A','Game Speed Arc','Contrast lifting, reaction starts, and game-pace conditioning. In-shape and explosive at the same time.', WN_DELOAD, w => { const p = [.80,.83,.86,.68][w]; return [
    {name:'Contrast Lower', ex:[L('squat',4,p,3,{amrap:w<3,note:'Superset each set with 3 box jumps'}), X('Box Jump',4,3), L('clean',5,p - .05,2,{name:'Hang Clean',note:'From your power clean max'})]},
    {name:'Contrast Upper', ex:[L('bench',4,p,3,{amrap:w<3}), X('Med Ball Chest Throw',4,4), P('Weighted Pull-up',4,5)]},
    {name:'Game Speed', ex:[Y('Reaction Start',8,10,'Go on a clap or a partner call'), Y('Flying Sprint',5,30), X('Mirror Drill',6,10,'sec'), Y('Pro Agility (5-10-5)',4,20)]},
    {name:'Conditioning', ex:[L('deadlift',3,p,3), Y('110-Yard Run',6+w,110,'Hit each in 15–16 sec'), X('Ab Wheel Rollout',3,10)]}
  ]; }),
  arc('athlete','S','All-Pro Arc','Five days: power cleans, heavy doubles, top-end speed, and pro-level conditioning, plus a recovery day.', WN_DELOAD, w => { const p = [.82,.86,.90,.70][w]; return [
    {name:'Lower Power', ex:[L('clean',5,p - .02,2,{note:'Explode from the floor; catch it high'}), L('squat',5,p,2,{amrap:w<3}), X('Depth Jump',5,3)]},
    {name:'Upper Power', ex:[L('bench',5,p,2,{amrap:w<3}), P('Push Press',4,3), P('Weighted Pull-up',4,4), X('Plyo Push-up',4,5)]},
    {name:'Speed', ex:[Y('Sprint',8,10,'From a stance or resisted'), Y('Flying Sprint',6,30), Y('Pro Agility (5-10-5)',5,20), X('3-Cone Drill',4,1)]},
    {name:'Conditioning', ex:[L('deadlift',3,p,2), Y('110-Yard Run',8+w,110,'Hit each in 15 sec'), X('Ab Wheel Rollout',4,12)]},
    {name:'Recovery & Movement', ex:[D('Tempo Run',8,100,'60–70% effort'), M('Mobility Flow',1,10), X('Single-Leg Balance Reach (each side)',3,8)]}
  ]; }),

  /* ===== Fighter ===== */
  arc('fighter','E','Jump Rope Arc','Rope, shadowboxing, and bodyweight basics. Build the gas tank before the fight.', WN_BUILD, w => [
    {name:'Rope & Basics', ex:[M('Jump Rope',3+w,2,'1 min rest between rounds'), M('Shadowboxing',3,2,'Jab, cross, and keep your feet moving'), X('Push-up',3,10), X('Plank',3,30,'sec')]},
    {name:'Legs & Core', ex:[X('Bodyweight Squat',3,20), X('Reverse Lunge (each leg)',3,10), X('Sit-up',3,15+w), X('Russian Twist (each side)',3,15)]},
    {name:'Conditioning', ex:[M('Shadowboxing',3+w,2), X('Burpee',3,8+w), M('Jump Rope',2,2)]}
  ]),
  arc('fighter','D','Roadwork Arc','Morning-style roadwork, longer rounds, and sprawls. Train like a fighter starting camp.', WN_BUILD, w => [
    {name:'Roadwork', ex:[M('Roadwork Run',1,20+5*w,'Easy pace. You should be able to talk.'), X('Push-up',4,15), X('Sit-up',4,20)]},
    {name:'Rounds', ex:[M('Jump Rope',4,3), M('Shadowboxing',4+w,3,'1 min rest. Work combinations.'), X('Sprawl',3,10), X('Plank',3,45,'sec')]},
    {name:'Power', ex:[X('Burpee',4,10+w), X('Jump Squat',4,10), X('Pull-up',4,5+w), X('Hanging Knee Raise',3,15)]}
  ]),
  arc('fighter','C','Sparring Camp Arc','Bag rounds, strength from your maxes, roadwork, and fight conditioning. Four days.', WN_DELOAD, w => { const p = [.70,.72,.75,.60][w]; return [
    {name:'Bag Day', ex:[M('Jump Rope',3,3), M('Heavy Bag',5+w,3,'1 min rest. Last 30 sec of each round all-out.'), X('Sprawl',4,10), X('Hollow Hold',3,30,'sec')]},
    {name:'Strength', ex:[L('squat',3,p,5), L('deadlift',3,p,3), X('Pull-up',4,6+w), P('Landmine Rotation (each side)',3,8)]},
    {name:'Roadwork', ex:[M('Roadwork Run',1,25+5*w), M('Sprint Intervals (30 on / 30 off)',1,10,'Stay sharp on every on-interval')]},
    {name:'Fight Conditioning', ex:[M('Shadowboxing',4,3), X('Burpee',5,10), X('Med Ball Slam',4,12), X('Russian Twist (each side)',3,20)]}
  ]; }),
  arc('fighter','B','Title Shot Arc','More rounds, heavier lifts, hill sprints, and rotational power.', WN_DELOAD, w => { const p = [.75,.78,.80,.65][w]; return [
    {name:'Bag Rounds', ex:[M('Jump Rope',3,3), M('Heavy Bag',6+w,3,'3-punch combos, move between them'), X('Plyo Push-up',4,6)]},
    {name:'Strength & Power', ex:[L('squat',4,p,4), L('bench',4,p,5), X('Box Jump',4,5), P('Weighted Pull-up',4,5)]},
    {name:'Roadwork & Hills', ex:[M('Roadwork Run',1,30), D('Hill Sprint',8+w,30,'Walk down to recover')]},
    {name:'Fight Conditioning', ex:[M('Shadowboxing',5,3,'Round 1 with light dumbbells'), X('Burpee',5,12), X('Med Ball Rotational Throw (each side)',4,8), X('Ab Wheel Rollout',3,10)]}
  ]; }),
  arc('fighter','A','Championship Arc','Five days. Eight-plus bag rounds, Tabata finishers, and heavy strength work.', WN_DELOAD, w => { const p = [.78,.82,.85,.68][w]; return [
    {name:'Bag Rounds', ex:[M('Jump Rope',3,3), M('Heavy Bag',8+w,3,'Fight pace. 1 min rest.'), X('Plyo Push-up',4,8)]},
    {name:'Lower Strength', ex:[L('squat',4,p,3), L('deadlift',3,p,3), P('Weighted Pull-up',4,5)]},
    {name:'Roadwork & Hills', ex:[M('Roadwork Run',1,35+5*w), D('Hill Sprint',10,40)]},
    {name:'Fight Conditioning', ex:[M('Shadowboxing',6,3), M('Tabata Burpees (20 on / 10 off)',2,4), X('Med Ball Rotational Throw (each side)',4,10)]},
    {name:'Upper Power', ex:[L('bench',4,p,4), X('Clap Push-up',4,6), P('Landmine Press (each arm)',3,8), X('Hanging Leg Raise',4,12)]}
  ]; }),
  arc('fighter','S','Undisputed Arc','Championship rounds, heavy doubles, and the hardest conditioning in the app. Master tier.', WN_DELOAD, w => { const p = [.80,.84,.88,.70][w]; return [
    {name:'Bag Rounds', ex:[M('Jump Rope',3,3), M('Heavy Bag',[10,11,12,8][w],3,'Championship pace. 1 min rest.'), X('Plyo Push-up',5,8)]},
    {name:'Lower Strength', ex:[L('squat',5,p,2,{amrap:w<3}), L('deadlift',3,p,2), P('Weighted Pull-up',5,4)]},
    {name:'Roadwork & Hills', ex:[M('Roadwork Run',1,40), D('Hill Sprint',12,40)]},
    {name:'Fight Conditioning', ex:[M('Shadowboxing',8,3,'Championship rounds'), M('Tabata Burpees (20 on / 10 off)',2,4), X('Med Ball Rotational Throw (each side)',5,10)]},
    {name:'Upper Power', ex:[L('bench',5,p,3,{amrap:w<3}), X('Depth Jump',5,4), X('Clap Push-up',5,8), X('Dragon Flag Negative',4,5)]}
  ]; })
];


/* ===== Her arcs: the female hero's own lineup =====
   Six paths built around what most women train for: glutes and legs, a toned full body, Pilates and core, real
   barbell strength, running, and sport. They use the same engine as every other arc (warm-up, main work,
   accessories, rank, XP, boss), so progress, stats and quests work the same. Anyone can see all arcs with the
   "Show all arcs" switch on the Arcs tab. */
Object.assign(ACC, {
  /* Glutes & Legs */
  'glute-e': w => ({
    'Glute Basics': [X('Plank',3,20+10*w,'sec')],
    'Legs & Core':  [X('Dead Bug (each side)',3,8)],
    'Booty Burn':   [X('Glute Bridge Hold',2,30+10*w,'sec','Finisher. Squeeze the whole time.')]
  }),
  'glute-d': w => ({
    'Glutes A':     [X('Frog Pump',2,25,null,'Finisher. Fast, squeeze every rep.')],
    'Upper & Core': [X('Plank',3,30+10*w,'sec')],
    'Glutes B':     [X('Banded Lateral Walk (each way)',3,12)]
  }),
  'glute-c': () => ({
    'Glute Strength': [X('Frog Pump',2,30)],
    'Upper Body':     [X('Dead Bug (each side)',3,10)],
    'Glute Shape':    [X('Banded Lateral Walk (each way)',3,15)],
    'Lower Power':    [SP(3,30)]
  }),
  'glute-b': () => ({
    'Heavy Thrust':        [X('Glute Bridge Hold',2,45,'sec')],
    'Upper Body':          [X('Hanging Knee Raise',3,12)],
    'Quads & Glutes':      [X('Banded Lateral Walk (each way)',3,15)],
    'Hamstrings & Glutes': [X('Frog Pump',2,30)]
  }),
  'glute-a': () => ({
    'Heavy Thrust':        [X('Frog Pump',2,30)],
    'Upper Body':          [X('Hanging Leg Raise',3,12)],
    'Quads & Glutes':      [X('Banded Lateral Walk (each way)',3,20)],
    'Hamstrings & Glutes': [SP(3,40)],
    'Glute Pump':          [X('Glute Bridge Hold',2,60,'sec')]
  }),
  'glute-s': () => ({
    'Heavy Thrust':        [X('Frog Pump',3,30)],
    'Upper Body':          [X('Hanging Leg Raise',3,15)],
    'Quads & Glutes':      [X('Banded Lateral Walk (each way)',3,20)],
    'Hamstrings & Glutes': [CP(3,30)],
    'Glute Pump':          [X('Glute Bridge Hold',2,60,'sec')]
  }),

  /* Sculpt & Tone */
  'sculpt-e': w => ({
    'Full Body A': [X('Plank',3,20+10*w,'sec')],
    'Full Body B': [X('Bicycle Crunch (each side)',3,12)],
    'Full Body C': [M('Incline Walk',1,10,'Finisher. Brisk pace, slight incline.')]
  }),
  'sculpt-d': w => ({
    'Upper A': [X('Plank',3,30+10*w,'sec')],
    'Lower A': [M('Stair Climber',1,8,'Finisher. Steady, don\'t lean on the rails.')],
    'Upper B': [X('Bicycle Crunch (each side)',3,15)],
    'Lower B': [X('Glute Bridge',2,20)]
  }),
  'sculpt-c': () => ({
    'Lower Body': [M('Stair Climber',1,10)],
    'Upper Push': [X('Dead Bug (each side)',3,10)],
    'Glutes & Hamstrings': [X('Frog Pump',2,25)],
    'Upper Pull & Arms':   [M('Incline Walk',1,12)]
  }),
  'sculpt-b': () => ({
    'Back & Shoulders': [X('Hanging Knee Raise',3,12)],
    'Glutes':           [M('Stair Climber',1,10)],
    'Arms & Abs':       [X('Bicycle Crunch (each side)',3,20)],
    'Legs':             [SP(3,30)],
    'Full Body Burn':   [M('Incline Walk',1,15)]
  }),
  'sculpt-a': () => ({
    'Back & Shoulders': [X('Hanging Leg Raise',3,12)],
    'Glutes':           [M('Stair Climber',1,12)],
    'Arms & Abs':       [X('Ab Wheel Rollout',3,8)],
    'Legs':             [SP(3,40)],
    'Full Body Burn':   [M('Incline Walk',1,15)]
  }),
  'sculpt-s': () => ({
    'Back & Shoulders': [X('Hanging Leg Raise',3,15)],
    'Glutes':           [M('Stair Climber',1,15)],
    'Arms & Abs':       [X('Ab Wheel Rollout',3,10)],
    'Legs':             [CP(3,25)],
    'Upper Pump':       [X('Bicycle Crunch (each side)',3,20)],
    'Lower Pump':       [M('Incline Walk',1,20)]
  }),

  /* Strong Girl */
  'strong-e': () => ({
    'Squat & Bench':    [P('Hip Thrust',3,12), X('Plank',3,30,'sec')],
    'Deadlift & Press': [P('Lat Pulldown',3,10), X('Dead Bug (each side)',3,8)],
    'Practice Day':     [P('Dumbbell Row',3,10), P('Banded Hip Abduction',2,20)]
  }),
  'strong-d': w => ({
    'Day A': [P('Hip Thrust',3,10), X('Plank',3,40,'sec')],
    'Day B': [P('Lat Pulldown',3,10), X('Back Extension',3,12)],
    'Day C': [P('Face Pull',3,15), X('Hanging Knee Raise',3,10+w)]
  }),
  'strong-c': () => ({
    'Squat Day':    [P('Leg Curl',3,12), P('Banded Hip Abduction',2,20)],
    'Bench Day':    [P('Triceps Pushdown',3,12), P('Face Pull',3,15)],
    'Deadlift Day': [X('Back Extension',3,12), X('Hanging Knee Raise',3,12)],
    'Thrust & Press Day': [P('Lateral Raise',3,15), X('Ab Wheel Rollout',3,8)]
  }),
  'strong-b': () => ({
    'Heavy Squat':    [P('Leg Curl',3,12), X('Ab Wheel Rollout',3,10)],
    'Heavy Pull':     [P('Face Pull',3,15), X('Hanging Leg Raise',3,10)],
    'Heavy Bench':    [P('Triceps Pushdown',3,12), X('Plank',3,45,'sec')],
    'Glutes & Speed': [P('Banded Hip Abduction',3,20), P('Lateral Raise',3,15)]
  }),
  'strong-a': () => ({
    'Squat Focus': [P('Leg Curl',3,10), X('Plank',3,60,'sec')],
    'Pull Focus':  [P('Face Pull',3,15), X('Hanging Leg Raise',3,12)],
    'Press Focus': [P('Triceps Pushdown',3,12), P('Banded Hip Abduction',2,20)]
  }),
  'strong-s': () => ({
    'Squat Day':    [P('Leg Curl',2,10,'Light. Save your legs.'), X('Plank',3,45,'sec')],
    'Bench Day':    [P('Dumbbell Row',3,10), P('Face Pull',2,15)],
    'Deadlift Day': [X('Back Extension',2,10), X('Hanging Leg Raise',3,10)]
  }),

  /* Cardio & Run */
  'run-e': w => ({
    'Incline Walk':        [X('Calf Raise',3,15)],
    'Walk-Jog':            [X('Glute Bridge',3,15)],
    'Strength for Runners':[M('Stretch Flow',1,5,'Calves, hamstrings, hips')]
  }),
  'run-d': () => ({
    'Run-Walk A': [X('Single-Leg Calf Raise',2,12)],
    'Run-Walk B': [X('Glute Bridge',3,15)],
    'Run-Walk C': [M('Stretch Flow',1,8,'Calves, hamstrings, hips')]
  }),
  'run-c': () => ({
    'Easy Run':    [X('Single-Leg Calf Raise',3,15)],
    'Intervals':   [SP(3,30)],
    'Long Run':    [M('Stretch Flow',1,10)],
    'Run Strength':[X('Copenhagen Plank (each side)',2,15,'sec')]
  }),
  'run-b': () => ({
    'Tempo Run':   [X('Single-Leg Calf Raise',3,15)],
    'Hill Repeats':[SP(3,30)],
    'Easy Run':    [X('Dead Bug (each side)',3,10)],
    'Long Run':    [M('Stretch Flow',1,10)]
  }),
  'run-a': () => ({
    'Kilometer Repeats': [X('Single-Leg Calf Raise',3,15)],
    'Tempo Run':         [CP(3,20)],
    'Easy Run':          [X('Dead Bug (each side)',3,10)],
    'Long Run':          [M('Stretch Flow',1,10)],
    'Run Strength':      [X('Hanging Knee Raise',3,12)]
  }),
  'run-s': () => ({
    'Intervals':   [X('Single-Leg Calf Raise',3,20)],
    'Race Pace':   [CP(3,25)],
    'Easy Run':    [X('Dead Bug (each side)',3,10)],
    'Long Run':    [M('Stretch Flow',1,12)],
    'Run Strength':[X('Hanging Leg Raise',3,12)]
  }),

  /* Athlete (hers): knee-safe landings and hamstrings on every day */
  'sport-e': w => ({
    'Movement & Landing': [X('Single-Leg Balance Reach (each side)',3,6)],
    'Speed & Agility':    [X('Glute Bridge',3,15)],
    'Conditioning':       [SP(3,20+5*w)]
  }),
  'sport-d': () => ({
    'Lower Body':             [X('Nordic Curl Negative',3,3), CP(3,15)],
    'Upper Body':             [P('Face Pull',3,15), X('Plank',3,40,'sec')],
    'Agility & Conditioning': [X('Single-Leg Balance Reach (each side)',3,8)]
  }),
  'sport-c': () => ({
    'Lower Power':     [X('Nordic Curl Negative',3,4), X('Single-Leg Calf Raise',3,15)],
    'Upper Power':     [P('Face Pull',3,15), X('Dead Bug (each side)',3,10)],
    'Speed & Agility': [CP(3,20)],
    'Conditioning':    [X('Single-Leg Balance Reach (each side)',3,8)]
  }),
  'sport-b': () => ({
    'Jump Power':     [X('Nordic Curl Negative',3,5), CP(3,25)],
    'Upper Power':    [P('Face Pull',3,15), X('Hanging Knee Raise',3,12)],
    'Speed & Cuts':   [X('Single-Leg Balance Reach (each side)',3,8)],
    'Strength':       [X('Pallof Press (each side)',3,10)]
  }),
  'sport-a': () => ({
    'Contrast Lower': [X('Nordic Curl',3,4), CP(3,30)],
    'Contrast Upper': [P('Face Pull',3,15), X('Hanging Leg Raise',3,12)],
    'Game Speed':     [X('Pallof Press (each side)',3,10)],
    'Conditioning':   [SP(3,30)]
  }),
  'sport-s': () => ({
    'Lower Power':         [X('Nordic Curl',4,4), CP(3,30)],
    'Upper Power':         [P('Face Pull',3,15), X('Hanging Leg Raise',3,12)],
    'Speed':               [X('Pallof Press (each side)',3,12)],
    'Conditioning':        [SP(3,40)],
    'Recovery & Movement': [X('Dead Bug (each side)',2,10)]
  })
});

// Pilates sets: reps or seconds of controlled work; quality over speed
const PI = (name, n, reps, note) => X(name, n, reps, null, note);
const PS = (name, n, sec, note) => X(name, n, sec, 'sec', note);

PROGRAMS.push(
  /* ===== Glutes & Legs ===== */
  arc('glute','E','Peach Seed Arc','Bodyweight and band work that teaches your glutes to fire. Three days, no gym needed.', WN_BUILD, w => [
    {name:'Glute Basics', ex:[X('Glute Bridge',3,15+2*w), X('Bodyweight Squat',3,12+2*w), X('Donkey Kick (each leg)',3,12+w), X('Fire Hydrant (each leg)',3,12+w)]},
    {name:'Legs & Core', ex:[X('Reverse Lunge (each leg)',3,8+w), X('Sumo Squat',3,15+w), X('Clamshell (each side)',3,15), X('Side-Lying Leg Raise (each side)',3,12+w)]},
    {name:'Booty Burn', ex:[X('Single-Leg Glute Bridge (each leg)',3,8+w), X('Squat Pulse',3,20), X('Frog Pump',3,20+2*w), X('Curtsy Lunge (each leg)',3,8+w)]}
  ]),
  arc('glute','D','Booty Band Arc','Dumbbells and bands: hip thrusts, split squats, and kickbacks. Two glute days and an upper day.', WN_DELOAD, w => bb(1, w, [
    ['Glutes A', [['Dumbbell Hip Thrust',null,12],['Goblet Squat',null,12],['Dumbbell Romanian Deadlift',null,12],['Banded Hip Abduction',null,20]]],
    ['Upper & Core', [['Lat Pulldown',null,12],['Dumbbell Shoulder Press',null,12],['Seated Cable Row',null,12],['Dumbbell Curl',null,12]]],
    ['Glutes B', [['Bulgarian Split Squat (each leg)',null,10],['Step-up (each leg)',null,12],['Cable Kickback (each leg)',null,15],['Leg Curl',null,12]]]
  ])),
  arc('glute','C','Hip Thrust Arc','The barbell hip thrust takes center stage. Four days with squats and deadlifts from your maxes.', WN_DELOAD, w => bb(2, w, [
    ['Glute Strength', [['Barbell Hip Thrust',null,10],['Back Squat','squat',8],['Romanian Deadlift',null,10],['Hip Abduction Machine',null,20]]],
    ['Upper Body', [['Lat Pulldown',null,12],['Dumbbell Shoulder Press',null,12],['Seated Cable Row',null,12],['Lateral Raise',null,15]]],
    ['Glute Shape', [['Bulgarian Split Squat (each leg)',null,10],['Cable Kickback (each leg)',null,15],['Glute-Focused Back Extension',null,15],['Walking Lunge (each leg)',null,12]]],
    ['Lower Power', [['Deadlift','deadlift',6],['Leg Press (feet high and wide)',null,12],['Leg Curl',null,12],['Hip Abduction Machine',null,20]]]
  ])),
  arc('glute','B','Sculpted Stride Arc','Heavier thrusts, sumo deadlifts, and single-leg work for strong, shapely legs. Four days.', WN_DELOAD, w => bb(3, w, [
    ['Heavy Thrust', [['Barbell Hip Thrust',null,8],['Sumo Deadlift','deadlift',6],['Bulgarian Split Squat (each leg)',null,10],['Hip Abduction Machine',null,20]]],
    ['Upper Body', [['Assisted Pull-up',null,8],['Incline Dumbbell Press',null,10],['Cable Row',null,12],['Lateral Raise',null,15]]],
    ['Quads & Glutes', [['Back Squat','squat',8],['Leg Press (feet high and wide)',null,12],['Step-up (each leg)',null,10],['Cable Kickback (each leg)',null,15]]],
    ['Hamstrings & Glutes', [['Romanian Deadlift',null,8],['Single-Leg Hip Thrust (each leg)',null,12],['Leg Curl',null,12],['Glute-Focused Back Extension',null,15]]]
  ])),
  arc('glute','A','Powerhouse Arc','Five days: heavy and pump days for glutes, plus an upper day to keep you balanced.', WN_DELOAD, w => bb(4, w, [
    ['Heavy Thrust', [['Barbell Hip Thrust',null,6],['Sumo Deadlift','deadlift',5],['Bulgarian Split Squat (each leg)',null,8],['Hip Abduction Machine',null,20]]],
    ['Upper Body', [['Assisted Pull-up',null,8],['Dumbbell Shoulder Press',null,10],['Chest-Supported Row',null,10],['Lateral Raise',null,15]]],
    ['Quads & Glutes', [['Back Squat','squat',6],['Hack Squat',null,10],['Walking Lunge (each leg)',null,12],['Cable Kickback (each leg)',null,15]]],
    ['Hamstrings & Glutes', [['Romanian Deadlift',null,8],['Single-Leg Hip Thrust (each leg)',null,10],['Leg Curl',null,12],['Glute-Focused Back Extension',null,15]]],
    ['Glute Pump', [['Banded Hip Thrust',null,20],['Cable Pull-Through',null,15],['Curtsy Lunge (each leg)',null,12],['Hip Abduction Machine',null,25]]]
  ])),
  arc('glute','S','Goddess Glute Arc','Peak glute volume with drop sets: heavy thrusts, deep single-leg work, and pump finishers. Master tier.', WN_DELOAD, w => bb(5, w, [
    ['Heavy Thrust', [['Barbell Hip Thrust',null,5],['Sumo Deadlift','deadlift',5],['Deficit Bulgarian Split Squat (each leg)',null,8],['Hip Abduction Machine',null,20]]],
    ['Upper Body', [['Pull-up',null,6],['Dumbbell Shoulder Press',null,10],['Chest-Supported Row',null,10],['Cable Lateral Raise',null,15]]],
    ['Quads & Glutes', [['Back Squat','squat',5],['Hack Squat',null,10],['Walking Lunge (each leg)',null,12],['Cable Kickback (each leg)',null,15]]],
    ['Hamstrings & Glutes', [['Romanian Deadlift',null,6],['Single-Leg Hip Thrust (each leg)',null,10],['Leg Curl',null,12],['Glute-Focused Back Extension',null,15]]],
    ['Glute Pump', [['Banded Hip Thrust',null,25],['Cable Pull-Through',null,15],['Curtsy Lunge (each leg)',null,12],['Hip Abduction Machine',null,30]]]
  ])),

  /* ===== Sculpt & Tone ===== */
  arc('sculpt','E','First Light Arc','Three full-body days with light dumbbells. Build the habit and feel every muscle work.', WN_DELOAD, w => bb(0, w, [
    ['Full Body A', [['Goblet Squat',null,12],['Dumbbell Chest Press',null,12],['Dumbbell Row',null,12],['Dumbbell Shoulder Press',null,12]]],
    ['Full Body B', [['Dumbbell Romanian Deadlift',null,12],['Lat Pulldown',null,12],['Reverse Lunge (each leg)',null,10],['Triceps Kickback',null,15]]],
    ['Full Body C', [['Step-up (each leg)',null,12],['Seated Cable Row',null,12],['Lateral Raise',null,15],['Dumbbell Curl',null,12]]]
  ])),
  arc('sculpt','D','Toned Arc','Upper and lower days, twice a week. Lean muscle and definition from head to toe.', WN_DELOAD, w => bb(1, w, [
    ['Upper A', [['Dumbbell Chest Press',null,10],['Lat Pulldown',null,12],['Dumbbell Shoulder Press',null,12],['Triceps Pushdown',null,15]]],
    ['Lower A', [['Goblet Squat',null,12],['Dumbbell Hip Thrust',null,12],['Leg Curl',null,12],['Banded Hip Abduction',null,20]]],
    ['Upper B', [['Seated Cable Row',null,12],['Incline Dumbbell Press',null,12],['Lateral Raise',null,15],['Dumbbell Curl',null,12]]],
    ['Lower B', [['Dumbbell Romanian Deadlift',null,12],['Reverse Lunge (each leg)',null,10],['Leg Extension',null,15],['Calf Raise',null,15]]]
  ])),
  arc('sculpt','C','Definition Arc','Four days with supersets and short rest. Your back, shoulders, glutes and arms start to show.', WN_DELOAD, w => bb(2, w, [
    ['Lower Body', [['Back Squat','squat',10],['Walking Lunge (each leg)',null,12],['Leg Extension',null,15],['Hip Abduction Machine',null,20]]],
    ['Upper Push', [['Dumbbell Chest Press',null,10],['Dumbbell Shoulder Press',null,12],['Lateral Raise',null,15],['Triceps Pushdown',null,15]]],
    ['Glutes & Hamstrings', [['Barbell Hip Thrust',null,10],['Romanian Deadlift',null,10],['Leg Curl',null,12],['Cable Kickback (each leg)',null,15]]],
    ['Upper Pull & Arms', [['Lat Pulldown',null,12],['Seated Cable Row',null,12],['Face Pull',null,15],['Dumbbell Curl',null,12]]]
  ])),
  arc('sculpt','B','Hourglass Arc','Five days that build shoulders, back and glutes while keeping your waist tight. Shape, not just size.', WN_DELOAD, w => bb(3, w, [
    ['Back & Shoulders', [['Lat Pulldown',null,10],['Dumbbell Shoulder Press',null,10],['Cable Lateral Raise',null,15],['Rear Delt Fly',null,15]]],
    ['Glutes', [['Barbell Hip Thrust',null,10],['Bulgarian Split Squat (each leg)',null,10],['Cable Kickback (each leg)',null,15],['Hip Abduction Machine',null,20]]],
    ['Arms & Abs', [['Dumbbell Curl',null,12],['Triceps Pushdown',null,12],['Hammer Curl',null,12],['Cable Crunch',null,15]]],
    ['Legs', [['Back Squat','squat',8],['Romanian Deadlift',null,10],['Leg Extension',null,15],['Leg Curl',null,12]]],
    ['Full Body Burn', [['Dumbbell Thruster',null,12],['Renegade Row (each side)',null,8],['Kettlebell Swing',null,15],['Dumbbell Reverse Lunge (each leg)',null,10]]]
  ])),
  arc('sculpt','A','Sculptor Arc','Five heavier days. More weight, more control, and a body that looks as strong as it is.', WN_DELOAD, w => bb(4, w, [
    ['Back & Shoulders', [['Assisted Pull-up',null,8],['Overhead Press','ohp',8],['Cable Lateral Raise',null,15],['Chest-Supported Row',null,10]]],
    ['Glutes', [['Barbell Hip Thrust',null,8],['Bulgarian Split Squat (each leg)',null,8],['Cable Kickback (each leg)',null,15],['Hip Abduction Machine',null,20]]],
    ['Arms & Abs', [['Barbell Curl',null,10],['Close-Grip Bench Press','bench',10],['Hammer Curl',null,12],['Cable Crunch',null,15]]],
    ['Legs', [['Back Squat','squat',6],['Romanian Deadlift',null,8],['Leg Press',null,12],['Leg Curl',null,12]]],
    ['Full Body Burn', [['Dumbbell Thruster',null,12],['Renegade Row (each side)',null,10],['Kettlebell Swing',null,20],['Dumbbell Reverse Lunge (each leg)',null,12]]]
  ])),
  arc('sculpt','S','Marble Arc','Six days with drop sets and pairing splits. Stage-level shape for experienced lifters.', WN_DELOAD, w => bb(5, w, [
    ['Back & Shoulders', [['Pull-up',null,6],['Overhead Press','ohp',6],['Cable Lateral Raise',null,15],['Chest-Supported Row',null,10]]],
    ['Glutes', [['Barbell Hip Thrust',null,6],['Deficit Bulgarian Split Squat (each leg)',null,8],['Cable Kickback (each leg)',null,15],['Hip Abduction Machine',null,25]]],
    ['Arms & Abs', [['Barbell Curl',null,10],['Close-Grip Bench Press','bench',8],['Overhead Triceps Extension',null,12],['Cable Crunch',null,15]]],
    ['Legs', [['Back Squat','squat',6],['Hack Squat',null,10],['Romanian Deadlift',null,8],['Leg Extension',null,15]]],
    ['Upper Pump', [['Incline Dumbbell Press',null,12],['Lat Pulldown',null,12],['Rear Delt Fly',null,20],['Lateral Raise',null,20]]],
    ['Lower Pump', [['Banded Hip Thrust',null,20],['Walking Lunge (each leg)',null,15],['Leg Curl',null,15],['Hip Abduction Machine',null,30]]]
  ])),

  /* ===== Pilates & Core ===== */
  arc('pilates','E','Mat Arc','Breathing, core control, and posture on the mat. Gentle, low impact, and done at home.', WN_BUILD, w => [
    {name:'Core Basics', ex:[PI('The Hundred',1,50+10*w,'Pump the arms, breathe in for 5, out for 5. Head down if your neck strains.'), PI('Pelvic Curl',3,8+w), PI('Dead Bug (each side)',3,6+w), PI('Bird Dog (each side)',3,8)]},
    {name:'Posture & Mobility', ex:[PI('Cat-Cow',2,10), PI('Swan Prep',3,6+w), PI('Side-Lying Leg Lift (each side)',2,10+w), PI('Spine Stretch Forward',2,6), M('Child\'s Pose',1,2)]},
    {name:'Full Mat Flow', ex:[PI('Roll-Down',3,5+w), PI('Single-Leg Stretch (each side)',3,8+w), PI('Leg Circles (each leg)',2,6), PS('Plank',3,20+5*w)]}
  ]),
  arc('pilates','D','Flow Arc','The classic mat series starts to link up: roll-ups, criss-cross, the saw, and swimming.', WN_BUILD, w => [
    {name:'Core Series', ex:[PI('The Hundred',1,100), PI('Roll-Up',3,5+w,'Peel up one bone at a time'), PI('Double-Leg Stretch',3,8+w), PI('Criss-Cross (each side)',3,8+w)]},
    {name:'Back & Glutes', ex:[PI('Swimming',3,20+5*w,'Small, quick flutters'), PI('Single-Leg Kick (each side)',3,8), PI('Pelvic Curl',3,10), PI('Side Kick Series (each side)',2,10+w)]},
    {name:'Flow & Stretch', ex:[PI('Saw (each side)',3,6), PI('Rolling Like a Ball',3,8), PS('Side Plank (each side)',3,15+5*w), PI('Mermaid Stretch (each side)',2,5)]}
  ]),
  arc('pilates','C','Powerhouse Arc','Four days. Teaser prep, corkscrews, side kicks, and Pilates push-ups build a strong center.', WN_BUILD, w => [
    {name:'Core Power', ex:[PI('The Hundred',1,100), PI('Roll-Up',3,6+w), PI('Teaser Prep',3,5+w), PI('Corkscrew (each way)',3,5)]},
    {name:'Glutes & Legs', ex:[PI('Side Kick Series (each side)',3,12+w), PI('Single-Leg Bridge (each leg)',3,8+w), PI('Clamshell (each side)',3,15), PI('Inner Thigh Lift (each side)',3,12)]},
    {name:'Back & Posture', ex:[PI('Swan',3,6+w), PI('Swimming',3,30), PI('Single-Leg Kick (each side)',3,10), PI('Double-Leg Kick',3,5)]},
    {name:'Full Body Flow', ex:[PI('Pilates Push-up',3,4+w,'Roll down, walk out, one push-up, walk back, roll up'), PI('Saw (each side)',3,6), PS('Side Plank with Leg Lift (each side)',3,15+5*w), PI('Spine Twist (each side)',3,6)]}
  ]),
  arc('pilates','B','Balance Arc','Teasers, swan dives, and standing balance work. Control your body from every angle.', WN_BUILD, w => [
    {name:'Core Control', ex:[PI('The Hundred',1,100,'Legs low, head up'), PI('Teaser',4,4+w), PI('Open-Leg Rocker',3,6+w), PI('Corkscrew (each way)',3,6)]},
    {name:'Glutes & Legs', ex:[PI('Side Kick Series (each side)',3,15), PI('Single-Leg Bridge (each leg)',4,10), PI('Standing Leg Pulse (each leg)',3,20,'Hold a chair or wall'), PI('Inner Thigh Lift (each side)',3,15)]},
    {name:'Back & Extension', ex:[PI('Swan Dive Prep',3,6+w), PI('Swimming',3,40), PI('Double-Leg Kick',3,6), PI('Rocking Prep',3,6)]},
    {name:'Balance & Flow', ex:[PS('Single-Leg Balance (each leg)',3,30+5*w,'Eyes on one spot'), PI('Pilates Push-up',3,5+w), PI('Side Bend (each side)',3,5), PI('Seal',3,8)]}
  ]),
  arc('pilates','A','Control Arc','Advanced mat work: full teasers, rollovers, hip twists, and star. Strength that looks effortless.', WN_BUILD, w => [
    {name:'Advanced Core', ex:[PI('The Hundred',1,100,'Legs at eye level'), PI('Rollover',4,5+w), PI('Teaser',4,6+w,'Hold the top for a breath'), PI('Hip Twist (each way)',3,5+w)]},
    {name:'Glutes & Legs', ex:[PI('Side Kick Kneeling (each side)',3,10+w), PI('Single-Leg Bridge (each leg)',4,12), PI('Shoulder Bridge Kick (each leg)',3,6), PI('Inner Thigh Lift (each side)',3,20)]},
    {name:'Back & Extension', ex:[PI('Swan Dive',3,5+w), PI('Swimming',4,40), PI('Rocking',3,6), PI('Double-Leg Kick',3,8)]},
    {name:'Full Body Control', ex:[PS('Star (each side)',3,10+5*w,'Side plank with the top leg lifted'), PI('Control Balance Prep',3,4), PI('Pilates Push-up',4,6+w), PI('Jackknife Prep',3,5)]}
  ]),
  arc('pilates','S','Lotus Arc','The full advanced mat: jackknife, boomerang, control balance, and crab, plus deep flexibility. Master tier.', WN_BUILD, w => [
    {name:'Master Core', ex:[PI('The Hundred',1,100), PI('Jackknife',4,5+w), PI('Boomerang',4,4+w), PI('Corkscrew Advanced (each way)',3,5+w)]},
    {name:'Glutes & Legs', ex:[PI('Shoulder Bridge Kick (each leg)',4,8+w), PI('Side Kick Kneeling (each side)',3,12+w), PS('Single-Leg Balance with Reach (each leg)',3,40), PI('Pistol Squat to Box (each leg)',3,5+w)]},
    {name:'Back & Extension', ex:[PI('Swan Dive',4,6+w), PI('Rocking',4,8), PI('Crab',3,5), PI('Swimming',4,60)]},
    {name:'Control & Flexibility', ex:[PI('Control Balance (each leg)',3,4+w), PS('Star (each side)',4,20+5*w), PI('Teaser with Leg Lowers',3,5+w), M('Split and Backbend Flow',1,10,'Front splits, bridge, and pigeon')]},
    {name:'Flow Day', ex:[M('Full Mat Flow',1,20+5*w,'The whole series start to finish. Smooth transitions, no rushing.'), PI('Seal',3,10), PI('Spine Twist (each side)',3,8)]}
  ]),

  /* ===== Home Training (both heroes) ===== */
  // No equipment: the floor, a wall, a doorframe, and a bed or couch you already have
  arc('home','E','Bedroom Arc','Squats, knee push-ups, and core on the floor next to your bed. Twenty minutes, no equipment.', WN_BUILD, w => [
    {name:'Legs & Core', ex:[X('Bodyweight Squat',3,10+2*w), X('Glute Bridge',3,12+2*w), X('Reverse Lunge (each leg)',2,6+w), X('Plank',3,20+10*w,'sec')]},
    {name:'Push & Back', ex:[X('Knee Push-up',3,6+2*w), X('Doorframe Row (each arm)',3,8+w,null,'Grip the doorframe, lean back with straight arms, pull your chest to the frame'), X('Superman Hold',3,15+5*w,'sec'), X('Dead Bug (each side)',3,6+w)]},
    {name:'Full Body Circuit', ex:[X('Squat to Calf Raise',3,10+w), X('Mountain Climber (each leg)',3,10+2*w), X('Bird Dog (each side)',3,8), X('Wall Sit',3,20+10*w,'sec')]}
  ]),
  arc('home','D','Living Room Arc','Full push-ups, split squats, and your first circuits. Three days that build real strength at home.', WN_BUILD, w => [
    {name:'Lower Body', ex:[X('Split Squat (each leg)',3,8+w), X('Single-Leg Glute Bridge (each leg)',3,8+w), X('Wall Sit',3,30+10*w,'sec'), X('Calf Raise',3,15+2*w)]},
    {name:'Upper Body', ex:[X('Push-up',4,6+2*w,null,'Knees down for the last reps is fine'), X('Pike Push-up',3,5+w), X('Doorframe Row (each arm)',3,10+w), X('Prone Y-T-W Raise',3,8,null,'Face down, thumbs up. Each letter is one rep.')]},
    {name:'Conditioning', ex:[X('Burpee',3,6+w), X('Jump Squat',3,8+w), X('Shoulder Tap (each side)',3,10+w), X('Hollow Hold',3,15+5*w,'sec')]}
  ]),
  arc('home','C','Home Dojo Arc','Four days: push, legs, back and core, and a HIIT day. Your room becomes the training ground.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Push-up',4,10+2*w), X('Feet-Elevated Pike Push-up',3,6+w,null,'Feet on a bed or couch'), X('Diamond Push-up',3,6+w), X('Plank',3,40+10*w,'sec')]},
    {name:'Leg Day', ex:[X('Bulgarian Split Squat (each leg)',3,8+w,null,'Back foot on a bed or couch'), X('Cossack Squat (each side)',3,6+w), X('Single-Leg Glute Bridge (each leg)',3,12+w), X('Single-Leg Calf Raise',3,12+w)]},
    {name:'Back & Core', ex:[X('Doorframe Row (each arm)',4,12+w), X('Reverse Snow Angel',3,10+w,null,'Face down, arms sweep from hips to overhead'), X('Superman Hold',3,25+5*w,'sec'), X('Hollow Body Rock',3,12+w)]},
    {name:'HIIT Day', ex:[X('Burpee',4,8+w), X('Jumping Lunge',3,10+2*w), X('Mountain Climber (each leg)',3,20+2*w), X('Bear Plank Hold',3,20+5*w,'sec','Knees an inch off the floor')]}
  ]),
  arc('home','B','Four Walls Arc','Archer push-ups, handstand holds on the wall, and your first pistols. Harder moves, same room.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Archer Push-up (each side)',3,4+w), X('Decline Push-up',4,10+w,null,'Feet on a bed or couch'), X('Wall Handstand Hold',4,15+5*w,'sec'), X('Hollow Hold',3,30+5*w,'sec')]},
    {name:'Leg Day', ex:[X('Box Pistol Squat (each leg)',3,5+w,null,'Sit back to the edge of a bed or couch'), X('Nordic Curl Negative',3,3+w,null,'Hook your heels under a couch'), X('Jump Squat',3,12+w), X('Single-Leg Calf Raise',3,15+w)]},
    {name:'Back & Core', ex:[X('Doorframe Row (each arm)',4,15,null,'Lower slowly for 3 seconds'), X('Prone Y-T-W Raise',3,10+w), X('V-Up',3,8+w), SP(3,30+5*w)]},
    {name:'Conditioning', ex:[X('Burpee',5,10+w), X('Tuck Jump',3,8+w), X('Plank Jack',3,15+2*w), X('Skater Hop (each side)',3,10)]}
  ]),
  arc('home','A','Hidden Master Arc','Pseudo planche push-ups, handstand push-up negatives, pistols, and dragon flags. Elite strength from one room.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Pseudo Planche Push-up',4,6+w), X('Wall Handstand Push-up Negative',4,3+w,null,'Lower for 4 seconds'), X('Archer Push-up (each side)',3,6+w), X('Planche Lean',4,15+5*w,'sec')]},
    {name:'Leg Day', ex:[X('Pistol Squat (each leg)',4,4+w), X('Shrimp Squat (each leg)',3,4+w), X('Nordic Curl Negative',4,4+w,null,'Hook your heels under a couch'), X('Jumping Lunge',3,12+2*w)]},
    {name:'Back & Core', ex:[X('Doorframe Row (each arm)',4,15+w,null,'Lower slowly for 3 seconds'), X('Reverse Snow Angel',4,12+w), X('Dragon Flag Negative',3,3+w,null,'Hold a heavy couch or bed frame behind your head'), X('Hollow Body Rock',4,15+w)]},
    {name:'Conditioning', ex:[X('Burpee',5,12+w), X('Tuck Jump',4,10), X('Mountain Climber (each leg)',4,30), X('Wall Sit',3,60+15*w,'sec')]}
  ]),
  arc('home','S','One-Room Legend Arc','Five days: handstand push-ups, one-arm push-up work, full pistols, and Nordic curls. Master tier, zero equipment.', WN_BUILD, w => [
    {name:'Push Day', ex:[X('Wall Handstand Push-up',5,3+w), X('Freestanding Handstand',6,10+5*w,'sec','Kick up, hold, repeat'), X('Pseudo Planche Push-up',4,8+w), X('One-Arm Push-up Negative (each arm)',3,3+w,null,'Feet wide, lower for 4 seconds')]},
    {name:'Leg Day', ex:[X('Pistol Squat (each leg)',5,6+w), X('Shrimp Squat (each leg)',4,6+w), X('Nordic Curl',3,4+w,null,'Hook your heels under a couch'), X('Single-Leg Calf Raise',4,20)]},
    {name:'Back & Core', ex:[X('Doorframe Row (each arm)',5,15+w,null,'Pause with your chest at the frame'), X('Reverse Snow Angel',4,15), X('Dragon Flag Negative',4,4+w,null,'Hold a heavy couch or bed frame behind your head'), X('Hollow Hold',4,45+5*w,'sec')]},
    {name:'Conditioning', ex:[X('Burpee',6,12+w), X('Tuck Jump',4,12), X('Plank Jack',4,20), X('Wall Sit',3,90,'sec')]},
    {name:'Flow Day', ex:[M('Full Body Flow',1,15+5*w,'Squats, push-ups, lunges, and planks back to back. Keep moving.'), X('Cossack Squat (each side)',3,8+w), SP(3,45)]}
  ]),

  /* ===== Strong Girl ===== */
  arc('strong','E','First Barbell Arc','Learn the squat, bench, deadlift, and press with light weight, plus hip thrusts. Every rep should look the same.', WN_BUILD, w => { const p = [.50,.55,.60,.65][w]; return [
    {name:'Squat & Bench', ex:[L('squat',3,p,6,{note:'Technique first. Film one set.'}), L('bench',3,p,6), P('Goblet Squat',2,10)]},
    {name:'Deadlift & Press', ex:[L('deadlift',3,p,5,{note:'Reset at the floor every rep'}), L('ohp',3,p,6), P('Assisted Pull-up',3,6)]},
    {name:'Practice Day', ex:[L('squat',3,p,6), L('bench',3,p,6), P('Dumbbell Romanian Deadlift',3,10)]}
  ]; }),
  arc('strong','D','Plate Up Arc','Add weight every week on the big lifts. Three full-body days built on sets of five and six.', WN_BUILD, w => { const p = [.68,.705,.73,.755][w]; return [
    {name:'Day A', ex:[L('squat',3,p,5), L('bench',3,p,6), P('Barbell Row',3,8)]},
    {name:'Day B', ex:[L('deadlift',2,p+.05,5), L('ohp',3,p,6), P('Barbell Hip Thrust',3,8)]},
    {name:'Day C', ex:[L('squat',3,p,5), L('bench',3,p,6), X('Pull-up Negative',3,3,null,'Jump to the top, lower for 5 seconds')]}
  ]; }),
  arc('strong','C','Iron Lady Arc','Four days. Squat, bench, and deadlift wave through 5s, 3s, and 5/3/1, and the fourth day pairs heavy hip thrusts with the press.', ['5s Week','3s Week','5/3/1 Week','Recovery Week'], w => {
    const v = l => w < 3 ? [L(l, 3, .60, l === 'deadlift' ? 5 : 8, {name:LIFTS[l] + ' · Volume'})] : [];
    return [
      {name:'Squat Day', ex:[main('squat', WAVE[w]), ...v('squat'), P('Bulgarian Split Squat (each leg)',3,8)]},
      {name:'Bench Day', ex:[main('bench', WAVE[w]), ...v('bench'), P('Dumbbell Row',3,10), P('Assisted Pull-up',3,8)]},
      {name:'Deadlift Day', ex:[main('deadlift', WAVE[w]), ...v('deadlift'), P('Romanian Deadlift',3,8)]},
      {name:'Thrust & Press Day', ex:[P('Barbell Hip Thrust',4,[8,6,5,8][w],'Heavy. Pause at the top.'), main('ohp', WAVE[w]), P('Lat Pulldown',3,10)]}
    ];
  }, {tm:.9}),
  arc('strong','B','Steel Wave Arc','Heavy triples on one lift and volume on another, four days a week. Heavy days end with a rep-out.', ['Wave 1','Wave 2','Wave 3','Recovery Week'], w => {
    const h = [.80,.825,.85,.70][w], v = [.65,.675,.70,.55][w], am = w < 3;
    return [
      {name:'Heavy Squat', ex:[L('squat',5,h,3,{amrap:am}), L('bench',4,v,8,{name:'Bench Press · Volume'}), P('Walking Lunge (each leg)',3,10)]},
      {name:'Heavy Pull', ex:[L('deadlift',4,h,3,{amrap:am}), L('ohp',4,v+.05,6,{name:'Overhead Press · Volume'}), P('Assisted Pull-up',4,6)]},
      {name:'Heavy Bench', ex:[L('bench',5,h,3,{amrap:am}), L('squat',4,v+.05,6,{name:'Back Squat · Volume'}), P('Dumbbell Row',4,10)]},
      {name:'Glutes & Speed', ex:[P('Barbell Hip Thrust',4,6,'Heavy. Pause at the top.'), L('deadlift',6,v,2,{name:'Speed Deadlift',note:'Move it fast. 60 sec rest.'}), X('Back Extension',3,12)]}
    ];
  }),
  arc('strong','A','Valkyrie Arc','Three heavy days, each with a main lift, a secondary lift, and heavy glute work. Sets of 5 climb to near-max singles.', ['Volume Week','Build Week','Intensity Week','Peak Week'], w => [
    {name:'Squat Focus', ex:[lbMain('squat', w), lbSec('bench', w), P('Barbell Hip Thrust',4,6), P('Barbell Row',3,8)]},
    {name:'Pull Focus',  ex:[lbMain('deadlift', w), lbSec('ohp', w), P('Pull-up',4,5,'Use a band until 4 × 5 is clean'), X('Back Extension',3,12)]},
    {name:'Press Focus', ex:[lbMain('bench', w), lbSec('squat', w), P('Dumbbell Row',3,10), P('Bulgarian Split Squat (each leg)',3,8)]}
  ]),
  arc('strong','S','Platform Queen Arc','A four-week peak that ends in test week. Heavy singles, a taper, then new maxes on all three lifts.', ['Peak 1','Peak 2','Taper','Test Week'], w => w === 3
    ? [testDay('squat'), testDay('bench'), testDay('deadlift')]
    : [
      {name:'Squat Day', ex:[main('squat', PEAK[w]), main('bench', rep(3,.70,3), 'Bench Press · Practice')]},
      {name:'Bench Day', ex:[main('bench', PEAK[w]), main('ohp', rep(3,.70,5), 'Overhead Press · Practice')]},
      {name:'Deadlift Day', ex:[main('deadlift', PEAK[w]), P('Barbell Hip Thrust',3,5,'Heavy but crisp')]}
    ]),

  /* ===== Cardio & Run ===== */
  arc('run','E','Hot Girl Walk Arc','Incline walks, walk-jog intervals, and simple strength. The easiest way to start loving cardio.', WN_BUILD, w => [
    {name:'Incline Walk', ex:[M('Incline Walk',1,20+5*w,'About 10–12% incline at a brisk pace. Don\'t hold the rails.')]},
    {name:'Walk-Jog', ex:[M('Walk-Jog Intervals',1,20+2*w,`Jog ${[1,1,1.5,2][w]} min, walk 2 min, repeat`)]},
    {name:'Strength for Runners', ex:[X('Bodyweight Squat',3,12+2*w), X('Reverse Lunge (each leg)',3,8+w), X('Glute Bridge',3,15), PS('Plank',3,20+10*w)]}
  ]),
  arc('run','D','Couch to 5K Arc','Run-walk days that stretch your running a little more each week. Finish able to run 20 minutes straight.', WN_BUILD, w => { const r = [['run 2, walk 1.5',22],['run 3, walk 1.5',24],['run 5, walk 2',26],['run 8, walk 2',28]][w]; return [
    {name:'Run-Walk A', ex:[M('Run-Walk Intervals',1,r[1],`${r[0]} min, repeat. Easy pace: you can talk.`)]},
    {name:'Run-Walk B', ex:[M('Run-Walk Intervals',1,r[1],`${r[0]} min, repeat`), X('Bodyweight Squat',3,15)]},
    {name:'Run-Walk C', ex:[M(w === 3 ? 'Continuous Run' : 'Run-Walk Intervals',1,w === 3 ? 20 : r[1],w === 3 ? '20 minutes, no walking. You\'ve got this.' : `${r[0]} min, repeat`)]}
  ]; }),
  arc('run','C','5K Arc','Easy runs, 400 m repeats, a long run, and strength for runners. Run a full 5K and start getting faster.', WN_DELOAD, w => [
    {name:'Easy Run', ex:[M('Easy Run',1,[25,28,30,22][w],'Conversational pace')]},
    {name:'Intervals', ex:[M('Easy Jog Warm-up',1,8), D('400 m Repeat',[5,6,7,4][w],400,'5K effort. Walk 90 sec between.'), M('Easy Jog Cool-down',1,5)]},
    {name:'Long Run', ex:[M('Long Run',1,[35,40,45,30][w],'Slow and steady. Distance, not speed.')]},
    {name:'Run Strength', ex:[P('Goblet Squat',3,10), P('Dumbbell Romanian Deadlift',3,10), X('Step-up (each leg)',3,10), X('Single-Leg Glute Bridge (each leg)',3,10)]}
  ]),
  arc('run','B','Tempo Arc','Tempo runs and hill repeats teach you to run hard and stay relaxed. Four days.', WN_DELOAD, w => [
    {name:'Tempo Run', ex:[M('Easy Jog Warm-up',1,10), M('Tempo Run',1,[15,18,20,12][w],'Comfortably hard: a few words at a time'), M('Easy Jog Cool-down',1,5)]},
    {name:'Hill Repeats', ex:[M('Easy Jog Warm-up',1,10), D('Hill Repeat',[6,7,8,5][w],60,'Strong effort up, jog down'), X('Glute Bridge',3,15)]},
    {name:'Easy Run', ex:[M('Easy Run',1,[30,30,35,25][w]), X('Reverse Lunge (each leg)',3,10)]},
    {name:'Long Run', ex:[M('Long Run',1,[45,50,55,40][w],'Easy pace the whole way')]}
  ]),
  arc('run','A','10K Arc','Kilometer repeats, tempo, and long runs up to an hour plus. Race a 10K at the end of it.', WN_DELOAD, w => [
    {name:'Kilometer Repeats', ex:[M('Easy Jog Warm-up',1,10), D('1 km Repeat',[4,5,5,3][w],1000,'10K effort. Jog 2 min between.'), M('Easy Jog Cool-down',1,5)]},
    {name:'Tempo Run', ex:[M('Easy Jog Warm-up',1,10), M('Tempo Run',1,[20,22,25,15][w]), M('Easy Jog Cool-down',1,5)]},
    {name:'Easy Run', ex:[M('Easy Run',1,35)]},
    {name:'Long Run', ex:[M('Long Run',1,[60,65,70,50][w],'Easy pace. Bring water.')]},
    {name:'Run Strength', ex:[P('Bulgarian Split Squat (each leg)',3,8), P('Romanian Deadlift',3,8), X('Single-Leg Calf Raise',3,15), X('Nordic Curl Negative',3,3)]}
  ]),
  arc('run','S','Distance Queen Arc','Five days built for a half marathon: race-pace runs, intervals, and long runs up to 100 minutes. Master tier.', WN_DELOAD, w => [
    {name:'Intervals', ex:[M('Easy Jog Warm-up',1,10), D('800 m Repeat',[6,7,8,4][w],800,'5K to 10K effort. Jog 90 sec between.'), M('Easy Jog Cool-down',1,8)]},
    {name:'Race Pace', ex:[M('Easy Jog Warm-up',1,10), M('Half-Marathon Pace Run',1,[30,35,40,20][w]), M('Easy Jog Cool-down',1,5)]},
    {name:'Easy Run', ex:[M('Easy Run',1,40)]},
    {name:'Long Run', ex:[M('Long Run',1,[80,90,100,60][w],'Easy pace. Practice fueling past 60 minutes.')]},
    {name:'Run Strength', ex:[P('Bulgarian Split Squat (each leg)',3,8), P('Single-Leg RDL (each leg)',3,8), X('Nordic Curl',3,4), X('Box Jump',3,5)]}
  ]),

  /* ===== Athlete (hers) ===== */
  arc('sport','E','Tryout Arc','Landing mechanics, short sprints, and agility. Builds knees that hold up in volleyball, soccer, and basketball.', WN_BUILD, w => [
    {name:'Movement & Landing', ex:[X('Drop Landing',3,5,null,'Step off a low box, land soft, knees over toes. Stick it for 2 seconds.'), X('Squat Jump',3,5+w,null,'Stick every landing'), X('Lateral Lunge (each side)',3,8), X('Single-Leg Glute Bridge (each leg)',3,10)]},
    {name:'Speed & Agility', ex:[Y('Sprint',6,20,'80% effort. Walk back.'), Y('Lateral Shuffle',4,10), X('Skater Hop (each side)',3,5,null,'Stick each landing for a second'), X('Dead Bug (each side)',3,8)]},
    {name:'Conditioning', ex:[Y('Pro Agility (5-10-5)',4+w,20,'Rest 60 sec'), X('Burpee',3,8), X('Mountain Climber (each leg)',3,15)]}
  ]),
  arc('sport','D','Varsity Arc','Dumbbell strength, box jumps, sprints, and cutting drills. Your first real off-season.', WN_BUILD, w => [
    {name:'Lower Body', ex:[P('Goblet Squat',4,8), X('Box Jump',4,4,null,'Step down, don\'t jump down'), P('Dumbbell RDL',3,10), Y('Sprint',6+w,20,'Full effort')]},
    {name:'Upper Body', ex:[X('Push-up',4,8+w), P('Assisted Pull-up',4,6), P('Dumbbell Shoulder Press',3,10), X('Med Ball Slam',3,10)]},
    {name:'Agility & Conditioning', ex:[X('Agility Ladder',4,20,'sec'), X('Deceleration Drill',4,4,null,'Sprint 10 yd, stop in 3 steps, hips low'), Y('Pro Agility (5-10-5)',5,20), Y('Shuttle Run',3+w,60)]}
  ]),
  arc('sport','C','Court & Field Arc','Squat and bench from your maxes, plyometrics, and game-style agility. Four days.', WN_DELOAD, w => { const p = [.70,.725,.75,.60][w]; return [
    {name:'Lower Power', ex:[L('squat',4,p,5), X('Box Jump',4,4), P('Romanian Deadlift',3,8)]},
    {name:'Upper Power', ex:[L('bench',4,p,6), P('Assisted Pull-up',4,6), P('Dumbbell Row',3,10), X('Med Ball Chest Pass',3,8)]},
    {name:'Speed & Agility', ex:[Y('Sprint',5,20,'From a split stance'), X('Lateral Bound (each side)',3,5,null,'Stick each landing'), X('Deceleration Drill',4,4), Y('Pro Agility (5-10-5)',4,20)]},
    {name:'Conditioning', ex:[Y('Shuttle Run',4+w,60,'45 sec rest'), X('Burpee',3,10), PS('Plank',3,45)]}
  ]; }),
  arc('sport','B','Vertical Arc','Jump higher: approach jumps, depth jumps, hang cleans, and heavy squats. Built for volleyball and basketball.', WN_DELOAD, w => { const p = [.75,.78,.82,.65][w]; return [
    {name:'Jump Power', ex:[X('Approach Jump',5,3,null,'Full approach, max height, land on two feet'), L('squat',5,p,3), X('Depth Jump',4,4)]},
    {name:'Upper Power', ex:[L('bench',4,p,5), P('Push Press',4,5), P('Pull-up',4,5,'Use a band if needed'), X('Med Ball Overhead Throw',3,6)]},
    {name:'Speed & Cuts', ex:[Y('Sprint',6,10,'From a stance'), X('Lateral Bound (each side)',4,4), X('Deceleration Drill',5,4), Y('Pro Agility (5-10-5)',4,20)]},
    {name:'Strength', ex:[L('clean',4,p - .05,3,{name:'Hang Clean',note:'From your power clean max. Fast and crisp.'}), L('deadlift',3,p,3), P('Bulgarian Split Squat (each leg)',3,8)]}
  ]; }),
  arc('sport','A','Game Day Arc','Contrast lifting, reaction starts, and game-pace conditioning. Explosive and in shape at the same time.', WN_DELOAD, w => { const p = [.80,.83,.86,.68][w]; return [
    {name:'Contrast Lower', ex:[L('squat',4,p,3,{amrap:w<3,note:'Superset each set with 3 box jumps'}), X('Box Jump',4,3), L('clean',4,p - .05,2,{name:'Hang Clean'})]},
    {name:'Contrast Upper', ex:[L('bench',4,p,3,{amrap:w<3}), X('Med Ball Chest Throw',4,4), P('Pull-up',4,5)]},
    {name:'Game Speed', ex:[Y('Reaction Start',8,10,'Go on a clap or a partner call'), X('Mirror Drill',6,10,'sec'), X('Approach Jump',4,3), Y('Pro Agility (5-10-5)',4,20)]},
    {name:'Conditioning', ex:[L('deadlift',3,p,3), Y('Shuttle Run',6+w,60,'Game pace'), X('Ab Wheel Rollout',3,8)]}
  ]; }),
  arc('sport','S','MVP Arc','Five days: power cleans, heavy doubles, max jumps, game speed, and a recovery day. Master tier.', WN_DELOAD, w => { const p = [.82,.86,.90,.70][w]; return [
    {name:'Lower Power', ex:[L('clean',5,p - .02,2,{note:'Explode from the floor; catch it high'}), L('squat',5,p,2,{amrap:w<3}), X('Depth Jump',5,3)]},
    {name:'Upper Power', ex:[L('bench',5,p,3,{amrap:w<3}), P('Push Press',4,3), P('Weighted Pull-up',4,4)]},
    {name:'Speed', ex:[Y('Sprint',8,10), Y('Flying Sprint',5,20), X('Approach Jump',5,3), X('Deceleration Drill',5,4)]},
    {name:'Conditioning', ex:[L('deadlift',3,p,2), Y('Shuttle Run',8+w,60,'Game pace'), X('Ab Wheel Rollout',4,10)]},
    {name:'Recovery & Movement', ex:[M('Easy Bike or Jog',1,20), M('Mobility Flow',1,10), X('Single-Leg Balance Reach (each side)',3,8)]}
  ]; })
);

/* ---------- Custom arcs ---------- */
// An arc you build is saved as a plain plan ({id, name, perWeek, weeks, wave, days:[{name, ex:[...]}]}) and
// turned into a regular arc here. Each exercise is {name, kind, sets, reps, unit?, lift?, pct?}: kind 'lift'
// uses a % of one of your maxes, 'pick' is a weight you choose, 'body' is reps, seconds, minutes or distance.
const CUSTOM_SET_CAP = 30;
const WAVE_NAMES = ['Base Week', 'Build Week', 'Push Week', 'Recovery Week'];
const defaultPct = reps => reps <= 3 ? .85 : reps <= 5 ? .78 : reps <= 8 ? .70 : reps <= 10 ? .65 : .60;
const daySets = day => day.ex.reduce((a, x) => a + x.sets, 0);
function buildCustom(def){
  const weekNames = [], weeks = [];
  for (let w = 0; w < def.weeks; w++){
    // The wave: base, a little heavier, heavier still with a rep-out, then an easier week; each 4-week block starts a bit higher
    const ph = def.wave ? w % 4 : -1, block = Math.floor(w / 4);
    weekNames.push(def.wave ? WAVE_NAMES[ph] + (def.weeks > 4 ? ` ${block + 1}` : '') : `Week ${w + 1}`);
    const pctAdd = def.wave ? (ph === 3 ? -.10 : ph * .025) + block * .025 : 0, setAdd = ph === 3 ? -1 : 0;
    weeks.push({days:def.days.map(day => ({name:day.name, ex:[WARMUP.custom(), ...day.ex.map(x => {
      const n = Math.max(1, x.sets + setAdd);
      if (x.kind === 'lift'){ const s = rep(n, Math.min(1.05, Math.max(.3, (x.pct || defaultPct(x.reps)) + pctAdd)), x.reps); if (ph === 2) s[n - 1] = [...s[n - 1].slice(0, 2), 1]; return main(x.lift, s, x.name); }
      if (x.kind === 'pick') return P(x.name, n, x.reps);
      return X(x.name, n, x.reps, x.unit || null);
    })]}))});
  }
  // Stats follow what you train: weights build STR, sprints SPD, timed cardio END, holds and bodyweight TEC and END
  const w = {str:0, spd:0, end:0, tec:0};
  for (const day of def.days) for (const x of day.ex){
    if (x.kind !== 'body') w.str += x.sets; else if (x.unit === 'm' || x.unit === 'yd') w.spd += x.sets; else if (x.unit === 'min') w.end += x.sets;
    else if (x.unit === 'sec') w.tec += x.sets; else { w.end += x.sets / 2; w.tec += x.sets / 2; } }
  const tot = Object.values(w).reduce((a, b) => a + b, 0) || 1;
  const statW = Object.fromEntries(Object.entries(w).filter(([, v]) => v).map(([k, v]) => [k, Math.round(v / tot * 40) / 10]));
  return {id:def.id, path:'custom', rank:'C', name:def.name, custom:true, statW,
    blurb:`Built by you: ${def.days.map(d => d.name).join(', ')}.`, weekNames, weeks, tm:1,
    needsMax:def.days.some(d => d.ex.some(x => x.kind === 'lift'))};
}
let CUSTOM_CACHE = {key:null, list:[]};
function customProgs(){ const key = JSON.stringify(S.customArcs || []); if (CUSTOM_CACHE.key !== key) CUSTOM_CACHE = {key, list:(S.customArcs || []).map(buildCustom)}; return CUSTOM_CACHE.list; }
const allProgs = () => [...PROGRAMS, ...customProgs()];
// Every exercise the app knows, with how it's measured, for the builder's library (built once on first use)
let EX_LIB = null;
function exLibrary(){
  if (EX_LIB) return EX_LIB;
  const m = new Map();
  for (const [l, name] of Object.entries(LIFTS)) m.set(name, {name, kind:'lift', lift:l});
  for (const p of PROGRAMS) for (const wv of p.weeks) for (const d of wv.days) for (const x of d.ex){
    if (/warm-up/i.test(x.name) || m.has(x.name)) continue;
    m.set(x.name, x.lift ? {name:x.name, kind:'lift', lift:x.lift} : x.sets[0].pick ? {name:x.name, kind:'pick'} : {name:x.name, kind:'body', unit:x.sets[0].unit || null}); }
  for (const [orig, alts] of Object.entries(SWAPS)){ const o = m.get(orig); for (const a of alts) if (!m.has(a)) m.set(a, o && o.kind !== 'lift' ? {...o, name:a} : {name:a, kind:'pick'}); }
  const cat = e => e.kind === 'lift' ? 'Big lifts' : e.unit === 'm' || e.unit === 'yd' || e.unit === 'min' || /sprint|run|rope|bag|shadow|burpee|skip|bound|agility|carry|tabata|shuffle|dash|3-cone/i.test(e.name) ? 'Cardio and speed'
    : /plank|hollow|crunch|sit-up|twist|rollout|dead bug|bird dog|l-sit|v-sit|dragon|pallof|leg raise|knee raise|toes-to-bar|body saw/i.test(e.name) ? 'Core'
    : /row|pull|chin|curl|lat |pulldown|face pull|rear delt|shrug|lever|muscle-up|pull-apart|skin the cat|dead hang/i.test(e.name) ? 'Pull'
    : /press|push-up|dip|bench|fly|pec|triceps|pushdown|skull|lateral|handstand|planche/i.test(e.name) ? 'Push'
    : /squat|lunge|leg|calf|glute|hip|deadlift|rdl|nordic|step-up|pistol|split|thrust|jump|box|good morning|clean/i.test(e.name) ? 'Legs' : 'Other';
  EX_LIB = [...m.values()].map(e => ({...e, cat:cat(e)})).sort((a, b) => a.name.localeCompare(b.name));
  return EX_LIB;
}
const EX_CATS = ['Big lifts', 'Push', 'Pull', 'Legs', 'Core', 'Cardio and speed', 'Other'];
// A new exercise row for the builder, with sensible starting numbers for its kind
function newEx(e){
  if (e.kind === 'lift') return {name:e.name, kind:'lift', lift:e.lift, sets:3, reps:5, pct:defaultPct(5)};
  if (e.kind === 'pick') return {name:e.name, kind:'pick', sets:3, reps:10};
  const u = e.unit || null; return {name:e.name, kind:'body', unit:u, sets:3, reps:u === 'sec' ? 30 : u === 'min' ? 3 : u === 'm' ? 40 : u === 'yd' ? 40 : 10};
}
// Remix: an existing arc's first week as a starting plan
function remixOf(p){
  return {name:`${p.name.replace(/ Arc$/, '')} Remix`, perWeek:p.weeks[0].days.length, weeks:4, wave:true,
    days:p.weeks[0].days.map(d => ({name:d.name, ex:d.ex.filter(x => !/warm-up/i.test(x.name)).map(x => {
      const n = x.sets.length, s0 = x.sets[0];
      if (x.lift) return {name:x.name, kind:'lift', lift:x.lift, sets:n, reps:s0.reps, pct:Math.round(s0.pct * 100) / 100};
      if (s0.pick) return {name:x.name, kind:'pick', sets:n, reps:s0.reps};
      return {name:x.name, kind:'body', unit:s0.unit || null, sets:n, reps:s0.reps}; }).slice(0, 12)}))};
}

/* ---------- Character sprites (from character.js: one animated sprite per rank, F to SSS) ---------- */
const CHARACTER_RANKS = {"F": {"name": "Newcomer", "src": "art/hero-m-01.png", "still": "art/hero-m-02.png"}, "E": {"name": "Rookie", "src": "art/hero-m-03.png", "still": "art/hero-m-04.png"}, "D": {"name": "Trainee", "src": "art/hero-m-05.png", "still": "art/hero-m-06.png"}, "C": {"name": "Fighter", "src": "art/hero-m-07.png", "still": "art/hero-m-08.png"}, "B": {"name": "Elite", "src": "art/hero-m-09.png", "still": "art/hero-m-10.png"}, "A": {"name": "Champion", "src": "art/hero-m-11.png", "still": "art/hero-m-12.png"}, "S": {"name": "Legend", "src": "art/hero-m-13.png", "still": "art/hero-m-14.png"}, "SS": {"name": "Mythic", "src": "art/hero-m-15.png", "still": "art/hero-m-16.png"}, "SSS": {"name": "Ascended", "src": "art/hero-m-17.png", "still": "art/hero-m-18.png"}};
// Female character sprites: same format as character.js (ranks F to SSS, each {name, src, still}).
// From characterfemale.js.
const CHARACTER_RANKS_F = {"F": {"name": "Newcomer", "src": "art/hero-f-01.png", "still": "art/hero-f-02.png"}, "E": {"name": "Rookie", "src": "art/hero-f-03.png", "still": "art/hero-f-04.png"}, "D": {"name": "Trainee", "src": "art/hero-f-05.png", "still": "art/hero-f-06.png"}, "C": {"name": "Fighter", "src": "art/hero-f-07.png", "still": "art/hero-f-08.png"}, "B": {"name": "Elite", "src": "art/hero-f-09.png", "still": "art/hero-f-10.png"}, "A": {"name": "Champion", "src": "art/hero-f-11.png", "still": "art/hero-f-12.png"}, "S": {"name": "Legend", "src": "art/hero-f-13.png", "still": "art/hero-f-14.png"}, "SS": {"name": "Mythic", "src": "art/hero-f-15.png", "still": "art/hero-f-16.png"}, "SSS": {"name": "Ascended", "src": "art/hero-f-17.png", "still": "art/hero-f-18.png"}};
// Rank-up transformation strips, one per rank step for each character (from rankup.js):
// 36 frames of 192x224 side by side, 80ms each; the new rank is revealed on frame 16.
const CHARACTER_RANKUPS = {"m": {"F>E": "art/rankup-01.png", "E>D": "art/rankup-02.png", "D>C": "art/rankup-03.png", "C>B": "art/rankup-04.png", "B>A": "art/rankup-05.png", "A>S": "art/rankup-06.png", "S>SS": "art/rankup-07.png", "SS>SSS": "art/rankup-08.png"}, "f": {"F>E": "art/rankup-09.png", "E>D": "art/rankup-10.png", "D>C": "art/rankup-11.png", "C>B": "art/rankup-12.png", "B>A": "art/rankup-13.png", "A>S": "art/rankup-14.png", "S>SS": "art/rankup-15.png", "SS>SSS": "art/rankup-16.png"}};
const RANKUP_INFO = { frames: 36, w: 192, h: 224, ms: 80, reveal: 16, ox: 32, oy: 28 };

/* ---------- Character looks (recolor the rank sprites) ---------- */
const CLOTH_COLORS = [['#f3f1f6','White'],['#9a98a8','Gray'],['#2a2833','Black'],['#d83a3a','Red'],['#f08a2c','Orange'],['#f2c94c','Yellow'],['#3ddc97','Mint'],['#1f8a5e','Green'],['#4cc3ff','Sky'],['#3f5fe0','Blue'],['#8a54d6','Purple'],['#ff5c9a','Pink']];
const LOOK_PARTS = [
  {k:'skin',   label:'Skin tone', colors:[['#f6d2b4','Porcelain'],['#eebd94','Light'],['#d9a074','Tan'],['#b97a4f','Medium'],['#93603e','Brown'],['#6a412a','Deep'],['#4a2c1c','Ebony']]},
  {k:'hair',   label:'Hair', colors:[['#1c1520','Black'],['#5b3a26','Brown'],['#b5803a','Caramel'],['#ecc864','Blond'],['#e6e6ee','Silver'],['#c8402e','Red'],['#f28ab8','Pink'],['#3f6fe0','Blue'],['#2fae8a','Teal'],['#8a54d6','Violet'],['#f08a2c','Orange']]},
  {k:'band',   label:'Headband', note:'D, C, B and S-Rank', colors:CLOTH_COLORS},
  {k:'top',    label:'Shirt', colors:CLOTH_COLORS},
  {k:'bottom', label:'Pants', colors:CLOTH_COLORS},
  {k:'shoes',  label:'Shoes', colors:CLOTH_COLORS},
  {k:'cape',   label:'Cape', note:'S-Rank and up', colors:CLOTH_COLORS},
  {k:'aura',   label:'Aura', note:'S-Rank and up', colors:[['#ffd23f','Gold'],['#ff4d7d','Crimson'],['#ff8a3d','Flame'],['#3ddc97','Jade'],['#4cc3ff','Ice'],['#b98cff','Violet'],['#ffffff','White']]}
];
const STAGES = ['Arena','Dusk','Gym','Neon','Dojo','Rooftop','Blossom','Volcano','Storm','Cosmos','Throne'];   // past Neon, each unlocks at a level
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };

// APNG → full-size RGBA frames, so each frame can be repainted.
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b){ let c = ~0; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; }
function pngChunk(type, data){
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length); for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8); dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length))); return out;
}
// Takes the art inline (a data: URL) or as a file next to the app (the app build moves the sprites into art/)
async function decodeApng(dataUrl){
  let u8;
  if (dataUrl.startsWith('data:')){ const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1)); u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); }
  else u8 = new Uint8Array(await (await fetch(dataUrl)).arrayBuffer());
  const dv = new DataView(u8.buffer), SIG = u8.subarray(0, 8);
  let ihdr = null, cur = null; const pre = [], frames = [];
  for (let p = 8; p < u8.length;){
    const len = dv.getUint32(p), type = String.fromCharCode(...u8.subarray(p + 4, p + 8)), data = u8.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') ihdr = data;
    else if (type === 'fcTL'){ const d = new DataView(data.buffer, data.byteOffset); cur = {w:d.getUint32(4), h:d.getUint32(8), x:d.getUint32(12), y:d.getUint32(16), delay:d.getUint16(20) / (d.getUint16(22) || 100) * 1000, dispose:data[24], blend:data[25], parts:[]}; frames.push(cur); }
    else if (type === 'IDAT'){ if (cur) cur.parts.push(data); }
    else if (type === 'fdAT') cur.parts.push(data.subarray(4));
    else if (type !== 'acTL' && type !== 'IEND' && !frames.length) pre.push(pngChunk(type, data));
    p += 12 + len;
  }
  const hv = new DataView(ihdr.buffer, ihdr.byteOffset), W = hv.getUint32(0), H = hv.getUint32(4);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d', {willReadFrequently:true}), out = [];
  for (const f of frames){
    const hd = ihdr.slice(); new DataView(hd.buffer).setUint32(0, f.w); new DataView(hd.buffer).setUint32(4, f.h);
    const bmp = await createImageBitmap(new Blob([SIG, pngChunk('IHDR', hd), ...pre, ...f.parts.map(d => pngChunk('IDAT', d)), pngChunk('IEND', new Uint8Array(0))], {type:'image/png'}));
    const before = f.dispose === 2 ? ctx.getImageData(f.x, f.y, f.w, f.h) : null;
    if (f.blend === 0) ctx.clearRect(f.x, f.y, f.w, f.h);
    ctx.drawImage(bmp, f.x, f.y);
    out.push({data:ctx.getImageData(0, 0, W, H), delay:f.delay || 150});
    if (f.dispose === 1) ctx.clearRect(f.x, f.y, f.w, f.h); else if (before) ctx.putImageData(before, f.x, f.y);
  }
  return {w:W, h:H, frames:out};
}

// Which part each sprite pixel belongs to. Every rank is the same base character, so skin is
// matched by its exact palette, hair by the ramp at the top of the head, clothes by body region.
const PART_IDS = ['keep','skin','hair','band','top','bottom','shoes','cape','aura'];
const SKIN_HEX = new Set(['ba7458','e1a57a','94493b','6e2624','f5cb9b','ffe6b8']);
const BAND_HEX = new Set(['cf3b3b','881332','ab2436','65072c']);
const hex6 = (r, g, b) => ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
function rgbHsl(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn){ const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60; }
  return [h, s, l];
}
function hslRgb(h, s, l){
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return [f(0), f(8), f(4)];
}
const isGold = (h, s, l) => h >= 33 && h <= 52 && s >= .7 && l >= .3;
function partMaps(dec, hasCape, hairZone){
  const W = dec.w, H = dec.h, f0 = dec.frames[0].data.data;
  const hair = new Set(), cape = new Set();
  for (let y = 0; y < 12; y++) for (let x = 0; x < W; x++){
    const i = (y * W + x) * 4; if (f0[i + 3] !== 255) continue;
    const h = hex6(f0[i], f0[i + 1], f0[i + 2]);
    if (SKIN_HEX.has(h) || BAND_HEX.has(h)) continue;
    if (y < 4 || rgbHsl(f0[i], f0[i + 1], f0[i + 2])[2] > .07) hair.add(h);
  }
  // The cape hangs beside the legs below the hands, where nothing else is drawn
  if (hasCape) for (let y = 134; y < 160; y++) for (let x = 0; x < W; x++){
    if (x >= 40 && x <= 88) continue;
    const i = (y * W + x) * 4; if (f0[i + 3] !== 255) continue;
    const h = hex6(f0[i], f0[i + 1], f0[i + 2]), [hu, s, l] = rgbHsl(f0[i], f0[i + 1], f0[i + 2]);
    if (!SKIN_HEX.has(h) && l >= .07 && !isGold(hu, s, l)) cape.add(h);
  }
  return dec.frames.map(fr => {
    const d = fr.data.data, map = new Uint8Array(W * H);
    let dy = 0;   // the idle bob shifts the body down a pixel on some frames
    find: for (let y = 0; y < 4; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] === 255){ dy = y; break find; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
      const p = y * W + x, i = p * 4, a = d[i + 3];
      if (!a) continue;
      if (a < 255){ map[p] = 8; continue; }
      const h = hex6(d[i], d[i + 1], d[i + 2]), Y = y - dy;
      if (SKIN_HEX.has(h)){ map[p] = 1; continue; }
      if (hair.has(h) && (Y <= 31 || (hairZone && hairZone(x, Y)))){ map[p] = 2; continue; }
      if (Y < 40 && BAND_HEX.has(h)){ map[p] = 3; continue; }
      const [hu, s, l] = rgbHsl(d[i], d[i + 1], d[i + 2]);
      if (l < .07 || isGold(hu, s, l)) continue;                     // outlines, gold trim
      const side = x < 42 || x > 86, wrist = x < 36 || x > 91, isCape = side && cape.has(h);
      if (Y >= 44 && Y < 98){ if (isCape && Y >= 60) map[p] = 7; else if (!(Y >= 68 && wrist)) map[p] = 4; continue; }
      if (Y >= 109 && Y < 166){ if (isCape) map[p] = 7; else if (!(wrist && Y < 132)) map[p] = 5; continue; }
      if (Y >= 176 && x >= 36 && x <= 92) map[p] = 6;
    }
    return map;
  });
}

// Hairstyles. The first style in each list is the sprite's own hair. The others were lifted pixel for
// pixel from the hairstyle art: hair is stored as shades of the rank's hair ramp (so it changes color with
// rank and with your hair color pick), and skin, headband and hair-tie pixels are stored as drawn.
// Coordinates are in the original art; the padded sprite adds 16px of headroom above it.
const SPRITE_PAD = 16, SPRITE_W = 128, SPRITE_H = 192 + SPRITE_PAD;
// Hairstyles lifted pixel for pixel from the art (frame 0: the first six from B-Rank, the rest from C-Rank
// art, snapped to the sprite palette). Each pixel is 5 bytes: x, y, flags
// (kind 1 hair shade, 2 skin, 3 headband or hair tie; +4 behind the body, unused; fallback kind << 3), value, fallback.
const IMG_HAIR = {
  'm-crew': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'OQUBCQA6BQEJADsFAQkAPAUBCQA9BQEJAD4FAQkAPwUBCQBABQEJAEEFAQkAQgUBCQBDBQEJADUGAQkANgYBCQA3BgEJADgGAQkAOQYBAwA6BgEBADsGAQMAPAYBAgA9BgEBAD4GAQMAPwYBAgBABgECAEEGAQIAQgYBAwBDBgECAEQGAQkARQYBCQBGBgEJAEcGAQkAMwcBCQA0BwEJADUHAQIANgcBAwA3BwECADgHAQEAOQcBAwA6BwECADsHAQMAPAcBAgA9BwEBAD4HAQMAPwcBAwBABwECAEEHAQIAQgcBAgBDBwECAEQHAQEARQcBAgBGBwECAEcHAQIASAcBCQBJBwEJADIIAQkAMwgBAwA0CAEDADUIAQIANggBAgA3CAECADgIAQIAOQgBAgA6CAECADsIAQIAPAgBAgA9CAECAD4IAQIAPwgBAQBACAECAEEIAQIAQggBAgBDCAECAEQIAQEARQgBAgBGCAECAEcIAQMASAgBAgBJCAECAEoIAQkASwgBCQAxCQEJADIJAQIAMwkBAQA0CQECADUJAQIANgkBAgA3CQECADgJAQIAOQkBAwA6CQECADsJAQEAPAkBAwA9CQEBAD4JAQMAPwkBAQBACQECAEEJAQIAQgkBAgBDCQECAEQJAQIARQkBAgBGCQEBAEcJAQMASAkBAABJCQEAAEoJAQEASwkBAQBMCQEJADAKAQkAMQoBAQAyCgECADMKAQEANAoBAQA1CgECADYKAQIANwoBAgA4CgECADkKAQMAOgoBAgA7CgEBADwKAQMAPQoBAQA+CgEDAD8KAQEAQAoBAgBBCgEBAEIKAQIAQwoBAgBECgEDAEUKAQMARgoBAQBHCgEBAEgKAQAASQoBAwBKCgEBAEsKAQIATAoBCQAwCwEJADELAQEAMgsBAwAzCwEDADQLAQEANQsBAgA2CwECADcLAQIAOAsBAgA5CwEBADoLAQIAOwsBAQA8CwEBAD0LAQEAPgsBAQA/CwEBAEALAQIAQQsBAQBCCwECAEMLAQIARAsBAwBFCwEDAEYLAQMARwsBAQBICwEAAEkLAQMASgsBAQBLCwECAEwLAQIATQsBCQAvDAEJADAMAQIAMQwBAQAyDAECADMMAQIANAwBAgA1DAECADYMAQIANwwBAgA4DAECADkMAQEAOgwBAgA7DAECADwMAQMAPQwBAgA+DAEDAD8MAQIAQAwBAgBBDAEBAEIMAQIAQwwBAABEDAEBAEUMAQEARgwBAwBHDAEBAEgMAQAASQwBAQBKDAEAAEsMAQEATAwBAQBNDAEJAC8NAQkAMA0BAgAxDQECADINAQEAMw0BAwA0DQECADUNAQIANg0BAgA3DQECADgNAQIAOQ0BAQA6DQECADsNAQIAPA0BAwA9DQECAD4NAQMAPw0BAwBADQECAEENAQEAQg0BAQBDDQEAAEQNAQEARQ0BAABGDQEBAEcNAQEASA0BAQBJDQEBAEoNAQAASw0BAQBMDQEAAE0NAQMATg0BCQAvDgEJADAOAQEAMQ4BAQAyDgEBADMOAQMANA4BAgA1DgECADYOAQIANw4BAgA4DgECADkOAQIAOg4BAgA7DgECADwOAQIAPQ4BAgA+DgECAD8OAQMAQA4BAQBBDgEBAEIOAQEAQw4BAABEDgEBAEUOAQAARg4BAQBHDgEBAEgOAQAASQ4BAABKDgEBAEsOAQEATA4BAABNDgECAE4OAQkALw8BCQAwDwEBADEPAQIAMg8BAgAzDwEAADQPAQEANQ8BAAA2DwEBADcPAQEAOA8BAQA5DwEBADoPAQEAOw8BAQA8DwEBAD0PAQEAPg8BAQA/DwEAAEAPAQAAQQ8BAQBCDwEAAEMPAQAARA8BAABFDwEAAEYPAQAARw8BAABIDwEAAEkPAQAASg8BAQBLDwEBAEwPAQAATQ8BAABODwEJAC4QAQkALxABAgAwEAEBADEQAQAAMhABAQAzEAICADQQAgIANRACAgA2EAICADcQAgIAOBACAgA5EAICADoQAgIAOxACAgA8EAICAD0QAgIAPhACAgA/EAICAEAQAgIAQRACAgBCEAICAEMQAgIARBACAgBFEAICAEYQAgIARxACAgBIEAICAEkQAgIAShABAABLEAEAAEwQAQAATRACBAAuEQEJAC8RCwgJMBETBQIxERMFAjIREwUCMxETBQE0ERMFATUREwUBNhETBQE3ERMFATgREwUBORETBQE6ERMFATsREwUBPBETBQE9ERMFAT4REwUBPxETBQFAERMFAUEREwUBQhETBgFDERMGAUQREwYBRRETBgFGERMGAUcREwYBSBETBgFJERMGAUoREwYCSxETBgJMERMGAk0REwgEMBITCAQxEhMGAjISEwYBMxITBgE0EhMGATUSEwYBNhITBgE3EhMGATgSEwYBORITBgE6EhMGATsSEwYBPBITBwE9EhMHAT4SEwcBPxITBwFAEhMHAUESEwcBQhITBwFDEhMHAUQSEwcBRRITBwFGEhMHAUcSEwcBSBITBwFJEhMHAUoSEwcCSxITBwJMEhMHAk0SEwgEMBMTCAIxExMIAjITEwgBMxMTCAE0ExMIATUTEwgBNhMTCAE3ExMIATgTEwgBORMTCAE6ExMIATsTEwgBPBMTCAE9ExMIAT4TEwgBPxMTCAFAExMIAUETEwgBQhMTCAFDExMIAUQTEwgBRRMTCAFGExMIAUcTEwgBSBMTCAFJExMIAUoTEwgCSxMTCAJMExMIAk0TEwgEMBQCBAAxFAICADIUAgEAMxQCAQA0FAIBADUUAgEANhQCAQA3FAIBADgUAgEAORQCAQA6FAIBADsUAgEAPBQCAQA9FAIBAD4UAgEAPxQCAQBAFAIBAEEUAgEAQhQCAQBDFAIBAEQUAgEARRQCAQBGFAIBAEcUAgEASBQCAQBJFAIBAEoUAgIASxQCAgBMFAICAE0UAgQAMBUCBAAxFQICADIVAgEAMxUCAQA0FQIBADUVAgEANhUCAQA3FQIBADgVAgEAORUCAQA6FQIBADsVAgEAPBUCAQA9FQIBAD4VAgEAPxUCAQBAFQIBAEEVAgEAQhUCAQBDFQIBAEQVAgEARRUCAQBGFQIBAEcVAgEASBUCAQBJFQIBAEoVAgIASxUCAgBMFQIEADAWAgQAMRYCAgAyFgIBADMWAgEANBYCAQA1FgIBADYWAgEANxYCAQA4FgIBADkWAgEAOhYCAQA7FgIBADwWAgEAPRYCAQA+FgIBAD8WAgEAQBYCAQBBFgIBAEIWAgEAQxYCAQBEFgIBAEUWAgEARhYCAQBHFgIBAEgWAgEASRYCAQBKFgICAEsWAgIATBYCBAAwFwIEADEXAgIAMhcCAQAzFwIBADQXAgEANRcCAQA7FwIBADwXAgEAPRcCAQA+FwIBAD8XAgEAQBcCAQBBFwIBAEIXAgEAQxcCAQBKFwICAEsXAgIATBcCBAAuGAIEAC8YAgQAMBgCBAAxGAICADIYAgEAMxgCAQA0GAIBADUYAgEANhgCAQA3GAIBAD0YAgEAPhgCAQA/GAIBAEAYAgEAQRgCAQBHGAIBAEgYAgEASRgCAQBKGAICAEsYAgIATBgCAgBNGAIEAE4YAgQATxgCBAAwGQICADEZAgIATBkCAwBNGQIDAE4ZAgMAUBkCBAAwGgICADEaAgIATRoCAwBOGgICADAbAgIATRsCAwBOGwICADAcAgEAThwCAgA='},
  'm-long': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'OQEBCQA6AQEJADsBAQkAPAEBCQBBAQEJAEIBAQkAQwEBCQBEAQEJADYCAQkANwIBCQA4AgEJADkCAQMAOgIBCQA7AgEDADwCAQMAPQIBCQA+AgEJAD8CAQkAQAIBCQBBAgEBAEICAQEAQwIBCQBEAgEDAEUCAQkARgIBCQBHAgEJADMDAQkANAMBCQA1AwEJADYDAQMANwMBAwA4AwEDADkDAQkAOgMBAwA7AwEDADwDAQMAPQMBAwA+AwEDAD8DAQMAQAMBAwBBAwECAEIDAQIAQwMBAQBEAwEJAEUDAQIARgMBAwBHAwEDAEgDAQkASQMBCQAxBAEJADIEAQkAMwQBCQA0BAEJADUEAQMANgQBAwA3BAEDADgEAQkAOQQBAwA6BAEDADsEAQMAPAQBAwA9BAEDAD4EAQMAPwQBAwBABAEDAEEEAQIAQgQBAgBDBAECAEQEAQkARQQBAgBGBAECAEcEAQMASAQBAwBJBAEJAEoEAQkASwQBCQBMBAEJADAFAQkAMQUBAwAyBQEJADMFAQkANAUBAwA1BQEDADYFAQMANwUBAgA4BQEJADkFAQMAOgUBAwA7BQEDADwFAQMAPQUBAwA+BQEDAD8FAQMAQAUBAwBBBQECAEIFAQIAQwUBAgBEBQECAEUFAQkARgUBAgBHBQECAEgFAQMASQUBCQBKBQEDAEsFAQkATAUBCQBNBQEJAC8GAQkAMAYBAwAxBgEJADIGAQkAMwYBAwA0BgEDADUGAQMANgYBAgA3BgECADgGAQkAOQYBAwA6BgEDADsGAQMAPAYBAwA9BgEDAD4GAQMAPwYBAwBABgEDAEEGAQIAQgYBAgBDBgECAEQGAQIARQYBCQBGBgEBAEcGAQIASAYBAgBJBgEDAEoGAQkASwYBAwBMBgEJAE0GAQkATgYBCQAuBwEJAC8HAQkAMAcBCQAxBwEDADIHAQkAMwcBAwA0BwEDADUHAQIANgcBAgA3BwEJADgHAQMAOQcBAwA6BwECADsHAQMAPAcBAwA9BwEDAD4HAQMAPwcBAwBABwEDAEEHAQMAQgcBAgBDBwECAEQHAQIARQcBAQBGBwEJAEcHAQEASAcBAQBJBwEBAEoHAQAASwcBCQBMBwEJAE0HAQAATgcBCQAuCAEJAC8IAQMAMAgBCQAxCAEJADIIAQMAMwgBAwA0CAEDADUIAQIA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'},
  'm-halfup': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'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'},
  'm-samurai': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'QgABCQBDAAEJAEQAAQkARQABCQBAAQEJAEEBAQkAQgEBAwBDAQEDAEQBAQMARQEBAwBGAQEJAEcBAQkAPAIBCQA9AgEJAD4CAQkAPwIBCQBAAgEDAEECAQMAQgIBAgBDAgECAEQCAQIARQIBAgBGAgECAEcCAQIASAIBCQA7AwEJADwDAQIAPQMBAwA+AwEJAD8DAQMAQAMBAwBBAwECAEIDAQIAQwMBAgBEAwECAEUDAQkARgMBCQBHAwEJAEgDAQkAOwQBCQA8BAEJAD0EAQIAPgQBCQA/BAEDAEAEAQkAQQQBCQBCBAEJAEMEAQkARAQBCQA7BQEJADwFAQkAPQUBCQA+BQEJAD8FAQkAQAUBCQBBBQEJAEIFAQkANgYBCQA3BgEJADgGAQkAOQYBCQA6BgEJADsGAQMAPAYBAwA9BgEDAD4GAQkAPwYBCQBABgEDAEEGAQMAQgYBAwBDBgEJAEQGAQkARQYBCQBGBgEJADQHAQkANQcBCQA2BwEJADcHAQMAOAcBCQA5BwEDADoHAQMAOwcBAwA8BwEAAD0HAQAAPgcBAwA/BwEAAEAHAQAAQQcBAABCBwEAAEMHAQMARAcBCQBFBwEDAEYHAQkARwcBCQBIBwEJADIIAQkAMwgBCQA0CAEBADUIAQkANggBAwA3CAEJADgIAQMAOQgBAwA6CAECADsIAQIAPAgBAgA9CAECAD4IAQkAPwgBAABACAEBAEEIAQEAQggBAQBDCAEBAEQIAQMARQgBCQBGCAEDAEcIAQkASAgBAgBJCAEJAEoIAQkAMQkBCQAyCQECADMJAQMANAkBCQA1CQEDADYJAQkANwkBAwA4CQEDADkJAQIAOgkBAgA7CQECADwJAQIAPQkBAQA+CQEJAD8JAQkAQAkBAABBCQEBAEIJAQEAQwkBAQBECQEBAEUJAQMARgkBCQBHCQEDAEgJAQkASQkBAwBKCQEBAEsJAQkAMAoBCQAxCgEBADIKAQIAMwoBCQA0CgEDADUKAQMANgoBCQA3CgEDADgKAQIAOQoBAgA6CgECADsKAQEAPAoBCQA9CgEJAD4KAQkAPwoBCQBACgEJAEEKAQAAQgoBAQBDCgEBAEQKAQEARQoBAQBGCgECAEcKAQkASAoBAwBJCgEJAEoKAQEASwoBAgBMCgEJADALAQkAMQsBAwAyCwEDADMLAQkANAsBAwA1CwEJADYLAQMANwsBAwA4CwECADkLAQIAOgsBAQA7CwEJADwLAQkAPQsBAwA+CwEDAD8LAQMAQAsBCQBBCwEJAEILAQkAQwsBAQBECwECAEULAQEARgsBAgBHCwEJAEgLAQEASQsBAgBKCwEJAEsLAQMATAsBAgBNCwEJAC8MAQkAMAwBAQAxDAECADIMAQkAMwwBAwA0DAEDADUMAQkANgwBAwA3DAECADgMAQIAOQwBAQA6DAEJADsMAQIAPAwBAwA9DAEDAD4MAQMAPwwBAQBADAEBAEEMAQMAQgwBAQBDDAEJAEQMAQIARQwBAQBGDAEBAEcMAQAASAwBCQBJDAEBAEoMAQkASwwBAQBMDAECAE0MAQIATgwBCQAvDQEJADANAQMAMQ0BAwAyDQEJADMNAQMANA0BCQA1DQEDADYNAQMANw0BAgA4DQECADkNAQkAOg0BAQA7DQEBADwNAQEAPQ0BAQA+DQEBAD8NAQEAQA0BAQBBDQEBAEINAQEAQw0BAgBEDQEDAEUNAQEARg0BAQBHDQECAEgNAQkASQ0BAQBKDQECAEsNAQkATA0BAgBNDQECAE4NAQkALw4BCQAwDgECADEOAQkAMg4BAwAzDgEDADQOAQkANQ4BAwA2DgECADcOAQIAOA4BAQA5DgEJADoOAQIAOw4BAgA8DgEAAD0OAQAAPg4BAQA/DgEBAEAOAQEAQQ4BAQBCDgEAAEMOAQAARA4BAwBFDgEDAEYOAQEARw4BAQBIDgECAEkOAQkASg4BAQBLDgEJAEwOAQAATQ4BAgBODgEJAC8PAQkAMA8BAwAxDwEJADIPAQMAMw8BAwA0DwEJADUPAQMANg8BAgA3DwECADgPAQkAOQ8BAAA6DwEAADsPAQAAPA8BAAA9DwEAAD4PAQAAPw8BAABADwEAAEEPAQEAQg8BAQBDDwEAAEQPAQAARQ8BCQBGDwECAEcPAQEASA8BAABJDwEJAEoPAQEASw8BCQBMDwECAE0PAQAATg8BCQAvEAEJADAQAQIAMRABCQAyEAEDADMQAQIANBABCQA1EAEDADYQAQIANxABAAA4EAICADkQAgIAOhACAgA7EAICADwQAgIAPRACAgA+EAICAD8QAgIAQBACAgBBEAICAEIQAgIAQxACAgBEEAICAEUQAgIARhABAQBHEAEBAEgQAQIASRABCQBKEAEBAEsQAQIATBABCQBNEAEBAE4QAQkALxELCAkwEQsFAzERCwUJMhELBQMzEQsFCTQRCwUDNRELBQI2EQsFATcREwUCOBETBQE5ERMFAToREwUBOxETBQE8ERMFAT0REwUBPhETBQE/ERMFAUAREwUBQRETBQFCERMGAUMREwYBRBETBgFFERMGAUYRCwYBRxELBgFIEQsGAkkRCwYJShELBgFLEQsGAkwRCwYJTRELBgBOEQsICS8SCwgJMBILBgAxEhMGAjISCwYBMxILBgk0EgsGAzUSCwYCNhILBgA3EhMGATgSEwYBORITBgE6EhMGATsSEwYBPBITBwE9EhMHAT4SEwcBPxITBwFAEhMHAUESEwcBQhITBwFDEhMHAUQSEwcBRRITBwFGEhMHAkcSCwcBSBILBwJJEgsHCUoSCwcBSxILBwJMEgsHCU0SCwcBThILCAkvEwsICTATCwgAMRMTCAIyEwsIATMTCwgJNBMLCAM1EwsIATYTEwgCNxMTCAE4ExMIATkTEwgBOhMTCAE7ExMIATwTEwgBPRMTCAE+ExMIAT8TEwgBQBMTCAFBExMIAUITEwgBQxMTCAFEExMIAUUTEwgBRhMTCAFHEwsIAUgTCwgBSRMLCAlKEwsIAUsTCwgBTBMLCAlNEwsIAE4TCwgJMBQBCQAxFAEDADIUAQIAMxQBCQA0FAEDADUUAQEANhQCAQA3FAIBADgUAgEAORQCAQA6FAIBADsUAgEAPBQCAQA9FAIBAD4UAgEAPxQCAQBAFAIBAEEUAgEAQhQCAQBDFAIBAEQUAgEARRQCAQBGFAIBAEcUAQEASBQBAgBJFAEJAEoUAQEASxQBAgBMFAEJAE0UAgQAMBUCBAAxFQEBADIVAQIAMxUBCQA0FQEDADUVAQEANhUCAQA3FQIBADgVAgEAORUCAQA6FQIBADsVAgEAPBUCAQA9FQIBAD4VAgEAPxUCAQBAFQIBAEEVAgEAQhUCAQBDFQIBAEQVAgEARRUCAQBGFQIBAEcVAgIASBUBAABJFQICAEoVAQEASxUBAABMFQIEADAWAgQAMRYBAQAyFgECADMWAQkANBYBAwA1FgEBADYWAgEANxYCAQA4FgIBADkWAgEAOhYCAQA7FgIBADwWAgEAPRYCAQA+FgIBAD8WAgEAQBYCAQBBFgIBAEIWAgEAQxYCAQBEFgIBAEUWAgEARhYCAQBHFgIBAEgWAQAASRYCAQBKFgEBAEsWAQAATBYCBAAwFwIEADEXAQEAMhcBAgAzFwEJADQXAQEANRcBAgA7FwIBADwXAgEAPRcCAQA+FwIBAD8XAgEAQBcCAQBBFwIBAEIXAgEAQxcCAQBIFwEBAEoXAQIASxcBAABMFwIEAC4YAgQALxgCBAAwGAIEADEYAgIAMhgBAQAzGAICADQYAgIANRgBAQA2GAIBADcYAgEAPRgCAQA+GAIBAD8YAgEAQBgCAQBBGAIBAEcYAgEASBgBAABJGAIBAEoYAQEASxgBAABMGAICAE0YAgQAThgCBABPGAIEADAZAgIAMRkCAgAyGQEBADUZAQIAShkBAwBLGQEAAEwZAgMATRkCAwBOGQIDAFAZAgQAMBoCAgAxGgICADIaAQEAShoBAwBLGgEBAE0aAgMAThoCAgAwGwICADIbAQIAShsBAwBLGwEBAE0bAgMAThsCAgAwHAIBADIcAQIAThwCAgA='},
  'm-ronin': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'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'},
  'm-warrior': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'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'},
  'm-shortspiky': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'MgABCQAzAAEJADoAAQkAOwABCQBCAAEJAEMAAQkASwABCQAzAQEJADQBAQkANQEBCQA6AQEJADsBAQIAPAEBCQBBAQEJAEIBAQMAQwEBCQBIAQEJAEkBAQkASgEBCQAzAgEJADQCAQIANQIBAgA2AgEJADcCAQkAOQIBCQA6AgEDADsCAQIAPAIBAgA9AgEJAD8CAQkAQAIBCQBBAgEDAEICAQMAQwIBAgBEAgEJAEUCAQkARgIBCQBHAgEJAEgCAQMASQIBAwBKAgEJADMDAQkANAMBAwA1AwECADYDAQIANwMBAgA4AwEJADkDAQMAOgMBAwA7AwEDADwDAQIAPQMBCQA+AwEJAD8DAQMAQAMBAwBBAwEDAEIDAQIAQwMBAgBEAwEBAEUDAQkARgMBAwBHAwEDAEgDAQMASQMBAgBKAwEJADMEAQkANAQBAwA1BAEDADYEAQIANwQBAgA4BAEJADkEAQMAOgQBAwA7BAEDADwEAQkAPQQBAwA+BAEDAD8EAQMAQAQBAwBBBAEDAEIEAQIAQwQBAgBEBAECAEUEAQkARgQBAwBHBAEDAEgEAQIASQQBAgBKBAEJADMFAQkANAUBAwA1BQEDADYFAQMANwUBCQA4BQEDADkFAQMAOgUBAwA7BQEJADwFAQMAPQUBAwA+BQEDAD8FAQMAQAUBAwBBBQEDAEIFAQIAQwUBAgBEBQECAEUFAQkARgUBAwBHBQECAEgFAQIASQUBAgBKBQEJACwGAQkALQYBCQAuBgEJAC8GAQkAMAYBCQAxBgEJADIGAQkAMwYBAwA0BgEDADUGAQkANgYBCQA3BgEJADgGAQkAOQYBAwA6BgEJADsGAQkAPAYBCQA9BgEJAD4GAQkAPwYBCQBABgEJAEEGAQkAQgYBAgBDBgEJAEQGAQkARQYBCQBGBgEJAEcGAQIASAYBAgBJBgECAEoGAQkASwYBCQBMBgEJAE0GAQkATgYBCQBPBgEJAFAGAQkAUQYBCQBSBgEJACwHAQkALQcBAgAuBwEDAC8HAQMAMAcBAwAxBwEDADIHAQkAMwcBAwA0BwEJADUHAQMANgcBAwA3BwEBADgHAQkAOQcBCQA6BwEDADsHAQMAPAcBAQA9BwEJAD4HAQMAPwcBAwBABwEBAEEHAQEAQgcBCQBDBwEDAEQHAQEARQcBAQBGBwEBAEcHAQkASAcBAgBJBwEBAEoHAQkASwcBAwBMBwECAE0HAQIATgcBAgBPBwECAFAHAQIAUQcBAQBSBwEJAC0IAQkALggBAgAvCAECADAIAQMAMQgBAwAyCAEDADMIAQkANAgBAwA1CAEDADYIAQMANwgBCQA4CAEDADkIAQMAOggBAwA7CAEDADwIAQkAPQgBAwA+CAEDAD8IAQMAQAgBAgBBCAEJAEIIAQMAQwgBAwBECAEDAEUIAQIARggBAgBHCAECAEgIAQkASQgBAABKCAEJAEsIAQIATAgBAgBNCAECAE4IAQEATwgBAgBQCAEJAFEIAQkALgkBCQAvCQECADAJAQIAMQkBAgAyCQEJADMJAQMANAkBAwA1CQEDADYJAQMANwkBCQA4CQEDADkJAQMAOgkBAwA7CQEDADwJAQkAPQkBAwA+CQEDAD8JAQMAQAkBCQBBCQEDAEIJAQMAQwkBAwBECQEDAEUJAQIARgkBAgBHCQEBAEgJAQAASQkBCQBKCQEJAEsJAQEATAkBAQBNCQEBAE4JAQEATwkBCQAvCgEJADAKAQIAMQoBAgAyCgEJADMKAQMANAoBAwA1CgEDADYKAQMANwoBCQA4CgEDADkKAQMAOgoBAwA7CgEJADwKAQMAPQoBAwA+CgEDAD8KAQMAQAoBCQBBCgEDAEIKAQMAQwoBAwBECgEDAEUKAQEARgoBAQBHCgEBAEgKAQIASQoBCQBKCgEBAEsKAQEATAoBAQBNCgECAE4KAQkALwsBCQAwCwEBADELAQIAMgsBCQAzCwEDADQLAQMANQsBAwA2CwEDADcLAQkAOAsBAwA5CwEDADoLAQMAOwsBCQA8CwEDAD0LAQMAPgsBAwA/CwEDAEALAQkAQQsBAwBCCwEDAEMLAQMARAsBAgBFCwEBAEYLAQEARwsBAQBICwECAEkLAQkASgsBAQBLCwEBAEwLAQIATQsBCQAvDAEJADAMAQEAMQwBAQAyDAEJADMMAQMANAwBAwA1DAEDADYMAQMANwwBCQA4DAEDADkMAQMAOgwBAwA7DAEDADwMAQkAPQwBAwA+DAEDAD8MAQMAQAwBAwBBDAEJAEIMAQMAQwwBAwBEDAECAEUMAQIARgwBAQBHDAEBAEgMAQAASQwBCQBKDAEBAEsMAQEATAwBAABNDAEJAE4MAQkALg0BCQAvDQEDADANAQkA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'},
  'm-bun': {pal:'f5cb9b,e1a57a,ba7458,94493b,6e2624,cf3b3b,ab2436,881332,65072c', px:'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'},
  'f-long': {pal:'ff9677,9e2538,f06b5b,c73d40,751330,ba7458,e1a57a,ffe6b8,94493b,6e2624', px:'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'},
  'f-bun': {pal:'9e2538,751330,f06b5b,c73d40,ba7458,ff9677,ffb58e,e1a57a,f5cb9b,94493b,6e2624', px:'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'},
  'f-braid': {pal:'9e2538,ff9677,f06b5b,751330,ba7458,c73d40,e1a57a,f5cb9b,94493b,6e2624', px:'PQYBCQA+BgEAAD8GAQAAQAYBAAA5BwEAADoHAQAAOwcBAAA8BwEAAD0HAQAAPgcBBAA/BwEDAEAHAQIAQQcBAABCBwEAAEMHAQAARAcBAABFBwEJADQIAQkANQgBAAA2CAEAADcIAQAAOAgBAAA5CAEEADoIAQMAOwgBBAA8CAEEAD0IAQQAPggBBAA/CAEEAEAIAQQAQQgBBABCCAEEAEMIAQQARAgBAwBFCAEAAEYIAQAARwgBAABICAEAAEkIAQkAMgkBCQAzCQEAADQJAQAANQkBBAA2CQEEADcJAQQAOAkBBAA5CQEDADoJAQQAOwkBBAA8CQEDAD0JAQMAPgkBAwA/CQEDAEAJAQMAQQkBAwBCCQEDAEMJAQQARAkBAwBFCQEEAEYJAQQARwkBBABICQEEAEkJAQQASgkBCQBLCQEJADIKAQkAMwoBAAA0CgEEADUKAQQANgoBAwA3CgEDADgKAQMAOQoBAgA6CgEDADsKAQMAPAoBAwA9CgEDAD4KAQIAPwoBAgBACgECAEEKAQIAQgoBAgBDCgECAEQKAQIARQoBAgBGCgEDAEcKAQMASAoBAgBJCgECAEoKAQEASwoBCQBMCgEJADELAQkAMgsBAAAzCwEEADQLAQQANQsBAwA2CwEDADcLAQMAOAsBAwA5CwEBADoLAQIAOwsBAgA8CwECAD0LAQIAPgsBAgA/CwECAEALAQIAQQsBAgBCCwECAEMLAQIARAsBAQBFCwECAEYLAQIARwsBAgBICwECAEkLAQIASgsBAQBLCwEJAEwLAQkAMAwBCQAxDAEAADIMAQQAMwwBBAA0DAEDADUMAQMANgwBAgA3DAECADgMAQEAOQwBAgA6DAECADsMAQIAPAwBAgA9DAECAD4MAQIAPwwBAgBADAECAEEMAQIAQgwBAgBDDAECAEQMAQIARQwBAQBGDAECAEcMAQIASAwBAgBJDAECAEoMAQEASwwBAQBMDAEJAE0MAQkALw0BCQAwDQEAADENAQQAMg0BBAAzDQEDADQNAQMANQ0BAgA2DQECADcNAQIAOA0BAQA5DQEAADoNAQAAOw0BAAA8DQEAAD0NAQkAPg0BAQA/DQEBAEANAQAAQQ0BAABCDQEAAEMNAQAARA0BAABFDQEBAEYNAQIARw0BAgBIDQECAEkNAQIASg0BAgBLDQECAEwNAQEA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'},
  'f-bob': {pal:'ba7458,e1a57a', px:'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'},
  'f-twin': {pal:'6e2624,94493b,9e2538,f5cb9b,751330,f06b5b,65072c,c73d40,881332,ba7458,e1a57a', px:'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'},
  'f-curly': {pal:'9e2538,c73d40,6e2624,751330,ba7458,65072c,94493b,e1a57a,f5cb9b', px:'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'},
  'f-crop': {pal:'6e2624,ba7458,e1a57a,94493b,f5cb9b', px:'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'},
};
// band: the style's headband only shows at ranks that wear one; elsewhere hair or skin fills in
const HAIR_STYLES = [
  {id:'spiky', name:'Spiky'},
  {id:'m-crew', name:'Crew Cut', band:true},
  {id:'m-long', name:'Long Layers', band:true},
  {id:'m-halfup', name:'Half-Up', band:true},
  {id:'m-samurai', name:'Samurai Knot', band:true},
  {id:'m-ronin', name:'Ronin', band:true},
  {id:'m-warrior', name:'Warrior Braids', band:true},
  {id:'m-shortspiky', name:'Short Spiky', band:true},
  {id:'m-bun', name:'Man Bun', band:true}
];
const FEMALE_HAIR_STYLES = [
  {id:'default', name:'Ponytail'},
  {id:'f-long', name:'Long'},
  {id:'f-bun', name:'Bun'},
  {id:'f-braid', name:'Braid'},
  {id:'f-bob', name:'Bob'},
  {id:'f-twin', name:'Twin Tails'},
  {id:'f-curly', name:'Curly'},
  {id:'f-crop', name:'Short Crop'}
];
// The red headband shades the styles were drawn with, darkest first
const BAND_SRC = ['65072c', '881332', 'ab2436', 'cf3b3b'].map(h => hexRgb('#' + h));
// Retired styles from before the redraw, mapped to their closest new cut so saves keep a similar look
const OLD_STYLES = {'m-twinbraids':'m-warrior', 'm-mane':'m-shortspiky', 'm-knotcut':'m-samurai', 'm-locknot':'m-warrior', 'm-afro':'m-crew', 'm-bangs':'m-long', 'm-braid':'m-warrior', 'm-buzz':'m-crew', 'm-chin':'m-long', 'm-crop':'m-crew', 'm-curly':'m-crew', 'm-curtain':'m-long', 'm-hawk':'m-crew', 'm-locs':'m-warrior', 'm-lowtail':'m-ronin', 'm-messy':'m-ronin', 'm-mullet':'m-ronin', 'm-part':'m-crew', 'm-pony':'m-ronin', 'm-quiff':'m-samurai', 'm-shaggy':'m-long', 'm-slick':'m-samurai', 'm-spikes':'m-crew', 'm-spikylong':'m-ronin', 'm-straight':'m-long', 'm-sweep':'m-crew', 'm-swoop':'m-samurai', 'm-topknot':'m-samurai', 'm-twists':'m-warrior', 'm-twoblock':'m-long', 'm-wolf':'m-long'};
const styleById = id => HAIR_STYLES.find(h => h.id === id) || FEMALE_HAIR_STYLES.find(h => h.id === id);
/* ---------- Accessories ---------- */
// Unlockable gear, earned through training milestones. One item per slot; the face mark stacks with shades.
// Art was lifted pixel for pixel (his from B-Rank, hers from C-Rank) and is stretched out from the middle of
// the body to fit each rank's build. Colors stay as drawn: outfit colors never tint the gear.
const RARITY = {common:'Common', rare:'Rare', epic:'Epic', legendary:'Legendary'};
const SLOT_ORDER = ['back', 'waist', 'neck', 'wrist', 'mark', 'face'];   // painted in this order
const SLOT_NAME = {back:'Back', waist:'Waist', neck:'Neck', wrist:'Wrist', mark:'Face mark', face:'Face'};
const ACCESSORIES = [
  {id:'shades',  name:'Sport shades',      slot:'face',  rarity:'common',    anchor:'head', how:'Complete 5 workouts',             got:() => S.log.length >= 5},
  {id:'watch',   name:'Smartwatch',        slot:'wrist', rarity:'common',    anchor:'body', how:'Work out 3 days in a row',        got:() => daysInRow() >= 3},
  {id:'bandage', name:'Battle bandage',    slot:'mark',  rarity:'common',    anchor:'head', how:'Come back after missing 3+ days', got:() => cameBack()},
  {id:'bag',     name:'Gym bag',           slot:'back',  rarity:'rare',      anchor:'body', how:'Log 20 total workouts',           got:() => S.log.length >= 20},
  {id:'phones',  name:'Neck headphones',   slot:'neck',  rarity:'rare',      anchor:'body', how:'Hit a 7-session streak',          got:() => streak(logsByDay(), todayIso()) >= 7},
  {id:'towel',   name:'Gym towel',         slot:'neck',  rarity:'rare',      anchor:'body', how:'Set your first PR',               got:() => S.prs >= 1},
  {id:'scarf',   name:'Hero scarf',        slot:'neck',  rarity:'epic',      anchor:'body', how:'Finish your first arc',           got:() => (S.arcs || 0) >= 1},
  {id:'belt',    name:'Championship belt', slot:'waist', rarity:'legendary', anchor:'body', how:'Reach S-Rank',                    got:() => rankIdx() >= 6}
];
const accById = id => ACCESSORIES.find(a => a.id === id);
const workoutDays = () => [...new Set(S.log.map(l => l.iso).filter(Boolean))].sort();
const dayNum = iso => Math.round(fromYmd(iso).getTime() / 864e5);
// Longest run of back-to-back calendar days with a workout
function daysInRow(){ let best = 0, run = 0, prev = null; for (const iso of workoutDays()){ const n = dayNum(iso); run = prev !== null && n === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = n; } return best; }
// A workout after a gap of three or more days without one
function cameBack(){ const d = workoutDays().map(dayNum); return d.some((n, i) => i > 0 && n - d[i - 1] >= 4); }
// Unlocks are permanent. Returns the items this call just unlocked.
function checkItems(){ const fresh = []; for (const a of ACCESSORIES) if (!S.items[a.id] && a.got()){ S.items[a.id] = todayIso(); fresh.push(a); } return fresh; }
// Decoded art, one per item and character: rows of pixels plus the rank the art was drawn on
const ACC_DECODED = {};
function accArt(id, g){
  const k = id + '|' + (g === 'female' ? 'f' : 'm'), src = ACC_ART[k]; if (!src) return null;
  if (ACC_DECODED[k]) return ACC_DECODED[k];
  const pal = src.pal.split(',').map(h => hexRgb('#' + h)), s = atob(src.px), rows = new Map();
  for (let i = 0; i < s.length; i += 3){ const x = s.charCodeAt(i), y = s.charCodeAt(i + 1); if (!rows.has(y)) rows.set(y, new Map()); rows.get(y).set(x, pal[s.charCodeAt(i + 2)]); }
  return ACC_DECODED[k] = {rows, src:src.src};
}
// What this character has on, with the build of the rank each piece was drawn on (for the stretch)
async function equippedArt(g, acc = {}){
  const out = [];
  for (const slot of SLOT_ORDER){ const a = accById(acc[slot]), art = a && accArt(a.id, g); if (!art) continue;
    out.push({anchor:a.anchor, rows:art.rows, srcExt:(await spriteBase(g, art.src)).ext}); }
  return out;
}
// Paint one item into a padded frame. Each row is stretched out from the body's middle so the edges land on
// this rank's body; the middle 9px either side (buckle, shades, the knot of a scarf) keep their exact shape,
// and anything hanging past the body's edge (a scarf tail) moves with the edge without stretching.
function paintAcc(img, map, a, ext, off){
  const d = img.data, C = 63.5, CORE = 9;
  for (const [y, row] of a.rows){
    const xs = [...row.keys()], lo = Math.min(...xs), hi = Math.max(...xs);
    // half-widths of the body on this row, on the art's rank (s) and this rank (t); equal means no change
    const half = side => { if (a.anchor === 'head' || a.srcExt.L[y] < 0 || ext.L[y] < 0) return [0, 0];
      const s = side < 0 ? C - a.srcExt.L[y] : a.srcExt.R[y] - C, t = side < 0 ? C - ext.L[y] : ext.R[y] - C;
      return s - CORE < 2 || t - CORE < 2 ? [0, 0] : [s, t]; };
    const [sl, tl] = half(-1), [sr, tr] = half(1);
    const map1 = (ad, s, t) => !s || ad <= CORE ? ad : ad <= s ? CORE + (ad - CORE) * (t - CORE) / (s - CORE) : ad + t - s;
    const unmap = (ad, s, t) => !s || ad <= CORE ? ad : ad <= t ? CORE + (ad - CORE) * (s - CORE) / (t - CORE) : ad - t + s;
    const fwd = x => { const dd = x - C; return C + Math.sign(dd) * (dd < 0 ? map1(-dd, sl, tl) : map1(dd, sr, tr)); };
    const inv = x => { const dd = x - C; return C + Math.sign(dd) * (dd < 0 ? unmap(-dd, sl, tl) : unmap(dd, sr, tr)); };
    for (let tx = Math.round(fwd(lo)); tx <= Math.round(fwd(hi)); tx++){
      const c = row.get(Math.round(inv(tx))); if (!c) continue;
      const x = tx + off.dx, yy = y + SPRITE_PAD + off.dy; if (x < 0 || x >= SPRITE_W || yy < 0 || yy >= SPRITE_H) continue;
      const q = yy * SPRITE_W + x; d[q * 4] = c[0]; d[q * 4 + 1] = c[1]; d[q * 4 + 2] = c[2]; d[q * 4 + 3] = 255; map[q] = 0;
    }
  }
}
const ACC_ART = {
  'shades|m': {src:'B', pal:'22161e,1e2232,c8dcff,242a3e,8ca0c8,2c344c,36405c', px:'OBkAORkAOhkAOxkAQxkARBkARRkARhkAMhoAMxoANBoANRoBNhoCNxoCOBoBORoBOhoBOxoBPBoAPRoAPhoAPxoAQBoAQRoAQhoAQxoBRBoCRRoCRhoBRxoBSBoBSRoBShoASxoATBoANBsANRsDNhsENxsDOBsDORsDOhsDOxsDPBsAQhsAQxsDRBsERRsDRhsDRxsDSBsDSRsDShsANBwANRwFNhwFNxwFOBwFORwFOhwFOxwFPBwAQhwAQxwFRBwFRRwFRhwFRxwFSBwFSRwFShwANB0ANR0GNh0GNx0GOB0GOR0GOh0GOx0GPB0AQh0AQx0GRB0GRR0GRh0GRx0GSB0GSR0GSh0ANR4ANh4ANx4AOB4AOR4AOh4AOx4AQx4ARB4ARR4ARh4ARx4ASB4ASR4A'},
  'shades|f': {src:'C', pal:'22161e,1e2232,c8dcff,242a3e,8ca0c8,2c344c,36405c', px:'OhkAOxkAQxkARBkARRkARhkANRoBNhoCNxoCOBoBORoBOhoBOxoBPhoAPxoAQBoAQRoAQhoAQxoBRBoCRRoCRhoBRxoBSBoBSRoBNBsANRsDNhsENxsDOBsDORsDOhsDOxsDQhsAQxsDRBsERRsDRhsDRxsDSBsDSRsDNBwANRwFNhwFNxwFOBwFORwFOhwFOxwFPBwAQhwAQxwFRBwFRRwFRhwFRxwFSBwFSRwFNB0ANR0GNh0GNx0GOB0GOR0GOh0GOx0GPB0AQh0AQx0GRB0GRR0GRh0GRx0GSB0GSR0GQx4A'},
  'watch|m': {src:'B', pal:'14131e,0e0c16,60616e,1c2043,121131,24262e,1b1b26,3a4966', px:'FGYAFWYAFmYAF2YAGGYAGWYAGmYAG2YAHGYAHWYAHmYAH2YAIGYAIWYAImYBFGcAFWcCFmcCF2cCGGcCGWcDGmcDG2cDHGcEHWcCHmcCH2cCIGcFIWcGImcBFGgBFWgFFmgFF2gFGGgFGWgDGmgHG2gHHGgEHWgFHmgFH2gFIGgGIWgBFWkBFmkGF2kGGGkAGWkEGmkEG2kEHGkEHWkAHmkAH2kAIGkGIWkBFWoBFmoBF2oBGGoBGWoBGmoBG2oBHGoBHWoBHmoBH2oBIGoBIWoB'},
  'watch|f': {src:'C', pal:'14131e,0e0c16,a9a9b0,60616e,1c2043,121131,24262e,1b1b26,3a4966', px:'HGYAHWYAHmYAH2YAIGYAIWYAImYAI2YAJGYAJWYAJmYBHGcAHWcCHmcDH2cEIGcEIWcEImcFI2cDJGcGJWcHJmcBHGgAHWgDHmgGH2gEIGgIIWgIImgFI2gGJGgHJWgBHGkBHWkHHmkHH2kFIGkFIWkFImkFI2kAJGkHJWkBHGoBHWoBHmoBH2oBIGoBIWoBImoBI2oBJGoBJWoB'},
  'bandage|m': {src:'B', pal:'c4a27a,ceb088,eed6b0', px:'QyAARCAARSAARiAARyAASCAAQyEARCEBRSECRiECRyEBSCEAQyIARCICRSIBRiIBRyICSCIAQyMARCMARSMARiMARyMASCMA'},
  'bandage|f': {src:'C', pal:'c4a27a,ceb088,eed6b0', px:'QyAARCAARSAARiAARyAASCAAQyEARCEBRSECRiECRyEBSCEAQyIARCICRSIBRiIBRyICSCIAQyMARCMARSMARiMARyMASCMA'},
  'bag|m': {src:'B', pal:'10101c,585f6c,0c0a15,1f222b,ac8cf3,1f1e34,6f7888,3a3f50,171427,2b2d42,19182f,171823,9e9dbc,606382,2f3448,22243b,130f23,881332,65072c,cf3b3b,ab2436', px:'Ly8ALjAALzABMDACLjEALzEDMDEDMTECLjICLzIDMDIDMTICLjMELzMCMDMDMTMDMjMCMDQCMTQDMjQDMzQCMTUFMjUFMzUFNDUCMDYFMTYGMjYGMzYHNDYIMDcFMTcHMjcHMzcHNDcINTcCMTgIMjgHMzgHNDgJNTgINjgCMTkIMjkHMzkHNDkHNTkINjkDNzkCMjoIMzoHNDoHNToJNjoINzoCMjsIMzsHNDsHNTsHNjsINzsDODsCMzwINDwHNTwHNjwJNzwIODwDOTwCMz0IND0HNT0HNj0JNz0IOD0DOT0DOj0CND4INT4JNj4JNz4IOD4DOT4DOj4CND8INT8INj8IOD8COT8DOj8DOz8COUACOkADO0ADPEACOkECO0EDPEEDPUECOkICO0IDPEIDPUICO0MCPEMDPUMDPkMCPEQCPUQDPkQDP0QCPUUCPkUDP0UDQEUCPUYCPkYDP0YDQEYCPkcCP0cDQEcDQUcCP0gCQEgDQUgDQkgCQEkCQUkDQkkDQ0kCQEoCQUoDQkoDQ0oCQUsCQksDQ0sDREsCQkwCQ0wDREwDRUwCQ00CRE0DRU0DRk0CQ04CRE4DRU4DRk4CRE8CRU8DRk8DR08CRVACRlADR1ADSFACRlECR1EDSFEDSVECRlICR1IDSFIDSVICRlMCR1MDSFMDSVMCR1QCSFQDSVQDSlQCSFUCSVUDSlUDS1UCSVYCSlYDS1YDTFYCSVcCSlcDS1cDTFcCSlgCS1gDTFgDTVgCS1kCTFkDTVkDTlkCTFoCTVoDTloDT1oCTFsCTVsDTlsDT1sCTVwCTlwDT1wDUFwCTl0CT10DUF0DUV0CT14CUF4DUV4DUl4CT18CUF8DUV8DUl8CWV8KWl8KW18KT2AKUGACUWADUmALU2ACVGAKVWAKVmAKV2AKWGAKWWAMWmANW2AOT2EKUGEMUWECUmELU2ECVGENVWENVmENV2ENWGENWWENWmEOW2EPXGEQT2IKUGINUWINUmICU2INVGINVWINVmINV2INWGINWWINWmIOW2IPXGIPT2MKUGMNUWMNUmMNU2MOVGMOVWMOVmMOV2MOWGMOWWMOWmMOW2MPXGMPT2QKUGQNUWQNUmQOU2QOVGQOVWQOVmQOV2QOWGQOWWQOWmQOW2QPXGQPXWQQT2UKUGUNUWUNUmUOU2UOVGUOVWUOVmUOV2UOWGUOWWUOWmUOW2UPXGUPXWUKT2YKUGYNUWYNUmYOU2YOVGYOVWYOVmYOV2YOWGYOWWYOWmYRW2YRXGYRXWYSVGcRVWcRVmcRV2cRWGcRWWcRWmcTW2cTXGcTXWcUT2gSUGgSUWgSUmgSU2gSVWgSVmgSV2gSWGgSWWgSWmgSW2gSXGgSXWgST2kKUGkNUWkNUmkOU2kOVGkOVWkOVmkOV2kOWGkOWWkOWmkPW2kPXGkPXWkQT2oKUGoNUWoNUmoOU2oOVGoOVWoOVmoOV2oOWGoOWWoOWmoPW2oPXGoPXWoQT2sKUGsNUWsNUmsOU2sOVGsOVWsOVmsOV2sOWGsOWWsOWmsPW2sPXGsPXWsQT2wKUGwNUWwNUmwOU2wOVGwOVWwOVmwOV2wOWGwOWWwOWmwPW2wKXGwPXWwQT20KUG0NUW0OUm0OU20OVG0OVW0OVm0PV20PWG0PWW0PWm0PW20KXG0PXW0QT24KUG4OUW4OUm4OU24OVG4PVW4PVm4PV24PWG4PWW4PWm4KW24PXG4QT28QUG8OUW8OUm8PU28PVG8PVW8KVm8KV28KWG8KWW8KWm8KW28PXG8QUHAQUXAPUnAKU3AKVHAKVXAKVnAPV3AQWHAQWXAQWnAQW3AQXHAQUHEQUXEQUnEQU3EQVHEQVXEQVnEQ'},
  'bag|f': {src:'C', pal:'10101c,585f6c,0c0a15,1f222b,1f1e34,171427,6f7888,3a3f50,2b2d42,0c6574,19182f,171823,9e9dbc,606382,2f3448,84819b,5a5873,22243b,130f23', px:'My8AMjAAMzABNDAANTACMjEAMzEDNDEDNTECMzICNDIDNTIDNjICNDMCNTMDNjMCNDQCNTQDNjQDNzQCNTUENjUENzUEODUFNTYENjYGNzYGODYHOTYFNTcENjcHNzcHODcHOTcFNTgFNjgHNzgHODgHOTgIOjgFNjkFNzkHODkHOTkIOjkFNjoFNzoHODoHOToHOjoIOzoFNzsFODsHOTsHOjsIOzsFPDsCNzwFODwHOTwHOjwHOzwIPDwFOD0FOT0HOj0HOz0IPD0FPT0COD4FOT4IOj4IOz4IPD4FPT4DPj4COT8FOj8FOz8FPD8DPT8DPj8CPEACPUADPkADP0ACPUECPkEDP0EDQEECPUICPkIDP0IDQEICPkMCP0MDQEMDQUMCP0QCQEQDQUQCP0UCQEUDQUUDQkUCQEYCQUYDQkYDQ0YCQUcCQkcDQ0cCQUgCQkgDQ0gDREgCQkkCQ0kDREkDRUkCQ0oCREoDRUoCQ0sCREsDRUsDRksCREwCRUwDRkwDR0wCRE0CRU0DRk0DR00CRU4CRk4DR04DSE4CRk8CR08DSE8DSU8CRlACR1ADSFADSVACR1ECSFEDSVEDSlECR1ICSFIDSVIDSlICSFMCSVMDSlMDS1MCSFQCSVQDSlQDS1QCSVUCSlUDS1UDTFUCSlYCS1YDTFYCSlcCS1cDTFcDTVcCS1gCTFgDTVgDTlgCTFkCTVkDTlkCTFoCTVoDTloDT1oCTVsCTlsDT1sDUFsCTlwCT1wDUFwCTl0CT10DUF0DUV0CTl4JT14CUF4DUV4DUl4CUF8CUV8DUl8CT2AKUGACUWADUmALU2ACVGAKVWAKVmAKV2AKWGAKT2EKUGEMUWECUmELU2ECVGENVWENVmENV2ENWGENT2IKUGINUWINUmICU2INVGINVWINVmINV2INWGINT2MKUGMNUWMNUmMNU2MOVGMOVWMOVmMOV2MOWGMOWWMOT2QKUGQNUWQNUmQOU2QOVGQOVWQOVmQOV2QOWGQOWWQOT2UKUGUNUWUNUmUOU2UOVGUOVWUOVmUOV2UOWGUOWWUOT2YKUGYNUWYNUmYOU2YOVGYOVWYOVmYOV2YOWGYOWWYOT2cPUGcPUWcPUmcPU2cPVGcPVWcPVmcPV2cPWGcPWWcPT2gQUGgQUWgQUmgQU2gQVGgQVWgQVmgQV2gQWGgQWWgQWmgQT2kKUGkNUWkNUmkOU2kOVGkOVWkOVmkOV2kOWGkOWWkOWmkRT2oKUGoNUWoNUmoOU2oOVGoOVWoOVmoOV2oOWGoOWWoOWmoRT2sKUGsNUWsNUmsOU2sOVGsOVWsOVmsOV2sOWGsOWWsOWmsRT2wKUGwNUWwNUmwOU2wOVGwOVWwOVmwOV2wOWGwOWWwOWmwRT20KUG0NUW0OUm0OU20OVG0OVW0OVm0RV20RWG0RWW0RWm0RT24KUG4OUW4OUm4OU24OVG4RVW4RVm4RV24RWG4RWW4RWm4KW24RT28SUG8OUW8OUm8RU28RVG8RVW8KVm8KV28KWG8KWW8KWm8KW28RUHASUXARUnAKU3AKVHAKVXAKVnARV3ASWHASWXASWnASW3ASUHESUXESUnESU3ESVHESVXESVnES'},
  'phones|m': {src:'B', pal:'171726,100f1c,28283e,1d1a2e,2b2e3a,a7aeb6,13599a,062f72,202230,808793,636b78,373a4e,4a4f5e,ac8cf3,4f48b5', px:'MCwAMSwAMiwAMywBTCwATSwATiwATywBLy0AMC0CMS0CMi0DMy0ENC0BSy0ATC0FTS0CTi0CTy0DUC0BLi4ALy4FMC4CMS4GMi4HMy4DNC4INS4BSi4ASy4FTC4CTS4GTi4HTy4DUC4IUS4BLi8ALy8CMC8JMS8HMi8HMy8INC8INS8BSi8ASy8KTC8KTS8HTi8HTy8LUC8DUS8BLjAALzACMDAMMTAHMjAHMzAINDAINTABSjAASzAKTDAETTAHTjAHTzALUDADUTABLjEALzEEMDEDMTELMjELMzEDNDEINTEBSjEASzEETDECTTEMTjELTzEDUDEIUTEBLjIBLzIIMDIDMTIDMjIDMzIANDIINTIBSjIBSzIITDIITTIDTjIDTzIDUDIIUTIBLjMNLzMBMDMAMTMAMjMAMzMINDMBSzMBTDMATTMATjMATzMIUDMBUTMOMDQBMTQBMjQBMzQBTDQBTTQBTjQBTzQB'},
  'phones|f': {src:'C', pal:'171726,100f1c,28283e,2b2e3a,a7aeb6,1d1a2e,13599a,062f72,202230,808793,636b78,373a4e,4a4f5e', px:'NCwANSwANiwANywBSCwASSwASiwASywBMy0ANC0CNS0CNi0CNy0DOC0BRy0ASC0ESS0CSi0CSy0FTC0BMi4AMy4ENC4CNS4GNi4HNy4FOC4IOS4BRi4ARy4ESC4CSS4GSi4HSy4FTC4ITS4BMi8AMy8CNC8JNS8HNi8HNy8FOC8IOS8BRi8ARy8KSC8CSS8HSi8HSy8LTC8FTS8BMjAAMzACNDAMNTAHNjAHNzAIODAIOTABRjAARzAKSDADSTAHSjAHSzALTDAFTTABMjEAMzEDNDEFNTELNjELNzEFODEIOTEBRjEARzEDSDECSTEMSjELSzEFTDEITTEBMjIBMzIINDIFNTIFNjIFNzIAODIIOTIBRjIBRzIISDIISTIFSjIFSzIFTDIITTIBMzMBNDMANTMANjMANzMIODMBRzMBSDMASTMASjMASzMITDMBNDQBNTQBNjQBNzQBSDQBSTQBSjQBSzQB'},
  'towel|m': {src:'B', pal:'5a5873,f5cb9b,ba7458,84819b,ecebe6,fdfdfd,b2b1c3,ffffff,ff9776,cf3b3b,ab2436,881332,e76856', px:'My4ANC4BSy4CTC4DMi8DMy8BTC8CTS8DMTADMjAATTADTjADLzEDMDEDMTEEMjEDMzEATDEDTTEDTjEETzEAUDEALTIDLjIDLzIDMDIDMTIDMjIFMzIATDIDTTIFTjIDTzIDUDIDUTIDUjIALTMDLjMFLzMFMDMFMTMFMjMGMzMATDMDTTMFTjMFTzMFUDMEUTMGUjMALTQELjQELzQFMDQEMTQEMjQGMzQATDQDTTQFTjQFTzQEUDQGUTQGUjQDLjUELzUEMDUEMTUEMjUGMzUATDUDTTUFTjUETzUEUDUGUTUDLzYFMDYEMTYEMjYGMzYATDYDTTYFTjYETzYEUDYGLzcFMDcEMTcEMjcGMzcGNDcASzcDTDcHTTcFTjcETzcEUDcGMDgEMTgEMjgEMzgGNDgASzgDTDgFTTgETjgETzgGMDkEMTkEMjkEMzkGNDkASzkDTDkFTTkETjkETzkGMToEMjoEMzoGNDoASzoDTDoFTToETjoEMTsEMjsEMzsGNDsASzsDTDsFTTsETjsEMTwEMjwEMzwGNDwASzwDTDwFTTwETjwEMT0EMj0EMz0GND0ASj0DSz0HTD0FTT0ETj0GMT4EMj4EMz4GND4ASj4DSz4FTD4ETT4ETj4GMD8EMT8EMj8EMz8GND8GNT8ASz8FTD8ETT8ETj8GTz8DMEAEMUAEMkAEM0AENEAGNUAATEAETUAGTkAGT0ADMEEAMUEEMkEEM0EENEEGNUEAS0EFTEEETUEGTkEGT0EAMEIDMUIEMkIEM0IENEIGNUIASkIITEIJTUIKTkILMEMDMUMEMkMEM0MENEMGNUMASUMMSkMMS0MJTEMKTUMKTkMLMEQAMUQEMkQEM0QENEQGNUQASUQDSkQFS0QETEQGTUQAMUUAMkUEM0UENEUGNUUASUUMSkUJS0ULTEUKTUULMUYDMkYEM0YENEYENUYGNkYASUYASkYDS0YATEYAMUcDMkcEM0cENEcENUcGNkcASUcASkcAMUgJMkgJM0gJNEgJNUgKNkgLMkkJM0kJNEkJNUkKNkkLMkoAM0oENEoENUoGNkoAMksJM0sKNEsKNUsKNksLM0wANEwANUwDNkwANU0ANk0A'},
  'towel|f': {src:'C', pal:'84819b,5a5873,ecebe6,fdfdfd,1a9092,b2b1c3,ffffff,ff9776,cf3b3b,881332,e76856,ab2436', px:'Ny0ASC0ANi4ANy4BSC4ASS4ANS8ANi8CNy8BSC8ASS8DSi8BNDAANTADNjABSDAESTAASjACSzABMzEANDEDNTEFNjEANzEBSDEASTEASjEFSzEFTDEBMTIAMjIAMzIANDIANTIANjIDNzIBSDIASTIDSjIASzIATDIATTIATjIBMTMAMjMDMzMDNDMDNTMDNjMFNzMBSDMASTMDSjMDSzMDTDMCTTMFTjMBMTQBMjQCMzQDNDQCNTQCNjQFNzQBSDQASTQDSjQDSzQCTDQFTTQFTjQBMjUBMzUCNDUCNTUCNjUFNzUFODUBRzUASDUGSTUDSjUCSzUCTDUFTTUBMjYAMzYDNDYCNTYCNjYCNzYFODYBRzYASDYDSTYCSjYCSzYCTDYFTTYBMjcAMzcDNDcCNTcCNjcCNzcFODcBRzcASDcDSTcCSjcCSzcCTDcFTTcBMjgAMzgDNDgCNTgCNjgCNzgFODgBRzgASDgDSTgCSjgCSzgFTDgFTTgBMjkAMzkDNDkCNTkCNjkCNzkFODkBRzkASDkDSTkCSjkCSzkFTDkFTTkBMjoCMzoCNDoCNToCNjoCNzoFODoBRzoASDoDSToCSjoCSzoFTDoFTToBMjsBMzsCNDsCNTsCNjsCNzsFODsBRzsASDsDSTsCSjsCSzsFTDsBMzwBNDwCNTwCNjwCNzwFODwBRjwARzwGSDwDSTwCSjwFSzwFTDwBMz0AND0CNT0CNj0CNz0FOD0FOT0BRj0ARz0DSD0CST0CSj0FSz0FTD0BMz4AND4CNT4CNj4CNz4COD4FOT4BRj4ARz4DSD4CSj4FSz4BMz8BND8CNT8CNj8CNz8COD8FOT8BRj8ARz8DSz8BNEABNUACNkACN0ACOEAFOUABNEEANUEDNkECN0ECOEEFOUEBR0EDS0EBNEIANUIDNkICN0ICOEIFOUIBRUIHRkIHSEIISkIJNEMANUMCNkMCN0MCOEMFOUMBRUMKRkMKR0MISEMLSUMLSkMJNEQBNUQCNkQCN0QCOEQFOUQBRUQARkQDR0QCSEQFSUQBNUUBNkUCN0UCOEUFOUUBRUUKRkUIR0UJSEULSUUJNUYBNkYCN0YCOEYCOUYFOkYBRUYBRkYAR0YBSEYBNUcBNkcCN0cCOEcCOUcFOkcBRUcBRkcBNkgIN0gIOEgIOUgLOkgJNkkIN0kIOEkIOUkLOkkJNkoAN0oCOEoCOUoFOkoBNksIN0sLOEsLOUsLOksJN0wBOEwBOUwAOkwBOU0BOk0B'},
  'scarf|m': {src:'B', pal:'830e37,fc826c,e2514d,c8323f,610331,a51d3b,ac8cf3,4f48b5', px:'TSgATigATygAUCgAUSgAUigAUygAVCgAVSgAVigAVygAWCgAWSgASykATCkATSkBTikBTykCUCkCUSkCUikCUykCVCkCVSkCVikCVykCWCkCWSkDWikAWykAXCkAXSkANCoANSoANioANyoAOCoAOSoAOioAOyoAPCoAPSoAPioCPyoCQCoCQSoCQioAQyoARCoARSoARioARyoASCoASSoASioASyoETCoCTSoCTioDTyoDUCoDUSoDUioDUyoDVCoDVSoDVioDVyoDWCoDWSoDWioCWyoCXCoCXSoDXioAXyoAYCoAYSoAMysANCsBNSsBNisCNysCOCsCOSsCOisCOysCPCsCPSsCPisCPysCQCsCQSsCQisCQysCRCsCRSsCRisCRysCSCsCSSsCSisDSysFTCsETSsFTisFTysAUCsAUSsAUisAUysAVCsAVSsAVisAVysAWCsAWSsFWisDWysDXCsDXSsDXisCXysCYCsCYSsDYisEYysEMywANCwBNSwBNiwCNywCOCwCOSwCOiwCOywCPCwCPSwCPiwCPywCQCwCQSwCQiwCQywCRCwCRSwCRiwCRywCSCwCSSwDSiwDSywFTCwETSwATiwFTywEUCwEUSwEUiwEUywEVCwEVSwEViwEVywEWCwEWSwAWiwAWywAXCwAXSwFXiwDXywDYCwDYSwDYiwDYywDZCwEZSwEZiwEMy0ANC0CNS0CNi0DNy0DOC0DOS0DOi0DOy0DPC0DPS0DPi0DPy0DQS0DQi0DQy0DRC0DRS0DRi0DRy0DSC0DSS0DSi0FSy0FTC0ETS0ATi0EWS0EWi0EWy0EXC0EXS0AXi0FXy0FYC0FYS0DYi0FYy0FZC0FZS0EMi4AMy4CNC4DNS4DNi4DNy4DOC4DOS4DOi4DOy4DPC4DPS4DPi4DPy4DQS4DQi4DQy4DRC4DRS4DRi4DRy4DSC4FSS4FSi4FSy4ATC4FTS4ETi4ATy4AUC4AUS4AUi4AUy4AVC4AVS4AVi4AXS4EXi4EXy4AYC4AYS4AYi4AYy4FZC4EMi8AMy8DNC8ANS8ANi8ANy8EOC8FOS8FOi8FOy8FPC8DPS8DPi8DPy8DQC8DQS8DQi8DQy8FRC8FRS8FRi8FRy8FSC8ASS8ASi8ASy8FTC8FTS8ETi8CTy8CUC8CUS8CUi8CUy8CVC8CVS8CVi8DVy8AWC8AWS8AWi8AXy8EYC8EYS8EYi8AYy8EMjAEMzAANDABNTABNjACNzAFODAEOTAFOjAFOzAFPDAFPTAFPjAFPzAFQDAFQTAFQjAFQzAFRDAARTAARjAARzAASDAASTAASjAFSzAETDAETTAETjADTzADUDADUTADUjADUzADVDADVTADVjADVzACWDACWTACWjADWzAAXDAAXTAEYjAEYzAEZDAEMjEGMzEANDECNTEDNjEDNzEFOTEAOjEAOzEAPDEAPTEFPjEFPzEFQDEFQTEAQjEAQzEARDEARTEARjEARzEFSTEESjEESzEHTDEHTTEHTzEAUDEAUTEAUjEAUzEAVDEAVTEAVjEFXzEEZDEEMzIENDIFNTIFNjIANzIFODIEOjIEOzIEPDIAPTIAPjIAPzIAQDIAQTIAQjIAQzIFRDIERTIERjIESzIHTDIHUTIAUjIEUzIAVDIENDMANTMANjMANzMEPDMEPTMEPjMEPzMEQDMAQTMEQjMEQzMEUzMANDQANTQCNjQDNzQEQDQENTUANjUDNzUENTYANjYFNzYENTcANjcENTgANjgENTkENjkENToENTsE'},
  'scarf|f': {src:'C', pal:'830e37,fc826c,e2514d,610331,c8323f,a51d3b,2cb0a0,67f1bf,46d0af', px:'TScATCgATSgATigBUSgAUigAUygAVCgAVSgASCkASSkASikASykCTCkATSkBTikBUSkCUikCUykCVCkCVSkCOCoAOSoAOioAOyoAPCoAPSoAPioAPyoAQCoAQSoAQioAQyoARCoARSoARioARyoDSCoBSSoBSioCSyoCTCoCTSoCTioETyoEUSoEUioEUyoEVCoEVSoEXioAXyoAYCoAYSoANysAOCsBOSsBOisCOysCPCsCPSsCPisCPysCQCsCQSsCQisCQysCRCsCRSsCRisERysFSCsDSSsCSisESysETCsETSsFTisFTysAUCsAUSsAUisAUysAVCsAVSsAXisCXysCYCsCYSsEYisDYysDNywAOCwBOSwBOiwCOywCPCwCPSwCPiwCPywCQCwCQSwCQiwCQywCRCwCRSwERiwERywFSCwDSSwFSiwFSywATCwATSwATiwFTywDUCwDUSwDUiwDUywDVCwDVSwDViwDXiwEXywEYCwEYSwEYiwEYywEZCwDZSwDZiwDNy0AOC0COS0COi0COy0EPC0EPS0EPi0EPy0EQC0EQS0EQi0EQy0ERC0ERS0ERi0FRy0FSC0DSS0ASi0ASy0FTC0ATS0ATi0DXi0FXy0FYC0FYS0EYi0FYy0FZC0FZS0DNi4ANy4COC4COS4EOi4EOy4EPC4EPS4EPi4EPy4EQC4EQS4EQi4EQy4ERC4ERS4FRi4FRy4FSC4FSS4DSi4ASy4ATC4ATS4ATi4ATy4AUC4AUS4AUi4AUy4AVC4AVS4AXi4DXy4AYC4AYS4AYi4AYy4FZC4DNi8ANy8EOC8AOS8AOi8AOy8DPC8EPS8EPi8EPy8EQC8EQS8EQi8FQy8FRC8FRS8FRi8ARy8ASC8FSS8DSi8ASy8ATC8BTS8BTi8CTy8CUC8CUS8CUi8CUy8CVC8CVS8CXy8DYC8DYS8DYi8AYy8DNjADNzAAODABOTABOjACOzAFPDADPTAFPjAFPzAFQDAFQTAFQjAFQzAARDAARTAARjAFRzAFSDADSTADSjACSzACTDACTTAETjAETzAEUDAEUTAEUjAEUzAEVDAEVTAEYjADYzADZDADNzEAODECOTEEOjEEOzEFPDEDPTEFPjEFPzEFQDEFQTEAQjEAQzEARDEARTEFRjEDRzEDSzEETDEFTTEFTjEATzEAUDEAUTEAUjEAUzEAVDEAVTEAXjEDXzEDZDEDNzIDODIFOTIFOjIAOzIFPDIDPTIAPjIAPzIAQDIAQTIAQjIFQzIDRDIDRTIDTTIFTjIDTzIDUDIDUTIDUjIDUzIAVDIAVTIAXTIEXjIFXzIFYDIDODMAOTMAOjMAOzMDPDMGPTMDPjMDPzMDQDMAQTMDQjMDQzMHRDMHXTMAXjMFXzMDOTQAOjQEOzQDPDQGPTQGPjQGPzQIQDQDQTQHQjQHQzQHXTQAXjQDOTUAOjUEOzUDPTUGQTUHQjUHXTUDXjUDOTYAOjYFOzYDXTYDXjYDOTcAOjcDXzcDOTgAOjgDOTkDOjkDOToDOTsD'},
  'belt|m': {src:'B', pal:'974401,702300,ffd953,f9cf3b,e6ad21,fff4c8,be740e,1b0d14,a16830,be8214,773c1b,140810,c89628,ae8b8b,6c4c50,ffe99d,ffe486,f4d36a,ca9a4a,2a1a1e,221319,890e38,ffebf0,660332,ffbec8,d1323f,ad1e3b,e76856,5f5d6c,21212b,1a1823', px:'N14AOF4AOV4AOl4AO14APF4APV4APl4AP14AQF4AQV4AQl4AQ14ARF4ARV4ARl4AR14ASF4BNl8AN18COF8COV8DOl8DO18DPF8DPV8DPl8DP18DQF8DQV8DQl8DQ18DRF8DRV8DRl8DR18DSF8ESV8BNWAANmAFN2ACOGACOWADOmADO2ADPGADPWADPmADP2ADQGADQWADQmADQ2ADRGADRWADRmADR2AESGAESWAFSmABNWEANmEDN2EDOGEDOWEDOmEDO2EDPGEDPWEDPmEDP2EDQGEDQWEDQmEDQ2EDRGEDRWEDRmEER2EESGEESWEGSmEGS2EBKmIHK2IHLGIHLWIHLmIHL2IHMGIHMWIHMmIHM2IHNGIHNWIANmIDN2IDOGIDOWIEOmIEO2IEPGIEPWIIPmIIP2IIQGIJQWIIQmIKQ2IERGIERWIERmIER2IESGIESWIGSmIGS2IBTGIHTWIHTmIHT2IHUGIHUWIHUmIHU2IHVGIHVWILKmMMK2MNLGMMLWMOLmMML2MOMGMMMWMOMmMMM2MONGMMNWMANmMMN2MDOGMMOWMEOmMMO2MIPGMMPWMPPmMMP2MQQGMMQWMQQmMMQ2MKRGMMRWMERmMMR2MESGMMSWMGSmMMS2MBTGMMTWMOTmMMT2MOUGMMUWMOUmMMU2MOVGMMVWMLKmQHK2QOLGQOLWQALmQAL2QAMGQOMWQOMmQOM2QONGQONWQANmQDN2QDOGQEOWQEOmQEO2QIPGQJPWQPPmQPP2QQQGQQQWQRQmQRQ2QSRGQJRWQERmQER2QESGQGSWQGSmQGS2QBTGQOTWQOTmQOT2QOUGQAUWQAUmQBU2QTVGQUVWQLKmUHK2UOLGUALWUCLmUDL2UEMGUBMWUBMmUTM2UTNGUTNWUANmUDN2UDOGUEOWUEOmUIO2UPPGUPPWUPPmUQP2UQQGUQQWURQmURQ2USRGUSRWUKRmUER2UESGUGSWUGSmUGS2UBTGUTTWUTTmUAT2UAUGUCUWUDUmUEU2UBVGUUVWULKmYHK2YOLGYALWYDLmYDL2YEMGYGMWYBMmYTM2YTNGYTNWYANmYDN2YDOGYEOWYEOmYIO2YPPGYQPWYQPmYVP2YWQGYVQWYXQmYRQ2YSRGYSRWYKRmYER2YESGYGSWYGSmYGS2YBTGYTTWYTTmYAT2YCUGYDUWYEUmYGU2YBVGYUVWYLKmcHK2cOLGcALWcDLmcEL2cEMGcGMWcBMmcTM2cTNGcTNWcANmcDN2cDOGcEOWcIOmcQO2cQPGcQPWcQPmcVP2cYQGcZQWcXQmcSQ2cSRGcIRWcSRmcKR2cESGcGSWcGSmcGS2cBTGcTTWcTTmcAT2cDUGcEUWcEUmcGU2cBVGcUVWcLKmgHK2gALGgDLWgDLmgEL2gEMGgGMWgBMmgTM2gTNGgTNWgANmgDN2gDOGgEOWgKOmgRO2gJPGgQPWgRPmgVP2gZQGgaQWgXQmgSQ2gSRGgIRWgJRmgKR2gESGgGSWgGSmgGS2gBTGgTTWgTTmgAT2gDUGgEUWgEUmgGU2gGVGgBVWgLKmkHK2kOLGkALWkELmkEL2kGMGkGMWkBMmkTM2kTNGkTNWkANmkDN2kDOGkEOWkEOmkKO2kRPGkRPWkRPmkXP2kaQGkaQWkXQmkSQ2kIRGkSRWkKRmkER2kESGkGSWkGSmkGS2kBTGkTTWkTTmkAT2kEUGkEUWkGUmkGU2kBVGkUVWkLKmoHK2oOLGoBLWoELmoGL2oGMGoGMWoBMmoUM2oUNGoUNWoANmoDN2oDOGoEOWoEOmoKO2oRPGoRPWoRPmoSP2oXQGoXQWoSQmoIQ2oIRGoSRWoKRmoER2oGSGoGSWoASmoGS2oBTGoUTWoUTmoBT2oEUGoGUWoGUmoGU2oBVGoUVWoLKmsHK2sOLGsBLWsGLmsAL2sGMGsBMWsBMmsUM2sUNGsUNWsANmsDN2sEOGsEOWsEOmsKO2sSPGsSPWsSPmsIP2sIQGsIQWsIQmsIQ2sIRGsSRWsKRmsER2sGSGsGSWsASmsGS2sBTGsUTWsUTmsBT2sBUGsAUWsAUmsGU2sBVGsUVWsLKmwHK2wTLGwTLWwBLmwBL2wBMGwUMWwUMmwUM2wUNGwUNWwANmwEN2wEOGwEOWwEOmwEO2wKPGwJPWwIPmwIP2wIQGwIQWwIQmwIQ2wSRGwJRWwERmwGR2wGSGwASWwASmwGS2wBTGwUTWwUTmwUT2wUUGwBUWwBUmwBU2wUVGwUVWwLKm0LK20ULG0HLW0HLm0HL20HMG0HMW0HMm0HM20HNG0HNW0BNm0EN20EOG0EOW0EOm0EO20EPG0KPW0KPm0KP20KQG0IQW0KQm0KQ20KRG0ERW0ERm0GR20GSG0ASW0GSm0BS20HTG0HTW0HTm0HT20HUG0HUW0HUm0HU20HVG0UVW0LKm4LK24LLG4LLW4LLm4LL24LMG4LMW4LMm4LM24LNG4LNW4LNm4BN24EOG4EOW4EOm4EO24EPG4EPW4GPm4GP24GQG4JQW4GQm4GQ24GRG4GRW4GRm4GR24ASG4ASW4GSm4BS24LTG4LTW4LTm4LT24LUG4LUW4LUm4LU24LVG4LVW4LK28bLG8cLW8dLm8dMG8dMW8dMm8dM28dNG8dNW8dNm8MN28EOG8MOW8EOm8MO28GPG8MPW8GPm8MP28GQG8MQW8GQm8MQ28GRG8MRW8GRm8MR28ASG8MSW8BSm8dS28dTG8dTW8dTm8dT28dUG8dUm8eU28eK3AbLHAcLXAdLnAdL3AdMnAdM3AdNHAdNXAdNnAdN3ABOHAEOXAGOnAGO3AAPHAAPXAAPnAAP3AAQHAAQXAAQnAAQ3AARHAARXAARnAAR3AASHAGSXAFSnAdS3AdTHAdTXAdTnAdUXAeUnAeU3AeN3EBOHEGOXEAOnEAO3EAPHEAPXEAPnEAP3EAQHEAQXEAQnEAQ3EARHEARXEARnEAR3EGSHEBOHIBOXIBOnIBO3IBPHIBPXIBPnIBP3IBQHIBQXIBQnIBQ3IBRHIBRXIBRnIBR3IBSHIB'},
  'belt|f': {src:'C', pal:'974401,702300,ffd953,f9cf3b,e6ad21,fff4c8,be740e,a16830,be8214,773c1b,1b0d14,ffe99d,ffe486,f4d36a,140810,c89628,6c4c50,ca9a4a,2a1a1e,221319,890e38,ffebf0,660332,ffbec8,d1323f,ad1e3b', px:'N14AOF4AOV4AOl4AO14APF4APV4APl4AP14AQF4AQV4AQl4AQ14ARF4ARV4ARl4AR14ASF4BNl8AN18COF8COV8DOl8DO18DPF8DPV8DPl8DP18DQF8DQV8DQl8DQ18DRF8DRV8DRl8DR18DSF8ESV8BNWAANmAFN2ACOGACOWADOmADO2ADPGADPWADPmADP2ADQGADQWADQmADQ2ADRGADRWADRmADR2AESGAESWAFSmABNWEANmEDN2EDOGEDOWEDOmEDO2EDPGEDPWEDPmEDP2EDQGEDQWEDQmEDQ2EDRGEDRWEDRmEER2EESGEESWEGSmEGS2EBNWIANmIDN2IDOGIDOWIEOmIEO2IEPGIEPWIHPmIHP2IHQGIIQWIHQmIJQ2IERGIERWIERmIER2IESGIESWIGSmIGS2IBLGMKLWMKLmMKL2MKMGMKMWMKMmMKM2MKNGMKNWMANmMDN2MDOGMEOWMEOmMEO2MHPGMHPWMLPmMLP2MMQGMMQWMMQmMNQ2MJRGMJRWMERmMER2MESGMGSWMGSmMGS2MBTGMKTWMKTmMKT2MKUGMKUWMKUmMKU2MOK2QKLGQPLWQQLmQPL2QAMGQPMWQBMmQPM2QQNGQPNWQANmQPN2QDOGQPOWQEOmQPO2QHPGQIPWQLPmQPP2QMQGQPQWQNQmQPQ2QRRGQIRWQERmQPR2QESGQPSWQGSmQPS2QBTGQPTWQQTmQPT2QAUGQPUWQQUmQPU2QSVGQPK2UKLGUQLWUALmUAL2UCMGUDMWUEMmUBM2UQNGUQNWUANmUDN2UDOGUEOWUEOmUHO2ULPGULPWULPmUMP2UMQGUMQWUNQmUNQ2URRGURRWUJRmUER2UESGUGSWUGSmUGS2UBTGUQTWUATmUCT2UDUGUEUWUBUmUBU2UTVGUOK2YKLGYQLWYALmYCL2YDMGYEMWYGMmYBM2YSNGYSNWYANmYDN2YDOGYEOWYEOmYHO2YLPGYMPWYMPmYUP2YVQGYUQWYWQmYNQ2YRRGYRRWYJRmYER2YESGYGSWYGSmYGS2YBTGYSTWYATmYDT2YDUGYEUWYGUmYBU2YTVGYOK2cKLGcQLWcALmcDL2cEMGcEMWcGMmcBM2cSNGcSNWcANmcDN2cDOGcEOWcHOmcMO2cMPGcMPWcMPmcUP2cXQGcYQWcWQmcRQ2cRRGcHRWcRRmcJR2cESGcGSWcGSmcGS2cBTGcSTWcATmcDT2cEUGcEUWcGUmcBU2cTVGcOK2gKLGgQLWgALmgDL2gEMGgEMWgGMmgBM2gSNGgSNWgANmgDN2gDOGgEOWgJOmgNO2gIPGgMPWgNPmgUP2gYQGgZQWgWQmgRQ2gRRGgHRWgIRmgJR2gESGgGSWgGSmgGS2gBTGgSTWgATmgDT2gEUGgEUWgGUmgBU2gTVGgOK2kKLGkQLWkALmkEL2kEMGkGMWkGMmkBM2kSNGkSNWkANmkDN2kDOGkEOWkEOmkJO2kNPGkNPWkNPmkWP2kZQGkZQWkWQmkRQ2kHRGkRRWkJRmkER2kESGkGSWkGSmkGS2kBTGkSTWkATmkDT2kEUGkGUWkGUmkBU2kTVGkOK2oKLGoQLWoBLmoEL2oGMGoGMWoGMmoBM2oSNGoSNWoANmoDN2oDOGoEOWoEOmoJO2oNPGoNPWoNPmoRP2oWQGoWQWoRQmoHQ2oHRGoRRWoJRmoER2oGSGoGSWoASmoGS2oBTGoSTWoATmoET2oEUGoGUWoGUmoBU2oTVGoOK2sKLGsQLWsBLmsBL2sAMGsAMWsGMmsBM2sTNGsTNWsANmsDN2sEOGsEOWsEOmsJO2sRPGsRPWsRPmsHP2sHQGsHQWsHQmsHQ2sHRGsRRWsJRmsER2sGSGsGSWsASmsGS2sBTGsTTWsBTmsGT2sAUGsAUWsBUmsBU2sTVGsOKmwKK2wQLGwSLWwSLmwTL2wBMGwBMWwBMmwTM2wTNGwTNWwANmwEN2wEOGwEOWwEOmwEO2wJPGwIPWwHPmwHP2wHQGwHQWwHQmwHQ2wRRGwIRWwERmwGR2wGSGwASWwASmwGS2wBTGwTTWwTTmwBT2wBUGwBUWwTUmwTU2wTVGwTVWwOKm0KK20SLG0TLW0KLm0KL20KMG0KMW0KMm0KM20KNG0KNW0BNm0EN20EOG0EOW0EOm0EO20EPG0JPW0JPm0JP20JQG0HQW0JQm0JQ20JRG0ERW0ERm0GR20GSG0ASW0GSm0BS20KTG0KTW0KTm0KT20KUG0KUW0KUm0KU20KVG0TVW0OKm4OK24OLG4OLW4OLm4OL24OMG4OMW4OMm4OM24ONG4ONW4ONm4BN24EOG4EOW4EOm4EO24EPG4EPW4GPm4GP24GQG4IQW4GQm4GQ24GRG4GRW4GRm4GR24ASG4ASW4GSm4BS24OTG4OTW4OTm4OT24OUG4OUW4OUm4OU24OVG4OVW4ONm8PN28EOG8POW8EOm8PO28GPG8PPW8GPm8PP28GQG8PQW8GQm8PQ28GRG8PRW8GRm8PR28ASG8PSW8BN3ABOHAEOXAGOnAGO3AAPHAAPXAAPnAAP3AAQHAAQXAAQnAAQ3AARHAARXAARnAAR3AASHAGSXAFN3EBOHEGOXEAOnEAO3EAPHEAPXEAPnEAP3EAQHEAQXEAQnEAQ3EARHEARXEARnEAR3EGSHEBOHIBOXIBOnIBO3IBPHIBPXIBPnIBP3IBQHIBQXIBQnIBQ3IBRHIBRXIBRnIBR3IBSHIB'},
};

// Unpack a lifted style once: [{x, y, k (1 hair, 2 skin, 3 band or tie), v, fk, fv}]. Hair always hangs in
// front of the shoulders, as drawn; the stored behind-the-body bit is left unused.
const HAIR_PX = {};
function imgHair(id){
  const src = IMG_HAIR[id]; if (!src) return null;
  if (HAIR_PX[id]) return HAIR_PX[id];
  const pal = src.pal.split(',').map(h => hexRgb('#' + h)), s = atob(src.px), out = [];
  const val = (k, v) => k === 1 ? v : pal[v];
  for (let i = 0; i < s.length; i += 5){
    const fl = s.charCodeAt(i + 2), k = fl & 3, fk = fl >> 3 & 3;
    out.push({x:s.charCodeAt(i), y:s.charCodeAt(i + 1), k, v:val(k, s.charCodeAt(i + 3)), fk, fv:fk ? val(fk, s.charCodeAt(i + 4)) : null});
  }
  return HAIR_PX[id] = out;
}
// Where a part of the body sits in each frame relative to the first: the idle loop bobs the head down a
// pixel and sways it up to three pixels sideways. Found by sliding that region until it lines up.
const headOffsets = (dec, maps) => regionOffsets(dec, maps, 18, 48, 40, 86, t => t <= 1);   // the face: skin and eyes
const bodyOffsets = (dec, maps) => regionOffsets(dec, maps, 56, 112, 20, 108, t => t === 4 || t === 5);   // shirt and pants
// Each row's outer edges in the first frame (left, right), body only: no hair, cape or aura
function rowExtents(dec, maps){
  const W = dec.w, d = dec.frames[0].data.data, m = maps[0], L = [], R = [];
  for (let y = 0; y < dec.h; y++){ let l = -1, r = -1;
    for (let x = 0; x < W; x++){ const p = y * W + x; if (d[p * 4 + 3] === 255 && m[p] !== 2 && m[p] !== 7 && m[p] !== 8){ if (l < 0) l = x; r = x; } }
    L.push(l); R.push(r); }
  return {L, R};
}
function regionOffsets(dec, maps, y0, y1, x0, x1, ok){
  const W = dec.w, f0 = dec.frames[0].data.data, ref = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){ const p = y * W + x; if (f0[p * 4 + 3] === 255 && ok(maps[0][p])) ref.push([x, y, f0[p * 4], f0[p * 4 + 1], f0[p * 4 + 2]]); }
  return dec.frames.map(f => {
    const d = f.data.data; let best = {dx:0, dy:0, n:-1};
    for (let dy = -2; dy <= 3; dy++) for (let dx = -5; dx <= 5; dx++){
      let n = 0;
      for (const [x, y, r, g, b] of ref){ const i = ((y + dy) * W + x + dx) * 4; if (d[i] === r && d[i + 1] === g && d[i + 2] === b && d[i + 3] === 255) n++; }
      if (n > best.n) best = {dx, dy, n};
    }
    return {dx:best.dx, dy:best.dy};
  });
}
// Her build: arms drawn narrower than the sprite's, kept attached at the body side so the outer
// silhouette moves in. Each rank gets a target arm thickness that climbs evenly (8.2px at F, +0.4px per
// rank), so she gets a little more athletic every level. Widths are measured once on the first frame and
// reused for every frame so the arms don't flicker as she sways.
const ARM_TARGET = r => 8.2 + .4 * r;
function slimArms(dec, maps, rank){
  const W = dec.w, f0 = dec.frames[0].data.data, m0 = maps[0];
  const topY = d => { for (let y = 0; y < 4; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] === 255) return y; return 0; };
  // One arm's run on a row: from the outline just outside the first skin pixel to the last arm pixel before the torso
  const run = (d, m, y, side) => {
    const xs = side < 0 ? [...Array(50).keys()] : [...Array(50).keys()].map(i => W - 1 - i);
    const at = x => y * W + x, arm = x => d[at(x) * 4 + 3] === 255 && ![4, 5, 7, 8].includes(m[at(x)]);
    const i0 = xs.findIndex(x => m[at(x)] === 1); if (i0 < 0) return null;
    let a = i0; if (a > 0 && arm(xs[a - 1])) a--;
    let b = i0; while (b + 1 < xs.length && arm(xs[b + 1])) b++;
    return {xs, a, b};
  };
  const cut = {}, dy0 = topY(f0), skins = {};
  for (let Y = 56; Y <= 128; Y++) for (const side of [-1, 1]){
    const r = run(f0, m0, Y + dy0, side); if (!r) continue;
    let skin = 0; for (let i = r.a; i <= r.b; i++) if (m0[(Y + dy0) * W + r.xs[i]] === 1) skin++;
    if (skin) skins[side + ':' + Y] = skin;
  }
  // Scale every arm row by the same ratio so the arm keeps its shape, just at this rank's thickness
  const vals = Object.entries(skins).filter(([key]) => { const Y = +key.split(':')[1]; return Y >= 64 && Y <= 120; }).map(e => e[1]), avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1), ratio = Math.min(1, ARM_TARGET(rank) / avg);
  // Fractional cuts are spread across rows (golden-ratio dither) so the average lands on the target
  for (const key in skins) cut[key] = Math.max(0, Math.floor(skins[key] * (1 - ratio) + (+key.split(':')[1] * .618034) % 1));
  const tones = [...new Set([...m0.keys()].filter(p => m0[p] === 4 && f0[p * 4 + 3] === 255).map(p => (f0[p * 4] << 16) | (f0[p * 4 + 1] << 8) | f0[p * 4 + 2]))]
    .sort((a, b) => rgbHsl(a >> 16, a >> 8 & 255, a & 255)[2] - rgbHsl(b >> 16, b >> 8 & 255, b & 255)[2]);
  dec.frames.forEach((f, fi) => {
    const d = f.data.data, m = maps[fi], dy = topY(d);
    for (let Y = 56; Y <= 128; Y++) for (const side of [-1, 1]){
      const k = cut[side + ':' + Y]; if (!k) continue;
      const y = Y + dy, r = run(d, m, y, side); if (!r) continue;
      const len = r.b - r.a + 1, n = len - k; if (n < 4) continue;
      const src = [], outside = r.a > 0 ? r.xs[r.a - 1] : -1;
      for (let i = r.a; i <= r.b; i++){ const p = y * W + r.xs[i]; src.push([d[p * 4], d[p * 4 + 1], d[p * 4 + 2], d[p * 4 + 3], m[p]]); }
      const fill = outside >= 0 ? [d[(y * W + outside) * 4], d[(y * W + outside) * 4 + 1], d[(y * W + outside) * 4 + 2], d[(y * W + outside) * 4 + 3], m[y * W + outside]] : [0, 0, 0, 0, 0];
      for (let i = 0; i < len; i++){
        const p = y * W + r.xs[r.a + i], j = i - k;   // the outer k pixels become whatever was beside the arm
        const s = j < 0 ? fill : src[Math.round(j * (len - 1) / (n - 1))];
        d[p * 4] = s[0]; d[p * 4 + 1] = s[1]; d[p * 4 + 2] = s[2]; d[p * 4 + 3] = s[3]; m[p] = s[4];
      }
    }
    // Soften the pec and ab lines on her top: inside the chest, the shirt's darkest tone steps up one shade
    if (tones.length > 3){
      const darkest = new Set(tones.slice(0, 2)), up = tones[2];
      for (let y = 60 + dy; y <= 96 + dy; y++) for (let x = 48; x <= 78; x++){
        const p = y * W + x; if (m[p] !== 4 || m[p - 1] !== 4 || m[p + 1] !== 4 || m[p - W] !== 4 || m[p + W] !== 4) continue;
        if (darkest.has((d[p * 4] << 16) | (d[p * 4 + 1] << 8) | d[p * 4 + 2])){ d[p * 4] = up >> 16; d[p * 4 + 1] = up >> 8 & 255; d[p * 4 + 2] = up & 255; }
      }
    }
    // Lift the darkest skin tone inside the arms (muscle splits) at F to C; from B up her muscle lines stay,
    // so she looks leaner and more toned as she ranks up
    if (rank >= 4) return;
    const lift = hexRgb('#94493b');
    for (let y = 56 + dy; y <= 128 + dy; y++) for (let x = 1; x < W - 1; x++){
      if (x > 44 && x < 82) continue;
      const p = y * W + x; if (m[p] !== 1 || m[p - 1] !== 1 || m[p + 1] !== 1) continue;
      if (hex6(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]) === '6e2624'){ d[p * 4] = lift[0]; d[p * 4 + 1] = lift[1]; d[p * 4 + 2] = lift[2]; }
    }
  });
}
// Hair hanging below the head (her ponytail) is cleared too. Where it covered the shoulder, that part of
// the shoulder was never drawn, so each gap is filled from the body on either side and given an outline.
function clearLowHair(img, map, headBottom){
  const d = img.data, holes = [];
  for (let y = headBottom + 1; y < SPRITE_H; y++) for (let x = 0; x < SPRITE_W; x++){
    const q = y * SPRITE_W + x; if (map[q] !== 2) continue;
    d[q * 4 + 3] = 0; map[q] = 0; holes.push(q);
  }
  if (!holes.length) return;
  // The aura hugged the old ponytail; clear its glow there too
  for (const q of holes){ const x = q % SPRITE_W, y = q / SPRITE_W | 0;
    for (let oy = -6; oy <= 6; oy++) for (let ox = -6; ox <= 6; ox++){ const xx = x + ox, yy = y + oy; if (xx < 0 || xx >= SPRITE_W || yy < 0 || yy >= SPRITE_H) continue; const r = yy * SPRITE_W + xx; if (map[r] === 8){ d[r * 4 + 3] = 0; map[r] = 0; } } }
  const solid = q => d[q * 4 + 3] === 255, filled = [];
  for (const q of holes){
    const x = q % SPRITE_W; let l = -1, r = -1;
    for (let k = 1; k <= 14 && x - k >= 0; k++) if (solid(q - k)){ l = q - k; break; }
    for (let k = 1; k <= 14 && x + k < SPRITE_W; k++) if (solid(q + k)){ r = q + k; break; }
    if (l < 0 || r < 0) continue;   // open air beside the body stays empty
    d[q * 4] = d[l * 4]; d[q * 4 + 1] = d[l * 4 + 1]; d[q * 4 + 2] = d[l * 4 + 2]; d[q * 4 + 3] = 255; map[q] = map[l]; filled.push(q);
  }
  // The body's own outline color, taken from its silhouette edge, closes any newly exposed edge
  const counts = new Map();
  for (let y = headBottom + 8; y < headBottom + 50 && y < SPRITE_H; y++) for (let x = 1; x < SPRITE_W - 1; x++){
    const q = y * SPRITE_W + x; if (!solid(q) || (solid(q - 1) && solid(q + 1))) continue;
    const k = (d[q * 4] << 16) | (d[q * 4 + 1] << 8) | d[q * 4 + 2]; counts.set(k, (counts.get(k) || 0) + 1);
  }
  const k = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  for (const q of filled) if (!solid(q - SPRITE_W) || !solid(q + 1) || !solid(q - 1)){ d[q * 4] = k >> 16 & 255; d[q * 4 + 1] = k >> 8 & 255; d[q * 4 + 2] = k & 255; map[q] = 0; }
}
// Paint a style into one padded frame, shifted to where the head is in that frame.
function applyHair(img, map, id, ramp, off){
  const st = styleById(id), L = imgHair(id);
  if (!st || !L) return;   // the sprite's own hair
  const {dx, dy} = off, d = img.data, tails = [], auraSeen = new Map(), headBottom = 52 + dy;
  let hadBand = false;
  const bandCols = new Set(), gold = [];
  for (let y = 0; y <= headBottom; y++) for (let x = 0; x < SPRITE_W; x++){
    const q = y * SPRITE_W + x, Y = y - dy, X = x - dx;   // position on the head, whatever the frame
    if (map[q] === 8){   // the glow hugging the old hair; redrawn around the new hair below
      const k = (d[q * 4] << 16) | (d[q * 4 + 1] << 8) | d[q * 4 + 2]; auraSeen.set(k, (auraSeen.get(k) || 0) + 1);
      d[q * 4 + 3] = 0; map[q] = 0; continue;
    }
    // His A-Rank band is gold, so it isn't tagged as a band; gold in the headband's spot counts as one
    if (st.band && map[q] === 0 && Y >= 33 && Y <= 52 && X >= 36 && X <= 90){ const h = rgbHsl(d[q * 4], d[q * 4 + 1], d[q * 4 + 2]); if (h[0] >= 28 && h[0] <= 58 && h[1] > .5){ gold.push([q, X]); continue; } }
    if (map[q] === 3){ hadBand = true; bandCols.add((d[q * 4] << 16) | (d[q * 4 + 1] << 8) | d[q * 4 + 2]); if (X < 44 || X > 82) tails.push([q, d[q * 4], d[q * 4 + 1], d[q * 4 + 2]]); }
    // The old fringe shaded the forehead skin under it; clear that so the forehead is repainted clean
    const forehead = map[q] === 1 && Y <= 40 && Math.abs(X - 63) <= 17;
    if (!forehead && ((map[q] !== 2 && map[q] !== 3) || (Y >= 39 && Y <= 41 && X >= 54 && X <= 74))) continue;   // keep the eyebrows
    d[q * 4 + 3] = 0; map[q] = 0;
  }
  if (gold.length >= 20){   // enough of it to be a band, not a stray hair ornament
    hadBand = true;
    for (const [q, X] of gold){
      bandCols.add((d[q * 4] << 16) | (d[q * 4 + 1] << 8) | d[q * 4 + 2]);
      if (X < 44 || X > 82){ tails.push([q, d[q * 4], d[q * 4 + 1], d[q * 4 + 2]]); map[q] = 3; } else { d[q * 4 + 3] = 0; map[q] = 0; }
    }
  }
  // The styles' bands were drawn in red; each red shade becomes the same-lightness shade of this rank's band
  const lum = c => rgbHsl(c[0], c[1], c[2])[2];
  const rankBand = [...bandCols].map(k => [k >> 16 & 255, k >> 8 & 255, k & 255]).sort((a, b) => lum(a) - lum(b));
  const bandTone = c => { if (!st.band || !rankBand.length) return c;
    const i = BAND_SRC.reduce((bi, s, j) => Math.abs(lum(s) - lum(c)) < Math.abs(lum(BAND_SRC[bi]) - lum(c)) ? j : bi, 0);
    return rankBand[Math.round(i * (rankBand.length - 1) / (BAND_SRC.length - 1))]; };
  clearLowHair(img, map, headBottom);
  for (const e of L){
    let k = e.k, v = e.v;
    // No band at this rank: the ribbon tails beside the head go, and the band itself becomes hair or skin
    if (k === 3 && st.band && !hadBand){ if (e.x < 44 || e.x > 82) continue; k = e.fk; v = e.fv; if (!k) continue; }
    const x = e.x + dx, y = e.y + SPRITE_PAD + dy;
    if (x < 0 || x >= SPRITE_W || y < 0 || y >= SPRITE_H) continue;
    const q = y * SPRITE_W + x;
    const c = k === 1 ? (v === 9 ? ramp.outline : ramp.fill[v]) : k === 3 ? bandTone(v) : v;
    d[q * 4] = c[0]; d[q * 4 + 1] = c[1]; d[q * 4 + 2] = c[2]; d[q * 4 + 3] = 255;
    map[q] = k === 1 ? 2 : k === 2 ? 1 : 3;
  }
  for (const [q, r, g, b] of tails){ d[q * 4] = r; d[q * 4 + 1] = g; d[q * 4 + 2] = b; d[q * 4 + 3] = 255; map[q] = 3; }
  if (!auraSeen.size) return;
  // Re-grow the aura around the new head shape, fading over three pixels
  const k = [...auraSeen].sort((a, b) => b[1] - a[1])[0][0], ac = [k >> 16 & 255, k >> 8 & 255, k & 255];
  const solid = q => d[q * 4 + 3] === 255;
  for (let y = 0; y <= headBottom - 6; y++) for (let x = 0; x < SPRITE_W; x++){
    const q = y * SPRITE_W + x; if (d[q * 4 + 3]) continue;
    let near = 9;
    for (let oy = -3; oy <= 3 && near > 1; oy++) for (let ox = -3; ox <= 3; ox++){
      const xx = x + ox, yy = y + oy; if (xx < 0 || yy < 0 || xx >= SPRITE_W) continue;
      if (solid(yy * SPRITE_W + xx)) near = Math.min(near, Math.max(Math.abs(ox), Math.abs(oy)));
    }
    if (near > 3) continue;
    d[q * 4] = ac[0]; d[q * 4 + 1] = ac[1]; d[q * 4 + 2] = ac[2]; d[q * 4 + 3] = [0, 150, 85, 40][near]; map[q] = 8;
  }
}

const GENDERS = {
  male:   {label:'Male',   ranks:CHARACTER_RANKS,   styles:HAIR_STYLES,        defStyle:'spiky'},
  // Her hair reaches past the head: side locks beside the face and a ponytail down her right side
  // Her sprites are drawn slim and get more athletic each rank, so they're used as drawn (slim:true would trim the arms)
  female: {label:'Female', ranks:CHARACTER_RANKS_F, styles:FEMALE_HAIR_STYLES, defStyle:'default',
    hairZone:(x, Y) => (Y <= 52 && (x < 50 || x > 76)) || (x >= 82 && Y <= 64)}
};
// The rank's hair ramp, darkest first: the darkest is the outline, the next five shade new hair
function hairRampOf(dec, map){
  const d = dec.frames[0].data.data, seen = new Map();
  map.forEach((t, p) => { if (t === 2){ const k = (d[p * 4] << 16) | (d[p * 4 + 1] << 8) | d[p * 4 + 2]; seen.set(k, (seen.get(k) || 0) + 1); } });
  // The six most-used colors are the hair itself. Ornaments stay out: small ones by count, and colorful ones
  // (her gold hair tie at S-Rank and up) because their hue is far from the hair's main color
  const rgb = k => [k >> 16 & 255, k >> 8 & 255, k & 255], ranked = [...seen].filter(([, n]) => n > 8).sort((a, b) => b[1] - a[1]);
  const h0 = ranked.length ? rgbHsl(...rgb(ranked[0][0])) : [0, 0, 0];
  // ...and ornament shadows that share the hair's hue are far more saturated than the hair's own top colors
  const s0 = Math.max(...ranked.slice(0, 3).map(([k]) => rgbHsl(...rgb(k))[1]), 0) + .3;
  const nearHue = ([h, s]) => s <= s0 && (s < .15 || h0[1] < .15 || Math.min(Math.abs(h - h0[0]), 360 - Math.abs(h - h0[0])) <= 40);
  const cols = ranked.map(([k]) => rgb(k)).filter(c => nearHue(rgbHsl(...c))).slice(0, 6).sort((a, b) => rgbHsl(...a)[2] - rgbHsl(...b)[2]);
  const fill = cols.slice(1); while (fill.length < 5) fill.push(fill[fill.length - 1]);
  return {outline:cols[0], fill:fill.slice(0, 5)};
}

/* ---------- State ---------- */
// Profiles: everyone on this device gets their own save, like save files in a game. A small index lists them,
// and each profile's progress lives under its own key. Profile 1 keeps the original key, so a save from before
// profiles existed simply becomes profile 1: nothing is moved or copied.
const KEY_BASE = 'training-arc-v1', PROFILES_KEY = 'training-arc-profiles', MAX_PROFILES = 8;
const keyFor = id => id === 'p1' ? KEY_BASE : `${KEY_BASE}:${id}`;
function writeProfiles(p){ try { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); } catch(e){} }
function readProfiles(){
  try { const p = JSON.parse(localStorage.getItem(PROFILES_KEY)); if (p && Array.isArray(p.list)) return p; } catch(e){}
  const p = {active:null, list:[]}; let old = null; try { old = localStorage.getItem(KEY_BASE); } catch(e){}
  if (old){ let name = 'Hero'; try { name = (JSON.parse(old).hero || {}).name || 'Hero'; } catch(e){} p.list.push({id:'p1', name, created:Date.now(), played:Date.now()}); p.active = 'p1'; }
  writeProfiles(p); return p;
}
let PROFILES = readProfiles(), KEY = PROFILES.active ? keyFor(PROFILES.active) : null;   // no key until a profile is chosen or made
// Keeps the profile list's name and last-played time current
function touchProfile(){
  const e = PROFILES.list.find(x => x.id === PROFILES.active); if (!e) return;
  const name = (S.hero && S.hero.name) || 'Hero', now = Date.now();
  if (e.name !== name || now - (e.played || 0) > 60000){ e.name = name; e.played = now; writeProfiles(PROFILES); }
}
const DEFAULT = {unit:'lb', maxes:{squat:315, bench:225, deadlift:405, ohp:135, clean:225}, example:true,
  programId:'power-c', pos:{w:0, d:0}, done:{}, amrap:{}, xp:0, prs:0, sets:0, log:[], history:[], stats:{}, swaps:{}, q:{claimed:{}},
  schedule:[1,2,4,5], startedOn:null, hero:null};
const clone = o => JSON.parse(JSON.stringify(o));

// Dates (local time, stored as YYYY-MM-DD)
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m-1, d); };
const todayIso = () => ymd(new Date());
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const SCHED = {1:[3], 2:[1,4], 3:[1,3,5], 4:[1,2,4,5], 5:[1,2,3,4,5], 6:[1,2,3,4,5,6], 7:[0,1,2,3,4,5,6]};

/* ---------- Rewards, streaks, quests, bosses, stats ---------- */
// Something unlocks every 5 levels: titles, outfit, hair and aura colors, and stages for the character card
const REWARDS = [
  [5,'title','Fresh Blood'], [10,'cloth','#f6a6c1','Sakura'], [15,'stage','Dojo'], [20,'title','Iron Novice'], [25,'hair','#f3ead2','Platinum'],
  [30,'cloth','#1d2550','Midnight'], [35,'title','Sweat Equity'], [40,'stage','Rooftop'], [45,'cloth','#ff5a1f','Ember'], [50,'title','Grinder'],
  [55,'hair','#e0242f','Crimson Fire'], [60,'cloth','#6b2fd6','Royal Violet'], [65,'stage','Blossom'], [70,'title','Plate Breaker'], [75,'cloth','#a4e22b','Toxic Lime'],
  [80,'title','Relentless'], [85,'hair','#1fa3c9','Ocean'], [90,'stage','Volcano'], [95,'title','Iron Will'], [100,'title','Centurion'],
  [105,'cloth','#d4a017','Gold Leaf'], [110,'title','Unbreakable'], [115,'hair','#39ff88','Neon Green'], [120,'cloth','#bfe8ff','Arctic'], [125,'title','Vanguard'],
  [130,'stage','Storm'], [135,'title','Titan'], [140,'aura','#ff9ad5','Sakura'], [145,'cloth','#141018','Obsidian'], [150,'title','Living Legend'],
  [155,'hair','#cfd8ff','Starlight'], [160,'stage','Cosmos'], [165,'title','Mythbreaker'], [170,'aura','#7b3fd0','Void'], [175,'cloth','#17c3b2','Prism Teal'],
  [180,'title','Demigod'], [185,'hair','#ffb703','Molten Gold'], [190,'aura','#7df9ff','Plasma'], [195,'title','Sky Splitter'], [200,'stage','Throne'],
  [205,'title','Ascendant'], [210,'cloth','#ff7b00','Sunfire'], [215,'aura','#fff3a8','Solar'], [220,'title','Limitless'], [225,'hair','#2f6bff','Celestial Blue'],
  [230,'title','World Breaker'], [235,'aura','#c2185b','Eclipse'], [240,'cloth','#3a2c10','Black Gold'], [245,'title','Final Form'], [250,'title','Peak of the Arc']
].map(([lv, kind, a, b]) => kind === 'title' || kind === 'stage' ? {lv, kind, name:a} : {lv, kind, color:a, name:b});
const REWARD_KIND = {title:'Title', stage:'Stage', cloth:'Outfit color', hair:'Hair color', aura:'Aura color'};
const rewardLabel = r => r.kind === 'title' ? `Title: "${r.name}"` : `${r.name} ${REWARD_KIND[r.kind].toLowerCase()}`;
const curLevel = () => levelFor(S.xp);
const rewardOpen = r => curLevel() >= r.lv;
const nextReward = () => REWARDS.find(r => r.lv > curLevel());
const rewardsBetween = (a, b) => REWARDS.filter(r => r.lv > levelFor(a) && r.lv <= levelFor(b));
const stageLv = name => (REWARDS.find(r => r.kind === 'stage' && r.name === name) || {lv:0}).lv;
const colorLv = c => (REWARDS.find(r => r.color === c) || {lv:0}).lv;
// The title under your name: a reward title you picked, or your rank's title
const heroTitle = () => { const st = shopItem(shopEq().title); if (st) return st.text; const t = S.hero.title; return t && REWARDS.some(r => r.kind === 'title' && r.name === t && rewardOpen(r)) ? t : rankFor(S.xp).t; };

// Weekly streak: weeks in a row (Monday to Sunday) where you hit your goal of training days. This week
// counts once you reach the goal and can't break the streak until it's over.
const weekStart = iso => { const d = fromYmd(iso); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); };
const weekGoal = () => S.schedule.length || 3;
function weekStreak(){
  const c = {}, goal = weekGoal(); for (const l of S.log) if (l.iso){ const k = weekStart(l.iso); c[k] = (c[k] || 0) + 1; }
  const d = fromYmd(weekStart(todayIso())); let n = (c[ymd(d)] || 0) >= goal ? 1 : 0;
  for (let i = 0; i < 520; i++){ d.setDate(d.getDate() - 7); if ((c[ymd(d)] || 0) >= goal) n++; else break; }
  return n;
}
const streakMult = n => 1 + .05 * Math.min(4, Math.max(0, n - 1));   // 2 weeks ×1.05, up to ×1.2 at 5+

// Quests: three daily, three weekly. Each day brings one workout quest (pays out when you finish the workout
// that completes it) and two check-ins you claim yourself with a tap. Weekly quests reset on Monday.
const CHECK_Q = [
  {id:'mob',     text:'10 minutes of mobility or stretching', xp:25},
  {id:'protein', text:'Hit your protein goal today', xp:25},
  {id:'water',   text:'Drink 8 glasses of water', xp:20},
  {id:'steps',   text:'Walk 7,000 steps', xp:25},
  {id:'sleep',   text:'Sleep 7 hours or more', xp:20},
  {id:'veg',     text:'Eat a fruit or vegetable with every meal', xp:20},
  {id:'foam',    text:'Foam roll or massage sore muscles for 5 minutes', xp:20}
];
const DAILY_Q = [
  {id:'full',  text:'Full clear: finish every set today', xp:60, ok:e => e.full},
  {id:'acc',   text:'Finish every accessory today', xp:40, ok:e => e.acc, when:day => day.ex.some(x => x.acc)},
  {id:'beat',  text:'Beat the rep target on a rep-out set', xp:50, ok:e => e.beat, when:day => day.ex.some(x => x.sets.some(s => s.amrap))},
  {id:'warm',  text:'Log your warm-up and 80% of your sets', xp:40, ok:e => e.warm && e.sets >= .8 * e.total}
];
const WEEKLY_Q = [
  {id:'work',  text:g => `Finish ${g} workouts`, xp:150, goal:() => weekGoal(), val:L => L.length},
  {id:'fulls', text:() => 'Full-clear 2 workouts', xp:120, goal:() => 2, val:L => L.filter(l => l.full).length},
  {id:'sets',  text:g => `Log ${g} sets`, xp:120, goal:() => 18 * weekGoal(), val:L => L.reduce((a, l) => a + l.sets, 0)},
  {id:'accs',  text:() => 'Finish every accessory in 3 workouts', xp:120, goal:() => 3, val:L => L.filter(l => l.acc).length},
  {id:'pr',    text:() => 'Set a new max', xp:150, goal:() => 1, val:(L, wk) => S.history.filter(h => h.src === 'PR' && h.iso && weekStart(h.iso) === wk).length, when:() => prog().needsMax}
];
// Quests also pay Grind: half their XP for workout and weekly quests (rounded to 5), 10 for a check-in
const questGrind = (xp, check) => check ? 10 : Math.max(5, Math.round(xp / 2 / 5) * 5);
const seeded = (key, n) => { let h = 7; for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0; return h % n; };
function ensureQuests(){
  const q = S.q, t = todayIso(), wk = weekStart(t), p = prog(), day = p.weeks[S.pos.w].days[S.pos.d];
  if (q.wk !== wk){
    const pool = WEEKLY_Q.filter(x => !x.when || x.when()).map(x => x.id), ids = [];
    while (ids.length < 3 && pool.length) ids.push(pool.splice(seeded(wk + ids.length, pool.length), 1)[0]);
    Object.assign(q, {wk, weekly:ids});
  }
  if (q.day !== t || !Array.isArray(q.checks)){
    const pool = DAILY_Q.filter(x => !x.when || x.when(day)), cp = CHECK_Q.map(x => x.id), checks = [];
    while (checks.length < 2) checks.push(cp.splice(seeded(t + 'c' + checks.length, cp.length), 1)[0]);
    Object.assign(q, {day:t, daily:pool[seeded(t, pool.length)].id, checks});
  }
  for (const k of Object.keys(q.claimed)) if (!k.startsWith(q.wk + ':') && !k.startsWith(q.day + ':')) delete q.claimed[k];
}
const weekLog = wk => S.log.filter(l => l.iso && weekStart(l.iso) === wk);
function questList(){
  ensureQuests(); const q = S.q, L = weekLog(q.wk), d = DAILY_Q.find(x => x.id === q.daily);
  return [{key:`${q.day}:${d.id}`, daily:true, text:d.text, xp:d.xp, grind:questGrind(d.xp), done:!!q.claimed[`${q.day}:${d.id}`]},
    ...q.checks.map(id => { const c = CHECK_Q.find(x => x.id === id); return {key:`${q.day}:${id}`, daily:true, check:id, text:c.text, xp:c.xp, grind:questGrind(c.xp, true), done:!!q.claimed[`${q.day}:${id}`]}; }),
    ...q.weekly.map(id => { const x = WEEKLY_Q.find(y => y.id === id), g = x.goal(), v = Math.min(g, x.val(L, q.wk));
      return {key:`${q.wk}:${id}`, text:x.text(g), xp:x.xp, grind:questGrind(x.xp), val:v, goal:g, done:!!q.claimed[`${q.wk}:${id}`]}; })];
}
// Pays out every quest this workout (or new max) just completed; returns [[text, xp, grind], ...]
function claimQuests(entry){
  ensureQuests(); const q = S.q, out = [], L = weekLog(q.wk);
  const d = DAILY_Q.find(x => x.id === q.daily), dk = `${q.day}:${d.id}`;
  if (entry && entry.iso === q.day && !q.claimed[dk] && d.ok(entry)){ q.claimed[dk] = 1; out.push([`Daily quest: ${d.text}`, d.xp, questGrind(d.xp)]); }
  for (const id of q.weekly){
    const x = WEEKLY_Q.find(y => y.id === id), k = `${q.wk}:${id}`;
    if (!q.claimed[k] && x.val(L, q.wk) >= x.goal()){ q.claimed[k] = 1; out.push([`Weekly quest: ${x.text(x.goal())}`, x.xp, questGrind(x.xp)]); }
  }
  return out;
}

// Boss fights: the last workout of every arc. Full-clear it to defeat the boss and take the bonus;
// otherwise it waits for a rematch.
const BOSS = {cali:'Gravity Golem', power:'Iron Titan', build:'Mirror Phantom', sprint:'Lightning Wraith', athlete:'Stadium King', fighter:'Shadow Champion', custom:'Shadow Self', home:'Couch Warden',
  glute:'Stairway Siren', sculpt:'Marble Muse', pilates:'Iron Lotus', strong:'Valkyrie Queen', run:'Endless Road', sport:'Arena Empress'};
const isBoss = (p, w, d) => w === p.weeks.length - 1 && d === p.weeks[w].days.length - 1;
// The arc one rank up on the same path (none after S-Rank or for your own arcs)
const nextArcOf = p => { const R = ["E", "D", "C", "B", "A", "S"], i = R.indexOf(p.rank); return p.custom || i < 0 ? null : PROGRAMS.find(x => x.path === p.path && x.rank === R[i + 1]) || null; };
function nextArcHTML(p, cls){
  const nx = nextArcOf(p);
  return `<div class="${cls} next-arc"><p class="eyebrow">${nx ? "Ready for the next arc?" : "Path mastered"}</p>${nx
    ? `<b>${nx.rank}-Rank · ${nx.name}</b><p>${nx.blurb}</p><div class="arc-btns"><button type="button" class="btn btn-power btn-sm" data-act="start" data-id="${nx.id}">Step up to ${nx.rank}-Rank</button><button type="button" class="btn btn-ghost btn-sm" data-act="stayArc">Run ${p.name} again</button></div>`
    : `<b>You cleared ${p.custom ? esc(p.name) : `every rank of ${pathOf(p).name}`}</b><p>Run it again for more XP, or start a new path in the Arcs tab.</p><div class="arc-btns"><button type="button" class="btn btn-power btn-sm" data-act="tab" data-tab="arcs">See arcs</button><button type="button" class="btn btn-ghost btn-sm" data-act="stayArc">Run it again</button></div>`}</div>`;
}
const bossName = p => { const b = arcFoe || (window.TA_BOSSES && arcFoeNow()); return b ? bossTitle(b) : `${p.rank}-Rank ${BOSS[p.path]}`; };   // the next boss in your collection
const bossXp = p => Math.round(250 * XP_MULT[p.rank]);

// Character stats grow with the training you do: each path feeds different stats
const STAT_KEYS = [['str','STR','Strength'], ['spd','SPD','Speed'], ['end','END','Endurance'], ['tec','TEC','Technique']];
const PATH_STATS = {glute:{str:3, end:1}, sculpt:{str:2, end:2}, pilates:{tec:3, end:1}, strong:{str:3, tec:1}, run:{end:3, spd:1}, sport:{spd:2, str:1, end:1}, custom:{str:2, end:1, tec:1}, home:{str:1, end:2, tec:1}, cali:{str:1, end:1, tec:2}, power:{str:3, tec:1}, build:{str:2, end:2}, sprint:{spd:3, end:1}, athlete:{spd:2, str:1, end:1}, fighter:{end:2, spd:1, tec:1}};
// path is a path id, or a custom arc's own stat weights
const statGain = (path, rank, frac) => Object.fromEntries(Object.entries((typeof path === 'object' ? path : PATH_STATS[path]) || {}).map(([k, v]) => [k, Math.round(v * XP_MULT[rank] * frac * 10) / 10]));
// Ratings run 45 to 99 like a sports game: quick gains early, and every point near the top is earned.
// A dedicated main stat reaches about 90 after a few hundred workouts.
const rating = pts => Math.min(99, Math.floor(45 + 55 * (1 - Math.exp(-(pts || 0) / 900))));
// Real numbers count too: STR reads your actual maxes (squat + bench + deadlift against strength standards for
// your hero), and END your real consistency (workouts in the last 4 weeks). Each rating shows whichever is higher,
// what your training has built or what your numbers prove, so a rating never drops.
const realStat = k => {
  if (k === 'str' && !S.example){
    const tot = ((S.maxes.squat || 0) + (S.maxes.bench || 0) + (S.maxes.deadlift || 0)) * (S.unit === 'kg' ? 2.20462 : 1);
    return tot ? Math.min(99, Math.floor(45 + 54 * (1 - Math.exp(-tot / (S.hero.gender === 'female' ? 420 : 700))))) : 0;
  }
  if (k === 'end'){ const since = ymd(new Date(Date.now() - 27 * 864e5)), n = S.log.filter(l => l.iso && l.iso >= since).length;
    return n ? Math.min(99, Math.floor(45 + 54 * (1 - Math.exp(-n / 14)))) : 0; }
  return 0;
};
const statVal = k => Math.max(rating(S.stats[k]), realStat(k));
const statSource = k => realStat(k) > rating(S.stats[k]) ? (k === 'str' ? 'From your maxes' : 'From your last 4 weeks') : 'From your training';
// Past You: this month so far against the same days of last month. Each stat you lead is a win.
function rivalData(){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), day = now.getDate();
  const a1 = ymd(new Date(y, m, 1)), b1 = todayIso(), a0 = ymd(new Date(y, m - 1, 1)), b0 = ymd(new Date(y, m - 1, Math.min(day, new Date(y, m, 0).getDate())));
  const cur = S.log.filter(l => l.iso && l.iso >= a1 && l.iso <= b1), past = S.log.filter(l => l.iso && l.iso >= a0 && l.iso <= b0);
  const sum = (L, f) => L.reduce((t, l) => t + (f(l) || 0), 0), toUnit = l => l.vol ? l.vol * (l.unit && l.unit !== S.unit ? (S.unit === 'kg' ? 1 / 2.20462 : 2.20462) : 1) : 0;
  const prs = (a, b) => S.history.filter(h => h.src === 'PR' && h.iso && h.iso >= a && h.iso <= b).length;
  const rows = [['Workouts', cur.length, past.length], ['Sets', sum(cur, l => l.sets), sum(past, l => l.sets)], ['XP earned', sum(cur, l => l.xp), sum(past, l => l.xp)],
    ['Full clears', cur.filter(l => l.full).length, past.filter(l => l.full).length], ['New maxes', prs(a1, b1), prs(a0, b0)]];
  const v1 = Math.round(sum(cur, toUnit)), v0 = Math.round(sum(past, toUnit)); if (v1 || v0) rows.push([`Weight moved (${S.unit})`, v1, v0]);
  const w = rows.filter(r => r[1] > r[2]).length, l = rows.filter(r => r[1] < r[2]).length;
  const mon = d => d.toLocaleDateString(undefined, {month:'long'});
  return {rows, w, l, any:cur.length + past.length > 0, span:`${mon(now)} 1–${day} vs the same days of ${mon(new Date(y, m - 1, 1))}`};
}
function rivalHTML(){
  const r = rivalData();
  const verdict = !r.any ? 'Log a workout to start the rivalry. Past You is waiting.' : r.w > r.l ? 'You\'re ahead of Past You. Keep it that way.' : r.w === r.l ? 'Dead even. Win the next workout.' : 'Past You is winning this month. Time to catch up.';
  const row = ([label, you, past]) => { const mx = Math.max(you, past, 1);
    return `<div class="rv-row${you > past ? ' win' : you < past ? ' lose' : ''}"><span class="rv-l">${label}</span>
      <span class="rv-v num">${fmt(you)}</span><div class="rv-bars" aria-hidden="true"><i class="you" style="width:${you / mx * 100}%"></i><i class="past" style="width:${past / mx * 100}%"></i></div><span class="rv-v past num">${fmt(past)}</span></div>`; };
  return `<section class="panel rival"><div class="row-between"><h3>You vs Past You</h3><span class="rv-score num" aria-label="${r.w} wins, ${r.l} losses">${r.w}–${r.l}</span></div>
    <p class="fine">${r.span}</p>
    <div class="rv-head" aria-hidden="true"><span></span><span>You</span><span></span><span>Past</span></div>
    <div role="table" aria-label="This month against last month">${r.rows.map(row).join('')}</div>
    <p class="rv-verdict">${verdict}</p></section>`;
}
// The stat chart: a diamond with STR up top, SPD right, END below, TEC left
function radarSVG(vals){
  const c = 90, R = 74, pt = (i, f) => { const a = -Math.PI / 2 + i * Math.PI / 2; return [c + Math.cos(a) * R * f, c + Math.sin(a) * R * f]; };
  const f = v => .18 + .82 * (v - 45) / 54, poly = fs => fs.map((x, i) => pt(i, x).map(n => n.toFixed(1)).join(',')).join(' ');
  const grid = [.25, .5, .75, 1].map(g => `<polygon points="${poly([g, g, g, g])}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join('');
  const axes = [0, 1, 2, 3].map(i => { const [x, y] = pt(i, 1); return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="var(--line)"/>`; }).join('');
  const labels = STAT_KEYS.map(([k, ab], i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${STAT_COLOR[k]}" font-size="12" font-weight="700" font-family="var(--label)">${ab}</text>`; }).join('');
  const dots = vals.map((v, i) => { const [x, y] = pt(i, f(v)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${STAT_COLOR[STAT_KEYS[i][0]]}"/>`; }).join('');
  return `<svg class="radar" viewBox="-12 -12 204 204" role="img" aria-label="Stat chart: ${STAT_KEYS.map(([, , n], i) => `${n} ${vals[i]}`).join(', ')}">${grid}${axes}
    <polygon points="${poly(vals.map(f))}" fill="color-mix(in srgb, var(--power) 28%, transparent)" stroke="var(--power)" stroke-width="2" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}
// OVR is weighted by your path, the way a position weights its ratings
const POS = {custom:'CUS', home:'HOM', cali:'CAL', power:'PWR', build:'BLD', sprint:'SPR', athlete:'ATH', fighter:'FGT', glute:'GLT', sculpt:'SCL', pilates:'PIL', strong:'STG', run:'RUN', sport:'ATH'};
const ovr = path => { const w = PATH_STATS[path] || {}, t = Object.values(w).reduce((a, b) => a + b, 0); return Math.round(Object.entries(w).reduce((a, [k, v]) => a + v * statVal(k), 0) / t); };
const tierColor = v => v >= 90 ? '#ffd23f' : v >= 80 ? '#3ddc97' : v >= 70 ? '#4cc3ff' : '#a197b8';

/* ---------- Grind and Glory: the app's two currencies ---------- */
// Grind is what every workout pays: a round forged-iron token with a red-hot dumbbell.
// Glory is what big wins pay (first boss wins, rank-ups, finished arcs): a gold hexagon crest with a star.
// Both are drawn here as 32x32 pixel tokens, lit from the upper left, and replace the shop's coin and gem.
const CUR = {c: 'Grind', g: 'Glory'};
function tokenArt(kind){
  const N = 32, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(N, N), d = img.data, cx = 15.5, cy = 15.5, R = 15.2;
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const put = (x, y, h) => { if (x < 0 || y < 0 || x >= N || y >= N) return; const i = (y * N + x) * 4, c = rgb(h); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; };
  const glory = kind === 'glory';
  // distance from the center in the token's own shape: a circle, or a hexagon standing on a point
  const dist = (dx, dy) => glory ? Math.max(Math.abs(dx), Math.abs(dx) * .5 + Math.abs(dy) * .866) / .866 * .93 : Math.hypot(dx, dy);
  const P = glory
    ? {line: '#4a2a08', rimD: '#9a6410', rimM: '#e0a62a', rimL: '#fff2a8', groove: '#6a3e0a', faceD: '#2e1660', face: '#4a2a8a', faceL: '#6a44b8'}
    : {line: '#16141c', rimD: '#3c3c4c', rimM: '#7c8094', rimL: '#c8ccd8', groove: '#24222c', faceD: '#1c1a24', face: '#2c2a38', faceL: '#3e3c4e'};
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - cx, dy = y - cy, r = dist(dx, dy); if (r > R) continue;
    const lit = (-dx * .6 - dy * .8) / R;   // +1 upper left, -1 lower right
    if (r > R - 1.1) put(x, y, P.line);
    else if (r > R - 3.6) put(x, y, lit > .3 ? P.rimL : lit < -.3 ? P.rimD : P.rimM);
    else if (r > R - 4.6) put(x, y, P.groove);
    else put(x, y, lit > .45 ? P.faceL : lit < -.35 ? P.faceD : P.face);
  }
  if (glory) {
    // a five-point gold star, lighter on its upper-left facets, with a white sparkle
    const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 3.3 : 7.8; pts.push([cx + Math.cos(a) * rr, cy + .6 + Math.sin(a) * rr]); }
    const inPoly = (x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inPoly(x + .5, y + .5)) {
      const edge = !inPoly(x + 1.5, y + .5) || !inPoly(x + .5, y + 1.5);
      put(x, y, edge ? '#9a6410' : (x + .5 < cx && y + .5 < cy + 1.5) ? '#fff2a8' : (x + .5 > cx + .5 && y + .5 > cy) ? '#e0a020' : '#ffd34a');
    }
    for (const [x, y] of [[23, 7], [22, 7], [24, 7], [23, 6], [23, 8]]) put(x, y, x === 23 && y === 7 ? '#ffffff' : '#d8c8ff');
  } else {
    // a red-hot dumbbell: bar, two plates a side, highlight on top, shadow below
    const O = '#ff8a2a', L = '#ffd08a', D = '#b8441a';
    for (let x = 11; x <= 20; x++) { put(x, 15, L); put(x, 16, O); put(x, 17, D); }
    for (const [x0, x1] of [[7, 9], [22, 24]]) for (let x = x0; x <= x1; x++) for (let y = 10; y <= 21; y++) put(x, y, y === 10 ? L : y === 21 ? D : x === x0 ? L : O);
    for (const x of [6, 25]) for (let y = 12; y <= 19; y++) put(x, y, y === 12 ? L : y === 19 ? D : O);
    put(8, 11, '#ffffff'); put(23, 11, '#fff3d0');
    for (const [x, y] of [[13, 11], [18, 20], [12, 21]]) put(x, y, '#ffb050');   // embers
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL();
}

/* ---------- Install the app (the built app only) ---------- */
// Android and desktop Chrome offer a real install button; iPhone installs from Safari's Share menu.
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (settingsOpen()) renderSettings(); });
addEventListener('appinstalled', () => { installEvt = null; toast('Training Arc is on your home screen.'); if (settingsOpen()) renderSettings(); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installHTML(){
  if (!window.TA_APP || isStandalone()) return '';
  const row = installEvt
    ? `<button type="button" class="st-row st-link" data-act="installApp"><div><b>Install Training Arc</b><span>Adds it to your home screen. It opens full screen and works offline.</span></div><span aria-hidden="true">›</span></button>`
    : `<div class="st-row st-col"><div><b>Add to your home screen</b><span>${isIOS() ? 'In Safari, tap the Share button, then "Add to Home Screen".' : 'Open your browser menu and choose "Install app" or "Add to Home screen".'} It opens full screen and works offline.</span></div></div>`;
  return `<h4 class="st-h">App</h4><div class="st-group">${row}</div>`;
}

/* ---------- Testing: a maxed-out profile ---------- */
// One switch for every testing tool: set to false (or build with -Release) before shipping
const SHOW_TEST_TOOLS = !window.TA_RELEASE;
// Builds a new profile that looks like two years of training: max level and SSS-Rank, every boss beaten,
// every shop item and boss drop owned, all gear and achievements unlocked, a full calendar and history,
// and plenty of Grind and Glory. It's a separate profile, so real progress is never touched.
// Remove the Settings › Testing button before shipping.
function makeMaxedProfile(){
  if (PROFILES.list.length >= MAX_PROFILES){ toast(`This device already has ${MAX_PROFILES} profiles. Delete one first.`); return; }
  let n = 1; const taken = id => PROFILES.list.some(p => p.id === id) || (() => { try { return !!localStorage.getItem(keyFor(id)); } catch(e){ return false; } })();
  while (taken('p' + n)) n++;
  const id = 'p' + n, g = S.hero.gender;
  PROFILES.list.push({id, name:'Max Test', created:Date.now(), played:Date.now()});
  useProfile(id, true);   // a fresh save in the new slot (it opens setup, which we skip below)
  ob = null; document.getElementById('welcome').hidden = true; behind().forEach(x => x.inert = false);
  maxOut(g);
  render(); renderHeader(); paintHeroes();
  toast('Max Test profile ready: everything unlocked. Switch back any time in Settings › Profile.');
}
function maxOut(g){
  const day = 864e5, now = Date.now(), iso = t => ymd(new Date(t)), label = t => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'});
  S.onboarded = true; S.example = false; S.unit = 'lb';
  S.hero.gender = g; S.hero.name = 'Max Test';
  S.startedOn = iso(now - 730 * day);
  // maxes, with a history of PRs climbing over two years
  const top = {squat:765, bench:495, deadlift:855, ohp:365, clean:405}, start = {squat:225, bench:155, deadlift:275, ohp:95, clean:135};   // the top medal on every lift
  S.maxes = {...top}; S.history = [];
  for (const lift of Object.keys(top)) for (let i = 0; i <= 10; i++){
    const t = now - (720 - i * 72) * day, val = Math.round((start[lift] + (top[lift] - start[lift]) * i / 10) / 5) * 5, prev = Math.round((start[lift] + (top[lift] - start[lift]) * (i - 1) / 10) / 5) * 5;
    S.history.unshift({date:label(t), iso:iso(t), lift, val, unit:'lb', src:i ? 'PR' : 'Start', delta:i ? val - prev : 0});
  }
  S.history.sort((a, b) => b.iso.localeCompare(a.iso));
  // two years of workouts on the schedule, climbing the ranks of her or his paths
  const paths = PATHS.filter(x => x.g === g || x.g === 'both').map(x => x.id).filter(pid => PROGRAMS.some(p => p.path === pid));
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S'], sched = S.schedule.length ? S.schedule : [1, 2, 4, 5], log = [];
  let sets = 0;
  for (let k = 728; k >= 1; k--){
    const t = now - k * day, d = new Date(t); if (!sched.includes(d.getDay())) continue;
    const r = ranks[Math.min(5, Math.floor((728 - k) / 122))], path = paths[Math.floor((728 - k) / 61) % paths.length] || 'power';
    const p = PROGRAMS.find(x => x.path === path && x.rank === r) || PROGRAMS.find(x => x.path === path) || PROGRAMS[0];
    const wkI = Math.floor(((728 - k) % 28) / 7), days = p.weeks[wkI % p.weeks.length].days, dy = days[d.getDay() % days.length];
    const total = dy.ex.reduce((a, e) => a + e.sets.length, 0); sets += total;
    log.push({date:label(t), iso:iso(t), prog:p.name, path:p.path, rank:p.rank, day:dy.name, week:wkI + 1, sets:total, total, full:true, acc:true, beat:k % 3 === 0, warm:true,
      vol:p.needsMax ? Math.round(total * 8 * 185) : undefined, unit:p.needsMax ? 'lb' : undefined, xp:Math.round(xpFor(total, p, total) * 1.2), _arc:Math.floor((728 - k) / 28)});
  }
  log.forEach((l, i) => { if (!log[i + 1] || log[i + 1]._arc !== l._arc) l.boss = true; delete l._arc; });   // each arc ends on its boss
  S.log = log.reverse().slice(0, 1000);
  S.sets = sets; S.prs = 50; S.arcs = 36;
  S.xp = LEVEL_XP[MAX_LEVEL] + 25000;                                    // Lv 250, SSS-Rank
  S.stats = {str:5000, spd:5000, end:5000, tec:5000};                    // 99 across the board
  S.beaten = bossList().map(b => b.id);                                   // every boss down
  for (const a of ACCESSORIES) S.items[a.id] = iso(now - 30 * day);        // all gear
  checkAch(); checkItems();                                                // medals and backdrops from the maxes
  // the shop: every item and boss drop, every boss set complete, and a full wallet
  const D = TA_SHOP_DATA, wins = {}, sets2 = {};
  for (const b of Object.keys(D.drops || {})){ wins[b] = 5; sets2[b] = true; }
  S.shop = {coins:99999, gems:9999, owned:Object.keys(D.items), equipped:{}, bossWins:wins, bossSets:sets2, workouts:log.length, nightWorkouts:[]};
  TA_SHOP.bind();
  save();
}

/* ---------- Item shop ---------- */
// One shop a day (five rotate), plus the Night Market from 11 PM to 6 AM for anyone who trains after dark.
// The wallet lives in each profile's save, so coins, gems and items follow the profile and its backups.
// Coins come from every workout; gems are rare and only come from milestones (first boss wins, rank-ups,
// finished arcs), so the top items take real training. Nothing costs real money.
window.TA_SHOP_STORE = {get:() => { try { return S.shop || null; } catch(e){ return null; } }, set:v => { S.shop = v; save(); }};
function shopItem(id){ return id && window.TA_SHOP_DATA ? TA_SHOP_DATA.items[id] || null : null; }
function shopEq(){ return window.TA_SHOP ? TA_SHOP.equipped() : {}; }
// Shop gear goes on over your own colors: an outfit sets the shirt and pants, then hair dye, shoes and cape
function shopLook(base, w, aura){
  const look = Object.assign({}, base);
  if (w.outfit){ look.top = w.outfit.shirt; look.bottom = w.outfit.pants; }
  if (w.hair) look.hair = w.hair;
  if (w.shoes) look.shoes = w.shoes.shoe;
  if (w.cape) look.cape = w.cape;
  if (aura) look.aura = aura;
  return look;
}
function wornLook(g){ return window.TA_SHOP ? shopLook(S.hero[g].look, TA_SHOP.look(), (shopItem(shopEq().aura) || {}).color) : S.hero[g].look; }
const shopGlow = () => { const a = shopItem(shopEq().aura); return a ? ` style="filter:drop-shadow(0 0 2px ${a.color}) drop-shadow(0 0 7px ${a.color})"` : ''; };
const shopPet = () => { const p = shopItem(shopEq().pet); return p ? `<img class="shop-pet" src="${p.icon}" alt="">` : ''; };
const shopSlash = () => (shopItem(shopEq().fx) || {}).color;
// Perks: the pet you have out adds a little Grind to every workout, the aura you wear a little XP.
// Rarer means a bigger perk, and with one of each the most you can get is +5% Grind and +4% XP.
const PET_PCT = {C:2, R:3, E:4, L:5}, AURA_PCT = {C:1, R:2, E:3, L:4};
function perkOf(it){
  if (!it) return null;
  if (it.type === 'pet'){ const pct = PET_PCT[it.r] || 2; return {kind:'grind', pct, text:`+${pct}% Grind`}; }
  if (it.type === 'aura'){ const pct = AURA_PCT[it.r] || 1; return {kind:'xp', pct, text:`+${pct}% XP`}; }
  return null;
}
const petPerk = () => perkOf(shopItem(shopEq().pet)), auraPerk = () => perkOf(shopItem(shopEq().aura));
// Your own hero in the shop's try-on, wearing what you preview
function shopHero(cv){
  const g = S.hero.gender, h = S.hero[g], k = rankFor(S.xp).k, ctx = cv.getContext('2d');
  let alive = true, frames = null, i = 0, next = 0, ver = 0, raf = 0;
  cv.width = SPRITE_W; cv.height = SPRITE_H;
  const draw = now => {
    if (!alive) return;
    if (frames && now >= next){ const f = frames[i]; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(f.bmp, 0, 0);
      if (reduceMotion) next = Infinity; else { next = now + f.delay; i = (i + 1) % frames.length; } }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return {
    setLook(w){ const v = ++ver; spriteFrames(g, k, shopLook(h.look, w || {}), h.style, h.acc).then(fr => { if (v === ver && alive){ frames = fr; i = 0; next = 0; } }); },
    destroy(){ alive = false; cancelAnimationFrame(raf); }
  };
}
// The banner that sold bundles now points back at training
const SHOP_BANNER = {id:'train', title:'TRAIN TO EARN', sub:'Workouts pay Grind · big wins pay Glory', price:'TODAY ›', sticker:'NO REAL MONEY'};
let shopUi = null;
function openShop(){
  if (!window.openItemShop) return;
  const el = document.getElementById('shopOv'); el.hidden = false;
  document.documentElement.classList.add('ts-lock'); behind().forEach(x => x.inert = true);
  shopUi = openItemShop(document.getElementById('shopIn'), {hero:shopHero, banner:SHOP_BANNER,
    gemHint:'Glory: beat a boss for the first time, rank up, or finish an arc.',
    coinHint:'Every workout pays Grind. Full clears, new maxes and boss days pay more.',
    onClose:closeShop, onBundle:closeShop, onChange:paintHeroes});
  el.querySelector('.tsh-back')?.focus({preventScroll:true});
}
function closeShop(){
  if (shopUi){ shopUi.destroy(); shopUi = null; }
  document.getElementById('shopOv').hidden = true; document.documentElement.classList.remove('ts-lock');
  if (!document.querySelector('.overlay:not([hidden])')) behind().forEach(x => x.inert = false);
  render(); paintHeroes();
}
// Your coins on the hero card (Today's banner and the header on the other tabs): tap to open the shop
function coinBadgeHTML(cls){
  if (!window.TA_SHOP) return '';
  const st = TA_SHOP.state(), night = TA_SHOP.nightMarketOpen();
  return `<button type="button" class="coin-badge ${cls}${night ? ' night' : ''}" data-act="shop" aria-label="Shop: ${fmt(st.coins)} Grind, ${fmt(st.gems)} Glory${night ? '. The Night Market is open' : ''}">${walletHTML(st)}</button>`;
}
// Both tokens with their counts, for the badge
const walletHTML = st => `<img src="${TA_SHOP_DATA.coinIcon}" alt=""><span class="num">${fmt(st.coins)}</span><img src="${TA_SHOP_DATA.gemIcon}" alt="" class="cb-glory"><span class="num">${fmt(st.gems)}</span><span class="cb-go" aria-hidden="true">›</span>`;
function paintCoins(){
  const b = document.getElementById('coinBadge'); if (!b || !window.TA_SHOP) return;
  const st = TA_SHOP.state(), night = TA_SHOP.nightMarketOpen();
  b.hidden = false; b.classList.toggle('night', night);
  b.innerHTML = walletHTML(st);
  b.setAttribute('aria-label', `Shop: ${fmt(st.coins)} Grind, ${fmt(st.gems)} Glory${night ? '. The Night Market is open' : ''}`);
}
// What a workout pays. Coins scale with the arc's rank like XP does; a typical E-Rank workout pays about 65.
const COIN_SET = 3, COIN_FULL = 20, COIN_PR = 25, COIN_BOSS = 100, GEM_RANK = 50, GEM_ARC = 20, GEM_BOSS = 25;
let shopExtra = [];   // gem bonuses from a boss fight that finishes the day's workout
function shopPay({n, total, rank, prs = 0, bossDay = false, arcDone = false, oldXp, quests = 0}){
  const m = XP_MULT[rank] || 1, coins = [[`${n} ${n === 1 ? 'set' : 'sets'}`, Math.round(n * COIN_SET * m)]], gems = [...shopExtra];
  shopExtra = [];
  if (total && n >= total) coins.push(['Full clear', Math.round(COIN_FULL * m)]);
  if (prs) coins.push([prs > 1 ? `${prs} new maxes` : 'New max', prs * COIN_PR]);
  if (bossDay) coins.push(['Boss defeated', COIN_BOSS]);
  if (quests) coins.push(['Quests', quests]);
  if (arcDone) gems.push(['Arc complete', GEM_ARC]);
  if (rankFor(oldXp).k !== rankFor(S.xp).k) gems.push([`Reached ${rankFor(S.xp).k}-Rank`, GEM_RANK]);
  const pp = petPerk(), sub = coins.reduce((a, x) => a + x[1], 0);
  if (pp && sub) coins.push([`Pet: ${shopItem(shopEq().pet).name} (+${pp.pct}%)`, Math.max(1, Math.round(sub * pp.pct / 100))]);
  const c = coins.reduce((a, x) => a + x[1], 0), g = gems.reduce((a, x) => a + x[1], 0);
  if (window.TA_SHOP){ TA_SHOP.addCoins(c); if (g) TA_SHOP.addGems(g); TA_SHOP.logWorkout(); }
  return {coins:c, gems:g, coinParts:coins, gemParts:gems, night:window.TA_SHOP ? TA_SHOP.nightMarketOpen() : false};
}
function payHTML(pay){
  if (!pay || !window.TA_SHOP_DATA) return '';
  const D = TA_SHOP_DATA;
  return `<div class="wk-panel wk-gains wk-pay"><p class="wk-gains-h">Grind &amp; Glory</p>
    <p class="pay-big num"><img src="${D.coinIcon}" alt="">+${fmt(pay.coins)} Grind${pay.gems ? `<img src="${D.gemIcon}" alt="">+${fmt(pay.gems)} Glory` : ''}</p>
    ${[...pay.coinParts.map(([l, v]) => [l, `+${fmt(v)} Grind`]), ...pay.gemParts.map(([l, v]) => [l, `+${fmt(v)} Glory`])].map(([l, v]) => `<p>${l} <b>${v}</b></p>`).join('')}
    <p class="wk-gains-f">${pay.night ? 'You trained after dark: the Night Market is open.' : 'Spend it in the Shop tab.'}</p></div>`;
}
// Item art comes from the item packs; the app only adds its Grind and Glory tokens once the catalog loads
function applyPetArt(){
  if (!window.TA_SHOP) return;
  TA_SHOP.todayShop();   // merges the item packs into the catalog
  TA_SHOP_DATA.coinIcon = tokenArt('grind'); TA_SHOP_DATA.gemIcon = tokenArt('glory');   // Grind and Glory tokens
  for (const it of Object.values(TA_SHOP_DATA.items)){ const pk = perkOf(it); if (pk && !it.perk){ it.perk = pk.text; it.desc = `${it.desc} Perk: ${pk.text} from workouts.`; } }   // pets and auras say what they do
}
/* ---------- Your shop items, in the character editor ---------- */
// Everything you've bought, by slot, right where you edit your character. Tap an item to put it on or take
// it off (one per slot); the editor's preview wears it, with the aura glow and your pet beside you.
const INV_SLOTS = [['all', 'All'], ['outfit', 'Outfits'], ['hair', 'Hair dye'], ['shoes', 'Shoes'], ['cape', 'Capes'], ['aura', 'Auras'], ['pet', 'Pets'], ['fx', 'Battle FX'], ['title', 'Titles']];
const INV_ORDER = INV_SLOTS.slice(1).map(s => s[0]), INV_RARITY = {L:0, E:1, R:2, C:3};
const invWord = t => t === 'pet' ? 'Following' : t === 'outfit' || t === 'hair' || t === 'shoes' || t === 'cape' ? 'Wearing' : 'On';
let invTab = 'all', invSel = null, heSec = 'style';   // heSec: the character editor's open section
function invEditorHTML(){
  if (!window.TA_SHOP) return '';
  const D = TA_SHOP_DATA, st = TA_SHOP.state(), eq = st.equipped, item = id => D.items[id];
  const owned = [...new Set(st.owned)].filter(id => item(id));
  if (!owned.length) return `<div class="he-group"><h4>Shop items</h4>
    <p class="fine">Nothing yet. Outfits, hair dyes, pets, auras and more that you buy in the shop show up here, ready to wear. Workouts pay Grind.</p>
    <div><button type="button" class="btn btn-ghost btn-sm" data-act="invShop">Open the shop</button></div></div>`;
  if (invTab !== 'all' && !owned.some(id => item(id).type === invTab)) invTab = 'all';
  const n = t => owned.filter(id => item(id).type === t).length;
  const list = owned.filter(id => invTab === 'all' || item(id).type === invTab)
    .sort((a, b) => INV_ORDER.indexOf(item(a).type) - INV_ORDER.indexOf(item(b).type) || INV_RARITY[item(a).r] - INV_RARITY[item(b).r] || item(a).name.localeCompare(item(b).name));
  const sel = invSel && item(invSel);
  const tile = id => { const it = item(id), on = eq[it.type] === id;
    return `<button type="button" class="inv-item${on ? ' on' : ''}" data-act="invItem" data-id="${id}" aria-pressed="${on}" style="--rc:${D.rarity[it.r]}">
      <img src="${it.icon}" alt=""><b>${esc(it.name)}</b><span class="inv-r" style="color:${D.rarity[it.r]}">${D.rarityName[it.r]}</span>${(pk => pk ? `<span class="inv-perk">${pk.text}</span>` : '')(perkOf(it))}${on ? `<span class="inv-on">${invWord(it.type)}</span>` : ''}</button>`; };
  return `<div class="he-group inv-group"><h4>Shop &amp; boss items <span class="he-note">bought with Grind or Glory, or dropped by bosses · ${owned.length} owned · tap to put on or take off</span></h4>
    <div class="opt-chips inv-tabs" role="group" aria-label="Show">${INV_SLOTS.filter(([k]) => k === 'all' || n(k)).map(([k, l]) =>
      `<button type="button" class="opt" data-act="invTab" data-v="${k}" aria-pressed="${invTab === k}">${l} <span class="num">${k === 'all' ? owned.length : n(k)}</span></button>`).join('')}</div>
    <div class="inv-grid">${list.map(tile).join('')}</div>
    <p class="fine inv-info" aria-live="polite">${sel ? `<b>${esc(sel.name)}</b>: ${esc(sel.desc || '')}` : 'One item per slot. Your own colors come back when you take shop gear off.'}</p></div>`;
}
// The editor preview wears your aura and has your pet beside you
function paintEditorExtras(){
  const st = document.querySelector('.he-stage'), img = document.getElementById('heImg'); if (!st || !img) return;
  const a = shopItem(shopEq().aura), p = shopItem(shopEq().pet);
  img.style.filter = a ? `drop-shadow(0 0 2px ${a.color}) drop-shadow(0 0 7px ${a.color})` : '';
  let pe = st.querySelector('.he-pet');
  if (p){ if (!pe){ pe = document.createElement('img'); pe.className = 'he-pet'; pe.alt = ''; st.appendChild(pe); } pe.src = p.icon; } else if (pe) pe.remove();
}
function invToggle(id){
  const it = TA_SHOP_DATA.items[id]; if (!it) return;
  const on = TA_SHOP.equip(id); invSel = id;
  renderHeroEditor(); paintHeroes(); buzz(10);
  toast(on ? `${it.name} on` : `${it.name} off`);
}
let S = normalize(load());
applyPetArt();
if (window.TA_SHOP){ TA_SHOP.bind(); TA_SHOP.onChange(() => paintCoins()); }
function load(){
  // A save from before the welcome flow existed belongs to someone already training: they never see it
  try { const r = KEY && localStorage.getItem(KEY); if (r){ const o = JSON.parse(r); if (o.onboarded === undefined) o.onboarded = true; return Object.assign(clone(DEFAULT), o); } } catch(e){}
  return Object.assign(clone(DEFAULT), {onboarded:false});   // brand new: saved as false, so a reload mid-welcome shows it again
}
function normalize(s){
  if (!s.startedOn) s.startedOn = todayIso();
  // Boss gates are fought in order and only count once beaten; ranks no longer wait on them (XP banked behind a gate is paid out)
  if (!s.shop || typeof s.shop !== 'object' || typeof s.shop.coins !== 'number' || !Array.isArray(s.shop.owned)) s.shop = null;   // the wallet; new ones get the welcome gift
  if (!Array.isArray(s.beaten)){ const ids = {F:'couch_golem', E:'iron_slime', D:'barbell_knight', C:'storm_sprinter', B:'plateau_titan', A:'shadow_self', S:'gravity_dragon', SS:'final_rep_god'};
    s.beaten = [...new Set((s.log || []).filter(l => l.gate).map(l => ids[l.gate]).filter(Boolean))]; }
  if (s.bank){ s.xp = (s.xp || 0) + s.bank; s.bank = 0; } delete s.gates;
  if (!Array.isArray(s.schedHist) || !s.schedHist.length) s.schedHist = [{from:s.startedOn, days:clone(s.schedule || [])}];
  for (const k of ['dayMoves', 'dayPins']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};   // days moved by hand on the Calendar
  if (!s.arcSaves || typeof s.arcSaves !== 'object' || Array.isArray(s.arcSaves)) s.arcSaves = {};   // each arc's saved place
  // Saves from before levels used flat XP thresholds per rank. Nobody drops a rank in the switch:
  // if the new curve would put you below the rank you'd reached, you start at the bottom of it.
  if (!s.levelsV){
    const OLD = [0, 150, 300, 900, 2000, 4000, 7500, 12000, 20000];
    let had = 0; OLD.forEach((t, i) => { if ((s.xp || 0) >= t) had = i; });
    if (had > 0 && (s.xp || 0) < RANKS[had].xp) s.xp = RANKS[had].xp;
    s.levelsV = 6;
  }
  // Earlier level curves. Nobody drops a level: the XP you earned stays, so on an easier curve it can carry you up.
  const OLD_COST = {1:L => 30 + Math.floor(L * 9 / 2), 2:L => Math.round((150 + 2.5 * L + .02 * L * L) / 5) * 5,
    3:L => Math.round((195 + 3.25 * L + .026 * L * L) / 5) * 5, 4:L => Math.round(1.25 * (195 + 3.25 * L + .026 * L * L) / 5) * 5,
    5:L => Math.round(.845 * (195 + 3.25 * L + .026 * L * L) / 5) * 5};
  if (OLD_COST[s.levelsV]){
    const cost = OLD_COST[s.levelsV]; let L = 1, need = 0;
    while (L < MAX_LEVEL && (s.xp || 0) >= need + cost(L)){ need += cost(L); L++; }
    if ((s.xp || 0) < LEVEL_XP[L]) s.xp = LEVEL_XP[L];
    s.levelsV = 6;
  }
  // Days gained a warm-up and accessories, so exercise positions moved. Sets logged on an unfinished
  // day would land on the wrong exercise; start those days fresh. Finished workouts and XP are untouched.
  if (!s.fullDaysV){ s.done = {}; s.amrap = {}; s.setLog = {}; s.fullDaysV = 1; }
  // Swapped exercises, quest progress, and stats
  for (const k of ['swaps', 'stats', 'items', 'ach', 'exLog', 'ramp', 'tmAdd']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};   // items: unlocked gear, ach: strength achievements; exLog: each exercise's recent sessions; ramp: warm-up progress; tmAdd: working-weight boosts
  if (typeof s.arcs !== 'number') s.arcs = 0;   // arcs finished, for the Hero scarf
  // Settings, with defaults for anything not set yet
  s.prefs = Object.assign({vibrate:true, restAuto:true, restScale:1, ramp:true, quotes:true, title:"shuffle", allArcs:false, sound:true}, s.prefs && typeof s.prefs === 'object' ? s.prefs : {});
  // The power clean joined the maxes later: start older saves at 55% of their deadlift, marked as an estimate
  if (!s.maxEst || typeof s.maxEst !== 'object') s.maxEst = {};
  if (!(s.maxes.clean > 0)){ const step = s.unit === 'kg' ? 2.5 : 5; s.maxes.clean = Math.round((s.maxes.deadlift || 0) * .55 / step) * step || DEFAULT.maxes.clean; if (!s.example) s.maxEst.clean = true; }
  if (!s.q || typeof s.q !== 'object') s.q = {};
  if (!s.q.claimed) s.q.claimed = {};
  // Stats started with this update: credit the workouts already in your log
  if (!s.statsV){
    for (const l of s.log || []){ const p = PROGRAMS.find(x => x.name === l.prog); if (!p) continue;
      for (const [k, v] of Object.entries(statGain(p.path, p.rank, 1))) s.stats[k] = (s.stats[k] || 0) + v; }
    s.statsV = 1;
  }
  // Older saves carried pixel-art options as numbers; keep the name and any valid recolors
  // Each character keeps its own look; saves from before the female character hold the male look at the top level
  const h = s.hero || {}, HEX = /^#[0-9a-f]{6}$/i;
  const profile = (src, g) => {
    src = src || {}; const look = {}, G = GENDERS[g];
    for (const p of LOOK_PARTS) if (src.look && HEX.test(src.look[p.k])) look[p.k] = src.look[p.k];
    // Styles that were replaced: Slick Back carries over; any other retired style goes back to the default
    const s0 = src.style === 'slick' ? 'm-slick' : src.style, style = OLD_STYLES[s0] || s0;
    // Gear: one item per slot, only items that belong in that slot
    const acc = {}; for (const [slot, id] of Object.entries(src.acc || {})){ const a = accById(id); if (a && a.slot === slot) acc[slot] = id; }
    // Backdrops you put up (up to three); a save from when one was the limit carries its one over
    const flairs = (Array.isArray(src.flairs) ? src.flairs : src.flair ? [src.flair] : []).filter(x => typeof x === 'string').slice(0, 3);
    return {look, stage:STAGES[src.stage] ? src.stage : 0, style:G.styles.some(x => x.id === style) ? style : G.defStyle, acc, flairs};
  };
  s.hero = {name:h.name || 'Hero', title:typeof h.title === 'string' ? h.title : '', gender:h.gender === 'female' && GENDERS.female.ranks ? 'female' : 'male',
    male:profile(h.male || h, 'male'), female:profile(h.female, 'female')};
  if (!Array.isArray(s.schedule)) s.schedule = clone(DEFAULT.schedule);
  // What the workout screen logged per set ({w, r}), and the last weight used on pick-your-weight lifts
  for (const k of ['setLog', 'lastPick']) if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};
  // The workout screen's style for the workout in progress ({day, id}), and the last one used
  if (!s.wkTheme || typeof s.wkTheme !== 'object') s.wkTheme = null;
  const OLD = {strength:'power-c', limitbreak:'power-a', foundation:'cali-e'};
  if (OLD[s.programId]){
    const old = s.programId; s.programId = OLD[old];
    for (const k of Object.keys(s.done)) if (k.startsWith(old + '|')){ s.done[s.programId + k.slice(old.length)] = s.done[k]; delete s.done[k]; }
    for (const k of Object.keys(s.amrap)) if (k.startsWith(old + '|')){ s.amrap[s.programId + k.slice(old.length)] = s.amrap[k]; delete s.amrap[k]; }
  }
  if (!Array.isArray(s.customArcs)) s.customArcs = [];   // arcs you built
  if (!PROGRAMS.some(p => p.id === s.programId) && !s.customArcs.some(a => a.id === s.programId)) s.programId = DEFAULT.programId;
  const yr = new Date().getFullYear();
  for (const l of s.log) if (!l.iso){ const d = new Date(`${l.date} ${yr}`); if (!isNaN(d)) l.iso = ymd(d); }
  for (const h of s.history) if (!h.iso){ const d = new Date(`${h.date} ${yr}`); if (!isNaN(d)) h.iso = ymd(d > new Date() ? new Date(`${h.date} ${yr - 1}`) : d); }
  return s;
}
function save(){ if (!KEY) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} touchProfile(); }   // saves the profile in use

/* ---------- Math ---------- */
const inc = () => S.unit === 'lb' ? 5 : 2.5;
const barW = () => S.unit === 'lb' ? 45 : 20;
const PLATES = {lb:[45,35,25,10,5,2.5], kg:[25,20,15,10,5,2.5,1.25]};
const roundW = x => Math.round(x / inc()) * inc();
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[c]);
const fmt = n => Number.isInteger(n) ? n.toLocaleString() : (Math.round(n*10)/10).toString();
const e1rm = (w, r) => r <= 1 ? w : w * (1 + r / 30);           // Epley
const prog = () => allProgs().find(p => p.id === S.programId) || PROGRAMS[0];
// Working weight: your max times the arc's training-max share, plus what finished arcs have added (tmAdd)
const setWeight = (p, set, lift) => roundW((S.maxes[lift] * p.tm + (S.tmAdd[lift] || 0)) * set.pct);
function plates(w){
  const b = barW(); if (w < b) return null;
  let side = (w - b) / 2; const out = [];
  for (const p of PLATES[S.unit]) while (side >= p - 1e-9) { out.push(p); side -= p; }
  return out;
}
function rankFor(xp){ let r = RANKS[0]; for (const x of RANKS) if (xp >= x.xp) r = x; return r; }
const nextRank = xp => RANKS.find(x => xp < x.xp);
// The clear bonus scales with how much of the day you finished, and finishing every set adds more on top
const FULL_CLEAR = 40;
const clearXp = (sets, total) => Math.round(50 * Math.min(1, sets / Math.max(1, total))) + (sets >= total ? FULL_CLEAR : 0);
const xpFor = (sets, p, total) => Math.round((sets * 10 + clearXp(sets, total)) * XP_MULT[p.rank]);
const planSets = () => wkPlan().ex.reduce((a, e) => a + e.sets.length, 0);
const pathOf = p => PATHS.find(x => x.id === p.path) || PATHS[0];
// Rank letters (E … SSS) shrink to fit the hexagon
const EM_BASE = {md:26, sm:22, lg:42, xs:17};
const emFont = (k, size) => Math.round(EM_BASE[size] * [1, .74, .56][k.length - 1]) + 'px';
const emblem = (k, size) => `<div class="emblem ${size}" style="--rc:var(--rank-${k.toLowerCase()});font-size:${emFont(k, size)}">${k}</div>`;
const today = () => new Date().toLocaleDateString(undefined, {month:'short', day:'numeric'});
const dayPrefix = () => `${S.programId}|${S.pos.w}|${S.pos.d}|`;
const sessionSets = () => Object.keys(S.done).filter(k => k.startsWith(dayPrefix()) && S.done[k]).length;

/* ---------- Header ---------- */
function renderHeader(){
  const r = rankFor(S.xp), n = nextRank(S.xp);
  const em = document.getElementById('emblem');
  em.textContent = r.k; em.style.setProperty('--rc', `var(--rank-${r.k.toLowerCase()})`); em.style.fontSize = emFont(r.k, 'xs');
  document.getElementById('heroName').textContent = S.hero.name || 'Hero';
  paintCoins();
  paintHeroes();
  document.getElementById('rankTitle').textContent = `${r.k}-Rank · ${heroTitle()}`;
  // The bar fills toward your next level; every 25 levels is a rank-up
  const lv = levelInfo(S.xp);
  document.getElementById('lvText').textContent = lv.L;
  document.getElementById('xpText').textContent = fmt(S.xp);
  document.getElementById('xpNext').textContent = lv.L < MAX_LEVEL ? `${fmt(lv.toNext)} XP to Lv ${lv.L + 1}` : 'Max level';
  document.getElementById('xpBar').style.width = lv.pct + '%';
}

/* ---------- Today ---------- */
const CHECK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';

function prHTML(lift, w, n){
  if (!n) return '';
  const e = roundW(e1rm(w, n)), u = S.unit;
  if (e > S.maxes[lift]) return `<span class="pr-hit">New est. max: ${fmt(e)} ${u}</span><button class="btn btn-power btn-sm" data-act="lock" data-lift="${lift}" data-val="${e}">Lock it in · +100 XP</button>`;
  return `<span class="pr-note">Est. max from this set: ${fmt(e)} ${u}</span>`;
}

function setRow(p, ex, ei, set, si){
  const key = `${dayPrefix()}${ei}|${si}`, done = !!S.done[key], u = S.unit;
  let load = '', meta = '', extra = '';
  if (ex.lift){
    const w = setWeight(p, set, ex.lift), pl = plates(w);
    load = `<span class="big num">${fmt(w)}</span><span class="u">${u}</span><span class="x">×</span><span class="big num">${set.reps}${set.amrap ? '<span class="amrap-tag">+</span>' : ''}</span>`;
    const plTxt = pl === null ? 'Under bar weight: use dumbbells' : pl.length === 0 ? 'Empty bar' : pl.map(fmt).join(' + ') + ' per side';
    meta = `<div class="meta"><span class="pct">${Math.round(set.pct*100)}%</span><span>${plTxt}</span></div>`;
    if (set.amrap){
      const n = S.amrap[key] || '';
      extra = `<div class="amrap"><label for="am-${ei}-${si}">Reps you got</label><input id="am-${ei}-${si}" type="number" inputmode="numeric" min="1" max="30" value="${n}" placeholder="${set.reps}+" data-amrap="${key}" data-lift="${ex.lift}" data-w="${w}"><div class="pr" data-pr="${key}">${prHTML(ex.lift, w, +n)}</div></div>`;
    }
  } else {
    const lab = set.unit || (set.reps === 1 ? 'rep' : 'reps');
    load = `<span class="big num">${set.reps}</span><span class="u">${lab}</span>`;
  }
  return `<div class="set${done ? ' done' : ''}">
    <span class="sn">${si+1}</span>
    <div class="load">${load}${meta}${extra}</div>
    <button class="check" data-act="check" data-key="${key}" aria-pressed="${done}" aria-label="${ex.name}, set ${si+1} done">${CHECK}</button>
  </div>`;
}

function exCard(p, ex, ei){
  let sub;
  if (ex.lift){
    const m = S.maxes[ex.lift];
    sub = `Max ${fmt(m)} ${S.unit}` + (p.tm < 1 || S.tmAdd[ex.lift] ? ` · Training max ${fmt(roundW(m * p.tm + (S.tmAdd[ex.lift] || 0)))}` : '');
  } else sub = '';
  const reps = ex.sets.map(s => s.reps), u0 = ex.sets[0].unit;
  const short = !u0 ? '' : u0 === 'sec' ? 's' : ' ' + u0;
  const n = ex.sets.length;
  const scheme = reps.every(r => r === reps[0]) && !ex.sets.some(s => s.amrap)
    ? (n === 1 ? `${reps[0]}${short || (reps[0] === 1 ? ' rep' : ' reps')}` : `${n} × ${reps[0]}${short}`)
    : `${n} sets`;
  const note = ex.note ? `<div class="ex-note">${ex.note}</div>` : '';
  // Last time and the warm-up ramp, the same as the workout screen shows
  const plan = wkPlan(), pe = plan.ex[ei], lt = lastTime(pe.name), ramp = rampFor(plan, pe);
  const extra = (lt ? `<div class="ex-last">Last time: ${setsText(lt[0].sets, pe.unit)}${pe.weighted && lt[0].sets[0][0] ? ' ' + S.unit : ''}</div>` : '')
    + (ramp ? `<div class="ex-last">Warm-up: ${ramp.map(([w, r], i) => i ? `${fmt(w)}×${r}` : `bar×${r}`).join(' · ')}</div>` : '');
  return `<section class="ex">
    <div class="ex-head"><div class="ex-title"><h2 class="ex-name">${ex.lift ? ex.name : swapOf(ex.name)}</h2>${sub ? `<div class="ex-sub num">${sub}</div>` : ''}${note}${extra}</div><span class="ex-scheme num">${scheme}</span></div>
    ${ex.sets.map((s, si) => setRow(p, ex, ei, s, si)).join('')}
  </section>`;
}

// Words from the masters and others on the arc: a quiet strip under the banner. A new one every 45 seconds,
// or tap for the next.
// The order is shuffled each visit, so nothing repeats until the whole list has come around.
const MASTERS = ['Master Kaito', 'Sensei Rin', 'Old Master Goro', 'Grandmaster Hoshi', 'Coach Tetsu'];
const QUOTES = [
  // Discipline and showing up
  'Motivation visits. Discipline lives here.',
  'The bar does not care how you feel today. Lift it anyway.',
  'You do not rise to your goals. You fall to your habits.',
  'Show up on the days you do not want to. Those days count double.',
  'A warrior trains when it is easy and when it is not.',
  'The hardest rep is the one that gets you out the door.',
  'Discipline is choosing what you want most over what you want now.',
  'Your future self is watching. Give them something to thank you for.',
  'Do not negotiate with the alarm clock.',
  'Ten thousand small days build one great one.',
  'Skip once and it is a choice. Skip twice and it is a habit.',
  'Comfort is a quiet thief. Guard your training.',
  'You will never always be motivated. Learn to be disciplined.',
  'The path is walked one session at a time.',
  'Champions are made when no one is clapping.',
  'Keep the promise you made to yourself this morning.',
  'Excuses are heavy. Set them down and pick up the bar.',
  'You cannot skip the work and keep the reward.',
  'The best time to train was yesterday. The second best is now.',
  'Routine is the soil. Strength is the harvest.',
  // Patience and the long road
  'The bamboo grows roots for years before it reaches the sky.',
  'Slow progress is still progress. Stopped progress is not.',
  'Do not count the days. Make the days count.',
  'A river cuts stone not by force, but by never stopping.',
  'Strength is not given in a season. It is earned in years.',
  'Be patient with the body. It is building something you cannot see yet.',
  'The mountain is climbed one step at a time. Even the masters walked.',
  'Five pounds a month is sixty pounds a year. Trust the arithmetic.',
  'What you plant today, you lift next year.',
  'Results whisper before they shout. Keep listening.',
  'There is no shortcut through the forest. Only the path.',
  'The tree that grows slowly has the hardest wood.',
  'Rushing the arc only breaks the student.',
  'Some days you grow stronger. Some days you only grow steadier. Both matter.',
  'The plateau is where the foundation is poured.',
  'You are not behind. You are exactly one workout from better.',
  // Strength and effort
  'Strength is earned rep by rep. There is no other currency.',
  'The weight is the teacher. Listen to what it tells you.',
  'Light weight is still weight. Respect every set.',
  'Your body can do more than your mind believes. Prove it gently.',
  'Heavy is a feeling. Strong is a decision.',
  'Grip the bar like it owes you something.',
  'The last rep is where the change happens.',
  'Iron does not lie. It shows you exactly who you are today.',
  'Strong people are not born. They are rebuilt, one session at a time.',
  'Every rep you finish is a vote for the person you are becoming.',
  'Struggle is not failure. It is the sound of growth.',
  'Lift with your whole self: legs, lungs, and heart.',
  'The bar gets lighter only after you get stronger.',
  'Sweat is the body admitting it is changing.',
  'Effort is the one thing no one can take from you.',
  'Pressure turns coal into diamonds. Load the bar.',
  // Form and technique
  'Perfect the movement before you chase the weight.',
  'A sloppy rep teaches the body a sloppy lesson.',
  'Brace first. Then move. Always in that order.',
  'Control the way down. That is where the strength hides.',
  'Speed without form is just a fast way to get hurt.',
  'Master the basics. The basics are what masters do.',
  'One clean rep is worth five ugly ones.',
  'Breathe with purpose. The breath carries the lift.',
  'Your feet are your foundation. Root them.',
  'Film your set. The camera is an honest sensei.',
  'Technique is strength you do not have to pay for twice.',
  'Move like water: smooth, steady, and impossible to stop.',
  // Rest and recovery
  'Rest is not quitting. Rest is part of the training.',
  'Muscles are torn in the gym and built in your sleep.',
  'A bow that is always drawn will break.',
  'Eat well, sleep deep, train hard. In that order, the body thanks you.',
  'The recovery week is not a weak week. It is a wise week.',
  'Listen to the whisper of pain before it has to scream.',
  'Water, sleep, and patience: the three quiet weapons.',
  'Even the storm rests between rounds.',
  'You grow on the rest day. Do not steal it from yourself.',
  'A tired blade cuts poorly. Sharpen it with sleep.',
  // Mindset
  'The mind gives up long before the body does.',
  'Compare yourself to who you were, not to who someone else is.',
  'Do not wish it were easier. Wish you were stronger.',
  'Your only opponent today is yesterday\'s version of you.',
  'Doubt is loud. Keep lifting until it goes quiet.',
  'Calm mind, strong body. One feeds the other.',
  'Fear of the weight is just respect that has not learned to move yet.',
  'Believe in the work, even before you see the results.',
  'You are allowed to be both a work in progress and proud of yourself.',
  'Focus on the rep in front of you. The rest of the set will follow.',
  'What you think about while you train becomes how you train.',
  'A focused hour beats a distracted three.',
  'You cannot control the result. You can control the effort.',
  'Train the mind to stay when the body wants to leave.',
  'Be gentle with yourself and hard on your excuses.',
  'Confidence is built from kept promises.',
  'Inside every hard set is a lesson. Find it.',
  'The voice that says stop is not always the voice of wisdom.',
  // Failure and setbacks
  'A missed lift is not a loss. It is information.',
  'Fall seven times. Stand up eight.',
  'Every master was once a beginner who refused to quit.',
  'Bad days are part of the arc. Even the hero loses a round.',
  'The setback is the setup for the comeback.',
  'You did not fail. You found the edge of your strength. Now move it.',
  'Bend, but do not break. Then come back stronger.',
  'A broken streak is not a broken spirit. Start again today.',
  'The scar is proof that you healed.',
  'When you miss, check your form, check your sleep, then try again.',
  'Defeat is a teacher who charges tuition. Learn the lesson so you only pay once.',
  'Losing the battle is fine. Leaving the training is not.',
  // Consistency
  'Consistency beats intensity when intensity cannot show up.',
  'A drop of water every day carves the canyon.',
  'Average effort, every day, beats perfect effort once a month.',
  'Small steps. Every day. No exceptions.',
  'Win the week, and the year takes care of itself.',
  'The streak is not the goal. The person who keeps it is.',
  'Do it again tomorrow. That is the whole secret.',
  'Build the habit first. The body follows the habit.',
  'You do not need a perfect plan. You need a repeated one.',
  'Show up, do the work, go home, repeat. That is the way.',
  // The warrior's way
  'The warrior trains not to fight, but to be ready.',
  'Be like the oak in storms: rooted, bending, still standing.',
  'Humility in the dojo. Confidence in the arena.',
  'A true master is still a student.',
  'Respect the gym, the weights, and the people beside you.',
  'Strength without kindness is just noise.',
  'Carry your strength quietly. Let your actions speak.',
  'Train hard enough that the real fight feels easy.',
  'The empty cup can be filled. Come to training ready to learn.',
  'A blade is forged in fire and finished with patience.',
  'Bow to the work, and the work will raise you.',
  'The dojo is wherever you choose to train.',
  'Your sweat is your offering to the person you will become.',
  'Earn your rank. It means nothing if it is given.',
  // Encouragement for today
  'Today is a good day to get one rep stronger.',
  'You came. That is already the hardest part.',
  'Your training arc is being written right now. Make it a good chapter.',
  'One more set than yesterday. That is all I ask.',
  'Leave the gym a little stronger than you entered it.',
  'Your level goes up one rep at a time.',
  'Today\'s workout is tomorrow\'s warm-up.',
  'Make your future self proud and your past self amazed.',
  'You are stronger than the version of you that almost stayed home.',
  'Light the fire. Then keep feeding it.',
  'The boss at the end of the arc is waiting. Get ready.',
  'Every hero has a training montage. This is yours.',
  'Power up. The next rank is closer than you think.',
  'Turn the music up and the excuses down.',
  'Earn the rest day.',
  'Finish what you started. Then start something harder.',
  'Push the limit, then move the limit.',
  'You are not here to be average. You are here to level up.',
  'Begin. The rest is just doing it again.',
  'The grind is quiet, but the results are loud.'
];
// More voices from the arc, each with their own way of saying it
const VOICES = {
  'Rival Daichi': [
    'I trained this morning. What is your excuse?',
    'Go ahead and rest. I will be lifting.',
    'Catch me if you can. I am already on my next set.',
    'You call that a warm-up? I call that my cool-down.',
    'Every day you skip, I get one day further ahead.',
    'Beat me at the end of the arc. That is the only rematch that counts.',
    'I do not hate you. I just refuse to lose to you.',
    'Do not look at my numbers. Look at yours, and make them climb.',
    'Fine. You got stronger. Now I have to train harder. Thanks a lot.',
    'A rival is just a friend who will not let you get lazy.',
    'I will see you at the top. Do not keep me waiting.',
    'You hit a new max? Good. Now the race is interesting.',
    'Talk is cheap. Plates cost effort.',
    'If you are tired, I am winning. Get up.',
    'Respect is earned under the bar, not in the locker room.',
    'Next rank, next fight. Bring everything.',
    'I lose sometimes too. I just never stay down.',
    'Stop watching my training arc and start your own.'
  ],
  'Captain Mira': [
    'We train together, we rise together.',
    'Your effort lifts the whole team. Never forget that.',
    'Count your reps out loud. Let the room hear you work.',
    'Good leaders show up first and leave last.',
    'Push your limits, but never leave your form behind.',
    'Every set you finish is a promise kept to the team.',
    'Strong alone is good. Strong together is unstoppable.',
    'Celebrate the small wins. They add up to the big ones.',
    'When someone is struggling, spot them. Someday they will spot you.',
    'Check your ego at the door and your water bottle at the bench.',
    'The scoreboard is decided long before the game starts.',
    'Do your job, every rep, every day.',
    'Practice like it is the final. Play like it is practice.',
    'Energy is contagious. Bring the good kind.',
    'A team is only as strong as its hardest worker. Be that one.',
    'Hold the line. One more set.',
    'Win the morning, win the day.',
    'We do not wait for confidence. We build it.'
  ],
  'The Wandering Monk': [
    'Breathe in strength. Breathe out doubt.',
    'The present rep is the only rep that exists.',
    'Still water reflects clearly. Calm your mind before you lift.',
    'Effort without attachment. Do the work and let go of the result.',
    'The body moves. The mind watches. The spirit grows.',
    'Even a long journey is only one step, repeated.',
    'Empty your mind of the weight. Fill it with the movement.',
    'The pain of discipline is lighter than the weight of regret.',
    'When you are tired, notice it. Then continue.',
    'Gratitude for the body that carries you. Train it with respect.',
    'A wise student knows when to push and when to rest.',
    'Silence the noise. Hear your breath. Find the rep.',
    'Patience is not waiting. It is how you act while you wait.',
    'The goal is not to be better than others. It is to be better than before.',
    'What you resist, persists. What you train, transforms.',
    'Sweat cleanses more than the skin.',
    'Walk slowly, but never walk backward.',
    'There is peace at the end of a hard set. Earn it.'
  ],
  'Ironsmith Brann': [
    'Iron is shaped by heat and hammer. So are you.',
    'A blade is folded a thousand times before it is sharp.',
    'Every strike of the hammer counts, even the ones that feel wasted.',
    'Steel that never meets fire stays soft.',
    'You are the metal and the smith. Strike well.',
    'Quench the heat with rest. Then back to the anvil.',
    'Rust grows on idle tools. Keep moving.',
    'The forge is hot for a reason. Stay in it.',
    'Rough edges get ground down with time and effort.',
    'Good steel bends before it breaks. Learn to bend.',
    'Nobody admires the sparks. They admire the sword.',
    'A strong frame is built from many small welds.',
    'Do not fear the hammer. It is making you useful.',
    'Temper the body, temper the will.',
    'Heavy work makes heavy hands. Heavy hands make strong grips.',
    'Measure twice, lift once. Craft the rep.',
    'The anvil does not care how you feel. Swing anyway.',
    'The finest armor is the body you forged yourself.'
  ],
  'Champion Ryo': [
    'I was not born a champion. I trained into one.',
    'Every belt I won was earned on days nobody saw.',
    'The title is temporary. The habits are forever.',
    'I lost more fights than I won early on. Keep going.',
    'Train for the day it matters, then make every day matter.',
    'Pressure is a privilege. It means you are close.',
    'Even at the top, I still do the basics.',
    'Do not chase the crown. Chase the next good session.',
    'Winners are just people who kept getting back up.',
    'The fight is won in the camp, not in the ring.',
    'Be hungry, stay humble, keep lifting.',
    'I still get nervous. I just train past it.',
    'Your first rank is the hardest. After that, it is momentum.',
    'Greatness is a thousand ordinary days done well.',
    'When my legs were done, my heart finished the round.',
    'There is always another level. That is the fun part.',
    'Respect every opponent, especially the one in the mirror.',
    'One day you will look back at this workout and smile.'
  ],
  'Healer Aya': [
    'Sleep is the strongest supplement there is.',
    'Drink water before you are thirsty.',
    'Soreness fades. Strength stays.',
    'Stretch what is tight, strengthen what is weak.',
    'Pain is a message. Read it before you push through it.',
    'Your body rebuilds while you rest. Let it work.',
    'Eat to fuel, not to punish.',
    'A sharp pain means stop. A dull burn means keep going.',
    'Warm up like your joints depend on it. They do.',
    'Mobility today keeps injuries away tomorrow.',
    'A rest day is not lost progress. It is protected progress.',
    'Be kind to your knees. You will need them for a long time.',
    'Deep breaths lower stress. Lower stress builds muscle.',
    'Protein, sleep, water, repeat.',
    'Recovery is a skill. Practice it like your lifts.',
    'The strongest athletes are the ones who stay healthy.',
    'Listen to your body before it has to shout.',
    'Treat your body like the only home you will ever have.'
  ],
  'Rookie Kenji': [
    'I almost skipped today. Glad I did not.',
    'My first push-up took a month. Now I do sets of twenty.',
    'I am not the strongest here, but I am here.',
    'Turns out the hardest part was just starting.',
    'I failed the lift, but I learned the setup. Win.',
    'Every veteran here started as a rookie like me.',
    'Today I added five pounds. Tiny, but mine.',
    'I used to be scared of the squat rack. Now it is my spot.',
    'Some days I just do the warm-up and one set. It still counts.',
    'Asked for help with my form today. Best decision all week.',
    'I am slow, but I keep showing up.',
    'My shoes are worn out. That has to mean something.',
    'Leveled up today. I might frame the screenshot.',
    'If I can do this, you definitely can.',
    'The burn means it is working, right? Right?',
    'I wrote my max on a sticky note. Time to beat it.',
    'Rookie today. Legend someday.',
    'One more rep for the training montage.'
  ],
  'Sage of the Mountain': [
    'The summit is reached by those who keep walking in the fog.',
    'The wind does not move the mountain. Be the mountain.',
    'Seasons change. Your discipline should not.',
    'A small stone, carried every day, becomes a great wall.',
    'The eagle does not fear the storm. It flies above it.',
    'Roots grow in silence. So does strength.',
    'The path up is steep, but the view rewards every step.',
    'Snow melts one flake at a time. Progress arrives the same way.',
    'Climb with patience. The mountain is not going anywhere.',
    'Even the tallest peak began as a pile of dust.',
    'He who moves mountains begins by carrying small stones.',
    'Do not look at the height of the mountain. Look at your next step.',
    'The river reaches the sea because it never stops flowing.',
    'Thunder is loud, but the rain does the work.',
    'Strength is quiet, like stone. It does not need to shout.',
    'The fire on the mountaintop is lit by those who climb in the dark.',
    'Morning comes for everyone. Few use it well.',
    'The clouds pass. The mountain remains. Stay.'
  ],
  'Your Future Self': [
    'Thank you for not quitting today.',
    'I am stronger because of the set you are about to do.',
    'Remember this feeling. It is where I started.',
    'You were right to keep going. It was worth it.',
    'The habits you build now, I live with every day.',
    'Do it for me. I promise I will make it worth it.',
    'The version of us that stayed on the couch never met me.',
    'Every rep you do is a gift to me.',
    'I still remember the day you almost gave up. You did not.',
    'Our knees thank you for the warm-up.',
    'I look back at this workout and I am proud of you.',
    'You will not believe what we can lift now.',
    'Keep the streak. I am counting on you.',
    'This hard part is the part I am most grateful for.',
    'Trust me. Do the last set.',
    'You are building me right now. Build me well.',
    'We made it. Because you started.',
    'Do not worry about being perfect. I am proof that consistent is enough.'
  ],
  'Spirit of the Dojo': [
    'These walls remember every drop of sweat. Add yours.',
    'Enter with respect. Leave with strength.',
    'Many have trained here. The ones who stayed became legends.',
    'The floor has felt ten thousand footsteps. Make yours count.',
    'I have seen beginners become masters. I see one now.',
    'The dojo is quiet only between your efforts.',
    'Bow to the training, and the training will bow to you.',
    'Old warriors leave strength in the air. Breathe it in.',
    'I do not reward talent. I reward return.',
    'Every student who returns tomorrow is already winning.',
    'The mat does not judge. It only remembers who showed up.',
    'Your spirit grows louder with every honest rep.',
    'Here, the only rank that matters is effort.',
    'Leave your worries at the door. Pick them up later, if you still want them.',
    'The training never ends. That is the gift.',
    'Clear mind, full heart, strong body.',
    'The legends you admire once stood exactly where you stand.',
    'Return tomorrow. I will be here.'
  ],
  'Granny Sato, gym owner': [
    'Back in my day, we lifted rocks. You have plates. No complaining.',
    'Eat your vegetables and squat deep.',
    'I have run this gym for forty years. Consistency wins every time.',
    'You look tired. Good. Now drink some water and finish.',
    'Put your weights back. Strong people are also polite.',
    'I am eighty and I still deadlift. What is stopping you?',
    'Stop checking your phone between sets. The bar is right there.',
    'A little every day beats a lot once in a while, sweetheart.',
    'Your grandmother would be proud. I certainly am.',
    'Sleep early, train early, eat well. That is the whole secret.',
    'The young ones rush. The wise ones return.',
    'If it was easy, everyone would be strong. Now hush and lift.',
    'Muscles fade if you leave them. Do not leave them.',
    'I have seen a thousand people start. Be one of the ones who stays.',
    'You can rest when the set is done, dear.',
    'Strong legs carry you far in life. Train them.',
    'Lock up when you leave, and come back tomorrow.',
    'Wipe down the bench. Then go conquer the world.'
  ]
};
// Every quote with its speaker: the masters' lines rotate between them, the rest belong to their voice
const ALL_QUOTES = [...QUOTES.map((text, n) => ({text, by:MASTERS[n % MASTERS.length]})),
  ...Object.entries(VOICES).flatMap(([by, lines]) => lines.map(text => ({text, by})))];
let quoteOrder = null, quotePos = 0, quoteTimer = null;
function quoteAt(i){ if (!quoteOrder){ quoteOrder = [...ALL_QUOTES.keys()]; for (let j = quoteOrder.length - 1; j > 0; j--){ const k = Math.floor(Math.random() * (j + 1)); [quoteOrder[j], quoteOrder[k]] = [quoteOrder[k], quoteOrder[j]]; } }
  return ALL_QUOTES[quoteOrder[i % quoteOrder.length]]; }
// D: closing words on the workout complete page. Big moments get their own lines; any other day, the rotation.
const MOMENT_WORDS = {
  rank: [
    ['Spirit of the Dojo', 'A new rank. These walls will remember this day.'],
    ['Master Kaito', 'You earned this rank one rep at a time. Wear it with pride.'],
    ['Your Future Self', 'This is the rank-up I tell people about.'],
    ['Rival Daichi', 'A new rank? Fine. Now I have to catch up.'],
    ['Champion Ryo', 'I remember my first rank-up. The next one feels even better.'],
    ['Granny Sato, gym owner', 'Look at you, all grown up and strong. Go eat something.']
  ],
  boss: [
    ['Rival Daichi', 'You beat the boss. Not bad. I will beat a bigger one.'],
    ['Champion Ryo', 'Bosses fall to people who prepared. You prepared.'],
    ['Captain Mira', 'That was a team-captain performance. The whole arc in one fight.'],
    ['Sage of the Mountain', 'The peak was reached. Rest here, then find a taller one.'],
    ['Old Master Goro', 'The boss was never the weight. It was your doubt. Both fell today.']
  ],
  arc: [
    ['Sensei Rin', 'An arc complete. Every great story has many chapters. Begin the next.'],
    ['Ironsmith Brann', 'Four weeks in the forge. Look at the steel you made.'],
    ['The Wandering Monk', 'The journey ended where it began: with you, stronger.'],
    ['Grandmaster Hoshi', 'Finish the arc, honor the work, then climb again.']
  ]
};
let closeQ = 0;
function closingWords(s){
  const pool = s.rankedUp ? MOMENT_WORDS.rank : s.bossWon ? MOMENT_WORDS.boss : s.arcDone ? MOMENT_WORDS.arc : null;
  if (pool){ const [by, text] = pool[Math.floor(Math.random() * pool.length)]; return {text, by}; }
  return quoteAt(quotePos + 3 + closeQ++ * 11);
}

// E: the scroll of the day at the bottom of Today. Picked from the date, so it stays the same all day.
function scrollHTML(){
  if (!S.prefs.quotes) return '';
  const q = ALL_QUOTES[seeded('scroll' + todayIso(), ALL_QUOTES.length)];
  return `<section class="day-scroll" aria-label="Scroll of the day"><p class="ds-h">Scroll of the day</p><p class="ds-q">“${q.text}”</p><p class="ds-by">${q.by}</p></section>`;
}

// B: the quote in a speech bubble on your character's stage. Its own button, so tapping it shows the next
// quote while the rest of the banner still opens the character editor.
function bubbleHTML(){
  if (!S.prefs.quotes) return '';
  const q = quoteAt(quotePos);
  return `<button type="button" class="bubble" data-act="nextQuote">
    <span class="sensei-body"><span class="sensei-q" id="senseiQ">${q.text}</span><span class="sensei-by" id="senseiBy">${q.by}</span></span><span class="sr-only">Tap for another quote.</span></button>`;
}
function showQuote(step){
  quotePos += step; const q = quoteAt(quotePos), t = document.getElementById('senseiQ'), b = document.getElementById('senseiBy');
  if (!t) return;
  const set = () => { t.textContent = q.text; b.textContent = q.by; t.parentNode.classList.remove('out'); };
  if (reduceMotion) return set();
  t.parentNode.classList.add('out'); setTimeout(set, 250);
}
// Rotates only while the Today tab is on screen and the page is visible
function startQuotes(){ clearInterval(quoteTimer); quoteTimer = setInterval(() => { if (!document.hidden && tab === 'today') showQuote(1); }, 45000); }

// B: your character on their stage at the top of Today. Tap it to customize.
function bannerHTML(){
  const r = rankFor(S.xp), lv = levelInfo(S.xp);
  return `<div class="banner-wrap"${heroIn ? ` style="--hero-in:${heroIn}"` : ""}><button class="banner" data-act="openHero" aria-label="Customize your character">
    <span class="banner-stage stage-bg">${flairLayer()}<canvas id="bannerImg" class="banner-img"${shopGlow()} width="128" height="208" role="img"></canvas>${shopPet()}<span class="banner-edit-wrap"><span class="banner-edit">Edit</span></span></span>
    <div class="banner-foot"><div class="banner-row"><span class="banner-name">${esc(S.hero.name || 'Hero')}</span><b class="num">Lv ${lv.L}</b></div>
      <div class="banner-row"><small>${r.k}-Rank · ${heroTitle()}</small></div>
      <div class="lifebar" aria-hidden="true"><i style="width:${lv.pct}%"></i></div>
      <div class="xpline num"><span>${fmt(S.xp)} XP</span><span>${lv.L < MAX_LEVEL ? `${fmt(lv.toNext)} XP to Lv ${lv.L + 1}` : 'Max level'}</span></div></div>
  </button>${bubbleHTML()}${coinBadgeHTML('banner-coins')}</div>`;
}
// Quests and your weekly streak, under today's workout
const FLAME = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z"/></svg>';
function questsHTML(){
  const qs = questList(), n = weekStreak(), m = streakMult(n);
  const row = q => `<div class="quest${q.done ? ' done' : ''}">
    <span class="q-check" aria-hidden="true">${q.done ? CHECK : ''}</span>
    <div class="q-body"><span class="q-kind">${q.check ? 'Daily check-in' : q.daily ? 'Daily' : 'Weekly'}</span><span class="q-text">${q.text}</span>
      ${q.goal ? `<div class="q-bar" role="img" aria-label="${q.val} of ${q.goal}"><i style="width:${q.val / q.goal * 100}%"></i></div><span class="q-prog num">${fmt(q.val)} / ${fmt(q.goal)}</span>` : ''}
      <span class="q-rw num${q.done ? ' got' : ''}"><b>+${q.xp} XP</b><span class="q-gr">${window.TA_SHOP_DATA ? `<img src="${TA_SHOP_DATA.coinIcon}" alt="">` : ''}+${q.grind} Grind</span>${q.done ? '<span class="q-got">Earned</span>' : ''}</span></div>
    ${q.check && !q.done ? `<button type="button" class="btn btn-ghost btn-sm q-claim" data-act="checkQuest" data-v="${q.check}" aria-label="Mark done: ${q.text}. Plus ${q.xp} XP and ${q.grind} Grind">Done</button>` : q.done ? '<span class="q-xp num">Done</span>' : ''}</div>`;
  return `<section class="panel quests">
    <div class="row-between"><h3>Quests</h3><span class="streak${n ? ' on' : ''}">${FLAME}${n ? `${n}-week streak${m > 1 ? ` · ×${m.toFixed(2)} XP` : ''}` : 'No streak yet'}</span></div>
    ${qs.map(row).join('')}
    <p class="fine">Hit ${weekGoal()} workout${weekGoal() === 1 ? '' : 's'} a week to keep your streak. Each week in a row adds +5% workout XP, up to +20%. Tap Done on a check-in when you do it. Daily quests reset at midnight, weekly quests on Monday.</p>
    <p class="fine shield-line">${shieldHTML(streakInfo(logsByDay(), todayIso()))} Rest days never break your session streak, and a shield covers one missed training day each week. It refills Monday.</p>
  </section>`;
}
function viewToday(){
  const p = prog(), {w, d} = S.pos, wk = p.weeks[w], day = wk.days[d];
  const perWeek = wk.days.length, total = p.weeks.length * perWeek, idx = w * perWeek + d;
  const pips = Array.from({length:total}, (_, i) => `<span class="pip${i < idx ? ' on' : i === idx ? ' cur' : ''}"></span>`).join('');
  const n = sessionSets();
  let h = gateCardHTML() + bannerHTML() + (S.arcJustDone === p.id && !w && !d ? nextArcHTML(p, 'panel') : '') + `<section class="stage">
    <div class="stage-top"><span class="tag rank-${p.rank.toLowerCase()}">${p.rank}-Rank</span>${isBoss(p, w, d) ? '<span class="tag boss-tag">Boss</span>' : ''}<span class="eyebrow">${pathOf(p).name} · ${p.name}</span></div>
    <h1 class="stage-title">${day.name}</h1>
    <div class="stage-meta">Week ${w+1}: ${p.weekNames[w]} · Day ${d+1} of ${perWeek}</div>
    ${isBoss(p, w, d) ? `<div class="boss-line">Boss battle: <b>${bossName(p)}</b>. Clear every set to defeat it for +${fmt(bossXp(p))} XP.</div>` : ''}
    ${isBoss(p, w, d) && window.TA_BOSSES ? `<button class="btn btn-power wk-start" data-act="startWk">${arcBossMid() ? `Resume the boss fight · ${arcBossMid()} sets in` : 'Fight the boss'}</button><button type="button" class="wk-link boss-plain" data-act="startWkPlain">Log it as a normal workout instead</button>`
      : `<button class="btn btn-power wk-start" data-act="startWk">${n ? 'Continue workout' : 'Start workout'}</button>`}
    <div class="stage-nav">
      <button class="btn btn-ghost btn-sm" data-act="move" data-dir="-1" aria-label="Previous workout">‹ Prev</button>
      <div class="pips" aria-hidden="true">${pips}</div>
      <button class="btn btn-ghost btn-sm" data-act="move" data-dir="1" aria-label="Next workout">Next ›</button>
    </div>
  </section>`;
  h += questsHTML();
  if (p.needsMax && S.example) h += `<div class="notice">These weights use example maxes. <button data-act="tab" data-tab="maxes">Enter your maxes</button> and every number updates.</div>`;
  h += day.ex.map((ex, ei) => exCard(p, ex, ei)).join('');
  h += scrollHTML();
  h += `<div class="finish">
    <div class="sx">Session XP<b class="num" id="sessXp">${n ? '+' + xpFor(n, p, planSets()) : '0'}</b></div>
    <button class="btn btn-power" data-act="finish">Clear stage</button>
  </div>`;
  return h;
}

/* ---------- Maxes ---------- */
function viewMaxes(){
  const u = S.unit;
  const last = l => S.history.find(h => h.lift === l);
  const cards = Object.keys(LIFTS).map(l => {
    const h = last(l);
    // A lift you haven't entered yet shows its stand-in number as a faded hint, so it's clear nothing is set (medals need your real max)
    const foot = !h ? `<span class="chip warn">${S.maxEst[l] && !S.example ? 'Estimate' : 'Example'} · enter yours</span>` : h ? `${(d => d ? `<span>Updated ${d}</span>` : '')(h.date || (h.iso ? shortDate(h.iso) : ''))}<span class="chip">${h.src}</span>` : '';
    return `<div class="max-card">
      <label for="max-${l}">${LIFTS[l]}</label>
      <div class="inwrap"><input id="max-${l}" type="number" inputmode="decimal" min="1" step="any" value="${h ? S.maxes[l] : ''}" placeholder="${S.maxes[l]}" data-max="${l}"${h ? '' : ` aria-describedby="maxhint-${l}"`}><span class="u">${u}</span></div>${h ? '' : `<p class="max-hint" id="maxhint-${l}">Workouts use ${fmt(S.maxes[l])} ${u} until you enter your real max.</p>`}
      <div class="max-foot">${foot}</div>
      ${(nx => nx ? `<div class="max-next">Next: <b>${nx.name}</b> · ${fmt(nx.val)} ${u}</div>` : `<div class="max-next">All milestones done</div>`)(nextMs(l))}
      ${S.tmAdd[l] ? `<div class="max-next">Working weights +${fmt(S.tmAdd[l])} ${u} from finished arcs</div>` : ''}
    </div>`;
  }).join('');
  return `<section>
    <div class="row-between"><h1 class="sec">Your maxes</h1>
      <div class="seg" role="group" aria-label="Units"><button data-act="unit" data-unit="lb" aria-pressed="${u==='lb'}">lb</button><button data-act="unit" data-unit="kg" aria-pressed="${u==='kg'}">kg</button></div></div>
    <p class="lede">Enter your best single rep for each lift. Every weight in your arc recalculates from these, rounded to the nearest ${fmt(inc())} ${u}.</p>
  </section>
  <div class="max-grid">${cards}</div>
  <section class="panel" id="estimator">
    <h3>Don't know your max?</h3>
    <p class="fine">Enter a weight and how many clean reps you got. The app estimates your 1-rep max.</p>
    <div class="est-grid">
      <label class="f f-lift"><span>Lift</span><select id="est-lift">${Object.keys(LIFTS).map(l => `<option value="${l}">${LIFTS[l]}</option>`).join('')}</select></label>
      <label class="f"><span>Weight (${u})</span><input id="est-w" type="number" inputmode="decimal" min="1" placeholder="225"></label>
      <label class="f"><span>Reps</span><input id="est-r" type="number" inputmode="numeric" min="1" max="20" placeholder="5"></label>
    </div>
    <div class="est-out">
      <div><div class="fine">Estimated max</div><span class="big num" id="est-val">—</span><span class="u">${u}</span></div>
      <button class="btn btn-power" id="est-use" data-act="useEst" disabled>Use as my max</button>
    </div>
    <p class="fine" id="est-note">Uses the Epley formula. Most accurate with 1–10 reps.</p>
  </section>
  <section class="panel">
    <h3>Plate calculator</h3>
    <label class="f"><span>Bar weight (${u})</span><input id="plate-w" type="number" inputmode="decimal" min="0" step="${inc()}" placeholder="225"></label>
    <div class="plate-out" id="plate-out" aria-live="polite"><span class="fine">Enter a weight to see the plates.</span></div>
    <p class="fine">Plates per side on a ${barW()} ${u} bar. Workout screens show this for every barbell set.</p>
  </section>`;
}
function updateEstimate(){
  const w = parseFloat(document.getElementById('est-w')?.value), r = parseInt(document.getElementById('est-r')?.value, 10);
  const out = document.getElementById('est-val'), btn = document.getElementById('est-use'), note = document.getElementById('est-note');
  if (!out) return;
  if (w > 0 && r > 0){
    const e = roundW(e1rm(w, r)); out.textContent = fmt(e); btn.disabled = false; btn.dataset.val = e;
    note.textContent = r > 10 ? 'Over 10 reps the estimate gets less reliable. A set of 3–8 gives a better number.' : 'Uses the Epley formula. Most accurate with 1–10 reps.';
  } else { out.textContent = '—'; btn.disabled = true; }
}
// Returns any strength achievements this new max just earned
function setMax(lift, val, src){
  const old = S.maxes[lift];
  S.maxes[lift] = val; S.example = false; delete S.maxEst[lift]; delete S.tmAdd[lift];   // a real new max replaces arc boosts
  // Typing in a lower max corrects it: higher entries for that lift come off the strength chart too
  if (src === 'Entered' && val < old){ const k = 2.20462, inUnit = h => h.unit === S.unit ? h.val : h.unit === 'lb' ? h.val / k : h.val * k;
    S.history = S.history.filter(h => h.lift !== lift || inUnit(h) <= val + .01); }
  S.history.unshift({date:today(), iso:todayIso(), lift, val, unit:S.unit, src, delta:val - old});
  S.history = S.history.slice(0, 300);
  return checkAch();
}

/* ---------- Strength achievements ---------- */
// The classic gym milestones for each lift. Plate numbers (135, 225, 315...) are named for the 45s on each
// side; kg lifters get the matching kg marks. Only maxes you set count (never the example numbers), and they
// follow your max as it is now: lower a max and the medals above it (and anything they unlocked) lock again.
const MILESTONES = {
  bench:    [135, 185, 225, 275, 315, 365, 405, 455, 495],
  squat:    [135, 225, 275, 315, 405, 495, 585, 675, 765],
  deadlift: [135, 225, 315, 405, 495, 585, 675, 765, 855],
  ohp:      [95, 135, 155, 185, 225, 275, 315, 365],
  clean:    [135, 185, 225, 275, 315, 365, 405]
};
const MS_KG = {95:42.5, 135:60, 155:70, 185:85, 225:100, 275:125, 315:140, 365:165, 405:180, 455:205, 495:220, 585:260, 675:300, 765:340, 855:380};
const PLATES_NAME = {135:'One Plate', 225:'Two Plates', 315:'Three Plates', 405:'Four Plates', 495:'Five Plates', 585:'Six Plates', 675:'Seven Plates', 765:'Eight Plates', 855:'Nine Plates'};
const TIER_COLOR = ['#cd8a4a', '#c9ccd6', '#ffd23f', '#4cc3ff', '#b98cff', '#ff4d7d', '#3ddc97', '#ff8a3d', '#f4f2ff'];
const msVal = lb => S.unit === 'kg' ? MS_KG[lb] : lb;
const msName = lb => PLATES_NAME[lb] || `${msVal(lb)} Club`;
// Your current max for a lift, in the current unit; 0 until you've set that lift yourself
function bestMax(lift){
  return S.example || !S.history.some(h => h.lift === lift) ? 0 : S.maxes[lift] || 0;
}
// Brings achievements in line with your maxes: earns the ones you've reached (dated today) and takes back the
// ones above your current max. Returns the newly earned ones.
function checkAch(){
  const fresh = [];
  for (const [lift, list] of Object.entries(MILESTONES)){ const best = bestMax(lift);
    list.forEach((lb, i) => { const key = `${lift}-${lb}`, ok = best >= msVal(lb) - .01;
      if (ok && !S.ach[key]){ S.ach[key] = todayIso(); fresh.push({lift, lb, i}); }
      else if (!ok && S.ach[key]) delete S.ach[key]; }); }
  if (S.flairToasted) S.flairToasted = S.flairToasted.filter(id => { const f = flairOf(id); return f && f.ok(); });   // relocked backdrops announce again when re-earned
  return fresh;
}
const achText = a => `${msName(a.lb)} on ${LIFTS[a.lift]} (${fmt(msVal(a.lb))} ${S.unit})`;
// The next milestone for a lift, or null when every one is done
function nextMs(lift){ const lb = MILESTONES[lift].find(x => !S.ach[`${lift}-${x}`]); return lb ? {lb, name:msName(lb), val:msVal(lb), toGo:Math.max(0, msVal(lb) - bestMax(lift))} : null; }
function setUnit(u){
  if (u === S.unit) return;
  const f = u === 'kg' ? 1/2.20462 : 2.20462;
  S.unit = u;
  for (const l in S.maxes) S.maxes[l] = roundW(S.maxes[l] * f);
  if (S.bw) S.bw = Math.round(S.bw * f * 10) / 10;
  for (const l in S.tmAdd) S.tmAdd[l] = Math.round(S.tmAdd[l] * f / inc()) * inc();
  save(); render(); toast(`Switched to ${u}. Maxes converted.`);
}

/* ---------- Arcs ---------- */
// Each arc keeps its own place (week, day and training days): switch away and back and you pick up where you left off
const arcSave = id => (S.arcSaves || {})[id] || null;
const arcWhere = id => { const sv = arcSave(id); return sv && sv.pos && (sv.pos.w || sv.pos.d) ? `Week ${sv.pos.w + 1}, Day ${sv.pos.d + 1}` : ''; };
function switchArc(id, fresh){
  S.arcSaves = S.arcSaves || {};
  if (S.programId) S.arcSaves[S.programId] = {pos:clone(S.pos), schedule:clone(S.schedule)};
  const sv = !fresh && S.arcSaves[id]; S.programId = id; const p = prog();
  const w = sv ? Math.max(0, Math.min(sv.pos.w, p.weeks.length - 1)) : 0, d = sv ? Math.max(0, Math.min(sv.pos.d, p.weeks[w].days.length - 1)) : 0;
  S.pos = {w, d};
  setSchedule(sv && Array.isArray(sv.schedule) && sv.schedule.length ? clone(sv.schedule) : clone(SCHED[p.weeks[0].days.length] || SCHED[3]));
  delete S.arcSaves[id];   // the arc in use keeps its place in S.pos
  return !!(w || d);
}
// Starting an arc over: back to week 1, day 1, with any sets logged on its unfinished days cleared
function restartArc(id){
  if (id === S.programId) S.pos = {w:0, d:0}; else if (S.arcSaves) delete S.arcSaves[id];
  for (const bag of [S.done, S.amrap, S.setLog, S.ramp]) for (const k of Object.keys(bag || {})) if (k.startsWith(id + '|')) delete bag[k];
}
let restartArmed = null;
const startOverBtn = p => (p.id === S.programId ? (S.pos.w || S.pos.d) : arcWhere(p.id)) ? `<button type="button" class="btn btn-ghost btn-sm" data-act="restartArc" data-id="${p.id}">${restartArmed === p.id ? 'Tap again to start over' : 'Start over'}</button>` : '';
const startLabel = p => arcWhere(p.id) ? `Resume · ${arcWhere(p.id)}` : 'Start this arc';
let arcPath = null;
// Each hero has their own lineup of paths; "Show all arcs" shows both. The active arc's path always stays visible.
const heroPaths = () => {
  const g = S.hero.gender, cur = prog().path, all = S.prefs.allArcs;
  const order = x => x.g === 'both' ? 2 : x.g === g ? 0 : 1;
  return PATHS.filter(x => all || x.g === 'both' || x.g === g || x.id === cur).sort((a, b) => order(a) - order(b));
};
function viewArcs(){
  const cur = prog(), g = S.hero.gender, shown = heroPaths(), curG = pathOf(cur).g;
  if (!arcPath || !shown.some(x => x.id === arcPath)) arcPath = S.prefs.allArcs || curG === g || curG === 'both' ? cur.path : shown[0].id;
  const path = PATHS.find(x => x.id === arcPath), whose = g === 'female' ? 'her' : 'his';
  const who = `<div class="arcs-who"><span>${S.prefs.allArcs ? 'Showing every path' : `Showing ${whose} paths`}</span><button type="button" class="btn btn-ghost btn-sm" data-act="allArcs" aria-pressed="${!!S.prefs.allArcs}">${S.prefs.allArcs ? `Only ${whose} paths` : 'Show all arcs'}</button></div>`;
  const paths = shown.map(x => `<button class="path${x.id === arcPath ? ' sel' : ''}" data-act="path" data-path="${x.id}" aria-pressed="${x.id === arcPath}">
      <span class="path-name">${x.name}</span><span class="path-tag">${x.tag}</span>${cur.path === x.id ? '<span class="path-live">Active</span>' : ''}
    </button>`).join('');
  if (arcPath === 'custom') return `<section><h1 class="sec">Training arcs</h1><p class="lede">Choose your path, then your difficulty. Every path climbs from E-Rank (beginner) to S-Rank (master), and harder arcs pay more XP.</p></section>${who}
  <div class="paths" role="group" aria-label="Training paths">${paths}</div>
  <section class="path-intro"><div class="eyebrow">${path.name}</div><p>${path.desc}</p></section>
  <article class="arc arc-new"><h3>Create your own arc</h3><p>Pick your training days, then add exercises from the library or type your own. Takes a few minutes.</p>
    <div><button class="btn btn-power btn-sm" data-act="newArc">Create arc</button></div></article>
  ${customProgs().map(p => { const def = S.customArcs.find(a => a.id === p.id), active = p.id === S.programId, perWeek = p.weeks[0].days.length;
    return `<article class="arc${active ? ' active' : ''}">
      <div class="arc-head">${emblem('C', 'sm')}<div><h3>${esc(p.name)}</h3><div class="arc-meta">Custom · ${perWeek} days/week · ${p.weeks.length} weeks${def.wave ? ' · weekly wave' : ''}</div></div></div>
      <p>${esc(p.blurb)}</p>
      <div class="chips"><span class="chip">${p.needsMax ? 'Uses your maxes' : 'No maxes needed'}</span><span class="chip xp">XP ×${XP_MULT.C}</span></div>
      <div class="arc-btns">${active ? `<span class="arc-active">Active · Week ${S.pos.w + 1}, Day ${S.pos.d + 1}</span>` : `<button class="btn btn-power btn-sm" data-act="start" data-id="${p.id}">${startLabel(p)}</button>`}${startOverBtn(p)}
        <button class="btn btn-ghost btn-sm" data-act="editArc" data-id="${p.id}">Edit</button>
        <button class="btn btn-ghost btn-sm arc-del" data-act="delArc" data-id="${p.id}">${deleteArmed === p.id ? 'Tap again to delete' : 'Delete'}</button></div>
    </article>`; }).join('')}`;
  const cards = PROGRAMS.filter(p => p.path === arcPath).map(p => {
    const active = p.id === S.programId, perWeek = p.weeks[0].days.length;
    return `<article class="arc${active ? ' active' : ''}">
      <div class="arc-head">${emblem(p.rank, 'sm')}
        <div><h3>${p.name}</h3><div class="arc-meta">${p.rank}-Rank · ${LEVEL[p.rank]} · ${perWeek} days/week · ${p.weeks.length} weeks</div></div></div>
      <p>${p.blurb}</p>
      <div class="chips"><span class="chip">${p.needsMax ? 'Uses your maxes' : 'No maxes needed'}</span>${p.tm < 1 ? `<span class="chip">Training max ${Math.round(p.tm*100)}%</span>` : ''}<span class="chip xp">XP ×${XP_MULT[p.rank]}</span></div>
      ${active
        ? `<div class="row-between"><span class="arc-active">Active · Week ${S.pos.w+1}, Day ${S.pos.d+1}</span><div class="arc-btns">${startOverBtn(p)}<button class="btn btn-ghost btn-sm" data-act="tab" data-tab="today">Continue</button></div></div>`
        : `<div class="arc-btns"><button class="btn btn-power btn-sm" data-act="start" data-id="${p.id}">${startLabel(p)}</button>${startOverBtn(p)}<button class="btn btn-ghost btn-sm" data-act="remix" data-id="${p.id}">Remix</button></div>`}
    </article>`;
  }).join('');
  return `<section><h1 class="sec">Training arcs</h1><p class="lede">Choose your path, then your difficulty. Every path climbs from E-Rank (beginner) to S-Rank (master), and harder arcs pay more XP.</p></section>${who}
  <div class="paths" role="group" aria-label="Training paths">${paths}</div>
  <section class="path-intro"><div class="eyebrow">${path.name} path</div><p>${path.desc}</p></section>
  ${cards}`;
}

/* ---------- Welcome (first launch) ---------- */
// A full-screen cover for brand-new players: title, hero, path, experience, maxes, training days, ready.
// What's entered is kept when going back; the maxes step only appears when the chosen arc uses maxes.
const EXPERIENCE = [['E', 'Just starting', 'New to training, or coming back after a long break'], ['D', 'A few months', 'You know the basics and train fairly often'],
  ['C', 'A year or more', 'Steady training and solid technique'], ['B', 'Several years', 'You train hard and know your numbers']];
let ob = null;
const obArc = () => PROGRAMS.find(p => p.id === ob.arcId);
const obLifts = () => { const p = obArc(); return p ? [...new Set(p.weeks.flatMap(w => w.days.flatMap(d => d.ex.map(x => x.lift))).filter(Boolean))] : []; };
const obSteps = () => ['title', 'hero', 'path', 'exp', ...(obLifts().length ? ['maxes'] : []), 'days', 'ready'];
const OB_EP = {hero:'The hero', path:'The path', exp:'The past', maxes:'Power level', days:'The schedule', ready:'The arc begins'};
function openWelcome(){
  ob = {step:'title', name:'', gender:'male', path:'power', exp:'E', arcId:'power-e', pickArc:false, maxes:{}, est:null, unit:S.unit, days:null};
  const el = document.getElementById('welcome'); el.hidden = false; behind().forEach(x => x.inert = true);
  renderOb(); el.querySelector('.ob-primary')?.focus({preventScroll:true});
}
function obGo(step){ ob.step = step; ob.est = null; renderOb(); document.getElementById('welcome').scrollTop = 0; document.querySelector('#obPage h1, #obPage h2')?.focus({preventScroll:true}); }
function obMove(dir){ const st = obSteps(), i = st.indexOf(ob.step); obGo(st[Math.max(0, Math.min(st.length - 1, i + dir))]); }
function renderOb(){
  const st = obSteps(), i = st.indexOf(ob.step), page = document.getElementById('obPage'), p = obArc(), perWeek = p.weeks[0].days.length;
  if (!ob.days) ob.days = clone(SCHED[perWeek] || SCHED[3]);
  const head = ob.step === 'title' ? '' : `<div class="ob-nav"><button type="button" class="ob-back" data-ob="back" aria-label="Back">‹ Back</button>
      <div class="ob-dots" aria-label="Step ${i} of ${st.length - 1}">${st.slice(1).map((s, k) => `<i class="${k < i ? 'on' : ''}"></i>`).join('')}</div><span class="ob-nav-pad"></span></div>`;
  const foot = (label, opt) => `<div class="ob-foot">${opt ? `<button type="button" class="wk-link ob-skip" data-ob="skip">${opt}</button>` : ''}<button type="button" class="btn btn-power ob-primary" data-ob="next">${label}</button></div>`;
  let body = '';
  if (ob.step === 'title') body = `<div class="ob-title">
      <canvas id="obImg" class="ob-hero" width="128" height="208" role="img" aria-label="Your character"></canvas>
      <p class="ob-kicker">An anime gym RPG</p><h1 class="ob-logo" id="obTitle" tabindex="-1">Training<br>Arc</h1>
      <p class="ob-lede">Your real-life training arc starts now. Train, level up, rank up, and watch your character grow with you.</p></div>
    <div class="ob-foot"><button type="button" class="btn btn-power ob-primary" data-ob="next">Begin</button>${S.onboarded ? `<button type="button" class="wk-link" data-ob="cancel">Not now</button>` : `<button type="button" class="wk-link" data-ob="restore">Restore a backup</button>`}</div>`;
  else if (ob.step === 'hero') body = `<h2 class="ob-h" id="obTitle" tabindex="-1">Create your hero</h2><p class="ob-sub">Pick who you'll train as. You can change the look any time.</p>
    <div class="ob-pair" role="radiogroup" aria-label="Character">${['male', 'female'].map(g => `<button type="button" class="ob-card ob-char" role="radio" data-ob="gender" data-v="${g}" aria-checked="${ob.gender === g}">
      <canvas id="obImg-${g}" width="128" height="208" role="img" aria-label="${GENDERS[g].label} character"></canvas><span>${GENDERS[g].label}</span></button>`).join('')}</div>
    <label class="f ob-field"><span>Hero name</span><input id="obName" data-ob-in="name" value="${esc(ob.name)}" maxlength="14" placeholder="Hero" autocomplete="nickname" autocapitalize="words" enterkeyhint="next" spellcheck="false"></label>
    ${foot('Next')}`;
  else if (ob.step === 'path') body = `<h2 class="ob-h" id="obTitle" tabindex="-1">Choose your path</h2><p class="ob-sub">How do you want to train? Every path climbs from E-Rank to S-Rank.</p>
    <div class="ob-list" role="radiogroup" aria-label="Training path">${PATHS.filter(x => x.g === ob.gender || x.id === 'home').map(x => `<button type="button" class="ob-card ob-row" role="radio" data-ob="path" data-v="${x.id}" aria-checked="${ob.path === x.id}">
      <b>${x.name}</b><span class="ob-tag">${x.tag}</span><span class="ob-desc">${x.desc}</span></button>`).join('')}</div>${foot('Next')}`;
  else if (ob.step === 'exp'){
    const arcs = PROGRAMS.filter(x => x.path === ob.path);
    body = `<h2 class="ob-h" id="obTitle" tabindex="-1">How long have you been training?</h2><p class="ob-sub">We'll start you on the right arc for your level.</p>
    <div class="ob-list" role="radiogroup" aria-label="Experience">${EXPERIENCE.map(([r, t, d]) => `<button type="button" class="ob-card ob-row" role="radio" data-ob="exp" data-v="${r}" aria-checked="${ob.exp === r && !ob.pickArc}"><b>${t}</b><span class="ob-desc">${d}</span></button>`).join('')}</div>
    <div class="ob-pickd">${ob.pickArc ? `<div class="ob-list" role="radiogroup" aria-label="Arc">${arcs.map(a => `<button type="button" class="ob-card ob-row" role="radio" data-ob="arc" data-v="${a.id}" aria-checked="${ob.arcId === a.id}"><b>${emblem(a.rank, 'xs')} ${a.name}</b><span class="ob-desc">${a.rank}-Rank · ${LEVEL[a.rank]} · ${a.weeks[0].days.length} days a week</span></button>`).join('')}</div>`
      : `<div class="ob-pick"><div class="eyebrow">Your arc</div><b>${p.name}</b><span class="ob-desc">${p.rank}-Rank · ${perWeek} days a week · ${p.blurb}</span></div>`}
      <button type="button" class="wk-link" data-ob="pickArc">${ob.pickArc ? 'Choose by experience instead' : 'See all arcs'}</button></div>${foot('Next')}`;
  }
  else if (ob.step === 'maxes'){
    const u = ob.unit, lifts = obLifts();
    const row = l => { const e = ob.est && ob.est.lift === l ? ob.est : null, est = e && e.w > 0 && e.r > 0 ? Math.round(e1rm(e.w, e.r) / (u === 'kg' ? 2.5 : 5)) * (u === 'kg' ? 2.5 : 5) : 0;
      return `<div class="ob-max"><label class="f"><span>${LIFTS[l]}</span><div class="ob-maxin"><input id="obMax-${l}" data-ob-in="max:${l}" type="number" inputmode="decimal" min="1" step="any" placeholder="Your best single rep" value="${ob.maxes[l] || ''}"><b>${u}</b></div></label>
        ${e ? `<div class="ob-est"><p class="ob-desc">Enter a weight you've lifted and how many clean reps you got.</p>
          <div class="ob-estin"><label class="f"><span>Weight (${u})</span><input data-ob-in="estw" type="number" inputmode="decimal" min="1" value="${e.w || ''}" placeholder="${u === 'kg' ? 60 : 135}"></label><label class="f"><span>Reps</span><input data-ob-in="estr" type="number" inputmode="numeric" min="1" max="20" value="${e.r || ''}" placeholder="5"></label></div>
          <div class="ob-estout" aria-live="polite">${est ? `<span>Estimated max <b class="num">${fmt(est)} ${u}</b></span><button type="button" class="btn btn-ghost btn-sm" data-ob="useEst" data-v="${l}" data-w="${est}">Use it</button>` : '<span class="ob-desc">Your estimate shows here.</span>'}</div></div>`
          : `<button type="button" class="wk-link ob-left" data-ob="est" data-v="${l}">Not sure? Estimate it</button>`}</div>`; };
    body = `<h2 class="ob-h" id="obTitle" tabindex="-1">Your maxes</h2><p class="ob-sub">${p.name} sets your weights from these. Enter your best single rep, or estimate it from a recent set.</p>
      <div class="seg" role="group" aria-label="Units"><button type="button" data-ob="unit" data-v="lb" aria-pressed="${u === 'lb'}">lb</button><button type="button" data-ob="unit" data-v="kg" aria-pressed="${u === 'kg'}">kg</button></div>
      ${lifts.map(row).join('')}<p class="ob-err" id="obErr" role="alert" hidden></p>${foot('Next', 'Skip for now')}`;
  }
  else if (ob.step === 'days'){ const n = ob.days.length;
    body = `<h2 class="ob-h" id="obTitle" tabindex="-1">Your training days</h2><p class="ob-sub">${p.name} has ${perWeek} workouts a week. Pick the days you can train.</p>
      <div class="dow-pick" role="group" aria-label="Training days">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="dow" data-ob="day" data-v="${d}" aria-pressed="${ob.days.includes(d)}">${DOW[d]}</button>`).join('')}</div>
      <p class="ob-desc">${!n ? 'Pick at least one day.' : n === perWeek ? `Matches ${p.name}: ${perWeek} workouts a week.` : n > perWeek ? 'Extra days pull your next workout forward.' : 'With fewer days, each arc week takes a little longer.'} You can change these any time on the Calendar.</p>${foot('Next', 'Skip')}`; }
  else if (ob.step === 'ready'){
    const day1 = p.weeks[0].days[0];
    body = `<div class="ob-title"><canvas id="obImg" class="ob-hero" width="128" height="208" role="img" aria-label="${esc(ob.name || 'Hero')}"></canvas>
      <p class="ob-kicker">Your arc begins</p><h2 class="ob-logo ob-logo-sm" id="obTitle" tabindex="-1">${esc(ob.name || 'Hero')}</h2>
      <div class="ob-sum"><p><span>Arc</span><b>${p.name} · ${p.rank}-Rank</b></p><p><span>First workout</span><b>${day1.name}</b></p><p><span>Training days</span><b>${ob.days.length ? [1, 2, 3, 4, 5, 6, 0].filter(d => ob.days.includes(d)).map(d => DOW[d]).join(', ') : 'Any day'}</b></p></div>
      <p class="ob-lede">Every set you log earns XP. Rank up every 25 levels, and your hero transforms with you.</p>
      ${window.TA_SHOP_DATA ? `<div class="ob-cur"><p><img src="${TA_SHOP_DATA.coinIcon}" alt=""><span><b>Grind</b>Every workout and quest pays it. Spend it in the Shop on outfits, pets and more.</span></p>
        <p><img src="${TA_SHOP_DATA.gemIcon}" alt=""><span><b>Glory</b>For big wins: beating a boss the first time, ranking up and finishing an arc.</span></p></div>` : ''}</div>
      <div class="ob-foot"><button type="button" class="btn btn-power ob-primary" data-ob="finish">Start my arc</button></div>`; }
  const ep = ob.step === 'title' ? '' : `<p class="ob-ep"><b>${ob.step === 'ready' ? 'Final episode' : `Episode ${i}`}</b><span>${OB_EP[ob.step]}</span></p>`;
  page.innerHTML = head + ep + body;
  // Plays like an anime opening: a new step gets a slash wipe and its parts slide in one after another.
  // Re-renders within the same step (picking an option) stay still.
  const wel = document.getElementById('welcome'); wel.dataset.step = ob.step;
  if (ob.shown !== ob.step && !reduceMotion){
    ob.shown = ob.step; [...page.children].forEach((c, k) => c.style.setProperty('--k', k));
    page.classList.remove('ob-anim'); void page.offsetWidth; page.classList.add('ob-anim');
    const wp = wel.querySelector('.ob-wipe'); wp.classList.remove('go'); void wp.offsetWidth; wp.classList.add('go');
  } else { ob.shown = ob.step; page.classList.remove('ob-anim'); }
  // the animated hero: the chosen character at F-Rank
  const g = ob.gender;
  if (document.getElementById('obImg')) setSprite('obImg', 0, g);
  for (const gg of ['male', 'female']) if (document.getElementById('obImg-' + gg)) setSprite('obImg-' + gg, 0, gg);
}
function obFinish(){
  const p = obArc();
  S.hero.name = (ob.name || '').trim() || 'Hero'; S.hero.gender = ob.gender;
  if (S.onboarded && S.programId && S.programId !== p.id){ S.arcSaves = S.arcSaves || {}; S.arcSaves[S.programId] = {pos:clone(S.pos), schedule:clone(S.schedule)}; }   // running setup again keeps your old arc's place
  if (S.arcSaves) delete S.arcSaves[p.id];
  S.programId = p.id; S.pos = {w:0, d:0}; setSchedule(ob.days.length ? ob.days : clone(SCHED[p.weeks[0].days.length] || SCHED[3]));
  if (S.unit !== ob.unit) setUnit(ob.unit);
  const lifts = obLifts(), entered = lifts.filter(l => ob.maxes[l] > 0);
  for (const l of entered) setMax(l, Math.round(ob.maxes[l] * 10) / 10, 'Entered');
  if (entered.length) for (const l of Object.keys(LIFTS)) if (!entered.includes(l) && !S.history.some(h => h.lift === l)) S.maxEst[l] = true;   // the rest are starting guesses
  S.onboarded = true; save();
  document.getElementById('welcome').hidden = true; behind().forEach(x => x.inert = false); ob = null;
  tab = 'today'; render(true); window.scrollTo(0, 0); cheer();
  document.querySelector('[data-act=startWk]')?.focus({preventScroll:true});
  toast(`${p.name} begins. Your first workout is ready.`);
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-ob]'); if (!t || !ob) return;
  const a = t.dataset.ob, v = t.dataset.v;
  if (a === 'next' || a === 'skip'){
    if (ob.step === 'maxes' && a === 'next'){ const bad = obLifts().find(l => ob.maxes[l] !== undefined && ob.maxes[l] !== '' && !(+ob.maxes[l] > 0 && +ob.maxes[l] < 2000));
      if (bad){ const er = document.getElementById('obErr'); er.textContent = `Check your ${LIFTS[bad]}: enter a weight in ${ob.unit}.`; er.hidden = false; document.getElementById('obMax-' + bad)?.focus(); return; } }
    if (ob.step === 'maxes' && a === 'skip') ob.maxes = {};
    if (ob.step === 'days' && a === 'skip') ob.days = clone(SCHED[obArc().weeks[0].days.length] || SCHED[3]);
    return obMove(1);
  }
  if (a === 'back') return obMove(-1);
  if (a === 'finish') return obFinish();
  if (a === 'cancel'){ document.getElementById('welcome').hidden = true; behind().forEach(x => x.inert = false); ob = null; return; }
  if (a === 'restore') return document.getElementById('obRestore').click();
  if (a === 'gender'){ ob.gender = v; if (PATHS.find(x => x.id === ob.path).g !== v && ob.path !== 'home'){ ob.path = v === 'female' ? 'glute' : 'power'; ob.pickArc = false; ob.arcId = `${ob.path}-${ob.exp.toLowerCase()}`; ob.days = null; } }   // each hero starts from their own lineup
  else if (a === 'path'){ ob.path = v; ob.pickArc = false; ob.arcId = `${v}-${ob.exp.toLowerCase()}`; ob.days = null; }
  else if (a === 'exp'){ ob.exp = v; ob.pickArc = false; ob.arcId = `${ob.path}-${v.toLowerCase()}`; ob.days = null; }
  else if (a === 'pickArc') ob.pickArc = !ob.pickArc;
  else if (a === 'arc'){ ob.arcId = v; ob.days = null; }
  else if (a === 'unit') ob.unit = v;
  else if (a === 'est') ob.est = {lift:v, w:0, r:0};
  else if (a === 'useEst'){ ob.maxes[v] = +t.dataset.w; ob.est = null; }
  else if (a === 'day'){ const d = +v; ob.days = ob.days.includes(d) ? ob.days.filter(x => x !== d) : [...ob.days, d].sort(); }
  renderOb();
});
document.addEventListener('input', e => {
  if (!ob) return; const k = e.target.dataset && e.target.dataset.obIn; if (!k) return;
  if (k === 'name') ob.name = e.target.value;
  else if (k.startsWith('max:')){ ob.maxes[k.slice(4)] = e.target.value === '' ? undefined : +e.target.value; const er = document.getElementById('obErr'); if (er) er.hidden = true; }
  else if (k === 'estw' || k === 'estr'){ ob.est[k === 'estw' ? 'w' : 'r'] = +e.target.value || 0;
    // redraw only the estimate line so typing isn't interrupted
    const l = ob.est.lift, est = ob.est.w > 0 && ob.est.r > 0 ? Math.round(e1rm(ob.est.w, ob.est.r) / (ob.unit === 'kg' ? 2.5 : 5)) * (ob.unit === 'kg' ? 2.5 : 5) : 0, out = document.querySelector('.ob-estout');
    if (out) out.innerHTML = est ? `<span>Estimated max <b class="num">${fmt(est)} ${ob.unit}</b></span><button type="button" class="btn btn-ghost btn-sm" data-ob="useEst" data-v="${l}" data-w="${est}">Use it</button>` : '<span class="ob-desc">Your estimate shows here.</span>'; }
});
document.addEventListener('keydown', e => { if (ob && e.key === 'Enter' && e.target.id === 'obName'){ e.preventDefault(); obMove(1); } });
document.addEventListener('change', e => {
  if (e.target.id !== 'obRestore') return; const file = e.target.files && e.target.files[0]; e.target.value = ''; if (!file) return;
  file.text().then(text => { const r = readBackup(text); if (r.error){ toast(r.error); return; }
    S = r.s; S.onboarded = true; save(); document.getElementById('welcome').hidden = true; behind().forEach(x => x.inert = false); ob = null;
    tab = 'today'; render(true); toast(`Welcome back, ${S.hero.name || 'Hero'}: Lv ${levelFor(S.xp)}.`); }, () => toast('That file could not be read.'));
});

/* ---------- Arc builder ---------- */
// The builder edits a copy of the plan (ab.d) and only saves on Save. Text fields update the copy as you
// type without redrawing (so the keyboard stays put); taps on steppers and chips redraw the sheet.
let ab = null;
const UNIT_LABEL = {sec:'Seconds', min:'Minutes', m:'Meters', yd:'Yards'};
const KIND_LABEL = x => x.kind === 'lift' ? `% of ${LIFTS[x.lift]} max` : x.kind === 'pick' ? 'Your weight' : x.unit ? UNIT_LABEL[x.unit] : 'Bodyweight reps';
function openBuilder(draft, id){
  ab = {d:clone(draft), id:id || null, pick:null, err:'', dirty:false, cancelArmed:false};
  renderBuilder(); openDialog('arcBuilder', '#abName');
}
function newArcDraft(){ return {name:'', perWeek:3, weeks:4, wave:true, days:[1, 2, 3].map(i => ({name:`Day ${i}`, ex:[]}))}; }
function renderBuilder(){
  const d = ab.d, el = document.getElementById('abIn'), keepY = document.getElementById('arcBuilder').scrollTop;
  const chips = (act, opts, cur, label) => `<div class="opt-chips" role="group" aria-label="${label}">${opts.map(([v, t]) => `<button type="button" class="opt" data-ab="${act}" data-v="${v}" aria-pressed="${cur === v}">${t}</button>`).join('')}</div>`;
  const step = (k, label, shown) => `<div class="ab-step"><span>${label}</span><div class="ab-stepper"><button type="button" data-ab="dec" data-k="${k}" aria-label="Less: ${label}">−</button><b class="num">${shown}</b><button type="button" data-ab="inc" data-k="${k}" aria-label="More: ${label}">+</button></div></div>`;
  const exRow = (x, i, j) => `<div class="ab-ex">
      <div class="ab-ex-top"><b>${esc(x.name)}</b><span class="ab-kind">${KIND_LABEL(x)}</span>
        ${j ? `<button type="button" class="ab-icon" data-ab="up" data-k="${i}:${j}" aria-label="Move ${esc(x.name)} up">↑</button>` : ''}
        <button type="button" class="ab-icon" data-ab="del" data-k="${i}:${j}" aria-label="Remove ${esc(x.name)}">✕</button></div>
      <div class="ab-ex-ctl">${step(`sets:${i}:${j}`, 'Sets', x.sets)}${step(`reps:${i}:${j}`, x.kind === 'body' && x.unit ? UNIT_LABEL[x.unit] : 'Reps', x.reps)}${x.kind === 'lift' ? step(`pct:${i}:${j}`, '% of max', Math.round(x.pct * 100) + '%') : ''}</div></div>`;
  const picker = i => { const p = ab.pick; return `<div class="ab-pick">
      <input type="search" id="abSearch" data-ab-q placeholder="Search exercises" value="${esc(p.q)}" autocomplete="off" aria-label="Search exercises">
      ${p.q ? '' : chips('cat', EX_CATS.map(c => [c, c]), p.cat, 'Exercise type')}
      <div id="abResults">${pickResults()}</div>
      <button type="button" class="wk-link ab-close" data-ab="pickClose">Done adding</button></div>`; };
  const day = (x, i) => { const n = daySets(x);
    return `<section class="ab-day">
      <div class="ab-day-top"><input class="ab-day-name" data-ab-in="day:${i}" value="${esc(x.name)}" maxlength="24" aria-label="Day ${i + 1} name"><span class="fine num${n > CUSTOM_SET_CAP - 3 ? ' ab-near' : ''}">${n} / ${CUSTOM_SET_CAP} sets</span></div>
      ${x.ex.length ? x.ex.map((e, j) => exRow(e, i, j)).join('') : '<p class="fine">No exercises yet.</p>'}
      ${ab.pick && ab.pick.day === i ? picker(i) : `<button type="button" class="btn btn-ghost btn-sm" data-ab="pick" data-v="${i}">Add exercise</button>`}
    </section>`; };
  el.innerHTML = `<div class="row-between sheet-head"><h2 class="sec" id="abTitle">${ab.id ? 'Edit arc' : 'Create arc'}</h2>
      <div class="ab-head-btns"><button type="button" class="btn btn-ghost btn-sm" data-ab="cancel">${ab.cancelArmed ? 'Tap again to discard' : 'Cancel'}</button><button type="button" class="btn btn-power btn-sm" data-ab="save">Save</button></div></div>
    <label class="f"><span>Arc name</span><input id="abName" data-ab-in="name" value="${esc(d.name)}" maxlength="28" placeholder="Summer Shred Arc" autocomplete="off"></label>
    <div class="he-group"><h4>Days per week</h4>${chips('perWeek', [1, 2, 3, 4, 5, 6].map(n => [n, n]), d.days.length, 'Days per week')}</div>
    <div class="he-group"><h4>Length</h4>${chips('weeks', [[4, '4 weeks'], [6, '6 weeks'], [8, '8 weeks']], d.weeks, 'Length')}</div>
    <div class="he-group"><h4>Weekly wave</h4>${chips('wave', [[1, 'On'], [0, 'Off']], d.wave ? 1 : 0, 'Weekly wave')}
      <p class="fine">${d.wave ? 'Base, Build, Push, Recovery: max-based lifts get a little heavier each week, the Push week ends with a rep-out (+), and every 4th week is lighter.' : 'Every week is the same. Your picked weights still go up on their own when you hit every rep.'}</p></div>
    ${d.days.map(day).join('')}
    ${ab.err ? `<p class="ab-err" role="alert">${ab.err}</p>` : ''}
    <p class="fine">Custom arcs earn XP like a C-Rank arc (×${XP_MULT.C}), up to ${CUSTOM_SET_CAP} sets a day. The last workout is the boss: your Shadow Self. Each day starts with a short warm-up on its own.</p>
    <button type="button" class="btn btn-power" data-ab="save">Save arc</button>`;
  document.getElementById('arcBuilder').scrollTop = keepY;
}
function pickResults(){
  const p = ab.pick, q = p.q.trim().toLowerCase(), lib = exLibrary();
  const list = (q ? lib.filter(e => e.name.toLowerCase().includes(q)) : lib.filter(e => e.cat === p.cat)).slice(0, 40);
  const exact = q && lib.some(e => e.name.toLowerCase() === q);
  return `${list.map(e => `<button type="button" class="ab-res" data-ab="addEx" data-v="${esc(e.name)}"><span>${esc(e.name)}</span><small>${e.kind === 'lift' ? 'From your max' : e.kind === 'pick' ? 'Weighted' : e.unit ? UNIT_LABEL[e.unit] : 'Reps'}</small></button>`).join('') || '<p class="fine">No matches.</p>'}
    ${q && !exact ? `<div class="ab-custom"><p class="fine">Add “${esc(p.q.trim())}” as:</p><div class="opt-chips">
      <button type="button" class="opt" data-ab="addCustom" data-v="pick">Weighted</button><button type="button" class="opt" data-ab="addCustom" data-v="reps">Reps</button><button type="button" class="opt" data-ab="addCustom" data-v="sec">Timed</button></div></div>` : ''}`;
}
function abChange(){ ab.dirty = true; ab.cancelArmed = false; ab.err = ''; }
function abAdd(dayI, x){
  const day = ab.d.days[dayI];
  if (daySets(day) + x.sets > CUSTOM_SET_CAP){ x.sets = CUSTOM_SET_CAP - daySets(day); if (x.sets < 1){ toast(`That day is at ${CUSTOM_SET_CAP} sets.`); return; } }
  day.ex.push(x); abChange(); renderBuilder(); toast(`${x.name} added`);
}
function abStep(k, dir){
  const [field, i, j] = k.split(':'), day = ab.d.days[+i], x = day.ex[+j];
  if (field === 'sets'){ if (dir > 0 && daySets(day) >= CUSTOM_SET_CAP){ toast(`Up to ${CUSTOM_SET_CAP} sets a day.`); return; } x.sets = Math.min(10, Math.max(1, x.sets + dir)); }
  else if (field === 'pct') x.pct = Math.min(1, Math.max(.3, Math.round((x.pct + dir * .05) * 100) / 100));
  else { const st = x.unit === 'sec' ? 5 : x.unit === 'm' || x.unit === 'yd' ? 10 : 1, max = x.unit === 'sec' ? 600 : x.unit === 'min' ? 60 : x.unit === 'm' || x.unit === 'yd' ? 1000 : 50;
    x.reps = Math.min(max, Math.max(st, x.reps + dir * st)); }
  abChange(); renderBuilder();
}
function saveBuilder(){
  const d = ab.d; d.name = (d.name || '').trim();
  const fail = msg => { ab.err = msg; renderBuilder(); document.querySelector('.ab-err')?.scrollIntoView({block:'center'}); };
  if (!d.name) return fail('Give your arc a name.');
  const empty = d.days.findIndex(x => !x.ex.length); if (empty >= 0) return fail(`${d.days[empty].name || `Day ${empty + 1}`} needs at least one exercise.`);
  d.days.forEach((x, i) => { x.name = (x.name || '').trim() || `Day ${i + 1}`; });
  const id = ab.id || 'custom-' + Date.now().toString(36);
  const def = {id, name:d.name, perWeek:d.days.length, weeks:d.weeks, wave:!!d.wave, days:d.days};
  const at = S.customArcs.findIndex(a => a.id === id); if (at >= 0) S.customArcs[at] = def; else S.customArcs.push(def);
  if (S.programId === id){   // you edited the arc you're running: unfinished sets on it start fresh
    for (const bag of [S.done, S.amrap, S.setLog, S.ramp]) for (const k of Object.keys(bag)) if (k.startsWith(id + '|')) delete bag[k];
    if (S.pos.w >= def.weeks || S.pos.d >= def.days.length) S.pos = {w:0, d:0}; }
  save(); ab = null; closeDialog('arcBuilder'); arcPath = 'custom'; tab = 'arcs'; render(); window.scrollTo(0, 0);
  toast(at >= 0 ? `${def.name} saved.` : `${def.name} created. Start it whenever you're ready.`);
}
function cancelBuilder(){
  if (ab && ab.dirty && !ab.cancelArmed){ ab.cancelArmed = true; renderBuilder(); return; }
  ab = null; closeDialog('arcBuilder');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-ab]'); if (!t || !ab) return;
  const a = t.dataset.ab, v = t.dataset.v, d = ab.d;
  if (a === 'save') return saveBuilder();
  if (a === 'cancel') return cancelBuilder();
  ab.cancelArmed = false;
  if (a === 'perWeek'){ const n = +v; while (d.days.length < n) d.days.push({name:`Day ${d.days.length + 1}`, ex:[]}); d.days.length = n; if (ab.pick && ab.pick.day >= n) ab.pick = null; abChange(); }
  else if (a === 'weeks'){ d.weeks = +v; abChange(); }
  else if (a === 'wave'){ d.wave = v === '1'; abChange(); }
  else if (a === 'pick'){ ab.pick = {day:+v, q:'', cat:EX_CATS[0]}; renderBuilder(); document.getElementById('abSearch')?.focus({preventScroll:true}); return; }
  else if (a === 'pickClose') ab.pick = null;
  else if (a === 'cat') ab.pick.cat = v;
  else if (a === 'addEx'){ const e = exLibrary().find(x => x.name === v); if (e) abAdd(ab.pick.day, newEx(e)); return; }
  else if (a === 'addCustom'){ const name = ab.pick.q.trim().slice(0, 40); if (!name) return;
    abAdd(ab.pick.day, newEx(v === 'pick' ? {name, kind:'pick'} : {name, kind:'body', unit:v === 'sec' ? 'sec' : null})); ab.pick.q = ''; renderBuilder(); return; }
  else if (a === 'inc' || a === 'dec') return abStep(t.dataset.k, a === 'inc' ? 1 : -1);
  else if (a === 'del'){ const [i, j] = t.dataset.k.split(':').map(Number); d.days[i].ex.splice(j, 1); abChange(); }
  else if (a === 'up'){ const [i, j] = t.dataset.k.split(':').map(Number), x = d.days[i].ex; [x[j - 1], x[j]] = [x[j], x[j - 1]]; abChange(); }
  renderBuilder();
});
document.addEventListener('input', e => {
  if (!ab) return; const el = e.target;
  if (el.matches('[data-ab-q]')){ ab.pick.q = el.value; const r = document.getElementById('abResults'); if (r) r.innerHTML = pickResults(); return; }
  const k = el.dataset && el.dataset.abIn; if (!k) return;
  if (k === 'name') ab.d.name = el.value; else if (k.startsWith('day:')) ab.d.days[+k.slice(4)].name = el.value;
  ab.dirty = true;
});
let deleteArmed = null;

/* ---------- Calendar ---------- */
let calView = (() => { const n = new Date(); return {y:n.getFullYear(), m:n.getMonth()}; })();
let calSel = todayIso();

function logsByDay(){ const m = {}; for (const l of S.log) if (l.iso) (m[l.iso] = m[l.iso] || []).push(l); return m; }
// Days you moved by hand. dayMoves: a date turned into a training day ('on') or a rest day ('off'), whatever its
// weekday says. dayPins: a date holding one particular workout of the arc (its place in the arc, n).
const trainsOn = iso => { const mv = (S.dayMoves || {})[iso]; return mv ? mv === 'on' : schedOn(iso).includes(fromYmd(iso).getDay()); };
function livePins(){ const t = todayIso(), name = prog().name, out = {}; S.dayPins = S.dayPins || {}; S.dayMoves = S.dayMoves || {};
  for (const iso in S.dayPins){ const pin = S.dayPins[iso]; if (iso >= t && pin.prog === name) out[iso] = pin.n; else delete S.dayPins[iso]; }
  return out; }
// Walk forward from today and lay the arc's next workouts onto the training days. A workout you pinned to a
// date stays there; the rest fill the other training days in order.
function projectPlan(untilIso){
  const out = {}, p = prog(), pins = livePins(), done = logsByDay();
  const perWeek = p.weeks[0].days.length, total = p.weeks.length * perWeek, slots = [];
  const end = fromYmd(untilIso), d = fromYmd(todayIso());
  for (let i = 0; d <= end && i < 400; d.setDate(d.getDate() + 1), i++){
    const iso = ymd(d);
    if (!trainsOn(iso) && pins[iso] == null) continue;
    if (i === 0 && done[iso]) continue;              // today's session already cleared
    slots.push(iso);
  }
  const start = S.pos.w * perWeek + S.pos.d, free = slots.map((_, k) => (start + k) % total), pinned = {};
  for (const iso of slots){ const j = pins[iso] == null ? -1 : free.indexOf(pins[iso]); if (j >= 0){ pinned[iso] = free[j]; free.splice(j, 1); } }
  for (const iso of slots){ const n = iso in pinned ? pinned[iso] : free.shift(); if (n == null) continue;
    const w = Math.floor(n / perWeek), dd = n % perWeek; out[iso] = {w, d:dd, n, name:p.weeks[w].days[dd].name, prog:p.name}; }
  return out;
}
// Drag a planned workout to another day. Onto a free day it moves there and leaves a rest day behind;
// onto a day with a workout the two swap.
function moveWorkout(from, to){
  const p = prog(), plan = projectPlan(from > to ? from : to), a = plan[from], b = plan[to];
  if (!a || from === to) return null;
  const onBySched = iso => schedOn(iso).includes(fromYmd(iso).getDay());
  for (const iso in S.dayPins) if (S.dayPins[iso].n === a.n || (b && S.dayPins[iso].n === b.n)) delete S.dayPins[iso];
  S.dayPins[to] = {prog:p.name, n:a.n};
  if (b) S.dayPins[from] = {prog:p.name, n:b.n};
  else {
    if (onBySched(from)) S.dayMoves[from] = 'off'; else delete S.dayMoves[from];
    if (onBySched(to)) delete S.dayMoves[to]; else S.dayMoves[to] = 'on';
  }
  return {name:a.name, swapped:b && b.name};
}
// Training days change when you switch arcs or edit your week. Each change is remembered from the day it
// happened, so past days are judged by the schedule you had then and switching never breaks a streak.
function setSchedule(days){ const t = todayIso(); S.schedule = days; S.schedHist = (S.schedHist || []).filter(e => e.from < t); S.schedHist.push({from:t, days:clone(days)}); }
const schedOn = iso => { const h = S.schedHist; if (!h || !h.length) return S.schedule; let s = h[0].days; for (const e of h) if (e.from <= iso) s = e.days; return s; };
function dayStatus(iso, tIso, done, plan){
  if (done[iso]) return 'done';
  if (plan[iso]) return 'plan';
  if (trainsOn(iso) && iso < tIso && iso >= S.startedOn) return 'missed';
  return 'rest';
}
// Session streak: rest days never break it, and a streak shield forgives one missed training day each week
// (Monday to Sunday), because recovery is part of training. A second miss in the same week ends the streak.
function streakInfo(done, tIso){
  let n = 0; const d = fromYmd(tIso), shielded = new Set();
  for (let i = 0; i < 400; i++, d.setDate(d.getDate() - 1)){
    const iso = ymd(d);
    if (done[iso]) { n++; continue; }
    if (iso < S.startedOn) break;
    if (i > 0 && trainsOn(iso)){   // a missed training day (by the schedule you had then, and any day you moved); today still counts as open
      const wk = weekStart(iso); if (shielded.has(wk)) break; shielded.add(wk);
    }
  }
  return {n, ready:!shielded.has(weekStart(tIso))};
}
const streak = (done, tIso) => streakInfo(done, tIso).n;
const SHIELD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></svg>';
const shieldHTML = si => `<small class="shield${si.ready ? ' on' : ''}">${SHIELD}${si.ready ? 'Shield ready' : 'Shield used'}</small>`;
// Missed training days, and which one each week the streak shield covered: the first miss of each Monday-to-Sunday
// week (the same rule the session streak uses)
function missMap(done, tIso, fromIso, toIso){
  const out = {}, used = new Set(), d = fromYmd(weekStart(fromIso)), last = toIso < tIso ? toIso : tIso;
  for (let i = 0; i < 400; i++, d.setDate(d.getDate() + 1)){
    const iso = ymd(d); if (iso >= last) break;
    if (done[iso] || iso < S.startedOn || !trainsOn(iso)) continue;
    const wk = weekStart(iso); out[iso] = used.has(wk) ? 'missed' : (used.add(wk), 'shield');
  }
  return out;
}
const CAL_ICON = {
  done:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  boss:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m3 8 4.5 3.5L12 4l4.5 7.5L21 8l-2 11H5z"/></svg>',
  missed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"/></svg>',
  plan:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/></svg>'
};
// One day's look: done (gold when every set was cleared), a planned workout (crowned on a boss day), a miss, or a
// miss the shield covered
function calKind(iso, tIso, done, plan, miss){
  if (done[iso]) return done[iso].some(l => l.full) ? 'full' : 'done';
  if (plan[iso]) return isBoss(prog(), plan[iso].w, plan[iso].d) ? 'boss' : 'plan';
  return miss[iso] || 'rest';
}
const CAL_WORD = {full:'full clear', done:'workout done', boss:'boss day planned', plan:'workout planned', missed:'missed', shield:'missed, covered by your streak shield', rest:'rest day'};
const calGlyph = k => ({full:CAL_ICON.done, done:CAL_ICON.done, boss:CAL_ICON.boss, plan:CAL_ICON.plan, missed:CAL_ICON.missed, shield:CAL_ICON.shield})[k] || '';
const longDate = iso => fromYmd(iso).toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'});
const shortDate = iso => fromYmd(iso).toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
const volIn = l => l.vol ? l.vol * (l.unit && l.unit !== S.unit ? (S.unit === 'kg' ? 1 / 2.20462 : 2.20462) : 1) : 0;
function dayDetail(iso, tIso, done, plan, miss){
  let body = '';
  if (done[iso]) body += done[iso].map(l => { const v = Math.round(volIn(l));
    const tags = [l.full ? '<span class="dd-tag gold">Full clear</span>' : '', l.boss ? '<span class="dd-tag boss">Boss down</span>' : '', l.bossFight ? '<span class="dd-tag boss">Boss battle</span>' : ''].join('');
    return `<article class="dd-log"><div class="row-between"><b class="dd-day">${esc(l.day || 'Workout')}</b><span class="num dd-xp">+${fmt(l.xp || 0)} XP</span></div>
      <p class="fine">${esc(l.prog || '')}${l.week ? `, week ${l.week}` : ''}</p>
      <div class="dd-chips"><span class="chip">${l.sets}${l.total ? ` of ${l.total}` : ''} sets</span>${v ? `<span class="chip">${fmt(v)} ${S.unit} moved</span>` : ''}${tags}</div></article>`; }).join('');
  const prs = S.history.filter(h => h.iso === iso && h.src === 'PR');
  if (prs.length) body += `<div class="dd-prs"><span class="eyebrow">New maxes</span>${prs.map(h => `<span class="chip gold">${LIFTS[h.lift]} ${fmt(h.val)} ${h.unit || S.unit}</span>`).join('')}</div>`;
  const pl = plan[iso];
  if (pl){
    const p = prog(), day = p.weeks[pl.w].days[pl.d], boss = isBoss(p, pl.w, pl.d), ex = day.ex.filter(x => !/warm-up/i.test(x.name));
    body += `<div class="dd-block"><span class="eyebrow">${iso === tIso ? "Today's workout" : 'Planned'}${boss ? ' · boss day' : ''}</span>
      <div class="dd-name">${pl.name}</div><div class="fine">${pl.prog} · Week ${pl.w + 1}, Day ${pl.d + 1}${boss ? ` · ${bossName(p)}` : ''}</div>
      <ul class="dd-ex">${ex.slice(0, 6).map(x => `<li><span>${x.name}</span><b class="num">${x.sets.length} × ${x.sets[0].reps}${unitShort(x.sets[0].unit)}</b></li>`).join('')}${ex.length > 6 ? `<li class="fine">+${ex.length - 6} more</li>` : ''}</ul>
      ${iso === tIso ? `<button class="btn btn-power btn-sm" data-act="startWk">${boss && window.TA_BOSSES ? 'Fight the boss' : 'Start workout'}</button>` : ''}</div>`;
  } else if (!done[iso]){
    body = miss[iso] === 'shield' ? `<p class="empty">${CAL_ICON.shield}Missed, but your streak shield covered it. One miss a week won't break your streak.</p>`
      : miss[iso] ? '<p class="empty">Missed. This was a training day with no workout logged.</p>'
      : `<p class="empty">Rest day.${iso >= tIso ? ' Recovery is part of the arc.' : ''}</p>`;
  }
  return `<section class="panel cal-day"><h3>${longDate(iso)}</h3>${body}</section>`;
}
function viewCalendar(){
  const {y, m} = calView, tIso = todayIso(), done = logsByDay();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7, daysIn = new Date(y, m + 1, 0).getDate();   // weeks run Monday to Sunday, like streaks and quests
  const firstIso = ymd(new Date(y, m, 1)), lastIso = ymd(new Date(y, m, daysIn));
  const horizon = ymd(new Date(Math.max(fromYmd(lastIso), fromYmd(tIso).getTime() + 14 * 864e5)));
  const plan = projectPlan(horizon), miss = missMap(done, tIso, firstIso < weekStart(tIso) ? firstIso : weekStart(tIso), lastIso > tIso ? lastIso : tIso);
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span class="cal-cell blank" aria-hidden="true"></span>';
  for (let day = 1; day <= daysIn; day++){
    const iso = ymd(new Date(y, m, day)), k = calKind(iso, tIso, done, plan, miss);
    cells += `<button class="cal-cell k-${k}${iso === tIso ? ' is-today' : ''}${iso === calSel ? ' is-sel' : ''}" data-act="calSel" data-iso="${iso}"${dragAttr(iso, k, tIso)} aria-pressed="${iso === calSel}" aria-label="${fromYmd(iso).toLocaleDateString(undefined, {month:'long', day:'numeric'})}, ${CAL_WORD[k]}"><span class="cd num">${day}</span><span class="mk" aria-hidden="true">${calGlyph(k)}</span></button>`;
  }
  const trail = (7 - (lead + daysIn) % 7) % 7;
  for (let i = 0; i < trail; i++) cells += '<span class="cal-cell blank" aria-hidden="true"></span>';
  // This month in numbers
  const inMonth = S.log.filter(l => l.iso && l.iso >= firstIso && l.iso <= lastIso);
  const mXp = inMonth.reduce((a, l) => a + (l.xp || 0), 0), mVol = Math.round(inMonth.reduce((a, l) => a + volIn(l), 0));
  // This week at a glance, Monday to Sunday
  const ws = fromYmd(weekStart(tIso)), weekDays = Array.from({length:7}, (_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return ymd(d); });
  const wkDone = weekDays.filter(iso => done[iso]).length, goal = weekGoal(), si = streakInfo(done, tIso), wks = weekStreak();
  const monthName = new Date(y, m, 1).toLocaleDateString(undefined, {month:'long', year:'numeric'});
  const p = prog(), perWeek = p.weeks[0].days.length, n = S.schedule.length;
  const msg = !n ? 'Pick at least one day to see your planned workouts.'
    : n === perWeek ? `Matches ${p.name}: ${perWeek} workouts a week.`
    : n > perWeek ? `${p.name} has ${perWeek} workouts a week. Extra days pull the next workout forward.`
    : `${p.name} has ${perWeek} workouts a week. With fewer days, each arc week takes longer.`;
  const sel = calSel.startsWith(`${y}-${pad(m + 1)}`) ? calSel : null;
  const upNext = Object.entries(plan).filter(([iso]) => iso >= tIso).slice(0, 5);
  return `<section class="row-between"><h1 class="sec">Calendar</h1><button class="btn btn-ghost btn-sm" data-act="calToday">Today</button></section>
  <section class="panel cal-week" aria-label="This week">
    <div class="row-between"><h3>This week</h3><span class="cal-goal num${wkDone >= goal ? ' met' : ''}">${wkDone} of ${goal} workouts</span></div>
    <div class="cal-wk">${weekDays.map(iso => { const k = calKind(iso, tIso, done, plan, miss);
      return `<button class="wk-d k-${k}${iso === tIso ? ' is-today' : ''}" data-act="calSel" data-iso="${iso}"${dragAttr(iso, k, tIso)} aria-label="${longDate(iso)}, ${CAL_WORD[k]}"><span>${fromYmd(iso).toLocaleDateString(undefined, {weekday:'narrow'})}</span><i aria-hidden="true">${calGlyph(k)}</i></button>`; }).join('')}</div>
    <div class="cal-streaks"><span>${FLAME}<b class="num">${wks}</b> week${wks === 1 ? '' : 's'} in a row</span><span><b class="num">${si.n}</b> session streak</span>${shieldHTML(si)}</div>
  </section>
  <section class="cal" aria-label="${monthName}">
    <div class="cal-nav">
      <button class="icon-btn" data-act="calMove" data-dir="-1" aria-label="Previous month">‹</button>
      <h2>${monthName}</h2>
      <button class="icon-btn" data-act="calMove" data-dir="1" aria-label="Next month">›</button>
    </div>
    <div class="cal-sum"><span><b class="num">${inMonth.length}</b> workouts</span><span><b class="num">${fmt(mXp)}</b> XP</span>${mVol ? `<span><b class="num">${fmt(mVol)}</b> ${S.unit} moved</span>` : ''}</div>
    <div class="cal-grid cal-dow" aria-hidden="true">${['M','T','W','T','F','S','S'].map(d => `<span>${d}</span>`).join('')}</div>
    <div class="cal-grid cal-swipe">${cells}</div>
    <div class="legend">
      <span class="lg"><i class="sw k-done">${CAL_ICON.done}</i>Done</span>
      <span class="lg"><i class="sw k-full">${CAL_ICON.done}</i>Full clear</span>
      <span class="lg"><i class="sw k-plan">${CAL_ICON.plan}</i>Planned</span>
      <span class="lg"><i class="sw k-boss">${CAL_ICON.boss}</i>Boss day</span>
      <span class="lg"><i class="sw k-missed">${CAL_ICON.missed}</i>Missed</span>
      <span class="lg"><i class="sw k-shield">${CAL_ICON.shield}</i>Shielded</span>
    </div>
  </section>
  ${sel ? dayDetail(sel, tIso, done, plan, miss) : ''}
  ${upNext.length ? `<section class="panel"><h3>Up next</h3><ol class="up-next">${upNext.map(([iso, pl]) => { const b = isBoss(p, pl.w, pl.d);
    return `<li><button type="button" class="up-row${b ? ' boss' : ''}" data-act="calSel" data-iso="${iso}" data-month="1"><span class="up-date">${iso === tIso ? 'Today' : shortDate(iso)}</span><b>${pl.name}</b><span class="fine">Week ${pl.w + 1}, Day ${pl.d + 1}${b ? ' · boss day' : ''}</span></button></li>`; }).join('')}</ol></section>` : ''}
  <section class="panel">
    <div class="row-between"><h3>Training days</h3><span class="fine">${n} day${n === 1 ? '' : 's'}/week</span></div>
    <div class="dow-pick">${[1,2,3,4,5,6,0].map(i => `<button class="dow" data-act="sched" data-dow="${i}" aria-pressed="${S.schedule.includes(i)}">${DOW[i]}</button>`).join('')}</div>
    <p class="fine">${msg} Planned workouts shift forward if you miss a day.</p>
    <p class="fine cal-drag-tip">Press and hold a planned workout on the calendar, then drag it to the day you want. Drop it on another workout to swap them.</p>
    ${Object.keys(S.dayMoves).some(iso => iso >= tIso) || Object.keys(S.dayPins).length ? '<button class="btn btn-ghost btn-sm" data-act="calUnmove">Undo moved days</button>' : ''}
  </section>`;
}
// Planned workouts from today on can be picked up and moved
const dragAttr = (iso, k, tIso) => (k === 'plan' || k === 'boss') && iso >= tIso ? ' data-drag="1"' : '';
// Swipe the month grid left or right to change months
let calTouch = null;
document.addEventListener('touchstart', e => { const g = e.target.closest && e.target.closest('.cal-swipe'); calTouch = g && e.touches.length === 1 ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : null; }, {passive:true});
document.addEventListener('touchend', e => {
  if (!calTouch || tab !== 'calendar') return; const t = e.changedTouches[0], dx = t.clientX - calTouch.x, dy = t.clientY - calTouch.y; calTouch = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) document.querySelector(`[data-act=calMove][data-dir="${dx < 0 ? 1 : -1}"]`)?.click();
}, {passive:true});
// Press and hold a planned workout, then drag it onto another day. Moving the finger before the hold
// finishes leaves the page free to scroll or swipe months as usual.
let calDrag = null, calNoClick = false;
const dropDay = (x, y, from) => { const el = document.elementFromPoint(x, y)?.closest('[data-iso]');
  return el && el.dataset.iso >= todayIso() && !el.classList.contains('k-done') && !el.classList.contains('k-full') && el.dataset.iso !== from ? el : null; };
function calDragEnd(drop){
  const dr = calDrag; calDrag = null; clearTimeout(dr?.timer);
  if (!dr || !dr.on) return;
  dr.ghost.remove(); document.getElementById('view')?.classList.remove('cal-dragging');
  calNoClick = true; setTimeout(() => calNoClick = false, 400);   // the finger lifting isn't a tap on the day
  const to = drop && dropDay(dr.x, dr.y, dr.iso); if (!to) return;
  const r = moveWorkout(dr.iso, to.dataset.iso); if (!r) return;
  calSel = to.dataset.iso; save(); render(); buzz(20);
  toast(r.swapped ? `Swapped ${r.name} and ${r.swapped}.` : `Moved ${r.name} to ${shortDate(to.dataset.iso)}.`);
}
document.addEventListener('pointerdown', e => {
  const c = tab === 'calendar' && e.target.closest?.('[data-drag]'); if (!c || calDrag) return;
  const dr = calDrag = {iso:c.dataset.iso, el:c, x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, on:false};
  dr.timer = setTimeout(() => {
    if (calDrag !== dr) return;
    dr.on = true; calTouch = null; buzz(15);
    const plan = projectPlan(ymd(new Date(fromYmd(dr.iso).getTime() + 864e5)));
    dr.ghost = document.createElement('div'); dr.ghost.className = 'cal-ghost'; dr.ghost.textContent = plan[dr.iso]?.name || 'Workout';
    dr.ghost.style.left = dr.x + 'px'; dr.ghost.style.top = dr.y + 'px'; document.body.appendChild(dr.ghost);
    document.getElementById('view')?.classList.add('cal-dragging'); c.classList.add('is-src');
  }, 380);
});
document.addEventListener('pointermove', e => {
  const dr = calDrag; if (!dr) return; dr.x = e.clientX; dr.y = e.clientY;
  if (!dr.on){ if (Math.hypot(dr.x - dr.sx, dr.y - dr.sy) > 10) calDragEnd(false); return; }
  dr.ghost.style.left = dr.x + 'px'; dr.ghost.style.top = dr.y + 'px';
  const t = dropDay(dr.x, dr.y, dr.iso); if (t !== dr.over){ dr.over?.classList.remove('drop-ok'); t?.classList.add('drop-ok'); dr.over = t; }
});
document.addEventListener('pointerup', () => calDragEnd(true));
document.addEventListener('pointercancel', () => calDragEnd(false));
// While dragging, the page mustn't scroll under the finger, and the phone mustn't open its press-and-hold menu
document.addEventListener('touchmove', e => { if (calDrag?.on) e.preventDefault(); }, {passive:false});
document.addEventListener('contextmenu', e => { if (calDrag || e.target.closest?.('[data-drag]')) e.preventDefault(); });
document.addEventListener('click', e => { if (calNoClick){ e.stopPropagation(); e.preventDefault(); calNoClick = false; } }, true);

/* ---------- Progress ---------- */
let resetArmed = false;

/* ---------- Backup and restore ---------- */
// Progress lives only in this browser's storage. A backup is the whole save as JSON: saved as a file (through
// the viewer's download prompt inside Claude, a plain download elsewhere) or copied as a code. Restoring shows
// what the backup holds and asks first; the progress it replaces is kept so the restore can be undone.
const BACKUP_APP = 'training-arc', undoKey = () => KEY + '-before-restore';   // per profile
let backupCodeOpen = false, restorePending = null, undoAvail = false;
const backupJSON = () => JSON.stringify({app:BACKUP_APP, version:1, saved:new Date().toISOString(), data:S});
const niceDate = iso => fromYmd(iso).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
function markBackedUp(){ S.lastBackup = todayIso(); save(); if (tab === 'progress') render(); }
async function saveBackupFile(){
  const filename = `training-arc-backup-${todayIso()}.json`, data = backupJSON();
  let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch(e){}
  if (dl){
    try { await dl.save({filename, data}); markBackedUp(); toast('Backup saved. Keep the file somewhere safe.'); }
    catch(err){ const c = err && err.code;
      if (c === 'declined') toast('Backup not saved.');
      else if (c === 'rate_limited') toast('A save prompt is already open.');
      else { backupCodeOpen = true; render(); toast('Saving a file is not available here. Copy the backup code instead.'); } }
    return;
  }
  if (!window.claude){   // opened outside Claude: a normal browser download
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], {type:'application/json'})); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    markBackedUp(); toast('Backup saved. Keep the file somewhere safe.'); return;
  }
  backupCodeOpen = true; render(); toast('Saving a file is not available here. Copy the backup code instead.');
}
async function copyBackupCode(){
  backupCodeOpen = true; render();
  const box = document.getElementById('backupCodeBox');
  try { await navigator.clipboard.writeText(box.value); markBackedUp(); toast('Backup code copied. Paste it somewhere safe.'); }
  catch(e){ box.focus(); box.select(); toast('Select the code and copy it.'); }
}
// Read a backup (file or pasted code). Returns {s, saved} or {error}.
function readBackup(text){
  let o; try { o = JSON.parse(String(text).trim()); } catch(e){ return {error:'That doesn\'t look like a Training Arc backup.'}; }
  const d = o && o.app === BACKUP_APP ? o.data : o;
  if (!d || typeof d !== 'object' || !d.maxes || !Array.isArray(d.log)) return {error:'That doesn\'t look like a Training Arc backup.'};
  try { return {s:normalize(Object.assign(clone(DEFAULT), {onboarded:true}, clone(d))), saved:o.saved || null}; }
  catch(e){ return {error:'This backup is damaged and can\'t be restored.'}; }
}
function offerRestore(text){
  const r = readBackup(text); if (r.error){ toast(r.error); return; }
  restorePending = r; render(); document.querySelector('.restore-confirm')?.scrollIntoView({block:'center'});
}
function applyRestore(){
  if (!restorePending) return;
  try { localStorage.setItem(undoKey(), JSON.stringify(S)); } catch(e){}
  S = restorePending.s; restorePending = null; undoAvail = true; backupCodeOpen = false;
  save(); render(); toast(`Restored. Welcome back, ${S.hero.name || 'Hero'}: Lv ${levelFor(S.xp)}.`);
}
function undoRestore(){
  let prev = null; try { prev = localStorage.getItem(undoKey()); } catch(e){}
  if (!prev){ undoAvail = false; render(); return; }
  S = normalize(Object.assign(clone(DEFAULT), {onboarded:true}, JSON.parse(prev))); try { localStorage.removeItem(undoKey()); } catch(e){}
  undoAvail = false; save(); render(); toast('Restore undone. Your previous progress is back.');
}
// On Progress, only a nudge when a backup is due; the backup tools themselves live in Settings
function backupNudge(){
  const last = S.lastBackup, days = last ? dayNum(todayIso()) - dayNum(last) : null;
  if (!(S.log.length >= 3 && (days === null || days >= 14))) return '';
  return `<button class="backup-warn backup-nudge" data-act="openSettings">${last ? `It has been ${days} days since your last backup.` : `You have ${S.log.length} workouts and no backup yet.`} <b>Back up now ›</b></button>`;
}

/* ---------- Share card ---------- */
// A 1080x1350 image (the portrait size social apps use) of your player card or a rank-up: your character on
// your stage, name, title, rank, level, OVR and stats, with the app's name. Shared through the phone's share
// sheet when it supports files, otherwise offered as a download.
async function drawShareCard(kind){
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), r = rankFor(S.xp), lv = levelInfo(S.xp), p = prog(), g = S.hero.gender, o = ovr(p.path);
  try { await document.fonts.ready; } catch(e){}
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const rc = css(`--rank-${r.k.toLowerCase()}`) || '#ffd23f', power = css('--power') || '#ffd23f';
  // background: dark violet with speed lines and a glow behind the hero
  let bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1b1230'); bg.addColorStop(1, '#0d0a15'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = .05; x.strokeStyle = '#fff'; x.lineWidth = 10; for (let i = -H; i < W + H; i += 70){ x.beginPath(); x.moveTo(i, H); x.lineTo(i + H * .5, 0); x.stroke(); } x.restore();
  const glow = x.createRadialGradient(330, 720, 40, 330, 720, 520); glow.addColorStop(0, 'rgba(155,107,255,.45)'); glow.addColorStop(1, 'rgba(155,107,255,0)'); x.fillStyle = glow; x.fillRect(0, 0, W, H);
  // frame in the rank's color
  x.strokeStyle = rc; x.lineWidth = 14; x.strokeRect(28, 28, W - 56, H - 56);
  // header
  x.fillStyle = power; x.font = '700 34px "Barlow Condensed", sans-serif'; x.textBaseline = 'top'; x.fillText('TRAINING ARC', 80, 78);
  x.fillStyle = '#f3effb'; x.font = '96px Anton, Impact, sans-serif';
  x.fillText(kind === 'rank' ? `${r.k}-RANK!` : `LV ${lv.L}`, 78, 134);
  x.fillStyle = '#a197b8'; x.font = '600 36px "Barlow Condensed", sans-serif';
  x.fillText((kind === 'rank' ? `Ranked up to ${r.t}` : `${r.k}-Rank · ${heroTitle()}`).toUpperCase(), 82, 250);
  // the hero, pixel-perfect, standing on a floor line
  const fr = await spriteFrames(g, r.k, wornLook(g), S.hero[g].style, S.hero[g].acc);
  x.imageSmoothingEnabled = false; const sc = 3.6; x.drawImage(fr[0].bmp, 70, 1180 - 208 * sc, 128 * sc, 208 * sc);
  x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(60, 1180, 520, 6);
  // right column: name, OVR badge, stats
  const rx = 600, rw = W - 80 - rx;
  x.fillStyle = '#f3effb'; x.font = '84px Anton, Impact, sans-serif'; const name = (S.hero.name || 'Hero').toUpperCase();
  let fs = 84; while (x.measureText(name).width > rw && fs > 40){ fs -= 4; x.font = `${fs}px Anton, Impact, sans-serif`; }
  x.fillText(name, rx, 330);
  x.strokeStyle = tierColor(o); x.lineWidth = 8; x.fillStyle = 'rgba(13,10,21,.85)'; x.beginPath(); x.roundRect(rx, 450, 220, 230, 26); x.fill(); x.stroke();
  x.fillStyle = tierColor(o); x.font = '120px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText(String(o), rx + 110, 470);
  x.fillStyle = '#f3effb'; x.font = '700 34px "Barlow Condensed", sans-serif'; x.fillText(`OVR · ${POS[p.path] || 'CUS'}`, rx + 110, 618); x.textAlign = 'left';
  STAT_KEYS.forEach(([k, ab], i) => { const y = 740 + i * 92, v = statVal(k);
    x.fillStyle = '#a197b8'; x.font = '700 32px "Barlow Condensed", sans-serif'; x.fillText(ab, rx, y);
    x.fillStyle = tierColor(v); x.textAlign = 'right'; x.fillText(String(v), rx + rw, y); x.textAlign = 'left';
    x.fillStyle = '#211a2e'; x.fillRect(rx, y + 44, rw, 16); x.fillStyle = STAT_COLOR[k]; x.fillRect(rx, y + 44, rw * v / 99, 16); });
  // footer facts
  x.fillStyle = '#a197b8'; x.font = '600 32px "Barlow Condensed", sans-serif';
  x.fillText(`${S.log.length} WORKOUTS · ${Object.keys(S.ach).length} ACHIEVEMENTS · ${p.name.toUpperCase()}`, 80, 1236);
  return c;
}
async function shareCard(kind){
  const c = await drawShareCard(kind), blob = await new Promise(res => c.toBlob(res, 'image/png'));
  const filename = kind === 'rank' ? `training-arc-rank-up.png` : `training-arc-card.png`;
  // 1) the phone's share sheet, when it takes images
  try { const file = new File([blob], filename, {type:'image/png'});
    if (navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:'Training Arc', text:'My training arc'}); return; } } catch(e){ if (e && e.name === 'AbortError') return; }
  // 2) inside Claude: the download prompt
  let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch(e){}
  if (dl){ try { await dl.save({filename, data:blob}); toast('Card saved. Post it anywhere.'); } catch(err){ if (err && err.code !== 'declined') toast('Saving images is not available here.'); } return; }
  // 3) anywhere else: a plain download
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Card saved. Post it anywhere.');
}

/* ---------- Title screen (main menu) ---------- */
// Shown every time the app opens. Each scene is pixel art drawn on a small canvas (270 px wide, as tall as the
// screen's shape) with your own hero standing in it; the title and menu sit on top as real text and buttons.
// A new scene each launch, unless you pick a favorite in Settings.
let tsx = null;
const tsR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function tsRand(seed){ return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tsBands(c, W, y0, y1, cols){ const h = (y1 - y0) / cols.length; cols.forEach((col, i) => tsR(c, 0, y0 + Math.floor(i * h), W, Math.ceil(h) + 1, col)); }
function tsEllipse(c, cx, cy, rx, ry, col){ c.fillStyle = col; for (let y = -ry; y <= ry; y++){ const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1); } }
function tsOval(c, cx, cy, rx, ry, col){ c.fillStyle = col; const n = Math.max(16, Math.round((rx + ry) * 2)); for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; c.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1); } }
function tsRing(c, cx, cy, r, th, col){ c.fillStyle = col;
  for (let y = -r; y <= r; y++){ const o = Math.round(Math.sqrt(Math.max(0, r * r - y * y))), i = Math.round(Math.sqrt(Math.max(0, (r - th) ** 2 - y * y)));
    if (Math.abs(y) > r - th) c.fillRect(Math.round(cx - o), Math.round(cy + y), o * 2, 1);
    else { c.fillRect(Math.round(cx - o), Math.round(cy + y), o - i, 1); c.fillRect(Math.round(cx + i), Math.round(cy + y), o - i, 1); } } }
function tsLine(c, x0, y0, x1, y1, col, w = 1){
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); c.fillStyle = col;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (;;){ c.fillRect(x0 - (w >> 1), y0 - (w >> 1), w, w); if ((x0 === x1 && y0 === y1) || ++n > 3000) break; const e2 = 2 * e; if (e2 >= dy){ e += dy; x0 += sx; } if (e2 <= dx){ e += dx; y0 += sy; } }
}
function tsPoly(c, pts, col){
  c.fillStyle = col; const ys = pts.map(p => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++){
    const xs = [], yc = y + .5;
    for (let i = 0; i < pts.length; i++){ const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc) !== (by <= yc)) xs.push(ax + (yc - ay) * (bx - ax) / (by - ay)); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2){ const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) c.fillRect(a, y, b - a, 1); }
  }
}
function tsStars(c, W, h, t, n, seed, cols = ['#ffffff', '#8c84a8']){
  const rnd = tsRand(seed);
  for (let i = 0; i < n; i++){ const x = rnd() * W, y = rnd() * h, ph = rnd() * 6.3, big = rnd() < .15; const on = Math.sin(t * 1.6 + ph) > -.2;
    tsR(c, x, y, 1, 1, on ? cols[0] : cols[1]); if (big && on){ tsR(c, x - 1, y, 3, 1, cols[1]); tsR(c, x, y - 1, 1, 3, cols[1]); tsR(c, x, y, 1, 1, cols[0]); } }
}
function tsBirds(c, W, t, list, col){ for (const [x0, y, sp] of list){ const x = ((x0 + t * sp) % (W + 30)) - 15, f = Math.sin(t * 6 + x0) > 0 ? 1 : 0;
  tsR(c, x - 3, y - f, 1, 1, col); tsR(c, x - 2, y - 1 + f, 2, 1, col); tsR(c, x, y, 1, 1, col); tsR(c, x + 1, y - 1 + f, 2, 1, col); tsR(c, x + 3, y - f, 1, 1, col); } }

// Your hero inside a scene: the right frame for the moment, placed by the center of its body and its feet
const TS_BOUNDS = new WeakMap();
function tsBounds(fr){
  let b = TS_BOUNDS.get(fr); if (b) return b;
  const w = fr[0].bmp.width, h = fr[0].bmp.height, cv = document.createElement('canvas'), x = cv.getContext('2d', {willReadFrequently:true});
  cv.width = w; cv.height = h; b = {l:w, r:0, t:h, b:0};
  for (const f of fr){ x.clearRect(0, 0, w, h); x.drawImage(f.bmp, 0, 0); const d = x.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 20){ if (i < b.l) b.l = i; if (i > b.r) b.r = i; if (y < b.t) b.t = y; if (y > b.b) b.b = y; } }
  TS_BOUNDS.set(fr, b); return b;
}
function tsFrame(fr, t){ const tot = fr.tot || (fr.tot = fr.reduce((a, f) => a + f.delay, 0)) || 1; let m = (t * 1000) % tot; for (const f of fr) if ((m -= f.delay) < 0) return f.bmp; return fr[0].bmp; }
let tsTmpCv = null;
// Layers that never change for a given size are drawn once and kept
const TS_CACHE = new Map();
function tsCache(key, W, H, fn){
  const k = `${key}|${W}x${H}`; let cv = TS_CACHE.get(k);
  if (!cv){ if (TS_CACHE.size > 16) TS_CACHE.clear(); cv = document.createElement("canvas"); cv.width = W; cv.height = H; fn(cv.getContext("2d")); TS_CACHE.set(k, cv); }
  return cv;
}
function tsHero(c, fr, t, x, feet, o = {}){
  if (!fr) return null;
  const b = tsBounds(fr); let src = tsFrame(fr, t);
  const dx = Math.round(x - (b.l + b.r + 1) / 2), dy = Math.round(feet - b.b - 1);
  if (o.tint){
    const cv = tsTmpCv || (tsTmpCv = document.createElement('canvas')); cv.width = src.width; cv.height = src.height;
    const x2 = cv.getContext('2d'); x2.drawImage(src, 0, 0); x2.globalCompositeOperation = 'source-atop'; x2.fillStyle = o.tint; x2.fillRect(0, 0, cv.width, cv.height); x2.globalCompositeOperation = 'source-over'; src = cv;
  }
  c.globalAlpha = o.alpha == null ? 1 : o.alpha;
  if (o.reflect){ for (let r = b.t; r <= b.b; r++){ const off = Math.round(Math.sin(t * 3 + r * .35) * 1.5); c.drawImage(src, 0, r, src.width, 1, dx + off, feet + (b.b - r), src.width, 1); } }
  else c.drawImage(src, dx, dy);
  c.globalAlpha = 1;
  return {dx, dy, b};
}

const TS_ICON = {
  train:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  arcs:'<path d="m12 2 10 5-10 5L2 7zm-7.6 8.8L12 14.6l7.6-3.8L22 12l-10 5-10-5zm0 5L12 19.6l7.6-3.8L22 17l-10 5-10-5z"/>',
  hero:'<circle cx="12" cy="6.5" r="4"/><path d="M4 22c0-5 3.6-8.5 8-8.5s8 3.5 8 8.5z"/>',
  stats:'<path d="M3 21h18v-2H3zm2-4h3V9H5zm5.5 0h3V4h-3zM16 17h3v-6h-3z"/>'
};
const TS_MENU = [['train', 'Train'], ['arcs', 'Arcs'], ['hero', 'Hero'], ['stats', 'Stats']];
function tsMenu(kind, top){
  const inner = ([k, l]) => kind === 'squares' ? `<i><svg viewBox="0 0 24 24" aria-hidden="true">${TS_ICON[k]}</svg></i><span>${l}</span>`
    : kind === 'rings' ? `<i aria-hidden="true">${l[0]}</i><span>${l}</span>` : `<span>${l}</span>`;
  return `<nav class="ts-menu ts-${kind}" style="top:${top}%" aria-label="Main menu">${TS_MENU.map(m => `<button type="button" data-ts="${m[0]}">${inner(m)}</button>`).join('')}</nav>`;
}
const tsTitle = (top, one, cls = '') => `<h1 class="ts-title${one ? ' one' : ''} ${cls}" style="top:${top}%"><span class="ts-o a">Training</span>${one ? ' ' : ''}<span class="ts-o b">Arc</span></h1>`;
const tsStart = (top, text = 'Press start', cls = 'ts-blink') => `<button type="button" class="ts-start ts-o ${cls}" data-ts="start" style="top:${top}%">${text}</button>`;
const tsQuiet = () => `<button type="button" class="sr-only" data-ts="start">Start</button>`;

const TITLE_SCENES = [
  {id:'spot', name:'Spotlight', edge:'#100d19',
    draw(c, W, H, t){
      const F = Math.round(H * .84);
      tsBands(c, W, 0, H, ['#0f0c18', '#120f1c', '#151120', '#181424', '#1b1628', '#1d182b']);
      tsStars(c, W, H * .78, t, 46, 7);
      for (let y = 0; y <= F + 6; y++){ const k = y / (F + 6), l = W * (.40 - .30 * k), r = W * (.60 + .30 * k); tsR(c, l, y, r - l, 1, 'rgba(255,248,230,.075)'); const l2 = W * (.46 - .2 * k), r2 = W * (.54 + .2 * k); tsR(c, l2, y, r2 - l2, 1, 'rgba(255,248,230,.035)'); }
      const rnd = tsRand(3); for (let i = 0; i < 14; i++){ const x = W * (.3 + rnd() * .4), sp = 6 + rnd() * 8, y = F - ((rnd() * F + t * sp) % (F * .9)); tsR(c, x + Math.sin(t + i) * 3, y, 1, 1, 'rgba(255,240,210,.5)'); }
      tsEllipse(c, W / 2, F + 3, W * .40, 15, '#2b2445'); tsEllipse(c, W / 2, F + 3, W * .31, 11, '#3a3160'); tsEllipse(c, W / 2, F + 3, W * .21, 7, '#4b4077');
      tsHero(c, tsx.hero, t, W / 2, F);
    },
    ui:() => tsTitle(8, false) + tsStart(91)},
  {id:'city', name:'City sunset', edge:'#211a2d',
    draw(c, W, H, t){
      const G = Math.round(H * .70);
      tsBands(c, W, 0, G, ['#3c2b5a', '#46305f', '#523665', '#5f3c69', '#6d436b', '#7c4a6c', '#8c526b', '#9d5b69', '#ad6566', '#bd6f62', '#cb7b5e', '#d6885b']);
      tsBirds(c, W, t, [[40, H * .23, 5], [70, H * .21, 4], [190, H * .27, 6]], '#3a2747');
      const sx = W * .72, sy = H * .41; tsEllipse(c, sx, sy, 46, 46, '#d98a62'); tsEllipse(c, sx, sy, 37, 37, '#f0a868'); tsEllipse(c, sx, sy, 31, 31, '#f7bf78');
      const rnd = tsRand(11); let x = -4; while (x < W){ const w = 16 + Math.floor(rnd() * 18), top = H * (.45 + rnd() * .1); tsR(c, x, top, w, G - top, '#4f3a66'); x += w + 2; }
      const rn2 = tsRand(29); x = -6;
      while (x < W){ const w = 22 + Math.floor(rn2() * 22), top = H * (.52 + rn2() * .1); tsR(c, x, top, w, G - top, '#2b2041'); tsR(c, x, top, w, 2, '#3a2c52');
        for (let wy = top + 6; wy < G - 6; wy += 9) for (let wx = x + 4; wx < x + w - 4; wx += 7){ const lit = rn2() > .42; if (lit) tsR(c, wx, wy, 3, 4, Math.sin(t * .5 + wx * 3 + wy) > .97 ? '#8a6a40' : '#f4c76a'); }
        x += w + 3; }
      tsR(c, 0, G, W, 3, '#4b3a63'); tsR(c, 0, G + 3, W, H - G, '#221a2f');
      tsHero(c, tsx.hero, t, W / 2, G + 4);
    },
    ui:() => tsTitle(7, true) + `<p class="ts-sub" style="top:16.5%">tap to begin</p>` + tsMenu('squares', 82) + tsQuiet()},
  {id:'arcade', name:'Arcade', edge:'#040405',
    draw(c, W, H, t){
      tsR(c, 0, 0, W, H, '#050507'); tsEllipse(c, W / 2, H * .42, W * .5, H * .32, '#09090d');
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .64));
      for (let y = 0; y < H; y += 2) tsR(c, 0, y, W, 1, 'rgba(0,0,0,.3)');
    },
    ui(d){ const m = k => d.maxes ? `${fmt(d.maxes[k])}` : '---';
      return tsTitle(5.5, false) + tsStart(70, 'Insert coin') + `<div class="ts-hs" style="top:76.5%"><p class="ts-hs-h">- High scores -</p>
        <p><span>Squat</span><b>${m('squat')}</b></p><p><span>Bench</span><b>${m('bench')}</b></p><p><span>Deadlift</span><b>${m('deadlift')}</b></p><p><span>Streak</span><b>${d.wk}W</b></p></div>`; }},
  {id:'gold', name:'Golden aura', edge:'#120d08',
    draw(c, W, H, t){
      const F = Math.round(H * .74), cx = W / 2, cy = F - 96;
      tsBands(c, W, 0, H, ['#07060c', '#0a080e', '#0e0b0f', '#130e10', '#18120f', '#1d150f', '#22180f', '#271b10', '#2a1d10']);
      const p = (t % 2.4) / 2.4; c.globalAlpha = .55 * (1 - p); tsRing(c, cx, cy, Math.round(56 + p * 90), 1, '#f2c55a'); c.globalAlpha = 1;
      tsRing(c, cx, cy, 72, 2, '#6c5222'); tsRing(c, cx, cy, 104, 2, '#6c5222'); tsRing(c, cx, cy, 130, 2, '#57421b');
      for (let i = 0; i < 8; i++){ const a = i * Math.PI / 4 + t * .12; tsLine(c, cx + Math.cos(a) * 58, cy + Math.sin(a) * 58, cx + Math.cos(a) * 146, cy + Math.sin(a) * 146, '#cfa94f'); }
      tsHero(c, tsx.hero, t, cx, F);
    },
    ui:() => tsTitle(7.5, true) + tsMenu('rings', 79.5) + tsStart(93.5)},
  {id:'dojo', name:'Dojo', edge:'#3b2418',
    draw(c, W, H, t){
      const FY = Math.round(H * .70);
      tsR(c, 0, 0, W, FY, '#ead9b8');
      for (let y = Math.round(H * .06); y < FY; y += 22) tsR(c, 0, y, W, 1, '#cdb791');
      for (let x = 11; x < W; x += 22) tsR(c, x, H * .05, 1, FY - H * .05, '#cdb791');
      for (let x = 0; x <= W; x += 45) tsR(c, x - 2, 0, 5, FY, '#4e3122');
      tsR(c, 0, 0, W, H * .05, '#3b2418'); tsR(c, 0, FY - 14, W, 14, '#5a3a26'); tsR(c, 0, FY - 14, W, 2, '#3b2418');
      tsR(c, W * .23, H * .035, W * .54, 5, '#3b2418'); tsR(c, W * .25, H * .035 + 5, W * .50, H * .19, '#f2e7cd'); tsR(c, W * .25, H * .035 + 5, 2, H * .19, '#d9c9a6'); tsR(c, W * .23, H * .035 + 5 + H * .19, W * .54, 5, '#3b2418');
      for (const lx of [W * .19, W * .81]){ const ly = H * .32, fl = .22 + Math.sin(t * 7 + lx) * .03 + Math.sin(t * 13) * .02;
        tsLine(c, lx, H * .05, lx, ly - 13, '#3b2418'); tsEllipse(c, lx, ly, 24, 24, `rgba(255,196,120,${fl.toFixed(3)})`); tsEllipse(c, lx, ly, 9, 13, '#e4582f'); tsEllipse(c, lx - 2, ly - 2, 4, 8, '#f07a45'); tsR(c, lx - 6, ly - 14, 12, 3, '#5a2a1a'); tsR(c, lx - 6, ly + 12, 12, 3, '#5a2a1a'); }
      const bx = W * .045, sw = Math.round(Math.sin(t * 1.3) * 1.2); tsLine(c, bx + 12, H * .05, bx + 12 + sw, H * .27, '#555a63'); tsR(c, bx + sw, H * .27, 25, H * .25, '#9d2330'); tsR(c, bx + sw + 18, H * .27, 7, H * .25, '#7a1824'); tsR(c, bx + sw, H * .32, 25, 4, '#5e1520'); tsR(c, bx + sw, H * .27, 25, 3, '#5e1520');
      tsR(c, W * .855, H * .45, 4, FY - H * .45, '#5c606e'); tsR(c, W * .95, H * .45, 4, FY - H * .45, '#5c606e'); tsR(c, W * .80, H * .51, W * .2, 3, '#a3a8b4'); tsR(c, W * .84, H * .505, 3, 5, '#2d2f36');
      tsR(c, 0, FY, W, H - FY, '#8b5a35');
      for (let y = FY + 13, row = 0; y < H; y += 13, row++){ tsR(c, 0, y, W, 2, '#6c4227'); for (let x = (row % 2) * 30; x < W; x += 60) tsR(c, x, y - 11, 2, 11, '#74482a'); }
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .80));
    },
    ui:() => tsTitle(6.4, false, 'flat') + tsMenu('planks', 84) + tsStart(93.6)},
  {id:'manga', name:'Manga panels', edge:'#f4f3ee',
    draw(c, W, H, t){
      // The panels and the speed lines barely change, so they're drawn once and reused (three speed-line variants flicker)
      const cx = W / 2, cy = H * .53, pC = [6, H * .26, W - 12, H * .545], pD = [6, H * .825, W - 12, H * .175 - 6];
      c.drawImage(tsCache('manga-base', W, H, c => {
        tsR(c, 0, 0, W, H, '#f4f3ee');
        const rnd = tsRand(5); for (let i = 0; i < 46; i++){ const a = rnd() * Math.PI * 2; tsLine(c, cx + Math.cos(a) * 160, cy + Math.sin(a) * 160, cx + Math.cos(a) * 340, cy + Math.sin(a) * 340, '#222'); }
        const box = (x, y, w, h) => { tsR(c, x, y, w, h, '#fbfbf8'); tsR(c, x, y, w, 3, '#111'); tsR(c, x, y + h - 3, w, 3, '#111'); tsR(c, x, y, 3, h, '#111'); tsR(c, x + w - 3, y, 3, h, '#111'); };
        box(6, 6, W / 2 - 9, H * .24); box(W / 2 + 3, 6, W / 2 - 9, H * .24); box(...pC); box(...pD);
        c.save(); c.beginPath(); c.rect(pD[0] + 3, pD[1] + 3, pD[2] - 6, pD[3] - 6); c.clip();
        for (let y = pD[1] + 4; y < pD[1] + pD[3]; y += 4) for (let x = pD[0] + 4 + (y % 8 ? 2 : 0); x < pD[0] + pD[2]; x += 4) tsR(c, x, y, 1, 1, '#9a9a9a');
        const bx = W / 2, by = pD[1] + pD[3] / 2, pts = [];
        for (let i = 0; i < 28; i++){ const a = i / 28 * Math.PI * 2, r = i % 2 ? .55 : 1; pts.push([bx + Math.cos(a) * 92 * r, by + Math.sin(a) * pD[3] * .48 * r]); }
        tsPoly(c, pts, '#111'); tsPoly(c, pts.map(([x, y]) => [bx + (x - bx) * .94, by + (y - by) * .86]), '#fbfbf8'); c.restore();
      }), 0, 0);
      const v = Math.floor(t * 5) % 3;
      c.drawImage(tsCache('manga-lines' + v, W, H, c => {
        c.beginPath(); c.rect(pC[0] + 3, pC[1] + 3, pC[2] - 6, pC[3] - 6); c.clip();
        const rnd = tsRand(v + 1); for (let i = 0; i < 90; i++){ const a = rnd() * Math.PI * 2, r0 = 70 + rnd() * 40; tsLine(c, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * 260, cy + Math.sin(a) * 260, rnd() < .3 ? '#999' : '#1a1a1a'); }
      }), 0, 0);
      tsHero(c, tsx.hero, t, cx, Math.round(pC[1] + pC[3] - 22));
    },
    ui:d => tsTitle(6.2, false, 'flat') + `<div class="ts-vol" style="top:5.4%"><p>Vol. ${d.ri + 1}</p><p>Rank ${d.r.k}</p><p class="dim">Lv ${d.L}</p></div>` + tsStart(88.4, 'Press start!', 'ts-blink ts-ink')},
  {id:'gate', name:'Rank gate', edge:'#17141f',
    draw(c, W, H, t){
      const top = H * .22, R = W * .44, cx = W / 2, cy = top + R, FL = Math.round(H * .86);
      tsBands(c, W, 0, H, ['#16131e', '#18151f', '#1b1723', '#1e1a27', '#211d2b', '#24202f', '#27223a', '#2b2542']);
      tsEllipse(c, cx, cy, R + 6, R + 6, '#1a1724'); tsR(c, cx - R - 6, cy, 2 * R + 12, FL - cy, '#1a1724');
      tsEllipse(c, cx, cy, R, R, '#2c2740'); tsR(c, cx - R, cy, 2 * R, FL - cy, '#2c2740');
      const d0 = H * .50; tsR(c, W * .17, d0, W * .66, FL - d0, '#3a3552'); for (let y = d0 + 18; y < FL; y += 22) tsR(c, W * .19, y, W * .62, 2, '#4b4566'); tsR(c, W / 2 - 1, d0, 2, FL - d0, '#221e34'); tsR(c, W * .17, d0, W * .66, 3, '#4f4970');
      tsR(c, 0, FL, W, H - FL, '#231e33'); tsR(c, 0, FL, W, 2, '#352f4c');
      const cur = tsx.ri, rr = R - 26;
      RANKS.forEach((rk, i) => { const a = Math.PI - i * Math.PI / 8, x = cx + Math.cos(a) * rr, y = cy - Math.sin(a) * rr;
        if (i === cur){ tsEllipse(c, x, y, 17, 17, `rgba(242,201,76,${(.28 + Math.sin(t * 3) * .1).toFixed(3)})`); tsEllipse(c, x, y, 13, 13, '#f2c94c'); }
        else if (i < cur) tsEllipse(c, x, y, 12, 12, '#7a68ae');
        else { tsEllipse(c, x, y, 12, 12, '#55506e'); tsEllipse(c, x, y, 10, 10, '#2c2740'); }
        c.fillStyle = i === cur ? '#2a1d05' : i < cur ? '#f1edff' : '#6c6787'; c.font = `${rk.k.length > 2 ? 11 : rk.k.length > 1 ? 13 : 16}px "Jersey 10", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(rk.k, Math.round(x), Math.round(y) + 1); });
      for (const tx of [W * .055, W * .945]){ const ty = H * .62, fl = Math.sin(t * 9 + tx) * 1.2;
        tsEllipse(c, tx, ty - 6, 20, 20, `rgba(255,150,60,${(.18 + Math.sin(t * 11 + tx) * .04).toFixed(3)})`); tsR(c, tx - 2, ty, 4, 26, '#6b4a2c');
        tsEllipse(c, tx + fl * .5, ty - 6, 5, 9, '#ff8a2a'); tsEllipse(c, tx + fl, ty - 4, 3, 6, '#ffd36e'); }
      tsHero(c, tsx.hero, t, cx, FL);
    },
    ui:d => tsTitle(3.6, true) + `<p class="ts-rk ts-o" style="top:88.3%">${d.r.k} Rank · ${esc(d.r.t)}</p>` + tsStart(92.8)},
  {id:'select', name:'Hero select', edge:'#1a1c30',
    draw(c, W, H, t){
      tsBands(c, W, 0, H, ['#171a30', '#191b32', '#1c1c35', '#1f1d38', '#221e3a', '#251f3c', '#28203e', '#2b2140']);
      const F = Math.round(H * .50);
      [['male', W * .27], ['female', W * .73]].forEach(([g, x]) => { const on = tsx.sel === g;
        if (on){ const L = x - W * .235, T = H * .115, w = W * .47, h = H * .465; tsR(c, L, T, w, 2, '#4b8fe6'); tsR(c, L, T + h - 2, w, 2, '#4b8fe6'); tsR(c, L, T, 2, h, '#4b8fe6'); tsR(c, L + w - 2, T, 2, h, '#4b8fe6'); }
        tsEllipse(c, x, F + 3, 46, 11, on ? '#3d73d6' : '#3b3a4d'); tsEllipse(c, x, F + 3, 38, 7, on ? '#1e3670' : '#262534');
        tsHero(c, tsx.both && tsx.both[g], t, x, F, {alpha:on ? 1 : .55}); });
    },
    ui(d){ const lab = g => `<button type="button" class="ts-pick" data-ts="pick" data-g="${g}" aria-pressed="${d.g === g}" style="left:${g === 'male' ? 3 : 52}%"><span>${GENDERS[g].label}</span></button>`;
      return `<h1 class="ts-title one ts-o" style="top:2.4%"><span class="a">Training Arc</span></h1><p class="ts-sub ts-o" style="top:8.6%">Choose your hero</p>` + lab('male') + lab('female') +
        `<div class="ts-panel" style="top:62.5%"><p><span>Rank</span><b>${d.r.k} · ${esc(d.r.t)}</b></p><p><span>Streak</span><b>${d.wk} ${d.wk === 1 ? 'week' : 'weeks'}</b></p><p><span>Workouts</span><b>${d.logs}</b></p>
        <p><span>Next rank</span><b>${d.n ? `${d.n.k} · ${d.pct}%` : 'Max'}</b></p><i><em style="width:${d.pct}%"></em></i></div><button type="button" class="ts-go" data-ts="select" style="top:89.6%">Select</button>`; }},
  {id:'track', name:'Track', edge:'#c4553b',
    draw(c, W, H, t){
      const HZ = Math.round(H * .52);
      tsBands(c, W, 0, HZ, ['#f5a271', '#f6aa77', '#f7b27d', '#f8ba84', '#f9c28c', '#fac994', '#fbd09c', '#fcd6a4']);
      tsEllipse(c, W / 2, HZ, 46, 46, '#fbcf98'); tsEllipse(c, W / 2, HZ, 35, 35, '#fde3b4');
      for (const [x0, y, s] of [[20, H * .30, 3], [120, H * .29, 2], [210, H * .31, 2.5], [300, H * .30, 3]]){ const x = ((x0 + t * s) % (W + 80)) - 40; tsEllipse(c, x, y, 26, 6, '#fbdcc0'); tsEllipse(c, x - 6, y - 4, 12, 5, '#fde8d4'); tsEllipse(c, x + 8, y - 3, 10, 4, '#fde8d4'); }
      tsBirds(c, W, t, [[60, H * .24, 4], [150, H * .2, 5], [230, H * .26, 3]], '#9c5a40');
      const pts = [[0, HZ]]; for (let x = 0, i = 0; x <= W + 18; x += 18, i++) pts.push([x, HZ - (i % 2 ? 14 : 6)]); pts.push([W, HZ]); tsPoly(c, pts, '#6e997c'); tsR(c, 0, HZ - 3, W, 3, '#5d876b');
      tsR(c, 0, HZ, W, H - HZ, '#c4553b');
      const vx = W / 2, vy = HZ - 60;
      for (let k = -7; k <= 7; k++){ const bx = W / 2 + k * 44; for (let y = HZ; y < H; y++){ const x = vx + (bx - vx) * (y - vy) / (H - vy); tsR(c, x, y, y > H * .8 ? 2 : 1, 1, '#f5e9df'); } }
      const sl = Math.round(H * .855); for (let x = 0; x < W; x += 12) tsR(c, x, sl, 7, 4, '#f7efe6'); tsR(c, 0, sl + 6, W, 2, '#f7efe6');
      tsHero(c, tsx.hero, t, W / 2, sl + 2);
    },
    ui:() => tsTitle(8.5, false) + tsStart(93, 'On your mark', 'ts-pill')},
  {id:'neon', name:'Neon rain', edge:'#120e1c',
    draw(c, W, H, t){
      const FY = Math.round(H * .70);
      tsR(c, 0, 0, W, FY, '#1b1428'); for (let x = 4; x < W; x += 32) tsR(c, x, H * .36, 16, FY - H * .36, '#21192f'); tsR(c, 0, 0, W, H * .06, '#160f21');
      tsR(c, 0, FY, W, H - FY, '#110d1a'); tsR(c, 0, FY, W, 2, '#2a2140');
      tsR(c, W * .15, FY + 8, W * .25, H * .17, 'rgba(80,130,220,.16)'); tsR(c, W * .60, FY + 8, W * .26, H * .17, 'rgba(210,80,190,.14)');
      tsHero(c, tsx.hero, t, W / 2, FY, {reflect:true, alpha:.3});
      tsHero(c, tsx.hero, t, W / 2, FY);
      const rnd = tsRand(17); for (let i = 0; i < 6; i++){ const x = W * (.1 + rnd() * .8), y = FY + 8 + rnd() * (H - FY - 14), ph = rnd(), p = ((t / 1.6) + ph) % 1; c.globalAlpha = 1 - p; tsOval(c, x, y, 3 + p * 12, 1 + p * 3, '#7d79a8'); c.globalAlpha = 1; }
      const r2 = tsRand(23); for (let i = 0; i < 90; i++){ const x0 = r2() * (W + 60), sp = 210 + r2() * 90, y = ((r2() * H + t * sp) % (H + 20)) - 10, x = ((x0 - y * .18) % (W + 40) + W + 40) % (W + 40) - 20;
        c.globalAlpha = .55; tsR(c, x, y, 1, 4, '#8f8ad8'); tsR(c, x - 1, y + 4, 1, 4, '#8f8ad8'); c.globalAlpha = 1; }
    },
    ui:() => tsTitle(5.5, false) + `<p class="ts-sign cy ts-flick" style="top:27.2%;left:9%">Open 24/7</p><p class="ts-sign pk" style="top:27.2%;right:8%">No days off</p>` + tsStart(93)},
  {id:'peak', name:'Summit', edge:'#1b2140',
    draw(c, W, H, t){
      const F = Math.round(H * .80);
      tsBands(c, W, 0, H, ['#1b2140', '#232745', '#2d2c4c', '#383252', '#443856', '#523f5b', '#61465e', '#714e61', '#835764', '#966066', '#a96a69', '#bb756b', '#cc826e', '#da9071', '#e6a076', '#efb07c']);
      tsStars(c, W, H * .4, t, 40, 41, ['#fff4e0', '#8a7f9e']);
      tsPoly(c, [[-W * .05, H * .70], [W * .22, H * .52], [W * .52, H * .70]], '#4a4470'); tsPoly(c, [[W * .38, H * .70], [W * .68, H * .46], [W * 1.05, H * .70]], '#544c7a');
      tsPoly(c, [[W * .62, H * .52], [W * .68, H * .46], [W * .74, H * .52], [W * .70, H * .51], [W * .68, H * .53], [W * .65, H * .51]], '#d9d1e6');
      for (let x = 0; x < W; x++){ const a = H * .635 + Math.sin(x * .07 + t * .4) * 3 + Math.sin(x * .19) * 1.5, b = H * .672 + Math.sin(x * .09 - t * .3) * 3;
        tsR(c, x, a, 1, H * .74 - a, '#d6cbe0'); tsR(c, x, b, 1, H * .74 - b, '#f1eaf2'); }
      tsPoly(c, [[-10, H + 2], [W / 2 - 22, F + 1], [W / 2 + 22, F + 1], [W + 10, H + 2]], '#3b3450');
      tsPoly(c, [[W / 2 - 22, F + 1], [W / 2 + 22, F + 1], [W / 2 + 40, F + 24], [W / 2 + 27, F + 19], [W / 2 + 15, F + 27], [W / 2 + 3, F + 20], [W / 2 - 10, F + 28], [W / 2 - 24, F + 21], [W / 2 - 40, F + 25]], '#e6e1ef');
      const px = W / 2 + 34; tsR(c, px, F - 40, 2, 44, '#5b4a3a'); for (let i = 0; i < 16; i++) tsR(c, px + 2 + i, F - 40 + Math.sin(t * 6 - i * .5) * 1.6 * (i / 16), 1, 10, i > 13 ? '#b8322c' : '#d8433b');
      tsHero(c, tsx.hero, t, W / 2, F + 2);
    },
    ui:() => tsTitle(9, false) + tsStart(92)},
  {id:'falls', name:'Waterfall', edge:'#2a2d31',
    draw(c, W, H, t){
      const PY = Math.round(H * .76), L = Math.round(W * .26), Rr = Math.round(W * .74);
      tsR(c, 0, 0, L, PY, '#383b3f'); tsR(c, Rr, 0, W - Rr, PY, '#383b3f');
      for (let y = 10; y < PY; y += 16){ tsR(c, 0, y, L, 2, '#2f3236'); tsR(c, Rr, y + 8, W - Rr, 2, '#2f3236'); }
      tsR(c, L - 3, 0, 3, PY, '#26292c'); tsR(c, Rr, 0, 3, PY, '#26292c');
      for (const [vx, y0, len] of [[W * .21, H * .30, H * .13], [W * .79, H * .20, H * .18], [W * .80, H * .55, H * .07], [W * .22, H * .5, H * .06]]){ tsR(c, vx, y0, 1, len, '#3f8a4a'); for (let y = y0 + 4; y < y0 + len; y += 7) tsR(c, vx + (y % 14 ? -1 : 1), y, 2, 2, '#59a862'); tsR(c, vx - 1, y0 + len, 3, 3, '#59a862'); }
      tsR(c, L, 0, Rr - L, PY, '#d3ecf3');
      const rnd = tsRand(31); for (let i = 0; i < 70; i++){ const x = L + 2 + rnd() * (Rr - L - 4), len = 8 + rnd() * 18, sp = 110 + rnd() * 70, y = ((rnd() * PY + t * sp) % (PY + len)) - len; tsR(c, x, y, 1, len, rnd() < .5 ? '#ffffff' : '#9fd2e4'); }
      tsBands(c, W, PY, H, ['#2c6c7b', '#286574', '#265f6e', '#235867', '#205161']);
      tsR(c, 0, PY, W, 2, '#d8eef3');
      for (let i = 0; i < 4; i++){ const p = ((t / 2.2) + i / 4) % 1; c.globalAlpha = (1 - p) * .9; tsOval(c, W / 2, H * .875, 24 + p * 70, 4 + p * 12, '#86c0cc'); c.globalAlpha = 1; }
      tsEllipse(c, W / 2, H * .875, 44, 7, '#21404a');
      for (const [x0, s] of [[W * .32, 1], [W * .68, -1], [W * .5, 1]]){ const x = x0 + Math.sin(t * .6 * s) * 8; tsEllipse(c, x, PY - 2, 34, 9, 'rgba(240,248,250,.32)'); tsEllipse(c, x + 10 * s, PY + 4, 26, 7, 'rgba(240,248,250,.22)'); }
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .872));
    },
    ui:() => tsTitle(9.5, false) + tsStart(93)},
  {id:'vs', name:'You vs past you', edge:'#2c3e8f',
    draw(c, W, H, t){
      const ys = x => H * .63 - (x / W) * H * .22;
      tsR(c, 0, 0, W, H, '#2c3e8f'); tsPoly(c, [[0, ys(0)], [W, ys(W)], [W, H], [0, H]], '#8a1f33');
      for (let y = 0; y < H; y += 6) tsR(c, 0, y, W, 1, 'rgba(255,255,255,.05)');
      tsHero(c, tsx.past, t + .4, W * .68, Math.round(H * .935), {tint:'rgba(36,6,14,.82)'});
      tsHero(c, tsx.hero, t, W * .29, Math.round(H * .41));
      const pts = []; for (let x = -10, i = 0; x <= W + 20; x += 26, i++) pts.push([x, ys(x) + (i % 2 ? -9 : 7)]);
      for (let i = 0; i + 1 < pts.length; i++){ tsLine(c, pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, '#1b1630', 4); tsLine(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#ffffff', 3); }
    },
    ui:d => `<h1 class="ts-title one ts-o" style="top:1.6%"><span class="a">Training Arc</span></h1><p class="ts-you ts-o" style="top:10%">You</p><p class="ts-vs ts-o" style="top:43.5%" aria-hidden="true">VS</p><p class="ts-past ts-o" style="top:59.5%">Past you</p>${d.rv.any ? `<p class="ts-score ts-o" style="top:66.5%">This month ${d.rv.w}–${d.rv.l}</p>` : ""}` + tsStart(94)},
  {id:'notes', name:'Notebook', edge:'#f8f4e6',
    draw(c, W, H, t){
      tsR(c, 0, 0, W, H, '#f8f4e6');
      for (let y = 38; y < H; y += 16) tsR(c, 0, y, W, 1, '#b8cde5');
      tsR(c, W * .115, 0, 1, H, '#e38787'); tsR(c, W * .115 + 2, 0, 1, H, '#efb3b3');
      for (let y = 34; y < H; y += 64){ tsEllipse(c, W * .05, y, 6, 6, '#e3ddcb'); tsEllipse(c, W * .05, y, 4, 4, '#d6cfbb'); }
      const sx = W * .815, sy = H * .07, s = 1 + Math.sin(t * 2) * .06, pts = [];
      for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = (i % 2 ? 5 : 12) * s; pts.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r]); }
      for (let i = 0; i < 10; i++) tsLine(c, pts[i][0], pts[i][1], pts[(i + 1) % 10][0], pts[(i + 1) % 10][1], '#e2ac34');
      const h = tsHero(c, tsx.hero, t, W / 2, Math.round(H * .695));
      if (h){ const y = h.dy + h.b.t - 4; tsR(c, W / 2 - 23, y, 46, 11, 'rgba(247,222,122,.62)'); tsR(c, W / 2 - 23, y, 46, 1, 'rgba(230,200,90,.7)'); }
    },
    ui:() => tsTitle(8, false, 'flat') + tsMenu('notes', 72.5) + tsQuiet()},
  // ---------- Places people train ----------
  {id:'irongym', name:'Iron gym', edge:'#141318',
    draw(c, W, H, t){
      const F = Math.round(H * .80), my = Math.round(H * .36), mh = Math.round(H * .28);
      tsR(c, 0, 0, W, F, '#2a2630');   // brick wall
      for (let y = 0, row = 0; y < F; y += 10, row++){ tsR(c, 0, y, W, 1, '#211e27'); for (let x = (row % 2) * 14; x < W; x += 28) tsR(c, x, y, 1, 10, '#211e27'); }
      tsR(c, 0, my, W, mh, '#38404f'); tsR(c, 0, my, W, 2, '#8a94a8'); tsR(c, 0, my + mh - 2, W, 2, '#15171d');   // mirror wall
      for (let i = 0; i < 3; i++) tsLine(c, W * (.12 + i * .33), my + 4, W * (.12 + i * .33) + 26, my + mh - 6, 'rgba(200,215,240,.16)', 3);
      const ry = my + mh - 16; tsR(c, W * .06, ry + 10, W * .88, 4, '#5a5f6c');   // dumbbell rack
      for (let x = W * .08; x < W * .9; x += 16){ tsR(c, x, ry + 2, 4, 8, '#16161c'); tsR(c, x + 4, ry + 5, 6, 2, '#9a9fac'); tsR(c, x + 10, ry + 2, 4, 8, '#16161c'); }
      for (const rx of [W * .04, W * .78]){   // squat racks with loaded bars
        const top = H * .3, w = W * .17; tsR(c, rx, top, 5, F - top, '#c83a3a'); tsR(c, rx + w, top, 5, F - top, '#c83a3a'); tsR(c, rx - 2, top, w + 9, 4, '#9a2626');
        for (let y = top + 6; y < F - 10; y += 8){ tsR(c, rx + 2, y, 1, 2, '#5a1414'); tsR(c, rx + w + 2, y, 1, 2, '#5a1414'); }
        const by = Math.round(H * .53); tsR(c, rx - 12, by, w + 29, 3, '#c8ccd8');
        for (const px of [rx - 10, rx + w + 10]){ tsR(c, px, by - 14, 5, 31, '#1c1c22'); tsR(c, px + 1, by - 12, 3, 27, '#34343e'); }
      }
      for (const lx of [W * .3, W * .7]){   // hanging lamps, one flickers now and then
        const fl = Math.sin(t * 9 + lx) > .96 ? .04 : .1, ly = Math.round(H * .12);
        tsLine(c, lx, 0, lx, ly - 6, '#0c0c10'); tsPoly(c, [[lx - 11, ly], [lx + 11, ly], [lx + 6, ly - 7], [lx - 6, ly - 7]], '#3a3a44');
        tsPoly(c, [[lx - 9, ly], [lx + 9, ly], [lx + 64, F], [lx - 64, F]], `rgba(255,236,190,${fl})`); tsR(c, lx - 5, ly, 10, 2, '#ffe9b0');
      }
      tsR(c, 0, F, W, H - F, '#1a1a20'); tsR(c, 0, F, W, 2, '#34343e');   // rubber floor tiles
      for (let y = F + 14; y < H; y += 24) tsR(c, 0, y, W, 1, '#25252c'); for (let x = 0; x < W; x += 48) tsR(c, x, F, 1, H - F, '#25252c');
      const rnd = tsRand(5); for (let i = 0; i < 18; i++){ const x = rnd() * W, y = (rnd() * F + t * (4 + rnd() * 6)) % F; tsR(c, x + Math.sin(t + i) * 2, F - y, 1, 1, 'rgba(240,240,255,.35)'); }   // chalk dust
      tsEllipse(c, W / 2, F + 8, W * .24, 7, '#0e0e12');
      tsHero(c, tsx.hero, t, W / 2, F + 8);
    },
    ui:() => tsTitle(7, false) + tsStart(92)},
  {id:'boxing', name:'Boxing gym', edge:'#1a0f10',
    draw(c, W, H, t){
      const F = Math.round(H * .80);
      tsBands(c, W, 0, F, ['#1d1418', '#221719', '#27191b', '#2c1c1d', '#311e1f']);
      for (const [px, col] of [[W * .06, '#c8a040'], [W * .74, '#c84040']]){   // fight posters
        const py = H * .13, w = W * .2; tsR(c, px, py, w, H * .16, '#e8dcc0'); tsR(c, px + 3, py + 3, w - 6, 12, col);
        tsEllipse(c, px + w / 2, py + H * .095, 9, 11, '#3a2a20'); tsR(c, px + 5, py + H * .14, w - 10, 2, '#8a7a60');
      }
      tsPoly(c, [[W * .43, 0], [W * .57, 0], [W * .88, F], [W * .12, F]], 'rgba(255,240,210,.07)');   // spotlight
      for (const [bx, ph] of [[W * .1, 0], [W * .9, 1.7]]){   // heavy bags, gently swaying
        const sw = Math.sin(t * 1.4 + ph) * 3, top = H * .3, h = H * .24;
        tsLine(c, bx, 0, bx + sw, top, '#55585f'); tsR(c, bx + sw - 9, top, 18, h, '#8a1e24'); tsR(c, bx + sw + 4, top, 5, h, '#6a141a');
        tsR(c, bx + sw - 9, top, 18, 4, '#1a1a1a'); tsR(c, bx + sw - 9, top + h - 4, 18, 4, '#1a1a1a'); tsR(c, bx + sw - 6, top + h * .25, 3, h * .4, '#a83038');
      }
      tsPoly(c, [[W * .04, F - H * .05], [W * .96, F - H * .05], [W, F], [0, F]], '#2a4a7a');   // the ring
      tsR(c, 0, F, W, H - F, '#3a6aa8'); tsR(c, 0, F, W, 3, '#5a8ac8'); tsR(c, 0, H - 16, W, 16, '#203a60');
      for (const px of [W * .04, W * .96]) tsR(c, px - 3, F - H * .3, 6, H * .26, '#d8d8e0');
      const cols = ['#d83a3a', '#f0f0f0', '#3a5ad8'];
      for (let i = 0; i < 3; i++){ const y = F - H * .27 + i * H * .07; for (let x = 0; x < W; x += 2) tsR(c, x, y + Math.sin(Math.PI * x / W) * (5 + Math.sin(t * 2 + i)), 2, 3, cols[i]); }
      tsHero(c, tsx.hero, t, W / 2, F + 10);
    },
    ui:() => tsTitle(7, false) + tsStart(92, 'Round one')},
  {id:'garage', name:'Garage gym', edge:'#1b1a1f',
    draw(c, W, H, t){
      const F = Math.round(H * .80), D = Math.round(H * .3);
      tsBands(c, W, 0, D, ['#1d2550', '#253064', '#2f3b76', '#3a4686']); tsStars(c, W, D, t, 24, 4);   // night outside the open door
      tsEllipse(c, W * .8, D * .38, 10, 10, '#f2ecd0');
      for (let y = 0; y < H * .05; y += 4){ tsR(c, 0, y, W, 3, '#c8c8cc'); tsR(c, 0, y + 3, W, 1, '#8a8a90'); }   // rolled-up door
      tsR(c, 0, D, W, F - D, '#5a5650');
      tsR(c, W * .05, D + 12, W * .36, H * .2, '#b48a5a');   // pegboard with a band and a jump rope
      for (let y = D + 16; y < D + 12 + H * .2; y += 6) for (let x = W * .05 + 4; x < W * .41; x += 6) tsR(c, x, y, 1, 1, '#7a5a38');
      tsLine(c, W * .1, D + 22, W * .1, D + 64, '#d83a3a', 2); tsRing(c, W * .22, D + 44, 11, 2, '#3ab05a'); tsR(c, W * .31, D + 22, 14, 3, '#9aa0aa'); tsR(c, W * .36, D + 22, 3, 24, '#7a5030');
      for (const [px, py, r] of [[W * .64, D + 36, 15], [W * .82, D + 36, 15], [W * .73, D + 74, 12]]){ tsEllipse(c, px, py, r, r, '#1c1c20'); tsEllipse(c, px, py, r - 3, r - 3, '#2c2c32'); tsEllipse(c, px, py, 3, 3, '#8a8a90'); }   // plates on the wall
      for (let x = 2; x < W; x += 14){ const y = D + 5 + Math.sin(x / W * Math.PI) * 8, on = Math.sin(t * 2 + x) > -.6; tsR(c, x + 1, y, 1, 2, '#2a2a2a'); tsR(c, x, y + 2, 3, 3, on ? '#ffd27a' : '#7a6030'); }   // string lights
      tsR(c, W * .3, H * .44, 4, F - H * .44, '#2a2a30'); tsR(c, W * .7 - 4, H * .44, 4, F - H * .44, '#2a2a30'); tsR(c, W * .28, H * .44, W * .44, 4, '#2a2a30'); tsR(c, W * .2, H * .55, W * .6, 3, '#c8ccd8');   // half rack
      tsR(c, 0, F, W, H - F, '#8a8680'); tsR(c, 0, F, W, 2, '#6a6660'); for (let x = W / 3; x < W; x += W / 3) tsR(c, x, F, 1, H - F, '#77736d'); tsEllipse(c, W * .24, F + H * .1, 22, 5, '#7c7871');
      tsHero(c, tsx.hero, t, W / 2, F + 10);
    },
    ui:() => tsTitle(7, false) + tsStart(92, 'Garage open')},
  {id:'beach', name:'Beach workout', edge:'#d8a86a',
    draw(c, W, H, t){
      const HZ = Math.round(H * .46), SA = Math.round(H * .64);
      tsBands(c, W, 0, HZ, ['#ff9a7a', '#ffa880', '#ffb788', '#ffc690', '#ffd49a', '#ffe0a8']);
      tsEllipse(c, W * .5, HZ, 30, 30, '#fff0c0');
      tsBirds(c, W, t, [[40, H * .2, 6], [160, H * .16, 5], [240, H * .24, 4]], '#8a4a40');
      tsBands(c, W, HZ, SA, ['#3a8ac0', '#3f94c8', '#48a0d0', '#55acd8']);   // the sea, waves rolling in
      for (let y = HZ + 6; y < SA; y += 8){ const off = (t * 12 + y * 3) % 24; for (let x = -24 + off; x < W; x += 24) tsR(c, x, y, 10, 1, 'rgba(255,255,255,.4)'); }
      tsR(c, W * .5 - 18, HZ, 36, SA - HZ, 'rgba(255,230,170,.16)');
      tsR(c, 0, SA + Math.sin(t * 1.2) * 3 - 2, W, 4, '#e8f6ff');
      tsR(c, 0, SA, W, H - SA, '#f0d29a'); tsR(c, 0, SA + 3, W, 5, '#dcb87e');
      const rnd = tsRand(9); for (let i = 0; i < 70; i++) tsR(c, rnd() * W, SA + 10 + rnd() * (H - SA - 10), 1, 1, '#d4ae74');
      const px = W * .08, pw = W * .22; tsR(c, px, H * .5, 4, H * .34, '#6a7080'); tsR(c, px + pw, H * .5, 4, H * .34, '#6a7080'); tsR(c, px - 2, H * .5, pw + 8, 3, '#a0a8b8');   // pull-up station
      const tx = W * .86, ty = H * .4;   // palm tree
      for (let y = ty; y < H * .84; y += 4) tsR(c, tx + Math.sin((y - ty) / 40) * 6, y, 7, 4, (y / 4 | 0) % 2 ? '#8a5a30' : '#6a4220');
      for (const a of [-2.7, -2.1, -1.3, -.6, -3.05]){ const len = 40 + (a * 7 % 6), ex = tx + 3 + Math.cos(a) * len, ey = ty + Math.sin(a) * len * .55 + 14 + Math.sin(t * 1.5 + a) * 2; tsLine(c, tx + 3, ty, ex, ey, '#3a8a40', 3); }
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .86));
    },
    ui:() => tsTitle(7, false) + tsStart(93, 'Hit the sand', 'ts-pill')},
  {id:'park', name:'Park bars', edge:'#3d6e3a',
    draw(c, W, H, t){
      const G = Math.round(H * .62);
      tsBands(c, W, 0, G, ['#7ac4f0', '#86caf2', '#93d0f4', '#a0d6f6', '#aedcf8', '#bce2f8']);
      for (const [x0, y, s] of [[30, H * .2, 4], [150, H * .14, 3], [250, H * .24, 5]]){ const x = ((x0 + t * s) % (W + 80)) - 40; tsEllipse(c, x, y, 24, 7, '#ffffff'); tsEllipse(c, x - 8, y - 5, 12, 6, '#ffffff'); tsEllipse(c, x + 9, y - 3, 10, 5, '#f2f8ff'); }
      const pts = [[0, G]]; for (let x = 0, i = 0; x <= W + 16; x += 16, i++) pts.push([x, G - 18 - (i % 3) * 6]); pts.push([W, G]); tsPoly(c, pts, '#4a8a50');   // distant trees
      tsR(c, 0, G, W, H - G, '#6ab04a'); for (let y = G + 6; y < H; y += 10) tsR(c, 0, y, W, 2, '#62a444');
      tsPoly(c, [[W * .42, G], [W * .58, G], [W * .8, H], [W * .2, H]], '#d8c08a');   // path
      for (const [tx, s] of [[W * .06, 1], [W * .94, 1.15]]){ tsR(c, tx - 5, G - H * .2, 10, H * .3, '#6a4428'); tsEllipse(c, tx, G - H * .24, 40 * s, 34 * s, '#3a7a3a'); tsEllipse(c, tx - 10, G - H * .28, 26 * s, 22 * s, '#4a8a44'); }
      const bx = W * .14, bw = W * .2, bt = H * .52;   // parallel bars
      for (const x of [bx, bx + bw]) for (const z of [0, 10]) tsR(c, x, bt + z, 3, G + H * .1 - bt - z, '#3a4250');
      tsR(c, bx - 4, bt, bw + 10, 3, '#9aa4b4'); tsR(c, bx - 4, bt + 10, bw + 10, 3, '#9aa4b4');
      const ux = W * .7, uw = W * .2, ut = H * .44;   // pull-up frame
      tsR(c, ux, ut, 4, G + H * .12 - ut, '#3a4250'); tsR(c, ux + uw, ut, 4, G + H * .12 - ut, '#3a4250'); tsR(c, ux - 3, ut, uw + 10, 3, '#9aa4b4');
      tsBirds(c, W, t, [[90, H * .3, 4], [200, H * .27, 5]], '#3a4a5a');
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .86));
    },
    ui:() => tsTitle(7, false) + tsStart(93, 'Get outside', 'ts-pill')},
  {id:'court', name:'Street court', edge:'#1c1424',
    draw(c, W, H, t){
      const F = Math.round(H * .62);
      tsBands(c, W, 0, F, ['#2a1e48', '#3a2452', '#4e2a58', '#68305a', '#86385a', '#a44458', '#c25454']);
      const rnd = tsRand(17); let x = -4;   // skyline
      while (x < W){ const w = 14 + Math.floor(rnd() * 20), top = F - H * (.08 + rnd() * .14); tsR(c, x, top, w, F - top, '#1e1430');
        for (let wy = top + 5; wy < F - 4; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rnd() > .55) tsR(c, wx, wy, 2, 3, '#f4c76a'); x += w + 2; }
      for (let y = F - H * .16; y < F; y += 6) for (let xx = (y / 6 % 2) * 3; xx < W; xx += 6) tsR(c, xx, y, 1, 1, 'rgba(200,200,220,.35)');   // chain-link fence
      tsR(c, 0, F - H * .16, W, 2, '#8a8a9a');
      const lx = W * .12; tsR(c, lx, F - H * .3, 3, H * .3, '#3a3a48'); tsR(c, lx, F - H * .3, 14, 3, '#3a3a48'); tsEllipse(c, lx + 14, F - H * .3 + 5, 22, 16, 'rgba(255,220,150,.12)'); tsR(c, lx + 10, F - H * .3 + 2, 8, 3, '#ffe9b0');
      tsR(c, 0, F, W, H - F, '#2c2c3a'); tsR(c, 0, F, W, 2, '#d0d0d8');   // court with painted lines
      tsPoly(c, [[W * .3, F], [W * .7, F], [W * .78, H * .8], [W * .22, H * .8]], '#3a2c4a'); tsR(c, W * .22, H * .8, W * .56, 2, '#f08a3a');
      tsLine(c, W * .3, F, W * .22, H * .8, '#f08a3a', 2); tsLine(c, W * .7, F, W * .78, H * .8, '#f08a3a', 2);
      tsRing(c, W / 2, H * .8, W * .2, 2, '#e8e8f0');
      const hx = W * .5, hy = F - H * .22;   // the hoop
      tsR(c, hx - 2, hy + 10, 4, H * .22 - 10, '#4a4a58'); tsR(c, hx - 24, hy - 18, 48, 30, '#f0f0f4'); tsR(c, hx - 23, hy - 17, 46, 28, '#e0e4ec'); tsR(c, hx - 9, hy - 6, 18, 12, 'transparent');
      tsR(c, hx - 9, hy - 7, 18, 2, '#d83a3a'); tsR(c, hx - 9, hy - 7, 2, 12, '#d83a3a'); tsR(c, hx + 7, hy - 7, 2, 12, '#d83a3a');
      tsR(c, hx - 11, hy + 10, 22, 2, '#f08a3a'); const sw = Math.sin(t * 2) * 1;
      for (let i = 0; i < 6; i++) tsLine(c, hx - 10 + i * 4, hy + 12, hx - 7 + i * 3 + sw, hy + 24, '#f0f0f4');
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .88));
    },
    ui:() => tsTitle(5.5, false) + tsStart(92.5)},
  {id:'stadium', name:'Stadium lights', edge:'#0b1a10',
    draw(c, W, H, t){
      const B = Math.round(H * .5), F = Math.round(H * .62);
      tsBands(c, W, 0, B, ['#060812', '#080b18', '#0b0f1e', '#0e1426', '#12182e']); tsStars(c, W, H * .3, t, 20, 12);
      for (const tx of [W * .1, W * .9]){   // light towers
        tsR(c, tx - 2, H * .1, 4, B - H * .1, '#3a3e4a'); tsR(c, tx - 16, H * .07, 32, 16, '#2a2e3a');
        for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) tsR(c, tx - 14 + q * 8, H * .07 + 2 + r * 7, 5, 5, '#f4f8ff');
        tsPoly(c, [[tx - 14, H * .09], [tx + 14, H * .09], [W / 2 + (tx < W / 2 ? 30 : -30) + (tx < W / 2 ? 60 : -60), H], [W / 2 + (tx < W / 2 ? -80 : 80), H]], 'rgba(230,240,255,.06)');
      }
      tsR(c, 0, B, W, F - B, '#1c2030');   // the stands, flashes going off
      const rnd = tsRand(21); for (let y = B + 3; y < F - 3; y += 5) for (let x = (y / 5 % 2) * 2; x < W; x += 4) tsR(c, x, y, 2, 2, ['#3a4058', '#5a4a6a', '#4a3a3a', '#3a5a6a'][(rnd() * 4) | 0]);
      for (let i = 0; i < 4; i++){ const fx = tsRand(Math.floor(t * 2) * 7 + i)() * W, fy = B + 4 + tsRand(Math.floor(t * 2) * 13 + i)() * (F - B - 8); tsR(c, fx, fy, 2, 2, '#ffffff'); }
      tsR(c, 0, F - 3, W, 3, '#e8e8f0');
      for (let y = F, k = 0; y < H; y += 12, k++) tsR(c, 0, y, W, 12, k % 2 ? '#2f7a3a' : '#368844');   // turf, mowed stripes
      for (let k = -4; k <= 4; k++){ const x0 = W / 2 + k * 30, x1 = W / 2 + k * 70; tsLine(c, x0, F, x1, H, 'rgba(255,255,255,.55)'); }
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .86));
    },
    ui:() => tsTitle(7, false) + tsStart(93, 'Kick off')},
  {id:'trail', name:'Mountain trail', edge:'#2c3a36',
    draw(c, W, H, t){
      const G = Math.round(H * .6);
      tsBands(c, W, 0, G, ['#f6d8b8', '#f2d0b6', '#e8c6b8', '#d8bcbc', '#c4b2c0', '#b0aac4']);
      tsEllipse(c, W * .3, H * .3, 22, 22, '#fff2d6');
      for (let i = 0; i < 6; i++) tsLine(c, W * .3, H * .3, W * .3 + Math.cos(i * .5 + .3) * W, H * .3 + Math.sin(i * .5 + .3) * W, 'rgba(255,240,210,.08)', 3);   // sun rays
      const ridge = (base, amp, seed, col) => { const r = tsRand(seed), pts = [[0, G + 10]]; for (let x = 0; x <= W + 20; x += 20) pts.push([x, base - r() * amp]); pts.push([W, G + 10]); tsPoly(c, pts, col); };
      ridge(H * .4, H * .1, 3, '#8e8aa8'); ridge(H * .48, H * .08, 7, '#6e7a8a'); ridge(H * .55, H * .06, 9, '#4e6a62');
      for (let k = 0; k < 3; k++){ const y = H * (.44 + k * .05), off = (t * (4 + k * 2)) % W; c.globalAlpha = .35; tsR(c, off - W, y, W * .6, 4, '#f4ecf0'); tsR(c, off, y, W * .6, 4, '#f4ecf0'); c.globalAlpha = 1; }   // drifting fog
      tsR(c, 0, G, W, H - G, '#4e7a4a');
      tsPoly(c, [[W * .47, G], [W * .53, G], [W * .82, H], [W * .18, H]], '#a8865a'); tsPoly(c, [[W * .49, G], [W * .51, G], [W * .6, H], [W * .4, H]], '#b8966a');   // the trail
      const pine = (x, y, s, col) => { for (let i = 0; i < 4; i++) tsPoly(c, [[x, y - s * (1 - i * .22)], [x - s * (.25 + i * .1), y - s * (.55 - i * .2)], [x + s * (.25 + i * .1), y - s * (.55 - i * .2)]], col); tsR(c, x - 2, y - s * .1, 4, s * .12, '#3a2a1a'); };
      for (const [x, s] of [[W * .04, 120], [W * .16, 90], [W * .86, 110], [W * .97, 140], [W * .28, 60], [W * .72, 66]]) pine(x, G + s * .35, s, s > 100 ? '#1e3a2a' : '#2c4e36');
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .86));
    },
    ui:() => tsTitle(7, false) + tsStart(93, 'Hit the trail', 'ts-pill')},
  {id:'pool', name:'Swim lanes', edge:'#0a2e4a',
    draw(c, W, H, t){
      const P = Math.round(H * .46), D = Math.round(H * .76);
      tsR(c, 0, 0, W, P, '#d8e8ee'); for (let y = 0; y < P; y += 12) tsR(c, 0, y, W, 1, '#c0d4dc'); for (let x = 0; x < W; x += 12) tsR(c, x, 0, 1, P, '#c0d4dc');   // tiled wall
      for (let i = 0; i < 3; i++){ const wx = W * (.08 + i * .32); tsR(c, wx, H * .1, W * .22, H * .2, '#8ac8f0'); tsR(c, wx, H * .1, W * .22, 3, '#5a7a8a'); tsR(c, wx + W * .11 - 1, H * .1, 2, H * .2, '#5a7a8a');
        tsPoly(c, [[wx, H * .3], [wx + W * .22, H * .3], [wx + W * .3, P], [wx + W * .06, P]], 'rgba(255,255,255,.18)'); }   // high windows and light shafts
      tsR(c, 0, P - 6, W, 6, '#2a5a8a');
      tsBands(c, W, P, D, ['#1a7ab8', '#1e84c2', '#238ecb', '#2898d4', '#2ea2dc']);   // the pool
      for (let y = P + 4; y < D; y += 6){ const off = Math.sin(t * 1.6 + y * .3) * 6; for (let x = -12; x < W; x += 18) tsR(c, x + off + (y % 12 ? 0 : 9), y, 7, 1, 'rgba(255,255,255,.35)'); }
      for (let l = 1; l < 4; l++){ const y = P + (D - P) * l / 4, sc = (t * 10) % 12; for (let x = -12 + sc; x < W; x += 12){ tsR(c, x, y, 6, 3, '#e83a3a'); tsR(c, x + 6, y, 6, 3, '#f4f4f8'); } }   // lane ropes
      tsR(c, 0, D, W, H - D, '#e8eef2'); tsR(c, 0, D, W, 3, '#b8c8d0'); for (let x = 0; x < W; x += 16) tsR(c, x, D, 1, H - D, '#d0dce2');
      for (let i = 0; i < 4; i++){ const bx = W * (.12 + i * .25) - 10; tsR(c, bx, D - 10, 20, 10, '#2a3a4a'); tsR(c, bx, D - 10, 20, 3, '#4a6a8a'); tsR(c, bx + 7, D - 6, 6, 4, '#f4f4f8'); }   // starting blocks
      tsHero(c, tsx.hero, t, W / 2, Math.round(H * .9));
    },
    ui:() => tsTitle(7, false) + tsStart(92.5, 'Dive in')}
];

function tsData(){
  const r = RANKS[rankIdx()], n = nextRank(S.xp);
  return {r, n, ri:rankIdx(), L:levelFor(S.xp), g:S.hero.gender, wk:weekStreak(), logs:S.log.length, maxes:S.example ? null : S.maxes, rv:rivalData(),
    pct:n ? Math.max(0, Math.min(99, Math.floor((S.xp - r.xp) / (n.xp - r.xp) * 100))) : 100};
}
function tsSize(){
  if (!tsx) return;
  const r = tsx.el.querySelector('.ts-stage').getBoundingClientRect(), cv = tsx.ctx.canvas;
  // At least 540 px tall: on shorter screens the scene draws wider instead, so the hero never crowds the title and menu
  const ratio = Math.max(1, r.height / Math.max(1, r.width)); tsx.H = Math.max(540, Math.round(270 * ratio)); tsx.W = Math.round(tsx.H / ratio);
  if (cv.width !== tsx.W || cv.height !== tsx.H){ cv.width = tsx.W; cv.height = tsx.H; }
  tsx.dirty = true;
}
async function tsLoad(){
  const k = RANKS[rankIdx()].k, frames = (g, kk = k) => { const h = S.hero[g]; return spriteFrames(g, kk, wornLook(g), h.style, h.acc); }, me = tsx;
  try {
    const hero = await frames(S.hero.gender); if (tsx !== me) return; tsBounds(hero); tsx.hero = hero; tsx.dirty = true;
    if (tsx.sc.id === 'select'){ const both = {male:await frames('male'), female:await frames('female')}; if (tsx !== me) return; tsBounds(both.male); tsBounds(both.female); tsx.both = both; }
    if (tsx.sc.id === 'vs'){ const past = await frames(S.hero.gender, 'F'); if (tsx !== me) return; tsBounds(past); tsx.past = past; }
    tsx.dirty = true;
  } catch(e){}
}
function tsLoop(now){
  if (!tsx) return;
  tsx.raf = requestAnimationFrame(tsLoop);
  if (reduceMotion ? !tsx.dirty : (now - tsx.last < 50 && !tsx.dirty)) return;   // about 20 frames a second is plenty for pixel art
  tsx.last = now; tsx.dirty = false;
  const c = tsx.ctx; c.imageSmoothingEnabled = false;
  tsx.sc.draw(c, tsx.W, tsx.H, reduceMotion ? 0 : (now - tsx.t0) / 1000);
}
function openTitle(id){
  const want = id && id !== 'shuffle' ? id : S.prefs.title !== 'shuffle' ? S.prefs.title : null;
  let sc = TITLE_SCENES.find(s => s.id === want);
  if (!sc){ const pool = TITLE_SCENES.filter(s => s.id !== S.titleLast); sc = pool[Math.floor(Math.random() * pool.length)]; S.titleLast = sc.id; save(); }
  if (tsx) cancelAnimationFrame(tsx.raf);
  const el = document.getElementById('title');
  tsx = {sc, el, ctx:document.getElementById('tsBg').getContext('2d'), t0:performance.now(), last:0, dirty:true, sel:S.hero.gender, ri:rankIdx()};
  el.dataset.s = sc.id; el.style.setProperty('--ts-edge', sc.edge);
  document.getElementById('tsUi').innerHTML = sc.ui(tsData());
  el.hidden = false; document.documentElement.classList.add('ts-lock'); behind().forEach(x => x.inert = true); document.getElementById('welcome').inert = true;
  tsSize(); tsLoad(); tsx.raf = requestAnimationFrame(tsLoop);
  el.focus({preventScroll:true});
}
function closeTitle(act){
  if (!tsx) return;
  cancelAnimationFrame(tsx.raf); tsx.el.hidden = true; tsx = null; document.documentElement.classList.remove('ts-lock');
  if (!profileChosen){ openProfiles(act, false); return; }   // first time past the title this launch: choose whose training this is
  const wel = document.getElementById('welcome'); wel.inert = false;
  if (!wel.hidden){ (wel.querySelector('.ob-primary') || wel.querySelector('button'))?.focus({preventScroll:true}); return; }   // new players go through setup first
  if (!document.querySelector('.overlay:not([hidden])')) behind().forEach(x => x.inert = false);
  if (act === 'hero'){ document.querySelector('[data-act=openHero]')?.click(); return; }
  const to = {train:'today', arcs:'arcs', stats:'progress'}[act];
  if (to && to !== tab){ tab = to; render(true); }
  window.scrollTo(0, 0);
}
document.getElementById('title').addEventListener('click', e => {
  if (!tsx) return;
  const b = e.target.closest('[data-ts]'), a = b ? b.dataset.ts : 'start';
  if (a === 'pick'){ tsx.sel = b.dataset.g; tsx.el.querySelectorAll('.ts-pick').forEach(p => p.setAttribute('aria-pressed', p === b)); tsx.dirty = true; buzz(10); return; }
  if (a === 'select'){ if (S.hero.gender !== tsx.sel){ S.hero.gender = tsx.sel; arcPath = null; save(); render(); paintHeroes(); } closeTitle('start'); return; }
  buzz(10); sfx('start'); closeTitle(a);
});
document.getElementById('title').addEventListener('keydown', e => {
  if (!tsx) return;
  if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); closeTitle('start'); return; }
  if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')){ e.preventDefault(); tsx.el.querySelector('.ts-go, .ts-start, [data-ts=start]')?.click(); }
});
window.addEventListener('resize', tsSize);
document.fonts && document.fonts.load('16px "Jersey 10"').then(() => { if (tsx) tsx.dirty = true; }, () => {});


/* ---------- Boss gates ---------- */
// Eight bosses, fought in order on any path: the Couch Golem is open from day one, and beating a boss unlocks the
// next. Your level doesn't matter and ranks never wait on them. Each boss keeps its own difficulty (the Couch Golem
// is easy, the Gravity Dragon is brutal), with weights from your maxes and bodyweight versions for bodyweight
// paths. The fight is a real workout: every set you log is an attack. First wins pay the boss's EXP; rematches
// pay set XP. On Progress they're a collection: locked until you beat the one before.
const bossList = () => Object.values(window.TA_BOSSES || {}).sort((a, b) => a.order - b.order);
const bossBeaten = id => (S.beaten || []).includes(id);
const nextBoss = () => bossList().find(b => !bossBeaten(b.id)) || null;
const bossOpen = id => bossBeaten(id) || (nextBoss() || {}).id === id;
// The boss's workout, fit to you: percentages of your maxes, or a bodyweight version for bodyweight paths
// Home Training has no bar or dip station, so those moves become their at-home versions
const HOME_SUB = {'Pull-ups':'Doorframe Rows (each arm)', 'Pull-ups (band ok)':'Doorframe Rows (each arm)', 'Inverted Rows':'Doorframe Rows (each arm)', 'Dips':'Chair Dips', 'Bench Dips':'Chair Dips', 'Hanging Leg Raises':'Lying Leg Raises', 'Burpee Pull-ups':'Burpee Tuck Jumps', 'L-Sit':'Hollow Hold'};
const BW_PATHS = new Set(['cali', 'pilates', 'run', 'home']);
function fitBoss(boss){
  const p = prog(), bwPath = p.custom ? !p.needsMax : BW_PATHS.has(p.path), fem = S.hero.gender === 'female', kg = S.unit === 'kg';
  const W = (lift, pct) => roundW((S.maxes[lift] || 0) * pct), plus = lb => kg ? Math.round(lb / 2.20462 / 2.5) * 2.5 : lb;
  const ex = (name, sets, reps, rest, o = {}) => Object.assign({name, sets, reps, weight:0, rest, unit:'reps'}, o);
  const squatMain = ['glute', 'strong', 'sport', 'sprint'].includes(p.path);
  let mode = boss.mode, plan = null, extra = {};
  switch (boss.id){
    case 'barbell_knight':
      plan = bwPath ? (mode = 'reps', [ex('Jump Squats', 5, 10, 90), ex('Push-ups', 5, fem ? 8 : 12, 90), ex('Inverted Rows', 3, 12, 75), ex('Single-Leg Glute Bridge (each leg)', 3, 12, 60)])
        : [ex('Back Squat', 5, 5, 150, {weight:W('squat', .75)}), ex('Bench Press', 5, 5, 150, {weight:W('bench', .75)}), ex('Barbell Row', 3, 8, 90, {weight:W('bench', .6)}), ex('Romanian Deadlift', 3, 8, 90, {weight:W('deadlift', .55)})];
      break;
    case 'storm_sprinter':
      if (p.path === 'pilates' || p.path === 'home'){ plan = [ex('High Knees', 6, 30, 45, {unit:'sec'}), ex('Mountain Climbers', 6, 30, 60, {unit:'sec'}), ex('Jump Squats', 4, 10, 60)]; extra = {setWord:'Round', unitLabel:'ROUNDS', critLabel:'FASTER!'}; }
      else { const k = fem ? 1.12 : 1; plan = boss.defaultPlan.map(e => Object.assign({}, e, {reps:Math.round(e.reps * k * 10) / 10})); }
      break;
    case 'plateau_titan':
      if (bwPath){ mode = 'reps'; plan = [ex('Push-ups · warm-up', 2, 10, 60), ex('Push-ups · PR attempt', 1, fem ? 20 : 30, 180), ex('Pike Push-ups', 3, 8, 90), ex(fem ? 'Bench Dips' : 'Dips', 3, 10, 90)]; }
      else { const L = squatMain ? 'squat' : 'bench', N = LIFTS[L];
        plan = [ex(`${N} · warm-up`, 2, 5, 90, {weight:W(L, .6)}), ex(`${N} · build`, 2, 3, 150, {weight:W(L, .85)}), ex(`${N} · PR attempt`, 1, 1, 240, {weight:W(L, 1.02)}), ex(`${N} · back-off`, 3, 5, 150, {weight:W(L, .78)}),
          squatMain ? ex('Bulgarian Split Squat (each leg)', 3, 8, 90, {weight:W('squat', .3)}) : ex(fem ? 'Dips' : 'Weighted Dips', 3, 8, 90, {weight:fem ? 0 : plus(45)})]; }
      break;
    case 'shadow_self':
      plan = bwPath ? (mode = 'reps', [ex(fem ? 'Pull-ups (band ok)' : 'Pull-ups', 5, 6, 120), ex('Pistol Squat (each leg)', 4, 5, 120), ex('Pike Push-ups', 4, 8, 90), ex('Hanging Leg Raises', 4, 10, 75)])
        : [ex('Deadlift', 5, 5, 180, {weight:W('deadlift', .8)}), ex('Front Squat', 4, 6, 150, {weight:W('squat', .6)}), ex(fem ? 'Pull-ups (band ok)' : 'Weighted Pull-ups', 4, 6, 120, {weight:fem ? 0 : plus(25)}), ex('Overhead Press', 4, 6, 120, {weight:W('ohp', .75)})];
      break;
    case 'gravity_dragon':
      plan = bwPath ? (mode = 'reps', [ex('L-Sit', 5, 20, 120, {unit:'sec'}), ex('Handstand Hold', 5, 30, 120, {unit:'sec'}), ex('Nordic Curl', 4, 5, 150)])
        : [ex('Back Squat · heavy single', 5, 1, 240, {weight:W('squat', .9)}), ex('Deadlift · heavy single', 5, 1, 240, {weight:W('deadlift', .9)}), ex('Bench Press · heavy single', 4, 1, 210, {weight:W('bench', .9)})];
      break;
    case 'final_rep_god': {
      const run = ['pilates', 'home'].includes(p.path) ? ex('High Knees', 4, 30, 120, {unit:'sec', hp:1500}) : ex('100 M Sprint', 4, fem ? 15 : 13, 150, {unit:'time', hp:1500});
      plan = bwPath ? [ex('Burpee Pull-ups', 5, 5, 150, {hp:1200}), run, ex('Dips', 4, 10, 120, {hp:1000}), ex('Burpees', 4, 15, 90, {hp:800})]
        : [ex('Power Clean', 5, 3, 150, {weight:W('clean', .8), hp:1200}), run, ex(fem ? 'Dips' : 'Weighted Dips', 4, 8, 120, {weight:fem ? 0 : plus(45), hp:1000}), ex('Burpees', 4, 15, 90, {hp:800})];
      break; }
  }
  plan = plan || boss.defaultPlan;
  if (p.path === 'home') plan = plan.map(e => HOME_SUB[e.name] ? Object.assign({}, e, {name:HOME_SUB[e.name]}) : e);   // nothing that needs a bar
  return Object.assign({}, boss, extra, {mode, defaultPlan:plan});
}

// Your hero for the fight: frame one of your own character, sized for the battle screen
async function gateHero(){
  try { const g = S.hero.gender, h = S.hero[g], fr = await spriteFrames(g, rankFor(S.xp).k, wornLook(g), h.style, h.acc);
    const c = document.createElement('canvas'); c.width = 128; c.height = 192; c.getContext('2d').drawImage(fr[0].bmp, 0, -8); return c.toDataURL(); } catch(e){ return null; }
}
// Each boss's sprite sheet as a CSS class, added once: its frames play as a small looping animation
let gateStyled = false;
function gateStyles(){
  if (gateStyled || !window.TA_BOSSES) return; gateStyled = true;
  const st = document.createElement('style');
  st.textContent = Object.values(window.TA_BOSSES).map(b => `.gb-${b.id}{background-image:url(${b.sheet});background-size:${b.frames * 100}% 100%;aspect-ratio:${b.fw}/${b.fh};--gf:${b.frames - 1}}`).join('\n');
  document.head.appendChild(st);
}
const bossArt = (b, cls = '') => { gateStyles(); return `<span class="gate-art gb-${b.id} ${cls}" aria-hidden="true"></span>`; };
let gateBattle = null;
const bossKey = id => `${KEY}:battle:${bossBeaten(id) ? 'rematch:' : ''}`;   // a first fight and a rematch keep their own progress
async function openBoss(id){
  const boss = (window.TA_BOSSES || {})[id]; if (!boss || !window.startBossBattle || !bossOpen(id)) return;
  const rematch = bossBeaten(id), heroSrc = await gateHero(), el = document.getElementById('gate');
  document.getElementById('gateTag').textContent = `Boss ${boss.order} of ${bossList().length}${rematch ? ' · rematch' : ''}`;
  el.style.setProperty('--ge', boss.theme.edge); el.hidden = false; document.documentElement.classList.add('ts-lock'); behind().forEach(x => x.inert = true);
  gateBattle = startBossBattle(document.getElementById('gateArena'), {boss:fitBoss(boss), heroSrc, heroName:S.hero.name || 'Hero', rank:rankFor(S.xp).k,
    sound:S.prefs.sound, vibrate:S.prefs.vibrate, unit:S.unit, storeKey:bossKey(id), slash:shopSlash(), fx:shopEq().fx,
    onVictory:r => bossWon(id, r, rematch), onFlee:pr => bossFled(id, pr)});
  document.getElementById('gateBack').focus({preventScroll:true});
}
function closeGate(){
  if (gateBattle){ gateBattle.destroy(); gateBattle = null; }
  document.getElementById('gate').hidden = true; document.documentElement.classList.remove('ts-lock');
  if (!document.querySelector('.overlay:not([hidden])')) behind().forEach(x => x.inert = false);
}
document.getElementById('gateBack').addEventListener('click', () => { const mid = gateBattle; closeGate(); if (mid) toast('Your sets are saved. The boss will be waiting.'); });   // leaving keeps the fight as it is
const bossTitle = b => b.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
function bossWon(id, r, rematch){
  const boss = TA_BOSSES[id], old = S.xp; closeGate();
  const won = rematch ? r.sets * 10 : r.exp, nb = !rematch && bossList()[boss.order];
  if (!rematch) S.beaten = [...new Set([...(S.beaten || []), id])];
  S.xp += won; S.sets += r.sets;
  if (!rematch) shopExtra = [[`First win: ${bossTitle(boss)}`, GEM_BOSS]];
  const pay = shopPay({n:r.sets, total:0, rank:'C', bossDay:!rematch, oldXp:old}), payTxt = ` · +${fmt(pay.coins)} Grind${pay.gems ? ` · +${fmt(pay.gems)} Glory` : ''}`;
  S.log.unshift({date:today(), iso:todayIso(), prog:'Boss battle', path:prog().path, rank:rankFor(S.xp).k, day:bossTitle(boss), week:0,
    sets:r.sets, total:r.sets, full:true, bossFight:id, vol:r.volume ? Math.round(r.volume) : undefined, unit:r.volume ? S.unit : undefined, xp:won});
  checkItems(); save(); render(); paintHeroes(); cheer(); buzz(PR_BUZZ);
  toast(rematch ? `${boss.name} beaten again · +${fmt(won)} XP${payTxt}` : `${boss.name} defeated! +${fmt(won)} XP${payTxt}${nb ? ` · ${nb.name} unlocked` : ' · every boss beaten'}`);
  rankCheck(old);
}
function bossFled(id, pr){
  closeGate();
  toast(`You fled. ${bossTitle(TA_BOSSES[id])} has ${Math.round(pr.hpLeft / pr.hpMax * 100)}% HP left. Your sets are saved for the rematch.`);
}
// Sets already logged in a fight that's still going (closing the app mid-fight resumes it)
function bossMid(id){ try { const s = JSON.parse(localStorage.getItem(bossKey(id) + id)); return s && s.log ? s.log.length : 0; } catch(e){ return 0; } }
// Today: only when a fight is in progress, so you can jump back in
function gateCardHTML(){
  const b = bossList().find(x => bossOpen(x.id) && bossMid(x.id)); if (!b) return '';
  return `<section class="gate-card" style="--ge:${b.theme.edge};--gp:${b.theme.panel};--ga:${b.theme.accent}">
    ${bossArt(b)}<div class="gate-txt"><p class="gate-k">Boss ${b.order} · fight in progress</p><h2 class="gate-name">${b.name}</h2><p class="gate-taunt">${esc(b.taunt || '')}</p></div>
    <button type="button" class="btn btn-power gate-go" data-act="boss" data-id="${b.id}">Resume the fight · ${(n => `${n} set${n === 1 ? "" : "s"} in`)(bossMid(b.id))}</button></section>`;
}
// Progress: the boss collection. Beaten ones in full, the next one ready, the rest locked until you beat the one before.
function gatesHTML(){
  const L = bossList(); if (!L.length) return '';
  const nx = nextBoss(), n = L.filter(b => bossBeaten(b.id)).length;
  const row = (b, i) => { const done = bossBeaten(b.id), cur = nx && nx.id === b.id, prev = L[i - 1], mid = (done || cur) && bossMid(b.id);
    const state = done ? '<span class="gate-st ok">Defeated</span>' : cur ? `<span class="gate-st now">${mid ? `Fight in progress · ${mid} set${mid === 1 ? "" : "s"} in` : 'Ready to fight'}</span>` : `<span class="gate-st">Beat ${bossOpen(prev.id) ? bossTitle(prev) : `Boss ${prev.order}`} to unlock</span>`;
    const btn = done ? `<button type="button" class="btn btn-ghost btn-sm" data-act="boss" data-id="${b.id}">Rematch</button>` : cur ? `<button type="button" class="btn btn-power btn-sm" data-act="boss" data-id="${b.id}">${mid ? 'Resume' : 'Challenge'}</button>` : `<span class="gate-lock" role="img" aria-label="Locked">${LOCK_SVG}</span>`;
    return `<li class="gate-row${done ? ' done' : cur ? ' cur' : ' locked'}" style="--ge:${b.theme.edge}">${bossArt(b, done || cur ? '' : 'silhouette')}
      <div><p class="gate-k">Boss ${b.order}</p><b>${done || cur ? b.name : '???'}</b>${state}</div>${btn}</li>`; };
  return `<section class="panel"><div class="row-between"><h3>Boss battles</h3><span class="fine num">${n} of ${L.length} defeated</span></div>
    <p class="fine">Fight them in order, on any arc. Each boss is as tough as it looks, and the fight is a real workout: every set you log is an attack. Beat one to unlock the next.</p>
    <ol class="gate-list">${L.map(row).join('')}</ol></section>`;
}

// Boss days on Today: the day's own workout becomes the fight. The opponent is the next boss in your collection,
// so whatever arc you're on, the bosses come in order. Every set is an attack, at your weights; winning clears the
// day exactly like a full workout (arc boss bonus, results, arc complete) and beats that boss, unlocking the next.
let arcFoe = null;   // the boss being fought on this boss day, so every message names the same opponent
// Once every boss is beaten, boss days rematch one of two bosses that suit the arc's rank, switching each week
// (E-Rank: Couch Golem or Iron Slime ... A-Rank: Shadow Self or Gravity Dragon, S-Rank: Gravity Dragon or Final Rep God)
const FOE_BAND = {E:[0, 1], D:[1, 2], C:[2, 3], B:[3, 4], A:[5, 6], S:[6, 7]};
const arcFoeNow = () => { const L = bossList(); if (!L.length) return null; const nb = nextBoss(); if (nb) return nb;
  const band = FOE_BAND[prog().rank] || FOE_BAND.C, wk = Math.floor(fromYmd(weekStart(todayIso())).getTime() / (7 * 864e5));
  return L[Math.min(L.length - 1, band[wk % 2])]; };
// The day as battle entries: sets with the same target and weight are grouped; each entry remembers its set keys
function arcBossPlan(){
  const out = [];
  for (const e of wkPlan().ex){
    let cur = null;
    e.sets.forEach(s => {
      const wt = e.lift ? s.weight : e.pick ? ((suggestFor(e) || {}).w || S.lastPick[e.name] || 0) : 0, sig = `${s.reps}|${wt}|${s.amrap}`;
      if (!cur || cur.sig !== sig){
        const label = e.unit && e.unit !== 'sec' ? ` (${e.unit})` : '';
        cur = {sig, ei:e.ei, amrap:s.amrap, pick:e.pick, base:e.name, keys:[], x:{name:e.name + label + (s.amrap ? ' · rep-out' : ''), sets:0, reps:s.reps, weight:wt, rest:restFor(e, s) || 30, unit:e.unit === 'sec' ? 'sec' : 'reps'}};
        out.push(cur);
      }
      cur.keys.push(s.key); cur.x.sets++;
    });
  }
  return out;
}
const arcBossKey = () => `${KEY}:arcboss:${dayPrefix().replace(/\|/g, ':')}`;
const arcBossMid = () => { const b = arcFoeNow(); if (!b) return 0; try { const s = JSON.parse(localStorage.getItem(arcBossKey() + b.id)); return s && s.log ? s.log.length : 0; } catch(e){ return 0; } };
async function openArcBoss(){
  const boss = arcFoeNow(); if (!boss || !window.startBossBattle){ openWorkout(); return; }
  const p = prog(), entries = arcBossPlan(), mode = entries.some(en => en.x.weight > 0) ? 'volume' : 'reps';
  const foe = Object.assign({}, boss, {mode, defaultPlan:entries.map(en => en.x), exp:bossXp(p), unitLabel:undefined, setWord:undefined});
  const heroSrc = await gateHero(), el = document.getElementById('gate');
  document.getElementById('gateTag').textContent = `Boss day · ${wkPlan().day.name}`;
  el.style.setProperty('--ge', boss.theme.edge); el.hidden = false; document.documentElement.classList.add('ts-lock'); behind().forEach(x => x.inert = true);
  gateBattle = startBossBattle(document.getElementById('gateArena'), {boss:foe, heroSrc, heroName:S.hero.name || 'Hero', rank:rankFor(S.xp).k,
    sound:S.prefs.sound, vibrate:S.prefs.vibrate, unit:S.unit, storeKey:arcBossKey(), slash:shopSlash(), fx:shopEq().fx,
    onVictory:r => arcBossWon(boss, entries, r),
    onFlee:pr => { closeGate(); toast(`You fled. ${bossTitle(boss)} has ${Math.round(pr.hpLeft / pr.hpMax * 100)}% HP left. Your sets are saved for the rematch.`); }});
  document.getElementById('gateBack').focus({preventScroll:true});
}
function arcBossWon(boss, entries, r){
  closeGate();
  // every set fought goes into today's workout, then it finishes like any other
  const at = entries.map(() => 0);
  for (const l of r.log){ const en = entries[l.ex]; if (!en || at[l.ex] >= en.keys.length) continue; const k = en.keys[at[l.ex]++];
    S.done[k] = true; S.setLog[k] = {w:l.weight || 0, r:l.reps}; if (en.amrap) S.amrap[k] = l.reps; if (en.pick && l.weight) S.lastPick[en.base] = l.weight; }
  const first = !bossBeaten(boss.id), nb = first && bossList()[boss.order];
  if (first){ S.beaten = [...new Set([...(S.beaten || []), boss.id])]; shopExtra = [[`First win: ${bossTitle(boss)}`, GEM_BOSS]]; }
  arcFoe = boss; save(); completeWorkout(); arcFoe = null;
  if (first) setTimeout(() => toast(nb ? `${boss.name} defeated · ${nb.name} unlocked` : `${boss.name} defeated · every boss beaten`), 400);
}

/* ---------- Profiles screen ---------- */
// After the title screen: choose whose training this is, or start a new profile. Each card shows that person's
// hero, rank, level, arc and last workout. ⋯ renames or deletes a profile.
let pf = null;               // while open: {then: where to go after choosing, canClose, edit: id being managed, del: id armed for delete}
let profileChosen = false;   // asked once per launch
function profileData(id){
  if (id === PROFILES.active && KEY === keyFor(id)) return S;
  try { const r = localStorage.getItem(keyFor(id)); if (r) return normalize(Object.assign(clone(DEFAULT), JSON.parse(r))); } catch(e){}
  return null;
}
function profileCard(p){
  const s = profileData(p.id), ok = s && s.onboarded && s.hero, act = p.id === PROFILES.active, ed = pf.edit === p.id, name = (s && s.hero && s.hero.name) || p.name || 'Hero';
  const r = s ? rankFor(s.xp) : RANKS[0], arc = s ? ((PROGRAMS.find(x => x.id === s.programId) || (s.customArcs || []).find(x => x.id === s.programId) || {}).name || 'Custom arc') : '';
  const n = s ? s.log.length : 0, last = s && s.log.find(l => l.iso);
  return `<article class="pf-card${act ? ' last' : ''}${ed ? ' open' : ''}">
    <button type="button" class="pf-main" data-pf="pick" data-id="${p.id}" aria-label="Play as ${esc(name)}">
      <span class="pf-art stage-bg"><canvas id="pf-${p.id}" width="128" height="208" aria-hidden="true"></canvas></span>
      <span class="pf-info"><span class="pf-top"><b class="pf-name">${esc(name)}</b>${act ? '<span class="pf-tag">Last played</span>' : ''}</span>
        <span class="pf-meta">${ok ? `${emblem(r.k, 'xs')}<span>${r.k}-Rank ${r.t} · <span class="nw">Lv ${levelFor(s.xp)}</span></span>` : '<span>Setup not finished</span>'}</span>
        ${ok ? `<span class="pf-meta dim">${esc(arc)} · ${n} workout${n === 1 ? '' : 's'}</span>` : ''}
        <span class="pf-meta dim">${last ? `Last workout ${fromYmd(last.iso).toLocaleDateString(undefined, {month:'short', day:'numeric'})}` : 'No workouts yet'}</span></span>
    </button>
    <button type="button" class="icon-btn pf-more" data-pf="edit" data-id="${p.id}" aria-expanded="${ed}" aria-label="Manage ${esc(name)}">⋯</button>
    ${ed ? `<div class="pf-manage">
      <label class="f"><span>Name</span><input id="pfName" value="${esc(name)}" maxlength="14" autocomplete="off" spellcheck="false" enterkeyhint="done"></label>
      <div class="arc-btns"><button type="button" class="btn btn-ghost btn-sm" data-pf="rename" data-id="${p.id}">Save name</button>
        <button type="button" class="btn btn-danger btn-sm" data-pf="del" data-id="${p.id}">${pf.del === p.id ? 'Tap again to delete' : 'Delete profile'}</button></div>
      ${pf.del === p.id ? `<p class="fine pf-warn">This erases ${esc(name)}'s progress on this device. Only a backup can bring it back.</p>` : ''}</div>` : ''}
  </article>`;
}
function renderProfiles(){
  const el = document.getElementById('pfIn'), L = PROFILES.list;
  el.innerHTML = `<header class="pf-head"><div><p class="eyebrow">Training Arc</p><h2 class="pf-title" id="pfTitle" tabindex="-1">${L.length ? 'Choose your profile' : 'Create your profile'}</h2></div>
      ${pf.canClose ? '<button type="button" class="btn btn-ghost btn-sm" data-pf="close">Back</button>' : ''}</header>
    <p class="pf-sub">${L.length ? 'Everyone gets their own hero, arcs, maxes and progress.' : 'Your profile holds your hero, arcs, maxes and progress. Anyone else on this device can make their own.'}</p>
    <div class="pf-list">${L.map(profileCard).join('')}
      ${L.length < MAX_PROFILES ? `<button type="button" class="pf-new" data-pf="new"><span class="pf-plus" aria-hidden="true">+</span><span><b>New profile</b><small>Start a fresh arc with your own hero</small></span></button>` : `<p class="fine">That's the most profiles a device can hold (${MAX_PROFILES}).</p>`}</div>
    <p class="fine pf-note">Profiles are saved on this device. Back each one up from Settings to keep it safe.</p>`;
  for (const p of L){ const s = profileData(p.id); if (!s || !s.hero) continue; const g = s.hero.gender, h = s.hero[g] || {};
    spriteFrames(g, rankFor(s.xp).k, h.look || {}, h.style, h.acc || {}).then(fr => { if (pf) players['pf-' + p.id] = {want:'pf', frames:fr, i:0, next:0}; }).catch(() => {}); }
}
function openProfiles(then, canClose){
  pf = {then, canClose:!!canClose && !!PROFILES.active, edit:null, del:null};
  const el = document.getElementById('profiles'); el.hidden = false; behind().forEach(x => x.inert = true); document.getElementById('welcome').inert = true;
  renderProfiles(); el.scrollTop = 0; document.getElementById('pfTitle').focus({preventScroll:true});
}
function closeProfiles(){
  document.getElementById('profiles').hidden = true; pf = null; document.getElementById('welcome').inert = false;
  for (const k of Object.keys(players)) if (k.startsWith('pf-')) delete players[k];
  if (!document.querySelector('.overlay:not([hidden])')) behind().forEach(x => x.inert = false);
}
// Loads a profile (or starts a fresh one) and resets everything on screen to it
function useProfile(id, fresh){
  const then = pf && pf.then; PROFILES.active = id; writeProfiles(PROFILES); KEY = keyFor(id);
  stopRest(); if (wk) closeWorkout();
  S = fresh ? normalize(Object.assign(clone(DEFAULT), {onboarded:false})) : normalize(load());
  if (window.TA_SHOP) TA_SHOP.bind();
  tab = 'today'; arcPath = null; medalSel = null; restartArmed = null; resetArmed = false; restorePending = null; undoAvail = false; backupCodeOpen = false;
  ob = null; document.getElementById('welcome').hidden = true;
  checkItems(); checkAch(); save(); profileChosen = true; closeProfiles();
  render(); paintHeroes(); startQuotes(); window.scrollTo(0, 0);
  if (!S.onboarded){ openWelcome(); return; }
  toast(`Welcome back, ${S.hero.name || 'Hero'}.`); afterTitle(then);
}
function newProfile(){
  if (PROFILES.list.length >= MAX_PROFILES) return;
  let n = 1; const taken = id => PROFILES.list.some(p => p.id === id) || (() => { try { return !!localStorage.getItem(keyFor(id)); } catch(e){ return false; } })();
  while (taken('p' + n)) n++;
  const id = 'p' + n; PROFILES.list.push({id, name:'Hero', created:Date.now(), played:Date.now()}); useProfile(id, true);
}
function renameProfile(id, name){
  name = (name || '').trim().slice(0, 14) || 'Hero'; const e = PROFILES.list.find(p => p.id === id); if (!e) return;
  e.name = name; writeProfiles(PROFILES);
  if (id === PROFILES.active && KEY === keyFor(id)){ S.hero.name = name; save(); render(); renderHeader(); }
  else { try { const r = localStorage.getItem(keyFor(id)); if (r){ const o = JSON.parse(r); if (o.hero) o.hero.name = name; localStorage.setItem(keyFor(id), JSON.stringify(o)); } } catch(e){} }
  pf.edit = null; renderProfiles(); toast(`Renamed to ${name}.`);
}
function deleteProfile(id){
  try { localStorage.removeItem(keyFor(id)); localStorage.removeItem(keyFor(id) + '-before-restore'); } catch(e){}
  const name = (PROFILES.list.find(p => p.id === id) || {}).name || 'Profile';
  PROFILES.list = PROFILES.list.filter(p => p.id !== id);
  if (PROFILES.active === id){ PROFILES.active = null; KEY = null; pf.canClose = false; }   // nothing saves until another profile is chosen
  writeProfiles(PROFILES); pf.edit = null; pf.del = null; renderProfiles(); toast(`${name} deleted.`);
}
// Where to go once a profile is in use: the title screen's menu choice, if any
function afterTitle(act){
  if (act === 'hero'){ document.querySelector('[data-act=openHero]')?.click(); return; }
  const to = {train:'today', arcs:'arcs', stats:'progress'}[act];
  if (to && to !== tab){ tab = to; render(true); }
}
let pfDelT = null;
document.getElementById('profiles').addEventListener('click', e => {
  const b = e.target.closest('[data-pf]'); if (!b || !pf) return;
  const a = b.dataset.pf, id = b.dataset.id;
  if (a !== 'del') pf.del = null;
  if (a === 'pick'){ buzz(10); sfx('start'); useProfile(id); }
  else if (a === 'new'){ buzz(10); newProfile(); }
  else if (a === 'close') closeProfiles();
  else if (a === 'edit'){ pf.edit = pf.edit === id ? null : id; renderProfiles(); document.getElementById('pfName')?.focus(); }
  else if (a === 'rename') renameProfile(id, document.getElementById('pfName').value);
  else if (a === 'del'){
    if (pf.del !== id){ pf.del = id; renderProfiles(); clearTimeout(pfDelT); pfDelT = setTimeout(() => { if (pf && pf.del === id){ pf.del = null; renderProfiles(); } }, 5000); return; }
    deleteProfile(id);
  }
});
document.getElementById('profiles').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'pfName'){ e.preventDefault(); renameProfile(pf.edit, e.target.value); }
  if (e.key === 'Escape' && pf){ e.preventDefault(); e.stopPropagation(); if (pf.edit){ pf.edit = null; renderProfiles(); } else if (pf.canClose) closeProfiles(); }
});

/* ---------- Settings ---------- */
// An iOS-style grouped list: training preferences, units, your character, and your data
const REST_SCALES = [[.75, 'Shorter'], [1, 'Standard'], [1.25, 'Longer']];
function renderSettings(){
  const p = S.prefs, el = document.getElementById('stIn');
  const sw = (k, label, hint) => `<div class="st-row"><div><b>${label}</b>${hint ? `<span>${hint}</span>` : ''}</div>
    <button type="button" class="st-switch" role="switch" data-act="pref" data-k="${k}" aria-checked="${!!p[k]}" aria-label="${label}"><i></i></button></div>`;
  el.innerHTML = `<div class="row-between sheet-head"><h2 class="sec" id="stTitle">Settings</h2><button class="btn btn-power btn-sm" data-act="closeSettings">Done</button></div>
    <h4 class="st-h">Training</h4>
    <div class="st-group">
      ${sw('restAuto', 'Rest timer', 'Starts on its own after each set')}
      <div class="st-row st-col"><div><b>Rest length</b><span>Heavy lifts start at 2:30 to 3:00 on Standard</span></div>
        <div class="seg seg-wide" role="group" aria-label="Rest length">${REST_SCALES.map(([v, t]) => `<button type="button" data-act="restScale" data-v="${v}" aria-pressed="${p.restScale === v}">${t}</button>`).join('')}</div></div>
      ${sw('ramp', 'Warm-up ramp', 'Warm-up sets before the big barbell lifts')}
      ${sw('sound', 'Sound effects', '8-bit sounds for sets, PRs, level-ups and rank-ups')}
      ${sw('vibrate', 'Vibration', 'A buzz when you log a set or rest is over, and a big one for PRs')}
      ${sw('quotes', 'Quotes', 'Words from the masters on Today and between sets')}
    </div>
    <h4 class="st-h">Units</h4>
    <div class="st-group"><div class="st-row"><div><b>Weight</b><span>Your maxes convert automatically</span></div>
      <div class="seg" role="group" aria-label="Units"><button type="button" data-act="unit" data-unit="lb" aria-pressed="${S.unit === 'lb'}">lb</button><button type="button" data-act="unit" data-unit="kg" aria-pressed="${S.unit === 'kg'}">kg</button></div></div></div>
    <h4 class="st-h">Title screen</h4>
    <div class="st-group"><div class="st-row"><div><b>Scene</b><span>The main menu each time the app opens</span></div>
      <select id="stTitleScene" class="st-select" aria-label="Title screen scene"><option value="shuffle"${p.title === "shuffle" ? " selected" : ""}>Shuffle</option>${TITLE_SCENES.map(s => `<option value="${s.id}"${p.title === s.id ? " selected" : ""}>${s.name}</option>`).join("")}</select></div>
      <button type="button" class="st-row st-link" data-act="showTitle"><div><b>Show title screen</b><span>See it now</span></div><span aria-hidden="true">›</span></button></div>
    <h4 class="st-h">Profile</h4>
    <div class="st-group"><button type="button" class="st-row st-link" data-act="switchProfile"><div><b>${esc(S.hero.name || 'Hero')}'s profile</b><span>Switch profile or add someone new · ${PROFILES.list.length} on this device</span></div><span aria-hidden="true">›</span></button></div>
    <h4 class="st-h">Character</h4>
    <div class="st-group"><button type="button" class="st-row st-link" data-act="stEditHero"><div><b>${esc(S.hero.name || 'Hero')}</b><span>Look, hair, gear and title</span></div><span aria-hidden="true">›</span></button>
      <button type="button" class="st-row st-link" data-act="stSetup"><div><b>Run setup again</b><span>Choose your character, path and arc again. Your level and progress stay.</span></div><span aria-hidden="true">›</span></button></div>
    ${installHTML()}
    ${SHOW_TEST_TOOLS ? `<h4 class="st-h">Testing</h4>
    <div class="st-group"><button type="button" class="st-row st-link" data-act="maxProfile"><div><b>Make a maxed-out test profile</b><span>A new "Max Test" profile with everything unlocked: Lv 250, every boss, item and gear. Your own profile stays as it is.</span></div><span aria-hidden="true">›</span></button></div>` : ''}
    <h4 class="st-h">Your data</h4>
    ${backupHTML()}
    <h4 class="st-h">Danger zone</h4>
    <div class="st-group st-danger"><div class="st-row st-col"><div><b>Reset all progress</b><span>Erases levels, gear, achievements, maxes and history on this device. Back up first.</span></div>
      <button class="btn btn-danger btn-sm" data-act="reset">${resetArmed ? 'Tap again to erase everything' : 'Reset all progress'}</button></div></div>
    <p class="fine st-foot">Training Arc · Your progress is saved on this device.</p>`;
}
function openSettings(){ renderSettings(); openDialog('settings', '[data-act=closeSettings]'); }
const settingsOpen = () => !document.getElementById('settings').hidden;

const saveSummary = s => `Lv ${levelFor(s.xp)} · ${rankFor(s.xp).k}-Rank · ${s.log.length} workout${s.log.length === 1 ? '' : 's'}`;
function backupHTML(){
  const last = S.lastBackup, days = last ? dayNum(todayIso()) - dayNum(last) : null;
  const stale = S.log.length >= 3 && (days === null || days >= 14);
  const rp = restorePending;
  return `<section class="panel backup">
    <div class="row-between"><h3>Backup</h3><span class="fine">${last ? `Last backup: ${days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`}` : 'Never backed up'}</span></div>
    <p class="fine">Your progress lives only in this browser. Save a backup now and then, so clearing your browser or switching phones never costs you your levels, gear and achievements.</p>
    ${stale ? `<p class="backup-warn">${last ? `It has been ${days} days since your last backup.` : `You have ${S.log.length} workouts and no backup yet.`} Save one now.</p>` : ''}
    <div class="backup-btns"><button class="btn btn-power btn-sm" data-act="backupSave">Save backup file</button><button class="btn btn-ghost btn-sm" data-act="backupCode">Copy backup code</button></div>
    ${backupCodeOpen ? `<textarea id="backupCodeBox" class="backup-box" readonly rows="4" aria-label="Backup code">${esc(backupJSON())}</textarea>
      <p class="fine">This code is your whole save. Paste it somewhere safe, like a note or an email to yourself.</p>` : ''}
    <h4 class="backup-h">Restore</h4>
    ${rp ? `<div class="restore-confirm" role="alert">
        <p><b>Restore this backup?</b></p>
        <p class="fine">Backup${rp.saved ? ` from ${niceDate(rp.saved.slice(0, 10))}` : ''}: ${saveSummary(rp.s)}${rp.s.hero && rp.s.hero.name ? `, ${esc(rp.s.hero.name)}` : ''}</p>
        <p class="fine">It replaces what's here now: ${saveSummary(S)}. You can undo it right after.</p>
        <div class="backup-btns"><button class="btn btn-power btn-sm" data-act="restoreYes">Replace my progress</button><button class="btn btn-ghost btn-sm" data-act="restoreNo">Cancel</button></div></div>`
      : `<div class="backup-btns"><button class="btn btn-ghost btn-sm" data-act="restoreFile">Restore from file</button></div>
        <input type="file" id="restoreFileInput" accept=".json,application/json,text/plain" hidden>
        <details class="restore-paste"><summary class="fine">Or paste a backup code</summary>
          <textarea id="restoreText" class="backup-box" rows="3" placeholder="Paste your backup code here" aria-label="Backup code to restore"></textarea>
          <button class="btn btn-ghost btn-sm" data-act="restorePaste">Restore from code</button></details>`}
    ${undoAvail ? `<div><button class="btn btn-ghost btn-sm" data-act="restoreUndo">Undo restore</button></div>` : ''}
  </section>`;
}
const STAT_COLOR = {str:'#ff5a6e', spd:'#4cc3ff', end:'#3ddc97', tec:'#b98cff'};
// E: your character as a trading card: art on your stage, rank, title, level, and stats. The border takes your rank's color.
function tcardHTML(r, n, lv){
  const vals = STAT_KEYS.map(([k]) => statVal(k)), p = prog(), o = ovr(p.path);
  return `<section class="tcard" style="--rc:var(--rank-${r.k.toLowerCase()})"><div class="tcard-in">
    <button class="tcard-art stage-bg" data-act="openHero" aria-label="Customize your character">
      <span class="tcard-ovr" style="--tc:${tierColor(o)}" aria-label="Overall ${o}, ${pathOf(p).name}"><b class="num">${o}</b><span>OVR</span><span>${POS[p.path]}</span></span><span class="tcard-edit">Edit</span>
      ${flairLayer()}<canvas id="cardImg" class="card-img" width="128" height="208" role="img"></canvas>
    </button>
    <div class="tcard-head"><div class="tcard-who">${emblem(r.k, 'xs')}<div class="tcard-name">${esc(S.hero.name || 'Hero')}</div></div><div class="tcard-title">${r.k}-Rank · "${heroTitle()}"</div></div>
    <div><div class="row-between"><span class="eyebrow num">Level ${lv.L} / ${MAX_LEVEL}</span><span class="fine num">${lv.L < MAX_LEVEL ? `${fmt(lv.toNext)} XP to Lv ${lv.L + 1}` : 'Max level'}</span></div>
      <div class="bar" style="margin-top:6px" role="img" aria-label="${Math.round(lv.pct)} percent of the way to level ${lv.L + 1}"><i style="width:${lv.pct}%"></i></div></div>
    <div class="tcard-stats">${STAT_KEYS.map(([k, ab, name], i) => `<div class="tcard-stat" title="${name}"><span>${ab}<b class="num" style="color:${tierColor(vals[i])}">${vals[i]}</b></span><div class="bar" role="img" aria-label="${name} ${vals[i]} out of 99"><i style="--sc:${STAT_COLOR[k]};width:${vals[i]}%"></i></div></div>`).join('')}</div>
    <button class="btn btn-ghost btn-sm tcard-share" data-act="shareCard" data-v="card">Share your card</button>
    <div class="tcard-foot"><span>${pathOf(p).name} OVR</span><span>${n ? `Lv ${n.lv} unlocks ${n.k}-Rank` : 'Final rank'}</span></div>
  </div></section>
  <section class="panel radar-panel"><div class="row-between"><h3>Stat chart</h3><span class="fine num">OVR ${o}</span></div>
    <div class="radar-wrap">${radarSVG(vals)}<ul class="radar-key">${STAT_KEYS.map(([k, ab], i) => `<li><b style="color:${STAT_COLOR[k]}">${ab} <span class="num">${vals[i]}</span></b><span>${statSource(k)}</span></li>`).join('')}</ul></div></section>
  ${rivalHTML()}
  <p class="fine">Ratings run from 45 to 99. Every workout raises the stats your path trains, and harder arcs raise them faster. Your real numbers count too: STR reads your squat, bench and deadlift maxes, and END your workouts over the last 4 weeks. OVR is weighted by your current path, like a position. 90+ is gold, 80s green, 70s blue.</p>`;
}
function rewardsHTML(){
  const nx = nextReward(), got = REWARDS.filter(rewardOpen).length;
  const sw = r => r.color ? `<span class="rw-sw" style="--c:${r.color}"></span>` : '';
  const card = r => `<div class="rw${rewardOpen(r) ? ' got' : ''}"><b>Lv ${r.lv} · ${REWARD_KIND[r.kind]}</b><span>${sw(r)}${r.kind === 'title' ? `"${r.name}"` : r.name}</span></div>`;
  const soon = REWARDS.filter(r => r.lv > curLevel()).slice(1, 7);
  return `<section class="panel"><div class="row-between"><h3>Rewards</h3><span class="fine num">${got} of ${REWARDS.length} unlocked</span></div>
    ${nx ? `<div class="rw-next"><span class="rw-lv">Lv ${nx.lv}</span><div><div class="eyebrow">Next reward</div><div>${sw(nx)}${rewardLabel(nx)}</div><div class="fine num">${fmt(LEVEL_XP[nx.lv] - S.xp)} XP to go</div></div></div>` : '<p class="fine">Every reward unlocked. Legend.</p>'}
    ${soon.length ? `<div class="rw-list">${soon.map(card).join('')}</div>` : ''}
    <details><summary class="fine">All ${REWARDS.length} rewards</summary><div class="rw-list" style="margin-top:8px">${REWARDS.map(card).join('')}</div></details>
    <p class="fine">Something unlocks every 5 levels. Equip titles, colors and stages in the character editor.</p></section>`;
}
/* ---------- Trophy room and Today backdrops ---------- */
// Medal tiers by milestone position, the Big 3 total and its clubs, your max drawn as a loaded barbell,
// and backdrops earned with strength that sit behind your hero on Today and on your card.
const TIER_NAME = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby', 'Emerald', 'Mythic', 'Legend'];
const hasMs = (lift, lb) => !!S.ach[`${lift}-${lb}`];
const toLb = v => v * (S.unit === 'kg' ? 2.20462 : 1), fromLb = v => v / (S.unit === 'kg' ? 2.20462 : 1);
const bigThree = () => ['squat', 'bench', 'deadlift'].reduce((t, l) => t + toLb(bestMax(l)), 0);   // in lb
const CLUBS = [500, 750, 1000, 1200, 1500, 2000];
const clubOf = tot => [...CLUBS].reverse().find(c => tot >= c - .5) || 0;
const clubLabel = c => S.unit === 'kg' ? `${fmt(Math.round(c / 2.20462 / 5) * 5)} kg` : `${fmt(c)} lb`;
const arcsCleared = () => [...new Set(S.log.filter(l => l.boss).map(l => l.rank))].sort((a, b) => 'EDCBAS'.indexOf(a) - 'EDCBAS'.indexOf(b));

// Your max as plates on a bar: standard colors, heaviest plates closest to the collar
function platesFor(total){
  const kg = S.unit === 'kg', bar = kg ? 20 : 45;
  const set = kg ? [[25, '#d94a45', 44], [20, '#2f6fd6', 44], [15, '#f2c94c', 40], [10, '#3ddc97', 36], [5, '#e9e9ef', 28], [2.5, '#d94a45', 22], [1.25, '#b9b9c4', 18]]
    : [[45, '#2f6fd6', 44], [35, '#f2c94c', 40], [25, '#3ddc97', 36], [10, '#e9e9ef', 28], [5, '#d94a45', 22], [2.5, '#b9b9c4', 18]];
  let side = Math.max(0, (total - bar) / 2); const out = [];
  for (const [w, c, h] of set) while (side >= w - 1e-6 && out.length < 14){ out.push({w, c, h}); side -= w; }
  return out;
}
function barbellSVG(total){
  const ps = platesFor(total), W = 320, H = 54, cx = W / 2, m = H / 2; let plates = '';
  [-1, 1].forEach(dir => { let x = cx + dir * 50;
    for (const p of ps){ const w = p.w >= (S.unit === 'kg' ? 10 : 25) ? 8 : 5, px = dir > 0 ? x : x - w;
      plates += `<rect x="${px}" y="${m - p.h / 2}" width="${w}" height="${p.h}" rx="1.5" fill="${p.c}" stroke="rgba(0,0,0,.35)"/>`; x += dir * (w + 1); } });
  return `<svg class="tr-bb" viewBox="0 0 ${W} ${H}" role="img" aria-label="${fmt(total)} ${S.unit} on the bar: ${ps.length} plates a side">
    <rect x="4" y="${m - 2}" width="${W - 8}" height="4" rx="2" fill="#a8aebb"/><rect x="${cx - 46}" y="${m - 1.5}" width="92" height="3" fill="#7d8492"/>
    <rect x="${cx - 50}" y="${m - 6}" width="4" height="12" rx="1" fill="#d6dae2"/><rect x="${cx + 46}" y="${m - 6}" width="4" height="12" rx="1" fill="#d6dae2"/>${plates}</svg>`;
}

// Backdrops. Each one is a scene layer (200 × 130, floor near the bottom) drawn behind the hero; the left and
// top stay fairly clear on Today, where the quote bubble sits.
const FLAIRS = [
  {id:'plates',   name:'Plate Wall',        how:'One Plate (135 lb) on any lift',        ok:() => Object.keys(MILESTONES).some(l => hasMs(l, 135))},
  {id:'chalk',    name:'Chalk Storm',       how:'Bench 185 lb',                           ok:() => hasMs('bench', 185)},
  {id:'rack',     name:'Iron Rack',         how:'Squat Three Plates (315 lb)',            ok:() => hasMs('squat', 315)},
  {id:'platform', name:'Deadlift Platform', how:'Deadlift Four Plates (405 lb)',          ok:() => hasMs('deadlift', 405)},
  {id:'pennants', name:'PR Pennants',       how:'Overhead Press 135 lb',                  ok:() => hasMs('ohp', 135)},
  {id:'podium',   name:'Champion Podium',   how:'Power Clean 185 lb',                     ok:() => hasMs('clean', 185)},
  {id:'banners',  name:'Arc Banners',       how:'Clear an arc by beating its boss',       ok:() => arcsCleared().length > 0},
  {id:'trophies', name:'Trophy Shelf',      how:'Earn 8 strength achievements',           ok:() => Object.keys(S.ach).length >= 8},
  {id:'club',     name:'Club Sign',         how:'A 500 lb Big 3 total',                   ok:() => bigThree() >= 499.5},
  {id:'gold',     name:'Golden Aura',       how:'A Gold medal (third milestone) on 3 lifts', ok:() => Object.entries(MILESTONES).filter(([l, L]) => hasMs(l, L[2])).length >= 3},
  {id:'legend',   name:'Hall of Legends',   how:'Every milestone on one lift',            ok:() => Object.entries(MILESTONES).some(([l, L]) => L.every(lb => hasMs(l, lb)))}
];
const flairOf = id => FLAIRS.find(f => f.id === id);
// Which backdrop a single milestone unlocks, for the "next up" line
const MS_FLAIR = {'bench-185':'chalk', 'squat-315':'rack', 'deadlift-405':'platform', 'ohp-135':'pennants', 'clean-185':'podium'};
// Drawing a backdrop. o says where it goes when stacked (see layoutFlairs); with no o it takes its own best spot,
// which is how the previews in the Trophy room look.
//   o.at     the spot it got: 'L' bottom left, 'R' right wall, 'TR' top right, 'MID' mid wall, 'none' (stays small)
//   o.inset  how far to pull pieces in from the outer edges (Hall of Legends pillars stand there)
//   o.corners which floor corners the platform's leaning plates can use; o.banner whether Legends hangs its banner
//   o.raise  lifts the podium onto the platform; o.narrow a slimmer Club sign beside the rack
function flairSVG(id, o = {}){
  const s = body => `<svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${body}</svg>`;
  const plate = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${r * .62}" fill="none" stroke="rgba(255,255,255,.18)"/><circle cx="${x}" cy="${y}" r="${r * .22}" fill="#2a2a33"/>`;
  const at = o.at || {plates:'LR', chalk:'L', club:'L', trophies:'TR', banners:'TR', pennants:'TR'}[id], inset = o.inset || 0;
  const L = o.rack ? (inset ? 31 : 25) : 33, Rx = (o.rack ? 184 : 177) - inset;   // centers of the left and right floor spots (wider apart beside the rack)
  if (id === 'plates'){
    const tree = (x, big) => big ? `<rect x="${x - 2}" y="58" width="4" height="56" fill="#4b5060"/><rect x="${x - 9}" y="111" width="18" height="3" fill="#3a3e4a"/>${plate(x, 70, 13, '#2f6fd6')}${plate(x, 92, 15, '#d94a45')}`
      : `<rect x="${x - 2}" y="50" width="4" height="64" fill="#4b5060"/><rect x="${x - 9}" y="111" width="18" height="3" fill="#3a3e4a"/>${plate(x, 62, 11, '#3ddc97')}${plate(x, 82, 13, '#f2c94c')}${plate(x, 100, 11, '#2f6fd6')}`;
    return s((at.includes('L') ? tree(L, true) : '') + (at.includes('R') ? tree(Rx, false) : ''));
  }
  if (id === 'chalk'){ let dust = ''; for (let i = 0; i < 22; i++){ const x = 14 + (i * 37) % 176, y = 40 + (i * 23) % 70; dust += `<rect class="fl-dust" x="${x}" y="${y}" width="${i % 3 ? 1.5 : 2.5}" height="${i % 3 ? 1.5 : 2.5}" fill="#fff" style="animation-delay:${(i * .37 % 4).toFixed(2)}s"/>`; }
    const bx = at === 'R' ? Rx : L, bowl = at === 'L' || at === 'R' ? `<rect x="${bx - 11}" y="92" width="22" height="22" fill="#3b3f4c"/><ellipse cx="${bx}" cy="91" rx="15" ry="4" fill="#5a5f6e"/><ellipse cx="${bx}" cy="90" rx="11" ry="2.5" fill="#f4f4f8"/><ellipse cx="${bx}" cy="84" rx="16" ry="6" fill="rgba(255,255,255,.18)"/>` : '';
    return s(bowl + dust); }
  if (id === 'rack') return s(`<rect x="62" y="24" width="5" height="90" fill="#4b5060"/><rect x="146" y="24" width="5" height="90" fill="#4b5060"/><rect x="63" y="24" width="2" height="90" fill="#6b7184"/><rect x="147" y="24" width="2" height="90" fill="#6b7184"/>
    <rect x="58" y="22" width="97" height="5" fill="#3e4250"/><rect x="58" y="76" width="12" height="3" fill="#8a909e"/><rect x="143" y="76" width="12" height="3" fill="#8a909e"/>
    <rect x="40" y="47" width="133" height="3" rx="1.5" fill="#b8bdc8"/><rect x="66" y="44" width="4" height="7" fill="#8a909e"/><rect x="143" y="44" width="4" height="7" fill="#8a909e"/>
    <rect x="44" y="37" width="6" height="23" rx="1" fill="#2f6fd6"/><rect x="51" y="39" width="5" height="19" rx="1" fill="#f2c94c"/><rect x="163" y="37" width="6" height="23" rx="1" fill="#2f6fd6"/><rect x="157" y="39" width="5" height="19" rx="1" fill="#f2c94c"/>`);
  if (id === 'platform'){
    const c = o.corners == null ? 'LR' : o.corners, x0 = o.l || 34, x1 = o.r || 166;   // narrower when other pieces stand in the floor corners
    let planks = ''; for (let x = x0 + 18; x < x1 - 16; x += 12) planks += `<rect x="${x}" y="106" width="1" height="10" fill="#7a5230"/>`;
    return s(`<rect x="${x0}" y="105" width="${x1 - x0}" height="11" fill="#2b2b33"/><rect x="${x0 + 14}" y="105" width="${x1 - x0 - 28}" height="11" fill="#a0703f"/>${planks}<rect x="${x0}" y="104" width="${x1 - x0}" height="2" fill="#c49058"/>
      ${c.includes('L') ? `${plate(24 + inset, 98, 14, '#2a2a33')}<circle cx="${24 + inset}" cy="98" r="14" fill="none" stroke="#d94a45" stroke-width="2"/>` : ''}${c.includes('R') ? `${plate(178 - inset, 96, 15, '#2a2a33')}<circle cx="${178 - inset}" cy="96" r="15" fill="none" stroke="#2f6fd6" stroke-width="2"/>` : ''}
      <rect x="70" y="109" width="8" height="2" fill="rgba(255,255,255,.5)"/><rect x="118" y="111" width="6" height="2" fill="rgba(255,255,255,.4)"/>`); }
  if (id === 'pennants'){ const cols = ['#ff4d7d', '#ffd23f', '#4cc3ff', '#3ddc97', '#b98cff'], mid = at === 'MID', y0 = mid ? 30 : o.high ? 4 : 10, x0 = mid ? 52 : 92 - inset, n = mid ? 9 : inset ? 6 : 7, fh = o.high ? 11 : 14; let f = '';
    for (let i = 0; i < n; i++){ const x = x0 + i * 15, y = y0 + Math.abs((n - 1) / 2 - i) * 1.5; f += `<polygon class="fl-sway" points="${x},${y} ${x + 12},${y} ${x + 6},${y + fh}" fill="${cols[i % 5]}" style="animation-delay:${i * .2}s"/>`; }
    return s(`<polyline points="${x0 - 4},${y0} ${x0 + n * 7.5},${y0 + 8} ${x0 + n * 15 + 2},${y0}" fill="none" stroke="#e8e2f6" stroke-width="1"/>${f}`); }
  if (id === 'podium'){ const up = o.raise || 0;
    return s(`<polygon points="70,0 92,0 120,112 52,112" fill="rgba(255,240,200,.08)"/><polygon points="128,0 146,0 168,112 104,112" fill="rgba(255,240,200,.07)"/><g transform="translate(0 ${-up})">
    <rect x="62" y="96" width="30" height="18" fill="#c9ccd6"/><rect x="92" y="88" width="34" height="26" fill="#ffd23f"/><rect x="126" y="100" width="28" height="14" fill="#cd8a4a"/>
    <rect x="92" y="88" width="34" height="3" fill="#fff3b0"/><text x="109" y="106" text-anchor="middle" font-size="12" fill="#5a3f00" style="font-family:var(--display)">1</text><text x="77" y="109" text-anchor="middle" font-size="9" fill="#4a4d58" style="font-family:var(--display)">2</text><text x="140" y="110" text-anchor="middle" font-size="9" fill="#5a3010" style="font-family:var(--display)">3</text></g>`); }
  if (id === 'banners'){ const ks = arcsCleared(), col = {E:'#8a8fa0', D:'#3ddc97', C:'#4cc3ff', B:'#b98cff', A:'#ff4d7d', S:'#ffd23f'};
    const left = at === 'L', y = at === 'R' ? 42 : at === 'L' ? 66 : 6, max = at === 'TR' ? 5 : 3, list = ks.slice(-max);
    const xAt = i => left ? 8 + inset + i * 22 : 178 - inset - i * 22, rodX = left ? 4 + inset : xAt(list.length - 1) - 4;
    return s(`<rect x="${rodX}" y="${y}" width="${list.length * 22 + 4}" height="2" fill="#6b5a3a"/>${list.map((k, i) => { const x = xAt(i); return `<g class="fl-sway" style="animation-delay:${i * .3}s"><rect x="${x}" y="${y + 2}" width="16" height="30" fill="${col[k]}"/><polygon points="${x},${y + 32} ${x + 16},${y + 32} ${x + 8},${y + 25}" fill="rgba(0,0,0,.35)"/><text x="${x + 8}" y="${y + 20}" text-anchor="middle" font-size="11" fill="#14101f" style="font-family:var(--display)">${k}</text></g>`; }).join('')}`); }
  if (id === 'trophies'){ const n = Math.min(at === 'TR' ? 6 : 4, Math.max(1, Math.floor(Object.keys(S.ach).length / 4))), tc = ['#ffd23f', '#c9ccd6', '#cd8a4a'];
    const left = at === 'L', y = at === 'R' ? 50 : at === 'L' ? 80 : o.high ? 3 : 12, xAt = i => left ? 14 + inset + i * 15 : 184 - inset - i * 15;
    let t = ''; for (let i = 0; i < n; i++){ const x = xAt(i), c = tc[i % 3]; t += `<rect x="${x - 4}" y="${y}" width="8" height="7" rx="2" fill="${c}"/><rect x="${x - 1}" y="${y + 7}" width="2" height="4" fill="${c}"/><rect x="${x - 3}" y="${y + 11}" width="6" height="2" fill="${c}"/><rect x="${x - 6}" y="${y + 1}" width="2" height="4" fill="none" stroke="${c}"/><rect x="${x + 4}" y="${y + 1}" width="2" height="4" fill="none" stroke="${c}"/>`; }
    const sx = left ? 6 + inset : xAt(n - 1) - 10;
    return s(`<rect x="${sx}" y="${y + 13}" width="${n * 15 + 10}" height="3" fill="#6b4a2b"/><rect x="${sx}" y="${y + 16}" width="${n * 15 + 10}" height="1" fill="#3a2614"/>${t}`); }
  if (id === 'club'){ const c = clubOf(bigThree()) || 500, label = clubLabel(c).toUpperCase(), w = o.narrow ? 44 : 78;
    const x = at === 'TR' || at === 'R' ? 194 - inset - w : inset ? 16 : 10, y = at === 'TR' ? 8 : at === 'R' ? 44 : 78, cx = x + w / 2;   // on the left it ends before the rack and podium
    return s(`<g class="fl-neon"><rect x="${x}" y="${y}" width="${w}" height="26" rx="4" fill="rgba(10,8,20,.55)" stroke="#ff7fdb" stroke-width="1.5"/>
      <text x="${cx}" y="${y + 12}" text-anchor="middle" font-size="${o.narrow ? 8.5 : 10}" fill="#ffe1f6" style="font-family:var(--display);letter-spacing:.04em">${label}</text><text x="${cx}" y="${y + 22}" text-anchor="middle" font-size="7" fill="#7af5ff" style="font-family:var(--label);font-weight:700;letter-spacing:.2em">CLUB</text></g>`); }
  if (id === 'gold'){ let r = ''; for (let i = 0; i < 12; i++){ const a = i * 30; r += `<polygon points="0,0 -5,-140 5,-140" transform="rotate(${a})" fill="rgba(255,210,63,${i % 2 ? .08 : .14})"/>`; }
    let sp = ''; for (let i = 0; i < 10; i++) sp += `<rect class="fl-twinkle" x="${60 + (i * 41) % 120}" y="${14 + (i * 29) % 80}" width="2" height="2" fill="#fff3b0" style="animation-delay:${(i * .31).toFixed(2)}s"/>`;
    return s(`<g transform="translate(130 70)"><g class="fl-spin">${r}</g></g>${sp}`); }
  if (id === 'legend') return s(`<rect x="2" y="14" width="11" height="100" fill="#3a2e10"/><rect x="4" y="14" width="3" height="100" fill="#d4a017"/><rect x="0" y="10" width="15" height="5" fill="#d4a017"/><rect x="0" y="110" width="15" height="5" fill="#d4a017"/>
    <rect x="187" y="14" width="11" height="100" fill="#3a2e10"/><rect x="193" y="14" width="3" height="100" fill="#d4a017"/><rect x="185" y="10" width="15" height="5" fill="#d4a017"/><rect x="185" y="110" width="15" height="5" fill="#d4a017"/>
    ${o.banner === false ? '' : `<g class="fl-sway"><rect x="146" y="16" width="24" height="40" fill="#5a0f1c"/><rect x="146" y="16" width="24" height="3" fill="#d4a017"/><polygon points="146,56 170,56 158,48" fill="#2a0810"/><circle cx="158" cy="33" r="7" fill="#ffd23f"/><circle cx="158" cy="33" r="4" fill="none" stroke="#8a6200"/></g>`}
    <rect x="0" y="112" width="200" height="2" fill="rgba(212,160,23,.6)"/>`);
  return '';
}
// Up to three backdrops at once. They draw back to front in a fixed order (light and walls behind, gear in the
// middle, the floor and chalk dust in front), and each one gets a spot of its own so nothing piles up.
const MAX_FLAIRS = 3;
const FLAIR_LAYER = ['gold', 'legend', 'trophies', 'banners', 'pennants', 'club', 'rack', 'plates', 'platform', 'podium', 'chalk'];
// Where each backdrop can go, best first, and the order they choose in. Spots: L bottom left (under the quote
// bubble on Today), R right wall, TR top right, F the floor, E the outer edges. An empty choice means it can
// shrink to fit (the chalk bowl leaves and only the dust stays; the podium stands on the platform).
const FLAIR_CHOICE = ['legend', 'rack', 'gold', 'platform', 'podium', 'club', 'trophies', 'banners', 'pennants', 'plates', 'chalk'];
const FLAIR_SPOTS = {legend:[['E']], rack:[[]], gold:[[]], platform:[['F']], podium:[['F'], []],
  club:[['L'], ['TR'], ['R']], trophies:[['TR'], ['R'], ['L']], banners:[['TR'], ['R'], ['L']], pennants:[['TR'], ['MID']],
  plates:[['L', 'R'], ['L'], ['R']], chalk:[['L'], ['R'], []]};
function layoutFlairs(ids){
  const used = new Set(), out = {}, has = id => ids.includes(id), inset = has('legend') ? 10 : 0;   // room for the Legends pillars at the edges
  for (const id of FLAIR_CHOICE.filter(has)){
    const pick = FLAIR_SPOTS[id].find(opt => opt.every(sp => !used.has(sp))) || FLAIR_SPOTS[id][FLAIR_SPOTS[id].length - 1];
    pick.forEach(sp => used.add(sp));
    out[id] = {at:pick.join('') || 'none', inset};
  }
  const rack = has('rack');
  if (out.podium && has('platform')) out.podium.raise = 8;   // stands on the platform
  if (out.club && out.club.at === 'L' && (rack || has('podium'))) out.club.narrow = true;   // fits beside the rack's upright and the podium
  if (out.platform){ const corners = ['L', 'R'].filter(sp => !used.has(sp));   // leaning plates only where there's room;
    Object.assign(out.platform, {corners:corners.join(''), l:used.has('L') ? 54 : 34, r:used.has('R') ? 146 : 166}); }   // the floor stops short of pieces in the corners
  if (out.legend) out.legend.banner = !used.has('TR') && !used.has('R') && !rack;
  if (rack) for (const id of ['plates', 'chalk', 'pennants', 'trophies']) if (out[id]) Object.assign(out[id], {rack:true, high:true});   // clear of the rack's crossbar and bar plates
  if (rack && has('legend') && out.plates && out.plates.at.includes('R')){ out.plates.at = out.plates.at.replace('R', '') || 'L'; }   // no room for the right tree between the rack and a pillar
  return out;
}
function heroFlairs(){
  const h = S.hero[S.hero.gender];
  if (!Array.isArray(h.flairs)){ h.flairs = h.flair ? [h.flair] : []; delete h.flair; }   // saves from when one backdrop was the limit
  return h.flairs;
}
// What you put up stays up until you take it down, even if a max later drops below what earned it
const flairsOn = () => heroFlairs().filter(id => flairOf(id)).sort((a, b) => FLAIR_LAYER.indexOf(a) - FLAIR_LAYER.indexOf(b));
const flairOn = () => flairsOn()[0] || null;
const flairLayer = () => { const ids = flairsOn(), lay = layoutFlairs(ids); return ids.map(id => `<span class="flair fl-${id}" aria-hidden="true">${flairSVG(id, lay[id])}</span>`).join(''); };
// Newly unlocked backdrops, announced once
function announceFlairs(){ S.flairToasted = S.flairToasted || []; const n = FLAIRS.filter(f => f.ok() && !S.flairToasted.includes(f.id)); n.forEach(f => S.flairToasted.push(f.id)); return n; }
const flairNote = () => { const n = announceFlairs(); return n.length ? ` · New backdrop: ${n.map(f => f.name).join(", ")}` : ""; };
// Requirement text in your unit
const howText = f => f.how.replace(/(\d+) lb/g, (m, n) => S.unit === "kg" ? `${MS_KG[n] || Math.round(n / 2.20462)} kg` : m);

// Strength levels by bodyweight multiple, the common gym standards (approximate), for the hero you play.
// Each list is where Beginner, Novice, Intermediate, Advanced and Elite start.
const LEVEL_NAMES = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
const LEVEL_COLOR = ['#a197b8', '#cd8a4a', '#4cc3ff', '#3ddc97', '#ffd23f'];
const STD = {
  male:   {squat:[.75, 1.25, 1.5, 2, 2.5], bench:[.5, .75, 1, 1.5, 2], deadlift:[1, 1.5, 2, 2.5, 3], ohp:[.4, .55, .75, 1, 1.25], clean:[.5, .75, 1, 1.25, 1.5]},
  female: {squat:[.5, .75, 1, 1.5, 2], bench:[.25, .5, .75, 1, 1.25], deadlift:[.5, 1, 1.25, 1.75, 2.25], ohp:[.2, .35, .5, .7, .9], clean:[.35, .5, .7, .9, 1.15]}
};
function strengthLevel(lift, max){
  const bw = S.bw || 0; if (!bw || !max) return null;
  const t = STD[S.hero.gender === 'female' ? 'female' : 'male'][lift], r = max / bw; let i = -1; t.forEach((x, k) => { if (r >= x - 1e-9) i = k; });
  return {ratio:r, i, name:i < 0 ? 'Starting out' : LEVEL_NAMES[i], color:i < 0 ? '#8d86a3' : LEVEL_COLOR[i], next:i < 4 ? {name:LEVEL_NAMES[i + 1], at:t[i + 1] * bw} : null};
}
const kgOf = lb => MS_KG[lb] || Math.round(lb / 2.20462 / 2.5) * 2.5;
const plateText = total => { const ps = platesFor(total); if (!ps.length) return 'Just the bar'; const c = {}; for (const p of ps) c[p.w] = (c[p.w] || 0) + 1;
  return Object.entries(c).sort((a, b) => b[0] - a[0]).map(([w, n]) => `${n} × ${fmt(+w)}`).join(' + ') + ' per side'; };
// The latest max change for a lift; the amount only when there was a real earlier entry to change from
const lastChange = lift => { const H = S.history.filter(h => h.lift === lift && h.iso); return H.length ? {...H[0], delta:H.length > 1 ? H[0].val - H[1].val : 0} : null; };
let medalSel = null;   // the medal whose details are open: {lift, lb}

// The trophy room: count and tiers, Big 3 total and clubs, bodyweight for strength levels, then each lift as a
// loaded barbell, its medals (tap one for details), and what's next
function achHTML(){
  const all = Object.values(MILESTONES).flat().length, got = Object.keys(S.ach).length, u = S.unit;
  const tot = bigThree(), club = clubOf(tot), nextC = CLUBS.find(c => c > tot + .5);
  const tiers = TIER_NAME.map((name, i) => [name, i, Object.entries(MILESTONES).filter(([l, L]) => L[i] && hasMs(l, L[i])).length]).filter(x => x[2]);
  const detail = (l, list) => { if (!medalSel || medalSel.lift !== l) return ''; const lb = medalSel.lb, i = list.indexOf(lb); if (i < 0) return '';
    const on = hasMs(l, lb), best = bestMax(l), val = msVal(lb), fl = MS_FLAIR[`${l}-${lb}`], pct = best ? Math.min(100, best / val * 100) : 0;
    return `<div class="md-card" style="--tc:${TIER_COLOR[i]}" role="region" aria-label="${TIER_NAME[i]} medal details">
      <div class="md-top"><span class="medal md-big${on ? ' on' : ''}" aria-hidden="true"><b class="num">${fmt(val)}</b><small>${u}</small></span>
        <div class="md-who"><p class="md-tier">${TIER_NAME[i]} medal · ${i + 1} of ${list.length}</p><b class="md-name">${msName(lb)}</b><p class="fine">${LIFTS[l]}</p></div>
        <button type="button" class="icon-btn md-x" data-act="medal" data-lift="${l}" data-lb="${lb}" aria-label="Close details">×</button></div>
      <ul class="md-facts">
        <li><span>Weight</span><b class="num">${fmt(lb)} lb · ${fmt(kgOf(lb))} kg</b></li>
        <li><span>On the bar</span><b>${plateText(val)}</b></li>
        ${S.bw ? `<li><span>Bodyweight</span><b class="num">${(val / S.bw).toFixed(2)}× yours</b></li>` : ''}
        <li><span>Status</span><b>${on ? `Earned ${fromYmd(S.ach[`${l}-${lb}`]).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}` : best ? `${fmt(Math.ceil(val - best))} ${u} to go (${Math.round(pct)}% there)` : 'Set your max to start'}</b></li>
        ${fl ? `<li><span>Unlocks</span><b>${flairOf(fl).name} backdrop</b></li>` : ''}
      </ul>${!on && best ? `<div class="bar"><i style="width:${pct}%;background:${TIER_COLOR[i]}"></i></div>` : ''}</div>`; };
  const lift = ([l, list]) => { const best = bestMax(l), nx = nextMs(l), n = list.filter(lb => hasMs(l, lb)).length, ni = nx ? list.indexOf(nx.lb) : -1, fl = nx && MS_FLAIR[`${l}-${nx.lb}`];
    const lv = strengthLevel(l, best), lc = lastChange(l);
    return `<article class="tr-lift"><div class="row-between"><b class="ach-lift">${LIFTS[l]}</b><span class="tr-best">${best ? `<b class="num">${fmt(Math.round(best * 2) / 2)}</b> ${u} max` : '<button type="button" class="tr-set" data-act="tab" data-tab="maxes">Enter max ›</button>'}</span></div>
      ${best ? `<div class="tr-bar">${barbellSVG(best)}</div><p class="tr-plates fine">${plateText(best)}</p>` : ''}
      ${lv ? `<p class="tr-lv"><span class="lv-chip" style="--lc:${lv.color}">${lv.name}</span><span class="num">${lv.ratio.toFixed(2)}× bodyweight</span>${lv.next ? `<span class="fine">${lv.next.name} at ${fmt(Math.ceil(lv.next.at))} ${u}</span>` : '<span class="fine">Top level</span>'}</p>` : ''}
      <div class="ach-medals">${list.map((lb, i) => { const on = hasMs(l, lb), sel = medalSel && medalSel.lift === l && medalSel.lb === lb;
        return `<button type="button" class="medal${on ? ' on' : ''}${sel ? ' sel' : ''}" style="--tc:${TIER_COLOR[i]}" data-act="medal" data-lift="${l}" data-lb="${lb}" aria-expanded="${!!sel}" aria-label="${TIER_NAME[i]} medal: ${msName(lb)}, ${fmt(msVal(lb))} ${u}, ${on ? 'earned' : 'locked'}"><b class="num">${fmt(msVal(lb))}</b><small>${PLATES_NAME[lb] ? (lb - 45) / 90 + 'P' : 'Club'}</small></button>`; }).join('')}</div>
      ${detail(l, list)}
      ${nx ? `<div class="tr-next"><div class="bar"><i style="width:${best ? Math.min(100, best / nx.val * 100) : 0}%;background:${TIER_COLOR[ni]}"></i></div>
        <p class="fine">Next: <b style="color:${TIER_COLOR[ni]}">${TIER_NAME[ni]}</b> · ${nx.name} (${fmt(nx.val)} ${u})${best ? ` · ${fmt(Math.ceil(nx.toGo))} ${u} to go` : ' · set your max to start'}${fl ? ` · unlocks the <b>${flairOf(fl).name}</b> backdrop` : ''}</p></div>`
        : '<p class="fine tr-done">Every milestone done. Legendary.</p>'}
      <p class="fine tr-foot"><span>${lc ? `Last change ${fromYmd(lc.iso).toLocaleDateString(undefined, {month:'short', day:'numeric'})}${lc.delta ? ` · ${lc.delta > 0 ? '+' : ''}${fmt(Math.round(lc.delta * 2) / 2)} ${lc.unit || u}` : ''}` : ''}</span><span class="num">${n} of ${list.length} medals</span></p></article>`; };
  return `<section class="panel trophy">
    <div class="tr-head"><div><p class="eyebrow">Trophy room</p><h3 class="tr-title">Strength achievements</h3></div><div class="tr-count" aria-label="${got} of ${all} earned"><b class="num">${got}</b><span>of ${all}</span></div></div>
    ${Object.keys(LIFTS).some(l => bestMax(l)) ? '' : `<div class="tr-empty"><b>Your medals come from your real maxes</b><p>The numbers on the Maxes tab are examples until you type in your own. Enter yours and your medals and backdrops unlock right away.</p><button type="button" class="btn btn-power btn-sm" data-act="tab" data-tab="maxes">Enter your maxes</button></div>`}
    ${tiers.length ? `<div class="tr-tiers">${tiers.map(([name, i, c]) => `<span class="tier-chip" style="--tc:${TIER_COLOR[i]}"><i></i>${c} ${name}</span>`).join('')}</div>` : ''}
    <div class="tr-total"><div class="row-between"><span class="eyebrow">Big 3 total</span><b class="num tr-tot">${tot ? `${fmt(Math.round(fromLb(tot)))} ${u}` : '—'}</b></div>
      <div class="bar"><i style="width:${nextC ? Math.min(100, tot / nextC * 100) : 100}%"></i></div>
      <p class="fine">${club ? `<b class="tr-club">${clubLabel(club)} club</b> · ` : ''}${nextC ? `${clubLabel(nextC)} club: ${fmt(Math.ceil(fromLb(nextC - tot)))} ${u} to go` : 'Top club reached.'}${S.bw && tot ? ` · ${(fromLb(tot) / S.bw).toFixed(1)}× bodyweight` : ''}</p></div>
    <label class="tr-bw"><span><b>Bodyweight</b><small>Optional. Unlocks strength levels for each lift.</small></span>
      <span class="tr-bw-in"><input id="trBw" type="number" inputmode="decimal" min="0" step="any" placeholder="${u === 'kg' ? 75 : 170}" value="${S.bw || ''}" aria-label="Bodyweight in ${u}"><em>${u}</em></span></label>
    ${Object.entries(MILESTONES).map(lift).join('')}
    <p class="fine">Tap a medal for its details. P means plates per side: 2P is two 45s on each side, 225 lb. Strength levels are approximate gym standards for the hero you play.</p></section>
  ${flairsHTML()}`;
}
function flairsHTML(){
  const on = flairsOn(), open = FLAIRS.filter(f => f.ok()).length, seen = S.flairSeen || [];
  return `<section class="panel"><div class="row-between"><h3>Today backdrops</h3><span class="fine num">${open} of ${FLAIRS.length} unlocked</span></div>
    <p class="fine">Earned with your strength. Show up to ${MAX_FLAIRS} at once behind your hero on the Today tab and your card. They stack on top of your stage.</p>
    <p class="fl-count"><span class="num">${on.length} of ${MAX_FLAIRS}</span> showing${on.length ? `: ${on.map(id => flairOf(id).name).join(', ')}` : ''}</p>
    <div class="fl-grid">${FLAIRS.map(f => { const ok = f.ok(), sel = on.includes(f.id), full = !sel && on.length >= MAX_FLAIRS;
      return `<button type="button" class="fl-tile${sel ? ' on' : ''}${full && ok ? ' full' : ''}" data-act="flair" data-v="${f.id}"${ok || sel ? ` aria-pressed="${sel}"` : ' disabled'}>
        <span class="fl-prev stage-bg">${ok || sel ? `<span class="flair fl-${f.id}">${flairSVG(f.id)}</span>` : `<span class="fl-lock">${LOCK_SVG}</span>`}${ok && !seen.includes(f.id) ? '<span class="fl-new">New</span>' : ''}${sel ? '<span class="fl-on" aria-hidden="true">✓</span>' : ''}</span>
        <b>${f.name}</b><small>${sel ? 'Showing · tap to remove' : ok ? (full ? `${MAX_FLAIRS} showing · remove one first` : 'Tap to show') : howText(f)}</small></button>`; }).join('')}</div></section>`;
}
const LOCK_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>';
// One lift's max over time: a single line, newest value labeled, tap a point for its date
let chartLift = 'squat';
function chartHTML(){
  const pts = S.history.filter(h => h.lift === chartLift && h.iso).slice().reverse();
  const tabs = `<div class="seg seg-fill" role="group" aria-label="Lift">${Object.keys(LIFTS).map(l => `<button data-act="chartLift" data-v="${l}" aria-pressed="${l === chartLift}">${LIFTS[l].replace('Back ', '').replace('Overhead Press', 'OHP').replace(' Press', '').replace('Power ', '')}</button>`).join('')}</div>`;
  let body;
  if (!pts.length) body = `<p class="empty">No ${LIFTS[chartLift]} history yet. Set or beat a max and it shows up here.</p>`;
  else {
    const W = 320, H = 150, L = 36, R = 44, T = 14, B = 22;
    if (pts.length === 1) pts.unshift({...pts[0], iso:pts[0].iso, solo:true});
    const t0 = fromYmd(pts[0].iso).getTime(), t1 = Math.max(t0 + 864e5, fromYmd(pts[pts.length - 1].iso).getTime());
    const vs = pts.map(p => p.val), lo = Math.min(...vs), hi = Math.max(...vs), pad5 = Math.max(5, (hi - lo) * .15);
    const y0 = lo - pad5, y1 = hi + pad5;
    const X = p => L + (fromYmd(p.iso).getTime() - t0) / (t1 - t0) * (W - L - R), Yv = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
    const ticks = [y0 + (y1 - y0) * .15, (y0 + y1) / 2, y1 - (y1 - y0) * .15].map(v => Math.round(v / inc()) * inc());
    const real = pts.filter(p => !p.solo), last = real[real.length - 1];
    const dfmt = iso => fromYmd(iso).toLocaleDateString(undefined, {month:'short', day:'numeric'});
    body = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${LIFTS[chartLift]} max over time, from ${fmt(real[0].val)} to ${fmt(last.val)} ${S.unit}">
      ${ticks.map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${Yv(v)}" y2="${Yv(v)}"/><text class="axis" x="${L - 6}" y="${Yv(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('')}
      <text class="axis" x="${L}" y="${H - 4}">${dfmt(pts[0].iso)}</text><text class="axis" x="${W - R}" y="${H - 4}" text-anchor="end">${dfmt(last.iso)}</text>
      <polyline class="line" points="${pts.map(p => `${X(p)},${Yv(p.val)}`).join(' ')}"/>
      ${real.map(p => `<g data-act="chartPt" data-tip="${dfmt(p.iso)}: ${fmt(p.val)} ${p.unit} (${p.src})"><circle class="hit" cx="${X(p)}" cy="${Yv(p.val)}" r="14"/><circle class="pt" cx="${X(p)}" cy="${Yv(p.val)}" r="5"/></g>`).join('')}
      <text class="lbl" x="${X(last) + 8}" y="${Yv(last.val) + 4}">${fmt(last.val)}</text>
    </svg><p class="chart-tip" id="chartTip" aria-live="polite">${real.length > 1 ? `+${fmt(last.val - real[0].val)} ${S.unit} since ${dfmt(real[0].iso)}. Tap a point for details.` : 'Tap the point for details.'}</p>`;
  }
  return `<section class="panel"><div class="row-between"><h3>Strength</h3></div>${tabs}${body}</section>`;
}
function viewProgress(){
  const r = rankFor(S.xp), n = nextRank(S.xp), lv = levelInfo(S.xp);
  const hist = S.history.slice(0, 10).map(h => `<div class="li"><div class="l">${LIFTS[h.lift]}<small>${h.date} · ${h.src}</small></div><span class="r num">${fmt(h.val)} ${h.unit}</span></div>`).join('');
  const log = S.log.slice(0, 10).map(l => `<div class="li"><div class="l">${l.day}<small>${l.date} · ${l.prog}, week ${l.week} · ${l.sets} sets</small></div><span class="r num" style="color:var(--power)">+${l.xp} XP</span></div>`).join('');
  return `<section class="row-between"><h1 class="sec">Progress</h1><button class="icon-btn" data-act="openSettings" aria-label="Settings"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></section>
  ${backupNudge()}
  ${tcardHTML(r, n, lv)}
  <div class="stats">
    <div class="stat"><b class="num">${S.log.length}</b><span>Workouts</span></div>
    <div class="stat"><b class="num">${fmt(S.sets)}</b><span>Sets done</span></div>
    <div class="stat"><b class="num">${S.prs}</b><span>PRs</span></div>
  </div>
  ${rewardsHTML()}
  ${gatesHTML()}
  ${achHTML()}
  ${chartHTML()}
  <section class="panel"><h3>Rank ladder</h3>
    <div class="ladder">${RANKS.map((x, i) => `<div class="rung${S.xp >= x.xp ? ' got' : ''}${x.k === r.k ? ' cur' : ''}">${emblem(x.k, 'xs')}<span class="rung-t">${x.t}</span><span class="rung-xp num">Lv ${x.lv}–${rankEndLv(i)}</span></div>`).join('')}</div>
    <p class="fine">${MAX_LEVEL} levels, a new rank every ${LEVELS_PER_RANK}. Earn XP: +10 per set, up to +50 for clearing the day (scaled by how much you finished) and +${FULL_CLEAR} more for finishing every set, all multiplied by the arc's rank (×1 at E up to ×2 at S). New maxes from rep-out sets add +100. Each level takes more XP than the last, so every rank is earned.</p>
  </section>
  <section class="panel"><h3>Max history</h3>${hist ? `<div class="list">${hist}</div>` : '<p class="empty">No changes yet. Updated maxes and PRs show up here.</p>'}</section>
  <section class="panel"><h3>Cleared workouts</h3>${log ? `<div class="list">${log}</div>` : '<p class="empty">Clear your first stage on the Today tab to start your log.</p>'}</section>`;
}

/* ---------- Actions ---------- */
/* ---------- Workout screen ---------- */
// A guided run through today's workout: log each set with what you actually did, then the workout
// complete page tallies weight moved and XP. A logged set is the same check as on the Today tab.
const PAPER = ['#F2C4CE', '#F2C4CE', '#F1E2A0', '#F1E2A0', '#BEDFD2', '#BEDFD2', '#CEC5E6', '#CEC5E6', '#CEC5E6'];   // Rookie, Fighter, Elite, Master tiers
// Each new workout gets one of these styles, never the same twice in a row. WK_THEME_MODE: 'random',
// 'cycle' (down the list in order), or a style id like 'arcade' to lock one. Take one out of the list
// to drop it from the rotation.
const WK_THEME_MODE = 'random';
const dayTitle = (s, word) => `Week&nbsp;${s.w + 1}, Day&nbsp;${s.d + 1}<br>${word}`;
const F = 'family=';   // Google Fonts query for each style's font, loaded only when that style is on screen
const WK_THEMES = [
  // Original 12
  { id: 'manga',       name: 'Shōnen weekly',         font: '',                                                  stamp: 'Cleared',        rankStamp: 'Rank up',      title: (s) => dayTitle(s, 'cleared'),  button: 'Continue' },
  { id: 'arcade',      name: 'Fighting game arcade',  font: F + 'Press+Start+2P',                                stamp: 'K.O.!',          rankStamp: 'New rank!',    title: () => 'Stage<br>clear',                 button: 'Continue' },
  { id: 'rpg',         name: '16-bit RPG',            font: F + 'Press+Start+2P&' + F + 'Sora:wght@400;600',     stamp: 'Victory',        rankStamp: 'Level up',     title: () => 'Victory!',                       button: '▶ Continue' },
  { id: 'isekai',      name: 'Isekai status window',  font: F + 'Sora:wght@400;600',                             stamp: '[ Cleared ]',    rankStamp: '[ Rank up ]',  title: () => 'Quest<br>complete',              button: 'Close window' },
  { id: 'handheld',    name: 'Handheld 4-shade',      font: F + 'Press+Start+2P',                                stamp: 'Clear!',         rankStamp: 'Rank up!',     title: () => 'Workout<br>clear!',              button: 'Continue' },
  { id: 'dojo',        name: 'Dojo scroll',           font: F + 'Yuji+Syuku',                                    stamp: '完',             rankStamp: '昇段',          title: (s) => dayTitle(s, 'complete'), button: 'Continue' },
  { id: 'sports',      name: '70s sports anime',      font: F + 'Bowlby+One',                                    stamp: 'Guts!',          rankStamp: 'Rank up!',     title: () => 'You did<br>it!',                 button: 'Continue' },
  { id: 'mecha',       name: 'Mecha cockpit HUD',     font: F + 'Chakra+Petch:wght@500;700',                     stamp: 'Mission clear',  rankStamp: 'Upgrade',      title: () => 'Mission<br>complete',            button: 'Continue' },
  { id: 'cards',       name: 'Trading card game',     font: F + 'Cinzel:wght@700',                               stamp: 'Rare',           rankStamp: 'Legendary',    title: () => 'Rewards<br>earned',              button: 'Continue' },
  { id: 'notebook',    name: 'Training notebook',     font: F + 'Caveat:wght@500;700',                           stamp: 'Done!',          rankStamp: 'Rank up!',     title: () => 'Done!',                          button: 'Continue' },
  { id: 'sticker',     name: 'Sticker book',          font: F + 'Fredoka:wght@500;700',                          stamp: 'Yay!',           rankStamp: 'Rank up!',     title: () => 'Page<br>complete!',              button: 'Continue' },
  { id: 'riso',        name: 'Riso zine',             font: F + 'Rubik+Mono+One',                                stamp: 'Done.',          rankStamp: 'Rank up.',     title: () => 'Done.',                          button: 'Continue' },
  // Anime genre styles
  { id: 'ninja',       name: 'Ninja village',         font: F + 'Reggae+One',                                    stamp: 'Mission S',      rankStamp: 'Promoted',     title: () => 'Mission<br>complete',            button: 'Return to village' },
  { id: 'pirate',      name: 'Pirate bounty',         font: F + 'Pirata+One',                                    stamp: 'Bounty up',      rankStamp: 'New title',    title: () => 'Bounty<br>claimed',              button: 'Set sail' },
  { id: 'magical',     name: 'Magical girl',          font: F + 'Mochiy+Pop+One',                                stamp: '✦ Clear ✦',      rankStamp: '✦ Evolved ✦',  title: () => 'Power<br>unlocked!',             button: 'Continue' },
  { id: 'shrine',      name: 'Spirit shrine',         font: F + 'Shippori+Mincho+B1:wght@800',                   stamp: 'Blessed',        rankStamp: 'Ascended',     title: () => 'Offering<br>complete',           button: 'Leave the shrine' },
  { id: 'cyber',       name: 'Neon city',             font: F + 'Orbitron:wght@700',                             stamp: 'Uploaded',       rankStamp: 'Firmware up',  title: () => 'Run<br>complete',                button: 'Log out' },
  { id: 'school',      name: 'Classroom chalkboard',  font: F + 'Gochi+Hand',                                    stamp: 'A+',             rankStamp: 'Honor roll',   title: () => 'Class<br>dismissed!',            button: 'Continue' },
  { id: 'ukiyo',       name: 'Ukiyo-e wave',          font: F + 'Kaisei+Tokumin:wght@800',                       stamp: '完成',           rankStamp: '名人',          title: () => 'The wave<br>breaks',             button: 'Continue' },
  { id: 'kaiju',       name: 'Kaiju alert',           font: F + 'Black+Ops+One',                                 stamp: 'Threat down',    rankStamp: 'Class S',      title: () => 'Kaiju<br>defeated',              button: 'All clear' },
  { id: 'idol',        name: 'Idol stage',            font: F + 'Rampart+One',                                   stamp: 'Encore!',        rankStamp: 'Center stage', title: () => 'Live<br>complete!',              button: 'Bow out' },
  { id: 'spacejazz',   name: 'Space jazz',            font: F + 'Righteous',                                     stamp: 'Jackpot',        rankStamp: 'Big shot',     title: () => 'Session<br>complete',            button: 'Continue' },
  { id: 'darkfantasy', name: 'Dark fantasy',          font: F + 'UnifrakturMaguntia',                            stamp: 'Slain',          rankStamp: 'Ascended',     title: () => 'The beast<br>falls',             button: 'Continue' },
  { id: 'tournament',  name: 'Tournament arc',        font: F + 'Anton',                                         stamp: 'Winner',         rankStamp: 'Champion',     title: () => 'Match<br>won',                   button: 'Next round' },
  { id: 'countryside', name: 'Countryside summer',    font: F + 'Klee+One:wght@600',                             stamp: 'Nice day!',      rankStamp: 'Grown!',       title: () => 'Good work<br>today',             button: 'Continue' },
  // Batch 3
  { id: 'vaporwave',   name: 'Vaporwave',             font: F + 'Monoton',                                       stamp: 'A E S T H E T I C', rankStamp: 'Ascended', title: () => 'Workout<br>complete',            button: 'Continue' },
  { id: 'samurai',     name: 'Samurai duel',          font: F + 'Yuji+Boku',                                     stamp: '斬',             rankStamp: '侍',            title: () => 'Duel<br>won',                    button: 'Sheathe sword' },
  { id: 'sakura',      name: 'Cherry blossom',        font: F + 'Zen+Maru+Gothic:wght@700',                      stamp: '満開',           rankStamp: 'In bloom',     title: () => 'Full<br>bloom',                  button: 'Continue' },
  { id: 'ramen',       name: 'Ramen shop',            font: F + 'Potta+One',                                     stamp: 'Kaedama!',       rankStamp: 'Head chef',    title: () => 'Bowl<br>finished',               button: 'Thanks for the meal' },
  { id: 'deepsea',     name: 'Deep sea',              font: F + 'Baloo+2:wght@800',                              stamp: 'Treasure!',      rankStamp: 'Deeper dive',  title: () => 'Surfaced!',                      button: 'Swim on' },
  { id: 'terminal',    name: 'Retro terminal',        font: F + 'VT323',                                         stamp: '[ OK ]',         rankStamp: 'rank++',       title: () => '&gt; workout.exe<br>complete',  button: '&gt; exit' },
  { id: 'comic',       name: 'Comic book',            font: F + 'Bangers',                                       stamp: 'POW!',           rankStamp: 'KA-BOOM!',     title: () => 'Issue<br>complete!',             button: 'Next issue' },
  { id: 'starship',    name: 'Starship bridge',       font: F + 'Exo+2:wght@800',                                stamp: 'Warp ready',     rankStamp: 'Promoted',     title: () => 'Mission<br>log saved',           button: 'Engage' },
  { id: 'lofi',        name: 'Lo-fi study',           font: F + 'Nunito:wght@400;700;800',                       stamp: 'Chill ✓',        rankStamp: 'Vibe up',      title: () => 'Session<br>done',                button: 'Keep vibing' },
  { id: 'graffiti',    name: 'Street graffiti',       font: F + 'Permanent+Marker',                              stamp: 'Tagged!',        rankStamp: 'King',         title: () => 'Piece<br>finished',              button: 'Bounce' },
  { id: 'royal',       name: 'Royal court',           font: F + 'Cinzel+Decorative:wght@700',                    stamp: 'Decreed',        rankStamp: 'Knighted',     title: () => 'By royal<br>decree',             button: 'Leave court' },
  { id: 'festival',    name: 'Summer festival',       font: F + 'Hachi+Maru+Pop',                                stamp: 'Wasshoi!',       rankStamp: 'Festival king', title: () => 'Festival<br>night!',            button: 'Head home' },
  { id: 'frost',       name: 'Frost kingdom',         font: F + 'Cormorant+Garamond:wght@700',                   stamp: 'Frozen solid',   rankStamp: 'Ice crowned',  title: () => 'Ice<br>breaker',                 button: 'Continue' },
  { id: 'volcano',     name: 'Volcano',               font: F + 'Russo+One',                                     stamp: 'Erupted!',       rankStamp: 'Magma core',   title: () => 'Eruption!',                      button: 'Cool down' },
  { id: 'pachinko',    name: 'Pachinko parlor',       font: F + 'Bungee+Inline',                                 stamp: 'Fever!',         rankStamp: 'Big win',      title: () => 'Triple<br>sevens!',              button: 'Cash out' },
  // Nature
  { id: 'forest',      name: 'Old-growth forest',     font: F + 'Fraunces:wght@700',                             stamp: 'Rooted',         rankStamp: 'Elder tree',   title: () => 'Deep in<br>the woods',           button: 'Back to the trail' },
  { id: 'desert',      name: 'Desert dunes',          font: F + 'Rye',                                           stamp: 'Oasis found',    rankStamp: 'Dune walker',  title: () => 'Crossed<br>the dunes',           button: 'Make camp' },
  { id: 'beach',       name: 'Tropical beach',        font: F + 'Pacifico',                                      stamp: 'Aloha!',         rankStamp: 'Big wave',     title: () => 'Beach day<br>done',              button: 'Ride the wave' },
  { id: 'mountain',    name: 'Mountain summit',       font: F + 'Oswald:wght@700',                               stamp: 'Summit',         rankStamp: 'New peak',     title: () => 'Summit<br>reached',              button: 'Descend' },
  { id: 'jungle',      name: 'Jungle canopy',         font: F + 'Lilita+One',                                    stamp: 'Wild!',          rankStamp: 'Apex',         title: () => 'Through the<br>jungle',          button: 'Swing on' },
  { id: 'aurora',      name: 'Northern lights',       font: F + 'Quicksand:wght@700',                            stamp: 'Lights up',      rankStamp: 'Sky dancer',   title: () => 'Sky<br>on fire',                 button: 'Continue' },
  { id: 'autumn',      name: 'Autumn harvest',        font: F + 'Amatic+SC:wght@700&' + F + 'Fraunces:wght@700',              stamp: 'Harvest',        rankStamp: 'Golden',       title: () => 'Harvest<br>is in',               button: 'Continue' },
  { id: 'storm',       name: 'Thunderstorm',          font: F + 'Teko:wght@600',                                 stamp: 'Strike!',        rankStamp: 'Thunder god',  title: () => 'Storm<br>passed',                button: 'Continue' },
  { id: 'meadow',      name: 'Wildflower meadow',     font: F + 'Sniglet:wght@800',                              stamp: 'Buzzing!',       rankStamp: 'Wildflower',   title: () => 'Fresh<br>air',                   button: 'Continue' },
  { id: 'moonlake',    name: 'Moonlit lake',          font: F + 'Marcellus',                                     stamp: 'Still water',    rankStamp: 'Full moon',    title: () => 'Calm<br>waters',                 button: 'Continue' },
  { id: 'bamboo',      name: 'Bamboo grove',          font: F + 'Sawarabi+Mincho',                               stamp: '竹',             rankStamp: 'Tall bamboo',  title: () => 'Grew<br>taller',                 button: 'Continue' },
  { id: 'firefly',     name: 'Firefly night',         font: F + 'Shadows+Into+Light',                            stamp: 'Glowing',        rankStamp: 'Lantern',      title: () => 'Night<br>glow',                  button: 'Continue' },
  // Hers: pink and pastel
  { id: 'strawberry',  name: 'Strawberry milk',       font: F + 'M+PLUS+Rounded+1c:wght@800',                    stamp: 'Sweet!',         rankStamp: 'Extra sweet',  title: () => 'Workout<br>served',              button: 'Sip on' },
  { id: 'cafe',        name: 'Pastel café',           font: F + 'Grandstander:wght@800',                         stamp: 'Fresh baked',    rankStamp: 'Star baker',   title: () => 'Order<br>up!',                   button: 'Continue' },
  { id: 'diary',       name: 'Kawaii diary',          font: F + 'Gaegu:wght@700',                                stamp: '♡ Done ♡',       rankStamp: '♡ Level up ♡', title: () => 'Dear diary,<br>I did it!',       button: 'Close diary' },
  { id: 'starlight',   name: 'Starlight guardian',    font: F + 'Dela+Gothic+One',                               stamp: 'Star power',     rankStamp: 'Superstar',    title: () => 'Starlight<br>victory',           button: 'Continue' },
  { id: 'boba',        name: 'Bubble tea',            font: F + 'Chewy',                                         stamp: 'Extra boba!',    rankStamp: 'Large size',   title: () => 'Shaken<br>&amp; done',           button: 'Continue' },
  { id: 'princess',    name: 'Princess ball',         font: F + 'Playfair+Display:wght@800',                     stamp: 'Crowned',        rankStamp: 'Queen',        title: () => 'Belle of<br>the ball',           button: 'Curtsy' },
  { id: 'cottoncandy', name: 'Cotton candy sky',      font: F + 'Cherry+Bomb+One',                               stamp: 'Fluffy!',        rankStamp: 'Cloud nine',   title: () => 'Floating<br>on clouds',          button: 'Continue' },
  { id: 'forge',       for: 'male',   name: 'Iron forge',         font: F + 'Bebas+Neue',                 stamp: 'Forged',        rankStamp: 'Tempered',       title: () => 'Steel<br>forged',              button: 'Cool the steel' },
  { id: 'court',       for: 'male',   name: 'Street court',       font: F + 'Bungee',                     stamp: 'Swish!',        rankStamp: 'MVP',            title: () => 'Game<br>over',                 button: 'Hit the showers' },
  { id: 'wolf',        for: 'male',   name: 'Wolf pack',          font: F + 'Metal+Mania',                stamp: 'Howl!',         rankStamp: 'Alpha',          title: () => 'The hunt<br>is done',          button: 'Return to the den' },
  { id: 'boxing',      for: 'male',   name: 'Boxing gym',         font: F + 'Alfa+Slab+One',              stamp: 'TKO',           rankStamp: 'Title belt',     title: () => 'Bell<br>rings',                button: 'Leave the ring' },
  { id: 'gridiron',    for: 'male',   name: 'Gridiron lights',    font: F + 'Graduate',                   stamp: 'Touchdown',     rankStamp: 'All-American',   title: () => 'Final<br>whistle',             button: 'Hit the locker room' },
  { id: 'rival',       for: 'male',   name: 'Rival showdown',     font: F + 'Luckiest+Guy',               stamp: 'Rival down',    rankStamp: 'Surpassed',      title: () => 'Rival<br>defeated',            button: 'Train harder' },
  { id: 'monk',        for: 'male',   name: 'Warrior monk',       font: F + 'Uncial+Antiqua',             stamp: 'Focused',       rankStamp: 'Enlightened',    title: () => 'Mind and<br>body',             button: 'Rest now' },
  { id: 'garage',      for: 'male',   name: 'Garage gym',         font: F + 'Staatliches',                stamp: 'Chalked',       rankStamp: 'Garage legend',  title: () => 'Rack<br>it up',                button: 'Kill the lights' },
  { id: 'dragon',      for: 'male',   name: 'Dragon scale',       font: F + 'Grenze+Gotisch:wght@700',    stamp: 'Dragon fire',   rankStamp: 'Elder dragon',   title: () => 'Dragon<br>awakened',           button: 'Return to the lair' },
  { id: 'racing',      for: 'male',   name: 'Racing pit',         font: F + 'Racing+Sans+One',            stamp: 'Pole position', rankStamp: 'Podium',         title: () => 'Checkered<br>flag',            button: 'Back to the pits' },
  // Female character styles
  { id: 'valkyrie',    for: 'female', name: 'Valkyrie',           font: F + 'MedievalSharp',              stamp: 'Valhalla',      rankStamp: 'Shieldmaiden',   title: () => 'Battle<br>won',                button: 'Ride on' },
  { id: 'kunoichi',    for: 'female', name: 'Kunoichi',           font: F + 'Yuji+Mai',                   stamp: '影',            rankStamp: 'Shadow master',  title: () => 'Unseen,<br>unstoppable',       button: 'Vanish' },
  { id: 'trackstar',   for: 'female', name: 'Track star',         font: F + 'Saira+Condensed:wght@800',   stamp: 'New PB',        rankStamp: 'Gold medal',     title: () => 'Finish<br>line',               button: 'Cool down lap' },
  { id: 'moonguard',   for: 'female', name: 'Moon guardian',      font: F + 'Philosopher:wght@700',       stamp: 'Moonlit',       rankStamp: 'Lunar guardian', title: () => 'Guardian<br>rises',            button: 'Rest under the moon' },
  { id: 'phoenix',     for: 'female', name: 'Phoenix rising',     font: F + 'Josefin+Sans:wght@700',      stamp: 'Reborn',        rankStamp: 'Eternal flame',  title: () => 'Rise<br>again',                button: 'Fly on' },
  { id: 'archer',      for: 'female', name: 'Forest archer',      font: F + 'Spectral+SC:wght@700',       stamp: 'Bullseye',      rankStamp: 'Ranger',         title: () => 'Right on<br>target',           button: 'Into the woods' },
  { id: 'volley',      for: 'female', name: 'Volleyball club',    font: F + 'Paytone+One',                stamp: 'Spike!',        rankStamp: 'Ace',            title: () => 'Set, spike,<br>win',           button: 'Team huddle' },
  { id: 'dancer',      for: 'female', name: 'Street dancer',      font: F + 'Audiowide',                  stamp: 'On beat',       rankStamp: 'Headliner',      title: () => 'Drop the<br>beat',             button: 'Encore later' },
  { id: 'dragontamer', for: 'female', name: 'Dragon tamer',       font: F + 'Sigmar+One',                 stamp: 'Tamed!',        rankStamp: 'Dragon rider',   title: () => 'Dragon<br>bonded',             button: 'Fly home' },
  { id: 'lioness',     for: 'female', name: 'Lioness',            font: F + 'Abril+Fatface',              stamp: 'Roar',          rankStamp: 'Pride leader',   title: () => 'Queen of the<br>savanna',      button: 'Return to the pride' }
];
// Her styles are the pink, pastel and cute ones; his are the rest (arcade, mecha, samurai, kaiju...).
// The style follows whoever you're playing as.
const HER_THEMES = new Set(['magical', 'idol', 'sticker', 'sakura', 'meadow', 'lofi', 'countryside', 'beach', 'aurora', 'moonlake', 'firefly', 'festival',
  'strawberry', 'cafe', 'diary', 'starlight', 'boba', 'princess', 'cottoncandy']);
// A style tagged `for` belongs to that hero; the rest are sorted by the her list above
const themesFor = g => WK_THEMES.filter(t => t.for ? t.for === g : HER_THEMES.has(t.id) === (g === 'female'));
// The style for the workout on screen: picked when a workout starts and kept until it's finished
function wkTheme(){
  const L = themesFor(S.hero.gender);
  if (!S.wkTheme || S.wkTheme.day !== dayPrefix() || !L.some(t => t.id === S.wkTheme.id)){   // switching hero switches to their styles
    const fixed = WK_THEMES.find(t => t.id === WK_THEME_MODE), last = S.lastWkTheme;
    let t = fixed;
    if (!t && WK_THEME_MODE === 'cycle') t = L[(L.findIndex(x => x.id === last) + 1) % L.length];
    if (!t){ const pool = L.filter(x => x.id !== last); t = pool[Math.floor(Math.random() * pool.length)] || L[0]; }
    S.wkTheme = {day:dayPrefix(), id:t.id}; S.lastWkTheme = t.id; save();
  }
  return WK_THEMES.find(t => t.id === S.wkTheme.id);
}
// Put a style on the workout screen or the complete page; the manga style prints on your rank's paper
function applyWkTheme(el, theme, rank){
  el.dataset.wkTheme = theme.id;
  // Only download the font this style needs
  // the app build bundles every style's font (fonts/wk-<style>.css); the artifact loads them from Google Fonts
  const link = document.getElementById('wkFont'), href = !theme.font ? null : window.TA_LOCAL_FONTS ? `fonts/wk-${theme.id}.css` : `https://fonts.googleapis.com/css2?${theme.font}&display=swap`;
  if (href && link.getAttribute('href') !== href) link.setAttribute('href', href);
  if (theme.id === 'manga') el.style.setProperty('--bg', PAPER[RANKS.indexOf(rank)]); else el.style.removeProperty('--bg');
}
const UNIT_NAME = {sec:'Seconds', m:'Meters', yd:'Yards', min:'Minutes'}, UNIT_STEP = {sec:5, m:5, yd:5, min:1};
// Swaps: when your gym doesn't have something, trade it for a move that trains the same thing.
// Your pick sticks for that exercise everywhere until you switch back.
const SWAPS = {
  'Leg Curl':['Nordic Curl Negative','Stability Ball Leg Curl','Dumbbell Leg Curl'],
  'Leg Extension':['Spanish Squat','Reverse Nordic','Heels-Elevated Goblet Squat'],
  'Leg Press':['Goblet Squat','Bulgarian Split Squat (each leg)','Hack Squat'],
  'Hack Squat':['Leg Press','Front Squat','Heels-Elevated Goblet Squat'],
  'Lat Pulldown':['Pull-up','Band-Assisted Pull-up','Single-Arm Dumbbell Row'],
  'Seated Cable Row':['Dumbbell Row','Chest-Supported Row','Inverted Row'],
  'Cable Row':['Dumbbell Row','Chest-Supported Row','Inverted Row'],
  'Chest-Supported Row':['Dumbbell Row','Seal Row','Cable Row'],
  'Barbell Row':['Dumbbell Row','Chest-Supported Row','Pendlay Row'],
  'Dumbbell Row':['Barbell Row','Cable Row','Inverted Row'],
  'Triceps Pushdown':['Overhead Triceps Extension','Close-Grip Push-up','Bench Dip'],
  'Overhead Triceps Extension':['Triceps Pushdown','Skull Crusher','Close-Grip Push-up'],
  'Skull Crusher':['Overhead Triceps Extension','Triceps Pushdown','Close-Grip Push-up'],
  'Face Pull':['Band Pull-Apart','Rear Delt Fly','Prone Y-Raise'],
  'Rear Delt Fly':['Face Pull','Band Pull-Apart','Reverse Pec Deck'],
  'Band Pull-Apart':['Face Pull','Rear Delt Fly','Prone Y-Raise'],
  'Cable Fly':['Dumbbell Fly','Pec Deck','Deficit Push-up'],
  'Pec Deck':['Cable Fly','Dumbbell Fly','Deficit Push-up'],
  'Cable Crunch':['Weighted Sit-up','Hanging Knee Raise','Ab Wheel Rollout'],
  'Lateral Raise':['Cable Lateral Raise','Lean-Away Lateral Raise','Band Lateral Raise'],
  'Cable Lateral Raise':['Lateral Raise','Band Lateral Raise','Lean-Away Lateral Raise'],
  'Calf Raise':['Single-Leg Calf Raise','Seated Calf Raise','Leg Press Calf Raise'],
  'Hip Thrust':['Glute Bridge','Single-Leg Hip Thrust (each leg)','Cable Pull-Through'],
  'Romanian Deadlift':['Dumbbell RDL','Good Morning','Single-Leg RDL (each leg)'],
  'Dumbbell RDL':['Romanian Deadlift','Kettlebell Swing','Single-Leg RDL (each leg)'],
  'Single-Leg RDL (each leg)':['Dumbbell RDL','B-Stance RDL (each leg)','Kickstand RDL (each leg)'],
  'Walking Lunge (each leg)':['Reverse Lunge (each leg)','Bulgarian Split Squat (each leg)','Step-up (each leg)'],
  'Bulgarian Split Squat (each leg)':['Reverse Lunge (each leg)','Step-up (each leg)','Split Squat (each leg)'],
  'Goblet Squat':['Leg Press','Front Squat','Heels-Elevated Goblet Squat'],
  'Back Extension':['Good Morning','Superman Hold','Reverse Hyper'],
  'Hanging Leg Raise':['Lying Leg Raise','Captain\'s Chair Knee Raise','Reverse Crunch'],
  'Hanging Knee Raise':['Lying Leg Raise','Reverse Crunch','Dead Bug (each side)'],
  'Ab Wheel Rollout':['Stability Ball Rollout','Plank Walkout','Body Saw'],
  'Pallof Press (each side)':['Side Plank (each side)','Suitcase Carry Hold (each side)','Dead Bug (each side)'],
  'Copenhagen Plank (each side)':['Side Plank (each side)','Adductor Squeeze','Side-Lying Adduction'],
  'Nordic Curl':['Nordic Curl Negative','Stability Ball Leg Curl','Glute-Ham Raise'],
  'Nordic Curl Negative':['Stability Ball Leg Curl','Slider Leg Curl','Single-Leg Glute Bridge (each leg)'],
  'Dumbbell Curl':['Barbell Curl','Hammer Curl','Cable Curl'],
  'Barbell Curl':['Dumbbell Curl','EZ-Bar Curl','Cable Curl'],
  'Hammer Curl':['Dumbbell Curl','Rope Cable Curl','Cross-Body Curl'],
  'Preacher Curl':['Incline Dumbbell Curl','Spider Curl','Cable Curl'],
  'Dumbbell Shrug':['Barbell Shrug','Farmer Carry Hold','Cable Shrug'],
  'Straight-Arm Pulldown':['Dumbbell Pullover','Band Straight-Arm Pulldown','Lat Pulldown'],
  'Dumbbell Pullover':['Straight-Arm Pulldown','Band Straight-Arm Pulldown','Lat Pulldown'],
  'Incline Dumbbell Press':['Incline Barbell Press','Incline Push-up','Landmine Press (each arm)'],
  'Dumbbell Bench Press':['Bench Press','Push-up','Floor Press'],
  'Dumbbell Shoulder Press':['Overhead Press','Landmine Press (each arm)','Pike Push-up'],
  'Dip':['Bench Dip','Close-Grip Push-up','Assisted Dip'],
  'Weighted Dip':['Dip','Close-Grip Bench Press','Deficit Push-up'],
  'Pull-up':['Band-Assisted Pull-up','Lat Pulldown','Pull-up Negative'],
  'Chin-up':['Band-Assisted Chin-up','Lat Pulldown (underhand)','Chin-up Negative'],
  'Weighted Pull-up':['Pull-up','Lat Pulldown','Pull-up Negative'],
  'Box Jump':['Squat Jump','Broad Jump','Tuck Jump'],
  'Depth Jump':['Box Jump','Squat Jump','Pogo Hop'],
  'Med Ball Slam':['Burpee','Kettlebell Swing','Jump Squat'],
  'Med Ball Chest Pass':['Plyo Push-up','Clap Push-up','Band Chest Punch'],
  'Med Ball Chest Throw':['Plyo Push-up','Clap Push-up','Band Chest Punch'],
  'Med Ball Rotational Throw (each side)':['Landmine Rotation (each side)','Band Woodchop (each side)','Russian Twist (each side)'],
  'Landmine Rotation (each side)':['Band Woodchop (each side)','Cable Woodchop (each side)','Russian Twist (each side)'],
  'Landmine Press (each arm)':['Single-Arm Dumbbell Press (each arm)','Half-Kneeling Press (each arm)','Pike Push-up'],
  'Hang Clean':['Dumbbell Hang Clean','Kettlebell Swing','Jump Squat'],
  'Power Clean':['Hang Clean','Dumbbell Power Clean','Trap Bar Jump'],
  'Push Press':['Dumbbell Push Press','Landmine Press (each arm)','Overhead Press'],
  'Farmer Carry':['Suitcase Carry (each side)','Trap Bar Carry','Kettlebell Carry'],
  'Heavy Bag':['Shadowboxing','Shadowboxing with Light Dumbbells','Burpee Rounds'],
  'Jump Rope':['Jumping Jacks','High Knees','Shadowboxing'],
  'Hill Sprint':['Stair Sprint','Sled Push','Sprint'],
  'Wicket Run':['Flying Sprint','A-Skip','Dribble Run'],
  'Agility Ladder':['Quick Feet Line Drill','Lateral Shuffle','High Knees'],
  'Inverted Row':['Dumbbell Row','Band Row','Table Row'],
  'Glute Bridge':['Hip Thrust','Single-Leg Glute Bridge (each leg)','Frog Pump'],
  'Wall Sit':['Bodyweight Squat','Spanish Squat','Split Squat Hold'],
  'Bench Dip':['Close-Grip Push-up','Dip','Diamond Push-up']
};
const swapOf = name => S.swaps[name] || name;

// Form tips, matched from most specific to most general by name
const CUES = [
  [/hundred|roll-up|roll-down|rollover|teaser|criss-cross|\bsaw\b|swimming|swan|corkscrew|jackknife|boomerang|rocker|rocking|rolling like|\bseal\b|mermaid|spine stretch|spine twist|leg circles|single-leg stretch|double-leg stretch|single-leg kick|double-leg kick|\bcrab\b|\bstar\b|control balance|side kick|side bend|hip twist|pelvic curl|cat-cow|pilates|full mat flow/i, ['Lengthen first, then move: grow tall through the crown of your head.', 'Draw your navel in and up; keep your ribs soft and closed.', 'Smooth and controlled. Exhale on the effort.']],
  [/landing|deceleration/i, ['Land soft: balls of the feet, then heels.', 'Knees track over your toes. Never let them cave in.', 'Hips back and chest up, like a quarter squat.']],
  [/incline walk|walk-jog|run-walk|stair climber|repeat/i, ['Stand tall and don\'t hold the rails.', 'Pick a pace you can keep for every rep or minute.', 'Steady breathing. Ease off if you can\'t talk at all on easy days.']],
  [/warm-up/i, ['Start easy and build. You should be warm, not tired.', 'Hit the joints you train today.']],
  [/squat test|back squat|front squat|^squat/i, ['Brace your belly before you descend, like you\'re about to get punched.', 'Knees track over your toes; sit between your hips.', 'Drive up through the whole foot, chest up.']],
  [/deadlift|rdl|good morning/i, ['Push your hips back and keep the bar close to your legs.', 'Lats tight: imagine squeezing oranges in your armpits.', 'Neutral spine. Stand tall at the top, don\'t lean back.']],
  [/bench|floor press/i, ['Squeeze your shoulder blades together and down.', 'Feet planted; drive through the floor.', 'Touch your lower chest; elbows about 45° from your body.']],
  [/overhead press|push press|shoulder press|landmine press|handstand push/i, ['Squeeze glutes and abs so your back doesn\'t arch.', 'Press in a straight line; move your head out of the way.', 'Lock out with the weight over your mid-foot.']],
  [/clean/i, ['Jump, then shrug. Let the hips do the work.', 'Fast elbows: get them under the bar.', 'Catch it in a quarter squat, heels down.']],
  [/pull-up|chin-up|pulldown|muscle-up/i, ['Start each rep from a dead hang with shoulders packed down.', 'Pull your elbows to your back pockets.', 'Control the way down. No swinging.']],
  [/row/i, ['Lead with your elbow and squeeze the shoulder blade back.', 'Keep your torso still; no heaving.', 'Pause for a beat at the top.']],
  [/dip/i, ['Shoulders down, away from your ears.', 'Lean slightly forward and lower until your upper arm is about level.', 'Lock out tall at the top.']],
  [/push-up/i, ['One straight line from head to heels.', 'Hands just outside your shoulders, elbows about 45°.', 'Chest touches first, not your hips.']],
  [/lunge|split squat|step-up|pistol|shrimp/i, ['Front knee tracks over your toes.', 'Stay tall through your torso; don\'t fold forward.', 'Push through the front heel to stand.']],
  [/hip thrust|glute bridge|bridge/i, ['Tuck your chin and ribs down.', 'Drive through your heels and squeeze glutes hard at the top.', 'Don\'t over-arch your lower back.']],
  [/nordic|leg curl/i, ['Hips stay straight; don\'t bend at the waist.', 'Fight the way down as slowly as you can.', 'Squeeze your hamstrings, not your lower back.']],
  [/curl/i, ['Pin your elbows to your sides.', 'No swinging. Control the lowering for 2 seconds.', 'Squeeze hard at the top.']],
  [/pushdown|triceps|skull/i, ['Keep your upper arms still.', 'Full lockout every rep.', 'Slow on the way back.']],
  [/lateral raise|rear delt|face pull|pull-apart|fly|pec deck/i, ['Lead with the elbows, not the hands.', 'Lighter weight, strict reps. Stop at shoulder height.', 'Pause and squeeze for a beat.']],
  [/kickback|abduction|clamshell|fire hydrant|donkey kick|side-lying|frog pump|lateral walk|pull-through|inner thigh|leg pulse/i, ['Move from the hip, not your lower back.', 'Squeeze the glute at the end of every rep and pause.', 'Slow on the way back. No swinging.']],
  [/calf/i, ['Full stretch at the bottom, pause.', 'Rise as high as you can onto your big toe.', 'Slow and controlled; no bouncing.']],
  [/plank|hollow|l-sit|v-sit|dead bug|bird dog|pallof|dragon flag|lever|planche/i, ['Ribs down, glutes squeezed.', 'Breathe behind the brace; don\'t hold your breath.', 'Stop the set when your form breaks.']],
  [/leg raise|knee raise|toes-to-bar|crunch|sit-up|twist|rollout/i, ['Move from your abs, not momentum.', 'Curl your pelvis up, don\'t just lift your legs.', 'Exhale hard as you crunch.']],
  [/sprint|start|acceleration|flying|dash|run|shuffle|agility|3-cone|ladder/i, ['Drive your knees and punch your arms cheek to hip.', 'Stay tall at top speed; lean only when accelerating.', 'Full rest between hard reps. Speed is the goal.']],
  [/skip|bound|hop|jump|pogo/i, ['Land soft and quiet, then explode.', 'Stay on the balls of your feet.', 'Quality beats quantity. Stop when the pop is gone.']],
  [/bag|shadow|rope|sprawl|burpee|tabata/i, ['Stay light on your feet and keep your hands up.', 'Breathe out with every strike or rep.', 'Keep a steady pace; finish the round strong.']],
  [/carry|hang|shrug/i, ['Stand tall, shoulders down and back.', 'Grip hard; walk with short, steady steps.', 'Brace your core the whole time.']],
  [/./, ['Control every rep, up and down.', 'Stop 1–2 reps short of failure unless told otherwise.', 'Breathe out on the hard part.']]
];
const cuesFor = name => CUES.find(([re]) => re.test(name))[1];

// Rest timer: starts when you log a set; heavier work gets longer rest
let rest = null, restT = null;
function restFor(e, s){
  if (/warm-up/i.test(e.base)) return 0;
  if (e.lift) return s.amrap || s.reps <= 3 ? 180 : s.reps <= 5 ? 150 : 120;
  if (e.unit === 'm' || e.unit === 'yd') return 120;
  if (e.unit === 'min') return 60;
  return e.pick ? 90 : 60;
}
const mmss = t => `${Math.floor(t / 60)}:${pad(Math.max(0, t % 60))}`;
// C: each rest brings its own quote, read while you catch your breath (a separate run through the shuffle)
let restQ = 0;
// Settings: auto-start can be off, and the length scales (shorter, standard, longer), rounded to 15 seconds
function startRest(sec){ stopRest(); if (!sec || !S.prefs.restAuto) return; sec = Math.max(15, Math.round(sec * S.prefs.restScale / 15) * 15); rest = {end:Date.now() + sec * 1000, total:sec, q:quoteAt(quotePos + 1 + restQ++ * 7)}; restT = setInterval(tickRest, 250); }
function stopRest(){ clearInterval(restT); restT = null; rest = null; }
function tickRest(){
  if (!rest) return;
  const left = Math.ceil((rest.end - Date.now()) / 1000), el = document.getElementById('wkRestT'), bar = document.getElementById('wkRestBar');
  if (left <= 0){ stopRest(); buzz([200, 100, 200]); sfx('rest'); toast('Rest over. Next set!'); if (wk) renderWorkout(); return; }
  if (el) el.textContent = mmss(left);
  if (bar) bar.style.width = (left / rest.total * 100) + '%';
}
function restHTML(){
  if (!rest) return '';
  const left = Math.max(0, Math.ceil((rest.end - Date.now()) / 1000));
  return `<section class="wk-panel wk-rest" aria-label="Rest timer"><div><p class="wk-rest-l">Rest</p><p class="wk-rest-t" id="wkRestT">${mmss(left)}</p></div>
    <button type="button" class="wk-chip" data-wk="restAdd">+15s</button><button type="button" class="wk-chip" data-wk="restSkip">Skip</button>
    <div class="wk-hp"><i id="wkRestBar" style="width:${left / rest.total * 100}%"></i></div>
    ${S.prefs.quotes ? `<p class="wk-rest-q">“${rest.q.text}” <span>${rest.q.by}</span></p>` : ''}</section>`;
}
// Plates drawn on one side of the bar, biggest first, sized and colored by weight
const PLATE_COLOR = {45:'#d83a3a', 25:'#3f6fe0', 35:'#f2c94c', 10:'#3ddc97', 5:'#e6e6ee', 2.5:'#9a98a8', 20:'#3f6fe0', 15:'#f2c94c', 1.25:'#9a98a8'};
function plateViz(w){
  const pl = plates(w); if (!pl) return {text:'Under bar weight', viz:''};
  const top = PLATES[S.unit][0];
  return {text:pl.length ? `${pl.map(fmt).join(' + ')} per side` : 'Empty bar',
    viz:`<span class="plate-viz" aria-hidden="true"><span class="bar"></span>${pl.map(p => `<span class="pl" style="--pc:${PLATE_COLOR[p] || '#9a98a8'};height:${Math.round(14 + 30 * p / top)}px"></span>`).join('')}<span class="bar"></span></span>`};
}

// D: your character coaches you through the workout. Lines react to rest, heavy and rep-out sets, the boss,
// and how far along you are; the pick within each list moves with every set so it doesn't repeat.
const COACH_PATH = {
  cali:['Control the whole rep. Strength lives in the slow part.', 'Tight body, clean line. Make it look easy.', 'Every rep today is a skill rep.'],
  power:['Same bar path every time. Make it boring.', 'Brace, breathe, then move it.', 'Smooth and fast. Grind only on the last set.'],
  build:['Squeeze the muscle, don\'t just move the weight.', 'Chase the pump, not the ego.', 'Slow on the way down. That\'s where it grows.'],
  sprint:['Full rest, full speed. Quality over quantity.', 'Tall hips, fast arms.', 'Every rep is a race. Win it.'],
  athlete:['Explode on every rep. Game speed only.', 'Land soft, leave fast.', 'Strong and quick. That\'s the whole game.'],
  fighter:['Hands up, keep breathing.', 'Finish the round stronger than you started.', 'Champions are built in rounds like this one.']
};
/* ---------- Last time, suggestions, warm-up ramp ---------- */
// An exercise's most recent session, with weights in today's unit
function lastTime(name){
  const L = S.exLog[name]; if (!L || !L.length) return null;
  const f = u => u === S.unit ? 1 : u === 'lb' ? 1 / 2.20462 : 2.20462;
  return L.map(x => ({...x, sets:x.sets.map(([w, r]) => [roundW(w * f(x.unit)), r])}));
}
// "185 × 8, 8, 7" (weights shown once when they're all the same)
function setsText(sets, unit){
  const ws = [...new Set(sets.map(s => s[0]))];
  if (!ws[0]) return sets.map(s => s[1]).join(', ') + (unit ? unitShort(unit) : ' reps');
  return ws.length === 1 ? `${fmt(ws[0])} × ${sets.map(s => s[1]).join(', ')}` : sets.map(([w, r]) => `${fmt(w)}×${r}`).join(', ');
}
const LOWER = /squat|deadlift|rdl|lunge|leg press|hip thrust|hack|step-up|split|good morning|calf|thrust|pull-through/i;
// Auto-progression for weights you pick: every rep last time adds a step (10 lb lower body, 5 upper; kg
// halves), two misses in a row drop 10%, otherwise hold
function suggestFor(e){
  if (!e.pick) return null;
  const L = lastTime(e.name); if (!L) return null;
  const top = Math.max(...L[0].sets.map(s => s[0])); if (!top) return null;
  const step = (LOWER.test(e.name) ? 10 : 5) * (S.unit === 'kg' ? .5 : 1);
  if (L[0].hit) return {w:roundW(top + step), why:'You hit every rep last time. Add weight.'};
  if (L[1] && !L[1].hit) return {w:roundW(top * .9), why:'Missed reps twice. Drop a little and build back up.'};
  return {w:top, why:'Same weight. Get every rep this time.'};
}
// The warm-up ramp: before the first working set of each big barbell lift, the bar then about 40, 60 and 80%
// of the first working weight. Steps too close together are skipped, so light lifts get a shorter ramp.
function rampFor(plan, e){
  if (!S.prefs.ramp || !e.lift || plan.ex.findIndex(x => x.lift === e.lift) !== e.ei) return null;   // can be turned off in Settings
  const W = e.sets[0].weight, bar = barW(), gap = 4 * inc(); if (!(W > bar + gap)) return null;
  const steps = [[bar, 10]];
  for (const [pct, r] of [[.4, 5], [.6, 3], [.8, 1]]){ const w = roundW(W * pct); if (w >= steps[steps.length - 1][0] + gap && w <= W - gap) steps.push([w, r]); }
  return steps;
}
const rampKey = e => dayPrefix() + 'r' + e.ei;
// How far into its ramp an exercise is: a step count, or done when skipped or a working set is logged
const rampAt = (e, steps) => { const v = S.ramp[rampKey(e)]; return v === 'skip' || e.sets.some(setDone) ? steps.length : (v || 0); };

function coachLine(plan, e, next, all, doneN, total){
  const pick = list => list[doneN % list.length], {p, w, d} = plan;
  if (doneN >= total) return 'Every set cleared! Hit Finish and take your XP.';
  { const rp = rampFor(plan, e); if (rp && rampAt(e, rp) < rp.length) return pick(['Easy weight. Groove the movement and save your energy.', 'Warm-up sets are practice reps. Make them perfect.', 'Build up slow. The heavy set will feel better for it.']); }
  if (rest) return pick(['Breathe. Shake it out. Next set soon.', 'Sip some water. You earned that one.', 'Rest is part of the work. Stay ready.']);
  if (all) return 'Exercise done! Pick the next one below.';
  if (/warm-up/i.test(e.base)) return 'Warm up right. We go hard after this.';
  if (isBoss(p, w, d) && doneN > 0 && doneN % 3 === 0) return `${BOSS[p.path]} is down to ${total - doneN} HP. Keep hitting!`;
  if (next.amrap) return 'Rep-out set! Leave nothing in the tank.';
  if (e.lift && next.reps <= 3) return 'Heavy one. Brace hard and drive!';
  if (e.sets.indexOf(next) === e.sets.length - 1 && e.sets.length > 1) return 'Last set of this one. Make it your best.';
  if (doneN === 0) return isBoss(p, w, d) ? `Boss day. ${bossName(p)} is waiting. Let's go!` : 'Let\'s work. First set, clean reps.';
  if (total - doneN <= 3) return `${total - doneN} set${total - doneN === 1 ? '' : 's'} left. Finish strong!`;
  return pick(COACH_PATH[p.path] || COACH_PATH.power);
}

let wk = null;   // {active: exercise index, drafts: what's typed per exercise, tool: 'tips' | 'swap' | null}
function wkPlan(){
  const p = prog(), {w, d} = S.pos, day = p.weeks[w].days[d];
  return {p, w, d, day, ex:day.ex.map((ex, ei) => ({ei, base:ex.name, name:ex.lift ? ex.name : swapOf(ex.name), acc:!!ex.acc, note:!ex.lift && S.swaps[ex.name] ? '' : ex.note, lift:ex.lift, unit:ex.sets[0].unit || null,
    pick:!ex.lift && !!ex.sets[0].pick, weighted:!!ex.lift || !!ex.sets[0].pick,
    sets:ex.sets.map((s, si) => ({key:`${dayPrefix()}${ei}|${si}`, reps:s.reps, amrap:!!s.amrap, weight:ex.lift ? setWeight(p, s, ex.lift) : 0}))}))};
}
const setDone = s => !!S.done[s.key];
const exDone = e => e.sets.every(setDone);
// What a set was: the logged numbers, or its target if it was checked off on the Today tab
const setActual = s => S.setLog[s.key] || {w:s.weight, r:S.amrap[s.key] || s.reps};
function wkDraft(e){
  const next = e.sets.find(s => !setDone(s)) || e.sets[e.sets.length - 1], d = wk.drafts[e.ei];
  if (d && d.key === next.key) return d;
  const lastLogged = [...e.sets].reverse().map(s => S.setLog[s.key]).find(Boolean);
  // A pick-your-weight lift starts at what you used this session, else the auto-progression suggestion
  const sug = e.pick && !lastLogged ? suggestFor(e) : null;
  const w = e.lift ? next.weight : e.pick ? (lastLogged ? lastLogged.w : sug ? sug.w : S.lastPick[e.name] || 0) : 0;
  return wk.drafts[e.ei] = {key:next.key, w, r:next.reps};
}
const unitShort = u => !u ? '' : u === 'sec' ? 's' : ' ' + u;
function wkTarget(e){
  const reps = e.sets.map(s => s.reps + (s.amrap ? '+' : '')), same = reps.every(r => r === reps[0]);
  const scheme = same ? `${e.sets.length} ${e.sets.length === 1 ? 'set' : 'sets'} of ${reps[0]}${unitShort(e.unit)}` : `${e.sets.length} sets: ${reps.join(', ')}${unitShort(e.unit)}`;
  return scheme + (e.note ? `. ${e.note}` : '');
}
function wkStepper(k, label, value, step){
  return `<div class="wk-field"><label for="wk-in-${k}">${label}</label><div class="wk-stepper">
    <button type="button" data-wk="step" data-k="${k}" data-v="${-step}" aria-label="Less ${label.toLowerCase()}">−</button>
    <input id="wk-in-${k}" data-wk-in="${k}" type="number" inputmode="decimal" min="0" step="${step}" value="${value}">
    <button type="button" data-wk="step" data-k="${k}" data-v="${step}" aria-label="More ${label.toLowerCase()}">+</button></div></div>`;
}
// The bar on the workout screens fills toward your next level
function rankBarHTML(xp){
  const r = rankFor(xp), n = nextRank(xp), lv = levelInfo(xp), pct = Math.min(100, Math.round(lv.pct));
  const next = lv.L < MAX_LEVEL ? `${fmt(lv.toNext)} XP to Lv ${lv.L + 1}` : 'Max level';
  return {r, n, lv, pct, next, bar:`<div class="wk-bar" role="img" aria-label="${lv.L < MAX_LEVEL ? `${pct} percent of the way to level ${lv.L + 1}` : 'Max level reached'}"><div class="wk-bar-fill" style="width:${pct}%"></div></div>`};
}
function renderWorkout(){
  const page = document.getElementById('wkPage'), f = document.activeElement;
  const keep = f && f.dataset && (f.dataset.wk ? `[data-wk="${f.dataset.wk}"]${f.dataset.k ? `[data-k="${f.dataset.k}"]` : ''}${f.dataset.v ? `[data-v="${f.dataset.v}"]` : ''}` : null);
  const plan = wkPlan(), {p, w, d, day} = plan, e = plan.ex[wk.active] || plan.ex[0], rb = rankBarHTML(S.xp);
  const theme = wkTheme();
  applyWkTheme(document.getElementById('workout'), theme, rb.r);
  const n = e.sets.filter(setDone).length, all = n >= e.sets.length, next = e.sets.find(s => !setDone(s)), dr = wkDraft(e);
  const dots = e.sets.map(s => `<div class="wk-dot${setDone(s) ? ' done' : s === next ? ' current' : ''}"></div>`).join('');
  const big = e.weighted ? `${fmt(+dr.w || 0)}<span>${S.unit}</span>` : `${dr.r}<span>${e.unit || (dr.r === 1 ? 'rep' : 'reps')}</span>`;
  const idx = next ? e.sets.indexOf(next) : n;
  const status = all ? `All ${e.sets.length} sets logged` : `Set ${idx + 1} of ${e.sets.length} is next.` + (next.amrap ? ' Go for as many reps as you can.' : '') + (e.pick && !+dr.w ? ' Set the weight you used.' : '');
  const fields = all ? '' : `<div class="wk-fields">${e.weighted ? wkStepper('w', `Weight (${S.unit})`, dr.w, inc()) : ''}${wkStepper('r', e.unit ? UNIT_NAME[e.unit] : next.amrap ? 'Reps done' : 'Reps', dr.r, UNIT_STEP[e.unit] || 1)}</div>`;
  const total = plan.ex.reduce((a, x) => a + x.sets.length, 0), doneN = sessionSets();
  // Warm-up ramp: while it runs, the panel shows the ramp step instead of the working set
  const ramp = rampFor(plan, e), rs = ramp ? rampAt(e, ramp) : 0, inRamp = !!ramp && rs < ramp.length;
  const lt = lastTime(e.name), sug = !all && !inRamp && !n ? suggestFor(e) : null;   // the tip shows until the first set is in
  const lastLine = lt ? `<p class="wk-last"><b>Last time</b> ${setsText(lt[0].sets, e.unit)}${e.weighted && lt[0].sets[0][0] ? ` ${S.unit}` : ''} · ${niceDate(lt[0].iso).replace(/, \d{4}$/, '')}${lt[0].hit ? ' · every rep' : ''}</p>` : '';
  const sugLine = sug ? `<p class="wk-sug">${sug.w > Math.max(...lt[0].sets.map(s => s[0])) ? `Try ${fmt(sug.w)} ${S.unit} today.` : sug.w < Math.max(...lt[0].sets.map(s => s[0])) ? `Go ${fmt(sug.w)} ${S.unit} today.` : `Stay at ${fmt(sug.w)} ${S.unit}.`} ${sug.why}</p>` : '';
  const rampHTML = inRamp ? `<div class="wk-ramp"><p class="wk-ramp-h">Warm-up ramp · no XP</p>${ramp.map(([w, r], i) => `<p class="${i < rs ? 'done' : i === rs ? 'cur' : ''}"><span aria-hidden="true">${i < rs ? '✓' : i === rs ? '›' : '·'}</span>${i ? `${fmt(w)} × ${r}` : `Empty bar × ${r}`}<small>${i ? `${Math.round(w / e.sets[0].weight * 100)}%` : fmt(w) + ' ' + S.unit}</small></p>`).join('')}</div>` : '';
  const grid = plan.ex.map(x => {
    const k = x.sets.filter(setDone).length, ws = x.lift ? [...new Set(x.sets.map(s => s.weight))] : [];
    const meta = wkTarget(x).split('.')[0] + (ws.length ? ` at ${ws.length > 1 ? `${fmt(Math.min(...ws))}–${fmt(Math.max(...ws))}` : fmt(ws[0])} ${S.unit}` : '');
    return `<button type="button" class="wk-ex-btn" data-wk="pick" data-v="${x.ei}" aria-pressed="${x.ei === e.ei}"><span class="nm">${x.name}</span><span class="mt">${meta}</span>
      <span class="wk-mini" aria-label="${k} of ${x.sets.length} sets done">${x.sets.map(s => `<i class="${setDone(s) ? 'done' : ''}"></i>`).join('')}</span></button>`;
  }).join('');
  page.innerHTML = `<button type="button" class="wk-back" data-wk="back">‹ Back to Today</button>
    <header class="wk-head"><p class="wk-kicker">${pathOf(p).name} · ${p.name}, week ${w + 1} day ${d + 1}</p><h1 class="wk-title" id="wkTitle">${day.name}</h1></header>
    <div class="wk-rank"><div class="wk-rank-row"><span class="wk-rank-name">Lv ${rb.lv.L} · ${rb.r.k}-Rank ${rb.r.t}</span><span>${rb.next}</span></div>${rb.bar}</div>
    ${isBoss(p, w, d) ? `<section class="wk-panel wk-boss" aria-label="Boss battle"><div class="wk-boss-top"><span class="wk-boss-name">${bossName(p)}</span><span class="wk-boss-tag">Boss · HP ${total - doneN}/${total}</span></div>
      <div class="wk-hp" role="img" aria-label="Boss health ${total - doneN} of ${total}"><i style="width:${(total - doneN) / total * 100}%"></i></div><p>Every set you log is a hit. Clear every set to defeat it: +${fmt(bossXp(p))} XP.</p></section>` : ''}
    ${restHTML()}
    <section class="wk-panel wk-active" aria-live="polite">
      <div class="wk-active-top"><div><h2 class="wk-ex-name">${e.name}</h2>${S.swaps[e.base] ? `<p class="wk-swapped">Swapped from ${e.base}</p>` : ''}<p class="wk-ex-target">${wkTarget(e)}</p></div><p class="wk-big" id="wkBig">${inRamp ? `${fmt(ramp[rs][0])}<span>${S.unit}</span>` : big}</p></div>
      ${lastLine}${sugLine}
      ${e.lift && !all ? (pv => `<p class="wk-plates">${pv.viz}<span>${pv.text}</span></p>`)(plateViz(inRamp ? ramp[rs][0] : +dr.w || 0)) : ''}
      ${rampHTML}
      <div class="wk-tools"><button type="button" class="wk-chip" data-wk="tool" data-v="tips" aria-pressed="${wk.tool === 'tips'}">Form tips</button>${SWAPS[e.base] && !e.lift ? `<button type="button" class="wk-chip" data-wk="tool" data-v="swap" aria-pressed="${wk.tool === 'swap'}">Swap</button>` : ''}</div>
      ${wk.tool === 'tips' ? `<ul class="wk-tips">${cuesFor(e.name).map(c => `<li>${c}</li>`).join('')}</ul>` : ''}
      ${wk.tool === 'swap' && SWAPS[e.base] && !e.lift ? `<div class="wk-swaps" role="group" aria-label="Swap ${e.base} for">${[e.base, ...SWAPS[e.base]].map(n => `<button type="button" class="wk-chip" data-wk="swapTo" data-v="${n.replace(/"/g, '&quot;')}" aria-pressed="${e.name === n}">${n === e.base ? `${n} (original)` : n}</button>`).join('')}</div>` : ''}
      ${inRamp ? `<p class="wk-status">Warm-up ${rs + 1} of ${ramp.length}. Light and smooth, then your first set of ${fmt(e.sets[0].weight)}.</p>
      <button type="button" class="wk-btn" data-wk="rampLog">Done · ${rs ? fmt(ramp[rs][0]) : 'Bar'} × ${ramp[rs][1]}</button>
      <button type="button" class="wk-link" data-wk="rampSkip">Skip warm-up</button>` : `<div class="wk-dots" aria-hidden="true">${dots}</div>
      <p class="wk-status">${status}</p>
      ${fields}
      <button type="button" class="wk-btn" data-wk="log"${all ? ' disabled' : ''}>${all ? 'Exercise done' : `Log set ${idx + 1}`}</button>
      ${n ? '<button type="button" class="wk-link" data-wk="undo">Undo last set</button>' : ''}`}
    </section>
    <div class="wk-coach${rest ? ' resting' : ''}"><span class="wk-fig"><canvas id="coachImg" width="128" height="208" role="img"></canvas></span><p class="wk-panel wk-say" aria-live="polite">${coachLine(plan, e, next, all, doneN, total)}</p></div>
    <div class="wk-grid">${grid}</div>
    <button type="button" class="wk-btn" data-wk="finish"${doneN ? '' : ' disabled'}>Finish workout (${doneN} of ${total} sets)</button>
    <p class="wk-style">Today's style: ${theme.name}</p>`;
  setSprite('coachImg', rankIdx(), S.hero.gender);
  if (keep){ const el = page.querySelector(keep); if (el && !el.disabled) el.focus({preventScroll:true}); }
}
function openWorkout(){
  const plan = wkPlan(), first = plan.ex.find(e => !exDone(e)) || plan.ex[0], el = document.getElementById('workout');
  wk = {active:first.ei, drafts:{}, tool:null};
  lastFocus = document.activeElement;
  el.hidden = false; el.scrollTop = 0; behind().forEach(x => x.inert = true);
  renderWorkout();
  el.querySelector('[data-wk="log"]:not([disabled])')?.focus({preventScroll:true});
}
function closeWorkout(){
  const el = document.getElementById('workout'); if (el.hidden) return;
  el.hidden = true; behind().forEach(x => x.inert = false); wk = null; stopRest();
  render();
  document.querySelector('[data-act=startWk]')?.focus({preventScroll:true});
}
function wkLog(){
  const plan = wkPlan(), e = plan.ex[wk.active], s = e.sets.find(x => !setDone(x)); if (!s) return;
  const dr = wkDraft(e), r = Math.max(1, Math.round(+dr.r || 0)), wt = e.weighted ? Math.max(0, +dr.w || 0) : 0;
  S.done[s.key] = true; S.setLog[s.key] = {w:wt, r};
  if (s.amrap) S.amrap[s.key] = r;
  if (e.pick && wt) S.lastPick[e.name] = wt;
  if (exDone(e)){ const nx = plan.ex.find(x => !exDone(x)); if (nx){ wk.active = nx.ei; wk.tool = null; } }
  if (plan.ex.some(x => !exDone(x))) startRest(restFor(e, s)); else stopRest();
  save(); renderWorkout();
  buzz(8); sfx('set');
  if (!reduceMotion){ const c = document.getElementById('coachImg'); if (c) c.classList.add('cheer'); }   // the coach hypes every logged set
}
function wkUndo(){
  const e = wkPlan().ex[wk.active], s = [...e.sets].reverse().find(setDone); if (!s) return;
  delete S.done[s.key]; delete S.setLog[s.key]; delete S.amrap[s.key]; delete wk.drafts[e.ei];
  save(); renderWorkout();
}
// Finishing a workout, from here or from Clear stage on the Today tab
let wkSummary = null;
function completeWorkout(){
  const n = sessionSets();
  if (!n){ toast('Log at least one set first.'); return; }
  stopRest();
  const plan = wkPlan(), {p, w, d, day} = plan, mult = XP_MULT[p.rank], old = S.xp, theme = wkTheme();
  const rows = plan.ex.map(e => {
    const done = e.sets.filter(setDone), acts = done.map(setActual);
    let pr = 0;   // a rep-out set whose estimated max beats the current one
    if (e.lift) for (const s of done.filter(s => s.amrap)){ const a = setActual(s), est = roundW(e1rm(a.w, a.r)); if (est > S.maxes[e.lift] && est > pr) pr = est; }
    return {e, sets:done.length, vol:e.weighted ? acts.reduce((a, x) => a + x.w * x.r, 0) : 0, amount:acts.reduce((a, x) => a + x.r, 0), pr};
  });
  // Remember each exercise's sets for "last time" and auto-progression (the general warm-up aside). hit:
  // every set done with at least its target reps.
  for (const r of rows){ if (!r.sets || /warm-up/i.test(r.e.base)) continue;
    const done = r.e.sets.filter(setDone), hit = done.length === r.e.sets.length && done.every(s => setActual(s).r >= s.reps);
    S.exLog[r.e.name] = [{iso:todayIso(), unit:S.unit, sets:done.map(s => { const a = setActual(s); return [a.w, a.r]; }), hit}, ...(S.exLog[r.e.name] || [])].slice(0, 3); }
  const total = plan.ex.reduce((a, e) => a + e.sets.length, 0), clear = clearXp(n, total);
  const prs = rows.filter(r => r.pr), base = xpFor(n, p, total), full = n >= total;
  const achs = prs.flatMap(r => setMax(r.e.lift, r.pr, 'PR'));   // same as the Lock it in button
  const vol = rows.reduce((a, r) => a + r.vol, 0);
  const boss = isBoss(p, w, d), bossWon = boss && full;
  const entry = {date:today(), iso:todayIso(), prog:p.name, path:p.path, rank:p.rank, day:day.name, week:w + 1, sets:n, total, full,
    acc:rows.some(r => r.e.acc) && rows.filter(r => r.e.acc).every(r => r.sets >= r.e.sets.length),
    beat:rows.some(r => r.e.sets.some(s => s.amrap && setDone(s) && setActual(s).r > s.reps)),
    warm:rows.some(r => /warm-up/i.test(r.e.base) && r.sets), boss:bossWon || undefined, vol:vol ? Math.round(vol) : undefined, unit:vol ? S.unit : undefined, xp:0};
  S.log.unshift(entry); S.log = S.log.slice(0, 1000);
  const streakN = weekStreak(), sm = streakMult(streakN), streakXp = Math.round(base * (sm - 1));
  const quests = claimQuests(entry), questXp = quests.reduce((a, q) => a + q[1], 0);
  const ap = auraPerk(), auraXp = ap ? Math.round((base + streakXp) * ap.pct / 100) : 0;   // the aura you wear adds a little XP
  const gain = base + streakXp + auraXp + (bossWon ? bossXp(p) : 0) + prs.length * 100 + questXp;
  entry.xp = gain;
  S.xp += gain; S.sets += n; S.prs += prs.length;
  const stats = statGain(p.statW || p.path, p.rank, n / total), statsBefore = Object.fromEntries(STAT_KEYS.map(([k]) => [k, statVal(k)])), ovrBefore = ovr(p.path);
  for (const [k, v] of Object.entries(stats)) S.stats[k] = (S.stats[k] || 0) + v;
  const pre = dayPrefix();
  for (const bag of [S.done, S.amrap, S.setLog, S.ramp]) for (const k of Object.keys(bag)) if (k.startsWith(pre)) delete bag[k];
  const perWeek = p.weeks[w].days.length;
  let nd = d + 1, nw = w, arcDone = false;
  if (nd >= perWeek){ nd = 0; nw++; }
  if (nw >= p.weeks.length){ nw = 0; arcDone = true; }
  if (boss && !bossWon){ nd = d; nw = w; arcDone = false; }   // the boss waits for a rematch
  S.arcJustDone = arcDone ? p.id : null;   // Today offers the next arc until you start one or train again
  if (arcDone) S.arcs++;
  // Finishing an arc (its boss beaten) steps up the working weight of every barbell lift it used:
  // +5 lb on bench and press, +10 lb on the rest (half in kg). A real new max later replaces the boost.
  const boosts = [];
  if (arcDone) for (const l of new Set(p.weeks.flatMap(wv => wv.days.flatMap(dd => dd.ex.map(x => x.lift))).filter(Boolean))){
    const add = (l === 'bench' || l === 'ohp' ? 5 : 10) * (S.unit === 'kg' ? .5 : 1); S.tmAdd[l] = (S.tmAdd[l] || 0) + add; boosts.push([l, add]); }
  S.pos = {w:nw, d:nd}; save();
  const parts = [[`${n} ${n === 1 ? 'set' : 'sets'} logged`, n * 10], [full ? 'Stage cleared' : `Stage ${Math.round(n / total * 100)}% cleared`, clear - (full ? FULL_CLEAR : 0)]];
  if (full) parts.push(['Full clear bonus', FULL_CLEAR]);
  if (mult > 1) parts.push([`${p.rank}-Rank arc bonus (×${mult})`, base - (n * 10 + clear)]);
  if (streakXp) parts.push([`${streakN}-week streak (×${sm.toFixed(2)})`, streakXp]);
  if (auraXp) parts.push([`Aura: ${shopItem(shopEq().aura).name} (+${ap.pct}%)`, auraXp]);
  if (bossWon) parts.push([`Boss defeated: ${bossName(p)}`, bossXp(p)]);
  if (prs.length) parts.push([prs.length > 1 ? `${prs.length} new maxes` : 'New max', prs.length * 100]);
  parts.push(...quests);
  const items = checkItems();   // gear this workout just unlocked
  const pay = shopPay({n, total, rank:p.rank, prs:prs.length, bossDay:bossWon, arcDone, oldXp:old, quests:quests.reduce((a, q) => a + (q[2] || 0), 0)});
  wkSummary = {p, w, d, rows, n, total, vol, gain, parts, old, arcDone, boss, bossWon, stats, statsBefore, ovrBefore, quests, items, pay, achs, boosts, rewards:rewardsBetween(old, S.xp),
    rankedUp:rankFor(old).k !== rankFor(S.xp).k, theme, flairs:announceFlairs()};
  S.wkTheme = null; save();   // the next workout gets a new style
  openWkDone();
}
function openWkDone(){
  { const w0 = wkSummary, pr = w0.rows.some(r => r.pr); sfx(pr ? 'pr' : levelFor(S.xp) > levelFor(w0.old) ? 'level' : 'done'); if (pr) buzz(PR_BUZZ); }   // the result screen's sound
  const s = wkSummary, rb = rankBarHTML(S.xp), dlg = document.getElementById('wkDone');
  applyWkTheme(dlg, s.theme, rb.r);
  const amountOf = r => r.e.weighted ? `${fmt(r.vol)} ${S.unit}` : `${fmt(r.amount)} ${r.e.unit || (r.amount === 1 ? 'rep' : 'reps')}`;
  const rows = s.rows.filter(r => r.sets).map(r => `<li><span>${r.e.name}, ${r.sets} ${r.sets === 1 ? 'set' : 'sets'}${r.pr ? `<span class="wk-pr">PR ${fmt(r.pr)}</span>` : ''}</span><span class="val">${amountOf(r)}</span></li>`).join('');
  const note = s.rankedUp ? `<p class="wk-rank-note up">Lv ${rb.lv.L}: you reached ${rb.r.k}-Rank ${rb.r.t}!</p>`
    : rb.lv.L > levelFor(s.old) ? `<p class="wk-rank-note up">Level up! Lv ${levelFor(s.old)} → ${rb.lv.L}</p><p class="wk-rank-note">${rb.next}${rb.n ? ` · Lv ${rb.n.lv} unlocks ${rb.n.k}-Rank` : ''}</p>`
    : `<p class="wk-rank-note">Lv ${rb.lv.L} · ${rb.next}${rb.n ? ` · Lv ${rb.n.lv} unlocks ${rb.n.k}-Rank` : ''}</p>`;
  dlg.innerHTML = `<div class="wk-sheet">
    <div class="wk-stamp">${s.bossWon ? "Boss down" : s.boss ? "Rematch" : s.rankedUp ? s.theme.rankStamp : s.theme.stamp}</div>
    <p class="wk-kicker">${pathOf(s.p).name} · ${s.p.name}</p>
    <h2 class="wk-title" id="wkDoneTitle">${s.arcDone ? 'Arc<br>complete' : s.bossWon ? 'Boss<br>defeated' : s.boss ? 'Boss<br>escaped' : s.theme.title(s)}</h2>
    ${s.arcDone ? `<p class="wk-boss-note">${(nx => nx ? `Next up: ${nx.rank}-Rank ${nx.name}. Step up from the Today tab, or run this arc again.` : `You cleared the top rank of this path. Pick what's next on the Today tab.`)(nextArcOf(s.p))}</p>` : ''}
    ${s.boss ? `<p class="wk-boss-note">${s.bossWon ? `${bossName(s.p)} is down. +${fmt(bossXp(s.p))} XP boss bonus.` : `${bossName(s.p)} escaped. Clear every set to defeat it. It's waiting for a rematch.`}</p>` : ''}
    <div class="wk-panel wk-total">
      <div>${s.vol ? `<p class="big">${fmt(s.vol)}<span> ${S.unit}</span></p><p>Total weight moved today</p>` : `<p class="big">${s.n}<span> ${s.n === 1 ? 'set' : 'sets'}</span></p><p>Cleared today</p>`}</div>
      ${rows ? `<ul class="wk-breakdown">${rows}</ul>` : ''}
    </div>
    <div class="wk-pair">
      <div class="wk-panel wk-stat"><p class="mid">+${fmt(s.gain)}</p><p>XP earned</p></div>
      <div class="wk-panel wk-stat"><p class="mid">${s.n}</p><p>of ${s.total} sets done</p></div>
    </div>
    <details class="wk-exp"><summary>How you earned it</summary><ul>${s.parts.map(([l, v]) => `<li><span>${l}</span><span>+${fmt(v)}</span></li>`).join('')}</ul></details>
    ${payHTML(s.pay)}
    ${s.quests.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">Quest complete</p>${s.quests.map(([t, x, g]) => `<p>${t.replace(/^(Daily|Weekly) quest: /, '')} <b>+${fmt(x)} XP${g ? ` · +${fmt(g)} Grind` : ''}</b></p>`).join('')}</div>` : ''}
    ${s.rewards.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">Unlocked</p>${s.rewards.map(r => `<p>Lv ${r.lv}: ${rewardLabel(r)}</p>`).join('')}<p class="wk-gains-f">Equip it in the character editor.</p></div>` : ''}
    ${s.items.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">New gear</p>${s.items.map(a => `<p>${a.name} <b>${RARITY[a.rarity]}</b></p>`).join('')}<p class="wk-gains-f">Put it on in the character editor.</p></div>` : ''}
    ${s.boosts.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">Stronger next arc</p>${s.boosts.map(([l, a]) => `<p>${LIFTS[l]} <b>+${fmt(a)} ${S.unit}</b></p>`).join('')}<p class="wk-gains-f">Your working weights for these lifts went up.</p></div>` : ''}
    ${s.achs.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">Achievement</p>${s.achs.map(a => `<p>${achText(a)}</p>`).join('')}</div>` : ''}
    ${s.flairs && s.flairs.length ? `<div class="wk-panel wk-gains"><p class="wk-gains-h">New Today backdrop</p>${s.flairs.map(f => `<p>${f.name}: pick it in the Trophy room on Progress</p>`).join('')}</div>` : ''}
    <p class="wk-statline">${(o => `<span>OVR ${o}${o > s.ovrBefore ? ` ▲${o - s.ovrBefore}` : ''}</span>`)(ovr(s.p.path))}${STAT_KEYS.filter(([k]) => s.stats[k]).map(([k, ab]) => { const v = statVal(k), up = v - s.statsBefore[k]; return `<span>${ab} ${v}${up ? ` ▲${up}` : ''}</span>`; }).join('')}</p>
    ${rb.bar}${note}
    ${S.prefs.quotes ? (w => `<div class="wk-closing"><p class="wk-closing-q">“${w.text}”</p><p class="wk-closing-by">${w.by}</p></div>`)(s.closing = s.closing || closingWords(s)) : ''}
    <button type="button" class="wk-btn" data-wk="continue">${s.theme.button}</button>
  </div>`;
  if (typeof dlg.showModal === 'function'){ if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  dlg.querySelector('[data-wk="continue"]').focus();
  if (!reduceMotion) playXpGain(dlg, s);
}
// The earned XP counts up while the bar fills from where you started; each level passed fills it to the
// end and starts over, and the level-up line lands once the bar gets there
function playXpGain(dlg, s){
  const fill = dlg.querySelector('.wk-bar-fill'), num = dlg.querySelector('.wk-stat .mid'), notes = dlg.querySelectorAll('.wk-rank-note.up');
  if (!fill) return;
  const from = levelInfo(s.old), to = levelInfo(S.xp), laps = to.L - from.L, dur = Math.min(2400, 900 + laps * 350), t0 = performance.now();
  notes.forEach(n => n.style.visibility = 'hidden');
  fill.style.transition = 'none';
  let ended = false;
  const frame = now => {
    if (ended || (!dlg.open && !dlg.hasAttribute('open'))) return;
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    if (k >= 1) ended = true;
    const pos = from.pct / 100 + (laps + to.pct / 100 - from.pct / 100) * e;   // levels travelled, as a float
    fill.style.width = (k >= 1 ? to.pct : (pos % 1) * 100) + '%';
    if (num) num.textContent = '+' + fmt(Math.round(s.gain * e));
    if (k < 1) requestAnimationFrame(frame);
    else notes.forEach(n => { n.style.visibility = ''; n.classList.add('pop'); });
  };
  requestAnimationFrame(frame);
  setTimeout(() => { if (!ended) frame(t0 + dur); }, dur + 400);   // frames pause in a background tab; land the result anyway
}
function closeWkDone(){
  const dlg = document.getElementById('wkDone'), s = wkSummary;
  if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
  const wasOpen = !document.getElementById('workout').hidden;
  if (wasOpen){ document.getElementById('workout').hidden = true; behind().forEach(x => x.inert = false); wk = null; }
  tab = 'today'; render(true); window.scrollTo(0, 0); cheer();
  if (s && s.rankedUp) rankCheck(s.old); else document.querySelector('[data-act=startWk]')?.focus({preventScroll:true});
  wkSummary = null;
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-wk]'); if (!t) return;
  const a = t.dataset.wk;
  if (a === 'continue') return closeWkDone();
  if (!wk) return;
  if (a === 'back') closeWorkout();
  else if (a === 'pick'){ wk.active = +t.dataset.v; wk.tool = null; renderWorkout(); }
  else if (a === 'tool'){ wk.tool = wk.tool === t.dataset.v ? null : t.dataset.v; renderWorkout(); }
  else if (a === 'swapTo'){ const e = wkPlan().ex[wk.active]; if (t.dataset.v === e.base) delete S.swaps[e.base]; else S.swaps[e.base] = t.dataset.v; delete wk.drafts[e.ei]; save(); renderWorkout(); }
  else if (a === 'restAdd'){ if (rest){ rest.end += 15000; rest.total += 15; tickRest(); } }
  else if (a === 'restSkip'){ stopRest(); renderWorkout(); }
  else if (a === 'rampLog'){ const plan = wkPlan(), e = plan.ex[wk.active], st = rampFor(plan, e); if (!st) return; const at = rampAt(e, st) + 1; S.ramp[rampKey(e)] = at; save(); startRest(at < st.length ? 45 : 90); renderWorkout(); buzz(8); }
  else if (a === 'rampSkip'){ const e = wkPlan().ex[wk.active]; S.ramp[rampKey(e)] = 'skip'; save(); stopRest(); renderWorkout(); }
  else if (a === 'log') wkLog();
  else if (a === 'undo') wkUndo();
  else if (a === 'finish') completeWorkout();
  else if (a === 'step'){
    const e2 = wkPlan().ex[wk.active], dr = wkDraft(e2), k = t.dataset.k;
    dr[k] = Math.max(k === 'r' ? 1 : 0, Math.round(((+dr[k] || 0) + +t.dataset.v) * 100) / 100);
    renderWorkout();
  }
});
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.wkIn; if (!k || !wk) return;
  const v = Number(e.target.value); if (!Number.isFinite(v)) return;
  const e2 = wkPlan().ex[wk.active]; wkDraft(e2)[k] = v;
  const big = document.getElementById('wkBig');
  if (big && (k === 'w' ? e2.weighted : !e2.weighted)) big.innerHTML = k === 'w' ? `${fmt(v)}<span>${S.unit}</span>` : `${v}<span>${e2.unit || 'reps'}</span>`;
  const pl = document.querySelector('.wk-plates'); if (pl && k === 'w' && e2.lift){ const pv = plateViz(v); pl.innerHTML = `${pv.viz}<span>${pv.text}</span>`; }
});
document.getElementById('wkDone').addEventListener('cancel', e => e.preventDefault());   // only Continue closes it

let tab = 'today';
function render(animate){
  renderHeader();
  const v = document.getElementById('view');
  v.classList.toggle('view-enter', !!animate);
  document.querySelector('.hud').hidden = tab === 'today' || tab === 'progress';   // the banner and the card carry the character there
  v.innerHTML =tab === 'today' ? viewToday() : tab === 'calendar' ? viewCalendar() : tab === 'maxes' ? viewMaxes() : tab === 'arcs' ? viewArcs() : viewProgress();
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
  if (animate) [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 6)));
  if (tab === 'maxes') updateEstimate();
  paintHeroes();
  if (settingsOpen()) renderSettings();
}
function updateSessionXp(){
  const b = document.getElementById('sessXp'); if (!b) return;
  const n = sessionSets(); b.textContent = n ? '+' + xpFor(n, prog(), planSets()) : '0';
  const st = document.querySelector('.stage [data-act=startWk]'); if (st) st.textContent = n ? 'Continue workout' : 'Start workout';
}
// Dialogs: lock the page behind them, move focus in, and hand it back on close.
let lastFocus = null;
const behind = () => document.querySelectorAll('.app, .tabs');
function openDialog(id, focusSel){
  const d = document.getElementById(id);
  if (d.hidden) lastFocus = document.activeElement;
  if (d.hidden) d.scrollTop = 0;
  d.hidden = false; behind().forEach(el => el.inert = true);
  (focusSel && d.querySelector(focusSel) || d.querySelector('button')).focus({preventScroll:true});
}
function closeDialog(id){
  const d = document.getElementById(id); if (d.hidden) return false;
  d.hidden = true;
  if (!document.querySelector('.overlay:not([hidden])')){
    behind().forEach(el => el.inert = false);
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({preventScroll:true});
    lastFocus = null;
  }
  return true;
}
// Re-renders replace the clicked button; put focus back on its replacement.
const FOCUS_KEYS = ['key','tab','dir','path','iso','dow','unit','k','v','anim','id'];
const actSel = el => `[data-act="${el.dataset.act}"]` + FOCUS_KEYS.filter(n => el.dataset[n] != null).map(n => `[data-${n}="${CSS.escape(el.dataset[n])}"]`).join('');
function move(dir){
  const p = prog(), perWeek = p.weeks[0].days.length, total = p.weeks.length * perWeek;
  const idx = ((S.pos.w * perWeek + S.pos.d + dir) % total + total) % total;
  S.pos = {w:Math.floor(idx / perWeek), d:idx % perWeek}; save(); render();
}
function rankCheck(oldXp){
  const a = rankFor(oldXp), b = rankFor(S.xp);
  if (a.k !== b.k){
    const showRank = r => { document.getElementById('ruLetter').textContent = r.k; document.getElementById('ruTitle').textContent = r.t; };
    document.getElementById('ruGear').textContent = 'Your character evolved. New look unlocked.';
    paintHeroes(); openDialog('rankup'); sfx('rank'); buzz([80, 60, 80, 60, 260]);
    // The transformation plays from the rank just below the new one; the old rank shows until the reveal
    playRankUp(RANKS[Math.max(0, RANKS.indexOf(b) - 1)], b, showRank);
  }
}
/* ---------- Rank-up transformation ---------- */
// Plays the 36-frame strip for this rank step in place of the character, then hands back to the idle
// sprite. Your colors are carried over by matching each sprite color to what you recolored it to.
let ruTimer = null;
async function rankColorMap(g, k){
  const look = S.hero[g].look; if (!Object.keys(look).length) return null;
  const b = await spriteBase(g, k), src = b.dec.frames[0].data, out = recolorData(src, b.maps[0], b.mean, look).data, votes = new Map();
  for (let i = 0; i < src.data.length; i += 4){
    if (src.data[i + 3] < 255) continue;
    const s = (src.data[i] << 16) | (src.data[i + 1] << 8) | src.data[i + 2], t = (out[i] << 16) | (out[i + 1] << 8) | out[i + 2];
    if (s === t) continue;
    const v = votes.get(s) || new Map(); v.set(t, (v.get(t) || 0) + 1); votes.set(s, v);
  }
  const map = new Map(); for (const [s, v] of votes) map.set(s, [...v].sort((x, y) => y[1] - x[1])[0][0]);
  return map;
}
function stopRankUp(){
  clearTimeout(ruTimer); ruTimer = null;
  const anim = document.getElementById('ruAnim'); if (anim) anim.hidden = true;
  document.getElementById('ruImg').style.visibility = '';
}
async function playRankUp(from, to, showRank){
  stopRankUp();
  const g = S.hero.gender, I = RANKUP_INFO, src = (CHARACTER_RANKUPS[g === 'female' ? 'f' : 'm'] || {})[from.k + '>' + to.k];
  if (!src || reduceMotion){ showRank(to); return; }
  showRank(from);
  const [sheet, before, after] = await Promise.all([new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; }), rankColorMap(g, from.k), rankColorMap(g, to.k)]).catch(() => []);
  const anim = document.getElementById('ruAnim'), img = document.getElementById('ruImg');
  if (!sheet || document.getElementById('rankup').hidden){ showRank(to); return; }
  const ctx = anim.getContext('2d', {willReadFrequently:true});
  anim.hidden = false; img.style.visibility = 'hidden';
  let f = 0;
  const tick = () => {
    if (document.getElementById('rankup').hidden){ stopRankUp(); return; }
    ctx.clearRect(0, 0, I.w, I.h); ctx.drawImage(sheet, f * I.w, 0, I.w, I.h, 0, 0, I.w, I.h);
    const map = f < I.reveal ? before : after;
    if (map){
      const id = ctx.getImageData(0, 0, I.w, I.h), d = id.data;
      for (let i = 0; i < d.length; i += 4){ if (!d[i + 3]) continue; const t = map.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); if (t !== undefined){ d[i] = t >> 16; d[i + 1] = t >> 8 & 255; d[i + 2] = t & 255; } }
      ctx.putImageData(id, 0, 0);
    }
    if (f === I.reveal) showRank(to);
    if (++f < I.frames) ruTimer = setTimeout(tick, I.ms); else { stopRankUp(); showRank(to); }
  };
  tick();
}
// Clear stage on the Today tab finishes the same way as the workout screen
function finish(){
  if (!sessionSets()){ toast('Check off at least one set first.'); return; }
  completeWorkout();
}
// A short vibration, unless it is turned off in Settings
const buzz = p => { if (S.prefs.vibrate && navigator.vibrate) navigator.vibrate(p); };
// 8-bit sound effects, synthesized on the spot (no sound files): square-wave blips and fanfares.
// Each note is [frequency Hz, start sec, length sec, wave?, volume?]. Off with Settings > Sound effects.
const SFX = {
  set:   [[880, 0, .05], [1320, .05, .07]],
  start: [[440, 0, .06], [660, .06, .06], [990, .12, .12]],
  quest: [[660, 0, .07], [880, .07, .07], [1320, .14, .16]],
  rest:  [[523, 0, .1], [523, .16, .1], [784, .32, .26]],
  done:  [[523, 0, .09], [659, .09, .09], [784, .18, .09], [1047, .27, .32], [262, 0, .6, 'triangle', .1]],
  level: [[784, 0, .07], [988, .07, .07], [1175, .14, .07], [1568, .21, .34], [392, 0, .55, 'triangle', .1]],
  pr:    [[392, 0, .11, 'sawtooth', .06], [523, .11, .11, 'sawtooth', .06], [659, .22, .11, 'sawtooth', .06], [784, .33, .45, 'sawtooth', .06], [196, .33, .45, 'triangle', .12]],
  rank:  [[523, 0, .11], [523, .13, .11], [523, .26, .11], [698, .39, .38], [622, .8, .13], [698, .94, .13], [880, 1.08, .7], [262, .39, .4, 'triangle', .12], [349, 1.08, .7, 'triangle', .12]]
};
const PR_BUZZ = [70, 50, 70, 50, 220];
let audioCtx = null;
function sfx(kind){
  const notes = SFX[kind]; if (!notes || !S.prefs.sound) return;
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch(e){ return; }
  const t0 = audioCtx.currentTime + .02;
  for (const [f, at, len, type = 'square', vol = .05] of notes){
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0 + at);
    g.gain.setValueAtTime(vol, t0 + at); g.gain.exponentialRampToValueAtTime(.0001, t0 + at + len);
    o.connect(g); g.connect(audioCtx.destination); o.start(t0 + at); o.stop(t0 + at + len + .03);
  }
}
let toastT;
function toast(msg){
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

let resetT;
document.addEventListener('click', e => {
  if (e.target.id === 'heroEditor'){ closeDialog('heroEditor'); render(); return; }
  if (e.target.id === 'settings'){ closeDialog('settings'); return; }
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act;
  if (document.activeElement === t){ const sel = actSel(t); queueMicrotask(() => { if (!t.isConnected) document.querySelector(sel)?.focus({preventScroll:true}); }); }
  if (a !== 'reset') resetArmed = false;
  if (a !== 'delArc') deleteArmed = null;
  // Leaving an arc mid-way resets your place in it, so ask for a second tap
  if (a !== 'restartArc') restartArmed = null;
  if (a === 'tab'){ tab = t.dataset.tab; render(true); window.scrollTo(0, 0); }
  else if (a === 'check'){
    // Toggle in place so the check icon can animate and focus stays put
    const k = t.dataset.key, on = !S.done[k];
    if (on) S.done[k] = true; else delete S.done[k];
    save(); t.setAttribute('aria-pressed', on); t.closest('.set').classList.toggle('done', on); updateSessionXp();
    if (on) buzz(8);
  }
  else if (a === 'move') move(+t.dataset.dir);
  else if (a === 'finish') finish();
  else if (a === 'startWk'){ const p = prog(); if (isBoss(p, S.pos.w, S.pos.d) && window.TA_BOSSES) openArcBoss(); else openWorkout(); }
  else if (a === 'startWkPlain') openWorkout();
  else if (a === 'checkQuest'){   // daily check-ins are on your honor: tap when you've done it
    ensureQuests(); const id = t.dataset.v, c = CHECK_Q.find(x => x.id === id), k = `${S.q.day}:${id}`;
    if (!c || S.q.claimed[k] || !S.q.checks.includes(id)) return;
    const old = S.xp, g = questGrind(c.xp, true); S.q.claimed[k] = 1; S.xp += c.xp; if (window.TA_SHOP) TA_SHOP.addCoins(g);
    save(); render(); sfx('quest'); buzz(15); toast(`Quest done: ${c.text} · +${c.xp} XP · +${g} Grind`); rankCheck(old);
  }
  else if (a === 'lock'){
    const lift = t.dataset.lift, val = +t.dataset.val, old = S.xp;
    const ach = setMax(lift, val, 'PR'); const qs = claimQuests(null), qx = qs.reduce((a, q) => a + q[1], 0), qg = qs.reduce((a, q) => a + (q[2] || 0), 0); if (qg && window.TA_SHOP) TA_SHOP.addCoins(qg); S.xp += 100 + qx; S.prs++; const gear = checkItems(); save(); render(); cheer(); sfx('pr'); buzz(PR_BUZZ);
    const lvUp = levelFor(S.xp) > levelFor(old) ? ` · Level ${levelFor(S.xp)}!` : '';
    toast(`PR! ${LIFTS[lift]} max is now ${fmt(val)} ${S.unit} · +${100 + qx} XP${qx ? ` (quest done${qg ? `, +${qg} Grind` : ''})` : ''}${lvUp}${gear.length ? ' · Unlocked ' + gear.map(g => g.name).join(', ') : ''}${ach.length ? ' · Achievement: ' + ach.map(achText).join(', ') : ''}${flairNote()}`); rankCheck(old);
  }
  else if (a === 'unit') setUnit(t.dataset.unit);
  else if (a === 'useEst'){
    const lift = document.getElementById('est-lift').value, val = +t.dataset.val;
    const ach = setMax(lift, val, 'Estimated'); save(); render(); toast(`${LIFTS[lift]} max set to ${fmt(val)} ${S.unit}${ach.length ? ' · Achievement: ' + ach.map(achText).join(', ') : ''}${flairNote()}`); if (ach.length) cheer();
  }
  else if (a === 'openSettings') openSettings();
  else if (a === 'closeSettings') closeDialog('settings');
  else if (a === 'pref'){ S.prefs[t.dataset.k] = !S.prefs[t.dataset.k]; save(); if (t.dataset.k === 'restAuto' && !S.prefs.restAuto) stopRest(); render(); }
  else if (a === 'restScale'){ S.prefs.restScale = +t.dataset.v; save(); renderSettings(); }
  else if (a === 'stEditHero'){ closeDialog('settings'); document.querySelector('[data-act=openHero]')?.click(); }
  else if (a === 'stSetup'){ closeDialog('settings'); openWelcome(); }
  else if (a === 'showTitle'){ closeDialog('settings'); openTitle(S.prefs.title); }
  else if (a === 'newArc') openBuilder(newArcDraft());
  else if (a === 'remix'){ const p = PROGRAMS.find(x => x.id === t.dataset.id); if (p) openBuilder(remixOf(p)); }
  else if (a === 'editArc'){ const def = S.customArcs.find(x => x.id === t.dataset.id); if (def) openBuilder(def, def.id); }
  else if (a === 'delArc'){ const id = t.dataset.id;
    if (deleteArmed !== id){ deleteArmed = id; render(); setTimeout(() => { if (deleteArmed === id){ deleteArmed = null; if (tab === 'arcs') render(); } }, 4000); return; }
    deleteArmed = null; const name = (S.customArcs.find(x => x.id === id) || {}).name; S.customArcs = S.customArcs.filter(x => x.id !== id);
    if (S.arcSaves) delete S.arcSaves[id]; if (S.programId === id){ S.programId = DEFAULT.programId; S.pos = {w:0, d:0}; }
    save(); render(); toast(`${name} deleted.`); }
  else if (a === 'medal'){   // opens that medal's details under its row; tap again (or ×) to close
    const l = t.dataset.lift, lb = +t.dataset.lb, same = medalSel && medalSel.lift === l && medalSel.lb === lb;
    medalSel = same ? null : {lift:l, lb}; render();
    if (!same) document.querySelector('.md-card')?.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'});
    else document.querySelector(`.medal[data-lift="${l}"][data-lb="${lb}"]`)?.focus({preventScroll:true});
  }
  else if (a === 'flair'){   // tap to add (up to three) or take off; relocked backdrops don't hold a slot
    const v = t.dataset.v; if (!flairOf(v) || (!flairOf(v).ok() && !flairsOn().includes(v))) return; S.flairSeen = [...new Set([...(S.flairSeen || []), v])];
    const h = S.hero[S.hero.gender], on = flairsOn(); heroFlairs();
    if (on.includes(v)){ h.flairs = on.filter(x => x !== v); save(); render(); toast(`${flairOf(v).name} removed · ${h.flairs.length} of ${MAX_FLAIRS} showing.`); return; }
    if (on.length >= MAX_FLAIRS){ toast(`You can show ${MAX_FLAIRS} at a time. Tap one you're showing to take it off first.`); return; }
    h.flairs = [...on, v]; save(); render(); toast(`${flairOf(v).name} added · ${h.flairs.length} of ${MAX_FLAIRS} showing on Today.`);
  }
  else if (a === 'boss') openBoss(t.dataset.id);
  else if (a === 'shop') openShop();
  else if (a === 'maxProfile' && SHOW_TEST_TOOLS){ closeDialog('settings'); makeMaxedProfile(); }
  else if (a === 'installApp' && installEvt){ const ev = installEvt; ev.prompt(); ev.userChoice.finally(() => { installEvt = null; renderSettings(); }); }
  else if (a === 'invShop') openShop();
  else if (a === 'invTab'){ invTab = t.dataset.v; invSel = null; renderHeroEditor(); }
  else if (a === 'heSec'){ heSec = t.dataset.v; renderHeroEditor(); document.querySelector(`[data-act=heSec][data-v=${heSec}]`)?.focus({preventScroll:true}); }
  else if (a === 'invItem') invToggle(t.dataset.id);
  else if (a === 'switchProfile'){ closeDialog('settings'); openProfiles(null, true); }
  else if (a === 'stayArc'){ S.arcJustDone = null; save(); render(); toast(`${prog().name}, round two. Let's go.`); }
  else if (a === 'start'){
    S.arcJustDone = null; const resumed = switchArc(t.dataset.id);   // the arc you leave keeps its place
    save(); tab = 'today'; render(true); window.scrollTo(0, 0);   // your streak and history carry over
    toast(resumed ? `${prog().name}: back to Week ${S.pos.w + 1}, Day ${S.pos.d + 1}.` : `${prog().name} started. Training arc: begin.`);
  }
  else if (a === 'restartArc'){ const id = t.dataset.id;
    if (restartArmed !== id){ restartArmed = id; render(); setTimeout(() => { if (restartArmed === id){ restartArmed = null; if (tab === 'arcs') render(); } }, 4000); return; }
    restartArmed = null; restartArc(id); save(); render(); toast('Back to Week 1, Day 1.');
  }
  else if (a === 'closeRank'){ stopRankUp(); closeDialog('rankup'); }
  else if (a === 'shareCard') shareCard(t.dataset.v);
  else if (a === 'path'){ arcPath = t.dataset.path; render(); }
  else if (a === 'allArcs'){ S.prefs.allArcs = !S.prefs.allArcs; save(); arcPath = null; render(); }
  else if (a === 'openHero'){ previewRank = rankIdx(); editG = S.hero.gender; renderHeroEditor(); openDialog('heroEditor', '[data-act=closeHero]'); document.getElementById('heName').value = S.hero.name; paintHeroes(); }
  else if (a === 'closeHero'){ closeDialog('heroEditor'); render(); }
  else if (a === 'heroRank'){ previewRank = +t.dataset.v; renderHeroEditor(); paintHeroes(); }
  else if (a === 'heroGender'){
    editG = t.dataset.v;
    if (hasArt(editG) && S.hero.gender !== editG){ S.hero.gender = editG; arcPath = null; if (!S.prefs.allArcs && ![editG, 'both'].includes(pathOf(prog()).g)) toast(editG === 'female' ? 'Her arcs are ready in the Arcs tab.' : 'His arcs are ready in the Arcs tab.'); }   // without art yet, the page explains and you stay as you are
    save(); renderHeroEditor(); renderHeader();
  }
  else if (a === 'heroLook'){ const k = t.dataset.k, pr = S.hero[editG]; if (t.dataset.v) pr.look[k] = t.dataset.v; else delete pr.look[k]; save(); renderHeroEditor(); paintHeroes(); }
  else if (a === 'heroStage'){ S.hero[editG].stage = +t.dataset.v; save(); renderHeroEditor(); paintHeroes(); }
  else if (a === 'heroStyle'){ S.hero[editG].style = t.dataset.v; save(); renderHeroEditor(); paintHeroes(); }
  else if (a === 'heroAcc'){ const it = accById(t.dataset.v), pr = S.hero[editG]; if (!it || !S.items[it.id]) return; pr.acc = pr.acc || {}; if (pr.acc[it.slot] === it.id) delete pr.acc[it.slot]; else pr.acc[it.slot] = it.id; save(); renderHeroEditor(); paintHeroes(); }
  else if (a === 'heroReset'){ S.hero[editG] = {look:{}, stage:0, style:GENDERS[editG].defStyle, acc:{}}; save(); renderHeroEditor(); paintHeroes(); toast(`${GENDERS[editG].label} look reset.`); }
  else if (a === 'calMove'){
    const d = new Date(calView.y, calView.m + +t.dataset.dir, 1);
    calView = {y:d.getFullYear(), m:d.getMonth()};
    const tIso = todayIso();
    calSel = tIso.startsWith(`${calView.y}-${pad(calView.m + 1)}`) ? tIso : ymd(d);
    render();
  }
  else if (a === 'calToday'){ const n = new Date(); calView = {y:n.getFullYear(), m:n.getMonth()}; calSel = todayIso(); render(); }
  else if (a === 'calUnmove'){   // past days keep how they were moved, so streaks and misses don't change
    const tIso = todayIso(); for (const iso in S.dayMoves) if (iso >= tIso) delete S.dayMoves[iso]; S.dayPins = {};
    save(); render(); toast('Moved days undone. Workouts follow your training days again.'); }
  else if (a === 'calSel'){ calSel = t.dataset.iso; const dt = fromYmd(calSel); calView = {y:dt.getFullYear(), m:dt.getMonth()}; render(); document.querySelector('.cal-day')?.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'}); }
  else if (a === 'nextQuote'){ showQuote(1); startQuotes(); }
  else if (a === 'chartLift'){ chartLift = t.dataset.v; render(); }
  else if (a === 'chartPt'){ const tip = document.getElementById('chartTip'); if (tip) tip.textContent = t.dataset.tip; }
  else if (a === 'heroTitle'){ S.hero.title = t.dataset.v; save(); renderHeroEditor(); renderHeader(); }
  else if (a === 'sched'){
    const d = +t.dataset.dow, i = S.schedule.indexOf(d);
    if (i >= 0) S.schedule.splice(i, 1); else S.schedule.push(d);
    setSchedule(S.schedule.sort()); save(); render();
  }
  else if (a === 'backupSave') saveBackupFile();
  else if (a === 'backupCode') copyBackupCode();
  else if (a === 'restoreFile') document.getElementById('restoreFileInput')?.click();
  else if (a === 'restorePaste'){ const v = document.getElementById('restoreText')?.value || ''; if (v.trim()) offerRestore(v); else toast('Paste a backup code first.'); }
  else if (a === 'restoreYes') applyRestore();
  else if (a === 'restoreNo'){ restorePending = null; render(); }
  else if (a === 'restoreUndo') undoRestore();
  else if (a === 'reset'){
    if (!resetArmed){
      resetArmed = true; render();
      clearTimeout(resetT); resetT = setTimeout(() => { if (resetArmed){ resetArmed = false; if (tab === 'progress') render(); } }, 4000);
      return;
    }
    resetArmed = false; S = normalize(Object.assign(clone(DEFAULT), {onboarded:false})); save(); closeDialog('settings'); tab = 'today'; render(); toast('Progress reset.'); openWelcome();   // a fresh start gets the welcome again
  }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'plate-w'){
    const v = +el.value || 0, pv = plateViz(v), o = document.getElementById('plate-out');
    if (o) o.innerHTML = v ? `${pv.viz}<span class="fine">${pv.text}</span>` : '<span class="fine">Enter a weight to see the plates.</span>';
    return;
  }
  if (el.matches('[data-amrap]')){
    const key = el.dataset.amrap, n = parseInt(el.value, 10);
    if (n > 0) S.amrap[key] = n; else delete S.amrap[key];
    save();
    const box = document.querySelector(`[data-pr="${key}"]`);
    if (box) box.innerHTML = prHTML(el.dataset.lift, +el.dataset.w, n > 0 ? n : 0);
  }
  if (el.closest('#estimator')) updateEstimate();
  if (el.id === 'heName'){ S.hero.name = el.value.trim().slice(0, 14) || 'Hero'; save(); document.getElementById('heroName').textContent = S.hero.name; }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'trBw'){ const v = parseFloat(el.value); S.bw = v > 0 ? Math.round(v * 10) / 10 : 0; save(); render(); return; }
  if (el.id === 'stTitleScene'){ S.prefs.title = el.value; save(); toast(el.value === 'shuffle' ? 'A new title scene each launch.' : `${el.selectedOptions[0].text} it is.`); return; }
  if (el.id === 'restoreFileInput'){ const file = el.files && el.files[0]; el.value = ''; if (file) file.text().then(offerRestore, () => toast('That file could not be read.')); return; }
  if (el.matches('[data-max]')){
    const lift = el.dataset.max, val = Math.round(parseFloat(el.value) * 10) / 10;
    const real = S.history.some(h => h.lift === lift);
    if (!(val > 0)) { el.value = real ? S.maxes[lift] : ''; return; }
    if (val === S.maxes[lift] && real) return;   // a stand-in number typed for real still counts
    const ach = setMax(lift, val, 'Entered'); save(); render(); toast(`${LIFTS[lift]} max set to ${fmt(val)} ${S.unit}${ach.length ? ' · Achievement: ' + ach.map(achText).join(', ') : ''}${flairNote()}`); if (ach.length) cheer();
  }
});
// Arrow keys move between the Male / Female tabs
document.addEventListener('keydown', e => {
  const t = e.target.closest && e.target.closest('[role=tab]'); if (!t || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
  const tabs = [...t.parentElement.querySelectorAll('[role=tab]')], next = tabs[(tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
  e.preventDefault(); next.focus(); next.click();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape'){
  if (tsx){ closeTitle('start'); return; }
  if (pf){ if (pf.canClose) closeProfiles(); return; }
  if (document.getElementById('wkDone').open) return;   // only Continue closes the workout complete page
  if (closeDialog('rankup')) return; if (closeDialog('heroEditor')){ render(); return; }
  if (!document.getElementById('arcBuilder').hidden){ cancelBuilder(); return; }   // asks once before throwing away edits
  if (closeDialog('settings')) return;
  if (ob && S.onboarded){ document.getElementById('welcome').hidden = true; behind().forEach(x => x.inert = false); ob = null; return; }   // replaying setup can be left
  closeWorkout();
} });

/* ---------- Character on screen ---------- */
// Each canvas plays its rank's idle loop in the chosen colors; reduced motion holds the first frame.
const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
let previewRank = 0;
const rankIdx = () => RANKS.indexOf(rankFor(S.xp));
const lookKey = (look, style, acc = {}) => style + '|' + PART_IDS.map(p => look[p] || '').join('|') + '|' + SLOT_ORDER.map(s => acc[s] || '').join(',');
const BASES = {}, RENDERS = new Map();
let editG = 'male';   // the character page open in the editor
const hasArt = g => !!GENDERS[g].ranks;
function spriteBase(g, k){
  const set = GENDERS[g].ranks, src = (set[k] || set.F).src;
  return BASES[g + k] || (BASES[g + k] = decodeApng(src).then(dec => {
    const maps = partMaps(dec, RANKS.findIndex(r => r.k === k) >= 6, GENDERS[g].hairZone);
    if (GENDERS[g].slim) slimArms(dec, maps, RANKS.findIndex(r => r.k === k));
    // Average lightness of each part, so a picked color lands on the part's middle shade
    const sum = new Array(9).fill(0), n = new Array(9).fill(0), d = dec.frames[0].data.data;
    maps[0].forEach((t, p) => { if (t){ sum[t] += rgbHsl(d[p * 4], d[p * 4 + 1], d[p * 4 + 2])[2]; n[t]++; } });
    // How far the idle bob has pushed each frame down, so new hair moves with the head
    return {dec, maps, heads:headOffsets(dec, maps), bodies:bodyOffsets(dec, maps), ext:rowExtents(dec, maps), ramp:hairRampOf(dec, maps[0]), mean:sum.map((s, i) => n[i] ? s / n[i] : .5)};
  }));
}
// One frame with headroom added above, the chosen hairstyle painted in, then recolored
function styledFrame(b, i, style, look, accs = []){
  const img = new ImageData(SPRITE_W, SPRITE_H), map = new Uint8Array(SPRITE_W * SPRITE_H);
  img.data.set(b.dec.frames[i].data.data, SPRITE_PAD * SPRITE_W * 4); map.set(b.maps[i], SPRITE_PAD * SPRITE_W);
  applyHair(img, map, style, b.ramp, b.heads[i]);
  for (const a of accs) paintAcc(img, map, a, b.ext, a.anchor === 'head' ? b.heads[i] : b.bodies[i]);
  return recolor(img, map, b.mean, look);
}
const recolor = (src, map, mean, look) => createImageBitmap(recolorData(src, map, mean, look));
function recolorData(src, map, mean, look){
  const out = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height), d = out.data, cache = new Map();
  const tgt = PART_IDS.map(p => look[p] ? rgbHsl(...hexRgb(look[p])) : null);
  for (let p = 0; p < map.length; p++){
    const t = map[p], T = tgt[t]; if (!T) continue;
    const i = p * 4, ck = t * 16777216 + ((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    let c = cache.get(ck);
    if (!c){ c = hslRgb(T[0], T[1], Math.min(.97, Math.max(.03, T[2] + rgbHsl(d[i], d[i + 1], d[i + 2])[2] - mean[t]))); cache.set(ck, c); }
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
  }
  return out;
}
function spriteFrames(g, k, look, style, acc = {}){
  const key = g + '|' + k + '|' + lookKey(look, style, acc);
  if (!RENDERS.has(key)){
    if (RENDERS.size > 12) RENDERS.delete(RENDERS.keys().next().value);
    RENDERS.set(key, Promise.all([spriteBase(g, k), equippedArt(g, acc)]).then(([b, accs]) => Promise.all(b.dec.frames.map((f, i) => styledFrame(b, i, style, look, accs)))
      .then(bmps => bmps.map((bmp, i) => ({bmp, delay:b.dec.frames[i].delay})))));
  }
  return RENDERS.get(key);
}
const players = {};
function setSprite(id, i, g){
  const cv = document.getElementById(id), r = RANKS[i], {style, acc} = S.hero[g], look = wornLook(g), want = g + '|' + r.k + '|' + lookKey(look, style, acc);
  cv.setAttribute('aria-label', `${S.hero.name || 'Hero'}, ${GENDERS[g].label.toLowerCase()} character, ${r.k}-Rank ${r.t}`);
  const pl = players[id] || (players[id] = {want:null, frames:null, i:0, next:0});
  if (pl.want === want) return;
  pl.want = want;
  spriteFrames(g, r.k, look, style, acc).then(fr => { if (pl.want === want){ pl.frames = fr; pl.i = 0; pl.next = 0; if (id === 'bannerImg') fitBubble(fr); } });
}
// The Today quote bubble sits beside the banner hero. Bulkier ranks, auras and gear reach further left,
// so measure how far in the hero starts (across every frame) and size the bubble to stay clear of it.
const INSETS = new WeakMap();
let heroIn = null;
function fitBubble(fr){
  let inset = INSETS.get(fr);
  if (inset == null){
    const w = fr[0].bmp.width, h = Math.min(fr[0].bmp.height, 150), cv = document.createElement('canvas'), ctx = cv.getContext('2d', {willReadFrequently:true});
    cv.width = w; cv.height = h; inset = w;
    for (const f of fr){
      ctx.clearRect(0, 0, w, h); ctx.drawImage(f.bmp, 0, 0); const d = ctx.getImageData(0, 0, w, h).data;
      for (let y = 0; y < h; y++) for (let x = 0; x < inset; x++) if (d[(y * w + x) * 4 + 3] > 20){ inset = x; break; }
    }
    INSETS.set(fr, inset);
  }
  heroIn = `calc(var(--hero-w) * ${(inset / 128).toFixed(3)})`;
  document.querySelector('.banner-wrap')?.style.setProperty('--hero-in', heroIn);
}
function tickPlayers(now){
  for (const id in players){
    const pl = players[id], cv = document.getElementById(id);
    if (!cv) continue;
    if (pl.cv !== cv){ pl.cv = cv; pl.next = 0; }   // a re-rendered canvas gets drawn right away
    if (!pl.frames || cv.closest('[hidden]') || now < pl.next) continue;
    const f = pl.frames[pl.i], ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(f.bmp, 0, 0);
    if (reduceMotion){ pl.next = Infinity; continue; }
    pl.next = now + f.delay; pl.i = (pl.i + 1) % pl.frames.length;
  }
  requestAnimationFrame(tickPlayers);
}
requestAnimationFrame(tickPlayers);
function paintHeroes(){
  const g = S.hero.gender;
  document.documentElement.dataset.stage = STAGES[S.hero[g].stage].toLowerCase();
  for (const id of ['heroImg', 'ruImg', 'bannerImg', 'cardImg', 'coachImg']) if (document.getElementById(id)) setSprite(id, rankIdx(), g);
  if (hasArt(editG)) setSprite('heImg', previewRank, editG);
  paintEditorExtras();
}
function cheer(){
  if (reduceMotion) return;
  for (const id of ['heroImg', 'bannerImg', 'coachImg']){ const el = document.getElementById(id); if (!el) continue; el.classList.remove('cheer'); void el.offsetWidth; el.classList.add('cheer'); }
}
// Gear in the editor: every item with its rarity and slot. Locked ones say how to earn them.
function gearHTML(pr){
  const acc = pr.acc || {}, got = ACCESSORIES.filter(a => S.items[a.id]).length;
  const tile = a => { const open = !!S.items[a.id], on = acc[a.slot] === a.id;
    return `<button type="button" class="gear r-${a.rarity}" data-act="heroAcc" data-v="${a.id}"${open ? ` aria-pressed="${on}"` : ' disabled'}>
      <span class="gear-name">${a.name}</span><span class="gear-meta"><span class="gear-rar">${RARITY[a.rarity]}</span>${SLOT_NAME[a.slot]}</span>
      <span class="gear-how">${open ? (on ? 'Wearing · tap to take off' : 'Tap to wear') : `Locked · ${a.how}`}</span></button>`; };
  return `<div class="he-group"><h4>Training gear <span class="he-note">earned from training milestones · ${got} of ${ACCESSORIES.length} unlocked · one per slot</span></h4><div class="gear-grid">${ACCESSORIES.map(tile).join('')}</div></div>`;
}
function renderHeroEditor(){
  // Male / Female tabs: picking one plays as that character and opens its own page
  document.getElementById('heTabs').innerHTML = Object.entries(GENDERS).map(([g, G]) =>
    `<button role="tab" id="heTab-${g}" data-act="heroGender" data-v="${g}" aria-controls="${hasArt(g) ? 'hePage' : 'heEmpty'}" aria-selected="${editG === g}" tabindex="${editG === g ? 0 : -1}">${G.label}${!hasArt(g) ? '<span class="tab-soon">Soon</span>' : ''}</button>`).join('');
  const ready = hasArt(editG);
  document.getElementById('hePage').hidden = !ready;
  document.getElementById('heEmpty').hidden = ready;
  document.getElementById(ready ? 'hePage' : 'heEmpty').setAttribute('aria-labelledby', 'heTab-' + editG);
  if (!ready) return;
  const G = GENDERS[editG], pr = S.hero[editG];
  const cur = rankIdx(), r = RANKS[previewRank], look = pr.look;
  document.getElementById('heRanks').innerHTML = RANKS.map((x, i) => `<button class="opt${i > cur ? ' locked' : ''}" data-act="heroRank" data-v="${i}" aria-pressed="${i === previewRank}">${x.k}</button>`).join('');
  document.getElementById('heGear').textContent = `${r.k}-Rank · ${r.t}. ` + (previewRank > cur ? `Locked. Reach level ${r.lv} to unlock this look.` : previewRank === cur ? 'This is your current look.' : 'Unlocked.');
  const sw = part => `<div class="swatches" role="group" aria-label="${part.label}">`
    + `<button class="sw-btn sw-default" data-act="heroLook" data-k="${part.k}" data-v="" aria-pressed="${!look[part.k]}" aria-label="${part.label}: rank default" title="Rank default"></button>`
    + [...part.colors, ...REWARDS.filter(r => r.kind === (part.k === 'hair' ? 'hair' : part.k === 'aura' ? 'aura' : part.k === 'skin' ? '-' : 'cloth')).map(r => [r.color, r.name, r.lv])]
      .map(([c, name, lv]) => lv && curLevel() < lv
        ? `<button class="sw-btn locked" style="--c:${c}" disabled aria-label="${part.label}: ${name}, unlocks at level ${lv}" title="${name}: unlocks at Lv ${lv}"></button>`
        : `<button class="sw-btn" style="--c:${c}" data-act="heroLook" data-k="${part.k}" data-v="${c}" aria-pressed="${look[part.k] === c}" aria-label="${part.label}: ${name}" title="${name}"></button>`).join('')
    + '</div>';
  // Four sections behind a sticky bar, so the editor is one screen at a time: Style, Colors, Items, Stage
  const ownedN = window.TA_SHOP ? TA_SHOP.state().owned.length : 0;
  const shopOn = Object.entries(shopEq()).filter(([t]) => ['outfit', 'hair', 'shoes', 'cape', 'aura'].includes(t)).map(([, id]) => (shopItem(id) || {}).name).filter(Boolean);
  const SECS = [['style', 'Style'], ['colors', 'Colors'], ['items', 'Items', ownedN], ['stage', 'Stage']];
  const bar = `<div class="seg seg-wide he-secs" role="tablist" aria-label="Edit">${SECS.map(([k, l, c]) =>
    `<button type="button" role="tab" data-act="heSec" data-v="${k}" aria-selected="${heSec === k}" tabindex="${heSec === k ? 0 : -1}">${l}${c ? ` <span class="num he-count">${c}</span>` : ''}</button>`).join('')}</div>`;
  const sec = {
    style: `<div class="he-group"><h4>Hair style</h4><div class="opt-chips">${G.styles.map(h => `<button class="opt" data-act="heroStyle" data-v="${h.id}" aria-pressed="${pr.style === h.id}">${h.name}</button>`).join('')}</div></div>`
      + `<div class="he-group"><h4>Title <span class="he-note">shown under your name</span></h4>${shopItem(shopEq().title) ? `<p class="fine">Your shop title "${esc(shopItem(shopEq().title).text)}" is showing. Take it off under Items to use one of these.</p>` : ''}<div class="opt-chips">
        <button class="opt" data-act="heroTitle" data-v="" aria-pressed="${heroTitle() === rankFor(S.xp).t}">${rankFor(S.xp).t} (rank)</button>
        ${REWARDS.filter(r => r.kind === 'title' && rewardOpen(r)).map(r => `<button class="opt" data-act="heroTitle" data-v="${r.name}" aria-pressed="${S.hero.title === r.name}">${r.name}</button>`).join('')}</div>
        ${nextReward() ? `<p class="fine">${(t => t ? `Next title: "${t.name}" at Lv ${t.lv}.` : '')(REWARDS.find(r => r.kind === 'title' && !rewardOpen(r)))}</p>` : ''}</div>`,
    // one tidy row per part: the label on the left, its swatches in a single scrolling line
    colors: (shopOn.length ? `<p class="fine he-shopnote">Shop gear on: ${shopOn.join(', ')}. It covers those colors until you take it off under Items.</p>` : '')
      + `<div class="he-colors">${LOOK_PARTS.map(part => editG === 'female' && part.k === 'band' ? {...part, label:'Hair tie', note:''} : part)   // her red accent is a hair tie
        .map(part => `<div class="he-crow"><span class="he-clbl">${part.label}${part.note ? `<small>${part.note}</small>` : ''}</span>${sw(part)}</div>`).join('')}</div>`,
    items: invEditorHTML() + gearHTML(pr),
    stage: `<div class="he-group"><h4>Stage <span class="he-note">the backdrop behind your hero</span></h4><div class="opt-chips">${STAGES.map((s, i) => { const lv = stageLv(s);
        return lv && curLevel() < lv ? `<button class="opt locked" disabled title="Unlocks at Lv ${lv}">${s} · Lv ${lv}</button>`
          : `<button class="opt" data-act="heroStage" data-v="${i}" aria-pressed="${pr.stage === i}">${s}</button>`; }).join('')}</div></div>`
  };
  document.getElementById('heOpts').innerHTML = bar + `<div class="he-sec" role="tabpanel">${sec[heSec] || sec.style}</div>`
    + `<div class="he-foot"><button class="btn btn-ghost btn-sm" data-act="heroReset"${Object.keys(look).length || pr.stage || pr.style !== G.defStyle ? '' : ' disabled'}>Reset ${G.label.toLowerCase()} look</button></div>`;
}

checkItems(); checkAch(); save();   // gear and achievements already earned before they existed unlock on first load
render();
startQuotes();
// Setup for a brand-new player starts once they make their profile (after the title screen)
openTitle();   // the main menu greets everyone on launch; new players go from it into the welcome
// The splash stays until the character art is ready (at least half a second, at most three), then fades out
(function hideSplash(){
  const sp = document.getElementById('splash'), t0 = performance.now();
  const ready = () => ['heroImg', 'bannerImg', 'obImg'].some(id => players[id] && players[id].frames && document.getElementById(id));
  const check = () => { const t = performance.now() - t0;
    if ((ready() && t > 500) || t > 3000){ if (reduceMotion){ sp.remove(); return; } sp.classList.add('out'); setTimeout(() => sp.remove(), 450); }
    else setTimeout(check, 60); };
  check();
})();
