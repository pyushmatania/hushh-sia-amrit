import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { useRef, useState, useCallback, useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

/* ── Color palettes per state ── */
const palettes: Record<string, { core: string; mid: string; outer: string; glow: string }> = {
  idle:      { core: "#FFF8E7", mid: "#FFB74D", outer: "#FF6F00", glow: "#FF8F00" },
  thinking:  { core: "#E3F2FD", mid: "#42A5F5", outer: "#1565C0", glow: "#1E88E5" },
  speaking:  { core: "#FFF8E7", mid: "#FFA726", outer: "#E65100", glow: "#FF6D00" },
  listening: { core: "#FCE4EC", mid: "#EC407A", outer: "#AD1457", glow: "#C2185B" },
  success:   { core: "#E8F5E9", mid: "#66BB6A", outer: "#1B5E20", glow: "#2E7D32" },
  error:     { core: "#FFEBEE", mid: "#EF5350", outer: "#B71C1C", glow: "#C62828" },
};

const expressions = ["curious", "happy", "sleepy", "excited"] as const;

/* ── 3D Fire Body ── */
function FireBody({ state, hovered, expression }: { state: string; hovered: boolean; expression: string }) {
  const bodyRef = useRef<THREE.Group>(null!);
  const flameRef = useRef<THREE.Mesh>(null!);
  const p = palettes[state] || palettes.idle;

  // Wobble & breathing
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 1.5) * (hovered ? 0.15 : 0.05);
      const breathe = 1 + Math.sin(t * 2) * 0.03;
      bodyRef.current.scale.set(breathe, breathe, breathe);
    }
    if (flameRef.current) {
      const flicker = 1 + Math.sin(t * 8) * 0.08 + Math.sin(t * 13) * 0.04;
      flameRef.current.scale.set(flicker, 1 + Math.sin(t * 6) * 0.1, flicker);
    }
  });

  const coreColor = useMemo(() => new THREE.Color(p.core), [p.core]);
  const midColor = useMemo(() => new THREE.Color(p.mid), [p.mid]);
  const outerColor = useMemo(() => new THREE.Color(p.outer), [p.outer]);

  // Eye style based on expression
  const eyeScale = expression === "sleepy" ? [1, 0.4, 1] as const : expression === "excited" ? [1.15, 1.15, 1] as const : [1, 1, 1] as const;
  const eyeY = expression === "curious" ? 0.15 : 0;

  return (
    <group ref={bodyRef}>
      {/* Main body – round flame shape */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={midColor} emissive={midColor} emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      {/* Inner glow core */}
      <mesh position={[0, -0.05, 0.1]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Flame tip top */}
      <mesh ref={flameRef} position={[0, 0.75, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.35, 0.8, 16]} />
        <meshStandardMaterial color={outerColor} emissive={outerColor} emissiveIntensity={0.5} transparent opacity={0.9} />
      </mesh>

      {/* Left flame wisp */}
      <mesh position={[-0.3, 0.6, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color={outerColor} emissive={outerColor} emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Right flame wisp */}
      <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.15, 0.5, 8]} />
        <meshStandardMaterial color={outerColor} emissive={outerColor} emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>

      {/* Eyes */}
      <group position={[0, eyeY, 0]}>
        {/* Left eye white */}
        <mesh position={[-0.22, 0.05, 0.6]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Left pupil */}
        <mesh position={[-0.22, 0.05, 0.72]} scale={eyeScale as any}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={hovered ? "#FF1744" : "#1a1a2e"} />
        </mesh>

        {/* Right eye white */}
        <mesh position={[0.22, 0.05, 0.6]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Right pupil */}
        <mesh position={[0.22, 0.05, 0.72]} scale={eyeScale as any}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={hovered ? "#FF1744" : "#1a1a2e"} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.22, 0.22, 0.62]} rotation={[0, 0, hovered ? 0.3 : expression === "curious" ? -0.2 : 0.15]}>
          <boxGeometry args={[0.18, 0.035, 0.02]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
        <mesh position={[0.22, 0.22, 0.62]} rotation={[0, 0, hovered ? -0.3 : expression === "curious" ? 0.2 : -0.15]}>
          <boxGeometry args={[0.18, 0.035, 0.02]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </group>

      {/* Mouth */}
      <Mouth expression={expression} hovered={hovered} state={state} />

      {/* Cheek blush */}
      {(expression === "happy" || expression === "excited") && (
        <>
          <mesh position={[-0.38, -0.08, 0.5]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#FF8A80" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0.38, -0.08, 0.5]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#FF8A80" transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ── Mouth shapes ── */
function Mouth({ expression, hovered, state }: { expression: string; hovered: boolean; state: string }) {
  if (hovered) {
    // Scared O mouth
    return (
      <mesh position={[0, -0.2, 0.65]}>
        <torusGeometry args={[0.06, 0.025, 8, 16]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    );
  }
  if (state === "speaking") {
    return (
      <mesh position={[0, -0.2, 0.65]}>
        <torusGeometry args={[0.08, 0.02, 8, 16]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
    );
  }
  if (expression === "happy" || expression === "excited") {
    // Smile arc
    return (
      <mesh position={[0, -0.22, 0.65]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#4E342E" />
      </mesh>
    );
  }
  if (expression === "sleepy") {
    // Flat line
    return (
      <mesh position={[0, -0.2, 0.66]}>
        <boxGeometry args={[0.15, 0.025, 0.01]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
    );
  }
  // Default pout/neutral
  return (
    <mesh position={[0, -0.18, 0.66]}>
      <boxGeometry args={[0.1, 0.03, 0.01]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  );
}

/* ── Ember particles ── */
function Embers({ state }: { state: string }) {
  const p = palettes[state] || palettes.idle;
  const embersRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!embersRef.current) return;
    const t = clock.getElapsedTime();
    embersRef.current.children.forEach((child, i) => {
      child.position.y = ((t * 0.5 + i * 0.3) % 2) - 0.5;
      child.position.x = Math.sin(t * 2 + i * 1.5) * 0.4;
      (child as THREE.Mesh).material && ((child as any).material.opacity = 1 - ((t * 0.5 + i * 0.3) % 2) / 2);
    });
  });

  const color = useMemo(() => new THREE.Color(p.mid), [p.mid]);

  return (
    <group ref={embersRef}>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i} position={[(i - 2) * 0.2, 0, 0]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Shadow disc ── */
function Shadow() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.scale.x = 0.8 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });
  return (
    <mesh ref={ref} position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.4, 24]} />
      <meshStandardMaterial color="black" transparent opacity={0.12} />
    </mesh>
  );
}

/* ── 3D Scene ── */
function Scene({ state, hovered, expression }: { state: string; hovered: boolean; expression: string }) {
  const p = palettes[state] || palettes.idle;

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[2, 3, 4]} intensity={1} color={p.glow} />
      <pointLight position={[-2, 1, 3]} intensity={0.4} color={p.core} />

      <Float
        speed={hovered ? 6 : 2}
        rotationIntensity={hovered ? 0.6 : 0.2}
        floatIntensity={hovered ? 0.8 : 0.4}
      >
        <FireBody state={state} hovered={hovered} expression={expression} />
      </Float>

      <Embers state={state} />
      <Shadow />
      <Environment preset="sunset" />
    </>
  );
}

/* ── Fallback loading ── */
function LoadingFallback({ size }: { size: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-t from-orange-500 to-yellow-300 animate-pulse" />
    </div>
  );
}

/* ── Exported component ── */
export default function HushhBot({ size = 80, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  useEffect(() => {
    if (state === "idle" && !hovered) {
      const iv = setInterval(() => setCycleIndex(p => (p + 1) % expressions.length), 3000);
      return () => clearInterval(iv);
    }
  }, [state, hovered]);

  const expression = expressions[cycleIndex];

  return (
    <div
      style={{ width: size, height: size, cursor: "pointer" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
    >
      <Suspense fallback={<LoadingFallback size={size} />}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 40 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <Scene state={state} hovered={hovered} expression={expression} />
        </Canvas>
      </Suspense>
    </div>
  );
}
