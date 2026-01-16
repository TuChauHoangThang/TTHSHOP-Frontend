import React from 'react';
import '../styles/PolicyPages.css';

const ReturnPolicyPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-hero">
                <div className="policy-hero-content">
                    <h1>Chính Sách Đổi Trả</h1>
                    <p>TTH Shop cam kết đảm bảo quyền lợi tốt nhất cho khách hàng với chính sách đổi trả minh bạch</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-content">
                        <h2>1. Điều Kiện Đổi Trả</h2>
                        <p>Quý khách có thể yêu cầu đổi/trả hàng trong các trường hợp sau:</p>
                        <ul>
                            <li>Sản phẩm bị lỗi kỹ thuật, lỗi sản xuất (rách, bung chỉ, hư hỏng chi tiết...).</li>
                            <li>Sản phẩm giao không đúng mẫu mã, màu sắc, kích thước như đơn đặt hàng.</li>
                            <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển.</li>
                        </ul>
                        <p><strong>Lưu ý:</strong> Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng, giặt tẩy và còn đầy đủ bao bì, quà tặng kèm theo (nếu có).</p>

                        <h2>2. Thời Gian Áp Dụng</h2>
                        <ul>
                            <li><strong>Đổi hàng:</strong> Trong vòng <strong>07 ngày</strong> kể từ ngày nhận hàng.</li>
                            <li><strong>Trả hàng & Hoàn tiền:</strong> Trong vòng <strong>03 ngày</strong> nếu lỗi thuộc về nhà sản xuất.</li>
                        </ul>

                        <h2>3. Quy Trình Đổi Trả</h2>
                        <ol>
                            <li>
                                <strong>Bước 1:</strong> Liên hệ với CSKH qua Hotline hoặc Chatbox, cung cấp mã đơn hàng và video/hình ảnh tình trạng sản phẩm.
                            </li>
                            <li>
                                <strong>Bước 2:</strong> Sau khi xác nhận đủ điều kiện, TTH Shop sẽ gửi nhân viên đến thu hồi sản phẩm (tại các thành phố lớn) hoặc hướng dẫn quý khách gửi hàng qua bưu điện.
                            </li>
                            <li>
                                <strong>Bước 3:</strong> Ngay khi nhận được hàng hoàn về, chúng tôi sẽ kiểm tra và thực hiện đổi sản phẩm mới hoặc hoàn tiền trong vòng 24h làm việc.
                            </li>
                        </ol>

                        <h2>4. Chi Phí Đổi Trả</h2>
                        <ul>
                            <li><strong>Miễn phí 100%</strong> phí vận chuyển đổi trả nếu lỗi thuộc về TTH Shop.</li>
                            <li>Nếu quý khách muốn đổi mẫu (do thay đổi ý định), quý khách vui lòng thanh toán phí vận chuyển 2 chiều.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
