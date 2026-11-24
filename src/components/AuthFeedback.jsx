import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion } from "motion/react";
import Spinner from "./ds/Spinner";
import { ISHARA_EASE, usePrefersReducedMotion } from "./ds/MotionPrimitives";

const VARIANT_ROLES = {
  error: "alert",
  warning: "alert",
  success: "status",
  info: "status",
  loading: "status",
};

const VARIANT_ICONS = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export default function AuthFeedback({
  variant = "info",
  title,
  children,
  className = "",
}) {
  const role = VARIANT_ROLES[variant] || "status";
  const Icon = VARIANT_ICONS[variant];
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={`ds-alert ds-alert--${variant} ${className}`.trim()}
      role={role}
      aria-live={variant === "error" || variant === "warning" ? "assertive" : "polite"}
      style={{ animation: "none" }}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.22, ease: ISHARA_EASE }}
    >
      <span className="ds-alert-icon" aria-hidden="true">
        {variant === "loading" ? (
          <Spinner size="sm" />
        ) : Icon ? (
          <Icon size={20} strokeWidth={1.75} focusable="false" />
        ) : null}
      </span>

      <div className="ds-alert-body">
        {title && <strong className="ds-alert-title">{title}</strong>}
        <div className="ds-alert-content">{children}</div>
      </div>
    </motion.div>
  );
}
