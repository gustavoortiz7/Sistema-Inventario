import React from 'react';
import { isAuthenticated, getRole } from '../services/auth';

function RequireAuth({ children, allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return (
      <div className="p-6 text-center text-red-600">Acceso denegado. Inicia sesión para continuar.</div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getRole();
    if (!allowedRoles.includes(role)) {
      return (
        <div className="p-6 text-center text-red-600">No autorizado. Acción restringida al administrador.</div>
      );
    }
  }

  return <>{children}</>;
}

export default RequireAuth;
