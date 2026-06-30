import { useEffect, useState } from "react";

/** Advance through steps while `active`; returns current step index. */
export function useStagedProgress(steps, active, intervalMs = 380) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (!active || !steps.length) {
      setIndex(-1);
      return;
    }

    setIndex(0);
    const timers = steps.map((_, i) =>
      setTimeout(() => setIndex(i), i * intervalMs)
    );
    return () => timers.forEach(clearTimeout);
  }, [active, steps.length, intervalMs]);

  return index;
}