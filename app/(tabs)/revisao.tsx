import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/app/AppButton';
import { Card } from '@/components/app/Card';
import { EmptyState } from '@/components/app/EmptyState';
import { Screen, ScreenBlock } from '@/components/app/Screen';
import { useApp } from '@/context/AppContext';
import { theme } from '@/theme/app-theme';
import type { ReviewAnswers } from '@/types/app';

export default function ReviewScreen() {
  const { state, counts, setReview, finishWeek } = useApp();
  const [draft, setDraft] = useState<ReviewAnswers>(state.review);

  useEffect(() => {
    setDraft(state.review);
  }, [state.review]);

  function saveReview() {
    setReview(draft);
    Alert.alert('Revisão salva', 'Suas respostas foram guardadas neste aparelho.');
  }

  function confirmFinishWeek() {
    Alert.alert(
      'Finalizar semana',
      'Deseja finalizar esta semana? As tarefas pendentes voltarão para o Backlog.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            finishWeek(draft);
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <ScreenBlock>
        <Text style={styles.title}>Revisão</Text>
        <Text style={styles.subtitle}>Feche a sprint da semana com uma retrospectiva simples.</Text>
      </ScreenBlock>

      <Card style={styles.summary}>
        <Text style={styles.summaryTitle}>{state.weekPeriod}</Text>
        <View style={styles.summaryGrid}>
          <Metric label="Planejadas" value={counts.planned} />
          <Metric label="Concluídas" value={counts.completed} />
          <Metric label="Pendentes" value={counts.pending} />
          <Metric label="Concluído" value={`${counts.completionPercent}%`} />
        </View>
      </Card>

      {counts.planned === 0 ? (
        <EmptyState message="Planeje algumas tarefas para conseguir revisar a semana." icon="checkbox-outline" />
      ) : null}

      <ReviewField
        label="O que funcionou bem nesta semana?"
        value={draft.workedWell}
        onChangeText={(workedWell) => setDraft((current) => ({ ...current, workedWell }))}
      />
      <ReviewField
        label="O que dificultou a realização das tarefas?"
        value={draft.obstacles}
        onChangeText={(obstacles) => setDraft((current) => ({ ...current, obstacles }))}
      />
      <ReviewField
        label="O que pode ser melhorado na próxima semana?"
        value={draft.improvements}
        onChangeText={(improvements) => setDraft((current) => ({ ...current, improvements }))}
      />

      <View style={styles.actions}>
        <AppButton title="Salvar respostas" variant="secondary" icon="save-outline" onPress={saveReview} />
        <AppButton title="Finalizar semana" icon="flag-outline" onPress={confirmFinishWeek} />
      </View>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ReviewField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <Card style={styles.fieldCard}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Escreva uma resposta curta"
        placeholderTextColor={theme.colors.muted}
        multiline
        style={styles.input}
      />
    </Card>
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
  summary: {
    gap: 14,
  },
  summaryTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '47%',
    minHeight: 74,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSoft,
    padding: 12,
    justifyContent: 'center',
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  fieldCard: {
    gap: 10,
  },
  label: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  input: {
    minHeight: 92,
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
