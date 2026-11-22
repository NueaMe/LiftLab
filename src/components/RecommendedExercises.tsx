import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Play, Sparkles, X } from 'lucide-react';
import { CompletedWorkout, Exercise, MuscleGroup } from '../types';
import { EXERCISE_MAP, EXERCISES, MUSCLE_LABEL_TH } from '../data/exercises';
import { getMuscleReadinessHud, MuscleReadinessItem } from '../utils/analytics';
import { MuscleBadgeIcon } from './MuscleBadge';
import { TiltCard3D } from './TiltCard3D';

interface RecommendedExercisesProps {
  history: CompletedWorkout[];
  selectedMuscle?: MuscleGroup | null;
  defaultOpen?: boolean;
  onClearMuscleFilter?: () => void;
  onOpenGuide: (exerciseId: string) => void;
  onQuickStartExercise: (exerciseId: string) => void;
}

interface RecommendedCardItem {
  exercise: Exercise;
  readiness: MuscleReadinessItem;
  reasonTh: string;
  isPriorityLow: boolean;
}

const STARTER_IDS = [
  'barbell-bench-press',
  'lat-pulldown',
  'barbell-back-squat',
  'overhead-press',
];

export const RecommendedExercises: React.FC<RecommendedExercisesProps> = ({
  history,
  selectedMuscle = null,
  defaultOpen = false,
  onClearMuscleFilter,
  onOpenGuide,
  onQuickStartExercise,
}) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  useEffect(() => {
    if (selectedMuscle) {
      setExpanded(true);
    }
  }, [selectedMuscle]);

  const recommendations = useMemo<RecommendedCardItem[]>(() => {
    const hudItems = getMuscleReadinessHud(history);
    const hudByMuscle = hudItems.reduce<Record<MuscleGroup, MuscleReadinessItem>>((acc, item) => {
      acc[item.muscle] = item;
      return acc;
    }, {} as Record<MuscleGroup, MuscleReadinessItem>);

    // When a specific muscle is selected on the Full-Body Heatmap, filter quick-start exercises for that muscle
    if (selectedMuscle) {
      const muscleInfo = hudByMuscle[selectedMuscle];
      const matched = EXERCISES.filter((ex) => ex.muscle === selectedMuscle).sort(
        (a, b) => Number(Boolean(b.isRecommended)) - Number(Boolean(a.isRecommended))
      );

      const reasonTh =
        history.length === 0
          ? `โฟกัส${MUSCLE_LABEL_TH[selectedMuscle]} · พร้อมเริ่มเซสชันที่ 1`
          : muscleInfo.status === 'low_volume'
            ? `ฝึกน้อยไป · ${muscleInfo.weeklySets}/10 เซ็ต`
            : muscleInfo.status === 'recovering'
              ? `กำลังฟื้นตัว ${muscleInfo.recoveryPct}%`
              : `พร้อมฝึก · ${muscleInfo.weeklySets} เซ็ต/7วัน`;

      return matched.slice(0, 4).map((exercise) => ({
        exercise,
        readiness: muscleInfo,
        reasonTh,
        isPriorityLow: muscleInfo.status === 'low_volume',
      }));
    }

    if (history.length === 0) {
      return STARTER_IDS.map((id) => EXERCISE_MAP[id])
        .filter((ex): ex is Exercise => Boolean(ex))
        .map((exercise) => ({
          exercise,
          readiness: hudByMuscle[exercise.muscle],
          reasonTh: 'พร้อมเริ่มเซสชันที่ 1',
          isPriorityLow: false,
        }));
    }

    const statusPriority: Record<MuscleReadinessItem['status'], number> = {
      low_volume: 0,
      ready: 1,
      recovering: 2,
    };

    const sortedMuscles = [...hudItems].sort((a, b) => {
      const pDiff = statusPriority[a.status] - statusPriority[b.status];
      if (pDiff !== 0) return pDiff;
      if (a.weeklySets !== b.weeklySets) return a.weeklySets - b.weeklySets;
      return b.recoveryPct - a.recoveryPct;
    });

    const picks: RecommendedCardItem[] = [];
    for (const muscleInfo of sortedMuscles) {
      if (picks.length >= 4) break;
      const candidate =
        EXERCISES.find((ex) => ex.muscle === muscleInfo.muscle && ex.isRecommended) ??
        EXERCISES.find((ex) => ex.muscle === muscleInfo.muscle);

      if (!candidate) continue;

      const reasonTh =
        muscleInfo.status === 'low_volume'
          ? `ฝึกน้อยไป · ${muscleInfo.weeklySets}/10 เซ็ต`
          : muscleInfo.status === 'ready'
            ? `พร้อมฝึก · ${muscleInfo.weeklySets} เซ็ต/7วัน`
            : `ฟื้นตัว ${muscleInfo.recoveryPct}%`;

      picks.push({
        exercise: candidate,
        readiness: muscleInfo,
        reasonTh,
        isPriorityLow: muscleInfo.status === 'low_volume',
      });
    }

    return picks;
  }, [history, selectedMuscle]);

  return (
    <section
      className={`glass-card rounded-2xl overflow-hidden ${
        selectedMuscle ? 'glass-card-volt' : ''
      }`}
    >
      {/* Clean Single-Row Collapsible Accordion Header */}
      <div
        className={`px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 relative z-10 ${
          expanded ? 'border-b border-white/[0.06]' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex-1 min-w-0 flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 rounded-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FF4500]/14 text-[#FF4500] ring-1 ring-[#FF4500]/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg sm:text-xl tracking-wide text-[#F8FAFC] leading-none">
              {selectedMuscle
                ? `ท่าฝึกโฟกัส${MUSCLE_LABEL_TH[selectedMuscle]}`
                : 'ท่าฝึกแนะนำสำหรับคุณ'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1A1D24] font-tech font-bold text-[10px] text-[#94A3B8] tabular-nums whitespace-nowrap">
              {recommendations.length} ท่า
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedMuscle && onClearMuscleFilter && (
            <button
              type="button"
              onClick={onClearMuscleFilter}
              aria-label="ล้างตัวกรองกล้ามเนื้อ"
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 px-2 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>ทั้งหมด</span>
              <X className="w-3 h-3 text-[#FF4500]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="h-8 px-2.5 rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[11px] font-semibold text-[#F8FAFC] inline-flex items-center gap-1 whitespace-nowrap active:scale-[0.98] transition-all"
          >
            <span>{expanded ? 'ซ่อน' : 'เปิดดู'}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#FF4500]" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible 2x2 Responsive Grid */}
      {expanded && (
      <div className="p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch relative z-10 drawer-reveal">
        {recommendations.map(({ exercise, reasonTh, isPriorityLow }, idx) => (
          <TiltCard3D
            key={`${selectedMuscle ?? 'all'}-${exercise.id}`}
            maxTiltDeg={3}
            style={{ '--stagger': idx } as React.CSSProperties}
            className="stagger-card bg-[#161A23] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl p-3.5 h-full flex flex-col justify-between gap-3 overflow-hidden transition-colors hover:border-white/[0.12]"
          >
            <div className="flex items-center gap-3 relative z-10">
              <MuscleBadgeIcon
                muscle={exercise.muscle}
                size="thumb"
                tone="cobalt"
                recommended={Boolean(exercise.isRecommended)}
              />

              <div className="min-w-0 flex-1">
                <span
                  className={`block text-[11px] font-semibold whitespace-normal break-words leading-snug tabular-nums ${
                    isPriorityLow ? 'text-[#38BDF8]' : 'text-[#8A94A6]'
                  }`}
                >
                  {reasonTh}
                </span>

                <h3 className="font-semibold text-[15px] tracking-[-0.01em] text-[#F8FAFC] whitespace-normal break-words leading-snug mt-0.5">
                  {exercise.name}
                </h3>

                <div className="mt-0.5 text-[11.5px] text-[#8A94A6] whitespace-normal break-words leading-snug">
                  <span className="text-[#CBD5E1] font-medium">
                    {MUSCLE_LABEL_TH[exercise.muscle]}
                  </span>
                  <span aria-hidden="true" className="text-[#475569]"> · </span>
                  <span className="font-tech">{exercise.equipment}</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.06] grid grid-cols-2 gap-2 relative z-10">
              <button
                type="button"
                onClick={() => onOpenGuide(exercise.id)}
                className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3 rounded-xl text-xs font-semibold text-[#E2E8F0] inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>วิธีฝึก</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickStartExercise(exercise.id)}
                className="btn-tactile btn-volt active:scale-[0.98] transition-all h-9 px-3 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>เริ่มฝึกเลย</span>
              </button>
            </div>
          </TiltCard3D>
        ))}
      </div>
      )}
    </section>
  );
};
