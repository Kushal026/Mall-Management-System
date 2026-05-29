import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { apiService, extractApiError } from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, PencilLine } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shops")({
  head: () => ({ meta: [{ title: "Stores — Smart Mall" }] }),
  component: ShopsPage,
});

type ShopForm = {
  shop_name: string;
  owner_name: string;
  contact: string;
  category: string;
  floor_number: number;
  rent_amount: number;
  store_size: number;
  status: string;
};

const emptyForm: ShopForm = {
  shop_name: "",
  owner_name: "",
  contact: "",
  category: "Retail",
  floor_number: 1,
  rent_amount: 0,
  store_size: 0,
  status: "vacant",
};

const statusStyles: Record<string, string> = {
  active: "bg-success/20 text-success border border-success/30",
  vacant: "bg-warning/20 text-warning border border-warning/30",
  maintenance: "bg-destructive/20 text-destructive border border-destructive/30",
};

function ShopsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShopForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["shops", page, search, sortBy, sortDirection],
    queryFn: async () => {
      const response = await apiService.get("/shops", {
        params: { page, limit: 8, search, sortBy, sortDirection },
      });
      return response.data.data;
    },
  });

  const shops = data?.items || [];
  const totalPages = data?.pagination?.pages || 1;

  async function submitForm() {
    if (!form.shop_name) {
      toast.error("Store number is required");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await apiService.put(`/shops/${editingId}`, form);
        toast.success("Store updated successfully");
      } else {
        await apiService.post("/shops", form);
        toast.success("Store added successfully");
      }

      setForm(emptyForm);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["shops"] });
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this store?")) return;

    try {
      await apiService.delete(`/shops/${id}`);
      toast.success("Store deleted successfully");
      qc.invalidateQueries({ queryKey: ["shops"] });
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }

  function startEdit(shop: any) {
    setEditingId(shop.id);
    setForm({
      shop_name: shop.shop_name || "",
      owner_name: shop.owner_name || "",
      contact: shop.contact || "",
      category: shop.category || "Retail",
      floor_number: Number(shop.floor_number || 1),
      rent_amount: Number(shop.rent_amount || 0),
      store_size: Number(shop.store_size || 0),
      status: shop.status || "vacant",
    });
  }

  return (
    <AppShell title="Store Management">
      <DataPanel title={editingId ? "Edit store details" : "Add a new store"}>
        <div className="grid md:grid-cols-6 gap-3">
          <input
            placeholder="Store Number (e.g. S-101)"
            value={form.shop_name}
            onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
            className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2"
          />
          <input
            placeholder="Owner name (Optional)"
            value={form.owner_name}
            onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
          <input
            placeholder="Contact (Optional)"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
          <input
            placeholder="Category (e.g. Fashion)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
          <input
            type="number"
            placeholder="Floor"
            value={form.floor_number || ""}
            onChange={(e) => setForm({ ...form, floor_number: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
          <input
            type="number"
            placeholder="Size (sq.ft)"
            value={form.store_size || ""}
            onChange={(e) => setForm({ ...form, store_size: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
          <input
            type="number"
            placeholder="Monthly Rent (₹)"
            value={form.rent_amount || ""}
            onChange={(e) => setForm({ ...form, rent_amount: Number(e.target.value) })}
            className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2"
          >
            <option value="active">Active</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            onClick={submitForm}
            disabled={saving}
            className="md:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {saving ? "Saving…" : editingId ? "Update Store" : "Add Store"}
          </button>
        </div>
      </DataPanel>

      <div className="mt-4">
        <DataPanel
          title={`Stores (${data?.pagination?.total || 0})`}
          action={
            <div className="flex items-center gap-2">
              <input
                placeholder="Search store / owner…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm"
              >
                <option value="created_at">Newest</option>
                <option value="shop_name">Store Number</option>
                <option value="rent_amount">Rent</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                className="px-3 py-1.5 rounded-lg bg-secondary text-sm"
              >
                {sortDirection === "desc" ? "↓" : "↑"}
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm animate-fade-in">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>
                  {['Store #', 'Owner', 'Category', 'Floor', 'Size (sq.ft)', 'Rent (Monthly)', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="py-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground animate-pulse">Loading stores…</td></tr>
                )}
                {!isLoading && shops.map((shop: any) => (
                  <tr key={shop.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-all">
                    <td className="py-3 pr-3 font-semibold font-mono text-primary-glow">{shop.shop_name}</td>
                    <td className="py-3 pr-3">{shop.owner_name || <span className="text-muted-foreground italic text-xs">None</span>}</td>
                    <td className="py-3 pr-3">{shop.category || 'Retail'}</td>
                    <td className="py-3 pr-3 font-mono">{shop.floor_number}</td>
                    <td className="py-3 pr-3 font-mono">{Number(shop.store_size || 0).toLocaleString()}</td>
                    <td className="py-3 pr-3 font-mono font-medium">₹{Number(shop.rent_amount || 0).toLocaleString()}</td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusStyles[shop.status] || "bg-secondary text-muted-foreground"}`}>
                        {shop.status}
                      </span>
                    </td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => startEdit(shop)} title="Edit Store" className="p-1.5 rounded-md hover:bg-secondary transition-all"><PencilLine className="h-4 w-4" /></button>
                      <button onClick={() => remove(shop.id)} title="Delete Store" className="p-1.5 rounded-md hover:bg-destructive/20 transition-all"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </td>
                  </tr>
                ))}
                {!isLoading && shops.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No stores found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-secondary transition-all">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-secondary transition-all">Next</button>
            </div>
          </div>
        </DataPanel>
      </div>
    </AppShell>
  );
}