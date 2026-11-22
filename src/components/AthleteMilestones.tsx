import React, { useMemo } from 'react';
import { Award, CheckCircle2, Flame, Lock, Scale, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { AthleteProfile, CompletedWorkout } from '../types';
import { calculateEpley1RM, formatNumber, getWeeklyMuscleBalance } from '../utils/analytics';
import { calculateRelativeStrength } from '../utils/personalization';

interface AthleteMilestonesProps {
  history: CompletedWorkout[];
  profile: AthleteProfile | null;
}

interface MilestoneBadge {
  id: string;
  titleEn: string;
  titleTh: string;
  descTh: string;
  unlocked: boolean;
  progressPct: number;
  progressLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AthleteMilestones: React.FC<AthleteMilestonesProps> = ({ history, profile }) => {
  const badges = useMemo<MilestoneBadge[]>(() => {
    let totalSets = 0;
    let totalVolume = 0;
    let totalPRs = 0;
    let peak1RM = 0;
    let peakRelativeRatio = 0;

    const bw = profile?.bodyWeightKg && profile.bodyWeightKg > 0 ? profile.bodyWeightKg : null;

    for (const session of history) {
      totalVolume += session.totalVolume;
      totalPRs += session.prCount;
      for (const ex of session.exercises) {
        for (const s of ex.sets) {
          if (s.type !== 'W') {
            totalSets += 1;
            const est = s.est1RM || calculateEpley1RM(s.weight, s.reps);
            if (est > peak1RM) peak1RM = est;
            if (bw) {
              const r = calculateRelativeStrength(est, bw);
              if (r !== null && r > peakRelativeRatio) peakRelativeRatio = r;
            }
          }
        }
      }
    }

    const weeklyBalance = getWeeklyMuscleBalance(history);
    const trainedMuscles7d = weeklyBalance.filter((m) => m.sets > 0).length;

    const bwTargetRatio = 1.0;
    const bwStrengthPct = bw
      ? Math.min(100, Math.round((peakRelativeRatio / bwTargetRatio) * 100))
      : Math.min(100, Math.round((peak1RM / 70) * 100));
    const bwUnlocked = bw ? peakRelativeRatio >= bwTargetRatio : peak1RM >= 70;
    const bwProgressLabel = bw
      ? `${peakRelativeRatio.toFixed(2)}x / 1.00x BW`
      : `${formatNumber(Math.round(peak1RM))} / 70 kg`;

    return [
      {
        id: 'first-rep',
        titleEn: 'FIRST REP',
        titleTh: 'ก้าวแรกสู่สังเวียน',
        descTh: 'บันทึกเซ็ตฝึกหลักครบอย่างน้อย 1 เซ็ต',
        unlocked: totalSets >= 1,
        progressPct: totalSets >= 1 ? 100 : 0,
        progressLabel: `${Math.min(1, totalSets)}/1 เซ็ต`,
        icon: Zap,
      },
      {
        id: 'volume-1k',
        titleEn: '1K VOLUME',
        titleTh: 'ชมรมพลังยก 1 ตัน',
        descTh: 'สะสมปริมาณการยกรวมครบ 1,000 กก.',
        unlocked: totalVolume >= 1000,
        progressPct: Math.min(100, Math.round((totalVolume / 1000) * 100)),
        progressLabel: `${formatNumber(Math.round(totalVolume))}/1,000 kg`,
        icon: Flame,
      },
      {
        id: 'volume-10k',
        titleEn: '10K TITAN',
        titleTh: 'จอมพลัง 10 ตัน',
        descTh: 'สะสมปริมาณการยกรวมครบ 10,000 กก.',
        unlocked: totalVolume >= 10000,
        progressPct: Math.min(100, Math.round((totalVolume / 10000) * 100)),
        progressLabel: `${formatNumber(Math.round(totalVolume))}/10k kg`,
        icon: ShieldCheck,
      },
      {
        id: 'bw-strength',
        titleEn: '1.0x BW',
        titleTh: 'แกร่งเท่าน้ำหนักตัว',
        descTh: bw
          ? `ทำ Est. 1RM แตะ 1.0x ของน้ำหนักตัว (${bw} kg)`
          : 'ทำ Est. 1RM แตะ 70 kg (หรือตั้งค่าน้ำหนักตัว)',
        unlocked: bwUnlocked,
        progressPct: bwStrengthPct,
        progressLabel: bwProgressLabel,
        icon: Scale,
      },
      {
        id: 'pr-crusher',
        titleEn: 'PR CRUSHER',
        titleTh: 'นักทำลายสถิติ',
        descTh: 'ทำลายสถิติ NEW PR! สะสมอย่างน้อย 3 ครั้ง',
        unlocked: totalPRs >= 3,
        progressPct: Math.min(100, Math.round((totalPRs / 3) * 100)),
        progressLabel: `${totalPRs}/3 PR`,
        icon: Trophy,
      },
      {
        id: 'full-symmetry',
        titleEn: '7-MUSCLE',
        titleTh: 'สมดุลครบ 7 กลุ่ม',
        descTh: 'ฝึกกล้ามเนื้อครบทั้ง 7 กลุ่ม (รวมหน้าท้อง) ในรอบ 7 วัน',
        unlocked: trainedMuscles7d >= 7,
        progressPct: Math.min(100, Math.round((trainedMuscles7d / 7) * 100)),
        progressLabel: `${trainedMuscles7d}/7 กลุ่ม`,
        icon: Award,
      },
    ];
  }, [history, profile]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <section className="glass-card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2 relative z-10">
        <div className="min-w-0 flex items-baseline gap-2.5">
          <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none">
            ATHLETE MILESTONES &amp; BADGES
          </h2>
          <span className="hidden sm:inline text-[11px] text-[#94A3B8]">
            เหรียญเกียรติยศปลดล็อกอัตโนมัติ
          </span>
        </div>

        <div className="font-display text-lg sm:text-xl tracking-wider tabular-nums leading-none shrink-0">
          <span className={unlockedCount > 0 ? 'text-[#FACC15]' : 'text-[#94A3B8]'}>
            {unlockedCount}
          </span>
          <span className="text-[#64748B]">/{badges.length}</span>{' '}
          <span className="text-[10px] font-tech text-[#94A3B8] tracking-widest">UNLOCKED</span>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 items-stretch relative z-10">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <article
              key={badge.id}
              title={badge.descTh}
              className={`hud-tile rounded-xl py-2.5 px-3 h-full flex flex-col justify-between gap-2 transition-all ${
                badge.unlocked ? 'ring-1 ring-[#FACC15]/40' : 'opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? 'bg-[#FACC15]/15 text-[#FACC15]'
                      : 'bg-[#12141A] text-[#64748B]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {badge.unlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15] shrink-0" aria-label="ปลดล็อกแล้ว" />
                ) : (
                  <Lock className="w-3 h-3 text-[#475569] shrink-0" aria-label="ยังไม่ปลดล็อก" />
                )}
              </div>

              <div className="min-w-0">
                <div
                  className={`font-display text-base tracking-wide whitespace-normal break-words leading-tight ${
                    badge.unlocked ? 'text-[#F8FAFC]' : 'text-[#94A3B8]'
                  }`}
                >
                  {badge.titleEn}
                </div>
                <div className="text-[11px] font-semibold text-[#CBD5E1] mt-0.5 whitespace-normal break-words leading-snug">
                  {badge.titleTh}
                </div>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-white/[0.06]">
                <div className="h-1 rounded-full bg-[#090A0D] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-[#FACC15]' : 'bg-[#FF4500]/75'
                    }`}
                    style={{ width: `${badge.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-1 text-[10px] font-tech tabular-nums">
                  <span className="text-[#94A3B8] whitespace-normal break-words leading-snug min-w-0">
                    {badge.progressLabel}
                  </span>
                  <span
                    className={`font-bold shrink-0 ${
                      badge.unlocked ? 'text-[#FACC15]' : 'text-[#64748B]'
                    }`}
                  >
                    {badge.unlocked ? 'OK' : `${badge.progressPct}%`}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
