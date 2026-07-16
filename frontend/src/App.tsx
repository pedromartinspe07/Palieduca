import React, { useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import FontSizeControl from './components/FontSizeControl';
import Home from './pages/Home';
import Apresentacao from './pages/Apresentacao';
import NotFound from './pages/NotFound';
import useAnchorScroll from './hooks/useAnchorScroll';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

// Wrapper that animates each route transition
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  // Triggers native scrolling when there is a hash matching an element id
  useAnchorScroll();

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/apresentacao" element={<Apresentacao />} />
        <Route path="/modulos" element={
          <div className="pt-40 text-center">
            <p className="text-2xl font-semibold text-warm-700 mb-2">Módulos em breve 🌱</p>
            <p className="text-warm-500">O conteúdo completo está sendo preparado.</p>
          </div>
        } />
        <Route path="/biblioteca" element={
          <div className="pt-40 text-center">
            <p className="text-2xl font-semibold text-warm-700 mb-2">Biblioteca em breve 📚</p>
            <p className="text-warm-500">O acervo digital está sendo organizado.</p>
          </div>
        } />
        <Route path="/glossario" element={
          <div className="pt-40 text-center">
            <p className="text-2xl font-semibold text-warm-700 mb-2">Glossário em breve 📖</p>
            <p className="text-warm-500">Os termos estão sendo curados.</p>
          </div>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  const keepAlive = useCallback(async () => {
    try { await fetch(`${API_URL}/api/health`); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    keepAlive();
    const interval = setInterval(keepAlive, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [keepAlive]);

  return (
    <Router>
      <div className="min-h-screen bg-background relative selection:bg-primary/30">
        <Header />
        <AnimatedRoutes />
        <FontSizeControl />
        <ChatBox />
      </div>
    </Router>
  );
};

export default App;
