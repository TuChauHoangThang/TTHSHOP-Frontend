import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled upto given distance
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <>
            {isVisible && (
                <div onClick={scrollToTop} className="scroll-to-top">
                    <FontAwesomeIcon icon={faArrowUp} />
                </div>
            )}
            <style jsx>{`
                .scroll-to-top {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #6c757d;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 999;
                    transition: all 0.3s ease;
                    font-size: 1.2rem;
                }
                .scroll-to-top:hover {
                    transform: translateY(-3px);
                    background-color: #5a6268;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
                }
            `}</style>
        </>
    );
};

export default ScrollToTop;