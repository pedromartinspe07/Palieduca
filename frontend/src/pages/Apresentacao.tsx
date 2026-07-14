import React from 'react';
import { BookOpen, Users, BrainCircuit } from 'lucide-react';

const Apresentacao: React.FC = () => {
    return (
        <main className="pt-24 pb-20">
            {/* Header Banner */}
            <section className="bg-warm-50 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-warm-900 mb-6">Apresentação do Projeto</h1>
                    <p className="text-lg text-warm-700 leading-relaxed">
                        Este espaço tem como objetivo apoiar o ensino e aprendizagem de cuidados paliativos em Enfermagem,
                        utilizando recursos digitais interativos fundamentados na Teoria Histórico-Cultural e no
                        modelo metodológico de Falkembach.
                    </p>
                </div>
            </section>

            {/* Target Audience */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-warm-900 mb-8 text-center">Público-alvo</h2>
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

            {/* Theoretical Foundation */}
            <section className="py-16 px-4 bg-warm-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-warm-900 mb-10 text-center">Fundamentação Teórica</h2>
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="glassmorphism p-8 rounded-2xl border border-warm-100">
                            <h3 className="text-xl font-bold text-primary mb-4 border-b border-primary/20 pb-3">L. S. Vygotsky (1896–1934)</h3>
                            <p className="text-warm-700 leading-relaxed">
                                A Teoria Histórico-Cultural postula que a aprendizagem ocorre através da interação social e da mediação.
                                A Zona de Desenvolvimento Proximal (ZDP) é central no nosso modelo, permitindo que o aluno alcance seu
                                potencial através da interação com casos clínicos e a tutoria (feedback direcionado).
                            </p>
                        </div>
                        <div className="glassmorphism p-8 rounded-2xl border border-warm-100">
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

            {/* Team */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-10 text-center">Equipe Responsável</h2>
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
                        <div key={member.name} className="relative p-6 bg-white border border-slate-100 shadow-sm rounded-2xl text-center group interactive-btn">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-full mb-4 flex items-center justify-center text-white text-xl font-bold">
                                {member.name.charAt(0)}
                            </div>
                            <h3 className="font-bold text-slate-800">{member.name}</h3>
                            <p className="text-sm font-medium text-primary mt-1 mb-3">{member.role}</p>
                            <p className="text-xs text-slate-500">{member.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Apresentacao;
