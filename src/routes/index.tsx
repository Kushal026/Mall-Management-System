import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Users, Car, Sparkles, ShieldCheck, ChartBar, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Mall — Futuristic Mall Management System" },
      { name: "description", content: "Manage stores, employees, parking, and analytics across your smart mall — all in one dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  const features = [
    { icon: Building2, title: "Shop Management", desc: "Track every store, rent, and occupancy." },
    { icon: Users, title: "Employee Hub", desc: "Attendance, shifts, and payroll in one place." },
    { icon: Car, title: "Smart Parking", desc: "QR tickets, slot tracking, dynamic fees." },
    { icon: ChartBar, title: "Live Analytics", desc: "Revenue, footfall and trend dashboards." },
    { icon: ShieldCheck, title: "Role-Based Access", desc: "Admin, manager, employee — secured." },
  ];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">SmartMall</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#stack" className="hover:text-foreground transition">Stack</a>
            <Link to="/dashboard" className="hover:text-foreground transition">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="px-4 py-2 text-sm rounded-lg bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition">
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-muted-foreground mb-6"
          >
            <Zap className="h-3.5 w-3.5 text-primary-glow" />
            Final Year DBMS + Full Stack Project
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto"
          >
            The <span className="text-gradient">Smart Mall</span><br />
            Management System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            One futuristic dashboard for stores, staff, parking, and analytics — wired to a secure backend with role-based access.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 transition">
              Open Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass rounded-2xl p-6 hover:shadow-glow transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-accent grid place-items-center mb-4">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="stack" className="mx-auto max-w-7xl px-6 pb-32 text-center">
        <h2 className="text-3xl font-bold">Built with a modern full-stack</h2>
        <p className="text-muted-foreground mt-2">React · TanStack · Tailwind · Framer Motion · Recharts · Postgres · JWT Auth</p>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Smart Mall Management System
      </footer>
    </div>
  );
}
