import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartActions } from '../hooks/useCartActions'; // Import hook mới
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartDetails,
    selectedItems,
    updatingId,
    subtotal,
    shipping,
    total,
    toggleSelectProduct,
    toggleSelectAll,
    handleSmartRemove,
    handleQuantityChange,
    removeFromCart
  } = useCartActions();

  if (cartDetails.length === 0) {
    return (
        <div className="cart-page">
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <FontAwesomeIcon icon={icons.cart} style={{ fontSize: '3rem', color: '#eee', marginBottom: '20px' }} />
            <h2>Giỏ hàng của bạn đang trống</h2>
            <button className="btn-checkout" onClick={() => navigate('/products')} style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}>
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Giỏ Hàng Của Bạn</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bạn đang có {cartDetails.length} sản phẩm trong danh sách</p>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <div className="select-all-area">
                <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={selectedItems.length === cartDetails.length}
                    onChange={toggleSelectAll}
                />
                <span>Chọn tất cả ({cartDetails.length})</span>
              </div>
              <button
                  className={`btn-smart-remove ${selectedItems.length > 0 ? 'has-selected' : ''}`}
                  onClick={handleSmartRemove}
              >
                <FontAwesomeIcon icon={icons.trash} />
                {selectedItems.length > 0 ? `Xóa đã chọn (${selectedItems.length})` : 'Xóa tất cả'}
              </button>
            </div>

            <div className="cart-items-list">
              {cartDetails.map((item) => {
                const isSelected = selectedItems.includes(item.productId);
                return (
                    <div key={item.productId} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                      <div className="cart-item-checkbox">
                        <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(item.productId)}
                        />
                      </div>
                      <div className="cart-item-image">
                        <img src={item.product.image} alt={item.product.name} />
                      </div>
                      <div className="cart-item-main">
                        <div className="cart-item-info">
                          <h3>{item.product.name}</h3>
                          <span className="cart-item-price-unit">Đơn giá: {formatPrice(item.product.price)}</span>
                        </div>
                        <div className="cart-item-controls">
                          <div className="control-left-group">
                            <div className="quantity-control">
                              <button
                                  className="quantity-btn"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updatingId === item.productId}
                              >-</button>
                              <input type="number" value={item.quantity} readOnly className="quantity-input" />
                              <button
                                  className="quantity-btn"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || updatingId === item.productId}
                              >+</button>
                            </div>
                            <div className="cart-item-total">
                              <span className="item-total-price">{formatPrice(item.product.price * item.quantity)}</span>
                            </div>
                          </div>
                          <button className="btn-remove-item-small" onClick={() => { if(window.confirm('Xóa sản phẩm này?')) removeFromCart(item.productId) }}>
                            <FontAwesomeIcon icon={icons.trash} />
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
              <h2 style={{ marginBottom: '20px' }}>Tóm Tắt Đơn Hàng</h2>
              <div className="summary-row"><span>Đã chọn:</span><span>{selectedItems.length} sản phẩm</span></div>
              <div className="summary-row"><span>Tạm tính:</span><span>{formatPrice(subtotal)}</span></div>
              <div className="summary-row"><span>Phí vận chuyển:</span><span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span></div>
              <div className="summary-row total-row">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatPrice(total)}</span>
              </div>
              <button className="btn-checkout" disabled={selectedItems.length === 0} onClick={() => navigate('/checkout')}>
                Thanh Toán ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CartPage;