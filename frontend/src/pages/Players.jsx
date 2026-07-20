import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import PlayerCard from '../components/PlayerCard';
import { CardSkeleton } from '../components/Skeleton';
import { FaSearch, FaFilter, FaTableTennis } from 'react-icons/fa';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All');
  
  const location = useLocation();

  useEffect(() => {
    // Check if search query was passed from Home page search bar
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }

    api.get('/players')
      .then((res) => {
        setPlayers(res.data);
      })
      .catch((err) => {
        console.error("Error loading players:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location]);

  // Styles list for filter tab
  const stylesList = ['All', 'Attack', 'Offensive', 'Defense', 'Defensive', 'All Round'];

  // Filter and Search logic
  const filteredPlayers = players.filter(player => {
    const nameMatch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Support searching by rank number directly (e.g. "1" or "rank 1")
    const cleanedSearch = searchQuery.toLowerCase().replace('rank', '').trim();
    const rankMatch = player.rank.toString() === cleanedSearch;

    const matchesSearch = nameMatch || rankMatch;
    const matchesStyle = selectedStyle === 'All' || player.playingStyle === selectedStyle;

    return matchesSearch && matchesStyle;
  });

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-glow bg-glow-1"></div>
      
      <div className="section-padding container-width">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Showcase Roster</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '4px', textTransform: 'uppercase' }} className="text-gradient">
            Meet Our Champions
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Browse and search our roster of top-tier table tennis competitors. Filter by style or search directly by rank.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
            <input
              type="text"
              placeholder="Search by name or rank (e.g. 1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px', borderRadius: '10px' }}
            />
            <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          </div>

          {/* Style Filter Tabs */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            {stylesList.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                style={{
                  background: selectedStyle === style ? 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' : 'none',
                  border: 'none',
                  color: selectedStyle === style ? '#ffffff' : '#94a3b8',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.2s'
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {loading ? (
            [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
          ) : filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <PlayerCard key={player._id || player.id} player={player} />
            ))
          ) : (
            <div className="glass-panel" style={{
              gridColumn: '1/-1',
              padding: '60px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}>
              <FaTableTennis style={{ fontSize: '48px', color: '#475569' }} />
              <h3 style={{ fontSize: '1.25rem' }}>No Players Found</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px' }}>
                We couldn't find any players matching "{searchQuery}" with the "{selectedStyle}" style. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Players;
