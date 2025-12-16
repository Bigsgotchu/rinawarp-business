import React from 'react';
import { FaUsers, FaTerminal, FaBrain, FaClock, FaCreditCard } from 'react-icons/fa';

const PortalSidebar = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Team Overview', icon: <FaUsers /> },
    { id: 'sessions', label: 'Sessions', icon: <FaTerminal /> },
    { id: 'ai-memory', label: 'AI Memory', icon: <FaBrain /> },
    { id: 'activity', label: 'Activity', icon: <FaClock /> },
    { id: 'billing', label: 'Billing', icon: <FaCreditCard /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Mission Control</h2>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-mermid-50 text-mermid-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default PortalSidebar;
