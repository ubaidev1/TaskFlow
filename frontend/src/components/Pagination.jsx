import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  const btnStyle = (active) => ({
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : "var(--text-secondary)",
    border: "1px solid " + (active ? "var(--accent)" : "var(--border-color)"),
  });

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
        style={btnStyle(false)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium" style={btnStyle(false)}>1</button>
          {start > 2 && <span className="px-0.5 text-sm" style={{ color: "var(--text-muted)" }}>…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
          style={btnStyle(page === currentPage)}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-0.5 text-sm" style={{ color: "var(--text-muted)" }}>…</span>}
          <button onClick={() => onPageChange(totalPages)} className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium" style={btnStyle(false)}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-30"
        style={btnStyle(false)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
