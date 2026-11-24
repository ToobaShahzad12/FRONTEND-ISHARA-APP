import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPages(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push(`ellipsis-${sorted[i - 1]}`);
    }
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}) {
  const safeTotal = Math.max(1, totalPages);
  const pages = buildPages(currentPage, safeTotal);

  return (
    <nav className="ds-pagination" aria-label="Pagination">
      <button
        type="button"
        className="ds-page-btn"
        disabled={disabled || currentPage <= 1}
        aria-disabled={disabled || currentPage <= 1 || undefined}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
      </button>

      <span className="ds-pagination-numbers" style={{ display: "inline-flex", gap: "0.25rem" }}>
        {pages.map((entry) =>
          typeof entry === "string" ? (
            <span
              key={entry}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minInlineSize: "2rem",
                color: "var(--ds-text-muted)",
              }}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className="ds-page-btn"
              disabled={disabled}
              aria-current={currentPage === entry ? "page" : undefined}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </button>
          )
        )}
      </span>

      <span className="ds-pagination-compact ds-tabular">
        Page {currentPage} of {safeTotal}
      </span>

      <button
        type="button"
        className="ds-page-btn"
        disabled={disabled || currentPage >= safeTotal}
        aria-disabled={disabled || currentPage >= safeTotal || undefined}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
      </button>
    </nav>
  );
}
