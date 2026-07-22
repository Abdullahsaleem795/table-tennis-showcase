import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaRandom, FaCheckCircle, FaUser } from 'react-icons/fa';
import api from '../services/api';

const Tournament = () => {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournament();
  }, []);

  const fetchTournament = async () => {
    try {
      const res = await api.get('/tournament');
      setTournament(res.data);
    } catch (err) {
      console.error("Error fetching tournament:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-padding container-width" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="skeleton" style={{ height: '40px', width: '300px', margin: '0 auto 20px' }}></div>
        <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
      </div>
    );
  }

  const isNotStarted = !tournament || tournament.status === 'not_started' || !tournament.rounds || tournament.rounds.length === 0;

  return (
    <div className="section-padding container-width" style={{ maxWidth: '1200px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface-container-high)',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}>
          <FaTrophy /> Single-Elimination Knockout
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>
          TOURNAMENT BRACKET
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', maxWidth: '600px', margin: '8px auto 0' }}>
          Follow live matches, randomized match-ups, and advancing players from the First Round to the Final!
        </p>
      </div>

      {/* Champion Banner if Completed */}
      {tournament?.status === 'completed' && tournament?.champion && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="m3-card"
          style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#111827',
            border: '2px solid var(--color-tertiary)',
            marginBottom: '40px',
            borderRadius: '16px'
          }}
        >
          <FaTrophy style={{ fontSize: '56px', color: 'var(--color-tertiary)', marginBottom: '12px' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-tertiary)', fontFamily: "var(--font-family-heading)" }}>
            TOURNAMENT CHAMPION!
          </h2>
          <h3 style={{ fontSize: '2.2rem', color: 'var(--color-on-surface)', margin: '8px 0' }}>
            🏆 {tournament.champion.name}
          </h3>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>
            {tournament.champion.playingStyle} • {tournament.champion.playingHand}
          </p>
        </motion.div>
      )}

      {isNotStarted ? (
        <div className="m3-card" style={{ padding: '48px', textAlign: 'center' }}>
          <FaRandom style={{ fontSize: '48px', color: 'var(--color-on-surface-variant)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', color: 'var(--color-on-surface)', marginBottom: '8px' }}>
            No Active Tournament Right Now
          </h3>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            The administrator has not generated the matches yet. Check back soon for live bracket updates!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${tournament.rounds?.length || 1}, minmax(240px, 1fr))`,
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '24px'
        }}>
          {tournament.rounds?.map((round, rIdx) => (
            <div key={round.roundNumber} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Round Header */}
              <div style={{
                textAlign: 'center',
                padding: '10px',
                backgroundColor: '#111827',
                borderRadius: '6px',
                border: '1px solid var(--color-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                fontFamily: "var(--font-family-heading)",
                color: 'var(--color-on-surface)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {round.roundName}
              </div>

              {/* Match List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                height: '100%',
                gap: '16px'
              }}>
                {round.matches?.map((m, mIdx) => {
                  const isP1Winner = m.winner && (m.winner._id === m.player1?._id || m.winner.id === m.player1?.id);
                  const isP2Winner = m.winner && (m.winner._id === m.player2?._id || m.winner.id === m.player2?.id);

                  return (
                    <div key={m.matchId || mIdx} className="m3-card" style={{ padding: '14px', position: 'relative' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                        Match #{mIdx + 1}
                      </div>

                      {/* Player 1 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: isP1Winner ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-container)',
                        borderRadius: '4px',
                        border: isP1Winner ? '1px solid var(--color-secondary)' : '1px solid rgba(255,255,255,0.06)',
                        marginBottom: '6px'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: m.player1 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>
                          {m.player1 ? m.player1.name : 'TBD'}
                        </span>
                        {isP1Winner && <FaCheckCircle style={{ color: 'var(--color-secondary)', fontSize: '14px' }} />}
                      </div>

                      {/* VS Divider */}
                      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-on-surface-variant)', margin: '2px 0', fontWeight: 800 }}>VS</div>

                      {/* Player 2 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        backgroundColor: isP2Winner ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-container)',
                        borderRadius: '4px',
                        border: isP2Winner ? '1px solid var(--color-secondary)' : '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: m.player2 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)' }}>
                          {m.player2 ? m.player2.name : (m.player1 && !m.player2 ? 'BYE (Advanced)' : 'TBD')}
                        </span>
                        {isP2Winner && <FaCheckCircle style={{ color: 'var(--color-secondary)', fontSize: '14px' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tournament;
