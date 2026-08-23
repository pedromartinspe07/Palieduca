import React, { useEffect, useRef } from 'react';

interface ConfettiCelebrationProps {
    duration?: number;
    onComplete?: () => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
}

const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
    duration = 4000,
    onComplete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#4A6B53', '#FCD34D'];
        const particles: Particle[] = [];
        const particleCount = 130;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() * 200 - 100),
                y: canvas.height * 0.45 + (Math.random() * 100 - 50),
                vx: (Math.random() - 0.5) * 16,
                vy: -Math.random() * 14 - 4,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        let animationFrameId: number;
        const startTime = performance.now();

        const render = (time: number) => {
            const elapsed = time - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let allDead = true;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35; // Gravidade
                p.vx *= 0.98; // Atrito
                p.rotation += p.rotationSpeed;

                if (elapsed > duration * 0.6) {
                    p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
                }

                if (p.opacity > 0) {
                    allDead = false;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = p.opacity;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    ctx.restore();
                }
            });

            if (!allDead && elapsed < duration) {
                animationFrameId = requestAnimationFrame(render);
            } else {
                if (onComplete) onComplete();
            }
        };

        animationFrameId = requestAnimationFrame(render);

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [duration, onComplete]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[9998]"
        />
    );
};

export default ConfettiCelebration;
