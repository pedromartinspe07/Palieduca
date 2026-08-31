import React from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, 
    Lock, 
    Database, 
    UserCheck, 
    EyeOff, 
    ArrowLeft, 
    Printer, 
    Server, 
    FileText 
} from 'lucide-react';
import BotanicalBackground from '../components/effects/BotanicalBackground';

const Privacidade: React.FC = () => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
            <main className="max-w-4xl mx-auto">
                
                {/* Botão de Retorno e Impressão */}
                <div className="mb-6 flex items-center justify-between no-print">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-warm-700 hover:text-primary transition-colors font-semibold bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-warm-200 shadow-xs text-xs"
                    >
                        <ArrowLeft size={16} />
                        Voltar para a Página Inicial
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 text-warm-700 hover:text-primary transition-colors font-semibold bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-warm-200 shadow-xs text-xs cursor-pointer"
                    >
                        <Printer size={16} />
                        Imprimir / Salvar PDF
                    </button>
                </div>

                {/* Card de Cabeçalho */}
                <div className="p-8 sm:p-10 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl mb-8 text-center relative overflow-hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white mb-4 shadow-md">
                        <Lock size={34} />
                    </div>

                    <div className="inline-block">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-[11px] mb-3 shadow-2xs uppercase tracking-wider">
                            <ShieldCheck size={13} className="text-emerald-700 dark:text-emerald-400" />
                            Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-3 tracking-tight font-display">
                        Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700">Privacidade</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                        Transparência no tratamento, segurança e proteção dos seus dados acadêmicos e cadastrais na plataforma Palieduca / UFPB.
                    </p>
                    <p className="text-[11px] text-warm-400 mt-2">
                        Vigência: {new Date().getFullYear()} &bull; Universidade Federal da Paraíba
                    </p>
                </div>

                {/* Conteúdo da Política de Privacidade */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-xl space-y-8 text-warm-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                    
                    {/* 1. Compromisso */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <ShieldCheck size={20} />
                            <h2>1. Nosso Compromisso com a sua Privacidade</h2>
                        </div>
                        <p>
                            A plataforma <strong>Palieduca</strong>, vinculada ao Departamento de Enfermagem da <strong>Universidade Federal da Paraíba (UFPB)</strong>, adota práticas rigorosas de segurança da informação e governança de dados pessoais, assegurando o respeito à privacidade, autodeterminação informativa e integridade dos dados de seus alunos, pesquisadores e visitantes, em integral cumprimento à Lei Geral de Proteção de Dados (LGPD).
                        </p>
                    </section>

                    {/* 2. Coleta de Dados */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <Database size={20} />
                            <h2>2. Dados Pessoais Coletados</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200">
                                <h3 className="font-bold text-xs text-warm-900 mb-1.5 flex items-center gap-1.5">
                                    <UserCheck size={14} className="text-emerald-600" />
                                    Alunos Cadastrados
                                </h3>
                                <ul className="space-y-1 text-warm-600 text-xs list-disc pl-4">
                                    <li>Nome completo (para constar no certificado oficial);</li>
                                    <li>Endereço de e-mail institucional ou pessoal;</li>
                                    <li>Senha criptografada (hash seguro irreversível);</li>
                                    <li>Foto de perfil (opcional);</li>
                                    <li>Histórico de atividades e respostas de quizzes.</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-warm-50/80 rounded-2xl border border-warm-200">
                                <h3 className="font-bold text-xs text-warm-900 mb-1.5 flex items-center gap-1.5">
                                    <Server size={14} className="text-teal-600" />
                                    Visitantes (Sem Cadastro)
                                </h3>
                                <ul className="space-y-1 text-warm-600 text-xs list-disc pl-4">
                                    <li>Identificador anônimo do dispositivo;</li>
                                    <li>Endereço IP (para persistência temporária de respostas no aparelho);</li>
                                    <li>Progresso armazenado no navegador (localStorage).</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Finalidade */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <FileText size={20} />
                            <h2>3. Finalidade do Tratamento dos Dados</h2>
                        </div>
                        <p>Os dados coletados são utilizados estritamente para:</p>
                        <ul className="space-y-1.5 list-disc pl-5">
                            <li>Autenticação de acesso e controle da sessão de estudo;</li>
                            <li>Acompanhamento pedagógico do progresso dos módulos de aprendizagem;</li>
                            <li>Geração, validação digital e emissão do <strong>Certificado Oficial de 40 horas</strong> emitido pela UFPB;</li>
                            <li>Comunicação de avisos pedagógicos essenciais, verificação de e-mail e recuperação de senha.</li>
                        </ul>
                    </section>

                    {/* 4. Não Compartilhamento */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <EyeOff size={20} />
                            <h2>4. Não Compartilhamento com Terceiros</h2>
                        </div>
                        <p>
                            A plataforma Palieduca <strong>não comercializa, não aluga e não repassa</strong> dados pessoais ou informações de estudantes para terceiros ou parceiros comerciais de qualquer natureza. As informações permanecem resguardadas para fins exclusivamente acadêmicos e educacionais.
                        </p>
                    </section>

                    {/* 5. Direitos do Titular */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <UserCheck size={20} />
                            <h2>5. Seus Direitos como Titular de Dados</h2>
                        </div>
                        <p>
                            Em conformidade com o Artigo 18 da LGPD, você possui o direito de a qualquer momento:
                        </p>
                        <ul className="space-y-1.5 list-disc pl-5">
                            <li>Confirmar a existência de tratamento dos seus dados;</li>
                            <li>Acessar seus dados através do seu Painel de Perfil;</li>
                            <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
                            <li>Solicitar a eliminação dos seus dados pessoais e encerramento de conta.</li>
                        </ul>
                    </section>

                    {/* 6. Contato com o DPO */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <h2 className="text-primary font-bold text-base sm:text-lg">6. Encarregado de Proteção de Dados e Suporte</h2>
                        <p>
                            Caso tenha qualquer dúvida sobre como seus dados são tratados ou deseje exercer seus direitos previstos na LGPD, entre em contato diretamente pelo nosso <Link to="/contato" className="text-primary font-bold underline">Formulário de Contato</Link> ou envie solicitação para <strong>patriciaandrade@palieduca.com.br</strong>.
                        </p>
                    </section>

                </div>
            </main>
        </BotanicalBackground>
    );
};

export default Privacidade;
