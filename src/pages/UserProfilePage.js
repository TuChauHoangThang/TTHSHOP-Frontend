import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/UserProfilePage.css';

const API_URL =
    process.env.REACT_APP_API_URL || 'https://tthshop-backend-6ihw.onrender.com';

const UserProfilePage = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [voucherCurrentPage, setVoucherCurrentPage] = useState(1);
    const ordersPerPage = 4;
    const vouchersPerPage = 4;

    const [userData, setUserData] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [orders, setOrders] = useState([]);

    // Avatar upload
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Notifications
    const [notifications, setNotifications] = useState([]);
    const [notificationSettings, setNotificationSettings] = useState({
        orderUpdates: true,
        promotions: true,
        systemNews: true,
        emailNotifications: true
    });

    // Vouchers
    const [vouchers, setVouchers] = useState([]);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);

    // Toast notification
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (!user) return;
        const userId = user.id;

        Promise.all([
            fetch(`${API_URL}/users/${userId}`).then(r => r.json()),
            fetch(`${API_URL}/orders?userId=${userId}`).then(r => r.json()),
            // Mock data for notifications
            Promise.resolve([
                { id: 1, type: 'order', message: 'Đơn hàng #123 đã được giao thành công', time: '2 giờ trước', read: false },
                { id: 2, type: 'promotion', message: 'Giảm giá 50% cho đơn hàng tiếp theo', time: '1 ngày trước', read: false },
                { id: 3, type: 'system', message: 'Cập nhật điều khoản sử dụng', time: '3 ngày trước', read: true }
            ]),
            // Fetch vouchers from API
            fetch(`${API_URL}/userVouchers?userId=${userId}`).then(r => r.json()),
            Promise.resolve(1250) // loyalty points
        ])
            .then(([u, o, n, v, points]) => {
                const sortedOrders = [...o].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                const sortedVouchers = [...v].sort(
                    (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
                );
                setUserData(u);
                setTempData(u);
                setOrders(sortedOrders);
                setNotifications(n);
                setVouchers(sortedVouchers);
                setLoyaltyPoints(points);

                // Load notification settings from user data
                if (u.notificationSettings) {
                    setNotificationSettings(u.notificationSettings);
                }
            })
            .finally(() => setLoading(false));
    }, [user]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            showToast('Vui lòng chọn file ảnh', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
            return;
        }

        setUploadingAvatar(true);

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Simulate upload to server (replace with actual upload logic)
        setTimeout(async () => {
            const avatarUrl = URL.createObjectURL(file);

            const updatedUser = {
                ...userData,
                avatar: avatarUrl
            };

            await fetch(`${API_URL}/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            setUserData(updatedUser);
            setTempData(updatedUser);
            setUploadingAvatar(false);
            showToast('Cập nhật ảnh đại diện thành công!');
        }, 1500);
    };

    const handleSave = async () => {
        setLoading(true);
        await fetch(`${API_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempData)
        });
        setUserData(tempData);
        setIsEditing(false);
        setLoading(false);
        showToast('Lưu thông tin thành công!');
    };

    const handleChangePassword = async () => {
        setPasswordMessage('');

        if (passwordData.currentPassword !== userData.password) {
            setPasswordMessage('❌ Mật khẩu hiện tại không đúng');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage('❌ Mật khẩu mới tối thiểu 6 ký tự');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage('❌ Mật khẩu xác nhận không khớp');
            return;
        }

        const updatedUser = {
            ...userData,
            password: passwordData.newPassword
        };

        await fetch(`${API_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });

        setUserData(updatedUser);
        setPasswordMessage('✅ Đổi mật khẩu thành công – vui lòng đăng nhập lại');
        setShowPasswordModal(false);
        showToast('Đổi mật khẩu thành công!');

        setTimeout(() => {
            logout();
        }, 1500);
    };

    const handleNotificationSettingsChange = async (key) => {
        const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
        setNotificationSettings(updated);

        await fetch(`${API_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, notificationSettings: updated })
        });

        showToast('Cập nhật cài đặt thông báo thành công!');
    };

    const markNotificationAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    if (!user) return <div className="error">Bạn chưa đăng nhập</div>;
    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-page">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            <div className="profile-card">

                <div className="profile-header">
                    <div className="avatar">
                        {uploadingAvatar && (
                            <div className="avatar-loading">
                                <div className="spinner"></div>
                            </div>
                        )}
                        {avatarPreview || userData.avatar
                            ? <img src={avatarPreview || userData.avatar} alt="avatar" />
                            : <FontAwesomeIcon icon={icons.user} size="3x" />}
                        <label className="camera">
                            <FontAwesomeIcon icon={icons.edit} />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploadingAvatar}
                            />
                        </label>
                    </div>

                    <div className="info">
                        <h1>{userData.name}</h1>
                        <p><FontAwesomeIcon icon={icons.email} /> {userData.email}</p>
                        <span className="role">{userData.role}</span>
                        <div className="loyalty-badge">
                            🏆 {loyaltyPoints} điểm tích lũy
                        </div>
                    </div>

                    {!isEditing ? (
                        <button className="btn edit" onClick={() => setIsEditing(true)}>
                            <FontAwesomeIcon icon={icons.edit} /> Chỉnh sửa
                        </button>
                    ) : (
                        <div className="actions">
                            <button className="btn save" onClick={handleSave}>
                                <FontAwesomeIcon icon={icons.check} /> Lưu
                            </button>
                            <button className="btn cancel" onClick={() => {
                                setIsEditing(false);
                                setTempData(userData);
                            }}>
                                <FontAwesomeIcon icon={icons.times} /> Hủy
                            </button>
                        </div>
                    )}
                </div>

                <div className="tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <FontAwesomeIcon icon={icons.user} /> Cá nhân
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        <FontAwesomeIcon icon={icons.shoppingBag} /> Đơn hàng
                    </button>
                    <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                        <FontAwesomeIcon icon={icons.bell} /> Thông báo
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                        )}
                    </button>
                    <button className={activeTab === 'vouchers' ? 'active' : ''} onClick={() => setActiveTab('vouchers')}>
                        <FontAwesomeIcon icon={icons.ticket} /> Voucher
                    </button>
                    <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                        <FontAwesomeIcon icon={icons.shield} /> Bảo mật
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <label>Tên</label>
                        <input
                            disabled={!isEditing}
                            value={isEditing ? tempData.name : userData.name}
                            onChange={e => setTempData({ ...tempData, name: e.target.value })}
                        />

                        <label>Số điện thoại</label>
                        <input
                            disabled={!isEditing}
                            value={isEditing ? tempData.phone || '' : userData.phone || ''}
                            onChange={e => setTempData({ ...tempData, phone: e.target.value })}
                        />

                        <label>Địa chỉ</label>
                        <input
                            disabled={!isEditing}
                            value={isEditing ? tempData.address || '' : userData.address || ''}
                            onChange={e => setTempData({ ...tempData, address: e.target.value })}
                        />

                        <label>Ngôn ngữ</label>
                        <select disabled={!isEditing} value={tempData?.language || 'vi'} onChange={e => setTempData({ ...tempData, language: e.target.value })}>
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="tab-content orders">
                        {orders.length === 0 ? (
                            <p>Chưa có đơn hàng</p>
                        ) : (
                            <>
                                {orders
                                    .slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)
                                    .map(order => {
                                        const isOpen = expandedOrderId === order.id;

                                        return (
                                            <div key={order.id} className="order-card compact">

                                                <div
                                                    className="order-compact-header"
                                                    onClick={() =>
                                                        setExpandedOrderId(isOpen ? null : order.id)
                                                    }
                                                >
                                                    <div>
                                                        <strong>Đơn #{order.id}</strong>
                                                        <span className="order-date">
                                                            {new Date(order.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="order-right">
                                                        <span className={`status ${order.status}`}>
                                                            {order.status}
                                                        </span>

                                                        <span className="total">
                                                            {order.totals.grandTotal.toLocaleString()} đ
                                                        </span>

                                                        <span className="toggle">
                                                            {isOpen ? '▲' : '▼'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div className="order-details">

                                                        {order.items.map(item => (
                                                            <div key={item.productId} className="order-item">
                                                                <img
                                                                    src={item.productImage}
                                                                    alt={item.productName}
                                                                />

                                                                <div className="item-info">
                                                                    <h4>{item.productName}</h4>
                                                                    <p>Số lượng: {item.quantity}</p>
                                                                    <p>Giá: {item.price.toLocaleString()} đ</p>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div className="order-footer">
                                                            <div>
                                                                <strong>Giao tới:</strong>
                                                                <p>{order.shippingAddress.fullName}</p>
                                                                <p>{order.shippingAddress.phone}</p>
                                                                <p>{order.shippingAddress.address}</p>
                                                            </div>

                                                            <div className="summary">
                                                                <p>
                                                                    Tạm tính: {order.totals.subtotal.toLocaleString()} đ
                                                                </p>
                                                                <p>
                                                                    Phí ship: {order.totals.shippingFee.toLocaleString()} đ
                                                                </p>
                                                                <p className="total">
                                                                    Tổng: {order.totals.grandTotal.toLocaleString()} đ
                                                                </p>
                                                                <p>
                                                                    Thanh toán: {order.paymentMethod.toUpperCase()}
                                                                </p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                {orders.length > ordersPerPage && (
                                    <div className="pagination">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            <FontAwesomeIcon icon={icons.chevronLeft} /> Trước
                                        </button>

                                        <span>
                                            Trang {currentPage} / {Math.ceil(orders.length / ordersPerPage)}
                                        </span>

                                        <button
                                            disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            Sau <FontAwesomeIcon icon={icons.chevronRight} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="tab-content notifications">
                        <div className="notification-settings">
                            <h3>Cài đặt thông báo</h3>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.orderUpdates}
                                    onChange={() => handleNotificationSettingsChange('orderUpdates')}
                                />
                                <span>Cập nhật đơn hàng</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.promotions}
                                    onChange={() => handleNotificationSettingsChange('promotions')}
                                />
                                <span>Khuyến mãi & Ưu đãi</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.systemNews}
                                    onChange={() => handleNotificationSettingsChange('systemNews')}
                                />
                                <span>Tin tức hệ thống</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.emailNotifications}
                                    onChange={() => handleNotificationSettingsChange('emailNotifications')}
                                />
                                <span>Nhận thông báo qua Email</span>
                            </label>
                        </div>

                        <h3 style={{ marginTop: '30px' }}>Thông báo của bạn</h3>
                        {notifications.length === 0 ? (
                            <p>Không có thông báo nào</p>
                        ) : (
                            <div className="notification-list">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                                        onClick={() => markNotificationAsRead(notif.id)}
                                    >
                                        <div className="notif-icon">
                                            {notif.type === 'order' && '📦'}
                                            {notif.type === 'promotion' && '🎉'}
                                            {notif.type === 'system' && '🔔'}
                                        </div>
                                        <div className="notif-content">
                                            <p>{notif.message}</p>
                                            <span className="notif-time">{notif.time}</span>
                                        </div>
                                        {!notif.read && <div className="unread-dot"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'vouchers' && (
                    <div className="tab-content vouchers">
                        <div className="loyalty-section">
                            <h3>Điểm tích lũy của bạn</h3>
                            <div className="loyalty-card">
                                <div className="points-display">
                                    <span className="points-number">{loyaltyPoints}</span>
                                    <span className="points-label">điểm</span>
                                </div>
                                <p className="points-info">
                                    Mỗi 100 điểm = 10.000đ giảm giá cho đơn hàng tiếp theo
                                </p>
                            </div>
                        </div>

                        <h3 style={{ marginTop: '30px' }}>Voucher của bạn</h3>
                        {vouchers.length === 0 ? (
                            <p>Bạn chưa có voucher nào</p>
                        ) : (
                            <>
                                <div className="voucher-list">
                                    {vouchers
                                        .slice((voucherCurrentPage - 1) * vouchersPerPage, voucherCurrentPage * vouchersPerPage)
                                        .map(voucher => (
                                            <div key={voucher.id} className={`voucher-card ${voucher.isUsed ? 'used' : ''}`}>
                                                <div className="voucher-left">
                                                    <div className="voucher-discount">{voucher.code}</div>
                                                    <div className="voucher-code">
                                                        Mã: <strong>{voucher.code}</strong>
                                                    </div>
                                                </div>
                                                <div className="voucher-right">
                                                    <p className="voucher-condition">
                                                        {voucher.description}
                                                    </p>
                                                    <p className="voucher-expiry">
                                                        Nhận lúc: {new Date(voucher.receivedAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                    {voucher.isUsed ? (
                                                        <span className="voucher-status used">Đã sử dụng</span>
                                                    ) : (
                                                        <button className="btn-use-voucher">Sử dụng ngay</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {vouchers.length > vouchersPerPage && (
                                    <div className="pagination">
                                        <button
                                            disabled={voucherCurrentPage === 1}
                                            onClick={() => setVoucherCurrentPage(voucherCurrentPage - 1)}
                                        >
                                            <FontAwesomeIcon icon={icons.chevronLeft} /> Trước
                                        </button>

                                        <span>
                                            Trang {voucherCurrentPage} / {Math.ceil(vouchers.length / vouchersPerPage)}
                                        </span>

                                        <button
                                            disabled={voucherCurrentPage === Math.ceil(vouchers.length / vouchersPerPage)}
                                            onClick={() => setVoucherCurrentPage(voucherCurrentPage + 1)}
                                        >
                                            Sau <FontAwesomeIcon icon={icons.chevronRight} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="tab-content">
                        <div className="security-section">
                            <h3>Đổi mật khẩu</h3>
                            <button
                                className="btn save"
                                onClick={() => setShowPasswordModal(true)}
                                style={{ width: "auto" }}
                            >
                                <FontAwesomeIcon icon={icons.shield} /> Đổi mật khẩu
                            </button>
                        </div>

                        <div className="security-section" style={{ marginTop: '30px' }}>
                            <h3>Liên kết mạng xã hội</h3>
                            <div className="social-links">
                                <button className="social-btn facebook">
                                    <FontAwesomeIcon icon={icons.facebook} /> Liên kết Facebook
                                </button>
                                <button className="social-btn google">
                                    <FontAwesomeIcon icon={icons.google} /> Liên kết Google
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Đổi mật khẩu</h2>

                        <label>Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />

                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />

                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />

                        {passwordMessage && <p className="password-message">{passwordMessage}</p>}

                        <div className="modal-actions">
                            <button className="btn save" onClick={handleChangePassword}>
                                <FontAwesomeIcon icon={icons.check} /> Xác nhận
                            </button>
                            <button className="btn cancel" onClick={() => {
                                setShowPasswordModal(false);
                                setPasswordMessage('');
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}>
                                <FontAwesomeIcon icon={icons.times} /> Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;