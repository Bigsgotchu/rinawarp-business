import React, { createContext, useContext, useEffect, useState } from 'react';

type AdminContextValue = {
  apiToken: string | null;
  setApiToken: (token: string | null) => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiToken, setApiTokenState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('rw_admin_token');
    if (stored) setApiTokenState(stored);
  }, []);

  const setApiToken = (token: string | null) => {
    setApiTokenState(token);
    if (token) localStorage.setItem('rw_admin_token', token);
    else localStorage.removeItem('rw_admin_token');
  };

  return (
    <AdminContext.Provider value={{ apiToken, setApiToken }}>{children}</AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return ctx;
};
