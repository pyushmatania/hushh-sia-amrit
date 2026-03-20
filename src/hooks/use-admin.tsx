import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type AppRole = "super_admin" | "ops_manager" | "host" | "staff";

export function useAdmin() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRoles([]); setLoading(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRoles((data ?? []).map((r: any) => r.role as AppRole));
        setLoading(false);
      });
  }, [user]);

  const isAdmin = roles.includes("super_admin");
  const isOps = roles.includes("ops_manager");
  const isHost = roles.includes("host");
  const isStaff = roles.includes("staff");
  const hasAdminAccess = isAdmin || isOps;

  return { roles, loading, isAdmin, isOps, isHost, isStaff, hasAdminAccess };
}
