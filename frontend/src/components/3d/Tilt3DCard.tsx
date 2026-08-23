import React, { useRef, useState, useCallback } from 'react';

interface Tilt3DCardProps {
    children: React.ReactNode;
    className?: string;
    maxTilt?: number;
    glareOpacity?: number;
}

const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
    children,
    className = '',
    maxTilt = 8,
    glareOpacity = 0.15
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
        setGlarePosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            opacity: glareOpacity
        });
    }, [maxTilt, glareOpacity]);

    const handleMouseLeave = useCallback(() => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setGlarePosition(prev => ({ ...prev, opacity: 0 }));
    }, []);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: transform || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                transition: 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)'
            }}
            className={`relative will-change-transform ${className}`}
        >
            {children}

            {/* Efeito de Reflexo de Luz (Glare Effect) */}
            <div
                className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-30"
                style={{
                    background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, ${glarePosition.opacity}), transparent 60%)`,
                    opacity: glarePosition.opacity > 0 ? 1 : 0
                }}
            />
        </div>
    );
};

export default Tilt3DCard;
