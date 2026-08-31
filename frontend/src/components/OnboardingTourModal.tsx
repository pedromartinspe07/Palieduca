import React, { useState, useEffect } from 'react';
import { 
    Sparkles, BookOpen, Volume2, Users, Award, 
    ChevronRight, ChevronLeft, CheckCircle2, X, Compass
} from 'lucide-react';
import { ButterflyIcon } from './ButterflyLogo';

interface OnboardingTourModalProps {
    forceOpen?: boolean;
    onClose?: () => void;
}

const ONBOARDING_STEPS = [
    {
        step: 1,
        badge: 'Boas-Vindas à UFPB',
        title: 'Bem-vindo(a) ao PaliEduca!',
        description: 'Sua jornada em Cuidados Paliativos começa aqui. Uma formação humanizada, interativa e baseada em evidências científicas desenvolvida no Departamento de Enfermagem da UFPB.',
        icon: ButterflyIcon,
        color: 'from-teal-600 to-emerald-600',
        tips: [
            'Plataforma oficial coordenada pela Prof.ª Patrícia Andrade',
            'Metodologia ativa com casos clínicos e simulações reais'
        ]
    },
    {
        step: 2,
        badge: 'Trilhas Didáticas',
        title: '6 Módulos de Aprendizagem Prática',
        description: 'Navegue pelos módulos desde os Fundamentos até Bioética. Cada módulo conta com textos claros, fluxogramas de sintomas e quizzes avaliativos.',
        icon: BookOpen,
        color: 'from-blue-600 to-teal-600',
        tips: [
            'Marque as atividades concluídas para avançar no curso',
            'Baixe apostilas completas em PDF (A4) com 1 clique para estudar offline'
        ]
    },
    {
        step: 3,
        badge: 'Inclusão & Acessibilidade',
        title: 'Áudio-aulas & Tradução em LIBRAS',
        description: 'Estude como preferir. Em cada módulo você encontra um player de áudio inteligente para ouvir as aulas e o assistente oficial de LIBRAS (VLibras).',
        icon: Volume2,
        color: 'from-amber-600 to-rose-600',
        tips: [
            'Ouça os tópicos durante o trânsito ou no plantão',
            'Modo Foco e controle de tamanho da fonte para leitura confortável'
        ]
    },
    {
        step: 4,
        badge: 'Espaço Colaborativo',
        title: 'Comunidade & Fórum de Casos Clínicos',
        description: 'Tire dúvidas direto com a tutoria e debata condutas farmacológicas e acolhimento familiar com seus colegas de turma.',
        icon: Users,
        color: 'from-emerald-600 to-teal-700',
        tips: [
            'Respostas oficiais da tutoria em destaque dourado',
            'Ambiente seguro com moderação ética e respeito acadêmico'
        ]
    },
    {
        step: 5,
        badge: 'Reconhecimento Oficial',
        title: 'Conquistas, XP e Certificado UFPB (40h)',
        description: 'Ao concluir 100% das atividades e quizzes, você desbloqueia o seu Certificado Oficial da UFPB com autenticador QR Code e Histórico Escolar discriminado.',
        icon: Award,
        color: 'from-amber-500 to-amber-600',
        tips: [
            'Ganhe medalhas pedagógicas e suba no ranking da turma',
            'Certificado válido para horas complementares acadêmicas e currículo'
        ]
    }
];

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({ forceOpen = false, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
            setCurrentStepIndex(0);
            return;
        }

        const isCompleted = localStorage.getItem('palieduca_onboarding_completed');
        if (!isCompleted) {
            // Abre com um pequeno delay agradável no primeiro acesso
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [forceOpen]);

    const handleClose = () => {
        localStorage.setItem('palieduca_onboarding_completed', 'true');
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleNext = () => {
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    const IconComponent = currentStep.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col justify-between transition-all">
                
                {/* ═══ TOPO COM GRADIENTE & ILUSTRAÇÃO ═══ */}
                <div className={`p-7 bg-gradient-to-r ${currentStep.color} text-white relative flex flex-col justify-between min-h-[160px]`}>
                    <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Compass size={13} /> {currentStep.badge}
                        </span>

                        <button
                            onClick={handleClose}
                            className="p-1.5 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors cursor-pointer"
                            title="Pular Guia"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3.5 mt-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
                            <IconComponent size={28} className="text-white" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                            {currentStep.title}
                        </h2>
                    </div>
                </div>

                {/* ═══ CORPO DO PASSO ═══ */}
                <div className="p-6 sm:p-8 space-y-5">
                    <p className="text-xs sm:text-sm text-warm-700 dark:text-slate-300 leading-relaxed font-medium">
                        {currentStep.description}
                    </p>

                    {/* Dicas / Destaques do Passo */}
                    <div className="p-4 rounded-2xl bg-warm-50/80 dark:bg-slate-800/60 border border-warm-200 dark:border-slate-700/80 space-y-2.5">
                        {currentStep.tips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-warm-800 dark:text-slate-200">
                                <CheckCircle2 size={15} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>

                    {/* Barra de Progresso em Pontos */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                        {ONBOARDING_STEPS.map((step, idx) => (
                            <div
                                key={step.step}
                                onClick={() => setCurrentStepIndex(idx)}
                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                    idx === currentStepIndex
                                        ? 'w-7 bg-teal-600 dark:bg-teal-400'
                                        : 'w-2 bg-warm-200 dark:bg-slate-700 hover:bg-warm-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* ═══ RODAPÉ COM AÇÕES ═══ */}
                <div className="p-5 border-t border-warm-100 dark:border-slate-800 bg-warm-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
                    <button
                        onClick={handlePrev}
                        disabled={currentStepIndex === 0}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-warm-700 dark:text-slate-300 hover:bg-warm-200/60 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStepIndex < ONBOARDING_STEPS.length - 1 ? (
                            <button
                                onClick={handleClose}
                                className="px-3 py-2 text-xs font-bold text-warm-500 dark:text-slate-400 hover:text-warm-800 dark:hover:text-white cursor-pointer"
                            >
                                Pular
                            </button>
                        ) : null}

                        <button
                            onClick={handleNext}
                            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                        >
                            {currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
                                <>
                                    <Sparkles size={15} /> Começar Meus Estudos
                                </>
                            ) : (
                                <>
                                    Próximo <ChevronRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OnboardingTourModal;
