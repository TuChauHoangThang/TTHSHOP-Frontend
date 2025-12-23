import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { ordersAPI } from '../services/api';
import '../styles/CheckoutPage.css';

const paymentOptions = [
  {
    id: 'cod',
    title: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán trực tiếp cho nhân viên giao hàng khi nhận được sản phẩm.',
    badge: 'Phổ biến'
  },
  {
    id: 'bank_transfer',
    title: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản vào tài khoản ngân hàng của TTHSHOP để được xử lý nhanh hơn.',
    badge: 'Ưu tiên'
  }
];

const bankTransferInfo = {
  bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  accountName: 'CONG TY TNHH TTHSHOP',
  accountNumber: '0123 456 789',
  branch: 'CN TP. Hồ Chí Minh',
  note: 'Nội dung chuyển khoản: <Mã đơn> + <Số điện thoại>'
};

const initialFormState = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  note: ''
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartDetails, clearCart } = useCart();
  const { user } = useAuth();

  const [shippingInfo, setShippingInfo] = useState(initialFormState);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    setShippingInfo(prev => ({
      ...prev,
      fullName: user.name || prev.fullName,
      phone: user.phone || prev.phone,
      email: user.email || prev.email,
      address: user.address || prev.address
    }));
  }, [user]);

  const subtotal = useMemo(() => {
    return cartDetails.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartDetails]);

  const totalItems = useMemo(() => {
    return cartDetails.reduce((total, item) => total + item.quantity, 0);
  }, [cartDetails]);

  const shippingFee = subtotal === 0 || subtotal > 500000 ? 0 : 30000;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!shippingInfo.email.trim()) newErrors.email = 'Vui lòng nhập email';
    if (!shippingInfo.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ chi tiết';
    if (!shippingInfo.ward.trim()) newErrors.ward = 'Vui lòng nhập phường/xã';
    if (!shippingInfo.district.trim()) newErrors.district = 'Vui lòng nhập quận/huyện';
    if (!shippingInfo.city.trim()) newErrors.city = 'Vui lòng nhập tỉnh/thành phố';
    if (shippingInfo.phone && !/^(0|\+84)(\d{9,10})$/.test(shippingInfo.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (shippingInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setOrderError('');

    if (cartDetails.length === 0) {
      setOrderError('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const itemsPayload = cartDetails.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const itemsSnapshot = cartDetails.map(item => ({
        id: item.productId,
        name: item.product.name,
        image: item.product.image,
        quantity: item.quantity,
        price: item.product.price
      }));

      const shippingPayload = {
        fullName: shippingInfo.fullName.trim(),
        phone: shippingInfo.phone.trim(),
        email: shippingInfo.email.trim(),
        address: shippingInfo.address.trim(),
        ward: shippingInfo.ward.trim(),
        district: shippingInfo.district.trim(),
        city: shippingInfo.city.trim(),
        note: shippingInfo.note.trim()
      };

      const newOrder = await ordersAPI.create({
        userId: user?.id || null,
        items: itemsPayload,
        shippingAddress: shippingPayload,
        paymentMethod,
        clearCart: true
      });

      clearCart();
      setOrderSuccess({
        id: newOrder.id,
        paymentMethod,
        items: itemsSnapshot,
        totals: {
          subtotal,
          shippingFee,
          grandTotal
        },
        shippingAddress: shippingPayload,
        createdAt: newOrder.createdAt
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setOrderError(error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (cartDetails.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="empty-icon">🧺</div>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy quay lại trang sản phẩm để tiếp tục mua sắm.</p>
          <button className="btn-primary" onClick={handleContinueShopping}>
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div>
          <p className="step-label">Bước 2 / 2</p>
          <h1>Thanh Toán Đơn Hàng</h1>
          <p>Hoàn tất thông tin giao hàng và lựa chọn phương thức thanh toán.</p>
        </div>
        <div className="checkout-meta">
          <span>{totalItems} sản phẩm</span>
          <span>Giá trị đơn: {formatPrice(grandTotal)}</span>
        </div>
      </div>

      {orderError && (
        <div className="checkout-alert error">
          {orderError}
        </div>
      )}

      {orderSuccess && (
        <div className="order-success-card">
          <div className="order-success-icon">🎉</div>
          <h2>Đặt hàng thành công!</h2>
          <p>Mã đơn của bạn: <strong>#{orderSuccess.id}</strong></p>
          <p>Chúng tôi đã gửi thông tin đơn hàng tới email {orderSuccess.shippingAddress.email || 'của bạn'}.</p>
          {orderSuccess.paymentMethod === 'bank_transfer' ? (
            <p>
              Vui lòng chuyển khoản theo thông tin bên dưới và phản hồi lại để chúng tôi xử lý nhanh chóng.
            </p>
          ) : (
            <p>
              Đơn hàng sẽ được xác nhận và giao đến địa chỉ của bạn trong thời gian sớm nhất. Vui lòng chuẩn bị tiền mặt khi nhận hàng.
            </p>
          )}

          <div className="order-success-actions">
            <button className="btn-primary" onClick={handleContinueShopping}>
              Tiếp tục mua sắm
            </button>
            <button className="btn-secondary" onClick={handleBackToCart}>
              Xem giỏ hàng
            </button>
          </div>
        </div>
      )}

      <div className="checkout-grid">
        <div className="checkout-main">
          {!orderSuccess && (
            <form onSubmit={handleSubmit} className="checkout-form">
              <section className="checkout-card">
                <div className="card-header">
                  <h2>Thông tin giao hàng</h2>
                  <button type="button" className="link-button" onClick={handleBackToCart}>
                    Quay về giỏ hàng
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Nguyễn Văn A"
                    />
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 0901 234 567"
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="Email nhận thông báo"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ *</label>
                    <input
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && <span className="error-text">{errors.address}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phường/Xã *</label>
                    <input
                      name="ward"
                      value={shippingInfo.ward}
                      onChange={handleInputChange}
                      placeholder="Phường/Xã"
                    />
                    {errors.ward && <span className="error-text">{errors.ward}</span>}
                  </div>
                  <div className="form-group">
                    <label>Quận/Huyện *</label>
                    <input
                      name="district"
                      value={shippingInfo.district}
                      onChange={handleInputChange}
                      placeholder="Quận/Huyện"
                    />
                    {errors.district && <span className="error-text">{errors.district}</span>}
                  </div>
                  <div className="form-group">
                    <label>Tỉnh/Thành phố *</label>
                    <input
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="Tỉnh/Thành phố"
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                  </div>
                  <div className="form-group full">
                    <label>Ghi chú cho đơn hàng</label>
                    <textarea
                      name="note"
                      value={shippingInfo.note}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Giao giờ hành chính hoặc ghi chú khác..."
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-card">
                <h2>Phương thức thanh toán</h2>
                <div className="payment-options">
                  {paymentOptions.map(option => (
                    <label
                      key={option.id}
                      className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}
                    >
                      <div className="option-main">
                        <div className="option-header">
                          <div>
                            <span className="option-title">{option.title}</span>
                            {option.badge && <span className="option-badge">{option.badge}</span>}
                          </div>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={option.id}
                            checked={paymentMethod === option.id}
                            onChange={(event) => setPaymentMethod(event.target.value)}
                          />
                        </div>
                        <p className="option-description">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'bank_transfer' && (
                  <div className="payment-extra">
                    <h3>Thông tin chuyển khoản</h3>
                    <div className="bank-info-card">
                      <p><strong>Ngân hàng:</strong> {bankTransferInfo.bankName}</p>
                      <p><strong>Tên tài khoản:</strong> {bankTransferInfo.accountName}</p>
                      <p><strong>Số tài khoản:</strong> {bankTransferInfo.accountNumber}</p>
                      <p><strong>Chi nhánh:</strong> {bankTransferInfo.branch}</p>
                      <p><strong>Lưu ý:</strong> {bankTransferInfo.note}</p>
                    </div>
                    <div className="payment-tip">
                      💡 Vui lòng chuyển khoản đúng số tiền {formatPrice(grandTotal)} và giữ lại biên lai để đối chiếu khi cần.
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary submit-button" disabled={submitting}>
                  {submitting ? 'Đang xử lý...' : `Đặt hàng (${formatPrice(grandTotal)})`}
                </button>
              </section>
            </form>
          )}

          {orderSuccess && (
            <section className="checkout-card">
              <h2>Chi tiết đơn hàng #{orderSuccess.id}</h2>
              <div className="order-items-list">
                {orderSuccess.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="order-item-info">
                      <div className="order-item-name">{item.name}</div>
                      <div className="order-item-meta">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary-totals">
                <div>
                  <span>Tạm tính</span>
                  <strong>{formatPrice(orderSuccess.totals.subtotal)}</strong>
                </div>
                <div>
                  <span>Phí vận chuyển</span>
                  <strong>{orderSuccess.totals.shippingFee === 0 ? 'Miễn phí' : formatPrice(orderSuccess.totals.shippingFee)}</strong>
                </div>
                <div className="total-line">
                  <span>Tổng cộng</span>
                  <strong>{formatPrice(orderSuccess.totals.grandTotal)}</strong>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="checkout-summary">
          <div className="checkout-card sticky">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-items">
              {(orderSuccess ? orderSuccess.items : cartDetails).map(item => (
                <div key={item.id || item.productId} className="summary-item">
                  <div className="summary-item-thumb">
                    <img src={item.image || item.product.image} alt={item.name || item.product.name} />
                  </div>
                  <div className="summary-item-info">
                    <p>{item.name || item.product.name}</p>
                    <span>Số lượng: {item.quantity}</span>
                  </div>
                  <div className="summary-item-price">
                    {formatPrice((item.price || item.product.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>{formatPrice(orderSuccess ? orderSuccess.totals.subtotal : subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <strong className={shippingFee === 0 ? 'free' : ''}>
                {formatPrice(orderSuccess ? orderSuccess.totals.shippingFee : shippingFee)}
              </strong>
            </div>
            {subtotal < 500000 && !orderSuccess && (
              <div className="shipping-note">
                Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí vận chuyển
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(orderSuccess ? orderSuccess.totals.grandTotal : grandTotal)}</strong>
            </div>
            <p className="vat-note">Đã bao gồm VAT nếu có</p>
          </div>

          <div className="checkout-card info-card">
            <h3>Cam kết giao hàng</h3>
            <ul>
              <li>✓ Kiểm tra sản phẩm trước khi thanh toán</li>
              <li>✓ Đổi trả miễn phí trong 7 ngày</li>
              <li>✓ Hỗ trợ khách hàng 24/7</li>
              <li>✓ Đảm bảo hàng handmade chất lượng cao</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;

