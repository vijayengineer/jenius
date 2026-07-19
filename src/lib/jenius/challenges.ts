/**
 * Jenius — challenge, feedback, retry and mind-blown data.
 *
 * IMPORTANT — separation of concerns:
 *   Visual components MUST NOT decide correctness or look up misconceptions
 *   by option id. They receive already-resolved payloads (option states,
 *   `OptionFeedback`, `CorrectFeedback`, `RetryChallenge`, `MindBlownFact`)
 *   through props. This file (and, later, the backend) is the single source
 *   of truth. The helpers below are demo-only resolvers.
 */

export type SubmissionState =
  | "idle"
  | "submitting"
  | "submitted"
  | "error";

export type ResolvedOptionState =
  | "unanswered" // pre-submit
  | "correct"    // post-submit, this is the correct answer
  | "incorrect"  // post-submit, learner picked this and it was wrong
  | "locked";    // post-submit, another option (not chosen, not correct)

export interface ChallengeOption {
  id: string;
  label: string;
}

export interface Challenge {
  /** Concept id this challenge belongs to. */
  conceptId: string;
  prompt: string;
  options: ChallengeOption[];
  /** Kept out of props: presenter only ever sees `resolvedOptionStates`. */
  correctOptionId: string;
}

/** Positive-path feedback for the correct answer. */
export interface CorrectFeedbackData {
  /** Brief positive acknowledgement, no confetti energy. */
  acknowledgement: string;
  /** Why the answer works. */
  explanation: string;
  /** A short memorable phrase to lock the idea in. */
  memoryHook: string;
}

/** Per-wrong-option, meaningfully different feedback. */
export interface OptionFeedback {
  optionId: string;
  /** Named misconception, e.g. "Distance causes the seasons". */
  misconceptionLabel: string;
  /** Stage 1: gentle acknowledgement. Never patronising. */
  acknowledgement: string;
  /** Why this reasoning is understandable / where it comes from. */
  whyUnderstandable: string;
  /** Why it doesn't actually hold up. */
  whyIncorrect: string;
  /** The correct concept, stated plainly. */
  correctiveStatement: string;
  /** Short memory hook tailored to this misunderstanding. */
  memoryHook: string;
  /** Optional pointer to a retry challenge id (defaults to concept's retry). */
  retryQuestionId?: string;
}

export interface RetryChallenge {
  id: string;
  prompt: string;
  /** Kept short: a different example, same underlying concept. */
  supportiveIntro: string;
  options: ChallengeOption[];
  correctOptionId: string;
  /** Shown after the retry no matter the answer. */
  wrapUp: string;
}

export interface MindBlownFact {
  headline: string;
  detail?: string;
}

export interface ChallengeFeedback {
  correct: CorrectFeedbackData;
  /** Keyed by wrong option id. */
  incorrect: Record<string, OptionFeedback>;
  retry: RetryChallenge;
  mindBlown: MindBlownFact;
}

export const CHALLENGES: Record<string, Challenge> = {
  seasons: {
    conceptId: "seasons",
    prompt: "What mainly causes summer in the Northern Hemisphere?",
    options: [
      { id: "a", label: "Earth is much closer to the Sun" },
      { id: "b", label: "The Northern Hemisphere tilts towards the Sun" },
      { id: "c", label: "The Sun becomes hotter" },
      { id: "d", label: "Earth rotates more slowly" },
    ],
    correctOptionId: "b",
  },
  volcanoes: {
    conceptId: "volcanoes",
    prompt: "What most directly drives magma up through a volcano?",
    options: [
      { id: "a", label: "The Moon's gravity pulling on rock" },
      { id: "b", label: "Rain seeping down and heating up" },
      { id: "c", label: "Pressure from hot gases and lighter magma rising" },
      { id: "d", label: "Earth spinning faster near the equator" },
    ],
    correctOptionId: "c",
  },
  deserts: {
    conceptId: "deserts",
    prompt: "Which condition is most essential for a desert to form?",
    options: [
      { id: "a", label: "Very high daytime temperatures" },
      { id: "b", label: "Very little rainfall reaching the ground" },
      { id: "c", label: "Sandy soil that cannot hold water" },
      { id: "d", label: "Being far from any ocean" },
    ],
    correctOptionId: "b",
  },
  planes: {
    conceptId: "planes",
    prompt: "What generates the lift that holds a plane up?",
    options: [
      { id: "a", label: "The engines blowing air downward" },
      { id: "b", label: "Hot air trapped inside the fuselage" },
      { id: "c", label: "Wings pushing air down as they cut through it" },
      { id: "d", label: "Earth's magnetic field pushing on the metal" },
    ],
    correctOptionId: "c",
  },
  falling: {
    conceptId: "falling",
    prompt:
      "In a vacuum, what happens when a heavy ball and a light ball are dropped together?",
    options: [
      { id: "a", label: "The heavy ball falls much faster" },
      { id: "b", label: "The light ball falls much faster" },
      { id: "c", label: "They accelerate at the same rate" },
      { id: "d", label: "Neither falls without air" },
    ],
    correctOptionId: "c",
  },
  "sky-blue": {
    conceptId: "sky-blue",
    prompt: "Why does the daytime sky look blue to us?",
    options: [
      { id: "a", label: "The ocean reflects its colour upward" },
      { id: "b", label: "Air molecules scatter blue light more than others" },
      { id: "c", label: "The Sun mainly emits blue light" },
      { id: "d", label: "Our eyes can only see blue in bright light" },
    ],
    correctOptionId: "b",
  },
  dna: {
    conceptId: "dna",
    prompt: "What is DNA's main job inside a cell?",
    options: [
      { id: "a", label: "To give the cell its shape and colour" },
      { id: "b", label: "To store instructions for building proteins" },
      { id: "c", label: "To supply the cell with energy" },
      { id: "d", label: "To fight off invading germs directly" },
    ],
    correctOptionId: "b",
  },
  leaves: {
    conceptId: "leaves",
    prompt: "Why do many leaves turn yellow or orange in autumn?",
    options: [
      { id: "a", label: "Cold air paints new pigments into the leaves" },
      { id: "b", label: "Trees pull green sap out and refill with orange" },
      { id: "c", label: "Chlorophyll fades, revealing colours that were already there" },
      { id: "d", label: "The Sun bleaches the green out of them" },
    ],
    correctOptionId: "c",
  },
  vaccines: {
    conceptId: "vaccines",
    prompt: "How do vaccines protect you from a real infection?",
    options: [
      { id: "a", label: "They kill any germ that touches your skin" },
      { id: "b", label: "They give your immune system a safe practice run" },
      { id: "c", label: "They replace your blood with cleaner blood" },
      { id: "d", label: "They warm your body up to burn germs off" },
    ],
    correctOptionId: "b",
  },
  yawning: {
    conceptId: "yawning",
    prompt: "What is a leading scientific idea for why we yawn?",
    options: [
      { id: "a", label: "It refills our lungs with fresh oxygen we badly need" },
      { id: "b", label: "It stretches the throat to help us speak" },
      { id: "c", label: "It helps cool the brain down" },
      { id: "d", label: "It resets our sense of balance" },
    ],
    correctOptionId: "c",
  },
};

/**
 * Feedback catalogue — one entry per concept id. Every wrong option gets
 * meaningfully different copy: its own named misconception, its own reason,
 * its own memory hook. Retry uses a different example that tests the same
 * underlying idea.
 */
export const CHALLENGE_FEEDBACK: Record<string, ChallengeFeedback> = {
  seasons: {
    correct: {
      acknowledgement:
        "Exactly. Earth's tilt changes the angle and duration of sunlight each hemisphere receives.",
      explanation:
        "Because the axis leans about 23.5°, whichever hemisphere is leaning sunward gets steeper, longer-lasting light — and that concentrated energy is what we feel as summer.",
      memoryHook: "Tilt changes sunlight; rotation changes day and night.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Distance causes the seasons",
        acknowledgement: "That's a really common way to picture it.",
        whyUnderstandable:
          "Closer to a fire usually means warmer, so closer to the Sun sounds like it should mean summer.",
        whyIncorrect:
          "Earth's orbit is almost circular. Northern summer actually happens when Earth is slightly farther from the Sun, not closer.",
        correctiveStatement:
          "It's the tilt of Earth's axis — not distance — that decides which hemisphere gets more direct sunlight.",
        memoryHook: "Angle beats distance.",
      },
      c: {
        optionId: "c",
        misconceptionLabel: "The Sun heats up in summer",
        acknowledgement: "Interesting choice.",
        whyUnderstandable:
          "If summer feels hotter, it feels natural to think the Sun itself must be putting out more heat.",
        whyIncorrect:
          "The Sun's output barely changes across a year. And if it did, both hemispheres would warm together — but they don't.",
        correctiveStatement:
          "Summer is caused by more direct sunlight in your hemisphere, not by a hotter Sun.",
        memoryHook: "The Sun stays steady. Earth tilts.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Spin speed changes the seasons",
        acknowledgement: "Nice try — spin is a good instinct.",
        whyUnderstandable:
          "Rotation clearly shapes day and night, so it's tempting to give it credit for seasons too.",
        whyIncorrect:
          "Earth's rotation rate is essentially constant. It sets the length of a day, not the strength of sunlight.",
        correctiveStatement:
          "Seasons come from the axis tilt as Earth orbits the Sun, not from how fast it spins.",
        memoryHook: "Spin makes days. Tilt makes seasons.",
      },
    },
    retry: {
      id: "seasons-retry",
      supportiveIntro: "Let's test the same idea with a different example.",
      prompt: "When it is summer in Britain, what season is it usually in Australia?",
      options: [
        { id: "a", label: "Also summer" },
        { id: "b", label: "Winter" },
        { id: "c", label: "Autumn everywhere" },
        { id: "d", label: "It depends on distance from the Sun" },
      ],
      correctOptionId: "b",
      wrapUp:
        "When the north tilts sunward, the south tilts away — so the hemispheres always run opposite seasons.",
    },
    mindBlown: {
      headline:
        "Earth is actually slightly farther from the Sun during Northern Hemisphere summer.",
      detail: "About 5 million km farther than in January.",
    },
  },

  volcanoes: {
    correct: {
      acknowledgement: "Yes. Trapped gases and buoyant magma do the heavy lifting.",
      explanation:
        "Magma is lighter than the surrounding rock, so it slowly rises. Dissolved gases expand as pressure drops — like shaking a fizzy drink — and force the mixture out through any weak spot in the crust.",
      memoryHook: "Volcanoes are Earth's pressure valves.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "The Moon pulls out lava",
        acknowledgement: "That's a creative link.",
        whyUnderstandable:
          "The Moon really does tug oceans into tides, so it feels like it might tug rock too.",
        whyIncorrect:
          "Solid rock is far too rigid for the Moon's gravity to move meaningfully. Eruptions happen with or without the Moon overhead.",
        correctiveStatement:
          "Eruptions are driven by internal heat, pressure and buoyant magma — not lunar gravity.",
        memoryHook: "Tides move water, not rock.",
      },
      b: {
        optionId: "b",
        misconceptionLabel: "Rain fuels volcanoes",
        acknowledgement: "Interesting choice.",
        whyUnderstandable:
          "Water plus heat does make steam, so it sounds plausible that rain could power an eruption.",
        whyIncorrect:
          "Rain barely reaches a few metres down. Magma sits kilometres below and is heated by Earth's interior, not the weather.",
        correctiveStatement:
          "Volcanoes erupt because deep, hot magma rises under pressure — surface rain plays no role.",
        memoryHook: "Heat comes from below, not above.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Earth's spin shoots magma out",
        acknowledgement: "Nice mechanical thinking.",
        whyUnderstandable:
          "Spinning things do fling stuff outward, so a faster equator sounds like it could push magma up.",
        whyIncorrect:
          "Earth's rotation is far too gentle to lift dense rock. Volcanoes erupt near poles and equator alike.",
        correctiveStatement:
          "Pressure and buoyancy in molten rock drive eruptions, independent of latitude or spin.",
        memoryHook: "Pressure pushes up. Spin just turns.",
      },
    },
    retry: {
      id: "volcanoes-retry",
      supportiveIntro: "Same idea, fresh example.",
      prompt: "Why does opening a shaken soda make it foam out?",
      options: [
        { id: "a", label: "The bottle spins the liquid outward" },
        { id: "b", label: "Dissolved gas expands when pressure drops" },
        { id: "c", label: "Sunlight heats the liquid instantly" },
        { id: "d", label: "The sugar reacts with the air" },
      ],
      correctOptionId: "b",
      wrapUp: "Same physics as a volcano: release the pressure, gas expands, contents surge out.",
    },
    mindBlown: {
      headline: "There are active volcanoes on Jupiter's moon Io — hundreds of them.",
      detail: "Io is the most volcanically active place we've ever found.",
    },
  },

  deserts: {
    correct: {
      acknowledgement: "Right. A desert is defined by how little water arrives, not by heat.",
      explanation:
        "Any place that receives less than about 250 mm of rain a year counts as a desert — even a freezing one. Antarctica is technically the largest desert on Earth.",
      memoryHook: "Deserts are dry places, not hot places.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Deserts must be hot",
        acknowledgement: "That's a really common mental picture.",
        whyUnderstandable:
          "Movies and photos usually show the Sahara, so 'desert' gets tied to blistering heat.",
        whyIncorrect:
          "Antarctica gets almost no rain and is Earth's largest desert — and it's freezing. Heat isn't the requirement.",
        correctiveStatement:
          "The one thing every desert shares is very little precipitation.",
        memoryHook: "Cold + dry = desert too.",
      },
      c: {
        optionId: "c",
        misconceptionLabel: "Sand makes a desert",
        acknowledgement: "Good instinct — sand is iconic.",
        whyUnderstandable:
          "The word 'desert' pulls up sand dunes for almost everyone.",
        whyIncorrect:
          "Only about 20% of deserts are sandy. The rest are rock, gravel, salt flats or ice.",
        correctiveStatement:
          "It's low rainfall, not the ground surface, that makes somewhere a desert.",
        memoryHook: "Sand is optional. Dryness isn't.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Distance from the sea defines deserts",
        acknowledgement: "Not a bad guess.",
        whyUnderstandable:
          "Being far inland can make places drier, so it feels like the main cause.",
        whyIncorrect:
          "Some of the driest places on Earth — the Atacama, coastal Namibia — sit right next to the ocean.",
        correctiveStatement:
          "What matters is whether moisture actually reaches the ground, not the distance to a coast.",
        memoryHook: "It's the rain, not the coast.",
      },
    },
    retry: {
      id: "deserts-retry",
      supportiveIntro: "Try the same idea with a surprising place.",
      prompt: "Is Antarctica a desert?",
      options: [
        { id: "a", label: "No — deserts have to be hot" },
        { id: "b", label: "No — deserts have to have sand" },
        { id: "c", label: "Yes — it gets almost no precipitation" },
        { id: "d", label: "Only its coastline is a desert" },
      ],
      correctOptionId: "c",
      wrapUp:
        "Antarctica gets less precipitation than the Sahara. Deserts are about water, not warmth.",
    },
    mindBlown: {
      headline: "Antarctica is the biggest desert on Earth.",
      detail: "It's about 1.5× the size of the Sahara.",
    },
  },

  planes: {
    correct: {
      acknowledgement: "Yes. The wing turns the airflow downward and gets pushed up in return.",
      explanation:
        "As the wing slices through the air, its shape and angle deflect a huge amount of air downward. Newton's third law does the rest: for every push down, an equal push up — lift.",
      memoryHook: "Push air down, get pushed up.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Engines lift the plane",
        acknowledgement: "Reasonable — engines are loud and obvious.",
        whyUnderstandable:
          "You can see and hear the thrust, and helicopters do lift via downward-blown air.",
        whyIncorrect:
          "Airliner engines point backward, not down. They provide forward thrust; the wings turn that speed into lift.",
        correctiveStatement:
          "Engines push the plane forward. The wings convert that forward motion into upward lift.",
        memoryHook: "Engines push forward. Wings lift up.",
      },
      b: {
        optionId: "b",
        misconceptionLabel: "Hot air holds the plane up",
        acknowledgement: "That's balloon thinking — not silly at all.",
        whyUnderstandable:
          "Hot air really does lift hot-air balloons, so it feels like it might help planes too.",
        whyIncorrect:
          "The air inside a fuselage is nowhere near hot enough, and it's sealed in — it can't act like a balloon's buoyancy.",
        correctiveStatement:
          "Planes stay up by pushing outside air downward with their wings, not by internal buoyancy.",
        memoryHook: "Balloons float. Planes fly.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Magnetism holds planes up",
        acknowledgement: "Creative — Earth's field is real.",
        whyUnderstandable:
          "Earth does have a magnetic field, and metal + magnets is a natural pairing.",
        whyIncorrect:
          "Aircraft aluminium isn't strongly magnetic, and the field is far too weak to lift tonnes of metal anyway.",
        correctiveStatement:
          "Flight is aerodynamic — wings deflecting air — not magnetic.",
        memoryHook: "Air, not iron, holds a plane up.",
      },
    },
    retry: {
      id: "planes-retry",
      supportiveIntro: "Feel the same idea with your hand.",
      prompt:
        "You put your flat hand out of a car window and tilt the front edge up. Why does your hand lift?",
      options: [
        { id: "a", label: "Your hand suddenly gets lighter" },
        { id: "b", label: "The car's engine pushes it up" },
        { id: "c", label: "Your hand deflects air downward, so air pushes back up on it" },
        { id: "d", label: "Warm air from the vents blows it up" },
      ],
      correctOptionId: "c",
      wrapUp: "That's a tiny wing. Same principle scales up to airliners.",
    },
    mindBlown: {
      headline: "A fully loaded 747 pushes down millions of kilograms of air every second to stay airborne.",
    },
  },

  falling: {
    correct: {
      acknowledgement: "Correct. In a vacuum, mass doesn't decide falling speed.",
      explanation:
        "Gravity accelerates every object equally. Heavier objects need more force to accelerate them, but gravity supplies exactly more force — the two cancel out.",
      memoryHook: "In a vacuum, gravity is fair.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Heavier falls faster",
        acknowledgement: "That's the classic Aristotle answer — you're in famous company.",
        whyUnderstandable:
          "In everyday life a hammer clearly does beat a feather, so weight looks like it wins.",
        whyIncorrect:
          "That's because air slows the feather. Remove the air, and they land together — actually demonstrated on the Moon.",
        correctiveStatement:
          "Without air resistance, all masses fall at the same rate.",
        memoryHook: "Blame the air, not the weight.",
      },
      b: {
        optionId: "b",
        misconceptionLabel: "Lighter falls faster",
        acknowledgement: "Interesting reversal.",
        whyUnderstandable:
          "Maybe you were correcting for the 'heavier is faster' trap. Good instinct to question it.",
        whyIncorrect:
          "Lighter objects fall slower in air, not faster. In a vacuum, mass makes no difference at all.",
        correctiveStatement:
          "In a vacuum, mass is irrelevant to falling speed.",
        memoryHook: "Same gravity, same fall.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Falling needs air",
        acknowledgement: "That's a subtle idea — nice thinking.",
        whyUnderstandable:
          "Air is everywhere in daily life, so it's easy to assume it's part of what makes things fall.",
        whyIncorrect:
          "Gravity acts through empty space. Astronauts drop tools inside vacuum chambers all the time — they still fall.",
        correctiveStatement:
          "Gravity works with or without air. Air only opposes falling, it doesn't cause it.",
        memoryHook: "Gravity doesn't need a medium.",
      },
    },
    retry: {
      id: "falling-retry",
      supportiveIntro: "The Apollo 15 crew tried this on the Moon.",
      prompt:
        "On the Moon (no atmosphere), a hammer and a feather are dropped from the same height. What happens?",
      options: [
        { id: "a", label: "The hammer lands first" },
        { id: "b", label: "The feather lands first" },
        { id: "c", label: "They land at the same time" },
        { id: "d", label: "Neither falls without air" },
      ],
      correctOptionId: "c",
      wrapUp: "Astronaut David Scott really did this on live TV in 1971. They landed together.",
    },
    mindBlown: {
      headline:
        "On the Moon in 1971, an astronaut dropped a hammer and a feather. They hit the ground at exactly the same time.",
    },
  },

  "sky-blue": {
    correct: {
      acknowledgement: "Right. Air molecules scatter short blue wavelengths in every direction.",
      explanation:
        "Sunlight is a mix of colours. Air molecules are just the right size to bounce blue light around much more than red or green — so blue light reaches your eyes from every part of the sky.",
      memoryHook: "Blue bounces more.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Sky reflects the ocean",
        acknowledgement: "Poetic idea.",
        whyUnderstandable:
          "The sea and sky match in colour, so a reflection feels intuitive.",
        whyIncorrect:
          "The sky is blue over deserts, mountains and cities too — thousands of kilometres from any ocean.",
        correctiveStatement:
          "The ocean is blue partly because it reflects the sky, not the other way around.",
        memoryHook: "Sky first, sea second.",
      },
      c: {
        optionId: "c",
        misconceptionLabel: "Sunlight is mostly blue",
        acknowledgement: "That's a fair guess.",
        whyUnderstandable:
          "If the sky is blue, blue sunlight sounds like a tidy explanation.",
        whyIncorrect:
          "Sunlight is close to white — a full mix of colours. If it were mostly blue, snow and paper would look blue too.",
        correctiveStatement:
          "Sunlight is roughly white; the atmosphere sorts out the blue and spreads it across the sky.",
        memoryHook: "White in, blue out.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Eyes see blue best",
        acknowledgement: "Interesting angle on it.",
        whyUnderstandable:
          "Perception clearly shapes what we see, so it's tempting to put the answer inside our eyes.",
        whyIncorrect:
          "Cameras with no eyes at all photograph the same blue sky. Our biology isn't inventing it.",
        correctiveStatement:
          "The blue comes from physics in the atmosphere, not a quirk of human vision.",
        memoryHook: "Cameras see it too.",
      },
    },
    retry: {
      id: "sky-blue-retry",
      supportiveIntro: "Same physics, different time of day.",
      prompt: "Why do sunsets look red and orange?",
      options: [
        { id: "a", label: "The Sun cools down in the evening" },
        { id: "b", label: "Blue light has been scattered away, so mostly red reaches you" },
        { id: "c", label: "Clouds are painted by dust" },
        { id: "d", label: "Our eyes get tired and shift colour" },
      ],
      correctOptionId: "b",
      wrapUp:
        "At sunset light travels through much more air, so the blue gets scattered out — leaving red and orange to reach you.",
    },
    mindBlown: {
      headline: "The sky on Mars looks butterscotch in the day and blue at sunset — the opposite of Earth.",
    },
  },

  dna: {
    correct: {
      acknowledgement: "Yes. DNA is essentially your body's instruction manual for proteins.",
      explanation:
        "The four-letter code (A, T, C, G) tells cells how to assemble proteins, and proteins do almost everything — building tissue, digesting food, fighting germs, carrying oxygen.",
      memoryHook: "DNA writes the recipe. Proteins do the cooking.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "DNA is a physical blueprint",
        acknowledgement: "Close — that's a very common way people describe DNA.",
        whyUnderstandable:
          "'Blueprint' language is everywhere, and DNA does influence traits like eye colour.",
        whyIncorrect:
          "DNA doesn't shape or colour anything directly. It codes for proteins, and proteins do the visible work.",
        correctiveStatement:
          "DNA's real job is storing instructions for proteins — everything else follows from that.",
        memoryHook: "Code, not clay.",
      },
      c: {
        optionId: "c",
        misconceptionLabel: "DNA powers the cell",
        acknowledgement: "Reasonable — DNA gets a lot of credit for everything.",
        whyUnderstandable:
          "It sits at the centre of the cell, so it's easy to imagine it as the engine too.",
        whyIncorrect:
          "The cell's energy comes from mitochondria, using food and oxygen. DNA doesn't produce energy itself.",
        correctiveStatement:
          "DNA stores instructions. Mitochondria produce the energy.",
        memoryHook: "Library, not power plant.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "DNA fights germs itself",
        acknowledgement: "Nice guess — the immune system is impressive.",
        whyUnderstandable:
          "Since DNA seems central to everything cells do, it feels like it must fight infection too.",
        whyIncorrect:
          "Immune defence is done by specialised cells and proteins (like antibodies). DNA only codes for them.",
        correctiveStatement:
          "DNA writes the instructions for immune proteins; the proteins do the fighting.",
        memoryHook: "DNA writes it. Proteins act.",
      },
    },
    retry: {
      id: "dna-retry",
      supportiveIntro: "Try the same idea in a different frame.",
      prompt: "A gene is best described as…",
      options: [
        { id: "a", label: "A small organ inside the cell" },
        { id: "b", label: "A section of DNA that codes for a protein" },
        { id: "c", label: "A tiny battery for the cell" },
        { id: "d", label: "A type of antibody" },
      ],
      correctOptionId: "b",
      wrapUp: "A gene is a chunk of the DNA recipe book. Proteins are what get built from it.",
    },
    mindBlown: {
      headline: "Uncoiled, the DNA in a single one of your cells would stretch about 2 metres.",
      detail: "Multiply by ~37 trillion cells and you get astronomical.",
    },
  },

  leaves: {
    correct: {
      acknowledgement: "Yes. The green mask fades and the underlying colours show through.",
      explanation:
        "Yellow and orange pigments (carotenoids) sit in leaves all summer, hidden by strong green chlorophyll. As days shorten, trees stop making chlorophyll, and the other colours finally appear.",
      memoryHook: "Autumn colours were there all along.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Cold paints the leaves",
        acknowledgement: "Cold and colour do go together in autumn.",
        whyUnderstandable:
          "Leaves change as it cools, so it's tempting to make cold the cause.",
        whyIncorrect:
          "The main trigger is shorter daylight, not temperature. Trees start the change even when autumn is warm.",
        correctiveStatement:
          "Length of daylight tells trees to stop making chlorophyll; the hidden colours then show.",
        memoryHook: "Light triggers, not cold.",
      },
      b: {
        optionId: "b",
        misconceptionLabel: "Trees refill with new colour",
        acknowledgement: "Vivid image — I can see it.",
        whyUnderstandable:
          "It looks like the whole leaf is being repainted, so 'refill' feels natural.",
        whyIncorrect:
          "Trees don't pump in new pigments. Yellow and orange are already there; only red is newly made in some species.",
        correctiveStatement:
          "The leaf isn't repainted — the green cover is removed, revealing what was underneath.",
        memoryHook: "Reveal, don't repaint.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "The Sun bleaches leaves",
        acknowledgement: "Sun does bleach things — not a wild guess.",
        whyUnderstandable:
          "Sunlight really does fade paint and hair over time.",
        whyIncorrect:
          "If sunlight bleached leaves, they'd turn white — and change fastest in summer, not autumn.",
        correctiveStatement:
          "It's the tree switching off chlorophyll production, not sunlight destroying it.",
        memoryHook: "Trees choose to fade.",
      },
    },
    retry: {
      id: "leaves-retry",
      supportiveIntro: "Same idea, different question.",
      prompt: "Why don't evergreen pine trees change colour in autumn?",
      options: [
        { id: "a", label: "Their needles have no pigment" },
        { id: "b", label: "They keep producing chlorophyll year-round" },
        { id: "c", label: "The cold cannot reach them" },
        { id: "d", label: "They already changed colour in summer" },
      ],
      correctOptionId: "b",
      wrapUp: "Evergreens keep the green tap on all year, so the hidden colours never get their turn.",
    },
    mindBlown: {
      headline:
        "The vivid orange in autumn leaves is the same pigment family that makes carrots orange.",
    },
  },

  vaccines: {
    correct: {
      acknowledgement: "Right. A vaccine is a safe rehearsal for the real thing.",
      explanation:
        "It shows the immune system a harmless version or piece of a germ. Your body practises making antibodies against it, so when the real pathogen arrives, defenders are ready before you fall ill.",
      memoryHook: "Rehearse now, respond fast later.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Vaccines are germ-killers on contact",
        acknowledgement: "Reasonable — the word 'shot' sounds combative.",
        whyUnderstandable:
          "We often think of medicine as attacking the bad guys directly.",
        whyIncorrect:
          "A vaccine doesn't roam the body killing germs. It trains your own immune system to do that.",
        correctiveStatement:
          "Vaccines teach; your immune system fights.",
        memoryHook: "Teacher, not soldier.",
      },
      c: {
        optionId: "c",
        misconceptionLabel: "Vaccines replace or cleanse blood",
        acknowledgement: "Interesting thought.",
        whyUnderstandable:
          "'Cleaner blood' has a strong intuitive appeal — like changing the oil.",
        whyIncorrect:
          "Nothing in a vaccine replaces blood. Your blood is fine; it just needs a preview of what to fight.",
        correctiveStatement:
          "Vaccines give the immune system a preview so it can build defences in advance.",
        memoryHook: "Preview, not transfusion.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Vaccines burn germs with heat",
        acknowledgement: "Creative — fever is a real defence.",
        whyUnderstandable:
          "Your body does raise its temperature to fight infection, so heat and immunity feel linked.",
        whyIncorrect:
          "A vaccine doesn't heat your body. Any mild temperature bump is a side effect of the immune practice, not the mechanism.",
        correctiveStatement:
          "The protection comes from trained immune memory, not from heat.",
        memoryHook: "Memory beats heat.",
      },
    },
    retry: {
      id: "vaccines-retry",
      supportiveIntro: "Same idea, one more angle.",
      prompt:
        "Why can a vaccine still work well even if it only contains a tiny piece of the virus?",
      options: [
        { id: "a", label: "The piece grows into a full virus in you" },
        { id: "b", label: "Your immune system learns to recognise that piece, so it can spot the real virus" },
        { id: "c", label: "It boils your blood clean" },
        { id: "d", label: "It replaces damaged cells" },
      ],
      correctOptionId: "b",
      wrapUp: "Recognising one distinctive shape is enough. Once your body knows the target, it can react fast.",
    },
    mindBlown: {
      headline:
        "Smallpox killed hundreds of millions — then vaccines wiped it off the planet by 1980.",
    },
  },

  yawning: {
    correct: {
      acknowledgement: "Right. Brain-cooling is currently the leading explanation.",
      explanation:
        "A deep inhale plus a big jaw stretch pulls cooler blood through your head. Yawning seems to happen most when the brain is warm, tired or under-stimulated — situations where cooling helps.",
      memoryHook: "Yawns are a brain aircon burst.",
    },
    incorrect: {
      a: {
        optionId: "a",
        misconceptionLabel: "Yawns fix an oxygen shortage",
        acknowledgement: "This is by far the most common answer — you're not alone.",
        whyUnderstandable:
          "Yawning feels like a big breath, so an oxygen fix sounds obvious.",
        whyIncorrect:
          "Studies show breathing extra oxygen doesn't reduce yawning, and low-oxygen air doesn't increase it.",
        correctiveStatement:
          "Yawning isn't really about oxygen. Cooling the brain is a much better fit for the evidence.",
        memoryHook: "Cool, not oxygen.",
      },
      b: {
        optionId: "b",
        misconceptionLabel: "Yawns stretch the throat for speech",
        acknowledgement: "Creative link.",
        whyUnderstandable:
          "Yawns are big and jaw-heavy, so a speech connection feels plausible.",
        whyIncorrect:
          "Babies yawn in the womb, before they ever speak — and animals that don't talk yawn too.",
        correctiveStatement:
          "Yawning predates speech. It's tied to arousal and brain temperature, not talking.",
        memoryHook: "Fish yawn. Speech isn't it.",
      },
      d: {
        optionId: "d",
        misconceptionLabel: "Yawns reset balance",
        acknowledgement: "Interesting theory.",
        whyUnderstandable:
          "Your inner ear is right there, so it's an understandable leap.",
        whyIncorrect:
          "There's no evidence that yawning changes balance or the vestibular system.",
        correctiveStatement:
          "The strongest evidence still points to brain cooling and shifts in alertness.",
        memoryHook: "Cool the brain, not the ears.",
      },
    },
    retry: {
      id: "yawning-retry",
      supportiveIntro: "Same idea, a well-known observation.",
      prompt:
        "People often yawn more when they're tired, warm, or bored. What does that pattern best support?",
      options: [
        { id: "a", label: "Yawning fixes an oxygen shortage" },
        { id: "b", label: "Yawning helps regulate brain temperature and alertness" },
        { id: "c", label: "Yawning is caused by hunger" },
        { id: "d", label: "Yawning stretches the vocal cords" },
      ],
      correctOptionId: "b",
      wrapUp: "The same situations that overheat and under-stimulate the brain trigger the most yawns.",
    },
    mindBlown: {
      headline: "Yawns are so contagious that even reading the word 'yawn' can start one.",
    },
  },
};

/**
 * Demo-only helper. In the real app this lives on the server and the
 * presenter component only ever receives `resolvedOptionStates`.
 */
export function resolveChallenge(
  challenge: Challenge,
  selectedOptionId: string,
): Record<string, ResolvedOptionState> {
  const out: Record<string, ResolvedOptionState> = {};
  for (const opt of challenge.options) {
    if (opt.id === challenge.correctOptionId) out[opt.id] = "correct";
    else if (opt.id === selectedOptionId) out[opt.id] = "incorrect";
    else out[opt.id] = "locked";
  }
  return out;
}

/**
 * Demo-only feedback resolver. Returns the correct-path feedback if the
 * learner picked the correct option, otherwise the option-specific
 * misconception feedback. Real backends should return the same shape.
 */
export function resolveFeedback(
  challenge: Challenge,
  feedback: ChallengeFeedback,
  selectedOptionId: string,
):
  | { kind: "correct"; data: CorrectFeedbackData }
  | { kind: "incorrect"; data: OptionFeedback } {
  if (selectedOptionId === challenge.correctOptionId) {
    return { kind: "correct", data: feedback.correct };
  }
  const optionFeedback = feedback.incorrect[selectedOptionId];
  return { kind: "incorrect", data: optionFeedback };
}

/** Look up the human label for an option id. */
export function getOptionLabel(challenge: Challenge, optionId: string): string {
  return challenge.options.find((o) => o.id === optionId)?.label ?? "";
}
