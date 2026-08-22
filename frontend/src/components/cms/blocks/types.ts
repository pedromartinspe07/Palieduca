export interface BlockData {
    id: string;
    type: 'HeroBlock' | 'ModulesGridBlock' | 'TextBlock' | 'SpacerBlock' | 'ImageBlock' | 'QuizBlock' | 'FlashcardBlock' | 'MediaBlock' | 'FeatureCardsBlock' | 'HeaderBlock';
    data: any;
    styles?: Record<string, any>;
}

export interface BlockProps {
    block: BlockData;
    isEditing: boolean;
    isSelected: boolean;
    onUpdate: (id: string, updates: Partial<BlockData>) => void;
    onSelect: (id: string) => void;
}
