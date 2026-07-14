import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModuleCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    resources: string[];
    image: string;
    delay?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    id,
    title,
    description,
    icon,
    progress,
    resources,
    image,
    delay = 0
}) => {
    return (
        <div
            className="glassmorphism-card rounded-[2rem] overflow-hidden flex flex-col h-full animate-slide-up group"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                    {icon}
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md">
                    {progress === 100 ? (
                        <>
                            <CheckCircle size={14} className="text-sage-600" />
                            <span className="text-sage-700">Concluído</span>
                        </>
                    ) : (
                        <span className="text-warm-800">{progress}%</span>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-white">
                <div className="w-full bg-warm-100 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
                    <div
                        className="bg-gradient-to-r from-primary to-sage-400 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <h3 className="text-xl font-bold text-warm-900 mb-3 leading-snug">{title}</h3>
                <p className="text-sm text-warm-600 mb-6 flex-grow font-light leading-relaxed">{description}</p>

                <div className="mb-6">
                    <div className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-3">Recursos Disponíveis</div>
                    <div className="flex flex-wrap gap-2">
                        {resources.map((res, index) => (
                            <span key={index} className="px-3 py-1 bg-warm-50 text-warm-600 text-[11px] font-semibold rounded-lg border border-warm-100">
                                {res}
                            </span>
                        ))}
                    </div>
                </div>

                <Link
                    to={`/modulos/${id}`}
                    className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 bg-warm-50 border border-warm-200 text-warm-800 rounded-xl font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 interactive-btn"
                >
                    <span>{progress > 0 && progress < 100 ? 'Continuar aprendizagem' : progress === 100 ? 'Revisar módulo' : 'Iniciar módulo'}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default ModuleCard;
