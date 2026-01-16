import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, favoritesAPI, notificationsAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Pagination from '../components/Pagination';

const FlashSalePage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [allSaleProducts, setAllSaleProducts] = useState([]);
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        loadData();
    }, [user]);

    // Handle pagination on filtered list
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayProducts(allSaleProducts.slice(startIndex, endIndex));
        window.scrollTo(0, 0); // Scroll to top when page changes
    }, [currentPage, allSaleProducts]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch tất cả sản phẩm
            // Vì logic sale nằm ở server.js custom render, nó sẽ tự động thêm isFlashSale vào response data
            // Nếu data trả về là array
            const data = await productsAPI.getAll();

            if (data && Array.isArray(data)) {
                // Filter client side: chỉ lấy những sản phẩm có isFlashSale hoặc đang giảm giá
                // isFlashSale là flag do logic random tạo ra.
                // originalPrice > price là logic giảm giá tĩnh trong DB (cũ).
                // Ta ưu tiên hiển thị cả 2, nhưng sort theo discountPercent cao nhất
                const saleItems = data.filter(p => p.isFlashSale === true || (p.originalPrice && p.originalPrice > p.price));

                // Sort by biggest discount
                saleItems.sort((a, b) => {
                    const discountA = a.discountPercent || (a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice * 100) : 0);
                    const discountB = b.discountPercent || (b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice * 100) : 0);
                    return discountB - discountA;
                });

                // Chỉ lấy top 28 sản phẩm sale tốt nhất
                setAllSaleProducts(saleItems.slice(0, 28));
                // Trigger useEffect pagination
            }

            if (user) {
                const favs = await favoritesAPI.getAll(user.id);
                setFavorites(favs.map(p => p.id));
            }
        } catch (error) {
            console.error("Error loading flash sale products:", error);
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

    const totalPages = Math.ceil(allSaleProducts.length / ITEMS_PER_PAGE);
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="products-page flash-sale-page">
            <div className="page-header">
                <h1>🔥 Săn Sale Giá Sốc 🔥</h1>
                <p>Cập nhật mỗi giờ - Nhanh tay kẻo lỡ!</p>
            </div>

            {loading ? (
                <div className="loading">Đang tải deal hot...</div>
            ) : (
                <>
                    {allSaleProducts.length === 0 ? (
                        <div className="no-products">
                            <h3>Hiện chưa có deal hot nào trong giờ này. Quay lại sau nhé!</h3>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {displayProducts.map(product => {
                                const isFavorite = favorites.some(favId => String(favId) === String(product.id));
                                const discountPercent = product.discountPercent ||
                                    (product.originalPrice > product.price
                                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                                        : 0);

                                return (
                                    <div key={product.id} className="product-card">
                                        <div className="product-image-container" onClick={() => navigate(`/products/${product.id}`)}>
                                            <img src={product.image} alt={product.name} className="product-image" />
                                            {discountPercent > 0 && (
                                                <div className="discount-badge">-{Math.round(discountPercent)}%</div>
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
                                            {product.isFlashSale && <div className="flash-sale-timer">⚡ Kết thúc sau 1h</div>}

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
                    )}

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

export default FlashSalePage;
