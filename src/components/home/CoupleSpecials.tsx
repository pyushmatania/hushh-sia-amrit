import { type Property } from "@/data/properties";

interface CoupleSpecialsProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

const couplePackages = [
  { name: "Romantic Date Night", price: "₹2,499" },
  { name: "Anniversary Special", price: "₹4,999" },
  { name: "Stargazing for Two", price: "₹1,999" },
  { name: "Candlelight Dinner", price: "₹3,499" },
];

export default function CoupleSpecials({ properties, onPropertyTap }: CoupleSpecialsProps) {
  const coupleProps = properties
    .filter((p) => p.category.includes("couples") || p.tags.some((t) => t.includes("Couple")))
    .slice(0, 4);
  const items = coupleProps.length >= 2 ? coupleProps : properties.slice(0, 4);

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4">
      {items.map((p, i) => (
        <div key={p.id}
          className="shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
          style={{ width: "280px", height: "180px", border: "1px solid rgba(255,255,255,0.08)" }}
          onClick={() => onPropertyTap(p)}>
          {p.images[0] ? (
            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center text-3xl">🏠</div>
          )}
          <div className="absolute inset-0 flex flex-col justify-end p-4"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}>
            <p className="text-base font-bold text-white">{couplePackages[i % couplePackages.length].name}</p>
            <p className="text-sm text-primary font-semibold mt-0.5">From {couplePackages[i % couplePackages.length].price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
