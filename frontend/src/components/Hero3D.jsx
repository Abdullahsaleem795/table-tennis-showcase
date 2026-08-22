import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Cylinder, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Premium Paddle Component
const Paddle = (props) => {
  const group = useRef();
  
  // Interactive pointer tracking
  useFrame((state) => {
    if (props.reducedMotion) return;
    
    // Calculate target rotation based on cursor
    // Subtle tilt: max rotation around X and Y
    const targetX = (state.pointer.x * Math.PI) / 4; 
    const targetY = (state.pointer.y * Math.PI) / 4;
    
    // Smooth interpolation (inertia)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.05);
    
    // Subtle floating breath effect
    const t = state.clock.getElapsedTime();
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.sin(t * 1.5) * 0.1, 0.05);
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Blade Edge (Wood) */}
      <Cylinder args={[1.5, 1.5, 0.15, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <meshPhysicalMaterial 
          color="#c8a57a" 
          roughness={0.7} 
          metalness={0.1} 
        />
      </Cylinder>
      
      {/* Front Rubber (Premium Red) */}
      <Cylinder args={[1.47, 1.47, 0.17, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0.01]}>
        <meshPhysicalMaterial 
          color="#ba2b2b" 
          roughness={0.6} 
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.8}
        />
      </Cylinder>
      
      {/* Back Rubber (Premium Black) */}
      <Cylinder args={[1.47, 1.47, 0.17, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, -0.01]}>
        <meshPhysicalMaterial 
          color="#1a1a1a" 
          roughness={0.5} 
          metalness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.7}
        />
      </Cylinder>
      
      {/* Handle Base (Wood) */}
      <Cylinder args={[0.22, 0.3, 1.6, 32]} position={[0, -1.1, 0]}>
        <meshPhysicalMaterial 
          color="#5c4530" 
          roughness={0.9} 
          metalness={0.1} 
        />
      </Cylinder>
      
      {/* Handle Grip Details */}
      <Cylinder args={[0.24, 0.32, 1.2, 32]} position={[0, -1.2, 0]}>
        <meshPhysicalMaterial 
          color="#38291c" 
          roughness={0.95} 
        />
      </Cylinder>
    </group>
  );
};

// Realistic Ping Pong Ball
const Ball = (props) => {
  const mesh = useRef();

  useFrame((state) => {
    if (props.reducedMotion) return;
    const t = state.clock.getElapsedTime();
    
    // Dynamic 3D Trajectory around the paddle
    // Uses different frequencies to avoid a perfect circle and create a rally-like motion
    const orbitRadiusX = 2.5;
    const orbitRadiusZ = 2.0;
    const orbitRadiusY = 1.0;
    
    // Ball position updates
    mesh.current.position.x = Math.sin(t * 1.2) * orbitRadiusX;
    mesh.current.position.z = Math.cos(t * 1.2) * orbitRadiusZ;
    // Add vertical bounce/arc
    mesh.current.position.y = Math.sin(t * 2.4) * orbitRadiusY + 0.5;
  });

  return (
    <Sphere ref={mesh} args={[0.2, 64, 64]} {...props}>
      <meshPhysicalMaterial 
        color="#ffffff" 
        roughness={0.2} 
        metalness={0.1}
        clearcoat={0.1}
      />
    </Sphere>
  );
};

// Scroll Parallax Group
const ScrollParallax = ({ children, reducedMotion }) => {
  const group = useRef();
  
  useEffect(() => {
    if (reducedMotion) return;
    
    const handleScroll = () => {
      if (!group.current) return;
      // Calculate scroll progress (approximate max scroll for hero)
      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 800, 1);
      
      // Shift depth and Y position
      group.current.position.y = -progress * 1.5;
      group.current.position.z = progress * 2; // pushes it slightly backward/forward
      group.current.rotation.x = progress * 0.5; // slight tilt down
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  return <group ref={group}>{children}</group>;
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
      camera={{ position: [0, 0, 7], fov: 45 }}
      style={{ width: '100%', height: '100%', outline: 'none' }}
      dpr={[1, 2]} // Responsive pixel ratio for performance vs quality
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* Studio Lighting Setup */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Key Light - Soft Warm */}
      <spotLight 
        position={[8, 10, 8]} 
        intensity={1.2} 
        angle={0.4} 
        penumbra={1} 
        color="#fff5e6"
      />
      
      {/* Fill Light - Cool */}
      <pointLight 
        position={[-8, -2, -5]} 
        intensity={0.8} 
        color="#e6f2ff" 
      />
      
      {/* Rim Light for the black side visibility */}
      <spotLight 
        position={[0, 5, -10]} 
        intensity={1.5} 
        angle={0.6} 
        penumbra={0.5} 
        color="#ffffff"
      />

      <ScrollParallax reducedMotion={reducedMotion}>
        <Float 
          speed={reducedMotion ? 0 : 1.5} 
          rotationIntensity={reducedMotion ? 0 : 0.3} 
          floatIntensity={reducedMotion ? 0 : 0.4}
        >
          {/* Main Racket */}
          <Paddle reducedMotion={reducedMotion} position={[0, 0, 0]} rotation={[0.1, -0.2, 0.1]} />
          
          {/* Orbiting Ball */}
          <Ball reducedMotion={reducedMotion} position={[0, 0, 0]} />
        </Float>
      </ScrollParallax>

      {/* Realistic Ground Shadow (Transparent integration) */}
      <ContactShadows 
        position={[0, -2.5, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={4} 
        color="#3A2E22"
      />
    </Canvas>
  );
};

export default Scene;
