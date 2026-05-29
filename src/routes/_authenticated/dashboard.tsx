import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { DataPanel } from "@/components/DataPanel";
import { apiService } from "@/services/api";
import { Building2, Users, Receipt, Car, PackageCheck } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Smart Mall" }] }),
  component: DashboardPage,
});

const CHART_COLORS = ["hsl(280 80% 65%)", "hsl(245 80% 65%)", "hsl(295 75% 70%)", "hsl(155 60% 60%)", "hsl(80 70% 65%)"];

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      try {
        const response = await apiService.get("/dashboard/summary");
        return response.data.data;
      } catch (err) {
        try {
          const fallback = await apiService.get('/public/dashboard-summary');
          return fallback.data.data;
        } catch {
          throw err;
        }
      }
    },
  });

  const parkingQuery = useQuery({
    queryKey: ["dashboard-parking"],
    queryFn: async () => {
      const response = await apiService.get("/parking");
      return response.data.data || [];
    },
  });

  const employeesQuery = useQuery({
    queryKey: ["dashboard-employees"],
    queryFn: async () => {
      try {
        const response = await apiService.get("/employees?page=1&limit=500");
        const data = response.data?.data;
        return Array.isArray(data) ? data : (data?.items || []);
      } catch {
        return [];
      }
    },
  });

  const shopsQuery = useQuery({
    queryKey: ["dashboard-shops"],
    queryFn: async () => {
      try {
        const response = await apiService.get("/shops?page=1&limit=500");
        const data = response.data?.data;
        return Array.isArray(data) ? data : (data?.items || []);
      } catch {
        return [];
      }
    },
  });

  // Safe employee filter
  const employees = Array.isArray(employeesQuery.data) ? employeesQuery.data : [];
  const shops = Array.isArray(shopsQuery.data) ? shopsQuery.data : [];

  const isActiveEmployee = (emp: any) => {
    try {
      return emp?.status === "active" && (!emp?.joining_date || new Date(emp.joining_date) <= new Date());
    } catch {
      return false;
    }
  };

  const trendData = (data?.revenue_trend || []).map((row: any) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    total: Number(row.total || 0),
  }));

  const parkingRevenue = Array.isArray(parkingQuery.data)
    ? parkingQuery.data
        .filter((p: any) => p?.exit_time)
        .reduce((total: number, p: any) => total + Number(p?.fee || 0), 0)
    : 0;

  // Calculate hourly parking revenue
  const hourlyParkingData = (() => {
    try {
      const hourlyMap = new Map<string, number>();
      if (Array.isArray(parkingQuery.data)) {
        parkingQuery.data
          .filter((p: any) => p?.exit_time)
          .forEach((p: any) => {
            const hour = new Date(p.exit_time).getHours();
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            hourlyMap.set(hourStr, (hourlyMap.get(hourStr) || 0) + Number(p?.fee || 0));
          });
      }
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        revenue: hourlyMap.get(`${i.toString().padStart(2, '0')}:00`) || 0,
      }));
    } catch {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        revenue: 0,
      }));
    }
  })();

  const salaryTotal = employees
    .filter(isActiveEmployee)
    .reduce((total: number, emp: any) => total + Number(emp?.salary || 0), 0);

  const rentTotal = shops.reduce((total: number, shop: any) => total + Number(shop?.rent_amount || 0), 0);
  const activeEmployeeCount = employees.filter(isActiveEmployee).length;

  const electricityBill = Math.round(rentTotal * 0.028 + activeEmployeeCount * 240);
  const waterBill = Math.round(rentTotal * 0.01 + activeEmployeeCount * 70);

  const totalIncome = rentTotal + parkingRevenue;
  const totalExpenses = salaryTotal + electricityBill + waterBill;
  const netPL = totalIncome - totalExpenses;

  const isDataReady = !employeesQuery.isLoading && !shopsQuery.isLoading;

  const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  const categoryData = [
    { name: "Fashion", value: 30 },
    { name: "Food", value: 25 },
    { name: "Electronics", value: 20 },
    { name: "Beauty", value: 15 },
    { name: "Other", value: 10 },
  ];

  const visitorData = [
    { month: "Jan", visitors: 5200 },
    { month: "Feb", visitors: 6100 },
    { month: "Mar", visitors: 5800 },
    { month: "Apr", visitors: 7600 },
    { month: "May", visitors: 8300 },
    { month: "Jun", visitors: 9000 },
  ];

  const renderCategoryLabel = (entry: any) => {
    return `${entry.name}`;
  };

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Shops" value={isLoading ? "—" : Number(data?.shops || 0)} icon={Building2} delay={0} />
        <StatCard label="Active Staff" value={isLoading ? "—" : Number(data?.employees || 0)} icon={Users} delay={0.05} />
        <StatCard label="Net P&L" value={isLoading || !isDataReady ? "—" : (data?.net_pl !== undefined ? currency(Number(data.net_pl)) : currency(netPL))} icon={Receipt} delay={0.1} hint="all-time" />
        <StatCard label="Parking" value={isLoading ? "—" : Number(data?.parking_occupied || 0)} icon={Car} delay={0.15} hint="vehicles inside" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <DataPanel title="Parking Revenue — Hourly">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyParkingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(155 60% 60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DataPanel title="Shop Categories">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    dataKey="value" 
                    nameKey="name" 
                    innerRadius={50} 
                    outerRadius={85} 
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.98)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "hsl(0 0% 100%)" }} labelStyle={{ color: "hsl(0 0% 100%)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <DataPanel title="Visitor Footfall">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="visitors" fill="hsl(245 80% 65%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataPanel>
      </div>
    </AppShell>
  );
}