import React from 'react';
import { FaPlayCircle, FaVideoSlash } from 'react-icons/fa';
import api from '../services/api';

const VideoPlayer = ({ video }) => {
  if (!video || !video.url) {
    return (
      <div className="glass-panel" style={{
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#64748b',
        border: '1px dashed rgba(255,255,255,0.1)'
      }}>
        <FaVideoSlash style={{ fontSize: '48px' }} />
        <p style={{ fontSize: '0.95rem' }}>No promotional video uploaded for this player.</p>
      </div>
    );
  }

  // Helper to parse YouTube & Vimeo video URLs into embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const isLocal = video.type === 'local';
  const videoUrl = isLocal ? (video.url.startsWith('http') ? video.url : `${api.defaults.baseURL || ''}${video.url}`) : getEmbedUrl(video.url);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '56.25%', // 16:9 Aspect Ratio
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: '#000000'
    }}>
      {isLocal ? (
        <video
          src={videoUrl}
          controls
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          preload="metadata"
        />
      ) : (
        <iframe
          src={videoUrl}
          title="Promo Video Player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
