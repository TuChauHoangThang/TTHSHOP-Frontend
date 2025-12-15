import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productsAPI, favoritesAPI, reviewsAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [adding, setAdding] = useState(false);

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
        const [p, r] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProductId(id)
        ]);
        setProduct(p);
        setActiveImage(p.images?.[0] || p.image);
        setReviews(r);
        setIsFavorite(favoritesAPI.isFavorite(id));
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(product.id);
      } else {
        await favoritesAPI.addToFavorites(product.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert(err.message);
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
      <div className="breadcrumb">
        <button onClick={() => navigate(-1)} className="link-btn">← Quay lại</button>
        <span>/</span>
        <button onClick={() => navigate('/products')} className="link-btn">Sản phẩm</button>
        <span>/</span>
        <span className="current">{product.name}</span>
      </div>

      <div className="detail-card">
        <div className="gallery">
          <div className="main-image">
            {product.stock === 0 && <div className="badge out">Hết hàng</div>}
            <img src={activeImage} alt={product.name} />
          </div>
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
                  <img src={url} alt="thumb" />
                </button>
              ))}
          </div>
        </div>

        <div className="info">
          <div className="title-row">
            <h1>{product.name}</h1>
            <button
              className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            >
              {isFavorite ? '❤️' : '🤍'}
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

          <div className="price">{formatPrice(product.price)}</div>

          <p className="description">{product.description}</p>

          <div className="actions">
            <button
              className="btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
            >
              {product.stock === 0 ? 'Hết hàng' : adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
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

      <div className="section">
        <h2>Đánh giá sản phẩm</h2>
        {reviews.length === 0 ? (
          <p className="muted">Chưa có đánh giá nào.</p>
        ) : (
          <div className="reviews">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer">{r.userName || 'Khách hàng'}</div>
                  <div className="review-rating">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                <p className="review-comment">{r.comment}</p>
                <div className="review-date">
                  {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

