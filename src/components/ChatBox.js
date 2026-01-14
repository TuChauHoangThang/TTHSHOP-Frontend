import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faPaperPlane, faUser, faRobot } from '@fortawesome/free-solid-svg-icons';
import { useChatBox } from '../hooks/useChatBox';
import '../styles/ChatBoxCss.css';

const ChatBox = () => {
    const {
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
    } = useChatBox();

    if (!shouldRender) {
        return null;
    }

    return (
        <div className={`chatbox-container ${scrolled ? 'scrolled' : ''}`}>
            {/* NÚT MỞ CHAT */}
            <button
                className="chatbox-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Mở chat"
            >
                {isOpen ? (
                    <FontAwesomeIcon icon={faTimes} />
                ) : (
                    <FontAwesomeIcon icon={faComments} />
                )}
            </button>

            {/* CHAT WINDOW */}
            {isOpen && (
                <div className="chatbox-window">
                    {/* HEADER */}
                    <div className="chatbox-header">
                        <div>
                            <h3>CSKH</h3>
                            <small style={{ fontSize: '16px', opacity: 0.9 }}>
                                Hỗ trợ tự động 24/7
                            </small>
                        </div>
                        <button onClick={() => setIsOpen(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* CHƯA ĐĂNG NHẬP */}
                    {!user ? (
                        <div className="chatbox-login-required">
                            <div className="chat-icon">
                                <FontAwesomeIcon icon={faComments} size="4x" />
                            </div>
                            <p className="chat-title">Sử dụng App để nhận ưu đãi độc quyền!</p>
                            <p className="chat-subtitle">
                                Khi bạn bắt đầu cuộc trò chuyện mới, bạn sẽ thấy nó được liệt kê ở đây.
                            </p>
                            <a href="/login" className="chat-login-btn">
                                Đăng nhập / Đăng ký
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* MESSAGES */}
                            <div className="chatbox-messages">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}
                                    >
                                        <div className="message-avatar">
                                            <FontAwesomeIcon
                                                icon={msg.sender === 'user' ? faUser : faRobot}
                                            />
                                        </div>
                                        <div className="message-content">
                                            <div className="message-sender">{msg.userName}</div>
                                            <div className="message-text" style={{ whiteSpace: 'pre-line' }}>
                                                {msg.content}
                                            </div>
                                            <div className="message-time">
                                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* TYPING INDICATOR */}
                                {isTyping && (
                                    <div className="chat-message ai">
                                        <div className="message-avatar">
                                            <FontAwesomeIcon icon={faRobot} />
                                        </div>
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT */}
                            <form className="chatbox-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={isTyping}
                                />
                                <button type="submit" disabled={isTyping || !newMessage.trim()}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBox;