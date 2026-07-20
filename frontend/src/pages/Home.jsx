import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaTrophy, FaUserCheck, FaCamera, FaVideo, FaTableTennis, FaArrowRight } from 'react-icons/fa';
import api from '../services/api';
import PlayerCard from '../components/PlayerCard';
import { CardSkeleton } from '../components/Skeleton';

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ totalPlayers: 0, totalPhotos: 0, totalVideos: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, settingsRes, statsRes] = await Promise.all([
          api.get('/players'),
          api.get('/settings'),
          api.get('/players/stats')
        ]);
        
        setPlayers(playersRes.data);
        setSettings(settingsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/players?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Derived variables
  const websiteName = settings?.websiteName || "Championship Table Tennis Club";
  const aboutText = settings?.aboutContent || "Welcome to the ultimate Table Tennis Showcase. Discover our top-tier ranking players, learn about their custom equipment setups, and view training content.";
  const bannerUrl = settings?.bannerUrl ? (settings.bannerUrl.startsWith('http') ? settings.bannerUrl : `${api.defaults.baseURL || ''}${settings.bannerUrl}`) : '';
  
  // Featured players (ranks 1 to 3)
  const featuredPlayers = players.slice(0, 3);
  
  // Latest added player (by created date / order in database)
  const latestPlayer = players.length > 0 ? [...players].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

  // Extract a few gallery photos from all players
  const previewPhotos = [];
  players.forEach(p => {
    if (p.gallery && Array.isArray(p.gallery)) {
      p.gallery.forEach(img => {
        if (previewPhotos.length < 6) {
          previewPhotos.push({
            imgUrl: img.startsWith('http') ? img : `${api.defaults.baseURL || ''}${img}`,
            playerId: p._id || p.id,
            playerName: p.name
          });
        }
      });
    }
  });

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        background: bannerUrl ? `linear-gradient(rgba(6, 9, 19, 0.8), rgba(6, 9, 19, 0.95)), url(${bannerUrl}) no-repeat center center/cover` : 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(6, 9, 19, 1) 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              border: '2px solid #2563eb',
              boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)',
              color: '#3b82f6',
              fontSize: '36px'
            }}
          >
            <FaTableTennis />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              lineHeight: 1.1,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em'
            }}
          >
            <span className="text-gradient">Elite Table Tennis</span> <br />
            <span className="text-gradient-primary">Showcase Platform</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: '#94a3b8',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            {aboutText}
          </motion.p>

          {/* Instant Search Bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              width: '100%',
              maxWidth: '550px',
              margin: '20px auto 0',
              position: 'relative'
            }}
          >
            <input
              type="text"
              placeholder="Search players by name or rank (e.g. Rank 1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 24px 18px 56px',
                borderRadius: '50px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 20px rgba(37,99,235,0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.5)';
              }}
            />
            <FaSearch style={{
              position: 'absolute',
              left: '22px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '18px'
            }} />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '10px 20px',
                borderRadius: '40px',
                fontSize: '0.9rem'
              }}
            >
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* Featured Section */}
      <section className="section-padding container-width">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <span style={{ color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Championship Ranks</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Featured Players</h2>
          </div>
          <Link to="/players" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#2563eb'} onMouseLeave={(e)=>e.target.style.color='#0ea5e9'}>
            All Players <FaArrowRight />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {loading ? (
            [1, 2, 3].map(i => <CardSkeleton key={i} />)
          ) : featuredPlayers.length > 0 ? (
            featuredPlayers.map(player => (
              <PlayerCard key={player._id || player.id} player={player} />
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
              No player records found in the database.
            </div>
          )}
        </div>
      </section>

      {/* Latest Player & Club Stats Split Section */}
      <section style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="section-padding container-width" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px',
          alignItems: 'center'
        }}>
          {/* Latest Player */}
          <div>
            <span style={{ color: '#0ea5e9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>New Additions</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', marginBottom: '24px' }}>Latest Signed Player</h2>
            
            {loading ? (
              <CardSkeleton />
            ) : latestPlayer ? (
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img
                  src={latestPlayer.avatarUrl ? (latestPlayer.avatarUrl.startsWith('http') ? latestPlayer.avatarUrl : `${api.defaults.baseURL || ''}${latestPlayer.avatarUrl}`) : ''}
                  alt={latestPlayer.name}
                  style={{ width: '120px', height: '150px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' }}>RANK #{latestPlayer.rank}</span>
                  <h3 style={{ fontSize: '1.4rem' }}>{latestPlayer.name}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Style: {latestPlayer.playingStyle} • {latestPlayer.playingHand}</p>
                  <Link to={`/player/${latestPlayer._id || latestPlayer.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8' }}>No latest player registered.</div>
            )}
          </div>

          {/* Stats Counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <span style={{ color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Club Metrics</span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Platform Highlights</h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaTrophy style={{ fontSize: '24px', color: '#2563eb', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPlayers}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Players</span>
              </div>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaCamera style={{ fontSize: '24px', color: '#0ea5e9', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPhotos}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Photos</span>
              </div>
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaVideo style={{ fontSize: '24px', color: '#10b981', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalVideos}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Videos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {previewPhotos.length > 0 && (
        <section className="section-padding container-width">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#0ea5e9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Media Gallery</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Latest Action Highlights</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {previewPhotos.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel"
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/player/${photo.playerId}`)}
              >
                <img
                  src={photo.imgUrl}
                  alt={photo.playerName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onMouseEnter={(e)=>e.target.style.transform='scale(1.05)'}
                  onMouseLeave={(e)=>e.target.style.transform='scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {photo.playerName}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
