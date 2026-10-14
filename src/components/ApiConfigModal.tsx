import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Fonts } from '../theme/colors';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, DEFAULT_LOCAL_API_URL } from '../config/apiConfig';
import { testApiConnection } from '../services/api';

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ visible, onClose, onSaved }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      getApiBaseUrl().then(setUrl);
      setTestResult(null);
    }
  }, [visible]);

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập đường dẫn API.' });
      return;
    }
    setLoading(true);
    setTestResult(null);
    const res = await testApiConnection(url);
    setLoading(false);
    setTestResult(res);
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Lỗi', 'Đường dẫn API không được để trống.');
      return;
    }
    await setApiBaseUrl(url);
    Alert.alert('Thành công', 'Đã lưu cấu hình MockAPI mới.');
    onSaved();
    onClose();
  };

  const handleReset = async () => {
    const defaultUrl = await resetApiBaseUrl();
    setUrl(defaultUrl);
    setTestResult({ success: true, message: 'Đã đặt lại về URL mặc định.' });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>THIẾT LẬP MÁY CHỦ</Text>
              <Text accessibilityRole="header" style={styles.title}>
                Cấu hình MockAPI URL
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Đóng hộp thoại cấu hình"
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Nhập đường dẫn Base URL MockAPI của bạn để kết nối với cơ sở dữ liệu khóa học và danh mục:
          </Text>

          <TextInput
            accessibilityLabel="Địa chỉ API gốc của máy chủ MockAPI"
            style={[styles.input, isFocused && styles.inputFocused]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={url}
            onChangeText={text => {
              setUrl(text);
              setTestResult(null);
            }}
            placeholder="https://YOUR_PROJECT_ID.mockapi.io/api/v1…"
            keyboardType="url"
            placeholderTextColor={Colors.inkSubtle}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {loading && (
            <View style={styles.testingRow}>
              <ActivityIndicator size="small" color={Colors.evergreen} />
              <Text style={styles.testingText}>Đang kiểm tra kết nối với MockAPI…</Text>
            </View>
          )}

          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Text
                accessibilityLiveRegion="polite"
                style={testResult.success ? styles.resultTextSuccess : styles.resultTextError}
              >
                {testResult.success ? '✓ ' : '✗ '}
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Kiểm tra kết nối với URL hiện tại"
              style={styles.testBtn}
              onPress={handleTest}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.testBtnText}>Kiểm tra kết nối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Đặt lại về URL mặc định"
              style={styles.resetBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>Mặc định</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Hủy và đóng"
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Lưu cấu hình và tải lại dữ liệu"
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Lưu & Tải lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 33, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 520,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kicker: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.sageDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.paperWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.inkMuted,
    lineHeight: 19,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.paperLight,
    marginBottom: 12,
  },
  inputFocused: {
    borderColor: Colors.evergreen,
    borderWidth: 1.5,
    backgroundColor: Colors.paperCard,
  },
  testingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  testingText: {
    fontSize: 13,
    color: Colors.inkMuted,
  },
  resultBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  resultSuccess: {
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
  },
  resultError: {
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
  },
  resultTextSuccess: {
    fontSize: 13,
    color: Colors.evergreen,
    fontWeight: '600',
  },
  resultTextError: {
    fontSize: 13,
    color: Colors.coralDark,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  testBtn: {
    flex: 1,
    backgroundColor: Colors.sageLight,
    borderWidth: 1,
    borderColor: Colors.sageBorder,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.evergreen,
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.paperBorder,
    backgroundColor: Colors.paperWarm,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    color: Colors.inkMuted,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.paperBorder,
    paddingTop: 16,
  },
  cancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    color: Colors.inkMuted,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: Colors.evergreen,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 10,
    shadowColor: Colors.evergreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  saveBtnText: {
    fontSize: 14,
    color: Colors.paper,
    fontWeight: '700',
  },
});
