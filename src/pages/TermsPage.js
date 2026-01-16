import React from 'react';
import '../styles/PolicyPages.css';

const TermsPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-hero">
                <div className="policy-hero-content">
                    <h1>Điều Khoản Sử Dụng</h1>
                    <p>Các quy định và điều khoản khi sử dụng dịch vụ tại TTH Shop</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-content">
                        <h2>1. Giới Thiệu</h2>
                        <p>
                            Chào mừng quý khách đến với website <strong>tthshop.com</strong>. Khi quý khách truy cập vào trang web của chúng tôi, nghĩa là quý khách đồng ý với các Điều khoản này. Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Quy định và Điều kiện sử dụng, vào bất cứ lúc nào.
                        </p>

                        <h2>2. Hướng Dẫn Sử Dụng Website</h2>
                        <ul>
                            <li>Người sử dụng website phải ít nhất 18 tuổi hoặc truy cập dưới sự giám sát của cha mẹ hay người giám hộ hợp pháp.</li>
                            <li>Nghiêm cấm sử dụng bất kỳ phần nào của trang web này với mục đích thương mại hoặc nhân danh bất kỳ đối tác thứ ba nào nếu không có sự cho phép bằng văn bản của chúng tôi.</li>
                            <li>Quý khách phải đăng ký tài khoản với thông tin xác thực về bản thân và phải cập nhật nếu có bất kỳ thay đổi nào.</li>
                        </ul>

                        <h2>3. Ý Kiến Khách Hàng</h2>
                        <p>
                            Tất cả nội dung trang web và ý kiến phê bình của quý khách đều là tài sản của chúng tôi. Nếu chúng tôi phát hiện bất kỳ thông tin giả mạo nào, chúng tôi sẽ khóa tài khoản của quý khách ngay lập tức hoặc áp dụng các biện pháp khác theo quy định của pháp luật Việt Nam.
                        </p>

                        <h2>4. Đặt Hàng và Xác Nhận</h2>
                        <p>
                            Khi quý khách đặt hàng tại TTH Shop, chúng tôi sẽ nhận được yêu cầu đặt hàng và gửi đến quý khách mã số đơn hàng. Tuy nhiên, yêu cầu đặt hàng cần thông qua một bước xác nhận đơn hàng, TTH Shop chỉ xác nhận đơn hàng nếu yêu cầu đặt hàng của quý khách thỏa mãn các tiêu chí thực hiện đơn hàng tại website.
                        </p>

                        <h2>5. Quy Định Pháp Luật</h2>
                        <p>
                            Các điều kiện, điều khoản và nội dung của trang web này được điều chỉnh bởi luật pháp Việt Nam và Tòa án có thẩm quyền tại Việt Nam sẽ giải quyết bất kỳ tranh chấp nào phát sinh từ việc sử dụng trái phép trang web này.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
