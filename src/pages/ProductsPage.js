import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { productsAPI, favoritesAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, loadProducts, searchProducts } = useProducts();
  const { addToCart } = useCart();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadCategories();
    loadFavorites();
  }, []);

  useEffect(() => {
    // Lấy category từ URL query params và cập nhật state
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    } else {
      setSelectedCategory('');
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchKeyword]);

  const loadCategories = async () => {
    try {
      const cats = await productsAPI.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const loadFavorites = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
  };

  const filterAndSortProducts = async () => {
    let filtered = [...products];

    // Lọc theo danh mục
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Tìm kiếm
    if (searchKeyword) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    // Sắp xếp
    const sorted = await productsAPI.sort(filtered, sortBy);
    setFilteredProducts(sorted);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      searchProducts(searchKeyword);
    } else {
      loadProducts();
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Cập nhật URL khi category thay đổi
    if (category) {
      setSearchParams({ category: category });
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleFavorite = async (productId) => {
    try {
      const isFavorite = favoritesAPI.isFavorite(productId);
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(productId);
      } else {
        await favoritesAPI.addToFavorites(productId);
      }
      loadFavorites();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">Đang tải sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error">Lỗi: {error}</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Danh Sách Sản Phẩm Handmade</h1>
        <p className="products-count">Tìm thấy {filteredProducts.length} sản phẩm</p>
      </div>

      <div className="products-filters">
        {/* Tìm kiếm */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Tìm kiếm</button>
          {searchKeyword && (
            <button 
              type="button" 
              onClick={() => {
                setSearchKeyword('');
                loadProducts();
              }}
              className="clear-btn"
            >
              Xóa
            </button>
          )}
        </form>

        <div className="filters-row">
          {/* Lọc theo danh mục */}
          <div className="filter-group">
            <label>Danh mục:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>Không tìm thấy sản phẩm nào.</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => {
            const isFavorite = favorites.includes(product.id);
            return (
              <div key={product.id} className="product-card">
                <div 
                  className="product-image-container"
                  onClick={() => handleProductClick(product.id)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                  />
                  {product.stock === 0 && (
                    <div className="out-of-stock">Hết hàng</div>
                  )}
                  <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    title={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                  >
                    {isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>
                
                <div className="product-info">
                  <h3 
                    className="product-name"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </h3>
                  
                  <div className="product-rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </span>
                    <span className="rating-value">({product.rating})</span>
                    <span className="reviews-count">({product.reviews} đánh giá)</span>
                  </div>
                  
                  <div className="product-category">{product.category}</div>
                  
                  <div className="product-price">{formatPrice(product.price)}</div>
                  
                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">Còn {product.stock} sản phẩm</span>
                    ) : (
                      <span className="out-of-stock-text">Hết hàng</span>
                    )}
                  </div>
                  
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

