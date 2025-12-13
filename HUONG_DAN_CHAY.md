# Hướng Dẫn Chạy Dự Án

## Bước 1: Cài đặt react-router-dom

Mở **Terminal/PowerShell** trong thư mục dự án và chạy:

```bash
npm install react-router-dom
```

Hoặc nếu bạn dùng **yarn**:

```bash
yarn add react-router-dom
```

## Bước 2: Chạy dự án

Sau khi cài đặt xong, chạy lệnh:

```bash
npm start
```

Hoặc với yarn:

```bash
yarn start
```

## Bước 3: Mở trình duyệt

Dự án sẽ tự động mở tại: **http://localhost:3000**

## Các Trang Có Thể Truy Cập

- `/` - Trang chủ
- `/products` - Danh sách sản phẩm
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/cart` - Giỏ hàng
- `/profile` - Trang người dùng (cần đăng nhập)
- `/checkout` - Thanh toán (cần đăng nhập)

## Lưu Ý

- Nếu gặp lỗi, hãy đảm bảo đã cài đặt Node.js và npm
- Dữ liệu được lưu trong localStorage của trình duyệt
- Các trang protected (profile, checkout) sẽ tự động chuyển về trang login nếu chưa đăng nhập

