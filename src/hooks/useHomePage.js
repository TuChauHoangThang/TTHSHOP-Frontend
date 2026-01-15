import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from './useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { favoritesAPI, notificationsAPI } from '../services/api';

export const useHomePage = () => {
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [favorites, setFavorites] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [discountedProducts, setDiscountedProducts] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, [user]);

    useEffect(() => {
        if (products.length > 0) {
            // 1. Sản phẩm bán chạy: Sắp xếp theo số lượng đã bán (sold) giảm dần
            const sortedBySold = [...products]
                .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                .slice(0, 4); // Lấy 4 sản phẩm
            setBestSellingProducts(sortedBySold);

            // 2. Sản phẩm giảm giá: Có originalPrice > price
            const discounted = products
                .filter(p => p.originalPrice && p.originalPrice > p.price)
                .sort((a, b) => {
                    const discountA = (a.originalPrice - a.price) / a.originalPrice;
                    const discountB = (b.originalPrice - b.price) / b.originalPrice;
                    return discountB - discountA; // Giảm giá sâu xếp trước
                })
                .slice(0, 4);
            setDiscountedProducts(discounted);
        }
    }, [products]);

    const loadFavorites = async () => {
        if (user) {
            try {
                const favoriteProducts = await favoritesAPI.getAll(user.id);
                setFavorites(favoriteProducts.map(p => parseInt(p.id)));
            } catch (err) {
                console.error('Lỗi tải yêu thích:', err);
                setFavorites([]);
            }
        } else {
            setFavorites([]);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
            if (user) {
                await notificationsAPI.create(user.id, 'order', 'Đã thêm sản phẩm vào giỏ hàng');
            }
            addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleFavorite = async (productId) => {
        if (!user) {
            const confirmLogin = window.confirm('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?');
            if (confirmLogin) {
                navigate('/login');
            }
            return;
        }

        try {
            const isFavorite = await favoritesAPI.isFavorite(productId, user.id);
            if (isFavorite) {
                await favoritesAPI.removeFromFavorites(productId, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã xóa sản phẩm khỏi yêu thích');
                addToast('Đã xóa sản phẩm khỏi yêu thích', 'info');
            } else {
                await favoritesAPI.addToFavorites(productId, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã thêm sản phẩm vào yêu thích');
                addToast('Đã thêm sản phẩm vào yêu thích', 'success');
            }
            loadFavorites();
        } catch (err) {
            console.error(err);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleViewProducts = () => {
        navigate('/products');
    };

    return {
        products,
        loading,
        favorites,
        bestSellingProducts,
        discountedProducts,
        handleAddToCart,
        handleToggleFavorite,
        handleProductClick,
        handleViewProducts
    };
};
