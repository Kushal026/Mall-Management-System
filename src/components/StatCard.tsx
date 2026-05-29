import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, hint, delay = 0,
}: { label: string; value: string | number; icon: LucideIcon; hint?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="mt-2 text-3xl font-bold">{value}</div>
          {hint && <div className="text-xs text-primary-glow mt-1">{hint}</div>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}