import { useEffect, useState } from "react";
import { X, PencilLine, Plus } from "lucide-react";

const TITLE_MAX = 100;
const DESC_MAX = 500;

const PRIORITIES = [
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

export default function TaskForm({ task, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(task?.id);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        due_date: task.due_date || "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const data = { ...formData };
      if (!data.due_date) data.due_date = null;
      await onSave(data);
      onClose();
    } catch (err) {
      setErrors({ general: err.message || "Failed to save task" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]";

  const inputStyle = {
    backgroundColor: "var(--bg-tertiary)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border sm:max-h-[85vh]"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "var(--gradient-accent)" }}
        >
          <div className="flex items-center gap-2">
            {isEdit ? <PencilLine className="h-4.5 w-4.5 text-white" /> : <Plus className="h-4.5 w-4.5 text-white" />}
            <h2 className="text-sm font-bold text-white">
              {isEdit ? "Edit Task" : "New Task"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Title
              </label>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                {formData.title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              autoFocus
              maxLength={TITLE_MAX}
              className={inputClass}
              style={inputStyle}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Description
              </label>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                {formData.description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={DESC_MAX}
              className={`${inputClass} resize-none`}
              style={inputStyle}
              placeholder="Add details (optional)"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Priority
              </label>
              <div className="flex gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors"
                    style={{
                      borderColor: formData.priority === p.value ? p.color : "var(--border-color)",
                      backgroundColor: formData.priority === p.value ? `${p.color}12` : "var(--bg-tertiary)",
                      color: formData.priority === p.value ? p.color : "var(--text-secondary)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </div>

          {errors.general && (
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {errors.general}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--bg-tertiary)]"
              style={{ borderColor: "var(--border-color)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--gradient-accent)" }}
            >
              {saving ? "Saving…" : isEdit ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
