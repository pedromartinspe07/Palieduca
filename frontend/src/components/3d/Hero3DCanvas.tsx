import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Hero3DCanvasProps {
    className?: string;
}

const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasWebGL, setHasWebGL] = useState(true);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Verificar suporte a WebGL
        try {
            const canvasTest = document.createElement('canvas');
            const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
            if (!gl) {
                setHasWebGL(false);
                return;
            }
        } catch {
            setHasWebGL(false);
            return;
        }

        // 2. Setup Three.js Scene, Camera & Renderer
        const scene = new THREE.Scene();
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 450;

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 0.2, 5.5);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);

        // 3. Iluminação 3D de Estúdio para valorizar a Árvore Coração
        const ambientLight = new THREE.AmbientLight(0xfff5f0, 1.4);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
        dirLight.position.set(4, 6, 5);
        scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0xff4d6d, 3.0, 15);
        pointLight1.position.set(2, 3, 2);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xf59e0b, 2.0, 15);
        pointLight2.position.set(-3, -1, 2);
        scene.add(pointLight2);

        // 4. Nuvem de Pétalas e Partículas 3D Acolhedoras Flutuantes
        const particleCount = 180;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const particleColors = [
            new THREE.Color(0xff4d6d), // Rosa/Vermelho pétala
            new THREE.Color(0xf43f5e), // Vermelho vivo
            new THREE.Color(0xf59e0b), // Dourado
            new THREE.Color(0x34d399)  // Verde vida
        ];

        for (let i = 0; i < particleCount; i++) {
            const radius = 1.8 + Math.random() * 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 0.3;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const c = particleColors[Math.floor(Math.random() * particleColors.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // 5. Carregar o Modelo 3D da Árvore Coração (GLB)
        let modelGroup: THREE.Group | null = null;
        const loader = new GLTFLoader();

        loader.load(
            '/3d/love_heart_tree_for_valentines_day.glb',
            (gltf) => {
                const model = gltf.scene;
                
                // Centralizar e ajustar escala do modelo 3D
                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const targetScale = 3.6 / maxDim;
                model.scale.set(targetScale, targetScale, targetScale);

                // Centraliza a árvore no ponto focal da câmera
                model.position.x = -center.x * targetScale;
                model.position.y = -center.y * targetScale - 0.2;
                model.position.z = -center.z * targetScale;

                modelGroup = new THREE.Group();
                modelGroup.add(model);
                scene.add(modelGroup);

                setIsLoadingModel(false);
            },
            undefined,
            (error) => {
                console.warn('Fallback 3D ativado:', error);
                setIsLoadingModel(false);
            }
        );

        // 6. Interatividade com o Mouse (Parallax & Inércia)
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        const onMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // 7. Loop de Animação
        let animationFrameId: number;
        const clock = new THREE.Clock();
        let isTabActive = true;

        const handleVisibilityChange = () => {
            isTabActive = !document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            if (!isTabActive) return;

            const elapsedTime = clock.getElapsedTime();

            // Rotação contínua e suave da Árvore Coração
            if (modelGroup) {
                modelGroup.rotation.y = elapsedTime * 0.35 + (targetX * 0.4);
                modelGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.04 + (targetY * 0.2);
                
                // Pulsação suave do coração (batimento acolhedor)
                const pulse = 1 + Math.sin(elapsedTime * 1.8) * 0.02;
                modelGroup.scale.set(pulse, pulse, pulse);
            }

            // Rotação das partículas
            particleSystem.rotation.y = elapsedTime * 0.12;
            particleSystem.rotation.x = Math.sin(elapsedTime * 0.2) * 0.08;

            // Inércia suave da câmera em relação ao mouse
            targetX += (mouseX * 0.7 - targetX) * 0.05;
            targetY += (mouseY * 0.7 - targetY) * 0.05;

            camera.position.x = targetX * 0.8;
            camera.position.y = 0.2 + (targetY * 0.5);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };

        animate();

        // 8. Responsividade no Resize
        const handleResize = () => {
            if (!container) return;
            const newW = container.clientWidth;
            const newH = container.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };

        window.addEventListener('resize', handleResize);

        // 9. Cleanup Completo
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            particleGeometry.dispose();
            particleMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    if (!hasWebGL) {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-rose-400/30 to-amber-400/20 blur-3xl animate-pulse" />
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full min-h-[380px] relative pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
            title="Mova o mouse para interagir com o Coração 3D"
        >
            {isLoadingModel && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default Hero3DCanvas;
