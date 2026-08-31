import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    MessageSquare, 
    Send, 
    CornerDownRight, 
    ThumbsUp, 
    Trash2, 
    ShieldCheck, 
    Sparkles, 
    AlertCircle, 
    Loader2, 
    Award,
    LogIn
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

export interface CommentItem {
    id: number;
    module_slug: string;
    user_id: number;
    author_name: string;
    author_role: string;
    author_avatar?: string | null;
    content: string;
    created_at: string;
    is_pinned: boolean;
    likes_count: number;
    parent_id?: number | null;
    replies?: CommentItem[];
}

interface ModuleCommentsSectionProps {
    moduleSlug: string;
}

const ModuleCommentsSection: React.FC<ModuleCommentsSectionProps> = ({ moduleSlug }) => {
    const { user, token } = useAuth();
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newCommentText, setNewCommentText] = useState<string>('');
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

    // Carregar comentários
    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/modules/${moduleSlug}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [moduleSlug]);

    // Enviar comentário principal
    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText.trim() || submitting) return;

        setSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch(`${API_URL}/api/modules/${moduleSlug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newCommentText.trim() })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.detail || 'Erro ao publicar comentário.');
                return;
            }

            setNewCommentText('');
            await fetchComments();
        } catch (err) {
            setErrorMessage('Erro de conexão ao enviar comentário.');
        } finally {
            setSubmitting(false);
        }
    };

    // Enviar resposta aninhada (reply)
    const handlePostReply = async (parentId: number) => {
        if (!replyText.trim() || submitting) return;

        setSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch(`${API_URL}/api/modules/${moduleSlug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: replyText.trim(),
                    parent_id: parentId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.detail || 'Erro ao publicar resposta.');
                return;
            }

            setReplyText('');
            setReplyingToId(null);
            await fetchComments();
        } catch (err) {
            setErrorMessage('Erro de conexão ao enviar resposta.');
        } finally {
            setSubmitting(false);
        }
    };

    // Curtir / Like
    const handleLike = async (commentId: number) => {
        if (likedIds.has(commentId)) return;

        try {
            setLikedIds(prev => new Set(prev).add(commentId));
            const res = await fetch(`${API_URL}/api/comments/${commentId}/like`, {
                method: 'POST'
            });
            if (res.ok) {
                const data = await res.json();
                setComments(prev => updateLikesInTree(prev, commentId, data.likes_count));
            }
        } catch {
            /* silent */
        }
    };

    // Excluir comentário
    const handleDelete = async (commentId: number) => {
        if (!window.confirm('Tem certeza de que deseja excluir este comentário?')) return;

        try {
            const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                await fetchComments();
            } else {
                const data = await res.json();
                alert(data.detail || 'Erro ao excluir comentário.');
            }
        } catch (err) {
            alert('Erro de rede ao excluir.');
        }
    };

    const updateLikesInTree = (list: CommentItem[], targetId: number, count: number): CommentItem[] => {
        return list.map(item => {
            if (item.id === targetId) {
                return { ...item, likes_count: count };
            }
            if (item.replies && item.replies.length > 0) {
                return { ...item, replies: updateLikesInTree(item.replies, targetId, count) };
            }
            return item;
        });
    };

    const getRoleBadge = (role: string, name: string) => {
        const isPat = name.toLowerCase().includes('patrícia') || name.toLowerCase().includes('patricia');
        if (role === 'dona' || (role === 'professor' && isPat)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    <Award size={11} className="text-amber-700" />
                    Prof.ª Patrícia &bull; Docente UFPB
                </span>
            );
        }
        if (role === 'desenvolvedor') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 border border-teal-300 text-teal-900 text-[10px] font-extrabold uppercase tracking-wider">
                    💻 Equipe Técnica
                </span>
            );
        }
        if (role === 'professor' || role === 'moderador') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                    🎓 Docente / Monitor
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-warm-700 text-[10px] font-semibold">
                🩺 Estudante
            </span>
        );
    };

    return (
        <section className="mt-14 pt-10 border-t-2 border-warm-200/80">
            {/* Cabeçalho da Seção */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                        <MessageSquare size={16} />
                        <span>Comunidade Acadêmica &bull; UFPB</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-warm-900 mt-1">
                        Canal de Dúvidas &bull; Espaço de Diálogo
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-600 mt-1 max-w-2xl">
                        Tire suas dúvidas diretamente com a Prof.ª Patrícia e compartilhe suas vivências e reflexões clínicas em Cuidados Paliativos.
                    </p>
                </div>

                {/* Badge de Moderação Automática do Bot */}
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shrink-0 shadow-2xs">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <div>
                        <span className="block font-bold text-[11px] text-emerald-950">Bot de Moderação Ética Ativo</span>
                        <span className="text-[10px] text-emerald-700">Espaço seguro e respeitoso</span>
                    </div>
                </div>
            </div>

            {/* Aviso de Erro do Bot de Moderação */}
            {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex items-start gap-3 animate-fade-in shadow-xs">
                    <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                        <strong className="font-bold block text-rose-900">Aviso do Sistema de Moderação:</strong>
                        <p className="mt-0.5">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Caixa de Criação de Dúvida / Comentário */}
            {user ? (
                <form onSubmit={handlePostComment} className="mb-10 p-5 rounded-3xl bg-white border-2 border-warm-200/90 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                        <UserAvatar nome={user.nome} fotoUrl={user.foto_url} size="sm" />
                        <div>
                            <span className="text-xs font-bold text-warm-900 block">{user.nome}</span>
                            <span className="text-[10px] text-warm-500">Publicar como estudante logado</span>
                        </div>
                    </div>

                    <textarea
                        rows={3}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        placeholder="Escreva aqui sua dúvida teórica ou relato de caso para a Prof.ª Patrícia..."
                        className="w-full p-3.5 bg-warm-50/60 border border-warm-300 rounded-2xl text-xs sm:text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[11px] text-warm-400 font-medium">
                            💬 As mensagens são revisadas pelo bot ético e pela coordenação docente.
                        </span>
                        <button
                            type="submit"
                            disabled={!newCommentText.trim() || submitting}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={14} />
                                    <span>Enviar Dúvida</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-10 p-6 rounded-3xl bg-gradient-to-br from-teal-50/70 via-white to-warm-50 border-2 border-teal-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-warm-900">
                                Quer enviar uma pergunta para a Prof.ª Patrícia?
                            </h4>
                            <p className="text-xs text-warm-600 mt-0.5">
                                Crie sua conta gratuita ou faça login para interagir e esclarecer suas dúvidas na aula.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                        <LogIn size={15} />
                        <span>Fazer Login / Cadastre-se</span>
                    </Link>
                </div>
            )}

            {/* Listagem de Comentários */}
            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-warm-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-semibold">Carregando espaço de diálogo...</span>
                </div>
            ) : comments.length === 0 ? (
                <div className="py-12 text-center p-8 bg-warm-50/60 rounded-3xl border border-warm-200">
                    <Sparkles size={28} className="mx-auto text-warm-400 mb-2" />
                    <p className="text-sm font-bold text-warm-800">Seja o primeiro a enviar uma dúvida ou relato!</p>
                    <p className="text-xs text-warm-500 mt-1">
                        A professora Patrícia e a equipe da UFPB responderão diretamente aqui no módulo.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {comments.map(comment => {
                        const canDelete = user && (user.id === comment.user_id || ['dona', 'desenvolvedor', 'professor', 'moderador'].includes(user.cargo));
                        const isTeacher = comment.author_role === 'dona' || (comment.author_role === 'professor' && comment.author_name.toLowerCase().includes('patr'));

                        return (
                            <div 
                                key={comment.id}
                                className={`p-5 rounded-3xl border-2 transition-all shadow-xs ${
                                    isTeacher 
                                        ? 'bg-amber-50/40 border-amber-300/80 ring-2 ring-amber-200/40' 
                                        : 'bg-white border-warm-200/90 hover:border-warm-300'
                                }`}
                            >
                                {/* Cabeçalho do Comentário */}
                                <div className="flex items-start justify-between gap-3 pb-3 border-b border-warm-100">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar nome={comment.author_name} fotoUrl={comment.author_avatar} size="md" />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-sm font-bold text-warm-900">
                                                    {comment.author_name}
                                                </span>
                                                {getRoleBadge(comment.author_role, comment.author_name)}
                                            </div>
                                            <span className="text-[10px] text-warm-400 font-medium">
                                                {comment.created_at}
                                            </span>
                                        </div>
                                    </div>

                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(comment.id)}
                                            className="p-1.5 text-warm-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                            title="Excluir mensagem"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Conteúdo do Comentário */}
                                <div className="py-3 text-xs sm:text-sm text-warm-800 leading-relaxed font-normal">
                                    {comment.content}
                                </div>

                                {/* Ações (Like / Responder) */}
                                <div className="flex items-center gap-4 pt-2 text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => handleLike(comment.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                                            likedIds.has(comment.id)
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-warm-500 hover:bg-warm-100 hover:text-warm-800'
                                        }`}
                                    >
                                        <ThumbsUp size={13} />
                                        <span>Útil ({comment.likes_count || 0})</span>
                                    </button>

                                    {user && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                                setReplyText('');
                                            }}
                                            className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 px-3 py-1 rounded-xl hover:bg-teal-50 transition-all cursor-pointer"
                                        >
                                            <CornerDownRight size={13} />
                                            <span>Responder</span>
                                        </button>
                                    )}
                                </div>

                                {/* Formulário de Resposta Inline */}
                                {replyingToId === comment.id && (
                                    <div className="mt-4 pt-4 border-t border-warm-200 animate-fade-in">
                                        <div className="flex items-start gap-2.5">
                                            <CornerDownRight size={16} className="text-teal-600 mt-2 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <textarea
                                                    rows={2}
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder={`Responder para ${comment.author_name}...`}
                                                    className="w-full p-3 bg-warm-50/80 border border-warm-300 rounded-2xl text-xs text-warm-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplyingToId(null)}
                                                        className="px-3 py-1.5 text-xs text-warm-600 hover:bg-warm-100 rounded-xl transition-all cursor-pointer"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={!replyText.trim() || submitting}
                                                        onClick={() => handlePostReply(comment.id)}
                                                        className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                        <span>Publicar Resposta</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Respostas Encadeadas (Replies) */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-warm-100 space-y-3 pl-4 sm:pl-8">
                                        {comment.replies.map(reply => {
                                            const canDeleteReply = user && (user.id === reply.user_id || ['dona', 'desenvolvedor', 'professor', 'moderador'].includes(user.cargo));
                                            const isReplyTeacher = reply.author_role === 'dona' || (reply.author_role === 'professor' && reply.author_name.toLowerCase().includes('patr'));

                                            return (
                                                <div 
                                                    key={reply.id}
                                                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                                                        isReplyTeacher
                                                            ? 'bg-amber-50/60 border-amber-300'
                                                            : 'bg-warm-50/70 border-warm-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-warm-200/60">
                                                        <div className="flex items-center gap-2.5">
                                                            <UserAvatar nome={reply.author_name} fotoUrl={reply.author_avatar} size="xs" />
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    <span className="text-xs font-bold text-warm-900">
                                                                        {reply.author_name}
                                                                    </span>
                                                                    {getRoleBadge(reply.author_role, reply.author_name)}
                                                                </div>
                                                                <span className="text-[9px] text-warm-400">
                                                                    {reply.created_at}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {canDeleteReply && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(reply.id)}
                                                                className="p-1 text-warm-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                                                title="Excluir resposta"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="pt-2 text-xs text-warm-800 leading-relaxed font-normal">
                                                        {reply.content}
                                                    </div>

                                                    <div className="pt-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleLike(reply.id)}
                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                                                likedIds.has(reply.id)
                                                                    ? 'bg-primary/10 text-primary'
                                                                    : 'text-warm-500 hover:bg-warm-200/60'
                                                            }`}
                                                        >
                                                            <ThumbsUp size={11} />
                                                            <span>Útil ({reply.likes_count || 0})</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default ModuleCommentsSection;
