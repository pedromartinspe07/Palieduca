import React from 'react';
import Hero3DCanvas from '../3d/Hero3DCanvas';

interface BotanicalBackgroundProps {
    showButterflies?: boolean;
    showWaves?: boolean;
    showFoliage?: boolean;
    show3DButterfly?: boolean;
    className?: string;
    children?: React.ReactNode;
}

// Crisp, beautiful Ulysses Blue Butterfly with layered electric cyan wings and glow
export const BlueButterfly: React.FC<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    rotate?: number;
    glow?: boolean;
}> = ({ size = 64, className = '', style = {}, rotate = 0, glow = true }) => {
    return (
        <div
            className={`inline-block select-none pointer-events-none ${className}`}
            style={{
                width: size,
                height: size,
                transform: `rotate(${rotate}deg)`,
                filter: glow ? 'drop-shadow(0 6px 16px rgba(14, 165, 233, 0.45)) drop-shadow(0 0 25px rgba(56, 189, 248, 0.35))' : undefined,
                ...style
            }}
            aria-hidden="true"
        >
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                    {/* Asa Esquerda Superior - Gradiente Elétrico Ulysses */}
                    <linearGradient id="ulyssesWingLeft" x1="60" y1="55" x2="5" y2="10" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="35%" stopColor="#00d8ff" />
                        <stop offset="70%" stopColor="#7dd3fc" />
                        <stop offset="92%" stopColor="#1e3a8a" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    {/* Asa Direita Superior */}
                    <linearGradient id="ulyssesWingRight" x1="60" y1="55" x2="115" y2="10" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="35%" stopColor="#00d8ff" />
                        <stop offset="70%" stopColor="#7dd3fc" />
                        <stop offset="92%" stopColor="#1e3a8a" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    {/* Asa Inferior */}
                    <linearGradient id="ulyssesWingBottom" x1="60" y1="55" x2="60" y2="115" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#38bdf8" />
                        <stop offset="85%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    {/* Brilho Centro Iridescente */}
                    <radialGradient id="ulyssesCenterGlow" cx="60" cy="52" r="38" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
                        <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Asa Esquerda Superior */}
                <path
                    d="M58 52 C50 32, 28 10, 8 18 C-1 22, -1 46, 16 64 C28 74, 48 68, 58 54 Z"
                    fill="url(#ulyssesWingLeft)"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />
                <path
                    d="M55 50 C44 36, 28 22, 16 26 C10 28, 12 44, 24 56 C34 64, 48 58, 55 50 Z"
                    fill="url(#ulyssesCenterGlow)"
                    opacity="0.85"
                />

                {/* Asa Direita Superior */}
                <path
                    d="M62 52 C70 32, 92 10, 112 18 C121 22, 121 46, 104 64 C92 74, 72 68, 62 54 Z"
                    fill="url(#ulyssesWingRight)"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />
                <path
                    d="M65 50 C76 36, 92 22, 104 26 C110 28, 108 44, 96 56 C86 64, 72 58, 65 50 Z"
                    fill="url(#ulyssesCenterGlow)"
                    opacity="0.85"
                />

                {/* Asa Esquerda Inferior */}
                <path
                    d="M57 58 C44 68, 22 80, 26 100 C28 108, 44 112, 52 98 C56 88, 58 72, 57 58 Z"
                    fill="url(#ulyssesWingBottom)"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />

                {/* Asa Direita Inferior */}
                <path
                    d="M63 58 C76 68, 98 80, 94 100 C92 108, 76 112, 68 98 C64 88, 62 72, 63 58 Z"
                    fill="url(#ulyssesWingBottom)"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                />

                {/* Nervuras Brilhantes */}
                <path d="M58 52 Q32 38 16 30" stroke="#ffffff" strokeWidth="0.9" opacity="0.65" strokeLinecap="round" />
                <path d="M58 54 Q36 50 20 54" stroke="#ffffff" strokeWidth="0.9" opacity="0.65" strokeLinecap="round" />
                <path d="M62 52 Q88 38 104 30" stroke="#ffffff" strokeWidth="0.9" opacity="0.65" strokeLinecap="round" />
                <path d="M62 54 Q84 50 100 54" stroke="#ffffff" strokeWidth="0.9" opacity="0.65" strokeLinecap="round" />

                {/* Corpo Negro & Cabeça */}
                <ellipse cx="60" cy="58" rx="2.8" ry="16" fill="#090d16" />
                <circle cx="60" cy="40" r="3" fill="#090d16" />

                {/* Antenas Curvadas */}
                <path d="M59 38 Q50 26 40 24" stroke="#090d16" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M61 38 Q70 26 80 24" stroke="#090d16" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="40" cy="24" r="1.3" fill="#00d8ff" />
                <circle cx="80" cy="24" r="1.3" fill="#00d8ff" />
            </svg>
        </div>
    );
};

const BotanicalBackground: React.FC<BotanicalBackgroundProps> = ({
    showButterflies = true,
    showWaves = true,
    showFoliage = true,
    show3DButterfly = true,
    className = '',
    children
}) => {
    return (
        <div className={`relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#f8f5ff] via-[#e8f6fc] to-[#edfbf4] dark:from-[#0b1329] dark:via-[#0f172a] dark:to-[#081e1d] transition-colors duration-300 ${className}`}>
            
            {/* 1. Orbes de Iluminação Ethereal e Luminosidade Botânica */}
            <div className="absolute top-10 left-8 w-[32rem] h-[32rem] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none animate-subtle-float" />
            <div className="absolute top-[28%] right-8 w-[34rem] h-[34rem] bg-sky-200/45 dark:bg-sky-900/20 rounded-full blur-[110px] pointer-events-none animate-subtle-float" style={{ animationDelay: '2.5s' }} />
            <div className="absolute top-[62%] left-12 w-[32rem] h-[32rem] bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none animate-subtle-float" style={{ animationDelay: '4.5s' }} />

            {/* 2. Folhagens Botânicas Decorativas Laterais (Ramos de Eucalipto & Lavanda) */}
            {showFoliage && (
                <>
                    {/* Folhagem Esquerda */}
                    <div className="absolute top-24 -left-10 w-64 md:w-80 h-auto opacity-45 pointer-events-none z-0 select-none">
                        <svg viewBox="0 0 200 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M20 450 Q85 280 40 120 Q30 60 10 10" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.45" />
                            <ellipse cx="68" cy="240" rx="22" ry="13" fill="#86efac" fillOpacity="0.4" transform="rotate(-25 68 240)" />
                            <ellipse cx="25" cy="190" rx="20" ry="11" fill="#a7f3d0" fillOpacity="0.4" transform="rotate(30 25 190)" />
                            <ellipse cx="58" cy="150" rx="18" ry="10" fill="#86efac" fillOpacity="0.4" transform="rotate(-20 58 150)" />
                            <ellipse cx="20" cy="110" rx="16" ry="9" fill="#a7f3d0" fillOpacity="0.4" transform="rotate(25 20 110)" />
                            <ellipse cx="38" cy="70" rx="15" ry="8" fill="#6ee7b7" fillOpacity="0.4" transform="rotate(-15 38 70)" />
                            
                            {/* Ramo de Lavanda */}
                            <path d="M40 450 Q115 300 95 160" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.45" />
                            <circle cx="95" cy="160" r="4.5" fill="#c084fc" fillOpacity="0.75" />
                            <circle cx="90" cy="172" r="4.5" fill="#a855f7" fillOpacity="0.65" />
                            <circle cx="100" cy="184" r="5" fill="#c084fc" fillOpacity="0.75" />
                            <circle cx="94" cy="198" r="5.5" fill="#a855f7" fillOpacity="0.65" />
                            <circle cx="102" cy="212" r="5.5" fill="#c084fc" fillOpacity="0.75" />
                        </svg>
                    </div>

                    {/* Folhagem Direita */}
                    <div className="absolute top-28 -right-10 w-64 md:w-80 h-auto opacity-45 pointer-events-none z-0 select-none scale-x-[-1]">
                        <svg viewBox="0 0 200 450" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path d="M20 450 Q85 280 40 120 Q30 60 10 10" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.45" />
                            <ellipse cx="68" cy="240" rx="22" ry="13" fill="#5eead4" fillOpacity="0.4" transform="rotate(-25 68 240)" />
                            <ellipse cx="25" cy="190" rx="20" ry="11" fill="#99f6e4" fillOpacity="0.4" transform="rotate(30 25 190)" />
                            <ellipse cx="58" cy="150" rx="18" ry="10" fill="#5eead4" fillOpacity="0.4" transform="rotate(-20 58 150)" />
                            <ellipse cx="20" cy="110" rx="16" ry="9" fill="#99f6e4" fillOpacity="0.4" transform="rotate(25 20 110)" />
                            <ellipse cx="38" cy="70" rx="15" ry="8" fill="#2dd4bf" fillOpacity="0.4" transform="rotate(-15 38 70)" />

                            <path d="M40 450 Q115 300 95 160" stroke="#818cf8" strokeWidth="2" strokeOpacity="0.45" />
                            <circle cx="95" cy="160" r="4.5" fill="#a5b4fc" fillOpacity="0.75" />
                            <circle cx="90" cy="172" r="4.5" fill="#818cf8" fillOpacity="0.65" />
                            <circle cx="100" cy="184" r="5" fill="#a5b4fc" fillOpacity="0.75" />
                            <circle cx="94" cy="198" r="5.5" fill="#818cf8" fillOpacity="0.65" />
                        </svg>
                    </div>
                </>
            )}

            {/* 3. Borboletas: Borboletas Laterais + Borboleta 3D Real Ulysses (GLB) na Direita */}
            {showButterflies && (
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
                    {/* Borboleta 1: Superior Esquerda (Próxima ao Card) */}
                    <div className="absolute top-28 left-[4%] sm:left-[7%] lg:left-[9%] animate-subtle-float" style={{ animationDuration: '7.5s' }}>
                        <BlueButterfly size={96} rotate={-24} />
                    </div>

                    {/* Borboleta 2: Inferior Esquerda */}
                    <div className="absolute top-[420px] left-[5%] sm:left-[8%] lg:left-[11%] animate-subtle-float" style={{ animationDuration: '8.5s', animationDelay: '1.2s' }}>
                        <BlueButterfly size={54} rotate={16} />
                    </div>

                    {/* Borboleta 3: Superior Direita */}
                    <div className="absolute top-32 right-[5%] sm:right-[8%] lg:right-[11%] animate-subtle-float" style={{ animationDuration: '6.8s', animationDelay: '2s' }}>
                        <BlueButterfly size={60} rotate={22} />
                    </div>

                    {/* Borboleta 3D Oficial Ulysses (GLB) Interativa na Direita */}
                    {show3DButterfly && (
                        <div className="absolute top-[180px] sm:top-[220px] md:top-[240px] right-0 sm:right-[1%] lg:right-[3%] w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] pointer-events-auto z-20">
                            <Hero3DCanvas />
                        </div>
                    )}

                    {/* Partículas de Luz e Pólen Ethereal */}
                    <span className="absolute top-36 left-[20%] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] animate-pulse" style={{ animationDuration: '3s' }} />
                    <span className="absolute top-[420px] right-[22%] w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_15px_#fde68a] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                    <span className="absolute top-52 right-[28%] w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_10px_#d8b4fe] animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
                </div>
            )}

            {/* 4. Conteúdo Central da Página */}
            <div className="relative z-20">
                {children}
            </div>

            {/* 5. Ondas Fluidas e Orgânicas na Base (Lilás, Turquesa e Verde Menta) */}
            {showWaves && (
                <div className="relative w-full overflow-hidden leading-none z-10 -mt-8 select-none pointer-events-none">
                    {/* Silhuetas Vegetais de Fundo sobre a Onda */}
                    <div className="absolute bottom-14 left-0 right-0 h-28 opacity-30 flex justify-between px-6 text-emerald-800 pointer-events-none">
                        <svg viewBox="0 0 1200 120" fill="currentColor" className="w-full h-full">
                            <path d="M40 120 Q70 40 100 120 M130 120 Q160 20 190 120 M220 120 Q250 50 280 120 M390 120 Q430 30 470 120 M690 120 Q720 40 750 120 M840 120 Q890 10 940 120 M1040 120 Q1070 35 1100 120" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                        </svg>
                    </div>

                    <svg
                        className="relative block w-full h-24 sm:h-36 md:h-44"
                        viewBox="0 0 1440 220"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        {/* Onda 1: Lilás Claro Acolhedor */}
                        <path
                            d="M0 80 C320 140 460 20 720 70 C980 120 1120 30 1440 75 L1440 220 L0 220 Z"
                            fill="#ede9fe"
                            fillOpacity="0.8"
                        />
                        {/* Onda 2: Turquesa / Teal Suave */}
                        <path
                            d="M0 110 C280 40 520 150 800 90 C1080 30 1260 140 1440 105 L1440 220 L0 220 Z"
                            fill="#ccfbf1"
                            fillOpacity="0.75"
                        />
                        {/* Onda 3: Verde Hortelã & Azul Sereno na Frente */}
                        <path
                            d="M0 140 C360 80 620 180 960 120 C1200 80 1340 160 1440 135 L1440 220 L0 220 Z"
                            fill="#dcfce7"
                            fillOpacity="0.85"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default BotanicalBackground;
