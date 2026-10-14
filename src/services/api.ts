import { getApiBaseUrl } from '../config/apiConfig';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';
import { Course, CreateCourseInput, UpdateCourseInput } from '../types/course';

const TIMEOUT_MS = 10000;

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError('Quá thời gian kết nối (Timeout). Vui lòng kiểm tra đường truyền mạng hoặc URL API.');
    }
    throw new ApiError(error.message || 'Lỗi kết nối tới máy chủ. Vui lòng kiểm tra lại URL MockAPI.');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==========================================
// CATEGORIES SERVICE
// ==========================================

export async function getCategories(): Promise<Category[]> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/categories`);
  if (!res.ok) {
    throw new ApiError(`Không thể lấy danh mục (HTTP ${res.status})`, res.status);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/categories`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(`Không thể tạo danh mục (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(`Không thể cập nhật danh mục (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

export async function deleteCategory(id: string): Promise<Category> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new ApiError(`Không thể xóa danh mục (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

// ==========================================
// COURSES SERVICE
// ==========================================

export async function getCourses(): Promise<Course[]> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/courses`);
  if (!res.ok) {
    throw new ApiError(`Không thể lấy danh sách khóa học (HTTP ${res.status})`, res.status);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getCourseById(id: string): Promise<Course> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/courses/${id}`);
  if (!res.ok) {
    throw new ApiError(`Không tìm thấy khóa học với ID: ${id} (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/courses`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(`Không thể thêm khóa học (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new ApiError(`Không thể cập nhật khóa học (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

export async function deleteCourse(id: string): Promise<Course> {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/courses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new ApiError(`Không thể xóa khóa học (HTTP ${res.status})`, res.status);
  }
  return await res.json();
}

// Test connectivity helper
export async function testApiConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
  try {
    const url = customUrl ? customUrl.trim().replace(/\/+$/, '') : await getApiBaseUrl();
    const res = await fetchWithTimeout(`${url}/categories`);
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: `Kết nối thành công! Đã tìm thấy ${Array.isArray(data) ? data.length : 0} danh mục.`,
      };
    }
    return {
      success: false,
      message: `Máy chủ phản hồi mã lỗi HTTP ${res.status}. Vui lòng kiểm tra lại resource categories trên MockAPI.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Không thể kết nối đến địa chỉ API.',
    };
  }
}
