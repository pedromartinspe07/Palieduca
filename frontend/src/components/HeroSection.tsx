import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Play, Heart, ChevronLeft, ChevronRight, Sparkles, Award, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3DCanvas from './3d/Hero3DCanvas';

interface Slide {
    url: string;
    alt: string;
    tag: string;
    title: string;
}

const SLIDES: Slide[] = [
    {
        url: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
        alt: "Enfermeira segurando as mãos de um paciente idoso com afeto e cuidado",
        tag: "Cuidado Humanizado",
        title: "Acolhimento, presença e toque terapêutico na assistência",
    },
    {
        url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1600",
        alt: "Mãos entrelaçadas em gesto de conforto e apoio em cuidados paliativos",
        tag: "Apoio e Afeto",
        title: "Alívio do sofrimento e suporte integral ao paciente e à família",
    },
    {
        url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=1600",
        alt: "Profissional de saúde conversando com paciente idoso com escuta ativa",
        tag: "Escuta Ativa",
        title: "Cuidar da pessoa em sua totalidade, biografia e valores",
    },
    {
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600",
        alt: "Equipe multidisciplinar em atendimento conjunto de saúde",
        tag: "Equipe Multiprofissional",
        title: "Abordagem interdisciplinar ética e baseada em evidências",
    },
    {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1600",
        alt: "Profissional de saúde oferecendo cuidado digno e respeitoso",
        tag: "Dignidade da Vida",
        title: "Promover qualidade de vida, conforto e respeito em todas as etapas",
    },
];

const HeroSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    }, []);

    // Auto-advance carousel
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    return (
        <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
            {/* Background elements & Three.js 3D Sphere */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-100/60 via-emerald-50/30 to-background" />
                <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-sky-300/25 rounded-full blur-[140px] animate-subtle-float" />
                <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-emerald-300/25 rounded-full blur-[140px] animate-subtle-float" style={{ animationDelay: '2s' }} />
                
                {/* Three.js 3D Background Canvas (Borboleta Ulysses 3D) */}
                <div className="absolute top-6 right-0 w-full max-w-xl h-[450px] opacity-95 hidden lg:block pointer-events-auto">
                    <Hero3DCanvas />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Rectangular Banner Carousel */}
                <div
                    className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] lg:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-sky-100/80 bg-warm-900 group mb-12 select-none"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    aria-label="Carrossel de imagens de cuidados paliativos"
                >
                    {/* Slides */}
                    {SLIDES.map((slide, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={slide.url}
                                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            >
                                <img
                                    src={slide.url}
                                    alt={slide.alt}
                                    className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                                        isActive ? 'scale-105' : 'scale-100'
                                    }`}
                                />
                                {/* Bottom dark gradient for caption contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-warm-950/85 via-warm-950/30 to-transparent" />

                                {/* Slide caption */}
                                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 right-20 sm:right-28 text-white z-20 animate-fade-in">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-medium mb-2.5 text-white shadow-sm">
                                        <Sparkles size={14} className="text-amber-300" />
                                        {slide.tag}
                                    </span>
                                    <p className="text-base sm:text-xl md:text-2xl font-semibold tracking-tight text-white drop-shadow-md max-w-2xl leading-snug">
                                        {slide.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        aria-label="Imagem anterior"
                        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-warm-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                        <ChevronLeft size={24} className="stroke-[2.5]" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        aria-label="Próxima imagem"
                        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-warm-900 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary opacity-80 group-hover:opacity-100 cursor-pointer"
                    >
                        <ChevronRight size={24} className="stroke-[2.5]" />
                    </button>

                    {/* Navigation Dots Indicator */}
                    <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-10 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        {SLIDES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Ir para slide ${index + 1}`}
                                className={`transition-all duration-300 rounded-full cursor-pointer ${
                                    index === currentIndex
                                        ? 'w-6 sm:w-7 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Welcome / Presentation Content */}
                <div className="text-center max-w-4xl mx-auto animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-sky-200 text-sky-800 font-semibold text-sm mb-6 shadow-sm hover:scale-105 transition-transform">
                        <Heart size={16} className="fill-sky-500 text-sky-600" />
                        <span>Projeto de Doutorado em Enfermagem</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-warm-900 leading-[1.2] mb-6 tracking-tight">
                        Aprender cuidados paliativos é cuidar da pessoa em sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">integralidade.</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-warm-700 font-light mb-8 max-w-2xl mx-auto leading-relaxed">
                        Plataforma educativa para aprofundar competências em cuidados paliativos, unindo conhecimento científico, ética e humanização no cuidado.
                    </p>

                    {/* Badges Flutuantes Interativos (Gamificação / Prova Social) */}
                    <div className="flex flex-wrap justify-center items-center gap-3 mb-10">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold shadow-xs">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>100% Gratuito & Aberto</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full text-xs font-bold shadow-xs">
                            <Award size={14} className="text-amber-600" />
                            <span>Certificado com Autenticação</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 text-sky-800 border border-sky-200/80 rounded-full text-xs font-bold shadow-xs">
                            <GraduationCap size={14} className="text-sky-600" />
                            <span>6 Módulos Baseados em Evidências</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link
                            to="/modulos"
                            className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-sky-500/25 transition-all btn-shimmer interactive-btn group"
                        >
                            <span>Iniciar aprendizagem</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to="/apresentacao"
                            className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-4 bg-white/90 text-warm-900 rounded-full font-bold text-lg shadow-md hover:shadow-xl border border-sky-200/80 hover:border-sky-400 transition-all interactive-btn group"
                        >
                            <Play size={20} className="text-sky-600 group-hover:scale-110 transition-transform" />
                            <span>Ver apresentação</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;


