import React, { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import FontSizeControl from './components/FontSizeControl';
import Home from './pages/Home';
import Apresentacao from './pages/Apresentacao';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Modulos from './pages/Modulos';
import ModuleViewer from './pages/ModuleViewer';
import Biblioteca from './pages/Biblioteca';
import Glossario from './pages/Glossario';
import Editor from './pages/Editor';
import ValidarCertificado from './pages/ValidarCertificado';
import TermosDeUso from './pages/TermosDeUso';
import Privacidade from './pages/Privacidade';
import Contato from './pages/Contato';
import SimuladoProficiencia from './pages/SimuladoProficiencia';
import Footer from './components/Footer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ProtectedRoute from './components/ProtectedRoute';
import SiteIntroPreloader from './components/preloader/SiteIntroPreloader';
import useAnchorScroll from './hooks/useAnchorScroll';
import { useAuth } from './context/AuthContext';
import { inject } from '@vercel/analytics';

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
        <Route path="/register" element={token ? <Navigate to="/perfil" /> : <Register />} />
        <Route path="/perfil" element={<ProtectedRoute allowedRoles={['aluno', 'dona', 'desenvolvedor', 'professor', 'moderador', 'suporte']}><Perfil /></ProtectedRoute>} />
        <Route path="/modulos" element={<Modulos />} />
        <Route path="/modulo/:slug_id" element={<ModuleViewer />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/glossario" element={<Glossario />} />
        <Route path="/validar" element={<ValidarCertificado />} />
        <Route path="/validar/:code" element={<ValidarCertificado />} />
        <Route path="/termos" element={<TermosDeUso />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/simulado" element={<SimuladoProficiencia />} />
        <Route path="/editor" element={<ProtectedRoute allowedRoles={['dona', 'desenvolvedor', 'professor']}><Editor /></ProtectedRoute>} />
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
    inject();
    keepAlive();
    const interval = setInterval(keepAlive, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [keepAlive]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background dark:bg-[#0b1329] text-warm-900 dark:text-slate-100 relative selection:bg-primary/30 transition-colors duration-300">
        <SiteIntroPreloader />
        <Header />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <Footer />
        <FontSizeControl />
        <ChatBox />
        <PWAInstallPrompt />
      </div>
    </Router>
  );
};

export default App;
