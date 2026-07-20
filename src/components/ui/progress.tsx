"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-white/8", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 gradient-brand transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * SegmentedProgress — TikTok/Stories style progress indicator for the
 * Jenius full-screen card feed. Shows N segments and fills the active one.
 */
export interface SegmentedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  total: number;
  current: number;
  progress?: number; // 0-100 for the active segment
}

const SegmentedProgress = React.forwardRef<HTMLDivElement, SegmentedProgressProps>(
  ({ total, current, progress = 0, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex w-full items-center gap-1.5", className)} {...props}>
      {Array.from({ length: total }).map((_, i) => {
        const fill = i < current ? 100 : i === current ? progress : 0;
        return (
          <div key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full gradient-brand transition-all duration-300 ease-out"
              style={{ width: `${fill}%` }}
            />
          </div>
        );
      })}
    </div>
  ),
);
SegmentedProgress.displayName = "SegmentedProgress";

/** Circular ring progress — for XP, streaks, category mastery */
export interface RingProgressProps extends Omit<React.SVGAttributes<SVGSVGElement>, "stroke"> {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

const RingProgress = ({
  value,
  size = 72,
  stroke = 6,
  className,
  children,
  ...props
}: RingProgressProps & { children?: React.ReactNode }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const gradId = React.useId();
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" {...props}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.68 0.19 258)" />
            <stop offset="50%" stopColor="oklch(0.64 0.22 285)" />
            <stop offset="100%" stopColor="oklch(0.60 0.24 305)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="oklch(1 0 0 / 0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
          {children}
        </div>
      ) : null}
    </div>
  );
};

export { Progress, SegmentedProgress, RingProgress };
