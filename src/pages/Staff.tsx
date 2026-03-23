import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import StaffLayout, { type StaffPage } from "@/components/staff/StaffLayout";
import StaffOrders from "@/components/staff/StaffOrders";
import StaffCheckin from "@/components/staff/StaffCheckin";
import StaffTasks from "@/components/staff/StaffTasks";
import StaffInventory from "@/components/staff/StaffInventory";
import StaffAttendance from "@/components/staff/StaffAttendance";
import StaffLeaves from "@/components/staff/StaffLeaves";
import StaffSalary from "@/components/staff/StaffSalary";
import AuthScreen from "@/components/AuthScreen";
import { Loader2 } from "lucide-react";

export default function Staff() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<StaffPage>("orders");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  const renderPage = () => {
    switch (page) {
      case "orders": return <StaffOrders />;
      case "checkin": return <StaffCheckin />;
      case "tasks": return <StaffTasks />;
      case "inventory": return <StaffInventory />;
      case "attendance": return <StaffAttendance />;
      case "leaves": return <StaffLeaves />;
      case "salary": return <StaffSalary />;
      default: return <StaffOrders />;
    }
  };

  return (
    <StaffLayout activePage={page} onNavigate={setPage}>
      {renderPage()}
    </StaffLayout>
  );
}
