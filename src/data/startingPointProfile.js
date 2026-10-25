// Starting Point Profile v3: patterns, questions and doors.
// Copied word for word from the design file "Starting Point Profile - All
// Screens" (window.SPP). Never rewrite or paraphrase this copy here; change
// it in the design first, with Laura's approval.
//
// Design keys P/O/D/V/R are kept so the data matches the design exactly.
// The platform stores the keys in PLATFORM_KEY (MemberProfile.computed_archetype_key).

export const PATTERNS = {
  P:{key:'P',name:'The Performer',short:'Performer',desc:'keeps it looking right',
    moment:'In a lift mirror, fixing her lipstick seconds before a boardroom, composed face, tight grip on her phone',
    alt:'A woman checks her lipstick in a lift mirror before a meeting',
    mirror:'You have become very good at looking like you have it handled, and very tired of being the only one who knows you don\'t.',
    best:'You read a room in seconds. You hold standards others rely on, and you deliver under pressure without letting it show.',
    worst:'The gap between how it looks and how it feels keeps widening. Praise doesn\'t land, rest feels like a risk, and nobody gets to see the real picture, sometimes not even you.',
    means:'Your nervous system learned that being seen struggling was unsafe. So you built a polished version that does the visible work while the real you runs underneath it, unsupported.',
    week:'Once this week, when someone asks how you are, give the true answer instead of the right one. One sentence is enough.',
    pillars:['Identity, Visibility & Personal Brand','Mindset & Behaviour']},
  O:{key:'O',name:'The Over-Functioner',short:'Over-Functioner',desc:'carries everyone',
    moment:'Kitchen counter at 7am: laptop open, phone at her ear, packing someone else\'s lunchbox',
    alt:'A woman on a call at her laptop while packing a child\'s lunch',
    mirror:'You hold everything together so well that nobody has noticed you\'re the one who needs holding.',
    best:'You see what needs doing before anyone asks. People feel safe around you, and things work because you are in them.',
    worst:'Your needs keep moving to the bottom of the list. You resent the load and keep picking it up anyway, and when you finally stop, there is nothing left for you.',
    means:'Somewhere along the way, being useful became the condition for being loved. Your system treats other people\'s discomfort as an emergency you have to fix.',
    week:'Pick one thing you would normally take on for someone else this week, and leave it with them. Notice what happens in your body when you don\'t step in.',
    pillars:['Nervous System & Emotional Regulation','Leadership, Authority & Career']},
  D:{key:'D',name:'The Delegator',short:'Delegator',desc:'hands the decision to someone else',
    moment:'At a desk, sliding a folder across to someone off-frame, her eyes turned away from the page',
    alt:'A woman hands a document across a desk without looking at it',
    mirror:'You\'ve earned the seat at the table. You\'re still waiting for someone to tell you it\'s yours.',
    best:'You are collaborative, generous with credit and easy to work with. You make space for others and keep the peace.',
    worst:'Decisions about your money, health and career end up in other people\'s hands. You undersell yourself, then wonder why the outcome doesn\'t fit you.',
    means:'You learned that taking up space caused friction, so you hand the wheel over before anyone can say you took too much. It looks like modesty. It costs you authorship of your own life.',
    week:'Make one decision this week that you would normally wait for someone else to make. Small is fine. Make it, and don\'t ask anyone to confirm it.',
    pillars:['Leadership, Authority & Career','Mindset & Behaviour']},
  V:{key:'V',name:'The Overrider',short:'Overrider',desc:'pushes past her body\'s signals',
    moment:'Walking fast through an office lobby in heels, cold coffee in one hand, the other pressed to the back of her neck',
    alt:'A woman walks quickly, coffee in hand, rubbing her neck',
    mirror:'You\'ve pushed through so much for so long that your body has stopped asking, and started telling.',
    best:'You are relentless, reliable and hard to rattle. When things get difficult, you are the one who keeps going.',
    worst:'Sleep, energy, pain and mood send signals you\'ve learned to ignore. You rest only when your body forces you to, and the bill keeps arriving later and larger.',
    means:'Your capacity became your identity. Every time you push past a signal and it works, your system learns that signals don\'t matter, until they matter all at once.',
    week:'Set one fixed stop in your day this week: ten minutes, phone down, sitting. Not as a reward. As data. Notice what your body says when it\'s finally allowed to.',
    pillars:['Health, Hormones & Body Literacy','Nervous System & Emotional Regulation']},
  R:{key:'R',name:'The Reactor',short:'Reactor',desc:'feels it first, chooses later',
    moment:'In a parked car after a call, phone in her lap, thumb hovering over send',
    alt:'A woman sits in her parked car, thumb above her phone screen',
    mirror:'You feel everything at full volume, and most days the feeling chooses before you do.',
    best:'You are honest, alive to what is happening and quick to sense when something is wrong. People always know where they stand with you.',
    worst:'Your response arrives before your choice does. You say things you walk back, freeze when it matters, and spend days replaying moments that lasted seconds.',
    means:'Your nervous system is set to react fast, usually because it once had to. This isn\'t a character flaw. It\'s a missing gap between feeling and response, and that gap can be built.',
    week:'Once this week, when you feel the surge, name it out loud or on paper before you act: "I\'m angry", "I\'m scared". Naming it is the first gap.',
    pillars:['Mindset & Behaviour','Relationships & Connection']}
};
export const ORDER = ['P','O','D','V','R'];
export const Q = [
 {dim:'Recognition',setup:'Someone recently told you, out loud and specifically, that you did something well.',q:'What happened inside you?',a:[
  ['You smiled and said the right thing. Inside, you wondered if they\'d seen the real picture or the version you put forward.','P'],
  ['It felt good for a second. Then your mind went to everything still waiting for you.','O'],
  ['You passed it on. The team, the timing, luck. Owning it felt like taking up too much room.','D'],
  ['You barely registered it. You were already on to the next thing.','V'],
  ['It caught you off guard. You brushed it off too fast, or replayed it for days.','R']]},
 {dim:'Pressure',setup:'You\'re making your case in a meeting, a pitch or a conversation that matters. Someone challenges you in front of others.',q:'What happens first, inside you?',a:[
  ['You\'re instantly aware of how this looks, and you adjust to win the room back.','P'],
  ['You rush to ease the tension. You soften your point or over-explain so everyone\'s comfortable again.','O'],
  ['You give ground. Holding your position doesn\'t feel worth the conflict.','D'],
  ['You keep going as if nothing happened. You\'ll deal with how it felt later, if ever.','V'],
  ['Your body gets there first. Heat in your face, a freeze, or the urge to hit back.','R']]},
 {dim:'Opportunity',setup:'Something lands that would stretch you. Visible, ambitious, and you\'re about 70% ready.',q:'What do you actually do?',a:[
  ['Say yes, then work twice as hard in private so nobody sees the 30% you\'re missing.','P'],
  ['Say yes, and within a day you\'re managing everyone else\'s part of it too.','O'],
  ['Wonder who\'d be better placed. By the time you decide, it\'s gone to them.','D'],
  ['Say yes without checking what you\'ve got left. You\'ll find the energy. You always do.','V'],
  ['It depends on the day. You jump in on the high, or overthink it until it passes.','R']]},
 {dim:'Exhaustion',setup:'Three weeks in a row, every day has asked more of you than you had.',q:'What does week four look like?',a:[
  ['From the outside, nothing\'s changed. Inside, you\'re running on fumes.','P'],
  ['You carry everyone through it and hold the mood in the room. Nobody sees what it costs.','O'],
  ['You pull back and hand more and more to others until you\'re barely in it.','D'],
  ['Same as weeks one to three. You\'ll rest when it\'s over. It\'s never over.','V'],
  ['Your fuse gets shorter. Small things land hard, and you say things you later walk back.','R']]},
 {dim:'Body signals',setup:'Your sleep\'s been off for weeks. Your energy crashes every afternoon. It isn\'t settling on its own.',q:'What\'s your honest first response?',a:[
  ['You keep looking fine. Concealer, coffee, whatever it takes. Nobody sees the tired version.','P'],
  ['You notice, but everyone else comes first. Your own appointment is the one that keeps moving.','O'],
  ['You hand it over. A doctor, a partner, a plan someone else made. You\'d rather not be the one deciding.','D'],
  ['You note it and carry on. You\'ve pushed through worse.','V'],
  ['You swing between worrying it\'s serious and deciding it\'s nothing. Either way, it takes over your week.','R']]},
 {dim:'The pause',setup:'It\'s 3pm on a full day. You haven\'t stopped since the morning. No break, no proper meal, no air.',q:'What happens next?',a:[
  ['If someone\'s around, you take a break that looks balanced. Alone, you don\'t bother.','P'],
  ['You meant to stop, then someone needed something. Then someone else did.','O'],
  ['You wait for someone else to suggest a break, or for the day to decide for you.','D'],
  ['You know you need it and decide it can wait. Your body\'s mostly stopped asking.','V'],
  ['You keep going until something small tips you over, then you stop all at once.','R']]},
 {dim:'Disappointment',setup:'Someone close to you lets you down in a way that really matters.',q:'What do you do with it?',a:[
  ['Your face gives nothing away. You deal with it in private and nobody would guess.','P'],
  ['You park your own hurt and start fixing. You keep the relationship steady for both of you.','O'],
  ['You decide it\'s not worth raising. You expect less from them and leave it there.','D'],
  ['You feel it for a moment, then get back to what needs doing.','V'],
  ['It shows straight away. You say more than you meant, or go silent in a way everyone can read.','R']]},
 {dim:'Support',setup:'You need real support. The kind where someone sees you don\'t have it all together.',q:'What do you actually do?',a:[
  ['You frame it as a strategy conversation. You get the help without anyone seeing you needed it.','P'],
  ['You keep supporting everyone else and hope someone notices you need it too.','O'],
  ['You hand the problem to someone and call it being practical, so it never looks like asking.','D'],
  ['You don\'t ask. You manage alone until you can\'t.','V'],
  ['When you do ask, it comes out sharper or more emotional than you meant. So often, you don\'t.','R']]},
 {dim:'Conflict',setup:'There\'s a conversation you\'ve been avoiding. Something needs saying and you know it.',q:'What\'s kept you from saying it?',a:[
  ['You\'re worried how you\'ll come across. You\'re waiting for a version that costs you nothing.','P'],
  ['You\'re protecting them. You\'ve decided they can\'t handle it right now.','O'],
  ['You\'re hoping someone else raises it, or that it sorts itself out.','D'],
  ['You haven\'t had the capacity. You\'ll get to it when things settle. Things haven\'t settled.','V'],
  ['You don\'t trust yourself in the moment. You\'re scared it will come out wrong.','R']]},
 {dim:'Money',setup:'Think about your real relationship with your own money. Not the version you tell people.',q:'Which is closest?',a:[
  ['You spend in ways that match the life you present. What it signals matters more than the number.','P'],
  ['A lot of it goes to looking after other people. You\'re everyone\'s safety net.','O'],
  ['Someone else makes the real decisions. A partner, an adviser, or avoidance.','D'],
  ['You keep working harder to earn more instead of stopping to look at where it goes.','V'],
  ['It\'s emotional. It brings anxiety, comfort or both, and the feeling rarely matches the numbers.','R']]},
 {dim:'Worth',setup:'The last time what you bring was being weighed up. A review, a salary talk, setting your prices, a pitch.',q:'What was going on inside you?',a:[
  ['You presented the strongest version of yourself and hoped they wouldn\'t see through it.','P'],
  ['You talked about what the team achieved and left feeling you\'d undersold your own part.','O'],
  ['You accepted what was offered. Pushing back felt like more tension than it was worth.','D'],
  ['You went in running on empty and didn\'t have the fight left to ask for more.','V'],
  ['Nerves took over. You pushed too hard and felt the room shift, or froze and said less than you meant.','R']]},
 {dim:'The pattern',setup:'Read these slowly. Pick the one you\'ve lived longest.',q:'Which are you most tired of?',a:[
  ['I\'m tired of a life that looks right and feels like it belongs to someone else.','P'],
  ['I\'m tired of holding everything together for everyone and having nothing left for me.','O'],
  ['I\'m tired of waiting for permission to take up space I\'ve already earned.','D'],
  ['I\'m tired of my body paying for everything I refuse to put down.','V'],
  ['I\'m tired of reacting before I get the chance to choose.','R']]}
];
export const DOORS = [
  {k:'bp',route:'On my own, at my own pace',name:'The Aligned Woman Blueprint',line:'Thirteen specialists, in the order that works. Start where your pattern starts.',price:'R3,997',btn:'Start the Blueprint'},
  {k:'laura',route:'With someone in my corner, one-on-one',name:'Work with Laura, one-on-one',line:'For when you need someone to hold the mirror steady while you change what you see.',price:'By application',priceDraft:true,btn:'Apply to work with Laura'}
];

export const PLATFORM_KEY = { P: "performer", O: "over_functioner", D: "delegator", V: "overrider", R: "reactor" };
export const DESIGN_KEY = { performer: "P", over_functioner: "O", delegator: "D", overrider: "V", reactor: "R" };

// Pattern photographs (uploaded to the app's media library). A pattern with
// two images picks one at random per attempt and keeps it for her.
export const PATTERN_IMAGES = {
  P: ["https://media.base44.com/images/public/69f46886a412ee042303f1af/01b508ac2_ThePerformer.png"],
  O: ["https://media.base44.com/images/public/69f46886a412ee042303f1af/21f747bf4_TheOver-Functioner.png"],
  D: ["https://media.base44.com/images/public/69f46886a412ee042303f1af/f2f2a46cf_TheDelegator.png"],
  V: ["https://media.base44.com/images/public/69f46886a412ee042303f1af/91df3a10c_TheOverrider.png"],
  R: ["https://media.base44.com/images/public/69f46886a412ee042303f1af/078368613_Thereactor.png"],
};
// Intro editorial image: a woman drawing a mandala in the sand, used as the
// hero backdrop behind the intro copy.
export const INTRO_IMAGE = "https://media.base44.com/images/public/69f46886a412ee042303f1af/4153d4e3f_thepattern.jpg";
export const LOGO_URL = "https://media.base44.com/images/public/69f46886a412ee042303f1af/1c0c68566_awblogo.png";

export const MINUTES = "6";
export const CONSENT_TEXT = "Send me my results and occasional emails from The Aligned Woman Co. I can unsubscribe any time.";
export const REPLY_DATE = "6 November 2026";
export const QUIZ_VERSION = "v3";

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Ported exactly from SPP.score(). Ties: question 12, then question 4, then ORDER.
export function score(answers) {
  const c = { P: 0, O: 0, D: 0, V: 0, R: 0 };
  answers.forEach((p) => { if (p) c[p]++; });
  const rank = ORDER.slice().sort((x, y) => {
    if (c[y] !== c[x]) return c[y] - c[x];
    for (const qi of [11, 3]) {
      const t = answers[qi];
      if (t === x) return -1;
      if (t === y) return 1;
    }
    return 0;
  });
  const total = answers.filter(Boolean).length || 1;
  const mix = rank.map((k, i) => {
    const raw = (c[k] / total) * 100;
    return { k, pct: Math.floor(raw), rem: raw - Math.floor(raw), i };
  });
  let left = 100 - mix.reduce((a, m) => a + m.pct, 0);
  mix.slice().sort((a, b) => b.rem - a.rem || a.i - b.i).forEach((m) => {
    if (left > 0 && m.rem > 0) { m.pct++; left--; }
  });
  mix.forEach((m) => { delete m.rem; delete m.i; });
  return { primary: rank[0], secondary: rank[1], mix };
}