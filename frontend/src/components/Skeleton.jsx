import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="m3-card" style={{ height: '360px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px' }} />
      <div className="skeleton" style={{ width: '70%', height: '24px' }} />
      <div className="skeleton" style={{ width: '40%', height: '16px' }} />
      <div className="skeleton" style={{ width: '100%', height: '40px', marginTop: 'auto', borderRadius: '8px' }} />
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>
        <div className="skeleton" style={{ width: '320px', height: '420px', borderRadius: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ width: '50%', height: '40px' }} />
          <div className="skeleton" style={{ width: '20%', height: '24px' }} />
          <div className="skeleton" style={{ width: '90%', height: '100px' }} />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="m3-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="skeleton" style={{ width: '100%', height: '40px' }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton" style={{ width: '100%', height: '60px' }} />
      ))}
    </div>
  );
};
