import React from 'react';

const CertificateTemplate = ({ 
  playerName = "Candidates Name", 
  placement = "Participant", 
  date = "October 24, 2026", 
  venue = "FFL Sports Complex", 
  organizer = "FFL Smash Committee" 
}) => {

  const isWinner = placement?.toLowerCase().includes('winner') || placement?.toLowerCase().includes('champion') || placement?.toLowerCase().includes('1st');
  const isRunnerUp = placement?.toLowerCase().includes('runner') || placement?.toLowerCase().includes('2nd');
  const isThird = placement?.toLowerCase().includes('3rd') || placement?.toLowerCase().includes('bronze');

  // Tier Color Settings
  let theme = {
    badgeTitle: 'AWARD',
    badgeSub: 'WINNER',
    positionText: 'CHAMPION • 1ST PLACE',
    certType: 'OF ACHIEVEMENT',
    navyColor: '#0A1128',
    goldGrad: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
    goldColor: '#D97706',
    ribbonColor: '#F59E0B',
    laurelColor: '#D97706',
    badgeRibbon: '#0A1128',
  };

  if (isWinner) {
    theme = {
      badgeTitle: 'BEST',
      badgeSub: '1ST PLACE',
      positionText: 'CHAMPION • 1ST PLACE',
      certType: 'OF ACHIEVEMENT',
      navyColor: '#0A1128',
      goldGrad: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
      goldColor: '#D97706',
      ribbonColor: '#F59E0B',
      laurelColor: '#D97706',
      badgeRibbon: '#0A1128',
    };
  } else if (isRunnerUp) {
    theme = {
      badgeTitle: 'SILVER',
      badgeSub: '2ND PLACE',
      positionText: 'RUNNER-UP • 2ND PLACE',
      certType: 'OF ACHIEVEMENT',
      navyColor: '#0F172A',
      goldGrad: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #475569 100%)',
      goldColor: '#475569',
      ribbonColor: '#94A3B8',
      laurelColor: '#64748B',
      badgeRibbon: '#0F172A',
    };
  } else if (isThird) {
    theme = {
      badgeTitle: 'BRONZE',
      badgeSub: '3RD PLACE',
      positionText: '2ND RUNNER-UP • 3RD PLACE',
      certType: 'OF ACHIEVEMENT',
      navyColor: '#1C1917',
      goldGrad: 'linear-gradient(135deg, #FB923C 0%, #EA580C 50%, #9A3412 100%)',
      goldColor: '#C2410C',
      ribbonColor: '#EA580C',
      laurelColor: '#C2410C',
      badgeRibbon: '#1C1917',
    };
  } else {
    theme = {
      badgeTitle: 'OFFICIAL',
      badgeSub: 'PARTICIPANT',
      positionText: 'HONORABLE PARTICIPANT',
      certType: 'OF PARTICIPATION',
      navyColor: '#0A1128',
      goldGrad: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)',
      goldColor: '#2563EB',
      ribbonColor: '#3B82F6',
      laurelColor: '#2563EB',
      badgeRibbon: '#0A1128',
    };
  }

  return (
    <div
      id="certificate-template"
      style={{
        width: '1122px', // A4 Landscape
        height: '793px',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        color: '#0F172A',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}
    >
      {/* Import Google Fonts for Calligraphy Script */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;600;700;800;900&family=Cinzel:wght@700&display=swap');
        .script-font {
          font-family: 'Great Vibes', 'Playfair Display', cursive, serif;
        }
        .montserrat-font {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* TOP LEFT DARK SWOOSH & GOLD WAVE RIBBON (SVG) */}
      <svg 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 1122 793"
        fill="none"
      >
        <defs>
          <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Gold Ribbon Under Wave */}
        <path 
          d="M 0,420 Q 250,280 750,220 Q 950,200 1122,300 L 1122,330 Q 950,230 750,250 Q 250,310 0,460 Z" 
          fill="url(#goldRibbonGrad)" 
        />

        {/* Dark Navy Header Swoosh */}
        <path 
          d="M 0,0 L 780,0 Q 500,240 0,360 Z" 
          fill={theme.navyColor} 
        />
      </svg>

      {/* INNER MARGIN BORDER LINE */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        right: '40px',
        bottom: '40px',
        border: `2px solid ${theme.navyColor}`,
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: 2
      }}></div>

      {/* TOP LEFT TEXT (INSIDE NAVY SWOOSH) */}
      <div style={{
        position: 'absolute',
        top: '65px',
        left: '70px',
        zIndex: 10,
        color: '#FFFFFF'
      }}>
        <h1 className="montserrat-font" style={{
          fontSize: '48px',
          fontWeight: '900',
          letterSpacing: '4px',
          margin: '0',
          lineHeight: '1',
          textTransform: 'uppercase'
        }}>
          CERTIFICATE
        </h1>
        <div className="montserrat-font" style={{
          fontSize: '18px',
          fontWeight: '700',
          letterSpacing: '6px',
          color: '#F59E0B',
          marginTop: '10px',
          textTransform: 'uppercase'
        }}>
          {theme.certType}
        </div>
      </div>

      {/* TOP RIGHT GOLD AWARD BADGE WITH HANGING RIBBONS */}
      <div style={{
        position: 'absolute',
        top: '45px',
        right: '90px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Scalloped Gold Circular Badge */}
        <div style={{
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          background: theme.goldGrad,
          padding: '6px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Inner Navy Circle */}
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: theme.navyColor,
            border: '2px dashed #FEF08A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#FFFFFF',
            padding: '10px'
          }}>
            {/* Small Crown Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F59E0B">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
            <span className="montserrat-font" style={{ fontSize: '18px', fontWeight: '900', color: '#F59E0B', letterSpacing: '1px', marginTop: '2px' }}>
              {theme.badgeTitle}
            </span>
            <span className="montserrat-font" style={{ fontSize: '9px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '1px' }}>
              {theme.badgeSub}
            </span>
          </div>
        </div>

        {/* Hanging Ribbon Tails under Badge */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '-15px', zIndex: -1 }}>
          <div style={{
            width: '28px',
            height: '55px',
            backgroundColor: theme.navyColor,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)'
          }}></div>
          <div style={{
            width: '28px',
            height: '55px',
            backgroundColor: theme.navyColor,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)'
          }}></div>
        </div>
      </div>

      {/* CENTER CONTENT AREA */}
      <div style={{
        position: 'absolute',
        top: '290px',
        left: '0',
        width: '1122px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: 5
      }}>
        {/* PROUDLY PRESENTED TO */}
        <div className="montserrat-font" style={{
          fontSize: '14px',
          fontWeight: '800',
          letterSpacing: '4px',
          color: '#1E293B',
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          PROUDLY PRESENTED TO
        </div>

        {/* CANDIDATE NAME (ELEGANT CALLIGRAPHY SCRIPT) */}
        <div className="script-font" style={{
          fontSize: '76px',
          color: theme.navyColor,
          lineHeight: '1.1',
          margin: '0 0 15px 0',
          padding: '0 40px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
        }}>
          {playerName}
        </div>

        {/* ACHIEVEMENT DESCRIPTION TEXT */}
        <div className="montserrat-font" style={{
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '2px',
          color: theme.goldColor,
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          FFL SMASH TABLE TENNIS CHAMPIONSHIP • {theme.positionText}
        </div>

        <p style={{
          fontSize: '14px',
          color: '#475569',
          maxWidth: '680px',
          lineHeight: '1.7',
          margin: '0 auto'
        }}>
          For outstanding performance, dedication, and sportsmanship demonstrated during the tournament competition held at {venue}.
        </p>

        {/* BOTTOM SECTION: DATE - LAUREL EMBLEM - SIGNATURE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '780px',
          marginTop: '65px'
        }}>
          {/* Left: Date */}
          <div style={{ width: '220px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '8px', minHeight: '22px' }}>
              {date}
            </div>
            <div style={{ borderTop: `2px solid ${theme.navyColor}`, paddingTop: '6px' }}>
              <span className="montserrat-font" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', color: '#1E293B' }}>
                DATE
              </span>
            </div>
          </div>

          {/* Center: Gold Laurel Emblem with Star */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="70" height="60" viewBox="0 0 100 80" fill={theme.goldColor}>
              {/* Laurel Wreath Left */}
              <path d="M 40,75 C 20,60 10,40 15,20 C 22,30 30,45 42,55 M 35,60 C 15,45 8,25 15,5 C 20,18 28,33 37,45 M 28,40 C 10,25 8,10 18,0 C 20,10 26,22 32,30" />
              {/* Laurel Wreath Right */}
              <path d="M 60,75 C 80,60 90,40 85,20 C 78,30 70,45 58,55 M 65,60 C 85,45 92,25 85,5 C 80,18 72,33 63,45 M 72,40 C 90,25 92,10 82,0 C 80,10 74,22 68,30" />
              {/* Star at Center */}
              <polygon points="50,45 53,54 62,54 55,60 57,69 50,63 43,69 45,60 38,54 47,54" fill={theme.goldColor} />
            </svg>
            <div className="montserrat-font" style={{ fontSize: '9px', fontWeight: '900', letterSpacing: '2px', color: theme.goldColor, marginTop: '-5px' }}>
              OFFICIAL AWARD
            </div>
          </div>

          {/* Right: Signature (Blank above line for physical signing) */}
          <div style={{ width: '220px', textAlign: 'center' }}>
            <div style={{ height: '30px' }}></div> {/* Blank space for physical signing */}
            <div style={{ borderTop: `2px solid ${theme.navyColor}`, paddingTop: '6px' }}>
              <span className="montserrat-font" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '2px', color: '#1E293B' }}>
                SIGNATURE
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CertificateTemplate;
