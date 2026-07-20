import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import {
  FaUserShield, FaUsers, FaImage, FaVideo, FaCog, FaLock, FaSignOutAlt,
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaUpload, FaGlobe, FaTrophy, FaHandPaper, FaKey
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab State: 'overview', 'players', 'settings', 'account'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({ totalPlayers: 0, totalPhotos: 0, totalVideos: 0 });
  const [settings, setSettings] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Player Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null); // null means adding a new player
  const [formTab, setFormTab] = useState('basic'); // 'basic', 'equipment', 'media'

  // Player Form Fields State
  const [name, setName] = useState('');
  const [rank, setRank] = useState('');
  const [playingStyle, setPlayingStyle] = useState('Attack');
  const [playingHand, setPlayingHand] = useState('Right Hand');
  const [biography, setBiography] = useState('');
  const [country, setCountry] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  
  // Equipment Form Fields
  const [bladeBrand, setBladeBrand] = useState('');
  const [bladeModel, setBladeModel] = useState('');
  
  const [forehandBrand, setForehandBrand] = useState('');
  const [forehandModel, setForehandModel] = useState('');
  const [forehandSponge, setForehandSponge] = useState('');
  const [forehandSpeed, setForehandSpeed] = useState(0);
  const [forehandSpin, setForehandSpin] = useState(0);

  const [backhandBrand, setBackhandBrand] = useState('');
  const [backhandModel, setBackhandModel] = useState('');
  const [backhandSponge, setBackhandSponge] = useState('');
  const [backhandSpeed, setBackhandSpeed] = useState(0);
  const [backhandSpin, setBackhandSpin] = useState(0);

  // Upload/File fields
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [deleteAvatar, setDeleteAvatar] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoType, setVideoType] = useState('external'); // 'local' or 'external'
  const [deleteVideo, setDeleteVideo] = useState(false);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  
  // Settings Form State
  const [websiteName, setWebsiteName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [deleteLogo, setDeleteLogo] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [deleteBanner, setDeleteBanner] = useState(false);
  const [aboutContent, setAboutContent] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [locationVal, setLocationVal] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [igLink, setIgLink] = useState('');
  const [ytLink, setYtLink] = useState('');
  const [footerText, setFooterText] = useState('');

  // Password Change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Submitting state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [playersRes, statsRes, settingsRes] = await Promise.all([
        api.get('/players'),
        api.get('/players/stats'),
        api.get('/settings')
      ]);
      setPlayers(playersRes.data);
      setStats(statsRes.data);
      setSettings(settingsRes.data);
      populateSettingsForm(settingsRes.data);
    } catch (err) {
      setToast({ message: "Failed to fetch dashboard data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const populateSettingsForm = (data) => {
    if (!data) return;
    setWebsiteName(data.websiteName || '');
    setAboutContent(data.aboutContent || '');
    setContactEmail(data.contactEmail || '');
    setContactPhone(data.contactPhone || '');
    setLocationVal(data.location || '');
    setFbLink(data.socialLinks?.facebook || '');
    setIgLink(data.socialLinks?.instagram || '');
    setYtLink(data.socialLinks?.youtube || '');
    setFooterText(data.footerText || '');
    setLogoPreview(data.logoUrl ? (data.logoUrl.startsWith('http') ? data.logoUrl : `${api.defaults.baseURL || ''}${data.logoUrl}`) : '');
    setBannerPreview(data.bannerUrl ? (data.bannerUrl.startsWith('http') ? data.bannerUrl : `${api.defaults.baseURL || ''}${data.bannerUrl}`) : '');
  };

  // Open Player form modal
  const handleOpenPlayerForm = (player = null) => {
    setFormTab('basic');
    setAvatarFile(null);
    setVideoFile(null);
    setGalleryFiles([]);
    setDeleteAvatar(false);
    setDeleteVideo(false);

    if (player) {
      setEditingPlayerId(player._id || player.id);
      setName(player.name || '');
      setRank(player.rank || '');
      setPlayingStyle(player.playingStyle || 'Attack');
      setPlayingHand(player.playingHand || 'Right Hand');
      setBiography(player.biography || '');
      setCountry(player.country || '');
      setAchievementsInput(player.achievements ? player.achievements.join('\n') : '');
      
      // Equipment
      setBladeBrand(player.equipment?.blade?.brand || '');
      setBladeModel(player.equipment?.blade?.model || '');
      setForehandBrand(player.equipment?.forehandRubber?.brand || '');
      setForehandModel(player.equipment?.forehandRubber?.model || '');
      setForehandSponge(player.equipment?.forehandRubber?.spongeThickness || '');
      setForehandSpeed(player.equipment?.forehandRubber?.speed || 0);
      setForehandSpin(player.equipment?.forehandRubber?.spin || 0);
      setBackhandBrand(player.equipment?.backhandRubber?.brand || '');
      setBackhandModel(player.equipment?.backhandRubber?.model || '');
      setBackhandSponge(player.equipment?.backhandRubber?.spongeThickness || '');
      setBackhandSpeed(player.equipment?.backhandRubber?.speed || 0);
      setBackhandSpin(player.equipment?.backhandRubber?.spin || 0);

      // Media
      setVideoType(player.promoVideo?.type || 'external');
      setVideoUrlInput(player.promoVideo?.url || '');
      setAvatarPreview(player.avatarUrl ? (player.avatarUrl.startsWith('http') ? player.avatarUrl : `${api.defaults.baseURL || ''}${player.avatarUrl}`) : '');
      setExistingGallery(player.gallery || []);
    } else {
      setEditingPlayerId(null);
      setName('');
      // Suggest next rank automatically
      const nextRank = players.length > 0 ? Math.max(...players.map(p => p.rank)) + 1 : 1;
      setRank(nextRank);
      setPlayingStyle('Attack');
      setPlayingHand('Right Hand');
      setBiography('');
      setCountry('');
      setAchievementsInput('');
      
      // Equipment
      setBladeBrand('');
      setBladeModel('');
      setForehandBrand('');
      setForehandModel('');
      setForehandSponge('');
      setForehandSpeed(0);
      setForehandSpin(0);
      setBackhandBrand('');
      setBackhandModel('');
      setBackhandSponge('');
      setBackhandSpeed(0);
      setBackhandSpin(0);

      // Media
      setVideoType('external');
      setVideoUrlInput('');
      setAvatarPreview('');
      setExistingGallery([]);
    }

    setIsFormOpen(true);
  };

  // Handle Player Delete
  const handleDeletePlayer = async (id, playerName) => {
    if (window.confirm(`Are you sure you want to permanently delete player ${playerName}?`)) {
      try {
        await api.delete(`/players/${id}`);
        setToast({ message: `Successfully deleted profile for ${playerName}.`, type: 'success' });
        loadData();
      } catch (err) {
        setToast({ message: "Failed to delete player.", type: 'error' });
      }
    }
  };

  // Submit Player Form (Create or Edit)
  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rank) {
      setToast({ message: "Name and Rank are required fields.", type: 'error' });
      return;
    }

    setSaving(true);
    const formData = new FormData();
    
    // Core parameters
    formData.append('name', name);
    formData.append('rank', rank);
    formData.append('playingStyle', playingStyle);
    formData.append('playingHand', playingHand);
    formData.append('biography', biography);
    formData.append('country', country);

    // Achievements parsed as array of lines
    const achievements = achievementsInput.split('\n').map(line => line.trim()).filter(Boolean);
    formData.append('achievements', JSON.stringify(achievements));

    // Equipment structure
    const equipment = {
      blade: { brand: bladeBrand, model: bladeModel },
      forehandRubber: { brand: forehandBrand, model: forehandModel, spongeThickness: forehandSponge, speed: Number(forehandSpeed), spin: Number(forehandSpin) },
      backhandRubber: { brand: backhandBrand, model: backhandModel, spongeThickness: backhandSponge, speed: Number(backhandSpeed), spin: Number(backhandSpin) }
    };
    formData.append('equipment', JSON.stringify(equipment));

    // File attachments
    if (avatarFile) formData.append('avatar', avatarFile);
    if (videoFile) formData.append('video', videoFile);
    for (let i = 0; i < galleryFiles.length; i++) {
      formData.append('gallery', galleryFiles[i]);
    }

    // Editing modifications triggers
    if (editingPlayerId) {
      formData.append('deleteAvatar', deleteAvatar ? 'true' : 'false');
      formData.append('deleteVideo', deleteVideo ? 'true' : 'false');
      formData.append('galleryList', JSON.stringify(existingGallery));
    }
    
    // Video URL triggers
    if (videoType === 'external') {
      formData.append('promoVideoUrl', videoUrlInput);
    }

    try {
      if (editingPlayerId) {
        await api.put(`/players/${editingPlayerId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToast({ message: `Successfully updated profile for ${name}.`, type: 'success' });
      } else {
        await api.post('/players', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setToast({ message: `Successfully created profile for ${name}.`, type: 'success' });
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save player details.";
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Settings Edit
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('websiteName', websiteName);
    formData.append('aboutContent', aboutContent);
    formData.append('contactEmail', contactEmail);
    formData.append('contactPhone', contactPhone);
    formData.append('location', locationVal);
    formData.append('deleteLogo', deleteLogo ? 'true' : 'false');
    formData.append('deleteBanner', deleteBanner ? 'true' : 'false');

    const socialLinks = { facebook: fbLink, instagram: igLink, youtube: ytLink };
    formData.append('socialLinks', JSON.stringify(socialLinks));
    formData.append('footerText', footerText);

    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      const res = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(res.data);
      populateSettingsForm(res.data);
      setToast({ message: "Global website settings updated successfully.", type: 'success' });
      
      // Clear file inputs
      setLogoFile(null);
      setBannerFile(null);
      setDeleteLogo(false);
      setDeleteBanner(false);
    } catch (err) {
      setToast({ message: "Failed to update website configurations.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Change password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: "New passwords do not match.", type: 'error' });
      return;
    }

    setSaving(true);
    const result = await changePassword(oldPassword, newPassword);
    setSaving(false);

    if (result.success) {
      setToast({ message: result.message, type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setToast({ message: result.error, type: 'error' });
    }
  };

  // Delete Gallery Item
  const handleRemoveExistingGalleryImage = (imageUrl) => {
    setExistingGallery(existingGallery.filter(img => img !== imageUrl));
  };

  return (
    <div style={{ display: 'flex', minHeight: '85vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar navigation panel */}
      <div className="glass-panel" style={{
        width: '260px',
        borderRadius: '0 16px 16px 0',
        padding: '24px 16px',
        borderLeft: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        flexShrink: 0
      }}>
        {/* Profile identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
          <div style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <FaUserShield />
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 600 }}>Administrator</h4>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Active Session</span>
          </div>
        </div>

        {/* Navigation list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <style>{`
            .sidebar-btn {
              display: flex;
              align-items: center;
              gap: 12px;
              width: 100%;
              padding: 12px 16px;
              background: none;
              border: none;
              color: #94a3b8;
              font-family: 'Outfit', sans-serif;
              font-size: 0.9rem;
              font-weight: 500;
              text-align: left;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            }
            .sidebar-btn:hover {
              background: rgba(255, 255, 255, 0.03);
              color: #ffffff;
            }
            .sidebar-btn.active {
              background: rgba(37, 99, 235, 0.15);
              color: #2563eb;
              border: 1px solid rgba(37, 99, 235, 0.25);
            }
          `}</style>
          
          <button onClick={() => setActiveTab('overview')} className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}><FaUsers /> Overview</button>
          <button onClick={() => setActiveTab('players')} className={`sidebar-btn ${activeTab === 'players' ? 'active' : ''}`}><FaPlus /> Player Profiles</button>
          <button onClick={() => setActiveTab('settings')} className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}><FaCog /> Global Settings</button>
          <button onClick={() => setActiveTab('account')} className={`sidebar-btn ${activeTab === 'account' ? 'active' : ''}`}><FaLock /> Account Password</button>
        </div>

        {/* Logout bottom */}
        <button onClick={logout} className="btn btn-danger" style={{ width: '100%', gap: '10px', fontSize: '0.85rem' }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* Main content display window */}
      <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ animation: 'spin 1s linear infinite', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#2563eb', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 16px' }} />
            <p>Loading Dashboard Panel...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", marginBottom: '24px' }}>Overview Standings</h1>
                
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '32px', color: '#2563eb' }}><FaUsers /></div>
                    <div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPlayers}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Players Showcase</span>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '32px', color: '#0ea5e9' }}><FaImage /></div>
                    <div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalPhotos}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Media Images</span>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '32px', color: '#10b981' }}><FaVideo /></div>
                    <div>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.totalVideos}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Videos Added</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: "'Outfit', sans-serif", marginBottom: '16px' }}>Quick Control Actions</h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => handleOpenPlayerForm(null)} className="btn btn-primary"><FaPlus /> Add New Player Profile</button>
                    <button onClick={() => setActiveTab('settings')} className="btn btn-secondary"><FaCog /> Edit Brand Details</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLAYERS MANAGEMENT */}
            {activeTab === 'players' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif" }}>Player Profiles</h1>
                  <button onClick={() => handleOpenPlayerForm(null)} className="btn btn-primary"><FaPlus /> Add Player</button>
                </div>

                {/* Player List Table */}
                <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ padding: '12px', color: '#94a3b8' }}>Rank</th>
                        <th style={{ padding: '12px', color: '#94a3b8' }}>Player Name</th>
                        <th style={{ padding: '12px', color: '#94a3b8' }}>Style</th>
                        <th style={{ padding: '12px', color: '#94a3b8' }}>Hand</th>
                        <th style={{ padding: '12px', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player._id || player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px', fontWeight: 700 }}>#{player.rank}</td>
                          <td style={{ padding: '12px', color: '#ffffff' }}>{player.name}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{player.playingStyle}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{player.playingHand}</td>
                          <td style={{ padding: '12px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => handleOpenPlayerForm(player)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                              <FaEdit /> Edit
                            </button>
                            <button onClick={() => handleDeletePlayer(player._id || player.id, player.name)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                              <FaTrash /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {players.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No player records registered. Click 'Add Player' to start.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: GLOBAL SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", marginBottom: '24px' }}>Website Settings</h1>
                
                <form onSubmit={handleSettingsSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="form-label">Website / Club Name</label>
                      <input type="text" value={websiteName} onChange={(e)=>setWebsiteName(e.target.value)} className="form-input" required />
                    </div>
                    <div>
                      <label className="form-label">Contact Phone</label>
                      <input type="text" value={contactPhone} onChange={(e)=>setContactPhone(e.target.value)} className="form-input" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="form-label">Contact Email</label>
                      <input type="email" value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Location Address</label>
                      <input type="text" value={locationVal} onChange={(e)=>setLocationVal(e.target.value)} className="form-input" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Homepage About Content</label>
                    <textarea value={aboutContent} onChange={(e)=>setAboutContent(e.target.value)} className="form-input" rows="4" style={{ resize: 'vertical' }} />
                  </div>

                  {/* Logo and Banner upload controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    <div>
                      <label className="form-label">Website Logo File</label>
                      <input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files[0])} style={{ display: 'none' }} id="logo-file" />
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <label htmlFor="logo-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}><FaUpload /> Upload Image</label>
                        {logoFile && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{logoFile.name}</span>}
                      </div>
                      {logoPreview && !deleteLogo && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img src={logoPreview} alt="logo" style={{ height: '40px', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '4px' }} />
                          <button type="button" onClick={()=>setDeleteLogo(true)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><FaTrash /> Remove</button>
                        </div>
                      )}
                      {deleteLogo && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Logo will be deleted on save</span>}
                    </div>

                    <div>
                      <label className="form-label">Homepage Banner Image</label>
                      <input type="file" accept="image/*" onChange={(e)=>setBannerFile(e.target.files[0])} style={{ display: 'none' }} id="banner-file" />
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <label htmlFor="banner-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}><FaUpload /> Upload Image</label>
                        {bannerFile && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{bannerFile.name}</span>}
                      </div>
                      {bannerPreview && !deleteBanner && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img src={bannerPreview} alt="banner" style={{ height: '50px', width: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                          <button type="button" onClick={()=>setDeleteBanner(true)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><FaTrash /> Remove</button>
                        </div>
                      )}
                      {deleteBanner && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Banner will be deleted on save</span>}
                    </div>
                  </div>

                  {/* Social Handles links */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                    <div>
                      <label className="form-label">Facebook Profile URL</label>
                      <input type="url" value={fbLink} onChange={(e)=>setFbLink(e.target.value)} className="form-input" placeholder="https://facebook.com/club" />
                    </div>
                    <div>
                      <label className="form-label">Instagram Profile URL</label>
                      <input type="url" value={igLink} onChange={(e)=>setIgLink(e.target.value)} className="form-input" placeholder="https://instagram.com/club" />
                    </div>
                    <div>
                      <label className="form-label">YouTube Channel URL</label>
                      <input type="url" value={ytLink} onChange={(e)=>setYtLink(e.target.value)} className="form-input" placeholder="https://youtube.com/club" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Footer Copyright Label Text</label>
                    <input type="text" value={footerText} onChange={(e)=>setFooterText(e.target.value)} className="form-input" />
                  </div>

                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                    {saving ? "Saving configurations..." : "Save Settings"}
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ACCOUNT PASSWORD CONFIG */}
            {activeTab === 'account' && (
              <div>
                <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif", marginBottom: '24px' }}>Account Credentials</h1>
                
                <form onSubmit={handlePasswordSubmit} className="glass-panel" style={{ padding: '32px', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="form-label">Old Password</label>
                    <input type="password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="form-input" required />
                  </div>

                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '10px' }}>
                    <FaKey /> {saving ? "Changing password..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PLAYER ADD/EDIT MODAL FORM */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5,7,14,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 5000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: "'Outfit', sans-serif" }}>
                {editingPlayerId ? `Edit Player Profile: ${name}` : 'Create Player Profile'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}><FaTimes /></button>
            </div>

            {/* Modal Form tabs */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <style>{`
                .form-tab-btn {
                  background: none;
                  border: none;
                  color: #94a3b8;
                  font-family: 'Outfit', sans-serif;
                  font-size: 0.9rem;
                  font-weight: 600;
                  cursor: pointer;
                  padding: 8px 16px;
                  border-radius: 6px;
                  transition: all 0.2s;
                }
                .form-tab-btn.active {
                  background: rgba(37,99,235,0.15);
                  color: #2563eb;
                }
              `}</style>
              <button type="button" onClick={()=>setFormTab('basic')} className={`form-tab-btn ${formTab === 'basic' ? 'active' : ''}`}><FaGlobe /> Basic Info</button>
              <button type="button" onClick={()=>setFormTab('equipment')} className={`form-tab-btn ${formTab === 'equipment' ? 'active' : ''}`}>🏓 Equipment Sheet</button>
              <button type="button" onClick={()=>setFormTab('media')} className={`form-tab-btn ${formTab === 'media' ? 'active' : ''}`}><FaVideo /> Media Files</button>
            </div>

            {/* Main Form container */}
            <form onSubmit={handlePlayerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* TAB: BASIC INFO */}
              {formTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">Player Name</label>
                      <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="form-input" placeholder="Ma Long" required />
                    </div>
                    <div>
                      <label className="form-label">Rank Number</label>
                      <input type="number" min="1" value={rank} onChange={(e)=>setRank(e.target.value)} className="form-input" required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="form-label">Playing Style</label>
                      <select value={playingStyle} onChange={(e)=>setPlayingStyle(e.target.value)} className="form-input">
                        <option value="Attack">Attack</option>
                        <option value="Offensive">Offensive</option>
                        <option value="Defense">Defense</option>
                        <option value="Defensive">Defensive</option>
                        <option value="All Round">All Round</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Playing Hand</label>
                      <select value={playingHand} onChange={(e)=>setPlayingHand(e.target.value)} className="form-input">
                        <option value="Right Hand">Right Hand</option>
                        <option value="Left Hand">Left Hand</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Country</label>
                      <input type="text" value={country} onChange={(e)=>setCountry(e.target.value)} className="form-input" placeholder="China" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Player Achievements (One item per line)</label>
                    <textarea value={achievementsInput} onChange={(e)=>setAchievementsInput(e.target.value)} className="form-input" rows="3" placeholder="Gold Medal - Tokyo 2020 Olympics&#10;World Cup Winner 2023" />
                  </div>

                  <div>
                    <label className="form-label">Biography / Description</label>
                    <textarea value={biography} onChange={(e)=>setBiography(e.target.value)} className="form-input" rows="5" placeholder="Write a short summary about the player..." />
                  </div>
                </div>
              )}

              {/* TAB: EQUIPMENT SHEET */}
              {formTab === 'equipment' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Blade settings */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                    <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Blade Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="form-label">Brand</label>
                        <input type="text" value={bladeBrand} onChange={(e)=>setBladeBrand(e.target.value)} className="form-input" placeholder="Butterfly" />
                      </div>
                      <div>
                        <label className="form-label">Model</label>
                        <input type="text" value={bladeModel} onChange={(e)=>setBladeModel(e.target.value)} className="form-input" placeholder="Viscaria FL" />
                      </div>
                    </div>
                  </div>

                  {/* Forehand Rubber settings */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                    <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>Forehand Rubber</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label">Brand</label>
                        <input type="text" value={forehandBrand} onChange={(e)=>setForehandBrand(e.target.value)} className="form-input" placeholder="DHS" />
                      </div>
                      <div>
                        <label className="form-label">Model</label>
                        <input type="text" value={forehandModel} onChange={(e)=>setForehandModel(e.target.value)} className="form-input" placeholder="Hurricane 3 National" />
                      </div>
                      <div>
                        <label className="form-label">Sponge Thickness</label>
                        <input type="text" value={forehandSponge} onChange={(e)=>setForehandSponge(e.target.value)} className="form-input" placeholder="2.1mm / 40°" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="form-label">Speed Metric (0 to 10): {forehandSpeed}</label>
                        <input type="range" min="0" max="10" step="0.5" value={forehandSpeed} onChange={(e)=>setForehandSpeed(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                      </div>
                      <div>
                        <label className="form-label">Spin Metric (0 to 10): {forehandSpin}</label>
                        <input type="range" min="0" max="10" step="0.5" value={forehandSpin} onChange={(e)=>setForehandSpin(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                      </div>
                    </div>
                  </div>

                  {/* Backhand Rubber settings */}
                  <div>
                    <h4 style={{ color: '#0ea5e9', marginBottom: '10px' }}>Backhand Rubber</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label">Brand</label>
                        <input type="text" value={backhandBrand} onChange={(e)=>setBackhandBrand(e.target.value)} className="form-input" placeholder="Butterfly" />
                      </div>
                      <div>
                        <label className="form-label">Model</label>
                        <input type="text" value={backhandModel} onChange={(e)=>setBackhandModel(e.target.value)} className="form-input" placeholder="Tenergy 05" />
                      </div>
                      <div>
                        <label className="form-label">Sponge Thickness</label>
                        <input type="text" value={backhandSponge} onChange={(e)=>setBackhandSponge(e.target.value)} className="form-input" placeholder="2.1mm" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="form-label">Speed Metric (0 to 10): {backhandSpeed}</label>
                        <input type="range" min="0" max="10" step="0.5" value={backhandSpeed} onChange={(e)=>setBackhandSpeed(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                      </div>
                      <div>
                        <label className="form-label">Spin Metric (0 to 10): {backhandSpin}</label>
                        <input type="range" min="0" max="10" step="0.5" value={backhandSpin} onChange={(e)=>setBackhandSpin(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: MEDIA UPLOADS */}
              {formTab === 'media' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Avatar Upload */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                    <label className="form-label">Main Profile Avatar</label>
                    <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files[0])} style={{ display: 'none' }} id="avatar-file" />
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label htmlFor="avatar-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}><FaUpload /> Upload Image</label>
                      {avatarFile && <span style={{ fontSize: '0.85rem', color: '#10b981' }}>{avatarFile.name}</span>}
                    </div>
                    {avatarPreview && !deleteAvatar && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={avatarPreview} alt="avatar" style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button type="button" onClick={()=>setDeleteAvatar(true)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><FaTrash /> Remove</button>
                      </div>
                    )}
                    {deleteAvatar && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Avatar photo will be removed on save</span>}
                  </div>

                  {/* Promo Video Settings */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                    <label className="form-label">Promotional Video Setup</label>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" checked={videoType === 'external'} onChange={()=>setVideoType('external')} style={{ accentColor: '#2563eb' }} />
                        External URL (YouTube / Vimeo)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="radio" checked={videoType === 'local'} onChange={()=>setVideoType('local')} style={{ accentColor: '#2563eb' }} />
                        Upload Video File
                      </label>
                    </div>

                    {videoType === 'external' ? (
                      <div>
                        <label className="form-label">Link Address</label>
                        <input type="url" value={videoUrlInput} onChange={(e)=>setVideoUrlInput(e.target.value)} className="form-input" placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                    ) : (
                      <div>
                        <input type="file" accept="video/*" onChange={(e)=>setVideoFile(e.target.files[0])} style={{ display: 'none' }} id="player-video" />
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <label htmlFor="player-video" className="btn btn-secondary" style={{ cursor: 'pointer' }}><FaUpload /> Upload Video</label>
                          {videoFile && <span style={{ fontSize: '0.85rem', color: '#10b981' }}>{videoFile.name}</span>}
                        </div>
                        {editingPlayerId && !deleteVideo && (
                          <div style={{ marginTop: '12px' }}>
                            <button type="button" onClick={()=>setDeleteVideo(true)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><FaTrash /> Remove Video</button>
                          </div>
                        )}
                        {deleteVideo && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>Video will be deleted on save</span>}
                      </div>
                    )}
                  </div>

                  {/* Multi-Photo Gallery Upload */}
                  <div>
                    <label className="form-label">Gallery Images</label>
                    <input type="file" accept="image/*" multiple onChange={(e)=>setGalleryFiles(Array.from(e.target.files))} style={{ display: 'none' }} id="gallery-files" />
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <label htmlFor="gallery-files" className="btn btn-secondary" style={{ cursor: 'pointer' }}><FaUpload /> Upload Images (Multi)</label>
                      {galleryFiles.length > 0 && <span style={{ fontSize: '0.85rem', color: '#10b981' }}>{galleryFiles.length} files selected</span>}
                    </div>

                    {existingGallery.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Existing Gallery Images (Click trash to delete from server):</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {existingGallery.map((img, idx) => {
                            const imgUrl = img.startsWith('http') ? img : `${api.defaults.baseURL || ''}${img}`;
                            return (
                              <div key={idx} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <img src={imgUrl} alt="existing gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingGalleryImage(img)}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(239, 68, 68, 0.9)',
                                    border: 'none',
                                    color: '#ffffff',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : <><FaCheck /> Save Player</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
