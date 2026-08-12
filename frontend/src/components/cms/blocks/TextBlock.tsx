import React from 'react';
import type { BlockProps } from './types';

const TextBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { content } = block.data;
    const { fontSize = 16, textColor = '#374151' } = block.styles || {};

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
            <div className="max-w-[85rem] mx-auto px-6 py-8">
                <div
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: content || '<p>Clique para editar este bloco de texto. Você pode usar <strong>negrito</strong>, <em>itálico</em>, listas e muito mais.</p>' }}
                    className="prose prose-warm max-w-none outline-none leading-relaxed"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                />
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow">
                    Texto
                </div>
            )}
        </div>
    );
};

export default TextBlock;
