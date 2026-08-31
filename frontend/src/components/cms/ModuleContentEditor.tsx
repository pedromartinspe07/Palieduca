import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Save, AlertTriangle, X, Layers, Image as ImageIcon, Settings,
    CheckCircle2, Loader2, ChevronUp, ChevronDown, Copy, Trash2, Type, Minus,
    LayoutList, Play, Crop, RotateCcw, RotateCw, Monitor, Tablet, Smartphone,
    AlertCircle, RefreshCw, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Underline, Strikethrough, Pipette, Sparkles, Wand2, Search, Check, Plus,
    CheckCheck, ExternalLink, Link as LinkIcon, History, BookOpen, Stethoscope,
    Eye, EyeOff
} from 'lucide-react';
import BlockRenderer from './blocks/BlockRenderer';
import MediaLibrary from './MediaLibrary';
import ImageCropperModal from './ImageCropperModal';
import VersionHistoryPanel from './VersionHistoryPanel';
import WixFloatingToolbar from './WixFloatingToolbar';
import type { BlockData } from './blocks/types';
import { getModuleIcon } from '../../utils/iconUtils';
import { playPublishSound, playSaveDraftSound } from '../../utils/soundUtils';

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
    },
    {
        type: 'ClinicalCaseBlock',
        label: 'Caso Clínico / Decisão',
        icon: <Stethoscope size={20} className="text-teal-600" />,
        description: 'Simulação clínica com tomada de decisão e desfecho',
        defaultData: {
            patient_name: 'Dona Maria de Lourdes, 72 anos',
            patient_age_gender: 'Feminino, 72 anos',
            diagnosis: 'Neoplasia pulmonar avançada em cuidados paliativos exclusivos',
            setting: 'Enfermaria de Cuidados Paliativos',
            clinical_scenario: 'Paciente com queixa súbita de dispneia moderada em repouso (FR: 28 irpm, SpO2: 89%), dor torácica grau 7/10 e ansiedade. O acompanhante solicita auxílio imediato da enfermagem.',
            vitals: {
                pa: '130/80 mmHg',
                fc: '102 bpm',
                fr: '28 irpm',
                dor: '7/10',
                spo2: '89%',
                consciencia: 'Lúcida e ansiosa'
            },
            decision_prompt: 'Como enfermeiro(a) responsável, qual é a sua conduta imediata e prioritária?',
            decisions: [
                {
                    id: 'conduta-1',
                    label: 'Elevar a cabeceira do leito a 45° (Fowler), oxigenoterapia sob cateter nasal em baixo fluxo, administrar morfina em baixas doses conforme protocolo e acolher o familiar.',
                    rating: 'optimal',
                    outcome_title: 'Desfecho Excelente: Conforto e Alívio da Dispneia',
                    outcome_description: 'A paciente apresentou alívio rápido do sofrimento respiratório, estabilização da saturação em 93% e redução da dor.',
                    scientific_rationale: 'A morfina é o padrão-ouro no controle da dispneia refratária em cuidados paliativos (ANCP / EAPC).'
                },
                {
                    id: 'conduta-2',
                    label: 'Solicitar intubação orotraqueal e restringir a presença da família no quarto.',
                    rating: 'inadequate',
                    outcome_title: 'Desfecho Inadequado: Distanásia e Sofrimento',
                    outcome_description: 'Medidas invasivas desproporcionais violam as diretrizes de conforto e dignidade dos cuidados paliativos.',
                    scientific_rationale: 'Procedimentos invasivos desproporcionais caracterizam obstinação terapêutica.'
                }
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

    const [leftSidebarTab, setLeftSidebarTab] = useState<'blocos' | 'midia' | 'historico' | null>('blocos');

    // Right Sidebar Tabs: 'properties' | 'ai' | 'images'
    const [rightSidebarTab, setRightSidebarTab] = useState<'properties' | 'ai' | 'images'>('properties');

    // Mobile States (Bottom Drawer & Preview)
    const [mobileActiveDrawer, setMobileActiveDrawer] = useState<'blocks' | 'properties' | 'ai' | 'media' | 'history' | null>(null);
    const [mobilePreviewMode, setMobilePreviewMode] = useState<boolean>(false);

    // AI Agent Builder & Editor States
    const [aiMode, setAiMode] = useState<'create' | 'edit'>('create');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiEditInstruction, setAiEditInstruction] = useState('');
    const [aiTargetType, setAiTargetType] = useState<string>('full_page');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [isAiEditing, setIsAiEditing] = useState(false);
    const [aiEditSummary, setAiEditSummary] = useState<string | null>(null);
    const [generatedBlocksResult, setGeneratedBlocksResult] = useState<{ summary: string; blocks: BlockData[] } | null>(null);

    // Image Bank States
    const [imageSearchQuery, setImageSearchQuery] = useState('');
    const [imageCategory, setImageCategory] = useState('Todas');
    const [imageResults, setImageResults] = useState<any[]>([]);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null);
    const [directUrlInput, setDirectUrlInput] = useState('');
    const [isResolvingDirectUrl, setIsResolvingDirectUrl] = useState(false);

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
            if (publish) {
                setShowPublishModal(false);
                playPublishSound();
            } else {
                playSaveDraftSound();
            }
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
        setSelectedBlockId(newBlock.id);
        setRightSidebarTab('properties');
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

    // ─── AI Agent Builder & Image Bank Handlers ───
    const fetchHealthcareImages = useCallback(async (query: string = '', cat: string = 'Todas') => {
        setIsImageLoading(true);
        try {
            const url = new URL(`${API_URL}/api/ai/search-images`);
            if (query.trim()) url.searchParams.append('q', query.trim());
            if (cat && cat !== 'Todas') url.searchParams.append('category', cat);

            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                setImageResults(data);
            }
        } catch (e) {
            console.error("Erro ao buscar imagens de saúde:", e);
        } finally {
            setIsImageLoading(false);
        }
    }, []);

    useEffect(() => {
        if (rightSidebarTab === 'images') {
            fetchHealthcareImages(imageSearchQuery, imageCategory);
        }
    }, [rightSidebarTab, imageCategory, fetchHealthcareImages]);

    const handleAiGenerate = async (presetPrompt?: string, presetType?: string) => {
        const promptToUse = presetPrompt || aiPrompt;
        const typeToUse = presetType || aiTargetType;
        if (!promptToUse.trim()) return;

        setIsAiGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/generate-blocks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: promptToUse,
                    target_type: typeToUse,
                    context_module: selectedModuleSlug
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Erro ao gerar blocos com IA');
            }

            const data = await res.json();
            setGeneratedBlocksResult(data);
            showToast('✨ Blocos gerados com sucesso pelo Agente IA!');
        } catch (err: any) {
            console.error('Erro na IA:', err);
            showToast(err.message || 'Erro ao comunicar com a IA');
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleInsertAllGeneratedBlocks = () => {
        if (!generatedBlocksResult || !generatedBlocksResult.blocks.length) return;
        setBlocksWithHistory(prev => [...prev, ...generatedBlocksResult.blocks]);
        showToast(`🎉 ${generatedBlocksResult.blocks.length} blocos inseridos na Aula!`);
        setGeneratedBlocksResult(null);
        setRightSidebarTab('properties');
    };

    const handleInsertSingleGeneratedBlock = (block: BlockData) => {
        setBlocksWithHistory(prev => [...prev, block]);
        showToast(`✅ Bloco "${block.type}" inserido!`);
    };

    const handleAiEditBlock = async (instructionPreset?: string, insertAsNew: boolean = false) => {
        const instructionToUse = instructionPreset || aiEditInstruction;
        if (!instructionToUse.trim()) return;

        const targetBlock = blocks.find(b => b.id === selectedBlockId);
        if (!targetBlock) {
            showToast('⚠️ Selecione um bloco no canvas para editar com a IA.');
            return;
        }

        setIsAiEditing(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/edit-block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    instruction: instructionToUse,
                    block: targetBlock,
                    context_module: selectedModuleSlug,
                    action: 'edit'
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Erro ao editar bloco com IA');
            }

            const data = await res.json();
            const editedBlock = data.block;

            if (insertAsNew) {
                const uniqueSuffix = Math.random().toString(36).substr(2, 6);
                const newBlock = {
                    ...editedBlock,
                    id: `${editedBlock.type.toLowerCase()}_${Date.now()}_${uniqueSuffix}`
                };
                setBlocksWithHistory(prev => {
                    const idx = prev.findIndex(b => b.id === selectedBlockId);
                    if (idx !== -1) {
                        const newBlocks = [...prev];
                        newBlocks.splice(idx + 1, 0, newBlock);
                        return newBlocks;
                    }
                    return [...prev, newBlock];
                });
                showToast('✨ Novo bloco gerado e inserido abaixo!');
            } else {
                setBlocksWithHistory(prev => prev.map(b => b.id === selectedBlockId ? editedBlock : b));
                showToast(`🪄 ${data.summary || 'Bloco atualizado pelo Agente IA!'}`);
            }

            setAiEditSummary(data.summary);
            setIsDirty(true);
        } catch (err: any) {
            console.error('Erro na edição IA:', err);
            showToast(err.message || 'Erro ao comunicar com o Agente IA');
        } finally {
            setIsAiEditing(false);
        }
    };

    const handleInsertImageAsBlock = (img: { url: string; title: string }) => {
        const newImageBlock: BlockData = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'ImageBlock',
            data: {
                imageUrl: img.url,
                alt: img.title,
                caption: img.title
            }
        };
        setBlocksWithHistory(prev => [...prev, newImageBlock]);
        showToast(`🖼️ Imagem médica inserida na Aula!`);
    };

    const handleCopyImageUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedImageUrl(url);
        showToast('📋 Link da imagem copiado!');
        setTimeout(() => setCopiedImageUrl(null), 2500);
    };

    const handleInsertDirectUrl = async () => {
        if (!directUrlInput.trim()) return;
        setIsResolvingDirectUrl(true);
        try {
            let finalUrl = directUrlInput.trim();
            let finalTitle = "Imagem Externa (Unsplash / Web)";

            if (!finalUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) && !finalUrl.includes('images.unsplash.com')) {
                const res = await fetch(`${API_URL}/api/ai/resolve-image-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: finalUrl })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.image_url) {
                        finalUrl = data.image_url;
                        if (data.title) finalTitle = data.title;
                    }
                }
            }

            const newImageBlock: BlockData = {
                id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                type: 'ImageBlock',
                data: {
                    imageUrl: finalUrl,
                    alt: finalTitle,
                    caption: finalTitle
                }
            };
            setBlocksWithHistory(prev => [...prev, newImageBlock]);
            showToast('🖼️ Imagem do Unsplash / Web inserida na Aula!');
            setDirectUrlInput('');
            setRightSidebarTab('properties');
        } catch (err) {
            console.error('Erro ao inserir link direto:', err);
            showToast('Erro ao processar imagem.');
        } finally {
            setIsResolvingDirectUrl(false);
        }
    };

    return (
        <div className="bg-[#f0f2f5] h-full flex flex-col overflow-hidden font-sans rounded-xl border border-warm-200 relative">
            {/* ═══ HEADER ═══ */}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-warm-200 dark:border-slate-800 flex items-center justify-between px-2 sm:px-6 shrink-0 z-50 gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                    <div className="bg-primary/10 p-1 sm:p-1.5 rounded-lg text-primary shrink-0 flex items-center justify-center">
                        {getModuleIcon(modules.find(m => m.slug_id === selectedModuleSlug)?.icon_name, 18)}
                    </div>
                    <select
                        value={selectedModuleSlug}
                        onChange={(e) => setSelectedModuleSlug(e.target.value)}
                        className="bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 font-bold rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none max-w-[130px] xs:max-w-[180px] sm:max-w-none truncate"
                    >
                        {modules.map(m => <option key={m.slug_id} value={m.slug_id}>{m.title}</option>)}
                    </select>
                    {isDirty && (
                        <span className="text-[9px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 sm:px-2 py-0.5 rounded-md animate-pulse whitespace-nowrap hidden xs:inline">
                            ● Não salvo
                        </span>
                    )}
                </div>

                {/* Center: Undo/Redo & Device Switcher */}
                <div className="flex items-center gap-1 sm:gap-3">
                    {/* Undo / Redo */}
                    <div className="flex items-center bg-warm-50 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-warm-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            title="Desfazer (Ctrl+Z)"
                            className="p-1 sm:p-1.5 rounded-lg text-warm-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all flex items-center text-xs cursor-pointer"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={future.length === 0}
                            title="Refazer (Ctrl+Y)"
                            className="p-1 sm:p-1.5 rounded-lg text-warm-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-all flex items-center text-xs cursor-pointer"
                        >
                            <RotateCw size={14} />
                        </button>
                    </div>

                    {/* Device View Selector (Desktop / Tablet / Mobile) */}
                    <div className="hidden md:flex items-center bg-warm-50 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-warm-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={() => setDeviceView('desktop')}
                            title="Desktop (Largura total)"
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${deviceView === 'desktop' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'}`}
                        >
                            <Monitor size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeviceView('tablet')}
                            title="Tablet (768px)"
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${deviceView === 'tablet' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'}`}
                        >
                            <Tablet size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeviceView('mobile')}
                            title="Celular (390px)"
                            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${deviceView === 'mobile' ? 'bg-white text-primary shadow-sm font-bold' : 'text-warm-400 hover:text-warm-700'}`}
                        >
                            <Smartphone size={15} />
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Mobile Preview Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobilePreviewMode(!mobilePreviewMode)}
                        className={`md:hidden p-1.5 sm:px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            mobilePreviewMode 
                                ? 'bg-primary text-white border-primary shadow-xs' 
                                : 'bg-warm-50 dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-warm-200 dark:border-slate-700'
                        }`}
                        title={mobilePreviewMode ? "Voltar para Modo de Edição" : "Ver Pré-visualização"}
                    >
                        {mobilePreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span className="hidden xs:inline">{mobilePreviewMode ? 'Editar' : 'Prévia'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setRightSidebarTab('ai')}
                        className={`hidden md:flex px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all items-center gap-1.5 whitespace-nowrap cursor-pointer ${rightSidebarTab === 'ai'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                        title="Abrir Agente Construtor com IA (Qwen 3.6)"
                    >
                        <Wand2 size={14} className={rightSidebarTab === 'ai' ? 'animate-spin' : 'text-purple-600'} />
                        <span>Agente IA</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRightSidebarTab('images')}
                        className={`hidden md:flex px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all items-center gap-1.5 whitespace-nowrap cursor-pointer ${rightSidebarTab === 'images'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                        title="Abrir Banco de Imagens (Unsplash & Web)"
                    >
                        <ImageIcon size={14} className={rightSidebarTab === 'images' ? '' : 'text-emerald-600'} />
                        <span>Imagens</span>
                    </button>
                    <div className="h-5 w-px bg-warm-200 hidden md:block" />
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={!isDirty || saving}
                        className="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-warm-700 bg-white border border-warm-200 rounded-lg hover:bg-warm-50 disabled:opacity-40 transition-colors whitespace-nowrap cursor-pointer"
                    >
                        {saving ? 'Salvando...' : 'Salvar Rascunho'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowPublishModal(true)}
                        disabled={saving}
                        className="px-2.5 sm:px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                        <Save size={14} /> <span className="hidden xs:inline">Atualizar Aula</span><span className="xs:hidden">Salvar</span>
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
            <div className="flex-1 flex overflow-hidden min-h-0 bg-white dark:bg-slate-900">

                {/* ─── LEFT SIDEBAR (CANVA STYLE) ─── */}
                <div className="hidden md:flex shrink-0 h-full">
                    <div className="w-[72px] bg-warm-900 dark:bg-[#0b1329] flex flex-col items-center py-4 gap-4 z-50 shadow-md border-r border-warm-800 dark:border-slate-800">
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
                            title="Biblioteca de Mídia"
                        >
                            <ImageIcon size={22} />
                            <span className="text-[10px] font-medium">Mídia</span>
                        </button>
                        <button
                            onClick={() => setLeftSidebarTab(leftSidebarTab === 'historico' ? null : 'historico')}
                            className={`flex flex-col items-center gap-1.5 w-14 py-2.5 rounded-xl transition-all ${leftSidebarTab === 'historico' ? 'text-white bg-white/10' : 'text-warm-400 hover:text-white hover:bg-white/5'}`}
                            title="Histórico de Versões / Snapshots"
                        >
                            <History size={22} />
                            <span className="text-[10px] font-medium">Histórico</span>
                        </button>
                    </div>

                    <div className={`bg-white dark:bg-slate-900 border-r border-warm-200 dark:border-slate-800 flex flex-col z-40 overflow-hidden shadow-lg transition-all duration-300 ${leftSidebarTab === 'midia' || leftSidebarTab === 'historico'
                            ? 'w-[360px] sm:w-[380px] opacity-100'
                            : leftSidebarTab !== null
                                ? 'w-[280px] opacity-100'
                                : 'w-0 opacity-0 border-r-0'
                        }`}>
                        {leftSidebarTab === 'blocos' && (
                            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
                                <div className="p-4 border-b border-warm-100 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-900 shrink-0">
                                    <h3 className="text-sm font-bold text-warm-800 dark:text-slate-100">Recursos de Ensino</h3>
                                    <button onClick={() => setLeftSidebarTab(null)} className="text-warm-400 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200 cursor-pointer"><X size={16} /></button>
                                </div>
                                <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1 bg-white dark:bg-slate-900 custom-scrollbar">
                                    {BLOCK_TEMPLATES.map(tmpl => (
                                        <button
                                            key={tmpl.type}
                                            onClick={() => addBlock(tmpl.type)}
                                            className="flex items-center gap-3 p-3 bg-warm-50 dark:bg-slate-800/90 border border-warm-200 dark:border-slate-700 rounded-xl hover:bg-warm-100 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-teal-500/50 transition-all text-left group cursor-pointer"
                                        >
                                            <div className="bg-white dark:bg-slate-900 p-2 rounded-lg text-primary dark:text-teal-400 shadow-xs group-hover:scale-110 transition-transform">
                                                {tmpl.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-warm-900 dark:text-slate-100 leading-none mb-1">{tmpl.label}</h4>
                                                <p className="text-[10px] text-warm-500 dark:text-slate-400 leading-tight">{tmpl.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                            updateBlock(selectedBlockId, { data: { ...block.data, src: url, originalSrc: url } });
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
                        {leftSidebarTab === 'historico' && (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                <VersionHistoryPanel
                                    pageIdentifier={selectedModuleSlug ? `modulo_${selectedModuleSlug}` : 'modulo_fundamentos'}
                                    pageTitle={modules.find(m => m.slug_id === selectedModuleSlug)?.title || 'Conteúdo do Módulo'}
                                    currentBlocks={blocks}
                                    onRestoreVersion={(restoredBlocks) => {
                                        setBlocksWithHistory(restoredBlocks);
                                        setIsDirty(true);
                                    }}
                                    showToast={showToast}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── CENTER CANVAS ─── */}
                <div
                    className="flex-1 overflow-y-auto relative flex justify-center p-2 sm:p-6 pb-28 md:pb-8 bg-[#faf9f6] dark:bg-[#080d1a] transition-colors duration-300"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.35) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    onClick={() => setSelectedBlockId(null)}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-warm-400 gap-3 my-auto">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <p className="font-medium text-sm">Carregando aula...</p>
                        </div>
                    ) : (
                        <div className={`transition-all duration-300 ${deviceView === 'desktop'
                                ? 'max-w-5xl w-full flex flex-col gap-4 pb-32'
                                : deviceView === 'tablet'
                                    ? 'w-[768px] max-w-full bg-white dark:bg-[#0b1329] rounded-3xl shadow-2xl border-4 border-warm-300 dark:border-slate-700 p-4 sm:p-6 min-h-[850px] my-auto flex flex-col gap-4 pb-32'
                                    : 'w-[390px] max-w-full bg-white dark:bg-[#0b1329] rounded-[40px] shadow-2xl border-[10px] border-warm-900 dark:border-slate-800 p-3 sm:p-4 min-h-[750px] my-auto relative flex flex-col gap-4 pb-32 overflow-hidden'
                            }`}>
                            {/* Smartphone Notch */}
                            {deviceView === 'mobile' && (
                                <div className="w-28 h-4 bg-warm-900 mx-auto rounded-b-xl mb-2 shrink-0 z-30 shadow-inner" />
                            )}

                            {/* Banner do Cabeçalho do Módulo (Visualizado pelos alunos) */}
                            {selectedModuleSlug && (
                                <div className="glassmorphism p-4 sm:p-7 rounded-3xl border border-warm-200 dark:border-slate-800 shadow-sm bg-white/95 dark:bg-slate-900/90 mb-2">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="bg-primary/10 dark:bg-primary/20 p-3 sm:p-4 rounded-2xl text-primary dark:text-teal-400 shrink-0 shadow-xs">
                                            {getModuleIcon(modules.find(m => m.slug_id === selectedModuleSlug)?.icon_name, 28)}
                                        </div>
                                        <div>
                                            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-warm-900 dark:text-slate-100">
                                                {modules.find(m => m.slug_id === selectedModuleSlug)?.title || 'Conteúdo do Módulo'}
                                            </h1>
                                            {modules.find(m => m.slug_id === selectedModuleSlug)?.description && (
                                                <p className="text-warm-600 dark:text-slate-300 mt-1 text-xs sm:text-sm leading-relaxed">
                                                    {modules.find(m => m.slug_id === selectedModuleSlug)?.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {blocks.map((block, bIdx) => (
                                <div key={block.id} className="relative group/mobile-block w-full">
                                    {/* Mobile Quick Action Overlay Bar */}
                                    {!mobilePreviewMode && (
                                        <div className="md:hidden mb-1.5 flex items-center justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-1.5 rounded-2xl border border-warm-200 dark:border-slate-700 shadow-xs">
                                            <span className="font-extrabold text-warm-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px] truncate max-w-[130px]">
                                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black shrink-0">
                                                    {bIdx + 1}
                                                </span>
                                                <span className="truncate">
                                                    {BLOCK_TEMPLATES.find(t => t.type === block.type)?.label || block.type}
                                                </span>
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                                                    disabled={bIdx === 0}
                                                    className="p-1.5 rounded-lg bg-warm-100 dark:bg-slate-700 text-warm-700 dark:text-slate-200 disabled:opacity-20 transition-all cursor-pointer"
                                                    title="Subir Bloco"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                                                    disabled={bIdx === blocks.length - 1}
                                                    className="p-1.5 rounded-lg bg-warm-100 dark:bg-slate-700 text-warm-700 dark:text-slate-200 disabled:opacity-20 transition-all cursor-pointer"
                                                    title="Descer Bloco"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setSelectedBlockId(block.id);
                                                        setRightSidebarTab('ai');
                                                        setAiMode('edit');
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold flex items-center gap-1 shadow-xs text-[11px] cursor-pointer"
                                                    title="Aprimorar com IA"
                                                >
                                                    <Wand2 size={12} /> <span className="hidden xs:inline">IA</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setSelectedBlockId(block.id);
                                                        setMobileActiveDrawer('properties');
                                                    }}
                                                    className="px-2 py-1 rounded-lg bg-primary text-white font-extrabold flex items-center gap-1 shadow-xs text-[11px] cursor-pointer"
                                                    title="Editar Propriedades no Celular"
                                                >
                                                    <Settings size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                                                    className="p-1.5 rounded-lg bg-warm-100 dark:bg-slate-700 text-warm-700 dark:text-slate-200 transition-all cursor-pointer"
                                                    title="Duplicar"
                                                >
                                                    <Copy size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                                                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 hover:bg-rose-100 transition-all cursor-pointer"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedBlockId(block.id);
                                        }}
                                        className={`rounded-3xl transition-all cursor-pointer ${
                                            selectedBlockId === block.id 
                                                ? 'ring-3 ring-primary ring-offset-2 shadow-xl' 
                                                : ''
                                        }`}
                                    >
                                        <BlockRenderer
                                            block={block}
                                            isEditing={!mobilePreviewMode}
                                            isSelected={selectedBlockId === block.id}
                                            onSelect={setSelectedBlockId}
                                            onUpdate={updateBlock}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── RIGHT SIDEBAR (3 TABS) (DESKTOP) ─── */}
                <div className="hidden md:flex w-84 sm:w-96 bg-white dark:bg-slate-900 border-l border-warm-200 dark:border-slate-800 flex-col z-40 shrink-0 shadow-lg">
                    {/* Tab Bar Header */}
                    <div className="flex items-center border-b border-warm-200 dark:border-slate-800 bg-warm-50/70 dark:bg-slate-800/80 p-1.5 gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => setRightSidebarTab('properties')}
                            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${rightSidebarTab === 'properties'
                                    ? 'bg-white dark:bg-slate-900 text-warm-900 dark:text-slate-100 shadow-xs border border-warm-200/60 dark:border-slate-700'
                                    : 'text-warm-500 dark:text-slate-400 hover:text-warm-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Settings size={14} className={rightSidebarTab === 'properties' ? 'text-primary' : ''} />
                            <span>Propriedades</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRightSidebarTab('ai')}
                            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${rightSidebarTab === 'ai'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100/70 dark:hover:bg-purple-900/50 border border-purple-200/50 dark:border-purple-800/50'
                                }`}
                        >
                            <Wand2 size={14} className={rightSidebarTab === 'ai' ? 'animate-spin' : 'text-purple-600 dark:text-purple-400'} />
                            <span>Agente IA</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRightSidebarTab('images')}
                            className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${rightSidebarTab === 'images'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 border border-emerald-200/50 dark:border-emerald-800/50'
                                }`}
                        >
                            <ImageIcon size={14} className={rightSidebarTab === 'images' ? '' : 'text-emerald-600 dark:text-emerald-400'} />
                            <span>Imagens</span>
                        </button>
                    </div>

                    {/* TAB 1: AGENTE IA (QWEN 3.6 / LLAMA 70B) */}
                    {rightSidebarTab === 'ai' && (
                        <div className="flex flex-col h-full min-h-0 p-4 overflow-y-auto space-y-4 bg-purple-50/30 dark:bg-slate-950/60">
                            {/* Banner Header IA */}
                            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-950/50 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-800/60 p-3 rounded-xl space-y-1.5">
                                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-xs">
                                    <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                                    <span>Agente Especialista em Aulas & Cuidados Paliativos</span>
                                </div>
                                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                                    Gere estruturas completas, aprofunde conteúdos clínicos (ANCP/OMS) e edite blocos existentes com inteligência artificial!
                                </p>
                            </div>

                            {/* Sub-Tabs: Criar Novos Blocos vs Editar Bloco Selecionado */}
                            <div className="flex bg-warm-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setAiMode('create')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                                        aiMode === 'create'
                                            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                                            : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Plus size={13} />
                                    <span>Criar Blocos</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAiMode('edit')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                                        aiMode === 'edit'
                                            ? 'bg-purple-600 text-white shadow-xs'
                                            : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Wand2 size={13} />
                                    <span>Editar Bloco {selectedBlockId ? '●' : ''}</span>
                                </button>
                            </div>

                            {/* MODO 1: EDITAR BLOCO SELECIONADO */}
                            {aiMode === 'edit' && (
                                <div className="space-y-3.5">
                                    {selectedBlockId && blocks.find(b => b.id === selectedBlockId) ? (
                                        (() => {
                                            const currentSelectedBlock = blocks.find(b => b.id === selectedBlockId)!;
                                            const blockTypeLabel = BLOCK_TEMPLATES.find(t => t.type === currentSelectedBlock.type)?.label || currentSelectedBlock.type;

                                            return (
                                                <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border-2 border-purple-300 dark:border-purple-700/80 shadow-xs">
                                                    <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                                                            <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                                                                Editando: {blockTypeLabel}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-warm-400 dark:text-slate-500 font-mono">
                                                            #{currentSelectedBlock.id.slice(-6)}
                                                        </span>
                                                    </div>

                                                    {/* Quick AI Action Chips */}
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-warm-700 dark:text-slate-300 mb-1.5">
                                                            Ações rápidas de melhoria (1 clique):
                                                        </label>
                                                        <div className="flex flex-col gap-1.5">
                                                            {[
                                                                { label: '✨ Aprofundar explicação teórica com diretrizes ANCP/OMS', prompt: 'Aprofunde e enriqueça a explicação teórica deste bloco com embasamento científico nas diretrizes de Cuidados Paliativos (ANCP/OMS), detalhes práticos e formatação rica com tópicos e termos em negrito.' },
                                                                { label: '🩺 Ajustar para protocolos clínicos e condutas', prompt: 'Refine o conteúdo deste bloco para focar nas condutas assistenciais, protocolos consagrados (ex: SPIKES, Escada de Dor OMS, ESAS) e segurança do paciente.' },
                                                                { label: '💡 Adicionar exemplos práticos e humanizados', prompt: 'Adicione exemplos práticos, diálogos ou condutas assistenciais humanizadas no conteúdo deste bloco.' },
                                                                ...(currentSelectedBlock.type === 'FeatureCardsBlock' ? [
                                                                    { label: '🎴 Adicionar mais 2 tópicos/cards complementares', prompt: 'Mantenha os cards existentes e adicione mais 2 cards com ícones pertinentes e descrições detalhadas aprofundando o tema.' }
                                                                ] : []),
                                                                { label: '✂️ Resumir e tornar mais direto e objetivo', prompt: 'Reescreva o conteúdo deste bloco de forma mais concisa, direta e pontual, mantendo todas as informações clínicas essenciais.' },
                                                                { label: '🎯 Revisar gramática, tom e clareza pedagógica', prompt: 'Revise o texto deste bloco para garantir clareza pedagógica impecável, correção gramatical e tom acolhedor e profissional.' }
                                                            ].map((act, aIdx) => (
                                                                <button
                                                                    key={aIdx}
                                                                    type="button"
                                                                    disabled={isAiEditing}
                                                                    onClick={() => {
                                                                        setAiEditInstruction(act.prompt);
                                                                        handleAiEditBlock(act.prompt, false);
                                                                    }}
                                                                    className="text-[11px] p-2 rounded-lg bg-purple-50/80 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-200/80 dark:border-slate-700 text-left font-medium transition-all hover:translate-x-0.5 cursor-pointer disabled:opacity-50"
                                                                >
                                                                    {act.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Custom Prompt Textarea */}
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-warm-800 dark:text-slate-200 mb-1">
                                                            Ou escreva como deseja alterar:
                                                        </label>
                                                        <textarea
                                                            value={aiEditInstruction}
                                                            onChange={(e) => setAiEditInstruction(e.target.value)}
                                                            placeholder="Ex: Altere o foco para o protocolo SPIKES etapa por etapa; adicione detalhes sobre titulação de morfina..."
                                                            className="w-full bg-warm-50 dark:bg-slate-950 border border-warm-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-warm-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none resize-none h-20"
                                                            disabled={isAiEditing}
                                                        />
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="space-y-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAiEditBlock(undefined, false)}
                                                            disabled={!aiEditInstruction.trim() || isAiEditing}
                                                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            {isAiEditing ? (
                                                                <>
                                                                    <Loader2 size={15} className="animate-spin" />
                                                                    <span>Agente IA Editando Bloco...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Wand2 size={15} />
                                                                    <span>🪄 Aplicar Edição no Bloco</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAiEditBlock(undefined, true)}
                                                            disabled={!aiEditInstruction.trim() || isAiEditing}
                                                            className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-slate-700 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                            title="Gera a versão melhorada e insere logo abaixo, sem substituir o original"
                                                        >
                                                            <Plus size={14} />
                                                            <span>Inserir como Novo Bloco (Duplicar e Melhorar)</span>
                                                        </button>
                                                    </div>

                                                    {aiEditSummary && (
                                                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2">
                                                            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                            <span>{aiEditSummary}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-warm-200 dark:border-slate-800 text-center space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                                                <Wand2 size={24} />
                                            </div>
                                            <h4 className="text-sm font-bold text-warm-900 dark:text-white">Nenhum bloco selecionado</h4>
                                            <p className="text-xs text-warm-500 dark:text-slate-400 leading-relaxed">
                                                Clique em qualquer bloco no canvas central para editá-lo com a inteligência artificial, ou crie novos blocos na aba "Criar Blocos".
                                            </p>
                                            {blocks.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedBlockId(blocks[0].id)}
                                                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                                >
                                                    Selecionar Bloco 1 da Aula
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MODO 2: CRIAR NOVOS BLOCOS (BUILDER ORIGINAL APRIMORADO) */}
                            {aiMode === 'create' && (
                                <div className="space-y-3.5">
                                    {/* Prompt Form */}
                                    <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-warm-200 dark:border-slate-800 shadow-xs">
                                        <label className="block text-xs font-bold text-warm-800 dark:text-slate-200">
                                            O que você gostaria de criar nesta aula?
                                        </label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Ex: Crie uma aula completa sobre Comunicação de Más Notícias com protocolo SPIKES, 3 cards com ícones e um quiz..."
                                            className="w-full bg-warm-50 dark:bg-slate-950 border border-warm-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-warm-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-400 outline-none resize-none h-24 transition-shadow"
                                            disabled={isAiGenerating}
                                        />

                                        {/* Target Type Selector */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-warm-600 dark:text-slate-400 mb-1.5">
                                                Tipo de Conteúdo:
                                            </label>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {[
                                                    { id: 'full_page', label: '🚀 Aula Completa' },
                                                    { id: 'cards', label: '🎴 Cards c/ Ícones' },
                                                    { id: 'quiz', label: '❓ Quiz Fixação' },
                                                    { id: 'text', label: '📖 Texto Teórico' },
                                                    { id: 'flashcard', label: '🗂️ Flashcards' },
                                                    { id: 'clinical_case', label: '🩺 Caso Clínico' },
                                                ].map(t => (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setAiTargetType(t.id)}
                                                        className={`text-[11px] py-1.5 px-2 rounded-lg border font-medium transition-all text-left ${aiTargetType === t.id
                                                                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 font-bold shadow-2xs'
                                                                : 'bg-white dark:bg-slate-800 text-warm-600 dark:text-slate-300 border-warm-200 dark:border-slate-700 hover:bg-warm-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quick Suggestion Chips */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-warm-600 dark:text-slate-400 mb-1">
                                                Sugestões rápidas de temas:
                                            </label>
                                            <div className="flex flex-wrap gap-1">
                                                {[
                                                    'Comunicação SPIKES',
                                                    'Escala de Dor OMS',
                                                    'Bioética e Autonomia',
                                                    'Luto e Apoio Familiar'
                                                ].map((chip) => (
                                                    <button
                                                        key={chip}
                                                        type="button"
                                                        onClick={() => {
                                                            setAiPrompt(`Crie uma aula completa sobre ${chip} com introdução, cards explicativos com ícones e um quiz de fixação.`);
                                                            setAiTargetType('full_page');
                                                        }}
                                                        className="text-[10px] bg-warm-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-warm-700 dark:text-slate-300 hover:text-purple-800 dark:hover:text-purple-200 px-2 py-0.5 rounded-full border border-warm-200 dark:border-slate-700 transition-colors"
                                                    >
                                                        + {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Generate Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleAiGenerate()}
                                            disabled={!aiPrompt.trim() || isAiGenerating}
                                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isAiGenerating ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>Agente IA Criando Blocos...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={16} />
                                                    <span>Gerar Estrutura com Agente IA</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Generated Blocks Preview & Insertion */}
                                    {generatedBlocksResult && (
                                        <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-3.5 space-y-3 shadow-md animate-slide-down">
                                            <div className="flex items-start justify-between gap-2 border-b border-purple-100 dark:border-slate-800 pb-2">
                                                <div>
                                                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                                        ✨ Estrutura Gerada
                                                    </span>
                                                    <p className="text-xs font-semibold text-warm-900 dark:text-slate-100 mt-0.5">
                                                        {generatedBlocksResult.summary}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setGeneratedBlocksResult(null)}
                                                    className="text-warm-400 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200 p-1 rounded-md"
                                                    title="Limpar sugestão"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {/* Block Preview List */}
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                {generatedBlocksResult.blocks.map((b, i) => (
                                                    <div key={b.id || i} className="flex items-center justify-between p-2 bg-purple-50/70 dark:bg-slate-800/80 border border-purple-100 dark:border-slate-700 rounded-lg text-xs">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className="font-bold text-purple-800 dark:text-purple-300 bg-purple-200/70 dark:bg-purple-950 px-1.5 py-0.5 rounded text-[10px]">
                                                                {b.type.replace('Block', '')}
                                                            </span>
                                                            <span className="text-warm-700 dark:text-slate-300 truncate text-[11px]">
                                                                {b.data?.title || b.data?.headline || b.data?.question || 'Bloco de Conteúdo'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleInsertSingleGeneratedBlock(b)}
                                                            className="p-1 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 rounded text-[10px] font-bold shrink-0 flex items-center gap-0.5"
                                                            title="Inserir apenas este bloco"
                                                        >
                                                            <Plus size={12} /> Inserir
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Insert All Button */}
                                            <button
                                                type="button"
                                                onClick={handleInsertAllGeneratedBlocks}
                                                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <CheckCheck size={16} />
                                                <span>Inserir Todos os {generatedBlocksResult.blocks.length} Blocos na Aula</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: BANCO DE IMAGENS MÉDICAS & SAÚDE */}
                    {rightSidebarTab === 'images' && (
                        <div className="flex flex-col h-full min-h-0 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                            {/* Header & Direct Link Importer */}
                            <div className="bg-white p-3.5 rounded-xl border border-warm-200 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                                        <ImageIcon size={16} className="text-emerald-600" />
                                        Banco de Imagens Externo
                                    </span>
                                    <a
                                        href="https://unsplash.com/pt-br"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                                        title="Abrir o site oficial do Unsplash Brasil em nova aba"
                                    >
                                        <span>Unsplash Brasil</span>
                                        <ExternalLink size={10} />
                                    </a>
                                </div>

                                {/* Direct URL Import Box */}
                                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-2">
                                    <label className="block text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                                        <LinkIcon size={12} className="text-emerald-700" />
                                        Colar link copiado do Unsplash ou Web:
                                    </label>
                                    <div className="flex gap-1.5">
                                        <input
                                            type="text"
                                            value={directUrlInput}
                                            onChange={(e) => setDirectUrlInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleInsertDirectUrl()}
                                            placeholder="Ex: https://unsplash.com/pt-br/fotos/..."
                                            className="flex-1 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-warm-900 focus:ring-2 focus:ring-emerald-400 outline-none placeholder:text-warm-400"
                                            disabled={isResolvingDirectUrl}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleInsertDirectUrl}
                                            disabled={!directUrlInput.trim() || isResolvingDirectUrl}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                        >
                                            {isResolvingDirectUrl ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                            <span>Inserir</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="space-y-1.5 pt-1">
                                    <label className="block text-[11px] font-bold text-warm-700">
                                        Ou pesquise ao vivo no acervo:
                                    </label>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400" />
                                        <input
                                            type="text"
                                            value={imageSearchQuery}
                                            onChange={(e) => {
                                                setImageSearchQuery(e.target.value);
                                                fetchHealthcareImages(e.target.value, imageCategory);
                                            }}
                                            placeholder="Buscar enfermagem, hospital, idoso..."
                                            className="w-full bg-warm-50 border border-warm-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-warm-800 focus:ring-2 focus:ring-emerald-400 outline-none"
                                        />
                                        {imageSearchQuery && (
                                            <button
                                                onClick={() => {
                                                    setImageSearchQuery('');
                                                    fetchHealthcareImages('', imageCategory);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 p-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Category Pills */}
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Todas',
                                        'Cuidados Paliativos',
                                        'Enfermagem',
                                        'Idoso & Família',
                                        'Comunicação',
                                        'Bioética',
                                        'Medicamentos'
                                    ].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => {
                                                setImageCategory(cat);
                                                fetchHealthcareImages(imageSearchQuery, cat);
                                            }}
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${imageCategory === cat
                                                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                                    : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Grid */}
                            {isImageLoading ? (
                                <div className="p-8 text-center text-warm-400">
                                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
                                    <p className="text-xs">Buscando imagens...</p>
                                </div>
                            ) : imageResults.length === 0 ? (
                                <div className="p-8 text-center text-warm-400">
                                    <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">Nenhuma imagem encontrada para esta busca.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <span className="text-[11px] font-semibold text-warm-500">
                                        {imageResults.length} imagem(ns) disponível(is):
                                    </span>
                                    <div className="grid grid-cols-1 gap-3">
                                        {imageResults.map((img) => (
                                            <div
                                                key={img.id}
                                                className="group relative bg-white border border-warm-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all"
                                            >
                                                <div className="aspect-video w-full overflow-hidden bg-warm-100 relative">
                                                    <img
                                                        src={img.thumb_url || img.url}
                                                        alt={img.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                    <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                        {img.category}
                                                    </span>
                                                </div>
                                                <div className="p-2.5 space-y-2">
                                                    <p className="text-xs font-bold text-warm-800 line-clamp-1" title={img.title}>
                                                        {img.title}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-1 border-t border-warm-100">
                                                        <span className="text-[10px] text-warm-400 truncate max-w-[120px]">
                                                            📷 {img.author}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyImageUrl(img.url)}
                                                                className="p-1 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded text-[10px] flex items-center gap-0.5"
                                                                title="Copiar link direto da foto"
                                                            >
                                                                {copiedImageUrl === img.url ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleInsertImageAsBlock(img)}
                                                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                                                                title="Inserir como bloco de imagem na Aula"
                                                            >
                                                                <Plus size={12} /> Inserir Bloco
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: PROPRIEDADES DO BLOCO */}
                    {rightSidebarTab === 'properties' && (
                        <div className="p-4 flex-1 overflow-y-auto">
                            {!selectedBlock ? (
                                <div className="text-center text-warm-400 mt-12 space-y-2">
                                    <Settings size={32} className="mx-auto opacity-30" />
                                    <p className="text-sm font-medium">Nenhum bloco selecionado</p>
                                    <p className="text-xs">Clique em uma seção na aula para editar suas propriedades.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold bg-primary/10 text-primary dark:text-teal-300 dark:bg-teal-950/60 px-2 py-1 rounded-md border border-primary/20 dark:border-teal-800/60">
                                            {BLOCK_TEMPLATES.find(t => t.type === selectedBlock.type)?.label || selectedBlock.type}
                                        </span>
                                        <span className="text-[10px] text-warm-400 dark:text-slate-500 font-bold">#{selectedBlockIndex + 1}</span>
                                    </div>

                                    <div className="flex gap-1.5">
                                        <button onClick={() => moveBlock(selectedBlock.id, 'up')} disabled={selectedBlockIndex === 0} className="flex-1 flex items-center justify-center gap-1 p-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-lg text-warm-700 dark:text-slate-200 hover:bg-warm-100 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer">
                                            <ChevronUp size={14} /> Subir
                                        </button>
                                        <button onClick={() => moveBlock(selectedBlock.id, 'down')} disabled={selectedBlockIndex === blocks.length - 1} className="flex-1 flex items-center justify-center gap-1 p-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-lg text-warm-700 dark:text-slate-200 hover:bg-warm-100 dark:hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition-colors cursor-pointer">
                                            <ChevronDown size={14} /> Descer
                                        </button>
                                        <button onClick={() => duplicateBlock(selectedBlock.id)} className="p-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-lg text-warm-700 dark:text-slate-200 hover:bg-warm-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" title="Duplicar">
                                            <Copy size={14} />
                                        </button>
                                    </div>

                                    <hr className="border-warm-100 dark:border-slate-800" />

                                    {/* TextBlock Typography Studio */}
                                    {selectedBlock.type === 'TextBlock' && (
                                        <div className="space-y-5 text-left">
                                            <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-2">
                                                <h4 className="text-xs font-bold text-warm-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Type size={15} className="text-primary dark:text-teal-400" /> Estúdio de Tipografia
                                                </h4>
                                                <span className="text-[10px] bg-primary/10 text-primary dark:text-teal-300 dark:bg-teal-950 font-bold px-2 py-0.5 rounded-full border border-primary/20 dark:border-teal-800">Photoshop FX</span>
                                            </div>

                                            {/* 1. Família da Fonte */}
                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1">Família da Fonte</label>
                                                <select
                                                    value={selectedBlock.styles?.fontFamily || 'sans-serif'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontFamily: e.target.value } })}
                                                    className="w-full bg-warm-50 dark:bg-slate-900 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary outline-none"
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
                                                    <label className="text-xs font-bold text-warm-700 dark:text-slate-300">Tamanho da Fonte</label>
                                                    <span className="text-xs font-bold text-primary dark:text-teal-300 bg-primary/5 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-primary/20 dark:border-teal-800">
                                                        {selectedBlock.styles?.fontSize ?? 16}px
                                                    </span>
                                                </div>
                                                <input
                                                    type="range" min="12" max="56"
                                                    value={selectedBlock.styles?.fontSize ?? 16}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: parseInt(e.target.value) } })}
                                                    className="w-full accent-primary h-2 bg-warm-200 dark:bg-slate-700 rounded-lg cursor-pointer"
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
                                                            className={`flex-1 py-1 text-[10px] rounded-lg border font-semibold transition-all cursor-pointer ${(selectedBlock.styles?.fontSize ?? 16) === sz.size
                                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border-warm-200 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            {sz.label.split(' ')[0]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 3. Espessura da Fonte (Weight) */}
                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Espessura (Peso)</label>
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
                                                            className={`py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${(selectedBlock.styles?.fontWeight || '400') === w.value
                                                                    ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border-warm-200 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            {w.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 4. Alinhamento */}
                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Alinhamento</label>
                                                <div className="flex bg-warm-50 dark:bg-slate-800 p-1 rounded-xl border border-warm-200 dark:border-slate-700 gap-1">
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
                                                            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${(selectedBlock.styles?.textAlign || 'left') === align.value
                                                                    ? 'bg-white dark:bg-slate-900 text-primary dark:text-teal-400 shadow-sm font-bold border border-warm-200 dark:border-slate-700'
                                                                    : 'text-warm-400 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200'
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
                                                    <label className="block text-[11px] font-bold text-warm-700 dark:text-slate-300 mb-1">Caixa (Transform)</label>
                                                    <div className="flex bg-warm-50 dark:bg-slate-800 p-1 rounded-xl border border-warm-200 dark:border-slate-700 gap-1">
                                                        {[
                                                            { value: 'none', label: 'Aa' },
                                                            { value: 'uppercase', label: 'AA' },
                                                            { value: 'lowercase', label: 'aa' }
                                                        ].map(t => (
                                                            <button
                                                                key={t.value}
                                                                onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textTransform: t.value } })}
                                                                className={`flex-1 py-1 text-xs rounded-lg transition-all cursor-pointer ${(selectedBlock.styles?.textTransform || 'none') === t.value
                                                                        ? 'bg-white dark:bg-slate-900 text-primary dark:text-teal-400 font-bold shadow-sm border border-warm-200 dark:border-slate-700'
                                                                        : 'text-warm-400 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200'
                                                                    }`}
                                                            >
                                                                {t.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-warm-700 dark:text-slate-300 mb-1">Decoração</label>
                                                    <div className="flex bg-warm-50 dark:bg-slate-800 p-1 rounded-xl border border-warm-200 dark:border-slate-700 gap-1">
                                                        {[
                                                            { value: 'none', label: '—' },
                                                            { value: 'underline', icon: <Underline size={14} /> },
                                                            { value: 'line-through', icon: <Strikethrough size={14} /> }
                                                        ].map(d => (
                                                            <button
                                                                key={d.value}
                                                                onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textDecoration: d.value } })}
                                                                className={`flex-1 py-1 text-xs rounded-lg flex items-center justify-center transition-all cursor-pointer ${(selectedBlock.styles?.textDecoration || 'none') === d.value
                                                                        ? 'bg-white dark:bg-slate-900 text-primary dark:text-teal-400 font-bold shadow-sm border border-warm-200 dark:border-slate-700'
                                                                        : 'text-warm-400 dark:text-slate-400 hover:text-warm-700 dark:hover:text-slate-200'
                                                                    }`}
                                                            >
                                                                {d.icon || d.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6. Entrelinha (Line Height), Espaço Parágrafo e Tracking (Letter Spacing) */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-warm-700 dark:text-slate-300 mb-1">Entrelinha</label>
                                                    <select
                                                        value={selectedBlock.styles?.lineHeight || '1.4'}
                                                        onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, lineHeight: e.target.value } })}
                                                        className="w-full bg-warm-50 dark:bg-slate-900 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                                                    >
                                                        <option value="1.15">Compacto (1.15)</option>
                                                        <option value="1.4">Padrão (1.4)</option>
                                                        <option value="1.7">Confortável (1.7)</option>
                                                        <option value="2.0">Espaçoso (2.0)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-warm-700 dark:text-slate-300 mb-1">Espaço Parágrafo</label>
                                                    <select
                                                        value={selectedBlock.styles?.paragraphSpacing || '0px'}
                                                        onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, paragraphSpacing: e.target.value } })}
                                                        className="w-full bg-warm-50 dark:bg-slate-900 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
                                                    >
                                                        <option value="0px">Nenhum (0px)</option>
                                                        <option value="4px">Pequeno (4px)</option>
                                                        <option value="8px">Suave (8px)</option>
                                                        <option value="16px">Médio (16px)</option>
                                                        <option value="24px">Grande (24px)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-warm-700 dark:text-slate-300 mb-1">Letras (Tracking)</label>
                                                    <select
                                                        value={selectedBlock.styles?.letterSpacing || 'normal'}
                                                        onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, letterSpacing: e.target.value } })}
                                                        className="w-full bg-warm-50 dark:bg-slate-900 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-primary outline-none"
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
                                                    <label className="text-xs font-bold text-warm-700 dark:text-slate-300">Cor do Texto</label>
                                                    <span className="text-[11px] font-mono text-warm-500 dark:text-slate-400">{selectedBlock.styles?.textColor || '#374151'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-wrap gap-1.5 flex-1">
                                                        {['#111827', '#374151', '#4b5563', '#9ca3af', '#1e3a8a', '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706'].map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, textColor: c } })}
                                                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${(selectedBlock.styles?.textColor || '#374151') === c ? 'border-primary dark:border-teal-400 shadow-md scale-110' : 'border-warm-200 dark:border-slate-700'
                                                                    }`}
                                                                style={{ backgroundColor: c }}
                                                                title={c}
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
                                                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center text-[8px] font-bold ${(selectedBlock.styles?.backgroundColor || 'transparent') === bg.color ? 'border-primary shadow-md scale-110' : 'border-warm-200'
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
                                                            className={`py-1.5 px-2 text-xs rounded-xl border transition-all ${(selectedBlock.styles?.textShadow || 'none') === sh.value
                                                                    ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                                    : 'bg-warm-50 text-warm-600 border-warm-200 hover:bg-warm-100'
                                                                }`}
                                                        >
                                                            {sh.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 10. Ícone Lateral do Texto (Opcional) */}
                                            <div className="pt-3 border-t border-warm-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-warm-700 flex items-center gap-1.5">
                                                        <BookOpen size={14} className="text-primary" /> Ícone Lateral do Texto
                                                    </label>
                                                    {(selectedBlock.data?.icon_name || selectedBlock.data?.icon) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, icon_name: undefined, icon: undefined } })}
                                                            className="text-[10px] text-red-600 hover:text-red-700 font-bold hover:underline"
                                                        >
                                                            Remover Ícone
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-1.5 mb-3">
                                                    {[
                                                        { name: 'BookOpen', label: 'Livro Aberto' },
                                                        { name: 'Book', label: 'Livro' },
                                                        { name: 'Stethoscope', label: 'Estetoscópio' },
                                                        { name: 'HeartPulse', label: 'Cuidado' },
                                                        { name: 'Brain', label: 'Cérebro' },
                                                        { name: 'HeartHandshake', label: 'Acolhimento' },
                                                        { name: 'Scale', label: 'Ética' },
                                                        { name: 'Users', label: 'Pessoas' },
                                                        { name: 'Sparkles', label: 'Destaque' },
                                                        { name: 'Lightbulb', label: 'Ideia' },
                                                        { name: 'Info', label: 'Info' },
                                                        { name: 'HelpCircle', label: 'Dúvidas' }
                                                    ].map(item => (
                                                        <button
                                                            key={item.name}
                                                            type="button"
                                                            onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, icon_name: item.name, icon: item.name } })}
                                                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 transition-all ${(selectedBlock.data?.icon_name || selectedBlock.data?.icon) === item.name
                                                                    ? 'bg-primary text-white border-primary shadow-xs font-bold'
                                                                    : 'bg-warm-50 text-warm-700 border-warm-200 hover:bg-warm-100'
                                                                }`}
                                                            title={item.label}
                                                        >
                                                            <span className="text-[10px] truncate max-w-full">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                {(selectedBlock.data?.icon_name || selectedBlock.data?.icon) && (
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-warm-600 mb-1">Cor do Ícone</label>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            {[
                                                                { id: 'primary', label: 'Oliva', bg: 'bg-primary' },
                                                                { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-600' },
                                                                { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
                                                                { id: 'purple', label: 'Roxo', bg: 'bg-purple-600' },
                                                                { id: 'amber', label: 'Âmbar', bg: 'bg-amber-600' },
                                                                { id: 'rose', label: 'Rosa', bg: 'bg-rose-600' }
                                                            ].map(c => (
                                                                <button
                                                                    key={c.id}
                                                                    type="button"
                                                                    onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, iconColor: c.id } })}
                                                                    className={`py-1 px-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 transition-all ${(selectedBlock.data?.iconColor || 'primary') === c.id
                                                                            ? 'border-warm-900 bg-warm-100 font-extrabold shadow-xs'
                                                                            : 'border-warm-200 hover:bg-warm-50 text-warm-700'
                                                                        }`}
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full ${c.bg}`} />
                                                                    <span className="truncate">{c.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quiz Properties */}
                                    {selectedBlock.type === 'QuizBlock' && (
                                        <div className="space-y-6">
                                            {selectedBlock.data.questions?.map((q: any, qIndex: number) => (
                                                <div key={qIndex} className="p-3.5 bg-warm-50/80 dark:bg-slate-800/80 border border-warm-200 dark:border-slate-700 rounded-2xl space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-xs font-bold text-warm-700 dark:text-slate-300">Pergunta {qIndex + 1}</h4>
                                                        <button onClick={() => {
                                                            const qs = [...selectedBlock.data.questions];
                                                            qs.splice(qIndex, 1);
                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, questions: qs } });
                                                        }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                                                    </div>
                                                    <textarea
                                                        value={q.text}
                                                        onChange={e => updateQuizQuestion(qIndex, 'text', e.target.value)}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl p-2.5 text-xs"
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
                                                                    className="flex-1 bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs"
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
                                                className="w-full py-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
                                            >
                                                + Adicionar Pergunta
                                            </button>
                                        </div>
                                    )}

                                    {/* ClinicalCaseBlock Properties */}
                                    {selectedBlock.type === 'ClinicalCaseBlock' && (
                                        <div className="space-y-5 text-left">
                                            {/* 1. Dados do Paciente */}
                                            <div className="space-y-3 p-3.5 bg-warm-50/80 dark:bg-slate-800/80 rounded-2xl border border-warm-200 dark:border-slate-700">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-warm-900 dark:text-slate-100 border-b border-warm-200/80 dark:border-slate-700 pb-1.5">
                                                    <span>👤 Dados do Paciente e Local</span>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-warm-700 dark:text-slate-300 mb-1">Nome e Idade do Paciente</label>
                                                    <input
                                                        type="text"
                                                        value={selectedBlock.data?.patient_name || ''}
                                                        onChange={e => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, patient_name: e.target.value } })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-warm-900 dark:text-slate-100"
                                                        placeholder="Ex: Dona Maria de Lourdes, 72 anos"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-warm-700 dark:text-slate-300 mb-1">Local / Unidade de Atendimento</label>
                                                    <input
                                                        type="text"
                                                        value={selectedBlock.data?.setting || ''}
                                                        onChange={e => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, setting: e.target.value } })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl p-2 text-xs text-warm-900 dark:text-slate-100"
                                                        placeholder="Ex: Enfermaria de Cuidados Paliativos ou Domicílio"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-warm-700 dark:text-slate-300 mb-1">Diagnóstico e Histórico de Base</label>
                                                    <input
                                                        type="text"
                                                        value={selectedBlock.data?.diagnosis || ''}
                                                        onChange={e => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, diagnosis: e.target.value } })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl p-2 text-xs text-warm-900 dark:text-slate-100"
                                                        placeholder="Ex: Neoplasia pulmonar avançada em cuidados paliativos"
                                                    />
                                                </div>
                                            </div>

                                            {/* 2. Sinais Vitais do Paciente */}
                                            <div className="space-y-3 p-3.5 bg-warm-50/80 dark:bg-slate-800/80 rounded-2xl border border-warm-200 dark:border-slate-700">
                                                <div className="flex items-center justify-between text-xs font-bold text-warm-900 dark:text-slate-100 border-b border-warm-200/80 dark:border-slate-700 pb-1.5">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>🩺 Sinais Vitais no Leito</span>
                                                    </span>
                                                    <span className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full font-bold">
                                                        Prontuário
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">P.A. (Pressão)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.pa || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), pa: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-warm-800 dark:text-white"
                                                            placeholder="130/80 mmHg"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">F.C. (Cardíaca)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.fc || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), fc: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-warm-800 dark:text-white"
                                                            placeholder="102 bpm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">F.R. (Respiratória)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.fr || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), fr: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400"
                                                            placeholder="28 irpm"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">Dor (EVA 0-10)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.dor || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), dor: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400"
                                                            placeholder="7/10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">SpO2 (Saturação)</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.spo2 || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), spo2: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-warm-800 dark:text-white"
                                                            placeholder="89%"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">Consciência</label>
                                                        <input
                                                            type="text"
                                                            value={selectedBlock.data?.vitals?.consciencia || ''}
                                                            onChange={e => {
                                                                const vitals = { ...(selectedBlock.data?.vitals || {}), consciencia: e.target.value };
                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, vitals } });
                                                            }}
                                                            className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-warm-800 dark:text-white"
                                                            placeholder="Lúcida e ansiosa"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Situação Clínica e Pergunta */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1">Cenário / Descrição da Situação no Leito</label>
                                                    <textarea
                                                        rows={4}
                                                        value={selectedBlock.data?.clinical_scenario || ''}
                                                        onChange={e => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, clinical_scenario: e.target.value } })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl p-2.5 text-xs leading-relaxed text-warm-900 dark:text-slate-100"
                                                        placeholder="Descreva detalhadamente a situação clínica e o sofrimento do paciente..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1">Pergunta de Tomada de Decisão</label>
                                                    <input
                                                        type="text"
                                                        value={selectedBlock.data?.decision_prompt || ''}
                                                        onChange={e => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decision_prompt: e.target.value } })}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-teal-800 dark:text-teal-300"
                                                        placeholder="Ex: Como enfermeiro(a) responsável, qual é a sua conduta imediata e prioritária?"
                                                    />
                                                </div>
                                            </div>

                                            {/* 4. Opções de Conduta e Desfechos com Letras */}
                                            <div className="pt-3 border-t border-warm-200 dark:border-slate-700 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-warm-800 dark:text-slate-200 uppercase tracking-wider">
                                                        Opções de Conduta (Letras A, B, C...)
                                                    </span>
                                                    <span className="text-[10px] text-warm-400 dark:text-slate-400 font-bold">
                                                        {selectedBlock.data?.decisions?.length || 0} Condutas
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    {selectedBlock.data?.decisions?.map((dec: any, dIdx: number) => {
                                                        const letter = String.fromCharCode(65 + dIdx); // A, B, C, D...
                                                        return (
                                                            <div key={dec.id || dIdx} className="p-3.5 bg-white dark:bg-slate-900 border-2 border-warm-200/90 dark:border-slate-700 rounded-2xl shadow-xs space-y-3">
                                                                
                                                                {/* Cabeçalho da Opção com Letra em Destaque */}
                                                                <div className="flex justify-between items-center border-b border-warm-100 dark:border-slate-800 pb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-full bg-teal-700 dark:bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                                                                            {letter}
                                                                        </span>
                                                                        <span className="text-xs font-extrabold text-warm-900 dark:text-slate-100">
                                                                            Conduta {letter} (Opção {letter})
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            value={dec.rating || 'optimal'}
                                                                            onChange={e => {
                                                                                const decs = [...(selectedBlock.data?.decisions || [])];
                                                                                decs[dIdx].rating = e.target.value;
                                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                            }}
                                                                            className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-all ${
                                                                                dec.rating === 'optimal'
                                                                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                                                                                    : dec.rating === 'acceptable'
                                                                                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                                                                                    : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                                                                            }`}
                                                                        >
                                                                            <option value="optimal">✨ Padrão-Ouro (Correta)</option>
                                                                            <option value="acceptable">⚠️ Parcialmente Adequada</option>
                                                                            <option value="inadequate">❌ Inadequada / Errada</option>
                                                                        </select>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const decs = [...(selectedBlock.data?.decisions || [])];
                                                                                decs.splice(dIdx, 1);
                                                                                updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                            }}
                                                                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                                                                            title={`Excluir Conduta ${letter}`}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Texto da Opção / Procedimento */}
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">
                                                                        Texto da Opção {letter} (O que o aluno lê para escolher)
                                                                    </label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={dec.label || ''}
                                                                        onChange={e => {
                                                                            const decs = [...(selectedBlock.data?.decisions || [])];
                                                                            decs[dIdx].label = e.target.value;
                                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                        }}
                                                                        className="w-full bg-warm-50/70 dark:bg-slate-950 border border-warm-300 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-warm-900 dark:text-slate-100"
                                                                        placeholder={`Descreva a conduta da Opção ${letter}...`}
                                                                    />
                                                                </div>

                                                                {/* Título do Desfecho */}
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">
                                                                        Título do Desfecho (Ex: Desfecho: Alívio da Dor)
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={dec.outcome_title || ''}
                                                                        onChange={e => {
                                                                            const decs = [...(selectedBlock.data?.decisions || [])];
                                                                            decs[dIdx].outcome_title = e.target.value;
                                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                        }}
                                                                        className="w-full bg-warm-50/70 dark:bg-slate-950 border border-warm-300 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-warm-900 dark:text-slate-100"
                                                                        placeholder="Título do desfecho clínico..."
                                                                    />
                                                                </div>

                                                                {/* Evolução do Paciente */}
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">
                                                                        Evolução do Paciente (O que aconteceu após essa conduta)
                                                                    </label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={dec.outcome_description || ''}
                                                                        onChange={e => {
                                                                            const decs = [...(selectedBlock.data?.decisions || [])];
                                                                            decs[dIdx].outcome_description = e.target.value;
                                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                        }}
                                                                        className="w-full bg-warm-50/70 dark:bg-slate-950 border border-warm-300 dark:border-slate-700 rounded-lg p-2 text-xs text-warm-900 dark:text-slate-100"
                                                                        placeholder="Explique o que aconteceu com o paciente..."
                                                                    />
                                                                </div>

                                                                {/* Justificativa Científica */}
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-warm-600 dark:text-slate-300 mb-0.5">
                                                                        Fundamentação Científica &amp; Bioética (Orientações da Professora)
                                                                    </label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={dec.scientific_rationale || ''}
                                                                        onChange={e => {
                                                                            const decs = [...(selectedBlock.data?.decisions || [])];
                                                                            decs[dIdx].scientific_rationale = e.target.value;
                                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                                        }}
                                                                        className="w-full bg-warm-50/70 dark:bg-slate-950 border border-warm-300 dark:border-slate-700 rounded-lg p-2 text-[11px] text-warm-700 dark:text-slate-300"
                                                                        placeholder="Diretrizes da ANCP / COFEN e referências científicas..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const decs = [...(selectedBlock.data?.decisions || [])];
                                                            const newLetter = String.fromCharCode(65 + decs.length);
                                                            decs.push({
                                                                id: `dec_${Date.now()}`,
                                                                label: `Nova Conduta ${newLetter}`,
                                                                rating: 'acceptable',
                                                                outcome_title: 'Desfecho a ser avaliado',
                                                                outcome_description: 'Evolução clínica resultante.',
                                                                scientific_rationale: 'Fundamentação científica conforme diretrizes ANCP.'
                                                            });
                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, decisions: decs } });
                                                        }}
                                                        className="w-full py-2.5 px-3 bg-teal-50 dark:bg-teal-950/60 border border-dashed border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Plus size={14} />
                                                        <span>Adicionar Nova Opção de Conduta ({String.fromCharCode(65 + (selectedBlock.data?.decisions?.length || 0))})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Flashcard Properties */}
                                    {selectedBlock.type === 'FlashcardBlock' && (
                                        <div className="space-y-4">
                                            {selectedBlock.data.cards?.map((card: any, cIndex: number) => (
                                                <div key={cIndex} className="p-3.5 bg-warm-50/80 dark:bg-slate-800/80 border border-warm-200 dark:border-slate-700 rounded-2xl space-y-2.5">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-xs font-bold text-warm-700 dark:text-slate-300">Cartão {cIndex + 1}</h4>
                                                        <button onClick={() => {
                                                            const cs = [...selectedBlock.data.cards];
                                                            cs.splice(cIndex, 1);
                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                        }} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input
                                                        type="text" value={card.front}
                                                        onChange={e => {
                                                            const cs = [...selectedBlock.data.cards];
                                                            cs[cIndex].front = e.target.value;
                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                        }}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl p-2 text-xs font-bold" placeholder="Frente (Termo)"
                                                    />
                                                    <textarea
                                                        value={card.back}
                                                        onChange={e => {
                                                            const cs = [...selectedBlock.data.cards];
                                                            cs[cIndex].back = e.target.value;
                                                            updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                        }}
                                                        className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl p-2 text-xs" placeholder="Verso (Definição)" rows={2}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const cs = [...(selectedBlock.data.cards || []), { front: '', back: '' }];
                                                    updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, cards: cs } });
                                                }}
                                                className="w-full py-2.5 bg-orange-50 dark:bg-amber-950/60 text-orange-700 dark:text-amber-300 border border-orange-200 dark:border-amber-800 font-bold text-xs rounded-xl hover:bg-orange-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                                            >
                                                + Adicionar Cartão
                                            </button>
                                        </div>
                                    )}

                                    {/* Image Properties */}
                                    {selectedBlock.type === 'ImageBlock' && (
                                        <div className="space-y-4">
                                            {selectedBlock.data.src && (
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => setCroppingImage(selectedBlock.data.originalSrc || selectedBlock.data.src)}
                                                        className="w-full px-4 py-2.5 bg-primary/10 dark:bg-teal-950/60 text-primary dark:text-teal-300 font-bold rounded-xl hover:bg-primary/20 dark:hover:bg-teal-900/60 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer border border-primary/20 dark:border-teal-800"
                                                    >
                                                        <Crop size={16} /> Recortar / Ajustar Imagem
                                                    </button>
                                                    {selectedBlock.data.originalSrc && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                updateBlock(selectedBlock.id, {
                                                                    data: { ...selectedBlock.data, src: selectedBlock.data.originalSrc },
                                                                    styles: { ...selectedBlock.styles, objectFit: 'contain', heightMode: 'auto' }
                                                                });
                                                                showToast('Imagem original restaurada!');
                                                            }}
                                                            className="w-full px-3 py-2 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 dark:hover:bg-slate-700 text-warm-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs border border-warm-200 dark:border-slate-700 cursor-pointer"
                                                        >
                                                            <RotateCcw size={14} /> Restaurar Imagem Original
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Enquadramento da Imagem</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBlock(selectedBlock.id, {
                                                            styles: {
                                                                ...selectedBlock.styles,
                                                                objectFit: 'contain',
                                                                heightMode: 'auto'
                                                            }
                                                        })}
                                                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${(selectedBlock.styles?.objectFit || 'contain') === 'contain' && selectedBlock.styles?.heightMode !== 'fixed'
                                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-warm-200 dark:border-slate-700 hover:bg-warm-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        Imagem Inteira (Sem corte)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateBlock(selectedBlock.id, {
                                                            styles: {
                                                                ...selectedBlock.styles,
                                                                objectFit: 'cover',
                                                                heightMode: 'fixed',
                                                                height: selectedBlock.styles?.height || 400
                                                            }
                                                        })}
                                                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${selectedBlock.styles?.objectFit === 'cover' || selectedBlock.styles?.heightMode === 'fixed'
                                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                                : 'bg-white dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-warm-200 dark:border-slate-700 hover:bg-warm-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        Preencher / Altura Fixa
                                                    </button>
                                                </div>
                                            </div>

                                            {selectedBlock.styles?.heightMode === 'fixed' && (
                                                <div>
                                                    <div className="flex items-center justify-between text-xs font-medium text-warm-600 dark:text-slate-300 mb-1">
                                                        <span>Altura Fixa</span>
                                                        <span className="font-bold text-primary dark:text-teal-300">{selectedBlock.styles?.height || 400}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="150"
                                                        max="800"
                                                        step="25"
                                                        value={selectedBlock.styles?.height || 400}
                                                        onChange={(e) => updateBlock(selectedBlock.id, {
                                                            styles: {
                                                                ...selectedBlock.styles,
                                                                height: parseInt(e.target.value),
                                                                heightMode: 'fixed'
                                                            }
                                                        })}
                                                        className="w-full accent-primary"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Largura Máxima do Bloco</label>
                                                <select
                                                    value={selectedBlock.styles?.containerWidth || 'max-w-4xl'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, containerWidth: e.target.value } })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-warm-800 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="max-w-md">Pequena (500px)</option>
                                                    <option value="max-w-2xl">Média (700px)</option>
                                                    <option value="max-w-4xl">Padrão (900px)</option>
                                                    <option value="max-w-6xl">Larga (1200px)</option>
                                                    <option value="w-full">100% da Tela</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Alinhamento</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { label: 'Esquerda', value: 'left' },
                                                        { label: 'Centro', value: 'center' },
                                                        { label: 'Direita', value: 'right' }
                                                    ].map((align) => (
                                                        <button
                                                            key={align.value}
                                                            type="button"
                                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, alignment: align.value } })}
                                                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${(selectedBlock.styles?.alignment || 'center') === align.value
                                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                                    : 'bg-white dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-warm-200 dark:border-slate-700 hover:bg-warm-50 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            {align.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Bordas Arredondadas</label>
                                                <select
                                                    value={selectedBlock.styles?.rounded || 'xl'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, rounded: e.target.value } })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-warm-800 dark:text-slate-200 focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="none">Nenhum (Reto)</option>
                                                    <option value="md">Suave</option>
                                                    <option value="xl">Médio (Padrão)</option>
                                                    <option value="2xl">Grande</option>
                                                    <option value="full">Círculo / Oval</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* Media Properties */}
                                    {selectedBlock.type === 'MediaBlock' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-warm-600 dark:text-slate-300 mb-1">URL do Vídeo (YouTube/Vimeo)</label>
                                                <input
                                                    type="text"
                                                    value={selectedBlock.data.url || ''}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, url: e.target.value } })}
                                                    className="w-full bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-warm-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                                                    placeholder="https://youtube.com/watch?v=..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* FeatureCardsBlock Properties */}
                                    {selectedBlock.type === 'FeatureCardsBlock' && (
                                        <div className="space-y-5 text-left">
                                            <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-2">
                                                <h4 className="text-xs font-bold text-warm-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Sparkles size={15} className="text-primary dark:text-teal-400" /> Configuração dos Cards
                                                </h4>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Número de Colunas</label>
                                                <div className="grid grid-cols-3 gap-1">
                                                    {[1, 2, 3].map(cols => (
                                                        <button
                                                            key={cols}
                                                            onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, columns: cols } })}
                                                            className={`py-1.5 text-xs rounded-lg border transition-all cursor-pointer ${(selectedBlock.styles?.columns || 2) === cols
                                                                    ? 'bg-primary text-white border-primary font-bold shadow-sm'
                                                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border-warm-200 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700'
                                                                }`}
                                                        >
                                                            {cols} Col
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Sombra dos Cards</label>
                                                <select
                                                    value={selectedBlock.styles?.cardShadow || 'md'}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, cardShadow: e.target.value } })}
                                                    className="w-full bg-warm-50 dark:bg-slate-900 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="none">Sem Sombra</option>
                                                    <option value="sm">Suave</option>
                                                    <option value="md">Média (Padrão)</option>
                                                    <option value="lg">Elevada / 3D</option>
                                                </select>
                                            </div>

                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                                                <p className="font-bold flex items-center gap-1">💡 Dica de Edição:</p>
                                                <p className="text-[11px] leading-relaxed">
                                                    Você pode <strong>clicar diretamente no ícone de qualquer card na tela</strong> para abrir o seletor visual de ícones e mudar as cores!
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* HeaderBlock Properties */}
                                    {selectedBlock.type === 'HeaderBlock' && (
                                        <div className="space-y-5 text-left">
                                            <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-2">
                                                <h4 className="text-xs font-bold text-warm-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                                                    <BookOpen size={15} className="text-primary dark:text-teal-400" /> Cabeçalho com Ícone
                                                </h4>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">Escolher Ícone</label>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {[
                                                        { name: 'BookOpen', label: 'Livro Aberto' },
                                                        { name: 'Book', label: 'Livro' },
                                                        { name: 'FileText', label: 'Documento' },
                                                        { name: 'Sparkles', label: 'Destaque' },
                                                        { name: 'HeartPulse', label: 'Cuidado' },
                                                        { name: 'Stethoscope', label: 'Saúde' },
                                                        { name: 'GraduationCap', label: 'Ensino' },
                                                        { name: 'Bookmark', label: 'Marcador' },
                                                        { name: 'HelpCircle', label: 'Dúvidas' },
                                                        { name: 'Info', label: 'Info' },
                                                        { name: 'Layers', label: 'Módulos' },
                                                        { name: 'Lightbulb', label: 'Ideia' }
                                                    ].map(item => (
                                                        <button
                                                            key={item.name}
                                                            type="button"
                                                            onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, icon: item.name } })}
                                                            className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${(selectedBlock.data?.icon || 'BookOpen') === item.name
                                                                    ? 'bg-primary text-white border-primary shadow-xs font-bold'
                                                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-warm-200 dark:border-slate-700 hover:bg-warm-100 dark:hover:bg-slate-700'
                                                                }`}
                                                            title={item.label}
                                                        >
                                                            <span className="text-[11px] truncate max-w-full">{item.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Cor de Destaque</label>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {[
                                                        { id: 'primary', label: 'Oliva', bg: 'bg-primary' },
                                                        { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-600' },
                                                        { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
                                                        { id: 'purple', label: 'Roxo', bg: 'bg-purple-600' },
                                                        { id: 'amber', label: 'Âmbar', bg: 'bg-amber-600' },
                                                        { id: 'rose', label: 'Rosa', bg: 'bg-rose-600' }
                                                    ].map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, iconColor: c.id } })}
                                                            className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${(selectedBlock.data?.iconColor || 'primary') === c.id
                                                                    ? 'border-warm-900 bg-warm-100 font-extrabold shadow-xs'
                                                                    : 'border-warm-200 hover:bg-warm-50 text-warm-700'
                                                                }`}
                                                        >
                                                            <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                                                            <span className="truncate">{c.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Tag / Badge Superior (Opcional)</label>
                                                <input
                                                    type="text"
                                                    value={selectedBlock.data?.badge || ''}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, badge: e.target.value } })}
                                                    placeholder="Ex: Módulo 1, Conceito..."
                                                    className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-3 bg-warm-50 rounded-2xl border border-warm-200">
                                                <span className="text-xs font-bold text-warm-800">Linha Divisória Inferior</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBlock.data?.showDivider !== false}
                                                    onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, showDivider: e.target.checked } })}
                                                    className="w-4 h-4 text-primary rounded cursor-pointer"
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
                            )}
                        </div>
                    )}
                </div>
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
                    originalUrl={selectedBlock?.data?.originalSrc || croppingImage}
                    onClose={() => setCroppingImage(null)}
                    onCropComplete={(newUrl) => {
                        if (selectedBlockId) {
                            const currentBlock = blocks.find(b => b.id === selectedBlockId);
                            const orig = currentBlock?.data?.originalSrc || croppingImage;
                            const isRestoring = newUrl === orig;
                            updateBlock(selectedBlockId, {
                                data: {
                                    ...currentBlock?.data,
                                    src: newUrl,
                                    originalSrc: orig
                                },
                                styles: {
                                    ...currentBlock?.styles,
                                    objectFit: 'contain',
                                    heightMode: 'auto'
                                }
                            });
                            showToast(isRestoring ? 'Imagem original restaurada com sucesso!' : 'Imagem recortada com sucesso!');
                        }
                        setCroppingImage(null);
                    }}
                />
            )}
            {/* ═══ MOBILE BOTTOM NAVIGATION BAR (md:hidden) ═══ */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-warm-200 dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-2xl">
                <button
                    type="button"
                    onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'blocks' ? null : 'blocks')}
                    className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                        mobileActiveDrawer === 'blocks' ? 'text-primary font-bold' : 'text-warm-600 dark:text-slate-400'
                    }`}
                >
                    <Plus size={18} className="p-0.5 rounded-full bg-primary/10 text-primary" />
                    <span className="text-[10px]">Novo Bloco</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        if (!selectedBlockId && blocks.length > 0) {
                            setSelectedBlockId(blocks[0].id);
                        }
                        setMobileActiveDrawer(mobileActiveDrawer === 'properties' ? null : 'properties');
                    }}
                    className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                        mobileActiveDrawer === 'properties' ? 'text-primary font-bold' : 'text-warm-600 dark:text-slate-400'
                    }`}
                >
                    <Settings size={18} className={selectedBlockId ? 'text-primary' : ''} />
                    <span className="text-[10px]">Propriedades</span>
                </button>

                <button
                    type="button"
                    onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'ai' ? null : 'ai')}
                    className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                        mobileActiveDrawer === 'ai' ? 'text-purple-600 font-bold' : 'text-warm-600 dark:text-slate-400'
                    }`}
                >
                    <Wand2 size={18} className="text-purple-600" />
                    <span className="text-[10px]">Agente IA</span>
                </button>

                <button
                    type="button"
                    onClick={() => setMobileActiveDrawer(mobileActiveDrawer === 'media' ? null : 'media')}
                    className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                        mobileActiveDrawer === 'media' ? 'text-emerald-600 font-bold' : 'text-warm-600 dark:text-slate-400'
                    }`}
                >
                    <ImageIcon size={18} className="text-emerald-600" />
                    <span className="text-[10px]">Fotos/Mídia</span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowPublishModal(true)}
                    className="flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl bg-primary text-white font-bold shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                    <Save size={16} />
                    <span className="text-[10px]">Publicar</span>
                </button>
            </div>

            {/* ═══ MOBILE BOTTOM DRAWER / BOTTOM SHEET MODAL (md:hidden) ═══ */}
            {mobileActiveDrawer && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-fade-in">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
                        onClick={() => setMobileActiveDrawer(null)} 
                    />

                    {/* Sliding Panel */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-warm-200 dark:border-slate-800 max-h-[82vh] flex flex-col z-10 animate-slide-up overflow-hidden">
                        {/* Drag Handle */}
                        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                            <div className="w-12 h-1.5 bg-warm-300 dark:bg-slate-700 rounded-full" />
                        </div>

                        {/* Drawer Header */}
                        <div className="px-4 py-2.5 border-b border-warm-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                {mobileActiveDrawer === 'blocks' && (
                                    <div className="flex items-center gap-2">
                                        <Layers size={18} className="text-primary" />
                                        <h3 className="font-extrabold text-sm text-warm-900 dark:text-white">Adicionar Novo Bloco na Aula</h3>
                                    </div>
                                )}
                                {mobileActiveDrawer === 'properties' && (
                                    <div className="flex items-center gap-2">
                                        <Settings size={18} className="text-primary" />
                                        <h3 className="font-extrabold text-sm text-warm-900 dark:text-white">
                                            {selectedBlock ? `Editar: ${BLOCK_TEMPLATES.find(t => t.type === selectedBlock.type)?.label || selectedBlock.type}` : 'Propriedades do Bloco'}
                                        </h3>
                                    </div>
                                )}
                                {mobileActiveDrawer === 'ai' && (
                                    <div className="flex items-center gap-2">
                                        <Wand2 size={18} className="text-purple-600" />
                                        <h3 className="font-extrabold text-sm text-warm-900 dark:text-white">Criador com Inteligência Artificial</h3>
                                    </div>
                                )}
                                {mobileActiveDrawer === 'media' && (
                                    <div className="flex items-center gap-2">
                                        <ImageIcon size={18} className="text-emerald-600" />
                                        <h3 className="font-extrabold text-sm text-warm-900 dark:text-white">Fotos & Banco de Imagens</h3>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setMobileActiveDrawer(null)}
                                className="p-1.5 text-warm-500 hover:text-warm-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-warm-100 dark:bg-slate-800 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar pb-10">
                            {mobileActiveDrawer === 'blocks' && (
                                <div className="grid grid-cols-1 gap-2.5 pb-6">
                                    <p className="text-xs text-warm-500 mb-1">Toque em qualquer recurso abaixo para inseri-lo na aula:</p>
                                    {BLOCK_TEMPLATES.map(tmpl => (
                                        <button
                                            key={tmpl.type}
                                            type="button"
                                            onClick={() => {
                                                addBlock(tmpl.type);
                                                setMobileActiveDrawer(null);
                                                showToast(`✨ Bloco ${tmpl.label} adicionado!`);
                                            }}
                                            className="flex items-center gap-3.5 p-3.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-2xl hover:border-primary/50 text-left active:scale-98 transition-all cursor-pointer shadow-xs"
                                        >
                                            <div className="bg-white dark:bg-slate-700 p-2.5 rounded-xl text-primary shadow-xs shrink-0">
                                                {tmpl.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-warm-900 dark:text-white">{tmpl.label}</h4>
                                                <p className="text-xs text-warm-500 dark:text-slate-400 leading-tight">{tmpl.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {mobileActiveDrawer === 'properties' && (
                                <div className="pb-6">
                                    {!selectedBlock ? (
                                        <div className="text-center py-6 space-y-3">
                                            <p className="text-xs text-warm-500">Selecione um bloco da aula para editar:</p>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {blocks.map((b, idx) => (
                                                    <button
                                                        key={b.id}
                                                        type="button"
                                                        onClick={() => setSelectedBlockId(b.id)}
                                                        className="w-full p-2.5 rounded-xl bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 text-left font-bold text-xs flex items-center justify-between"
                                                    >
                                                        <span>{idx + 1}. {BLOCK_TEMPLATES.find(t => t.type === b.type)?.label || b.type}</span>
                                                        <Settings size={14} className="text-primary" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                                                <span className="text-xs font-bold text-primary">
                                                    Editando: {BLOCK_TEMPLATES.find(t => t.type === selectedBlock.type)?.label || selectedBlock.type}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(selectedBlock.id, 'up')}
                                                        disabled={selectedBlockIndex === 0}
                                                        className="p-1 rounded bg-white border border-warm-200 text-warm-600 disabled:opacity-30 text-xs"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveBlock(selectedBlock.id, 'down')}
                                                        disabled={selectedBlockIndex === blocks.length - 1}
                                                        className="p-1 rounded bg-white border border-warm-200 text-warm-600 disabled:opacity-30 text-xs"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Quiz question/options editing if QuizBlock */}
                                            {selectedBlock.type === 'QuizBlock' && (
                                                <div className="space-y-3">
                                                    <label className="block text-xs font-bold text-warm-700">Título do Quiz</label>
                                                    <input
                                                        type="text"
                                                        value={selectedBlock.data?.title || ''}
                                                        onChange={(e) => updateBlock(selectedBlock.id, { data: { ...selectedBlock.data, title: e.target.value } })}
                                                        className="w-full bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs"
                                                        placeholder="Título do Quiz"
                                                    />
                                                </div>
                                            )}

                                            {/* TextBlock quick typography or content */}
                                            {selectedBlock.type === 'TextBlock' && (
                                                <div className="space-y-3">
                                                    <label className="block text-xs font-bold text-warm-700">Tamanho do Texto</label>
                                                    <div className="flex gap-1.5">
                                                        {[14, 16, 20, 24, 30].map(sz => (
                                                            <button
                                                                key={sz}
                                                                type="button"
                                                                onClick={() => updateBlock(selectedBlock.id, { styles: { ...selectedBlock.styles, fontSize: sz } })}
                                                                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                                                                    (selectedBlock.styles?.fontSize ?? 16) === sz
                                                                        ? 'bg-primary text-white border-primary'
                                                                        : 'bg-warm-50 border-warm-200 text-warm-700'
                                                                }`}
                                                            >
                                                                {sz}px
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Button to delete block */}
                                            <div className="pt-4 border-t border-warm-100">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        deleteBlock(selectedBlock.id);
                                                        setMobileActiveDrawer(null);
                                                    }}
                                                    className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs border border-rose-200 flex justify-center items-center gap-1.5"
                                                >
                                                    <Trash2 size={14} /> Excluir Este Bloco
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {mobileActiveDrawer === 'ai' && (
                                <div className="space-y-3 pb-6">
                                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl">
                                        <p className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-purple-600" /> Agente IA de Criação de Aulas
                                        </p>
                                        <p className="text-[11px] text-purple-700">Digite o tema da aula para gerar o conteúdo automaticamente.</p>
                                    </div>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Ex: Crie uma aula completa sobre Comunicação de Más Notícias..."
                                        className="w-full bg-warm-50 border border-warm-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-400 outline-none h-24 resize-none"
                                        disabled={isAiGenerating}
                                    />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await handleAiGenerate();
                                            setMobileActiveDrawer(null);
                                        }}
                                        disabled={!aiPrompt.trim() || isAiGenerating}
                                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
                                    >
                                        {isAiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                        <span>{isAiGenerating ? 'Criando Conteúdo com IA...' : 'Gerar Conteúdo Agora'}</span>
                                    </button>
                                </div>
                            )}

                            {mobileActiveDrawer === 'media' && (
                                <div className="space-y-3 pb-6">
                                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                                        <p className="text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                                            <ImageIcon size={14} className="text-emerald-600" /> Banco de Imagens Médicas
                                        </p>
                                        <p className="text-[11px] text-emerald-700">Pesquise fotos de saúde e cuidados paliativos para ilustrar sua aula.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={imageSearchQuery}
                                            onChange={(e) => setImageSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && fetchHealthcareImages(imageSearchQuery, imageCategory)}
                                            placeholder="Buscar: médico, idoso, paciente..."
                                            className="flex-1 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 text-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fetchHealthcareImages(imageSearchQuery, imageCategory)}
                                            className="px-3 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                    {imageResults.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                            {imageResults.slice(0, 6).map((img) => (
                                                <div key={img.id} className="relative rounded-xl overflow-hidden border border-warm-200 group">
                                                    <img src={img.thumb_url || img.url} alt={img.title} className="w-full h-24 object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleInsertImageAsBlock(img);
                                                            setMobileActiveDrawer(null);
                                                        }}
                                                        className="absolute inset-0 bg-black/50 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
                                                    >
                                                        + Inserir
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING RICH TEXT TOOLBAR FOR TEXT SELECTION */}
            <WixFloatingToolbar />
        </div>
    );
};

export default ModuleContentEditor;
