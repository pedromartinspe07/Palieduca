import React, { useState, useMemo } from 'react';
import type { BlockProps } from './types';
import { Search, ExternalLink, Plus, Trash2, FileText, Tag, Leaf } from 'lucide-react';
import Tilt3DCard from '../../3d/Tilt3DCard';

export interface LibraryItem {
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    year: string;
    type: string;
    url: string;
    badgeColor?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
    'Diretrizes': 'bg-sky-100/70 text-sky-800 border-sky-200/70',
    'Manuais': 'bg-emerald-100/70 text-emerald-800 border-emerald-200/70',
    'Escalas': 'bg-teal-100/70 text-teal-800 border-teal-200/70',
    'Artigos': 'bg-indigo-100/70 text-indigo-800 border-indigo-200/70',
};

const LibraryBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const data = block.data || {};
    const title = data.title || 'Biblioteca Virtual';
    const subtitle = data.subtitle || 'Acesse manuais científicos, diretrizes clínicas, escalas validadas e materiais complementares em Cuidados Paliativos.';
    const items: LibraryItem[] = data.items || [];
    const categories: string[] = data.categories || ['Todas', 'Diretrizes', 'Manuais', 'Escalas', 'Artigos'];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);

    const handleUpdateField = (field: string, val: any) => {
        onUpdate(block.id, { data: { ...data, [field]: val } });
    };

    const handleAddItem = (categoryOverride?: string) => {
        const targetCategory = categoryOverride || (selectedCategory !== 'Todas' ? selectedCategory : 'Diretrizes');
        const newItem: LibraryItem = {
            id: Date.now().toString(),
            title: 'Novo Material Científico',
            author: 'Ministério da Saúde / ANCP',
            year: new Date().getFullYear().toString(),
            category: targetCategory,
            type: 'PDF / Diretriz',
            description: 'Descrição detalhada com evidências e recomendações práticas.',
            url: 'https://',
            badgeColor: CATEGORY_COLORS[targetCategory] || 'bg-sky-100/70 text-sky-800 border-sky-200/70'
        };
        handleUpdateField('items', [...items, newItem]);
    };

    const handleUpdateItem = (index: number, field: keyof LibraryItem, val: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: val };
        if (field === 'category') {
            updated[index].badgeColor = CATEGORY_COLORS[val] || 'bg-sky-100/70 text-sky-800 border-sky-200/70';
        }
        handleUpdateField('items', updated);
    };

    const handleDeleteItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        handleUpdateField('items', updated);
    };

    const handleAddCategory = () => {
        const trimmed = newCategoryInput.trim();
        if (trimmed && !categories.includes(trimmed)) {
            const updatedCategories = [...categories, trimmed];
            handleUpdateField('categories', updatedCategories);
            setSelectedCategory(trimmed);
            setNewCategoryInput('');
            setShowAddCategoryInput(false);
        }
    };

    const availableCategories = categories.filter(c => c !== 'Todas');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = selectedCategory === 'Todas' || item.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchesQuery = !searchQuery.trim() ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesQuery;
        });
    }, [items, searchQuery, selectedCategory]);

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
            <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl mb-12 text-center relative overflow-hidden">
                
                {/* Badge Botânica */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 font-bold text-xs mb-5 shadow-2xs">
                    <Leaf size={13} className="text-teal-600 dark:text-teal-400" />
                    <span>Acervo Científico &amp; Diretrizes Clínicas</span>
                </div>

                {/* Título com Tipografia Gradiente */}
                <h1
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('title', e.currentTarget.innerText)}
                    className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-4 tracking-tight font-display ${editableClass}`}
                >
                    {isEditing ? title : (
                        <>Biblioteca <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#0f766e]">Virtual &amp; Acadêmica</span></>
                    )}
                </h1>

                {/* Subtítulo */}
                <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleUpdateField('subtitle', e.currentTarget.innerText)}
                    className={`text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed ${editableClass}`}
                >
                    {subtitle}
                </p>

                {/* Barra de Pesquisa e Filtros em Pílulas */}
                <div className="mt-8 max-w-xl mx-auto space-y-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar manuais, escalas, diretrizes ou autores..."
                            className="w-full pl-11 pr-4 py-3.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-full text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                        />
                    </div>

                    {/* Pílulas de Categoria */}
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-xs scale-105'
                                        : 'bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700 hover:text-sky-800 dark:hover:text-sky-300'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}

                        {/* Botão de Adicionar Categoria no Modo Edição */}
                        {isEditing && !showAddCategoryInput && (
                            <button
                                type="button"
                                onClick={() => setShowAddCategoryInput(true)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-teal-700 hover:bg-teal-50 border border-dashed border-teal-300 flex items-center gap-1 cursor-pointer"
                                title="Criar nova categoria"
                            >
                                <Plus size={13} />
                                <span>Nova Categoria</span>
                            </button>
                        )}

                        {isEditing && showAddCategoryInput && (
                            <div className="flex items-center gap-1 bg-white border border-teal-500 p-1 rounded-full shadow-xs animate-fade-in">
                                <input
                                    type="text"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    placeholder="Nome da categoria"
                                    className="px-2 py-0.5 text-xs outline-none text-slate-800 w-32"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-2.5 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full cursor-pointer"
                                >
                                    OK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategoryInput(false)}
                                    className="px-1.5 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ação de Adicionar no Modo Edição */}
            {isEditing && (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-teal-600" />
                        <span className="text-xs font-bold text-slate-700">
                            {items.length} Materiais Cadastrados {selectedCategory !== 'Todas' ? `(${filteredItems.length} em ${selectedCategory})` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-500">Adicionar material em:</span>
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleAddItem(cat)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 rounded-full font-bold text-xs border border-teal-200 transition-all cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de Cards dos Materiais */}
            {filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredItems.map((res, index) => {
                        const originalIndex = items.findIndex(it => it.id === res.id);
                        const cardIndex = originalIndex >= 0 ? originalIndex : index;

                        return (
                            <Tilt3DCard key={res.id} maxTilt={5}>
                                <div className="p-7 rounded-[28px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-teal-300/60 dark:hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group relative">
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteItem(cardIndex)}
                                            className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors z-20 cursor-pointer"
                                            title="Excluir material"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}

                                    <div>
                                        {/* Barra Superior do Card (Categoria, Tipo e Ano) */}
                                        <div className="flex items-center justify-between gap-2 mb-4 pr-6 flex-wrap">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5">
                                                    <select
                                                        value={res.category}
                                                        onChange={(e) => handleUpdateItem(cardIndex, 'category', e.target.value)}
                                                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-teal-50 dark:bg-slate-800 border-teal-200 dark:border-slate-700 text-teal-800 dark:text-teal-300 outline-none cursor-pointer"
                                                    >
                                                        {availableCategories.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        value={res.type}
                                                        onChange={(e) => handleUpdateItem(cardIndex, 'type', e.target.value)}
                                                        className="text-[11px] font-medium px-2 py-1 rounded-full border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                                                    >
                                                        <option value="PDF">PDF</option>
                                                        <option value="Guia Clínico">Guia Clínico</option>
                                                        <option value="Escala Interativa">Escala Interativa</option>
                                                        <option value="Artigo Científico">Artigo Científico</option>
                                                        <option value="Livro / Manual">Livro / Manual</option>
                                                        <option value="Vídeo">Vídeo</option>
                                                        <option value="Link Externo">Link Externo</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${res.badgeColor || 'bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200/70 dark:border-teal-800/60'}`}>
                                                        {res.category}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                        {res.type}
                                                    </span>
                                                </div>
                                            )}

                                            <span
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => handleUpdateItem(cardIndex, 'year', e.currentTarget.innerText)}
                                                className={`text-xs font-bold text-slate-400 dark:text-slate-500 ${editableClass}`}
                                            >
                                                {res.year}
                                            </span>
                                        </div>

                                        {/* Título do Material */}
                                        <h3
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'title', e.currentTarget.innerText)}
                                            className={`font-extrabold text-lg text-[#0f172a] dark:text-slate-100 mb-1.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-snug ${editableClass}`}
                                        >
                                            {res.title}
                                        </h3>

                                        {/* Autor / Instituição */}
                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'author', e.currentTarget.innerText)}
                                            className={`text-xs font-semibold text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-1 ${editableClass}`}
                                        >
                                            <span>✍️</span> {res.author}
                                        </p>

                                        {/* Descrição */}
                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'description', e.currentTarget.innerText)}
                                            className={`text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light mb-6 line-clamp-3 ${editableClass}`}
                                        >
                                            {res.description}
                                        </p>
                                    </div>

                                    {/* Botão de Acesso */}
                                    {isEditing ? (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Link de Acesso (URL):</label>
                                            <input
                                                type="text"
                                                value={res.url}
                                                onChange={(e) => handleUpdateItem(cardIndex, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-700 dark:text-slate-200 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 hover:from-teal-600 hover:to-sky-600 dark:hover:from-teal-600 dark:hover:to-sky-600 text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white rounded-2xl font-bold text-xs border border-teal-200 dark:border-slate-700 hover:border-transparent transition-all duration-300 shadow-2xs group-hover:shadow-md"
                                        >
                                            <span>Acessar Material</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </Tilt3DCard>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-slate-300">
                    <FileText size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-slate-700 font-bold">
                        {items.length === 0 ? 'Nenhum material cadastrado na biblioteca ainda.' : `Nenhum material encontrado em "${selectedCategory}".`}
                    </p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => handleAddItem(selectedCategory !== 'Todas' ? selectedCategory : 'Diretrizes')}
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 text-white rounded-full font-bold text-xs shadow-sm cursor-pointer"
                        >
                            <Plus size={15} /> Adicionar Primeiro Material {selectedCategory !== 'Todas' ? `em ${selectedCategory}` : ''}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default LibraryBlock;
