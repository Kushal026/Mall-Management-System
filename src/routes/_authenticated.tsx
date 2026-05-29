import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getStoredSession } from "@/services/api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!getStoredSession()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});