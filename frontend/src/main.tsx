import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ErrorBoundary } from './ErrorBoundary';

const GOOGLE_CLIENT_ID = "685476211444-k1d51qlvic4n0sk8rq3h2o54rnikpbd1.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

// Registro do Service Worker para suporte PWA / Instalação no Celular
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('📱 Palieduca PWA: Service Worker ativo com escopo:', reg.scope);
      })
      .catch((err) => {
        console.log('Palieduca PWA: Service Worker não carregado:', err);
      });
  });
}

