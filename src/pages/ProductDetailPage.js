import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productsAPI, favoritesAPI } from '../services/api';
import { useReviews } from '../hooks/useReviews';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/ProductDetailPage.css';

// Helper function to convert color names to hex values
const getColorHex = (colorName) => {
  const colorMap = {
    'Đỏ': '#dc3545',
    'Xanh dương': '#007bff',
    'Xanh lá': '#28a745',
    'Vàng': '#ffc107',
    'Cam': '#fd7e14',
    'Tím': '#6f42c1',
    'Hồng': '#e83e8c',
    'Đen': '#000000',
    'Trắng': '#ffffff',
    'Xám': '#6c757d',
    'Nâu': '#8b4513',
    'Be': '#f5f5dc',
    'Kem': '#fffdd0',
    'Xanh nhạt': '#87ceeb',
    'Hồng nhạt': '#ffb6c1',
  };
  return colorMap[colorName] || '#667eea';
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Custom hook cho reviews
  const productId = id ? parseInt(id) : null;
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    hasPurchased,
    canReview,
    hasReviewed,
    getUserReview,
    submitReview,
    deleteReview
  } = useReviews(productId);

  // State cho form đánh giá
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Khởi tạo form với dữ liệu review nếu đang chỉnh sửa
  useEffect(() => {
    if (getUserReview && editingReviewId) {
      if (getUserReview.id === editingReviewId) {
        setReviewRating(getUserReview.rating);
        setReviewComment(getUserReview.comment);
        setShowReviewForm(true);
      }
    } else if (!editingReviewId && !showReviewForm) {
      setReviewRating(5);
      setReviewComment('');
    }
  }, [getUserReview, editingReviewId, showReviewForm]);

  const stockBadge = useMemo(() => {
    if (!product) return '';
    if (product.stock === 0) return 'Hết hàng';
    if (product.stock < 3) return `Chỉ còn ${product.stock}`;
    return `Còn ${product.stock} sản phẩm`;
  }, [product]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const productId = parseInt(id);
        if (isNaN(productId)) {
          throw new Error('ID sản phẩm không hợp lệ');
        }
        const p = await productsAPI.getById(productId);
        if (!p) {
          throw new Error('Không tìm thấy sản phẩm');
        }
        setProduct(p);
        setActiveImage(p.images?.[0] || p.image || '');
        setIsFavorite(user ? favoritesAPI.isFavorite(productId, user.id) : false);
        // Initialize selections
        if (p.colors && p.colors.length > 0) {
          setSelectedColor(p.colors[0]);
        }
        if (p.types && p.types.length > 0) {
          setSelectedType(p.types[0]);
        }
        setQuantity(1);
      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
        setError(err.message || 'Đã xảy ra lỗi khi tải sản phẩm');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadData();
    }
  }, [id, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTypeDropdownOpen && !event.target.closest('.custom-dropdown')) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isTypeDropdownOpen]);

  const handleAddToCart = async () => {
    if (!product) return;

    // Validate selections
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert('Vui lòng chọn màu sắc');
      return;
    }
    if (product.types && product.types.length > 0 && !selectedType) {
      alert('Vui lòng chọn loại sản phẩm');
      return;
    }
    if (quantity <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }
    if (quantity > product.stock) {
      alert(`Chỉ còn ${product.stock} sản phẩm trong kho`);
      return;
    }

    try {
      setAdding(true);
      const options = {
        color: selectedColor,
        type: selectedType
      };
      await addToCart(product.id, quantity, options);
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      // Reset quantity after adding
      setQuantity(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (product && newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value < 1) {
      setQuantity(1);
    } else if (product && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;

    if (!user) {
      const confirmLogin = window.confirm('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?');
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(product.id, user.id);
        alert('Đã xóa khỏi yêu thích');
      } else {
        await favoritesAPI.addToFavorites(product.id, user.id);
        alert('Đã thêm vào yêu thích');
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!productId) return;

    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setReviewError('Bình luận phải có ít nhất 10 ký tự');
      return;
    }

    setReviewError('');
    setSubmittingReview(true);

    try {
      await submitReview(reviewRating, reviewComment, editingReviewId);
      alert(editingReviewId ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá sản phẩm!');
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (err) {
      setReviewError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setShowReviewForm(true);
    setReviewError('');
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      alert('Đã xóa đánh giá!');
      setShowReviewForm(false);
      setEditingReviewId(null);
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error">
          {error || 'Không tìm thấy sản phẩm'}
        </div>
        <button className="btn-back" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <FontAwesomeIcon icon={icons.chevronLeft} />
        <span>Quay lại</span>
      </button>

      <div className="detail-card">
        <div className="detail-left">
          <div className="title-row">
            <h1>{product.name}</h1>
            <button
              className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            >
              <FontAwesomeIcon icon={isFavorite ? icons.heart : icons.heartRegular} />
            </button>
          </div>

          <div className="meta">
            <div className="rating">
              <span className="stars">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="rating-value">({product.rating || 0})</span>
              <span className="reviews-count">({product.reviews || 0} đánh giá)</span>
            </div>
            <div className="category">{product.category}</div>
            <div className={`stock ${product.stock === 0 ? 'out' : ''}`}>{stockBadge}</div>
          </div>

          <div className="gallery">
            <div className="main-image">
              {product.stock === 0 && <div className="badge out">Hết hàng</div>}
              {activeImage ? (
                <img src={activeImage} alt={product.name} onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }} />
              ) : (
                <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                  Không có hình ảnh
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="thumbs">
                {[product.image, ...(product.images || [])]
                  .filter(Boolean)
                  .filter((url, idx, arr) => arr.indexOf(url) === idx)
                  .map((url) => (
                    <button
                      key={url}
                      className={`thumb ${url === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(url)}
                    >
                      <img src={url} alt="thumb" onError={(e) => {
                        e.target.style.display = 'none';
                      }} />
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-right">
          <div className="price price-right">{formatPrice(product.price)}</div>
          <div className="options-box">
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="selection-group">
                <label className="selection-label">
                  <span>Màu sắc:</span>
                  {selectedColor && <span className="selected-value">{selectedColor}</span>}
                </label>
                <div className="color-options">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'active' : ''} ${getColorHex(color) === '#ffffff' ? 'white-color' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        backgroundColor: getColorHex(color),
                        borderColor: selectedColor === color ? '#667eea' : (getColorHex(color) === '#ffffff' ? '#ccc' : '#ddd')
                      }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <FontAwesomeIcon
                          icon={icons.check}
                          style={{
                            color: getColorHex(color) === '#ffffff' ? '#333' : '#fff',
                            fontSize: '0.85rem'
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type Selection - Dropdown */}
            {product.types && product.types.length > 0 && (
              <div className="selection-group">
                <label className="selection-label">
                  <span>Loại sản phẩm:</span>
                </label>
                <div className="custom-dropdown">
                  <button
                    className="dropdown-toggle"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    type="button"
                  >
                    <span>{selectedType || 'Chọn loại sản phẩm'}</span>
                    <FontAwesomeIcon
                      icon={icons.chevronDown}
                      className={`dropdown-arrow ${isTypeDropdownOpen ? 'open' : ''}`}
                    />
                  </button>
                  {isTypeDropdownOpen && (
                    <div className="dropdown-menu">
                      {product.types.map((type) => (
                        <div
                          key={type}
                          className={`dropdown-item ${selectedType === type ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedType(type);
                            setIsTypeDropdownOpen(false);
                          }}
                        >
                          {type}
                          {selectedType === type && (
                            <FontAwesomeIcon icon={icons.check} className="check-icon" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="selection-group">
              <label className="selection-label">
                <span>Số lượng:</span>
                <span className="stock-info">
                  {product.stock > 0 ? `(Còn ${product.stock} sản phẩm)` : '(Hết hàng)'}
                </span>
              </label>
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  type="button"
                >
                  <FontAwesomeIcon icon={icons.minus} />
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={handleQuantityInput}
                  min="1"
                  max={product.stock}
                />
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  type="button"
                >
                  <FontAwesomeIcon icon={icons.plus} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="actions">
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
              >
                <FontAwesomeIcon icon={icons.cart} />
                {product.stock === 0 ? 'Hết hàng' : adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/cart')}
              >
                Xem giỏ hàng
              </button>
            </div>
          </div>

        </div>
      </div>

      <section className="description-section">
        <div className="description-header">
          <h3>Mô tả sản phẩm</h3>
          {product.description && product.description.length > 220 && (
            <button
              className="toggle-desc-btn"
              onClick={() => setIsDescExpanded(prev => !prev)}
            >
              {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>
        <div className={`description ${isDescExpanded ? 'expanded' : 'clamped'}`}>
          {product.description}
        </div>
        {!isDescExpanded && product.description && product.description.length > 220 && (
          <div className="fade-overlay" aria-hidden="true" />
        )}
      </section>

      <div className="section">
        <h2>Đánh giá sản phẩm</h2>

        {/* Form đánh giá - chỉ hiển thị khi user đã mua */}
        {hasPurchased && user && !showReviewForm && !hasReviewed && (
          <div className="review-prompt">
            <p>Bạn đã mua sản phẩm này. Hãy chia sẻ đánh giá của bạn!</p>
            <button
              className="btn-review"
              onClick={() => {
                setEditingReviewId(null);
                setReviewRating(5);
                setReviewComment('');
                setShowReviewForm(true);
              }}
            >
              Viết đánh giá
            </button>
          </div>
        )}

        {/* Hiển thị nút chỉnh sửa nếu đã có review */}
        {hasPurchased && user && hasReviewed && getUserReview && !showReviewForm && (
          <div className="review-prompt">
            <p>Bạn đã đánh giá sản phẩm này. Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-review"
                onClick={() => handleEditReview(getUserReview)}
              >
                Chỉnh sửa đánh giá
              </button>
              <button
                className="btn-review"
                style={{ background: '#dc3545' }}
                onClick={() => handleDeleteReview(getUserReview.id)}
              >
                Xóa đánh giá
              </button>
            </div>
          </div>
        )}

        {(canReview || (hasReviewed && editingReviewId)) && showReviewForm && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="review-form-header">
              <h3>{editingReviewId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}</h3>
              <button
                type="button"
                className="review-form-close"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewError('');
                  setEditingReviewId(null);
                  setReviewRating(5);
                  setReviewComment('');
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label>Đánh giá của bạn:</label>
              <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${reviewRating >= star ? 'active' : ''}`}
                    onClick={() => setReviewRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="review-comment">Bình luận:</label>
              <textarea
                id="review-comment"
                className="review-textarea"
                value={reviewComment}
                onChange={(e) => {
                  setReviewComment(e.target.value);
                  setReviewError('');
                }}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                rows="4"
                required
                minLength="10"
              />
              <div className="char-count">
                {reviewComment.length}/10 ký tự (tối thiểu)
              </div>
            </div>

            {reviewError && (
              <div className="review-error">{reviewError}</div>
            )}

            <div className="review-form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewComment('');
                  setReviewError('');
                  setEditingReviewId(null);
                  setReviewRating(5);
                }}
                disabled={submittingReview}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit-review"
                disabled={submittingReview || reviewComment.trim().length < 10}
              >
                {submittingReview ? 'Đang gửi...' : (editingReviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
              </button>
            </div>
          </form>
        )}

        {!user && (
          <div className="review-prompt">
            <p>Đăng nhập và mua sản phẩm để có thể đánh giá.</p>
          </div>
        )}


        {user && !canReview && !hasReviewed && (
          <div className="review-prompt">
            <p>Bạn cần mua sản phẩm trước khi có thể đánh giá.</p>
          </div>
        )}

        {/* Danh sách reviews */}
        {reviewsLoading ? (
          <p className="muted">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="muted">Chưa có đánh giá nào.</p>
        ) : (
          <div className="reviews">
            {reviews.map((r) => {
              const isOwnReview = user && String(r.userId) === String(user.id);
              return (
                <div key={r.id} className={`review-card ${isOwnReview ? 'own-review' : ''}`}>
                  <div className="review-header">
                    <div className="reviewer">
                      {r.userName || 'Khách hàng'}
                      {isOwnReview && <span className="review-badge">(Bạn)</span>}
                    </div>
                    <div className="review-rating">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <div className="review-footer">
                    <div className="review-date">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    {isOwnReview && !showReviewForm && (
                      <div className="review-actions">
                        <button
                          className="btn-edit-review"
                          onClick={() => handleEditReview(r)}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="btn-delete-review"
                          onClick={() => handleDeleteReview(r.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

