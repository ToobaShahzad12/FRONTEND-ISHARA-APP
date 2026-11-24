import { useMemo, useState } from "react";
import { motion } from "motion/react";
import StatusBadge from "../ds/StatusBadge";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";

const SERIES_CONFIG = [
  { key: "camera", label: "Camera captures", color: "#0b84b4" },
  { key: "upload", label: "Video uploads", color: "#2fc7a3" },
  { key: "reviewed", label: "Reviewed signs", color: "#e0ad08" },
];

export default function AdminActivityChart({ data = [] }) {
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(
    data.length > 0 ? Math.max(0, data.length - 1) : 0
  );
  const [visibleSeries, setVisibleSeries] = useState({
    camera: true,
    upload: true,
    reviewed: true,
  });

  const activeKeys = useMemo(
    () => SERIES_CONFIG.filter((s) => visibleSeries[s.key]),
    [visibleSeries]
  );

  const maxValue = useMemo(() => {
    let highest = 10;
    for (const point of data) {
      for (const s of activeKeys) {
        if (typeof point[s.key] === "number" && point[s.key] > highest) {
          highest = point[s.key];
        }
      }
    }
    return Math.ceil(highest / 5) * 5;
  }, [activeKeys, data]);

  function toggleSeries(key) {
    setVisibleSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.camera && !next.upload && !next.reviewed) {
        return prev;
      }
      return next;
    });
  }

  const selectedDay = data[activeIndex] || data[0];
  const chartWidth = 640;
  const chartHeight = 200;
  const padLeft = 34;
  const padRight = 14;
  const padTop = 14;
  const padBottom = 30;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;
  const groupWidth = data.length > 0 ? plotWidth / data.length : plotWidth;
  const ticks = [0, Math.round(maxValue / 2), maxValue];

  return (
    <section className="ds-chart-card" aria-labelledby="admin-chart-title">
      <div className="ds-dash-section-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)", flexWrap: "wrap" }}>
            <h2 id="admin-chart-title" className="ds-h3">
              Weekly translation &amp; review volume
            </h2>
            <StatusBadge status="Demo Data" />
          </div>
          <p className="ds-body-sm" style={{ color: "var(--ds-text-secondary)" }}>
            7-day sample breakdown across camera captures, uploaded clips, and PSL dictionary reviews.
          </p>
        </div>

        <div className="ds-chart-legend" role="group" aria-label="Toggle data series">
          {SERIES_CONFIG.map((series) => {
            const isActive = Boolean(visibleSeries[series.key]);
            return (
              <button
                key={series.key}
                type="button"
                className={`ds-chart-legend-btn ${isActive ? "is-active" : ""}`.trim()}
                onClick={() => toggleSeries(series.key)}
                aria-pressed={isActive}
              >
                <span
                  className="ds-chart-swatch"
                  style={{ backgroundColor: series.color }}
                  aria-hidden="true"
                />
                <span>{series.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {data.length > 0 ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Weekly translation and dictionary review volume bar chart (Demo Data)"
              style={{ width: "100%", minWidth: "28rem", height: "auto", display: "block" }}
            >
              {ticks.map((tick) => {
                const y = padTop + plotHeight - (tick / maxValue) * plotHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      x2={chartWidth - padRight}
                      y1={y}
                      y2={y}
                      stroke="#e7e3db"
                      strokeDasharray={tick === 0 ? undefined : "3 4"}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#52646e"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {data.map((point, idx) => {
                const groupX = padLeft + idx * groupWidth;
                const isSelected = idx === activeIndex;
                const barCount = Math.max(1, activeKeys.length);
                const innerGap = 4;
                const barWidth = Math.min(18, (groupWidth * 0.62 - (barCount - 1) * innerGap) / barCount);
                const totalBarsWidth = barCount * barWidth + (barCount - 1) * innerGap;
                const startX = groupX + (groupWidth - totalBarsWidth) / 2;

                return (
                  <g
                    key={point.day}
                    tabIndex={0}
                    role="button"
                    aria-label={`${point.day}: Camera ${point.camera}, Uploads ${point.upload}, Reviewed ${point.reviewed}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveIndex(idx);
                      }
                    }}
                    style={{ cursor: "pointer", outline: "none" }}
                  >
                    <rect
                      x={groupX + 4}
                      y={padTop}
                      width={Math.max(0, groupWidth - 8)}
                      height={plotHeight}
                      rx={8}
                      fill={isSelected ? "rgba(11, 132, 180, 0.06)" : "transparent"}
                    />

                    {activeKeys.map((series, sIdx) => {
                      const val = Number(point[series.key] || 0);
                      const barHeight = Math.max(2, (val / maxValue) * plotHeight);
                      const barX = startX + sIdx * (barWidth + innerGap);
                      const barY = padTop + plotHeight - barHeight;

                      return (
                        <motion.rect
                          key={series.key}
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          fill={series.color}
                          initial={reduced ? false : { scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            duration: reduced ? 0.01 : 0.38,
                            delay: reduced ? 0 : idx * 0.03,
                            ease: ISHARA_EASE,
                          }}
                          style={{ transformOrigin: `${barX + barWidth / 2}px ${padTop + plotHeight}px` }}
                        />
                      );
                    })}

                    <text
                      x={groupX + groupWidth / 2}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill={isSelected ? "#076b94" : "#52646e"}
                      fontSize="12"
                      fontWeight={isSelected ? "700" : "600"}
                    >
                      {point.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {selectedDay && (
            <div className="ds-chart-readout" aria-live="polite">
              <strong style={{ color: "var(--ds-text-primary)" }}>
                {selectedDay.day} summary (Demo Data)
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-4)" }}>
                <span className="ds-tabular" style={{ color: "var(--ds-text-secondary)" }}>
                  Camera: <strong style={{ color: "var(--ds-text-primary)" }}>{selectedDay.camera}</strong>
                </span>
                <span className="ds-tabular" style={{ color: "var(--ds-text-secondary)" }}>
                  Uploads: <strong style={{ color: "var(--ds-text-primary)" }}>{selectedDay.upload}</strong>
                </span>
                <span className="ds-tabular" style={{ color: "var(--ds-text-secondary)" }}>
                  Reviewed: <strong style={{ color: "var(--ds-text-primary)" }}>{selectedDay.reviewed}</strong>
                </span>
              </div>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
