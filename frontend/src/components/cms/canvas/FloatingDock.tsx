import React from 'react';
import { Type, Image as ImageIcon, Square, Plus } from 'lucide-react';

interface FloatingDockProps {
    onAdd: (type: 'text' | 'image' | 'shape') => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onAdd }) => {
    return (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-warm-200">
            <div className="text-warm-400 p-2 mb-2 border-b border-warm-200 w-full flex justify-center">
                <Plus size={20} />
            </div>
            
            <button
                onClick={() => onAdd('text')}
                className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-warm-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group"
                title="Adicionar Texto"
            >
                <Type size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-full ml-4 bg-warm-800 text-white px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity">Texto</span>
            </button>

            <button
                onClick={() => onAdd('image')}
                className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-warm-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group"
                title="Adicionar Imagem"
            >
                <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-full ml-4 bg-warm-800 text-white px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity">Imagem</span>
            </button>

            <button
                onClick={() => onAdd('shape')}
                className="w-12 h-12 flex flex-col items-center justify-center gap-1 text-warm-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group"
                title="Adicionar Forma"
            >
                <Square size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 absolute left-full ml-4 bg-warm-800 text-white px-2 py-1 rounded shadow-lg pointer-events-none transition-opacity">Forma</span>
            </button>
        </div>
    );
};
