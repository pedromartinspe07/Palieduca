import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, 
    Pause, 
    Square, 
    Headphones,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Sparkles,
    Sliders,
    Radio,
    Volume1
} from 'lucide-react';

interface ModuleAudioPlayerProps {
    blocks: any[];
    moduleTitle?: string;
}

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

// Divide textos em sentenças e trechos de áudio ideais para TTS (max ~140 caracteres)
function splitTextIntoAudioChunks(text: string, maxChunkLength = 140): string[] {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return [];
    if (clean.length <= maxChunkLength) return [clean];

    // Divide por pontuação mantendo a pontuação
    const sentences = clean.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [clean];
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
        const trimmed = s.trim();
        if (!trimmed) continue;
        
        if ((current ? current + ' ' + trimmed : trimmed).length <= maxChunkLength) {
            current = current ? current + ' ' + trimmed : trimmed;
        } else {
            if (current) chunks.push(current);
            if (trimmed.length <= maxChunkLength) {
                current = trimmed;
            } else {
                // Sentença longa: divide por palavras
                const words = trimmed.split(' ');
                let subChunk = '';
                for (const w of words) {
                    if ((subChunk ? subChunk + ' ' + w : w).length <= maxChunkLength) {
                        subChunk = subChunk ? subChunk + ' ' + w : w;
                    } else {
                        if (subChunk) chunks.push(subChunk);
                        subChunk = w;
                    }
                }
                current = subChunk;
            }
        }
    }
    if (current) chunks.push(current);
    return chunks.filter(c => c.length > 0);
}

const ModuleAudioPlayer: React.FC<ModuleAudioPlayerProps> = ({ blocks, moduleTitle }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [rate, setRate] = useState<number>(1.0);
    const [volume, setVolume] = useState<number>(1.0);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
    const [chunks, setChunks] = useState<string[]>([]);
    const [engine, setEngine] = useState<'natural' | 'system'>('natural'); // 'natural' = HD Streaming Audio, 'system' = Web Speech API
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const isPlayingRef = useRef<boolean>(false);
    isPlayingRef.current = isPlaying;
    const isPausedRef = useRef<boolean>(false);
    isPausedRef.current = isPaused;
    const currentChunkIndexRef = useRef<number>(0);
    currentChunkIndexRef.current = currentChunkIndex;
    const chunksRef = useRef<string[]>([]);
    chunksRef.current = chunks;
    const rateRef = useRef<number>(1.0);
    rateRef.current = rate;
    const volumeRef = useRef<number>(1.0);
    volumeRef.current = volume;
    const isMutedRef = useRef<boolean>(false);
    isMutedRef.current = isMuted;
    const engineRef = useRef<'natural' | 'system'>('natural');
    engineRef.current = engine;

    // Inicializa sintetizador do navegador e lista de vozes
    const initSystemVoices = useCallback(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        synthRef.current = window.speechSynthesis;
        const voices = synthRef.current.getVoices() || [];
        setAvailableVoices(voices);

        const femaleKeywords = [
            'francisca', 'thalita', 'luciana', 'vitória', 'vitoria', 'letícia', 'leticia',
            'maria', 'camila', 'helena', 'raquel', 'fernanda', 'joana', 'female', 'mulher',
            'wavenet', 'natural', 'pt-br'
        ];
        const ptVoices = voices.filter(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
        const specificFemale = ptVoices.find(v => {
            const name = v.name.toLowerCase();
            return femaleKeywords.some(kw => name.includes(kw));
        });
        const defaultPt = specificFemale || ptVoices.find(v => v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('brazil') || v.name.toLowerCase().includes('brasil')) || ptVoices[0] || voices[0] || null;
        setSelectedVoice(defaultPt);
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            initSystemVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = initSystemVoices;
            }
        }
    }, [initSystemVoices]);

    // Extrai o texto limpo e detalhado de todos os blocos do módulo
    useEffect(() => {
        const rawTexts: string[] = [];
        if (moduleTitle) {
            rawTexts.push(`Módulo: ${moduleTitle}.`);
        }

        blocks.forEach((b) => {
            if (!b) return;
            const type = b.type || '';
            const data = b.data || {};

            if (type === 'TextBlock') {
                if (data.title) rawTexts.push(data.title);
                if (data.content) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data.content;
                    const text = tempDiv.textContent || tempDiv.innerText || '';
                    if (text.trim()) rawTexts.push(text.trim());
                }
            } else if (type === 'ClinicalCaseBlock') {
                rawTexts.push(`Atividade de Caso Clínico.`);
                if (data.patient_name) rawTexts.push(`Paciente: ${data.patient_name}.`);
                if (data.diagnosis) rawTexts.push(`Diagnóstico: ${data.diagnosis}.`);
                if (data.clinical_scenario) rawTexts.push(`Cenário Clínico: ${data.clinical_scenario}`);
                if (data.decision_prompt) rawTexts.push(`Pergunta de decisão: ${data.decision_prompt}`);
                if (Array.isArray(data.decisions)) {
                    data.decisions.forEach((d: any, dIdx: number) => {
                        if (d.label) rawTexts.push(`Conduta ${dIdx + 1}: ${d.label}`);
                    });
                }
            } else if (type === 'QuizBlock' || type === 'quiz') {
                rawTexts.push(`Atividade Avaliativa Quiz.`);
                if (data.title) rawTexts.push(data.title);
                if (Array.isArray(data.questions)) {
                    data.questions.forEach((q: any, qIdx: number) => {
                        if (q.text) rawTexts.push(`Questão ${qIdx + 1}: ${q.text}`);
                        if (Array.isArray(q.options)) {
                            q.options.forEach((opt: string, oIdx: number) => {
                                rawTexts.push(`Opção ${String.fromCharCode(65 + oIdx)}: ${opt}`);
                            });
                        }
                    });
                } else if (data.question) {
                    rawTexts.push(`Questão: ${data.question}`);
                    if (Array.isArray(data.options)) {
                        data.options.forEach((opt: string, oIdx: number) => {
                            rawTexts.push(`Opção ${String.fromCharCode(65 + oIdx)}: ${opt}`);
                        });
                    }
                }
            } else if (type === 'FlashcardBlock') {
                rawTexts.push(`Cartões de Memorização.`);
                if (Array.isArray(data.cards)) {
                    data.cards.forEach((c: any, cIdx: number) => {
                        if (c.front) rawTexts.push(`Cartão ${cIdx + 1}. Conceito: ${c.front}.`);
                        if (c.back) rawTexts.push(`Significado: ${c.back}.`);
                    });
                }
            } else if (type === 'HeroBlock') {
                if (data.title) rawTexts.push(data.title);
                if (data.subtitle) rawTexts.push(data.subtitle);
                if (data.description) rawTexts.push(data.description);
            } else if (type === 'FeatureCardsBlock' && Array.isArray(data.cards)) {
                data.cards.forEach((c: any) => {
                    if (c.title || c.description) {
                        rawTexts.push(`${c.title || ''}: ${c.description || ''}`.trim());
                    }
                });
            } else if (type === 'GlossaryBlock' && Array.isArray(data.terms)) {
                data.terms.forEach((t: any) => {
                    if (t.term || t.definition) {
                        rawTexts.push(`Termo ${t.term}: ${t.definition}`);
                    }
                });
            } else if (type === 'LibraryBlock' && Array.isArray(data.items)) {
                data.items.forEach((item: any) => {
                    if (item.title) rawTexts.push(`Referência: ${item.title}. ${item.author || ''}`);
                });
            } else if (type === 'MediaBlock') {
                if (data.title) rawTexts.push(data.title);
                if (data.caption) rawTexts.push(data.caption);
                if (data.transcript) rawTexts.push(data.transcript);
            }
        });

        // Converte os textos brutos em pequenos trechos fluidos
        const allChunks: string[] = [];
        rawTexts.forEach(t => {
            const split = splitTextIntoAudioChunks(t, 140);
            allChunks.push(...split);
        });

        setChunks(allChunks);
        chunksRef.current = allChunks;

        return () => {
            stopAudio();
        };
    }, [blocks, moduleTitle]);

    // Parar todas as fontes de áudio
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        if (synthRef.current) {
            try {
                synthRef.current.cancel();
            } catch (e) {
                // Ignore cancel errors
            }
        }
        (window as any).__palieduca_utterance = null;
        setIsPlaying(false);
        setIsPaused(false);
        setIsTestingAudio(false);
    };

    // Reprodução via Áudio Natural HD Streaming (Backend Proxy com voz pt-BR)
    const playNaturalChunk = (index: number) => {
        if (index >= chunksRef.current.length) {
            stopAudio();
            setCurrentChunkIndex(0);
            return;
        }

        const textToRead = chunksRef.current[index];
        if (!textToRead || !textToRead.trim()) {
            playNextChunk(index + 1);
            return;
        }

        setCurrentChunkIndex(index);
        setIsPlaying(true);
        setIsPaused(false);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        const encoded = encodeURIComponent(textToRead.trim());
        const ttsUrl = `${API_URL}/api/tts?text=${encoded}&lang=pt-BR`;

        const audio = new Audio();
        audio.src = ttsUrl;
        audio.playbackRate = rateRef.current;
        audio.volume = isMutedRef.current ? 0 : volumeRef.current;
        audioRef.current = audio;

        audio.onended = () => {
            if (index + 1 < chunksRef.current.length) {
                playNaturalChunk(index + 1);
            } else {
                stopAudio();
                setCurrentChunkIndex(0);
            }
        };

        audio.onerror = (e) => {
            console.warn('Erro ao carregar stream TTS do backend, tentando Web Speech:', e);
            playSystemChunk(index);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('Falha no autoplay ou decodificação do áudio natural:', err);
                playSystemChunk(index);
            });
        }
    };

    // Reprodução via Web Speech API do Navegador
    const playSystemChunk = (index: number) => {
        if (!synthRef.current || index >= chunksRef.current.length) {
            stopAudio();
            setCurrentChunkIndex(0);
            return;
        }

        const textToRead = chunksRef.current[index];
        if (!textToRead || !textToRead.trim()) {
            playNextChunk(index + 1);
            return;
        }

        try {
            synthRef.current.cancel();
            if (synthRef.current.paused) {
                synthRef.current.resume();
            }
        } catch (e) {
            // Ignore
        }

        setCurrentChunkIndex(index);
        setIsPlaying(true);
        setIsPaused(false);

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        utterance.rate = rateRef.current;
        utterance.pitch = 1.05;
        utterance.volume = isMutedRef.current ? 0 : volumeRef.current;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
            if (index + 1 < chunksRef.current.length) {
                playSystemChunk(index + 1);
            } else {
                stopAudio();
                setCurrentChunkIndex(0);
            }
        };

        utterance.onerror = (e) => {
            console.error('Erro no sintetizador do sistema:', e);
            if (engineRef.current === 'system') {
                playNaturalChunk(index);
            } else {
                stopAudio();
            }
        };

        // Salva referência global para prevenir bug de Garbage Collection no Chromium/Linux
        (window as any).__palieduca_utterance = utterance;
        utteranceRef.current = utterance;

        synthRef.current.speak(utterance);
    };

    const playNextChunk = (nextIdx: number) => {
        if (engineRef.current === 'natural') {
            playNaturalChunk(nextIdx);
        } else {
            playSystemChunk(nextIdx);
        }
    };

    const handlePlayFromIndex = (idx: number) => {
        const targetIndex = Math.max(0, Math.min(idx, chunks.length - 1));
        if (engine === 'natural') {
            playNaturalChunk(targetIndex);
        } else {
            playSystemChunk(targetIndex);
        }
    };

    const handleTogglePlay = () => {
        if (isPlaying && !isPaused) {
            // Pausar
            if (engine === 'natural' && audioRef.current) {
                audioRef.current.pause();
            } else if (synthRef.current) {
                synthRef.current.pause();
            }
            setIsPaused(true);
        } else if (isPlaying && isPaused) {
            // Continuar
            if (engine === 'natural' && audioRef.current) {
                audioRef.current.play().catch(() => playNaturalChunk(currentChunkIndex));
            } else if (synthRef.current) {
                synthRef.current.resume();
            }
            setIsPaused(false);
        } else {
            // Iniciar do início ou trecho atual
            handlePlayFromIndex(currentChunkIndex);
        }
    };

    const handleStop = () => {
        stopAudio();
        setCurrentChunkIndex(0);
    };

    const handlePreviousChunk = () => {
        const prev = Math.max(0, currentChunkIndex - 1);
        handlePlayFromIndex(prev);
    };

    const handleNextChunk = () => {
        const next = Math.min(chunks.length - 1, currentChunkIndex + 1);
        handlePlayFromIndex(next);
    };

    const handleRateChange = () => {
        const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
        const nextIdx = (rates.indexOf(rate) + 1) % rates.length;
        const newRate = rates[nextIdx];
        setRate(newRate);
        rateRef.current = newRate;

        if (isPlaying && !isPaused) {
            if (engine === 'natural' && audioRef.current) {
                audioRef.current.playbackRate = newRate;
            } else if (engine === 'system') {
                playSystemChunk(currentChunkIndex);
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        volumeRef.current = newVol;
        if (newVol > 0 && isMuted) {
            setIsMuted(false);
            isMutedRef.current = false;
        }
        if (audioRef.current) {
            audioRef.current.volume = newVol;
        }
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        isMutedRef.current = nextMuted;
        if (audioRef.current) {
            audioRef.current.volume = nextMuted ? 0 : volume;
        }
    };

    const switchEngine = (newEngine: 'natural' | 'system') => {
        setEngine(newEngine);
        engineRef.current = newEngine;
        if (isPlaying) {
            if (newEngine === 'natural') {
                if (synthRef.current) synthRef.current.cancel();
                playNaturalChunk(currentChunkIndex);
            } else {
                if (audioRef.current) audioRef.current.pause();
                playSystemChunk(currentChunkIndex);
            }
        }
    };

    // Teste de som imediato com frase curta
    const handleTestAudio = () => {
        stopAudio();
        setIsTestingAudio(true);
        const testText = "Olá! O leitor de voz do Palieduca está funcionando com áudio natural em alta definição.";
        const encoded = encodeURIComponent(testText);
        const ttsUrl = `${API_URL}/api/tts?text=${encoded}&lang=pt-BR`;
        const audio = new Audio();
        audio.src = ttsUrl;
        audio.volume = isMuted ? 0 : volume;
        audioRef.current = audio;
        audio.onended = () => {
            setIsTestingAudio(false);
        };
        audio.onerror = () => {
            setIsTestingAudio(false);
        };
        audio.play().catch(() => setIsTestingAudio(false));
    };

    if (chunks.length === 0) return null;

    const progressPercentage = Math.round(((currentChunkIndex + 1) / chunks.length) * 100);
    const activeText = chunks[currentChunkIndex] || '';

    return (
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-teal-950 via-warm-900 to-teal-900 text-white shadow-2xl border border-teal-600/40 relative overflow-hidden transition-all duration-300">
            {/* Efeito visual acústico decorativo */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-6">
                <Headphones size={180} />
            </div>

            <div className="p-4 sm:p-6 relative z-10">
                {/* Cabeçalho do Leitor */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Identificação e Status */}
                    <div className="flex items-center gap-3.5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                            isPlaying && !isPaused 
                                ? 'bg-teal-500 text-white border-teal-300 shadow-[0_0_25px_rgba(20,184,166,0.7)] animate-pulse' 
                                : 'bg-white/10 text-teal-300 border-white/10'
                        }`}>
                            <Headphones size={24} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30 shadow-xs">
                                    Acessibilidade &bull; Áudio Narrado
                                </span>
                                
                                {engine === 'natural' ? (
                                    <span className="text-[10px] font-bold text-pink-200 bg-pink-500/20 px-2.5 py-0.5 rounded-full border border-pink-400/30 flex items-center gap-1">
                                        <Sparkles size={11} className="text-pink-300" />
                                        Voz Natural HD (Prof.ª Patrícia / IA)
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-sky-200 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-400/30 flex items-center gap-1">
                                        <Radio size={11} className="text-sky-300" />
                                        Voz do Sistema ({selectedVoice?.name.slice(0, 16) || 'Local'})
                                    </span>
                                )}

                                {(isPlaying && !isPaused) || isTestingAudio ? (
                                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                                        {/* Barras de equalizador animadas */}
                                        <span className="flex items-end gap-0.5 h-3">
                                            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-2" />
                                            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3" />
                                            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-1.5" />
                                        </span>
                                        {isTestingAudio ? 'Testando Som...' : 'Reproduzindo Áudio'}
                                    </span>
                                ) : null}
                            </div>

                            <h4 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                                {isPlaying 
                                    ? `Ouvindo Aula (Trecho ${currentChunkIndex + 1} de ${chunks.length})` 
                                    : 'Ouvir Aula Completa em Áudio'}
                            </h4>
                        </div>
                    </div>

                    {/* Controles Principais */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Voltar Trecho */}
                        {isPlaying && (
                            <button
                                type="button"
                                onClick={handlePreviousChunk}
                                disabled={currentChunkIndex === 0}
                                className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl transition-colors cursor-pointer border border-white/10"
                                title="Trecho Anterior"
                            >
                                <SkipBack size={15} />
                            </button>
                        )}

                        {/* Botão Play / Pause Principal */}
                        <button
                            type="button"
                            onClick={handleTogglePlay}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all duration-200 cursor-pointer ${
                                isPlaying && !isPaused
                                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-amber-500/30 hover:scale-105 active:scale-95'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30 hover:scale-105 active:scale-95'
                            }`}
                            title={isPlaying && !isPaused ? 'Pausar Áudio' : isPaused ? 'Continuar Reprodução' : 'Começar a Ouvir a Aula'}
                        >
                            {isPlaying && !isPaused ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                            <span className="text-sm">{isPlaying && !isPaused ? 'Pausar' : isPaused ? 'Continuar' : 'Ouvir Aula'}</span>
                        </button>

                        {/* Avançar Trecho */}
                        {isPlaying && (
                            <button
                                type="button"
                                onClick={handleNextChunk}
                                disabled={currentChunkIndex >= chunks.length - 1}
                                className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl transition-colors cursor-pointer border border-white/10"
                                title="Próximo Trecho"
                            >
                                <SkipForward size={15} />
                            </button>
                        )}

                        {/* Botão Parar */}
                        {isPlaying && (
                            <button
                                type="button"
                                onClick={handleStop}
                                className="p-2.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 hover:text-white rounded-2xl transition-colors cursor-pointer border border-rose-400/30"
                                title="Parar Áudio"
                            >
                                <Square size={15} fill="currentColor" />
                            </button>
                        )}

                        {/* Velocidade de Reprodução */}
                        <button
                            type="button"
                            onClick={handleRateChange}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-teal-200 font-bold text-xs rounded-2xl border border-white/10 transition-colors cursor-pointer shadow-xs"
                            title="Alterar Velocidade da Voz"
                        >
                            {rate}x
                        </button>

                        {/* Abrir Ajustes de Voz & Volume */}
                        <button
                            type="button"
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                                showSettings 
                                    ? 'bg-teal-500 text-white border-teal-300' 
                                    : 'bg-white/10 hover:bg-white/20 text-teal-200 border-white/10'
                            }`}
                            title="Configurações de Voz, Teste de Som e Volume"
                        >
                            <Sliders size={16} />
                        </button>
                    </div>
                </div>

                {/* Painel Expansível de Configurações de Áudio */}
                {showSettings && (
                    <div className="mt-4 p-4 rounded-2xl bg-black/30 border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in text-xs">
                        {/* Seletor de Motor de Voz */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-teal-300 font-bold">Tipo de Voz:</span>
                            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
                                <button
                                    type="button"
                                    onClick={() => switchEngine('natural')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                        engine === 'natural'
                                            ? 'bg-teal-500 text-white shadow-xs'
                                            : 'text-warm-200 hover:text-white'
                                    }`}
                                >
                                    ✨ Voz Natural HD (Recomendada)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchEngine('system')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                        engine === 'system'
                                            ? 'bg-teal-500 text-white shadow-xs'
                                            : 'text-warm-200 hover:text-white'
                                    }`}
                                >
                                    💻 Voz do Sistema
                                </button>
                            </div>

                            {/* Seletor de vozes do sistema se disponível */}
                            {engine === 'system' && availableVoices.length > 0 && (
                                <select
                                    value={selectedVoice?.name || ''}
                                    onChange={(e) => {
                                        const v = availableVoices.find(item => item.name === e.target.value);
                                        if (v) setSelectedVoice(v);
                                    }}
                                    className="bg-slate-900 text-white px-2.5 py-1.5 rounded-xl border border-teal-500/30 text-xs"
                                >
                                    {availableVoices.map((v, i) => (
                                        <option key={i} value={v.name}>
                                            {v.name} ({v.lang})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Controle de Volume e Teste de Som */}
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Botão de Testar Som */}
                            <button
                                type="button"
                                onClick={handleTestAudio}
                                disabled={isTestingAudio}
                                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-teal-400/40"
                                title="Reproduzir uma frase curta para testar a saída de som"
                            >
                                <Volume1 size={14} />
                                <span>{isTestingAudio ? 'Testando Som...' : 'Testar Áudio'}</span>
                            </button>

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="text-teal-300 hover:text-white transition-colors cursor-pointer"
                                    title={isMuted ? 'Desmutar' : 'Mutar'}
                                >
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 sm:w-28 accent-teal-400 cursor-pointer"
                                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                                />
                                <span className="font-mono text-teal-200 w-8 text-right">
                                    {Math.round((isMuted ? 0 : volume) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subtítulo / Legenda em Tempo Real do Texto Sendo Narrado */}
                {isPlaying && activeText && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-teal-900/60 border border-teal-500/30 backdrop-blur-sm animate-fade-in flex items-start gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/30 text-teal-200 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                            {currentChunkIndex + 1}/{chunks.length}
                        </span>
                        <p className="text-xs sm:text-sm text-teal-50 font-medium leading-relaxed italic">
                            "{activeText}"
                        </p>
                    </div>
                )}

                {/* Barra de Progresso Visual e Marcador */}
                {isPlaying && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3 text-[11px] text-teal-200">
                        <div 
                            className="flex-1 bg-white/10 hover:bg-white/20 h-2 rounded-full overflow-hidden cursor-pointer transition-all"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const ratio = clickX / rect.width;
                                const targetIdx = Math.floor(ratio * chunks.length);
                                handlePlayFromIndex(targetIdx);
                            }}
                            title="Clique para pular para este ponto da aula"
                        >
                            <div 
                                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-teal-300 shrink-0">
                            {progressPercentage}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModuleAudioPlayer;
