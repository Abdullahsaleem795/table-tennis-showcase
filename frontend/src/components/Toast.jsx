import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        borderRadius: '10px',
        backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
        animation: 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.95rem'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      {isSuccess ? (
        <FaCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />
      ) : (
        <FaExclamationCircle style={{ color: '#ef4444', flexShrink: 0 }} />
      )}
      
      <span>{message}</span>
      
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          padding: '2px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#ffffff'}
        onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
