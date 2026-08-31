import React, { useState, useEffect } from 'react';
import { 
    Award, Sparkles, HeartPulse, Scale, Target, Zap, 
    Moon, GraduationCap, MessageSquareHeart, Trophy, 
    CheckCircle2, Lock, Flame, RefreshCw
} from 'lucide-react';
import UserAvatar from './UserAvatar';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export interface BadgeItem {
    key: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    xp_points: number;
    unlocked: boolean;
    unlocked_at?: string | null;
}

export interface GamificationProfile {
    total_xp: number;
    current_level: number;
    level_title: string;
    next_level_xp: number;
    badges_unlocked_count: number;
    total_badges_count: number;
    completion_percentage: number;
    badges: BadgeItem[];
}

export interface LeaderboardItem {
    rank: number;
    user_id: number;
    nome: string;
    foto_url?: string | null;
    total_xp: number;
    level_title: string;
    badges_count: number;
    is_current_user: boolean;
}

export const GamificationBadges: React.FC = () => {
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const fetchGamificationData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [profRes, leadRes] = await Promise.all([
                fetch(`${API_URL}/api/gamification/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/gamification/leaderboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (profRes.ok) {
                const profData = await profRes.json();
                setProfile(profData);
            }
            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setLeaderboard(leadData);
            }
        } catch (err) {
            console.error('Erro ao buscar dados de gamificação:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGamificationData();
    }, []);

    const getBadgeIcon = (iconName: string, unlocked: boolean) => {
        const props = { size: 24, className: unlocked ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500' };
        switch (iconName) {
            case 'Sparkles': return <Sparkles {...props} />;
            case 'MessageSquareHeart': return <MessageSquareHeart {...props} />;
            case 'HeartPulse': return <HeartPulse {...props} />;
            case 'Scale': return <Scale {...props} />;
            case 'Target': return <Target {...props} />;
            case 'Zap': return <Zap {...props} />;
            case 'Moon': return <Moon {...props} />;
            case 'GraduationCap': return <GraduationCap {...props} />;
            default: return <Award {...props} />;
        }
    };

    const handleShareWhatsApp = (badge: BadgeItem) => {
        const text = encodeURIComponent(
            `🏆 Acabei de desbloquear a conquista "${badge.title}" no curso PaliEduca (UFPB)! 🦋\n\n` +
            `Avançando nos estudos de Cuidados Paliativos humanizados. Conheça a plataforma: https://palieduca.com.br`
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    };

    const handleShareLinkedIn = (badge: BadgeItem) => {
        const url = encodeURIComponent(`https://palieduca.com.br?badge=${badge.key}`);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    if (loading && !profile) {
        return (
            <div className="p-8 text-center text-warm-500 dark:text-slate-400 animate-pulse">
                <Trophy size={32} className="mx-auto mb-2 text-amber-500 animate-bounce" />
                <p className="text-xs font-bold">Carregando suas conquistas e ranking...</p>
            </div>
        );
    }

    const xpProgressPct = profile 
        ? Math.min(100, Math.round((profile.total_xp / profile.next_level_xp) * 100))
        : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ═══ CARD PRINCIPAL: NÍVEL & XP DO ALUNO ═══ */}
            {profile && (
                <div className="relative overflow-hidden p-6 sm:p-7 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/50 rounded-3xl shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="relative p-3.5 bg-gradient-to-tr from-amber-500 to-orange-400 text-white rounded-2xl shadow-md">
                                <Trophy size={28} />
                                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-warm-900 text-amber-300 text-[10px] font-black rounded-full border border-amber-300">
                                    Nv {profile.current_level}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                                        Nível {profile.current_level}
                                    </span>
                                    <span className="text-xs text-warm-400">•</span>
                                    <span className="text-xs font-bold text-warm-600 dark:text-slate-300 flex items-center gap-1">
                                        <Flame size={13} className="text-orange-500" /> {profile.total_xp} XP Acumulados
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black text-warm-900 dark:text-white mt-0.5">
                                    {profile.level_title}
                                </h3>
                                <p className="text-xs text-warm-600 dark:text-slate-400 mt-1">
                                    {profile.badges_unlocked_count} de {profile.total_badges_count} medalhas conquistadas ({Math.round((profile.badges_unlocked_count / profile.total_badges_count) * 100)}%)
                                </p>
                            </div>
                        </div>

                        {/* Botão de Atualizar */}
                        <button
                            onClick={fetchGamificationData}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-warm-50 text-warm-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-warm-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                        >
                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                            Atualizar XP
                        </button>
                    </div>

                    {/* Barra de Progresso para Próximo Nível */}
                    <div className="mt-5 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-warm-600 dark:text-slate-400">
                            <span>Evolução para o Nível {profile.current_level + 1}</span>
                            <span className="font-bold text-warm-900 dark:text-white">{profile.total_xp} / {profile.next_level_xp} XP ({xpProgressPct}%)</span>
                        </div>
                        <div className="h-3 w-full bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-200/60 dark:border-slate-700">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400 rounded-full transition-all duration-500 shadow-xs"
                                style={{ width: `${xpProgressPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ ABAS: CONQUISTAS VS RANKING ═══ */}
            <div className="flex items-center gap-3 border-b border-warm-200 dark:border-slate-800 pb-3">
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                        activeTab === 'badges'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-warm-100 dark:bg-slate-800 text-warm-700 dark:text-slate-300 hover:bg-warm-200'
                    }`}
                >
                    <Award size={15} />
                    Minhas Medalhas ({profile?.badges_unlocked_count ?? 0}/{profile?.total_badges_count ?? 8})
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                        activeTab === 'leaderboard'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-warm-100 dark:bg-slate-800 text-warm-700 dark:text-slate-300 hover:bg-warm-200'
                    }`}
                >
                    <Trophy size={15} />
                    Ranking da Turma ({leaderboard.length})
                </button>
            </div>

            {/* ═══ CONTEÚDO DA ABA: MEDALHAS ═══ */}
            {activeTab === 'badges' && profile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {profile.badges.map((badge) => (
                        <div
                            key={badge.key}
                            onClick={() => setSelectedBadge(badge)}
                            className={`group relative p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                                badge.unlocked
                                    ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/60 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                                    : 'bg-warm-50/70 dark:bg-slate-900/40 border-warm-200/80 dark:border-slate-800 opacity-70 hover:opacity-90'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-3 rounded-2xl ${badge.unlocked ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                        {getBadgeIcon(badge.icon, badge.unlocked)}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.unlocked ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        +{badge.xp_points} XP
                                    </span>
                                </div>

                                <h4 className="text-sm font-bold text-warm-900 dark:text-white flex items-center gap-1.5">
                                    {badge.title}
                                    {badge.unlocked && <CheckCircle2 size={14} className="text-emerald-500 inline" />}
                                </h4>
                                <p className="text-xs text-warm-600 dark:text-slate-400 mt-1 line-clamp-2">
                                    {badge.description}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-warm-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                                {badge.unlocked ? (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        <Sparkles size={12} /> Desbloqueada
                                    </span>
                                ) : (
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <Lock size={12} /> Bloqueada
                                    </span>
                                )}
                                <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                                    Ver Detalhes →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ CONTEÚDO DA ABA: RANKING (LEADERBOARD) ═══ */}
            {activeTab === 'leaderboard' && (
                <div className="p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Trophy size={20} className="text-amber-500" />
                        <div>
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Top Alunos em Engajamento e Conquistas</h3>
                            <p className="text-[11px] text-warm-500 dark:text-slate-400">Pontuação baseada em aulas concluídas, questionários e medalhas desbloqueadas</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-warm-200 dark:border-slate-800 text-warm-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                                    <th className="pb-3 px-3">Posição</th>
                                    <th className="pb-3 px-3">Aluno</th>
                                    <th className="pb-3 px-3">Nível / Título</th>
                                    <th className="pb-3 px-3 text-center">Medalhas</th>
                                    <th className="pb-3 px-3 text-right">Total XP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-100 dark:divide-slate-800/60">
                                {leaderboard.map((item) => (
                                    <tr 
                                        key={item.user_id} 
                                        className={`transition-colors ${
                                            item.is_current_user 
                                                ? 'bg-amber-500/10 dark:bg-amber-950/30 font-bold' 
                                                : 'hover:bg-warm-50/50 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <td className="py-3 px-3 font-black">
                                            {item.rank === 1 ? '🥇 1º' :
                                             item.rank === 2 ? '🥈 2º' :
                                             item.rank === 3 ? '🥉 3º' :
                                             `#${item.rank}`}
                                        </td>
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-2.5">
                                                <UserAvatar fotoUrl={item.foto_url} nome={item.nome} size="sm" />
                                                <span className="text-warm-900 dark:text-white">
                                                    {item.nome} {item.is_current_user && <span className="text-amber-600 dark:text-amber-400 text-[10px] font-black">(Você)</span>}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-warm-600 dark:text-slate-300">
                                            {item.level_title}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                                            🎖️ {item.badges_count}
                                        </td>
                                        <td className="py-3 px-3 text-right font-black text-warm-900 dark:text-white">
                                            {item.total_xp} XP
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ MODAL DE DETALHES DA MEDALHA & COMPARTILHAMENTO ═══ */}
            {selectedBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
                        <div className="text-center">
                            <div className={`mx-auto p-4 w-16 h-16 rounded-3xl flex items-center justify-center mb-3 ${selectedBadge.unlocked ? 'bg-amber-100 dark:bg-amber-950 border-2 border-amber-400 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {getBadgeIcon(selectedBadge.icon, selectedBadge.unlocked)}
                            </div>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                {selectedBadge.category} • +{selectedBadge.xp_points} XP
                            </span>
                            <h3 className="text-xl font-black text-warm-900 dark:text-white mt-1">
                                {selectedBadge.title}
                            </h3>
                            <p className="text-xs text-warm-600 dark:text-slate-300 mt-2 leading-relaxed">
                                {selectedBadge.description}
                            </p>
                        </div>

                        {selectedBadge.unlocked ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded-2xl text-center font-bold">
                                    ✨ Desbloqueada em {selectedBadge.unlocked_at || 'sua jornada'}!
                                </div>

                                <div className="space-y-2">
                                    <p className="text-center text-[11px] font-bold text-warm-500 dark:text-slate-400 uppercase">
                                        Compartilhar Conquista
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleShareWhatsApp(selectedBadge)}
                                            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            Compartilhar no WhatsApp
                                        </button>
                                        <button
                                            onClick={() => handleShareLinkedIn(selectedBadge)}
                                            className="py-2.5 px-3 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            LinkedIn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-2xl text-center font-semibold">
                                🔒 Continue estudando as aulas e quizzes correspondentes para desbloquear esta medalha!
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="w-full py-2.5 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 text-warm-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamificationBadges;
