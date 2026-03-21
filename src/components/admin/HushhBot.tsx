import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface HushhBotProps {
  size?: number;
  state?: "idle" | "thinking" | "speaking" | "listening" | "success" | "error";
}

type Expression = "happy" | "curious" | "excited" | "sleepy" | "worried";

const EXPR_CYCLE: Expression[] = ["happy", "curious", "excited", "sleepy", "worried"];

/* ─── Expression configs ─── */
interface ExprConfig {
  eyeScaleY: number;
  eyeOffsetX: number;       // pupil horizontal shift
  browAngle: number;         // brow rotation (radians)
  browY: number;             // brow vertical offset
  mouthWidth: number;
  mouthHeight: number;
  mouthCurve: number;        // positive = smile, negative = frown
  bodySquashY: number;
  bodySquashX: number;
  tiltZ: number;
  blush: number;
  flameIntensity: number;
}

const EXPRESSIONS: Record<Expression, ExprConfig> = {
  happy:   { eyeScaleY: 0.55, eyeOffsetX: 0,    browAngle: 0,     browY: 0.12,  mouthWidth: 0.28, mouthHeight: 0.12, mouthCurve: 0.08,  bodySquashY: 0.95, bodySquashX: 1.04, tiltZ: 0.05,  blush: 0.6, flameIntensity: 1.0 },
  curious: { eyeScaleY: 1.1,  eyeOffsetX: 0.02, browAngle: 0.2,   browY: 0.15,  mouthWidth: 0.12, mouthHeight: 0.08, mouthCurve: 0,     bodySquashY: 1.02, bodySquashX: 0.98, tiltZ: -0.15, blush: 0,   flameIntensity: 0.8 },
  excited: { eyeScaleY: 1.3,  eyeOffsetX: 0,    browAngle: -0.15, browY: 0.18,  mouthWidth: 0.32, mouthHeight: 0.18, mouthCurve: 0.12,  bodySquashY: 1.08, bodySquashX: 1.06, tiltZ: -0.08, blush: 0.5, flameIntensity: 1.4 },
  sleepy:  { eyeScaleY: 0.2,  eyeOffsetX: 0,    browAngle: 0.1,   browY: 0.08,  mouthWidth: 0.1,  mouthHeight: 0.06, mouthCurve: -0.02, bodySquashY: 0.92, bodySquashX: 1.02, tiltZ: 0.12,  blush: 0,   flameIntensity: 0.5 },
  worried: { eyeScaleY: 1.05, eyeOffsetX: 0,    browAngle: 0.25,  browY: 0.1,   mouthWidth: 0.18, mouthHeight: 0.06, mouthCurve: -0.06, bodySquashY: 0.97, bodySquashX: 0.96, tiltZ: 0.08,  blush: 0,   flameIntensity: 0.65 },
};

/* ─── Lerp helper ─── */
function lerpConfig(current: ExprConfig, target: ExprConfig, t: number): ExprConfig {
  const result = {} as ExprConfig;
  for (const key of Object.keys(target) as (keyof ExprConfig)[]) {
    result[key] = THREE.MathUtils.lerp(current[key] as number, target[key] as number, t);
  }
  return result;
}

/* ─── Flame tip geometry (cone cluster) ─── */
function FlameTips({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      child.position.y = 0.65 + Math.sin(t * 3 + i * 1.2) * 0.06 * intensity;
      child.rotation.z = Math.sin(t * 2.5 + i * 0.8) * 0.15 * intensity;
      child.scale.setScalar(0.9 + Math.sin(t * 4 + i) * 0.12 * intensity);
    });
  });

  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const r = i === 0 ? 0 : 0.12 + (i % 2) * 0.06;
        const h = i === 0 ? 0.55 : 0.3 + (i % 3) * 0.08;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.65, Math.sin(angle) * r * 0.3]}>
            <coneGeometry args={[0.12 - i * 0.01, h, 8]} />
            <meshStandardMaterial
              color={i === 0 ? "#ff8800" : i < 3 ? "#ffaa00" : "#ffcc44"}
              emissive={i === 0 ? "#ff4400" : "#ff6600"}
              emissiveIntensity={0.6 * intensity}
              transparent
              opacity={i === 0 ? 0.95 : 0.7}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Ember particles ─── */
function Embers({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
      radius: 0.15 + Math.random() * 0.25,
      size: 0.015 + Math.random() * 0.02,
    })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const p = particles[i];
      const phase = ((t * p.speed + p.offset) % 3) / 3;
      child.position.x = Math.sin(t * 0.8 + p.offset) * p.radius;
      child.position.y = -0.3 + phase * 1.8;
      child.position.z = Math.cos(t * 0.6 + p.offset) * p.radius * 0.4;
      (child as THREE.Mesh).scale.setScalar(
        p.size * (1 - phase) * 40 * intensity
      );
    });
  });

  return (
    <group ref={ref}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color="#ffaa33"
            emissive="#ff6600"
            emissiveIntensity={1.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Eye component ─── */
function Eye({ position, config, mirrorBrow }: {
  position: [number, number, number];
  config: ExprConfig;
  mirrorBrow?: boolean;
}) {
  const eyeRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!eyeRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle eye movement
    if (pupilRef.current) {
      pupilRef.current.position.x = Math.sin(t * 0.7) * 0.015 + config.eyeOffsetX;
      pupilRef.current.position.y = Math.cos(t * 0.5) * 0.008;
    }
  });

  const browAngle = mirrorBrow ? -config.browAngle : config.browAngle;

  return (
    <group ref={eyeRef} position={position}>
      {/* Eye white */}
      <mesh scale={[1, config.eyeScaleY, 0.6]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* Pupil */}
      <mesh ref={pupilRef} position={[0, 0, 0.055]} scale={[1, config.eyeScaleY, 1]}>
        <sphereGeometry args={[0.048, 12, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Eye glint */}
      <mesh position={[0.025, 0.025, 0.08]} scale={[1, config.eyeScaleY, 1]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      {/* Brow */}
      <mesh
        position={[0, config.browY, 0.04]}
        rotation={[0, 0, browAngle]}
        scale={[1, 1, 0.5]}
      >
        <boxGeometry args={[0.12, 0.022, 0.02]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Mouth ─── */
function Mouth({ config }: { config: ExprConfig }) {
  const ref = useRef<THREE.Mesh>(null);

  return (
    <group position={[0, -0.18, 0.38]}>
      <mesh ref={ref} scale={[config.mouthWidth * 3, config.mouthHeight * 3, 0.5]}>
        <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial
          color={config.mouthCurve > 0 ? "#cc3300" : "#993322"}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ─── Blush cheeks ─── */
function Cheeks({ opacity }: { opacity: number }) {
  if (opacity < 0.05) return null;
  return (
    <group>
      <mesh position={[-0.22, -0.08, 0.32]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ff6b6b" transparent opacity={opacity * 0.4} roughness={0.8} />
      </mesh>
      <mesh position={[0.22, -0.08, 0.32]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ff6b6b" transparent opacity={opacity * 0.4} roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Feet ─── */
function Feet() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const [left, right] = ref.current.children;
    left.rotation.x = Math.sin(t * 2) * 0.15;
    right.rotation.x = Math.sin(t * 2 + Math.PI) * 0.15;
  });

  return (
    <group ref={ref} position={[0, -0.58, 0.05]}>
      <mesh position={[-0.1, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.08, 6, 12]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.08, 6, 12]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Main 3D Character ─── */
function FireCharacter({ expression, hovered }: { expression: Expression; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentConfig = useRef<ExprConfig>(EXPRESSIONS.happy);

  const targetConfig = EXPRESSIONS[expression];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Smooth lerp to target expression
    currentConfig.current = lerpConfig(currentConfig.current, targetConfig, 0.06);

    // Body breathing / idle motion
    const cfg = currentConfig.current;
    groupRef.current.scale.set(
      cfg.bodySquashX + Math.sin(t * 1.5) * 0.02,
      cfg.bodySquashY + Math.cos(t * 1.8) * 0.02,
      1 + Math.sin(t * 1.3) * 0.01
    );
    groupRef.current.rotation.z = cfg.tiltZ + Math.sin(t * 0.8) * 0.03;

    // Subtle wobble on hover
    if (hovered) {
      groupRef.current.rotation.y = Math.sin(t * 3) * 0.12;
    } else {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.04;
    }
  });

  const cfg = currentConfig.current;

  return (
    <group ref={groupRef}>
      {/* Main body - rounded flame shape */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial
          color="#ffaa33"
          emissive="#ff6600"
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Inner glow layer */}
      <mesh position={[0, -0.02, 0.05]}>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshStandardMaterial
          color="#ffcc66"
          emissive="#ff8800"
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Flame tips */}
      <FlameTips intensity={cfg.flameIntensity} />

      {/* Eyes */}
      <Eye position={[-0.13, 0.04, 0.35]} config={cfg} />
      <Eye position={[0.13, 0.04, 0.35]} config={cfg} mirrorBrow />

      {/* Mouth */}
      <Mouth config={cfg} />

      {/* Blush cheeks */}
      <Cheeks opacity={cfg.blush} />

      {/* Feet */}
      <Feet />

      {/* Embers */}
      <Embers intensity={cfg.flameIntensity} />

      {/* Side flame wisps */}
      <mesh position={[-0.38, 0.1, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.06, 0.22, 6]} />
        <meshStandardMaterial color="#ffbb44" emissive="#ff7700" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.38, 0.1, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.06, 0.22, 6]} />
        <meshStandardMaterial color="#ffbb44" emissive="#ff7700" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Wrapper ─── */
export default function HushhBot({ size = 88, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [exprIdx, setExprIdx] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  // Cycle expressions every 7s
  useEffect(() => {
    const iv = setInterval(() => {
      setExprIdx((p) => (p + 1) % EXPR_CYCLE.length);
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  const expression: Expression = useMemo(() => {
    if (hovered) return "excited";
    if (state === "thinking") return "curious";
    if (state === "error") return "worried";
    if (state === "success") return "happy";
    return EXPR_CYCLE[exprIdx];
  }, [hovered, state, exprIdx]);

  const canvasSize = size * 1.6;

  return (
    <div
      style={{
        width: canvasSize,
        height: canvasSize,
        cursor: "pointer",
        WebkitTouchCallout: "none",
        userSelect: "none",
      }}
      className="relative select-none"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onEnter}
      onTouchEnd={onLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 3, 3]} intensity={1.2} color="#fff5e0" />
        <pointLight position={[-2, 1, 2]} intensity={0.5} color="#ff8844" />
        <spotLight position={[0, 4, 2]} angle={0.4} penumbra={0.6} intensity={0.8} color="#ffddaa" />

        <Float speed={2.5} rotationIntensity={0.15} floatIntensity={0.4}>
          <FireCharacter expression={expression} hovered={hovered} />
        </Float>

        <ContactShadows
          position={[0, -0.85, 0]}
          opacity={0.35}
          scale={2}
          blur={2.5}
          color="#331100"
        />

        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
