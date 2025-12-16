import React from 'react';
import { Dashboard } from './Dashboard';

export const AnalyticsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Analytics</h2>
      <Dashboard />
    </div>
  );
};
