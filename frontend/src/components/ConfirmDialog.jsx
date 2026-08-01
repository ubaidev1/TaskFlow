import { Trash2 } from "lucide-react";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onCancel}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl border p-5"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
          >
            <Trash2 className="h-5 w-5" style={{ color: "#ef4444" }} />
          </div>
          <div className="pt-0.5">
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{message}</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#ef4444" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
