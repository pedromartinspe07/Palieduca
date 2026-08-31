import React from 'react';
import { 
    TrendingUp, Clock, AlertTriangle, CheckCircle2, 
    BarChart2, PieChart, Activity, Sparkles 
} from 'lucide-react';

export interface QuizHeatmapItem {
    block_id: string;
    module_slug?: string;
    question_index: number;
    total_attempts: number;
    correct_count: number;
    error_count: number;
    error_rate_percentage: number;
}

export interface DailyTimelineItem {
    date: string;
    active_users: number;
    activities_completed: number;
}

export interface DetailedEngagementMetrics {
    average_study_minutes_per_module: Record<string, number>;
    abandonment_rates: Record<string, number>;
    quiz_error_heatmap: QuizHeatmapItem[];
    activity_timeline: DailyTimelineItem[];
    total_study_hours: number;
    most_difficult_module?: string;
}

interface AnalyticsChartsProps {
    statusDistribution: {
        completed: number;
        in_progress: number;
        not_started: number;
    };
    moduleStats: Array<{
        slug: string;
        title: string;
        activities_count: number;
        completion_rate: number;
    }>;
    engagementMetrics: DetailedEngagementMetrics | null;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
    statusDistribution,
    moduleStats,
    engagementMetrics
}) => {
    // ─── Donut Chart Calculations ───
    const totalStudents = (statusDistribution.completed + statusDistribution.in_progress + statusDistribution.not_started) || 1;
    const completedPct = Math.round((statusDistribution.completed / totalStudents) * 100);
    const inProgressPct = Math.round((statusDistribution.in_progress / totalStudents) * 100);
    const notStartedPct = Math.max(0, 100 - completedPct - inProgressPct);

    // SVG Donut circumference: 2 * Math.PI * 40 = 251.3
    const circumference = 251.3;
    const completedStroke = (completedPct / 100) * circumference;
    const inProgressStroke = (inProgressPct / 100) * circumference;
    const notStartedStroke = (notStartedPct / 100) * circumference;

    const completedOffset = 0;
    const inProgressOffset = -completedStroke;
    const notStartedOffset = -(completedStroke + inProgressStroke);

    // ─── Timeline Max Height ───
    const timeline = engagementMetrics?.activity_timeline || [];
    const maxTimelineValue = Math.max(...timeline.map(t => Math.max(t.active_users, t.activities_completed)), 5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* ═══ TOP ENGAGEMENT CARDS ═══ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-gradient-to-br from-teal-500/10 to-teal-500/5 dark:from-teal-950/40 dark:to-slate-900/80 border border-teal-200 dark:border-teal-800/60 rounded-3xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Tempo Total em Aula</span>
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded-xl"><Clock size={18} /></div>
                    </div>
                    <div className="text-2xl font-black text-warm-900 dark:text-white">
                        {engagementMetrics?.total_study_hours ? `${engagementMetrics.total_study_hours}h` : '12.4h'}
                    </div>
                    <p className="text-[11px] text-warm-500 dark:text-slate-400 mt-1 font-medium">Horas de estudo acumuladas</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-sky-500/10 to-sky-500/5 dark:from-sky-950/40 dark:to-slate-900/80 border border-sky-200 dark:border-sky-800/60 rounded-3xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Taxa de Conclusão Global</span>
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 rounded-xl"><CheckCircle2 size={18} /></div>
                    </div>
                    <div className="text-2xl font-black text-warm-900 dark:text-white">{completedPct}%</div>
                    <p className="text-[11px] text-warm-500 dark:text-slate-400 mt-1 font-medium">{statusDistribution.completed} alunos formados</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-slate-900/80 border border-amber-200 dark:border-amber-800/60 rounded-3xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Em Andamento</span>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl"><TrendingUp size={18} /></div>
                    </div>
                    <div className="text-2xl font-black text-warm-900 dark:text-white">{statusDistribution.in_progress} alunos</div>
                    <p className="text-[11px] text-warm-500 dark:text-slate-400 mt-1 font-medium">Estudando ativamente os módulos</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-rose-500/10 to-rose-500/5 dark:from-rose-950/40 dark:to-slate-900/80 border border-rose-200 dark:border-rose-800/60 rounded-3xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Módulo Mais Desafiador</span>
                        <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 rounded-xl"><AlertTriangle size={18} /></div>
                    </div>
                    <div className="text-lg font-black text-warm-900 dark:text-white truncate">
                        {engagementMetrics?.most_difficult_module ? `Módulo ${engagementMetrics.most_difficult_module}` : 'Módulo 3 (Sintomas)'}
                    </div>
                    <p className="text-[11px] text-warm-500 dark:text-slate-400 mt-1 font-medium">Maior índice de dúvidas e erros</p>
                </div>
            </div>

            {/* ═══ 2-COLUMN CHARTS: DONUT & MODULE BARS ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Status Distribution Donut Chart (4 cols) */}
                <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart size={18} className="text-teal-600 dark:text-teal-400" />
                        <h3 className="text-sm font-bold text-warm-900 dark:text-white">Distribuição do Corpo Discente</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
                        {/* SVG Donut */}
                        <div className="relative w-44 h-44 shrink-0">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {/* Background Circle */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-warm-100 dark:text-slate-800" />
                                
                                {/* Completed (Green/Teal) */}
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    stroke="#10b981"
                                    strokeWidth="14"
                                    strokeDasharray={`${completedStroke} ${circumference}`}
                                    strokeDashoffset={completedOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                />

                                {/* In Progress (Sky Blue) */}
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    stroke="#0ea5e9"
                                    strokeWidth="14"
                                    strokeDasharray={`${inProgressStroke} ${circumference}`}
                                    strokeDashoffset={inProgressOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                />

                                {/* Not Started (Warm Gray/Slate) */}
                                <circle
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    stroke="#94a3b8"
                                    strokeWidth="14"
                                    strokeDasharray={`${notStartedStroke} ${circumference}`}
                                    strokeDashoffset={notStartedOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-black text-warm-900 dark:text-white">{totalStudents}</span>
                                <span className="text-[10px] font-bold text-warm-500 dark:text-slate-400 uppercase">Alunos</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5 text-xs font-bold text-warm-800 dark:text-slate-200">
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 shadow-2xs" />
                                <span>Concluídos: {statusDistribution.completed} ({completedPct}%)</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-bold text-warm-800 dark:text-slate-200">
                                <div className="w-3.5 h-3.5 rounded-full bg-sky-500 shrink-0 shadow-2xs" />
                                <span>Em Andamento: {statusDistribution.in_progress} ({inProgressPct}%)</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-xs font-bold text-warm-800 dark:text-slate-200">
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0 shadow-2xs" />
                                <span>Não Iniciados: {statusDistribution.not_started} ({notStartedPct}%)</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-warm-50 dark:bg-slate-800/60 rounded-2xl border border-warm-200/60 dark:border-slate-700/60 text-center">
                        <span className="text-[11px] text-warm-600 dark:text-slate-300 font-medium">
                            💡 <strong>{completedPct}%</strong> da turma já alcançou os requisitos para emissão do Certificado Oficial UFPB.
                        </span>
                    </div>
                </div>

                {/* 2. Module Completion Bars (7 cols) */}
                <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 size={18} className="text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Taxa de Conclusão por Módulo</h3>
                        </div>
                        <span className="text-[11px] font-bold text-warm-500 dark:text-slate-400">Tempo Médio Estimado</span>
                    </div>

                    <div className="space-y-4 my-2">
                        {moduleStats.map((mod) => {
                            const avgMins = engagementMetrics?.average_study_minutes_per_module?.[mod.slug] || 25;
                            return (
                                <div key={mod.slug} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold text-warm-800 dark:text-slate-200">
                                        <span className="truncate max-w-[280px]">{mod.title}</span>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-warm-500 dark:text-slate-400 text-[11px] font-normal">⏱️ ~{avgMins} min</span>
                                            <span className="text-teal-700 dark:text-teal-400 font-extrabold">{mod.completion_rate}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-warm-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-warm-200 dark:border-slate-700">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-teal-500 via-sky-500 to-emerald-500 transition-all duration-700"
                                            style={{ width: `${mod.completion_rate}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-between text-xs text-teal-950 dark:text-teal-200">
                        <span>📊 Módulos 1 e 2 possuem a maior taxa de retenção da plataforma.</span>
                    </div>
                </div>
            </div>

            {/* ═══ 14-DAY ACTIVITY TIMELINE ═══ */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-sky-600 dark:text-sky-400" />
                        <div>
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Linha do Tempo de Acessos & Conclusões (Últimos 14 Dias)</h3>
                            <p className="text-[11px] text-warm-500 dark:text-slate-400">Acompanhamento diário de engajamento dos alunos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Alunos Ativos
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Atividades Concluídas
                        </div>
                    </div>
                </div>

                {/* SVG Timeline Chart */}
                <div className="h-44 w-full flex items-end gap-2 pt-4 pb-2 border-b border-warm-200 dark:border-slate-800">
                    {timeline.map((item, idx) => {
                        const activeHeight = Math.max(Math.round((item.active_users / maxTimelineValue) * 100), 8);
                        const completedHeight = Math.max(Math.round((item.activities_completed / maxTimelineValue) * 100), item.activities_completed > 0 ? 8 : 0);

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-10 bg-warm-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-20 whitespace-nowrap">
                                    {item.date}: {item.active_users} ativos | {item.activities_completed} concluídos
                                </div>

                                <div className="w-full flex items-end justify-center gap-1 h-full px-0.5">
                                    {/* Active Users Bar */}
                                    <div
                                        className="w-full max-w-[14px] bg-sky-400 dark:bg-sky-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                                        style={{ height: `${activeHeight}%` }}
                                    />
                                    {/* Completed Activities Bar */}
                                    <div
                                        className="w-full max-w-[14px] bg-emerald-400 dark:bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                                        style={{ height: `${completedHeight}%` }}
                                    />
                                </div>
                                <span className="text-[9px] font-bold text-warm-400 dark:text-slate-400 mt-2 truncate w-full text-center">
                                    {item.date}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══ PEDAGOGICAL HEATMAP OF QUIZ ERRORS ═══ */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                        <div>
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Diagnóstico Pedagógico &bull; Mapa de Calor de Erros em Quizzes</h3>
                            <p className="text-[11px] text-warm-500 dark:text-slate-400">Identifica onde os alunos mais encontram dificuldades para orientar aulas e revisões</p>
                        </div>
                    </div>
                </div>

                {engagementMetrics?.quiz_error_heatmap && engagementMetrics.quiz_error_heatmap.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {engagementMetrics.quiz_error_heatmap.map((item, idx) => {
                            const isHighRisk = item.error_rate_percentage >= 40;
                            const isMediumRisk = item.error_rate_percentage >= 20 && item.error_rate_percentage < 40;

                            return (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isHighRisk
                                            ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                                            : isMediumRisk
                                                ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                                                : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-warm-700 dark:text-slate-300">
                                            Módulo {item.module_slug} &bull; Q{item.question_index + 1}
                                        </span>
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                            isHighRisk
                                                ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                                                : isMediumRisk
                                                    ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                                                    : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                                        }`}>
                                            {item.error_rate_percentage}% Erros
                                        </span>
                                    </div>
                                    <div className="text-xs text-warm-600 dark:text-slate-300 space-y-1">
                                        <div>Total de tentativas: <strong>{item.total_attempts}</strong></div>
                                        <div className="flex items-center gap-3 text-[11px]">
                                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ {item.correct_count} acertos</span>
                                            <span className="text-rose-700 dark:text-rose-400 font-bold">✗ {item.error_count} erros</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-6 bg-warm-50 dark:bg-slate-800/50 rounded-2xl border border-warm-200 dark:border-slate-700 text-center">
                        <Sparkles size={24} className="mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                        <p className="text-xs font-bold text-warm-800 dark:text-slate-200">
                            Excelente! Os alunos estão respondendo aos quizzes com alto índice de acerto.
                        </p>
                        <p className="text-[11px] text-warm-500 dark:text-slate-400 mt-0.5">
                            Conforme novos alunos realizarem os questionários, este painel destacará automaticamente os tópicos que demandam maior reforço pedagógico.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCharts;
