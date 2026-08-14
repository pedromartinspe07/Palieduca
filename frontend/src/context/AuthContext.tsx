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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Recupera a sessão ao carregar a página
        const storedToken = localStorage.getItem('palieduca_token');
        const storedUser = localStorage.getItem('palieduca_user');
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
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

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('palieduca_token');
        localStorage.removeItem('palieduca_user');
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
