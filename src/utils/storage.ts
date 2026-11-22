import { AppData, CompletedWorkout } from '../types';

const STORAGE_KEY = 'liftlab_data_v1';

export const DEFAULT_APP_DATA: AppData = {
  version: 1,
  profile: null,
  profileDismissed: false,
  history: [],
  activeWorkout: null,
  customRoutines: [],
  bonusXp: 0,
  finisherCount: 0,
};

function normalizeHistory(rawHistory: unknown): CompletedWorkout[] {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory.map((item) => {
    const workout = item as CompletedWorkout;
    const isDemo =
      typeof workout.isDemo === 'boolean'
        ? workout.isDemo
        : typeof workout.id === 'string' && workout.id.startsWith('demo-');
    const exercises = Array.isArray(workout.exercises)
      ? workout.exercises.map((ex) => ({
          ...ex,
          sets: Array.isArray(ex.sets)
            ? ex.sets.map((s) => ({
                ...s,
                isDemo: typeof s.isDemo === 'boolean' ? s.isDemo : isDemo,
              }))
            : [],
        }))
      : [];
    return {
      ...workout,
      isDemo,
      exercises,
    };
  });
}

function normalizeProfile(rawProfile: unknown): AppData['profile'] {
  if (!rawProfile || typeof rawProfile !== 'object') return null;
  const profile = rawProfile as NonNullable<AppData['profile']>;
  return {
    ...profile,
    isDemo: profile.isDemo === true,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      version: 1,
      profile: normalizeProfile(parsed.profile),
      profileDismissed: Boolean(parsed.profileDismissed),
      history: normalizeHistory(parsed.history),
      activeWorkout: parsed.activeWorkout ?? null,
      customRoutines: Array.isArray(parsed.customRoutines) ? parsed.customRoutines : [],
      bonusXp: typeof parsed.bonusXp === 'number' && Number.isFinite(parsed.bonusXp) ? Math.max(0, parsed.bonusXp) : 0,
      finisherCount:
        typeof parsed.finisherCount === 'number' && Number.isFinite(parsed.finisherCount)
          ? Math.max(0, parsed.finisherCount)
          : 0,
    };
  } catch {
    return DEFAULT_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function exportAppDataToJson(data: AppData): void {
  const payload = JSON.stringify(data, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `liftlab-backup-${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportedAppData(
  rawText: string
): { ok: true; data: AppData } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(rawText) as Partial<AppData>;
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'โครงสร้างไฟล์ JSON ไม่ถูกต้อง' };
    }
    if (!Array.isArray(parsed.history) && !Array.isArray(parsed.customRoutines) && !parsed.profile) {
      return { ok: false, error: 'ไม่พบข้อมูลประวัติการฝึก ตารางฝึก หรือโปรไฟล์ในไฟล์นี้' };
    }
    return {
      ok: true,
      data: {
        version: 1,
        profile: normalizeProfile(parsed.profile),
        profileDismissed: Boolean(parsed.profileDismissed || parsed.profile),
        history: normalizeHistory(parsed.history),
        activeWorkout: parsed.activeWorkout ?? null,
        customRoutines: Array.isArray(parsed.customRoutines) ? parsed.customRoutines : [],
        bonusXp: typeof parsed.bonusXp === 'number' && Number.isFinite(parsed.bonusXp) ? Math.max(0, parsed.bonusXp) : 0,
        finisherCount:
          typeof parsed.finisherCount === 'number' && Number.isFinite(parsed.finisherCount)
            ? Math.max(0, parsed.finisherCount)
            : 0,
      },
    };
  } catch {
    return { ok: false, error: 'ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบไฟล์อีกครั้ง' };
  }
}
