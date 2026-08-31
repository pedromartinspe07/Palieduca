import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Mail, 
    Send, 
    Building2, 
    MapPin, 
    User, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    ArrowLeft, 
    Sparkles, 
    HelpCircle, 
    Award, 
    BookOpen 
} from 'lucide-react';
import BotanicalBackground from '../components/effects/BotanicalBackground';
import { useAuth } from '../context/AuthContext';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const CATEGORIES = [
    { id: 'Dúvidas Acadêmicas', label: 'Dúvidas Acadêmicas / Conteúdo das Aulas', icon: BookOpen },
    { id: 'Certificado Oficial', label: 'Emissão e Validação de Certificado', icon: Award },
    { id: 'Suporte Técnico', label: 'Acesso e Dificuldade Técnica', icon: HelpCircle },
    { id: 'Pesquisa e Parcerias', label: 'Pesquisa Científica e Parcerias Institucionais', icon: Building2 },
    { id: 'Sugestões', label: 'Sugestões Pedagógicas ou Elogios', icon: Sparkles }
];

const Contato: React.FC = () => {
    const { user } = useAuth();

    const [nome, setNome] = useState(user?.nome || '');
    const [email, setEmail] = useState(user?.email || '');
    const [categoria, setCategoria] = useState('Dúvidas Acadêmicas');
    const [assunto, setAssunto] = useState('');
    const [mensagem, setMensagem] = useState('');

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (mensagem.trim().length < 10) {
            setErrorMsg('Por favor, escreva uma mensagem com pelo menos 10 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim(),
                    categoria,
                    assunto: assunto.trim() || `Contato: ${categoria}`,
                    mensagem: mensagem.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Não foi possível enviar a mensagem. Tente novamente.');
            }

            setSuccessMsg(data.message || 'Sua mensagem foi enviada com sucesso para a coordenação do Palieduca/UFPB!');
            setAssunto('');
            setMensagem('');
        } catch (err: any) {
            setErrorMsg(err.message || 'Erro de conexão ao enviar mensagem.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BotanicalBackground showButterflies={true} showWaves={true} showFoliage={true} className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
            <main className="max-w-6xl mx-auto">
                
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

                {/* Card de Cabeçalho */}
                <div className="p-8 sm:p-10 rounded-[2.5rem] border border-white/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl mb-8 text-center relative overflow-hidden">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-600 to-teal-700 text-white mb-4 shadow-md">
                        <Mail size={34} />
                    </div>

                    <div className="inline-block">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 font-bold text-[11px] mb-3 shadow-2xs uppercase tracking-wider">
                            <Building2 size={13} className="text-sky-700 dark:text-sky-400" />
                            Secretaria Acadêmica &amp; Coordenação Docente
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0f172a] dark:text-slate-50 mb-3 tracking-tight font-display">
                        Fale com a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-teal-700 to-emerald-700">Coordenação Palieduca</span>
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
                        Canal oficial para esclarecimento de dúvidas pedagógicas, emissão de certificados, orientações acadêmicas e contato com a equipe de pesquisa da UFPB.
                    </p>
                </div>

                {/* Grid Duplo: Informações Institucionais + Formulário */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Coluna Esquerda: Dados Institucionais (5 colunas) */}
                    <div className="lg:col-span-5 space-y-5">
                        
                        {/* Card Instituição */}
                        <div className="p-6 sm:p-7 rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/90 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-warm-400">Instituição Vinculada</span>
                                    <h3 className="font-bold text-sm text-warm-900 leading-tight">
                                        Universidade Federal da Paraíba (UFPB)
                                    </h3>
                                </div>
                            </div>
                            <p className="text-xs text-warm-600 leading-relaxed">
                                Centro de Ciências da Saúde (CCS) &bull; Departamento de Enfermagem &bull; Programa de Pós-Graduação em Enfermagem (PPGENF).
                            </p>
                        </div>

                        {/* Card Coordenação */}
                        <div className="p-6 sm:p-7 rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/90 shadow-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                                    <User size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-warm-400">Docente e Pesquisadora</span>
                                    <h3 className="font-bold text-sm text-warm-900 leading-tight">
                                        Prof.ª Dra. Patrícia Maria de Oliveira Andrade
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-warm-100 text-xs text-warm-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-primary" />
                                    <a href="mailto:patriciaandrade@palieduca.com.br" className="text-primary font-bold hover:underline">
                                        patriciaandrade@palieduca.com.br
                                    </a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-warm-400" />
                                    <span>Campus I &bull; João Pessoa / PB</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-warm-400" />
                                    <span>Segunda a Sexta, 08h às 18h</span>
                                </div>
                            </div>
                        </div>

                        {/* Card Rápido para Validação de Certificado */}
                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Award size={24} className="text-amber-700" />
                                <div className="text-xs">
                                    <h4 className="font-bold text-amber-950">Precisa validar um certificado?</h4>
                                    <p className="text-amber-800 text-[11px]">Consulte autenticidade por QR Code ou código.</p>
                                </div>
                            </div>
                            <Link to="/validar" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all shrink-0">
                                Validar
                            </Link>
                        </div>
                    </div>

                    {/* Coluna Direita: Formulário de Contato (7 colunas) */}
                    <div className="lg:col-span-7">
                        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white/90 backdrop-blur-xl border border-white/90 shadow-xl relative">
                            
                            <h2 className="text-xl font-bold text-warm-900 mb-2">Envie sua Mensagem</h2>
                            <p className="text-xs text-warm-500 mb-6 leading-relaxed">
                                Preencha os campos abaixo. Nossa coordenação pedagógica responderá diretamente no seu e-mail institucional.
                            </p>

                            {successMsg && (
                                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2.5 animate-scale-in">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Mensagem Enviada!</strong>
                                        <p className="mt-0.5 text-emerald-800">{successMsg}</p>
                                    </div>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-start gap-2.5">
                                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Não foi possível enviar</strong>
                                        <p className="mt-0.5">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Seu Nome Completo</label>
                                        <input
                                            type="text"
                                            required
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            placeholder="Ex: Maria Silva"
                                            className="w-full px-4 py-2.5 bg-warm-50/90 border border-warm-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-warm-700 mb-1.5">Seu E-mail</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="exemplo@ufpb.br ou seu e-mail"
                                            className="w-full px-4 py-2.5 bg-warm-50/90 border border-warm-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-warm-700 mb-1.5">Categoria do Assunto</label>
                                    <select
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-warm-50/90 border border-warm-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-warm-900 font-medium"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-warm-700 mb-1.5">Assunto Resumido</label>
                                    <input
                                        type="text"
                                        required
                                        value={assunto}
                                        onChange={(e) => setAssunto(e.target.value)}
                                        placeholder="Ex: Dúvida sobre o Módulo 3 de Dor e Sintomas"
                                        className="w-full px-4 py-2.5 bg-warm-50/90 border border-warm-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-warm-700 mb-1.5">Sua Mensagem</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={mensagem}
                                        onChange={(e) => setMensagem(e.target.value)}
                                        placeholder="Descreva detalhadamente sua dúvida, solicitação ou observação..."
                                        className="w-full px-4 py-3 bg-warm-50/90 border border-warm-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none transition-all leading-relaxed"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !nome || !email || !mensagem}
                                    className="w-full py-3 px-5 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    <span>Enviar Mensagem Acadêmica</span>
                                </button>
                            </form>

                        </div>
                    </div>
                </div>
            </main>
        </BotanicalBackground>
    );
};

export default Contato;
