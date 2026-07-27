"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

/** Organic, slowly morphing blob with colored rim lighting. */
function Blob() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.14;
    mesh.current.rotation.z = t * 0.05;
    // gentle mouse parallax
    const { x, y } = state.pointer;
    mesh.current.position.x = 2.1 + x * 0.35;
    mesh.current.position.y = 0.1 + y * 0.35;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.7}>
      <mesh ref={mesh} position={[2.1, 0.1, 0]} scale={2.35}>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color="#0b1a30"
          roughness={0.28}
          metalness={0.55}
          distort={0.42}
          speed={1.6}
          envMapIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

/** Drifting particle field. */
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

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.03;
    ref.current.position.x = state.pointer.x * 0.3;
    ref.current.position.y = state.pointer.y * 0.3;
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

export default function HeroCanvas() {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 42 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} color="#ffffff" />
      {/* accent rim lights, teal + amber */}
      <pointLight position={[-4, 2, 3]} intensity={24} color="#00b2bc" distance={16} />
      <pointLight position={[6, -3, 2]} intensity={18} color="#ffba08" distance={16} />
      <Blob />
      <Particles />
      <fog attach="fog" args={["#0a1628", 6, 15]} />
    </Canvas>
  );
}
