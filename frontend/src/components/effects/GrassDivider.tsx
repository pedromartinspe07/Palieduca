import React from 'react';

interface GrassDividerProps {
    className?: string;
}

const GrassDivider: React.FC<GrassDividerProps> = ({ className = '' }) => {
    return (
        <div className={`w-full overflow-hidden relative pointer-events-none select-none ${className}`}>
            {/* 1. Brilhos e vagalumes flutuantes de acolhimento sobre a grama */}
            <div className="absolute inset-0 z-10 overflow-hidden">
                <span className="absolute left-[15%] bottom-6 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399] animate-pulse" style={{ animationDuration: '3s' }} />
                <span className="absolute left-[35%] bottom-10 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <span className="absolute left-[65%] bottom-7 w-1.5 h-1.5 rounded-full bg-emerald-200 shadow-[0_0_8px_#6ee7b7] animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
                <span className="absolute left-[85%] bottom-9 w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a] animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '2s' }} />
            </div>

            {/* 2. SVG com Camadas Orgânicas de Grama e Folhagens Acolhedoras */}
            <svg
                viewBox="0 0 1440 95"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-16 sm:h-20 md:h-24 object-cover block"
                preserveAspectRatio="none"
            >
                {/* Camada 1 (Fundo): Colina Suave e Grama Distante (Verde Sálvia Suave) */}
                <path
                    d="M0,45 C180,25 360,60 540,35 C720,15 900,55 1080,30 C1260,10 1380,40 1440,32 L1440,95 L0,95 Z"
                    fill="#5f8d70"
                    fillOpacity="0.45"
                />

                {/* Camada 2 (Meio): Ondulação Orgânica com Folhagens (Verde Primário / Sálvia) */}
                <path
                    d="M0,58 C120,40 240,65 360,48 C480,32 600,60 720,42 C840,28 960,58 1080,45 C1200,32 1340,55 1440,48 L1440,95 L0,95 Z"
                    fill="#487157"
                    fillOpacity="0.75"
                />

                {/* Camada 3: Lâminas de Grama e Brotos Detalhados no Topo */}
                {/* Repetição e variações orgânicas de lâminas de grama ao longo da extensão */}
                <g fill="#3a5a46">
                    {/* Conjunto 1 */}
                    <path d="M20,65 Q25,25 28,15 Q32,25 36,65 Z" />
                    <path d="M30,65 Q38,18 45,8 Q48,22 52,65 Z" />
                    <path d="M46,65 Q58,30 65,22 Q68,35 72,65 Z" />
                    <path d="M80,68 Q90,32 98,18 Q104,30 110,68 Z" />
                    <path d="M102,68 Q115,22 125,12 Q128,28 134,68 Z" />
                    <path d="M140,65 Q148,35 158,25 Q164,38 170,65 Z" />

                    {/* Conjunto 2 */}
                    <path d="M220,65 Q228,28 235,16 Q240,26 248,65 Z" />
                    <path d="M242,65 Q252,14 260,6 Q266,20 272,65 Z" />
                    <path d="M265,65 Q278,32 288,24 Q292,38 298,65 Z" />
                    <path d="M310,68 Q322,30 330,15 Q336,28 342,68 Z" />
                    <path d="M338,68 Q350,20 360,10 Q366,25 372,68 Z" />

                    {/* Conjunto 3 */}
                    <path d="M440,65 Q448,25 456,12 Q462,24 470,65 Z" />
                    <path d="M465,65 Q478,16 488,8 Q494,22 502,65 Z" />
                    <path d="M498,65 Q510,30 520,20 Q526,35 532,65 Z" />
                    <path d="M540,68 Q552,28 562,14 Q568,26 575,68 Z" />

                    {/* Conjunto 4 */}
                    <path d="M640,65 Q648,22 658,10 Q664,25 672,65 Z" />
                    <path d="M668,65 Q680,18 690,6 Q698,22 705,65 Z" />
                    <path d="M700,65 Q712,32 722,22 Q728,36 735,65 Z" />
                    <path d="M745,68 Q758,26 768,12 Q774,28 782,68 Z" />

                    {/* Conjunto 5 */}
                    <path d="M850,65 Q858,24 866,14 Q872,26 880,65 Z" />
                    <path d="M875,65 Q888,15 898,5 Q905,20 912,65 Z" />
                    <path d="M908,65 Q920,30 930,20 Q936,35 944,65 Z" />
                    <path d="M955,68 Q968,28 978,15 Q985,28 992,68 Z" />

                    {/* Conjunto 6 */}
                    <path d="M1060,65 Q1068,26 1076,14 Q1082,25 1090,65 Z" />
                    <path d="M1085,65 Q1098,16 1108,8 Q1115,22 1122,65 Z" />
                    <path d="M1118,65 Q1130,32 1140,22 Q1146,36 1154,65 Z" />
                    <path d="M1165,68 Q1178,24 1188,12 Q1195,26 1202,68 Z" />

                    {/* Conjunto 7 */}
                    <path d="M1270,65 Q1278,25 1286,15 Q1292,26 1300,65 Z" />
                    <path d="M1295,65 Q1308,18 1318,7 Q1325,20 1332,65 Z" />
                    <path d="M1328,65 Q1340,30 1350,20 Q1356,35 1364,65 Z" />
                    <path d="M1375,68 Q1388,28 1398,16 Q1405,28 1415,68 Z" />
                </g>

                {/* Camada 4 (Frente/Terra): Solo Fértil Marrom que se funde diretamente com o bg-warm-900 do Footer */}
                <path
                    d="M0,68 C150,55 300,72 450,60 C600,48 750,70 900,58 C1050,46 1200,68 1350,56 C1400,52 1440,62 1440,62 L1440,95 L0,95 Z"
                    fill="#5a3d2e"
                />
            </svg>
        </div>
    );
};

export default GrassDivider;
