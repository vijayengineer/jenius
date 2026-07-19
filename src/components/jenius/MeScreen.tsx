import * as React from "react";
import { cn } from "@/lib/utils";
import { SUBJECTS, type SubjectId } from "@/lib/jenius/types";
import { JeniusMark } from "./JeniusMark";
import { SubjectChip } from "./SubjectChip";
import {
  MOCK_PROGRESS_ACTIVE,
  type ProgressStats,
} from "@/lib/jenius/progress";
import { Flame, Sparkles } from "lucide-react";

export interface MeScreenProps {
  stats?: ProgressStats;
  /** Learner display name, defaults to "You". */
  name?: string;
}

/**
 * MeScreen — light personal-progress view. Framed around curiosity and
 * discovery, never around accuracy shame. Reuses design tokens throughout.
 */
export function MeScreen({ stats = MOCK_PROGRESS_ACTIVE, name = "You" }: MeScreenProps) {
  const dailyPct = stats.dailyTarget
    ? Math.min(1, stats.dailyProgress / stats.dailyTarget)
    : 0;
  const understandingPct = stats.conceptsExplored
    ? Math.round((stats.conceptsUnderstood / stats.conceptsExplored) * 100)
    : 0;

  const isNewLearner = stats.conceptsExplored === 0;

  return (
    <div className="flex flex-col gap-5 px-5 pb-24 pt-4">
      <header className="flex items-center gap-3">
        <JeniusMark size={28} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[26px] font-semibold tracking-tight leading-none">
            Hi, {name}
          </h1>
          <p className="mt-1 text-[13px] text-foreground/60">
            {isNewLearner ? "Ready when you are." : "Your quiet curiosity dashboard."}
          </p>
        </div>
      </header>

      {/* Today's curiosity + streak */}
      <section
        aria-label="Today's curiosity"
        className="relative overflow-hidden rounded-3xl border border-white/10 p-5"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/70">
              Today's curiosity
            </div>
            <div className="mt-1 font-display text-[24px] font-semibold leading-tight text-foreground">
              {stats.dailyProgress} of {stats.dailyTarget} discoveries
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-foreground">
            <Flame className="size-3.5 text-mind-blown" aria-hidden />
            {stats.streakDays}-day streak
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-foreground/80 transition-swift"
            style={{ width: `${dailyPct * 100}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-3 text-[12px] text-foreground/65">
          {dailyPct >= 1
            ? "You've hit today's curiosity target. Keep going if you feel like it."
            : "A small target — no pressure. Curiosity, not homework."}
        </p>
      </section>

      {/* Core stats grid */}
      <section
        aria-label="Discovery snapshot"
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          label="Discoveries"
          value={stats.conceptsExplored}
          hint="Concepts explored"
        />
        <StatCard
          label="Understanding"
          value={stats.conceptsUnderstood}
          hint={
            stats.conceptsExplored
              ? `${understandingPct}% of explored`
              : "Let's explore some ideas"
          }
        />
        <StatCard
          label="Ideas revisited"
          value={Math.round(stats.retrySuccessRate * 100) + "%"}
          hint="Retry success rate"
        />
        <StatCard
          label="Misconceptions fixed"
          value={stats.recentMisconceptionsFixed.length}
          hint="Recent aha moments"
        />
      </section>

      {/* Weekly heatmap */}
      <section
        aria-label="This week"
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
            This week
          </h2>
          <span className="text-[11px] text-foreground/50">Last 7 days</span>
        </div>
        <WeeklyHeatmap values={stats.weekly} />
      </section>

      {/* Subject balance */}
      {stats.subjectBalance.length ? (
        <section
          aria-label="Subject balance"
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
            Subject balance
          </h2>
          <p className="mt-1 text-[12px] text-foreground/55">
            The mix of ideas you've been exploring.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {stats.subjectBalance.map((row) => {
              const max = Math.max(...stats.subjectBalance.map((r) => r.count));
              const pct = max ? (row.count / max) * 100 : 0;
              return (
                <div key={row.subject} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <SubjectChip subject={row.subject} size="sm" />
                  </div>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-brand-blue/80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[12px] tabular-nums text-foreground/70">
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Recent misconceptions fixed */}
      {stats.recentMisconceptionsFixed.length ? (
        <section
          aria-label="Recent misconceptions fixed"
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-mind-blown" aria-hidden />
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-foreground/70">
              Misconceptions fixed
            </h2>
          </div>
          <ul className="mt-3 flex flex-col gap-3">
            {stats.recentMisconceptionsFixed.map((m) => (
              <li key={m.conceptId} className="rounded-2xl bg-white/[0.03] p-3">
                <p className="text-[13px] font-medium text-foreground/90 line-through decoration-misconception/60">
                  {m.label}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/75">
                  {m.correction}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isNewLearner ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-[13px] text-foreground/70">
          Start swiping the feed to see your discoveries appear here.
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- Sub-components (exported for reuse) ---------------- */

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
        {label}
      </div>
      <div className="mt-2 font-display text-[26px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </div>
      {hint ? (
        <div className="mt-1.5 text-[12px] text-foreground/55">{hint}</div>
      ) : null}
    </div>
  );
}

export interface WeeklyHeatmapProps {
  /** Oldest → newest, length 7. */
  values: number[];
  /** Labels for each column. Defaults to relative day letters. */
  labels?: string[];
}

export function WeeklyHeatmap({
  values,
  labels = ["M", "T", "W", "T", "F", "S", "S"],
}: WeeklyHeatmapProps) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end justify-between gap-2">
      {values.map((v, i) => {
        const intensity = v / max; // 0..1
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              aria-label={`${labels[i]}: ${v} discoveries`}
              className={cn(
                "w-full rounded-lg transition-swift",
                v === 0 && "bg-white/6",
              )}
              style={{
                height: `${28 + intensity * 44}px`,
                background:
                  v === 0
                    ? undefined
                    : `linear-gradient(180deg, oklch(0.7 0.18 260 / ${
                        0.35 + intensity * 0.55
                      }), oklch(0.55 0.2 290 / ${0.4 + intensity * 0.55}))`,
              }}
            />
            <span className="text-[10px] text-foreground/55">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}
