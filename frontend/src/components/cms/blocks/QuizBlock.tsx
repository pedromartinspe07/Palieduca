import React, { useState, useEffect } from 'react';
import type { BlockProps } from './types';
import { CheckCircle2, XCircle, LayoutList, Sparkles, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getGuestId, getGuestQuizAnswersForBlock, saveGuestQuizAnswerLocal } from '../../../utils/guestStorage';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const QuizBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title = 'Quiz de Conhecimento', questions = [] } = block.data || {};
    const { user, token } = useAuth();
    const [selectedOpts, setSelectedOpts] = useState<Record<number, number | null>>({});
    const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

    // Carrega respostas persistidas ao montar o componente
    useEffect(() => {
        if (isEditing) return;

        // 1. Carrega primeiro do localStorage para resposta visual imediata
        const localAnswers = getGuestQuizAnswersForBlock(block.id);
        const initialOpts: Record<number, number | null> = {};
        const initialSubmits: Record<number, boolean> = {};

        for (const [qIdxStr, data] of Object.entries(localAnswers)) {
            const idx = parseInt(qIdxStr, 10);
            initialOpts[idx] = data.selectedOption;
            initialSubmits[idx] = data.submitted;
        }

        if (Object.keys(initialOpts).length > 0) {
            setSelectedOpts(initialOpts);
            setSubmitted(initialSubmits);
        }

        // 2. Sincroniza com o servidor (Aluno logado ou Visitante)
        if (token) {
            fetch(`${API_URL}/api/quiz/answers?block_id=${block.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const serverOpts: Record<number, number | null> = { ...initialOpts };
                    const serverSubmits: Record<number, boolean> = { ...initialSubmits };
                    data.forEach((item: any) => {
                        serverOpts[item.question_index] = item.selected_option;
                        serverSubmits[item.question_index] = true;
                    });
                    setSelectedOpts(serverOpts);
                    setSubmitted(serverSubmits);
                }
            })
            .catch(err => console.warn('Erro ao carregar respostas do quiz do aluno:', err));
        } else {
            const guestId = getGuestId();
            fetch(`${API_URL}/api/guest/quiz/answers?guest_id=${guestId}&block_id=${block.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const mergedOpts: Record<number, number | null> = { ...initialOpts };
                    const mergedSubmits: Record<number, boolean> = { ...initialSubmits };
                    data.forEach((item: any) => {
                        mergedOpts[item.question_index] = item.selected_option;
                        mergedSubmits[item.question_index] = true;
                        saveGuestQuizAnswerLocal(block.id, item.question_index, item.selected_option, item.is_correct);
                    });
                    setSelectedOpts(mergedOpts);
                    setSubmitted(mergedSubmits);
                }
            })
            .catch(err => console.warn('Erro ao carregar respostas do quiz do visitante:', err));
        }
    }, [block.id, isEditing, token]);

    const handleSelectOpt = (qIndex: number, oIndex: number) => {
        if (submitted[qIndex]) return;
        setSelectedOpts(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleSubmit = async (qIndex: number) => {
        const chosenOpt = selectedOpts[qIndex];
        if (chosenOpt === null || chosenOpt === undefined) return;

        const currentQ = questions[qIndex];
        const isCorrect = chosenOpt === (currentQ ? currentQ.correct_index : 0);

        setSubmitted(prev => ({ ...prev, [qIndex]: true }));

        if (token && user) {
            try {
                await fetch(`${API_URL}/api/quiz/answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        block_id: block.id,
                        question_index: qIndex,
                        selected_option: chosenOpt,
                        is_correct: isCorrect
                    })
                });
            } catch (err) {
                console.error('Erro ao salvar resposta de quiz do aluno:', err);
            }
        } else {
            // Salva no localStorage e no backend para visitantes (por IP e guest_id)
            saveGuestQuizAnswerLocal(block.id, qIndex, chosenOpt, isCorrect);
            try {
                await fetch(`${API_URL}/api/guest/quiz/answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        guest_id: getGuestId(),
                        block_id: block.id,
                        question_index: qIndex,
                        selected_option: chosenOpt,
                        is_correct: isCorrect
                    })
                });
            } catch (err) {
                console.error('Erro ao salvar resposta de quiz do visitante:', err);
            }
        }
    };

    const handleRetry = (qIndex: number) => {
        setSubmitted(prev => ({ ...prev, [qIndex]: false }));
    };

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full max-w-4xl mx-auto py-8 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-purple-400/50 hover:ring-inset rounded-xl'
            }`}
        >
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><LayoutList size={20}/></div>
                        <h3 
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => onUpdate(block.id, { data: { ...block.data, title: e.currentTarget.innerText } })}
                            className="font-bold text-warm-900 text-lg outline-none flex-1"
                        >
                            {title}
                        </h3>
                    </div>
                    {!user && !isEditing ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={12} className="text-sky-600" /> Modo Visitante
                        </span>
                    ) : (
                        !isEditing && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-emerald-600" /> Salvo no Perfil
                            </span>
                        )
                    )}
                </div>
                
                {!user && !isEditing && (
                    <div className="bg-sky-50/80 border-b border-sky-200/60 px-6 py-2.5 text-xs text-sky-950 flex items-center gap-2">
                        <span>💡 <strong>Respostas salvas no dispositivo:</strong> Você pode responder e praticar livremente. Ao criar sua conta gratuita, suas respostas serão vinculadas ao seu Certificado Oficial da UFPB.</span>
                    </div>
                )}
                
                <div className={`p-6 flex flex-col gap-8 ${isEditing ? 'pointer-events-none' : ''}`}>
                    {questions.length === 0 ? (
                        <p className="text-warm-500 text-center italic">Adicione perguntas através do painel lateral.</p>
                    ) : (
                        questions.map((q: any, i: number) => {
                            const selectedOpt = selectedOpts[i] ?? null;
                            const isSubmitted = submitted[i] || false;
                            const isCorrect = selectedOpt === q.correct_index;

                            return (
                                <div key={i} className="bg-warm-50 p-6 rounded-2xl border border-warm-100">
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <h4 className="font-bold text-warm-900 text-lg">{i + 1}. {q.text || 'Sem texto'}</h4>
                                        {isSubmitted && (
                                            <button
                                                onClick={() => handleRetry(i)}
                                                className="text-xs font-semibold text-warm-500 hover:text-purple-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                                                title="Tentar novamente esta questão"
                                            >
                                                <RotateCcw size={13} />
                                                <span>Refazer</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {(q.options || []).map((opt: string, oIndex: number) => {
                                            let btnClass = "text-left p-4 rounded-xl border transition-all cursor-pointer ";
                                            
                                            if (!isSubmitted) {
                                                btnClass += selectedOpt === oIndex 
                                                    ? "bg-purple-100 border-purple-400 text-purple-900 shadow-sm" 
                                                    : "bg-white border-warm-200 text-warm-700 hover:bg-warm-100";
                                            } else {
                                                if (oIndex === q.correct_index) {
                                                    btnClass += "bg-green-100 border-green-400 text-green-900 font-bold";
                                                } else if (oIndex === selectedOpt) {
                                                    btnClass += "bg-red-100 border-red-400 text-red-900";
                                                } else {
                                                    btnClass += "bg-white border-warm-200 text-warm-400 opacity-50";
                                                }
                                            }

                                            return (
                                                <button 
                                                    key={oIndex}
                                                    disabled={isSubmitted}
                                                    onClick={() => handleSelectOpt(i, oIndex)}
                                                    className={btnClass}
                                                >
                                                    <span className="font-bold mr-3">{['A', 'B', 'C', 'D'][oIndex]}.</span>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {!isSubmitted ? (
                                        <button 
                                            onClick={() => handleSubmit(i)}
                                            disabled={selectedOpt === null}
                                            className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            Confirmar Resposta
                                        </button>
                                    ) : (
                                        <div className={`mt-6 p-4 rounded-xl flex items-center justify-between gap-3 font-bold ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            <div className="flex items-center gap-3">
                                                {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                                <span>{isCorrect ? 'Você acertou! Muito bem.' : 'Resposta incorreta. Revise o conteúdo e tente novamente.'}</span>
                                            </div>
                                            <span className="text-[11px] font-normal text-warm-500 hidden sm:inline">
                                                Salvo no dispositivo
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow z-20">
                    Quiz Interativo
                </div>
            )}
        </div>
    );
};

export default QuizBlock;

