'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface HeatDistrictData {
  id: string;
  name: string;
  zone: string;
  anomaly: number;
  heatIndex: number;
  activePockets: number;
  sensors: number;
  canopyPct: number;
  imperviousPct: number;
  density: number; // Building density 0-1
  coordinates: [number, number]; // [lon, lat]
}

export const CHENNAI_DISTRICTS_3D: HeatDistrictData[] = [
  {
    id: 'royapuram',
    name: 'Royapuram • Zone 05',
    zone: 'Zone V (Royapuram & George Town)',
    anomaly: 4.8,
    heatIndex: 9.1,
    activePockets: 64,
    sensors: 98,
    canopyPct: 1.4,
    imperviousPct: 96,
    density: 0.88,
    coordinates: [80.285, 13.095],
  },
  {
    id: 'tnagar',
    name: 'T. Nagar • Zone 10',
    zone: 'Zone X (Kodambakkam / Pondy Bazaar)',
    anomaly: 4.2,
    heatIndex: 8.7,
    activePockets: 52,
    sensors: 89,
    canopyPct: 2.3,
    imperviousPct: 93,
    density: 0.82,
    coordinates: [80.233, 13.041],
  },
  {
    id: 'teynampet',
    name: 'Teynampet • Zone 09',
    zone: 'Zone IX (Anna Salai Commercial)',
    anomaly: 2.8,
    heatIndex: 7.2,
    activePockets: 38,
    sensors: 76,
    canopyPct: 4.1,
    imperviousPct: 84,
    density: 0.74,
    coordinates: [80.245, 13.040],
  },
  {
    id: 'manali',
    name: 'Manali Petrochem • Zone 02',
    zone: 'Zone II (Industrial Complex)',
    anomaly: 5.5,
    heatIndex: 9.8,
    activePockets: 78,
    sensors: 64,
    canopyPct: 3.2,
    imperviousPct: 91,
    density: 0.79,
    coordinates: [80.260, 13.165],
  },
  {
    id: 'guindy',
    name: 'Guindy Industrial • Zone 13',
    zone: 'Zone XIII (Guindy Estate & Adyar)',
    anomaly: 3.6,
    heatIndex: 7.8,
    activePockets: 41,
    sensors: 82,
    canopyPct: 8.4,
    imperviousPct: 82,
    density: 0.68,
    coordinates: [80.212, 13.008],
  },
  {
    id: 'annanagar',
    name: 'Anna Nagar • Zone 08',
    zone: 'Zone VIII (Central Residential)',
    anomaly: 2.1,
    heatIndex: 6.3,
    activePockets: 22,
    sensors: 71,
    canopyPct: 14.2,
    imperviousPct: 71,
    density: 0.58,
    coordinates: [80.215, 13.085],
  },
  {
    id: 'adyar',
    name: 'Adyar Coastal • Zone 13',
    zone: 'Zone XIII (Estuary & Besant Nagar)',
    anomaly: 1.2,
    heatIndex: 4.8,
    activePockets: 14,
    sensors: 68,
    canopyPct: 18.6,
    imperviousPct: 62,
    density: 0.45,
    coordinates: [80.255, 13.006],
  },
];

interface Props {
  selectedDistrictId?: string;
  onSelectDistrict?: (district: HeatDistrictData) => void;
  scenarioMode?: 'CURRENT' | 'PROJECTED';
  className?: string;
}

export const UrbanHeatField3D: React.FC<Props> = ({
  selectedDistrictId,
  onSelectDistrict,
  scenarioMode = 'CURRENT',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<HeatDistrictData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Store references for cleanup and animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const buildingMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !webglSupported) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 320;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0b);
    scene.fog = new THREE.FogExp2(0x090a0b, 0.018);
    sceneRef.current = scene;

    // 2. Camera: Isometric Perspective
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(22, 26, 26);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false; // Keep high performance
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Subtle Operational Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(15, 30, 20);
    scene.add(dirLight);

    // 5. Ground Grid Plane
    const groundGeo = new THREE.PlaneGeometry(36, 36, 36, 36);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x141719,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    scene.add(ground);
    groundMeshRef.current = ground;

    // 6. Procedural Urban City Blocks (Instanced for 60fps performance)
    const gridSize = 14;
    const totalBuildings = gridSize * gridSize;
    const boxGeo = new THREE.BoxGeometry(1.2, 1, 1.2);
    
    // Thermal color spectrum shader material or instance colors
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.2,
      vertexColors: true,
    });

    const instancedMesh = new THREE.InstancedMesh(boxGeo, material, totalBuildings);
    buildingMeshRef.current = instancedMesh;

    const dummy = new THREE.Object3D();
    const colors = new Float32Array(totalBuildings * 3);
    const districtLookup: Record<number, HeatDistrictData> = {};

    let index = 0;
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        const posX = x * 1.8 + (Math.random() * 0.2 - 0.1);
        const posZ = z * 1.8 + (Math.random() * 0.2 - 0.1);

        // Map to nearest district data
        const districtIdx = Math.min(
          CHENNAI_DISTRICTS_3D.length - 1,
          Math.floor((Math.atan2(z, x) + Math.PI) / (Math.PI * 2) * CHENNAI_DISTRICTS_3D.length)
        );
        const district = CHENNAI_DISTRICTS_3D[districtIdx];
        districtLookup[index] = district;

        // Anomaly scale: Scenario mode modulates heat height & color
        const anomaly = scenarioMode === 'PROJECTED' ? Math.max(0.5, district.anomaly - 1.4) : district.anomaly;
        const heatNorm = Math.min(1.0, Math.max(0.05, anomaly / 5.5));

        // Building height proportional to density + heat intensity
        const baseHeight = 1.0 + district.density * 5.0 + Math.random() * 2.0;
        const finalHeight = baseHeight * (0.8 + heatNorm * 0.6);

        dummy.position.set(posX, finalHeight / 2, posZ);
        dummy.scale.set(1, finalHeight, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);

        // Semantic Colors: Warm spectrum for heat, Cool for environmental
        let color = new THREE.Color();
        if (heatNorm > 0.70) {
          color.setHex(0xff453a); // Critical
        } else if (heatNorm > 0.40) {
          color.setHex(0xf28b62); // Thermal
        } else {
          color.setHex(0x43d6b5); // Cool
        }
        
        // Slightly dim unselected districts
        if (selectedDistrictId && district.id !== selectedDistrictId) {
          color.multiplyScalar(0.5);
        }

        color.toArray(colors, index * 3);
        index++;
      }
    }

    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    scene.add(instancedMesh);

    // 7. Raycaster for District Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(instancedMesh);

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const id = intersects[0].instanceId;
        const d = districtLookup[id];
        if (d) setHoveredDistrict(d);
      } else {
        setHoveredDistrict(null);
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(instancedMesh);

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const id = intersects[0].instanceId;
        const d = districtLookup[id];
        if (d && onSelectDistrict) {
          onSelectDistrict(d);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // 8. Orbit Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.4, Math.min(0.6, targetRotationX));
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.multiplyScalar(e.deltaY > 0 ? 1.05 : 0.95);
      camera.position.clampLength(14, 55);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMoveDrag);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // 9. Render Loop (Rotates gently when idle)
    let angle = 0;
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isDragging) {
        angle += 0.002;
        scene.rotation.y = angle + targetRotationY;
        scene.rotation.x = targetRotationX;
      } else {
        scene.rotation.y = targetRotationY;
        scene.rotation.x = targetRotationX;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMoveDrag);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      renderer.dispose();
      boxGeo.dispose();
      groundGeo.dispose();
      material.dispose();
      groundMat.dispose();
    };
  }, [webglSupported, scenarioMode, selectedDistrictId, onSelectDistrict]);

  if (!webglSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 bg-[#101214] border border-white/10 rounded-xl text-center font-mono text-xs text-[#8B9299] ${className}`}>
        <span>3D WebGL Visualization unavailable.</span>
        <span className="text-[#5F666D] mt-1">Falling back to 2D vector thermal matrix.</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={`relative w-full h-full min-h-[300px] overflow-hidden bg-[#090A0B] rounded-xl border border-white/10 select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* 3D Scene Controls HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-[#101214]/90 border border-white/10 font-mono text-[11px] text-[#F3F4F6] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F28B62]" />
          3D URBAN HEAT FIELD
        </span>
        <span className="px-2 py-0.5 rounded bg-[#141719]/90 border border-white/5 font-mono text-[10px] text-[#8B9299]">
          {scenarioMode}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10 font-mono text-[10px] text-[#5F666D] bg-[#101214]/80 px-2 py-0.5 rounded border border-white/5 pointer-events-none">
        DRAG TO ORBIT • SCROLL TO ZOOM
      </div>

      {/* District Hover Analytical Tooltip */}
      {hoveredDistrict && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 p-3 rounded-lg bg-[#101214]/95 border border-white/15 shadow-xl font-mono text-xs text-[#F3F4F6] min-w-[210px] backdrop-blur-md transition-all duration-75"
          style={{ top: `${tooltipPos.y}px`, left: `${tooltipPos.x}px` }}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
            <span className="font-bold text-[#F3F4F6] uppercase tracking-wider text-[11px]">
              {hoveredDistrict.name.split('•')[0]}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                hoveredDistrict.anomaly >= 4.0 ? 'text-[#FF453A] bg-[#FF453A]/15' : 'text-[#F28B62] bg-[#F28B62]/15'
              }`}
            >
              +{hoveredDistrict.anomaly.toFixed(1)}°C
            </span>
          </div>
          <div className="flex justify-between text-[#8B9299] text-[11px] py-0.5">
            <span>Heat Index:</span>
            <span className="text-[#F3F4F6] font-bold">{hoveredDistrict.heatIndex} / 10</span>
          </div>
          <div className="flex justify-between text-[#8B9299] text-[11px] py-0.5">
            <span>Active Pockets:</span>
            <span className="text-[#FF6B45] font-bold">{hoveredDistrict.activePockets}</span>
          </div>
          <div className="flex justify-between text-[#8B9299] text-[11px] py-0.5">
            <span>Sensor Density:</span>
            <span className="text-[#43D6B5] font-bold">{hoveredDistrict.sensors} nodes</span>
          </div>
          <div className="flex justify-between text-[#8B9299] text-[11px] py-0.5">
            <span>Building Mass:</span>
            <span className="text-[#F3F4F6] font-bold">{(hoveredDistrict.density * 100).toFixed(0)}%</span>
          </div>
          <div className="mt-2 pt-1 border-t border-white/10 text-[9px] text-[#5F666D] text-center">
            Click to focus district in command map
          </div>
        </div>
      )}
    </div>
  );
};
