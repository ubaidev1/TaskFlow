import { useCallback, useEffect, useState } from "react";
import { Plus, ClipboardList, Info } from "lucide-react";

import Header from "./components/Header.jsx";
import StatsWidget from "./components/StatsWidget.jsx";
import TaskCard from "./components/TaskCard.jsx";
import TaskForm from "./components/TaskForm.jsx";
import Pagination from "./components/Pagination.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import { useTheme } from "./hooks/useTheme.js";
import {
  fetchTasks,
  fetchStats,
  createTask,
  updateTask,
  deleteTask,
} from "./api/tasks.js";

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // loadTasks does NOT set loading=true — that's only for initial load / page change
  // This prevents the page from blinking when doing CRUD operations
  const loadTasks = useCallback(async (page) => {
    setError(null);
    try {
      const data = await fetchTasks(page);
      setTasks(data.results || []);
      setCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // Stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Only show skeleton loading on initial load and page changes
  useEffect(() => {
    setLoading(true);
    loadTasks(currentPage);
  }, [currentPage, loadTasks]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSave = async (data) => {
    if (editingTask?.id) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    loadTasks(currentPage);
    loadStats();
  };

  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
      loadTasks(currentPage);
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      loadTasks(currentPage);
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddForm = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-6 sm:py-10">
        {/* Stats */}
        <StatsWidget stats={stats} loading={statsLoading} />

        {/* Task list header */}
        <div className="mb-4 mt-6 flex items-center justify-between gap-3 sm:mb-5 sm:mt-8">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight sm:text-lg" style={{ color: "var(--text-primary)" }}>
              {count > 0 ? `${count} ${count === 1 ? "Task" : "Tasks"}` : "Tasks"}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
              {count > 0 ? "Manage your work efficiently" : "Create your first task to get started"}
            </p>
          </div>
          <button
            onClick={openAddForm}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 sm:px-4 sm:py-2.5"
            style={{
              background: "var(--gradient-accent)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)",
              borderColor: "rgba(239,68,68,0.2)",
              color: isDark ? "#f87171" : "#dc2626",
            }}
          >
            <Info className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border px-4 py-12 text-center sm:py-20"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl sm:h-14 sm:w-14"
              style={{ background: "var(--accent-light)" }}
            >
              <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: "var(--accent)" }} strokeWidth={2} />
            </div>
            <p className="text-sm font-bold sm:text-base" style={{ color: "var(--text-primary)" }}>
              No tasks yet
            </p>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
              Click "New Task" to create your first one
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isDark={isDark}
                onEdit={openEditForm}
                onDelete={setDeletingTask}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 sm:mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
        />
      )}
    </div>
  );
}

export default App;
