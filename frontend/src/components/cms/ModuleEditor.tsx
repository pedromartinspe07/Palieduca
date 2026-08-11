import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pencil, CheckCircle2, Loader2, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
        <div className="mt-8 bg-white/50 border border-warm-200 rounded-3xl p-6 shadow-inner">
            <h3 className="text-xl font-bold text-warm-900 mb-6 flex items-center gap-2">
                <Pencil className="text-secondary" /> Editor de Conteúdo (Módulos)
            </h3>

            {successMessage && (
                <div className="mb-6 p-4 bg-sage-50 text-sage-700 rounded-xl flex items-center gap-2 border border-sage-200 animate-fade-in">
                    <CheckCircle2 size={20} />
                    {successMessage}
                </div>
            )}

            <div className="space-y-4">
                {modules.map((mod) => (
                    <div key={mod.id} className="bg-white p-5 rounded-3xl border border-warm-100 shadow-sm transition-all hover:shadow-xl">
                        {editingId === mod.id ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">Título do Módulo</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">Descrição (Aparece no card)</label>
                                    <div className="bg-white rounded-xl overflow-hidden border border-warm-200">
                                        <ReactQuill 
                                            theme="snow"
                                            value={editForm.description}
                                            onChange={value => setEditForm({ ...editForm, description: value })}
                                            className="h-32 mb-10 custom-quill-module"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">URL da Imagem de Fundo</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editForm.image_url}
                                            onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                                            className="flex-1 p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => setShowMediaLibrary(true)}
                                            className="px-4 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 font-medium rounded-xl border border-warm-200 transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <ImageIcon size={18} />
                                            Biblioteca
                                        </button>
                                        <label className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl border border-primary/20 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
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
                                        className="px-5 py-2.5 bg-warm-100 text-warm-700 font-medium rounded-xl hover:bg-warm-200 transition-colors flex items-center gap-2"
                                    >
                                        <X size={18} /> Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-warm-900 text-lg">{mod.title}</h4>
                                    <p className="text-sm text-warm-500 line-clamp-1">{mod.description}</p>
                                </div>
                                <button
                                    onClick={() => handleEdit(mod)}
                                    className="shrink-0 px-4 py-2 text-sm bg-warm-50 border border-warm-200 text-warm-700 hover:bg-primary/10 hover:text-primary hover:border-primary/30 rounded-lg transition-colors font-medium flex items-center gap-2"
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
            `}</style>
        </div>
    );
};

export default ModuleEditor;
