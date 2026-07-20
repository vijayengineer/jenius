export function validGeneratedConceptDraft() {
  return {
    title: "How rainbows form",
    hook: "Why does sunlight turn into a rainbow?",
    subject: "physics",
    category: "Light",
    explanation:
      "A raindrop bends sunlight as it enters, reflects it inside the drop, and bends it again as it leaves. Different colours bend by slightly different amounts, so white sunlight spreads into a spectrum.",
    takeaway: "Raindrops bend and separate sunlight.",
    memoryHook: "Bend, bounce, bend.",
    primaryQuestion: {
      id: "rainbow-primary",
      prompt: "What separates white light into rainbow colours?",
      options: [
        {
          id: "rainbow-a",
          label: "Different colours bend by different amounts",
          isCorrect: true,
          misconceptionId: null,
        },
        {
          id: "rainbow-b",
          label: "Raindrops paint the light",
          isCorrect: false,
          misconceptionId: "rainbow-paint",
        },
        {
          id: "rainbow-c",
          label: "Clouds add the colours",
          isCorrect: false,
          misconceptionId: "rainbow-clouds",
        },
        {
          id: "rainbow-d",
          label: "Air heats the sunlight",
          isCorrect: false,
          misconceptionId: "rainbow-heat",
        },
      ],
    },
    correctFeedback: {
      acknowledgement: "Exactly.",
      explanation: "Refraction separates the colours because each wavelength bends differently.",
      memoryHook: "Different colour, different bend.",
    },
    misconceptions: [
      {
        id: "rainbow-paint",
        label: "Raindrops contain colour",
        feedback: {
          acknowledgement: "It can look as if the colour comes from the drops.",
          whyUnderstandable: "The rainbow only appears when drops are present.",
          whyIncorrect: "The colours are already part of white sunlight.",
          correction: "Drops separate the colours already in sunlight.",
          memoryHook: "Drops sort; they do not paint.",
        },
      },
      {
        id: "rainbow-clouds",
        label: "Clouds add colour",
        feedback: {
          acknowledgement: "Rainbows often appear near clouds.",
          whyUnderstandable: "Clouds and rain arrive together.",
          whyIncorrect: "A rainbow can form in spray without a cloud.",
          correction: "Water drops, sunlight, and viewing angle create it.",
          memoryHook: "Think drops, Sun, angle.",
        },
      },
      {
        id: "rainbow-heat",
        label: "Heat changes the colour",
        feedback: {
          acknowledgement: "Sunlight often feels warm.",
          whyUnderstandable: "Warmth and sunlight arrive together.",
          whyIncorrect: "The separation comes from bending, not heating.",
          correction: "Refraction sorts the wavelengths.",
          memoryHook: "Bending, not baking.",
        },
      },
    ],
    retryQuestion: {
      id: "rainbow-retry",
      supportiveIntro: "Try the path of the light.",
      prompt: "What happens to sunlight inside a raindrop?",
      options: [
        { id: "retry-a", label: "It bends, reflects, and bends again", isCorrect: true },
        { id: "retry-b", label: "It turns into heat only", isCorrect: false },
      ],
      wrapUp: "That path spreads the colours for your eyes.",
    },
    mindBlown: {
      headline: "Every observer sees their own rainbow.",
      detail: "The light reaching each pair of eyes comes from a different set of drops.",
    },
    estimatedDurationSeconds: 100,
    tags: ["light", "rainbows", "physics"],
  };
}
