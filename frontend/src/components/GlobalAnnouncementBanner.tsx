import React, { useState, useEffect } from 'react';
import { Megaphone, X, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://127.0.0.1:8000'
    : 'https://palieduca.onrender.com';

export interface AnnouncementData {
    id: number;
    message: string;
    link_url?: string | null;
    link_text?: string | null;
    type: 'info' | 'warning' | 'success';
    is_active: boolean;
    updated_at?: string | null;
}

export const GlobalAnnouncementBanner: React.FC = () => {
    const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
    const [dismissed, setDismissed] = useState(false);

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch(`${API_URL}/api/announcement`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.is_active) {
                    const dismissedId = localStorage.getItem('palieduca_dismissed_announcement_id');
                    if (dismissedId !== String(data.id)) {
                        setAnnouncement(data);
                    }
                } else {
                    setAnnouncement(null);
                }
            }
        } catch (err) {
            // Silently fail if server unreachable
        }
    };

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const handleDismiss = () => {
        if (announcement) {
            localStorage.setItem('palieduca_dismissed_announcement_id', String(announcement.id));
        }
        setDismissed(true);
    };

    if (!announcement || dismissed) return null;

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-amber-600 dark:bg-amber-700 text-white',
                    icon: AlertCircle
                };
            case 'success':
                return {
                    bg: 'bg-emerald-600 dark:bg-emerald-700 text-white',
                    icon: Sparkles
                };
            default:
                return {
                    bg: 'bg-gradient-to-r from-teal-700 via-primary to-sky-700 text-white',
                    icon: Megaphone
                };
        }
    };

    const style = getTypeStyles(announcement.type);
    const IconComp = style.icon;

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 py-2.5 px-4 ${style.bg} shadow-md text-xs font-semibold animate-fade-in flex items-center justify-between gap-3`}>
            <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
                <IconComp size={15} className="shrink-0 animate-bounce" />
                <span>{announcement.message}</span>

                {announcement.link_url && (
                    announcement.link_url.startsWith('/') ? (
                        <Link
                            to={announcement.link_url}
                            className="inline-flex items-center gap-1 underline underline-offset-2 font-bold hover:opacity-90 ml-1"
                        >
                            {announcement.link_text || 'Saiba mais'}
                        </Link>
                    ) : (
                        <a
                            href={announcement.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 underline underline-offset-2 font-bold hover:opacity-90 ml-1"
                        >
                            {announcement.link_text || 'Acessar link'} <ExternalLink size={12} />
                        </a>
                    )
                )}
            </div>

            <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Fechar comunicado"
            >
                <X size={15} />
            </button>
        </div>
    );
};

export default GlobalAnnouncementBanner;
