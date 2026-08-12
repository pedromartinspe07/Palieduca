import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, ArrowLeft, Sparkles, X, Layers, Image as ImageIcon, Settings, CheckCircle2, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WixFloatingToolbar } from './WixFloatingToolbar';
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

    const fetchPageContent = async (pageName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/pages/${pageName}/edit`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

            const data = await res.json();
            const contentToParse = data.draft_content || data.content || '';
            
            let parsed = [];
            try {
                parsed = JSON.parse(contentToParse);
                if (!Array.isArray(parsed)) {
                    parsed = [];
                }
            } catch (e) {
                parsed = [];
            }
            
            if (parsed.length === 0) {
                parsed = [
                    {
                        id: 'block-1',
                        type: 'HeroBlock',
                        data: {
                            title: 'Transforme o Conhecimento em Prática',
                            subtitle: 'Uma plataforma dedicada ao aprimoramento contínuo em cuidados paliativos, com módulos interativos e biblioteca curada.',
                            bgImage: ''
                        }
                    },
                    {
                        id: 'block-2',
                        type: 'ModulesGridBlock',
                        data: {
                            title: 'Explore Nossos Módulos',
                            intro: 'Acesse o conteúdo selecionado por especialistas para o seu desenvolvimento.'
                        }
                    }
                ];
            }
            
            setBlocks(parsed);
            setOriginalBlocks(parsed);
        } catch (error) {
            console.error('Erro ao buscar conteúdo:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageContent(selectedPage);
    }, [selectedPage, token]);

    useEffect(() => {
        setIsDirty(JSON.stringify(blocks) !== JSON.stringify(originalBlocks));
    }, [blocks, originalBlocks]);

    const showToast = (message: string) => {
        setSuccessMessage(message);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setSuccessMessage('');
        }, 4000);
    };

    const handleSave = async (publish: boolean = false) => {
        setSaving(true);
        try {
            const endpoint = publish 
                ? `${API_URL}/api/pages/${selectedPage}/publish`
                : `${API_URL}/api/pages/${selectedPage}`;

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: JSON.stringify(blocks),
                    draft_content: JSON.stringify(blocks),
                    description: publish ? "Publicado via Block-Based CMS" : "Rascunho",
                })
            });

            if (!res.ok) throw new Error('Falha ao salvar');
            
            setOriginalBlocks(blocks);
            setIsDirty(false);
            if (publish) setShowPublishModal(false);
            showToast(publish ? 'Alterações publicadas com sucesso!' : 'Rascunho salvo!');
        } catch (error) {
            console.error(error);
            alert('Falha ao salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: 'HeroBlock' | 'ModulesGridBlock') => {
        const newBlock: BlockData = {
            id: `block-${Date.now()}`,
            type,
            data: type === 'HeroBlock' 
                ? { title: 'Novo Hero', subtitle: 'Subtítulo', bgImage: '' }
                : { title: 'Novo Grid', intro: 'Introdução' }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, newData: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, data: newData } : b));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedBlockId) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                // Update the selected block's bgImage
                const block = blocks.find(b => b.id === selectedBlockId);
                if (block) {
                    updateBlock(selectedBlockId, { ...block.data, bgImage: data.url });
                }
            } else {
                alert('Falha ao enviar imagem.');
            }
        } catch (error) {
            console.error('Erro no upload local:', error);
            alert('Erro ao enviar a imagem.');
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className="bg-gray-100 h-screen flex flex-col overflow-hidden font-sans">
            {/* HEADER */}
            <div className="h-16 bg-white border-b border-warm-200 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin')} className="text-warm-500 hover:text-warm-900 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="h-6 w-[1px] bg-warm-200 hidden sm:block"></div>
                    <select 
                        value={selectedPage} 
                        onChange={(e) => setSelectedPage(e.target.value)}
                        className="bg-warm-50 border border-warm-200 text-warm-900 font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                    >
                        {PAGES_AVAILABLE.map(p => (
                            <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                    </select>
                    {isDirty && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Alterações não salvas</span>}
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleSave(false)} 
                        disabled={!isDirty || saving}
                        className="px-4 py-2 text-sm font-medium text-warm-700 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button 
                        onClick={() => setShowPublishModal(true)} 
                        disabled={saving}
                        className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                        <Save size={16} /> Publicar
                    </button>
                </div>
            </div>

            {/* TRIPLE LAYOUT MAIN */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT SIDEBAR: Assets Library */}
                <div className="w-64 bg-white/70 backdrop-blur-xl border-r border-warm-200 shadow-2xl flex flex-col z-40 shrink-0">
                    <div className="p-4 border-b border-warm-200 flex items-center gap-2">
                        <Layers className="text-primary" size={20} />
                        <h3 className="font-bold text-warm-900">Adicionar Seção</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-3 overflow-y-auto">
                        <button 
                            onClick={() => addBlock('HeroBlock')}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-warm-200 rounded-xl hover:border-primary hover:shadow-md transition-all group"
                        >
                            <div className="w-full h-16 bg-warm-100 rounded-md mb-2 flex items-center justify-center group-hover:bg-primary/10">
                                <Sparkles className="text-warm-400 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-bold text-warm-700">Hero Section</span>
                        </button>
                        
                        <button 
                            onClick={() => addBlock('ModulesGridBlock')}
                            className="flex flex-col items-center justify-center p-4 bg-white border border-warm-200 rounded-xl hover:border-primary hover:shadow-md transition-all group"
                        >
                            <div className="w-full h-16 bg-warm-100 rounded-md mb-2 flex items-center justify-center group-hover:bg-primary/10">
                                <Layers className="text-warm-400 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-bold text-warm-700">Grade de Módulos</span>
                        </button>
                    </div>
                </div>

                {/* CENTER CANVAS: Immersive Mode */}
                <div 
                    className="flex-1 overflow-y-auto p-4 sm:p-8 relative"
                    onClick={() => setSelectedBlockId(null)} // Deselect when clicking outside blocks
                >
                    <WixFloatingToolbar />
                    
                    <div className="max-w-7xl mx-auto flex flex-col gap-4 pb-32">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : (
                            blocks.map((block) => (
                                <BlockRenderer 
                                    key={block.id}
                                    block={block}
                                    isEditing={true}
                                    isSelected={selectedBlockId === block.id}
                                    onUpdate={updateBlock}
                                    onSelect={setSelectedBlockId}
                                />
                            ))
                        )}
                        
                        {!loading && blocks.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-warm-300 rounded-3xl bg-white/50 text-warm-500">
                                <Layers size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium">Sua página está vazia.</p>
                                <p className="text-sm">Adicione seções pela barra lateral esquerda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Properties Panel */}
                <div className="w-72 bg-white/70 backdrop-blur-xl border-l border-warm-200 shadow-2xl flex flex-col z-40 shrink-0 transition-transform duration-300">
                    <div className="p-4 border-b border-warm-200 flex items-center gap-2">
                        <Settings className="text-primary" size={20} />
                        <h3 className="font-bold text-warm-900">Propriedades</h3>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto">
                        {!selectedBlock ? (
                            <div className="text-center text-warm-500 mt-10">
                                <p className="text-sm">Selecione uma seção no canvas para editar suas propriedades.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-warm-500 uppercase tracking-wider mb-3">Estilo da Seção</h4>
                                    
                                    {selectedBlock.type === 'HeroBlock' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-warm-700 mb-1">Imagem de Fundo</label>
                                                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-warm-300 rounded-xl hover:bg-warm-50 hover:border-primary cursor-pointer transition-colors group">
                                                    <div className="flex flex-col items-center gap-2 text-warm-500 group-hover:text-primary">
                                                        <ImageIcon size={24} />
                                                        <span className="text-xs font-medium">Upload (PC)</span>
                                                    </div>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                </label>
                                                {selectedBlock.data.bgImage && (
                                                    <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-warm-200">
                                                        <img src={selectedBlock.data.bgImage} alt="Preview" className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={() => updateBlock(selectedBlock.id, { ...selectedBlock.data, bgImage: '' })}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedBlock.type === 'ModulesGridBlock' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-warm-600 bg-warm-50 p-3 rounded-lg border border-warm-100">
                                                A grade de módulos carrega automaticamente os dados dinâmicos dos módulos ativos. Edite o conteúdo dos módulos através da página principal de módulos.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="pt-6 border-t border-warm-200">
                                    <button 
                                        onClick={() => {
                                            setBlocks(blocks.filter(b => b.id !== selectedBlock.id));
                                            setSelectedBlockId(null);
                                        }}
                                        className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-lg text-sm transition-colors border border-red-200"
                                    >
                                        Excluir Seção
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* TOAST */}
            {successMessage && (
                <div className="fixed bottom-6 right-6 z-[60] bg-sage-50 text-sage-700 border border-sage-200 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            {/* PUBLISH MODAL */}
            {showPublishModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md border border-warm-200">
                        <div className="flex items-center gap-3 mb-4 text-warm-900">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Publicar Alterações?</h3>
                                <p className="text-sm text-warm-500">Página: {PAGES_AVAILABLE.find(p => p.id === selectedPage)?.label}</p>
                            </div>
                        </div>
                        <p className="text-warm-600 mb-8 leading-relaxed">
                            Você está prestes a publicar essas alterações. Todos os usuários verão o novo conteúdo e uma versão será salva no histórico.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="px-5 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 font-medium rounded-xl text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Confirmar Publicação
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PageEditor;
