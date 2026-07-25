import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Interactive 3D table tennis hero animation.
 * - Racket follows the cursor with eased movement + tilt.
 * - Ball orbits the racket continuously.
 * - Ball bounces off realistically on contact, then returns to orbit.
 *
 * Converted from a Claude Design export (which uses Claude Design's
 * internal preview wrapper) into a plain, portable React component.
 *
 * Usage:
 *   <TableTennisHero />
 *   <TableTennisHero heightVh={80} racketFrontColor="#8a5a34" />
 */
export default function TableTennisHero({
  heightVh = 90,
  showOverlay = true,
  ballColor = '#f2efe9',
  racketFrontColor = '#c62828',
  racketBackColor = '#141414',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- WebGL support check ---
    const testCanvas = document.createElement('canvas');
    let gl = null;
    try {
      gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    } catch (e) {
      /* no-op */
    }
    if (!gl) {
      setWebglSupported(false);
      return;
    }
    setWebglSupported(true);

    let renderer, scene, camera, racket, ball, blade, clock;
    let raf = null;
    let started = false;
    let hidden = false;
    const mouse = { x: 0, y: 0, active: false };

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseleave', onLeave);

    const onResize = () => {
      if (!renderer || !container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    function makeDimpleTexture() {
      const c = document.createElement('canvas');
      c.width = c.height = 128;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#8080ff';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 260; i++) {
        const x = Math.random() * 128, y = Math.random() * 128, r = 1 + Math.random() * 1.4;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(120,120,255,0.5)');
        g.addColorStop(1, 'rgba(128,128,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 3);
      tex.colorSpace = THREE.NoColorSpace;
      return tex;
    }

    function makeWoodTexture() {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#5c3a22';
      ctx.fillRect(0, 0, 64, 256);
      for (let i = 0; i < 40; i++) {
        const y = Math.random() * 256;
        ctx.strokeStyle = `rgba(35,20,10,${0.18 + Math.random() * 0.28})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(20, y + 6, 44, y - 6, 64, y);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    let restOffset,
      racketBase,
      orbitCenter,
      orbitRadius,
      angle,
      orbitSpeed,
      ballMode,
      bounceVel,
      impactTimer,
      targetPos,
      mousePlane,
      raycaster,
      prevRacketPos,
      prevBallPos,
      ballRadius,
      bladeHalfDepth,
      bladeRadius,
      collisionCooldown = 0,
      returnFrom,
      returnT;

    function orbitPosition(a) {
      const c = orbitCenter;
      return new THREE.Vector3(
        c.x + Math.cos(a) * orbitRadius.x,
        c.y + Math.sin(a * 2) * 0.06,
        c.z + Math.sin(a) * orbitRadius.z
      );
    }

    function init() {
      const w = container.clientWidth, h = container.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20);
      camera.position.set(0, 0.5, 2.3);
      camera.lookAt(0, 0.1, 0);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;

      const hemi = new THREE.HemisphereLight(0xfff2e0, 0x3a3038, 1.6);
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff4e6, 4.2);
      key.position.set(1.6, 2.4, 1.8);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 8;
      key.shadow.camera.left = -1.5;
      key.shadow.camera.right = 1.5;
      key.shadow.camera.top = 1.5;
      key.shadow.camera.bottom = -1.5;
      key.shadow.radius = 3;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xaebfff, 1.0);
      fill.position.set(-2, 0.5, -1);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 2.0);
      rim.position.set(0.8, 1, -2.2);
      scene.add(rim);
      const fillPoint = new THREE.PointLight(0xffffff, 1.2, 5);
      fillPoint.position.set(0.9, 0.4, 2);
      scene.add(fillPoint);



      // Racket
      racket = new THREE.Group();
      const woodTex = makeWoodTexture();
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.058, 0.48, 16),
        new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.5, metalness: 0.02 })
      );
      handle.position.y = -0.5;
      handle.castShadow = true;
      racket.add(handle);

      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.06, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5 })
      );
      neck.position.y = -0.2;
      racket.add(neck);

      const dimpleTex = makeDimpleTexture();
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: 0.55 });
      const frontMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(racketFrontColor),
        roughness: 0.26,
        metalness: 0.04,
        normalMap: dimpleTex,
        normalScale: new THREE.Vector2(0.15, 0.15),
      });
      const backMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(racketBackColor),
        roughness: 0.28,
        metalness: 0.04,
        normalMap: dimpleTex,
        normalScale: new THREE.Vector2(0.15, 0.15),
      });
      const bladeGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.09, 40, 1, false);
      blade = new THREE.Mesh(bladeGeo, [rimMat, frontMat, backMat]);
      blade.rotation.x = Math.PI / 2;
      blade.position.y = 0.05;
      blade.castShadow = true;
      racket.add(blade);

      restOffset = new THREE.Vector3(0, 0, 0);
      racket.position.copy(restOffset);
      racket.rotation.set(-0.25, 0.2, 0);
      scene.add(racket);
      racketBase = { rx: -0.25, ry: 0.2, rz: 0 };

      // Ball
      ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 28, 20),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(ballColor),
          roughness: 0.55,
          metalness: 0.02,
          normalMap: dimpleTex,
          normalScale: new THREE.Vector2(0.4, 0.4),
        })
      );
      ball.castShadow = true;
      scene.add(ball);

      orbitCenter = restOffset.clone().add(new THREE.Vector3(0, 0.05, 0));
      orbitRadius = { x: 0.5, z: 0.34 };
      angle = 0;
      orbitSpeed = 1.1;
      ballMode = 'orbit';
      bounceVel = new THREE.Vector3();
      impactTimer = 0;
      targetPos = restOffset.clone();
      mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      raycaster = new THREE.Raycaster();
      prevRacketPos = racket.position.clone();
      prevBallPos = ball.position.clone();
      ballRadius = 0.115;
      bladeHalfDepth = 0.045;
      bladeRadius = 0.43;

      clock = new THREE.Clock();
      setReady(true);
      raf = requestAnimationFrame(animate);
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      if (hidden || !renderer) return;
      const delta = Math.min(clock.getDelta(), 0.05);

      // Racket follows cursor
      if (mouse.active) {
        raycaster.setFromCamera({ x: mouse.x, y: mouse.y }, camera);
        const hit = new THREE.Vector3();
        raycaster.ray.intersectPlane(mousePlane, hit);
        if (hit) {
          targetPos.set(
            restOffset.x + THREE.MathUtils.clamp(hit.x * 0.55, -0.55, 0.55),
            THREE.MathUtils.clamp(hit.y * 0.6, -0.3, 0.45),
            0
          );
        }
      }
      const followLerp = 1 - Math.pow(0.0008, delta);
      racket.position.lerp(targetPos, followLerp);
      const vel = racket.position.clone().sub(prevRacketPos).divideScalar(Math.max(delta, 0.001));
      prevRacketPos.copy(racket.position);
      const speed = vel.length();

      const targetTiltZ = THREE.MathUtils.clamp(-vel.x * 0.18, -0.5, 0.5);
      const targetTiltX = THREE.MathUtils.clamp(vel.y * 0.18, -0.4, 0.4);
      const tiltLerp = 1 - Math.pow(0.001, delta);
      racket.rotation.z = THREE.MathUtils.lerp(racket.rotation.z, racketBase.rz + targetTiltZ, tiltLerp);
      racket.rotation.x = THREE.MathUtils.lerp(racket.rotation.x, racketBase.rx + targetTiltX, tiltLerp);
      racket.rotation.y = THREE.MathUtils.lerp(racket.rotation.y, racketBase.ry - targetTiltZ * 0.3, tiltLerp);

      // Ball state machine
      if (ballMode === 'orbit') {
        angle += delta * orbitSpeed;
        ball.position.copy(orbitPosition(angle));
      } else if (ballMode === 'bounce') {
        impactTimer += delta;
        ball.position.addScaledVector(bounceVel, delta);
        bounceVel.multiplyScalar(0.985);
        bounceVel.y -= 1.1 * delta;
        const squashT = Math.min(impactTimer / 0.14, 1);
        const squash = impactTimer < 0.14 ? 1 - Math.sin(squashT * Math.PI) * 0.32 : 1;
        ball.scale.set(2 - squash, squash, 2 - squash);
        if (bounceVel.length() < 0.22 || impactTimer > 1.4) {
          ballMode = 'returning';
          returnFrom = ball.position.clone();
          returnT = 0;
        }
      } else if (ballMode === 'returning') {
        returnT += delta / 0.6;
        angle += delta * orbitSpeed;
        const target = orbitPosition(angle);
        const t = Math.min(returnT, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        ball.position.lerpVectors(returnFrom, target, eased);
        ball.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        if (t >= 1) ballMode = 'orbit';
      }

      // Collision detection: keeps the ball from tunneling through the blade
      const localPrev = blade.worldToLocal(prevBallPos.clone());
      const localNew = blade.worldToLocal(ball.position.clone());
      const limit = bladeHalfDepth + ballRadius;
      const radialLimit = bladeRadius + ballRadius * 0.6;
      const radial = Math.hypot(localNew.x, localNew.z);
      const crossed = Math.sign(localPrev.y || 1) !== Math.sign(localNew.y || 1);
      const inside = Math.abs(localNew.y) < limit;
      if (radial < radialLimit && (crossed || inside) && collisionCooldown <= 0) {
        // Always bounce off the front face (side facing the camera = positive local y)
        const side = 1;
        const clampedLocal = new THREE.Vector3(localNew.x, side * limit, localNew.z);
        ball.position.copy(blade.localToWorld(clampedLocal));
        const normal = new THREE.Vector3(0, side, 0).transformDirection(blade.matrixWorld).normalize();
        const incoming = ball.position.clone().sub(prevBallPos);
        const incomingDir = incoming.lengthSq() > 0 ? incoming.normalize() : normal.clone();
        const reflected = incomingDir.reflect(normal);
        bounceVel = normal.clone().multiplyScalar(1.4 + speed * 1.6).add(reflected.multiplyScalar(0.9));
        ballMode = 'bounce';
        impactTimer = 0;
        collisionCooldown = 0.12;
      }
      collisionCooldown = Math.max(0, collisionCooldown - delta);
      prevBallPos.copy(ball.position);

      renderer.render(scene, camera);
    }

    // Only start rendering once the section is actually visible (perf)
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          init();
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      if (renderer) {
        renderer.dispose();
        scene &&
          scene.traverse((o) => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
              (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
                if (m.map) m.map.dispose();
                if (m.normalMap) m.normalMap.dispose();
                m.dispose();
              });
            }
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballColor, racketFrontColor, racketBackColor]);

  const showFallback = webglSupported === false;
  const canvasDisplay = webglSupported === false ? 'none' : 'block';
  const canvasOpacity = ready ? 1 : 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      {showOverlay && (
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            flex: '0 0 auto',
            width: 'min(42%, 460px)',
            padding: '0 4vw',
            textAlign: 'left',
          }}
        >
          <h1
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(30px,4vw,50px)',
              lineHeight: 1.05,
              fontWeight: 600,
              color: '#f4f2ec',
              letterSpacing: '-0.01em',
            }}
          >
            Every rally starts here.
          </h1>
          <p style={{ margin: '0 0 28px', fontSize: 19, lineHeight: 1.5, color: '#c9c6c2' }}>
            Move your cursor. Feel the game.
          </p>
          {/* Placeholder CTA from the design export — wire this up to your
              actual players/rankings section, or remove it */}
          <button
            style={{
              background: '#c62828',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 4,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            Explore players
          </button>
        </div>
      )}

      <div ref={containerRef} style={{ position: 'relative', flex: '1 1 auto', height: '100%', minWidth: 280 }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: canvasDisplay,
            opacity: canvasOpacity,
            transition: 'opacity 1s ease',
          }}
        />
        {showFallback && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <style>{`
              @keyframes ttSpin { from{ transform: translate(-50%,0) rotate(0deg);} to{ transform: translate(-50%,0) rotate(360deg);} }
              @keyframes ttBounce { 0%,100%{ transform: translate(-50%,0);} 50%{ transform: translate(-50%,-46px);} }
            `}</style>
            <div
              style={{
                position: 'absolute',
                left: '52%',
                bottom: '22%',
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#c62828 50%,#141414 50%)',
                boxShadow: '0 10px 22px rgba(0,0,0,0.4)',
                animation: 'ttSpin 3.4s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '38%',
                bottom: '30%',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#f2efe9',
                boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                animation: 'ttBounce 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
