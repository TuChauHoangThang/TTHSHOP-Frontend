// Các hằng số dùng chung trong ứng dụng

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout'
};

export const PRODUCT_CATEGORIES = [
  'Tất cả',
  'Phụ kiện',
  'Túi xách',
  'Đồ trang trí',
  'Quần áo',
  'Khác'
];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

