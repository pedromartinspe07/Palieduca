import React, { useState } from 'react';
import type { BlockProps } from './types';
import { Layers } from 'lucide-react';

const FlashcardBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onSelect }) => {
    const { cards = [] } = block.data || {};

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full max-w-5xl mx-auto py-8 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-orange-400/50 hover:ring-inset rounded-xl'
            }`}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-warm-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-warm-100 dark:border-slate-800 bg-warm-50 dark:bg-slate-800/70 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-lg"><Layers size={20}/></div>
                    <h3 className="font-bold text-warm-900 dark:text-slate-100 text-lg">Flashcards Interativos</h3>
                </div>
                
                <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isEditing ? 'pointer-events-none' : ''}`}>
                    {cards.length === 0 ? (
                        <p className="text-warm-500 dark:text-slate-400 text-center italic col-span-full">Adicione cartões através do painel lateral ou gere com o Agente IA.</p>
                    ) : (
                        cards.map((c: any, i: number) => (
                            <Flashcard key={i} front={c.front} back={c.back} />
                        ))
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow z-20">
                    Flashcards
                </div>
            )}
        </div>
    );
};

const Flashcard: React.FC<{ front: string, back: string }> = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div 
            onClick={() => setFlipped(!flipped)}
            className="relative h-48 w-full perspective-1000 cursor-pointer group"
        >
            <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow">
                    <p className="font-bold text-warm-900 dark:text-slate-100 text-lg mb-2">{front || 'Frente (Termo)'}</p>
                    <span className="text-xs text-warm-400 dark:text-slate-400 uppercase tracking-wider font-bold">Clique para virar</span>
                </div>
                
                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-md">
                    <p className="text-orange-900 dark:text-orange-200 font-medium">{back || 'Verso (Definição)'}</p>
                </div>
            </div>
        </div>
    );
};

export default FlashcardBlock;
