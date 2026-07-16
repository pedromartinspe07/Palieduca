import React, { useState, useEffect } from 'react';
import { ALargeSmall, Minus, Plus } from 'lucide-react';

const STORAGE_KEY = 'palieduca-font-size';
const MIN_SIZE = 14;
const MAX_SIZE = 22;
const DEFAULT_SIZE = 16;
const STEP = 2;

const FontSizeControl: React.FC = () => {
    const [fontSize, setFontSize] = useState<number>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Number(stored) : DEFAULT_SIZE;
    });

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
        localStorage.setItem(STORAGE_KEY, String(fontSize));
    }, [fontSize]);

    const increase = () => setFontSize(prev => Math.min(prev + STEP, MAX_SIZE));
    const decrease = () => setFontSize(prev => Math.max(prev - STEP, MIN_SIZE));

    return (
        <div
            className="fixed bottom-24 right-6 z-40 flex flex-col items-center gap-1.5"
            role="group"
            aria-label="Controle de tamanho da fonte"
        >
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-md border border-warm-200 rounded-2xl shadow-lg p-2 gap-1">
                <div className="flex items-center justify-center text-warm-500 pb-1 border-b border-warm-100 w-full mb-1">
                    <ALargeSmall size={18} />
                </div>
                <button
                    onClick={increase}
                    disabled={fontSize >= MAX_SIZE}
                    aria-label="Aumentar fonte"
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-warm-700 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none font-bold text-sm interactive-btn"
                >
                    <Plus size={16} />
                </button>
                <span className="text-[10px] font-bold text-warm-500 tabular-nums">{fontSize}px</span>
                <button
                    onClick={decrease}
                    disabled={fontSize <= MIN_SIZE}
                    aria-label="Diminuir fonte"
                    className="flex items-center justify-center w-8 h-8 rounded-xl text-warm-700 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none font-bold text-sm interactive-btn"
                >
                    <Minus size={16} />
                </button>
            </div>
        </div>
    );
};

export default FontSizeControl;
