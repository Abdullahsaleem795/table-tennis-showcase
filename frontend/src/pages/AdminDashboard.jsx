import React, { useState, useEffect, useContext, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';
import {
  FaUserShield, FaUsers, FaImage, FaVideo, FaCog, FaLock, FaSignOutAlt,
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaUpload, FaGlobe, FaTrophy, FaHandPaper, FaKey, FaRandom, FaCheckCircle, FaClipboardList, FaShareAlt, FaDownload, FaFileArchive
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import CertificateTemplate from '../components/CertificateTemplate';

const AdminDashboard = () => {
  const { isAuthenticated, logout, changePassword, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Tab State: 'overview', 'players', 'tournament', 'voting'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({ totalPlayers: 0, totalPhotos: 0, totalVideos: 0 });
  const [settings, setSettings] = useState(null);
  const [tournament, setTournament] = useState(null);
  
  // Certificate State
  const [certData, setCertData] = useState({ playerName: '', placement: '', date: '' });
  const certificateRef = useRef(null);
  
  // Poll State
  const [pollActive, setPollActive] = useState(false);
  const [pollEndsAt, setPollEndsAt] = useState('');
  const [pollPublished, setPollPublished] = useState(false);
  
  // Site Settings State
  const [siteContactEmail, setSiteContactEmail] = useState('');
  const [siteContactPhone, setSiteContactPhone] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Player Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [formTab, setFormTab] = useState('basic');

  // Player Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
  const [videoType, setVideoType] = useState('external');
  const [deleteVideo, setDeleteVideo] = useState(false);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  
  // Form Submitting state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [playersRes, settingsRes, tournamentRes, pollRes] = await Promise.all([
        api.get('/players'),
        api.get('/settings'),
        api.get('/tournament'),
        api.get('/poll')
      ]);
      const fetchedPlayers = playersRes.data.players ? playersRes.data.players : playersRes.data;
      setPlayers(Array.isArray(fetchedPlayers) ? fetchedPlayers : []);
      
      if (playersRes.data.stats) {
        setStats(playersRes.data.stats);
      } else {
        setStats({ totalPlayers: Array.isArray(fetchedPlayers) ? fetchedPlayers.length : 0, totalPhotos: 0, totalVideos: 0 });
      }

      setSettings(settingsRes.data);
      setSiteContactEmail(settingsRes.data?.contactEmail || '');
      setSiteContactPhone(settingsRes.data?.contactPhone || '');
      setSiteLocation(settingsRes.data?.location || '');
      
      if (tournamentRes.data) {
        setTournament(tournamentRes.data);
      }
      
      if (pollRes.data) {
        setPollActive(!!pollRes.data.active);
        setPollPublished(!!pollRes.data.published);
        if (pollRes.data.endsAt) {
          // Format ISO to datetime-local format: YYYY-MM-DDTHH:MM
          const d = new Date(pollRes.data.endsAt);
          const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setPollEndsAt(localISO);
        } else {
          setPollEndsAt('');
        }
      }

      let photosCount = 0;
      let videosCount = 0;
      fetchedPlayers.forEach(p => {
        if (p.avatarUrl) photosCount++;
        if (p.gallery && Array.isArray(p.gallery)) photosCount += p.gallery.length;
        if (p.promoVideo && p.promoVideo.url) videosCount++;
      });

      setStats({
        totalPlayers: fetchedPlayers.length,
        totalPhotos: photosCount,
        totalVideos: videosCount
      });
    } catch (err) {
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleResetPoll = async () => {
    if (!window.confirm("Are you sure you want to remove the current poll? This will permanently erase all current votes and create a clean slate.")) return;
    setSaving(true);
    try {
      await api.post('/poll/reset');
      showToast("Poll removed and reset successfully!");
      fetchDashboardData();
    } catch (err) {
      showToast("Error resetting poll", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePollSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endsAtISO = pollEndsAt ? new Date(pollEndsAt).toISOString() : null;
      await api.post('/poll/configure', {
        active: pollActive,
        endsAt: endsAtISO,
        published: pollPublished
      });
      showToast("Poll configurations updated successfully!");
      fetchDashboardData();
    } catch (err) {
      showToast("Error updating poll settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', {
        contactEmail: siteContactEmail,
        contactPhone: siteContactPhone,
        location: siteLocation
      });
      showToast("Site settings updated successfully!");
      fetchDashboardData();
    } catch (err) {
      showToast("Error updating site settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyInviteTemplate = () => {
    const link = window.location.origin;
    const msg = `🏓 Who is your favorite table tennis player? Cast your vote now in our fan favorite poll! \n👉 Vote here: ${link}`;
    navigator.clipboard.writeText(msg);
    showToast("Invite template copied to clipboard!");
  };

  const handleCopyResultsTemplate = () => {
    const link = window.location.origin;
    const sortedPlayers = [...players].sort((a,b) => (b.votes || 0) - (a.votes || 0));
    const winner = sortedPlayers[0];
    
    let msg = winner && winner.votes > 0
      ? `🏆 The results are in! ${winner.name} won the Fan Favorite Poll with ${winner.votes} votes!\n\n`
      : `🏆 Fan Favorite Poll results are declared!\n\n`;
      
    msg += `📊 Final Standings:\n`;
    sortedPlayers.forEach((p, index) => {
      msg += `${index === 0 && p.votes > 0 ? '👑 ' : ''}${index + 1}. ${p.name} - ${p.votes || 0} votes\n`;
    });
    
    msg += `\n👉 View results here: ${link}`;
    
    navigator.clipboard.writeText(msg);
    showToast("Full poll results copied to clipboard!");
  };

  const handleGenerateTournament = async () => {
    setSaving(true);
    try {
      const res = await api.post('/tournament/generate');
      setTournament(res.data.tournament);
      showToast("Tournament bracket generated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Error generating tournament", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectWinner = async (matchId, winnerId) => {
    setSaving(true);
    try {
      const res = await api.post('/tournament/winner', { matchId, winnerId });
      setTournament(res.data.tournament);
      showToast("Winner logged & player advanced!");
    } catch (err) {
      showToast(err.response?.data?.message || "Error selecting winner", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTournament = async () => {
    if (!window.confirm("Are you sure you want to reset the bracket?")) return;
    setSaving(true);
    try {
      const res = await api.post('/tournament/reset');
      setTournament(res.data.tournament);
      showToast("Tournament reset.");
    } catch (err) {
      showToast(err.response?.data?.message || "Error resetting tournament", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendCertificate = async (playerId, placement) => {
    setSaving(true);
    try {
      const res = await api.post('/certificates/send', { playerId, placement });
      if (res.data.previewUrl) {
        showToast(`Certificate sent! Preview URL: ${res.data.previewUrl}`);
        window.open(res.data.previewUrl, '_blank');
      } else {
        showToast("Certificate sent successfully!");
      }
    } catch (err) {
      showToast(err.response?.data?.error || "Error sending certificate", "error");
    } finally {
      setSaving(false);
    }
  };

  const generatePdfFromTemplate = async (playerName, placement) => {
    flushSync(() => {
      setCertData({
        playerName,
        placement,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      });
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf;
    }
    return null;
  };

  const handleDownloadCertificate = async (player, placement) => {
    setSaving(true);
    try {
      showToast(`Generating certificate for ${player.name}...`);
      const pdf = await generatePdfFromTemplate(player.name, placement);
      if (pdf) {
        pdf.save(`${player.name.replace(/\s+/g, '_')}_Certificate.pdf`);
        showToast(`Downloaded certificate for ${player.name}`);
      }
    } catch (error) {
      console.error(error);
      showToast("Error generating PDF", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadAllCertificates = async () => {
    if (players.length === 0) return showToast("No players found", "error");
    
    setSaving(true);
    showToast("Generating certificates... Please wait.");
    
    try {
      const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
      for (let i = 0; i < sortedPlayers.length; i++) {
        const player = sortedPlayers[i];
        let placement = 'Certificate of Participation';
        if (i === 0) placement = 'Winner (1st Place)';
        else if (i === 1) placement = 'Runner-Up (2nd Place)';
        else if (i === 2) placement = '3rd Place';
        
        const pdf = await generatePdfFromTemplate(player.name, placement);
        if (pdf) {
          pdf.save(`${player.name.replace(/\s+/g, '_')}_Certificate.pdf`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      showToast("All certificates downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Error generating some PDFs", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddPlayer = () => {
    setEditingPlayerId(null);
    setName('');
    setEmail('');
    setRank((players.length + 1).toString());
    setPlayingStyle('Attack');
    setPlayingHand('Right Hand');
    setBiography('');
    setCountry('');
    setAchievementsInput('');
    setBladeBrand('');
    setBladeModel('');
    setForehandBrand('');
    setForehandModel('');
    setForehandSponge('');
    setForehandSpeed(80);
    setForehandSpin(80);
    setBackhandBrand('');
    setBackhandModel('');
    setBackhandSponge('');
    setBackhandSpeed(80);
    setBackhandSpin(80);
    setAvatarFile(null);
    setAvatarPreview('');
    setDeleteAvatar(false);
    setVideoFile(null);
    setVideoUrlInput('');
    setVideoType('external');
    setDeleteVideo(false);
    setGalleryFiles([]);
    setExistingGallery([]);
    setFormTab('basic');
    setIsFormOpen(true);
  };

  const handleOpenEditPlayer = (p) => {
    setEditingPlayerId(p._id || p.id);
    setName(p.name || '');
    setEmail(p.email || '');
    setRank(p.rank?.toString() || '');
    setPlayingStyle(p.playingStyle || 'Attack');
    setPlayingHand(p.playingHand || 'Right Hand');
    setBiography(p.biography || '');
    setCountry(p.country || '');
    setAchievementsInput(Array.isArray(p.achievements) ? p.achievements.join('\n') : '');
    setBladeBrand(p.equipment?.blade?.brand || '');
    setBladeModel(p.equipment?.blade?.model || '');
    setForehandBrand(p.equipment?.forehandRubber?.brand || '');
    setForehandModel(p.equipment?.forehandRubber?.model || '');
    setForehandSponge(p.equipment?.forehandRubber?.spongeThickness || '');
    setForehandSpeed(p.equipment?.forehandRubber?.speed || 80);
    setForehandSpin(p.equipment?.forehandRubber?.spin || 80);
    setBackhandBrand(p.equipment?.backhandRubber?.brand || '');
    setBackhandModel(p.equipment?.backhandRubber?.model || '');
    setBackhandSponge(p.equipment?.backhandRubber?.spongeThickness || '');
    setBackhandSpeed(p.equipment?.backhandRubber?.speed || 80);
    setBackhandSpin(p.equipment?.backhandRubber?.spin || 80);
    setAvatarFile(null);
    setAvatarPreview(p.avatarUrl || '');
    setDeleteAvatar(false);
    setVideoFile(null);
    setVideoUrlInput(p.promoVideo?.url || '');
    setVideoType(p.promoVideo?.type || 'external');
    setDeleteVideo(false);
    setGalleryFiles([]);
    setExistingGallery(p.gallery || []);
    setFormTab('basic');
    setIsFormOpen(true);
  };

  const handleDeletePlayer = async (id, playerName) => {
    if (window.confirm(`Are you sure you want to delete player "${playerName}"?`)) {
      try {
        await api.delete(`/players/${id}`);
        showToast(`Player ${playerName} deleted`);
        fetchDashboardData();
      } catch (err) {
        showToast("Error deleting player", "error");
      }
    }
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('rank', rank);
    formData.append('playingStyle', playingStyle);
    formData.append('playingHand', playingHand);
    formData.append('biography', biography);
    formData.append('country', country);

    const achievementsArray = achievementsInput
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    formData.append('achievements', JSON.stringify(achievementsArray));

    const equipmentData = {
      blade: { brand: bladeBrand, model: bladeModel },
      forehandRubber: { brand: forehandBrand, model: forehandModel, spongeThickness: forehandSponge, speed: Number(forehandSpeed), spin: Number(forehandSpin) },
      backhandRubber: { brand: backhandBrand, model: backhandModel, spongeThickness: backhandSponge, speed: Number(backhandSpeed), spin: Number(backhandSpin) }
    };
    formData.append('equipment', JSON.stringify(equipmentData));

    const promoVideoData = { type: videoType, url: videoUrlInput };
    formData.append('promoVideo', JSON.stringify(promoVideoData));

    if (avatarFile) formData.append('avatar', avatarFile);
    if (deleteAvatar) formData.append('deleteAvatar', 'true');
    if (videoFile) formData.append('promoVideoFile', videoFile);
    if (deleteVideo) formData.append('deleteVideo', 'true');

    for (let i = 0; i < galleryFiles.length; i++) {
      formData.append('gallery', galleryFiles[i]);
    }
    formData.append('existingGallery', JSON.stringify(existingGallery));

    try {
      if (editingPlayerId) {
        await api.put(`/players/${editingPlayerId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast("Player profile updated!");
      } else {
        await api.post('/players', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast("New player added!");
      }
      setIsFormOpen(false);
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || "Error saving player profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderAdminMatchCard = (m) => {
    if (!m) return null;
    return (
      <div style={{ padding: '14px', backgroundColor: 'var(--color-surface-container)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>MATCH</span>
          <span style={{ color: m.status === 'completed' ? 'var(--color-secondary)' : 'var(--color-tertiary)' }}>
            {m.status === 'completed' ? '✓ Finished' : 'Pending'}
          </span>
        </div>

        <button
          disabled={saving || !m.player1 || m.status === 'completed'}
          onClick={() => handleSelectWinner(m.matchId, m.player1._id || m.player1.id)}
          className={`btn ${m.winner && (m.winner._id === m.player1?._id || m.winner.id === m.player1?.id) ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '100%', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem', opacity: m.status === 'completed' && (!m.winner || (m.winner._id !== m.player1?._id && m.winner.id !== m.player1?.id)) ? 0.4 : 1 }}
        >
          <span>{m.player1 ? m.player1.name : 'TBD'}</span>
          {m.player1 && m.status !== 'completed' && <span style={{ fontSize: '0.7rem' }}>Pick Winner</span>}
        </button>

        <button
          disabled={saving || !m.player2 || m.status === 'completed'}
          onClick={() => handleSelectWinner(m.matchId, m.player2._id || m.player2.id)}
          className={`btn ${m.winner && (m.winner._id === m.player2?._id || m.winner.id === m.player2?.id) ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem', opacity: m.status === 'completed' && (!m.winner || (m.winner._id !== m.player2?._id && m.winner.id !== m.player2?.id)) ? 0.4 : 1 }}
        >
          <span>{m.player2 ? m.player2.name : (m.player1 && !m.player2 ? 'BYE (Advanced)' : 'TBD')}</span>
          {m.player2 && m.status !== 'completed' && <span style={{ fontSize: '0.7rem' }}>Pick Winner</span>}
        </button>
      </div>
    );
  };

  const isPollExpired = pollEndsAt && new Date(pollEndsAt).getTime() < new Date().getTime();

  if (loading) {
    return (
      <div className="section-padding container-width" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="skeleton" style={{ height: '30px', width: '200px', margin: '0 auto 20px' }}></div>
        <div className="skeleton" style={{ height: '400px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="section-padding container-width">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FaUserShield /> Control Panel
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>ADMIN DASHBOARD</h1>
        </div>
        <button onClick={logout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: <FaClipboardList /> },
          { id: 'players', label: 'Registered Players', icon: <FaUsers /> },
          { id: 'tournament', label: 'Tournament Control', icon: <FaTrophy /> },
          { id: 'voting', label: 'Voting Manager', icon: <FaCheckCircle /> },
          { id: 'certificates', label: 'Certificates', icon: <FaHandPaper /> },
          { id: 'settings', label: 'Site Settings', icon: <FaCog /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="m3-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(37,99,235,0.15)', color: 'var(--color-primary)', fontSize: '28px' }}>
                <FaUsers />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase' }}>Registered Players</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>{stats.totalPlayers}</div>
              </div>
            </div>

            <div className="m3-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--color-secondary)', fontSize: '28px' }}>
                <FaImage />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase' }}>Photos & Avatars</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>{stats.totalPhotos}</div>
              </div>
            </div>

            <div className="m3-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--color-error)', fontSize: '28px' }}>
                <FaVideo />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase' }}>Promo Videos</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>{stats.totalVideos}</div>
              </div>
            </div>
          </div>

          <div className="m3-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>Quick Action: Add Player</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem' }}>Create a new player profile with specialized equipment specs and videos.</p>
            </div>
            <button onClick={handleOpenAddPlayer} className="btn btn-primary">
              <FaPlus /> Add New Player
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PLAYERS MANAGEMENT */}
      {activeTab === 'players' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>REGISTERED PLAYERS ({players.length})</h2>
            <button onClick={handleOpenAddPlayer} className="btn btn-primary">
              <FaPlus /> Add New Player
            </button>
          </div>

          <div className="m3-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'var(--color-surface-container)' }}>
                  <th style={{ padding: '14px 16px', width: '70px' }}></th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Rank</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Player Name</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Style / Hand</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Country</th>
                  <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...players].sort((a, b) => a.rank - b.rank).map(p => (
                  <tr key={p._id || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-outline)', backgroundColor: 'var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl.startsWith('http') || p.avatarUrl.startsWith('data:') ? p.avatarUrl : `${api.defaults.baseURL || ''}${p.avatarUrl}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        ) : (
                          <span style={{ fontSize: '16px' }}>👤</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-primary)' }}>#{p.rank}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-on-surface)' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-on-surface)', fontSize: '0.85rem' }}>{p.playingStyle} • {p.playingHand}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-on-surface-variant)', fontSize: '0.85rem' }}>{p.country || 'N/A'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenEditPlayer(p)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', marginRight: '6px' }}>
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => handleDeletePlayer(p._id || p.id, p.name)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOURNAMENT CONTROL */}
      {activeTab === 'tournament' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="m3-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>TOURNAMENT BRACKET CONTROL</h2>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem', marginTop: '4px' }}>
                Shuffle registered players randomly and generate the single-elimination tournament bracket rounds.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleGenerateTournament} disabled={saving} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                <FaRandom /> {saving ? 'Sorting...' : 'Sort & Generate Bracket'}
              </button>
              <button onClick={handleResetTournament} disabled={saving} className="btn btn-danger" style={{ padding: '10px 18px' }}>
                Reset Bracket
              </button>
            </div>
          </div>

          {tournament && tournament.rounds && tournament.rounds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {tournament.rounds.map((round) => (
                <div key={round.roundNumber} className="m3-card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontFamily: "var(--font-family-heading)", marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                    {round.roundName} (Round #{round.roundNumber})
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                    {round.matches.map((m, idx) => (
                      <React.Fragment key={m.matchId}>
                        {renderAdminMatchCard(m)}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="m3-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              No tournament bracket generated yet. Click "Sort & Generate Bracket" above to start!
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VOTING MANAGER */}
      {activeTab === 'voting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Settings form */}
          <form onSubmit={handleUpdatePollSettings} className="m3-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)", borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              POLL CONFIGURATION
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '12px' }}>
              <input
                type="checkbox"
                id="pollActive"
                checked={pollActive}
                onChange={(e) => setPollActive(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="pollActive" style={{ color: 'var(--color-on-surface)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Enable Fan Favorite Poll (Voting Active)
              </label>
            </div>

            <div>
              <label className="form-label">Poll Expiration Date & Time</label>
              <input
                type="datetime-local"
                className="form-input"
                value={pollEndsAt}
                onChange={(e) => setPollEndsAt(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '4px', display: 'block' }}>
                Leave empty for no automatic expiration.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <input
                type="checkbox"
                id="pollPublished"
                checked={pollPublished}
                onChange={(e) => setPollPublished(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="pollPublished" style={{ color: 'var(--color-on-surface)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Publish Standings Podium on Homepage
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {saving ? 'Updating...' : 'Save Configuration'}
            </button>

            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <button type="button" onClick={handleResetPoll} disabled={saving} className="btn btn-danger" style={{ width: '100%' }}>
                Remove Current Poll (Reset)
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '6px', display: 'block', textAlign: 'center' }}>
                Warning: Erases all current votes.
              </span>
            </div>
          </form>

          {/* Standings breakdown & Social share */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Social templates */}
            <div className="m3-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>
                SHARE ON WHATSAPP & PLATFORMS
              </h2>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={handleCopyInviteTemplate} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '10px' }}>
                  <FaShareAlt /> Copy Invite Link Template
                </button>
                <button type="button" onClick={handleCopyResultsTemplate} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '10px' }}>
                  <FaTrophy /> Copy Results Template
                </button>
              </div>
            </div>

            {/* Current Standings */}
            <div className="m3-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', color: isPollExpired ? 'var(--color-tertiary)' : 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)", marginBottom: '16px' }}>
                {isPollExpired ? '🏆 FINAL POLL RESULTS' : 'POLL STANDINGS (VOTES CASTED)'}
              </h2>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'var(--color-surface-container)' }}>
                      <th style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Player</th>
                      <th style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', textAlign: 'right' }}>Total Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...players]
                      .sort((a,b) => (b.votes || 0) - (a.votes || 0))
                      .map((p, index) => (
                        <tr key={p._id || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', backgroundColor: (isPollExpired && index === 0 && p.votes > 0) ? 'rgba(217, 119, 6, 0.15)' : 'transparent' }}>
                          <td style={{ padding: '10px', fontWeight: 600, color: (isPollExpired && index === 0 && p.votes > 0) ? 'var(--color-tertiary)' : 'var(--color-on-surface)', fontSize: '0.85rem' }}>
                            {isPollExpired && index === 0 && p.votes > 0 && <span style={{ marginRight: '6px' }}>👑</span>}
                            {p.name}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: (isPollExpired && index === 0 && p.votes > 0) ? 'var(--color-tertiary)' : 'var(--color-secondary)', fontSize: '0.85rem' }}>
                            {p.votes || 0}
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontFamily: "var(--font-family-heading)", fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              <FaCog /> Site Settings
            </h2>
          </div>

          <form onSubmit={handleUpdateSiteSettings} className="m3-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--color-on-surface)' }}>Contact Information</h3>
              <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Update the footer contact details shown across the site.
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location (Address)</label>
              <input
                type="text"
                className="form-input"
                value={siteLocation}
                onChange={e => setSiteLocation(e.target.value)}
                placeholder="e.g., 123 Ping Pong Way, Sports City"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={siteContactPhone}
                onChange={e => setSiteContactPhone(e.target.value)}
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-input"
                value={siteContactEmail}
                onChange={e => setSiteContactEmail(e.target.value)}
                placeholder="e.g., info@championshiptt.com"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Site Settings'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'certificates' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontFamily: "var(--font-family-heading)", fontSize: '1.5rem', color: 'var(--color-primary)' }}>
              <FaHandPaper /> Certificates Manager
            </h2>
            <button 
              className="btn btn-secondary" 
              onClick={handleDownloadAllCertificates}
              disabled={saving || players.length === 0}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FaFileArchive /> Download All Certificates
            </button>
          </div>

          <div className="m3-card" style={{ padding: '24px' }}>
            <p style={{ margin: '0 0 20px 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Select a player's placement and click "Send" to email it, or "Download" to generate a PDF certificate directly to your device.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'var(--color-surface-container)' }}>
                    <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Player</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Email Address</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Placement</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...players].sort((a, b) => a.rank - b.rank).map(p => {
                    const selectId = `cert-${p._id || p.id}`;
                    return (
                      <tr key={p._id || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-on-surface)' }}>{p.name}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--color-on-surface-variant)' }}>
                          {p.email ? p.email : <span style={{ color: 'var(--color-error)' }}>No Email</span>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <select id={selectId} className="form-input" style={{ width: '150px', padding: '6px', fontSize: '0.85rem' }}>
                            <option value="Participant">Participant</option>
                            <option value="Winner (1st Place)">Winner (1st Place)</option>
                            <option value="Runner-Up (2nd Place)">Runner-Up (2nd Place)</option>
                            <option value="3rd Place">3rd Place</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              disabled={saving}
                              onClick={() => {
                                const placement = document.getElementById(selectId).value;
                                handleDownloadCertificate(p, placement);
                              }}
                            >
                              <FaDownload style={{ marginRight: '4px' }} /> PDF
                            </button>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                              disabled={!p.email || saving}
                              onClick={() => {
                                const placement = document.getElementById(selectId).value;
                                handleSendCertificate(p._id || p.id, placement);
                              }}
                            >
                              <FaShareAlt style={{ marginRight: '4px' }} /> Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PLAYER MODAL (FORM) */}
      {isFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '16px' }}>
          <div className="m3-card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--color-on-surface)', fontFamily: "var(--font-family-heading)" }}>
                {editingPlayerId ? 'Edit Player Profile' : 'Add New Player'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-on-surface-variant)', fontSize: '20px', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tab Navigation for Form */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '8px' }}>
                <button type="button" onClick={() => setFormTab('basic')} className={`btn ${formTab === 'basic' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Basic Info</button>
                <button type="button" onClick={() => setFormTab('equipment')} className={`btn ${formTab === 'equipment' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Equipment & Media</button>
              </div>

              {formTab === 'basic' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="form-label">Player Name *</label>
                      <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Club Rank # *</label>
                      <input type="number" required min="1" className="form-input" value={rank} onChange={(e) => setRank(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Email Address (For Certificates)</label>
                    <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="player@example.com" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label className="form-label">Playing Style *</label>
                      <select className="form-input" value={playingStyle} onChange={(e) => setPlayingStyle(e.target.value)}>
                        <option value="Attack">Attack</option>
                        <option value="Offensive">Offensive</option>
                        <option value="Defense">Defense</option>
                        <option value="Defensive">Defensive</option>
                        <option value="All Round">All Round</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Playing Hand *</label>
                      <select className="form-input" value={playingHand} onChange={(e) => setPlayingHand(e.target.value)}>
                        <option value="Right Hand">Right Hand</option>
                        <option value="Left Hand">Left Hand</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Country</label>
                    <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </>
              )}

              {formTab === 'equipment' && (
                <>
                  {/* Avatar Upload */}
                  <div>
                    <label className="form-label">Player Avatar / Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {avatarPreview && !deleteAvatar && (
                        <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-primary)' }}>
                          <img src={avatarPreview.startsWith('data:') || avatarPreview.startsWith('http') || avatarPreview.startsWith('blob:') ? avatarPreview : `${api.defaults.baseURL || ''}${avatarPreview}`} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                        </div>
                      )}
                      <div style={{ flexGrow: 1 }}>
                        <input type="file" accept="image/*" className="form-input" onChange={(e) => {
                          if (e.target.files[0]) {
                            setAvatarFile(e.target.files[0]);
                            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                            setDeleteAvatar(false);
                          }
                        }} />
                      </div>
                      {avatarPreview && !deleteAvatar && (
                        <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => { setDeleteAvatar(true); setAvatarFile(null); }}>
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Blade */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '10px' }}>Blade</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label className="form-label">Brand</label>
                        <input type="text" className="form-input" value={bladeBrand} onChange={(e) => setBladeBrand(e.target.value)} placeholder="e.g. Butterfly" />
                      </div>
                      <div>
                        <label className="form-label">Model</label>
                        <input type="text" className="form-input" value={bladeModel} onChange={(e) => setBladeModel(e.target.value)} placeholder="e.g. Viscaria" />
                      </div>
                    </div>
                  </div>

                  {/* Forehand Rubber */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '10px' }}>Forehand Rubber</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label className="form-label">Brand & Model</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="form-input" value={forehandBrand} onChange={(e) => setForehandBrand(e.target.value)} placeholder="Brand" style={{ flex: 1 }} />
                          <input type="text" className="form-input" value={forehandModel} onChange={(e) => setForehandModel(e.target.value)} placeholder="Model" style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Thickness</label>
                        <input type="text" className="form-input" value={forehandSponge} onChange={(e) => setForehandSponge(e.target.value)} placeholder="e.g. 2.1mm or MAX" />
                      </div>
                    </div>
                  </div>

                  {/* Backhand Rubber */}
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-tertiary)', marginBottom: '10px' }}>Backhand Rubber</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label className="form-label">Brand & Model</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="form-input" value={backhandBrand} onChange={(e) => setBackhandBrand(e.target.value)} placeholder="Brand" style={{ flex: 1 }} />
                          <input type="text" className="form-input" value={backhandModel} onChange={(e) => setBackhandModel(e.target.value)} placeholder="Model" style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Thickness</label>
                        <input type="text" className="form-input" value={backhandSponge} onChange={(e) => setBackhandSponge(e.target.value)} placeholder="e.g. 2.1mm or MAX" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Player'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden container for PDF rendering */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -100 }}>
        <div ref={certificateRef}>
          <CertificateTemplate 
            playerName={certData.playerName} 
            placement={certData.placement} 
            date={certData.date} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
