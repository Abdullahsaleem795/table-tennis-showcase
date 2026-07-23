import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { FaMedal, FaExternalLinkAlt, FaTableTennis } from 'react-icons/fa';

const Rankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/players')
      .then((res) => {
        setPlayers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching rankings list:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Sort helper (redundant but safe)
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bg-glow bg-glow-2"></div>

      <div className="section-padding container-width">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Standings</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '4px', textTransform: 'uppercase' }} className="text-gradient">
            Official Club Rankings
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            The official leaderboards dynamically sorted by current ranking. Select a player to view detailed equipment specs and training videos.
          </p>
        </div>

        {/* Rankings Table */}
        {loading ? (
          <TableSkeleton />
        ) : sortedPlayers.length > 0 ? (
          <div className="m3-card" style={{ overflowX: 'auto', padding: '16px', borderRadius: '16px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Rank</th>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Player</th>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Playing Style</th>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Hand</th>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Current Blade</th>
                  <th style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                <style>{`
                  .ranking-row {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: background-color 0.2s;
                  }
                  .ranking-row:hover {
                    background-color: rgba(255, 255, 255, 0.02);
                  }
                `}</style>
                
                {sortedPlayers.map((player) => {
                  const avatar = player.avatarUrl ? (player.avatarUrl.startsWith('http') ? player.avatarUrl : `${api.defaults.baseURL || ''}${player.avatarUrl}`) : '';
                  const bladeModel = player.equipment?.blade?.model ? `${player.equipment.blade.brand} ${player.equipment.blade.model}` : 'Not Specified';
                  
                  return (
                    <tr key={player._id || player.id} className="ranking-row">
                      {/* Rank Indicator */}
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: player.rank === 1 ? 'rgba(212,175,55,0.15)' : player.rank === 2 ? 'rgba(192,192,192,0.15)' : player.rank === 3 ? 'rgba(205,127,50,0.15)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${player.rank === 1 ? 'var(--color-tertiary)' : player.rank === 2 ? 'var(--color-outline)' : player.rank === 3 ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                          color: player.rank === 1 ? 'var(--color-tertiary)' : player.rank === 2 ? 'var(--color-outline)' : player.rank === 3 ? 'var(--color-primary)' : 'var(--color-on-surface)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          fontFamily: "var(--font-family-heading)"
                        }}>
                          {player.rank}
                        </span>
                      </td>

                      {/* Photo + Name */}
                      <td style={{ padding: '16px' }}>
                        <Link to={`/player/${player._id || player.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {avatar ? (
                              <img src={avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                            ) : (
                              <span style={{ fontSize: '18px' }}>👤</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--color-on-surface)', fontSize: '0.95rem' }}>{player.name}</span>
                        </Link>
                      </td>

                      {/* Playing Style */}
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-tertiary)',
                          fontWeight: 500,
                          backgroundColor: 'rgba(14,165,233,0.08)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(14,165,233,0.15)'
                        }}>
                          {player.playingStyle}
                        </span>
                      </td>

                      {/* Playing Hand */}
                      <td style={{ padding: '16px', color: 'var(--color-on-surface)', fontSize: '0.9rem' }}>
                        {player.playingHand}
                      </td>

                      {/* Current Blade */}
                      <td style={{ padding: '16px', color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
                        {bladeModel}
                      </td>

                      {/* View Profile Action */}
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <Link
                          to={`/player/${player._id || player.id}`}
                          style={{
                            color: 'var(--color-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e)=>e.target.style.color='var(--color-tertiary)'}
                          onMouseLeave={(e)=>e.target.style.color='var(--color-primary)'}
                        >
                          View Profile <FaExternalLinkAlt style={{ fontSize: '10px' }} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="m3-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
            <FaTableTennis style={{ fontSize: '48px', color: 'var(--color-surface-container-high)', marginBottom: '12px' }} />
            <p>No rankings list records found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;
