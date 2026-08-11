import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface BibliotecaProps {
    isEditing?: boolean;
    initialContent?: any;
    onContentChange?: (content: any) => void;
}

const Biblioteca: React.FC<BibliotecaProps> = ({ isEditing, initialContent, onContentChange }) => {
    const [content, setContent] = useState<any>(initialContent || { 
        title: 'Biblioteca',
        intro: 'Bem-vindo à Biblioteca. Aqui você encontra materiais complementares.'
    });
    const [loading, setLoading] = useState(!initialContent);

    useEffect(() => {
        if (initialContent) setContent(initialContent);
    }, [initialContent]);

    useEffect(() => {
        if (isEditing) {
            setLoading(false);
        } else if (!initialContent) {
            fetch(`${API_URL}/api/v1/cms/pages/biblioteca`)
                .then(res => res.json())
                .then(data => {
                    try {
                        const parsed = JSON.parse(data.content || '{}');
                        if (Array.isArray(parsed)) throw new Error('Old format');
                        setContent(parsed);
                    } catch (e) {
                        setContent({
                            title: 'Biblioteca',
                            intro: 'Bem-vindo à Biblioteca. Aqui você encontra materiais complementares.'
                        });
                    }
                })
                .catch(err => {
                    console.error("Erro ao carregar a página:", err);
                })
                .finally(() => setLoading(false));
        }
    }, [isEditing, initialContent]);

    const handleTextChange = (field: string, text: string) => {
        const newContent = { ...content, [field]: text };
        setContent(newContent);
        if (onContentChange) onContentChange(newContent);
    };

    const editableClass = isEditing ? 'outline-dashed outline-2 outline-primary/50 outline-offset-4 cursor-text hover:bg-warm-100/50 transition-colors rounded' : '';

    return (
        <main className={`min-h-screen pt-32 pb-20 px-4 ${isEditing ? 'pointer-events-auto' : ''}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                        <BookOpen size={28} />
                    </div>
                    <h1 
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                        className={`text-3xl font-bold text-warm-900 ${editableClass}`}
                    >
                        {content.title || 'Biblioteca'}
                    </h1>
                </div>

                <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-warm-200 shadow-sm min-h-[50vh]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <div className="prose prose-warm max-w-none">
                            <p 
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleTextChange('intro', e.currentTarget.innerText)}
                                className={`text-lg text-warm-700 ${editableClass}`}
                            >
                                {content.intro || 'Bem-vindo à Biblioteca. Aqui você encontra materiais complementares.'}
                            </p>
                            {/* The rest of the dynamic library content will be rendered here by other components later */}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Biblioteca;
