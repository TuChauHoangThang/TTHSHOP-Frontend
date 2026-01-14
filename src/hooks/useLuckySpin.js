import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vouchersAPI } from '../services/api';

export const useLuckySpin = () => {
    const { user } = useAuth();

    const [vouchers, setVouchers] = useState([]);
    const [userVouchers, setUserVouchers] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [hasSpunToday, setHasSpunToday] = useState(false);
    const [lastSpinDate, setLastSpinDate] = useState(null);
    const [checkingSpinStatus, setCheckingSpinStatus] = useState(true);

    // State cho popup kết quả
    const [resultVoucher, setResultVoucher] = useState(null);
    const [showResultPopup, setShowResultPopup] = useState(false);

    const segmentColors = ['#FF4757', '#2ED573', '#FFA502', '#5352ED', '#FF6B81', '#7BED9F', '#ECCC68', '#70A1FF'];

    // State cho scroll
    const [scrolled, setScrolled] = useState(false);

    // Effect xử lý scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load vouchers và userVouchers
    useEffect(() => {
        vouchersAPI.getAll()
            .then(data => setVouchers(data))
            .catch(err => console.error("Lỗi tải voucher:", err));
    }, []);

    // Kiểm tra đã quay hôm nay chưa - THEO USER
    useEffect(() => {
        if (user && user.id) {
            refreshSpinStatus();
        } else {
            setHasSpunToday(false);
            setLastSpinDate(null);
            setUserVouchers([]);
            setCheckingSpinStatus(false);
        }
    }, [user]);

    // Hàm để kiểm tra lại trạng thái quay
    const refreshSpinStatus = () => {
        if (user && user.id) {
            setCheckingSpinStatus(true);
            vouchersAPI.getUserVouchers(user.id)
                .then(data => {
                    setUserVouchers(data || []);

                    // Kiểm tra xem hôm nay đã quay chưa
                    const today = new Date().toDateString();
                    const todayVouchers = data.filter(voucher => {
                        const voucherDate = new Date(voucher.receivedAt).toDateString();
                        return voucherDate === today;
                    });

                    if (todayVouchers.length > 0) {
                        setHasSpunToday(true);
                        const latestVoucher = todayVouchers.reduce((latest, current) => {
                            return new Date(current.receivedAt) > new Date(latest.receivedAt) ? current : latest;
                        }, todayVouchers[0]);
                        setLastSpinDate(latestVoucher.receivedAt);
                    } else {
                        setHasSpunToday(false);
                        if (data.length > 0) {
                            const latestVoucher = data.reduce((latest, current) => {
                                return new Date(current.receivedAt) > new Date(latest.receivedAt) ? current : latest;
                            }, data[0]);
                            setLastSpinDate(latestVoucher.receivedAt);
                        } else {
                            setLastSpinDate(null);
                        }
                    }
                })
                .catch(err => {
                    console.error("Lỗi kiểm tra lượt quay:", err);
                    setHasSpunToday(false);
                    setUserVouchers([]);
                })
                .finally(() => {
                    setCheckingSpinStatus(false);
                });
        }
    };

    const getWheelBackground = () => {
        if (vouchers.length === 0) return '#ccc';
        const degPerSegment = 360 / vouchers.length;
        let gradient = 'conic-gradient(';
        vouchers.forEach((_, i) => {
            const color = segmentColors[i % segmentColors.length];
            const start = i * degPerSegment;
            const end = (i + 1) * degPerSegment;
            gradient += `${color} ${start}deg ${end}deg, `;
        });
        return gradient.slice(0, -2) + ')';
    };

    const handleSpin = async () => {
        if (!user || !user.id) {
            alert("Vui lòng đăng nhập!");
            return;
        }

        if (checkingSpinStatus) {
            alert("Đang kiểm tra lượt quay...");
            return;
        }

        if (hasSpunToday) {
            alert("Bạn đã quay vòng quay may mắn hôm nay. Vui lòng quay lại vào ngày mai!");
            return;
        }

        if (isSpinning || vouchers.length === 0) return;

        setIsSpinning(true);
        setResultVoucher(null);
        setShowResultPopup(false);

        const randomIndex = Math.floor(Math.random() * vouchers.length);
        const selectedVoucher = vouchers[randomIndex];

        const segmentDeg = 360 / vouchers.length;
        const winnerCenterAngle = (randomIndex * segmentDeg) + (segmentDeg / 2);
        const totalRotation = 360 * 5 + (360 - winnerCenterAngle);

        setWheelRotation(totalRotation);

        setTimeout(async () => {
            setIsSpinning(false);
            setResultVoucher(selectedVoucher);

            // Đóng modal vòng quay và hiện popup kết quả
            setShowModal(false);
            setShowResultPopup(true);

            const now = new Date().toISOString();

            try {
                // LƯU VOUCHER VÀO DB USER
                const newVoucher = await vouchersAPI.assignUserVoucher({
                    userId: String(user.id),
                    voucherId: String(selectedVoucher.id),
                    code: selectedVoucher.code,
                    description: selectedVoucher.description,
                    used: false,
                    isUsed: false,
                    receivedAt: now
                });

                // CẬP NHẬT STATE
                setHasSpunToday(true);
                setLastSpinDate(now);
                setUserVouchers(prev => [...prev, newVoucher]);

                console.log("Đã lưu voucher vào ví người dùng:", newVoucher);

            } catch (error) {
                console.error("Lỗi lưu thông tin:", error);
            }

        }, 4000);
    };

    const closeAll = () => {
        setShowResultPopup(false);
        setShowModal(false);
        setWheelRotation(0);
        setResultVoucher(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return {
        vouchers,
        hasSpunToday,
        lastSpinDate,
        checkingSpinStatus,
        refreshSpinStatus,
        isSpinning,
        wheelRotation,
        getWheelBackground,
        handleSpin,
        showModal,
        setShowModal,
        scrolled,
        showResultPopup,
        resultVoucher,
        closeAll,
        formatDate
    };
};
