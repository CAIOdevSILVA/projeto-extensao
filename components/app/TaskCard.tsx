import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/app/Card';
import { theme } from '@/theme/app-theme';
import type { Task, TaskPriority } from '@/types/app';

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

const priorityColors: Record<TaskPriority, string> = {
  Alta: theme.colors.danger,
  Média: theme.colors.warning,
  Baixa: theme.colors.low,
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <View style={[styles.badge, { borderColor: priorityColors[priority] }]}>
      <Text style={[styles.badgeText, { color: priorityColors[priority] }]}>{priority}</Text>
    </View>
  );
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{task.title}</Text>
          <PriorityBadge priority={task.priority} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{task.category}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{task.recommendedDay}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  dot: {
    color: theme.colors.border,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
