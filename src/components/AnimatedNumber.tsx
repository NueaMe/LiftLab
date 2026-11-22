import React, { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../utils/analytics';

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  format?: (val: number) => string;
  className?: string;
}

/**
 * Smooth cubic-ease-out animated numeric counter for athletic scoreboards and KPI cards.
 * Preserves exact 0 initial state immediately without flicker and respects prefers-reduced-motion.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  durationMs = 520,
  format = formatNumber,
  className,
}) => {
  const safeTarget = Number.isFinite(value) ? value : 0;
  const [display, setDisplay] = useState<number>(safeTarget);
  const prevRef = useRef<number>(safeTarget);

  useEffect(() => {
    const startVal = prevRef.current;
    const endVal = safeTarget;

    if (startVal === endVal) {
      setDisplay(endVal);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || durationMs <= 0) {
      prevRef.current = endVal;
      setDisplay(endVal);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();
    const isInt = Number.isInteger(endVal) && Number.isInteger(startVal);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease-out for crisp scoreboard settle
      const eased = 1 - Math.pow(1 - t, 3);
      const next = startVal + (endVal - startVal) * eased;

      setDisplay(isInt ? Math.round(next) : Number(next.toFixed(1)));

      if (t < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        prevRef.current = endVal;
        setDisplay(endVal);
      }
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(rafId);
      prevRef.current = endVal;
    };
  }, [safeTarget, durationMs]);

  return <span className={className}>{format(display)}</span>;
};
