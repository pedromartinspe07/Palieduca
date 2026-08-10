import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pencil, CheckCircle2, Loader2, X } from 'lucide-react';

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
                    <div key={mod.id} className="bg-white p-5 rounded-2xl border border-warm-100 shadow-sm transition-all hover:shadow-md">
                        {editingId === mod.id ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">Título do Módulo</label>
                                    <input 
                                        type="text" 
                                        value={editForm.title}
                                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                                        className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">Descrição (Aparece no card)</label>
                                    <textarea 
                                        value={editForm.description}
                                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                                        className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-warm-700 mb-1">URL da Imagem de Fundo</label>
                                    <input 
                                        type="text" 
                                        value={editForm.image_url}
                                        onChange={e => setEditForm({...editForm, image_url: e.target.value})}
                                        className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    />
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
        </div>
    );
};

export default ModuleEditor;
