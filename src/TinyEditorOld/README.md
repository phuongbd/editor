# TinyEditor for Liquid Templates

A customized TinyMCE editor with support for Liquid template syntax.

## Features

- **Liquid Syntax Support**: Highlights Liquid variables and tags in the editor
- **Variable Insertion**: Type `{{` to trigger a popover menu of available Liquid variables
- **Responsive Design**: Works well on different screen sizes
- **Customizable**: Easy to extend with additional plugins and features

## Usage

```jsx
import TinyEditor from './TinyEditor';

<TinyEditor
  initialValue="<p>Hello {{ customer.name }}</p>"
  onChange={(content) => console.log('Content changed:', content)}
  liquidSupport={true}
  mentionSupport={true}
  height={400}
/>
```

## Recent Fixes

### Cursor Positioning Fix (2024-09-26)

Fixed an issue where the cursor wasn't positioning correctly after inserting a Liquid variable from the popover menu. Our solution now uses a direct DOM marker technique:

1. We insert a temporary DOM marker (span element) directly after the variant
2. We then position the cursor right after this marker using native DOM positioning
3. The marker is then immediately removed from the DOM
4. This ensures the cursor is placed in a way that makes it visible to the user
5. The user can immediately continue typing after inserting a variant

This approach is more reliable than previous methods because it:
- Works directly with the DOM structure instead of text offsets
- Doesn't rely on finding specific text patterns that might be split across nodes
- Ensures the cursor is positioned in a way that makes it visible to the user
- Is compatible with all browsers and TinyMCE versions

## Development

Run the demo component to test the editor functionality:

```jsx
import LiquidEditorDemo from './TinyEditor/LiquidEditorDemo';

// In your main app
<LiquidEditorDemo />
```

***Chức năng highlight {{ variable }} và ẩn {% tag %}
- Làm nổi bật biến Liquid - Các biến Liquid {{ variable }} được làm nổi bật với nền xanh
- Ẩn thẻ Liquid - Các thẻ Liquid {% tag %} được ẩn hoàn toàn khỏi giao diện
- Tương tác thông minh - Khi nhấp vào biến Liquid, toàn bộ biến được chọn
- Xóa thông minh - Khi xóa một biến Liquid, toàn bộ biến được xóa thay vì từng ký tự

***Chức năng mention variable
1. Trích xuất biến Liquid:
- Phân tích nội dung để tìm các biến Liquid
- Bỏ qua biến trong thuộc tính HTML, thẻ style và title
- So sánh với nội dung mặc định để gợi ý các biến còn thiếu
2. Gợi ý khi gõ:
- Hiển thị menu gợi ý khi người dùng gõ "{{"
- Lọc danh sách biến theo từ khóa người dùng gõ
- Cho phép điều hướng bằng phím và chuột
- Chèn biến được chọn vào vị trí con trỏ
3. Tích hợp với chức năng highlighting hiện có:
- Duy trì chức năng làm nổi bật biến Liquid hiện có
- Ẩn các thẻ Liquid như trước