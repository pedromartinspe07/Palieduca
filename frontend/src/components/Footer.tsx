import React from 'react';
import { GraduationCap, ShieldCheck, Mail, FileText, Scale, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import GrassDivider from './effects/GrassDivider';
import { triggerGlobalPWAInstall } from './PWAInstallPrompt';
import { ButterflyIcon } from './ButterflyLogo';

const Footer: React.FC = () => {
    return (
        <footer className="relative bg-warm-900 text-warm-100/80 pb-8">
            {/* Grama Acolhedora no Topo do Footer */}
            <div className="w-full -mt-1 pointer-events-none">
                <GrassDivider />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 mb-12">
                    
                    {/* Coluna 1: Sobre o Projeto */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2.5 group cursor-pointer">
                            <div className="bg-white/10 p-2 rounded-2xl text-teal-400 group-hover:scale-105 transition-transform duration-300">
                                <ButterflyIcon size={24} className="text-teal-300" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-teal-300 transition-colors">Palieduca</span>
                        </div>
                        <p className="text-warm-300 text-xs sm:text-sm leading-relaxed">
                            Ambiente Virtual de Aprendizagem (AVA) desenvolvido para apoiar a formação, pesquisa e o aperfeiçoamento contínuo em Cuidados Paliativos.
                        </p>
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-warm-800/80 rounded-lg text-[10px] text-warm-300 font-bold border border-warm-700">
                                🏛️ Universidade Federal da Paraíba
                            </span>
                        </div>
                    </div>

                    {/* Coluna 2: Trilhas e Aprendizagem */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Trilhas de Ensino</h4>
                        <ul className="space-y-2.5 text-xs text-warm-300">
                            <li>
                                <Link to="/apresentacao" className="hover:text-primary transition-colors">Apresentação da Plataforma</Link>
                            </li>
                            <li>
                                <Link to="/modulos" className="hover:text-primary transition-colors">Todos os Módulos</Link>
                            </li>
                            <li>
                                <Link to="/biblioteca" className="hover:text-primary transition-colors">Biblioteca Acadêmica</Link>
                            </li>
                            <li>
                                <Link to="/glossario" className="hover:text-primary transition-colors">Glossário de Termos</Link>
                            </li>
                            <li>
                                <Link to="/validar" className="hover:text-amber-400 font-semibold text-amber-300 transition-colors flex items-center gap-1.5 pt-1">
                                    <ShieldCheck size={14} className="text-amber-400" />
                                    <span>Validar Certificado (UFPB)</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Coluna 3: Institucional e Legal */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Institucional &amp; Legal</h4>
                        <ul className="space-y-2.5 text-xs text-warm-300">
                            <li>
                                <Link to="/termos" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Scale size={13} className="text-warm-400" />
                                    <span>Termos de Uso</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacidade" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                    <FileText size={13} className="text-warm-400" />
                                    <span>Privacidade &amp; LGPD</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/contato" className="hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Mail size={13} className="text-warm-400" />
                                    <span>Fale com a Coordenação</span>
                                </Link>
                            </li>
                            <li className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => triggerGlobalPWAInstall()}
                                    className="hover:text-teal-300 text-teal-400 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                                >
                                    <Smartphone size={13} className="text-teal-400 shrink-0" />
                                    <span>📱 Instalar App no Celular</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Coluna 4: Vínculo Acadêmico */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                            <GraduationCap size={18} className="text-primary" />
                            Vínculo Acadêmico
                        </h4>
                        <ul className="space-y-2.5 text-xs text-warm-300">
                            <li>
                                <strong>Tese de Doutorado:</strong> PPGENF / UFPB
                            </li>
                            <li>
                                <strong>Coordenação:</strong><br />
                                Prof.ª Dra. Patrícia Maria de Oliveira Andrade
                            </li>
                            <li>
                                <strong>Departamento:</strong> Enfermagem &bull; CCS
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-warm-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-warm-400">
                    <p>
                        © {new Date().getFullYear()} Palieduca. Desenvolvido para fins acadêmicos, científicos e educacionais vinculados à UFPB.
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
