import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Globe, Clock, Calendar, MapPin, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader, ToggleSwitch } from "./SettingRow";

export default function LanguageSettings() {
  const { toast } = useToast();
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("inr");
  const [timezone, setTimezone] = useState("ist");
  const [dateFormat, setDateFormat] = useState("dmy");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [autoDetect, setAutoDetect] = useState(false);
  const [tempUnit, setTempUnit] = useState("celsius");
  const [distUnit, setDistUnit] = useState("km");

  const languages = [
    { id: "en", label: "English", native: "English", flag: "🇬🇧", completion: "100%" },
    { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳", completion: "95%" },
    { id: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳", completion: "85%" },
    { id: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳", completion: "80%" },
    { id: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳", completion: "78%" },
    { id: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳", completion: "75%" },
    { id: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", completion: "70%" },
    { id: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", completion: "65%" },
  ];

  const currencies = [
    { id: "inr", label: "₹ INR", desc: "Indian Rupee", symbol: "₹", rate: "1.00" },
    { id: "usd", label: "$ USD", desc: "US Dollar", symbol: "$", rate: "0.012" },
    { id: "eur", label: "€ EUR", desc: "Euro", symbol: "€", rate: "0.011" },
    { id: "gbp", label: "£ GBP", desc: "British Pound", symbol: "£", rate: "0.0094" },
    { id: "aed", label: "د.إ AED", desc: "UAE Dirham", symbol: "د.إ", rate: "0.044" },
  ];

  const timezones = [
    { id: "ist", label: "IST (UTC+5:30)", desc: "India Standard Time", city: "Mumbai, Delhi, Kolkata" },
    { id: "utc", label: "UTC (UTC+0)", desc: "Coordinated Universal Time", city: "London, Reykjavik" },
    { id: "est", label: "EST (UTC-5)", desc: "Eastern Standard Time", city: "New York, Toronto" },
    { id: "pst", label: "PST (UTC-8)", desc: "Pacific Standard Time", city: "Los Angeles, Seattle" },
    { id: "gst", label: "GST (UTC+4)", desc: "Gulf Standard Time", city: "Dubai, Abu Dhabi" },
  ];

  const dateFormats = [
    { id: "dmy", label: "DD/MM/YYYY", example: "24/03/2026" },
    { id: "mdy", label: "MM/DD/YYYY", example: "03/24/2026" },
    { id: "ymd", label: "YYYY-MM-DD", example: "2026-03-24" },
    { id: "relative", label: "Relative", example: "Today, Yesterday" },
  ];

  const handleLangChange = (id: string) => {
    setLang(id);
    const l = languages.find(x => x.id === id);
    toast({ title: `Language set to ${l?.label}`, description: id === "en" ? "App is in English" : `Translation ${l?.completion} complete` });
  };

  const SelectionList = ({ items, selected, onSelect, renderItem }: { items: any[]; selected: string; onSelect: (id: string) => void; renderItem: (item: any) => React.ReactNode }) => (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <motion.button key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(item.id)}
          className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${selected === item.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted/30"}`}>
          {renderItem(item)}
          {selected === item.id && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
              <Check size={12} className="text-primary-foreground" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Language */}
      <div>
        <SectionHeader title="App Language" />
        <SelectionList items={languages} selected={lang} onSelect={handleLangChange}
          renderItem={(l) => (
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">{l.flag}</span>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.native}</p>
              </div>
              {l.id !== "en" && <span className="text-[10px] text-muted-foreground">{l.completion}</span>}
            </div>
          )} />
      </div>

      {/* Translation options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <Globe size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-translate reviews</p>
              <p className="text-xs text-muted-foreground">Translate reviews to your language</p>
            </div>
          </div>
          <ToggleSwitch enabled={autoTranslate} onChange={setAutoTranslate} />
        </div>
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-detect location language</p>
              <p className="text-xs text-muted-foreground">Switch language based on region</p>
            </div>
          </div>
          <ToggleSwitch enabled={autoDetect} onChange={setAutoDetect} />
        </div>
      </div>

      {/* Currency */}
      <div>
        <SectionHeader title="Currency" />
        <SelectionList items={currencies} selected={currency} onSelect={(id) => { setCurrency(id); toast({ title: `Currency set to ${currencies.find(c => c.id === id)?.label}` }); }}
          renderItem={(c) => (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-bold text-foreground">{c.symbol}</div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
              {c.id !== "inr" && <span className="text-[10px] text-muted-foreground">1₹ = {c.rate}{c.symbol}</span>}
            </div>
          )} />
      </div>

      {/* Timezone */}
      <div>
        <SectionHeader title="Timezone" />
        <SelectionList items={timezones} selected={timezone} onSelect={(id) => { setTimezone(id); toast({ title: `Timezone set to ${timezones.find(t => t.id === id)?.label}` }); }}
          renderItem={(tz) => (
            <div className="flex items-center gap-3 flex-1">
              <Clock size={16} className="text-muted-foreground shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{tz.label}</p>
                <p className="text-xs text-muted-foreground">{tz.city}</p>
              </div>
            </div>
          )} />
      </div>

      {/* Date Format */}
      <div>
        <SectionHeader title="Date Format" />
        <SelectionList items={dateFormats} selected={dateFormat} onSelect={(id) => { setDateFormat(id); toast({ title: `Date format: ${dateFormats.find(d => d.id === id)?.label}` }); }}
          renderItem={(df) => (
            <div className="flex items-center gap-3 flex-1">
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{df.label}</p>
                <p className="text-xs text-muted-foreground">e.g. {df.example}</p>
              </div>
            </div>
          )} />
      </div>

      {/* Units */}
      <div>
        <SectionHeader title="Units" />
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <Thermometer size={16} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Temperature</p>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
            {["celsius", "fahrenheit"].map(u => (
              <button key={u} onClick={() => setTempUnit(u)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${tempUnit === u ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {u === "celsius" ? "°C" : "°F"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Distance</p>
          </div>
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/50">
            {["km", "miles"].map(u => (
              <button key={u} onClick={() => setDistUnit(u)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${distUnit === u ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {u === "km" ? "km" : "mi"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
