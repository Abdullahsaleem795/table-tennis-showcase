import React from 'react';

const CertificateTemplate = ({ playerName = "PLAYER NAME", placement = "Participant", date = "October 24, 2026", venue = "FFL Sports Complex", organizer = "FFL Smash Committee" }) => {

  // Determine Tier Settings based on placement
  const isWinner = placement?.toLowerCase().includes('winner') || placement?.toLowerCase().includes('champion') || placement?.toLowerCase().includes('1st');
  const isRunnerUp = placement?.toLowerCase().includes('runner') || placement?.toLowerCase().includes('2nd');
  const isThird = placement?.toLowerCase().includes('3rd') || placement?.toLowerCase().includes('bronze');

  let theme = {
    primaryColor: '#002B49', // Royal Navy
    accentColor: '#4A90E2', // Bright Blue
    badgeColor: '#2B6CB0',
    title: 'CERTIFICATE OF PARTICIPATION',
    subtitle: 'TABLE TENNIS TOURNAMENT',
    positionTitle: 'HONORABLE PARTICIPANT',
    bgGradient: 'linear-gradient(135deg, #0A192F 0%, #172A45 50%, #0F172A 100%)',
    textColor: '#FFFFFF',
    secondaryText: '#94A3B8',
    borderColor: '#3B82F6',
    sealBg: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    trophyGradientStart: '#60A5FA',
    trophyGradientEnd: '#1D4ED8',
    badgeText: 'PARTICIPANT'
  };

  if (isWinner) {
    theme = {
      primaryColor: '#D4AF37', // Gold
      accentColor: '#FFD700',
      badgeColor: '#B8860B',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      subtitle: 'INTERNATIONAL TABLE TENNIS CHAMPIONSHIP',
      positionTitle: 'OFFICIAL CHAMPION - 1ST PLACE',
      bgGradient: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #09090B 100%)',
      textColor: '#FFFFFF',
      secondaryText: '#A1A1AA',
      borderColor: '#D4AF37',
      sealBg: 'linear-gradient(135deg, #FFE259 0%, #FFA751 100%)',
      trophyGradientStart: '#FFE259',
      trophyGradientEnd: '#F7B731',
      badgeText: 'GOLD MEDALIST'
    };
  } else if (isRunnerUp) {
    theme = {
      primaryColor: '#C0C0C0', // Silver
      accentColor: '#E2E8F0',
      badgeColor: '#718096',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      subtitle: 'TABLE TENNIS TOURNAMENT',
      positionTitle: 'RUNNER-UP - 2ND PLACE',
      bgGradient: 'linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #0B132B 100%)',
      textColor: '#FFFFFF',
      secondaryText: '#CBD5E1',
      borderColor: '#94A3B8',
      sealBg: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
      trophyGradientStart: '#F1F5F9',
      trophyGradientEnd: '#64748B',
      badgeText: 'SILVER MEDALIST'
    };
  } else if (isThird) {
    theme = {
      primaryColor: '#CD7F32', // Bronze
      accentColor: '#F97316',
      badgeColor: '#9A3412',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      subtitle: 'TABLE TENNIS TOURNAMENT',
      positionTitle: '2ND RUNNER-UP - 3RD PLACE',
      bgGradient: 'linear-gradient(135deg, #180C06 0%, #2A170A 50%, #120703 100%)',
      textColor: '#FFFFFF',
      secondaryText: '#D1D5DB',
      borderColor: '#EA580C',
      sealBg: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
      trophyGradientStart: '#FB923C',
      trophyGradientEnd: '#9A3412',
      badgeText: 'BRONZE MEDALIST'
    };
  }

  return (
    <div
      id="certificate-template"
      style={{
        width: '1122px', // A4 Landscape (standard print ratio)
        height: '793px',
        background: theme.bgGradient,
        position: 'relative',
        fontFamily: "'Cinzel', 'Montserrat', 'Inter', sans-serif",
        color: theme.textColor,
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '24px'
      }}
    >
      {/* Outer Geometric Frame */}
      <div style={{
        position: 'absolute',
        inset: '16px',
        border: `3px solid ${theme.borderColor}`,
        pointerEvents: 'none',
        zIndex: 5
      }}>
        {/* Corner Accents */}
        <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '24px', height: '24px', borderTop: `6px solid ${theme.accentColor}`, borderLeft: `6px solid ${theme.accentColor}` }} />
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '24px', height: '24px', borderTop: `6px solid ${theme.accentColor}`, borderRight: `6px solid ${theme.accentColor}` }} />
        <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '24px', height: '24px', borderBottom: `6px solid ${theme.accentColor}`, borderLeft: `6px solid ${theme.accentColor}` }} />
        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '24px', height: '24px', borderBottom: `6px solid ${theme.accentColor}`, borderRight: `6px solid ${theme.accentColor}` }} />
      </div>

      {/* Inner Thin Border */}
      <div style={{
        width: '100%',
        height: '100%',
        border: `1px solid ${theme.secondaryText}44`,
        boxSizing: 'border-box',
        padding: '32px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Abstract Background Vectors (Speed Lines & Mesh) */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12, pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Speed Streaks */}
          <path d="M -100 200 L 400 -50 M -50 400 L 600 -100 M 800 900 L 1300 400" stroke={theme.accentColor} strokeWidth="3" strokeDasharray="10,15" />
        </svg>

        {/* TOP HEADER SECTION */}
        <div style={{ textAlign: 'center', width: '100%', zIndex: 10 }}>
          {/* ITTF / Tournament Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ height: '1px', width: '60px', background: theme.borderColor }}></span>
            <span style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: theme.primaryColor, fontWeight: '700' }}>
              OFFICIAL CHAMPIONSHIP AWARD
            </span>
            <span style={{ height: '1px', width: '60px', background: theme.borderColor }}></span>
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: '900',
            letterSpacing: '6px',
            margin: '4px 0',
            textTransform: 'uppercase',
            background: `linear-gradient(180deg, #FFFFFF 0%, ${theme.secondaryText} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {theme.title}
          </h1>

          <div style={{ fontSize: '15px', letterSpacing: '5px', color: theme.primaryColor, fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
            {theme.subtitle} • FFL SMASH
          </div>

          {/* Decorative Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '8px 0' }}>
            <div style={{ height: '2px', width: '120px', background: `linear-gradient(90deg, transparent, ${theme.borderColor})` }}></div>
            
            {/* Table Tennis Paddle SVG Icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.primaryColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" fill={`${theme.primaryColor}22`} />
              <path d="M12 15l-3 6" stroke={theme.accentColor} strokeWidth="2" />
              <circle cx="16" cy="8" r="2" fill={theme.accentColor} />
            </svg>

            <div style={{ height: '2px', width: '120px', background: `linear-gradient(-90deg, transparent, ${theme.borderColor})` }}></div>
          </div>
        </div>

        {/* MIDDLE SECTION - PLAYER & CITATION */}
        <div style={{ textAlign: 'center', width: '100%', margin: '10px 0', zIndex: 10 }}>
          <p style={{ fontSize: '16px', color: theme.secondaryText, fontStyle: 'italic', margin: '0 0 8px 0', letterSpacing: '1px' }}>
            THIS DIPLOMA IS PROUDLY PRESENTED TO
          </p>

          {/* Player Name */}
          <div style={{ position: 'relative', display: 'inline-block', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '52px',
              fontWeight: '800',
              color: '#FFFFFF',
              margin: '0',
              fontFamily: "'Cinzel', 'Georgia', serif",
              letterSpacing: '2px',
              textShadow: `0 0 25px ${theme.primaryColor}66`
            }}>
              {playerName}
            </h2>
            <div style={{ height: '2px', width: '100%', background: `linear-gradient(90deg, transparent, ${theme.primaryColor}, transparent)`, marginTop: '6px' }}></div>
          </div>

          {/* Citation / Position */}
          <p style={{ fontSize: '17px', color: '#E2E8F0', maxWidth: '820px', margin: '16px auto 0 auto', lineHeight: '1.6', letterSpacing: '0.5px' }}>
            FOR OUTSTANDING SPORTSMANSHIP AND EXCELLENT PERFORMANCE SECURING THE POSITION OF
          </p>

          {/* Position Badge Box */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            padding: '8px 24px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '4px',
            boxShadow: `0 0 15px ${theme.primaryColor}33`
          }}>
            {/* Trophy Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 3h12v4a6 6 0 01-12 0V3z" fill={`url(#trophyGrad-${placement})`} />
              <path d="M9 14v3m6-3v3m-9-6h12m-6 6v2m-4 0h8" stroke={theme.primaryColor} strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id={`trophyGrad-${placement}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={theme.trophyGradientStart} />
                  <stop offset="100%" stopColor={theme.trophyGradientEnd} />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: theme.accentColor, textTransform: 'uppercase' }}>
              {theme.positionTitle}
            </span>
          </div>
        </div>

        {/* BOTTOM METADATA & SIGNATURES */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, padding: '0 20px 10px 20px' }}>

          {/* Event Details (Left) */}
          <div style={{ textAlign: 'left', fontSize: '12px', color: theme.secondaryText, lineHeight: '1.8' }}>
            <div><strong style={{ color: theme.textColor }}>DATE:</strong> {date}</div>
            <div><strong style={{ color: theme.textColor }}>VENUE:</strong> {venue}</div>
            <div><strong style={{ color: theme.textColor }}>ORGANIZER:</strong> {organizer}</div>
          </div>

          {/* Official Stamp & Seal (Center) */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: theme.sealBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${theme.primaryColor}88`,
            border: '3px solid #FFFFFF',
            position: 'relative',
            margin: '0 20px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5">
              <path d="M12 2l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 9l6-1z" fill="rgba(255,255,255,0.2)" />
            </svg>
            <span style={{ fontSize: '8px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', marginTop: '2px' }}>OFFICIAL</span>
            <span style={{ fontSize: '7px', color: '#FFFFFF', letterSpacing: '0.5px' }}>SEAL</span>
          </div>

          {/* Signatures (Right) */}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ textAlign: 'center', width: '160px' }}>
              <div style={{ fontSize: '18px', fontFamily: "'Georgia', serif", color: theme.accentColor, fontStyle: 'italic', marginBottom: '4px' }}>
                Abdullah Saleem
              </div>
              <div style={{ borderTop: `1px solid ${theme.secondaryText}`, paddingTop: '4px', fontSize: '11px', fontWeight: '600', color: theme.secondaryText, letterSpacing: '1px' }}>
                TOURNAMENT DIRECTOR
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '160px' }}>
              <div style={{ fontSize: '18px', fontFamily: "'Georgia', serif", color: theme.accentColor, fontStyle: 'italic', marginBottom: '4px' }}>
                FFL Committee
              </div>
              <div style={{ borderTop: `1px solid ${theme.secondaryText}`, paddingTop: '4px', fontSize: '11px', fontWeight: '600', color: theme.secondaryText, letterSpacing: '1px' }}>
                EVENT COORDINATOR
              </div>
            </div>
          </div>

        </div>

        {/* QR Code Placeholder at bottom corner */}
        <div style={{ position: 'absolute', bottom: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
          <div style={{ width: '28px', height: '28px', background: '#FFFFFF', padding: '2px', borderRadius: '2px' }}>
            {/* Simple QR Code pattern SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000">
              <rect x="1" y="1" width="7" height="7" />
              <rect x="3" y="3" width="3" height="3" fill="#FFFFFF" />
              <rect x="16" y="1" width="7" height="7" />
              <rect x="18" y="3" width="3" height="3" fill="#FFFFFF" />
              <rect x="1" y="16" width="7" height="7" />
              <rect x="3" y="18" width="3" height="3" fill="#FFFFFF" />
              <rect x="10" y="10" width="4" height="4" />
              <rect x="15" y="15" width="4" height="4" />
            </svg>
          </div>
          <span style={{ fontSize: '9px', letterSpacing: '1px', color: theme.secondaryText }}>VERIFIED AWARD ID: FFL-2026-CERT</span>
        </div>

      </div>
    </div>
  );
};

export default CertificateTemplate;
