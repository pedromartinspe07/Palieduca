import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, LogOut, Settings, Users, BookOpen, Activity, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Perfil: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="pt-32 text-center">
                <p>Você precisa estar logado.</p>
            </div>
        );
    }

    return (
        <main className="min-h-[85vh] pt-32 pb-20 px-4 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar do Perfil */}
                <div className="w-full md:w-1/3 glassmorphism p-6 rounded-3xl h-fit border border-warm-200">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-warm-100">
                        <div className="bg-sage-100 p-4 rounded-full text-sage-600 mb-4">
                            <UserCircle size={64} />
                        </div>
                        <h2 className="text-xl font-bold text-warm-900">{user.nome}</h2>
                        <p className="text-warm-500 text-sm mb-2">{user.email}</p>
                        
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                            Cargo: {user.cargo}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </div>

                {/* Conteúdo Dinâmico por Cargo (RBAC) */}
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="glassmorphism p-8 rounded-3xl border border-warm-200">
                        <h3 className="text-2xl font-bold text-warm-900 mb-6 flex items-center gap-2">
                            <Settings className="text-primary" /> Painel de Controle
                        </h3>

                        {user.cargo === 'dona' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-sage-50 rounded-2xl border border-sage-100 hover:shadow-md transition-all">
                                        <Users size={32} className="text-sage-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Gestão de Alunos</h4>
                                        <p className="text-sm text-warm-600">Gerencie matrículas e acompanhe o engajamento da turma de Enfermagem.</p>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all">
                                        <BookOpen size={32} className="text-blue-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Acervo Biblioteca</h4>
                                        <p className="text-sm text-warm-600">Aprove artigos e gerencie referências científicas.</p>
                                    </div>
                                </div>
                                <div className="mt-8 bg-gradient-to-r from-primary to-secondary p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between shadow-xl hover:shadow-2xl transition-all">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Palette /> Estúdio de Criação</h3>
                                        <p className="text-white/90 max-w-xl">Acesse o construtor de páginas em tela cheia com Inteligência Artificial e Live Preview.</p>
                                    </div>
                                    <button onClick={() => navigate('/editor')} className="mt-4 sm:mt-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform whitespace-nowrap">
                                        Abrir Estúdio
                                    </button>
                                </div>
                            </div>
                        )}

                        {user.cargo === 'desenvolvedor' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <Activity size={32} className="text-purple-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Logs do Sistema</h4>
                                        <p className="text-sm text-warm-600">Verifique a saúde do servidor, chamadas de API e performance.</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                        <Settings size={32} className="text-gray-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Variáveis de Ambiente</h4>
                                        <p className="text-sm text-warm-600">Configure integrações como OAuth do Google e API do Groq.</p>
                                    </div>
                                </div>
                                <div className="mt-8 bg-gradient-to-r from-primary to-secondary p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between shadow-xl hover:shadow-2xl transition-all">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Palette /> Estúdio de Criação</h3>
                                        <p className="text-white/90 max-w-xl">Acesse o construtor de páginas em tela cheia com Inteligência Artificial e Live Preview.</p>
                                    </div>
                                    <button onClick={() => navigate('/editor')} className="mt-4 sm:mt-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform whitespace-nowrap">
                                        Abrir Estúdio
                                    </button>
                                </div>
                            </div>
                        )}

                        {user.cargo === 'aluno' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <BookOpen size={32} className="text-primary mb-4" />
                                    <h4 className="font-semibold text-warm-900 mb-2">Meu Progresso</h4>
                                    <p className="text-sm text-warm-600 mb-4">Você completou 0% dos módulos de Cuidados Paliativos.</p>
                                    <div className="w-full bg-warm-200 rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full w-0"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Perfil;
