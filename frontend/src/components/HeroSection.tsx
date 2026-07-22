import React from 'react';
import { ArrowRight, Play, Heart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-warm-50/90 to-background/95 z-10" />
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1527613426406-03513364f783?auto=format&fit=crop&q=80&w=2000')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                {/* Soft glowing orbs for subtle warmth */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-300/20 rounded-full blur-[100px] animate-subtle-float" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-warm-300/20 rounded-full blur-[100px] animate-subtle-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-warm-200 text-primary font-medium text-sm mb-6 shadow-sm">
                            <Heart size={16} className="fill-primary" />
                            <span>Projeto de Doutorado em Enfermagem</span>
                        </div>

                        <h1 className="text-4xl lg:text-[4rem] font-bold text-warm-900 leading-[1.1] mb-6 tracking-tight">
                            Aprender cuidados paliativos é cuidar da pessoa em sua <span className="gradient-text">integralidade.</span>
                        </h1>

                        <p className="text-lg lg:text-xl text-warm-700 mb-8 leading-relaxed max-w-2xl font-light">
                            Recursos digitais interativos fundamentados na Teoria Histórico-Cultural para potencializar seu aprendizado e transformar sua prática profissional.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/modulos" className="flex justify-center items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-medium text-lg shadow-lg hover:shadow-primary/30 hover:bg-sage-700 transition-all interactive-btn group">
                                <span>Iniciar aprendizagem</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link to="/apresentacao" className="flex justify-center items-center gap-2 px-8 py-4 bg-white text-warm-800 rounded-full font-medium text-lg shadow-md hover:shadow-lg border border-warm-100 transition-all interactive-btn group">
                                <Play size={20} className="text-secondary group-hover:scale-110 transition-transform" />
                                <span>Ver apresentação</span>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[10px] border-white/60 glassmorphism transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1000"
                                alt="Enfermeira segurando as mãos de um paciente"
                                className="max-w-full w-full h-auto max-h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-warm-900/80 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="glassmorphism p-4 rounded-xl flex items-center gap-4 text-warm-900 bg-white/80 border-white">
                                    <div className="p-3 bg-sage-50 rounded-lg text-primary">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-warm-900">Metodologia Falkembach</h4>
                                        <p className="text-sm text-warm-700 font-medium">Aprendizagem ativa e estruturada</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
