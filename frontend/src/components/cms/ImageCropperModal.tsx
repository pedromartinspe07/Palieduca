import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../context/AuthContext';
import { getFullMediaUrl } from '../../utils/mediaUtils';
import { 
    X, Crop, ZoomIn, ZoomOut, Save, Loader2, RotateCw, RefreshCw, 
    Maximize2, Sparkles, Image as ImageIcon, RectangleHorizontal, 
    RectangleVertical, Square, Unlock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://127.0.0.1:8000' : 'https://palieduca.onrender.com');

interface ImageCropperModalProps {
    imageUrl: string;
    originalUrl?: string;
    onClose: () => void;
    onCropComplete: (newUrl: string) => void;
}

type AspectRatioOption = 'original' | 'free' | '1:1' | '16:9' | '4:3' | '3:4' | '9:16';

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageUrl, originalUrl, onClose, onCropComplete }) => {
    const { token: authToken } = useAuth();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspectRatioType, setAspectRatioType] = useState<AspectRatioOption>('original');
    const [naturalAspect, setNaturalAspect] = useState<number | undefined>(undefined);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const targetUrl = originalUrl || imageUrl;
    const fullImageUrl = getFullMediaUrl(targetUrl);

    // Carregar a proporção natural da imagem original para que abra inteira por padrão
    useEffect(() => {
        let isMounted = true;
        const img = new Image();
        img.src = fullImageUrl;
        img.onload = () => {
            if (!isMounted) return;
            if (img.naturalWidth && img.naturalHeight) {
                const ratio = img.naturalWidth / img.naturalHeight;
                setNaturalAspect(ratio);
            }
            setImageLoaded(true);
        };
        img.onerror = () => {
            if (!isMounted) return;
            setImageLoaded(true);
        };

        return () => {
            isMounted = false;
        };
    }, [fullImageUrl]);

    const getAspectValue = (): number | undefined => {
        switch (aspectRatioType) {
            case 'original':
                return naturalAspect;
            case 'free':
                return undefined;
            case '1:1':
                return 1;
            case '16:9':
                return 16 / 9;
            case '4:3':
                return 4 / 3;
            case '3:4':
                return 3 / 4;
            case '9:16':
                return 9 / 16;
            default:
                return naturalAspect;
        }
    };

    const onCropCompleteHandler = useCallback((_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setAspectRatioType('original');
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const createImage = async (url: string): Promise<HTMLImageElement> => {
        // 1. Tenta carregar via fetch -> blob -> objectUrl (evita problemas de Canvas Tainted / CORS)
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(e);
                    img.src = objectUrl;
                });
            }
        } catch (e) {
            console.warn('Fallback para carregamento direto da imagem no Canvas:', e);
        }

        // 2. Fallback direto
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); 
            image.src = url;
        });
    };

    const getCroppedImg = async (imageSrc: string, pixelCrop: any, rot = 0): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Não foi possível obter o contexto 2D do Canvas');
        }

        const rotRad = (rot * Math.PI) / 180;

        // Bounding box of the rotated image
        const bBoxWidth = Math.abs(Math.cos(rotRad) * image.naturalWidth) + Math.abs(Math.sin(rotRad) * image.naturalHeight);
        const bBoxHeight = Math.abs(Math.sin(rotRad) * image.naturalWidth) + Math.abs(Math.cos(rotRad) * image.naturalHeight);

        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

        ctx.drawImage(image, 0, 0);

        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
            throw new Error('Não foi possível obter o contexto 2D do Canvas de recorte');
        }

        croppedCanvas.width = Math.max(1, pixelCrop.width);
        croppedCanvas.height = Math.max(1, pixelCrop.height);

        croppedCtx.drawImage(
            canvas,
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
            croppedCanvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('O recorte gerou uma imagem vazia'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        
        setIsSaving(true);
        try {
            const croppedBlob = await getCroppedImg(fullImageUrl, croppedAreaPixels, rotation);
            const file = new File([croppedBlob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            const token = authToken || localStorage.getItem('palieduca_token') || localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/api/media/upload`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || `Falha no servidor (${res.status})`);
            }
            
            const data = await res.json();
            onCropComplete(data.file_url);
            
        } catch (error: any) {
            console.error('Error cropping image:', error);
            alert(`Não foi possível salvar o recorte: ${error?.message || error}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUseOriginal = () => {
        onCropComplete(targetUrl);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-warm-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-warm-200 animate-scale-in max-h-[92vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-warm-100 flex items-center justify-between bg-warm-50/80 backdrop-blur">
                    <div className="flex items-center gap-3 text-warm-900">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                            <Crop size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold">Ajustar e Recortar Imagem</h2>
                            <p className="text-xs text-warm-500 hidden sm:block">Selecione uma proporção ou use a imagem original inteira</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={handleUseOriginal}
                            disabled={isSaving}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm-200/70 hover:bg-warm-300 text-warm-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
                            title="Usar imagem sem nenhum corte"
                        >
                            <Sparkles size={14} className="text-primary" />
                            Usar Imagem Inteira (Sem corte)
                        </button>
                        <button 
                            onClick={onClose}
                            disabled={isSaving}
                            className="p-2 text-warm-400 hover:text-warm-700 hover:bg-warm-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Aspect Ratio Selector Toolbar */}
                <div className="px-6 py-2.5 bg-warm-100/60 border-b border-warm-200 flex items-center gap-2 overflow-x-auto text-xs scrollbar-thin">
                    <span className="font-bold text-warm-600 shrink-0 mr-1 flex items-center gap-1">
                        Proporção:
                    </span>
                    
                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('original'); setZoom(1); setCrop({ x: 0, y: 0 }); setRotation(0); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === 'original'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        <Maximize2 size={13} />
                        Original / Inteira
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('free'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === 'free'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        <Unlock size={13} />
                        Livre
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('1:1'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === '1:1'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        <Square size={13} />
                        1:1 (Quadrado)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('16:9'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === '16:9'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        <RectangleHorizontal size={13} />
                        16:9 (Paisagem)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('4:3'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === '4:3'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        4:3 (Padrão)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('3:4'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === '3:4'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        3:4 (Retrato)
                    </button>

                    <button
                        type="button"
                        onClick={() => { setAspectRatioType('9:16'); }}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                            aspectRatioType === '9:16'
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-warm-700 hover:bg-warm-200 border border-warm-200'
                        }`}
                    >
                        <RectangleVertical size={13} />
                        9:16 (Vertical)
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative w-full h-[45vh] sm:h-[50vh] bg-[#141414] overflow-hidden flex items-center justify-center">
                    {!imageLoaded && (
                        <div className="flex flex-col items-center gap-2 text-white/70">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <span className="text-xs">Carregando imagem...</span>
                        </div>
                    )}
                    <Cropper
                        image={fullImageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={getAspectValue()}
                        minZoom={0.5}
                        maxZoom={4}
                        zoomWithScroll={true}
                        showGrid={true}
                        restrictPosition={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onMediaLoaded={(mediaSize) => {
                            if (mediaSize && mediaSize.naturalWidth && mediaSize.naturalHeight) {
                                const ratio = mediaSize.naturalWidth / mediaSize.naturalHeight;
                                setNaturalAspect(ratio);
                            }
                        }}
                        classes={{ containerClassName: 'cursor-move' }}
                    />
                </div>

                {/* Controls & Footer */}
                <div className="p-4 sm:p-6 bg-white space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        {/* Zoom Control */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                                className="p-1.5 hover:bg-warm-100 rounded-lg text-warm-600 transition-colors"
                                title="Diminuir Zoom"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <input
                                type="range"
                                value={zoom}
                                min={0.5}
                                max={3}
                                step={0.05}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                                className="p-1.5 hover:bg-warm-100 rounded-lg text-warm-600 transition-colors"
                                title="Aumentar Zoom"
                            >
                                <ZoomIn size={18} />
                            </button>
                            <span className="text-xs font-bold text-warm-700 w-12 text-right shrink-0">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        {/* Rotation and Reset Buttons */}
                        <div className="flex items-center justify-start sm:justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleRotate}
                                className="px-3 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                title="Girar 90 graus"
                            >
                                <RotateCw size={14} />
                                Girar 90°
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 bg-warm-100 hover:bg-warm-200 text-warm-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                                title="Resetar ajustes"
                            >
                                <RefreshCw size={14} />
                                Resetar
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-warm-100">
                        <button
                            type="button"
                            onClick={handleUseOriginal}
                            disabled={isSaving}
                            className="px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-800 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                        >
                            <ImageIcon size={16} />
                            Usar Imagem Original
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-4 py-2.5 bg-warm-100 hover:bg-warm-200 text-warm-700 font-bold text-xs sm:text-sm rounded-xl transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar Recorte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
