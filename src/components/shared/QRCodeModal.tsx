import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Clock, Users, Ticket } from "lucide-react";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import BookingQRCode from "./BookingQRCode";
import { format } from "date-fns";

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyName?: string;
  propertyImage?: string;
  propertyLocation?: string;
  date?: string;
  slotLabel?: string;
  guests?: number;
  total?: number;
}

function FloatingCard() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.04;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef}>
        <RoundedBox args={[3.6, 3.6, 0.06]} radius={0.18} smoothness={4}>
          <meshPhysicalMaterial color="#1a1a2e" roughness={0.2} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.15} />
        </RoundedBox>
        <RoundedBox args={[3.7, 3.7, 0.04]} radius={0.19} smoothness={4} position={[0, 0, -0.015]}>
          <meshStandardMaterial color="#d4a853" roughness={0.25} metalness={0.8} />
        </RoundedBox>
        <RoundedBox args={[3.8, 3.8, 0.03]} radius={0.2} smoothness={4} position={[0, 0, -0.03]}>
          <meshStandardMaterial color="#9333ea" roughness={0.3} metalness={0.6} transparent opacity={0.5} />
        </RoundedBox>
      </group>
    </Float>
  );
}

export default function QRCodeModal({
  open,
  onClose,
  bookingId,
  propertyName,
  propertyImage,
  propertyLocation,
  date,
  slotLabel,
  guests,
  total,
}: QRCodeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="qr-3d-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto"
          onClick={onClose}
        >
          {/* Dark gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 50% 30%, rgba(147,51,234,0.15) 0%, rgba(0,0,0,0.95) 70%)",
            }}
          />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-12 right-5 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={20} className="text-white" />
          </button>

          {/* 3D Canvas */}
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <ErrorBoundary fallbackTitle="3D unavailable">
              <Suspense fallback={null}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[4, 4, 4]} intensity={0.7} color="#d4a853" />
                  <pointLight position={[-4, -2, 3]} intensity={0.4} color="#9333ea" />
                  <spotLight position={[0, 6, 4]} angle={0.25} penumbra={1} intensity={0.5} />
                  <FloatingCard />
                  <Environment preset="night" />
                </Canvas>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotateY: -60 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.6, opacity: 0, rotateY: 60 }}
            transition={{ type: "spring", damping: 22, stiffness: 180 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10"
            style={{ perspective: "1200px" }}
          >
            <BookingQRCode bookingId={bookingId} size={180} />
          </motion.div>

          {/* Booking info */}
          {propertyName && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 mt-5 mx-6 w-full max-w-sm rounded-2xl p-4 space-y-3"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-3">
                {propertyImage && (
                  <img
                    src={propertyImage}
                    alt={propertyName}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/15"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{propertyName}</h4>
                  {propertyLocation && (
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <MapPin size={10} /> {propertyLocation}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {date && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Calendar size={12} className="text-[#d4a853]" />
                    {format(new Date(date), "d MMM yyyy")}
                  </div>
                )}
                {slotLabel && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Clock size={12} className="text-[#9333ea]" />
                    {slotLabel}
                  </div>
                )}
                {guests != null && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Users size={12} className="text-[#d4a853]" />
                    {guests} guests
                  </div>
                )}
                {total != null && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Ticket size={12} className="text-[#9333ea]" />
                    ₹{total.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-white/8 text-center">
                <span className="text-[10px] font-mono text-white/30 tracking-wider">{bookingId}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
