import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/LuckySpin.css';

const API_URL = 'http://localhost:3001';

const LuckySpin = () => {
    const { user } = useAuth();

    const [vouchers, setVouchers] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [showModal, setShowModal] = useState(false);

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

    // Load vouchers
    useEffect(() => {
        fetch(`${API_URL}/vouchers`)
            .then(res => res.json())
            .then(data => setVouchers(data))
            .catch(err => console.error("Lỗi tải voucher:", err));
    }, []);

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
        if (!user) {
            alert("Vui lòng đăng nhập!");
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
            setShowResultPopup(true);

            // LƯU VÀO DB USER
            try {
                await fetch(`${API_URL}/userVouchers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: String(user.id),
                        voucherId: String(selectedVoucher.id),
                        code: selectedVoucher.code,
                        description: selectedVoucher.description,
                        isUsed: false,
                        receivedAt: new Date().toISOString()
                    })
                });

                console.log("Đã lưu voucher vào ví người dùng");
            } catch (error) {
                console.error("Lỗi lưu voucher:", error);
            }

        }, 4000);
    };

    const closeAll = () => {
        setShowResultPopup(false);
        setShowModal(false);
        setWheelRotation(0);
        setResultVoucher(null);
    };

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

                        <div className="wheel-wrapper">
                            <div className="wheel-arrow"></div>
                            <div
                                className="wheel"
                                style={{
                                    transform: `rotate(${wheelRotation}deg)`,
                                    background: getWheelBackground(),
                                    transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none'
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
                            <div className="wheel-center" onClick={handleSpin}>
                                {isSpinning ? '...' : 'Go'}
                            </div>
                        </div>

                        <button className="spin-btn-large" onClick={handleSpin} disabled={isSpinning}>
                            {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
                        </button>
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