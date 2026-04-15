import { useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import AdminLayout, { type AdminPage } from "@/components/admin/AdminLayout";
import AuthScreen from "@/components/AuthScreen";
import { Shield, Loader2 } from "lucide-react";

// Lazy-load every admin sub-page to split the 769KB mega-chunk
const CommandCenter = lazy(() => import("@/components/admin/CommandCenter"));
const AdminCatalog = lazy(() => import("@/components/admin/AdminCatalog"));
const AdminProperties = lazy(() => import("@/components/admin/AdminProperties"));
const BookingHub = lazy(() => import("@/components/admin/BookingHub"));
const AdminUsers = lazy(() => import("@/components/admin/AdminUsers"));
const AdminClients = lazy(() => import("@/components/admin/AdminClients"));
const AdminAnalytics = lazy(() => import("@/components/admin/AdminAnalytics"));
const AdminCurations = lazy(() => import("@/components/admin/AdminCurations"));
const AdminOrders = lazy(() => import("@/components/admin/AdminOrders"));
const AdminCampaigns = lazy(() => import("@/components/admin/AdminCampaigns"));
const AdminCoupons = lazy(() => import("@/components/admin/AdminCoupons"));
const AdminTags = lazy(() => import("@/components/admin/AdminTags"));
const AdminExports = lazy(() => import("@/components/admin/AdminExports"));
const AdminAI = lazy(() => import("@/components/admin/AdminAI"));
const AdminAlerts = lazy(() => import("@/components/admin/AdminAlerts"));
const BusinessIntelligence = lazy(() => import("@/components/admin/BusinessIntelligence"));
const AdminAuditLog = lazy(() => import("@/components/admin/AdminAuditLog"));
const FinanceHub = lazy(() => import("@/components/admin/FinanceHub"));
const AdminAchievements = lazy(() => import("@/components/admin/AdminAchievements"));
const AdminLoyaltyReferrals = lazy(() => import("@/components/admin/AdminLoyaltyReferrals"));
const HostCalendar = lazy(() => import("@/components/admin/HostCalendar"));
const AdminPropertyHistory = lazy(() => import("@/components/admin/AdminPropertyHistory"));
const AdminInventory = lazy(() => import("@/components/admin/AdminInventory"));
const AdminStaffManagement = lazy(() => import("@/components/admin/AdminStaffManagement"));
const AdminBudgetTracker = lazy(() => import("@/components/admin/AdminBudgetTracker"));
const AdminCheckin = lazy(() => import("@/components/admin/AdminCheckin"));
const AdminReports = lazy(() => import("@/components/admin/AdminReports"));
const AdminNotifications = lazy(() => import("@/components/admin/AdminNotifications"));
const AdminSettings = lazy(() => import("@/components/admin/AdminSettings"));
const AdminHomepage = lazy(() => import("@/components/admin/AdminHomepage"));
const AdminTelegram = lazy(() => import("@/components/admin/AdminTelegram"));

// Admin panel — v2
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { hasAdminAccess, loading: roleLoading, roles, isAdmin } = useAdmin();
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [pageHistory, setPageHistory] = useState<AdminPage[]>([]);
  const [historyContext, setHistoryContext] = useState<{ bookingId?: string; propertyId?: string } | null>(null);
  const [clientContext, setClientContext] = useState<{ userId?: string } | null>(null);

  const pageLabels: Record<AdminPage, string> = {
    dashboard: "Dashboard", catalog: "Catalog", properties: "Properties",
    bookings: "Booking Hub", users: "Users CRM", clients: "Clients",
    analytics: "Analytics", curations: "Curations", tags: "Tags",
    campaigns: "Campaigns", coupons: "Coupons", orders: "Live Orders",
    exports: "Exports", ai: "AI Assistant", alerts: "Intelligence",
    audit: "Audit Trail", earnings: "Finance Hub", pricing: "Intelligence",
    achievements: "Achievements", loyalty: "Loyalty", calendar: "Calendar",
    requests: "Requests", history: "Property History", inventory: "Inventory",
    "staff-mgmt": "Staff Mgmt", budget: "Budget",
    checkin: "Check-in", reports: "Reports", notifications: "Notifications",
    settings: "Settings", homepage: "Homepage Manager", telegram: "Telegram Bot",
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

  if (!user) {
    return (
      <div className="relative">
        <AuthScreen onBack={() => window.history.back()} />
      </div>
    );
  }

  if (!isAdmin) {
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
      case "dashboard": return <CommandCenter onNavigate={setPage} userRole={roles[0] || null} />;
      case "ai": return <AdminAI />;
      case "alerts": return <BusinessIntelligence onNavigate={(p) => setPage(p as AdminPage)} />;
      case "pricing": return <BusinessIntelligence onNavigate={(p) => setPage(p as AdminPage)} />;
      case "properties": return <AdminProperties />;
      case "bookings": return <BookingHub onNavigate={(p, ctx) => navigateTo(p as AdminPage, ctx)} />;
      case "users": return <AdminUsers />;
      case "clients": return <AdminClients initialUserId={clientContext?.userId} onContextConsumed={() => setClientContext(null)} onBack={pageHistory.length > 0 ? goBack : undefined} />;
      case "analytics": return <AdminAnalytics />;
      case "earnings": return <FinanceHub />;
      case "curations": return <AdminCurations />;
      case "campaigns": return <AdminCampaigns />;
      case "coupons": return <AdminCoupons />;
      case "tags": return <AdminHomepage />;
      case "homepage": return <AdminHomepage />;
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
      case "checkin": return <AdminCheckin />;
      case "reports": return <AdminReports />;
      case "notifications": return <AdminNotifications />;
      case "settings": return <AdminSettings />;
      case "telegram": return <AdminTelegram />;
      default: return <CommandCenter onNavigate={setPage} />;
    }
  };

  return (
    <AdminLayout activePage={page} onNavigate={directNav} breadcrumb={breadcrumb}>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={24} /></div>}>
        {renderPage()}
      </Suspense>
    </AdminLayout>
  );
}
