import { Search, X, ArrowUpDown, ChevronDown, Flag, CheckCircle, Circle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities", color: "#6b7280" },
  { value: "high", label: "High", color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "low", label: "Low", color: "#22c55e" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Tasks", icon: Circle, color: "#6b7280" },
  { value: "false", label: "Pending", icon: Circle, color: "#f59e0b" },
  { value: "true", label: "Completed", icon: CheckCircle, color: "#22c55e" },
];

const SORT_OPTIONS = [
  { value: "-created_at", label: "Newest First" },
  { value: "created_at", label: "Oldest First" },
  { value: "-updated_at", label: "Recently Updated" },
  { value: "updated_at", label: "Least Recently Updated" },
  { value: "due_date", label: "Due Date (Nearest)" },
  { value: "-due_date", label: "Due Date (Farthest)" },
  { value: "priority", label: "Priority (Low to High)" },
  { value: "-priority", label: "Priority (High to Low)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-title", label: "Title (Z-A)" },
];

function FilterDropdown({ label, icon: Icon, options, value, onChange, renderOption }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all"
        style={{
          backgroundColor: open ? "var(--bg-tertiary)" : "var(--bg-tertiary)",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          borderColor: value ? "var(--accent)" : "var(--border-color)",
        }}
      >
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: selected.color || "var(--text-muted)" }} />}
        <span className="max-w-[100px] truncate sm:max-w-none">{selected.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-xl border shadow-xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
              style={{
                color: value === opt.value ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {renderOption ? renderOption(opt) : (
                <>
                  <span className="flex-1 truncate">{opt.label}</span>
                  {value === opt.value && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({ search: "", priority: "", completed: "", ordering: "-created_at" });
  };

  const hasActiveFilters =
    filters.search || filters.priority || filters.completed || filters.ordering !== "-created_at";

  return (
    <div
      className="rounded-xl border p-3 sm:p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Search bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search tasks by title or description..."
          className="w-full rounded-lg border py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
        {filters.search && (
          <button
            onClick={() => updateFilter("search", "")}
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded transition-colors hover:bg-[var(--border-color)]"
            style={{ color: "var(--text-muted)" }}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter dropdowns + sort */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Priority dropdown */}
        <FilterDropdown
          label="Priority"
          icon={Flag}
          options={PRIORITY_OPTIONS}
          value={filters.priority}
          onChange={(v) => updateFilter("priority", v)}
          renderOption={(opt) => (
            <>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: opt.color }}
              />
              <span className="flex-1 truncate">{opt.label}</span>
              {filters.priority === opt.value && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              )}
            </>
          )}
        />

        {/* Status dropdown */}
        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.completed}
          onChange={(v) => updateFilter("completed", v)}
          renderOption={(opt) => {
            const OptIcon = opt.icon;
            return (
              <>
                <OptIcon className="h-3.5 w-3.5 shrink-0" style={{ color: opt.color }} />
                <span className="flex-1 truncate">{opt.label}</span>
                {filters.completed === opt.value && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                )}
              </>
            );
          }}
        />

        {/* Sort dropdown */}
        <FilterDropdown
          label="Sort"
          icon={ArrowUpDown}
          options={SORT_OPTIONS}
          value={filters.ordering}
          onChange={(v) => updateFilter("ordering", v)}
        />

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-muted)", borderColor: "var(--border-color)" }}
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
