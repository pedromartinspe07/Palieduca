import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
    id: number;
    email: string;
    nome: string;
    cargo: string;
    foto_url?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (updatedData: Partial<User>) => void;
}

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('palieduca_token');
        localStorage.removeItem('palieduca_user');
    };

    useEffect(() => {
        // Recupera a sessão ao carregar a página
        const storedToken = localStorage.getItem('palieduca_token');
        const storedUser = localStorage.getItem('palieduca_user');
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);

                // Sincroniza em background com o servidor para validar token e pegar cargo/foto atualizados
                fetch(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${storedToken}` }
                })
                .then(res => {
                    if (res.ok) return res.json();
                    if (res.status === 401 || res.status === 403) {
                        logout();
                    }
                    return null;
                })
                .then(freshUser => {
                    if (freshUser) {
                        setUser(freshUser);
                        localStorage.setItem('palieduca_user', JSON.stringify(freshUser));
                    }
                })
                .catch(err => console.warn('Sessão restaurada localmente:', err));
            } catch (e) {
                console.error('Erro ao recuperar sessão:', e);
            }
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('palieduca_token', newToken);
        localStorage.setItem('palieduca_user', JSON.stringify(newUser));
    };

    const updateUser = (updatedData: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('palieduca_user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
