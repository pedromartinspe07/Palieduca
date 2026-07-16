import React, { useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import FontSizeControl from './components/FontSizeControl';
import Home from './pages/Home';
import Apresentacao from './pages/Apresentacao';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const App: React.FC = () => {
  // Keep-alive: prevents the free Render server from sleeping
  const keepAlive = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/health`);
    } catch {
      // Silent – do not interrupt the user experience
    }
  }, []);

  useEffect(() => {
    keepAlive(); // Ping on mount
    const interval = setInterval(keepAlive, 10 * 60 * 1000); // Every 10 min
    return () => clearInterval(interval);
  }, [keepAlive]);

  return (
    <Router>
      <div className="min-h-screen bg-background relative selection:bg-primary/30">
        <Header />

        {/* Main Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apresentacao" element={<Apresentacao />} />
          <Route path="/modulos" element={<div className="pt-32 text-center text-xl text-warm-600">Em desenvolvimento...</div>} />
          <Route path="/biblioteca" element={<div className="pt-32 text-center text-xl text-warm-600">Em desenvolvimento...</div>} />
          <Route path="/glossario" element={<div className="pt-32 text-center text-xl text-warm-600">Em desenvolvimento...</div>} />
        </Routes>

        {/* Floating Accessibility Controls */}
        <FontSizeControl />

        {/* Floating AI Chat Box */}
        <ChatBox />
      </div>
    </Router>
  );
};

export default App;
