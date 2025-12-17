// Auth utility functions for JWT token management

export const getToken = () => {
  return localStorage.getItem('authToken');
};

export const getUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token, refreshToken, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const validateToken = async () => {
  const token = getToken();
  if (!token) return false;

  try {
    const response = await fetch('/.netlify/functions/auth-validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    return false;
  }
};
