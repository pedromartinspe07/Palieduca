import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { InteractiveResourceRenderer } from '../components/InteractiveResourceRenderer';
import { CanvasRenderer } from '../components/cms/canvas/CanvasRenderer';
import '../index.css';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const ModuleViewer: React.FC = () => {
    const { slug_id } = useParams<{ slug_id: string }>();
    const navigate = useNavigate();
    const [elements, setElements] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [moduleInfo, setModuleInfo] = useState<any>(null);

    const fetchModuleData = useCallback(async () => {
        setLoading(true);
        try {
            const modsRes = await fetch(`${API_URL}/api/modules`);
            if (modsRes.ok) {
                const modules = await modsRes.json();
                const currentMod = modules.find((m: any) => m.slug_id === slug_id);
                if (currentMod) {
                    setModuleInfo(currentMod);
                }
            }

            const pageRes = await fetch(`${API_URL}/api/v1/cms/pages/modulo_${slug_id}`);
            if (pageRes.ok) {
                const data = await pageRes.json();
                try {
                    setElements(JSON.parse(data.content || '[]'));
                } catch (e) {
                    setElements([]);
                }
            }

            const recRes = await fetch(`${API_URL}/api/modules/${slug_id}/resources`);
            if (recRes.ok) {
                setResources(await recRes.json());
            }
        } catch (error) {
            console.error("Erro ao buscar dados do módulo:", error);
        } finally {
            setLoading(false);
        }
    }, [slug_id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchModuleData();
    }, [slug_id, fetchModuleData]);
    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-warm-50">
                <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-12 bg-warm-50">
            <div className="max-w-4xl mx-auto px-4">
                <button 
                    onClick={() => navigate('/modulos')}
                    className="mb-8 flex items-center gap-2 text-warm-600 hover:text-primary transition-colors font-medium bg-white px-4 py-2 rounded-xl border border-warm-200 shadow-sm"
                >
                    <ArrowLeft size={20} />
                    Voltar para Trilhas
                </button>

                <div className="glassmorphism p-8 md:p-12 rounded-3xl border border-warm-200 shadow-xl bg-white mb-12">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-warm-100">
                        <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-warm-900">
                                {moduleInfo ? moduleInfo.title : 'Conteúdo do Módulo'}
                            </h1>
                            {moduleInfo && (
                                <p className="text-warm-500 mt-2">{moduleInfo.description}</p>
                            )}
                        </div>
                    </div>
                    
                    {elements && elements.length > 0 ? (
                        <div className="w-full">
                            <CanvasRenderer elements={elements} />
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-warm-50 rounded-2xl border border-dashed border-warm-300">
                            <p className="text-warm-600 text-lg">
                                O conteúdo teórico deste módulo ainda está em construção.
                            </p>
                        </div>
                    )}
                </div>

                {/* Renderizador de Recursos Interativos */}
                {resources.length > 0 && (
                    <div className="mt-16 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="text-purple-500" size={28} />
                            <h2 className="text-2xl font-bold text-warm-900">Atividades e Materiais Complementares</h2>
                        </div>
                        <div className="flex flex-col gap-8">
                            {resources.map(resource => (
                                <InteractiveResourceRenderer key={resource.id} resource={resource} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ModuleViewer;
