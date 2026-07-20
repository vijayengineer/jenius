import { FeedConceptSchema, type FeedConcept, type Subject } from "./schema";

export interface ContentReport {
  conceptCount: number;
  subjectCoverage: Record<Subject, number>;
  questionCount: number;
  misconceptionCount: number;
  misconceptionCoverage: number;
  animationReadyConcepts: string[];
}

function findDuplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function validateContent(input: unknown[]): FeedConcept[] {
  const concepts = input.map((item, index) => {
    const result = FeedConceptSchema.safeParse(item);
    if (result.success) return result.data;
    const details = result.error.issues
      .map((issue) => `concept[${index}].${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Content validation failed:\n${details}`);
  });

  const globalIds = concepts.flatMap((concept) => [
    concept.id,
    concept.primaryQuestion.id,
    concept.retryQuestion.id,
    ...concept.primaryQuestion.options.map(({ id }) => `${concept.id}:primary:${id}`),
    ...concept.retryQuestion.options.map(({ id }) => `${concept.id}:retry:${id}`),
    ...concept.misconceptions.map(({ id }) => `${concept.id}:misconception:${id}`),
  ]);
  const duplicateIds = findDuplicates(globalIds);
  if (duplicateIds.length) {
    throw new Error(`Content validation failed: duplicate IDs: ${duplicateIds.join(", ")}`);
  }
  return concepts;
}

export function createContentReport(concepts: FeedConcept[]): ContentReport {
  const subjectCoverage: Record<Subject, number> = {
    geography: 0,
    "earth-science": 0,
    physics: 0,
    biology: 0,
  };
  let referencedMisconceptions = 0;
  let wrongOptions = 0;

  for (const concept of concepts) {
    subjectCoverage[concept.subject] += 1;
    for (const option of concept.primaryQuestion.options) {
      if (!option.isCorrect) {
        wrongOptions += 1;
        if (option.misconceptionId) referencedMisconceptions += 1;
      }
    }
  }

  return {
    conceptCount: concepts.length,
    subjectCoverage,
    questionCount: concepts.length * 2,
    misconceptionCount: concepts.reduce(
      (total, concept) => total + concept.misconceptions.length,
      0,
    ),
    misconceptionCoverage: wrongOptions ? referencedMisconceptions / wrongOptions : 0,
    animationReadyConcepts: concepts
      .filter((concept) => concept.media?.animationReady)
      .map((concept) => concept.id),
  };
}
