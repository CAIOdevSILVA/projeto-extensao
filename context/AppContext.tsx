import { Alert } from 'react-native';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { EMPTY_REVIEW } from '@/constants/app-data';
import { createInitialState, loadAppState, saveAppState } from '@/lib/storage';
import { createId, getCurrentWeekPeriod } from '@/lib/week';
import type { AppState, ReviewAnswers, Task, TaskStatus } from '@/types/app';

type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

type AppContextValue = {
  state: AppState;
  isReady: boolean;
  setWeeklyGoal: (goal: string) => void;
  setReview: (review: ReviewAnswers) => void;
  addTask: (task: TaskInput) => void;
  updateTask: (id: string, task: TaskInput) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, direction: 'next' | 'previous') => boolean;
  planTask: (id: string) => void;
  finishWeek: (review?: ReviewAnswers) => void;
  counts: {
    planned: number;
    completed: number;
    doing: number;
    pending: number;
    completionPercent: number;
  };
};

const AppContext = createContext<AppContextValue | null>(null);

const statusFlow: TaskStatus[] = ['backlog', 'todo', 'doing', 'done'];

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadAppState()
      .then((loadedState) => {
        setState({
          ...loadedState,
          weekPeriod: getCurrentWeekPeriod(),
        });
      })
      .catch(() => {
        Alert.alert('Não foi possível carregar os dados salvos.');
      })
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (isReady) {
      saveAppState(state).catch(() => {
        Alert.alert('Não foi possível salvar os dados no aparelho.');
      });
    }
  }, [isReady, state]);

  const counts = useMemo(() => {
    const plannedTasks = state.tasks.filter((task) => task.status !== 'backlog');
    const completed = plannedTasks.filter((task) => task.status === 'done').length;
    const doing = state.tasks.filter((task) => task.status === 'doing').length;
    const planned = plannedTasks.length;

    return {
      planned,
      completed,
      doing,
      pending: planned - completed,
      completionPercent: planned === 0 ? 0 : Math.round((completed / planned) * 100),
    };
  }, [state.tasks]);

  function patchState(updater: (current: AppState) => AppState) {
    setState((current) => updater(current));
  }

  function addTask(task: TaskInput) {
    const now = new Date().toISOString();
    patchState((current) => ({
      ...current,
      tasks: [
        {
          ...task,
          id: createId('task'),
          createdAt: now,
          updatedAt: now,
        },
        ...current.tasks,
      ],
    }));
  }

  function updateTask(id: string, task: TaskInput) {
    patchState((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === id ? { ...item, ...task, updatedAt: new Date().toISOString() } : item
      ),
    }));
  }

  function deleteTask(id: string) {
    patchState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));
  }

  function canMoveToDoing(current: AppState, id: string) {
    return current.tasks.filter((task) => task.status === 'doing' && task.id !== id).length < 3;
  }

  function moveTask(id: string, direction: 'next' | 'previous') {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) {
      return false;
    }

    const currentIndex = statusFlow.indexOf(task.status);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const nextStatus = statusFlow[nextIndex];

    if (!nextStatus) {
      return false;
    }

    if (nextStatus === 'doing' && !canMoveToDoing(state, id)) {
      Alert.alert(
        'Limite de tarefas',
        'Você já possui três tarefas em andamento. Conclua uma delas antes de iniciar outra.'
      );
      return false;
    }

    patchState((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item
      ),
    }));

    return true;
  }

  function planTask(id: string) {
    patchState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === id ? { ...task, status: 'todo', updatedAt: new Date().toISOString() } : task
      ),
    }));
  }

  function finishWeek(reviewOverride?: ReviewAnswers) {
    patchState((current) => {
      const plannedTasks = current.tasks.filter((task) => task.status !== 'backlog');
      const completedTasks = plannedTasks.filter((task) => task.status === 'done');
      const completionPercent =
        plannedTasks.length === 0 ? 0 : Math.round((completedTasks.length / plannedTasks.length) * 100);
      const finishedAt = new Date().toISOString();

      return {
        ...current,
        weekPeriod: getCurrentWeekPeriod(),
        weeklyGoal: '',
        review: EMPTY_REVIEW,
        tasks: current.tasks
          .filter((task) => task.status !== 'done')
          .map((task) => ({
            ...task,
            status: 'backlog',
            updatedAt: finishedAt,
          })),
        history: [
          {
            id: createId('week'),
            period: current.weekPeriod,
            goal: current.weeklyGoal,
            plannedCount: plannedTasks.length,
            completedCount: completedTasks.length,
            completionPercent,
            completedTasks,
            review: reviewOverride ?? current.review,
            finishedAt,
          },
          ...current.history,
        ],
      };
    });
  }

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      isReady,
      setWeeklyGoal: (weeklyGoal) => patchState((current) => ({ ...current, weeklyGoal })),
      setReview: (review) => patchState((current) => ({ ...current, review })),
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      planTask,
      finishWeek,
      counts,
    }),
    [counts, isReady, state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp precisa ser usado dentro de AppProvider');
  }

  return context;
}
