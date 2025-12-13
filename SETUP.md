# Hướng Dẫn Cài Đặt

## Bước 1: Cài đặt react-router-dom

Dự án sử dụng `react-router-dom` để quản lý routing. Bạn cần cài đặt package này:

```bash
npm install react-router-dom
```

## Bước 2: Chạy dự án

```bash
npm start
```

Dự án sẽ chạy tại `http://localhost:3000`

## Cấu Trúc Đã Tạo

✅ **Pages**: Tất cả các trang đã được tạo (Home, Products, Login, Register, Profile, Cart, Checkout)
✅ **Context**: AuthContext và CartContext để quản lý state
✅ **Services**: Fake API service với localStorage
✅ **Routing**: Đã cấu hình routing với protected routes
✅ **Components**: Layout components (Header, Footer)

## Lưu Ý

- Cần cài đặt `react-router-dom` trước khi chạy
- Dữ liệu được lưu trong localStorage (sẽ mất khi clear browser)
- Các route `/profile` và `/checkout` yêu cầu đăng nhập

