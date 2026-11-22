import React, { useMemo } from 'react';
import { Crosshair, X } from 'lucide-react';
import { AthleteGender, CompletedWorkout, MuscleGroup } from '../types';
import { MUSCLE_LABEL_TH } from '../data/exercises';
import { getMuscleReadinessHud } from '../utils/analytics';
import { AnimatedNumber } from './AnimatedNumber';
import { BodyHeatmapSvg } from './BodyHeatmapSvg';

interface MuscleReadinessHudProps {
  history: CompletedWorkout[];
  selectedMuscle?: MuscleGroup | null;
  onSelectMuscle?: (muscle: MuscleGroup | null) => void;
  gender?: AthleteGender;
  onChangeGender?: (gender: AthleteGender) => void;
}

export const MuscleReadinessHud: React.FC<MuscleReadinessHudProps> = ({
  history,
  selectedMuscle = null,
  onSelectMuscle,
  gender = 'male',
  onChangeGender,
}) => {
  const items = useMemo(() => getMuscleReadinessHud(history), [history]);

  const counts = useMemo(() => {
    let ready = 0;
    let recovering = 0;
    let lowVolume = 0;
    for (const item of items) {
      if (item.status === 'ready') ready += 1;
      else if (item.status === 'recovering') recovering += 1;
      else lowVolume += 1;
    }
    return { ready, recovering, lowVolume };
  }, [items]);

  const isEmptyState = history.length === 0;

  const handleToggleMuscle = (muscle: MuscleGroup) => {
    if (!onSelectMuscle) return;
    onSelectMuscle(selectedMuscle === muscle ? null : muscle);
  };

  return (
    <section className="glass-card rounded-2xl sm:rounded-3xl w-full max-w-full overflow-hidden">
      {/* Compact Header */}
      <div className="px-3.5 sm:px-5 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none">
            MUSCLE READINESS
          </h2>
          <span className="text-[11px] text-[#94A3B8]">
            แตะเพื่อกรองท่าฝึก
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold tabular-nums shrink-0">
          <span className="inline-flex items-center gap-1 text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#FF4500]" />
            <span>พร้อม</span>
            <span className="font-tech text-[#FF4500]">{counts.ready}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#FACC15]" />
            <span>ฟื้นตัว</span>
            <span className="font-tech text-[#FACC15]">{counts.recovering}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#F8FAFC]">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>น้อย</span>
            <span className="font-tech text-[#38BDF8]">{counts.lowVolume}</span>
          </span>
        </div>
      </div>

      {/* Compact Split HUD: Compact Body Scan + Tight 2-Column 7-Muscle Mini-Pill Grid */}
      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center relative z-10">
        {/* LEFT: Compact Interactive Dual Front & Back Anatomical Silhouette */}
        <div className="lg:col-span-5 scoreboard-cell rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 relative w-full max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1.5 editorial-label text-[#F8FAFC]">
              <Crosshair className="w-3 h-3 text-[#FF4500]" />
              <span>Body Scan</span>
            </span>

            <div className="flex items-center gap-1.5">
              {onChangeGender && (
                <div
                  className="inline-flex items-center p-0.5 rounded-lg bg-[#090A0D] ring-1 ring-white/[0.08]"
                  role="group"
                  aria-label="สลับสรีระ ชาย หรือ หญิง"
                >
                  <button
                    type="button"
                    onClick={() => onChangeGender('male')}
                    aria-pressed={gender === 'male'}
                    className={`h-6 px-2 rounded-md text-[10.5px] font-bold active:scale-[0.98] transition-all whitespace-nowrap ${
                      gender === 'male'
                        ? 'bg-[#FF4500] text-white'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    ชาย
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeGender('female')}
                    aria-pressed={gender === 'female'}
                    className={`h-6 px-2 rounded-md text-[10.5px] font-bold active:scale-[0.98] transition-all whitespace-nowrap ${
                      gender === 'female'
                        ? 'bg-[#FF4500] text-white'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    หญิง
                  </button>
                </div>
              )}

              {selectedMuscle && (
                <button
                  type="button"
                  onClick={() => onSelectMuscle?.(null)}
                  className="btn-tactile btn-cobalt active:scale-[0.98] transition-all inline-flex items-center gap-1 h-6 px-2 rounded-lg text-[10.5px] font-semibold whitespace-nowrap"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
                  <span>{MUSCLE_LABEL_TH[selectedMuscle]}</span>
                  <X className="w-3 h-3 text-[#94A3B8]" />
                </button>
              )}
            </div>
          </div>

          <div className="w-full max-w-[290px] sm:max-w-[350px] mx-auto flex items-center justify-center">
            <BodyHeatmapSvg
              items={items}
              selectedMuscle={selectedMuscle}
              onSelectMuscle={handleToggleMuscle}
              gender={gender}
            />
          </div>
        </div>

        {/* RIGHT / BELOW: Tight Clickable 2-Column 7-Muscle Mini-Pill Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-2">
          {items.map((item, idx) => {
            const isReady = item.status === 'ready';
            const isRecovering = item.status === 'recovering';
            const isSelected = selectedMuscle === item.muscle;

            const pillStateStyle = isSelected
              ? 'ring-2 ring-[#FF4500] bg-[#1F2430]'
              : 'ring-1 ring-white/[0.06] bg-[#161922] hover:bg-[#1C202B] hover:ring-white/[0.14]';

            const statusDotClass = isReady
              ? 'bg-[#FF4500]'
              : isRecovering
                ? 'bg-[#FACC15]'
                : 'bg-[#38BDF8]';

            const statusTextClass = isReady
              ? 'text-[#FF4500]'
              : isRecovering
                ? 'text-[#FACC15]'
                : 'text-[#38BDF8]';

            const barFillClass = isReady
              ? 'bg-[#FF4500]'
              : isRecovering
                ? 'bg-[#FACC15]'
                : 'bg-[#38BDF8]';

            const barPct = isRecovering
              ? item.recoveryPct
              : isEmptyState
                ? 0
                : Math.min(100, Math.round((item.weeklySets / 10) * 100));

            return (
              <button
                key={item.muscle}
                type="button"
                onClick={() => handleToggleMuscle(item.muscle)}
                aria-pressed={isSelected}
                className={`relative text-left rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 active:scale-[0.98] transition-all overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                  idx === items.length - 1 && items.length % 2 === 1 ? 'col-span-2' : ''
                } ${pillStateStyle}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#F8FAFC] leading-tight whitespace-normal break-words">
                      {item.labelTh}
                    </div>
                    <div className={`text-[10px] font-semibold leading-tight mt-0.5 tabular-nums ${statusTextClass}`}>
                      {isRecovering
                        ? `ฟื้นตัว ${item.recoveryPct}%`
                        : item.status === 'low_volume'
                          ? `ฝึกน้อย (${item.weeklySets}/10)`
                          : 'พร้อมฝึก'}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right tabular-nums leading-none">
                  <span className="font-tech font-bold text-sm text-[#F8FAFC]">
                    <AnimatedNumber value={item.weeklySets} />
                  </span>
                  <span className="text-[10px] text-[#94A3B8] ml-0.5">เซ็ต</span>
                </div>

                {/* Ultra-Slim Bottom Readiness Progress Hairline */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] bg-white/[0.04]"
                >
                  <span
                    className={`block h-full transition-all duration-500 ${barFillClass}`}
                    style={{ width: `${barPct}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
