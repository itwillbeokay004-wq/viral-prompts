export type Platform = "tiktok" | "youtube";

export type Niche =
  | "comedy"
  | "cooking"
  | "fitness"
  | "tech"
  | "beauty"
  | "finance"
  | "gaming"
  | "education"
  | "travel"
  | "fashion"
  | "lifestyle"
  | "music";

export const NICHES: { value: Niche; label: string; emoji: string }[] = [
  { value: "comedy", label: "Comedy", emoji: "😂" },
  { value: "cooking", label: "Cooking", emoji: "🍳" },
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "tech", label: "Tech", emoji: "💻" },
  { value: "beauty", label: "Beauty", emoji: "💄" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "lifestyle", label: "Lifestyle", emoji: "🌿" },
  { value: "music", label: "Music", emoji: "🎵" },
];

export const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
  { value: "youtube", label: "YouTube Shorts", emoji: "▶️" },
];

type PromptTemplate = (niche: string) => string;

const UNIVERSAL_HOOKS: PromptTemplate[] = [
  (n) => `POV: You just discovered the one ${n} thing nobody is talking about`,
  (n) => `I tried ${n} every day for 30 days — here's what actually changed`,
  (n) => `Stop doing this in ${n}. Do this instead (and thank me later)`,
  (n) => `Rating the most viral ${n} trends from 1 to 10 — brutally honest`,
  (n) => `Things I wish I knew before getting into ${n}`,
  (n) => `The $0 ${n} hack that pros don't want you to know`,
  (n) => `I'm a ${n} expert and these 3 mistakes make me cringe every time`,
  (n) => `Day in the life of a ${n} obsessive (part 1)`,
  (n) => `Telling strangers their ${n} opinions are illegal — reactions were wild`,
  (n) => `Trying the most unhinged ${n} trend so you don't have to`,
];

const NICHE_SPECIFIC: Record<Niche, string[]> = {
  comedy: [
    "Asking AI to roast my morning routine — it had NO mercy",
    "Telling my mom Gen Z slang and filming her confused reactions",
    "When your group chat finally goes silent (a short film)",
    "Recreating my most embarrassing moment with puppets",
    "POV: you're the side character in your friend's Main Character Era",
  ],
  cooking: [
    "The 3-ingredient pasta that broke Italian TikTok",
    "I made viral recipes from the 1950s — one was illegal",
    "Ranking every fast food chain's secret menu item",
    "One pan, $5, 10 minutes — dinner for the whole week",
    "The cheese pull that ended my marriage (ASMR)",
  ],
  fitness: [
    "The 5-minute ab routine Olympians secretly use",
    "I tried a Navy SEAL's morning routine for 7 days",
    "Stop doing crunches. Do THIS instead (backed by science)",
    "Silent gym walk: rating every machine nobody uses",
    "The grocery list that got me shredded in 60 days",
  ],
  tech: [
    "The hidden iPhone setting Apple doesn't want you to find",
    "I built an app in 24 hours with AI — here's what happened",
    "Ranking the worst smart home gadgets I own",
    "The $20 gadget that replaced my $2,000 setup",
    "AI just did my job in 3 seconds — should I be scared?",
  ],
  beauty: [
    "The drugstore dupe that's better than the $80 original",
    "Getting ready using only products under $10",
    "The makeup mistake aging you 10 years (no one tells you)",
    "Trying viral Korean skincare for 14 days — unfiltered results",
    "Rating celebrity makeup lines brutally honestly",
  ],
  finance: [
    "How I saved $10k in 6 months on a $50k salary",
    "The credit card hack banks HATE (but it's totally legal)",
    "Reading billionaires' 'simple' money habits so you don't have to",
    "I tracked every dollar for 30 days — the results shocked me",
    "The side hustle that pays $100/day from your phone",
  ],
  gaming: [
    "The speedrun trick that beat a world record in 2 seconds",
    "Rating every 'unbeatable' boss by how easy they actually are",
    "I played the worst-rated game on Steam — it was genius",
    "POV: you're the NPC and the hero just walked in",
    "The hidden mechanic 99% of players never discover",
  ],
  education: [
    "5 study tricks Harvard students actually use",
    "The history lesson your teacher was TOO SCARED to teach",
    "Learning a new language in 7 days using only TikTok",
    "Why everything you were taught about [topic] is wrong",
    "The SAT question that stumped a professor",
  ],
  travel: [
    "The $30/night hidden city that feels like Paris",
    "I flew across the world for $27 — here's how",
    "The tourist trap nobody warns you about",
    "Packing for 2 weeks in one carry-on (the real method)",
    "Living in an airport for 24 hours: day 1",
  ],
  fashion: [
    "The thrift find worth $2,000 I bought for $4",
    "Styling one blazer 7 ways for every occasion",
    "The trend everyone wears wrong (and how to fix it)",
    "Dressing like a millionaire on a $50 budget",
    "Ranking Y2K fashion comebacks from chic to chaotic",
  ],
  lifestyle: [
    "The 5am routine that actually changed my life",
    "I unfollowed everyone for 30 days — here's what happened",
    "The $3 habit that doubled my productivity",
    "Decluttering my entire apartment in one afternoon",
    "Living with no phone for a week: hour by hour",
  ],
  music: [
    "The sample in [hit song] that'll ruin the song forever",
    "Making a pop hit using only sounds from my kitchen",
    "Rating every decade's one-hit wonders from worst to best",
    "The chord progression 90% of songs secretly use",
    "Guessing songs from 1 second clips with strangers",
  ],
};

const PLATFORM_FLAVOR: Record<Platform, (base: string) => string> = {
  tiktok: (base) => base,
  youtube: (base) => base.replace(/TikTok/gi, "YouTube").replace(/$/, ""),
};

function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr];
  let s = Math.floor(seed * 1_000_000) + 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getStaticPrompts(
  niche: Niche,
  platform: Platform,
  count = 8
): string[] {
  const nicheLabel = NICHES.find((n) => n.value === niche)?.label.toLowerCase() ?? niche;
  const universal = UNIVERSAL_HOOKS.map((t) => t(nicheLabel));
  const specific = NICHE_SPECIFIC[niche] ?? [];
  const pool = [...specific, ...universal];
  const flavor = PLATFORM_FLAVOR[platform];
  return shuffle(pool).slice(0, count).map(flavor);
}
