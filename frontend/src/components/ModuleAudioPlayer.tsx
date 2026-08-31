import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, 
    Pause, 
    Square, 
    Headphones
} from 'lucide-react';

interface ModuleAudioPlayerProps {
    blocks: any[];
    moduleTitle?: string;
}

const ModuleAudioPlayer: React.FC<ModuleAudioPlayerProps> = ({ blocks, moduleTitle }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [rate, setRate] = useState<number>(1.0);
    const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(0);
    const [paragraphs, setParagraphs] = useState<string[]>([]);
    const [isSupported, setIsSupported] = useState<boolean>(true);

    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Carrega e seleciona a melhor voz feminina em português brasileiro
    const loadVoices = () => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices();

        // Palavras-chave de vozes femininas em pt-BR (Google, Edge, iOS Siri, Android, Samsung, Windows)
        const femaleKeywords = [
            'francisca', 'thalita', 'luciana', 'vitória', 'vitoria', 'letícia', 'leticia',
            'maria', 'camila', 'helena', 'raquel', 'fernanda', 'joana', 'female', 'mulher',
            'wavenet-a', 'wavenet-c', 'standard-a', 'standard-c', 'natural', 'pt-br-x-yif'
        ];

        const ptVoices = voices.filter(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
        
        // 1. Tenta voz explicitamente feminina em pt-BR
        const specificFemale = ptVoices.find(v => {
            const name = v.name.toLowerCase();
            return femaleKeywords.some(kw => name.includes(kw));
        });

        if (specificFemale) {
            setSelectedVoice(specificFemale);
            return;
        }

        // 2. Tenta Google Português do Brasil (geralmente feminina suave)
        const googlePt = ptVoices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('brasil'));
        if (googlePt) {
            setSelectedVoice(googlePt);
            return;
        }

        // 3. Qualquer voz em pt-BR
        const defaultPt = ptVoices.find(v => v.lang === 'pt-BR') || ptVoices[0] || null;
        setSelectedVoice(defaultPt);
    };

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            setIsSupported(false);
            return;
        }

        synthRef.current = window.speechSynthesis;
        loadVoices();

        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }
    }, []);

    // Extrai o texto limpo de todos os blocos do módulo
    useEffect(() => {
        const extracted: string[] = [];
        if (moduleTitle) {
            extracted.push(`Aula do módulo: ${moduleTitle}.`);
        }

        blocks.forEach((b) => {
            if (b.type === 'TextBlock' && b.data?.content) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = b.data.content;
                const text = tempDiv.textContent || tempDiv.innerText || '';
                if (text.trim()) extracted.push(text.trim());
            } else if (b.type === 'ClinicalCaseBlock') {
                const caseData = b.data;
                let caseText = `Caso Clínico: ${caseData.patient_name || 'Paciente'}. `;
                if (caseData.diagnosis) caseText += `Diagnóstico: ${caseData.diagnosis}. `;
                if (caseData.clinical_scenario) caseText += `Cenário no leito: ${caseData.clinical_scenario}. `;
                if (caseData.decision_prompt) caseText += `Pergunta para tomada de decisão: ${caseData.decision_prompt}`;
                extracted.push(caseText);
            } else if (b.type === 'QuizBlock' && b.data?.question) {
                extracted.push(`Questão avaliativa: ${b.data.question}`);
            } else if (b.type === 'HeroBlock' && (b.data?.title || b.data?.subtitle)) {
                extracted.push(`${b.data.title || ''}. ${b.data.subtitle || ''}`.trim());
            } else if (b.type === 'FeatureCardsBlock' && Array.isArray(b.data?.cards)) {
                b.data.cards.forEach((c: any) => {
                    if (c.title || c.description) {
                        extracted.push(`${c.title || ''}: ${c.description || ''}`.trim());
                    }
                });
            }
        });

        setParagraphs(extracted);

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, [blocks, moduleTitle]);

    const playParagraph = (index: number, customRate?: number) => {
        if (!synthRef.current || index >= paragraphs.length) {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentParagraphIndex(0);
            return;
        }

        synthRef.current.cancel();

        const currentText = paragraphs[index];
        const utterance = new SpeechSynthesisUtterance(currentText);
        utterance.lang = 'pt-BR';
        utterance.rate = customRate || rate;
        utterance.pitch = 1.08; // Tom ligeiramente elevado e acolhedor (voz feminina humanizada)

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
            if (index + 1 < paragraphs.length) {
                setCurrentParagraphIndex(index + 1);
                playParagraph(index + 1, customRate || rate);
            } else {
                setIsPlaying(false);
                setIsPaused(false);
                setCurrentParagraphIndex(0);
            }
        };

        utterance.onerror = (e) => {
            console.error('Erro na síntese de voz:', e);
            setIsPlaying(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
        setCurrentParagraphIndex(index);
        setIsPlaying(true);
        setIsPaused(false);
    };

    const handleTogglePlay = () => {
        if (!synthRef.current) return;

        if (isPlaying && !isPaused) {
            synthRef.current.pause();
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            synthRef.current.resume();
            setIsPaused(false);
        } else {
            playParagraph(currentParagraphIndex);
        }
    };

    const handleStop = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentParagraphIndex(0);
    };

    const handleRateChange = () => {
        const rates = [1.0, 1.25, 1.5, 1.75];
        const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
        const newRate = rates[nextIdx];
        setRate(newRate);
        if (isPlaying && !isPaused) {
            playParagraph(currentParagraphIndex, newRate);
        }
    };

    if (!isSupported || paragraphs.length === 0) return null;

    return (
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-warm-900 to-teal-950 text-white shadow-xl border border-teal-700/40 relative overflow-hidden animate-fade-in">
            {/* Efeito sutil de ondas acústicas no fundo */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-4">
                <Headphones size={140} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                {/* Título e Indicador de Leitura */}
                <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                        isPlaying && !isPaused 
                            ? 'bg-teal-500 text-white border-teal-300 shadow-md animate-pulse' 
                            : 'bg-white/10 text-teal-300 border-white/10'
                    }`}>
                        <Headphones size={22} />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">
                                Leitor de Voz &bull; Acessibilidade
                            </span>
                            <span className="text-[10px] font-semibold text-pink-200 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-400/30">
                                🎙️ Voz Feminina (Prof.ª Patrícia / IA)
                            </span>
                            {isPlaying && !isPaused && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    Narrando
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                            {isPlaying ? `Ouvindo Aula (Trecho ${currentParagraphIndex + 1} de ${paragraphs.length})` : 'Ouvir Aula em Áudio'}
                        </h4>
                    </div>
                </div>

                {/* Controles de Reprodução */}
                <div className="flex items-center gap-2">
                    {/* Botão Play / Pause */}
                    <button
                        type="button"
                        onClick={handleTogglePlay}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                            isPlaying && !isPaused
                                ? 'bg-amber-500 hover:bg-amber-600 text-amber-950'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                        title={isPlaying && !isPaused ? 'Pausar Áudio' : 'Ouvir Aula'}
                    >
                        {isPlaying && !isPaused ? <Pause size={15} /> : <Play size={15} />}
                        <span>{isPlaying && !isPaused ? 'Pausar' : isPaused ? 'Continuar' : 'Ouvir Aula'}</span>
                    </button>

                    {/* Botão Parar */}
                    {isPlaying && (
                        <button
                            type="button"
                            onClick={handleStop}
                            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors cursor-pointer"
                            title="Parar Reprodução"
                        >
                            <Square size={14} />
                        </button>
                    )}

                    {/* Velocidade de Reprodução */}
                    <button
                        type="button"
                        onClick={handleRateChange}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-teal-200 font-bold text-xs rounded-2xl border border-white/10 transition-colors cursor-pointer"
                        title="Velocidade da voz"
                    >
                        {rate}x
                    </button>
                </div>
            </div>

            {/* Barra de Progresso do Áudio */}
            {isPlaying && (
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 text-[11px] text-teal-200">
                    <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${((currentParagraphIndex + 1) / paragraphs.length) * 100}%` }}
                        />
                    </div>
                    <span className="font-mono text-[10px]">
                        {Math.round(((currentParagraphIndex + 1) / paragraphs.length) * 100)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default ModuleAudioPlayer;
