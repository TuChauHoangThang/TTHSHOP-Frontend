import { useState, useEffect, useCallback } from 'react';
import { reviewsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';


export const useReviews = (productId) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

  // Load danh sách reviews
  const loadReviews = useCallback(async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await reviewsAPI.getByProductId(productId);
      setReviews(data || []);
    } catch (err) {
      console.error('Lỗi tải reviews:', err);
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Kiểm tra user đã mua sản phẩm này chưa
  const checkPurchaseStatus = useCallback(async () => {
    if (!user || !productId) {
      setHasPurchased(false);
      return;
    }

    try {
      setCheckingPurchase(true);
      const purchased = await ordersAPI.hasPurchasedProduct(user.id, productId);
      setHasPurchased(purchased);
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái mua hàng:', err);
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  }, [user, productId]);

  // Load reviews khi productId thay đổi
  useEffect(() => {
    if (productId) {
      loadReviews();
      checkPurchaseStatus();
    }
  }, [productId, user, loadReviews, checkPurchaseStatus]);

  // Kiểm tra user đã đánh giá sản phẩm này chưa
  const hasReviewed = useCallback(() => {
    if (!user) return false;
    return reviews.some(review => String(review.userId) === String(user.id));
  }, [reviews, user]);

  // Lấy review của user hiện tại
  const getUserReview = useCallback(() => {
    if (!user) return null;
    return reviews.find(review => String(review.userId) === String(user.id)) || null;
  }, [reviews, user]);

  // Kiểm tra user có thể đánh giá không (đã mua và chưa đánh giá)
  const canReview = useCallback(() => {
    return hasPurchased && !hasReviewed() && user;
  }, [hasPurchased, hasReviewed, user]);

  // Submit review (tạo mới hoặc cập nhật)
  const submitReview = async (rating, comment, reviewId = null) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập để đánh giá sản phẩm');
    }

    if (!hasPurchased) {
      throw new Error('Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua sản phẩm');
    }

    try {
      setError(null);
      
      if (reviewId) {
        // Cập nhật review đã có - cập nhật cả userName để đảm bảo tên luôn đúng
        await reviewsAPI.update(reviewId, {
          rating: parseInt(rating),
          comment: comment.trim(),
          userName: user.name || user.email || 'Khách hàng' // Cập nhật userName khi chỉnh sửa
        });
      } else {
        // Tạo review mới
        if (hasReviewed()) {
          throw new Error('Bạn đã đánh giá sản phẩm này rồi. Vui lòng chỉnh sửa review hiện tại.');
        }
        
        const reviewData = {
          productId: parseInt(productId),
          userId: user.id,
          userName: user.name || user.email || 'Khách hàng',
          rating: parseInt(rating),
          comment: comment.trim()
        };

        await reviewsAPI.create(reviewData);
      }
      
      await loadReviews(); // Reload reviews sau khi submit
      await checkPurchaseStatus(); // Cập nhật lại trạng thái
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi gửi đánh giá';
      setError(errorMessage);
      throw err;
    }
  };

  // Xóa review
  const deleteReview = async (reviewId) => {
    if (!user) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      setError(null);
      await reviewsAPI.delete(reviewId);
      await loadReviews(); // Reload reviews sau khi xóa
      await checkPurchaseStatus(); // Cập nhật lại trạng thái
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi xóa đánh giá';
      setError(errorMessage);
      throw err;
    }
  };

  // Refresh reviews
  const refreshReviews = useCallback(() => {
    loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    loading,
    error,
    hasPurchased,
    checkingPurchase,
    canReview: canReview(),
    hasReviewed: hasReviewed(),
    getUserReview: getUserReview(),
    submitReview,
    deleteReview,
    refreshReviews
  };
};

