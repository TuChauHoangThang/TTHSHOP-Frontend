import React from 'react';
import '../styles/PolicyPages.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faStar, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const AboutPage = () => {
    return (
        <div className="policy-page">
            <div className="policy-hero">
                <div className="policy-hero-content">
                    <h1>Về Chúng Tôi</h1>
                    <p>Khám phá câu chuyện và sứ mệnh của TTH Shop - Nơi đam mê handmade thăng hoa</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-card">
                    <div className="policy-content">
                        <h2>Câu Chuyện Của TTH Shop</h2>
                        <div className="about-grid">
                            <div>
                                <p>
                                    Được thành lập vào năm 2024, <strong>TTH Shop</strong> không chỉ là một cửa hàng, mà là nơi hội tụ của những tâm hồn yêu cái đẹp và sự tỉ mỉ. Chúng tôi bắt đầu từ một xưởng nhỏ với niềm đam mê cháy bỏng dành cho các sản phẩm handmade thủ công.
                                </p>
                                <p>
                                    Chúng tôi tin rằng mỗi sản phẩm làm bằng tay đều mang một linh hồn riêng, một câu chuyện riêng. Khác với những món đồ sản xuất hàng loạt, sản phẩm tại TTH Shop được chăm chút từng đường kim mũi chỉ, chứa đựng tâm huyết của người nghệ nhân.
                                </p>
                            </div>
                            <div className="about-image">
                                <img src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Handmade Craft" />
                            </div>
                        </div>

                        <h2>Sứ Mệnh & Tầm Nhìn</h2>
                        <p>
                            Sứ mệnh của chúng tôi là <strong>"Lan tỏa giá trị thủ công Việt"</strong>. Chúng tôi mong muốn đưa những sản phẩm handmade chất lượng cao đến tay người tiêu dùng, đồng thời tôn vinh giá trị lao động nghệ thuật của các nghệ nhân.
                        </p>
                        <p>
                            Tầm nhìn đến năm 2030, TTH Shop sẽ trở thành thương hiệu quà tặng và đồ trang trí handmade hàng đầu tại Việt Nam, là điểm đến tin cậy cho những ai tìm kiếm sự độc đáo và tinh tế.
                        </p>

                        <h2>Giá Trị Cốt Lõi</h2>
                        <div className="core-values">
                            <div className="value-card">
                                <div className="value-icon">
                                    <FontAwesomeIcon icon={faHeart} style={{ color: '#e1306c' }} />
                                </div>
                                <h4>Tận Tâm</h4>
                                <p>Đặt trái tim vào từng sản phẩm và dịch vụ khách hàng.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <FontAwesomeIcon icon={faStar} style={{ color: '#f59e0b' }} />
                                </div>
                                <h4>Chất Lượng</h4>
                                <p>Cam kết chất lượng tốt nhất, không thỏa hiệp.</p>
                            </div>
                            <div className="value-card">
                                <div className="value-icon">
                                    <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#3b82f6' }} />
                                </div>
                                <h4>Uy Tín</h4>
                                <p>Luôn giữ chữ tín và minh bạch trong mọi hoạt động.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
