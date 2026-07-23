import React from 'react';

const CertificateTemplate = ({ playerName, placement, date }) => {
  return (
    <div
      id="certificate-template"
      style={{
        width: '1122px', // A4 landscape width at 96 DPI
        height: '793px', // A4 landscape height at 96 DPI
        backgroundColor: '#ffffff',
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        color: '#1a1a1a',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        // Creating a premium gold/black layered border effect
        border: '15px solid #000000',
        outline: '10px solid #d4af37',
        outlineOffset: '-25px'
      }}
    >
      {/* Background Graphic Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '400px',
        color: 'rgba(212, 175, 55, 0.05)',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        🏓
      </div>

      <div style={{ zIndex: 2, position: 'relative', width: '100%', height: '100%', padding: '40px', border: '2px solid rgba(212, 175, 55, 0.5)' }}>
        
        {/* Header */}
        <h1 style={{ 
          fontSize: '64px', 
          fontWeight: '900', 
          color: '#000000',
          textTransform: 'uppercase',
          letterSpacing: '8px',
          margin: '0 0 20px 0'
        }}>
          Certificate of {placement?.includes('Winner') ? 'Achievement' : placement?.includes('Runner') ? 'Excellence' : 'Participation'}
        </h1>
        
        <div style={{
          width: '120px',
          height: '4px',
          backgroundColor: '#d4af37',
          margin: '0 auto 40px auto'
        }}></div>

        <p style={{ fontSize: '24px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
          This is to certify that
        </p>

        {/* Player Name */}
        <h2 style={{ 
          fontSize: '72px', 
          fontWeight: '700', 
          color: '#d4af37',
          margin: '0 0 30px 0',
          fontFamily: "'Georgia', serif",
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          {playerName}
        </h2>

        <p style={{ fontSize: '24px', color: '#333', maxWidth: '80%', margin: '0 auto 60px auto', lineHeight: '1.6' }}>
          has successfully participated and secured the title of <strong style={{color: '#000'}}>{placement}</strong> in the official <strong style={{color: '#d4af37'}}>FFL Smash</strong> Table Tennis Tournament.
        </p>

        {/* Signatures */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '80%',
          margin: '0 auto',
          position: 'absolute',
          bottom: '60px',
          left: '10%'
        }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ fontSize: '24px', fontFamily: "'Georgia', serif", color: '#000', marginBottom: '10px', fontStyle: 'italic' }}>FFL Smash</div>
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', fontWeight: 'bold' }}>Tournament Director</div>
          </div>
          
          <div style={{ textAlign: 'center', width: '250px' }}>
            <div style={{ fontSize: '24px', fontFamily: "'Georgia', serif", color: '#000', marginBottom: '10px' }}>{date}</div>
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', fontWeight: 'bold' }}>Date Awarded</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateTemplate;
