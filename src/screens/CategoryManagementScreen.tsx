import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Category } from '../types/category';
import { Course } from '../types/course';
import {
  getCategories,
  getCourses,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/api';
import { Colors, Fonts } from '../theme/colors';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyState } from '../components/EmptyState';

export const CategoryManagementScreen: React.FC = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focusedModalField, setFocusedModalField] = useState<'name' | 'desc' | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [cats, crss] = await Promise.all([getCategories(), getCourses()]);
      setCategories(cats);
      setCourses(crss);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách danh mục từ MockAPI');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setNameInput('');
    setDescInput('');
    setModalVisible(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDescInput(cat.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Lỗi dữ liệu', 'Tên danh mục không được để trống.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: nameInput.trim(),
          description: descInput.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật danh mục lĩnh vực!');
      } else {
        await createCategory({
          name: nameInput.trim(),
          description: descInput.trim(),
        });
        Alert.alert('Thành công', 'Đã thêm danh mục mới vào MockAPI!');
      }
      setModalVisible(false);
      loadData();
    } catch (err: any) {
      Alert.alert('Lỗi lưu danh mục', err.message || 'Không thể lưu danh mục.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (cat: Category) => {
    // RÀNG BUỘC THEO YÊU CẦU 3.5:
    // "Không cho xóa danh mục đang có khóa học. Ràng buộc được kiểm tra phía ứng dụng
    //  vì MockAPI không cung cấp khóa ngoại quan hệ đầy đủ."
    const linkedCourses = courses.filter(c => String(c.categoryId) === String(cat.id));

    if (linkedCourses.length > 0) {
      Alert.alert(
        '🚫 Không thể xóa danh mục!',
        `Danh mục "${cat.name}" hiện đang có ${linkedCourses.length} khóa học liên kết:\n\n` +
          linkedCourses.map(c => `• ${c.title}`).slice(0, 3).join('\n') +
          (linkedCourses.length > 3
            ? `\n… và ${linkedCourses.length - 3} khóa học khác.`
            : '') +
          `\n\nỨng dụng chặn thao tác xóa để đảm bảo toàn vẹn dữ liệu. Bạn cần xóa hoặc chuyển các khóa học trên sang danh mục khác trước khi xóa danh mục này.`,
        [{ text: 'Đã hiểu', style: 'default' }]
      );
      return;
    }

    // Nếu không có khóa học nào thuộc danh mục này, cho phép xác nhận xóa
    Alert.alert(
      'Xác nhận xóa danh mục',
      `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" khỏi MockAPI?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
              Alert.alert('Thành công', 'Đã xóa danh mục thành công.');
              loadData();
            } catch (err: any) {
              Alert.alert('Lỗi xóa danh mục', err.message || 'Không thể xóa danh mục.');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return <LoadingView message="Đang mở mục lục lĩnh vực học thuật…" />;
  }

  if (error && categories.length === 0) {
    return <ErrorView message={error} onRetry={() => loadData()} />;
  }

  return (
    <View style={styles.container}>
      {/* Editorial Header bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerKickerRow}>
            <View style={styles.headerKickerDot} />
            <Text style={styles.headerKicker}>MỤC LỤC CHUYÊN ĐỀ</Text>
          </View>
          <Text accessibilityRole="header" style={styles.headerTitle}>
            Lĩnh vực học thuật
          </Text>
          <Text style={styles.headerSubtitle}>
            Tổng số: {categories.length} danh mục trên hệ thống
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Thêm danh mục lĩnh vực mới"
          style={styles.addBtn}
          onPress={handleOpenAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnIcon}>＋</Text>
          <Text style={styles.addBtnText}>Thêm lĩnh vực</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[Colors.evergreen]}
            tintColor={Colors.evergreen}
          />
        }
        renderItem={({ item, index }) => {
          const linkedCount = courses.filter(c => String(c.categoryId) === String(item.id)).length;
          return (
            <View style={styles.catCard}>
              <View style={styles.catCardRibbon} />

              <View style={styles.catCardTop}>
                <View style={styles.catInfo}>
                  <View style={styles.titleRow}>
                    <View style={styles.indexBadge}>
                      <Text style={styles.catIdBadge}>
                        #{String(item.id).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text accessibilityRole="header" style={styles.catName}>
                      {item.name}
                    </Text>
                  </View>

                  <Text style={styles.catDesc}>
                    {item.description || 'Chuyên mục học thuật chưa có phần mô tả tóm tắt.'}
                  </Text>
                </View>

                {/* Course Count Pill */}
                <View
                  style={[
                    styles.countPill,
                    linkedCount > 0 ? styles.countPillActive : styles.countPillEmpty,
                  ]}
                >
                  <Text style={styles.countPillIcon}>{linkedCount > 0 ? '📚' : '📜'}</Text>
                  <Text
                    style={[
                      styles.countPillText,
                      linkedCount > 0
                        ? styles.countPillTextActive
                        : styles.countPillTextEmpty,
                    ]}
                  >
                    {linkedCount} khóa học
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Chỉnh sửa danh mục ${item.name}`}
                >
                  <Text style={styles.editBtnIcon}>✏️</Text>
                  <Text style={styles.editBtnText}>Hiệu đính</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    linkedCount > 0 && styles.deleteBtnDisabled,
                  ]}
                  onPress={() => handleDelete(item)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={
                    linkedCount > 0
                      ? `Không thể xóa ${item.name} vì đang có ${linkedCount} khóa học`
                      : `Xóa danh mục ${item.name}`
                  }
                  accessibilityHint={
                    linkedCount > 0
                      ? 'Bị khóa do có bài giảng liên kết'
                      : 'Xóa hoàn toàn danh mục khỏi MockAPI'
                  }
                >
                  <Text style={styles.deleteBtnIcon}>
                    {linkedCount > 0 ? '🔒' : '🗑️'}
                  </Text>
                  <Text
                    style={[
                      styles.deleteBtnText,
                      linkedCount > 0 && styles.deleteBtnTextDisabled,
                    ]}
                  >
                    {linkedCount > 0 ? `Có ${linkedCount} khóa học` : 'Xóa lĩnh vực'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="📂"
            title="Chưa có lĩnh vực học thuật nào"
            description="Hãy tạo chuyên ngành đầu tiên để phân loại và sắp xếp các bài giảng."
            actionLabel="＋ Thêm lĩnh vực mới"
            onAction={handleOpenAdd}
          />
        }
      />

      {/* Add / Edit Category Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalKicker}>SỔ TAY PHÂN LOẠI</Text>
                <Text style={styles.modalTitle}>
                  {editingCategory ? 'Hiệu đính lĩnh vực' : 'Thêm lĩnh vực học thuật mới'}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Đóng hộp thoại danh mục"
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>
                Tên lĩnh vực chuyên đề <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                accessibilityLabel="Tên lĩnh vực chuyên đề"
                style={[
                  styles.modalInput,
                  focusedModalField === 'name' && styles.modalInputFocused,
                ]}
                onFocus={() => setFocusedModalField('name')}
                onBlur={() => setFocusedModalField(null)}
                placeholder="Ví dụ: Khoa học Dữ liệu & AI…"
                placeholderTextColor={Colors.inkSubtle}
                value={nameInput}
                onChangeText={setNameInput}
              />

              <Text style={styles.inputLabel}>Mô tả tóm tắt định hướng</Text>
              <TextInput
                accessibilityLabel="Mô tả tóm tắt định hướng chuyên môn"
                style={[
                  styles.modalInput,
                  styles.modalTextArea,
                  focusedModalField === 'desc' && styles.modalInputFocused,
                ]}
                onFocus={() => setFocusedModalField('desc')}
                onBlur={() => setFocusedModalField(null)}
                placeholder="Ví dụ: Bao gồm Machine Learning, Phân tích dữ liệu lớn, Thống kê ứng dụng…"
                placeholderTextColor={Colors.inkSubtle}
                value={descInput}
                onChangeText={setDescInput}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Hủy và đóng"
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, submitting && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel={editingCategory ? 'Lưu cập nhật' : 'Thêm mới'}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.paper} />
                  ) : (
                    <Text style={styles.modalSubmitText}>
                      {editingCategory ? 'Lưu cập nhật' : 'Thêm mới vào hệ thống'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 18,
    backgroundColor: Colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.paperBorder,
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerKickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
  },
  headerKicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.evergreen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnIcon: {
    color: Colors.paper,
    fontSize: 14,
    fontWeight: '900',
  },
  addBtnText: {
    color: Colors.paper,
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  catCard: {
    backgroundColor: Colors.paperCard,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  catCardRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.sage,
  },
  catCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  catInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  indexBadge: {
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  catIdBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.evergreen,
  },
  catName: {
    fontFamily: Fonts.serif,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.ink,
  },
  catDesc: {
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 19,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
  },
  countPillIcon: {
    fontSize: 11,
  },
  countPillActive: {
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  countPillEmpty: {
    backgroundColor: Colors.paperWarm,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countPillTextActive: {
    color: Colors.evergreen,
  },
  countPillTextEmpty: {
    color: Colors.inkSubtle,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.paperBorder,
    paddingTop: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  editBtnIcon: {
    fontSize: 12,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.evergreen,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
  },
  deleteBtnDisabled: {
    backgroundColor: Colors.paperWarm,
    borderColor: Colors.paperBorder,
  },
  deleteBtnIcon: {
    fontSize: 12,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coralDark,
  },
  deleteBtnTextDisabled: {
    color: Colors.inkSubtle,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 33, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: Colors.paperCard,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
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
  modalForm: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  required: {
    color: Colors.coral,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: Colors.paperLight,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 14,
  },
  modalInputFocused: {
    borderColor: Colors.evergreen,
    borderWidth: 1.5,
    backgroundColor: Colors.paperCard,
  },
  modalTextArea: {
    minHeight: 76,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.inkMuted,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.evergreen,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: Colors.evergreenDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.paper,
  },
  btnDisabled: {
    opacity: 0.65,
  },
});
