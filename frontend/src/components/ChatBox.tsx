import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, X, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const ChatBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: 'Olá! Sou seu assistente de estudos in Cuidados Paliativos. Como posso ajudar com sua aprendizagem hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Foca automaticamente no input ao abrir o chat
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [messages, isOpen, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        // Define dinamicamente o endpoint com base em onde o app está rodando
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://127.0.0.1:8000/api/chat'
            : 'https://palieduca.onrender.com/api/chat';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // Remove propriedades extras indesejadas antes de enviar ao backend
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) {
                throw new Error(`Erro do servidor: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.reply;

            if (!botResponse) {
                throw new Error("Resposta inválida do servidor.");
            }

            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
        } catch (err: any) {
            console.error(err);
            setError("Não foi possível obter resposta do assistente. Tente novamente em instantes.");
        } finally {
            setIsLoading(false);
            // Devolve o foco para o input após o envio
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    // Helper simples para formatar quebras de linha e negritos (**) vindos da IA
    const renderMessageContent = (content: string) => {
        return content.split('\n').map((line, lineIdx) => {
            // Processa negritos alternando partes normais e em negrito
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
                    {parts.map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIdx} className="font-semibold text-warm-950 dark:text-white">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {isOpen ? (
                <div className="bg-white/75 backdrop-blur-xl rounded-[2.5rem] w-80 sm:w-[400px] h-[550px] flex flex-col overflow-hidden animate-slide-up shadow-[0_25px_50px_-12px_rgba(74,94,84,0.25)] border border-white/60 ring-1 ring-black/5">

                    {/* Header com estética brilhante / Vidro */}
                    <div className="p-4 border-b border-warm-100 bg-gradient-to-r from-warm-50/90 to-white/90 backdrop-blur-md flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full ring-4 ring-primary/5 shadow-inner">
                                <Sparkles size={20} className="text-primary animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-bold text-warm-900 text-sm tracking-wide">Assistente Palieduca</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    <p className="text-xs text-sage-600 font-medium">Conectado ao Servidor</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-warm-400 hover:text-warm-700 hover:bg-warm-100/80 p-2 rounded-full transition-all duration-200 hover:scale-105"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Área das Mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-warm-50/30 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div
                                    className={`max-w-[85%] p-3.5 text-sm shadow-sm leading-relaxed transition-all transform hover:scale-[1.01] ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-primary via-primary to-sage-600 text-white rounded-2xl rounded-tr-[4px]'
                                        : 'bg-white/95 backdrop-blur-md text-warm-800 rounded-2xl rounded-tl-[4px] border border-warm-100 font-light'
                                        }`}
                                >
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        ))}

                        {/* Indicador de carregamento aprimorado */}
                        {isLoading && (
                            <div className="flex justify-start items-center gap-2 animate-pulse">
                                <div className="bg-white/95 backdrop-blur-md border border-warm-100 py-3.5 px-5 rounded-2xl rounded-tl-[4px] shadow-sm flex items-center gap-2 text-xs text-sage-600 font-medium">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                    <span>Pensando na resposta...</span>
                                </div>
                            </div>
                        )}

                        {/* Mensagem de Erro amigável */}
                        {error && (
                            <div className="flex items-start gap-2.5 text-rose-700 bg-rose-50/95 p-3.5 rounded-2xl border border-rose-100 text-xs shadow-md animate-shake">
                                <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                                <div>
                                    <p className="font-semibold">Erro de Conexão</p>
                                    <p className="mt-0.5 opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Área de Input Trancada durante Loading */}
                    <div className="p-4 bg-white/90 border-t border-warm-100 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                disabled={isLoading}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isLoading ? "Aguarde a resposta..." : "Como manejo a dor em Cuidados Paliativos?"}
                                className="flex-1 bg-warm-50/60 border border-warm-200/80 text-warm-900 placeholder-warm-400 text-sm rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-inner disabled:opacity-60 disabled:bg-warm-100"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-1.5 p-2 bg-gradient-to-tr from-primary to-sage-500 text-white rounded-full hover:shadow-md transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-95 flex items-center justify-center h-9 w-9"
                            >
                                <Send size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Botão flutuante com pulso sutil */
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-tr from-primary via-primary to-sage-500 p-4 rounded-full text-white shadow-[0_10px_25px_rgba(74,94,84,0.3)] hover:shadow-[0_15px_30px_rgba(74,94,84,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group relative ring-4 ring-white/20"
                >
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping group-hover:hidden" style={{ animationDuration: '2s' }} />
                    <MessageSquareText size={26} className="group-hover:rotate-6 transition-transform duration-200" />
                </button>
            )}
        </div>
    );
};

export default ChatBox;