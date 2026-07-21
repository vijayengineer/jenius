import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Constrain content to a mobile-feed column on wider screens. */
  contained?: boolean;
  /** Layer navigation over full-viewport content without adding a second page scroll. */
  overlayChrome?: boolean;
}

/**
 * AppShell — mobile-first frame with optional sticky header and footer.
 * On tablet/desktop the feed column is centered at ~460px, matching the
 * "desktop browser centred around a mobile feed column" target.
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    { header, footer, contained = true, overlayChrome = false, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex min-h-dvh flex-col bg-background text-foreground",
          overlayChrome && "h-dvh min-h-0 overflow-hidden",
          className,
        )}
        {...props}
      >
        {header ? (
          <header
            className={cn(
              "z-40 safe-top",
              overlayChrome ? "absolute inset-x-0 top-0" : "sticky top-0",
            )}
          >
            <div className={cn("mx-auto w-full", contained && "max-w-[460px]")}>{header}</div>
          </header>
        ) : null}

        <main
          id="jenius-main"
          className={cn(
            "mx-auto flex w-full flex-1 flex-col",
            contained && "max-w-[460px]",
            overlayChrome && "h-dvh min-h-0 flex-none",
          )}
        >
          {children}
        </main>

        {footer ? (
          <div
            className={cn(
              "z-40 safe-bottom",
              overlayChrome ? "absolute inset-x-0 bottom-0" : "sticky bottom-0",
            )}
          >
            <div className={cn("mx-auto w-full", contained && "max-w-[460px]")}>{footer}</div>
          </div>
        ) : null}
      </div>
    );
  },
);
AppShell.displayName = "AppShell";
