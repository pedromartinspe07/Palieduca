import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import type { BlockData } from '../components/cms/blocks/types';
import BotanicalBackground from '../components/effects/BotanicalBackground';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface BibliotecaProps {
    isEditing?: boolean;
    initialContent?: any;
    onContentChange?: (content: any) => void;
}

const Biblioteca: React.FC<BibliotecaProps> = ({ isEditing, initialContent }) => {
    const [blocks, setBlocks] = useState<BlockData[] | null>(null);
    const [loading, setLoading] = useState(!initialContent);

    useEffect(() => {
        if (isEditing) {
            setLoading(false);
        } else if (!initialContent) {
            fetch(`${API_URL}/api/v1/cms/pages/biblioteca`)
                .then(res => res.json())
                .then(data => {
                    try {
                        const parsed = JSON.parse(data.content || '[]');
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setBlocks(parsed);
                        } else {
                            setBlocks([
                                {
                                    id: 'block-library-1',
                                    type: 'LibraryBlock',
                                    data: {
                                        title: 'Biblioteca Virtual & Acadêmica',
                                        subtitle: 'Acesse manuais científicos, diretrizes clínicas, escalas validadas e materiais complementares em Cuidados Paliativos.',
                                        categories: ['Todas', 'Diretrizes', 'Manuais', 'Escalas', 'Artigos'],
                                        items: []
                                    }
                                }
                            ]);
                        }
                    } catch {
                        setBlocks([
                            {
                                id: 'block-library-1',
                                type: 'LibraryBlock',
                                data: {
                                    title: 'Biblioteca Virtual & Acadêmica',
                                    subtitle: 'Acesse manuais científicos, diretrizes clínicas, escalas validadas e materiais complementares em Cuidados Paliativos.',
                                    categories: ['Todas', 'Diretrizes', 'Manuais', 'Escalas', 'Artigos'],
                                    items: []
                                }
                            }
                        ]);
                    }
                })
                .catch(err => console.error("Erro ao carregar a página:", err))
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
            id: 'block-library-1',
            type: 'LibraryBlock',
            data: {
                title: 'Biblioteca Virtual & Acadêmica',
                subtitle: 'Acesse manuais científicos, diretrizes clínicas, escalas validadas e materiais complementares em Cuidados Paliativos.',
                categories: ['Todas', 'Diretrizes', 'Manuais', 'Escalas', 'Artigos'],
                items: []
            }
        }
    ];

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <main className="max-w-7xl mx-auto">
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
        </BotanicalBackground>
    );
};

export default Biblioteca;
