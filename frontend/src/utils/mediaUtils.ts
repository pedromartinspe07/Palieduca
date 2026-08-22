/**
 * Utilitários para URLs de mídia e integração com Google Drive
 */

export const parseGoogleDriveUrl = (url: string | undefined): string => {
    if (!url) return '';
    const trimmed = url.trim();

    // Se for link do Google Drive
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
        const fileIdMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            const fileId = fileIdMatch[1];
            // O CDN do Googleusercontent entrega a imagem com alta velocidade e suporte a tag <img>
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
    }

    return trimmed;
};

export const parseZohoWorkDriveUrl = (url: string | undefined): string => {
    if (!url) return '';
    const trimmed = url.trim();

    // Se for link do Zoho WorkDrive
    if (trimmed.includes('workdrive.zoho') || trimmed.includes('zohoexternal') || trimmed.includes('zohopublic')) {
        const match = trimmed.match(/\/(?:file|embed|download|open)\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            const fileId = match[1];
            if (trimmed.includes('zohopublic')) {
                return `https://workdrive.zohopublic.com/download/${fileId}`;
            } else if (trimmed.includes('zohoexternal')) {
                return `https://workdrive.zohoexternal.com/download/${fileId}`;
            }
            return `https://workdrive.zoho.com/download/${fileId}`;
        }
    }

    return trimmed;
};

export const getFullMediaUrl = (url: string | undefined): string => {
    if (!url) return '';
    let parsed = parseGoogleDriveUrl(url);
    parsed = parseZohoWorkDriveUrl(parsed);
    if (parsed.startsWith('http://') || parsed.startsWith('https://') || parsed.startsWith('data:') || parsed.startsWith('blob:')) {
        return parsed;
    }
    const apiBase = import.meta.env.VITE_API_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://127.0.0.1:8000' 
            : 'https://palieduca.onrender.com');
    return `${apiBase}${parsed.startsWith('/') ? '' : '/'}${parsed}`;
};
