import React, { useState, useEffect } from 'react';
import { User, HeartPulse, BookOpen, LayoutDashboard, Type, MessageSquare, Info, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { getFullMediaUrl } from '../utils/mediaUtils';

const NAV_ITEMS = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Início" },
    { to: "/apresentacao", icon: <Info size={18} />, label: "Apresentação" },
    { to: "/modulos", icon: <BookOpen size={18} />, label: "Módulos" },
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
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const getDisplayName = (fullName: string) => {
        if (!fullName) return 'Perfil';
        const parts = fullName.trim().split(/\s+/);
        if (parts[0].toLowerCase().startsWith('prof') || parts[0].toLowerCase().startsWith('dr')) {
            return parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0];
        }
        return parts[0];
    };

    return (
        <header className={`fixed top-0 w-full z-50 glassmorphism transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl text-white shadow-lg transform group-hover:scale-105 transition-transform">
                            <HeartPulse size={28} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-warm-900 group-hover:text-primary transition-colors">
                            Pali<span className="text-primary">educa</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.to}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'text-primary bg-warm-50 border border-warm-200'
                                        : 'text-warm-700 hover:text-primary hover:bg-warm-50'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <SearchBar />
                        {user ? (
                            <button 
                                onClick={() => navigate('/perfil')} 
                                className="flex items-center gap-2.5 pl-1.5 pr-4 py-1 bg-sage-100/90 text-sage-900 hover:bg-sage-200 rounded-full font-bold shadow-xs hover:shadow-sm transition-all border border-sage-300/90 text-xs cursor-pointer shrink-0"
                                title={`Ver perfil de ${user.nome}`}
                            >
                                {user.foto_url ? (
                                    <img 
                                        src={getFullMediaUrl(user.foto_url)} 
                                        alt={user.nome} 
                                        className="w-7 h-7 rounded-full object-cover object-center aspect-square shrink-0 border border-primary/30 shadow-2xs"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-sage-200/90 text-sage-800 flex items-center justify-center shrink-0 border border-sage-300">
                                        <User size={15} />
                                    </div>
                                )}
                                <span className="whitespace-nowrap">{getDisplayName(user.nome)}</span>
                            </button>
                        ) : (
                            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-medium shadow-md hover:shadow-lg interactive-btn text-xs">
                                <User size={16} />
                                <span>Entrar</span>
                            </button>
                        )}
                    </div>

                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-warm-700 hover:bg-warm-50 transition-colors"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white/90 backdrop-blur-xl border-t border-warm-100 px-4 py-3 space-y-1 shadow-lg">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.label}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                    ? 'text-primary bg-warm-50 border border-warm-100'
                                    : 'text-warm-700 hover:text-primary hover:bg-warm-50'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-3 border-t border-warm-100 flex gap-2">
                        {user ? (
                            <button onClick={() => navigate('/perfil')} className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 bg-sage-100 text-sage-800 rounded-full font-bold shadow-sm text-xs border border-sage-300">
                                {user.foto_url ? (
                                    <img 
                                        src={getFullMediaUrl(user.foto_url)} 
                                        alt={user.nome} 
                                        className="w-6 h-6 rounded-full object-cover object-center aspect-square shrink-0"
                                    />
                                ) : (
                                    <User size={16} />
                                )}
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
