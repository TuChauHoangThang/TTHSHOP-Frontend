import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LuckySpin.css';

const API_URL = 'http://localhost:3001';

const LuckySpin = () => {
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
        fetch(`${API_URL}/vouchers`)
            .then(res => res.json())
            .then(data => setVouchers(data))
            .catch(err => console.error("Lỗi tải voucher:", err));
    }, []);

    // Kiểm tra đã quay hôm nay chưa - THEO USER
    useEffect(() => {
        if (user && user.id) {
            setCheckingSpinStatus(true);

            // Lấy danh sách vouchers của user
            fetch(`${API_URL}/userVouchers?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setUserVouchers(data || []);

                    // Kiểm tra xem hôm nay đã quay chưa
                    const today = new Date().toDateString();
                    const todayVouchers = data.filter(voucher => {
                        const voucherDate = new Date(voucher.receivedAt).toDateString();
                        return voucherDate === today;
                    });

                    if (todayVouchers.length > 0) {
                        // Đã quay hôm nay
                        setHasSpunToday(true);
                        // Lấy thời gian quay gần nhất
                        const latestVoucher = todayVouchers.reduce((latest, current) => {
                            return new Date(current.receivedAt) > new Date(latest.receivedAt) ? current : latest;
                        }, todayVouchers[0]);
                        setLastSpinDate(latestVoucher.receivedAt);
                    } else {
                        // Chưa quay hôm nay
                        setHasSpunToday(false);
                        // Tìm lần quay gần nhất (nếu có)
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
        } else {
            setHasSpunToday(false);
            setLastSpinDate(null);
            setUserVouchers([]);
            setCheckingSpinStatus(false);
        }
    }, [user]);

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
                const response = await fetch(`${API_URL}/userVouchers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: String(user.id),
                        voucherId: String(selectedVoucher.id),
                        code: selectedVoucher.code,
                        description: selectedVoucher.description,
                        used: false,
                        receivedAt: now
                    })
                });

                if (response.ok) {
                    const newVoucher = await response.json();

                    // CẬP NHẬT STATE
                    setHasSpunToday(true);
                    setLastSpinDate(now);
                    setUserVouchers(prev => [...prev, newVoucher]);

                    console.log("Đã lưu voucher vào ví người dùng:", newVoucher);
                } else {
                    console.error("Lỗi lưu voucher");
                }
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

    // Hàm để kiểm tra lại trạng thái quay
    const refreshSpinStatus = () => {
        if (user && user.id) {
            setCheckingSpinStatus(true);
            fetch(`${API_URL}/userVouchers?userId=${user.id}`)
                .then(res => res.json())
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

    // Debug info
    console.log("User vouchers:", userVouchers);
    console.log("Has spun today:", hasSpunToday);
    console.log("Last spin date:", lastSpinDate);

    return (
        <>
            {/* NÚT FLOATING - Thêm class scrolled khi scroll */}
            {!showModal && (
                <div className={`lucky-spin-container ${scrolled ? 'scrolled' : ''}`}>
                    <button className="lucky-float-btn" onClick={() => setShowModal(true)}>
                        🎁
                    </button>
                </div>
            )}

            {/* MODAL VÒNG QUAY */}
            {showModal && (
                <div className="lucky-overlay">
                    <div className="lucky-modal">
                        <button className="close-btn" onClick={() => setShowModal(false)} disabled={isSpinning}>×</button>
                        <h2 className="modal-title">VÒNG QUAY MAY MẮN</h2>

                        {/* Thông báo số lần quay */}
                        <div className="spin-info">
                            {checkingSpinStatus ? (
                                <div className="checking-status">
                                    <p>⏳ Đang kiểm tra lượt quay...</p>
                                </div>
                            ) : hasSpunToday ? (
                                <div className="already-spun">
                                    <p>🎯 Bạn đã quay hôm nay</p>
                                    {lastSpinDate && (
                                        <p className="last-spin-time">
                                            Lần quay cuối: {formatDate(lastSpinDate)}
                                        </p>
                                    )}
                                    <p className="comeback-msg">Quay lại vào ngày mai nhé! ⏰</p>
                                    <button
                                        className="refresh-btn"
                                        onClick={refreshSpinStatus}
                                        style={{
                                            marginTop: '10px',
                                            padding: '5px 15px',
                                            background: '#b8aeae',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        🔄 Kiểm tra lại
                                    </button>
                                </div>
                            ) : (
                                <div className="can-spin">
                                    <p>🎁 Bạn có 1 lượt quay miễn phí hôm nay!</p>
                                    <p className="hint">Nhấn nút GO ở giữa để bắt đầu</p>
                                </div>
                            )}
                        </div>

                        <div className="wheel-wrapper">
                            <div className="wheel-arrow"></div>
                            <div
                                className="wheel"
                                style={{
                                    transform: `rotate(${wheelRotation}deg)`,
                                    background: getWheelBackground(),
                                    transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none',
                                    opacity: hasSpunToday ? 0.6 : 1
                                }}
                            >
                                {vouchers.map((v, i) => (
                                    <div
                                        key={i}
                                        className="wheel-label"
                                        style={{ transform: `rotate(${i * (360 / vouchers.length) + (360 / vouchers.length / 2)}deg)` }}
                                    >
                                        <div className="label-text">{v.code}</div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="wheel-center"
                                onClick={handleSpin}
                                disabled={hasSpunToday || checkingSpinStatus || isSpinning}
                                title={hasSpunToday ? "Bạn đã quay hôm nay" : checkingSpinStatus ? "Đang kiểm tra..." : "Nhấn để quay"}
                            >
                                {isSpinning ? '...' : 'GO'}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* POPUP KẾT QUẢ (Nổi lên trên cùng) */}
            {showResultPopup && resultVoucher && (
                <div className="result-overlay-backdrop">
                    <div className="result-popup-card">
                        <div className="confetti-effect">🎉</div>
                        <h3>CHÚC MỪNG BẠN!</h3>
                        <p>Bạn đã nhận được voucher:</p>

                        <div className="voucher-display">
                            <span className="voucher-code">{resultVoucher.code}</span>
                            <span className="voucher-desc">{resultVoucher.description}</span>
                        </div>

                        <p className="note">Voucher đã được lưu vào ví của bạn.</p>
                        <p className="reminder">Bạn có thể quay lại vào ngày mai! 📅</p>

                        <button className="receive-btn" onClick={closeAll}>
                            Nhận Ngay & Mua Sắm
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LuckySpin;