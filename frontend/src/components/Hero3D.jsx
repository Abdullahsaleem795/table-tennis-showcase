import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Procedural pimple normal-map (rubber texture)                      */
/* ------------------------------------------------------------------ */
const useRubberNormalMap = () =>
  useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, 0, size, size);
    const spacing = 5;
    for (let x = spacing / 2; x < size; x += spacing) {
      for (let y = spacing / 2; y < size; y += spacing) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 2);
        g.addColorStop(0, 'rgb(155,155,255)');
        g.addColorStop(1, 'rgb(128,128,255)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);

/* ------------------------------------------------------------------ */
/*  Paddle – Butterfly-style professional racket                       */
/*  Based on: Animation.mp4 reference frames                          */
/*    • Deep red front rubber with pimpled texture                     */
/*    • Dark black back rubber with same texture                       */
/*    • Multi-ply wood blade (honey + walnut stripe)                   */
/*    • Flared walnut handle                                           */
/* ------------------------------------------------------------------ */
const Paddle = ({ reducedMotion, ...props }) => {
  const group = useRef();
  const normalMap = useRubberNormalMap();

  // Blade shape – slightly taller oval (professional TT blade proportions)
  const bladeShape = useMemo(() => {
    const s = new THREE.Shape();
    const rx = 1.42, ry = 1.50, segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  // Rubber shape – slightly inset from blade edge
  const rubberShape = useMemo(() => {
    const s = new THREE.Shape();
    const rx = 1.36, ry = 1.44, segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  // Extrude configs
  const bladeExt = useMemo(() => ({
    depth: 0.12, bevelEnabled: true, bevelThickness: 0.015,
    bevelSize: 0.015, bevelSegments: 3
  }), []);
  const rubberExt = useMemo(() => ({
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.005,
    bevelSize: 0.005, bevelSegments: 2
  }), []);

  // Cursor tracking
  useFrame((state) => {
    if (reducedMotion || !group.current) return;
    const tx = (state.pointer.x * Math.PI) / 5;
    const ty = (state.pointer.y * Math.PI) / 5;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -ty, 0.04);
    const t = state.clock.getElapsedTime();
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y, Math.sin(t * 1.2) * 0.08, 0.04
    );
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* ===== BLADE — outer ply (light honey wood) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, -0.06]}>
        <extrudeGeometry args={[bladeShape, bladeExt]} />
        <meshPhysicalMaterial color="#d4a762" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* ===== BLADE — inner ply (dark walnut stripe) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, -0.03]}>
        <extrudeGeometry args={[bladeShape, { depth: 0.06, bevelEnabled: false }]} />
        <meshPhysicalMaterial color="#6d4222" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* ===== FRONT RUBBER (Red) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0.06]}>
        <extrudeGeometry args={[rubberShape, rubberExt]} />
        <meshPhysicalMaterial
          color="#c62828"
          roughness={0.72}
          metalness={0.02}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          clearcoat={0.12}
          clearcoatRoughness={0.9}
        />
      </mesh>

      {/* ===== BACK RUBBER (Black) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, -0.12]}>
        <extrudeGeometry args={[rubberShape, rubberExt]} />
        <meshPhysicalMaterial
          color="#222222"
          roughness={0.62}
          metalness={0.08}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.4, 0.4)}
          clearcoat={0.15}
          clearcoatRoughness={0.85}
        />
      </mesh>

      {/* ===== EDGE TAPE (thin black band around blade) ===== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, -0.065]}>
        <extrudeGeometry args={[bladeShape, { depth: 0.18, bevelEnabled: false }]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.8}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ===== HANDLE — flared walnut (Butterfly style) ===== */}
      {/* Upper flare (where blade meets handle) */}
      <mesh position={[0, -0.35, -0.03]}>
        <cylinderGeometry args={[0.34, 0.24, 0.5, 24]} />
        <meshPhysicalMaterial color="#8b6340" roughness={0.72} metalness={0.05} />
      </mesh>

      {/* Main shaft */}
      <mesh position={[0, -1.0, -0.03]}>
        <cylinderGeometry args={[0.24, 0.20, 1.6, 24]} />
        <meshPhysicalMaterial color="#9c7650" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Dark walnut accent stripe */}
      <mesh position={[0, -1.0, -0.03]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.08, 1.5, 0.5]} />
        <meshPhysicalMaterial
          color="#5a3a1e"
          roughness={0.85}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Butt cap (end of handle) */}
      <mesh position={[0, -1.78, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.06, 24]} />
        <meshPhysicalMaterial color="#2a2a2a" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/*  Ball — White 40mm Butterfly ball                                   */
/* ------------------------------------------------------------------ */
const Ball = ({ reducedMotion, ...props }) => {
  const mesh = useRef();
  const spinRef = useRef(0);

  useFrame((state) => {
    if (reducedMotion || !mesh.current) return;
    const t = state.clock.getElapsedTime();

    // Lissajous-like trajectory (avoids simple circular orbit)
    mesh.current.position.x = Math.sin(t * 0.8) * 2.2 + Math.sin(t * 1.7) * 0.5;
    mesh.current.position.y = Math.sin(t * 1.3) * 1.0 + 0.5;
    mesh.current.position.z = Math.cos(t * 0.8) * 1.8 + Math.cos(t * 2.1) * 0.3;

    // Spin
    spinRef.current += 0.05;
    mesh.current.rotation.x = spinRef.current * 1.3;
    mesh.current.rotation.y = spinRef.current * 0.7;
  });

  return (
    <mesh ref={mesh} {...props}>
      <sphereGeometry args={[0.22, 64, 64]} />
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.18}
        metalness={0.02}
        clearcoat={0.2}
        clearcoatRoughness={0.4}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/*  Scroll Parallax wrapper                                            */
/* ------------------------------------------------------------------ */
const ScrollParallax = ({ children, reducedMotion }) => {
  const group = useRef();

  useEffect(() => {
    if (reducedMotion) return;
    const handleScroll = () => {
      if (!group.current) return;
      const progress = Math.min(window.scrollY / 800, 1);
      group.current.position.y = -progress * 1.2;
      group.current.position.z = progress * 1.5;
      group.current.rotation.x = progress * 0.3;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  return <group ref={group}>{children}</group>;
};

/* ------------------------------------------------------------------ */
/*  Main Scene                                                         */
/* ------------------------------------------------------------------ */
const Scene = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 42 }}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* ---- Studio Lighting (warm dramatic like the video) ---- */}

      {/* Warm ambient base */}
      <ambientLight intensity={0.7} color="#fff8f0" />

      {/* Key light – warm from upper-right-front */}
      <spotLight
        position={[5, 8, 8]}
        intensity={2.5}
        angle={0.5}
        penumbra={1}
        color="#fff5e0"
        castShadow
      />

      {/* Fill light – cooler, from left */}
      <pointLight position={[-6, 3, 4]} intensity={1.0} color="#e0ecff" />

      {/* Rim light – reveals back (black rubber) side */}
      <spotLight
        position={[-3, 5, -8]}
        intensity={2.0}
        angle={0.7}
        penumbra={0.5}
        color="#ffffff"
      />

      {/* Bottom fill – prevents handle from going too dark */}
      <pointLight position={[0, -5, 3]} intensity={0.6} color="#ffe8d0" />

      {/* Front face light – ensures red rubber face is well-lit */}
      <pointLight position={[2, 2, 6]} intensity={0.8} color="#ffffff" />

      <ScrollParallax reducedMotion={reducedMotion}>
        <Float
          speed={reducedMotion ? 0 : 1.2}
          rotationIntensity={reducedMotion ? 0 : 0.2}
          floatIntensity={reducedMotion ? 0 : 0.3}
        >
          {/* Racket – angled to prominently show the red face (matching video) */}
          <Paddle
            reducedMotion={reducedMotion}
            position={[0, -0.2, 0]}
            rotation={[0.3, 0.5, -0.15]}
          />

          {/* Orbiting ball */}
          <Ball reducedMotion={reducedMotion} position={[2, 0.5, 1]} />
        </Float>
      </ScrollParallax>

      {/* Soft contact shadow beneath the racket */}
      <ContactShadows
        position={[0, -2.8, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={4}
        color="#3a2e22"
      />
    </Canvas>
  );
};

export default Scene;
