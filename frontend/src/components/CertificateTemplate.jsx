import React from 'react';

const CertificateTemplate = ({ playerName = "PLAYER NAME", placement = "Participant", date = "October 24, 2026", venue = "FFL Sports Complex", organizer = "FFL Smash Committee" }) => {

  // Tier Colors (Modern, Professional, Clean Light Theme - NO EMOJIS, BLANK SIGNATURE SPACES)
  const isWinner = placement?.toLowerCase().includes('winner') || placement?.toLowerCase().includes('champion') || placement?.toLowerCase().includes('1st');
  const isRunnerUp = placement?.toLowerCase().includes('runner') || placement?.toLowerCase().includes('2nd');
  const isThird = placement?.toLowerCase().includes('3rd') || placement?.toLowerCase().includes('bronze');

  let theme = {
    primaryAccent: '#0D9488', // Teal / Emerald Accent
    secondaryAccent: '#14B8A6',
    badgeBg: '#F0FDFA',
    badgeText: '#0F766E',
    title: 'CERTIFICATE OF PARTICIPATION',
    positionLabel: 'HONORABLE PARTICIPANT',
    sealBg: 'linear-gradient(135deg, #0D9488 0%, #115E59 100%)',
    borderOutline: 'rgba(13, 148, 136, 0.2)',
  };

  if (isWinner) {
    theme = {
      primaryAccent: '#D97706', // Warm Gold / Amber Accent
      secondaryAccent: '#F59E0B',
      badgeBg: '#FFFBEB',
      badgeText: '#B45309',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: 'CHAMPION • 1ST PLACE',
      sealBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      borderOutline: 'rgba(217, 119, 6, 0.25)',
    };
  } else if (isRunnerUp) {
    theme = {
      primaryAccent: '#3B82F6', // Cobalt Royal Blue Accent
      secondaryAccent: '#60A5FA',
      badgeBg: '#EFF6FF',
      badgeText: '#1D4ED8',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: 'RUNNER-UP • 2ND PLACE',
      sealBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      borderOutline: 'rgba(59, 130, 246, 0.25)',
    };
  } else if (isThird) {
    theme = {
      primaryAccent: '#EA580C', // Bronze / Terracotta Accent
      secondaryAccent: '#FB923C',
      badgeBg: '#FFF7ED',
      badgeText: '#C2410C',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: '2ND RUNNER-UP • 3RD PLACE',
      sealBg: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
      borderOutline: 'rgba(234, 88, 12, 0.25)',
    };
  }

  return (
    <div
      id="certificate-template"
      style={{
        width: '1122px', // Standard A4 Landscape
        height: '793px',
        background: '#FFFFFF',
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#0F172A',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '32px',
        borderRadius: '24px', // Soft rounded corners - NO HARD EDGES
      }}
    >
      {/* Outer Soft Rounded Frame */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        border: `2px solid ${theme.borderOutline}`,
        boxSizing: 'border-box',
        padding: '44px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)'
      }}>

        {/* TOP HEADER SECTION */}
        <div style={{ textAlign: 'center', width: '100%', zIndex: 10 }}>
          
          {/* Organization Tag (Vector Icon, No Emojis) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 20px',
            borderRadius: '20px',
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            {/* Table Tennis Racket Vector Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="10" r="7" />
              <path d="M12 17v5" strokeLinecap="round" />
            </svg>
            <span>FFL SMASH • TABLE TENNIS CHAMPIONSHIP</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: '44px',
            fontWeight: '800',
            letterSpacing: '5px',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            color: '#0F172A',
            fontFamily: "'Inter', sans-serif"
          }}>
            {theme.title}
          </h1>

          {/* Minimal Accent Line */}
          <div style={{
            width: '60px',
            height: '3px',
            borderRadius: '2px',
            backgroundColor: theme.primaryAccent,
            margin: '0 auto'
          }}></div>
        </div>

        {/* MIDDLE SECTION - RECIPIENT & CITATION */}
        <div style={{ textAlign: 'center', width: '100%', margin: '10px 0', zIndex: 10 }}>
          <p style={{ fontSize: '15px', color: '#64748B', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 14px 0' }}>
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>

          {/* Participant Name */}
          <h2 style={{
            fontSize: '54px',
            fontWeight: '800',
            color: '#0F172A',
            margin: '0 0 14px 0',
            letterSpacing: '-0.5px'
          }}>
            {playerName}
          </h2>

          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '700px', margin: '0 auto 22px auto', lineHeight: '1.7' }}>
            for demonstrating exceptional skill, determination, and sportsmanship in the official tournament competition.
          </p>

          {/* Soft Position Badge (Vector Icon) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 24px',
            borderRadius: '24px',
            backgroundColor: theme.badgeBg,
            border: `1px solid ${theme.borderOutline}`,
          }}>
            {/* Star Award Vector */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill={theme.badgeText}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '2px', color: theme.badgeText, textTransform: 'uppercase' }}>
              {theme.positionLabel}
            </span>
          </div>
        </div>

        {/* BOTTOM METADATA & SIGNATURES SECTION */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, padding: '0 10px' }}>

          {/* Event Details (Left) */}
          <div style={{ textAlign: 'left', fontSize: '13px', color: '#64748B', lineHeight: '1.9' }}>
            <div><strong style={{ color: '#0F172A' }}>DATE:</strong> {date}</div>
            <div><strong style={{ color: '#0F172A' }}>VENUE:</strong> {venue}</div>
            <div><strong style={{ color: '#0F172A' }}>ORGANIZER:</strong> {organizer}</div>
          </div>

          {/* Official Clean Vector Seal (Center) */}
          <div style={{
            width: '86px',
            height: '86px',
            borderRadius: '50%',
            background: theme.sealBg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            color: '#FFFFFF'
          }}>
            {/* Ribbon Award Vector SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
              <circle cx="12" cy="9" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
            <span style={{ fontSize: '8px', fontWeight: '800', letterSpacing: '1.5px', marginTop: '4px' }}>OFFICIAL</span>
            <span style={{ fontSize: '7px', opacity: 0.9 }}>SEAL</span>
          </div>

          {/* Signatures - BLANK SPACES FOR PHYSICAL HANDWRITTEN SIGNATURES */}
          <div style={{ display: 'flex', gap: '50px' }}>
            <div style={{ textAlign: 'center', width: '160px' }}>
              {/* Blank space for physical sign */}
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1.5px solid #CBD5E1', paddingTop: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '1.5px' }}>
                TOURNAMENT DIRECTOR
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '160px' }}>
              {/* Blank space for physical sign */}
              <div style={{ height: '40px' }}></div>
              <div style={{ borderTop: '1.5px solid #CBD5E1', paddingTop: '6px', fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '1.5px' }}>
                EVENT COORDINATOR
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CertificateTemplate;
