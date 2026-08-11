import React, { useRef, useState, useEffect } from 'react';
import type { HtmlElement, CanvasElement } from '../types';
import { FloatingContextMenu } from '../FloatingContextMenu';

interface HtmlBlockProps {
    element: HtmlElement;
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
    isSelected: boolean;
}

export const HtmlBlock: React.FC<HtmlBlockProps> = ({ element, onUpdate, isSelected: _isSelected }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeNode, setActiveNode] = useState<HTMLElement | null>(null);
    const [virtualElement, setVirtualElement] = useState<CanvasElement | null>(null);

    // Save changes back to the main element
    const saveHtml = React.useCallback(() => {
        if (containerRef.current) {
            // Remove active outlines before saving
            const activeEls = containerRef.current.querySelectorAll('.cms-active-node');
            activeEls.forEach(el => el.classList.remove('cms-active-node'));
            
            // Remove contentEditable
            const editables = containerRef.current.querySelectorAll('[contenteditable]');
            editables.forEach(el => el.removeAttribute('contenteditable'));

            onUpdate(element.id, { content: containerRef.current.innerHTML });
        }
    }, [element.id, onUpdate]);

    // When clicking inside the HTML
    const handleHtmlClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        
        // Don't select the container itself
        if (target === containerRef.current) {
            setActiveNode(null);
            setVirtualElement(null);
            return;
        }

        // Clear previous active
        if (activeNode) {
            activeNode.classList.remove('cms-active-node');
            activeNode.removeAttribute('contenteditable');
        }

        setActiveNode(target);
        target.classList.add('cms-active-node');

        const rect = target.getBoundingClientRect();
        // Determine type based on tag
        const isImage = target.tagName.toLowerCase() === 'img';
        
        if (isImage) {
            setVirtualElement({
                id: 'virtual-node',
                type: 'image',
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                zIndex: 999,
                rotation: 0,
                src: (target as HTMLImageElement).src,
                borderRadius: 0
            });
        } else {
            // Text node
            const compStyles = window.getComputedStyle(target);
            setVirtualElement({
                id: 'virtual-node',
                type: 'text',
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                zIndex: 999,
                rotation: 0,
                content: target.innerHTML,
                fontFamily: compStyles.fontFamily,
                fontSize: parseInt(compStyles.fontSize),
                color: compStyles.color,
                textAlign: compStyles.textAlign as any,
                fontWeight: compStyles.fontWeight === '700' || compStyles.fontWeight === 'bold' ? 'bold' : 'normal',
                fontStyle: compStyles.fontStyle as any,
                textDecoration: compStyles.textDecoration as any
            });
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeNode && activeNode.tagName.toLowerCase() !== 'img') {
            activeNode.setAttribute('contenteditable', 'true');
            activeNode.focus();
        }
    };

    // Handle updates from FloatingContextMenu
    const handleVirtualUpdate = (_id: string, updates: Partial<CanvasElement>) => {
        if (!activeNode || !virtualElement) return;

        if (virtualElement.type === 'text') {
            const textUpdates = updates as Partial<import('../types').TextElement>;
            if (textUpdates.color) activeNode.style.color = textUpdates.color;
            if (textUpdates.fontSize) activeNode.style.fontSize = `${textUpdates.fontSize}px`;
            if (textUpdates.textAlign) activeNode.style.textAlign = textUpdates.textAlign;
            if (textUpdates.fontWeight) activeNode.style.fontWeight = textUpdates.fontWeight;
            if (textUpdates.fontStyle) activeNode.style.fontStyle = textUpdates.fontStyle;
        } else if (virtualElement.type === 'image') {
            const imgUpdates = updates as Partial<import('../types').ImageElement>;
            if (imgUpdates.src) (activeNode as HTMLImageElement).src = imgUpdates.src;
        }

        // Update virtual element state to reflect in menu
        setVirtualElement(prev => prev ? { ...prev, ...updates } as CanvasElement : null);
        
        // Save to parent
        saveHtml();
    };

    // Auto-save on blur if contentEditable
    useEffect(() => {
        const handleInput = () => {
            saveHtml();
        };

        if (activeNode && activeNode.hasAttribute('contenteditable')) {
            activeNode.addEventListener('blur', handleInput);
            return () => {
                activeNode.removeEventListener('blur', handleInput);
            };
        }
    }, [activeNode, saveHtml]);

    return (
        <>
            <style>{`
                .cms-active-node {
                    outline: 2px dashed #8b5cf6 !important;
                    outline-offset: 2px !important;
                    cursor: pointer;
                }
                .cms-active-node[contenteditable="true"] {
                    outline: 2px solid #8b5cf6 !important;
                    cursor: text;
                }
            `}</style>
            
            <div 
                ref={containerRef}
                className="w-full relative"
                onClick={handleHtmlClick}
                onDoubleClick={handleDoubleClick}
                dangerouslySetInnerHTML={{ __html: element.content }}
            />

            {activeNode && virtualElement && (
                <FloatingContextMenu 
                    element={virtualElement}
                    onUpdate={handleVirtualUpdate}
                    onDelete={() => {
                        activeNode.remove();
                        setActiveNode(null);
                        setVirtualElement(null);
                        saveHtml();
                    }}
                    onBringToFront={() => {}}
                    onSendToBack={() => {}}
                />
            )}
        </>
    );
};
