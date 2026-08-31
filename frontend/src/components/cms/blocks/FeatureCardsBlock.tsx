import React, { useState } from 'react';
import type { BlockProps } from './types';
import { RenderIcon } from '../IconHelper';
import IconPickerModal from '../IconPickerModal';
import { Plus, Trash2 } from 'lucide-react';

interface FeatureCardItem {
    id: string;
    icon_name: string;
    iconColor?: string;
    iconBg?: string;
    badge?: string;
    title: string;
    description: string;
}

const DEFAULT_CARDS: FeatureCardItem[] = [
    {
        id: '1',
        icon_name: 'HeartHandshake',
        iconColor: '#059669',
        iconBg: '#ecfdf5',
        badge: 'Módulo 1',
        title: 'Fundamentos dos Cuidados Paliativos',
        description: 'Princípios, conceitos, história e diretrizes que norteiam os cuidados paliativos e assistência humanizada.'
    },
    {
        id: '2',
        icon_name: 'MessageSquare',
        iconColor: '#d97706',
        iconBg: '#fef3c7',
        badge: 'Módulo 2',
        title: 'Comunicação Empática',
        description: 'Habilidades de comunicação terapêutica para estabelecer relações de confiança com pacientes e familiares.'
    },
    {
        id: '3',
        icon_name: 'HeartPulse',
        iconColor: '#2563eb',
        iconBg: '#eff6ff',
        badge: 'Módulo 3',
        title: 'Controle de Sintomas',
        description: 'Avaliação e manejo dos principais sintomas físicos, psicológicos e alívio do sofrimento com base em evidências.'
    }
];

export const FeatureCardsBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const cards: FeatureCardItem[] = block.data.cards || DEFAULT_CARDS;
    const { 
        columns = 3, 
        cardBg = '#ffffff', 
        cardBorder = true, 
        cardShadow = 'md',
        sectionTitle = '',
        sectionSubtitle = ''
    } = block.styles || {};

    const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    const handleCardChange = (index: number, field: keyof FeatureCardItem, value: any) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        onUpdate(block.id, { data: { ...block.data, cards: newCards } });
    };

    const handleAddCard = () => {
        const newCard: FeatureCardItem = {
            id: crypto.randomUUID(),
            icon_name: 'Sparkles',
            iconColor: '#7c3aed',
            iconBg: '#faf5ff',
            badge: `Item ${cards.length + 1}`,
            title: 'Novo Card com Ícone',
            description: 'Clique para editar a descrição deste card e personalizar o ícone.'
        };
        onUpdate(block.id, { data: { ...block.data, cards: [...cards, newCard] } });
    };

    const handleRemoveCard = (index: number) => {
        const newCards = [...cards];
        newCards.splice(index, 1);
        onUpdate(block.id, { data: { ...block.data, cards: newCards } });
    };

    const openIconPickerForCard = (index: number) => {
        if (!isEditing) return;
        setEditingCardIndex(index);
        setIsIconPickerOpen(true);
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            className={`relative w-full py-10 px-6 transition-all duration-200 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected
                    ? 'ring-4 ring-primary ring-inset z-10 rounded-2xl'
                    : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-2xl'
            }`}
        >
            <div className="max-w-[85rem] mx-auto">
                {/* Opcional: Título e Subtítulo da Seção */}
                {(sectionTitle || isEditing) && (
                    <div className="text-center mb-8">
                        <h2 
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => onUpdate(block.id, { styles: { ...block.styles, sectionTitle: e.currentTarget.innerText } })}
                            className="text-2xl sm:text-3xl font-bold text-warm-900 dark:text-slate-100 outline-none"
                        >
                            {sectionTitle || (isEditing ? 'Título da Seção de Cards (Opcional)' : '')}
                        </h2>
                        {(sectionSubtitle || isEditing) && (
                            <p 
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate(block.id, { styles: { ...block.styles, sectionSubtitle: e.currentTarget.innerText } })}
                                className="text-warm-600 dark:text-slate-300 text-sm mt-2 max-w-2xl mx-auto outline-none"
                            >
                                {sectionSubtitle || (isEditing ? 'Subtítulo descritivo...' : '')}
                            </p>
                        )}
                    </div>
                )}

                {/* Grid de Cards */}
                <div className={`grid grid-cols-1 ${
                    columns === 1 ? 'sm:grid-cols-1' :
                    columns === 2 ? 'sm:grid-cols-2' :
                    columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' :
                    'sm:grid-cols-2 lg:grid-cols-3'
                } gap-6`}>
                    {cards.map((card, idx) => (
                        <div
                            key={card.id || idx}
                            className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group bg-white dark:bg-slate-900/90 ${
                                cardBorder ? 'border border-warm-200 dark:border-slate-800' : ''
                            } ${
                                cardShadow === 'none' ? '' :
                                cardShadow === 'sm' ? 'shadow-sm hover:shadow-md' :
                                cardShadow === 'lg' ? 'shadow-lg hover:shadow-2xl' :
                                'shadow-md hover:shadow-xl'
                            } hover:-translate-y-1`}
                            style={{ backgroundColor: (cardBg && cardBg !== '#ffffff' && cardBg !== '#fff') ? cardBg : undefined }}
                        >
                            {/* Top row: Icon Badge & Optional Tag Badge */}
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-5">
                                    {/* Icon Badge Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                             e.stopPropagation();
                                             openIconPickerForCard(idx);
                                        }}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                            isEditing ? 'hover:scale-110 cursor-pointer shadow-sm hover:ring-2 hover:ring-primary' : ''
                                        }`}
                                        style={{ 
                                            backgroundColor: card.iconBg || '#ecfdf5', 
                                            color: card.iconColor || '#059669' 
                                        }}
                                        title={isEditing ? "Clique para mudar o ícone" : undefined}
                                    >
                                        <RenderIcon name={card.icon_name || 'Sparkles'} size={24} />
                                    </button>

                                    {/* Tag Badge (ex: Módulo 2 / Destaque) */}
                                    {(card.badge || isEditing) && (
                                        <span
                                            contentEditable={isEditing}
                                            suppressContentEditableWarning={true}
                                            onBlur={(e) => handleCardChange(idx, 'badge', e.currentTarget.innerText)}
                                            className="px-3 py-1 bg-warm-100/80 dark:bg-slate-800 text-warm-700 dark:text-slate-300 font-semibold text-xs rounded-full border border-warm-200/60 dark:border-slate-700 outline-none"
                                        >
                                            {card.badge || 'Etiqueta'}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3
                                    contentEditable={isEditing}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => handleCardChange(idx, 'title', e.currentTarget.innerText)}
                                    className="text-lg font-bold text-warm-900 dark:text-slate-50 mb-2.5 outline-none leading-snug"
                                >
                                    {card.title || 'Título do Card'}
                                </h3>

                                {/* Description */}
                                <p
                                    contentEditable={isEditing}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => handleCardChange(idx, 'description', e.currentTarget.innerText)}
                                    className="text-sm text-warm-600 dark:text-slate-300 leading-relaxed outline-none"
                                >
                                    {card.description || 'Descrição do conteúdo deste módulo ou área de conhecimento.'}
                                </p>
                            </div>

                            {/* Delete card button (only in edit mode) */}
                            {isEditing && cards.length > 1 && (
                                <div className="mt-4 pt-3 border-t border-warm-100 dark:border-slate-700 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCard(idx);
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remover este card"
                                    >
                                        <Trash2 size={13} /> Excluir Card
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add new card button in edit mode */}
                    {isEditing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddCard();
                            }}
                            className="rounded-3xl border-2 border-dashed border-warm-300 dark:border-slate-700 hover:border-primary dark:hover:border-teal-400 bg-warm-50/50 dark:bg-slate-800/40 hover:bg-primary/5 dark:hover:bg-slate-800/80 p-6 flex flex-col items-center justify-center gap-2 text-warm-500 dark:text-slate-300 hover:text-primary dark:hover:text-teal-400 transition-all min-h-[180px] group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-warm-200 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                                <Plus size={22} className="text-primary dark:text-teal-400" />
                            </div>
                            <span className="font-bold text-sm">Adicionar Novo Card</span>
                        </button>
                    )}
                </div>
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-md font-bold shadow z-20">
                    Cards com Ícones ({cards.length})
                </div>
            )}

            {/* Modal de Seleção de Ícone */}
            {isIconPickerOpen && editingCardIndex !== null && (
                <IconPickerModal
                    isOpen={isIconPickerOpen}
                    currentIcon={cards[editingCardIndex]?.icon_name}
                    currentIconColor={cards[editingCardIndex]?.iconColor}
                    currentIconBg={cards[editingCardIndex]?.iconBg}
                    onClose={() => {
                        setIsIconPickerOpen(false);
                        setEditingCardIndex(null);
                    }}
                    onSelect={(iconName, iconColor, iconBg) => {
                        if (editingCardIndex !== null) {
                            const newCards = [...cards];
                            newCards[editingCardIndex] = {
                                ...newCards[editingCardIndex],
                                icon_name: iconName,
                                ...(iconColor ? { iconColor } : {}),
                                ...(iconBg ? { iconBg } : {})
                            };
                            onUpdate(block.id, { data: { ...block.data, cards: newCards } });
                        }
                    }}
                />
            )}
        </div>
    );
};

export default FeatureCardsBlock;
