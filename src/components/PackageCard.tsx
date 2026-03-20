import { motion } from "framer-motion";
import { toast } from "sonner";
import type { ExperiencePackage } from "@/data/properties";

export default function PackageCard({ pkg, index }: { pkg: ExperiencePackage; index: number }) {
  const handleBook = () => {
    toast.success(`${pkg.name} added! Redirecting to checkout…`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className="shrink-0 w-[240px] rounded-2xl overflow-hidden glass cursor-pointer"
      onClick={handleBook}
    >
      <div className="p-5 space-y-2">
        <span className="text-3xl">{pkg.emoji}</span>
        <h4 className="font-semibold text-base text-foreground">{pkg.name}</h4>
        <p className="font-bold text-lg text-gradient">₹{pkg.price.toLocaleString()}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {pkg.includes.map((item) => (
            <span key={item} className="text-[11px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full">{item}</span>
          ))}
        </div>
        <button className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold glow-sm active:scale-95 transition-transform">
          Book Now
        </button>
      </div>
    </motion.div>
  );
}
