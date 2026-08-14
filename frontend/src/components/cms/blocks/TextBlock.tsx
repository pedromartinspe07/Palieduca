import React from 'react';
import type { BlockProps } from './types';

const TextBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { content } = block.data;
    const { 
        fontSize = 16, 
        textColor = '#374151',
        fontFamily = 'sans-serif',
        fontWeight = '400',
        textAlign = 'left',
        lineHeight = '1.6',
        letterSpacing = 'normal',
        textTransform = 'none',
        textDecoration = 'none',
        backgroundColor = 'transparent',
        textShadow = 'none'
    } = block.styles || {};

    const handleTextChange = (text: string) => {
        onUpdate(block.id, { data: { ...block.data, content: text } });
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
                <div
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onInput={(e) => handleTextChange(e.currentTarget.innerHTML)}
                    onBlur={(e) => handleTextChange(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: content || '<p>Clique para editar este bloco de texto. Você pode usar <strong>negrito</strong>, <em>itálico</em>, listas e muito mais.</p>' }}
                    className="prose prose-warm rich-text-content max-w-none outline-none transition-all duration-150"
                    style={{ 
                        fontSize: `${fontSize}px`, 
                        color: textColor,
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
                        borderRadius: backgroundColor !== 'transparent' ? '1rem' : undefined
                    }}
                />
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
