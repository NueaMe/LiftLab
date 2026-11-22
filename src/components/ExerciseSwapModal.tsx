import React, { useEffect } from 'react';
import { X, ArrowLeftRight, BookOpen } from 'lucide-react';
import { CompletedWorkout, Exercise } from '../types';
import { EXERCISES, MUSCLE_LABEL_TH } from '../data/exercises';
import { formatNumber, getHistoricalBest1RM, getPreviousExerciseSets } from '../utils/analytics';
import { MuscleBadgeIcon } from './MuscleBadge';

interface ExerciseSwapModalProps {
  open: boolean;
  currentExercise: Exercise | null;
  activeExerciseIds: string[];
  history: CompletedWorkout[];
  onSwap: (newExerciseId: string) => void;
  onOpenGuide: (exerciseId: string) => void;
  onClose: () => void;
}

export const ExerciseSwapModal: React.FC<ExerciseSwapModalProps> = ({
  open,
  currentExercise,
  activeExerciseIds,
  history,
  onSwap,
  onOpenGuide,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !currentExercise) return null;

  const alternatives = EXERCISES.filter(
    (ex) => ex.muscle === currentExercise.muscle && ex.id !== currentExercise.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#090A0D]/80 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="swap-modal-title"
    >
      <div
        className="w-full sm:max-w-lg glass-card rounded-t-3xl sm:rounded-3xl max-h-[86vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Clean Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <MuscleBadgeIcon muscle={currentExercise.muscle} size="md" />
            <div className="min-w-0">
              <div className="editorial-label !text-[#FF4500]">
                SMART SWAP · SESSION ONLY
              </div>
              <h2
                id="swap-modal-title"
                className="font-display text-2xl sm:text-3xl tracking-wide text-[#F8FAFC] whitespace-normal break-words leading-tight mt-1"
              >
                SWAP {currentExercise.name}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                ท่าทดแทนกลุ่ม{' '}
                <strong className="text-[#F8FAFC]">
                  {MUSCLE_LABEL_TH[currentExercise.muscle]} ({currentExercise.muscle})
                </strong>{' '}
                — ไม่ทับตารางฝึกหลักที่บันทึกไว้
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="btn-tactile min-h-[44px] min-w-[44px] -mr-1 -mt-1 flex items-center justify-center rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#94A3B8] hover:text-[#F8FAFC] shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alternatives List */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 flex-1 pb-safe">
          {alternatives.map((alt) => {
            const best1RM = getHistoricalBest1RM(history, alt.id);
            const prevSets = getPreviousExerciseSets(history, alt.id);
            const topPrev = prevSets.find((s) => s.type !== 'W') ?? prevSets[0];
            const alreadyInSession = activeExerciseIds.includes(alt.id);

            return (
              <div
                key={alt.id}
                className="p-4 rounded-2xl bg-[#1A1D24] hover:bg-[#20242D] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] whitespace-normal break-words leading-snug">
                      {alt.name}
                    </h3>
                    {alreadyInSession && (
                      <span className="px-2 py-0.5 rounded-md bg-[#090A0D]/70 text-[10px] font-semibold text-[#94A3B8]">
                        มีในเซสชันแล้ว
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8] tabular-nums">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#090A0D]/60 text-[11px] font-medium text-[#F8FAFC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
                      {alt.subMuscleTh} ({alt.subMuscleEn})
                    </span>
                    <span className="text-[#94A3B8] font-medium">{alt.equipment}</span>
                    {topPrev && (
                      <>
                        <span aria-hidden="true" className="text-[#475569]">·</span>
                        <span className="font-tech">
                          ครั้งก่อน: {formatNumber(topPrev.weight)}kg × {topPrev.reps}
                        </span>
                      </>
                    )}
                    {best1RM > 0 && (
                      <>
                        <span aria-hidden="true" className="text-[#475569]">·</span>
                        <span className="text-[#FACC15] font-tech font-semibold">
                          1RM {formatNumber(best1RM)} kg
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenGuide(alt.id)}
                    aria-label={`ดูคู่มือท่า ${alt.name}`}
                    title="ดูคู่มือ 3 ขั้นตอน"
                    className="btn-tactile min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-[40px] rounded-xl bg-[#12141A] hover:bg-[#090A0D] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSwap(alt.id);
                      onClose();
                    }}
                    className="btn-tactile btn-volt flex-1 sm:flex-initial min-h-[44px] md:min-h-[40px] px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    สลับใช้ท่านี้
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
