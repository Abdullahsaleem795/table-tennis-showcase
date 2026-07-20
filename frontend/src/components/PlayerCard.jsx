import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaMedal, FaChevronRight } from 'react-icons/fa';
import api from '../services/api';

const PlayerCard = ({ player }) => {
  const avatarUrl = player.avatarUrl ? (player.avatarUrl.startsWith('http') ? player.avatarUrl : `${api.defaults.baseURL || ''}${player.avatarUrl}`) : '';

  // Get style color for style badges
  const getStyleColor = (style) => {
    switch (style) {
      case 'Attack': return '#ef4444'; // Red
      case 'Offensive': return '#f59e0b'; // Amber
      case 'Defense': return '#10b981'; // Green
      case 'Defensive': return '#06b6d4'; // Cyan
      default: return '#3b82f6'; // Blue
    }
  };

  return (
    <motion.div
      className="glass-panel glass-panel-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Rank Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '20px',
        backgroundColor: player.rank === 1 ? 'rgba(212, 175, 55, 0.25)' : player.rank === 2 ? 'rgba(192, 192, 192, 0.25)' : player.rank === 3 ? 'rgba(205, 127, 50, 0.25)' : 'rgba(37, 99, 235, 0.2)',
        border: `1px solid ${player.rank === 1 ? '#d4af37' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : '#2563eb'}`,
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#ffffff',
        backdropFilter: 'blur(4px)'
      }}>
        <FaMedal style={{ color: player.rank === 1 ? '#d4af37' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : '#60a5fa' }} />
        Rank #{player.rank}
      </div>

      {/* Profile Photo Area */}
      <div style={{
        width: '100%',
        height: '210px',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={player.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <FaUser style={{ fontSize: '64px', color: '#1e293b' }} />
        )}
      </div>

      {/* Name and Style */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: "'Outfit', sans-serif"
        }}>
          {player.name}
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8'
          }}>
            {player.playingHand}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: `${getStyleColor(player.playingStyle)}15`,
            border: `1px solid ${getStyleColor(player.playingStyle)}40`,
            color: getStyleColor(player.playingStyle),
            fontWeight: 600
          }}>
            {player.playingStyle}
          </span>
          {player.country && (
            <span style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1'
            }}>
              {player.country}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Link
        to={`/player/${player._id || player.id}`}
        className="btn btn-primary"
        style={{
          width: '100%',
          marginTop: '16px',
          padding: '10px 16px',
          fontSize: '0.9rem',
          borderRadius: '10px',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        View Profile <FaChevronRight style={{ fontSize: '12px' }} />
      </Link>
    </motion.div>
  );
};

export default PlayerCard;
