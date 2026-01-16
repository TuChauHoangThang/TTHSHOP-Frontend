import { useState, useEffect } from 'react';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook để xử lý logic yêu thích
 * @returns {Object} - { favorites, loading, isFavorite, toggleFavorite, loadFavorites }
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load danh sách yêu thích khi user thay đổi
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Load danh sách yêu thích
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const favoriteProducts = await favoritesAPI.getAll(user.id);
      setFavorites(favoriteProducts.map(p => p.id));
    } catch (err) {
      console.error('Lỗi tải yêu thích:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => {
    if (!user) return false;
    return favorites.some(id => String(id) === String(productId));
  };

  // Toggle yêu thích (thêm/xóa)
  const toggleFavorite = async (productId) => {
    if (!user) {
      return { success: false, message: 'Vui lòng đăng nhập để thêm sản phẩm vào yêu thích' };
    }

    try {
      const isFav = isFavorite(productId);
      if (isFav) {
        await favoritesAPI.removeFromFavorites(productId, user.id);
        await loadFavorites(); // Reload để cập nhật state
        return { success: true, message: 'Đã xóa khỏi yêu thích', isFavorite: false };
      } else {
        await favoritesAPI.addToFavorites(productId, user.id);
        await loadFavorites(); // Reload để cập nhật state
        return { success: true, message: 'Đã thêm vào yêu thích', isFavorite: true };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    loadFavorites
  };
};

