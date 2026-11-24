import { motion, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "../ds/MotionPrimitives";

export default function StackedPanel({
  index,
  totalPanels,
  progress,
  isActive,
  onFocusPanel,
  className = "",
  ariaLabel,
  ariaLabelledBy,
  id,
  children,
}) {
  const reduced = usePrefersReducedMotion();
  const isLast = index === totalPanels - 1;

  // Incoming panel rises from bottom (100% -> 0%), then nudges -2.5% back as the next panel covers it
  const panelY = useTransform(
    progress,
    index === 0
      ? [0, 1]
      : isLast
        ? [index - 1, index]
        : [index - 1, index, index + 1],
    index === 0
      ? ["0%", "-2.5%"]
      : isLast
        ? ["100%", "0%"]
        : ["100%", "0%", "-2.5%"]
  );

  // Outgoing panel recedes subtly behind incoming panel
  const outgoingScale = useTransform(
    progress,
    isLast ? [0, 1] : [index, index + 1],
    isLast ? [1, 1] : [1, 0.94]
  );

  const outgoingRadius = useTransform(
    progress,
    isLast ? [0, 1] : [index, index + 1],
    isLast ? [0, 0] : [0, 24]
  );

  const veilOpacity = useTransform(
    progress,
    isLast ? [0, 1] : [index, index + 1],
    isLast ? [0, 0] : [0, 0.32]
  );

  // Reduced-motion simpler cross-opacity transition without heavy transforms
  const reducedOpacity = useTransform(
    progress,
    index === 0
      ? [0, 0.6, 1]
      : isLast
        ? [index - 1, index - 0.3, index]
        : [index - 1, index - 0.3, index, index + 0.7, index + 1],
    index === 0
      ? [1, 1, 0]
      : isLast
        ? [0, 0.6, 1]
        : [0, 0.6, 1, 1, 0]
  );

  return (
    <motion.section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`ds-stacked-panel ${isActive ? "is-active" : "is-covered"} ${className}`.trim()}
      style={{
        zIndex: index + 1,
        ...(reduced
          ? { opacity: reducedOpacity }
          : {
              y: panelY,
              scale: outgoingScale,
              borderTopLeftRadius: outgoingRadius,
              borderTopRightRadius: outgoingRadius,
            }),
      }}
      onFocusCapture={() => {
        if (!isActive && onFocusPanel) {
          onFocusPanel(index);
        }
      }}
    >
      <div className="ds-stacked-panel-inner">{children}</div>

      {!reduced && !isLast && (
        <motion.div
          className="ds-stacked-panel-veil"
          aria-hidden="true"
          style={{ opacity: veilOpacity }}
        />
      )}
    </motion.section>
  );
}
