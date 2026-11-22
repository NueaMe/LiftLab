import { CompletedExercise, CompletedWorkout, PresetTemplate } from '../types';
import { calculateEpley1RM } from '../utils/analytics';

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'full-body-3day',
    title: 'Full Body 3-Day',
    level: 'มือใหม่แนะนำ',
    frequency: '3 วัน / สัปดาห์',
    description: 'ฝึกครบทุกมัดกล้ามเนื้อในวันเดียว เน้นท่าหลัก (Compound) เพื่อสร้างฐานความแข็งแรงและทักษะการควบคุมท่า',
    days: [
      {
        id: 'fb-day-a',
        label: 'Day A',
        subtitle: 'เน้นอก · หลัง · ขาหน้า',
        exercises: [
          { exerciseId: 'barbell-back-squat', sets: 3, targetReps: '8–10', restSec: 150 },
          { exerciseId: 'barbell-bench-press', sets: 3, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'lat-pulldown', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'overhead-press', sets: 3, targetReps: '8–10', restSec: 90 },
          { exerciseId: 'barbell-bicep-curl', sets: 2, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'tricep-rope-pushdown', sets: 2, targetReps: '10–12', restSec: 60 },
        ],
      },
      {
        id: 'fb-day-b',
        label: 'Day B',
        subtitle: 'เน้นหลังขา · หลังกลาง · อกบน',
        exercises: [
          { exerciseId: 'romanian-deadlift', sets: 3, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'barbell-bent-over-row', sets: 3, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'hammer-curl', sets: 2, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'overhead-dumbbell-extension', sets: 2, targetReps: '10–12', restSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower-split',
    title: 'Upper / Lower Split',
    level: 'มือใหม่ – ระดับกลาง',
    frequency: '4 วัน / สัปดาห์',
    description: 'แบ่งร่างกายช่วงบนและช่วงล่างชัดเจน ให้เวลาพักฟื้นเหมาะสมและเก็บปริมาณเซ็ตต่อสัปดาห์ได้แม่นยำ',
    days: [
      {
        id: 'ul-upper',
        label: 'Upper Day',
        subtitle: 'อก · หลัง · ไหล่ · แขน',
        exercises: [
          { exerciseId: 'barbell-bench-press', sets: 4, targetReps: '6–8', restSec: 120 },
          { exerciseId: 'barbell-bent-over-row', sets: 4, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'lat-pulldown', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'barbell-bicep-curl', sets: 3, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'tricep-rope-pushdown', sets: 3, targetReps: '10–12', restSec: 60 },
        ],
      },
      {
        id: 'ul-lower',
        label: 'Lower Day',
        subtitle: 'ต้นขาหน้า · หลังขา · สะโพก',
        exercises: [
          { exerciseId: 'barbell-back-squat', sets: 4, targetReps: '6–8', restSec: 150 },
          { exerciseId: 'romanian-deadlift', sets: 4, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'leg-press', sets: 3, targetReps: '10–12', restSec: 120 },
          { exerciseId: 'lying-leg-curl', sets: 3, targetReps: '10–12', restSec: 75 },
        ],
      },
    ],
  },
  {
    id: 'push-pull-legs',
    title: 'Push / Pull / Legs',
    level: 'สร้างกล้ามเนื้อเข้มข้น',
    frequency: '3–6 วัน / สัปดาห์',
    description: 'แยกวันตามกลุ่มกล้ามเนื้อที่ทำงานร่วมกัน ช่วยเพิ่มโฟกัสและปริมาณเซ็ตในโซน Hypertrophy 10–20 เซ็ต/สัปดาห์',
    days: [
      {
        id: 'ppl-push',
        label: 'Push',
        subtitle: 'อก · ไหล่ · หลังแขน',
        exercises: [
          { exerciseId: 'barbell-bench-press', sets: 4, targetReps: '6–8', restSec: 120 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, targetReps: '8–10', restSec: 90 },
          { exerciseId: 'cable-chest-fly', sets: 3, targetReps: '12–15', restSec: 75 },
          { exerciseId: 'overhead-press', sets: 3, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'tricep-rope-pushdown', sets: 3, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'overhead-dumbbell-extension', sets: 3, targetReps: '10–12', restSec: 60 },
        ],
      },
      {
        id: 'ppl-pull',
        label: 'Pull',
        subtitle: 'หลัง · ไหล่หลัง · หน้าแขน',
        exercises: [
          { exerciseId: 'barbell-bent-over-row', sets: 4, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'lat-pulldown', sets: 4, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'seated-cable-row', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'face-pull', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'barbell-bicep-curl', sets: 3, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'hammer-curl', sets: 3, targetReps: '10–12', restSec: 60 },
        ],
      },
      {
        id: 'ppl-legs',
        label: 'Legs',
        subtitle: 'ต้นขาหน้า · หลังขา · สะโพก',
        exercises: [
          { exerciseId: 'barbell-back-squat', sets: 4, targetReps: '6–8', restSec: 150 },
          { exerciseId: 'romanian-deadlift', sets: 4, targetReps: '8–10', restSec: 120 },
          { exerciseId: 'leg-press', sets: 3, targetReps: '10–12', restSec: 120 },
          { exerciseId: 'lying-leg-curl', sets: 3, targetReps: '12–15', restSec: 75 },
        ],
      },
    ],
  },
  {
    id: 'bodyweight-basics',
    title: 'Bodyweight Basics (มือใหม่ / ไม่ใช้อุปกรณ์)',
    level: 'ไม่ใช้อุปกรณ์ · เริ่มต้น',
    frequency: '3–4 วัน / สัปดาห์',
    description: 'โปรแกรมฝึกด้วยน้ำหนักตัวล้วนสำหรับมือใหม่ ฝึกได้ทุกที่โดยไม่ต้องใช้อุปกรณ์ยิม ครบทุกกลุ่มกล้ามเนื้อหลักพร้อมคู่มือท่าฝึก',
    days: [
      {
        id: 'bw-day-a',
        label: 'Day A',
        subtitle: 'ทั่วร่าง A · อก · หลัง · ขา · หน้าท้อง',
        exercises: [
          { exerciseId: 'bodyweight-squat', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'incline-push-up', sets: 3, targetReps: '10–15', restSec: 60 },
          { exerciseId: 'inverted-bodyweight-row', sets: 3, targetReps: '8–12', restSec: 75 },
          { exerciseId: 'glute-bridge', sets: 3, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'basic-abdominal-crunch', sets: 3, targetReps: '15–20', restSec: 45 },
          { exerciseId: 'forearm-plank', sets: 3, targetReps: '30–45s', restSec: 45 },
        ],
      },
      {
        id: 'bw-day-b',
        label: 'Day B',
        subtitle: 'ทั่วร่าง B · อก · ไหล่ · ขา · แกนกลาง',
        exercises: [
          { exerciseId: 'reverse-lunge', sets: 3, targetReps: '10–12', restSec: 60 },
          { exerciseId: 'push-up', sets: 3, targetReps: '8–12', restSec: 75 },
          { exerciseId: 'inverted-bodyweight-row', sets: 3, targetReps: '8–12', restSec: 75 },
          { exerciseId: 'pike-push-up', sets: 3, targetReps: '8–10', restSec: 75 },
          { exerciseId: 'glute-bridge', sets: 3, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'russian-twist', sets: 3, targetReps: '16–20', restSec: 45 },
        ],
      },
    ],
  },
  {
    id: 'glute-lower-sculpt',
    title: 'Glute & Lower Sculpt (ปั้นก้นและกระชับช่วงล่าง)',
    level: 'ปั้นก้น · กระชับสัดส่วน',
    frequency: '3 วัน / สัปดาห์',
    description: 'โปรแกรมปั้นก้นเด้งและกระชับช่วงล่างครบทุกมุม (ก้นบน ก้นข้าง หลังขา และช่วงบนกระชับ) แบ่งฝึก 3 วัน/สัปดาห์อย่างสมดุล',
    days: [
      {
        id: 'gls-day-1',
        label: 'Day 1',
        subtitle: 'Glute Power · ก้นบน · หลังขา · แกนกลาง',
        exercises: [
          { exerciseId: 'barbell-hip-thrust', sets: 4, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'romanian-deadlift', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'bulgarian-split-squat', sets: 3, targetReps: '10–12', restSec: 90 },
          { exerciseId: 'seated-hip-abduction', sets: 3, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'forearm-plank', sets: 3, targetReps: '45s', restSec: 45 },
        ],
      },
      {
        id: 'gls-day-2',
        label: 'Day 2',
        subtitle: 'Upper Tone · หลังสวย · ไหล่กระชับ · แขนเรียว',
        exercises: [
          { exerciseId: 'lat-pulldown', sets: 3, targetReps: '12–15', restSec: 75 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, targetReps: '10–12', restSec: 75 },
          { exerciseId: 'seated-cable-row', sets: 3, targetReps: '12–15', restSec: 75 },
          { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'face-pull', sets: 3, targetReps: '15', restSec: 60 },
          { exerciseId: 'tricep-rope-pushdown', sets: 2, targetReps: '12–15', restSec: 60 },
        ],
      },
      {
        id: 'gls-day-3',
        label: 'Day 3',
        subtitle: 'Glute Sculpt · ปั้นก้นเด้ง · ต้นขาด้านข้าง',
        exercises: [
          { exerciseId: 'barbell-hip-thrust', sets: 4, targetReps: '10–15', restSec: 90 },
          { exerciseId: 'cable-glute-kickback', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'leg-press', sets: 3, targetReps: '12–15', restSec: 90 },
          { exerciseId: 'seated-hip-abduction', sets: 3, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'glute-bridge', sets: 2, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'cable-crunch', sets: 3, targetReps: '12–15', restSec: 60 },
        ],
      },
    ],
  },
  {
    id: 'dumbbell-cable-full-body-tone',
    title: 'Dumbbell & Cable Full-Body Tone (กระชับทั้งตัว)',
    level: 'ไม่ต้องใช้บาร์เบล · มือใหม่แนะนำ',
    frequency: '3 วัน / สัปดาห์',
    description: 'ฝึกกระชับสัดส่วนทั้งตัวด้วยดัมเบล เคเบิล และแมชชีนโดยไม่ต้องยกบาร์เบล คุมฟอร์มง่าย ปลอดภัย และครบทุกมัดกล้ามเนื้อ',
    days: [
      {
        id: 'dc-day-a',
        label: 'Day A',
        subtitle: 'กระชับทั้งตัว A · ก้น · ขา · อก · หลัง',
        exercises: [
          { exerciseId: 'bulgarian-split-squat', sets: 3, targetReps: '10–12', restSec: 75 },
          { exerciseId: 'cable-glute-kickback', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'incline-dumbbell-press', sets: 3, targetReps: '10–12', restSec: 75 },
          { exerciseId: 'lat-pulldown', sets: 3, targetReps: '10–12', restSec: 75 },
          { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'cable-crunch', sets: 3, targetReps: '12–15', restSec: 60 },
        ],
      },
      {
        id: 'dc-day-b',
        label: 'Day B',
        subtitle: 'กระชับทั้งตัว B · ต้นขาข้าง · หลังขา · แขน · แกนกลาง',
        exercises: [
          { exerciseId: 'seated-hip-abduction', sets: 3, targetReps: '15–20', restSec: 60 },
          { exerciseId: 'lying-leg-curl', sets: 3, targetReps: '12–15', restSec: 75 },
          { exerciseId: 'seated-cable-row', sets: 3, targetReps: '12–15', restSec: 75 },
          { exerciseId: 'cable-chest-fly', sets: 3, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'hammer-curl', sets: 2, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'tricep-rope-pushdown', sets: 2, targetReps: '12–15', restSec: 60 },
          { exerciseId: 'forearm-plank', sets: 3, targetReps: '45s', restSec: 45 },
        ],
      },
    ],
  },
];

/**
 * Generates 4 weeks (16 realistic sessions) of progressive overload workout logs
 * ending 1 day ago so charts, PRs, previous set references, and weekly muscle
 * balance (hitting optimal 10–20 sets/week zone) look authentic immediately.
 */
export function generateFourWeekDemoHistory(): CompletedWorkout[] {
  const now = new Date();
  const workouts: CompletedWorkout[] = [];
  const runningBest1RM: Record<string, number> = {};

  interface BlueprintSet {
    type: 'W' | 'N' | 'F';
    weight: number;
    reps: number;
  }

  const buildWorkout = (
    hoursAgo: number,
    name: string,
    durationMin: number,
    rawExercises: { exerciseId: string; sets: BlueprintSet[] }[]
  ) => {
    const dateObj = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    let totalVolume = 0;
    let totalWorkingSets = 0;
    let prCount = 0;

    const exercises: CompletedExercise[] = rawExercises.map((ex) => {
      const prevBest = runningBest1RM[ex.exerciseId] ?? 0;
      let sessionBest = prevBest;

      const sets = ex.sets.map((s) => {
        const est1RM = calculateEpley1RM(s.weight, s.reps);
        totalVolume += s.weight * s.reps;
        if (s.type !== 'W') {
          totalWorkingSets += 1;
        }
        const isPR = s.type !== 'W' && prevBest > 0 && est1RM > sessionBest;
        if (s.type !== 'W' && est1RM > sessionBest) {
          sessionBest = est1RM;
        }
        if (isPR) {
          prCount += 1;
        }
        return {
          type: s.type,
          weight: s.weight,
          reps: s.reps,
          isPR,
          est1RM,
          isDemo: true,
        };
      });

      if (sessionBest > prevBest) {
        runningBest1RM[ex.exerciseId] = sessionBest;
      }

      return {
        exerciseId: ex.exerciseId,
        sets,
      };
    });

    workouts.push({
      id: `demo-${Math.round(hoursAgo)}h-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      date: dateObj.toISOString(),
      durationSec: durationMin * 60,
      totalVolume: Math.round(totalVolume),
      totalWorkingSets,
      prCount,
      exercises,
      isDemo: true,
    });
  };

  // Generate 4 weeks: weekIndex 0 (oldest) -> weekIndex 3 (this past week)
  // Exact hour offsets ensure the Muscle Readiness HUD reliably displays:
  // - Recovering (<48h): Legs, Biceps (trained ~18h ago)
  // - Ready (>48h & >=10 sets/wk): Chest, Back (rested ~62h)
  // - Low Volume (>48h & <10 sets/wk): Shoulders (8 sets), Triceps (7 sets)
  for (let w = 0; w < 4; w++) {
    const weekOffsetHours = (3 - w) * 7 * 24;
    const isFinalWeek = w === 3;

    // Session 1 of week: Upper A (~6 days / 144h ago in final week)
    buildWorkout(weekOffsetHours + 144, `Upper A — สัปดาห์ที่ ${w + 1}`, 56 + w * 2, [
      {
        exerciseId: 'barbell-bench-press',
        sets: [
          { type: 'W', weight: 40, reps: 10 },
          { type: 'N', weight: 52.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 55 + w * 2.5, reps: 8 },
          { type: 'N', weight: 55 + w * 2.5, reps: 8 + (w >= 2 ? 1 : 0) },
          { type: 'F', weight: 52.5 + w * 2.5, reps: 9 },
        ],
      },
      {
        exerciseId: 'incline-dumbbell-press',
        sets: [
          { type: 'N', weight: 18 + w * 2, reps: 10 },
          { type: 'N', weight: 18 + w * 2, reps: 10 },
          { type: 'N', weight: 18 + w * 2, reps: 9 + (w % 2) },
        ],
      },
      {
        exerciseId: 'lat-pulldown',
        sets: [
          { type: 'W', weight: 35, reps: 12 },
          { type: 'N', weight: 47.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 47.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 50 + w * 2.5, reps: 12 },
        ],
      },
      {
        exerciseId: 'overhead-press',
        sets: [
          { type: 'N', weight: 32.5 + w * 2.5, reps: 8 },
          { type: 'N', weight: 32.5 + w * 2.5, reps: 8 },
          { type: 'N', weight: 32.5 + w * 2.5, reps: 8 + (w >= 1 ? 1 : 0) },
        ],
      },
      {
        exerciseId: 'dumbbell-lateral-raise',
        sets: isFinalWeek
          ? [
              { type: 'N', weight: 8, reps: 12 },
              { type: 'N', weight: 8, reps: 11 },
            ]
          : [
              { type: 'N', weight: 7 + Math.floor(w / 2), reps: 14 },
              { type: 'N', weight: 7 + Math.floor(w / 2), reps: 14 },
              { type: 'F', weight: 7 + Math.floor(w / 2), reps: 15 },
            ],
      },
      {
        exerciseId: 'tricep-rope-pushdown',
        sets: [
          { type: 'N', weight: 20 + w * 2.5, reps: 12 },
          { type: 'N', weight: 20 + w * 2.5, reps: 12 },
          { type: 'N', weight: 20 + w * 2.5, reps: 11 },
        ],
      },
      {
        exerciseId: 'barbell-bicep-curl',
        sets: [
          { type: 'N', weight: 22.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 22.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 22.5 + w * 2.5, reps: 9 },
        ],
      },
    ]);

    // Session 2 of week: Lower A (~4 days / 98h ago in final week)
    buildWorkout(weekOffsetHours + 98, `Lower A — สัปดาห์ที่ ${w + 1}`, 52 + w, [
      {
        exerciseId: 'barbell-back-squat',
        sets: [
          { type: 'W', weight: 50, reps: 8 },
          { type: 'N', weight: 75 + w * 5, reps: 8 },
          { type: 'N', weight: 75 + w * 5, reps: 8 },
          { type: 'N', weight: 77.5 + w * 5, reps: 6 + (w >= 2 ? 1 : 0) },
          { type: 'N', weight: 75 + w * 5, reps: 7 },
        ],
      },
      {
        exerciseId: 'romanian-deadlift',
        sets: [
          { type: 'N', weight: 65 + w * 5, reps: 10 },
          { type: 'N', weight: 65 + w * 5, reps: 10 },
          { type: 'N', weight: 67.5 + w * 5, reps: 8 + (w >= 1 ? 1 : 0) },
        ],
      },
      {
        exerciseId: 'lying-leg-curl',
        sets: [
          { type: 'N', weight: 35 + w * 2.5, reps: 12 },
          { type: 'N', weight: 35 + w * 2.5, reps: 12 },
          { type: 'F', weight: 35 + w * 2.5, reps: 11 },
        ],
      },
      {
        exerciseId: 'cable-crunch',
        sets: [
          { type: 'N', weight: 27.5 + w * 2.5, reps: 15 },
          { type: 'N', weight: 27.5 + w * 2.5, reps: 14 },
          { type: 'N', weight: 30 + w * 2.5, reps: 12 + (w >= 2 ? 2 : 0) },
        ],
      },
      {
        exerciseId: 'ab-wheel-rollout',
        sets: [
          { type: 'N', weight: 10, reps: 10 + w },
          { type: 'N', weight: 10, reps: 10 + w },
          { type: 'N', weight: 10, reps: 9 + w },
        ],
      },
    ]);

    // Session 3 of week: Upper B (~62h ago in final week -> Chest & Back Ready >48h)
    buildWorkout(weekOffsetHours + 62, `Upper B — สัปดาห์ที่ ${w + 1}`, 60 + w, [
      {
        exerciseId: 'barbell-bent-over-row',
        sets: [
          { type: 'W', weight: 40, reps: 10 },
          { type: 'N', weight: 55 + w * 2.5, reps: 10 },
          { type: 'N', weight: 57.5 + w * 2.5, reps: 8 },
          { type: 'N', weight: 57.5 + w * 2.5, reps: 8 + (w >= 2 ? 1 : 0) },
          { type: 'N', weight: 55 + w * 2.5, reps: 9 },
        ],
      },
      {
        exerciseId: 'seated-cable-row',
        sets: [
          { type: 'N', weight: 45 + w * 2.5, reps: 12 },
          { type: 'N', weight: 47.5 + w * 2.5, reps: 10 },
          { type: 'N', weight: 47.5 + w * 2.5, reps: 10 },
          { type: 'F', weight: 45 + w * 2.5, reps: 12 },
        ],
      },
      {
        exerciseId: 'barbell-bench-press',
        sets: [
          { type: 'N', weight: 55 + w * 2.5, reps: 10 },
          { type: 'N', weight: 57.5 + w * 2.5, reps: 8 },
          { type: 'N', weight: 55 + w * 2.5, reps: 12 },
        ],
      },
      {
        exerciseId: 'cable-chest-fly',
        sets: [
          { type: 'N', weight: 12.5 + w * 1.25, reps: 12 },
          { type: 'N', weight: 12.5 + w * 1.25, reps: 11 },
          { type: 'F', weight: 12.5 + w * 1.25, reps: 10 },
        ],
      },
      {
        exerciseId: 'face-pull',
        sets: [
          { type: 'N', weight: 17.5 + w * 2.5, reps: 12 },
          { type: 'N', weight: 17.5 + w * 2.5, reps: 12 },
          { type: 'N', weight: 17.5 + w * 2.5, reps: 11 },
        ],
      },
      {
        exerciseId: 'hammer-curl',
        sets: [
          { type: 'N', weight: 12 + w, reps: 12 },
          { type: 'N', weight: 12 + w, reps: 12 },
          { type: 'N', weight: 12 + w, reps: 11 },
          { type: 'F', weight: 10 + w, reps: 12 },
        ],
      },
      {
        exerciseId: 'overhead-dumbbell-extension',
        sets: isFinalWeek
          ? [
              { type: 'N', weight: 22, reps: 12 },
              { type: 'N', weight: 22, reps: 10 },
              { type: 'N', weight: 22, reps: 10 },
              { type: 'N', weight: 22, reps: 9 },
            ]
          : [
              { type: 'N', weight: 16 + w * 2, reps: 12 },
              { type: 'N', weight: 16 + w * 2, reps: 11 },
              { type: 'N', weight: 16 + w * 2, reps: 10 },
            ],
      },
      {
        exerciseId: 'hanging-leg-raise',
        sets: [
          { type: 'N', weight: 10, reps: 12 + w },
          { type: 'N', weight: 10, reps: 11 + w },
          { type: 'F', weight: 10, reps: 10 + w },
        ],
      },
      {
        exerciseId: 'russian-twist',
        sets: [
          { type: 'N', weight: 8 + Math.floor(w / 2) * 2, reps: 20 },
          { type: 'N', weight: 8 + Math.floor(w / 2) * 2, reps: 20 },
        ],
      },
    ]);

    // Session 4 of week: Lower B & Biceps (~18h ago in final week -> Legs & Biceps Recovering <48h)
    const lowerBExercises: { exerciseId: string; sets: BlueprintSet[] }[] = [
      {
        exerciseId: 'leg-press',
        sets: [
          { type: 'W', weight: 80, reps: 10 },
          { type: 'N', weight: 110 + w * 10, reps: 12 },
          { type: 'N', weight: 120 + w * 10, reps: 10 },
          { type: 'N', weight: 120 + w * 10, reps: 10 },
        ],
      },
      {
        exerciseId: 'romanian-deadlift',
        sets: [
          { type: 'N', weight: 67.5 + w * 5, reps: 10 },
          { type: 'N', weight: 70 + w * 5, reps: 8 + (w >= 2 ? 1 : 0) },
          { type: 'N', weight: 67.5 + w * 5, reps: 9 },
        ],
      },
      {
        exerciseId: 'incline-dumbbell-curl',
        sets: [
          { type: 'N', weight: 10 + Math.floor(w / 2) * 2, reps: 12 },
          { type: 'N', weight: 10 + Math.floor(w / 2) * 2, reps: 11 },
          { type: 'N', weight: 10 + Math.floor(w / 2) * 2, reps: 10 },
        ],
      },
    ];

    if (!isFinalWeek) {
      lowerBExercises.push(
        {
          exerciseId: 'skull-crusher',
          sets: [
            { type: 'N', weight: 20 + w * 2.5, reps: 10 },
            { type: 'N', weight: 20 + w * 2.5, reps: 10 },
            { type: 'N', weight: 20 + w * 2.5, reps: 9 },
            { type: 'N', weight: 20 + w * 2.5, reps: 9 },
          ],
        },
        {
          exerciseId: 'dumbbell-lateral-raise',
          sets: [
            { type: 'N', weight: 7 + Math.floor(w / 2), reps: 15 },
            { type: 'N', weight: 7 + Math.floor(w / 2), reps: 14 },
          ],
        }
      );
    }

    buildWorkout(weekOffsetHours + 18, `Lower B — สัปดาห์ที่ ${w + 1}`, 48 + w, lowerBExercises);
  }

  // Sort newest first
  return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
