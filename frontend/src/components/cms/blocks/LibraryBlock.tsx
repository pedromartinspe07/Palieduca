import React, { useState, useMemo } from 'react';
import type { BlockProps } from './types';
import { Search, ExternalLink, Sparkles, Plus, Trash2, FileText, Tag } from 'lucide-react';
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
    'Diretrizes': 'bg-blue-50 text-blue-800 border-blue-200',
    'Manuais': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Escalas': 'bg-amber-50 text-amber-800 border-amber-200',
    'Artigos': 'bg-purple-50 text-purple-800 border-purple-200',
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
            title: 'Novo Material / Artigo',
            author: 'Nome do Autor / Instituição',
            year: new Date().getFullYear().toString(),
            category: targetCategory,
            type: 'PDF',
            description: 'Descrição sucinta sobre os objetivos e o conteúdo deste material.',
            url: 'https://',
            badgeColor: CATEGORY_COLORS[targetCategory] || 'bg-warm-100 text-warm-800 border-warm-200'
        };
        handleUpdateField('items', [...items, newItem]);
    };

    const handleUpdateItem = (index: number, field: keyof LibraryItem, val: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: val };
        if (field === 'category') {
            updated[index].badgeColor = CATEGORY_COLORS[val] || 'bg-warm-100 text-warm-800 border-warm-200';
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
            className={`relative w-full max-w-7xl mx-auto py-6 transition-all ${
                isSelected ? 'ring-2 ring-primary ring-offset-4 rounded-3xl' : ''
            }`}
        >
            {/* Header Banner */}
            <div className="p-8 sm:p-12 rounded-3xl border border-warm-200 shadow-xl bg-gradient-to-br from-white via-warm-50/80 to-blue-50/40 mb-10 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs mb-4 border border-blue-200 shadow-2xs">
                    <Sparkles size={14} className="text-blue-600" />
                    <span>Acervo Científico & Diretrizes Clínicas</span>
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

                {/* Barra de Pesquisa e Filtros */}
                <div className="mt-8 max-w-xl mx-auto space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar manuais, escalas, diretrizes ou autores..."
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-warm-200 rounded-2xl text-sm font-medium text-warm-800 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    {/* Pílulas de Categoria */}
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory === cat
                                        ? 'bg-primary text-white shadow-xs'
                                        : 'bg-white text-warm-700 border border-warm-200 hover:bg-warm-100'
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
                                className="px-3 py-1.5 rounded-full text-xs font-bold bg-warm-100 text-warm-700 hover:bg-warm-200 border border-dashed border-warm-300 flex items-center gap-1 cursor-pointer"
                                title="Criar nova categoria"
                            >
                                <Plus size={13} />
                                <span>Nova Categoria</span>
                            </button>
                        )}

                        {isEditing && showAddCategoryInput && (
                            <div className="flex items-center gap-1 bg-white border border-primary p-1 rounded-full shadow-xs animate-fade-in">
                                <input
                                    type="text"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    placeholder="Nome da categoria"
                                    className="px-2 py-0.5 text-xs outline-none text-warm-800 w-32"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full cursor-pointer"
                                >
                                    OK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddCategoryInput(false)}
                                    className="px-1.5 text-warm-400 hover:text-warm-700 text-xs cursor-pointer"
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
                <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-primary" />
                        <span className="text-xs font-bold text-warm-700">
                            {items.length} Materiais Cadastrados {selectedCategory !== 'Todas' ? `(${filteredItems.length} em ${selectedCategory})` : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-warm-500">Adicionar material em:</span>
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleAddItem(cat)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-50 hover:bg-primary hover:text-white text-warm-800 rounded-xl font-bold text-xs border border-warm-200 transition-all cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid de Cards */}
            {filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((res, index) => {
                        const originalIndex = items.findIndex(it => it.id === res.id);
                        const cardIndex = originalIndex >= 0 ? originalIndex : index;

                        return (
                            <Tilt3DCard key={res.id} maxTilt={5}>
                                <div className="p-7 rounded-3xl bg-white border border-warm-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full group relative">
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
                                        {/* Barra Superior do Card (Categoria e Tipo) */}
                                        <div className="flex items-center justify-between gap-2 mb-4 pr-6 flex-wrap">
                                            {isEditing ? (
                                                <div className="flex items-center gap-1.5">
                                                    {/* Seletor de Categoria */}
                                                    <select
                                                        value={res.category}
                                                        onChange={(e) => handleUpdateItem(cardIndex, 'category', e.target.value)}
                                                        className="text-[11px] font-bold px-2 py-1 rounded-lg border bg-primary/10 border-primary/20 text-primary outline-none cursor-pointer"
                                                        title="Mudar categoria deste material"
                                                    >
                                                        {availableCategories.map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>

                                                    {/* Seletor de Tipo */}
                                                    <select
                                                        value={res.type}
                                                        onChange={(e) => handleUpdateItem(cardIndex, 'type', e.target.value)}
                                                        className="text-[11px] font-medium px-2 py-1 rounded-lg border bg-warm-50 border-warm-200 text-warm-700 outline-none cursor-pointer"
                                                        title="Tipo do arquivo/documento"
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
                                                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${res.badgeColor || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                                                        {res.category}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-warm-500 bg-warm-100 px-2 py-0.5 rounded-full">
                                                        {res.type}
                                                    </span>
                                                </div>
                                            )}

                                            <span
                                                contentEditable={isEditing}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => handleUpdateItem(cardIndex, 'year', e.currentTarget.innerText)}
                                                className={`text-xs font-bold text-warm-400 ${editableClass}`}
                                            >
                                                {res.year}
                                            </span>
                                        </div>

                                        <h3
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'title', e.currentTarget.innerText)}
                                            className={`font-extrabold text-lg text-warm-900 mb-2 group-hover:text-primary transition-colors leading-snug ${editableClass}`}
                                        >
                                            {res.title}
                                        </h3>

                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'author', e.currentTarget.innerText)}
                                            className={`text-xs font-semibold text-primary mb-3 ${editableClass}`}
                                        >
                                            {res.author}
                                        </p>

                                        <p
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleUpdateItem(cardIndex, 'description', e.currentTarget.innerText)}
                                            className={`text-warm-600 text-xs sm:text-sm leading-relaxed font-light mb-6 line-clamp-3 ${editableClass}`}
                                        >
                                            {res.description}
                                        </p>
                                    </div>

                                    {isEditing ? (
                                        <div className="pt-2 border-t border-warm-100">
                                            <label className="block text-[10px] font-bold text-warm-500 mb-1">Link de Acesso (URL):</label>
                                            <input
                                                type="text"
                                                value={res.url}
                                                onChange={(e) => handleUpdateItem(cardIndex, 'url', e.target.value)}
                                                placeholder="https://..."
                                                className="w-full text-xs bg-warm-50 border border-warm-200 rounded-lg px-2 py-1.5 font-mono text-warm-700 outline-none"
                                            />
                                        </div>
                                    ) : (
                                        <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-warm-50 hover:bg-primary hover:text-white text-warm-800 rounded-xl font-bold text-xs border border-warm-200 hover:border-primary transition-all duration-300 shadow-2xs"
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
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-warm-300">
                    <FileText size={40} className="mx-auto text-warm-400 mb-3" />
                    <p className="text-warm-700 font-bold">
                        {items.length === 0 ? 'Nenhum material cadastrado na biblioteca ainda.' : `Nenhum material encontrado em "${selectedCategory}".`}
                    </p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => handleAddItem(selectedCategory !== 'Todas' ? selectedCategory : 'Diretrizes')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
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
