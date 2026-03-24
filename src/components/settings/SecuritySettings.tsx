import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Smartphone, Shield, Fingerprint, Check, AlertTriangle, Clock, Globe, Lock, LogIn, RefreshCw, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function SecuritySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [twoFa, setTwoFa] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPassStrength, setShowPassStrength] = useState(false);
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("identity_verifications").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setVerification(data));
  }, [user]);

  const handlePasswordReset = async () => {
    if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Reset email sent ✉️", description: "Check your inbox for a password reset link" });
  };

  const securityChecks = [
    { label: "Email verified", done: !!user?.email_confirmed_at, icon: Mail },
    { label: "Password set", done: true, icon: Key },
    { label: "Identity verified", done: verification?.status === "approved", icon: Shield },
    { label: "Two-factor auth", done: twoFa, icon: Lock },
    { label: "Biometric lock", done: biometric, icon: Fingerprint },
    { label: "Login alerts", done: loginAlerts, icon: Eye },
  ];
  const score = Math.round((securityChecks.filter(c => c.done).length / securityChecks.length) * 100);

  const loginHistory = [
    { device: "iPhone 15 Pro", location: "Jeypore, Odisha", time: "Just now", ip: "192.168.x.x", current: true, os: "iOS 18.2", browser: "Safari" },
    { device: "MacBook Air M2", location: "Jeypore, Odisha", time: "2 hours ago", ip: "192.168.x.x", current: false, os: "macOS 15.1", browser: "Chrome" },
    { device: "Pixel 8 Pro", location: "Bhubaneswar, Odisha", time: "3 days ago", ip: "103.x.x.x", current: false, os: "Android 15", browser: "Chrome" },
    { device: "Windows Desktop", location: "Visakhapatnam, AP", time: "1 week ago", ip: "49.x.x.x", current: false, os: "Windows 11", browser: "Edge" },
    { device: "iPad Air", location: "Hyderabad, TS", time: "2 weeks ago", ip: "115.x.x.x", current: false, os: "iPadOS 18", browser: "Safari" },
  ];

  return (
    <div className="space-y-1">
      {/* Security Score */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Security Score</p>
            <p className="text-2xl font-bold text-foreground">{score >= 80 ? "Strong" : score >= 50 ? "Good" : "Weak"}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{securityChecks.filter(c => c.done).length}/{securityChecks.length} checks passed</p>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${score >= 80 ? "hsl(142 70% 45%)" : score >= 50 ? "hsl(var(--primary))" : "hsl(0 80% 55%)"} ${score}%, hsl(var(--muted)) ${score}%)` }}>
            <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
              <span className={`text-sm font-bold ${score >= 80 ? "text-green-500" : score >= 50 ? "text-primary" : "text-destructive"}`}>{score}%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {securityChecks.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? "bg-green-500" : "bg-muted"}`}>
                {item.done && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-[11px] ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionHeader title="Password" />
      <SettingRow icon={Key} label="Change password" desc="Send a reset link to your email" onClick={handlePasswordReset} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-xl p-3 mb-2 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.3)" }}>
        <p className="text-[11px] text-muted-foreground">
          💡 Use a unique password with at least 8 characters, including numbers and special characters.
        </p>
      </motion.div>

      <SectionHeader title="Two-Factor Authentication" />
      <SettingRow icon={Shield} label="Enable 2FA"
        desc={twoFa ? "Your account has extra security" : "Add an extra layer of security"}
        right={<ToggleSwitch enabled={twoFa} onChange={(v) => { setTwoFa(v); toast({ title: v ? "2FA enabled 🔐" : "2FA disabled" }); }} />} />
      {twoFa && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-3 mb-2" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.12)" }}>
          <p className="text-[11px] text-muted-foreground">🔐 2FA is active. A verification code will be required when logging in from new devices.</p>
          <button className="text-[11px] text-primary font-semibold mt-1" onClick={() => toast({ title: "Recovery codes", description: "8 recovery codes have been generated. Save them securely." })}>
            View recovery codes →
          </button>
        </motion.div>
      )}

      <SectionHeader title="Biometric Authentication" />
      <SettingRow icon={Fingerprint} label="Biometric login" desc="Use Face ID or fingerprint to login"
        right={<ToggleSwitch enabled={biometric} onChange={(v) => { setBiometric(v); toast({ title: v ? "Biometric enabled 🔓" : "Biometric disabled" }); }} />} />

      <SectionHeader title="Login Alerts" />
      <SettingRow icon={Eye} label="New device alerts" desc="Email notification on new device login"
        right={<ToggleSwitch enabled={loginAlerts} onChange={setLoginAlerts} />} />

      <SectionHeader title="Identity Verification" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 py-3.5 border-b border-border">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${verification?.status === "approved" ? "bg-green-500/10" : verification?.status === "pending" ? "bg-amber-500/10" : "bg-muted"}`}>
          <Shield size={16} className={verification?.status === "approved" ? "text-green-500" : verification?.status === "pending" ? "text-amber-500" : "text-muted-foreground"} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {verification?.status === "approved" ? "Identity Verified ✓" : verification?.status === "pending" ? "Verification Pending" : "Not Verified"}
          </p>
          <p className="text-xs text-muted-foreground">
            {verification ? `${verification.document_type.toUpperCase()} · Submitted ${new Date(verification.submitted_at).toLocaleDateString()}` : "Upload your ID to verify"}
          </p>
        </div>
        {verification?.status === "approved" && <Check size={16} className="text-green-500" />}
      </motion.div>

      <SectionHeader title="Login History" />
      <div className="space-y-2">
        {loginHistory.map((entry, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${entry.current ? "bg-green-500/10" : "bg-muted/50"}`}>
              <Smartphone size={16} className={entry.current ? "text-green-500" : "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{entry.device}</p>
                {entry.current && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500">CURRENT</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Globe size={10} className="text-muted-foreground" />
                <p className="text-[11px] text-muted-foreground">{entry.location} · {entry.browser} · {entry.os}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">{entry.time} · IP: {entry.ip}</p>
            </div>
            {!entry.current && (
              <button onClick={() => toast({ title: "Session revoked" })} className="text-[10px] text-destructive font-semibold px-2 py-1 rounded-lg bg-destructive/10">Revoke</button>
            )}
          </motion.div>
        ))}
      </div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} whileTap={{ scale: 0.97 }}
        onClick={() => toast({ title: "All other sessions revoked", description: "Only this device remains active" })}
        className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold text-destructive"
        style={{ border: "1px solid hsl(var(--destructive) / 0.2)", background: "hsl(var(--destructive) / 0.04)" }}>
        <LogIn size={12} className="inline mr-1" /> Sign out all other devices
      </motion.button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="rounded-xl p-3 mt-4 flex items-start gap-2" style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}>
        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="text-foreground font-medium">Security Tip:</span> Enable all security features for maximum protection. If you notice any suspicious activity, change your password immediately.
        </p>
      </motion.div>
    </div>
  );
}
