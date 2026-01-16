import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePagination } from './usePagination';
import { useToast } from './useToast';
import { favoritesAPI, notificationsAPI } from '../services/api';

export const useFavoritePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Sử dụng usePagination hook
    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedProducts,
        handlePageChange
    } = usePagination(favoriteProducts, 12, true);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const products = await favoritesAPI.getAll(user.id);
            setFavoriteProducts(products);
            setError('');
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách yêu thích');
            addToast(err.message || 'Lỗi tải danh sách yêu thích', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId) => {
        try {
            await favoritesAPI.removeFromFavorites(productId, user.id);
            await notificationsAPI.create(user.id, 'system', 'Đã xóa sản phẩm khỏi yêu thích');
            await loadFavorites();
            addToast('Đã xóa sản phẩm khỏi yêu thích', 'success');
        } catch (err) {
            console.error(err.message || 'Có lỗi xảy ra khi xóa sản phẩm khỏi yêu thích');
            addToast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
            if (user) await notificationsAPI.create(user.id, 'order', 'Đã thêm sản phẩm vào giỏ hàng');
            addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
        } catch (err) {
            console.error(err.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
            addToast(err.message || 'Lỗi thêm giỏ hàng', 'error');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    return {
        user,
        favoriteProducts,
        loading,
        error,
        currentPage,
        totalPages,
        paginatedProducts,
        handlePageChange,
        handleRemoveFavorite,
        handleAddToCart,
        handleProductClick,
        navigate
    };
};
