import React from 'react';

function Unauthorized({ message = 'No autorizado. No tienes permisos para ver esta sección.' }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <div className="text-center text-red-600">
        <p className="font-semibold text-lg">{message}</p>
      </div>
    </div>
  );
}

export default Unauthorized;
