import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import Features from './components/Features';
import Downloads from './components/Downloads';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import EmailCapture from './components/EmailCapture';
import Login from './components/Login';
import Register from './components/Register';
import Portal from './pages/Portal';
import { getUser, clearAuthData } from './utils/auth';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate loading time for smooth animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Check for existing user
    const userData = getUser();
    if (userData) {
      setUser(userData);
    }

    return () => clearTimeout(timer);
  }, []);

  // Show email capture modal after 30 seconds for lead generation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEmailCapture(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mermid-50">
        <Navigation user={user} onLogout={handleLogout} />

        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-mermid-600 border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Routes>
          <Route
            path="/"
            element={
              <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Hero />
                <Features />
                <Downloads />
                <Pricing />
                <Testimonials />
                <Footer />
              </motion.main>
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login
                  onLogin={handleLogin}
                  onSwitchToRegister={() => (window.location.href = '/register')}
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Register
                  onRegister={handleRegister}
                  onSwitchToLogin={() => (window.location.href = '/login')}
                />
              )
            }
          />
          <Route
            path="/portal"
            element={
              user ? (
                <Portal />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>

        {/* Email Capture Modal for Lead Generation */}
        <AnimatePresence>
          {showEmailCapture && <EmailCapture onClose={() => setShowEmailCapture(false)} />}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
