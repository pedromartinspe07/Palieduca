import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Sparkles, ArrowRight, Trees, Leaf, Sun } from 'lucide-react';

interface SiteIntroPreloaderProps {
    onComplete?: () => void;
}

const INSPIRATIONAL_PHRASES = [
    "Cultivando o cuidado com afeto e evidência...",
    "Acolhendo cada história com dignidade e respeito...",
    "Preparando seu espaço de aprendizagem e humanização..."
];

const SiteIntroPreloader: React.FC<SiteIntroPreloaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [phraseIndex, setPhraseIndex] = useState(0);
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

        // Animação de progresso cadenciada e natural
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const increment = Math.max(1, Math.floor(Math.random() * 5) + 2);
                const nextVal = Math.min(100, prev + increment);
                
                // Muda a frase acolhedora aos 40% e aos 80%
                if (nextVal > 70) setPhraseIndex(2);
                else if (nextVal > 35) setPhraseIndex(1);
                
                return nextVal;
            });
        }, 55);

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
                }, 800);
                return () => clearTimeout(removeTimeout);
            }, 400);
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

    // Folhas e vagalumes decorativos flutuando pela floresta
    const floatingLeaves = useMemo(() => [
        { left: '10%', delay: '0s', duration: '9s', size: 18, rotate: '15deg' },
        { left: '25%', delay: '2s', duration: '11s', size: 22, rotate: '-25deg' },
        { left: '45%', delay: '4s', duration: '8s', size: 16, rotate: '45deg' },
        { left: '70%', delay: '1s', duration: '10s', size: 20, rotate: '-15deg' },
        { left: '88%', delay: '3s', duration: '12s', size: 24, rotate: '30deg' },
    ], []);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#132218] via-[#1a2d21] to-[#111c15] text-[#fbf8f3] transition-all duration-800 select-none overflow-hidden ${
                isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
        >
            {/* 1. Raios de Sol Suaves Filtrados pela Copa das Árvores (Dappled Sunlight) */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] bg-gradient-to-b from-amber-400/20 via-emerald-400/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-20 right-10 w-96 h-96 bg-[#3a5a46]/25 rounded-full blur-[100px] pointer-events-none" />

            {/* 2. Vagalumes Dourados e Verdes Flutuantes */}
            <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-[20%] left-[18%] w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_12px_#fde68a] animate-pulse" style={{ animationDuration: '3.2s' }} />
                <span className="absolute top-[35%] right-[22%] w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_#6ee7b7] animate-pulse" style={{ animationDuration: '4.1s', animationDelay: '1.2s' }} />
                <span className="absolute bottom-[30%] left-[28%] w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d] animate-pulse" style={{ animationDuration: '3.7s', animationDelay: '0.8s' }} />
                <span className="absolute bottom-[25%] right-[32%] w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-[0_0_8px_#a7f3d0] animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '1.9s' }} />
            </div>

            {/* 3. Folhas Flutuantes Caindo Suavemente */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingLeaves.map((leaf, idx) => (
                    <div
                        key={idx}
                        className="absolute text-emerald-400/30 animate-subtle-float"
                        style={{
                            left: leaf.left,
                            top: `${15 + idx * 16}%`,
                            animationDelay: leaf.delay,
                            animationDuration: leaf.duration,
                            transform: `rotate(${leaf.rotate})`
                        }}
                    >
                        <Leaf size={leaf.size} />
                    </div>
                ))}
            </div>

            {/* 4. Silhueta Orgânica das Árvores na Base */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-15 pointer-events-none flex justify-around items-end text-emerald-900">
                <Trees size={80} />
                <Trees size={110} className="scale-x-[-1]" />
                <Trees size={95} />
                <Trees size={120} />
                <Trees size={85} className="scale-x-[-1]" />
            </div>

            {/* 5. Conteúdo Central de Acolhimento */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
                
                {/* Emblema Botânico & Coração Acolhedor */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#3a5a46] via-[#487157] to-[#b28660] p-1 shadow-2xl flex items-center justify-center">
                        <div className="w-full h-full bg-[#132218] rounded-full flex items-center justify-center relative overflow-hidden border border-emerald-500/20">
                            {/* Halo Dourado Interno */}
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 to-transparent" />
                            <div className="relative flex items-center justify-center">
                                <Heart size={40} className="text-rose-400 fill-rose-400/80 animate-pulse" style={{ animationDuration: '2.2s' }} />
                                <Leaf size={20} className="absolute -top-1 -right-2 text-emerald-400 rotate-45" />
                            </div>
                        </div>
                    </div>
                    {/* Pequeno Sol Acolhedor */}
                    <div className="absolute -top-1 -left-1 p-1 bg-[#1a2d21] rounded-full border border-amber-300/30 shadow-xs">
                        <Sun size={15} className="text-amber-300" />
                    </div>
                </div>

                {/* Título com Identidade Natural */}
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#fbf8f3] mb-2 font-display">
                    Pali<span className="text-emerald-400">educa</span>
                </h1>

                {/* Tag de Ambiente Natural */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-600/30 text-emerald-200 text-[11px] font-medium mb-5 backdrop-blur-xs">
                    <Sparkles size={12} className="text-amber-300" />
                    <span>Ambiente Virtual Humanizado &amp; Paliativo</span>
                </div>

                {/* Frase Acolhedora Dinâmica */}
                <p className="text-xs sm:text-sm text-emerald-100/85 font-light leading-relaxed mb-7 min-h-[36px] transition-opacity duration-300 max-w-xs">
                    {INSPIRATIONAL_PHRASES[phraseIndex]}
                </p>

                {/* Barra de Florescimento e Crescimento Natural */}
                <div className="w-full max-w-xs space-y-2.5">
                    <div className="w-full h-2 bg-[#0c160f] rounded-full overflow-hidden p-0.5 border border-emerald-800/40 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 via-[#5f8d70] to-amber-300 rounded-full transition-all duration-150 shadow-[0_0_10px_rgba(95,141,112,0.7)] relative"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] text-emerald-300/75 px-1 font-medium">
                        <span className="flex items-center gap-1 text-[11px] text-emerald-200/60 font-light">
                            <Leaf size={12} className="text-emerald-400" />
                            Florescendo ambiente
                        </span>
                        <span className="font-bold text-amber-200">{progress}%</span>
                    </div>
                </div>

                {/* Botão Pular / Iniciar Imediatamente */}
                <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-8 text-xs text-emerald-200/60 hover:text-[#fbf8f3] transition-all flex items-center gap-2 py-2 px-4 rounded-full hover:bg-emerald-900/40 border border-transparent hover:border-emerald-700/40 cursor-pointer"
                >
                    <span>Entrar no ambiente</span>
                    <ArrowRight size={13} />
                </button>
            </div>
        </div>
    );
};

export default SiteIntroPreloader;
