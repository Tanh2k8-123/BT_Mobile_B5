# Ứng dụng Quản lý Khóa học (Course Management Mobile App)

Dự án bài tập giữa kỳ môn **Lập trình Mobile App** — Quản lý khóa học trực tuyến kết nối Backend REST API với **MockAPI.io**.

---

## 📌 1. Giới thiệu & Mục tiêu đề tài

Ứng dụng di động quản lý khóa học trực tuyến được xây dựng hoàn chỉnh trên nền tảng **React Native (Expo) & TypeScript**, kết nối REST API với MockAPI.io, đáp ứng đúng và đủ 100% các yêu cầu:
- **Thực hành CRUD đầy đủ**: Thêm, xem, sửa, xóa Khóa học (`/courses`) và Danh mục (`/categories`).
- **Gọi REST API & Xử lý JSON**: Xử lý bất đồng bộ (`async/await`), mapping dữ liệu động, xử lý mã phản hồi HTTP.
- **Quan hệ 1–N động**: Mỗi khóa học liên kết với đúng 1 danh mục qua `categoryId = categories.id`. Tên danh mục được ánh xạ động từ API danh mục (không hardcode).
- **Ràng buộc khóa ngoại an toàn**: Không cho phép xóa danh mục đang có khóa học liên kết (kiểm tra phía ứng dụng để đảm bảo toàn vẹn dữ liệu).
- **Hiển thị hình ảnh từ URL**: Hỗ trợ hiển thị ảnh thumbnail và tính năng **Xem trước ảnh (Live Image Preview)** ngay khi nhập URL trong form.
- **Phát video trailer trong ứng dụng**: Phát URL video trực tiếp trong app bằng trình phát đa nền tảng. Trên Android/iOS, dùng MP4 trực tiếp; form chặn URL YouTube vì ứng dụng không nhúng trình phát YouTube.
- **Kiểm tra hợp lệ dữ liệu (Validation)**: Kiểm tra các trường bắt buộc, học phí không âm (`price >= 0`), thời lượng hợp lệ (`duration > 0`), kiểm tra `categoryId` tồn tại.
- **Trạng thái giao diện**: Xử lý đầy đủ màn hình tải (`Loading`), thông báo lỗi mạng/kết nối (`Error`) kèm nút Thử lại (`Retry`), và trạng thái danh sách rỗng (`Empty State`).
- **Cấu hình API linh hoạt**: Tích hợp sẵn hộp thoại cấu hình MockAPI ngay trong app, cho phép chuyển đổi giữa MockAPI trên mây và máy chủ mock API nội bộ.

---

## 📱 2. Cấu trúc 4 màn hình chính

| STT | Tên màn hình | Tên component | Mô tả chức năng |
|:---:|:---|:---|:---|
| **1** | **Danh sách khóa học** | `CourseListScreen` | Hiển thị thẻ khóa học (ảnh bìa, tên, giảng viên, tên danh mục lấy từ API, học phí VNĐ, thời lượng). Hỗ trợ tìm kiếm theo tên, thanh lọc theo danh mục, kéo để làm mới (Pull-to-refresh), nút nổi thêm khóa học, nút mở Quản lý danh mục và Cấu hình API. |
| **2** | **Chi tiết khóa học** | `CourseDetailScreen` | Hiển thị banner ảnh bìa, tên khóa học, danh mục, giảng viên, thời lượng, học phí, ngày tạo, mô tả đầy đủ. Nút **"Xem trailer"** phát video trực tiếp trong app, nút **"Chỉnh sửa"** và nút **"Xóa khóa học"** có hộp thoại xác nhận. |
| **3** | **Form Thêm / Sửa khóa học** | `CourseFormScreen` | Form nhập liệu: Tên, Mô tả, Giảng viên, Học phí, Thời lượng, URL ảnh bìa (có khung **xem trước ảnh bìa** ngay bên dưới), URL video trailer. Chọn danh mục qua Dropdown/Modal lấy từ API `/categories`. Kiểm tra validation chặt chẽ trước khi gửi POST/PUT. |
| **4** | **Quản lý danh mục** | `CategoryManagementScreen` | Danh sách danh mục lấy từ `/categories`, đếm số lượng khóa học liên kết. Thêm mới danh mục (POST), sửa danh mục (PUT), xóa danh mục (DELETE). **Đặc biệt:** Chặn thao tác xóa nếu danh mục đang có khóa học theo yêu cầu đề bài. |

---

## 🛠️ 3. Thiết kế dữ liệu & REST API Endpoints

### 3.1. Danh mục (`categories`)
```json
{
  "id": "1",
  "name": "Lập trình Mobile",
  "description": "Android, Flutter, React Native"
}
```

### 3.2. Khóa học (`courses`)
```json
{
  "id": "1",
  "title": "Lập trình Android cơ bản với Kotlin",
  "description": "Xây dựng ứng dụng Android với Kotlin...",
  "categoryId": "1",
  "instructor": "Nguyễn Văn A",
  "price": 500000,
  "duration": 30,
  "thumbnail": "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800",
  "trailerUrl": "https://www.w3schools.com/html/mov_bbb.mp4",
  "createdAt": "2026-10-10"
}
```

### 3.3. Bảng Endpoints chuẩn RESTful
- `GET /categories` — Lấy danh sách danh mục
- `POST /categories` — Thêm mới danh mục
- `PUT /categories/:id` — Sửa danh mục theo ID
- `DELETE /categories/:id` — Xóa danh mục theo ID
- `GET /courses` — Lấy danh sách khóa học
- `GET /courses/:id` — Lấy chi tiết khóa học theo ID
- `POST /courses` — Thêm mới khóa học
- `PUT /courses/:id` — Sửa khóa học theo ID
- `DELETE /courses/:id` — Xóa khóa học theo ID

---

## 🚀 4. Hướng dẫn thiết lập & Chạy ứng dụng

### 4.1. Cài đặt các gói phụ thuộc
Mở terminal PowerShell tại thư mục dự án và chạy:
```powershell
npm install
```

---

### 4.2. Thiết lập Backend API (Chọn 1 trong 2 cách)

#### 👉 Cách A: Dùng MockAPI.io thật (Khuyên dùng khi nộp bài)
1. Đăng nhập [https://mockapi.io/](https://mockapi.io/) bằng tài khoản GitHub/Google.
2. Tạo Project mới (ví dụ đặt tên: `CourseManagement`).
3. Tạo 2 Resources:
   - Resource 1: `categories` (các trường: `id`, `name`, `description`).
   - Resource 2: `courses` (các trường: `id`, `title`, `description`, `categoryId`, `instructor`, `price`, `duration`, `thumbnail`, `trailerUrl`, `createdAt`).
4. Copy Endpoint Base URL (Ví dụ: `https://670b8f057e5a228ebd6bf3ef.mockapi.io/api/v1`).
5. **Nạp dữ liệu mẫu (3 danh mục & 10 khóa học) tự động vào MockAPI chỉ với 1 lệnh:**
   ```powershell
   node scripts/seed-mockapi.mjs https://YOUR_PROJECT_ID.mockapi.io/api/v1
   ```
   *(Script sẽ tự động POST 3 danh mục và 10 khóa học với hình ảnh và video thật vào MockAPI của bạn!)*
   Thay `YOUR_PROJECT_ID` bằng project ID thật trên MockAPI; đường dẫn minh họa trong đề không phải API dùng được.
6. Trong ứng dụng, mở nút biểu tượng **⚙️** trên góc phải màn hình chính, dán URL MockAPI vào và nhấn **"Lưu & Tải lại"**.

---

#### 👉 Cách B: Dùng MockAPI Server cục bộ đi kèm (Chạy offline tức thì)
Dự án có sẵn một Mock REST API server chuẩn chuẩn Node.js không cần cài thêm thư viện phụ:
```powershell
# Chạy máy chủ mock API trên cổng 3000
npm run mock-api
```
Server sẽ chạy tại `http://localhost:3000/api/v1` với sẵn sàng 3 danh mục và 10 khóa học mẫu.

---

### 4.3. Khởi chạy ứng dụng Mobile

#### Chạy trên Trình duyệt Web (Nhanh nhất để chấm/test):
```powershell
npx expo start --web
```
Hoặc:
```powershell
npm run web
```

#### Chạy trên Máy ảo Android (Android Emulator):
```powershell
npx expo start --android
```

#### Chạy trên Điện thoại thật:
```powershell
npx expo start
```
Cài ứng dụng **Expo Go** trên điện thoại Android/iOS và quét mã QR hiển thị trong terminal.

---

## 🔍 5. Kiểm tra chất lượng mã nguồn (Verification)

1. **Kiểm tra TypeScript (Không có lỗi type nào):**
   ```powershell
   npx tsc --noEmit
   ```
2. **Kiểm tra đóng gói Web bundle:**
   ```powershell
   npx expo export --platform web
   ```

---

## 📁 6. Cấu trúc thư mục

```
BT_tham_khao_giua_ky/
├── App.tsx                        # Root Navigation & Cấu hình 4 màn hình
├── index.ts                       # Entry point Expo
├── app.json                       # Cấu hình dự án Expo
├── package.json                   # Khai báo thư viện & scripts
├── tsconfig.json                  # Cấu hình TypeScript nghiêm ngặt
├── data/
│   ├── categories.sample.json     # 3 danh mục mẫu chuẩn schema
│   └── courses.sample.json        # 10 khóa học mẫu với ảnh và video trailer thật
├── scripts/
│   ├── mock-api-server.mjs        # Server giả lập MockAPI chuẩn RESTful chạy offline
│   └── seed-mockapi.mjs           # Script tự động seed dữ liệu lên MockAPI.io
├── src/
│   ├── types/
│   │   ├── category.ts            # Định nghĩa kiểu dữ liệu Category
│   │   ├── course.ts              # Định nghĩa kiểu dữ liệu Course
│   │   └── navigation.ts          # Định nghĩa RootStackParamList & navigation props
│   ├── config/
│   │   └── apiConfig.ts           # Quản lý Base URL & lưu trữ vào AsyncStorage
│   ├── services/
│   │   └── api.ts                 # Toàn bộ hàm gọi REST API (CRUD, xử lý timeout/lỗi)
│   ├── components/
│   │   ├── CourseCard.tsx         # Thẻ hiển thị khóa học trong danh sách
│   │   ├── CategoryBadge.tsx      # Huy hiệu tên danh mục
│   │   ├── VideoPlayerModal.tsx   # Trình phát video trailer trong ứng dụng
│   │   ├── ApiConfigModal.tsx     # Hộp thoại đổi URL MockAPI & test kết nối
│   │   ├── LoadingView.tsx        # Màn hình đang tải
│   │   ├── ErrorView.tsx          # Màn hình báo lỗi kết nối kèm nút Thử lại
│   │   └── EmptyState.tsx         # Màn hình danh sách rỗng
│   ├── screens/
│   │   ├── CourseListScreen.tsx   # (1) Danh sách khóa học (Tìm kiếm, lọc, danh sách)
│   │   ├── CourseDetailScreen.tsx # (2) Chi tiết khóa học (Xem trailer, sửa, xóa)
│   │   ├── CourseFormScreen.tsx   # (3) Form thêm/sửa khóa học (Live preview ảnh)
│   │   └── CategoryManagementScreen.tsx # (4) Quản lý danh mục (Ràng buộc khóa ngoại)
│   └── theme/
│       └── colors.ts              # Bảng màu thiết kế giao diện
├── README.md                      # Tài liệu hướng dẫn sử dụng
└── HUONG_DAN_THUYET_TRINH.md      # Kịch bản chi tiết quay video thuyết trình nộp bài
```
