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
    const { bgColor = 'transparent' } = block.styles || {};
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch modules inside editor and live site to show real preview
        fetch(`${API_URL}/api/modules`)
            .then(res => res.json())
            .then(data => setModules(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleTextChange = (field: string, text: string) => {
        onUpdate(block.id, { data: { ...block.data, [field]: text } });
    };

    const editableClass = isEditing ? 'outline-dashed outline-2 outline-teal-500/50 outline-offset-4 rounded cursor-text' : '';

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full py-14 px-4 sm:px-6 lg:px-8 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-teal-500 ring-inset z-10 rounded-3xl' : ''
            }`}
            style={{ backgroundColor: bgColor }}
        >
            <div className="max-w-[85rem] mx-auto">
                <div className="mb-12 text-left">
                    <h2 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                        className={`text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-slate-50 tracking-tight mb-3 outline-none ${editableClass}`}
                    >
                        {title || 'Explore Nossos Módulos'}
                    </h2>
                    
                    <p 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('intro', e.currentTarget.innerText)}
                        className={`text-base sm:text-lg text-[#64748B] dark:text-slate-300 max-w-3xl leading-relaxed outline-none font-normal ${editableClass}`}
                    >
                        {intro || 'Acesse o conteúdo selecionado por especialistas.'}
                    </p>
                </div>

                {/* Grid de Cards dos Módulos */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${isEditing ? 'pointer-events-none opacity-90' : ''}`}>
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                        : modules.map((module, idx) => {
                            const levels = ['Fundamentos', 'Comunicação', 'Controle de Sintomas', 'Apoio & Família', 'Acolhimento', 'Bioética & Decisões'];
                            const times = [15, 20, 25, 20, 15, 30];
                            return (
                                <div key={module.id} className="h-full">
                                    <ModuleCard 
                                        id={module.slug_id}
                                        title={module.title}
                                        description={module.description}
                                        icon={iconMap[module.icon_name] || <Stethoscope size={24} />}
                                        progress={module.progress}
                                        resources={module.resources.split(',').map((s: string) => s.trim())}
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
            </div>

            {isSelected && (
                <div className="absolute top-4 right-4 bg-teal-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-md z-20">
                    Grid de Módulos
                </div>
            )}
        </div>
    );
};

export default ModulesGridBlock;
