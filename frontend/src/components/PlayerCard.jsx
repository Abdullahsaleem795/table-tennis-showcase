import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaMedal, FaChevronRight } from 'react-icons/fa';
import api from '../services/api';

const getAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = api.defaults.baseURL || '';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const PlayerCard = ({ player }) => {
  const avatarUrl = getAvatarUrl(player.avatarUrl);

  const getStyleColor = (style) => {
    switch (style) {
      case 'Attack': return 'var(--color-error)';
      case 'Offensive': return 'var(--color-primary)';
      case 'Defense': return 'var(--color-secondary)';
      case 'Defensive': return 'var(--color-tertiary)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <motion.div
      className="m3-card interactive"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
        borderRadius: 'var(--radius-md)'
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
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--color-surface-container-high)',
        border: `1px solid ${player.rank === 1 ? 'var(--color-tertiary)' : player.rank === 2 ? 'var(--color-outline)' : player.rank === 3 ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
        fontFamily: "var(--font-family-heading)",
        fontSize: 'var(--type-label)',
        fontWeight: 600,
        color: player.rank === 1 ? 'var(--color-tertiary)' : player.rank === 2 ? 'var(--color-on-surface-variant)' : player.rank === 3 ? 'var(--color-primary)' : 'var(--color-on-surface)',
        letterSpacing: '0.02em'
      }}>
        <FaMedal style={{ color: player.rank === 1 ? 'var(--color-tertiary)' : player.rank === 2 ? 'var(--color-outline)' : player.rank === 3 ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }} />
        RANK #{player.rank}
      </div>

      {/* Photo Container */}
      <div style={{
        width: '100%',
        height: '200px',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'var(--color-surface-container)',
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
              objectPosition: 'center 15%',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <FaUser style={{ fontSize: '56px', color: 'var(--color-surface-container-high)' }} />
        )}
      </div>

      {/* Metadata */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        <h3 style={{
          fontSize: 'var(--type-title)',
          fontWeight: 700,
          color: 'var(--color-on-surface)',
          fontFamily: "var(--font-family-heading)"
        }}>
          {player.name}
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: 'var(--type-label)' }}>
          <span style={{
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            color: 'var(--color-on-surface-variant)'
          }}>
            {player.playingHand}
          </span>
          <span style={{
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--color-surface)',
            border: `1px solid ${getStyleColor(player.playingStyle)}`,
            color: getStyleColor(player.playingStyle),
            fontWeight: 600
          }}>
            {player.playingStyle}
          </span>
          {player.country && (
            <span style={{
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-outline-variant)',
              color: 'var(--color-on-surface)'
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
          padding: '10px 14px',
          borderRadius: 'var(--radius-full)',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        View Profile <FaChevronRight style={{ fontSize: '10px' }} />
      </Link>
    </motion.div>
  );
};

export default PlayerCard;
