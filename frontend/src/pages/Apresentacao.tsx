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
    Heart,
    Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt3DCard from '../components/3d/Tilt3DCard';
import BotanicalBackground from '../components/effects/BotanicalBackground';
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
        color: 'bg-emerald-100/70 text-emerald-800 border-emerald-200/70',
        badge: 'Módulo 1',
        time: '15 min'
    },
    {
        id: 'comunicacao',
        title: 'Comunicação Empática & Terapêutica',
        description: 'Habilidades de comunicação compassiva para estabelecer relações de confiança com pacientes, familiares e equipe multiprofissional, favorecendo o cuidado centrado na pessoa.',
        icon: MessageSquare,
        color: 'bg-amber-100/70 text-amber-800 border-amber-200/70',
        badge: 'Módulo 2',
        time: '20 min'
    },
    {
        id: 'sintomas',
        title: 'Controle de Sintomas & Dor Total',
        description: 'Avaliação e manejo dos principais sintomas físicos, psicológicos, sociais e espirituais, utilizando abordagens baseadas em evidências para o alívio efetivo do sofrimento.',
        icon: Activity,
        color: 'bg-rose-100/70 text-rose-800 border-rose-200/70',
        badge: 'Módulo 3',
        time: '25 min'
    },
    {
        id: 'cuidados-enfermagem',
        title: 'Assistência & Prática de Enfermagem',
        description: 'O processo de enfermagem em cuidados paliativos, explorando intervenções voltadas à assistência integral, humanizada e segura em diferentes cenários de cuidado.',
        icon: HeartPulse,
        color: 'bg-purple-100/70 text-purple-800 border-purple-200/70',
        badge: 'Módulo 4',
        time: '20 min'
    },
    {
        id: 'familia-cuidador',
        title: 'Suporte à Família e ao Cuidador',
        description: 'Importância da participação da família e dos cuidadores no processo de cuidado, compreendendo estratégias de acolhimento, suporte contínuo e acompanhamento no luto.',
        icon: Users,
        color: 'bg-blue-100/70 text-blue-800 border-blue-200/70',
        badge: 'Módulo 5',
        time: '15 min'
    },
    {
        id: 'bioetica',
        title: 'Bioética & Tomada de Decisão',
        description: 'Princípios bioéticos que orientam a prática em cuidados paliativos, fortalecendo a tomada de decisão compartilhada, o respeito à autonomia e à dignidade humana.',
        icon: Scale,
        color: 'bg-teal-100/70 text-teal-800 border-teal-200/70',
        badge: 'Módulo 6',
        time: '30 min'
    }
];

const Apresentacao: React.FC = () => {
    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <main className="max-w-6xl mx-auto space-y-12">
                
                {/* ═══ 1. HERO BANNER DE BOAS-VINDAS ═══ */}
                <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl text-center relative overflow-hidden">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 font-bold text-xs mb-5 shadow-2xs">
                        <Leaf size={13} className="text-teal-600 dark:text-teal-400" />
                        <span>Ambiente Virtual de Aprendizagem Humanizado</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-4 tracking-tight font-display">
                        Apresentação <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] via-[#0d9488] to-[#0f766e]">do PaliEduca</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
                        Bem-vindo(a) ao <strong className="font-bold text-teal-800 dark:text-teal-400">PaliEduca</strong>! Uma plataforma educacional interativa desenvolvida no âmbito do <strong className="font-semibold text-slate-800 dark:text-slate-100">Programa de Pós-Graduação em Enfermagem da UFPB</strong> para capacitar profissionais e estudantes nas melhores práticas dos Cuidados Paliativos.
                    </p>

                    {/* Badges de Destaque */}
                    <div className="flex flex-wrap justify-center items-center gap-2.5">
                        <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full text-xs font-bold shadow-2xs">
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                            Projeto UFPB / Doutorado
                        </span>
                        <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full text-xs font-bold shadow-2xs">
                            <Award size={14} className="text-sky-600 dark:text-sky-400" />
                            Metodologias Ativas de Ensino
                        </span>
                        <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full text-xs font-bold shadow-2xs">
                            <GraduationCap size={14} className="text-teal-600 dark:text-teal-400" />
                            Acesso 100% Livre e Gratuito
                        </span>
                    </div>
                </div>

                {/* ═══ 2. PÚBLICO-ALVO ═══ */}
                <section id="publico-alvo" className="scroll-mt-28">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 px-3.5 py-1 rounded-full">
                            Para quem foi feito
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-slate-50 mt-3 mb-2">Público-Alvo</h2>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                            Concebido para atender diferentes etapas da jornada formativa na área da saúde.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                title: "Estudantes de Graduação",
                                desc: "Alunos de Enfermagem e demais cursos de saúde em busca de competências práticas, estudo de casos clínicos e fundamentação ética.",
                                icon: <BookOpen className="text-sky-600 dark:text-sky-400" size={28} />,
                                badge: "Graduação"
                            },
                            {
                                title: "Docentes & Preceptores",
                                desc: "Professores que desejam material complementar confiável, metodologias ativas, quizzes e recursos visuais para sala de aula.",
                                icon: <BrainCircuit className="text-teal-600 dark:text-teal-400" size={28} />,
                                badge: "Docência"
                            },
                            {
                                title: "Profissionais de Saúde",
                                desc: "Enfermeiros, médicos e equipes multidisciplinares que buscam atualização contínua e aprimoramento no manejo humanizado da dor e sintomas.",
                                icon: <Users className="text-emerald-600 dark:text-emerald-400" size={28} />,
                                badge: "Assistência"
                            },
                        ].map(item => (
                            <Tilt3DCard key={item.title} maxTilt={5}>
                                <div className="p-7 rounded-[28px] bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-sky-300/60 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 rounded-2xl border border-sky-100 dark:border-sky-800/50 group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                            {item.badge}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-lg text-[#0f172a] dark:text-slate-100 mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-light flex-grow">
                                        {item.desc}
                                    </p>
                                </div>
                            </Tilt3DCard>
                        ))}
                    </div>
                </section>

                {/* ═══ 3. EXPLORE OS MÓDULOS DE APRENDIZAGEM ═══ */}
                <section id="modulos" className="scroll-mt-28">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3.5 py-1 rounded-full">
                            Currículo Estruturado
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-3 mb-2">
                            Trilhas &amp; Módulos de Aprendizagem
                        </h2>
                        <p className="text-slate-600 text-xs sm:text-sm">
                            Conheça as áreas temáticas essenciais desenhadas para guiar seu percurso formativo.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {modulesList.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Tilt3DCard key={item.id} maxTilt={5}>
                                    <div className="p-7 rounded-[28px] bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.05)] hover:shadow-2xl hover:border-sky-300/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-2xl ${item.color} border shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent size={22} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                                        ⏱️ {item.time}
                                                    </span>
                                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100/70 text-sky-800 border border-sky-200/60">
                                                        {item.badge}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="font-extrabold text-base sm:text-lg text-[#0f172a] mb-2 group-hover:text-teal-700 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-600 text-xs leading-relaxed font-light mb-6">
                                                {item.description}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/modulo/${item.id}`}
                                            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors pt-3 border-t border-slate-100 group-hover:translate-x-1 duration-200"
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

                {/* ═══ 4. EQUIPE RESPONSÁVEL ═══ */}
                <section id="equipe" className="scroll-mt-28">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 px-3.5 py-1 rounded-full">
                            Quem Faz Acontecer
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-3 mb-2">Equipe Responsável</h2>
                        <p className="text-slate-600 text-xs sm:text-sm">
                            Pesquisadores e desenvolvedores dedicados à excelência científica e tecnológica em saúde.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
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
                            <Tilt3DCard key={member.name} maxTilt={5}>
                                <div className="p-7 bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.05)] hover:shadow-2xl rounded-[28px] text-center group transition-all duration-300 flex flex-col h-full">
                                    <div className="relative w-28 h-28 mx-auto mb-5">
                                        <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 shadow-md overflow-hidden">
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-2xs border border-slate-200">
                                            <Heart size={13} className="text-rose-500 fill-rose-500" />
                                        </div>
                                    </div>

                                    <span className="inline-block mx-auto text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-0.5 rounded-full mb-2">
                                        {member.tag}
                                    </span>

                                    <h3 className="font-extrabold text-[#0f172a] text-base sm:text-lg mb-1 group-hover:text-teal-700 transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 mb-3">{member.role}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed font-light flex-grow">
                                        {member.desc}
                                    </p>
                                </div>
                            </Tilt3DCard>
                        ))}
                    </div>
                </section>

                {/* ═══ 5. CITAÇÃO INSPIRADORA FINAL ═══ */}
                <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/80 backdrop-blur-2xl text-center relative overflow-hidden">
                    <div className="absolute top-6 left-8 text-slate-300/40">
                        <Quote size={56} />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="inline-flex p-3 rounded-2xl bg-teal-50 text-teal-700 mb-5 shadow-2xs">
                            <Sparkles size={22} />
                        </div>
                        <blockquote className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mb-5 italic leading-snug font-display">
                            "Aprender para cuidar com competência, ética e sensibilidade."
                        </blockquote>
                        <div className="w-20 h-1 bg-gradient-to-r from-sky-500 to-teal-600 mx-auto mb-5 rounded-full" />
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
                            Esperamos que este ambiente virtual favoreça uma aprendizagem significativa, colaborativa e contextualizada, estimulando o protagonismo do estudante na construção do conhecimento e contribuindo para o desenvolvimento de competências necessárias à prática dos cuidados paliativos.
                        </p>

                        <div className="mt-8">
                            <Link
                                to="/modulos"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all interactive-btn"
                            >
                                <span>Explorar todos os módulos</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </BotanicalBackground>
    );
};

export default Apresentacao;
