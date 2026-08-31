import React from 'react';

interface ButterflyIconProps {
    size?: number;
    className?: string;
}

export const ButterflyIcon: React.FC<ButterflyIconProps> = ({ size = 26, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`butterfly-icon transition-transform duration-300 ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="butterflyGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="butterflyGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
                </linearGradient>
            </defs>

            {/* Antenas delicadas */}
            <path
                d="M 11.2 6.5 C 10 4 7.5 3 6.5 3.8 C 5.8 4.3 6.5 5.5 7.5 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M 12.8 6.5 C 14 4 16.5 3 17.5 3.8 C 18.2 4.3 17.5 5.5 16.5 5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />

            {/* Asa Esquerda Superior e Inferior */}
            <g className="wing-left origin-[12px_12px] transition-transform duration-300">
                {/* Asa Superior Esquerda */}
                <path
                    d="M 11.2 8.5 C 8.5 4 2.8 4.2 2.2 9 C 1.6 13.2 6.8 15 11 13.2 Z"
                    fill="url(#butterflyGradLeft)"
                />
                {/* Detalhe interno asa superior */}
                <path
                    d="M 4 8.5 C 4.5 6.5 8 6.5 10 9"
                    stroke="white"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.5"
                    fill="none"
                />
                {/* Asa Inferior Esquerda */}
                <path
                    d="M 10.8 13.5 C 7 14 3.5 17.5 4.8 20.2 C 6.2 22 10 19.8 11.5 16 Z"
                    fill="url(#butterflyGradLeft)"
                />
            </g>

            {/* Asa Direita Superior e Inferior */}
            <g className="wing-right origin-[12px_12px] transition-transform duration-300">
                {/* Asa Superior Direita */}
                <path
                    d="M 12.8 8.5 C 15.5 4 21.2 4.2 21.8 9 C 22.4 13.2 17.2 15 13 13.2 Z"
                    fill="url(#butterflyGradRight)"
                />
                {/* Detalhe interno asa superior */}
                <path
                    d="M 20 8.5 C 19.5 6.5 16 6.5 14 9"
                    stroke="white"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    opacity="0.5"
                    fill="none"
                />
                {/* Asa Inferior Direita */}
                <path
                    d="M 13.2 13.5 C 17 14 20.5 17.5 19.2 20.2 C 17.8 22 14 19.8 12.5 16 Z"
                    fill="url(#butterflyGradRight)"
                />
            </g>

            {/* Cabeça e Corpo da Borboleta */}
            <circle cx="12" cy="6.8" r="1.2" fill="currentColor" />
            <path
                d="M 11.3 8.2 C 11.3 7.8 12.7 7.8 12.7 8.2 L 12.5 16.5 C 12.5 17.2 11.5 17.2 11.5 16.5 Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default ButterflyIcon;
