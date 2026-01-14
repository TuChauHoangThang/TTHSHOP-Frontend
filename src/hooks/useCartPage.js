import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCartActions } from './useCartActions';
import { vouchersAPI } from '../services/api';

export const useCartPage = () => {
    // Kế thừa các actions cơ bản của cart
    const cartActions = useCartActions();
    const { user } = useAuth();

    // State cho vouchers
    const [ownedVouchers, setOwnedVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    // Fetch vouchers
    useEffect(() => {
        if (!user) return;
        const fetchVouchers = async () => {
            try {
                const catalogue = await vouchersAPI.getAll();
                const userVouchers = await vouchersAPI.getUserVouchers(user.id);

                const valid = userVouchers
                    .filter(uv => !uv.used && !uv.isUsed)
                    .map(uv => {
                        const detail = catalogue.find(v => String(v.id) === String(uv.voucherId));
                        if (!detail) return null;
                        return { ...detail, ...uv, id: uv.id, catalogueId: detail.id };
                    })
                    .filter(Boolean);
                setOwnedVouchers(valid);
            } catch (e) {
                console.error(e);
            }
        };
        fetchVouchers();
    }, [user]);

    // Calculate discount
    const discountAmount = useMemo(() => {
        if (!selectedVoucher) return 0;
        const currentSubtotal = Number(cartActions.subtotal);
        const minOrder = Number(selectedVoucher.minOrderValue);

        if (currentSubtotal < minOrder) return 0;

        const val = Number(selectedVoucher.discountValue);

        if (selectedVoucher.discountType === 'fixed') return val;
        if (selectedVoucher.discountType === 'percentage') return (currentSubtotal * val) / 100;
        if (selectedVoucher.discountType === 'shipping') return Math.min(Number(cartActions.shipping), val);
        return 0;
    }, [selectedVoucher, cartActions.subtotal, cartActions.shipping]);

    const grandTotal = Number(cartActions.total) - discountAmount;

    return {
        ...cartActions, // Spread các props từ useCartActions (cartDetails, selectedItems, etc.)
        ownedVouchers,
        selectedVoucher,
        setSelectedVoucher,
        showVoucherModal,
        setShowVoucherModal,
        discountAmount,
        grandTotal
    };
};
