export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Legs' | 'Biceps' | 'Triceps' | 'Abs';

export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';

export type SetType = 'W' | 'N' | 'F';

export type TabId = 'workout' | 'routines' | 'exercises' | 'analytics';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type AthleteGender = 'male' | 'female';

export type TrainingGoal = 'hypertrophy' | 'strength' | 'endurance' | 'glute_tone';

export interface AthleteProfile {
  nickname: string;
  gender?: AthleteGender;
  bodyWeightKg: number | null;
  experience: ExperienceLevel;
  goal: TrainingGoal;
  weeklyTargetDays?: number;
  updatedAt: number;
  isDemo?: boolean;
}

export type MotionType =
  | 'flat-press'
  | 'incline-press'
  | 'cable-fly'
  | 'dip'
  | 'push-up'
  | 'incline-push-up'
  | 'pike-push-up'
  | 'pulldown'
  | 'seated-row'
  | 'bent-row'
  | 'inverted-row'
  | 'overhead-press'
  | 'lateral-raise'
  | 'squat'
  | 'lunge'
  | 'glute-bridge'
  | 'hip-thrust'
  | 'split-squat'
  | 'glute-kickback'
  | 'hip-abduction'
  | 'hinge'
  | 'leg-curl-ext'
  | 'bicep-curl'
  | 'hammer-curl'
  | 'tricep-ext'
  | 'cable-crunch'
  | 'basic-crunch'
  | 'leg-raise'
  | 'ab-rollout'
  | 'russian-twist'
  | 'plank';

export interface SubMuscleSpec {
  id: string;
  labelTh: string;
  labelEn: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  subMuscle: string;
  subMuscleTh: string;
  subMuscleEn: string;
  equipment: EquipmentType;
  defaultRestSec: number;
  motionType: MotionType;
  isRecommended: boolean;
  formCues: [string, string, string];
  commonMistake: string;
}

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight: string;
  reps: string;
  completed: boolean;
  isPR?: boolean;
  est1RM?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  restSec: number;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  name: string;
  startedAt: number;
  exercises: WorkoutExercise[];
}

export interface CompletedSet {
  type: SetType;
  weight: number;
  reps: number;
  isPR: boolean;
  est1RM: number;
  isDemo?: boolean;
}

export interface CompletedExercise {
  exerciseId: string;
  sets: CompletedSet[];
}

export interface CompletedWorkout {
  id: string;
  name: string;
  date: string; // ISO string
  durationSec: number;
  totalVolume: number;
  totalWorkingSets: number;
  prCount: number;
  exercises: CompletedExercise[];
  isDemo?: boolean;
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  sets: number;
  targetReps: string;
  restSec: number;
}

export interface RoutineDay {
  id: string;
  label: string;
  subtitle: string;
  exercises: RoutineExerciseConfig[];
}

export interface PresetTemplate {
  id: string;
  title: string;
  level: string;
  frequency: string;
  description: string;
  days: RoutineDay[];
}

export interface CustomRoutine {
  id: string;
  name: string;
  note: string;
  createdAt: number;
  exercises: RoutineExerciseConfig[];
}

export type DailyEnergyMode = 'beast' | 'standard' | 'recovery';

export interface AppData {
  version: number;
  profile: AthleteProfile | null;
  profileDismissed?: boolean;
  history: CompletedWorkout[];
  activeWorkout: ActiveWorkout | null;
  customRoutines: CustomRoutine[];
  bonusXp?: number;
  finisherCount?: number;
}

export interface RestTimerState {
  active: boolean;
  remainingSec: number;
  totalSec: number;
  exerciseName: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'emerald' | 'amber' | 'zinc' | 'rose';
}
