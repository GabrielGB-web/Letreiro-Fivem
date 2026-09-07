import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SignConfig, GeneratedMeshBounds, TimeOfDay } from '../types/fivem';
import {
  createLine3DMesh,
  createMountStructure,
  calculateMeshBounds,
} from '../utils/text3dEngine';
import { create3DImageEmblem } from '../utils/image3dEngine';
import {
  Maximize2,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Box,
  Eye,
  Layers,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ThreeSignCanvasProps {
  config: SignConfig;
  bounds: GeneratedMeshBounds;
  setBounds: (b: GeneratedMeshBounds) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  showWireframe: boolean;
  setShowWireframe: (v: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
}

export const ThreeSignCanvas: React.FC<ThreeSignCanvasProps> = ({
  config,
  bounds,
  setBounds,
  timeOfDay,
  setTimeOfDay,
  showWireframe,
  setShowWireframe,
  autoRotate,
  setAutoRotate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scene & Engine refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const signRootRef = useRef<THREE.Group | null>(null);
  const wireframeBoxRef = useRef<THREE.Box3Helper | null>(null);
  const collisionMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    directional: THREE.DirectionalLight;
    point1: THREE.PointLight;
    point2: THREE.PointLight;
  } | null>(null);

  // Camera interactive controls
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAnglesRef = useRef({ theta: 0.4, phi: 1.25, radius: 8.0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.8, 0));

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;

    const pointLight1 = new THREE.PointLight(0xf97316, 2, 10);
    pointLight1.position.set(-2, 1.5, 2);

    const pointLight2 = new THREE.PointLight(0xfb923c, 2, 10);
    pointLight2.position.set(2, 1.5, 2);

    scene.add(ambientLight);
    scene.add(dirLight);
    scene.add(pointLight1);
    scene.add(pointLight2);

    lightsRef.current = {
      ambient: ambientLight,
      directional: dirLight,
      point1: pointLight1,
      point2: pointLight2,
    };

    // 5. Floor & Grid (GTA V asphalt style)
    const floorGeom = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(30, 30, 0xf97316, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);
    gridHelperRef.current = grid;

    // 6. Root group for the sign
    const signGroup = new THREE.Group();
    scene.add(signGroup);
    signRootRef.current = signGroup;

    // Animation frame loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && signRootRef.current) {
        signRootRef.current.rotation.y += 0.4 * delta;
      }

      // Pulse neon intensity
      if (config.materialType === 'neon' && config.glowPulse && lightsRef.current) {
        const pulse = 1 + Math.sin(elapsedTime * 4) * 0.4;
        lightsRef.current.point1.intensity = config.glowIntensity * pulse;
        lightsRef.current.point2.intensity = config.glowIntensity * pulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update camera coordinates based on spherical coordinates
  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAnglesRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  }

  // Update environment & lighting when timeOfDay or materials change
  useEffect(() => {
    if (!sceneRef.current || !lightsRef.current) return;
    const { ambient, directional, point1, point2 } = lightsRef.current;

    if (timeOfDay === 'midnight') {
      sceneRef.current.background = new THREE.Color(0x060913);
      ambient.color.setHex(0x1e293b);
      ambient.intensity = 0.35;
      directional.color.setHex(0x64748b);
      directional.intensity = 0.4;
      directional.position.set(-5, 8, -5);
    } else if (timeOfDay === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x271318);
      ambient.color.setHex(0xf97316);
      ambient.intensity = 0.7;
      directional.color.setHex(0xfb923c);
      directional.intensity = 1.4;
      directional.position.set(12, 3, 8);
    } else {
      // Day
      sceneRef.current.background = new THREE.Color(0x0f172a);
      ambient.color.setHex(0xffffff);
      ambient.intensity = 0.9;
      directional.color.setHex(0xffffff);
      directional.intensity = 1.6;
      directional.position.set(6, 14, 8);
    }

    // Neon point lights color
    if (config.materialType === 'neon') {
      point1.color.set(config.glowColor);
      point2.color.set(config.primaryColor);
      point1.intensity = config.glowIntensity * 1.5;
      point2.intensity = config.glowIntensity * 1.5;
    } else {
      point1.intensity = 0.4;
      point2.intensity = 0.4;
    }
  }, [timeOfDay, config.materialType, config.glowColor, config.glowIntensity, config.primaryColor]);

  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);

  // Load image texture whenever config.imageConfig.dataUrl changes
  useEffect(() => {
    if (!config.imageConfig?.dataUrl) {
      setImageTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      config.imageConfig.dataUrl,
      (tex) => {
        tex.needsUpdate = true;
        setImageTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('Erro ao carregar textura da imagem', err);
      }
    );
  }, [config.imageConfig?.dataUrl]);

  // Rebuild 3D Sign Mesh whenever config changes
  useEffect(() => {
    if (!signRootRef.current || !sceneRef.current) return;
    const root = signRootRef.current;

    // Clear previous children
    while (root.children.length > 0) {
      const obj = root.children[0];
      root.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    const mode = config.mode || 'text';

    if (mode === 'image') {
      // Mode 1: 3D Image Emblem / Placa de Logo
      const emblem = create3DImageEmblem(config, imageTexture);
      emblem.group.position.y = (emblem.height / 2) + 0.1;
      root.add(emblem.group);
    } else if (mode === 'hybrid') {
      // Mode 2: Hybrid (3D Logo on top + 3D Text below)
      const emblem = create3DImageEmblem(config, imageTexture);
      emblem.group.position.y = 2.1;
      emblem.group.scale.set(0.85, 0.85, 0.85);
      root.add(emblem.group);

      const primary = createLine3DMesh(config.text || 'LETREIRO', config, false);
      primary.group.position.y = 0.65;
      root.add(primary.group);

      if (config.subText) {
        const secondary = createLine3DMesh(config.subText, config, true);
        secondary.group.position.y = 0.2;
        root.add(secondary.group);
      }
    } else {
      // Mode 3: Traditional 3D Text Sign
      const primary = createLine3DMesh(config.text || 'LETREIRO', config, false);
      primary.group.position.y = config.subText ? 1.4 : 0.8;
      root.add(primary.group);

      if (config.subText) {
        const secondary = createLine3DMesh(config.subText, config, true);
        secondary.group.position.y = 0.65;
        root.add(secondary.group);
      }
    }

    // 3. Compute Bounds for mounts & collision
    const newBounds = calculateMeshBounds(root);
    setBounds(newBounds);

    // 4. Build Mount Structure (poles, backplate, etc.)
    if (config.mountType !== 'none') {
      const mount = createMountStructure(config, newBounds);
      root.add(mount);
    }

    // 5. Update Collision Box (.ybn visualizer)
    if (wireframeBoxRef.current) {
      sceneRef.current.remove(wireframeBoxRef.current);
    }
    if (collisionMeshRef.current) {
      sceneRef.current.remove(collisionMeshRef.current);
    }

    if (showWireframe && config.hasCollision) {
      const finalBounds = calculateMeshBounds(root);
      const box = new THREE.Box3(
        new THREE.Vector3(finalBounds.minX, finalBounds.minY, finalBounds.minZ),
        new THREE.Vector3(finalBounds.maxX, finalBounds.maxY, finalBounds.maxZ)
      );

      const helper = new THREE.Box3Helper(box, new THREE.Color(0xf97316));
      wireframeBoxRef.current = helper;
      sceneRef.current.add(helper);

      // Translucent collision fill
      const collGeom = new THREE.BoxGeometry(
        finalBounds.width,
        finalBounds.height,
        finalBounds.depth
      );
      const collMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.2,
        wireframe: false,
      });
      const collMesh = new THREE.Mesh(collGeom, collMat);
      const cX = finalBounds.centerX ?? (finalBounds.minX + finalBounds.maxX) / 2;
      const cY = finalBounds.centerY ?? (finalBounds.minY + finalBounds.maxY) / 2;
      const cZ = finalBounds.centerZ ?? (finalBounds.minZ + finalBounds.maxZ) / 2;
      collMesh.position.set(cX, cY, cZ);
      collisionMeshRef.current = collMesh;
      sceneRef.current.add(collMesh);
    }
  }, [
    config.text,
    config.subText,
    config.fontStyle,
    config.scale,
    config.depth,
    config.bevel,
    config.letterSpacing,
    config.lineSpacing,
    config.curveRadius,
    config.materialType,
    config.primaryColor,
    config.secondaryColor,
    config.glowColor,
    config.glowIntensity,
    config.glowPulse,
    config.roughness,
    config.metalness,
    config.mountType,
    config.mountColor,
    config.mode,
    config.imageConfig,
    imageTexture,
    showWireframe,
    config.hasCollision,
  ]);

  // Mouse / Touch Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = true;
      if (autoRotate) setAutoRotate(false);
    } else if (e.button === 2) {
      isPanningRef.current = true;
    }
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (isDraggingRef.current) {
      cameraAnglesRef.current.theta -= deltaX * 0.008;
      cameraAnglesRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraAnglesRef.current.phi + deltaY * 0.008)
      );
      updateCameraPosition();
    } else if (isPanningRef.current) {
      cameraTargetRef.current.x -= deltaX * 0.005;
      cameraTargetRef.current.y += deltaY * 0.005;
      updateCameraPosition();
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAnglesRef.current.radius = Math.max(
      2.5,
      Math.min(25, cameraAnglesRef.current.radius + e.deltaY * 0.01)
    );
    updateCameraPosition();
  };

  const resetCamera = () => {
    cameraAnglesRef.current = { theta: 0.3, phi: 1.25, radius: 8.0 };
    cameraTargetRef.current.set(0, 0.8, 0);
    if (signRootRef.current) {
      signRootRef.current.rotation.y = 0;
    }
    updateCameraPosition();
  };

  const setViewAngle = (type: 'front' | 'isometric' | 'top' | 'side') => {
    if (signRootRef.current) signRootRef.current.rotation.y = 0;
    if (type === 'front') {
      cameraAnglesRef.current = { theta: 0, phi: Math.PI / 2, radius: 7.0 };
      cameraTargetRef.current.set(0, 0.8, 0);
    } else if (type === 'isometric') {
      cameraAnglesRef.current = { theta: 0.6, phi: 1.1, radius: 8.5 };
      cameraTargetRef.current.set(0, 0.8, 0);
    } else if (type === 'top') {
      cameraAnglesRef.current = { theta: 0, phi: 0.15, radius: 9.0 };
      cameraTargetRef.current.set(0, 0.8, 0);
    } else if (type === 'side') {
      cameraAnglesRef.current = { theta: Math.PI / 2, phi: Math.PI / 2, radius: 7.0 };
      cameraTargetRef.current.set(0, 0.8, 0);
    }
    updateCameraPosition();
  };

  return (
    <div
      ref={containerRef}
      id="fivem-viewport-container"
      className="relative w-full h-full min-h-[460px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none"
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        id="fivem-3d-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Left: Viewport Status & Dimensions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300 font-medium">
              {config.propName || 'prop_letreiro'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-orange-400 text-[11px]">
              {bounds.width}m × {bounds.height}m × {bounds.depth}m
            </span>
          </div>

          {showWireframe && (
            <div className="bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-700/60 text-[11px] font-mono text-emerald-400 flex items-center gap-1 shadow-md">
              <Box className="w-3.5 h-3.5" />
              <span>.YBN Colisão Ativa</span>
            </div>
          )}
        </div>

        {/* Right: Lighting & View Helpers */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800/80 shadow-lg">
          {/* Lighting Mode */}
          <button
            id="btn-lighting-midnight"
            onClick={() => setTimeOfDay('midnight')}
            title="Modo Noite / Neon FiveM"
            className={`p-1.5 rounded text-xs transition-colors ${
              timeOfDay === 'midnight'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            id="btn-lighting-sunset"
            onClick={() => setTimeOfDay('sunset')}
            title="Modo Pôr do Sol (Golden Hour)"
            className={`p-1.5 rounded text-xs transition-colors ${
              timeOfDay === 'sunset'
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            id="btn-lighting-day"
            onClick={() => setTimeOfDay('day')}
            title="Modo Dia"
            className={`p-1.5 rounded text-xs transition-colors ${
              timeOfDay === 'day'
                ? 'bg-amber-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          {/* Wireframe Toggle */}
          <button
            id="btn-toggle-wireframe"
            onClick={() => setShowWireframe(!showWireframe)}
            title="Exibir Colisão .YBN (Hitbox)"
            className={`p-1.5 rounded text-xs transition-colors ${
              showWireframe
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Auto Rotate Toggle */}
          <button
            id="btn-toggle-autorotate"
            onClick={() => setAutoRotate(!autoRotate)}
            title="Rotação Automática 360°"
            className={`p-1.5 rounded text-xs transition-colors ${
              autoRotate
                ? 'bg-orange-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            id="btn-reset-camera"
            onClick={resetCamera}
            title="Resetar Câmera"
            className="p-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Angles & Camera Presets */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Camera Angles Quick Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewAngle('front')}
            className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium"
          >
            Frente
          </button>
          <button
            onClick={() => setViewAngle('isometric')}
            className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium"
          >
            3D Isométrica
          </button>
          <button
            onClick={() => setViewAngle('side')}
            className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium"
          >
            Perfil
          </button>
          <button
            onClick={() => setViewAngle('top')}
            className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium"
          >
            Superior
          </button>
        </div>

        {/* Interaction hints */}
        <div className="pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 hidden sm:flex items-center gap-2">
          <span>🖱️ Clique e arraste para girar</span>
          <span>•</span>
          <span>Scroll: Zoom</span>
          <span>•</span>
          <span>Botão direito: Mover</span>
        </div>
      </div>
    </div>
  );
};
