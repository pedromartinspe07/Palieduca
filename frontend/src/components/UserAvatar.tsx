import React, { useState } from 'react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const getFullMediaUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const AVATAR_GRADIENTS = [
    'from-teal-500 to-emerald-600 text-white',
    'from-sky-500 to-blue-600 text-white',
    'from-indigo-500 to-purple-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-pink-600 text-white',
    'from-emerald-500 to-teal-700 text-white',
    'from-purple-500 to-indigo-700 text-white',
    'from-blue-600 to-cyan-600 text-white'
];

interface UserAvatarProps {
    fotoUrl?: string | null;
    nome?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showBorder?: boolean;
    borderClassName?: string;
    onClick?: () => void;
    title?: string;
}

const SIZE_CONFIGS = {
    xs: {
        container: 'w-6 h-6',
        text: 'text-[10px] font-extrabold',
    },
    sm: {
        container: 'w-7 h-7 sm:w-8 sm:h-8',
        text: 'text-xs font-black',
    },
    md: {
        container: 'w-10 h-10',
        text: 'text-sm font-black',
    },
    lg: {
        container: 'w-24 h-24',
        text: 'text-3xl font-black tracking-tight',
    },
    xl: {
        container: 'w-28 h-28',
        text: 'text-4xl font-black tracking-tight',
    }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
    fotoUrl,
    nome,
    size = 'md',
    className = '',
    showBorder = true,
    borderClassName = 'border-2 border-white/90 shadow-sm',
    onClick,
    title
}) => {
    const [imgError, setImgError] = useState(false);
    const resolvedUrl = fotoUrl && !imgError ? getFullMediaUrl(fotoUrl) : null;

    const rawName = (nome || 'Aluno').trim();
    const initial = rawName ? rawName.charAt(0).toUpperCase() : 'A';

    // Calcula índice de cor determinístico baseado no nome
    let hash = 0;
    for (let i = 0; i < rawName.length; i++) {
        hash = rawName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % AVATAR_GRADIENTS.length;
    const gradient = AVATAR_GRADIENTS[colorIndex];

    const config = SIZE_CONFIGS[size];

    return (
        <div
            onClick={onClick}
            title={title || rawName}
            className={`relative rounded-full aspect-square shrink-0 overflow-hidden select-none flex items-center justify-center transition-all ${
                config.container
            } ${showBorder ? borderClassName : ''} ${className}`}
        >
            {resolvedUrl ? (
                <img
                    src={resolvedUrl}
                    alt={rawName}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center aspect-square"
                />
            ) : (
                /* Avatar com Gradiente e Letra Inicial Estilo YouTube/Google */
                <div 
                    className={`w-full h-full bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-inner`}
                >
                    <span className={`${config.text} uppercase select-none drop-shadow-xs`}>
                        {initial}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserAvatar;
