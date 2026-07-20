import * as React from "react";

/**
 * Application connectivity context. It follows navigator.onLine while
 * retaining setOnline for the /dev state-preview harness.
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

export function OfflineProvider({ children, initialOnline }: OfflineProviderProps) {
  const [online, setOnline] = React.useState(
    initialOnline ?? (typeof navigator === "undefined" ? true : navigator.onLine),
  );
  React.useEffect(() => {
    if (initialOnline !== undefined) return;
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [initialOnline]);
  const value = React.useMemo(() => ({ online, setOnline }), [online]);
  return React.createElement(OfflineContext.Provider, { value }, children);
}

export function useOffline(): OfflineContextValue {
  return React.useContext(OfflineContext);
}

/** Standard offline copy — keep in one place so screens stay consistent. */
export const OFFLINE_MESSAGE = "You're offline. Downloaded Jenius concepts still work.";
