import React, { useRef } from 'react';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTiltDeg?: number;
}

/**
 * Smooth, GPU-accelerated 3D perspective tilt + cursor-following spotlight wrapper.
 * Mutates CSS custom properties directly on the DOM node for zero React re-renders.
 */
export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  style,
  maxTiltDeg = 6,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    const rotY = (px - 0.5) * (maxTiltDeg * 2);
    const rotX = (0.5 - py) * (maxTiltDeg * 2);

    el.style.setProperty('--rx', `${rotX.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${rotY.toFixed(2)}deg`);
    el.style.setProperty('--spot-x', `${x.toFixed(1)}px`);
    el.style.setProperty('--spot-y', `${y.toFixed(1)}px`);
  };

  const handlePointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={style}
      className={`tilt-card-3d ${className}`}
    >
      {children}
    </div>
  );
};
