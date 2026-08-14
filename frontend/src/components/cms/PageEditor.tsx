import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, ArrowLeft, Sparkles, X, Layers, Image as ImageIcon, Settings,
    CheckCircle2, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Type, Minus,
    Bot, Send, Crop, RotateCcw, RotateCw, Monitor, Tablet, Smartphone,
    Globe, Share2, AlertCircle, RefreshCw, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Underline, Strikethrough, Pipette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlockRenderer from './blocks/BlockRenderer';
import MediaLibrary from './MediaLibrary';
import ImageCropperModal from './ImageCropperModal';
import ModuleEditor from './ModuleEditor';
import WixFloatingToolbar from './WixFloatingToolbar';
import type { BlockData } from './blocks/types';

const API_URL =
import.meta.env.VITE_API_URL ||
(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
? 'http://127.0.0.1:8000'
: 'https://palieduca.onrender.com');

const PAGES_AVAILABLE = [
{ id: 'modulos', label: 'Página de Módulos' },
{ id: 'biblioteca', label: 'Página da Biblioteca' },
{ id: 'glossario', label: 'Página do Glossário' },
{ id: 'home', label: 'Página Inicial (Home)' }
];

const BLOCK_TEMPLATES: { type: BlockData['type']; label: string; icon: React.ReactNode; description: string; defaultData: any }[] = [
{
type: 'HeroBlock', label: 'Hero Section', icon: <Sparkles size={20} />, description: 'Banner principal com imagem de fundo',
defaultData: { title: 'Novo Hero', subtitle: 'Subtítulo descritivo', bgImage: '' }
},
{
type: 'ModulesGridBlock', label: 'Grade de Módulos', icon: <Layers size={20} />, description: 'Grid dinâmico com os módulos ativos',
defaultData: { title: 'Nossos Módulos', intro: 'Explore o conteúdo disponível.' }
},
{
type: 'TextBlock', label: 'Bloco de Texto', icon: <Type size={20} />, description: 'Parágrafo de texto rico editável',
defaultData: { content: '<p>Clique para editar este bloco de texto. Use <strong>negrito</strong>, <em>itálico</em> e muito mais.</p>' }
},
{
type: 'SpacerBlock', label: 'Espaçador', icon: <Minus size={20} />, description: 'Espaçamento visual entre seções',
defaultData: {}
},
{
type: 'ImageBlock', label: 'Imagem', icon: <ImageIcon size={20} />, description: 'Adicione uma imagem destacada',
defaultData: { src: '', alt: 'Imagem', caption: '' }
},
{
type: 'FeatureCardsBlock', label: 'Cards com Ícones', icon: <Sparkles size={20} className="text-emerald-500" />, description: 'Cards de tópicos com ícones selecionáveis',
defaultData: {
cards: [
{ id: '1', icon_name: 'HeartHandshake', iconColor: '#059669', iconBg: '#ecfdf5', badge: 'Módulo 1', title: 'Fundamentos dos Cuidados Paliativos', description: 'Princípios, conceitos e diretrizes.' },
{ id: '2', icon_name: 'MessageSquare', iconColor: '#d97706', iconBg: '#fef3c7', badge: 'Módulo 2', title: 'Comunicação', description: 'Habilidades de comunicação terapêutica.' },
{ id: '3', icon_name: 'Scale', iconColor: '#2563eb', iconBg: '#eff6ff', badge: 'Módulo 3', title: 'Bioética', description: 'Princípios éticos e autonomia do paciente.' }
]
}
}
];

const PageEditor: React.FC = () => {
const { token } = useAuth();
const navigate = useNavigate();

const [selectedPage, setSelectedPage] = useState<string>('modulos');
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

// ─── SEO & Social Share State ───
const [metaTitle, setMetaTitle] = useState('');
const [metaDescription, setMetaDescription] = useState('');
const [ogImage, setOgImage] = useState('');

const [isDirty, setIsDirty] = useState(false);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

const [showPublishModal, setShowPublishModal] = useState(false);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// Canva Sidebar State
const [leftSidebarTab, setLeftSidebarTab] = useState<'blocos' | 'midia' | 'configs' | null>('blocos');

// AI Copilot States
const [rightSidebarTab, setRightSidebarTab] = useState<'properties' | 'ai'>('properties');
const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
    { role: 'assistant', content: 'Olá! Sou a IA do Palieduca. Como posso ajudar você a escrever o conteúdo dos blocos hoje?' }
]);
const [chatInput, setChatInput] = useState('');
const [isChatLoading, setIsChatLoading] = useState(false);
const [croppingImage, setCroppingImage] = useState<string | null>(null);

const chatEndRef = useRef<HTMLDivElement>(null);
const [showModuleEditor, setShowModuleEditor] = useState(false);

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

// Check for local draft on page change
useEffect(() => {
    const saved = localStorage.getItem(`palieduca_draft_page_${selectedPage}`);
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
}, [selectedPage]);

// Auto-save local draft
useEffect(() => {
    if (isDirty && blocks.length > 0) {
        localStorage.setItem(`palieduca_draft_page_${selectedPage}`, JSON.stringify({
            blocks,
            seoData: { metaTitle, metaDescription, ogImage },
            timestamp: Date.now()
        }));
    }
}, [blocks, isDirty, selectedPage, metaTitle, metaDescription, ogImage]);

const restoreLocalDraft = () => {
    const saved = localStorage.getItem(`palieduca_draft_page_${selectedPage}`);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.blocks) {
                setBlocksWithHistory(parsed.blocks);
                if (parsed.seoData) {
                    if (parsed.seoData.metaTitle) setMetaTitle(parsed.seoData.metaTitle);
                    if (parsed.seoData.metaDescription) setMetaDescription(parsed.seoData.metaDescription);
                    if (parsed.seoData.ogImage) setOgImage(parsed.seoData.ogImage);
                }
                showToast('Rascunho local recuperado com sucesso!');
            }
        } catch { alert('Erro ao ler rascunho local.'); }
    }
    setHasLocalDraft(false);
};

const discardLocalDraft = () => {
    localStorage.removeItem(`palieduca_draft_page_${selectedPage}`);
    setHasLocalDraft(false);
    showToast('Rascunho local descartado.');
};

// Scroll to bottom of chat
useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [chatMessages]);

const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const systemPrompt = {
            role: 'system',
            content: `Você é um assistente do editor de páginas (CMS). Quando o usuário pedir para criar um bloco (como um texto, hero section, espaçador, ou imagem), VOCÊ DEVE retornar NO FINAL da sua resposta um bloco de código JSON começando com \`\`\`json. O JSON deve ser: { "action": "ADD_BLOCK", "type": "[HeroBlock|TextBlock|SpacerBlock|ImageBlock]", "data": { ... } }. Para HeroBlock, use "title", "subtitle". Para TextBlock, use "content" (com tags html). Para ImageBlock, use "alt" e "caption" se desejar. Explique o que fez no texto normal.`
        };

        const res = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [systemPrompt, ...updatedMessages] })
        });

        if (res.ok) {
            const data = await res.json();
            let replyContent = data.reply;
            
            // Verifica se há comando JSON na resposta
            const jsonMatch = replyContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const cmd = JSON.parse(jsonMatch[1]);
                    if (cmd.action === 'ADD_BLOCK') {
                        addBlock(cmd.type, cmd.data);
                    }
                    replyContent = replyContent.replace(/```json\n[\s\S]*?\n```/, '').trim();
                } catch(e) {
                    console.error("Erro ao fazer parse do comando JSON", e);
                }
            }

            setChatMessages([...updatedMessages, { role: 'assistant', content: replyContent || 'Ação executada com sucesso!' }]);
        } else {
            setChatMessages([...updatedMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro de conexão com a IA.' }]);
        }
    } catch (error) {
        setChatMessages([...updatedMessages, { role: 'assistant', content: 'Desculpe, não consegui conectar ao servidor.' }]);
    } finally {
        setIsChatLoading(false);
    }
};

// ─── Data Fetching ───
const fetchPageContent = async (pageName: string) => {
setLoading(true);
setBlocks([]);
setOriginalBlocks([]);
setHistory([]);
setFuture([]);
setSelectedBlockId(null);

try {
const res = await fetch(`${API_URL}/api/pages/${pageName}/edit`, {
headers: { Authorization: `Bearer ${token}` }
});

if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

const data = await res.json();
const contentToParse = data.draft_content || data.content || '';

setMetaTitle(data.meta_title || (pageName === 'home' ? 'Palieduca | Cuidados Paliativos na Prática' : `Palieduca | ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`));
setMetaDescription(data.meta_description || 'Plataforma educacional interativa dedicada ao ensino prático e humanizado de cuidados paliativos para profissionais e estudantes de saúde.');
setOgImage(data.slug || '');

let parsed: any[] = [];
try {
parsed = JSON.parse(contentToParse);
if (!Array.isArray(parsed)) parsed = [];
} catch { parsed = []; }

if (parsed.length === 0) {
    if (pageName === 'home' || pageName === 'modulos') {
        parsed = [
            { id: 'block-1', type: 'HeroBlock' as const, data: { title: 'Transforme o Conhecimento em Prática', subtitle: 'Uma plataforma dedicada ao aprimoramento contínuo em cuidados paliativos.', bgImage: '' } },
            { id: 'block-2', type: 'ModulesGridBlock' as const, data: { title: 'Explore Nossos Módulos', intro: 'Acesse o conteúdo selecionado por especialistas.' } }
        ];
    } else if (pageName === 'biblioteca') {
        parsed = [
            { id: 'block-1', type: 'TextBlock' as const, data: { content: '<h1>Biblioteca Digital</h1><p>Nossos recursos educacionais.</p>' } }
        ];
    } else if (pageName === 'glossario') {
        parsed = [
            { id: 'block-1', type: 'TextBlock' as const, data: { content: '<h1>Glossário</h1><p>Encontre aqui o significado dos principais termos médicos.</p>' } }
        ];
    } else {
        parsed = [
            { id: 'block-1', type: 'TextBlock' as const, data: { content: `<h1>Página ${pageName}</h1>` } }
        ];
    }
}

setBlocks(parsed);
setOriginalBlocks(parsed);
} catch (error) {
console.error('Erro ao buscar conteúdo:', error);
} finally {
setLoading(false);
}
};

useEffect(() => { fetchPageContent(selectedPage); }, [selectedPage, token]);
useEffect(() => { setIsDirty(JSON.stringify(blocks) !== JSON.stringify(originalBlocks)); }, [blocks, originalBlocks]);

// ─── Actions ───
const showToast = (msg: string) => {
setSuccessMessage(msg);
if (timeoutRef.current) clearTimeout(timeoutRef.current);
timeoutRef.current = setTimeout(() => setSuccessMessage(''), 4000);
};

const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
        const draftEndpoint = `${API_URL}/api/pages/${selectedPage}/draft`;
        const draftRes = await fetch(draftEndpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                draft_content: JSON.stringify(blocks),
                meta_title: metaTitle,
                meta_description: metaDescription,
                slug: ogImage
            })
        });

        if (!draftRes.ok) throw new Error('Falha ao salvar rascunho');

        if (publish) {
            const publishEndpoint = `${API_URL}/api/pages/${selectedPage}/publish`;
            const publishRes = await fetch(publishEndpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!publishRes.ok) throw new Error('Falha ao publicar');
        }

        setOriginalBlocks(blocks);
        setIsDirty(false);
        localStorage.removeItem(`palieduca_draft_page_${selectedPage}`);
        setHasLocalDraft(false);
        if (publish) setShowPublishModal(false);
        showToast(publish ? 'Publicado com sucesso!' : 'Rascunho salvo!');
    } catch (error) {
        console.error(error);
        alert('Falha ao salvar. Tente novamente.');
    } finally { setSaving(false); }
};

const addBlock = (type: BlockData['type'], initialData?: any) => {
const template = BLOCK_TEMPLATES.find(t => t.type === type);
if (!template) return;
const newBlock: BlockData = { 
    id: `block-${Date.now()}`, 
    type, 
    data: initialData ? { ...template.defaultData, ...initialData } : { ...template.defaultData } 
};
setBlocksWithHistory(prev => [...prev, newBlock]);
setIsDirty(true);
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
const copy = [...prev];
[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
return copy;
});
};

const duplicateBlock = (id: string) => {
const block = blocks.find(b => b.id === id);
if (!block) return;
const idx = blocks.findIndex(b => b.id === id);
const clone: BlockData = { ...block, id: `block-${Date.now()}`, data: { ...block.data }, styles: block.styles ? { ...block.styles } : undefined };
const copy = [...blocks];
copy.splice(idx + 1, 0, clone);
setBlocksWithHistory(copy);
setSelectedBlockId(clone.id);
};

const deleteBlock = (id: string) => {
setBlocksWithHistory(prev => prev.filter(b => b.id !== id));
if (selectedBlockId === id) setSelectedBlockId(null);
};

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
if (!selectedBlockId) return;
const file = e.target.files?.[0];
if (!file) return;

const formData = new FormData();
formData.append('file', file);

try {
const res = await fetch(`${API_URL}/api/media/upload`, {
method: 'POST',
headers: { 'Authorization': `Bearer ${token}` },
body: formData
});
if (res.ok) {
const data = await res.json();
const block = blocks.find(b => b.id === selectedBlockId);
if (block) {
updateBlock(selectedBlockId, { data: { ...block.data, bgImage: data.file_url } });
showToast('Imagem enviada!');
}
} else { alert('Falha ao enviar imagem.'); }
} catch (error) {
console.error('Erro no upload:', error);
alert('Erro ao enviar a imagem.');
}
};

const selectedBlock = blocks.find(b => b.id === selectedBlockId);
const selectedBlockIndex = blocks.findIndex(b => b.id === selectedBlockId);

// ─── Render ───
return (
<div className="bg-[#f0f2f5] h-full flex flex-col overflow-hidden font-sans rounded-xl border border-warm-200 relative">
{/* ═══ HEADER ═══ */}
<div className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 gap-2">
{/* Left: Page Select & Dirty status */}
<div className="flex items-center gap-2 sm:gap-3">
<button onClick={() => navigate('/perfil')} className="p-2 text-warm-500 hover:text-warm-900 hover:bg-warm-100 rounded-lg transition-colors">
<ArrowLeft size={18} />
</button>
<div className="h-5 w-px bg-warm-200 hidden sm:block" />
<select
value={selectedPage}
onChange={(e) => setSelectedPage(e.target.value)}
className="bg-warm-50 border border-warm-200 text-warm-900 font-bold rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none max-w-[150px] sm:max-w-none"
>
{PAGES_AVAILABLE.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
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

{/* Right: Save & Publish */}
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
<Save size={14} /> Publicar
</button>
</div>
</div>

{/* ═══ EMERGENCY DRAFT RECOVERY BANNER ═══ */}
{hasLocalDraft && (
<div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between z-40 text-xs shadow-md animate-slide-down">
    <div className="flex items-center gap-2 font-medium">
        <AlertCircle size={16} className="shrink-0 animate-bounce" />
        <span>Existe um rascunho salvo localmente neste navegador {localDraftTimestamp && `(às ${localDraftTimestamp})`}.</span>
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
    {/* Primary Narrow Icon Bar */}
    <div className="w-[72px] bg-warm-900 flex flex-col items-center py-4 gap-4 z-50 shadow-md">
        <button
            onClick={() => setLeftSidebarTab(leftSidebarTab === 'blocos' ? null : 'blocos')}
            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${
                leftSidebarTab === 'blocos' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'
            }`}
        >
            <Layers size={22} className={leftSidebarTab === 'blocos' ? 'drop-shadow-md' : ''} />
            <span className="text-[10px] font-medium tracking-wide">Blocos</span>
        </button>
        
        <button
            onClick={() => setLeftSidebarTab(leftSidebarTab === 'midia' ? null : 'midia')}
            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${
                leftSidebarTab === 'midia' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'
            }`}
        >
            <ImageIcon size={22} className={leftSidebarTab === 'midia' ? 'drop-shadow-md' : ''} />
            <span className="text-[10px] font-medium tracking-wide">Uploads</span>
        </button>

        <button
            onClick={() => setLeftSidebarTab(leftSidebarTab === 'configs' ? null : 'configs')}
            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${
                leftSidebarTab === 'configs' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'
            }`}
        >
            <Globe size={22} className={leftSidebarTab === 'configs' ? 'drop-shadow-md' : ''} />
            <span className="text-[10px] font-medium tracking-wide">SEO</span>
        </button>
    </div>

    {/* Secondary Expanding Panel */}
    <div className={`bg-white border-r border-warm-200 flex flex-col z-40 overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${
        leftSidebarTab !== null ? 'w-[340px] opacity-100' : 'w-0 opacity-0 border-r-0'
    }`}>
        {leftSidebarTab === 'blocos' && (
            <>
                <div className="p-4 border-b border-warm-100 flex items-center justify-between gap-2 bg-white shrink-0">
                    <h3 className="text-sm font-bold text-warm-800">Modelos e Seções</h3>
                    <button onClick={() => setLeftSidebarTab(null)} className="p-1 hover:bg-warm-100 rounded-md text-warm-400 hover:text-warm-700">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar">
                    <p className="text-xs text-warm-500 mb-1 leading-relaxed">Clique nos blocos abaixo para adicioná-los ao fim da sua página.</p>
                    {BLOCK_TEMPLATES.map(tmpl => (
                        <button
                            key={tmpl.type}
                            onClick={() => addBlock(tmpl.type)}
                            className="flex flex-col items-start p-3.5 bg-white border border-warm-200 rounded-xl hover:border-primary hover:shadow-md transition-all group text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                            <div className="flex items-center gap-3 w-full mb-2">
                                <div className="p-2 bg-warm-50 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                    {tmpl.icon}
                                </div>
                                <div className="text-sm font-bold text-warm-800 group-hover:text-primary transition-colors">{tmpl.label}</div>
                            </div>
                            <div className="text-[11px] text-warm-500 leading-relaxed pr-2">{tmpl.description}</div>
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

        {leftSidebarTab === 'configs' && (
            <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-warm-100">
                    <div>
                        <h3 className="text-sm font-bold text-warm-900 flex items-center gap-2">
                            <Globe size={18} className="text-primary" />
                            SEO & Compartilhamento
                        </h3>
                        <p className="text-[11px] text-warm-500">Como esta página aparece no Google e WhatsApp.</p>
                    </div>
                    <button onClick={() => setLeftSidebarTab(null)} className="p-1 hover:bg-warm-100 rounded-md text-warm-400 hover:text-warm-700">
                        <X size={16} />
                    </button>
                </div>

                {/* SEO Input Fields */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-warm-700">Título da Página (Google)</label>
                            <span className={`text-[10px] ${metaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-warm-400'}`}>
                                {metaTitle.length}/60
                            </span>
                        </div>
                        <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => { setMetaTitle(e.target.value); setIsDirty(true); }}
                            placeholder="Ex: Palieduca | Cuidados Paliativos na Prática"
                            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-warm-700">Descrição Resumida (Meta Description)</label>
                            <span className={`text-[10px] ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-warm-400'}`}>
                                {metaDescription.length}/160
                            </span>
                        </div>
                        <textarea
                            value={metaDescription}
                            onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
                            placeholder="Breve resumo da página para quem buscar no Google ou receber no WhatsApp..."
                            rows={3}
                            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-warm-700 block mb-1.5">Imagem de Capa (WhatsApp / Redes Sociais)</label>
                        {ogImage ? (
                            <div className="space-y-2">
                                <div className="relative rounded-xl overflow-hidden h-28 border border-warm-200 shadow-sm group">
                                    <img src={ogImage} alt="Social Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => { setOgImage(''); setIsDirty(true); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setCroppingImage(ogImage)}
                                    className="w-full py-1.5 bg-primary/10 text-primary font-bold text-xs rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Crop size={14} /> Recortar Imagem de Capa
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-warm-300 rounded-xl hover:border-primary cursor-pointer bg-warm-50 transition-colors">
                                <ImageIcon size={22} className="text-warm-400 mb-1" />
                                <span className="text-xs font-bold text-warm-700">Enviar Imagem de Capa</span>
                                <span className="text-[10px] text-warm-400">Recomendado: 1200x630px</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        try {
                                            const res = await fetch(`${API_URL}/api/media/upload`, {
                                                method: 'POST',
                                                headers: { Authorization: `Bearer ${token}` },
                                                body: formData
                                            });
                                            if (res.ok) {
                                                const data = await res.json();
                                                setOgImage(data.file_url);
                                                setIsDirty(true);
                                                showToast('Imagem de capa atualizada!');
                                            }
                                        } catch { alert('Erro no envio da imagem.'); }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Visual Simulation Cards */}
                <div className="space-y-4 pt-4 border-t border-warm-100">
                    <p className="text-xs font-bold text-warm-900 uppercase tracking-wider">Simulações em Tempo Real</p>
                    
                    {/* Google SERP Preview */}
                    <div className="bg-white p-3.5 rounded-xl border border-warm-200 shadow-sm space-y-1 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                            <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">P</div>
                            <span>palieduca.com.br</span>
                            <span className="text-slate-400">› {selectedPage}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                            {metaTitle || 'Palieduca | Cuidados Paliativos'}
                        </h4>
                        <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                            {metaDescription || 'Plataforma educacional interativa dedicada ao ensino prático e humanizado de cuidados paliativos.'}
                        </p>
                    </div>

                    {/* WhatsApp Chat Card Preview */}
                    <div className="bg-[#0b141a] p-3 rounded-2xl shadow-md text-left text-white max-w-[280px]">
                        <div className="bg-[#1f2c34] rounded-xl overflow-hidden border border-[#2a3942]">
                            {ogImage ? (
                                <div className="h-28 w-full bg-[#111b21] overflow-hidden">
                                    <img src={ogImage} alt="WhatsApp Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-24 w-full bg-[#111b21] flex flex-col items-center justify-center text-slate-400 text-xs">
                                    <Share2 size={20} className="mb-1 opacity-50" />
                                    <span>Sem imagem destacada</span>
                                </div>
                            )}
                            <div className="p-2.5 space-y-1">
                                <p className="text-xs font-bold text-[#e9edef] line-clamp-1">
                                    {metaTitle || 'Palieduca'}
                                </p>
                                <p className="text-[10px] text-[#8696a0] line-clamp-2 leading-tight">
                                    {metaDescription || 'Acesse o conteúdo no Palieduca.'}
                                </p>
                                <p className="text-[9px] text-[#00a884] font-medium pt-0.5">
                                    palieduca.com.br
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
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
<div className={`transition-all duration-300 ${
    deviceView === 'desktop' 
        ? 'max-w-6xl w-full flex flex-col gap-3 pb-32'
        : deviceView === 'tablet'
        ? 'w-[768px] max-w-full bg-white rounded-3xl shadow-2xl border-4 border-warm-300 p-4 sm:p-6 min-h-[850px] my-auto flex flex-col gap-3 pb-32'
        : 'w-[390px] max-w-full bg-white rounded-[40px] shadow-2xl border-[10px] border-warm-900 p-3 sm:p-4 min-h-[750px] my-auto relative flex flex-col gap-3 pb-32 overflow-hidden'
}`}>
{/* Smartphone Notch / Top bar */}
{deviceView === 'mobile' && (
    <div className="w-28 h-4 bg-warm-900 mx-auto rounded-b-xl mb-2 shrink-0 z-30 shadow-inner" />
)}

{loading ? (
<div className="flex justify-center items-center h-64">
<Loader2 className="animate-spin text-primary" size={32} />
</div>
) : (
blocks?.map((block, idx) => (
<div key={block.id} className="relative group">
{/* Block Order Controls — visible on hover or select */}
<div className={`absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 transition-opacity ${
selectedBlockId === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
}`}>
<button
onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
disabled={idx === 0}
className="p-1 bg-white border border-warm-200 rounded-md hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-warm-400 text-warm-500 transition-all shadow-sm"
>
<ChevronUp size={14} />
</button>
<button
onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
disabled={idx === blocks.length - 1}
className="p-1 bg-white border border-warm-200 rounded-md hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-warm-400 text-warm-500 transition-all shadow-sm"
>
<ChevronDown size={14} />
</button>
</div>

<BlockRenderer
block={block}
isEditing={true}
isSelected={selectedBlockId === block.id}
onUpdate={updateBlock}
onSelect={setSelectedBlockId}
/>
</div>
))
)}

{!loading && blocks.length === 0 && (
<div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-warm-300 rounded-3xl bg-white/60 text-warm-500">
<Layers size={48} className="mb-4 opacity-40" />
<p className="text-lg font-medium">Sua página está vazia.</p>
</div>
)}
</div>
</div>

{/* ─── RIGHT SIDEBAR ─── */}
<div className="w-80 bg-white border-l border-warm-200 flex flex-col z-40 shrink-0">
    <div className="flex border-b border-warm-100 bg-warm-50 shrink-0">
        <button 
            onClick={() => setRightSidebarTab('properties')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold transition-colors ${
                rightSidebarTab === 'properties' ? 'bg-white text-primary border-b-2 border-primary' : 'text-warm-500 hover:text-warm-700'
            }`}
        >
            <Settings size={16} /> Propriedades
        </button>
        <button 
            onClick={() => setRightSidebarTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-bold transition-colors ${
                rightSidebarTab === 'ai' ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-warm-500 hover:text-warm-700'
            }`}
        >
            <Bot size={16} /> Assistente IA
        </button>
    </div>

    {rightSidebarTab === 'ai' ? (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-warm-200 text-warm-800 rounded-tl-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-warm-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-warm-200 bg-white">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Peça ideias para o bloco..."
                        className="w-full bg-warm-50 border border-warm-200 rounded-full pl-4 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-shadow"
                        disabled={isChatLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-1.5 p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 transition-colors"
                    >
                        <Send size={14} className="ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    ) : (
        <div className="p-4 flex-1 overflow-y-auto">
            {!selectedBlock ? (
                <div className="text-center text-warm-400 mt-12 space-y-2">
                    <Settings size={32} className="mx-auto opacity-30" />
                    <p className="text-sm font-medium">Nenhum bloco selecionado</p>
                    <p className="text-xs">Clique em uma seção no canvas.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                            {BLOCK_TEMPLATES.find(t => t.type === selectedBlock.type)?.label || selectedBlock.type}
                        </span>
                        <span className="text-[10px] text-warm-400">#{selectedBlockIndex + 1}</span>
                    </div>

                    <div className="flex gap-1.5">
                        <button onClick={() => moveBlock(selectedBlock.id, 'up')} disabled={selectedBlockIndex === 0} className="flex-1 flex items-center justify-center gap-1 p-2 bg-warm-50 border border-warm-200 rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-30 text-xs font-medium transition-colors">
                            <ChevronUp size={14} /> Subir
                        </button>
                        <button onClick={() => moveBlock(selectedBlock.id, 'down')} disabled={selectedBlockIndex === blocks.length - 1} className="flex-1 flex items-center justify-center gap-1 p-2 bg-warm-50 border border-warm-200 rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-30 text-xs font-medium transition-colors">
                            <ChevronDown size={14} /> Descer
                        </button>
                        <button onClick={() => duplicateBlock(selectedBlock.id)} className="p-2 bg-warm-50 border border-warm-200 rounded-lg text-warm-600 hover:bg-warm-100 transition-colors" title="Duplicar">
                            <Copy size={14} />
                        </button>
                    </div>

                    <hr className="border-warm-100" />

                    {selectedBlock.type === 'HeroBlock' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Conteúdo</h4>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={selectedBlock.data.title || ''}
                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, title: e.target.value } })}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Subtítulo</label>
                                <textarea
                                    value={selectedBlock.data.subtitle || ''}
                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, subtitle: e.target.value } })}
                                    rows={3}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                />
                            </div>

                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider pt-2">Estilo</h4>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Imagem de Fundo</label>
                                <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-warm-300 rounded-xl hover:bg-warm-50 hover:border-primary cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-2 text-warm-500 group-hover:text-primary">
                                        <ImageIcon size={18} />
                                        <span className="text-xs font-medium">Upload Imagem</span>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                                {selectedBlock.data.bgImage && (
                                    <div className="mt-2 relative rounded-lg overflow-hidden h-20 border border-warm-200">
                                        <img src={selectedBlock.data.bgImage} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, bgImage: '' } })}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                                {selectedBlock.data.bgImage && (
                                    <button 
                                        onClick={() => setCroppingImage(selectedBlock.data.bgImage)}
                                        className="w-full mt-2 px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Crop size={16} /> Recortar Imagem
                                    </button>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Opacidade do Overlay</label>
                                <input
                                    type="range" min="0" max="100"
                                    value={selectedBlock.styles?.bgOverlayOpacity ?? 40}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, bgOverlayOpacity: parseInt(e.target.value) } })}
                                    className="w-full accent-primary"
                                />
                                <div className="text-[10px] text-right text-warm-400">{selectedBlock.styles?.bgOverlayOpacity ?? 40}%</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1.5">Alinhamento</label>
                                <div className="flex gap-1">
                                    {[
                                        { value: 'left', icon: <AlignLeft size={14} /> },
                                        { value: 'center', icon: <AlignCenter size={14} /> },
                                        { value: 'right', icon: <AlignRight size={14} /> }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, titleAlign: opt.value } })}
                                            className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center ${
                                                (selectedBlock.styles?.titleAlign || 'center') === opt.value
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-warm-50 border-warm-200 text-warm-500 hover:bg-warm-100'
                                            }`}
                                        >
                                            {opt.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedBlock.type === 'ModulesGridBlock' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Conteúdo</h4>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Título da Seção</label>
                                <input
                                    type="text"
                                    value={selectedBlock.data.title || ''}
                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, title: e.target.value } })}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Introdução</label>
                                <textarea
                                    value={selectedBlock.data.intro || ''}
                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, intro: e.target.value } })}
                                    rows={2}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                />
                            </div>
                            <div className="bg-warm-50 p-4 rounded-xl border border-warm-200 mt-2">
                                <p className="text-[11px] text-warm-500 mb-3">
                                    Os módulos são carregados dinamicamente do banco de dados.
                                </p>
                                <button
                                    onClick={() => setShowModuleEditor(true)}
                                    className="w-full py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                                >
                                    Gerenciar Módulos
                                </button>
                            </div>

                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider pt-2">Estilo</h4>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-2">Cor de Fundo</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'transparent', label: 'Padrão', color: '#f3f4f6' },
                                        { value: '#ffffff', label: 'Branco', color: '#ffffff' },
                                        { value: '#f8fafc', label: 'Cinza', color: '#f8fafc' },
                                        { value: '#fff5f0', label: 'Quente', color: '#fff5f0' },
                                        { value: '#f0f9ff', label: 'Azul', color: '#f0f9ff' }
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, bgColor: opt.value } })}
                                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                                (selectedBlock.styles?.bgColor || 'transparent') === opt.value
                                                    ? 'border-primary shadow-md'
                                                    : 'border-warm-200'
                                            }`}
                                            style={{ backgroundColor: opt.color }}
                                            title={opt.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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

                    {selectedBlock.type === 'SpacerBlock' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Altura</h4>
                            <div>
                                <input
                                    type="range" min="20" max="200"
                                    value={selectedBlock.styles?.height ?? 60}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, height: parseInt(e.target.value) } })}
                                    className="w-full accent-primary"
                                />
                                <div className="text-[10px] text-right text-warm-400">{selectedBlock.styles?.height ?? 60}px</div>
                            </div>
                        </div>
                    )}

                    {selectedBlock.type === 'ImageBlock' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Estilo da Imagem</h4>
                            {selectedBlock.data.src && (
                                <button 
                                    onClick={() => setCroppingImage(selectedBlock.data.src)}
                                    className="w-full mb-4 px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Crop size={16} /> Recortar Imagem
                                </button>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Preenchimento (Object Fit)</label>
                                <select
                                    value={selectedBlock.styles?.objectFit || 'cover'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, objectFit: e.target.value } })}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="cover">Preencher (Corta bordas)</option>
                                    <option value="contain">Conter (Mostra inteira)</option>
                                    <option value="fill">Esticar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Bordas Arredondadas</label>
                                <select
                                    value={selectedBlock.styles?.rounded || 'xl'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, rounded: e.target.value } })}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="none">Quadrado</option>
                                    <option value="md">Suave</option>
                                    <option value="xl">Médio</option>
                                    <option value="2xl">Grande</option>
                                    <option value="full">Círculo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Altura Máxima</label>
                                <input
                                    type="range" min="100" max="800" step="50"
                                    value={selectedBlock.styles?.height ?? 400}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, height: parseInt(e.target.value) } })}
                                    className="w-full accent-primary"
                                />
                                <div className="text-[10px] text-right text-warm-400">{selectedBlock.styles?.height ?? 400}px</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Largura</label>
                                <select
                                    value={selectedBlock.styles?.containerWidth || 'max-w-4xl'}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, containerWidth: e.target.value } })}
                                    className="w-full bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="max-w-md">Estreita</option>
                                    <option value="max-w-2xl">Média</option>
                                    <option value="max-w-4xl">Larga</option>
                                    <option value="max-w-6xl">Super Larga</option>
                                    <option value="w-full">Tela Inteira</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {selectedBlock.type === 'FeatureCardsBlock' && (
                        <div className="space-y-5 text-left">
                            <div className="flex items-center justify-between border-b border-warm-100 pb-2">
                                <h4 className="text-xs font-bold text-warm-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles size={15} className="text-primary" /> Configuração dos Cards
                                </h4>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Número de Colunas</label>
                                <div className="grid grid-cols-4 gap-1">
                                    {[1, 2, 3, 4].map(cols => (
                                        <button
                                            key={cols}
                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, columns: cols } })}
                                            className={`py-1.5 text-xs rounded-lg border transition-all ${
                                                (selectedBlock.styles?.columns || 3) === cols
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

                    <div className="pt-4 border-t border-warm-100">
                        <button
                            onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.')) {
                                    deleteBlock(selectedBlock.id);
                                }
                            }}
                            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-xs transition-colors border border-red-200 flex items-center justify-center gap-1.5"
                        >
                            <Trash2 size={13} /> Excluir Seção
                        </button>
                    </div>
                </div>
            )}
        </div>
    )}
</div>

</div>

{/* ═══ TOAST ═══ */}
{successMessage && (
<div className="fixed bottom-6 right-6 z-[60] bg-sage-50 text-sage-700 border border-sage-200 px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in text-sm">
<CheckCircle2 size={18} />
<span className="font-medium">{successMessage}</span>
</div>
)}

{/* ═══ PUBLISH MODAL ═══ */}
{showPublishModal && (
<div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4 animate-fade-in">
<div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-warm-200">
<div className="flex items-center gap-3 mb-4">
<div className="p-2.5 bg-primary/10 text-primary rounded-xl">
<AlertTriangle size={22} />
</div>
<div>
<h3 className="text-lg font-bold text-warm-900">Publicar Alterações?</h3>
<p className="text-xs text-warm-500">{PAGES_AVAILABLE.find(p => p.id === selectedPage)?.label}</p>
</div>
</div>
<p className="text-sm text-warm-600 mb-6 leading-relaxed">
Todos os usuários verão o novo conteúdo imediatamente. Uma versão será salva no histórico.
</p>
<div className="flex gap-2 justify-end">
<button onClick={() => setShowPublishModal(false)} className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 font-medium rounded-xl text-sm transition-colors">
Cancelar
</button>
<button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-1.5">
{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
Confirmar
</button>
</div>
</div>
</div>
)}

{/* ═══ MODULE EDITOR MODAL ═══ */}
{showModuleEditor && (
    <div className="fixed inset-0 z-[100] bg-warm-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-[#f0f2f5] w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
            <div className="bg-white p-4 border-b border-warm-200 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-warm-900">Gerenciar Módulos</h3>
                <button onClick={() => setShowModuleEditor(false)} className="p-2 bg-warm-100 text-warm-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 relative">
                <ModuleEditor />
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
                const block = blocks.find(b => b.id === selectedBlockId);
                if (block && block.type === 'HeroBlock') {
                    updateBlock(selectedBlockId, { data: { ...block.data, bgImage: newUrl } });
                } else if (block && block.type === 'ImageBlock') {
                    updateBlock(selectedBlockId, { data: { ...block.data, src: newUrl } });
                }
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

export default PageEditor;
