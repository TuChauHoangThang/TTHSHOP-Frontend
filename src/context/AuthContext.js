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
            const fullUserData = {
                email: userData.email,
                password: userData.password,
                name: userData.name,
                role: 'user',

                avatar: null,
                phone: '',
                address: '',
                language: 'vi',

                notificationSettings: {
                    orderUpdates: true,
                    promotions: true,
                    systemNews: true,
                    emailNotifications: true
                },

                createdAt: new Date().toISOString()
            };

            const response = await authAPI.register(fullUserData);

            authAPI.setCurrentUser(response.user);
            setUser(response.user);

            // Chuyển giỏ hàng khách → user mới
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

