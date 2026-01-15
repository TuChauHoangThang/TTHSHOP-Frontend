import React from 'react';
import { useFavoritePage } from '../hooks/useFavoritePage';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../utils/icons';
import Pagination from '../components/Pagination';
import '../styles/FavoritePage.css';

const FavoritePage = () => {
  const {
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
  } = useFavoritePage();

  if (!user) {
    return (
      <div className="favorite-page">
        <div className="favorite-empty">
          <div className="empty-icon">🔒</div>
          <h2>Vui lòng đăng nhập</h2>
          <p>Bạn cần đăng nhập để xem danh sách sản phẩm yêu thích.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorite-page">
        <div className="loading">Đang tải danh sách yêu thích...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorite-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="favorite-page">
      <div className="favorite-header">
        <h1>Sản Phẩm Yêu Thích</h1>
        <p className="favorite-count">
          Bạn có {favoriteProducts.length} sản phẩm yêu thích
          {totalPages > 1 && ` - Trang ${currentPage}/${totalPages}`}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="favorite-empty">
          <div className="empty-icon">❤️</div>
          <h2>Chưa có sản phẩm yêu thích</h2>
          <p>Hãy khám phá và thêm các sản phẩm bạn yêu thích vào danh sách này.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <>
          <div className="favorite-grid">
            {paginatedProducts.map(product => (
              <div key={product.id} className="favorite-card">
                <div
                  className="favorite-image-container"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="favorite-image"
                  />
                  {product.stock === 0 && (
                    <div className="out-of-stock">Hết hàng</div>
                  )}
                  <button
                    className="favorite-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.stopPropagation();
                      handleRemoveFavorite(product.id);
                    }}
                    title="Xóa khỏi yêu thích"
                  >
                    <FontAwesomeIcon icon={icons.heart} />
                  </button>
                </div>

                <div className="favorite-info">
                  <h3
                    className="favorite-name"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </h3>

                  <div className="favorite-rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span className="rating-value">({product.rating})</span>
                    <span className="reviews-count">({product.reviews} đánh giá)</span>
                  </div>

                  <div className="favorite-category">{product.category}</div>

                  <div className="favorite-price">{formatPrice(product.price)}</div>

                  <div className="favorite-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">Còn {product.stock} sản phẩm</span>
                    ) : (
                      <span className="out-of-stock-text">Hết hàng</span>
                    )}
                  </div>

                  <div className="favorite-actions">
                    <button
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                    </button>
                    <button
                      className="view-detail-btn"
                      onClick={() => handleProductClick(product.id)}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={12}
              showPageInfo={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FavoritePage;
