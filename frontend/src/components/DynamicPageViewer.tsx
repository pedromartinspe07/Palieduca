import React, { useState, useEffect } from 'react';
import BlockRenderer from './cms/blocks/BlockRenderer';
import type { BlockData } from './cms/blocks/types';
import { Loader2 } from 'lucide-react';

const API_URL =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'
        : 'https://palieduca.onrender.com');

interface DynamicPageViewerProps {
    pageId: string;
}

const DynamicPageViewer: React.FC<DynamicPageViewerProps> = ({ pageId }) => {
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the published page content
                // Based on previous contexts, published content is usually fetched via /api/v1/cms/pages/ or /api/pages/:pageId
                const res = await fetch(`${API_URL}/api/pages/${pageId}`);
                
                if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

                const data = await res.json();
                const contentToParse = data.content || '';
                
                let parsed = [];
                try {
                    parsed = JSON.parse(contentToParse);
                    if (!Array.isArray(parsed)) {
                        parsed = [];
                    }
                } catch (e) {
                    parsed = [];
                }
                
                setBlocks(parsed);
            } catch (err) {
                console.error('Erro ao buscar página dinâmica:', err);
                setError('Não foi possível carregar o conteúdo da página.');
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [pageId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[400px] text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    if (blocks.length === 0) {
        return null;
    }

    return (
        <div className="w-full flex flex-col gap-0 pb-20">
            {blocks.map((block) => (
                <BlockRenderer 
                    key={block.id}
                    block={block}
                    isEditing={false}
                    isSelected={false}
                    onUpdate={() => {}}
                    onSelect={() => {}}
                />
            ))}
        </div>
    );
};

export default DynamicPageViewer;
