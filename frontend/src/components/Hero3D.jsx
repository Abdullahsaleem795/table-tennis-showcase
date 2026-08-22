import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Helper – build a "paddle-head" shape (slightly-tall oval)          */
/* ------------------------------------------------------------------ */
const usePaddleShape = () =>
  useMemo(() => {
    const shape = new THREE.Shape();
    // Professional TT blade is roughly 150mm wide × 157mm tall (nearly circular with very slight vertical elongation)
    const rx = 1.45; // half-width
    const ry = 1.52; // half-height (slightly taller than wide)
    const segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      shape.moveTo(0, 0); // unused – overwritten below
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

/* ------------------------------------------------------------------ */
/*  Paddle (Butterfly-style professional racket)                       */
/* ------------------------------------------------------------------ */
const Paddle = (props) => {
  const group = useRef();
  const paddleShape = usePaddleShape();

  // Extrusion settings for thin layers
  const bladeExtrude = useMemo(() => ({ depth: 0.12, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 4 }), []);
  const rubberExtrude = useMemo(() => ({ depth: 0.06, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 }), []);

  // Rubber-surface normal map (procedural pimple texture)
  const rubberNormalMap = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Base neutral normal (128,128,255)
    ctx.fillStyle = 'rgb(128,128,255)';
    ctx.fillRect(0, 0, size, size);
    // Pimple grid
    const spacing = 6;
    const r = 2;
    for (let x = spacing; x < size; x += spacing) {
      for (let y = spacing; y < size; y += spacing) {
        // Small highlight bump
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgb(160,160,255)');
        grad.addColorStop(1, 'rgb(128,128,255)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  // Cursor tracking with inertia
  useFrame((state) => {
    if (props.reducedMotion) return;
    const targetX = (state.pointer.x * Math.PI) / 5;
    const targetY = (state.pointer.y * Math.PI) / 5;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.04);
    const t = state.clock.getElapsedTime();
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t * 1.2) * 0.08, 0.04);
  });

  // Rubber shape slightly smaller than blade
  const rubberShape = useMemo(() => {
    const s = new THREE.Shape();
    const rx = 1.40;
    const ry = 1.47;
    const segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, []);

  return (
    <group ref={group} {...props} dispose={null}>
      {/* -------- BLADE (multi-ply wood) -------- */}
      <group position={[0, 0.5, 0]}>
        {/* Outer ply – lighter */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <extrudeGeometry args={[paddleShape, bladeExtrude]} />
          <meshPhysicalMaterial
            color="#d4a96a"
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
        {/* Inner stripe – darker walnut */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.03]}>
          <extrudeGeometry args={[paddleShape, { depth: 0.04, bevelEnabled: false }]} />
          <meshPhysicalMaterial
            color="#7a5230"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* -------- FRONT RUBBER (Red – Butterfly-style deep matte red) -------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0.13]}>
        <extrudeGeometry args={[rubberShape, rubberExtrude]} />
        <meshPhysicalMaterial
          color="#c42020"
          roughness={0.75}
          metalness={0.02}
          normalMap={rubberNormalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          clearcoat={0.15}
          clearcoatRoughness={0.9}
        />
      </mesh>

      {/* -------- BACK RUBBER (Black – Butterfly-style textured black) -------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, -0.07]}>
        <extrudeGeometry args={[rubberShape, rubberExtrude]} />
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.65}
          metalness={0.08}
          normalMap={rubberNormalMap}
          normalScale={new THREE.Vector2(0.35, 0.35)}
          clearcoat={0.2}
          clearcoatRoughness={0.85}
        />
      </mesh>

      {/* -------- HANDLE (Flared walnut – Butterfly style) -------- */}
      {/* Main shaft – tapers from blade to butt */}
      <mesh position={[0, -1.0, 0.03]}>
        <cylinderGeometry args={[0.22, 0.18, 1.8, 24]} />
        <meshPhysicalMaterial
          color="#8b6340"
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      {/* Flared grip portion */}
      <mesh position={[0, -0.45, 0.03]}>
        <cylinderGeometry args={[0.32, 0.22, 0.6, 24]} />
        <meshPhysicalMaterial
          color="#7a5230"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>
      {/* Dark accent stripe on handle */}
      <mesh position={[0, -1.0, 0.03]}>
        <cylinderGeometry args={[0.225, 0.185, 1.82, 24]} />
        <meshPhysicalMaterial
          color="#4a3220"
          roughness={0.9}
          metalness={0.02}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Butt cap */}
      <mesh position={[0, -1.88, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.04, 24]} />
        <meshPhysicalMaterial
          color="#222222"
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* -------- Edge tape (thin black band between rubber and blade edge) -------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <extrudeGeometry args={[paddleShape, { depth: 0.25, bevelEnabled: false }]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.0}  
          /* This mesh serves as edge outline – we make it invisible and rely on the actual geometry edges. 
             If we want visible edge tape, set opacity to ~0.6 and make depth slightly larger than blade. */
        />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/*  Ball (White 40mm Butterfly ball)                                    */
/* ------------------------------------------------------------------ */
const Ball = (props) => {
  const mesh = useRef();
  // Store current velocity for spin
  const spinRef = useRef(0);

  useFrame((state) => {
    if (props.reducedMotion) return;
    const t = state.clock.getElapsedTime();

    // Lissajous-like 3D orbit (avoids simple circular path, feels like a rally)
    const px = Math.sin(t * 0.8) * 2.2 + Math.sin(t * 1.6) * 0.4;
    const py = Math.sin(t * 1.2) * 1.1 + 0.5;
    const pz = Math.cos(t * 0.8) * 1.8 + Math.cos(t * 2.0) * 0.3;

    mesh.current.position.x = px;
    mesh.current.position.y = py;
    mesh.current.position.z = pz;

    // Realistic spin
    spinRef.current += 0.04;
    mesh.current.rotation.x = spinRef.current * 1.3;
    mesh.current.rotation.y = spinRef.current * 0.7;
  });

  return (
    <mesh ref={mesh} {...props}>
      <sphereGeometry args={[0.2, 64, 64]} />
      <meshPhysicalMaterial
        color="#f8f4ef"
        roughness={0.25}
        metalness={0.05}
        clearcoat={0.15}
        clearcoatRoughness={0.6}
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
      camera={{ position: [0, 0.3, 6.5], fov: 40 }}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* ---- Studio Lighting (matching the video's dramatic, warm look) ---- */}

      {/* Ambient base – warm tone */}
      <ambientLight intensity={0.5} color="#fff8f0" />

      {/* Key light – warm directional from upper-right (like the video) */}
      <spotLight
        position={[6, 8, 6]}
        intensity={2.0}
        angle={0.5}
        penumbra={1}
        color="#fff5e6"
        castShadow
      />

      {/* Fill light – cool, softer from the left */}
      <pointLight position={[-6, 2, 4]} intensity={0.7} color="#d8e8f8" />

      {/* Rim / back light – reveals black rubber side detail */}
      <spotLight
        position={[-2, 6, -8]}
        intensity={1.8}
        angle={0.7}
        penumbra={0.6}
        color="#ffffff"
      />

      {/* Subtle bottom fill so the handle isn't too dark */}
      <pointLight position={[0, -4, 2]} intensity={0.4} color="#ffeedd" />

      <ScrollParallax reducedMotion={reducedMotion}>
        <Float
          speed={reducedMotion ? 0 : 1.2}
          rotationIntensity={reducedMotion ? 0 : 0.25}
          floatIntensity={reducedMotion ? 0 : 0.35}
        >
          {/* Racket – tilted similar to the video's resting angle */}
          <Paddle
            reducedMotion={reducedMotion}
            position={[0, 0, 0]}
            rotation={[0.25, -0.35, 0.15]}
          />

          {/* Orbiting Ball */}
          <Ball reducedMotion={reducedMotion} position={[2, 0.5, 1]} />
        </Float>
      </ScrollParallax>

      {/* Soft localized shadow under the racket */}
      <ContactShadows
        position={[0, -2.8, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        far={4}
        color="#3a2e22"
      />
    </Canvas>
  );
};

export default Scene;
