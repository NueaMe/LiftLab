import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Plus, Check } from 'lucide-react';
import { EXERCISES, MUSCLE_GROUPS, MUSCLE_LABEL_TH } from '../data/exercises';
import { MuscleGroup } from '../types';
import { MuscleBadgeIcon } from './MuscleBadge';

interface ExercisePickerModalProps {
  open: boolean;
  title?: string;
  alreadyAddedIds?: string[];
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  open,
  title = 'เลือกท่าฝึก',
  alreadyAddedIds = [],
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((ex) => {
      const matchesMuscle = muscleFilter === 'ALL' || ex.muscle === muscleFilter;
      if (!matchesMuscle) return false;
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
  }, [query, muscleFilter]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto bg-[#090A0D]/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-xl glass-card rounded-3xl max-h-[85vh] flex flex-col overflow-hidden my-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-white/[0.06]">
          <div>
            <div className="editorial-label">EXERCISE LIBRARY</div>
            <h2 className="text-lg font-bold text-[#F8FAFC] mt-0.5">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="btn-tactile min-h-[44px] min-w-[44px] -mr-1 flex items-center justify-center rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Muscle Filter Tabs */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 space-y-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อท่าฝึก หรืออุปกรณ์ (เช่น Bench, Dumbbell)..."
              className="surface-inner w-full min-h-[44px] pl-10 pr-4 rounded-xl text-sm text-[#F8FAFC] placeholder:text-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setMuscleFilter('ALL')}
              className={`btn-tactile min-h-[44px] md:min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 tabular-nums transition-colors ${
                muscleFilter === 'ALL'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-[#1A1D24] text-[#94A3B8] hover:bg-[#222630] hover:text-[#F8FAFC]'
              }`}
            >
              ทั้งหมด ({EXERCISES.length})
            </button>
            {MUSCLE_GROUPS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMuscleFilter(m.id)}
                className={`btn-tactile min-h-[44px] md:min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  muscleFilter === m.id
                    ? 'bg-[#FF4500] text-white'
                    : 'bg-[#1A1D24] text-[#94A3B8] hover:bg-[#222630] hover:text-[#F8FAFC]'
                }`}
              >
                {m.labelTh}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto divide-y divide-white/[0.05] px-3 py-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#64748B]">
              ไม่พบท่าฝึกที่ตรงกับคำค้นหา
            </div>
          ) : (
            filtered.map((ex) => {
              const isAdded = alreadyAddedIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    onSelect(ex.id);
                    onClose();
                  }}
                  className="w-full min-h-[60px] px-3.5 py-2.5 flex items-center justify-between gap-3 rounded-xl hover:bg-[#1A1D24] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <MuscleBadgeIcon
                      muscle={ex.muscle}
                      size="thumb"
                      tone="cobalt"
                      recommended={Boolean(ex.isRecommended)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[#F8FAFC] whitespace-normal break-words leading-snug">
                        {ex.name}
                      </div>
                      <div className="text-xs text-[#8A94A6] mt-0.5 flex flex-wrap items-center gap-1.5 leading-snug">
                        <span className="text-[#CBD5E1] font-medium">{MUSCLE_LABEL_TH[ex.muscle]}</span>
                        <span aria-hidden="true" className="text-[#475569]">·</span>
                        <span className="font-tech">{ex.equipment}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`min-h-[36px] min-w-[36px] px-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold shrink-0 ${
                      isAdded
                        ? 'bg-[#FACC15]/15 text-[#FACC15]'
                        : 'bg-[#1A1D24] text-[#F8FAFC]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>มีแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่ม</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
