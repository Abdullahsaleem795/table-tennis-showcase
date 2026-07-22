import React from 'react';
import { FaHistory, FaBullseye, FaEye, FaAward, FaTableTennis } from 'react-icons/fa';

const About = () => {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '60px' }}>
      <div className="bg-glow bg-glow-1"></div>
      
      <div className="section-padding container-width">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Our Organization</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '4px', textTransform: 'uppercase' }} className="text-gradient">
            About the Club
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Learn more about our heritage, training philosophy, and our vision to cultivate elite table tennis athletes.
          </p>
        </div>

        {/* Dynamic Club intro grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center', marginBottom: '60px' }}>
          <div className="m3-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--color-primary)' }}>
              <FaTableTennis style={{ fontSize: '28px' }} />
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>Club Introduction</h2>
            </div>
            <p style={{ color: 'var(--color-on-surface)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '16px' }}>
              Founded by national champions, our Table Tennis Club provides a state-of-the-art facility designed for elite player coaching, multi-ball practice, and competitive league schedules.
            </p>
            <p style={{ color: 'var(--color-on-surface)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              We serve as an official training ground for professional table tennis athletes. We curate rankings, monitor hardware configurations, and record player development.
            </p>
          </div>
          
          {/* Nice visually balanced text display */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(14,165,233,0.05) 100%)',
            border: '1px solid rgba(37,99,235,0.15)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <FaAward style={{ fontSize: '48px', color: 'var(--color-tertiary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-on-surface)', marginBottom: '8px', fontFamily: "var(--font-family-heading)" }}>Certified Excellence</h3>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              "Cultivating speed, spin, and precision under pressure. Our coaches represent top-tier international talent committed to athletic success."
            </p>
          </div>
        </div>

        {/* History, Mission, Vision Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {/* History */}
          <div className="m3-card" style={{ padding: '24px' }}>
            <FaHistory style={{ fontSize: '32px', color: 'var(--color-tertiary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-on-surface)', marginBottom: '12px', fontFamily: "var(--font-family-heading)" }}>Our History</h3>
            <p style={{ color: 'var(--color-on-surface)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              Established in 2012, our club started as a local recreational spot and expanded into a premium regional academy hosting national qualifiers, specialized equipment clinics, and youth development camps.
            </p>
          </div>

          {/* Mission */}
          <div className="m3-card" style={{ padding: '24px' }}>
            <FaBullseye style={{ fontSize: '32px', color: 'var(--color-primary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-on-surface)', marginBottom: '12px', fontFamily: "var(--font-family-heading)" }}>Our Mission</h3>
            <p style={{ color: 'var(--color-on-surface)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              To support the sport of table tennis by providing training programs, promoting wellness, and offering our elite roster a professional showcase platform to gain sponsorship.
            </p>
          </div>

          {/* Vision */}
          <div className="m3-card" style={{ padding: '24px' }}>
            <FaEye style={{ fontSize: '32px', color: 'var(--color-secondary)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-on-surface)', marginBottom: '12px', fontFamily: "var(--font-family-heading)" }}>Our Vision</h3>
            <p style={{ color: 'var(--color-on-surface)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              To establish our academy as a recognized national center of excellence, training future Olympians and fostering a vibrant community of table tennis players.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
