import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartDetails, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice,
    getTotalItems 
  } = useCart();

  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      return;
    }

    setRemoving(productId);
    try {
      await removeFromCart(productId);
    } catch (error) {
      alert(error.message);
    } finally {
      setRemoving(null);
    }
  };

  const handleClearCart = () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      return;
    }
    clearCart();
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 500000 ? 0 : 30000; // Miễn phí ship trên 500k
  const total = subtotal + shipping;

  if (cartDetails.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ Hàng Của Bạn</h1>
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <FontAwesomeIcon icon={icons.cart} />
          </div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
          <button 
            className="btn-continue-shopping"
            onClick={handleContinueShopping}
          >
            <FontAwesomeIcon icon={icons.products} /> Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Giỏ Hàng Của Bạn</h1>
        <p className="cart-items-count">
          {getTotalItems()} {getTotalItems() === 1 ? 'sản phẩm' : 'sản phẩm'}
        </p>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items-header">
            <h2>Sản Phẩm</h2>
            <button 
              className="btn-clear-cart"
              onClick={handleClearCart}
            >
              <FontAwesomeIcon icon={icons.trash} /> Xóa Tất Cả
            </button>
          </div>

          <div className="cart-items-list">
            {cartDetails.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              const isUpdating = updating === item.productId;
              const isRemoving = removing === item.productId;

              return (
                <div 
                  key={item.productId} 
                  className={`cart-item ${isRemoving ? 'removing' : ''}`}
                >
                  <div className="cart-item-image">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      onClick={() => navigate(`/products/${item.productId}`)}
                    />
                  </div>

                  <div className="cart-item-main">
                    <div className="cart-item-info">
                      <h3 
                        className="cart-item-name"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.product.name}
                      </h3>
                      <div className="cart-item-meta">
                        <span className="cart-item-category">{item.product.category}</span>
                      <div className="cart-item-rating">
                        <span className="stars">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon 
                              key={i} 
                              icon={icons.star} 
                              className={i < Math.floor(item.product.rating) ? 'star-filled' : 'star-empty'} 
                            />
                          ))}
                        </span>
                        <span className="rating-value">({item.product.rating})</span>
                      </div>
                      </div>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price-label">Đơn giá:</span>
                        <span className="cart-item-price">
                          {formatPrice(item.product.price)}
                        </span>
                      </div>
                      {item.product.stock < item.quantity && (
                        <div className="stock-warning">
                          ⚠️ Chỉ còn {item.product.stock} sản phẩm trong kho
                        </div>
                      )}
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-section">
                        <span className="quantity-label">Số lượng:</span>
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <FontAwesomeIcon icon={icons.minus} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              handleQuantityChange(item.productId, newQty);
                            }}
                            className="quantity-input"
                            disabled={isUpdating}
                          />
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || isUpdating}
                          >
                            <FontAwesomeIcon icon={icons.plus} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-total">
                        <span className="item-total-label">Thành tiền:</span>
                        <span className="item-total-price">
                          {formatPrice(itemTotal)}
                        </span>
                      </div>

                      <button
                        className="btn-remove-item"
                        onClick={() => handleRemove(item.productId)}
                        disabled={isRemoving}
                        title="Xóa sản phẩm"
                      >
                        {isRemoving ? (
                          <>
                            <FontAwesomeIcon icon={icons.clock} spin /> Đang xóa...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={icons.trash} /> Xóa
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary-card">
            <h2>Tóm Tắt Đơn Hàng</h2>
            
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span className="summary-value">{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className={`summary-value ${shipping === 0 ? 'free-shipping' : ''}`}>
                {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
              </span>
            </div>

            {subtotal < 500000 && (
              <div className="shipping-note">
                Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển!
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Tổng cộng:</span>
              <span className="summary-value total-price">{formatPrice(total)}</span>
            </div>

            <button
              className="btn-checkout"
              onClick={handleCheckout}
            >
              <FontAwesomeIcon icon={icons.creditCard} /> Thanh Toán
            </button>

            <button
              className="btn-continue-shopping-secondary"
              onClick={handleContinueShopping}
            >
              <FontAwesomeIcon icon={icons.products} /> Tiếp Tục Mua Sắm
            </button>
          </div>

          <div className="cart-benefits">
            <h3><FontAwesomeIcon icon={icons.gift} /> Lợi Ích Khi Mua Sắm</h3>
            <ul>
              <li><FontAwesomeIcon icon={icons.truck} /> Miễn phí vận chuyển cho đơn hàng trên 500.000đ</li>
              <li><FontAwesomeIcon icon={icons.gift} /> Sản phẩm handmade chất lượng cao</li>
              <li><FontAwesomeIcon icon={icons.undo} /> Đổi trả trong vòng 7 ngày</li>
              <li><FontAwesomeIcon icon={icons.headset} /> Hỗ trợ khách hàng 24/7</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
