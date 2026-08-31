import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageEditor from '../components/cms/PageEditor';
import ModuleContentEditor from '../components/cms/ModuleContentEditor';
import { LayoutTemplate, GraduationCap, ArrowLeft, ExternalLink } from 'lucide-react';
import { ButterflyIcon } from '../components/ButterflyLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';

const Editor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pages' | 'modules'>('modules');
    const { user } = useAuth();

    return (
        <main className="h-screen w-full bg-warm-50 dark:bg-[#070c18] flex flex-col overflow-hidden text-warm-900 dark:text-slate-100">
            {/* ═══ TOP GLOBAL WORKSPACE BAR ═══ */}
            <header className="h-14 bg-white dark:bg-slate-900 border-b border-warm-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between shadow-xs z-50 shrink-0 gap-3">
                {/* Left: Brand & Exit */}
                <div className="flex items-center gap-3 shrink-0">
                    <Link
                        to="/"
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-100 dark:hover:bg-slate-800 text-warm-600 dark:text-slate-300 transition-colors group"
                        title="Sair do Editor e voltar para a Página Inicial"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <div className="bg-teal-50 dark:bg-teal-950/70 p-1.5 rounded-lg text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60 hidden sm:flex items-center justify-center">
                            <ButterflyIcon size={18} />
                        </div>
                        <span className="font-extrabold text-sm text-teal-950 dark:text-teal-100 hidden md:inline">
                            Palieduca <span className="font-medium text-xs text-warm-500 dark:text-slate-400">&bull; Editor</span>
                        </span>
                    </Link>
                </div>

                {/* Center: Main Switcher (Módulos vs Páginas) */}
                <div className="flex items-center bg-warm-100 dark:bg-slate-800 p-1 rounded-2xl border border-warm-200 dark:border-slate-700 max-w-md w-full justify-center">
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'modules'
                                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm border border-warm-200/60 dark:border-slate-700'
                                : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-white'
                        }`}
                    >
                        <GraduationCap size={16} className={activeTab === 'modules' ? 'text-teal-600 dark:text-teal-400' : ''} />
                        <span>Conteúdo das Aulas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                            activeTab === 'pages'
                                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm border border-warm-200/60 dark:border-slate-700'
                                : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-white'
                        }`}
                    >
                        <LayoutTemplate size={16} className={activeTab === 'pages' ? 'text-teal-600 dark:text-teal-400' : ''} />
                        <span>Páginas do Site</span>
                    </button>
                </div>

                {/* Right: Theme Toggle & User */}
                <div className="flex items-center gap-2 shrink-0">
                    <ThemeToggle />
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-warm-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-2.5 py-1.5 rounded-lg border border-warm-200 dark:border-slate-700 hover:bg-warm-50 dark:hover:bg-slate-800 transition-colors"
                        title="Abrir o site em nova aba para testar"
                    >
                        <span>Ver Site</span>
                        <ExternalLink size={12} />
                    </Link>
                    {user && (
                        <div className="flex items-center gap-2 pl-1 border-l border-warm-200 dark:border-slate-800">
                            <UserAvatar fotoUrl={user.foto_url} nome={user.nome} size="sm" />
                            <span className="text-xs font-bold text-warm-800 dark:text-slate-200 hidden xl:inline truncate max-w-[100px]">
                                {user.nome.split(' ')[0]}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Workspace Area */}
            <div className="flex-1 w-full h-full p-0 sm:p-2.5 overflow-hidden relative min-h-0">
                {activeTab === 'pages' ? <PageEditor /> : <ModuleContentEditor />}
            </div>
        </main>
    );
};

export default Editor;
