import { motion } from "framer-motion";

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-secondary ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export function PropertyCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="px-5"
    >
      <SkeletonPulse className="aspect-[4/3] w-full" />
      <div className="pt-3 space-y-2">
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-3/5 rounded-lg" />
          <SkeletonPulse className="h-4 w-10 rounded-lg" />
        </div>
        <SkeletonPulse className="h-3 w-4/5 rounded-lg" />
        <SkeletonPulse className="h-3 w-2/5 rounded-lg" />
        <SkeletonPulse className="h-4 w-1/3 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function PropertyCardSmallSkeleton() {
  return (
    <div className="shrink-0 w-[200px]">
      <SkeletonPulse className="aspect-[3/2] w-full" />
      <div className="pt-2 space-y-1.5">
        <SkeletonPulse className="h-3 w-4/5 rounded-lg" />
        <SkeletonPulse className="h-3 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

export function WishlistCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-border overflow-hidden"
    >
      <SkeletonPulse className="aspect-[16/9] w-full rounded-none" />
      <div className="p-4 space-y-2">
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-3/5 rounded-lg" />
          <SkeletonPulse className="h-4 w-10 rounded-lg" />
        </div>
        <SkeletonPulse className="h-3 w-2/5 rounded-lg" />
        <SkeletonPulse className="h-4 w-1/3 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function TripCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-border overflow-hidden"
    >
      <SkeletonPulse className="h-36 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <SkeletonPulse className="h-4 w-3/5 rounded-lg" />
        <SkeletonPulse className="h-3 w-4/5 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <SkeletonPulse className="h-8 w-20 rounded-full" />
          <SkeletonPulse className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <SkeletonPulse className="h-3 w-16 rounded-lg" />
            <SkeletonPulse className="h-5 w-28 rounded-lg" />
          </div>
        </div>
        <SkeletonPulse className="w-10 h-10 rounded-full" />
      </div>
      {/* Search */}
      <div className="px-5 mb-4">
        <SkeletonPulse className="h-12 w-full rounded-2xl" />
      </div>
      {/* Categories */}
      <div className="px-5 mb-4 flex gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonPulse key={i} className="w-16 h-16 rounded-2xl shrink-0" />
        ))}
      </div>
      {/* Cards */}
      <div className="space-y-6">
        <PropertyCardSkeleton index={0} />
        <PropertyCardSkeleton index={1} />
      </div>
    </div>
  );
}

export function ReviewSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <SkeletonPulse className="w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <SkeletonPulse className="h-3.5 w-24 rounded-lg" />
            <SkeletonPulse className="h-2.5 w-16 rounded-lg" />
          </div>
          <SkeletonPulse className="h-6 w-12 rounded-lg" />
        </div>
        <SkeletonPulse className="h-3 w-full rounded-lg mb-1.5" />
        <SkeletonPulse className="h-3 w-3/4 rounded-lg" />
      </div>
    </motion.div>
  );
}

export { SkeletonPulse };
