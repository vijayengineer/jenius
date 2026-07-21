import * as React from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "./Sheet";
import { SubjectChip } from "./SubjectChip";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import { CorrectFeedback } from "./CorrectFeedback";
import { IncorrectFeedback } from "./IncorrectFeedback";
import { RetryQuestion } from "./RetryQuestion";
import { MindBlownCard } from "./MindBlownCard";
import { LessonProgress } from "./LessonProgress";
import type { LearningPhase } from "@/learning/engine";
import type { SubjectId } from "@/lib/jenius/types";
import type {
  Challenge,
  CorrectFeedbackData,
  MindBlownFact,
  OptionFeedback,
  ResolvedOptionState,
  RetryChallenge,
  SubmissionState,
} from "@/lib/jenius/challenges";

/**
 * Stages of the challenge → feedback → retry → mind-blown flow.
 * The stage machine lives in the caller; this sheet is a pure presenter.
 */
export type ChallengeStage =
  "question" | "feedback-correct" | "feedback-incorrect" | "retry" | "mind-blown";

export interface ChallengeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectId;
  /** Short reminder of the concept the challenge belongs to. */
  conceptReminder?: string;

  /** Which stage of the flow to render. */
  stage: ChallengeStage;
  learningPhase: LearningPhase;
  retryRequired?: boolean;

  // ---- question stage ----
  question: Challenge;
  selectedOptionId: string | null;
  submissionState: SubmissionState;
  resolvedOptionStates?: Record<string, ResolvedOptionState>;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;

  // ---- feedback-correct stage ----
  correctFeedback?: CorrectFeedbackData;

  // ---- feedback-incorrect stage ----
  incorrectFeedback?: OptionFeedback;
  /** Label of the option the learner picked (resolved by caller). */
  selectedOptionLabel?: string;
  incorrectExplanationVisible?: boolean;
  onShowIncorrectExplanation?: () => void;
  onRetry?: () => void;
  onSkipRetry?: () => void;

  // ---- retry stage ----
  retryChallenge?: RetryChallenge;
  retrySelectedOptionId?: string | null;
  retrySubmissionState?: SubmissionState;
  retryResolvedOptionStates?: Record<string, ResolvedOptionState>;
  onRetrySelect?: (optionId: string) => void;
  onRetrySubmit?: () => void;

  // ---- mind-blown stage ----
  mindBlown?: MindBlownFact;
  saved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  onContinue?: () => void;

  // ---- optional AI coach ----
  onExplainAnotherWay?: () => void;
  explainAnotherWayDisabled?: boolean;
  explainAnotherWayHint?: string;

  // ---- shared ----
  onClose: () => void;
  /** Retry the network call after a submission error. */
  onErrorRetry?: () => void;
}

const MARKERS = ["A", "B", "C", "D"];

/**
 * ChallengeSheet — bottom sheet that opens over a dimmed concept card.
 *
 * Dumb presenter: switches on `stage` and renders the matching sub-view.
 * All copy and correctness resolution arrives through props.
 */
export function ChallengeSheet(props: ChallengeSheetProps) {
  const { open, onOpenChange, subject, stage, learningPhase, retryRequired } = props;
  const currentQuestion =
    stage === "retry" && props.retryChallenge ? props.retryChallenge.prompt : props.question.prompt;
  const questionId = stage === "retry" ? "retry-prompt" : "challenge-question";
  const showCoach =
    stage === "feedback-correct" ||
    (stage === "feedback-incorrect" && props.incorrectExplanationVisible) ||
    (stage === "retry" && props.retrySubmissionState === "submitted");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Lesson" hideHeader>
        <LessonProgress phase={learningPhase} retryRequired={retryRequired} />

        <div className="mt-4 flex items-center gap-2">
          <SubjectChip subject={subject} size="sm" />
          <span className="text-xs uppercase tracking-[0.18em] text-foreground/60">
            {stageLabel(stage)}
          </span>
        </div>

        <div data-question-context className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
            {stage === "retry" ? "Try this question" : "Question"}
          </p>
          <h2
            id={questionId}
            className="mt-1 font-display text-[24px] font-semibold leading-snug tracking-tight text-foreground"
          >
            {currentQuestion}
          </h2>
          {stage === "retry" ? (
            <span className="sr-only" data-original-question>
              Original question: {props.question.prompt}
            </span>
          ) : null}
        </div>

        <div className="mt-5">
          {stage === "question" ? <QuestionStage {...props} /> : null}
          {stage === "feedback-correct" && props.correctFeedback ? (
            <FeedbackCorrectStage {...props} data={props.correctFeedback} />
          ) : null}
          {stage === "feedback-incorrect" && props.incorrectFeedback ? (
            <FeedbackIncorrectStage {...props} data={props.incorrectFeedback} />
          ) : null}
          {stage === "retry" && props.retryChallenge ? (
            <RetryStage {...props} retry={props.retryChallenge} />
          ) : null}
          {stage === "mind-blown" && props.mindBlown ? (
            <MindBlownStage {...props} fact={props.mindBlown} />
          ) : null}

          {showCoach && props.onExplainAnotherWay ? (
            <CoachAction
              onClick={props.onExplainAnotherWay}
              disabled={props.explainAnotherWayDisabled}
              hint={props.explainAnotherWayHint}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function stageLabel(stage: ChallengeStage) {
  switch (stage) {
    case "question":
      return "Quick check";
    case "feedback-correct":
      return "Nice work";
    case "feedback-incorrect":
      return "Let's unpack it";
    case "retry":
      return "Retry";
    case "mind-blown":
      return "Mind blown";
  }
}

/* ------------------------------ Stages ------------------------------ */

function QuestionStage({
  question,
  selectedOptionId,
  submissionState,
  resolvedOptionStates,
  onSelect,
  onSubmit,
  onErrorRetry,
}: ChallengeSheetProps) {
  const isSubmitted = submissionState === "submitted";
  const isSubmitting = submissionState === "submitting";
  const isError = submissionState === "error";
  const canSubmit = !!selectedOptionId && !isSubmitted && !isSubmitting;

  const optionState = (id: string): AnswerState => {
    if (isSubmitted && resolvedOptionStates) {
      const r = resolvedOptionStates[id];
      if (r === "correct") return "correct";
      if (r === "incorrect") return "incorrect";
      return "disabled";
    }
    if (selectedOptionId === id) return "selected";
    return "idle";
  };

  return (
    <>
      <div role="radiogroup" aria-labelledby="challenge-question" className="flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const isChecked = selectedOptionId === opt.id;
          const disabled = isSubmitted || isSubmitting;
          return (
            <AnswerOption
              key={opt.id}
              role="radio"
              aria-checked={isChecked}
              tabIndex={disabled ? -1 : isChecked || (!selectedOptionId && i === 0) ? 0 : -1}
              marker={MARKERS[i]}
              label={opt.label}
              state={optionState(opt.id)}
              disabled={disabled}
              onClick={() => !disabled && onSelect(opt.id)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  onSelect(question.options[(i + 1) % question.options.length].id);
                } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  onSelect(
                    question.options[(i - 1 + question.options.length) % question.options.length]
                      .id,
                  );
                }
              }}
            />
          );
        })}
      </div>

      {isError ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-misconception/40 bg-misconception/10 px-3.5 py-3 text-[13px] text-foreground/90"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-misconception" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Couldn't check your answer</p>
            <p className="text-foreground/70">You may be offline. Try again in a moment.</p>
          </div>
          {onErrorRetry ? (
            <button
              type="button"
              onClick={onErrorRetry}
              className="min-h-11 rounded-full bg-white/10 px-3 text-[12px] font-medium text-foreground hover:bg-white/15"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          aria-live="polite"
          className={cn(
            "relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
            "font-medium text-primary-foreground transition-swift",
            "gradient-brand shadow-glow",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            "active:scale-[0.99]",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              <span>Checking…</span>
            </>
          ) : (
            <span>Check answer</span>
          )}
        </button>
      </div>
    </>
  );
}

function FeedbackCorrectStage({
  data,
  onContinue,
}: ChallengeSheetProps & { data: CorrectFeedbackData }) {
  return (
    <>
      <CorrectFeedback
        acknowledgement={data.acknowledgement}
        explanation={data.explanation}
        memoryHook={data.memoryHook}
      />
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
          "gradient-brand font-medium text-primary-foreground shadow-glow transition-swift active:scale-[0.99]",
        )}
      >
        See the big idea
      </button>
    </>
  );
}

function FeedbackIncorrectStage({
  data,
  selectedOptionLabel,
  incorrectExplanationVisible,
  onShowIncorrectExplanation,
  onRetry,
  onSkipRetry,
}: ChallengeSheetProps & { data: OptionFeedback }) {
  return (
    <IncorrectFeedback
      acknowledgement={data.acknowledgement}
      misconceptionLabel={data.misconceptionLabel}
      selectedLabel={selectedOptionLabel ?? ""}
      whyUnderstandable={data.whyUnderstandable}
      whyIncorrect={data.whyIncorrect}
      correctStatement={data.correctiveStatement}
      memoryHook={data.memoryHook}
      explanationVisible={incorrectExplanationVisible}
      onShowExplanation={onShowIncorrectExplanation}
      onRetry={onRetry ?? (() => {})}
      onSkipRetry={onSkipRetry}
      retryLabel="Try again"
    />
  );
}

function RetryStage({
  retry,
  retrySelectedOptionId,
  retrySubmissionState,
  retryResolvedOptionStates,
  onRetrySelect,
  onRetrySubmit,
  onContinue,
}: ChallengeSheetProps & { retry: RetryChallenge }) {
  return (
    <RetryQuestion
      supportiveIntro={retry.supportiveIntro}
      prompt={retry.prompt}
      options={retry.options}
      selectedOptionId={retrySelectedOptionId ?? null}
      submissionState={retrySubmissionState ?? "idle"}
      resolvedOptionStates={retryResolvedOptionStates}
      wrapUp={retry.wrapUp}
      onSelect={onRetrySelect ?? (() => {})}
      onSubmit={onRetrySubmit ?? (() => {})}
      onContinue={onContinue ?? (() => {})}
      showPrompt={false}
    />
  );
}

function MindBlownStage({ fact, onContinue }: ChallengeSheetProps & { fact: MindBlownFact }) {
  return (
    <div className="flex flex-col gap-5">
      <MindBlownCard>
        <div className="flex flex-col gap-2">
          <p>{fact.headline}</p>
          {fact.detail ? (
            <p className="text-[14px] font-normal leading-relaxed text-foreground/70">
              {fact.detail}
            </p>
          ) : null}
        </div>
      </MindBlownCard>

      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
          "gradient-brand font-medium text-primary-foreground shadow-glow transition-swift active:scale-[0.99]",
        )}
      >
        Finish concept
      </button>
    </div>
  );
}

function CoachAction({
  onClick,
  disabled,
  hint,
}: {
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  const hintId = React.useId();
  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-describedby={disabled && hint ? hintId : undefined}
        className={cn(
          "flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10",
          "bg-white/[0.03] px-4 text-sm font-medium text-foreground/75 transition-swift",
          "hover:bg-white/[0.07] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45",
        )}
      >
        <Sparkles className="size-4 text-brand-violet" aria-hidden />
        Explain another way
      </button>
      {disabled && hint ? (
        <p id={hintId} className="mt-2 text-center text-xs leading-relaxed text-foreground/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
