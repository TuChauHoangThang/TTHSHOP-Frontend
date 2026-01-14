import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, productsAPI } from '../services/api';
import { getPriceByType } from '../utils/productPrice';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartDetails, setCartDetails] = useState([]); // Cart items với thông tin sản phẩm đầy đủ
  const { user } = useAuth();
  const currentUserId = user?.id || null;

  useEffect(() => {
    loadCart();
  }, [currentUserId]);

  const loadCart = async () => {
    const cart = cartAPI.getCart(currentUserId);
    setCartItems(cart);

    // Load thông tin chi tiết sản phẩm
    const products = await productsAPI.getAll();
    const details = cart.map(item => {
      const product = products.find(p => parseInt(p.id) === parseInt(item.productId));
      if (!product) return null;

      const finalPrice = getPriceByType(product.price, item.options?.type, product.types);
      return { ...item, product: { ...product, finalPrice } };
    }).filter(Boolean);

    setCartDetails(details);
  };

  const addToCart = async (productId, quantity = 1, options = {}) => {
    try {
      await cartAPI.addToCart(productId, quantity, options, currentUserId);
      loadCart();
    } catch (error) {
      throw error; // Re-throw để component có thể xử lý
    }
  };

  const updateQuantity = async (productId, quantity, options = {}) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId, options);
      } else {
        await cartAPI.updateQuantity(productId, quantity, options, currentUserId);
        loadCart();
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId, options = {}) => {
    try {
      await cartAPI.removeFromCart(productId, options, currentUserId);
      loadCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = () => {
    cartAPI.clearCart(currentUserId);
    setCartItems([]);
    setCartDetails([]);
  };

  const getTotalPrice = () => {
    return cartDetails.reduce((total, item) => {
      return total + (item.product.finalPrice * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    cartDetails,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

