import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { type Property } from "@/data/properties";

import icon3dPickleball from "@/assets/icon-3d-pickleball.png";
import icon3dBadminton from "@/assets/icon-3d-badminton.png";
import icon3dArchery from "@/assets/icon-3d-archery.png";
import icon3dSwimming from "@/assets/icon-3d-swimming.png";

interface SportActivity {
  name: string;
  icon: string;
  venues: { name: string; image: string; distance: string; area: string; slots: string[] }[];
}

interface SportsCardsProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

export default function SportsCards({ properties }: SportsCardsProps) {
  const sportsData: SportActivity[] = [
    {
      name: "Pickleball", icon: icon3dPickleball,
      venues: [
        { name: "Hushh Farmhouse | Court 1", image: properties[0]?.images[0] || "", distance: "0.5 km", area: "Jeypore", slots: ["6 PM", "7 PM", "8 PM"] },
        { name: "Sports Arena Jeypore", image: properties[5]?.images[0] || "", distance: "1.2 km", area: "Station Rd", slots: ["8 PM", "9 PM", "10 PM"] },
      ],
    },
    {
      name: "Badminton", icon: icon3dBadminton,
      venues: [
        { name: "Indoor Sports Hub", image: properties[1]?.images[0] || "", distance: "0.8 km", area: "Main Market", slots: ["7 PM", "8 PM", "9 PM"] },
        { name: "Club Court Jeypore", image: properties[3]?.images[0] || "", distance: "1.5 km", area: "College Rd", slots: ["6:30 PM", "7:30 PM", "8:30 PM"] },
      ],
    },
    {
      name: "Archery", icon: icon3dArchery,
      venues: [
        { name: "Adventure Zone", image: properties[2]?.images[0] || "", distance: "2 km", area: "Outskirts", slots: ["5 PM", "6 PM", "7 PM"] },
      ],
    },
    {
      name: "Swimming", icon: icon3dSwimming,
      venues: [
        { name: "Firefly Villa Pool", image: properties[0]?.images[0] || "", distance: "0.5 km", area: "Jeypore", slots: ["10 AM", "2 PM", "5 PM"] },
      ],
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4"
      style={{ scrollSnapType: "x mandatory" }}>
      {sportsData.map((sport) => (
        <div key={sport.name}
          className="shrink-0 rounded-[20px] p-5 relative overflow-hidden"
          style={{
            width: "85vw", maxWidth: "380px", scrollSnapAlign: "center",
            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06))",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-2xl font-extrabold text-foreground">{sport.name}</h3>
              <p className="text-sm text-foreground/40 mt-0.5">slots available today</p>
            </div>
            <img src={sport.icon} alt={sport.name}
              className="w-20 h-20 object-contain sport-icon-float" />
          </div>
          <div className="space-y-4">
            {sport.venues.map((venue, vi) => (
              <div key={vi}>
                <div className="flex items-center gap-3 mb-2.5">
                  <img src={venue.image} alt={venue.name}
                    className="w-12 h-12 rounded-[10px] object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate">{venue.name}</p>
                    <p className="text-[13px] text-foreground/40">{venue.distance} · {venue.area}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {venue.slots.map((slot) => (
                    <button key={slot}
                      className="rounded-full px-4 py-2 text-sm text-foreground font-medium active:scale-95 transition-transform hover:bg-white/[0.08]"
                      style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <button className="flex items-center gap-1.5 rounded-full px-6 py-2.5 text-sm text-foreground/50 font-medium"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              View all venues <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
