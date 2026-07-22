import React from 'react';
import {
    BookOpen,
    Users,
    BrainCircuit,
    HeartHandshake,
    MessageSquare,
    Activity,
    HeartPulse,
    Scale,
    Sparkles,
    Quote
} from 'lucide-react';

interface ModuleItem {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    color: string;
    badge: string;
}

const modulesList: ModuleItem[] = [
    {
        id: 'fundamentos',
        title: 'Fundamentos dos Cuidados Paliativos',
        description: 'Princípios, conceitos, história e diretrizes que norteiam os cuidados paliativos, compreendendo sua importância para a promoção da qualidade de vida de pessoas com doenças ameaçadoras da vida e de seus familiares.',
        icon: HeartHandshake,
        color: 'bg-sage-100 text-primary border-sage-200',
        badge: 'Módulo 1'
    },
    {
        id: 'comunicacao',
        title: 'Comunicação',
        description: 'Habilidades de comunicação terapêutica e empática para estabelecer relações de confiança com pacientes, familiares e equipe multiprofissional, favorecendo o cuidado centrado na pessoa.',
        icon: MessageSquare,
        color: 'bg-warm-100 text-secondary border-warm-200',
        badge: 'Módulo 2'
    },
    {
        id: 'sintomas',
        title: 'Controle de Sintomas',
        description: 'Avaliação e manejo dos principais sintomas físicos, psicológicos, sociais e espirituais, utilizando abordagens baseadas em evidências para o alívio do sofrimento.',
        icon: Activity,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'Módulo 3'
    },
    {
        id: 'enfermagem',
        title: 'Cuidados de Enfermagem',
        description: 'O processo de enfermagem em cuidados paliativos, explorando intervenções voltadas à assistência integral, humanizada e segura em diferentes cenários de cuidado.',
        icon: HeartPulse,
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'Módulo 4'
    },
    {
        id: 'familia',
        title: 'Família e Cuidador',
        description: 'Importância da participação da família e dos cuidadores no processo de cuidado, compreendendo estratégias de acolhimento, suporte e acompanhamento durante a trajetória da doença e no período de luto.',
        icon: Users,
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        badge: 'Módulo 5'
    },
    {
        id: 'bioetica',
        title: 'Bioética',
        description: 'Princípios bioéticos que orientam a prática em cuidados paliativos, fortalecendo a tomada de decisão compartilhada, o respeito à autonomia, à dignidade humana e aos valores das pessoas assistidas.',
        icon: Scale,
        color: 'bg-sky-50 text-sky-800 border-sky-200',
        badge: 'Módulo 6'
    }
];

const Apresentacao: React.FC = () => {
    return (
        <main className="pt-24 pb-20 overflow-hidden">
            {/* Banner de Boas-Vindas */}
            <section className="relative bg-gradient-to-b from-warm-50 via-warm-100/40 to-background py-16 lg:py-24 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-sage-200/30 rounded-full blur-3xl animate-subtle-float" />
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-warm-300/30 rounded-full blur-3xl animate-subtle-float" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-warm-200 text-primary font-medium text-sm mb-6 shadow-sm">
                        <Sparkles size={16} className="text-secondary" />
                        <span>Ambiente Virtual de Aprendizagem</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-warm-900 mb-6 tracking-tight">
                        Apresentação
                    </h1>

                    <p className="text-lg sm:text-xl text-warm-800 leading-relaxed font-light glassmorphism p-6 sm:p-8 rounded-3xl border border-white/80 shadow-lg">
                        Bem-vindo(a) ao <strong className="font-semibold text-primary">Palieduca</strong>! Este website foi desenvolvido para apoiar o processo de ensino e aprendizagem em cuidados paliativos, proporcionando um ambiente virtual interativo, fundamentado na Teoria da Interação Social de Vygotsky e no modelo metodológico proposto por Falkembach.
                    </p>
                </div>
            </section>

            {/* Seção "Explore os Módulos de Aprendizagem" */}
            <section id="modulos" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-24">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-warm-900 mb-4">
                        Explore os Módulos de Aprendizagem
                    </h2>
                    <p className="text-warm-700 text-base sm:text-lg">
                        Conheça as áreas temáticas essenciais estruturadas para guiar seu percurso formativo em cuidados paliativos.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {modulesList.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="glassmorphism-card p-6 sm:p-7 rounded-2xl flex flex-col justify-between interactive-btn group border border-warm-100/80 bg-white/90 hover:border-primary/30"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`p-3.5 rounded-2xl ${item.color} border shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent size={26} />
                                        </div>
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-warm-100 text-warm-800 border border-warm-200">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xl text-warm-900 mb-3 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-warm-700 text-sm leading-relaxed font-normal">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Público-alvo */}
            <section id="publico-alvo" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-24">
                <h2 className="text-3xl font-bold text-warm-900 mb-10 text-center">Público-alvo</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Estudantes", desc: "Graduação em Enfermagem em busca de conhecimento prático.", icon: <BookOpen className="text-secondary" size={32} /> },
                        { title: "Professores", desc: "Docentes buscando material de apoio e metodologias ativas.", icon: <BrainCircuit className="text-primary" size={32} /> },
                        { title: "Profissionais", desc: "Enfermeiros e equipe da saúde visando atualização técnica.", icon: <Users className="text-sage-600" size={32} /> },
                    ].map(item => (
                        <div key={item.title} className="glassmorphism-card p-6 flex flex-col items-center text-center rounded-2xl">
                            <div className="p-4 bg-warm-50 rounded-full mb-4">{item.icon}</div>
                            <h3 className="font-bold text-lg text-warm-900">{item.title}</h3>
                            <p className="text-warm-700 mt-2">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Fundamentação Teórica */}
            <section id="fundamentacao" className="py-16 px-4 bg-warm-50/70 border-y border-warm-100 scroll-mt-24">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-warm-900 mb-10 text-center">Fundamentação Teórica</h2>
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        <div className="glassmorphism p-8 rounded-2xl border border-warm-100 bg-white/80">
                            <h3 className="text-xl font-bold text-primary mb-4 border-b border-primary/20 pb-3">L. S. Vygotsky (1896–1934)</h3>
                            <p className="text-warm-700 leading-relaxed">
                                A Teoria Histórico-Cultural postula que a aprendizagem ocorre através da interação social e da mediação.
                                A Zona de Desenvolvimento Proximal (ZDP) é central no nosso modelo, permitindo que o aluno alcance seu
                                potencial através da interação com casos clínicos e a tutoria (feedback direcionado).
                            </p>
                        </div>
                        <div className="glassmorphism p-8 rounded-2xl border border-warm-100 bg-white/80">
                            <h3 className="text-xl font-bold text-secondary mb-4 border-b border-secondary/20 pb-3">E. M. Falkembach (2005)</h3>
                            <p className="text-warm-700 leading-relaxed">
                                O modelo metodológico de Falkembach nos direciona na construção de ambientes virtuais de aprendizagem
                                como forma de apoiar a construção autônoma de trajetos e a reflexão crítica. Os recursos digitais
                                são desenhados para não apenas informar, mas transformar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipe Responsável */}
            <section id="equipe" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-24">
                <h2 className="text-3xl font-bold text-warm-900 mb-10 text-center">Equipe Responsável</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Patricia Maria de Oliveira Andrade",
                            role: "Doutoranda em Enfermagem (UFPB)",
                            desc: "Idealizadora do projeto e pesquisadora em cuidados paliativos."
                        },
                        {
                            name: "Pedro Martins de Araújo Neto",
                            role: "Acadêmico de Eng. da Computação",
                            desc: "Desenvolvedor frontend e analista de UI/UX."
                        },
                        {
                            name: "Carlos Eduardo Rodrigues dos Santos",
                            role: "Analista de Sistemas",
                            desc: "Arquiteto de software e desenvolvedor de infraestrutura (Backend/DevOps)."
                        }
                    ].map(member => (
                        <div key={member.name} className="relative p-6 bg-white border border-warm-100 shadow-sm rounded-2xl text-center group interactive-btn hover:shadow-md">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-full mb-4 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {member.name.charAt(0)}
                            </div>
                            <h3 className="font-bold text-warm-900">{member.name}</h3>
                            <p className="text-sm font-medium text-primary mt-1 mb-3">{member.role}</p>
                            <p className="text-xs text-warm-600 leading-relaxed">{member.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mensagem Inspiradora de Fechamento / Rodapé da Apresentação */}
            <section className="py-16 px-4 max-w-5xl mx-auto">
                <div className="relative glassmorphism p-8 sm:p-12 rounded-3xl border border-warm-200 bg-gradient-to-br from-white/90 via-warm-50/80 to-sage-50/90 shadow-xl overflow-hidden text-center">
                    <div className="absolute top-4 left-6 text-warm-300 opacity-40">
                        <Quote size={56} />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="inline-flex p-3 rounded-full bg-sage-100 text-primary mb-6 shadow-xs">
                            <Sparkles size={24} />
                        </div>
                        <blockquote className="text-2xl sm:text-3xl font-bold text-warm-900 mb-6 italic leading-snug">
                            "Aprender para cuidar com competência, ética e sensibilidade."
                        </blockquote>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full" />
                        <p className="text-base sm:text-lg text-warm-700 leading-relaxed">
                            Esperamos que este ambiente virtual favoreça uma aprendizagem significativa, colaborativa e contextualizada, estimulando o protagonismo do estudante na construção do conhecimento e contribuindo para o desenvolvimento de competências necessárias à prática dos cuidados paliativos.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Apresentacao;
