import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './views/Dashboard';
import { Licenses } from './views/Licenses';
import { Customers } from './views/Customers';
import { AnalyticsView } from './views/Analytics';
import { Logs } from './views/Logs';
import { Settings } from './views/Settings';
import { AdminProvider } from './lib/adminContext';

const App: React.FC = () => {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-admin-bg text-admin-text">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="px-6 pt-4">
            <TopBar />
          </div>
          <div className="flex-1 px-6 pb-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/licenses" element={<Licenses />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/billing" element={<Customers />} />
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </AdminProvider>
  );
};

export default App;
