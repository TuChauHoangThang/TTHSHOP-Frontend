import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productsAPI, favoritesAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, loadProducts, searchProducts } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    loadCategories();
    loadFavorites();
  }, [user]);

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
  }, [products, selectedCategory, sortBy, searchKeyword, minPrice, maxPrice]);

  const loadCategories = async () => {
    try {
      const cats = await productsAPI.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const loadFavorites = async () => {
    if (user) {
      try {
        const favoriteProducts = await favoritesAPI.getAll(user.id);
        setFavorites(favoriteProducts.map(p => p.id));
      } catch (err) {
        console.error('Lỗi tải yêu thích:', err);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
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

    // Lọc theo giá
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    // Sắp xếp
    const sorted = await productsAPI.sort(filtered, sortBy);
    setFilteredProducts(sorted);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchKeyword('');
    setSearchParams({});
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
    if (!user) {
      const confirmLogin = window.confirm('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích. Bạn có muốn đăng nhập ngay bây giờ?');
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

    try {
      const isFavorite = favoritesAPI.isFavorite(productId, user.id);
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(productId, user.id);
        alert('Đã xóa khỏi yêu thích');
      } else {
        await favoritesAPI.addToFavorites(productId, user.id);
        alert('Đã thêm vào yêu thích');
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

  // Tính giá min/max từ products
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : { min: 0, max: 1000000 };

  return (
    <div className="products-page">
      {/* Header với search và sort */}
      <div className="products-top-bar">
        <div className="products-header">
          <h1>Danh Sách Sản Phẩm Handmade</h1>
          <p className="products-count">
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
          </p>
        </div>

        <div className="top-controls">
          {/* Search */}
          <form onSubmit={handleSearch} className="search-form">
            <FontAwesomeIcon icon={icons.search} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            {searchKeyword && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchKeyword('');
                  loadProducts();
                }}
                className="clear-search-btn"
                title="Xóa tìm kiếm"
              >
                <FontAwesomeIcon icon={icons.times} />
              </button>
            )}
          </form>

          {/* Sort */}
          <div className="sort-control">
            <label>
              <FontAwesomeIcon icon={icons.filter} /> Sắp xếp:
            </label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
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

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`products-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h2>
              <FontAwesomeIcon icon={icons.filter} /> Bộ lọc
            </h2>
            <button 
              className="toggle-sidebar-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            >
              <FontAwesomeIcon icon={isSidebarOpen ? icons.chevronLeft : icons.chevronRight} />
            </button>
          </div>

          <div className="sidebar-content">
            {/* Categories */}
            <div className="filter-section">
              <h3>
                <FontAwesomeIcon icon={icons.tag} /> Danh mục
              </h3>
              <div className="category-list">
                <button
                  className={`category-item ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('')}
                >
                  Tất cả
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
              <h3>
                <FontAwesomeIcon icon={icons.creditCard} /> Khoảng giá
              </h3>
              <div className="price-filter">
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                    min="0"
                  />
                  <span className="price-separator">-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                    min="0"
                  />
                </div>
                <div className="price-range-info">
                  <small>
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </small>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || minPrice || maxPrice || searchKeyword) && (
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <FontAwesomeIcon icon={icons.times} /> Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <FontAwesomeIcon icon={icons.products} size="3x" />
              <p>Không tìm thấy sản phẩm nào.</p>
              {(selectedCategory || minPrice || maxPrice || searchKeyword) && (
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  <FontAwesomeIcon icon={icons.times} /> Xóa bộ lọc
                </button>
              )}
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
                        <FontAwesomeIcon icon={isFavorite ? icons.heart : icons.heartRegular} />
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
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon 
                              key={i} 
                              icon={icons.star} 
                              className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} 
                            />
                          ))}
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
                        <FontAwesomeIcon icon={icons.cart} /> {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;

