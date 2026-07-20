import * as React from "react";

export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, []);
  return null;
}
