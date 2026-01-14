const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:3001';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (endpoint, options = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Lỗi kết nối API');
    }
    return res.json();
};

export const productsAPI = {
    getAll: async () => fetchJson('/products'),
    getById: async (id) => fetchJson(`/products/${id}`),
    update: async (id, data) => fetchJson(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    search: async (keyword) => fetchJson(`/products?q=${encodeURIComponent(keyword)}`),
    getByCategory: async (category) => {
        const products = await productsAPI.getAll();
        if (!category) return products;
        return products.filter((p) => p.category === category);
    },
    getCategories: async () => {
        const products = await productsAPI.getAll();
        return [...new Set(products.map((p) => p.category))];
    },
    filterByPrice: async (minPrice, maxPrice) => {
        const products = await productsAPI.getAll();
        return products.filter((p) => {
            const price = p.price;
            return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
        });
    },
    sort: async (products, sortBy = 'default') => {
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
    },
};

export const reviewsAPI = {
    getByProductId: async (productId) => fetchJson(`/reviews?productId=${productId}`),
    getByUserId: async (userId) => fetchJson(`/reviews?userId=${userId}`),
    create: async (reviewData) => {
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new Error('Đánh giá phải từ 1 đến 5 sao');
        }
        if (!reviewData.comment || reviewData.comment.trim().length < 10) {
            throw new Error('Bình luận phải có ít nhất 10 ký tự');
        }
        return fetchJson('/reviews', {
            method: 'POST',
            body: JSON.stringify({
                productId: parseInt(reviewData.productId),
                userId: reviewData.userId,
                userName: reviewData.userName || 'Khách hàng',
                rating: parseInt(reviewData.rating),
                comment: reviewData.comment.trim(),
                createdAt: new Date().toISOString(),
            }),
        });
    },
    delete: async (reviewId) => {
        await fetchJson(`/reviews/${reviewId}`, { method: 'DELETE' });
        return { success: true };
    },
    update: async (reviewId, reviewData) => {
        if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
            throw new Error('Đánh giá phải từ 1 đến 5 sao');
        }
        if (reviewData.comment && reviewData.comment.trim().length < 10) {
            throw new Error('Bình luận phải có ít nhất 10 ký tự');
        }
        return fetchJson(`/reviews/${reviewId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...reviewData,
                rating: reviewData.rating ? parseInt(reviewData.rating) : undefined,
                comment: reviewData.comment ? reviewData.comment.trim() : undefined,
            }),
        });
    },
};
const getCartKey = (userId = null) => `cart_${userId || 'guest'}`;
const getCartStorage = (userId = null) =>
    JSON.parse(localStorage.getItem(getCartKey(userId)) || '[]');
const setCartStorage = (cart, userId = null) =>
    localStorage.setItem(getCartKey(userId), JSON.stringify(cart));

export const cartAPI = {
    getCart: (userId = null) => getCartStorage(userId),
    addToCart: async (productId, quantity = 1, options = {}, userId = null) => {
        await delay(200);
        const cart = getCartStorage(userId);
        const products = await productsAPI.getAll();
        const productIdNum = parseInt(productId);
        const product = products.find((p) => parseInt(p.id) === productIdNum);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        if (product.stock < quantity) throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
        const existing = cart.find((i) => {
            const sameId = parseInt(i.productId) === productIdNum;
            const sameOptions = JSON.stringify(i.options || {}) === JSON.stringify(options || {});
            return sameId && sameOptions;
        });

        if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > product.stock) {
                throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
            }
            existing.quantity = newQty;
        } else {
            cart.push({ productId: productIdNum, quantity, options });
        }
        setCartStorage(cart, userId);
        return cart;
    },
    updateQuantity: async (productId, quantity, options = {}, userId = null) => {
        await delay(200);
        const cart = getCartStorage(userId);
        const products = await productsAPI.getAll();

        const productIdNum = parseInt(productId);
        const product = products.find((p) => parseInt(p.id) === productIdNum);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        if (quantity > product.stock) {
            throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
        }

        const item = cart.find((i) => {
            const sameId = parseInt(i.productId) === productIdNum;
            const sameOptions = JSON.stringify(i.options || {}) === JSON.stringify(options || {});
            return sameId && sameOptions;
        });

        if (item) {
            if (quantity <= 0) {
                return cartAPI.removeFromCart(productId, options, userId);
            }
            item.quantity = quantity;
            setCartStorage(cart, userId);
        }
        return cart;
    },
    removeFromCart: async (productId, options = {}, userId = null) => {
        await delay(200);
        const cart = getCartStorage(userId);
        const productIdNum = parseInt(productId);
        // Filter out item that matches BOTH id and options
        const newCart = cart.filter((i) => {
            const sameId = parseInt(i.productId) === productIdNum;
            const sameOptions = JSON.stringify(i.options || {}) === JSON.stringify(options || {});
            return !(sameId && sameOptions);
        });
        setCartStorage(newCart, userId);
        return newCart;
    },
    clearCart: (userId = null) => {
        localStorage.removeItem(getCartKey(userId));
    },
    copyCart: (fromUserId = null, toUserId = null) => {
        const sourceCart = getCartStorage(fromUserId);
        setCartStorage(sourceCart, toUserId);
        return sourceCart;
    },
};

// Favorites: lưu theo từng user trong localStorage (yêu cầu đăng nhập)
const getFavoritesKey = (userId) => `favorites_${userId}`;
const getFavoritesStorage = (userId) => {
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(getFavoritesKey(userId)) || '[]');
};
const setFavoritesStorage = (favorites, userId) => {
    if (!userId) throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
    localStorage.setItem(getFavoritesKey(userId), JSON.stringify(favorites));
};

export const favoritesAPI = {
    getAll: async (userId) => {
        if (!userId) return [];
        await delay(200);
        const favorites = getFavoritesStorage(userId);
        const products = await productsAPI.getAll();
        return products.filter((p) => favorites.includes(parseInt(p.id)));
    },
    isFavorite: (productId, userId) => {
        if (!userId) return false;
        return getFavoritesStorage(userId).includes(parseInt(productId));
    },
    addToFavorites: async (productId, userId) => {
        if (!userId) {
            throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
        }
        await delay(200);
        const favorites = getFavoritesStorage(userId);
        const idNum = parseInt(productId);
        if (favorites.includes(idNum)) {
            throw new Error('Sản phẩm đã có trong danh sách yêu thích');
        }
        favorites.push(idNum);
        setFavoritesStorage(favorites, userId);
        return favorites;
    },
    removeFromFavorites: async (productId, userId) => {
        if (!userId) {
            throw new Error('Vui lòng đăng nhập để xóa sản phẩm khỏi yêu thích');
        }
        await delay(200);
        const idNum = parseInt(productId);
        const newFav = getFavoritesStorage(userId).filter((id) => id !== idNum);
        setFavoritesStorage(newFav, userId);
        return newFav;
    },
    clearFavorites: (userId) => {
        if (!userId) return;
        localStorage.removeItem(getFavoritesKey(userId));
    },
    getCount: (userId) => {
        if (!userId) return 0;
        return getFavoritesStorage(userId).length;
    },
    copyFavorites: (fromUserId, toUserId) => {
        if (!fromUserId || !toUserId) return;
        const sourceFavorites = getFavoritesStorage(fromUserId);
        setFavoritesStorage(sourceFavorites, toUserId);
        return sourceFavorites;
    },
};

export const authAPI = {
    register: async (userData) => {
        await delay(200);
        if (!userData.email || !userData.password) throw new Error('Email và mật khẩu là bắt buộc');
        if (userData.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');

        // Kiểm tra trùng email
        const existing = await fetchJson(`/users?email=${encodeURIComponent(userData.email)}`);
        if (existing.length > 0) throw new Error('Email đã tồn tại');

        const body = {
            email: userData.email,
            password: userData.password,
            name: userData.name || '',
            phone: userData.phone || '',
            address: userData.address || '',
            role: 'user',
            createdAt: new Date().toISOString(),
        };
        const created = await fetchJson('/users', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return { success: true, user: { ...created, password: undefined } };
    },
    login: async (email, password) => {
        await delay(200);
        const users = await fetchJson(
            `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        );
        if (!users || users.length === 0) throw new Error('Email hoặc mật khẩu không đúng');
        const user = users[0];
        return { success: true, user: { ...user, password: undefined } };
    },
    getCurrentUser: () => {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    },
    setCurrentUser: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    logout: () => {
        localStorage.removeItem('currentUser');
    },
};

export const usersAPI = {
    getById: async (id) => fetchJson(`/users/${id}`),
    update: async (id, data) => fetchJson(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

// Orders stored in json-server (db.json)
export const ordersAPI = {
    getAll: async (userId = null) => {
        await delay(150);
        const query = userId
            ? `/orders?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`
            : '/orders?_sort=createdAt&_order=desc';
        return fetchJson(query);
    },

    getById: async (orderId) => {
        await delay(150);
        return fetchJson(`/orders/${orderId}`);
    },

    create: async (orderData) => {
        await delay(300);
        const products = await productsAPI.getAll();

        let subtotal = 0;
        const stockUpdates = [];
        const orderItems = orderData.items.map((item) => {
            const product = products.find((p) => parseInt(p.id) === parseInt(item.productId));
            if (!product) throw new Error(`Sản phẩm ID ${item.productId} không tồn tại`);
            if (product.stock < item.quantity) {
                throw new Error(`Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm`);
            }
            const basePrice = product.price;
            const finalPrice = product.types && item.options?.type
                ? basePrice + (product.types.indexOf(item.options.type) * 30000)
                : basePrice;

            subtotal += finalPrice * item.quantity;
            stockUpdates.push({
                id: product.id,
                stock: product.stock - item.quantity,
            });
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: finalPrice,
                productName: product.name,
                productImage: product.image,
                colors: item.options?.color || null,
                types: item.options?.type || null
            };
        });

        const shippingFee = subtotal === 0 || subtotal > 500000 ? 0 : 30000;
        const grandTotal = subtotal + shippingFee;

        const payload = {
            userId: orderData.userId || null,
            items: orderItems,
            totals: {
                subtotal,
                shippingFee,
                grandTotal,
            },
            shippingAddress: orderData.shippingAddress || {},
            paymentMethod: orderData.paymentMethod || 'cod',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const createdOrder = await fetchJson('/orders', {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        // Giảm tồn kho sau khi đặt hàng
        try {
            await Promise.all(
                stockUpdates.map((item) =>
                    fetchJson(`/products/${item.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ stock: item.stock }),
                    })
                )
            );
        } catch (error) {
            console.warn('Không thể cập nhật tồn kho:', error);
        }

        if (orderData.clearCart) {
            cartAPI.clearCart(orderData.userId || null);
        }

        return createdOrder;
    },

    updateStatus: async (orderId, status) => {
        await delay(150);
        const valid = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
        if (!valid.includes(status)) throw new Error('Trạng thái không hợp lệ');
        return fetchJson(`/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                updatedAt: new Date().toISOString(),
            }),
        });
    },

    cancel: async (orderId) => {
        await delay(150);
        const order = await ordersAPI.getById(orderId);
        if (order.status === 'delivered') throw new Error('Không thể hủy đơn hàng đã giao');
        return ordersAPI.updateStatus(orderId, 'cancelled');
    },

    // Kiểm tra user đã mua sản phẩm (đơn hàng không bị hủy)
    hasPurchasedProduct: async (userId, productId) => {
        if (!userId || !productId) return false;
        await delay(150);
        const userIdStr = String(userId);
        const orders = await ordersAPI.getAll(userIdStr);
        const productIdNum = parseInt(productId);

        // Kiểm tra xem có đơn hàng nào (không bị hủy) chứa sản phẩm này không
        const hasPurchased = orders.some(order => {
            // Chỉ kiểm tra đơn hàng không bị hủy (pending, confirmed, shipping, delivered)
            if (order.status === 'cancelled') return false;
            return order.items && order.items.some(item =>
                parseInt(item.productId) === productIdNum
            );
        });

        return hasPurchased;
    },

};
// Thêm vào services/api.js
export const blogsAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/blogs`);
        return await response.json();
    },
    getById: async (id) => {
        const response = await fetch(`${API_URL}/blogs/${id}`);
        return await response.json();
    }
};

export const vouchersAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/vouchers`);
        return await response.json();
    },
    getByCode: async (code) => {
        const vouchers = await vouchersAPI.getAll();
        return vouchers.find(v => v.code.trim().toUpperCase() === code.trim().toUpperCase());
    },
    getUserVouchers: async (userId) => {
        return fetchJson(`/userVouchers?userId=${userId}`);
    },
    markUserVoucherUsed: async (id) => {
        return fetchJson(`/userVouchers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ used: true, isUsed: true })
        });
    },
    assignUserVoucher: async (data) => {
        return fetchJson('/userVouchers', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};
