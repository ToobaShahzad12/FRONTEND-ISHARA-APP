import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FilePenLine, Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AdminActivityChart from "../components/admin/AdminActivityChart";
import AdminDemoNotice from "../components/admin/AdminDemoNotice";
import AuthFeedback from "../components/AuthFeedback";
import Button from "../components/ds/Button";
import EmptyState from "../components/ds/EmptyState";
import {
  AnimatedCounter,
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
  SurfaceCard,
} from "../components/ds/MotionPrimitives";
import PageHeader from "../components/ds/PageHeader";
import Skeleton from "../components/ds/Skeleton";
import StatusBadge from "../components/ds/StatusBadge";
import {
  getAllKnowledgeArticles,
  getAllPSLSigns,
  getAllProcessingActivities,
  getDashboardSummary,
  getSystemLogs,
} from "../api/admin";
import { IS_DEMO_MODE, getDemoAdminAnalyticsSeries } from "../api/demoStore";

function formatLogTime(timestamp) {
  if (!timestamp) return "Time unavailable";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Time unavailable";
  }

  return date.toLocaleString();
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [contentCounts, setContentCounts] = useState({
    signs: 0,
    reviewedSigns: 0,
    articles: 0,
    publishedArticles: 0,
    jobs: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");

  const analyticsSeries = IS_DEMO_MODE ? getDemoAdminAnalyticsSeries() : [];

  useEffect(() => {
    document.title = "System overview — ISHARA AI Admin";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [summaryData, signsData, articlesData, processingData] = await Promise.all([
          getDashboardSummary(),
          getAllPSLSigns().catch(() => []),
          getAllKnowledgeArticles().catch(() => []),
          getAllProcessingActivities().catch(() => []),
        ]);

        if (isMounted) {
          setSummary(summaryData);
          const signsList = Array.isArray(signsData) ? signsData : [];
          const articlesList = Array.isArray(articlesData) ? articlesData : [];
          const processingList = Array.isArray(processingData) ? processingData : [];
          setContentCounts({
            signs: signsList.length,
            reviewedSigns: signsList.filter((s) => s.status === "reviewed").length,
            articles: articlesList.length,
            publishedArticles: articlesList.filter((a) => a.status === "published").length,
            jobs: processingList.length,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load dashboard statistics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    async function fetchRecentActivity() {
      try {
        setActivityLoading(true);
        setActivityError("");

        const data = await getSystemLogs();

        if (isMounted) {
          const logs = Array.isArray(data) ? data : (data?.logs ?? []);
          setActivities(logs.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) {
          setActivityError(err.message || "Unable to load recent activity.");
        }
      } finally {
        if (isMounted) {
          setActivityLoading(false);
        }
      }
    }

    fetchDashboardData();
    fetchRecentActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  const subStats = [
    {
      label: "Active users",
      value: summary?.active_users ?? "—",
      note: "Currently active accounts",
    },
    {
      label: "Pending users",
      value: summary?.pending_users ?? "—",
      note: "Awaiting account activation",
    },
    {
      label: "Admin users",
      value: summary?.admin_users ?? "—",
      note: "Administrator accounts",
    },
  ];

  const dataAvailability = IS_DEMO_MODE
    ? [
        { name: "Translation statistics", status: "Demo Data" },
        { name: "PSL dictionary entries", status: "Demo Data" },
        { name: "Knowledge base articles", status: "Demo Data" },
        { name: "Processing & logs", status: "Demo Data" },
      ]
    : [
        { name: "Translation statistics", status: "Not connected" },
        { name: "Active today tracking", status: "Not available" },
        { name: "Recent activity logs", status: "Connected" },
        { name: "Service monitoring", status: "Not connected" },
      ];

  return (
    <StaggerContainer
      stagger={0.055}
      style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}
    >
      <StaggerItem>
        <AdminDemoNotice>
          {IS_DEMO_MODE
            ? "Frontend Demo Mode is active (temporary demo session, not real authentication). User statistics, chart series, content counts, and activity logs shown here are sample Demo Data stored for this browser session."
            : "User statistics and recent system activity are connected to PostgreSQL. Other monitoring features will be integrated later."}
        </AdminDemoNotice>
      </StaggerItem>

      <PageHeader
        eyebrow="Administration"
        title="System overview"
        description="Monitor platform activity, content and translation operations."
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="admin-dash-error"
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
        <section className="ds-glance-panel" aria-labelledby="ds-glance-heading">
          <div className="ds-glance-hero">
            <span id="ds-glance-heading" className="ds-eyebrow" style={{ color: "var(--ds-text-accent)" }}>
              At a glance · Total users{IS_DEMO_MODE ? " (Demo Data)" : ""}
            </span>
            {loading ? (
              <Skeleton width="6rem" height="4.25rem" />
            ) : (
              <strong className="ds-glance-hero-value">
                {typeof summary?.total_users === "number" ? (
                  <AnimatedCounter value={summary.total_users} />
                ) : (
                  summary?.total_users ?? "—"
                )}
              </strong>
            )}
            <span className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
              Registered platform users · {contentCounts.signs} PSL signs · {contentCounts.articles} guides · {contentCounts.jobs} video jobs
            </span>
          </div>

          <div className="ds-glance-subgrid">
            {subStats.map((stat) => (
              <div className="ds-glance-substat" key={stat.label}>
                <span className="ds-body-sm" style={{ fontWeight: 600, color: "var(--ds-text-secondary)" }}>
                  {stat.label}
                </span>
                {loading ? (
                  <Skeleton width="3.5rem" height="2rem" />
                ) : (
                  <strong className="ds-glance-subvalue">
                    {typeof stat.value === "number" ? (
                      <AnimatedCounter value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </strong>
                )}
                <span style={{ fontSize: "0.8125rem", color: "var(--ds-text-muted)" }}>
                  {stat.note}
                </span>
              </div>
            ))}
          </div>
        </section>
      </StaggerItem>

      {IS_DEMO_MODE && analyticsSeries.length > 0 && (
        <StaggerItem>
          <AdminActivityChart data={analyticsSeries} />
        </StaggerItem>
      )}

      <StaggerItem>
        <section className="ds-overview-grid" aria-label="Activity and availability">
          <SurfaceCard as="article" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
            <div className="ds-dash-section-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", flexWrap: "wrap" }}>
                  <h2 className="ds-h3">Recent activity</h2>
                  {IS_DEMO_MODE && <StatusBadge status="Demo Data" />}
                </div>
                <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Latest platform updates
                </p>
              </div>

              <Button variant="tertiary" size="sm" to="/admin/system-logs">
                View all
              </Button>
            </div>

            {activityLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-3)" }} role="status" aria-label="Loading recent activity">
                <Skeleton height="2.75rem" />
                <Skeleton height="2.75rem" />
                <Skeleton height="2.75rem" />
              </div>
            ) : activityError ? (
              <AuthFeedback variant="error">
                <p>{activityError}</p>
              </AuthFeedback>
            ) : activities.length === 0 ? (
              <EmptyState
                title="No recent activity"
                description="No system activity has been recorded yet."
              />
            ) : (
              <div className="ds-ruled-list">
                {activities.map((activity) => (
                  <div className="ds-ruled-item" key={activity.id}>
                    <div style={{ minInlineSize: 0, flex: "1 1 auto" }}>
                      <strong style={{ display: "block", fontSize: "0.9375rem" }}>
                        {activity.event}
                      </strong>
                      <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                        {activity.source} · {formatLogTime(activity.timestamp)}
                      </span>
                    </div>

                    <StatusBadge status={activity.severity || "INFO"} />
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-6)" }}>
            <SurfaceCard as="article" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
              <div className="ds-dash-section-head">
                <div>
                  <h2 className="ds-h4">Content summary</h2>
                  <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                    Vocabulary, articles, and queued jobs
                  </p>
                </div>
              </div>

              <div className="ds-ruled-list">
                <div className="ds-ruled-item">
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                    PSL dictionary signs ({contentCounts.reviewedSigns} reviewed)
                  </span>
                  <strong className="ds-tabular">{contentCounts.signs}</strong>
                </div>
                <div className="ds-ruled-item">
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                    Knowledge base articles ({contentCounts.publishedArticles} published)
                  </span>
                  <strong className="ds-tabular">{contentCounts.articles}</strong>
                </div>
                <div className="ds-ruled-item">
                  <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                    Recorded processing jobs
                  </span>
                  <strong className="ds-tabular">{contentCounts.jobs}</strong>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard as="article" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
              <div className="ds-dash-section-head">
                <div>
                  <h2 className="ds-h4">Data availability</h2>
                  <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                    Backend integration status
                  </p>
                </div>
              </div>

              <div className="ds-ruled-list">
                {dataAvailability.map((item) => (
                  <div className="ds-ruled-item" key={item.name}>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                      {item.name}
                    </span>
                    <StatusBadge
                      status={item.status}
                      tone={item.status === "Connected" ? "success" : "neutral"}
                    />
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard as="section" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
              <div className="ds-dash-section-head">
                <div>
                  <h2 className="ds-h4">Admin quick actions</h2>
                  <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                    Frequently used administrative tasks
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--ds-space-2)" }}>
                <Link to="/admin/users" className="ds-link-row">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <Users size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>Manage users</span>
                  </span>
                  <ArrowRight size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
                </Link>

                <Link to="/admin/psl-dictionary" className="ds-link-row">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>Add a PSL sign</span>
                  </span>
                  <ArrowRight size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
                </Link>

                <Link to="/admin/knowledge-base" className="ds-link-row">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
                    <FilePenLine size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>Edit knowledge articles</span>
                  </span>
                  <ArrowRight size={16} strokeWidth={2} className="ds-rtl-flip" aria-hidden="true" />
                </Link>
              </div>
            </SurfaceCard>
          </div>
        </section>
      </StaggerItem>
    </StaggerContainer>
  );
}
