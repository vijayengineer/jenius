# Content model

The bundled catalogue is parsed with Zod before the application exports it. TypeScript types are
inferred from the schemas so validation and application contracts cannot drift.

Each `FeedConcept` contains a stable ID, title, curiosity hook, one of the four launch subjects,
concise explanation, optional memory hook and media, one primary question, a retry question, a
Mind Blown fact, duration, tags, and verified status.

Primary questions have exactly four uniquely identified options and exactly one correct option.
Every plausible wrong option references a misconception declared on the concept. A
`TeacherFeedback` record names the misconception, acknowledges why it is understandable, explains
the mismatch, states the correction, and supplies a memory hook.

Media modes are `video`, `svg`, `image`, `text`, and `none`. Asset paths must be same-origin
relative paths. The slot collapses for text/none and learning content cannot depend on media.

Cross-catalogue validation rejects:

- duplicate concept, question, option, retry, or misconception IDs;
- anything other than four primary options or one correct primary answer;
- unknown misconception references;
- missing/empty retry content;
- missing Mind Blown content;
- remote/protocol-relative media URLs; and
- unverified bundled content.

Use `npm run validate-content` for a pass/fail gate and `npm run report-content` for concept,
subject, question, misconception, and animation-ready coverage.
