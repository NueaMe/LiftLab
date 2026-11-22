import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Scale, Flame, Dumbbell, Zap, Sparkles, Check } from 'lucide-react';
import { AthleteGender, AthleteProfile, ExperienceLevel, TrainingGoal } from '../types';
import { GOAL_CONFIGS } from '../utils/personalization';

interface AthleteProfileModalProps {
  open: boolean;
  isFirstVisit: boolean;
  initialProfile: AthleteProfile | null;
  onSave: (profile: AthleteProfile) => void;
  onSkip: () => void;
  onClose: () => void;
}

const GENDER_CHIPS: { id: AthleteGender; label: string }[] = [
  { id: 'male', label: 'ชาย (Male)' },
  { id: 'female', label: 'หญิง (Female)' },
];

const EXPERIENCE_CHIPS: { id: ExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'มือใหม่' },
  { id: 'intermediate', label: 'ปานกลาง' },
  { id: 'advanced', label: 'ขั้นสูง' },
];

const GOAL_CHIPS: { id: TrainingGoal; shortLabel: string }[] = [
  { id: 'hypertrophy', shortLabel: 'เพิ่มกล้ามเนื้อ' },
  { id: 'glute_tone', shortLabel: 'ปั้นก้น / กระชับ' },
  { id: 'strength', shortLabel: 'เพิ่มความแข็งแรง' },
  { id: 'endurance', shortLabel: 'ลดไขมัน / ทนทาน' },
];

const WEEKLY_DAY_OPTIONS = [2, 3, 4, 5, 6] as const;

export const AthleteProfileModal: React.FC<AthleteProfileModalProps> = ({
  open,
  isFirstVisit,
  initialProfile,
  onSave,
  onSkip,
  onClose,
}) => {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<AthleteGender>('male');
  const [bodyWeightStr, setBodyWeightStr] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [goal, setGoal] = useState<TrainingGoal>('hypertrophy');
  const [weeklyTargetDays, setWeeklyTargetDays] = useState<number>(4);

  useEffect(() => {
    if (!open) return;
    setNickname(initialProfile?.nickname ?? '');
    setGender(initialProfile?.gender ?? 'male');
    setBodyWeightStr(
      initialProfile?.bodyWeightKg ? String(initialProfile.bodyWeightKg) : ''
    );
    setExperience(initialProfile?.experience ?? 'beginner');
    setGoal(initialProfile?.goal ?? 'hypertrophy');
    setWeeklyTargetDays(initialProfile?.weeklyTargetDays ?? 4);
  }, [open, initialProfile]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFirstVisit) onSkip();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, isFirstVisit, onSkip, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const activeGoalCfg = GOAL_CONFIGS[goal];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBw = parseFloat(bodyWeightStr);
    const validBw =
      Number.isFinite(parsedBw) && parsedBw >= 25 && parsedBw <= 250
        ? Number(parsedBw.toFixed(1))
        : null;

    onSave({
      nickname: nickname.trim() || 'Athlete',
      gender,
      bodyWeightKg: validBw,
      experience,
      goal,
      weeklyTargetDays,
      updatedAt: Date.now(),
    });
  };

  const renderGoalIcon = (g: TrainingGoal) => {
    if (g === 'strength') return <Dumbbell className="w-3.5 h-3.5 shrink-0" />;
    if (g === 'endurance') return <Zap className="w-3.5 h-3.5 shrink-0" />;
    if (g === 'glute_tone') return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    return <Flame className="w-3.5 h-3.5 shrink-0" />;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#090A0D]/80 backdrop-blur-md"
      onClick={() => (isFirstVisit ? onSkip() : onClose())}
      role="dialog"
      aria-modal="true"
      aria-labelledby="athlete-profile-title"
    >
      <div
        className="w-full max-w-md mx-auto max-h-[88vh] flex flex-col glass-card rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Athletic Header */}
        <div className="px-4 sm:px-5 pt-3.5 pb-3 border-b border-white/[0.06] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="editorial-label !text-[#FF4500] leading-none">
              LIFTLAB PERSONALIZATION
            </div>
            <h2
              id="athlete-profile-title"
              className="font-display text-2xl sm:text-[1.7rem] tracking-wider text-[#F8FAFC] leading-none mt-1"
            >
              ATHLETE PROFILE SETUP
            </h2>
          </div>
          <button
            type="button"
            onClick={() => (isFirstVisit ? onSkip() : onClose())}
            aria-label="ปิดหน้าต่าง"
            className="btn-tactile active:scale-[0.98] transition-all h-9 w-9 flex items-center justify-center rounded-xl bg-[#1A1D24] hover:bg-[#222630] text-[#94A3B8] hover:text-[#F8FAFC] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form: Scrollable Compact Body + Sticky Save Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5 space-y-3.5">
            {/* Row 1: Side-by-Side Nickname & Body Weight */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="profile-nickname"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] mb-1.5"
                >
                  <User className="w-3 h-3 text-[#FF4500] shrink-0" />
                  <span>ชื่อเล่น (Nickname)</span>
                </label>
                <input
                  id="profile-nickname"
                  type="text"
                  maxLength={24}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={gender === 'female' ? 'เช่น มายด์' : 'เช่น ต้น'}
                  className="surface-inner w-full h-10 px-3 rounded-xl text-sm font-medium text-[#F8FAFC] placeholder:text-[#64748B]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-bw"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#94A3B8] mb-1.5"
                >
                  <Scale className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  <span>น้ำหนักตัว (kg)</span>
                </label>
                <div className="relative">
                  <input
                    id="profile-bw"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="25"
                    max="250"
                    value={bodyWeightStr}
                    onChange={(e) => setBodyWeightStr(e.target.value)}
                    placeholder={gender === 'female' ? '54' : '70'}
                    className="surface-inner w-full h-10 pl-3 pr-9 rounded-xl font-tech font-bold text-base tracking-tight text-[#F8FAFC] placeholder:text-[#64748B] placeholder:font-sans placeholder:text-sm tabular-nums"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-tech font-bold text-[#94A3B8] pointer-events-none">
                    KG
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Gender / Physique Single-Line Pill Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="editorial-label">เพศ / สรีระ</span>
                <span className="text-[10px] text-[#64748B]">
                  ปรับเฉพาะหุ่น Body Scan และแอนิเมชันท่าฝึก
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GENDER_CHIPS.map((opt) => {
                  const selected = gender === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGender(opt.id)}
                      aria-pressed={selected}
                      className={`btn-tactile active:scale-[0.98] transition-all h-9 px-3 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        selected
                          ? 'bg-[#FF4500] text-white shadow-[0_6px_18px_-6px_rgba(255,69,0,0.75)]'
                          : 'bg-[#1A1D24] text-[#CBD5E1] hover:bg-[#232834] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5 stroke-[2.75] shrink-0" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Experience Level Single-Line Pill Chips */}
            <div className="space-y-1.5">
              <span className="block editorial-label">ระดับประสบการณ์</span>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_CHIPS.map((opt) => {
                  const selected = experience === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setExperience(opt.id)}
                      aria-pressed={selected}
                      className={`btn-tactile active:scale-[0.98] transition-all h-9 px-2.5 rounded-full text-xs font-bold inline-flex items-center justify-center whitespace-nowrap ${
                        selected
                          ? 'bg-[#FF4500] text-white shadow-[0_6px_18px_-6px_rgba(255,69,0,0.75)]'
                          : 'bg-[#1A1D24] text-[#CBD5E1] hover:bg-[#232834] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Primary Goal Single-Line Pill Chips */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="editorial-label">เป้าหมายหลัก</span>
                <span className="text-[10.5px] font-tech font-semibold text-[#94A3B8] tabular-nums">
                  {activeGoalCfg.repRange} ครั้ง · พัก {activeGoalCfg.restSec}s
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_CHIPS.map((opt) => {
                  const selected = goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGoal(opt.id)}
                      aria-pressed={selected}
                      className={`btn-tactile active:scale-[0.98] transition-all h-9 px-3 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                        selected
                          ? 'bg-[#FF4500]/18 text-[#F8FAFC] ring-2 ring-[#FF4500]'
                          : 'bg-[#1A1D24] text-[#CBD5E1] hover:bg-[#232834] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      <span className={selected ? 'text-[#FF4500]' : 'text-[#94A3B8]'}>
                        {renderGoalIcon(opt.id)}
                      </span>
                      <span>{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 5: Weekly Training Days Single-Line Pill Chips */}
            <div className="space-y-1.5">
              <span className="block editorial-label">จำนวนวันฝึก / สัปดาห์</span>
              <div className="grid grid-cols-5 gap-1.5">
                {WEEKLY_DAY_OPTIONS.map((days) => {
                  const selected = weeklyTargetDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setWeeklyTargetDays(days)}
                      aria-pressed={selected}
                      className={`btn-tactile active:scale-[0.98] transition-all h-9 px-1 rounded-full text-xs font-tech font-bold tabular-nums inline-flex items-center justify-center whitespace-nowrap ${
                        selected
                          ? 'bg-[#FACC15] text-[#090A0D] shadow-[0_6px_16px_-6px_rgba(250,204,21,0.75)]'
                          : 'bg-[#1A1D24] text-[#CBD5E1] hover:bg-[#232834] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      {days} วัน
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Footer — Always Visible Without Scrolling */}
          <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-[#0D1017]/95 flex items-center gap-2 pb-safe">
            <button
              type="button"
              onClick={() => (isFirstVisit ? onSkip() : onClose())}
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0"
            >
              {isFirstVisit ? 'ข้าม' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              className="btn-tactile btn-volt active:scale-[0.98] transition-all flex-1 h-10 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isFirstVisit ? 'บันทึกและเริ่มต้น' : 'บันทึกโปรไฟล์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
