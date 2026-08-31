import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export const AdminAnnouncementControl: React.FC = () => {
    const { token } = useAuth();
    const [message, setMessage] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [alertType, setAlertType] = useState<'info' | 'warning' | 'success'>('info');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusFeedback, setStatusFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const fetchCurrent = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcement`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setMessage(data.message || '');
                    setLinkUrl(data.link_url || '');
                    setLinkText(data.link_text || '');
                    setAlertType(data.type || 'info');
                    setIsActive(data.is_active ?? true);
                }
            }
        } catch (err) {
            console.error('Erro ao carregar aviso atual:', err);
        }
    };

    useEffect(() => {
        fetchCurrent();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !token) return;
        setSaving(true);
        setStatusFeedback(null);

        try {
            const res = await fetch(`${API_URL}/api/admin/announcement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: message.trim(),
                    link_url: linkUrl.trim() || null,
                    link_text: linkText.trim() || null,
                    type: alertType,
                    is_active: isActive
                })
            });

            if (res.ok) {
                setStatusFeedback({ text: 'Aviso global salvo e publicado com sucesso no topo do site!', type: 'success' });
            } else {
                const errData = await res.json();
                setStatusFeedback({ text: errData.detail || 'Erro ao publicar aviso.', type: 'error' });
            }
        } catch (err: any) {
            setStatusFeedback({ text: `Erro de conexão: ${err.message}`, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/announcement`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setIsActive(false);
                setStatusFeedback({ text: 'Aviso global desativado.', type: 'success' });
            }
        } catch (err) {
            console.error('Erro ao desativar aviso:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="glassmorphism p-6 sm:p-7 rounded-3xl border border-warm-200 shadow-sm bg-white dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-warm-100 dark:border-slate-800 pb-4">
                <div>
                    <h3 className="text-base font-bold text-warm-900 dark:text-white flex items-center gap-2">
                        <Megaphone size={18} className="text-emerald-600 dark:text-emerald-400" />
                        Aviso Global no Topo do Site
                    </h3>
                    <p className="text-xs text-warm-500 dark:text-slate-400 mt-0.5">
                        Publique recados urgentes, plantões de dúvidas ou novos casos clínicos visíveis para todos os alunos.
                    </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isActive && message
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-warm-100 dark:bg-slate-800 text-warm-500 dark:text-slate-400'
                }`}>
                    {isActive && message ? '🟢 Ativo' : '⚪ Inativo'}
                </span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                        Mensagem do Comunicado
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ex: 📢 Atenção turma: O Módulo 3 já está liberado com casos clínicos e flashcards atualizados!"
                        rows={2}
                        required
                        className="w-full px-3.5 py-2.5 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-2xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500 font-medium resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                            Estilo Visual
                        </label>
                        <select
                            value={alertType}
                            onChange={(e: any) => setAlertType(e.target.value)}
                            className="w-full px-3 py-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-warm-900 dark:text-white outline-none focus:border-emerald-500"
                        >
                            <option value="info">🟦 Informativo (Azul/Verde)</option>
                            <option value="warning">🟨 Atenção / Urgente (Âmbar)</option>
                            <option value="success">🟩 Comemorativo (Esmeralda)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                            Link de Ação (Opcional)
                        </label>
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Ex: /comunidade ou link externo"
                            className="w-full px-3 py-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-warm-700 dark:text-slate-300 mb-1.5">
                            Texto do Botão
                        </label>
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Ex: Ver Discussão"
                            className="w-full px-3 py-2 bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 rounded-xl text-xs text-warm-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-warm-800 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="rounded border-warm-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Exibir banner no topo do site para todos os visitantes</span>
                    </label>
                </div>

                {statusFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        statusFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {statusFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{statusFeedback.text}</span>
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                    <button
                        type="submit"
                        disabled={saving || !message.trim()}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        <Send size={14} /> {saving ? 'Salvando...' : 'Salvar e Publicar Aviso'}
                    </button>

                    {isActive && (
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={saving}
                            className="px-4 py-2.5 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 text-warm-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Trash2 size={14} /> Desativar Banner
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AdminAnnouncementControl;
