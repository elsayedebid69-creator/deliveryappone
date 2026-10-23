import { useEffect, useState } from "react";

const KEY = "foodhub_native_app";

/** Remembers that this session was opened by the standalone admin app (?app=admin). */
export function markAdminApp() {
  try {
    localStorage.setItem(KEY, "admin");
  } catch {
    // ignore
  }
}

export function useIsAdminApp() {
  const [isAdminApp, setIsAdminApp] = useState(false);
  useEffect(() => {
    try {
      if (new URLSearchParams(window.location.search).get("app") === "admin") markAdminApp();
      setIsAdminApp(localStorage.getItem(KEY) === "admin");
    } catch {
      // ignore
    }
  }, []);
  return isAdminApp;
}
