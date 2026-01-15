
import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <FontAwesomeIcon icon={faCheckCircle} />}
                            {toast.type === 'error' && <FontAwesomeIcon icon={faExclamationCircle} />}
                            {toast.type === 'info' && <FontAwesomeIcon icon={faInfoCircle} />}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
