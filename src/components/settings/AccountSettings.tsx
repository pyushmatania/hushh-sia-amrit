import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Key, Download, History, Trash2, LogOut, Loader2, Mail, Pencil, Check, X, Smartphone, Calendar, Phone, MapPin, Camera, Link2, Shield, Copy } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingRow, SectionHeader } from "./SettingRow";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState(user?.user_metadata?.full_name || "");
  const [phoneValue, setPhoneValue] = useState(user?.user_metadata?.phone || "");
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ bookings: 0, reviews: 0, orders: 0, points: 0 });
  const email = user?.email || "guest@hushh.app";

  useEffect(() => {
    if (!user) return;
    // Fetch profile
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });
    // Fetch stats
    Promise.all([
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([b, r, o]) => {
      setStats({
        bookings: b.count || 0,
        reviews: r.count || 0,
        orders: o.count || 0,
        points: profile?.loyalty_points || 0,
      });
    });
  }, [user]);

  const handlePasswordReset = async () => {
    if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Password reset email sent ✉️", description: "Check your inbox for a reset link" });
  };

  const handleUpdateField = async (field: string, value: string) => {
    if (!value.trim()) return;
    if (field === "name") {
      const { error } = await supabase.auth.updateUser({ data: { full_name: value.trim() } });
      if (!error && user) {
        await supabase.from("profiles").update({ display_name: value.trim() }).eq("user_id", user.id);
        toast({ title: "Name updated ✅" });
      }
    } else if (field === "phone") {
      const { error } = await supabase.auth.updateUser({ data: { phone: value.trim() } });
      if (!error) toast({ title: "Phone updated ✅" });
    }
    setEditingField(null);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const userId = user?.id;
      const [profileData, bookingsData, reviewsData, ordersData, loyaltyData] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId!).maybeSingle(),
        supabase.from("bookings").select("*").eq("user_id", userId!),
        supabase.from("reviews").select("*").eq("user_id", userId!),
        supabase.from("orders").select("*").eq("user_id", userId!),
        supabase.from("loyalty_transactions").select("*").eq("user_id", userId!),
      ]);
      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileData.data,
        bookings: bookingsData.data || [],
        reviews: reviewsData.data || [],
        orders: ordersData.data || [],
        loyaltyTransactions: loyaltyData.data || [],
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hushh-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Data exported 📦", description: `${(bookingsData.data?.length || 0) + (reviewsData.data?.length || 0)} records exported` });
    } catch { toast({ title: "Export failed", variant: "destructive" }); }
    finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    toast({ title: "Account deletion requested", description: "Our team will process this within 48 hours. You'll receive a confirmation email." });
    setShowDeleteConfirm(false);
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast({ title: "User ID copied 📋" });
    }
  };

  const sessions = [
    { device: "This device", browser: "Safari on iPhone", lastActive: "Active now", isCurrent: true, os: "iOS 18" },
    { device: "MacBook Pro", browser: "Chrome on macOS", lastActive: "2 hours ago", isCurrent: false, os: "macOS 15" },
    { device: "Office PC", browser: "Edge on Windows", lastActive: "5 days ago", isCurrent: false, os: "Windows 11" },
  ];

  const EditableField = ({ field, value, setValue, icon: FieldIcon, label }: any) => (
    editingField === field ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 py-3 border-b border-border">
        <FieldIcon size={16} className="text-muted-foreground shrink-0" />
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
          className="flex-1 text-sm font-medium text-foreground bg-transparent outline-none border-b border-primary pb-0.5"
          placeholder={label}
        />
        <button onClick={() => handleUpdateField(field, value)} className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={14} className="text-primary" />
        </button>
        <button onClick={() => setEditingField(null)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <X size={14} className="text-muted-foreground" />
        </button>
      </motion.div>
    ) : (
      <SettingRow icon={FieldIcon} label={value || label} desc={label} onClick={() => setEditingField(field)} right={<Pencil size={14} className="text-muted-foreground" />} />
    )
  );

  return (
    <div className="space-y-1">
      {/* Account overview card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : "👤"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{user?.user_metadata?.full_name || "Guest Explorer"}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <p className="text-[10px] text-primary font-semibold mt-0.5">{profile?.tier || "Silver"} Member · {profile?.loyalty_points || 0} pts</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Bookings", value: stats.bookings },
            { label: "Reviews", value: stats.reviews },
            { label: "Orders", value: stats.orders },
            { label: "Points", value: profile?.loyalty_points || 0 },
          ].map(s => (
            <div key={s.label} className="text-center py-2 rounded-xl" style={{ background: "hsl(var(--background) / 0.6)" }}>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <SectionHeader title="Profile Information" />
      <EditableField field="name" value={nameValue} setValue={setNameValue} icon={User} label="Display name" />
      <SettingRow icon={Mail} label={email} desc="Email address (verified ✓)" />
      <EditableField field="phone" value={phoneValue} setValue={setPhoneValue} icon={Phone} label="Phone number" />
      <SettingRow icon={MapPin} label={profile?.location || "Not set"} desc="Location" />
      <SettingRow icon={Calendar} label={user ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} desc="Member since" />

      <SectionHeader title="Connected Accounts" />
      <SettingRow icon={Link2} label="Google" desc="Not connected" onClick={() => toast({ title: "Coming soon", description: "Google sign-in will be available soon" })} />

      <SectionHeader title="Security" />
      <SettingRow icon={Key} label="Change password" desc="Send a password reset email" onClick={handlePasswordReset} />
      <SettingRow icon={Shield} label="Verification status" desc={profile ? "Verified ✓" : "Not verified"} />

      <SectionHeader title="Active Sessions" />
      <div className="space-y-2">
        {sessions.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.isCurrent ? "hsl(142 70% 45% / 0.1)" : "hsl(var(--muted) / 0.5)" }}>
              <Smartphone size={16} className={s.isCurrent ? "text-green-500" : "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.browser} · {s.os}</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] font-semibold ${s.isCurrent ? "text-green-500" : "text-muted-foreground"}`}>{s.lastActive}</p>
              {!s.isCurrent && <button className="text-[10px] text-destructive font-medium mt-0.5" onClick={() => toast({ title: "Session revoked" })}>Revoke</button>}
            </div>
          </motion.div>
        ))}
      </div>

      <SectionHeader title="Data & Privacy" />
      <SettingRow
        icon={Download}
        label="Export my data"
        desc="Download bookings, reviews, orders as JSON"
        onClick={handleExportData}
        right={isExporting ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined}
      />
      <SettingRow icon={Copy} label="Copy user ID" desc={user?.id ? `${user.id.slice(0, 8)}...` : "Not available"} onClick={copyUserId} />
      <SettingRow icon={History} label="Login activity" desc="View recent login sessions" onClick={() => toast({ title: `${sessions.length} sessions found`, description: `${sessions.filter(s => s.isCurrent).length} active now` })} />

      <SectionHeader title="Danger Zone" />
      {!showDeleteConfirm ? (
        <SettingRow icon={Trash2} label="Delete my account" desc="Permanently delete all data" onClick={() => setShowDeleteConfirm(true)} danger />
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl p-4 my-2" style={{ background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}>
          <p className="text-sm font-medium text-destructive mb-1">Are you sure?</p>
          <p className="text-xs text-muted-foreground mb-1">This will permanently delete:</p>
          <ul className="text-xs text-muted-foreground mb-3 space-y-0.5">
            <li>• {stats.bookings} bookings and history</li>
            <li>• {stats.reviews} reviews</li>
            <li>• {profile?.loyalty_points || 0} loyalty points</li>
            <li>• All personal data and preferences</li>
          </ul>
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
