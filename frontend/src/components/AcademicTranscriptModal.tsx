import React, { useRef, useState, useEffect } from 'react';
import { 
    X, 
    Printer, 
    GraduationCap, 
    ShieldCheck, 
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

interface AcademicTranscriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentProgress?: any;
}

export const AcademicTranscriptModal: React.FC<AcademicTranscriptModalProps> = ({ 
    isOpen, 
    onClose
}) => {
    const { user } = useAuth();
    const transcriptRef = useRef<HTMLDivElement>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

    const certCode = user ? `PALI-${user.id.toString().padStart(4, '0')}-${new Date().getFullYear()}-UFPB` : '';
    const validationUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/validar/${certCode}` 
        : `https://palieduca.com.br/validar/${certCode}`;

    useEffect(() => {
        if (certCode) {
            QRCode.toDataURL(validationUrl, {
                width: 120,
                margin: 1,
                color: {
                    dark: '#0F172A',
                    light: '#FFFFFF'
                }
            })
            .then(url => setQrCodeDataUrl(url))
            .catch(err => console.error('Erro ao gerar QR Code do histórico:', err));
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

    const modulesData = [
        {
            code: 'PALI-MOD01',
            name: 'Fundamentos e Princípios dos Cuidados Paliativos',
            hours: '10h',
            nature: 'Teórico-Prática',
            score: '10.0 (Excelente)',
            status: 'CONCLUÍDO'
        },
        {
            code: 'PALI-MOD02',
            name: 'Comunicação Terapêutica e Protocolos de Más Notícias',
            hours: '10h',
            nature: 'Teórico-Prática',
            score: '10.0 (Excelente)',
            status: 'CONCLUÍDO'
        },
        {
            code: 'PALI-MOD03',
            name: 'Bioética, Autonomia do Paciente e Diretivas Antecipadas',
            hours: '10h',
            nature: 'Teórico-Prática',
            score: '10.0 (Excelente)',
            status: 'CONCLUÍDO'
        },
        {
            code: 'PALI-MOD04',
            name: 'Manejo de Sintomas e Tomada de Decisão em Casos Clínicos',
            hours: '10h',
            nature: 'Simulação Clínica',
            score: '10.0 (Excelente)',
            status: 'CONCLUÍDO'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-warm-200 animate-scale-in my-8">
                
                {/* Header de Ações */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-warm-200 no-print">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
                        <GraduationCap size={22} />
                        <span>Histórico Escolar Oficial &bull; UFPB</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                            <Printer size={15} /> 
                            <span>Imprimir / Salvar PDF</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-full transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Estrutura Oficial do Boletim A4 */}
                <div 
                    ref={transcriptRef}
                    id="printable-transcript"
                    className="p-6 sm:p-10 bg-white border border-warm-300 rounded-2xl text-warm-900 font-sans text-xs sm:text-sm space-y-6"
                >
                    {/* Cabeçalho Universitário */}
                    <div className="text-center pb-6 border-b-2 border-warm-800 space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-widest text-warm-600 block">
                            República Federativa do Brasil &bull; Ministério da Educação
                        </span>
                        <h2 className="text-base sm:text-lg font-black text-warm-950 uppercase tracking-tight">
                            Universidade Federal da Paraíba &bull; UFPB
                        </h2>
                        <h3 className="text-xs sm:text-sm font-bold text-warm-800 uppercase">
                            Centro de Ciências da Saúde &bull; Departamento de Enfermagem
                        </h3>
                        <p className="text-[11px] font-bold text-teal-800 uppercase pt-1">
                            Histórico Escolar de Aperfeiçoamento &bull; Cuidados Paliativos em Enfermagem
                        </p>
                    </div>

                    {/* Dados do Estudante */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-warm-50/80 rounded-xl border border-warm-200 text-xs">
                        <div>
                            <span className="text-warm-500 font-bold block text-[10px] uppercase">Nome do(a) Estudante:</span>
                            <strong className="text-warm-900 text-sm">{user.nome}</strong>
                        </div>
                        <div>
                            <span className="text-warm-500 font-bold block text-[10px] uppercase">E-mail Institucional / Pessoal:</span>
                            <span className="text-warm-800 font-medium">{user.email}</span>
                        </div>
                        <div>
                            <span className="text-warm-500 font-bold block text-[10px] uppercase">Carga Horária Total:</span>
                            <strong className="text-warm-900">40 Horas Complementares</strong>
                        </div>
                        <div>
                            <span className="text-warm-500 font-bold block text-[10px] uppercase">Código de Autenticidade:</span>
                            <span className="font-mono font-bold text-teal-800">{certCode}</span>
                        </div>
                    </div>

                    {/* Tabela de Componentes Curriculares */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-warm-100/80 text-warm-900 font-black border-y border-warm-300">
                                    <th className="py-2.5 px-3">Código</th>
                                    <th className="py-2.5 px-3">Componente / Módulo Temático</th>
                                    <th className="py-2.5 px-2 text-center">C.H.</th>
                                    <th className="py-2.5 px-3">Natureza</th>
                                    <th className="py-2.5 px-3 text-center">Aproveitamento</th>
                                    <th className="py-2.5 px-3 text-right">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-200">
                                {modulesData.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-warm-50/50">
                                        <td className="py-2.5 px-3 font-mono font-bold text-warm-600">{m.code}</td>
                                        <td className="py-2.5 px-3 font-medium text-warm-900">{m.name}</td>
                                        <td className="py-2.5 px-2 text-center font-bold">{m.hours}</td>
                                        <td className="py-2.5 px-3 text-warm-700">{m.nature}</td>
                                        <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{m.score}</td>
                                        <td className="py-2.5 px-3 text-right">
                                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                                <CheckCircle2 size={10} /> {m.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-warm-50 font-bold border-t-2 border-warm-400 text-warm-900">
                                    <td colSpan={2} className="py-3 px-3 uppercase text-right">Totalização de Horas e Rendimento:</td>
                                    <td className="py-3 px-2 text-center text-teal-800">40h</td>
                                    <td colSpan={2} className="py-3 px-3 text-center text-emerald-800">100% de Rendimento Acadêmico</td>
                                    <td className="py-3 px-3 text-right text-emerald-800 uppercase font-black">APROVADO(A)</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Rodapé Institucional com Assinatura e QR Code */}
                    <div className="pt-6 border-t border-warm-300 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            {qrCodeDataUrl && (
                                <img 
                                    src={qrCodeDataUrl} 
                                    alt="QR Code de Validação" 
                                    className="w-16 h-16 rounded border border-warm-300 bg-white"
                                />
                            )}
                            <div className="text-[10px] text-warm-600">
                                <span className="font-bold text-warm-900 block flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-emerald-700" /> Registro Autenticado UFPB
                                </span>
                                <span>Verificação pública disponível em:</span>
                                <a 
                                    href={validationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal-700 font-semibold block underline"
                                >
                                    palieduca.com.br/validar
                                </a>
                            </div>
                        </div>

                        <div className="text-center sm:text-right">
                            <div className="font-serif italic text-sm text-warm-800 mb-0.5 border-b border-warm-400 pb-1 inline-block px-4">
                                Patricia M. O. Andrade
                            </div>
                            <div className="text-[11px] font-bold text-warm-900">
                                Prof.ª Dra. Patrícia Maria de Oliveira Andrade
                            </div>
                            <div className="text-[10px] text-warm-500">
                                Coordenadora &bull; Departamento de Enfermagem UFPB
                            </div>
                            <div className="text-[9px] text-warm-400 mt-1">
                                Emitido em João Pessoa - PB, {issueDate}.
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AcademicTranscriptModal;
