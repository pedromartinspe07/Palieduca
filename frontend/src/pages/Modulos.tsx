import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import ModuleCardSkeleton from '../components/ModuleCardSkeleton';
import ModuleCard from '../components/ModuleCard';
import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale } from 'lucide-react';

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
    const [content, setContent] = useState<any>(initialContent || { 
        title: 'Módulos de Aprendizagem',
        intro: 'Bem-vindo à área de módulos. Escolha um módulo abaixo para começar a aprender.'
    });
    const [modules, setModules] = useState<ModuleData[]>([]);
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
                        // Se era o formato antigo (array), fallback para default
                        if (Array.isArray(parsed)) {
                            throw new Error('Old format');
                        }
                        setContent(parsed);
                    } catch (e) {
                        setContent({
                            title: 'Módulos de Aprendizagem',
                            intro: 'Bem-vindo à área de módulos. Escolha um módulo abaixo para começar a aprender.'
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
    }, [isEditing, initialContent]);

    const handleTextChange = (field: string, text: string) => {
        const newContent = { ...content, [field]: text };
        setContent(newContent);
        if (onContentChange) onContentChange(newContent);
    };

    const editableClass = isEditing ? 'outline-dashed outline-2 outline-primary/50 outline-offset-4 cursor-text hover:bg-warm-100/50 transition-colors rounded' : '';

    return (
        <main className={`min-h-screen pt-32 pb-20 px-4 bg-background ${isEditing ? 'pointer-events-auto' : ''}`}>
            <div className="max-w-[85rem] mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-xl shadow-md">
                        <LayoutDashboard size={28} />
                    </div>
                    <h1 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                        className={`text-3xl font-bold text-warm-900 ${editableClass}`}
                    >
                        {content.title || 'Módulos de Aprendizagem'}
                    </h1>
                </div>

                {/* Área de Texto Editável pelo CMS */}
                <div className="mb-12">
                    {loadingContent ? (
                        <div className="animate-pulse h-6 bg-warm-200 rounded-xl w-3/4 max-w-2xl"></div>
                    ) : (
                        <p 
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleTextChange('intro', e.currentTarget.innerText)}
                            className={`text-lg text-warm-600 max-w-3xl ${editableClass}`}
                        >
                            {content.intro || 'Bem-vindo à área de módulos. Escolha um módulo abaixo para começar a aprender.'}
                        </p>
                    )}
                </div>

                {/* Lista de Módulos (Cards) */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ${isEditing ? 'pointer-events-none opacity-80' : ''}`}>
                    {loadingModules
                        ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                        : modules.map(module => (
                            <div id={module.slug_id} key={module.id}>
                                <ModuleCard 
                                    id={module.slug_id}
                                    title={module.title}
                                    description={module.description}
                                    icon={iconMap[module.icon_name] || <Stethoscope size={24} />}
                                    progress={module.progress}
                                    resources={module.resources.split(',').map(s => s.trim())}
                                    image={module.image_url}
                                    delay={module.delay / 10}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
        </main>
    );
};

export default Modulos;
