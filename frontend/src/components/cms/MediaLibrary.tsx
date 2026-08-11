import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, Image as ImageIcon, FileText as FileIcon, X, Loader2, Trash2, CheckCircle2 } from 'lucide-react';

const API_URL =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'
        : 'https://palieduca.onrender.com');

interface MediaFile {
    id: number;
    filename: string;
    file_url: string;
    uploaded_at: string;
}

interface MediaLibraryProps {
    onSelect?: (url: string) => void;
    onClose?: () => void;
    isModal?: boolean;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose, isModal = true }) => {
    const { token } = useAuth();
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/media`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMediaFiles(data);
            }
        } catch (error) {
            console.error('Erro ao carregar mídia:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/media/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Falha no upload');

            const newFile = await res.json();
            setMediaFiles([newFile, ...mediaFiles]);
            showToast('Arquivo enviado com sucesso!');
        } catch (error) {
            console.error('Erro no upload:', error);
            alert('Não foi possível fazer o upload do arquivo.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja apagar este arquivo da biblioteca?')) return;
        
        try {
            const res = await fetch(`${API_URL}/api/media/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Erro ao apagar');
            
            setMediaFiles(mediaFiles.filter(m => m.id !== id));
            showToast('Arquivo removido!');
        } catch (error) {
            console.error(error);
            alert('Não foi possível remover o arquivo.');
        }
    };

    const showToast = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const getFullUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        return `${API_URL}${path}`;
    };

    const isImage = (filename: string) => {
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
    };

    const content = (
        <div className="flex flex-col h-full bg-white sm:rounded-2xl flex-1 max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-warm-200 shrink-0">
                <h3 className="font-bold text-warm-900 flex items-center gap-2">
                    <ImageIcon className="text-secondary" />
                    Biblioteca de Mídia
                </h3>
                {isModal && onClose && (
                    <button onClick={onClose} className="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Upload Area */}
            <div className="p-4 border-b border-warm-100 bg-warm-50 shrink-0">
                <div 
                    className="border-2 border-dashed border-warm-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-warm-100/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud size={32} className="text-warm-400 mb-2" />
                    <p className="font-medium text-warm-700 text-sm">
                        {uploading ? 'Enviando arquivo...' : 'Clique para enviar imagens ou documentos'}
                    </p>
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                    />
                </div>
                {successMessage && (
                    <div className="mt-3 flex items-center gap-1.5 text-sage-600 text-sm font-medium bg-sage-50 px-3 py-2 rounded-lg border border-sage-200">
                        <CheckCircle2 size={16} /> {successMessage}
                    </div>
                )}
            </div>

            {/* Grid de Arquivos */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : mediaFiles.length === 0 ? (
                    <div className="text-center py-12 text-warm-400 font-medium">
                        Nenhuma mídia enviada ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mediaFiles.map((file) => (
                            <div key={file.id} className="group border border-warm-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow relative">
                                <div className="aspect-square bg-warm-100 flex items-center justify-center overflow-hidden relative">
                                    {isImage(file.filename) ? (
                                        <img 
                                            src={getFullUrl(file.file_url)} 
                                            alt={file.filename} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FileIcon className="text-warm-400" size={40} />
                                    )}
                                    {/* Overlay Hover */}
                                    <div className="absolute inset-0 bg-warm-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {onSelect && (
                                            <button 
                                                onClick={() => {
                                                    onSelect(getFullUrl(file.file_url));
                                                    if (onClose) onClose();
                                                }}
                                                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm"
                                            >
                                                Selecionar
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(file.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-md shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                        title="Apagar arquivo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="p-2 border-t border-warm-100 truncate text-[11px] text-warm-600 font-medium">
                                    {file.filename}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-4xl shadow-2xl animate-scale-in flex flex-col max-h-full">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

export default MediaLibrary;
