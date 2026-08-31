import React, { useRef, useState, useEffect } from 'react';
import { 
    X, 
    Printer, 
    Award, 
    ShieldCheck, 
    CheckCircle2, 
    ExternalLink, 
    Mail, 
    Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose }) => {
    const { user, token } = useAuth();
    const certificateRef = useRef<HTMLDivElement>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [emailSending, setEmailSending] = useState<boolean>(false);
    const [emailSuccess, setEmailSuccess] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');

    const certCode = user ? `PALI-${user.id.toString().padStart(4, '0')}-${new Date().getFullYear()}-UFPB` : '';
    const validationUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/validar/${certCode}` 
        : `https://palieduca.com.br/validar/${certCode}`;

    useEffect(() => {
        if (certCode) {
            QRCode.toDataURL(validationUrl, {
                width: 160,
                margin: 1,
                color: {
                    dark: '#78350F', // Tom âmbar escuro nobre
                    light: '#FFFFFF'
                }
            })
            .then(url => setQrCodeDataUrl(url))
            .catch(err => console.error('Erro ao gerar QR Code:', err));
        }
    }, [certCode, validationUrl]);

    if (!isOpen || !user) return null;

    const issueDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = async () => {
        setEmailSending(true);
        setEmailSuccess('');
        setEmailError('');

        try {
            const res = await fetch(`${API_URL}/api/progress/send-certificate-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                setEmailSuccess('Certificado enviado com sucesso para o seu e-mail!');
                setTimeout(() => setEmailSuccess(''), 6000);
            } else {
                setEmailError(data.detail || 'Erro ao enviar e-mail.');
            }
        } catch (err) {
            setEmailError('Erro de conexão ao solicitar envio do certificado por e-mail.');
        } finally {
            setEmailSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-warm-200 animate-scale-in my-8">
                
                {/* Header dos Botões de Ação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-warm-200 no-print">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Award size={22} />
                        <span>Certificado Oficial de Conclusão</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Botão de Enviar por E-mail */}
                        <button
                            onClick={handleSendEmail}
                            disabled={emailSending}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl font-bold text-xs border border-warm-300 transition-all cursor-pointer disabled:opacity-50"
                            title="Enviar cópia do certificado para o seu e-mail cadastrado"
                        >
                            {emailSending ? <Loader2 size={14} className="animate-spin text-primary" /> : <Mail size={14} className="text-teal-700" />}
                            <span>{emailSending ? 'Enviando...' : 'Enviar para meu E-mail'}</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                            <Printer size={15} /> 
                            <span>Imprimir / PDF</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-full transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Mensagens de Feedback de E-mail */}
                {emailSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 no-print animate-fade-in">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{emailSuccess}</span>
                    </div>
                )}
                {emailError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 no-print animate-fade-in">
                        <X size={16} className="text-rose-600 shrink-0" />
                        <span>{emailError}</span>
                    </div>
                )}

                {/* Estrutura do Certificado */}
                <div 
                    ref={certificateRef}
                    id="printable-certificate"
                    className="relative p-8 md:p-14 bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F0] to-[#F5EFEB] rounded-2xl border-8 border-double border-amber-600/40 shadow-inner text-center overflow-hidden"
                >
                    {/* Marca d'água de Fundo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <Award size={420} className="text-amber-900" />
                    </div>

                    {/* Brasão / Cabeçalho Superior */}
                    <div className="mb-6">
                        <span className="text-[11px] md:text-xs font-black tracking-widest text-amber-900/80 uppercase">
                            Universidade Federal da Paraíba &bull; UFPB
                        </span>
                        <div className="text-[10px] md:text-[11px] font-semibold text-warm-600 uppercase tracking-wider mt-0.5">
                            Centro de Ciências da Saúde &bull; Departamento de Enfermagem
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-serif font-black tracking-wider text-amber-950 uppercase my-4">
                        Certificado de Conclusão
                    </h1>

                    <p className="text-xs md:text-sm text-warm-700 leading-relaxed max-w-2xl mx-auto my-6 font-serif">
                        Certificamos que <strong className="text-warm-950 font-sans text-base md:text-lg border-b-2 border-amber-500/60 pb-0.5 px-1">{user.nome}</strong> concluiu com êxito todas as atividades formativas do curso de extensão e aperfeiçoamento acadêmico em:
                    </p>

                    <div className="my-6 py-4 px-6 bg-white/80 rounded-2xl border border-amber-200/80 inline-block shadow-xs max-w-xl mx-auto">
                        <h2 className="text-base md:text-xl font-bold text-teal-900 font-sans">
                            Cuidados Paliativos em Enfermagem
                        </h2>
                        <p className="text-[11px] md:text-xs text-warm-600 mt-1">
                            Fundamentado nos Princípios Bioéticos, Teoria Histórico-Cultural e Diretrizes da ANCP / EAPC
                        </p>
                    </div>

                    <p className="text-xs text-warm-600 font-medium mb-8">
                        Carga Horária Total: <strong>40 Horas Complementares</strong> &bull; Emitido em João Pessoa - PB, {issueDate}.
                    </p>

                    {/* Assinatura e QR Code de Autenticidade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end pt-6 border-t border-amber-600/20 max-w-2xl mx-auto">
                        
                        {/* Assinatura da Professora */}
                        <div className="flex flex-col items-center">
                            <div className="font-serif italic text-lg text-warm-800 mb-1 border-b border-warm-400 pb-1 w-56 text-center">
                                Patricia M. O. Andrade
                            </div>
                            <span className="text-[11px] font-bold text-warm-900">
                                Prof.ª Dra. Patrícia Maria de Oliveira Andrade
                            </span>
                            <span className="text-[10px] text-warm-500">
                                Docente e Pesquisadora Responsável &bull; UFPB
                            </span>
                        </div>

                        {/* Bloco de Autenticação com QR Code */}
                        <div className="flex items-center justify-center md:justify-end gap-3 bg-white/60 p-3 rounded-xl border border-amber-200 text-left">
                            {qrCodeDataUrl && (
                                <img 
                                    src={qrCodeDataUrl} 
                                    alt="QR Code de Validação" 
                                    className="w-16 h-16 rounded border border-amber-200 bg-white"
                                />
                            )}
                            <div>
                                <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-900 uppercase">
                                    <ShieldCheck size={12} className="text-emerald-600" />
                                    Autenticidade UFPB
                                </div>
                                <span className="text-[10px] font-mono text-warm-800 font-bold block mt-0.5">
                                    {certCode}
                                </span>
                                <a 
                                    href={validationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-teal-700 hover:underline flex items-center gap-0.5 mt-1 font-semibold"
                                >
                                    <span>palieduca.com.br/validar</span>
                                    <ExternalLink size={9} />
                                </a>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default CertificateModal;
