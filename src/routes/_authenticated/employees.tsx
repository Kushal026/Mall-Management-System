import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { apiService, extractApiError } from "@/services/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, PencilLine, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — Smart Mall" }] }),
  component: Page,
});

const DEPTS = ["Security", "Maintenance", "Billing", "Cleaning", "Administration"];

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  department: "Security",
  shift: "morning",
  salary: 0,
  password: "",
  role: "employee",
  is_active: true,
};

function Page() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["employees", page, search, sortBy, sortDirection],
    queryFn: async () => {
      const response = await apiService.get("/employees", {
        params: { page, limit: 8, search, sortBy, sortDirection },
      });
      return response.data.data;
    },
  });

  const employees = data?.items || [];
  const totalPages = data?.pagination?.pages || 1;

  async function submitForm() {
    if (!form.full_name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await apiService.put(`/employees/${editingId}`, form);
        toast.success("Employee updated");
      } else {
        if (!form.password) {
          toast.error("Password is required for new employees");
          return;
        }
        await apiService.post("/employees", form);
        toast.success("Employee added");
      }

      setForm(emptyForm);
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await apiService.delete(`/employees/${id}`);
      toast.success("Employee deleted");
      qc.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }

  function startEdit(employee) {
    setEditingId(employee.id);
    setForm({
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone || "",
      department: employee.department || "Security",
      shift: employee.shift || "morning",
      salary: Number(employee.salary || 0),
      password: "",
      role: employee.role || "employee",
      is_active: employee.is_active !== 0,
    });
  }

  return (
    <AppShell title="Employee Management">
      <DataPanel title={editingId ? "Edit employee" : "New employee"}>
        <div className="grid md:grid-cols-6 gap-3">
          <input placeholder="Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border" />
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border">
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
          </select>
          <input type="number" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className="px-3 py-2 rounded-lg bg-input border border-border" />
          <input type="password" placeholder={editingId ? "New password (optional)" : "Password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border md:col-span-2" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2 rounded-lg bg-input border border-border">
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <button onClick={submitForm} disabled={saving} className="md:col-span-4 px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow disabled:opacity-50">
            <Plus className="h-4 w-4 inline-block mr-2" /> {saving ? "Saving…" : editingId ? "Update Employee" : "Add Employee"}
          </button>
        </div>
      </DataPanel>

      <div className="mt-4">
        <DataPanel
          title={`Employees (${data?.pagination?.total || 0})`}
          action={
            <div className="flex items-center gap-2">
              <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm">
                <option value="created_at">Newest</option>
                <option value="full_name">Name</option>
                <option value="department">Department</option>
              </select>
              <button onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")} className="px-3 py-1.5 rounded-lg bg-secondary text-sm">{sortDirection === "desc" ? "↓" : "↑"}</button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b border-border">
                <tr>{['Name', 'Email', 'Department', 'Shift', 'Salary', 'Status', 'Actions'].map((h) => <th key={h} className="py-2 pr-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Loading employees…</td></tr>}
                {!isLoading && employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="py-3 pr-3 font-medium">{employee.full_name}</td>
                    <td className="py-3 pr-3">{employee.email}</td>
                    <td className="py-3 pr-3"><span className="px-2 py-0.5 rounded-full bg-accent/20 text-xs">{employee.department}</span></td>
                    <td className="py-3 pr-3">{employee.shift}</td>
                    <td className="py-3 pr-3">₹{Number(employee.salary || 0).toLocaleString()}</td>
                    <td className="py-3 pr-3">{employee.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => startEdit(employee)} className="p-1.5 rounded-md hover:bg-secondary"><PencilLine className="h-4 w-4" /></button>
                      <button onClick={() => remove(employee.id)} className="p-1.5 rounded-md hover:bg-destructive/20"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </td>
                  </tr>
                ))}
                {!isLoading && employees.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No employees found.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-40">Next</button>
            </div>
          </div>
        </DataPanel>
      </div>
    </AppShell>
  );
}