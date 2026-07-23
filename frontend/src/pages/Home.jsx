import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaTrophy, FaUserCheck, FaCamera, FaVideo, FaTableTennis, FaArrowRight, FaAward } from 'react-icons/fa';
import api from '../services/api';
import PlayerCard from '../components/PlayerCard';
import { CardSkeleton } from '../components/Skeleton';

const Hero3D = lazy(() => import('../components/Hero3D'));

const Home = () => {
  const [players, setPlayers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ totalPlayers: 0, totalPhotos: 0, totalVideos: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Poll State
  const [pollSettings, setPollSettings] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, settingsRes, statsRes, pollRes] = await Promise.all([
          api.get('/players'),
          api.get('/settings'),
          api.get('/players/stats'),
          api.get('/poll')
        ]);
        
        setPlayers(playersRes.data);
        setSettings(settingsRes.data);
        setStats(statsRes.data);
        setPollSettings(pollRes.data);
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

  const websiteName = settings?.websiteName || "Championship Table Tennis Club";
  const aboutText = settings?.aboutContent || "Welcome to the ultimate Table Tennis Showcase. Discover our top-tier ranking players, learn about their custom equipment setups, and view training content.";
  const bannerUrl = settings?.bannerUrl ? (settings.bannerUrl.startsWith('http') ? settings.bannerUrl : `${api.defaults.baseURL || ''}${settings.bannerUrl}`) : '';
  
  const featuredPlayers = players.slice(0, 3);
  const latestPlayer = players.length > 0 ? [...players].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

  // Compute voted players standings
  const votedStandings = [...players]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 3); // top 3

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
        padding: '80px 24px',
        backgroundColor: 'var(--color-surface-container)',
        overflow: 'hidden'
      }}>
        <div className="container-width" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
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
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-primary)',
                fontSize: '36px'
              }}
            >
              <FaTableTennis />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: "var(--font-family-heading)", letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--color-on-surface)' }}
            >
              {websiteName}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'var(--color-on-surface-variant)', fontSize: '1.1rem', lineHeight: 1.6 }}
            >
              {aboutText}
            </motion.p>

            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                display: 'flex',
                width: '100%',
                maxWidth: '560px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '50px',
                padding: '6px 6px 6px 24px',
                alignItems: 'center',
                gap: '12px',
                boxShadow: 'var(--elevation-1)'
              }}
            >
              <FaSearch style={{ color: 'var(--color-on-surface-variant)', fontSize: '18px' }} />
              <input
                type="text"
                placeholder="Search players by name, style, rank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flexGrow: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-on-surface)',
                  fontSize: '1rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '30px' }}>
                Search
              </button>
            </motion.form>
          </div>
          
          {/* 3D Reactive Hero Asset */}
          <div style={{ height: '500px', width: '100%', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-outline)' }}>
                <span>Loading interactive scene...</span>
              </div>
            }>
              <Hero3D />
            </Suspense>
          </div>
        </div>
      </section>

      {/* DYNAMIC POLL BANNER */}
      {pollSettings && pollSettings.active && (
        <div className="m3-card" style={{
          padding: '16px 24px',
          margin: '32px auto 0',
          maxWidth: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid var(--stitch-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🗳️</span>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-on-surface)', fontWeight: 700, margin: 0, fontFamily: "var(--font-family-heading)" }}>
                Fan Favorite Poll is Active!
              </h3>
              <p style={{ color: 'var(--color-on-surface)', fontSize: '0.85rem', margin: '2px 0 0' }}>
                Support your champion by casting your vote on their profile page.
              </p>
            </div>
          </div>
          <Link to="/players" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Vote Now
          </Link>
        </div>
      )}

      {/* PUBLISHED POLL RESULTS PODIUM SECTION */}
      {pollSettings && pollSettings.published && votedStandings.length > 0 && (
        <section className="section-padding container-width">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--color-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
              🎖️ Fan Awards Standings
            </span>
            <h2 style={{ fontSize: '2.2rem', marginTop: '4px', fontFamily: "var(--font-family-heading)" }}>
              FAN FAVORITE POLL STANDINGS
            </h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', marginTop: '6px' }}>
              The results are in! Here are the top voted champions chosen by our fan community.
            </p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '16px',
            flexWrap: 'wrap',
            margin: '40px auto 0',
            maxWidth: '800px',
            minHeight: '260px'
          }}>
            {/* 2nd Place (Silver) */}
            {votedStandings[1] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '160px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-on-surface)', fontWeight: 700 }}>2nd Place</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>{votedStandings[1].votes || 0} votes</span>
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: 'var(--color-outline)',
                  borderTop: '4px solid var(--color-on-surface-variant)',
                  borderRadius: '12px 12px 0 0',
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-on-surface)' }}>{votedStandings[1].name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface)', marginTop: '4px', marginBottom: '12px' }}>Rank #{votedStandings[1].rank}</div>
                  <Link to={`/player/${votedStandings[1]._id || votedStandings[1].id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    View & Vote
                  </Link>
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {votedStandings[0] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '180px', transform: 'scale(1.08)' }}>
                <FaAward style={{ color: 'var(--color-tertiary)', fontSize: '32px', marginBottom: '4px' }} />
                <span style={{ fontSize: '1.05rem', color: 'var(--color-tertiary)', fontWeight: 800 }}>🏆 CHAMPION</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-on-surface)', fontWeight: 600 }}>{votedStandings[0].votes || 0} votes</span>
                <div style={{
                  width: '100%',
                  height: '210px',
                  backgroundColor: 'var(--color-surface-container-high)',
                  borderTop: '6px solid var(--color-tertiary)',
                  borderRadius: '12px 12px 0 0',
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(212, 175, 55, 0.2)'
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>{votedStandings[0].name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface)', marginTop: '4px', marginBottom: '12px' }}>Rank #{votedStandings[0].rank}</div>
                  <Link to={`/player/${votedStandings[0]._id || votedStandings[0].id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    View & Vote
                  </Link>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {votedStandings[2] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '160px' }}>
                <span style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 700 }}>3rd Place</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>{votedStandings[2].votes || 0} votes</span>
                <div style={{
                  width: '100%',
                  height: '150px',
                  backgroundColor: 'var(--color-surface-container-high)',
                  borderTop: '4px solid var(--color-primary)',
                  borderRadius: '12px 12px 0 0',
                  marginTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-on-surface)' }}>{votedStandings[2].name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface)', marginTop: '4px', marginBottom: '12px' }}>Rank #{votedStandings[2].rank}</div>
                  <Link to={`/player/${votedStandings[2]._id || votedStandings[2].id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    View & Vote
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Players Grid */}
      <section className="section-padding container-width">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Elite Roster</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Top Ranking Champions</h2>
          </div>
          <Link to="/players" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            View Full Roster <FaArrowRight />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {loading ? (
            Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : featuredPlayers.length > 0 ? (
            featuredPlayers.map((player) => (
              <PlayerCard key={player._id || player.id} player={player} />
            ))
          ) : (
            <div style={{ color: 'var(--color-on-surface-variant)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
              No table tennis players registered yet.
            </div>
          )}
        </div>
      </section>

      {/* Spotlight and Stats Section */}
      <section className="section-padding" style={{ position: 'relative' }}>
        <div className="container-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {/* Spotlight card */}
          <div>
            <span style={{ color: 'var(--color-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>New Additions</span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px', marginBottom: '24px' }}>Latest Signed Player</h2>
            
            {loading ? (
              <CardSkeleton />
            ) : latestPlayer ? (
              <div className="m3-card interactive" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img
                  src={latestPlayer.avatarUrl ? (latestPlayer.avatarUrl.startsWith('http') ? latestPlayer.avatarUrl : `${api.defaults.baseURL || ''}${latestPlayer.avatarUrl}`) : ''}
                  alt={latestPlayer.name}
                  style={{ width: '120px', height: '150px', borderRadius: '12px', objectFit: 'cover', objectPosition: 'top center' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem' }}>RANK #{latestPlayer.rank}</span>
                  <h3 style={{ fontSize: '1.4rem' }}>{latestPlayer.name}</h3>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem' }}>Style: {latestPlayer.playingStyle} • {latestPlayer.playingHand}</p>
                  <Link to={`/player/${latestPlayer._id || latestPlayer.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'fit-content' }}>
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-on-surface-variant)' }}>No latest player registered.</div>
            )}
          </div>

          {/* Stats Counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <span style={{ color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Club Metrics</span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Platform Highlights</h2>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }}>
              <div className="m3-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaTrophy style={{ fontSize: '24px', color: 'var(--color-primary)', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPlayers}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Players</span>
              </div>
              <div className="m3-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaCamera style={{ fontSize: '24px', color: 'var(--color-tertiary)', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPhotos}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Photos</span>
              </div>
              <div className="m3-card" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <FaVideo style={{ fontSize: '24px', color: 'var(--color-secondary)', margin: '0 auto' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalVideos}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Videos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {previewPhotos.length > 0 && (
        <section className="section-padding container-width">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--color-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Media Gallery</span>
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
                className="m3-card interactive"
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', transition: 'transform 0.3s' }}
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
                  color: 'var(--color-on-surface)',
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
