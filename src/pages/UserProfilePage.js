import React, { useState, useEffect } from 'react';
import {
    User, Mail, Camera, Edit2, Save, X, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/UserProfilePage.css';

const API_URL = 'http://localhost:3001';

const UserProfilePage = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

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
                setUserData(u);
                setTempData(u);
                setOrders(o);
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

        // 🔐 đổi mật khẩu xong → logout
        setTimeout(() => {
            logout();
        }, 1500);
    };

    if (!user) return <div className="error">Bạn chưa đăng nhập</div>;
    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">

                {/* HEADER */}
                <div className="profile-header">
                    <div className="avatar">
                        {userData.avatar
                            ? <img src={userData.avatar} alt="avatar" />
                            : <User size={48} />}
                        {isEditing && (
                            <label className="camera">
                                <Camera size={16} />
                                <input type="file" hidden />
                            </label>
                        )}
                    </div>

                    <div className="info">
                        <h1>{userData.name}</h1>
                        <p><Mail size={14} /> {userData.email}</p>
                        <span className="role">{userData.role}</span>
                    </div>

                    {!isEditing ? (
                        <button className="btn edit" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} /> Chỉnh sửa
                        </button>
                    ) : (
                        <div className="actions">
                            <button className="btn save" onClick={handleSave}>
                                <Save size={16} /> Lưu
                            </button>
                            <button className="btn cancel" onClick={() => setIsEditing(false)}>
                                <X size={16} /> Hủy
                            </button>
                        </div>
                    )}
                </div>

                {/* TABS */}
                <div className="tabs">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        👤 Cá nhân
                    </button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                        📦 Đơn hàng
                    </button>
                    <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}>
                        🔒 Bảo mật
                    </button>
                </div>

                {/* PROFILE */}
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
                            orders.map(order => {
                                const isOpen = expandedOrderId === order.id;

                                return (
                                    <div key={order.id} className="order-card compact">

                                        {/* ===== HEADER GỌN ===== */}
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

                                        {/* ===== CHI TIẾT ===== */}
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
                            })
                        )}
                    </div>
                )}



                {/* SECURITY */}
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

                        <button className="btn save" onClick={handleChangePassword}>
                            <Lock size={16} /> Đổi mật khẩu
                        </button>

                        {passwordMessage && <p style={{ marginTop: 10 }}>{passwordMessage}</p>}
                    </div>
                )}

            </div>
        </div>
    );
};

export default UserProfilePage;
