import React, { useState, useContext, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserShield, FaSignOutAlt, FaTableTennis } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Error loading settings in navbar:", err));
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const siteName = settings?.websiteName || "Championship TT Club";
  const logoUrl = settings?.logoUrl ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${api.defaults.baseURL || ''}${settings.logoUrl}`) : '';

  return (
    <nav className="glass-panel glow-border" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderRadius: '0 0 16px 16px',
      margin: '0 16px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand / Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={closeMenu}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
          ) : (
            <FaTableTennis style={{ fontSize: '28px', color: '#2563eb' }} />
          )}
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #ffffff 40%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {siteName}
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <style>{`
            .nav-link-custom {
              font-family: 'Outfit', sans-serif;
              font-weight: 500;
              font-size: 0.95rem;
              color: #94a3b8;
              position: relative;
              padding: 6px 0;
              transition: color 0.3s;
            }
            .nav-link-custom:hover {
              color: #ffffff;
            }
            .nav-link-custom.active {
              color: #3b82f6;
            }
            .nav-link-custom.active::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: #2563eb;
              border-radius: 2px;
            }
            @media (max-width: 820px) {
              .desktop-menu { display: none !important; }
              .hamburger-btn { display: flex !important; }
            }
          `}</style>
          
          <NavLink to="/" className="nav-link-custom">Home</NavLink>
          <NavLink to="/players" className="nav-link-custom">Players</NavLink>
          <NavLink to="/rankings" className="nav-link-custom">Rankings</NavLink>
          <NavLink to="/about" className="nav-link-custom">About</NavLink>
          <NavLink to="/contact" className="nav-link-custom">Contact</NavLink>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
              <Link to="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <FaUserShield /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Admin Portal
            </Link>
          )}
        </div>

        {/* Mobile Toggler */}
        <button
          className="hamburger-btn"
          onClick={handleToggle}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#f8fafc',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'rgba(6, 9, 19, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 999
        }}>
          <NavLink to="/" className="nav-link-custom" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/players" className="nav-link-custom" onClick={closeMenu}>Players</NavLink>
          <NavLink to="/rankings" className="nav-link-custom" onClick={closeMenu}>Rankings</NavLink>
          <NavLink to="/about" className="nav-link-custom" onClick={closeMenu}>About</NavLink>
          <NavLink to="/contact" className="nav-link-custom" onClick={closeMenu}>Contact</NavLink>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <Link to="/admin" className="btn btn-secondary" onClick={closeMenu} style={{ width: '100%' }}>
                <FaUserShield /> Admin Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn btn-primary" onClick={closeMenu} style={{ width: '100%' }}>
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
