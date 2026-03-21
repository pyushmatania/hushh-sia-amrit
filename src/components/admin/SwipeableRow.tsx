import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function SwipeableRow({ children, onEdit, onDelete, className = "" }: SwipeableRowProps) {
  const x = useMotionValue(0);
  const [swiped, setSwiped] = useState<"none" | "left">("none");
  const containerRef = useRef<HTMLDivElement>(null);

  const ACTION_WIDTH = 140;

  const editOpacity = useTransform(x, [-ACTION_WIDTH, -60, 0], [1, 0.6, 0]);
  const deleteOpacity = useTransform(x, [-ACTION_WIDTH, -60, 0], [1, 0.6, 0]);
  const actionsX = useTransform(x, [-ACTION_WIDTH, 0], [0, ACTION_WIDTH]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      setSwiped("left");
    } else {
      setSwiped("none");
    }
  };

  const close = () => setSwiped("none");

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Action buttons behind */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-stretch z-0"
        style={{ opacity: swiped === "left" ? 1 : editOpacity }}
      >
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); close(); }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
          >
            <Pencil size={16} />
            <span className="text-[10px] font-semibold">Edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); close(); }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-[10px] font-semibold">Delete</span>
          </button>
        )}
      </motion.div>

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped === "left" ? -ACTION_WIDTH : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ x }}
        className="relative z-10 bg-card touch-pan-y"
        onClick={() => { if (swiped === "left") { close(); } }}
      >
        {children}
      </motion.div>
    </div>
  );
}
