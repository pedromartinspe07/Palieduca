import React from 'react';
import { HeartPulse, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-warm-900 text-warm-100/80 pt-16 pb-8 border-t border-warm-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Coluna 1: Sobre o Projeto */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                <HeartPulse size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Palieduca</span>
                        </div>
                        <p className="text-warm-300 text-sm leading-relaxed mb-6 max-w-sm">
                            Um Ambiente Virtual de Aprendizagem (AVA) desenvolvido para apoiar a formação e o aprimoramento de profissionais e estudantes na área de Cuidados Paliativos.
                        </p>
                    </div>

                    {/* Coluna 2: Vínculo Institucional */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                            <GraduationCap size={20} className="text-primary" />
                            Vínculo Institucional
                        </h4>
                        <ul className="space-y-4 text-sm text-warm-300">
                            <li>
                                <strong>Projeto de Tese:</strong> Programa de Pós-Graduação em Enfermagem (Doutorado)
                            </li>
                            <li>
                                <strong>Instituição:</strong> Universidade Federal da Paraíba (UFPB)
                            </li>
                            <li>
                                <strong>Pesquisadora:</strong> Patricia Maria de Oliveira Andrade
                            </li>
                        </ul>
                    </div>

                    {/* Coluna 3: Navegação Rápida e Contato */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Links Rápidos</h4>
                        <ul className="space-y-3 text-sm mb-6">
                            <li>
                                <Link to="/apresentacao" className="hover:text-primary transition-colors">Apresentação da Plataforma</Link>
                            </li>
                            <li>
                                <Link to="/modulos" className="hover:text-primary transition-colors">Módulos de Ensino</Link>
                            </li>
                            <li>
                                <Link to="/biblioteca" className="hover:text-primary transition-colors">Biblioteca Acadêmica</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-warm-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-warm-400">
                    <p>
                        © {new Date().getFullYear()} Palieduca. Desenvolvido para fins acadêmicos e científicos.
                    </p>
                    <div className="flex items-center gap-2">
                        <span>Desenvolvimento por</span>
                        <a href="https://github.com/pedromartinspe07" target="_blank" rel="noopener noreferrer" className="text-warm-300 hover:text-white transition-colors">
                            Pedro Martins
                        </a>
                        <span>&amp;</span>
                        <a href="https://github.com/eduardostc" target="_blank" rel="noopener noreferrer" className="text-warm-300 hover:text-white transition-colors">
                            Carlos Eduardo
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
