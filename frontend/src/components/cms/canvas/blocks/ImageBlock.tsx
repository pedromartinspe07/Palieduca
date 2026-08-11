import React from 'react';
import { Rnd } from 'react-rnd';
import type { ImageElement, CanvasElement } from '../types';

interface Props {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const ImageBlock: React.FC<Props> = ({ element, isSelected, onSelect, onUpdate }) => {
    const imgEl = element as ImageElement;

    return (
        <Rnd
            size={{ width: imgEl.width, height: imgEl.height }}
            position={{ x: imgEl.x, y: imgEl.y }}
            onDragStop={(_e, d) => onUpdate({ x: d.x, y: d.y })}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                onUpdate({
                    width: ref.style.width,
                    height: ref.style.height,
                    ...position,
                });
            }}
            onPointerDown={(e: React.PointerEvent) => {
                e.stopPropagation();
                onSelect();
            }}
            style={{ zIndex: imgEl.zIndex, transform: `rotate(${imgEl.rotation || 0}deg)` }}
            bounds="parent"
            className={isSelected ? 'ring-2 ring-blue-500' : ''}
        >
            <div className="w-full h-full relative group">
                <img 
                    src={imgEl.src} 
                    alt="Canvas content"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: `${imgEl.borderRadius}px`,
                        pointerEvents: 'none' // Evitar que o browser tente arrastar a imagem nativamente
                    }}
                />
            </div>
        </Rnd>
    );
};
