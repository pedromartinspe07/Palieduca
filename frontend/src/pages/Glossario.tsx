import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import type { BlockData } from '../components/cms/blocks/types';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface GlossarioProps {
    isEditing?: boolean;
    initialContent?: any;
    onContentChange?: (content: any) => void;
}

const Glossario: React.FC<GlossarioProps> = ({ isEditing, initialContent }) => {
    const [blocks, setBlocks] = useState<BlockData[] | null>(null);
    const [loading, setLoading] = useState(!initialContent);

    useEffect(() => {
        if (isEditing) {
            setLoading(false);
        } else if (!initialContent) {
            fetch(`${API_URL}/api/v1/cms/pages/glossario`)
                .then(res => res.json())
                .then(data => {
                    try {
                        const parsed = JSON.parse(data.content || '[]');
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setBlocks(parsed);
                        } else {
                            // Default clean GlossaryBlock with no mock items
                            setBlocks([
                                {
                                    id: 'block-glossary-1',
                                    type: 'GlossaryBlock',
                                    data: {
                                        title: 'Glossário de Cuidados Paliativos',
                                        subtitle: 'Consulte os principais termos, conceitos bioéticos e definições fundamentais para a prática humanizada.',
                                        terms: []
                                    }
                                }
                            ]);
                        }
                    } catch {
                        setBlocks([
                            {
                                id: 'block-glossary-1',
                                type: 'GlossaryBlock',
                                data: {
                                    title: 'Glossário de Cuidados Paliativos',
                                    subtitle: 'Consulte os principais termos, conceitos bioéticos e definições fundamentais para a prática humanizada.',
                                    terms: []
                                }
                            }
                        ]);
                    }
                })
                .catch(err => console.error("Erro ao carregar o glossário:", err))
                .finally(() => setLoading(false));
        }
    }, [isEditing, initialContent]);

    if (loading) {
        return (
            <main className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={40} />
            </main>
        );
    }

    const blocksToRender = blocks || [
        {
            id: 'block-glossary-1',
            type: 'GlossaryBlock',
            data: {
                title: 'Glossário de Cuidados Paliativos',
                subtitle: 'Consulte os principais termos, conceitos bioéticos e definições fundamentais para a prática humanizada.',
                terms: []
            }
        }
    ];

    return (
        <main className="min-h-screen pb-20 bg-background overflow-x-hidden pt-28 px-4">
            {blocksToRender.map(block => (
                <BlockRenderer 
                    key={block.id} 
                    block={block} 
                    isEditing={false} 
                    onUpdate={() => {}} 
                    onSelect={() => {}} 
                    isSelected={false} 
                />
            ))}
        </main>
    );
};

export default Glossario;
