import * as React from "react";
import { Bookmark, Compass, Home, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavKey = "feed" | "explore" | "saved" | "profile";

export interface BottomNavItem {
  key: BottomNavKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DEFAULT_NAV_ITEMS: BottomNavItem[] = [
  { key: "feed", label: "Feed", icon: Home },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "profile", label: "You", icon: User },
];

export interface BottomNavigationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  active: BottomNavKey;
  items?: BottomNavItem[];
  onSelect?: (key: BottomNavKey) => void;
}

/**
 * BottomNavigation — glass floating tab bar. Four minimal icons, meets
 * 44px minimum tap targets, safe-area aware.
 */
export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ active, items = DEFAULT_NAV_ITEMS, onSelect, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Primary"
        className={cn("px-4 pb-3 pt-2", className)}
        {...props}
      >
        <ul className="glass-strong mx-auto flex items-center justify-between gap-1 rounded-full p-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <li key={item.key} className="flex-1">
                <button
                  type="button"
                  onClick={() => onSelect?.(item.key)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "group relative flex h-11 w-full items-center justify-center gap-2 rounded-full",
                    "transition-swift active:scale-[0.96]",
                    isActive
                      ? "gradient-brand text-primary-foreground shadow-glow"
                      : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  <span
                    className={cn(
                      "text-[13px] font-medium",
                      isActive ? "inline" : "hidden",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);
BottomNavigation.displayName = "BottomNavigation";
