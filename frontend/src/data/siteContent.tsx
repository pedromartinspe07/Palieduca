import { Stethoscope, Users, HeartPulse, Brain, HeartHandshake, Scale } from 'lucide-react';

// Single source of truth for modules content across the whole app
export const MODULES_DATA = [
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
        image: "https://unifor.br/documents/392178/0/Banner-Desktop-Cuidados-Paliativos.png/8b1e42fd-2446-fdaf-cfca-566210970750?t=1722532725751",
        delay: 0.6
    }
];

export const PRESENTATION_SECTIONS = [
    {
        id: "publico-alvo",
        title: "Público-alvo",
        description: "Estudantes, Professores e Profissionais de Enfermagem em busca de evolução e metodologias ativas."
    },
    {
        id: "fundamentacao",
        title: "Fundamentação Teórica (Vygotsky e Falkembach)",
        description: "Teoria Histórico-Cultural da mediação (Vygotsky) e modelo estruturante de ambientes de aprendizagem (Falkembach)."
    },
    {
        id: "equipe",
        title: "Equipe Responsável",
        description: "Conheça Patricia Andrade (idealizadora), Pedro Martins e Carlos Eduardo, a equipe criadora do PaliEduca."
    }
];
