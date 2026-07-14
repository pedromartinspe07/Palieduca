import React from 'react';
import { Search, User, HeartPulse, BookOpen, LayoutDashboard, Type, MessageSquare, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 w-full z-50 glassmorphism transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl text-white shadow-lg transform group-hover:scale-105 transition-transform">
                            <HeartPulse size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold gradient-text tracking-tight">
                            Palieduca
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {[
                            { to: "/", icon: <LayoutDashboard size={18} />, label: "Início" },
                            { to: "/apresentacao", icon: <Info size={18} />, label: "Apresentação" },
                            { to: "/modulos", icon: <BookOpen size={18} />, label: "Módulos" },
                            { to: "/biblioteca", icon: <MessageSquare size={18} />, label: "Biblioteca" },
                            { to: "/glossario", icon: <Type size={18} />, label: "Glossário" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                to={item.to}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-warm-700 hover:text-primary hover:bg-warm-50 transition-colors"
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <input
                                type="text"
                                placeholder="Pesquisar conteúdos..."
                                className="pl-10 pr-4 py-2 bg-white/50 border border-warm-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm focus:bg-white w-64"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" size={18} />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-medium shadow-md hover:shadow-lg interactive-btn">
                            <User size={18} />
                            <span>Entrar</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
