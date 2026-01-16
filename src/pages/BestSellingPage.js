import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, favoritesAPI, notificationsAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Pagination from '../components/Pagination';

const BestSellingPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [allProducts, setAllProducts] = useState([]);
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8; // Mỗi trang 8 sản phẩm

    useEffect(() => {
        loadData();
    }, [user]);

    // Client-side pagination effect
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayProducts(allProducts.slice(startIndex, endIndex));
        window.scrollTo(0, 0);
    }, [currentPage, allProducts]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch ALL products to handle sorting and pagination client-side (consistent with ProductsPage)
            const data = await productsAPI.getAll();

            if (data && Array.isArray(data)) {
                // Sort by sold descending
                const sorted = [...data].sort((a, b) => (b.sold || 0) - (a.sold || 0));
                // Chỉ lấy top 16 sản phẩm bán chạy nhất
                setAllProducts(sorted.slice(0, 16));
            }

            if (user) {
                const favs = await favoritesAPI.getAll(user.id);
                setFavorites(favs.map(p => p.id));
            }
        } catch (error) {
            console.error("Error loading best selling products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
            if (user) {
                await notificationsAPI.create(user.id, 'order', 'Đã thêm sản phẩm vào giỏ hàng');
            }
            addToast('Đã thêm sản phẩm vào giỏ hàng', 'success');
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi thêm vào giỏ hàng', 'error');
        }
    };

    const handleToggleFavorite = async (productId) => {
        if (!user) {
            if (window.confirm('Vui lòng đăng nhập để thêm yêu thích')) navigate('/login');
            return;
        }
        try {
            const isFav = await favoritesAPI.isFavorite(productId, user.id);
            if (isFav) {
                await favoritesAPI.removeFromFavorites(productId, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã xóa sản phẩm khỏi yêu thích');
                addToast('Đã xóa khỏi yêu thích', 'success');
            } else {
                await favoritesAPI.addToFavorites(productId, user.id);
                await notificationsAPI.create(user.id, 'system', 'Đã thêm sản phẩm vào yêu thích');
                addToast('Đã thêm vào yêu thích', 'success');
            }
            const newFavs = await favoritesAPI.getAll(user.id);
            setFavorites(newFavs.map(p => p.id));
        } catch (err) {
            console.error(err);
            addToast('Lỗi khi cập nhật yêu thích', 'error');
        }
    };

    // Calculate total pages
    const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="products-page best-selling-page">
            <div className="page-header">
                <h1>Sản phẩm bán chạy</h1>
            </div>

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <>
                    <div className="products-grid">
                        {displayProducts.map(product => {
                            const isFavorite = favorites.some(favId => String(favId) === String(product.id));
                            const discountPercent = product.originalPrice > product.price
                                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                                : 0;

                            return (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-container" onClick={() => navigate(`/products/${product.id}`)}>
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        {discountPercent > 0 && (
                                            <div className="discount-badge">-{discountPercent}%</div>
                                        )}
                                        {product.stock === 0 && <div className="out-of-stock">Hết hàng</div>}
                                        <button
                                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                                        >
                                            <FontAwesomeIcon icon={isFavorite ? icons.heart : icons.heartRegular} />
                                        </button>
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name" onClick={() => navigate(`/products/${product.id}`)}>{product.name}</h3>
                                        <div className="product-price-container">
                                            <span className="product-price new">{formatPrice(product.price)}</span>
                                            {discountPercent > 0 && (
                                                <span className="product-price old">{formatPrice(product.originalPrice)}</span>
                                            )}
                                        </div>
                                        <div className="product-meta">
                                            <span>Đã bán: {product.sold || 0}</span>
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
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default BestSellingPage;
