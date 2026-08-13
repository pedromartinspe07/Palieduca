import React, { useState } from 'react';
import type { BlockProps } from './types';
import { CheckCircle2, XCircle, LayoutList } from 'lucide-react';

const QuizBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title = 'Quiz de Conhecimento', questions = [] } = block.data || {};
    const [selectedOpts, setSelectedOpts] = useState<Record<number, number | null>>({});
    const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

    const handleSelectOpt = (qIndex: number, oIndex: number) => {
        if (submitted[qIndex]) return;
        setSelectedOpts(prev => ({ ...prev, [qIndex]: oIndex }));
    };

    const handleSubmit = (qIndex: number) => {
        setSubmitted(prev => ({ ...prev, [qIndex]: true }));
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
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center gap-3">
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
                                    <h4 className="font-bold text-warm-900 mb-4 text-lg">{i + 1}. {q.text || 'Sem texto'}</h4>
                                    <div className="flex flex-col gap-3">
                                        {(q.options || []).map((opt: string, oIndex: number) => {
                                            let btnClass = "text-left p-4 rounded-xl border transition-all ";
                                            
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
                                            className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirmar Resposta
                                        </button>
                                    ) : (
                                        <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 font-bold ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                            {isCorrect ? 'Você acertou! Muito bem.' : 'Resposta incorreta. Revise o conteúdo e tente novamente.'}
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
