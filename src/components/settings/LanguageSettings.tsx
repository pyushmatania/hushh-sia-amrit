import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Globe, Clock, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader, ToggleSwitch } from "./SettingRow";

export default function LanguageSettings() {
  const { toast } = useToast();
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("inr");
  const [timezone, setTimezone] = useState("ist");
  const [dateFormat, setDateFormat] = useState("dmy");
  const [autoTranslate, setAutoTranslate] = useState(true);

  const languages = [
    { id: "en", label: "English", native: "English", flag: "🇬🇧" },
    { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
    { id: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
    { id: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
    { id: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
    { id: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  ];

  const currencies = [
    { id: "inr", label: "₹ INR", desc: "Indian Rupee", symbol: "₹" },
    { id: "usd", label: "$ USD", desc: "US Dollar", symbol: "$" },
    { id: "eur", label: "€ EUR", desc: "Euro", symbol: "€" },
    { id: "gbp", label: "£ GBP", desc: "British Pound", symbol: "£" },
  ];

  const timezones = [
    { id: "ist", label: "IST (UTC+5:30)", desc: "India Standard Time" },
    { id: "utc", label: "UTC", desc: "Coordinated Universal Time" },
    { id: "est", label: "EST (UTC-5)", desc: "Eastern Standard Time" },
  ];

  const dateFormats = [
    { id: "dmy", label: "DD/MM/YYYY", example: "24/03/2026" },
    { id: "mdy", label: "MM/DD/YYYY", example: "03/24/2026" },
    { id: "ymd", label: "YYYY-MM-DD", example: "2026-03-24" },
  ];

  const handleLangChange = (id: string) => {
    setLang(id);
    const l = languages.find(x => x.id === id);
    toast({ title: `Language set to ${l?.label}`, description: id === "en" ? "App is in English" : "Translation will apply across the app" });
  };

  return (
    <div className="space-y-5">
      {/* Language */}
      <div>
        <SectionHeader title="App Language" />
        <div className="space-y-1.5">
          {languages.map((l, i) => (
            <motion.button
              key={l.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleLangChange(l.id)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                lang === l.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{l.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.native}</p>
                </div>
              </div>
              {lang === l.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Auto translate */}
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-3">
          <Globe size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Auto-translate reviews</p>
            <p className="text-xs text-muted-foreground">Translate property reviews to your language</p>
          </div>
        </div>
        <ToggleSwitch enabled={autoTranslate} onChange={setAutoTranslate} />
      </div>

      {/* Currency */}
      <div>
        <SectionHeader title="Currency" />
        <div className="space-y-1.5">
          {currencies.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => { setCurrency(c.id); toast({ title: `Currency set to ${c.label}` }); }}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                currency === c.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-bold text-foreground">{c.symbol}</div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
              {currency === c.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div>
        <SectionHeader title="Timezone" />
        <div className="space-y-1.5">
          {timezones.map((tz, i) => (
            <motion.button
              key={tz.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => { setTimezone(tz.id); toast({ title: `Timezone set to ${tz.label}` }); }}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                timezone === tz.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{tz.label}</p>
                  <p className="text-xs text-muted-foreground">{tz.desc}</p>
                </div>
              </div>
              {timezone === tz.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date format */}
      <div>
        <SectionHeader title="Date Format" />
        <div className="space-y-1.5">
          {dateFormats.map((df, i) => (
            <motion.button
              key={df.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => { setDateFormat(df.id); toast({ title: `Date format: ${df.label}` }); }}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                dateFormat === df.id ? "bg-primary/10 border border-primary/30" : "border border-transparent hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{df.label}</p>
                  <p className="text-xs text-muted-foreground">e.g. {df.example}</p>
                </div>
              </div>
              {dateFormat === df.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
