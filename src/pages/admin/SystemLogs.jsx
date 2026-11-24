import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ScrollText,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getSystemLogs } from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import AuthFeedback from "../../components/AuthFeedback";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
import BottomSheet from "../../components/ds/BottomSheet";
import Button from "../../components/ds/Button";
import EmptyState from "../../components/ds/EmptyState";
import {
  AnimatedCounter,
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";
import Pagination from "../../components/ds/Pagination";
import Skeleton from "../../components/ds/Skeleton";
import StatusBadge from "../../components/ds/StatusBadge";

const SEVERITIES = ["All severities", "INFO", "WARN", "ERROR", "CRITICAL"];

const TIME_FILTERS = [
  { label: "Last 24 hours", value: "24" },
  { label: "Last 7 days", value: "168" },
  { label: "Last 30 days", value: "720" },
  { label: "All time", value: "all" },
];

const formatTimestamp = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [referenceTime, setReferenceTime] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("24");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const entriesPerPage = 8;

  useEffect(() => {
    document.title = "System logs — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        setLoading(true);
        setError("");

        const data = await getSystemLogs();

        if (!Array.isArray(data)) {
          throw new Error("Invalid system logs response from the server.");
        }

        const formattedLogs = data.map((log) => ({
          id: log.id,
          severity: log.severity,
          event: log.event,
          source: log.source,
          requestId: log.request_id || "",
          details: log.details,
          timestamp: new Date(log.timestamp),
        }));

        if (isMounted) {
          setLogs(formattedLogs);
          setReferenceTime(Date.now());
          setSelectedLog(null);
          setCurrentPage(1);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load system logs.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        log.event.toLowerCase().includes(searchText) ||
        log.source.toLowerCase().includes(searchText) ||
        log.requestId.toLowerCase().includes(searchText);

      const matchesSeverity =
        severityFilter === "All severities" ||
        log.severity === severityFilter;

      const matchesTime =
        timeFilter === "all" ||
        (referenceTime - log.timestamp.getTime()) / (1000 * 60 * 60) <=
          Number(timeFilter);

      return matchesSearch && matchesSeverity && matchesTime;
    });
  }, [logs, referenceTime, search, severityFilter, timeFilter]);

  const severityCounts = useMemo(() => {
    return SEVERITIES.slice(1).reduce((acc, severity) => {
      acc[severity] = filteredLogs.filter((log) => log.severity === severity).length;
      return acc;
    }, {});
  }, [filteredLogs]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / entriesPerPage)
  );

  const visibleLogs = filteredLogs.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleTimeFilter = (event) => {
    setTimeFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSeverityFilter = (event) => {
    setSeverityFilter(event.target.value);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = [
      "Timestamp",
      "Severity",
      "Event",
      "Source",
      "Request ID",
      "Details",
    ];

    const rows = filteredLogs.map((log) => [
      formatTimestamp(log.timestamp),
      log.severity,
      log.event,
      log.source,
      log.requestId,
      log.details,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ishara-system-logs.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      {IS_DEMO_MODE && (
        <StaggerItem>
          <AdminDemoNotice>
            Showing sample system logs (Demo Data) for frontend preview.
          </AdminDemoNotice>
        </StaggerItem>
      )}

      <PageHeader
        eyebrow="Monitoring"
        title="System logs"
        description="Review processing events, errors and service activity."
        actions={
          <Button
            variant="secondary"
            onClick={exportCSV}
            disabled={loading || Boolean(error)}
          >
            <Download size={18} strokeWidth={2} aria-hidden="true" />
            <span>Export CSV</span>
          </Button>
        }
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="logs-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error">
              <p>{error}</p>
            </AuthFeedback>
          </motion.div>
        )}
      </AnimatePresence>

      <StaggerItem>
        <div>
          <div className="ds-toolbar">
            <div className="ds-search-wrap">
              <Search
                size={18}
                strokeWidth={1.75}
                className="ds-search-icon"
                aria-hidden="true"
              />
              <label htmlFor="system-logs-search" className="ds-sr-only">
                Search event, user or request ID
              </label>
              <input
                id="system-logs-search"
                className="ds-input"
                type="text"
                placeholder="Search event, user or request ID"
                value={search}
                onChange={handleSearch}
              />
              {search && (
                <button
                  type="button"
                  className="ds-search-clear"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              className="ds-filter-trigger"
              onClick={() => setFiltersOpen(true)}
              aria-label="Open log filters"
            >
              <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
              <span>Filters</span>
            </Button>

            <div className="ds-toolbar-filters ds-toolbar-filters--collapsible">
              <div className="ds-toolbar-filter-item">
                <label htmlFor="logs-time-filter">Time window</label>
                <select
                  id="logs-time-filter"
                  className="ds-select ds-select--toolbar"
                  value={timeFilter}
                  onChange={handleTimeFilter}
                  aria-label="Filter by time"
                >
                  {TIME_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ds-toolbar-filter-item">
                <label htmlFor="logs-severity-filter">Severity</label>
                <select
                  id="logs-severity-filter"
                  className="ds-select ds-select--toolbar"
                  value={severityFilter}
                  onChange={handleSeverityFilter}
                  aria-label="Filter by severity"
                >
                  {SEVERITIES.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="ds-summary-strip" aria-label="Severity summary">
            {SEVERITIES.slice(1).map((severity) => (
              <div key={severity} className="ds-summary-strip-item">
                <StatusBadge status={severity} />
                <strong className="ds-tabular">
                  <AnimatedCounter value={severityCounts[severity] ?? 0} />
                </strong>
              </div>
            ))}
          </div>
        </div>
      </StaggerItem>

      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter system logs"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-4)" }}>
          <div className="ds-field">
            <label htmlFor="logs-time-mobile" className="ds-field-label">
              Time window
            </label>
            <select
              id="logs-time-mobile"
              className="ds-select"
              value={timeFilter}
              onChange={handleTimeFilter}
            >
              {TIME_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ds-field">
            <label htmlFor="logs-severity-mobile" className="ds-field-label">
              Severity
            </label>
            <select
              id="logs-severity-mobile"
              className="ds-select"
              value={severityFilter}
              onChange={handleSeverityFilter}
            >
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "var(--ds-space-3)" }}>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setTimeFilter("24");
                setSeverityFilter("All severities");
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setFiltersOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </BottomSheet>

      <StaggerItem>
        <div className="ds-table-card ds-table-card--responsive">
          <div className="ds-table-scroll">
            <table className="ds-table">
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Event</th>
                  <th scope="col" className="ds-col-hide-md">
                    Source
                  </th>
                  <th scope="col">Details</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="ds-table-empty-row">
                      <div
                        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}
                        role="status"
                        aria-label="Loading system logs"
                      >
                        <Skeleton height="2.75rem" />
                        <Skeleton height="2.75rem" />
                        <Skeleton height="2.75rem" />
                      </div>
                    </td>
                  </tr>
                ) : visibleLogs.length > 0 ? (
                  visibleLogs.map((log) => {
                    const isSelected = selectedLog?.id === log.id;
                    return (
                      <tr
                        key={log.id}
                        className={isSelected ? "is-selected" : undefined}
                        onClick={() => setSelectedLog(log)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedLog(log);
                          }
                        }}
                        tabIndex={0}
                        aria-selected={isSelected}
                        style={{ cursor: "pointer" }}
                      >
                        <td data-label="Timestamp" className="ds-tabular">
                          {formatTimestamp(log.timestamp)}
                        </td>

                        <td data-label="Severity">
                          <StatusBadge status={log.severity} />
                        </td>

                        <td className="ds-td-primary" data-label="Event">
                          <strong>{log.event}</strong>
                        </td>

                        <td data-label="Source" className="ds-col-hide-md">
                          {log.source}
                        </td>

                        <td data-label="Details" className="ds-mono">
                          Request ID: {log.requestId || "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="ds-table-empty-row">
                      <EmptyState
                        icon={ScrollText}
                        title={
                          error
                            ? "System logs could not be retrieved."
                            : "No logs found for the selected filters."
                        }
                        description={
                          error
                            ? "Check your backend connection and refresh."
                            : "Try broadening the time window or severity filter."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ds-table-footer">
            <span className="ds-tabular">
              Showing{" "}
              {filteredLogs.length === 0
                ? 0
                : (currentPage - 1) * entriesPerPage + 1}
              –{Math.min(currentPage * entriesPerPage, filteredLogs.length)} of{" "}
              {filteredLogs.length} logs
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading || Boolean(error)}
            />
          </div>
        </div>
      </StaggerItem>

      <AnimatePresence initial={false}>
        {selectedLog && !error && (
          <motion.section
            key={`log-detail-${selectedLog.id}`}
            className="ds-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: ISHARA_EASE }}
            style={{
              padding: "var(--ds-space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--ds-space-3)",
              border: "1.5px solid rgba(11, 132, 180, 0.42)",
              boxShadow: "var(--ds-surface-highlight), var(--ds-shadow-card-hover)",
            }}
            aria-label="Selected log details"
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--ds-space-3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
                <h2 className="ds-h4">Log details</h2>
                <StatusBadge status={selectedLog.severity} />
              </div>

              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>

            <p className="ds-body" style={{ color: "var(--ds-text-primary)" }}>
              {selectedLog.details}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--ds-space-4)",
                fontSize: "0.875rem",
                color: "var(--ds-text-muted)",
              }}
            >
              <span className="ds-mono">
                Request ID: {selectedLog.requestId || "N/A"}
              </span>
              <span>Source: {selectedLog.source}</span>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <StaggerItem>
        <p
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--ds-space-2)",
            fontSize: "0.875rem",
            color: "var(--ds-text-muted)",
          }}
        >
          {error ? (
            <AlertCircle
              size={15}
              strokeWidth={2}
              style={{ color: "var(--ds-status-error)", flexShrink: 0 }}
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              size={15}
              strokeWidth={2}
              style={{ color: "var(--ds-status-success)", flexShrink: 0 }}
              aria-hidden="true"
            />
          )}
          <span>
            {loading
              ? "Retrieving system activity..."
              : error
                ? "System activity could not be retrieved."
                : IS_DEMO_MODE
                  ? `Showing ${logs.length} sample demo log entries (Demo Data).`
                  : `Showing ${logs.length} real database log entries.`}
          </span>
        </p>
      </StaggerItem>
    </StaggerContainer>
  );
}

export default SystemLogs;
