import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { TextElement, CanvasElement } from '../types';

interface Props {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const TextBlock: React.FC<Props> = ({ element, isSelected, onSelect, onUpdate }) => {
    const textEl = element as TextElement;
    const [isEditing, setIsEditing] = useState(false);
    const contentEditableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isSelected && isEditing) {
            setIsEditing(false);
            if (contentEditableRef.current) {
                onUpdate({ content: contentEditableRef.current.innerHTML });
            }
        }
    }, [isSelected, isEditing, onUpdate]);

    useEffect(() => {
        if (isEditing && contentEditableRef.current) {
            contentEditableRef.current.focus();
            // Move cursor to end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(contentEditableRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    return (
        <Rnd
            size={{ width: textEl.width, height: textEl.height }}
            position={{ x: textEl.x, y: textEl.y }}
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
            disableDragging={isEditing}
            enableResizing={!isEditing}
            style={{ zIndex: textEl.zIndex, transform: `rotate(${textEl.rotation || 0}deg)` }}
            bounds="parent"
            className={isSelected && !isEditing ? 'ring-2 ring-blue-500' : ''}
        >
            <div 
                ref={contentEditableRef}
                className="w-full h-full min-h-[40px] outline-none"
                style={{
                    fontFamily: textEl.fontFamily,
                    fontSize: `${textEl.fontSize}px`,
                    color: textEl.color,
                    textAlign: textEl.textAlign,
                    fontWeight: textEl.fontWeight,
                    fontStyle: textEl.fontStyle,
                    textDecoration: textEl.textDecoration,
                    cursor: isEditing ? 'text' : 'move',
                    userSelect: isEditing ? 'auto' : 'none'
                }}
                onDoubleClick={handleDoubleClick}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                    onUpdate({ content: e.currentTarget.innerHTML });
                }}
                dangerouslySetInnerHTML={{ __html: textEl.content }}
            />
        </Rnd>
    );
};
