import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { flushSync } from "react-dom";

// Passes CSS custom properties (e.g. the --i stagger index) through `style`.
export function vars(values: Record<string, string | number>) {
  return values as CSSProperties;
}

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs a state update inside a view transition so screens cross-fade and the
// shared title/blocks glide between their positions. Falls back to a plain
// update where the API is missing or motion is reduced.
export function withViewTransition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  // First-load entrance animations would fight the morph, so they key off this.
  document.documentElement.dataset.navigated = "";
  document.startViewTransition(() => flushSync(update));
}

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Counts from 0 up to `target` once, for the statistics tiles.
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return reduced ? target : value;
}
