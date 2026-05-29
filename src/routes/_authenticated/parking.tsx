import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { StatCard } from "@/components/StatCard";
import { apiService, extractApiError } from "@/services/api";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Car, LogIn, LogOut, Ticket, Bike } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/parking")({
  head: () => ({ meta: [{ title: "Parking — Smart Mall" }] }),
  component: ParkingPage,
});

const TOTAL_SLOTS = { car: 850, bike: 150 } as const;
const RATES = { car: 40, bike: 20 } as const;
const FREE_MINUTES = 15;

type VType = keyof typeof TOTAL_SLOTS;

type ParkingRow = {
  id: number;
  vehicle_number: string;
  vehicle_type: VType;
  slot_number: string | null;
  entry_time: string;
  exit_time: string | null;
  fee: number | null;
  ticket_code: string | null;
};

function ParkingPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<{ vehicle_number: string; vehicle_type: VType }>({
    vehicle_number: "",
    vehicle_type: "car",
  });
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  const { data = [] } = useQuery<ParkingRow[]>({
    queryKey: ["parking"],
    queryFn: async () => {
      const response = await apiService.get("/parking");
      return response.data.data as ParkingRow[];
    },
  });

  const active = useMemo(() => data.filter((p) => !p.exit_time), [data]);
  const occupiedByType = useMemo(() => {
    const map: Record<VType, Set<string>> = { car: new Set(), bike: new Set() };
    active.forEach((p) => {
      if (p.slot_number && (p.vehicle_type === "car" || p.vehicle_type === "bike")) {
        map[p.vehicle_type].add(p.slot_number);
      }
    });
    return map;
  }, [active]);

  const filteredActive = active.filter((p) =>
    p.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
    (p.slot_number ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const history = data.filter((p) => p.exit_time).slice(0, 20);
  const todayRevenue = data
    .filter((p) => p.exit_time && new Date(p.exit_time).toDateString() === new Date().toDateString())
    .reduce((s, p) => s + Number(p.fee ?? 0), 0);

  async function checkIn() {
    const vn = form.vehicle_number.trim().toUpperCase();

    if (!vn) {
      toast.error("Vehicle number required");
      return;
    }

    if (active.some((p) => p.vehicle_number === vn)) {
      toast.error("Vehicle already parked");
      return;
    }

    setCheckingIn(true);

    try {
      const response = await apiService.post("/parking/entry", {
        vehicle_number: vn,
        vehicle_type: form.vehicle_type,
      });
      const row = response.data.data as ParkingRow;
      toast.success(`Allocated slot ${row.slot_number}`);
      setForm({ vehicle_number: "", vehicle_type: form.vehicle_type });
      qc.invalidateQueries({ queryKey: ["parking"] });
      await downloadTicket(row);
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setCheckingIn(false);
    }
  }

  async function checkOut(id: number) {
    try {
      const response = await apiService.post(`/parking/exit/${id}`);
      const row = response.data.data as ParkingRow;
      toast.success(`Checkout complete — ₹${Number(row.fee ?? 0)}`);
      qc.invalidateQueries({ queryKey: ["parking"] });
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }

  async function downloadTicket(row: ParkingRow) {
    const payload = JSON.stringify({
      ticket: row.ticket_code,
      vehicle: row.vehicle_number,
      slot: row.slot_number,
      entry: row.entry_time,
    });

    const qrDataUrl = await QRCode.toDataURL(payload, { width: 320, margin: 1 });
    const doc = new jsPDF({ unit: "pt", format: [320, 480] });
    doc.setFillColor(15, 15, 35);
    doc.rect(0, 0, 320, 480, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SmartMall Parking", 160, 36, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 220);
    doc.text("Official Entry Ticket", 160, 54, { align: "center" });
    doc.addImage(qrDataUrl, "PNG", 80, 76, 160, 160);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);

    const lines = [
      ["Vehicle", row.vehicle_number],
      ["Type", row.vehicle_type.toUpperCase()],
      ["Slot", row.slot_number ?? "—"],
      ["Entry", new Date(row.entry_time).toLocaleString()],
      ["Ticket", (row.ticket_code ?? "").slice(0, 16).toUpperCase()],
    ];

    let y = 270;
    lines.forEach(([k, v]) => {
      doc.setTextColor(150, 150, 190);
      doc.text(`${k}`, 40, y);
      doc.setTextColor(255, 255, 255);
      doc.text(`${v}`, 280, y, { align: "right" });
      y += 22;
    });

    doc.setFontSize(8);
    doc.setTextColor(140, 140, 180);
    doc.text("Keep this ticket. Lost tickets incur a ₹200 fee.", 160, 460, { align: "center" });
    doc.save(`ticket-${row.vehicle_number}.pdf`);
  }

  return (
    <AppShell title="Parking Management">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-3 gap-4 mb-4">
        <StatCard label="Cars Parked" value={`${occupiedByType.car.size}/${TOTAL_SLOTS.car}`} icon={Car} />
        <StatCard label="Bikes Parked" value={`${occupiedByType.bike.size}/${TOTAL_SLOTS.bike}`} icon={Bike} />
        <StatCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString()}`} icon={Ticket} />
      </motion.div>

      <DataPanel title="Vehicle Check-In">
        <div className="grid md:grid-cols-6 gap-3">
          <input
            placeholder="Vehicle number (e.g. KA01AB1234)"
            value={form.vehicle_number}
            onChange={(e) => setForm({ ...form, vehicle_number: e.target.value.toUpperCase() })}
            className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-3 uppercase"
          />
          <select
            value={form.vehicle_type}
            onChange={(e) => setForm({ ...form, vehicle_type: e.target.value as VType })}
            className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2"
          >
            <option value="car">Car · ₹{RATES.car}/hr</option>
            <option value="bike">Bike · ₹{RATES.bike}/hr</option>
          </select>
          <button
            onClick={checkIn}
            disabled={checkingIn}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" /> {checkingIn ? "Checking In…" : "Check In"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Slot is auto-allocated. First {FREE_MINUTES} minutes free, then billed per hour (rounded up). A QR ticket PDF is generated automatically.
        </p>
      </DataPanel>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <DataPanel
          title={`Currently Parked (${filteredActive.length})`}
          action={
            <input
              placeholder="Search vehicle / slot…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm"
            />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>{["Vehicle", "Type", "Slot", "Entry", "Duration", ""].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredActive.map((p) => {
                  const mins = Math.floor((Date.now() - new Date(p.entry_time).getTime()) / 60000);
                  const dur = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="py-3 pr-3 font-mono font-medium">{p.vehicle_number}</td>
                      <td className="py-3 pr-3 capitalize">{p.vehicle_type}</td>
                      <td className="py-3 pr-3"><span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary-glow text-xs font-mono">{p.slot_number}</span></td>
                      <td className="py-3 pr-3 text-xs">{new Date(p.entry_time).toLocaleTimeString()}</td>
                      <td className="py-3 pr-3 text-xs">{dur}</td>
                      <td className="py-3 flex gap-1">
                        <button onClick={() => checkOut(p.id)} title="Check out" className="p-1.5 rounded-md hover:bg-success/20"><LogOut className="h-4 w-4 text-success" /></button>
                      </td>
                    </tr>
                  );
                })}
                {filteredActive.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No vehicles parked.</td></tr>}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <DataPanel title={`Recent Checkouts (${history.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>{["Vehicle", "Slot", "Entry", "Exit", "Fee"].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {history.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                    <td className="py-3 pr-3 font-mono">{p.vehicle_number}</td>
                    <td className="py-3 pr-3 text-xs font-semibold font-mono">{p.slot_number}</td>
                    <td className="py-3 pr-3 text-xs">{p.entry_time ? new Date(p.entry_time).toLocaleString() : "—"}</td>
                    <td className="py-3 pr-3 text-xs">{p.exit_time ? new Date(p.exit_time).toLocaleString() : "—"}</td>
                    <td className="py-3 pr-3 font-medium text-success">₹{Number(p.fee ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No checkouts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </DataPanel>
      </div>
    </AppShell>
  );
}
