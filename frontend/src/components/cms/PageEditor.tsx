import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, ArrowLeft, Sparkles, X, Layers, Image as ImageIcon, Settings,
    CheckCircle2, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Type, Minus,
    AlignLeft, AlignCenter, AlignRight, Palette, Bot, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlockRenderer from './blocks/BlockRenderer';
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
}
];

const PageEditor: React.FC = () => {
const { token } = useAuth();
const navigate = useNavigate();

const [selectedPage, setSelectedPage] = useState<string>('modulos');
const [blocks, setBlocks] = useState<BlockData[]>([]);
const [originalBlocks, setOriginalBlocks] = useState<BlockData[]>([]);
const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

const [isDirty, setIsDirty] = useState(false);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

const [showPublishModal, setShowPublishModal] = useState(false);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// AI Copilot States
const [rightSidebarTab, setRightSidebarTab] = useState<'properties' | 'ai'>('properties');
const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([
    { role: 'assistant', content: 'Olá! Sou a IA do Palieduca. Como posso ajudar você a escrever o conteúdo dos blocos hoje?' }
]);
const [chatInput, setChatInput] = useState('');
const [isChatLoading, setIsChatLoading] = useState(false);
const chatEndRef = useRef<HTMLDivElement>(null);

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
        const res = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages })
        });

        if (res.ok) {
            const data = await res.json();
            setChatMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
        } else {
            setChatMessages([...updatedMessages, { role: 'assistant', content: 'Desculpe, ocorreu um erro de conexão com a IA (Verifique a GROQ_API_KEY no backend).' }]);
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
setSelectedBlockId(null);

try {
const res = await fetch(`${API_URL}/api/pages/${pageName}/edit`, {
headers: { Authorization: `Bearer ${token}` }
});

if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

const data = await res.json();
const contentToParse = data.draft_content || data.content || '';

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
const endpoint = publish
? `${API_URL}/api/pages/${selectedPage}/publish`
: `${API_URL}/api/pages/${selectedPage}`;

const res = await fetch(endpoint, {
method: publish ? 'POST' : 'PUT',
headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
body: JSON.stringify({ content: JSON.stringify(blocks), draft_content: JSON.stringify(blocks) })
});

if (!res.ok) throw new Error('Falha ao salvar');
setOriginalBlocks(blocks);
setIsDirty(false);
if (publish) setShowPublishModal(false);
showToast(publish ? 'Publicado com sucesso!' : 'Rascunho salvo!');
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
setBlocks(copy);
setSelectedBlockId(clone.id);
};

const deleteBlock = (id: string) => {
setBlocks(prev => prev.filter(b => b.id !== id));
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
<div className="bg-[#f0f2f5] h-full flex flex-col overflow-hidden font-sans rounded-xl border border-warm-200">
{/* ═══ HEADER ═══ */}
<div className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-50">
<div className="flex items-center gap-3">
<button onClick={() => navigate('/admin')} className="p-2 text-warm-500 hover:text-warm-900 hover:bg-warm-100 rounded-lg transition-colors">
<ArrowLeft size={20} />
</button>
<div className="h-5 w-px bg-warm-200 hidden sm:block" />
<select
value={selectedPage}
onChange={(e) => setSelectedPage(e.target.value)}
className="bg-warm-50 border border-warm-200 text-warm-900 font-bold rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
>
{PAGES_AVAILABLE.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
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
<Save size={14} /> Publicar
</button>
</div>
</div>

{/* ═══ TRIPLE LAYOUT ═══ */}
<div className="flex-1 flex overflow-hidden min-h-0">

{/* ─── LEFT SIDEBAR ─── */}
<div className="w-60 bg-white border-r border-warm-200 flex flex-col z-40 shrink-0">
<div className="p-3 border-b border-warm-100">
<h3 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Adicionar Seção</h3>
</div>
<div className="p-3 flex flex-col gap-2 overflow-y-auto flex-1">
{BLOCK_TEMPLATES.map(tmpl => (
<button
key={tmpl.type}
onClick={() => addBlock(tmpl.type)}
className="flex items-center gap-3 p-3 bg-warm-50 border border-warm-100 rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-sm transition-all group text-left"
>
<div className="p-2 bg-white rounded-lg border border-warm-200 text-warm-400 group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
{tmpl.icon}
</div>
<div className="min-w-0">
<div className="text-sm font-bold text-warm-800 group-hover:text-primary transition-colors">{tmpl.label}</div>
<div className="text-[11px] text-warm-500 truncate">{tmpl.description}</div>
</div>
</button>
))}
</div>
</div>

{/* ─── CENTER CANVAS ─── */}
<div
className="flex-1 overflow-y-auto relative"
style={{ background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
onClick={() => setSelectedBlockId(null)}
>
<div className="max-w-6xl mx-auto py-6 px-4 sm:px-8 flex flex-col gap-3 pb-32">
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
<p className="text-sm">Adicione seções pela barra lateral esquerda.</p>
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
                            <p className="text-[11px] text-warm-500 bg-warm-50 p-2 rounded-lg border border-warm-100">
                                Os módulos são carregados dinamicamente do banco de dados.
                            </p>

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
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider">Estilo do Texto</h4>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1">Tamanho da Fonte</label>
                                <input
                                    type="range" min="12" max="32"
                                    value={selectedBlock.styles?.fontSize ?? 16}
                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: parseInt(e.target.value) } })}
                                    className="w-full accent-primary"
                                />
                                <div className="text-[10px] text-right text-warm-400">{selectedBlock.styles?.fontSize ?? 16}px</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-warm-600 mb-1.5">Cor do Texto</label>
                                <div className="flex gap-2">
                                    {['#374151', '#1f2937', '#4b5563', '#7c3aed', '#059669'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textColor: c } })}
                                            className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                                                (selectedBlock.styles?.textColor || '#374151') === c ? 'border-primary shadow-md' : 'border-warm-200'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
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

                    <div className="pt-4 border-t border-warm-100">
                        <button
                            onClick={() => deleteBlock(selectedBlock.id)}
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
</div>
);
};

export default PageEditor;
