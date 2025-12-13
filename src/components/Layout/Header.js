import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <header style={{ 
      padding: '1rem', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>
        <h1>TTH Shop - Handmade</h1>
      </Link>
      
      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/products">Sản Phẩm</Link>
        
        <Link to="/cart">
          Giỏ Hàng ({getTotalItems()})
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/profile">Xin chào, {user?.name || user?.email}</Link>
            <button onClick={logout}>Đăng Xuất</button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng Nhập</Link>
            <Link to="/register">Đăng Ký</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

