import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { apiService, extractApiError } from "@/services/api";
import { Briefcase, Droplets, Zap, Car, TrendingUp } from "lucide-react";

type Employee = {
  salary?: number | null;
  is_active?: boolean | number | null;
  full_name?: string;
  department?: string;
};

type Shop = {
  rent_amount?: number | null;
  shop_name?: string;
  category?: string;
  floor_number?: string;
  status?: string;
};

type Bill = {
  id?: number | string;
  invoice_number?: string;
  customer_name?: string | null;
  total?: number | null;
  created_at?: string;
  payment_method?: string | null;
};

const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isActiveEmployee(employee: Employee) {
  return employee.is_active !== false && employee.is_active !== 0;
}

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({ meta: [{ title: "Billing — Smart Mall" }] }),
  component: Page,
});

function Page() {
  const employeesQuery = useQuery({
    queryKey: ["billing-employees"],
    queryFn: async () => {
      const response = await apiService.get("/employees", {
        params: { page: 1, limit: 100, search: "", sortBy: "created_at", sortDirection: "desc" },
      });
      return response.data.data;
    },
  });

  const shopsQuery = useQuery({
    queryKey: ["billing-shops"],
    queryFn: async () => {
      const response = await apiService.get("/shops", {
        params: { page: 1, limit: 100, search: "", sortBy: "created_at", sortDirection: "desc" },
      });
      return response.data.data;
    },
  });

  const salesQuery = useQuery({
    queryKey: ["billing-sales"],
    queryFn: async () => {
      const response = await apiService.get("/billing/sales", {
        params: { limit: 10 },
      });
      return response.data.data ?? [];
    },
  });

  const parkingQuery = useQuery({
    queryKey: ["billing-parking"],
    queryFn: async () => {
      const response = await apiService.get("/parking");
      return response.data.data || [];
    },
  });

  const employees = (employeesQuery.data?.items ?? []) as Employee[];
  const shops = (shopsQuery.data?.items ?? []) as Shop[];
  const sales = (salesQuery.data ?? []) as Bill[];
  const parking = (parkingQuery.data ?? []) as any[];

  const salaryTotal = employees
    .filter(isActiveEmployee)
    .reduce((total, employee) => total + Number(employee.salary || 0), 0);

  const rentTotal = shops.reduce((total, shop) => total + Number(shop.rent_amount || 0), 0);
  const activeEmployeeCount = employees.filter(isActiveEmployee).length;
  const activeShopCount = shops.length;

  const electricityBill = Math.round(rentTotal * 0.028 + activeEmployeeCount * 240);
  const waterBill = Math.round(rentTotal * 0.01 + activeEmployeeCount * 70);
  const salesRevenue = sales.reduce((total, bill) => total + Number(bill.total || 0), 0);
  
  // Only count completed checkouts (with exit_time) for parking revenue
  const parkingRevenue = parking
    .filter((p: any) => p.exit_time)
    .reduce((total, p: any) => total + Number(p.fee || 0), 0);

  // Calculate totals
  const totalIncome = rentTotal + parkingRevenue;
  const totalExpenses = salaryTotal + electricityBill + waterBill;
  const netPL = totalIncome - totalExpenses;

  const billingRows = [
    {
      label: "Employee salary",
      amount: salaryTotal,
      source: `${activeEmployeeCount} active employees`,
      note: "Pulled directly from the employee records.",
      icon: Briefcase,
    },
    {
      label: "Electricity bill",
      amount: electricityBill,
      source: `Derived from ${activeShopCount} active shops and ${activeEmployeeCount} employees`,
      note: "Calculated from the current occupancy and rent load.",
      icon: Zap,
    },
    {
      label: "Water bill",
      amount: waterBill,
      source: `Derived from ${activeShopCount} active shops and ${activeEmployeeCount} employees`,
      note: "Calculated from the current occupancy and rent load.",
      icon: Droplets,
    },
  ];

  const errorMessage = employeesQuery.error
    ? extractApiError(employeesQuery.error)
    : shopsQuery.error
      ? extractApiError(shopsQuery.error)
      : salesQuery.error
        ? extractApiError(salesQuery.error)
        : parkingQuery.error
          ? extractApiError(parkingQuery.error)
          : null;

  const isLoading = employeesQuery.isLoading || shopsQuery.isLoading || salesQuery.isLoading || parkingQuery.isLoading;

  return (
    <AppShell title="Billing">
      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Rent income</p>
                <p className="mt-2 text-2xl font-semibold">{currency(rentTotal)}</p>
              </div>
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">From {activeShopCount} active shops.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Parking revenue</p>
                <p className="mt-2 text-2xl font-semibold">{currency(parkingRevenue)}</p>
              </div>
              <Car className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">From {parking.length} parking sessions.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Employee salary</p>
                <p className="mt-2 text-2xl font-semibold">{currency(salaryTotal)}</p>
              </div>
              <Briefcase className="h-5 w-5 text-destructive" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Based on {activeEmployeeCount} active employees.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Utilities</p>
                <p className="mt-2 text-2xl font-semibold">{currency(electricityBill + waterBill)}</p>
              </div>
              <Zap className="h-5 w-5 text-destructive" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Electricity & water combined.</p>
          </div>

          <div className={`glass rounded-2xl p-5 ${netPL >= 0 ? 'border border-green-500/30' : 'border border-destructive/30'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Net P&L</p>
                <p className={`mt-2 text-2xl font-semibold ${netPL >= 0 ? 'text-green-400' : 'text-destructive'}`}>{currency(netPL)}</p>
              </div>
              <TrendingUp className={`h-5 w-5 ${netPL >= 0 ? 'text-green-400' : 'text-destructive'}`} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{netPL >= 0 ? 'Profitable' : 'Loss'}  performance.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
          <DataPanel title="Billing categories">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading billing data…</div>
            ) : (
              <div className="space-y-3">
                {billingRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="rounded-xl border border-border/70 bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{row.label}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{row.source}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{row.note}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{currency(row.amount)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DataPanel>

          <DataPanel title="Live mall data">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className="text-muted-foreground">Active employees</span>
                <span className="font-semibold">{activeEmployeeCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className="text-muted-foreground">Active shops</span>
                <span className="font-semibold">{activeShopCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <span className="text-muted-foreground">Current rent load</span>
                <span className="font-semibold">{currency(rentTotal)}</span>
              </div>
              <p className="text-xs leading-6 text-muted-foreground">
                Utility amounts are derived from the current mall data so the billing screen always reflects the real records in the database.
              </p>
            </div>
          </DataPanel>
        </div>

        <DataPanel title="Recent customer invoices">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading recent invoices…</div>
          ) : sales.length === 0 ? (
            <div className="text-sm text-muted-foreground">No sales invoices have been created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 pr-3">Invoice</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Payment</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((bill) => (
                    <tr key={String(bill.id)} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="py-3 pr-3 font-medium">{bill.invoice_number || "—"}</td>
                      <td className="py-3 pr-3">{bill.customer_name || "—"}</td>
                      <td className="py-3 pr-3">{bill.payment_method || "—"}</td>
                      <td className="py-3 pr-3">{currency(Number(bill.total || 0))}</td>
                      <td className="py-3 pr-3">{formatDate(bill.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>
      </div>
    </AppShell>
  );
}
