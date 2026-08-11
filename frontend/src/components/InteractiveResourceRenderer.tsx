import React, { useState } from 'react';
import { Play, LayoutList, Layers, CheckCircle2, XCircle } from 'lucide-react';

interface Resource {
    id: number;
    module_slug: string;
    type: string;
    title: string;
    content_json: string;
}

export const InteractiveResourceRenderer: React.FC<{ resource: Resource }> = ({ resource }) => {
    let content: any = {};
    try {
        content = JSON.parse(resource.content_json);
    } catch {
        return <div className="p-4 bg-red-50 text-red-500 rounded-xl">Erro ao carregar recurso interativo.</div>;
    }

    if (resource.type === 'video') {
        // Extract YouTube ID if possible
        let embedUrl = content.url;
        const ytMatch = embedUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
        if (ytMatch && ytMatch[1]) {
            embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        return (
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm my-8">
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Play size={20}/></div>
                    <h3 className="font-bold text-warm-900 text-lg">{resource.title}</h3>
                </div>
                <div className="aspect-video w-full bg-black">
                    <iframe 
                        src={embedUrl} 
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        );
    }

    if (resource.type === 'quiz') {
        const questions = content.questions || [];
        return (
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm my-8">
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><LayoutList size={20}/></div>
                    <h3 className="font-bold text-warm-900 text-lg">{resource.title}</h3>
                </div>
                <div className="p-6 flex flex-col gap-8">
                    {questions.map((q: any, i: number) => (
                        <QuizQuestion key={i} question={q} index={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (resource.type === 'flashcard') {
        const cards = content.cards || [];
        return (
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm my-8">
                <div className="p-4 border-b border-warm-100 bg-warm-50 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Layers size={20}/></div>
                    <h3 className="font-bold text-warm-900 text-lg">{resource.title}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((c: any, i: number) => (
                        <Flashcard key={i} front={c.front} back={c.back} />
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

// Componente Interno para lidar com o estado de 1 Pergunta do Quiz
const QuizQuestion: React.FC<{ question: any, index: number }> = ({ question, index }) => {
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isCorrect = selectedOpt === question.correct_index;

    return (
        <div className="bg-warm-50 p-6 rounded-2xl border border-warm-100">
            <h4 className="font-bold text-warm-900 mb-4 text-lg">{index + 1}. {question.text}</h4>
            <div className="flex flex-col gap-3">
                {question.options.map((opt: string, oIndex: number) => {
                    let btnClass = "text-left p-4 rounded-xl border transition-all ";
                    
                    if (!isSubmitted) {
                        btnClass += selectedOpt === oIndex 
                            ? "bg-purple-100 border-purple-400 text-purple-900 shadow-sm" 
                            : "bg-white border-warm-200 text-warm-700 hover:bg-warm-100";
                    } else {
                        if (oIndex === question.correct_index) {
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
                            onClick={() => setSelectedOpt(oIndex)}
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
                    onClick={() => setIsSubmitted(true)}
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
};

// Componente Interno para o Flashcard
const Flashcard: React.FC<{ front: string, back: string }> = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div 
            onClick={() => setFlipped(!flipped)}
            className="relative h-48 w-full perspective-1000 cursor-pointer group"
        >
            <div className={`absolute inset-0 w-full h-full transition-all duration-500 transform-style-preserve-3d rounded-2xl shadow-md ${flipped ? 'rotate-y-180' : ''}`}>
                
                {/* Frente */}
                <div className="absolute inset-0 w-full h-full bg-orange-50 border border-orange-200 rounded-2xl backface-hidden flex items-center justify-center p-6 text-center text-orange-900 font-bold text-lg">
                    {front}
                    <div className="absolute bottom-3 text-xs text-orange-400 font-normal uppercase tracking-widest">Clique para virar</div>
                </div>

                {/* Verso */}
                <div className="absolute inset-0 w-full h-full bg-primary text-white rounded-2xl backface-hidden rotate-y-180 flex items-center justify-center p-6 text-center text-sm md:text-base leading-relaxed">
                    {back}
                </div>

            </div>
        </div>
    );
};
