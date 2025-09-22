import React from 'react';

const ErrorMessage = ({ error, onRetry }) => {
  if (!error) return null;
  return (
    <div style={{ background: '#FFECEA', border: '1px solid #FDA29B', padding: '8px 12px', borderRadius: 4, color: '#B42318', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span>{typeof error === 'string' ? error : error.message}</span>
      {onRetry && <button style={{ background: '#B42318', color: '#fff', border: 'none', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }} onClick={onRetry}>重试</button>}
    </div>
  );
};

export default ErrorMessage;
