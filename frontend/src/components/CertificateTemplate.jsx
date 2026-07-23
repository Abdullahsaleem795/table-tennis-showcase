import React from 'react';

const CertificateTemplate = ({ playerName = "PLAYER NAME", placement = "Participant", date = "October 24, 2026", venue = "FFL Sports Complex", organizer = "FFL Smash Committee" }) => {

  // Tier Colors for Light Professional Theme (Soft, Premium, No Hard Edges)
  const isWinner = placement?.toLowerCase().includes('winner') || placement?.toLowerCase().includes('champion') || placement?.toLowerCase().includes('1st');
  const isRunnerUp = placement?.toLowerCase().includes('runner') || placement?.toLowerCase().includes('2nd');
  const isThird = placement?.toLowerCase().includes('3rd') || placement?.toLowerCase().includes('bronze');

  let theme = {
    primaryAccent: '#2563EB', // Sapphire Blue
    secondaryAccent: '#3B82F6',
    badgeBg: '#EFF6FF',
    badgeText: '#1E40AF',
    title: 'CERTIFICATE OF PARTICIPATION',
    positionLabel: 'HONORABLE PARTICIPANT',
    sealGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    bgGradient: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
    textColor: '#0F172A',
    mutedText: '#64748B',
    borderOutline: 'rgba(37, 99, 235, 0.15)',
    iconColor: '#2563EB'
  };

  if (isWinner) {
    theme = {
      primaryAccent: '#D97706', // Warm Gold / Amber
      secondaryAccent: '#F59E0B',
      badgeBg: '#FFFBEB',
      badgeText: '#92400E',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: 'CHAMPION • 1ST PLACE',
      sealGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      bgGradient: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDF5 100%)',
      textColor: '#18181B',
      mutedText: '#71717A',
      borderOutline: 'rgba(217, 119, 6, 0.2)',
      iconColor: '#D97706'
    };
  } else if (isRunnerUp) {
    theme = {
      primaryAccent: '#475569', // Slate / Silver
      secondaryAccent: '#64748B',
      badgeBg: '#F8FAFC',
      badgeText: '#334155',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: 'RUNNER-UP • 2ND PLACE',
      sealGradient: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)',
      bgGradient: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
      textColor: '#0F172A',
      mutedText: '#64748B',
      borderOutline: 'rgba(71, 85, 105, 0.2)',
      iconColor: '#475569'
    };
  } else if (isThird) {
    theme = {
      primaryAccent: '#C2410C', // Warm Bronze
      secondaryAccent: '#EA580C',
      badgeBg: '#FFF7ED',
      badgeText: '#9A3412',
      title: 'CERTIFICATE OF ACHIEVEMENT',
      positionLabel: '2ND RUNNER-UP • 3RD PLACE',
      sealGradient: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
      bgGradient: 'linear-gradient(145deg, #FFFFFF 0%, #FFF7ED 100%)',
      textColor: '#1C1917',
      mutedText: '#78716C',
      borderOutline: 'rgba(194, 65, 12, 0.2)',
      iconColor: '#C2410C'
    };
  }

  return (
    <div
      id="certificate-template"
      style={{
        width: '1122px', // Standard A4 Landscape
        height: '793px',
        background: theme.bgGradient,
        position: 'relative',
        fontFamily: "'Inter', 'Montserrat', -apple-system, sans-serif",
        color: theme.textColor,
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: '36px',
        borderRadius: '24px', // Soft rounded corners - NO HARD EDGES
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
      }}
    >
      {/* Outer Curved Soft Border Frame */}
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '18px',
        border: `2px solid ${theme.borderOutline}`,
        boxSizing: 'border-box',
        padding: '40px 50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        background: '#FFFFFF',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.01)'
      }}>

        {/* Subtle Background Watermark Graphic */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
          <circle cx="561" cy="396" r="300" fill="none" stroke={theme.primaryAccent} strokeWidth="40" strokeDasharray="10 20" />
        </svg>

        {/* TOP HEADER SECTION */}
        <div style={{ textAlign: 'center', width: '100%', zIndex: 10 }}>
          
          {/* Sub-header / Organization pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '20px',
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            <span>🏓</span>
            <span>FFL SMASH • TABLE TENNIS CHAMPIONSHIP</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: '46px',
            fontWeight: '800',
            letterSpacing: '4px',
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            color: theme.textColor,
            fontFamily: "'Montserrat', 'Inter', sans-serif"
          }}>
            {theme.title}
          </h1>

          {/* Soft Accent Line */}
          <div style={{
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: theme.primaryAccent,
            margin: '0 auto'
          }}></div>
        </div>

        {/* MIDDLE SECTION - RECIPIENT & ACHIEVEMENT */}
        <div style={{ textAlign: 'center', width: '100%', margin: '15px 0', zIndex: 10 }}>
          <p style={{ fontSize: '16px', color: theme.mutedText, letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500', margin: '0 0 12px 0' }}>
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>

          {/* Participant Name - Big Modern Typography */}
          <h2 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: theme.textColor,
            margin: '0 0 12px 0',
            fontFamily: "'Playfair Display', 'Georgia', serif",
            letterSpacing: '1px'
          }}>
            {playerName}
          </h2>

          <p style={{ fontSize: '17px', color: theme.mutedText, maxWidth: '720px', margin: '0 auto 20px auto', lineHeight: '1.7' }}>
            for demonstrating exceptional athletic performance and outstanding sportsmanship in the official tournament.
          </p>

          {/* Soft Rounded Placement Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 28px',
            borderRadius: '30px',
            backgroundColor: theme.badgeBg,
            border: `1.5px solid ${theme.borderOutline}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={theme.iconColor}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '2px', color: theme.badgeText, textTransform: 'uppercase' }}>
              {theme.positionLabel}
            </span>
          </div>
        </div>

        {/* BOTTOM METADATA & SIGNATURES SECTION */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10, padding: '0 10px' }}>

          {/* Event Details (Left) */}
          <div style={{ textAlign: 'left', fontSize: '13px', color: theme.mutedText, lineHeight: '1.9' }}>
            <div><strong style={{ color: theme.textColor }}>DATE:</strong> {date}</div>
            <div><strong style={{ color: theme.textColor }}>VENUE:</strong> {venue}</div>
            <div><strong style={{ color: theme.textColor }}>ORGANIZER:</strong> {organizer}</div>
          </div>

          {/* Official Soft Rounded Stamp / Seal (Center) */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: theme.sealGradient,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', marginTop: '2px' }}>OFFICIAL</span>
            <span style={{ fontSize: '8px', opacity: 0.9 }}>AWARD</span>
          </div>

          {/* Signatures (Right) */}
          <div style={{ display: 'flex', gap: '50px' }}>
            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ fontSize: '20px', fontFamily: "'Playfair Display', 'Georgia', serif", color: theme.textColor, fontStyle: 'italic', marginBottom: '6px' }}>
                Abdullah Saleem
              </div>
              <div style={{ borderTop: `1.5px solid ${theme.mutedText}44`, paddingTop: '6px', fontSize: '11px', fontWeight: '700', color: theme.mutedText, letterSpacing: '1.5px' }}>
                TOURNAMENT DIRECTOR
              </div>
            </div>

            <div style={{ textAlign: 'center', width: '150px' }}>
              <div style={{ fontSize: '20px', fontFamily: "'Playfair Display', 'Georgia', serif", color: theme.textColor, fontStyle: 'italic', marginBottom: '6px' }}>
                FFL Committee
              </div>
              <div style={{ borderTop: `1.5px solid ${theme.mutedText}44`, paddingTop: '6px', fontSize: '11px', fontWeight: '700', color: theme.mutedText, letterSpacing: '1.5px' }}>
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
