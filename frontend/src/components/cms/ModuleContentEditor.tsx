import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, X, Layers, Image as ImageIcon, Settings,
    CheckCircle2, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Type, Minus,
    LayoutList, Play, Crop, RotateCcw, RotateCw, Monitor, Tablet, Smartphone,
    AlertCircle, RefreshCw, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Underline, Strikethrough, Pipette, Sparkles
} from 'lucide-react';
import BlockRenderer from './blocks/BlockRenderer';
import MediaLibrary from './MediaLibrary';
import ImageCropperModal from './ImageCropperModal';
import WixFloatingToolbar from './WixFloatingToolbar';
import type { BlockData } from './blocks/types';

const API_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

const BLOCK_TEMPLATES: { type: BlockData['type']; label: string; icon: React.ReactNode; description: string; defaultData: any }[] = [
    { type: 'TextBlock', label: 'Texto Livre', icon: <Type size={20} />, description: 'Escreva a teoria', defaultData: { content: '<p>Comece a escrever a teoria aqui...</p>' } },
    { type: 'ImageBlock', label: 'Imagem', icon: <ImageIcon size={20} />, description: 'Imagem ilustrativa', defaultData: { src: '', alt: 'Imagem' } },
    { type: 'SpacerBlock', label: 'Espaçador', icon: <Minus size={20} />, description: 'Espaço em branco', defaultData: {} },
    { type: 'QuizBlock', label: 'Quiz Interativo', icon: <LayoutList size={20} />, description: 'Teste os conhecimentos', defaultData: { title: 'Quiz de Fixação', questions: [{ text: 'Nova pergunta', options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], correct_index: 0 }] } },
    { type: 'FlashcardBlock', label: 'Flashcards', icon: <Layers size={20} />, description: 'Cartões de memorização', defaultData: { cards: [{ front: 'Termo', back: 'Definição' }] } },
    { type: 'MediaBlock', label: 'Vídeo/Podcast', icon: <Play size={20} />, description: 'Embed YouTube/Vimeo', defaultData: { title: 'Assista ao Vídeo', url: '' } },
    { 
        type: 'FeatureCardsBlock', 
        label: 'Cards com Ícones', 
        icon: <Sparkles size={20} className="text-emerald-500" />, 
        description: 'Tópicos ou resumos em cards com ícones', 
        defaultData: {
            cards: [
                { id: '1', icon_name: 'HeartHandshake', iconColor: '#059669', iconBg: '#ecfdf5', badge: 'Conceito 1', title: 'Acolhimento', description: 'Princípios do cuidado paliativo e acolhimento humanizado.' },
                { id: '2', icon_name: 'MessageSquare', iconColor: '#d97706', iconBg: '#fef3c7', badge: 'Conceito 2', title: 'Comunicação', description: 'Técnicas de escuta ativa e diálogo empático.' }
            ]
        } 
    }
];

const ModuleContentEditor: React.FC = () => {
    const { token } = useAuth();
    
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [originalBlocks, setOriginalBlocks] = useState<BlockData[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // ─── Undo / Redo State ───
    const [history, setHistory] = useState<BlockData[][]>([]);
    const [future, setFuture] = useState<BlockData[][]>([]);

    // ─── Device View Switcher ───
    const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

    // ─── LocalStorage Auto-Backup State ───
    const [hasLocalDraft, setHasLocalDraft] = useState(false);
    const [localDraftTimestamp, setLocalDraftTimestamp] = useState<string>('');

    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    
    const [showPublishModal, setShowPublishModal] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [leftSidebarTab, setLeftSidebarTab] = useState<'blocos' | 'midia' | null>('blocos');

    // Helper for blocks update with History Push
    const setBlocksWithHistory = useCallback((updater: BlockData[] | ((prev: BlockData[]) => BlockData[])) => {
        setBlocks(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (JSON.stringify(prev) !== JSON.stringify(next)) {
                setHistory(h => [...h.slice(-30), prev]);
                setFuture([]);
            }
            return next;
        });
    }, []);

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        setFuture(f => [blocks, ...f]);
        setHistory(newHistory);
        setBlocks(previous);
    }, [history, blocks]);

    const handleRedo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setHistory(h => [...h, blocks]);
        setFuture(newFuture);
        setBlocks(next);
    }, [future, blocks]);

    // Keyboard Shortcuts: Ctrl+Z and Ctrl+Y
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isEditingInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (!isEditingInput) {
                    e.preventDefault();
                    if (e.shiftKey) handleRedo();
                    else handleUndo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                if (!isEditingInput) {
                    e.preventDefault();
                    handleRedo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    // Fetch Modules List
    useEffect(() => {
        fetch(`${API_URL}/api/modules`)
            .then(res => res.json())
            .then(data => {
                const arr = Array.isArray(data) ? data : [];
                setModules(arr);
                if (arr.length > 0) setSelectedModuleSlug(arr[0].slug_id);
            });
    }, []);

    // Check for local draft on module change
    useEffect(() => {
        if (!selectedModuleSlug) return;
        const saved = localStorage.getItem(`palieduca_draft_mod_${selectedModuleSlug}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.blocks && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
                    setHasLocalDraft(true);
                    setLocalDraftTimestamp(parsed.timestamp ? new Date(parsed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                }
            } catch { setHasLocalDraft(false); }
        } else {
            setHasLocalDraft(false);
        }
    }, [selectedModuleSlug]);

    // Auto-save local draft
    useEffect(() => {
        if (isDirty && blocks.length > 0 && selectedModuleSlug) {
            localStorage.setItem(`palieduca_draft_mod_${selectedModuleSlug}`, JSON.stringify({
                blocks,
                timestamp: Date.now()
            }));
        }
    }, [blocks, isDirty, selectedModuleSlug]);

    const restoreLocalDraft = () => {
        const saved = localStorage.getItem(`palieduca_draft_mod_${selectedModuleSlug}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.blocks) {
                    setBlocksWithHistory(parsed.blocks);
                    showToast('Rascunho da aula recuperado!');
                }
            } catch { alert('Erro ao ler rascunho local.'); }
        }
        setHasLocalDraft(false);
    };

    const discardLocalDraft = () => {
        localStorage.removeItem(`palieduca_draft_mod_${selectedModuleSlug}`);
        setHasLocalDraft(false);
        showToast('Rascunho local descartado.');
    };

    // Fetch Page Content
    const fetchModuleContent = async (slug: string) => {
        setLoading(true);
        setSelectedBlockId(null);
        setHistory([]);
        setFuture([]);
        try {
            const pageName = `modulo_${slug}`;
            const res = await fetch(`${API_URL}/api/pages/${pageName}/edit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const contentToParse = data.draft_content || data.content || '';
            
            let parsed = [];
            try {
                parsed = JSON.parse(contentToParse);
                if (!Array.isArray(parsed)) parsed = [];
            } catch { parsed = []; }

            // If empty, put a default Text block
            if (parsed.length === 0) {
                parsed = [{ id: `block-${Date.now()}`, type: 'TextBlock', data: { content: '<h1>Novo Módulo</h1><p>Comece a escrever...</p>' } }];
            }

            setBlocks(parsed);
            setOriginalBlocks(parsed);
        } catch (error) {
            console.error(error);
            setBlocks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (selectedModuleSlug) fetchModuleContent(selectedModuleSlug); }, [selectedModuleSlug, token]);
    useEffect(() => { setIsDirty(JSON.stringify(blocks) !== JSON.stringify(originalBlocks)); }, [blocks, originalBlocks]);

    const showToast = (msg: string) => {
        setSuccessMessage(msg);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleSave = async (publish: boolean = false) => {
        setSaving(true);
        try {
            const pageName = `modulo_${selectedModuleSlug}`;
            const draftEndpoint = `${API_URL}/api/pages/${pageName}/draft`;
            const draftRes = await fetch(draftEndpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ draft_content: JSON.stringify(blocks) })
            });

            if (!draftRes.ok) throw new Error('Falha ao salvar rascunho');

            if (publish) {
                const publishRes = await fetch(`${API_URL}/api/pages/${pageName}/publish`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!publishRes.ok) throw new Error('Falha ao publicar');
            }

            setOriginalBlocks(blocks);
            setIsDirty(false);
            localStorage.removeItem(`palieduca_draft_mod_${selectedModuleSlug}`);
            setHasLocalDraft(false);
            if (publish) setShowPublishModal(false);
            showToast(publish ? 'Módulo publicado ao vivo!' : 'Rascunho salvo!');
        } catch (error) {
            console.error(error);
            alert('Falha ao salvar. Tente novamente.');
        } finally { setSaving(false); }
    };

    const addBlock = (type: BlockData['type']) => {
        const template = BLOCK_TEMPLATES.find(t => t.type === type);
        if (!template) return;
        const newBlock: BlockData = { id: `block-${Date.now()}`, type, data: { ...template.defaultData } };
        setBlocksWithHistory(prev => [...prev, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<BlockData>) => {
        setBlocksWithHistory(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocksWithHistory(prev => {
            const idx = prev.findIndex(b => b.id === id);
            if (idx < 0) return prev;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= prev.length) return prev;
            const newArr = [...prev];
            [newArr[idx], newArr[newIdx]] = [newArr[newIdx], newArr[idx]];
            return newArr;
        });
    };

    const duplicateBlock = (id: string) => {
        const blockToDup = blocks.find(b => b.id === id);
        if (!blockToDup) return;
        const newBlock = { ...blockToDup, id: `block-${Date.now()}` };
        setBlocksWithHistory(prev => {
            const idx = prev.findIndex(b => b.id === id);
            const newArr = [...prev];
            newArr.splice(idx + 1, 0, newBlock);
            return newArr;
        });
    };

    const deleteBlock = (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta seção do módulo?')) return;
        setBlocksWithHistory(prev => prev.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);
    const selectedBlockIndex = blocks.findIndex(b => b.id === selectedBlockId);

    // Render Quiz Properties helper
    const updateQuizQuestion = (qIndex: number, field: string, value: any) => {
        if (!selectedBlock) return;
        const questions = [...(selectedBlock.data.questions || [])];
        if (field.startsWith('option_')) {
            const optIndex = parseInt(field.split('_')[1]);
            questions[qIndex].options[optIndex] = value;
        } else {
            questions[qIndex][field] = value;
        }
        updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, questions } });
    };

    return (
        <div className="bg-[#f0f2f5] h-full flex flex-col overflow-hidden font-sans rounded-xl border border-warm-200 relative">
            {/* ═══ HEADER ═══ */}
            <div className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <select
                        value={selectedModuleSlug}
                        onChange={(e) => setSelectedModuleSlug(e.target.value)}
                        className="bg-warm-50 border border-warm-200 text-warm-900 font-bold rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none max-w-[170px] sm:max-w-none"
                    >
                        {modules.map(m => <option key={m.slug_id} value={m.slug_id}>{m.title}</option>)}
                    </select>
                    {isDirty && (
                        <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse whitespace-nowrap">
                            ● Não salvo
                        </span>
                    )}
                </div>

                {/* Center: Undo/Redo & Device Switcher */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Undo / Redo */}
                    <div className="flex items-center bg-warm-50 p-0.5 sm:p-1 rounded-xl border border-warm-200">
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            title="Desfazer (Ctrl+Z)"
                            className="p-1.5 rounded-lg text-warm-600 hover:bg-white hover:text-warm-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-warm-400 transition-all flex items-center gap-1 text-xs"
                        >
                            <RotateCcw size={15} />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={future.length === 0}
                            title="Refazer (Ctrl+Y)"
                            className="p-1.5 rounded-lg text-warm-600 hover:bg-white hover:text-warm-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-warm-400 transition-all flex items-center gap-1 text-xs"
                        >
                            <RotateCw size={15} />
                        </button>
                    </div>

                    {/* Device View Selector */}
                    <div className="flex items-center bg-warm-50 p-0.5 sm:p-1 rounded-xl border border-warm-200">
                        <button
                            onClick={() => setDeviceView('desktop')}
                            title="Desktop (Largura total)"
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                                deviceView === 'desktop' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'
                            }`}
                        >
                            <Monitor size={15} />
                        </button>
                        <button
                            onClick={() => setDeviceView('tablet')}
                            title="Tablet (768px)"
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                                deviceView === 'tablet' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'
                            }`}
                        >
                            <Tablet size={15} />
                        </button>
                        <button
                            onClick={() => setDeviceView('mobile')}
                            title="Celular (390px)"
                            className={`p-1.5 rounded-lg text-xs transition-all ${
                                deviceView === 'mobile' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'
                            }`}
                        >
                            <Smartphone size={15} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={!isDirty || saving}
                        className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-warm-700 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                        {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button
                        onClick={() => setShowPublishModal(true)}
                        disabled={saving}
                        className="px-3 sm:px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
                    >
                        <Save size={14} /> Atualizar Aula
                    </button>
                </div>
            </div>

            {/* ═══ EMERGENCY DRAFT RECOVERY BANNER ═══ */}
            {hasLocalDraft && (
                <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between z-40 text-xs shadow-md animate-slide-down">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertCircle size={16} className="shrink-0 animate-bounce" />
                        <span>Existe um rascunho desta aula salvo localmente neste navegador {localDraftTimestamp && `(às ${localDraftTimestamp})`}.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={restoreLocalDraft}
                            className="px-2.5 py-1 bg-white text-amber-900 font-bold rounded-md hover:bg-amber-100 shadow-sm transition-colors flex items-center gap-1"
                        >
                            <RefreshCw size={12} /> Restaurar
                        </button>
                        <button
                            onClick={discardLocalDraft}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                        >
                            Descartar
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ TRIPLE LAYOUT ═══ */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                
                {/* ─── LEFT SIDEBAR (CANVA STYLE) ─── */}
                <div className="flex shrink-0 h-full">
                    <div className="w-[72px] bg-warm-900 flex flex-col items-center py-4 gap-4 z-50 shadow-md">
                        <button
                            onClick={() => setLeftSidebarTab(leftSidebarTab === 'blocos' ? null : 'blocos')}
                            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${leftSidebarTab === 'blocos' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Layers size={22} />
                            <span className="text-[10px] font-medium">Blocos</span>
                        </button>
                        <button
                            onClick={() => setLeftSidebarTab(leftSidebarTab === 'midia' ? null : 'midia')}
                            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${leftSidebarTab === 'midia' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ImageIcon size={22} />
                            <span className="text-[10px] font-medium">Mídia</span>
                        </button>
                    </div>

                    <div className={`bg-white border-r border-warm-200 flex flex-col z-40 overflow-hidden shadow-lg transition-all duration-300 ${leftSidebarTab !== null ? 'w-[280px] opacity-100' : 'w-0 opacity-0 border-r-0'}`}>
                        {leftSidebarTab === 'blocos' && (
                            <>
                                <div className="p-4 border-b border-warm-100 flex justify-between bg-white shrink-0">
                                    <h3 className="text-sm font-bold text-warm-800">Recursos de Ensino</h3>
                                    <button onClick={() => setLeftSidebarTab(null)} className="text-warm-400 hover:text-warm-700"><X size={16} /></button>
                                </div>
                                <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                                    {BLOCK_TEMPLATES.map(tmpl => (
                                        <button
                                            key={tmpl.type}
                                            onClick={() => addBlock(tmpl.type)}
                                            className="flex items-center gap-3 p-3 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 hover:border-primary/30 transition-all text-left group"
                                        >
                                            <div className="bg-white p-2 rounded-lg text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                {tmpl.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-warm-900 leading-none mb-1">{tmpl.label}</h4>
                                                <p className="text-[10px] text-warm-500 leading-tight">{tmpl.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {leftSidebarTab === 'midia' && (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                <MediaLibrary isModal={false} onSelect={(url) => {
                                    if (selectedBlockId) {
                                        const block = blocks.find(b => b.id === selectedBlockId);
                                        if (block && block.type === 'HeroBlock') {
                                            updateBlock(selectedBlockId, { data: { ...block.data, bgImage: url } });
                                            showToast('Imagem selecionada para o bloco!');
                                        } else if (block && block.type === 'ImageBlock') {
                                            updateBlock(selectedBlockId, { data: { ...block.data, src: url } });
                                            showToast('Imagem selecionada para o bloco!');
                                        } else {
                                            showToast('O bloco selecionado não suporta imagem.');
                                        }
                                    } else {
                                        showToast('Nenhum bloco selecionado para receber a imagem.');
                                    }
                                }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── CENTER CANVAS ─── */}
                <div 
                    className="flex-1 overflow-y-auto relative flex justify-center p-3 sm:p-6" 
                    style={{ background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    onClick={() => setSelectedBlockId(null)}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-warm-400 gap-3 my-auto">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="font-medium text-sm">Carregando aula...</p>
                        </div>
                    ) : (
                        <div className={`transition-all duration-300 ${
                            deviceView === 'desktop'
                                ? 'max-w-5xl w-full flex flex-col gap-3 pb-32'
                                : deviceView === 'tablet'
                                ? 'w-[768px] max-w-full bg-white rounded-3xl shadow-2xl border-4 border-warm-300 p-4 sm:p-6 min-h-[850px] my-auto flex flex-col gap-3 pb-32'
                                : 'w-[390px] max-w-full bg-white rounded-[40px] shadow-2xl border-[10px] border-warm-900 p-3 sm:p-4 min-h-[750px] my-auto relative flex flex-col gap-3 pb-32 overflow-hidden'
                        }`}>
                            {/* Smartphone Notch */}
                            {deviceView === 'mobile' && (
                                <div className="w-28 h-4 bg-warm-900 mx-auto rounded-b-xl mb-2 shrink-0 z-30 shadow-inner" />
                            )}

                            {blocks.map((block) => (
                                <BlockRenderer
                                    key={block.id}
                                    block={block}
                                    isEditing={true}
                                    isSelected={selectedBlockId === block.id}
                                    onSelect={setSelectedBlockId}
                                    onUpdate={updateBlock}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── RIGHT SIDEBAR (PROPERTIES) ─── */}
                {selectedBlock && (
                    <div className="w-[320px] bg-white border-l border-warm-200 shrink-0 flex flex-col z-30 shadow-lg overflow-y-auto">
                        <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-warm-900 flex items-center gap-2">
                                <Settings size={18} className="text-primary" />
                                Propriedades
                            </h3>
                            <button onClick={() => setSelectedBlockId(null)} className="p-1 hover:bg-warm-200 rounded text-warm-500"><X size={16} /></button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-5">
                            <div className="flex gap-1.5 mb-6">
                                <button onClick={() => moveBlock(selectedBlock.id, 'up')} disabled={selectedBlockIndex === 0} className="flex-1 p-2 bg-warm-50 border rounded-lg text-xs flex justify-center hover:bg-warm-100 disabled:opacity-30"><ChevronUp size={14} /></button>
                                <button onClick={() => moveBlock(selectedBlock.id, 'down')} disabled={selectedBlockIndex === blocks.length - 1} className="flex-1 p-2 bg-warm-50 border rounded-lg text-xs flex justify-center hover:bg-warm-100 disabled:opacity-30"><ChevronDown size={14} /></button>
                                <button onClick={() => duplicateBlock(selectedBlock.id)} className="p-2 bg-warm-50 border rounded-lg hover:bg-warm-100"><Copy size={14} /></button>
                            </div>

                            {/* TextBlock Typography Studio */}
                            {selectedBlock.type === 'TextBlock' && (
                                <div className="space-y-5 text-left">
                                    <div className="flex items-center justify-between border-b border-warm-100 pb-2">
                                        <h4 className="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Type size={15} className="text-primary" /> Estúdio de Tipografia
                                        </h4>
                                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">Photoshop FX</span>
                                    </div>

                                    {/* 1. Família da Fonte */}
                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1">Família da Fonte</label>
                                        <select
                                            value={selectedBlock.styles?.fontFamily || 'sans-serif'}
                                            onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontFamily: e.target.value } })}
                                            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="sans-serif">Padrão / Moderna (Inter Sans)</option>
                                            <option value="serif">Elegante / Editorial (Playfair Serif)</option>
                                            <option value="rounded">Amigável / Arredondada (Outfit)</option>
                                            <option value="mono">Técnica / Monospaçada (Code Mono)</option>
                                        </select>
                                    </div>

                                    {/* 2. Tamanho da Fonte com Atalhos Rápidos */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-warm-700">Tamanho da Fonte</label>
                                            <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                                                {selectedBlock.styles?.fontSize ?? 16}px
                                            </span>
                                        </div>
                                        <input
                                            type="range" min="12" max="56"
                                            value={selectedBlock.styles?.fontSize ?? 16}
                                            onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: parseInt(e.target.value) } })}
                                            className="w-full accent-primary h-2 bg-warm-200 rounded-lg cursor-pointer"
                                        />
                                        <div className="flex gap-1.5 mt-2">
                                            {[
                                                { label: 'P (14px)', size: 14 },
                                                { label: 'Normal (16px)', size: 16 },
                                                { label: 'H3 (22px)', size: 22 },
                                                { label: 'H2 (28px)', size: 28 },
                                                { label: 'H1 (36px)', size: 36 }
                                            ].map(sz => (
                                                <button
                                                    key={sz.size}
                                                    onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: sz.size } })}
                                                    className={`flex-1 py-1 text-[10px] rounded-lg border font-semibold transition-all ${
                                                        (selectedBlock.styles?.fontSize ?? 16) === sz.size 
                                                            ? 'bg-primary text-white border-primary shadow-sm' 
                                                            : 'bg-warm-50 text-warm-600 border-warm-200 hover:bg-warm-100'
                                                    }`}
                                                >
                                                    {sz.label.split(' ')[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Espessura da Fonte (Weight) */}
                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Espessura (Peso)</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {[
                                                { value: '300', label: 'Fino' },
                                                { value: '400', label: 'Normal' },
                                                { value: '600', label: 'Semibold' },
                                                { value: '800', label: 'Negrito' }
                                            ].map(w => (
                                                <button
                                                    key={w.value}
                                                    onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontWeight: w.value } })}
                                                    className={`py-1.5 text-xs rounded-lg border transition-all ${
                                                        (selectedBlock.styles?.fontWeight || '400') === w.value
                                                            ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                            : 'bg-warm-50 text-warm-600 border-warm-200 hover:bg-warm-100'
                                                    }`}
                                                >
                                                    {w.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 4. Alinhamento */}
                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Alinhamento</label>
                                        <div className="flex bg-warm-50 p-1 rounded-xl border border-warm-200 gap-1">
                                            {[
                                                { value: 'left', icon: <AlignLeft size={16} />, label: 'Esquerda' },
                                                { value: 'center', icon: <AlignCenter size={16} />, label: 'Centro' },
                                                { value: 'right', icon: <AlignRight size={16} />, label: 'Direita' },
                                                { value: 'justify', icon: <AlignJustify size={16} />, label: 'Justificado' }
                                            ].map(align => (
                                                <button
                                                    key={align.value}
                                                    title={align.label}
                                                    onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textAlign: align.value } })}
                                                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                                                        (selectedBlock.styles?.textAlign || 'left') === align.value
                                                            ? 'bg-white text-primary shadow-sm font-bold'
                                                            : 'text-warm-400 hover:text-warm-700'
                                                    }`}
                                                >
                                                    {align.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 5. Transformação de Texto (Maiúsculas/Minúsculas) & Decoração */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-warm-700 mb-1">Caixa (Transform)</label>
                                            <div className="flex bg-warm-50 p-1 rounded-xl border border-warm-200 gap-1">
                                                {[
                                                    { value: 'none', label: 'Aa' },
                                                    { value: 'uppercase', label: 'AA' },
                                                    { value: 'lowercase', label: 'aa' }
                                                ].map(t => (
                                                    <button
                                                        key={t.value}
                                                        onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textTransform: t.value } })}
                                                        className={`flex-1 py-1 text-xs rounded-lg transition-all ${
                                                            (selectedBlock.styles?.textTransform || 'none') === t.value
                                                                ? 'bg-white text-primary font-bold shadow-sm'
                                                                : 'text-warm-400 hover:text-warm-700'
                                                        }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-warm-700 mb-1">Decoração</label>
                                            <div className="flex bg-warm-50 p-1 rounded-xl border border-warm-200 gap-1">
                                                {[
                                                    { value: 'none', label: '—' },
                                                    { value: 'underline', icon: <Underline size={14} /> },
                                                    { value: 'line-through', icon: <Strikethrough size={14} /> }
                                                ].map(d => (
                                                    <button
                                                        key={d.value}
                                                        onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textDecoration: d.value } })}
                                                        className={`flex-1 py-1 text-xs rounded-lg flex items-center justify-center transition-all ${
                                                            (selectedBlock.styles?.textDecoration || 'none') === d.value
                                                                ? 'bg-white text-primary font-bold shadow-sm'
                                                                : 'text-warm-400 hover:text-warm-700'
                                                        }`}
                                                    >
                                                        {d.icon || d.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Entrelinha (Line Height) e Tracking (Letter Spacing) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-warm-700 mb-1">Entrelinha (Leading)</label>
                                            <select
                                                value={selectedBlock.styles?.lineHeight || '1.6'}
                                                onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, lineHeight: e.target.value } })}
                                                className="w-full bg-warm-50 border border-warm-200 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                <option value="1.2">Compacto (1.2)</option>
                                                <option value="1.5">Padrão (1.5)</option>
                                                <option value="1.8">Confortável (1.8)</option>
                                                <option value="2.2">Espaçoso (2.2)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-warm-700 mb-1">Letras (Tracking)</label>
                                            <select
                                                value={selectedBlock.styles?.letterSpacing || 'normal'}
                                                onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, letterSpacing: e.target.value } })}
                                                className="w-full bg-warm-50 border border-warm-200 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                                            >
                                                <option value="-0.05em">Apertado (-0.05)</option>
                                                <option value="normal">Normal (0)</option>
                                                <option value="0.05em">Arejado (+0.05)</option>
                                                <option value="0.15em">Amplo (+0.15)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 7. Cor do Texto com Seletor Livre */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-warm-700">Cor do Texto</label>
                                            <span className="text-[11px] font-mono text-warm-500">{selectedBlock.styles?.textColor || '#374151'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                                {['#111827', '#374151', '#4b5563', '#9ca3af', '#1e3a8a', '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'].map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textColor: c } })}
                                                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                                                            (selectedBlock.styles?.textColor || '#374151') === c ? 'border-primary shadow-md scale-110' : 'border-warm-200'
                                                        }`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            <label className="relative p-1.5 bg-warm-100 hover:bg-warm-200 rounded-xl border border-warm-300 cursor-pointer transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold text-warm-700" title="Escolher qualquer cor (Color Picker)">
                                                <Pipette size={14} className="text-primary" />
                                                <input
                                                    type="color"
                                                    value={selectedBlock.styles?.textColor || '#374151'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textColor: e.target.value } })}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 8. Cor de Fundo / Destaque do Bloco */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-bold text-warm-700">Fundo do Cartão / Realce</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                                {[
                                                    { color: 'transparent', label: 'Nenhum' },
                                                    { color: '#fef3c7', label: 'Amarelo' },
                                                    { color: '#f3f4f6', label: 'Cinza' },
                                                    { color: '#f0fdf4', label: 'Verde' },
                                                    { color: '#eff6ff', label: 'Azul' },
                                                    { color: '#faf5ff', label: 'Roxo' }
                                                ].map(bg => (
                                                    <button
                                                        key={bg.color}
                                                        title={bg.label}
                                                        onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, backgroundColor: bg.color } })}
                                                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center text-[8px] font-bold ${
                                                            (selectedBlock.styles?.backgroundColor || 'transparent') === bg.color ? 'border-primary shadow-md scale-110' : 'border-warm-200'
                                                        }`}
                                                        style={{ backgroundColor: bg.color === 'transparent' ? '#ffffff' : bg.color }}
                                                    >
                                                        {bg.color === 'transparent' ? '✕' : ''}
                                                    </button>
                                                ))}
                                            </div>
                                            <label className="relative p-1.5 bg-warm-100 hover:bg-warm-200 rounded-xl border border-warm-300 cursor-pointer transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold text-warm-700" title="Personalizar cor de fundo">
                                                <Pipette size={14} className="text-primary" />
                                                <input
                                                    type="color"
                                                    value={selectedBlock.styles?.backgroundColor && selectedBlock.styles?.backgroundColor !== 'transparent' ? selectedBlock.styles.backgroundColor : '#ffffff'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, backgroundColor: e.target.value } })}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* 9. Efeitos de Sombra do Texto (Photoshop Shadow) */}
                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Sombra do Texto (Photoshop Shadow)</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {[
                                                { value: 'none', label: 'Sem Sombra' },
                                                { value: '0 2px 4px rgba(0,0,0,0.15)', label: 'Sutil' },
                                                { value: '0 4px 10px rgba(0,0,0,0.3)', label: 'Marcada' },
                                                { value: '0 0 12px rgba(99,102,241,0.5)', label: 'Brilho / Glow' }
                                            ].map(sh => (
                                                <button
                                                    key={sh.value}
                                                    onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textShadow: sh.value } })}
                                                    className={`py-1.5 px-2 text-xs rounded-xl border transition-all ${
                                                        (selectedBlock.styles?.textShadow || 'none') === sh.value
                                                            ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                            : 'bg-warm-50 text-warm-600 border-warm-200 hover:bg-warm-100'
                                                    }`}
                                                >
                                                    {sh.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Properties */}
                            {selectedBlock.type === 'QuizBlock' && (
                                <div className="space-y-6">
                                    {selectedBlock.data.questions?.map((q: any, qIndex: number) => (
                                        <div key={qIndex} className="p-3 bg-warm-50 border border-warm-200 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-warm-600">Pergunta {qIndex + 1}</h4>
                                                <button onClick={() => {
                                                    const qs = [...selectedBlock.data.questions];
                                                    qs.splice(qIndex, 1);
                                                    updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, questions: qs }});
                                                }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                            </div>
                                            <textarea
                                                value={q.text}
                                                onChange={e => updateQuizQuestion(qIndex, 'text', e.target.value)}
                                                className="w-full bg-white border border-warm-300 rounded-lg p-2 text-sm"
                                                placeholder="Digite a pergunta..."
                                                rows={2}
                                            />
                                            <div className="space-y-2">
                                                {q.options.map((opt: string, oIndex: number) => (
                                                    <div key={oIndex} className="flex items-center gap-2">
                                                        <input 
                                                            type="radio" 
                                                            name={`correct_${qIndex}`} 
                                                            checked={q.correct_index === oIndex}
                                                            onChange={() => updateQuizQuestion(qIndex, 'correct_index', oIndex)}
                                                            className="accent-green-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={e => updateQuizQuestion(qIndex, `option_${oIndex}`, e.target.value)}
                                                            className="flex-1 bg-white border border-warm-300 rounded-md px-2 py-1 text-xs"
                                                            placeholder={`Opção ${['A', 'B', 'C', 'D'][oIndex]}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const qs = [...(selectedBlock.data.questions || []), { text: '', options: ['', '', '', ''], correct_index: 0 }];
                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, questions: qs } });
                                        }}
                                        className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs rounded-lg hover:bg-purple-100"
                                    >
                                        + Adicionar Pergunta
                                    </button>
                                </div>
                            )}

                            {/* Flashcard Properties */}
                            {selectedBlock.type === 'FlashcardBlock' && (
                                <div className="space-y-4">
                                    {selectedBlock.data.cards?.map((card: any, cIndex: number) => (
                                        <div key={cIndex} className="p-3 bg-warm-50 border border-warm-200 rounded-xl space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-warm-600">Cartão {cIndex + 1}</h4>
                                                <button onClick={() => {
                                                    const cs = [...selectedBlock.data.cards];
                                                    cs.splice(cIndex, 1);
                                                    updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs }});
                                                }} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                            </div>
                                            <input
                                                type="text" value={card.front}
                                                onChange={e => {
                                                    const cs = [...selectedBlock.data.cards];
                                                    cs[cIndex].front = e.target.value;
                                                    updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                }}
                                                className="w-full bg-white border rounded p-2 text-xs font-bold" placeholder="Frente (Termo)"
                                            />
                                            <textarea
                                                value={card.back}
                                                onChange={e => {
                                                    const cs = [...selectedBlock.data.cards];
                                                    cs[cIndex].back = e.target.value;
                                                    updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                }}
                                                className="w-full bg-white border rounded p-2 text-xs" placeholder="Verso (Definição)" rows={2}
                                            />
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const cs = [...(selectedBlock.data.cards || []), { front: '', back: '' }];
                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                        }}
                                        className="w-full py-2 bg-orange-50 text-orange-700 border border-orange-200 font-bold text-xs rounded-lg hover:bg-orange-100"
                                    >
                                        + Adicionar Cartão
                                    </button>
                                </div>
                            )}

                            {/* Image Properties */}
                            {selectedBlock.type === 'ImageBlock' && (
                                <div className="space-y-4">
                                    {selectedBlock.data.src && (
                                        <button 
                                            onClick={() => setCroppingImage(selectedBlock.data.src)}
                                            className="w-full mb-4 px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Crop size={16} /> Recortar Imagem
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Media Properties */}
                            {selectedBlock.type === 'MediaBlock' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-warm-600 mb-1">URL do Vídeo (YouTube/Vimeo)</label>
                                        <input
                                            type="text"
                                            value={selectedBlock.data.url || ''}
                                            onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, url: e.target.value } })}
                                            className="w-full bg-white border border-warm-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* FeatureCardsBlock Properties */}
                            {selectedBlock.type === 'FeatureCardsBlock' && (
                                <div className="space-y-5 text-left">
                                    <div className="flex items-center justify-between border-b border-warm-100 pb-2">
                                        <h4 className="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles size={15} className="text-primary" /> Configuração dos Cards
                                        </h4>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Número de Colunas</label>
                                        <div className="grid grid-cols-3 gap-1">
                                            {[1, 2, 3].map(cols => (
                                                <button
                                                    key={cols}
                                                    onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, columns: cols } })}
                                                    className={`py-1.5 text-xs rounded-lg border transition-all ${
                                                        (selectedBlock.styles?.columns || 2) === cols
                                                            ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                            : 'bg-warm-50 text-warm-600 border-warm-200 hover:bg-warm-100'
                                                    }`}
                                                >
                                                    {cols} Col
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Sombra dos Cards</label>
                                        <select
                                            value={selectedBlock.styles?.cardShadow || 'md'}
                                            onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, cardShadow: e.target.value } })}
                                            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="none">Sem Sombra</option>
                                            <option value="sm">Suave</option>
                                            <option value="md">Média (Padrão)</option>
                                            <option value="lg">Elevada / 3D</option>
                                        </select>
                                    </div>

                                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                                        <p className="font-bold flex items-center gap-1">💡 Dica de Edição:</p>
                                        <p className="text-[11px] leading-relaxed">
                                            Você pode <strong>clicar diretamente no ícone de qualquer card na tela</strong> para abrir o seletor visual de ícones e mudar as cores!
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-warm-100 mt-8">
                                <button onClick={() => deleteBlock(selectedBlock.id)} className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-xs border border-red-200 flex justify-center items-center gap-1.5">
                                    <Trash2 size={13} /> Excluir Bloco
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TOAST & MODAL */}
            {successMessage && (
                <div className="fixed bottom-6 right-6 z-[60] bg-sage-50 text-sage-700 border px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm">
                    <CheckCircle2 size={18} /> <span className="font-medium">{successMessage}</span>
                </div>
            )}
            
            {showPublishModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-warm-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><AlertTriangle size={22} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-warm-900">Atualizar Aula?</h3>
                                <p className="text-xs text-warm-500">Módulo selecionado</p>
                            </div>
                        </div>
                        <p className="text-sm text-warm-600 mb-6 leading-relaxed">
                            A aula será atualizada para todos os alunos instantaneamente.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowPublishModal(false)} className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl text-sm">Cancelar</button>
                            <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm flex gap-1.5 items-center">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* IMAGE CROPPER MODAL */}
            {croppingImage && (
                <ImageCropperModal
                    imageUrl={croppingImage}
                    onClose={() => setCroppingImage(null)}
                    onCropComplete={(newUrl) => {
                        if (selectedBlockId) {
                            updateBlock(selectedBlockId, { data: { ...blocks.find(b => b.id === selectedBlockId)?.data, src: newUrl } });
                            showToast('Imagem recortada com sucesso!');
                        }
                        setCroppingImage(null);
                    }}
                />
            )}
            {/* FLOATING RICH TEXT TOOLBAR FOR TEXT SELECTION */}
            <WixFloatingToolbar />
        </div>
    );
};

export default ModuleContentEditor;
