# Project Development Rules

## 1. General Rules

- **Chỉ sử dụng HTML, CSS, JavaScript thuần túy**
  - Không sử dụng framework (React, Vue, Angular)
  - Không sử dụng thư viện ngoài (jQuery, Lodash, etc.)
  - Không sử dụng CDN

- **Code phải rõ ràng và dễ đọc**
  - Indent đúng chuẩn (2 hoặc 4 spaces)
  - Tên biến và hàm phải có ý nghĩa
  - Tránh code phức tạp không cần thiết

- **Ưu tiên tính học thuật và thực tế**
  - Code phải dễ hiểu cho người mới học
  - Áp dụng best practices cơ bản
  - Comment đầy đủ cho logic quan trọng

## 2. Naming Convention

### File names
- Sử dụng **lowercase**
- Ví dụ: `index.html`, `script.js`, `db.json`

### JavaScript variables và functions
- Sử dụng **camelCase**
- Ví dụ: `fetchData`, `productCard`, `appElement`

### HTML IDs và Classes
- Sử dụng **kebab-case**
- Ví dụ: `product-card`, `product-title`, `app-container`

### Constants
- Sử dụng **UPPER_CASE**
- Ví dụ: `DATA_URL`, `API_KEY`

## 3. Data Rules

- **Dữ liệu phải lấy từ db.json**
  - Không hard-code dữ liệu trong JavaScript
  - Không tạo mock data trong code

- **Xử lý dữ liệu an toàn**
  - Luôn kiểm tra dữ liệu tồn tại trước khi sử dụng
  - Sử dụng fallback values cho dữ liệu thiếu
  - Validate dữ liệu trước khi render

## 4. JavaScript Rules

- **Không sử dụng thư viện ngoài**
  - Chỉ sử dụng vanilla JavaScript
  - Sử dụng Web APIs có sẵn (Fetch API, DOM API)

- **Mỗi function chỉ làm một việc**
  - Single Responsibility Principle
  - Function ngắn gọn, dễ hiểu
  - Tên function phải mô tả đúng chức năng

- **Comment cho logic chính**
  - Comment giải thích "tại sao", không phải "cái gì"
  - Comment cho các đoạn code phức tạp
  - Không comment quá nhiều cho code đơn giản

- **Error Handling**
  - Luôn có try-catch hoặc .catch() cho async operations
  - Hiển thị thông báo lỗi thân thiện với người dùng
  - Log lỗi ra console để debug

## 5. Git Rules

- **Commit message rõ nghĩa**
  - Sử dụng tiếng Anh hoặc tiếng Việt nhất quán
  - Format: `<type>: <description>`
  - Ví dụ: `feat: add product card component`, `fix: resolve fetch error`

- **Commit types**
  - `feat`: Thêm tính năng mới
  - `fix`: Sửa lỗi
  - `docs`: Cập nhật documentation
  - `style`: Thay đổi CSS/styling
  - `refactor`: Refactor code

- **Không commit file thừa**
  - Sử dụng `.gitignore`
  - Không commit `node_modules`, `.DS_Store`, etc.
  - Chỉ commit source code và assets cần thiết

## 6. HTML Rules

- **Sử dụng HTML5 semantic tags**
  - `<header>`, `<main>`, `<footer>`, `<section>`, etc.
  - Cải thiện SEO và accessibility

- **Không inline JavaScript**
  - Tách riêng JS vào file `.js`
  - Sử dụng `<script src="..."></script>`

- **Attributes đầy đủ**
  - `alt` cho images
  - `title` cho links
  - `lang` cho html tag

## 7. CSS Rules

- **Tổ chức CSS logic**
  - Reset/normalize trước
  - Layout styles
  - Component styles
  - Utility classes

- **Responsive design**
  - Mobile-first approach
  - Sử dụng media queries
  - Flexible layouts (flexbox, grid)

- **Naming conventions**
  - BEM hoặc kebab-case nhất quán
  - Tránh tên class quá chung chung

## 8. Performance Rules

- **Optimize images**
  - Sử dụng format phù hợp (WebP, JPEG, PNG)
  - Compress images trước khi sử dụng

- **Minimize DOM manipulation**
  - Batch DOM updates
  - Sử dụng DocumentFragment khi cần

- **Lazy loading khi cần thiết**
  - Load images on demand
  - Defer non-critical scripts

---

**Lưu ý:** Các quy tắc này phải được tuân thủ nghiêm ngặt trong suốt quá trình phát triển project.
