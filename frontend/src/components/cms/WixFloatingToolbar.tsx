import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Bold, Italic, Underline, Strikethrough, 
    Link2, RemoveFormatting,
    Heading1, Heading2, Heading3, List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ChevronDown, Pipette
} from 'lucide-react';

const TEXT_COLORS = [
    { label: 'Preto', color: '#111827' },
    { label: 'Cinza', color: '#4b5563' },
    { label: 'Verde Pali', color: '#059669' },
    { label: 'Azul', color: '#2563eb' },
    { label: 'Roxo', color: '#7c3aed' },
    { label: 'Vermelho', color: '#dc2626' },
    { label: 'Laranja', color: '#d97706' },
    { label: 'Rosa', color: '#db2777' },
    { label: 'Branco', color: '#ffffff' },
];

const HIGHLIGHT_COLORS = [
    { label: 'Nenhum', color: 'transparent' },
    { label: 'Amarelo', color: '#fef08a' },
    { label: 'Verde', color: '#bbf7d0' },
    { label: 'Azul', color: '#bae6fd' },
    { label: 'Rosa', color: '#fbcfe8' },
    { label: 'Laranja', color: '#fed7aa' },
    { label: 'Lavanda', color: '#e9d5ff' },
];

export const WixFloatingToolbar: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [colorMenu, setColorMenu] = useState<'text' | 'highlight' | null>(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        unorderedList: false,
        orderedList: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
        justifyFull: false
    });
    
    const toolbarRef = useRef<HTMLDivElement>(null);
    const savedRangeRef = useRef<Range | null>(null);

    const updateToolbarPosition = useCallback(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            // Se o menu de cor estiver aberto, não fecha imediatamente para permitir clicar
            if (!colorMenu) {
                setIsVisible(false);
            }
            return;
        }

        const text = selection.toString().trim();
        if (!text) {
            if (!colorMenu) setIsVisible(false);
            return;
        }

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer.nodeType === 3 
            ? range.commonAncestorContainer.parentElement 
            : (range.commonAncestorContainer as HTMLElement);
        
        const isEditable = container?.closest('[contenteditable="true"]');
        
        if (isEditable) {
            // Salva o range para restaurar em operações de cor
            savedRangeRef.current = range.cloneRange();

            const rect = range.getBoundingClientRect();
            
            // Checa formatos ativos
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
                unorderedList: document.queryCommandState('insertUnorderedList'),
                orderedList: document.queryCommandState('insertOrderedList'),
                justifyLeft: document.queryCommandState('justifyLeft'),
                justifyCenter: document.queryCommandState('justifyCenter'),
                justifyRight: document.queryCommandState('justifyRight'),
                justifyFull: document.queryCommandState('justifyFull')
            });

            // Posiciona a barra 54px acima do texto selecionado
            const toolbarWidth = 510;
            let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
            let top = rect.top - 54;

            if (left < 10) left = 10;
            if (left + toolbarWidth > window.innerWidth - 10) left = window.innerWidth - toolbarWidth - 10;
            if (top < 10) top = rect.bottom + 10;

            setPosition({ top, left });
            setIsVisible(true);
        } else {
            if (!colorMenu) setIsVisible(false);
        }
    }, [colorMenu]);

    useEffect(() => {
        const handleSelectionChange = () => {
            setTimeout(updateToolbarPosition, 20);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.getSelection()?.removeAllRanges();
                setIsVisible(false);
                setColorMenu(null);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', updateToolbarPosition);
        window.addEventListener('scroll', updateToolbarPosition, true);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', updateToolbarPosition);
            window.removeEventListener('scroll', updateToolbarPosition, true);
        };
    }, [updateToolbarPosition]);

    const restoreSelection = () => {
        if (savedRangeRef.current) {
            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(savedRangeRef.current);
            }
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        restoreSelection();
        document.execCommand(command, false, value);
        
        // Dispara evento input para sincronizar estado React
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
            const container = selection.getRangeAt(0).commonAncestorContainer;
            const editable = (container.nodeType === 3 ? container.parentElement : container as HTMLElement)?.closest('[contenteditable="true"]');
            if (editable) {
                editable.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // Atualiza botões
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull')
        });
    };

    const applyTextColor = (color: string) => {
        restoreSelection();
        document.execCommand('foreColor', false, color);
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
            const container = selection.getRangeAt(0).commonAncestorContainer;
            const editable = (container.nodeType === 3 ? container.parentElement : container as HTMLElement)?.closest('[contenteditable="true"]');
            if (editable) {
                editable.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        setColorMenu(null);
    };

    const applyHighlightColor = (color: string) => {
        restoreSelection();
        if (color === 'transparent') {
            document.execCommand('removeFormat', false, undefined);
        } else {
            document.execCommand('hiliteColor', false, color);
            document.execCommand('backColor', false, color); // Fallback para compatibilidade
        }
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
            const container = selection.getRangeAt(0).commonAncestorContainer;
            const editable = (container.nodeType === 3 ? container.parentElement : container as HTMLElement)?.closest('[contenteditable="true"]');
            if (editable) {
                editable.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
        setColorMenu(null);
    };

    const handleRemoveFormat = () => {
        restoreSelection();
        if (document.queryCommandState('insertUnorderedList')) {
            document.execCommand('insertUnorderedList', false, undefined);
        }
        if (document.queryCommandState('insertOrderedList')) {
            document.execCommand('insertOrderedList', false, undefined);
        }
        document.execCommand('removeFormat', false, undefined);
        document.execCommand('formatBlock', false, '<p>');
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            savedRangeRef.current = selection.getRangeAt(0).cloneRange();
            const container = selection.getRangeAt(0).commonAncestorContainer;
            const editable = (container.nodeType === 3 ? container.parentElement : container as HTMLElement)?.closest('[contenteditable="true"]');
            if (editable) {
                editable.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        setActiveFormats({
            bold: false,
            italic: false,
            underline: false,
            strikeThrough: false,
            unorderedList: false,
            orderedList: false,
            justifyLeft: false,
            justifyCenter: false,
            justifyRight: false,
            justifyFull: false
        });
        setColorMenu(null);
    };

    const insertLink = () => {
        restoreSelection();
        const currentUrl = document.queryCommandValue('createLink') || '';
        const url = prompt('Digite o endereço do link (ex: https://...):', typeof currentUrl === 'string' ? currentUrl : 'https://');
        if (url) {
            execCommand('createLink', url);
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            id="wix-floating-toolbar"
            ref={toolbarRef}
            className="fixed z-[99999] flex flex-col items-center bg-warm-900/95 text-white backdrop-blur-md px-2.5 py-1.5 rounded-2xl shadow-2xl border border-white/20 transition-all duration-150 animate-scale-in"
            style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px` 
            }}
            onMouseDown={(e) => e.preventDefault()} // Impede que o clique limpe a seleção de texto!
        >
            <div className="flex items-center gap-1">
                {/* Formatações Básicas */}
                <button 
                    onClick={() => execCommand('bold')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.bold ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Negrito (Ctrl+B)"
                >
                    <Bold size={15} />
                </button>

                <button 
                    onClick={() => execCommand('italic')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.italic ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Itálico (Ctrl+I)"
                >
                    <Italic size={15} />
                </button>

                <button 
                    onClick={() => execCommand('underline')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.underline ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Sublinhado (Ctrl+U)"
                >
                    <Underline size={15} />
                </button>

                <button 
                    onClick={() => execCommand('strikeThrough')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.strikeThrough ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Riscado"
                >
                    <Strikethrough size={15} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Alinhamento do Trecho / Parágrafo Selecionado */}
                <button 
                    onClick={() => execCommand('justifyLeft')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.justifyLeft ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Alinhar à Esquerda"
                >
                    <AlignLeft size={15} />
                </button>
                <button 
                    onClick={() => execCommand('justifyCenter')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.justifyCenter ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Centralizar apenas este parágrafo"
                >
                    <AlignCenter size={15} />
                </button>
                <button 
                    onClick={() => execCommand('justifyRight')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.justifyRight ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Alinhar à Direita"
                >
                    <AlignRight size={15} />
                </button>
                <button 
                    onClick={() => execCommand('justifyFull')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.justifyFull ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title="Justificar"
                >
                    <AlignJustify size={15} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Formatos de Título */}
                <button 
                    onClick={() => execCommand('formatBlock', '<h1>')} 
                    className="px-1.5 py-1 text-[11px] font-bold text-warm-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                    title="Título H1"
                >
                    <Heading1 size={15} />
                </button>
                <button 
                    onClick={() => execCommand('formatBlock', '<h2>')} 
                    className="px-1.5 py-1 text-[11px] font-bold text-warm-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                    title="Título H2"
                >
                    <Heading2 size={15} />
                </button>
                <button 
                    onClick={() => execCommand('formatBlock', '<h3>')} 
                    className="px-1.5 py-1 text-[11px] font-bold text-warm-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors" 
                    title="Título H3"
                >
                    <Heading3 size={15} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Listas & Citação */}
                <button 
                    onClick={() => execCommand('insertUnorderedList')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.unorderedList ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title={activeFormats.unorderedList ? "Remover Marcadores" : "Lista com Marcadores (Bolinhas)"}
                >
                    <List size={15} />
                </button>
                <button 
                    onClick={() => execCommand('insertOrderedList')} 
                    className={`p-1.5 rounded-xl transition-all ${
                        activeFormats.orderedList ? 'bg-primary text-white font-bold shadow-md' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`} 
                    title={activeFormats.orderedList ? "Remover Numeração" : "Lista Numerada (1, 2, 3)"}
                >
                    <ListOrdered size={15} />
                </button>
                <button 
                    onClick={() => execCommand('formatBlock', '<blockquote>')} 
                    className="p-1.5 text-warm-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors" 
                    title="Bloco de Citação"
                >
                    <Quote size={15} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-0.5" />

                {/* Seletor de Cor do Texto (Menu Flutuante) */}
                <button 
                    onClick={() => setColorMenu(colorMenu === 'text' ? null : 'text')} 
                    className={`p-1.5 rounded-xl flex items-center gap-0.5 transition-all ${
                        colorMenu === 'text' ? 'bg-white/20 text-white shadow-inner' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`}
                    title="Cor da Fonte Selecionada"
                >
                    <span className="text-xs font-black px-0.5 underline decoration-primary decoration-2">A</span>
                    <ChevronDown size={11} className="opacity-70" />
                </button>

                {/* Seletor de Marca-Texto (Menu Flutuante) */}
                <button 
                    onClick={() => setColorMenu(colorMenu === 'highlight' ? null : 'highlight')} 
                    className={`p-1.5 rounded-xl flex items-center gap-0.5 transition-all ${
                        colorMenu === 'highlight' ? 'bg-white/20 text-white shadow-inner' : 'text-warm-200 hover:text-white hover:bg-white/10'
                    }`}
                    title="Marca-Texto (Highlight)"
                >
                    <div className="w-3.5 h-3.5 bg-yellow-300 rounded-sm border border-black/30 shadow-xs" />
                    <ChevronDown size={11} className="opacity-70" />
                </button>

                {/* Hiperlink */}
                <button 
                    onClick={insertLink} 
                    className="p-1.5 text-warm-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors" 
                    title="Inserir Link no Texto"
                >
                    <Link2 size={15} />
                </button>

                {/* Limpar Formatação */}
                <button 
                    onClick={handleRemoveFormat} 
                    className="p-1.5 text-warm-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" 
                    title="Limpar Formatação e Remover Listas"
                >
                    <RemoveFormatting size={15} />
                </button>
            </div>

            {/* POPUP DE CORES DO TEXTO */}
            {colorMenu === 'text' && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 w-full animate-fade-in">
                    <span className="text-[10px] text-warm-300 font-bold mr-1">Cor:</span>
                    <div className="flex items-center gap-1.5 flex-1">
                        {TEXT_COLORS.map(c => (
                            <button
                                key={c.color}
                                onClick={() => applyTextColor(c.color)}
                                title={c.label}
                                className="w-5 h-5 rounded-full border border-white/40 transition-transform hover:scale-125 shadow-sm"
                                style={{ backgroundColor: c.color }}
                            />
                        ))}
                    </div>
                    {/* Seletor Customizado com Input Color */}
                    <label className="relative p-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-0.5 text-[10px] text-warm-200 font-bold" title="Qualquer Cor (Color Picker)">
                        <Pipette size={12} className="text-primary" />
                        <input
                            type="color"
                            onChange={(e) => applyTextColor(e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                    </label>
                </div>
            )}

            {/* POPUP DE MARCA-TEXTO (HIGHLIGHT) */}
            {colorMenu === 'highlight' && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 w-full animate-fade-in">
                    <span className="text-[10px] text-warm-300 font-bold mr-1">Realce:</span>
                    <div className="flex items-center gap-1.5 flex-1">
                        {HIGHLIGHT_COLORS.map(h => (
                            <button
                                key={h.color}
                                onClick={() => applyHighlightColor(h.color)}
                                title={h.label}
                                className="w-5 h-5 rounded-full border border-white/40 transition-transform hover:scale-125 shadow-sm flex items-center justify-center text-[8px] font-bold text-black"
                                style={{ backgroundColor: h.color === 'transparent' ? '#374151' : h.color }}
                            >
                                {h.color === 'transparent' ? '✕' : ''}
                            </button>
                        ))}
                    </div>
                    {/* Seletor Customizado com Input Color */}
                    <label className="relative p-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors shrink-0 flex items-center gap-0.5 text-[10px] text-warm-200 font-bold" title="Qualquer Cor de Realce">
                        <Pipette size={12} className="text-primary" />
                        <input
                            type="color"
                            onChange={(e) => applyHighlightColor(e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default WixFloatingToolbar;
