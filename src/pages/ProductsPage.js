import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePagination } from '../hooks/usePagination';
import { useFavorites } from '../hooks/useFavorites';
import { productsAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import Pagination from '../components/Pagination';
import '../styles/ProductsPage.css';
import '../styles/toggle-btn.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, loadProducts, searchProducts } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Động số sản phẩm mỗi trang dựa vào sidebar
  const itemsPerPage = useMemo(() => isSidebarOpen ? 6 : 8, [isSidebarOpen]);

  // Sử dụng usePagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    handlePageChange
  } = usePagination(filteredProducts, itemsPerPage, true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Lấy category từ URL query params và cập nhật state
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    } else {
      setSelectedCategory('');
    }

    // --- THÊM MỚI: Lấy search từ URL và cập nhật vào searchKeyword ---
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchKeyword(decodeURIComponent(searchFromUrl));
    }
    // -----------------------------------------------------------
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
        (p.description && p.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())))
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
      // --- THÊM MỚI: Đồng bộ từ khóa lên URL khi nhấn tìm kiếm tại trang này ---
      setSearchParams({ search: searchKeyword.trim() });
      // ---------------------------------------------------------------------
      searchProducts(searchKeyword);
    } else {
      loadProducts();
      setSearchParams({}); // Thêm: Xóa param trên URL nếu rỗng
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

    const result = await toggleFavorite(productId);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
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
            {/* --- THÊM MỚI: Hiển thị từ khóa đang tìm kiếm --- */}
            {searchKeyword && <span>Kết quả cho: "<strong>{searchKeyword}</strong>" - </span>}
            {/* --------------------------------------------- */}
            Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
            {totalPages > 1 && ` - Trang ${currentPage}/${totalPages}`}
          </p>
        </div>

        <div className="top-controls">
          {/* Toggle Sidebar Button - Always visible */}
          <button
            className="toggle-sidebar-btn-top"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          >
            <FontAwesomeIcon icon={isSidebarOpen ? icons.chevronLeft : icons.filter} />
            {isSidebarOpen ? 'Ẩn' : 'Hiện'}
          </button>


          {/* Price Filter Top */}
          <div className="price-filter-top">
            <input
              type="number"
              placeholder="Thấp nhất"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input-top"
              min="0"
            />
            <span className="separator">-</span>
            <input
              type="number"
              placeholder="Cao nhất"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input-top"
              min="0"
            />
          </div>

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
            <>
              <div className="products-grid">
                {paginatedProducts.map(product => {
                  const productIsFavorite = isFavorite(product.id);
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
                          className={`favorite-btn ${productIsFavorite ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(product.id);
                          }}
                          title={productIsFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                        >
                          <FontAwesomeIcon icon={productIsFavorite ? icons.heart : icons.heartRegular} />
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

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  showPageInfo={true}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;