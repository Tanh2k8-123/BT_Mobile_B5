import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme/colors';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Đang mở tập san bài giảng…',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.bookIconWrap}>
          <Text style={styles.bookIcon}>📖</Text>
        </View>
        <ActivityIndicator size="large" color={Colors.evergreen} style={styles.spinner} />
        <Text style={styles.kicker}>SỔ TAY HỌC TẬP</Text>
        <Text accessibilityLiveRegion="polite" style={styles.text}>
          {message}
        </Text>
        <Text style={styles.subtext}>Đang tải dữ liệu từ máy chủ khóa học</Text>
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
    backgroundColor: Colors.paperCard,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
    maxWidth: 380,
    width: '100%',
  },
  bookIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bookIcon: {
    fontSize: 28,
  },
  spinner: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  text: {
    fontFamily: Fonts.serif,
    fontSize: 16,
    color: Colors.ink,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
});
