import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CourseFormRouteProp, CourseFormNavigationProp } from '../types/navigation';
import { Category } from '../types/category';
import { getCategories, createCourse, updateCourse } from '../services/api';
import { Colors, Fonts } from '../theme/colors';

export const CourseFormScreen: React.FC = () => {
  const route = useRoute<CourseFormRouteProp>();
  const navigation = useNavigation<CourseFormNavigationProp>();
  const { courseId, initialCourse } = route.params || {};

  const isEditing = !!courseId;

  // Form State
  const [title, setTitle] = useState(initialCourse?.title || '');
  const [description, setDescription] = useState(initialCourse?.description || '');
  const [categoryId, setCategoryId] = useState(initialCourse?.categoryId || '');
  const [instructor, setInstructor] = useState(initialCourse?.instructor || '');
  const [price, setPrice] = useState(initialCourse?.price !== undefined ? String(initialCourse.price) : '');
  const [duration, setDuration] = useState(initialCourse?.duration !== undefined ? String(initialCourse.duration) : '');
  const [thumbnail, setThumbnail] = useState(initialCourse?.thumbnail || '');
  const [trailerUrl, setTrailerUrl] = useState(initialCourse?.trailerUrl || '');

  // UI state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Fetch categories for Dropdown/Spinner from API
  useEffect(() => {
    async function fetchCatList() {
      try {
        const cats = await getCategories();
        setCategories(cats);
        // Nếu thêm mới và chưa chọn danh mục, tự động chọn danh mục đầu tiên nếu có
        if (!categoryId && cats.length > 0) {
          setCategoryId(String(cats[0].id));
        }
      } catch (err: any) {
        Alert.alert('Lỗi tải danh mục', 'Không thể lấy danh mục từ MockAPI để chọn. Vui lòng kiểm tra kết nối.');
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCatList();
  }, []);

  const selectedCategory = categories.find(c => String(c.id) === String(categoryId));

  const isHttpUrl = (value: string): boolean => {
    try {
      const parsed = new URL(value.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isYouTubeUrl = (value: string): boolean => {
    try {
      const host = new URL(value.trim()).hostname.toLowerCase();
      return (
        host === 'youtube.com' ||
        host.endsWith('.youtube.com') ||
        host === 'youtu.be' ||
        host.endsWith('.youtu.be')
      );
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng nhập Tên khóa học.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng nhập Mô tả khóa học.');
      return false;
    }
    if (!categoryId.trim()) {
      Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng chọn Danh mục cho khóa học.');
      return false;
    }
    // Ràng buộc: categoryId phải tồn tại
    const exists = categories.some(c => String(c.id) === String(categoryId));
    if (!exists) {
      Alert.alert('Dữ liệu không hợp lệ', 'Danh mục đã chọn không tồn tại trên MockAPI.');
      return false;
    }
    if (!instructor.trim()) {
      Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng nhập Tên giảng viên.');
      return false;
    }

    // Ràng buộc: Học phí không âm
    const numPrice = Number(price);
    if (price.trim() === '' || isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Dữ liệu không hợp lệ', 'Học phí phải là một số không âm (>= 0 VNĐ).');
      return false;
    }

    const numDuration = Number(duration);
    if (duration.trim() === '' || isNaN(numDuration) || numDuration <= 0) {
      Alert.alert('Dữ liệu không hợp lệ', 'Thời lượng phải là số giờ lớn hơn 0.');
      return false;
    }

    if (!isHttpUrl(thumbnail)) {
      Alert.alert('Dữ liệu không hợp lệ', 'URL ảnh bìa phải là địa chỉ HTTP hoặc HTTPS hợp lệ.');
      return false;
    }

    if (!isHttpUrl(trailerUrl)) {
      Alert.alert('Dữ liệu không hợp lệ', 'URL trailer phải là địa chỉ HTTP hoặc HTTPS hợp lệ.');
      return false;
    }
    if (isYouTubeUrl(trailerUrl)) {
      Alert.alert(
        'URL trailer không được hỗ trợ',
        'Trên Android/iOS, ứng dụng phát video trực tiếp như MP4. Hãy dùng URL video trực tiếp thay cho YouTube.'
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      categoryId: String(categoryId),
      instructor: instructor.trim(),
      price: Number(price),
      duration: Number(duration),
      thumbnail: thumbnail.trim(),
      trailerUrl: trailerUrl.trim(),
      createdAt: initialCourse?.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      if (isEditing && courseId) {
        await updateCourse(courseId, payload);
        Alert.alert('Thành công', 'Đã cập nhật thông tin khóa học!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createCourse(payload);
        Alert.alert('Thành công', 'Đã thêm khóa học mới vào MockAPI!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi lưu khóa học', err.message || 'Không thể lưu khóa học vào MockAPI.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Manuscript Screen Heading */}
        <View style={styles.header}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>BIÊN TẬP BÀI GIẢNG · SỔ TAY HỌC THUẬT</Text>
          </View>
          <Text accessibilityRole="header" style={styles.headerTitle}>
            {isEditing ? 'Hiệu đính hồ sơ bài giảng' : 'Biên soạn khóa học mới'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing
              ? `Chỉnh sửa và chuẩn hóa các thông số khóa học #${courseId}`
              : 'Lưu thông tin, học phí và tư liệu của khóa học.'}
          </Text>
        </View>

        {/* Form Card Container */}
        <View style={styles.formCard}>
          <View style={styles.cardTopRibbon} />

          {/* Section 1: Thông tin học thuật cơ bản */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitleKicker}>PHẦN I · THÔNG TIN CƠ BẢN</Text>
          </View>

          {/* 1. Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Tên khóa học <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="Tên khóa học"
              style={[
                styles.input,
                focusedField === 'title' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              placeholder="Ví dụ: Thiết kế Giao diện Di động Nâng cao…"
              placeholderTextColor={Colors.inkSubtle}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* 2. Category Dropdown / Picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Lĩnh vực chuyên đề <Text style={styles.required}>* (MockAPI categories)</Text>
            </Text>
            {loadingCategories ? (
              <View style={styles.loadingCat}>
                <ActivityIndicator size="small" color={Colors.evergreen} />
                <Text style={styles.loadingCatText}>Đang tra cứu danh mục từ máy chủ...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.pickerTrigger,
                  pickerVisible && styles.pickerTriggerActive,
                ]}
                onPress={() => setPickerVisible(true)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={
                  selectedCategory
                    ? `Lĩnh vực đã chọn: ${selectedCategory.name}`
                    : 'Chọn lĩnh vực bài giảng'
                }
                accessibilityState={{ expanded: pickerVisible }}
              >
                <View style={styles.pickerLeft}>
                  <Text style={styles.pickerIcon}>📂</Text>
                  <Text
                    style={
                      selectedCategory
                        ? styles.pickerTriggerText
                        : styles.pickerPlaceholder
                    }
                  >
                    {selectedCategory ? selectedCategory.name : '-- Chọn lĩnh vực --'}
                  </Text>
                </View>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 3. Instructor */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Giảng viên phụ trách <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="Tên giảng viên phụ trách"
              style={[
                styles.input,
                focusedField === 'instructor' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('instructor')}
              onBlur={() => setFocusedField(null)}
              placeholder="Ví dụ: TS. Nguyễn Văn A…"
              placeholderTextColor={Colors.inkSubtle}
              value={instructor}
              onChangeText={setInstructor}
            />
          </View>

          {/* Section 2: Định phí & Thời lượng */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitleKicker}>PHẦN II · ĐỊNH PHÍ & THỜI LƯỢNG</Text>
          </View>

          {/* 4. Price & Duration Row */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfCol]}>
              <Text style={styles.label}>
                Học phí (VNĐ) <Text style={styles.required}>{'* (≥ 0)'}</Text>
              </Text>
              <TextInput
                accessibilityLabel="Học phí bằng Việt Nam Đồng"
                style={[
                  styles.input,
                  focusedField === 'price' && styles.inputFocused,
                ]}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ví dụ: 650000"
                placeholderTextColor={Colors.inkSubtle}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfCol]}>
              <Text style={styles.label}>
                Thời lượng (giờ) <Text style={styles.required}>{'* (> 0)'}</Text>
              </Text>
              <TextInput
                accessibilityLabel="Thời lượng khóa học tính bằng giờ"
                style={[
                  styles.input,
                  focusedField === 'duration' && styles.inputFocused,
                ]}
                onFocus={() => setFocusedField('duration')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ví dụ: 36"
                placeholderTextColor={Colors.inkSubtle}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Section 3: Tư liệu Media & Hình ảnh */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitleKicker}>PHẦN III · TƯ LIỆU BÀI GIẢNG</Text>
          </View>

          {/* 5. Thumbnail URL + Live Image Preview */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              URL ảnh bìa (thumbnail) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="URL ảnh bìa bài giảng"
              style={[
                styles.input,
                focusedField === 'thumbnail' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('thumbnail')}
              onBlur={() => setFocusedField(null)}
              placeholder="https://example.com/anh-bia.jpg…"
              placeholderTextColor={Colors.inkSubtle}
              value={thumbnail}
              keyboardType="url"
              onChangeText={text => {
                setThumbnail(text);
                setPreviewError(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Live Image Preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewHeading}>KHUNG XEM TRƯỚC ẢNH BÌA</Text>
                {thumbnail.trim() && !previewError ? (
                  <Text style={styles.previewBadge}>✓ ĐÃ TẢI ẢNH</Text>
                ) : null}
              </View>
              {thumbnail.trim() && !previewError ? (
                <View style={styles.previewWrapper}>
                  <Image
                    source={{ uri: thumbnail.trim() }}
                    style={styles.previewImage}
                    resizeMode="cover"
                    accessible
                    accessibilityLabel="Xem trước ảnh bìa bài giảng"
                    onError={() => setPreviewError(true)}
                  />
                </View>
              ) : (
                <View style={styles.previewEmpty}>
                  <Text style={styles.previewEmptyIcon}>🖼️</Text>
                  <Text style={styles.previewEmptyText}>
                    {previewError
                      ? 'Không thể tải ảnh từ URL này. Vui lòng kiểm tra lại đường dẫn.'
                      : 'Nhập đường dẫn ảnh hợp lệ để hiển thị bản xem trước tại đây.'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 6. Trailer URL */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              URL video trailer <Text style={styles.required}>* (URL trực tiếp, ưu tiên MP4)</Text>
            </Text>
            <TextInput
              accessibilityLabel="URL video trailer giới thiệu"
              style={[
                styles.input,
                focusedField === 'trailerUrl' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('trailerUrl')}
              onBlur={() => setFocusedField(null)}
              placeholder="Ví dụ: https://example.com/trailer.mp4…"
              placeholderTextColor={Colors.inkSubtle}
              value={trailerUrl}
              keyboardType="url"
              onChangeText={setTrailerUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.hintBox}>
              <Text style={styles.hintIcon}>💡</Text>
              <Text style={styles.hint}>
                Mẫu kiểm tra trực tiếp: https://www.w3schools.com/html/mov_bbb.mp4 hoặc https://vjs.zencdn.net/v/oceans.mp4
              </Text>
            </View>
          </View>

          {/* Section 4: Đề cương chi tiết */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitleKicker}>PHẦN IV · ĐỀ CƯƠNG BÀI GIẢNG</Text>
          </View>

          {/* 7. Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Mô tả chi tiết nội dung <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="Mô tả chi tiết nội dung khóa học"
              style={[
                styles.input,
                styles.textArea,
                focusedField === 'description' && styles.inputFocused,
              ]}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              placeholder="Tóm tắt mục tiêu đào tạo, lộ trình học và chuẩn đầu ra bài giảng…"
              placeholderTextColor={Colors.inkSubtle}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Cập nhật khóa học' : 'Lưu khóa học mới'}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.paper} />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitBtnIcon}>{isEditing ? '💾' : '➕'}</Text>
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Lưu cập nhật hồ sơ khóa học' : 'Xuất bản khóa học vào thư viện'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Dropdown Modal Picker */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalKicker}>DANH MỤC HỌC THUẬT</Text>
                <Text style={styles.modalTitle}>Chọn lĩnh vực khóa học</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Đóng hộp chọn lĩnh vực"
                onPress={() => setPickerVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.catList}
              renderItem={({ item }) => {
                const isSelected = String(item.id) === String(categoryId);
                return (
                  <TouchableOpacity
                    style={[styles.catOption, isSelected && styles.catOptionActive]}
                    onPress={() => {
                      setCategoryId(String(item.id));
                      setPickerVisible(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.catOptionTextWrap}>
                      <Text
                        style={[
                          styles.catOptionName,
                          isSelected && styles.catOptionNameActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.description ? (
                        <Text style={styles.catOptionDesc}>{item.description}</Text>
                      ) : null}
                    </View>
                    {isSelected ? (
                      <View style={styles.checkSeal}>
                        <Text style={styles.catCheckmark}>✓</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.coral,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: Colors.paperCard,
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  cardTopRibbon: {
    height: 4,
    backgroundColor: Colors.sage,
    borderRadius: 2,
    marginBottom: 20,
  },
  sectionDivider: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.paperBorder,
  },
  sectionTitleKicker: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.2,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  halfCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  required: {
    color: Colors.coral,
    fontWeight: '700',
    fontSize: 12,
  },
  input: {
    backgroundColor: Colors.paperLight,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.ink,
  },
  inputFocused: {
    borderColor: Colors.evergreen,
    borderWidth: 1.5,
    backgroundColor: Colors.paperCard,
  },
  textArea: {
    minHeight: 100,
    lineHeight: 20,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.paperWarm,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  hintIcon: {
    fontSize: 12,
  },
  hint: {
    fontSize: 11,
    color: Colors.inkMuted,
    lineHeight: 16,
    flex: 1,
  },
  pickerTrigger: {
    backgroundColor: Colors.paperLight,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerTriggerActive: {
    borderColor: Colors.evergreen,
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerIcon: {
    fontSize: 14,
  },
  pickerTriggerText: {
    fontSize: 14,
    color: Colors.ink,
    fontWeight: '700',
  },
  pickerPlaceholder: {
    fontSize: 14,
    color: Colors.inkSubtle,
  },
  pickerArrow: {
    fontSize: 11,
    color: Colors.inkMuted,
  },
  loadingCat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingCatText: {
    fontSize: 13,
    color: Colors.inkMuted,
  },
  previewContainer: {
    marginTop: 12,
    backgroundColor: Colors.paperWarm,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1,
  },
  previewBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.evergreen,
    letterSpacing: 0.5,
  },
  previewWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewEmpty: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.paperLight,
    borderRadius: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.paperBorderDark,
  },
  previewEmptyIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  previewEmptyText: {
    fontSize: 12,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: Colors.evergreen,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnIcon: {
    fontSize: 15,
  },
  submitButtonText: {
    color: Colors.paper,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 33, 0.75)',
    justifyContent: 'flex-end',
  },
  modalDialog: {
    backgroundColor: Colors.paperCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalKicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  modalTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.paperWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: {
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: '700',
  },
  catList: {
    paddingBottom: 20,
  },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.paperLight,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  catOptionActive: {
    backgroundColor: Colors.sageLight,
    borderColor: Colors.sageBorder,
  },
  catOptionTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  catOptionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  catOptionNameActive: {
    color: Colors.evergreen,
  },
  catOptionDesc: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  checkSeal: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.evergreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCheckmark: {
    fontSize: 14,
    color: Colors.paper,
    fontWeight: '900',
  },
});
