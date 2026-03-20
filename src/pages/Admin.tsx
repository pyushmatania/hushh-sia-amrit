import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import AdminLayout, { type AdminPage } from "@/components/admin/AdminLayout";
import CommandCenter from "@/components/admin/CommandCenter";
import AdminProperties from "@/components/admin/AdminProperties";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminCurations from "@/components/admin/AdminCurations";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCampaigns from "@/components/admin/AdminCampaigns";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminTags from "@/components/admin/AdminTags";
import AdminExports from "@/components/admin/AdminExports";
import AdminAI from "@/components/admin/AdminAI";
import AdminAlerts from "@/components/admin/AdminAlerts";
import AdminAuditLog from "@/components/admin/AdminAuditLog";
import HostEarnings from "@/components/admin/HostEarnings";
import DynamicPricing from "@/components/admin/DynamicPricing";
import AdminAchievements from "@/components/admin/AdminAchievements";
import AdminLoyaltyReferrals from "@/components/admin/AdminLoyaltyReferrals";
import HostCalendar from "@/components/admin/HostCalendar";
import BookingRequests from "@/components/admin/BookingRequests";
import AuthScreen from "@/components/AuthScreen";
import { Shield, Loader2 } from "lucide-react";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminAccess, loading: roleLoading } = useAdmin();
  const [page, setPage] = useState<AdminPage>("dashboard");

  if (authLoading || roleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!hasAdminAccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Shield size={32} className="text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don't have admin privileges. Contact a super admin to get access.
        </p>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <CommandCenter />;
      case "ai": return <AdminAI />;
      case "alerts": return <AdminAlerts onNavigate={(p) => setPage(p as AdminPage)} />;
      case "pricing": return <DynamicPricing />;
      case "properties": return <AdminProperties />;
      case "bookings": return <AdminBookings />;
      case "users": return <AdminUsers />;
      case "analytics": return <AdminAnalytics />;
      case "earnings": return <HostEarnings />;
      case "curations": return <AdminCurations />;
      case "campaigns": return <AdminCampaigns />;
      case "coupons": return <AdminCoupons />;
      case "tags": return <AdminTags />;
      case "orders": return <AdminOrders />;
      case "exports": return <AdminExports />;
      case "achievements": return <AdminAchievements />;
      case "loyalty": return <AdminLoyaltyReferrals />;
      case "audit": return <AdminAuditLog />;
      default: return <CommandCenter />;
    }
  };

  return (
    <AdminLayout activePage={page} onNavigate={setPage}>
      {renderPage()}
    </AdminLayout>
  );
}
