import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FEED_CONCEPTS } from "@/content/catalog";
import { CONTENT_CHALLENGES, CONTENT_FEEDBACK } from "@/content/presenter";
import type { LearningPhase } from "@/learning/engine";
import {
  ChallengeLessonContent,
  ChallengeSheet,
  type ChallengeSheetProps,
  type ChallengeStage,
} from "./ChallengeSheet";

const concept = FEED_CONCEPTS.find(({ id }) => id === "seasons")!;
const question = CONTENT_CHALLENGES.seasons;
const feedback = CONTENT_FEEDBACK.seasons;
const wrongOption = question.options.find(({ id }) => id !== question.correctOptionId)!;
const noop = () => undefined;

const phaseByStage: Record<ChallengeStage, LearningPhase> = {
  question: "answering",
  "feedback-correct": "teacher-feedback",
  "feedback-incorrect": "misconception",
  retry: "retry",
  "mind-blown": "mind-blown",
};

function propsFor(stage: ChallengeStage): ChallengeSheetProps {
  return {
    open: true,
    onOpenChange: noop,
    onClose: noop,
    subject: concept.subject,
    stage,
    learningPhase: phaseByStage[stage],
    retryRequired: stage === "feedback-incorrect" || stage === "retry",
    question,
    selectedOptionId:
      stage === "feedback-incorrect" || stage === "retry"
        ? wrongOption.id
        : question.correctOptionId,
    submissionState: stage === "question" ? "idle" : "submitted",
    onSelect: noop,
    onSubmit: noop,
    correctFeedback: feedback.correct,
    incorrectFeedback: feedback.incorrect[wrongOption.id],
    selectedOptionLabel: wrongOption.label,
    incorrectExplanationVisible: stage === "feedback-incorrect",
    onShowIncorrectExplanation: noop,
    onRetry: noop,
    onSkipRetry: noop,
    retryChallenge: feedback.retry,
    retrySelectedOptionId: null,
    retrySubmissionState: "idle",
    onRetrySelect: noop,
    onRetrySubmit: noop,
    mindBlown: feedback.mindBlown,
    onContinue: noop,
  };
}

function renderStage(stage: ChallengeStage, overrides: Partial<ChallengeSheetProps> = {}) {
  return renderToStaticMarkup(
    React.createElement(ChallengeLessonContent, { ...propsFor(stage), ...overrides }),
  );
}

describe("mobile challenge presenter", () => {
  it.each(["question", "feedback-correct", "feedback-incorrect", "retry", "mind-blown"] as const)(
    "keeps question context represented during %s",
    (stage) => {
      const markup = renderStage(stage);
      expect(markup).toContain("data-question-context");
      expect(markup).toContain(question.prompt);
      if (stage === "retry") expect(markup).toContain(feedback.retry.prompt);
    },
  );

  it.each(["idle", "submitting", "submitted", "error"] as const)(
    "keeps the full question in the DOM while submission is %s",
    (submissionState) => {
      expect(renderStage("question", { submissionState })).toContain(question.prompt);
    },
  );

  it("does not truncate long question or answer copy in the presenter", () => {
    const longPrompt = `${question.prompt} ${"Keep this context visible. ".repeat(8)}`;
    const longAnswer = `${question.options[0].label} ${"with an important detail ".repeat(10)}`;
    const markup = renderStage("question", {
      question: {
        ...question,
        prompt: longPrompt,
        options: question.options.map((option, index) =>
          index === 0 ? { ...option, label: longAnswer } : option,
        ),
      },
    });
    expect(markup).toContain(longPrompt);
    expect(markup).toContain(longAnswer);
  });

  it("keeps optional coaching after the deterministic primary flow", () => {
    const markup = renderStage("feedback-correct", {
      onExplainAnotherWay: noop,
      explainAnotherWayDisabled: true,
    });
    expect(markup).toContain("See the big idea");
    expect(markup).toContain("Explain another way");
    expect(markup.indexOf("See the big idea")).toBeLessThan(markup.indexOf("Explain another way"));
  });

  it("shows one clear misconception transition before retry and coaching", () => {
    const hidden = renderStage("feedback-incorrect", {
      incorrectExplanationVisible: false,
      onExplainAnotherWay: noop,
    });
    expect(hidden).toContain("Show me why");
    expect(hidden).not.toContain("Explain another way");

    const revealed = renderStage("feedback-incorrect", { onExplainAnotherWay: noop });
    expect(revealed).toContain("Try again");
    expect(revealed.indexOf("Try again")).toBeLessThan(revealed.indexOf("Explain another way"));
  });

  it("provides accessible progress and primary action names", () => {
    const markup = renderStage("question");
    expect(markup).toContain('aria-label="Lesson progress"');
    expect(markup).toContain('aria-valuetext="Lesson progress: Challenge, step 2 of 5"');
    expect(markup).toContain("Check answer");
  });

  it("passes a specific accessible label to the fixed sheet close control", () => {
    const sheet = ChallengeSheet(propsFor("question")) as React.ReactElement<{
      children: React.ReactElement<{ closeLabel?: string }>;
    }>;
    expect(sheet.props.children.props.closeLabel).toBe("Close lesson");
  });
});
