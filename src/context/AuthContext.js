import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, cartAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra user đã đăng nhập
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      authAPI.setCurrentUser(response.user);
      setUser(response.user);
      // Mang giỏ hàng của khách (nếu có) sang tài khoản vừa đăng nhập
      const guestCart = cartAPI.getCart(null);
      if (guestCart.length > 0) {
        cartAPI.copyCart(null, response.user.id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      authAPI.setCurrentUser(response.user);
      setUser(response.user);
      // Nếu có giỏ hàng của khách, chuyển sang tài khoản mới
      const guestCart = cartAPI.getCart(null);
      if (guestCart.length > 0) {
        cartAPI.copyCart(null, response.user.id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (user) {
      // Giữ lại giỏ hàng dưới dạng khách để người dùng không mất sau khi đăng xuất
      cartAPI.copyCart(user.id, null);
    }
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

