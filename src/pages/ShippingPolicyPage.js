import React from 'react';
import '../styles/PolicyPages.css';

const ShippingPolicyPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-hero">
                <div className="policy-hero-content">
                    <h1>Chính Sách Vận Chuyển</h1>
                    <p>Thông tin chi tiết về quy trình giao hàng, phí vận chuyển và thời gian nhận hàng</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-content">
                        <h2>1. Phạm Vi Giao Hàng</h2>
                        <p>
                            <strong>TTH Shop</strong> hỗ trợ giao hàng trên toàn quốc (63 tỉnh thành). Dù bạn ở bất cứ đâu tại Việt Nam, chúng tôi đều cam kết mang sản phẩm đến tận tay bạn.
                        </p>

                        <h2>2. Phí Vận Chuyển</h2>
                        <ul>
                            <li>
                                <strong>Miễn phí vận chuyển:</strong> Cho đơn hàng có giá trị từ <strong>500.000 VNĐ</strong> trở lên.
                            </li>
                            <li>
                                <strong>Đồng giá 30.000 VNĐ:</strong> Cho các đơn hàng dưới 500.000 VNĐ tại khu vực nội thành TP.HCM và Hà Nội.
                            </li>
                            <li>
                                <strong>Phí vận chuyển theo đơn vị:</strong> Đối với các tỉnh thành khác, phí ship sẽ được tính tự động dựa trên trọng lượng gói hàng và biểu phí của đối tác vận chuyển (Giao Hàng Nhanh, Viettel Post...).
                            </li>
                        </ul>

                        <h2>3. Thời Gian Giao Hàng</h2>
                        <p>Thời gian giao hàng dự kiến (không tính Chủ Nhật và ngày lễ):</p>
                        <ul>
                            <li><strong>Nội thành TP.HCM & Hà Nội:</strong> 1 - 2 ngày làm việc.</li>
                            <li><strong>Các tỉnh miền Nam & miền Trung:</strong> 2 - 4 ngày làm việc.</li>
                            <li><strong>Các tỉnh miền Bắc:</strong> 3 - 5 ngày làm việc.</li>
                        </ul>
                        <p>
                            <em>Lưu ý: Thời gian có thể thay đổi tùy thuộc vào tình hình thực tế (thiên tai, dịch bệnh, hoặc các sự kiện bất khả kháng).</em>
                        </p>

                        <h2>4. Quy Trình Đóng Gói</h2>
                        <p>
                            Tất cả sản phẩm của TTH Shop đều được đóng gói kỹ lưỡng với 3 lớp bảo vệ:
                            <br />- Lớp chống sốc (bubble wrap).
                            <br />- Hộp carton cứng cáp in logo thương hiệu.
                            <br />- Túi niêm phong chống thấm nước.
                        </p>

                        <h2>5. Kiểm Tra Hàng Hóa</h2>
                        <p>
                            Khách hàng được quyền <strong>kiểm tra ngoại quan</strong> (tình trạng hộp, tem niêm phong) trước khi nhận. Nếu phát hiện hộp bị móp méo nghiêm trọng hoặc có dấu hiệu bị bóc mở, quý khách vui lòng từ chối nhận hàng và liên hệ ngay hotline 0907 389 981.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
