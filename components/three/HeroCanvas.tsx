"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Pointer position over the whole hero, normalised to -1..1 (y up), plus how fast it's moving.
 * Tracked on the window rather than through the canvas: the hero text sits on top of the
 * canvas, so canvas pointer events only fired in the few uncovered gaps (jumpy, then frozen).
 */
const pointer = { x: 0, y: 0, speed: 0 };

function usePointerOver(el: React.RefObject<HTMLElement>) {
  useEffect(() => {
    let lx = 0;
    let ly = 0;
    let lt = performance.now();
    const onMove = (e: PointerEvent) => {
      const host = el.current?.closest("section") ?? el.current;
      if (!host) return;
      const r = host.getBoundingClientRect(); // same (on-screen) units as clientX/Y, zoom-safe
      if (e.clientY > r.bottom || e.clientY < r.top) return;
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const now = performance.now();
      const dt = Math.max(16, now - lt);
      pointer.speed = Math.min(1, Math.hypot(x - lx, y - ly) / (dt / 1000) / 6);
      pointer.x = Math.max(-1, Math.min(1, x));
      pointer.y = Math.max(-1, Math.min(1, y));
      lx = x;
      ly = y;
      lt = now;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [el]);
}

type DistortMat = THREE.MeshStandardMaterial & { distort: number };

/**
 * Organic, slowly morphing blob. It glides toward the cursor (eased, never snapping),
 * leans toward it, and its surface ripples a little more while you move fast.
 */
function Blob() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<DistortMat>(null);
  const home = useMemo(() => new THREE.Vector3(2.1, 0.1, 0), []);
  const energy = useRef(0);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const ease = (rate: number) => 1 - Math.exp(-dt * rate); // frame-rate independent smoothing

    // flow toward the cursor, within a comfortable range around its home spot
    // (it lives on the right, so it travels further left than right and never leaves the frame)
    const tx = home.x + pointer.x * (pointer.x > 0 ? 0.55 : 1.3);
    const ty = home.y + pointer.y * 0.75;
    m.position.x += (tx - m.position.x) * ease(1.8);
    m.position.y += (ty - m.position.y) * ease(1.8);

    // slow spin, plus a lean toward the pointer
    m.rotation.y = t * 0.12 + pointer.x * 0.35;
    m.rotation.x += (-pointer.y * 0.3 - m.rotation.x) * ease(2.2);
    m.rotation.z = t * 0.04;

    // surface energy: rises when the cursor moves quickly, settles when it rests
    pointer.speed *= Math.exp(-dt * 3);
    energy.current += (pointer.speed - energy.current) * ease(4);
    if (mat.current) mat.current.distort = 0.32 + energy.current * 0.22;
    const s = 2.35 * (1 + energy.current * 0.04);
    m.scale.setScalar(m.scale.x + (s - m.scale.x) * ease(5));
  });

  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh ref={mesh} position={[2.1, 0.1, 0]} scale={2.35}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          ref={mat as never /* drei's material type isn't exported; we only touch .distort */}
          color="#0b1a30"
          roughness={0.28}
          metalness={0.55}
          distort={0.32}
          speed={1.1}
          envMapIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

/** Drifting particle field with a soft, eased parallax. */
function Particles({ count = 320 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.05) * 1.5);
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    ref.current.position.x += (-pointer.x * 0.3 - ref.current.position.x) * k;
    ref.current.position.y += (-pointer.y * 0.2 - ref.current.position.y) * k;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#00b2bc"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroCanvas({
  theme = "dark",
}: {
  theme?: "dark" | "light";
}) {
  const isLight = theme === "light";
  const fogColor = isLight ? "#f3f5fa" : "#0a1628";
  const host = useRef<HTMLDivElement>(null);
  usePointerOver(host);

  return (
    <div ref={host} className="hero-canvas">
      <Canvas
        dpr={[1, 1.8]}
        // The site zooms to 80% on laptops (globals.css). Measuring with getBoundingClientRect
        // returns zoomed sizes, which left the canvas 20% short (the blob got cut off on a hard
        // edge). offsetSize measures in page pixels, so the canvas always fills the hero.
        resize={{ offsetSize: true, scroll: false }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 42 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} color="#ffffff" />
        {/* accent rim lights, teal + amber (only needed for the blob) */}
        {!isLight && (
          <>
            <pointLight position={[-4, 2, 3]} intensity={24} color="#00b2bc" distance={16} />
            <pointLight position={[6, -3, 2]} intensity={18} color="#ffba08" distance={16} />
          </>
        )}
        {/* Blob is hidden in light mode so the hero stays clean/transparent */}
        {!isLight && <Blob />}
        <Particles />
        <fog attach="fog" args={[fogColor, 6, 15]} />
      </Canvas>
    </div>
  );
}
