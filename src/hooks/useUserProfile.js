import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, ordersAPI, vouchersAPI } from '../services/api';

export const useUserProfile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [voucherCurrentPage, setVoucherCurrentPage] = useState(1);

    // Constants exposed if needed or kept internal if only used for slicing
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
            usersAPI.getById(userId),
            ordersAPI.getAll(userId),
            // Mock data for notifications
            Promise.resolve([
                { id: 1, type: 'order', message: 'Đơn hàng #123 đã được giao thành công', time: '2 giờ trước', read: false },
                { id: 2, type: 'promotion', message: 'Giảm giá 50% cho đơn hàng tiếp theo', time: '1 ngày trước', read: false },
                { id: 3, type: 'system', message: 'Cập nhật điều khoản sử dụng', time: '3 ngày trước', read: true }
            ]),
            // Fetch vouchers from API
            vouchersAPI.getUserVouchers(userId),
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

        if (!file.type.startsWith('image/')) {
            showToast('Vui lòng chọn file ảnh', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Kích thước ảnh không được vượt quá 5MB', 'error');
            return;
        }

        setUploadingAvatar(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        setTimeout(async () => {
            const avatarUrl = URL.createObjectURL(file);

            const updatedUser = {
                ...userData,
                avatar: avatarUrl
            };

            await usersAPI.update(userData.id, updatedUser);

            setUserData(updatedUser);
            setTempData(updatedUser);
            setUploadingAvatar(false);
            showToast('Cập nhật ảnh đại diện thành công!');
        }, 1500);
    };

    const handleSave = async () => {
        setLoading(true);
        await usersAPI.update(userData.id, tempData);
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

        await usersAPI.update(userData.id, updatedUser);

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

        await usersAPI.update(userData.id, { ...userData, notificationSettings: updated });

        showToast('Cập nhật cài đặt thông báo thành công!');
    };

    const markNotificationAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    return {
        user,
        loading,
        userData,
        tempData,
        setTempData,
        orders,
        notifications,
        vouchers,
        loyaltyPoints,
        isEditing,
        setIsEditing,
        activeTab,
        setActiveTab,
        expandedOrderId,
        setExpandedOrderId,
        // Pagination
        currentPage,
        setCurrentPage,
        voucherCurrentPage,
        setVoucherCurrentPage,
        // Constants
        ordersPerPage,
        vouchersPerPage,
        // Avatar
        avatarPreview,
        uploadingAvatar,
        handleAvatarChange,
        // Save
        handleSave,
        // Password
        passwordData,
        setPasswordData,
        passwordMessage,
        setPasswordMessage,
        showPasswordModal,
        setShowPasswordModal,
        handleChangePassword,
        // Notification Settings
        notificationSettings,
        handleNotificationSettingsChange,
        markNotificationAsRead,
        // Toast
        toast
    };
};
