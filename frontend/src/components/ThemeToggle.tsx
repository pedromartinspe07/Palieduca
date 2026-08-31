import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
    // Modo pode ser 'system' (automático do celular/PC), 'light' ou 'dark'
    const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
    const [isActuallyDark, setIsActuallyDark] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = (localStorage.getItem('palieduca-theme') as 'system' | 'light' | 'dark') || 'system';
        setThemeMode(savedTheme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            const systemPrefersDark = mediaQuery.matches;
            let shouldBeDark = false;

            if (savedTheme === 'dark') {
                shouldBeDark = true;
            } else if (savedTheme === 'light') {
                shouldBeDark = false;
            } else {
                // Modo 'system' (automático): segue Android, iPhone, Windows, Mac ou Linux
                shouldBeDark = systemPrefersDark;
            }

            setIsActuallyDark(shouldBeDark);
            if (shouldBeDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();

        // Ouve em tempo real se o celular ou computador mudou de tema (ex: virou a noite ou ativou no painel)
        const handleSystemChange = (e: MediaQueryListEvent) => {
            const currentSaved = localStorage.getItem('palieduca-theme') || 'system';
            if (currentSaved === 'system') {
                setIsActuallyDark(e.matches);
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleSystemChange);
        return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }, []);

    const cycleTheme = () => {
        // Ciclo inteligente: Se está no sistema (claro) -> vai pra dark -> vai pra light -> volta pro sistema
        let nextMode: 'system' | 'light' | 'dark';
        if (themeMode === 'system') {
            nextMode = isActuallyDark ? 'light' : 'dark';
        } else if (themeMode === 'dark') {
            nextMode = 'light';
        } else if (themeMode === 'light') {
            nextMode = 'system';
        } else {
            nextMode = 'system';
        }

        setThemeMode(nextMode);
        localStorage.setItem('palieduca-theme', nextMode);

        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const willBeDark = nextMode === 'dark' || (nextMode === 'system' && systemPrefersDark);

        setIsActuallyDark(willBeDark);
        if (willBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const getTooltipText = () => {
        if (themeMode === 'system') {
            return `Tema Automático (Seguindo o ${isActuallyDark ? 'Modo Escuro' : 'Modo Claro'} do seu celular/computador)`;
        }
        if (themeMode === 'dark') {
            return 'Modo Noturno (Fixado) — Clique para alternar para Modo Claro';
        }
        return 'Modo Claro (Fixado) — Clique para voltar ao Automático do Sistema';
    };

    return (
        <button
            type="button"
            onClick={cycleTheme}
            className={`relative p-2 rounded-2xl transition-all flex items-center justify-center cursor-pointer border ${
                isActuallyDark 
                    ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-md' 
                    : 'bg-warm-100/80 text-warm-700 border-warm-200 hover:bg-warm-200'
            } ${className}`}
            title={getTooltipText()}
            aria-label={getTooltipText()}
        >
            {themeMode === 'system' ? (
                <div className="relative">
                    {isActuallyDark ? (
                        <Moon size={17} className="transition-transform hover:-rotate-12" />
                    ) : (
                        <Sun size={17} className="transition-transform hover:rotate-45" />
                    )}
                    {/* Ponto indicador de modo automático do sistema */}
                    <span 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 border border-white dark:border-slate-800" 
                        title="Seguindo o sistema do celular/PC"
                    />
                </div>
            ) : isActuallyDark ? (
                <Moon size={17} className="transition-transform hover:-rotate-12" />
            ) : (
                <Sun size={17} className="transition-transform hover:rotate-45" />
            )}
        </button>
    );
};

export default ThemeToggle;
