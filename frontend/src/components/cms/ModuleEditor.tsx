import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pencil, CheckCircle2, Loader2, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import { getModuleIcon } from '../../utils/iconUtils';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

interface ModuleData {
    id: number;
    slug_id: string;
    title: string;
    description: string;
    icon_name: string;
    image_url: string;
}

const ModuleEditor: React.FC = () => {
    const { token } = useAuth();
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', image_url: '' });
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const res = await fetch(`${API_URL}/api/modules`);
            const data = await res.json();
            setModules(data);
        } catch (error) {
            console.error("Erro ao buscar módulos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (mod: ModuleData) => {
        setEditingId(mod.id);
        setEditForm({
            title: mod.title,
            description: mod.description,
            image_url: mod.image_url
        });
        setSuccessMessage('');
    };

    const handleSave = async (id: number) => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/modules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (!res.ok) throw new Error('Erro ao salvar');

            const updatedModule = await res.json();
            setModules(modules.map(m => m.id === id ? updatedModule : m));
            setEditingId(null);
            setSuccessMessage('Conteúdo atualizado com sucesso no site!');

            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            console.error(error);
            alert('Não foi possível salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setEditForm({ ...editForm, image_url: data.url });
            } else {
                alert('Falha ao enviar imagem.');
            }
        } catch (error) {
            console.error('Erro no upload local:', error);
            alert('Erro ao enviar a imagem.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="mt-8 bg-white/50 dark:bg-slate-900/60 border border-warm-200 dark:border-slate-800 rounded-3xl p-6 shadow-inner text-warm-900 dark:text-slate-100">
            <h3 className="text-xl font-bold text-warm-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Pencil className="text-secondary dark:text-teal-400" /> Editor de Conteúdo (Módulos)
            </h3>

            {successMessage && (
                <div className="mb-6 p-4 bg-sage-50 dark:bg-emerald-950/60 text-sage-700 dark:text-emerald-300 rounded-xl flex items-center gap-2 border border-sage-200 dark:border-emerald-800 animate-fade-in">
                    <CheckCircle2 size={20} />
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {modules.map((mod) => (
                    <div key={mod.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-warm-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
                        {editingId === mod.id ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 dark:text-slate-300 mb-1">Título do Módulo</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full p-3 bg-warm-50 dark:bg-slate-950 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 dark:text-slate-300 mb-1">Descrição (Aparece no card)</label>
                                    <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-warm-200 dark:border-slate-700">
                                        <ReactQuill 
                                            theme="snow"
                                            value={editForm.description}
                                            onChange={value => setEditForm({ ...editForm, description: value })}
                                            className="h-32 mb-10 custom-quill-module"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 dark:text-slate-300 mb-1">URL da Imagem de Fundo</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.image_url}
                                            onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                                            className="flex-1 p-3 bg-warm-50 dark:bg-slate-950 border border-warm-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => setShowMediaLibrary(true)}
                                            className="px-4 py-2 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 dark:hover:bg-slate-700 text-warm-700 dark:text-slate-200 font-medium rounded-xl border border-warm-200 dark:border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <ImageIcon size={18} />
                                            Biblioteca
                                        </button>
                                        <label className="px-4 py-2 bg-primary/10 dark:bg-teal-950/60 hover:bg-primary/20 text-primary dark:text-teal-300 font-bold rounded-xl border border-primary/20 dark:border-teal-800/60 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                            Upload (PC)
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLocalUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleSave(mod.id)}
                                        disabled={saving}
                                        className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Salvar no Site
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        disabled={saving}
                                        className="px-5 py-2.5 bg-warm-100 dark:bg-slate-800 text-warm-700 dark:text-slate-300 font-medium rounded-xl hover:bg-warm-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                        <X size={18} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 dark:bg-teal-950/60 p-2.5 rounded-xl text-primary dark:text-teal-400 shrink-0 flex items-center justify-center">
                                        {getModuleIcon(mod.icon_name, 22)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-warm-900 dark:text-slate-100 text-lg">{mod.title}</h4>
                                        <p className="text-sm text-warm-500 dark:text-slate-400 line-clamp-1">{mod.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(mod)}
                                    className="shrink-0 px-4 py-2 text-sm bg-warm-50 dark:bg-slate-800 border border-warm-200 dark:border-slate-700 text-warm-700 dark:text-slate-200 hover:bg-primary/10 dark:hover:bg-teal-950/50 hover:text-primary dark:hover:text-teal-300 hover:border-primary/30 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
                                >
                                    <Pencil size={16} /> Editar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {showMediaLibrary && (
                <MediaLibrary 
                    onClose={() => setShowMediaLibrary(false)}
                    onSelect={(url) => setEditForm({...editForm, image_url: url})} 
                />
            )}
            
            <style>{`
                .custom-quill-module .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid #e7e1d8;
                    background-color: #fdfcfb;
                }
                .custom-quill-module .ql-container {
                    border: none;
                    font-size: 14px;
                    font-family: inherit;
                }
                html.dark .custom-quill-module .ql-toolbar {
                    border-bottom: 1px solid #334155 !important;
                    background-color: #0f172a !important;
                }
                html.dark .custom-quill-module .ql-container {
                    background-color: #020617 !important;
                    color: #f8fafc !important;
                }
            `}</style>
        </div>
    );
};

export default ModuleEditor;
