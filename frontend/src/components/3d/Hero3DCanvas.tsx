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

        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0.2, 4.8);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        container.appendChild(renderer.domElement);

        // 3. Iluminação de Estúdio para valorizar o Azul Elétrico da Borboleta Ulysses
        const ambientLight = new THREE.AmbientLight(0xf5faf7, 1.5);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
        dirLight.position.set(4, 5, 4);
        scene.add(dirLight);

        // Luz Azul/Ciano para realçar o brilho das asas
        const pointLightCyan = new THREE.PointLight(0x00f0ff, 3.5, 12);
        pointLightCyan.position.set(2, 2, 2.5);
        scene.add(pointLightCyan);

        // Luz Âmbar/Dourada quente de contraste
        const pointLightWarm = new THREE.PointLight(0xfbbf24, 2.2, 12);
        pointLightWarm.position.set(-3, -1, 2);
        scene.add(pointLightWarm);

        // 4. Nuvem de Partículas Luminosas / Poeira Mágica da Borboleta
        const particleCount = 160;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const particleColors = [
            new THREE.Color(0x38bdf8), // Azul céu
            new THREE.Color(0x00e5ff), // Ciano brilhante
            new THREE.Color(0x34d399), // Verde vida
            new THREE.Color(0xfde047)  // Dourado pólen
        ];

        for (let i = 0; i < particleCount; i++) {
            const radius = 1.4 + Math.random() * 2.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 0.1;
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const c = particleColors[Math.floor(Math.random() * particleColors.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.065,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particleSystem);

        // 5. Carregar o Modelo 3D da Borboleta Ulysses (GLB)
        let modelGroup: THREE.Group | null = null;
        let mixer: THREE.AnimationMixer | null = null;
        const loader = new GLTFLoader();

        loader.load(
            '/3d/ulysses_butterfly.glb',
            (gltf) => {
                const model = gltf.scene;

                // Centralizar e ajustar escala do modelo
                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                // Ajuste de escala delicada e proporção harmônica
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const targetScale = 2.4 / maxDim; // Tamanho proporcional e elegante
                model.scale.set(targetScale, targetScale, targetScale);

                // Centraliza no ponto focal
                model.position.x = -center.x * targetScale;
                model.position.y = -center.y * targetScale;
                model.position.z = -center.z * targetScale;

                // Inicia animação das asas se estiver presente no GLB com velocidade serena e calma
                if (gltf.animations && gltf.animations.length > 0) {
                    mixer = new THREE.AnimationMixer(model);
                    gltf.animations.forEach((clip) => {
                        const action = mixer!.clipAction(clip);
                        action.timeScale = 0.25; // Bater de asas bem calmo, suave e lento
                        action.play();
                    });
                }

                modelGroup = new THREE.Group();
                
                // Orientação limpa padrão (utiliza a rotação exportada diretamente do Blender)
                model.rotation.x = 0;
                model.rotation.y = 0;
                model.rotation.z = 0;

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

        // 6. Interatividade com o Mouse (Parallax suave)
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

        // 7. Loop de Animação e Voo Gracioso da Borboleta
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

            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Atualiza animação nativa das asas com velocidade lenta e relaxante
            if (mixer) {
                mixer.update(delta * 0.28);
            }

            // Flutuação serena e ereta da Borboleta no espaço 3D
            if (modelGroup) {
                // Flutuação suave para cima e para baixo
                const hoverY = Math.sin(elapsedTime * 1.2) * 0.08;
                modelGroup.position.y = hoverY;

                // Mantém as asas bem visíveis de frente com suave balanço orgânico
                const gentleSwayZ = Math.sin(elapsedTime * 1.0) * 0.03;
                const gentlePitchX = Math.sin(elapsedTime * 1.2) * 0.02;

                // Reação suave ao cursor do mouse mantendo-a em pé e de frente
                modelGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.12 + (targetX * 0.3);
                modelGroup.rotation.x = gentlePitchX + (targetY * 0.15);
                modelGroup.rotation.z = gentleSwayZ + (-targetX * 0.1);

                // Fallback se o modelo não tiver clip nativo
                if (!mixer) {
                    const flapScale = 1 + Math.sin(elapsedTime * 1.8) * 0.02;
                    modelGroup.scale.set(flapScale, flapScale, flapScale);
                }
            }

            // Rotação suave da poeira mágica / partículas
            particleSystem.rotation.y = elapsedTime * 0.1;
            particleSystem.rotation.x = Math.sin(elapsedTime * 0.3) * 0.05;

            // Inércia da câmera com o mouse
            targetX += (mouseX * 0.6 - targetX) * 0.05;
            targetY += (mouseY * 0.6 - targetY) * 0.05;

            camera.position.x = targetX * 0.7;
            camera.position.y = 0.2 + (targetY * 0.4);
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

        // 9. Cleanup Completo de Memória
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
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-400/30 to-emerald-400/20 blur-3xl animate-pulse" />
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className={`w-full h-full min-h-[380px] relative pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
        >
            {isLoadingModel && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 rounded-full bg-cyan-400/20 blur-2xl animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default Hero3DCanvas;
