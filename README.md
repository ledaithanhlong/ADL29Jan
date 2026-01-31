# Lê Đại Thanh Long - 2280601752

# Product Catalog - Static Website

## Giới thiệu

Đây là một website tĩnh hiển thị danh sách sản phẩm được load từ file `db.json`. Project sử dụng HTML, CSS và JavaScript thuần túy, không sử dụng bất kỳ framework hay thư viện ngoài nào.

## Mục tiêu bài làm

- Xây dựng website tĩnh sử dụng HTML5, CSS3 và JavaScript thuần
- Sử dụng Fetch API để load dữ liệu từ file JSON
- Render dữ liệu động lên giao diện web
- Áp dụng các best practices trong việc tổ chức code và xử lý dữ liệu
- Tạo giao diện responsive và thân thiện với người dùng

## Cấu trúc thư mục

```
/
├── index.html      # File HTML chính
├── script.js       # File JavaScript xử lý logic
├── db.json         # File dữ liệu JSON
├── README.md       # File hướng dẫn (file này)
└── RULE.md         # File quy tắc phát triển
```

## Cách chạy project

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### Bước 2: Chạy project

**Mở trực tiếp bằng browser**

http://localhost:8000/index.html


## Cách fetch dữ liệu từ db.json

### Quy trình xử lý dữ liệu

1. **Fetch API**: Sử dụng `fetch()` để gửi HTTP request đến file `db.json`
   ```javascript
   fetch('./db.json')
   ```

2. **Parse JSON**: Chuyển đổi response thành JavaScript object
   ```javascript
   .then(response => response.json())
   ```

3. **Render dữ liệu**: Loop qua mảng dữ liệu và tạo HTML động
   ```javascript
   .then(data => renderProducts(data))
   ```

4. **Error Handling**: Xử lý lỗi nếu fetch thất bại
   ```javascript
   .catch(error => console.error('Error:', error))
   ```

### Luồng dữ liệu

```
db.json → fetch() → parse JSON → loop data → create HTML elements → append to DOM
```

## Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và responsive design
- **JavaScript (ES5/ES6)**: Logic xử lý và render dữ liệu
- **Fetch API**: Load dữ liệu từ JSON file

## Tác giả

Lê Đại Thanh Long - 2280601752

## License

Educational Purpose Only
