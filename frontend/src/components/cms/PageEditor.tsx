import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle2, Loader2, Save, Sparkles, Send, MonitorPlay, ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';

// Importando as páginas reais para o Live Preview
import Biblioteca from '../../pages/Biblioteca';
import Glossario from '../../pages/Glossario';
import Modulos from '../../pages/Modulos';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const PAGES_AVAILABLE = [
    { id: 'modulos', label: 'Página de Módulos', Component: Modulos },
    { id: 'biblioteca', label: 'Página da Biblioteca', Component: Biblioteca },
    { id: 'glossario', label: 'Página do Glossário', Component: Glossario }
];

const modules = {
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

const PageEditor: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [selectedPage, setSelectedPage] = useState(PAGES_AVAILABLE[0].id);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // IA States
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);

    useEffect(() => {
        fetchPageContent(selectedPage);
    }, [selectedPage]);

    const fetchPageContent = async (pageName: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/pages/${pageName}`);
            const data = await res.json();
            setContent(data.content || '');
        } catch (error) {
            console.error("Erro ao buscar conteúdo da página:", error);
            setContent('');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/pages/${selectedPage}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error('Erro ao salvar');

            setSuccessMessage('Página atualizada com sucesso!');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            console.error(error);
            alert('Não foi possível salvar as alterações da página.');
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
                        { role: 'user', content: `Escreva um conteúdo formatado em HTML para um site acadêmico de Cuidados Paliativos. O pedido é: ${aiPrompt}. Formate em blocos como h2, h3, p, strong. Retorne APENAS o HTML gerado.` }
                    ]
                })
            });

            if (!res.ok) throw new Error('Erro ao gerar com IA');

            const data = await res.json();
            let cleanHtml = data.reply.replace(/```html/g, '').replace(/```/g, '').trim();
            
            // Se a IA devolver texto puro ou quebras simples, converte em parágrafos reais <p>
            if (!/<[a-z][\s\S]*>/i.test(cleanHtml)) {
                cleanHtml = cleanHtml
                    .split(/\n\n+/)
                    .filter((p: string) => p.trim())
                    .map((p: string) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
                    .join('');
            }
            
            setContent(prev => prev ? `${prev}<p><br/></p>${cleanHtml}` : cleanHtml);
            setAiPrompt('');
        } catch (error) {
            console.error(error);
            alert('Falha ao conectar com o Assistente de IA.');
        } finally {
            setGeneratingAI(false);
        }
    };

    const ActivePageComponent = PAGES_AVAILABLE.find(p => p.id === selectedPage)?.Component;

    return (
        <div className="bg-white/50 border border-warm-200 rounded-3xl p-6 shadow-inner w-full h-full flex flex-col">
            
            {/* Header Area */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/perfil')}
                        className="p-2 hover:bg-warm-200 rounded-full transition-colors"
                        title="Voltar ao Perfil"
                    >
                        <ArrowLeft size={24} className="text-warm-700" />
                    </button>
                    <h3 className="text-2xl font-bold text-warm-900 flex items-center gap-2">
                        <FileText className="text-secondary" /> Estúdio de Criação
                    </h3>
                </div>
                
                {successMessage && (
                    <div className="px-4 py-2 bg-sage-50 text-sage-700 rounded-xl flex items-center gap-2 border border-sage-200 animate-fade-in text-sm font-bold">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>
                )}
            </div>

            <div className="mb-4 flex-shrink-0">
                <div className="flex flex-wrap gap-2">
                    {PAGES_AVAILABLE.map(page => (
                        <button
                            key={page.id}
                            onClick={() => setSelectedPage(page.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                selectedPage === page.id 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                            }`}
                        >
                            {page.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Split Screen Area */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
                
                {/* Lado Esquerdo: Controles e Editor */}
                <div className="flex flex-col h-full min-h-0 space-y-4">
                    {/* Copiloto IA Box */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100 shadow-sm flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-purple-600" size={18} />
                            <h4 className="font-bold text-purple-900 text-sm">Copiloto IA (Llama 3.3)</h4>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="Ex: Crie 2 parágrafos sobre bioética..."
                                className="flex-1 p-2.5 text-sm bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
                            />
                            <button 
                                onClick={handleAIGenerate}
                                disabled={generatingAI || !aiPrompt.trim()}
                                className="px-4 py-2.5 bg-purple-600 text-white font-medium text-sm rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                            >
                                {generatingAI ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {generatingAI ? 'Criando...' : 'Gerar'}
                            </button>
                        </div>
                    </div>

                    {/* Editor Visual Quill */}
                    <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm flex flex-col flex-1 min-h-0">
                        <label className="block text-sm font-semibold text-warm-700 mb-2 flex-shrink-0">Editor Visual</label>
                        {loading ? (
                            <div className="flex justify-center items-center flex-1"><Loader2 className="animate-spin text-primary" size={32} /></div>
                        ) : (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="flex-1 overflow-y-auto pb-4 custom-quill-wrapper">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={content} 
                                        onChange={setContent}
                                        modules={modules}
                                        className="h-full custom-quill"
                                    />
                                </div>
                                <div className="pt-4 border-t border-warm-100 mt-2 flex-shrink-0">
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full px-6 py-4 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-lg"
                                    >
                                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                                        Salvar Alterações da Página
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado Direito: Live Preview Real */}
                <div className="hidden xl:flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between bg-warm-800 text-white px-4 py-2.5 rounded-t-2xl flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <MonitorPlay size={16} className="text-warm-300" />
                            <span className="text-sm font-medium tracking-wide">Visão ao Vivo (Live Preview)</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-white border-x border-b border-warm-200 rounded-b-2xl overflow-y-auto relative shadow-inner">
                        {/* 
                            Aqui nós renderizamos o componente de página real.
                        */}
                        <div className="scale-[0.8] origin-top w-[125%] h-auto pb-32">
                            {ActivePageComponent && <ActivePageComponent previewContent={content} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageEditor;
