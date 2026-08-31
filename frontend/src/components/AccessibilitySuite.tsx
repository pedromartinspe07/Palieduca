import React, { useState, useEffect } from 'react';
import { 
    Eye, Minus, Plus, Type, Volume2, VolumeX, 
    RefreshCw, Sparkles, X, Accessibility, Check
} from 'lucide-react';

const STORAGE_KEYS = {
    fontSize: 'palieduca-font-size',
    highContrast: 'palieduca-high-contrast',
    dyslexia: 'palieduca-dyslexia',
    spacing: 'palieduca-expanded-spacing'
};

const MIN_SIZE = 14;
const MAX_SIZE = 22;
const DEFAULT_SIZE = 16;
const STEP = 2;

export const AccessibilitySuite: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Accessibility States
    const [fontSize, setFontSize] = useState<number>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.fontSize);
        return stored ? Number(stored) : DEFAULT_SIZE;
    });

    const [highContrast, setHighContrast] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEYS.highContrast) === 'true';
    });

    const [dyslexiaFont, setDyslexiaFont] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEYS.dyslexia) === 'true';
    });

    const [expandedSpacing, setExpandedSpacing] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEYS.spacing) === 'true';
    });

    const [isSpeaking, setIsSpeaking] = useState(false);

    // Apply font size
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
        localStorage.setItem(STORAGE_KEYS.fontSize, String(fontSize));
    }, [fontSize]);

    // Apply high contrast
    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
        localStorage.setItem(STORAGE_KEYS.highContrast, String(highContrast));
    }, [highContrast]);

    // Apply dyslexia font
    useEffect(() => {
        if (dyslexiaFont) {
            document.documentElement.classList.add('dyslexia-font');
        } else {
            document.documentElement.classList.remove('dyslexia-font');
        }
        localStorage.setItem(STORAGE_KEYS.dyslexia, String(dyslexiaFont));
    }, [dyslexiaFont]);

    // Apply expanded spacing
    useEffect(() => {
        if (expandedSpacing) {
            document.documentElement.classList.add('expanded-spacing');
        } else {
            document.documentElement.classList.remove('expanded-spacing');
        }
        localStorage.setItem(STORAGE_KEYS.spacing, String(expandedSpacing));
    }, [expandedSpacing]);

    // Text to Speech Reader
    const handleToggleSpeech = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            alert('A síntese de voz não é suportada neste navegador.');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const mainContent = document.querySelector('main') || document.body;
            const textToRead = mainContent.innerText.slice(0, 3000); // Primeiros parágrafos
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.95;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    const handleReset = () => {
        setFontSize(DEFAULT_SIZE);
        setHighContrast(false);
        setDyslexiaFont(false);
        setExpandedSpacing(false);
        if (isSpeaking && typeof window !== 'undefined') {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleOpenVLibras = () => {
        const vlibrasBtn = document.querySelector('[vw-access-button]') as HTMLElement;
        if (vlibrasBtn) {
            vlibrasBtn.click();
        } else {
            alert('O assistente VLibras está carregando...');
        }
    };

    return (
        <>
            {/* ═══ SKIP TO CONTENT LINK (ACESSIBILIDADE POR TECLADO) ═══ */}
            <a href="#main-content" className="skip-link">
                Pular para o conteúdo principal [Alt + 1]
            </a>

            {/* ═══ BOTÃO FLUTUANTE DE ACESSIBILIDADE ═══ */}
            <div className="fixed bottom-24 right-5 sm:right-6 z-40 select-none">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-12 h-12 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer border-2 border-white/80"
                    aria-label="Abrir menu de recursos de acessibilidade e inclusão"
                    title="Menu de Acessibilidade (Tamanho da fonte, Alto Contraste, Leitor de Voz)"
                >
                    <Accessibility size={24} />
                </button>
            </div>

            {/* ═══ PAINEL DE CONTROLE DE ACESSIBILIDADE ═══ */}
            {isOpen && (
                <div className="fixed bottom-38 right-5 sm:right-6 z-50 w-80 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 animate-fade-in text-warm-900 dark:text-white">
                    <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Accessibility size={18} className="text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-bold">Recursos de Acessibilidade</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-warm-100 dark:hover:bg-slate-800 rounded-lg text-warm-400 cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* 1. Tamanho do Texto */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-warm-700 dark:text-slate-300">
                            <span>Tamanho da Fonte</span>
                            <span className="tabular-nums text-teal-600 dark:text-teal-400">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-2 bg-warm-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-warm-200 dark:border-slate-700">
                            <button
                                onClick={() => setFontSize(prev => Math.max(prev - STEP, MIN_SIZE))}
                                disabled={fontSize <= MIN_SIZE}
                                className="flex-1 py-1.5 bg-white dark:bg-slate-700 rounded-xl font-bold text-xs shadow-2xs hover:bg-teal-50 dark:hover:bg-teal-950 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
                            >
                                <Minus size={14} /> Diminuir
                            </button>
                            <button
                                onClick={() => setFontSize(prev => Math.min(prev + STEP, MAX_SIZE))}
                                disabled={fontSize >= MAX_SIZE}
                                className="flex-1 py-1.5 bg-white dark:bg-slate-700 rounded-xl font-bold text-xs shadow-2xs hover:bg-teal-50 dark:hover:bg-teal-950 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
                            >
                                <Plus size={14} /> Aumentar
                            </button>
                        </div>
                    </div>

                    {/* 2. Alternadores Rápidos */}
                    <div className="space-y-2 pt-1">
                        {/* Alto Contraste */}
                        <button
                            onClick={() => setHighContrast(!highContrast)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                                highContrast
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-800 dark:text-slate-200 border-warm-200 dark:border-slate-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Eye size={15} /> Alto Contraste (WCAG AAA)
                            </span>
                            {highContrast && <Check size={15} className="text-amber-700 dark:text-amber-300" />}
                        </button>

                        {/* Fonte para Dislexia */}
                        <button
                            onClick={() => setDyslexiaFont(!dyslexiaFont)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                                dyslexiaFont
                                    ? 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200'
                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-800 dark:text-slate-200 border-warm-200 dark:border-slate-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Type size={15} /> Fonte Legível (Dislexia)
                            </span>
                            {dyslexiaFont && <Check size={15} className="text-teal-700 dark:text-teal-300" />}
                        </button>

                        {/* Espaçamento Expandido */}
                        <button
                            onClick={() => setExpandedSpacing(!expandedSpacing)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                                expandedSpacing
                                    ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-200'
                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-800 dark:text-slate-200 border-warm-200 dark:border-slate-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles size={15} /> Espaçamento Expandido
                            </span>
                            {expandedSpacing && <Check size={15} className="text-sky-700 dark:text-sky-300" />}
                        </button>

                        {/* Leitor de Voz da Página */}
                        <button
                            onClick={handleToggleSpeech}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer ${
                                isSpeaking
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse'
                                    : 'bg-warm-50 dark:bg-slate-800 text-warm-800 dark:text-slate-200 border-warm-200 dark:border-slate-700'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                {isSpeaking ? 'Parar Leitura em Voz Alta' : 'Ler Página em Voz Alta'}
                            </span>
                        </button>
                    </div>

                    {/* 3. Ações Finais: VLibras e Redefinir */}
                    <div className="pt-2 border-t border-warm-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                            onClick={handleOpenVLibras}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold cursor-pointer hover:bg-teal-100 transition-colors"
                        >
                            🤟 Tradutor LIBRAS
                        </button>

                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-[11px] font-bold text-warm-500 dark:text-slate-400 hover:text-warm-800 dark:hover:text-white cursor-pointer"
                        >
                            <RefreshCw size={12} /> Redefinir
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccessibilitySuite;
