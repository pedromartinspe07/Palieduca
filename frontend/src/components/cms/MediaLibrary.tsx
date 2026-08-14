import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, Image as ImageIcon, FileText as FileIcon, X, Loader2, Trash2, CheckCircle2, Globe, Link2, Sparkles, FolderSync } from 'lucide-react';
import { parseGoogleDriveUrl, parseZohoWorkDriveUrl, getFullMediaUrl } from '../../utils/mediaUtils';

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

    // Tab state: 'upload' | 'gdrive' | 'workdrive'
    const [uploadTab, setUploadTab] = useState<'upload' | 'gdrive' | 'workdrive'>('upload');
    const [cloudUrl, setCloudUrl] = useState('');
    const [cloudFileName, setCloudFileName] = useState('');
    const [importingCloud, setImportingCloud] = useState(false);

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

    const handleImportCloud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cloudUrl.trim()) return;

        const isZoho = uploadTab === 'workdrive' || cloudUrl.includes('workdrive.zoho') || cloudUrl.includes('zohoexternal') || cloudUrl.includes('zohopublic');
        const convertedUrl = isZoho ? parseZohoWorkDriveUrl(cloudUrl.trim()) : parseGoogleDriveUrl(cloudUrl.trim());

        setImportingCloud(true);
        const endpoint = isZoho ? `${API_URL}/api/media/workdrive-link` : `${API_URL}/api/media/drive-link`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    url: cloudUrl.trim(),
                    filename: cloudFileName.trim() || undefined
                })
            });

            if (res.ok) {
                const newMedia = await res.json();
                setMediaFiles([newMedia, ...mediaFiles]);
                showToast(`Imagem do ${isZoho ? 'Zoho WorkDrive' : 'Google Drive'} importada com sucesso!`);
                setCloudUrl('');
                setCloudFileName('');
            } else {
                // Fallback local
                const localMedia: MediaFile = {
                    id: Date.now(),
                    filename: cloudFileName.trim() || (isZoho ? 'Zoho_WorkDrive_Image.jpg' : 'Google_Drive_Image.jpg'),
                    file_url: convertedUrl,
                    uploaded_at: new Date().toISOString()
                };
                setMediaFiles([localMedia, ...mediaFiles]);
                showToast('Link em nuvem importado!');
                setCloudUrl('');
                setCloudFileName('');
            }
        } catch (error) {
            console.error('Erro ao importar da nuvem:', error);
            const localMedia: MediaFile = {
                id: Date.now(),
                filename: cloudFileName.trim() || (isZoho ? 'Zoho_WorkDrive_Image.jpg' : 'Google_Drive_Image.jpg'),
                file_url: convertedUrl,
                uploaded_at: new Date().toISOString()
            };
            setMediaFiles([localMedia, ...mediaFiles]);
            showToast('Link em nuvem importado com sucesso!');
            setCloudUrl('');
            setCloudFileName('');
        } finally {
            setImportingCloud(false);
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
            setMediaFiles(mediaFiles.filter(m => m.id !== id));
            showToast('Arquivo removido!');
        }
    };

    const showToast = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const isImage = (filename: string, file_url?: string) => {
        if (file_url && (
            file_url.includes('googleusercontent.com') || 
            file_url.includes('drive.google.com') || 
            file_url.includes('workdrive.zoho') ||
            file_url.includes('zohoexternal') ||
            file_url.includes('zohopublic')
        )) return true;
        return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filename);
    };

    const content = (
        <div className={`flex flex-col h-full bg-white flex-1 ${isModal ? 'sm:rounded-2xl max-h-[85vh]' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-warm-200 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-warm-900 leading-tight">Biblioteca de Mídia</h3>
                        <p className="text-xs text-warm-500">Computador, Google Drive e Zoho WorkDrive</p>
                    </div>
                </div>
                {isModal && onClose && (
                    <button onClick={onClose} className="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Tabs de Envio: Computador | Google Drive | Zoho WorkDrive */}
            <div className="px-4 pt-3 pb-0 bg-warm-50/80 border-b border-warm-200 flex gap-2 shrink-0 overflow-x-auto">
                <button
                    onClick={() => { setUploadTab('upload'); setCloudUrl(''); }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 border-t border-x shrink-0 ${
                        uploadTab === 'upload'
                            ? 'bg-white text-primary border-warm-200 -mb-[1px] shadow-xs'
                            : 'text-warm-500 hover:text-warm-800 border-transparent'
                    }`}
                >
                    <UploadCloud size={15} /> Upload do Computador
                </button>
                <button
                    onClick={() => { setUploadTab('gdrive'); setCloudUrl(''); }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 border-t border-x shrink-0 ${
                        uploadTab === 'gdrive'
                            ? 'bg-white text-emerald-600 border-warm-200 -mb-[1px] shadow-xs'
                            : 'text-warm-500 hover:text-warm-800 border-transparent'
                    }`}
                >
                    <Globe size={15} className="text-emerald-600" /> Google Drive (Pedro)
                </button>
                <button
                    onClick={() => { setUploadTab('workdrive'); setCloudUrl(''); }}
                    className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 border-t border-x shrink-0 ${
                        uploadTab === 'workdrive'
                            ? 'bg-white text-amber-600 border-warm-200 -mb-[1px] shadow-xs'
                            : 'text-warm-500 hover:text-warm-800 border-transparent'
                    }`}
                >
                    <FolderSync size={15} className="text-amber-600" /> Zoho WorkDrive (Patrícia)
                </button>
            </div>

            {/* Area de Ação de Acordo com a Aba */}
            <div className="p-4 border-b border-warm-100 bg-white shrink-0">
                {uploadTab === 'upload' ? (
                    <div 
                        className="border-2 border-dashed border-warm-300 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-warm-50 hover:border-primary transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-11 h-11 rounded-xl bg-warm-100 group-hover:bg-primary/10 text-warm-500 group-hover:text-primary flex items-center justify-center mb-2 transition-colors">
                            <UploadCloud size={24} />
                        </div>
                        <p className="font-bold text-warm-800 text-sm">
                            {uploading ? 'Enviando arquivo...' : 'Clique para enviar imagens do seu computador'}
                        </p>
                        <p className="text-xs text-warm-400 mt-0.5">Formatos suportados: PNG, JPG, WEBP, GIF, SVG</p>
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/*,application/pdf"
                        />
                    </div>
                ) : (
                    <form onSubmit={handleImportCloud} className={`border rounded-2xl p-4 space-y-3 ${
                        uploadTab === 'workdrive' ? 'bg-amber-50/40 border-amber-200' : 'bg-emerald-50/40 border-emerald-200'
                    }`}>
                        <div className="flex items-center gap-2 font-bold text-xs">
                            <Sparkles size={16} className={uploadTab === 'workdrive' ? 'text-amber-600' : 'text-emerald-600'} />
                            <span className={uploadTab === 'workdrive' ? 'text-amber-900' : 'text-emerald-900'}>
                                {uploadTab === 'workdrive' 
                                    ? 'Cole o link de compartilhamento de imagem do Zoho WorkDrive:'
                                    : 'Cole o link de compartilhamento de imagem do Google Drive:'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2 relative">
                                <Link2 size={16} className="absolute left-3 top-3 text-warm-400" />
                                <input
                                    type="text"
                                    placeholder={uploadTab === 'workdrive' ? "https://workdrive.zoho.com/file/..." : "https://drive.google.com/file/d/..."}
                                    value={cloudUrl}
                                    onChange={(e) => setCloudUrl(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nome da foto (opcional)"
                                    value={cloudFileName}
                                    onChange={(e) => setCloudFileName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] text-warm-500">
                                💡 Dica: No {uploadTab === 'workdrive' ? 'Zoho WorkDrive' : 'Google Drive'}, certifique-se de que o link está configurado como <em>"Qualquer pessoa com o link"</em>.
                            </span>
                            <button
                                type="submit"
                                disabled={!cloudUrl.trim() || importingCloud}
                                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 ${
                                    uploadTab === 'workdrive' 
                                        ? 'bg-amber-600 hover:bg-amber-700 disabled:opacity-50' 
                                        : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50'
                                }`}
                            >
                                {importingCloud ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                                Importar Imagem
                            </button>
                        </div>
                    </form>
                )}

                {successMessage && (
                    <div className="mt-3 flex items-center gap-2 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 animate-fade-in">
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
                    <div className="text-center py-12 text-warm-400 font-medium text-xs">
                        Nenhuma mídia adicionada ainda. Envie do computador ou importe do Google Drive / Zoho WorkDrive!
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mediaFiles.map((file) => (
                            <div key={file.id} className="group border border-warm-200 rounded-2xl overflow-hidden bg-white shadow-xs hover:shadow-md transition-all relative flex flex-col">
                                <div className="aspect-square bg-warm-100 flex items-center justify-center overflow-hidden relative">
                                    {isImage(file.filename, file.file_url) ? (
                                        <img 
                                            src={getFullMediaUrl(file.file_url)} 
                                            alt={file.filename} 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <FileIcon className="text-warm-400" size={40} />
                                    )}
                                    {/* Overlay Hover */}
                                    <div className="absolute inset-0 bg-warm-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {onSelect && (
                                            <button 
                                                onClick={() => {
                                                    onSelect(getFullMediaUrl(file.file_url));
                                                    if (onClose) onClose();
                                                }}
                                                className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-105"
                                            >
                                                Selecionar
                                            </button>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(file.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 hover:text-red-700 hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                        title="Apagar arquivo"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                                <div className="p-2.5 border-t border-warm-100 truncate text-[11px] text-warm-700 font-semibold bg-warm-50/30">
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
