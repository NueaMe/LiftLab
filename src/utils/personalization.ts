import {
  AthleteGender,
  AthleteProfile,
  CompletedSet,
  EquipmentType,
  ExperienceLevel,
  MuscleGroup,
  SetType,
  TrainingGoal,
} from '../types';
import { formatNumber } from './analytics';

export interface GoalConfig {
  id: TrainingGoal;
  labelTh: string;
  labelEn: string;
  repRange: string;
  minReps: number;
  maxReps: number;
  restSec: number;
  cueTh: string;
}

export const GOAL_CONFIGS: Record<TrainingGoal, GoalConfig> = {
  hypertrophy: {
    id: 'hypertrophy',
    labelTh: 'เพิ่มกล้ามเนื้อ',
    labelEn: 'Hypertrophy',
    repRange: '8–12',
    minReps: 8,
    maxReps: 12,
    restSec: 90,
    cueTh: 'เน้นช่วง 8–12 ครั้ง พัก 90 วิ เพื่อสะสมปริมาตรกล้ามเนื้อในโซน 10–20 เซ็ต/สัปดาห์',
  },
  glute_tone: {
    id: 'glute_tone',
    labelTh: 'ปั้นก้นและกระชับสัดส่วน',
    labelEn: 'Glute & Tone',
    repRange: '10–15',
    minReps: 10,
    maxReps: 15,
    restSec: 75,
    cueTh: 'เน้นช่วง 10–15 ครั้ง พัก 75 วิ โฟกัสบีบกล้ามเนื้อก้นและช่วงล่างเต็มระยะเพื่อสัดส่วนกระชับชัดเจน',
  },
  strength: {
    id: 'strength',
    labelTh: 'เพิ่มความแข็งแรง',
    labelEn: 'Strength',
    repRange: '3–6',
    minReps: 3,
    maxReps: 6,
    restSec: 150,
    cueTh: 'เน้นน้ำหนักหนัก 3–6 ครั้ง พัก 150 วิ เพื่อฟื้นฟูแรงระเบิดและพัฒนา 1RM สูงสุด',
  },
  endurance: {
    id: 'endurance',
    labelTh: 'ลดไขมัน / ความทนทาน',
    labelEn: 'Endurance',
    repRange: '12–15',
    minReps: 12,
    maxReps: 15,
    restSec: 60,
    cueTh: 'เน้นจำนวนครั้งสูง 12–15 ครั้ง พักสั้น 60 วิ รักษาอัตราการเต้นหัวใจและการเผาผลาญ',
  },
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, { labelTh: string; labelEn: string }> = {
  beginner: { labelTh: 'มือใหม่', labelEn: 'Beginner' },
  intermediate: { labelTh: 'ปานกลาง', labelEn: 'Intermediate' },
  advanced: { labelTh: 'ขั้นสูง', labelEn: 'Advanced' },
};

export const GENDER_LABELS: Record<AthleteGender, { labelTh: string; labelEn: string }> = {
  male: { labelTh: 'ชาย', labelEn: 'Male' },
  female: { labelTh: 'หญิง', labelEn: 'Female' },
};

export function getAthleteGender(profile: AthleteProfile | null | undefined): AthleteGender {
  return profile?.gender === 'female' ? 'female' : 'male';
}

export function getDefaultBarWeight(profile: AthleteProfile | null | undefined): number {
  return getAthleteGender(profile) === 'female' ? 15 : 20;
}

/**
 * Returns realistic beginner starting-weight suggestions (in kg) adapted by athlete
 * physique/gender, equipment type (e.g. 15kg women's Olympic bar vs 20kg men's bar),
 * and target muscle group.
 */
export function getBeginnerStartingWeight(
  equipment: EquipmentType,
  muscle: MuscleGroup,
  profile: AthleteProfile | null | undefined
): number {
  if (equipment === 'Bodyweight') return 0;
  const isFemale = getAthleteGender(profile) === 'female';
  const isLowerBody = muscle === 'Legs';

  if (equipment === 'Barbell') {
    if (isFemale) return isLowerBody ? 20 : 15;
    return isLowerBody ? 30 : 20;
  }
  if (equipment === 'Dumbbell') {
    if (isFemale) return isLowerBody ? 6 : 4;
    return isLowerBody ? 10 : 8;
  }
  if (equipment === 'Cable') {
    if (isFemale) return isLowerBody ? 10 : 12.5;
    return isLowerBody ? 15 : 20;
  }
  // Machine
  if (isFemale) return isLowerBody ? 25 : 15;
  return isLowerBody ? 40 : 25;
}

export function getGoalConfig(profile: AthleteProfile | null): GoalConfig | null {
  if (!profile) return null;
  return GOAL_CONFIGS[profile.goal] ?? null;
}

export interface DoubleProgressionSuggestion {
  action: 'add_rep' | 'increase_weight';
  targetWeight: number;
  targetReps: number;
  label: string;
  shortLabel: string;
  reasonTh: string;
}

/**
 * Smart Double-Progression Coach:
 * - If previous reps < top of goal's rep range -> keep weight, +1 rep.
 * - If previous reps >= top of goal's rep range -> +2.5kg (or +1.25kg fractional for
 *   female upper-body Dumbbell/Cable) and reset to bottom of rep range.
 */
export function getDoubleProgressionTarget(
  prevSet: CompletedSet | undefined,
  profile: AthleteProfile | null,
  setType: SetType,
  equipment?: EquipmentType
): DoubleProgressionSuggestion | null {
  if (!prevSet || setType === 'W' || prevSet.reps <= 0) return null;

  const goal = getGoalConfig(profile) ?? GOAL_CONFIGS.hypertrophy;
  const { minReps, maxReps } = goal;

  if (prevSet.reps < maxReps) {
    const nextReps = prevSet.reps + 1;
    const weightText =
      prevSet.weight === 0 && equipment === 'Bodyweight'
        ? 'BW'
        : `${formatNumber(prevSet.weight)}kg`;
    return {
      action: 'add_rep',
      targetWeight: prevSet.weight,
      targetReps: nextReps,
      label: `เป้าหมาย: ${weightText} × ${nextReps}`,
      shortLabel: `เป้า ${weightText}×${nextReps}`,
      reasonTh: `ครั้งก่อนได้ ${prevSet.reps} ครั้ง (ยังไม่ถึงเพดาน ${maxReps} ครั้ง) แนะนำคงน้ำหนักและเพิ่ม +1 ครั้ง`,
    };
  }

  const isFemaleMicroLoad =
    getAthleteGender(profile) === 'female' &&
    (equipment === 'Dumbbell' || equipment === 'Cable');
  const increment = isFemaleMicroLoad ? 1.25 : 2.5;
  const nextWeight = Number((prevSet.weight + increment).toFixed(2));
  return {
    action: 'increase_weight',
    targetWeight: nextWeight,
    targetReps: minReps,
    label: `อัปน้ำหนัก! ${formatNumber(nextWeight)}kg × ${minReps}`,
    shortLabel: `อัป! ${formatNumber(nextWeight)}kg×${minReps}`,
    reasonTh: `ครั้งก่อนแตะเพดาน ${maxReps} ครั้งแล้ว แนะนำเพิ่มน้ำหนัก +${formatNumber(increment)}kg และเริ่มที่ ${minReps} ครั้ง`,
  };
}

/**
 * Recommends the best-matching preset routine ID based on goal, gender, and experience level.
 */
export function getRecommendedPreset(
  profile: AthleteProfile | null
): { presetId: string; reasonTh: string } | null {
  if (!profile) return null;

  if (profile.goal === 'glute_tone') {
    return {
      presetId: 'glute-lower-sculpt',
      reasonTh: 'เหมาะกับเป้าหมายปั้นก้นและกระชับช่วงล่าง 3 วัน/สัปดาห์',
    };
  }

  if (profile.experience === 'beginner') {
    if (getAthleteGender(profile) === 'female') {
      return {
        presetId: 'dumbbell-cable-full-body-tone',
        reasonTh: 'เหมาะกับมือใหม่ กระชับทั้งตัวด้วยดัมเบลและเคเบิลโดยไม่ต้องใช้บาร์เบล',
      };
    }
    return {
      presetId: 'full-body-3day',
      reasonTh: 'เหมาะกับระดับมือใหม่ ฝึกครบทุกส่วน 3 วัน/สัปดาห์',
    };
  }

  if (profile.goal === 'strength') {
    return {
      presetId: 'upper-lower-split',
      reasonTh: 'เหมาะกับเป้าหมาย Strength เน้นท่าหลักและพักฟื้นระบบประสาท',
    };
  }

  return {
    presetId: 'push-pull-legs',
    reasonTh: 'เหมาะกับระดับปานกลาง โฟกัสกล้ามเนื้อและเก็บปริมาณเซ็ตได้เข้มข้น',
  };
}

/**
 * Calculates Strength-to-Weight Ratio (Estimated 1RM / Body Weight).
 */
export function calculateRelativeStrength(
  est1RM: number,
  bodyWeightKg: number | null | undefined
): number | null {
  if (!bodyWeightKg || bodyWeightKg <= 0 || !Number.isFinite(est1RM) || est1RM <= 0) {
    return null;
  }
  return Number((est1RM / bodyWeightKg).toFixed(2));
}

export function formatRelativeStrength(
  est1RM: number,
  bodyWeightKg: number | null | undefined
): string | null {
  const ratio = calculateRelativeStrength(est1RM, bodyWeightKg);
  if (ratio === null) return null;
  return `${ratio.toFixed(2)}x BW`;
}

export function createDemoAthleteProfile(): AthleteProfile {
  return {
    nickname: 'Nont',
    gender: 'male',
    bodyWeightKg: 72,
    experience: 'intermediate',
    goal: 'hypertrophy',
    weeklyTargetDays: 4,
    updatedAt: Date.now(),
    isDemo: true,
  };
}
