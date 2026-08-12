import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FileText, CheckCircle2, Loader2, Save, Sparkles, Send,
    BookOpen, Layers, AlertTriangle,
    Bot, ChevronDown, ChevronUp, History, Image as ImageIcon, RotateCcw, X
} from 'lucide-react';
import DOMPurify from 'dompurify';

import { InteractiveResourceBuilder } from './InteractiveResourceBuilder';
import MediaLibrary from './MediaLibrary';
import { WixFloatingToolbar } from './WixFloatingToolbar';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

const cleanAIResponse = (response: string): string => {
    if (!response) return '';
    let html = response.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    if (!/\<[a-z][\s\S]*\>/i.test(html)) {
        html = html
            .split(/\n\s*\n+/)
            .map(paragraph => paragraph.trim())
            .filter(Boolean)
            .map(p => `<p>${p.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim()}</p>`)
            .join('');
    }
    return DOMPurify.sanitize(html);
};

const ModuleContentEditor: React.FC = () => {
    const { token } = useAuth();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');

    // Rich Text HTML content (replaces CanvasElement[])
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [originalContent, setOriginalContent] = useState<string>('');

    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Tabs
    const [activeTab, setActiveTab] = useState<'teoria' | 'recursos'>('teoria');

    // Modals & Panels
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [revisions, setRevisions] = useState<any[]>([]);

    // AI
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);
    const [aiExpanded, setAiExpanded] = useState(true);

    useEffect(() => {
        fetchModulesList();
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, []);

    const fetchModulesList = async () => {
        try {
            const res = await fetch(`${API_URL}/api/modules`);
            const data = await res.json();
            setModules(Array.isArray(data) ? data : []);
            if (data.length > 0) setSelectedModuleSlug(data[0].slug_id);
        } catch (error) { console.error("Erro ao buscar módulos:", error); }
    };

    const fetchRevisions = useCallback(async (slug: string) => {
        try {
            const pageName = `modulo_${slug}`;
            const res = await fetch(`${API_URL}/api/pages/${pageName}/revisions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRevisions(Array.isArray(data) ? data : []);
            }
        } catch (error) { console.error('Erro ao buscar revisões', error); }
    }, [token]);

    const fetchModuleContent = useCallback(async (slug: string) => {
        setLoading(true);
        setSuccessMessage('');
        setIsDirty(false);
        setHtmlContent('');
        setOriginalContent('');

        try {
            const pageName = `modulo_${slug}`;
            const res = await fetch(`${API_URL}/api/v1/cms/pages/${pageName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const raw = data.content || '';

                // Backwards compatibility: if the content is a JSON array (old CanvasElement format),
                // convert it to plain HTML. Otherwise, use it as-is.
                let content = raw;
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        // Convert old CanvasElement[] to HTML
                        content = parsed
                            .filter((el: any) => el.type === 'text' && el.content)
                            .map((el: any) => el.content)
                            .join('') || '';
                    }
                } catch {
                    // It's already HTML or plain text, use as-is
                }

                setHtmlContent(content);
                setOriginalContent(content);
                fetchRevisions(slug);
            }
        } catch (error) {
            console.error("Erro ao buscar conteúdo do módulo:", error);
            setHtmlContent('');
            setOriginalContent('');
        } finally {
            setLoading(false);
        }
    }, [token, fetchRevisions]);

    useEffect(() => {
        if (selectedModuleSlug) fetchModuleContent(selectedModuleSlug);
    }, [selectedModuleSlug, fetchModuleContent]);

    // Track dirty state via editor content
    const handleEditorInput = () => {
        if (editorRef.current) {
            const currentHtml = editorRef.current.innerHTML;
            setHtmlContent(currentHtml);
            setIsDirty(currentHtml !== originalContent);
        }
    };

    const showToast = (message: string) => {
        setSuccessMessage(message);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setSuccessMessage(''), 4000);
    };

    const handleConfirmPublish = async () => {
        if (saving) return;
        setSaving(true);
        setSuccessMessage('');

        // Get latest content from editor
        const contentToSave = editorRef.current?.innerHTML || htmlContent;

        try {
            const pageName = `modulo_${selectedModuleSlug}`;
            const res = await fetch(`${API_URL}/api/v1/cms/pages/${pageName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    content: contentToSave,
                    description: `Atualização via Editor de Texto - ${new Date().toLocaleString()}`
                })
            });

            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

            setOriginalContent(contentToSave);
            setHtmlContent(contentToSave);
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
                const content = data.content || '';
                setHtmlContent(content);
                setOriginalContent(content);
                if (editorRef.current) editorRef.current.innerHTML = content;
                setIsDirty(false);
                setShowHistory(false);
                showToast('Versão restaurada com sucesso!');
            }
        } catch {
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
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'Você é um assistente acadêmico. Escreva em formato HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong>). Não use inline styles nem markdown.' },
                        { role: 'user', content: promptToUse }
                    ]
                })
            });

            if (!res.ok) throw new Error('Falha na IA');
            const data = await res.json();
            const generatedHtml = cleanAIResponse(data.reply || '');

            if (generatedHtml && editorRef.current) {
                // Append to end of editor
                editorRef.current.innerHTML += generatedHtml;
                handleEditorInput();
                setAiPrompt('');
                showToast('Conteúdo IA inserido!');
            }
        } catch (error) {
            console.error('Erro IA:', error);
            alert('Falha ao conectar com o Assistente de IA.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleInsertImage = (url: string) => {
        if (editorRef.current) {
            const imgHtml = `<p><img src="${url}" style="max-width:100%; border-radius:8px; margin:8px 0;" /></p>`;
            editorRef.current.innerHTML += imgHtml;
            handleEditorInput();
            setShowMediaLibrary(false);
            showToast('Imagem inserida!');
        }
    };

    const selectedModuleData = modules.find(m => m.slug_id === selectedModuleSlug);

    const quickAIPrompts = [
        { label: '📚 Introdução ao Tópico', prompt: 'Crie uma introdução envolvente sobre este tema' },
        { label: '📌 Pontos Chave', prompt: 'Crie um resumo em tópicos bullet points' },
        { label: '🤔 Caso Prático', prompt: 'Crie um pequeno estudo de caso ilustrativo' },
    ];

    return (
        <div className="bg-white/80 border border-warm-200 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-inner w-full h-full flex flex-col min-h-0 relative">

            {/* ═══ PUBLISH MODAL ═══ */}
            {showPublishModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl w-full max-w-md border border-warm-200">
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
                            O novo conteúdo ficará visível imediatamente para todos os usuários.
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

            {/* ═══ MEDIA LIBRARY MODAL ═══ */}
            {showMediaLibrary && (
                <MediaLibrary onClose={() => setShowMediaLibrary(false)} onSelect={handleInsertImage} />
            )}

            {/* ═══ HEADER ═══ */}
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
                            Não salvo
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-sage-50 border border-sage-200 rounded-lg text-xs sm:text-sm text-sage-700 font-medium">
                            <CheckCircle2 size={16} /> Salvo
                        </div>
                    )}

                    {successMessage && (
                        <div className="px-3 py-1 bg-sage-50 text-sage-700 rounded-lg flex items-center gap-1.5 border border-sage-200 text-xs sm:text-sm font-semibold">
                            <CheckCircle2 size={14} />
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

            {/* ═══ MODULE SELECTOR ═══ */}
            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 shrink-0">
                {modules?.map((m) => (
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

            {/* ═══ TABS ═══ */}
            <div className="flex bg-warm-100 p-1 rounded-xl mb-3 shrink-0 w-fit">
                <button onClick={() => setActiveTab('teoria')} className={`px-5 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeTab === 'teoria' ? 'bg-white shadow-sm text-primary' : 'text-warm-600 hover:text-warm-900'}`}>
                    <FileText size={16} /> Conteúdo Teórico
                </button>
                <button onClick={() => setActiveTab('recursos')} className={`px-5 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeTab === 'recursos' ? 'bg-white shadow-sm text-purple-600' : 'text-warm-600 hover:text-warm-900'}`}>
                    <Layers size={16} /> Recursos Interativos
                </button>
            </div>

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative">

                {/* ─── THEORY TAB ─── */}
                {activeTab === 'teoria' && (
                    <div className="flex flex-col h-full min-h-0 space-y-3">

                        {/* AI Copilot */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-sm flex-shrink-0 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-purple-600" size={18} />
                                    <h4 className="font-bold text-purple-900 text-xs sm:text-sm">Copiloto IA</h4>
                                </div>
                                <button onClick={() => setAiExpanded(!aiExpanded)} className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1">
                                    {aiExpanded ? <>Menos <ChevronUp size={14} /></> : <>Mais <ChevronDown size={14} /></>}
                                </button>
                            </div>
                            {aiExpanded && (
                                <div className="flex flex-wrap gap-1.5 mb-2.5">
                                    {quickAIPrompts.map((item, idx) => (
                                        <button key={idx} onClick={() => { setAiPrompt(item.prompt); handleAIGenerate(item.prompt); }} disabled={generatingAI} className="text-[11px] sm:text-xs bg-white text-purple-800 border border-purple-200 px-2 py-1 rounded-lg shadow-2xs hover:shadow-xs active:scale-95 transition-all">
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text" value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
                                    placeholder="Descreva o que a IA deve gerar..."
                                    disabled={generatingAI}
                                    className="flex-1 p-2 sm:p-2.5 text-xs sm:text-sm bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none disabled:opacity-60"
                                />
                                <button onClick={() => handleAIGenerate()} disabled={generatingAI || !aiPrompt.trim()} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white font-medium text-xs sm:text-sm rounded-xl flex gap-1.5 shadow-sm hover:bg-purple-700 transition-colors disabled:opacity-50">
                                    {generatingAI ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                                    <span className="hidden sm:inline">Gerar</span>
                                </button>
                            </div>
                        </div>

                        {/* Rich Text Editor */}
                        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                </div>
                            )}

                            {/* Editor Toolbar */}
                            <div className="p-3 border-b border-warm-100 flex items-center justify-between shrink-0 bg-warm-50">
                                <label className="text-xs sm:text-sm font-bold text-warm-800 flex items-center gap-2">
                                    <FileText size={16} /> Teoria do Módulo
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowMediaLibrary(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 text-warm-700 text-xs font-bold rounded-lg hover:bg-warm-100 shadow-sm transition-colors">
                                        <ImageIcon size={14} /> Mídia
                                    </button>
                                    <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-warm-200 text-warm-700 text-xs font-bold rounded-lg hover:bg-warm-100 shadow-sm transition-colors">
                                        <History size={14} /> Histórico
                                    </button>
                                </div>
                            </div>

                            {/* ContentEditable Rich Text Area */}
                            <div className="flex-1 min-h-0 overflow-y-auto relative">
                                <WixFloatingToolbar />
                                <div
                                    ref={editorRef}
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    onInput={handleEditorInput}
                                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                                    className="p-6 sm:p-8 min-h-full prose prose-warm max-w-none outline-none focus:outline-none text-warm-800 leading-relaxed"
                                    style={{ minHeight: '300px' }}
                                    data-placeholder="Comece a escrever o conteúdo teórico do módulo aqui..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── RESOURCES TAB ─── */}
                {activeTab === 'recursos' && (
                    <div className="bg-white rounded-2xl border border-warm-200 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative">
                        <InteractiveResourceBuilder moduleSlug={selectedModuleSlug} />
                    </div>
                )}

                {/* ─── HISTORY OVERLAY ─── */}
                {showHistory && (
                    <div className="absolute inset-0 z-50 bg-white border border-warm-200 rounded-2xl flex flex-col overflow-hidden animate-fade-in shadow-inner">
                        <div className="p-4 bg-warm-800 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <History size={18} />
                                <h3 className="font-bold">Histórico do Módulo</h3>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-1.5 hover:bg-warm-700 rounded-md transition-colors flex items-center gap-1 text-sm">
                                <X size={16} /> Fechar
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-warm-50">
                            {revisions.length === 0 ? (
                                <p className="text-center text-warm-500 mt-10">Nenhuma versão salva ainda.</p>
                            ) : (
                                <div className="space-y-4">
                                    {revisions?.map((rev) => (
                                        <div key={rev.id} className="bg-white p-4 border border-warm-200 rounded-xl shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-warm-900 block text-sm">Publicado por {rev.author_name}</span>
                                                    <span className="text-xs text-warm-500">{rev.created_at}</span>
                                                </div>
                                                <button onClick={() => handleRestoreRevision(rev.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-colors">
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
