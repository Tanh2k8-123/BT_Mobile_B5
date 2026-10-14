# KỊCH BẢN & HƯỚNG DẪN QUAY VIDEO THUYẾT TRÌNH BÀI TẬP GIỮA KỲ

> **Đề tài:** Xây dựng ứng dụng Quản lý khóa học (Course Management)  
> **Nền tảng:** React Native (Expo) & TypeScript | **Backend:** MockAPI.io (REST API)  
> **Thời lượng khuyến nghị:** 5 – 8 phút  

---

## 🎬 I. Chuẩn bị trước khi quay video

1. **Khởi động ứng dụng:**
   - Mở terminal: `npm run web` (hoặc `npx expo start --web` hoặc chạy trên máy ảo Android `npx expo start --android`).
   - Mở màn hình ứng dụng trên trình duyệt hoặc điện thoại.
2. **Chuẩn bị tab trình duyệt:**
   - Tab 1: Trang web [MockAPI.io](https://mockapi.io) mở project của bạn (hoặc màn hình terminal chạy `npm run mock-api`).
   - Tab 2: Ứng dụng Course Management đang chạy.
   - Tab 3: Phần mềm quay màn hình (OBS Studio, Xbox Game Bar `Win + G`, hoặc CapCut / Loom).

---

## 🎙️ II. Kịch bản thuyết trình chi tiết (Lời thoại & Hành động mẫu)

### ⏱️ Phần 1: Mở đầu & Giới thiệu đề tài (Khoảng 45 giây)
* **Hành động:** Hiển thị màn hình chính của ứng dụng và slide/thông tin cá nhân.
* **Lời thoại gợi ý:**
  > *"Kính chào Thầy/Cô và các bạn! Em tên là [Họ và tên sinh viên], mã số sinh viên là [Mã sinh viên]. Hôm nay em xin phép được thuyết trình và demo sản phẩm bài tập giữa kỳ môn Lập trình Mobile App với đề tài: **Xây dựng ứng dụng Quản lý khóa học (Course Management)**.*  
  > *Ứng dụng được em xây dựng trên nền tảng **React Native với Expo và TypeScript**, kết nối cơ sở dữ liệu qua **REST API** sử dụng **MockAPI.io**.*  
  > *Toàn bộ các yêu cầu từ CRUD, xử lý JSON, tải ảnh từ URL, phát trailer video trực tiếp trong app, tìm kiếm, lọc dữ liệu cho đến ràng buộc toàn vẹn khóa ngoại đều đã được hoàn thiện đúng và đủ 100%."*

---

### ⏱️ Phần 2: Giải thích Thiết kế dữ liệu & REST API (Khoảng 1 phút)
* **Hành động:** Chuyển sang tab MockAPI.io hoặc file `data/` trong Visual Studio Code để chỉ rõ 2 resources.
* **Lời thoại gợi ý:**
  > *"Đầu tiên, về phần thiết kế dữ liệu, hệ thống gồm 2 resources chuẩn RESTful:*  
  > *1. Resource `categories`: Gồm `id`, `name`, và `description` với 3 danh mục mẫu: Lập trình Mobile, Lập trình Web và Trí tuệ nhân tạo.*  
  > *2. Resource `courses`: Gồm các trường `id`, `title`, `description`, `categoryId`, `instructor`, `price`, `duration`, `thumbnail`, `trailerUrl`, và `createdAt` với 10 khóa học mẫu thực tế.*  
  > *Quan hệ giữa hai bảng là 1-N. Mỗi khóa học thuộc đúng một danh mục thông qua `categoryId`. Trong ứng dụng, tên danh mục hoàn toàn được lấy động từ API `/categories`, tuyệt đối không dùng dữ liệu hardcode."*

---

### ⏱️ Phần 3: Demo Chức năng 1 — Danh sách khóa học (Khoảng 1 phút 15 giây)
* **Hành động:** Thao tác trên màn hình Danh sách khóa học (`CourseListScreen`).
  - Kéo xuống để Refresh (kích hoạt `RefreshControl`).
  - Gõ vào ô tìm kiếm: ví dụ gõ `"Kotlin"` hoặc `"React"`.
  - Bấm chọn chip lọc danh mục: bấm `"Lập trình Mobile"`, `"Lập trình Web"`, `"Trí tuệ nhân tạo"`.
* **Lời thoại gợi ý:**
  > *"Đây là màn hình đầu tiên: **Danh sách khóa học**.*  
  > *Khi màn hình khởi tạo, ứng dụng dùng `Promise.all` để gọi đồng thời 2 API `GET /courses` và `GET /categories`. Sau đó tự động map `categoryId` sang `categoryName` để hiển thị huy hiệu danh mục trên từng thẻ khóa học.*  
  > *Mỗi thẻ hiển thị đầy đủ ảnh bìa lấy từ URL, tên khóa học, giảng viên, thời lượng, huy hiệu danh mục và học phí được format chuẩn VNĐ.*  
  > *Em xin demo tính năng **tìm kiếm theo tên**: Khi em gõ 'Kotlin', danh sách lọc realtime ngay lập tức.*  
  > *Tiếp theo là **lọc theo danh mục**: Khi em bấm chọn chip 'Lập trình Mobile', ứng dụng chỉ hiển thị các khóa học thuộc danh mục đó kèm số lượng khóa học trong từng danh mục."*

---

### ⏱️ Phần 4: Demo Chức năng 2 — Chi tiết khóa học & Phát video trailer (Khoảng 1 phút 15 giây)
* **Hành động:** 
  - Bấm vào một thẻ khóa học (ví dụ: *"Lập trình Android cơ bản với Kotlin"*).
  - Chỉ ra các thông tin chi tiết: ảnh bìa hero banner, học phí, giảng viên, mã khóa học, mô tả.
  - Bấm nút **"▶ Xem trailer giới thiệu"**.
  - Video trailer mở ra trong popup modal và phát trực tiếp mượt mà. Sau đó bấm nút đóng ✕.
* **Lời thoại gợi ý:**
  > *"Khi bấm vào một khóa học, ứng dụng chuyển sang màn hình thứ hai: **Chi tiết khóa học** thông qua Navigation.*  
  > *Ứng dụng gọi API `GET /courses/{id}` để lấy dữ liệu mới nhất từ server. Giao diện hiển thị banner ảnh bìa, tên khóa học, học phí nổi bật, thông tin giảng viên, thời lượng và toàn bộ phần mô tả chi tiết.*  
  > *Đặc biệt, theo yêu cầu đề bài về phát video trailer trực tiếp trong ứng dụng: Em bấm nút **'Xem trailer giới thiệu'**.*  
  > *Một trình phát video chuyên dụng xuất hiện ngay trong ứng dụng, tải và phát luồng video MP4 trực tiếp không cần chuyển ra ứng dụng ngoài, có đầy đủ các nút điều khiển play/pause/fullscreen."*

---

### ⏱️ Phần 5: Demo Chức năng 3 — Thêm khóa học mới (Khoảng 1 phút 15 giây)
* **Hành động:**
  - Quay lại màn hình chính, bấm nút FAB **"＋ Thêm khóa học"**.
  - Demo Dropdown danh mục: bấm vào và thấy danh sách tải từ API `categories`.
  - Nhập URL ảnh: dán 1 link ảnh và chỉ vào khung **Xem trước ảnh bìa (Live Preview)** hiển thị ngay bên dưới.
  - Demo validation: thử nhập học phí âm `-50000` hoặc để trống -> bấm Lưu -> App hiện thông báo lỗi từ chối lưu.
  - Nhập dữ liệu hợp lệ:
    + Tên: *"Khóa học Kiểm thử Tự động Automation Testing"*
    + Danh mục: *"Lập trình Web"*
    + Giảng viên: *"Thầy Hoàng Minh"*
    + Học phí: `600000`
    + Thời lượng: `35`
    + URL ảnh: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800`
    + URL trailer: `https://www.w3schools.com/html/mov_bbb.mp4`
    + Mô tả: *"Khóa học đào tạo Selenium và Playwright từ cơ bản đến nâng cao."*
  - Bấm **"➕ Lưu khóa học mới"** -> Hiện thông báo thành công -> Tự động quay lại danh sách và thấy khóa học mới xuất hiện ngay đầu danh sách!
* **Lời thoại gợi ý:**
  > *"Bây giờ em xin demo chức năng **Thêm khóa học mới**.*  
  > *Ở form nhập liệu, danh mục được chọn thông qua Dropdown Modal được lấy trực tiếp từ API `/categories`.*  
  > *Khi nhập URL ảnh bìa, ứng dụng có tính năng **Xem trước ảnh (Preview)** thời gian thực ngay bên dưới.*  
  > *Hệ thống kiểm tra validation nghiêm ngặt: Nếu em nhập học phí là số âm hoặc để trống trường bắt buộc, hệ thống sẽ cảnh báo ngay và không cho phép lưu.*  
  > *Khi em điền đầy đủ dữ liệu hợp lệ và bấm Lưu, ứng dụng gửi request `POST /courses` lên MockAPI. Sau khi thành công, ứng dụng tự động đồng bộ lại danh sách khóa học và ta thấy khóa học mới đã xuất hiện."*

---

### ⏱️ Phần 6: Demo Chức năng 4 — Sửa & Xóa khóa học (Khoảng 45 giây)
* **Hành động:**
  - Bấm vào khóa học vừa tạo.
  - Bấm **"✏️ Chỉnh sửa khóa học"** -> Sửa học phí thành `750000` -> Bấm **"💾 Cập nhật khóa học"** -> Thấy giá tiền được cập nhật.
  - Bấm **"🗑️ Xóa khóa học"** -> Hiện hộp thoại Alert xác nhận -> Bấm **"Xóa vĩnh viễn"** -> Ứng dụng gửi `DELETE /courses/{id}` -> Quay lại danh sách và thấy khóa học đã biến mất.
* **Lời thoại gợi ý:**
  > *"Tiếp theo là thao tác **Sửa và Xóa khóa học**:*  
  > *Khi bấm Chỉnh sửa, form sẽ load lại toàn bộ dữ liệu hiện tại của khóa học. Em chỉnh sửa học phí và bấm Cập nhật, ứng dụng gửi `PUT /courses/{id}` lên server.*  
  > *Để tránh việc người dùng bấm nhầm, khi bấm Xóa khóa học, ứng dụng hiển thị hộp thoại xác nhận rõ ràng. Khi em bấm 'Xóa vĩnh viễn', ứng dụng gửi request `DELETE /courses/{id}`, xóa thành công và đồng bộ lại backend."*

---

### ⏱️ Phần 7: Demo Chức năng 5 — Quản lý danh mục & Ràng buộc toàn vẹn dữ liệu (Khoảng 1 phút)
* **Hành động:**
  - Từ màn hình chính, bấm nút **"📂 Danh mục"** ở thanh tiêu đề -> Chuyển sang `CategoryManagementScreen`.
  - Chỉ ra số lượng khóa học liên kết hiển thị trên từng danh mục: ví dụ *"Lập trình Mobile (4 khóa học)"*.
  - Bấm nút **"🗑️ Xóa"** trên danh mục đang có 4 khóa học -> **App bật thông báo: "🚫 Không thể xóa danh mục! Danh mục đang có 4 khóa học liên kết..."**.
  - Demo Thêm danh mục mới: bấm **"＋ Thêm danh mục"** -> Tên: *"Điện toán đám mây"*, Mô tả: *"AWS, Azure, GCP"* -> Bấm Thêm -> Danh mục xuất hiện với `0 khóa học`.
  - Thử Xóa danh mục mới (0 khóa học) -> Xác nhận xóa -> Xóa thành công!
* **Lời thoại gợi ý:**
  > *"Màn hình thứ tư là **Quản lý danh mục** (`GET /categories`).*  
  > *Tại đây, ứng dụng thống kê số lượng khóa học đang thuộc từng danh mục.*  
  > *Theo đúng yêu cầu tại mục 3.5 của đề bài: **Không cho xóa danh mục đang có khóa học**, ứng dụng đã kiểm tra ràng buộc này ở phía client:*  
  > *Khi em bấm Xóa danh mục 'Lập trình Mobile', ứng dụng phát hiện đang có 4 khóa học thuộc danh mục này nên đã lập tức CHẶN THAO TÁC XÓA và cảnh báo người dùng cần chuyển hoặc xóa các khóa học trước.*  
  > *Còn khi em tạo một danh mục mới chưa có khóa học nào, hệ thống sẽ cho phép xóa bình thường sau khi xác nhận."*

---

### ⏱️ Phần 8: Demo Xử lý lỗi mạng & Cấu hình API động (Khoảng 30 giây)
* **Hành động:**
  - Bấm nút bánh răng **⚙️** trên góc phải màn hình chính.
  - Cho thấy URL MockAPI hiện tại. Bấm nút **"Kiểm tra kết nối"** -> Báo thành công màu xanh.
* **Lời thoại gợi ý:**
  > *"Cuối cùng, ứng dụng được trang bị màn hình **Cấu hình MockAPI URL động**. Thầy/Cô và người dùng có thể dễ dàng thay đổi địa chỉ MockAPI bất cứ lúc nào, kiểm tra ping kết nối trước khi lưu vào AsyncStorage mà không cần phải sửa code hay build lại app."*

---

### ⏱️ Phần 9: Kết luận (Khoảng 15 giây)
* **Lời thoại gợi ý:**
  > *"Trên đây là toàn bộ phần demo sản phẩm Quản lý khóa học của em. Ứng dụng đã hoàn thành đúng, đủ và trọn vẹn tất cả các yêu cầu trong đề bài. Em xin chân thành cảm ơn Thầy/Cô đã theo dõi!"*

---

## 🏆 Checklist tự kiểm tra trước khi nộp bài

- [x] Đã có source code hoàn chỉnh trong thư mục dự án.
- [x] Đã có 4 màn hình: (1) Danh sách, (2) Chi tiết, (3) Form thêm/sửa, (4) Quản lý danh mục.
- [x] Tối thiểu 3 danh mục và 10 khóa học mẫu trong file `data/` và script seed.
- [x] Tên danh mục lấy từ API, không hardcode.
- [x] Chặn xóa danh mục đang có khóa học liên kết.
- [x] Trailer phát được trực tiếp trong ứng dụng.
- [x] Form có chức năng xem trước ảnh bìa từ URL.
- [x] Validation đầy đủ: kiểm tra bắt buộc, học phí không âm, categoryId tồn tại.
- [x] File `README.md` hướng dẫn chạy chi tiết.
- [x] File `HUONG_DAN_THUYET_TRINH.md` hướng dẫn quay video thuyết trình.
