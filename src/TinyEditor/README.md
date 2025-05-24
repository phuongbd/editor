# TinyEditor for Liquid Templates

## Chức năng highlight `{{ variable }}` và ẩn `{% tag %}`

- **Làm nổi bật biến Liquid** - Các biến Liquid `{{ variable }}` được làm nổi bật với nền xanh
- **Ẩn thẻ Liquid** - Các thẻ Liquid `{% tag %}` được ẩn hoàn toàn khỏi giao diện
- **Tương tác thông minh** - Khi nhấp vào biến Liquid, toàn bộ biến được chọn
- **Xóa thông minh** - Khi xóa một biến Liquid, toàn bộ biến được xóa thay vì từng ký tự

## Chức năng mention variable

### 1. Trích xuất biến Liquid

- Phân tích nội dung để tìm các biến Liquid
- Bỏ qua biến trong thuộc tính HTML, thẻ style và title
- So sánh với nội dung mặc định để gợi ý các biến còn thiếu

### 2. Gợi ý khi gõ (mention)

- Hiển thị menu gợi ý khi người dùng gõ `{{`
- Lọc danh sách biến theo từ khóa người dùng gõ
- Cho phép điều hướng bằng phím và chuột
- Chèn biến được chọn vào vị trí con trỏ

### 3. Tích hợp với chức năng highlighting hiện có

- Duy trì chức năng làm nổi bật biến Liquid hiện có
- Ẩn các thẻ Liquid như trước

### 4. Xử lý hình ảnh lỗi

- Đối với thẻ img lỗi, tự động thay thế bằng URL hình ảnh mặc định

### 5. Clean HTML trước khi lưu

- Thẻ span highlight, image lỗi, thẻ div bọc ngoài cùng
