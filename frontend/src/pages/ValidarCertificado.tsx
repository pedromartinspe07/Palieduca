import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Award, 
    ShieldCheck, 
    CheckCircle2, 
    XCircle, 
    Search, 
    Building2, 
    Calendar, 
    Clock, 
    ArrowLeft, 
    Copy, 
    Check, 
    FileCheck2, 
    Loader2 
} from 'lucide-react';
import BotanicalBackground from '../components/effects/BotanicalBackground';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface ValidationData {
    valid: boolean;
    code: string;
    student_name?: string;
    student_id?: number;
    course_name: string;
    workload_hours: number;
    institution: string;
    department: string;
    coordinator: string;
    issue_date?: string;
    issue_year?: number;
    status_label: string;
    message: string;
}

const ValidarCertificado: React.FC = () => {
    const { code: urlCode } = useParams<{ code?: string }>();
    const navigate = useNavigate();

    const [inputCode, setInputCode] = useState(urlCode || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ValidationData | null>(null);
    const [copied, setCopied] = useState(false);

    const handleValidate = useCallback(async (codeToValidate: string) => {
        const clean = codeToValidate.trim().toUpperCase();
        if (!clean) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(`${API_URL}/api/certificates/validate/${encodeURIComponent(clean)}`);
            if (res.ok) {
                const data: ValidationData = await res.json();
                setResult(data);
            } else {
                setResult({
                    valid: false,
                    code: clean,
                    course_name: 'Cuidados Paliativos em Enfermagem',
                    workload_hours: 40,
                    institution: 'Universidade Federal da Paraíba (UFPB)',
                    department: 'Departamento de Enfermagem',
                    coordinator: 'Prof.ª Patrícia Maria de Oliveira Andrade',
                    status_label: 'NÃO LOCALIZADO',
                    message: 'Não foi possível validar o código informado. Verifique se digitou corretamente.'
                });
            }
        } catch (err) {
            console.error('Erro ao validar certificado:', err);
            setResult({
                valid: false,
                code: clean,
                course_name: 'Cuidados Paliativos em Enfermagem',
                workload_hours: 40,
                institution: 'Universidade Federal da Paraíba (UFPB)',
                department: 'Departamento de Enfermagem',
                coordinator: 'Prof.ª Patrícia Maria de Oliveira Andrade',
                status_label: 'ERRO DE CONEXÃO',
                message: 'Ocorreu uma instabilidade ao consultar a base de dados da UFPB. Tente novamente em instantes.'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (urlCode) {
            setInputCode(urlCode);
            handleValidate(urlCode);
        }
    }, [urlCode, handleValidate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode.trim()) {
            navigate(`/validar/${inputCode.trim().toUpperCase()}`);
            handleValidate(inputCode.trim());
        }
    };

    const handleCopyLink = () => {
        if (typeof window !== 'undefined' && result?.code) {
            const shareUrl = `${window.location.origin}/validar/${result.code}`;
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
            <main className="max-w-4xl mx-auto">
                
                {/* Botão de Retorno */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-warm-700 hover:text-primary transition-colors font-semibold bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-warm-200 shadow-xs text-xs"
                    >
                        <ArrowLeft size={16} />
                        Voltar para a Página Inicial
                    </Link>
                </div>

                {/* Card de Cabeçalho e Busca */}
                <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl mb-8 text-center relative overflow-hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-teal-700 text-white mb-4 shadow-md">
                        <Award size={34} />
                    </div>

                    <div className="inline-block">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-bold text-[11px] mb-3 shadow-2xs uppercase tracking-wider">
                            <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                            Portal de Autenticidade Acadêmica UFPB
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-3 tracking-tight font-display">
                        Validação Pública de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-teal-700 to-emerald-700">Certificados</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-light">
                        Verifique a autenticidade e validade oficial de certificados emitidos pelo programa de extensão e aperfeiçoamento em <strong>Cuidados Paliativos em Enfermagem</strong> da UFPB.
                    </p>

                    {/* Formulário de Busca por Código */}
                    <form onSubmit={handleSubmit} className="mt-8 max-w-lg mx-auto">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="Digite o código (ex: PALI-0001-2026-UFPB)"
                                className="w-full pl-5 pr-32 py-3.5 bg-warm-50/90 border border-warm-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs sm:text-sm text-warm-900 placeholder:text-warm-400 font-mono transition-all outline-none uppercase font-semibold"
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputCode.trim()}
                                className="absolute right-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-teal-700 hover:from-amber-700 hover:to-teal-800 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                <span>Verificar</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-12 text-center bg-white/80 backdrop-blur-xl rounded-3xl border border-warm-200 shadow-sm flex flex-col items-center justify-center animate-fade-in">
                        <Loader2 className="animate-spin text-amber-600 w-10 h-10 mb-3" />
                        <h4 className="font-bold text-sm text-warm-900">Consultando base de dados oficial da UFPB...</h4>
                        <p className="text-xs text-warm-500 mt-1">Verificando assinaturas digitais e requisitos acadêmicos</p>
                    </div>
                )}

                {/* Resultado da Validação */}
                {!loading && result && (
                    <div className="animate-scale-up">
                        {result.valid ? (
                            /* Cartão de Certificado VÁLIDO & AUTENTICADO */
                            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F0] to-[#F5EFEB] border-4 border-emerald-500/40 shadow-2xl relative overflow-hidden">
                                
                                {/* Selo de Autenticidade Superior */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-300/80 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300 shadow-xs">
                                            <CheckCircle2 size={28} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                                                {result.status_label}
                                            </span>
                                            <h3 className="text-base font-extrabold text-warm-900 mt-1">
                                                Documento Acadêmico Autêntico
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Botão de Compartilhar Link */}
                                    <button
                                        onClick={handleCopyLink}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-warm-300 text-warm-700 hover:text-emerald-800 hover:border-emerald-400 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                                        title="Copiar link permanente desta validação"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                        <span>{copied ? 'Link Copiado!' : 'Copiar Link Oficial'}</span>
                                    </button>
                                </div>

                                {/* Dados do Estudante e Curso */}
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">
                                            Estudante Diplomado(a)
                                        </span>
                                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mt-1">
                                            {result.student_name}
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                        <div className="p-4 bg-white/80 rounded-2xl border border-warm-200">
                                            <div className="flex items-center gap-2 text-warm-500 text-xs mb-1 font-semibold">
                                                <FileCheck2 size={15} className="text-amber-600" />
                                                <span>Curso / Programa</span>
                                            </div>
                                            <p className="font-bold text-sm text-warm-900 leading-snug">
                                                {result.course_name}
                                            </p>
                                        </div>

                                        <div className="p-4 bg-white/80 rounded-2xl border border-warm-200">
                                            <div className="flex items-center gap-2 text-warm-500 text-xs mb-1 font-semibold">
                                                <Clock size={15} className="text-teal-600" />
                                                <span>Carga Horária</span>
                                            </div>
                                            <p className="font-bold text-sm text-warm-900">
                                                {result.workload_hours} Horas Acadêmicas
                                            </p>
                                        </div>

                                        <div className="p-4 bg-white/80 rounded-2xl border border-warm-200">
                                            <div className="flex items-center gap-2 text-warm-500 text-xs mb-1 font-semibold">
                                                <Calendar size={15} className="text-emerald-600" />
                                                <span>Ano / Emissão</span>
                                            </div>
                                            <p className="font-bold text-sm text-warm-900">
                                                {result.issue_date || result.issue_year}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Instituição e Coordenação */}
                                    <div className="p-5 rounded-2xl bg-white/90 border border-warm-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-100/70 rounded-xl text-amber-800">
                                                <Building2 size={22} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs text-warm-900">{result.institution}</h4>
                                                <p className="text-[11px] text-warm-500">{result.department}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="text-[10px] uppercase font-bold text-warm-400">Docente Responsável</span>
                                            <p className="font-serif font-bold text-xs text-warm-800">{result.coordinator}</p>
                                        </div>
                                    </div>

                                    {/* Código Criptográfico */}
                                    <div className="pt-2 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-xs font-bold shadow-2xs">
                                            <ShieldCheck size={14} className="text-emerald-600" />
                                            Código de Autenticidade: {result.code}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Cartão de Certificado INVÁLIDO ou NÃO ENCONTRADO */
                            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white border-2 border-red-200 shadow-xl text-center">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
                                    <XCircle size={32} />
                                </div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700 bg-red-100/80 px-3 py-1 rounded-full border border-red-200">
                                    {result.status_label}
                                </span>
                                <h3 className="text-xl font-extrabold text-warm-900 mt-3 mb-2">
                                    Não foi possível validar este certificado
                                </h3>
                                <p className="text-xs sm:text-sm text-warm-600 max-w-md mx-auto leading-relaxed">
                                    {result.message}
                                </p>
                                <div className="mt-6 pt-6 border-t border-warm-100 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setInputCode(''); setResult(null); }}
                                        className="px-5 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                    >
                                        Digitar Outro Código
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </BotanicalBackground>
    );
};

export default ValidarCertificado;
