import { VERIFIED_CONCEPTS } from "../src/content/catalog";
import { createContentReport, validateContent } from "../src/content/validation";

const command = process.argv[2] ?? "validate";
const concepts = validateContent(VERIFIED_CONCEPTS);

if (command === "report") {
  const report = createContentReport(concepts);
  console.log(`Concepts: ${report.conceptCount}`);
  console.log(
    `Subjects: ${Object.entries(report.subjectCoverage)
      .map(([subject, count]) => `${subject}=${count}`)
      .join(", ")}`,
  );
  console.log(`Questions: ${report.questionCount}`);
  console.log(`Misconceptions: ${report.misconceptionCount}`);
  console.log(`Wrong-answer misconception coverage: ${report.misconceptionCoverage * 100}%`);
  console.log(`Animation-ready: ${report.animationReadyConcepts.join(", ")}`);
} else {
  console.log(`Validated ${concepts.length} verified Jenius concepts.`);
}
