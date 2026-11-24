import { motion } from "motion/react";
import HandTrace from "./HandTrace";
import { ISHARA_EASE, usePrefersReducedMotion } from "./MotionPrimitives";

export default function EmptyState({
  icon: Icon,
  useHandTrace = false,
  title,
  description,
  actions,
  footnote,
  titleId,
  className = "",
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={`ds-empty-state ${className}`.trim()}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.3, ease: ISHARA_EASE }}
    >
      {useHandTrace ? (
        <span style={{ color: "var(--ds-text-link)" }} aria-hidden="true">
          <HandTrace variant="trail" animated />
        </span>
      ) : Icon ? (
        <motion.span
          className="ds-empty-icon"
          aria-hidden="true"
          initial={reduced ? false : { scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduced ? 0.01 : 0.32, ease: ISHARA_EASE }}
        >
          <Icon size={28} strokeWidth={1.75} focusable="false" />
        </motion.span>
      ) : null}

      {title && (
        <h2 id={titleId} className="ds-h3 ds-empty-title">
          {title}
        </h2>
      )}

      {description && <p className="ds-empty-desc">{description}</p>}

      {actions && <div className="ds-empty-actions">{actions}</div>}

      {footnote && (
        <p className="ds-serif-accent ds-body">
          {footnote}
        </p>
      )}
    </motion.div>
  );
}
