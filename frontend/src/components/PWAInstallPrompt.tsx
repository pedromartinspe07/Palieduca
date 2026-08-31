import React, { useState, useEffect } from 'react';
import { 
    Smartphone, 
    Download, 
    X, 
    Share2, 
    PlusSquare, 
    CheckCircle2, 
    Sparkles,
    MoreVertical,
    Check
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const triggerGlobalPWAInstall = () => {
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
};

// Ícone Vetorial Autêntico do Robô do Android 🤖
const AndroidRobotIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Antenas do Robô */}
        <line x1="7" y1="2.5" x2="8.5" y2="5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="17" y1="2.5" x2="15.5" y2="5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        {/* Cabeça semi-circular */}
        <path d="M5 10.5C5 6.634 8.134 3.5 12 3.5C15.866 3.5 19 6.634 19 10.5H5Z" />
        {/* Olhos brancos */}
        <circle cx="9" cy="7.5" r="1.1" fill="white" />
        <circle cx="15" cy="7.5" r="1.1" fill="white" />
        {/* Corpo */}
        <rect x="5.5" y="11.8" width="13" height="7.5" rx="1.8" />
        {/* Braço Esquerdo */}
        <rect x="2" y="12" width="2.4" height="6" rx="1.2" />
        {/* Braço Direito */}
        <rect x="19.6" y="12" width="2.4" height="6" rx="1.2" />
        {/* Pernas */}
        <rect x="8" y="20" width="2.4" height="3" rx="1.2" />
        <rect x="13.6" y="20" width="2.4" height="3" rx="1.2" />
    </svg>
);

// Ícone Vetorial da Maçã Apple 🍏
const AppleLogoIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.62-.75 1.04-1.8 0.93-2.87-.9.04-1.99.6-2.63 1.35-.56.65-1.05 1.71-.92 2.74 1 .08 2.03-.52 2.62-1.22z" />
    </svg>
);

const PWAInstallPrompt: React.FC = () => {
    const [detectedOS, setDetectedOS] = useState<'android' | 'ios' | 'desktop'>('android');
    const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
    const [isStandalone, setIsStandalone] = useState<boolean>(false);
    const [showFloatingBanner, setShowFloatingBanner] = useState<boolean>(false);
    const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
    const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
    const [canDirectInstall, setCanDirectInstall] = useState<boolean>(false);

    useEffect(() => {
        // 1. Verifica se já está rodando como PWA instalado (Standalone)
        const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        
        setIsStandalone(checkStandalone);
        if (checkStandalone) return;

        // 2. Detecta o Sistema Operacional
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
        const isAndroidDevice = /android/.test(userAgent);

        if (isIosDevice) {
            setDetectedOS('ios');
            setActiveTab('ios');
        } else if (isAndroidDevice) {
            setDetectedOS('android');
            setActiveTab('android');
        } else {
            setDetectedOS('desktop');
            setActiveTab('android');
        }

        // 3. Verifica se o usuário já dispensou o banner recentemente
        const dismissedAt = localStorage.getItem('palieduca_pwa_dismissed');
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const isDismissed = dismissedAt && (now - parseInt(dismissedAt, 10) < sevenDays);

        // 4. Captura evento nativo do Android / Chrome / Edge
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            deferredPrompt = e as BeforeInstallPromptEvent;
            setCanDirectInstall(true);
            if (!isDismissed) {
                setTimeout(() => setShowFloatingBanner(true), 3500);
            }
        };

        // 5. Listener global disparado por botões no menu/header/footer
        const handleGlobalTrigger = () => {
            setShowGuideModal(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('open-pwa-install', handleGlobalTrigger);

        if (isIosDevice && !isDismissed && !checkStandalone) {
            setTimeout(() => setShowFloatingBanner(true), 4000);
        }

        // Listener de instalação concluída
        const handleAppInstalled = () => {
            setInstalledSuccess(true);
            setShowFloatingBanner(false);
            setShowGuideModal(false);
            deferredPrompt = null;
            setCanDirectInstall(false);
            setTimeout(() => setInstalledSuccess(false), 5000);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('open-pwa-install', handleGlobalTrigger);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleDirectInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    setShowFloatingBanner(false);
                    setShowGuideModal(false);
                    deferredPrompt = null;
                    setCanDirectInstall(false);
                }
            } catch (err) {
                console.error('Erro ao acionar prompt de instalação:', err);
            }
        }
    };

    const handleDismissBanner = () => {
        setShowFloatingBanner(false);
        localStorage.setItem('palieduca_pwa_dismissed', Date.now().toString());
    };

    if (isStandalone) return null;

    return (
        <>
            {/* Banner Flutuante Rápido (Auto-sugestão) */}
            {showFloatingBanner && !installedSuccess && !showGuideModal && (
                <aside 
                    aria-label="Instalação do Aplicativo Palieduca"
                    className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-md w-[calc(100%-2rem)] sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 border-2 border-teal-500/40 dark:border-teal-500/50 shadow-2xl animate-slide-up"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                                {detectedOS === 'android' ? (
                                    <AndroidRobotIcon size={26} className="text-[#a4c639]" />
                                ) : detectedOS === 'ios' ? (
                                    <AppleLogoIcon size={26} className="text-white" />
                                ) : (
                                    <Smartphone size={24} />
                                )}
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                                    <Sparkles size={10} className="text-teal-600 dark:text-teal-400" />
                                    Aplicativo UFPB
                                </div>
                                <h3 className="text-sm font-bold text-warm-900 dark:text-slate-100 mt-0.5">
                                    Instalar Palieduca no Celular
                                </h3>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDismissBanner}
                            className="p-1.5 text-warm-400 hover:text-warm-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-warm-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Lembrar mais tarde"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <p className="text-xs text-warm-600 dark:text-slate-300 mt-3 leading-relaxed">
                        Acesse aulas, casos clínicos e biblioteca direto da sua tela inicial, com navegação rápida em tela cheia.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowFloatingBanner(false);
                                setShowGuideModal(true);
                            }}
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Download size={14} />
                            <span>Ver Passo a Passo</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDismissBanner}
                            className="py-2.5 px-3 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 dark:hover:bg-slate-700 text-warm-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                        >
                            Depois
                        </button>
                    </div>
                </aside>
            )}

            {/* Notificação de Sucesso */}
            {installedSuccess && (
                <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-bold">
                    <CheckCircle2 size={18} />
                    <span>Aplicativo Palieduca instalado com sucesso!</span>
                </div>
            )}

            {/* Modal Completo de Instalação com Abas Android 🤖 e iPhone 🍏 */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-warm-200 dark:border-slate-800 relative space-y-5 animate-scale-in text-left">
                        {/* Botão Fechar */}
                        <button
                            type="button"
                            onClick={() => setShowGuideModal(false)}
                            className="absolute top-5 right-5 p-2 text-warm-400 hover:text-warm-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-warm-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Fechar guia"
                        >
                            <X size={18} />
                        </button>

                        {/* Top Header com Ícone e Badge do Sistema Detectado */}
                        <div className="flex items-center gap-3.5 pr-8">
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all ${
                                activeTab === 'android' 
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-700/60'
                                    : 'bg-slate-800 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-700 shadow-xs'
                            }`}>
                                {activeTab === 'android' ? (
                                    <AndroidRobotIcon size={30} className="text-[#78c257] dark:text-[#a4c639]" />
                                ) : (
                                    <AppleLogoIcon size={28} />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                                        Aplicativo PWA Oficial
                                    </span>
                                    {detectedOS !== 'desktop' && (
                                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                            (Detectado)
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-warm-900 dark:text-slate-100 mt-0.5 leading-snug">
                                    Instalar no seu Celular
                                </h3>
                            </div>
                        </div>

                        {/* Seletor de Abas de Sistema Operacional (Android 🤖 vs iPhone 🍏) */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-warm-100 dark:bg-slate-800/80 rounded-2xl border border-warm-200/80 dark:border-slate-700">
                            {/* Aba Android */}
                            <button
                                type="button"
                                onClick={() => setActiveTab('android')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'android'
                                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-900/60 scale-[1.02]'
                                        : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <AndroidRobotIcon size={18} className={activeTab === 'android' ? 'text-[#78c257]' : 'opacity-70'} />
                                <span>Android</span>
                            </button>

                            {/* Aba iPhone */}
                            <button
                                type="button"
                                onClick={() => setActiveTab('ios')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeTab === 'ios'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 scale-[1.02]'
                                        : 'text-warm-600 dark:text-slate-400 hover:text-warm-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <AppleLogoIcon size={17} className={activeTab === 'ios' ? 'text-slate-900 dark:text-white' : 'opacity-70'} />
                                <span>iPhone (iOS)</span>
                            </button>
                        </div>

                        {/* CONTEÚDO DA ABA ANDROID */}
                        {activeTab === 'android' && (
                            <div className="space-y-3.5 animate-fade-in">
                                <p className="text-xs text-warm-600 dark:text-slate-300 leading-relaxed">
                                    No <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Samsung Internet</strong>, você pode instalar em segundos:
                                </p>

                                <div className="space-y-2.5 bg-emerald-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-emerald-100 dark:border-slate-700/80 text-xs text-warm-800 dark:text-slate-200">
                                    {/* Passo 1 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            1
                                        </div>
                                        <p className="leading-snug">
                                            Toque no menu de <strong>3 pontinhos</strong> <MoreVertical size={13} className="inline text-emerald-600 dark:text-emerald-400 mx-0.5" /> no canto superior direito do navegador.
                                        </p>
                                    </div>

                                    {/* Passo 2 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            2
                                        </div>
                                        <p className="leading-snug">
                                            Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong> <Download size={13} className="inline text-emerald-600 dark:text-emerald-400 mx-0.5" />.
                                        </p>
                                    </div>

                                    {/* Passo 3 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            3
                                        </div>
                                        <p className="leading-snug">
                                            Confirme tocando em <strong>"Instalar"</strong>. O ícone do Palieduca aparecerá na sua lista de apps!
                                        </p>
                                    </div>
                                </div>

                                {/* Botão de Instalação Direta 1-Clique no Android (se suportado pelo navegador) */}
                                {canDirectInstall && (
                                    <button
                                        type="button"
                                        onClick={handleDirectInstall}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <AndroidRobotIcon size={18} className="text-[#a4c639]" />
                                        <span>Instalar no Android Agora (1 Clique)</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* CONTEÚDO DA ABA IPHONE (iOS) */}
                        {activeTab === 'ios' && (
                            <div className="space-y-3.5 animate-fade-in">
                                <p className="text-xs text-warm-600 dark:text-slate-300 leading-relaxed">
                                    No navegador <strong>Safari</strong> do iPhone/iPad, siga estes 2 passos rápidos:
                                </p>

                                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-warm-800 dark:text-slate-200">
                                    {/* Passo 1 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            1
                                        </div>
                                        <p className="leading-snug">
                                            Toque no botão <strong>Compartilhar</strong> <Share2 size={13} className="inline text-teal-700 dark:text-teal-400 mx-0.5" /> (o ícone de quadrado com seta) na barra inferior do Safari.
                                        </p>
                                    </div>

                                    {/* Passo 2 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            2
                                        </div>
                                        <p className="leading-snug">
                                            Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={13} className="inline text-teal-700 dark:text-teal-400 mx-0.5" />.
                                        </p>
                                    </div>

                                    {/* Passo 3 */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">
                                            3
                                        </div>
                                        <p className="leading-snug">
                                            Toque em <strong>"Adicionar"</strong> no topo direito. O app será fixado na sua tela inicial!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Informações Extras de Vantagens */}
                        <div className="flex items-center justify-between text-[11px] text-warm-500 dark:text-slate-400 pt-1 border-t border-warm-100 dark:border-slate-800">
                            <span className="flex items-center gap-1">
                                <Check size={12} className="text-emerald-600" /> Sem ocupar memória pesada
                            </span>
                            <span className="flex items-center gap-1">
                                <Check size={12} className="text-emerald-600" /> 100% Gratuito (UFPB)
                            </span>
                        </div>

                        {/* Botão de Fechar / Concluir */}
                        <button
                            type="button"
                            onClick={() => {
                                setShowGuideModal(false);
                                handleDismissBanner();
                            }}
                            className="w-full py-2.5 bg-warm-100 dark:bg-slate-800 hover:bg-warm-200 dark:hover:bg-slate-700 text-warm-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAInstallPrompt;
