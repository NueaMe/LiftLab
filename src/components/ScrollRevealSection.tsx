import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Optional oversized athletic watermark label that drifts horizontally on scroll */
  watermark?: string;
  watermarkDirection?: 'left' | 'right';
  delayMs?: number;
}

/**
 * Smooth IntersectionObserver scroll-triggered entrance choreography
 * (translateY + scale + opacity with cubic-bezier(0.16, 1, 0.3, 1))
 * paired with optional GPU-accelerated horizontal parallax section watermark.
 */
export const ScrollRevealSection: React.FC<ScrollRevealSectionProps> = ({
  children,
  className = '',
  watermark,
  watermarkDirection = 'left',
  delayMs = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  // IntersectionObserver scroll-reveal entrance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setRevealed(true);
      return;
    }

    // Immediately reveal if already inside initial viewport
    const initialRect = el.getBoundingClientRect();
    if (initialRect.top < window.innerHeight * 0.94) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -42px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Subtle GPU-accelerated horizontal parallax drift for section watermarks
  useEffect(() => {
    if (!watermark) return;
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let rafId = 0;
    const updateParallax = () => {
      rafId = 0;
      const host = containerRef.current;
      const mark = watermarkRef.current;
      if (!host || !mark) return;

      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Normalized scroll progress [-1, 1] relative to viewport center
      const centerDelta = (rect.top + rect.height * 0.35 - vh * 0.5) / vh;
      const clamped = Math.max(-1.2, Math.min(1.2, centerDelta));
      const dir = watermarkDirection === 'left' ? -1 : 1;
      const shiftX = clamped * 68 * dir;
      mark.style.transform = `translate3d(${shiftX.toFixed(1)}px, 0, 0)`;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateParallax);
      }
    };

    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [watermark, watermarkDirection]);

  return (
    <div
      ref={containerRef}
      style={
        delayMs > 0
          ? ({ transitionDelay: `${delayMs}ms` } as React.CSSProperties)
          : undefined
      }
      className={`scroll-reveal-section relative ${revealed ? 'is-revealed' : ''} ${className}`}
    >
      {watermark && (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-9 sm:-top-12 inset-x-0 overflow-hidden z-0 flex justify-center"
        >
          <div
            ref={watermarkRef}
            className="parallax-watermark font-display text-[5.25rem] sm:text-[8.5rem] lg:text-[11rem] tracking-[0.14em] leading-none whitespace-nowrap will-change-transform"
          >
            {watermark}
          </div>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
