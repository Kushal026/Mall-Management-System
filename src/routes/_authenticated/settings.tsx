import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { DataPanel } from "@/components/DataPanel";
import { apiService, extractApiError, getStoredSession } from "@/services/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

const PREFERENCES_KEY = "smartmall.preferences";

const defaultPreferences = {
  autoRefresh: true,
  desktopAlerts: true,
  compactMode: false,
};

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Smart Mall" }] }),
  component: Page,
});

function Page() {
  const session = getStoredSession();
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch {
      // ignore local storage parse errors
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await apiService.get("/me");
      return response.data.data;
    },
  });

  const profile = data?.user || session?.user;

  async function savePreferences(nextPreferences: typeof defaultPreferences) {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
      }
      setPreferences(nextPreferences);
      toast.success("Preferences synced locally");
    } catch (error) {
      toast.error(extractApiError(error));
    }
  }

  return (
    <AppShell title="Settings">
      <div className="grid xl:grid-cols-[1fr_1.1fr] gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <DataPanel title="Account overview">
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Profile</div>
                <div className="mt-2 font-semibold text-lg">{isLoading ? "Loading…" : profile?.name || "Unknown user"}</div>
                <div className="text-sm text-muted-foreground">{profile?.email || "—"}</div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {profile?.role || "employee"}
                </div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Session</div>
                <div className="mt-2 text-sm text-muted-foreground">Token status: {session ? "Authenticated" : "Missing"}</div>
                <div className="mt-1 text-sm text-muted-foreground">Session expires: {session ? new Date(session.expiresAt).toLocaleString() : "—"}</div>
              </div>
            </div>
          </DataPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataPanel title="Workspace preferences">
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl bg-secondary/40 p-4">
                <span>
                  <div className="font-medium">Auto refresh dashboards</div>
                  <div className="text-sm text-muted-foreground">Refresh stats when you revisit the app.</div>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(event) => savePreferences({ ...preferences, autoRefresh: event.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-secondary/40 p-4">
                <span>
                  <div className="font-medium">Desktop alerts</div>
                  <div className="text-sm text-muted-foreground">Surface notifications for issues and order events.</div>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.desktopAlerts}
                  onChange={(event) => savePreferences({ ...preferences, desktopAlerts: event.target.checked })}
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-secondary/40 p-4">
                <span>
                  <div className="font-medium">Compact density</div>
                  <div className="text-sm text-muted-foreground">Reduce spacing for a tighter dashboard layout.</div>
                </span>
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(event) => savePreferences({ ...preferences, compactMode: event.target.checked })}
                />
              </label>
            </div>

            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-secondary/40 p-4">
                <Sparkles className="h-4 w-4 text-primary-glow" />
                <div className="mt-2 text-sm font-medium">Live profile</div>
                <div className="text-sm text-muted-foreground">Fetched from /me.</div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <BellRing className="h-4 w-4 text-primary-glow" />
                <div className="mt-2 text-sm font-medium">Alerts</div>
                <div className="text-sm text-muted-foreground">{preferences.desktopAlerts ? "Enabled" : "Muted"}</div>
              </div>
              <div className="rounded-xl bg-secondary/40 p-4">
                <RefreshCw className="h-4 w-4 text-primary-glow" />
                <div className="mt-2 text-sm font-medium">Sync</div>
                <div className="text-sm text-muted-foreground">Stored locally</div>
              </div>
            </div>
          </DataPanel>
        </motion.div>
      </div>
    </AppShell>
  );
}
