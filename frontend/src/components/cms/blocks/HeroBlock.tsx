import React, { useState } from 'react';
import type { BlockProps } from './types';
import { Loader2 } from 'lucide-react';
import { getFullMediaUrl } from '../../../utils/mediaUtils';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const HeroBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title, subtitle, bgImage } = block.data;
    const { bgOverlayOpacity = 40, titleAlign = 'center' } = block.styles || {};
    
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleTextChange = (field: string, text: string) => {
        onUpdate(block.id, { data: { ...block.data, [field]: text } });
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        if (!isEditing) return;
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setUploading(true);
            const token = localStorage.getItem('palieduca_token') || localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch(`${API_URL}/api/media/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    onUpdate(block.id, { data: { ...block.data, bgImage: data.file_url } });
                } else {
                    alert('Falha ao fazer upload da imagem.');
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão ao enviar imagem.');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div 
            onClick={(e) => {
                // Prevent bubbling if clicking inside
                e.stopPropagation();
                onSelect(block.id);
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full overflow-hidden transition-all duration-200 ${
                isEditing ? 'cursor-pointer min-h-[400px]' : 'min-h-[500px]'
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-xl'
            } ${isDragging ? 'ring-4 ring-primary ring-inset opacity-90' : ''}`}
            style={{
                backgroundImage: bgImage ? `url(${getFullMediaUrl(bgImage)})` : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div 
                className="absolute inset-0 backdrop-blur-[2px] transition-colors duration-300" 
                style={{ backgroundColor: isDragging ? 'rgba(var(--primary-rgb), 0.3)' : `rgba(255, 255, 255, ${bgOverlayOpacity / 100})` }}
            >
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                )}
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <span className="bg-white px-6 py-3 rounded-full font-bold text-primary shadow-2xl text-lg flex items-center gap-2">
                            Mudar Imagem de Fundo
                        </span>
                    </div>
                )}
            </div>
            
            <div className={`relative z-10 h-full flex flex-col items-${titleAlign === 'left' ? 'start' : titleAlign === 'right' ? 'end' : 'center'} text-${titleAlign} p-8 sm:p-12`}>
                <h1 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                    className="text-4xl sm:text-6xl font-bold text-warm-900 mb-6 max-w-4xl tracking-tight"
                    style={{ outline: 'none' }}
                >
                    {title || 'Título do seu Hero'}
                </h1>
                
                <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('subtitle', e.currentTarget.innerText)}
                    className="text-lg sm:text-xl text-warm-700 max-w-2xl leading-relaxed"
                    style={{ outline: 'none' }}
                >
                    {subtitle || 'Adicione um subtítulo cativante para engajar seus visitantes logo na primeira dobra do site.'}
                </p>
                
                {/* Mocked Button, uneditable inline for safety, can be styled later in Properties */}
                <div className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform pointer-events-none">
                    Saiba Mais
                </div>
            </div>
            
            {/* Visual indicator of selection */}
            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow">
                    Hero Section
                </div>
            )}
        </div>
    );
};

export default HeroBlock;
