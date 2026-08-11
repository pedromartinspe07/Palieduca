import React from 'react';
import type { CanvasElement, TextElement, ImageElement, ShapeElement } from './types';

interface CanvasRendererProps {
    elements: CanvasElement[];
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({ elements }) => {
    return (
        <div className="relative w-full overflow-hidden min-h-[1056px] max-w-[800px] mx-auto bg-white rounded-xl shadow-md border border-gray-100">
            {elements.map((el) => {
                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: typeof el.x === 'number' ? `${el.x}px` : el.x,
                    top: typeof el.y === 'number' ? `${el.y}px` : el.y,
                    width: typeof el.width === 'number' ? `${el.width}px` : el.width,
                    height: typeof el.height === 'number' ? `${el.height}px` : el.height,
                    zIndex: el.zIndex,
                    transform: `rotate(${el.rotation || 0}deg)`,
                };

                if (el.type === 'text') {
                    const textEl = el as TextElement;
                    return (
                        <div key={el.id} style={{
                            ...style,
                            fontFamily: textEl.fontFamily,
                            fontSize: `${textEl.fontSize}px`,
                            color: textEl.color,
                            textAlign: textEl.textAlign,
                            fontWeight: textEl.fontWeight,
                            fontStyle: textEl.fontStyle,
                            textDecoration: textEl.textDecoration,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                        }} dangerouslySetInnerHTML={{ __html: textEl.content }} />
                    );
                } else if (el.type === 'image') {
                    const imgEl = el as ImageElement;
                    return (
                        <div key={el.id} style={{ ...style, overflow: 'hidden', borderRadius: `${imgEl.borderRadius || 0}px` }}>
                            <img src={imgEl.src} alt="Element" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    );
                } else if (el.type === 'shape') {
                    const shapeEl = el as ShapeElement;
                    const fill = shapeEl.backgroundColor;
                    
                    let svgContent = null;
                    switch (shapeEl.shapeType) {
                        case 'circle':
                            svgContent = <circle cx="50" cy="50" r="50" fill={fill} />;
                            break;
                        case 'triangle':
                            svgContent = <polygon points="50,0 100,100 0,100" fill={fill} />;
                            break;
                        case 'star':
                            svgContent = <polygon points="50,2.5 61.8,38.7 100,38.7 69.1,61.1 80.9,97.5 50,75.1 19.1,97.5 30.9,61.1 0,38.7 38.2,38.7" fill={fill} />;
                            break;
                        case 'line':
                            svgContent = <line x1="0" y1="50" x2="100" y2="50" stroke={fill} strokeWidth="10" />;
                            break;
                        case 'rectangle':
                        default:
                            svgContent = <rect width="100" height="100" rx={shapeEl.borderRadius || 0} fill={fill} />;
                            break;
                    }

                    return (
                        <div key={el.id} style={{ ...style, pointerEvents: 'none' }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {svgContent}
                            </svg>
                        </div>
                    );
                } else if (el.type === 'html') {
                    // Html blocks don't necessarily need absolute positioning if they are the only element,
                    // but since they are in a canvas, we allow them to fill width.
                    const htmlStyle: React.CSSProperties = {
                        position: 'relative',
                        width: '100%',
                        zIndex: el.zIndex,
                    };
                    return (
                        <div key={el.id} style={htmlStyle} dangerouslySetInnerHTML={{ __html: (el as any).content }} />
                    );
                }

                return null;
            })}
        </div>
    );
};
