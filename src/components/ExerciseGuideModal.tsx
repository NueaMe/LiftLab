import React, { useEffect } from 'react';
import { X, Plus, AlertTriangle, Trophy, Clock, Star, Scale } from 'lucide-react';
import { AthleteProfile, Exercise } from '../types';
import { MUSCLE_LABEL_TH } from '../data/exercises';
import { formatNumber } from '../utils/analytics';
import { getAthleteGender, getBeginnerStartingWeight } from '../utils/personalization';
import { ExerciseFormAnimation } from './ExerciseFormAnimation';
import { MuscleBadgeIcon } from './MuscleBadge';

interface ExerciseGuideModalProps {
  exercise: Exercise | null;
  best1RM: number;
  profile?: AthleteProfile | null;
  onClose: () => void;
  onAddToWorkout?: (exerciseId: string) => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  exercise,
  best1RM,
  profile = null,
  onClose,
  onAddToWorkout,
}) => {
  useEffect(() => {
    if (!exercise) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [exercise, onClose]);

  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#090A0D]/80 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-guide-title"
    >
      <div
        className="w-full sm:max-w-xl glass-card rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-white/[0.06]">
          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
            <MuscleBadgeIcon
              muscle={exercise.muscle}
              size="lg"
              tone={exercise.isRecommended ? 'volt' : 'cobalt'}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="exercise-guide-title"
                  className="font-display text-2xl sm:text-3xl tracking-wide text-[#F8FAFC] leading-none"
                >
                  {exercise.name}
                </h2>
                {exercise.isRecommended && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FACC15] text-[#090A0D] text-[10px] font-bold whitespace-nowrap">
                    <Star className="w-3 h-3 fill-current" />
                    ท่าแนะนำ
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8]">
                <span className="text-[#F8FAFC] font-semibold">
                  {MUSCLE_LABEL_TH[exercise.muscle]} · {exercise.subMuscleTh} ({exercise.subMuscleEn})
                </span>
                <span aria-hidden="true" className="text-[#475569]">/</span>
                <span>{exercise.equipment}</span>
                <span aria-hidden="true" className="text-[#475569]">/</span>
                <span className="inline-flex items-center gap-1 font-tech tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  พัก {exercise.defaultRestSec} วิ
                </span>
              </div>
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

        {/* Scrollable body */}
        <div className="overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
          {/* Animated CSS/SVG Form Diagram */}
          <ExerciseFormAnimation exercise={exercise} gender={getAthleteGender(profile)} />

          {/* Personal Best & Beginner Starting Weight Suggestion */}
          {best1RM > 0 ? (
            <div className="flex items-center justify-between gap-3 py-3.5 px-4 rounded-2xl bg-[#1A1D24] ring-1 ring-[#FACC15]/30">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Trophy className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span className="text-sm font-medium text-[#F8FAFC] whitespace-normal break-words leading-snug">
                  สถิติสูงสุดของคุณ (Est. 1RM · พลังสูงสุด 1 ครั้ง)
                </span>
              </div>
              <span className="font-display text-2xl tracking-wide text-[#FACC15] tabular-nums leading-none shrink-0">
                {formatNumber(best1RM)} KG
              </span>
            </div>
          ) : (
            exercise.equipment !== 'Bodyweight' && (
              <div className="flex items-start sm:items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-[#1A1D24] ring-1 ring-white/[0.08]">
                <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                  <Scale className="w-4 h-4 text-[#FF4500] shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#CBD5E1] whitespace-normal break-words leading-snug">
                    น้ำหนักเริ่มต้นแนะนำสำหรับมือใหม่ ({getAthleteGender(profile) === 'female' ? 'สรีระหญิง' : 'สรีระชาย'})
                  </span>
                </div>
                <span className="font-tech font-bold text-sm text-[#F8FAFC] tabular-nums shrink-0 whitespace-nowrap">
                  ~{formatNumber(getBeginnerStartingWeight(exercise.equipment, exercise.muscle, profile))} kg
                  {exercise.equipment === 'Dumbbell' ? ' / ข้าง' : ''}
                </span>
              </div>
            )
          )}

          {/* 3-Step Beginner Form Cues */}
          <div>
            <div className="editorial-label mb-1">FORM GUIDE</div>
            <h3 className="text-sm font-bold text-[#F8FAFC] mb-4">
              คู่มือท่าฝึก 3 ขั้นตอนสำหรับมือใหม่
            </h3>
            <ol className="space-y-3.5">
              {exercise.formCues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#1A1D24]">
                  <span className="w-7 h-7 rounded-lg bg-[#FF4500]/15 text-[#FF4500] flex items-center justify-center font-tech font-bold text-sm tabular-nums shrink-0 mt-0.5 leading-none">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{cue}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Mistake */}
          <div className="rounded-2xl bg-[#1A1D24] ring-1 ring-[#FACC15]/25 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#FACC15] mb-1">ข้อควรระวัง</div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{exercise.commonMistake}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/[0.06] bg-[#090A0D]/80 flex items-center gap-3 pb-safe">
          {onAddToWorkout && (
            <button
              type="button"
              onClick={() => {
                onAddToWorkout(exercise.id);
                onClose();
              }}
              className="btn-tactile btn-volt flex-1 min-h-[46px] px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              เพิ่มลงการฝึกวันนี้
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${
              onAddToWorkout ? 'px-5' : 'w-full'
            } btn-tactile min-h-[46px] py-2.5 rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#F8FAFC] font-semibold text-sm whitespace-nowrap`}
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
