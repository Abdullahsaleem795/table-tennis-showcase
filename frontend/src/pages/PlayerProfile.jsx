import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaMedal, FaTrophy, FaHandPaper, FaGlobe, FaChevronRight, FaTimes, FaCamera } from 'react-icons/fa';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import { ProfileSkeleton } from '../components/Skeleton';

const PlayerProfile = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    api.get(`/players/${id}`)
      .then((res) => {
        setPlayer(res.data);
      })
      .catch((err) => {
        console.error("Error loading player profile:", err);
        setError("Unable to find the requested player profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="section-padding container-width">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="section-padding container-width" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Profile Not Found</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{error || 'This player profile does not exist.'}</p>
        <Link to="/players" className="btn btn-primary">Back to Players Roster</Link>
      </div>
    );
  }

  const avatarUrl = player.avatarUrl ? (player.avatarUrl.startsWith('http') ? player.avatarUrl : `${api.defaults.baseURL || ''}${player.avatarUrl}`) : '';

  // Parse equipment properties
  const blade = player.equipment?.blade || { brand: '', model: '' };
  const forehand = player.equipment?.forehandRubber || { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 };
  const backhand = player.equipment?.backhandRubber || { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 };

  // Render Metric Bar for speed/spin
  const renderMetric = (label, value) => {
    const percentage = Math.min(Math.max((value / 10) * 100, 0), 100);
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{value}/10</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #0ea5e9)', borderRadius: '3px' }} />
        </div>
      </div>
    );
  };

  // Gallery images with full API base URL
  const galleryImages = player.gallery ? player.gallery.map(img => img.startsWith('http') ? img : `${api.defaults.baseURL || ''}${img}`) : [];

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '80px' }}>
      <div className="bg-glow bg-glow-1"></div>

      <div className="section-padding container-width">
        {/* Back Link */}
        <Link to="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '32px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>
          <FaChevronLeft /> Back to Players
        </Link>

        {/* Profile Card Header */}
        <div className="glass-panel" style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start', marginBottom: '40px' }}>
          {/* Large Photo */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '100px', color: '#1e293b' }}>👤</span>
            )}
            
            {/* Rank ribbon badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '30px',
              backgroundColor: 'rgba(6, 9, 19, 0.8)',
              border: '1px solid #2563eb',
              boxShadow: '0 0 15px rgba(37,99,235,0.4)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              backdropFilter: 'blur(8px)'
            }}>
              <FaMedal style={{ color: '#3b82f6' }} />
              RANK #{player.rank}
            </div>
          </div>

          {/* Core Info & Biography */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Player Profile
              </span>
              <h1 style={{ fontSize: '2.5rem', fontFamily: "'Outfit', sans-serif", marginTop: '4px' }}>
                {player.name}
              </h1>
            </div>

            {/* Quick Metadata list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FaHandPaper style={{ color: '#2563eb' }} />
                <span>Hand: <strong>{player.playingHand}</strong></span>
              </div>
              <div className="glass-panel" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '18px' }}>🏓</span>
                <span>Style: <strong>{player.playingStyle}</strong></span>
              </div>
              {player.country && (
                <div className="glass-panel" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <FaGlobe style={{ color: '#10b981' }} />
                  <span>Country: <strong>{player.country}</strong></span>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: "'Outfit', sans-serif", color: '#ffffff' }}>Biography</h3>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {player.biography || "No biography details available."}
              </p>
            </div>

            {player.achievements && player.achievements.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontFamily: "'Outfit', sans-serif", color: '#ffffff' }}>Achievements</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {player.achievements.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                      <FaTrophy style={{ color: '#eab308', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Specifications Grid */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' }} className="text-gradient">
            Equipment Configuration
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {/* Blade Sheet */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🪵</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Blade</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Foundation Layer</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{blade.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{blade.model || 'Not Specified'}</span>
                </li>
              </ul>
            </div>

            {/* Forehand Rubber */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🔴</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Forehand Rubber</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Primary Attacking Surface</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{forehand.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{forehand.model || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Sponge Thickness:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{forehand.spongeThickness || 'Not Specified'}</span>
                </li>
              </ul>
              {renderMetric("Speed Rating", forehand.speed)}
              {renderMetric("Spin Rating", forehand.spin)}
            </div>

            {/* Backhand Rubber */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>⚫</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Backhand Rubber</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Defensive/Control Surface</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{backhand.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{backhand.model || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Sponge Thickness:</span>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{backhand.spongeThickness || 'Not Specified'}</span>
                </li>
              </ul>
              {renderMetric("Speed Rating", backhand.speed)}
              {renderMetric("Spin Rating", backhand.spin)}
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' }} className="text-gradient">
            Promotional Action Video
          </h2>
          <VideoPlayer video={player.promoVideo} />
        </div>

        {/* Photo Gallery Grid */}
        {galleryImages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase' }} className="text-gradient">
              Photo Gallery
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '20px'
            }}>
              {galleryImages.map((image, idx) => (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    height: '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img src={image} alt={`Gallery item ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} onMouseEnter={(e)=>e.target.style.transform='scale(1.05)'} onMouseLeave={(e)=>e.target.style.transform='scale(1)'} />
                  <div style={{ position: 'absolute', right: '10px', top: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '50%', color: '#ffffff', display: 'flex' }}>
                    <FaCamera style={{ fontSize: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(5,7,14,0.95)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              <FaTimes />
            </button>

            {/* Slider Content */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '900px', height: '80vh', justifyContent: 'space-between' }}>
              {/* Prev Button */}
              <button
                onClick={handlePrevLightbox}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                <FaChevronLeft />
              </button>

              {/* Main Image */}
              <div style={{ flexGrow: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={galleryImages[lightboxIndex]}
                  alt="Gallery zoom"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
                  }}
                />
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextLightbox}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Index Counter */}
            <div style={{ color: '#94a3b8', marginTop: '16px', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif" }}>
              Image {lightboxIndex + 1} of {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerProfile;
