import React from 'react';
import type { BlockProps } from './types';

const HeroBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title, subtitle, bgImage } = block.data;

    const handleTextChange = (field: string, text: string) => {
        onUpdate(block.id, { ...block.data, [field]: text });
    };

    return (
        <div 
            onClick={(e) => {
                // Prevent bubbling if clicking inside
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full overflow-hidden transition-all duration-200 ${
                isEditing ? 'cursor-pointer min-h-[400px]' : 'min-h-[500px]'
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-xl'
            }`}
            style={{
                backgroundImage: bgImage ? `url(${bgImage})` : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                <h1 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                    className="text-4xl sm:text-6xl font-bold text-warm-900 mb-6 max-w-4xl tracking-tight"
                    style={{ outline: 'none' }}
                >
                    {title || 'Título do seu Hero'}
                </h1>
                
                <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('subtitle', e.currentTarget.innerText)}
                    className="text-lg sm:text-xl text-warm-700 max-w-2xl leading-relaxed"
                    style={{ outline: 'none' }}
                >
                    {subtitle || 'Adicione um subtítulo cativante para engajar seus visitantes logo na primeira dobra do site.'}
                </p>
                
                {/* Mocked Button, uneditable inline for safety, can be styled later in Properties */}
                <div className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform pointer-events-none">
                    Saiba Mais
                </div>
            </div>
            
            {/* Visual indicator of selection */}
            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow">
                    Hero Section
                </div>
            )}
        </div>
    );
};

export default HeroBlock;
