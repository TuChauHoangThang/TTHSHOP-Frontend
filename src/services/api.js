const API_URL = 'http://localhost:3001';

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

// Cart & Favorites: vẫn lưu localStorage, nhưng kiểm tra tồn kho qua API.
const getCartStorage = () => JSON.parse(localStorage.getItem('cart') || '[]');
const setCartStorage = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

export const cartAPI = {
    getCart: () => getCartStorage(),
    addToCart: async (productId, quantity = 1) => {
        await delay(200);
        const cart = getCartStorage();
        const products = await productsAPI.getAll();

        // Dữ liệu từ json-server đôi khi trả id là string, nên ép kiểu cả hai
        const productIdNum = parseInt(productId);
        const product = products.find((p) => parseInt(p.id) === productIdNum);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        if (product.stock < quantity) throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho`);

        const existing = cart.find((i) => parseInt(i.productId) === productIdNum);
        if (existing) {
            const newQty = existing.quantity + quantity;
            if (newQty > product.stock) {
                throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
            }
            existing.quantity = newQty;
        } else {
            cart.push({ productId: productIdNum, quantity });
        }
        setCartStorage(cart);
        return cart;
    },
    updateQuantity: async (productId, quantity) => {
        await delay(200);
        const cart = getCartStorage();
        const products = await productsAPI.getAll();

        const productIdNum = parseInt(productId);
        const product = products.find((p) => parseInt(p.id) === productIdNum);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        if (quantity > product.stock) {
            throw new Error(`Số lượng vượt quá tồn kho (còn ${product.stock} sản phẩm)`);
        }
        const item = cart.find((i) => parseInt(i.productId) === productIdNum);
        if (item) {
            if (quantity <= 0) {
                return cartAPI.removeFromCart(productId);
            }
            item.quantity = quantity;
            setCartStorage(cart);
        }
        return cart;
    },
    removeFromCart: async (productId) => {
        await delay(200);
        const cart = getCartStorage();
        const productIdNum = parseInt(productId);
        const newCart = cart.filter((i) => parseInt(i.productId) !== productIdNum);
        setCartStorage(newCart);
        return newCart;
    },
    clearCart: () => {
        localStorage.removeItem('cart');
    },
};

const getFavorites = () => JSON.parse(localStorage.getItem('favorites') || '[]');
const setFavorites = (favorites) => localStorage.setItem('favorites', JSON.stringify(favorites));

export const favoritesAPI = {
    getAll: async () => {
        await delay(200);
        const favorites = getFavorites();
        const products = await productsAPI.getAll();
        return products.filter((p) => favorites.includes(p.id));
    },
    isFavorite: (productId) => getFavorites().includes(parseInt(productId)),
    addToFavorites: async (productId) => {
        await delay(200);
        const favorites = getFavorites();
        const idNum = parseInt(productId);
        if (favorites.includes(idNum)) throw new Error('Sản phẩm đã có trong danh sách yêu thích');
        favorites.push(idNum);
        setFavorites(favorites);
        return favorites;
    },
    removeFromFavorites: async (productId) => {
        await delay(200);
        const idNum = parseInt(productId);
        const newFav = getFavorites().filter((id) => id !== idNum);
        setFavorites(newFav);
        return newFav;
    },
    clearFavorites: () => setFavorites([]),
    getCount: () => getFavorites().length,
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
            subtotal += product.price * item.quantity;
            stockUpdates.push({
                id: product.id,
                stock: product.stock - item.quantity,
            });
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                productName: product.name,
                productImage: product.image,
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
            cartAPI.clearCart();
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
};
