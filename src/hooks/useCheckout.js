import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, vouchersAPI } from '../services/api';
import { formatPrice } from '../utils/formatPrice';

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

export const useCheckout = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useAuth();
    const { cartDetails, clearCart, removeFromCart } = useCart();

    // Determine items to checkout
    const checkoutItems = useMemo(() => {
        if (state?.items && state.items.length > 0) {
            return state.items;
        }
        return cartDetails;
    }, [state, cartDetails]);

    const [shippingInfo, setShippingInfo] = useState(initialFormState);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');

    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [ownedVouchers, setOwnedVouchers] = useState([]);

    useEffect(() => {
        const fetchOwnedVouchers = async () => {
            if (!user) return;
            try {
                // 1. Get catalogue
                const catalogue = await vouchersAPI.getAll();
                // 2. Get user vouchers
                const myVouchers = await vouchersAPI.getUserVouchers(user.id);

                // 3. Merge
                const valid = myVouchers
                    .filter(uv => !uv.used && !uv.isUsed)
                    .map(uv => {
                        const detail = catalogue.find(v => String(v.id) === String(uv.voucherId));
                        if (!detail) return null;
                        return {
                            ...detail,
                            ...uv,
                            id: uv.id,
                            catalogueId: detail.id
                        };
                    })
                    .filter(Boolean);
                setOwnedVouchers(valid);
            } catch (err) { console.error(err); }
        };
        fetchOwnedVouchers();
    }, [user]);

    // Populate user info
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
        return checkoutItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [checkoutItems]);

    // Handle Voucher from navigation state
    useEffect(() => {
        if (state?.appliedVoucherCode && ownedVouchers.length > 0) {
            const code = state.appliedVoucherCode;
            const fond = ownedVouchers.find(v => v.code === code);
            if (fond && subtotal >= fond.minOrderValue) {
                setAppliedVoucher(fond);
                setVoucherCode(code);
            }
        }
    }, [state, ownedVouchers, subtotal]);

    const totalItems = useMemo(() => {
        return checkoutItems.reduce((total, item) => total + item.quantity, 0);
    }, [checkoutItems]);

    const shippingFee = subtotal === 0 || subtotal > 500000 ? 0 : 30000;

    const discountAmount = useMemo(() => {
        if (!appliedVoucher) return 0;
        const currentSubtotal = Number(subtotal);
        const val = Number(appliedVoucher.discountValue);

        if (appliedVoucher.discountType === 'fixed') {
            return val;
        }
        if (appliedVoucher.discountType === 'percentage') {
            return (currentSubtotal * val) / 100;
        }
        if (appliedVoucher.discountType === 'shipping') {
            return Math.min(Number(shippingFee), val);
        }
        return 0;
    }, [appliedVoucher, subtotal, shippingFee]);

    const grandTotal = Number(subtotal) + Number(shippingFee) - discountAmount;

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setVoucherError('');

        // Check in owned vouchers
        const found = ownedVouchers.find(v => v.code.trim().toUpperCase() === voucherCode.trim().toUpperCase());

        if (!found) {
            setVoucherError('Mã giảm giá không hợp lệ hoặc bạn chưa sở hữu.');
            setAppliedVoucher(null);
            return;
        }

        if (Number(subtotal) < Number(found.minOrderValue)) {
            setVoucherError(`Đơn hàng tối thiểu ${formatPrice(found.minOrderValue)} để áp dụng mã này.`);
            setAppliedVoucher(null);
            return;
        }
        setAppliedVoucher(found);
        setVoucherCode('');
    };

    const handleSelectFromModal = (voucher) => {
        setVoucherCode(voucher.code);
        setAppliedVoucher(voucher);
        setVoucherError('');
        setIsVoucherModalOpen(false);
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
        if (checkoutItems.length === 0) {
            setOrderError('Không có sản phẩm để thanh toán.');
            return;
        }
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setSubmitting(true);
        try {

            const itemsPayload = checkoutItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                options: item.options
            }));
            const itemsSnapshot = checkoutItems.map(item => ({
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
                voucherId: appliedVoucher?.catalogueId || null,
                discountAmount: discountAmount,
                clearCart: false
            });

            // Mark voucher as used
            if (appliedVoucher && appliedVoucher.id) {
                await vouchersAPI.markUserVoucherUsed(appliedVoucher.id);
            }

            // Remove bought items
            if (checkoutItems.length === cartDetails.length) {
                clearCart();
            } else {
                for (const item of checkoutItems) {
                    if (removeFromCart) {
                        removeFromCart(item.productId, item.options);
                    }
                }
            }

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

    return {
        checkoutItems,
        shippingInfo,
        setShippingInfo,
        paymentMethod,
        setPaymentMethod,
        errors,
        submitting,
        orderError,
        orderSuccess,
        voucherCode,
        setVoucherCode,
        appliedVoucher,
        setAppliedVoucher,
        voucherError,
        ownedVouchers,
        isVoucherModalOpen,
        setIsVoucherModalOpen,
        handleSelectFromModal,
        handleApplyVoucher,
        handleInputChange,
        handleSubmit,
        subtotal,
        shippingFee,
        discountAmount,
        grandTotal,
        totalItems,
        cartDetails // for empty check
    };
};
