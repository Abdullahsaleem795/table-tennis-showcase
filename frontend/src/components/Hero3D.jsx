// Procedural table-tennis racket + ball hero scene.
// Ported from the Claude Design "Table Tennis Scene" component and retoned
// from its dark-studio look to the site's earthy Material 3 palette:
// warm cream environment, transparent background, no cool blue lighting.
import React, { useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const V3 = THREE.Vector3, Q = THREE.Quaternion;

/* ---------------------------------------------------------------- noise */
function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}
function fbm(x, y, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2.07; a *= 0.5; }
  return s;
}

function cv(w, hh) {
  const c = document.createElement('canvas'); c.width = w; c.height = hh; return c;
}
function tex(canvas, rx = 1, ry = 1, srgb = false) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------- wood: laminate */
function plywoodStripe() {
  const c = cv(64, 512), x = c.getContext('2d');
  const bands = [
    ['#d8b183', 0.16], ['#7a4d2c', 0.055], ['#e0bd91', 0.155], ['#6d4327', 0.05],
    ['#d3aa7c', 0.20], ['#734829', 0.05], ['#dcb789', 0.155], ['#7a4d2c', 0.055], ['#d8b183', 0.115]
  ];
  let y = 0;
  for (const [col, hgt] of bands) {
    const px = hgt * 512;
    x.fillStyle = col; x.fillRect(0, y, 64, px + 0.5);
    y += px;
  }
  const img = x.getImageData(0, 0, 64, 512), d = img.data;
  for (let j = 0; j < 512; j++) for (let i = 0; i < 64; i++) {
    const n = (fbm(i * 0.35, j * 0.14, 3) - 0.5) * 46 + (hash2(i, j) - 0.5) * 14;
    const k = (j * 64 + i) * 4;
    d[k] = Math.min(255, Math.max(0, d[k] + n));
    d[k + 1] = Math.min(255, Math.max(0, d[k + 1] + n * 0.9));
    d[k + 2] = Math.min(255, Math.max(0, d[k + 2] + n * 0.7));
  }
  x.putImageData(img, 0, 0);
  return c;
}

/* --------------------------------------------------- wood: grain (faces/handle) */
// Texture sizes are half the design's: this runs on the main thread during the
// homepage's lazy hero load, and 512² fbm passes cost a visible hitch.
function woodGrain(size = 256, tone = 0) {
  const c = cv(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  const pal = [[[196, 148, 100], [230, 191, 146]],   // 0 blade veneer
               [[104, 62, 34], [150, 96, 54]],        // 1 dark
               [[222, 192, 152], [246, 228, 202]]][tone]; // 2 pale birch grip
  const base = pal[0], light = pal[1];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const warp = fbm(x * 0.012, y * 0.04, 4);
    let rings = Math.sin((x * 0.11 + warp * 9.5) * 2.0) * 0.5 + 0.5;
    rings = Math.pow(rings, 1.7);
    const fib = (hash2(x * 0.7, y * 3.1) > 0.986) ? 0.32 : 0;
    const t = Math.min(1, rings * 0.85 + fbm(x * 0.1, y * 0.6, 3) * 0.28 - fib);
    const k = (y * size + x) * 4;
    for (let ch = 0; ch < 3; ch++) d[k + ch] = base[ch] + (light[ch] - base[ch]) * t;
    d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
function woodRough(size = 256) {
  const c = cv(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const warp = fbm(x * 0.012, y * 0.04, 3);
    const rings = Math.sin((x * 0.11 + warp * 9) * 2) * 0.5 + 0.5;
    const v = 96 + rings * 58 + fbm(x * 0.2, y * 0.6, 2) * 30;
    const k = (y * size + x) * 4;
    d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
function grainNormal(size = 256) {
  const c = cv(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  const H = (x, y) => {
    const warp = fbm(x * 0.012, y * 0.04, 3);
    return Math.sin((x * 0.11 + warp * 9.5) * 2) * 0.5 + 0.5;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const s = 1.6;
    const nx = (H(x - 1, y) - H(x + 1, y)) * s;
    const ny = (H(x, y - 1) - H(x, y + 1)) * s;
    const len = Math.hypot(nx, ny, 1);
    const k = (y * size + x) * 4;
    d[k] = (nx / len * 0.5 + 0.5) * 255;
    d[k + 1] = (ny / len * 0.5 + 0.5) * 255;
    d[k + 2] = (1 / len * 0.5 + 0.5) * 255;
    d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ----------------------------------------------- rubber: pimpled topsheet */
function pimpleNormal(size = 256, cells = 16, radius = 0.40, strength = 1) {
  const c = cv(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  const cwv = size / cells, chv = cwv * 0.866;
  for (let y = 0; y < size; y++) {
    const row = Math.floor(y / chv), xoff = (row % 2) ? cwv * 0.5 : 0;
    const cy = row * chv + chv * 0.5;
    for (let x = 0; x < size; x++) {
      const col = Math.floor((x - xoff) / cwv);
      const cx = col * cwv + cwv * 0.5 + xoff;
      const dx = (x - cx) / (cwv * radius), dy = (y - cy) / (cwv * radius);
      let nx = 0, ny = 0, nz = 1;
      const r2 = dx * dx + dy * dy;
      if (r2 < 1) {
        const dome = Math.sqrt(1 - r2);
        nx = dx * strength; ny = -dy * strength; nz = dome + 0.25;
      } else {
        nx = (fbm(x * 0.3, y * 0.3, 2) - 0.5) * 0.25;
        ny = (fbm(x * 0.3 + 9, y * 0.3 + 4, 2) - 0.5) * 0.25;
      }
      const len = Math.hypot(nx, ny, nz);
      const k = (y * size + x) * 4;
      d[k] = (nx / len * 0.5 + 0.5) * 255;
      d[k + 1] = (ny / len * 0.5 + 0.5) * 255;
      d[k + 2] = (nz / len * 0.5 + 0.5) * 255;
      d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
function blotchRough(size = 128, lo = 120, hi = 200) {
  const c = cv(size, size), ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size), d = img.data;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = lo + fbm(x * 0.06, y * 0.06, 4) * (hi - lo);
    const k = (y * size + x) * 4;
    d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/* ------------------------------------------------------------- ball maps */
function ballColor() {
  const c = cv(1024, 512), x = c.getContext('2d');
  x.fillStyle = '#fbf8f1'; x.fillRect(0, 0, 1024, 512);
  const g = x.createLinearGradient(0, 236, 0, 276);
  g.addColorStop(0, 'rgba(214,206,192,0)');
  g.addColorStop(0.5, 'rgba(198,188,170,0.85)');
  g.addColorStop(1, 'rgba(214,206,192,0)');
  x.fillStyle = g; x.fillRect(0, 236, 1024, 40);
  x.save();
  x.globalAlpha = 0.30; x.fillStyle = '#8c7f6b';
  x.font = '600 62px Helvetica, Arial, sans-serif'; x.textAlign = 'center';
  x.fillText('40+', 300, 170);
  x.strokeStyle = '#8c7f6b'; x.lineWidth = 4;
  x.beginPath(); x.arc(300, 148, 62, 0, Math.PI * 2); x.stroke();
  x.font = '600 40px Helvetica, Arial, sans-serif';
  x.fillText('P O L Y', 760, 380);
  x.restore();
  return c;
}
function ballBump() {
  const c = cv(1024, 512), x = c.getContext('2d');
  x.fillStyle = '#8a8a8a'; x.fillRect(0, 0, 1024, 512);
  const g = x.createLinearGradient(0, 244, 0, 268);
  g.addColorStop(0, '#9a9a9a'); g.addColorStop(0.5, '#3a3a3a'); g.addColorStop(1, '#9a9a9a');
  x.fillStyle = g; x.fillRect(0, 244, 1024, 24);
  x.globalAlpha = 0.5; x.fillStyle = '#6a6a6a';
  x.font = '600 62px Helvetica, Arial, sans-serif'; x.textAlign = 'center';
  x.fillText('40+', 300, 170);
  return c;
}

/* ------------------------------ procedural room env map (warm cream studio) */
// The design shipped a near-black room; on the site's #F7F2E9 surface that made
// the racket read as a cut-out from a different page. This is the same softbox
// layout relit as a bright, warm room so reflections match the site.
function envEquirect() {
  const c = cv(1024, 512), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#fdfaf3');    // ceiling
  g.addColorStop(0.46, '#f2e9d9');
  g.addColorStop(0.54, '#ddceb5');
  g.addColorStop(1, '#a8937a');    // warm floor bounce
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  const soft = (cx, cy, rw, rh, col, a) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rw, rh));
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.save(); x.globalAlpha = a; x.translate(cx, cy); x.scale(1, rh / Math.max(rw, rh));
    x.translate(-cx, -cy); x.fillStyle = rg;
    x.fillRect(cx - rw * 2, cy - rw * 2, rw * 4, rw * 4); x.restore();
  };
  soft(300, 120, 250, 150, 'rgba(255,250,238,1)', 0.95);   // warm key softbox
  soft(760, 160, 200, 120, 'rgba(226,232,214,1)', 0.6);    // pale sage rim
  soft(520, 40, 420, 90, 'rgba(255,255,255,1)', 0.45);     // ceiling strip
  soft(80, 300, 220, 160, 'rgba(206,186,154,1)', 0.4);     // warm fill bounce
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* --------------------------------------------------------------- geometry */
function ellipseShape(a, b, seg = 160) {
  const s = new THREE.Shape();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg * Math.PI * 2, x = Math.cos(t) * a, y = Math.sin(t) * b;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}
function bladeShape(a, b, seg = 220) {
  const s = new THREE.Shape();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg * Math.PI * 2;
    const c = Math.cos(t), sn = Math.sin(t), p = 2 / 2.4;
    const rx = Math.sign(sn) * Math.pow(Math.abs(sn), p);
    const ry = Math.sign(c) * Math.pow(Math.abs(c), p);
    const bottom = Math.max(0, -ry);
    const x = a * rx * (1 - 0.30 * Math.pow(bottom, 2.1));
    const y = b * ry * (1 + 0.03 * bottom);
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}
function lathedDisc(a, b, depth, bevel, blade) {
  const g = new THREE.ExtrudeGeometry((blade ? bladeShape : ellipseShape)(a - bevel, b - bevel), {
    depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 5, curveSegments: 120, steps: 1
  });
  g.translate(0, 0, -depth / 2 + bevel);
  g.computeVertexNormals();
  return g;
}
// map rim (wall) UVs so V runs across the thickness -> laminate bands
function rimUVs(g, depth) {
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (const grp of g.groups) {
    if (grp.materialIndex !== 1) continue;
    for (let i = grp.start; i < grp.start + grp.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      uv.setXY(i, (Math.atan2(y, x) / (Math.PI * 2) + 0.5) * 5, (z + depth / 2) / depth);
    }
  }
  uv.needsUpdate = true;
}

const BLADE = { a: 0.0750, b: 0.0785, t: 0.0060 };
const RUB = { a: 0.0730, b: 0.0765, t: 0.0038 };
const HALF = BLADE.t / 2 + RUB.t;
const BALL_R = 0.020;
const HANDLE = { top: -0.055, bot: -0.170, r: 0.0135, flat: 0.90 };

// Earthy palette (mirrors index.css tokens) in place of the design's
// vivid red / near-black rubbers, which clashed on a cream page.
const RUBBER_RED = 0xae4327;   // brick red, pulled toward --color-primary
const RUBBER_DARK = 0x2b231a;  // espresso, family of --color-on-surface
const ACCENT_TRAIL = 0xa65e2e; // --color-primary

function buildWorld() {
  // Generated once and shared by blade + handle: this is the priciest map.
  const grainNrmCanvas = grainNormal(256);

  const faceMap = tex(woodGrain(256, 0), 5, 5, true);
  const grainN = tex(grainNrmCanvas, 5, 5);
  const roughW = tex(woodRough(256), 5, 5);
  const rimMap = tex(plywoodStripe(), 6, 1, true);

  const woodFace = new THREE.MeshPhysicalMaterial({
    map: faceMap, roughnessMap: roughW, normalMap: grainN,
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.55, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5,
    color: 0xcfae87
  });
  const woodRim = new THREE.MeshPhysicalMaterial({
    map: rimMap, roughness: 0.48, metalness: 0,
    clearcoat: 0.45, clearcoatRoughness: 0.35, color: 0xffffff
  });

  const bladeGeo = lathedDisc(BLADE.a, BLADE.b, BLADE.t, 0.0013, true);
  rimUVs(bladeGeo, BLADE.t);
  const blade = new THREE.Mesh(bladeGeo, [woodFace, woodRim]);
  blade.castShadow = blade.receiveShadow = true;

  // rubbers
  const mkRubber = (col, rough, pimpleCells, dotStrength) => {
    let nrm = null;
    if (dotStrength > 0) {
      nrm = tex(pimpleNormal(256, pimpleCells, 0.40, dotStrength), 1, 1);
      nrm.repeat.set(1 / 0.021, 1 / 0.021);
    }
    const rgh = tex(blotchRough(128, rough[0], rough[1]), 1, 1);
    rgh.repeat.set(1 / 0.09, 1 / 0.09);
    const face = new THREE.MeshPhysicalMaterial({
      color: col, roughness: 0.72, metalness: 0,
      normalMap: nrm, normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: rgh, clearcoat: 0.25, clearcoatRoughness: 0.6,
      sheen: 0.25, sheenRoughness: 0.9, sheenColor: new THREE.Color(col)
    });
    const side = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.85, metalness: 0 });
    return [face, side];
  };
  const redM = mkRubber(RUBBER_RED, [150, 196], 0, 0);   // smooth inverted topsheet
  redM[0].roughness = 0.70; redM[0].clearcoat = 0.30; redM[0].clearcoatRoughness = 0.55;
  const blkM = mkRubber(RUBBER_DARK, [150, 215], 16, 0.55);
  blkM[0].roughness = 0.78; blkM[0].clearcoat = 0.20;
  blkM[0].normalScale.set(0.45, 0.45);

  const rubGeo = lathedDisc(RUB.a, RUB.b, RUB.t, 0.0006, true);
  const red = new THREE.Mesh(rubGeo, redM);
  red.position.z = BLADE.t / 2 + RUB.t / 2;
  const black = new THREE.Mesh(rubGeo, blkM);
  black.position.z = -(BLADE.t / 2 + RUB.t / 2);
  red.castShadow = black.castShadow = true;
  red.receiveShadow = black.receiveShadow = true;

  // handle: flared lathe profile, flattened to an oval cross-section
  const prof = [
    [0.0150, -0.040], [0.0132, -0.055], [0.0120, -0.068], [0.0111, -0.082],
    [0.0106, -0.096], [0.0107, -0.110], [0.0113, -0.124], [0.0123, -0.138],
    [0.0132, -0.150], [0.0135, -0.158], [0.0131, -0.164], [0.0110, -0.1685],
    [0.0062, -0.1705], [0.0, -0.1712]
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const handleGeo = new THREE.LatheGeometry(prof, 72);
  handleGeo.computeVertexNormals();
  const handleMat = new THREE.MeshPhysicalMaterial({
    map: tex(woodGrain(256, 2), 1.0, 5.0, true),
    roughnessMap: tex(blotchRough(128, 96, 148), 1.0, 5.0),
    normalMap: tex(grainNrmCanvas, 1.0, 5.0),
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughness: 0.44, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.3,
    color: 0xfff4e6
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.scale.set(1, 1, HANDLE.flat);
  handle.castShadow = handle.receiveShadow = true;

  // seam where the two grip halves meet
  const seamMat = new THREE.MeshPhysicalMaterial({ color: 0xb99872, roughness: 0.55 });
  const seamGeo = new THREE.BoxGeometry(0.0007, 0.126, 0.0012);
  const seams = [1, -1].map(s => {
    const m = new THREE.Mesh(seamGeo, seamMat);
    m.position.set(s * 0.0122, -0.1055, 0);
    return m;
  });

  const racket = new THREE.Group();
  racket.add(blade, red, black, handle, seams[0], seams[1]);

  // ripple rings on the rubber
  const rc = cv(256, 256), rx = rc.getContext('2d');
  const rg = rx.createRadialGradient(128, 128, 60, 128, 128, 128);
  rg.addColorStop(0, 'rgba(255,246,230,0)');
  rg.addColorStop(0.62, 'rgba(255,246,230,0.75)');
  rg.addColorStop(0.78, 'rgba(255,246,230,0.30)');
  rg.addColorStop(1, 'rgba(255,246,230,0)');
  rx.fillStyle = rg; rx.fillRect(0, 0, 256, 256);
  const ripMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(rc), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0
  });
  const ripples = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.03), ripMat.clone());
    m.visible = false; racket.add(m);
    return { mesh: m, t: -1 };
  });

  // ball
  const ballMat = new THREE.MeshPhysicalMaterial({
    map: tex(ballColor(), 1, 1, true),
    bumpMap: tex(ballBump(), 1, 1), bumpScale: 0.6,
    color: 0xffffff, roughness: 0.38, metalness: 0,
    clearcoat: 0.12, clearcoatRoughness: 0.45
  });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 64, 48), ballMat);
  ball.castShadow = true;
  const fres = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_R * 1.02, 48, 32),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vec4 wp = modelMatrix*vec4(position,1.0);
          vN = normalize(mat3(modelMatrix)*normal); vV = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0-abs(dot(normalize(vN),normalize(vV))), 3.5);
          gl_FragColor = vec4(vec3(0.98,0.92,0.80)*f*0.38, f); }`
    })
  );
  const spinGroup = new THREE.Group(); spinGroup.add(ball, fres);
  const squashGroup = new THREE.Group(); squashGroup.add(spinGroup);
  const ballRoot = new THREE.Group(); ballRoot.add(squashGroup);

  // trail — normal blending in the brand terracotta; the design's additive
  // white streak was invisible against a light page.
  const TN = 26;
  const tg = new THREE.BufferGeometry();
  tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TN * 3), 3));
  const trail = new THREE.Line(tg, new THREE.LineBasicMaterial({
    color: ACCENT_TRAIL, transparent: true, opacity: 0, depthWrite: false
  }));
  trail.frustumCulled = false;

  // No ground shadow: the racket floats in an open cream hero with no visible
  // floor, so a cast blob just reads as a smudge on the page. The warm CSS
  // halo behind the canvas does the seating instead.
  return { racket, ballRoot, squashGroup, spinGroup, ball, ripples, trail, TN };
}

function disposeWorld(W) {
  const seen = new Set();
  const killMat = (m) => {
    if (!m || seen.has(m)) return;
    seen.add(m);
    for (const k of ['map', 'normalMap', 'roughnessMap', 'bumpMap']) m[k]?.dispose?.();
    m.dispose?.();
  };
  for (const root of [W.racket, W.ballRoot, W.trail]) {
    root.traverse?.((o) => {
      o.geometry?.dispose?.();
      if (Array.isArray(o.material)) o.material.forEach(killMat); else killMat(o.material);
    });
    root.geometry?.dispose?.();
    if (root.material) killMat(root.material);
  }
}

/* ------------------------------------------------------------ simulation */
function makeState() {
  return {
    q: new Q().setFromEuler(new THREE.Euler(0.30, -0.62, 0.10)), omega: new V3(), dragging: false, px: 0, py: 0, pt: 0,
    p: new V3(0.108, 0.0, 0.02), v: new V3(),
    spin: new V3(0, 5.5, 1.4), spinQ: new Q(),
    orbitN: new V3(0.34, 1, 0.22).normalize(), phase: 0,
    squash: 0, squashV: 0, sqN: new V3(0, 0, 1),
    trailStr: 0, trailPts: [], camOff: new V3(), camVel: new V3(),
    lastHit: -10, hitFlash: 0
  };
}

// Mouse-only drag: the design set `touch-action: none`, which traps vertical
// scrolling when the hero fills the phone viewport. Touch users still get the
// full animation, they just can't swing the blade.
function attachPointer(el, S, camera) {
  const k = 0.0085;
  const dq = new Q(), qa = new Q(), qb = new Q();
  const up = new V3(), right = new V3();
  el.style.cursor = 'grab';
  const down = e => {
    if (e.pointerType !== 'mouse') return;
    S.dragging = true; S.px = e.clientX; S.py = e.clientY; S.pt = performance.now();
    el.style.cursor = 'grabbing'; el.setPointerCapture?.(e.pointerId);
  };
  const move = e => {
    if (!S.dragging) return;
    const dx = e.clientX - S.px, dy = e.clientY - S.py;
    const now = performance.now(), dt = Math.max(8, now - S.pt) / 1000;
    S.px = e.clientX; S.py = e.clientY; S.pt = now;
    camera.matrixWorld.extractBasis(right, up, new V3());
    qa.setFromAxisAngle(up, dx * k);
    qb.setFromAxisAngle(right, dy * k);
    dq.copy(qa).multiply(qb);
    S.q.premultiply(dq).normalize();
    const ang = 2 * Math.acos(Math.min(1, Math.abs(dq.w)));
    const s = Math.sqrt(Math.max(1e-9, 1 - dq.w * dq.w));
    const axis = new V3(dq.x / s, dq.y / s, dq.z / s).multiplyScalar(Math.sign(dq.w) || 1);
    S.omega.lerp(axis.multiplyScalar(ang / dt), 0.55);
    e.preventDefault();
  };
  const up_ = () => { if (S.dragging) { S.dragging = false; el.style.cursor = 'grab'; } };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up_);
  window.addEventListener('pointercancel', up_);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up_);
    window.removeEventListener('pointercancel', up_);
  };
}

const _qi = new Q(), _pl = new V3(), _p0 = new V3(), _vl = new V3(), _tmp = new V3(),
  _u = new V3(), _w = new V3(), _n = new V3(), _c = new V3(), _vs = new V3(),
  _vn = new V3(), _vt = new V3(), _ol = new V3();
// Idle sway, composed onto the dragged orientation. `_qe` is the effective
// racket orientation and is used for collision as well as rendering, so the
// ball keeps bouncing off the blade the viewer actually sees.
const _qe = new Q(), _qIdle = new Q(), _eIdle = new THREE.Euler();

function Scene({ cfg, reducedMotion }) {
  const { gl, scene, camera, invalidate } = useThree();
  const W = useMemo(buildWorld, []);
  const S = useMemo(makeState, []);
  const camBase = useMemo(() => camera.position.clone(), [camera]);

  // Compose the resting pose up front so the reduced-motion path (which never
  // runs a frame) still shows the intended arrangement, not an identity pose.
  useMemo(() => {
    W.racket.quaternion.copy(S.q);
    W.ballRoot.position.copy(S.p);
    W.spinGroup.quaternion.copy(S.spinQ);
  }, [W, S]);

  useEffect(() => {
    const eq = envEquirect();
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromEquirectangular(eq).texture;
    scene.environment = env;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    // Under prefers-reduced-motion the canvas is frameloop="demand", so the one
    // render can land before the env map exists; ask for another pass.
    invalidate();
    return () => { scene.environment = null; env.dispose(); pm.dispose(); eq.dispose(); };
  }, [gl, scene, invalidate]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    return attachPointer(gl.domElement, S, camera);
  }, [gl, camera, S, reducedMotion]);

  useEffect(() => () => disposeWorld(W), [W]);

  useFrame((st, rawDt) => {
    if (reducedMotion) return;
    const dt = Math.min(0.033, rawDt || 0.016);
    const t = st.clock.elapsedTime;
    const c = cfg;

    // ---- racket: free spin + damping when not dragged
    if (!S.dragging) {
      const mag = S.omega.length();
      if (mag > 1e-4) {
        const dq = new Q().setFromAxisAngle(S.omega.clone().normalize(), mag * dt);
        S.q.premultiply(dq).normalize();
        const damp = mag > 0.6 ? 1.6 : 4.2;         // spins on, then eases to rest
        S.omega.multiplyScalar(Math.exp(-damp * dt));
        if (S.omega.length() < 0.02) S.omega.set(0, 0, 0);
      }
    }
    // slow breathing sway so the hero still reads as alive when nobody drags it
    _eIdle.set(
      Math.sin(t * 0.45) * 0.055,
      Math.sin(t * 0.31 + 1.2) * 0.080,
      Math.sin(t * 0.38 + 0.6) * 0.035
    );
    _qe.copy(S.q).multiply(_qIdle.setFromEuler(_eIdle));
    W.racket.quaternion.copy(_qe);

    // ---- orbit guidance (precessing, elliptical, non-scripted)
    S.phase += dt * (0.19 + 0.07 * Math.sin(t * 0.23));
    const nx = 0.34 + 0.24 * Math.sin(S.phase * 0.9);
    const nz = 0.22 + 0.30 * Math.cos(S.phase * 0.7 + 1.1);
    S.orbitN.set(nx, 1, nz).normalize();
    _u.set(0, 1, 0).cross(S.orbitN);
    if (_u.lengthSq() < 1e-6) _u.set(1, 0, 0);
    _u.normalize();
    _w.copy(S.orbitN).cross(_u).normalize();
    const Ra = 0.108, Rb = 0.0765;
    const th = Math.atan2(S.p.dot(_w), S.p.dot(_u));
    const target = _tmp.copy(_u).multiplyScalar(Ra * Math.cos(th)).addScaledVector(_w, Rb * Math.sin(th));
    const tang = new V3().copy(_u).multiplyScalar(-Ra * Math.sin(th)).addScaledVector(_w, Rb * Math.cos(th)).normalize();
    const acc = new V3().subVectors(target, S.p).multiplyScalar(26);          // spring to path
    acc.addScaledVector(S.v, -1.1);                                           // damping
    const vT = 0.36 * (c.orbitSpeed ?? 1);
    acc.addScaledVector(tang, (vT - S.v.dot(tang)) * 5.0);                    // keep it moving
    S.v.addScaledVector(acc, dt);

    // ---- continuous collision (sweep) in racket-local space
    _qi.copy(_qe).invert();
    _p0.copy(S.p);
    let remaining = dt, guard = 0;
    while (remaining > 1e-5 && guard++ < 4) {
      const pNext = _tmp.copy(S.p).addScaledVector(S.v, remaining);
      const l0 = _p0.copy(S.p).applyQuaternion(_qi);
      const l1 = new V3().copy(pNext).applyQuaternion(_qi);
      const lim = HALF + BALL_R;

      let tHit = Infinity, side = 0;
      for (const s of [1, -1]) {
        const a0 = l0.z - s * lim, a1 = l1.z - s * lim;
        let tt = Infinity;
        if (a0 * a1 <= 0 && a0 !== a1) tt = a0 / (a0 - a1);
        else if (Math.abs(l0.z) < lim && s === Math.sign(l0.z || 1)) tt = 0;
        if (tt <= 1 && tt < tHit) {
          const cx = l0.x + (l1.x - l0.x) * tt, cy = l0.y + (l1.y - l0.y) * tt;
          if ((cx / BLADE.a) ** 2 + (cy / BLADE.b) ** 2 <= 1) { tHit = tt; side = s; }
        }
      }
      // handle (capsule) test
      let hHit = Infinity, hN = null;
      {
        const dist = Math.hypot(l1.x, l1.z / HANDLE.flat);
        if (l1.y < HANDLE.top && l1.y > HANDLE.bot - 0.01 && dist < HANDLE.r + BALL_R) {
          hHit = 1; hN = new V3(l1.x, 0, l1.z).normalize();
        }
      }

      if (tHit === Infinity && hHit === Infinity) {
        S.p.addScaledVector(S.v, remaining);
        break;
      }
      const useBlade = tHit <= hHit;
      const tt = useBlade ? tHit : 0;
      const dtUsed = remaining * tt;
      S.p.addScaledVector(S.v, dtUsed);
      remaining -= dtUsed;

      _n.copy(useBlade ? new V3(0, 0, side) : hN).applyQuaternion(_qe).normalize();
      // resolve penetration
      _pl.copy(S.p).applyQuaternion(_qi);
      if (useBlade) {
        _pl.z = side * (lim + 0.0004);
      } else {
        const rad = Math.hypot(_pl.x, _pl.z / HANDLE.flat) || 1e-6;
        const push = (HANDLE.r + BALL_R + 0.0004);
        _pl.x = _pl.x / rad * push; _pl.z = _pl.z / rad * push * HANDLE.flat;
      }
      _c.copy(_pl);                                  // contact point (local)
      S.p.copy(_pl).applyQuaternion(_qe);

      // surface velocity at contact from racket angular velocity
      _vs.crossVectors(S.omega, S.p);
      _vl.copy(S.v).sub(_vs);
      const vnMag = _vl.dot(_n);
      _vn.copy(_n).multiplyScalar(vnMag);
      _vt.copy(_vl).sub(_vn);
      const rest = c.restitution ?? 0.85;
      const speed = Math.abs(vnMag) + _vs.length();
      _vl.copy(_vt).multiplyScalar(0.78).addScaledVector(_n, -vnMag * rest);
      S.v.copy(_vl).add(_vs).addScaledVector(_n, 0.02);

      // spin from tangential grip + racket rotation
      const spinAdd = new V3().crossVectors(_n, _vt).multiplyScalar(-22 / BALL_R * 0.02);
      S.spin.addScaledVector(spinAdd, 1).addScaledVector(S.omega, 0.55);
      if (S.spin.length() > 90) S.spin.setLength(90);

      // squash along the impact normal
      S.sqN.copy(_n);
      S.squash = Math.min(0.20, S.squash + 0.10 + Math.min(0.12, speed * 0.075));
      S.squashV -= Math.min(9, speed * 4.5);

      // ripple on the rubber, trail, camera impulse
      const rip = W.ripples.reduce((a, b) => (b.t < 0 || b.t > a.t ? b : a), W.ripples[0]);
      rip.t = 0;
      rip.mesh.visible = true;
      rip.mesh.position.copy(_c).addScaledVector(new V3(0, 0, useBlade ? side : 0), -0.0002);
      if (useBlade) rip.mesh.rotation.set(0, side > 0 ? 0 : Math.PI, 0);
      else rip.mesh.lookAt(_c.clone().multiplyScalar(2));
      S.trailStr = Math.min(1, S.trailStr + Math.min(1, speed * 0.7));
      S.camVel.addScaledVector(_n, -Math.min(0.030, speed * 0.018));
      S.lastHit = t;
    }

    W.ballRoot.position.copy(S.p);

    // ---- spin integration
    const sm = S.spin.length();
    if (sm > 1e-4) {
      S.spinQ.premultiply(new Q().setFromAxisAngle(S.spin.clone().normalize(), sm * dt)).normalize();
      W.spinGroup.quaternion.copy(S.spinQ);
    }
    // decay toward a lazy base spin (~2s)
    const baseSpin = _ol.set(0.6, 4.6, 1.1);
    S.spin.lerp(baseSpin, 1 - Math.exp(-1.6 * dt));

    // ---- squash & stretch spring
    S.squashV += (-S.squash * 620 - S.squashV * 26) * dt;
    S.squash += S.squashV * dt;
    if (Math.abs(S.squash) < 1e-4 && Math.abs(S.squashV) < 1e-3) { S.squash = 0; S.squashV = 0; }
    const sq = 1 - Math.max(-0.06, Math.min(0.22, S.squash));
    const lat = 1 / Math.sqrt(Math.max(0.4, sq));
    W.squashGroup.quaternion.setFromUnitVectors(new V3(0, 0, 1), S.sqN);
    W.squashGroup.scale.set(lat, lat, sq);

    // ---- ripples
    for (const r of W.ripples) {
      if (r.t < 0) continue;
      r.t += dt;
      const k = Math.min(1, r.t / 0.42);
      r.mesh.scale.setScalar(0.55 + k * 2.4);
      r.mesh.material.opacity = (1 - k) * (1 - k) * 0.75;
      if (k >= 1) { r.t = -1; r.mesh.visible = false; }
    }

    // ---- trail
    S.trailPts.unshift(S.p.clone());
    if (S.trailPts.length > W.TN) S.trailPts.pop();
    S.trailStr = Math.max(0, S.trailStr - dt * 2.6);
    const tp = W.trail.geometry.attributes.position;
    for (let i = 0; i < W.TN; i++) {
      const p = S.trailPts[Math.min(i, S.trailPts.length - 1)] || S.p;
      tp.setXYZ(i, p.x, p.y, p.z);
    }
    tp.needsUpdate = true;
    W.trail.material.opacity = S.trailStr * 0.45;

    // ---- camera impulse (sub-degree, damped)
    S.camVel.addScaledVector(S.camOff, -300 * dt).multiplyScalar(Math.exp(-7 * dt));
    S.camOff.addScaledVector(S.camVel, dt).clampLength(0, 0.008);
    camera.position.copy(camBase).add(S.camOff);
    camera.lookAt(0, -0.030, 0);
  });

  return (
    <group>
      {/* Relit for a bright room: the design's cool blue rim/fill read as
          moonlight and fought the page's warm cream. */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[0.30, 0.42, 0.34]}
        intensity={2.7 * (cfg.keyLight ?? 1)}
        color="#fff0dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-0.3}
        shadow-camera-right={0.3}
        shadow-camera-top={0.3}
        shadow-camera-bottom={-0.3}
        shadow-camera-near={0.05}
        shadow-camera-far={1.6}
        shadow-bias={-0.0006}
        shadow-radius={4}
      />
      <directionalLight position={[-0.34, 0.20, -0.42]} intensity={1.5} color="#dfe6d2" />
      <directionalLight position={[0.05, -0.35, 0.25]} intensity={0.35} color="#c9b69a" />
      <directionalLight position={[0.12, 0.06, 0.9]} intensity={0.5} color="#fff6ec" />
      <primitive object={W.racket} />
      <primitive object={W.ballRoot} />
      <primitive object={W.trail} />
    </group>
  );
}

const Hero3D = ({ orbitSpeed = 1, restitution = 0.85, keyLight = 1 }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cfg = useMemo(
    () => ({ orbitSpeed, restitution, keyLight }),
    [orbitSpeed, restitution, keyLight]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Warm halo so the racket sits in the page instead of floating on flat cream */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(58% 52% at 50% 44%, rgba(240,218,196,0.75) 0%, rgba(240,218,196,0.28) 45%, rgba(247,242,233,0) 72%)'
        }}
      />
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0.03, 0.085, 0.74], fov: 30, near: 0.01, far: 12 }}
        frameloop={reducedMotion ? 'demand' : 'always'}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; }}
      >
        <Scene cfg={cfg} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
