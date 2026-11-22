import React, { useEffect, useId, useMemo, useRef } from 'react';
import {
  Award,
  Dumbbell,
  Flame,
  Play,
  Shield,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { ActiveWorkout, AthleteProfile, CompletedWorkout, DailyEnergyMode } from '../types';
import { EXERCISE_MAP } from '../data/exercises';
import {
  calculateEpley1RM,
  formatFullThaiDate,
  formatNumber,
  getMuscleReadinessHud,
  playPlateClink,
} from '../utils/analytics';
import { getGoalConfig } from '../utils/personalization';
import { calculateAthleteXp, DAILY_ENERGY_MODES } from '../utils/gamification';
import { AnimatedNumber } from './AnimatedNumber';
import { HeroBarbellStageSvg } from './HeroBarbellStageSvg';
import { EnergyModeIcon, StreakFlameIcon } from './AthleticIcons';

interface ReadinessCommandCenterProps {
  history: CompletedWorkout[];
  activeWorkout?: ActiveWorkout | null;
  profile: AthleteProfile | null;
  bonusXp?: number;
  energyMode: DailyEnergyMode;
  soundEnabled?: boolean;
  onChangeEnergyMode: (mode: DailyEnergyMode) => void;
  onStartEmptyWorkout: () => void;
  onGoToRoutines: () => void;
  onOpenProfile: () => void;
  onInspectPeakPR?: (exerciseId: string | null) => void;
}

const ENERGY_MODE_ORDER: DailyEnergyMode[] = ['beast', 'standard', 'recovery'];

export const ReadinessCommandCenter: React.FC<ReadinessCommandCenterProps> = ({
  history,
  activeWorkout = null,
  profile,
  bonusXp = 0,
  energyMode,
  soundEnabled = true,
  onChangeEnergyMode,
  onStartEmptyWorkout,
  onGoToRoutines,
  onOpenProfile,
  onInspectPeakPR,
}) => {
  const uid = useId().replace(/:/g, '');
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const goalConfig = useMemo(() => getGoalConfig(profile), [profile]);
  const activeEnergy = DAILY_ENERGY_MODES[energyMode];

  const xpStatus = useMemo(
    () => calculateAthleteXp(history, activeWorkout, bonusXp),
    [history, activeWorkout, bonusXp]
  );

  // Subtle horizontal scroll parallax on the ultra-faint Hero watermark
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const el = watermarkRef.current;
        if (!el) return;
        const y = Math.min(window.scrollY, 900);
        const shiftX = -(y * 0.14);
        const shiftY = y * 0.1;
        el.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const telemetry = useMemo(() => {
    const muscles = getMuscleReadinessHud(history);
    const totalRecovery = muscles.reduce((sum, m) => sum + m.recoveryPct, 0);
    const readinessPct = muscles.length > 0 ? Math.round(totalRecovery / muscles.length) : 100;
    const freshCount = muscles.filter((m) => m.status !== 'recovering').length;
    const recoveringCount = muscles.length - freshCount;

    let totalVolume = 0;
    let peakPR = 0;
    let peakPRExerciseId: string | null = null;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyDayKeys = new Set<string>();

    for (const session of history) {
      totalVolume += session.totalVolume;
      const sessionMs = new Date(session.date).getTime();
      if (!Number.isNaN(sessionMs) && sessionMs >= sevenDaysAgo) {
        weeklyDayKeys.add(session.date.slice(0, 10));
      }
      for (const ex of session.exercises) {
        for (const s of ex.sets) {
          if (s.type === 'W') continue;
          const est = s.est1RM || calculateEpley1RM(s.weight, s.reps);
          if (est > peakPR) {
            peakPR = est;
            peakPRExerciseId = ex.exerciseId;
          }
        }
      }
    }

    const peakPRExerciseName = peakPRExerciseId
      ? (EXERCISE_MAP[peakPRExerciseId]?.name ?? null)
      : null;

    const tier: 'peak' | 'moderate' | 'recovering' =
      readinessPct >= 85 ? 'peak' : readinessPct >= 60 ? 'moderate' : 'recovering';

    const statusEn =
      tier === 'peak' ? 'READY' : tier === 'moderate' ? 'PRIMED' : 'RECOVERING';
    const statusTh =
      history.length === 0
        ? 'พร้อมเริ่มเซสชันที่ 1'
        : tier === 'peak'
          ? 'พร้อมยกเหล็กเต็มกำลัง'
          : tier === 'moderate'
            ? `พร้อมฝึก ${freshCount}/${muscles.length} กลุ่ม`
            : `กำลังฟื้นตัว ${recoveringCount} กลุ่ม`;

    return {
      readinessPct,
      freshCount,
      totalMuscles: muscles.length,
      totalSessions: history.length,
      totalVolume: Math.round(totalVolume),
      peakPR: Math.round(peakPR),
      peakPRExerciseId,
      peakPRExerciseName,
      weeklyDays: weeklyDayKeys.size,
      weeklyGoal: profile?.weeklyTargetDays ?? 4,
      tier,
      statusEn,
      statusTh,
      latestDate: history[0]?.date ?? null,
    };
  }, [history, profile?.weeklyTargetDays]);

  // Precision Dual-Track Readiness SVG Geometry (smooth active arc + fine micro-tick perimeter)
  const size = 224;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 88;
  const innerTrackRadius = 74;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerTrackRadius;
  const clampedPct = Math.max(0, Math.min(100, telemetry.readinessPct));
  const dashOffset = outerCircumference * (1 - clampedPct / 100);
  const innerDashOffset = innerCircumference * (1 - clampedPct / 100);

  const tipAngleRad = ((clampedPct / 100) * 360 - 90) * (Math.PI / 180);
  const tipX = cx + outerRadius * Math.cos(tipAngleRad);
  const tipY = cy + outerRadius * Math.sin(tipAngleRad);

  const isBlazeTier = telemetry.tier === 'peak';
  const isRecoveringTier = telemetry.tier === 'recovering';
  const strokeGradStart = isBlazeTier ? '#FACC15' : isRecoveringTier ? '#FEF08A' : '#BAE6FD';
  const strokeGradMid = isBlazeTier ? '#FF4500' : isRecoveringTier ? '#FACC15' : '#38BDF8';
  const strokeGradEnd = isBlazeTier ? '#EF4444' : isRecoveringTier ? '#D97706' : '#0284C7';
  const tipColor = isBlazeTier ? '#FF4500' : isRecoveringTier ? '#FACC15' : '#38BDF8';

  // 60 razor-fine micro-tick calibration marks around outer perimeter
  const microTicks = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const deg = i * 6;
      const rad = ((deg - 90) * Math.PI) / 180;
      const major = i % 5 === 0;
      const rInner = major ? 99.5 : 102;
      const rOuter = 105.5;
      return {
        x1: cx + rInner * Math.cos(rad),
        y1: cy + rInner * Math.sin(rad),
        x2: cx + rOuter * Math.cos(rad),
        y2: cy + rOuter * Math.sin(rad),
        major,
        active: deg <= (clampedPct / 100) * 360,
      };
    });
  }, [cx, cy, clampedPct]);

  const renderRankIcon = () => {
    switch (xpStatus.currentTier.id) {
      case 'elite_titan':
        return <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'athlete':
        return <Award className="w-3.5 h-3.5 stroke-[2.5]" />;
      case 'iron_lifter':
        return <Flame className="w-3.5 h-3.5 stroke-[2.5]" />;
      default:
        return <Shield className="w-3.5 h-3.5 stroke-[2.25]" />;
    }
  };

  const stageThemeClass =
    energyMode === 'beast'
      ? 'hero-cinematic-stage-beast'
      : energyMode === 'recovery'
        ? 'hero-cinematic-stage-recovery'
        : 'hero-cinematic-stage';

  return (
    <section
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen flex flex-col justify-center overflow-hidden border-b border-white/[0.06] transition-all duration-500 ${stageThemeClass}`}
    >
      {/* Dynamic Top Energy Accent Hairline */}
      <div
        className="absolute top-0 inset-x-0 h-[1.5px] z-20 transition-all duration-500"
        style={{
          background:
            energyMode === 'beast'
              ? 'linear-gradient(90deg, transparent 0%, #FF4500 28%, #FACC15 52%, #FF4500 76%, transparent 100%)'
              : energyMode === 'recovery'
                ? 'linear-gradient(90deg, transparent 0%, #38BDF8 35%, #FACC15 65%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, rgba(255,69,0,0.55) 50%, rgba(255,255,255,0.1) 80%, transparent 100%)',
        }}
      />

      {/* Ultra-Subtle Faded Background Watermark (opacity-[0.025] + smooth bottom fade mask) */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-x-0 top-4 flex justify-center overflow-hidden z-0 opacity-[0.025]"
      >
        <div
          ref={watermarkRef}
          className="hero-watermark-text font-display text-[6.5rem] sm:text-[11rem] lg:text-[15rem] tracking-[0.09em] leading-none whitespace-nowrap will-change-transform"
        >
          LIFTLAB // 01
        </div>
      </div>

      {/* Dynamic Glowing 3D-Styled Olympic Barbell & Gym Spotlight Centerpiece SVG */}
      <HeroBarbellStageSvg energyMode={energyMode} />

      {/* Measured Scrim Ensuring 100% Contrast While Letting Glowing Barbell Plates Shine on Mobile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#090A0D]/52 via-[#090A0D]/38 to-[#090A0D]/82 sm:bg-gradient-to-r sm:from-[#090A0D]/84 sm:via-[#090A0D]/42 sm:to-[#090A0D]/74"
      />

      {/* Main Compact Hero Stage Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-7 items-center">
          {/* LEFT STAGE: High-Contrast Headline + Compact Energy Bar + Side-by-Side Sleek CTAs + Status Row */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#FF4500] text-white font-tech font-extrabold text-[10px] tracking-[0.16em] uppercase shadow-[0_6px_18px_-4px_rgba(255,69,0,0.68)]">
                  LIFTLAB PRO
                </span>
                <span className="text-xs font-medium text-[#CBD5E1]">
                  {profile?.nickname
                    ? `ยินดีต้อนรับกลับ, ${profile.nickname}`
                    : telemetry.latestDate
                      ? `ฝึกครั้งล่าสุด ${formatFullThaiDate(telemetry.latestDate)}`
                      : 'พร้อมสร้างสถิติเซสชันแรกของคุณ'}
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-[5.25rem] tracking-[0.02em] leading-[0.92] text-balance drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]">
                <span className="text-hero-gradient">
                  FORGE YOUR BEST
                  <br />
                  PHYSIQUE
                </span>
                <span className="text-[#FF4500]">.</span>
              </h1>

              {/* Sleek & Compact TODAY'S ENERGY MODE Segmented Control (Custom Athletic SVG Icons) */}
              <div className="max-w-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="editorial-label !text-[#CBD5E1]">
                    TODAY&apos;S ENERGY MODE
                  </span>
                  <span className={`text-[11px] font-tech font-bold tabular-nums whitespace-normal break-words leading-snug text-right ${activeEnergy.accentTextClass}`}>
                    {activeEnergy.volumeCue}
                  </span>
                </div>

                <div
                  className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#0D1017]/92 backdrop-blur-md border border-white/[0.08]"
                  role="radiogroup"
                  aria-label="เลือกระดับพลังงานวันนี้"
                >
                  {ENERGY_MODE_ORDER.map((modeKey) => {
                    const spec = DAILY_ENERGY_MODES[modeKey];
                    const selected = energyMode === modeKey;
                    return (
                      <button
                        key={modeKey}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          if (energyMode !== modeKey) {
                            onChangeEnergyMode(modeKey);
                            playPlateClink(soundEnabled);
                          }
                        }}
                        className={`btn-tactile active:scale-[0.98] transition-all min-h-[40px] py-1.5 px-1.5 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/75 ${
                          selected
                            ? spec.activeBtnClass
                            : 'bg-transparent hover:bg-white/[0.05] text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        <EnergyModeIcon
                          mode={modeKey}
                          active={selected}
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            selected ? 'text-[#FF4500]' : 'text-[#64748B]'
                          }`}
                        />
                        <span className="whitespace-normal break-words leading-tight text-center">{spec.labelTh}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Clean Borderless Left-Accent Coaching Callout */}
                <p
                  className={`border-l-2 pl-3 text-xs text-slate-300 leading-snug transition-colors ${
                    energyMode === 'recovery' ? 'border-[#38BDF8]' : 'border-[#FF4500]'
                  }`}
                >
                  {activeEnergy.coachingTipTh}
                </p>
              </div>
            </div>

            {/* Sleek, Proportional Side-by-Side CTAs (2-col on mobile, inline on desktop) */}
            <div className="space-y-3 max-w-xl">
              <div className="grid grid-cols-2 gap-2.5 sm:inline-flex sm:items-center">
                <button
                  type="button"
                  onClick={onStartEmptyWorkout}
                  className="btn-tactile btn-volt active:scale-[0.98] transition-all h-11 py-2.5 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090A0D]"
                >
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span className="sm:hidden">เริ่มฝึกวันนี้</span>
                  <span className="hidden sm:inline">เริ่มฝึกวันนี้ (Start Session)</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToRoutines}
                  className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-11 py-2.5 px-3.5 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                >
                  <Dumbbell className="w-3.5 h-3.5 text-[#FF4500] shrink-0" />
                  <span>เลือกตารางฝึก</span>
                </button>
              </div>

              {/* Single Clean Horizontal Bottom Status & Profile Row (Mobile + Desktop) */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 text-[11px] sm:text-xs tabular-nums">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0 flex-1 text-[#94A3B8] leading-snug">
                  <span className="inline-flex items-center gap-1 text-[#F8FAFC] font-semibold whitespace-nowrap">
                    <StreakFlameIcon
                      glow={telemetry.weeklyDays > 0}
                      className={`w-3.5 h-3.5 shrink-0 ${
                        telemetry.weeklyDays > 0 ? 'text-[#FF4500]' : 'text-[#64748B]'
                      }`}
                    />
                    <span>
                      สัปดาห์นี้{' '}
                      <strong className="font-tech text-[#F8FAFC]">
                        {telemetry.weeklyDays}/{telemetry.weeklyGoal} วัน
                      </strong>
                    </span>
                  </span>

                  {goalConfig && (
                    <>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span className="text-[#CBD5E1] font-medium whitespace-normal break-words">
                        {goalConfig.labelTh}
                      </span>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span className="text-[#CBD5E1] font-tech whitespace-nowrap">
                        พัก <strong className="text-[#F8FAFC]">{goalConfig.restSec}s</strong>
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#FF4500] shrink-0" />
                  <span>{profile ? 'ปรับแต่งโปรไฟล์' : 'ตั้งค่าโปรไฟล์'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT STAGE: Unified Compact Readiness Telemetry + Merged Rank/XP HUD */}
          <div className="lg:col-span-5">
            <div
              className={`tactical-hud-panel rounded-2xl sm:rounded-3xl overflow-hidden divide-y divide-white/10 transition-all duration-300 ${
                energyMode === 'beast'
                  ? 'ring-1 ring-[#FF4500]/45'
                  : energyMode === 'recovery'
                    ? 'ring-1 ring-[#38BDF8]/35'
                    : ''
              }`}
            >
              {/* UNIFIED TOP BAND: Compact Precision Readiness Gauge + Merged Rank/XP Bar */}
              <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center gap-3.5 sm:gap-4">
                {/* Compact Precision Dual-Track Readiness SVG Arc */}
                <div className="relative w-[112px] h-[112px] sm:w-[132px] sm:h-[132px] shrink-0 flex items-center justify-center">
                  <div
                    className="pointer-events-none absolute inset-4 rounded-full blur-xl opacity-38"
                    style={{
                      background: isBlazeTier
                        ? 'radial-gradient(circle, rgba(255,69,0,0.34) 0%, transparent 72%)'
                        : isRecoveringTier
                          ? 'radial-gradient(circle, rgba(250,204,21,0.28) 0%, transparent 74%)'
                          : 'radial-gradient(circle, rgba(56,189,248,0.28) 0%, transparent 74%)',
                    }}
                  />

                  <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="w-full h-full relative z-10 overflow-visible"
                    role="img"
                    aria-label={`ความพร้อมกล้ามเนื้อโดยรวม ${telemetry.readinessPct} เปอร์เซ็นต์ ${telemetry.statusTh}`}
                  >
                    <defs>
                      <linearGradient id={`readiness-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={strokeGradStart} />
                        <stop offset="52%" stopColor={strokeGradMid} />
                        <stop offset="100%" stopColor={strokeGradEnd} />
                      </linearGradient>
                      <filter id={`tip-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    <g aria-hidden="true">
                      {microTicks.map((t, i) => (
                        <line
                          key={i}
                          x1={t.x1}
                          y1={t.y1}
                          x2={t.x2}
                          y2={t.y2}
                          stroke={
                            t.active
                              ? t.major
                                ? tipColor
                                : 'rgba(248, 250, 252, 0.28)'
                              : 'rgba(148, 163, 184, 0.14)'
                          }
                          strokeOpacity={t.major && t.active ? 0.85 : 1}
                          strokeWidth={t.major ? '1.35' : '0.85'}
                          strokeLinecap="round"
                        />
                      ))}
                    </g>

                    <circle
                      cx={cx}
                      cy={cy}
                      r={innerTrackRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth="2.2"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={innerTrackRadius}
                      fill="none"
                      stroke={tipColor}
                      strokeOpacity="0.38"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeDasharray={innerCircumference}
                      strokeDashoffset={innerDashOffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      style={{
                        transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={66}
                      fill="#090A0D"
                      fillOpacity="0.72"
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeWidth="0.9"
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={outerRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="8.5"
                    />

                    <circle
                      cx={cx}
                      cy={cy}
                      r={outerRadius}
                      fill="none"
                      stroke={`url(#readiness-grad-${uid})`}
                      strokeWidth="8.5"
                      strokeLinecap="round"
                      strokeDasharray={outerCircumference}
                      strokeDashoffset={dashOffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      className={isBlazeTier ? 'anim-gauge-volt' : ''}
                      style={{
                        transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />

                    {clampedPct > 0 && (
                      <g filter={`url(#tip-glow-${uid})`}>
                        <circle cx={tipX} cy={tipY} r="7.5" fill={tipColor} opacity="0.35" />
                        <circle
                          cx={tipX}
                          cy={tipY}
                          r="4"
                          fill="#FFFFFF"
                          stroke={tipColor}
                          strokeWidth="2"
                        />
                      </g>
                    )}
                  </svg>

                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-2">
                    <div className="font-display text-[2rem] sm:text-[2.35rem] tracking-wide text-[#F8FAFC] leading-none tabular-nums">
                      <AnimatedNumber value={telemetry.readinessPct} durationMs={520} />
                      <span className="text-sm sm:text-base text-[#94A3B8] ml-0.5">%</span>
                    </div>
                    <div
                      className={`font-tech font-extrabold text-[8.5px] sm:text-[9.5px] tracking-[0.18em] leading-none mt-0.5 ${
                        isBlazeTier
                          ? 'text-[#FF4500]'
                          : isRecoveringTier
                            ? 'text-[#FACC15]'
                            : 'text-[#38BDF8]'
                      }`}
                    >
                      {telemetry.statusEn}
                    </div>
                  </div>
                </div>

                {/* Right Inline Telemetry + Merged Athlete Rank & EXP Progress Bar */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="editorial-label">MUSCLE READINESS</span>
                      <span className="text-[11px] text-[#E2E8F0] font-tech font-bold tabular-nums whitespace-nowrap">
                        {telemetry.freshCount}/{telemetry.totalMuscles} พร้อม
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#F8FAFC] mt-0.5 whitespace-normal break-words leading-snug">
                      {telemetry.statusTh}
                    </p>
                  </div>

                  {/* Merged Inline Athlete Rank & XP Strip */}
                  <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-display text-xs sm:text-sm tracking-wider leading-none shrink-0 ${xpStatus.currentTier.badgeBgClass} ${xpStatus.currentTier.badgeTextClass}`}
                      >
                        {renderRankIcon()}
                        <span>{xpStatus.currentTier.titleEn}</span>
                      </span>
                      <span className="font-display text-lg sm:text-xl tracking-wide text-[#FACC15] leading-none tabular-nums whitespace-nowrap">
                        <AnimatedNumber value={xpStatus.totalXp} durationMs={420} />{' '}
                        <span className="text-[10px] font-tech text-[#94A3B8]">XP</span>
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${xpStatus.currentTier.barFillClass}`}
                        style={{ width: `${xpStatus.progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-1.5 text-[10px] font-tech font-semibold text-[#94A3B8] tabular-nums">
                      <span className="whitespace-normal break-words leading-tight">
                        {xpStatus.nextTier
                          ? `อีก ${formatNumber(xpStatus.xpNeededForNext)} XP → ${xpStatus.nextTier.titleEn}`
                          : 'MAX RANK · ELITE TITAN'}
                      </span>
                      <span className="shrink-0 text-[#CBD5E1]">{xpStatus.progressPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM BAND: Ultra-Compact 3 Metrics With Crisp Vertical Hairline Dividers */}
              <div className="grid grid-cols-3 divide-x divide-white/10 tabular-nums">
                <div className="px-2 py-2 sm:py-2.5 text-center">
                  <div className="editorial-label">SESSIONS</div>
                  <div className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                    <AnimatedNumber value={telemetry.totalSessions} />
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5 font-medium">ครั้งฝึก</div>
                </div>

                <div className="px-2 py-2 sm:py-2.5 text-center" title="น้ำหนักยกรวมทั้งหมด (น้ำหนัก × จำนวนครั้ง)">
                  <div className="editorial-label">VOLUME</div>
                  <div className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                    <AnimatedNumber value={telemetry.totalVolume} />
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-tech mt-0.5 font-medium leading-tight">
                    KG รวม
                  </div>
                  <div className="text-[9.5px] text-[#64748B] leading-tight mt-0.5 truncate">
                    น้ำหนักยกรวมทั้งหมด
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playPlateClink(soundEnabled);
                    onInspectPeakPR?.(telemetry.peakPRExerciseId);
                  }}
                  title={
                    telemetry.peakPRExerciseName
                      ? `พลังสูงสุด 1 ครั้ง (Est. 1RM) · ดูกราฟพัฒนาการของ ${telemetry.peakPRExerciseName}`
                      : 'พลังสูงสุด 1 ครั้ง (Est. 1RM) · เปิดหน้าสถิติ 1RM'
                  }
                  className="w-full min-w-0 px-2 py-2 sm:py-2.5 text-center cursor-pointer hover:bg-white/[0.04] active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FACC15]/70"
                >
                  <div className="editorial-label">PEAK PR</div>
                  <div
                    className={`font-display text-xl sm:text-2xl tracking-wide leading-none mt-0.5 ${
                      telemetry.peakPR > 0 ? 'text-[#FACC15]' : 'text-[#F8FAFC]'
                    }`}
                  >
                    <AnimatedNumber value={telemetry.peakPR} />
                  </div>
                  <div className="text-[10px] text-[#94A3B8] font-tech mt-0.5 font-medium leading-tight">
                    Est. 1RM <span className="text-[#64748B] font-sans">· พลังสูงสุด 1 ครั้ง</span>
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 leading-tight ${
                      telemetry.peakPRExerciseName
                        ? 'text-amber-400/90 font-semibold'
                        : 'text-[#64748B] font-medium'
                    }`}
                  >
                    {telemetry.peakPRExerciseName ?? 'ยังไม่มีสถิติ'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
