import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTableTennis, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div className="bg-glow bg-glow-1"></div>

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        style={{
          fontSize: '80px',
          color: '#2563eb',
          marginBottom: '24px',
          filter: 'drop-shadow(0 0 20px rgba(37,99,235,0.4))'
        }}
      >
        <FaTableTennis />
      </motion.div>

      <h1 style={{
        fontSize: 'clamp(4rem, 10vw, 8rem)',
        fontFamily: "'Outfit', sans-serif",
        lineHeight: 1,
        fontWeight: 900,
        margin: 0
      }} className="text-gradient-primary">
        404
      </h1>

      <h2 style={{
        fontSize: '1.75rem',
        fontFamily: "'Outfit', sans-serif",
        color: '#ffffff',
        marginTop: '12px',
        marginBottom: '16px'
      }}>
        Out of Bounds!
      </h2>

      <p style={{
        color: '#94a3b8',
        fontSize: '1rem',
        maxWidth: '450px',
        lineHeight: '1.6',
        marginBottom: '32px'
      }}>
        The page you are looking for has been served out of court or doesn't exist. Let's return to play.
      </p>

      <Link to="/" className="btn btn-primary" style={{ gap: '10px' }}>
        <FaHome /> Back to Home Court
      </Link>
    </div>
  );
};

export default NotFound;
