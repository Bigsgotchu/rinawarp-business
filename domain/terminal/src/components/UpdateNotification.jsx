// RinaWarp Terminal Pro - Update Notification Component
import { useState, useEffect } from 'react';

const UpdateNotification = () => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for update status from Electron
    if (window.electronAPI) {
      window.electronAPI.onUpdateStatus((data) => {
        setUpdateStatus(data);
        setIsVisible(true);
      });
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (window.electronAPI) {
      await window.electronAPI.checkForUpdates();
    }
  };

  const handleQuitAndInstall = async () => {
    if (window.electronAPI) {
      await window.electronAPI.quitAndInstall();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateStatus) return null;

  const getStatusColor = (type) => {
    switch (type) {
    case 'available':
      return 'bg-blue-500';
    case 'downloading':
      return 'bg-yellow-500';
    case 'downloaded':
      return 'bg-green-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
    case 'available':
      return '⬆️';
    case 'downloading':
      return '📥';
    case 'downloaded':
      return '✅';
    case 'error':
      return '❌';
    default:
      return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div
        className={`${getStatusColor(updateStatus.type)} text-white rounded-lg shadow-lg p-4 mb-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(updateStatus.type)}</span>
            <div>
              <h3 className="font-semibold text-sm">
                {updateStatus.type === 'available' && 'Update Available'}
                {updateStatus.type === 'downloading' && 'Downloading Update'}
                {updateStatus.type === 'downloaded' && 'Update Ready'}
                {updateStatus.type === 'error' && 'Update Error'}
                {updateStatus.type === 'checking' && 'Checking for Updates'}
                {updateStatus.type === 'not-available' && 'Up to Date'}
              </h3>
              <p className="text-xs opacity-90">{updateStatus.message}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {updateStatus.type === 'available' && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleCheckForUpdates}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium"
            >
              Download Now
            </button>
            <button
              onClick={handleDismiss}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-1 rounded text-xs font-medium"
            >
              Later
            </button>
          </div>
        )}

        {updateStatus.type === 'downloaded' && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleQuitAndInstall}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium"
            >
              Restart Now
            </button>
            <button
              onClick={handleDismiss}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-1 rounded text-xs font-medium"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateNotification;
