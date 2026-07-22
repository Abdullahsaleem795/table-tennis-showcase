import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Paddle Component
const Paddle = (props) => {
  const group = useRef();

  // Reactive motion based on mouse
  useFrame((state) => {
    if (props.reducedMotion) return;
    const t = state.clock.getElapsedTime();
    // Subtle float and parallax
    const targetX = (state.pointer.x * Math.PI) / 6;
    const targetY = (state.pointer.y * Math.PI) / 6;
    
    // Damped lerp
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t) * 0.1, 0.05);
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Blade (Wood/Earthy) */}
      <Cylinder args={[1.5, 1.5, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#B8A88F" roughness={0.7} />
      </Cylinder>
      {/* Front Rubber (Terracotta) */}
      <Cylinder args={[1.45, 1.45, 0.12, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0.01]}>
        <meshStandardMaterial color="#A65E2E" roughness={0.6} />
      </Cylinder>
      {/* Back Rubber (Sage/Olive) */}
      <Cylinder args={[1.45, 1.45, 0.12, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, -0.01]}>
        <meshStandardMaterial color="#8A9A5B" roughness={0.6} />
      </Cylinder>
      {/* Handle */}
      <Cylinder args={[0.2, 0.25, 1.5, 16]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#6B5C4A" roughness={0.8} />
      </Cylinder>
    </group>
  );
};

// Ping Pong Ball
const Ball = (props) => {
  const mesh = useRef();

  useFrame((state) => {
    if (props.reducedMotion) return;
    const t = state.clock.getElapsedTime();
    // Subtle orbiting around the paddle
    mesh.current.position.x = Math.sin(t * 0.5) * 2;
    mesh.current.position.z = Math.cos(t * 0.5) * 2;
    mesh.current.position.y = Math.sin(t * 1.5) * 0.5;
  });

  return (
    <Sphere ref={mesh} args={[0.2, 32, 32]} {...props}>
      <meshStandardMaterial color="#F7F2E9" roughness={0.1} />
    </Sphere>
  );
};

const Scene = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      dpr={[1, 2]}
    >
      {/* Earthy Lighting */}
      <ambientLight intensity={0.4} color="#F7F2E9" />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#F0DAC4" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#8A9A5B" />
      <pointLight position={[0, 2, 2]} intensity={0.8} color="#A65E2E" />

      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={reducedMotion ? 0 : 0.5} floatIntensity={reducedMotion ? 0 : 0.5}>
        <Paddle reducedMotion={reducedMotion} position={[0, 0, 0]} rotation={[0.2, 0.4, 0.1]} />
        <Ball reducedMotion={reducedMotion} position={[2, 0, 1]} />
      </Float>
      
      {/* Soft environment lighting */}
      <Environment preset="sunset" />
    </Canvas>
  );
};

export default Scene;
