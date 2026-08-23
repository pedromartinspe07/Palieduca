import React from 'react';
import { ArrowRight, Clock, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tilt3DCard from './3d/Tilt3DCard';

interface ModuleCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    resources: string[];
    image: string;
    delay?: number;
    estimatedMinutes?: number;
    level?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
    id,
    title,
    description,
    icon,
    progress,
    resources,
    image,
    delay = 0,
    estimatedMinutes = 15,
    level = 'Fundamentos'
}) => {
    const isCompleted = progress === 100;

    return (
        <Tilt3DCard
            maxTilt={5}
            className="h-full flex flex-col animate-slide-up group"
        >
            <div
                className={`rounded-[2rem] overflow-hidden flex flex-col h-full bg-white border transition-all duration-300 ${
                    isCompleted
                        ? 'border-amber-300 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.25)]'
                        : 'border-warm-200/80 shadow-md hover:shadow-2xl hover:border-primary/40'
                }`}
                style={{ animationDelay: `${delay}s` }}
            >
                {/* Header da Imagem com Overlays */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    
                    {/* Badge do Ícone */}
                    <div className="absolute bottom-3 left-4 p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-md border border-white/25">
                        {icon}
                    </div>

                    {/* Tag de Nível Superior Esquerdo */}
                    <div className="absolute top-3.5 left-4 flex items-center gap-1 bg-black/40 text-white/90 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border border-white/20">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>{level}</span>
                    </div>

                    {/* Status de Progresso / Selo Superior Direito */}
                    <div className="absolute top-3.5 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-md backdrop-blur-md transition-all">
                        {isCompleted ? (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-warm-950 px-3 py-1 rounded-full shadow-lg animate-pulse">
                                <Award size={14} className="text-warm-950" />
                                <span>100% Concluído</span>
                            </div>
                        ) : (
                            <div className="bg-white/90 text-warm-900 px-3 py-1 rounded-full border border-warm-200/80">
                                {progress > 0 ? `${progress}%` : 'Não iniciado'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-6 flex flex-col flex-1 bg-white">
                    {/* Barra de Progresso Suave */}
                    <div className="w-full bg-warm-100 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isCompleted
                                    ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                                    : 'bg-gradient-to-r from-primary to-emerald-400'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Meta Info (Tempo de Leitura) */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-warm-500 mb-2.5">
                        <span className="flex items-center gap-1">
                            <Clock size={13} className="text-primary" />
                            <span>{estimatedMinutes} min de estudo</span>
                        </span>
                        <span>•</span>
                        <span className="text-warm-600 font-medium">Interativo</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-warm-900 mb-2 leading-snug group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-warm-600 mb-5 flex-grow font-light leading-relaxed line-clamp-3">
                        {description}
                    </p>

                    {/* Recursos Disponíveis */}
                    {resources && resources.length > 0 && (
                        <div className="mb-6">
                            <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider mb-2">Recursos Inclusos</div>
                            <div className="flex flex-wrap gap-1.5">
                                {resources.map((res, index) => (
                                    <span key={index} className="px-2.5 py-0.5 bg-warm-50 text-warm-700 text-[11px] font-bold rounded-lg border border-warm-200">
                                        {res}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botão de Ação CTA */}
                    <Link
                        to={`/modulo/${id}`}
                        className={`mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 shadow-xs cursor-pointer ${
                            isCompleted
                                ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 hover:shadow-md'
                                : progress > 0
                                ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white hover:shadow-md'
                                : 'bg-warm-100 border border-warm-200 text-warm-800 hover:bg-primary hover:text-white hover:border-primary'
                        }`}
                    >
                        <span>
                            {isCompleted
                                ? 'Revisar Conteúdo'
                                : progress > 0
                                ? 'Continuar de onde parou'
                                : 'Iniciar Módulo'}
                        </span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </Tilt3DCard>
    );
};

export default ModuleCard;

