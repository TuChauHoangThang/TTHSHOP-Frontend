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
  
  // Dữ liệu mẫu phong phú cho sản phẩm handmade
  const sampleProducts = [
    {
      id: 1,
      name: 'Vòng tay handmade từ hạt gỗ tự nhiên',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      description: 'Vòng tay handmade độc đáo được làm từ hạt gỗ tự nhiên, kết hợp với dây da mềm mại. Sản phẩm thân thiện với môi trường, phù hợp cho mọi lứa tuổi.',
      category: 'Phụ kiện',
      stock: 10,
      rating: 4.5,
      reviews: 23,
      tags: ['handmade', 'gỗ', 'phụ kiện'],
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400'
      ]
    },
    {
      id: 2,
      name: 'Túi vải handmade thân thiện môi trường',
      price: 250000,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
      description: 'Túi vải canvas handmade với thiết kế đơn giản nhưng tinh tế. Kích thước vừa phải, phù hợp cho việc đi chợ, đi học hoặc đi làm. Có thể giặt máy.',
      category: 'Túi xách',
      stock: 5,
      rating: 4.8,
      reviews: 15,
      tags: ['handmade', 'vải', 'thân thiện môi trường'],
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
      ]
    },
    {
      id: 3,
      name: 'Khăn choàng len handmade',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      description: 'Khăn choàng len ấm áp được đan tay với chất liệu len mềm mại. Thiết kế hoa văn độc đáo, màu sắc đa dạng. Phù hợp cho mùa đông.',
      category: 'Thời trang',
      stock: 8,
      rating: 4.7,
      reviews: 31,
      tags: ['handmade', 'len', 'mùa đông'],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
      ]
    },
    {
      id: 4,
      name: 'Nến thơm handmade từ sáp ong',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
      description: 'Nến thơm được làm từ sáp ong tự nhiên, có mùi hương dịu nhẹ. Thời gian cháy lâu, an toàn cho sức khỏe. Có nhiều mùi hương để lựa chọn.',
      category: 'Trang trí',
      stock: 12,
      rating: 4.6,
      reviews: 42,
      tags: ['handmade', 'nến', 'sáp ong', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400',
        'https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400'
      ]
    },
    {
      id: 5,
      name: 'Tranh thêu tay hoa sen',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
      description: 'Tranh thêu tay với hình ảnh hoa sen thanh tao. Được thêu bằng chỉ lụa cao cấp, khung gỗ tự nhiên. Phù hợp trang trí phòng khách hoặc phòng ngủ.',
      category: 'Trang trí',
      stock: 3,
      rating: 5.0,
      reviews: 18,
      tags: ['handmade', 'thêu', 'tranh', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400'
      ]
    },
    {
      id: 6,
      name: 'Bộ ly sứ vẽ tay',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400',
      description: 'Bộ 4 ly sứ được vẽ tay với hoa văn độc đáo. Mỗi ly có thiết kế riêng biệt, không chiếc nào giống chiếc nào. An toàn cho sức khỏe, có thể dùng trong lò vi sóng.',
      category: 'Đồ dùng',
      stock: 6,
      rating: 4.4,
      reviews: 27,
      tags: ['handmade', 'sứ', 'ly', 'vẽ tay'],
      images: [
        'https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400',
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'
      ]
    },
    {
      id: 7,
      name: 'Ví da handmade',
      price: 380000,
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      description: 'Ví da bò thật được làm thủ công, có nhiều ngăn tiện lợi. Chất liệu da mềm, bền đẹp theo thời gian. Thiết kế tối giản, phù hợp cho cả nam và nữ.',
      category: 'Phụ kiện',
      stock: 4,
      rating: 4.9,
      reviews: 35,
      tags: ['handmade', 'da', 'ví', 'phụ kiện'],
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
      ]
    },
    {
      id: 8,
      name: 'Móc khóa đất sét nung',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      description: 'Móc khóa được nặn từ đất sét và nung thủ công. Có nhiều hình dạng đáng yêu như động vật, hoa quả. Màu sắc tươi sáng, bền màu.',
      category: 'Phụ kiện',
      stock: 20,
      rating: 4.3,
      reviews: 56,
      tags: ['handmade', 'đất sét', 'móc khóa'],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
      ]
    },
    {
      id: 9,
      name: 'Gối tựa lưng thêu hoa',
      price: 220000,
      image: 'https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400',
      description: 'Gối tựa lưng được thêu tay với hoa văn tinh tế. Ruột gối làm từ bông tự nhiên, vỏ gối bằng vải cotton mềm mại. Kích thước 40x40cm.',
      category: 'Trang trí',
      stock: 7,
      rating: 4.6,
      reviews: 19,
      tags: ['handmade', 'gối', 'thêu', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400',
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
      ]
    },
    {
      id: 10,
      name: 'Bình hoa gốm sứ handmade',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      description: 'Bình hoa gốm sứ được nung thủ công với hoa văn độc đáo. Kích thước vừa phải, phù hợp để cắm hoa tươi hoặc hoa khô. Màu sắc tự nhiên, sang trọng.',
      category: 'Trang trí',
      stock: 5,
      rating: 4.8,
      reviews: 24,
      tags: ['handmade', 'gốm', 'bình hoa', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        'https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400'
      ]
    },
    {
      id: 11,
      name: 'Túi đeo chéo da thật handmade',
      price: 420000,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      description: 'Túi đeo chéo được làm từ da bò thật, thiết kế tối giản và thanh lịch. Có nhiều ngăn tiện lợi, dây đeo có thể điều chỉnh. Phù hợp cho cả nam và nữ.',
      category: 'Túi xách',
      stock: 6,
      rating: 4.7,
      reviews: 28,
      tags: ['handmade', 'da', 'túi', 'phụ kiện'],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'
      ]
    },
    {
      id: 12,
      name: 'Bộ khăn trải bàn thêu tay',
      price: 380000,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      description: 'Bộ khăn trải bàn được thêu tay với hoa văn truyền thống. Chất liệu vải cotton cao cấp, dễ giặt và bền màu. Kích thước 150x150cm.',
      category: 'Trang trí',
      stock: 4,
      rating: 4.9,
      reviews: 12,
      tags: ['handmade', 'thêu', 'khăn', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        'https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400'
      ]
    },
    {
      id: 13,
      name: 'Đèn ngủ gốm sứ handmade',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400',
      description: 'Đèn ngủ được làm từ gốm sứ, ánh sáng dịu nhẹ tạo không gian ấm cúng. Thiết kế độc đáo, an toàn khi sử dụng. Có nhiều màu sắc để lựa chọn.',
      category: 'Trang trí',
      stock: 8,
      rating: 4.5,
      reviews: 33,
      tags: ['handmade', 'gốm', 'đèn', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1603398938373-e54da0bb5e48?w=400',
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400'
      ]
    },
    {
      id: 14,
      name: 'Bộ bát đĩa gốm handmade',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      description: 'Bộ 6 bát đĩa gốm được nung thủ công, hoa văn độc đáo. An toàn cho sức khỏe, có thể dùng trong lò vi sóng và máy rửa bát.',
      category: 'Đồ dùng',
      stock: 5,
      rating: 4.6,
      reviews: 21,
      tags: ['handmade', 'gốm', 'bát đĩa', 'đồ dùng'],
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        'https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400'
      ]
    },
    {
      id: 15,
      name: 'Túi xách cói đan tay',
      price: 290000,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
      description: 'Túi xách được đan từ cói tự nhiên, thiết kế bền chắc và thời trang. Phù hợp cho mùa hè, thân thiện với môi trường. Có thể giặt nhẹ.',
      category: 'Túi xách',
      stock: 7,
      rating: 4.4,
      reviews: 38,
      tags: ['handmade', 'cói', 'túi', 'thân thiện môi trường'],
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
      ]
    },
    {
      id: 16,
      name: 'Vòng cổ đá tự nhiên handmade',
      price: 200000,
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400',
      description: 'Vòng cổ được làm từ đá tự nhiên, mỗi chiếc đều độc đáo. Dây đeo bằng da mềm mại, có thể điều chỉnh độ dài. Phù hợp cho mọi phong cách.',
      category: 'Phụ kiện',
      stock: 9,
      rating: 4.8,
      reviews: 45,
      tags: ['handmade', 'đá', 'vòng cổ', 'phụ kiện'],
      images: [
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
      ]
    },
    {
      id: 17,
      name: 'Bộ khăn tắm cotton handmade',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      description: 'Bộ 2 khăn tắm cotton cao cấp, thấm hút tốt và mềm mại. Kích thước 70x140cm, phù hợp cho cả gia đình. Có thể giặt máy.',
      category: 'Thời trang',
      stock: 6,
      rating: 4.7,
      reviews: 19,
      tags: ['handmade', 'cotton', 'khăn tắm', 'thời trang'],
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
        'https://images.unsplash.com/photo-1584100936595-c0655ba6af63?w=400'
      ]
    },
    {
      id: 18,
      name: 'Hộp đựng đồ gỗ handmade',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      description: 'Hộp đựng đồ được làm từ gỗ tự nhiên, thiết kế tối giản. Có thể dùng để đựng đồ trang sức, phụ kiện hoặc đồ lưu niệm. Kích thước 20x15x10cm.',
      category: 'Trang trí',
      stock: 10,
      rating: 4.5,
      reviews: 26,
      tags: ['handmade', 'gỗ', 'hộp', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
        'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400'
      ]
    },
    {
      id: 19,
      name: 'Bộ chén trà gốm sứ vẽ tay',
      price: 240000,
      image: 'https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400',
      description: 'Bộ 6 chén trà được vẽ tay với hoa văn tinh tế. Chất liệu gốm sứ cao cấp, giữ nhiệt tốt. Phù hợp cho việc thưởng thức trà.',
      category: 'Đồ dùng',
      stock: 8,
      rating: 4.6,
      reviews: 30,
      tags: ['handmade', 'gốm', 'chén trà', 'vẽ tay'],
      images: [
        'https://images.unsplash.com/photo-1579783902614-a53fb8287b1a?w=400',
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'
      ]
    },
    {
      id: 20,
      name: 'Tranh vẽ tay trên vải canvas',
      price: 550000,
      image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400',
      description: 'Tranh được vẽ tay trên vải canvas, mỗi bức tranh đều độc đáo. Khung gỗ tự nhiên, kích thước 40x50cm. Phù hợp trang trí phòng khách, phòng làm việc.',
      category: 'Trang trí',
      stock: 2,
      rating: 5.0,
      reviews: 15,
      tags: ['handmade', 'tranh', 'vẽ tay', 'trang trí'],
      images: [
        'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'
      ]
    }
  ];
  localStorage.setItem('products', JSON.stringify(sampleProducts));
  return sampleProducts;
};

// Orders data
const getOrders = () => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

const saveOrders = (orders) => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// API Functions
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    await delay(500);
    const users = getUsers();
    
    // Kiểm tra email đã tồn tại
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }
    
    // Validation
    if (!userData.email || !userData.password) {
      throw new Error('Email và mật khẩu là bắt buộc');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    const newUser = {
      id: Date.now(),
      email: userData.email,
      password: userData.password, // Trong thực tế nên hash password
      name: userData.name || '',
      phone: userData.phone || '',
      address: userData.address || '',
      createdAt: new Date().toISOString(),
      role: 'user' // user hoặc admin
    };
    
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: { ...newUser, password: undefined } };
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
  },

  // Cập nhật thông tin user
  updateProfile: async (userId, userData) => {
    await delay(400);
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      password: users[userIndex].password // Giữ nguyên password
    };
    
    saveUsers(users);
    
    // Cập nhật currentUser nếu đang đăng nhập
    const currentUser = authAPI.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      authAPI.setCurrentUser({ ...users[userIndex], password: undefined });
    }
    
    return { ...users[userIndex], password: undefined };
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
      p.description.toLowerCase().includes(keyword.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  },

  // Lọc sản phẩm theo danh mục
  getByCategory: async (category) => {
    await delay(300);
    const products = getProducts();
    if (!category) return products;
    return products.filter(p => p.category === category);
  },

  // Lấy tất cả danh mục
  getCategories: async () => {
    await delay(200);
    const products = getProducts();
    const categories = [...new Set(products.map(p => p.category))];
    return categories;
  },

  // Lọc sản phẩm theo khoảng giá
  filterByPrice: async (minPrice, maxPrice) => {
    await delay(300);
    const products = getProducts();
    return products.filter(p => {
      const price = p.price;
      return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
    });
  },

  // Sắp xếp sản phẩm
  sort: async (products, sortBy = 'default') => {
    await delay(200);
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }
};

export const cartAPI = {
  // Lấy giỏ hàng
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },

  // Thêm vào giỏ hàng
  addToCart: async (productId, quantity = 1) => {
    await delay(200);
    const cart = cartAPI.getCart();
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(productId));
    
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    if (product.stock < quantity) {
      throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }
    
    const existingItem = cart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.push({ productId: parseInt(productId), quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  },

  // Cập nhật số lượng
  updateQuantity: async (productId, quantity) => {
    await delay(200);
    const cart = cartAPI.getCart();
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(productId));
    
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    if (quantity > product.stock) {
      throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
    }
    
    const item = cart.find(item => item.productId === parseInt(productId));
    if (item) {
      if (quantity <= 0) {
        return cartAPI.removeFromCart(productId);
      }
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    return cart;
  },

  // Xóa khỏi giỏ hàng
  removeFromCart: async (productId) => {
    await delay(200);
    const cart = cartAPI.getCart();
    const newCart = cart.filter(item => item.productId !== parseInt(productId));
    localStorage.setItem('cart', JSON.stringify(newCart));
    return newCart;
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    localStorage.removeItem('cart');
  },

  // Lấy tổng số lượng sản phẩm trong giỏ
  getTotalItems: () => {
    const cart = cartAPI.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Lấy tổng giá trị giỏ hàng
  getTotalPrice: async () => {
    await delay(200);
    const cart = cartAPI.getCart();
    const products = getProducts();
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }
};

// Favorites/Wishlist API
const getFavorites = () => {
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

const saveFavorites = (favorites) => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

export const favoritesAPI = {
  // Lấy danh sách sản phẩm yêu thích
  getAll: async () => {
    await delay(300);
    const favoriteIds = getFavorites();
    const products = getProducts();
    return products.filter(p => favoriteIds.includes(p.id));
  },

  // Kiểm tra sản phẩm có trong yêu thích không
  isFavorite: (productId) => {
    const favorites = getFavorites();
    return favorites.includes(parseInt(productId));
  },

  // Thêm vào yêu thích
  addToFavorites: async (productId) => {
    await delay(200);
    const favorites = getFavorites();
    const productIdNum = parseInt(productId);
    
    if (favorites.includes(productIdNum)) {
      throw new Error('Sản phẩm đã có trong danh sách yêu thích');
    }
    
    const products = getProducts();
    const product = products.find(p => p.id === productIdNum);
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    favorites.push(productIdNum);
    saveFavorites(favorites);
    return favorites;
  },

  // Xóa khỏi yêu thích
  removeFromFavorites: async (productId) => {
    await delay(200);
    const favorites = getFavorites();
    const newFavorites = favorites.filter(id => id !== parseInt(productId));
    saveFavorites(newFavorites);
    return newFavorites;
  },

  // Xóa tất cả yêu thích
  clearFavorites: () => {
    saveFavorites([]);
  },

  // Lấy số lượng sản phẩm yêu thích
  getCount: () => {
    return getFavorites().length;
  }
};

// Orders API
export const ordersAPI = {
  // Lấy tất cả đơn hàng
  getAll: async (userId = null) => {
    await delay(300);
    const orders = getOrders();
    if (userId) {
      return orders.filter(order => order.userId === userId);
    }
    return orders;
  },

  // Lấy đơn hàng theo ID
  getById: async (orderId) => {
    await delay(300);
    const orders = getOrders();
    const order = orders.find(o => o.id === parseInt(orderId));
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    return order;
  },

  // Tạo đơn hàng mới
  create: async (orderData) => {
    await delay(500);
    const orders = getOrders();
    const products = getProducts();
    
    // Validate và tính toán tổng tiền
    let totalAmount = 0;
    const orderItems = orderData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Sản phẩm ID ${item.productId} không tồn tại`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`);
      }
      totalAmount += product.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
        productImage: product.image
      };
    });
    
    const newOrder = {
      id: Date.now(),
      userId: orderData.userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || 'cod', // cod, bank_transfer, etc.
      status: 'pending', // pending, confirmed, shipping, delivered, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    
    // Cập nhật số lượng tồn kho
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    });
    localStorage.setItem('products', JSON.stringify(products));
    
    // Xóa giỏ hàng sau khi đặt hàng
    if (orderData.clearCart) {
      cartAPI.clearCart();
    }
    
    return newOrder;
  },

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (orderId, status) => {
    await delay(300);
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
    
    if (orderIndex === -1) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ');
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    saveOrders(orders);
    
    return orders[orderIndex];
  },

  // Hủy đơn hàng
  cancel: async (orderId) => {
    await delay(300);
    const order = await ordersAPI.getById(orderId);
    
    if (order.status === 'delivered') {
      throw new Error('Không thể hủy đơn hàng đã giao');
    }
    
    // Hoàn lại số lượng tồn kho
    const products = getProducts();
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    });
    localStorage.setItem('products', JSON.stringify(products));
    
    return ordersAPI.updateStatus(orderId, 'cancelled');
  }
};

// Reviews data
const getReviews = () => {
  const reviews = localStorage.getItem('reviews');
  if (reviews) return JSON.parse(reviews);
  
  // Dữ liệu mẫu reviews
  const sampleReviews = [
    {
      id: 1,
      productId: 1,
      userId: 1,
      userName: 'Nguyễn Văn A',
      rating: 5,
      comment: 'Sản phẩm rất đẹp, chất lượng tốt. Vòng tay mềm mại và bền. Sẽ mua lại!',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      productId: 1,
      userId: 2,
      userName: 'Trần Thị B',
      rating: 4,
      comment: 'Đẹp nhưng hơi nhỏ so với cổ tay mình. Chất lượng ổn.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      productId: 2,
      userId: 3,
      userName: 'Lê Văn C',
      rating: 5,
      comment: 'Túi rất đẹp và bền. Dùng được nhiều lần, dễ giặt. Rất hài lòng!',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem('reviews', JSON.stringify(sampleReviews));
  return sampleReviews;
};

const saveReviews = (reviews) => {
  localStorage.setItem('reviews', JSON.stringify(reviews));
};

// Reviews API
export const reviewsAPI = {
  // Lấy tất cả reviews của một sản phẩm
  getByProductId: async (productId) => {
    await delay(300);
    const reviews = getReviews();
    return reviews.filter(r => r.productId === parseInt(productId));
  },

  // Lấy tất cả reviews của một user
  getByUserId: async (userId) => {
    await delay(300);
    const reviews = getReviews();
    return reviews.filter(r => r.userId === parseInt(userId));
  },

  // Thêm review mới
  create: async (reviewData) => {
    await delay(400);
    const reviews = getReviews();
    const products = getProducts();
    
    // Kiểm tra sản phẩm tồn tại
    const product = products.find(p => p.id === parseInt(reviewData.productId));
    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }
    
    // Validation
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Đánh giá phải từ 1 đến 5 sao');
    }
    
    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      throw new Error('Bình luận phải có ít nhất 10 ký tự');
    }
    
    const newReview = {
      id: Date.now(),
      productId: parseInt(reviewData.productId),
      userId: reviewData.userId,
      userName: reviewData.userName || 'Khách hàng',
      rating: parseInt(reviewData.rating),
      comment: reviewData.comment.trim(),
      createdAt: new Date().toISOString()
    };
    
    reviews.push(newReview);
    saveReviews(reviews);
    
    // Cập nhật rating trung bình của sản phẩm
    const productReviews = reviews.filter(r => r.productId === parseInt(reviewData.productId));
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviews = productReviews.length;
    localStorage.setItem('products', JSON.stringify(products));
    
    return newReview;
  },

  // Xóa review
  delete: async (reviewId) => {
    await delay(300);
    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(reviewId));
    
    if (reviewIndex === -1) {
      throw new Error('Không tìm thấy đánh giá');
    }
    
    const review = reviews[reviewIndex];
    reviews.splice(reviewIndex, 1);
    saveReviews(reviews);
    
    // Cập nhật rating trung bình của sản phẩm
    const products = getProducts();
    const product = products.find(p => p.id === review.productId);
    if (product) {
      const productReviews = reviews.filter(r => r.productId === review.productId);
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = Math.round(avgRating * 10) / 10;
        product.reviews = productReviews.length;
      } else {
        product.rating = 0;
        product.reviews = 0;
      }
      localStorage.setItem('products', JSON.stringify(products));
    }
    
    return { success: true };
  },

  // Cập nhật review
  update: async (reviewId, reviewData) => {
    await delay(400);
    const reviews = getReviews();
    const reviewIndex = reviews.findIndex(r => r.id === parseInt(reviewId));
    
    if (reviewIndex === -1) {
      throw new Error('Không tìm thấy đánh giá');
    }
    
    if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
      throw new Error('Đánh giá phải từ 1 đến 5 sao');
    }
    
    if (reviewData.comment && reviewData.comment.trim().length < 10) {
      throw new Error('Bình luận phải có ít nhất 10 ký tự');
    }
    
    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...reviewData,
      rating: reviewData.rating ? parseInt(reviewData.rating) : reviews[reviewIndex].rating,
      comment: reviewData.comment ? reviewData.comment.trim() : reviews[reviewIndex].comment
    };
    
    saveReviews(reviews);
    
    // Cập nhật rating trung bình của sản phẩm
    const products = getProducts();
    const product = products.find(p => p.id === reviews[reviewIndex].productId);
    if (product) {
      const productReviews = reviews.filter(r => r.productId === reviews[reviewIndex].productId);
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      product.rating = Math.round(avgRating * 10) / 10;
      localStorage.setItem('products', JSON.stringify(products));
    }
    
    return reviews[reviewIndex];
  }
};

// Addresses data
const getAddresses = () => {
  const addresses = localStorage.getItem('addresses');
  return addresses ? JSON.parse(addresses) : [];
};

const saveAddresses = (addresses) => {
  localStorage.setItem('addresses', JSON.stringify(addresses));
};

// Addresses API - Quản lý địa chỉ giao hàng
export const addressesAPI = {
  // Lấy tất cả địa chỉ của user
  getByUserId: async (userId) => {
    await delay(300);
    const addresses = getAddresses();
    return addresses.filter(a => a.userId === parseInt(userId));
  },

  // Lấy địa chỉ theo ID
  getById: async (addressId) => {
    await delay(200);
    const addresses = getAddresses();
    const address = addresses.find(a => a.id === parseInt(addressId));
    if (!address) {
      throw new Error('Không tìm thấy địa chỉ');
    }
    return address;
  },

  // Thêm địa chỉ mới
  create: async (addressData) => {
    await delay(400);
    const addresses = getAddresses();
    
    // Validation
    if (!addressData.name || !addressData.phone || !addressData.address) {
      throw new Error('Vui lòng điền đầy đủ thông tin');
    }
    
    const newAddress = {
      id: Date.now(),
      userId: parseInt(addressData.userId),
      name: addressData.name.trim(),
      phone: addressData.phone.trim(),
      address: addressData.address.trim(),
      ward: addressData.ward || '',
      district: addressData.district || '',
      city: addressData.city || '',
      isDefault: addressData.isDefault || false,
      createdAt: new Date().toISOString()
    };
    
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (newAddress.isDefault) {
      addresses.forEach(a => {
        if (a.userId === newAddress.userId) {
          a.isDefault = false;
        }
      });
    }
    
    addresses.push(newAddress);
    saveAddresses(addresses);
    
    return newAddress;
  },

  // Cập nhật địa chỉ
  update: async (addressId, addressData) => {
    await delay(400);
    const addresses = getAddresses();
    const addressIndex = addresses.findIndex(a => a.id === parseInt(addressId));
    
    if (addressIndex === -1) {
      throw new Error('Không tìm thấy địa chỉ');
    }
    
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
    if (addressData.isDefault) {
      addresses.forEach(a => {
        if (a.userId === addresses[addressIndex].userId && a.id !== parseInt(addressId)) {
          a.isDefault = false;
        }
      });
    }
    
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...addressData,
      name: addressData.name ? addressData.name.trim() : addresses[addressIndex].name,
      phone: addressData.phone ? addressData.phone.trim() : addresses[addressIndex].phone,
      address: addressData.address ? addressData.address.trim() : addresses[addressIndex].address
    };
    
    saveAddresses(addresses);
    return addresses[addressIndex];
  },

  // Xóa địa chỉ
  delete: async (addressId) => {
    await delay(300);
    const addresses = getAddresses();
    const newAddresses = addresses.filter(a => a.id !== parseInt(addressId));
    
    if (addresses.length === newAddresses.length) {
      throw new Error('Không tìm thấy địa chỉ');
    }
    
    saveAddresses(newAddresses);
    return { success: true };
  },

  // Đặt địa chỉ làm mặc định
  setDefault: async (addressId) => {
    await delay(300);
    const addresses = getAddresses();
    const address = addresses.find(a => a.id === parseInt(addressId));
    
    if (!address) {
      throw new Error('Không tìm thấy địa chỉ');
    }
    
    // Bỏ mặc định của tất cả địa chỉ khác của user này
    addresses.forEach(a => {
      if (a.userId === address.userId) {
        a.isDefault = a.id === parseInt(addressId);
      }
    });
    
    saveAddresses(addresses);
    return address;
  },

  // Lấy địa chỉ mặc định của user
  getDefault: async (userId) => {
    await delay(200);
    const addresses = getAddresses();
    return addresses.find(a => a.userId === parseInt(userId) && a.isDefault) || null;
  }
};

