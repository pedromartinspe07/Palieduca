import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FileText, CheckCircle2, Loader2, Save, Sparkles, Send,
    BookOpen, Layers, AlertTriangle,
    Eye, Bot, ChevronDown, ChevronUp, History, Image as ImageIcon, RotateCcw
} from 'lucide-react';
import DOMPurify from 'dompurify';

import { InteractiveResourceBuilder } from './InteractiveResourceBuilder';
import MediaLibrary from './MediaLibrary';
import { CanvasWorkspace } from './canvas/CanvasWorkspace';
import type { CanvasElement } from './canvas/types';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

const cleanEditorHtml = (rawHtml: string): string => {
    if (!rawHtml) return '';
    const safeHtml = DOMPurify.sanitize(rawHtml);
    const parser = new DOMParser();
    const doc = parser.parseFromString(safeHtml, 'text/html');

    const isNodeEmpty = (node: Element) => {
        const text = node.innerHTML.replace(/&nbsp;/g, '').trim();
        return text === '' || text === '<br>';
    };

    while (doc.body.firstElementChild && doc.body.firstElementChild.tagName === 'P' && isNodeEmpty(doc.body.firstElementChild)) {
        doc.body.removeChild(doc.body.firstElementChild);
    }
    while (doc.body.lastElementChild && doc.body.lastElementChild.tagName === 'P' && isNodeEmpty(doc.body.lastElementChild)) {
        doc.body.removeChild(doc.body.lastElementChild);
    }
    return doc.body.innerHTML;
};

const cleanAIResponse = (response: string): string => {
    if (!response) return '';
    let html = response.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    if (!/<[a-z][\s\S]*>/i.test(html)) {
        html = html
            .split(/\n\s*\n+/)
            .map(paragraph => paragraph.trim())
            .filter(Boolean)
            .map(p => `<p>${p.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim()}</p>`)
            .join('');
    }
    return cleanEditorHtml(html);
};

const ModuleContentEditor: React.FC = () => {
    const { token } = useAuth();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [originalElements, setOriginalElements] = useState<CanvasElement[]>([]);

    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Tabs e Layouts
    const [activeEditorTab, setActiveEditorTab] = useState<'teoria' | 'recursos'>('teoria');    const [mobileTab, setMobileTab] = useState<'teoria' | 'recursos' | 'preview' | 'ai'>('teoria');

    // Modals & Panels
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [revisions, setRevisions] = useState<any[]>([]);

    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiExpanded, setAiExpanded] = useState(true);
    useEffect(() => {
        fetchModulesList();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const fetchModulesList = async () => {
        try {
            const res = await fetch(`${API_URL}/api/modules`);
            const data = await res.json();
            setModules(data);
            if (data.length > 0) {
                setSelectedModuleSlug(data[0].slug_id);
            }
        } catch (error) {
            console.error("Erro ao buscar módulos:", error);
        }
    };

    const fetchRevisions = useCallback(async (slug: string) => {
        try {
            const pageName = `modulo_${slug}`;
            const res = await fetch(`${API_URL}/api/pages/${pageName}/revisions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRevisions(data);
            }
        } catch (error) {
            console.error('Erro ao buscar revisões', error);
        }
    }, [token]);

    const fetchModuleContent = useCallback(async (slug: string) => {
        setLoading(true);
        setSuccessMessage('');
        setIsDirty(false);
        try {
            const pageName = `modulo_${slug}`;
            const res = await fetch(`${API_URL}/api/v1/cms/pages/${pageName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                try {
                    const parsed = JSON.parse(data.content || '[]');
                    setElements(parsed);
                    setOriginalElements(parsed);
                } catch(e) {
                    setElements([]);
                    setOriginalElements([]);
                }
                fetchRevisions(slug);
            }
        } catch (error) {
            console.error("Erro ao buscar conteúdo do módulo:", error);
            setElements([]);
            setOriginalElements([]);
        } finally {
            setLoading(false);
        }
    }, [token, fetchRevisions]);

    useEffect(() => {
        if (selectedModuleSlug) {
            fetchModuleContent(selectedModuleSlug);
        }
    }, [selectedModuleSlug, fetchModuleContent]);

    useEffect(() => {
        if (JSON.stringify(elements) !== JSON.stringify(originalElements)) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [elements, originalElements]);

    const showToast = (message: string) => {
        setSuccessMessage(message);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setSuccessMessage('');
        }, 4000);
    };

    const handleConfirmPublish = async () => {
        if (saving) return;
        setSaving(true);
        setSuccessMessage('');

        try {
            const pageName = `modulo_${selectedModuleSlug}`;
            const res = await fetch(`${API_URL}/api/v1/cms/pages/${pageName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    content: JSON.stringify(elements),
                    description: `Atualização via Canvas - ${new Date().toLocaleString()}`
                })
            });

            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

            setOriginalElements([...elements]);
            setIsDirty(false);
            setShowPublishModal(false);
            showToast('Módulo atualizado com sucesso!');
            fetchRevisions(selectedModuleSlug);
        } catch (error) {
            console.error(error);
            alert('Não foi possível publicar as alterações do módulo.');
        } finally {
            setSaving(false);
        }
    };

    const handleRestoreRevision = async (revisionId: number) => {
        if (!window.confirm('Isto irá sobrescrever seu rascunho atual. Continuar?')) return;
        
        try {
            const res = await fetch(`${API_URL}/api/v1/cms/revisions/${revisionId}/restore`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                try {
                    const parsed = JSON.parse(data.content || '[]');
                    setElements(parsed);
                    setOriginalElements(parsed);
                } catch (e) {
                    setElements([]);
                    setOriginalElements([]);
                }
                setIsDirty(true);
                setShowHistory(false);
                alert('Versão restaurada com sucesso!');
            }
        } catch (e) {
            alert('Erro ao restaurar versão.');
        }
    };

    const handleAIGenerate = async (customPrompt?: string) => {
        const promptToUse = (customPrompt || aiPrompt).trim();
        if (!promptToUse || generatingAI) return;

        setGeneratingAI(true);
        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'Você é um assistente acadêmico. Escreva em formato HTML amigável para React Quill (use <h2>, <h3>, <p>, <ul>, <li>, <strong>). Não use inline styles nem markdown.' },
                        { role: 'user', content: promptToUse }
                    ]
                })
            });

            if (!res.ok) throw new Error('Falha na IA');

            const data = await res.json();
            const generatedHtml = cleanAIResponse(data.reply || '');

            if (generatedHtml) {
                const newText: CanvasElement = {
                    id: crypto.randomUUID(),
                    type: 'text',
                    x: 100, y: 100, width: 400, height: 'auto', zIndex: elements.length + 1, rotation: 0,
                    content: generatedHtml,
                    fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#000000',
                    textAlign: 'left', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none'
                };
                setElements(prev => [...prev, newText]);
                setAiPrompt('');
                showToast('Conteúdo inserido com sucesso!');
                if (mobileTab === 'ai') setMobileTab('teoria');
            }
        } catch (error) {
            console.error('Erro IA:', error);
            alert('Falha ao conectar com o Assistente de IA.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleInsertImage = (url: string) => {
        const newImg: CanvasElement = {
            id: crypto.randomUUID(),
            type: 'image',
            x: 100, y: 100, width: 300, height: 200, zIndex: elements.length + 1, rotation: 0,
            src: url,
            borderRadius: 0
        };
        setElements(prev => [...prev, newImg]);
    };

    // removed getPreviewWidthClasses

    const selectedModuleData = modules.find(m => m.slug_id === selectedModuleSlug);

    const quickAIPrompts = [
        { label: '📚 Introdução ao Tópico', prompt: 'Crie uma introdução envolvente sobre este tema' },
        { label: '📌 Pontos Chave', prompt: 'Crie um resumo em tópicos bullet points' },
        { label: '🤔 Caso Prático', prompt: 'Crie um pequeno estudo de caso ilustrativo' },
    ];

    return (
        <div className="bg-white/80 border border-warm-200 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-inner w-full h-full flex flex-col min-h-0 relative">
            
            {showPublishModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-md border border-warm-200 animate-scale-in">
                        <div className="flex items-center gap-3 mb-3 text-warm-900">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold">Publicar Alterações?</h3>
                                <p className="text-xs text-warm-500">Módulo: {selectedModuleData?.title}</p>
                            </div>
                        </div>
                        <p className="text-sm text-warm-600 mb-6 leading-relaxed">
                            O novo conteúdo e formatações deste módulo ficarão visíveis imediatamente para todos os usuários.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowPublishModal(false)} className="px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 font-medium rounded-xl text-sm transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmPublish} disabled={saving} className="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-md">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMediaLibrary && (
                <MediaLibrary onClose={() => setShowMediaLibrary(false)} onSelect={handleInsertImage} />
            )}

            {/* CABEÇALHO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 flex-shrink-0 gap-2 sm:gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-primary/10 text-primary rounded-xl">
                        <BookOpen size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-2xl font-bold text-warm-900">Conteúdo dos Módulos</h3>
                        <p className="hidden sm:block text-xs sm:text-sm text-warm-500">
                            Edite o material didático e os recursos interativos.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isDirty ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs sm:text-sm text-amber-700 font-medium animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Salvando rascunho...
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-sage-50 border border-sage-200 rounded-lg text-xs sm:text-sm text-sage-700 font-medium">
                            <CheckCircle2 size={16} /> Salvo
                        </div>
                    )}

                    {successMessage && (
                        <div className="px-3 py-1 bg-sage-50 text-sage-700 rounded-lg flex items-center gap-1.5 border border-sage-200 text-xs sm:text-sm font-semibold">
                            <CheckCircle2 size={14}/>
                            {successMessage}
                        </div>
                    )}

                    <button
                        onClick={() => setShowPublishModal(true)}
                        disabled={saving || !isDirty}
                        className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-sm ${
                            isDirty ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20' : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                        }`}
                    >
                        <Send size={15} /> Publicar
                    </button>
                </div>
            </div>

            {/* SELETOR DE MÓDULOS */}
            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 shrink-0">
                {modules.map((m) => (
                    <button
                        key={m.slug_id}
                        onClick={() => setSelectedModuleSlug(m.slug_id)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                            selectedModuleSlug === m.slug_id
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                        }`}
                    >
                        <FileText size={14} />
                        {m.title}
                    </button>
                ))}
            </div>

            {/* ABAS MOBILE */}
            <div className="flex xl:hidden mb-3 bg-warm-100 p-1 rounded-xl shrink-0">
                <button onClick={() => setMobileTab('teoria')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 ${mobileTab === 'teoria' ? 'bg-white text-primary shadow-sm' : 'text-warm-600'}`}>
                    <FileText size={15} /> Teoria
                </button>
                <button onClick={() => setMobileTab('recursos')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 ${mobileTab === 'recursos' ? 'bg-white text-purple-600 shadow-sm' : 'text-warm-600'}`}>
                    <Layers size={15} /> Recursos
                </button>
                <button onClick={() => setMobileTab('preview')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 ${mobileTab === 'preview' ? 'bg-white text-warm-900 shadow-sm' : 'text-warm-600'}`}>
                    <Eye size={15} /> Preview
                </button>
                <button onClick={() => setMobileTab('ai')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 ${mobileTab === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-warm-600'}`}>
                    <Bot size={15} /> Copiloto
                </button>
            </div>

            {/* ABAS DESKTOP */}
            <div className="hidden xl:flex bg-warm-100 p-1 rounded-xl mb-3 shrink-0 w-fit">
                <button onClick={() => setActiveEditorTab('teoria')} className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeEditorTab === 'teoria' ? 'bg-white shadow-sm text-primary' : 'text-warm-600 hover:text-warm-900'}`}>
                    <FileText size={16}/> Conteúdo Teórico
                </button>
                <button onClick={() => setActiveEditorTab('recursos')} className={`px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeEditorTab === 'recursos' ? 'bg-white shadow-sm text-purple-600' : 'text-warm-600 hover:text-warm-900'}`}>
                    <Layers size={16}/> Recursos Interativos
                </button>
            </div>

            <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
                
                {/* ÁREA CENTRAL: EDITOR, RECURSOS OU HISTÓRICO */}
                <div className={`flex flex-col h-full min-h-0 space-y-3 sm:space-y-4 w-full`}>
                    
                    {/* IA (Só aparece na aba Teoria ou Copiloto) */}
                    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-sm flex-shrink-0 transition-all ${mobileTab === 'recursos' || (window.innerWidth < 1280 && mobileTab !== 'ai') ? 'hidden' : 'p-3 sm:p-4'} ${activeEditorTab === 'recursos' && window.innerWidth >= 1280 ? 'hidden' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-purple-600" size={18}/>
                                <h4 className="font-bold text-purple-900 text-xs sm:text-sm">Copiloto IA</h4>
                            </div>
                            <button onClick={() => setAiExpanded(!aiExpanded)} className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1">
                                {aiExpanded ? <>Menos <ChevronUp size={14}/></> : <>Mais <ChevronDown size={14}/></>}
                            </button>
                        </div>
                        {aiExpanded && (
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {quickAIPrompts.map((item, idx) => (
                                    <button key={idx} onClick={() => { setAiPrompt(item.prompt); handleAIGenerate(item.prompt); }} disabled={generatingAI} className="text-[11px] sm:text-xs bg-white text-purple-800 border border-purple-200 px-2 py-1 rounded-lg shadow-2xs hover:shadow-xs active:scale-95">
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAIGenerate()} placeholder="Descreva o que a IA deve gerar..." disabled={generatingAI} className="flex-1 p-2 sm:p-2.5 text-xs sm:text-sm bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none disabled:opacity-60"/>
                            <button onClick={() => handleAIGenerate()} disabled={generatingAI || !aiPrompt.trim()} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white font-medium text-xs sm:text-sm rounded-xl flex gap-1.5 shadow-sm">
                                {generatingAI ? <Loader2 className="animate-spin" size={15}/> : <Send size={15}/>}
                                <span className="hidden sm:inline">Gerar</span>
                            </button>
                        </div>
                    </div>

                    {/* EDITOR VISUAL */}
                    <div className={`bg-white rounded-2xl border border-warm-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative ${(mobileTab === 'ai' || mobileTab === 'recursos' || (window.innerWidth >= 1280 && activeEditorTab === 'recursos')) ? 'hidden' : 'flex'}`}>
                        {loading && (
                            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={32}/>
                            </div>
                        )}
                        <div className="p-3 border-b border-warm-100 flex items-center justify-between shrink-0 bg-warm-50">
                            <label className="text-xs sm:text-sm font-bold text-warm-800 flex items-center gap-2">
                                <FileText size={16}/> Teoria do Módulo
                            </label>
                            <div className="flex gap-2">
                                <button onClick={() => setShowMediaLibrary(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 text-warm-700 text-xs font-bold rounded-lg hover:bg-warm-100 shadow-sm">
                                    <ImageIcon size={14}/> Mídia
                                </button>
                                <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 text-warm-700 text-xs font-bold rounded-lg hover:bg-warm-100 shadow-sm">
                                    <History size={14}/> Histórico
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 relative flex flex-col">
                            <CanvasWorkspace elements={elements} setElements={setElements} />
                        </div>
                    </div>

                    {/* CONSTRUTOR DE RECURSOS */}
                    <div className={`bg-white rounded-2xl border border-warm-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative ${mobileTab === 'recursos' || (window.innerWidth >= 1280 && activeEditorTab === 'recursos') ? 'flex' : 'hidden'}`}>
                        <InteractiveResourceBuilder moduleSlug={selectedModuleSlug} />
                    </div>
                </div>

                    {showHistory && (
                        <div className="absolute inset-0 z-50 flex-1 bg-white border border-warm-200 rounded-2xl flex flex-col overflow-hidden animate-fade-in shadow-inner">
                            <div className="p-4 bg-warm-800 text-white flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-2">
                                    <History size={18} />
                                    <h3 className="font-bold">Histórico do Módulo</h3>
                                </div>
                                <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-warm-700 rounded-md">
                                    <AlertTriangle size={18} className="hidden"/> Voltar
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 bg-warm-50">
                                {revisions.length === 0 ? (
                                    <p className="text-center text-warm-500 mt-10">Nenhuma versão salva ainda.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {revisions.map((rev) => (
                                            <div key={rev.id} className="bg-white p-4 border border-warm-200 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-bold text-warm-900 block text-sm">Publicado por {rev.author_name}</span>
                                                        <span className="text-xs text-warm-500">{rev.created_at}</span>
                                                    </div>
                                                    <button onClick={() => handleRestoreRevision(rev.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20">
                                                        <RotateCcw size={14} /> Restaurar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default ModuleContentEditor;
