import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md mx-auto animate-slide-up">
                {/* Subtle illustration */}
                <div className="relative mb-8">
                    <div className="text-[8rem] font-bold text-warm-100 select-none leading-none">404</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/80 backdrop-blur-md border border-warm-200 rounded-full p-5 shadow-xl">
                            <AlertCircle size={40} className="text-secondary" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-warm-900 mb-3">Página não encontrada</h1>
                <p className="text-warm-600 mb-8 leading-relaxed">
                    Não conseguimos encontrar o conteúdo que você está procurando.
                    Ele pode ter sido movido ou ainda estar em desenvolvimento.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-sage-700 transition-all shadow-md interactive-btn"
                    >
                        <Home size={18} />
                        <span>Voltar ao início</span>
                    </Link>
                    <Link
                        to="/modulos"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-warm-200 text-warm-700 rounded-full font-medium hover:border-primary hover:text-primary transition-all shadow-sm interactive-btn"
                    >
                        Ver módulos
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default NotFound;
