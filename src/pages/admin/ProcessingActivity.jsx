import { useEffect, useMemo, useState } from "react";
import { Activity, Download, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getAllProcessingActivities } from "../../api/admin";
import { IS_DEMO_MODE } from "../../api/demoStore";
import AuthFeedback from "../../components/AuthFeedback";
import AdminDemoNotice from "../../components/admin/AdminDemoNotice";
import Button from "../../components/ds/Button";
import EmptyState from "../../components/ds/EmptyState";
import {
  AnimatedCounter,
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
} from "../../components/ds/MotionPrimitives";
import PageHeader from "../../components/ds/PageHeader";
import Skeleton from "../../components/ds/Skeleton";
import StatusBadge from "../../components/ds/StatusBadge";

const STATUS_OPTIONS = [
  "All statuses",
  "Pending",
  "Processing",
  "Completed",
  "Failed",
];

function getStatusLabel(status) {
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "Unknown";
}

function getPKTParts(dateValue) {
  if (!dateValue) return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function formatPKTDate(dateValue) {
  const parts = getPKTParts(dateValue);
  if (!parts) return "—";

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatPKTTime(dateValue) {
  const parts = getPKTParts(dateValue);
  if (!parts) return "—";

  return `${parts.hour}:${parts.minute}:${parts.second}`;
}

function formatDisplayDate(date) {
  if (!date) return "All dates";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return "—";

  const totalSeconds = Math.max(0, Math.floor(Number(seconds)));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function formatProcessingTime(seconds, status) {
  if (seconds !== null && seconds !== undefined) {
    return formatDuration(seconds);
  }

  if (status === "pending") return "Waiting";
  if (status === "processing") return "In progress";

  return "—";
}

function mapActivity(activity) {
  const status = getStatusLabel(activity.status);

  return {
    id: activity.request_id,
    activityId: activity.id,
    source:
      activity.input_source === "camera"
        ? "Camera"
        : activity.input_source === "upload"
          ? "Upload"
          : activity.input_source || "—",
    submitted: formatPKTTime(activity.created_at),
    duration: formatDuration(activity.clip_duration_seconds),
    processingTime: formatProcessingTime(
      activity.processing_time_seconds,
      activity.status
    ),
    status,
    date: formatPKTDate(activity.created_at),
    errorMessage: activity.error_message,
    createdAt: activity.created_at,
  };
}

function ProcessingActivity() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "All statuses",
    date: "",
  });

  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    document.title = "Translation & processing activity — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllProcessingActivities();

        if (!isMounted) return;

        const records = Array.isArray(data) ? data : [];
        const mappedJobs = records.map(mapActivity);

        setJobs(mappedJobs);

        setSelectedJob((currentSelected) => {
          if (!currentSelected) {
            return (
              mappedJobs.find((job) => job.status === "Failed") ||
              mappedJobs[0] ||
              null
            );
          }

          return (
            mappedJobs.find(
              (job) => job.activityId === currentSelected.activityId
            ) || null
          );
        });
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to load processing activity records."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      Pending: jobs.filter((job) => job.status === "Pending").length,
      Processing: jobs.filter((job) => job.status === "Processing").length,
      Completed: jobs.filter((job) => job.status === "Completed").length,
      Failed: jobs.filter((job) => job.status === "Failed").length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.id
        .toLowerCase()
        .includes(appliedFilters.search.toLowerCase());

      const matchesStatus =
        appliedFilters.status === "All statuses" ||
        job.status === appliedFilters.status;

      const matchesDate =
        !appliedFilters.date || job.date === appliedFilters.date;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [jobs, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: search.trim(),
      status: statusFilter,
      date: dateFilter,
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All statuses");
    setDateFilter("");

    setAppliedFilters({
      search: "",
      status: "All statuses",
      date: "",
    });
  };

  const handleExportCSV = () => {
    const headers = [
      "Request ID",
      "Source",
      "Submitted (PKT)",
      "Clip duration",
      "Processing time",
      "Status",
      "Date",
    ];

    const rows = filteredJobs.map((job) => [
      job.id,
      job.source,
      job.submitted,
      job.duration,
      job.processingTime,
      job.status,
      job.date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ishara-processing-activity.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <StaggerContainer
      stagger={0.05}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-5)" }}
    >
      <StaggerItem>
        <AdminDemoNotice>
          {IS_DEMO_MODE
            ? "Showing sample processing activity metadata (Demo Data). A completed status does not mean an AI/PSL translation service is running."
            : "These records describe processing activity metadata only. A completed status does not mean that an AI/PSL translation result was produced."}
        </AdminDemoNotice>
      </StaggerItem>

      <PageHeader
        eyebrow="Monitoring"
        title="Translation & processing activity"
        description={`Live processing records · ${formatDisplayDate(appliedFilters.date)} · Times shown in Pakistan Standard Time (PKT).`}
        actions={
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={loading || filteredJobs.length === 0}
          >
            <Download size={18} strokeWidth={2} aria-hidden="true" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Compact single-row summary strip */}
      <StaggerItem>
        <div className="ds-summary-strip" aria-label="Processing status summary">
          <div className="ds-summary-strip-item">
            <StatusBadge status="Pending" />
            <strong className="ds-tabular">
              <AnimatedCounter value={summary.Pending} />
            </strong>
            <span className="ds-body-s" style={{ color: "var(--ds-text-muted)" }}>
              waiting in queue
            </span>
          </div>

          <div className="ds-summary-strip-item">
            <StatusBadge status="Processing" />
            <strong className="ds-tabular">
              <AnimatedCounter value={summary.Processing} />
            </strong>
            <span className="ds-body-s" style={{ color: "var(--ds-text-muted)" }}>
              in progress
            </span>
          </div>

          <div className="ds-summary-strip-item">
            <StatusBadge status="Completed" />
            <strong className="ds-tabular">
              <AnimatedCounter value={summary.Completed} />
            </strong>
            <span className="ds-body-s" style={{ color: "var(--ds-text-muted)" }}>
              recorded complete
            </span>
          </div>

          <div className="ds-summary-strip-item">
            <StatusBadge status="Failed" />
            <strong className="ds-tabular">
              <AnimatedCounter value={summary.Failed} />
            </strong>
            <span className="ds-body-s" style={{ color: "var(--ds-text-muted)" }}>
              needs attention
            </span>
          </div>
        </div>
      </StaggerItem>

      {/* Filter toolbar */}
      <StaggerItem>
        <div className="ds-card" style={{ padding: "var(--ds-space-4)" }}>
          <div className="ds-toolbar" style={{ marginBlockEnd: 0 }}>
            <div className="ds-toolbar-filter-item" style={{ flex: "1 1 15rem" }}>
              <label htmlFor="processing-search">Find a request</label>
              <div className="ds-search-wrap">
                <Search
                  size={18}
                  strokeWidth={1.75}
                  className="ds-search-icon"
                  aria-hidden="true"
                />
                <input
                  id="processing-search"
                  className="ds-input"
                  type="text"
                  placeholder="Search request ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleApplyFilters();
                  }}
                />
                {search && (
                  <button
                    type="button"
                    className="ds-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="ds-toolbar-filter-item">
              <label htmlFor="processing-status">Status</label>
              <select
                id="processing-status"
                className="ds-select ds-select--toolbar"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-toolbar-filter-item">
              <label htmlFor="processing-date">Date</label>
              <input
                id="processing-date"
                className="ds-input"
                style={{ minBlockSize: "2.75rem" }}
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "var(--ds-space-2)", alignItems: "center" }}>
              <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                Apply filters
              </Button>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      </StaggerItem>

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="processing-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="error" title="Unable to load processing activity">
              <p>{error}</p>
            </AuthFeedback>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jobs table */}
      <StaggerItem>
        <section className="ds-table-card ds-table-card--responsive" aria-label="Queue and recent jobs">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--ds-space-3)",
              padding: "var(--ds-space-4)",
              borderBlockEnd: "1px solid var(--ds-border-divider)",
              backgroundColor: "var(--ds-bg-surface)",
            }}
          >
            <h2 className="ds-h4">Queue &amp; recent jobs</h2>
            <span className="ds-body-s ds-tabular" style={{ color: "var(--ds-text-muted)" }}>
              {filteredJobs.length} requests
            </span>
          </div>

          <div className="ds-table-scroll">
            <table className="ds-table">
              <thead>
                <tr>
                  <th scope="col">Request ID</th>
                  <th scope="col">Source</th>
                  <th scope="col">Submitted (PKT)</th>
                  <th scope="col" className="ds-col-hide-md">
                    Clip duration
                  </th>
                  <th scope="col" className="ds-col-hide-md">
                    Processing time
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="ds-table-empty-row">
                      <div
                        style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }}
                        role="status"
                        aria-label="Loading processing activities"
                      >
                        <Skeleton height="2.75rem" />
                        <Skeleton height="2.75rem" />
                        <Skeleton height="2.75rem" />
                      </div>
                    </td>
                  </tr>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => {
                    const isSelected = selectedJob?.activityId === job.activityId;
                    return (
                      <tr
                        key={job.activityId}
                        className={isSelected ? "is-selected" : undefined}
                        onClick={() => setSelectedJob(job)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedJob(job);
                          }
                        }}
                        tabIndex={0}
                        aria-selected={isSelected}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="ds-td-primary ds-mono" data-label="Request ID">
                          <strong>{job.id}</strong>
                        </td>
                        <td data-label="Source">{job.source}</td>
                        <td data-label="Submitted (PKT)" className="ds-tabular">
                          {job.submitted}
                        </td>
                        <td data-label="Clip duration" className="ds-col-hide-md ds-tabular">
                          {job.duration}
                        </td>
                        <td data-label="Processing time" className="ds-col-hide-md ds-tabular">
                          {job.processingTime}
                        </td>
                        <td data-label="Status">
                          <StatusBadge status={job.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="ds-table-empty-row">
                      <EmptyState
                        icon={Activity}
                        title={
                          jobs.length === 0
                            ? "No processing activity records are available yet."
                            : "No processing requests match your filters."
                        }
                        description="Try clearing filters or selecting another date."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ds-table-footer">
            <span>
              Status values are recorded activity metadata; they do not confirm that PSL translation was executed or validated.
            </span>
          </div>
        </section>
      </StaggerItem>

      <AnimatePresence mode="wait">
        {selectedJob && selectedJob.status === "Failed" && (
          <motion.div
            key={`job-failed-${selectedJob.activityId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback
              variant="error"
              title={`${selectedJob.id} · Processing failed`}
            >
              <p>
                {selectedJob.errorMessage ||
                  "No failure details were provided for this request."}
              </p>
            </AuthFeedback>
          </motion.div>
        )}

        {selectedJob && selectedJob.status !== "Failed" && (
          <motion.div
            key={`job-info-${selectedJob.activityId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: ISHARA_EASE }}
          >
            <AuthFeedback variant="info" title={selectedJob.id}>
              <p>
                Selected request status: {selectedJob.status}.{" "}
                {selectedJob.status === "Completed"
                  ? "This activity record is marked completed; it does not prove a translation result was produced."
                  : "No failure details are available."}
              </p>
            </AuthFeedback>
          </motion.div>
        )}
      </AnimatePresence>
    </StaggerContainer>
  );
}

export default ProcessingActivity;
