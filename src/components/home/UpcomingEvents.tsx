import type { Property } from "@/data/properties";

// Map events to property matching logic
const eventMatchers: ((p: Property) => boolean)[] = [
  (p) => p.category.includes("party") || p.propertyType === "Open Lawn",       // Holi Bash
  (p) => p.category.includes("sports") || p.propertyType === "Sports Arena",    // IPL Screening
  (p) => p.category.includes("party") || p.propertyType === "Indoor Lounge",    // Live Music
  (p) => p.category.includes("bonfire"),                                         // Full Moon Bonfire
];

const events = [
  { emoji: "🎉", name: "Holi Bash 2026", date: "Mar 28", price: "₹999/person", color: "hsl(var(--primary))" },
  { emoji: "🏏", name: "IPL Screening Night", date: "Mar 30", price: "Free with booking", color: "hsl(var(--success))" },
  { emoji: "🎵", name: "Live Music Friday", date: "Apr 4", price: "₹499/person", color: "hsl(var(--gold))" },
  { emoji: "🔥", name: "Full Moon Bonfire", date: "Apr 12", price: "₹799/person", color: "hsl(var(--destructive))" },
];

interface UpcomingEventsProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

export default function UpcomingEvents({ properties, onPropertyTap }: UpcomingEventsProps) {
  const handleBook = (index: number) => {
    const matcher = eventMatchers[index];
    const match = matcher ? properties.find(matcher) : properties[0];
    if (match) onPropertyTap(match);
  };

  return (
    <div className="px-4 space-y-3">
      {events.map((event, i) => (
        <div key={i}
          className="flex items-center gap-4 rounded-[16px] p-4 cursor-pointer active:scale-[0.97] transition-transform"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          onClick={() => handleBook(i)}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            {event.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-foreground">{event.name}</p>
            <p className="text-[13px] text-foreground/40 mt-0.5">{event.date} · {event.price}</p>
          </div>
          <button
            className="px-4 py-2 rounded-full text-sm font-semibold text-primary-foreground shrink-0 active:scale-95 transition-transform"
            style={{ background: event.color }}>
            Book
          </button>
        </div>
      ))}
    </div>
  );
}
