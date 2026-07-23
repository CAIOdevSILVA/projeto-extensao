import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_REVIEW, INITIAL_GOAL, INITIAL_TASKS } from '@/constants/app-data';
import type { AppState } from '@/types/app';
import { getCurrentWeekPeriod } from '@/lib/week';

const STORAGE_KEY = '@salao-agil/state';

export function createInitialState(): AppState {
  return {
    initialized: true,
    weekPeriod: getCurrentWeekPeriod(),
    weeklyGoal: INITIAL_GOAL,
    review: EMPTY_REVIEW,
    tasks: INITIAL_TASKS,
    history: [],
  };
}

export async function loadAppState(): Promise<AppState> {
  const rawState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    const initialState = createInitialState();
    await saveAppState(initialState);
    return initialState;
  }

  return normalizeState(JSON.parse(rawState));
}

export async function saveAppState(state: AppState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(value: unknown): AppState {
  if (!value || typeof value !== 'object') {
    return createInitialState();
  }

  const state = value as Partial<AppState>;

  return {
    initialized: true,
    weekPeriod: typeof state.weekPeriod === 'string' ? state.weekPeriod : getCurrentWeekPeriod(),
    weeklyGoal: typeof state.weeklyGoal === 'string' ? state.weeklyGoal : INITIAL_GOAL,
    review: {
      workedWell: state.review?.workedWell ?? '',
      obstacles: state.review?.obstacles ?? '',
      improvements: state.review?.improvements ?? '',
    },
    tasks: Array.isArray(state.tasks) ? state.tasks : INITIAL_TASKS,
    history: Array.isArray(state.history) ? state.history : [],
  };
}
