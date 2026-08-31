import React, { useState, useEffect } from 'react';
import { 
    MessageSquare, Send, Bell, RefreshCw, CheckCircle2, 
    Users, Clock, Sparkles, Phone, ShieldCheck 
} from 'lucide-react';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export interface NotificationLog {
    id: number;
    user_id?: number | null;
    type: string;
    recipient: string;
    title?: string | null;
    content: string;
    status: string;
    sent_at: string;
}

export const NotificationCenter: React.FC = () => {
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    
    // Bot Simulator State
    const [simPrompt, setSimPrompt] = useState('Novidades');
    const [simChat, setSimChat] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
        { sender: 'bot', text: '🦋 *Olá! Eu sou o Bot Oficial da PaliEduca (UFPB).*\n\nEnvie *Novidades*, *Progresso*, *Certificado* ou faça qualquer pergunta sobre cuidados paliativos!' }
    ]);
    const [isSimulating, setIsSimulating] = useState(false);

    // Test WhatsApp State
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

    // Broadcast State
    const [broadcastChannel, setBroadcastChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
    const [broadcastGroup, setBroadcastGroup] = useState<'all' | 'inactive_5_days' | 'completed'>('inactive_5_days');
    const [broadcastTitle, setBroadcastTitle] = useState('Aviso Pedagógico PaliEduca');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const fetchLogs = async () => {
        if (!token) return;
        setLoadingLogs(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/notifications/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Erro ao buscar logs de notificação:', err);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSendTestWhatsApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testPhone.trim() || !token) return;
        setIsSendingTest(true);
        setTestResult(null);

        try {
            const res = await fetch(`${API_URL}/api/admin/notifications/test-whatsapp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    telefone: testPhone,
                    mensagem: testMessage.trim() || undefined
                })
            });

            const data = await res.json();
            if (res.ok) {
                setTestResult({ 
                    success: true, 
                    msg: `✅ Mensagem enviada para ${data.formatted_to || testPhone}! (${data.detail})` 
                });
                fetchLogs();
            } else {
                setTestResult({ success: false, msg: `❌ Erro: ${data.detail || 'Falha no disparo'}` });
            }
        } catch (err: any) {
            setTestResult({ success: false, msg: `❌ Falha na conexão: ${err.message}` });
        } finally {
            setIsSendingTest(false);
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMessage.trim() || !token) return;
        setIsBroadcasting(true);
        setBroadcastResult(null);

        try {
            const res = await fetch(`${API_URL}/api/admin/notifications/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    channel: broadcastChannel,
                    target_group: broadcastGroup,
                    title: broadcastTitle,
                    message: broadcastMessage
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBroadcastResult(`📢 Disparo concluído! ${data.target_students_found} alunos encontrados (${data.sent_count} entregues, ${data.simulated_count} homologados).`);
                setBroadcastMessage('');
                fetchLogs();
            } else {
                setBroadcastResult(`❌ Erro no disparo: ${data.detail || 'Falha ao processar envio'}`);
            }
        } catch (err: any) {
            setBroadcastResult(`❌ Falha na conexão: ${err.message}`);
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleSimulateBotMessage = async (msgToSend?: string) => {
        const text = (msgToSend || simPrompt).trim();
        if (!text) return;
        
        setSimChat(prev => [...prev, { sender: 'user', text }]);
        setSimPrompt('');
        setIsSimulating(true);

        try {
            const res = await fetch(`${API_URL}/api/twilio/whatsapp/simulate-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telefone: testPhone || '+5583999998888',
                    mensagem: text
                })
            });
            if (res.ok) {
                const data = await res.json();
                setSimChat(prev => [...prev, { sender: 'bot', text: data.bot_reply }]);
            } else {
                setSimChat(prev => [...prev, { sender: 'bot', text: '❌ Erro ao obter resposta do bot.' }]);
            }
        } catch (err: any) {
            setSimChat(prev => [...prev, { sender: 'bot', text: `❌ Erro de conexão: ${err.message}` }]);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header com Badge Twilio */}
            <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-slate-900 border border-teal-200 dark:border-teal-800/60 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-sm">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-warm-900 dark:text-white flex items-center gap-2">
                            Central de Notificações & WhatsApp Twilio
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-300 dark:border-emerald-700">
                                Twilio Ativo
                            </span>
                        </h2>
                        <p className="text-xs text-warm-600 dark:text-slate-300">
                            Disparos automáticos de parabéns por módulo, lembrete para alunos inativos e Bot interativo de novidades.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchLogs}
                    disabled={loadingLogs}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-warm-50 dark:hover:bg-slate-700 text-warm-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-warm-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                >
                    <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
                    Atualizar Histórico
                </button>
            </div>

            {/* ℹ️ Guia de Ativação do WhatsApp Twilio Sandbox */}
            <div className="p-5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-3xl">
                <div className="flex items-start gap-3">
                    <span className="text-xl">📲</span>
                    <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
                        <h4 className="font-black text-sm text-amber-900 dark:text-amber-100">
                            Como receber mensagens no seu WhatsApp (Modo Sandbox do Twilio):
                        </h4>
                        <p>
                            1. No seu WhatsApp real, envie uma mensagem com o código do seu Sandbox (ex: <code>join &lt;código&gt;</code>) para o número oficial do Twilio: <strong>+1 415 523 8886</strong>.
                        </p>
                        <p>
                            2. Depois de receber a confirmação no WhatsApp, qualquer teste disparado abaixo chegará diretamente no seu celular!
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══ NOVIDADE: SIMULADOR DO BOT DE WHATSAPP ═══ */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <div>
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Simulador do Bot de WhatsApp & Tutor IA (Prof.ª Patrícia)</h3>
                            <p className="text-[11px] text-warm-500 dark:text-slate-400">Teste como o bot responde a perguntas de alunos, novidades de aulas e progresso</p>
                        </div>
                    </div>

                    {/* Chips de Atalho */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => handleSimulateBotMessage('Novidades')}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                        >
                            1️⃣ Novidades
                        </button>
                        <button
                            onClick={() => handleSimulateBotMessage('Progresso')}
                            className="px-2.5 py-1 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 text-sky-800 dark:text-sky-300 text-[11px] font-bold rounded-lg border border-sky-200 dark:border-sky-800 cursor-pointer"
                        >
                            2️⃣ Meu Progresso
                        </button>
                        <button
                            onClick={() => handleSimulateBotMessage('Certificado')}
                            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-bold rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer"
                        >
                            3️⃣ Certificado
                        </button>
                        <button
                            onClick={() => handleSimulateBotMessage('Como manejar dor oncológica refratária?')}
                            className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-800 dark:text-purple-300 text-[11px] font-bold rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
                        >
                            💡 Dúvida Clínica (IA)
                        </button>
                    </div>
                </div>

                {/* Janela de Chat Estilo WhatsApp */}
                <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-2xl border border-warm-200 dark:border-slate-800 min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 font-sans">
                    {simChat.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                                    msg.sender === 'user'
                                        ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-warm-900 dark:text-white rounded-tr-none'
                                        : 'bg-white dark:bg-[#202c33] text-warm-900 dark:text-slate-100 rounded-tl-none border border-warm-100 dark:border-transparent'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isSimulating && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-[#202c33] text-warm-600 dark:text-slate-300 text-xs px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <span className="animate-pulse font-bold">Prof.ª Patrícia digitando...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input do Simulador */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSimulateBotMessage();
                    }}
                    className="mt-3 flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={simPrompt}
                        onChange={(e) => setSimPrompt(e.target.value)}
                        placeholder="Digite uma mensagem ou comando (ex: Novidades, Progresso, O que são cuidados paliativos?)..."
                        className="flex-1 px-4 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={isSimulating || !simPrompt.trim()}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <Send size={14} /> Enviar
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Teste Rápido de WhatsApp (5 cols) */}
                <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Phone size={18} className="text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Testar Envio de WhatsApp</h3>
                        </div>

                        <form onSubmit={handleSendTestWhatsApp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Número com DDD (ex: 83999998888 ou +5583999998888)
                                </label>
                                <input
                                    type="text"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="(83) 99999-8888"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Mensagem Personalizada (Opcional)
                                </label>
                                <textarea
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    placeholder="Deixe em branco para usar o texto padrão oficial da PaliEduca..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>

                            {testResult && (
                                <div className={`p-3 rounded-xl text-xs font-semibold ${testResult.success ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200' : 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/60 dark:text-red-200'}`}>
                                    {testResult.msg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSendingTest || !testPhone.trim()}
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Send size={14} />
                                {isSendingTest ? 'Disparando pelo Twilio...' : 'Enviar Teste pelo WhatsApp'}
                            </button>
                        </form>
                    </div>

                    <div className="mt-4 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-950 dark:text-emerald-200">
                        🛡️ Mensagens enviadas em conformidade com o opt-in de alunos da UFPB.
                    </div>
                </div>

                {/* 2. Disparo em Massa & Reengajamento (7 cols) */}
                <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Bell size={18} className="text-teal-600 dark:text-teal-400" />
                            <h3 className="text-sm font-bold text-warm-900 dark:text-white">Reengajamento & Comunicados da Turma</h3>
                        </div>

                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                        Canal de Envio
                                    </label>
                                    <select
                                        value={broadcastChannel}
                                        onChange={(e: any) => setBroadcastChannel(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 font-semibold"
                                    >
                                        <option value="whatsapp">Apenas WhatsApp</option>
                                        <option value="email">Apenas E-mail</option>
                                        <option value="both">WhatsApp + E-mail</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                        Público-Alvo
                                    </label>
                                    <select
                                        value={broadcastGroup}
                                        onChange={(e: any) => setBroadcastGroup(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 font-semibold"
                                    >
                                        <option value="inactive_5_days">Alunos Inativos (&gt; 5 dias sem acesso)</option>
                                        <option value="all">Todos os Alunos Cadastrados</option>
                                        <option value="completed">Alunos Já Formados (Com Certificado)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Título do Comunicado
                                </label>
                                <input
                                    type="text"
                                    value={broadcastTitle}
                                    onChange={(e) => setBroadcastTitle(e.target.value)}
                                    placeholder="Ex: Novo material complementar disponível!"
                                    required
                                    className="w-full px-3.5 py-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                                    Texto da Mensagem
                                </label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    placeholder="Escreva a mensagem pedagógica para os alunos..."
                                    rows={3}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-teal-500 resize-none"
                                />
                            </div>

                            {broadcastResult && (
                                <div className="p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 rounded-xl text-xs font-semibold border border-teal-200 dark:border-teal-800">
                                    {broadcastResult}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isBroadcasting || !broadcastMessage.trim()}
                                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Users size={14} />
                                {isBroadcasting ? 'Processando envio...' : 'Disparar Comunicado para o Grupo Selecionado'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ═══ HISTÓRICO DE NOTIFICAÇÕES DISPARADAS ═══ */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-warm-200 dark:border-slate-800 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-warm-700 dark:text-slate-300" />
                        <h3 className="text-sm font-bold text-warm-900 dark:text-white">
                            Histórico Recente de Notificações ({logs.length})
                        </h3>
                    </div>
                </div>

                {logs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-warm-200 dark:border-slate-800 text-warm-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                                    <th className="pb-3 px-3">Canal</th>
                                    <th className="pb-3 px-3">Destinatário</th>
                                    <th className="pb-3 px-3">Assunto / Título</th>
                                    <th className="pb-3 px-3">Status</th>
                                    <th className="pb-3 px-3 text-right">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warm-100 dark:divide-slate-800/60">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-warm-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3 px-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                                WhatsApp
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-warm-800 dark:text-slate-200">
                                            {log.recipient}
                                        </td>
                                        <td className="py-3 px-3 text-warm-700 dark:text-slate-300 max-w-[280px] truncate" title={log.content}>
                                            {log.title || 'Notificação PaliEduca'}
                                        </td>
                                        <td className="py-3 px-3">
                                            {log.status === 'sent' ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                                                    <CheckCircle2 size={12} /> Entregue
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400 font-bold text-[11px]">
                                                    <ShieldCheck size={12} /> Homologado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right text-warm-500 dark:text-slate-400 text-[11px]">
                                            {new Date(log.sent_at).toLocaleString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-warm-400 dark:text-slate-500">
                        <Sparkles size={24} className="mx-auto mb-2 text-teal-600 dark:text-teal-400" />
                        <p className="text-xs font-semibold">Nenhuma notificação enviada ainda.</p>
                        <p className="text-[11px] mt-0.5">As mensagens de parabéns e lembretes aparecerão aqui automaticamente conforme os alunos avançarem nas aulas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
