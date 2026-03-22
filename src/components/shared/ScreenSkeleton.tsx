import { motion } from "framer-motion";

/** Branded loading skeleton shown while lazy screens load */
export default function ScreenSkeleton() {
  return (
    <div className="min-h-screen bg-mesh px-5 pt-8 pb-24 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-secondary shimmer-bg" />
          <div className="h-4 w-48 rounded-md bg-secondary/60 shimmer-bg" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary shimmer-bg" />
      </div>

      {/* Filter pills skeleton */}
      <div className="flex gap-2 mb-6">
        {[80, 64, 72, 56].map((w, i) => (
          <div key={i} style={{ width: w }} className="h-8 rounded-full bg-secondary shimmer-bg" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border overflow-hidden"
          >
            <div className="aspect-[16/9] bg-secondary shimmer-bg" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded-md bg-secondary shimmer-bg" />
              <div className="h-3 w-1/2 rounded-md bg-secondary/60 shimmer-bg" />
              <div className="flex justify-between">
                <div className="h-4 w-24 rounded-md bg-secondary shimmer-bg" />
                <div className="h-4 w-16 rounded-md bg-secondary shimmer-bg" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
