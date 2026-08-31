import React, { useState, useEffect } from 'react';
import { User, BookOpen, LayoutDashboard, Type, MessageSquare, Info, Menu, X, Smartphone, Download, Users } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import { triggerGlobalPWAInstall } from './PWAInstallPrompt';
import { ButterflyIcon } from './ButterflyLogo';

const NAV_ITEMS = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Início" },
    { to: "/apresentacao", icon: <Info size={18} />, label: "Apresentação" },
    { to: "/modulos", icon: <BookOpen size={18} />, label: "Módulos" },
    { to: "/comunidade", icon: <Users size={18} />, label: "Comunidade" },
    { to: "/biblioteca", icon: <MessageSquare size={18} />, label: "Biblioteca" },
    { to: "/glossario", icon: <Type size={18} />, label: "Glossário" },
];

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getDisplayName = (nome: string) => {
        if (!nome) return 'Aluno';
        const parts = nome.trim().split(' ');
        if (parts[0].toLowerCase().startsWith('prof')) {
            return parts.slice(0, 3).join(' ');
        }
        return parts[0];
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
                ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs py-3 border-b border-warm-100 dark:border-slate-800'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="bg-gradient-to-br from-teal-50 to-sky-50 dark:from-teal-950/70 dark:to-sky-950/70 p-2 rounded-2xl text-teal-600 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                            <ButterflyIcon size={26} className="text-teal-700 dark:text-teal-300" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-teal-950 dark:text-teal-50 drop-shadow-xs font-display group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                            Palieduca
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-warm-200/60 dark:border-slate-800 shadow-xs">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${isActive
                                        ? 'bg-gradient-to-r from-teal-700 to-sky-700 text-white shadow-xs'
                                        : 'text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <SearchBar />
                        <ThemeToggle />
                        <button
                            onClick={triggerGlobalPWAInstall}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-full font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
                            title="Baixar aplicativo Palieduca (PWA)"
                        >
                            <Smartphone size={13} />
                            <span className="hidden lg:inline">App</span>
                            <Download size={13} />
                        </button>
                        {user ? (
                            <button 
                                onClick={() => navigate('/perfil')} 
                                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-slate-100 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-full font-bold shadow-xs hover:shadow-sm transition-all border border-sky-200 dark:border-slate-700 text-xs cursor-pointer shrink-0"
                                title={`Ver perfil de ${user.nome}`}
                            >
                                <UserAvatar 
                                    fotoUrl={user.foto_url} 
                                    nome={user.nome} 
                                    size="xs" 
                                    borderClassName="border border-sky-300 shadow-2xs" 
                                />
                                <span className="whitespace-nowrap">{getDisplayName(user.nome)}</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-slate-700 rounded-full text-[11px] font-bold shadow-2xs" title="Você está navegando em modo de demonstração como Visitante">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                    Visitante
                                </span>
                                <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-full font-bold shadow-md hover:shadow-lg interactive-btn text-xs cursor-pointer">
                                    <User size={15} />
                                    <span>Entrar</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={triggerGlobalPWAInstall}
                            className="flex items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs"
                            title="Baixar App Palieduca (PWA)"
                            aria-label="Baixar aplicativo Palieduca"
                        >
                            <Download size={16} />
                        </button>
                        <ThemeToggle />
                        <button
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-warm-700 dark:text-slate-200 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setMenuOpen(prev => !prev)}
                            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-warm-100 dark:border-slate-800 px-4 py-4 space-y-2 shadow-lg safe-area-bottom">
                    {/* Barra de Busca Mobile */}
                    <div className="pb-2 border-b border-warm-100 dark:border-slate-800">
                        <SearchBar />
                    </div>

                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors touch-target-44 ${isActive
                                    ? 'text-primary dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800'
                                    : 'text-warm-700 dark:text-slate-200 hover:text-primary hover:bg-warm-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-2 pb-1">
                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(false);
                                triggerGlobalPWAInstall();
                            }}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-2xs">
                                    <Smartphone size={15} />
                                </div>
                                <div className="text-left">
                                    <div className="font-extrabold text-xs">Baixar Aplicativo</div>
                                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">Instalar no celular (PWA)</div>
                                </div>
                            </div>
                            <Download size={16} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                        </button>
                    </div>

                    <div className="pt-2 border-t border-warm-100 dark:border-slate-800 flex gap-2">
                        {user ? (
                            <button onClick={() => navigate('/perfil')} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-slate-200 rounded-full font-bold shadow-xs text-xs border border-sky-200 dark:border-slate-700">
                                <UserAvatar 
                                    fotoUrl={user.foto_url} 
                                    nome={user.nome} 
                                    size="xs" 
                                    borderClassName="border border-sky-300" 
                                />
                                <span className="whitespace-nowrap">{getDisplayName(user.nome)}</span>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-medium shadow-md text-sm">
                                <User size={16} />
                                <span>Entrar</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
