import React from 'react';
import type { BlockProps } from './types';
import { Play } from 'lucide-react';

const MediaBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { url = '', title = 'Conteúdo Multimídia' } = block.data || {};

    let embedUrl = url;
    const ytMatch = embedUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    if (ytMatch && ytMatch[1]) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full max-w-4xl mx-auto py-8 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-xl'
            }`}
        >
            <div className={`bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm ${isEditing ? 'pointer-events-none' : ''}`}>
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Play size={20}/></div>
                    <h3 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onUpdate(block.id, { data: { ...block.data, title: e.currentTarget.innerText } })}
                        className="font-bold text-warm-900 text-lg outline-none flex-1 pointer-events-auto"
                    >
                        {title}
                    </h3>
                </div>
                
                {embedUrl ? (
                    <div className="aspect-video w-full bg-black">
                        <iframe 
                            src={embedUrl} 
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <div className="aspect-video w-full bg-warm-100 flex items-center justify-center flex-col gap-3 text-warm-400">
                        <Play size={48} className="opacity-50" />
                        <p className="font-medium">Insira a URL do vídeo no painel lateral</p>
                    </div>
                )}
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow z-20">
                    Mídia (Vídeo/Áudio)
                </div>
            )}
        </div>
    );
};

export default MediaBlock;
