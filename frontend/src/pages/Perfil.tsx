import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    UserCircle, LogOut, Users, BookOpen, Palette, KeyRound, 
    Lock, X, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock, Camera, 
    Trash2, Globe, UploadCloud, Sparkles, Download, Database, RefreshCw, 
    Award, TrendingUp, Layers, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseGoogleDriveUrl, parseZohoWorkDriveUrl, getFullMediaUrl } from '../utils/mediaUtils';
import CertificateModal from '../components/CertificateModal';
import StudentAnalyticsDashboard from '../components/StudentAnalyticsDashboard';

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

    // Certificate modal
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);

    // Admin & Teacher Analytics State (Dona / Desenvolvedor)
    const [adminMetrics, setAdminMetrics] = useState<any>(null);
    const [loadingAdminMetrics, setLoadingAdminMetrics] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [backupMessage, setBackupMessage] = useState('');
    const backupFileRef = useRef<HTMLInputElement>(null);

    // Student Progress State
    const [studentProgress, setStudentProgress] = useState<any>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Busca métricas do painel administrativo se for Dona, Dev, Professor ou Moderador
    useEffect(() => {
        if (token && user && ['dona', 'desenvolvedor', 'professor', 'moderador'].includes(user.cargo)) {
            setLoadingAdminMetrics(true);
            fetch(`${API_URL}/api/admin/metrics`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setAdminMetrics(data))
            .catch(err => console.error('Erro ao buscar métricas da professora:', err))
            .finally(() => setLoadingAdminMetrics(false));
        }
    }, [token, user]);

    // Busca progresso do aluno se for aluno
    useEffect(() => {
        if (token && user) {
            fetch(`${API_URL}/api/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setStudentProgress(data))
            .catch(err => console.error('Erro ao buscar progresso do aluno:', err));
        }
    }, [token, user]);

    // Exportar Planilha Excel (.xlsx) com gráficos nativos embutidos
    const handleExportExcel = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/export-students-excel`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Falha ao exportar relatório em Excel');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Relatorio_Turma_Palieduca_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert(err.message || 'Erro ao baixar relatório Excel');
        }
    };

    // Exportar CSV de alunos com autenticação Bearer e download direto
    const handleExportCSV = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/export-students-csv`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Falha ao exportar planilha de alunos');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Alunos_Palieduca_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            alert(err.message || 'Erro ao baixar planilha');
        }
    };

    // Atualizar Cargo de Usuário (RBAC)
    const handleUpdateRole = async (userId: number, newRole: string) => {
        if (!token) throw new Error('Não autenticado');
        const res = await fetch(`${API_URL}/api/admin/users/${userId}/cargo`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ cargo: newRole })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.detail || 'Erro ao atualizar cargo');
        }
        
        // Atualiza estado local do painel de métricas
        setAdminMetrics((prev: any) => {
            if (!prev) return prev;
            const updatedAllUsers = prev.all_users?.map((u: any) => 
                u.id === userId ? { ...u, cargo: newRole } : u
            ) || [];
            const updatedStudents = updatedAllUsers.filter((u: any) => u.cargo === 'aluno');
            const updatedTeam = updatedAllUsers.filter((u: any) => u.cargo !== 'aluno');
            return {
                ...prev,
                total_students: updatedStudents.length,
                total_team_members: updatedTeam.length,
                all_users: updatedAllUsers,
                students: updatedStudents
            };
        });

        // Se o usuário alterou o próprio cargo
        if (user && user.id === userId) {
            updateUser({ cargo: newRole });
        }
    };

    // Exportar Backup Completo JSON
    const handleExportBackup = async () => {
        setBackupLoading(true);
        setBackupMessage('');
        try {
            const res = await fetch(`${API_URL}/api/admin/backup/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Erro ao gerar backup');
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Palieduca_Backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            setBackupMessage('Backup baixado com sucesso!');
        } catch (err: any) {
            setBackupMessage(err.message || 'Falha ao exportar backup');
        } finally {
            setBackupLoading(false);
        }
    };

    // Restaurar Backup JSON
    const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm('Tem certeza que deseja restaurar este backup? Os conteúdos existentes serão atualizados.')) {
            return;
        }

        setBackupLoading(true);
        setBackupMessage('');

        try {
            const fileText = await file.text();
            const backupJson = JSON.parse(fileText);

            const res = await fetch(`${API_URL}/api/admin/backup/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(backupJson)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Erro ao restaurar backup');

            setBackupMessage('Backup restaurado com sucesso! Recarregando...');
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            setBackupMessage(err.message || 'Falha ao processar arquivo de backup');
        } finally {
            setBackupLoading(false);
            if (backupFileRef.current) backupFileRef.current.value = '';
        }
    };

    // Client-side lightweight image compression com corte quadrado centralizado 1:1 perfeito
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    
                    // Corta o centro exato da foto em proporção 1:1 perfeita (evita esticar fotos verticais ou horizontais)
                    const minDim = Math.min(img.width, img.height);
                    const startX = (img.width - minDim) / 2;
                    const startY = (img.height - minDim) / 2;
                    const TARGET_SIZE = Math.min(minDim, 400);

                    canvas.width = TARGET_SIZE;
                    canvas.height = TARGET_SIZE;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, startX, startY, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);

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
    const overallStudentProgress = studentProgress?.overall_percentage ?? 0;
    const isCertUnlocked = overallStudentProgress >= 100;

    return (
        <main className="min-h-[85vh] pt-32 pb-20 px-4 max-w-6xl mx-auto">
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
                                    className="w-24 h-24 rounded-full object-cover object-center aspect-square shrink-0 shadow-md border-2 border-primary/40 group-hover:opacity-90 transition-all"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 text-primary flex items-center justify-center shadow-inner border border-primary/20 aspect-square shrink-0">
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
                        
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                            user.cargo === 'dona' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            user.cargo === 'desenvolvedor' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                            user.cargo === 'professor' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                            user.cargo === 'moderador' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                            user.cargo === 'suporte' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' :
                            'bg-sage-100 text-sage-900 border border-sage-300'
                        }`}>
                            <span>Cargo: {user.cargo === 'dona' ? '👑 Dona' : user.cargo === 'desenvolvedor' ? '💻 Desenvolvedor' : user.cargo === 'professor' ? '👨‍🏫 Professor' : user.cargo === 'moderador' ? '🛡️ Moderador' : user.cargo === 'suporte' ? '🎧 Suporte' : '🎓 Aluno'}</span>
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

                    {/* ======================================================== */}
                    {/* PAINEL DA PROFESSORA / DONA / DESENVOLVEDOR / EQUIPE     */}
                    {/* ======================================================== */}
                    {['dona', 'desenvolvedor', 'professor', 'moderador'].includes(user.cargo) && (
                        <div className="space-y-6">
                            
                            {/* Cards de Métricas em Tempo Real */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 bg-white rounded-3xl border border-warm-200 shadow-xs">
                                    <div className="p-2 w-9 h-9 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mb-2">
                                        <Users size={18} />
                                    </div>
                                    <p className="text-[11px] font-bold text-warm-500 uppercase">Alunos</p>
                                    <h4 className="text-2xl font-black text-warm-900 mt-0.5">
                                        {adminMetrics?.total_students ?? 0}
                                    </h4>
                                </div>

                                <div className="p-4 bg-white rounded-3xl border border-warm-200 shadow-xs">
                                    <div className="p-2 w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                                        <BookOpen size={18} />
                                    </div>
                                    <p className="text-[11px] font-bold text-warm-500 uppercase">Módulos</p>
                                    <h4 className="text-2xl font-black text-warm-900 mt-0.5">
                                        {adminMetrics?.total_modules ?? 0}
                                    </h4>
                                </div>

                                <div className="p-4 bg-white rounded-3xl border border-warm-200 shadow-xs">
                                    <div className="p-2 w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                                        <Layers size={18} />
                                    </div>
                                    <p className="text-[11px] font-bold text-warm-500 uppercase">Atividades</p>
                                    <h4 className="text-2xl font-black text-warm-900 mt-0.5">
                                        {adminMetrics?.total_activities ?? 0}
                                    </h4>
                                </div>

                                <div className="p-4 bg-white rounded-3xl border border-warm-200 shadow-xs">
                                    <div className="p-2 w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                                        <TrendingUp size={18} />
                                    </div>
                                    <p className="text-[11px] font-bold text-warm-500 uppercase">Média Turma</p>
                                    <h4 className="text-2xl font-black text-warm-900 mt-0.5">
                                        {adminMetrics?.average_progress_percentage ?? 0}%
                                    </h4>
                                </div>
                            </div>

                            {/* Banner do Estúdio de Criação (Apenas para quem pode criar conteúdo) */}
                            {['dona', 'desenvolvedor', 'professor'].includes(user.cargo) && (
                                <div className="bg-gradient-to-r from-primary to-secondary p-7 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between shadow-xl hover:shadow-2xl transition-all">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1.5 flex items-center gap-2"><Palette /> Estúdio de Criação</h3>
                                        <p className="text-white/90 text-xs max-w-md">Construa e edite páginas, quizzes e recursos interativos com Live Preview e Inteligência Artificial.</p>
                                    </div>
                                    <button onClick={() => navigate('/editor')} className="mt-4 sm:mt-0 px-6 py-3 bg-white text-primary font-bold rounded-2xl shadow-md hover:scale-105 transition-transform text-xs cursor-pointer whitespace-nowrap">
                                        Abrir Estúdio
                                    </button>
                                </div>
                            )}

                            {/* Central de Inteligência, Gráficos e Planilha Interativa */}
                            <StudentAnalyticsDashboard 
                                data={adminMetrics} 
                                loading={loadingAdminMetrics} 
                                onExportExcel={handleExportExcel}
                                onExportCSV={handleExportCSV}
                                onUpdateRole={handleUpdateRole}
                                currentUserEmail={user.email}
                                currentUserRole={user.cargo}
                            />

                            {/* Central de Segurança e Backup em 1 Clique */}
                            <div className="glassmorphism p-6 rounded-3xl border border-warm-200 shadow-sm bg-white">
                                <h3 className="text-base font-bold text-warm-900 mb-2 flex items-center gap-2">
                                    <Database size={18} className="text-primary" /> Central de Backup & Segurança
                                </h3>
                                <p className="text-xs text-warm-500 mb-4">
                                    Faça o download de todos os conteúdos e páginas para o seu computador com 1 clique para segurança total.
                                </p>

                                {backupMessage && (
                                    <div className="p-3 rounded-2xl bg-sage-50 text-sage-800 text-xs font-semibold border border-sage-200 mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={16} /> {backupMessage}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleExportBackup}
                                        disabled={backupLoading}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-warm-800 hover:bg-warm-900 text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {backupLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        <span>Fazer Backup Completo (JSON)</span>
                                    </button>

                                    <button
                                        onClick={() => backupFileRef.current?.click()}
                                        disabled={backupLoading}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-2xl font-bold text-xs border border-warm-300 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw size={14} />
                                        <span>Restaurar Backup</span>
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={backupFileRef} 
                                        accept=".json" 
                                        className="hidden" 
                                        onChange={handleRestoreBackup} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* PAINEL DO ALUNO                                          */}
                    {/* ======================================================== */}
                    {user.cargo === 'aluno' && (
                        <div className="glassmorphism p-8 rounded-3xl border border-warm-200 shadow-sm bg-white space-y-6">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-100">
                                <div>
                                    <h3 className="text-xl font-bold text-warm-900 flex items-center gap-2">
                                        <BookOpen className="text-primary" /> Meu Progresso nos Cuidados Paliativos
                                    </h3>
                                    <p className="text-xs text-warm-500 mt-1">
                                        Complete todas as atividades e quizzes para emitir seu Certificado Oficial da UFPB.
                                    </p>
                                </div>

                                {isCertUnlocked && (
                                    <button
                                        onClick={() => setIsCertModalOpen(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
                                    >
                                        <Award size={18} />
                                        <span>Emitir Certificado (40h)</span>
                                    </button>
                                )}
                            </div>

                            {/* Barra de Progresso Geral */}
                            <div className="p-6 bg-warm-50/70 rounded-3xl border border-warm-200">
                                <div className="flex justify-between items-center mb-2.5 text-xs font-bold">
                                    <span className="text-warm-700">Progresso Geral do Curso</span>
                                    <span className="text-primary text-sm font-black">{overallStudentProgress}%</span>
                                </div>
                                <div className="w-full bg-warm-200 rounded-full h-3.5 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-primary to-secondary h-3.5 rounded-full transition-all duration-500"
                                        style={{ width: `${overallStudentProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-3 text-[11px] text-warm-500 font-medium">
                                    <span>{studentProgress?.total_completed ?? 0} de {studentProgress?.total_activities ?? 0} atividades concluídas</span>
                                    {isCertUnlocked ? (
                                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                                            <CheckCircle2 size={13} /> 100% Concluído!
                                        </span>
                                    ) : (
                                        <span>Faltam {(studentProgress?.total_activities ?? 0) - (studentProgress?.total_completed ?? 0)} para o Certificado</span>
                                    )}
                                </div>
                            </div>

                            {/* Botão de Continuar Estudos */}
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/modulos')}
                                    className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Ir para as Trilhas de Aprendizagem</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal do Certificado Oficial */}
            <CertificateModal 
                isOpen={isCertModalOpen} 
                onClose={() => setIsCertModalOpen(false)} 
            />

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

                        {/* Tabs de Envio */}
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
