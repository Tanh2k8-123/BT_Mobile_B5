import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme/colors';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  onConfigureApi?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Đã có lỗi xảy ra khi kết nối máy chủ.',
  onRetry,
  onConfigureApi,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>

        <Text style={styles.kicker}>THÔNG BÁO HỆ THỐNG</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Không thể đồng bộ hồ sơ
        </Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Thử kết nối lại"
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>↺ Thử kết nối lại</Text>
            </TouchableOpacity>
          )}

          {onConfigureApi && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cấu hình MockAPI URL"
              style={styles.configButton}
              onPress={onConfigureApi}
              activeOpacity={0.85}
            >
              <Text style={styles.configButtonText}>⚙ Đổi MockAPI URL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.paper,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.paperCard,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconText: {
    fontSize: 28,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.coral,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    backgroundColor: Colors.evergreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: Colors.evergreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: Colors.paper,
    fontWeight: '700',
    fontSize: 14,
  },
  configButton: {
    backgroundColor: Colors.paperWarm,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  configButtonText: {
    color: Colors.ink,
    fontWeight: '600',
    fontSize: 14,
  },
});
