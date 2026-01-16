import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartPage } from '../hooks/useCartPage';
import { formatPrice } from '../utils/formatPrice';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/CartPage.css';

const getItemKey = (productId, options) => {
  return `${productId}-${JSON.stringify(options || {})}`;
};

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartDetails,
    selectedItems,
    updatingId,
    subtotal,
    shipping,
    toggleSelectProduct,
    toggleSelectAll,
    handleSmartRemove,
    handleQuantityChange,
    removeFromCart,
    // Voucher props
    ownedVouchers,
    selectedVoucher,
    setSelectedVoucher,
    showVoucherModal,
    setShowVoucherModal,
    discountAmount,
    grandTotal
  } = useCartPage();

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
              const itemKey = getItemKey(item.productId, item.options);
              const isSelected = selectedItems.includes(itemKey);
              return (
                <div key={itemKey} className={`cart-item ${isSelected ? 'selected' : ''}`}>
                  <div className="cart-item-checkbox">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectProduct(item.productId, item.options)}
                    />
                  </div>
                  <div className="cart-item-image">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="cart-item-main">
                    <div className="cart-item-info">
                      <h3>{item.product.name}</h3>
                      {/* Display Options */}
                      <div className="cart-item-options" style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        {item.options?.color && <span style={{ marginRight: '10px' }}>Màu: <strong>{item.options.color}</strong></span>}
                        {item.options?.type && <span>Loại: <strong>{item.options.type}</strong></span>}
                      </div>
                      <span className="cart-item-price-unit" style={{ display: 'block', marginTop: '4px' }}>Đơn giá: {formatPrice(item.product.finalPrice || item.product.price)}</span>
                    </div>
                    <div className="cart-item-controls">
                      <div className="control-left-group">
                        <div className="cart-quantity-selector">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1, item.options)}
                            disabled={updatingId === itemKey}
                          >
                            <FontAwesomeIcon icon={icons.minus} />
                          </button>
                          <input type="number" value={item.quantity} readOnly className="quantity-input" />
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1, item.options)}
                            disabled={item.quantity >= item.product.stock || updatingId === itemKey}
                          >
                            <FontAwesomeIcon icon={icons.plus} />
                          </button>
                        </div>
                        <div className="cart-item-total">
                          <span className="item-total-price">{formatPrice((item.product.finalPrice || item.product.price) * item.quantity)}</span>
                        </div>
                      </div>
                      <button className="btn-remove-item-small" onClick={() => { if (window.confirm('Xóa sản phẩm này?')) removeFromCart(item.productId, item.options) }}>
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

            {/* Voucher Section */}
            <div className="cart-voucher-section" style={{ margin: '15px 0', padding: '10px', border: '1px dashed #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎫 Mã giảm giá</span>
                <button
                  className="btn-link"
                  onClick={() => setShowVoucherModal(true)}
                  style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'none' }}
                >
                  {selectedVoucher ? 'Đổi mã' : 'Chọn mã'}
                </button>
              </div>
              {selectedVoucher && (
                <div style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--success)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedVoucher.code}</span>
                  <span onClick={() => setSelectedVoucher(null)} style={{ cursor: 'pointer', color: '#666' }}>✕</span>
                </div>
              )}
            </div>

            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)' }}>
                <span>Giảm giá:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row total-row">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatPrice(grandTotal)}</span>
            </div>
            <button
              className="btn-checkout"
              disabled={selectedItems.length === 0}
              onClick={() => {
                const itemsToCheckout = cartDetails.filter(item =>
                  selectedItems.includes(getItemKey(item.productId, item.options))
                );
                navigate('/checkout', {
                  state: {
                    appliedVoucherCode: selectedVoucher?.code,
                    items: itemsToCheckout
                  }
                });
              }}
            >
              Thanh Toán ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Modal - Simple Implementation */}
      {showVoucherModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setShowVoucherModal(false)}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3>Chọn Voucher</h3>
            <div style={{ marginTop: '15px' }}>
              {ownedVouchers.length > 0 ? ownedVouchers.map(v => (
                <div key={v.id} style={{
                  padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px',
                  opacity: subtotal < v.minOrderValue ? 0.6 : 1,
                  background: selectedVoucher?.id === v.id ? '#f0f9ff' : 'white',
                  borderColor: selectedVoucher?.id === v.id ? 'var(--primary)' : '#eee'
                }} onClick={() => {
                  if (subtotal >= v.minOrderValue) {
                    setSelectedVoucher(v);
                    setShowVoucherModal(false);
                  }
                }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{v.code}</div>
                  <div style={{ fontSize: '0.85rem' }}>{v.description}</div>
                  {subtotal < v.minOrderValue && <div style={{ fontSize: '0.75rem', color: 'red' }}>Đơn tối thiểu {formatPrice(v.minOrderValue)}</div>}
                </div>
              )) : <p>Bạn chưa có mã giảm giá nào.</p>}
            </div>
            <button style={{ marginTop: '10px', width: '100%', padding: '8px' }} onClick={() => setShowVoucherModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;