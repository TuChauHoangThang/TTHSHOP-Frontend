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
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');

    // --- PHẦN THÊM MỚI 1: State cho Modal và danh sách ---
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [allVouchers, setAllVouchers] = useState([]);

    useEffect(() => {
        // Lấy danh sách tất cả voucher để hiển thị trong Modal
        const fetchAllVouchers = async () => {
            try {
                const response = await fetch('http://localhost:3001/vouchers');
                if (response.ok) {
                    const data = await response.json();
                    setAllVouchers(data);
                }
            } catch (err) { console.error(err); }
        };
        fetchAllVouchers();
    }, []);

    const handleSelectFromModal = (code) => {
        setVoucherCode(code);
        setIsVoucherModalOpen(false);
        // Sau khi chọn xong bạn có thể để người dùng tự nhấn "Áp dụng"
        // hoặc tự gọi handleApplyVoucher(code) ở đây.
    };
    // --- KẾT THÚC PHẦN THÊM MỚI 1 ---

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

    const discountAmount = useMemo(() => {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.discountType === 'fixed') {
            return appliedVoucher.discountValue;
        }
        if (appliedVoucher.discountType === 'percentage') {
            return (subtotal * appliedVoucher.discountValue) / 100;
        }
        if (appliedVoucher.discountType === 'shipping') {
            return Math.min(shippingFee, appliedVoucher.discountValue);
        }
        return 0;
    }, [appliedVoucher, subtotal, shippingFee]);

    const grandTotal = subtotal + shippingFee - discountAmount;

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherError('');
        try {
            const response = await fetch('http://localhost:3001/vouchers');
            if (!response.ok) throw new Error('Network response was not ok');
            const vouchers = await response.json();
            const found = vouchers.find(v => v.code.trim().toUpperCase() === voucherCode.trim().toUpperCase());
            if (!found) {
                setVoucherError('Mã giảm giá không tồn tại.');
                setAppliedVoucher(null);
                return;
            }
            if (subtotal < found.minOrderValue) {
                setVoucherError(`Đơn hàng tối thiểu ${formatPrice(found.minOrderValue)} để áp dụng mã này.`);
                setAppliedVoucher(null);
                return;
            }
            setAppliedVoucher(found);
            setVoucherCode('');
        } catch (err) {
            setVoucherError('Lỗi kết nối server.');
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
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
            setOrderError('Giỏ hàng trống.');
            return;
        }
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitting(true);
        try {

            const itemsPayload = cartDetails.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                options: item.options
            }));
            const itemsSnapshot = cartDetails.map(item => ({
                id: item.productId,
                name: item.product.name,
                image: item.product.image,
                quantity: item.quantity,
                price: item.product.price,
                options: item.options
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
                voucherId: appliedVoucher?.id || null,
                discountAmount: discountAmount,
                clearCart: true
            });
            clearCart();
            setOrderSuccess({
                id: newOrder.id,
                paymentMethod,
                items: itemsSnapshot,
                totals: { subtotal, shippingFee, discountAmount, grandTotal },
                shippingAddress: shippingPayload,
                createdAt: newOrder.createdAt
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setOrderError(error.message || 'Lỗi tạo đơn.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToCart = () => navigate('/cart');
    const handleContinueShopping = () => navigate('/products');

    if (cartDetails.length === 0 && !orderSuccess) {
        return (
            <div className="checkout-page">
                <div className="checkout-empty">
                    <div className="empty-icon">🧺</div>
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <button className="btn-primary" onClick={handleContinueShopping}>Khám phá sản phẩm</button>
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
                </div>
                <div className="checkout-meta">
                    <span>{totalItems} sản phẩm </span>
                    <span>Giá trị đơn: {formatPrice(grandTotal)}</span>
                </div>
            </div>

            {orderError && <div className="checkout-alert error">{orderError}</div>}

            {orderSuccess && (
                <div className="order-success-card">
                    <div className="order-success-icon">🎉</div>
                    <h2>Đặt hàng thành công!</h2>
                    <p>Mã đơn: <strong>#{orderSuccess.id}</strong></p>
                    <div className="order-success-actions">
                        <button className="btn-primary" onClick={handleContinueShopping}>Tiếp tục mua sắm</button>
                        <button className="btn-secondary" onClick={() => navigate('/cart')}>Về giỏ hàng</button>
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
                                    <button type="button" className="link-button" onClick={handleBackToCart}>Quay về giỏ hàng</button>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Họ và tên *</label>
                                        <input name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} />
                                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Số điện thoại *</label>
                                        <input name="phone" value={shippingInfo.phone} onChange={handleInputChange} />
                                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input name="email" value={shippingInfo.email} onChange={handleInputChange} />
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ *</label>
                                        <input name="address" value={shippingInfo.address} onChange={handleInputChange} />
                                        {errors.address && <span className="error-text">{errors.address}</span>}
                                    </div>
                                    <div className="form-group"><label>Phường/Xã *</label><input name="ward" value={shippingInfo.ward} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Quận/Huyện *</label><input name="district" value={shippingInfo.district} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Tỉnh/Thành phố *</label><input name="city" value={shippingInfo.city} onChange={handleInputChange} /></div>
                                    <div className="form-group full"><label>Ghi chú</label><textarea name="note" value={shippingInfo.note} onChange={handleInputChange} rows={3} /></div>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <h2>Phương thức thanh toán</h2>
                                <div className="payment-options">
                                    {paymentOptions.map(option => (
                                        <label key={option.id} className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}>
                                            <div className="option-main">
                                                <div className="option-header">
                                                    <div><span className="option-title">{option.title}</span></div>
                                                    <input type="radio" name="paymentMethod" value={option.id} checked={paymentMethod === option.id} onChange={(e) => setPaymentMethod(e.target.value)} />
                                                </div>
                                                <p className="option-description">{option.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <button type="submit" className="btn-primary submit-button" disabled={submitting}>Đặt hàng ({formatPrice(grandTotal)})</button>
                            </section>
                        </form>
                    )}

                    {orderSuccess && (
                        <section className="checkout-card">
                            <h2>Chi tiết đơn hàng #{orderSuccess.id}</h2>
                            <div className="order-items-list">
                                {orderSuccess.items.map(item => (
                                    <div key={item.id} className="order-item">
                                        <div className="order-item-image"><img src={item.image} alt={item.name} /></div>
                                        <div className="order-item-info">
                                            <div className="order-item-name">{item.name}</div>
                                            {item.options && (
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {item.options.color && <span>Màu: {item.options.color} </span>}
                                                    {item.options.type && <span>| Loại: {item.options.type}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="order-item-price">{formatPrice(item.price * item.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="checkout-summary">
                    <div className="checkout-card sticky">
                        <h2>Tóm tắt đơn hàng</h2>

                        {/* --- PHẦN VOUCHER CỦA BẠN (ĐÃ THÊM NÚT CHỌN MÃ) --- */}
                        {!orderSuccess && (
                            <div className="voucher-section-new">
                                <div className="voucher-header">
                                    <label>Mã giảm giá</label>
                                    <button
                                        type="button"
                                        className="link-button"
                                        onClick={() => setIsVoucherModalOpen(true)}
                                    >
                                        Chọn mã có sẵn
                                    </button>
                                </div>
                                <div className="voucher-input-row">
                                    <input
                                        type="text"
                                        placeholder="Mã giảm giá..."
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        className="voucher-input-field"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyVoucher}
                                        className="voucher-apply-square-btn"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                                {voucherError && <p className="voucher-error-msg">{voucherError}</p>}
                                {appliedVoucher && (
                                    <div className="voucher-applied-tag-new">
                                        <span>Mã: <strong>{appliedVoucher.code}</strong></span>
                                        <button
                                            type="button"
                                            onClick={() => setAppliedVoucher(null)}
                                            style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="summary-items">
                            {(orderSuccess ? orderSuccess.items : cartDetails).map(item => (
                                <div key={item.id || item.productId} className="summary-item">
                                    <div className="summary-item-thumb"><img src={item.image || item.product.image} alt={item.name} /></div>
                                    <div className="summary-item-info">
                                        <p>{item.name}</p>
                                        {item.options && (
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {item.options.color && <span>Màu: {item.options.color} </span>}
                                                {item.options.type && <span>| Loại: {item.options.type}</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="summary-item-price">{formatPrice((item.price || item.product.price) * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-row"><span>Tạm tính</span><strong>{formatPrice(orderSuccess ? orderSuccess.totals.subtotal : subtotal)}</strong></div>

                        {(orderSuccess ? orderSuccess.totals.discountAmount : discountAmount) > 0 && (
                            <div className="summary-row discount-row">
                                <span>Giảm giá</span>
                                <strong>-{formatPrice(orderSuccess ? orderSuccess.totals.discountAmount : discountAmount)}</strong>
                            </div>
                        )}

                        <div className="summary-row"><span>Phí ship</span><strong>{formatPrice(orderSuccess ? orderSuccess.totals.shippingFee : shippingFee)}</strong></div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total"><span>Tổng cộng</span><strong>{formatPrice(orderSuccess ? orderSuccess.totals.grandTotal : grandTotal)}</strong></div>
                    </div>
                </aside>
            </div>

            {/* --- PHẦN THÊM MỚI 2: Modal Danh sách Voucher --- */}
            {isVoucherModalOpen && (
                <div className="v-modal-overlay" onClick={() => setIsVoucherModalOpen(false)}>
                    <div className="v-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>Chọn Mã Giảm Giá</h3>
                            <button className="v-close-btn" onClick={() => setIsVoucherModalOpen(false)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="v-modal-body">
                            {allVouchers.length > 0 ? allVouchers.map(v => (
                                <div key={v.id} className={`v-item ${subtotal < v.minOrderValue ? 'v-disabled' : ''}`}>
                                    <div className="v-info">
                                        <span className="v-code">{v.code}</span>
                                        <p className="v-desc">{v.description}</p>
                                        {subtotal < v.minOrderValue && (
                                            <p className="v-condition">
                                                Mua thêm {formatPrice(v.minOrderValue - subtotal)} để dùng mã này
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        className="v-select-btn"
                                        disabled={subtotal < v.minOrderValue}
                                        onClick={() => handleSelectFromModal(v.code)}
                                    >
                                        Chọn
                                    </button>
                                </div>
                            )) : <p>Không có mã nào khả dụng.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;