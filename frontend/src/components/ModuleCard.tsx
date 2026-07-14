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
    delay?: number;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    id,
    title,
    description,
    icon,
    progress,
    resources,
    delay = 0
}) => {
    return (
        <div
            className="glassmorphism-card rounded-2xl p-6 flex flex-col h-full animate-slide-up"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gradient-to-br from-nature-100 to-serene-100 text-primary rounded-xl shadow-sm">
                    {icon}
                </div>
                <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {progress === 100 ? (
                        <>
                            <CheckCircle size={14} />
                            <span>Concluído</span>
                        </>
                    ) : (
                        <span>{progress}% Concluído</span>
                    )}
                </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-5 mt-2 shadow-inner">
                <div
                    className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-6 flex-grow">{description}</p>

            <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recursos Disponíveis</div>
                <div className="flex flex-wrap gap-2">
                    {resources.map((res, index) => (
                        <span key={index} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-md">
                            {res}
                        </span>
                    ))}
                </div>
            </div>

            <Link
                to={`/modulos/${id}`}
                className="mt-auto w-full flex items-center justify-center gap-2 py-3 bg-white border border-primary/20 text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-colors group"
            >
                <span>{progress > 0 && progress < 100 ? 'Continuar módulo' : progress === 100 ? 'Revisar conteúdo' : 'Iniciar módulo'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default ModuleCard;
