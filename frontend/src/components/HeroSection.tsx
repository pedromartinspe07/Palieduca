import React from 'react';
import { ArrowRight, Play, Heart, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-nature-50/80 to-serene-50/80 z-10" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2000')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                {/* Soft glowing orbs for abstract tech/nature feel */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-nature-200 text-primary font-medium text-sm mb-6 shadow-sm">
                            <Heart size={16} className="fill-primary" />
                            <span>Projeto de Doutorado em Enfermagem</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
                            Aprender cuidados paliativos é aprender a cuidar da pessoa em sua <span className="gradient-text">integralidadade.</span>
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
                            Recursos digitais interativos fundamentados na Teoria Histórico-Cultural para potencializar seu aprendizado e transformar sua prática profissional.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/modulos" className="flex justify-center items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-medium text-lg shadow-lg hover:shadow-primary/30 hover:bg-nature-600 transition-all interactive-btn group">
                                <span>Iniciar aprendizagem</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button className="flex justify-center items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-full font-medium text-lg shadow-md hover:shadow-lg border border-slate-100 transition-all interactive-btn">
                                <Play size={20} className="text-secondary" />
                                <span>Ver apresentação</span>
                            </button>
                        </div>
                    </div>

                    <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/50 glassmorphism transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000"
                                alt="Cuidados Paliativos Humanizados"
                                className="w-full h-[500px] object-cover"
                            />
                            <div className="absolute absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="glassmorphism-card p-4 rounded-xl flex items-center gap-4 text-white">
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-slate-800">Metodologia Falkembach</h4>
                                        <p className="text-sm text-slate-600">Aprendizagem ativa e estruturada</p>
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
