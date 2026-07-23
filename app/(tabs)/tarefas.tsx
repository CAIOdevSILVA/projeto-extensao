import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/app/AppButton';
import { Card } from '@/components/app/Card';
import { EmptyState } from '@/components/app/EmptyState';
import { Screen, ScreenBlock } from '@/components/app/Screen';
import { TaskCard } from '@/components/app/TaskCard';
import { TaskForm } from '@/components/app/TaskForm';
import { STATUSES } from '@/constants/app-data';
import { useApp } from '@/context/AppContext';
import { theme } from '@/theme/app-theme';
import type { Task, TaskStatus } from '@/types/app';

const emptyMessages: Record<TaskStatus, string> = {
  backlog: 'Nenhuma tarefa no Backlog.',
  todo: 'Nenhuma tarefa planejada para fazer nesta semana.',
  doing: 'Você ainda não iniciou nenhuma tarefa.',
  done: 'Nenhuma tarefa concluída por enquanto.',
};

export default function TasksScreen() {
  const params = useLocalSearchParams<{ openForm?: string; planning?: string }>();
  const { state, counts, addTask, updateTask, deleteTask, moveTask, planTask, setWeeklyGoal } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('backlog');
  const [formVisible, setFormVisible] = useState(false);
  const [planningVisible, setPlanningVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [goalDraft, setGoalDraft] = useState(state.weeklyGoal);

  useEffect(() => {
    if (params.openForm === '1') {
      setEditingTask(null);
      setFormVisible(true);
      router.setParams({ openForm: undefined });
    }

    if (params.planning === '1') {
      setPlanningVisible(true);
      router.setParams({ planning: undefined });
    }
  }, [params.openForm, params.planning]);

  useEffect(() => {
    setGoalDraft(state.weeklyGoal);
  }, [state.weeklyGoal]);

  const filteredTasks = useMemo(
    () => state.tasks.filter((task) => task.status === selectedStatus),
    [selectedStatus, state.tasks]
  );

  const backlogTasks = useMemo(() => state.tasks.filter((task) => task.status === 'backlog'), [state.tasks]);

  function handleSaveTask(taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const currentDoing = state.tasks.filter((task) => task.status === 'doing' && task.id !== editingTask?.id).length;
    if (taskInput.status === 'doing' && currentDoing >= 3) {
      Alert.alert(
        'Limite de tarefas',
        'Você já possui três tarefas em andamento. Conclua uma delas antes de iniciar outra.'
      );
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, taskInput);
    } else {
      addTask(taskInput);
    }

    setEditingTask(null);
    setFormVisible(false);
  }

  function confirmDelete(task: Task) {
    Alert.alert('Excluir tarefa', 'Tem certeza de que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          setSelectedTask(null);
        },
      },
    ]);
  }

  function openEdit(task: Task) {
    setSelectedTask(null);
    setEditingTask(task);
    setFormVisible(true);
  }

  return (
    <Screen>
      <ScreenBlock>
        <Text style={styles.title}>Tarefas</Text>
        <Text style={styles.subtitle}>Organize a semana em etapas simples, sem acumular trabalho em andamento.</Text>
      </ScreenBlock>

      <View style={styles.topActions}>
        <AppButton title="Adicionar tarefa" icon="add-circle-outline" onPress={() => setFormVisible(true)} style={styles.topButton} />
        <AppButton
          title="Planejar semana"
          variant="secondary"
          icon="calendar-outline"
          onPress={() => setPlanningVisible(true)}
          style={styles.topButton}
        />
      </View>

      <View style={styles.tabs}>
        {STATUSES.map((status) => {
          const isSelected = status.value === selectedStatus;
          const amount = state.tasks.filter((task) => task.status === status.value).length;
          return (
            <Pressable
              key={status.value}
              accessibilityRole="button"
              onPress={() => setSelectedStatus(status.value)}
              style={[styles.statusTab, isSelected && styles.statusTabSelected]}>
              <Text style={[styles.statusText, isSelected && styles.statusTextSelected]}>{status.label}</Text>
              <Text style={[styles.statusCount, isSelected && styles.statusTextSelected]}>{amount}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedStatus === 'doing' ? (
        <Text style={styles.wipText}>Limite WIP: até 3 tarefas em andamento. Atual: {counts.doing}/3.</Text>
      ) : null}

      <View style={styles.list}>
        {filteredTasks.length === 0 ? (
          <EmptyState message={emptyMessages[selectedStatus]} icon="albums-outline" />
        ) : (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} onPress={() => setSelectedTask(task)} />)
        )}
      </View>

      <TaskForm
        visible={formVisible}
        task={editingTask}
        onClose={() => {
          setFormVisible(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      <TaskDetails
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={confirmDelete}
        onEdit={openEdit}
        onMove={(task, direction) => {
          const moved = moveTask(task.id, direction);
          if (moved) {
            setSelectedTask(null);
          }
        }}
      />

      <Modal animationType="slide" visible={planningVisible} presentationStyle="pageSheet" onRequestClose={() => setPlanningVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Planejar semana</Text>
            <Pressable accessibilityRole="button" onPress={() => setPlanningVisible(false)} hitSlop={12}>
              <Text style={styles.close}>Fechar</Text>
            </Pressable>
          </View>

          <Text style={styles.guidance}>Escolha apenas as tarefas mais importantes e que realmente podem ser concluídas nesta semana.</Text>

          <Card style={styles.planGoalCard}>
            <Text style={styles.label}>Meta da semana</Text>
            <TextInput
              value={goalDraft}
              onChangeText={setGoalDraft}
              onBlur={() => setWeeklyGoal(goalDraft.trim())}
              placeholder="Defina a meta desta sprint"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={styles.goalInput}
            />
            <AppButton title="Salvar meta" variant="secondary" onPress={() => setWeeklyGoal(goalDraft.trim())} />
          </Card>

          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {backlogTasks.length === 0 ? (
              <EmptyState message="Não há tarefas no Backlog para planejar." icon="calendar-outline" />
            ) : (
              backlogTasks.map((task) => (
                <Card key={task.id} style={styles.planningTask}>
                  <View style={styles.planningText}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>{task.category} • {task.recommendedDay}</Text>
                  </View>
                  <Pressable accessibilityRole="button" onPress={() => planTask(task.id)} style={styles.planButton}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                  </Pressable>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

function TaskDetails({
  task,
  onClose,
  onEdit,
  onDelete,
  onMove,
}: {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, direction: 'next' | 'previous') => void;
}) {
  if (!task) {
    return null;
  }

  const currentIndex = STATUSES.findIndex((status) => status.value === task.status);

  return (
    <Modal animationType="slide" visible={Boolean(task)} presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Detalhes da tarefa</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Fechar</Text>
          </Pressable>
        </View>

        <Card style={styles.detailsCard}>
          <Text style={styles.detailTitle}>{task.title}</Text>
          <Detail label="Descrição" value={task.description || 'Sem descrição.'} />
          <Detail label="Categoria" value={task.category} />
          <Detail label="Prioridade" value={task.priority} />
          <Detail label="Dia recomendado" value={task.recommendedDay} />
          <Detail label="Status" value={STATUSES.find((status) => status.value === task.status)?.label ?? task.status} />
        </Card>

        <View style={styles.actions}>
          <AppButton
            title="Voltar etapa"
            variant="secondary"
            icon="arrow-back-outline"
            disabled={currentIndex === 0}
            onPress={() => onMove(task, 'previous')}
          />
          <AppButton
            title="Avançar etapa"
            icon="arrow-forward-outline"
            disabled={currentIndex === STATUSES.length - 1}
            onPress={() => onMove(task, 'next')}
          />
          <AppButton title="Editar" variant="secondary" icon="create-outline" onPress={() => onEdit(task)} />
          <AppButton title="Excluir" variant="danger" icon="trash-outline" onPress={() => onDelete(task)} />
        </View>
      </View>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  topButton: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  statusTab: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  statusTabSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSoft,
  },
  statusText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  statusTextSelected: {
    color: theme.colors.primaryDark,
  },
  statusCount: {
    color: theme.colors.muted,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  wipText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  close: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  detailsCard: {
    gap: 14,
  },
  detailTitle: {
    color: theme.colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },
  detail: {
    gap: 3,
  },
  detailLabel: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
  },
  guidance: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  planGoalCard: {
    gap: 10,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  goalInput: {
    minHeight: 78,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFDFB',
    color: theme.colors.text,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  planningTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planningText: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  taskMeta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  planButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
});
