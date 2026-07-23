import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/app/AppButton';
import { Card } from '@/components/app/Card';
import { Screen, ScreenBlock } from '@/components/app/Screen';
import { useApp } from '@/context/AppContext';
import { theme } from '@/theme/app-theme';

export default function HomeScreen() {
  const { state, counts, setWeeklyGoal, isReady } = useApp();
  const [goalDraft, setGoalDraft] = useState(state.weeklyGoal);

  useEffect(() => {
    setGoalDraft(state.weeklyGoal);
  }, [state.weeklyGoal]);

  function saveGoal() {
    setWeeklyGoal(goalDraft.trim());
  }

  if (!isReady) {
    return (
      <Screen>
        <Text style={styles.loading}>Carregando organização do salão...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenBlock>
        <Text style={styles.appName}>Salão Ágil</Text>
        <Text style={styles.subtitle}>Organização simples para uma semana mais tranquila.</Text>
      </ScreenBlock>

      <Card style={styles.hero}>
        <Text style={styles.period}>Semana atual</Text>
        <Text style={styles.periodValue}>{state.weekPeriod}</Text>
        <Text style={styles.message}>
          Organize as tarefas do salão e prepare tudo com tranquilidade para os atendimentos do fim de semana.
        </Text>
      </Card>

      <View style={styles.statsGrid}>
        <StatCard label="Planejadas" value={counts.planned} />
        <StatCard label="Concluídas" value={counts.completed} />
        <StatCard label="Em andamento" value={counts.doing} />
        <StatCard label="Conclusão" value={`${counts.completionPercent}%`} />
      </View>

      <Card style={styles.goalCard}>
        <Text style={styles.sectionTitle}>Meta da semana</Text>
        <TextInput
          value={goalDraft}
          onChangeText={setGoalDraft}
          onBlur={saveGoal}
          placeholder="Defina uma meta simples para esta semana"
          placeholderTextColor={theme.colors.muted}
          multiline
          style={styles.goalInput}
        />
        <AppButton title="Salvar meta" variant="secondary" icon="save-outline" onPress={saveGoal} />
      </Card>

      <View style={styles.actions}>
        <AppButton
          title="Adicionar tarefa"
          icon="add-circle-outline"
          onPress={() => router.push({ pathname: '/tarefas', params: { openForm: '1' } })}
        />
        <AppButton
          title="Planejar semana"
          variant="secondary"
          icon="calendar-outline"
          onPress={() => router.push({ pathname: '/tarefas', params: { planning: '1' } })}
        />
      </View>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: {
    color: theme.colors.muted,
    fontSize: 16,
  },
  appName: {
    color: theme.colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  hero: {
    backgroundColor: theme.colors.surfaceSoft,
    gap: 8,
  },
  period: {
    color: theme.colors.primaryDark,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  periodValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  message: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    minHeight: 92,
    justifyContent: 'center',
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  goalCard: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  goalInput: {
    minHeight: 84,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFDFB',
    color: theme.colors.text,
    padding: 12,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  actions: {
    gap: 10,
  },
});
