import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTimes } from 'react-icons/fa';
import './Season3AnnouncementModal.css';

const Season3AnnouncementModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Expiration Date: July 30th, 2026 at 5:00 PM Pakistan Standard Time (UTC+5)
    // The popup will automatically stop showing after this time.
    const expiryDate = new Date('2026-07-30T17:00:00+05:00');
    const now = new Date();

    if (now > expiryDate) {
      setIsExpired(true);
    } else {
      // Small delay for better UX on load
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isExpired) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="announcement-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="announcement-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button className="announcement-close" onClick={() => setIsOpen(false)}>
              <FaTimes size={20} />
            </button>

            <div className="announcement-header">
              <FaTrophy size={48} className="announcement-icon" />
              <h2 className="announcement-title">SEASON 3 FINALS</h2>
              <p className="announcement-subtitle">The Ultimate Battle for Rank</p>
            </div>

            <div className="announcement-body">
              <p className="announcement-text">
                The moment we've all been waiting for is here! Step up to the table, prove your worth, 
                and secure your position on the leaderboard. This is the defining moment of the season. 
                Bring your best game!
              </p>

              <div className="announcement-details">
                <div className="detail-item">
                  <FaCalendarAlt size={18} className="detail-icon" />
                  <span>Thursday, 30th July</span>
                </div>
                <div className="detail-item">
                  <FaClock size={18} className="detail-icon" />
                  <span>5:00 PM (PKT)</span>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt size={18} className="detail-icon" />
                  <span>Staff Club Table Tennis Room</span>
                </div>
              </div>
            </div>

            <div className="announcement-footer">
              <button className="announcement-btn" onClick={() => setIsOpen(false)}>
                I'm Ready!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Season3AnnouncementModal;
