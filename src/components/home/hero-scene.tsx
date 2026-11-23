"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Hero WebGL scene: interlocked gold + rose-gold rings with a solitaire,
 * drifting rose petals and twinkling gold dust. Purely decorative — the
 * canvas is aria-hidden and ignores pointer events; the page works without it.
 */

type RootRef = React.RefObject<HTMLElement | null>;

const TAU = Math.PI * 2;
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const { damp } = THREE.MathUtils;

/** Window-level pointer (the canvas itself never receives events). */
const pointer = { x: 0, y: 0 };

function usePointer() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}

/** 0 at the top of the hero, 1 once it has scrolled out of view. */
function scrollProgress(root: HTMLElement | null) {
  if (!root) return 0;
  const rect = root.getBoundingClientRect();
  return THREE.MathUtils.clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
}

/** Procedural studio reflections (no HDR download). Returns a cleanup function. */
function applyStudioEnvironment(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.035).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 1.15;
  room.dispose();
  pmrem.dispose();
  return () => {
    scene.environment = null;
    envMap.dispose();
  };
}

/** Scratch object for composing instance matrices (module scope, never rendered). */
const scratch = new THREE.Object3D();

/** A soft four-point star, drawn once into a canvas texture. */
function useGlintTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const c = size / 2;
    const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.18, "rgba(255,244,220,0.55)");
    glow.addColorStop(1, "rgba(255,244,220,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (const [w, h] of [[3, size], [size, 3]]) ctx.fillRect(c - w / 2, c - h / 2, w, h);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function Rings({ rootRef }: { rootRef: RootRef }) {
  const group = useRef<THREE.Group>(null);
  const glint = useRef<THREE.Sprite>(null);
  const spin = useRef(0);
  /** Anchor centre and width as fractions of the hero box. */
  const anchor = useRef({ px: 0.72, py: 0.62, pw: 0.18 });
  const glintTexture = useGlintTexture();

  const { torus, crown, pavilion, setting, gold, rose, gem } = useMemo(
    () => ({
      torus: new THREE.TorusGeometry(1, 0.1, 40, 150),
      crown: new THREE.CylinderGeometry(0.13, 0.22, 0.09, 8, 1),
      pavilion: new THREE.ConeGeometry(0.22, 0.26, 8, 1),
      setting: new THREE.CylinderGeometry(0.1, 0.07, 0.1, 24),
      gold: new THREE.MeshPhysicalMaterial({ color: "#e2b872", metalness: 1, roughness: 0.17, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
      rose: new THREE.MeshPhysicalMaterial({ color: "#e9b8a3", metalness: 1, roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
      gem: new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0,
        ior: 2.4,
        clearcoat: 1,
        iridescence: 1,
        iridescenceIOR: 1.6,
        envMapIntensity: 2.6,
        flatShading: true,
      }),
    }),
    [],
  );

  useEffect(
    () => () => {
      for (const resource of [torus, crown, pavilion, setting, gold, rose, gem, glintTexture]) resource.dispose();
    },
    [torus, crown, pavilion, setting, gold, rose, gem, glintTexture],
  );

  // Track the DOM anchor so the rings always sit on the photo's corner (or the mobile spot).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => {
      const target = [...root.querySelectorAll<HTMLElement>("[data-ring-anchor]")].find((el) => el.offsetWidth > 0);
      if (!target) return;
      const box = root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      anchor.current = {
        px: (rect.left - box.left + rect.width / 2) / box.width,
        py: (rect.top - box.top + rect.height / 2) / box.height,
        pw: rect.width / box.width,
      };
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const { width: vw, height: vh } = state.viewport;
    const progress = scrollProgress(rootRef.current);
    const a = anchor.current;

    const targetX = (a.px - 0.5) * vw;
    const targetY = (0.5 - a.py) * vh + Math.sin(t * 0.9) * 0.07 + progress * 0.9;
    const targetScale = Math.max(0.3, (a.pw * vw) / 3.1) * (1 - progress * 0.25);
    g.position.x = damp(g.position.x, targetX, 5, dt);
    g.position.y = damp(g.position.y, targetY, 5, dt);
    g.scale.setScalar(damp(g.scale.x, targetScale, 5, dt));

    spin.current += dt * 0.32;
    g.rotation.y = damp(g.rotation.y, spin.current + pointer.x * 0.55 + progress * Math.PI, 3, dt);
    g.rotation.x = damp(g.rotation.x, 0.32 - pointer.y * 0.28 + Math.sin(t * 0.55) * 0.06, 3, dt);

    if (glint.current) {
      const pulse = Math.max(0, Math.sin(t * 1.7)) ** 6;
      glint.current.scale.setScalar(0.12 + pulse * 0.55);
      glint.current.material.rotation = t * 0.6;
      glint.current.material.opacity = 0.35 + pulse * 0.65;
    }
  });

  return (
    <group ref={group} rotation={[0.32, 0, 0.18]}>
      {/* Gold band with the solitaire */}
      <group position={[-0.5, 0, 0]}>
        <mesh geometry={torus} material={gold} />
        <mesh geometry={setting} material={gold} position={[0, 1.12, 0]} />
        <mesh geometry={pavilion} material={gem} position={[0, 1.23, 0]} rotation={[Math.PI, 0, 0]} />
        <mesh geometry={crown} material={gem} position={[0, 1.405, 0]} />
        <sprite ref={glint} position={[0.06, 1.47, 0.12]}>
          <spriteMaterial
            map={glintTexture}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      </group>
      {/* Rose-gold band, interlocked through the first */}
      <mesh geometry={torus} material={rose} position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.94} />
    </group>
  );
}

/** A cupped, teardrop-shaped petal (1 unit tall). */
function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.48, -0.32, 0.44, 0.32, 0, 0.5);
  shape.bezierCurveTo(-0.44, 0.32, -0.48, -0.32, 0, -0.5);
  const geometry = new THREE.ShapeGeometry(shape, 14);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    position.setZ(i, x * x * 0.9 - (y + 0.5) * (y + 0.5) * 0.12);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const PETAL_COLORS = ["#e9a9a6", "#f2c4bd", "#d98f95", "#efd0b4", "#f4b9c0", "#e6b28f"];

type Petal = {
  x: number;
  y: number;
  z: number;
  fall: number;
  sway: number;
  phase: number;
  rot: readonly [number, number, number];
  spin: readonly [number, number, number];
  scale: number;
};

function createPetals(count: number): Petal[] {
  return Array.from({ length: count }, () => ({
    x: rand(-1.1, 1.1),
    y: rand(-1.1, 1.3),
    z: rand(-3.5, 2),
    fall: rand(0.16, 0.38),
    sway: rand(0.15, 0.5),
    phase: rand(0, TAU),
    rot: [rand(0, TAU), rand(0, TAU), rand(0, TAU)] as const,
    spin: [rand(-0.9, 0.9), rand(-0.6, 0.6), rand(-1, 1)] as const,
    scale: rand(0.09, 0.16),
  }));
}

function Petals({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const petals = useRef<Petal[]>([]);
  const geometry = useMemo(() => createPetalGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.55,
        metalness: 0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
        emissive: new THREE.Color("#3a1620"),
        emissiveIntensity: 0.4,
      }),
    [],
  );
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useLayoutEffect(() => {
    petals.current = createPetals(count);
    const m = mesh.current;
    if (!m) return;
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) m.setColorAt(i, color.set(PETAL_COLORS[i % PETAL_COLORS.length]!));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const list = petals.current;
    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      const halfH = tanHalf * (camera.position.z - p.z);
      const halfW = halfH * camera.aspect;
      p.y -= (p.fall * dt) / halfH;
      if (p.y < -1.2) {
        p.y = 1.2;
        p.x = rand(-1.1, 1.1);
      }
      scratch.position.set(p.x * halfW + Math.sin(t * 0.55 + p.phase) * p.sway, p.y * halfH, p.z);
      scratch.rotation.set(p.rot[0] + t * p.spin[0], p.rot[1] + t * p.spin[1], p.rot[2] + t * p.spin[2]);
      scratch.scale.setScalar(p.scale);
      scratch.updateMatrix();
      m.setMatrixAt(i, scratch.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aPhase) * 0.18;
    p.x += cos(uTime * 0.18 + aPhase * 1.7) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (9.0 / -mv.z);
    vAlpha = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * 1.4 + aPhase * 5.0), 3.0);
  }
`;

const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }
`;

function GoldDust({ count }: { count: number }) {
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions.set([rand(-5, 5), rand(-2.8, 2.8), rand(-4, 1.5)], i * 3);
      phases[i] = rand(0, TAU);
      sizes[i] = rand(2, 7);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color("#f0d39a") },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material };
  }, [count]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state) => {
    const uniforms = points.current?.material.uniforms;
    if (!uniforms) return;
    uniforms.uTime!.value = state.clock.elapsedTime;
    uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}

/** Calls `onReady` once the first frame has been drawn (so its shaders are compiled). */
function FirstFrame({ onReady }: { onReady: () => void }) {
  const called = useRef(false);
  useFrame(() => {
    if (called.current) return;
    called.current = true;
    requestAnimationFrame(() => onReady());
  });
  return null;
}

/**
 * `playing={false}`: draw one frame (the expensive part: shader compilation) and hold still, so the
 * scene can be prepared out of sight and start moving the moment it is shown.
 */
export default function HeroScene({
  rootRef,
  onReady,
  playing = true,
}: {
  rootRef: RootRef;
  onReady: () => void;
  playing?: boolean;
}) {
  const [active, setActive] = useState(true);
  const [compact] = useState(() => window.innerWidth < 768);
  const disposeEnvironment = useRef<(() => void) | null>(null);
  usePointer();
  useEffect(() => () => disposeEnvironment.current?.(), []);

  // Stop rendering entirely while the hero is off-screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), { rootMargin: "80px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  return (
    <Canvas
      dpr={[1, compact ? 1.25 : 1.5]}
      camera={{ position: [0, 0, 6], fov: 35, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={!active ? "never" : playing ? "always" : "demand"}
      onCreated={({ gl, scene }) => {
        gl.toneMappingExposure = 1.15;
        disposeEnvironment.current = applyStudioEnvironment(gl, scene);
      }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.6} color="#fff1dc" />
      <pointLight position={[-3, -1.5, 2.5]} intensity={8} distance={12} color="#c45a72" />
      <Rings rootRef={rootRef} />
      <Petals count={compact ? 24 : 60} />
      <GoldDust count={compact ? 70 : 160} />
      <FirstFrame onReady={onReady} />
    </Canvas>
  );
}
