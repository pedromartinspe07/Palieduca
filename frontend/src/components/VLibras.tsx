import React, { useEffect } from 'react';

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => any;
    };
  }
}

const VLibras: React.FC = () => {
  useEffect(() => {
    const initVLibras = () => {
      if (window.VLibras && typeof window.VLibras.Widget === 'function') {
        const accessButton = document.querySelector('[vw-access-button]');
        if (accessButton && !accessButton.getAttribute('data-vlibras-initialized')) {
          try {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
            accessButton.setAttribute('data-vlibras-initialized', 'true');
          } catch (e) {
            console.warn('VLibras auto-init exception:', e);
          }
        }
      }
    };

    initVLibras();
    const timer = setTimeout(initVLibras, 800);
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default VLibras;
