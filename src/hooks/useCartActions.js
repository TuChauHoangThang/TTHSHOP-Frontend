import { useState } from 'react';
import { useCart } from '../context/CartContext';

// Helper để tạo key duy nhất cho mỗi item trong giỏ (dựa trên ID và options)
const getItemKey = (productId, options) => {
    return `${productId}-${JSON.stringify(options || {})}`;
};

export const useCartActions = () => {
    const {
        cartDetails,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const [updatingId, setUpdatingId] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]); // Mảng các itemKey

    // Quản lý chọn sản phẩm
    const toggleSelectProduct = (productId, options) => {
        const key = getItemKey(productId, options);
        setSelectedItems(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartDetails.length && cartDetails.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartDetails.map(item => getItemKey(item.productId, item.options)));
        }
    };

    // Xóa thông minh (Xóa mục chọn hoặc xóa tất cả)
    const handleSmartRemove = () => {
        if (selectedItems.length > 0) {
            if (window.confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                // Duyệt qua cartDetails để tìm các item có key nằm trong selectedItems
                cartDetails.forEach(item => {
                    const key = getItemKey(item.productId, item.options);
                    if (selectedItems.includes(key)) {
                        removeFromCart(item.productId, item.options);
                    }
                });
                setSelectedItems([]);
            }
        } else {
            if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
                clearCart();
                setSelectedItems([]);
            }
        }
    };

    // Cập nhật số lượng
    const handleQuantityChange = async (productId, newQuantity, options = {}) => {
        if (newQuantity < 1) {
            if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
                removeFromCart(productId, options);
            }
            return;
        }
        setUpdatingId(getItemKey(productId, options));
        try {
            await updateQuantity(productId, newQuantity, options);
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    // Tính toán số liệu
    const subtotal = cartDetails
        .filter(item => selectedItems.includes(getItemKey(item.productId, item.options)))
        .reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0);

    const shipping = (subtotal > 500000 || subtotal === 0) ? 0 : 30000;
    const total = subtotal + shipping;

    return {
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
    };
};