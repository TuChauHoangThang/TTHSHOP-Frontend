import { useState } from 'react';
import { useCart } from '../context/CartContext';

export const useCartActions = () => {
    const {
        cartDetails,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const [updatingId, setUpdatingId] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    // Quản lý chọn sản phẩm
    const toggleSelectProduct = (productId) => {
        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === cartDetails.length && cartDetails.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartDetails.map(item => item.productId));
        }
    };

    // Xóa thông minh (Xóa mục chọn hoặc xóa tất cả)
    const handleSmartRemove = () => {
        if (selectedItems.length > 0) {
            if (window.confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                selectedItems.forEach(id => removeFromCart(id));
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
    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingId(productId);
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            alert(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    // Tính toán số liệu
    const subtotal = cartDetails
        .filter(item => selectedItems.includes(item.productId))
        .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

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