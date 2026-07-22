import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaMedal, FaTrophy, FaHandPaper, FaGlobe, FaChevronRight, FaTimes, FaCamera, FaCheckCircle } from 'react-icons/fa';
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

  // Poll state
  const [pollSettings, setPollSettings] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    // Load player details
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

    // Fetch poll settings
    api.get('/poll')
      .then(res => {
        setPollSettings(res.data);
      })
      .catch(err => console.error("Error loading poll status", err));

    // Fetch all players to calculate total votes
    api.get('/players')
      .then(res => {
        const total = res.data.reduce((sum, p) => sum + (parseInt(p.votes, 10) || 0), 0);
        setTotalVotes(total);
      })
      .catch(err => console.error("Error loading players for votes count", err));
  }, [id]);

  useEffect(() => {
    if (pollSettings) {
      const votedPollId = localStorage.getItem('voted_poll_id');
      if (votedPollId && votedPollId === pollSettings.pollId) {
        setHasVoted(true);
      } else {
        setHasVoted(false);
      }
    }

    if (!pollSettings || !pollSettings.endsAt || !pollSettings.active) {
      setTimeRemaining('');
      return;
    }
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(pollSettings.endsAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('Poll expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s left`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pollSettings]);

  const handleVote = async () => {
    if (hasVoted || voting) return;

    if (pollSettings && localStorage.getItem('voted_poll_id') === pollSettings.pollId) {
      setHasVoted(true);
      return;
    }

    setVoting(true);
    try {
      const res = await api.post(`/poll/vote/${id}`);
      setPlayer(res.data.player);
      setTotalVotes(prev => prev + 1);
      
      // Save poll specific vote cast token
      if (pollSettings && pollSettings.pollId) {
        localStorage.setItem('voted_poll_id', pollSettings.pollId);
      }
      setHasVoted(true);
    } catch (err) {
      alert(err.response?.data?.message || "Voting failed.");
    } finally {
      setVoting(false);
    }
  };

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
        <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '24px' }}>{error || 'This player profile does not exist.'}</p>
        <Link to="/players" className="btn btn-primary">Back to Players Roster</Link>
      </div>
    );
  }

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = api.defaults.baseURL || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const avatarUrl = getImageUrl(player.avatarUrl);
  const blade = player.equipment?.blade || { brand: '', model: '' };
  const forehand = player.equipment?.forehandRubber || { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 };
  const backhand = player.equipment?.backhandRubber || { brand: '', model: '', spongeThickness: '', speed: 0, spin: 0 };

  const renderMetric = (label, value) => {
    const percentage = Math.min(Math.max((value / 10) * 100, 0), 100);
    return (
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-on-surface)', marginBottom: '4px' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: 'var(--color-tertiary)' }}>{value}/10</span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-tertiary))', borderRadius: '3px' }} />
        </div>
      </div>
    );
  };

  const galleryImages = player.gallery ? player.gallery.map(img => getImageUrl(img)) : [];

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
        <Link to="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', marginBottom: '32px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='var(--color-on-surface)'} onMouseLeave={(e)=>e.target.style.color='var(--color-on-surface-variant)'}>
          <FaChevronLeft /> Back to Players
        </Link>

        {/* Profile Card Header */}
        <div className="m3-card" style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start', marginBottom: '40px' }}>
          {/* Large Photo */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '100px', color: 'var(--color-surface-container-high)' }}>👤</span>
            )}
            
            <div className="m3-card" style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '30px',
              border: '1px solid var(--stitch-primary)',
              boxShadow: '0 0 20px rgba(37,99,235,0.5)',
              color: 'var(--color-on-surface)',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: "var(--font-family-heading)"
            }}>
              <FaMedal style={{ color: 'var(--color-primary)' }} />
              RANK #{player.rank}
            </div>
          </div>

          {/* Core Info & Biography */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <span style={{ color: 'var(--color-tertiary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Player Profile
              </span>
              <h1 style={{ fontSize: '2.5rem', fontFamily: "var(--font-family-heading)", marginTop: '4px' }}>
                {player.name}
              </h1>
            </div>

            {/* Quick Metadata list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <div className="m3-card" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <FaHandPaper style={{ color: 'var(--color-primary)' }} />
                <span>Hand: <strong>{player.playingHand}</strong></span>
              </div>
              <div className="m3-card" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontSize: '18px' }}>🏓</span>
                <span>Style: <strong>{player.playingStyle}</strong></span>
              </div>
              {player.country && (
                <div className="m3-card" style={{ padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <FaGlobe style={{ color: 'var(--color-secondary)' }} />
                  <span>Country: <strong>{player.country}</strong></span>
                </div>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontFamily: "var(--font-family-heading)", color: 'var(--color-on-surface)' }}>Biography</h3>
              <p style={{ color: 'var(--color-on-surface)', lineHeight: '1.7', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {player.biography || "No biography details available."}
              </p>
            </div>

            {player.achievements && player.achievements.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontFamily: "var(--font-family-heading)", color: 'var(--color-on-surface)' }}>Achievements</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {player.achievements.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
                      <FaTrophy style={{ color: 'var(--color-tertiary)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* WHATSAPP-STYLE POLL VOTING BOX */}
            {pollSettings && pollSettings.active && (
              <div className="m3-card" style={{
                border: '1px solid var(--stitch-primary)',
                padding: '20px',
                marginTop: '12px',
                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--color-on-surface)', fontWeight: 700, margin: 0, fontFamily: "var(--font-family-heading)" }}>
                    🏓 Fan Favorite Poll
                  </h4>
                  {timeRemaining && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', fontWeight: 600 }}>
                      {timeRemaining}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-on-surface)', marginBottom: '6px' }}>
                    <span>Vote for {player.name}</span>
                    <span style={{ fontWeight: 700 }}>
                      {player.votes || 0} {player.votes === 1 ? 'vote' : 'votes'} ({totalVotes > 0 ? Math.round(((player.votes || 0) / totalVotes) * 100) : 0}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${totalVotes > 0 ? ((player.votes || 0) / totalVotes) * 100 : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                <button
                  disabled={hasVoted || voting}
                  onClick={handleVote}
                  className={`btn ${hasVoted ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  {hasVoted ? '✓ You have already voted' : (voting ? 'Submitting...' : `Vote for ${player.name}`)}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Equipment Specifications Grid */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "var(--font-family-heading)", textTransform: 'uppercase' }} className="text-gradient">
            Equipment Configuration
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {/* Blade Sheet */}
            <div className="m3-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🪵</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-on-surface)' }}>Blade</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Foundation Layer</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{blade.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{blade.model || 'Not Specified'}</span>
                </li>
              </ul>
            </div>

            {/* Forehand Rubber */}
            <div className="m3-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>🔴</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-on-surface)' }}>Forehand Rubber</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Primary Attacking Surface</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{forehand.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{forehand.model || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Sponge Thickness:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{forehand.spongeThickness || 'Not Specified'}</span>
                </li>
              </ul>
              {renderMetric("Speed Rating", forehand.speed)}
              {renderMetric("Spin Rating", forehand.spin)}
            </div>

            {/* Backhand Rubber */}
            <div className="m3-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>⚫</span>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-on-surface)' }}>Backhand Rubber</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Defensive/Control Surface</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Brand:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{backhand.brand || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Model:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{backhand.model || 'Not Specified'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-on-surface-variant)' }}>Sponge Thickness:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{backhand.spongeThickness || 'Not Specified'}</span>
                </li>
              </ul>
              {renderMetric("Speed Rating", backhand.speed)}
              {renderMetric("Spin Rating", backhand.spin)}
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "var(--font-family-heading)", textTransform: 'uppercase' }} className="text-gradient">
            Promotional Action Video
          </h2>
          <VideoPlayer video={player.promoVideo} />
        </div>

        {/* Photo Gallery Grid */}
        {galleryImages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '24px', fontFamily: "var(--font-family-heading)", textTransform: 'uppercase' }} className="text-gradient">
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
                  className="m3-card"
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
                  <div style={{ position: 'absolute', right: '10px', top: '10px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '50%', color: 'var(--color-on-surface)', display: 'flex' }}>
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
                color: 'var(--color-on-surface)',
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
                  color: 'var(--color-on-surface)',
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
                  color: 'var(--color-on-surface)',
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
            <div style={{ color: 'var(--color-on-surface-variant)', marginTop: '16px', fontSize: '0.9rem', fontFamily: "var(--font-family-heading)" }}>
              Image {lightboxIndex + 1} of {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayerProfile;
