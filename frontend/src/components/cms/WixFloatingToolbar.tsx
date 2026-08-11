import React, { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Palette, Square, Circle, Image as ImageIcon, Type, Link2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

export const WixFloatingToolbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Monitora seleção de texto
    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                // Não esconder imediatamente se o foco estiver no toolbar
                setTimeout(() => {
                    if (!document.activeElement?.closest('#wix-toolbar')) {
                        setIsVisible(false);
                    }
                }, 100);
                return;
            }

            const range = selection.getRangeAt(0);
            
            // Verifica se está dentro de um contentEditable
            const container = range.commonAncestorContainer.nodeType === 3 
                ? range.commonAncestorContainer.parentElement 
                : (range.commonAncestorContainer as HTMLElement);
            
            const isEditable = container?.closest('[contenteditable="true"]');
            
            if (isEditable) {
                const rect = range.getBoundingClientRect();
                
                // Posiciona acima do texto selecionado
                setPosition({
                    top: rect.top + window.scrollY - 50, // 50px acima
                    left: rect.left + window.scrollX + (rect.width / 2) - 150 // centralizado (aprox)
                });
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
    };

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file); // Como o usuário pediu

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                execCommand('insertImage', data.url);
            } else {
                alert('Falha ao enviar imagem.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão ao enviar imagem.');
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const insertShape = (type: 'circle' | 'rectangle') => {
        const id = crypto.randomUUID();
        const svg = type === 'circle' 
            ? `<svg id="${id}" width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; margin:4px;"><circle cx="50" cy="50" r="45" fill="#facc15" stroke="#ca8a04" stroke-width="2" /></svg>`
            : `<svg id="${id}" width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; margin:4px;"><rect x="10" y="10" width="80" height="80" rx="8" fill="#60a5fa" stroke="#2563eb" stroke-width="2" /></svg>`;
        
        execCommand('insertHTML', `&nbsp;${svg}&nbsp;`);
    };

    const insertLink = () => {
        const url = prompt('Digite a URL (ex: https://youtube.com/...):', 'https://');
        if (url) {
            execCommand('createLink', url);
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            id="wix-toolbar"
            ref={toolbarRef}
            className="absolute z-[100] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-warm-200 transition-all duration-200 animate-fade-in"
            style={{ 
                top: `${Math.max(10, position.top)}px`, 
                left: `${Math.max(10, position.left)}px` 
            }}
            onMouseDown={(e) => e.preventDefault()} // Impede perda de seleção no clique
        >
            <div className="flex items-center gap-1">
                {/* Formatação Básica */}
                <button onClick={() => execCommand('bold')} className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Negrito">
                    <Bold size={16} />
                </button>
                <button onClick={() => execCommand('italic')} className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Itálico">
                    <Italic size={16} />
                </button>

                <div className="w-px h-5 bg-warm-200 mx-1"></div>

                {/* Cores */}
                <div className="relative group">
                    <button className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md flex items-center gap-1 transition-colors" title="Cor do Texto">
                        <Type size={16} />
                        <Palette size={12} className="opacity-50" />
                    </button>
                    <input 
                        type="color" 
                        onChange={(e) => execCommand('foreColor', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        title="Escolher Cor do Texto"
                    />
                </div>
                
                <div className="relative group">
                    <button className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md flex items-center gap-1 transition-colors" title="Cor de Fundo">
                        <div className="w-4 h-4 bg-yellow-200 rounded-[3px] border border-warm-300 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-warm-600">A</span>
                        </div>
                    </button>
                    <input 
                        type="color" 
                        onChange={(e) => execCommand('hiliteColor', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        title="Escolher Cor de Fundo"
                    />
                </div>

                <div className="w-px h-5 bg-warm-200 mx-1"></div>

                {/* Mídia */}
                <label className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer flex items-center justify-center" title="Upload Imagem (PC)">
                    <ImageIcon size={16} />
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUploadImage} />
                </label>
                <button onClick={insertLink} className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Inserir Link ou Vídeo">
                    <Link2 size={16} />
                </button>

                <div className="w-px h-5 bg-warm-200 mx-1"></div>

                {/* Shapes */}
                <button onClick={() => insertShape('circle')} className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Inserir Círculo">
                    <Circle size={16} />
                </button>
                <button onClick={() => insertShape('rectangle')} className="p-1.5 text-warm-700 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Inserir Retângulo">
                    <Square size={16} />
                </button>
            </div>
        </div>
    );
};
