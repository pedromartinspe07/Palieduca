import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Award, 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    ArrowLeft, 
    RotateCcw, 
    Sparkles, 
    GraduationCap
} from 'lucide-react';
import BotanicalBackground from '../components/effects/BotanicalBackground';
import ConfettiCelebration from '../components/effects/ConfettiCelebration';

interface Question {
    id: number;
    theme: string;
    question: string;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionId: string;
    explanation: string;
}

const SIMULADO_QUESTIONS: Question[] = [
    {
        id: 1,
        theme: 'Fundamentos & Definição OMS',
        question: 'De acordo com a Organização Mundial da Saúde (OMS), quando devem ser iniciados os Cuidados Paliativos?',
        options: [
            { id: 'A', text: 'Apenas nas últimas 48 a 72 horas de vida do paciente.' },
            { id: 'B', text: 'Desde o diagnóstico de uma doença que ameaça a continuidade da vida, concomitante ao tratamento modificador da doença.' },
            { id: 'C', text: 'Exclusivamente quando todos os recursos curativos e cirúrgicos tiverem falhado.' },
            { id: 'D', text: 'Apenas após a assinatura de um termo judicial de renúncia ao tratamento.' }
        ],
        correctOptionId: 'B',
        explanation: 'A OMS define que os Cuidados Paliativos devem ser integrados precocemente, desde o diagnóstico de doenças graves e progressivas, ampliando sua intensidade à medida que a doença avança.'
    },
    {
        id: 2,
        theme: 'Manejo da Dor & Escala EVA',
        question: 'Na avaliação da dor como 5º sinal vital em Cuidados Paliativos, qual é a conduta prioritária da enfermagem?',
        options: [
            { id: 'A', text: 'Acreditar no autorrelato do paciente, mensurar com escalas validadas (como a EVA) e administrar analgesia em horários fixos e preventivos.' },
            { id: 'B', text: 'Aguardar o paciente solicitar a medicação para evitar dependência química a opioides.' },
            { id: 'C', text: 'Avaliar a dor apenas quando houver alterações significativas na pressão arterial e frequência cardíaca.' },
            { id: 'D', text: 'Suspender a hidratação e analgesia caso o paciente apresente sonolência leve.' }
        ],
        correctOptionId: 'A',
        explanation: 'A dor é subjetiva e o autorrelato é o padrão-ouro. O controle eficaz da dor oncológica e crônica exige administração de analgésicos em horários fixos (ao redor do relógio), e não "se necessário" (SOS).'
    },
    {
        id: 3,
        theme: 'Bioética & Distanásia',
        question: 'A realização de procedimentos invasivos, dolorosos e desproporcionais que apenas prolongam o processo de morte sem trazer benefícios reais à qualidade de vida é conceituada como:',
        options: [
            { id: 'A', text: 'Ortotanásia' },
            { id: 'B', text: 'Eutanásia' },
            { id: 'C', text: 'Distanásia (Obstinação Terapêutica)' },
            { id: 'D', text: 'Mistotanásia' }
        ],
        correctOptionId: 'C',
        explanation: 'A Distanásia representa o prolongamento fútil e sofrido da agonia por meio de medidas invasivas desproporcionais. O papel da equipe é promover a Ortotanásia (morte no seu tempo natural, com dignidade e alívio do sofrimento).'
    },
    {
        id: 4,
        theme: 'Comunicação Terapêutica & SPIKES',
        question: 'No protocolo SPIKES para comunicação de notícias difíceis em saúde, a etapa "P" (Perception) refere-se a:',
        options: [
            { id: 'A', text: 'Prescrever imediatamente os sedativos necessários.' },
            { id: 'B', text: 'Investigar o que o paciente e a família já sabem ou percebem sobre o seu estado clínico.' },
            { id: 'C', text: 'Preparar a sala de atendimento com materiais hospitalares.' },
            { id: 'D', text: 'Passar todas as informações médicas sem interrupções.' }
        ],
        correctOptionId: 'B',
        explanation: 'A etapa Perception (Percepção) consiste em sondar o entendimento prévio do paciente/família sobre o quadro de saúde por meio de perguntas abertas, alinhando a comunicação à realidade do indivíduo.'
    },
    {
        id: 5,
        theme: 'Conceito de Dor Total',
        question: 'O conceito pioneiro de "Dor Total", introduzido por Dame Cicely Saunders, preconiza que o sofrimento humano abrange quatro dimensões essenciais. São elas:',
        options: [
            { id: 'A', text: 'Física, Psicológica, Social e Espiritual.' },
            { id: 'B', text: 'Biológica, Financeira, Jurídica e Política.' },
            { id: 'C', text: 'Somática, Muscular, Articular e Neural.' },
            { id: 'D', text: 'Celular, Sistêmica, Comportamental e Laboratorial.' }
        ],
        correctOptionId: 'A',
        explanation: 'Cicely Saunders compreendeu que o sofrimento do paciente com doença avançada não é apenas físico, mas multifacetado, envolvendo dores emocionais, rompimentos sociais e angústias existenciais/espirituais.'
    },
    {
        id: 6,
        theme: 'Manejo da Dispneia Terminal',
        question: 'Qual é o fármaco de primeira linha padrão-ouro recomendado internacionalmente para o alívio sintomático da dispneia refratária em Cuidados Paliativos?',
        options: [
            { id: 'A', text: 'Morfina (Opioide) em doses tituladas.' },
            { id: 'B', text: 'Antibiótico de largo espectro.' },
            { id: 'C', text: 'Diurético em alta dosagem.' },
            { id: 'D', text: 'Anti-inflamatório não esteroidal injetável.' }
        ],
        correctOptionId: 'A',
        explanation: 'A morfina atua reduzindo a sensação de falta de ar no centro respiratório cerebral e a ansiedade associada à asfixia, sendo a medicação de escolha com segurança comprovada em doses tituladas.'
    },
    {
        id: 7,
        theme: 'Diretivas Antecipadas de Vontade',
        question: 'As Diretivas Antecipadas de Vontade (DAV / Testamento Vital) no Brasil têm como objetivo principal:',
        options: [
            { id: 'A', text: 'Autorizar a realização de eutanásia ativa pela equipe hospitalar.' },
            { id: 'B', text: 'Garantir que a autonomia do paciente seja respeitada caso ele venha a perder a capacidade de expressar sua vontade.' },
            { id: 'C', text: 'Transferir a guarda dos bens materiais do paciente para o hospital.' },
            { id: 'D', text: 'Obrigar a equipe a realizar reanimação cardiopulmonar em qualquer circunstância.' }
        ],
        correctOptionId: 'B',
        explanation: 'As Diretivas Antecipadas expressam os desejos prévios do paciente quanto aos tratamentos que deseja ou recusa receber no fim de vida, resguardando sua dignidade e autonomia bioética.'
    },
    {
        id: 8,
        theme: 'Fase Ativa de Morte & Estertor',
        question: 'Durante a fase ativa de morte (últimas horas de vida), o ruído respiratório conhecido como "estertor pré-morte" (acúmulo de secreção em vias aéreas superiores) deve ser manejado prioritariamente com:',
        options: [
            { id: 'A', text: 'Aspiração traqueal vigorosa e repetida com sonda de grande calibre.' },
            { id: 'B', text: 'Mudança de decúbito (posicionamento lateral), cabeceira elevada, hidratação oral cuidadosa e tranquilização da família explicando que o paciente não está em sofrimento asfixiante.' },
            { id: 'C', text: 'Intubação orotraqueal e ventilação mecânica invasiva.' },
            { id: 'D', text: 'Administração de grandes volumes de soro fisiológico intravenoso.' }
        ],
        correctOptionId: 'B',
        explanation: 'A aspiração agressiva nas últimas horas é desconfortável e causa sangramento/estresse. A conduta correta é o reposicionamento suave e o acolhimento à família, desmistificando o ruído.'
    },
    {
        id: 9,
        theme: 'Sedação Paliativa vs Eutanásia',
        question: 'A Sedação Paliativa difere fundamentalmente da Eutanásia porque:',
        options: [
            { id: 'A', text: 'A Sedação Paliativa tem a intenção ética de aliviar um sintoma refratário intolerável, titulando fármacos sedativos até o alívio, sem a intenção de abreviar a vida.' },
            { id: 'B', text: 'Ambas possuem a mesma finalidade de provocar a morte imediata.' },
            { id: 'C', text: 'A sedação paliativa é proibida no Brasil pelo Conselho Federal de Medicina e Enfermagem.' },
            { id: 'D', text: 'A sedação só pode ser indicada em pacientes jovens sem comorbidades.' }
        ],
        correctOptionId: 'A',
        explanation: 'Na sedação paliativa, a intenção é o alívio proporcional do sofrimento refratário insuportável através do rebaixamento da consciência. Na eutanásia, a intenção deliberada é provocar a cessação da vida.'
    },
    {
        id: 10,
        theme: 'Cuidado Humanizado & Luto',
        question: 'No processo de morrer e no apoio ao luto, qual é o papel essencial da equipe de enfermagem junto aos familiares?',
        options: [
            { id: 'A', text: 'Restringir as visitas a 15 minutos por dia para não atrapalhar a rotina da unidade.' },
            { id: 'B', text: 'Promover a presença contínua da família, flexibilizar horários, permitir toques/rituais significativos e validar as emoções dos entes queridos.' },
            { id: 'C', text: 'Proibir qualquer manifestação de choro no quarto do paciente.' },
            { id: 'D', text: 'Transferir o paciente imediatamente para a UTI para isolamento.' }
        ],
        correctOptionId: 'B',
        explanation: 'O cuidado paliativo estende-se à unidade paciente-família. O acolhimento compassivo, a presença irrestrita e a permissão para rituais culturais/espirituais são pilares da assistência humanizada.'
    }
];

export const SimuladoProficiencia: React.FC = () => {
    const navigate = useNavigate();
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const currentQuestion = SIMULADO_QUESTIONS[currentIdx];
    const totalQuestions = SIMULADO_QUESTIONS.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    const handleSelectOption = (optionId: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: optionId
        }));
    };

    const handleNext = () => {
        if (currentIdx < totalQuestions - 1) {
            setCurrentIdx(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIdx > 0) {
            setCurrentIdx(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        if (answeredCount < totalQuestions) {
            const confirm = window.confirm(`Você respondeu ${answeredCount} de ${totalQuestions} questões. Deseja finalizar o simulado mesmo assim?`);
            if (!confirm) return;
        }
        setIsSubmitted(true);
        setCurrentIdx(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setSelectedAnswers({});
        setIsSubmitted(false);
        setCurrentIdx(0);
    };

    // Cálculos de pontuação
    const correctCount = SIMULADO_QUESTIONS.reduce((acc, q) => {
        return selectedAnswers[q.id] === q.correctOptionId ? acc + 1 : acc;
    }, 0);
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const hasPassed = scorePercentage >= 70;

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
            {isSubmitted && hasPassed && <ConfettiCelebration />}

            <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Cabeçalho do Simulado */}
                <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] border border-warm-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <GraduationCap size={26} />
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                Exame de Proficiência Acadêmica &bull; UFPB
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-warm-900 mt-1">
                                Simulado Geral de Cuidados Paliativos
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/modulos')}
                        className="text-xs font-bold text-warm-500 hover:text-warm-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                        <ArrowLeft size={14} /> Voltar às Trilhas
                    </button>
                </div>

                {/* Banner de Resultado Final (se submetido) */}
                {isSubmitted && (
                    <div className={`p-6 sm:p-8 rounded-[28px] text-white shadow-xl animate-fade-in border ${
                        hasPassed 
                            ? 'bg-gradient-to-br from-teal-800 via-emerald-700 to-teal-900 border-teal-600/40' 
                            : 'bg-gradient-to-br from-amber-700 via-warm-800 to-amber-900 border-amber-600/40'
                    }`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-center sm:text-left">
                                <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                                    <Award size={40} className={hasPassed ? 'text-amber-300' : 'text-warm-300'} />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black">
                                        {hasPassed ? '🎉 Excelente Aproveitamento!' : 'Estudo em Progresso'}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md">
                                        {hasPassed 
                                            ? `Você alcançou ${scorePercentage}% de acerto (${correctCount}/${totalQuestions} questões) e demonstrou sólido domínio dos princípios de Cuidados Paliativos da UFPB.` 
                                            : `Você acertou ${correctCount} de ${totalQuestions} questões (${scorePercentage}%). Recomendamos revisar os módulos e refazer o simulado.`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <div className="text-4xl font-black font-mono">
                                    {scorePercentage}%
                                </div>
                                <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-full">
                                    {hasPassed ? 'Aprovado com Louvor' : 'Nota Mínima: 70%'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                                <RotateCcw size={14} /> Refazer Simulado
                            </button>

                            <button
                                onClick={() => navigate('/perfil')}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-900 hover:bg-white/90 rounded-xl font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                            >
                                <Award size={15} /> Ver Meu Certificado no Perfil
                            </button>
                        </div>
                    </div>
                )}

                {/* Barra de Navegação Rápida entre as 10 Questões */}
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-warm-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
                    <span className="text-xs font-bold text-warm-600 shrink-0 mr-1">
                        Questões:
                    </span>
                    <div className="flex items-center gap-1.5 flex-1 justify-start sm:justify-center">
                        {SIMULADO_QUESTIONS.map((q, idx) => {
                            const isAnswered = selectedAnswers[q.id] !== undefined;
                            const isCurrent = idx === currentIdx;
                            const isCorrect = isSubmitted && selectedAnswers[q.id] === q.correctOptionId;
                            const isWrong = isSubmitted && isAnswered && !isCorrect;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                                        isCurrent 
                                            ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                                            : ''
                                    } ${
                                        isSubmitted 
                                            ? isCorrect 
                                                ? 'bg-emerald-600 text-white' 
                                                : isWrong 
                                                    ? 'bg-rose-600 text-white' 
                                                    : 'bg-warm-200 text-warm-600'
                                            : isAnswered 
                                                ? 'bg-primary text-white' 
                                                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                                    }`}
                                >
                                    {q.id}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Card da Questão Atual */}
                <div className="bg-white rounded-[28px] border border-warm-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-warm-100 pb-4">
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                            {currentQuestion.theme}
                        </span>
                        <span className="text-xs font-bold text-warm-400">
                            Questão {currentIdx + 1} de {totalQuestions}
                        </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-warm-900 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    {/* Opções de Resposta */}
                    <div className="space-y-3">
                        {currentQuestion.options.map(opt => {
                            const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                            const isCorrect = isSubmitted && opt.id === currentQuestion.correctOptionId;
                            const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                            let buttonStyle = 'bg-warm-50/80 hover:bg-warm-100 text-warm-800 border-warm-200';

                            if (isSubmitted) {
                                if (isCorrect) {
                                    buttonStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 font-bold';
                                } else if (isWrongSelected) {
                                    buttonStyle = 'bg-rose-50 text-rose-950 border-rose-500 font-bold';
                                }
                            } else if (isSelected) {
                                buttonStyle = 'bg-primary/10 border-primary text-primary font-bold shadow-xs';
                            }

                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectOption(opt.id)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${buttonStyle}`}
                                >
                                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border ${
                                        isSubmitted 
                                            ? isCorrect 
                                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                                : isWrongSelected 
                                                    ? 'bg-rose-600 text-white border-rose-600' 
                                                    : 'bg-warm-200 text-warm-700 border-warm-300'
                                            : isSelected 
                                                ? 'bg-primary text-white border-primary' 
                                                : 'bg-white text-warm-700 border-warm-300'
                                    }`}>
                                        {opt.id}
                                    </span>
                                    <span className="text-xs sm:text-sm leading-relaxed flex-1">
                                        {opt.text}
                                    </span>
                                    {isSubmitted && isCorrect && (
                                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    )}
                                    {isSubmitted && isWrongSelected && (
                                        <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explicação Científica / Feedback da Professora */}
                    {isSubmitted && (
                        <div className="p-5 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs sm:text-sm text-teal-950 space-y-2 animate-fade-in">
                            <div className="flex items-center gap-2 font-bold text-teal-900">
                                <Sparkles size={16} className="text-teal-700" />
                                <span>Comentário &amp; Justificativa Científica (Prof.ª Patrícia):</span>
                            </div>
                            <p className="leading-relaxed text-warm-800">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    )}

                    {/* Botões de Navegação Inferiores */}
                    <div className="pt-4 border-t border-warm-100 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={currentIdx === 0}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-40"
                        >
                            <ArrowLeft size={14} /> Anterior
                        </button>

                        {!isSubmitted ? (
                            currentIdx === totalQuestions - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
                                >
                                    <CheckCircle2 size={16} /> Finalizar Simulado
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                                >
                                    Próxima <ArrowRight size={14} />
                                </button>
                            )
                        ) : (
                            currentIdx < totalQuestions - 1 && (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                                >
                                    Próxima <ArrowRight size={14} />
                                </button>
                            )
                        )}
                    </div>
                </div>

            </div>
        </BotanicalBackground>
    );
};

export default SimuladoProficiencia;
