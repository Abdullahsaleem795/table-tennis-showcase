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
        border: `1px solid ${isSuccess ? 'var(--color-secondary)' : 'var(--color-error)'}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        color: 'var(--color-on-surface)',
        animation: 'slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fontFamily: "var(--font-family-heading)",
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
        <FaCheckCircle style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
      ) : (
        <FaExclamationCircle style={{ color: 'var(--color-error)', flexShrink: 0 }} />
      )}
      
      <span>{message}</span>
      
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-on-surface-variant)',
          cursor: 'pointer',
          display: 'flex',
          padding: '2px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--color-on-surface)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--color-on-surface-variant)'}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
