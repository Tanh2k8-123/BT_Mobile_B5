import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CourseWithCategory } from '../types/course';
import { Colors, Fonts } from '../theme/colors';
import { CategoryBadge } from './CategoryBadge';

interface CourseCardProps {
  course: CourseWithCategory;
  onPress: () => void;
}

export function formatVnd(amount: number): string {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  } catch {
    return `${amount.toLocaleString()} đ`;
  }
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Xem giáo trình khóa học: ${course.title}. Giảng viên: ${course.instructor}. Học phí: ${formatVnd(course.price)}.`}
      accessibilityHint="Nhấn để mở trang chi tiết và giáo trình khóa học"
    >
      {/* Top accent book ribbon */}
      <View style={styles.topRibbon} />

      {/* Image Thumbnail Container */}
      <View style={styles.thumbnailContainer}>
        {course.thumbnail && !imageError ? (
          <Image
            source={{ uri: course.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
            accessible
            accessibilityLabel={`Ảnh bìa khóa học ${course.title}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <View style={styles.placeholderIconRing}>
              <Text style={styles.placeholderText}>📖</Text>
            </View>
            <Text style={styles.placeholderLabel}>Tập san bài giảng</Text>
          </View>
        )}

        {/* Study Duration Ribbon */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationIcon}>⏱</Text>
          <Text style={styles.durationText}>{course.duration} GIỜ</Text>
        </View>

        {/* Course ID Tag */}
        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{String(course.id).padStart(2, '0')}</Text>
        </View>
      </View>

      {/* Card Content Body */}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          <CategoryBadge name={course.categoryName || `Danh mục #${course.categoryId}`} size="small" />
          <Text style={styles.deckNumber}>HỌC PHẦN</Text>
        </View>

        <Text accessibilityRole="header" style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Instructor Editorial Signature */}
        <View style={styles.instructorRow}>
          <View style={styles.instructorSeal}>
            <Text style={styles.instructorSealText}>GV</Text>
          </View>
          <View style={styles.instructorTextWrap}>
            <Text style={styles.instructorLabel}>Người hướng dẫn</Text>
            <Text style={styles.instructorName} numberOfLines={1}>
              {course.instructor}
            </Text>
          </View>
        </View>

        {/* Ledger Footer */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Học phí đăng ký</Text>
            <Text style={styles.price}>{formatVnd(course.price)}</Text>
          </View>

          <View style={styles.actionBtn}>
            <Text style={styles.viewDetail}>Chi tiết</Text>
            <Text style={styles.viewArrow}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.paperCard,
    borderRadius: 22,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  topRibbon: {
    height: 3,
    backgroundColor: Colors.sage,
  },
  thumbnailContainer: {
    width: '100%',
    height: 195,
    backgroundColor: Colors.paperWarm,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.paperWarm,
  },
  placeholderIconRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 26,
  },
  placeholderLabel: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.evergreenDark,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  durationIcon: {
    color: Colors.lime,
    fontSize: 10,
  },
  durationText: {
    color: Colors.lime,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  idBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(20, 38, 33, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  idText: {
    color: Colors.paper,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 18,
    backgroundColor: Colors.paperCard,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deckNumber: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkSubtle,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 24,
    minHeight: 48,
    marginBottom: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.paperLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  instructorSeal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.evergreenLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  instructorSealText: {
    color: Colors.evergreen,
    fontSize: 10,
    fontWeight: '800',
  },
  instructorTextWrap: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 9,
    color: Colors.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  instructorName: {
    fontSize: 13,
    color: Colors.ink,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.paperBorder,
    paddingTop: 12,
  },
  priceContainer: {},
  priceLabel: {
    fontSize: 9,
    color: Colors.inkSubtle,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.evergreen,
    letterSpacing: -0.2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  viewDetail: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.evergreen,
  },
  viewArrow: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coral,
  },
});
