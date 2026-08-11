import React, { useState, useCallback, useRef } from 'react';
import type { CanvasElement, TextElement, ImageElement, ShapeElement } from './types';
import { CanvasBoard } from './CanvasBoard';
import { FloatingDock } from './FloatingDock';
import { FloatingContextMenu } from './FloatingContextMenu';

interface CanvasWorkspaceProps {
    elements: CanvasElement[];
    setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ elements, setElements }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleAddElement = useCallback((type: 'text' | 'image' | 'shape') => {
        const id = crypto.randomUUID();
        const zIndex = elements.length + 1;
        
        // Colocar no centro da tela
        const x = window.innerWidth / 2 - 150;
        const y = 200 + (elements.length * 20); 

        let newElement: CanvasElement;

        if (type === 'text') {
            newElement = {
                id, type, x, y, width: 300, height: 'auto', zIndex, rotation: 0,
                content: 'Novo Texto', fontFamily: 'Inter, sans-serif', fontSize: 24,
                color: '#000000', textAlign: 'left', fontWeight: 'normal',
                fontStyle: 'normal', textDecoration: 'none'
            } as TextElement;
        } else if (type === 'image') {
            newElement = {
                id, type, x, y, width: 200, height: 200, zIndex, rotation: 0,
                src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
                borderRadius: 0
            } as ImageElement;
        } else {
            newElement = {
                id, type, x, y, width: 150, height: 150, zIndex, rotation: 0,
                shapeType: 'rectangle', backgroundColor: '#e5e7eb', borderRadius: 0
            } as ShapeElement;
        }

        setElements(prev => [...prev, newElement]);
        setSelectedId(id);
    }, [elements, setElements]);

    const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el));
    }, [setElements]);

    const handleDeleteElement = useCallback((id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    }, [selectedId, setElements]);

    const handleBringToFront = useCallback((id: string) => {
        setElements(prev => {
            const maxZ = Math.max(...prev.map(el => el.zIndex), 0);
            return prev.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el);
        });
    }, [setElements]);

    const handleSendToBack = useCallback((id: string) => {
        setElements(prev => {
            const minZ = Math.min(...prev.map(el => el.zIndex), 1);
            return prev.map(el => el.id === id ? { ...el, zIndex: minZ - 1 } : el);
        });
    }, [setElements]);

    return (
        <div className="flex flex-1 overflow-hidden bg-[#eef2f6] relative">
            {/* Dock Flutuante à Esquerda */}
            <FloatingDock onAdd={handleAddElement} />

            {/* Menu de Contexto Flutuante */}
            <FloatingContextMenu 
                element={elements.find(e => e.id === selectedId) || null}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
                onBringToFront={() => selectedId && handleBringToFront(selectedId)}
                onSendToBack={() => selectedId && handleSendToBack(selectedId)}
            />

            {/* Canvas Area (100% largura) */}
            <div 
                className="flex-1 overflow-auto relative flex justify-center py-10 custom-scrollbar"
                onPointerDown={() => setSelectedId(null)}
            >
                <CanvasBoard 
                    elements={elements}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onUpdate={handleUpdateElement}
                    canvasRef={canvasRef}
                />
            </div>
        </div>
    );
};
