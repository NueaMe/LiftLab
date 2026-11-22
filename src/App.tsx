import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dumbbell,
  ClipboardList,
  BookOpen,
  BarChart3,
  Database,
  HelpCircle,
  Trophy,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  ActiveWorkout,
  AppData,
  AthleteGender,
  AthleteProfile,
  CompletedExercise,
  CompletedSet,
  CompletedWorkout,
  CustomRoutine,
  DailyEnergyMode,
  RestTimerState,
  RoutineExerciseConfig,
  SetType,
  TabId,
  ToastMessage,
  WorkoutExercise,
  WorkoutSet,
} from './types';
import { calculateAthleteXp, DailyFinisherChallenge } from './utils/gamification';
import { EXERCISE_MAP } from './data/exercises';
import { generateFourWeekDemoHistory } from './data/presets';
import {
  calculateEpley1RM,
  getHistoricalBest1RM,
  getPreviousExerciseSets,
  isDemoWorkout,
  playPRFanfare,
  playRestCountdownBeep,
  playSetLoggedTick,
  playTimerChime,
  recalculateHistoryPRs,
} from './utils/analytics';
import {
  createDemoAthleteProfile,
  GENDER_LABELS,
  getDoubleProgressionTarget,
  getGoalConfig,
} from './utils/personalization';
import { DEFAULT_APP_DATA, loadAppData, saveAppData } from './utils/storage';
import { WorkoutTab } from './components/WorkoutTab';
import { RoutinesTab } from './components/RoutinesTab';
import { ExercisesTab } from './components/ExercisesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { ExerciseGuideModal } from './components/ExerciseGuideModal';
import { ExercisePickerModal } from './components/ExercisePickerModal';
import { RestTimerFloating } from './components/RestTimerFloating';
import { DataModal } from './components/DataModal';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { AthleteProfileModal } from './components/AthleteProfileModal';
import { LiftLabLogoIcon } from './components/MuscleBadge';
import {
  PRCelebrationBanner,
  PRCelebrationPayload,
} from './components/PRCelebrationBanner';
import { BeginnerGuideModal } from './components/BeginnerGuideModal';

const NAV_TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'workout', label: 'ฝึกวันนี้', icon: Dumbbell },
  { id: 'routines', label: 'ตารางฝึก', icon: ClipboardList },
  { id: 'exercises', label: 'คลังท่าฝึก', icon: BookOpen },
  { id: 'analytics', label: 'สถิติ', icon: BarChart3 },
];

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createInitialSets(
  exerciseId: string,
  count: number,
  history: CompletedWorkout[]
): WorkoutSet[] {
  const prevSets = getPreviousExerciseSets(history, exerciseId);
  return Array.from({ length: Math.max(1, count) }, (_, i) => {
    const prev = prevSets[i];
    return {
      id: createId('set'),
      type: prev?.type ?? 'N',
      weight: '',
      reps: '',
      completed: false,
    };
  });
}

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<TabId>('workout');
  const [analyticsInspectTarget, setAnalyticsInspectTarget] = useState<{
    exerciseId: string | null;
    nonce: number;
  } | null>(null);

  const [guideExerciseId, setGuideExerciseId] = useState<string | null>(null);
  const [workoutPickerOpen, setWorkoutPickerOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [beginnerGuideOpen, setBeginnerGuideOpen] = useState(false);
  const [summaryWorkout, setSummaryWorkout] = useState<CompletedWorkout | null>(null);

  const [restTimer, setRestTimer] = useState<RestTimerState>({
    active: false,
    remainingSec: 0,
    totalSec: 0,
    exerciseName: '',
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [prCelebration, setPrCelebration] = useState<PRCelebrationPayload | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [energyMode, setEnergyMode] = useState<DailyEnergyMode>('standard');

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'zinc') => {
    const id = createId('toast');
    setToast({ id, text, tone });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3200);
  }, []);

  const handleInspectPeakPR = useCallback((exerciseId: string | null) => {
    setAnalyticsInspectTarget({ exerciseId, nonce: Date.now() });
    setActiveTab('analytics');
  }, []);

  const handleConsumeAnalyticsInspect = useCallback(() => {
    setAnalyticsInspectTarget(null);
  }, []);

  const triggerPRCelebration = useCallback((payload: Omit<PRCelebrationPayload, 'id'>) => {
    const id = createId('pr');
    setPrCelebration({ ...payload, id });
    window.setTimeout(() => {
      setPrCelebration((current) => (current?.id === id ? null : current));
    }, 4400);
  }, []);

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Interactive cursor-following radial spotlight for all Bento cards (zero React re-renders)
  useEffect(() => {
    let rafId = 0;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>('.glass-card, .glass-card-cobalt, .hud-tile');
      if (!card) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(1)}px`);
      });
    };
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!restTimer.active) return;

    const interval = window.setInterval(() => {
      setRestTimer((prev) => {
        if (!prev.active) return prev;
        if (prev.remainingSec <= 1) {
          playTimerChime(soundEnabled);
          return { active: false, remainingSec: 0, totalSec: 0, exerciseName: '' };
        }
        const nextSec = prev.remainingSec - 1;
        if (nextSec <= 3 && nextSec >= 1) {
          playRestCountdownBeep(nextSec, soundEnabled);
        }
        return { ...prev, remainingSec: nextSec };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [restTimer.active, soundEnabled]);

  const startRestTimer = useCallback((seconds: number, exerciseName: string) => {
    const clamped = Math.max(15, seconds);
    setRestTimer({
      active: true,
      remainingSec: clamped,
      totalSec: clamped,
      exerciseName,
    });
  }, []);

  const handleAdjustRest = useCallback((delta: number) => {
    setRestTimer((prev) => {
      if (!prev.active) return prev;
      const nextRemaining = prev.remainingSec + delta;
      if (nextRemaining <= 0) {
        return { active: false, remainingSec: 0, totalSec: 0, exerciseName: '' };
      }
      return {
        ...prev,
        remainingSec: nextRemaining,
        totalSec: Math.max(prev.totalSec, nextRemaining),
      };
    });
  }, []);

  const handleSkipRest = useCallback(() => {
    setRestTimer({ active: false, remainingSec: 0, totalSec: 0, exerciseName: '' });
  }, []);

  const goalConfig = useMemo(() => getGoalConfig(appData.profile), [appData.profile]);

  const isFirstVisitOnboarding = !appData.profile && !appData.profileDismissed;
  const isProfileModalOpen = profileModalOpen || isFirstVisitOnboarding;

  const handleSaveProfile = (profile: AthleteProfile) => {
    const cfg = getGoalConfig(profile);
    const realProfile: AthleteProfile = { ...profile, isDemo: false };
    setAppData((prev) => ({
      ...prev,
      profile: realProfile,
      profileDismissed: true,
    }));
    setProfileModalOpen(false);
    showToast(
      `บันทึกโปรไฟล์ ${realProfile.nickname} แล้ว${cfg ? ` · เป้า ${cfg.repRange} ครั้ง / พัก ${cfg.restSec}s` : ''}`,
      'zinc'
    );
  };

  const handleSkipProfile = () => {
    setAppData((prev) => ({
      ...prev,
      profileDismissed: true,
    }));
    setProfileModalOpen(false);
  };

  const handleQuickToggleGender = (gender: AthleteGender) => {
    setAppData((prev) => {
      const nextProfile: AthleteProfile = prev.profile
        ? {
            ...prev.profile,
            gender,
            updatedAt: Date.now(),
            isDemo: false,
          }
        : {
            nickname: 'Athlete',
            gender,
            bodyWeightKg: null,
            experience: 'beginner',
            goal: gender === 'female' ? 'glute_tone' : 'hypertrophy',
            updatedAt: Date.now(),
            isDemo: false,
          };
      return {
        ...prev,
        profile: nextProfile,
      };
    });
    const label = GENDER_LABELS[gender];
    showToast(
      `สลับสรีระเป็น ${label.labelTh} (${label.labelEn}) · แกนบาร์เบลมาตรฐาน ${gender === 'female' ? '15' : '20'} kg`,
      'zinc'
    );
  };

  // ================= WORKOUT SESSION HANDLERS =================
  const handleStartEmptyWorkout = () => {
    const now = new Date();
    const workout: ActiveWorkout = {
      id: createId('workout'),
      name: `การฝึกวันที่ ${now.getDate()}/${now.getMonth() + 1}`,
      startedAt: Date.now(),
      exercises: [],
    };
    setAppData((prev) => ({ ...prev, activeWorkout: workout }));
    setActiveTab('workout');
    setWorkoutPickerOpen(true);
  };

  const handleStartFromRoutine = (name: string, configs: RoutineExerciseConfig[]) => {
    const exercises: WorkoutExercise[] = configs
      .filter((c) => Boolean(EXERCISE_MAP[c.exerciseId]))
      .map((cfg) => ({
        id: createId('wex'),
        exerciseId: cfg.exerciseId,
        restSec: goalConfig ? goalConfig.restSec : cfg.restSec || EXERCISE_MAP[cfg.exerciseId].defaultRestSec,
        sets: createInitialSets(cfg.exerciseId, cfg.sets, appData.history),
      }));

    const workout: ActiveWorkout = {
      id: createId('workout'),
      name,
      startedAt: Date.now(),
      exercises,
    };

    setAppData((prev) => ({ ...prev, activeWorkout: workout }));
    setActiveTab('workout');
    showToast(`เริ่มตารางฝึก "${name}" แล้ว`, 'zinc');
  };

  const handleAddExerciseToWorkout = (exerciseId: string) => {
    const def = EXERCISE_MAP[exerciseId];
    if (!def) return;

    setAppData((prev) => {
      const current = prev.activeWorkout ?? {
        id: createId('workout'),
        name: 'การฝึกวันนี้ (Freestyle)',
        startedAt: Date.now(),
        exercises: [],
      };

      const prevGoalCfg = getGoalConfig(prev.profile);
      const newEx: WorkoutExercise = {
        id: createId('wex'),
        exerciseId,
        restSec: prevGoalCfg ? prevGoalCfg.restSec : def.defaultRestSec,
        sets: createInitialSets(exerciseId, 3, prev.history),
      };

      return {
        ...prev,
        activeWorkout: {
          ...current,
          exercises: [...current.exercises, newEx],
        },
      };
    });

    showToast(`เพิ่ม ${def.name} ลงการฝึกวันนี้แล้ว`, 'zinc');
  };

  const handleUpdateWorkoutName = (name: string) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: { ...prev.activeWorkout, name },
      };
    });
  };

  const handleSwapExercise = (workoutExerciseId: string, newExerciseId: string) => {
    const newDef = EXERCISE_MAP[newExerciseId];
    if (!newDef) return;

    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      const prevGoalCfg = getGoalConfig(prev.profile);
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) => {
            if (e.id !== workoutExerciseId) return e;
            return {
              ...e,
              exerciseId: newExerciseId,
              restSec: prevGoalCfg ? prevGoalCfg.restSec : newDef.defaultRestSec,
              sets: createInitialSets(newExerciseId, Math.max(1, e.sets.length), prev.history),
            };
          }),
        },
      };
    });

    showToast(`สลับท่าเป็น ${newDef.name} เฉพาะเซสชันนี้แล้ว`, 'zinc');
  };

  const handleRemoveExercise = (workoutExerciseId: string) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.filter((e) => e.id !== workoutExerciseId),
        },
      };
    });
  };

  const handleChangeExerciseRest = (workoutExerciseId: string, restSec: number) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) =>
            e.id === workoutExerciseId ? { ...e, restSec } : e
          ),
        },
      };
    });
  };

  const handleAddSet = (workoutExerciseId: string) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) => {
            if (e.id !== workoutExerciseId) return e;
            const lastSet = e.sets[e.sets.length - 1];
            const nextSet: WorkoutSet = {
              id: createId('set'),
              type: 'N',
              weight: lastSet?.weight ?? '',
              reps: lastSet?.reps ?? '',
              completed: false,
            };
            return { ...e, sets: [...e.sets, nextSet] };
          }),
        },
      };
    });
  };

  const handleRemoveSet = (workoutExerciseId: string, setId: string) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) =>
            e.id === workoutExerciseId
              ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
              : e
          ),
        },
      };
    });
  };

  const handleUpdateSetField = (
    workoutExerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: string
  ) => {
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) => {
            if (e.id !== workoutExerciseId) return e;
            return {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value, completed: false, isPR: false } : s
              ),
            };
          }),
        },
      };
    });
  };

  const handleCycleSetType = (workoutExerciseId: string, setId: string) => {
    const order: SetType[] = ['N', 'W', 'F'];
    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) => {
            if (e.id !== workoutExerciseId) return e;
            return {
              ...e,
              sets: e.sets.map((s) => {
                if (s.id !== setId) return s;
                const nextType = order[(order.indexOf(s.type) + 1) % order.length];
                return {
                  ...s,
                  type: nextType,
                  isPR: nextType === 'W' ? false : s.isPR,
                };
              }),
            };
          }),
        },
      };
    });
  };

  const handleToggleSetComplete = (workoutExerciseId: string, setId: string) => {
    const currentWorkout = appData.activeWorkout;
    if (!currentWorkout) return;

    const targetEx = currentWorkout.exercises.find((e) => e.id === workoutExerciseId);
    if (!targetEx) return;
    const setIndex = targetEx.sets.findIndex((s) => s.id === setId);
    if (setIndex === -1) return;

    const targetSet = targetEx.sets[setIndex];
    const def = EXERCISE_MAP[targetEx.exerciseId];

    if (targetSet.completed) {
      setAppData((prev) => {
        if (!prev.activeWorkout) return prev;
        return {
          ...prev,
          activeWorkout: {
            ...prev.activeWorkout,
            exercises: prev.activeWorkout.exercises.map((e) =>
              e.id === workoutExerciseId
                ? {
                    ...e,
                    sets: e.sets.map((s) =>
                      s.id === setId ? { ...s, completed: false, isPR: false } : s
                    ),
                  }
                : e
            ),
          },
        };
      });
      return;
    }

    const prevSets = getPreviousExerciseSets(appData.history, targetEx.exerciseId);
    const prevMatch = prevSets[setIndex];
    const coachTarget = getDoubleProgressionTarget(
      prevMatch,
      appData.profile,
      targetSet.type,
      def?.equipment
    );

    const resolvedWeightStr =
      targetSet.weight.trim() !== ''
        ? targetSet.weight
        : coachTarget
          ? String(coachTarget.targetWeight)
          : prevMatch
            ? String(prevMatch.weight)
            : def?.equipment === 'Bodyweight'
              ? '0'
              : '';

    const resolvedRepsStr =
      targetSet.reps.trim() !== ''
        ? targetSet.reps
        : coachTarget
          ? String(coachTarget.targetReps)
          : prevMatch
            ? String(prevMatch.reps)
            : '';

    const weightNum = parseFloat(resolvedWeightStr);
    const repsNum = parseInt(resolvedRepsStr, 10);

    if (!Number.isFinite(repsNum) || repsNum <= 0 || !Number.isFinite(weightNum) || weightNum < 0) {
      showToast('กรุณากรอกน้ำหนักและจำนวนครั้งก่อนบันทึกเซ็ต', 'amber');
      return;
    }

    const est1RM = calculateEpley1RM(weightNum, repsNum);
    const realHistory = appData.history.filter((h) => !isDemoWorkout(h));
    const historicalBest = getHistoricalBest1RM(realHistory, targetEx.exerciseId);

    let sessionBestBefore = historicalBest;
    for (const ex of currentWorkout.exercises) {
      if (ex.exerciseId !== targetEx.exerciseId) continue;
      for (const s of ex.sets) {
        if (s.id === setId || !s.completed || s.type === 'W') continue;
        const sEst = s.est1RM ?? calculateEpley1RM(parseFloat(s.weight) || 0, parseInt(s.reps, 10) || 0);
        if (sEst > sessionBestBefore) sessionBestBefore = sEst;
      }
    }

    const isPR = targetSet.type !== 'W' && est1RM > 0 && est1RM > sessionBestBefore;

    setAppData((prev) => {
      if (!prev.activeWorkout) return prev;
      return {
        ...prev,
        activeWorkout: {
          ...prev.activeWorkout,
          exercises: prev.activeWorkout.exercises.map((e) => {
            if (e.id !== workoutExerciseId) return e;
            return {
              ...e,
              sets: e.sets.map((s) =>
                s.id === setId
                  ? {
                      ...s,
                      weight: String(weightNum),
                      reps: String(repsNum),
                      completed: true,
                      est1RM,
                      isPR,
                    }
                  : s
              ),
            };
          }),
        },
      };
    });

    startRestTimer(targetEx.restSec, def?.name ?? 'พักเซ็ต');

    if (isPR) {
      playPRFanfare(soundEnabled);
      triggerPRCelebration({
        exerciseName: def?.name ?? 'Personal Record',
        est1RM,
        previousBest1RM: sessionBestBefore,
        weight: weightNum,
        reps: repsNum,
      });
    } else {
      playSetLoggedTick(soundEnabled);
    }
  };

  const handleFinishWorkout = () => {
    const current = appData.activeWorkout;
    if (!current) return;

    let totalVolume = 0;
    let totalWorkingSets = 0;
    let prCount = 0;

    const completedExercises: CompletedExercise[] = [];

    for (const ex of current.exercises) {
      const doneSets: CompletedSet[] = [];
      for (const s of ex.sets) {
        if (!s.completed) continue;
        const weight = parseFloat(s.weight) || 0;
        const reps = parseInt(s.reps, 10) || 0;
        if (reps <= 0) continue;
        const est1RM = s.est1RM ?? calculateEpley1RM(weight, reps);
        totalVolume += weight * reps;
        if (s.type !== 'W') totalWorkingSets += 1;
        if (s.isPR) prCount += 1;
        doneSets.push({
          type: s.type,
          weight,
          reps,
          isPR: Boolean(s.isPR),
          est1RM,
          isDemo: false,
        });
      }
      if (doneSets.length > 0) {
        completedExercises.push({
          exerciseId: ex.exerciseId,
          sets: doneSets,
        });
      }
    }

    if (completedExercises.length === 0) {
      showToast('กรุณาบันทึกเซ็ตสำเร็จอย่างน้อย 1 เซ็ตก่อนจบการฝึก', 'amber');
      return;
    }

    const durationSec = Math.max(60, Math.floor((Date.now() - current.startedAt) / 1000));
    const finished: CompletedWorkout = {
      id: createId('log'),
      name: current.name.trim() || 'การฝึกวันนี้',
      date: new Date().toISOString(),
      durationSec,
      totalVolume: Math.round(totalVolume),
      totalWorkingSets,
      prCount,
      exercises: completedExercises,
      isDemo: false,
    };

    setAppData((prev) => ({
      ...prev,
      activeWorkout: null,
      history: [finished, ...prev.history],
    }));

    handleSkipRest();
    setSummaryWorkout(finished);
  };

  const handleDiscardWorkout = () => {
    setAppData((prev) => ({ ...prev, activeWorkout: null }));
    handleSkipRest();
    showToast('ยกเลิกเซสชันปัจจุบันแล้ว', 'zinc');
  };

  // ================= ROUTINES & DATA HANDLERS =================
  const handleSaveCustomRoutine = (routine: CustomRoutine) => {
    setAppData((prev) => {
      const exists = prev.customRoutines.some((r) => r.id === routine.id);
      return {
        ...prev,
        customRoutines: exists
          ? prev.customRoutines.map((r) => (r.id === routine.id ? routine : r))
          : [routine, ...prev.customRoutines],
      };
    });
    showToast(`บันทึกตาราง "${routine.name}" เรียบร้อย`, 'zinc');
  };

  const handleDeleteCustomRoutine = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      customRoutines: prev.customRoutines.filter((r) => r.id !== id),
    }));
    showToast('ลบตารางฝึกแล้ว', 'zinc');
  };

  const handleLoadDemo = () => {
    const demoHistory = generateFourWeekDemoHistory();
    const demoProfile = createDemoAthleteProfile();
    const existingRealCount = appData.history.filter((h) => !isDemoWorkout(h)).length;
    const hasRealProfile = Boolean(appData.profile && !appData.profile.isDemo);

    setAppData((prev) => {
      const realSessions = prev.history
        .filter((h) => !isDemoWorkout(h))
        .map((h) => ({ ...h, isDemo: false }));
      const mergedHistory = [...realSessions, ...demoHistory].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const keepRealProfile = Boolean(prev.profile && !prev.profile.isDemo);

      return {
        ...prev,
        history: mergedHistory,
        profile: keepRealProfile ? prev.profile : demoProfile,
        profileDismissed: true,
      };
    });

    showToast(
      existingRealCount > 0
        ? `เพิ่มข้อมูลจำลอง ${demoHistory.length} เซสชัน (DEMO) รวมกับบันทึกจริง ${existingRealCount} เซสชันเดิมเรียบร้อย`
        : hasRealProfile
          ? `โหลดข้อมูลจำลอง 4 สัปดาห์ (${demoHistory.length} เซสชัน · DEMO) โดยคงโปรไฟล์ของคุณไว้`
          : `โหลดข้อมูลจำลอง 4 สัปดาห์ (${demoHistory.length} เซสชัน · DEMO) + โปรไฟล์ ${demoProfile.nickname} สำเร็จ`,
      'zinc'
    );
  };

  const handleClearDemoOnly = () => {
    const demoCount = appData.history.filter((h) => isDemoWorkout(h)).length;
    const realCount = appData.history.length - demoCount;

    setAppData((prev) => {
      const remainingReal = prev.history
        .filter((h) => !isDemoWorkout(h))
        .map((h) => ({ ...h, isDemo: false }));
      const recalculatedRealHistory = recalculateHistoryPRs(remainingReal);

      return {
        ...prev,
        history: recalculatedRealHistory,
        profile: prev.profile?.isDemo === true ? null : prev.profile,
      };
    });

    setSummaryWorkout((curr) => (curr && isDemoWorkout(curr) ? null : curr));

    showToast(
      demoCount > 0
        ? `ลบข้อมูลจำลอง ${demoCount} เซสชันแล้ว · คงบันทึกจริง ${realCount} เซสชันครบถ้วนพร้อมคำนวณสถิติใหม่`
        : 'ไม่มีข้อมูลจำลองในระบบ (บันทึกจริงทั้งหมดปลอดภัย)',
      'zinc'
    );
  };

  const handleImportData = (imported: AppData) => {
    setAppData(imported);
    showToast(`นำเข้าข้อมูลสำเร็จ (${imported.history.length} ครั้งฝึก)`, 'zinc');
  };

  const handleClearAll = () => {
    setAppData({ ...DEFAULT_APP_DATA, profileDismissed: true });
    setSummaryWorkout(null);
    handleSkipRest();
    showToast('ล้างข้อมูลจริงและข้อมูลจำลองทั้งหมดกลับเป็น 0 แล้ว', 'zinc');
  };

  const handleDeleteWorkoutLog = (id: string) => {
    setAppData((prev) => {
      const remaining = prev.history.filter((h) => h.id !== id);
      const realOnly = recalculateHistoryPRs(remaining.filter((h) => !isDemoWorkout(h)));
      const demoOnly = remaining.filter((h) => isDemoWorkout(h));
      const merged = [...realOnly, ...demoOnly].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return {
        ...prev,
        history: merged,
      };
    });
    showToast('ลบประวัติการฝึกแล้ว', 'zinc');
  };

  const handleClaimFinisherXp = (challenge: DailyFinisherChallenge) => {
    const beforeRank = calculateAthleteXp(
      appData.history,
      appData.activeWorkout,
      appData.bonusXp ?? 0
    ).currentTier;
    const nextBonus = (appData.bonusXp ?? 0) + challenge.xpReward;
    const afterStatus = calculateAthleteXp(
      appData.history,
      appData.activeWorkout,
      nextBonus
    );

    setAppData((prev) => ({
      ...prev,
      bonusXp: (prev.bonusXp ?? 0) + challenge.xpReward,
      finisherCount: (prev.finisherCount ?? 0) + 1,
    }));

    if (afterStatus.currentTier.id !== beforeRank.id) {
      showToast(
        `LEVEL UP! เลื่อนขั้นเป็น ${afterStatus.currentTier.titleEn} (+${challenge.xpReward} XP จาก ${challenge.titleTh})`,
        'emerald'
      );
    } else {
      showToast(
        `ภารกิจสำเร็จ! รับ +${challenge.xpReward} XP (${challenge.titleTh}) · รวม ${afterStatus.totalXp.toLocaleString('en-US')} XP`,
        'emerald'
      );
    }
  };

  const guideExercise = guideExerciseId ? EXERCISE_MAP[guideExerciseId] ?? null : null;
  const guideBest1RM = guideExercise ? getHistoricalBest1RM(appData.history, guideExercise.id) : 0;

  const activeTabIndex = Math.max(
    0,
    NAV_TABS.findIndex((t) => t.id === activeTab)
  );

  return (
    <div className="min-h-screen bg-concrete-gym text-[#F8FAFC] flex flex-col overflow-x-clip">
      {/* Ultra-Clean Low-Profile Floating Glass Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0D0F14]/85 border-b border-white/[0.07] shadow-[0_12px_32px_-16px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: LIFTLAB Brand Mark */}
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className="btn-tactile whitespace-nowrap shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 rounded-xl"
          >
            <LiftLabLogoIcon className="w-8 h-8 shrink-0" />
            <span className="font-display text-[1.75rem] sm:text-3xl tracking-widest text-[#F8FAFC] leading-none pt-0.5">
              LIFT<span className="text-[#FF4500]">LAB</span>
            </span>
          </button>

          {/* Zone 2: Sleek Inline Desktop Navigation with Glowing Bottom Active Indicator */}
          <nav
            className="hidden md:grid grid-cols-4 relative h-full w-[420px] lg:w-[464px] shrink-0"
            aria-label="เมนูหลัก"
          >
            {/* Glowing Blaze Bottom Active Indicator */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 w-1/4 flex justify-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
              aria-hidden="true"
            >
              <span className="w-16 h-[2.5px] rounded-full bg-[#FF4500] shadow-[0_0_14px_2px_rgba(255,69,0,0.85)]" />
            </div>

            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 h-full px-2.5 text-xs lg:text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                    active
                      ? 'text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      active ? 'text-[#FF4500]' : 'text-[#64748B]'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Solid Tactile Raised Slate Controls (Guide / Sound / Profile / Demo & Data) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setBeginnerGuideOpen(true)}
              aria-label="คู่มือการใช้งาน"
              title="คู่มือการใช้งานสำหรับมือใหม่"
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
              <span>คู่มือ</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? 'ปิดเสียงเอฟเฟกต์ยิม' : 'เปิดเสียงเอฟเฟกต์ยิม'}
              title={soundEnabled ? 'เสียงเอฟเฟกต์เปิดอยู่ (แตะเพื่อปิด)' : 'เสียงเอฟเฟกต์ปิดอยู่ (แตะเพื่อเปิด)'}
              className={`btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 w-9 rounded-xl flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                soundEnabled ? '' : 'opacity-70'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF4500]" /> : <VolumeX className="w-4 h-4 text-[#94A3B8]" />}
            </button>

            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              aria-label="ตั้งค่าโปรไฟล์ผู้ใช้งาน"
              title="ตั้งค่าโปรไฟล์ผู้ใช้งาน (Athlete Profile)"
              className={`btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 w-9 lg:w-auto lg:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70 ${
                appData.profile ? 'ring-1 ring-[#FF4500]/40' : ''
              }`}
            >
              <User className={`w-3.5 h-3.5 shrink-0 ${appData.profile ? 'text-[#FF4500]' : 'text-[#94A3B8]'}`} />
              <span className="hidden lg:inline">
                {appData.profile ? appData.profile.nickname : 'โปรไฟล์'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDataModalOpen(true)}
              aria-label="Demo & ข้อมูล"
              className="btn-tactile btn-cobalt active:scale-[0.98] transition-all h-9 w-9 sm:w-auto sm:px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]/70"
            >
              <Database className="w-3.5 h-3.5 text-[#FF4500] shrink-0" />
              <span className="hidden sm:inline">Demo &amp; ข้อมูล</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container — Razor-Sharp max-w-7xl Alignment Grid */}
      <main
        className={`relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-28 md:pb-12 ${
          activeTab === 'workout' && !appData.activeWorkout ? 'pt-0' : 'pt-5 sm:pt-8'
        }`}
      >
        <div key={activeTab} className="tab-view-enter">
          {activeTab === 'workout' && (
            <WorkoutTab
              activeWorkout={appData.activeWorkout}
              history={appData.history}
              customRoutines={appData.customRoutines}
              profile={appData.profile}
              bonusXp={appData.bonusXp ?? 0}
              finisherCount={appData.finisherCount ?? 0}
              energyMode={energyMode}
              soundEnabled={soundEnabled}
              onChangeEnergyMode={setEnergyMode}
              onClaimFinisherXp={handleClaimFinisherXp}
              onToggleSound={() => setSoundEnabled((v) => !v)}
              onStartEmptyWorkout={handleStartEmptyWorkout}
              onStartFromRoutine={handleStartFromRoutine}
              onQuickStartExercise={handleAddExerciseToWorkout}
              onUpdateWorkoutName={handleUpdateWorkoutName}
              onOpenExercisePicker={() => setWorkoutPickerOpen(true)}
              onSwapExercise={handleSwapExercise}
              onRemoveExercise={handleRemoveExercise}
              onChangeExerciseRest={handleChangeExerciseRest}
              onAddSet={handleAddSet}
              onRemoveSet={handleRemoveSet}
              onUpdateSetField={handleUpdateSetField}
              onCycleSetType={handleCycleSetType}
              onToggleSetComplete={handleToggleSetComplete}
              onFinishWorkout={handleFinishWorkout}
              onDiscardWorkout={handleDiscardWorkout}
              onOpenGuide={(id) => setGuideExerciseId(id)}
              onGoToRoutines={() => setActiveTab('routines')}
              onOpenProfile={() => setProfileModalOpen(true)}
              onChangeGender={handleQuickToggleGender}
              onInspectPeakPR={handleInspectPeakPR}
            />
          )}

          {activeTab === 'routines' && (
            <RoutinesTab
              customRoutines={appData.customRoutines}
              profile={appData.profile}
              onStartRoutine={handleStartFromRoutine}
              onSaveCustomRoutine={handleSaveCustomRoutine}
              onDeleteCustomRoutine={handleDeleteCustomRoutine}
              onOpenGuide={(id) => setGuideExerciseId(id)}
              onOpenProfile={() => setProfileModalOpen(true)}
            />
          )}

          {activeTab === 'exercises' && (
            <ExercisesTab
              history={appData.history}
              onOpenGuide={(id) => setGuideExerciseId(id)}
              onQuickAddToWorkout={(id) => {
                handleAddExerciseToWorkout(id);
                setActiveTab('workout');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              history={appData.history}
              profile={appData.profile}
              initialExerciseId={analyticsInspectTarget?.exerciseId ?? null}
              initialExerciseNonce={analyticsInspectTarget?.nonce ?? 0}
              onConsumeInitialExercise={handleConsumeAnalyticsInspect}
              onOpenDataModal={() => setDataModalOpen(true)}
              onStartWorkout={() => setActiveTab('workout')}
              onDeleteWorkoutLog={handleDeleteWorkoutLog}
              onOpenProfile={() => setProfileModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Flush Native-Style Obsidian Glass Bottom Navigation Dock (Mobile / Tablet) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-t border-white/10 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-2 shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.9)]"
        aria-label="แถบนำทางด้านล่าง"
      >
        <div className="relative grid grid-cols-4 h-[52px] max-w-md mx-auto items-center">
          {/* Crisp Sliding Active Indicator Pill */}
          <div
            className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 w-[calc(25%-1px)] rounded-xl bg-[#1A1D24] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(${activeTabIndex * 100}%)` }}
            aria-hidden="true"
          >
            <span className="absolute inset-x-5 top-0 h-[2.5px] rounded-full bg-[#FF4500] shadow-[0_0_10px_1.5px_rgba(255,69,0,0.9)]" />
          </div>

          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const showActiveSessionDot = tab.id === 'workout' && Boolean(appData.activeWorkout);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 min-h-[48px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl active:scale-95 transition-all ${
                  active
                    ? 'text-[#F8FAFC]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <span className="relative inline-flex items-center justify-center">
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      active ? 'text-[#FF4500] stroke-[2.25]' : 'stroke-[1.75]'
                    }`}
                  />
                  {showActiveSessionDot && (
                    <span
                      className="absolute -top-1 -right-1 flex h-2 w-2 pointer-events-none"
                      aria-hidden="true"
                    >
                      <span className="anim-live-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4500]" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4500] ring-1 ring-[#0A0C10]" />
                    </span>
                  )}
                </span>
                <span className="text-[10.5px] font-semibold leading-none whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Smart Auto Rest Timer with Circular Progress Ring */}
      <RestTimerFloating
        timer={restTimer}
        onAdjust={handleAdjustRest}
        onSkip={handleSkipRest}
      />

      {/* High-Impact NEW PR! Celebration Banner with Championship Gold & Blaze Orange Confetti Burst */}
      <PRCelebrationBanner
        pr={prCelebration}
        onDismiss={() => setPrCelebration(null)}
      />

      {/* Toast Notification (Deferred when PR Celebration Banner is visible) */}
      {toast && !prCelebration && (
        <div
          className="fixed z-50 top-[76px] md:top-[84px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div
            className={`px-4 py-3 rounded-xl backdrop-blur-xl border text-sm font-semibold shadow-2xl flex items-center justify-center gap-2 text-center ${
              toast.tone === 'emerald'
                ? 'bg-[#FACC15] border-[#FACC15] text-[#090A0D]'
                : toast.tone === 'amber'
                  ? 'bg-[#12141A]/96 border-[#FF4500]/45 text-[#F8FAFC]'
                  : 'bg-[#12141A]/96 border-white/[0.08] text-[#F8FAFC]'
            }`}
          >
            {toast.tone === 'emerald' && (
              <Trophy className="w-4 h-4 shrink-0 text-[#090A0D]" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExerciseGuideModal
        exercise={guideExercise}
        best1RM={guideBest1RM}
        profile={appData.profile}
        onClose={() => setGuideExerciseId(null)}
        onAddToWorkout={(id) => {
          handleAddExerciseToWorkout(id);
          setActiveTab('workout');
        }}
      />

      <ExercisePickerModal
        open={workoutPickerOpen}
        title="เพิ่มท่าฝึกลงในเซสชันวันนี้"
        alreadyAddedIds={appData.activeWorkout?.exercises.map((e) => e.exerciseId) ?? []}
        onClose={() => setWorkoutPickerOpen(false)}
        onSelect={handleAddExerciseToWorkout}
      />

      <DataModal
        open={dataModalOpen}
        data={appData}
        onClose={() => setDataModalOpen(false)}
        onLoadDemo={handleLoadDemo}
        onImportData={handleImportData}
        onClearDemoOnly={handleClearDemoOnly}
        onClearAll={handleClearAll}
      />

      <WorkoutSummaryModal
        workout={summaryWorkout}
        onClose={() => setSummaryWorkout(null)}
        onViewAnalytics={() => setActiveTab('analytics')}
      />

      <BeginnerGuideModal
        open={beginnerGuideOpen}
        onClose={() => setBeginnerGuideOpen(false)}
      />

      <AthleteProfileModal
        open={isProfileModalOpen}
        isFirstVisit={isFirstVisitOnboarding && !profileModalOpen}
        initialProfile={appData.profile}
        onSave={handleSaveProfile}
        onSkip={handleSkipProfile}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}
