import React from 'react';
import type { CanvasElement, TextElement, ImageElement, ShapeElement } from './types';
import { 
    Trash2, BringToFront, SendToBack, RotateCw, 
    Bold, Italic, Square, Circle, Triangle, Minus, Star,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, UploadCloud
} from 'lucide-react';

interface FloatingContextMenuProps {
    element: CanvasElement | null;
    onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
    onDelete: (id: string) => void;
    onBringToFront: () => void;
    onSendToBack: () => void;
}

export const FloatingContextMenu: React.FC<FloatingContextMenuProps> = ({
    element, onUpdate, onDelete, onBringToFront, onSendToBack
}) => {
    if (!element) return null;

    // Calculando a posição. Tentar colocar acima do elemento.
    let top = (typeof element.y === 'number' ? element.y : parseFloat(element.y as string)) - 60;
    if (top < 10) top = 10; // clamp ao topo do canvas
    
    let left = (typeof element.x === 'number' ? element.x : parseFloat(element.x as string));
    if (left < 10) left = 10; // clamp à esquerda
    // Teria que fazer clamp à direita também usando window width, mas deixaremos simples para este caso.

    const renderTextControls = () => {
        if (element.type !== 'text') return null;
        const textEl = element as TextElement;
        return (
            <>
                <div className="flex items-center gap-1 bg-warm-100/50 p-1 rounded-lg">
                    <input 
                        type="color" 
                        value={textEl.color}
                        onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 border-0"
                    />
                </div>
                <div className="w-px h-5 bg-warm-200 mx-1"></div>
                <input 
                    type="number" 
                    value={textEl.fontSize}
                    onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
                    className="w-14 h-8 bg-warm-100/50 border border-warm-200 rounded-lg text-sm text-center font-medium"
                />
                <div className="w-px h-5 bg-warm-200 mx-1"></div>
                <button onClick={() => onUpdate(element.id, { fontWeight: textEl.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1.5 rounded-md ${textEl.fontWeight === 'bold' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}>
                    <Bold size={16} />
                </button>
                <button onClick={() => onUpdate(element.id, { fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-1.5 rounded-md ${textEl.fontStyle === 'italic' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}>
                    <Italic size={16} />
                </button>
                <div className="w-px h-5 bg-warm-200 mx-1"></div>
                <div className="flex gap-0.5">
                    <button onClick={() => onUpdate(element.id, { textAlign: 'left' })} className={`p-1.5 rounded-md ${textEl.textAlign === 'left' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}><AlignLeft size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { textAlign: 'center' })} className={`p-1.5 rounded-md ${textEl.textAlign === 'center' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}><AlignCenter size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { textAlign: 'right' })} className={`p-1.5 rounded-md ${textEl.textAlign === 'right' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}><AlignRight size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { textAlign: 'justify' })} className={`p-1.5 rounded-md ${textEl.textAlign === 'justify' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`}><AlignJustify size={16}/></button>
                </div>
            </>
        );
    };

    const renderShapeControls = () => {
        if (element.type !== 'shape') return null;
        const shapeEl = element as ShapeElement;
        
        return (
            <>
                <div className="flex items-center gap-1 bg-warm-100/50 p-1 rounded-lg">
                    <input 
                        type="color" 
                        value={shapeEl.backgroundColor}
                        onChange={(e) => onUpdate(element.id, { backgroundColor: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer p-0 border-0"
                    />
                </div>
                <div className="w-px h-5 bg-warm-200 mx-1"></div>
                <div className="flex gap-1">
                    <button onClick={() => onUpdate(element.id, { shapeType: 'rectangle' })} className={`p-1.5 rounded-md ${shapeEl.shapeType === 'rectangle' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`} title="Retângulo"><Square size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { shapeType: 'circle' })} className={`p-1.5 rounded-md ${shapeEl.shapeType === 'circle' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`} title="Círculo"><Circle size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { shapeType: 'triangle' })} className={`p-1.5 rounded-md ${shapeEl.shapeType === 'triangle' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`} title="Triângulo"><Triangle size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { shapeType: 'star' })} className={`p-1.5 rounded-md ${shapeEl.shapeType === 'star' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`} title="Estrela"><Star size={16}/></button>
                    <button onClick={() => onUpdate(element.id, { shapeType: 'line' })} className={`p-1.5 rounded-md ${shapeEl.shapeType === 'line' ? 'bg-primary/20 text-primary' : 'hover:bg-warm-100'}`} title="Linha"><Minus size={16}/></button>
                </div>
            </>
        );
    };

    const renderImageControls = () => {
        if (element.type !== 'image') return null;
        const imgEl = element as ImageElement;

        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                // Adjust to the actual backend URL pattern as implemented in the system
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    onUpdate(element.id, { src: data.url });
                } else {
                    console.error('Falha no upload da imagem');
                }
            } catch (error) {
                console.error('Erro de upload:', error);
            }
        };

        return (
            <>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-warm-500">Imagem</span>
                    <input 
                        type="text" 
                        value={imgEl.src}
                        onChange={(e) => onUpdate(element.id, { src: e.target.value })}
                        className="w-32 h-8 px-2 text-xs bg-warm-100/50 border border-warm-200 rounded-lg"
                        placeholder="URL..."
                    />
                    <label className="flex items-center justify-center p-1.5 text-warm-600 hover:text-primary hover:bg-warm-100 rounded-md cursor-pointer transition-colors">
                        <UploadCloud size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
            </>
        );
    };

    return (
        <div 
            className="absolute z-[100] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-warm-200 transition-all duration-200 animate-fade-in"
            style={{ top: `${top}px`, left: `${left}px` }}
        >
            <div className="flex items-center gap-1">
                {renderTextControls()}
                {renderShapeControls()}
                {renderImageControls()}
            </div>

            <div className="w-px h-6 bg-warm-200 mx-2"></div>

            {/* Ações comuns */}
            <div className="flex items-center gap-1">
                <button onClick={onBringToFront} title="Trazer para Frente" className="p-1.5 text-warm-600 hover:text-primary hover:bg-warm-100 rounded-md">
                    <BringToFront size={16} />
                </button>
                <button onClick={onSendToBack} title="Enviar para Trás" className="p-1.5 text-warm-600 hover:text-primary hover:bg-warm-100 rounded-md">
                    <SendToBack size={16} />
                </button>
                
                <div className="w-px h-4 bg-warm-200 mx-1"></div>

                <div className="flex items-center bg-warm-100/50 rounded-lg px-2 py-0.5 border border-warm-200">
                    <RotateCw size={12} className="text-warm-400 mr-1" />
                    <input 
                        type="number" 
                        value={element.rotation || 0}
                        onChange={(e) => onUpdate(element.id, { rotation: Number(e.target.value) })}
                        className="w-12 h-6 bg-transparent text-xs font-medium text-center focus:outline-none"
                    />
                </div>
                
                <div className="w-px h-4 bg-warm-200 mx-1"></div>

                <button onClick={() => onDelete(element.id)} title="Excluir" className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
