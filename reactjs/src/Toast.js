// Toast.js
import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);
  if (!isVisible) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;