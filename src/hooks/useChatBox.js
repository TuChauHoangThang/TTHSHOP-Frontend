import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const useChatBox = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (user && isOpen && messages.length === 0) {
            const welcomeMessage = {
                id: Date.now(),
                userName: 'CSKH',
                content: `Xin chào ${user.name}! 👋 Tôi là trợ lý AI của cửa hàng. Tôi có thể giúp bạn về sản phẩm, đơn hàng, hoặc bất kỳ câu hỏi nào. Bạn cần hỗ trợ gì?`,
                sender: 'ai',
                createdAt: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
        }
    }, [user, isOpen]);

    const hideChatRoutes = ['/login', '/register'];
    const shouldRender = !hideChatRoutes.includes(location.pathname);

    // ===== AI LOGIC CHẠY CHAY (KHÔNG CẦN API) =====
    const getAIResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();

        // Chào hỏi
        if (msg.match(/^(hi|hello|chào|xin chào|hey)/i)) {
            return `Chào ${user.name}! Tôi có thể giúp gì cho bạn hôm nay?`;
        }

        // Hỏi về sản phẩm
        if (msg.includes('sản phẩm') || msg.includes('hàng') || msg.includes('mua')) {
            return `Chúng tôi có rất nhiều sản phẩm chất lượng! 🛍️\n\n` +
                `Một số danh mục phổ biến:\n` +
                `• Điện thoại & Phụ kiện\n` +
                `• Laptop & Máy tính\n` +
                `• Thời trang nam nữ\n` +
                `• Đồ gia dụng\n\n` +
                `Bạn quan tâm loại sản phẩm nào nhất? `;
        }

        // Hỏi về đơn hàng
        if (msg.includes('đơn hàng') || msg.includes('order') || msg.includes('mua hàng')) {
            return `Để kiểm tra đơn hàng của bạn:\n\n` +
                `1️⃣ Vào mục "Đơn hàng của tôi"\n` +
                `2️⃣ Xem chi tiết trạng thái giao hàng\n` +
                `3️⃣ Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx\n\n` +
                `Bạn có đơn hàng nào cần kiểm tra không? `;
        }

        // Hỏi về giá
        if (msg.includes('giá') || msg.includes('bao nhiêu') || msg.includes('price')) {
            return `Về giá cả sản phẩm:\n\n` +
                ` Chúng tôi luôn có giá tốt nhất thị trường!\n` +
                ` Nhiều chương trình giảm giá hấp dẫn\n` +
                ` Mã giảm giá độc quyền cho thành viên\n\n` +
                `Bạn muốn xem sản phẩm cụ thể nào để tôi báo giá chính xác nhé?`;
        }

        // Hỏi về giao hàng
        if (msg.includes('giao hàng') || msg.includes('ship') || msg.includes('vận chuyển')) {
            return ` Thông tin giao hàng:\n\n` +
                ` Giao hàng toàn quốc\n` +
                ` Freeship đơn từ 200k\n` +
                ` Giao hàng nhanh 2-3 ngày\n` +
                ` Hỗ trợ COD (thanh toán khi nhận hàng)\n\n` +
                `Bạn ở khu vực nào để tôi tư vấn thời gian giao hàng cụ thể nhé? `;
        }

        // Hỏi về thanh toán
        if (msg.includes('thanh toán') || msg.includes('payment') || msg.includes('trả tiền')) {
            return `💳 Phương thức thanh toán:\n\n` +
                `• Thẻ ATM/Visa/MasterCard\n` +
                `• Ví điện tử (MoMo, ZaloPay, VNPay)\n` +
                `• Chuyển khoản ngân hàng\n` +
                `• COD (Thanh toán khi nhận hàng)\n\n` +
                `Tất cả đều an toàn & bảo mật tuyệt đối! `;
        }

        // Hỏi về khuyến mãi
        if (msg.includes('khuyến mãi') || msg.includes('giảm giá') || msg.includes('sale') || msg.includes('voucher')) {
            return ` Chương trình khuyến mãi HOT:\n\n` +
                `Flash Sale 12h - 14h: Giảm 50%\n` +
                ` Mã FREESHIP cho đơn từ 0đ\n` +
                ` Tặng voucher 100k cho khách mới\n` +
                ` Hoàn xu 20% cho đơn trên 500k\n\n` +
                `Đừng bỏ lỡ nhé! `;
        }

        // Hỏi về trả hàng/hoàn tiền
        if (msg.includes('trả hàng') || msg.includes('hoàn tiền') || msg.includes('đổi hàng') || msg.includes('return')) {
            return ` Chính sách đổi trả:\n\n` +
                `Đổi trả trong 7 ngày\n` +
                ` Hoàn tiền 100% nếu lỗi nhà sản xuất\n` +
                ` Miễn phí vận chuyển khi đổi trả\n` +
                ` Quy trình đơn giản, nhanh chóng\n\n` +
                `Sản phẩm của bạn có vấn đề gì không? `;
        }

        // Hỏi về liên hệ
        if (msg.includes('liên hệ') || msg.includes('hotline') || msg.includes('số điện thoại')) {
            return ` Thông tin liên hệ:\n\n` +
                `☎ Hotline: 1900-xxxx (7:30 - 22:00)\n` +
                ` Email: support@shop.vn\n` +
                ` Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\n` +
                ` Facebook: fb.com/shop\n\n` +
                `Chúng tôi luôn sẵn sàng hỗ trợ bạn! `;
        }

        // Cảm ơn
        if (msg.match(/(cảm ơn|thanks|thank you|cám ơn)/i)) {
            return `Không có gì!  Rất vui được hỗ trợ bạn. Nếu có thắc mắc gì thêm, cứ hỏi tôi nhé! `;
        }

        // Tạm biệt
        if (msg.match(/(bye|tạm biệt|goodbye|chào|hẹn gặp lại)/i)) {
            return `Tạm biệt ${user.name}! 👋 Chúc bạn một ngày tuyệt vời. Hẹn gặp lại sớm nhé! `;
        }

        // Câu hỏi khác (fallback)
        return `Tôi hiểu bạn đang hỏi về "${userMessage}"! \n\n` +
            `Để tôi giúp bạn tốt hơn, bạn có thể hỏi về:\n` +
            `• Sản phẩm & giá cả 🛍\n` +
            `• Đơn hàng & vận chuyển \n` +
            `• Khuyến mãi & ưu đãi \n` +
            `• Chính sách đổi trả \n` +
            `• Thanh toán & bảo mật \n\n` +
            `Bạn quan tâm nội dung nào nhất? `;
    };

    // ===== GỬI TIN NHẮN =====
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Tin nhắn của user
        const userMsg = {
            id: Date.now(),
            userName: user.name,
            content: newMessage,
            sender: 'user',
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentMessage = newMessage;
        setNewMessage('');
        setIsTyping(true);

        // Giả lập độ trễ typing (1-2 giây)
        setTimeout(() => {
            const aiResponse = getAIResponse(currentMessage);

            const aiMsg = {
                id: Date.now() + 1,
                userName: 'AI Assistant',
                content: aiResponse,
                sender: 'ai',
                createdAt: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000); // Random 1-2 giây
    };

    return {
        user,
        isOpen,
        setIsOpen,
        messages,
        newMessage,
        setNewMessage,
        isTyping,
        messagesEndRef,
        scrolled,
        shouldRender,
        handleSendMessage
    };
};
