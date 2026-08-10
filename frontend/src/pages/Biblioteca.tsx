import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface BibliotecaProps {
    previewContent?: string;
}

const Biblioteca: React.FC<BibliotecaProps> = ({ previewContent }) => {
    const [content, setContent] = useState(previewContent || '');
    const [loading, setLoading] = useState(!previewContent);

    useEffect(() => {
        if (previewContent !== undefined) {
            setContent(previewContent);
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/api/pages/biblioteca`)
            .then(res => res.json())
            .then(data => setContent(data.content || '<p>Conteúdo não encontrado.</p>'))
            .catch(err => {
                console.error("Erro ao carregar a página:", err);
                setContent('<p>Erro ao carregar a página.</p>');
            })
            .finally(() => setLoading(false));
    }, [previewContent]);

    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <BookOpen size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-warm-900">Biblioteca</h1>
                </div>

                <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-warm-200 shadow-sm min-h-[50vh]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <div 
                            className="rich-text-content prose prose-warm max-w-none 
                                       prose-headings:text-warm-900 prose-headings:font-bold
                                       prose-p:text-warm-700 prose-p:leading-relaxed
                                       prose-a:text-primary hover:prose-a:text-secondary
                                       prose-img:rounded-xl prose-img:shadow-md"
                            dangerouslySetInnerHTML={{ __html: content }} 
                        />
                    )}
                </div>
            </div>
        </main>
    );
};

export default Biblioteca;
