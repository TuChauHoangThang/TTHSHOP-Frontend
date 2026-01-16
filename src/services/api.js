const API_URL = '/api';

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

const getStorage = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
};

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Product API (Read Only mostly, stock is tricky on serverless) ---
export const productsAPI = {
    getAll: async (query = '') => fetchJson(`/products${query}`),
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
    getByProductId: async (productId) => {
        // 1. Get from Server
        let serverReviews = [];
        try {
            serverReviews = await fetchJson(`/reviews?productId=${productId}`);
        } catch (e) { console.warn('Server reviews error', e); }

        // 2. Get from Local
        const localReviews = getStorage('local_reviews').filter(r => String(r.productId) === String(productId));

        // 3. Merge
        return [...localReviews, ...serverReviews];
    },
    getByUserId: async (userId) => {
        // 1. Get from Server
        let serverReviews = [];
        try {
            serverReviews = await fetchJson(`/reviews?userId=${userId}`);
        } catch (e) { console.warn('Server reviews error', e); }

        // 2. Get from Local
        const localReviews = getStorage('local_reviews').filter(r => String(r.userId) === String(userId));

        // 3. Merge
        return [...localReviews, ...serverReviews];
    },
    create: async (reviewData) => {
        await delay(300);
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new Error('Đánh giá phải từ 1 đến 5 sao');
        }
        if (!reviewData.comment || reviewData.comment.trim().length < 10) {
            throw new Error('Bình luận phải có ít nhất 10 ký tự');
        }

        const newReview = {
            id: 'local_rev_' + Date.now(),
            productId: parseInt(reviewData.productId),
            userId: reviewData.userId,
            userName: reviewData.userName || 'Khách hàng',
            rating: parseInt(reviewData.rating),
            comment: reviewData.comment.trim(),
            media: reviewData.media || [],
            createdAt: new Date().toISOString(),
        };

        // Save to Local
        const currentLocal = getStorage('local_reviews');
        currentLocal.push(newReview);
        setStorage('local_reviews', currentLocal);

        return newReview;
    },
    delete: async (reviewId) => {
        // Try delete local first
        const currentLocal = getStorage('local_reviews');
        const newLocal = currentLocal.filter(r => r.id !== reviewId);
        if (newLocal.length !== currentLocal.length) {
            setStorage('local_reviews', newLocal);
            return { success: true };
        }
        // If not local, try server (will verify persistence issues later)
        await fetchJson(`/reviews/${reviewId}`, { method: 'DELETE' });
        return { success: true };
    },
    update: async (reviewId, reviewData) => {
        // Try update local first
        const currentLocal = getStorage('local_reviews');
        const index = currentLocal.findIndex(r => r.id === reviewId);
        if (index !== -1) {
            currentLocal[index] = { ...currentLocal[index], ...reviewData };
            setStorage('local_reviews', currentLocal);
            return currentLocal[index];
        }
        // Else Server
        return fetchJson(`/reviews/${reviewId}`, {
            method: 'PATCH',
            body: JSON.stringify(reviewData)
        });
    },
};

// --- Cart API (LocalStorage - Client Side) ---
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

        // Skip stock check strictness for demo if needed, but keeping it is good
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

// --- Favorites API (LocalStorage) ---
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
        if (!userId) throw new Error('Vui lòng đăng nhập');
        await delay(200);
        const favorites = getFavoritesStorage(userId);
        const idNum = parseInt(productId);
        if (favorites.includes(idNum)) throw new Error('Sản phẩm đã có trong danh sách yêu thích');
        favorites.push(idNum);
        setFavoritesStorage(favorites, userId);
        return favorites;
    },
    removeFromFavorites: async (productId, userId) => {
        if (!userId) throw new Error('Vui lòng đăng nhập');
        await delay(200);
        const idNum = parseInt(productId);
        const newFav = getFavoritesStorage(userId).filter((id) => id !== idNum);
        setFavoritesStorage(newFav, userId);
        return newFav;
    },
    clearFavorites: (userId) => { if (!userId) return; localStorage.removeItem(getFavoritesKey(userId)); },
    getCount: (userId) => { if (!userId) return 0; return getFavoritesStorage(userId).length; },
    copyFavorites: (fromUserId, toUserId) => {
        if (!fromUserId || !toUserId) return;
        const sourceFavorites = getFavoritesStorage(fromUserId);
        setFavoritesStorage(sourceFavorites, toUserId);
        return sourceFavorites;
    },
};

// --- Auth API (Hybrid: Local First) ---
export const authAPI = {
    register: async (userData) => {
        await delay(200);
        if (!userData.email || !userData.password) throw new Error('Email và mật khẩu là bắt buộc');
        if (userData.password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');

        // Check Local
        const localUsers = getStorage('local_users');
        if (localUsers.find(u => u.email === userData.email)) throw new Error('Email đã tồn tại (Local)');

        // Check Server
        try {
            const existing = await fetchJson(`/users?email=${encodeURIComponent(userData.email)}`);
            if (existing.length > 0) throw new Error('Email đã tồn tại (Server)');
        } catch (e) { /* ignore server check error if offline/broken */ }

        // Create in Local
        const newUser = {
            id: 'local_user_' + Date.now(),
            ...userData,
            role: 'user',
            createdAt: new Date().toISOString(),
        };

        localUsers.push(newUser);
        setStorage('local_users', localUsers);

        return { success: true, user: { ...newUser, password: undefined } };
    },
    login: async (email, password) => {
        await delay(200);

        // 1. Check Local Users
        const localUsers = getStorage('local_users');
        const localUser = localUsers.find(u => u.email === email && u.password === password);
        if (localUser) {
            return { success: true, user: { ...localUser, password: undefined } };
        }

        // 2. Check Server Users
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

// --- Users API (Hybrid) ---
export const usersAPI = {
    getById: async (id) => {
        // Check Local
        if (String(id).startsWith('local_user_')) {
            const localUsers = getStorage('local_users');
            const found = localUsers.find(u => u.id === id);
            if (found) return found;
        }
        return fetchJson(`/users/${id}`);
    },
    update: async (id, data) => {
        // If Local User, update local
        if (String(id).startsWith('local_user_')) {
            const localUsers = getStorage('local_users');
            const idx = localUsers.findIndex(u => u.id === id);
            if (idx !== -1) {
                localUsers[idx] = { ...localUsers[idx], ...data };
                setStorage('local_users', localUsers);

                // Also update current session if it matches
                const currentUser = authAPI.getCurrentUser();
                if (currentUser && currentUser.id === id) {
                    authAPI.setCurrentUser({ ...currentUser, ...data });
                }
                return localUsers[idx];
            }
        }
        // Else Server
        return fetchJson(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// --- Orders API (Hybrid: Server + Local) ---
export const ordersAPI = {
    getAll: async (userId = null) => {
        await delay(150);
        let allOrders = [];

        // 1. Get from Server
        try {
            const query = userId
                ? `/orders?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`
                : '/orders?_sort=createdAt&_order=desc';
            const serverOrders = await fetchJson(query);
            allOrders = [...serverOrders];
        } catch (e) { console.warn('Server orders fetch failed', e); }

        // 2. Get from Local
        const localOrders = getStorage('local_orders');
        const myLocalOrders = userId
            ? localOrders.filter(o => String(o.userId) === String(userId))
            : localOrders;

        allOrders = [...myLocalOrders, ...allOrders];

        // Sort desc
        return allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getById: async (orderId) => {
        await delay(150);
        // Check local first
        const localOrders = getStorage('local_orders');
        const found = localOrders.find(o => o.id === orderId);
        if (found) return found;

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

            // Mock stock check
            // if (product.stock < item.quantity) ...

            const basePrice = product.price;
            const finalPrice = product.types && item.options?.type
                ? basePrice + (product.types.indexOf(item.options.type) * 30000)
                : basePrice;

            subtotal += finalPrice * item.quantity;
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
        const grandTotal = subtotal + shippingFee - (orderData.discountAmount || 0);

        const newOrder = {
            id: 'local_order_' + Date.now(),
            ...orderData,
            items: orderItems,
            totals: {
                subtotal,
                shippingFee,
                discountAmount: orderData.discountAmount || 0,
                grandTotal,
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to Local
        const localOrders = getStorage('local_orders');
        localOrders.push(newOrder);
        setStorage('local_orders', localOrders);

        // Can't reliably update server stock on Vercel read-only db, so skip it or mock it

        if (orderData.clearCart) {
            cartAPI.clearCart(orderData.userId || null);
        }

        return newOrder;
    },

    updateStatus: async (orderId, status) => {
        await delay(150);
        // Check local
        const localOrders = getStorage('local_orders');
        const index = localOrders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            localOrders[index].status = status;
            localOrders[index].updatedAt = new Date().toISOString();
            setStorage('local_orders', localOrders);
            return localOrders[index];
        }

        return fetchJson(`/orders/${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status,
                updatedAt: new Date().toISOString(),
            }),
        });
    },

    cancel: async (orderId) => {
        return ordersAPI.updateStatus(orderId, 'cancelled');
    },

    hasPurchasedProduct: async (userId, productId) => {
        if (!userId || !productId) return false;
        await delay(150);
        const allOrders = await ordersAPI.getAll(userId);
        const productIdNum = parseInt(productId);

        return allOrders.some(order => {
            if (order.status === 'cancelled') return false;
            return order.items && order.items.some(item =>
                parseInt(item.productId) === productIdNum
            );
        });
    },
};

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
        // 1. Server
        let serverVouchers = [];
        try {
            serverVouchers = await fetchJson(`/userVouchers?userId=${userId}`);
        } catch (e) { }

        // 2. Local
        const localUserVouchers = getStorage('local_user_vouchers').filter(v => String(v.userId) === String(userId));

        return [...serverVouchers, ...localUserVouchers];
    },
    markUserVoucherUsed: async (id) => {
        // If local
        if (String(id).startsWith('local_uv_')) {
            const local = getStorage('local_user_vouchers');
            const idx = local.findIndex(v => v.id === id);
            if (idx !== -1) {
                local[idx].used = true;
                local[idx].isUsed = true;
                setStorage('local_user_vouchers', local);
                return local[idx];
            }
        }
        // Else server (won't persist but request works)
        return fetchJson(`/userVouchers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ used: true, isUsed: true })
        });
    },
    assignUserVoucher: async (data) => {
        // Save to local
        const newVoucher = {
            id: 'local_uv_' + Date.now(),
            ...data
        };
        const local = getStorage('local_user_vouchers');
        local.push(newVoucher);
        setStorage('local_user_vouchers', local);
        return newVoucher;
    }
};

export const notificationsAPI = {
    getAll: async (userId) => {
        // Server
        let serverNotifs = [];
        try {
            serverNotifs = await fetchJson(`/notifications?userId=${userId}&_sort=time&_order=desc`);
        } catch (e) { }

        // Local
        const localNotifs = getStorage('local_notifications').filter(n => String(n.userId) === String(userId));

        const all = [...localNotifs, ...serverNotifs];
        return all.sort((a, b) => new Date(b.time) - new Date(a.time));
    },
    create: async (userId, type, message) => {
        const newNotif = {
            id: 'local_notif_' + Date.now(),
            userId,
            type,
            message,
            time: new Date().toISOString(),
            read: false
        };
        const local = getStorage('local_notifications');
        local.push(newNotif);
        setStorage('local_notifications', local);
        return newNotif;
    },
    markAsRead: async (id) => {
        if (String(id).startsWith('local_notif_')) {
            const local = getStorage('local_notifications');
            const idx = local.findIndex(n => n.id === id);
            if (idx !== -1) {
                local[idx].read = true;
                setStorage('local_notifications', local);
                return local[idx];
            }
        }
        return fetchJson(`/notifications/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ read: true })
        });
    }
};
