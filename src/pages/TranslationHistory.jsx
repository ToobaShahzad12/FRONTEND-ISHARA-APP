import { useMemo, useState } from "react";
import { Clock, Search, SlidersHorizontal, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { IS_DEMO_MODE, getDemoTranslationHistory } from "../api/demoStore";
import AdminDemoNotice from "../components/admin/AdminDemoNotice";
import BottomSheet from "../components/ds/BottomSheet";
import Button from "../components/ds/Button";
import EmptyState from "../components/ds/EmptyState";
import PageHeader from "../components/ds/PageHeader";
import StatusBadge from "../components/ds/StatusBadge";
import UserShell from "../components/ds/UserShell";
import {
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
  usePrefersReducedMotion,
} from "../components/ds/MotionPrimitives";

const EMPTY_RECORDS = [];

const STATUS_LABELS = {
  completed: "Completed",
  processing: "Processing",
  failed: "Failed",
};

const DATE_LABELS = {
  today: "Today",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
};

function getRecordDate(record) {
  const value = record.created_at ?? record.createdAt ?? record.date;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatDate(date) {
  if (!date) return "Date unavailable";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(duration) {
  if (typeof duration === "string" && duration.trim()) return duration;
  if (!Number.isFinite(duration) || duration < 0)
    return "Duration unavailable";
  const totalSeconds = Math.floor(duration);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function getBadgeText(status) {
  const normalized = String(status || "unknown").toLowerCase();
  if (normalized === "completed") return "Completed";
  if (normalized === "processing") return "Processing";
  if (normalized === "failed") return "Failed";
  return "Status unavailable";
}

function HistoryRow({ record }) {
  const date = getRecordDate(record);
  const source =
    record.source || record.file_name || record.fileName || "Video translation";
  const badgeText = getBadgeText(record.status);

  return (
    <tr>
      <td className="ds-td-primary" data-label="Translation">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              inlineSize: "2.25rem",
              blockSize: "2.25rem",
              borderRadius: "var(--ds-radius-sm)",
              background: "var(--ish-brand-gradient-soft)",
              border: "1px solid rgba(11, 132, 180, 0.24)",
              color: "var(--ds-text-link)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            <Video size={18} strokeWidth={1.75} />
          </span>
          <div>
            <strong style={{ display: "block" }}>{source}</strong>
            <small style={{ color: "var(--ds-text-muted)", fontSize: "0.8125rem" }}>
              {record.gloss_preview
                ? `${record.source_language || "PSL video"} · ${record.gloss_preview}`
                : record.source_language || "PSL video"}
            </small>
          </div>
        </div>
      </td>

      <td data-label="Date & time">
        <div>
          <span>{formatDate(date)}</span>
          {date && (
            <small style={{ display: "block", color: "var(--ds-text-muted)", fontSize: "0.8125rem" }}>
              {formatTime(date)}
            </small>
          )}
        </div>
      </td>

      <td data-label="Duration" className="ds-tabular">
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <Clock size={15} strokeWidth={1.75} aria-hidden="true" />
          <span>{formatDuration(record.duration_seconds ?? record.duration)}</span>
        </span>
      </td>

      <td data-label="Status">
        <StatusBadge status={badgeText} />
      </td>
    </tr>
  );
}

export default function TranslationHistory({ user, records }) {
  const reduced = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("any");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const historyRecords = Array.isArray(records)
    ? records
    : IS_DEMO_MODE
      ? getDemoTranslationHistory()
      : EMPTY_RECORDS;

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const cutoff =
      dateFilter === "today"
        ? startOfToday
        : dateFilter === "7days"
          ? new Date(now.getTime() - 7 * 86400000)
          : dateFilter === "30days"
            ? new Date(now.getTime() - 30 * 86400000)
            : null;
    return historyRecords
      .filter((record) => {
        const searchable = [
          record.source,
          record.file_name,
          record.fileName,
          record.source_language,
          record.gloss_preview,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        const matchesQuery = searchable.includes(
          query.trim().toLocaleLowerCase()
        );
        const matchesStatus =
          statusFilter === "all" ||
          String(record.status || "").toLowerCase() === statusFilter;
        const date = getRecordDate(record);
        const withinDateRange = Boolean(
          date && cutoff && date >= cutoff && date <= now
        );
        const matchesDate = !cutoff || withinDateRange;
        return matchesQuery && matchesStatus && matchesDate;
      })
      .sort(
        (left, right) =>
          (getRecordDate(right)?.getTime() || 0) -
          (getRecordDate(left)?.getTime() || 0)
      );
  }, [dateFilter, historyRecords, query, statusFilter]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setDateFilter("any");
  }

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (dateFilter !== "any" ? 1 : 0);

  return (
    <UserShell user={user} pageTitle="Translation History">
      <PageHeader
        eyebrow="History"
        title="Translation History"
        description="Access your previous PSL translations."
      />

      {IS_DEMO_MODE && (
        <div style={{ marginBlockStart: "var(--ds-space-4)" }}>
          <AdminDemoNotice>
            Showing sample translation records (Demo Data) for frontend preview. Real translation inference is disconnected in Demo Mode.
          </AdminDemoNotice>
        </div>
      )}

      <section
        className="ds-toolbar"
        style={{ marginBlockStart: "var(--ds-space-6)" }}
        aria-label="Search and filter translations"
      >
        <div className="ds-search-wrap">
          <Search
            size={18}
            strokeWidth={1.75}
            className="ds-search-icon"
            aria-hidden="true"
          />
          <label htmlFor="history-search" className="ds-sr-only">
            Search translations
          </label>
          <input
            id="history-search"
            className="ds-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title"
          />
          {query && (
            <button
              type="button"
              className="ds-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="ds-toolbar-filters ds-toolbar-filters--collapsible">
          <div className="ds-toolbar-filter-item">
            <label htmlFor="history-status">Status</label>
            <select
              id="history-status"
              className="ds-select ds-select--toolbar"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="ds-toolbar-filter-item">
            <label htmlFor="history-date">Date</label>
            <select
              id="history-date"
              className="ds-select ds-select--toolbar"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="any">Any date</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <Button variant="secondary" size="md" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="ds-filter-trigger"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
          <span>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </span>
        </Button>
      </section>

      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            className="ds-active-chips"
            aria-label="Active filters"
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduced ? 0.01 : 0.18, ease: ISHARA_EASE }}
          >
            {statusFilter !== "all" && (
              <button
                type="button"
                className="ds-chip is-active"
                onClick={() => setStatusFilter("all")}
              >
                <span>Status: {STATUS_LABELS[statusFilter] || statusFilter}</span>
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
            {dateFilter !== "any" && (
              <button
                type="button"
                className="ds-chip is-active"
                onClick={() => setDateFilter("any")}
              >
                <span>Date: {DATE_LABELS[dateFilter] || dateFilter}</span>
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerContainer stagger={0.05} delay={0.03}>
        <StaggerItem y={12}>
      {historyRecords.length > 0 ? (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "var(--ds-space-2)",
              marginBlockEnd: "var(--ds-space-3)",
              fontSize: "0.875rem",
              color: "var(--ds-text-muted)",
            }}
          >
            <span>
              {filteredRecords.length}{" "}
              {filteredRecords.length === 1 ? "translation" : "translations"}
              {query.trim() ? ` found for “${query.trim()}”` : ""}
            </span>
            <span>Newest first</span>
          </div>

          {filteredRecords.length ? (
            <section
              className="ds-table-card ds-table-card--responsive"
              aria-label="Translation records"
            >
              <div className="ds-table-scroll">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th scope="col">Translation</th>
                      <th scope="col">Date &amp; time</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <HistoryRow
                        key={
                          record.id ??
                          `${record.file_name || record.fileName || "translation"}-${record.created_at || record.createdAt || record.date || index}`
                        }
                        record={record}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ds-table-footer">
                <span>
                  Translation history appears here when processing becomes
                  available.
                </span>
              </div>
            </section>
          ) : (
            <section
              className="ds-card"
              style={{ padding: "var(--ds-space-6)" }}
              aria-live="polite"
            >
              <EmptyState
                icon={Search}
                title="No translations found"
                description="No records match the current search or filters. Try another search or clear your filters."
                actions={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </section>
          )}
        </>
      ) : (
        <section
          className="ds-card"
          style={{ padding: "var(--ds-space-8) var(--ds-space-4)" }}
          aria-labelledby="ds-history-empty-title"
        >
          <EmptyState
            useHandTrace
            titleId="ds-history-empty-title"
            title="Your first translation starts here"
            description="No translations yet. Record your signing or choose a PSL video. Your translation history will appear here once translation processing is available."
            actions={
              <>
                <Button variant="primary" to="/dashboard/live-camera">
                  Open Camera
                </Button>
                <Button variant="secondary" to="/dashboard/upload-video">
                  Choose Video
                </Button>
              </>
            }
            footnote="One complete thought. One step closer to connection."
          />
        </section>
      )}
        </StaggerItem>
      </StaggerContainer>

      <BottomSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter translations"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-history-status">
              Status
            </label>
            <select
              id="mobile-history-status"
              className="ds-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="ds-field">
            <label className="ds-field-label" htmlFor="mobile-history-date">
              Date
            </label>
            <select
              id="mobile-history-date"
              className="ds-select"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="any">Any date</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "var(--ds-space-3)", marginBlockStart: "var(--ds-space-2)" }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                clearFilters();
                setMobileFiltersOpen(false);
              }}
            >
              Clear filters
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setMobileFiltersOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </BottomSheet>
    </UserShell>
  );
}
