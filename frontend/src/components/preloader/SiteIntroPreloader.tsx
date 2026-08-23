import React, { useState, useEffect } from 'react';
import { Sparkles, HeartPulse, ArrowRight } from 'lucide-react';

interface SiteIntroPreloaderProps {
    onComplete?: () => void;
}

const SiteIntroPreloader: React.FC<SiteIntroPreloaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Se o usuário já visualizou a intro nesta sessão, não exibe novamente
        const alreadySeen = sessionStorage.getItem('palieduca_intro_seen');
        if (alreadySeen) {
            setShouldRender(false);
            if (onComplete) onComplete();
            return;
        }

        // Animação de progresso suave e dinâmica
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const increment = Math.max(1, Math.floor(Math.random() * 8) + 2);
                return Math.min(100, prev + increment);
            });
        }, 45);

        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        if (progress >= 100) {
            const timeout = setTimeout(() => {
                setIsExiting(true);
                sessionStorage.setItem('palieduca_intro_seen', 'true');
                const removeTimeout = setTimeout(() => {
                    setShouldRender(false);
                    if (onComplete) onComplete();
                }, 700);
                return () => clearTimeout(removeTimeout);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [progress, onComplete]);

    const handleSkip = () => {
        setIsExiting(true);
        sessionStorage.setItem('palieduca_intro_seen', 'true');
        setTimeout(() => {
            setShouldRender(false);
            if (onComplete) onComplete();
        }, 400);
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1c2820] text-warm-50 transition-all duration-700 select-none ${
                isExiting ? 'opacity-0 scale-105 pointer-events-none backdrop-blur-xl' : 'opacity-100 scale-100'
            }`}
        >
            {/* Luzes Ambientes 3D Difusas */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-primary/25 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

            {/* Conteúdo Central */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
                {/* Ícone com Halo Pulsante */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-emerald-600 p-0.5 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-[#1c2820]/90 rounded-[22px] flex items-center justify-center">
                            <HeartPulse size={38} className="text-emerald-400 animate-pulse" />
                        </div>
                    </div>
                    <div className="absolute -top-1 -right-1">
                        <Sparkles size={18} className="text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                </div>

                {/* Título com Tipografia Premium */}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
                    Pali<span className="text-emerald-400">educa</span>
                </h1>

                {/* Lema Inspirador */}
                <p className="text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed mb-8 max-w-xs">
                    Cuidando com afeto, evidência científica e dignidade humana.
                </p>

                {/* Barra de Progresso Fluida */}
                <div className="w-full max-w-xs space-y-2">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300/80 px-0.5">
                        <span className="font-sans text-[10px] uppercase tracking-widest text-white/50">Carregando ambiente</span>
                        <span className="font-bold">{progress}%</span>
                    </div>
                </div>

                {/* Botão Pular Introdução */}
                <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-8 text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-white/5 cursor-pointer"
                >
                    <span>Entrar no site</span>
                    <ArrowRight size={13} />
                </button>
            </div>
        </div>
    );
};

export default SiteIntroPreloader;
