import React from 'react';
import { useLuckySpin } from '../hooks/useLuckySpin';
import '../styles/LuckySpin.css';

const LuckySpin = () => {
    const {
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
    } = useLuckySpin();

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