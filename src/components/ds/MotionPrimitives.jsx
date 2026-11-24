import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export const ISHARA_EASE = [0.22, 1, 0.36, 1];

export const ISHARA_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.9,
};

export function usePrefersReducedMotion() {
  const systemReduced = useReducedMotion();
  const [adminReduced, setAdminReduced] = useState(() =>
    typeof document !== "undefined"
      ? document.body.classList.contains("ds-pref-reduce-motion")
      : false
  );

  useEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
      return undefined;
    }

    const sync = () => {
      setAdminReduced(document.body.classList.contains("ds-pref-reduce-motion"));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return Boolean(systemReduced || adminReduced);
}

export function PageTransition({ children, className = "", ...props }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.32, ease: ISHARA_EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.055,
  delay = 0.04,
  viewportOnce = false,
  ...props
}) {
  const reduced = usePrefersReducedMotion();

  const variants = {
    hidden: { opacity: reduced ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: reduced
        ? { duration: 0.01 }
        : {
            staggerChildren: stagger,
            delayChildren: delay,
          },
    },
  };

  if (viewportOnce) {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial={reduced ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-48px" }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "", y = 14, ...props }) {
  const reduced = usePrefersReducedMotion();

  const variants = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.01 : 0.34, ease: ISHARA_EASE },
    },
  };

  return (
    <motion.div className={className} variants={variants} {...props}>
      {children}
    </motion.div>
  );
}

export function SurfaceCard({
  children,
  className = "",
  interactive = false,
  as = "div",
  ...props
}) {
  const reduced = usePrefersReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      whileHover={
        interactive && !reduced
          ? {
              y: -3,
              transition: { duration: 0.18, ease: ISHARA_EASE },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Component>
  );
}

export function AnimatedCounter({ value, duration = 0.65, className = "" }) {
  const reduced = usePrefersReducedMotion();
  const numericTarget = typeof value === "number" ? value : Number(value);
  const isValidNumber = Number.isFinite(numericTarget);
  const [displayValue, setDisplayValue] = useState(
    isValidNumber ? (reduced ? numericTarget : 0) : value
  );

  useEffect(() => {
    if (!isValidNumber) {
      setDisplayValue(value);
      return undefined;
    }

    if (reduced) {
      setDisplayValue(numericTarget);
      return undefined;
    }

    let frameId = null;
    const startTime = performance.now();
    const totalMs = Math.max(duration * 1000, 120);
    const startVal = 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startVal + (numericTarget - startVal) * eased);
      setDisplayValue(next);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [numericTarget, isValidNumber, duration, reduced, value]);

  return (
    <span className={className}>
      {isValidNumber ? displayValue.toLocaleString() : value}
    </span>
  );
}

export function ExpandableSection({ isOpen, children, className = "" }) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          className={className}
          initial={reduced ? { opacity: 1 } : { opacity: 0, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.24, ease: ISHARA_EASE }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function NavActiveIndicator({
  layoutId,
  className = "",
  style = undefined,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.span
      layoutId={layoutId}
      className={className}
      style={style}
      aria-hidden="true"
      transition={reduced ? { duration: 0.01 } : ISHARA_SPRING}
    />
  );
}
