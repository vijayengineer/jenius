import * as React from "react";

/**
 * Mock online/offline context.
 *
 * The prototype does NOT ship a service worker or observe real
 * `navigator.onLine`. This context is driven exclusively by the dev-only
 * preview route so we can showcase the offline UI without disabling the
 * user's real network.
 *
 * Codex integration will replace this with a real connectivity hook (e.g.
 * `useOnlineStatus()` backed by `navigator.onLine` + fetch heartbeats).
 */
export interface OfflineContextValue {
  online: boolean;
  setOnline: (online: boolean) => void;
}

const OfflineContext = React.createContext<OfflineContextValue>({
  online: true,
  setOnline: () => {},
});

export interface OfflineProviderProps {
  children: React.ReactNode;
  /** Initial connectivity state. Defaults to online. */
  initialOnline?: boolean;
}

export function OfflineProvider({
  children,
  initialOnline = true,
}: OfflineProviderProps) {
  const [online, setOnline] = React.useState(initialOnline);
  const value = React.useMemo(() => ({ online, setOnline }), [online]);
  return React.createElement(OfflineContext.Provider, { value }, children);
}

export function useOffline(): OfflineContextValue {
  return React.useContext(OfflineContext);
}

/** Standard offline copy — keep in one place so screens stay consistent. */
export const OFFLINE_MESSAGE =
  "You're offline. Downloaded Jenius concepts still work.";
