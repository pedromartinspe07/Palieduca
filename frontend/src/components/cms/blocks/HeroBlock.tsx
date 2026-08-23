import React, { useState } from 'react';
import type { BlockProps } from './types';
import { Loader2, ArrowRight } from 'lucide-react';
import { getFullMediaUrl } from '../../../utils/mediaUtils';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://palieduca.onrender.com';

const HeroBlock: React.FC<BlockProps> = ({ block, isEditing, isSelected, onUpdate, onSelect }) => {
    const { title, subtitle, bgImage } = block.data;
    
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

    const editableClass = isEditing ? 'outline-dashed outline-2 outline-teal-500/50 outline-offset-4 rounded cursor-text' : '';

    return (
        <div 
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full overflow-hidden transition-all duration-300 py-8 sm:py-16 px-4 sm:px-6 ${
                isEditing ? 'cursor-pointer' : ''
            } ${
                isSelected ? 'ring-4 ring-teal-500 ring-inset z-10 rounded-3xl' : ''
            } ${isDragging ? 'ring-4 ring-teal-500 ring-inset opacity-90' : ''}`}
            style={{
                background: bgImage 
                    ? `url(${getFullMediaUrl(bgImage)}) center/cover no-repeat` 
                    : 'linear-gradient(180deg, #F0FDF4 0%, #F8FAFC 100%)',
            }}
        >
            {/* 1. Backdrop Blobs de Luz Difusa (Ambient Mesh Gradient) */}
            {!bgImage && (
                <>
                    {/* Esfera Difusa Esmeralda (Topo Esquerdo) */}
                    <div 
                        className="absolute pointer-events-none rounded-full"
                        style={{
                            width: '450px',
                            height: '450px',
                            background: '#A7F3D0',
                            filter: 'blur(140px)',
                            opacity: 0.35,
                            top: '-40px',
                            left: '-40px',
                        }} 
                    />
                    {/* Esfera Difusa Azul-Sereno (Topo Direito) */}
                    <div 
                        className="absolute pointer-events-none rounded-full"
                        style={{
                            width: '500px',
                            height: '500px',
                            background: '#BAE6FD',
                            filter: 'blur(140px)',
                            opacity: 0.30,
                            top: '-40px',
                            right: '-40px',
                        }} 
                    />
                </>
            )}

            {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-30">
                    <Loader2 className="animate-spin text-teal-600" size={44} />
                </div>
            )}

            {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-teal-500/10 backdrop-blur-xs">
                    <span className="bg-white px-6 py-3 rounded-full font-bold text-teal-700 shadow-2xl text-lg flex items-center gap-2">
                        Solte a Imagem de Fundo Aqui
                    </span>
                </div>
            )}

            {/* 2. Hero Section Estruturada (Card Glassmorphism) */}
            <div className="hero-wrapper relative z-10 animate-fade-in">
                <h1 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('title', e.currentTarget.innerText)}
                    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.2] mb-4 ${editableClass}`}
                    style={{ outline: 'none' }}
                >
                    {title || 'Transforme o Conhecimento em Prática'}
                </h1>
                
                <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleTextChange('subtitle', e.currentTarget.innerText)}
                    className={`text-base sm:text-lg text-[#475569] font-normal leading-[1.6] max-w-[620px] mx-auto mt-4 mb-8 ${editableClass}`}
                    style={{ outline: 'none' }}
                >
                    {subtitle || 'Uma plataforma dedicada ao aprimoramento contínuo em cuidados paliativos.'}
                </p>
                
                {/* 3. Botão de Ação Primária (CTA) Alinhado à Marca */}
                <button 
                    type="button" 
                    className="btn-primary inline-flex items-center justify-center gap-2"
                >
                    <span>Explorar Conteúdo</span>
                    <ArrowRight size={18} />
                </button>
            </div>
            
            {/* Indicador Visual do Bloco Selecionado no CMS */}
            {isSelected && (
                <div className="absolute top-4 right-4 bg-teal-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-md z-20">
                    Hero Section
                </div>
            )}
        </div>
    );
};

export default HeroBlock;
