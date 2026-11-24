import { motion } from "motion/react";
import { ISHARA_EASE, usePrefersReducedMotion } from "../ds/MotionPrimitives";

export default function PanelProgressRail({
  panels,
  activeIndex,
  isLightSurface,
  onSelect,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <nav
      className={`ds-panel-rail ${isLightSurface ? "is-on-light" : "is-on-dark"}`}
      aria-label="Section progress"
    >
      <span className="ds-panel-rail-counter" aria-live="polite">
        0{activeIndex + 1} / 0{panels.length}
      </span>

      <ul className="ds-panel-rail-list" role="list">
        {panels.map((panel, index) => {
          const active = index === activeIndex;
          return (
            <li key={panel.id}>
              <button
                type="button"
                className={`ds-panel-rail-btn ${active ? "is-active" : ""}`.trim()}
                onClick={() => onSelect(index)}
                aria-label={`Go to ${panel.label}`}
                aria-current={active ? "step" : undefined}
                title={panel.label}
              >
                <span className="ds-panel-rail-label">{panel.shortLabel}</span>
                <motion.span
                  className="ds-panel-rail-dot"
                  animate={
                    reduced
                      ? undefined
                      : {
                          scale: active ? 1.25 : 1,
                        }
                  }
                  transition={{ duration: 0.24, ease: ISHARA_EASE }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
