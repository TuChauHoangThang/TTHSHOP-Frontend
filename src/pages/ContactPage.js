import React from 'react';
import { useContactPage } from '../hooks/useContactPage';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Twitter } from 'lucide-react';
import '../styles/ContactPage.css';

const ContactPage = () => {
    const {
        formData,
        submitted,
        handleChange,
        handleSubmit
    } = useContactPage();

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <div className="contact-hero-content">
                    <h1>Liên Hệ Với Chúng Tôi</h1>
                    <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
                </div>
            </div>

            <div className="contact-container">
                <div className="contact-grid">
                    <div>
                        {/* About Section */}
                        <div className="contact-card about-section">
                            <h2>Về Chúng Tôi</h2>
                            <p>
                                Chúng tôi là một công ty thương mại , cam kết mang đến cho khách hàng
                                những sản phẩm chất lượng cao với giá cả cạnh tranh nhất. Với hơn 10 năm kinh nghiệm
                                trong ngành, chúng tôi tự hào phục vụ hàng triệu khách hàng trên toàn quốc.
                            </p>
                            <p>
                                Sứ mệnh của chúng tôi là mang đến trải nghiệm mua sắm trực tuyến thuận tiện,
                                an toàn và đáng tin cậy cho mọi người.
                            </p>
                        </div>

                        {/* Contact Details */}
                        <div className="contact-card contact-info-section">
                            <h3>Thông Tin Liên Hệ</h3>

                            <div className="contact-info-list">
                                <div className="contact-info-item">
                                    <div className="contact-icon-wrapper blue">
                                        <MapPin />
                                    </div>
                                    <div className="contact-info-text">
                                        <h4>Địa chỉ</h4>
                                        <p>22/3, Phường long bình</p>
                                        <p>Tỉnh Đồng Nai, Việt Nam</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon-wrapper green">
                                        <Phone />
                                    </div>
                                    <div className="contact-info-text">
                                        <h4>Điện thoại</h4>
                                        <p>Hotline: 0907 389 981</p>
                                        <p>Mobile: 0123 456 789</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon-wrapper purple">
                                        <Mail />
                                    </div>
                                    <div className="contact-info-text">
                                        <h4>Email</h4>
                                        <p>cskhNLU@gmail.com</p>
                                        <p>khanhtam2004@gmail.com</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon-wrapper orange">
                                        <Clock />
                                    </div>
                                    <div className="contact-info-text">
                                        <h4>Giờ làm việc</h4>
                                        <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                                        <p>Thứ 7 - CN: 9:00 - 17:00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="social-section">
                                <h4>Theo dõi chúng tôi</h4>
                                <div className="social-links">
                                    <a href="#" className="social-link facebook">
                                        <Facebook />
                                    </a>
                                    <a href="#" className="social-link instagram">
                                        <Instagram />
                                    </a>
                                    <a href="#" className="social-link twitter">
                                        <Twitter />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="contact-card contact-form-section">
                        <h3>Gửi Tin Nhắn</h3>

                        {submitted && (
                            <div className="form-success">
                                Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.
                            </div>
                        )}

                        <div className="contact-form">
                            <div className="form-group">
                                <label>
                                    Họ và tên <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Email <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Tiêu đề <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Tiêu đề tin nhắn"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Nội dung <span className="required">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Nhập nội dung tin nhắn của bạn..."
                                    required
                                />
                            </div>

                            <button onClick={handleSubmit} className="form-submit">
                                <Send />
                                Gửi tin nhắn
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="map-section">
                    <h3>Vị Trí Của Chúng Tôi</h3>
                    <div className="map-placeholder">
                        <MapPin />
                        <p>Bản đồ Google Maps sẽ được hiển thị tại đây</p>
                        <p>Tích hợp Google Maps API để hiển thị vị trí chính xác</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;