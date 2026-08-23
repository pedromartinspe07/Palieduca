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
                className={`rounded-[28px] overflow-hidden flex flex-col h-full bg-white/95 backdrop-blur-xl border transition-all duration-300 ${
                    isCompleted
                        ? 'border-amber-300/80 shadow-[0_15px_35px_-10px_rgba(245,158,11,0.25)]'
                        : 'border-white/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] hover:shadow-2xl hover:border-sky-300/60 hover:-translate-y-1.5'
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
                    <div className="absolute top-3.5 left-4 flex items-center gap-1.5 bg-black/40 text-white/90 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border border-white/20">
                        <Sparkles size={12} className="text-amber-300" />
                        <span>{level}</span>
                    </div>

                    {/* Status de Progresso / Selo Superior Direito */}
                    <div className="absolute top-3.5 right-4 flex items-center gap-1.5 font-extrabold shadow-md backdrop-blur-md transition-all">
                        {isCompleted ? (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-3.5 py-1 rounded-full shadow-lg animate-pulse text-xs">
                                <Award size={14} className="text-slate-950" />
                                <span>100% Concluído</span>
                            </div>
                        ) : (
                            <div className="bg-white/90 text-slate-800 text-xs px-3 py-1 rounded-full border border-slate-200/80">
                                {progress > 0 ? `${progress}%` : 'Não iniciado'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-6 flex flex-col flex-1 bg-white/95">
                    {/* Barra de Progresso Suave */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isCompleted
                                    ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                                    : 'bg-gradient-to-r from-teal-500 to-sky-500'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Meta Info (Tempo de Estudo) */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mb-2">
                        <span className="flex items-center gap-1 text-teal-700">
                            <Clock size={13} className="text-teal-600" />
                            <span>{estimatedMinutes} min de estudo</span>
                        </span>
                    </div>

                    {/* Título do Módulo */}
                    <h3 className="font-extrabold text-xl text-[#0f172a] mb-2 group-hover:text-teal-700 transition-colors leading-snug">
                        {title}
                    </h3>

                    {/* Descrição */}
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light mb-6 flex-grow line-clamp-3">
                        {description}
                    </p>

                    {/* Tags de Recursos */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {resources.map((res, i) => (
                            <span 
                                key={i}
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/70"
                            >
                                {res}
                            </span>
                        ))}
                    </div>

                    {/* Botão de Ação CTA */}
                    <Link
                        to={`/modulo/${id}`}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs shadow-xs hover:shadow-lg transition-all duration-300 interactive-btn cursor-pointer ${
                            isCompleted
                                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white'
                                : 'bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white'
                        }`}
                    >
                        <span>{progress > 0 ? (isCompleted ? 'Revisar Conteúdo' : 'Continuar Módulo') : 'Iniciar Módulo'}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </Tilt3DCard>
    );
};

export default ModuleCard;
