"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollRestoration - Preserves scroll position when navigating back
 *
 * Usage:
 *   useScrollRestoration();
 *
 * How it works:
 * 1. Continuously saves scroll position as user scrolls (throttled)
 * 2. On component mount, checks if there's a saved scroll position for current URL
 * 3. If found, restores scroll with retry loop to handle late-loading content
 * 4. Uses window as scroll container (verified in AdminLayout structure)
 *
 * Requirements:
 * - DashboardScrollManager must be mounted (sets history.scrollRestoration = "manual")
 * - Links must use scroll={false} to prevent Next.js from resetting scroll
 */
export function useScrollRestoration() {
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const storageKey = `crm-scroll:${currentUrl}`;
  const restoredRef = useRef(false); // Track if we've already restored for this mount

  // Auto-save scroll position as user scrolls (throttled)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      // Throttle scroll saves to avoid excessive sessionStorage writes
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        sessionStorage.setItem(storageKey, String(scrollY));
        throttleTimeout = null;
      }, 100); // Throttle to max 10 saves per second
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [storageKey]);

  // Restore scroll position with retry loop (handles late-loading content)
  useEffect(() => {
    if (typeof window === "undefined" || restoredRef.current) return;

    const savedScroll = sessionStorage.getItem(storageKey);
    if (!savedScroll) return;

    const targetScrollY = parseInt(savedScroll, 10);
    if (isNaN(targetScrollY) || targetScrollY === 0) return;

    restoredRef.current = true;

    // Restoration with retry loop (survives layout shifts and late DOM updates)
    let attempts = 0;
    const maxAttempts = 15; // Try for ~800ms max
    let lastScrollY = -1;
    let stableCount = 0;

    const tryRestore = () => {
      attempts++;

      const currentScrollY = window.scrollY || window.pageYOffset || 0;

      // Scroll to target position
      window.scrollTo({
        top: targetScrollY,
        behavior: "auto", // Instant, no smooth scroll
      });

      // Check if scroll is stable (same position for 2 consecutive checks)
      if (Math.abs(currentScrollY - lastScrollY) < 5) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      lastScrollY = currentScrollY;

      // Stop if:
      // 1. We've reached target and it's stable for 2 frames
      // 2. We've exceeded max attempts
      const isAtTarget = Math.abs(currentScrollY - targetScrollY) < 10;
      const isStable = stableCount >= 2;

      if ((isAtTarget && isStable) || attempts >= maxAttempts) {
        // Final scroll to ensure exact position
        window.scrollTo({
          top: targetScrollY,
          behavior: "auto",
        });
        return; // Stop retrying
      }

      // Continue retrying with RAF
      requestAnimationFrame(tryRestore);
    };

    // Start restoration on next frame (after paint)
    requestAnimationFrame(() => {
      // Additional delay to let React hydration complete
      setTimeout(() => {
        tryRestore();
      }, 50); // Small delay for DOM to stabilize
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return { storageKey };
}
