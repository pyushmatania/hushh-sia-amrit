import { motion } from "framer-motion";
import type { ExperiencePackage } from "@/data/properties";

export default function PackageCard({ pkg, index }: { pkg: ExperiencePackage; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileTap={{ scale: 0.97 }}
      className={`shrink-0 w-[220px] rounded-2xl p-5 bg-gradient-to-br ${pkg.gradient} border border-foreground/5 cursor-pointer`}
    >
      <span className="text-3xl">{pkg.emoji}</span>
      <h4 className="font-display text-lg font-bold mt-2 text-foreground">{pkg.name}</h4>
      <p className="text-accent font-bold text-xl mt-1">₹{pkg.price.toLocaleString()}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {pkg.includes.map((item) => (
          <span key={item} className="text-[10px] bg-background/30 px-2 py-0.5 rounded-full text-foreground/80">{item}</span>
        ))}
      </div>
      <button className="mt-4 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shimmer-btn">
        Secure the Vibe
      </button>
    </motion.div>
  );
}
