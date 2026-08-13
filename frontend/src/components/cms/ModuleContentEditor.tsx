import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, X, Layers, Image as ImageIcon, Settings,
    CheckCircle2, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Type, Minus,
    LayoutList, Play, Crop
} from 'lucide-react';
import BlockRenderer from './blocks/BlockRenderer';
import MediaLibrary from './MediaLibrary';
import ImageCropperModal from './ImageCropperModal';
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
    { type: 'MediaBlock', label: 'Vídeo/Podcast', icon: <Play size={20} />, description: 'Embed YouTube/Vimeo', defaultData: { title: 'Assista ao Vídeo', url: '' } }
];

const ModuleContentEditor: React.FC = () => {
    const { token } = useAuth();
    
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [originalBlocks, setOriginalBlocks] = useState<BlockData[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    
    const [showPublishModal, setShowPublishModal] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [leftSidebarTab, setLeftSidebarTab] = useState<'blocos' | 'midia' | null>('blocos');

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

    // Fetch Page Content
    const fetchModuleContent = async (slug: string) => {
        setLoading(true);
        setSelectedBlockId(null);
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
        setBlocks(prev => [...prev, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<BlockData>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
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
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id);
            const newArr = [...prev];
            newArr.splice(idx + 1, 0, newBlock);
            return newArr;
        });
    };

    const deleteBlock = (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta seção do módulo?')) return;
        setBlocks(prev => prev.filter(b => b.id !== id));
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
        <div className="bg-[#f0f2f5] h-full flex flex-col overflow-hidden font-sans rounded-xl border border-warm-200">
            {/* ═══ HEADER ═══ */}
            <div className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <select
                        value={selectedModuleSlug}
                        onChange={(e) => setSelectedModuleSlug(e.target.value)}
                        className="bg-warm-50 border border-warm-200 text-warm-900 font-bold rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    >
                        {modules.map(m => <option key={m.slug_id} value={m.slug_id}>{m.title}</option>)}
                    </select>
                    {isDirty && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md animate-pulse">
                            ● Não salvo
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={!isDirty || saving}
                        className="px-3 py-1.5 text-xs font-semibold text-warm-700 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 disabled:opacity-40 transition-colors"
                    >
                        {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button
                        onClick={() => setShowPublishModal(true)}
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md transition-all flex items-center gap-1.5"
                    >
                        <Save size={14} /> Atualizar Aula
                    </button>
                </div>
            </div>

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
                <div className="flex-1 bg-[#f0f2f5] overflow-y-auto relative" onClick={() => setSelectedBlockId(null)}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-warm-400 gap-3">
                            <Loader2 size={32} className="animate-spin" />
                            <p>Carregando aula...</p>
                        </div>
                    ) : (
                        <div className="min-h-full py-12 px-4 sm:px-8">
                            <div className="max-w-5xl mx-auto space-y-2 pb-32">
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
        </div>
    );
};

export default ModuleContentEditor;
