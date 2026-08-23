import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

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
            className="fixed bottom-24 right-5 sm:right-6 z-40 flex flex-col items-center select-none"
            role="group"
            aria-label="Controle de tamanho da fonte"
        >
            <div className="flex flex-col items-center bg-white/90 backdrop-blur-xl border border-white/90 rounded-full shadow-[0_10px_25px_-5px_rgba(15,23,42,0.12)] p-1.5 py-3 gap-1.5">
                <span className="text-[11px] font-extrabold text-slate-700 select-none px-1 tracking-tight">
                    AA
                </span>
                
                <div className="w-5 h-[1px] bg-slate-200/80 my-0.5" />

                <button
                    onClick={increase}
                    disabled={fontSize >= MAX_SIZE}
                    aria-label="Aumentar fonte"
                    className="flex items-center justify-center w-7 h-7 rounded-full text-slate-700 hover:bg-teal-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none font-bold text-sm cursor-pointer"
                >
                    <Plus size={14} strokeWidth={2.5} />
                </button>
                
                <span className="text-[10px] font-bold text-slate-500 tabular-nums select-none">
                    {fontSize}px
                </span>
                
                <button
                    onClick={decrease}
                    disabled={fontSize <= MIN_SIZE}
                    aria-label="Diminuir fonte"
                    className="flex items-center justify-center w-7 h-7 rounded-full text-slate-700 hover:bg-teal-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none font-bold text-sm cursor-pointer"
                >
                    <Minus size={14} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default FontSizeControl;
