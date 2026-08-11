import React from 'react';
import type { CanvasElement } from './types';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ShapeBlock } from './blocks/ShapeBlock';
import { HtmlBlock } from './blocks/HtmlBlock';
import type { HtmlElement } from './types';

interface CanvasBoardProps {
    elements: CanvasElement[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
    canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasBoard: React.FC<CanvasBoardProps> = ({ elements, selectedId, onSelect, onUpdate, canvasRef }) => {
    return (
        <div 
            ref={canvasRef}
            className="w-[1000px] min-h-[1200px] bg-white shadow-md relative"
            style={{ border: '1px solid #ddd' }}
        >
            {elements.map((el) => {
                const isSelected = selectedId === el.id;

                const commonProps = {
                    element: el,
                    isSelected,
                    onSelect: () => onSelect(el.id),
                    onUpdate: (updates: Partial<CanvasElement>) => onUpdate(el.id, updates)
                };

                switch (el.type) {
                    case 'text':
                        return <TextBlock key={el.id} {...commonProps} />;
                    case 'image':
                        return <ImageBlock key={el.id} {...commonProps} />;
                    case 'shape':
                        return <ShapeBlock key={el.id} {...commonProps} />;
                    case 'html':
                        return <HtmlBlock key={el.id} element={el as HtmlElement} isSelected={isSelected} onUpdate={(id, updates) => onUpdate(id, updates)} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
};
