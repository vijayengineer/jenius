export interface VerifiedConceptSummary {
  id: string;
  title: string;
  hook: string;
  explanation: string;
  takeaway: string;
}

/**
 * Server-safe projection of the locally verified catalogue. It deliberately
 * contains only prompt-relevant copy and no presenter or browser imports.
 * A cross-catalogue test prevents this projection from drifting from the app.
 */
export const VERIFIED_CONCEPT_CATALOGUE: VerifiedConceptSummary[] = [
  {
    id: "seasons",
    title: "Why do seasons exist?",
    hook: "Why do seasons exist?",
    explanation:
      "Seasons are caused mainly by Earth's tilted axis. As Earth travels around the Sun, each hemisphere takes turns receiving more direct sunlight and longer days. When your half tilts toward the Sun, you get summer. When it tilts away, you get winter.",
    takeaway: "Tilt changes sunlight.",
  },
  {
    id: "volcanoes",
    title: "Why do volcanoes erupt?",
    hook: "Why do volcanoes erupt?",
    explanation:
      "Deep underground, heat and pressure melt rock into magma. Magma is lighter than the solid rock around it, so it slowly rises. When it reaches a weak spot in Earth's crust, trapped gases suddenly expand — and the mountain releases lava, ash and steam.",
    takeaway: "Pressure forces magma up.",
  },
  {
    id: "deserts",
    title: "Why do deserts form?",
    hook: "Why do deserts form?",
    explanation:
      "Deserts form where very little rain reaches the ground. Some sit under bands of dry, sinking air near the tropics. Others hide behind tall mountains that block moist wind. Cold ocean currents can also starve a coast of rain, creating deserts right next to the sea.",
    takeaway: "No rain, no forest.",
  },
  {
    id: "planes",
    title: "How do planes fly?",
    hook: "Why do planes fly?",
    explanation:
      "A plane's wing is curved on top and flatter underneath. As it slices through the air, it pushes air down and gets pushed up in return. That upward push is called lift. Combined with the forward thrust of the engines, lift is strong enough to hold tonnes of metal in the sky.",
    takeaway: "Wings push air down.",
  },
  {
    id: "falling",
    title: "Why do heavy and light objects fall together?",
    hook: "Do heavier objects fall faster?",
    explanation:
      "In a vacuum, a feather and a hammer hit the ground at the same time. Gravity pulls every object with the same acceleration, no matter its mass. On Earth, feathers only look slower because air pushes back on them. Remove the air and the race is a perfect tie.",
    takeaway: "Gravity treats mass equally.",
  },
  {
    id: "sky-blue",
    title: "Why is the sky blue?",
    hook: "Why is the sky blue?",
    explanation:
      "Sunlight looks white but is really a mix of colours. When it hits our atmosphere, tiny air molecules scatter the shorter blue wavelengths in every direction more than the others. Your eyes catch that scattered blue light from all over the sky, so the whole dome above you looks blue.",
    takeaway: "Air scatters blue light.",
  },
  {
    id: "dna",
    title: "What is DNA?",
    hook: "What is DNA?",
    explanation:
      "DNA is a long, twisted ladder of chemicals stored inside almost every cell. Its rungs spell out instructions in a four-letter code. Those instructions tell your cells how to build proteins — which decide your eye colour, help you digest food, and quietly run nearly everything your body does.",
    takeaway: "DNA is your body's code.",
  },
  {
    id: "leaves",
    title: "Why do leaves change colour?",
    hook: "Why do leaves change colour?",
    explanation:
      "Leaves are green because of chlorophyll, the chemical that captures sunlight for food. In autumn, shorter days tell trees to stop making it. As the green fades, yellows and oranges that were hidden all along finally show through — and some leaves make new red pigments before they fall.",
    takeaway: "Green fades, hidden colours show.",
  },
  {
    id: "vaccines",
    title: "How do vaccines train the immune system?",
    hook: "How do vaccines train the immune system?",
    explanation:
      "A vaccine shows your immune system a harmless preview of a germ — a weakened piece, or just its shape. Your body practises building defenders called antibodies against it. If the real germ ever arrives, your immune system already has the playbook and can fight back before you feel sick.",
    takeaway: "Practice before the real fight.",
  },
  {
    id: "yawning",
    title: "Why do we yawn?",
    hook: "Why do humans yawn?",
    explanation:
      "Nobody is completely sure. One leading idea is that yawning cools the brain: a deep breath and a big stretch of the jaw pull cooler blood through your head. Yawns are also contagious, which hints they may help groups stay alert together. Sleepy brains and bored brains yawn the most.",
    takeaway: "Likely a brain-cooling reset.",
  },
];

const conceptById = new Map(VERIFIED_CONCEPT_CATALOGUE.map((concept) => [concept.id, concept]));

export function getVerifiedConceptSummary(id: string): VerifiedConceptSummary | undefined {
  return conceptById.get(id);
}
