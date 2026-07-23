import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '@/theme/app-theme';

type EmptyStateProps = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ message, icon = 'sparkles-outline' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={26} color={theme.colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 24,
    backgroundColor: '#FFFDFB',
  },
  text: {
    color: theme.colors.muted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
