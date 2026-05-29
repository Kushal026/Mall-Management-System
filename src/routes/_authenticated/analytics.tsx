import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { StatCard } from "@/components/StatCard";
import { apiService } from "@/services/api";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Building2, Car, Receipt, Users, TrendingUp, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Smart Mall" }] }),
  component: Page,
});

function Page() {
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

  const shopsQuery = useQuery({
    queryKey: ["analytics-shops"],
    queryFn: async () => {
      const response = await apiService.get("/shops?page=1&limit=500");
      return response.data;
    },
  });

  const parkingQuery = useQuery({
    queryKey: ["analytics-parking"],
    queryFn: async () => {
      const response = await apiService.get("/parking");
      return response.data.data || [];
    },
  });

  const trendData = (data?.revenue_trend || []).map((row: any) => ({
    day: new Date(row.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    total: Number(row.total || 0),
  }));

  const shops = (shopsQuery.data?.items ?? []) as any[];

  // Calculate hourly parking utilization
  const hourlyParkingUtilization = (() => {
    const hourlyMap = new Map<string, number>();
    (parkingQuery.data || []).forEach((p: any) => {
      if (p.entry_time && p.exit_time) {
        const entryHour = new Date(p.entry_time).getHours();
        const exitHour = new Date(p.exit_time).getHours();
        
        for (let h = entryHour; h <= exitHour && h < 24; h++) {
          const hourStr = `${h.toString().padStart(2, '0')}:00`;
          hourlyMap.set(hourStr, (hourlyMap.get(hourStr) || 0) + 1);
        }
      }
    });
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      utilization: hourlyMap.get(`${i.toString().padStart(2, '0')}:00`) || 0,
    }));
  })();

  const operationData = [
    { label: "Parking occupied", value: Number(data?.parking_occupied || 0) },
  ];

  const categoryDistribution = [
    { name: "Fashion", value: 30, revenue: 45000 },
    { name: "Food", value: 25, revenue: 38000 },
    { name: "Electronics", value: 20, revenue: 52000 },
    { name: "Beauty", value: 15, revenue: 28000 },
    { name: "Other", value: 10, revenue: 12000 },
  ];

  // Calculate rent by category based on shop distribution
  const rentByCategory = (() => {
    const categoryMap = new Map<string, number>();
    shops.forEach((shop: any) => {
      const category = shop.category || "Other";
      categoryMap.set(category, (categoryMap.get(category) || 0) + Number(shop.rent_amount || 0));
    });
    
    return Array.from(categoryMap, ([name, rent]) => ({ name, rent }));
  })();

  const COLORS = ["hsl(280 80% 65%)", "hsl(245 80% 65%)", "hsl(295 75% 70%)", "hsl(155 60% 60%)", "hsl(80 70% 65%)"];

  const monthlyMetrics = [
    { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
    { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
    { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
    { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
    { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
    { month: "Jun", revenue: 68000, expenses: 40000, profit: 28000 },
  ];

  return (
    <AppShell title="Analytics">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total shops" value={isLoading ? "—" : Number(data?.shops || 0)} icon={Building2} delay={0} />
        <StatCard label="Active staff" value={isLoading ? "—" : Number(data?.employees || 0)} icon={Users} delay={0.05} />
        <StatCard label="All-time revenue" value={isLoading ? "—" : `₹${Number(data?.all_time_revenue || 0).toLocaleString()}`} icon={Receipt} delay={0.1} />
        <StatCard label="Parking live" value={isLoading ? "—" : Number(data?.parking_occupied || 0)} icon={Car} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataPanel title="Revenue & Expenses Trend">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData.length ? trendData : [{ day: "No data", total: 0 }]}> 
                  <defs>
                    <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(280 80% 65%)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="hsl(280 80% 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="total" stroke="hsl(280 80% 65%)" fill="url(#analyticsRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DataPanel title="Shop Category Distribution">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75} paddingAngle={2} label={{ fill: "hsl(0 0% 90%)", fontSize: 11, fontWeight: 500 }}>
                    {categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataPanel title="Monthly Revenue vs Expenses">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(155 60% 60%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(0 65% 65%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <DataPanel title="Parking Utilization Timeline">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyParkingUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="utilization" stroke="hsl(280 80% 65%)" strokeWidth={2} dot={{ fill: "hsl(280 80% 65%)", r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DataPanel>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
        <DataPanel title="Revenue by Category">
          <div className="space-y-3 text-sm">
            {rentByCategory.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
                <span className="font-semibold">₹{(cat.rent).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Key Metrics">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Avg. Monthly Profit</span>
              <span className="font-semibold">₹{Math.round(monthlyMetrics.reduce((a, b) => a + b.profit, 0) / monthlyMetrics.length).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Total Revenue</span>
              <span className="font-semibold">₹{monthlyMetrics.reduce((a, b) => a + b.revenue, 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
              <span className="text-muted-foreground">Profit Margin</span>
              <span className="font-semibold">{((monthlyMetrics.reduce((a, b) => a + b.profit, 0) / monthlyMetrics.reduce((a, b) => a + b.revenue, 0)) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </DataPanel>
      </div>
    </AppShell>
  );
}
