import React from 'react';
import { Microscope, BookOpen, ScrollText } from 'lucide-react';

interface EmConstrucaoProps {
    tipo: 'modulos' | 'biblioteca' | 'glossario';
}

const EmConstrucao: React.FC<EmConstrucaoProps> = ({ tipo }) => {
    const infos = {
        modulos: {
            icon: <Microscope size={64} className="text-primary mb-6 animate-subtle-float" />,
            title: "Módulos de Ensino em Curadoria",
            desc: "O conteúdo didático e as trilhas de aprendizagem estão passando por uma rigorosa curadoria científica e metodológica para garantir a máxima qualidade aos estudantes."
        },
        biblioteca: {
            icon: <BookOpen size={64} className="text-secondary mb-6 animate-subtle-float" />,
            title: "Biblioteca Acadêmica em Organização",
            desc: "Estamos estruturando um acervo digital rico e validado, com artigos, diretrizes e referências científicas atualizadas sobre cuidados paliativos."
        },
        glossario: {
            icon: <ScrollText size={64} className="text-sage-600 mb-6 animate-subtle-float" />,
            title: "Glossário Científico em Elaboração",
            desc: "Os termos técnicos e conceitos-chave estão sendo revisados para fornecer definições precisas, embasadas e essenciais para a prática clínica."
        }
    };

    const current = infos[tipo];

    return (
        <main className="min-h-[85vh] pt-32 pb-20 px-4 flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-sage-200/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-warm-300/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                <div className="glassmorphism p-10 sm:p-14 rounded-3xl border border-warm-200 text-center shadow-xl animate-slide-up">
                    <div className="flex justify-center">
                        {current.icon}
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 text-warm-800 text-sm font-medium mb-6 border border-warm-200">
                        <span>Fase de Validação Acadêmica</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-warm-900 mb-6 tracking-tight">
                        {current.title}
                    </h1>
                    
                    <p className="text-lg text-warm-700 leading-relaxed font-light mb-8 max-w-xl mx-auto">
                        {current.desc}
                    </p>

                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
                </div>
            </div>
        </main>
    );
};

export default EmConstrucao;
