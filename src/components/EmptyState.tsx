import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📚',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={styles.kicker}>HỌC VIỆN MỞ · THƯ VIỆN KHÓA HỌC</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>

        {description ? <Text style={styles.description}>{description}</Text> : null}

        {actionLabel && onAction ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={styles.button}
            onPress={onAction}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.paperCard,
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  kicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 320,
  },
  button: {
    backgroundColor: Colors.evergreen,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: Colors.evergreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: Colors.paper,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
