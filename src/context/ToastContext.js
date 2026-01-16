import React, { createContext, useContext, useState, useCallback } from 'react';
import '../styles/Toast.css';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 2000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast-notification ${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >

                        <div className="toast-message">{toast.message}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
