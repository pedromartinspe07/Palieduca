import React from 'react';
import HeroSection from '../components/HeroSection';
import ModuleCard from '../components/ModuleCard';
import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale } from 'lucide-react';

const homeModules = [
    {
        id: "fundamentos",
        title: "Módulo 1 - Fundamentos",
        description: "Conceitos, História, Princípios, Elegibilidade, Mitos e verdades sobre os cuidados paliativos.",
        icon: <Stethoscope size={24} />,
        progress: 100,
        resources: ["Vídeo", "Infográfico", "Quiz"],
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
        delay: 0.1
    },
    {
        id: "comunicacao",
        title: "Módulo 2 - Comunicação",
        description: "Comunicação terapêutica, Escuta ativa, Notícias difíceis e Relação com a família do paciente.",
        icon: <Users size={24} />,
        progress: 35,
        resources: ["Simulações", "Casos", "Feedback"],
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800",
        delay: 0.2
    },
    {
        id: "sintomas",
        title: "Módulo 3 - Controle de Sintomas",
        description: "Manejo da Dor, Dispneia, Náuseas, Delirium, Fadiga e outras complicações.",
        icon: <HeartPulse size={24} />,
        progress: 0,
        resources: ["Fluxogramas", "Flashcards"],
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
        delay: 0.3
    },
    {
        id: "cuidados-enfermagem",
        title: "Módulo 4 - Cuidados de Enfermagem",
        description: "Processo de Enfermagem, Diagnósticos, Intervenções e Planejamento.",
        icon: <Brain size={24} />,
        progress: 0,
        resources: ["Casos Clínicos", "Simulações"],
        image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800",
        delay: 0.4
    },
    {
        id: "familia-cuidador",
        title: "Módulo 5 - Família e Cuidador",
        description: "Sobrecarga, Apoio familiar, Educação em saúde e o Luto antecipatório.",
        icon: <HeartHandshake size={24} />,
        progress: 0,
        resources: ["Podcasts", "Vídeos"],
        image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=800",
        delay: 0.5
    },
    {
        id: "bioetica",
        title: "Módulo 6 - Bioética",
        description: "Autonomia, Beneficência, Não maleficência, Justiça e Diretivas antecipadas.",
        icon: <Scale size={24} />,
        progress: 0,
        resources: ["Casos Éticos", "Reflexões"],
        image: "https://images.unsplash.com/photo-1527613426406-03513364f783?auto=format&fit=crop&q=80&w=800",
        delay: 0.6
    }
];

const Home: React.FC = () => {
    return (
        <main>
            <HeroSection />

            <section className="py-24 bg-background relative z-10" id="trilha">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-warm-900 mb-5">Trilha de Aprendizagem</h2>
                        <p className="text-lg text-warm-700 max-w-2xl mx-auto font-light">
                            Siga os módulos projetados para construir seu conhecimento passo a passo, aliando a teoria à prática humanizada integrativa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {homeModules.map(module => (
                            <ModuleCard key={module.id} {...module} />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
