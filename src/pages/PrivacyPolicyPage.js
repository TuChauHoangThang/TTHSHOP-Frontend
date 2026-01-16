import React from 'react';
import '../styles/PolicyPages.css';

const PrivacyPolicyPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-hero">
                <div className="policy-hero-content">
                    <h1>Chính Sách Bảo Mật</h1>
                    <p>Chúng tôi tôn trọng và cam kết bảo vệ thông tin cá nhân của bạn</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-content">
                        <h2>1. Mục Đích Thu Thập Thông Tin</h2>
                        <p>
                            Để phục vụ quý khách hàng tốt nhất, TTH Shop cần thu thập một số thông tin như: Họ tên, số điện thoại, địa chỉ giao hàng và email. Những thông tin này giúp chúng tôi:
                        </p>
                        <ul>
                            <li>Xác nhận và xử lý đơn hàng.</li>
                            <li>Liên hệ giao hàng và hỗ trợ khách hàng.</li>
                            <li>Gửi thông báo về các chương trình khuyến mãi (chỉ khi quý khách đồng ý).</li>
                            <li>Cải thiện trải nghiệm mua sắm trên website.</li>
                        </ul>

                        <h2>2. Phạm Vi Sử Dụng Thông Tin</h2>
                        <p>
                            Thông tin cá nhân của quý khách chỉ được sử dụng trong nội bộ TTH Shop. Chúng tôi cam kết <strong>tuyệt đối không bán, chia sẻ hay tiết lộ</strong> thông tin khách hàng cho bên thứ ba, ngoại trừ:
                        </p>
                        <ul>
                            <li>Các đối tác vận chuyển (để thực hiện giao hàng).</li>
                            <li>Khi có yêu cầu pháp lý từ cơ quan nhà nước có thẩm quyền.</li>
                        </ul>

                        <h2>3. Bảo Mật Thông Tin</h2>
                        <p>
                            TTH Shop áp dụng các biện pháp kỹ thuật và an ninh hiện đại để bảo vệ dữ liệu của quý khách. Mọi giao dịch thanh toán đều được mã hóa theo tiêu chuẩn SSL an toàn.
                        </p>

                        <h2>4. Quyền Lợi Khách Hàng</h2>
                        <p>
                            Quý khách có quyền yêu cầu kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bất kỳ lúc nào bằng cách liên hệ với chúng tôi qua email <strong>info@tthshop.com</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
