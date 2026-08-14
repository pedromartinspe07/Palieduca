import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle, LogOut, Settings, Users, BookOpen, Activity, Palette, KeyRound, Lock, X, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock, Camera, Trash2, Globe, UploadCloud, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseGoogleDriveUrl, parseZohoWorkDriveUrl, getFullMediaUrl } from '../utils/mediaUtils';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const Perfil: React.FC = () => {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    // Password change state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Profile photo modal state
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [photoTab, setPhotoTab] = useState<'upload' | 'link'>('upload');
    const [photoUrlInput, setPhotoUrlInput] = useState('');
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const [photoSuccess, setPhotoSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Client-side lightweight image compression (max 400x400, 80% quality)
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height = Math.round((height * MAX_SIZE) / width);
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width = Math.round((width * MAX_SIZE) / height);
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Falha ao comprimir imagem'));
                    }, 'image/webp', 0.85);
                };
                img.onerror = () => reject(new Error('Falha ao processar imagem'));
            };
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPhotoLoading(true);
        setPhotoError('');
        setPhotoSuccess('');

        try {
            // Comprime a imagem no cliente antes de enviar para garantir velocidade máxima
            const compressedBlob = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedBlob, `avatar_${Date.now()}.webp`);

            const res = await fetch(`${API_URL}/api/auth/profile-photo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao enviar foto');

            updateUser({ foto_url: data.foto_url });
            setPhotoSuccess('Foto de perfil atualizada com sucesso!');
            setTimeout(() => {
                setIsPhotoModalOpen(false);
                setPhotoSuccess('');
            }, 2000);
        } catch (err: any) {
            setPhotoError(err.message || 'Erro ao atualizar foto');
        } finally {
            setPhotoLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photoUrlInput.trim()) return;

        setPhotoLoading(true);
        setPhotoError('');
        setPhotoSuccess('');

        let parsedUrl = parseGoogleDriveUrl(photoUrlInput.trim());
        parsedUrl = parseZohoWorkDriveUrl(parsedUrl);

        try {
            const formData = new FormData();
            formData.append('foto_url', parsedUrl);

            const res = await fetch(`${API_URL}/api/auth/profile-photo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao vincular link da foto');

            updateUser({ foto_url: data.foto_url });
            setPhotoSuccess('Foto de perfil atualizada!');
            setPhotoUrlInput('');
            setTimeout(() => {
                setIsPhotoModalOpen(false);
                setPhotoSuccess('');
            }, 2000);
        } catch (err: any) {
            setPhotoError(err.message || 'Erro ao salvar link da foto');
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm('Deseja remover sua foto de perfil e voltar ao avatar padrão?')) return;

        setPhotoLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/profile-photo`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                updateUser({ foto_url: null });
                setIsPhotoModalOpen(false);
            }
        } catch (err) {
            console.error('Erro ao remover foto:', err);
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword.length < 6) {
            setPasswordError('A nova senha deve conter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('A confirmação da nova senha não confere.');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Erro ao alterar a senha.');
            }

            setPasswordSuccess('Senha alterada com sucesso! Lembre-se: próxima alteração disponível em 7 dias.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess('');
            }, 3500);
        } catch (err: any) {
            setPasswordError(err.message || 'Erro de conexão ao alterar a senha.');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="pt-32 text-center">
                <p>Você precisa estar logado.</p>
            </div>
        );
    }

    const resolvedFotoUrl = user.foto_url ? getFullMediaUrl(user.foto_url) : null;

    return (
        <main className="min-h-[85vh] pt-32 pb-20 px-4 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar do Perfil */}
                <div className="w-full md:w-1/3 glassmorphism p-6 rounded-3xl h-fit border border-warm-200 shadow-sm">
                    <div className="flex flex-col items-center text-center pb-6 border-b border-warm-100">
                        
                        {/* Avatar com Botão de Câmera */}
                        <div className="relative mb-4 group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
                            {resolvedFotoUrl ? (
                                <img 
                                    src={resolvedFotoUrl} 
                                    alt={user.nome} 
                                    className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-primary/40 group-hover:opacity-90 transition-all"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 text-primary flex items-center justify-center shadow-inner border border-primary/20">
                                    <UserCircle size={64} />
                                </div>
                            )}

                            {/* Badge de Troca de Foto */}
                            <div 
                                className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary-dark text-white rounded-full shadow-md transition-transform group-hover:scale-110"
                                title="Alterar Foto de Perfil"
                            >
                                <Camera size={15} />
                            </div>
                        </div>

                        <h2 
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="text-xl font-bold text-warm-900 cursor-pointer hover:text-primary transition-colors flex items-center gap-1.5"
                            title="Clique para alterar sua senha"
                        >
                            {user.nome}
                        </h2>
                        <p className="text-warm-500 text-sm mb-2.5">{user.email}</p>
                        
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                            Cargo: {user.cargo}
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 text-warm-700 hover:text-primary hover:bg-primary/5 p-3 rounded-2xl border border-warm-200 transition-all font-semibold text-xs cursor-pointer"
                        >
                            <Camera size={16} />
                            Alterar Foto de Perfil
                        </button>

                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 text-warm-700 hover:text-primary hover:bg-primary/5 p-3 rounded-2xl border border-warm-200 transition-all font-semibold text-xs cursor-pointer"
                        >
                            <KeyRound size={16} />
                            Alterar Minha Senha
                        </button>
                        
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-2xl transition-all text-xs font-semibold cursor-pointer"
                        >
                            <LogOut size={16} />
                            Sair da Conta
                        </button>
                    </div>
                </div>

                {/* Conteúdo Dinâmico por Cargo (RBAC) */}
                <div className="w-full md:w-2/3 space-y-6">
                    <div className="glassmorphism p-8 rounded-3xl border border-warm-200 shadow-sm">
                        <h3 className="text-2xl font-bold text-warm-900 mb-6 flex items-center gap-2">
                            <Settings className="text-primary" /> Painel de Controle
                        </h3>

                        {user.cargo === 'dona' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-sage-50 rounded-2xl border border-sage-100 hover:shadow-md transition-all">
                                        <Users size={32} className="text-sage-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Gestão de Alunos</h4>
                                        <p className="text-sm text-warm-600">Gerencie matrículas e acompanhe o engajamento da turma de Enfermagem.</p>
                                    </div>
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all">
                                        <BookOpen size={32} className="text-blue-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Acervo Biblioteca</h4>
                                        <p className="text-sm text-warm-600">Aprove artigos e gerencie referências científicas.</p>
                                    </div>
                                </div>
                                <div className="mt-8 bg-gradient-to-r from-primary to-secondary p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between shadow-xl hover:shadow-2xl transition-all">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Palette /> Estúdio de Criação</h3>
                                        <p className="text-white/90 max-w-xl text-sm">Acesse o construtor de páginas em tela cheia com Inteligência Artificial e Live Preview.</p>
                                    </div>
                                    <button onClick={() => navigate('/editor')} className="mt-4 sm:mt-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform whitespace-nowrap cursor-pointer">
                                        Abrir Estúdio
                                    </button>
                                </div>
                            </div>
                        )}

                        {user.cargo === 'desenvolvedor' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <Activity size={32} className="text-purple-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Logs do Sistema</h4>
                                        <p className="text-sm text-warm-600">Verifique a saúde do servidor, chamadas de API e performance.</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                        <Settings size={32} className="text-gray-600 mb-4" />
                                        <h4 className="font-semibold text-warm-900 mb-2">Variáveis de Ambiente</h4>
                                        <p className="text-sm text-warm-600">Configure integrações como OAuth do Google e API do Groq.</p>
                                    </div>
                                </div>
                                <div className="mt-8 bg-gradient-to-r from-primary to-secondary p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between shadow-xl hover:shadow-2xl transition-all">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2"><Palette /> Estúdio de Criação</h3>
                                        <p className="text-white/90 max-w-xl text-sm">Acesse o construtor de páginas em tela cheia com Inteligência Artificial e Live Preview.</p>
                                    </div>
                                    <button onClick={() => navigate('/editor')} className="mt-4 sm:mt-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform whitespace-nowrap cursor-pointer">
                                        Abrir Estúdio
                                    </button>
                                </div>
                            </div>
                        )}

                        {user.cargo === 'aluno' && (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                                    <BookOpen size={32} className="text-primary mb-4" />
                                    <h4 className="font-semibold text-warm-900 mb-2">Meu Progresso</h4>
                                    <p className="text-sm text-warm-600 mb-4">Você completou 0% dos módulos de Cuidados Paliativos.</p>
                                    <div className="w-full bg-warm-200 rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full w-0"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Foto de Perfil */}
            {isPhotoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 border border-warm-200 animate-scale-in relative">
                        <button
                            onClick={() => { setIsPhotoModalOpen(false); setPhotoError(''); setPhotoSuccess(''); }}
                            className="absolute top-5 right-5 p-2 text-warm-400 hover:text-warm-800 rounded-full hover:bg-warm-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Camera size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-warm-900">Foto de Perfil</h3>
                                <p className="text-xs text-warm-500">Personalize seu avatar no Palieduca</p>
                            </div>
                        </div>

                        {/* Tabs de Envio: Computador ou Link */}
                        <div className="flex bg-warm-100 p-1 rounded-2xl mb-5 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setPhotoTab('upload')}
                                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    photoTab === 'upload' ? 'bg-white text-primary shadow-xs' : 'text-warm-600 hover:text-warm-900'
                                }`}
                            >
                                <UploadCloud size={14} /> Enviar do Computador
                            </button>
                            <button
                                type="button"
                                onClick={() => setPhotoTab('link')}
                                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    photoTab === 'link' ? 'bg-white text-primary shadow-xs' : 'text-warm-600 hover:text-warm-900'
                                }`}
                            >
                                <Globe size={14} /> Link / Google / Zoho
                            </button>
                        </div>

                        {photoError && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100 mb-4 flex items-center justify-center gap-1.5">
                                <AlertCircle size={15} /> {photoError}
                            </div>
                        )}

                        {photoSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200 mb-4 flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={15} /> {photoSuccess}
                            </div>
                        )}

                        {photoTab === 'upload' ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-warm-300 hover:border-primary rounded-2xl p-7 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-warm-50/50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-warm-100 text-warm-500 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center mb-2.5 transition-colors">
                                    {photoLoading ? <Loader2 size={24} className="animate-spin text-primary" /> : <UploadCloud size={24} />}
                                </div>
                                <p className="font-bold text-warm-800 text-sm">
                                    {photoLoading ? 'Otimizando e enviando...' : 'Clique para escolher uma foto'}
                                </p>
                                <p className="text-xs text-warm-400 mt-1">Formatos: JPG, PNG, WEBP (Comprimido automaticamente)</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileUpload} 
                                />
                            </div>
                        ) : (
                            <form onSubmit={handleLinkSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-warm-700 mb-1.5">Link da Imagem</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={photoUrlInput} 
                                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                                        placeholder="https://... ou link do Google Drive / Zoho WorkDrive"
                                        className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={photoLoading || !photoUrlInput.trim()}
                                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {photoLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                    <span>Salvar Foto por Link</span>
                                </button>
                            </form>
                        )}

                        {user.foto_url && (
                            <div className="mt-5 pt-4 border-t border-warm-100 flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleDeletePhoto}
                                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                                >
                                    <Trash2 size={14} /> Remover Foto de Perfil
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Alteração de Senha */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 border border-warm-200 animate-scale-in relative">
                        <button
                            onClick={() => { setIsPasswordModalOpen(false); setPasswordError(''); setPasswordSuccess(''); }}
                            className="absolute top-5 right-5 p-2 text-warm-400 hover:text-warm-800 rounded-full hover:bg-warm-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-warm-900">Alterar Senha</h3>
                                <p className="text-xs text-warm-500">Atualize sua credencial de acesso</p>
                            </div>
                        </div>

                        {/* Aviso de Regra de 1 Semana */}
                        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 mb-5 flex items-start gap-2.5 text-xs text-amber-900">
                            <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Regra de Segurança:</strong> Por proteção da sua conta, a senha só pode ser alterada <strong>1 vez a cada 1 semana (7 dias)</strong>.
                            </p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {passwordError && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100 flex items-center justify-center gap-1.5">
                                    <AlertCircle size={15} /> {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                                    <CheckCircle2 size={15} /> {passwordSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Senha Atual</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Digite sua senha atual"
                                        className="w-full pl-9 pr-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Nova Senha (Mínimo 6 dígitos)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Digite a nova senha"
                                        minLength={6}
                                        className="w-full pl-9 pr-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        minLength={6}
                                        className="w-full pl-9 pr-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsPasswordModalOpen(false); setPasswordError(''); }}
                                    className="flex-1 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {passwordLoading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                                    <span>Salvar Senha</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Perfil;
