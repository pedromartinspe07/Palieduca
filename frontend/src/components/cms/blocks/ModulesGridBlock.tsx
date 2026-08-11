import React, { useState, useEffect } from 'react';
import type { BlockProps } from './types';
import ModuleCardSkeleton from '../../ModuleCardSkeleton';
import ModuleCard from '../../ModuleCard';
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

const ModulesGridBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title, intro } = block.data;
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isEditing) {
            // Fetch modules inside editor to show real preview
            fetch(`${API_URL}/api/modules`)
                .then(res => res.json())
                .then(data => setModules(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isEditing]);

    const handleTextChange = (field: string, text: string) => {
        onUpdate(block.id, { ...block.data, [field]: text });
    };

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full py-12 px-6 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl bg-white' : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-xl bg-transparent'
            }`}
        >
            <div className="max-w-[85rem] mx-auto">
                <div className="mb-10 text-center sm:text-left">
                    <h2 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                        className="text-3xl font-bold text-warm-900 mb-4 outline-none"
                    >
                        {title || 'Módulos de Aprendizagem'}
                    </h2>
                    
                    <p 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('intro', e.currentTarget.innerText)}
                        className="text-lg text-warm-600 max-w-3xl outline-none"
                    >
                        {intro || 'Bem-vindo à área de módulos. Escolha um módulo abaixo para começar a aprender.'}
                    </p>
                </div>

                {/* Grid is uneditable directly, sealed by magic */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pointer-events-none opacity-90">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                        : modules.slice(0, 3).map(module => (
                            <div key={module.id} className="scale-95 origin-top">
                                <ModuleCard 
                                    id={module.slug_id}
                                    title={module.title}
                                    description={module.description}
                                    icon={iconMap[module.icon_name] || <Stethoscope size={24} />}
                                    progress={module.progress}
                                    resources={module.resources.split(',').map((s: string) => s.trim())}
                                    image={module.image_url}
                                    delay={module.delay / 10}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow">
                    Grid de Módulos
                </div>
            )}
        </div>
    );
};

export default ModulesGridBlock;
