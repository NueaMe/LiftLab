import React, { useId, useMemo, useState } from 'react';
import { Minus, Plus, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { AthleteGender } from '../types';
import { formatNumber, playPlateClink } from '../utils/analytics';
import { AnimatedNumber } from './AnimatedNumber';

interface PlateSpec {
  weight: number;
  label: string;
  colorNameTh: string;
  heightPx: number;
  widthPx: number;
  swatchClass: string;
  gradStops: [string, string, string, string];
  rimStroke: string;
  hubColor: string;
  textFill: string;
}

/**
 * IWF Standard Color-Coded Competition Bumper & Fractional Plates:
 * 25kg Red, 20kg Blue, 15kg Yellow, 10kg Green, 5kg White, 2.5kg Red, 1.25kg Silver
 */
const AVAILABLE_PLATES: PlateSpec[] = [
  {
    weight: 25,
    label: '25',
    colorNameTh: 'แดง',
    heightPx: 132,
    widthPx: 23,
    swatchClass: 'bg-[#DC2626]',
    gradStops: ['#f87171', '#dc2626', '#991b1b', '#450a0a'],
    rimStroke: 'rgba(254, 202, 202, 0.5)',
    hubColor: 'rgba(255, 255, 255, 0.28)',
    textFill: '#FFFFFF',
  },
  {
    weight: 20,
    label: '20',
    colorNameTh: 'น้ำเงิน',
    heightPx: 132,
    widthPx: 21,
    swatchClass: 'bg-[#2563EB]',
    gradStops: ['#60a5fa', '#2563eb', '#1e40af', '#172554'],
    rimStroke: 'rgba(191, 219, 254, 0.52)',
    hubColor: 'rgba(255, 255, 255, 0.28)',
    textFill: '#FFFFFF',
  },
  {
    weight: 15,
    label: '15',
    colorNameTh: 'เหลือง',
    heightPx: 126,
    widthPx: 19,
    swatchClass: 'bg-[#EAB308]',
    gradStops: ['#fef08a', '#facc15', '#ca8a04', '#713f12'],
    rimStroke: 'rgba(254, 249, 195, 0.62)',
    hubColor: 'rgba(17, 17, 19, 0.3)',
    textFill: '#111113',
  },
  {
    weight: 10,
    label: '10',
    colorNameTh: 'เขียว',
    heightPx: 118,
    widthPx: 17,
    swatchClass: 'bg-[#16A34A]',
    gradStops: ['#4ade80', '#16a34a', '#166534', '#052e16'],
    rimStroke: 'rgba(187, 247, 208, 0.48)',
    hubColor: 'rgba(255, 255, 255, 0.26)',
    textFill: '#FFFFFF',
  },
  {
    weight: 5,
    label: '5',
    colorNameTh: 'ขาว',
    heightPx: 92,
    widthPx: 15,
    swatchClass: 'bg-[#F4F4F0]',
    gradStops: ['#ffffff', '#f4f4f0', '#a1a1aa', '#52525b'],
    rimStroke: 'rgba(255, 255, 255, 0.78)',
    hubColor: 'rgba(17, 17, 19, 0.28)',
    textFill: '#111113',
  },
  {
    weight: 2.5,
    label: '2.5',
    colorNameTh: 'แดงเล็ก',
    heightPx: 74,
    widthPx: 14,
    swatchClass: 'bg-[#B91C1C]',
    gradStops: ['#fca5a5', '#dc2626', '#991b1b', '#450a0a'],
    rimStroke: 'rgba(254, 202, 202, 0.5)',
    hubColor: 'rgba(255, 255, 255, 0.28)',
    textFill: '#FFFFFF',
  },
  {
    weight: 1.25,
    label: '1.25',
    colorNameTh: 'เงิน',
    heightPx: 58,
    widthPx: 13,
    swatchClass: 'bg-[#D4D4D8]',
    gradStops: ['#fafafa', '#d4d4d8', '#71717a', '#3f3f46'],
    rimStroke: 'rgba(255, 255, 255, 0.7)',
    hubColor: 'rgba(17, 17, 19, 0.32)',
    textFill: '#111113',
  },
];

const BAR_OPTIONS = [
  { weight: 20, label: 'Olympic Bar 20kg' },
  { weight: 15, label: 'Bar 15kg' },
  { weight: 10, label: 'EZ-Bar 10kg' },
];

const QUICK_PRESET_TARGETS = [60, 80, 100, 140, 180, 220];

interface BarbellPlateCalculatorProps {
  defaultOpen?: boolean;
  soundEnabled?: boolean;
  gender?: AthleteGender;
}

export const BarbellPlateCalculator: React.FC<BarbellPlateCalculatorProps> = ({
  defaultOpen = true,
  soundEnabled = true,
}) => {
  const uid = useId().replace(/:/g, '');
  const [expanded, setExpanded] = useState(defaultOpen);
  const [targetWeight, setTargetWeight] = useState<number>(100);
  const [barWeight, setBarWeight] = useState<number>(20);

  const quickTargets = QUICK_PRESET_TARGETS;

  const calculation = useMemo(() => {
    const safeTarget = Math.max(barWeight, targetWeight);
    const loadBothSides = Math.max(0, safeTarget - barWeight);
    let remainingPerSide = loadBothSides / 2;

    const perSidePlates: PlateSpec[] = [];
    const grouped: { plate: PlateSpec; count: number }[] = [];

    for (const plate of AVAILABLE_PLATES) {
      let count = 0;
      while (remainingPerSide + 0.0001 >= plate.weight && perSidePlates.length < 9) {
        remainingPerSide -= plate.weight;
        perSidePlates.push(plate);
        count += 1;
      }
      if (count > 0) {
        grouped.push({ plate, count });
      }
    }

    const loadedPerSide = perSidePlates.reduce((sum, p) => sum + p.weight, 0);
    const actualTotal = barWeight + loadedPerSide * 2;
    const remainderTotal = Number((safeTarget - actualTotal).toFixed(2));

    return {
      perSidePlates,
      grouped,
      loadedPerSide,
      actualTotal,
      remainderTotal,
    };
  }, [targetWeight, barWeight]);

  const updateTarget = (next: number) => {
    const clamped = Math.max(barWeight, Math.min(400, Number(next.toFixed(2))));
    if (clamped !== targetWeight) {
      setTargetWeight(clamped);
      playPlateClink(soundEnabled);
    }
  };

  const adjustWeight = (delta: number) => {
    updateTarget(targetWeight + delta);
  };

  // Full Symmetrical Barbell Physics: Subtle Elastic Steel Flex at Heavy Loads (>= 140kg)
  const isHeavyFlex = calculation.actualTotal >= 140;
  const flexRatio = isHeavyFlex
    ? Math.min(1, 0.36 + ((calculation.actualTotal - 140) / 160) * 0.64)
    : 0;
  const baseCy = 98;
  const flangeDropY = Number((flexRatio * 6.2).toFixed(2));
  const centerArchY = Number((flexRatio * 5.2).toFixed(2));
  const sleeveTiltDeg = Number((flexRatio * 4.4).toFixed(2));

  // Compute exact x offsets for right & mirrored left plates along sleeves
  const plateGap = 1.6;
  const rightFlangeOuterX = 638;
  const leftFlangeOuterX = 282;

  const placedRightPlates = useMemo(() => {
    let cursorX = rightFlangeOuterX + 2;
    return calculation.perSidePlates.map((plate, idx) => {
      const x = cursorX;
      cursorX += plate.widthPx + plateGap;
      return { plate, x, idx };
    });
  }, [calculation.perSidePlates]);

  const rightCollarX =
    placedRightPlates.length > 0
      ? placedRightPlates[placedRightPlates.length - 1].x +
        placedRightPlates[placedRightPlates.length - 1].plate.widthPx +
        2
      : rightFlangeOuterX + 4;

  const placedLeftPlates = useMemo(() => {
    let cursorX = leftFlangeOuterX - 2;
    return calculation.perSidePlates.map((plate, idx) => {
      const x = cursorX - plate.widthPx;
      cursorX = x - plateGap;
      return { plate, x, idx };
    });
  }, [calculation.perSidePlates]);

  const leftCollarRightEdgeX =
    placedLeftPlates.length > 0
      ? placedLeftPlates[placedLeftPlates.length - 1].x - 2
      : leftFlangeOuterX - 4;

  const shaftCurvePath = `M 294 ${baseCy + flangeDropY} Q 460 ${baseCy - centerArchY * 2} 626 ${baseCy + flangeDropY}`;

  return (
    <section
      className={`glass-card rounded-2xl overflow-hidden ${isHeavyFlex && expanded ? 'glass-card-volt' : ''}`}
    >
      {/* Sleek Single-Row Collapsible Utility Drawer Trigger Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`w-full text-left px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4500]/70 ${
          expanded ? 'border-b border-white/[0.06]' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#1A1D24] text-[#FF4500] ring-1 ring-white/[0.08] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg sm:text-xl tracking-wide text-[#F8FAFC] leading-none">
              OLYMPIC BARBELL VISUALIZER
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1A1D24] font-tech font-bold text-[10px] text-[#94A3B8] tabular-nums whitespace-nowrap">
              {formatNumber(calculation.actualTotal)} kg · Bar {barWeight}kg
            </span>
          </div>
        </div>

        <span className="h-8 px-2.5 rounded-xl bg-[#1A1D24] text-[11px] font-semibold text-[#F8FAFC] inline-flex items-center gap-1 whitespace-nowrap shrink-0">
          <span>{expanded ? 'ซ่อน' : 'เปิดดู'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#FF4500]" />}
        </span>
      </button>

      {expanded && (
        <div className="p-3.5 sm:p-5 space-y-3.5 drawer-reveal relative z-10 w-full max-w-full overflow-hidden">
          {/* HERO CENTERPIECE AT TOP: Dramatic Olympic Steel Barbell Spotlight Stage (h-32 / h-36) */}
          <div className="rounded-2xl bg-[#0B0D13] border border-white/[0.07] px-3 pt-2.5 pb-3 sm:px-5 sm:pt-3 sm:pb-4 relative w-full max-w-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {/* Dramatic Overhead Gym Spotlight */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                background: isHeavyFlex
                  ? 'radial-gradient(ellipse 72% 68% at 50% 0%, rgba(255,69,0,0.22) 0%, rgba(250,204,21,0.06) 44%, transparent 78%)'
                  : 'radial-gradient(ellipse 68% 65% at 50% 0%, rgba(255,69,0,0.1) 0%, rgba(248,250,252,0.04) 42%, transparent 74%)',
              }}
            />

            {/* Stage Top Micro-Readout Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-1.5 px-0.5 text-[11px] tabular-nums">
              <span className="text-[#94A3B8] font-medium">
                ซ้าย <strong className="text-[#F8FAFC] font-tech">{formatNumber(calculation.loadedPerSide)}kg</strong>
                <span className="mx-1.5 text-[#475569]">·</span>
                แกน <strong className="text-[#F8FAFC] font-tech">{barWeight}kg</strong>
                <span className="mx-1.5 text-[#475569]">·</span>
                ขวา <strong className="text-[#F8FAFC] font-tech">{formatNumber(calculation.loadedPerSide)}kg</strong>
              </span>

              {isHeavyFlex ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4500]/16 text-[#FF4500] ring-1 ring-[#FF4500]/35 font-tech font-bold text-[10px] tracking-wider uppercase">
                  <Activity className="w-3 h-3" />
                  <span>BAR FLEX · {formatNumber(calculation.actualTotal)} KG</span>
                </span>
              ) : (
                <span className="text-[#64748B] text-[10.5px]">
                  ≥ 140 kg แสดงแรงแอ่นแกนเหล็ก
                </span>
              )}
            </div>

            {/* Dramatic Full Horizontal Symmetrical Olympic Barbell SVG (h-32 sm:h-36) */}
            <div className="relative z-10 w-full h-32 sm:h-36 flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 920 196"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full block select-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.75)]"
                role="img"
                aria-label={`ภาพบาร์เบลโอลิมปิกเต็มแท่ง น้ำหนักรวม ${calculation.actualTotal} กิโลกรัม`}
              >
                <defs>
                  {/* Metallic Chrome Shaft Gradient */}
                  <linearGradient id={`chrome-v-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#71717a" />
                    <stop offset="22%" stopColor="#f8fafc" />
                    <stop offset="48%" stopColor="#a1a1aa" />
                    <stop offset="78%" stopColor="#52525b" />
                    <stop offset="100%" stopColor="#18181b" />
                  </linearGradient>

                  {/* Grooved Chrome Loading Sleeve Gradient */}
                  <linearGradient id={`sleeve-v-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="24%" stopColor="#f4f4f5" />
                    <stop offset="52%" stopColor="#9ca3af" />
                    <stop offset="82%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </linearGradient>

                  {/* Bronze Olympic Bushing Ring Gradient */}
                  <linearGradient id={`bronze-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="45%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  {/* Machined Metal Collar Clamp Gradient */}
                  <linearGradient id={`collar-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f4f4f5" />
                    <stop offset="30%" stopColor="#a1a1aa" />
                    <stop offset="68%" stopColor="#52525b" />
                    <stop offset="100%" stopColor="#18181b" />
                  </linearGradient>

                  {/* Diamond Knurling Grip Cross-Hatch Pattern */}
                  <pattern
                    id={`knurl-${uid}`}
                    width="5"
                    height="5"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 0 0 L 5 5 M 5 0 L 0 5"
                      stroke="rgba(17, 17, 19, 0.56)"
                      strokeWidth="0.9"
                    />
                    <path
                      d="M 0 2.5 L 2.5 0 M 2.5 5 L 5 2.5"
                      stroke="rgba(255, 255, 255, 0.14)"
                      strokeWidth="0.55"
                    />
                  </pattern>

                  {/* Vertical Micro-Grooves Pattern for Loading Sleeves */}
                  <pattern
                    id={`grooves-${uid}`}
                    width="4"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="24"
                      stroke="rgba(15, 23, 42, 0.32)"
                      strokeWidth="1"
                    />
                  </pattern>

                  {/* Soft Ground Drop Shadow Under Heavy Barbell */}
                  <radialGradient id={`floor-shadow-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.72" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>

                  {/* Dynamic Plate Vertical Metallic/Rubber Bumper Gradients */}
                  {AVAILABLE_PLATES.map((p) => (
                    <linearGradient
                      key={p.weight}
                      id={`plate-grad-${p.weight}-${uid}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={p.gradStops[0]} />
                      <stop offset="18%" stopColor={p.gradStops[1]} />
                      <stop offset="66%" stopColor={p.gradStops[2]} />
                      <stop offset="100%" stopColor={p.gradStops[3]} />
                    </linearGradient>
                  ))}

                  {/* Luminous Calibrated Plate Spotlight Aura */}
                  <radialGradient id={`plate-aura-${uid}`} cx="50%" cy="50%" r="50%">
                    <stop
                      offset="0%"
                      stopColor={isHeavyFlex ? '#ff4500' : '#facc15'}
                      stopOpacity={isHeavyFlex ? '0.26' : '0.16'}
                    />
                    <stop
                      offset="55%"
                      stopColor={isHeavyFlex ? '#f59e0b' : '#ff4500'}
                      stopOpacity={isHeavyFlex ? '0.1' : '0.05'}
                    />
                    <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Calibrated Plate Ambient Spotlight Glow */}
                {calculation.perSidePlates.length > 0 && (
                  <g className="transition-opacity duration-300">
                    <ellipse
                      cx="215"
                      cy="98"
                      rx={isHeavyFlex ? 128 : 96}
                      ry={isHeavyFlex ? 78 : 66}
                      fill={`url(#plate-aura-${uid})`}
                    />
                    <ellipse
                      cx="705"
                      cy="98"
                      rx={isHeavyFlex ? 128 : 96}
                      ry={isHeavyFlex ? 78 : 66}
                      fill={`url(#plate-aura-${uid})`}
                    />
                  </g>
                )}

                {/* Gym Floor Reflection & Weight Ground Shadow */}
                <line
                  x1="34"
                  y1="178"
                  x2="886"
                  y2="178"
                  stroke="rgba(148, 163, 184, 0.16)"
                  strokeWidth="1"
                />
                <ellipse
                  cx="195"
                  cy="178"
                  rx={calculation.perSidePlates.length > 0 ? 110 : 50}
                  ry="7"
                  fill={`url(#floor-shadow-${uid})`}
                />
                <ellipse
                  cx="725"
                  cy="178"
                  rx={calculation.perSidePlates.length > 0 ? 110 : 50}
                  ry="7"
                  fill={`url(#floor-shadow-${uid})`}
                />

                {/* ================= CENTER KNURLED STEEL SHAFT (WITH ELASTIC HEAVY FLEX) ================= */}
                <g>
                  {/* Base Shadow Stroke for Depth */}
                  <path
                    d={shaftCurvePath}
                    fill="none"
                    stroke="#09090b"
                    strokeWidth="15"
                    strokeLinecap="butt"
                    transform="translate(0, 2)"
                    opacity="0.65"
                  />

                  {/* Main Steel Shaft Core */}
                  <path
                    d={shaftCurvePath}
                    fill="none"
                    stroke={`url(#chrome-v-${uid})`}
                    strokeWidth="12.5"
                    strokeLinecap="butt"
                  />

                  {/* Upper Specular Chrome Sheen */}
                  <path
                    d={shaftCurvePath}
                    fill="none"
                    stroke="rgba(255,255,255,0.52)"
                    strokeWidth="2.4"
                    transform="translate(0, -3.2)"
                  />

                  {/* Diamond Knurling Zones (Left Hand Grip, Center Knurl, Right Hand Grip) */}
                  <g
                    style={{
                      transform: `translateY(${(-centerArchY * 0.65).toFixed(2)}px)`,
                      transition: 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {/* Left Grip Knurling */}
                    <rect
                      x="312"
                      y={baseCy - 5.8}
                      width="96"
                      height="11.6"
                      rx="1"
                      fill={`url(#knurl-${uid})`}
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth="0.6"
                    />
                    {/* IPF / IWF Dual Grip Rings (Left) */}
                    <rect x="342" y={baseCy - 6} width="3.5" height="12" fill="#e4e4e7" opacity="0.88" />
                    <rect x="372" y={baseCy - 6} width="3.5" height="12" fill="#e4e4e7" opacity="0.88" />

                    {/* Center Knurling Patch */}
                    <rect
                      x="426"
                      y={baseCy - 5.8}
                      width="68"
                      height="11.6"
                      rx="1"
                      fill={`url(#knurl-${uid})`}
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth="0.6"
                    />
                    {/* Center Micro Alignment Tick */}
                    <rect
                      x="459"
                      y={baseCy - 6}
                      width="2"
                      height="12"
                      fill={isHeavyFlex ? '#FACC15' : '#FF4500'}
                      opacity="0.92"
                    />

                    {/* Right Grip Knurling */}
                    <rect
                      x="512"
                      y={baseCy - 5.8}
                      width="96"
                      height="11.6"
                      rx="1"
                      fill={`url(#knurl-${uid})`}
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth="0.6"
                    />
                    {/* IPF / IWF Dual Grip Rings (Right) */}
                    <rect x="544.5" y={baseCy - 6} width="3.5" height="12" fill="#e4e4e7" opacity="0.88" />
                    <rect x="574.5" y={baseCy - 6} width="3.5" height="12" fill="#e4e4e7" opacity="0.88" />
                  </g>

                  {/* Center Bar Weight Label under Shaft */}
                  <text
                    x="460"
                    y="134"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="'Noto Sans Thai', sans-serif"
                  >
                    {barWeight === 15
                      ? 'แกนเหล็กโอลิมปิกหญิง 15 kg'
                      : barWeight === 10
                        ? 'แกน EZ-Bar 10 kg'
                        : `แกนเหล็กโอลิมปิก ${barWeight} kg`}{' '}
                    {isHeavyFlex ? '· แอ่นรับแรงโหลดหนัก' : ''}
                  </text>
                </g>

                {/* ================= LEFT ASSEMBLY: FLANGE -> MIRRORED PLATES -> COLLAR -> SLEEVE ================= */}
                <g
                  style={{
                    transformOrigin: `${leftFlangeOuterX + 12}px ${baseCy + flangeDropY}px`,
                    transform: `translateY(${flangeDropY}px) rotate(${-sleeveTiltDeg}deg)`,
                    transition: 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Left Bronze Bushing & Machined Shoulder Flange */}
                  <rect
                    x="291"
                    y={baseCy - 12}
                    width="5"
                    height="24"
                    rx="1"
                    fill={`url(#bronze-${uid})`}
                  />
                  <rect
                    x="280"
                    y={baseCy - 21}
                    width="12"
                    height="42"
                    rx="2.5"
                    fill={`url(#chrome-v-${uid})`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.9"
                  />

                  {/* Left Grooved Chrome Loading Sleeve */}
                  <rect
                    x="36"
                    y={baseCy - 11}
                    width="244"
                    height="22"
                    rx="4"
                    fill={`url(#sleeve-v-${uid})`}
                    stroke="rgba(255,255,255,0.34)"
                    strokeWidth="0.9"
                  />
                  <rect
                    x="40"
                    y={baseCy - 10}
                    width="238"
                    height="20"
                    fill={`url(#grooves-${uid})`}
                    opacity="0.72"
                  />
                  {/* Left End-Cap Rim */}
                  <rect
                    x="34"
                    y={baseCy - 10.5}
                    width="5"
                    height="21"
                    rx="2"
                    fill="#e4e4e7"
                    opacity="0.75"
                  />

                  {/* Mirrored Left IWF Bumper & Fractional Plates */}
                  {placedLeftPlates.map(({ plate, x, idx }) => {
                    const topY = baseCy - plate.heightPx / 2;
                    return (
                      <g
                        key={`L-${plate.weight}-${idx}-${calculation.actualTotal}`}
                        className="anim-plate-left"
                        style={{ animationDelay: `${idx * 28}ms` }}
                      >
                        <rect
                          x={x}
                          y={topY}
                          width={plate.widthPx}
                          height={plate.heightPx}
                          rx="4.2"
                          fill={`url(#plate-grad-${plate.weight}-${uid})`}
                          stroke={plate.rimStroke}
                          strokeWidth="1"
                        />
                        {/* Bevel Lip Highlights */}
                        <line
                          x1={x + 1.5}
                          y1={topY + 6.5}
                          x2={x + plate.widthPx - 1.5}
                          y2={topY + 6.5}
                          stroke={plate.hubColor}
                          strokeWidth="1"
                        />
                        <line
                          x1={x + 1.5}
                          y1={topY + plate.heightPx - 6.5}
                          x2={x + plate.widthPx - 1.5}
                          y2={topY + plate.heightPx - 6.5}
                          stroke={plate.hubColor}
                          strokeWidth="1"
                        />
                        {/* Center Steel Hub Collar Band */}
                        <rect
                          x={x + 1.5}
                          y={baseCy - 14}
                          width={plate.widthPx - 3}
                          height="28"
                          rx="1.5"
                          fill="rgba(0,0,0,0.12)"
                          stroke={plate.hubColor}
                          strokeWidth="0.8"
                        />
                        {/* Molded Weight Label */}
                        <text
                          x={x + plate.widthPx / 2}
                          y={baseCy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={plate.textFill}
                          fontSize={plate.weight <= 2.5 ? '9.5' : '12.5'}
                          fontWeight="700"
                          fontFamily="'Bebas Neue', sans-serif"
                          letterSpacing="0.5"
                          transform={`rotate(-90 ${x + plate.widthPx / 2} ${baseCy})`}
                        >
                          {plate.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Left Machined Metal Collar Clamp (Mirrored) */}
                  {placedLeftPlates.length > 0 && (
                    <g
                      key={`L-collar-${calculation.actualTotal}`}
                      className="anim-plate-left"
                      style={{ animationDelay: `${placedLeftPlates.length * 28 + 20}ms` }}
                    >
                      <rect
                        x={leftCollarRightEdgeX - 13}
                        y={baseCy - 20}
                        width="13"
                        height="40"
                        rx="3.5"
                        fill={`url(#collar-${uid})`}
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth="1"
                      />
                      {/* Lock Lever Extending Left */}
                      <rect
                        x={leftCollarRightEdgeX - 22}
                        y={baseCy - 4.5}
                        width="10"
                        height="9"
                        rx="2.5"
                        fill={`url(#collar-${uid})`}
                        stroke="rgba(255,255,255,0.32)"
                        strokeWidth="0.8"
                      />
                      {/* Championship Gold Lock Indicator */}
                      <circle
                        cx={leftCollarRightEdgeX - 6.5}
                        cy={baseCy}
                        r="3"
                        fill="#FACC15"
                        stroke="#111113"
                        strokeWidth="0.9"
                      />
                    </g>
                  )}
                </g>

                {/* ================= RIGHT ASSEMBLY: FLANGE -> PLATES -> COLLAR -> SLEEVE ================= */}
                <g
                  style={{
                    transformOrigin: `${rightFlangeOuterX - 12}px ${baseCy + flangeDropY}px`,
                    transform: `translateY(${flangeDropY}px) rotate(${sleeveTiltDeg}deg)`,
                    transition: 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {/* Right Bronze Bushing & Machined Shoulder Flange */}
                  <rect
                    x="624"
                    y={baseCy - 12}
                    width="5"
                    height="24"
                    rx="1"
                    fill={`url(#bronze-${uid})`}
                  />
                  <rect
                    x="628"
                    y={baseCy - 21}
                    width="12"
                    height="42"
                    rx="2.5"
                    fill={`url(#chrome-v-${uid})`}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="0.9"
                  />

                  {/* Right Grooved Chrome Loading Sleeve */}
                  <rect
                    x="640"
                    y={baseCy - 11}
                    width="244"
                    height="22"
                    rx="4"
                    fill={`url(#sleeve-v-${uid})`}
                    stroke="rgba(255,255,255,0.34)"
                    strokeWidth="0.9"
                  />
                  <rect
                    x="642"
                    y={baseCy - 10}
                    width="238"
                    height="20"
                    fill={`url(#grooves-${uid})`}
                    opacity="0.72"
                  />
                  {/* Right End-Cap Rim */}
                  <rect
                    x="881"
                    y={baseCy - 10.5}
                    width="5"
                    height="21"
                    rx="2"
                    fill="#e4e4e7"
                    opacity="0.75"
                  />

                  {/* Right IWF Bumper & Fractional Plates */}
                  {placedRightPlates.map(({ plate, x, idx }) => {
                    const topY = baseCy - plate.heightPx / 2;
                    return (
                      <g
                        key={`R-${plate.weight}-${idx}-${calculation.actualTotal}`}
                        className="anim-plate-right"
                        style={{ animationDelay: `${idx * 28}ms` }}
                      >
                        <rect
                          x={x}
                          y={topY}
                          width={plate.widthPx}
                          height={plate.heightPx}
                          rx="4.2"
                          fill={`url(#plate-grad-${plate.weight}-${uid})`}
                          stroke={plate.rimStroke}
                          strokeWidth="1"
                        />
                        {/* Bevel Lip Highlights */}
                        <line
                          x1={x + 1.5}
                          y1={topY + 6.5}
                          x2={x + plate.widthPx - 1.5}
                          y2={topY + 6.5}
                          stroke={plate.hubColor}
                          strokeWidth="1"
                        />
                        <line
                          x1={x + 1.5}
                          y1={topY + plate.heightPx - 6.5}
                          x2={x + plate.widthPx - 1.5}
                          y2={topY + plate.heightPx - 6.5}
                          stroke={plate.hubColor}
                          strokeWidth="1"
                        />
                        {/* Center Steel Hub Collar Band */}
                        <rect
                          x={x + 1.5}
                          y={baseCy - 14}
                          width={plate.widthPx - 3}
                          height="28"
                          rx="1.5"
                          fill="rgba(0,0,0,0.12)"
                          stroke={plate.hubColor}
                          strokeWidth="0.8"
                        />
                        {/* Molded Weight Label */}
                        <text
                          x={x + plate.widthPx / 2}
                          y={baseCy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={plate.textFill}
                          fontSize={plate.weight <= 2.5 ? '9.5' : '12.5'}
                          fontWeight="700"
                          fontFamily="'Bebas Neue', sans-serif"
                          letterSpacing="0.5"
                          transform={`rotate(-90 ${x + plate.widthPx / 2} ${baseCy})`}
                        >
                          {plate.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Right Machined Metal Collar Clamp */}
                  {placedRightPlates.length > 0 && (
                    <g
                      key={`R-collar-${calculation.actualTotal}`}
                      className="anim-plate-right"
                      style={{ animationDelay: `${placedRightPlates.length * 28 + 20}ms` }}
                    >
                      <rect
                        x={rightCollarX}
                        y={baseCy - 20}
                        width="13"
                        height="40"
                        rx="3.5"
                        fill={`url(#collar-${uid})`}
                        stroke="rgba(255,255,255,0.45)"
                        strokeWidth="1"
                      />
                      {/* Lock Lever Extending Right */}
                      <rect
                        x={rightCollarX + 12}
                        y={baseCy - 4.5}
                        width="10"
                        height="9"
                        rx="2.5"
                        fill={`url(#collar-${uid})`}
                        stroke="rgba(255,255,255,0.32)"
                        strokeWidth="0.8"
                      />
                      {/* Championship Gold Lock Indicator */}
                      <circle
                        cx={rightCollarX + 6.5}
                        cy={baseCy}
                        r="3"
                        fill="#FACC15"
                        stroke="#111113"
                        strokeWidth="0.9"
                      />
                    </g>
                  )}
                </g>

                {/* Empty Bar Overlay Tag */}
                {calculation.perSidePlates.length === 0 && (
                  <g>
                    <rect
                      x="388"
                      y="52"
                      width="144"
                      height="26"
                      rx="8"
                      fill="#0D0D0F"
                      fillOpacity="0.94"
                      stroke="rgba(228,228,231,0.22)"
                    />
                    <text
                      x="460"
                      y="65"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#E4E4E7"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="'Noto Sans Thai', sans-serif"
                    >
                      บาร์เปล่า ({barWeight} kg)
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* SLEEK COMPACT CONTROLS UNDERNEATH THE BARBELL CENTERPIECE */}
          <div className="space-y-2.5">
            {/* Single-Row Precision Controller: Compact h-10 -/+ Steppers + Clean Weight Readout + Neutral Bar Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Compact h-10 Steppers Flanking Clean Weight Readout */}
              <div className="flex items-center gap-1.5 sm:w-auto">
                <button
                  type="button"
                  onClick={() => adjustWeight(-2.5)}
                  aria-label="ลดน้ำหนัก 2.5 กิโลกรัม"
                  className="btn-tactile active:scale-[0.96] transition-all h-10 w-10 rounded-xl bg-[#1A1D24] hover:bg-[#232834] ring-1 ring-white/[0.08] flex items-center justify-center text-[#F8FAFC] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 sm:flex-none h-10 surface-inner rounded-xl px-3 flex items-center justify-center gap-1">
                  <label htmlFor="plate-calc-weight" className="sr-only">
                    น้ำหนักเป้าหมาย (กิโลกรัม)
                  </label>
                  <input
                    id="plate-calc-weight"
                    type="number"
                    inputMode="decimal"
                    step="2.5"
                    min={barWeight}
                    max={400}
                    value={targetWeight}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value);
                      setTargetWeight(
                        Number.isFinite(n) ? Math.max(0, Math.min(400, n)) : barWeight
                      );
                    }}
                    className="w-16 bg-transparent text-center font-display text-2xl tracking-wide text-[#F8FAFC] tabular-nums focus:outline-none leading-none"
                  />
                  <span className="font-tech font-bold text-[11px] text-[#94A3B8] tracking-widest uppercase">
                    KG
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => adjustWeight(2.5)}
                  aria-label="เพิ่มน้ำหนัก 2.5 กิโลกรัม"
                  className="btn-tactile active:scale-[0.96] transition-all h-10 w-10 rounded-xl bg-[#1A1D24] hover:bg-[#232834] ring-1 ring-white/[0.08] flex items-center justify-center text-[#FF4500] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Clean Gender-Neutral Bar Selector */}
              <div className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-[#090A0D] ring-1 ring-white/[0.06]">
                {BAR_OPTIONS.map((b) => (
                  <button
                    key={b.weight}
                    type="button"
                    onClick={() => {
                      setBarWeight(b.weight);
                      if (targetWeight < b.weight) setTargetWeight(b.weight);
                      playPlateClink(soundEnabled);
                    }}
                    className={`btn-tactile active:scale-[0.98] transition-all h-8 px-2 sm:px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                      barWeight === b.weight
                        ? 'bg-[#FF4500] text-white'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact 60kg–220kg Quick-Preset Pills */}
            <div className="grid grid-cols-6 gap-1.5">
              {quickTargets.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateTarget(w)}
                  className={`btn-tactile active:scale-[0.96] transition-all h-8 px-1 rounded-full text-[11px] font-bold font-tech tabular-nums whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                    targetWeight === w
                      ? 'bg-[#FF4500] text-white shadow-[0_6px_14px_-5px_rgba(255,69,0,0.75)]'
                      : 'bg-[#1A1D24] text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#232834] ring-1 ring-white/[0.05]'
                  }`}
                >
                  {formatNumber(w)}kg
                </button>
              ))}
            </div>
          </div>

          {/* Compact Breakdown Readout with IWF Color Swatches */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-1.5 text-[#94A3B8] tabular-nums">
              <span className="text-[11px] font-medium">ใส่แผ่นเหล็กข้างละ:</span>
              {calculation.grouped.length === 0 ? (
                <span className="text-[#64748B] text-[11px]">0 kg (บาร์เปล่า)</span>
              ) : (
                calculation.grouped.map((g) => (
                  <span
                    key={g.plate.weight}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1A1D24] text-[11px] font-semibold text-[#F8FAFC]"
                  >
                    <span
                      className={`w-2 h-2 rounded-full border border-white/25 shrink-0 ${g.plate.swatchClass}`}
                    />
                    <span className="font-tech">
                      {g.plate.label}kg × {g.count}
                    </span>
                  </span>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 tabular-nums text-[11px] text-[#94A3B8] shrink-0">
              <span>
                รวมบนบาร์:{' '}
                <strong className="text-[#F8FAFC] font-tech font-bold text-xs">
                  <AnimatedNumber value={calculation.actualTotal} durationMs={260} /> kg
                </strong>
              </span>
              {calculation.remainderTotal > 0 && (
                <span className="text-[#38BDF8]">
                  (ขาด {formatNumber(calculation.remainderTotal)} kg)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
