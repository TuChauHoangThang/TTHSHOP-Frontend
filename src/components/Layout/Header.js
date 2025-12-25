import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {useCart} from '../../context/CartContext';
import {FontAwesomeIcon, icons} from '../../utils/icons';
import '../../styles/Header.css';

const Header = () => {
    const {user, logout, isAuthenticated} = useAuth();
    const {getTotalItems} = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                    <Link to="/" className="nav-link">
                        <FontAwesomeIcon icon={icons.home} /> Trang Chủ
                    </Link>
                    <Link to="/products" className="nav-link">
                        <FontAwesomeIcon icon={icons.products} /> Sản Phẩm
                    </Link>

                    {/* Cart with badge */}
                    <Link to="/cart" className="nav-link cart-link">
                        <FontAwesomeIcon icon={icons.cart} /> <span>Giỏ Hàng</span>
                        {getTotalItems() > 0 && (
                            <span className="cart-badge">{getTotalItems()}</span>
                        )}
                    </Link>

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <Link to="/profile" className="nav-link user-name">
                                <FontAwesomeIcon icon={icons.user} /> Xin chào, {user?.name || user?.email}
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                <FontAwesomeIcon icon={icons.logout} /> Đăng Xuất
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="nav-link">
                                <FontAwesomeIcon icon={icons.login} /> Đăng Nhập
                            </Link>
                            <Link to="/register" className="btn-register">
                                <FontAwesomeIcon icon={icons.register} /> Đăng Ký
                            </Link>
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
                    <FontAwesomeIcon icon={icons.home} /> Trang Chủ
                </Link>
                <Link to="/products" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.products} /> Sản Phẩm
                </Link>
                <Link to="/cart" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                    <FontAwesomeIcon icon={icons.cart} /> Giỏ Hàng {getTotalItems() > 0 && `(${getTotalItems()})`}
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <FontAwesomeIcon icon={icons.user} /> Xin chào, {user?.name || user?.email}
                        </Link>
                        <button onClick={handleLogout} className="mobile-nav-link mobile-logout">
                            <FontAwesomeIcon icon={icons.logout} /> Đăng Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <FontAwesomeIcon icon={icons.login} /> Đăng Nhập
                        </Link>
                        <Link to="/register" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <FontAwesomeIcon icon={icons.register} /> Đăng Ký
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
