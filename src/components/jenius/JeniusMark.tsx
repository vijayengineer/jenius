import * as React from "react";
import { cn } from "@/lib/utils";

export interface JeniusMarkProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  /** "gradient" fills the J with the brand gradient; "mono" uses currentColor. */
  tone?: "gradient" | "mono";
  label?: string;
}

/**
 * JeniusMark — stylised "J" with a spark. Reusable as app icon,
 * feed watermark, loading symbol, and top-left brand mark.
 */
export const JeniusMark = React.forwardRef<SVGSVGElement, JeniusMarkProps>(
  ({ size = 32, tone = "gradient", label = "Jenius", className, ...props }, ref) => {
    const gradId = React.useId();
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label={label}
        className={cn("shrink-0", className)}
        {...props}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.68 0.19 258)" />
            <stop offset="55%" stopColor="oklch(0.64 0.22 285)" />
            <stop offset="100%" stopColor="oklch(0.60 0.24 305)" />
          </linearGradient>
        </defs>
        {/* Rounded tile */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill={tone === "gradient" ? `url(#${gradId})` : "currentColor"}
          opacity={tone === "gradient" ? 1 : 0.12}
        />
        {/* Stylised J */}
        <path
          d="M31 12 V27 a8 8 0 0 1 -8 8 h-1 a6 6 0 0 1 -6 -6"
          fill="none"
          stroke={tone === "gradient" ? "white" : "currentColor"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Spark */}
        <path
          d="M34 10 l1.4 3.6 L39 15 l-3.6 1.4 L34 20 l-1.4-3.6 L29 15 l3.6-1.4 Z"
          fill={tone === "gradient" ? "white" : "currentColor"}
        />
      </svg>
    );
  },
);
JeniusMark.displayName = "JeniusMark";
