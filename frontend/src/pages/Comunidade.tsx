import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Search, Plus, CheckCircle2, Pin, 
    Sparkles, Heart, MessageCircle, AlertCircle, ArrowLeft, 
    Send, Trash2, Stethoscope, HelpCircle, Users, Bell, ThumbsUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import BotanicalBackground from '../components/effects/BotanicalBackground';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export interface ForumPost {
    id: number;
    user_id: number;
    author_name: string;
    author_role: string;
    author_avatar?: string | null;
    category: string;
    module_slug?: string | null;
    title: string;
    content: string;
    likes_count: number;
    replies_count: number;
    is_pinned: boolean;
    is_solved: boolean;
    created_at: string;
    has_liked: boolean;
}

export interface ForumReply {
    id: number;
    post_id: number;
    user_id: number;
    author_name: string;
    author_role: string;
    author_avatar?: string | null;
    content: string;
    likes_count: number;
    is_instructor_answer: boolean;
    created_at: string;
    has_liked: boolean;
}

const CATEGORIES = [
    { id: 'todos', label: 'Todos os Tópicos', icon: Users },
    { id: 'casos_clinicos', label: '🩺 Casos Clínicos', icon: Stethoscope },
    { id: 'duvidas', label: '💡 Dúvidas de Aulas', icon: HelpCircle },
    { id: 'experiencias', label: '🦋 Experiências & Humanização', icon: Heart },
    { id: 'avisos', label: '📢 Avisos da Professora', icon: Bell }
];

export const Comunidade: React.FC = () => {
    const { user, token } = useAuth();

    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unsolved'>('recent');

    // Selected Post Details Modal State
    const [activePost, setActivePost] = useState<ForumPost | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    // New Post Modal State
    const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('casos_clinicos');
    const [isSubmittingPost, setIsSubmittingPost] = useState(false);
    const [postError, setPostError] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/api/forum/posts`);
            if (selectedCategory !== 'todos') url.searchParams.set('category', selectedCategory);
            if (searchTerm.trim()) url.searchParams.set('search', searchTerm.trim());
            if (sortBy) url.searchParams.set('sort_by', sortBy);

            const res = await fetch(url.toString(), {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (err) {
            console.error('Erro ao buscar posts do fórum:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, sortBy]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPosts();
    };

    const handleOpenPost = async (post: ForumPost) => {
        setActivePost(post);
        setLoadingReplies(true);
        try {
            const res = await fetch(`${API_URL}/api/forum/posts/${post.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setActivePost(data.post);
                setReplies(data.replies);
            }
        } catch (err) {
            console.error('Erro ao carregar detalhes do post:', err);
        } finally {
            setLoadingReplies(false);
        }
    };

    const handleTogglePostLike = async (postId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/forum/posts/${postId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: data.likes_count, has_liked: data.liked } : p));
                if (activePost && activePost.id === postId) {
                    setActivePost(prev => prev ? { ...prev, likes_count: data.likes_count, has_liked: data.liked } : null);
                }
            }
        } catch (err) {
            console.error('Erro ao curtir post:', err);
        }
    };

    const handleToggleReplyLike = async (replyId: number) => {
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/forum/replies/${replyId}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReplies(prev => prev.map(r => r.id === replyId ? { ...r, likes_count: data.likes_count, has_liked: data.liked } : r));
            }
        } catch (err) {
            console.error('Erro ao curtir resposta:', err);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activePost || !token) return;
        setIsSendingReply(true);

        try {
            const res = await fetch(`${API_URL}/api/forum/posts/${activePost.id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyText })
            });

            if (res.ok) {
                const newReply = await res.json();
                setReplies(prev => [...prev, newReply]);
                setReplyText('');
                setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, replies_count: p.replies_count + 1 } : p));
                if (activePost) setActivePost(prev => prev ? { ...prev, replies_count: prev.replies_count + 1 } : null);
            }
        } catch (err) {
            console.error('Erro ao enviar resposta:', err);
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim() || !token) return;
        setIsSubmittingPost(true);
        setPostError('');

        try {
            const res = await fetch(`${API_URL}/api/forum/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    category: newCategory
                })
            });

            if (res.ok) {
                const created = await res.json();
                setPosts(prev => [created, ...prev]);
                setIsNewPostModalOpen(false);
                setNewTitle('');
                setNewContent('');
            } else {
                const errData = await res.json();
                setPostError(errData.detail || 'Falha ao criar tópico.');
            }
        } catch (err: any) {
            setPostError(`Erro de conexão: ${err.message}`);
        } finally {
            setIsSubmittingPost(false);
        }
    };

    const handleToggleSolved = async (postId: number) => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/forum/posts/${postId}/solve`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_solved: data.is_solved } : p));
                if (activePost && activePost.id === postId) {
                    setActivePost(prev => prev ? { ...prev, is_solved: data.is_solved } : null);
                }
            }
        } catch (err) {
            console.error('Erro ao marcar como resolvido:', err);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!token || !confirm('Tem certeza que deseja excluir esta discussão?')) return;
        try {
            const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                setActivePost(null);
            }
        } catch (err) {
            console.error('Erro ao excluir post:', err);
        }
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'casos_clinicos':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">🩺 Caso Clínico</span>;
            case 'duvidas':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">💡 Dúvida</span>;
            case 'avisos':
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">📢 Aviso Oficial</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">🦋 Humanização</span>;
        }
    };

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* ═══ HERO BANNER DA COMUNIDADE ═══ */}
                <div className="p-7 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={14} /> Espaço de Diálogo e Aprendizagem (UFPB)
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black">
                            Comunidade & Fórum de Casos Clínicos
                        </h1>
                        <p className="text-white/90 text-xs sm:text-sm leading-relaxed">
                            Debata condutas humanizadas, tire dúvidas com professores e compartilhe experiências reais de cuidados paliativos.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsNewPostModalOpen(true)}
                        className="px-5 py-3.5 bg-white hover:bg-warm-50 text-emerald-800 font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus size={18} /> Novo Tópico de Discussão
                    </button>
                </div>

                {/* ═══ FILTROS, BUSCA & CATEGORIAS ═══ */}
                <div className="space-y-4">
                    {/* Barra de Busca e Ordenação */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por tema, sintoma, medicamento..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-2xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 shadow-2xs"
                            />
                            <Search size={16} className="absolute left-3.5 top-3 text-warm-400" />
                        </form>

                        {/* Filtro de Ordenação */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-xs font-bold text-warm-500 dark:text-slate-400">Ordenar por:</span>
                            <select
                                value={sortBy}
                                onChange={(e: any) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-xl text-xs font-bold text-warm-800 dark:text-slate-200 outline-none cursor-pointer"
                            >
                                <option value="recent">Mais Recentes</option>
                                <option value="popular">Mais Curtidos</option>
                                <option value="unsolved">Não Resolvidos</option>
                            </select>
                        </div>
                    </div>

                    {/* Pílulas de Categoria */}
                    <div className="flex flex-wrap items-center gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat.id
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white text-warm-700 dark:text-slate-300 border border-warm-200/80 dark:border-slate-700'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══ LISTA DE DISCUSSÕES ═══ */}
                {loading ? (
                    <div className="p-12 text-center text-warm-500 dark:text-slate-400 animate-pulse">
                        <MessageSquare size={32} className="mx-auto mb-2 text-teal-600 animate-bounce" />
                        <p className="text-xs font-bold">Carregando discussões da comunidade...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => handleOpenPost(post)}
                                className={`p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                                    post.is_pinned 
                                        ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/20' 
                                        : 'border-warm-200/90 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <UserAvatar fotoUrl={post.author_avatar} nome={post.author_name} size="sm" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-warm-900 dark:text-white">{post.author_name}</span>
                                                {['dona', 'desenvolvedor', 'professor'].includes(post.author_role) && (
                                                    <span className="px-1.5 py-0.2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[9px] font-black rounded-md">
                                                        Professora UFPB
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-warm-400">{post.created_at}</span>
                                        </div>
                                    </div>

                                    {/* Badges de Status */}
                                    <div className="flex items-center gap-2">
                                        {post.is_pinned && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                                                <Pin size={10} /> Fixado
                                            </span>
                                        )}
                                        {post.is_solved && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                                                <CheckCircle2 size={10} /> Resolvido
                                            </span>
                                        )}
                                        {getCategoryBadge(post.category)}
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-warm-900 dark:text-white hover:text-emerald-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-warm-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                                    {post.content}
                                </p>

                                <div className="mt-4 pt-3 border-t border-warm-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-warm-500 dark:text-slate-400">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => handleTogglePostLike(post.id, e)}
                                            className={`flex items-center gap-1 font-bold text-xs cursor-pointer transition-colors ${
                                                post.has_liked ? 'text-rose-600' : 'hover:text-rose-600'
                                            }`}
                                        >
                                            <Heart size={14} className={post.has_liked ? 'fill-current' : ''} />
                                            <span>{post.likes_count}</span>
                                        </button>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={14} /> {post.replies_count} respostas
                                        </span>
                                    </div>

                                    <span className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                                        Participar da discussão →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-warm-200 dark:border-slate-800 text-center space-y-3">
                        <MessageSquare size={36} className="mx-auto text-warm-300 dark:text-slate-600" />
                        <h4 className="text-sm font-bold text-warm-800 dark:text-slate-200">Nenhuma discussão encontrada nesta categoria</h4>
                        <p className="text-xs text-warm-500 dark:text-slate-400">Seja o primeiro a publicar uma dúvida ou caso clínico!</p>
                        <button
                            onClick={() => setIsNewPostModalOpen(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                        >
                            + Criar Novo Tópico
                        </button>
                    </div>
                )}
            </div>

            {/* ═══ MODAL DE DETALHES DO POST & RESPOSTAS ═══ */}
            {activePost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl space-y-6">
                        
                        {/* Header do Post */}
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                            <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-4">
                                <button
                                    onClick={() => setActivePost(null)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-white cursor-pointer"
                                >
                                    <ArrowLeft size={16} /> Voltar ao Fórum
                                </button>

                                <div className="flex items-center gap-2">
                                    {(user?.id === activePost.user_id || ['dona', 'desenvolvedor', 'professor'].includes(user?.cargo || '')) && (
                                        <>
                                            <button
                                                onClick={() => handleToggleSolved(activePost.id)}
                                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-300 dark:border-emerald-700 cursor-pointer"
                                            >
                                                {activePost.is_solved ? 'Reabrir Dúvida' : 'Marcar como Resolvido'}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(activePost.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg cursor-pointer"
                                                title="Excluir Tópico"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Informações do Autor e Conteúdo Principal */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserAvatar fotoUrl={activePost.author_avatar} nome={activePost.author_name} size="md" />
                                        <div>
                                            <h4 className="text-sm font-bold text-warm-900 dark:text-white">{activePost.author_name}</h4>
                                            <span className="text-[11px] text-warm-400">{activePost.created_at}</span>
                                        </div>
                                    </div>
                                    {getCategoryBadge(activePost.category)}
                                </div>

                                <h2 className="text-xl font-black text-warm-900 dark:text-white">
                                    {activePost.title}
                                </h2>
                                <p className="text-xs sm:text-sm text-warm-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {activePost.content}
                                </p>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => handleTogglePostLike(activePost.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                            activePost.has_liked
                                                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-600'
                                                : 'bg-warm-50 dark:bg-slate-800 border-warm-200 dark:border-slate-700 text-warm-700 dark:text-slate-300'
                                        }`}
                                    >
                                        <Heart size={14} className={activePost.has_liked ? 'fill-current text-rose-500' : ''} />
                                        <span>Curtir ({activePost.likes_count})</span>
                                    </button>
                                </div>
                            </div>

                            {/* ═══ THREAD DE RESPOSTAS ═══ */}
                            <div className="pt-6 border-t border-warm-100 dark:border-slate-800 space-y-4">
                                <h3 className="text-sm font-bold text-warm-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={16} className="text-teal-600" />
                                    Respostas ({replies.length})
                                </h3>

                                {loadingReplies ? (
                                    <p className="text-xs text-warm-400 animate-pulse">Carregando respostas...</p>
                                ) : replies.length > 0 ? (
                                    <div className="space-y-3">
                                        {replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                                                    reply.is_instructor_answer
                                                        ? 'bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border-amber-300 dark:border-amber-700/80 shadow-2xs'
                                                        : 'bg-warm-50/60 dark:bg-slate-800/60 border-warm-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <UserAvatar fotoUrl={reply.author_avatar} nome={reply.author_name} size="xs" />
                                                        <span className="font-bold text-warm-900 dark:text-white">{reply.author_name}</span>
                                                        {reply.is_instructor_answer && (
                                                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full shadow-2xs">
                                                                👨‍🏫 Resposta da Tutoria
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-warm-400">{reply.created_at}</span>
                                                </div>

                                                <p className="text-warm-800 dark:text-slate-200 whitespace-pre-wrap">
                                                    {reply.content}
                                                </p>

                                                <div className="pt-1 flex items-center justify-end">
                                                    <button
                                                        onClick={() => handleToggleReplyLike(reply.id)}
                                                        className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                                                            reply.has_liked ? 'text-rose-600' : 'text-warm-500 hover:text-rose-600'
                                                        }`}
                                                    >
                                                        <ThumbsUp size={12} /> {reply.likes_count}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-warm-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-warm-500">
                                        Nenhuma resposta ainda. Seja o primeiro a contribuir com sua visão!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Caixa de Resposta */}
                        {token ? (
                            <form onSubmit={handleSendReply} className="pt-3 border-t border-warm-200 dark:border-slate-800 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Escreva sua contribuição ou conduta para este caso..."
                                    className="flex-1 px-4 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-2xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={isSendingReply || !replyText.trim()}
                                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send size={14} /> Responder
                                </button>
                            </form>
                        ) : (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-center text-xs text-amber-900 dark:text-amber-200">
                                Faça login para participar das discussões e responder a casos clínicos.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ MODAL: CRIAR NOVO TÓPICO ═══ */}
            {isNewPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-black text-warm-900 dark:text-white flex items-center gap-2">
                                <Plus size={18} className="text-emerald-600" /> Publicar Novo Tópico
                            </h3>
                            <button
                                onClick={() => setIsNewPostModalOpen(false)}
                                className="text-warm-400 hover:text-warm-700 text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Categoria
                                </label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-warm-900 dark:text-white outline-none focus:border-teal-500"
                                >
                                    <option value="casos_clinicos">🩺 Discussão de Caso Clínico</option>
                                    <option value="duvidas">💡 Dúvida de Aula / Módulo</option>
                                    <option value="experiencias">🦋 Relato de Experiência & Humanização</option>
                                    {['dona', 'desenvolvedor', 'professor'].includes(user?.cargo || '') && (
                                        <option value="avisos">📢 Aviso Oficial da Coordenação</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Título do Tópico
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Ex: Manejo de Dispneia Refratária em Paciente Oncológico..."
                                    required
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Descrição Completa / Relato do Caso
                                </label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Descreva o caso, histórico relevante, dúvidas sobre a conduta farmacológica ou bioética..."
                                    rows={5}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 resize-none"
                                />
                            </div>

                            {postError && (
                                <div className="p-3 bg-red-50 text-red-900 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                                    <AlertCircle size={16} /> {postError}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsNewPostModalOpen(false)}
                                    className="flex-1 py-2.5 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 text-warm-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingPost || !newTitle.trim() || !newContent.trim()}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingPost ? 'Publicando...' : 'Publicar no Fórum'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BotanicalBackground>
    );
};

export default Comunidade;
