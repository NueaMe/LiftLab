import { ActiveWorkout, CompletedWorkout, DailyEnergyMode } from '../types';

export type AthleteRankId = 'rookie' | 'iron_lifter' | 'athlete' | 'elite_titan';

export interface AthleteRankTier {
  id: AthleteRankId;
  titleEn: string;
  titleTh: string;
  minXp: number;
  nextXp: number | null;
  accentHex: string;
  badgeBgClass: string;
  badgeTextClass: string;
  barFillClass: string;
}

export const ATHLETE_RANK_TIERS: AthleteRankTier[] = [
  {
    id: 'rookie',
    titleEn: 'ROOKIE',
    titleTh: 'มือใหม่เริ่มต้น',
    minXp: 0,
    nextXp: 500,
    accentHex: '#94A3B8',
    badgeBgClass: 'bg-[#1F2430] ring-1 ring-white/15',
    badgeTextClass: 'text-[#F8FAFC]',
    barFillClass: 'bg-gradient-to-r from-[#64748B] to-[#CBD5E1]',
  },
  {
    id: 'iron_lifter',
    titleEn: 'IRON LIFTER',
    titleTh: 'นักยกเหล็กตัวจริง',
    minXp: 500,
    nextXp: 2000,
    accentHex: '#FF4500',
    badgeBgClass: 'bg-[#FF4500] shadow-[0_6px_18px_-4px_rgba(255,69,0,0.65)]',
    badgeTextClass: 'text-white',
    barFillClass: 'bg-gradient-to-r from-[#FF4500] to-[#FF7849]',
  },
  {
    id: 'athlete',
    titleEn: 'ATHLETE',
    titleTh: 'นักกีฬาแกร่ง',
    minXp: 2000,
    nextXp: 5000,
    accentHex: '#38BDF8',
    badgeBgClass: 'bg-[#38BDF8] shadow-[0_6px_18px_-4px_rgba(56,189,248,0.55)]',
    badgeTextClass: 'text-[#090A0D]',
    barFillClass: 'bg-gradient-to-r from-[#FF4500] via-[#FACC15] to-[#38BDF8]',
  },
  {
    id: 'elite_titan',
    titleEn: 'ELITE TITAN',
    titleTh: 'จอมพลังระดับตำนาน',
    minXp: 5000,
    nextXp: null,
    accentHex: '#FACC15',
    badgeBgClass: 'bg-[#FACC15] shadow-[0_6px_20px_-4px_rgba(250,204,21,0.7)]',
    badgeTextClass: 'text-[#090A0D]',
    barFillClass: 'bg-gradient-to-r from-[#FF4500] via-[#FACC15] to-[#FEF08A]',
  },
];

export interface AthleteXpStatus {
  totalXp: number;
  currentTier: AthleteRankTier;
  nextTier: AthleteRankTier | null;
  progressPct: number;
  xpInTier: number;
  xpNeededForNext: number;
  totalSets: number;
  totalVolume: number;
  totalPRs: number;
}

/**
 * Computes deterministic Strength Rank & EXP from completed history, active session checkoffs,
 * and Daily Finisher bonus XP. Starts cleanly at ROOKIE · 0 XP on fresh 0-state.
 */
export function calculateAthleteXp(
  history: CompletedWorkout[],
  activeWorkout: ActiveWorkout | null = null,
  bonusXp = 0
): AthleteXpStatus {
  let totalSets = 0;
  let totalVolume = 0;
  let totalPRs = 0;

  for (const session of history) {
    totalSets += session.totalWorkingSets;
    totalVolume += session.totalVolume;
    totalPRs += session.prCount;
  }

  if (activeWorkout) {
    for (const ex of activeWorkout.exercises) {
      for (const s of ex.sets) {
        if (!s.completed) continue;
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (r <= 0) continue;
        totalVolume += w * r;
        if (s.type !== 'W') totalSets += 1;
        if (s.isPR) totalPRs += 1;
      }
    }
  }

  const safeBonus = Math.max(0, Math.round(bonusXp || 0));
  const setsXp = totalSets * 15;
  const volumeXp = Math.floor(totalVolume / 100);
  const prXp = totalPRs * 50;
  const totalXp = setsXp + volumeXp + prXp + safeBonus;

  let tierIdx = 0;
  for (let i = ATHLETE_RANK_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= ATHLETE_RANK_TIERS[i].minXp) {
      tierIdx = i;
      break;
    }
  }

  const currentTier = ATHLETE_RANK_TIERS[tierIdx];
  const nextTier = ATHLETE_RANK_TIERS[tierIdx + 1] ?? null;

  if (!nextTier || currentTier.nextXp === null) {
    return {
      totalXp,
      currentTier,
      nextTier: null,
      progressPct: 100,
      xpInTier: totalXp - currentTier.minXp,
      xpNeededForNext: 0,
      totalSets,
      totalVolume: Math.round(totalVolume),
      totalPRs,
    };
  }

  const span = Math.max(1, currentTier.nextXp - currentTier.minXp);
  const xpInTier = Math.max(0, totalXp - currentTier.minXp);
  const progressPct = Math.min(100, Math.round((xpInTier / span) * 100));

  return {
    totalXp,
    currentTier,
    nextTier,
    progressPct,
    xpInTier,
    xpNeededForNext: Math.max(0, currentTier.nextXp - totalXp),
    totalSets,
    totalVolume: Math.round(totalVolume),
    totalPRs,
  };
}

export interface EnergyModeSpec {
  id: DailyEnergyMode;
  iconKey: DailyEnergyMode;
  labelTh: string;
  labelEn: string;
  volumeCue: string;
  coachingTipTh: string;
  heroGlowClass: string;
  accentTextClass: string;
  activeBtnClass: string;
}

export const DAILY_ENERGY_MODES: Record<DailyEnergyMode, EnergyModeSpec> = {
  beast: {
    id: 'beast',
    iconKey: 'beast',
    labelTh: 'พลังเต็มร้อย',
    labelEn: 'Beast Mode',
    volumeCue: '+10% Load · 4–5 เซ็ตท่าหลัก · ลุ้น NEW PR!',
    coachingTipTh:
      'วันปล่อยของเต็มพิกัด — ลองเพิ่มน้ำหนัก +2.5 kg หรืออัดเพิ่ม +1–2 Reps ในท่า Compound หลัก แล้วพักให้ครบ 120–150 วิ',
    heroGlowClass: 'hero-ambient-beast',
    accentTextClass: 'text-[#FF4500]',
    activeBtnClass:
      'bg-[#1D222D] text-[#F8FAFC] ring-1 ring-[#FF4500]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_16px_-4px_rgba(255,69,0,0.55)]',
  },
  standard: {
    id: 'standard',
    iconKey: 'standard',
    labelTh: 'ปกติ',
    labelEn: 'Standard',
    volumeCue: '100% Target · 3–4 เซ็ต/ท่า · โฟกัสฟอร์มนิ่ง',
    coachingTipTh:
      'จังหวะสร้างกล้ามเนื้อมาตรฐาน — คุมจังหวะลงช้า 2–3 วินาที ให้ครบช่วง Reps เป้าหมาย เพื่อสะสม Progressive Overload สม่ำเสมอ',
    heroGlowClass: '',
    accentTextClass: 'text-[#F8FAFC]',
    activeBtnClass:
      'bg-[#1D222D] text-[#F8FAFC] ring-1 ring-[#FF4500]/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_14px_-4px_rgba(255,69,0,0.4)]',
  },
  recovery: {
    id: 'recovery',
    iconKey: 'recovery',
    labelTh: 'เน้นฟื้นตัว',
    labelEn: 'Recovery',
    volumeCue: '-25% Volume · 2–3 เซ็ต · RPE 6–7 ไม่ฝืนหมดแรง',
    coachingTipTh:
      'วันพลังงานต่ำหรือช่วงอ่อนล้า (รวมถึงช่วงมีรอบเดือน) — ลดน้ำหนักลง 15–20% เน้นคุมจังหวะช้า ยืดเหยียดสะโพก–หลังล่าง และพักระหว่างเซ็ตให้เพียงพอโดยไม่ฝืนหมดแรง',
    heroGlowClass: 'hero-ambient-recovery',
    accentTextClass: 'text-[#38BDF8]',
    activeBtnClass:
      'bg-[#1D222D] text-[#F8FAFC] ring-1 ring-[#FF4500]/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_14px_-4px_rgba(255,69,0,0.4)]',
  },
};

export interface DailyFinisherChallenge {
  id: string;
  titleTh: string;
  targetBadge: string;
  categoryTh: string;
  cueTh: string;
  xpReward: number;
  mode: 'timer' | 'reps';
  targetValue: number;
  exerciseId: string;
  formCues: [string, string, string];
}

export const DAILY_FINISHERS: DailyFinisherChallenge[] = [
  {
    id: 'plank-60',
    titleTh: 'Plank ค้างลำตัวตรง',
    targetBadge: '60 วินาที',
    categoryTh: 'Core Stability',
    cueTh: 'เกร็งหน้าท้องและบีบก้นให้ลำตัวเป็นเส้นตรง อย่าปล่อยสะโพกแอ่น',
    xpReward: 50,
    mode: 'timer',
    targetValue: 60,
    exerciseId: 'forearm-plank',
    formCues: [
      'วางข้อศอกตรงใต้หัวไหล่ ม้วนสะโพกเข้าด้านในเล็กน้อย',
      'เกร็งหน้าท้องและบีบก้นให้ศีรษะ–หลัง–ส้นเท้าเป็นเส้นตรง',
      'หายใจสม่ำเสมอตลอดเวลา ไม่กลั้นหายใจและไม่ปล่อยหลังล่างแอ่น',
    ],
  },
  {
    id: 'pushup-20',
    titleTh: 'Push-Up วิดพื้นปิดเซสชัน',
    targetBadge: '20 ครั้ง',
    categoryTh: 'Upper Push',
    cueTh: 'กางศอกทำมุม 45° ลดหน้าอกลงเกือบแตะพื้นแล้วดันขึ้นสุดแขน',
    xpReward: 50,
    mode: 'reps',
    targetValue: 20,
    exerciseId: 'push-up',
    formCues: [
      'วางมือกว้างกว่าหัวไหล่เล็กน้อย เกร็งแกนกลางลำตัวตรง',
      'ลดหน้าอกลงช้าๆ โดยกางข้อศอกทำมุมประมาณ 45° จากลำตัว',
      'ออกแรงดันพื้นจนแขนเหยียดสุดโดยไม่ปล่อยสะโพกตก',
    ],
  },
  {
    id: 'airsquat-25',
    titleTh: 'Air Squat เบิร์นขา',
    targetBadge: '25 ครั้ง',
    categoryTh: 'Lower Burnout',
    cueTh: 'ทิ้งสะโพกไปด้านหลัง ลงให้ต้นขาขนานพื้น จังหวะต่อเนื่องไม่หยุด',
    xpReward: 50,
    mode: 'reps',
    targetValue: 25,
    exerciseId: 'bodyweight-squat',
    formCues: [
      'ยืนเท้ากว้างประมาณหัวไหล่ เปิดปลายเท้าออกเล็กน้อย',
      'พับสะโพกไปด้านหลังพร้อมย่อเข่าตามแนวปลายเท้าจนต้นขาขนานพื้น',
      'ถีบส้นเท้าดันตัวขึ้นตรงพร้อมบีบก้นและเปิดอกตลอดจังหวะ',
    ],
  },
  {
    id: 'mountain-climber-40',
    titleTh: 'Mountain Climbers',
    targetBadge: '40 ครั้ง',
    categoryTh: 'Cardio Core',
    cueTh: 'ตั้งท่าแพลงก์แขนตึง ดึงเข่าสลับซ้าย-ขวาเร็วและคุมสะโพกให้นิ่ง',
    xpReward: 50,
    mode: 'reps',
    targetValue: 40,
    exerciseId: 'forearm-plank',
    formCues: [
      'ตั้งท่าแพลงก์แขนตึง หัวไหล่อยู่ตรงแนวข้อมือ',
      'ดึงเข่าสลับซ้าย–ขวาเข้าหาหน้าอกอย่างต่อเนื่อง',
      'กดสะโพกให้นิ่งขนานพื้น ไม่เด้งก้นสูงขึ้นลง',
    ],
  },
  {
    id: 'wall-sit-45',
    titleTh: 'Wall Sit พิงกำแพงค้าง',
    targetBadge: '45 วินาที',
    categoryTh: 'Quad Isometric',
    cueTh: 'แผ่นหลังแนบกำแพง งอเข่าทำมุม 90° ทิ้งน้ำหนักลงส้นเท้าเต็มๆ',
    xpReward: 50,
    mode: 'timer',
    targetValue: 45,
    exerciseId: 'bodyweight-squat',
    formCues: [
      'พิงหลังและท้ายทอยแนบผนังเต็มแผ่น เลื่อนตัวลงจนเข่างอ 90°',
      'ทิ้งน้ำหนักลงเต็มฝ่าเท้าและส้นเท้า อย่าใช้มือยันต้นขาช่วย',
      'หายใจเข้า–ออกลึกเป็นจังหวะ ค้างหน้าขาตึงนิ่งจนครบเวลา',
    ],
  },
  {
    id: 'bicycle-crunch-30',
    titleTh: 'Bicycle Crunch ปั่นจักรยานอากาศ',
    targetBadge: '30 ครั้ง',
    categoryTh: 'Obliques & Abs',
    cueTh: 'บิดลำตัวให้หัวไหล่แตะเข้าหาเข่าฝั่งตรงข้ามช้าๆ เน้นบีบหน้าท้อง',
    xpReward: 50,
    mode: 'reps',
    targetValue: 30,
    exerciseId: 'basic-abdominal-crunch',
    formCues: [
      'กดหลังล่างแนบพื้น แตะปลายนิ้วเบาๆ ข้างขมับโดยไม่ดึงคอ',
      'บิดหัวไหล่เข้าหาเข่าฝั่งตรงข้ามพร้อมเหยียดขาอีกข้างตรง',
      'คุมจังหวะช้าและชัด เน้นบีบกล้ามเนื้อข้างลำตัวทุกครั้ง',
    ],
  },
  {
    id: 'glute-bridge-60',
    titleTh: 'Glute Bridge Hold ค้างสะโพก',
    targetBadge: '60 วินาที',
    categoryTh: 'Glutes & Posterior',
    cueTh: 'ดันสะโพกขึ้นสุด บีบกล้ามเนื้อก้นค้างไว้โดยไม่แอ่นหลังล่าง',
    xpReward: 50,
    mode: 'timer',
    targetValue: 60,
    exerciseId: 'glute-bridge',
    formCues: [
      'นอนหงายชันเข่า วางส้นเท้าใกล้สะโพก กว้างประมาณช่วงสะโพก',
      'ออกแรงดันส้นเท้ายกสะโพกขึ้นจนหัวไหล่–สะโพก–เข่าเป็นเส้นตรง',
      'บีบกล้ามเนื้อก้นค้างแน่นๆ ตลอดเวลาโดยเก็บซี่โครงไม่แอ่นหลังล่าง',
    ],
  },
  {
    id: 'hollow-hold-40',
    titleTh: 'Hollow Body Hold',
    targetBadge: '40 วินาที',
    categoryTh: 'Deep Core',
    cueTh: 'กดหลังล่างแนบพื้นให้สนิท ยกสะบักและเหยียดขาลอยจากพื้นค้างไว้',
    xpReward: 50,
    mode: 'timer',
    targetValue: 40,
    exerciseId: 'basic-abdominal-crunch',
    formCues: [
      'นอนหงาย กดหลังส่วนล่างแนบสนิทกับพื้นไม่มีช่องว่าง',
      'เกร็งหน้าท้องยกสะบักและเหยียดขาลอยจากพื้นเป็นรูปกล้วยหอม',
      'หากหลังล่างเริ่มลอย ให้ยกขาสูงขึ้นเล็กน้อยเพื่อรักษาแรงเกร็งที่หน้าท้อง',
    ],
  },
  {
    id: 'jumping-jacks-45',
    titleTh: 'Jumping Jacks เร่งชีพจร',
    targetBadge: '45 วินาที',
    categoryTh: 'Metabolic Finisher',
    cueTh: 'กระโดดกางแขน-ขาเป็นจังหวะสม่ำเสมอ ลงน้ำหนักเบาด้วยปลายเท้า',
    xpReward: 50,
    mode: 'timer',
    targetValue: 45,
    exerciseId: 'bodyweight-squat',
    formCues: [
      'กระโดดกางขาออกพร้อมวาดแขนขึ้นเหนือศีรษะเป็นจังหวะต่อเนื่อง',
      'ลงพื้นเบาๆ ด้วยปลายเท้าพร้อมงอเข่าซับแรงกระแทกเล็กน้อย',
      'คุมจังหวะลมหายใจให้สม่ำเสมอเพื่อเบิร์นแคลอรีต่อเนื่องจนครบเวลา',
    ],
  },
  {
    id: 'burpees-12',
    titleTh: 'Burpees ปิดจบสายโหด',
    targetBadge: '12 ครั้ง',
    categoryTh: 'Full-Body Blast',
    cueTh: 'ย่อลงวิดพื้นแล้วดีดตัวกระโดดชูมือขึ้นสุด เผาผลาญเต็มกำลัง',
    xpReward: 50,
    mode: 'reps',
    targetValue: 12,
    exerciseId: 'push-up',
    formCues: [
      'ย่อตัววางมือบนพื้น ดีดขาไปด้านหลังเข้าท่าแพลงก์อย่างมั่นคง',
      'ลดหน้าอกแตะพื้นหรือวิดพื้น 1 ครั้ง แล้วดีดเท้ากลับเข้าหามือ',
      'กระโดดยืดตัวชูมือขึ้นสุดพร้อมลงพื้นด้วยเข่าที่ยืดหยุ่น',
    ],
  },
];
