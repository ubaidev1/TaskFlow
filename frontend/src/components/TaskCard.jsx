import { useState } from "react";
import { Calendar, Check, Pencil, Trash2, Clock, X } from "lucide-react";
import { formatDate, isOverdue } from "../utils/date.js";

const PRIORITY = {
  low: { color: "#22c55e", label: "Low" },
  medium: { color: "#f59e0b", label: "Medium" },
  high: { color: "#ef4444", label: "High" },
};

const DESC_LIMIT = 120;

function DescriptionModal({ title, description, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Task Description
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3 sm:px-5 sm:py-4" style={{ minHeight: "200px", maxHeight: "70vh" }}>
          <p className="mb-3 text-sm font-bold sm:text-base" style={{ color: "var(--text-primary)" }}>
            {title}
          </p>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete, isDark }) {
  const [showDesc, setShowDesc] = useState(false);
  const overdue = isOverdue(task);
  const p = PRIORITY[task.priority] || PRIORITY.medium;
  const isLongDesc = task.description && task.description.length > DESC_LIMIT;
  const truncatedDesc = isLongDesc
    ? task.description.slice(0, DESC_LIMIT).trim() + "…"
    : task.description;

  return (
    <>
      <div
        className="group rounded-xl border transition-colors hover:border-[var(--accent)]"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: overdue ? "rgba(239,68,68,0.3)" : "var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="p-3 sm:p-4">
          {/* Top row: checkbox + title (left) + actions (right) */}
          <div className="flex items-start gap-2.5 sm:gap-3">
            <button
              onClick={() => onToggleComplete(task)}
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
              style={{
                borderColor: task.completed ? "#22c55e" : "var(--border-color)",
                backgroundColor: task.completed ? "#22c55e" : "transparent",
              }}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className="text-sm font-bold leading-snug sm:text-base"
                style={{
                  color: task.completed ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: task.completed ? "line-through" : "none",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                {task.title}
              </h3>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onEdit(task)}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-tertiary)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Edit task"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[rgba(239,68,68,0.08)]"
                style={{ color: "var(--text-muted)" }}
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p
              className="mt-2 pl-7 text-sm leading-relaxed break-words sm:pl-8"
              style={{ color: "var(--text-secondary)", overflowWrap: "break-word", wordBreak: "break-word" }}
            >
              {truncatedDesc}
              {isLongDesc && (
                <span
                  className="ml-1 cursor-pointer font-semibold underline"
                  style={{ color: "var(--accent)" }}
                  onClick={() => setShowDesc(true)}
                >
                  See more
                </span>
              )}
            </p>
          )}

          {/* Bottom meta row: date + location + weather (left) + priority badge (right) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 pl-7 sm:pl-8 sm:gap-x-4">
            {task.due_date && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{
                  color: overdue ? (isDark ? "#f87171" : "#dc2626") : "var(--text-muted)",
                }}
              >
                {overdue ? <Clock className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
                {formatDate(task.due_date)}
                {overdue && <span className="font-bold">· Overdue</span>}
              </span>
            )}

            {/* Priority badge — pushed to the right */}
            <span
              className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                backgroundColor: `${p.color}15`,
                color: p.color,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label}
            </span>
          </div>
        </div>
      </div>

      {showDesc && (
        <DescriptionModal
          title={task.title}
          description={task.description}
          onClose={() => setShowDesc(false)}
        />
      )}
    </>
  );
}
