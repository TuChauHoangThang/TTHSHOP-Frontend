import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ScrollToTop';
import ChatBox from '../ChatBox';
import LuckySpin from "../LuckySpin";

const Layout = ({ children }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative'
            }}
        >
            <Header />

            <main style={{ flex: 1 }}>
                {children}
            </main>

            <Footer />

            {/* 🔝 Nút cuộn lên đầu trang */}
            <ScrollToTop />

            {/* 💬 Chat box nổi toàn website */}
            <ChatBox />
            <div style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                zIndex: 999
            }}>
                <LuckySpin />
            </div>
        </div>
    );
};

export default Layout;
