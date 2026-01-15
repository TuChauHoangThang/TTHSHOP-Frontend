import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedAuthRoute from './components/ProtectedAuthRoute';
import Layout from './components//Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FavoritePage from './pages/FavoritePage';
import ContactPage from './pages/ContactPage';
import BestSellingPage from './pages/BestSellingPage';
import FlashSalePage from './pages/FlashSalePage';

import './styles/App.css';

import { ToastProvider } from './context/ToastContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <CartProvider>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/:id" element={<ProductDetailPage />} />
                                <Route path="/best-selling" element={<BestSellingPage />} />
                                <Route path="/flash-sale" element={<FlashSalePage />} />
                                <Route
                                    path="/login"
                                    element={
                                        <ProtectedAuthRoute>
                                            <LoginPage />
                                        </ProtectedAuthRoute>
                                    }
                                />

                                <Route
                                    path="/register"
                                    element={
                                        <ProtectedAuthRoute>
                                            <RegisterPage />
                                        </ProtectedAuthRoute>
                                    }
                                />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/blog" element={<BlogPage />} />
                                <Route path="/blog/:id" element={<BlogDetailPage />} />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <UserProfilePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/checkout"
                                    element={
                                        <ProtectedRoute>
                                            <CheckoutPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/favorites"
                                    element={
                                        <ProtectedRoute>
                                            <FavoritePage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>

                            <ScrollToTop />
                        </Layout>
                    </CartProvider>
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
