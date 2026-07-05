import React from 'react';

function Loader({ size = 8 }) {
  return (
    <div className="flex items-center justify-center py-6">
      <div
        className={`animate-spin rounded-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400`} 
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%' }}
      />
    </div>
  );
}

export default Loader;
