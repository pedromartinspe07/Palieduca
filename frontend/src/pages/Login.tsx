import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, HeartPulse, Loader2, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, LogIn, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Password visibility with 30s auto-hide timer
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCountdown, setPasswordCountdown] = useState<number | null>(null);
    const timerRef = useRef<any>(null);

    // Verification state if account was unconfirmed
    const [step, setStep] = useState<'login' | 'verify'>('login');
    const [verificationCode, setVerificationCode] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Toggle password visibility with 30s timer
    const toggleShowPassword = () => {
        if (showPassword) {
            // Volta a ser confidencial imediatamente
            setShowPassword(false);
            setPasswordCountdown(null);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            // Revela por 30 segundos
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

            // Timeout de segurança para evitar loading infinito caso a conexão congele
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
                setError(data.detail || 'Erro ao reenviar código.');
                setResendStatus('');
            }
        } catch {
            setError('Erro de conexão ao reenviar código.');
            setResendStatus('');
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-warm-50 px-4">
            <div className="max-w-md w-full glassmorphism p-8 rounded-3xl border border-warm-200 shadow-xl">
                
                {step === 'login' ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                <HeartPulse size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-warm-900">Acesso ao Palieduca</h2>
                            <p className="text-warm-500 mt-2 text-sm">Faça login para continuar seus estudos</p>
                        </div>

                        {/* Google One-Click Login */}
                        <div className="mb-6 flex flex-col items-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Falha no login com Google')}
                                shape="circle"
                                size="large"
                                width="100%"
                                text="signin_with"
                            />
                            <div className="w-full flex items-center my-5">
                                <div className="flex-1 border-t border-warm-200"></div>
                                <span className="px-3 text-xs uppercase tracking-wider text-warm-400 font-semibold">Ou com seu e-mail</span>
                                <div className="flex-1 border-t border-warm-200"></div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">
                                    {error}
                                </div>
                            )}
                            
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
                                    {passwordCountdown !== null && (
                                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                            Visível por {passwordCountdown}s
                                        </span>
                                    )}
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
                ) : (
                    /* Step 2: Verification Code screen */
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
                                className="text-warm-500 hover:text-warm-800 flex items-center gap-1 font-medium"
                            >
                                <ArrowLeft size={14} /> Voltar
                            </button>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className="text-primary hover:text-primary-dark font-bold flex items-center gap-1"
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
