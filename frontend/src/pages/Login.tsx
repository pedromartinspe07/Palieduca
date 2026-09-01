import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Mail, 
    Lock, 
    Loader2, 
    ArrowLeft, 
    RefreshCw, 
    KeyRound, 
    CheckCircle2, 
    LogIn, 
    Eye, 
    EyeOff, 
    ShieldCheck, 
    Sparkles 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { ButterflyIcon } from '../components/ButterflyLogo';

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com');

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Password visibility with 30s auto-hide timer
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCountdown, setPasswordCountdown] = useState<number | null>(null);
    const timerRef = useRef<any>(null);

    // Steps: 'login' | 'verify' | 'forgot_request' | 'forgot_reset'
    const [step, setStep] = useState<'login' | 'verify' | 'forgot_request' | 'forgot_reset'>('login');
    
    // Verification state
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    // Password Reset state
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Toggle password visibility with 30s timer
    const toggleShowPassword = () => {
        if (showPassword) {
            setShowPassword(false);
            setPasswordCountdown(null);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            setShowPassword(true);
            setPasswordCountdown(30);
            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
                setPasswordCountdown((prev) => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timerRef.current);
                        setShowPassword(false);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleGoogleSuccess = async (tokenResponse: any) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: tokenResponse.credential })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Erro ao autenticar com Google');
            }
            
            const data = await res.json();
            login(data.access_token, data.user);
            navigate('/perfil');
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com o Google');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email.trim());
            formData.append('password', senha);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403 && data.detail?.includes('confirme seu e-mail')) {
                    setStep('verify');
                    return;
                }
                throw new Error(data.detail || 'Email ou senha incorretos');
            }

            login(data.access_token, data.user);
            navigate('/perfil');
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setError('Tempo limite esgotado ao conectar ao servidor. Tente novamente.');
            } else {
                setError(err.message || 'Erro ao conectar com o servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
            setError('Digite o código de 6 dígitos enviado ao seu e-mail.');
            return;
        }

        setVerifyLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    code: verificationCode.trim()
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Código de verificação incorreto ou expirado.');
            }

            login(data.access_token, data.user);
            navigate('/perfil');
        } catch (err: any) {
            setError(err.message || 'Erro ao validar código');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendStatus('Enviando...');
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setResendStatus('Novo código enviado com sucesso!');
                setTimeout(() => setResendStatus(''), 4000);
            } else {
                setError(data.detail || 'Erro ao reenviar código');
                setResendStatus('');
            }
        } catch {
            setError('Erro ao conectar com o servidor para reenviar código.');
            setResendStatus('');
        }
    };

    // Solicitar Código de Recuperação de Senha
    const handleForgotPasswordRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetSuccess('');

        const targetEmail = (forgotEmail || email).trim();
        if (!targetEmail) {
            setError('Por favor, informe seu e-mail cadastrado.');
            return;
        }

        setResetLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Erro ao solicitar código de recuperação.');
            }

            setForgotEmail(targetEmail);
            setResetSuccess(data.message || 'Código de 6 dígitos enviado para seu e-mail!');
            setStep('forgot_reset');
        } catch (err: any) {
            setError(err.message || 'Erro ao solicitar recuperação de senha.');
        } finally {
            setResetLoading(false);
        }
    };

    // Redefinir Senha com Código
    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResetSuccess('');

        if (resetCode.trim().length !== 6) {
            setError('Por favor, digite o código de 6 dígitos enviado ao seu e-mail.');
            return;
        }

        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('A nova senha e a confirmação não coincidem.');
            return;
        }

        setResetLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotEmail.trim(),
                    code: resetCode.trim(),
                    new_password: newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Falha ao redefinir senha. Verifique o código digitado.');
            }

            setResetSuccess('Senha redefinida com sucesso! Entrando na sua conta...');
            setTimeout(() => {
                login(data.access_token, data.user);
                navigate('/perfil');
            }, 1200);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-20 sm:pt-24 pb-12 flex flex-col justify-center py-8 sm:px-6 lg:px-8 bg-warm-50 relative overflow-hidden">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center group cursor-pointer">
                    <div className="bg-gradient-to-br from-teal-600 to-sky-700 text-white p-3 rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ButterflyIcon size={38} className="text-white" />
                    </div>
                </div>
                <h1 className="mt-6 text-center text-3xl font-extrabold text-warm-900 tracking-tight font-serif">
                    {step === 'login' && 'Entrar no Palieduca'}
                    {step === 'verify' && 'Confirmação de E-mail'}
                    {step === 'forgot_request' && 'Recuperação de Senha'}
                    {step === 'forgot_reset' && 'Criar Nova Senha'}
                </h1>
                <p className="mt-2 text-center text-xs text-warm-600">
                    {step === 'login' && 'Acesse suas aulas, simulados e certificados acadêmicos da UFPB'}
                    {step === 'verify' && 'Confirme seu endereço de e-mail para ativar sua conta'}
                    {step === 'forgot_request' && 'Informe seu e-mail para receber um código de 6 dígitos'}
                    {step === 'forgot_reset' && 'Digite o código recebido por e-mail e defina sua nova senha'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-warm-100 relative">
                
                {step === 'login' ? (
                    <>
                        <div className="mb-6 flex flex-col items-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Falha no login com Google')}
                                useOneTap={false}
                                shape="circle"
                                size="large"
                                text="signin_with"
                                width="100%"
                            />
                            
                            <div className="relative w-full my-6 flex items-center justify-center">
                                <div className="border-t border-warm-200 w-full" />
                                <span className="bg-white px-3 text-[11px] font-bold text-warm-400 uppercase tracking-wider absolute">
                                    Ou use seu e-mail
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="seu.email@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-warm-700">Senha</label>
                                    <div className="flex items-center gap-2">
                                        {passwordCountdown !== null && (
                                            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                                Visível por {passwordCountdown}s
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotEmail(email);
                                                setError('');
                                                setStep('forgot_request');
                                            }}
                                            className="text-[11px] text-primary hover:text-primary-dark font-semibold hover:underline cursor-pointer"
                                        >
                                            Esqueci minha senha
                                        </button>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleShowPassword}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-400 hover:text-warm-700 transition-colors cursor-pointer"
                                        title={showPassword ? "Ocultar senha" : "Ver senha (visível por 30s)"}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                                <span>Entrar na Plataforma</span>
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-warm-500">
                            Ainda não tem uma conta?{' '}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Cadastre-se grátis
                            </Link>
                        </div>
                    </>
                ) : step === 'verify' ? (
                    /* Step: Verification Code screen */
                    <div className="text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                            <Mail size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-warm-900">Confirmação de E-mail</h2>
                        <p className="text-xs text-warm-600 mt-2 leading-relaxed">
                            Sua conta precisa de confirmação. Enviamos um código de 6 dígitos para:
                            <br />
                            <strong className="text-warm-900 text-sm font-semibold">{email}</strong>
                        </p>
                        <p className="text-[11px] text-warm-400 mt-1">
                            Enviado por: <em>patriciaandrade@palieduca.com.br</em>
                        </p>

                        <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                                    {error}
                                </div>
                            )}
                            {resendStatus && (
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                                    <CheckCircle2 size={14} /> {resendStatus}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-2">Código de 6 Dígitos</label>
                                <div className="relative max-w-[240px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-full text-center text-2xl tracking-[8px] font-mono font-bold py-3 bg-warm-50 border-2 border-primary/40 focus:border-primary rounded-2xl focus:ring-4 focus:ring-primary/10 outline-none transition-all text-warm-900"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={verifyLoading || verificationCode.length < 6}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                            >
                                {verifyLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                                <span>Verificar e Acessar</span>
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-warm-100 flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={() => setStep('login')}
                                className="text-warm-500 hover:text-warm-800 flex items-center gap-1 font-medium cursor-pointer"
                            >
                                <ArrowLeft size={14} /> Voltar ao Login
                            </button>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className="text-primary hover:text-primary-dark font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw size={14} /> Reenviar Código
                            </button>
                        </div>
                    </div>
                ) : step === 'forgot_request' ? (
                    /* Step: Forgot Password - Request Code */
                    <div className="animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                            <KeyRound size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-center text-warm-900">Recuperar Minha Senha</h2>
                        <p className="text-xs text-center text-warm-600 mt-1 mb-6 leading-relaxed">
                            Digite o e-mail cadastrado na sua conta. Você receberá um código numérico de 6 dígitos para criar uma nova senha.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Seu E-mail Cadastrado</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="seu.email@exemplo.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={resetLoading || !forgotEmail.trim()}
                                className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {resetLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                <span>Enviar Código de Recuperação</span>
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-warm-100 text-center">
                            <button
                                type="button"
                                onClick={() => { setError(''); setStep('login'); }}
                                className="text-xs text-warm-600 hover:text-warm-900 inline-flex items-center gap-1 font-semibold cursor-pointer"
                            >
                                <ArrowLeft size={14} /> Voltar para a tela de login
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Step: Forgot Password - Enter 6-digit code and new password */
                    <div className="animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
                            <ShieldCheck size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-center text-warm-900">Definir Nova Senha</h2>
                        <p className="text-xs text-center text-warm-600 mt-1 mb-4 leading-relaxed">
                            Insira o código de 6 dígitos enviado para <strong>{forgotEmail}</strong> e crie sua nova senha segura.
                        </p>

                        {resetSuccess && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={14} /> {resetSuccess}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5 text-center">
                                    Código de 6 Dígitos
                                </label>
                                <div className="relative max-w-[220px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        autoFocus
                                        required
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-full text-center text-2xl tracking-[6px] font-mono font-bold py-2.5 bg-warm-50 border-2 border-primary/40 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 outline-none text-warm-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Nova Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Mínimo de 6 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(prev => !prev)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-400 hover:text-warm-700 cursor-pointer"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-warm-700 mb-1.5">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={resetLoading || resetCode.length < 6 || !newPassword || !confirmNewPassword}
                                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                            >
                                {resetLoading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                                <span>Salvar Nova Senha e Entrar</span>
                            </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-warm-100 flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={() => { setError(''); setStep('forgot_request'); }}
                                className="text-warm-600 hover:text-warm-900 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                                <ArrowLeft size={14} /> Corrigir E-mail
                            </button>
                            <button
                                type="button"
                                onClick={handleForgotPasswordRequest}
                                className="text-primary hover:text-primary-dark font-bold flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw size={14} /> Reenviar Código
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
};

export default Login;
