import { describe, expect, it } from "vitest";
import { VERIFIED_CONCEPT_CATALOGUE } from "../../server/src/catalogue";
import { VERIFIED_CONCEPTS } from "./catalog";

describe("server verified-catalogue projection", () => {
  it("stays aligned with the bundled catalogue", () => {
    expect(VERIFIED_CONCEPT_CATALOGUE).toHaveLength(VERIFIED_CONCEPTS.length);
    expect(VERIFIED_CONCEPT_CATALOGUE.map(({ id }) => id)).toEqual(
      VERIFIED_CONCEPTS.map(({ id }) => id),
    );
    for (const serverConcept of VERIFIED_CONCEPT_CATALOGUE) {
      const bundled = VERIFIED_CONCEPTS.find(({ id }) => id === serverConcept.id);
      expect(serverConcept).toMatchObject({
        title: bundled?.title,
        hook: bundled?.hook,
        explanation: bundled?.explanation,
        takeaway: bundled?.takeaway,
      });
    }
  });
});
