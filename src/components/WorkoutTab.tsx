import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Minus,
  Check,
  Trash2,
  Trophy,
  Clock,
  BookOpen,
  Play,
  X,
  CheckCircle2,
  ArrowLeftRight,
  TrendingUp,
  Volume2,
  VolumeX,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';
import {
  ActiveWorkout,
  AthleteGender,
  AthleteProfile,
  CompletedWorkout,
  CustomRoutine,
  DailyEnergyMode,
  MuscleGroup,
  RoutineExerciseConfig,
  SetType,
} from '../types';
import { EXERCISE_MAP, MUSCLE_LABEL_TH } from '../data/exercises';
import { PRESET_TEMPLATES } from '../data/presets';
import {
  calculateEpley1RM,
  formatDuration,
  formatNumber,
  getHistoricalBest1RM,
  getPreviousExerciseSets,
} from '../utils/analytics';
import {
  formatRelativeStrength,
  getAthleteGender,
  getBeginnerStartingWeight,
  getDoubleProgressionTarget,
  getGoalConfig,
  getRecommendedPreset,
} from '../utils/personalization';
import { DailyFinisherChallenge } from '../utils/gamification';
import { AthleticWatermark } from './AthleticWatermark';
import { MuscleBadgeIcon } from './MuscleBadge';
import { BarbellPlateCalculator } from './BarbellPlateCalculator';
import { MuscleReadinessHud } from './MuscleReadinessHud';
import { ExerciseSwapModal } from './ExerciseSwapModal';
import { RecommendedExercises } from './RecommendedExercises';
import { AnimatedNumber } from './AnimatedNumber';
import { ReadinessCommandCenter } from './ReadinessCommandCenter';
import { TiltCard3D } from './TiltCard3D';
import { DailyFinisherCard } from './DailyFinisherCard';
import { ScrollRevealSection } from './ScrollRevealSection';

interface WorkoutTabProps {
  activeWorkout: ActiveWorkout | null;
  history: CompletedWorkout[];
  customRoutines: CustomRoutine[];
  profile: AthleteProfile | null;
  bonusXp: number;
  finisherCount: number;
  energyMode: DailyEnergyMode;
  soundEnabled: boolean;
  onChangeEnergyMode: (mode: DailyEnergyMode) => void;
  onClaimFinisherXp: (challenge: DailyFinisherChallenge) => void;
  onToggleSound: () => void;
  onStartEmptyWorkout: () => void;
  onStartFromRoutine: (name: string, exercises: RoutineExerciseConfig[]) => void;
  onQuickStartExercise: (exerciseId: string) => void;
  onUpdateWorkoutName: (name: string) => void;
  onOpenExercisePicker: () => void;
  onSwapExercise: (workoutExerciseId: string, newExerciseId: string) => void;
  onRemoveExercise: (workoutExerciseId: string) => void;
  onChangeExerciseRest: (workoutExerciseId: string, restSec: number) => void;
  onAddSet: (workoutExerciseId: string) => void;
  onRemoveSet: (workoutExerciseId: string, setId: string) => void;
  onUpdateSetField: (
    workoutExerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => void;
  onCycleSetType: (workoutExerciseId: string, setId: string) => void;
  onToggleSetComplete: (workoutExerciseId: string, setId: string) => void;
  onFinishWorkout: () => void;
  onDiscardWorkout: () => void;
  onOpenGuide: (exerciseId: string) => void;
  onGoToRoutines: () => void;
  onOpenProfile: () => void;
  onChangeGender: (gender: AthleteGender) => void;
  onInspectPeakPR?: (exerciseId: string | null) => void;
}

const REST_OPTIONS = [60, 90, 120, 150, 180];

const SET_TYPE_STYLES: Record<
  SetType,
  { label: string; shortTh: string; className: string; title: string }
> = {
  W: {
    label: 'W',
    shortTh: 'วอร์ม',
    className: 'bg-[#1F2430] text-[#94A3B8]',
    title: 'W = วอร์มอัพ (Warm-up — ไม่นับรวม PR และสถิติหลัก)',
  },
  N: {
    label: 'N',
    shortTh: 'ฝึกจริง',
    className: 'bg-[#1F2430] text-[#F8FAFC] ring-1 ring-white/[0.1]',
    title: 'N = เซ็ตฝึกจริง (Normal Working Set)',
  },
  F: {
    label: 'F',
    shortTh: 'หมดแรง',
    className: 'bg-[#FF4500]/18 text-[#FF4500] ring-1 ring-[#FF4500]/40',
    title: 'F = ฝึกจนหมดแรง (Failure)',
  },
};

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  activeWorkout,
  history,
  customRoutines,
  profile,
  bonusXp,
  finisherCount,
  energyMode,
  soundEnabled,
  onChangeEnergyMode,
  onClaimFinisherXp,
  onToggleSound,
  onStartEmptyWorkout,
  onStartFromRoutine,
  onQuickStartExercise,
  onUpdateWorkoutName,
  onOpenExercisePicker,
  onSwapExercise,
  onRemoveExercise,
  onChangeExerciseRest,
  onAddSet,
  onRemoveSet,
  onUpdateSetField,
  onCycleSetType,
  onToggleSetComplete,
  onFinishWorkout,
  onDiscardWorkout,
  onOpenGuide,
  onGoToRoutines,
  onOpenProfile,
  onChangeGender,
  onInspectPeakPR,
}) => {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [quickProgramsOpen, setQuickProgramsOpen] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{
    workoutExerciseId: string;
    exerciseId: string;
  } | null>(null);

  const athleteGender = getAthleteGender(profile);
  const goalConfig = useMemo(() => getGoalConfig(profile), [profile]);
  const recommendedPreset = useMemo(() => getRecommendedPreset(profile), [profile]);

  useEffect(() => {
    if (!activeWorkout) {
      setElapsedSec(0);
      setConfirmDiscard(false);
      return;
    }
    const tick = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - activeWorkout.startedAt) / 1000)));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeWorkout]);

  const sessionStats = useMemo(() => {
    if (!activeWorkout) return { completedSets: 0, totalSets: 0, volume: 0, prCount: 0 };
    let completedSets = 0;
    let totalSets = 0;
    let volume = 0;
    let prCount = 0;

    for (const ex of activeWorkout.exercises) {
      for (const s of ex.sets) {
        totalSets += 1;
        if (s.completed) {
          completedSets += 1;
          const w = parseFloat(s.weight) || 0;
          const r = parseInt(s.reps, 10) || 0;
          volume += w * r;
          if (s.isPR) prCount += 1;
        }
      }
    }
    return { completedSets, totalSets, volume: Math.round(volume), prCount };
  }, [activeWorkout]);

  // ================= IDLE / CINEMATIC ATHLETIC DASHBOARD =================
  if (!activeWorkout) {
    return (
      <div>
        {/* Full-Viewport Cinematic Hero Showcase (min-h-[88vh]) */}
        <ReadinessCommandCenter
          history={history}
          activeWorkout={activeWorkout}
          profile={profile}
          bonusXp={bonusXp}
          energyMode={energyMode}
          soundEnabled={soundEnabled}
          onChangeEnergyMode={onChangeEnergyMode}
          onStartEmptyWorkout={onStartEmptyWorkout}
          onGoToRoutines={onGoToRoutines}
          onOpenProfile={onOpenProfile}
          onInspectPeakPR={onInspectPeakPR}
        />

        {/* Streamlined Low-Scroll Mobile Dashboard Sections */}
        <div className="space-y-3.5 py-4 sm:py-5">
          {/* Section 1: Compact Interactive Body Scan + 2-Col 7-Muscle Mini-Pill Grid */}
          <div id="anatomy-section" className="scroll-mt-20">
            <ScrollRevealSection>
              <MuscleReadinessHud
                history={history}
                selectedMuscle={selectedMuscle}
                onSelectMuscle={setSelectedMuscle}
                gender={athleteGender}
                onChangeGender={onChangeGender}
              />
            </ScrollRevealSection>
          </div>

          {/* Section 2: Unified Single-Row Collapsible Drawers (Closed by Default on Mobile) */}
          <ScrollRevealSection>
            <section className="space-y-2.5" aria-label="เครื่องมือและโปรแกรมฝึก">
              <div className="flex items-center justify-between px-1">
                <span className="editorial-label !text-[#94A3B8]">
                  QUICK TOOLS &amp; PROGRAMS
                </span>
                <span className="text-[11px] text-[#64748B]">แตะเพื่อเปิดใช้งาน</span>
              </div>

              {/* Drawer 1: Recommended Exercises */}
              <RecommendedExercises
                history={history}
                selectedMuscle={selectedMuscle}
                defaultOpen={false}
                onClearMuscleFilter={() => setSelectedMuscle(null)}
                onOpenGuide={onOpenGuide}
                onQuickStartExercise={onQuickStartExercise}
              />

              {/* Drawer 2: Quick Start Programs (Presets + Custom Routines) */}
              <section className="glass-card rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuickProgramsOpen((v) => !v)}
                  aria-expanded={quickProgramsOpen}
                  className={`w-full text-left px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4500]/70 ${
                    quickProgramsOpen ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#1A1D24] text-[#FF4500] ring-1 ring-white/[0.08] flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="font-display text-lg sm:text-xl tracking-wide text-[#F8FAFC] leading-none">
                        QUICK START PROGRAMS
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#1A1D24] font-tech font-bold text-[10px] text-[#94A3B8] tabular-nums whitespace-nowrap">
                        {PRESET_TEMPLATES.length + customRoutines.length} โปรแกรม
                      </span>
                    </div>
                  </div>

                  <span className="h-8 px-2.5 rounded-xl bg-[#1A1D24] text-[11px] font-semibold text-[#F8FAFC] inline-flex items-center gap-1 whitespace-nowrap shrink-0">
                    <span>{quickProgramsOpen ? 'ซ่อน' : 'เปิดดู'}</span>
                    {quickProgramsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#FF4500]" />
                    )}
                  </span>
                </button>

                {quickProgramsOpen && (
                  <div className="p-3.5 sm:p-5 space-y-4 drawer-reveal relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="editorial-label !text-[#FF4500]">READY-TO-LIFT TEMPLATES</span>
                      <button
                        type="button"
                        onClick={onGoToRoutines}
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 px-3 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0"
                      >
                        ดูตารางทั้งหมด →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
                      {PRESET_TEMPLATES.map((tpl, idx) => {
                        const firstDay = tpl.days[0];
                        const leadExercise = EXERCISE_MAP[firstDay.exercises[0]?.exerciseId];
                        const isRecommended = recommendedPreset?.presetId === tpl.id;
                        return (
                          <TiltCard3D
                            key={tpl.id}
                            maxTiltDeg={5}
                            style={{ '--stagger': idx } as React.CSSProperties}
                            className="stagger-card glass-metal-card rounded-2xl overflow-hidden h-full flex flex-col justify-between active:scale-[0.98] transition-all"
                          >
                            <div className="px-3.5 py-2 border-b border-white/[0.07] flex items-center justify-between gap-2 relative z-10">
                              <span className="editorial-label whitespace-normal break-words leading-snug min-w-0">
                                {tpl.level} · {tpl.frequency}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isRecommended && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FACC15] text-[#090A0D] font-extrabold text-[10px] tracking-wide whitespace-nowrap">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    แนะนำ
                                  </span>
                                )}
                                {leadExercise && <MuscleBadgeIcon muscle={leadExercise.muscle} size="sm" />}
                              </div>
                            </div>
                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 relative z-10">
                              <div className="space-y-1">
                                <h3 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none">
                                  {tpl.title}
                                </h3>
                                <p className="text-xs text-[#94A3B8] leading-snug">
                                  {firstDay.label}: {firstDay.subtitle} ({firstDay.exercises.length} ท่า)
                                </p>
                                {goalConfig && (
                                  <div className="text-[11px] text-[#94A3B8] font-tech font-semibold tabular-nums">
                                    เป้า: <span className="text-[#F8FAFC]">{goalConfig.repRange} ครั้ง</span> · พัก{' '}
                                    <span className="text-[#F8FAFC]">{goalConfig.restSec}s</span>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  onStartFromRoutine(`${tpl.title} — ${firstDay.label}`, firstDay.exercises)
                                }
                                className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full h-9 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                เริ่มฝึก ({firstDay.label})
                              </button>
                            </div>
                          </TiltCard3D>
                        );
                      })}
                    </div>

                    {customRoutines.length > 0 && (
                      <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                        <div className="editorial-label">ตารางฝึกส่วนตัวของคุณ ({customRoutines.length})</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
                          {customRoutines.slice(0, 3).map((routine) => (
                            <div
                              key={routine.id}
                              className="glass-metal-card rounded-2xl p-3.5 flex flex-col justify-between gap-2.5"
                            >
                              <div>
                                <div className="editorial-label tabular-nums">
                                  CUSTOM · {routine.exercises.length} ท่า
                                </div>
                                <h4 className="text-sm font-bold text-[#F8FAFC] mt-0.5 whitespace-normal break-words leading-snug">
                                  {routine.name}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={() => onStartFromRoutine(routine.name, routine.exercises)}
                                className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full h-9 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                เริ่มฝึกตามตารางนี้
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Drawer 3: Olympic Barbell Visualizer */}
              <BarbellPlateCalculator
                defaultOpen={false}
                soundEnabled={soundEnabled}
                gender={athleteGender}
              />

              {/* Drawer 4: Daily Finisher Challenge */}
              <DailyFinisherCard
                defaultOpen={false}
                completedCount={finisherCount}
                soundEnabled={soundEnabled}
                gender={athleteGender}
                onClaimXp={onClaimFinisherXp}
              />
            </section>
          </ScrollRevealSection>
        </div>
      </div>
    );
  }

  // ================= ACTIVE WORKOUT TACTICAL HUD LOGGER =================
  const setsProgressPct =
    sessionStats.totalSets > 0
      ? Math.min(100, Math.round((sessionStats.completedSets / sessionStats.totalSets) * 100))
      : 0;
  const hudRingRadius = 21;
  const hudRingCircumference = 2 * Math.PI * hudRingRadius;
  const hudRingOffset = hudRingCircumference * (1 - setsProgressPct / 100);

  return (
    <div className="space-y-6">
      {/* Compact Pro-Grade Tactical Live Session HUD */}
      <div className="hero-ambient-glow">
        <section className="tactical-hud-panel rounded-3xl overflow-hidden relative z-10 ring-1 ring-[#FF4500]/25">
          <div className="knurl-divider" />
          <AthleticWatermark
            variant="barbell"
            className="absolute -right-10 top-0 w-64 h-32 text-[#F8FAFC] opacity-[0.025]"
          />

          <div className="relative z-10 divide-y divide-white/10">
            {/* Top Bar: BEAST MODE Live Indicator + Workout Title + Sound FX + Finish Controls */}
            <div className="px-4 sm:px-7 py-4 sm:py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 editorial-label !text-[#FF4500]">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span className="anim-live-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500]" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4500]" />
                    </span>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>BEAST MODE · LIVE SESSION</span>
                  </span>
                  {sessionStats.prCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FACC15] text-[#090A0D] font-display text-sm tracking-wider leading-none">
                      <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <AnimatedNumber value={sessionStats.prCount} durationMs={260} /> NEW PR!
                    </span>
                  )}
                </div>

                <label htmlFor="workout-title-input" className="sr-only">
                  ชื่อเซสชันการฝึก
                </label>
                <input
                  id="workout-title-input"
                  type="text"
                  value={activeWorkout.name}
                  onChange={(e) => onUpdateWorkoutName(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-[#F8FAFC] focus:outline-none border-b border-transparent focus:border-[#FF4500]/65 pb-0.5 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-pressed={soundEnabled}
                  className={`btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3 rounded-xl text-xs font-tech font-bold inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                    soundEnabled ? 'ring-1 ring-[#FF4500]/45' : ''
                  }`}
                  title="เปิด/ปิดเสียงเอฟเฟกต์ยิม (Set Tick, 3-2-1-GO Rest Alert, NEW PR Fanfare)"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#FF4500]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                  <span>{soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
                </button>

                {!confirmDiscard ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDiscard(true)}
                    className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                  >
                    ยกเลิก
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDiscard(false)}
                      className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3 rounded-xl text-xs font-bold"
                    >
                      เก็บไว้
                    </button>
                    <button
                      type="button"
                      onClick={onDiscardWorkout}
                      className="btn-tactile active:scale-[0.98] transition-all h-9 px-3 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold"
                    >
                      ยืนยันทิ้ง
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onFinishWorkout}
                  className="btn-tactile btn-volt active:scale-[0.98] transition-all h-10 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>จบการฝึก</span>
                </button>
              </div>
            </div>

            {/* Unified 3-Column Tactical Telemetry Strip with Crisp Vertical Hairlines & Circular Progress Ring */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 tabular-nums bg-[#090A0D]/35">
              {/* Live Session Timer */}
              <div className="px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="editorial-label">SESSION TIMER</div>
                  <div className="font-display text-4xl sm:text-[2.85rem] tracking-wide text-[#F8FAFC] leading-none mt-1">
                    {formatDuration(elapsedSec)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#FF4500]" />
                </div>
              </div>

              {/* Rolling Total Tonnage Lifted */}
              <div className="px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="editorial-label !text-[#FF4500]">
                    TOTAL TONNAGE LIFTED
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-display text-4xl sm:text-[2.85rem] tracking-wide text-[#F8FAFC] leading-none">
                      <AnimatedNumber value={sessionStats.volume} durationMs={420} />
                    </span>
                    <span className="font-tech font-bold text-xs text-[#94A3B8] tracking-widest uppercase">KG</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#94A3B8] leading-tight">
                  <div>น้ำหนักรวม</div>
                  <div className="text-[#FF4500] font-tech font-extrabold text-[10px] tracking-widest mt-0.5">LIVE</div>
                </div>
              </div>

              {/* Sets Progress with Smooth Mini Circular SVG Ring */}
              <div className="px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="editorial-label">SETS COMPLETED</div>
                  <div className="font-display text-4xl sm:text-[2.85rem] tracking-wide text-[#F8FAFC] leading-none mt-1">
                    <AnimatedNumber value={sessionStats.completedSets} durationMs={260} />
                    <span className="text-[#64748B]">/{sessionStats.totalSets}</span>
                  </div>
                </div>
                <div className="relative w-[52px] h-[52px] shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90" aria-hidden="true">
                    <circle
                      cx="26"
                      cy="26"
                      r={hudRingRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="3.5"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r={hudRingRadius}
                      fill="none"
                      stroke="#FF4500"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={hudRingCircumference}
                      strokeDashoffset={hudRingOffset}
                      style={{ transition: 'stroke-dashoffset 320ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-tech font-bold text-[11px] text-[#F8FAFC] tabular-nums">
                    {setsProgressPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Set Type Legend & Personalized Goal Target */}
            <div className="px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[#94A3B8]">
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                <span>แตะรหัสเพื่อสลับประเภท:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="px-1.5 h-5 rounded-md bg-[#1A1D24] text-[#94A3B8] inline-flex items-center justify-center text-[11px] font-bold">
                    W
                  </span>
                  <span>วอร์มอัพ (ไม่นับ PR)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="px-1.5 h-5 rounded-md bg-[#1A1D24] text-[#F8FAFC] ring-1 ring-white/[0.08] inline-flex items-center justify-center text-[11px] font-bold">
                    N
                  </span>
                  <span>เซ็ตฝึกจริง</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="px-1.5 h-5 rounded-md bg-[#FF4500]/16 text-[#FF4500] inline-flex items-center justify-center text-[11px] font-bold">
                    F
                  </span>
                  <span>หมดแรง</span>
                </span>
              </div>

              {goalConfig && (
                <div className="text-xs font-tech text-[#94A3B8] tabular-nums">
                  เป้า {goalConfig.labelEn}: <strong className="text-[#F8FAFC]">{goalConfig.repRange} ครั้ง</strong> · พัก{' '}
                  <strong className="text-[#F8FAFC]">{goalConfig.restSec}s</strong>
                  {profile?.bodyWeightKg ? ` · BW ${profile.bodyWeightKg} kg` : ''}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Collapsible Barbell Plate Calculator during Active Workout */}
      <BarbellPlateCalculator
        defaultOpen={false}
        soundEnabled={soundEnabled}
        gender={athleteGender}
      />

      {/* Exercise Cards */}
      {activeWorkout.exercises.length === 0 ? (
        <div className="glass-card rounded-3xl border-dashed p-10 text-center space-y-4">
          <p className="text-sm text-[#94A3B8]">ยังไม่มีท่าฝึกในเซสชันนี้</p>
          <button
            type="button"
            onClick={onOpenExercisePicker}
            className="btn-tactile btn-volt active:scale-[0.98] transition-all min-h-[46px] px-5 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            เพิ่มท่าฝึกแรก
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {activeWorkout.exercises.map((wEx) => {
            const def = EXERCISE_MAP[wEx.exerciseId];
            if (!def) return null;

            const prevSets = getPreviousExerciseSets(history, wEx.exerciseId);
            const historicalBest1RM = getHistoricalBest1RM(history, wEx.exerciseId);
            const historicalRelStrength = formatRelativeStrength(
              historicalBest1RM,
              profile?.bodyWeightKg
            );

            return (
              <article
                key={wEx.id}
                className="glass-card rounded-3xl overflow-hidden"
              >
                {/* Clean Exercise Card Header with Muscle SVG Badge */}
                <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                    <MuscleBadgeIcon muscle={def.muscle} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-2xl sm:text-3xl tracking-wide text-[#F8FAFC] leading-none">
                          {def.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setSwapTarget({
                              workoutExerciseId: wEx.id,
                              exerciseId: wEx.exerciseId,
                            })
                          }
                          title="สลับท่าด่วนเมื่อเครื่องไม่ว่าง (เฉพาะเซสชันนี้)"
                          className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-[#FF4500]" />
                          <span>สลับท่า</span>
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94A3B8]">
                        <span className="text-[#F8FAFC] font-medium">
                          {MUSCLE_LABEL_TH[def.muscle]} ({def.muscle})
                        </span>
                        <span aria-hidden="true" className="text-[#475569]">·</span>
                        <span>{def.subMuscleTh} ({def.subMuscleEn})</span>
                        <span aria-hidden="true" className="text-[#475569]">·</span>
                        <span>{def.equipment}</span>
                        {historicalBest1RM > 0 && (
                          <>
                            <span aria-hidden="true" className="text-[#475569]">·</span>
                            <span className="text-[#F8FAFC] font-tech tabular-nums">
                              1RM เดิม {formatNumber(historicalBest1RM)} kg
                              {historicalRelStrength && (
                                <span className="text-[#94A3B8] font-medium ml-1.5">
                                  ({historicalRelStrength})
                                </span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <label className="sr-only" htmlFor={`rest-${wEx.id}`}>
                      เวลาพักอัตโนมัติ
                    </label>
                    <select
                      id={`rest-${wEx.id}`}
                      value={wEx.restSec}
                      onChange={(e) => onChangeExerciseRest(wEx.id, Number(e.target.value))}
                      className="btn-cobalt h-9 px-2.5 rounded-xl text-xs font-tech font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF4500]/70"
                      title="ตั้งเวลาพักอัตโนมัติหลังติ๊กจบเซ็ต"
                    >
                      {REST_OPTIONS.map((sec) => (
                        <option key={sec} value={sec} className="bg-[#12141A] text-[#F8FAFC]">
                          พัก {sec}s
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onOpenGuide(wEx.exerciseId)}
                      aria-label={`คู่มือท่า ${def.name}`}
                      title="ดูคู่มือ 3 ขั้นตอน"
                      className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 w-9 flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#FF4500]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveExercise(wEx.id)}
                      aria-label={`ลบท่า ${def.name}`}
                      title="ลบท่าฝึกนี้"
                      className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 w-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Headers (sm+ horizontal table; mobile uses labeled stacked steppers) */}
                <div className="hidden sm:grid sm:grid-cols-[54px_1fr_148px_132px_52px] gap-2.5 px-7 py-2.5 editorial-label border-b border-white/[0.06] bg-[#090A0D]/40">
                  <span className="text-center">SET</span>
                  <span>PREVIOUS / TARGET</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">REPS</span>
                  <span className="text-center">LOG</span>
                </div>

                {/* Set Rows */}
                <div className="divide-y divide-white/[0.05]">
                  {wEx.sets.map((set, idx) => {
                    const prev = prevSets[idx];
                    const typeInfo = SET_TYPE_STYLES[set.type];
                    const wNum = parseFloat(set.weight) || 0;
                    const rNum = parseInt(set.reps, 10) || 0;
                    const live1RM = wNum > 0 && rNum > 0 ? calculateEpley1RM(wNum, rNum) : 0;
                    const set1RM = set.est1RM ?? live1RM;
                    const relStrengthLabel = formatRelativeStrength(set1RM, profile?.bodyWeightKg);
                    const coachTarget = getDoubleProgressionTarget(
                      prev,
                      profile,
                      set.type,
                      def.equipment
                    );

                    const applyCoachTarget = () => {
                      if (!coachTarget) return;
                      onUpdateSetField(
                        wEx.id,
                        set.id,
                        'weight',
                        String(coachTarget.targetWeight)
                      );
                      onUpdateSetField(
                        wEx.id,
                        set.id,
                        'reps',
                        String(coachTarget.targetReps)
                      );
                    };

                    const beginnerStartWeight = getBeginnerStartingWeight(
                      def.equipment,
                      def.muscle,
                      profile
                    );
                    const weightSeed =
                      coachTarget?.targetWeight ?? prev?.weight ?? beginnerStartWeight;
                    const repsSeed =
                      coachTarget?.targetReps ?? prev?.reps ?? goalConfig?.minReps ?? 10;
                    const weightStep =
                      athleteGender === 'female' &&
                      (def.equipment === 'Dumbbell' || def.equipment === 'Cable')
                        ? 1.25
                        : 2.5;

                    const stepWeight = (delta: number) => {
                      const base = set.weight.trim() !== '' ? parseFloat(set.weight) || 0 : weightSeed;
                      const next = Math.max(0, Math.round((base + delta) * 4) / 4);
                      onUpdateSetField(wEx.id, set.id, 'weight', String(next));
                    };

                    const stepReps = (delta: number) => {
                      const base = set.reps.trim() !== '' ? parseInt(set.reps, 10) || 0 : repsSeed;
                      const next = Math.max(0, base + delta);
                      onUpdateSetField(wEx.id, set.id, 'reps', String(next));
                    };

                    return (
                      <div
                        key={set.id}
                        className={`px-4 sm:px-7 py-3.5 transition-colors ${
                          set.completed ? 'bg-[#FF4500]/[0.06]' : ''
                        }`}
                      >
                        {/* MOBILE (< sm): Thumb-Friendly Native 2-Row Logger (All steppers >= 44x44px) */}
                        <div className="sm:hidden space-y-2.5">
                          <div className="flex items-center justify-between gap-2.5">
                            <button
                              type="button"
                              onClick={() => onCycleSetType(wEx.id, set.id)}
                              title={typeInfo.title}
                              className={`btn-tactile active:scale-[0.98] transition-all min-h-[44px] min-w-[54px] px-2 rounded-xl text-xs font-bold tabular-nums flex flex-col items-center justify-center leading-none gap-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${typeInfo.className}`}
                            >
                              <span>
                                {typeInfo.label}
                                {idx + 1}
                              </span>
                              <span className="text-[9.5px] opacity-80 font-sans font-semibold">
                                {typeInfo.shortTh}
                              </span>
                            </button>

                            <div className="min-w-0 flex-1">
                              {prev ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateSetField(wEx.id, set.id, 'weight', String(prev.weight));
                                    onUpdateSetField(wEx.id, set.id, 'reps', String(prev.reps));
                                  }}
                                  title="แตะเพื่อดึงค่าน้ำหนักและจำนวนครั้งจากครั้งก่อน"
                                  className="text-left min-h-[44px] flex flex-col justify-center w-full px-1.5 rounded-lg hover:bg-white/[0.04] active:scale-[0.98] transition-all"
                                >
                                  <span className="text-[10px] text-[#64748B] leading-tight">
                                    ครั้งก่อน (แตะดึงค่า)
                                  </span>
                                  <span className="text-xs text-[#CBD5E1] font-tech font-semibold tabular-nums whitespace-normal break-words leading-snug">
                                    {formatNumber(prev.weight)}kg × {prev.reps}
                                  </span>
                                </button>
                              ) : beginnerStartWeight > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateSetField(wEx.id, set.id, 'weight', String(beginnerStartWeight));
                                    onUpdateSetField(wEx.id, set.id, 'reps', String(repsSeed));
                                  }}
                                  title="แตะเพื่อกรอกน้ำหนักเริ่มต้นแนะนำ"
                                  className="text-left min-h-[44px] flex flex-col justify-center w-full px-1.5 rounded-lg hover:bg-white/[0.04] active:scale-[0.98] transition-all"
                                >
                                  <span className="text-[10px] text-[#64748B] leading-tight">
                                    เริ่มต้นแนะนำ (แตะใช้ค่า)
                                  </span>
                                  <span className="text-xs text-[#94A3B8] font-tech font-semibold tabular-nums whitespace-normal break-words leading-snug">
                                    ~{formatNumber(beginnerStartWeight)}kg × {repsSeed}
                                  </span>
                                </button>
                              ) : (
                                <div className="text-xs text-[#64748B] px-1">เซ็ตที่ {idx + 1}</div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onToggleSetComplete(wEx.id, set.id)}
                              aria-label={set.completed ? 'ยกเลิกการบันทึกเซ็ต' : 'บันทึกเซ็ตสำเร็จ'}
                              title="บันทึกเซ็ต"
                              className={`btn-tactile active:scale-[0.98] transition-all min-h-[44px] min-w-[52px] rounded-xl flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80 ${
                                set.completed
                                  ? 'btn-volt anim-set-check'
                                  : 'btn-cobalt text-[#94A3B8] hover:text-[#F8FAFC]'
                              }`}
                            >
                              <Check className="w-5 h-5 stroke-[2.75]" />
                            </button>
                          </div>

                          {/* Mobile Row 2: Dedicated 2-Column 44x44px Thumb Steppers (KG + REPS) */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <div className="text-[10px] font-tech font-bold tracking-wider uppercase text-[#64748B] px-1">
                                WEIGHT (KG)
                              </div>
                              <div
                                className={`flex items-center rounded-xl bg-[#161923] border transition-all overflow-hidden min-h-[44px] ${
                                  set.completed
                                    ? 'border-[#FF4500]/45'
                                    : 'border-white/[0.08] focus-within:border-[#FF4500]/70 focus-within:ring-1 focus-within:ring-[#FF4500]/60'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => stepWeight(-weightStep)}
                                  aria-label={`ลดน้ำหนักเซ็ตที่ ${idx + 1} ลง ${weightStep} กิโลกรัม`}
                                  className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] active:bg-white/[0.14] active:scale-[0.98] transition-all"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.5"
                                  min="0"
                                  value={set.weight}
                                  onChange={(e) =>
                                    onUpdateSetField(wEx.id, set.id, 'weight', e.target.value)
                                  }
                                  placeholder={
                                    coachTarget
                                      ? String(coachTarget.targetWeight)
                                      : prev
                                        ? String(prev.weight)
                                        : String(beginnerStartWeight)
                                  }
                                  aria-label={`น้ำหนักเซ็ตที่ ${idx + 1}`}
                                  className="w-full min-w-0 bg-transparent text-center font-tech font-bold text-base tracking-tight tabular-nums text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none px-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => stepWeight(weightStep)}
                                  aria-label={`เพิ่มน้ำหนักเซ็ตที่ ${idx + 1} ขึ้น ${weightStep} กิโลกรัม`}
                                  className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#FF4500] hover:bg-white/[0.06] active:bg-white/[0.14] active:scale-[0.98] transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] font-tech font-bold tracking-wider uppercase text-[#64748B] px-1">
                                REPS (ครั้ง)
                              </div>
                              <div
                                className={`flex items-center rounded-xl bg-[#161923] border transition-all overflow-hidden min-h-[44px] ${
                                  set.completed
                                    ? 'border-[#FF4500]/45'
                                    : 'border-white/[0.08] focus-within:border-[#FF4500]/70 focus-within:ring-1 focus-within:ring-[#FF4500]/60'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => stepReps(-1)}
                                  aria-label={`ลดจำนวนครั้งเซ็ตที่ ${idx + 1} ลง 1 ครั้ง`}
                                  className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] active:bg-white/[0.14] active:scale-[0.98] transition-all"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  step="1"
                                  min="0"
                                  value={set.reps}
                                  onChange={(e) =>
                                    onUpdateSetField(wEx.id, set.id, 'reps', e.target.value)
                                  }
                                  placeholder={
                                    coachTarget
                                      ? String(coachTarget.targetReps)
                                      : prev
                                        ? String(prev.reps)
                                        : '0'
                                  }
                                  aria-label={`จำนวนครั้งเซ็ตที่ ${idx + 1}`}
                                  className="w-full min-w-0 bg-transparent text-center font-tech font-bold text-base tracking-tight tabular-nums text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none px-0.5"
                                />
                                <button
                                  type="button"
                                  onClick={() => stepReps(1)}
                                  aria-label={`เพิ่มจำนวนครั้งเซ็ตที่ ${idx + 1} ขึ้น 1 ครั้ง`}
                                  className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#FF4500] hover:bg-white/[0.06] active:bg-white/[0.14] active:scale-[0.98] transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DESKTOP & TABLET (sm+): Exact Preserved 5-Column Horizontal Logger */}
                        <div className="hidden sm:grid sm:grid-cols-[54px_1fr_148px_132px_52px] gap-2.5 items-center">
                          {/* Set Type Cycle Button */}
                          <button
                            type="button"
                            onClick={() => onCycleSetType(wEx.id, set.id)}
                            title={typeInfo.title}
                            className={`btn-tactile min-h-[44px] w-full rounded-xl text-xs font-bold tabular-nums flex flex-col items-center justify-center leading-none gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${typeInfo.className}`}
                          >
                            <span>
                              {typeInfo.label}
                              {idx + 1}
                            </span>
                            <span className="text-[9.5px] opacity-80 font-sans font-semibold">
                              {typeInfo.shortTh}
                            </span>
                          </button>

                          {/* Previous Stats + Smart Double-Progression Coach Badge */}
                          <div className="min-w-0 space-y-1">
                            {prev ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateSetField(wEx.id, set.id, 'weight', String(prev.weight));
                                    onUpdateSetField(wEx.id, set.id, 'reps', String(prev.reps));
                                  }}
                                  title="แตะเพื่อดึงค่าน้ำหนักและจำนวนครั้งจากครั้งก่อน"
                                  className="text-left group block w-full py-0.5 px-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                                >
                                  <div className="text-[10px] text-[#64748B] leading-tight">
                                    ครั้งก่อน
                                  </div>
                                  <div className="text-sm text-[#94A3B8] group-hover:text-[#F8FAFC] font-tech font-semibold tabular-nums whitespace-normal break-words leading-snug transition-colors">
                                    {formatNumber(prev.weight)}kg × {prev.reps}
                                  </div>
                                </button>

                                {coachTarget && !set.completed && (
                                  <button
                                    type="button"
                                    onClick={applyCoachTarget}
                                    title={`${coachTarget.reasonTh} — แตะเพื่อกรอกเป้าหมายอัตโนมัติ`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-tech tabular-nums transition-transform active:scale-95 whitespace-nowrap ${
                                      coachTarget.action === 'increase_weight'
                                        ? 'bg-[#FF4500] text-white'
                                        : 'bg-[#FF4500]/16 hover:bg-[#FF4500]/24 text-[#FF4500]'
                                    }`}
                                  >
                                    <TrendingUp className="w-3 h-3 shrink-0 stroke-[2.5]" />
                                    <span>{coachTarget.label}</span>
                                  </button>
                                )}
                              </>
                            ) : beginnerStartWeight > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateSetField(wEx.id, set.id, 'weight', String(beginnerStartWeight));
                                  onUpdateSetField(wEx.id, set.id, 'reps', String(repsSeed));
                                }}
                                title="แตะเพื่อกรอกน้ำหนักเริ่มต้นแนะนำตามสรีระและอุปกรณ์"
                                className="text-left group block w-full py-0.5 px-1.5 -ml-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                              >
                                <div className="text-[10px] text-[#64748B] leading-tight">
                                  แนะนำเริ่มต้น
                                </div>
                                <div className="text-xs text-[#94A3B8] group-hover:text-[#F8FAFC] font-tech font-semibold tabular-nums whitespace-normal break-words leading-snug transition-colors">
                                  ~{formatNumber(beginnerStartWeight)}kg × {repsSeed}
                                </div>
                              </button>
                            ) : (
                              <span className="text-xs text-[#475569] tabular-nums">—</span>
                            )}
                          </div>

                          {/* Tactile Weight Stepper (- / KG / +) */}
                          <div
                            className={`flex items-center rounded-xl bg-[#161923] border transition-all overflow-hidden min-h-[44px] ${
                              set.completed
                                ? 'border-[#FF4500]/45'
                                : 'border-white/[0.08] focus-within:border-[#FF4500]/70 focus-within:ring-1 focus-within:ring-[#FF4500]/60'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => stepWeight(-weightStep)}
                              aria-label={`ลดน้ำหนักเซ็ตที่ ${idx + 1} ลง ${weightStep} กิโลกรัม`}
                              title={`-${weightStep} kg`}
                              className="w-9 min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] active:bg-white/[0.12] active:scale-[0.98] transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.5"
                              min="0"
                              value={set.weight}
                              onChange={(e) =>
                                onUpdateSetField(wEx.id, set.id, 'weight', e.target.value)
                              }
                              placeholder={
                                coachTarget
                                  ? String(coachTarget.targetWeight)
                                  : prev
                                    ? String(prev.weight)
                                    : String(beginnerStartWeight)
                              }
                              aria-label={`น้ำหนักเซ็ตที่ ${idx + 1}`}
                              className="w-full min-w-0 bg-transparent text-center font-tech font-bold text-lg tracking-tight tabular-nums text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none px-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => stepWeight(weightStep)}
                              aria-label={`เพิ่มน้ำหนักเซ็ตที่ ${idx + 1} ขึ้น ${weightStep} กิโลกรัม`}
                              title={`+${weightStep} kg`}
                              className="w-9 min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#FF4500] hover:bg-white/[0.06] active:bg-white/[0.12] active:scale-[0.98] transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Tactile Reps Stepper (- / REPS / +) */}
                          <div
                            className={`flex items-center rounded-xl bg-[#161923] border transition-all overflow-hidden min-h-[44px] ${
                              set.completed
                                ? 'border-[#FF4500]/45'
                                : 'border-white/[0.08] focus-within:border-[#FF4500]/70 focus-within:ring-1 focus-within:ring-[#FF4500]/60'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => stepReps(-1)}
                              aria-label={`ลดจำนวนครั้งเซ็ตที่ ${idx + 1} ลง 1 ครั้ง`}
                              title="-1 rep"
                              className="w-8 min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] active:bg-white/[0.12] active:scale-[0.98] transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              inputMode="numeric"
                              step="1"
                              min="0"
                              value={set.reps}
                              onChange={(e) =>
                                onUpdateSetField(wEx.id, set.id, 'reps', e.target.value)
                              }
                              placeholder={
                                coachTarget
                                  ? String(coachTarget.targetReps)
                                  : prev
                                    ? String(prev.reps)
                                    : '0'
                              }
                              aria-label={`จำนวนครั้งเซ็ตที่ ${idx + 1}`}
                              className="w-full min-w-0 bg-transparent text-center font-tech font-bold text-lg tracking-tight tabular-nums text-[#F8FAFC] placeholder:text-[#475569] focus:outline-none px-0.5"
                            />
                            <button
                              type="button"
                              onClick={() => stepReps(1)}
                              aria-label={`เพิ่มจำนวนครั้งเซ็ตที่ ${idx + 1} ขึ้น 1 ครั้ง`}
                              title="+1 rep"
                              className="w-8 min-h-[44px] shrink-0 flex items-center justify-center text-[#94A3B8] hover:text-[#FF4500] hover:bg-white/[0.06] active:bg-white/[0.12] active:scale-[0.98] transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 1-Tap Checkoff Button with Tactile Haptic Pop */}
                          <button
                            type="button"
                            onClick={() => onToggleSetComplete(wEx.id, set.id)}
                            aria-label={set.completed ? 'ยกเลิกการบันทึกเซ็ต' : 'บันทึกเซ็ตสำเร็จ'}
                            title="บันทึกเซ็ต"
                            className={`btn-tactile active:scale-[0.98] transition-all min-h-[44px] w-full rounded-xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80 ${
                              set.completed
                                ? 'btn-volt anim-set-check'
                                : 'btn-cobalt text-[#94A3B8] hover:text-[#F8FAFC]'
                            }`}
                          >
                            <Check className="w-5 h-5 stroke-[2.75]" />
                          </button>
                        </div>

                        {/* Sub-row: Mobile Double-Progression Coach Badge + NEW PR! Gold Badge + Est. 1RM */}
                        <div className="mt-2.5 flex items-center justify-between gap-2 pl-0 sm:pl-[64px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            {coachTarget && !set.completed && (
                              <button
                                type="button"
                                onClick={applyCoachTarget}
                                title={`${coachTarget.reasonTh} — แตะเพื่อกรอกเป้าหมายอัตโนมัติ`}
                                className={`sm:hidden inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-tech font-bold tabular-nums transition-transform active:scale-95 whitespace-nowrap ${
                                  coachTarget.action === 'increase_weight'
                                    ? 'bg-[#FF4500] text-white'
                                    : 'bg-[#FF4500]/16 text-[#FF4500]'
                                }`}
                              >
                                <TrendingUp className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                                <span>{coachTarget.label}</span>
                              </button>
                            )}
                            {set.completed && set.isPR && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FACC15] text-[#090A0D] font-display text-sm tracking-wider leading-none">
                                <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
                                NEW PR! · 1RM {formatNumber(set1RM)} KG
                                {relStrengthLabel ? ` · ${relStrengthLabel}` : ''}
                              </span>
                            )}
                            {(!set.completed || !set.isPR) && live1RM > 0 && set.type !== 'W' && (
                              <span
                                className="text-[11px] text-[#94A3B8] font-tech tabular-nums"
                                title="ประมาณการน้ำหนักสูงสุดที่ยกได้ 1 ครั้ง (Est. 1RM)"
                              >
                                Est. 1RM {formatNumber(live1RM)} kg{' '}
                                <span className="text-[#64748B] font-sans">(พลังสูงสุด 1 ครั้ง)</span>
                                {relStrengthLabel && (
                                  <span className="text-[#F8FAFC] font-semibold ml-1.5">
                                    · {relStrengthLabel}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          {wEx.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveSet(wEx.id, set.id)}
                              className="min-h-[44px] sm:min-h-0 px-2 sm:px-0 text-xs sm:text-[11px] text-[#64748B] hover:text-[#F8FAFC] inline-flex items-center gap-1 sm:gap-0.5 transition-colors shrink-0"
                              aria-label={`ลบเซ็ตที่ ${idx + 1}`}
                            >
                              <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                              ลบเซ็ต
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Set Footer */}
                <div className="px-4 sm:px-7 py-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => onAddSet(wEx.id)}
                    className="btn-tactile btn-cobalt active:scale-[0.98] transition-all w-full h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF4500]" />
                    เพิ่มเซ็ต
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom Workout Actions */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={onOpenExercisePicker}
          className="btn-tactile btn-cobalt active:scale-[0.98] transition-all sm:flex-1 h-11 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
        >
          <Plus className="w-4 h-4 text-[#FF4500]" />
          เพิ่มท่าฝึก
        </button>

        {activeWorkout.exercises.length > 0 && (
          <button
            type="button"
            onClick={onFinishWorkout}
            className="btn-tactile btn-volt active:scale-[0.98] transition-all sm:flex-1 h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            จบและบันทึกการฝึก
          </button>
        )}
      </div>

      {/* 1-Tap Smart Exercise Swap Modal */}
      <ExerciseSwapModal
        open={Boolean(swapTarget)}
        currentExercise={swapTarget ? EXERCISE_MAP[swapTarget.exerciseId] ?? null : null}
        activeExerciseIds={activeWorkout.exercises.map((e) => e.exerciseId)}
        history={history}
        onSwap={(newExerciseId) => {
          if (swapTarget) {
            onSwapExercise(swapTarget.workoutExerciseId, newExerciseId);
          }
        }}
        onOpenGuide={onOpenGuide}
        onClose={() => setSwapTarget(null)}
      />
    </div>
  );
};
