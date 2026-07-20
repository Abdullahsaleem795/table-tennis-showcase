import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTableTennis } from 'react-icons/fa';
import api from '../services/api';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Error fetching settings in footer:", err));
  }, []);

  const contactEmail = settings?.contactEmail || "info@championshiptt.com";
  const contactPhone = settings?.contactPhone || "+1 (555) 123-4567";
  const location = settings?.location || "123 Ping Pong Way, Sports City";
  const facebook = settings?.socialLinks?.facebook || "https://facebook.com";
  const instagram = settings?.socialLinks?.instagram || "https://instagram.com";
  const youtube = settings?.socialLinks?.youtube || "https://youtube.com";
  const footerText = settings?.footerText || "© 2026 Championship Table Tennis Club. All rights reserved.";

  return (
    <footer style={{
      backgroundColor: 'rgba(5, 7, 14, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '60px 24px 30px',
      marginTop: 'auto',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* About Club */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaTableTennis style={{ fontSize: '24px', color: '#2563eb' }} />
            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              color: '#ffffff'
            }}>
              {settings?.websiteName || "Championship TT Club"}
            </h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {settings?.aboutContent?.substring(0, 160) || "Welcome to our premier table tennis showcase."}...
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '20px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#2563eb'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>
                <FaFacebook />
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '20px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ea4c89'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>
                <FaInstagram />
              </a>
            )}
            {youtube && (
              <a href={youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '20px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ef4444'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>
                <FaYoutube />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1rem',
            color: '#ffffff',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li>
              <Link to="/" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>Home</Link>
            </li>
            <li>
              <Link to="/players" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>Players Showcase</Link>
            </li>
            <li>
              <Link to="/rankings" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>Player Rankings</Link>
            </li>
            <li>
              <Link to="/about" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>About Club</Link>
            </li>
            <li>
              <Link to="/contact" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>Contact Form</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1rem',
            color: '#ffffff',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Get in touch
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: '#94a3b8' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <FaMapMarkerAlt style={{ color: '#2563eb', marginTop: '3px', flexShrink: 0 }} />
              <span>{location}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaPhone style={{ color: '#2563eb', flexShrink: 0 }} />
              <span>{contactPhone}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaEnvelope style={{ color: '#2563eb', flexShrink: 0 }} />
              <a href={`mailto:${contactEmail}`} style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>{contactEmail}</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '30px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <span>{footerText}</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/admin/login" style={{ color: '#64748b', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#64748b'}>Admin Login</Link>
          <span style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to Top ↑</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
