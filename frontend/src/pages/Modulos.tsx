import React, { useState, useEffect } from 'react';
import ModuleCardSkeleton from '../components/ModuleCardSkeleton';
import ModuleCard from '../components/ModuleCard';
import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale, Leaf } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import type { BlockData } from '../components/cms/blocks/types';
import BotanicalBackground from '../components/effects/BotanicalBackground';
import { useAuth } from '../context/AuthContext';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const iconMap: Record<string, React.ReactNode> = {
    'Stethoscope': <Stethoscope size={24} />,
    'Users': <Users size={24} />,
    'HeartPulse': <HeartPulse size={24} />,
    'Brain': <Brain size={24} />,
    'HeartHandshake': <HeartHandshake size={24} />,
    'Scale': <Scale size={24} />
};

interface ModuleData {
    id: number;
    slug_id: string;
    title: string;
    description: string;
    icon_name: string;
    progress: number;
    resources: string;
    image_url: string;
    delay: number;
}

interface ModulosProps {
    isEditing?: boolean;
    initialContent?: any;
    onContentChange?: (content: any) => void;
}

const Modulos: React.FC<ModulosProps> = ({ isEditing, initialContent, onContentChange }) => {
    const { token } = useAuth();
    const [content, setContent] = useState<any>(initialContent || { 
        title: 'Módulos de Aprendizagem',
        intro: 'Explore trilhas interativas baseadas em evidências científicas, casos clínicos e metodologias ativas para aprofundar sua prática em cuidados paliativos.'
    });
    const [blocks, setBlocks] = useState<BlockData[] | null>(null);
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, { completed: number; total: number; percentage: number }>>({});
    const [loadingContent, setLoadingContent] = useState(!initialContent);
    const [loadingModules, setLoadingModules] = useState(true);

    // Sync from parent if it changes
    useEffect(() => {
        if (initialContent) setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        if (isEditing) {
            setLoadingContent(false);
        } else if (!initialContent) {
            // Fetch Page CMS Content
            fetch(`${API_URL}/api/v1/cms/pages/modulos`)
                .then(res => res.json())
                .then(data => {
                    try {
                        const parsed = JSON.parse(data.content || '{}');
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setBlocks(parsed);
                        } else {
                            setContent(parsed);
                        }
                    } catch (e) {
                        setContent({
                            title: 'Módulos de Aprendizagem',
                            intro: 'Explore trilhas interativas baseadas em evidências científicas, casos clínicos e metodologias ativas para aprofundar sua prática em cuidados paliativos.'
                        });
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadingContent(false));
        }

        // Fetch Modules List
        fetch(`${API_URL}/api/modules`)
            .then(res => res.json())
            .then(data => setModules(data))
            .catch(err => console.error(err))
            .finally(() => setLoadingModules(false));

        // Fetch Real User Progress
        if (token) {
            fetch(`${API_URL}/api/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.module_progress) {
                    setModuleProgressMap(data.module_progress);
                }
            })
            .catch(err => console.error('Erro ao buscar progresso:', err));
        }
    }, [isEditing, initialContent, token]);

    const handleTextChange = (field: string, text: string) => {
        const newContent = { ...content, [field]: text };
        setContent(newContent);
        if (onContentChange) onContentChange(newContent);
    };

    const editableClass = isEditing ? 'outline-dashed outline-1 outline-primary/40 focus:outline-primary rounded px-1' : '';

    if (blocks && blocks.length > 0) {
        return (
            <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
                <main className="max-w-7xl mx-auto">
                    {blocks.map(block => (
                        <BlockRenderer key={block.id} block={block} isEditing={false} onUpdate={() => {}} onSelect={() => {}} isSelected={false} />
                    ))}
                </main>
            </BotanicalBackground>
        );
    }

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <main className="max-w-6xl mx-auto">
                {/* Hero Banner do Módulo (Glassmorphism Botânico) */}
                <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-2xl mb-12 text-center relative overflow-hidden">
                    {/* Badge Botânica */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 font-bold text-xs mb-5 shadow-2xs">
                        <Leaf size={13} className="text-teal-600" />
                        <span>Trilhas de Aprendizagem &amp; Formação Humanizada</span>
                    </div>

                    {/* Título com Tipografia Gradiente Oficial */}
                    <h1 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4 tracking-tight font-display ${editableClass}`}
                    >
                        Módulos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#0f766e]">de Cuidados Paliativos</span>
                    </h1>

                    {/* Subtítulo */}
                    {loadingContent ? (
                        <div className="animate-pulse h-6 bg-slate-200 rounded-xl w-3/4 max-w-2xl mx-auto"></div>
                    ) : (
                        <p 
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleTextChange('intro', e.currentTarget.innerText)}
                            className={`text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed ${editableClass}`}
                        >
                            {content.intro || 'Explore trilhas interativas baseadas em evidências científicas, casos clínicos e metodologias ativas para aprofundar sua prática em cuidados paliativos.'}
                        </p>
                    )}
                </div>

                {/* Lista de Módulos (Cards) */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                    {loadingModules
                        ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                        : modules.map((module, idx) => {
                            const realProgress = moduleProgressMap[module.slug_id]?.percentage ?? 0;
                            const levels = ['Fundamentos', 'Comunicação', 'Controle de Sintomas', 'Apoio & Família', 'Acolhimento', 'Bioética & Decisões'];
                            const times = [15, 20, 25, 20, 15, 30];
                            return (
                                <div id={module.slug_id} key={module.id}>
                                    <ModuleCard 
                                        id={module.slug_id}
                                        title={module.title}
                                        description={module.description}
                                        icon={iconMap[module.icon_name] || <Stethoscope size={24} />}
                                        progress={realProgress}
                                        resources={module.resources.split(',').map(s => s.trim())}
                                        image={module.image_url}
                                        delay={(module.delay || idx * 1.5) / 10}
                                        level={levels[idx % levels.length]}
                                        estimatedMinutes={times[idx % times.length]}
                                    />
                                </div>
                            );
                        })
                    }
                </div>
            </main>
        </BotanicalBackground>
    );
};

export default Modulos;
