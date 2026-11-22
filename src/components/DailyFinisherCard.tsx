import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dices,
  Flame,
  Lock,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';
import { AthleteGender } from '../types';
import { EXERCISE_MAP } from '../data/exercises';
import { DAILY_FINISHERS, DailyFinisherChallenge } from '../utils/gamification';
import {
  formatDuration,
  playPlateClink,
  playPRFanfare,
  playRestCountdownBeep,
  playSetLoggedTick,
  playTimerChime,
} from '../utils/analytics';
import { ExerciseFormAnimation } from './ExerciseFormAnimation';
import { AnatomicalMuscleIcon } from './MuscleBadge';

interface DailyFinisherCardProps {
  completedCount: number;
  soundEnabled: boolean;
  gender?: AthleteGender;
  defaultOpen?: boolean;
  onClaimXp: (challenge: DailyFinisherChallenge) => void;
}

type ExecutionPhase = 'idle' | 'active' | 'completed' | 'claimed';

export const DailyFinisherCard: React.FC<DailyFinisherCardProps> = ({
  completedCount,
  soundEnabled,
  gender = 'male',
  defaultOpen = false,
  onClaimXp,
}) => {
  const uid = useId().replace(/:/g, '');
  const [expanded, setExpanded] = useState(defaultOpen);
  const [currentChallenge, setCurrentChallenge] = useState<DailyFinisherChallenge>(
    DAILY_FINISHERS[0]
  );
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  // Verifiable execution state (No Instant Claim)
  const [phase, setPhase] = useState<ExecutionPhase>('idle');
  const [timeLeftSec, setTimeLeftSec] = useState<number>(DAILY_FINISHERS[0].targetValue);
  const [timerPaused, setTimerPaused] = useState(false);
  const [repsDone, setRepsDone] = useState(0);
  const [repCooldown, setRepCooldown] = useState(false);

  const spinTimersRef = useRef<number[]>([]);
  const repCooldownTimerRef = useRef<number | null>(null);

  const linkedExercise = useMemo(
    () => EXERCISE_MAP[currentChallenge.exerciseId] ?? EXERCISE_MAP['forearm-plank'],
    [currentChallenge.exerciseId]
  );

  useEffect(() => {
    return () => {
      spinTimersRef.current.forEach((id) => window.clearTimeout(id));
      spinTimersRef.current = [];
      if (repCooldownTimerRef.current) {
        window.clearTimeout(repCooldownTimerRef.current);
      }
    };
  }, []);

  // Live Countdown Timer with Web Audio API final 3-second countdown beeps
  useEffect(() => {
    if (
      phase !== 'active' ||
      currentChallenge.mode !== 'timer' ||
      timerPaused
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          playTimerChime(soundEnabled);
          setPhase('completed');
          return 0;
        }
        const nextSec = prev - 1;
        if (nextSec >= 1 && nextSec <= 3) {
          playRestCountdownBeep(nextSec, soundEnabled);
        }
        return nextSec;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, currentChallenge.mode, timerPaused, soundEnabled]);

  const resetExecutionForChallenge = (challenge: DailyFinisherChallenge) => {
    setPhase('idle');
    setTimerPaused(false);
    setTimeLeftSec(challenge.mode === 'timer' ? challenge.targetValue : 0);
    setRepsDone(0);
    setRepCooldown(false);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    spinTimersRef.current.forEach((id) => window.clearTimeout(id));
    spinTimersRef.current = [];

    setIsFlipped(false);
    setIsSpinning(true);
    setHasSpun(true);
    setPhase('idle');
    setTimerPaused(false);
    setRepsDone(0);

    const pool = DAILY_FINISHERS.filter((c) => c.id !== currentChallenge.id);
    const finalPick = pool[Math.floor(Math.random() * pool.length)] ?? DAILY_FINISHERS[0];

    const stepDelays = [55, 110, 175, 250, 340, 445, 570, 720, 900];
    stepDelays.forEach((delayMs, idx) => {
      const id = window.setTimeout(() => {
        const isLast = idx === stepDelays.length - 1;
        if (isLast) {
          setCurrentChallenge(finalPick);
          resetExecutionForChallenge(finalPick);
          setIsSpinning(false);
          playPlateClink(soundEnabled);
        } else {
          const randomItem =
            DAILY_FINISHERS[(idx * 3 + Math.floor(Math.random() * 4)) % DAILY_FINISHERS.length];
          setCurrentChallenge(randomItem);
          if (idx % 2 === 0) playPlateClink(soundEnabled);
        }
      }, delayMs);
      spinTimersRef.current.push(id);
    });
  };

  const handleStartFinisher = () => {
    if (isSpinning) return;
    setIsFlipped(false);
    if (currentChallenge.mode === 'timer') {
      setTimeLeftSec(currentChallenge.targetValue);
      setTimerPaused(false);
    } else {
      setRepsDone(0);
    }
    setPhase('active');
    playSetLoggedTick(soundEnabled);
  };

  const handleIncrementRep = () => {
    if (phase !== 'active' || currentChallenge.mode !== 'reps' || repCooldown) return;
    setRepCooldown(true);
    if (repCooldownTimerRef.current) {
      window.clearTimeout(repCooldownTimerRef.current);
    }
    repCooldownTimerRef.current = window.setTimeout(() => {
      setRepCooldown(false);
    }, 280);

    setRepsDone((prev) => {
      const next = Math.min(currentChallenge.targetValue, prev + 1);
      if (next >= currentChallenge.targetValue) {
        playTimerChime(soundEnabled);
        setPhase('completed');
      } else if (currentChallenge.targetValue - next <= 3) {
        playRestCountdownBeep(currentChallenge.targetValue - next, soundEnabled);
      } else {
        playSetLoggedTick(soundEnabled);
      }
      return next;
    });
  };

  const handleDecrementRep = () => {
    if (phase !== 'active' || currentChallenge.mode !== 'reps') return;
    setRepsDone((prev) => Math.max(0, prev - 1));
  };

  const handleClaimReward = () => {
    if (phase !== 'completed') return;
    setPhase('claimed');
    playPRFanfare(soundEnabled);
    onClaimXp(currentChallenge);
  };

  // Compact circular progress ring geometry for Live Countdown Timer & Paced Rep Counter
  const ringRadius = 31;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const progressRatio =
    currentChallenge.mode === 'timer'
      ? Math.max(
          0,
          Math.min(
            1,
            (currentChallenge.targetValue - timeLeftSec) / Math.max(1, currentChallenge.targetValue)
          )
        )
      : Math.max(0, Math.min(1, repsDone / Math.max(1, currentChallenge.targetValue)));
  const ringDashOffset = ringCircumference * (1 - progressRatio);
  const isFinalThreeSec =
    phase === 'active' && currentChallenge.mode === 'timer' && timeLeftSec > 0 && timeLeftSec <= 3;

  const frontBorderState =
    phase === 'claimed'
      ? 'border-[#FACC15]/60 shadow-[0_14px_34px_-14px_rgba(250,204,21,0.38)]'
      : phase === 'completed'
        ? 'border-[#FACC15] shadow-[0_16px_38px_-12px_rgba(250,204,21,0.52)]'
        : phase === 'active'
          ? 'border-[#FF4500]/75 shadow-[0_16px_38px_-14px_rgba(255,69,0,0.48)]'
          : isSpinning
            ? 'border-[#FF4500]/65 shadow-[0_14px_34px_-14px_rgba(255,69,0,0.42)]'
            : 'border-[#FF4500]/35 shadow-[0_14px_34px_-16px_rgba(255,69,0,0.36)]';

  return (
    <section className="glass-card rounded-2xl overflow-hidden relative">
      {/* Sleek Single-Row Collapsible Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`w-full text-left px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4500]/70 ${
          expanded ? 'border-b border-white/[0.06]' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF4500]/25 to-[#FACC15]/15 text-[#FF4500] ring-1 ring-[#FF4500]/40 flex items-center justify-center shrink-0 shadow-[0_0_16px_-4px_rgba(255,69,0,0.65)]">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg sm:text-xl tracking-wide text-[#F8FAFC] leading-none">
              DAILY FINISHER
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#FACC15]/16 text-[#FACC15] font-tech font-bold text-[10px] tabular-nums whitespace-nowrap">
              +{currentChallenge.xpReward} XP
            </span>
            {completedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FACC15] text-[#090A0D] font-tech font-bold text-[10px] tabular-nums whitespace-nowrap">
                <Trophy className="w-2.5 h-2.5 stroke-[2.5]" />
                {completedCount}
              </span>
            )}
          </div>
        </div>

        <span className="h-8 px-2.5 rounded-xl bg-[#1A1D24] text-[11px] font-semibold text-[#F8FAFC] inline-flex items-center gap-1 whitespace-nowrap shrink-0">
          <span>{expanded ? 'ซ่อน' : 'เปิดดู'}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#FF4500]" />
          )}
        </span>
      </button>

      {/* Expandable Compact 3D Interactive Flashcard Stage */}
      {expanded && (
        <div className="p-3 sm:p-4 drawer-reveal relative z-10">
          <div className="flashcard-scene">
            <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
              {/* ==================== FRONT FACE: VIBRANT ATHLETIC SPOTLIGHT CARD ==================== */}
              <div
                className={`flashcard-face relative overflow-hidden rounded-2xl min-h-[220px] p-4 flex flex-col justify-between gap-3 border bg-gradient-to-br from-[#FF4500]/18 via-[#14171F] to-[#FACC15]/10 transition-all ${
                  isFlipped ? 'pointer-events-none' : ''
                } ${frontBorderState}`}
                aria-hidden={isFlipped}
              >
                {/* Warm Blaze Orange & Championship Gold Radial Spotlight Glow + Top Specular Rim */}
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background:
                      'radial-gradient(ellipse 68% 64% at 14% 12%, rgba(255, 69, 0, 0.24) 0%, transparent 64%), radial-gradient(ellipse 56% 56% at 92% 92%, rgba(250, 204, 21, 0.16) 0%, transparent 62%)',
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6B35]/70 to-[#FACC15]/60"
                  aria-hidden="true"
                />

                {/* Subtle Geometric Athletic Energy-Ring Watermark */}
                <svg
                  viewBox="0 0 180 180"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -bottom-10 w-44 h-44 opacity-35"
                >
                  <defs>
                    <linearGradient id={`wm-ring-${uid}`} x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FF4500" stopOpacity="0.6" />
                      <stop offset="55%" stopColor="#FACC15" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#FF4500" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r="76" stroke={`url(#wm-ring-${uid})`} strokeWidth="1" strokeDasharray="6 6" />
                  <circle cx="90" cy="90" r="56" stroke={`url(#wm-ring-${uid})`} strokeWidth="1.2" />
                  <path d="M90 14V30M90 150V166M14 90H30M150 90H166" stroke="#FACC15" strokeOpacity="0.28" strokeWidth="1.2" />
                  <polygon points="90,42 132,90 90,138 48,90" stroke="#FF4500" strokeOpacity="0.22" strokeWidth="1" />
                </svg>

                {/* Top Row: Compact Metadata + Spin & 3D Flip Buttons */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-tech font-bold tracking-wide flex-wrap">
                    <span className="text-[#CBD5E1] uppercase">{currentChallenge.categoryTh}</span>
                    <span className="text-white/25" aria-hidden="true">·</span>
                    <span className="text-[#FACC15] tabular-nums">+{currentChallenge.xpReward} XP</span>
                    <span className="text-white/25" aria-hidden="true">·</span>
                    <span className="text-[#FF6B35] uppercase">
                      {currentChallenge.mode === 'timer' ? 'TIMED HOLD' : 'REP CHALLENGE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSpin}
                      disabled={isSpinning}
                      title="สุ่มภารกิจปิดท้ายใหม่"
                      className="btn-tactile active:scale-[0.98] transition-all h-8 px-2.5 rounded-lg bg-[#0B0D14]/85 hover:bg-[#171B26] border border-white/12 text-[#F8FAFC] text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap disabled:opacity-60"
                    >
                      <Dices className={`w-3.5 h-3.5 text-[#FACC15] ${isSpinning ? 'animate-spin' : ''}`} />
                      <span>{isSpinning ? 'สุ่ม...' : hasSpun ? 'สุ่มใหม่' : 'สุ่ม'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(true);
                        playPlateClink(soundEnabled);
                      }}
                      disabled={isSpinning}
                      className="btn-tactile active:scale-[0.98] transition-all h-8 px-2.5 rounded-lg bg-[#FF4500]/16 hover:bg-[#FF4500]/26 border border-[#FF4500]/50 text-[#FFF7ED] text-[11px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>พลิกดูวิธีฝึก</span>
                    </button>
                  </div>
                </div>

                {/* Visual Centerpiece: 3D Anatomical Muscle Icon Badge + Energy Ring + Mission Title */}
                <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
                  {/* Glowing 3D Anatomical Muscle Emblem with Concentric Energy Ring */}
                  <div className="relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] shrink-0 flex items-center justify-center">
                    {/* Ambient Radial Orange-Gold Backlight */}
                    <div
                      className="absolute inset-0 rounded-full blur-md opacity-70 pointer-events-none"
                      aria-hidden="true"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(255,69,0,0.48) 0%, rgba(250,204,21,0.24) 55%, transparent 75%)',
                      }}
                    />
                    {/* Animated Geometric Energy Ring */}
                    <svg
                      viewBox="0 0 84 84"
                      fill="none"
                      aria-hidden="true"
                      className="anim-finisher-ring absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <defs>
                        <linearGradient id={`badge-ring-${uid}`} x1="0" y1="0" x2="84" y2="84" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#FF4500" />
                          <stop offset="50%" stopColor="#FACC15" />
                          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="42"
                        cy="42"
                        r="39"
                        stroke={`url(#badge-ring-${uid})`}
                        strokeWidth="1.75"
                        strokeDasharray="18 7 6 7"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Inner Dark Carbon Medallion Housing the 3D Anatomical Muscle Icon */}
                    <div className="relative w-[56px] h-[56px] sm:w-[62px] sm:h-[62px] rounded-2xl bg-[#10131B] border border-[#FF6B35]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_-6px_rgba(255,69,0,0.55)] flex items-center justify-center overflow-hidden p-0.5">
                      <AnatomicalMuscleIcon
                        muscle={linkedExercise.muscle}
                        activeGlow={true}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Mission Headline & Crisp Target */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3
                        className={`font-display text-2xl sm:text-[28px] tracking-wide leading-tight whitespace-normal break-words transition-opacity ${
                          isSpinning ? 'text-[#FF4500] opacity-85' : 'text-[#F8FAFC]'
                        }`}
                      >
                        {currentChallenge.titleTh}
                      </h3>
                      <span className="font-display text-xl sm:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FACC15] leading-none tabular-nums whitespace-nowrap">
                        · {currentChallenge.targetBadge}
                      </span>
                    </div>
                    <p className="text-xs text-[#CBD5E1]/90 leading-snug whitespace-normal break-words">
                      {currentChallenge.cueTh}
                    </p>
                  </div>
                </div>

                {/* Compact Execution & CTA Bar (Zero Empty Space) */}
                {phase === 'idle' && (
                  <div className="relative z-10 pt-2.5 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleStartFinisher}
                      disabled={isSpinning}
                      className="btn-tactile btn-volt active:scale-[0.98] transition-all h-11 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap flex-1 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>เริ่มทำภารกิจ (Start Finisher)</span>
                    </button>

                    <div className="h-9 sm:h-11 px-3 rounded-xl bg-[#0B0D14]/75 border border-[#FACC15]/20 text-[#94A3B8] text-[11px] font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap select-none">
                      <Lock className="w-3.5 h-3.5 text-[#FACC15]/80 shrink-0" />
                      <span>ทำครบเพื่อปลดล็อก +{currentChallenge.xpReward} XP</span>
                    </div>
                  </div>
                )}

                {phase === 'active' && currentChallenge.mode === 'timer' && (
                  <div className="relative z-10 pt-2.5 border-t border-[#FF4500]/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-[74px] h-[74px] shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90" aria-hidden="true">
                          <circle
                            cx="38"
                            cy="38"
                            r={ringRadius}
                            fill="none"
                            stroke="rgba(255,255,255,0.09)"
                            strokeWidth="5.5"
                          />
                          <circle
                            cx="38"
                            cy="38"
                            r={ringRadius}
                            fill="none"
                            stroke={isFinalThreeSec ? '#FACC15' : '#FF4500'}
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringDashOffset}
                            className={isFinalThreeSec ? 'anim-rest-ring-glow' : ''}
                            style={{ transition: 'stroke-dashoffset 320ms linear' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
                          <span
                            className={`font-display text-2xl leading-none tracking-wide ${
                              isFinalThreeSec ? 'text-[#FACC15]' : 'text-[#F8FAFC]'
                            }`}
                          >
                            {formatDuration(timeLeftSec)}
                          </span>
                          <span className="text-[8.5px] font-tech font-bold text-[#94A3B8] uppercase mt-0.5">
                            {timerPaused ? 'PAUSED' : 'LIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-0.5 text-left">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F8FAFC]">
                          <Timer className="w-3.5 h-3.5 text-[#FF4500] shrink-0" />
                          <span>{timerPaused ? 'หยุดเวลาชั่วคราว' : 'กำลังจับเวลาค้างท่า...'}</span>
                        </div>
                        <p className="text-[11px] text-[#CBD5E1]/85 leading-snug">
                          {isFinalThreeSec
                            ? 'อีก 3 วินาทีสุดท้าย ฮึดไว้!'
                            : 'รอครบ 00:00 เพื่อปลดล็อก +50 XP'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setTimerPaused((p) => !p)}
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all flex-1 sm:flex-none h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        {timerPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current text-[#FF4500]" />
                            <span>ทำต่อ</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-[#FACC15]" />
                            <span>พักชั่วคราว</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => resetExecutionForChallenge(currentChallenge)}
                        aria-label="รีเซ็ตภารกิจ"
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-[#94A3B8] hover:text-[#F8FAFC]"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {phase === 'active' && currentChallenge.mode === 'reps' && (
                  <div className="relative z-10 pt-2.5 border-t border-[#FF4500]/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative w-[70px] h-[70px] shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90" aria-hidden="true">
                          <circle
                            cx="38"
                            cy="38"
                            r={ringRadius}
                            fill="none"
                            stroke="rgba(255,255,255,0.09)"
                            strokeWidth="5.5"
                          />
                          <circle
                            cx="38"
                            cy="38"
                            r={ringRadius}
                            fill="none"
                            stroke="#FF4500"
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringDashOffset}
                            style={{ transition: 'stroke-dashoffset 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
                          <span className="font-display text-xl text-[#F8FAFC] leading-none">
                            {repsDone}
                            <span className="text-xs text-[#94A3B8]">/{currentChallenge.targetValue}</span>
                          </span>
                          <span className="text-[8.5px] font-tech font-bold text-[#94A3B8] uppercase">
                            REPS
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="text-xs font-bold text-[#F8FAFC]">
                          แตะนับทีละครั้งจนครบ {currentChallenge.targetValue} ครั้ง
                        </div>
                        <div className="text-[11px] text-[#CBD5E1]/85 tabular-nums">
                          เหลืออีก <strong className="text-[#FACC15]">{currentChallenge.targetValue - repsDone}</strong> ครั้งเพื่อปลดล็อก XP
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleDecrementRep}
                        disabled={repsDone <= 0}
                        aria-label="ลดจำนวน 1 ครั้ง"
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 w-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-35"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleIncrementRep}
                        disabled={repCooldown}
                        className="btn-tactile btn-volt active:scale-[0.96] transition-all flex-1 sm:flex-none h-10 px-4 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4 stroke-[2.75]" />
                        <span>นับ +1 ครั้ง</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => resetExecutionForChallenge(currentChallenge)}
                        aria-label="รีเซ็ตจำนวนครั้ง"
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-[#94A3B8] hover:text-[#F8FAFC]"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {phase === 'completed' && (
                  <div className="relative z-10 pt-2.5 border-t border-[#FACC15]/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FACC15]/20 text-[#FACC15] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#FACC15]">
                          ทำภารกิจครบ {currentChallenge.targetBadge} แล้ว!
                        </div>
                        <div className="text-[11px] text-[#CBD5E1]">
                          ปลดล็อกรางวัลสำเร็จ กดรับโบนัส XP เข้าแรงก์ได้เลย
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClaimReward}
                      className="btn-tactile active:scale-[0.98] transition-all h-10 px-5 rounded-xl bg-[#FACC15] hover:bg-[#FDE047] text-[#090A0D] font-extrabold text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-[0_10px_24px_-6px_rgba(250,204,21,0.75)]"
                    >
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      <span>รับ +{currentChallenge.xpReward} XP</span>
                    </button>
                  </div>
                )}

                {phase === 'claimed' && (
                  <div className="relative z-10 pt-2.5 border-t border-[#FACC15]/25 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FACC15]/16 text-[#FACC15] font-bold text-xs">
                      <Trophy className="w-4 h-4 stroke-[2.5]" />
                      <span>รับโบนัส +{currentChallenge.xpReward} XP เรียบร้อยแล้ว!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSpin}
                      className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Dices className="w-3.5 h-3.5 text-[#FF4500]" />
                      <span>สุ่มภารกิจถัดไป</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ==================== BACK FACE: MATCHING COMPACT BIOMECHANICAL GUIDE ==================== */}
              <div
                className={`flashcard-face flashcard-face-back relative overflow-hidden rounded-2xl min-h-[220px] p-4 flex flex-col justify-between gap-2.5 border border-[#FF4500]/40 bg-gradient-to-br from-[#FF4500]/14 via-[#131722] to-[#FACC15]/8 shadow-[0_14px_34px_-16px_rgba(255,69,0,0.34)] ${
                  !isFlipped ? 'pointer-events-none' : ''
                }`}
                aria-hidden={!isFlipped}
              >
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6B35]/65 to-[#FACC15]/55"
                  aria-hidden="true"
                />

                {/* Compact Back Header */}
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
                    <span className="text-[10px] font-tech font-bold tracking-wider uppercase text-[#FF6B35]">
                      วิธีฝึกที่ถูกต้อง
                    </span>
                    <h4 className="font-display text-lg sm:text-xl tracking-wide text-[#F8FAFC] leading-none whitespace-normal break-words">
                      {currentChallenge.titleTh}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      playPlateClink(soundEnabled);
                    }}
                    className="btn-tactile btn-volt active:scale-[0.98] transition-all h-8 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>พลิกกลับภารกิจ</span>
                  </button>
                </div>

                {/* Compact 2-Column Stage (Animation + 3 Form Cues Matching Front Card Height) */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center flex-1">
                  <div className="sm:col-span-5 rounded-xl overflow-hidden bg-[#0A0C12]/90 border border-[#FF4500]/25">
                    <ExerciseFormAnimation
                      exercise={linkedExercise}
                      gender={gender}
                      className="finisher-compact-anim"
                    />
                  </div>

                  <ol className="sm:col-span-7 space-y-1.5">
                    {currentChallenge.formCues.map((cue, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-[11px] sm:text-xs text-[#E2E8F0] leading-snug"
                      >
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FACC15] text-[#090A0D] font-tech font-extrabold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="whitespace-normal break-words">{cue}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
