import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
    Search, 
    ChevronRight, 
    BookOpen, 
    Sparkles, 
    FileText, 
    Info, 
    Compass, 
    CornerDownLeft, 
    ArrowUpDown,
    Hash,
    BookMarked
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
    searchContent, 
    type SearchResultType, 
    normalizeText,
    type ScoredSearchResult,
    updateDynamicSearchIndex
} from '../data/searchData';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

// Badges & styling per result type
const TYPE_CONFIG: Record<SearchResultType, { label: string; bg: string; text: string; border: string }> = {
    'Módulo': {
        label: 'Módulo',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200'
    },
    'Glossário': {
        label: 'Glossário',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200'
    },
    'Conceito': {
        label: 'Conceito Clínico',
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200'
    },
    'Biblioteca': {
        label: 'Biblioteca',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200'
    },
    'Apresentação': {
        label: 'Apresentação',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200'
    },
    'Página': {
        label: 'Navegação',
        bg: 'bg-warm-100',
        text: 'text-warm-800',
        border: 'border-warm-200'
    }
};

const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
        case 'Módulo':
            return <BookOpen size={13} className="text-sky-600" />;
        case 'Glossário':
            return <BookMarked size={13} className="text-emerald-600" />;
        case 'Conceito':
            return <Sparkles size={13} className="text-teal-600" />;
        case 'Biblioteca':
            return <FileText size={13} className="text-amber-600" />;
        case 'Apresentação':
            return <Info size={13} className="text-indigo-600" />;
        case 'Página':
        default:
            return <Compass size={13} className="text-warm-700" />;
    }
};

// Popular suggested search pills
const SUGGESTED_SEARCHES = [
    'Dor Total',
    'Protocolo SPIKES',
    'Sedação Paliativa',
    'Diretivas Antecipadas (DAV)',
    'Hipodermóclise',
    'Ortotanásia',
    'Pedro',
    'Eduardo',
    'Escalas Clínicas'
];

// Highlight component that matches tokens regardless of case or accents
interface HighlightProps {
    text: string;
    tokens: string[];
    className?: string;
}

const HighlightText: React.FC<HighlightProps> = ({ text, tokens, className = '' }) => {
    if (!text) return null;
    if (!tokens || tokens.length === 0) return <span className={className}>{text}</span>;

    // Build regex pattern for all matched tokens with word boundaries / substring matches
    const escapedTokens = tokens
        .filter(t => t.length > 0)
        .map(t => normalizeText(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(t => t.length > 0);

    if (escapedTokens.length === 0) return <span className={className}>{text}</span>;

    // Split text into characters and match normalized substrings
    const normText = normalizeText(text);
    const intervals: [number, number][] = [];

    for (const token of escapedTokens) {
        let startIndex = 0;
        while ((startIndex = normText.indexOf(token, startIndex)) !== -1) {
            intervals.push([startIndex, startIndex + token.length]);
            startIndex += token.length;
        }
    }

    if (intervals.length === 0) return <span className={className}>{text}</span>;

    // Merge overlapping intervals
    intervals.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const current of intervals) {
        if (merged.length === 0) {
            merged.push(current);
        } else {
            const last = merged[merged.length - 1];
            if (current[0] <= last[1]) {
                last[1] = Math.max(last[1], current[1]);
            } else {
                merged.push(current);
            }
        }
    }

    // Map character positions back to original text
    const elements: React.ReactNode[] = [];
    let lastPos = 0;

    merged.forEach(([start, end], idx) => {
        if (start > lastPos) {
            elements.push(text.substring(lastPos, start));
        }
        elements.push(
            <mark
                key={`hl-${idx}`}
                className="bg-sky-200/80 text-sky-950 font-semibold px-0.5 rounded transition-colors"
            >
                {text.substring(start, end)}
            </mark>
        );
        lastPos = end;
    });

    if (lastPos < text.length) {
        elements.push(text.substring(lastPos));
    }

    return <span className={className}>{elements}</span>;
};

const FlappingButterflyIcon: React.FC = () => {
    return (
        <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-[0_2px_6px_rgba(14,165,233,0.5)]">
                <defs>
                    <linearGradient id="sbWingGradLeft" x1="50" y1="50" x2="10" y2="10" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="40%" stopColor="#38bdf8" />
                        <stop offset="85%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="sbWingGradRight" x1="50" y1="50" x2="90" y2="10" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="40%" stopColor="#38bdf8" />
                        <stop offset="85%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                </defs>

                {/* Asa Esquerda com Animação de Bater Asas */}
                <g className="butterfly-flap-left">
                    <path
                        d="M48 45 C40 28, 22 10, 8 18 C2 22, 2 40, 16 54 C24 62, 40 58, 48 48 Z"
                        fill="url(#sbWingGradLeft)"
                        stroke="#1e3a8a"
                        strokeWidth="1"
                    />
                    <path
                        d="M47 50 C38 60, 20 70, 24 85 C26 92, 38 95, 44 84 C47 78, 48 62, 47 50 Z"
                        fill="url(#sbWingGradLeft)"
                        stroke="#1e3a8a"
                        strokeWidth="1"
                    />
                </g>

                {/* Asa Direita com Animação de Bater Asas */}
                <g className="butterfly-flap-right">
                    <path
                        d="M52 45 C60 28, 78 10, 92 18 C98 22, 98 40, 84 54 C76 62, 60 58, 52 48 Z"
                        fill="url(#sbWingGradRight)"
                        stroke="#1e3a8a"
                        strokeWidth="1"
                    />
                    <path
                        d="M53 50 C62 60, 80 70, 76 85 C74 92, 62 95, 56 84 C53 78, 52 62, 53 50 Z"
                        fill="url(#sbWingGradRight)"
                        stroke="#1e3a8a"
                        strokeWidth="1"
                    />
                </g>

                {/* Corpo e Cabeça */}
                <ellipse cx="50" cy="50" rx="2.5" ry="14" fill="#0f172a" />
                <circle cx="50" cy="35" r="2.5" fill="#0f172a" />
                <path d="M49 33 Q43 24 36 22" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M51 33 Q57 24 64 22" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        </div>
    );
};

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('Todos');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch and index real-time CMS content (Glossary terms, Library items, Module lessons)
    const syncCMSContent = useCallback(async () => {
        try {
            const [pagesRes, modsRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/cms/pages`),
                fetch(`${API_URL}/api/modules`)
            ]);
            const pages = pagesRes.ok ? await pagesRes.json() : [];
            const mods = modsRes.ok ? await modsRes.json() : [];
            updateDynamicSearchIndex(pages, mods);
        } catch (e) {
            // Silently fallback to base index if offline
        }
    }, []);

    // Initial sync on mount
    useEffect(() => {
        syncCMSContent();
    }, [syncCMSContent]);

    // Global keyboard shortcut (Ctrl+K or Cmd+K) to open and focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
                syncCMSContent();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [syncCMSContent]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate ranked search results with token matching (includes live CMS items)
    const rawResults: ScoredSearchResult[] = useMemo(() => {
        if (!query.trim() || query.trim().length < 2) return [];
        return searchContent(query);
    }, [query]);

    // Filter results by selected category tab
    const filteredResults = useMemo(() => {
        if (activeFilter === 'Todos') return rawResults;
        return rawResults.filter(({ item }) => item.type === activeFilter);
    }, [rawResults, activeFilter]);

    // Available categories in current results
    const availableCategories = useMemo(() => {
        if (rawResults.length === 0) return ['Todos'];
        const types = Array.from(new Set(rawResults.map(r => r.item.type)));
        return ['Todos', ...types];
    }, [rawResults]);

    // Reset selection index when query or filter changes
    useEffect(() => {
        setSelectedIndex(filteredResults.length > 0 ? 0 : -1);
    }, [filteredResults]);

    // Scroll active item into view when navigating with keyboard
    useEffect(() => {
        if (selectedIndex >= 0 && listRef.current) {
            const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setIsOpen(true);
    };

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const handleSelect = useCallback((path: string) => {
        setIsOpen(false);
        setSelectedIndex(-1);
        navigate(path);
    }, [navigate]);

    // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') {
                setIsOpen(true);
                syncCMSContent();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
                handleSelect(filteredResults[selectedIndex].item.path);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSuggestionClick = (term: string) => {
        setQuery(term);
        setIsOpen(true);
        inputRef.current?.focus();
        syncCMSContent();
    };

    const handleFocus = () => {
        setIsOpen(true);
        syncCMSContent();
    };

    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    return (
        <div className="relative w-full max-w-sm z-50" ref={containerRef}>
            {/* Input Bar */}
            <div className="relative flex items-center group">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder="Pesquisar..."
                    className="w-32 sm:w-40 md:w-48 lg:w-40 xl:w-56 pl-8 pr-10 py-1.5 bg-white/70 backdrop-blur-md border border-warm-200/80 rounded-full text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white shadow-2xs transition-all"
                    aria-label="Busca global de conteúdos"
                />

                {/* Left Search Icon */}
                <Search 
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400 group-focus-within:text-sky-600 transition-colors pointer-events-none" 
                    size={14} 
                />

                {/* Right Actions: Flapping Butterfly Button instead of X */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query ? (
                        <button
                            onClick={clearSearch}
                            className="p-1 hover:bg-sky-100/70 rounded-full transition-all cursor-pointer group/btn flex items-center justify-center"
                            aria-label="Limpar pesquisa (Clique na borboleta)"
                            title="Limpar pesquisa (Clique na borboleta)"
                        >
                            <FlappingButterflyIcon />
                        </button>
                    ) : (
                        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-warm-400 bg-warm-100/90 border border-warm-200 rounded text-center shadow-2xs pointer-events-none select-none">
                            {isMac ? '⌘K' : 'Ctrl K'}
                        </kbd>
                    )}
                </div>
            </div>

            {/* Dropdown Results Modal / Popover */}
            {isOpen && (
                <div className="absolute top-12 right-0 md:left-0 w-[92vw] sm:w-[480px] lg:w-[540px] bg-white/95 backdrop-blur-2xl border border-warm-200/90 rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] overflow-hidden animate-slide-up z-50">
                    
                    {/* Filter Category Tabs (Visible when there are search results) */}
                    {rawResults.length > 0 && availableCategories.length > 2 && (
                        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-warm-100 bg-warm-50/50 overflow-x-auto no-scrollbar">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                                        activeFilter === cat
                                            ? 'bg-sky-600 text-white shadow-2xs'
                                            : 'bg-white text-warm-600 hover:bg-warm-100 border border-warm-200/60'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results Body */}
                    {query.trim().length >= 2 ? (
                        filteredResults.length > 0 ? (
                            <div>
                                <div className="flex justify-between items-center px-4 pt-3 pb-2 text-[11px] font-semibold text-warm-400 border-b border-warm-100/60">
                                    <span className="flex items-center gap-1.5">
                                        <Hash size={12} className="text-sky-500" />
                                        {filteredResults.length} {filteredResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                                    </span>
                                    <span className="hidden sm:inline text-[10px] text-warm-400">
                                        Use <kbd className="px-1 py-0.5 bg-warm-100 rounded text-warm-600">↑</kbd> <kbd className="px-1 py-0.5 bg-warm-100 rounded text-warm-600">↓</kbd> para navegar
                                    </span>
                                </div>

                                <div ref={listRef} className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                    {filteredResults.map(({ item, matchedTokens }, index) => {
                                        const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG['Conceito'];
                                        const isSelected = index === selectedIndex;

                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelect(item.path)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-start gap-3.5 cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-sky-50/90 border border-sky-200/80 shadow-2xs'
                                                        : 'hover:bg-warm-50/80 border border-transparent'
                                                }`}
                                            >
                                                {/* Type Icon Badge */}
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${typeInfo.bg} ${typeInfo.border}`}>
                                                    {getTypeIcon(item.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
                                                            {item.badge || typeInfo.label}
                                                        </span>
                                                        {item.category && (
                                                            <span className="text-[11px] text-warm-400 font-medium truncate max-w-[200px]">
                                                                • {item.category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h4 className="text-sm font-semibold text-warm-900 leading-snug mb-1">
                                                        <HighlightText text={item.title} tokens={matchedTokens} />
                                                    </h4>

                                                    <p className="text-xs text-warm-600 line-clamp-2 leading-relaxed font-normal">
                                                        <HighlightText text={item.description} tokens={matchedTokens} />
                                                    </p>
                                                </div>

                                                {/* Selection Enter Indicator */}
                                                <div className="shrink-0 flex items-center self-center pl-1">
                                                    {isSelected ? (
                                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-100/80 px-2 py-1 rounded-md">
                                                            <CornerDownLeft size={11} />
                                                            <span className="hidden sm:inline">Abrir</span>
                                                        </div>
                                                    ) : (
                                                        <ChevronRight size={16} className="text-warm-300" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* No Results Found State */
                            <div className="px-6 py-10 text-center">
                                <div className="w-14 h-14 mx-auto bg-warm-50 rounded-2xl flex items-center justify-center mb-3.5 border border-warm-100 text-warm-400">
                                    <Search size={24} />
                                </div>
                                <h4 className="text-sm font-bold text-warm-900 mb-1">
                                    Nenhum resultado para "{query}"
                                </h4>
                                <p className="text-xs text-warm-500 max-w-sm mx-auto leading-relaxed mb-4">
                                    Tente buscar por palavras-chave clínicas, nomes de módulos ou conceitos como:
                                </p>
                                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                                    {['Dor Total', 'SPIKES', 'DAV', 'Bioética', 'Morfina', 'Hipodermóclise'].map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        /* Initial Suggestions & Popular Searches State */
                        <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-3 text-xs font-bold text-warm-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-sky-500" />
                                    Termos mais buscados em Cuidados Paliativos
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {SUGGESTED_SEARCHES.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => handleSuggestionClick(term)}
                                        className="text-xs font-medium text-warm-700 hover:text-sky-700 bg-warm-50 hover:bg-sky-50 border border-warm-200/70 hover:border-sky-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 group"
                                    >
                                        <Search size={11} className="text-warm-400 group-hover:text-sky-600 transition-colors" />
                                        <span>{term}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Keyboard footer shortcuts info */}
                            <div className="pt-3 border-t border-warm-100 flex items-center justify-between text-[11px] text-warm-400">
                                <span className="flex items-center gap-1">
                                    <ArrowUpDown size={11} /> Navegar com setas
                                </span>
                                <span>
                                    Pressione <kbd className="px-1 py-0.5 bg-warm-100 text-warm-600 rounded">ESC</kbd> para fechar
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
