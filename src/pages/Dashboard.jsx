import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Clock,
  GraduationCap,
  Upload,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import {
  IS_DEMO_MODE,
  getDemoTranslationHistory,
  getDemoUserDashboardInsights,
  toggleDemoSavedSign,
} from "../api/demoStore";
import AdminDemoNotice from "../components/admin/AdminDemoNotice";
import Button from "../components/ds/Button";
import EmptyState from "../components/ds/EmptyState";
import StatusBadge from "../components/ds/StatusBadge";
import UserShell from "../components/ds/UserShell";
import {
  AnimatedCounter,
  ISHARA_EASE,
  StaggerContainer,
  StaggerItem,
  SurfaceCard,
  usePrefersReducedMotion,
} from "../components/ds/MotionPrimitives";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const name = user?.full_name?.trim() || "there";

  const [insightsVersion, setInsightsVersion] = useState(0);
  const [signsView, setSignsView] = useState("saved");

  const recentDemoRecords = IS_DEMO_MODE
    ? getDemoTranslationHistory().slice(0, 3)
    : [];

  const demoInsights = useMemo(() => {
    if (!IS_DEMO_MODE) return null;
    return getDemoUserDashboardInsights();
  }, [insightsVersion]);

  const visibleSigns = useMemo(() => {
    if (!demoInsights) return [];
    const list =
      signsView === "saved"
        ? demoInsights.signs.filter((s) => s.saved)
        : demoInsights.signs;
    return list.slice(0, 4);
  }, [demoInsights, signsView]);

  function handleToggleBookmark(signId) {
    toggleDemoSavedSign(signId);
    setInsightsVersion((v) => v + 1);
  }

  return (
    <UserShell user={user} pageTitle="Dashboard">
      <StaggerContainer stagger={0.06} delay={0.02}>
        {IS_DEMO_MODE && (
          <StaggerItem y={6}>
            <div style={{ marginBlockEnd: "var(--ds-space-4)" }}>
              <AdminDemoNotice>
                Frontend Demo Mode is active (temporary demo session, not real authentication). Summary statistics, learning progress, saved PSL signs, and recent activity below use sample Demo Data.
              </AdminDemoNotice>
            </div>
          </StaggerItem>
        )}

        <StaggerItem y={10}>
          <section className="ds-dash-welcome" aria-labelledby="ds-user-welcome-title">
            <span className="ds-eyebrow" style={{ color: "var(--ds-text-accent)" }}>
              Your workspace{IS_DEMO_MODE ? " · Demo Mode" : ""}
            </span>
            <h1 id="ds-user-welcome-title" className="ds-h1">
              Hello, {name}
            </h1>
            <p className="ds-body-lg" style={{ color: "var(--ds-text-secondary)", maxWidth: "52ch" }}>
              Welcome back to Ishara AI. Ready to communicate?
            </p>
          </section>
        </StaggerItem>

        <section className="ds-dash-start-grid" aria-label="Translation options">
          <StaggerItem y={14} style={{ width: "100%", height: "100%" }}>
            <SurfaceCard as="article" interactive className="ds-dash-hero-panel ds-on-dark">
              <div className="ds-dash-panel-body">
                <div className="ds-dash-panel-top">
                  <span className="ds-dash-panel-icon" aria-hidden="true">
                    <Video size={24} strokeWidth={1.75} />
                  </span>
                  <StatusBadge status="Live" tone="brand" />
                </div>
                <h2 className="ds-h2">Use Live Camera</h2>
                <p className="ds-body">Record your PSL signing using your camera with live framing guides.</p>
              </div>

              <div className="ds-dash-panel-actions">
                <Button
                  variant="yellow"
                  size="lg"
                  onClick={() => navigate("/dashboard/live-camera")}
                >
                  <span>Open Camera</span>
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    className="ds-rtl-flip"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </SurfaceCard>
          </StaggerItem>

          <StaggerItem y={14} style={{ width: "100%", height: "100%" }}>
            <SurfaceCard as="article" interactive className="ds-dash-secondary-panel">
              <div className="ds-dash-panel-body">
                <div className="ds-dash-panel-top">
                  <span className="ds-dash-panel-icon" aria-hidden="true">
                    <Upload size={24} strokeWidth={1.75} />
                  </span>
                  <StatusBadge status="Recorded" tone="neutral" />
                </div>
                <h2 className="ds-h2">Upload a Video</h2>
                <p className="ds-body">Choose a previously recorded MP4, WebM, or AVI PSL video.</p>
              </div>

              <div className="ds-dash-panel-actions">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/dashboard/upload-video")}
                >
                  <span>Choose Video</span>
                  <ArrowRight
                    size={18}
                    strokeWidth={2}
                    className="ds-rtl-flip"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </SurfaceCard>
          </StaggerItem>
        </section>

        {IS_DEMO_MODE && demoInsights && (
          <>
            <StaggerItem y={12}>
              <section
                className="ds-user-stats-grid"
                aria-label="Workspace statistics (Demo Data)"
              >
                <article className="ds-metric-tile">
                  <span className="ds-metric-tile-label">Recent clips</span>
                  <strong className="ds-metric-tile-value">
                    <AnimatedCounter value={demoInsights.stats.totalTranslations} />
                  </strong>
                  <span className="ds-metric-tile-note">Demo Data · Sample history</span>
                </article>

                <article className="ds-metric-tile">
                  <span className="ds-metric-tile-label">Completed</span>
                  <strong className="ds-metric-tile-value">
                    <AnimatedCounter value={demoInsights.stats.completedTranslations} />
                  </strong>
                  <span className="ds-metric-tile-note">Demo Data · Sample output</span>
                </article>

                <article className="ds-metric-tile">
                  <span className="ds-metric-tile-label">Saved PSL signs</span>
                  <strong className="ds-metric-tile-value">
                    <AnimatedCounter value={demoInsights.stats.savedSignsCount} />
                  </strong>
                  <span className="ds-metric-tile-note">Bookmarked for practice</span>
                </article>

                <article className="ds-metric-tile">
                  <span className="ds-metric-tile-label">Reviewed entries</span>
                  <strong className="ds-metric-tile-value">
                    <AnimatedCounter value={demoInsights.stats.reviewedSignsAvailable} />
                  </strong>
                  <span className="ds-metric-tile-note">Community PSL vocabulary</span>
                </article>
              </section>
            </StaggerItem>

            <StaggerItem y={14}>
              <section className="ds-user-insights-grid" aria-label="Learning progress and saved PSL signs">
                <SurfaceCard as="article" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
                  <div className="ds-dash-section-head">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", flexWrap: "wrap" }}>
                        <GraduationCap size={19} strokeWidth={1.85} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                        <h2 className="ds-h3">Learning progress</h2>
                        <StatusBadge status="Demo Data" />
                      </div>
                      <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                        Sample PSL practice modules
                      </p>
                    </div>
                  </div>

                  <div className="ds-progress-list">
                    {demoInsights.learningProgress.map((module) => (
                      <div className="ds-progress-row" key={module.id}>
                        <div className="ds-progress-meta">
                          <strong style={{ color: "var(--ds-text-primary)" }}>{module.label}</strong>
                          <span className="ds-tabular" style={{ color: "var(--ds-text-muted)", fontWeight: 600 }}>
                            {module.completed}/{module.total} ({module.percent}%)
                          </span>
                        </div>
                        <div
                          className="ds-progress-track"
                          role="progressbar"
                          aria-valuenow={module.percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${module.label} progress`}
                        >
                          <motion.div
                            className="ds-progress-fill"
                            initial={reduced ? false : { scaleX: 0 }}
                            animate={{ scaleX: module.percent / 100 }}
                            transition={{ duration: reduced ? 0.01 : 0.45, ease: ISHARA_EASE }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>

                <SurfaceCard as="article" className="ds-card" style={{ padding: "var(--ds-space-6)" }}>
                  <div className="ds-dash-section-head">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", flexWrap: "wrap" }}>
                        <BookOpen size={19} strokeWidth={1.85} style={{ color: "var(--ds-text-link)" }} aria-hidden="true" />
                        <h2 className="ds-h3">PSL quick reference</h2>
                        <StatusBadge status="Demo Data" />
                      </div>
                      <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                        Bookmark everyday signs for quick review
                      </p>
                    </div>

                    <div style={{ display: "inline-flex", gap: "0.25rem", padding: "0.2rem", borderRadius: "var(--ds-radius-sm)", backgroundColor: "var(--ds-bg-sunken)", border: "1px solid var(--ds-border-subtle)" }}>
                      <button
                        type="button"
                        onClick={() => setSignsView("saved")}
                        className={`ds-btn ds-btn--sm ${signsView === "saved" ? "ds-btn--primary" : "ds-btn--tertiary"}`.trim()}
                        style={{ minBlockSize: "2rem", paddingInline: "0.625rem" }}
                      >
                        Saved ({demoInsights.stats.savedSignsCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignsView("all")}
                        className={`ds-btn ds-btn--sm ${signsView === "all" ? "ds-btn--primary" : "ds-btn--tertiary"}`.trim()}
                        style={{ minBlockSize: "2rem", paddingInline: "0.625rem" }}
                      >
                        All ({demoInsights.signs.length})
                      </button>
                    </div>
                  </div>

                  {visibleSigns.length > 0 ? (
                    <div className="ds-saved-signs-grid">
                      {visibleSigns.map((sign) => (
                        <article className="ds-sign-card" key={sign.id}>
                          <div className="ds-sign-card-head">
                            <div style={{ minInlineSize: 0 }}>
                              <strong style={{ display: "block", fontSize: "0.9375rem", color: "var(--ds-text-primary)" }}>
                                {sign.word}
                              </strong>
                              <span style={{ fontSize: "0.8125rem", color: "var(--ds-text-muted)" }}>
                                {sign.category} · {sign.status === "reviewed" ? "Reviewed" : "Draft"}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`ds-bookmark-btn ${sign.saved ? "is-saved" : ""}`.trim()}
                              onClick={() => handleToggleBookmark(sign.id)}
                              aria-pressed={sign.saved}
                              aria-label={sign.saved ? `Remove ${sign.word} from saved signs` : `Save ${sign.word}`}
                            >
                              <Bookmark
                                size={16}
                                strokeWidth={2}
                                fill={sign.saved ? "currentColor" : "none"}
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                            {sign.description}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Bookmark}
                      title="No saved signs"
                      description="Switch to All signs to bookmark PSL entries for quick reference."
                      actions={
                        <Button variant="secondary" size="sm" onClick={() => setSignsView("all")}>
                          Browse sample signs
                        </Button>
                      }
                    />
                  )}
                </SurfaceCard>
              </section>
            </StaggerItem>
          </>
        )}

        <StaggerItem y={14}>
          <section
            className="ds-dash-recent-section"
            aria-labelledby="ds-user-history-title"
          >
            <div className="ds-dash-section-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", flexWrap: "wrap" }}>
                  <h2 id="ds-user-history-title" className="ds-h3">
                    Recent Translations
                  </h2>
                  {IS_DEMO_MODE && <StatusBadge status="Demo Data" />}
                </div>
                <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
                  Your completed and in-progress translations will appear here.
                </p>
              </div>

              <Button
                variant="tertiary"
                size="sm"
                to="/dashboard/translation-history"
              >
                View All
              </Button>
            </div>

            {recentDemoRecords.length > 0 ? (
              <div className="ds-ruled-list">
                {recentDemoRecords.map((item) => {
                  const durationSec = Math.max(0, Math.floor(item.duration_seconds || 0));
                  const formattedDuration = `${String(Math.floor(durationSec / 60)).padStart(2, "0")}:${String(durationSec % 60).padStart(2, "0")}`;
                  const statusLabel =
                    item.status === "completed"
                      ? "Completed"
                      : item.status === "processing"
                        ? "Processing"
                        : "Failed";
                  return (
                    <div className="ds-ruled-item" key={item.id} style={{ flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)", minInlineSize: 0, flex: "1 1 16rem" }}>
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
                        <div style={{ minInlineSize: 0 }}>
                          <strong style={{ display: "block", fontSize: "0.9375rem" }}>
                            {item.source}
                          </strong>
                          <span className="ds-body-sm" style={{ color: "var(--ds-text-muted)" }}>
                            {item.gloss_preview || item.source_language}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
                        <span className="ds-tabular ds-body-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--ds-text-muted)" }}>
                          <Clock size={14} strokeWidth={1.75} aria-hidden="true" />
                          {formattedDuration}
                        </span>
                        <StatusBadge status={statusLabel} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                useHandTrace
                title="No translations yet"
                description="Your recent translations will show up here once you get started."
              />
            )}
          </section>
        </StaggerItem>

        <StaggerItem y={8}>
          <footer className="ds-dash-footer">
            <p className="ds-serif-accent ds-body-lg">
              Communication without barriers.
            </p>
          </footer>
        </StaggerItem>
      </StaggerContainer>
    </UserShell>
  );
}
