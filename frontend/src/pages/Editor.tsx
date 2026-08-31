import React, { useState } from 'react';
import PageEditor from '../components/cms/PageEditor';
import ModuleContentEditor from '../components/cms/ModuleContentEditor';
import { LayoutTemplate, GraduationCap } from 'lucide-react';

const Editor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pages' | 'modules'>('pages');

    return (
        <main className="h-[100dvh] w-full pt-20 pb-0 bg-warm-50 dark:bg-[#0b1329] flex flex-col overflow-hidden">
            
            {/* Tabs Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-warm-200 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-3 flex gap-2 sm:gap-4 shadow-xs z-10 shrink-0 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                        activeTab === 'pages'
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-warm-50 dark:bg-slate-800 text-warm-600 dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <LayoutTemplate size={17} />
                    Páginas do Site
                </button>
                <button
                    onClick={() => setActiveTab('modules')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                        activeTab === 'modules'
                            ? 'bg-[#8c6b5d] text-white shadow-md'
                            : 'bg-warm-50 dark:bg-slate-800 text-warm-600 dark:text-slate-300 hover:bg-warm-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <GraduationCap size={17} />
                    Conteúdo dos Módulos
                </button>
            </div>

            <div className="flex-1 w-full h-full p-2 sm:p-4 overflow-hidden relative min-h-0">
                {activeTab === 'pages' ? <PageEditor /> : <ModuleContentEditor />}
            </div>
        </main>
    );
};

export default Editor;
