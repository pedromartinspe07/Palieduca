import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, BookOpen, CheckCircle2, Circle, Sparkles, MonitorPlay, ChevronLeft, ChevronRight, X, Award } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import { useAuth } from '../context/AuthContext';
import { getModuleIcon } from '../utils/iconUtils';
import '../index.css';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const ModuleViewer: React.FC = () => {
    const { slug_id } = useParams<{ slug_id: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    const [elements, setElements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [moduleInfo, setModuleInfo] = useState<any>(null);
    const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

    // Presentation mode (Modo Aula / Apresentação em Tela Cheia)
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const fetchModuleData = useCallback(async () => {
        setLoading(true);
        try {
            const modsRes = await fetch(`${API_URL}/api/modules`);
            if (modsRes.ok) {
                const modules = await modsRes.json();
                const currentMod = modules.find((m: any) => m.slug_id === slug_id);
                if (currentMod) {
                    setModuleInfo(currentMod);
                }
            }

            const pageRes = await fetch(`${API_URL}/api/v1/cms/pages/modulo_${slug_id}`);
            if (pageRes.ok) {
                const data = await pageRes.json();
                try {
                    setElements(JSON.parse(data.content || '[]'));
                } catch (e) {
                    setElements([]);
                }
            }

            // Busca progresso do aluno se estiver logado
            if (token) {
                const progRes = await fetch(`${API_URL}/api/progress`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (progRes.ok) {
                    const progData = await progRes.json();
                    setCompletedActivities(new Set(progData.completed_activities || []));
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados do módulo:", error);
        } finally {
            setLoading(false);
        }
    }, [slug_id, token]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchModuleData();
    }, [slug_id, fetchModuleData]);

    const toggleActivity = async (activityId: string) => {
        if (!token) {
            navigate('/login');
            return;
        }

        const isCurrentlyCompleted = completedActivities.has(activityId);
        const newStatus = !isCurrentlyCompleted;

        // Otimistic update
        setCompletedActivities(prev => {
            const next = new Set(prev);
            if (newStatus) next.add(activityId);
            else next.delete(activityId);
            return next;
        });

        try {
            await fetch(`${API_URL}/api/progress/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    module_slug: slug_id,
                    activity_id: activityId,
                    completed: newStatus
                })
            });
        } catch (err) {
            console.error('Erro ao alternar atividade:', err);
        }
    };

    // Teclas de atalho no modo apresentação
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isPresentationMode) return;
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                setCurrentSlideIndex(prev => Math.min(prev + 1, elements.length - 1));
            } else if (e.key === 'ArrowLeft') {
                setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Escape') {
                setIsPresentationMode(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPresentationMode, elements.length]);

    // Cálculo dinâmico do progresso
    const totalActivities = elements.length > 0 ? elements.length : 1;
    const completedCount = elements.filter(el => completedActivities.has(el.id)).length;
    const progressPercentage = elements.length > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;
    const isModuleFinished = progressPercentage === 100 && elements.length > 0;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-warm-50">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 bg-warm-50">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Barra de Navegação & Ações Superiores */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <button 
                        onClick={() => navigate('/modulos')}
                        className="flex items-center gap-2 text-warm-700 hover:text-primary transition-colors font-semibold bg-white px-4 py-2 rounded-2xl border border-warm-200 shadow-xs cursor-pointer text-xs"
                    >
                        <ArrowLeft size={16} />
                        Voltar para Trilhas
                    </button>

                    {elements.length > 0 && (
                        <button
                            onClick={() => { setIsPresentationMode(true); setCurrentSlideIndex(0); }}
                            className="flex items-center gap-2 px-4 py-2 bg-warm-800 hover:bg-warm-900 text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                            <MonitorPlay size={15} className="text-amber-300" />
                            Modo Apresentação (Tela Cheia)
                        </button>
                    )}
                </div>

                {/* Card de Progresso do Módulo no Topo */}
                {user && (
                    <div className="bg-white p-5 rounded-3xl border border-warm-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 w-full sm:w-auto">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                isModuleFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'
                            }`}>
                                {isModuleFinished ? <Award size={26} /> : <Sparkles size={24} />}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-500">
                                    Seu Progresso no Módulo
                                </h4>
                                <p className="text-sm font-extrabold text-warm-900">
                                    {completedCount} de {totalActivities} atividades concluídas ({progressPercentage}%)
                                </p>
                            </div>
                        </div>

                        {/* Barra de Progresso Visual */}
                        <div className="w-full sm:w-64 flex flex-col items-end gap-1.5">
                            <div className="w-full bg-warm-100 rounded-full h-3 overflow-hidden border border-warm-200">
                                <div 
                                    className={`h-full transition-all duration-500 rounded-full ${
                                        isModuleFinished 
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                            : 'bg-gradient-to-r from-primary to-secondary'
                                    }`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-bold text-warm-500">
                                {isModuleFinished ? '🎉 Módulo 100% Concluído!' : 'Continue aprendendo para avançar'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Conteúdo Principal do Módulo */}
                <div className="glassmorphism p-6 md:p-10 rounded-3xl border border-warm-200 shadow-xl bg-white mb-12">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-warm-100">
                        <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0 shadow-xs">
                            {getModuleIcon(moduleInfo?.icon_name, 32)}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-warm-900">
                                {moduleInfo ? moduleInfo.title : 'Conteúdo do Módulo'}
                            </h1>
                            {moduleInfo && (
                                <p className="text-warm-600 mt-1.5 text-sm leading-relaxed">{moduleInfo.description}</p>
                            )}
                        </div>
                    </div>
                    
                    {elements && elements.length > 0 ? (
                        <div className="w-full space-y-8">
                            {elements.map((block: any, index: number) => {
                                const isBlockCompleted = completedActivities.has(block.id);

                                return (
                                    <div 
                                        key={block.id} 
                                        className={`relative p-5 md:p-6 rounded-3xl border transition-all ${
                                            isBlockCompleted 
                                                ? 'bg-emerald-50/30 border-emerald-200/80 shadow-xs' 
                                                : 'bg-warm-50/40 border-warm-200'
                                        }`}
                                    >
                                        {/* Barra Superior do Bloco / Checkbox de Atividade */}
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-200/60">
                                            <div className="flex items-center gap-2 text-xs font-bold text-warm-600">
                                                <span className="w-6 h-6 rounded-full bg-warm-200/80 flex items-center justify-center text-warm-700 text-[11px]">
                                                    {index + 1}
                                                </span>
                                                <span className="uppercase tracking-wider text-[11px]">
                                                    {block.type === 'quiz' ? 'Quiz / Avaliação' : 'Leitura / Conteúdo'}
                                                </span>
                                            </div>

                                            {/* Botão de Marcar como Concluído */}
                                            {user && (
                                                <button
                                                    onClick={() => toggleActivity(block.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                                        isBlockCompleted
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                                            : 'bg-warm-100 text-warm-700 hover:bg-primary/10 hover:text-primary border border-warm-300'
                                                    }`}
                                                >
                                                    {isBlockCompleted ? (
                                                        <>
                                                            <CheckCircle2 size={15} className="text-emerald-600" />
                                                            <span>Concluído</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Circle size={15} className="text-warm-400" />
                                                            <span>Marcar como Concluído</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        <BlockRenderer 
                                            block={block} 
                                            isEditing={false} 
                                            isSelected={false}
                                            onUpdate={() => {}}
                                            onSelect={() => {}} 
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-warm-50 rounded-2xl border border-dashed border-warm-300">
                            <p className="text-warm-600 text-base">
                                O conteúdo deste módulo ainda está sendo preparado pela professora.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Apresentação em Tela Cheia (Modo Aula) */}
            {isPresentationMode && elements.length > 0 && (
                <div className="fixed inset-0 z-50 bg-warm-950 text-white flex flex-col animate-fade-in">
                    {/* Header do Modo Apresentação */}
                    <div className="flex items-center justify-between px-6 py-4 bg-warm-900 border-b border-warm-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl text-primary">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-warm-100">{moduleInfo?.title}</h3>
                                <p className="text-xs text-warm-400">Slide {currentSlideIndex + 1} de {elements.length}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                                disabled={currentSlideIndex === 0}
                                className="p-2 bg-warm-800 hover:bg-warm-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
                                title="Slide Anterior"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, elements.length - 1))}
                                disabled={currentSlideIndex === elements.length - 1}
                                className="p-2 bg-warm-800 hover:bg-warm-700 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
                                title="Próximo Slide"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={() => setIsPresentationMode(false)}
                                className="p-2 text-warm-400 hover:text-white hover:bg-warm-800 rounded-xl transition-colors ml-4 cursor-pointer"
                                title="Sair do Modo Apresentação (Esc)"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo do Slide Atual */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center bg-gradient-to-b from-warm-950 to-warm-900">
                        <div className="max-w-4xl w-full bg-white text-warm-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-warm-200">
                            <BlockRenderer 
                                block={elements[currentSlideIndex]} 
                                isEditing={false} 
                                isSelected={false}
                                onUpdate={() => {}}
                                onSelect={() => {}} 
                            />
                        </div>
                    </div>

                    {/* Rodapé com Navegação de Bolinhas */}
                    <div className="flex items-center justify-center gap-2 py-3 bg-warm-900/80 border-t border-warm-800">
                        {elements.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlideIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                                    idx === currentSlideIndex ? 'bg-primary scale-125' : 'bg-warm-700 hover:bg-warm-500'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
};

export default ModuleViewer;
