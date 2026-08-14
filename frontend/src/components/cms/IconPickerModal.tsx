import React, { useState, useMemo } from 'react';
import { X, Search, Sparkles, Check, Pipette } from 'lucide-react';
import { ICON_REGISTRY, RenderIcon } from './IconHelper';

interface IconPickerModalProps {
    isOpen: boolean;
    currentIcon?: string;
    currentIconColor?: string;
    currentIconBg?: string;
    onClose: () => void;
    onSelect: (iconName: string, iconColor?: string, iconBg?: string) => void;
}

const CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'saude', label: '🩺 Saúde & Cuidados' },
    { id: 'comunicacao', label: '💬 Comunicação' },
    { id: 'educacao', label: '📚 Educação & Mente' },
    { id: 'midia', label: '🎬 Mídia & Áudio' },
    { id: 'geral', label: '⭐ Geral & Destaque' }
];

const PRESET_PALETTES = [
    { label: 'Verde Pali', color: '#059669', bg: '#ecfdf5' },
    { label: 'Âmbar Quente', color: '#d97706', bg: '#fef3c7' },
    { label: 'Azul Confiança', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Roxo Cuidado', color: '#7c3aed', bg: '#faf5ff' },
    { label: 'Rosa Afeto', color: '#db2777', bg: '#fdf2f8' },
    { label: 'Vermelho Atenção', color: '#dc2626', bg: '#fef2f2' },
    { label: 'Cinza Neutro', color: '#4b5563', bg: '#f3f4f6' },
    { label: 'Escuro Elegante', color: '#ffffff', bg: '#1f2937' },
];

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
    isOpen,
    currentIcon = 'Heart',
    currentIconColor = '#059669',
    currentIconBg = '#ecfdf5',
    onClose,
    onSelect
}) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedIcon, setSelectedIcon] = useState(currentIcon);
    const [iconColor, setIconColor] = useState(currentIconColor);
    const [iconBg, setIconBg] = useState(currentIconBg);

    const filteredIcons = useMemo(() => {
        const query = search.toLowerCase().trim();
        return Object.values(ICON_REGISTRY).filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            const matchesSearch = !query || 
                item.name.toLowerCase().includes(query) ||
                item.label.toLowerCase().includes(query) ||
                item.keywords.some(k => k.toLowerCase().includes(query));
            return matchesCategory && matchesSearch;
        });
    }, [search, selectedCategory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div 
                className="bg-white rounded-3xl shadow-2xl border border-warm-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-warm-100 flex items-center justify-between bg-warm-50/50">
                    <div className="flex items-center gap-2.5">
                        <div 
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-black/5"
                            style={{ backgroundColor: iconBg, color: iconColor }}
                        >
                            <RenderIcon name={selectedIcon} size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-warm-900 flex items-center gap-1.5">
                                <Sparkles size={18} className="text-primary" /> Seletor de Ícones
                            </h3>
                            <p className="text-xs text-warm-500">Escolha o ícone representativo e personalize suas cores</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-warm-200 rounded-xl text-warm-400 hover:text-warm-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search & Categories */}
                <div className="p-5 border-b border-warm-100 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Pesquise por nome ou tema (ex: coração, comunicação, livro, ética, médico)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-warm-50 border border-warm-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                            autoFocus
                        />
                        {search && (
                            <button 
                                onClick={() => setSearch('')} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-warm-400 hover:text-warm-700 font-bold"
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icons Grid */}
                <div className="p-5 flex-1 overflow-y-auto min-h-[260px] max-h-[360px]">
                    {filteredIcons.length === 0 ? (
                        <div className="text-center py-12 text-warm-400">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-40" />
                            <p className="font-semibold text-sm">Nenhum ícone encontrado para "{search}"</p>
                            <p className="text-xs mt-1">Tente palavras mais genéricas como "cuidado", "médico", "livro" ou "texto".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                            {filteredIcons.map(item => {
                                const isSelected = selectedIcon === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => setSelectedIcon(item.name)}
                                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center group ${
                                            isSelected
                                                ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-1 text-primary'
                                                : 'border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50 text-warm-700'
                                        }`}
                                        title={item.label}
                                    >
                                        <div 
                                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={isSelected ? { backgroundColor: iconBg, color: iconColor } : { backgroundColor: '#f9fafb' }}
                                        >
                                            <item.component size={22} />
                                        </div>
                                        <span className="text-[10px] font-medium leading-tight truncate w-full text-warm-600">
                                            {item.label.split('/')[0].trim()}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Color Customization & Footer */}
                <div className="p-4 border-t border-warm-100 bg-warm-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-warm-700 shrink-0">Paletas Prontas:</span>
                        <div className="flex gap-1.5 overflow-x-auto">
                            {PRESET_PALETTES.map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setIconColor(p.color); setIconBg(p.bg); }}
                                    title={p.label}
                                    className="w-7 h-7 rounded-xl border border-warm-300 flex items-center justify-center shadow-xs transition-transform hover:scale-110"
                                    style={{ backgroundColor: p.bg, color: p.color }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                </button>
                            ))}
                        </div>
                        {/* Custom color picker */}
                        <label className="p-1.5 bg-white hover:bg-warm-100 rounded-xl border border-warm-300 cursor-pointer transition-colors relative flex items-center justify-center shrink-0" title="Personalizar Cores">
                            <Pipette size={14} className="text-primary" />
                            <input
                                type="color"
                                value={iconColor}
                                onChange={e => setIconColor(e.target.value)}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-warm-600 hover:bg-warm-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                onSelect(selectedIcon, iconColor, iconBg);
                                onClose();
                            }}
                            className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                            <Check size={16} /> Aplicar Ícone
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IconPickerModal;
