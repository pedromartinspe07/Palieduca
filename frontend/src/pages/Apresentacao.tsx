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
    Quote,
    ArrowRight,
    Award,
    CheckCircle2,
    GraduationCap,
    Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt3DCard from '../components/3d/Tilt3DCard';
import patriciaImg from '../assets/team/patricia.png';
import pedroImg from '../assets/team/pedro.png';
import carlosImg from '../assets/team/carlos.png';

interface ModuleItem {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    color: string;
    badge: string;
    time: string;
}

const modulesList: ModuleItem[] = [
    {
        id: 'fundamentos',
        title: 'Fundamentos dos Cuidados Paliativos',
        description: 'Princípios, conceitos, história e diretrizes que norteiam os cuidados paliativos, compreendendo sua importância para a promoção da qualidade de vida de pessoas com doenças ameaçadoras da vida.',
        icon: HeartHandshake,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badge: 'Módulo 1',
        time: '15 min'
    },
    {
        id: 'comunicacao',
        title: 'Comunicação Empática & Terapêutica',
        description: 'Habilidades de comunicação compassiva para estabelecer relações de confiança com pacientes, familiares e equipe multiprofissional, favorecendo o cuidado centrado na pessoa.',
        icon: MessageSquare,
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        badge: 'Módulo 2',
        time: '20 min'
    },
    {
        id: 'sintomas',
        title: 'Controle de Sintomas & Dor Total',
        description: 'Avaliação e manejo dos principais sintomas físicos, psicológicos, sociais e espirituais, utilizando abordagens baseadas em evidências para o alívio efetivo do sofrimento.',
        icon: Activity,
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        badge: 'Módulo 3',
        time: '25 min'
    },
    {
        id: 'enfermagem',
        title: 'Assistência & Prática de Enfermagem',
        description: 'O processo de enfermagem em cuidados paliativos, explorando intervenções voltadas à assistência integral, humanizada e segura em diferentes cenários de cuidado.',
        icon: HeartPulse,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        badge: 'Módulo 4',
        time: '20 min'
    },
    {
        id: 'familia',
        title: 'Suporte à Família e ao Cuidador',
        description: 'Importância da participação da família e dos cuidadores no processo de cuidado, compreendendo estratégias de acolhimento, suporte contínuo e acompanhamento no luto.',
        icon: Users,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        badge: 'Módulo 5',
        time: '15 min'
    },
    {
        id: 'bioetica',
        title: 'Bioética & Tomada de Decisão',
        description: 'Princípios bioéticos que orientam a prática em cuidados paliativos, fortalecendo a tomada de decisão compartilhada, o respeito à autonomia e à dignidade humana.',
        icon: Scale,
        color: 'bg-teal-100 text-teal-800 border-teal-200',
        badge: 'Módulo 6',
        time: '30 min'
    }
];

const Apresentacao: React.FC = () => {
    return (
        <main className="pt-24 pb-20 overflow-hidden bg-background">
            {/* ═══ 1. HERO BANNER DE BOAS-VINDAS ═══ */}
            <section className="relative py-16 lg:py-24 px-4 overflow-hidden border-b border-warm-100">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-10 left-10 w-[30rem] h-[30rem] bg-sky-300/20 rounded-full blur-[130px] animate-subtle-float" />
                    <div className="absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full blur-[130px] animate-subtle-float" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-sky-200 text-sky-800 font-bold text-xs mb-6 shadow-xs hover:scale-105 transition-transform">
                        <Sparkles size={15} className="text-sky-500" />
                        <span>Ambiente Virtual de Aprendizagem Humanizado</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-warm-900 mb-6 tracking-tight font-display">
                        Apresentação do <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">Palieduca</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-warm-700 leading-relaxed font-light max-w-3xl mx-auto mb-8">
                        Bem-vindo(a) ao <strong className="font-bold text-sky-700">Palieduca</strong>! Uma plataforma educacional desenvolvida para apoiar e aprofundar o ensino e a aprendizagem em cuidados paliativos, unindo ciência, empatia e esperança.
                    </p>

                    {/* Badges de Destaque */}
                    <div className="flex flex-wrap justify-center items-center gap-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-xs">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Projeto UFPB / Doutorado
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-full text-xs font-bold shadow-xs">
                            <Award size={14} className="text-sky-600" />
                            Metodologias Ativas de Ensino
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-bold shadow-xs">
                            <GraduationCap size={14} className="text-teal-600" />
                            Acesso 100% Livre e Gratuito
                        </span>
                    </div>
                </div>
            </section>

            {/* ═══ 2. PÚBLICO-ALVO (CARDS 3D GLOW) ═══ */}
            <section id="publico-alvo" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-24">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3.5 py-1 rounded-full">
                        Para quem foi feito
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mt-3 mb-4">Público-Alvo</h2>
                    <p className="text-warm-600 text-sm sm:text-base">
                        O Palieduca foi concebido para atender diferentes etapas da jornada formativa na área da saúde.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Estudantes de Graduação",
                            desc: "Alunos de Enfermagem e demais cursos de saúde em busca de competências práticas, estudo de casos clínicos e fundamentação ética.",
                            icon: <BookOpen className="text-sky-600" size={30} />,
                            bg: "from-sky-50/70 via-white to-white",
                            border: "border-sky-200/80 hover:border-sky-400",
                            badge: "Graduação"
                        },
                        {
                            title: "Docentes & Preceptores",
                            desc: "Professores que desejam material complementar confiável, metodologias ativas, quizzes e recursos visuais para sala de aula.",
                            icon: <BrainCircuit className="text-teal-600" size={30} />,
                            bg: "from-teal-50/70 via-white to-white",
                            border: "border-teal-200/80 hover:border-teal-400",
                            badge: "Docência"
                        },
                        {
                            title: "Profissionais de Saúde",
                            desc: "Enfermeiros, médicos e equipes multidisciplinares que buscam atualização contínua e aprimoramento no manejo humanizado da dor e sintomas.",
                            icon: <Users className="text-emerald-600" size={30} />,
                            bg: "from-emerald-50/70 via-white to-white",
                            border: "border-emerald-200/80 hover:border-emerald-400",
                            badge: "Assistência"
                        },
                    ].map(item => (
                        <Tilt3DCard key={item.title} maxTilt={6}>
                            <div className={`p-8 rounded-3xl bg-gradient-to-br ${item.bg} border ${item.border} shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden group`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        {item.icon}
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-warm-700 bg-white px-3 py-1 rounded-full border border-warm-200 shadow-2xs">
                                        {item.badge}
                                    </span>
                                </div>
                                <h3 className="font-extrabold text-xl text-warm-900 mb-3 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-warm-600 text-sm leading-relaxed font-light flex-grow">
                                    {item.desc}
                                </p>
                            </div>
                        </Tilt3DCard>
                    ))}
                </div>
            </section>

            {/* ═══ 3. EXPLORE OS MÓDULOS DE APRENDIZAGEM ═══ */}
            <section id="modulos" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-24 border-t border-warm-100">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-secondary bg-warm-100 px-3 py-1 rounded-full">
                        Currículo Estruturado
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mt-3 mb-4">
                        Trilhas & Módulos de Aprendizagem
                    </h2>
                    <p className="text-warm-600 text-sm sm:text-base">
                        Conheça as áreas temáticas essenciais desenhadas para guiar seu percurso formativo em cuidados paliativos.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {modulesList.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <Tilt3DCard key={item.id} maxTilt={5}>
                                <div className="p-7 rounded-3xl bg-white border border-warm-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full group">
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className={`p-3.5 rounded-2xl ${item.color} border shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                                                <IconComponent size={24} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-warm-500 bg-warm-50 px-2.5 py-1 rounded-lg border border-warm-200">
                                                    ⏱️ {item.time}
                                                </span>
                                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-warm-100 text-warm-900 border border-warm-200">
                                                    {item.badge}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-extrabold text-lg sm:text-xl text-warm-900 mb-3 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-warm-600 text-xs sm:text-sm leading-relaxed font-light mb-6">
                                            {item.description}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/modulo/${item.id}`}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-emerald-700 transition-colors pt-4 border-t border-warm-100 group-hover:translate-x-1 duration-200"
                                    >
                                        <span>Acessar Módulo</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </Tilt3DCard>
                        );
                    })}
                </div>
            </section>

            {/* ═══ 4. EQUIPE RESPONSÁVEL (AVATARES PREMIUM 3D) ═══ */}
            <section id="equipe" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-24 border-t border-warm-100">
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Quem Faz Acontecer
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-warm-900 mt-3 mb-4">Equipe Responsável</h2>
                    <p className="text-warm-600 text-sm sm:text-base">
                        Pesquisadores e desenvolvedores dedicados à excelência científica e tecnológica em saúde.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Patricia Maria de Oliveira Andrade",
                            role: "Doutoranda em Enfermagem (UFPB)",
                            desc: "Idealizadora do projeto, enfermeira e pesquisadora dedicada à formação humanizada em cuidados paliativos.",
                            image: patriciaImg,
                            tag: "Idealizadora & Pesquisa"
                        },
                        {
                            name: "Pedro Martins de Araújo Neto",
                            role: "Acadêmico de Eng. da Computação",
                            desc: "Desenvolvedor Frontend, arquiteto de software e analista de UI/UX responsável pela experiência interativa da plataforma.",
                            image: pedroImg,
                            tag: "Frontend & UI/UX"
                        },
                        {
                            name: "Carlos Eduardo Rodrigues dos Santos",
                            role: "Analista de Sistemas",
                            desc: "Arquiteto de infraestrutura, segurança e desenvolvimento Backend/DevOps para alta disponibilidade.",
                            image: carlosImg,
                            tag: "Backend & Infraestrutura"
                        }
                    ].map(member => (
                        <Tilt3DCard key={member.name} maxTilt={6}>
                            <div className="p-8 bg-white border border-warm-200 shadow-md hover:shadow-2xl rounded-3xl text-center group transition-all duration-300 flex flex-col h-full">
                                <div className="relative w-28 h-28 mx-auto mb-6">
                                    <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-primary via-emerald-400 to-amber-400 shadow-lg overflow-hidden">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-warm-200">
                                        <Heart size={14} className="text-rose-500 fill-rose-500" />
                                    </div>
                                </div>

                                <span className="inline-block mx-auto text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-0.5 rounded-full mb-2">
                                    {member.tag}
                                </span>

                                <h3 className="font-extrabold text-warm-900 text-lg sm:text-xl mb-1 group-hover:text-primary transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-xs font-bold text-warm-600 mb-4">{member.role}</p>
                                <p className="text-xs sm:text-sm text-warm-600 leading-relaxed font-light flex-grow">
                                    {member.desc}
                                </p>
                            </div>
                        </Tilt3DCard>
                    ))}
                </div>
            </section>

            {/* ═══ 5. CITAÇÃO INSPIRADORA FINAL ═══ */}
            <section className="py-16 px-4 max-w-5xl mx-auto">
                <div className="relative glassmorphism p-8 sm:p-14 rounded-3xl border border-warm-200/80 bg-gradient-to-br from-white via-warm-50/80 to-emerald-50/50 shadow-2xl overflow-hidden text-center">
                    <div className="absolute top-6 left-8 text-warm-300/40">
                        <Quote size={64} />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-6 shadow-xs">
                            <Sparkles size={24} />
                        </div>
                        <blockquote className="text-2xl sm:text-3xl font-extrabold text-warm-900 mb-6 italic leading-snug font-display">
                            "Aprender para cuidar com competência, ética e sensibilidade."
                        </blockquote>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full" />
                        <p className="text-sm sm:text-base text-warm-700 leading-relaxed font-light">
                            Esperamos que este ambiente virtual favoreça uma aprendizagem significativa, colaborativa e contextualizada, estimulando o protagonismo do estudante na construção do conhecimento e contribuindo para o desenvolvimento de competências necessárias à prática dos cuidados paliativos.
                        </p>

                        <div className="mt-8">
                            <Link
                                to="/modulos"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-bold text-sm shadow-xl hover:bg-sage-700 hover:shadow-primary/30 transition-all btn-shimmer"
                            >
                                <span>Explorar todos os módulos</span>
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Apresentacao;
