import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, HeartPulse, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const Register: React.FC = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

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
            // Cadastro
            const regResponse = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    senha,
                    nome,
                    cargo: 'aluno'
                })
            });

            if (!regResponse.ok) {
                const errorData = await regResponse.json();
                throw new Error(errorData.detail || 'Erro ao realizar o cadastro');
            }

            // Login logo em seguida
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', senha);

            const logResponse = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            if (!logResponse.ok) {
                throw new Error('Cadastro realizado, mas ocorreu um erro no login.');
            }

            const data = await logResponse.json();
            login(data.access_token, data.user);
            navigate('/perfil');
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-warm-50 px-4">
            <div className="max-w-md w-full glassmorphism p-8 rounded-3xl border border-warm-200 shadow-xl">
                <div className="text-center mb-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <HeartPulse size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-warm-900">Cadastro Palieduca</h2>
                    <p className="text-warm-500 mt-2">Crie sua conta para começar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-warm-700 mb-2">Nome Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                <User size={20} />
                            </div>
                            <input 
                                type="text" 
                                required
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-warm-900"
                                placeholder="João da Silva"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-warm-700 mb-2">E-mail Institucional</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                <Mail size={20} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-warm-900"
                                placeholder="exemplo@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-warm-700 mb-2">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-400">
                                <Lock size={20} />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-warm-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-warm-900"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Minha Conta'}
                    </button>
                    
                    <div className="mt-4 flex justify-center">
                        <GoogleLogin 
                            onSuccess={handleGoogleSuccess} 
                            onError={() => setError('Falha no cadastro com o Google')} 
                            text="signup_with"
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>
                </form>
                
                <div className="mt-6 text-center text-sm text-warm-600">
                    Já possui uma conta?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">
                        Faça login aqui
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Register;
