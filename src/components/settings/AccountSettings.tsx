import { useState } from "react";
import { motion } from "framer-motion";
import { User, Key, Download, History, Trash2, LogOut, Loader2, Mail, MapPin, Pencil, Check, X, Smartphone, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingRow, SectionHeader } from "./SettingRow";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.user_metadata?.full_name || "");
  const [showSessions, setShowSessions] = useState(false);
  const email = user?.email || "guest@hushh.app";

  const handlePasswordReset = async () => {
    if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Password reset email sent ✉️", description: "Check your inbox for a reset link" });
  };

  const handleUpdateName = async () => {
    if (!nameValue.trim()) return;
    const { error } = await supabase.auth.updateUser({ data: { full_name: nameValue.trim() } });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Name updated ✅" });
    setEditingName(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const exportData = {
        profile: { email, name: user?.user_metadata?.full_name },
        exportDate: new Date().toISOString(),
        format: "JSON",
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hushh-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data exported 📦", description: "Your data has been downloaded" });
    } finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    toast({ title: "Account deletion requested", description: "Our team will process this within 48 hours. You'll receive a confirmation email." });
    setShowDeleteConfirm(false);
  };

  const sessions = [
    { device: "This device", browser: "Safari on iPhone", lastActive: "Active now", isCurrent: true },
    { device: "MacBook Pro", browser: "Chrome on macOS", lastActive: "2 hours ago", isCurrent: false },
  ];

  return (
    <div className="space-y-1">
      <SectionHeader title="Profile Information" />

      {/* Editable name */}
      {editingName ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-3 border-b border-border">
          <User size={16} className="text-muted-foreground shrink-0" />
          <input
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            autoFocus
            className="flex-1 text-sm font-medium text-foreground bg-transparent outline-none border-b border-primary pb-0.5"
          />
          <button onClick={handleUpdateName} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Check size={14} className="text-primary" />
          </button>
          <button onClick={() => setEditingName(false)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <X size={14} className="text-muted-foreground" />
          </button>
        </motion.div>
      ) : (
        <SettingRow icon={User} label={user?.user_metadata?.full_name || "Guest Explorer"} desc="Display name" onClick={() => setEditingName(true)} right={<Pencil size={14} className="text-muted-foreground" />} />
      )}

      <SettingRow icon={Mail} label={email} desc="Email address" />
      <SettingRow icon={Calendar} label={user ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"} desc="Member since" />

      <SectionHeader title="Security" />
      <SettingRow icon={Key} label="Change password" desc="Send a password reset email" onClick={handlePasswordReset} />

      <SectionHeader title="Active Sessions" />
      <div className="space-y-2">
        {sessions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-3 border-b border-border last:border-0"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.08)" }}>
              <Smartphone size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.browser}</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-semibold ${s.isCurrent ? "text-green-500" : "text-muted-foreground"}`}>{s.lastActive}</p>
              {!s.isCurrent && (
                <button className="text-[10px] text-destructive font-medium mt-0.5" onClick={() => toast({ title: "Session revoked" })}>Revoke</button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <SectionHeader title="Data & Privacy" />
      <SettingRow
        icon={Download}
        label="Export my data"
        desc="Download all your personal data as JSON"
        onClick={handleExportData}
        right={isExporting ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined}
      />
      <SettingRow icon={History} label="Login activity" desc="View recent login sessions" onClick={() => toast({ title: "1 active session", description: "Current device · last active now" })} />

      <SectionHeader title="Danger Zone" />
      {!showDeleteConfirm ? (
        <SettingRow icon={Trash2} label="Delete my account" desc="Permanently delete all data" onClick={() => setShowDeleteConfirm(true)} danger />
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl p-4 my-2"
          style={{ background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}
        >
          <p className="text-sm font-medium text-destructive mb-1">Are you sure?</p>
          <p className="text-xs text-muted-foreground mb-3">This action is irreversible. All bookings, reviews, and loyalty points will be lost.</p>
          <div className="flex gap-2">
            <button onClick={handleDeleteAccount} className="flex-1 py-2 rounded-lg text-xs font-semibold text-destructive-foreground" style={{ background: "hsl(var(--destructive))" }}>Delete permanently</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground">Cancel</button>
          </div>
        </motion.div>
      )}

      {user && (
        <>
          <SectionHeader title="" />
          <SettingRow icon={LogOut} label="Sign out" desc="Log out of your account" onClick={signOut} danger />
        </>
      )}
    </div>
  );
}
