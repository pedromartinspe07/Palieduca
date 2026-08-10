import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Loader2, Save, Sparkles, Send, MonitorPlay, BookOpen } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const modulesConfig = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const ModuleContentEditor: React.FC = () => {
    const { token } = useAuth();
    const [modules, setModules] = useState<any[]>([]);
    const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // IA States
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);

    useEffect(() => {
        fetchModulesList();
    }, []);

    useEffect(() => {
        if (selectedModuleSlug) {
            fetchModuleContent(selectedModuleSlug);
        }
    }, [selectedModuleSlug]);

    const fetchModulesList = async () => {
        try {
            const res = await fetch(`${API_URL}/api/modules`);
            const data = await res.json();
            setModules(data);
            if (data.length > 0) {
                setSelectedModuleSlug(data[0].slug_id);
            }
        } catch (error) {
            console.error("Erro ao buscar módulos:", error);
        }
    };

    const fetchModuleContent = async (slug: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/pages/modulo_${slug}`);
            const data = await res.json();
            setContent(data.content || '');
        } catch (error) {
            console.error("Erro ao buscar conteúdo do módulo:", error);
            setContent('');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/pages/modulo_${selectedModuleSlug}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error('Erro ao salvar');

            setSuccessMessage('Módulo atualizado com sucesso!');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            console.error(error);
            alert('Não foi possível salvar as alterações do módulo.');
        } finally {
            setSaving(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setGeneratingAI(true);
        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'Você é um assistente de edição de módulos educacionais do Palieduca. Escreva em formato HTML amigável para React Quill (use <h1>, <p>, <ul>, <li>, <strong>). Não use markdown, apenas HTML.' },
                        { role: 'user', content: aiPrompt }
                    ]
                })
            });

            if (!res.ok) throw new Error('Falha na IA');

            const data = await res.json();
            setContent(prev => prev + (prev ? '<br><br>' : '') + data.response);
            setAiPrompt('');
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar conteúdo com IA.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const selectedModuleData = modules.find(m => m.slug_id === selectedModuleSlug);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
            {/* Esquerda: Ferramentas (40%) */}
            <div className="w-full lg:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2">
                
                {/* Seletor de Módulos */}
                <div className="flex gap-2 flex-wrap bg-white p-3 rounded-2xl border border-warm-200 shadow-sm">
                    {modules.map((m) => (
                        <button
                            key={m.slug_id}
                            onClick={() => setSelectedModuleSlug(m.slug_id)}
                            className={`px-3 py-1.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                                selectedModuleSlug === m.slug_id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-warm-50 text-warm-700 hover:bg-warm-100 border border-warm-200'
                            }`}
                        >
                            {m.title}
                        </button>
                    ))}
                </div>

                {/* Copiloto IA */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold">
                        <Sparkles size={18} />
                        Copiloto IA (Llama 3.3)
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Ex: Crie 2 parágrafos sobre bioética..."
                            className="flex-1 px-3 py-2 rounded-xl border border-purple-200 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                        />
                        <button
                            onClick={handleAIGenerate}
                            disabled={generatingAI || !aiPrompt.trim()}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white p-2 px-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
                        >
                            {generatingAI ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>

                {/* Editor Quill */}
                <div className="flex flex-col flex-1 bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-3 border-b border-warm-200 bg-warm-50 text-sm font-bold text-warm-700 flex items-center gap-2">
                        <FileText size={16} />
                        Editor do Módulo
                    </div>
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <Loader2 className="animate-spin text-primary w-8 h-8" />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col custom-quill h-full">
                            <ReactQuill 
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modulesConfig}
                                className="flex-1 h-full flex flex-col"
                                placeholder="Comece a escrever o conteúdo do módulo aqui..."
                            />
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="w-full bg-[#8c6b5d] hover:bg-[#7a5c50] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        Salvar Alterações do Módulo
                    </button>
                    
                    {successMessage && (
                        <div className="mt-3 text-center text-sage-600 font-bold bg-sage-50 p-2 rounded-lg border border-sage-200 animate-fade-in">
                            {successMessage}
                        </div>
                    )}
                </div>
            </div>

            {/* Direita: Live Preview (60%) */}
            <div className="w-full lg:w-3/5 bg-[#8c6b5d] p-2 md:p-6 rounded-3xl shadow-inner overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 text-white mb-4 pl-2 font-medium">
                    <MonitorPlay size={20} />
                    Visão ao Vivo do Aluno (Live Preview)
                    
                    <div className="ml-auto flex gap-1.5 opacity-50">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                </div>
                
                <div className="flex-1 bg-warm-50 rounded-2xl overflow-y-auto shadow-2xl relative">
                    <div className="min-h-full max-w-4xl mx-auto px-6 py-12">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-warm-100">
                            <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                                <BookOpen size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-warm-900">
                                    {selectedModuleData ? selectedModuleData.title : 'Carregando...'}
                                </h1>
                                {selectedModuleData && (
                                    <p className="text-warm-500 mt-2">{selectedModuleData.description}</p>
                                )}
                            </div>
                        </div>
                        
                        {content ? (
                            <div 
                                className="rich-text-content ql-editor"
                                dangerouslySetInnerHTML={{ __html: content }} 
                            />
                        ) : (
                            <div className="text-center py-16 text-warm-400 font-medium border border-dashed border-warm-300 rounded-2xl m-4">
                                Nenhuma formatação adicionada. Escreva no editor para visualizar.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleContentEditor;
