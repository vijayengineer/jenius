import type { SubjectId } from "./types";

export type SavedCollectionId = "mind-blown" | "finally-get-it";

export interface SavedCollectionMeta {
  id: SavedCollectionId;
  label: string;
  description: string;
}

export const SAVED_COLLECTIONS: SavedCollectionMeta[] = [
  {
    id: "mind-blown",
    label: "Mind Blown",
    description: "Ideas that made you go “wait, what?”",
  },
  {
    id: "finally-get-it",
    label: "I Finally Get It",
    description: "Concepts that clicked after a retry.",
  },
];

export interface SavedItem {
  conceptId: string;
  subject: SubjectId;
  category: string;
  hook: string;
  takeaway: string;
  /** Human-readable saved timestamp placeholder, e.g. "2d ago". */
  savedAtLabel: string;
  collection: SavedCollectionId;
}

export const MOCK_SAVED_ITEMS: SavedItem[] = [
  {
    conceptId: "seasons",
    subject: "science",
    category: "Earth Science",
    hook: "Why do seasons exist?",
    takeaway: "Tilt changes sunlight.",
    savedAtLabel: "2d ago",
    collection: "mind-blown",
  },
  {
    conceptId: "falling",
    subject: "science",
    category: "Physics",
    hook: "Do heavier objects fall faster?",
    takeaway: "Gravity treats mass equally.",
    savedAtLabel: "5d ago",
    collection: "mind-blown",
  },
  {
    conceptId: "deserts",
    subject: "science",
    category: "Earth Science",
    hook: "Why do deserts form?",
    takeaway: "No rain, no forest.",
    savedAtLabel: "1w ago",
    collection: "mind-blown",
  },
  {
    conceptId: "planes",
    subject: "science",
    category: "Physics",
    hook: "Why do planes fly?",
    takeaway: "Wings push air down.",
    savedAtLabel: "3d ago",
    collection: "finally-get-it",
  },
  {
    conceptId: "dna",
    subject: "life",
    category: "Biology",
    hook: "What is DNA?",
    takeaway: "DNA is your body's code.",
    savedAtLabel: "6d ago",
    collection: "finally-get-it",
  },
  {
    conceptId: "vaccines",
    subject: "life",
    category: "Biology",
    hook: "How do vaccines train the immune system?",
    takeaway: "Practice before the real fight.",
    savedAtLabel: "1w ago",
    collection: "finally-get-it",
  },
];
