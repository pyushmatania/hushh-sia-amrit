import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { month, year } = await req.json();
    const monthStr = month || new Date().toLocaleString("en", { month: "long" });
    const yearNum = year || new Date().getFullYear();
    const monthIdx = new Date(`${monthStr} 1, ${yearNum}`).getMonth();
    const datePrefix = `${yearNum}-${String(monthIdx + 1).padStart(2, "0")}`;

    // Fetch data
    const [staffRes, attendanceRes, salaryRes, leavesRes] = await Promise.all([
      supabase.from("staff_members").select("*").order("name"),
      supabase.from("staff_attendance").select("*").gte("date", `${datePrefix}-01`).lte("date", `${datePrefix}-31`),
      supabase.from("staff_salary_payments").select("*").eq("month", monthStr).eq("year", yearNum),
      supabase.from("staff_leaves").select("*").gte("start_date", `${datePrefix}-01`).lte("start_date", `${datePrefix}-31`),
    ]);

    const staff = staffRes.data || [];
    const attendance = attendanceRes.data || [];
    const salaries = salaryRes.data || [];
    const leaves = leavesRes.data || [];

    // Build report data
    const activeStaff = staff.filter((s: any) => s.status === "active");
    const departments = [...new Set(staff.map((s: any) => s.department))];

    const staffReports = activeStaff.map((s: any) => {
      const records = attendance.filter((a: any) => a.staff_id === s.id);
      const presentDays = records.filter((a: any) => a.status === "present").length;
      const halfDays = records.filter((a: any) => a.status === "half_day").length;
      const absentDays = records.filter((a: any) => a.status === "absent").length;
      const leaveDays = records.filter((a: any) => a.status === "on_leave").length;
      const totalHours = records.reduce((sum: number, a: any) => sum + (Number(a.hours_worked) || 0), 0);
      const overtimeHours = records.reduce((sum: number, a: any) => sum + (Number(a.overtime_hours) || 0), 0);
      const mealsConsumed = records.filter((a: any) => a.meal_provided).length;
      const payment = salaries.find((p: any) => p.staff_id === s.id);
      const staffLeaves = leaves.filter((l: any) => l.staff_id === s.id);
      const attendanceRate = records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0;

      return {
        name: s.name, role: s.role, department: s.department, salary: Number(s.salary),
        presentDays, halfDays, absentDays, leaveDays, totalHours, overtimeHours,
        mealsConsumed, attendanceRate,
        payment: payment ? { amount: Number(payment.amount), bonus: Number(payment.bonus || 0), deductions: Number(payment.deductions || 0), status: payment.status } : null,
        leavesTaken: staffLeaves.filter((l: any) => l.status === "approved").length,
        leavesPending: staffLeaves.filter((l: any) => l.status === "pending").length,
      };
    });

    const deptBreakdown = departments.map((d: any) => {
      const deptStaff = staffReports.filter((s: any) => s.department === d);
      return {
        name: d,
        count: deptStaff.length,
        totalSalary: deptStaff.reduce((sum: number, s: any) => sum + s.salary, 0),
        avgAttendance: deptStaff.length ? Math.round(deptStaff.reduce((sum: number, s: any) => sum + s.attendanceRate, 0) / deptStaff.length) : 0,
        totalMeals: deptStaff.reduce((sum: number, s: any) => sum + s.mealsConsumed, 0),
        totalOT: deptStaff.reduce((sum: number, s: any) => sum + s.overtimeHours, 0),
      };
    });

    const totalPayroll = staffReports.reduce((sum, s) => sum + s.salary, 0);
    const totalPaid = salaries.filter((s: any) => s.status === "paid").reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    const totalPending = salaries.filter((s: any) => s.status === "pending").reduce((sum: number, s: any) => sum + Number(s.amount), 0);
    const totalMeals = staffReports.reduce((sum, s) => sum + s.mealsConsumed, 0);
    const totalOT = staffReports.reduce((sum, s) => sum + s.overtimeHours, 0);
    const avgAttendance = staffReports.length ? Math.round(staffReports.reduce((sum, s) => sum + s.attendanceRate, 0) / staffReports.length) : 0;

    // Generate PDF content as HTML that will be returned as structured data
    // The client will use this data to generate the PDF
    const report = {
      title: `Staff Report — ${monthStr} ${yearNum}`,
      generated: new Date().toISOString(),
      summary: {
        totalStaff: activeStaff.length,
        totalPayroll,
        totalPaid,
        totalPending,
        avgAttendance,
        totalMeals,
        totalOT,
      },
      departments: deptBreakdown,
      staff: staffReports,
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
