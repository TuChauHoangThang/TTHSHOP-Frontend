import React, { useState, useEffect } from 'react';
import {
    User, Mail, Camera, Edit2, Save, X
} from 'lucide-react';
import '../styles/UserProfilePage.css';

const API_URL = 'http://localhost:3001';

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [currentUserId] = useState(2); // sau này lấy từ AuthContext

    const [userData, setUserData] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/users/${currentUserId}`).then(r => r.json()),
            fetch(`${API_URL}/orders?userId=${currentUserId}`).then(r => r.json())
        ])
            .then(([user, orders]) => {
                setUserData(user);
                setTempData(user);
                setOrders(orders);
            })
            .finally(() => setLoading(false));
    }, [currentUserId]);

    const handleSave = async () => {
        await fetch(`${API_URL}/users/${currentUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempData)
        });
        setUserData(tempData);
        setIsEditing(false);
    };

    if (loading) return <div className="loading">Đang tải...</div>;
    if (!userData) return <div className="error">Không tìm thấy người dùng</div>;

    return (
        <div className="profile-page">
            <div className="profile-card">

                {/* HEADER */}
                <div className="profile-header">
                    <div className="avatar">
                        {tempData.avatar
                            ? <img src={tempData.avatar} alt="avatar" />
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
                    <button
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >👤 Cá nhân</button>

                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >📦 Đơn hàng</button>

                    <button
                        className={activeTab === 'security' ? 'active' : ''}
                        onClick={() => setActiveTab('security')}
                    >🔒 Bảo mật</button>
                </div>

                {/* CONTENT */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <label>Tên</label>
                        <input
                            value={isEditing ? tempData.name : userData.name}
                            disabled={!isEditing}
                            onChange={e => setTempData({ ...tempData, name: e.target.value })}
                        />

                        <label>Số điện thoại</label>
                        <input
                            value={isEditing ? tempData.phone || '' : userData.phone || ''}
                            disabled={!isEditing}
                            onChange={e => setTempData({ ...tempData, phone: e.target.value })}
                        />

                        <label>Địa chỉ</label>
                        <input
                            value={isEditing ? tempData.address || '' : userData.address || ''}
                            disabled={!isEditing}
                            onChange={e => setTempData({ ...tempData, address: e.target.value })}
                        />
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="tab-content">
                        {orders.length === 0
                            ? <p>Chưa có đơn hàng</p>
                            : orders.map(o => (
                                <div key={o.id} className="order">
                                    Đơn #{o.id} – {o.status}
                                </div>
                            ))}
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="tab-content">
                        <p>🔐 Tính năng bảo mật đang phát triển</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
