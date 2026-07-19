import * as React from "react";
import { Loader2, Lightbulb, AlertTriangle, HardDriveDownload, Clock, ShieldAlert, CloudOff } from "lucide-react";
import { Sheet, SheetContent } from "./Sheet";
import { SubjectChip } from "./SubjectChip";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { cn } from "@/lib/utils";
import type { SubjectId } from "@/lib/jenius/types";
import type { ExplainPack, ExplainStatus } from "@/lib/jenius/explainMore";

export interface ExplainMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectId;
  conceptHook: string;
  status: ExplainStatus;
  pack?: ExplainPack;
  onRetry?: () => void;
  onClose?: () => void;
}

/**
 * ExplainMoreSheet — presentational sheet for the "Explain more" action.
 *
 * The component never decides state. It renders whichever status the
 * demo controller chose:
 *
 *  - available            — invitation to fetch a fresh explanation.
 *  - loading              — spinner + status text.
 *  - success              — new alternative / analogy / check-question.
 *  - cached               — same shape as success with a "From cache" flag.
 *  - offline-unavailable  — offline + no cache for this concept.
 *  - timeout / server-error / rate-limited — polite retry surfaces.
 */
export function ExplainMoreSheet({
  open,
  onOpenChange,
  subject,
  conceptHook,
  status,
  pack,
  onRetry,
  onClose,
}: ExplainMoreSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Explain more" description={conceptHook}>
        <div className="mb-4 flex items-center gap-2">
          <SubjectChip subject={subject} size="sm" />
          <span className="text-xs uppercase tracking-wider text-foreground/60">
            Alternative explanation
          </span>
        </div>

        <div aria-live="polite">
          {status === "loading" ? <LoadingBlock /> : null}

          {(status === "success" || status === "cached") && pack ? (
            <SuccessBlock pack={pack} cached={status === "cached" || !!pack.fromCache} />
          ) : null}

          {status === "available" ? (
            <AvailableBlock hook={conceptHook} onRetry={onRetry} />
          ) : null}

          {status === "offline-unavailable" ? (
            <ErrorBlock
              icon={<CloudOff className="size-5" />}
              title="Not saved for offline"
              body="This explanation hasn't been cached on your device yet. Come back online to fetch it."
            />
          ) : null}

          {status === "timeout" ? (
            <ErrorBlock
              icon={<Clock className="size-5" />}
              title="That took too long"
              body="The explain request timed out. It happens — give it another go."
              onRetry={onRetry}
            />
          ) : null}

          {status === "server-error" ? (
            <ErrorBlock
              icon={<AlertTriangle className="size-5" />}
              title="Explain service unavailable"
              body="Our explanation service is having a bad moment. Try again in a bit."
              onRetry={onRetry}
            />
          ) : null}

          {status === "rate-limited" ? (
            <ErrorBlock
              icon={<ShieldAlert className="size-5" />}
              title="Give us a breath"
              body="You've asked for a lot of explanations quickly. Try again in a minute."
            />
          ) : null}
        </div>

        <div className="mt-6 flex gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">
            Close
          </SecondaryButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LoadingBlock() {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4" role="status">
      <Loader2 className="size-5 animate-spin text-brand-blue" aria-hidden />
      <span className="text-sm text-foreground/85">Rewriting this explanation for you…</span>
    </div>
  );
}

function AvailableBlock({ hook, onRetry }: { hook: string; onRetry?: () => void }) {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-brand-violet" aria-hidden />
        <span className="text-sm font-medium">Want another angle?</span>
      </div>
      <p className="text-sm text-foreground/80">
        We can rewrite “{hook}” with a fresh analogy and a quick self-check.
      </p>
      <PrimaryButton onClick={onRetry}>Fetch alternative</PrimaryButton>
    </div>
  );
}

function SuccessBlock({ pack, cached }: { pack: ExplainPack; cached?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {cached ? (
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-foreground/75">
          <HardDriveDownload className="size-3.5 text-brand-blue" aria-hidden />
          Saved on this device
        </div>
      ) : null}

      <Card label="Alternative">
        <p className="text-[15px] leading-relaxed text-foreground/90">{pack.alternative}</p>
      </Card>

      <Card label="Analogy">
        <p className="text-[15px] leading-relaxed text-foreground/85">{pack.analogy}</p>
      </Card>

      <Card label="Check yourself">
        <p className="text-[15px] font-medium text-foreground">{pack.check.prompt}</p>
        <p className="mt-1 text-[13px] text-foreground/70">Hint · {pack.check.answerHint}</p>
      </Card>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className={cn("mb-1 text-[11px] uppercase tracking-[0.18em] text-foreground/60")}>{label}</div>
      {children}
    </div>
  );
}

function ErrorBlock({
  icon,
  title,
  body,
  onRetry,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass flex flex-col gap-3 rounded-2xl p-4" role="alert">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-misconception/15 text-misconception">
          {icon}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-sm text-foreground/80">{body}</p>
      {onRetry ? <SecondaryButton onClick={onRetry}>Try again</SecondaryButton> : null}
    </div>
  );
}
