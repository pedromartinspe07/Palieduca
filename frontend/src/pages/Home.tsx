import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ModuleCard from '../components/ModuleCard';
import ModuleCardSkeleton from '../components/ModuleCardSkeleton';
import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale, Loader2 } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import type { BlockData } from '../components/cms/blocks/types';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const iconMap: Record<string, React.ReactNode> = {
    'Stethoscope': <Stethoscope size={24} />,
    'Users': <Users size={24} />,
    'HeartPulse': <HeartPulse size={24} />,
    'Brain': <Brain size={24} />,
    'HeartHandshake': <HeartHandshake size={24} />,
    'Scale': <Scale size={24} />
};

interface ModuleData {
    id: number;
    slug_id: string;
    title: string;
    description: string;
    icon_name: string;
    progress: number;
    resources: string;
    image_url: string;
    delay: number;
}

const Home: React.FC = () => {
    const [loadingCMS, setLoadingCMS] = useState(true);
    const [blocks, setBlocks] = useState<BlockData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState<ModuleData[]>([]);

    useEffect(() => {
        // Fetch CMS Content
        fetch(`${API_URL}/api/pages/home`)
            .then(res => res.json())
            .then(data => {
                if (data && data.content) {
                    try {
                        const parsed = JSON.parse(data.content);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setBlocks(parsed);
                        }
                    } catch (e) {
                        console.error("Erro ao parsear blocks", e);
                    }
                }
            })
            .catch(err => console.error("Erro ao carregar CMS:", err))
            .finally(() => setLoadingCMS(false));

        // Fetch Modules (for fallback)
        fetch(`${API_URL}/api/modules`)
            .then(res => res.json())
            .then(data => setModules(data))
            .catch(err => console.error("Erro ao carregar módulos:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loadingCMS) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (blocks && blocks.length > 0) {
        return (
            <main className="min-h-screen pb-20 bg-background overflow-x-hidden pt-20">
                {blocks.map(block => (
                    <BlockRenderer key={block.id} block={block} isEditing={false} onUpdate={() => {}} onSelect={() => {}} isSelected={false} />
                ))}
            </main>
        );
    }

    return (
        <main>
            <HeroSection />

            <section className="py-20 bg-warm-50 relative z-10 border-y border-warm-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-primary text-sm font-medium mb-6 shadow-sm border border-warm-100">
                        <span>Produto de Tese de Doutorado</span>
                    </div>
                    <h2 className="text-3xl font-bold text-warm-900 mb-6">Sobre o Projeto Palieduca</h2>
                    <p className="text-lg text-warm-700 leading-relaxed font-light mb-8">
                        O Palieduca é um Ambiente Virtual de Aprendizagem desenvolvido no âmbito do <strong>Programa de Pós-Graduação em Enfermagem da UFPB</strong>. O objetivo científico desta plataforma é para capacitar profissionais e estudantes nas melhores práticas e humanização dos Cuidados Paliativos.
                    </p>
                </div>
            </section>

            <section className="py-24 bg-background relative z-10" id="trilha">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-warm-900 mb-5">Trilha de Aprendizagem</h2>
                        <p className="text-lg text-warm-700 max-w-2xl mx-auto font-light">
                            Siga os módulos projetados para construir seu conhecimento passo a passo, aliando a teoria à prática humanizada.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                            : modules.map((module, idx) => {
                                const levels = ['Fundamentos', 'Comunicação', 'Controle de Sintomas', 'Apoio & Família', 'Acolhimento', 'Bioética & Decisões'];
                                const times = [15, 20, 25, 20, 15, 30];
                                return (
                                    <div id={module.slug_id} key={module.id} className="scroll-mt-24">
                                        <ModuleCard 
                                            id={module.slug_id}
                                            title={module.title}
                                            description={module.description}
                                            icon={iconMap[module.icon_name] || <Stethoscope size={24} />}
                                            progress={module.progress}
                                            resources={module.resources.split(',').map(s => s.trim())}
                                            image={module.image_url}
                                            delay={(module.delay || idx * 1.5) / 10}
                                            level={levels[idx % levels.length]}
                                            estimatedMinutes={times[idx % times.length]}
                                        />
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
