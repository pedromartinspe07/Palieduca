import React, { useState, useEffect } from 'react';
import type { BlockProps } from './types';
import { 
    HeartPulse, 
    Stethoscope, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    RotateCcw, 
    Activity, 
    User, 
    BookOpen, 
    ChevronRight,
    Edit3,
    Plus
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getGuestId } from '../../../utils/guestStorage';

export interface DecisionOption {
    id: string;
    label: string; // Ex: "Conduta A: Administrar morfina..."
    rating: 'optimal' | 'acceptable' | 'inadequate'; // Padrão-ouro, Aceitável com ressalvas, Inadequada
    outcome_title: string;
    outcome_description: string;
    scientific_rationale: string;
}

export interface ClinicalCaseData {
    patient_name: string;
    patient_age_gender: string;
    diagnosis: string;
    setting?: string; // Ex: "Internação Hospitalar", "Atenção Domiciliar (Home Care)", "Ambulatório"
    clinical_scenario: string;
    vitals?: {
        pa?: string;
        fc?: string;
        fr?: string;
        dor?: string;
        spo2?: string;
        consciencia?: string;
    };
    decision_prompt: string;
    decisions: DecisionOption[];
}

const DEFAULT_CASE_DATA: ClinicalCaseData = {
    patient_name: 'Dona Maria de Lourdes, 72 anos',
    patient_age_gender: 'Feminino, 72 anos',
    diagnosis: 'Neoplasia pulmonar avançada em cuidados paliativos exclusivos',
    setting: 'Enfermaria de Cuidados Paliativos',
    clinical_scenario: 'Paciente internada há 3 dias com queixa de dispneia súbita moderada a grave em repouso (FR: 28 irpm, SpO2: 89% em ar ambiente), acompanhada de ansiedade intensa e relato de dor torácica grau 7/10. O familiar acompanhante demonstra elevado sofrimento psíquico e solicita socorro imediato à equipe de enfermagem.',
    vitals: {
        pa: '130/80 mmHg',
        fc: '102 bpm',
        fr: '28 irpm',
        dor: '7/10 (Forte)',
        spo2: '89% (Ar ambiente)',
        consciencia: 'Lúcida e ansiosa'
    },
    decision_prompt: 'Como enfermeiro(a) responsável pelo plantão, qual é a sua conduta imediata e prioritária para garantir o alívio do sofrimento e o conforto da paciente?',
    decisions: [
        {
            id: 'conduta-1',
            label: 'Elevar a cabeceira do leito a 45° (posição de Fowler), instituir oxigenoterapia em baixo fluxo por cateter nasal, administrar morfina em baixas doses conforme protocolo prescrito e acolher o familiar.',
            rating: 'optimal',
            outcome_title: 'Desfecho Excelente: Alívio da Dispneia e Conforto Respiratório',
            outcome_description: 'A paciente apresentou redução significativa do trabalho respiratório em 15 minutos, a dor reduziu para 2/10 e a ansiedade cedeu. A saturação estabilizou em 93% e o familiar sentiu-se acolhido e orientado pela equipe.',
            scientific_rationale: 'Em Cuidados Paliativos, a morfina é o padrão-ouro no manejo da dispneia refratária, reduzindo a sensação de sufocamento sem causar depressão respiratória quando titulada adequadamente, associada ao posicionamento de alívio e acolhimento familiar (ANCP / EAPC).'
        },
        {
            id: 'conduta-2',
            label: 'Instalar máscara com reservatório em alto fluxo (15 L/min), solicitar intubação orotraqueal imediata e restringir a presença do familiar no quarto.',
            rating: 'inadequate',
            outcome_title: 'Desfecho Inadequado: Distanásia e Sofrimento Evitável',
            outcome_description: 'A tentativa de medidas invasivas contraria o plano de cuidados paliativos estabelecido com a família, gerando pânico na paciente e afastando a família em momento de vulnerabilidade, sem agregar benefício clínico.',
            scientific_rationale: 'Medidas invasivas desproporcionais caracterizam distanásia e violam os princípios bioéticos dos cuidados paliativos, que priorizam o conforto, a dignidade e a proporcionalidade terapêutica.'
        },
        {
            id: 'conduta-3',
            label: 'Apenas orientar a paciente a respirar fundo e aguardar a próxima visita médica de rotina no dia seguinte.',
            rating: 'acceptable',
            outcome_title: 'Desfecho Insuficiente: Sofrimento Prolongado',
            outcome_description: 'Embora a presença e a comunicação sejam importantes, a ausência de intervenção farmacológica e postural imediata manteve a paciente em sofrimento respiratório e dor aguda desnecessários.',
            scientific_rationale: 'A dispneia aguda em cuidados paliativos constitui uma emergência de conforto que exige intervenção de enfermagem ativa, medicamentosa e multiprofissional imediata.'
        }
    ]
};

const ClinicalCaseBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onSelect, onUpdate }) => {
    const { user } = useAuth();
    const data: ClinicalCaseData = { ...DEFAULT_CASE_DATA, ...(block.data || {}) };

    const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const storageKey = `pali_case_${block.id}_${user?.id || getGuestId()}`;

    // Carregar decisão anterior salva
    useEffect(() => {
        if (isEditing) return;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.selectedDecisionId) {
                    setSelectedDecisionId(parsed.selectedDecisionId);
                    setIsSubmitted(true);
                }
            }
        } catch {
            /* silent */
        }
    }, [storageKey, isEditing]);

    const handleSelectOption = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onSelect(block.id);
        if (isEditing) return;
        if (isSubmitted) return;
        setSelectedDecisionId(id);
    };

    const handleConfirm = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onSelect(block.id);
        if (isEditing) return;
        if (!selectedDecisionId) return;
        setIsSubmitted(true);
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                selectedDecisionId,
                submittedAt: new Date().toISOString()
            }));
        } catch {
            /* silent */
        }
    };

    const handleReset = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onSelect(block.id);
        if (isEditing) return;
        setSelectedDecisionId(null);
        setIsSubmitted(false);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            /* silent */
        }
    };

    const updateField = (field: string, value: any) => {
        onUpdate(block.id, { data: { ...data, [field]: value } });
    };

    const updateVital = (vitalKey: string, value: string) => {
        const updatedVitals = { ...(data.vitals || {}), [vitalKey]: value };
        onUpdate(block.id, { data: { ...data, vitals: updatedVitals } });
    };

    const updateDecision = (decisionId: string, patch: Partial<DecisionOption>) => {
        const updatedDecisions = (data.decisions || []).map(d => d.id === decisionId ? { ...d, ...patch } : d);
        onUpdate(block.id, { data: { ...data, decisions: updatedDecisions } });
    };

    const addDecision = () => {
        const newDec: DecisionOption = {
            id: `dec_${Date.now()}`,
            label: 'Nova conduta de enfermagem',
            rating: 'acceptable',
            outcome_title: 'Desfecho da conduta',
            outcome_description: 'Evolução clínica do paciente após a conduta.',
            scientific_rationale: 'Fundamentação científica alinhada às diretrizes da ANCP/OMS.'
        };
        onUpdate(block.id, { data: { ...data, decisions: [...(data.decisions || []), newDec] } });
    };

    const removeDecision = (decisionId: string) => {
        const updatedDecisions = (data.decisions || []).filter(d => d.id !== decisionId);
        onUpdate(block.id, { data: { ...data, decisions: updatedDecisions } });
    };

    const activeDecision = data.decisions?.find(d => d.id === selectedDecisionId);

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`my-6 rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border-2 transition-all shadow-md relative ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'border-primary ring-4 ring-primary/20 shadow-xl' : 'border-warm-200 dark:border-slate-800 hover:border-teal-400'
            }`}
        >
            {/* Badge de Seleção no Editor */}
            {isEditing && isSelected && (
                <div className="absolute -top-3 right-6 bg-primary text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-md flex items-center gap-1.5 z-20 animate-fade-in">
                    <Edit3 size={12} />
                    <span>Editável no Canvas & no Painel Lateral</span>
                </div>
            )}

            {/* Tag Superior do Bloco */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-warm-200 dark:border-slate-800">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                    <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800 shrink-0 shadow-xs">
                        <Stethoscope size={22} />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] font-extrabold uppercase tracking-wider">
                            <Activity size={12} className="text-teal-600 dark:text-teal-400" />
                            Caso Clínico Interativo &bull; Tomada de Decisão
                        </div>
                        {isEditing ? (
                            <div className="mt-1">
                                <input
                                    type="text"
                                    value={data.patient_name || ''}
                                    onChange={(e) => updateField('patient_name', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Nome e Idade do Paciente (Ex: Dona Maria de Lourdes, 72 anos)"
                                    className="text-base sm:text-lg font-bold text-warm-900 dark:text-slate-100 bg-transparent border-b-2 border-dashed border-teal-500/50 hover:border-teal-500 focus:border-teal-500 outline-none w-full transition-colors"
                                    title="Clique para editar o nome do paciente diretamente"
                                />
                            </div>
                        ) : (
                            <h3 className="text-base sm:text-lg font-bold text-warm-900 dark:text-slate-100 mt-1">
                                {data.patient_name || 'Paciente sem identificação'}
                            </h3>
                        )}
                    </div>
                </div>

                <div>
                    {isEditing ? (
                        <div className="inline-flex items-center gap-1 bg-warm-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-warm-200 dark:border-slate-700 shadow-2xs">
                            <span className="text-xs">📍</span>
                            <input
                                type="text"
                                value={data.setting || ''}
                                onChange={(e) => updateField('setting', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Local / Enfermaria..."
                                className="text-[11px] font-semibold text-warm-700 dark:text-slate-200 bg-transparent border-b border-dashed border-warm-400 dark:border-slate-600 outline-none w-44"
                                title="Clique para editar o local de atendimento diretamente"
                            />
                        </div>
                    ) : (
                        data.setting && (
                            <span className="text-[11px] font-semibold text-warm-600 dark:text-slate-300 bg-warm-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-warm-200 dark:border-slate-700 shadow-2xs">
                                📍 {data.setting}
                            </span>
                        )
                    )}
                </div>
            </div>

            {/* Diagnóstico e Sinais Vitais */}
            <div className="my-5 space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-600/50 text-xs text-amber-950 dark:text-amber-100 flex items-start gap-3 shadow-xs">
                    <User size={18} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="w-full">
                        <strong className="font-bold text-amber-950 dark:text-amber-200">Diagnóstico e Histórico de Base:</strong>
                        {isEditing ? (
                            <textarea
                                rows={2}
                                value={data.diagnosis || ''}
                                onChange={(e) => updateField('diagnosis', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Ex: Neoplasia pulmonar avançada em cuidados paliativos exclusivos..."
                                className="w-full mt-1 p-2 text-xs text-amber-950 dark:text-slate-100 bg-amber-100/50 dark:bg-slate-900/80 border border-dashed border-amber-400 dark:border-amber-600 rounded-lg outline-none resize-none font-medium leading-relaxed"
                                title="Clique para editar o diagnóstico diretamente"
                            />
                        ) : (
                            <p className="mt-0.5 text-amber-900 dark:text-slate-100 font-medium leading-relaxed">
                                {data.diagnosis || 'Não especificado'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Grid de Sinais Vitais */}
                {((data.vitals && Object.keys(data.vitals).length > 0) || isEditing) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">P.A.</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.pa || ''}
                                    onChange={(e) => updateVital('pa', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="130/80"
                                    className="w-full text-center text-xs font-black text-warm-900 dark:text-white bg-transparent border-b border-dashed border-teal-400 outline-none mt-0.5"
                                    title="Editar Pressão Arterial"
                                />
                            ) : (
                                <span className="text-xs font-black text-warm-900 dark:text-white">{data.vitals?.pa || '—'}</span>
                            )}
                        </div>
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">F.C.</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.fc || ''}
                                    onChange={(e) => updateVital('fc', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="102 bpm"
                                    className="w-full text-center text-xs font-black text-warm-900 dark:text-white bg-transparent border-b border-dashed border-teal-400 outline-none mt-0.5"
                                    title="Editar Frequência Cardíaca"
                                />
                            ) : (
                                <span className="text-xs font-black text-warm-900 dark:text-white">{data.vitals?.fc || '—'}</span>
                            )}
                        </div>
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">F.R.</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.fr || ''}
                                    onChange={(e) => updateVital('fr', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="28 irpm"
                                    className="w-full text-center text-xs font-black text-rose-600 dark:text-rose-400 bg-transparent border-b border-dashed border-rose-400 outline-none mt-0.5"
                                    title="Editar Frequência Respiratória"
                                />
                            ) : (
                                <span className="text-xs font-black text-rose-600 dark:text-rose-400">{data.vitals?.fr || '—'}</span>
                            )}
                        </div>
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">Dor (EVA)</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.dor || ''}
                                    onChange={(e) => updateVital('dor', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="7/10"
                                    className="w-full text-center text-xs font-black text-rose-600 dark:text-rose-400 bg-transparent border-b border-dashed border-rose-400 outline-none mt-0.5"
                                    title="Editar Escala de Dor"
                                />
                            ) : (
                                <span className="text-xs font-black text-rose-600 dark:text-rose-400">{data.vitals?.dor || '—'}</span>
                            )}
                        </div>
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">SpO2</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.spo2 || ''}
                                    onChange={(e) => updateVital('spo2', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="89%"
                                    className="w-full text-center text-xs font-black text-warm-900 dark:text-white bg-transparent border-b border-dashed border-teal-400 outline-none mt-0.5"
                                    title="Editar Saturação de Oxigênio"
                                />
                            ) : (
                                <span className="text-xs font-black text-warm-900 dark:text-white">{data.vitals?.spo2 || '—'}</span>
                            )}
                        </div>
                        <div className="p-2.5 bg-warm-50/80 dark:bg-slate-800 rounded-xl border border-warm-200 dark:border-slate-700 text-center shadow-2xs">
                            <span className="text-[10px] text-warm-500 dark:text-slate-300 font-bold uppercase block">Consciência</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={data.vitals?.consciencia || ''}
                                    onChange={(e) => updateVital('consciencia', e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Lúcida"
                                    className="w-full text-center text-[11px] font-bold text-warm-900 dark:text-white bg-transparent border-b border-dashed border-teal-400 outline-none mt-0.5"
                                    title="Editar Estado de Consciência"
                                />
                            ) : (
                                <span className="text-[11px] font-bold text-warm-900 dark:text-white truncate block">{data.vitals?.consciencia || '—'}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Narrativa da Situação Clínica */}
                <div className="p-4 sm:p-5 rounded-2xl bg-warm-50/80 dark:bg-slate-800/90 border border-warm-200 dark:border-slate-700">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-warm-600 dark:text-teal-400 block mb-1.5">
                        Situação Clínica no Leito:
                    </span>
                    {isEditing ? (
                        <textarea
                            rows={3}
                            value={data.clinical_scenario || ''}
                            onChange={(e) => updateField('clinical_scenario', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Descreva detalhadamente a situação clínica e o sofrimento do paciente..."
                            className="w-full text-xs sm:text-sm text-warm-900 dark:text-slate-100 bg-white/70 dark:bg-slate-900/80 border border-dashed border-teal-500/60 rounded-xl p-2.5 outline-none resize-none font-sans leading-relaxed"
                            title="Clique para editar o cenário clínico diretamente"
                        />
                    ) : (
                        <p className="text-xs sm:text-sm text-warm-900 dark:text-slate-100 leading-relaxed font-sans">
                            {data.clinical_scenario || 'Cenário clínico a ser preenchido.'}
                        </p>
                    )}
                </div>
            </div>

            {/* Pergunta de Decisão */}
            <div className="mt-6 pt-5 border-t border-warm-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-primary dark:text-teal-400 font-bold text-xs sm:text-sm mb-3">
                    <HeartPulse size={18} className="text-primary dark:text-teal-400 shrink-0" />
                    {isEditing ? (
                        <input
                            type="text"
                            value={data.decision_prompt || ''}
                            onChange={(e) => updateField('decision_prompt', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Pergunta de conduta (Ex: Como enfermeiro(a), qual sua conduta prioritária?)"
                            className="w-full text-xs sm:text-sm font-bold text-primary dark:text-teal-400 bg-transparent border-b-2 border-dashed border-teal-500/50 hover:border-teal-500 outline-none py-0.5"
                            title="Clique para editar a pergunta diretamente"
                        />
                    ) : (
                        <h4>{data.decision_prompt || 'Qual a conduta de enfermagem prioritária?'}</h4>
                    )}
                </div>

                {/* Opções de Conduta */}
                <div className="space-y-2.5">
                    {data.decisions?.map((decision, idx) => {
                        const isSelectedOption = selectedDecisionId === decision.id;
                        
                        let borderStyle = 'border-warm-200 dark:border-slate-700 bg-warm-50/40 dark:bg-slate-800/40 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-slate-800';
                        if (isSelectedOption && !isSubmitted) {
                            borderStyle = 'border-teal-600 dark:border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 ring-2 ring-teal-500/20';
                        } else if (isSubmitted && isSelectedOption) {
                            if (decision.rating === 'optimal') {
                                borderStyle = 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20';
                            } else if (decision.rating === 'acceptable') {
                                borderStyle = 'border-amber-500 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/50 ring-2 ring-amber-500/20';
                            } else {
                                borderStyle = 'border-rose-500 dark:border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 ring-2 ring-rose-500/20';
                            }
                        }

                        return (
                            <div
                                key={decision.id || idx}
                                onClick={(e) => handleSelectOption(decision.id, e)}
                                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${borderStyle} ${isEditing ? '' : 'cursor-pointer'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
                                    isSelectedOption ? 'bg-primary text-white shadow-xs' : 'bg-warm-200 dark:bg-slate-700 text-warm-700 dark:text-slate-200'
                                }`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>

                                {isEditing ? (
                                    <div className="flex-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                        <textarea
                                            rows={2}
                                            value={decision.label || ''}
                                            onChange={(e) => updateDecision(decision.id, { label: e.target.value })}
                                            placeholder={`Descreva a conduta da opção ${String.fromCharCode(65 + idx)}...`}
                                            className="w-full text-xs sm:text-sm text-warm-900 dark:text-slate-100 bg-white/70 dark:bg-slate-900/80 border border-dashed border-teal-400/80 rounded-xl p-2 outline-none font-medium leading-relaxed resize-none"
                                            title="Clique para editar o texto desta opção diretamente"
                                        />
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-warm-200/50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-warm-500 dark:text-slate-400">Classificação:</span>
                                                <select
                                                    value={decision.rating || 'acceptable'}
                                                    onChange={(e) => updateDecision(decision.id, { rating: e.target.value as any })}
                                                    className="text-[11px] font-bold rounded-lg px-2 py-1 bg-white dark:bg-slate-900 border border-warm-300 dark:border-slate-700 text-warm-800 dark:text-slate-200 outline-none cursor-pointer"
                                                >
                                                    <option value="optimal">✨ Padrão-Ouro (Correta)</option>
                                                    <option value="acceptable">⚠️ Parcialmente Adequada</option>
                                                    <option value="inadequate">❌ Inadequada</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDecision(decision.id)}
                                                className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                title="Excluir esta opção de conduta"
                                            >
                                                Excluir Opção
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 text-xs sm:text-sm text-warm-800 dark:text-slate-200 leading-relaxed font-medium">
                                        {decision.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Botão de Adicionar Nova Opção no Modo de Edição */}
                    {isEditing && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); addDecision(); }}
                            className="w-full py-2.5 px-4 border-2 border-dashed border-teal-400/80 hover:border-teal-500 dark:border-teal-600/60 dark:hover:border-teal-500 rounded-2xl bg-teal-50/40 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.005]"
                        >
                            <Plus size={15} />
                            <span>Adicionar Nova Opção de Conduta ({String.fromCharCode(65 + (data.decisions?.length || 0))})</span>
                        </button>
                    )}
                </div>

                {/* Botão de Confirmação */}
                {!isSubmitted && (
                    <div className="mt-5 flex justify-end">
                        <button
                            type="button"
                            disabled={!selectedDecisionId && !isEditing}
                            onClick={(e) => handleConfirm(e)}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                        >
                            <span>Confirmar Conduta de Enfermagem</span>
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}

                {/* Desfecho Clínico Revelado */}
                {isSubmitted && activeDecision && (
                    <div className="mt-6 animate-scale-in">
                        <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-md space-y-3.5 ${
                            activeDecision.rating === 'optimal'
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                                : activeDecision.rating === 'acceptable'
                                ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                                : 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100'
                        }`}>
                            
                            {/* Header do Desfecho */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-300/40 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    {activeDecision.rating === 'optimal' && (
                                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                    {activeDecision.rating === 'acceptable' && (
                                        <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <AlertTriangle size={20} />
                                        </div>
                                    )}
                                    {activeDecision.rating === 'inadequate' && (
                                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <XCircle size={20} />
                                        </div>
                                    )}

                                    <div>
                                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            activeDecision.rating === 'optimal'
                                                ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200'
                                                : activeDecision.rating === 'acceptable'
                                                ? 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                                                : 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
                                        }`}>
                                            {activeDecision.rating === 'optimal' && '✨ Conduta Padrão-Ouro Recomendada'}
                                            {activeDecision.rating === 'acceptable' && '⚠️ Conduta Parcialmente Adequada'}
                                            {activeDecision.rating === 'inadequate' && '❌ Conduta Inadequada / Desfavorável'}
                                        </span>
                                        <h4 className="text-sm sm:text-base font-bold mt-1 text-warm-900 dark:text-slate-100">
                                            {activeDecision.outcome_title}
                                        </h4>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => handleReset(e)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-warm-50 dark:hover:bg-slate-700 text-warm-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-warm-300 dark:border-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
                                >
                                    <RotateCcw size={13} />
                                    <span>Simular Outra Conduta</span>
                                </button>
                            </div>

                            {/* Descrição do Desfecho */}
                            <div className="space-y-2.5">
                                <div>
                                    <strong className="text-[11px] uppercase tracking-wider font-bold text-warm-600 dark:text-slate-400 block mb-0.5">
                                        Evolução do Paciente:
                                    </strong>
                                    <p className="text-xs sm:text-sm text-warm-800 dark:text-slate-200 leading-relaxed">
                                        {activeDecision.outcome_description}
                                    </p>
                                </div>

                                {/* Justificativa Científica */}
                                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-warm-200/80 dark:border-slate-800 space-y-1">
                                    <div className="flex items-center gap-1.5 text-primary dark:text-teal-400 font-bold text-xs">
                                        <BookOpen size={13} />
                                        <span>Fundamentação Científica e Bioética:</span>
                                    </div>
                                    <p className="text-xs text-warm-700 dark:text-slate-300 leading-relaxed font-light">
                                        {activeDecision.scientific_rationale}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClinicalCaseBlock;
