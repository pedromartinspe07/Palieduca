import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    History, GitCommit, RotateCcw, Trash2, Clock, 
    User, Loader2, BookmarkPlus, FileText
} from 'lucide-react';
import type { BlockData } from './blocks/types';

const API_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

export interface RevisionItem {
    id: number;
    page_name: string;
    content: string;
    author_name: string;
    created_at: string;
    description?: string | null;
}

interface VersionHistoryPanelProps {
    pageIdentifier: string;
    pageTitle?: string;
    currentBlocks: BlockData[];
    onRestoreVersion: (blocks: BlockData[], revisionDescription: string) => void;
    showToast: (msg: string) => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
    pageIdentifier,
    pageTitle = 'Página Atual',
    currentBlocks,
    onRestoreVersion,
    showToast
}) => {
    const { user, token: authToken } = useAuth();
    const [revisions, setRevisions] = useState<RevisionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [creatingSnapshot, setCreatingSnapshot] = useState(false);
    const [snapshotMessage, setSnapshotMessage] = useState('');
    const [activeRevisionId, setActiveRevisionId] = useState<number | null>(null);

    const storageKey = `palieduca_revisions_cache_${pageIdentifier}`;

    const getToken = () => {
        return authToken || localStorage.getItem('palieduca_token') || localStorage.getItem('token') || '';
    };

    // Carregar revisões do backend com fallback para o localStorage
    const fetchRevisions = useCallback(async () => {
        if (!pageIdentifier) return;
        setLoading(true);
        const token = getToken();

        try {
            const res = await fetch(`${API_URL}/api/pages/${pageIdentifier}/revisions`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setRevisions(data);
                    // Atualiza cache local
                    localStorage.setItem(storageKey, JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.warn('Falha ao buscar histórico no backend, buscando do cache local:', error);
        } finally {
            setLoading(false);
        }

        // Fallback local
        const cached = localStorage.getItem(storageKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed)) {
                    setRevisions(parsed);
                }
            } catch {
                setRevisions([]);
            }
        }
    }, [pageIdentifier, storageKey]);

    useEffect(() => {
        fetchRevisions();
    }, [fetchRevisions]);

    // Criar um novo ponto de restauração manual (Snapshot / Commit)
    const handleCreateSnapshot = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (currentBlocks.length === 0) {
            showToast('Não há blocos na página para salvar snapshot.');
            return;
        }

        setCreatingSnapshot(true);
        const token = getToken();
        const description = snapshotMessage.trim() || `Snapshot Manual (${currentBlocks.length} blocos)`;
        const contentStr = JSON.stringify(currentBlocks);
        const author = user?.nome || 'Pedro';

        try {
            const res = await fetch(`${API_URL}/api/pages/${pageIdentifier}/revisions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    content: contentStr,
                    description,
                    author_name: author
                })
            });

            if (res.ok) {
                const newRev = await res.json();
                setRevisions((prev) => [newRev, ...prev]);
                setSnapshotMessage('');
                showToast('Ponto de restauração salvo no histórico!');
                return;
            }
        } catch (error) {
            console.warn('Falha ao salvar no backend, salvando no cache local:', error);
        } finally {
            setCreatingSnapshot(false);
        }

        // Fallback local caso offline
        const localRev: RevisionItem = {
            id: Date.now(),
            page_name: pageIdentifier,
            content: contentStr,
            author_name: author,
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            description
        };

        const updated = [localRev, ...revisions];
        setRevisions(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setSnapshotMessage('');
        showToast('Ponto de restauração salvo localmente!');
    };

    // Restaurar uma versão
    const handleRestore = (rev: RevisionItem) => {
        try {
            const parsedBlocks = JSON.parse(rev.content);
            if (!Array.isArray(parsedBlocks)) {
                alert('O conteúdo salvo nesta versão não contém uma estrutura de blocos válida.');
                return;
            }

            // Antes de restaurar, salva o estado atual como backup de segurança caso o usuário queira voltar
            if (currentBlocks.length > 0) {
                const autoBackupRev: RevisionItem = {
                    id: Date.now(),
                    page_name: pageIdentifier,
                    content: JSON.stringify(currentBlocks),
                    author_name: user?.nome || 'Sistema',
                    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    description: `Ponto de segurança antes de restaurar "${rev.description || 'Versão anterior'}"`
                };
                
                // Tenta salvar o ponto de segurança em segundo plano
                const token = getToken();
                fetch(`${API_URL}/api/pages/${pageIdentifier}/revisions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        content: autoBackupRev.content,
                        description: autoBackupRev.description,
                        author_name: autoBackupRev.author_name
                    })
                }).catch(() => {});

                setRevisions(prev => [autoBackupRev, ...prev]);
            }

            setActiveRevisionId(rev.id);
            onRestoreVersion(parsedBlocks, rev.description || 'Versão Restaurada');
            showToast(`Versão "${rev.description || 'Anterior'}" restaurada com sucesso!`);
        } catch (error) {
            console.error('Erro ao restaurar versão:', error);
            alert('Não foi possível ler o conteúdo desta versão.');
        }
    };

    // Excluir uma versão do histórico
    const handleDeleteRevision = async (revId: number) => {
        if (!confirm('Deseja realmente remover esta versão do histórico?')) return;

        const token = getToken();
        try {
            await fetch(`${API_URL}/api/pages/${pageIdentifier}/revisions/${revId}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        } catch (e) {
            console.warn('Erro ao deletar revisão no backend:', e);
        }

        const updated = revisions.filter(r => r.id !== revId);
        setRevisions(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        showToast('Versão removida do histórico.');
    };

    const countBlocks = (contentStr: string): number => {
        try {
            const parsed = JSON.parse(contentStr);
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr.replace(' ', 'T'));
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {/* Header */}
            <div className="p-4 border-b border-warm-100 bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                        <History size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-warm-900">Histórico de Versões</h3>
                        <p className="text-[11px] text-warm-500 truncate max-w-[240px]">
                            {pageTitle} (Controle de Versões)
                        </p>
                    </div>
                </div>
            </div>

            {/* Criar Ponto de Restauração (Snapshot Form) */}
            <div className="p-4 bg-warm-50/70 border-b border-warm-200 shrink-0">
                <form onSubmit={handleCreateSnapshot} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                            <BookmarkPlus size={14} className="text-purple-600" />
                            Criar Ponto de Restauração
                        </label>
                        <span className="text-[10px] font-semibold text-warm-500 bg-warm-200/60 px-2 py-0.5 rounded-md">
                            {currentBlocks.length} {currentBlocks.length === 1 ? 'bloco' : 'blocos'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Descreva este ponto (ex: Antes de trocar texto)..."
                            value={snapshotMessage}
                            onChange={(e) => setSnapshotMessage(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none text-warm-800"
                        />
                        <button
                            type="submit"
                            disabled={creatingSnapshot || currentBlocks.length === 0}
                            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {creatingSnapshot ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <GitCommit size={14} />
                            )}
                            Salvar Ponto no Histórico
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista da Linha do Tempo */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-warm-400 gap-2">
                        <Loader2 className="animate-spin text-purple-600" size={28} />
                        <span className="text-xs">Carregando histórico...</span>
                    </div>
                ) : revisions.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-warm-100 text-warm-400 flex items-center justify-center mx-auto mb-3">
                            <Clock size={24} />
                        </div>
                        <h4 className="text-xs font-bold text-warm-700 mb-1">Nenhum ponto registrado ainda</h4>
                        <p className="text-[11px] text-warm-400 leading-relaxed">
                            Crie um ponto de restauração acima ou salve a página para registrar versões que você poderá recuperar a qualquer momento.
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-warm-200">
                        {revisions.map((rev, index) => {
                            const blockCount = countBlocks(rev.content);
                            const isActive = activeRevisionId === rev.id || (index === 0 && activeRevisionId === null);

                            return (
                                <div key={rev.id} className="relative group">
                                    {/* Timeline Node Point */}
                                    <div className={`absolute -left-[1.35rem] top-2.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                        isActive 
                                            ? 'bg-purple-600 border-white ring-2 ring-purple-400' 
                                            : 'bg-white border-warm-400 group-hover:border-purple-500'
                                    }`} />

                                    {/* Card da Versão */}
                                    <div className={`border rounded-2xl p-3.5 transition-all bg-white shadow-xs ${
                                        isActive 
                                            ? 'border-purple-300 ring-1 ring-purple-100 bg-purple-50/20' 
                                            : 'border-warm-200 hover:border-warm-300'
                                    }`}>
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <div className="flex-1">
                                                <h4 className="text-xs font-bold text-warm-900 leading-tight">
                                                    {rev.description || 'Ponto de Restauração'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-warm-500">
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Clock size={11} className="text-warm-400" />
                                                        {formatDate(rev.created_at)}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <User size={11} className="text-warm-400" />
                                                        {rev.author_name || 'Editor'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRevision(rev.id)}
                                                className="p-1 text-warm-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                title="Excluir este ponto do histórico"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-warm-100">
                                            <span className="text-[10px] font-semibold text-warm-600 bg-warm-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <FileText size={11} />
                                                {blockCount} {blockCount === 1 ? 'bloco' : 'blocos'}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleRestore(rev)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 shadow-xs ${
                                                    isActive
                                                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                }`}
                                            >
                                                <RotateCcw size={12} />
                                                {isActive ? 'Recarregar Esta' : 'Restaurar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
