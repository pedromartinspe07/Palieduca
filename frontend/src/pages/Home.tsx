import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ModuleCard from '../components/ModuleCard';
import ModuleCardSkeleton from '../components/ModuleCardSkeleton';
import { MODULES_DATA } from '../data/siteContent';

const Home: React.FC = () => {
    const [loading, setLoading] = useState(true);

    // Simulates content loading — replace with real data-fetch when modules are available
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main>
            <HeroSection />

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
                            : MODULES_DATA.map(module => (
                                <div id={module.id} key={module.id} className="scroll-mt-24">
                                    <ModuleCard {...module} />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
