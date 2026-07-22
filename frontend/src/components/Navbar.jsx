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
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-outline-variant)',
      boxShadow: 'var(--elevation-1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={closeMenu}>
          <span style={{
            fontFamily: "var(--font-family-heading)",
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}>
            {siteName}
          </span>
        </Link>

        {/* Links */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <style>{`
            .nav-link-custom {
              font-family: var(--font-family-body);
              font-weight: 500;
              font-size: var(--type-label);
              color: var(--color-on-surface-variant);
              position: relative;
              padding: 6px 0;
              transition: var(--motion-standard);
            }
            .nav-link-custom:hover {
              color: var(--color-on-surface);
            }
            .nav-link-custom.active {
              color: var(--color-primary);
            }
            .nav-link-custom.active::after {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: var(--color-primary);
            }
            @media (max-width: 820px) {
              .desktop-menu { display: none !important; }
              .hamburger-btn { display: flex !important; }
            }
          `}</style>
          
          <NavLink to="/" className="nav-link-custom">Home</NavLink>
          <NavLink to="/players" className="nav-link-custom">Players</NavLink>
          <NavLink to="/rankings" className="nav-link-custom">Rankings</NavLink>
          <NavLink to="/tournament" className="nav-link-custom">Tournament</NavLink>
          <NavLink to="/about" className="nav-link-custom">About</NavLink>
          <NavLink to="/contact" className="nav-link-custom">Contact</NavLink>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
              <Link to="/admin" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <FaUserShield /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
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
            color: 'var(--color-on-surface)',
            fontSize: '22px',
            cursor: 'pointer'
          }}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="m3-card" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 999
        }}>
          <NavLink to="/" className="nav-link-custom" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/players" className="nav-link-custom" onClick={closeMenu}>Players</NavLink>
          <NavLink to="/rankings" className="nav-link-custom" onClick={closeMenu}>Rankings</NavLink>
          <NavLink to="/tournament" className="nav-link-custom" onClick={closeMenu}>Tournament</NavLink>
          <NavLink to="/about" className="nav-link-custom" onClick={closeMenu}>About</NavLink>
          <NavLink to="/contact" className="nav-link-custom" onClick={closeMenu}>Contact</NavLink>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
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
