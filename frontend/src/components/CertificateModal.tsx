import React, { useRef } from 'react';
import { X, Printer, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const certificateRef = useRef<HTMLDivElement>(null);

    if (!isOpen || !user) return null;

    const issueDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const certCode = `PALI-${user.id.toString().padStart(4, '0')}-${new Date().getFullYear()}-UFPB`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-warm-200 animate-scale-in my-8">
                
                {/* Header dos Botões de Ação */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-warm-200 no-print">
                    <div className="flex items-center gap-2 text-primary font-bold">
                        <Award size={22} />
                        <span>Certificado Oficial de Conclusão</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                            <Printer size={16} /> Imprimir / Salvar PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-full transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Estrutura do Certificado */}
                <div 
                    ref={certificateRef}
                    id="printable-certificate"
                    className="relative p-8 md:p-14 bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F0] to-[#F5EFEB] rounded-2xl border-8 border-double border-amber-600/40 shadow-inner text-center overflow-hidden"
                >
                    {/* Marca d'água de Fundo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <Award size={480} className="text-amber-900" />
                    </div>

                    {/* Brasão / Topo */}
                    <div className="relative z-10 mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100/80 border-2 border-amber-500/50 text-amber-700 mb-3 shadow-xs">
                            <Award size={34} />
                        </div>
                        <h2 className="text-sm font-bold tracking-[0.25em] text-amber-800 uppercase">
                            Universidade Federal da Paraíba • Palieduca
                        </h2>
                        <h1 className="text-3xl md:text-4xl font-serif font-black text-warm-900 mt-2 tracking-wide">
                            CERTIFICADO DE CONCLUSÃO
                        </h1>
                    </div>

                    {/* Texto do Certificado */}
                    <div className="relative z-10 space-y-4 max-w-2xl mx-auto my-6 text-warm-800 text-sm md:text-base leading-relaxed">
                        <p className="font-serif italic text-warm-600">
                            Certificamos para os devidos fins acadêmicos e profissionais que
                        </p>
                        
                        <p className="text-2xl md:text-3xl font-serif font-bold text-primary underline decoration-amber-400 decoration-2 underline-offset-8 py-2">
                            {user.nome}
                        </p>
                        
                        <p className="font-serif text-warm-700 leading-relaxed text-xs md:text-sm pt-2">
                            concluiu com êxito o programa de formação e aperfeiçoamento na plataforma <strong>Palieduca</strong>, totalizando todos os módulos, avaliações, casos clínicos e atividades em <strong>Cuidados Paliativos em Enfermagem</strong>, com carga horária total estimada de <strong>40 horas</strong>.
                        </p>
                    </div>

                    {/* Rodapé e Assinaturas */}
                    <div className="relative z-10 pt-10 mt-8 border-t border-warm-300 grid grid-cols-1 md:grid-cols-2 gap-8 items-end text-xs">
                        
                        {/* Assinatura da Professora */}
                        <div className="flex flex-col items-center">
                            <div className="font-serif italic text-base md:text-lg text-warm-800 font-semibold mb-1">
                                Prof.ª Patrícia Maria de Oliveira Andrade
                            </div>
                            <div className="w-56 h-[1.5px] bg-warm-400 mb-1"></div>
                            <p className="text-warm-500 text-[11px]">Docente e Pesquisadora Responsável</p>
                            <p className="text-warm-400 text-[10px]">Departamento de Enfermagem • UFPB</p>
                        </div>

                        {/* Selo e Validação */}
                        <div className="flex flex-col items-center md:items-end text-warm-500 text-[11px]">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-800 font-mono text-[10px] mb-2 font-bold">
                                <ShieldCheck size={12} className="text-amber-600" />
                                {certCode}
                            </div>
                            <p>Emitido em: {issueDate}</p>
                            <p className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                                <CheckCircle2 size={12} /> Autenticidade Verificada Digitalmente
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
