"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function AmbientParticles() {
  const ref = React.useRef<THREE.Points>(null!);
  
  // High-performance restrained starfield / liquidity network nodes
  const [positions] = React.useState(() => {
    const count = 700;
    const coords = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 15 + Math.random() * 25;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      coords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      coords[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      coords[i * 3 + 2] = radius * Math.cos(phi);
    }
    return coords;
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y -= delta * 0.015;
    
    // Slow parallax interpolation
    const mouseX = state.pointer.x * 0.15;
    const mouseY = state.pointer.y * 0.15;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, mouseX, 0.03);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, mouseY, 0.03);
  });

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a7b0c0"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export function Scene3D() {
  const [mounted, setMounted] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!mounted || reducedMotion) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[#05070b]"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: 0.65 }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.2]}
        style={{ pointerEvents: "none" }}
      >
        <AmbientParticles />
      </Canvas>
    </div>
  );
}
