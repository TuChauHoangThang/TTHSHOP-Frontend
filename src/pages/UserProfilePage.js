import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon, icons } from '../utils/icons';
import '../styles/UserProfilePage.css';

const API_URL = 'http://localhost:3001';

const UserProfilePage = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 4;

    const [userData, setUserData] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [orders, setOrders] = useState([]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState('');

    useEffect(() => {
        if (!user) return;
        const userId = user.id;

        Promise.all([
            fetch(`${API_URL}/users/${userId}`).then(r => r.json()),
            fetch(`${API_URL}/orders?userId=${userId}`).then(r => r.json())
        ])
            .then(([u, o]) => {
                const sortedOrders = [...o].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setUserData(u);
                setTempData(u);
                setOrders(sortedOrders);
            })
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async () => {
        await fetch(`${API_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempData)
        });
        setUserData(tempData);
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        setPasswordMessage('');

        if (passwordData.currentPassword !== userData.password) {
            setPasswordMessage(' Mật khẩu hiện tại không đúng');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage(' Mật khẩu mới tối thiểu 6 ký tự');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage(' Mật khẩu xác nhận không khớp');
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

        setTimeout(() => {
            logout();
        }, 1500);
    };

    if (!user) return <div className="error">Bạn chưa đăng nhập</div>;
    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-header">
                    <div className="avatar">
                        {userData.avatar
                            ? <img src={userData.avatar} alt="avatar" />
                            : <FontAwesomeIcon icon={icons.user} size="3x" />}
                        {isEditing && (
                            <label className="camera">
                                <FontAwesomeIcon icon={icons.edit} />
                                <input type="file" hidden />
                            </label>
                        )}
                    </div>

                    <div className="info">
                        <h1>{userData.name}</h1>
                        <p><FontAwesomeIcon icon={icons.email} /> {userData.email}</p>
                        <span className="role">{userData.role}</span>
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
                            <button className="btn cancel" onClick={() => setIsEditing(false)}>
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

                {activeTab === 'security' && (
                    <div className="tab-content">
                        <label>Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />

                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />

                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />

                        <button className="btn save" onClick={handleChangePassword} style={{ width: "20%" }}>
                            <FontAwesomeIcon icon={icons.shield} /> Đổi mật khẩu
                        </button>

                        {passwordMessage && <p style={{ marginTop: 10 }}>{passwordMessage}</p>}
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfilePage;