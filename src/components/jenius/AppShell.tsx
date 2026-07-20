import * as React from "react";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Constrain content to a mobile-feed column on wider screens. */
  contained?: boolean;
}

/**
 * AppShell — mobile-first frame with optional sticky header and footer.
 * On tablet/desktop the feed column is centered at ~460px, matching the
 * "desktop browser centred around a mobile feed column" target.
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ header, footer, contained = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex min-h-dvh flex-col bg-background text-foreground", className)}
        {...props}
      >
        {header ? (
          <header className="sticky top-0 z-40 safe-top">
            <div className={cn("mx-auto w-full", contained && "max-w-[460px]")}>{header}</div>
          </header>
        ) : null}

        <main
          id="jenius-main"
          className={cn("mx-auto flex w-full flex-1 flex-col", contained && "max-w-[460px]")}
        >
          {children}
        </main>

        {footer ? (
          <div className="sticky bottom-0 z-40 safe-bottom">
            <div className={cn("mx-auto w-full", contained && "max-w-[460px]")}>{footer}</div>
          </div>
        ) : null}
      </div>
    );
  },
);
AppShell.displayName = "AppShell";
