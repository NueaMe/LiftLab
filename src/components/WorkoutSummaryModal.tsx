import React from 'react';
import { Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { CompletedWorkout } from '../types';
import { formatDuration, formatNumber } from '../utils/analytics';

interface WorkoutSummaryModalProps {
  workout: CompletedWorkout | null;
  onClose: () => void;
  onViewAnalytics: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  workout,
  onClose,
  onViewAnalytics,
}) => {
  if (!workout) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#090A0D]/80 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workout-summary-title"
    >
      <div
        className="w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 space-y-6 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4500] text-white flex items-center justify-center mx-auto shadow-[0_0_24px_-4px_rgba(255,69,0,0.6)]">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="editorial-label pt-1">WORKOUT LOGGED</div>
          <div
            id="workout-summary-title"
            className="font-display text-4xl tracking-wider text-[#F8FAFC] leading-none"
          >
            SESSION COMPLETE
          </div>
          <p className="text-sm text-[#94A3B8]">บันทึกการฝึกสำเร็จ · {workout.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#1A1D24]">
            <div className="editorial-label">VOLUME · ปริมาณรวม</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1.5 leading-none">
              {formatNumber(workout.totalVolume)}
              <span className="text-sm font-tech text-[#94A3B8] ml-1">KG</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A1D24]">
            <div className="editorial-label">DURATION · เวลาฝึก</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1.5 leading-none">
              {formatDuration(workout.durationSec)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1A1D24]">
            <div className="editorial-label">SETS · เซ็ตฝึกหลัก</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1.5 leading-none">
              {workout.totalWorkingSets}
              <span className="text-xs font-sans font-medium text-[#94A3B8] ml-1.5">เซ็ต</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl bg-[#1A1D24] ${
              workout.prCount > 0 ? 'ring-1 ring-[#FACC15]/45' : ''
            }`}
          >
            <div className="editorial-label !text-[#FACC15]">NEW PR!</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#FACC15] tabular-nums mt-1.5 leading-none flex items-center gap-1.5">
              {workout.prCount > 0 && <Trophy className="w-5 h-5 shrink-0" />}
              <span>{workout.prCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewAnalytics();
            }}
            className="btn-tactile btn-volt flex-1 min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>ดูกราฟพัฒนาการ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile min-h-[46px] px-5 py-2.5 rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#F8FAFC] font-semibold text-sm whitespace-nowrap"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
