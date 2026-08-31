import React from 'react';
import type { BlockProps } from './types';

const SpacerBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onSelect }) => {
    const { height = 60 } = block.styles || {};

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            className={`relative w-full transition-all duration-200 rounded-xl group ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected
                    ? 'ring-4 ring-primary ring-inset z-10'
                    : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset'
            }`}
            style={{ height: `${height}px` }}
        >
            {/* Only visible when editing */}
            {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-full border-t-2 border-dashed transition-colors ${
                        isSelected ? 'border-primary/40' : 'border-warm-300/50 dark:border-slate-700 group-hover:border-warm-400/50 dark:group-hover:border-slate-500'
                    }`} />
                    <span className={`absolute bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isSelected ? 'text-primary dark:text-teal-400 border border-primary/30' : 'text-warm-400 dark:text-slate-300 border border-warm-200 dark:border-slate-700 group-hover:text-warm-600 dark:group-hover:text-slate-100'
                    }`}>
                        {height}px
                    </span>
                </div>
            )}

            {isSelected && (
                <div className="absolute top-3 right-3 bg-warm-500 text-white text-xs px-2 py-1 rounded-md font-bold shadow">
                    Espaçador
                </div>
            )}
        </div>
    );
};

export default SpacerBlock;
