import * as React from "react";
import { CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  /** When true, the banner is rendered; false collapses it entirely. */
  visible?: boolean;
}

/**
 * OfflineBanner — non-blocking status strip. Uses `role="status"` so
 * screen readers announce it, and combines icon + text (never colour alone).
 */
export const OfflineBanner = React.forwardRef<HTMLDivElement, OfflineBannerProps>(
  (
    {
      message = "You're offline. Downloaded Jenius concepts still work.",
      visible = true,
      className,
      ...props
    },
    ref,
  ) => {
    if (!visible) return null;
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "mx-4 mt-2 flex items-center gap-2 rounded-full border border-white/10",
          "bg-white/6 px-4 py-2 text-[13px] text-foreground/85 backdrop-blur",
          className,
        )}
        {...props}
      >
        <CloudOff className="size-4 text-brand-blue" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{message}</span>
      </div>
    );
  },
);
OfflineBanner.displayName = "OfflineBanner";
