# Cấu Trúc Dự Án TTH Shop - Handmade E-commerce

## Tổng Quan
Dự án web thương mại điện tử bán đồ handmade sử dụng React và fake API (localStorage).

## Cấu Trúc Thư Mục

```
src/
├── components/          # Các component tái sử dụng
│   └── Layout/          # Layout components (Header, Footer, Layout)
│       ├── Header.js
│       ├── Footer.js
│       └── Layout.js
│   └── ProtectedRoute.js  # Component bảo vệ route
│
├── pages/               # Các trang chính của ứng dụng
│   ├── HomePage.js      # Trang chủ
│   ├── ProductsPage.js  # Trang danh sách sản phẩm
│   ├── ProductDetailPage.js  # Trang chi tiết sản phẩm
│   ├── LoginPage.js     # Trang đăng nhập
│   ├── RegisterPage.js  # Trang đăng ký
│   ├── UserProfilePage.js  # Trang thông tin người dùng
│   ├── CartPage.js      # Trang giỏ hàng
│   └── CheckoutPage.js  # Trang thanh toán
│
├── context/             # React Context cho state management
│   ├── AuthContext.js   # Quản lý authentication
│   └── CartContext.js   # Quản lý giỏ hàng
│
├── services/            # Fake API services
│   └── fakeApi.js       # Tất cả các API calls (auth, products, cart)
│
├── hooks/               # Custom React hooks
│   └── useProducts.js   # Hook để quản lý products
│
├── utils/               # Các hàm tiện ích
│   ├── constants.js     # Các hằng số
│   └── formatPrice.js   # Format giá tiền
│
├── assets/              # Hình ảnh, icons (tạo sau)
│
├── App.js               # Component chính, routing
└── index.js             # Entry point
```

## Các Tính Năng Đã Thiết Lập

### 1. Authentication (Đăng ký/Đăng nhập)
- **Context**: `AuthContext` quản lý trạng thái đăng nhập
- **Pages**: `LoginPage`, `RegisterPage`
- **Service**: `authAPI` trong `fakeApi.js`
- **Storage**: Lưu user trong localStorage

### 2. Trang Người Dùng
- **Page**: `UserProfilePage`
- **Protected Route**: Chỉ truy cập khi đã đăng nhập

### 3. Giỏ Hàng
- **Context**: `CartContext` quản lý giỏ hàng
- **Page**: `CartPage`
- **Service**: `cartAPI` trong `fakeApi.js`
- **Storage**: Lưu giỏ hàng trong localStorage

### 4. Thanh Toán
- **Page**: `CheckoutPage`
- **Protected Route**: Chỉ truy cập khi đã đăng nhập

### 5. Trang Chủ
- **Page**: `HomePage`

### 6. Trang Sản Phẩm
- **Pages**: `ProductsPage` (danh sách), `ProductDetailPage` (chi tiết)
- **Service**: `productsAPI` trong `fakeApi.js`
- **Hook**: `useProducts` để quản lý products

## Routing

Sử dụng `react-router-dom`:
- `/` - Trang chủ
- `/products` - Danh sách sản phẩm
- `/products/:id` - Chi tiết sản phẩm
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/cart` - Giỏ hàng
- `/profile` - Trang người dùng (protected)
- `/checkout` - Thanh toán (protected)

## Fake API

Tất cả dữ liệu được lưu trong **localStorage**:
- `users` - Danh sách người dùng
- `currentUser` - User hiện tại đã đăng nhập
- `products` - Danh sách sản phẩm
- `cart` - Giỏ hàng

## Cài Đặt Dependencies

```bash
npm install react-router-dom
```

## Các Bước Tiếp Theo

1. **Cài đặt react-router-dom** (nếu chưa có)
2. **Tạo UI components** cho các trang
3. **Thêm dữ liệu sản phẩm mẫu** vào fakeApi.js
4. **Styling** - Có thể dùng CSS, Tailwind CSS, hoặc styled-components
5. **Tối ưu hóa** - Thêm loading states, error handling

## Lưu Ý

- Tất cả dữ liệu lưu trong localStorage, sẽ mất khi clear browser data
- Fake API có delay để mô phỏng API thật
- Protected routes yêu cầu đăng nhập

