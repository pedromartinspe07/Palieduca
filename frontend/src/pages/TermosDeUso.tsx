import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Scale, 
    ShieldCheck, 
    GraduationCap, 
    Award, 
    BookOpen, 
    AlertCircle, 
    ArrowLeft, 
    CheckCircle2, 
    Printer 
} from 'lucide-react';
import BotanicalBackground from '../components/effects/BotanicalBackground';

const TermosDeUso: React.FC = () => {
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white mb-4 shadow-md">
                        <Scale size={34} />
                    </div>

                    <div className="inline-block">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-bold text-[11px] mb-3 shadow-2xs uppercase tracking-wider">
                            <GraduationCap size={13} className="text-emerald-700 dark:text-emerald-400" />
                            Universidade Federal da Paraíba • Departamento de Enfermagem
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-3 tracking-tight font-display">
                        Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-emerald-700 to-amber-700">Uso do Palieduca</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                        Diretrizes de utilização, direitos acadêmicos, critérios de certificação e responsabilidades do Ambiente Virtual de Aprendizagem em Cuidados Paliativos.
                    </p>
                    <p className="text-[11px] text-warm-400 mt-2">
                        Última atualização: {new Date().getFullYear()} &bull; João Pessoa / PB
                    </p>
                </div>

                {/* Conteúdo dos Termos */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-xl space-y-8 text-warm-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed">
                    
                    {/* 1. Objeto */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <BookOpen size={20} />
                            <h2>1. Objeto e Finalidade da Plataforma</h2>
                        </div>
                        <p>
                            O <strong>Palieduca</strong> é um Ambiente Virtual de Aprendizagem (AVA) voltado ao ensino, pesquisa e aperfeiçoamento profissional em <strong>Cuidados Paliativos em Enfermagem</strong>, concebido no âmbito das atividades acadêmicas do Departamento de Enfermagem da <strong>Universidade Federal da Paraíba (UFPB)</strong> sob coordenação e autoria da <strong>Prof.ª Dra. Patrícia Maria de Oliveira Andrade</strong>.
                        </p>
                        <p>
                            A plataforma oferece trilhas didáticas interativas, casos clínicos baseados em evidências, biblioteca de referências científicas e avaliações formativas destinadas a estudantes e profissionais de enfermagem e saúde.
                        </p>
                    </section>

                    {/* 2. Modos de Acesso */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <ShieldCheck size={20} />
                            <h2>2. Modalidades de Acesso (Visitante e Aluno Cadastrado)</h2>
                        </div>
                        <ul className="space-y-2 list-disc pl-5">
                            <li>
                                <strong>Modo Visitante:</strong> Permite navegação livre pelos conteúdos, realização de leituras, vídeos e simulação de quizzes. O progresso e respostas são armazenados localmente e no aparelho, sem direito à emissão de certificado oficial.
                            </li>
                            <li>
                                <strong>Modo Aluno Cadastrado:</strong> Criação de conta individual e gratuita para registro formal do histórico escolar, cálculo de pontuação, acesso ao perfil e qualificação para emissão do Certificado Oficial UFPB.
                            </li>
                        </ul>
                    </section>

                    {/* 3. Certificação */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <Award size={20} />
                            <h2>3. Emissão de Certificados e Validade Acadêmica</h2>
                        </div>
                        <p>
                            O <strong>Certificado Oficial de Conclusão (40 horas)</strong> é concedido exclusivamente ao estudante formalmente cadastrado que atingir <strong>100% de conclusão</strong> de todas as atividades, leituras e quizzes previstos nos módulos formativos.
                        </p>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-950 flex items-start gap-3">
                            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <strong>Autenticidade Criptográfica:</strong> Cada certificado emitido possui um código único verificável digitalmente através da página pública de validação (<Link to="/validar" className="text-emerald-800 underline font-bold">palieduca.com.br/validar</Link>) ou por leitura do QR Code impresso no documento.
                            </div>
                        </div>
                    </section>

                    {/* 4. Propriedade Intelectual */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-primary font-bold text-base sm:text-lg">
                            <Scale size={20} />
                            <h2>4. Propriedade Intelectual e Direitos Autorais</h2>
                        </div>
                        <p>
                            Todos os textos didáticos, infográficos, casos clínicos, ilustrações, marcas e códigos-fonte disponibilizados na plataforma são de propriedade exclusiva da <strong>Prof.ª Dra. Patrícia Maria de Oliveira Andrade</strong>, dos pesquisadores vinculados e da <strong>Universidade Federal da Paraíba</strong>, protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998).
                        </p>
                        <p>
                            É autorizado o uso para estudo pessoal, citação acadêmica e capacitação profissional, sendo expressamente vedada a comercialização, reprodução não autorizada ou cópia não creditada dos materiais.
                        </p>
                    </section>

                    {/* 5. Caráter Educacional */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base sm:text-lg">
                            <AlertCircle size={20} />
                            <h2>5. Finalidade Educacional e Diretrizes Clínicas</h2>
                        </div>
                        <p>
                            Os conteúdos e casos clínicos apresentados possuem estrita finalidade educacional e de aprimoramento técnico-científico. O atendimento a pacientes reais deve sempre respeitar a avaliação clínica individualizada, protocolos hospitalares e o Código de Ética dos Profissionais de Enfermagem (COFEN).
                        </p>
                    </section>

                    {/* 6. Foro e Contato */}
                    <section className="space-y-3 pt-4 border-t border-warm-100">
                        <h2 className="text-primary font-bold text-base sm:text-lg">6. Dúvidas e Contato</h2>
                        <p>
                            Para dirimir dúvidas sobre estes Termos de Uso ou solicitar informações sobre o projeto de extensão e pesquisa, utilize o nosso <Link to="/contato" className="text-primary font-bold underline">Canal de Contato Oficial</Link> ou envie e-mail para <strong>patriciaandrade@palieduca.com.br</strong>.
                        </p>
                    </section>

                </div>
            </main>
        </BotanicalBackground>
    );
};

export default TermosDeUso;
