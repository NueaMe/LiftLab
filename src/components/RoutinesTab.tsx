import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Plus,
  Trash2,
  Edit3,
  BookOpen,
  X,
  ArrowUp,
  ArrowDown,
  Save,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AthleteProfile, CustomRoutine, MuscleGroup, RoutineExerciseConfig } from '../types';
import { PRESET_TEMPLATES } from '../data/presets';
import { EXERCISES, EXERCISE_MAP, MUSCLE_LABEL_TH } from '../data/exercises';
import { getGoalConfig, getRecommendedPreset } from '../utils/personalization';
import { ExercisePickerModal } from './ExercisePickerModal';
import { AthleticWatermark } from './AthleticWatermark';
import { MuscleBadgeIcon } from './MuscleBadge';

interface RoutinesTabProps {
  customRoutines: CustomRoutine[];
  profile: AthleteProfile | null;
  onStartRoutine: (name: string, exercises: RoutineExerciseConfig[]) => void;
  onSaveCustomRoutine: (routine: CustomRoutine) => void;
  onDeleteCustomRoutine: (id: string) => void;
  onOpenGuide: (exerciseId: string) => void;
  onOpenProfile: () => void;
}

export const RoutinesTab: React.FC<RoutinesTabProps> = ({
  customRoutines,
  profile,
  onStartRoutine,
  onSaveCustomRoutine,
  onDeleteCustomRoutine,
  onOpenGuide,
  onOpenProfile,
}) => {
  const goalConfig = getGoalConfig(profile);
  const recommended = getRecommendedPreset(profile);

  const [selectedDays, setSelectedDays] = useState<Record<string, number>>({
    'full-body-3day': 0,
    'upper-lower-split': 0,
    'push-pull-legs': 0,
    'bodyweight-basics': 0,
    'glute-lower-sculpt': 0,
    'dumbbell-cable-full-body-tone': 0,
  });

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCardExpanded = (key: string) => {
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [routineNote, setRoutineNote] = useState('');
  const [builderExercises, setBuilderExercises] = useState<RoutineExerciseConfig[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [builderError, setBuilderError] = useState<string | null>(null);

  useEffect(() => {
    if (!builderOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pickerOpen) {
        setBuilderOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [builderOpen, pickerOpen]);

  const openNewBuilder = () => {
    setEditingId(null);
    setRoutineName('');
    setRoutineNote('');
    setBuilderExercises([]);
    setBuilderError(null);
    setBuilderOpen(true);
  };

  const openEditBuilder = (routine: CustomRoutine) => {
    setEditingId(routine.id);
    setRoutineName(routine.name);
    setRoutineNote(routine.note);
    setBuilderExercises(routine.exercises.map((e) => ({ ...e })));
    setBuilderError(null);
    setBuilderOpen(true);
  };

  const handleAddExerciseToBuilder = (exerciseId: string) => {
    const def = EXERCISE_MAP[exerciseId];
    if (!def) return;
    setBuilderExercises((prev) => [
      ...prev,
      {
        exerciseId,
        sets: 3,
        targetReps: goalConfig?.repRange ?? '8–12',
        restSec: goalConfig?.restSec ?? def.defaultRestSec,
      },
    ]);
    setBuilderError(null);
  };

  const moveBuilderExercise = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= builderExercises.length) return;
    setBuilderExercises((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleSaveBuilder = () => {
    if (!routineName.trim()) {
      setBuilderError('กรุณาตั้งชื่อตารางฝึก');
      return;
    }
    if (builderExercises.length === 0) {
      setBuilderError('กรุณาเพิ่มท่าฝึกอย่างน้อย 1 ท่า');
      return;
    }

    onSaveCustomRoutine({
      id: editingId ?? `custom-${Date.now()}`,
      name: routineName.trim(),
      note: routineNote.trim(),
      createdAt: Date.now(),
      exercises: builderExercises,
    });
    setBuilderOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Compact Header Banner */}
      <section className="glass-card rounded-2xl overflow-hidden relative">
        <AthleticWatermark
          variant="plate"
          className="absolute -right-8 -top-6 w-36 h-36 text-[#F8FAFC] opacity-[0.028]"
        />
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="min-w-0">
            <div className="editorial-label">STRUCTURED TRAINING SPLITS</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-hero-gradient leading-none mt-1">
              TRAINING PROGRAMS
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {goalConfig && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3 rounded-xl text-[11px] font-tech font-semibold tabular-nums hidden sm:inline-flex items-center gap-1.5"
                title="ปรับเป้าหมายโปรไฟล์"
              >
                <span className="text-[#8A94A6] font-sans">{goalConfig.labelTh}:</span>
                <span className="text-[#F8FAFC]">{goalConfig.repRange} ครั้ง</span>
                <span className="text-[#475569]">·</span>
                <span className="text-[#F8FAFC]">พัก {goalConfig.restSec}s</span>
              </button>
            )}
            <button
              type="button"
              onClick={openNewBuilder}
              className="btn-tactile btn-volt active:scale-[0.98] transition-all h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              สร้างตารางใหม่
            </button>
          </div>
        </div>
      </section>

      {/* Compact 2-Column Preset Templates Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2">
            <span className="editorial-label">CORE TEMPLATES</span>
            <span className="text-xs text-[#8A94A6] tabular-nums">· {PRESET_TEMPLATES.length} โปรแกรมมาตรฐาน</span>
          </div>
          {goalConfig && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="sm:hidden text-[11px] font-semibold text-[#94A3B8] hover:text-[#F8FAFC] tabular-nums"
            >
              {goalConfig.repRange} ครั้ง · พัก {goalConfig.restSec}s (แก้ไข)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
          {PRESET_TEMPLATES.map((template) => {
            const activeIdx = selectedDays[template.id] ?? 0;
            const currentDay = template.days[activeIdx] ?? template.days[0];
            const totalSets = currentDay.exercises.reduce((acc, ex) => acc + ex.sets, 0);
            const isRecommended = recommended?.presetId === template.id;
            const isExpanded = Boolean(expandedCards[template.id]);

            const uniqueMuscles = Array.from(
              new Set(
                currentDay.exercises
                  .map((e) => EXERCISE_MAP[e.exerciseId]?.muscle)
                  .filter((m): m is MuscleGroup => Boolean(m))
              )
            ).slice(0, 4);

            return (
              <article
                key={template.id}
                className="bg-[#13161D] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl p-4 flex flex-col justify-between gap-3.5 hover:border-white/[0.11] transition-colors"
              >
                <div className="space-y-3">
                  {/* Compact Header Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="editorial-label whitespace-normal break-words leading-snug">
                          {template.level} · {template.frequency}
                        </span>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 text-[#FACC15] font-semibold text-[11px] leading-none whitespace-nowrap">
                            <Star className="w-3 h-3 fill-current" />
                            แนะนำสำหรับคุณ
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-2xl sm:text-[1.7rem] tracking-wide text-[#F8FAFC] leading-none mt-1.5">
                        {template.title}
                      </h3>
                      <p className="text-[11.5px] text-[#8A94A6] whitespace-normal break-words leading-snug mt-1">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-[#1A1E27] border border-white/[0.06] font-tech font-semibold text-[11px] text-[#E2E8F0] tabular-nums">
                        {totalSets} SETS
                      </span>
                      <div className="flex items-center gap-1">
                        {uniqueMuscles.map((m) => (
                          <MuscleBadgeIcon key={m} muscle={m} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Compact Segmented Day Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B0D12] border border-white/[0.05]">
                    {template.days.map((day, idx) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() =>
                          setSelectedDays((prev) => ({ ...prev, [template.id]: idx }))
                        }
                        className={`btn-tactile active:scale-[0.98] transition-all flex-1 h-8 px-2 rounded-lg text-xs font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                          activeIdx === idx
                            ? 'bg-[#202532] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'text-[#8A94A6] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  {/* Inline Compact Exercise Pills + Collapsible Full List Toggle */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="text-[#94A3B8] whitespace-normal break-words leading-snug min-w-0 flex-1">
                        {currentDay.subtitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCardExpanded(template.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1 font-semibold text-[#CBD5E1] hover:text-[#FF4500] whitespace-nowrap shrink-0 transition-colors"
                      >
                        <span>
                          {isExpanded
                            ? 'ซ่อนรายการท่า'
                            : `ดูรายการท่า (${currentDay.exercises.length} ท่า)`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {!isExpanded ? (
                      <div className="flex flex-wrap gap-1.5">
                        {currentDay.exercises.map((cfg) => {
                          const def = EXERCISE_MAP[cfg.exerciseId];
                          if (!def) return null;
                          return (
                            <button
                              key={cfg.exerciseId}
                              type="button"
                              onClick={() => onOpenGuide(cfg.exerciseId)}
                              title={`${def.name} (${cfg.sets} เซ็ต) — แตะเพื่อดูคู่มือท่า`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1E27] border border-white/[0.05] hover:border-white/[0.12] text-[11px] text-[#E2E8F0] active:scale-[0.98] transition-all max-w-full text-left"
                            >
                              <span className="whitespace-normal break-words leading-snug font-medium">
                                {def.name}
                              </span>
                              <span className="font-tech font-semibold text-[#94A3B8] tabular-nums shrink-0">
                                {cfg.sets}×
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06] pt-0.5">
                        {currentDay.exercises.map((cfg) => {
                          const def = EXERCISE_MAP[cfg.exerciseId];
                          if (!def) return null;
                          const displayReps = goalConfig ? goalConfig.repRange : cfg.targetReps;
                          return (
                            <li
                              key={cfg.exerciseId}
                              className="py-2 flex items-start sm:items-center justify-between gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => onOpenGuide(cfg.exerciseId)}
                                className="text-left min-w-0 group flex-1"
                              >
                                <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#FF4500] whitespace-normal break-words leading-snug transition-colors">
                                  {def.name}
                                </div>
                                <div className="text-[10.5px] text-[#8A94A6]">
                                  {MUSCLE_LABEL_TH[def.muscle]} · {def.equipment}
                                </div>
                              </button>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-tech font-semibold text-[#CBD5E1] tabular-nums">
                                  {cfg.sets} × {displayReps}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenGuide(cfg.exerciseId)}
                                  aria-label={`ดูคู่มือท่า ${def.name}`}
                                  className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-7 w-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F8FAFC]"
                                >
                                  <BookOpen className="w-3 h-3" />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onStartRoutine(
                      `${template.title} — ${currentDay.label}`,
                      currentDay.exercises
                    )
                  }
                  className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  เริ่มฝึกตามตาราง ({currentDay.label})
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Compact Custom Routines Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="editorial-label">PERSONAL ROUTINES</span>
            <span className="text-xs text-[#94A3B8] tabular-nums">
              · ตารางส่วนตัว ({customRoutines.length})
            </span>
          </div>
        </div>

        {customRoutines.length === 0 ? (
          <div className="glass-card rounded-2xl border-dashed p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#94A3B8] text-center sm:text-left">
              ยังไม่มีตารางฝึกส่วนตัว — จัดชุดท่าฝึกที่ชอบและตั้งจำนวนเซ็ตเป้าหมายเองได้ทันที
            </p>
            <button
              type="button"
              onClick={openNewBuilder}
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF4500]" />
              สร้างตารางแรกของคุณ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {customRoutines.map((routine) => {
              const totalSets = routine.exercises.reduce((acc, e) => acc + e.sets, 0);
              const customKey = `custom-${routine.id}`;
              const isExpanded = Boolean(expandedCards[customKey]);

              return (
                <article
                  key={routine.id}
                  className="glass-card rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="editorial-label tabular-nums">
                          {routine.exercises.length} MOVEMENTS · {totalSets} SETS
                        </div>
                        <h3 className="text-base font-bold text-[#F8FAFC] whitespace-normal break-words leading-snug mt-0.5">
                          {routine.name}
                        </h3>
                        {routine.note && (
                          <p className="text-[11px] text-[#94A3B8] mt-0.5 whitespace-normal break-words leading-snug">
                            {routine.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditBuilder(routine)}
                          aria-label={`แก้ไขตาราง ${routine.name}`}
                          className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 w-8 flex items-center justify-center rounded-lg text-[#E2E8F0]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCustomRoutine(routine.id)}
                          aria-label={`ลบตาราง ${routine.name}`}
                          className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 w-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F8FAFC]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => toggleCardExpanded(customKey)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] hover:text-[#FF4500]"
                        >
                          <span>
                            {isExpanded
                              ? 'ซ่อนรายการท่า'
                              : `ดูรายการท่า (${routine.exercises.length} ท่า)`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {!isExpanded ? (
                        <div className="flex flex-wrap gap-1.5">
                          {routine.exercises.map((cfg, idx) => {
                            const def = EXERCISE_MAP[cfg.exerciseId];
                            if (!def) return null;
                            return (
                              <span
                                key={`${cfg.exerciseId}-${idx}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#1A1D24] text-[11px] text-[#E2E8F0] max-w-full"
                              >
                                <span className="whitespace-normal break-words leading-snug">
                                  {def.name}
                                </span>
                                <span className="font-tech font-bold text-[#FF4500] tabular-nums shrink-0">
                                  {cfg.sets}×
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                          {routine.exercises.map((cfg, idx) => {
                            const def = EXERCISE_MAP[cfg.exerciseId];
                            if (!def) return null;
                            return (
                              <li
                                key={`${cfg.exerciseId}-${idx}`}
                                className="py-1.5 flex items-start sm:items-center justify-between gap-2 text-xs"
                              >
                                <span className="text-[#F8FAFC] whitespace-normal break-words leading-snug min-w-0 flex-1">
                                  {def.name}
                                </span>
                                <span className="text-[#94A3B8] font-tech tabular-nums shrink-0">
                                  {cfg.sets} × {cfg.targetReps}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartRoutine(routine.name, routine.exercises)}
                    className="btn-tactile btn-volt active:scale-[0.98] transition-all w-full h-9 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    เริ่มฝึกตามตารางนี้
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Custom Routine Builder Modal (Portaled to document.body, viewport-locked) */}
      {builderOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md"
            onClick={() => setBuilderOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="routine-builder-title"
          >
            <div
              className="w-full max-w-xl glass-card rounded-3xl max-h-[88vh] flex flex-col overflow-hidden my-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-3 border-b border-white/[0.06]">
              <div>
                <div className="editorial-label">ROUTINE ARCHITECT</div>
                <h2
                  id="routine-builder-title"
                  className="font-display text-2xl sm:text-3xl tracking-wide text-[#F8FAFC] leading-none mt-1"
                >
                  {editingId ? 'EDIT ROUTINE' : 'CUSTOM ROUTINE BUILDER'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBuilderOpen(false)}
                aria-label="ปิดหน้าต่าง"
                className="btn-tactile h-9 w-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A1D24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="custom-routine-name"
                    className="block text-xs font-semibold text-[#94A3B8] mb-1.5"
                  >
                    ชื่อตารางฝึก
                  </label>
                  <input
                    id="custom-routine-name"
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="เช่น Push Day A"
                    className="surface-inner w-full h-10 px-3.5 rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#64748B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="custom-routine-note"
                    className="block text-xs font-semibold text-[#94A3B8] mb-1.5"
                  >
                    หมายเหตุ (ไม่บังคับ)
                  </label>
                  <input
                    id="custom-routine-note"
                    type="text"
                    value={routineNote}
                    onChange={(e) => setRoutineNote(e.target.value)}
                    placeholder="เช่น เน้นคุมจังหวะลงช้าๆ 3 วิ"
                    className="surface-inner w-full h-10 px-3.5 rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="editorial-label tabular-nums">
                    EXERCISES ({builderExercises.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="btn-tactile btn-cobalt h-8 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#FF4500]" />
                    เพิ่มท่าฝึก
                  </button>
                </div>

                {builderExercises.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="w-full py-6 rounded-2xl bg-[#1A1D24] hover:bg-[#222630] border border-dashed border-white/[0.1] text-xs sm:text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                  >
                    + แตะเพื่อเลือกท่าฝึกจากคลัง {EXERCISES.length} ท่า
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    {builderExercises.map((item, idx) => {
                      const def = EXERCISE_MAP[item.exerciseId];
                      if (!def) return null;
                      return (
                        <div
                          key={`${item.exerciseId}-${idx}`}
                          className="p-3 rounded-2xl bg-[#1A1D24] space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MuscleBadgeIcon muscle={def.muscle} size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-semibold text-[#F8FAFC] whitespace-normal break-words leading-snug">
                                  {def.name}
                                </div>
                                <div className="text-[10px] text-[#94A3B8]">
                                  {MUSCLE_LABEL_TH[def.muscle]} · {def.equipment}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => moveBuilderExercise(idx, -1)}
                                disabled={idx === 0}
                                aria-label="เลื่อนขึ้น"
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] disabled:opacity-30"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveBuilderExercise(idx, 1)}
                                disabled={idx === builderExercises.length - 1}
                                aria-label="เลื่อนลง"
                                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] disabled:opacity-30"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setBuilderExercises((prev) => prev.filter((_, i) => i !== idx))
                                }
                                aria-label="ลบท่าฝึก"
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/[0.06]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="block text-[10px] text-[#94A3B8] mb-1">จำนวนเซ็ต</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={item.sets}
                                onChange={(e) => {
                                  const v = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                                  setBuilderExercises((prev) =>
                                    prev.map((x, i) => (i === idx ? { ...x, sets: v } : x))
                                  );
                                }}
                                className="w-full h-8 px-2 rounded-lg bg-[#12141A] text-xs font-tech font-semibold text-[#F8FAFC] tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-[#FF4500]/70"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-[#94A3B8] mb-1">เป้า Reps</span>
                              <input
                                type="text"
                                value={item.targetReps}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setBuilderExercises((prev) =>
                                    prev.map((x, i) => (i === idx ? { ...x, targetReps: v } : x))
                                  );
                                }}
                                className="w-full h-8 px-2 rounded-lg bg-[#12141A] text-xs font-tech font-semibold text-[#F8FAFC] tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-[#FF4500]/70"
                              />
                            </div>
                            <div>
                              <span className="block text-[10px] text-[#94A3B8] mb-1">พัก (วินาที)</span>
                              <select
                                value={item.restSec}
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  setBuilderExercises((prev) =>
                                    prev.map((x, i) => (i === idx ? { ...x, restSec: v } : x))
                                  );
                                }}
                                className="w-full h-8 px-2 rounded-lg bg-[#12141A] text-xs font-tech font-semibold text-[#F8FAFC] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#FF4500]/70"
                              >
                                {[60, 75, 90, 120, 150, 180].map((s) => (
                                  <option key={s} value={s} className="bg-[#12141A] text-[#F8FAFC]">
                                    {s}s
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {builderError && (
                <p className="text-xs text-[#FF4500] font-semibold">{builderError}</p>
              )}
            </div>

            <div className="px-4 sm:px-6 py-3.5 border-t border-white/[0.06] bg-[#090A0D]/70 flex items-center gap-2.5 pb-safe">
              <button
                type="button"
                onClick={handleSaveBuilder}
                className="btn-tactile btn-volt active:scale-[0.98] transition-all flex-1 h-10 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                บันทึกตารางฝึก
              </button>
              <button
                type="button"
                onClick={() => setBuilderOpen(false)}
                className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm"
              >
                ยกเลิก
              </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ExercisePickerModal
        open={pickerOpen}
        title="เพิ่มท่าฝึกลงในตาราง"
        alreadyAddedIds={builderExercises.map((e) => e.exerciseId)}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExerciseToBuilder}
      />
    </div>
  );
};
