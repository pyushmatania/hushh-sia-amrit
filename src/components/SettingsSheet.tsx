import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Shield, Globe, Accessibility, EyeOff, CreditCard, User, Database } from "lucide-react";
import AccountSettings from "./settings/AccountSettings";
import PaymentSettings from "./settings/PaymentSettings";
import NotificationSettings from "./settings/NotificationSettings";
import SecuritySettings from "./settings/SecuritySettings";
import LanguageSettings from "./settings/LanguageSettings";
import AccessibilitySettings from "./settings/AccessibilitySettings";
import PrivacySettings from "./settings/PrivacySettings";
import StorageSettings from "./settings/StorageSettings";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  settingType: string;
}

const settingTitles: Record<string, string> = {
  account: "Account Settings",
  payments: "Payments & Payouts",
  notifications: "Notifications",
  security: "Login & Security",
  language: "Language & Region",
  accessibility: "Accessibility",
  privacy: "Privacy",
  storage: "Storage & Data",
};

const settingIcons: Record<string, typeof Bell> = {
  account: User,
  payments: CreditCard,
  notifications: Bell,
  security: Shield,
  language: Globe,
  accessibility: Accessibility,
  privacy: EyeOff,
  storage: Database,
};

export default function SettingsSheet({ open, onClose, settingType }: SettingsSheetProps) {
  const Icon = settingIcons[settingType] || Bell;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-full md:max-h-[80vh] md:shadow-2xl md:border md:border-border"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            <div className="hidden md:flex justify-center pt-0" />
            <div className="flex items-center gap-3 px-5 py-3 md:px-8 md:py-4 border-b border-border">
              <button onClick={onClose} className="text-muted-foreground">
                <X size={22} />
              </button>
              <Icon size={18} className="text-primary" />
              <h2 className="text-base font-bold text-foreground">{settingTitles[settingType] || "Settings"}</h2>
            </div>

            <div className="px-5 py-4 pb-8">
              {settingType === "account" && <AccountSettings />}
              {settingType === "payments" && <PaymentSettings />}
              {settingType === "notifications" && <NotificationSettings />}
              {settingType === "security" && <SecuritySettings />}
              {settingType === "language" && <LanguageSettings />}
              {settingType === "accessibility" && <AccessibilitySettings />}
              {settingType === "privacy" && <PrivacySettings />}
              {settingType === "storage" && <StorageSettings />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
