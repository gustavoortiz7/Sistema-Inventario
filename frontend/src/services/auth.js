export const getToken = () => localStorage.getItem('token');
export const getRole = () => localStorage.getItem('role');
export const getName = () => localStorage.getItem('name');
export const isAuthenticated = () => !!getToken();

export const requireRole = (allowed = []) => {
  const role = getRole();
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(role);
};
