import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Trophy,
  Star,
  List,
  LayoutGrid,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react';
import { CompletedWorkout, EquipmentType, MuscleGroup } from '../types';
import {
  EXERCISES,
  MUSCLE_GROUPS,
  MUSCLE_LABEL_TH,
  SUB_MUSCLES_BY_GROUP,
} from '../data/exercises';
import { formatNumber, getHistoricalBest1RM } from '../utils/analytics';
import { AthleticWatermark } from './AthleticWatermark';
import { ExerciseThumbnail } from './ExerciseThumbnail';

interface ExercisesTabProps {
  history: CompletedWorkout[];
  onOpenGuide: (exerciseId: string) => void;
  onQuickAddToWorkout: (exerciseId: string) => void;
}

type ViewMode = 'list' | 'grid';

const EQUIPMENT_FILTERS: { id: EquipmentType | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'ทั้งหมด' },
  { id: 'Barbell', label: 'Barbell' },
  { id: 'Dumbbell', label: 'Dumbbell' },
  { id: 'Machine', label: 'Machine' },
  { id: 'Cable', label: 'Cable' },
  { id: 'Bodyweight', label: 'Bodyweight' },
];

export const ExercisesTab: React.FC<ExercisesTabProps> = ({
  history,
  onOpenGuide,
  onQuickAddToWorkout,
}) => {
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'ALL'>('ALL');
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentType | 'ALL'>('ALL');
  const [subMuscleFilter, setSubMuscleFilter] = useState<string>('ALL');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const recommendedCount = useMemo(
    () => EXERCISES.filter((ex) => ex.isRecommended).length,
    []
  );

  const best1RMByExercise = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ex of EXERCISES) {
      map[ex.id] = getHistoricalBest1RM(history, ex.id);
    }
    return map;
  }, [history]);

  const activeSubMuscles = useMemo(() => {
    if (muscleFilter === 'ALL') return [];
    return SUB_MUSCLES_BY_GROUP[muscleFilter] ?? [];
  }, [muscleFilter]);

  const handleSelectMuscle = (next: MuscleGroup | 'ALL') => {
    setMuscleFilter(next);
    setSubMuscleFilter('ALL');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((ex) => {
      if (recommendedOnly && !ex.isRecommended) return false;
      if (muscleFilter !== 'ALL' && ex.muscle !== muscleFilter) return false;
      if (equipmentFilter !== 'ALL' && ex.equipment !== equipmentFilter) return false;
      if (muscleFilter !== 'ALL' && subMuscleFilter !== 'ALL' && ex.subMuscle !== subMuscleFilter) {
        return false;
      }
      if (!q) return true;
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.muscle.toLowerCase().includes(q) ||
        ex.subMuscleTh.toLowerCase().includes(q) ||
        ex.subMuscleEn.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        MUSCLE_LABEL_TH[ex.muscle].includes(q)
      );
    });
  }, [query, muscleFilter, equipmentFilter, subMuscleFilter, recommendedOnly]);

  const activeDrawerFilterCount =
    (muscleFilter !== 'ALL' ? 1 : 0) +
    (equipmentFilter !== 'ALL' ? 1 : 0) +
    (subMuscleFilter !== 'ALL' ? 1 : 0);

  const hasActiveFilters = query.trim() !== '' || activeDrawerFilterCount > 0 || recommendedOnly;

  const resetAllFilters = () => {
    setQuery('');
    setMuscleFilter('ALL');
    setEquipmentFilter('ALL');
    setSubMuscleFilter('ALL');
    setRecommendedOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Compact Header Strip */}
      <section className="glass-card rounded-2xl overflow-hidden relative">
        <AthleticWatermark
          variant="barbell"
          className="absolute -right-8 -bottom-6 w-48 h-20 text-[#F8FAFC] opacity-[0.028]"
        />
        <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 relative z-10">
          <div className="min-w-0">
            <div className="editorial-label">BIOMECHANICS &amp; FORM LIBRARY</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-hero-gradient leading-none mt-1">
              EXERCISE VAULT
            </h1>
          </div>
          <div className="font-display text-2xl sm:text-3xl tracking-wider text-[#F8FAFC] tabular-nums leading-none shrink-0 text-right">
            {filtered.length}
            <span className="text-[#64748B]">/{EXERCISES.length}</span>
            <span className="block sm:inline sm:ml-1.5 text-[10px] font-tech text-[#8A94A6] tracking-widest">
              MOVEMENTS
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Compact Search, View Mode & Collapsible Filter Header */}
      <section className="sticky top-16 z-30 rounded-2xl bg-[#0B0D12]/95 backdrop-blur-md border border-white/[0.09] shadow-[0_14px_32px_-12px_rgba(0,0,0,0.92)] p-2.5 sm:p-3 space-y-2.5">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Compact Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาท่าฝึก กล้ามเนื้อ หรืออุปกรณ์..."
              className="surface-inner w-full h-9 pl-9 pr-8 rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder:text-[#64748B]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="ล้างคำค้นหา"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#F8FAFC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            {/* Recommended Quick Toggle */}
            <button
              type="button"
              onClick={() => setRecommendedOnly((prev) => !prev)}
              aria-pressed={recommendedOnly}
              title={`กรองเฉพาะท่าแนะนำ (${recommendedCount} ท่า)`}
              className={`btn-tactile active:scale-[0.98] transition-all h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                recommendedOnly
                  ? 'bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/40'
                  : 'btn-cobalt'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
              <span className="tabular-nums">แนะนำ ({recommendedCount})</span>
            </button>

            {/* Collapsible Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setFiltersOpen((prev) => !prev)}
              aria-expanded={filtersOpen}
              className={`btn-tactile active:scale-[0.98] transition-all h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                filtersOpen || activeDrawerFilterCount > 0
                  ? 'bg-[#FF4500]/14 text-[#FF4500] border border-[#FF4500]/35'
                  : 'btn-cobalt'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ตัวกรอง</span>
              {activeDrawerFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-md bg-[#FF4500] text-white font-tech text-[10px] font-bold inline-flex items-center justify-center tabular-nums">
                  {activeDrawerFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle (List vs Compact Grid) */}
            <div
              className="inline-flex items-center p-0.5 rounded-xl bg-[#0D1016] border border-white/[0.06] h-9 shrink-0"
              role="group"
              aria-label="สลับมุมมองคลังท่าฝึก"
            >
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                title="มุมมองรายการ (List)"
                className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 active:scale-[0.98] transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#202532] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-[#8A94A6] hover:text-[#F8FAFC]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden md:inline">รายการ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                title="มุมมองการ์ดกระชับ (Grid)"
                className={`h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 active:scale-[0.98] transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#202532] text-[#F8FAFC] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-[#8A94A6] hover:text-[#F8FAFC]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">การ์ด</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Summary Chips (Visible when drawer is collapsed and filters are set) */}
        {!filtersOpen && activeDrawerFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/[0.06]">
            {muscleFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleSelectMuscle('ALL')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF4500]/18 text-[#FF4500] text-[11px] font-semibold"
              >
                <span>{MUSCLE_LABEL_TH[muscleFilter]}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {subMuscleFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSubMuscleFilter('ALL')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] text-[#F8FAFC] text-[11px] font-semibold"
              >
                <span>
                  {activeSubMuscles.find((s) => s.id === subMuscleFilter)?.labelTh ?? subMuscleFilter}
                </span>
                <X className="w-3 h-3" />
              </button>
            )}
            {equipmentFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setEquipmentFilter('ALL')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] text-[#F8FAFC] text-[11px] font-semibold"
              >
                <span>{equipmentFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างทั้งหมด
            </button>
          </div>
        )}

        {/* Collapsible Muscle / Equipment / Sub-Muscle Filter Drawer */}
        {filtersOpen && (
          <div className="pt-2.5 border-t border-white/[0.06] space-y-2">
            {/* Row 1: Muscle Group */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
              role="tablist"
              aria-label="กรองตามกลุ่มกล้ามเนื้อหลัก"
            >
              <span className="editorial-label mr-1 whitespace-nowrap shrink-0">MUSCLE</span>
              <button
                type="button"
                role="tab"
                aria-selected={muscleFilter === 'ALL'}
                onClick={() => handleSelectMuscle('ALL')}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 active:scale-[0.98] transition-all ${
                  muscleFilter === 'ALL'
                    ? 'bg-[#FF4500] text-white'
                    : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                ทั้งหมด
              </button>
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={muscleFilter === m.id}
                  onClick={() => handleSelectMuscle(m.id)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 active:scale-[0.98] transition-all ${
                    muscleFilter === m.id
                      ? 'bg-[#FF4500] text-white'
                      : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {m.labelTh} ({m.labelEn})
                </button>
              ))}
            </div>

            {/* Row 2: Equipment */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
              role="tablist"
              aria-label="กรองตามอุปกรณ์ฝึก"
            >
              <span className="editorial-label mr-1 whitespace-nowrap shrink-0">GEAR</span>
              {EQUIPMENT_FILTERS.map((eq) => {
                const active = equipmentFilter === eq.id;
                return (
                  <button
                    key={eq.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setEquipmentFilter(eq.id)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 active:scale-[0.98] transition-all ${
                      active
                        ? 'bg-[#F8FAFC] text-[#090A0D]'
                        : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {eq.label}
                  </button>
                );
              })}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="ml-auto h-7 px-2.5 rounded-lg text-[11px] font-semibold text-[#94A3B8] hover:text-[#F8FAFC] active:scale-[0.98] transition-all inline-flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  รีเซ็ต
                </button>
              )}
            </div>

            {/* Row 3 (Conditional): Sub-Muscle Group */}
            {activeSubMuscles.length > 0 && (
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                role="tablist"
                aria-label="กรองตามมัดกล้ามเนื้อย่อย"
              >
                <span className="editorial-label mr-1 whitespace-nowrap shrink-0">FOCUS</span>
                <button
                  type="button"
                  role="tab"
                  aria-selected={subMuscleFilter === 'ALL'}
                  onClick={() => setSubMuscleFilter('ALL')}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 active:scale-[0.98] transition-all ${
                    subMuscleFilter === 'ALL'
                      ? 'bg-[#F8FAFC] text-[#090A0D]'
                      : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  ทุกมัดย่อย
                </button>
                {activeSubMuscles.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    role="tab"
                    aria-selected={subMuscleFilter === sub.id}
                    onClick={() => setSubMuscleFilter(sub.id)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 active:scale-[0.98] transition-all ${
                      subMuscleFilter === sub.id
                        ? 'bg-[#F8FAFC] text-[#090A0D]'
                        : 'bg-[#1A1D24] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {sub.labelTh} ({sub.labelEn})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Exercise Results: Empty / Compact List / Dense 2-3 Column Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-[#94A3B8] font-medium">ไม่พบท่าฝึกที่ตรงกับตัวกรองที่เลือก</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="btn-tactile btn-cobalt h-9 px-4 rounded-xl text-xs font-semibold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <section className="relative z-0 bg-[#13161D] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
          {filtered.map((ex) => {
            const best1RM = best1RMByExercise[ex.id] ?? 0;

            return (
              <div
                key={ex.id}
                className="relative z-0 overflow-hidden py-3 px-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onOpenGuide(ex.id)}
                    aria-label={`ดูรายละเอียดท่า ${ex.name}`}
                    className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 active:scale-[0.97] transition-transform"
                  >
                    <ExerciseThumbnail exercise={ex} />
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Line 1: Exercise Name (Full wrapping, zero yellow pill clutter) */}
                    <button
                      type="button"
                      onClick={() => onOpenGuide(ex.id)}
                      className="block text-left font-semibold text-[14.5px] sm:text-[15px] tracking-[-0.01em] text-[#F8FAFC] hover:text-[#FF4500] whitespace-normal break-words leading-snug transition-colors"
                    >
                      {ex.name}
                    </button>

                    {/* Line 2: Primary Muscle · Equipment (+ 1RM PR when available) */}
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-[#8A94A6] mt-0.5 leading-snug">
                      <span className="text-[#CBD5E1] font-medium">
                        {MUSCLE_LABEL_TH[ex.muscle]}
                      </span>
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <span className="font-tech text-[#94A3B8]">{ex.equipment}</span>
                      {best1RM > 0 && (
                        <>
                          <span className="text-[#475569]" aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-[#FACC15] font-tech font-semibold text-[11px] tabular-nums">
                            <Trophy className="w-3 h-3 shrink-0" />
                            1RM {formatNumber(best1RM)} kg
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Crisp, Compact Right-Edge Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenGuide(ex.id)}
                    className="btn-tactile btn-cobalt active:scale-[0.97] transition-all h-8 px-2.5 rounded-lg text-[11px] font-semibold text-[#E2E8F0] inline-flex items-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>วิธีฝึก</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuickAddToWorkout(ex.id)}
                    aria-label={`เพิ่ม ${ex.name} ลงการฝึกวันนี้`}
                    title="เพิ่มลงการฝึกวันนี้"
                    className="btn-tactile btn-volt active:scale-[0.97] transition-all h-8 w-8 flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 items-stretch">
          {filtered.map((ex) => {
            const best1RM = best1RMByExercise[ex.id] ?? 0;

            return (
              <article
                key={ex.id}
                className="relative z-0 overflow-hidden bg-[#13161D] border border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] rounded-2xl p-3.5 flex flex-col justify-between gap-3 hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onOpenGuide(ex.id)}
                    aria-label={`ดูรายละเอียดท่า ${ex.name}`}
                    className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                  >
                    <ExerciseThumbnail exercise={ex} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onOpenGuide(ex.id)}
                      className="block text-left font-semibold text-[14.5px] tracking-[-0.01em] text-[#F8FAFC] hover:text-[#FF4500] whitespace-normal break-words leading-snug transition-colors"
                    >
                      {ex.name}
                    </button>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11.5px] text-[#8A94A6] leading-snug">
                      <span className="text-[#CBD5E1] font-medium">
                        {MUSCLE_LABEL_TH[ex.muscle]}
                      </span>
                      <span className="text-[#475569]" aria-hidden="true">·</span>
                      <span className="font-tech text-[#94A3B8]">{ex.equipment}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  <div className="min-w-0 text-[11px]">
                    {best1RM > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[#FACC15] font-tech font-semibold tabular-nums">
                        <Trophy className="w-3 h-3 shrink-0" />
                        1RM {formatNumber(best1RM)} kg
                      </span>
                    ) : (
                      <span className="text-[#64748B] font-tech text-[11px] tabular-nums">
                        พัก {ex.defaultRestSec}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenGuide(ex.id)}
                      className="btn-tactile btn-cobalt active:scale-[0.97] transition-all h-8 px-2.5 rounded-lg text-[11px] font-semibold text-[#E2E8F0] inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <BookOpen className="w-3 h-3 text-[#94A3B8]" />
                      <span>วิธีฝึก</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickAddToWorkout(ex.id)}
                      aria-label={`เพิ่ม ${ex.name} ลงการฝึกวันนี้`}
                      title="เพิ่มลงการฝึกวันนี้"
                      className="btn-tactile btn-volt active:scale-[0.97] transition-all h-8 w-8 flex items-center justify-center rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
