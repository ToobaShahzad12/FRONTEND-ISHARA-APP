import { motion } from "motion/react";
import HandTrace from "./HandTrace";
import { ISHARA_EASE, usePrefersReducedMotion } from "./MotionPrimitives";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  showRule = false,
  titleId,
  uppercaseTitle = false,
  className = "",
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.header
      className={`ds-page-header ${className}`.trim()}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.28, ease: ISHARA_EASE }}
    >
      <div className="ds-page-header-row">
        <div className="ds-page-header-copy">
          {eyebrow && <span className="ds-eyebrow ds-page-header-eyebrow">{eyebrow}</span>}
          <h1
            id={titleId}
            className={`ds-h1 ${uppercaseTitle ? "ds-h1--upper" : ""} ds-page-header-title`.trim()}
          >
            {title}
          </h1>
          {description && (
            <p className="ds-body ds-page-header-desc">{description}</p>
          )}
        </div>
        {actions && <div className="ds-page-header-actions">{actions}</div>}
      </div>

      {showRule && (
        <div style={{ color: "var(--ds-text-link)", opacity: 0.35, maxInlineSize: "24rem" }}>
          <HandTrace variant="arc" />
        </div>
      )}
    </motion.header>
  );
}
