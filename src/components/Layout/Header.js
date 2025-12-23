import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);

  const categories = [
    'búp bê',
    'hoa handmade',
    'tranh cuộn',
    'sản phẩm từ len',
    'móc chìa khóa',
    'thú bông',
    'túi balo',
    'sản phẩm từ thổ cẩm'
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProductsMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsProductsDropdownOpen(true);
  };

  const handleProductsMouseLeave = () => {
    // Delay 300ms trước khi đóng để người dùng có thời gian di chuyển vào dropdown
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsProductsDropdownOpen(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    setIsProductsDropdownOpen(false);
  };

  const toggleProductsDropdown = () => {
    setIsProductsDropdownOpen(!isProductsDropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <h1>TTH Shop</h1>
          <span className="logo-subtitle">Handmade</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="header-nav">
          <Link to="/" className="nav-link">Trang Chủ</Link>
          <div 
            className="nav-link products-dropdown"
            onMouseEnter={handleProductsMouseEnter}
            onMouseLeave={handleProductsMouseLeave}
          >
            <span 
              onClick={toggleProductsDropdown} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              Sản Phẩm {isProductsDropdownOpen ? '▼' : '▶'}
            </span>
            {isProductsDropdownOpen && (
              <div 
                className="dropdown-menu"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                {categories.map(category => (
                  <Link
                    key={category}
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="dropdown-item"
                    onClick={() => setIsProductsDropdownOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart with badge */}
          <Link to="/cart" className="nav-link cart-link">
            <span>Giỏ Hàng</span>
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="nav-link user-name">
                Xin chào, {user?.name || user?.email}
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Đăng Xuất
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Đăng Nhập</Link>
              <Link to="/register" className="btn-register">Đăng Ký</Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMenuOpen ? 'mobile-nav-open' : ''}`}>
        <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          Trang Chủ
        </Link>
        <div className="mobile-nav-link mobile-products-header" onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}>
          Sản Phẩm {isProductsDropdownOpen ? '▼' : '▶'}
        </div>
        {isProductsDropdownOpen && (
          <div className="mobile-dropdown">
            {categories.map(category => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="mobile-dropdown-item"
                onClick={() => {
                  setIsProductsDropdownOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                {category}
              </Link>
            ))}
          </div>
        )}
        <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
          Giỏ Hàng {getTotalItems() > 0 && `(${getTotalItems()})`}
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Xin chào, {user?.name || user?.email}
            </Link>
            <button onClick={handleLogout} className="mobile-nav-link mobile-logout">
              Đăng Xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Đăng Nhập
            </Link>
            <Link to="/register" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
              Đăng Ký
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
