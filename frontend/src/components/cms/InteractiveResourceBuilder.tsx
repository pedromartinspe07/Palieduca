import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Edit2, CheckCircle2, Play, LayoutList, Layers, Save, X, Loader2 } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

interface Resource {
    id: number;
    module_slug: string;
    type: string;
    title: string;
    content_json: string;
}

export const InteractiveResourceBuilder: React.FC<{ moduleSlug: string }> = ({ moduleSlug }) => {
    const { token } = useAuth();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [resourceType, setResourceType] = useState<'video' | 'quiz' | 'flashcard'>('video');
    const [title, setTitle] = useState('');
    
    // Video State
    const [videoUrl, setVideoUrl] = useState('');
    
    // Quiz State
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correct_index: 0 }]);
    
    // Flashcard State
    const [cards, setCards] = useState([{ front: '', back: '' }]);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (moduleSlug) fetchResources();
    }, [moduleSlug]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/modules/${moduleSlug}/resources`);
            if (res.ok) {
                setResources(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setTitle('');
        setVideoUrl('');
        setQuestions([{ text: '', options: ['', '', '', ''], correct_index: 0 }]);
        setCards([{ front: '', back: '' }]);
    };

    const handleEdit = (r: Resource) => {
        setIsEditing(true);
        setEditId(r.id);
        setResourceType(r.type as any);
        setTitle(r.title);
        
        try {
            const parsed = JSON.parse(r.content_json);
            if (r.type === 'video' || r.type === 'podcast') {
                setVideoUrl(parsed.url || '');
            } else if (r.type === 'quiz') {
                setQuestions(parsed.questions || []);
            } else if (r.type === 'flashcard') {
                setCards(parsed.cards || []);
            }
        } catch (e) {
            console.error("Erro ao fazer parse do JSON do recurso");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente deletar este recurso?")) return;
        try {
            const res = await fetch(`${API_URL}/api/resources/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchResources();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return alert("O título é obrigatório");
        
        let contentObj: any = {};
        if (resourceType === 'video') {
            if (!videoUrl) return alert("A URL é obrigatória");
            contentObj = { url: videoUrl };
        } else if (resourceType === 'quiz') {
            contentObj = { questions };
        } else if (resourceType === 'flashcard') {
            contentObj = { cards };
        }

        const payload = {
            module_slug: moduleSlug,
            type: resourceType,
            title,
            content_json: JSON.stringify(contentObj)
        };

        setSaving(true);
        try {
            const url = editId ? `${API_URL}/api/resources/${editId}` : `${API_URL}/api/modules/${moduleSlug}/resources`;
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                resetForm();
                fetchResources();
            } else {
                alert("Erro ao salvar recurso");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    // UI Helpers
    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Play size={20} className="text-blue-500" />;
            case 'quiz': return <LayoutList size={20} className="text-purple-500" />;
            case 'flashcard': return <Layers size={20} className="text-orange-500" />;
            default: return <CheckCircle2 size={20} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-sm">
            {/* Header / List */}
            {!isEditing ? (
                <div className="p-6 flex flex-col h-full overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-warm-900">Recursos deste Módulo</h3>
                        <div className="flex gap-2">
                            <button onClick={() => { resetForm(); setIsEditing(true); setResourceType('video'); }} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold flex items-center gap-1"><Plus size={16}/> Vídeo/Podcast</button>
                            <button onClick={() => { resetForm(); setIsEditing(true); setResourceType('quiz'); }} className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-semibold flex items-center gap-1"><Plus size={16}/> Quiz</button>
                            <button onClick={() => { resetForm(); setIsEditing(true); setResourceType('flashcard'); }} className="px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-sm font-semibold flex items-center gap-1"><Plus size={16}/> Flashcards</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-12 bg-warm-50 rounded-xl border border-dashed border-warm-300 text-warm-500">
                            Nenhum recurso interativo cadastrado neste módulo ainda.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {resources.map(r => (
                                <div key={r.id} className="flex justify-between items-center p-4 border border-warm-100 rounded-xl bg-warm-50 hover:bg-warm-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">{getIcon(r.type)}</div>
                                        <div>
                                            <div className="font-bold text-warm-800">{r.title}</div>
                                            <div className="text-xs text-warm-500 uppercase tracking-wider">{r.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(r)} className="p-2 text-warm-600 hover:text-primary hover:bg-white rounded-lg transition-colors"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDelete(r.id)} className="p-2 text-warm-600 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Editor Form */
                <div className="flex flex-col h-full bg-warm-50">
                    <div className="p-4 bg-white border-b border-warm-200 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-lg font-bold text-warm-800">
                            {getIcon(resourceType)}
                            {editId ? 'Editar Recurso' : 'Criar Novo Recurso'} ({resourceType})
                        </div>
                        <button onClick={resetForm} className="text-warm-500 hover:text-warm-800"><X size={24}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-warm-700 mb-1">Título do Recurso (Ex: Quiz sobre Ética)</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-3 bg-white border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        {/* Campos Específicos por Tipo */}
                        
                        {/* 1. VÍDEO / PODCAST */}
                        {resourceType === 'video' && (
                            <div className="bg-white p-5 rounded-xl border border-warm-200 shadow-sm">
                                <label className="block text-sm font-bold text-warm-700 mb-1">URL do Vídeo (YouTube, Vimeo, etc)</label>
                                <input 
                                    type="text" 
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                />
                                {videoUrl && (
                                    <div className="mt-4 p-4 bg-warm-50 rounded-lg border border-warm-200 text-sm text-warm-600">
                                        No visualizador, essa URL será transformada automaticamente num player embutido se for compatível.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. QUIZ */}
                        {resourceType === 'quiz' && (
                            <div className="flex flex-col gap-6">
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm relative">
                                        <button 
                                            onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}
                                            className="absolute top-4 right-4 text-warm-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                        <div className="font-bold text-purple-700 mb-3">Pergunta {qIndex + 1}</div>
                                        <input 
                                            type="text" 
                                            value={q.text}
                                            onChange={e => {
                                                const newQ = [...questions];
                                                newQ[qIndex].text = e.target.value;
                                                setQuestions(newQ);
                                            }}
                                            placeholder="Digite a pergunta..."
                                            className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl mb-4 font-medium"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-3 p-2 bg-warm-50 rounded-lg border border-warm-200">
                                                    <input 
                                                        type="radio" 
                                                        name={`correct_${qIndex}`}
                                                        checked={q.correct_index === oIndex}
                                                        onChange={() => {
                                                            const newQ = [...questions];
                                                            newQ[qIndex].correct_index = oIndex;
                                                            setQuestions(newQ);
                                                        }}
                                                        className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newQ = [...questions];
                                                            newQ[qIndex].options[oIndex] = e.target.value;
                                                            setQuestions(newQ);
                                                        }}
                                                        placeholder={`Opção ${['A', 'B', 'C', 'D'][oIndex]}`}
                                                        className="flex-1 bg-transparent outline-none text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setQuestions([...questions, { text: '', options: ['', '', '', ''], correct_index: 0 }])}
                                    className="p-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                                >
                                    + Adicionar Nova Pergunta
                                </button>
                            </div>
                        )}

                        {/* 3. FLASHCARDS */}
                        {resourceType === 'flashcard' && (
                            <div className="flex flex-col gap-4">
                                {cards.map((card, cIndex) => (
                                    <div key={cIndex} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm relative grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setCards(cards.filter((_, i) => i !== cIndex))}
                                            className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full hover:bg-red-200"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                        <div>
                                            <label className="block text-xs font-bold text-orange-600 mb-1">Frente (Conceito)</label>
                                            <textarea 
                                                value={card.front}
                                                onChange={e => {
                                                    const newC = [...cards];
                                                    newC[cIndex].front = e.target.value;
                                                    setCards(newC);
                                                }}
                                                className="w-full p-2 bg-orange-50 border border-orange-100 rounded-lg outline-none text-sm resize-none h-20"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-orange-600 mb-1">Verso (Definição)</label>
                                            <textarea 
                                                value={card.back}
                                                onChange={e => {
                                                    const newC = [...cards];
                                                    newC[cIndex].back = e.target.value;
                                                    setCards(newC);
                                                }}
                                                className="w-full p-2 bg-orange-50 border border-orange-100 rounded-lg outline-none text-sm resize-none h-20"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setCards([...cards, { front: '', back: '' }])}
                                    className="p-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                                >
                                    + Adicionar Novo Cartão
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-warm-200 shrink-0">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                            Salvar Recurso Interativo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
