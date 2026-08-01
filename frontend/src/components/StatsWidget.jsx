import { ListTodo, CheckCheck, Hourglass, CircleAlert } from "lucide-react";

const STATS = [
  { key: "total", label: "Total", icon: ListTodo, color: "#0d9488" },
  { key: "completed", label: "Done", icon: CheckCheck, color: "#22c55e" },
  { key: "pending", label: "Pending", icon: Hourglass, color: "#f59e0b" },
  { key: "overdue", label: "Overdue", icon: CircleAlert, color: "#ef4444" },
];

export default function StatsWidget({ stats, loading }) {
  if (loading) {
    return (
      <div
        className="h-[72px] animate-pulse rounded-2xl border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
      />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              className={`flex items-center justify-center gap-2.5 py-4 px-2 sm:py-3.5
                ${i < 3 ? "sm:border-r" : ""}
                ${i % 2 === 0 ? "border-r" : ""}
                ${i < 2 ? "border-b sm:border-b-0" : ""}
              `}
              style={{ borderColor: "var(--border-color)" }}
            >
              <Icon className="h-5 w-5 shrink-0" style={{ color: stat.color }} strokeWidth={2.5} />
              <div className="flex flex-col leading-none">
                <span
                  className="text-lg font-extrabold tracking-tight sm:text-xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stats[stat.key] ?? 0}
                </span>
                <span
                  className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
