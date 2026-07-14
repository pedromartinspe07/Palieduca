import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, X, Send, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
}

const ChatBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: 'Olá! Sou o assistente virtual Palieduca. Como posso ajudar em seus estudos sobre cuidados paliativos hoje?', isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), text: input, isBot: false };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Endpoint to our Python backend
            const response = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.text })
            });

            const data = await response.json();

            const botMessage = { id: (Date.now() + 1).toString(), text: data.reply || "Desculpe, não consegui entender.", isBot: true };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { id: (Date.now() + 1).toString(), text: "Erro ao conectar com o servidor. A API está online?", isBot: true };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="glassmorphism-dark rounded-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-slide-up shadow-2xl border border-slate-700/50">
                    <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 flex justify-between items-center backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Sparkles size={18} className="text-secondary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Assistente Palieduca</h3>
                                <p className="text-xs text-nature-300">Online e pronto para ajudar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/40">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.isBot
                                            ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
                                            : 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 border border-slate-700/50 p-3 rounded-2xl rounded-tl-sm w-16 flex justify-center shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-nature-300" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-md">
                        <div className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pergunte algo..."
                                className="flex-1 bg-slate-900/60 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-1 p-2 bg-secondary text-white rounded-full hover:bg-primary transition-colors disabled:opacity-50 disabled:hover:bg-secondary"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-primary to-secondary p-4 rounded-full text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all animate-bounce"
                    style={{ animationDuration: '3s' }}
                >
                    <MessageSquareText size={28} />
                </button>
            )}
        </div>
    );
};

export default ChatBox;
