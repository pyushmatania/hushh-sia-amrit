import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import AdminLayout, { type AdminPage } from "@/components/admin/AdminLayout";
import CommandCenter from "@/components/admin/CommandCenter";
import AdminCatalog from "@/components/admin/AdminCatalog";
import AdminProperties from "@/components/admin/AdminProperties";
import BookingHub from "@/components/admin/BookingHub";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminClients from "@/components/admin/AdminClients";
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
import FinanceHub from "@/components/admin/FinanceHub";
import DynamicPricing from "@/components/admin/DynamicPricing";
import AdminAchievements from "@/components/admin/AdminAchievements";
import AdminLoyaltyReferrals from "@/components/admin/AdminLoyaltyReferrals";
import HostCalendar from "@/components/admin/HostCalendar";
// BookingRequests merged into BookingHub
import AdminPropertyHistory from "@/components/admin/AdminPropertyHistory";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminStaffManagement from "@/components/admin/AdminStaffManagement";
import AdminBudgetTracker from "@/components/admin/AdminBudgetTracker";
import AuthScreen from "@/components/AuthScreen";
import { Shield, Loader2 } from "lucide-react";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminAccess, loading: roleLoading } = useAdmin();
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [pageHistory, setPageHistory] = useState<AdminPage[]>([]);
  const [skipAuth, setSkipAuth] = useState(false);
  const [historyContext, setHistoryContext] = useState<{ bookingId?: string; propertyId?: string } | null>(null);
  const [clientContext, setClientContext] = useState<{ userId?: string } | null>(null);

  const pageLabels: Record<AdminPage, string> = {
    dashboard: "Dashboard", catalog: "Catalog", properties: "Properties",
    bookings: "Booking Hub", users: "Users CRM", clients: "Clients",
    analytics: "Analytics", curations: "Curations", tags: "Tags",
    campaigns: "Campaigns", coupons: "Coupons", orders: "Live Orders",
    exports: "Exports", ai: "AI Assistant", alerts: "Smart Alerts",
    audit: "Audit Trail", earnings: "Finance Hub", pricing: "Pricing",
    achievements: "Achievements", loyalty: "Loyalty", calendar: "Calendar",
    requests: "Requests", history: "Property History", inventory: "Inventory",
    "staff-mgmt": "Staff Mgmt", budget: "Budget",
  };

  const navigateTo = (target: AdminPage, ctx?: { propertyId?: string; userId?: string; bookingId?: string }) => {
    setPageHistory(prev => [...prev, page]);
    if (ctx?.propertyId) setHistoryContext(ctx);
    if (ctx?.userId) setClientContext({ userId: ctx.userId });
    setPage(target);
  };

  const goBack = () => {
    const prev = pageHistory[pageHistory.length - 1];
    if (prev) {
      setPageHistory(h => h.slice(0, -1));
      setPage(prev);
    }
  };

  // Direct nav (sidebar click) resets history
  const directNav = (target: AdminPage) => {
    setPageHistory([]);
    setPage(target);
  };

  const breadcrumb = [
    ...pageHistory.map(p => ({ page: p, label: pageLabels[p] })),
    { page: page, label: pageLabels[page] },
  ];

  if (authLoading || roleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user && !skipAuth) {
    return (
      <div className="relative">
        <AuthScreen />
        <div className="fixed bottom-8 inset-x-0 flex justify-center z-50">
          <button
            onClick={() => setSkipAuth(true)}
            className="px-6 py-3 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition shadow-lg backdrop-blur-lg"
          >
            Skip for now →
          </button>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess && !skipAuth) {
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
      case "catalog": return <AdminCatalog />;
      case "dashboard": return <CommandCenter onNavigate={setPage} />;
      case "ai": return <AdminAI />;
      case "alerts": return <AdminAlerts onNavigate={(p) => setPage(p as AdminPage)} />;
      case "pricing": return <DynamicPricing />;
      case "properties": return <AdminProperties />;
      case "bookings": return <BookingHub onNavigate={(p, ctx) => navigateTo(p as AdminPage, ctx)} />;
      case "users": return <AdminUsers />;
      case "clients": return <AdminClients initialUserId={clientContext?.userId} onContextConsumed={() => setClientContext(null)} onBack={pageHistory.length > 0 ? goBack : undefined} />;
      case "analytics": return <AdminAnalytics />;
      case "earnings": return <FinanceHub />;
      case "curations": return <AdminCurations />;
      case "campaigns": return <AdminCampaigns />;
      case "coupons": return <AdminCoupons />;
      case "tags": return <AdminTags />;
      case "orders": return <AdminOrders />;
      case "exports": return <AdminExports />;
      case "achievements": return <AdminAchievements />;
      case "loyalty": return <AdminLoyaltyReferrals />;
      case "calendar": return <HostCalendar onNavigate={(p, ctx) => navigateTo(p as AdminPage, ctx)} />;
      case "requests": return <BookingHub onNavigate={(p, ctx) => navigateTo(p as AdminPage, ctx)} />;
      case "history": return <AdminPropertyHistory
        onNavigateToClient={(userId) => navigateTo("clients" as AdminPage, { userId })}
        initialPropertyId={historyContext?.propertyId}
        initialBookingId={historyContext?.bookingId}
        onContextConsumed={() => setHistoryContext(null)}
        onBack={pageHistory.length > 0 ? goBack : undefined}
      />;
      case "inventory": return <AdminInventory />;
      case "staff-mgmt": return <AdminStaffManagement />;
      case "budget": return <FinanceHub />;
      case "audit": return <AdminAuditLog />;
      default: return <CommandCenter onNavigate={setPage} />;
    }
  };

  return (
    <AdminLayout activePage={page} onNavigate={directNav} breadcrumb={breadcrumb}>
      {renderPage()}
    </AdminLayout>
  );
}
