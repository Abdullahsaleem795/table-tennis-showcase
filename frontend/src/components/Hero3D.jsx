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
/*  Oval shape builder                                                 */
/* ------------------------------------------------------------------ */
const useOvalShape = (rx, ry) =>
  useMemo(() => {
    const s = new THREE.Shape();
    const segs = 64;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
    }
    s.closePath();
    return s;
  }, [rx, ry]);

/* ------------------------------------------------------------------ */
/*  Paddle – Butterfly professional racket                             */
/*                                                                     */
/*  LAYER STACK (front → back, along LOCAL +Z):                        */
/*    +Z  ← FRONT (Red rubber)   z=0.07 .. 0.12                       */
/*         ← BLADE (Wood)        z=0.00 .. 0.07                       */
/*    -Z  ← BACK  (Black rubber) z=-0.05 .. 0.00                      */
/*                                                                     */
/*  The paddle group is then rotated so the red face points             */
/*  toward the camera.                                                 */
/* ------------------------------------------------------------------ */
const Paddle = ({ reducedMotion, ...props }) => {
  const group = useRef();
  const normalMap = useRubberNormalMap();

  const bladeShape = useOvalShape(1.42, 1.50);
  const rubberShape = useOvalShape(1.38, 1.46);

  // Cursor tracking with inertia
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
      {/* ===== THE BLADE HEAD ===== */}
      <group position={[0, 0.5, 0]}>

        {/* BLADE CORE — Wood (honey with walnut center) */}
        {/* Sits from z=0 to z=0.07 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <extrudeGeometry args={[bladeShape, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 }]} />
          <meshPhysicalMaterial color="#d4a762" roughness={0.65} metalness={0.05} />
        </mesh>
        {/* Inner walnut stripe */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.015]}>
          <extrudeGeometry args={[bladeShape, { depth: 0.04, bevelEnabled: false }]} />
          <meshPhysicalMaterial color="#6d4222" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* FRONT RUBBER — RED */}
        {/* Sits from z=0.07 to z=0.12 (on top of the blade, facing camera) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.07]}>
          <extrudeGeometry args={[rubberShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 }]} />
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

        {/* BACK RUBBER — BLACK */}
        {/* Sits from z=-0.05 to z=0.00 (behind the blade, facing away) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.05]}>
          <extrudeGeometry args={[rubberShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 }]} />
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

        {/* EDGE TAPE — thin black band visible at the rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.052]}>
          <extrudeGeometry args={[bladeShape, { depth: 0.174, bevelEnabled: false }]} />
          <meshPhysicalMaterial
            color="#111111"
            roughness={0.8}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* ===== HANDLE ===== */}
      {/* Flared walnut Butterfly-style */}

      {/* Upper flare (blade → handle transition) */}
      <mesh position={[0, -0.30, 0.035]}>
        <cylinderGeometry args={[0.30, 0.22, 0.45, 24]} />
        <meshPhysicalMaterial color="#a07850" roughness={0.72} metalness={0.05} />
      </mesh>

      {/* Main shaft */}
      <mesh position={[0, -0.90, 0.035]}>
        <cylinderGeometry args={[0.22, 0.18, 1.2, 24]} />
        <meshPhysicalMaterial color="#b08860" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Dark walnut accent stripe */}
      <mesh position={[0, -0.80, 0.035]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.06, 1.3, 0.46]} />
        <meshPhysicalMaterial color="#5a3a1e" roughness={0.85} transparent opacity={0.5} />
      </mesh>

      {/* Butt cap */}
      <mesh position={[0, -1.48, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.05, 24]} />
        <meshPhysicalMaterial color="#2a2a2a" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/*  Ball — White 40mm                                                  */
/* ------------------------------------------------------------------ */
const Ball = ({ reducedMotion, ...props }) => {
  const mesh = useRef();
  const spinRef = useRef(0);

  useFrame((state) => {
    if (reducedMotion || !mesh.current) return;
    const t = state.clock.getElapsedTime();

    // Lissajous-like 3D orbit
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
        roughness={0.15}
        metalness={0.0}
        clearcoat={0.3}
        clearcoatRoughness={0.3}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/*  Scroll Parallax                                                    */
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
/*  Scene                                                              */
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
      {/* ---- Studio Lighting ---- */}

      {/* Warm ambient */}
      <ambientLight intensity={0.8} color="#fff8f0" />

      {/* Key — warm from upper-right-front (strongly lights the red face) */}
      <spotLight
        position={[5, 8, 10]}
        intensity={3.0}
        angle={0.5}
        penumbra={1}
        color="#fff5e0"
        castShadow
      />

      {/* Fill — cooler from left */}
      <pointLight position={[-6, 3, 4]} intensity={1.2} color="#e0ecff" />

      {/* Rim — reveals back (black rubber) side */}
      <spotLight
        position={[-3, 5, -8]}
        intensity={2.5}
        angle={0.7}
        penumbra={0.5}
        color="#ffffff"
      />

      {/* Bottom fill */}
      <pointLight position={[0, -5, 3]} intensity={0.8} color="#ffe8d0" />

      {/* Front-face dedicated light */}
      <pointLight position={[2, 2, 8]} intensity={1.0} color="#ffffff" />

      <ScrollParallax reducedMotion={reducedMotion}>
        <Float
          speed={reducedMotion ? 0 : 1.2}
          rotationIntensity={reducedMotion ? 0 : 0.2}
          floatIntensity={reducedMotion ? 0 : 0.3}
        >
          {/* Racket — tilted to show the red face prominently */}
          {/* The paddle's local +Z = front (red rubber). */}
          {/* rotation: tilt slightly back, turn slightly left, small roll */}
          <Paddle
            reducedMotion={reducedMotion}
            position={[0, -0.2, 0]}
            rotation={[-0.3, 0.4, -0.1]}
          />

          {/* Ball */}
          <Ball reducedMotion={reducedMotion} position={[2, 0.5, 1]} />
        </Float>
      </ScrollParallax>

      {/* Soft contact shadow */}
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
