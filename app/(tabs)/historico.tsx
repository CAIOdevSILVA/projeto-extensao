import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/app/Card';
import { EmptyState } from '@/components/app/EmptyState';
import { Screen, ScreenBlock } from '@/components/app/Screen';
import { useApp } from '@/context/AppContext';
import { theme } from '@/theme/app-theme';
import type { WeekHistory } from '@/types/app';

export default function HistoryScreen() {
  const { state } = useApp();
  const [selectedWeek, setSelectedWeek] = useState<WeekHistory | null>(null);

  return (
    <Screen>
      <ScreenBlock>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Acompanhe as semanas encerradas e a evolução do salão.</Text>
      </ScreenBlock>

      {state.history.length === 0 ? (
        <EmptyState message="Finalize sua primeira semana para acompanhar sua evolução aqui." icon="time-outline" />
      ) : (
        <View style={styles.list}>
          {state.history.map((week) => (
            <Pressable key={week.id} onPress={() => setSelectedWeek(week)} style={({ pressed }) => pressed && styles.pressed}>
              <Card style={styles.weekCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.period}>{week.period}</Text>
                  <Text style={styles.percent}>{week.completionPercent}%</Text>
                </View>
                <Text style={styles.goal}>{week.goal || 'Semana sem meta registrada.'}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{week.plannedCount} planejadas</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.meta}>{week.completedCount} concluídas</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      <WeekDetails week={selectedWeek} onClose={() => setSelectedWeek(null)} />
    </Screen>
  );
}

function WeekDetails({ week, onClose }: { week: WeekHistory | null; onClose: () => void }) {
  if (!week) {
    return null;
  }

  return (
    <Modal animationType="slide" visible={Boolean(week)} presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Semana encerrada</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Fechar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          <Card style={styles.detailsCard}>
            <Text style={styles.period}>{week.period}</Text>
            <Text style={styles.goal}>{week.goal || 'Semana sem meta registrada.'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{week.plannedCount} tarefas planejadas</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.meta}>{week.completedCount} concluídas</Text>
            </View>
          </Card>

          <Card style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Tarefas concluídas</Text>
            {week.completedTasks.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma tarefa foi concluída nesta semana.</Text>
            ) : (
              week.completedTasks.map((task) => (
                <View key={task.id} style={styles.taskLine}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>{task.category} • {task.priority}</Text>
                </View>
              ))
            )}
          </Card>

          <Card style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Retrospectiva</Text>
            <Retro label="O que funcionou bem" value={week.review.workedWell} />
            <Retro label="Dificuldades" value={week.review.obstacles} />
            <Retro label="Melhorias" value={week.review.improvements} />
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Retro({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.retro}>
      <Text style={styles.retroLabel}>{label}</Text>
      <Text style={styles.retroValue}>{value || 'Sem resposta registrada.'}</Text>
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
  list: {
    gap: 10,
  },
  pressed: {
    opacity: 0.78,
  },
  weekCard: {
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  period: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  percent: {
    color: theme.colors.success,
    fontSize: 22,
    fontWeight: '900',
  },
  goal: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  meta: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  dot: {
    color: theme.colors.border,
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
  modalContent: {
    gap: 14,
    paddingBottom: 20,
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
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  taskLine: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 10,
    gap: 2,
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
  retro: {
    gap: 4,
  },
  retroLabel: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  retroValue: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
