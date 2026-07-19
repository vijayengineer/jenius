import type { SubjectId } from "./types";

export interface Concept {
  id: string;
  /** Design-system subject token (used for chip colour). */
  subject: SubjectId;
  /** Human-facing category label (e.g. "Earth Science", "Physics"). */
  category: string;
  /** Hook question — no more than two lines. */
  hook: string;
  /** ~40–70 word explanation. */
  explanation: string;
  /** One-line takeaway. */
  takeaway: string;
  /** Reading time in seconds. */
  readingSeconds: number;
  /** True when a Jenius animation slot should render above the copy. */
  animationReady?: boolean;
  /** Default saved state for preview purposes. */
  saved?: boolean;
}

export const MOCK_CONCEPTS: Concept[] = [
  {
    id: "seasons",
    subject: "science",
    category: "Earth Science",
    hook: "Why do seasons exist?",
    explanation:
      "Seasons are caused mainly by Earth's tilted axis. As Earth travels around the Sun, each hemisphere takes turns receiving more direct sunlight and longer days. When your half tilts toward the Sun, you get summer. When it tilts away, you get winter.",
    takeaway: "Tilt changes sunlight.",
    readingSeconds: 25,
    animationReady: true,
  },
  {
    id: "volcanoes",
    subject: "science",
    category: "Earth Science",
    hook: "Why do volcanoes erupt?",
    explanation:
      "Deep underground, heat and pressure melt rock into magma. Magma is lighter than the solid rock around it, so it slowly rises. When it reaches a weak spot in Earth's crust, trapped gases suddenly expand — and the mountain releases lava, ash and steam.",
    takeaway: "Pressure forces magma up.",
    readingSeconds: 25,
    animationReady: true,
  },
  {
    id: "deserts",
    subject: "science",
    category: "Earth Science",
    hook: "Why do deserts form?",
    explanation:
      "Deserts form where very little rain reaches the ground. Some sit under bands of dry, sinking air near the tropics. Others hide behind tall mountains that block moist wind. Cold ocean currents can also starve a coast of rain, creating deserts right next to the sea.",
    takeaway: "No rain, no forest.",
    readingSeconds: 28,
  },
  {
    id: "planes",
    subject: "science",
    category: "Physics",
    hook: "Why do planes fly?",
    explanation:
      "A plane's wing is curved on top and flatter underneath. As it slices through the air, it pushes air down and gets pushed up in return. That upward push is called lift. Combined with the forward thrust of the engines, lift is strong enough to hold tonnes of metal in the sky.",
    takeaway: "Wings push air down.",
    readingSeconds: 28,
    animationReady: true,
  },
  {
    id: "falling",
    subject: "science",
    category: "Physics",
    hook: "Do heavier objects fall faster?",
    explanation:
      "In a vacuum, a feather and a hammer hit the ground at the same time. Gravity pulls every object with the same acceleration, no matter its mass. On Earth, feathers only look slower because air pushes back on them. Remove the air and the race is a perfect tie.",
    takeaway: "Gravity treats mass equally.",
    readingSeconds: 26,
    animationReady: true,
  },
  {
    id: "sky-blue",
    subject: "science",
    category: "Physics",
    hook: "Why is the sky blue?",
    explanation:
      "Sunlight looks white but is really a mix of colours. When it hits our atmosphere, tiny air molecules scatter the shorter blue wavelengths in every direction more than the others. Your eyes catch that scattered blue light from all over the sky, so the whole dome above you looks blue.",
    takeaway: "Air scatters blue light.",
    readingSeconds: 28,
  },
  {
    id: "dna",
    subject: "life",
    category: "Biology",
    hook: "What is DNA?",
    explanation:
      "DNA is a long, twisted ladder of chemicals stored inside almost every cell. Its rungs spell out instructions in a four-letter code. Those instructions tell your cells how to build proteins — which decide your eye colour, help you digest food, and quietly run nearly everything your body does.",
    takeaway: "DNA is your body's code.",
    readingSeconds: 28,
    animationReady: true,
  },
  {
    id: "leaves",
    subject: "life",
    category: "Biology",
    hook: "Why do leaves change colour?",
    explanation:
      "Leaves are green because of chlorophyll, the chemical that captures sunlight for food. In autumn, shorter days tell trees to stop making it. As the green fades, yellows and oranges that were hidden all along finally show through — and some leaves make new red pigments before they fall.",
    takeaway: "Green fades, hidden colours show.",
    readingSeconds: 30,
  },
  {
    id: "vaccines",
    subject: "life",
    category: "Biology",
    hook: "How do vaccines train the immune system?",
    explanation:
      "A vaccine shows your immune system a harmless preview of a germ — a weakened piece, or just its shape. Your body practises building defenders called antibodies against it. If the real germ ever arrives, your immune system already has the playbook and can fight back before you feel sick.",
    takeaway: "Practice before the real fight.",
    readingSeconds: 30,
  },
  {
    id: "yawning",
    subject: "life",
    category: "Biology",
    hook: "Why do humans yawn?",
    explanation:
      "Nobody is completely sure. One leading idea is that yawning cools the brain: a deep breath and a big stretch of the jaw pull cooler blood through your head. Yawns are also contagious, which hints they may help groups stay alert together. Sleepy brains and bored brains yawn the most.",
    takeaway: "Likely a brain-cooling reset.",
    readingSeconds: 30,
  },
];
