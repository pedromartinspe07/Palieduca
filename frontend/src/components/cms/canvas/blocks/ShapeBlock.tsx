import React from 'react';
import { Rnd } from 'react-rnd';
import type { ShapeElement, CanvasElement } from '../types';

interface Props {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const ShapeBlock: React.FC<Props> = ({ element, isSelected, onSelect, onUpdate }) => {
    const shapeEl = element as ShapeElement;

    const renderShapeSVG = () => {
        const fill = shapeEl.backgroundColor;
        switch (shapeEl.shapeType) {
            case 'circle':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="50" cy="50" r="50" fill={fill} />
                    </svg>
                );
            case 'triangle':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,0 100,100 0,100" fill={fill} />
                    </svg>
                );
            case 'star':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,2.5 61.8,38.7 100,38.7 69.1,61.1 80.9,97.5 50,75.1 19.1,97.5 30.9,61.1 0,38.7 38.2,38.7" fill={fill} />
                    </svg>
                );
            case 'line':
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="50" x2="100" y2="50" stroke={fill} strokeWidth="10" />
                    </svg>
                );
            case 'rectangle':
            default:
                return (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <rect width="100" height="100" rx={shapeEl.borderRadius || 0} fill={fill} />
                    </svg>
                );
        }
    };

    return (
        <Rnd
            size={{ width: shapeEl.width, height: shapeEl.height }}
            position={{ x: shapeEl.x, y: shapeEl.y }}
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
            style={{ zIndex: shapeEl.zIndex, transform: `rotate(${shapeEl.rotation || 0}deg)` }}
            bounds="parent"
            className={isSelected ? 'ring-2 ring-blue-500' : ''}
        >
            <div className="w-full h-full pointer-events-none">
                {renderShapeSVG()}
            </div>
        </Rnd>
    );
};
