import React, { useState } from 'react';
import PageEditor from '../components/cms/PageEditor';
import ModuleContentEditor from '../components/cms/ModuleContentEditor';
import { LayoutTemplate, GraduationCap } from 'lucide-react';

const Editor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pages' | 'modules'>('pages');

    return (
        <main className="h-screen w-full pt-20 pb-0 bg-warm-50 flex flex-col overflow-hidden">
            
            {/* Tabs Header */}
            <div className="bg-white border-b border-warm-200 px-6 py-3 flex gap-4 shadow-sm z-10 shrink-0">
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                        activeTab === 'pages'
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                    }`}
                >
                    <LayoutTemplate size={20} />
                    Páginas do Site
                </button>
                <button
                    onClick={() => setActiveTab('modules')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                        activeTab === 'modules'
                            ? 'bg-[#8c6b5d] text-white shadow-md'
                            : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                    }`}
                >
                    <GraduationCap size={20} />
                    Conteúdo dos Módulos
                </button>
            </div>

            <div className="flex-1 w-full h-full p-4 overflow-hidden relative">
                {activeTab === 'pages' ? <PageEditor /> : <ModuleContentEditor />}
            </div>
        </main>
    );
};

export default Editor;
