import React, { useId, useMemo } from 'react';
import { SkipForward } from 'lucide-react';
import { RestTimerState } from '../types';
import { formatDuration } from '../utils/analytics';

interface RestTimerFloatingProps {
  timer: RestTimerState;
  onAdjust: (deltaSec: number) => void;
  onSkip: () => void;
}

export const RestTimerFloating: React.FC<RestTimerFloatingProps> = ({
  timer,
  onAdjust,
  onSkip,
}) => {
  const uid = useId().replace(/:/g, '');

  const size = 66;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 26;
  const innerRadius = 21;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const progress =
    timer.totalSec > 0 ? Math.max(0, Math.min(1, timer.remainingSec / timer.totalSec)) : 0;

  const microTicks = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const deg = i * 15;
      const rad = ((deg - 90) * Math.PI) / 180;
      const major = i % 6 === 0;
      const rIn = major ? 30 : 30.8;
      const rOut = 32.5;
      return {
        x1: cx + rIn * Math.cos(rad),
        y1: cy + rIn * Math.sin(rad),
        x2: cx + rOut * Math.cos(rad),
        y2: cy + rOut * Math.sin(rad),
        major,
      };
    });
  }, [cx, cy]);

  if (!timer.active) return null;

  const isFinalCountdown = timer.remainingSec <= 10;
  const isThreeTwoOne = timer.remainingSec <= 3 && timer.remainingSec >= 1;

  const dashOffset = outerCircumference * (1 - progress);
  const innerDashOffset = innerCircumference * (1 - progress);

  const angleRad = (progress * 360 - 90) * (Math.PI / 180);
  const tipX = cx + Math.cos(angleRad) * outerRadius;
  const tipY = cy + Math.sin(angleRad) * outerRadius;

  const activeColor = isThreeTwoOne ? '#FF4500' : '#FACC15';

  return (
    <div
      className="fixed z-40 left-3 right-3 bottom-[80px] sm:bottom-[84px] mb-[env(safe-area-inset-bottom)] md:mb-0 md:left-auto md:right-6 md:bottom-6 md:w-[444px]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`tactical-hud-panel rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 transition-shadow ${
          isThreeTwoOne
            ? 'ring-1 ring-[#FF4500]/80 shadow-[0_22px_54px_-12px_rgba(0,0,0,0.94),0_0_36px_-8px_rgba(255,69,0,0.58)]'
            : isFinalCountdown
              ? 'ring-1 ring-[#FACC15]/60 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.92),0_0_28px_-8px_rgba(250,204,21,0.38)]'
              : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10">
          {/* Precision Dual-Track Circular Countdown Ring */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-[56px] h-[56px] sm:w-[66px] sm:h-[66px] shrink-0 flex items-center justify-center">
              <div
                className={`pointer-events-none absolute inset-1.5 rounded-full blur-md ${
                  isThreeTwoOne ? 'bg-[#FF4500]/32' : 'bg-[#FACC15]/16'
                }`}
                aria-hidden="true"
              />

              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible anim-rest-ring-glow"
                aria-hidden="true"
              >
                <defs>
                  <filter id={`rest-tip-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="2.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Fine Micro-Tick Perimeter */}
                {microTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.major ? 'rgba(248,250,252,0.35)' : 'rgba(148,163,184,0.16)'}
                    strokeWidth={t.major ? '1.1' : '0.75'}
                    strokeLinecap="round"
                  />
                ))}

                {/* Inner Precision Secondary Track */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerRadius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={innerRadius}
                  fill="none"
                  stroke={activeColor}
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={innerCircumference}
                  strokeDashoffset={innerDashOffset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* Outer Primary Track */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={outerRadius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.09)"
                  strokeWidth="4"
                />

                {/* Active Smooth Progress Arc */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={outerRadius}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={outerCircumference}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* Luminous Tracking Tip Dot */}
                {progress > 0.02 && (
                  <g filter={`url(#rest-tip-${uid})`}>
                    <circle cx={tipX} cy={tipY} r="4.8" fill={activeColor} opacity="0.35" />
                    <circle
                      cx={tipX}
                      cy={tipY}
                      r="2.6"
                      fill="#FFFFFF"
                      stroke={activeColor}
                      strokeWidth="1.4"
                    />
                  </g>
                )}
              </svg>

              <span
                className={`absolute inset-0 flex items-center justify-center font-display tracking-wider tabular-nums leading-none ${
                  isThreeTwoOne
                    ? 'text-[2.1rem] text-[#FF4500] anim-set-check'
                    : isFinalCountdown
                      ? 'text-[1.45rem] text-[#F8FAFC]'
                      : 'text-[1.45rem] text-[#FACC15]'
                }`}
                key={isThreeTwoOne ? timer.remainingSec : 'std'}
              >
                {isThreeTwoOne ? timer.remainingSec : formatDuration(timer.remainingSec)}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span
                    className={`anim-live-ping absolute inline-flex h-full w-full rounded-full ${
                      isThreeTwoOne ? 'bg-[#FF4500]' : 'bg-[#FACC15]'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isThreeTwoOne ? 'bg-[#FF4500]' : 'bg-[#FACC15]'
                    }`}
                  />
                </span>
                <span
                  className={`editorial-label font-bold leading-none ${
                    isThreeTwoOne ? '!text-[#FF4500]' : '!text-[#FACC15]'
                  }`}
                >
                  {isThreeTwoOne
                    ? '3-2-1 · GET READY'
                    : isFinalCountdown
                      ? 'READY FOR NEXT SET'
                      : 'REST TIMER'}
                </span>
              </div>
              <div className="text-xs text-[#CBD5E1] whitespace-normal break-words mt-1 leading-snug">
                พักระหว่างเซ็ต · {timer.exerciseName}
              </div>
            </div>
          </div>

          {/* Solid Tactile Tactical Stepper & Skip Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onAdjust(-15)}
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-0 px-2 md:px-2.5 rounded-xl text-xs font-tech font-bold tabular-nums whitespace-nowrap flex items-center justify-center"
              aria-label="ลดเวลาพัก 15 วินาที"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => onAdjust(15)}
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-0 px-2 md:px-2.5 rounded-xl text-xs font-tech font-bold tabular-nums whitespace-nowrap flex items-center justify-center"
              aria-label="เพิ่มเวลาพัก 15 วินาที"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="btn-tactile btn-volt active:scale-[0.98] transition-all min-h-[44px] min-w-[44px] md:min-h-[40px] px-3 md:px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <span>ข้าม</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
