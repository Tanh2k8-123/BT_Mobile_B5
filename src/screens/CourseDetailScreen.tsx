import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  CourseDetailRouteProp,
  CourseDetailNavigationProp,
} from '../types/navigation';
import { Course } from '../types/course';
import { Category } from '../types/category';
import { getCourseById, getCategories, deleteCourse } from '../services/api';
import { Colors, Fonts } from '../theme/colors';
import { formatVnd } from '../components/CourseCard';
import { CategoryBadge } from '../components/CategoryBadge';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { VideoPlayerModal } from '../components/VideoPlayerModal';

function formatCreatedAt(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || 'Mới cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const CourseDetailScreen: React.FC = () => {
  const route = useRoute<CourseDetailRouteProp>();
  const navigation = useNavigation<CourseDetailNavigationProp>();
  const { courseId } = route.params;

  const [course, setCourse] = useState<Course | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCourse, categories] = await Promise.all([
        getCourseById(courseId),
        getCategories(),
      ]);
      setCourse(fetchedCourse);

      // Tra cứu tên danh mục từ API categories
      const matchedCat = categories.find(c => String(c.id) === String(fetchedCourse.categoryId));
      setCategoryName(matchedCat ? matchedCat.name : `Danh mục #${fetchedCourse.categoryId}`);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin chi tiết khóa học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [fetchDetails])
  );

  const handleDelete = () => {
    if (!course) return;

    Alert.alert(
      'Xác nhận xóa khóa học',
      `Bạn có chắc chắn muốn xóa khóa học "${course.title}"? Dữ liệu trên MockAPI sẽ bị xóa hoàn toàn.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCourse(course.id);
              Alert.alert('Thành công', 'Đã xóa khóa học thành công.', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (err: any) {
              Alert.alert('Lỗi khi xóa', err.message || 'Không thể xóa khóa học.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (!course) return;
    navigation.navigate('CourseForm', {
      courseId: course.id,
      initialCourse: course,
    });
  };

  if (loading) {
    return <LoadingView message="Đang mở hồ sơ học phần từ thư viện…" />;
  }

  if (error || !course) {
    return (
      <ErrorView
        message={error || 'Không tìm thấy dữ liệu khóa học'}
        onRetry={fetchDetails}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Editorial Book Jacket Hero Banner */}
        <View style={styles.bannerContainer}>
          {course.thumbnail && !imageError ? (
            <Image
              source={{ uri: course.thumbnail }}
              style={styles.bannerImage}
              resizeMode="cover"
              accessible
              accessibilityLabel={`Ảnh bìa bài giảng: ${course.title}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <View style={styles.bannerPlaceholderRing}>
                <Text style={styles.bannerPlaceholderIcon}>📖</Text>
              </View>
              <Text style={styles.bannerPlaceholderText}>Tập san bài giảng trực tuyến</Text>
            </View>
          )}

          {/* Dossier Bookmark Ribbon */}
          <View style={styles.bookmarkRibbon}>
            <Text style={styles.bookmarkText}>HỒ SƠ #{course.id}</Text>
          </View>

          {/* Nút Play nhanh trên banner nếu có trailer */}
          {course.trailerUrl ? (
            <TouchableOpacity
              style={styles.floatingPlayBtn}
              onPress={() => setVideoModalVisible(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Phát video trailer khóa học ${course.title}`}
              accessibilityHint="Mở cửa sổ trình phát video giới thiệu"
            >
              <Text style={styles.floatingPlayIcon}>▶</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Editorial Dossier Body Card */}
        <View style={styles.body}>
          {/* Metadata Topline */}
          <View style={styles.metaRow}>
            <CategoryBadge name={categoryName} size="medium" />
            <View style={styles.dateBadge}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.createdAt}>{formatCreatedAt(course.createdAt)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text accessibilityRole="header" style={styles.title}>
            {course.title}
          </Text>

          {/* Tuition Fee Ledger Box */}
          <View style={styles.priceContainer}>
            <View style={styles.priceLeft}>
              <Text style={styles.priceLabel}>HỌC PHÍ KHÓA HỌC</Text>
            </View>
            <Text style={styles.priceValue}>{formatVnd(course.price)}</Text>
          </View>

          {/* Academic Highlight Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Text style={styles.infoIcon}>👨‍🏫</Text>
              </View>
              <Text style={styles.infoLabel}>Giảng viên</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {course.instructor}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Text style={styles.infoIcon}>⏱️</Text>
              </View>
              <Text style={styles.infoLabel}>Thời lượng</Text>
              <Text style={styles.infoValue}>{course.duration} giờ học</Text>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Text style={styles.infoIcon}>📜</Text>
              </View>
              <Text style={styles.infoLabel}>Mã học phần</Text>
              <Text style={styles.infoValue}>#{course.id}</Text>
            </View>
          </View>

          {/* Trailer CTA Banner */}
          <TouchableOpacity
            style={styles.trailerButton}
            onPress={() => setVideoModalVisible(true)}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Xem trailer giới thiệu: ${course.title}`}
          >
            <View style={styles.trailerIconWrap}>
              <Text style={styles.trailerButtonIcon}>▶</Text>
            </View>
            <View style={styles.trailerButtonTextWrap}>
              <Text style={styles.trailerButtonTitle}>Xem video giới thiệu khóa học</Text>
              <Text style={styles.trailerButtonSubtitle}>
                Trình phát bài giảng tương thích đa nền tảng
              </Text>
            </View>
            <Text style={styles.trailerArrow}>›</Text>
          </TouchableOpacity>

          {/* Curriculum Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionKicker}>GIÁO TRÌNH HỌC PHẦN</Text>
              <Text style={styles.sectionTitle}>Giới thiệu & mục tiêu khóa học</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{course.description}</Text>
            </View>
          </View>

          {/* Action buttons: Sửa / Xóa */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa thông tin khóa học"
            >
              <Text style={styles.editButtonIcon}>✏️</Text>
              <Text style={styles.editButtonText}>Hiệu đính hồ sơ khóa học</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Xóa khóa học khỏi MockAPI"
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.deleteButtonIcon}>🗑️</Text>
                  <Text style={styles.deleteButtonText}>Xóa khóa học khỏi thư viện</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Video Player Modal */}
      <VideoPlayerModal
        visible={videoModalVisible}
        videoUrl={course.trailerUrl}
        courseTitle={course.title}
        onClose={() => setVideoModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scrollContent: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  bannerContainer: {
    width: '94%',
    maxWidth: 1100,
    height: 330,
    marginTop: 18,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.evergreenDark,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#244538',
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.evergreenSurface,
  },
  bannerPlaceholderRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bannerPlaceholderIcon: {
    fontSize: 34,
  },
  bannerPlaceholderText: {
    color: '#B7C9C0',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bookmarkRibbon: {
    position: 'absolute',
    top: 0,
    left: 24,
    backgroundColor: Colors.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bookmarkText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  floatingPlayBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingPlayIcon: {
    color: Colors.white,
    fontSize: 26,
    marginLeft: 4,
  },
  body: {
    width: '92%',
    maxWidth: 1000,
    padding: 30,
    backgroundColor: Colors.paperCard,
    borderRadius: 24,
    marginTop: -32,
    zIndex: 1,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.paperLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  dateIcon: {
    fontSize: 11,
  },
  createdAt: {
    fontSize: 11,
    color: Colors.inkMuted,
    fontWeight: '600',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 34,
    marginBottom: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.paperWarm,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    marginBottom: 20,
  },
  priceLeft: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.evergreenDark,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  priceSublabel: {
    fontSize: 11,
    color: Colors.inkMuted,
  },
  priceValue: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.evergreen,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  infoBox: {
    flex: 1,
    backgroundColor: Colors.paperLight,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.inkSubtle,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.evergreenDark,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 26,
    gap: 14,
    borderWidth: 1,
    borderColor: '#244538',
  },
  trailerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailerButtonIcon: {
    fontSize: 18,
    color: Colors.white,
    marginLeft: 2,
  },
  trailerButtonTextWrap: {
    flex: 1,
  },
  trailerButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.paper,
    marginBottom: 2,
  },
  trailerButtonSubtitle: {
    fontSize: 11,
    color: '#A5B9AD',
  },
  trailerArrow: {
    fontSize: 20,
    color: Colors.lime,
    fontWeight: '700',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderWrap: {
    marginBottom: 10,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  descriptionCard: {
    backgroundColor: Colors.paperLight,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  description: {
    fontSize: 14,
    color: Colors.inkLight,
    lineHeight: 23,
  },
  actionsSection: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.paperBorder,
    paddingTop: 22,
  },
  editButton: {
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonIcon: {
    fontSize: 14,
  },
  editButtonText: {
    color: Colors.evergreen,
    fontWeight: '700',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonIcon: {
    fontSize: 14,
  },
  deleteButtonText: {
    color: Colors.coralDark,
    fontWeight: '700',
    fontSize: 15,
  },
});
