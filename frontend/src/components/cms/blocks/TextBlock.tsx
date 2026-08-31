import React, { useRef, useEffect } from 'react';
import type { BlockProps } from './types';
import { 
    BookOpen, Book, FileText, Sparkles, HeartPulse, Stethoscope, 
    GraduationCap, Bookmark, HelpCircle, Info, Layers, Lightbulb,
    Type, Users, Brain, HeartHandshake, Scale, MessageSquare
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
    Type,
    Users,
    Brain,
    HeartHandshake,
    Scale,
    MessageSquare
};

const TextBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { content } = block.data;
    const iconName = block.data?.icon_name || block.data?.icon;
    const iconColor = block.data?.iconColor || 'primary';
    const IconComponent = iconName ? ICON_MAP[iconName] : null;

    const { 
        fontSize = 16, 
        textColor = '#374151',
        fontFamily = 'sans-serif',
        fontWeight = '400',
        textAlign = 'left',
        lineHeight = '1.3',
        letterSpacing = 'normal',
        textTransform = 'none',
        textDecoration = 'none',
        backgroundColor = 'transparent',
        textShadow = 'none',
        paragraphSpacing = '0px'
    } = block.styles || {};

    const textRef = useRef<HTMLDivElement>(null);
    const isFocusedRef = useRef(false);

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'emerald':
                return { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400' };
            case 'blue':
                return { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-400' };
            case 'purple':
                return { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-400' };
            case 'amber':
                return { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400' };
            case 'rose':
                return { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-400' };
            case 'primary':
            default:
                return { bg: 'bg-primary/10 dark:bg-teal-950/60', text: 'text-primary dark:text-teal-400' };
        }
    };

    const colorClasses = getColorClasses(iconColor);

    // Sincroniza o HTML inicial APENAS se o elemento não estiver com o foco ativo do usuário.
    // Isso impede que o React recrie o innerHTML a cada Enter ou letra digitada, mantendo o cursor perfeitamente no lugar!
    useEffect(() => {
        if (textRef.current && !isFocusedRef.current) {
            const fallbackHtml = '<p>Clique para editar este bloco de texto. Você pode usar <strong>negrito</strong>, <em>itálico</em>, listas e muito mais.</p>';
            const targetHtml = content !== undefined && content !== null && content !== '' ? content : fallbackHtml;
            if (textRef.current.innerHTML !== targetHtml) {
                textRef.current.innerHTML = targetHtml;
            }
        }
    }, [content]);

    const handleTextChange = () => {
        if (textRef.current) {
            onUpdate(block.id, { data: { ...block.data, content: textRef.current.innerHTML } });
        }
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            className={`relative w-full transition-all duration-200 rounded-xl ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected
                    ? 'ring-4 ring-primary ring-inset z-10'
                    : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset'
            }`}
        >
            <div className="max-w-[85rem] mx-auto px-6 py-6">
                <div className="flex items-start gap-4">
                    {IconComponent && (
                        <div className={`${colorClasses.bg} p-3.5 rounded-2xl ${colorClasses.text} shrink-0 shadow-xs mt-1`}>
                            <IconComponent size={28} />
                        </div>
                    )}
                    <div
                        ref={textRef}
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onFocus={() => { isFocusedRef.current = true; }}
                        onBlur={() => { 
                            isFocusedRef.current = false; 
                            handleTextChange(); 
                        }}
                        onInput={handleTextChange}
                        className="flex-1 min-w-0 prose prose-warm dark:prose-invert text-slate-800 dark:text-slate-200 rich-text-content max-w-none outline-none transition-all duration-150"
                        style={{ 
                            fontSize: `${fontSize}px`, 
                            color: (!block.styles?.textColor || block.styles?.textColor === '#374151') ? undefined : textColor,
                            fontFamily: fontFamily === 'serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' :
                                        fontFamily === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' :
                                        fontFamily === 'rounded' ? '"Outfit", "Poppins", sans-serif' :
                                        'Inter, system-ui, -apple-system, sans-serif',
                            fontWeight: fontWeight,
                            textAlign: (textAlign && textAlign !== 'left') ? textAlign as any : undefined,
                            lineHeight: lineHeight,
                            letterSpacing: letterSpacing,
                            textTransform: textTransform as any,
                            textDecoration: textDecoration as any,
                            backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
                            textShadow: textShadow !== 'none' ? textShadow : undefined,
                            padding: backgroundColor !== 'transparent' ? '1.5rem' : undefined,
                            borderRadius: backgroundColor !== 'transparent' ? '1rem' : undefined,
                            ['--p-spacing' as any]: paragraphSpacing || '0px'
                        }}
                    />
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow z-20">
                    Bloco de Texto
                </div>
            )}
        </div>
    );
};

export default TextBlock;

