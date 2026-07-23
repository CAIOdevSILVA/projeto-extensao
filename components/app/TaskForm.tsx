import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/app/AppButton';
import { CATEGORIES, PRIORITIES, RECOMMENDED_DAYS, STATUSES } from '@/constants/app-data';
import { theme } from '@/theme/app-theme';
import type { RecommendedDay, Task, TaskCategory, TaskPriority, TaskStatus } from '@/types/app';

type TaskFormValue = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

type TaskFormProps = {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (task: TaskFormValue) => void;
};

const initialForm: TaskFormValue = {
  title: '',
  description: '',
  category: 'Estoque',
  priority: 'Média',
  recommendedDay: 'Sem dia definido',
  status: 'backlog',
};

export function TaskForm({ visible, task, onClose, onSave }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? initialForm.title);
  const [description, setDescription] = useState(task?.description ?? initialForm.description);
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? initialForm.category);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? initialForm.priority);
  const [recommendedDay, setRecommendedDay] = useState<RecommendedDay>(task?.recommendedDay ?? initialForm.recommendedDay);
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? initialForm.status);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(task?.title ?? initialForm.title);
      setDescription(task?.description ?? initialForm.description);
      setCategory(task?.category ?? initialForm.category);
      setPriority(task?.priority ?? initialForm.priority);
      setRecommendedDay(task?.recommendedDay ?? initialForm.recommendedDay);
      setStatus(task?.status ?? initialForm.status);
      setShowError(false);
    }
  }, [task, visible]);

  function handleSave() {
    if (!title.trim()) {
      setShowError(true);
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      recommendedDay,
      status,
    });
  }

  return (
    <Modal animationType="slide" visible={visible} presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{task ? 'Editar tarefa' : 'Nova tarefa'}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Fechar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>Nome da tarefa</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Confirmar clientes"
              placeholderTextColor={theme.colors.muted}
              style={[styles.input, showError && styles.inputError]}
            />
            {showError ? <Text style={styles.error}>Informe o nome da tarefa.</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Detalhes importantes, se houver"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={[styles.input, styles.textArea]}
            />
          </View>

          <ChoiceGroup label="Categoria" options={CATEGORIES} value={category} onChange={setCategory} />
          <ChoiceGroup label="Prioridade" options={PRIORITIES} value={priority} onChange={setPriority} />
          <ChoiceGroup label="Dia recomendado" options={RECOMMENDED_DAYS} value={recommendedDay} onChange={setRecommendedDay} />
          <ChoiceGroup
            label="Status inicial"
            options={task ? STATUSES.map((item) => item.value) : ['backlog', 'todo']}
            labels={{ backlog: 'Backlog', todo: 'A fazer', doing: 'Em andamento', done: 'Concluído' }}
            value={status}
            onChange={(value) => setStatus(value as TaskStatus)}
          />
        </ScrollView>

        <View style={styles.actions}>
          <AppButton title="Cancelar" variant="secondary" onPress={onClose} style={styles.action} />
          <AppButton title="Salvar tarefa" icon="checkmark-circle-outline" onPress={handleSave} style={styles.action} />
        </View>
      </View>
    </Modal>
  );
}

type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
};

function ChoiceGroup<T extends string>({ label, options, value, onChange, labels }: ChoiceGroupProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => onChange(option)}
              style={[styles.choice, selected && styles.choiceSelected]}>
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{labels?.[option] ?? option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  close: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 16,
    paddingBottom: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSoft,
  },
  choiceText: {
    color: theme.colors.muted,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: theme.colors.primaryDark,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
  },
  action: {
    flex: 1,
  },
});
