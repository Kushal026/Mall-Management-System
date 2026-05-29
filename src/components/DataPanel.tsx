import type { ReactNode } from "react";

export function DataPanel({
  title, action, children,
}: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}