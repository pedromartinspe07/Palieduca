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
    previewContent?: string;
}

const Modulos: React.FC<ModulosProps> = ({ previewContent }) => {
    const [content, setContent] = useState(previewContent || '');
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [loadingContent, setLoadingContent] = useState(!previewContent);
    const [loadingModules, setLoadingModules] = useState(true);

    useEffect(() => {
        if (previewContent !== undefined) {
            setContent(previewContent);
            setLoadingContent(false);
        } else {
            // Fetch Page CMS Content
            fetch(`${API_URL}/api/pages/modulos`)
                .then(res => res.json())
                .then(data => setContent(data.content || ''))
                .catch(err => console.error(err))
                .finally(() => setLoadingContent(false));
        }

        // Fetch Modules List
        fetch(`${API_URL}/api/modules`)
            .then(res => res.json())
            .then(data => setModules(data))
            .catch(err => console.error(err))
            .finally(() => setLoadingModules(false));
    }, [previewContent]);

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-background">
            <div className="max-w-[85rem] mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 rounded-xl shadow-md">
                        <LayoutDashboard size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-warm-900">Módulos de Aprendizagem</h1>
                </div>

                {/* Área de Texto Editável pelo CMS */}
                <div className="mb-12">
                    {loadingContent ? (
                        <div className="animate-pulse h-20 bg-warm-200 rounded-xl w-full"></div>
                    ) : (
                        content && (
                            <div 
                                className="rich-text-content prose prose-warm max-w-none prose-headings:text-warm-900 prose-p:text-warm-700"
                                dangerouslySetInnerHTML={{ __html: content }} 
                            />
                        )
                    )}
                </div>

                {/* Lista de Módulos (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
