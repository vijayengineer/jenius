import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { CompletionOverlay } from "./CompletionOverlay";
import { DailyDiscoveryBadge } from "./DailyDiscoveryBadge";
import { AppShell } from "./AppShell";
import { BottomNavigation, type BottomNavItem, type BottomNavKey } from "./BottomNavigation";
import { FeedTopBar, type FeedMode } from "./FeedTopBar";
import { OfflineBanner } from "./OfflineBanner";
import { ConceptCard } from "./ConceptCard";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ChallengeSheet, type ChallengeStage } from "./ChallengeSheet";
import { ExplainMoreSheet } from "./ExplainMoreSheet";
import type { Concept } from "@/lib/jenius/mockConcepts";
import {
  getOptionLabel,
  resolveChallenge,
  resolveFeedback,
  type ResolvedOptionState,
  type SubmissionState,
} from "@/lib/jenius/challenges";
import { FEED_CONCEPTS, getVerifiedConcept } from "@/content/catalog";
import { CONTENT_CHALLENGES, CONTENT_FEEDBACK } from "@/content/presenter";
import { initialLearningState, learningReducer, toLearningOutcome } from "@/learning/engine";
import { useLearning } from "@/state/LearningProvider";
import { selectProgressStats } from "@/state/selectors";
import {
  EXPLAIN_PACKS,
  mockFreshExplainPack,
  type ExplainPack,
  type ExplainStatus,
} from "@/lib/jenius/explainMore";
import { useOffline } from "@/lib/jenius/offline";
import { Bookmark, Home, Plus, User } from "lucide-react";

const FEED_NAV_ITEMS: BottomNavItem[] = [
  { key: "feed", label: "Feed", icon: Home },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "explore", label: "Create", icon: Plus },
  { key: "profile", label: "Me", icon: User },
];

export interface DiscoverFeedProps {
  concepts?: Concept[];
  offline?: boolean;
  loading?: boolean;
  empty?: boolean;
  initialSaved?: string[];
  activeTab?: BottomNavKey;
  onTabChange?: (key: BottomNavKey) => void;
  /**
   * Force the challenge submission state for preview screens. When set, the
   * feed stays on the question stage with the given state (useful for
   * showcasing loading/error states).
   */
  challengeStateOverride?: SubmissionState;
  /**
   * Force the challenge sheet to a specific stage for preview screens.
   * When set, the feed uses fixture selections so the stage renders with
   * meaningful data.
   */
  stageOverride?: ChallengeStage;
  /** Concept id to preview stageOverride against. Defaults to first concept. */
  previewConceptId?: string;
}

/**
 * DiscoverFeed — mobile-first vertical snap feed with an attached
 * challenge → feedback → retry → mind-blown sheet flow.
 *
 * The sheet flow is a small state machine driven by `stage`. All
 * correctness decisions happen here (via the mock `resolve*` helpers) and
 * are passed into the sheet as resolved data — the sheet stays a pure
 * presenter.
 */
export function DiscoverFeed({
  concepts = FEED_CONCEPTS,
  offline,
  loading = false,
  empty = false,
  initialSaved,
  activeTab = "feed",
  onTabChange,
  challengeStateOverride,
  stageOverride,
  previewConceptId,
}: DiscoverFeedProps) {
  const ctx = useOffline();
  const learningStore = useLearning();
  const progress = selectProgressStats(learningStore.state);
  const [learning, dispatchLearning] = React.useReducer(learningReducer, initialLearningState);
  // Prop wins when explicitly passed (state-preview harness); otherwise fall
  // back to the app-wide mock offline context.
  const isOffline = offline ?? !ctx.online;
  const [mode, setMode] = React.useState<FeedMode>("discover");
  const [muted, setMuted] = React.useState(true);
  const [saved, setSaved] = React.useState<Set<string>>(
    () => new Set(initialSaved ?? concepts.filter((c) => c.saved).map((c) => c.id)),
  );
  React.useEffect(() => {
    if (!learningStore.hydrated || initialSaved) return;
    setSaved(new Set(Object.keys(learningStore.state.savedConcepts)));
  }, [initialSaved, learningStore.hydrated, learningStore.state.savedConcepts]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [completionConceptId, setCompletionConceptId] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const handleTabChange = (key: BottomNavKey) => {
    if (onTabChange) return onTabChange(key);
    if (key === "feed") navigate({ to: "/" });
    else if (key === "saved") navigate({ to: "/saved" });
    else if (key === "explore") navigate({ to: "/create" });
    else if (key === "profile") navigate({ to: "/me" });
  };

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<Array<HTMLElement | null>>([]);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = cardRefs.current.findIndex((el) => el === visible.target);
        if (idx >= 0) setActiveIndex(idx);
      },
      { root: scroller, threshold: [0.55, 0.75] },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [concepts.length, empty, loading]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    learningStore.toggleSaved(id);
  };

  const scrollToIndex = (idx: number) => {
    const el = cardRefs.current[idx];
    if (el && scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  // ---------------- Challenge sheet state machine ----------------
  const [challengeConceptId, setChallengeConceptId] = React.useState<string | null>(null);
  const [stage, setStage] = React.useState<ChallengeStage>("question");

  // Initial question state
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [submissionState, setSubmissionState] = React.useState<SubmissionState>("idle");
  const [resolvedOptionStates, setResolvedOptionStates] = React.useState<
    Record<string, ResolvedOptionState> | undefined
  >();

  // Retry state
  const [retrySelectedId, setRetrySelectedId] = React.useState<string | null>(null);
  const [retrySubmission, setRetrySubmission] = React.useState<SubmissionState>("idle");
  const [retryResolved, setRetryResolved] = React.useState<
    Record<string, ResolvedOptionState> | undefined
  >();

  const effectiveSubmissionState = challengeStateOverride ?? submissionState;

  // Handle preview overrides — inject fixture selections so previewed stages have data.
  React.useEffect(() => {
    if (!stageOverride) return;
    const conceptId = previewConceptId ?? concepts[0]?.id;
    if (!conceptId) return;
    const challenge = CONTENT_CHALLENGES[conceptId];
    if (!challenge) return;
    setChallengeConceptId(conceptId);
    setStage(stageOverride);
    if (stageOverride === "feedback-correct" || stageOverride === "mind-blown") {
      setSelectedOptionId(challenge.correctOptionId);
      setResolvedOptionStates(resolveChallenge(challenge, challenge.correctOptionId));
      setSubmissionState("submitted");
    } else if (stageOverride === "feedback-incorrect") {
      const wrong = challenge.options.find((o) => o.id !== challenge.correctOptionId);
      if (wrong) {
        setSelectedOptionId(wrong.id);
        setResolvedOptionStates(resolveChallenge(challenge, wrong.id));
        setSubmissionState("submitted");
      }
    } else if (stageOverride === "retry") {
      const wrong = challenge.options.find((o) => o.id !== challenge.correctOptionId);
      if (wrong) {
        setSelectedOptionId(wrong.id);
        setResolvedOptionStates(resolveChallenge(challenge, wrong.id));
        setSubmissionState("submitted");
      }
      setRetrySelectedId(null);
      setRetrySubmission("idle");
      setRetryResolved(undefined);
    }
  }, [stageOverride, previewConceptId, concepts]);

  const activeChallengeConcept = challengeConceptId
    ? (concepts.find((c) => c.id === challengeConceptId) ?? null)
    : null;
  const activeChallenge = challengeConceptId ? CONTENT_CHALLENGES[challengeConceptId] : undefined;
  const activeFeedback = challengeConceptId ? CONTENT_FEEDBACK[challengeConceptId] : undefined;

  const openChallenge = (conceptId: string) => {
    if (
      learning.conceptId === conceptId &&
      learning.phase !== "viewing" &&
      learning.phase !== "completed"
    ) {
      setChallengeConceptId(conceptId);
      dispatchLearning({ type: "REOPEN_PANEL" });
      return;
    }
    setChallengeConceptId(conceptId);
    dispatchLearning({ type: "OPEN_CONCEPT", conceptId });
    setStage("question");
    setSelectedOptionId(null);
    setSubmissionState("idle");
    setResolvedOptionStates(undefined);
    setRetrySelectedId(null);
    setRetrySubmission("idle");
    setRetryResolved(undefined);
  };

  const closeChallenge = () => {
    if (stageOverride) return; // stay pinned in preview mode
    setChallengeConceptId(null);
    dispatchLearning({ type: "CLOSE_PANEL" });
  };

  const submitChallenge = () => {
    if (!activeChallenge || !activeFeedback || !selectedOptionId) return;
    setSubmissionState("submitting");
    window.setTimeout(() => {
      const resolved = resolveChallenge(activeChallenge, selectedOptionId);
      setResolvedOptionStates(resolved);
      setSubmissionState("submitted");
      // Advance stage based on correctness.
      const fb = resolveFeedback(activeChallenge, activeFeedback, selectedOptionId);
      setStage(fb.kind === "correct" ? "feedback-correct" : "feedback-incorrect");
      const concept = getVerifiedConcept(activeChallenge.conceptId);
      if (concept) {
        dispatchLearning({ type: "SUBMIT_ANSWER", concept });
        learningStore.recordAttempt({
          conceptId: concept.id,
          kind: "primary",
          optionId: selectedOptionId,
          correct: fb.kind === "correct",
        });
      }
    }, 650);
  };

  const submitRetry = () => {
    if (!activeFeedback || !retrySelectedId) return;
    setRetrySubmission("submitting");
    window.setTimeout(() => {
      const retry = activeFeedback.retry;
      const out: Record<string, ResolvedOptionState> = {};
      for (const opt of retry.options) {
        if (opt.id === retry.correctOptionId) out[opt.id] = "correct";
        else if (opt.id === retrySelectedId) out[opt.id] = "incorrect";
        else out[opt.id] = "locked";
      }
      setRetryResolved(out);
      setRetrySubmission("submitted");
      const concept = challengeConceptId ? getVerifiedConcept(challengeConceptId) : undefined;
      if (concept) {
        dispatchLearning({ type: "SUBMIT_RETRY", concept });
        learningStore.recordAttempt({
          conceptId: concept.id,
          kind: "retry",
          optionId: retrySelectedId,
          correct: retrySelectedId === retry.correctOptionId,
        });
      }
    }, 500);
  };

  // ---------------- Explain more sheet state ----------------
  const [explainConceptId, setExplainConceptId] = React.useState<string | null>(null);
  const [explainStatus, setExplainStatus] = React.useState<ExplainStatus>("available");
  const [explainPack, setExplainPack] = React.useState<ExplainPack | undefined>();

  const explainConcept = explainConceptId
    ? (concepts.find((c) => c.id === explainConceptId) ?? null)
    : null;

  const openExplain = (conceptId: string) => {
    const cached = EXPLAIN_PACKS[conceptId];
    setExplainConceptId(conceptId);
    if (isOffline) {
      if (cached) {
        setExplainStatus("cached");
        setExplainPack(cached);
      } else {
        setExplainStatus("offline-unavailable");
        setExplainPack(undefined);
      }
      return;
    }
    setExplainStatus("available");
    setExplainPack(undefined);
  };

  const fetchExplain = () => {
    if (!explainConcept) return;
    setExplainStatus("loading");
    window.setTimeout(() => {
      setExplainPack(mockFreshExplainPack(explainConcept.id, explainConcept.hook));
      setExplainStatus("success");
    }, 700);
  };

  const closeExplain = () => setExplainConceptId(null);

  const advanceToNextConcept = () => {
    const currentIdx = activeChallengeConcept
      ? concepts.findIndex((c) => c.id === activeChallengeConcept.id)
      : -1;
    const completedId = activeChallengeConcept?.id ?? null;
    if (completedId) {
      const concept = getVerifiedConcept(completedId);
      if (concept) {
        const primaryCorrect = selectedOptionId === activeChallenge?.correctOptionId;
        const retryCorrect =
          retrySelectedId === activeFeedback?.retry.correctOptionId
            ? true
            : retrySelectedId
              ? false
              : null;
        const misconceptionId =
          concept.primaryQuestion.options.find((option) => option.id === selectedOptionId)
            ?.misconceptionId ?? null;
        const completionState = learningReducer(
          {
            ...learning,
            conceptId: completedId,
            phase: "mind-blown",
            primaryCorrect,
            retryCorrect,
            selectedMisconceptionId: misconceptionId,
          },
          { type: "COMPLETE" },
        );
        const outcome = toLearningOutcome(completionState);
        if (outcome) learningStore.complete(outcome);
        dispatchLearning({ type: "COMPLETE" });
      }
    }
    closeChallenge();
    if (completedId) {
      setCompletionConceptId(completedId);
      window.setTimeout(() => {
        setCompletionConceptId((cur) => (cur === completedId ? null : cur));
      }, 4200);
    }
    if (currentIdx >= 0 && currentIdx < concepts.length - 1) {
      window.setTimeout(() => scrollToIndex(currentIdx + 1), 220);
    }
  };

  const totalStops = empty ? 0 : concepts.length + 1;

  const selectedOptionLabel =
    activeChallenge && selectedOptionId ? getOptionLabel(activeChallenge, selectedOptionId) : "";

  const incorrectFeedbackForSelection =
    activeChallenge && activeFeedback && selectedOptionId
      ? activeFeedback.incorrect[selectedOptionId]
      : undefined;

  return (
    <AppShell
      contained
      header={
        <div className="relative">
          <FeedTopBar
            mode={mode}
            onModeChange={setMode}
            muted={muted}
            onToggleMuted={() => setMuted((m) => !m)}
          />
          <div className="pointer-events-none absolute right-4 top-3 z-10">
            <DailyDiscoveryBadge progress={progress.dailyProgress} target={progress.dailyTarget} />
          </div>
          {isOffline ? <OfflineBanner /> : null}
          {totalStops > 1 ? <FeedDots total={totalStops} active={activeIndex} /> : null}
        </div>
      }
      footer={
        <BottomNavigation items={FEED_NAV_ITEMS} active={activeTab} onSelect={handleTabChange} />
      }
    >
      {empty ? (
        <div className="grid h-[100dvh] place-items-center px-6">
          <EmptyState
            title="No concepts yet"
            description="New ideas are being prepared for your feed. Check back soon."
          />
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className={cn(
            "h-[100dvh] w-full snap-y snap-mandatory overflow-y-auto overflow-x-hidden",
            "scroll-smooth no-scrollbar overscroll-y-contain",
            "-mt-[calc(env(safe-area-inset-top)+0px)]",
          )}
          style={{ scrollSnapType: "y mandatory" }}
        >
          {concepts.map((concept, i) => {
            const explainCached = !!EXPLAIN_PACKS[concept.id];
            const explainDisabled = isOffline && !explainCached;
            return (
              <ConceptCard
                key={concept.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                concept={concept}
                saved={saved.has(concept.id)}
                onSave={() => toggleSave(concept.id)}
                onGotIt={() => openChallenge(concept.id)}
                onExplainMore={() => openExplain(concept.id)}
                explainDisabled={explainDisabled}
                explainHint={explainDisabled ? "Not saved for offline yet." : undefined}
                muted={muted}
                showSwipeCue={i === 0}
              />
            );
          })}

          {loading ? (
            <section
              ref={(el) => {
                cardRefs.current[concepts.length] = el;
              }}
              className="grid h-[100dvh] snap-start place-items-center"
            >
              <LoadingState label="Loading next concept…" />
            </section>
          ) : (
            <EndOfFeedCard
              ref={(el) => {
                cardRefs.current[concepts.length] = el;
              }}
              onLoop={() => scrollToIndex(0)}
            />
          )}
        </div>
      )}

      {activeChallenge && activeChallengeConcept && activeFeedback ? (
        <ChallengeSheet
          open={!!challengeConceptId}
          onOpenChange={(o) => {
            if (!o) closeChallenge();
          }}
          subject={activeChallengeConcept.subject}
          conceptReminder={activeChallengeConcept.hook}
          stage={stage}
          question={activeChallenge}
          selectedOptionId={selectedOptionId}
          submissionState={effectiveSubmissionState}
          resolvedOptionStates={resolvedOptionStates}
          onSelect={(optionId) => {
            setSelectedOptionId(optionId);
            dispatchLearning({ type: "SELECT_ANSWER", optionId });
          }}
          onSubmit={submitChallenge}
          correctFeedback={activeFeedback.correct}
          incorrectFeedback={incorrectFeedbackForSelection}
          selectedOptionLabel={selectedOptionLabel}
          onRetry={() => {
            setStage("retry");
            dispatchLearning({ type: "START_RETRY" });
            setRetrySelectedId(null);
            setRetrySubmission("idle");
            setRetryResolved(undefined);
          }}
          onSkipRetry={() => {
            setStage("mind-blown");
            dispatchLearning({ type: "SKIP_RETRY" });
          }}
          retryChallenge={activeFeedback.retry}
          retrySelectedOptionId={retrySelectedId}
          retrySubmissionState={retrySubmission}
          retryResolvedOptionStates={retryResolved}
          onRetrySelect={(optionId) => {
            setRetrySelectedId(optionId);
            dispatchLearning({ type: "SELECT_RETRY", optionId });
          }}
          onRetrySubmit={submitRetry}
          mindBlown={activeFeedback.mindBlown}
          saved={activeChallengeConcept ? saved.has(activeChallengeConcept.id) : false}
          onToggleSave={() => activeChallengeConcept && toggleSave(activeChallengeConcept.id)}
          onShare={() => {
            // Real sharing wired up in a later prompt.
          }}
          onContinue={() => {
            if (stage === "mind-blown") advanceToNextConcept();
            else {
              setStage("mind-blown");
              dispatchLearning({ type: "CONTINUE" });
            }
          }}
          onClose={closeChallenge}
          onErrorRetry={submitChallenge}
        />
      ) : null}

      <CompletionOverlay
        open={!!completionConceptId}
        message="Another idea understood."
        saved={completionConceptId ? saved.has(completionConceptId) : false}
        onKeepSwiping={() => setCompletionConceptId(null)}
        onSave={completionConceptId ? () => toggleSave(completionConceptId) : undefined}
        onDismiss={() => setCompletionConceptId(null)}
      />

      {explainConcept ? (
        <ExplainMoreSheet
          open={!!explainConceptId}
          onOpenChange={(o) => {
            if (!o) closeExplain();
          }}
          subject={explainConcept.subject}
          conceptHook={explainConcept.hook}
          status={explainStatus}
          pack={explainPack}
          onRetry={fetchExplain}
          onClose={closeExplain}
        />
      ) : null}
    </AppShell>
  );
}

interface FeedDotsProps {
  total: number;
  active: number;
}

function FeedDots({ total, active }: FeedDotsProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center gap-1.5"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 rounded-full transition-swift",
            i === active ? "w-5 bg-foreground/85" : "w-1 bg-foreground/25",
          )}
        />
      ))}
    </div>
  );
}

interface EndOfFeedCardProps {
  onLoop: () => void;
}

const EndOfFeedCard = React.forwardRef<HTMLElement, EndOfFeedCardProps>(({ onLoop }, ref) => {
  return (
    <section
      ref={ref}
      aria-label="End of sample feed"
      className={cn(
        "relative flex h-[100dvh] w-full snap-start snap-always flex-col items-center justify-center gap-4 px-8 text-center",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{ background: "var(--gradient-brand-soft)" }}
      />
      <span className="text-xs uppercase tracking-[0.22em] text-foreground/60">
        You're all caught up
      </span>
      <h2 className="gradient-text font-display text-[30px] font-semibold leading-tight">
        End of the sample feed
      </h2>
      <p className="max-w-[28ch] text-[15px] text-foreground/75">
        In the full app, new concepts arrive here forever. For now, loop back to the start.
      </p>
      <button
        type="button"
        onClick={onLoop}
        className="mt-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-foreground transition-swift hover:bg-white/15 active:scale-[0.98]"
      >
        Restart feed
      </button>
    </section>
  );
});
EndOfFeedCard.displayName = "EndOfFeedCard";
