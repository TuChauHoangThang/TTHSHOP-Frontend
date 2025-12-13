// Fake API Service - Mô phỏng API calls
// Lưu trữ dữ liệu trong localStorage hoặc memory

// Simulate delay của API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Users data (lưu trong localStorage)
const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Products data
const getProducts = () => {
  const products = localStorage.getItem('products');
  if (products) return JSON.parse(products);
  
  // Dữ liệu mẫu cho sản phẩm handmade
  const sampleProducts = [
    {
      id: 1,
      name: 'Vòng tay handmade',
      price: 150000,
      image: '/images/product1.jpg',
      description: 'Vòng tay handmade từ vải và hạt gỗ',
      category: 'Phụ kiện',
      stock: 10
    },
    {
      id: 2,
      name: 'Túi vải handmade',
      price: 250000,
      image: '/images/product2.jpg',
      description: 'Túi vải thân thiện môi trường',
      category: 'Túi xách',
      stock: 5
    }
  ];
  localStorage.setItem('products', JSON.stringify(sampleProducts));
  return sampleProducts;
};

// API Functions
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    await delay(500);
    const users = getUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
  },

  // Đăng nhập
  login: async (email, password) => {
    await delay(500);
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    return { success: true, user: { ...user, password: undefined } };
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  },

  // Lưu user đã đăng nhập
  setCurrentUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('currentUser');
  }
};

export const productsAPI = {
  // Lấy tất cả sản phẩm
  getAll: async () => {
    await delay(300);
    return getProducts();
  },

  // Lấy sản phẩm theo ID
  getById: async (id) => {
    await delay(300);
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(id));
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }
    return product;
  },

  // Tìm kiếm sản phẩm
  search: async (keyword) => {
    await delay(300);
    const products = getProducts();
    return products.filter(p => 
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.description.toLowerCase().includes(keyword.toLowerCase())
    );
  }
};

export const cartAPI = {
  // Lấy giỏ hàng
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  // Thêm vào giỏ hàng
  addToCart: (productId, quantity = 1) => {
    const cart = cartAPI.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  // Cập nhật số lượng
  updateQuantity: (productId, quantity) => {
    const cart = cartAPI.getCart();
    const item = cart.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    return cart;
  },

  // Xóa khỏi giỏ hàng
  removeFromCart: (productId) => {
    const cart = cartAPI.getCart();
    const newCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(newCart));
    return newCart;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    localStorage.removeItem('cart');
  }
};

