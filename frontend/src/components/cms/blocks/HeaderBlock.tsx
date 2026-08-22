import React from 'react';
import type { BlockProps } from './types';
import { 
    BookOpen, Book, FileText, Sparkles, HeartPulse, Stethoscope, 
    GraduationCap, Bookmark, HelpCircle, Info, Layers, Lightbulb,
    Type, Edit3
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    BookOpen,
    Book,
    FileText,
    Sparkles,
    HeartPulse,
    Stethoscope,
    GraduationCap,
    Bookmark,
    HelpCircle,
    Info,
    Layers,
    Lightbulb,
    Type
};

const HeaderBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const data = block.data || {};
    const title = data.title !== undefined ? data.title : 'Título do Cabeçalho';
    const description = data.description !== undefined ? data.description : 'Subtítulo explicativo com conceitos e diretrizes.';
    const iconName = data.icon || 'BookOpen';
    const badge = data.badge || '';
    const showDivider = data.showDivider !== false;
    const iconColor = data.iconColor || 'primary'; // 'primary', 'emerald', 'blue', 'purple', 'amber', 'rose'

    const IconComponent = ICON_MAP[iconName] || BookOpen;

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'emerald':
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'blue':
                return { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'purple':
                return { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'amber':
                return { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
            case 'rose':
                return { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
            case 'primary':
            default:
                return { bg: 'bg-primary/10', text: 'text-primary', badge: 'bg-primary/5 text-primary border-primary/20' };
        }
    };

    const colorClasses = getColorClasses(iconColor);

    const handleTitleChange = (newTitle: string) => {
        onUpdate(block.id, {
            data: { ...data, title: newTitle }
        });
    };

    const handleDescChange = (newDesc: string) => {
        onUpdate(block.id, {
            data: { ...data, description: newDesc }
        });
    };

    return (
        <div 
            onClick={(e) => {
                if (isEditing) {
                    e.stopPropagation();
                    onSelect(block.id);
                }
            }}
            className={`transition-all duration-200 relative group rounded-2xl ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected 
                    ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 p-4' 
                    : isEditing 
                    ? 'hover:bg-warm-50/70 p-2' 
                    : ''
            }`}
        >
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                showDivider ? 'pb-6 border-b border-warm-200/80' : ''
            }`}>
                {/* Ícone Estilizado (Livro Aberto / Customizável) */}
                <div className={`${colorClasses.bg} p-3.5 sm:p-4 rounded-2xl ${colorClasses.text} shrink-0 shadow-xs flex items-center justify-center`}>
                    <IconComponent size={32} />
                </div>

                {/* Textos: Título e Subtítulo */}
                <div className="flex-1 min-w-0">
                    {badge && (
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1.5 border ${colorClasses.badge}`}>
                            {badge}
                        </span>
                    )}

                    {isEditing ? (
                        <h1 
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleTitleChange(e.currentTarget.innerText)}
                            className="text-2xl md:text-3xl font-extrabold text-warm-900 leading-tight focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
                        >
                            {title}
                        </h1>
                    ) : (
                        <h1 className="text-2xl md:text-3xl font-extrabold text-warm-900 leading-tight">
                            {title}
                        </h1>
                    )}

                    {isEditing ? (
                        <p 
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleDescChange(e.currentTarget.innerText)}
                            className="text-warm-600 mt-1.5 text-sm md:text-base leading-relaxed focus:outline-none focus:bg-white/80 focus:ring-2 focus:ring-primary/40 rounded px-1 -mx-1"
                        >
                            {description}
                        </p>
                    ) : (
                        description && (
                            <p className="text-warm-600 mt-1.5 text-sm md:text-base leading-relaxed">
                                {description}
                            </p>
                        )
                    )}
                </div>
            </div>

            {/* Badge de Edição ao selecionar */}
            {isSelected && isEditing && (
                <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Edit3 size={10} /> Cabeçalho com Ícone
                </div>
            )}
        </div>
    );
};

export default HeaderBlock;
