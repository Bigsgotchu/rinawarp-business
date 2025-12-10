import { useEffect, useState } from 'react';
import { trackPurchase } from '../analytics/GoogleAnalytics';

function Success() {
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);

    if (sessionIdParam) {
      // Track successful purchase
      trackPurchase('success', 0, 'USD', sessionIdParam);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your purchase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">🎉</div>
          <h1>Welcome to RinaWarp Terminal Pro!</h1>
          <p className="success-message">
            Thank you for your purchase! Your license has been activated and you
            can now download RinaWarp Terminal Pro with all premium features.
          </p>

          <div className="download-section">
            <h2>Download Your App</h2>
            <p>Choose your platform to download RinaWarp Terminal Pro:</p>

            <div className="download-buttons">
              <a
                href="https://rinawarptech.com/downloads/macos/RinaWarp-Terminal-Pro-macOS-1.0.0.dmg"
                className="download-btn mac"
                download
              >
                <span className="download-icon">🍎</span>
                <div className="download-info">
                  <span className="download-title">macOS</span>
                  <span className="download-subtitle">
                    Intel & Apple Silicon
                  </span>
                </div>
              </a>
              <a
                href="https://rinawarptech.com/downloads/windows/RinaWarp-Terminal-Pro-Windows-1.0.0.exe"
                className="download-btn windows"
                download
              >
                <span className="download-icon">🪟</span>
                <div className="download-info">
                  <span className="download-title">Windows</span>
                  <span className="download-subtitle">Windows 10 & 11</span>
                </div>
              </a>
              <a
                href="https://rinawarptech.com/downloads/linux/RinaWarp-Terminal-Pro-Linux-1.0.0.AppImage"
                className="download-btn linux"
                download
              >
                <span className="download-icon">🐧</span>
                <div className="download-info">
                  <span className="download-title">Linux</span>
                  <span className="download-subtitle">AppImage & DEB</span>
                </div>
              </a>
            </div>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>
                📧 Check your email for your license key and setup instructions
              </li>
              <li>💻 Download and install RinaWarp Terminal Pro</li>
              <li>🔑 Enter your license key when prompted</li>
              <li>🚀 Start using all premium features!</li>
            </ul>
          </div>

          <div className="support-section">
            <h3>Need Help?</h3>
            <p>
              If you have any questions or need assistance, please don't
              hesitate to reach out:
            </p>
            <div className="support-links">
              <a
                href="mailto:support@rinawarptech.com"
                className="support-link"
              >
                📧 support@rinawarptech.com
              </a>
              <a href="#" className="support-link">
                📚 Documentation
              </a>
              <a href="#" className="support-link">
                💬 Community Forum
              </a>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = '/')}
            >
              Back to Home
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => (window.location.href = '/#features')}
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;
