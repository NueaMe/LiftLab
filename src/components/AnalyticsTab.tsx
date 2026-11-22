import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Chart, { Plugin } from 'chart.js/auto';
import {
  Database,
  Trophy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  Scale,
} from 'lucide-react';
import { AthleteProfile, CompletedWorkout } from '../types';
import { EXERCISES, EXERCISE_MAP, MUSCLE_LABEL_TH } from '../data/exercises';
import {
  formatDuration,
  formatFullThaiDate,
  formatNumber,
  getExerciseProgression,
  getWeeklyMuscleBalance,
  getWeeklyVolumeData,
  isDemoWorkout,
} from '../utils/analytics';
import {
  calculateRelativeStrength,
  formatRelativeStrength,
} from '../utils/personalization';
import { AthleticWatermark } from './AthleticWatermark';
import { MuscleBadgeIcon } from './MuscleBadge';
import { AnimatedNumber } from './AnimatedNumber';
import { AthleteMilestones } from './AthleteMilestones';

interface AnalyticsTabProps {
  history: CompletedWorkout[];
  profile: AthleteProfile | null;
  initialExerciseId?: string | null;
  initialExerciseNonce?: number;
  onConsumeInitialExercise?: () => void;
  onOpenDataModal: () => void;
  onStartWorkout: () => void;
  onDeleteWorkoutLog: (id: string) => void;
  onOpenProfile: () => void;
}

const voltGlowLinePlugin: Plugin<'line'> = {
  id: 'voltGlowLine',
  beforeDatasetDraw(chart, args) {
    if (args.index !== 0) return;
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 69, 0, 0.56)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  },
  afterDatasetDraw(chart, args) {
    if (args.index !== 0) return;
    chart.ctx.restore();
  },
};

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  history,
  profile,
  initialExerciseId = null,
  initialExerciseNonce = 0,
  onConsumeInitialExercise,
  onOpenDataModal,
  onStartWorkout,
  onDeleteWorkoutLog,
  onOpenProfile,
}) => {
  const exerciseSessionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const session of history) {
      for (const ex of session.exercises) {
        counts[ex.exerciseId] = (counts[ex.exerciseId] ?? 0) + 1;
      }
    }
    return counts;
  }, [history]);

  const sortedExercises = useMemo(() => {
    return [...EXERCISES].sort((a, b) => {
      const diff = (exerciseSessionCounts[b.id] ?? 0) - (exerciseSessionCounts[a.id] ?? 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [exerciseSessionCounts]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    () => initialExerciseId ?? 'barbell-bench-press'
  );
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialExerciseNonce) return;
    if (initialExerciseId) {
      setSelectedExerciseId(initialExerciseId);
    }
    const timer = window.setTimeout(() => {
      document
        .getElementById('analytics-1rm-chart')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onConsumeInitialExercise?.();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [initialExerciseId, initialExerciseNonce, onConsumeInitialExercise]);

  useEffect(() => {
    if (history.length === 0) return;
    if ((exerciseSessionCounts[selectedExerciseId] ?? 0) === 0 && sortedExercises[0]) {
      const firstWithData = sortedExercises.find((e) => (exerciseSessionCounts[e.id] ?? 0) > 0);
      if (firstWithData) setSelectedExerciseId(firstWithData.id);
    }
  }, [history.length, exerciseSessionCounts, selectedExerciseId, sortedExercises]);

  const progression = useMemo(
    () => getExerciseProgression(history, selectedExerciseId),
    [history, selectedExerciseId]
  );

  const weeklyVolume = useMemo(() => getWeeklyVolumeData(history), [history]);
  const muscleBalance = useMemo(() => getWeeklyMuscleBalance(history), [history]);

  const kpis = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let weekVolume = 0;
    let weekSets = 0;
    let totalPRs = 0;

    for (const s of history) {
      totalPRs += s.prCount;
      if (new Date(s.date).getTime() >= sevenDaysAgo) {
        weekVolume += s.totalVolume;
        weekSets += s.totalWorkingSets;
      }
    }

    return {
      totalSessions: history.length,
      weekVolume: Math.round(weekVolume),
      totalPRs,
      weekSets,
    };
  }, [history]);

  const peakRelativeStrength = useMemo(() => {
    const bw = profile?.bodyWeightKg;
    if (!bw || bw <= 0 || history.length === 0) return null;

    let bestRatio = 0;
    let bestExerciseName = '';
    for (const session of history) {
      for (const ex of session.exercises) {
        for (const s of ex.sets) {
          if (s.type === 'W' || s.est1RM <= 0) continue;
          const ratio = calculateRelativeStrength(s.est1RM, bw);
          if (ratio !== null && ratio > bestRatio) {
            bestRatio = ratio;
            bestExerciseName = EXERCISE_MAP[ex.exerciseId]?.name ?? ex.exerciseId;
          }
        }
      }
    }

    if (bestRatio <= 0) return null;
    return {
      ratio: bestRatio,
      label: `${bestRatio.toFixed(2)}x BW`,
      exerciseName: bestExerciseName,
    };
  }, [history, profile?.bodyWeightKg]);

  const uid = useId().replace(/:/g, '');
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<Chart | null>(null);

  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<Chart | null>(null);

  const symmetrySummary = useMemo(() => {
    const setsByMuscle = muscleBalance.reduce<Record<string, number>>((acc, item) => {
      acc[item.muscle] = item.sets;
      return acc;
    }, {});
    const pushSets = (setsByMuscle.Chest ?? 0) + (setsByMuscle.Shoulders ?? 0) + (setsByMuscle.Triceps ?? 0);
    const pullSets = (setsByMuscle.Back ?? 0) + (setsByMuscle.Biceps ?? 0);
    const upperSets = pushSets + pullSets;
    const lowerSets = setsByMuscle.Legs ?? 0;
    const coreSets = setsByMuscle.Abs ?? 0;
    const total = upperSets + lowerSets;
    return {
      pushSets,
      pullSets,
      coreSets,
      upperPct: total > 0 ? Math.round((upperSets / total) * 100) : 0,
      lowerPct: total > 0 ? Math.round((lowerSets / total) * 100) : 0,
    };
  }, [muscleBalance]);

  const radarGeometry = useMemo(() => {
    const cx = 190;
    const cy = 136;
    const outerRadius = 96;
    const maxDataSets = Math.max(0, ...muscleBalance.map((m) => m.sets));
    const maxVal = Math.max(20, Math.ceil(maxDataSets / 5) * 5);
    const ringSteps = [0.25, 0.5, 0.75, 1];
    const count = Math.max(1, muscleBalance.length);

    const pointAt = (idx: number, radius: number) => {
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
      };
    };

    const rings = ringSteps.map((ratio) => {
      const r = outerRadius * ratio;
      const pts = muscleBalance
        .map((_, idx) => {
          const p = pointAt(idx, r);
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        })
        .join(' ');
      return {
        value: Math.round(maxVal * ratio),
        r,
        points: pts,
      };
    });

    const targetR = Math.min(1, 10 / maxVal) * outerRadius;
    const targetPoints = muscleBalance
      .map((_, idx) => {
        const p = pointAt(idx, targetR);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');

    const axes = muscleBalance.map((item, idx) => {
      const outer = pointAt(idx, outerRadius);
      const valRatio = Math.min(1, item.sets / maxVal);
      const dataPt = pointAt(idx, valRatio * outerRadius);

      let labelX = outer.x + outer.cos * 14;
      let labelY = outer.y + outer.sin * 14;
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';

      if (Math.abs(outer.cos) < 0.15) {
        textAnchor = 'middle';
        labelY = outer.sin < 0 ? outer.y - 14 : outer.y + 18;
      } else if (outer.cos > 0) {
        textAnchor = 'start';
        labelX = outer.x + (outer.sin > 0.65 ? 6 : 11);
        labelY = outer.y + (outer.sin > 0.65 ? 16 : outer.sin < -0.4 ? -2 : 4);
      } else {
        textAnchor = 'end';
        labelX = outer.x - (outer.sin > 0.65 ? 6 : 11);
        labelY = outer.y + (outer.sin > 0.65 ? 16 : outer.sin < -0.4 ? -2 : 4);
      }

      return {
        ...item,
        outerX: outer.x,
        outerY: outer.y,
        dataX: dataPt.x,
        dataY: dataPt.y,
        labelX,
        labelY,
        textAnchor,
      };
    });

    const dataPolygonPoints = axes
      .map((a) => `${a.dataX.toFixed(1)},${a.dataY.toFixed(1)}`)
      .join(' ');

    return {
      cx,
      cy,
      outerRadius,
      maxVal,
      rings,
      targetPoints,
      axes,
      dataPolygonPoints,
    };
  }, [muscleBalance]);

  useEffect(() => {
    if (!lineCanvasRef.current) return;
    if (lineChartRef.current) {
      lineChartRef.current.destroy();
      lineChartRef.current = null;
    }
    if (progression.length === 0) return;

    const ctx = lineCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const blazeGradient = ctx.createLinearGradient(0, 0, 0, 290);
    blazeGradient.addColorStop(0, 'rgba(255, 69, 0, 0.36)');
    blazeGradient.addColorStop(0.55, 'rgba(250, 204, 21, 0.12)');
    blazeGradient.addColorStop(1, 'rgba(13, 13, 15, 0.0)');

    lineChartRef.current = new Chart(ctx, {
      type: 'line',
      plugins: [voltGlowLinePlugin],
      data: {
        labels: progression.map((p) => p.dateLabel),
        datasets: [
          {
            label: 'Estimated 1RM (kg)',
            data: progression.map((p) => p.est1RM),
            borderColor: '#FF4500',
            backgroundColor: blazeGradient,
            borderWidth: 3,
            fill: true,
            tension: 0.36,
            pointRadius: 4.5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FACC15',
            pointBorderColor: '#0D0D0F',
            pointBorderWidth: 2,
          },
          {
            label: 'Max Weight (kg)',
            data: progression.map((p) => p.maxWeight),
            borderColor: '#38BDF8',
            backgroundColor: 'transparent',
            borderWidth: 2.25,
            borderDash: [6, 4],
            fill: false,
            tension: 0.32,
            pointRadius: 3.5,
            pointHoverRadius: 5.5,
            pointBackgroundColor: '#38BDF8',
            pointBorderColor: '#0D0D0F',
            pointBorderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#E4E4E7',
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { family: "'Noto Sans Thai', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(13, 13, 15, 0.96)',
            borderColor: 'rgba(255, 69, 0, 0.45)',
            borderWidth: 1,
            titleColor: '#F4F4F5',
            bodyColor: '#E4E4E7',
            padding: 12,
            cornerRadius: 12,
            titleFont: { family: "'Noto Sans Thai', sans-serif", weight: 'bold' },
            bodyFont: { family: "'Noto Sans Thai', sans-serif" },
            callbacks: {
              afterBody: (items) => {
                const idx = items[0]?.dataIndex;
                if (idx === undefined || !progression[idx]) return '';
                const lines = [`เซ็ตดีที่สุด: ${progression[idx].bestSetLabel}`];
                const rel = formatRelativeStrength(progression[idx].est1RM, profile?.bodyWeightKg);
                if (rel) {
                  lines.push(`Relative Strength: ${rel}`);
                }
                return lines;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#A1A1AA',
              font: { family: "'Noto Sans Thai', sans-serif", size: 11 },
            },
          },
          y: {
            grid: { color: 'rgba(228, 228, 231, 0.08)' },
            border: { display: false },
            ticks: {
              color: '#A1A1AA',
              font: { family: "'Barlow Condensed', sans-serif", size: 12, weight: 600 },
              callback: (v) => `${v} KG`,
            },
          },
        },
      },
    });

    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
        lineChartRef.current = null;
      }
    };
  }, [progression, profile?.bodyWeightKg]);

  useEffect(() => {
    if (!barCanvasRef.current) return;
    if (barChartRef.current) {
      barChartRef.current.destroy();
      barChartRef.current = null;
    }
    if (weeklyVolume.length === 0) return;

    const ctx = barCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const ironFireGradient = ctx.createLinearGradient(0, 0, 0, 260);
    ironFireGradient.addColorStop(0, 'rgba(250, 204, 21, 0.95)');
    ironFireGradient.addColorStop(0.45, 'rgba(255, 69, 0, 0.88)');
    ironFireGradient.addColorStop(1, 'rgba(185, 28, 28, 0.28)');

    barChartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weeklyVolume.map((w) => w.label),
        datasets: [
          {
            label: 'ปริมาณการยกรวม (kg)',
            data: weeklyVolume.map((w) => w.volume),
            backgroundColor: ironFireGradient,
            hoverBackgroundColor: '#FACC15',
            borderColor: 'rgba(250, 204, 21, 0.45)',
            borderWidth: 1,
            borderRadius: { topLeft: 8, topRight: 8 },
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13, 13, 15, 0.96)',
            borderColor: 'rgba(250, 204, 21, 0.45)',
            borderWidth: 1,
            titleColor: '#F4F4F5',
            bodyColor: '#E4E4E7',
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (item) => {
                const val = Number(item.raw) || 0;
                const wk = weeklyVolume[item.dataIndex];
                return `${val.toLocaleString('en-US')} kg (${wk?.sessions ?? 0} ครั้งฝึก)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#A1A1AA',
              font: { family: "'Noto Sans Thai', sans-serif", size: 11 },
            },
          },
          y: {
            grid: { color: 'rgba(228, 228, 231, 0.08)' },
            border: { display: false },
            ticks: {
              color: '#A1A1AA',
              font: { family: "'Barlow Condensed', sans-serif", size: 12, weight: 600 },
              callback: (v) => {
                const n = Number(v);
                return n >= 1000 ? `${(n / 1000).toFixed(1)}T` : `${n}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (barChartRef.current) {
        barChartRef.current.destroy();
        barChartRef.current = null;
      }
    };
  }, [weeklyVolume]);

  // Clean 0-State Empty View
  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <section className="glass-card rounded-2xl overflow-hidden relative">
          <div className="knurl-divider" />
          <AthleticWatermark
            variant="plate"
            className="absolute -right-8 -top-6 w-36 h-36 text-[#F8FAFC] opacity-[0.035]"
          />
          <div className="px-4 sm:px-5 py-3.5 relative z-10">
            <div className="editorial-label text-[#FF4500]">PROGRESSIVE OVERLOAD TELEMETRY</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-hero-gradient leading-none mt-1">
              PERFORMANCE &amp; STRENGTH ANALYTICS
            </h1>
          </div>
        </section>

        {/* Compact 0-state KPI Scoreboard */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          <div className="glass-card rounded-2xl p-3.5 sm:p-4">
            <div className="editorial-label">TOTAL SESSIONS</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1 leading-none">
              0<span className="text-xs font-sans font-medium text-[#94A3B8] ml-1">ครั้ง</span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-3.5 sm:p-4">
            <div className="editorial-label">7-DAY VOLUME</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1 leading-none">
              0<span className="text-xs font-tech font-semibold text-[#94A3B8] ml-1">KG</span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-3.5 sm:p-4">
            <div className="editorial-label">WORKING SETS · 7D</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1 leading-none">
              0<span className="text-xs font-sans font-medium text-[#94A3B8] ml-1">เซ็ต</span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-3.5 sm:p-4">
            <div className="editorial-label">NEW PR! TOTAL</div>
            <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums mt-1 leading-none">
              0
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6 text-center space-y-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FF4500]/14 text-[#FF4500] flex items-center justify-center mx-auto">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-bold text-[#F8FAFC]">
              พร้อมบันทึกข้อมูลสถิติตั้งแต่เซสชันแรก
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              เมื่อบันทึกการฝึกเสร็จ กราฟ Estimated 1RM, ปริมาณยกรวม และสมดุล 7 กล้ามเนื้อจะแสดงอัตโนมัติ หรือลองโหลดข้อมูล Demo 4 สัปดาห์
            </p>
          </div>
          <div className="grid grid-cols-2 sm:inline-flex items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onStartWorkout}
              className="btn-tactile btn-volt active:scale-[0.98] transition-all h-10 px-4 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              เริ่มเซสชันที่ 1
            </button>
            <button
              type="button"
              onClick={onOpenDataModal}
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-[#94A3B8]" />
              โหลด Demo / ข้อมูล
            </button>
          </div>
        </section>

        {/* Athlete Milestones & Badges (Compact 0-state locked strip) */}
        <AthleteMilestones history={history} profile={profile} />
      </div>
    );
  }

  const latestPoint = progression[progression.length - 1];
  const firstPoint = progression[0];
  const delta1RM =
    latestPoint && firstPoint && progression.length > 1
      ? Number((latestPoint.est1RM - firstPoint.est1RM).toFixed(1))
      : 0;
  const selectedRelStrength = latestPoint
    ? formatRelativeStrength(latestPoint.est1RM, profile?.bodyWeightKg)
    : null;

  return (
    <div className="space-y-4">
      {/* Compact Header & Peak Relative Strength */}
      <section className="glass-card rounded-2xl overflow-hidden relative">
        <AthleticWatermark
          variant="plate"
          className="absolute -right-8 -top-6 w-36 h-36 text-[#F8FAFC] opacity-[0.028]"
        />
        <div className="px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="min-w-0">
            <div className="editorial-label">PROGRESSIVE OVERLOAD TELEMETRY</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-hero-gradient leading-none mt-1">
              PERFORMANCE &amp; STRENGTH ANALYTICS
            </h1>
          </div>

          {peakRelativeStrength ? (
            <button
              type="button"
              onClick={onOpenProfile}
              title="ความแข็งแรงเทียบน้ำหนักตัว (1RM หารด้วยน้ำหนักตัว)"
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all rounded-xl px-3.5 py-2 text-left shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
            >
              <Scale className="w-4 h-4 text-[#94A3B8] shrink-0" />
              <div className="leading-tight">
                <div className="text-[10px] font-tech font-semibold tracking-wider text-[#8A94A6] uppercase">
                  PEAK RELATIVE (X BW) ·{' '}
                  <span className="font-sans normal-case tracking-normal text-[#CBD5E1] font-medium">
                    ความแข็งแรงเทียบน้ำหนักตัว
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 tabular-nums mt-0.5">
                  <span className="font-display text-xl tracking-wide text-[#F8FAFC] leading-none">
                    {peakRelativeStrength.label}
                  </span>
                  <span className="text-[11px] text-[#8A94A6] whitespace-normal break-words leading-snug">
                    {peakRelativeStrength.exerciseName}
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenProfile}
              title="ความแข็งแรงเทียบน้ำหนักตัว (x BW)"
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Scale className="w-3.5 h-3.5 text-[#94A3B8]" />
              ใส่น้ำหนักตัวเพื่อดู x BW (เทียบน้ำหนักตัว)
            </button>
          )}
        </div>
      </section>

      {/* Compact 4-Card KPI Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        <div className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1">
          <div className="editorial-label">TOTAL SESSIONS</div>
          <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums leading-none">
            <AnimatedNumber value={kpis.totalSessions} />
            <span className="text-xs font-sans font-medium text-[#8A94A6] ml-1">ครั้ง</span>
          </div>
          <div className="text-[11px] text-[#64748B]">จำนวนครั้งฝึกทั้งหมด</div>
        </div>

        <div className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1">
          <div className="editorial-label">7-DAY VOLUME</div>
          <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums leading-none">
            <AnimatedNumber value={kpis.weekVolume} />
            <span className="text-xs font-tech font-semibold text-[#8A94A6] ml-1">KG</span>
          </div>
          <div className="text-[11px] text-[#64748B]">น้ำหนักยกรวมทั้งหมด (7 วัน)</div>
        </div>

        <div className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1">
          <div className="editorial-label">WORKING SETS · 7D</div>
          <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#F8FAFC] tabular-nums leading-none">
            <AnimatedNumber value={kpis.weekSets} />
            <span className="text-xs font-sans font-medium text-[#8A94A6] ml-1">เซ็ต</span>
          </div>
          <div className="text-[11px] text-[#64748B]">เซ็ตฝึกหลัก 7 วันล่าสุด</div>
        </div>

        <div className="glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between gap-1">
          <div className="editorial-label">NEW PR! ACHIEVED</div>
          <div className="font-display text-3xl sm:text-4xl tracking-wide text-[#FACC15] tabular-nums leading-none flex items-center gap-1.5">
            <Trophy className="w-5 h-5 shrink-0" />
            <AnimatedNumber value={kpis.totalPRs} />
          </div>
          <div className="text-[11px] text-[#64748B]">สถิติ NEW PR! สะสม</div>
        </div>
      </section>

      {/* Balanced 2-Column Compact Bento Grid (All 4 Charts/Breakdowns Visible With Minimal Scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
        {/* Bento 1: 1RM Progression Line Chart */}
        <section id="analytics-1rm-chart" className="glass-card rounded-2xl overflow-hidden flex flex-col scroll-mt-24">
          <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="editorial-label">STRENGTH TRAJECTORY</div>
              <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                1RM &amp; MAX WEIGHT
              </h2>
              <div className="text-[10.5px] text-[#8A94A6] mt-0.5">
                Est. 1RM = พลังสูงสุด 1 ครั้ง
              </div>
            </div>

            <div className="w-full sm:w-52">
              <label htmlFor="exercise-chart-select" className="sr-only">
                เลือกท่าฝึกสำหรับแสดงกราฟ
              </label>
              <select
                id="exercise-chart-select"
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="surface-inner w-full h-8 px-2.5 rounded-lg text-xs font-semibold text-[#F8FAFC]"
              >
                {sortedExercises.map((ex) => {
                  const count = exerciseSessionCounts[ex.id] ?? 0;
                  return (
                    <option key={ex.id} value={ex.id} className="bg-[#12141A] text-[#F8FAFC]">
                      {ex.name} {count > 0 ? `(${count})` : '(—)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
            {latestPoint ? (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#94A3B8] tabular-nums">
                <span>
                  1RM:{' '}
                  <strong className="text-[#FF4500] font-tech font-bold">
                    {formatNumber(latestPoint.est1RM)} kg
                  </strong>
                </span>
                <span className="text-[#475569]">·</span>
                <span className="text-[#F8FAFC] font-tech font-semibold">
                  Max {formatNumber(latestPoint.maxWeight)} kg
                </span>
                {selectedRelStrength && (
                  <>
                    <span className="text-[#475569]">·</span>
                    <span className="text-[#F8FAFC] font-tech font-semibold">
                      {selectedRelStrength}
                    </span>
                  </>
                )}
                {delta1RM !== 0 && (
                  <>
                    <span className="text-[#475569]">·</span>
                    <span className={delta1RM > 0 ? 'text-[#FF4500] font-tech font-bold' : ''}>
                      {delta1RM > 0 ? `+${formatNumber(delta1RM)}` : formatNumber(delta1RM)} kg
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-[#64748B]">ยังไม่มีข้อมูลการฝึกสำหรับท่านี้</div>
            )}

            <div className="h-48 sm:h-52 w-full relative">
              {progression.length > 0 ? (
                <canvas ref={lineCanvasRef} />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                  เลือกท่าฝึกที่มีประวัติการบันทึกเพื่อแสดงกราฟพัฒนาการ
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bento 2: 7-Axis Muscle Symmetry Radar Chart */}
        <section className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
            <div>
              <div className="editorial-label">SYMMETRY DIAGNOSTICS</div>
              <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                7-AXIS MUSCLE RADAR
              </h2>
            </div>
            <span className="text-[11px] font-tech text-[#94A3B8] tabular-nums">
              TARGET 10 SETS
            </span>
          </div>

          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
            {/* Large Responsive 7-Axis SVG Spider Radar */}
            <div className="w-full flex flex-col items-center">
              <svg
                viewBox="0 0 380 264"
                preserveAspectRatio="xMidYMid meet"
                className="w-full max-w-[390px] h-auto block select-none"
                role="img"
                aria-label="กราฟเรดาร์สมดุลกล้ามเนื้อ 7 แกนรายสัปดาห์"
              >
                <defs>
                  <radialGradient id={`radar-fill-${uid}`} cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor="#FF4500" stopOpacity="0.44" />
                    <stop offset="65%" stopColor="#FF4500" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#FACC15" stopOpacity="0.14" />
                  </radialGradient>
                  <filter id={`radar-glow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id={`vertex-glow-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="3.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Concentric 7-Axis Web Rings */}
                {radarGeometry.rings.map((ring, idx) => (
                  <g key={ring.value}>
                    <polygon
                      points={ring.points}
                      fill={idx === radarGeometry.rings.length - 1 ? 'rgba(255, 255, 255, 0.015)' : 'none'}
                      stroke={
                        idx === radarGeometry.rings.length - 1
                          ? 'rgba(228, 228, 231, 0.16)'
                          : 'rgba(228, 228, 231, 0.09)'
                      }
                      strokeWidth={idx === radarGeometry.rings.length - 1 ? '1.15' : '0.9'}
                    />
                    <text
                      x={radarGeometry.cx + 4}
                      y={radarGeometry.cy - ring.r + 3}
                      fill="#71717A"
                      fontSize="9.5"
                      fontFamily="'Barlow Condensed', sans-serif"
                      fontWeight="600"
                    >
                      {ring.value}
                    </text>
                  </g>
                ))}

                {/* Radial Spokes */}
                {radarGeometry.axes.map((axis) => (
                  <line
                    key={`spoke-${axis.muscle}`}
                    x1={radarGeometry.cx}
                    y1={radarGeometry.cy}
                    x2={axis.outerX}
                    y2={axis.outerY}
                    stroke="rgba(228, 228, 231, 0.13)"
                    strokeWidth="0.95"
                  />
                ))}

                {/* Target 10-Set Minimum Reference Polygon */}
                <polygon
                  points={radarGeometry.targetPoints}
                  fill="rgba(56, 189, 248, 0.07)"
                  stroke="rgba(56, 189, 248, 0.78)"
                  strokeWidth="1.4"
                  strokeDasharray="4.5 3.5"
                />

                {/* Actual Weekly Volume Polygon */}
                <polygon
                  points={radarGeometry.dataPolygonPoints}
                  fill={`url(#radar-fill-${uid})`}
                  stroke="#FF4500"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  filter={`url(#radar-glow-${uid})`}
                />

                {/* Glowing Data Vertices */}
                {radarGeometry.axes.map((axis) => {
                  const hasSets = axis.sets > 0;
                  return (
                    <g key={`vertex-${axis.muscle}`}>
                      <title>{`${axis.labelTh} (${axis.labelEn}): ${axis.sets} เซ็ต / เป้าหมาย 10 เซ็ต`}</title>
                      {hasSets && (
                        <circle
                          cx={axis.dataX}
                          cy={axis.dataY}
                          r="7.5"
                          fill="#FACC15"
                          fillOpacity="0.22"
                          filter={`url(#vertex-glow-${uid})`}
                        />
                      )}
                      <circle
                        cx={axis.dataX}
                        cy={axis.dataY}
                        r={hasSets ? '4.2' : '2.8'}
                        fill={hasSets ? '#FACC15' : '#64748B'}
                        stroke="#090A0D"
                        strokeWidth="1.6"
                      />
                    </g>
                  );
                })}

                {/* Crisp High-Contrast Axis Labels With Exact Set Counts */}
                {radarGeometry.axes.map((axis) => {
                  const hasSets = axis.sets > 0;
                  return (
                    <text
                      key={`label-${axis.muscle}`}
                      x={axis.labelX}
                      y={axis.labelY}
                      textAnchor={axis.textAnchor}
                      fontFamily="'Noto Sans Thai', 'Plus Jakarta Sans', sans-serif"
                      fontSize="11.5"
                    >
                      <tspan fill="#F8FAFC" fontWeight="600">
                        {axis.labelTh}
                      </tspan>
                      <tspan fill="#64748B" fontWeight="600">
                        {' · '}
                      </tspan>
                      <tspan
                        fill={hasSets ? '#FACC15' : '#94A3B8'}
                        fontWeight="800"
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {axis.sets}
                      </tspan>
                    </text>
                  );
                })}
              </svg>

              {/* Compact 1-Line Legend */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10.5px] text-[#CBD5E1] mt-0.5">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] ring-2 ring-[#FACC15]/60 inline-block" />
                  <span>เซ็ตฝึกจริง (7 วัน)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-3.5 h-0 border-t-2 border-dashed border-[#38BDF8] inline-block" />
                  <span>เป้าหมายขั้นต่ำ (10 เซ็ต)</span>
                </span>
              </div>
            </div>

            {/* Zero-Clipping 3-Column Bottom Ratio Strip */}
            <div className="pt-2.5 border-t border-white/[0.06] grid grid-cols-3 gap-1.5 font-tech tabular-nums">
              <div className="scoreboard-cell rounded-lg px-2 py-2 min-w-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#94A3B8] leading-none whitespace-nowrap">
                  Push/Pull
                </span>
                <span className="text-[11px] font-bold text-[#F8FAFC] whitespace-nowrap mt-1 leading-none">
                  <span className="text-[#FF4500]">{symmetrySummary.pushSets}</span>
                  <span className="text-[#64748B] mx-0.5">:</span>
                  <span>{symmetrySummary.pullSets}</span>
                </span>
              </div>

              <div className="scoreboard-cell rounded-lg px-2 py-2 min-w-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#94A3B8] leading-none whitespace-nowrap">
                  บน/ล่าง
                </span>
                <span className="text-[11px] font-bold text-[#F8FAFC] whitespace-nowrap mt-1 leading-none">
                  <span className="text-[#FF4500]">{symmetrySummary.upperPct}%</span>
                  <span className="text-[#64748B] mx-0.5">/</span>
                  <span>{symmetrySummary.lowerPct}%</span>
                </span>
              </div>

              <div className="scoreboard-cell rounded-lg px-2 py-2 min-w-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-[#94A3B8] leading-none whitespace-nowrap">
                  Core
                </span>
                <span className="text-[11px] font-bold text-[#F8FAFC] whitespace-nowrap mt-1 leading-none">
                  {symmetrySummary.coreSets}{' '}
                  <span className="text-[10px] font-medium text-[#94A3B8]">เซ็ต</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bento 3: Weekly Volume Bar Chart */}
        <section className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
            <div>
              <div className="editorial-label">TONNAGE OUTPUT</div>
              <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                WEEKLY VOLUME (KG)
              </h2>
              <div className="text-[10.5px] text-[#94A3B8] mt-0.5">
                น้ำหนักยกรวมทั้งหมด (น้ำหนัก × ครั้ง)
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] whitespace-nowrap shrink-0">7 วัน / สัปดาห์</span>
          </div>

          <div className="p-3.5 sm:p-4 flex-1 flex items-center">
            <div className="h-48 sm:h-52 w-full relative">
              <canvas ref={barCanvasRef} />
            </div>
          </div>
        </section>

        {/* Bento 4: Compact Weekly Muscle Set Balance Breakdown */}
        <section className="glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
            <div>
              <div className="editorial-label">HYPERTROPHY VOLUME</div>
              <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none mt-0.5">
                WEEKLY MUSCLE SETS
              </h2>
            </div>
            <span className="text-[11px] font-tech font-bold text-[#F8FAFC] tabular-nums">
              10–20 SETS/WK
            </span>
          </div>

          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
            {muscleBalance.map((item) => {
              const maxScale = 24;
              const widthPct = Math.min(100, (item.sets / maxScale) * 100);
              const optimalStartPct = (10 / maxScale) * 100;
              const optimalWidthPct = ((20 - 10) / maxScale) * 100;

              const barColor =
                item.status === 'optimal'
                  ? 'bg-[#FF4500]'
                  : item.status === 'high'
                    ? 'bg-[#FACC15]'
                    : 'bg-[#38BDF8]';

              const statusText =
                item.status === 'optimal'
                  ? 'เหมาะสม'
                  : item.status === 'high'
                    ? 'สูง'
                    : `+${10 - item.sets}`;

              const statusTextClass =
                item.status === 'optimal'
                  ? 'text-[#FF4500]'
                  : item.status === 'high'
                    ? 'text-[#FACC15]'
                    : 'text-[#38BDF8]';

              return (
                <div key={item.muscle} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MuscleBadgeIcon muscle={item.muscle} size="sm" />
                      <span className="font-bold text-[#F8FAFC] whitespace-normal break-words leading-snug">{item.labelTh}</span>
                      <span className="text-[#64748B] hidden sm:inline">{item.labelEn}</span>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums shrink-0">
                      <span className={`font-semibold ${statusTextClass}`}>{statusText}</span>
                      <span className="text-[#475569]">·</span>
                      <span className="font-bold font-tech text-[#F8FAFC]">{item.sets} เซ็ต</span>
                    </div>
                  </div>

                  <div className="relative h-1.5 rounded-full bg-[#090A0D] overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-white/[0.05] border-x border-white/[0.12]"
                      style={{
                        left: `${optimalStartPct}%`,
                        width: `${optimalWidthPct}%`,
                      }}
                    />
                    <div
                      className={`relative h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Compact Athlete Milestones & Badges Strip Below the Charts */}
      <AthleteMilestones history={history} profile={profile} />

      {/* Compact Recent Workout History */}
      <section className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl sm:text-2xl tracking-wide text-[#F8FAFC] leading-none tabular-nums">
              RECENT SESSIONS ({history.length})
            </h2>
          </div>
          <span className="text-[11px] text-[#94A3B8]">แตะเพื่อดูรายละเอียดเซ็ต</span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {history.slice(0, 12).map((session) => {
            const isOpen = expandedSessionId === session.id;
            return (
              <div key={session.id}>
                <button
                  type="button"
                  onClick={() => setExpandedSessionId(isOpen ? null : session.id)}
                  className="w-full px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.025] active:scale-[0.98] transition-all text-left"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-[#F8FAFC] whitespace-normal break-words leading-snug">
                        {session.name}
                      </span>
                      {isDemoWorkout(session) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FACC15]/14 border border-[#FACC15]/35 text-[#FACC15] font-tech font-bold text-[9.5px] tracking-wider leading-none uppercase shrink-0">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#94A3B8] tabular-nums">
                      <span>{formatFullThaiDate(session.date)}</span>
                      <span aria-hidden="true" className="text-[#475569]">·</span>
                      <span>{formatDuration(session.durationSec)}</span>
                      <span aria-hidden="true" className="text-[#475569]">·</span>
                      <span className="text-[#F8FAFC] font-tech font-semibold">
                        {formatNumber(session.totalVolume)} kg
                      </span>
                      <span aria-hidden="true" className="text-[#475569]">·</span>
                      <span>{session.totalWorkingSets} เซ็ต</span>
                      {session.prCount > 0 && (
                        <>
                          <span aria-hidden="true" className="text-[#475569]">·</span>
                          <span className="text-[#FACC15] font-tech font-bold">
                            {session.prCount} PR!
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-[#64748B] shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-2.5 bg-[#090A0D]/55 space-y-3 border-t border-white/[0.05]">
                    {/* Clear Beginner Set-Code Legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#94A3B8]">
                      <span className="inline-flex items-center gap-1">
                        <span className="px-1.5 py-px rounded bg-[#1A1D24] text-[#94A3B8] font-tech font-bold">
                          W
                        </span>
                        <span>= วอร์มอัพ (ไม่นับสถิติ)</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="px-1.5 py-px rounded bg-[#252B39] text-[#F8FAFC] font-tech font-bold">
                          N
                        </span>
                        <span>= เซ็ตฝึกจริง</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="px-1.5 py-px rounded bg-[#FF4500]/18 text-[#FF4500] font-tech font-bold">
                          F
                        </span>
                        <span>= หมดแรง</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {session.exercises.map((ex, eIdx) => {
                        const def = EXERCISE_MAP[ex.exerciseId];
                        return (
                          <div
                            key={`${ex.exerciseId}-${eIdx}`}
                            className="p-3 rounded-xl bg-[#1A1D24] space-y-1.5"
                          >
                            <div className="text-xs font-bold text-[#F8FAFC] flex items-start justify-between gap-2">
                              <span className="whitespace-normal break-words leading-snug min-w-0 flex-1">
                                {def?.name ?? ex.exerciseId}
                              </span>
                              {def && (
                                <span className="text-[11px] text-[#94A3B8] font-medium shrink-0">
                                  {MUSCLE_LABEL_TH[def.muscle]}
                                </span>
                              )}
                            </div>
                            <ul className="space-y-1">
                              {ex.sets.map((s, sIdx) => {
                                const setTypeLabel =
                                  s.type === 'W'
                                    ? 'วอร์มอัพ'
                                    : s.type === 'F'
                                      ? 'หมดแรง'
                                      : 'ฝึกจริง';
                                const setBadgeStyle =
                                  s.type === 'W'
                                    ? 'bg-[#0D1017] text-[#94A3B8]'
                                    : s.type === 'F'
                                      ? 'bg-[#FF4500]/18 text-[#FF6B35]'
                                      : 'bg-[#252B39] text-[#E2E8F0]';
                                return (
                                  <li
                                    key={sIdx}
                                    className="text-[11px] text-[#94A3B8] font-tech tabular-nums flex items-center justify-between gap-2"
                                  >
                                    <span className="inline-flex items-center gap-1.5 min-w-0">
                                      <span
                                        title={
                                          s.type === 'W'
                                            ? 'W = วอร์มอัพ (ไม่นับสถิติ)'
                                            : s.type === 'F'
                                              ? 'F = เซ็ตฝึกจนหมดแรง'
                                              : 'N = เซ็ตฝึกจริง'
                                        }
                                        className={`inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] font-bold shrink-0 ${setBadgeStyle}`}
                                      >
                                        <span>
                                          {s.type}
                                          {sIdx + 1}
                                        </span>
                                        <span className="font-sans font-medium opacity-80">
                                          {setTypeLabel}
                                        </span>
                                      </span>
                                      <span className="text-[#F8FAFC]">
                                        {formatNumber(s.weight)} kg × {s.reps}
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1.5 shrink-0">
                                      {s.isPR && (
                                        <span className="px-1 py-px rounded bg-[#FACC15] text-[#090A0D] font-display text-[11px] tracking-wider leading-none">
                                          PR!
                                        </span>
                                      )}
                                      {s.type !== 'W' && s.est1RM > 0 && (
                                        <span
                                          className="text-[#64748B]"
                                          title="Est. 1RM · พลังสูงสุด 1 ครั้ง"
                                        >
                                          1RM {formatNumber(s.est1RM)}
                                          {formatRelativeStrength(s.est1RM, profile?.bodyWeightKg) && (
                                            <span className="text-[#94A3B8] ml-1 font-semibold">
                                              ({formatRelativeStrength(s.est1RM, profile?.bodyWeightKg)})
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDeleteWorkoutLog(session.id)}
                        className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-8 px-3 rounded-lg text-[11px] font-semibold text-[#E2E8F0] inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3 text-[#94A3B8]" />
                        ลบบันทึกนี้
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
