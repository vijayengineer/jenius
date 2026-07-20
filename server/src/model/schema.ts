export const EXPLANATION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["explanation", "memoryHook", "miniExample"],
  properties: {
    explanation: { type: "string", minLength: 1, maxLength: 520 },
    memoryHook: { type: "string", minLength: 1, maxLength: 180 },
    miniExample: { type: ["string", "null"], maxLength: 260 },
  },
} as const;

const answerOption = {
  type: "object",
  additionalProperties: false,
  required: ["id", "label", "isCorrect", "misconceptionId"],
  properties: {
    id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    label: { type: "string", minLength: 1, maxLength: 180 },
    isCorrect: { type: "boolean" },
    misconceptionId: {
      type: ["string", "null"],
      pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    },
  },
} as const;

const retryOption = {
  type: "object",
  additionalProperties: false,
  required: ["id", "label", "isCorrect"],
  properties: {
    id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    label: { type: "string", minLength: 1, maxLength: 180 },
    isCorrect: { type: "boolean" },
  },
} as const;

export const GENERATED_CONCEPT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "hook",
    "subject",
    "category",
    "explanation",
    "takeaway",
    "memoryHook",
    "primaryQuestion",
    "correctFeedback",
    "misconceptions",
    "retryQuestion",
    "mindBlown",
    "estimatedDurationSeconds",
    "tags",
  ],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 120 },
    hook: { type: "string", minLength: 1, maxLength: 180 },
    subject: {
      type: "string",
      enum: ["geography", "earth-science", "physics", "biology", "general"],
    },
    category: { type: "string", minLength: 1, maxLength: 60 },
    explanation: { type: "string", minLength: 1, maxLength: 700 },
    takeaway: { type: "string", minLength: 1, maxLength: 180 },
    memoryHook: { type: ["string", "null"], maxLength: 180 },
    primaryQuestion: {
      type: "object",
      additionalProperties: false,
      required: ["id", "prompt", "options"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
        prompt: { type: "string", minLength: 1, maxLength: 280 },
        options: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          items: answerOption,
        },
      },
    },
    correctFeedback: {
      type: "object",
      additionalProperties: false,
      required: ["acknowledgement", "explanation", "memoryHook"],
      properties: {
        acknowledgement: { type: "string", minLength: 1, maxLength: 180 },
        explanation: { type: "string", minLength: 1, maxLength: 300 },
        memoryHook: { type: "string", minLength: 1, maxLength: 180 },
      },
    },
    misconceptions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "label", "feedback"],
        properties: {
          id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          label: { type: "string", minLength: 1, maxLength: 160 },
          feedback: {
            type: "object",
            additionalProperties: false,
            required: [
              "acknowledgement",
              "whyUnderstandable",
              "whyIncorrect",
              "correction",
              "memoryHook",
            ],
            properties: {
              acknowledgement: { type: "string", minLength: 1, maxLength: 180 },
              whyUnderstandable: { type: "string", minLength: 1, maxLength: 260 },
              whyIncorrect: { type: "string", minLength: 1, maxLength: 300 },
              correction: { type: "string", minLength: 1, maxLength: 300 },
              memoryHook: { type: "string", minLength: 1, maxLength: 180 },
            },
          },
        },
      },
    },
    retryQuestion: {
      type: "object",
      additionalProperties: false,
      required: ["id", "supportiveIntro", "prompt", "options", "wrapUp"],
      properties: {
        id: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
        supportiveIntro: { type: "string", minLength: 1, maxLength: 180 },
        prompt: { type: "string", minLength: 1, maxLength: 280 },
        options: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: retryOption,
        },
        wrapUp: { type: "string", minLength: 1, maxLength: 280 },
      },
    },
    mindBlown: {
      type: "object",
      additionalProperties: false,
      required: ["headline", "detail"],
      properties: {
        headline: { type: "string", minLength: 1, maxLength: 220 },
        detail: { type: ["string", "null"], maxLength: 320 },
      },
    },
    estimatedDurationSeconds: { type: "integer", minimum: 30, maximum: 600 },
    tags: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: { type: "string", minLength: 1, maxLength: 40 },
    },
  },
} as const;
