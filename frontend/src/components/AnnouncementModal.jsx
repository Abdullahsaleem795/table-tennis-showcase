import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes, FaCalendarAlt, FaClock, FaFire } from 'react-icons/fa';

const SEEN_KEY = 'seen_announcement_ffl_smash_s2';

const AnnouncementModal = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(SEEN_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(20, 14, 8, 0.65)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              borderRadius: '24px',
              padding: '3px',
              background: 'linear-gradient(135deg, var(--color-tertiary), var(--color-primary), var(--color-secondary))',
              backgroundSize: '200% 200%',
              animation: 'announceBorderFlow 6s ease infinite',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '22px',
                backgroundColor: 'var(--color-surface)',
                padding: '40px 32px 32px',
                textAlign: 'center',
              }}
            >
              {/* Floating decorative emoji */}
              <span style={{ position: 'absolute', top: '14px', left: '18px', fontSize: '22px', animation: 'announceFloat 3s ease-in-out infinite' }}>🏓</span>
              <span style={{ position: 'absolute', top: '30px', right: '50px', fontSize: '16px', animation: 'announceFloat 3.5s ease-in-out infinite 0.4s' }}>✨</span>
              <span style={{ position: 'absolute', bottom: '18px', left: '40px', fontSize: '18px', animation: 'announceFloat 4s ease-in-out infinite 0.8s' }}>🎉</span>

              <button
                onClick={close}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--motion-standard)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-error)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'; e.currentTarget.style.color = 'var(--color-on-surface-variant)'; }}
              >
                <FaTimes size={14} />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-container)',
                  color: 'var(--color-on-primary-container)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '18px',
                }}
              >
                <FaFire /> Big Announcement
              </motion.div>

              <h2
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '10px',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                FFL Smash<br />Season 2 is Coming!
              </h2>

              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '26px' }}>
                The wait is over. Our champions are back for another electrifying season — get ready for smashing rallies, fierce rivalries, and non-stop action!
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  marginBottom: '28px',
                }}
              >
                <div style={{ flex: 1, backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <FaCalendarAlt style={{ color: 'var(--color-primary)', fontSize: '18px' }} />
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-on-surface)', fontFamily: 'var(--font-family-heading)' }}>July 28</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</span>
                </div>
                <div style={{ flex: 1, backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <FaClock style={{ color: 'var(--color-tertiary)', fontSize: '18px' }} />
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-on-surface)', fontFamily: 'var(--font-family-heading)' }}>5:00 PM</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { close(); navigate('/tournament'); }}
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
                >
                  See Tournament Details
                </button>
                <button
                  onClick={close}
                  className="btn btn-secondary"
                  style={{ flex: 1, minWidth: '100px', justifyContent: 'center' }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>

          <style>{`
            @keyframes announceBorderFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes announceFloat {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(8deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;
