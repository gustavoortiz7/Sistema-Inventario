import React, { useEffect, useState } from 'react';

function Notifications() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotify = (e) => {
      const id = Date.now() + Math.random();
      const t = { id, ...e.detail };
      setToasts((s) => [t, ...s]);
      setTimeout(() => {
        setToasts((s) => s.filter((tt) => tt.id !== id));
      }, 3500);
    };

    window.addEventListener('notify', handleNotify);
    return () => window.removeEventListener('notify', handleNotify);
  }, []);

  const iconFor = (type) => {
    if (type === 'success') return '✅';
    if (type === 'warning') return '⚠️';
    return '❌';
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t, idx) => (
        <div
          key={t.id}
          className={`transform transition-all duration-300 ease-in-out px-4 py-3 rounded-lg shadow-lg max-w-xs text-sm flex items-start gap-3 ${
            t.type === 'success' ? 'bg-green-50 text-green-800' : t.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
          }`}
          style={{ transform: `translateY(${idx * 6}px)`, opacity: 1 }}
        >
          <div className="text-lg mt-0.5">{iconFor(t.type)}</div>
          <div className="leading-tight">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
