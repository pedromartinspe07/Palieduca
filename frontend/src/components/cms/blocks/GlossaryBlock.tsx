import React, { useState, useMemo } from 'react';
import type { BlockProps } from './types';
import { Search, Copy, Check, Plus, Trash2, HelpCircle, Leaf } from 'lucide-react';
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
            term: 'Novo Termo',
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
            className={`relative w-full max-w-6xl mx-auto py-4 transition-all ${
                isSelected ? 'ring-2 ring-primary ring-offset-4 rounded-3xl' : ''
            }`}
        >
            {/* Header Hero Banner (Glassmorphism Acolhedor) */}
            <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-2xl mb-12 text-center relative overflow-hidden">
                
                {/* Badge Botânica */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 font-bold text-xs mb-5 shadow-2xs">
                    <Leaf size={13} className="text-teal-600" />
                    <span>Dicionário Terminológico e Conceitual</span>
                </div>

                {/* Título com Tipografia Gradiente Oficial */}
                <h1
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('title', e.currentTarget.innerText)}
                    className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-4 tracking-tight font-display ${editableClass}`}
                >
                    {isEditing ? title : (
                        <>Glossário <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#0f766e]">de Cuidados Paliativos</span></>
                    )}
                </h1>

                {/* Subtítulo */}
                <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('subtitle', e.currentTarget.innerText)}
                    className={`text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed ${editableClass}`}
                >
                    {subtitle}
                </p>

                {/* Barra de Pesquisa em Pílula */}
                <div className="mt-8 max-w-xl mx-auto space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar termo ou conceito (ex: Ortotanásia, Dor Total, PPS...)"
                            className="w-full pl-11 pr-4 py-3.5 bg-white/90 border border-slate-200/80 rounded-full text-sm font-medium text-slate-800 shadow-2xs focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white outline-none transition-all"
                        />
                    </div>

                    {/* Índice Alfabético com Botões Pílula */}
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                        {alphabet.map(letter => (
                            <button
                                key={letter}
                                type="button"
                                onClick={() => setSelectedLetter(letter)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    selectedLetter === letter
                                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs scale-105'
                                        : 'bg-white/90 text-slate-600 border border-slate-200/70 hover:bg-sky-50 hover:text-sky-800'
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
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {terms.length} Termos no Glossário
                    </span>
                    <button
                        type="button"
                        onClick={handleAddTerm}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-sky-600 text-white rounded-full font-bold text-xs shadow-sm hover:brightness-110 transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Adicionar Novo Termo</span>
                    </button>
                </div>
            )}

            {/* Grid de Cards dos Termos */}
            {filteredTerms.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredTerms.map((item, index) => {
                        const originalIndex = terms.findIndex(it => it.id === item.id);
                        const isEven = index % 2 === 0;

                        return (
                            <Tilt3DCard key={item.id} maxTilt={5}>
                                <div className="p-7 rounded-[28px] bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-sky-300/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group relative">
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
                                        {/* Categoria & Botão Copiar */}
                                        <div className="flex items-center justify-between mb-3.5 pr-6">
                                            <span
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => handleUpdateTerm(originalIndex, 'category', e.currentTarget.innerText)}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100/70 text-sky-800 border border-sky-200/70 ${editableClass}`}
                                            >
                                                {item.category || 'CONCEITO FUNDAMENTAL'}
                                            </span>

                                            {!isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(item.term, item.definition)}
                                                    className="p-1.5 text-slate-400 hover:text-sky-600 transition-colors rounded-lg hover:bg-sky-50 cursor-pointer"
                                                    title="Copiar definição"
                                                >
                                                    {copiedTerm === item.term ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Título do Termo */}
                                        <h3
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateTerm(originalIndex, 'term', e.currentTarget.innerText)}
                                            className={`font-extrabold text-xl text-[#0f172a] mb-2.5 group-hover:text-teal-700 transition-colors ${editableClass}`}
                                        >
                                            {item.term}
                                        </h3>

                                        {/* Definição */}
                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateTerm(originalIndex, 'definition', e.currentTarget.innerText)}
                                            className={`text-slate-600 text-xs sm:text-sm leading-relaxed font-light mb-4 ${editableClass}`}
                                        >
                                            {item.definition}
                                        </p>

                                        {/* Destaque "Na prática clínica" */}
                                        {(item.example || isEditing) && (
                                            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 transition-colors ${
                                                isEven 
                                                    ? 'bg-[#f5f3ff]/80 border-[#e0e7ff] text-indigo-950' 
                                                    : 'bg-[#ecfdf5]/80 border-[#d1fae5] text-emerald-950'
                                            }`}>
                                                <span className="font-bold flex items-center gap-1.5 text-[11px] text-slate-800">
                                                    <Leaf size={12} className={isEven ? 'text-indigo-600' : 'text-emerald-600'} />
                                                    Na prática clínica:
                                                </span>
                                                <p
                                                    contentEditable={isEditing}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => handleUpdateTerm(originalIndex, 'example', e.currentTarget.innerText)}
                                                    className={`font-light text-[11px] leading-relaxed text-slate-600 ${editableClass}`}
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
                <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-slate-300">
                    <HelpCircle size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-700 font-bold">
                        {terms.length === 0 ? 'Nenhum termo cadastrado no glossário ainda.' : `Nenhum termo encontrado para "${searchQuery}".`}
                    </p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleAddTerm}
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 text-white rounded-full font-bold text-xs shadow-sm cursor-pointer"
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
