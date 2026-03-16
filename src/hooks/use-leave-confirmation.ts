"use client";

import { useEffect } from "react";

/**
 * Hook to show a confirmation dialog when the user attempts to leave the page
 * with unsaved changes.
 * 
 * @param isDirty - Whether the form has unsaved changes
 * @param message - Optional custom message (Note: most modern browsers ignore this for beforeunload)
 */
export function useLeaveConfirmation(
  isDirty: boolean,
  message = "Vous avez des modifications en cours. Voulez-vous vraiment quitter cette page ?"
) {
  useEffect(() => {
    if (!isDirty) return;

    // 1. Browser-level guard (reload, close tab)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message; // Standard way to trigger the dialog
      return message;
    };

    // 2. Internal navigation guard (link clicks)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href && anchor.host === window.location.host) {
        const currentPath = window.location.pathname;
        const targetUrl = new URL(anchor.href);
        const targetPath = targetUrl.pathname;

        // Skip if it's the same page (e.g., hash link or same URL)
        if (targetPath === currentPath && targetUrl.search === window.location.search) {
          return;
        }

        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }
    };

    // 3. Browser Back/Forward button
    const handlePopState = () => {
      if (!window.confirm(message)) {
        // Push the current state back to the history to "stay" on the page
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, message]);
}
