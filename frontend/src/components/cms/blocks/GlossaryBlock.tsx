import React, { useState, useMemo } from 'react';
import type { BlockProps } from './types';
import { Search, Copy, Check, Sparkles, Plus, Trash2, HelpCircle } from 'lucide-react';
import Tilt3DCard from '../../3d/Tilt3DCard';

export interface GlossaryTermItem {
    id: string;
    term: string;
    category: string;
    definition: string;
    example?: string;
}

const GlossaryBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const data = block.data || {};
    const title = data.title || 'Glossário de Cuidados Paliativos';
    const subtitle = data.subtitle || 'Consulte os principais termos, conceitos bioéticos e definições fundamentais para a prática humanizada.';
    const terms: GlossaryTermItem[] = data.terms || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLetter, setSelectedLetter] = useState<string>('TODOS');
    const [copiedTerm, setCopiedTerm] = useState<string | null>(null);

    const handleUpdateField = (field: string, val: any) => {
        onUpdate(block.id, { data: { ...data, [field]: val } });
    };

    const handleAddTerm = () => {
        const newTerm: GlossaryTermItem = {
            id: Date.now().toString(),
            term: 'Novo Termo Médico',
            category: 'Conceito Fundamental',
            definition: 'Explicação detalhada e humanizada sobre o termo ou conceito.',
            example: 'Exemplo prático de aplicação no cuidado ao paciente.'
        };
        handleUpdateField('terms', [...terms, newTerm]);
    };

    const handleUpdateTerm = (index: number, field: keyof GlossaryTermItem, val: string) => {
        const updated = [...terms];
        updated[index] = { ...updated[index], [field]: val };
        handleUpdateField('terms', updated);
    };

    const handleDeleteTerm = (index: number) => {
        const updated = terms.filter((_, i) => i !== index);
        handleUpdateField('terms', updated);
    };

    const copyToClipboard = (term: string, text: string) => {
        navigator.clipboard.writeText(`${term}: ${text}`);
        setCopiedTerm(term);
        setTimeout(() => setCopiedTerm(null), 2000);
    };

    const alphabet = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];

    const filteredTerms = useMemo(() => {
        return terms.filter(item => {
            const matchesLetter = selectedLetter === 'TODOS' || item.term.toUpperCase().startsWith(selectedLetter);
            const matchesQuery = !searchQuery.trim() ||
                item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesLetter && matchesQuery;
        });
    }, [terms, searchQuery, selectedLetter]);

    const editableClass = isEditing ? 'outline-dashed outline-1 outline-primary/40 focus:outline-primary rounded px-1' : '';

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            className={`relative w-full max-w-7xl mx-auto py-6 transition-all ${
                isSelected ? 'ring-2 ring-primary ring-offset-4 rounded-3xl' : ''
            }`}
        >
            {/* Header Banner */}
            <div className="p-8 sm:p-12 rounded-3xl border border-warm-200 shadow-xl bg-gradient-to-br from-white via-warm-50/80 to-emerald-50/40 mb-10 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs mb-4 border border-primary/20 shadow-2xs">
                    <Sparkles size={14} className="text-secondary" />
                    <span>Dicionário Terminolóxico & Conceitual</span>
                </div>

                <h1
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('title', e.currentTarget.innerText)}
                    className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-warm-900 mb-4 tracking-tight font-display ${editableClass}`}
                >
                    {title}
                </h1>

                <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('subtitle', e.currentTarget.innerText)}
                    className={`text-sm sm:text-base text-warm-600 max-w-2xl mx-auto leading-relaxed ${editableClass}`}
                >
                    {subtitle}
                </p>

                {/* Barra de Pesquisa */}
                <div className="mt-8 max-w-xl mx-auto space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar termo ou conceito (ex: Ortotanásia, Dor Total, PPS...)"
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-warm-200 rounded-2xl text-sm font-medium text-warm-800 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    {/* Índice Alfabético */}
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                        {alphabet.map(letter => (
                            <button
                                key={letter}
                                type="button"
                                onClick={() => setSelectedLetter(letter)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedLetter === letter
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'bg-white text-warm-700 border border-warm-200 hover:bg-warm-100'
                                }`}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ação de Adicionar no Modo Edição */}
            {isEditing && (
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-xs font-bold text-warm-500 uppercase tracking-wider">
                        {terms.length} Termos no Glossário
                    </span>
                    <button
                        type="button"
                        onClick={handleAddTerm}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:bg-sage-700 transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Adicionar Novo Termo</span>
                    </button>
                </div>
            )}

            {/* Grid de Cards dos Termos */}
            {filteredTerms.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTerms.map((item, index) => {
                        const originalIndex = terms.findIndex(it => it.id === item.id);
                        return (
                            <Tilt3DCard key={item.id} maxTilt={5}>
                                <div className="p-7 rounded-3xl bg-white border border-warm-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full group relative">
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTerm(originalIndex >= 0 ? originalIndex : index)}
                                            className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors z-20 cursor-pointer"
                                            title="Excluir termo"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-3 pr-6">
                                            <span
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => handleUpdateTerm(originalIndex, 'category', e.currentTarget.innerText)}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 ${editableClass}`}
                                            >
                                                {item.category}
                                            </span>

                                            {!isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(item.term, item.definition)}
                                                    className="p-1.5 text-warm-400 hover:text-primary transition-colors rounded-lg hover:bg-warm-50 cursor-pointer"
                                                    title="Copiar definição"
                                                >
                                                    {copiedTerm === item.term ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                                                </button>
                                            )}
                                        </div>

                                        <h3
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateTerm(originalIndex, 'term', e.currentTarget.innerText)}
                                            className={`font-extrabold text-xl text-warm-900 mb-3 group-hover:text-primary transition-colors ${editableClass}`}
                                        >
                                            {item.term}
                                        </h3>

                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateTerm(originalIndex, 'definition', e.currentTarget.innerText)}
                                            className={`text-warm-600 text-xs sm:text-sm leading-relaxed font-light mb-4 ${editableClass}`}
                                        >
                                            {item.definition}
                                        </p>

                                        {(item.example || isEditing) && (
                                            <div className="p-3 bg-warm-50 rounded-2xl border border-warm-100 text-xs text-warm-700 space-y-1">
                                                <span className="font-bold text-warm-800 flex items-center gap-1 text-[11px]">
                                                    💡 Na prática clínica:
                                                </span>
                                                <p
                                                    contentEditable={isEditing}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => handleUpdateTerm(originalIndex, 'example', e.currentTarget.innerText)}
                                                    className={`font-light text-[11px] leading-relaxed text-warm-600 ${editableClass}`}
                                                >
                                                    {item.example || 'Clique para adicionar um exemplo prático de aplicação.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Tilt3DCard>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-warm-300">
                    <HelpCircle size={40} className="mx-auto text-warm-400 mb-3" />
                    <p className="text-warm-700 font-bold">
                        {terms.length === 0 ? 'Nenhum termo cadastrado no glossário ainda.' : `Nenhum termo encontrado para "${searchQuery}".`}
                    </p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleAddTerm}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                        >
                            <Plus size={15} /> Adicionar Primeiro Termo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlossaryBlock;
