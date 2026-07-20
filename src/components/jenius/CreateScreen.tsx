import * as React from "react";
import { AlertCircle, Check, ChevronDown, Loader2, Sparkles, Trash2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { JeniusMark } from "./JeniusMark";
import { SubjectChip } from "./SubjectChip";
import { MisconceptionCard } from "./MisconceptionCard";
import { MindBlownCard } from "./MindBlownCard";
import { AnswerOption, type AnswerState } from "./AnswerOption";
import {
  EMPTY_CREATE_FORM,
  GENERATION_STEPS,
  LEARNING_GOALS,
  LENGTH_CHOICES,
  READING_LEVELS,
  SUBJECT_CHOICES,
  isFormReady,
  type CreateFormValues,
  type GeneratedConceptPack,
  type GenerationStatus,
} from "@/lib/jenius/generatedPack";

export interface CreateScreenProps {
  /** API-boundary callback called when the learner submits a valid request. */
  onGenerate?: (values: CreateFormValues) => void;
  /** Driven by the caller; the screen renders whichever state you pass. */
  generationStatus?: GenerationStatus;
  /** When present, the draft preview replaces the form. */
  generatedPack?: GeneratedConceptPack | null;
  onSave?: (pack: GeneratedConceptPack) => void;
  onDelete?: (pack: GeneratedConceptPack) => void;
  online?: boolean;
  /** Optional user-facing message paired with error statuses. */
  error?: string;
  /** For preview screens: fixture form values. */
  initialValues?: CreateFormValues;
  /** Local-only mode stores a request and never pretends a pack was generated. */
  localOnly?: boolean;
  requestStored?: boolean;
}

/**
 * CreateScreen — presenter for local topic requests and future API-driven
 * generation. It never manufactures a successful pack.
 */
export function CreateScreen({
  onGenerate,
  generationStatus: externalStatus,
  generatedPack: externalPack,
  onSave,
  onDelete,
  online = true,
  error,
  initialValues,
  localOnly = false,
  requestStored = false,
}: CreateScreenProps) {
  const [values, setValues] = React.useState<CreateFormValues>(initialValues ?? EMPTY_CREATE_FORM);
  const [selectedChallengeOption, setSelectedChallengeOption] = React.useState<string | null>(null);
  const [showChallengeResult, setShowChallengeResult] = React.useState(false);

  const status = externalStatus ?? (isFormReady(values) ? "ready" : "disabled");
  const pack = externalPack ?? null;

  const update = <K extends keyof CreateFormValues>(key: K, v: CreateFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleGenerate = () => onGenerate?.(values);

  const clearDraft = () => {
    if (onDelete && pack) {
      onDelete(pack);
      return;
    }
    setSelectedChallengeOption(null);
    setShowChallengeResult(false);
  };

  const isGenerating = status === "generating" || status === "submitting";

  return (
    <div className="flex flex-col gap-5 px-5 pb-24 pt-4">
      <header className="flex items-center gap-3">
        <JeniusMark size={28} />
        <div className="min-w-0">
          <h1 className="font-display text-[26px] font-semibold leading-none tracking-tight">
            Teach me anything
          </h1>
          <p className="mt-1.5 text-[13px] text-foreground/60">
            Turn a topic into a short Jenius learning sequence.
          </p>
        </div>
      </header>

      {!online ? (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-foreground/75">
          <WifiOff className="size-3.5" aria-hidden />
          {localOnly
            ? "You're offline. Topic requests can still be saved on this device."
            : "You're offline. Drafts can't be generated until you're back on."}
        </div>
      ) : null}

      {pack ? (
        <GeneratedDraftPreview
          pack={pack}
          selectedOptionId={selectedChallengeOption}
          showResult={showChallengeResult}
          onSelect={(id) => {
            setSelectedChallengeOption(id);
            setShowChallengeResult(false);
          }}
          onCheck={() => setShowChallengeResult(true)}
          onSave={() => onSave?.(pack)}
          onDelete={clearDraft}
        />
      ) : isGenerating ? (
        <GenerationProgress status={status} />
      ) : (
        <>
          <CreateForm values={values} onChange={update} disabled={isGenerating} />

          <Notice localOnly={localOnly} />

          {requestStored ? (
            <div
              role="status"
              className="rounded-2xl border border-success/30 bg-success/10 px-3.5 py-3 text-[13px] text-foreground/90"
            >
              Topic saved on this device. Remote generation is not enabled yet.
            </div>
          ) : null}

          {(status === "rate-limit" || status === "network-error" || status === "offline") && (
            <ErrorNotice status={status} message={error} />
          )}

          <GenerateButton
            status={status}
            onClick={handleGenerate}
            localOnly={localOnly}
            available={!!onGenerate}
          />
        </>
      )}
    </div>
  );
}

/* --------------------------- Notice ------------------------------ */

function Notice({ localOnly }: { localOnly: boolean }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-brand-blue/25 bg-brand-blue/10 px-3.5 py-3 text-[12px] leading-relaxed text-foreground/85">
      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-blue" aria-hidden />
      <p>
        {localOnly
          ? "This release stores your topic request locally. It does not generate or claim a completed lesson."
          : "Personal concepts are AI-generated drafts and remain separate from Jenius's verified feed."}
      </p>
    </div>
  );
}

/* --------------------------- Form -------------------------------- */

export interface CreateFormProps {
  values: CreateFormValues;
  onChange: <K extends keyof CreateFormValues>(key: K, v: CreateFormValues[K]) => void;
  disabled?: boolean;
}

export function CreateForm({ values, onChange, disabled }: CreateFormProps) {
  return (
    <div className={cn("flex flex-col gap-4", disabled && "opacity-60 pointer-events-none")}>
      <Field label="Topic" required>
        <input
          type="text"
          value={values.topic}
          onChange={(e) => onChange("topic", e.target.value)}
          placeholder="Black holes, photosynthesis, tectonic plates…"
          maxLength={80}
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-[14px] text-foreground placeholder:text-foreground/45 focus:border-brand-blue/60 focus:outline-none"
        />
      </Field>

      <Field label="Subject" required>
        <Select
          value={values.subject}
          onChange={(v) => onChange("subject", v as CreateFormValues["subject"])}
          placeholder="Pick a subject"
          options={SUBJECT_CHOICES.map((s) => ({ id: s.id, label: s.label }))}
        />
      </Field>

      <Field label="Reading level" required>
        <SegmentedControl
          value={values.readingLevel}
          onChange={(v) => onChange("readingLevel", v as CreateFormValues["readingLevel"])}
          options={READING_LEVELS}
        />
      </Field>

      <Field label="Length" required>
        <div className="grid grid-cols-2 gap-2">
          {LENGTH_CHOICES.map((c) => {
            const active = values.length === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange("length", c.id)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-swift",
                  active
                    ? "border-brand-blue/60 bg-brand-blue/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <span className="text-[14px] font-semibold text-foreground">{c.label}</span>
                <span className="text-[12px] text-foreground/60">{c.hint}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Learning goal (optional)">
        <Select
          value={values.goal}
          onChange={(v) => onChange("goal", v as CreateFormValues["goal"])}
          placeholder="No specific goal"
          options={LEARNING_GOALS.filter((g) => g.id !== "").map((g) => ({
            id: g.id,
            label: g.label,
          }))}
          allowEmpty
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
        {label}
        {required ? <span className="text-brand-blue"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  allowEmpty,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ id: T; label: string }>;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "h-11 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 pr-9 text-[14px] text-foreground",
          "focus:border-brand-blue/60 focus:outline-none",
        )}
      >
        {(allowEmpty || value === "") && (
          <option value="" className="bg-background">
            {placeholder ?? "Select…"}
          </option>
        )}
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-background">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50"
      />
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ id: T; label: string }>;
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white/[0.04] p-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "h-9 rounded-xl text-[12px] font-medium transition-swift",
              active
                ? "bg-white/15 text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------ Generate button ------------------------- */

function GenerateButton({
  status,
  onClick,
  localOnly,
  available,
}: {
  status: GenerationStatus;
  onClick: () => void;
  localOnly: boolean;
  available: boolean;
}) {
  const disabled =
    !available ||
    status === "disabled" ||
    status === "submitting" ||
    status === "generating" ||
    (status === "offline" && !localOnly);
  const label =
    status === "submitting"
      ? "Sending…"
      : status === "generating"
        ? "Generating…"
        : status === "success"
          ? "Regenerate"
          : localOnly
            ? "Save topic request"
            : "Generate concept";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl",
        "gradient-brand font-medium text-primary-foreground shadow-glow transition-swift",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        "active:scale-[0.99]",
      )}
    >
      {(status === "submitting" || status === "generating") && (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      )}
      <span>{label}</span>
    </button>
  );
}

/* ------------------------ Error notice ---------------------------- */

function ErrorNotice({ status, message }: { status: GenerationStatus; message?: string }) {
  const copy = {
    "rate-limit": {
      title: "Slow down a moment",
      body: message ?? "You've generated a few drafts recently. Try again in a minute.",
    },
    "network-error": {
      title: "Couldn't reach the generator",
      body: message ?? "Check your connection and try again.",
    },
    offline: {
      title: "You're offline",
      body: message ?? "Reconnect to generate a new draft.",
    },
  } as const;
  const c = copy[status as "rate-limit" | "network-error" | "offline"];
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-misconception/40 bg-misconception/10 px-3.5 py-3 text-[13px] text-foreground/90"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-misconception" aria-hidden />
      <div>
        <p className="font-medium">{c.title}</p>
        <p className="text-foreground/75">{c.body}</p>
      </div>
    </div>
  );
}

/* ------------------- Generation progress -------------------------- */

export interface GenerationProgressProps {
  status: GenerationStatus;
  /** Optional override to force a step for previews (0-based). */
  activeStepIndex?: number;
}

export function GenerationProgress({ status, activeStepIndex }: GenerationProgressProps) {
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (activeStepIndex !== undefined) return;
    if (status !== "generating") return;
    setStep(0);
    const totalMs = 2400;
    const perStep = totalMs / GENERATION_STEPS.length;
    const timers: number[] = [];
    for (let i = 1; i < GENERATION_STEPS.length; i++) {
      timers.push(window.setTimeout(() => setStep(i), perStep * i));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [status, activeStepIndex]);

  const activeIdx = activeStepIndex ?? step;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 animate-spin text-brand-blue" aria-hidden />
        <p className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
          Preparing your draft
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {GENERATION_STEPS.map((s, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          return (
            <li key={s.id} className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "grid size-6 place-items-center rounded-full text-[11px] font-semibold",
                  state === "done" && "bg-success/20 text-success",
                  state === "active" && "bg-brand-blue/25 text-brand-blue",
                  state === "pending" && "bg-white/6 text-foreground/50",
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[14px]",
                  state === "pending" ? "text-foreground/50" : "text-foreground/90",
                  state === "active" && "font-medium",
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-[11px] text-foreground/50">
        Preview mode — no live generation is running.
      </p>
    </div>
  );
}

/* --------------------- Generated draft preview -------------------- */

export interface GeneratedDraftPreviewProps {
  pack: GeneratedConceptPack;
  selectedOptionId: string | null;
  showResult: boolean;
  onSelect: (id: string) => void;
  onCheck: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function GeneratedDraftPreview({
  pack,
  selectedOptionId,
  showResult,
  onSelect,
  onCheck,
  onSave,
  onDelete,
}: GeneratedDraftPreviewProps) {
  const optionState = (id: string): AnswerState => {
    if (!showResult) return selectedOptionId === id ? "selected" : "idle";
    if (id === pack.challenge.correctOptionId) return "correct";
    if (id === selectedOptionId) return "incorrect";
    return "disabled";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SubjectChip subject={pack.subject} size="sm" label={pack.categoryLabel} />
          <span className="rounded-full bg-brand-violet/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-violet">
            AI-generated draft
          </span>
        </div>
        <span className="text-[11px] text-foreground/50">{pack.createdAtLabel}</span>
      </div>

      <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-display text-[24px] font-semibold leading-tight tracking-tight text-foreground">
          {pack.hook}
        </h2>
        <p className="text-[15px] leading-relaxed text-foreground/85">{pack.explanation}</p>
      </section>

      <section
        aria-label="Draft challenge"
        className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
          Quick check
        </div>
        <h3 className="font-display text-[17px] font-semibold leading-snug text-foreground">
          {pack.challenge.prompt}
        </h3>
        <div className="mt-1 flex flex-col gap-2">
          {pack.challenge.options.map((opt, i) => (
            <AnswerOption
              key={opt.id}
              marker={["A", "B", "C", "D"][i]}
              label={opt.label}
              state={optionState(opt.id)}
              onClick={() => !showResult && onSelect(opt.id)}
              disabled={showResult}
            />
          ))}
        </div>
        {!showResult ? (
          <button
            type="button"
            onClick={onCheck}
            disabled={!selectedOptionId}
            className={cn(
              "mt-2 inline-flex h-11 w-full items-center justify-center rounded-2xl",
              "gradient-brand text-[13px] font-medium text-primary-foreground shadow-glow transition-swift",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
              "active:scale-[0.99]",
            )}
          >
            Check answer
          </button>
        ) : null}
      </section>

      <MisconceptionCard
        misconception={pack.misconception.label}
        correction={pack.misconception.correction}
      />

      <MindBlownCard>
        <div className="flex flex-col gap-2">
          <p>{pack.mindBlown.headline}</p>
          {pack.mindBlown.detail ? (
            <p className="text-[14px] font-normal leading-relaxed text-foreground/70">
              {pack.mindBlown.detail}
            </p>
          ) : null}
        </div>
      </MindBlownCard>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-[13px] font-medium text-foreground/90 transition-swift hover:bg-white/[0.08]"
        >
          Save offline
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-misconception/30 bg-misconception/10 px-4 text-[13px] font-medium text-misconception transition-swift hover:bg-misconception/20"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete draft
        </button>
      </div>

      <p className="text-center text-[11px] text-foreground/50">
        Drafts live only on this device until they're reviewed for the verified feed.
      </p>
    </div>
  );
}
