import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import api from '../services/api';
import Toast from '../components/Toast';

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSettings(res.data))
      .catch((err) => console.error("Error loading settings in contact page:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ message: 'Please fill in name, email, and message.', type: 'error' });
      return;
    }

    setSending(true);
    // Mimic API post for sending message
    setTimeout(() => {
      setSending(false);
      setToast({ message: 'Thank you! Your message has been sent successfully.', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const contactEmail = settings?.contactEmail || "info@championshiptt.com";
  const contactPhone = settings?.contactPhone || "+1 (555) 123-4567";
  const location = settings?.location || "123 Ping Pong Way, Sports City";
  const facebook = settings?.socialLinks?.facebook || "https://facebook.com";
  const instagram = settings?.socialLinks?.instagram || "https://instagram.com";
  const youtube = settings?.socialLinks?.youtube || "https://youtube.com";

  return (
    <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '60px' }}>
      <div className="bg-glow bg-glow-2"></div>
      
      <div className="section-padding container-width">
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ color: '#2563eb', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Get In Touch</span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '4px', textTransform: 'uppercase' }} className="text-gradient">
            Contact Our Team
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '12px auto 0', fontSize: '0.95rem' }}>
            Have questions about training schedules, sponsorships, or ranking qualifications? Drop us a line below.
          </p>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* Column 1: Contact info card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>Club Information</h2>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '24px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <FaMapMarkerAlt style={{ color: '#2563eb', fontSize: '20px', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', marginBottom: '2px' }}>Location</h4>
                    <p style={{ color: '#94a3b8' }}>{location}</p>
                  </div>
                </li>
                
                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <FaPhone style={{ color: '#2563eb', fontSize: '18px', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', marginBottom: '2px' }}>Phone Number</h4>
                    <p style={{ color: '#94a3b8' }}>{contactPhone}</p>
                  </div>
                </li>

                <li style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <FaEnvelope style={{ color: '#2563eb', fontSize: '18px', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', marginBottom: '2px' }}>Email Address</h4>
                    <a href={`mailto:${contactEmail}`} style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ffffff'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}>
                      {contactEmail}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social media connections */}
            <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <h4 style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif", fontSize: '1rem', marginBottom: '16px', textTransform: 'uppercase' }}>Social Connect</h4>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <a href={facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '24px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#2563eb'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}><FaFacebook /></a>
                <a href={instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '24px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ea4c89'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}><FaInstagram /></a>
                <a href={youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '24px', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#ef4444'} onMouseLeave={(e)=>e.target.style.color='#94a3b8'}><FaYoutube /></a>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '24px', fontFamily: "'Outfit', sans-serif" }}>Send Message</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label" htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Sponsorship Proposal"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" htmlFor="message">Message Body</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your inquiry here..."
                  className="form-input"
                  rows="5"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn btn-primary"
                style={{ justifyContent: 'center', width: '100%', gap: '10px' }}
              >
                {sending ? 'Sending...' : 'Send Message'} <FaPaperPlane style={{ fontSize: '14px' }} />
              </button>
            </form>
          </div>

        </div>
      </div>

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

export default Contact;
