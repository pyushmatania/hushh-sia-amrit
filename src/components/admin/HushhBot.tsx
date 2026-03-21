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

/* ─── Flame body (teardrop shape via lathe) ─── */
function FlameBody({ color, emissive, emissiveIntensity, opacity = 1, scale = 1 }: {
  color: string; emissive: string; emissiveIntensity: number; opacity?: number; scale?: number;
}) {
  const geo = useMemo(() => {
    // Create teardrop/flame profile curve
    const points: THREE.Vector2[] = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Bottom is round, top tapers to a point
      let radius: number;
      if (t < 0.6) {
        // Lower bulbous part
        radius = Math.sin(t / 0.6 * Math.PI) * 0.42;
      } else {
        // Upper taper (flame tip)
        const tt = (t - 0.6) / 0.4;
        radius = Math.sin(Math.PI) * 0.42 * 0 + Math.cos(tt * Math.PI * 0.5) * 0.42 * (1 - tt * 0.7);
        radius = (1 - tt) * 0.42 * Math.cos(tt * 0.3);
      }
      const y = t * 1.4 - 0.5; // -0.5 to 0.9
      points.push(new THREE.Vector2(Math.max(radius, 0.01), y));
    }
    return new THREE.LatheGeometry(points, 32);
  }, []);

  return (
    <mesh geometry={geo} scale={scale}>
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.25}
        metalness={0.05}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─── Animated flame tip ─── */
function FlameTip({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      child.position.y = 0.88 + Math.sin(t * 3.5 + i * 1.5) * 0.05 * intensity;
      child.rotation.z = Math.sin(t * 2.8 + i * 0.9) * 0.2 * intensity;
      const s = 0.85 + Math.sin(t * 4.2 + i * 1.1) * 0.15 * intensity;
      child.scale.set(s, s + Math.sin(t * 3 + i) * 0.1, s);
    });
  });

  return (
    <group ref={ref}>
      {[0, 1, 2].map((i) => {
        const xOff = (i - 1) * 0.06;
        const h = i === 1 ? 0.35 : 0.22;
        return (
          <mesh key={i} position={[xOff, 0.88, 0]}>
            <coneGeometry args={[0.08 - i * 0.01, h, 8]} />
            <meshStandardMaterial
              color={i === 1 ? "#ff8800" : "#ffaa22"}
              emissive={i === 1 ? "#ff4400" : "#ff6600"}
              emissiveIntensity={0.7 * intensity}
              transparent
              opacity={0.9}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ─── Embers ─── */
function Embers({ intensity }: { intensity: number }) {
  const ref = useRef<THREE.Group>(null);
  const particles = useMemo(() =>
    Array.from({ length: 12 }, () => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.0,
      radius: 0.2 + Math.random() * 0.3,
      size: 0.012 + Math.random() * 0.015,
    })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const p = particles[i];
      const phase = ((t * p.speed + p.offset) % 2.5) / 2.5;
      child.position.x = Math.sin(t * 0.9 + p.offset) * p.radius;
      child.position.y = -0.3 + phase * 2.0;
      child.position.z = Math.cos(t * 0.7 + p.offset) * p.radius * 0.4;
      (child as THREE.Mesh).scale.setScalar(p.size * (1 - phase) * 50 * intensity);
    });
  });

  return (
    <group ref={ref}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial color="#ffaa33" emissive="#ff6600" emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── 3D Eye with pupil tracking ─── */
function Eye3D({ position, scaleY, pupilOffsetX, browAngle, browY, mirrorBrow }: {
  position: [number, number, number];
  scaleY: number;
  pupilOffsetX: number;
  browAngle: number;
  browY: number;
  mirrorBrow?: boolean;
}) {
  const pupilRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!pupilRef.current) return;
    const t = clock.getElapsedTime();
    pupilRef.current.position.x = Math.sin(t * 0.8) * 0.02 + pupilOffsetX;
    pupilRef.current.position.y = Math.cos(t * 0.6) * 0.01;
  });

  const bAngle = mirrorBrow ? -browAngle : browAngle;

  return (
    <group position={position}>
      {/* White of eye */}
      <mesh scale={[1, scaleY, 0.7]}>
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} />
      </mesh>
      {/* Iris */}
      <mesh ref={pupilRef} position={[0, 0, 0.065]} scale={[1, scaleY, 1]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.1} metalness={0.15} />
      </mesh>
      {/* Glint */}
      <mesh position={[0.03, 0.03 * scaleY, 0.1]} scale={[1, scaleY, 1]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      {/* Brow */}
      <mesh position={[0, browY, 0.05]} rotation={[0, 0, bAngle]}>
        <boxGeometry args={[0.14, 0.025, 0.02]} />
        <meshStandardMaterial color="#cc6600" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Mouth shape ─── */
function Mouth3D({ width, height, curve }: { width: number; height: number; curve: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const w = width * 2;
    const h = height * 2;
    // Draw a smile/frown arc
    shape.moveTo(-w, 0);
    shape.quadraticCurveTo(0, curve * 8, w, 0);
    shape.quadraticCurveTo(0, -h * 2 + curve * 4, -w, 0);
    
    const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 3 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [width, height, curve]);

  return (
    <mesh geometry={geo} position={[0, -0.2, 0.38]} rotation={[0, 0, 0]}>
      <meshStandardMaterial color="#cc2200" roughness={0.4} />
    </mesh>
  );
}

/* ─── Blush cheeks ─── */
function Cheeks3D({ opacity }: { opacity: number }) {
  if (opacity < 0.05) return null;
  return (
    <group>
      {[[-0.25, -0.1, 0.33], [0.25, -0.1, 0.33]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#ff6b6b" transparent opacity={opacity * 0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Little feet ─── */
function Feet3D() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children[0].rotation.x = Math.sin(t * 2.2) * 0.12;
    ref.current.children[1].rotation.x = Math.sin(t * 2.2 + Math.PI) * 0.12;
  });

  return (
    <group ref={ref} position={[0, -0.6, 0.05]}>
      {[[-0.1, 0, 0], [0.1, 0, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <capsuleGeometry args={[0.05, 0.07, 6, 12]} />
          <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={0.25} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Expression configuration ─── */
interface ExprConfig {
  eyeScaleY: number;
  pupilOffsetX: number;
  browAngle: number;
  browY: number;
  mouthWidth: number;
  mouthHeight: number;
  mouthCurve: number;
  bodySquashY: number;
  bodySquashX: number;
  tiltZ: number;
  blush: number;
  flameIntensity: number;
}

const EXPRESSIONS: Record<Expression, ExprConfig> = {
  happy:   { eyeScaleY: 0.6,  pupilOffsetX: 0,    browAngle: 0,     browY: 0.14, mouthWidth: 0.12, mouthHeight: 0.06, mouthCurve: 0.06,  bodySquashY: 0.96, bodySquashX: 1.03, tiltZ: 0.04,  blush: 0.7, flameIntensity: 1.0 },
  curious: { eyeScaleY: 1.15, pupilOffsetX: 0.03, browAngle: 0.22,  browY: 0.16, mouthWidth: 0.05, mouthHeight: 0.04, mouthCurve: 0,     bodySquashY: 1.02, bodySquashX: 0.98, tiltZ: -0.14, blush: 0,   flameIntensity: 0.8 },
  excited: { eyeScaleY: 1.3,  pupilOffsetX: 0,    browAngle: -0.15, browY: 0.18, mouthWidth: 0.14, mouthHeight: 0.08, mouthCurve: 0.08,  bodySquashY: 1.06, bodySquashX: 1.05, tiltZ: -0.06, blush: 0.5, flameIntensity: 1.3 },
  sleepy:  { eyeScaleY: 0.18, pupilOffsetX: 0,    browAngle: 0.1,   browY: 0.09, mouthWidth: 0.04, mouthHeight: 0.03, mouthCurve: -0.01, bodySquashY: 0.93, bodySquashX: 1.01, tiltZ: 0.1,   blush: 0,   flameIntensity: 0.5 },
  worried: { eyeScaleY: 1.0,  pupilOffsetX: 0,    browAngle: 0.28,  browY: 0.11, mouthWidth: 0.07, mouthHeight: 0.03, mouthCurve: -0.04, bodySquashY: 0.97, bodySquashX: 0.97, tiltZ: 0.07,  blush: 0,   flameIntensity: 0.6 },
};

function lerpConfig(a: ExprConfig, b: ExprConfig, t: number): ExprConfig {
  const r = {} as ExprConfig;
  for (const k of Object.keys(b) as (keyof ExprConfig)[]) {
    r[k] = THREE.MathUtils.lerp(a[k], b[k], t);
  }
  return r;
}

/* ─── Main 3D Character ─── */
function FireCharacter({ expression, hovered }: { expression: Expression; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const cfg = useRef<ExprConfig>({ ...EXPRESSIONS.happy });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const target = EXPRESSIONS[expression];

    // Smooth lerp
    cfg.current = lerpConfig(cfg.current, target, 0.05);
    const c = cfg.current;

    // Body breathing
    groupRef.current.scale.set(
      c.bodySquashX + Math.sin(t * 1.6) * 0.015,
      c.bodySquashY + Math.cos(t * 1.9) * 0.015,
      1 + Math.sin(t * 1.4) * 0.008
    );
    groupRef.current.rotation.z = c.tiltZ + Math.sin(t * 0.9) * 0.025;
    groupRef.current.rotation.y = hovered
      ? Math.sin(t * 3.5) * 0.15
      : Math.sin(t * 0.6) * 0.04;
  });

  const c = cfg.current;

  return (
    <group ref={groupRef}>
      {/* Outer flame body (teardrop) */}
      <FlameBody color="#ffaa33" emissive="#ff6600" emissiveIntensity={0.35} />

      {/* Inner glow */}
      <FlameBody color="#ffcc66" emissive="#ff8800" emissiveIntensity={0.2} opacity={0.45} scale={0.88} />

      {/* Core warm center */}
      <mesh position={[0, -0.05, 0.1]}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#ffdd88" emissive="#ffaa44" emissiveIntensity={0.15} transparent opacity={0.3} roughness={0.4} />
      </mesh>

      {/* Flame tip */}
      <FlameTip intensity={c.flameIntensity} />

      {/* Face container - positioned on front of body */}
      <group position={[0, 0.05, 0]}>
        {/* Eyes */}
        <Eye3D
          position={[-0.14, 0.05, 0.36]}
          scaleY={c.eyeScaleY}
          pupilOffsetX={c.pupilOffsetX}
          browAngle={c.browAngle}
          browY={c.browY}
        />
        <Eye3D
          position={[0.14, 0.05, 0.36]}
          scaleY={c.eyeScaleY}
          pupilOffsetX={c.pupilOffsetX}
          browAngle={c.browAngle}
          browY={c.browY}
          mirrorBrow
        />

        {/* Mouth */}
        <Mouth3D width={c.mouthWidth} height={c.mouthHeight} curve={c.mouthCurve} />

        {/* Cheeks */}
        <Cheeks3D opacity={c.blush} />
      </group>

      {/* Feet */}
      <Feet3D />

      {/* Embers */}
      <Embers intensity={c.flameIntensity} />

      {/* Side flame wisps */}
      {[[-0.36, 0.15, 0, 0.45], [0.36, 0.15, 0, -0.45]].map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, rot]}>
          <coneGeometry args={[0.05, 0.18, 6]} />
          <meshStandardMaterial color="#ffbb44" emissive="#ff7700" emissiveIntensity={0.5} transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Warm glow light from character */}
      <pointLight position={[0, 0.2, 0.5]} intensity={0.4} color="#ff8844" distance={2} />
    </group>
  );
}

/* ─── Wrapper ─── */
export default function HushhBot({ size = 88, state = "idle" }: HushhBotProps) {
  const [hovered, setHovered] = useState(false);
  const [exprIdx, setExprIdx] = useState(0);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

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

  const canvasSize = size * 2;

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
        camera={{ position: [0, 0.1, 2.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 3]} intensity={1.0} color="#fff5e0" />
        <pointLight position={[-2, 1, 2]} intensity={0.4} color="#ff8844" />
        <spotLight position={[0, 4, 2]} angle={0.4} penumbra={0.6} intensity={0.7} color="#ffddaa" />

        <Float speed={2.2} rotationIntensity={0.12} floatIntensity={0.35}>
          <FireCharacter expression={expression} hovered={hovered} />
        </Float>

        <ContactShadows position={[0, -0.9, 0]} opacity={0.3} scale={2.5} blur={2.5} color="#331100" />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
