import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ModuleCard from '../components/ModuleCard';
import ModuleCardSkeleton from '../components/ModuleCardSkeleton';
import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale, Loader2, Leaf } from 'lucide-react';
import BlockRenderer from '../components/cms/blocks/BlockRenderer';
import type { BlockData } from '../components/cms/blocks/types';
import BotanicalBackground from '../components/effects/BotanicalBackground';

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
            <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-20 pb-12">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {blocks.map(block => (
                        <BlockRenderer key={block.id} block={block} isEditing={false} onUpdate={() => { }} onSelect={() => { }} isSelected={false} />
                    ))}
                </main>
            </BotanicalBackground>
        );
    }

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true}>
            <main>
                <HeroSection />

                {/* Sobre o Projeto */}
                <section className="py-16 px-4 max-w-5xl mx-auto relative z-10">
                    <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-2xl text-center relative overflow-hidden">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 font-bold text-xs mb-5 shadow-2xs">
                            <Leaf size={13} className="text-teal-600" />
                            <span>Produto de Tese de Doutorado</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mb-4 tracking-tight font-display">
                            Sobre o Projeto <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#0f766e]">PaliEduca</span>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light max-w-3xl mx-auto">
                            O PaliEduca é um Ambiente Virtual de Aprendizagem desenvolvido no âmbito do <strong className="font-bold text-teal-800">Programa de Pós-Graduação em Enfermagem da UFPB</strong>. O objetivo científico desta plataforma é capacitar profissionais e estudantes nas melhores práticas e na humanização dos Cuidados Paliativos.
                        </p>
                    </div>
                </section>

                {/* Trilha de Aprendizagem (Cards) */}
                <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10" id="trilha">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3.5 py-1 rounded-full">
                            Trilhas de Aprendizagem
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mt-3 mb-3">
                            Explore Nossos Módulos
                        </h2>
                        <p className="text-slate-600 text-sm max-w-2xl mx-auto font-light">
                            Siga os módulos projetados para construir seu conhecimento passo a passo, aliando a teoria à prática humanizada.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <ModuleCardSkeleton key={i} />)
                            : modules.map((module, idx) => {
                                const levels = ['Fundamentos', 'Comunicação', 'Controle de Sintomas', 'Apoio & Família', 'Acolhimento', 'Bioética & Decisões'];
                                const times = [15, 20, 25, 20, 15, 30];
                                return (
                                    <div id={module.slug_id} key={module.id} className="scroll-mt-28">
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
                </section>
            </main>
        </BotanicalBackground>
    );
};

export default Home;
