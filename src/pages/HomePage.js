import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { productsAPI, favoritesAPI } from '../services/fakeApi';
import { formatPrice } from '../utils/formatPrice';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    
    const [favorites, setFavorites] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            // Lấy sản phẩm bán chạy (sắp xếp theo rating và reviews)
            const sorted = [...products]
                .sort((a, b) => {
                    // Ưu tiên rating cao, sau đó là số lượng reviews
                    if (b.rating !== a.rating) {
                        return b.rating - a.rating;
                    }
                    return b.reviews - a.reviews;
                })
                .slice(0, 4); // Lấy 4 sản phẩm đầu tiên
            setBestSellingProducts(sorted);
        }
    }, [products]);

    const loadFavorites = () => {
        const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(favs);
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
        try {
            const isFavorite = favoritesAPI.isFavorite(productId);
            if (isFavorite) {
                await favoritesAPI.removeFromFavorites(productId);
            } else {
                await favoritesAPI.addToFavorites(productId);
            }
            loadFavorites();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleViewProducts = () => {
        navigate('/products');
    };

    return (
        <div className="home">
            {/* HERO / BANNER */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Túi – Ví Thổ Cẩm</h1>
                    <p>Sắc màu truyền thống – 100% Handmade</p>
                    <button onClick={handleViewProducts}>Xem sản phẩm</button>
                </div>
            </section>

            {/* THỐNG KÊ */}
            <section className="stats">
                <div className="stat-item">
                    <h2>100+</h2>
                    <p>Sản phẩm</p>
                </div>
                <div className="stat-item">
                    <h2>10+</h2>
                    <p>Danh mục</p>
                </div>
                <div className="stat-item">
                    <h2>100%</h2>
                    <p>Handmade</p>
                </div>
                <div className="stat-item">
                    <h2>500+</h2>
                    <p>Khách hàng</p>
                </div>
            </section>

            {/* CHẤT LIỆU */}
            <section className="materials">
                <h2>Chất liệu nổi bật</h2>
                <div className="material-list">
                    <div className="material-card">
                        <img src="/images/thocam.jpg" alt="Thổ cẩm" />
                        <h3>Chất liệu thổ cẩm</h3>
                        <p>Sắc màu dân tộc Việt Nam</p>
                    </div>
                    <div className="material-card">
                        <img src="/images/len.jpg" alt="Len" />
                        <h3>Chất liệu len</h3>
                        <p>Đặc sắc trong từng đường nét</p>
                    </div>
                    <div className="material-card">
                        <img src="/images/giay.jpg" alt="Giấy" />
                        <h3>Chất liệu giấy</h3>
                        <p>Nghệ thuật từ giấy tái chế</p>
                    </div>
                </div>
            </section>

            {/* SẢN PHẨM BÁN CHẠY */}
            <section className="products">
                <h2>Sản phẩm bán chạy</h2>
                {loading ? (
                    <div className="loading">Đang tải sản phẩm...</div>
                ) : (
                    <div className="products-grid">
                        {bestSellingProducts.map(product => {
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
                                            {isFavorite ? '❤️' : '🤍'}
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
                                                {'★'.repeat(Math.floor(product.rating))}
                                                {'☆'.repeat(5 - Math.floor(product.rating))}
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
                                            {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* FEEDBACK */}
            <section className="feedback">
                <h2>Feedback khách hàng</h2>
                <blockquote>
                    "Lần đầu mua tranh giấy cuộn nhưng rất bất ngờ vì độ độc đáo.
                    Sản phẩm nhẹ, dễ bảo quản và rất nổi bật."
                </blockquote>
                <p className="customer">— Trà Giang</p>
            </section>
        </div>
    );
};

export default HomePage;
