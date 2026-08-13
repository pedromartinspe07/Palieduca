import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Crop, ZoomIn, Save, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

interface ImageCropperModalProps {
    imageUrl: string;
    onClose: () => void;
    onCropComplete: (newUrl: string) => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageUrl, onClose, onCropComplete }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); 
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        
        setIsSaving(true);
        try {
            const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
            const file = new File([croppedBlob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/api/media/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            
            const data = await res.json();
            onCropComplete(data.file_url);
            
        } catch (error) {
            console.error('Error cropping image:', error);
            alert('Não foi possível salvar o recorte.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-warm-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-warm-200 animate-slide-up">
                {/* Header */}
                <div className="px-6 py-4 border-b border-warm-100 flex items-center justify-between bg-warm-50">
                    <div className="flex items-center gap-3 text-warm-900">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <Crop size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Recortar Imagem</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative w-full h-[50vh] sm:h-[60vh] bg-[#1a1a1a]">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9} // Optional: allow user to change aspect ratio later
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                        classes={{ containerClassName: 'cursor-move' }}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-white space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomIn size={20} className="text-warm-500 shrink-0" />
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="text-sm font-bold text-warm-700 w-12 text-right">
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Salvar Recorte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
