import { Moon, Sun, CircleCheckBig } from "lucide-react";

export default function Header({ theme, onToggleTheme }) {
  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur-xl"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--gradient-accent)" }}
          >
            <CircleCheckBig className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            TaskFlow
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
          aria-label="Toggle dark mode"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
