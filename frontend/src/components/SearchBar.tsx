import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEARCH_DATA, type SearchItem } from '../data/searchData';

// Normaliza o texto removendo acentos e convertendo para minúsculo - essencial para busca tolerante
const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fecha o popover caso clique fora da barra de busca
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Otimização simples: só busca quando há mais de 1 caractere
        if (value.trim().length > 1) {
            const normalizedQuery = normalize(value);
            const filtered = SEARCH_DATA.filter(
                item =>
                    normalize(item.title).includes(normalizedQuery) ||
                    normalize(item.description).includes(normalizedQuery) ||
                    normalize(item.type).includes(normalizedQuery)
            );
            setResults(filtered);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    const handleSelect = (path: string) => {
        navigate(path);
        clearSearch();
    };

    return (
        <div className="relative w-full max-w-sm z-50" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => { if (query.trim().length > 1) setIsOpen(true); }}
                    placeholder="Pesquisa global..."
                    className="pl-10 pr-10 py-2.5 bg-white/50 border border-warm-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-sm focus:bg-white w-56 lg:w-72"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" size={16} />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-primary transition-colors bg-white/80 rounded-full p-0.5"
                        aria-label="Limpar pesquisa"
                    >
                        <X size={14} strokeWidth={3} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-14 right-0 md:left-0 w-[85vw] md:w-[450px] bg-white/95 backdrop-blur-xl border border-warm-100 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,94,84,0.3)] overflow-hidden animate-slide-up">
                    {results.length > 0 ? (
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                            <div className="text-[10px] font-bold text-warm-400 uppercase tracking-widest px-4 pt-3 pb-2 border-b border-warm-50 relative">
                                Resultados encontrados
                            </div>
                            <div className="pt-2">
                                {results.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(item.path)}
                                        className="w-full text-left px-4 py-3.5 hover:bg-warm-50 rounded-[1.5rem] transition-colors group flex items-start gap-4 mb-1"
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-2 mb-1.5">
                                                <span className="inline-block self-start text-[9.5px] bg-primary/10 tracking-wide text-primary font-bold px-2 py-0.5 rounded-md uppercase">
                                                    {item.type}
                                                </span>
                                                <h4 className="text-sm font-semibold text-warm-900 group-hover:text-primary transition-colors leading-tight">
                                                    {item.title}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-warm-600 line-clamp-2 leading-relaxed font-light">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white shadow-sm border border-warm-100 flex items-center justify-center shrink-0 mt-3 group-hover:bg-primary group-hover:border-primary transition-colors">
                                            <ChevronRight size={16} className="text-warm-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="px-8 py-12 text-center">
                            <div className="h-16 w-16 mx-auto bg-warm-50 rounded-full flex items-center justify-center mb-4 border border-warm-100">
                                <Search size={28} className="text-warm-300" />
                            </div>
                            <p className="text-sm font-bold text-warm-900 mb-1">Nenhum resultado encontrado</p>
                            <p className="text-xs text-warm-500 max-w-[250px] mx-auto leading-relaxed">
                                Tente pesquisar por termos como "bioética", "dor total" ou "sedação paliativa".
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
