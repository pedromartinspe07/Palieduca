export interface BlockData {
    id: string;
    type: 'HeroBlock' | 'ModulesGridBlock';
    data: any;
}

export interface BlockProps {
    block: BlockData;
    isEditing: boolean;
    isSelected: boolean;
    onUpdate: (id: string, newData: any) => void;
    onSelect: (id: string) => void;
}
