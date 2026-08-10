import React, { useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import FontSizeControl from './components/FontSizeControl';
import Home from './pages/Home';
import Apresentacao from './pages/Apresentacao';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Modulos from './pages/Modulos';
import Biblioteca from './pages/Biblioteca';
import Glossario from './pages/Glossario';
import Editor from './pages/Editor';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import useAnchorScroll from './hooks/useAnchorScroll';
import { useAuth } from './context/AuthContext';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const { token } = useAuth();
  useAnchorScroll();

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/apresentacao" element={<Apresentacao />} />
        <Route path="/login" element={token ? <Navigate to="/perfil" /> : <Login />} />
        <Route path="/perfil" element={<ProtectedRoute allowedRoles={['aluno', 'dona', 'desenvolvedor']}><Perfil /></ProtectedRoute>} />
        <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
        <Route path="/biblioteca" element={<ProtectedRoute><Biblioteca /></ProtectedRoute>} />
        <Route path="/glossario" element={<ProtectedRoute><Glossario /></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute allowedRoles={['dona', 'desenvolvedor']}><Editor /></ProtectedRoute>} />
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
      <div className="min-h-screen flex flex-col bg-background relative selection:bg-primary/30">
        <Header />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
        <FontSizeControl />
        <ChatBox />
      </div>
    </Router>
  );
};

export default App;
