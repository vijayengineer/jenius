import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bookmark, Home, Plus, User } from "lucide-react";
import { AppShell } from "./AppShell";
import { BottomNavigation, type BottomNavItem, type BottomNavKey } from "./BottomNavigation";

const NAV_ITEMS: BottomNavItem[] = [
  { key: "feed", label: "Feed", icon: Home },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "explore", label: "Create", icon: Plus },
  { key: "profile", label: "Me", icon: User },
];

const KEY_TO_PATH: Record<BottomNavKey, string> = {
  feed: "/",
  saved: "/saved",
  explore: "/create",
  profile: "/me",
};

export interface TabShellProps {
  active: BottomNavKey;
  header?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * TabShell — shared shell for secondary tabs (Saved, Create, Me). Wires the
 * bottom navigation into the router. Feed uses its own custom shell.
 */
export function TabShell({ active, header, children }: TabShellProps) {
  const navigate = useNavigate();
  return (
    <AppShell
      contained
      header={header}
      footer={
        <BottomNavigation
          items={NAV_ITEMS}
          active={active}
          onSelect={(key) => {
            const path = KEY_TO_PATH[key];
            if (path) navigate({ to: path });
          }}
        />
      }
    >
      {children}
    </AppShell>
  );
}

/** Helper that resolves the current tab from the router pathname. */
export function useActiveTab(): BottomNavKey {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/create")) return "explore";
  if (pathname.startsWith("/me")) return "profile";
  return "feed";
}

export { NAV_ITEMS as JENIUS_NAV_ITEMS };
