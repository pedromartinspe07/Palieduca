import React, { useState, useMemo, useEffect } from 'react';
import { 
    Users, Award, Download, Search, 
    Maximize2, Minimize2, CheckCheck, 
    ArrowUpDown, ChevronDown, ChevronUp,
    BarChart3, Medal, Clock, FileSpreadsheet, Shield,
    UserCog, Crown, Code2, GraduationCap, ShieldCheck, Headphones,
    Lock, Loader2, Trash2
} from 'lucide-react';
import UserAvatar from './UserAvatar';
import AnalyticsCharts, { type DetailedEngagementMetrics } from './AnalyticsCharts';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export interface StudentMetricItem {
    id: number;
    nome: string;
    email: string;
    email_verified: boolean;
    cargo: string;
    foto_url?: string | null;
    completed_activities_count: number;
    total_activities_count: number;
    progress_percentage: number;
    points: number;
    is_certificate_eligible: boolean;
}

export interface ModuleStatItem {
    slug: string;
    title: string;
    activities_count: number;
    completed_students: number;
    completion_rate: number;
}

export interface AnalyticsData {
    total_students: number;
    total_team_members?: number;
    total_modules: number;
    total_activities: number;
    average_progress_percentage: number;
    status_distribution: {
        completed: number;
        in_progress: number;
        not_started: number;
    };
    module_stats: ModuleStatItem[];
    students: StudentMetricItem[];
    all_users?: StudentMetricItem[];
}

interface Props {
    data: AnalyticsData | null;
    loading: boolean;
    onExportExcel: () => void;
    onExportCSV: () => void;
    onUpdateRole?: (userId: number, newRole: string) => Promise<void>;
    onDeleteUser?: (userId: number) => Promise<void>;
    currentUserEmail?: string;
    currentUserRole?: string;
}

const ROLES_INFO: Record<string, { label: string; icon: React.ReactNode; badgeClass: string; desc: string }> = {
    dona: {
        label: 'Dona',
        icon: <Crown size={13} className="text-amber-600" />,
        badgeClass: 'bg-amber-100/90 text-amber-900 border-amber-300',
        desc: 'Acesso total irrestrito (Super Admin) e gestão de membros.'
    },
    desenvolvedor: {
        label: 'Desenvolvedor',
        icon: <Code2 size={13} className="text-blue-600" />,
        badgeClass: 'bg-blue-100/90 text-blue-900 border-blue-300',
        desc: 'Acesso técnico, Estúdio CMS, APIs e ferramentas de sistema.'
    },
    professor: {
        label: 'Professor / Tutor',
        icon: <GraduationCap size={13} className="text-emerald-600" />,
        badgeClass: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
        desc: 'Criação/edição de aulas e acompanhamento de notas da turma.'
    },
    moderador: {
        label: 'Moderador',
        icon: <ShieldCheck size={13} className="text-purple-600" />,
        badgeClass: 'bg-purple-100/90 text-purple-900 border-purple-300',
        desc: 'Acompanhamento de dúvidas e engajamento da turma.'
    },
    suporte: {
        label: 'Suporte',
        icon: <Headphones size={13} className="text-cyan-600" />,
        badgeClass: 'bg-cyan-100/90 text-cyan-900 border-cyan-300',
        desc: 'Atendimento a alunos e verificação de contas e certificados.'
    },
    aluno: {
        label: 'Aluno',
        icon: <Users size={13} className="text-sage-700" />,
        badgeClass: 'bg-sage-100/90 text-sage-900 border-sage-300',
        desc: 'Acesso aos módulos, quizzes, vídeos, IA e certificado.'
    }
};

export const StudentAnalyticsDashboard: React.FC<Props> = ({ 
    data, 
    loading, 
    onExportExcel, 
    onExportCSV,
    onUpdateRole,
    onDeleteUser,
    currentUserEmail,
    currentUserRole
}) => {
    const [viewMode, setViewMode] = useState<'charts' | 'spreadsheet' | 'roles'>('charts');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<'nome' | 'points' | 'progress_percentage'>('points');
    const [sortAsc, setSortAsc] = useState(false);
    
    // Métricas Avançadas de Engajamento, Heatmap e Linha do Tempo
    const [engagementMetrics, setEngagementMetrics] = useState<DetailedEngagementMetrics | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetch(`${API_URL}/api/admin/analytics/engagement`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(d => {
                if (d) setEngagementMetrics(d);
            })
            .catch(err => console.warn('Erro ao carregar métricas detalhadas de engajamento:', err));
        }
    }, []);

    // Estado de carregamento na troca de cargo e exclusão
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
    const [roleUpdateMsg, setRoleUpdateMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Filtros e ordenação da planilha de alunos
    const filteredAndSortedStudents = useMemo(() => {
        if (!data?.students) return [];

        return data.students
            .filter(s => {
                const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      s.email.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;

                if (statusFilter === 'completed') return s.progress_percentage >= 100;
                if (statusFilter === 'in_progress') return s.progress_percentage > 0 && s.progress_percentage < 100;
                if (statusFilter === 'not_started') return s.progress_percentage === 0;
                return true;
            })
            .sort((a, b) => {
                let comparison = 0;
                if (sortField === 'nome') {
                    comparison = a.nome.localeCompare(b.nome);
                } else if (sortField === 'points') {
                    comparison = a.points - b.points;
                } else if (sortField === 'progress_percentage') {
                    comparison = a.progress_percentage - b.progress_percentage;
                }
                return sortAsc ? comparison : -comparison;
            });
    }, [data?.students, searchTerm, statusFilter, sortField, sortAsc]);

    // Filtros e ordenação da lista geral de usuários (para gerenciamento de cargos)
    const filteredAndSortedUsers = useMemo(() => {
        const usersList = data?.all_users || data?.students || [];

        return usersList
            .filter(u => {
                const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      u.email.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;

                if (roleFilter !== 'all' && u.cargo !== roleFilter) return false;
                return true;
            })
            .sort((a, b) => a.nome.localeCompare(b.nome));
    }, [data?.all_users, data?.students, searchTerm, roleFilter]);

    const handleSort = (field: 'nome' | 'points' | 'progress_percentage') => {
        if (sortField === field) {
            setSortAsc(prev => !prev);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string, userName: string) => {
        if (!onUpdateRole) return;
        setUpdatingUserId(userId);
        setRoleUpdateMsg(null);
        try {
            await onUpdateRole(userId, newRole);
            setRoleUpdateMsg({ 
                text: `Cargo de ${userName} atualizado para "${ROLES_INFO[newRole]?.label || newRole}" com sucesso!`, 
                type: 'success' 
            });
            setTimeout(() => setRoleUpdateMsg(null), 4000);
        } catch (err: any) {
            setRoleUpdateMsg({ 
                text: err.message || 'Falha ao alterar cargo.', 
                type: 'error' 
            });
            setTimeout(() => setRoleUpdateMsg(null), 4000);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async (userId: number, userName: string, userEmail: string) => {
        if (!onDeleteUser) return;
        const confirm = window.confirm(`Tem certeza que deseja remover o usuário "${userName}" (${userEmail})?\n\nEsta ação apagará permanentemente o acesso e o histórico desta pessoa.`);
        if (!confirm) return;

        setDeletingUserId(userId);
        setRoleUpdateMsg(null);
        try {
            await onDeleteUser(userId);
            setRoleUpdateMsg({ 
                text: `Usuário "${userName}" (${userEmail}) removido com sucesso!`, 
                type: 'success' 
            });
            setTimeout(() => setRoleUpdateMsg(null), 4000);
        } catch (err: any) {
            setRoleUpdateMsg({ 
                text: err.message || 'Erro ao remover usuário.', 
                type: 'error' 
            });
            setTimeout(() => setRoleUpdateMsg(null), 4000);
        } finally {
            setDeletingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="p-12 bg-white rounded-3xl border border-warm-200 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-warm-600">Carregando painel e gráficos da turma...</p>
            </div>
        );
    }

    if (!data) return null;

    const canManageRoles = currentUserRole === 'dona' || currentUserRole === 'desenvolvedor';

    return (
        <div className={`space-y-6 transition-all ${isFullscreen ? 'fixed inset-0 z-50 bg-warm-50 p-6 md:p-10 overflow-y-auto' : ''}`}>
            
            {/* Header da Central de Métricas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-200 shadow-xs">
                <div>
                    <h3 className="text-xl font-bold text-warm-900 flex items-center gap-2">
                        <Users className="text-primary" /> Central de Inteligência & Gestão da Turma
                    </h3>
                    <p className="text-xs text-warm-500 mt-1">
                        Análise de crescimento, acertos, ranking de pontos, planilha e controle de cargos
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Switcher de Visão: Gráficos, Planilha ou Gestão de Cargos */}
                    <div className="flex bg-warm-100 p-1 rounded-2xl text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setViewMode('charts')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                viewMode === 'charts' ? 'bg-white text-primary shadow-2xs' : 'text-warm-600 hover:text-warm-900'
                            }`}
                        >
                            <BarChart3 size={14} /> Gráficos & Ranking
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('spreadsheet')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                viewMode === 'spreadsheet' ? 'bg-white text-primary shadow-2xs' : 'text-warm-600 hover:text-warm-900'
                            }`}
                        >
                            <FileSpreadsheet size={14} /> Planilha ({data.total_students})
                        </button>
                        {canManageRoles && (
                            <button
                                type="button"
                                onClick={() => setViewMode('roles')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    viewMode === 'roles' ? 'bg-white text-primary shadow-2xs' : 'text-warm-600 hover:text-warm-900'
                                }`}
                            >
                                <UserCog size={14} /> Cargos ({data.all_users?.length || data.total_students})
                            </button>
                        )}
                    </div>

                    {/* Botão de Tela Cheia */}
                    <button
                        onClick={() => setIsFullscreen(prev => !prev)}
                        className="p-2 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl transition-colors cursor-pointer"
                        title={isFullscreen ? 'Sair da Tela Cheia' : 'Visualizar em Tela Cheia'}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>

                    {/* Botão de Exportar Excel Completo com Gráficos Nativos */}
                    <button
                        type="button"
                        onClick={onExportExcel}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Baixar pasta de trabalho Excel (.xlsx) com gráficos embutidos para Excel e Google Sheets"
                    >
                        <Download size={14} /> Excel (.xlsx)
                    </button>

                    {/* Botão de Exportar CSV Simples */}
                    <button
                        type="button"
                        onClick={onExportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 bg-warm-100 hover:bg-warm-200 text-warm-800 font-bold text-xs rounded-xl border border-warm-200 transition-all cursor-pointer"
                        title="Baixar planilha simples em formato CSV"
                    >
                        <FileSpreadsheet size={14} /> CSV
                    </button>
                </div>
            </div>

            {/* Mensagem Toast de Feedback na alteração de cargo */}
            {roleUpdateMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold border transition-all animate-fade-in ${
                    roleUpdateMsg.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-xs' 
                        : 'bg-red-50 text-red-900 border-red-200 shadow-xs'
                }`}>
                    {roleUpdateMsg.text}
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODO 1: GRÁFICOS INTERATIVOS E RANKING DE PONTUAÇÃO                       */}
            {/* ========================================================================= */}
            {viewMode === 'charts' && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Gráficos Visuais Avançados: Donut, Barras, Timeline 14 Dias e Heatmap */}
                    <AnalyticsCharts 
                        statusDistribution={data.status_distribution}
                        moduleStats={data.module_stats}
                        engagementMetrics={engagementMetrics}
                    />

                    {/* Ranking de Alunos com Mais Pontos e Destaques */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-warm-200 dark:border-slate-800 shadow-xs">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h4 className="font-bold text-warm-900 text-base flex items-center gap-2">
                                    <Medal size={18} className="text-amber-500" /> Ranking de Pontuação & Engajamento dos Alunos
                                </h4>
                                <p className="text-xs text-warm-500">10 pontos acumulados para cada atividade ou quiz concluído</p>
                            </div>
                            <button
                                onClick={() => setViewMode('spreadsheet')}
                                className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                            >
                                Ver todos na planilha →
                            </button>
                        </div>

                        {/* Cards do Top 3 Alunos */}
                        {data.students.length === 0 ? (
                            <div className="text-center py-8 text-warm-500 text-xs">
                                Nenhum aluno cadastrado ainda. Quando novos alunos se registrarem, o ranking aparecerá aqui!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {data.students.slice(0, 3).map((s, idx) => {
                                    const medals = ['🥇', '🥈', '🥉'];
                                    const bgColors = [
                                        'bg-amber-50/80 border-amber-200',
                                        'bg-slate-50/80 border-slate-200',
                                        'bg-orange-50/80 border-orange-200'
                                    ];

                                    return (
                                        <div key={s.id} className={`p-4 rounded-2xl border ${bgColors[idx]} relative flex items-center gap-3.5 shadow-2xs`}>
                                            <span className="text-2xl">{medals[idx]}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <UserAvatar fotoUrl={s.foto_url} nome={s.nome} size="sm" />
                                                    <div className="truncate">
                                                        <h5 className="font-bold text-warm-900 text-xs truncate">{s.nome}</h5>
                                                        <p className="text-[10px] text-warm-500 truncate">{s.email}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-warm-200/50 font-bold">
                                                    <span className="text-primary">{s.points} pts</span>
                                                    <span className="text-warm-700">{s.progress_percentage}% Concluído</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODO 2: PLANILHA COMPLETA INTERATIVA (ESTILO GOOGLE SHEETS / EXCEL)       */}
            {/* ========================================================================= */}
            {viewMode === 'spreadsheet' && (
                <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-4 animate-fade-in">
                    
                    {/* Barra de Filtros da Planilha */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
                        
                        {/* Busca */}
                        <div className="relative flex-1 max-w-sm">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filtrar por nome ou e-mail..."
                                className="w-full pl-9 pr-3.5 py-2 bg-warm-50 border border-warm-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Filtro de Status */}
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-warm-600 text-[11px]">Filtrar:</span>
                            {(['all', 'completed', 'in_progress', 'not_started'] as const).map(filterKey => {
                                const labels = { all: 'Todos', completed: '100% Concluídos', in_progress: 'Em Andamento', not_started: 'Zerados' };
                                return (
                                    <button
                                        key={filterKey}
                                        type="button"
                                        onClick={() => setStatusFilter(filterKey)}
                                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                            statusFilter === filterKey ? 'bg-primary text-white shadow-2xs' : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                                        }`}
                                    >
                                        {labels[filterKey]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tabela Planilha Interativa */}
                    <div className="overflow-x-auto rounded-2xl border border-warm-200">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-warm-100/70 text-warm-700 uppercase font-black text-[10px] tracking-wider border-b border-warm-200">
                                <tr>
                                    <th className="py-3 px-4">#</th>
                                    <th 
                                        className="py-3 px-4 cursor-pointer hover:bg-warm-200/60 transition-colors"
                                        onClick={() => handleSort('nome')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Nome do Aluno</span>
                                            {sortField === 'nome' ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} className="text-warm-400" />}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4">E-mail</th>
                                    <th 
                                        className="py-3 px-4 cursor-pointer hover:bg-warm-200/60 transition-colors"
                                        onClick={() => handleSort('points')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Pontos</span>
                                            {sortField === 'points' ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} className="text-warm-400" />}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4">Atividades</th>
                                    <th 
                                        className="py-3 px-4 cursor-pointer hover:bg-warm-200/60 transition-colors"
                                        onClick={() => handleSort('progress_percentage')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>Progresso (%)</span>
                                            {sortField === 'progress_percentage' ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} className="text-warm-400" />}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center">Status / Certificado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-100 bg-white">
                                {filteredAndSortedStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-warm-400 text-xs">
                                            Nenhum aluno corresponde aos filtros selecionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedStudents.map((s, index) => (
                                        <tr key={s.id} className="hover:bg-warm-50/70 transition-colors">
                                            <td className="py-3 px-4 text-warm-400 font-bold text-[11px]">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-warm-900 flex items-center gap-2">
                                                <UserAvatar fotoUrl={s.foto_url} nome={s.nome} size="xs" />
                                                <span className="truncate">{s.nome}</span>
                                            </td>
                                            <td className="py-3 px-4 text-warm-600">
                                                <div className="flex items-center gap-1">
                                                    <span>{s.email}</span>
                                                    {s.email_verified && (
                                                        <span title="E-mail Verificado">
                                                            <CheckCheck size={13} className="text-emerald-600 shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-extrabold text-primary">
                                                {s.points} pts
                                            </td>
                                            <td className="py-3 px-4 text-warm-600 font-semibold">
                                                {s.completed_activities_count} / {s.total_activities_count}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 min-w-[110px]">
                                                    <div className="flex-1 bg-warm-200 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all ${
                                                                s.progress_percentage >= 100 
                                                                    ? 'bg-emerald-500' 
                                                                    : 'bg-primary'
                                                            }`} 
                                                            style={{ width: `${s.progress_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-[11px] text-warm-800">{s.progress_percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {s.is_certificate_eligible ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                                        <Award size={11} /> Apto ao Certificado
                                                    </span>
                                                ) : s.progress_percentage > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                        <Clock size={11} /> Em Andamento
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-warm-600 text-[10px] font-bold">
                                                        Pendente
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-warm-500 font-semibold pt-2">
                        <span>Mostrando {filteredAndSortedStudents.length} de {data.total_students} alunos</span>
                        <span>Clique nos cabeçalhos das colunas para ordenar</span>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODO 3: GERENCIADOR DE USUÁRIOS E CONTROLE DE CARGOS (RBAC)               */}
            {/* ========================================================================= */}
            {viewMode === 'roles' && canManageRoles && (
                <div className="bg-white p-6 rounded-3xl border border-warm-200 shadow-sm space-y-6 animate-fade-in">
                    
                    {/* Header da Aba de Cargos */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-100">
                        <div>
                            <h4 className="font-bold text-warm-900 text-base flex items-center gap-2">
                                <Shield className="text-primary" /> Gerenciador de Usuários e Permissões do Ecossistema
                            </h4>
                            <p className="text-xs text-warm-500">
                                Atribua cargos (Desenvolvedor, Professor, Moderador, Suporte, Aluno) para conceder ou restringir acessos.
                            </p>
                        </div>

                        {/* Filtro por Cargo */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-warm-600">Cargo:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-bold text-warm-800 outline-none cursor-pointer focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">Todos os Cargos</option>
                                <option value="dona">👑 Dona</option>
                                <option value="desenvolvedor">💻 Desenvolvedores</option>
                                <option value="professor">👨‍🏫 Professores / Tutores</option>
                                <option value="moderador">🛡️ Moderadores</option>
                                <option value="suporte">🎧 Suporte</option>
                                <option value="aluno">🎓 Alunos</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabela de Membros com Seletor Interativo de Cargo */}
                    <div className="overflow-x-auto rounded-2xl border border-warm-200">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-warm-100/70 text-warm-700 uppercase font-black text-[10px] tracking-wider border-b border-warm-200">
                                <tr>
                                    <th className="py-3 px-4">Usuário</th>
                                    <th className="py-3 px-4">E-mail</th>
                                    <th className="py-3 px-4">Cargo Atual</th>
                                    <th className="py-3 px-4">Alterar Cargo</th>
                                    <th className="py-3 px-4 text-center">Permissões</th>
                                    <th className="py-3 px-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-100 bg-white">
                                {filteredAndSortedUsers.map((u) => {
                                    const isPrimaryOwner = u.email === 'patriciaandrade@palieduca.com.br';
                                    const isCurrentUser = u.email === currentUserEmail;
                                    const roleInfo = ROLES_INFO[u.cargo] || ROLES_INFO.aluno;
                                    const isUpdating = updatingUserId === u.id;
                                    const isDeleting = deletingUserId === u.id;

                                    return (
                                        <tr key={u.id} className="hover:bg-warm-50/60 transition-colors">
                                            
                                            {/* Usuário */}
                                            <td className="py-3 px-4 font-bold text-warm-900 flex items-center gap-2.5">
                                                <UserAvatar fotoUrl={u.foto_url} nome={u.nome} size="sm" />
                                                <div className="truncate">
                                                    <span>{u.nome}</span>
                                                    {isCurrentUser && (
                                                        <span className="ml-1.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded">Você</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* E-mail */}
                                            <td className="py-3 px-4 text-warm-600">
                                                <div className="flex items-center gap-1">
                                                    <span>{u.email}</span>
                                                    {u.email_verified && (
                                                        <span title="E-mail Verificado">
                                                            <CheckCheck size={13} className="text-emerald-600 shrink-0" />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Badge do Cargo Atual */}
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${roleInfo.badgeClass}`}>
                                                    {roleInfo.icon}
                                                    <span>{roleInfo.label}</span>
                                                </span>
                                            </td>

                                            {/* Dropdown Interativo de Cargo */}
                                            <td className="py-3 px-4">
                                                {isPrimaryOwner ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                                        <Lock size={12} /> Proprietária Protegida
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={u.cargo}
                                                            disabled={isUpdating || isDeleting}
                                                            onChange={(e) => handleRoleChange(u.id, e.target.value, u.nome)}
                                                            className="px-2.5 py-1.5 bg-white border border-warm-300 rounded-xl text-xs font-bold text-warm-800 outline-none cursor-pointer hover:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
                                                        >
                                                            <option value="aluno">🎓 Aluno</option>
                                                            <option value="professor">👨‍🏫 Professor / Tutor</option>
                                                            <option value="moderador">🛡️ Moderador</option>
                                                            <option value="suporte">🎧 Suporte</option>
                                                            <option value="desenvolvedor">💻 Desenvolvedor</option>
                                                            {currentUserRole === 'dona' && (
                                                                <option value="dona">👑 Dona</option>
                                                            )}
                                                        </select>
                                                        {isUpdating && <Loader2 size={14} className="animate-spin text-primary shrink-0" />}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Descrição das Permissões */}
                                            <td className="py-3 px-4 text-warm-500 text-[11px] max-w-xs truncate">
                                                {roleInfo.desc}
                                            </td>

                                            {/* Botão de Excluir Usuário */}
                                            <td className="py-3 px-4 text-center">
                                                {isPrimaryOwner || isCurrentUser ? (
                                                    <span className="text-[10px] text-warm-400 font-bold">—</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isDeleting || isUpdating}
                                                        onClick={() => handleDeleteUser(u.id, u.nome, u.email)}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200 disabled:opacity-50 shadow-2xs"
                                                        title={`Remover permanentemente o usuário ${u.nome}`}
                                                    >
                                                        {isDeleting ? <Loader2 size={14} className="animate-spin text-red-500" /> : <Trash2 size={14} />}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Guia de Permissões do Ecossistema */}
                    <div className="p-5 bg-warm-50 rounded-2xl border border-warm-200/80 space-y-3">
                        <h5 className="font-bold text-warm-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldCheck size={14} className="text-primary" /> Matriz de Permissões da Plataforma
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                                    <Crown size={12} className="text-amber-600" /> 👑 Dona
                                </p>
                                <p className="text-[11px] text-warm-600">Acesso total irrestrito: Gerencia membros, cargos, Estúdio CMS, turmas e backups.</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                                    <Code2 size={12} className="text-blue-600" /> 💻 Desenvolvedor
                                </p>
                                <p className="text-[11px] text-warm-600">Acesso ao CMS, código, métricas, backups e permissões (exceto rebaixar a Dona).</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-emerald-900 flex items-center gap-1 mb-1">
                                    <GraduationCap size={12} className="text-emerald-600" /> 👨‍🏫 Professor / Tutor
                                </p>
                                <p className="text-[11px] text-warm-600">Acesso ao Estúdio CMS (Criar aulas) e Painel de Alunos/Notas.</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-purple-900 flex items-center gap-1 mb-1">
                                    <ShieldCheck size={12} className="text-purple-600" /> 🛡️ Moderador
                                </p>
                                <p className="text-[11px] text-warm-600">Acompanha o engajamento e dúvidas dos alunos nos módulos.</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-cyan-900 flex items-center gap-1 mb-1">
                                    <Headphones size={12} className="text-cyan-600" /> 🎧 Suporte
                                </p>
                                <p className="text-[11px] text-warm-600">Atendimento ao aluno, checagem de e-mails e certificados.</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-warm-200/70">
                                <p className="font-bold text-warm-900 flex items-center gap-1 mb-1">
                                    <Users size={12} className="text-sage-700" /> 🎓 Aluno
                                </p>
                                <p className="text-[11px] text-warm-600">Acesso às aulas, quizzes de fixação, assistente IA e certificado de 40h.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAnalyticsDashboard;
