import React, { useState } from 'react';
import type { BlockProps } from './types';
import { ImageIcon, Loader2 } from 'lucide-react';
import { getFullMediaUrl } from '../../../utils/mediaUtils';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const ImageBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { src, alt, caption } = block.data;
    const { objectFit = 'cover', rounded = 'xl', height = 400, containerWidth = 'max-w-4xl' } = block.styles || {};
    
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

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

        const files = e.dataTransfer.files;
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Por favor, arraste apenas arquivos de imagem.');
            return;
        }

        await uploadImage(file);
    };

    const uploadImage = async (file: File) => {
        setUploading(true);
        const token = localStorage.getItem('token');
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
                onUpdate(block.id, { data: { ...block.data, src: data.file_url } });
            } else {
                alert('Falha ao fazer upload da imagem.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao enviar imagem.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full py-6 px-4 transition-all duration-200 flex flex-col items-center justify-center ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-primary ring-inset z-10 rounded-xl' : 'hover:ring-2 hover:ring-blue-400/50 hover:ring-inset rounded-xl'
            } ${isDragging ? 'bg-primary/5 ring-4 ring-primary ring-inset' : ''}`}
        >
            <div className={`w-full ${containerWidth} mx-auto relative group`}>
                {!src ? (
                    <div 
                        className={`w-full bg-warm-100 border-2 border-dashed flex flex-col items-center justify-center rounded-${rounded} transition-colors ${
                            isDragging ? 'border-primary bg-primary/10' : 'border-warm-300'
                        }`}
                        style={{ height: `${height}px` }}
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin text-primary" size={40} />
                        ) : (
                            <>
                                <ImageIcon className="text-warm-400 mb-2" size={48} />
                                <p className="text-sm font-semibold text-warm-600">Arraste uma imagem ou clique para selecionar</p>
                                <p className="text-sm text-warm-400 mt-1">ou use o painel lateral para enviar</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div 
                        className={`relative w-full overflow-hidden rounded-${rounded}`}
                        style={{ height: `${height}px` }}
                    >
                        {uploading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                        )}
                        <img 
                            src={getFullMediaUrl(src)} 
                            alt={alt || "Imagem"} 
                            className="w-full h-full transition-transform duration-500 hover:scale-105"
                            style={{ objectFit: objectFit as React.CSSProperties['objectFit'] }}
                        />
                        {isEditing && isDragging && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-20 flex items-center justify-center border-4 border-primary rounded-xl">
                                <span className="bg-white px-4 py-2 rounded-full font-bold text-primary shadow-lg">Soltar Imagem</span>
                            </div>
                        )}
                    </div>
                )}
                
                {(caption || (isEditing && isSelected)) && (
                    <div className="mt-3 text-center">
                        <p 
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => onUpdate(block.id, { data: { ...block.data, caption: e.currentTarget.innerText } })}
                            className={`text-sm text-warm-500 italic outline-none ${!caption && isEditing ? 'opacity-50' : ''}`}
                            data-placeholder="Adicione uma legenda..."
                        >
                            {caption || (isEditing ? 'Adicione uma legenda...' : '')}
                        </p>
                    </div>
                )}
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow z-30">
                    Bloco de Imagem
                </div>
            )}
        </div>
    );
};

export default ImageBlock;
