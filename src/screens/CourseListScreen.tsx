import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CourseListNavigationProp } from '../types/navigation';
import { Course, CourseWithCategory } from '../types/course';
import { Category } from '../types/category';
import { getCourses, getCategories } from '../services/api';
import { Colors, Fonts } from '../theme/colors';
import { CourseCard } from '../components/CourseCard';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';
import { ApiConfigModal } from '../components/ApiConfigModal';

export const CourseListScreen: React.FC = () => {
  const navigation = useNavigation<CourseListNavigationProp>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Gọi song song 2 API từ MockAPI theo yêu cầu
      const [fetchedCourses, fetchedCategories] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);
      setCourses(fetchedCourses);
      setCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu từ MockAPI');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Tự động làm mới danh sách khi quay lại màn hình này (sau khi thêm/sửa/xóa)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Tạo map tra cứu tên danh mục động từ API (không hardcode)
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => map.set(String(cat.id), cat.name));
    return map;
  }, [categories]);

  // Ghép tên danh mục vào từng khóa học và lọc theo tìm kiếm / danh mục
  const filteredCourses = useMemo(() => {
    return courses
      .map((c): CourseWithCategory => ({
        ...c,
        categoryName: categoryMap.get(String(c.categoryId)) || `Danh mục #${c.categoryId}`,
      }))
      .filter(c => {
        const matchTitle =
          searchQuery.trim() === '' ||
          c.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
        const matchCategory =
          selectedCategoryId === null ||
          String(c.categoryId) === String(selectedCategoryId);
        return matchTitle && matchCategory;
      });
  }, [courses, categoryMap, searchQuery, selectedCategoryId]);

  const { width } = useWindowDimensions();
  const columns = width >= 1180 ? 3 : width >= 700 ? 2 : 1;

  if (loading && !refreshing) {
    return <LoadingView message="Đang mở thư viện học phần…" />;
  }

  if (error && courses.length === 0) {
    return (
      <ErrorView
        message={error}
        onRetry={() => loadData()}
        onConfigureApi={() => setConfigModalVisible(true)}
      />
    );
  }

  const listHeader = (
    <View style={styles.headerContent}>
      {/* Editorial Journal Cover / Hero */}
      <View style={styles.heroCover}>
        {/* Top Decorative Border Rule */}
        <View style={styles.heroBorderRule} />

        <View style={styles.heroTopline}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>HM</Text>
            </View>
            <View>
              <Text style={styles.journalEdition}>TẬP SAN HỌC TẬP · SỐ 01</Text>
              <Text style={styles.brandName}>HỌC VIỆN MỞ</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Mở màn hình quản lý danh mục"
              style={styles.categoryButton}
              onPress={() => navigation.navigate('CategoryManagement')}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryButtonIcon}>📂</Text>
              <Text style={styles.categoryButtonText}>Mục lục lĩnh vực</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cấu hình MockAPI URL"
              style={styles.settingsButton}
              onPress={() => setConfigModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.heroBody, width < 700 && styles.heroBodyMobile]}>
          <View style={styles.heroCopy}>
            <View style={styles.eyebrowContainer}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>SỔ TAY HỌC TẬP · THƯ VIỆN KHÓA HỌC</Text>
            </View>
            <Text
              accessibilityRole="header"
              style={[styles.heroTitle, width < 420 && styles.heroTitleCompact]}
            >
              “Mở từng trang sách,{'\n'}kiến tạo tương lai”
            </Text>
            <Text style={styles.heroDescription}>
              Tìm khóa học phù hợp và theo dõi nội dung học tập của bạn.
            </Text>

            {/* Editorial Ledger Stats */}
            <View style={styles.heroStats}>
              <View style={styles.statBox}>
                <Text style={styles.heroStatNumber}>
                  {courses.length.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.heroStatLabel}>khóa học</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.heroStatNumber}>
                  {categories.length.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.heroStatLabel}>lĩnh vực</Text>
              </View>
            </View>
          </View>

          {width >= 700 ? (
            <View style={styles.heroArt}>
              {/* Journal Book Illustration */}
              <View style={styles.heroBookJacket}>
                <View style={styles.bookBookmark} />
                <View style={styles.bookSpine} />
                <View style={styles.bookPage}>
                  <Text style={styles.bookPageKicker}>BÀI HỌC HÔM NAY</Text>
                  <View style={styles.bookLine} />
                  <View style={styles.bookLineShort} />
                  <View style={styles.bookLine} />
                  <View style={styles.bookQuillIconWrap}>
                    <Text style={styles.bookQuillIcon}>✒️</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroArtTag}>
                <Text style={styles.artTagText}>TUYỂN TẬP CHỌN LỌC</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {/* Discovery & Filter Ledger */}
      <View style={styles.discovery}>
        {/* Search Bar */}
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            accessibilityLabel="Tìm kiếm khóa học theo tiêu đề"
            placeholder="Tra cứu chuyên đề, kỹ năng hoặc môn học…"
            placeholderTextColor={Colors.inkSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            clearButtonMode="while-editing"
          />
          {searchQuery !== '' ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Xóa từ khóa tìm kiếm"
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
            >
              <Text style={styles.clearSearch}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Carousel Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategoryId === null }}
            accessibilityLabel={`Tất cả khóa học, có ${courses.length} khóa`}
            style={[
              styles.filterChip,
              selectedCategoryId === null && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategoryId(null)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategoryId === null && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
            <View
              style={[
                styles.chipBadge,
                selectedCategoryId === null && styles.chipBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.chipCount,
                  selectedCategoryId === null && styles.chipCountActive,
                ]}
              >
                {courses.length}
              </Text>
            </View>
          </TouchableOpacity>

          {categories.map(cat => {
            const count = courses.filter(c => String(c.categoryId) === String(cat.id)).length;
            const isSelected = selectedCategoryId === String(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Lĩnh vực ${cat.name}, có ${count} khóa học`}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedCategoryId(isSelected ? null : String(cat.id))}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
                <View
                  style={[
                    styles.chipBadge,
                    isSelected && styles.chipBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipCount,
                      isSelected && styles.chipCountActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Heading & Counter */}
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionKicker}>DANH MỤC LƯU TRỮ</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Thư viện khóa học tuyển chọn
            </Text>
          </View>
          <View style={styles.resultPill}>
            <Text style={styles.resultCount}>
              {filteredCourses.length} / {courses.length} khóa học
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.paper} />
      <FlatList
        key={`course-grid-${columns}`}
        data={filteredCourses}
        numColumns={columns}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate('CourseDetail', { courseId: String(item.id) })
            }
          />
        )}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={Colors.evergreen}
            colors={[Colors.evergreen]}
          />
        }
        ListEmptyComponent={
          courses.length === 0 ? (
            <EmptyState
              icon="📜"
              title="Thư viện chưa có khóa học"
              description="Học viện đang chờ những chuyên đề bài giảng đầu tiên được biên soạn."
              actionLabel="＋ Biên soạn khóa học đầu tiên"
              onAction={() => navigation.navigate('CourseForm', {})}
            />
          ) : (
            <EmptyState
              icon="⌕"
              title="Không tìm thấy bài giảng phù hợp"
              description="Thử tìm với từ khóa khác hoặc xóa bộ lọc lĩnh vực hiện tại."
              actionLabel="Xóa bộ lọc tìm kiếm"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
            />
          )
        }
        ListFooterComponent={
          <View style={styles.footerColophon}>
            <View style={styles.colophonOrnament} />
            <Text style={styles.footerColophonTitle}>HỌC VIỆN MỞ · THƯ VIỆN KHÓA HỌC</Text>
            <Text style={styles.footerColophonSub}>
              QUẢN LÝ KHÓA HỌC · HỌC TẬP TRỰC TUYẾN
            </Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Biên soạn khóa học mới"
        accessibilityHint="Chuyển đến màn hình tạo khóa học mới trên MockAPI"
        style={styles.fab}
        onPress={() => navigation.navigate('CourseForm', {})}
        activeOpacity={0.9}
      >
        <View style={styles.fabIconSeal}>
          <Text style={styles.fabIcon}>＋</Text>
        </View>
        <Text style={styles.fabText}>Biên soạn khóa học</Text>
      </TouchableOpacity>

      {/* API Configuration Modal */}
      <ApiConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        onSaved={() => loadData()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  listContent: {
    width: '100%',
    alignItems: 'stretch',
    paddingBottom: 110,
    paddingHorizontal: 18,
  },
  headerContent: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
  },
  heroCover: {
    backgroundColor: Colors.evergreenDark,
    borderRadius: 26,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#244538',
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  heroBorderRule: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.sage,
  },
  heroTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.sageLight,
    borderWidth: 1.5,
    borderColor: Colors.sageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandMarkText: {
    color: Colors.evergreenDark,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Fonts.serif,
  },
  journalEdition: {
    color: Colors.lime,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  brandName: {
    color: Colors.paper,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  categoryButtonIcon: {
    fontSize: 12,
  },
  categoryButtonText: {
    color: Colors.paper,
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  settingsButtonText: {
    color: Colors.paper,
    fontSize: 15,
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 250,
    paddingTop: 24,
  },
  heroBodyMobile: {
    minHeight: 0,
    paddingTop: 20,
  },
  heroCopy: {
    flex: 1,
    maxWidth: 620,
  },
  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.coral,
  },
  eyebrow: {
    color: Colors.lime,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  heroTitle: {
    color: Colors.paper,
    fontFamily: Fonts.serif,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
  },
  heroTitleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  heroDescription: {
    color: '#CAD8CF',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 480,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    alignItems: 'flex-start',
  },
  heroStatNumber: {
    color: Colors.lime,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Fonts.serif,
  },
  statActive: {
    color: Colors.coral,
  },
  heroStatLabel: {
    color: '#A1B7AA',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statDivider: {
    height: 24,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroArt: {
    width: 260,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    position: 'relative',
  },
  heroBookJacket: {
    width: 150,
    height: 175,
    backgroundColor: Colors.paperLight,
    borderRadius: 10,
    transform: [{ rotate: '5deg' }],
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  bookBookmark: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 16,
    height: 38,
    backgroundColor: Colors.coral,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  bookSpine: {
    width: 14,
    backgroundColor: Colors.evergreen,
  },
  bookPage: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  bookPageKicker: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1,
  },
  bookLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.sageBorder,
  },
  bookLineShort: {
    height: 4,
    width: '60%',
    borderRadius: 2,
    backgroundColor: Colors.paperBorderDark,
  },
  bookQuillIconWrap: {
    alignSelf: 'flex-end',
  },
  bookQuillIcon: {
    fontSize: 18,
  },
  heroArtTag: {
    position: 'absolute',
    bottom: 6,
    left: 20,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    transform: [{ rotate: '-4deg' }],
  },
  artTagText: {
    color: Colors.evergreen,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  discovery: {
    paddingTop: 24,
    paddingBottom: 16,
  },
  searchBar: {
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.paperCard,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  searchBarFocused: {
    borderColor: Colors.evergreen,
    borderWidth: 1.5,
    backgroundColor: Colors.paperCard,
  },
  searchIcon: {
    color: Colors.evergreen,
    fontSize: 24,
    lineHeight: 26,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: Colors.ink,
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
  },
  clearSearch: {
    color: Colors.inkMuted,
    fontSize: 22,
    lineHeight: 22,
  },
  filterList: {
    gap: 8,
    paddingVertical: 16,
    paddingRight: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.paperWarm,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.evergreen,
    borderColor: Colors.evergreen,
  },
  filterChipText: {
    color: Colors.inkLight,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: Colors.paper,
  },
  chipBadge: {
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  chipBadgeActive: {
    backgroundColor: Colors.coral,
  },
  chipCount: {
    color: Colors.evergreen,
    fontSize: 10,
    fontWeight: '800',
  },
  chipCountActive: {
    color: Colors.white,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  sectionKicker: {
    color: Colors.coral,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    color: Colors.ink,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  resultPill: {
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  resultCount: {
    color: Colors.evergreen,
    fontSize: 11,
    fontWeight: '700',
  },
  columnWrapper: {
    width: '100%',
    gap: 18,
  },
  footerColophon: {
    alignItems: 'center',
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.paperBorder,
    marginTop: 14,
  },
  colophonOrnament: {
    width: 32,
    height: 3,
    backgroundColor: Colors.sage,
    borderRadius: 2,
    marginBottom: 10,
  },
  footerColophonTitle: {
    fontFamily: Fonts.serif,
    color: Colors.inkMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerColophonSub: {
    color: Colors.inkSubtle,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: Colors.evergreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  fabIconSeal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  fabText: {
    color: Colors.paper,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
