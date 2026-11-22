import React from 'react';
import { Trophy, X, Zap } from 'lucide-react';
import { formatNumber } from '../utils/analytics';

export interface PRCelebrationPayload {
  id: string;
  exerciseName: string;
  est1RM: number;
  previousBest1RM: number;
  weight: number;
  reps: number;
}

interface PRCelebrationBannerProps {
  pr: PRCelebrationPayload | null;
  onDismiss: () => void;
}

interface ConfettiShard {
  tx: number;
  ty: number;
  rot: number;
  color: string;
  w: number;
  h: number;
  delay: number;
}

const CONFETTI_SHARDS: ConfettiShard[] = [
  { tx: -175, ty: -62, rot: -145, color: '#FACC15', w: 9, h: 4, delay: 0 },
  { tx: -148, ty: -92, rot: 120, color: '#FF4500', w: 8, h: 8, delay: 30 },
  { tx: -118, ty: -48, rot: -85, color: '#E4E4E7', w: 7, h: 3.5, delay: 15 },
  { tx: -92, ty: -102, rot: 170, color: '#FACC15', w: 10, h: 4, delay: 45 },
  { tx: -62, ty: -74, rot: -115, color: '#EF4444', w: 7, h: 7, delay: 10 },
  { tx: -34, ty: -96, rot: 95, color: '#FACC15', w: 8, h: 3.5, delay: 25 },
  { tx: 18, ty: -104, rot: -135, color: '#FF4500', w: 9, h: 4.5, delay: 0 },
  { tx: 46, ty: -78, rot: 110, color: '#FACC15', w: 8, h: 8, delay: 35 },
  { tx: 82, ty: -96, rot: -65, color: '#E4E4E7', w: 9, h: 3.5, delay: 20 },
  { tx: 114, ty: -58, rot: 155, color: '#FACC15', w: 10, h: 4, delay: 40 },
  { tx: 146, ty: -88, rot: -120, color: '#FF4500', w: 8, h: 8, delay: 10 },
  { tx: 178, ty: -52, rot: 135, color: '#FACC15', w: 9, h: 4, delay: 25 },
  { tx: -162, ty: 44, rot: 145, color: '#FF4500', w: 8, h: 4, delay: 40 },
  { tx: -126, ty: 72, rot: -110, color: '#FACC15', w: 7, h: 7, delay: 15 },
  { tx: -76, ty: 66, rot: 85, color: '#EF4444', w: 9, h: 3.5, delay: 30 },
  { tx: -28, ty: 76, rot: -155, color: '#FACC15', w: 8, h: 4, delay: 5 },
  { tx: 32, ty: 74, rot: 125, color: '#E4E4E7', w: 7, h: 3.5, delay: 25 },
  { tx: 78, ty: 68, rot: -95, color: '#FACC15', w: 9, h: 4.5, delay: 15 },
  { tx: 128, ty: 62, rot: 165, color: '#FF4500', w: 8, h: 7, delay: 35 },
  { tx: 166, ty: 42, rot: -140, color: '#FACC15', w: 9, h: 4, delay: 10 },
];

/**
 * High-impact Championship Gold & Blaze Orange-Red celebration banner
 * triggered whenever a logged set beats the athlete's previous Estimated 1RM.
 */
export const PRCelebrationBanner: React.FC<PRCelebrationBannerProps> = ({ pr, onDismiss }) => {
  if (!pr) return null;

  const gain = pr.previousBest1RM > 0 ? Number((pr.est1RM - pr.previousBest1RM).toFixed(1)) : 0;

  return (
    <div
      key={pr.id}
      className="fixed z-50 top-[68px] md:top-[80px] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg pointer-events-none"
      role="status"
      aria-live="assertive"
    >
      <div className="relative pointer-events-auto">
        {/* Championship Gold & Blaze Orange-Red Confetti Burst Layer */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
          aria-hidden="true"
        >
          {CONFETTI_SHARDS.map((shard, idx) => (
            <span
              key={idx}
              className="pr-confetti-shard absolute rounded-[2px]"
              style={
                {
                  width: `${shard.w}px`,
                  height: `${shard.h}px`,
                  backgroundColor: shard.color,
                  boxShadow:
                    shard.color === '#FACC15'
                      ? '0 0 10px rgba(250,204,21,0.85)'
                      : shard.color === '#FF4500' || shard.color === '#EF4444'
                        ? '0 0 10px rgba(255,69,0,0.85)'
                        : 'none',
                  '--tx': `${shard.tx}px`,
                  '--ty': `${shard.ty}px`,
                  '--rot': `${shard.rot}deg`,
                  animationDelay: `${shard.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Obsidian Glass & Championship Gold Celebration Card */}
        <div className="pr-banner-pop relative rounded-2xl overflow-hidden bg-[#12141A]/96 backdrop-blur-xl border border-[#FACC15]/55 shadow-[0_22px_50px_-14px_rgba(0,0,0,0.92),0_0_36px_-10px_rgba(250,204,21,0.38)]">
          {/* Top Gold Accent Bar */}
          <div className="h-[2.5px] w-full bg-gradient-to-r from-[#FF4500] via-[#FACC15] to-[#FF4500]" />

          <div className="px-4 py-3.5 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Championship Gold Trophy Emblem */}
              <div className="relative w-12 h-12 rounded-xl bg-[#FACC15] text-[#090A0D] flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(250,204,21,0.55)]">
                <Trophy className="w-6 h-6 stroke-[2.5]" />
                <span
                  className="pr-ring-ripple pointer-events-none absolute inset-0 rounded-xl border-2 border-[#FACC15]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl tracking-wider text-[#FACC15] leading-none">
                    NEW PERSONAL RECORD
                  </span>
                  <Zap className="w-4 h-4 text-[#FF4500] fill-[#FF4500] shrink-0" />
                </div>

                <div className="text-xs font-bold text-[#F8FAFC] whitespace-normal break-words leading-snug mt-1">
                  {pr.exerciseName} ·{' '}
                  <span className="text-[#94A3B8] font-tech tabular-nums">
                    {formatNumber(pr.weight)} kg × {pr.reps}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#94A3B8] mt-1 tabular-nums">
                  <span>
                    Est. 1RM ใหม่:{' '}
                    <strong className="text-[#FACC15] font-tech font-bold">
                      {formatNumber(pr.est1RM)} kg
                    </strong>
                  </span>
                  {gain > 0 ? (
                    <span className="text-[#FF4500] font-bold">
                      (+{formatNumber(gain)} kg เหนือสถิติเดิม)
                    </span>
                  ) : (
                    <span className="text-[#F8FAFC] font-semibold">สถิติแรกที่บันทึกสำเร็จ</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="ปิดการแจ้งเตือน PR"
              className="btn-tactile min-h-[44px] min-w-[44px] md:min-h-[34px] md:min-w-[34px] rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
