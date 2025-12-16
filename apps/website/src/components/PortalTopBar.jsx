import React from 'react';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const PortalTopBar = ({ teamName, user, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">{teamName || 'Team Dashboard'}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FaUserCircle className="text-gray-400" />
          <span>{user?.name || user?.email || 'User'}</span>
        </div>

        <button
          onClick={onLogout}
          className="text-gray-600 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <FaSignOutAlt className="text-lg" />
        </button>
      </div>
    </header>
  );
};

export default PortalTopBar;
