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
        delay: 0.1
    },
    {
        id: "comunicacao",
        title: "Módulo 2 - Comunicação",
        description: "Comunicação terapêutica, Escuta ativa, Notícias difíceis e Relação com a família do paciente.",
        icon: <Users size={24} />,
        progress: 35,
        resources: ["Vídeos Simulados", "Casos", "Feedback"],
        delay: 0.2
    },
    {
        id: "sintomas",
        title: "Módulo 3 - Controle de Sintomas",
        description: "Manejo da Dor, Dispneia, Náuseas, Delirium, Fadiga e outras complicações.",
        icon: <HeartPulse size={24} />,
        progress: 0,
        resources: ["Fluxogramas", "Flashcards"],
        delay: 0.3
    },
    {
        id: "cuidados-enfermagem",
        title: "Módulo 4 - Cuidados de Enfermagem",
        description: "Processo de Enfermagem, Diagnósticos, Intervenções e Planejamento.",
        icon: <Brain size={24} />,
        progress: 0,
        resources: ["Casos Clínicos", "Simulações"],
        delay: 0.4
    },
    {
        id: "familia-cuidador",
        title: "Módulo 5 - Família e Cuidador",
        description: "Sobrecarga, Apoio familiar, Educação em saúde e o Luto antecipatório.",
        icon: <HeartHandshake size={24} />,
        progress: 0,
        resources: ["Podcasts", "Vídeos"],
        delay: 0.5
    },
    {
        id: "bioetica",
        title: "Módulo 6 - Bioética",
        description: "Autonomia, Beneficência, Não maleficência, Justiça e Diretivas antecipadas.",
        icon: <Scale size={24} />,
        progress: 0,
        resources: ["Casos Éticos", "Reflexões"],
        delay: 0.6
    }
];

const Home: React.FC = () => {
    return (
        <main>
            <HeroSection />

            <section className="py-24 bg-white relative z-10" id="trilha">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">Trilha de Aprendizagem</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Siga os módulos projetados para construir seu conhecimento passo a passo, aliando a teoria e prática integrativa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
