import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, productsAPI } from '../services/api';

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

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cart = cartAPI.getCart();
    setCartItems(cart);
    
    // Load thông tin chi tiết sản phẩm
    const products = await productsAPI.getAll();
    const details = cart.map(item => {
      const product = products.find(p => parseInt(p.id) === parseInt(item.productId));
      return product ? { ...item, product } : null;
    }).filter(Boolean);
    
    setCartDetails(details);
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart(productId, quantity);
      loadCart();
    } catch (error) {
      throw error; // Re-throw để component có thể xử lý
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
      } else {
        await cartAPI.updateQuantity(productId, quantity);
        loadCart();
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      loadCart();
    } catch (error) {
      throw error;
    }
  };

  const clearCart = () => {
    cartAPI.clearCart();
    setCartItems([]);
    setCartDetails([]);
  };

  const getTotalPrice = () => {
    return cartDetails.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
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

